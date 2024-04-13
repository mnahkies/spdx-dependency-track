import {config} from "@/lib/config"
import {Sqlite} from "@/lib/database/sqlite"

export class Database {
  private readonly sqlite: Sqlite

  constructor(dbPath: string, inMemory: boolean = false) {
    this.sqlite = new Sqlite(inMemory ? ":memory:" : dbPath)
  }
}

export const database = new Database(config.DB_PATH, config.IS_DOCKER_BUILD)
