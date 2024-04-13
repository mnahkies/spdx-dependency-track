import {aliased, projection, t} from "@/lib/database/generated"
import {Sqlite, sql} from "@/lib/database/sqlite"
import {ApiRepositorySummary} from "@/lib/types"
import {z} from "zod"

export class RepositoryRepository {
  constructor(private readonly sqlite: Sqlite) {}

  async insertRepositories(
    repositories: z.infer<typeof t.repository>[],
  ): Promise<void> {
    await Promise.all(repositories.map((it) => this.insertRepository(it)))
  }

  private async insertRepository(
    repository: z.infer<typeof t.repository>,
  ): Promise<void> {
    await this.sqlite.any(sql(projection(t.repository, "id"))`
      INSERT INTO repository(id,
                             name,
                             url,
                             is_archived)
      VALUES (${repository.id},
              ${repository.name},
              ${repository.url},
              ${repository.is_archived})
      ON CONFLICT(name) DO UPDATE SET id = excluded.id
      RETURNING (id)`)
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
      ON CONFLICT DO NOTHING
    `)
  }

  async associateDependencyWithRepository(
    repositoryId: string,
    dependencyName: string,
    dependencyVersion: string,
  ): Promise<void> {
    await this.sqlite.run(sql(z.unknown())`
      INSERT INTO repository_dependency(repository_id, dependency_name, dependency_version)
      VALUES (${repositoryId}, ${dependencyName}, ${dependencyVersion})
      ON CONFLICT DO NOTHING
    `)
  }

  async getRepositorySummaries(): Promise<ApiRepositorySummary[]> {
    const rows = await this.sqlite.many(
      sql(
        projection(t.repository, "name").and(
          z.object({
            count: z.number(),
            license_group_name: z.string().nullable(),
          }),
        ),
      )`
      select r.name, lg.name as license_group_name, count(1) as count
      from repository r
             join repository_dependency rd on r.id = rd.repository_id
             join dependency d on rd.dependency_name = d.name and rd.dependency_version = d.version
             left join licenses l on d.license_concluded_id = l.id or d.license_declared_id = l.id
             left join license_license_groups llg on l.id = llg.license_id
             left join license_groups lg on llg.license_group_id = lg.id
      GROUP BY r.name, lg.name
    `,
    )

    return Object.values(
      rows.reduce((acc, it) => {
        acc[it.name.toString()] = acc[it.name.toString()] || {
          name: it.name.toString(),
          groups: [],
        }
        acc[it.name].groups.push({
          name: it.license_group_name || "unclassified",
          count: it.count,
        })
        return acc
      }, {} as any),
    )
  }
}
