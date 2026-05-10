// 학교 상세 — P08 에서 단골 응찰자·안전성 지수로 채워질 placeholder
import { useParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'

export function SchoolDetailPage() {
  const { code } = useParams<{ code: string }>()
  return (
    <PageShell>
      <DisplayHeading as="h1">School {code}</DisplayHeading>
    </PageShell>
  )
}
