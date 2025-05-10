"use client"

import {
  QueryOptionsContext,
  createQueryOptions,
} from "@/app/providers/query-options"
import {ApiClient} from "@/generated/clients/client"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {ReactQueryStreamedHydration} from "@tanstack/react-query-next-experimental"
import type * as React from "react"
import {useState} from "react"

export function ClientProviders(props: {children: React.ReactNode}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
          },
        },
      }),
  )

  const [fetchClient] = useState(
    new ApiClient({
      basePath: "http://localhost:3000",
      defaultHeaders: {},
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <QueryOptionsContext.Provider
        value={createQueryOptions(fetchClient, queryClient)}
      >
        <ReactQueryStreamedHydration>
          {props.children}
        </ReactQueryStreamedHydration>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryOptionsContext.Provider>
    </QueryClientProvider>
  )
}
