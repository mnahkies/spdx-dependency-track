import {useCallback, useEffect, useMemo, useState} from "react"

export type PromiseResult<T> =
  | {data: T; loading: false; err: undefined; refetch: () => void}
  | {data: undefined; err: Error; loading: false; refetch: () => void}
  | {data: undefined; err: undefined; loading: true; refetch: () => void}

function usePromise<T>(
  promise: () => Promise<T>,
  initialFetchedState: false,
): PromiseResult<T>
function usePromise<T>(
  promise: () => Promise<T>,
  initialFetchedState: true,
): PromiseResult<T | undefined>
function usePromise<T>(
  promise: () => Promise<T>,
  initialFetchedState: boolean,
): PromiseResult<T | undefined> {
  const [fetched, setFetched] = useState(initialFetchedState)
  const [data, setData] = useState<T>()
  const [err, setErr] = useState<Error>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async function () {
      try {
        if (fetched) {
          return
        }

        setData(await promise())
        setErr(undefined)
      } catch (err) {
        setData(undefined)
        setErr(err as Error)
      } finally {
        setLoading(false)
        setFetched(true)
      }
    })()
  }, [fetched, promise])

  const refetch = useCallback(() => setFetched(false), [setFetched])

  return useMemo(() => {
    if (loading) {
      return {
        loading: true,
        data: undefined,
        err: undefined,
        refetch,
      }
    } else if (err) {
      return {loading: false, data: undefined, err, refetch}
    } else if (data) {
      return {loading: false, data, err: undefined, refetch}
    } else {
      return {loading: false, data: undefined, err: undefined, refetch}
    }
    throw new Error("unreachable")
  }, [data, loading, err, refetch])
}

export function useDeferredPromise<T>(
  promise: () => Promise<T>,
): PromiseResult<T | undefined> {
  return usePromise(promise, true)
}

export function useEagerPromise<T>(
  promise: () => Promise<T>,
): PromiseResult<T> {
  return usePromise(promise, false)
}
