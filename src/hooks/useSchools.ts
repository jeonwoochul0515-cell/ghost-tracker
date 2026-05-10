// 학교 목록 — district / query / limit 필터 지원
import { useEffect, useState } from 'react'
import type { School } from '@/types/domain'
import type { ListSchoolsFilters } from '@/lib/supabase'
import { api } from './_api'

export interface UseSchoolsResult {
  data: School[] | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useSchools(
  filters: ListSchoolsFilters = {},
): UseSchoolsResult {
  const [data, setData] = useState<School[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .listSchools(JSON.parse(filtersKey))
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
