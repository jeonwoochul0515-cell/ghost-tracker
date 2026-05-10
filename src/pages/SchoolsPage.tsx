// 학교별 보기 — P08 에서 부산 지도·학교 마커로 채워질 placeholder
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'

export function SchoolsPage() {
  return (
    <PageShell>
      <DisplayHeading as="h1">Schools</DisplayHeading>
    </PageShell>
  )
}
