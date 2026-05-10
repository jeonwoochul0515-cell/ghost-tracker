// 의심 클러스터 목록 — filterStore 와 호환되는 ListClustersFilters 받음
import { useEffect, useState } from 'react'
import type { Cluster } from '@/types/domain'
import type { ListClustersFilters } from '@/lib/supabase'
import { api } from './_api'

export interface UseClustersResult {
  data: Cluster[] | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useClusters(
  filters: ListClustersFilters = {},
): UseClustersResult {
  const [data, setData] = useState<Cluster[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .listClusters(JSON.parse(filtersKey))
      .then((rows) => {
        if (cancelled) return
        setData(rows)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filtersKey, reloadKey])

  return { data, loading, error, reload: () => setReloadKey((k) => k + 1) }
}
