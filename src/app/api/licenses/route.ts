import {_GET} from "@/generated/api/licenses/route"
import {database} from "@/lib/database/database"

export const dynamic = "force-dynamic"

export const GET = _GET(async (respond, context) => {
  const licenses = await database.licensesRepository.getLicenses()

  return respond.with200().body(licenses)
})
