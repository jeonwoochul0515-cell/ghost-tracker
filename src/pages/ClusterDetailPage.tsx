// 클러스터 상세 — P07 에서 신호 패널·시계열·지도로 채워질 placeholder
import { useParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'

export function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <PageShell>
      <DisplayHeading as="h1">Cluster {id}</DisplayHeading>
    </PageShell>
  )
}
