// 앱 루트 — P02 디자인 시스템 시각 검증 페이지. P03 에서 React Router 로 교체 예정.
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { StatNumber } from '@/components/typography/StatNumber'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

function App() {
  return (
    <>
      <Header />
      <PageShell>
        <SectionTitle>
          Vol. 01 — 2026.01.03 — 04.30 — Public Interest Monitor
        </SectionTitle>

        <DisplayHeading className="mt-6">
          <span className="italic">Ghost bidders</span>
          <br />
          in our school cafeterias.
        </DisplayHeading>

        <p className="mt-6 text-xl font-serif-kr text-ink-dim max-w-2xl leading-relaxed">
          우리 아이들 식탁 뒤에 숨은 분신 응찰을 추적합니다.
        </p>

        <hr className="my-12 border-line" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-line py-8">
          <div>
            <SectionTitle>의심 클러스터</SectionTitle>
            <div className="mt-3">
              <StatNumber value="—" unit="개" />
            </div>
          </div>
          <div>
            <SectionTitle>관찰 사업자</SectionTitle>
            <div className="mt-3">
              <StatNumber value="—" unit="명" />
            </div>
          </div>
          <div>
            <SectionTitle>합산 낙찰액</SectionTitle>
            <div className="mt-3">
              <StatNumber value="—" unit="억원" />
            </div>
          </div>
          <div>
            <SectionTitle>평균 분신 배수</SectionTitle>
            <div className="mt-3">
              <StatNumber value="—" unit="×" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <SectionTitle>Badges</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="high">고위험</Badge>
              <Badge variant="mid">중간</Badge>
              <Badge variant="low">관찰</Badge>
              <Badge variant="neutral">중립</Badge>
            </div>
          </Card>
          <Card>
            <SectionTitle>Buttons</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Card>
          <Card>
            <SectionTitle>Input</SectionTitle>
            <div className="mt-4">
              <Input placeholder="사업자번호 · 상호 · 학교명" />
            </div>
          </Card>
          <Card>
            <SectionTitle>Sample disclaimer</SectionTitle>
            <p className="mt-4 text-xs text-ink-faint leading-relaxed">
              본 정보는 공개정보 통계 결합으로 산출된 추정이며 위법 단정이 아닙니다.
              이의제기 24시간 내 비공개 처리됩니다.
            </p>
          </Card>
        </div>

        <p className="mt-16 text-ink-faint font-mono text-[10px] uppercase tracking-[0.2em]">
          P02 디자인 시스템 — 다음 P03 라우팅 + 페이지 골격
        </p>
      </PageShell>
      <Footer />
    </>
  )
}

export default App
