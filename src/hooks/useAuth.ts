// 관리자 인증 — Supabase Auth (이메일 매직링크). admin 역할만 통과.
import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isUsingMock } from './_api'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (isUsingMock) {
      // mock 모드 — 로컬 admin@ghost-tracker.local 매직 user
      const mockAdmin: Partial<User> = {
        id: 'mock-admin',
        email: 'admin@ghost-tracker.local',
        app_metadata: { role: 'admin' },
        user_metadata: {},
      }
      const stored = localStorage.getItem('mockAdminSignedIn')
      if (stored === '1' && !cancelled) {
        setUser(mockAdmin as User)
      }
      setLoading(false)
      return
    }
    // 실제 Supabase 모드: 세션 복원은 후속 작업 (P15 admin 본격 구현 시점에 supabase.auth.getSession 연결).
    setLoading(false)
    return () => {
      cancelled = true
    }
  }, [])

  async function signInWithMagicLink(email: string): Promise<{ error?: string }> {
    if (isUsingMock) {
      // mock — 매직링크 없이 즉시 admin 로그인 (시연용)
      if (!email.endsWith('@ghost-tracker.local')) {
        return { error: 'mock 모드는 *@ghost-tracker.local 만 허용 (시연용)' }
      }
      localStorage.setItem('mockAdminSignedIn', '1')
      const mockAdmin: Partial<User> = {
        id: 'mock-admin',
        email,
        app_metadata: { role: 'admin' },
        user_metadata: {},
      }
      setUser(mockAdmin as User)
      return {}
    }
    // 실제 모드: supabase.auth.signInWithOtp({ email })
    return { error: '실제 모드는 Supabase 환경 설정 필요' }
  }

  async function signOut(): Promise<void> {
    if (isUsingMock) {
      localStorage.removeItem('mockAdminSignedIn')
      setUser(null)
      return
    }
  }

  const isAdmin =
    user?.app_metadata?.role === 'admin' ||
    user?.email?.endsWith('@ghost-tracker.local') === true

  return {
    user,
    session,
    loading,
    isAdmin,
    signInWithMagicLink,
    signOut,
  }
}
