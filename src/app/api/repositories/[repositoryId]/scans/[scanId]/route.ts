import {_GET} from "@/generated/api/repositories/[repositoryId]/scans/[scanId]/route"
import {database} from "@/lib/database/database"

export const GET = _GET(async ({params, query}, respond, context) => {
  return respond
    .with200()
    .body(
      await database.repositoryRepository.getRepositoryScanDependencies(
        params.repositoryId,
        params.scanId,
        query.excludePermissive || false,
      ),
    )
})
