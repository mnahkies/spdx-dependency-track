import {
  type InsertLicenseGroupParams,
  type InsertLicenseParams,
  associateLicenseWithGroup,
  getLicenses,
  insertLicense,
  insertLicenseGroup,
} from "@/generated/database/generated"
import type {t_License} from "@/generated/models"
import type {Sqlite} from "@/lib/database/sqlite"

export class LicenseRepository {
  constructor(private readonly sqlite: Sqlite) {}

  async insertLicenses(licenses: InsertLicenseParams[]): Promise<void> {
    await this.sqlite.transaction(async (trx) => {
      for (const it of licenses) {
        await insertLicense(trx, it)
      }
    })
  }

  async insertLicenseGroups(
    licenseGroups: InsertLicenseGroupParams[],
  ): Promise<void> {
    await this.sqlite.transaction(async (trx) => {
      for (const it of licenseGroups) {
        await insertLicenseGroup(trx, it)
      }
    })
  }

  async associateLicenseWithGroup(
    licenseId: string,
    licenseGroupId: string,
  ): Promise<void> {
    await this.sqlite.transaction(async (trx) => {
      await associateLicenseWithGroup(trx, {licenseGroupId, licenseId})
    })
  }

  async getLicenses(): Promise<t_License[]> {
    return this.sqlite.transaction(async (trx) => {
      return getLicenses(trx)
    })
  }
}
