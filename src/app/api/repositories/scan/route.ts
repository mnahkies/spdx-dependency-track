import {_POST} from "@/generated/api/repositories/scan/route"
import {GithubClient} from "@/lib/clients/github-client"
import {SpdxDataLoader} from "@/lib/data-loaders/spdx-data-loader"
import {database} from "@/lib/database/database"

export const POST = _POST(async ({body}, respond, context) => {
  const spdxDataLoader = new SpdxDataLoader(
    database,
    new GithubClient(body.token),
  )

  await spdxDataLoader.crawlGithub()

  return respond.with204()
})
