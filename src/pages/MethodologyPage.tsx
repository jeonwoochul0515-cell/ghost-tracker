// 방법론 페이지 — 데이터 소스 / 신호 / 클러스터링 / 점수 / 통계 / 한계 / 거버넌스 / 라이선스
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { DisplayHeading } from '@/components/typography/DisplayHeading'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { Card } from '@/components/ui/Card'
import { ALL_SIGNALS } from '@/features/scoring/signals'
import { HIGH_THRESHOLD, MID_THRESHOLD } from '@/features/scoring/scorer'
import { cn } from '@/lib/cn'

interface SectionAnchor {
  id: string
  label: string
}

const ANCHORS: SectionAnchor[] = [
  { id: 'sources', label: '1. 데이터 소스' },
  { id: 'signals', label: '2. 신호 정의' },
  { id: 'clusterer', label: '3. 클러스터링' },
  { id: 'scoring', label: '4. 의심도 스코어링' },
  { id: 'statistics', label: '5. 통계 검증' },
  { id: 'limits', label: '6. 한계와 주의' },
  { id: 'governance', label: '7. 거버넌스' },
  { id: 'changelog', label: '8. 변경 이력' },
  { id: 'license', label: '9. 라이선스' },
]

const LEVEL_COLOR: Record<'S+' | 'S' | 'A' | 'B' | 'C', string> = {
  'S+': 'text-danger border-danger/40',
  S: 'text-danger border-danger/40',
  A: 'text-warning border-warning/40',
  B: 'text-ink-dim border-line',
  C: 'text-ink-faint border-line/60',
}

