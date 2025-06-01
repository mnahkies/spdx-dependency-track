import type {Query} from "@/generated/database/generated"
// TODO: this will later be extracted to a standalone node module
import Database, {type Statement} from "better-sqlite3"
import {type ZodTypeAny, type ZodUnknown, z} from "zod"

export class Sqlite {
  private readonly db: Database.Database

  constructor(filename: string) {
    this.db = new Database(filename, {})
    this.db.pragma("journal_mode = WAL")
    this.db.pragma("foreign_keys = ON")
  }

  async transaction<T>(fn: (trx: Sqlite) => Promise<T>): Promise<T> {
    const result = this.db.transaction(() => fn(this)).immediate()
    return result
  }

  async run(query: Query<ZodUnknown>): Promise<void> {
    try {
      const prepared = this.prepare(query.query)
      prepared.run(...query.parameters)
    } catch (err) {
      console.info(query.query)
      console.info(query.parameters)
      console.error(err)
      throw err
    }
  }

  async one<T extends ZodTypeAny>(query: Query<T>): Promise<z.infer<T>> {
    try {
      const prepared = this.prepare(query.query)
      const result = prepared.all(...query.parameters)

      return z.array(query.parser).min(1).max(1).parse(result)[0]
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async any<T extends ZodTypeAny>(query: Query<T>): Promise<z.infer<T>[]> {
    try {
      const prepared = this.prepare(query.query)
      const result = prepared.all(...query.parameters)

      return z.array(query.parser).parse(result)
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async many<T extends ZodTypeAny>(query: Query<T>): Promise<z.infer<T>[]> {
    const prepared = this.prepare(query.query)
    const result = query.parameters.length
      ? prepared.all(...query.parameters)
      : prepared.all()

    return z.array(query.parser).min(1).parse(result)
  }

  private readonly preparedStatementsCache: Record<string, Statement> = {}

  private prepare(query: string) {
    try {
      if (!this.preparedStatementsCache[query]) {
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        return (this.preparedStatementsCache[query] = this.db.prepare(query))
      }
      return this.preparedStatementsCache[query]
    } catch (err) {
      console.error(`failed to prepare sql: ${query}`)
      throw err
    }
  }
}
