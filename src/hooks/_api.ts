// hooks 내부 셀렉터 — VITE_USE_MOCK 또는 Supabase 환경변수 부재 시 mockApi 자동 선택.
// 직접 import 하지 말고 hooks 를 통해서만 접근.
import * as mockApi from '@/lib/mockApi'
import * as realApi from '@/lib/supabase'

const shouldUseMock =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY

export const api = shouldUseMock ? mockApi : realApi
export const isUsingMock = shouldUseMock