export function MethodologyPage() {
  const [activeId, setActiveId] = useState<string>(ANCHORS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const a of ANCHORS) {
      const el = document.getElementById(a.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <PageShell
      sidebar={
        <nav className="space-y-1 lg:sticky lg:top-24">
          <SectionTitle>목차</SectionTitle>
          <ul className="mt-3 space-y-0.5">
            {ANCHORS.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  className={cn(
                    'block py-1.5 text-sm transition-colors',
                    activeId === a.id
                      ? 'text-accent'
                      : 'text-ink-dim hover:text-ink',
                  )}
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-ink-faint leading-relaxed">
            본 페이지는 인쇄 친화적입니다 — Ctrl+P 로 PDF 추출 가능.
          </p>
        </nav>
      }
    >
      <SectionTitle>How we find ghosts</SectionTitle>
      <DisplayHeading as="h1" className="mt-3">
        Methodology
      </DisplayHeading>
      <p className="mt-4 text-ink-dim max-w-2xl leading-relaxed">
        Ghost Bidder Tracker 가 의심 클러스터를 식별하는 방법을 단계별로 공개합니다.
        모든 가중치·임계값·휴리스틱은 본 문서로 확인 가능하며, 변경은 git 커밋
        이력으로 추적됩니다.
      </p>

      {/* 1. 데이터 소스 */}
      <section id="sources" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          1. 데이터 소스
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'eaT (학교급식전자조달)', org: '한국농수산식품유통공사', cycle: '일배치 06:00', license: '공공누리 1유형' },
            { name: '국세청 사업자등록정보', org: '국세청', cycle: '주배치 (사업자 검증)', license: '공공누리 1유형' },
            { name: '도로명주소', org: '행정안전부', cycle: '주소 정규화 시', license: '공공누리 1유형' },
            { name: '사법정보공유포털', org: '대법원', cycle: '인가 진행 중', license: '공공누리 1유형' },
          ].map((src) => (
            <Card key={src.name} className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                {src.org}
              </p>
              <p className="mt-2 text-ink font-display italic font-black text-xl">
                {src.name}
              </p>
              <dl className="mt-3 text-xs space-y-1">
                <div className="flex gap-2">
                  <dt className="text-ink-faint w-20">갱신주기</dt>
                  <dd className="text-ink-dim">{src.cycle}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-ink-faint w-20">라이선스</dt>
                  <dd className="text-ink-dim">{src.license}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. 신호 */}
      <section id="signals" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          2. 신호 정의 ({ALL_SIGNALS.length}종)
        </h2>
        <p className="mt-3 text-ink-dim leading-relaxed max-w-2xl">
          각 신호는 발화 시 정의된 weight 만큼 점수에 합산되며, 발화 조건과
          한계는 아래에 명시되어 있습니다. 가중치 조정은{' '}
          <Link to="/admin" className="text-ink-dim hover:text-ink underline underline-offset-4">
            관리자 페이지
          </Link>{' '}
          에서 가능합니다.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line">
                <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">ID</th>
                <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">신호</th>
                <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">등급</th>
                <th className="py-3 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal text-right">가중치</th>
              </tr>
            </thead>
            <tbody>
              {ALL_SIGNALS.map((s) => (
                <tr key={s.id} className="border-b border-line/50">
                  <td className="py-3 pr-4 font-mono text-xs text-ink-dim">{s.id}</td>
                  <td className="py-3 pr-4">
                    <p className="text-ink">{s.name}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{s.description}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        'font-mono text-[10px] uppercase px-1.5 py-0.5 border',
                        LEVEL_COLOR[s.level],
                      )}
                    >
                      {s.level}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right font-mono text-accent">{s.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 클러스터링 */}
      <section id="clusterer" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          3. 클러스터링 알고리즘
        </h2>
        <ol className="mt-6 space-y-4 max-w-3xl list-decimal pl-6 text-ink-dim leading-relaxed">
          <li>
            <strong className="text-ink">정규화 주소 동일성</strong> — 도로명주소
            API 로 정규화한 주소가 호수 단위까지 일치하는 사업자를 한 그룹으로
            병합. 화이트리스트(도매시장·집합건물)는 제외.
          </li>
          <li>
            <strong className="text-ink">식자재 업종 + 동일 대표자</strong> — 한
            대표자가 여러 식자재 도소매 사업자를 등록한 경우 같은 그룹.
          </li>
          <li>
            <strong className="text-ink">가족 추정 (휴리스틱)</strong> — 같은
            성씨 + 같은 부산 구·군 내 등록 + 식자재 업종 3명 이상. 정확한 가족
            매칭은 NTS API 진위확인 단계에서 보강.
          </li>
        </ol>
        <p className="mt-4 text-sm text-ink-faint max-w-3xl">
          그룹 병합은 Union-Find 자료구조 (path compression) 로 처리됩니다 —{' '}
          <code className="text-ink-dim font-mono">src/features/scoring/clusterer.ts</code>.
        </p>
      </section>

      {/* 4. 스코어링 */}
      <section id="scoring" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          4. 의심도 스코어링
        </h2>
        <p className="mt-4 text-ink-dim leading-relaxed max-w-3xl">
          각 신호의 evaluate 결과 weight 를 합산하고 0~100 으로 클램프합니다.
          임계값에 따라 high / mid / low 등급이 부여됩니다.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 max-w-xl">
          <Card className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">고위험</p>
            <p className="mt-2 font-display font-black text-3xl text-danger">
              {HIGH_THRESHOLD}+
            </p>
          </Card>
          <Card className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">중간</p>
            <p className="mt-2 font-display font-black text-3xl text-warning">
              {MID_THRESHOLD}–{HIGH_THRESHOLD - 1}
            </p>
          </Card>
          <Card className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">관찰</p>
            <p className="mt-2 font-display font-black text-3xl text-safe">
              0–{MID_THRESHOLD - 1}
            </p>
          </Card>
        </div>
      </section>

      {/* 5. 통계 검증 */}
      <section id="statistics" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          5. 통계 검증
        </h2>
        <p className="mt-4 text-ink-dim leading-relaxed max-w-3xl">
          클러스터의 합산 낙찰률을 시장 평균(추정)과 비교해, 우연으로 발생할 확률을
          이항분포 기반 z-score 로 산출합니다 — 정규근사 (Abramowitz & Stegun)
          누적분포함수 사용. 측정에 충분한 입찰 건수 (≥ 10) 가 없으면 검정 결과
          미반환.
        </p>
        <p className="mt-3 text-sm text-ink-faint max-w-3xl">
          <code className="text-ink-dim font-mono">
            src/features/scoring/statisticalTests.ts
          </code>{' '}
          참고.
        </p>
      </section>

      {/* 6. 한계 */}
      <section id="limits" className="mt-16 scroll-mt-24 border-l-2 border-warning/40 pl-6">
        <h2 className="font-display italic font-black text-3xl text-ink">
          6. 한계와 주의
        </h2>
        <ul className="mt-6 space-y-3 list-disc pl-5 text-ink-dim leading-relaxed max-w-3xl">
          <li>
            <strong className="text-ink">학습 편향</strong> — 신호 정의는 과거
            적발된 공개 판례 패턴에 기반합니다. 새로운 수법(직원 명의 차명·외부
            법인 우회 등)은 휴리스틱으로 잡기 어렵습니다.
          </li>
          <li>
            <strong className="text-ink">False Positive 가능성</strong> — 도매시장
            정상 입주, 가족이 같은 업종에 우연히 진출한 경우 등은 화이트리스트
            보강이 없으면 의심 클러스터로 잡힐 수 있습니다.
          </li>
          <li>
            <strong className="text-ink">단정 금지</strong> — 본 도구의 출력은
            패턴 추정이며, 어떠한 위법 단정도 아닙니다. 의심 클러스터 = 추가
            조사 필요 후보 정도로 해석하시기 바랍니다.
          </li>
          <li>
            <strong className="text-ink">데이터 갱신 지연</strong> — 사업자
            폐업/재등록은 NTS 갱신 주기로 인해 며칠 시차 발생.
          </li>
        </ul>
      </section>

      {/* 7. 거버넌스 */}
      <section id="governance" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          7. 거버넌스
        </h2>
        <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-3xl text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">운영주체</dt>
            <dd className="mt-1 text-ink-dim">법무법인 청송 협력 / 부산 시민 공익 모니터링</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">자문 변호사</dt>
            <dd className="mt-1 text-ink-dim">김창희 변호사</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">이의제기 SLA</dt>
            <dd className="mt-1 text-ink-dim">접수 후 24시간 내 비공개 처리</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">데이터 보존</dt>
            <dd className="mt-1 text-ink-dim">원천 데이터는 갱신마다 최신본 1세트, 변경 이력은 3년 보관</dd>
          </div>
        </dl>
      </section>

      {/* 8. 변경 이력 */}
      <section id="changelog" className="mt-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          8. 변경 이력
        </h2>
        <p className="mt-4 text-ink-dim leading-relaxed max-w-3xl">
          가중치·신호 정의·클러스터링 규칙의 변경은 모두 git 커밋으로 추적됩니다.
          배포 전 PR 단계에서 변호사 검토를 거치며, 메이저 변경 시 본 페이지 상단에
          공지합니다.
        </p>
      </section>

      {/* 9. 라이선스 */}
      <section id="license" className="mt-16 mb-16 scroll-mt-24">
        <h2 className="font-display italic font-black text-3xl text-ink">
          9. 라이선스
        </h2>
        <dl className="mt-6 space-y-2 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">코드</dt>
            <dd className="text-ink-dim">MIT License</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">데이터</dt>
            <dd className="text-ink-dim">공공누리 1유형</dd>
          </div>
        </dl>
      </section>
    </PageShell>
  )
}
