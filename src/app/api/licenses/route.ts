import {database} from "@/lib/database/database"
import {NextRequest} from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  return Response.json(await database.licensesRepository.getLicenses())
}
