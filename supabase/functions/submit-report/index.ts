// submit-report — 제보·이의제기 INSERT + 관리자 알림 자리(P15 에서 Slack/이메일)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serviceClient } from '../_shared/supabase.ts'
import { log } from '../_shared/log.ts'
import { jsonResponse, preflight } from '../_shared/response.ts'

interface SubmitReportPayload {
  type?: 'tip' | 'objection'
  targetClusterId?: string
  targetBizNo?: string
  content?: string
  contactEmail?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight()
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method not allowed' }, 405)
  }

  try {
    const body = (await req.json()) as SubmitReportPayload

    if (
      body.type !== 'tip' && body.type !== 'objection'
    ) {
      return jsonResponse({ error: 'invalid type' }, 400)
    }
    if (!body.content || body.content.length < 10) {
      return jsonResponse({ error: 'content too short' }, 400)
    }

    const { data, error } = await serviceClient
      .from('reports')
      .insert({
        type: body.type,
        target_cluster_id: body.targetClusterId ?? null,
        target_bizno: body.targetBizNo ?? null,
        content: body.content,
        contact_email: body.contactEmail ?? null,
      })
      .select('id, status, type, created_at')
      .single()

    if (error) throw error

    log('info', 'report submitted', { id: data.id, type: data.type })

    // TODO(P15): 관리자 알림 (Slack/이메일). 이의제기는 24h SLA 시작.

    return jsonResponse(data, 200)
  } catch (e) {
    log('error', 'submit-report failed', { error: String(e) })
    return jsonResponse({ error: 'internal error' }, 500)
  }
})
