// 도로명주소 어댑터 — business.juso.go.kr 검색 API + 24h 메모리 캐시.
// JUSO_API_KEY 가 없으면 VWORLD_API_KEY 폴백 (좌표만 변환).
import { optionalEnv } from '../env'
import { fetchWithRetry } from '../http'

const JUSO_BASE = 'https://business.juso.go.kr/addrlink/addrLinkApi.do'
const VWORLD_BASE = 'http://api.vworld.kr/req/address'

export interface NormalizedAddress {
  raw: string
  roadAddr: string                      // 도로명 주소
  jibunAddr?: string                    // 지번 주소
  buildingId?: string                   // 건물관리번호
  zipNo?: string
  district?: string                     // 시·군·구
  source: 'juso' | 'vworld' | 'cache'
}

interface CacheEntry {
  value: NormalizedAddress
  cachedAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 24 * 60 * 60 * 1000

/**
 * 주소 문자열을 도로명·지번·건물관리번호로 정규화.
 * 캐시 → JUSO → VWorld 순서.
 */
export async function normalize(rawAddress: string): Promise<NormalizedAddress | null> {
  const trimmed = rawAddress.trim()
  if (!trimmed) return null

  const cached = cache.get(trimmed)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return { ...cached.value, source: 'cache' }
  }

  const jusoKey = optionalEnv('JUSO_API_KEY')
  if (jusoKey) {
    try {
      const result = await callJuso(trimmed, jusoKey)
      if (result) {
        cache.set(trimmed, { value: result, cachedAt: Date.now() })
        return result
      }
    } catch (_) {
      // fall through to vworld
    }
  }

  const vworldKey = optionalEnv('VWORLD_API_KEY')
  if (vworldKey) {
    const result = await callVWorld(trimmed, vworldKey)
    if (result) {
      cache.set(trimmed, { value: result, cachedAt: Date.now() })
      return result
    }
  }

  if (!jusoKey && !vworldKey) {
    throw new Error(
      'JUSO_API_KEY 또는 VWORLD_API_KEY 중 하나는 필요합니다. .env 또는 supabase secrets 에 등록하세요.',
    )
  }
  return null
}

async function callJuso(
  raw: string,
  key: string,
): Promise<NormalizedAddress | null> {
  const url = `${JUSO_BASE}?confmKey=${encodeURIComponent(key)}&currentPage=1&countPerPage=1&keyword=${encodeURIComponent(raw)}&resultType=json`
  const res = await fetchWithRetry(url, { timeoutMs: 10_000 })
  if (!res.ok) return null
  const json = (await res.json()) as {
    results?: { juso?: Array<Record<string, unknown>> }
  }
  const item = json.results?.juso?.[0]
  if (!item) return null
  return {
    raw,
    roadAddr: String(item.roadAddr ?? ''),
    jibunAddr: item.jibunAddr ? String(item.jibunAddr) : undefined,
    buildingId: item.bdMgtSn ? String(item.bdMgtSn) : undefined,
    zipNo: item.zipNo ? String(item.zipNo) : undefined,
    district: item.siNm && item.sggNm
      ? `${item.siNm} ${item.sggNm}`
      : undefined,
    source: 'juso',
  }
}

async function callVWorld(
  raw: string,
  key: string,
): Promise<NormalizedAddress | null> {
  // VWorld 는 주로 지오코더. 정규화는 부분적.
  const url = `${VWORLD_BASE}?service=address&request=getCoord&key=${encodeURIComponent(key)}&address=${encodeURIComponent(raw)}&type=ROAD&format=json`
  const res = await fetchWithRetry(url, { timeoutMs: 10_000 })
  if (!res.ok) return null
  const json = (await res.json()) as {
    response?: { status?: string; refined?: { text?: string } }
  }
  if (json.response?.status !== 'OK') return null
  return {
    raw,
    roadAddr: json.response.refined?.text ?? raw,
    source: 'vworld',
  }
}

/** 캐시 강제 비우기 (테스트용). */
export function clearCache(): void {
  cache.clear()
}
