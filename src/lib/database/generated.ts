import {type AnyZodObject, type ZodObject, z} from "zod"

export function projection<
  Schema extends AnyZodObject,
  SchemaProjection extends keyof z.infer<Schema>,
>(
  schema: Schema,
  ...projection: readonly SchemaProjection[]
): ZodObject<Pick<Schema["shape"], SchemaProjection>>
export function projection<
  Schema extends AnyZodObject,
  SchemaProjection extends keyof z.infer<Schema>,
>(
  schema: Schema,
  projection: readonly SchemaProjection[],
): ZodObject<Pick<Schema["shape"], SchemaProjection>>
export function projection<
  Schema extends AnyZodObject,
  SchemaProjection extends keyof z.infer<Schema>,
>(
  schema: Schema,
  ...projection: readonly SchemaProjection[]
): ZodObject<Pick<Schema["shape"], SchemaProjection>> {
  projection = Array.isArray(projection[0]) ? projection[0] : projection

  const projectionObj = projection.reduce(
    (acc, it) => {
      acc[it] = true
      return acc
    },
    {} as {[k in SchemaProjection]: true},
  )

  // @ts-ignore
  return schema.pick(projectionObj)
}

export function aliased<
  Schema extends AnyZodObject,
  R extends {
    [K in keyof R]: K extends keyof Schema["shape"]
      ? PropertyKey
      : 'Error: key not in Schema["shape"]'
  },
>(
  schema: Schema,
  x: R,
): ZodObject<{
  [P in keyof Schema["shape"] as P extends keyof R
    ? R[P]
    : P]: Schema["shape"][P]
}> {
  // @ts-ignore
  return z.object(
    // @ts-ignore
    Object.fromEntries(
      Object.entries(schema.shape).map(([name, value]) => {
        return [Reflect.get(x, name) || name, value]
      }),
    ),
  )
}

export const t = {
  atlas_schema_revisions: z.object({
    version: z.string(),
    description: z.string(),
    type: z.number(),
    applied: z.number(),
    total: z.number(),
    executed_at: z.date(),
    execution_time: z.number(),
    error: z.string().nullable(),
    error_stmt: z.string().nullable(),
    hash: z.string(),
    partial_hashes: z.unknown().nullable(),
    operator_version: z.string(),
  }),
  licenses: z.object({
    id: z.string(),
    name: z.string(),
    text: z.string(),
    comments: z.string().nullable(),
    external_id: z.string(),
    is_osi_approved: z.number(),
    is_fsf_libre: z.number(),
  }),
  license_groups: z.object({
    id: z.string(),
    name: z.string(),
    risk: z.number(),
  }),
  license_license_groups: z.object({
    license_group_id: z.string(),
    license_id: z.string(),
  }),
  repository: z.object({
    id: z.string(),
    url: z.string(),
    name: z.string(),
    is_archived: z.number(),
  }),
  dependency: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    supplier: z.string(),
    license_declared_id: z.string().nullable(),
    license_concluded_id: z.string().nullable(),
  }),
  repository_dependency: z.object({
    repository_id: z.string(),
    dependency_id: z.string(),
  }),
}
