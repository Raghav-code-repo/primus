import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../api/errors'

export interface AsyncResource<T> {
  /** The loaded value, or null while the request has not succeeded yet. */
  data: T | null
  /** True while a request for the current query is running. */
  loading: boolean
  /** The message of the last failed request. */
  error: string | null
  /** The HTTP status of the last failed request, 0 for a network failure. */
  errorStatus: number | null
  /** Runs the request again. */
  reload: () => void
}

interface ResourceState<T> {
  /** The query the current result belongs to. */
  key: string
  data: T | null
  error: string | null
  errorStatus: number | null
}

/**
 * Loads a value from the backend and keeps the loading, empty and error state
 * in one place.
 *
 * The loading state is derived from the query the current result belongs to,
 * so a new request becomes visible immediately without setting state inside
 * the effect. A request that is still running when the component unmounts is
 * ignored instead of writing to an unmounted component.
 *
 * The loader has to keep its identity, otherwise the request would restart on
 * every render. Use `useCallback` for it.
 */
export function useAsyncResource<T>(
  loader: () => Promise<T>,
  queryKey: string,
  errorMessage: string,
): AsyncResource<T> {
  const [reloadToken, setReloadToken] = useState(0)
  const requestKey = `${queryKey}#${reloadToken}`

  const [state, setState] = useState<ResourceState<T>>({
    key: '',
    data: null,
    error: null,
    errorStatus: null,
  })

  useEffect(() => {
    let active = true

    loader()
      .then((data) => {
        if (!active) {
          return
        }
        setState({ key: requestKey, data, error: null, errorStatus: null })
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setState({
          key: requestKey,
          data: null,
          error:
            error instanceof ApiError ? error.message : errorMessage,
          errorStatus: error instanceof ApiError ? error.status : 0,
        })
      })

    return () => {
      active = false
    }
  }, [errorMessage, loader, requestKey])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  return {
    data: state.key === requestKey ? state.data : null,
    loading: state.key !== requestKey,
    error: state.key === requestKey ? state.error : null,
    errorStatus: state.key === requestKey ? state.errorStatus : null,
    reload,
  }
}
