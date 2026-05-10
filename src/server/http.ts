// 외부 API 호출 공용 fetch — 재시도(exponential backoff) + 타임아웃.

export interface FetchWithRetryOptions {
  retries?: number          // 기본 3
  baseDelayMs?: number      // 기본 500
  timeoutMs?: number        // 기본 10000
  init?: RequestInit
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const retries = options.retries ?? 3
  const base = options.baseDelayMs ?? 500
  const timeout = options.timeoutMs ?? 10_000

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctl = new AbortController()
      const timer = setTimeout(() => ctl.abort(), timeout)
      const res = await fetch(url, { ...options.init, signal: ctl.signal })
      clearTimeout(timer)
      if (res.status >= 500 && attempt < retries) {
        // 서버 에러는 재시도
        await wait(base * 2 ** attempt)
        continue
      }
      return res
    } catch (e) {
      lastError = e
      if (attempt < retries) {
        await wait(base * 2 ** attempt)
        continue
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`fetch failed after ${retries} retries: ${url}`)
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
