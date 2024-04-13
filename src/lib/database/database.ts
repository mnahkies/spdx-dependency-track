import {config} from "@/lib/config"
import {LicenseDataLoader} from "@/lib/data-loaders/license-data-loader"
import {LicenseRepository} from "@/lib/database/repository/licenses"
import {Sqlite} from "@/lib/database/sqlite"

export class Database {
  private readonly sqlite: Sqlite
  readonly licensesRepository: LicenseRepository

  constructor(dbPath: string, inMemory: boolean = false) {
    this.sqlite = new Sqlite(inMemory ? ":memory:" : dbPath)
    this.licensesRepository = new LicenseRepository(this.sqlite)
  }
}

export const database = new Database(config.DB_PATH, config.IS_DOCKER_BUILD)

const licenseDataLoader = new LicenseDataLoader(database)

licenseDataLoader
  .load(config.LICENSE_DATA_PATH, config.LICENSE_GROUPS_DATA_PATH)
  .catch(console.error)
