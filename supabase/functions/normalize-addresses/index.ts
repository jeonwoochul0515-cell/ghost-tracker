// normalize-addresses — 도로명주소 API 로 businesses.address_normalized 채움.
// P13 의 src/server/adapters/roadAddressApi.ts 에서 실제 호출 + 24h 캐시.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()

  try {
    log('info', 'normalize-addresses invoked')

    // TODO(P13): SELECT businesses WHERE address_normalized IS NULL
    // → roadAddressApi.normalize(address) → UPDATE businesses

    return jsonResponse({ status: 'placeholder' }, 200)
  } catch (e) {
    log('error', 'normalize-addresses failed', { error: String(e) })
    return jsonResponse({ error: 'internal error' }, 500)
  }
})

void serviceClient
