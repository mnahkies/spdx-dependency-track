/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */

import {z} from "zod"

export const s_License = z.object({
  id: z.string(),
  external_id: z.string(),
  name: z.string(),
  group_name: z.string(),
  risk: z.coerce.number(),
})

export const s_RepositorySummary = z.object({
  name: z.string(),
  groups: z.array(z.object({name: z.string(), count: z.coerce.number()})),
})

export const s_scanRepositoriesJsonRequestBody = z.object({token: z.string()})