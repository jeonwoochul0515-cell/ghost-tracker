// 판례 목록 — 인자 없음 (필터는 P09 에서 클라이언트 측에서 적용 예정)
import { useEffect, useState } from 'react'
import type { CourtCase } from '@/types/domain'
import { api } from './_api'

export interface UseCasesResult {
  data: CourtCase[] | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useCases(): UseCasesResult {
  const [data, setData] = useState<CourtCase[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .listCourtCases()
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
  }, [reloadKey])

  return { data, loading, error, reload: () => setReloadKey((k) => k + 1) }
}
