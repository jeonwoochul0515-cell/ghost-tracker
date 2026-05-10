// 구조화 로그 — Sentry/Datadog 등 collector 친화적 단일 라인 JSON.
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export function log(
  level: LogLevel,
  message: string,
  ctx: Record<string, unknown> = {},
): void {
  const line = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...ctx,
  })
  if (level === 'error' || level === 'warn') {
    console.error(line)
  } else {
    console.log(line)
  }
}
