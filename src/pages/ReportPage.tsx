// 제보·이의제기 — 탭 2개. 이의제기는 ?cluster_id= 가 있으면 해당 탭으로 자동 진입.
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/Tabs'
import { TipForm } from '@/features/reports/TipForm'
import { ObjectionForm } from '@/features/reports/ObjectionForm'

export function ReportPage() {
  const [params] = useSearchParams()
  const initialClusterId = params.get('cluster_id') ?? ''
  const initialTab = initialClusterId ? 'objection' : 'tip'

  return (
    <PageShell>
      <SectionTitle>제보 / 이의제기</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Report
      </DisplayHeading>
      <p className="mt-3 text-ink-dim max-w-2xl leading-relaxed">
        분신술·담합·리베이트 등 학교급식 시장의 부조리를 제보하거나, 본 도구의
        매칭이 잘못되었다고 판단되시면 이의제기를 접수해주세요. 모든 접수는
        운영진이 검토 후 비공개로 처리됩니다.
      </p>

      <div className="mt-10">
        <Tabs defaultValue={initialTab}>
          <TabsList>
            <TabsTrigger value="tip">제보하기</TabsTrigger>
            <TabsTrigger value="objection">이의제기</TabsTrigger>
          </TabsList>
          <TabsContent value="tip" className="pt-8">
            <TipForm />
          </TabsContent>
          <TabsContent value="objection" className="pt-8">
            <ObjectionForm initialClusterId={initialClusterId} />
          </TabsContent>
        </Tabs>
      </div>

      <p className="mt-16 pt-8 border-t border-line text-xs text-ink-faint leading-relaxed max-w-3xl">
        제보·이의제기는 운영진(법무법인 청송 협력)이 검토하며, 이의제기는
        24시간 이내에 처리됩니다. 처리 결과는 입력하신 연락처로 통보됩니다.
        허위·악의적 제보는 법적 책임을 질 수 있으니 신중히 작성해주세요.
      </p>
    </PageShell>
  )
}
