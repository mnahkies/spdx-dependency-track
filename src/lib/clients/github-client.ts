import {ApiClient} from "@/generated/clients/github/client"
import {t_repository} from "@/generated/clients/github/models"

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
        yield {repo, sbom}
      }
    }
  }

  private async *allRepos() {
    let page = 1
    const perPage = 100

    while (true) {
      console.info(`fetching repositories page: ${page}`)
      const res = await this.client.reposListForAuthenticatedUser({
        perPage,
        page,
      })

      if (res.status !== 200) {
        console.info(res)
        throw new Error("failed to fetch repositories, page: " + page)
      }

      const body = await res.json()

      for (const repo of body) {
        yield repo
      }

      if (body.length >= perPage) {
        page++
      } else {
        break
      }
    }
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

    return null
  }

  private async checkAuth() {
    console.info(`checking authentication`)

    const res = await this.client.usersGetAuthenticated()

    if (res.status !== 200) {
      console.info(res)
      throw new Error("invalid auth!")
    }
  }
}
