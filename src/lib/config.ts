import {z} from "zod"

export const config = z
  .object({
    IS_DOCKER_BUILD: z
      .string()
      .default("false")
      .transform((it) => it === "true"),
    DB_PATH: z.string(),
  })
  .parse(process.env)
