import {randomUUID} from "node:crypto"
import {t_dependency_graph_spdx_sbom} from "@/generated/clients/github/models"
import {GithubClient} from "@/lib/clients/github-client"
import {Database} from "@/lib/database/database"
import {isDefined} from "@/lib/utils/utils"
import semver from "semver"
import {z} from "zod"

const validSBOMPackage = z.object({
  SPDXID: z.string(),
  name: z.string(),
  versionInfo: z.string().refine((it) => semver.valid(it), {
    message: "Version info must be valid semver range",
  }),
  supplier: z.string(),
  licenseConcluded: z.string().nullable().optional(),
  licenseDeclared: z.string().nullable().optional(),
})

export class SpdxDataLoader {
  constructor(
    private readonly database: Database,
    private readonly github: GithubClient,
  ) {}

  async crawlGithub() {
    for await (const {repo, sbom} of this.github.allSboms(
      (it) => !it.fork && !it.archived,
    )) {
      await this.load({name: repo.full_name, url: repo.url}, sbom)
      console.info(`inserted sbom for ${repo.full_name}`)
    }
  }

  async load(
    repository: {name: string; url: string},
    sbom: t_dependency_graph_spdx_sbom["sbom"],
  ): Promise<void> {
    const {id: repositoryId} =
      await this.database.repositoryRepository.insertRepository({
        name: repository.name,
        url: repository.url,
        is_archived: 0,
        id: randomUUID(),
      })

    const scan = await this.database.repositoryRepository.insertRepositoryScan({
      id: randomUUID(),
      repository_id: repositoryId,
      scanned_at: sbom.creationInfo.created,
    })

    const licenses = (
      await this.database.licensesRepository.getLicenses()
    ).reduce(
      (acc, license) => {
        acc[license.external_id] = license.id
        return acc
      },
      {} as Record<string, string>,
    )

    const validPackages = sbom.packages
      .map((it) => {
        const result = validSBOMPackage.safeParse(it)
        return result.success ? result.data : undefined
      })
      .filter(isDefined)

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
        this.database.repositoryRepository.associateDependencyWithRepositoryScan(
          scan.id,
          it.name,
          it.versionInfo,
        ),
      ),
    )
  }
}
