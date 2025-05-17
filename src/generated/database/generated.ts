import { type AnyZodObject, type ZodObject, z } from "zod"

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
    {} as { [k in SchemaProjection]: true },
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
  licenses: z.object({
    id: z.string(),
    name: z.string(),
    text: z.string(),
    comments: z.string().nullable(),
    external_id: z.string(),
    is_osi_approved: z.number(),
    is_fsf_libre: z.number(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
  license_groups: z.object({
    id: z.string(),
    name: z.string(),
    risk: z.number(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
  license_license_groups: z.object({
    license_group_id: z.string(),
    license_id: z.string(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
  repository: z.object({
    id: z.string(),
    url: z.string(),
    name: z.string(),
    is_archived: z.number(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
  dependency: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    supplier: z.string(),
    license_declared_id: z.string().nullable(),
    license_concluded_id: z.string().nullable(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
  repository_dependency: z.object({
    repository_scan_id: z.string(),
    dependency_name: z.string(),
    dependency_version: z.string(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
  repository_scan: z.object({
    id: z.string(),
    scanned_at: z.string(),
    repository_id: z.string(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }),
}
