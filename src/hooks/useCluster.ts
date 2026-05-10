// 단일 클러스터 상세 조회
import { useEffect, useState } from 'react'
import type { Cluster } from '@/types/domain'
import { api } from './_api'

export interface UseClusterResult {
  data: Cluster | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useCluster(id: string | undefined): UseClusterResult {
  const [data, setData] = useState<Cluster | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .getCluster(id)
      .then((row) => {
        if (cancelled) return
        setData(row)
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
  }, [id, reloadKey])

  return { data, loading, error, reload: () => setReloadKey((k) => k + 1) }
}
