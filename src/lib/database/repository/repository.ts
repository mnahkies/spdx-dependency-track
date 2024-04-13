import {projection, t} from "@/lib/database/generated"
import {Sqlite, sql} from "@/lib/database/sqlite"
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
}
