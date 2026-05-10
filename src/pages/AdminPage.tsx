// 관리자 페이지 — 매직링크 로그인 + 제보 큐 + 가중치 튜닝 + 화이트리스트 + 적재 로그
import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/Tabs'
import { ALL_SIGNALS } from '@/features/scoring/signals'
import { reportsSeed } from '@/lib/seed/reports'
import type { Report } from '@/types/domain'
import { cn } from '@/lib/cn'

export function AdminPage() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [signInError, setSignInError] = useState<string | null>(null)

  if (auth.loading) {
    return (
      <PageShell>
        <p className="text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
          로딩 중...
        </p>
      </PageShell>
    )
  }

  if (!auth.isAdmin) {
    return (
      <PageShell>
        <div className="max-w-md">
          <SectionTitle>관리자 로그인</SectionTitle>
          <DisplayHeading as="h1" className="mt-3">
            Admin
          </DisplayHeading>
          <p className="mt-4 text-ink-dim leading-relaxed">
            admin 권한이 부여된 이메일로 매직링크를 받으시면 로그인됩니다.
            mock 모드에서는 <code className="font-mono text-ink">*@ghost-tracker.local</code> 형식 임의 이메일로 즉시 진입.
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const { error } = await auth.signInWithMagicLink(email)
              setSignInError(error ?? null)
            }}
          >
            <Input
              type="email"
              required
              placeholder="admin@ghost-tracker.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit">매직링크 받기</Button>
            {signInError && (
              <p className="text-sm text-danger">{signInError}</p>
            )}
          </form>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <SectionTitle>{auth.user?.email}</SectionTitle>
          <DisplayHeading as="h1" className="mt-3">
            Admin
          </DisplayHeading>
        </div>
        <Button variant="ghost" size="sm" onClick={() => auth.signOut()}>
          로그아웃
        </Button>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">제보 큐</TabsTrigger>
            <TabsTrigger value="signals">신호 튜닝</TabsTrigger>
            <TabsTrigger value="whitelist">화이트리스트</TabsTrigger>
            <TabsTrigger value="logs">적재 로그</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="pt-8">
            <ReportsQueue />
          </TabsContent>
          <TabsContent value="signals" className="pt-8">
            <SignalTuner />
          </TabsContent>
          <TabsContent value="whitelist" className="pt-8">
            <WhitelistManager />
          </TabsContent>
          <TabsContent value="logs" className="pt-8">
            <IngestionLogs />
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  )
}

