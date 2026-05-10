// 어댑터 환경변수 검증 — 누락 시 명확한 에러 메시지.
// process.env / Deno.env 양쪽에서 동작 (런타임 감지).

function readEnv(key: string): string | undefined {
  // Deno 우선 (Edge Function 런타임)
  // @ts-expect-error — Deno is not typed in Vite tsc
  if (typeof Deno !== 'undefined' && typeof Deno.env?.get === 'function') {
    // @ts-expect-error
    return Deno.env.get(key)
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key]
  }
  return undefined
}

export function requireEnv(key: string): string {
  const value = readEnv(key)
  if (!value) {
    throw new Error(
      `[ghost-tracker] 환경변수 ${key} 가 누락되었습니다. .env 또는 supabase secrets 에 등록하세요.`,
    )
  }
  return value
}

export function optionalEnv(key: string): string | undefined {
  return readEnv(key)
}
