import {projection, t} from "@/generated/database/generated"
import type {
  t_RepositoryScan,
  t_RepositoryScanDependency,
  t_RepositorySummary,
} from "@/generated/models"
import {type Sqlite, sql} from "@/lib/database/sqlite"
import {z} from "zod"

// TODO: stop returning API models here and move the DB -> API mapping else where
export class RepositoryRepository {
  constructor(private readonly sqlite: Sqlite) {}

  async insertRepositories(
    repositories: z.infer<typeof t.repository>[],
  ): Promise<{id: string}[]> {
    return Promise.all(repositories.map((it) => this.insertRepository(it)))
  }

  async insertRepository(
    repository: z.infer<typeof t.repository>,
  ): Promise<{id: string}> {
    return this.sqlite.one(sql(projection(t.repository, "id"))`
      INSERT INTO repository(id,
                             name,
                             url,
                             is_archived)
      VALUES (${repository.id},
              ${repository.name},
              ${repository.url},
              ${repository.is_archived})
      ON CONFLICT(name) DO UPDATE SET url         = excluded.url,
                                      is_archived = excluded.is_archived,
                                      updated_at = current_timestamp
      RETURNING (id)`)
  }

  async insertRepositoryScan(
    scan: z.infer<typeof t.repository_scan>,
  ): Promise<{id: string}> {
    return this.sqlite.one(sql(projection(t.repository_scan, "id"))`
      INSERT INTO repository_scan(id, repository_id, scanned_at)
      VALUES (${scan.id}, ${scan.repository_id}, ${scan.scanned_at})
      RETURNING (id)
    `)
  }

  async insertDependencies(
    dependencies: z.infer<typeof t.dependency>[],
  ): Promise<void> {
    await Promise.all(dependencies.map((it) => this.insertDependency(it)))
  }

  private async insertDependency(
    dependency: z.infer<typeof t.dependency>,
  ): Promise<void> {
    await this.sqlite.run(sql(z.unknown())`
      INSERT INTO dependency(id,
                             name,
                             version,
                             supplier,
                             license_declared_id,
                             license_concluded_id)
      VALUES (${dependency.id},
              ${dependency.name},
              ${dependency.version},
              ${dependency.supplier},
              ${dependency.license_declared_id},
              ${dependency.license_concluded_id})
      ON CONFLICT DO UPDATE SET supplier = excluded.supplier,
                                license_declared_id = excluded.license_declared_id,
                                license_concluded_id = excluded.license_concluded_id,
                                updated_at = current_timestamp
    `)
  }

  async associateDependencyWithRepositoryScan(
    repositoryScanId: string,
    dependencyName: string,
    dependencyVersion: string | null,
  ): Promise<void> {
    await this.sqlite.run(sql(z.unknown())`
      INSERT INTO repository_dependency(repository_scan_id, dependency_name, dependency_version)
      VALUES (${repositoryScanId}, ${dependencyName}, ${dependencyVersion})
      ON CONFLICT DO NOTHING
    `)
  }

  async getRepositoryScans(repositoryId: string): Promise<t_RepositoryScan[]> {
    const scans = await this.sqlite.any(sql(t.repository_scan)`
      SELECT *
      FROM repository_scan
      WHERE repository_id = ${repositoryId}
      ORDER BY scanned_at DESC`)

    return Promise.all(
      scans.map(
        async (it): Promise<t_RepositoryScan> => ({
          scanId: it.id,
          repositoryId: it.repository_id,
          scannedAt: it.scanned_at,
          summary: await this.getRepositorySummary(it.id),
        }),
      ),
    )
  }

  async getRepositorySummary(scanId: string): Promise<t_RepositorySummary> {
    const rows = await this.sqlite.any(
      sql(
        projection(t.repository, "id", "name").and(
          z.object({
            count: z.number(),
            license_group_name: z.string().nullable(),
          }),
        ),
      )`
        select r.id, r.name, lg.name as license_group_name, count(1) as count
        from repository r
               join repository_scan rs ON r.id = rs.repository_id
               join repository_dependency rd on rs.id = rd.repository_scan_id
               join dependency d on rd.dependency_name = d.name and rd.dependency_version = d.version
               left join licenses l on d.license_concluded_id = l.id or d.license_declared_id = l.id
               left join license_license_groups llg on l.id = llg.license_id
               left join license_groups lg on llg.license_group_id = lg.id
        WHERE rs.id = ${scanId}
        GROUP BY r.name, lg.name
      `,
    )

    const result = createRepositorySummary(rows).pop()

    if (!result) {
      throw new Error("scan not found")
    }

    return result
  }

