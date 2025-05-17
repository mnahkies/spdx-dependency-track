import {scheduler} from "node:timers/promises"
import {ApiClient} from "@/generated/clients/github/client"
import type {t_repository} from "@/generated/clients/github/models"
import type {
  Res,
  StatusCode3xx,
  StatusCode4xx,
} from "@nahkies/typescript-fetch-runtime/main"
import {z} from "zod"

export class GithubClient {
  private readonly client: ApiClient

  constructor(token: string) {
    this.client = new ApiClient({
      basePath: "https://api.github.com",
      defaultHeaders: {Authorization: `Bearer ${token}`},
      defaultTimeout: 5_000,
    })
  }

  public async *allSboms(filter: (repo: t_repository) => boolean = () => true) {
    await this.checkAuth()

    for await (const repo of this.allRepos()) {
      if (!filter(repo)) {
        continue
      }

      const sbom = await this.getSbom(repo)

      if (sbom) {
        console.info(`found sbom for ${repo.full_name}`)
        yield {repo, sbom}
      } else {
        console.warn(`no sbom found for ${repo.full_name}`)
      }
    }
  }

  private allRepos(): AsyncGenerator<t_repository> {
    return this.pager(async (page, perPage) =>
      this.client.reposListForAuthenticatedUser({
        page,
        perPage,
      }),
    )
  }

  private async getSbom(repo: t_repository) {
    console.info(`fetching sbom for ${repo.full_name}`)
    const res = await this.client.dependencyGraphExportSbom({
      owner: repo.owner.login,
      repo: repo.name,
    })

    if (res.status === 200) {
      const spdx = await res.json()
      return spdx.sbom
    }

    console.warn(`failed to fetch sbom for ${repo.full_name}`)
    console.warn(await res.text())

    return null
  }

  private async checkAuth() {
    console.info("checking authentication")

    const res = await this.client.usersGetAuthenticated()

    if (res.status !== 200) {
      console.info(res)
      throw new Error("invalid auth!")
    }
  }

  private async *pager<T>(
    fetchPage: (
      page: number,
      perPage: number,
    ) => Promise<
      Res<200, T[]> | Res<StatusCode3xx, unknown> | Res<StatusCode4xx, unknown>
    >,
  ): AsyncGenerator<T> {
    let page = 1
    const perPage = 100

    let data: T[] = []

    do {
      const res = await fetchPage(page, perPage)

      if (res.status === 200) {
        data = await res.json()

        console.info(`fetched ${data.length} items (page=${page})`)

        for (const item of data) {
          yield item
        }
      } else {
        throw new Error(`failed to fetch page ${page}`, {
          cause: new Error(await res.text()),
        })
      }

      page++

      await this.respectRateLimit(res.headers)
    } while (data.length >= perPage)
  }

  private async respectRateLimit(headers: Headers) {
    let remaining = z.coerce
      .number()
      .parse(headers.get("x-ratelimit-remaining"))
    let resets =
      z.coerce.number().parse(headers.get("x-ratelimit-reset")) * 1000

    while (remaining < 20) {
      const sleep = resets - Date.now()

      console.info(
        `sleeping for ${sleep / 1000 / 60} minutes (remaining ${remaining}, resets at ${new Date(resets)}`,
      )

      await scheduler.wait(sleep)

      const res = await this.client.rateLimitGet()

      if (res.status === 200) {
        const data = await res.json()
        remaining = data.rate.remaining
        resets = data.rate.reset
      }
    }
  }
}
