// ntsApi 어댑터 — 상태 조회/검증
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { statusBatch } from './ntsApi'

const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_ENV = process.env

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, NTS_SERVICE_KEY: 'TEST_KEY' }
})

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  process.env = ORIGINAL_ENV
  vi.restoreAllMocks()
})

describe('ntsApi.statusBatch', () => {
  it('상태 코드 매핑 (01/02/03)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { b_no: '1234567890', b_stt_cd: '01', tax_type: '일반' },
            { b_no: '2234567890', b_stt_cd: '03', tax_type: '폐업', end_dt: '2024-06-30' },
          ],
        }),
        { status: 200 },
      ),
    )
    const result = await statusBatch(['1234567890', '2234567890'])
    expect(result).toHaveLength(2)
    expect(result[0].status).toBe('active')
    expect(result[1].status).toBe('closed')
    expect(result[1].closedDate).toBe('2024-06-30')
  })

  it('빈 입력 → 빈 결과 (외부 호출 없음)', async () => {
    globalThis.fetch = vi.fn()
    const result = await statusBatch([])
    expect(result).toEqual([])
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('서버 에러(500) → throw', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('boom', { status: 500 }))
    await expect(statusBatch(['1234567890'])).rejects.toThrow(/NTS status API/)
  })
})
