// 판례 상세 — P09 에서 사건 메타·증거·매칭 클러스터로 채워질 placeholder
import { useParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <PageShell>
      <DisplayHeading as="h1">Case {id}</DisplayHeading>
    </PageShell>
  )
}
