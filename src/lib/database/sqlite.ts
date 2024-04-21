import Database, {Statement} from "better-sqlite3"
import {ZodTypeAny, ZodUnknown, z} from "zod"

export type PrimitiveValueExpression =
  | Buffer
  | bigint
  | boolean
  | number
  | string
  | readonly PrimitiveValueExpression[]
  | null
  | undefined

export type ValueExpression = PrimitiveValueExpression

export type Query<T extends ZodTypeAny> = {
  query: string
  parameters: unknown[]
  parser: T
  type: typeof sqlQuerySymbol
}

const sqlQuerySymbol = Symbol("sql")

export function sql<T extends ZodTypeAny>(parser: T) {
  return (
    parts: readonly string[],
    ...args: readonly ValueExpression[]
  ): Query<T> => {
    const parameters: unknown[] = []
    const query = parts.reduce((acc, it, i) => {
      const parameter = args[i]
      acc += it

      if (args.length <= i) {
        return acc
      }

      switch (typeof parameter) {
        case "bigint":
          parameters.push(parameter.toString(10))
          break
        case "boolean":
          parameters.push(parameter ? 1 : 0)
          break
        case "object":
          if (Array.isArray(parameter)) {
            parameter.forEach((it) => parameters.push(it))
            return acc + `(${parameter.map((it) => "?").join(", ")})`
          } else if (parameter === null) {
            parameters.push(null)
          }
          break
        case "undefined":
          parameters.push(null)
          break
        default:
          parameters.push(parameter)
      }

      // TODO: use named parameters?
      return acc + `?`
    }, "")

    return {
      query,
      parameters,
      parser,
      type: sqlQuerySymbol,
    }
  }
}

export class Sqlite {
  private readonly db: Database.Database

  constructor(filename: string) {
    this.db = new Database(filename, {})
    this.db.pragma(`journal_mode = WAL`)
    this.db.pragma(`foreign_keys = ON`)
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
        return (this.preparedStatementsCache[query] = this.db.prepare(query))
      }
      return this.preparedStatementsCache[query]
    } catch (err) {
      console.error(`failed to prepare sql: ${query}`)
      throw err
    }
  }
}
