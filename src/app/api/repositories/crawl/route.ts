import {GithubClient} from "@/lib/clients/github-client"
import {SpdxDataLoader} from "@/lib/data-loaders/spdx-data-loader"
import {database} from "@/lib/database/database"
import {NextRequest} from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const {token} = await request.json()

  const spdxDataLoader = new SpdxDataLoader(database, new GithubClient(token))

  await spdxDataLoader.crawlGithub()

  return Response.json({success: true})
}
