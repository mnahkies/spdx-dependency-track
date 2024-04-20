import {aliased, projection, t} from "@/generated/database/generated"
import {t_License} from "@/generated/models"
import {Sqlite, sql} from "@/lib/database/sqlite"
import {z} from "zod"

export class LicenseRepository {
  constructor(private readonly sqlite: Sqlite) {}

  async insertLicenses(licenses: z.infer<typeof t.licenses>[]): Promise<void> {
    await Promise.all(licenses.map((it) => this.insertLicense(it)))
  }

  private async insertLicense(
    license: z.infer<typeof t.licenses>,
  ): Promise<void> {
    await this.sqlite.run(sql(z.unknown())`
      INSERT INTO licenses(id,
                           name,
                           text,
                           comments,
                           external_id,
                           is_osi_approved,
                           is_fsf_libre)
      VALUES (${license.id},
              ${license.name},
              ${license.text},
              ${license.comments},
              ${license.external_id},
              ${license.is_osi_approved},
              ${license.is_fsf_libre})
      ON CONFLICT DO NOTHING`)
  }

  async insertLicenseGroups(
    licenseGroups: z.infer<typeof t.license_groups>[],
  ): Promise<void> {
    await Promise.all(licenseGroups.map((it) => this.insertLicenseGroup(it)))
  }

  private async insertLicenseGroup(
    licenseGroup: z.infer<typeof t.license_groups>,
  ): Promise<void> {
    await this.sqlite.run(sql(z.unknown())`
      INSERT INTO license_groups(id, name, risk)
      VALUES (${licenseGroup.id}, ${licenseGroup.name}, ${licenseGroup.risk})
      ON CONFLICT DO NOTHING`)
  }

  async associateLicenseWithGroup(
    licenseId: string,
    licenseGroupId: string,
  ): Promise<void> {
    await this.sqlite.run(sql(z.unknown())`
      INSERT INTO license_license_groups(license_group_id, license_id)
      VALUES (${licenseGroupId}, ${licenseId})
      ON CONFLICT DO NOTHING`)
  }

  async getLicenses(): Promise<t_License[]> {
    return this.sqlite.many(
      sql(
        projection(t.licenses, "external_id", "name", "id").and(
          aliased(projection(t.license_groups, "name", "risk"), {
            name: "group_name",
          }),
        ),
      )`SELECT l.external_id,
               l.name,
               l.id,
               lg.name AS group_name,
               lg.risk
        FROM license_license_groups llg
               JOIN licenses l ON llg.license_id = l.id
               JOIN license_groups lg ON llg.license_group_id = lg.id
        ORDER BY lg.risk DESC, lg.name`,
    )
  }
}
