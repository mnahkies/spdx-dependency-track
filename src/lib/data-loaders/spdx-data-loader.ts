import {randomUUID} from "node:crypto"
import {Database} from "@/lib/database/database"
import semver from "semver"
import {z} from "zod"

const SpdxSchema = z.object({
  packages: z.array(
    z.object({
      SPDXID: z.string(),
      name: z.string(),
      versionInfo: z.string(),
      supplier: z.string(),
      licenseConcluded: z.string().nullable().optional(),
      licenseDeclared: z.string().nullable().optional(),
    }),
  ),
})

export class SpdxDataLoader {
  constructor(private readonly database: Database) {}

  async testLoad() {
    const data = require("../../../data/example-spdx-openapi-code-generator_mnahkies.json")

    await this.load(
      {
        name: "mnahkies/openapi-code-generator",
        url: "https://github.com/mnahkies/openapi-code-generator",
      },
      data,
    )
  }

  async load(
    repository: {name: string; url: string},
    maybeSpdx: unknown,
  ): Promise<void> {
    const repositoryId = randomUUID()
    await this.database.repositoryRepository.insertRepositories([
      {
        name: repository.name,
        url: repository.url,
        is_archived: 0,
        id: repositoryId,
      },
    ])

    const spdx = SpdxSchema.parse(maybeSpdx)

    const licenses = (
      await this.database.licensesRepository.getLicenses()
    ).reduce(
      (acc, license) => {
        acc[license.external_id] = license.id
        return acc
      },
      {} as Record<string, string>,
    )

    const validPackages = spdx.packages.filter((it) =>
      semver.valid(it.versionInfo),
    )

    await this.database.repositoryRepository.insertDependencies(
      validPackages.map((it) => ({
        id: it.SPDXID,
        name: it.name,
        version: it.versionInfo,
        supplier: it.supplier,
        license_concluded_id:
          (it.licenseConcluded && licenses[it.licenseConcluded]) || null,
        license_declared_id:
          (it.licenseDeclared && licenses[it.licenseDeclared]) || null,
      })),
    )

    await Promise.all(
      validPackages.map((it) =>
        this.database.repositoryRepository.associateDependencyWithRepository(
          repositoryId,
          it.name,
          it.versionInfo,
        ),
      ),
    )
  }
}
