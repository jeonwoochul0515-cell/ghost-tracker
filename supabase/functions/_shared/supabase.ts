// Edge Function 환경의 Supabase 서비스 클라이언트 — service role 키로 접근.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.0'

const url = Deno.env.get('SUPABASE_URL')
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!url || !serviceKey) {
  throw new Error(
    'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 누락되었습니다.',
  )
}

export const serviceClient = createClient(url, serviceKey, {
  auth: { persistSession: false },
})