// ─── 제보 큐 ──────────────────────────────────────────────────────────
function ReportsQueue() {
  const [reports, setReports] = useState<Report[]>(reportsSeed)
  const [statusFilter, setStatusFilter] = useState<Report['status'] | 'all'>('all')

  const filtered = useMemo(() => {
    return statusFilter === 'all'
      ? reports
      : reports.filter((r) => r.status === statusFilter)
  }, [reports, statusFilter])

  function updateStatus(id: string, next: Report['status']) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <SectionTitle>제보·이의제기 ({filtered.length})</SectionTitle>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Report['status'] | 'all')}
          className="h-8 bg-bg border border-line px-3 text-xs text-ink font-mono"
        >
          <option value="all">전체</option>
          <option value="received">접수</option>
          <option value="reviewing">검토 중</option>
          <option value="resolved">처리 완료</option>
        </select>
      </div>
      {filtered.length === 0 && (
        <p className="text-ink-faint font-mono text-xs">처리할 항목이 없습니다.</p>
      )}
      <div className="space-y-4">
        {filtered.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span className="text-ink">{r.id}</span>
                <Badge variant={r.type === 'tip' ? 'mid' : 'high'}>
                  {r.type === 'tip' ? '제보' : '이의제기'}
                </Badge>
                {r.targetClusterId && (
                  <span className="text-ink-faint">→ {r.targetClusterId}</span>
                )}
              </div>
              <span className="text-xs text-ink-faint font-mono">{r.createdAt}</span>
            </div>
            <p className="mt-3 text-sm text-ink-dim leading-relaxed">{r.content}</p>
            {r.contactEmail && (
              <p className="mt-2 text-xs text-ink-faint">{r.contactEmail}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-line/50">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mr-2">
                상태:
              </span>
              {(['received', 'reviewing', 'resolved'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(r.id, s)}
                  className={cn(
                    'px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] border transition-colors',
                    r.status === s
                      ? 'text-accent border-accent'
                      : 'text-ink-dim border-line hover:text-ink',
                  )}
                >
                  {s === 'received' ? '접수' : s === 'reviewing' ? '검토중' : '처리완료'}
                </button>
              ))}
              <span className="ml-auto">
                <a
                  href="mailto:lawyer@chungsong.com?subject=클러스터 법적 검토 요청"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent hover:underline"
                >
                  변호사 검토 요청 →
                </a>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── 신호 튜닝 ────────────────────────────────────────────────────────
function SignalTuner() {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const s of ALL_SIGNALS) init[s.id] = s.weight
    return init
  })

  const total = useMemo(
    () => Object.values(weights).reduce((s, w) => s + w, 0),
    [weights],
  )

  function updateWeight(id: string, value: number) {
    setWeights((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-baseline justify-between">
        <SectionTitle>신호 가중치 튜닝</SectionTitle>
        <span className="font-mono text-xs text-ink-faint">합계 {total} (실제 점수는 100 클램프)</span>
      </div>
      <p className="text-sm text-ink-faint">
        본 화면의 변경은 미리보기 전용입니다. 실제 적용은 src/features/scoring/signals.ts 의
        상단 상수 수정 + 배포가 필요합니다 (P11 의 의도적 결정).
      </p>
      <ul className="space-y-3">
        {ALL_SIGNALS.map((s) => (
          <li key={s.id} className="grid grid-cols-[1fr_120px_60px] items-center gap-4">
            <div>
              <p className="text-sm text-ink">{s.name}</p>
              <p className="text-xs text-ink-faint mt-0.5">{s.id}</p>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={weights[s.id]}
              onChange={(e) => updateWeight(s.id, Number(e.target.value))}
              className="accent-accent"
            />
            <span className="font-mono text-sm text-accent text-right">
              {weights[s.id]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── 화이트리스트 ──────────────────────────────────────────────────────
function WhitelistManager() {
  const [items, setItems] = useState<{ address: string; reason: string }[]>([
    { address: '부산광역시 강서구 가상시장로 1', reason: '도매시장 — 다수 사업자 정상 입점' },
  ])
  const [newAddr, setNewAddr] = useState('')
  const [newReason, setNewReason] = useState('')

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionTitle>화이트리스트 주소</SectionTitle>
      <p className="text-sm text-ink-faint">
        도매시장·집합건물 등 동일주소 신호의 false positive 를 회피하기 위한
        주소를 등록합니다.
      </p>
      <form
        className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!newAddr.trim()) return
          setItems((prev) => [...prev, { address: newAddr.trim(), reason: newReason.trim() || '—' }])
          setNewAddr('')
          setNewReason('')
        }}
      >
        <Input
          placeholder="정규화 주소"
          value={newAddr}
          onChange={(e) => setNewAddr(e.target.value)}
        />
        <Input
          placeholder="사유"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
        />
        <Button type="submit" size="sm">추가</Button>
      </form>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">주소</th>
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">사유</th>
            <th className="py-3 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal w-20"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={`${item.address}-${i}`} className="border-b border-line/50">
              <td className="py-3 pr-4 text-ink">{item.address}</td>
              <td className="py-3 pr-4 text-ink-dim">{item.reason}</td>
              <td className="py-3 pl-4 text-right">
                <button
                  type="button"
                  onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-danger hover:underline"
                >
                  제거
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── 적재 로그 ────────────────────────────────────────────────────────
function IngestionLogs() {
  // 실제 환경에서는 supabase.from('functions_logs') 또는 Edge Functions 로그 조회.
  const sample = [
    { ts: '2026-05-10 06:00:12', fn: 'ingest-eat', status: 'ok', detail: '신규 입찰 23건 / 갱신 7건' },
    { ts: '2026-05-10 06:01:04', fn: 'normalize-addresses', status: 'ok', detail: '정규화 18건' },
    { ts: '2026-05-10 03:00:05', fn: 'recompute-clusters', status: 'placeholder', detail: 'P13 어댑터 후 실 적재' },
    { ts: '2026-05-09 06:00:09', fn: 'ingest-eat', status: 'warn', detail: 'eaT API 응답 지연 — 재시도 1회' },
  ]
  return (
    <div className="space-y-4 max-w-3xl">
      <SectionTitle>최근 Edge Function 실행</SectionTitle>
      <ul className="space-y-2 text-sm font-mono">
        {sample.map((row) => (
          <li
            key={`${row.ts}-${row.fn}`}
            className="grid grid-cols-[180px_180px_80px_1fr] gap-4 py-2 border-b border-line/50"
          >
            <span className="text-ink-dim text-xs">{row.ts}</span>
            <span className="text-ink">{row.fn}</span>
            <span
              className={cn(
                'text-xs uppercase',
                row.status === 'ok' && 'text-safe',
                row.status === 'warn' && 'text-warning',
                row.status === 'placeholder' && 'text-ink-faint',
              )}
            >
              {row.status}
            </span>
            <span className="text-ink-dim text-xs">{row.detail}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-faint">
        실제 운영에서는 Supabase Logs 또는 Sentry 대시보드 임베드.
      </p>
    </div>
  )
}
