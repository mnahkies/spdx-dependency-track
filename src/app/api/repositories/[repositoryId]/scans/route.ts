import {_GET} from "@/generated/api/repositories/[repositoryId]/scans/route"
import {database} from "@/lib/database/database"

export const GET = _GET(async ({params}, respond, context) => {
  return respond
    .with200()
    .body(
      await database.repositoryRepository.getRepositoryScans(
        params.repositoryId,
      ),
    )
})
