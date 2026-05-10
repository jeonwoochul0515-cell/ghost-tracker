// 대시보드 — P05 mock 데이터 로드 검증용 placeholder. P06 에서 클러스터 카드/통계로 교체.
import { useEffect } from 'react'
import { useClusters } from '@/hooks/useClusters'
import { isUsingMock } from '@/hooks/_api'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'

export function DashboardPage() {
  const { data, loading, error } = useClusters()

  useEffect(() => {
    if (data) {
      console.info(
        `[Ghost Tracker] mode=${isUsingMock ? 'mock' : 'live'} · clusters=${data.length}`,
      )
    }
    if (error) {
      console.error('[Ghost Tracker] hook error:', error)
    }
  }, [data, error])

  return (
    <PageShell>
      <SectionTitle>{isUsingMock ? 'Mock mode' : 'Live data'}</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Dashboard
      </DisplayHeading>
      <p className="mt-6 text-ink-dim font-mono text-xs uppercase tracking-[0.2em]">
        {loading
          ? '로딩 중...'
          : error
            ? `에러: ${error.message}`
            : data
              ? `의심 클러스터 ${data.length}건 로드 완료`
              : '데이터 없음'}
      </p>
    </PageShell>
  )
}
