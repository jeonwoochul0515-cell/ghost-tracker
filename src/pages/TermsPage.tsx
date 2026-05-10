// 이용약관 — 변호사 검토 후 확정 텍스트 (현재 초안)
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'

export function TermsPage() {
  return (
    <PageShell>
      <SectionTitle>이용약관 (초안)</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Terms
      </DisplayHeading>
      <div className="mt-8 max-w-3xl space-y-6 text-ink-dim leading-relaxed">
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            제1조 (목적)
          </h2>
          <p>
            본 약관은 Ghost Bidder Tracker (이하 "서비스") 의 이용 조건과 운영주체와
            이용자 간 권리·의무를 규정합니다.
          </p>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            제2조 (서비스 성격)
          </h2>
          <p>
            본 서비스는 공공데이터포털·도로명주소·사법정보공유포털의 공개 데이터를
            결합하여 학교급식 시장의 분신 응찰 패턴을 통계적으로 추정·시각화하는
            공익 모니터링 도구입니다. 본 서비스의 어떠한 출력도 위법 단정이 아닙니다.
          </p>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            제3조 (이용자의 의무)
          </h2>
          <p>
            이용자는 서비스에서 제공되는 정보를 명예훼손·차별·부당한 영업방해의
            도구로 사용해서는 안 됩니다. 위반 시 발생하는 모든 법적 책임은 이용자
            본인에게 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            제4조 (이의제기)
          </h2>
          <p>
            매칭에 이의가 있는 사업자·관계자는 제보·이의제기 페이지를 통해 접수할
            수 있으며, 운영주체는 24시간 이내 해당 클러스터를 비공개 전환하고
            검토합니다.
          </p>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            제5조 (책임 한계)
          </h2>
          <p>
            본 서비스의 산출 결과는 추정이며, 정확성·최신성을 보장하지 않습니다.
            이를 근거로 한 제3자 의사결정의 결과에 대해 운영주체는 책임지지
            않습니다.
          </p>
        </section>
        <p className="text-xs text-ink-faint pt-4">
          본 약관은 김창희 변호사 검토 후 확정됩니다.
        </p>
      </div>
    </PageShell>
  )
}
