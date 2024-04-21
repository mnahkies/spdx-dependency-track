import {randomUUID} from "node:crypto"
import {t_dependency_graph_spdx_sbom} from "@/generated/clients/github/models"
import {t_License} from "@/generated/models"
import {GithubClient} from "@/lib/clients/github-client"
import {Database} from "@/lib/database/database"
import {isDefined} from "@/lib/utils"
import semver from "semver"
import parseSpdxExpression, {Info, LicenseInfo} from "spdx-expression-parse"
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
        acc[license.external_id] = license
        return acc
      },
      {} as Record<string, t_License>,
    )

    const validPackages = sbom.packages
      .map((it) => {
        const result = validSBOMPackage.safeParse(it)
        return result.success ? result.data : undefined
      })
      .filter(isDefined)

    await this.database.repositoryRepository.insertDependencies(
      await Promise.all(
        validPackages.map(async (it) => {
          // You'd think that Github would be doing this already, but it appears not.
          if (
            !it.licenseDeclared &&
            !it.licenseConcluded &&
            it.name.startsWith("npm:")
          ) {
            const res = await fetch(
              `https://registry.npmjs.com/${it.name.replace("npm:", "")}/${
                it.versionInfo
              }`,
              {headers: {"content-type": "application/json"}},
            )
            if (res.ok) {
              const fromNpm = Reflect.get(await res.json(), "license")
              console.log(
                `concluded missing license from npm registry: ${fromNpm}`,
              )
              it.licenseConcluded = fromNpm
            } else {
              console.warn(`failed to fetch metadata from npm for ${it.name}`)
              // TODO: this is probably caused by dependencies like `string-width-cjs "npm:string-width@^4.2.0"`
              //       where the version is resolved to a another package. Github doesn't seem to handle this aliasing
              //       in it's SBOM generation, so there is no information available for us to follow the chain to the
              //       actual dependency being included.
            }
          }

          const concluded = it.licenseConcluded
            ? findMostRestrictiveLicense(
                parseSpdxExpression(it.licenseConcluded),
                licenses,
              )
            : null
          const declared = it.licenseDeclared
            ? findMostRestrictiveLicense(
                parseSpdxExpression(it.licenseDeclared),
                licenses,
              )
            : null

          const concludedId = concluded ? licenses[concluded]?.id : null
          const declaredId = declared ? licenses[declared]?.id : null

          if (concluded && !concludedId) {
            console.warn(`missing license ${concluded}`)
          }
          if (declared && !declaredId) {
            console.warn(`missing license ${declared}`)
          }

          return {
            id: it.SPDXID,
            name: it.name,
            version: it.versionInfo,
            supplier: it.supplier,
            license_concluded_id: concludedId || null,
            license_declared_id: declaredId || null,
          }
        }),
      ),
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

function isLicenseInfo(it: unknown): it is LicenseInfo {
  return Boolean(typeof it === "object" && it && Reflect.get(it, "license"))
}

function findMostRestrictiveLicense(
  parsed: Info,
  licenses: Record<string, t_License>,
): string {
  if (isLicenseInfo(parsed)) {
    return parsed.license
  }

  const left = isLicenseInfo(parsed.left)
    ? parsed.left.license
    : findMostRestrictiveLicense(parsed.left, licenses)
  const right = isLicenseInfo(parsed.right)
    ? parsed.right.license
    : findMostRestrictiveLicense(parsed.right, licenses)

  const leftRisk =
    licenses[left]?.risk !== undefined
      ? licenses[left].risk
      : Number.MAX_SAFE_INTEGER
  const rightRisk =
    licenses[right]?.risk !== undefined
      ? licenses[right].risk
      : Number.MAX_SAFE_INTEGER

  // TODO: this doesn't really capture things properly for stuff like:
  //       https://github.com/digitalbazaar/forge/blob/main/LICENSE
  //       where you can choose to use it under a permissive license, no strings
  //       attached. Perhaps having a human triage and re-assign is best though?
  if (leftRisk > rightRisk) {
    return left
  } else {
    return right
  }
}
