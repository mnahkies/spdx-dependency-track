import {_GET} from "@/generated/api/repositories/summaries/route"
import {database} from "@/lib/database/database"

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export const GET = _GET(async ({}, respond, context) => {
  const summaries = await database.repositoryRepository.getRepositorySummaries()
  return respond.with200().body(summaries)
})
