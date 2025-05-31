import { z, type ZodTypeAny } from "zod"

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
      // biome-ignore lint/style/noParameterAssign: <explanation>
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
            for (const it1 of parameter) {
              parameters.push(it1)
            }
            return `${acc}(${parameter.map((it) => "?").join(", ")})`
          }
          if (parameter === null) {
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
      return `${acc}?`
    }, "")

    return {
      query,
      parameters,
      parser,
      type: sqlQuerySymbol,
    }
  }
}

export interface Transaction {
  one<T extends ZodTypeAny>(query: Query<T>): Promise<T>
  any<T extends ZodTypeAny>(query: Query<T>): Promise<T[]>
}

export type InsertLicenseParams = {
  id: string
  name: string
  text: string
  comments: string | null
  external_id: string
  is_osi_approved: number
  is_fsf_libre: number
}

export async function insertLicense(
  trx: Transaction,
  {
    id,
    name,
    text,
    comments,
    external_id,
    is_osi_approved,
    is_fsf_libre,
  }: InsertLicenseParams,
) {
  const projection = z.object({})

  const results = await trx.any(sql(projection)`
INSERT INTO licenses(id,
name,
text,
comments,
external_id,
is_osi_approved,
is_fsf_libre)
VALUES (${id},
${name},
${text},
${comments},
${external_id},
${is_osi_approved},
${is_fsf_libre})
ON CONFLICT DO NOTHING;`)

  return results
}

export type InsertLicenseGroupParams = {
  id: string
  name: string
  risk: number
}

export async function insertLicenseGroup(
  trx: Transaction,
  { id, name, risk }: InsertLicenseGroupParams,
) {
  const projection = z.object({})

  const results = await trx.any(sql(projection)`
INSERT INTO license_groups(id, name, risk)
VALUES (${id},
${name},
${risk})
ON CONFLICT DO NOTHING;`)

  return results
}

export type AssociateLicenseWithGroupParams = {
  licenseGroupId: string
  licenseId: string
}

export async function associateLicenseWithGroup(
  trx: Transaction,
  { licenseGroupId, licenseId }: AssociateLicenseWithGroupParams,
) {
  const projection = z.object({})

  const results = await trx.any(sql(projection)`
INSERT INTO license_license_groups(license_group_id, license_id)
VALUES (${licenseGroupId}, ${licenseId})
ON CONFLICT DO NOTHING;`)

  return results
}

export async function getLicenses(trx: Transaction) {
  const projection = z.object({
    external_id: z.string(),
    name: z.string(),
    id: z.string(),
    group_name: z.string(),
    risk: z.number(),
  })

  const results = await trx.any(sql(projection)`
SELECT l.external_id,
l.name,
l.id,
lg.name AS group_name,
lg.risk
FROM license_license_groups llg
JOIN licenses l ON llg.license_id = l.id
JOIN license_groups lg ON llg.license_group_id = lg.id
ORDER BY lg.risk DESC, lg.name`)

  return results
}
