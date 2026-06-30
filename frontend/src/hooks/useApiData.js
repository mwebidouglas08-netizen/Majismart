import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Fetches data from one or more API calls and tracks loading / error / empty state.
 *
 * @param {Function} fetcher - async () => data (can call api.get multiple times and return a combined object/array)
 * @param {Object} options
 * @param {Array} options.deps - dependency array to re-run the fetcher (default [])
 * @param {number} options.pollMs - if set, re-fetches in the background every N ms (no loading flicker)
 * @param {Function} options.isEmpty - (data) => boolean, defaults to checking array length / null
 */
export function useApiData(fetcher, { deps = [], pollMs = null, isEmpty } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async (background = false) => {
    if (!background) { setLoading(true); setError(null) }
    try {
      const result = await fetcherRef.current()
      setData(result)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to load data')
    } finally {
      if (!background) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(false)
    if (pollMs) {
      const id = setInterval(() => load(true), pollMs)
      return () => clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const empty = !loading && !error && (
    isEmpty ? isEmpty(data) : (Array.isArray(data) ? data.length === 0 : !data)
  )

  return { data, loading, error, empty, lastUpdated, refetch: () => load(false) }
}