  async getRepositorySummaries(
    repositoryIds?: string[],
  ): Promise<t_RepositorySummary[]> {
    const rows = await this.sqlite.any(
      sql(
        projection(t.repository, "id", "name").and(
          z.object({
            count: z.number(),
            license_group_name: z.string().nullable(),
          }),
        ),
      )`
        select r.id, r.name, lg.name as license_group_name, count(1) as count
        from repository r
               join repository_scan rs ON (r.id = rs.repository_id AND rs.id IN (SELECT id
                                                                                 FROM repository_scan
                                                                                 WHERE repository_id = r.id
                                                                                 ORDER BY scanned_at DESC
                                                                                 LIMIT 1)
          )
               join repository_dependency rd on rs.id = rd.repository_scan_id
               join dependency d on rd.dependency_name = d.name and rd.dependency_version = d.version
               left join licenses l on d.license_concluded_id = l.id or d.license_declared_id = l.id
               left join license_license_groups llg on l.id = llg.license_id
               left join license_groups lg on llg.license_group_id = lg.id
        WHERE (${repositoryIds} IS NULL OR r.id IN ${repositoryIds || []})
        GROUP BY r.name, lg.name
      `,
    )
    return createRepositorySummary(rows)
  }

  async getRepositoryScanDependencies(
    repositoryId: string,
    scanId: string,
    excludePermissive: boolean,
  ): Promise<t_RepositoryScanDependency[]> {
    const rows = await this.sqlite.any(
      sql(
        projection(t.dependency, "name", "version", "supplier").and(
          z.object({
            repository_id: z.string().uuid(),
            scan_id: z.string().uuid(),
            license_concluded_name: z.string().nullable(),
            license_concluded_group_name: z.string().nullable(),
            license_declared_name: z.string().nullable(),
            license_declared_group_name: z.string().nullable(),
          }),
        ),
      )`
        select d.name,
               d.version,
               d.supplier,
               r.id     as repository_id,
               rs.id    as scan_id,
               lc.name  as license_concluded_name,
               lcg.name as license_concluded_group_name,
               ld.name  as license_declared_name,
               ldg.name as license_declared_group_name

        from repository r
               join repository_scan rs
               join repository_dependency rd on rs.id = rd.repository_scan_id
               join dependency d on rd.dependency_name = d.name and rd.dependency_version = d.version
               left join licenses lc on d.license_concluded_id = lc.id
               left join license_license_groups lclg on lc.id = lclg.license_id
               left join license_groups lcg on lclg.license_group_id = lcg.id
               left join licenses ld on d.license_declared_id = ld.id
               left join license_license_groups ldlg on ld.id = ldlg.license_id
               left join license_groups ldg on ldlg.license_group_id = ldg.id
        WHERE r.id = ${repositoryId}
          AND rs.id = ${scanId}
          AND (coalesce(${excludePermissive}, FALSE) IS FALSE OR
               (lcg.name IS NOT 'Permissive' AND ldg.name IS NOT 'Permissive'))
        ORDER BY coalesce(lcg.risk, ldg.risk) DESC
      `,
    )

    return rows.map((it) => ({
      dependencyName: it.name,
      dependencyVersion: it.version ?? "[unknown]",
      licenseConcludedCategory: it.license_concluded_group_name,
      licenseConcludedName: it.license_concluded_name,
      licenseDeclaredCategory: it.license_declared_group_name,
      licenseDeclaredName: it.license_declared_name,
      repositoryId: it.repository_id,
      scanId: it.scan_id,
      supplier: it.supplier,
    }))
  }
}

function createRepositorySummary(
  rows: {
    id: string
    name: string
    license_group_name: string | null
    count: number
  }[],
): t_RepositorySummary[] {
  return Object.values(
    rows.reduce(
      (acc, it) => {
        acc[it.name.toString()] = acc[it.name.toString()] || {
          name: it.name.toString(),
          repositoryId: it.id,
          groups: [],
        }
        acc[it.name].groups.push({
          name: it.license_group_name || "Unknown",
          count: it.count,
        })
        return acc
      },
      {} as Record<string, t_RepositorySummary>,
    ),
  )
}
