import {z} from "zod"

export const config = z
  .object({
    DB_PATH: z.string(),
    LICENSE_DATA_PATH: z.string(),
    LICENSE_GROUPS_DATA_PATH: z.string(),
  })
  .parse(process.env)
