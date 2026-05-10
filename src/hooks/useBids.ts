// 응찰·낙찰 이력 — bizNo / schoolCode 필터, 클러스터 카드 timeline·network 계산용
import { useEffect, useState } from 'react'
import type { Bid } from '@/types/domain'
import type { ListBidsFilters } from '@/lib/supabase'
import { api } from './_api'

export interface UseBidsResult {
  data: Bid[] | null
  loading: boolean
  error: Error | null
}

export function useBids(filters: ListBidsFilters = {}): UseBidsResult {
  const [data, setData] = useState<Bid[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .listBids(JSON.parse(filtersKey))
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
  }, [filtersKey])

  return { data, loading, error }
}
