// 단일 학교 상세 — getSchool(code)
import { useEffect, useState } from 'react'
import type { School } from '@/types/domain'
import { api } from './_api'

export interface UseSchoolResult {
  data: School | null
  loading: boolean
  error: Error | null
}

export function useSchool(code: string | undefined): UseSchoolResult {
  const [data, setData] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!code) {
      setData(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .getSchool(code)
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
  }, [code])

  return { data, loading, error }
}
