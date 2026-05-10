// 개인정보처리방침 — 변호사 검토 후 확정 (현재 초안)
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'

export function PrivacyPage() {
  return (
    <PageShell>
      <SectionTitle>개인정보처리방침 (초안)</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Privacy
      </DisplayHeading>
      <div className="mt-8 max-w-3xl space-y-6 text-ink-dim leading-relaxed">
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            1. 수집 항목
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>제보·이의제기 시: 제보 내용, 선택적 연락처(이메일)</li>
            <li>관리자 인증 시: 이메일 (Supabase Auth)</li>
            <li>서버 액세스 로그: IP, User-Agent (보안·악용 방지 목적, 30일 보존)</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            2. 수집 목적
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>제보·이의제기 처리 및 결과 통보</li>
            <li>관리자 인증·권한 부여</li>
            <li>서비스 악용 방지</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            3. 보존 기간
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>제보·이의제기 본문: 처리 완료 후 1년 보관 후 파기</li>
            <li>접수번호와 처리 결과는 통계 목적으로 영구 익명화 보관</li>
            <li>액세스 로그: 30일</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            4. 제3자 제공
          </h2>
          <p className="text-sm">
            법률·수사 절차상 영장 등 적법한 요구가 있는 경우 외에는 제3자에게
            제공하지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            5. 처리위탁
          </h2>
          <p className="text-sm">
            인프라: Supabase (DB, Auth, Storage), Vercel (호스팅).
          </p>
        </section>
        <section>
          <h2 className="font-display italic font-black text-xl text-ink mb-2">
            6. 정보주체의 권리
          </h2>
          <p className="text-sm">
            본인의 제보 내용 열람·정정·삭제를 원하시면 접수번호와 함께
            <a href="mailto:privacy@ghostbid.kr" className="text-ink hover:text-accent ml-1 underline underline-offset-4">
              privacy@ghostbid.kr
            </a>
            로 요청해주세요.
          </p>
        </section>
        <p className="text-xs text-ink-faint pt-4">
          본 방침은 김창희 변호사 검토 후 확정됩니다.
        </p>
      </div>
    </PageShell>
  )
}
