// eatApi 어댑터 — 정상/에러/빈 결과 모킹 테스트
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listBids } from './eatApi'

const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_PROCESS_ENV = process.env

beforeEach(() => {
  process.env = {
    ...ORIGINAL_PROCESS_ENV,
    EAT_SERVICE_KEY: 'TEST_KEY',
  }
})

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  process.env = ORIGINAL_PROCESS_ENV
  vi.restoreAllMocks()
})

describe('eatApi.listBids', () => {
  it('정상 응답 → Bid[] 매핑', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          response: {
            body: {
              items: {
                item: [
                  {
                    bidId: 'BID-001',
                    schoolCode: 'PSN-001',
                    schoolName: '학교A',
                    district: '동래구',
                    bidDate: '2026-04-01',
                    announceDate: '2026-04-04',
                    category: '채소',
                    estimatedPrice: 12_000_000,
                    winnerBizNo: '9991100001',
                    participants: ['9991100001', '9991100002'],
                  },
                ],
              },
            },
          },
        }),
        { status: 200 },
      ),
    )
    const result = await listBids()
    expect(result).toHaveLength(1)
    expect(result[0].bidId).toBe('BID-001')
    expect(result[0].participants).toEqual(['9991100001', '9991100002'])
  })

  it('빈 결과 → 빈 배열', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ response: { body: {} } }), { status: 200 }),
    )
    expect(await listBids()).toEqual([])
  })

  it('서비스키 미활성(401) → 명확한 에러', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('UNAUTHORIZED', { status: 401 }),
    )
    await expect(listBids()).rejects.toThrow(/eaT 서비스키/)
  })

  it('환경변수 누락 → requireEnv 에러', async () => {
    delete process.env.EAT_SERVICE_KEY
    await expect(listBids()).rejects.toThrow(/EAT_SERVICE_KEY/)
  })
})
