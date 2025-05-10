import fs from "node:fs/promises"
import {Database} from "@/lib/database/database"
import {z} from "zod"

const LicenseSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  licenseText: z.string(),
  licenseComments: z.string().nullable().optional(),
  licenseId: z.string(),
  isOsiApproved: z.boolean(),
  isFsfLibre: z.boolean(),
})

const LicenseGroupSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  riskWeight: z.number(),
  licenses: z.array(z.object({uuid: z.string().uuid()})),
})

export class LicenseDataLoader {
  constructor(private readonly database: Database) {}

  async load(licensesPath: string, licenseGroupsPath: string): Promise<any> {
    console.info("loading licenses")
    await this.loadLicenses(licensesPath)
    await this.loadLicenseGroups(licenseGroupsPath)
  }

  private async loadLicenses(path: string) {
    const raw = await fs.readFile(path, "utf-8")

    const licenses = raw ? z.array(LicenseSchema).parse(JSON.parse(raw)) : []

    if (!licenses.length) {
      console.warn("no licenses found to load")
    }

    await this.database.licensesRepository.insertLicenses(
      licenses.map((it) => ({
        id: it.uuid,
        name: it.name,
        text: it.licenseText,
        comments: it.licenseComments || null,
        external_id: it.licenseId,
        is_osi_approved: it.isOsiApproved ? 1 : 0,
        is_fsf_libre: it.isFsfLibre ? 1 : 0,
      })),
    )
  }

  private async loadLicenseGroups(path: string) {
    const licenseGroups = z
      .array(LicenseGroupSchema)
      .parse(JSON.parse(await fs.readFile(path, "utf-8")))

    await this.database.licensesRepository.insertLicenseGroups(
      licenseGroups.map((it) => ({
        id: it.uuid,
        name: it.name,
        risk: it.riskWeight,
      })),
    )

    await Promise.all(
      licenseGroups.map(async (licenseGroup) => {
        return Promise.all(
          licenseGroup.licenses.map((it) =>
            this.database.licensesRepository
              .associateLicenseWithGroup(it.uuid, licenseGroup.uuid)
              .catch((err) => {
                console.log(
                  `failed to associate license ${it.uuid} with ${licenseGroup.uuid}`,
                )
              }),
          ),
        )
      }),
    )
  }
}
