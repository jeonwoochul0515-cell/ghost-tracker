// 판례 상세 — 메타 + 사실관계 구조화 + 증거 + 매칭 클러스터 + 형량 + 외부 링크
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/hooks/_api'
import { useClusters } from '@/hooks/useClusters'
import type { CourtCase } from '@/types/domain'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { MatchedClustersForCase } from '@/features/cases/MatchedClustersForCase'
import {
  inferCharges,
  inferPatterns,
  inferYear,
} from '@/features/cases/classify'

const VERDICT_VARIANT: Record<
  CourtCase['verdict'],
  'high' | 'mid' | 'low' | 'neutral'
> = {
  유죄: 'high',
  일부유죄: 'mid',
  무죄: 'low',
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const decoded = id ? decodeURIComponent(id) : undefined
  const [data, setData] = useState<CourtCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { data: clusters } = useClusters()

  useEffect(() => {
    if (!decoded) return
    let cancelled = false
    setLoading(true)
    api
      .getCourtCase(decoded)
      .then((row) => {
        if (cancelled) return
        setData(row)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [decoded])

  const tags = useMemo(() => {
    if (!data) return { charges: [] as string[], patterns: [] as string[] }
    return { charges: inferCharges(data), patterns: inferPatterns(data) }
  }, [data])

  if (loading) {
    return (
      <PageShell>
        <p className="text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
          로딩 중...
        </p>
      </PageShell>
    )
  }

  if (error || !data) {
    return (
      <PageShell>
        <SectionTitle>오류</SectionTitle>
        <DisplayHeading as="h1" className="mt-3">
          판례를 찾을 수 없습니다
        </DisplayHeading>
        <p className="mt-6 text-ink-dim">
          {error?.message ?? `ID "${decoded}" 에 해당하는 판례가 없습니다.`}
        </p>
        <Link
          to="/cases"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-accent"
        >
          ← 판례 목록으로
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* 사건 메타 */}
      <section className="border-b border-line pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
          {data.court} · {data.date} · {inferYear(data)}년
        </p>
        <DisplayHeading as="h1" className="mt-3">
          {data.id}
        </DisplayHeading>
        <p className="mt-4 text-xl font-serif-kr text-ink-dim leading-relaxed max-w-3xl">
          {data.summary}
        </p>
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <Badge variant={VERDICT_VARIANT[data.verdict]}>{data.verdict}</Badge>
          {tags.charges.map((ch) => (
            <span
              key={ch}
              className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border border-line text-ink-dim"
            >
              {ch}
            </span>
          ))}
        </div>
      </section>

      {/* 사실관계 구조화 */}
      <section className="mt-12">
        <SectionTitle>사실관계</SectionTitle>
        <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              분신 사업자 수
            </dt>
            <dd className="mt-1 font-display font-black text-3xl tabular-nums text-ink">
              {data.pattern.shellCount}
              <span className="ml-1 font-mono text-xs uppercase text-ink-dim">개</span>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              관계
            </dt>
            <dd className="mt-1 text-ink">{data.pattern.relationship}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              주소·연락처 공유
            </dt>
            <dd className="mt-1 text-ink space-x-2">
              <Badge variant={data.pattern.sharedAddress ? 'high' : 'neutral'}>
                주소 {data.pattern.sharedAddress ? '공유' : '미공유'}
              </Badge>
              <Badge variant={data.pattern.sharedPhone ? 'high' : 'neutral'}>
                연락처 {data.pattern.sharedPhone ? '공유' : '미공유'}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              주된 수법
            </dt>
            <dd className="mt-1 text-ink">{data.pattern.method}</dd>
          </div>
          {tags.patterns.length > 0 && (
            <div className="md:col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                패턴 태그
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {tags.patterns.map((p) => (
                  <span
                    key={p}
                    className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border border-warning/40 text-warning"
                  >
                    {p}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* 증거 */}
      <section className="mt-12">
        <SectionTitle>검찰 증거</SectionTitle>
        <ul className="mt-4 space-y-2 text-sm">
          {data.evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mt-1.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-ink-dim leading-relaxed flex-1">{e}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 형량 */}
      <section className="mt-12">
        <SectionTitle>형량 / 추징</SectionTitle>
        <Card className="mt-4 p-6">
          <p className="font-display italic font-black text-2xl text-ink">
            {data.sentence}
          </p>
        </Card>
      </section>

      {/* 매칭 클러스터 */}
      <section className="mt-16">
        <SectionTitle>이 판례 패턴과 유사한 클러스터</SectionTitle>
        <div className="mt-6">
          <MatchedClustersForCase c={data} clusters={clusters ?? []} />
        </div>
      </section>

      {/* 외부 판결문 */}
      {data.fullTextUrl && (
        <section className="mt-12">
          <a
            href={data.fullTextUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-xs uppercase tracking-[0.2em] text-accent hover:underline"
          >
            판결문 외부 링크 ↗
          </a>
        </section>
      )}

      {/* 면책 */}
      <section className="mt-16 pt-8 border-t border-line">
        <p className="text-xs text-ink-faint leading-relaxed max-w-3xl">
          본 판례 데이터는 시드 단계에서 (가상) 표기된 가짜 사건입니다. 실제 판례
          연결은 사법정보공유포털 API 인가 후 진행됩니다. 매칭 클러스터는
          통계적 유사성이며 위법 단정이 아닙니다.
        </p>
      </section>
    </PageShell>
  )
}
