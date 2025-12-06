import {_GET} from "@/generated/api/repositories/[repositoryId]/summary/route"
import {database} from "@/lib/database/database"

export const GET = _GET(async ({params}, respond, _context) => {
  return respond
    .with200()
    .body(
      (
        await database.repositoryRepository.getRepositorySummaries([
          params.repositoryId,
        ])
      )[0],
    )
})
