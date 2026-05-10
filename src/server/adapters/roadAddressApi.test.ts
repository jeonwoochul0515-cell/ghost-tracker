// roadAddressApi 어댑터 — 캐시 + JUSO + VWorld 폴백
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCache, normalize } from './roadAddressApi'

const ORIGINAL_FETCH = globalThis.fetch
const ORIGINAL_ENV = process.env

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV }
  clearCache()
})

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  process.env = ORIGINAL_ENV
  vi.restoreAllMocks()
})

describe('roadAddressApi.normalize', () => {
  it('JUSO 정상 응답 → 도로명·지번·건물ID', async () => {
    process.env.JUSO_API_KEY = 'JUSO_KEY'
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: {
            juso: [
              {
                roadAddr: '부산광역시 동래구 가상로 11',
                jibunAddr: '부산광역시 동래구 거제동 123-4',
                bdMgtSn: 'BLD-001',
                zipNo: '12345',
                siNm: '부산광역시',
                sggNm: '동래구',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )
    const r = await normalize('부산 동래구 가상로 11번길')
    expect(r?.roadAddr).toBe('부산광역시 동래구 가상로 11')
    expect(r?.source).toBe('juso')
    expect(r?.buildingId).toBe('BLD-001')
  })

  it('두 번째 호출은 캐시 (source=cache)', async () => {
    process.env.JUSO_API_KEY = 'JUSO_KEY'
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: { juso: [{ roadAddr: '부산광역시 동래구 가상로 11' }] },
        }),
        { status: 200 },
      ),
    )
    globalThis.fetch = fetchMock
    await normalize('부산 동래구 가상로 11번길')
    const second = await normalize('부산 동래구 가상로 11번길')
    expect(second?.source).toBe('cache')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('JUSO 실패 + VWorld 폴백', async () => {
    process.env.JUSO_API_KEY = 'JUSO_KEY'
    process.env.VWORLD_API_KEY = 'VWORLD_KEY'
    globalThis.fetch = vi.fn(async (url) => {
      const u = String(url)
      if (u.includes('juso.go.kr')) {
        throw new Error('juso down')
      }
      return new Response(
        JSON.stringify({
          response: {
            status: 'OK',
            refined: { text: '부산광역시 동래구 가상로 11' },
          },
        }),
        { status: 200 },
      )
    })
    const r = await normalize('부산 동래구 가상로 11번길')
    expect(r?.source).toBe('vworld')
  })

  it('두 키 모두 없으면 throw', async () => {
    delete process.env.JUSO_API_KEY
    delete process.env.VWORLD_API_KEY
    await expect(normalize('부산 동래구')).rejects.toThrow(/JUSO_API_KEY 또는 VWORLD_API_KEY/)
  })
})
