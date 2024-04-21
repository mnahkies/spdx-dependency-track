import {ApiClient} from "@/generated/clients/client"
import {t_ScanRepositoriesBodySchema} from "@/generated/models"
import {
  MutateOptions,
  UseMutationOptions,
  queryOptions,
} from "@tanstack/react-query"
import {createContext, useContext} from "react"

export const QueryOptionsContext = createContext<ReturnType<
  typeof createQueryOptions
> | null>(null)

export const createQueryOptions = (fetchClient: ApiClient) => {
  return {
    getLicenses() {
      return queryOptions({
        queryKey: ["getLicenses"],
        queryFn: async () => {
          const res = await fetchClient.getLicenses()
          if (res.status !== 200) {
            throw new Error("request failed", {
              cause: new Error(await res.text()),
            })
          }
          return await res.json()
        },
      })
    },

    getRepositorySummaries: () => {
      return queryOptions({
        queryKey: ["getRepositorySummaries"],
        queryFn: async () => {
          const res = await fetchClient.getRepositorySummaries()
          if (res.status !== 200) {
            throw new Error("request failed", {
              cause: new Error(await res.text()),
            })
          }
          return await res.json()
        },
      })
    },

    scanGithubRepositories: (): UseMutationOptions<
      void,
      Error,
      t_ScanRepositoriesBodySchema
    > => {
      return {
        mutationKey: ["scanGithubRepositories"],
        mutationFn: async (body: t_ScanRepositoriesBodySchema) => {
          const res = await fetchClient.scanRepositories({requestBody: body})

          if (res.status !== 204) {
            throw new Error("request failed", {
              cause: new Error(await res.text()),
            })
          }
        },
      }
    },
  }
}

export const useQueryOptions = () => {
  const v = useContext(QueryOptionsContext)

  if (!v) throw new Error("useQueryData must be used within client")

  return v
}
