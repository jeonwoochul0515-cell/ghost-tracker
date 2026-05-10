# 부산 학교급식 유령입찰 추적기
## Claude Code CLI 프롬프트집

> **프로젝트**: Ghost Bidder Tracker (부산 학교급식 분신 응찰 모니터링)
> **스택**: React 18 + Vite + TypeScript + TailwindCSS + Supabase + shadcn/ui
> **운영주체**: 법무법인 청송 협력 / 공익 모니터링 도구
> **사용법**: 각 프롬프트 블록을 순서대로 Claude Code CLI에 붙여넣으세요. 한 단계 끝나면 검증 후 다음 단계로 진행합니다.

---

## 사전 준비 (수동)

```bash
# 1. 프로젝트 폴더 생성
mkdir ghost-tracker && cd ghost-tracker

# 2. Claude Code 시작
claude

# 3. (Claude 진입 후) 아래 프롬프트들을 순서대로 입력
```

---

## [P00] 프로젝트 컨텍스트 주입 (가장 먼저)

```
이 프로젝트는 "부산 학교급식 유령입찰 추적기 (Ghost Bidder Tracker)"입니다.

## 배경
- 학교급식 식자재 입찰은 제한최저가 + 추첨 방식
- 한 운영자가 가족·지인 명의로 사업자 N개를 만들어 같은 추첨에 분산 응찰
- → 추첨 당첨확률을 N배로 부풀리는 "분신술"이 시장 왜곡의 핵심 메커니즘
- eaT 시스템은 동일 대표자·동일 IP는 차단하지만, 사업자 등록정보(주소·가족관계)
  동일성은 검증하지 않음 → 이 사각지대를 데이터로 추적

## 목표
공공데이터(eaT API + 국세청 API + 도로명주소) + 공개 판례를 결합해
"같은 실체로 추정되는 사업자 클러스터"를 자동 탐지하고
부산 시민·기자·연구자에게 시각화해 공개하는 공익 도구.

## 기술 스택
- React 18 + Vite + TypeScript
- TailwindCSS + shadcn/ui
- Supabase (Postgres + Edge Functions + Auth)
- 차트: Recharts
- 지도: react-leaflet (부산 600개 학교 시각화용)
- 상태관리: Zustand
- 라우팅: React Router v6
- 폼: React Hook Form + Zod
- 테스트: Vitest

## 법적 가이드라인 (반드시 준수)
- "유령사업자다" 단정 ❌ → "의심 클러스터" 통계 표현 ✅
- 개인사업자번호: 중간 마스킹 (123-XX-67890)
- 대표자명: 성씨만 노출 (김OO)
- 모든 화면에 출처(공공데이터포털·공공누리)·면책 표시
- 이의제기 24시간 내 비공개 처리 가능한 구조

## 디자인 톤
탐사보도 매체(ProPublica·OCCRP) 톤의 다크 편집 미니멀.
Bodoni Moda(영문 display) + Noto Serif KR + IBM Plex Mono 조합.
주조색: #0a0a0a 배경 / #f5f1e8 본문 / #d4ad3c 강조(aged gold).

## 산출물 형태
점진적으로 빌드합니다. 다음 프롬프트가 들어올 때마다 그 단계만
정확히 처리하세요. 임의 확장 금지. 매 단계 끝에 검증 명령(npm run dev,
type check 등)으로 작동 확인하고 결과를 알려주세요.

이 컨텍스트를 CLAUDE.md 파일로 저장해주세요. 향후 모든 작업의 기준이 됩니다.
```

---

## [P01] 프로젝트 스캐폴드

```
Vite + React + TypeScript 프로젝트를 현재 디렉토리에 초기화하세요.

요구사항:
1. `npm create vite@latest . -- --template react-ts` 로 초기화
2. 다음 의존성 설치:
   - 런타임: react-router-dom, zustand, @supabase/supabase-js,
     recharts, react-leaflet, leaflet, react-hook-form, zod,
     @hookform/resolvers, date-fns, clsx, tailwind-merge,
     lucide-react
   - 개발: tailwindcss, postcss, autoprefixer, @types/leaflet, vitest,
     @testing-library/react, @testing-library/jest-dom, jsdom
3. TailwindCSS 초기화 + 폰트 설정 (Bodoni Moda, Noto Serif KR, IBM Plex Mono)
4. tailwind.config.ts에 다음 컬러 토큰 등록:
   bg(#0a0a0a), bg-2(#131312), bg-3(#1c1b19), ink(#f5f1e8),
   ink-dim(#a8a29a), ink-faint(#5a564f), line(#2a2825),
   accent(#d4ad3c), danger(#c14545), warning(#d4843c), safe(#5a8a5a)
5. 기본 폴더 구조 생성:
   src/
     components/   (UI 컴포넌트)
     features/     (도메인 모듈: clusters, schools, cases, reports)
     lib/          (supabase, utils, masking)
     hooks/
     stores/
     types/
     pages/
     styles/
6. tsconfig.json에 path alias 설정: @/* → src/*
7. .env.example 생성: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
8. .gitignore에 .env 추가
9. README.md에 프로젝트 개요 + 실행법 작성

마지막에 `npm run dev` 가 정상 실행되는지 확인하고 결과 알려주세요.
```

---

## [P02] 디자인 시스템 + 글로벌 스타일

```
공통 디자인 시스템을 구축합니다.

1. src/styles/globals.css 작성:
   - 폰트 import (Google Fonts)
   - CSS 변수로 컬러·폰트 토큰
   - body 기본 스타일 (다크 배경, 본문 Noto Serif KR)
   - 필름 그레인 노이즈 오버레이 (SVG fractalNoise + mix-blend-mode)
   - ::selection 스타일

2. src/lib/cn.ts 유틸 함수 (clsx + tailwind-merge)

3. src/components/ui/ 에 다음 원시 컴포넌트 (shadcn/ui 스타일, 직접 작성):
   - Button (variants: primary | ghost | danger / sizes: sm | md | lg)
   - Badge (variants: high | mid | low | neutral)
   - Card
   - Input
   - Tabs
   - Dialog (Modal)
   - Tooltip

4. src/components/typography/ 에:
   - DisplayHeading (Bodoni Moda 900, italic 강조 영역 지원)
   - SectionTitle (label 스타일, IBM Plex Mono 10px uppercase)
   - StatNumber (Bodoni Moda 900 + unit 옵션)

5. src/components/layout/ 에:
   - Header (sticky, blur, 로고 + 네비게이션 + Live Beta 인디케이터)
   - Footer (출처·면책·링크)
   - PageShell (max-width 1400px, 32px padding, 사이드바 옵션)

6. 모든 컴포넌트에 Vitest 기본 렌더 테스트 1개씩 추가

검증: npm run dev → http://localhost:5173 에서 빈 페이지가 다크톤으로 뜨는지 확인.
타입체크: npx tsc --noEmit 통과 확인.
```

---

## [P03] 라우팅 + 페이지 골격

```
React Router v6로 라우팅 설정.

라우트 구조:
- /                    → 대시보드 (의심 클러스터 TOP, 통계)
- /clusters            → 클러스터 전체 목록 (필터·검색)
- /clusters/:id        → 클러스터 상세
- /schools             → 학교별 보기 (부산 600개교)
- /schools/:code       → 학교별 응찰자·낙찰 패턴
- /cases               → 판례 라이브러리
- /cases/:id           → 판례 상세
- /report              → 제보 / 이의제기
- /methodology         → 방법론 문서
- /api                 → 공개 API 문서

각 페이지는 src/pages/ 에 .tsx로 생성하고 임시로 PageShell + h1만
표시. 헤더 네비게이션 클릭 시 active 표시.

스토어:
- src/stores/uiStore.ts (Zustand) — 사이드바 상태, 다크모드 토글(현재는 다크 고정)
- src/stores/filterStore.ts — 클러스터 필터 상태 (riskLevel, district, signals[])

src/App.tsx 에서 BrowserRouter + 라우트 정의 + Header/Footer 공통 레이아웃.

검증: 모든 라우트 클릭 시 정상 이동, 새로고침 시 404 안 나는지 확인.
```

---

## [P04] 도메인 타입 + Supabase 클라이언트

```
도메인 타입과 Supabase 연동 골격을 만듭니다.

1. src/types/domain.ts 에 다음 타입 정의:

   type RiskLevel = 'high' | 'mid' | 'low'
   type SignalLevel = 'S+' | 'S' | 'A' | 'B' | 'C'

   interface Business {
     bizNo: string                    // 사업자번호 (정규화)
     bizNoMasked: string              // 마스킹 (123-XX-67890)
     bizName: string
     repName: string                  // 풀네임 (내부용)
     repNameMasked: string            // 성씨+OO (공개용)
     address: string
     addressNormalized: string
     openDate: string
     closeDate?: string
     status: 'active' | 'closed' | 'reopened'
     industry: string
   }

   interface Cluster {
     id: string                       // BSN-2026-0017 형식
     title: string                    // 한글
     titleEn: string
     district: string                 // 부산 구
     locationLabel: string            // 마스킹된 주소 표시
     riskLevel: RiskLevel
     riskScore: number                // 0-100
     members: Business[]
     period: { from: string; to: string }
     stats: {
       schoolCount: number
       totalWinAmount: number         // 원
       bidCount: number
       winCount: number
       schoolWinRate: number          // 0-1
       expectedRate: number
       multiplier: number
     }
     signals: { text: string; level: SignalLevel }[]
   }

   interface Bid {
     bidId: string
     schoolCode: string
     schoolName: string
     district: string
     bidDate: string
     announceDate: string
     category: string                 // 채소·육류·공산품 등
     estimatedPrice: number
     winnerBizNo: string | null
     participants: string[]           // 응찰 사업자번호들
   }

   interface CourtCase {
     id: string                       // 2023고단1234
     court: string
     verdict: '유죄' | '무죄' | '일부유죄'
     date: string
     summary: string
     pattern: {
       shellCount: number
       relationship: string
       sharedAddress: boolean
       sharedPhone: boolean
       method: string
     }
     evidence: string[]
     sentence: string
     fullTextUrl?: string
   }

   interface Report {
     id: string
     type: 'tip' | 'objection'        // 제보 또는 이의제기
     targetClusterId?: string
     targetBizNo?: string
     content: string
     contactEmail?: string            // 익명 가능
     status: 'received' | 'reviewing' | 'resolved'
     createdAt: string
   }

2. src/lib/supabase.ts:
   - createClient 호출
   - 환경변수 검증 (없으면 mock 모드로 폴백)
   - 타입 안전한 헬퍼: getCluster(id), listClusters(filters), etc.
   - Row Level Security 가정한 쿼리 패턴

3. src/lib/masking.ts:
   - maskBizNo(bizno: string): string  // "1234567890" → "123-XX-67890"
   - maskRepName(name: string): string // "김철수" → "김OO"
   - maskAddress(addr: string): string // 동까지만 표시, 번지 제거
   각각 Vitest 단위 테스트 5개씩 작성

4. src/lib/format.ts:
   - formatKRW(n: number): string     // 1240000000 → "12.4억원"
   - formatPercent(n: number): string
   - formatRatio(n: number): string   // 4.4 → "4.4×"

검증: 모든 마스킹 함수 테스트 통과. tsc --noEmit 통과.
```

---

## [P05] 시드 데이터 + Mock 데이터 레이어

```
실제 API 연결 전 단계를 위한 시드 데이터를 만듭니다.

1. src/lib/seed/ 디렉토리 생성:
   - clusters.ts: 부산 4개 구의 의심 클러스터 12개 (high 4 + mid 5 + low 3)
   - bids.ts: 클러스터 멤버들의 응찰·낙찰 이력 (24개월치)
   - schools.ts: 부산 학교 50개 샘플 (학교명·주소·구·코드)
   - cases.ts: 학교급식 입찰방해 판례 8건 (실제 죄명 구조 따름)
   - reports.ts: 샘플 제보 3건

   주의: 모든 사업자번호·이름·주소는 명백히 가짜임을 알 수 있도록
   "샘플-XXX" / "(주)데모OO" / "OO구 가상로 1XX번길 X" 형태로 작성.
   실제 사업자와 우연히 겹치지 않도록 영업코드는 999XX 사용.

2. src/lib/mockApi.ts:
   - 실제 Supabase 호출과 동일한 시그니처를 가진 mock 함수들
   - VITE_USE_MOCK=true 환경변수일 때 활성화
   - setTimeout으로 200~600ms 랜덤 딜레이 (실제 네트워크 시뮬레이션)
   - 페이지네이션·필터링 동작

3. src/hooks/useClusters.ts, useCluster.ts, useSchools.ts, useCases.ts
   - VITE_USE_MOCK 토글로 mockApi or supabase 자동 선택
   - 로딩·에러·재시도 상태 관리

검증: 콘솔에 mock 데이터 정상 로드 로그.
```

---

## [P06] 메인 대시보드 페이지

```
/ 경로의 대시보드를 완성합니다.

레이아웃 (위에서부터):
1. Hero 섹션 (border-bottom):
   - hero-meta: "Vol. 01 — 2026.01.03 — 04.30 — Public Interest Monitor"
   - DisplayHeading: "Ghost bidders\nin our school cafeterias."
     (영문 italic 강조 + 줄바꿈 후 한글 부제 "우리 아이들 식탁 뒤에 숨은 분신 응찰을 추적합니다")
   - 본문 단락 (제한최저가 추첨 + 분신술 설명, 320자)

2. Stats Strip (4분할 grid, top/bottom border):
   - 의심 클러스터 수
   - 관찰 사업자 수
   - 상위 10 클러스터 합산 낙찰액
   - 평균 분신 추정 배수
   각 stat은 StatNumber 컴포넌트 사용. 등장 시 stagger 애니메이션 (CSS keyframes).

3. 메인 그리드 (2열):
   - 좌측 사이드바 (sticky, 320px):
     * 검색 (사업자번호·상호·학교명)
     * 의심도 필터 (전부/고위험/중간/관찰) + count 뱃지
     * 지역 필터 (부산 16개 구·군 중 데이터 있는 곳만 표시)
     * 신호 필터 (동일주소/가족추정/동일학교동시응찰/폐업회전/신규즉시낙찰)
     * 도구 (정보공개청구·데이터내려받기·방법론)
   - 우측 콘텐츠:
     * 콘텐츠 헤더 ("의심 클러스터" + 정렬·페이징 메타)
     * ClusterCard 리스트 (5개씩, 페이지네이션)

4. Disclaimer + Footer (이미 P02에서 작성)

ClusterCard 컴포넌트 (별도 파일 src/features/clusters/ClusterCard.tsx):
- 상단: case ID(IBM Plex Mono) + 기간 / 위험도 배지
- 제목: 영문 + 한글 부제
- 본문 그리드 (좌:정보 행 / 우:신호 리스트)
- 클릭 시 expanded 상태로 전환 (Zustand: expandedClusterIds)
- expanded 시: 멤버 테이블 + 관계망 SVG + 24개월 타임라인 + 액션 버튼

타임라인 (TimelineBars 컴포넌트):
- 24개의 작은 세로 막대, win = accent / bid = ink-faint
- hover tooltip (월 + win/bid 라벨)

관계망 (NetworkGraph 컴포넌트):
- SVG inline, 원형 배치 (5명까지)
- 중앙 점 = 클러스터, 외곽 = 멤버 노드
- 노드: 이름 / wins/bids / 개업월
- 점선으로 중앙 연결

검증: 시드 데이터 12개 클러스터가 의심도 내림차순으로 표시되고,
필터 클릭 시 시각적으로 active 상태 토글되며, 카드 클릭 시 expanded 영역
펼쳐져 멤버 테이블/관계망/타임라인이 보이는지 확인.
```

---

## [P07] 클러스터 상세 페이지

```
/clusters/:id 라우트의 상세 페이지 구현.

레이아웃:
1. 상단 패널:
   - 좌: 클러스터 ID, 기간, 위치(마스킹), 위험도 큰 배지
   - 우: 의심도 게이지 (반원 차트, recharts 또는 SVG 직접)

2. 신호 패널 (4분할 grid):
   - 정적 신호 4개를 카드로 (동일주소·가족추정·신규낙찰·폐업회전)
   - 각 카드: 신호명 / 등급 / 관측 수치 / 짧은 설명

3. 구성 사업자 테이블 (전체 멤버):
   - 컬럼: 사업자번호(마스킹) / 대표(마스킹) / 개업일 / 폐업 / 응찰/낙찰 / 상태
   - 행 클릭 시 사업자 디테일 패널 우측 슬라이드인

4. 응찰·낙찰 시계열 차트 (Recharts ComposedChart):
   - X축: 월
   - 막대(좌측 Y): 클러스터 합산 응찰 수
   - 선(우측 Y): 클러스터 합산 낙찰액
   - 사건(점): 멤버 신규 등록·폐업 시점

5. 학교 분포 지도 (react-leaflet):
   - 부산 지도 위 학교별 마커
   - 마커 크기 = 해당 학교에서 클러스터의 낙찰 횟수
   - 마커 클릭 시 학교명·낙찰 건수 팝업

6. 매칭 판례 섹션:
   - 패턴 유사도 높은 판례 3건 카드
   - "이 클러스터의 패턴(동일주소+가족명의)은 다음 판례와 유사" 톤
   - 각 카드 클릭 → /cases/:id 이동

7. 액션 바 (sticky bottom):
   - "정보공개청구 양식 만들기" (primary)
   - "이의제기" (ghost)
   - "CSV 다운로드"
   - "공유 링크 복사"

8. 면책 박스 (전체 하단):
   - "본 추적은 패턴 추정이며 위법 단정 아님"
   - "이의제기 24시간 내 처리"
   - 출처 표기

검증: 시드 클러스터 4개 모두 페이지 정상 렌더, 차트·지도 로드,
액션 버튼들이 (지금은 콘솔 로그만이라도) 클릭 가능.
```

---

## [P08] 학교별 보기 + 부산 지도

```
/schools, /schools/:code 구현.

/schools (목록):
- 부산 지도 (react-leaflet, 부산 중심 좌표 35.1796, 129.0756, zoom 11)
- 학교 마커 600개 (시드는 50개로 시작)
- 마커 색상: 의심 클러스터 응찰 빈도에 따라 (없음=ink-faint / 있음=warning / 다수=danger)
- 좌측 패널: 학교 검색 + 정렬 (이름/구/의심응찰빈도)
- 우측 패널: 선택한 학교 요약

/schools/:code (학교 상세):
- 학교 메타 (이름·주소·학생수)
- 최근 1년 입찰 통계 (건수·총 낙찰액·평균 응찰자 수)
- 단골 응찰자 TOP 10 테이블 (사업자명 마스킹 / 응찰수 / 낙찰수 / 클러스터 소속 여부)
- 의심 클러스터 응찰 이력 타임라인
- 학부모용 "우리 학교 안전성 지수" (1-5 단계)
  * 의심 클러스터 응찰 빈도와 시장 점유율로 계산
  * 시각: 5칸 게이지 + 한 줄 설명

지도 마커 클러스터링: leaflet.markercluster 사용 (성능)

검증: 50개 학교 지도에 표시, 클릭 시 상세 페이지 이동, 지수 계산 로직
정상 작동.
```

---

## [P09] 판례 라이브러리

```
/cases, /cases/:id 구현.

/cases (목록):
- 좌측 사이드바:
  * 죄명 필터 (입찰방해·사기·담합·국가계약법·복합)
  * 결과 필터 (유죄·무죄·일부유죄)
  * 패턴 필터 (가족명의·동일주소·폐업회전·차명)
  * 연도 슬라이더
- 우측 카드 그리드:
  * 사건번호·법원·결과 배지
  * 1줄 요약
  * 패턴 태그 (가족명의 4명, 18개월 영업, 12억 피해 등)
  * 형량 / 추징
  * 판결문 외부 링크 (있으면)

/cases/:id (상세):
- 사건 메타 (법원·사건번호·재판부·선고일·결과)
- 사실관계 요약 (구조화된 필드: 분신 수·관계·기간·피해규모·적발경위)
- 검찰이 사용한 증거 리스트
- "이 판례의 패턴이 우리 데이터에서도 나타나는 클러스터" 자동 매칭
  → 매칭 클러스터 카드 3개
- 형량 분석 (양형 요소 표시)
- 외부 판결문 링크

데이터: 시드의 cases.ts 8건 사용. 추후 사법정보공유포털 API 연결 예정
이라는 주석을 mockApi에 명시.

판례 패턴 ↔ 클러스터 매칭 로직 (src/features/cases/matching.ts):
- 신호 벡터 코사인 유사도
- 패턴 일치 항목 수 기반 단순 점수

검증: 8건 판례 정상 표시, 매칭 클러스터 추천이 의미 있는 수준으로
나오는지 확인.
```

---

## [P10] 제보·이의제기 + 정보공개청구 양식

```
/report 페이지와 정보공개청구 양식 생성기 구현.

/report (탭 구조):
- 탭 1: 제보하기
- 탭 2: 이의제기 (잘못된 매칭)

제보 폼 (React Hook Form + Zod):
- 제보 유형 (분신술/담합/리베이트/위생/기타)
- 의심 사업자 정보 (선택)
- 의심 학교 (선택)
- 제보 내용 (필수)
- 증거 첨부 (선택, 파일 업로드 → Supabase Storage)
- 연락처 (선택, 익명 OK)
- 동의 체크 (개인정보 처리·허위제보 책임)

이의제기 폼:
- 대상 클러스터 ID (URL ?cluster_id= 자동 입력)
- 사유 선택 (오매칭/사실관계 오류/추가 정보)
- 상세 사유 (필수)
- 신원 (선택, 단 사업자 본인 검증을 위해 사업자등록증 첨부 권장)
- "24시간 내 비공개 처리" 안내 박스

제출 후: 접수번호 발급 화면 (REPORT-2026-XXXX)

정보공개청구 양식 생성기 (src/features/clusters/foiaForm.ts):
- 클러스터 상세 페이지의 "정보공개청구 양식" 버튼 클릭 시 다이얼로그
- 자동 생성 항목:
  * 청구기관: 한국농수산식품유통공사 (eaT 운영)
  * 청구 정보: "[클러스터 ID]에 포함된 사업자번호 [list]의 최근 24개월 응찰 이력
                (응찰 학교, 응찰가, 응찰일시, 단말정보)"
  * 청구 목적: 공익 모니터링 및 학교급식 시장 투명성 분석
  * 우철님이 사용할 수 있도록 .docx 다운로드 + info.go.kr 바로가기 링크

검증: 폼 검증 정상, 제출 후 mock 응답으로 접수번호 표시,
.docx 다운로드 작동.
```

---

## [P11] 의심도 스코어링 엔진

```
실제 분석의 두뇌 부분 - 의심도 점수를 계산하는 엔진을 분리 모듈로
작성합니다.

src/features/scoring/ 디렉토리:

1. signals.ts — 신호 정의 + 가중치
   각 신호는:
   { id, name, description, weight, level: 'S+'|'S'|'A'|'B'|'C',
     evaluate: (cluster: ClusterContext) => SignalResult | null }

   초기 신호 12개 (변호사 광고 트래커 패턴 응용):
   - SAME_ADDRESS_3PLUS (동일주소 3개+, w=35)
   - SAME_ADDRESS_5PLUS (동일주소 5개+, w=45)
   - FAMILY_SURNAME (같은 성씨 다수, w=20)
   - INCEPTION_CLUSTER (인접 개업일, w=15)
   - SAME_SCHOOL_CO_BID (동일학교 동시응찰, w=40)
   - WIN_RATE_INFLATION (확률 왜곡 배수, w=35)
   - REOPEN_AT_SAME_ADDRESS (폐업 후 같은 주소 재등록, w=25)
   - NEW_AND_BIG_WIN (신규 6개월 내 대형 낙찰, w=20)
   - SINGLE_BUYER_DOMINANCE (특정 발주처 80%+, w=15)
   - CATEGORY_OMNIVORE (전 카테고리 낙찰, w=10)
   - GEOGRAPHIC_MISMATCH (본점-납품지 거리, w=15)
   - SHORT_LIVED (단기 집중 후 폐업, w=20)

2. clusterer.ts — 사업자 → 클러스터 그룹화
   - 1차: 정규화 주소 동일성 (호수까지)
   - 2차: 대표자명 동일 (식자재 업종 한정)
   - 3차: 가족 추정 (성씨+주소·연락처 일부 일치)
   - 화이트리스트: 도매시장·집합건물 (입력으로 주입 가능)
   - Union-Find 자료구조로 그룹 병합

3. scorer.ts — 클러스터별 점수 합산
   - 각 신호 evaluate() 호출
   - 0~100으로 클램프
   - 80+: high / 50-79: mid / 0-49: low
   - 발화한 신호 reasons[] 반환

4. statisticalTests.ts — 확률 왜곡 통계 검증
   - 시장 풀 점유율 vs 실제 낙찰률
   - 이항분포 기반 z-score / p-value
   - "이 클러스터의 합산 낙찰률은 우연으로 발생할 확률이 X%"

5. 단위 테스트 (Vitest):
   - 각 신호별 evaluate 정/오 케이스
   - clusterer 가족·주소 통합 케이스
   - 화이트리스트 회피 케이스
   - 점수 경계값

검증: npm run test 모두 통과. 시드 데이터에 엔진 적용 시 기대 점수
범위 내 산출.
```

---

## [P12] Supabase 스키마 + Edge Functions

```
백엔드 데이터 모델과 서버 함수를 만듭니다.

1. supabase/migrations/ 에 SQL 마이그레이션:

   001_init.sql:
   - businesses (bizno PK, name, rep_name, address, address_normalized,
     district, open_date, close_date, status, industry, raw_data jsonb,
     updated_at)
   - bids (id PK, school_code, school_name, district, bid_date,
     announce_date, category, estimated_price, winner_bizno,
     participants text[], raw_data jsonb)
   - schools (code PK, name, address, district, lat, lon, student_count)
   - clusters (id PK, district, location_label, risk_level, risk_score,
     period_from, period_to, stats jsonb, signals jsonb, computed_at)
   - cluster_members (cluster_id, bizno, joined_at, PRIMARY KEY composite)
   - court_cases (id PK, court, verdict, date, summary, pattern jsonb,
     evidence jsonb, sentence, full_text_url)
   - reports (id PK, type, target_cluster_id, target_bizno, content,
     contact_email, status, created_at)
   - whitelist_addresses (address_normalized PK, reason, added_by)

   002_indexes.sql:
   - businesses(address_normalized), businesses(rep_name),
     bids(school_code, bid_date), bids(winner_bizno),
     cluster_members(bizno), GIN on bids.participants

   003_rls.sql:
   - 공개 읽기: clusters, businesses(masked view), schools, court_cases
   - 비공개: reports (admin only)
   - 마스킹 뷰 생성: businesses_public (bizno_masked, rep_masked, ...)

2. supabase/functions/ 에 Edge Functions:

   ingest-eat:
   - eaT API에서 입찰·낙찰 데이터 페치
   - businesses, bids 테이블 upsert
   - 일배치 (cron으로 매일 오전 6시 호출)

   ingest-nts:
   - 사업자번호 리스트 받아 국세청 API로 상태·진위 확인
   - businesses 갱신

   normalize-addresses:
   - 도로명주소 API로 주소 정규화
   - businesses.address_normalized 채움

   recompute-clusters:
   - 전체 사업자에 대해 clusterer + scorer 실행
   - clusters, cluster_members 갱신
   - 주배치 (매일 새벽)

   submit-report:
   - reports insert + 관리자 알림

3. 모든 함수는 TypeScript + Deno 런타임.
   에러는 Sentry-style structured log 출력.

4. supabase/seed.sql 에 시드 데이터의 SQL 버전.

5. README에 supabase init / db push / functions deploy 절차.

검증: supabase start 로컬 기동, db push 성공, 시드 적재,
functions serve 동작 확인.
```

---

## [P13] 실제 API 어댑터 (eaT · 국세청 · 도로명주소)

```
공공데이터 API 어댑터를 작성합니다. 모두 Edge Function 환경에서 동작.

src/server/adapters/ (Edge Function 공유 모듈):

1. eatApi.ts:
   - 베이스: http://apis.data.go.kr/B552845/eaTPubService
   - 엔드포인트: eaTBidList, eaTSucBidList, eaTContractList (확인 필요)
   - 메소드: listBids({pageNo, numOfRows, fromDate, toDate, region})
   - 메소드: getBidDetail(bidId)
   - 인증: serviceKey (env: EAT_SERVICE_KEY)
   - 응답: XML/JSON 자동 감지 → 파서 → 도메인 타입
   - 재시도: 3회 + exponential backoff
   - 트래픽 제한 인지 (10,000/일)

2. ntsApi.ts (국세청):
   - 사업자 상태조회 (/nts-businessman/v1/status)
   - 진위확인 (/nts-businessman/v1/validate)
   - 배치 호출 (최대 100개)
   - env: NTS_SERVICE_KEY

3. roadAddressApi.ts (도로명주소):
   - business.juso.go.kr 검색 API
   - 정규화 함수: rawAddress → { roadAddr, jibunAddr, buildingId, floor }
   - 캐시 (Map) 24시간

4. courtApi.ts (사법정보공유포털, 향후):
   - 현재는 placeholder + TODO 주석
   - 우철님이 신청 중인 API 연동 예정 표시

5. 각 어댑터 단위 테스트 (모킹):
   - 정상 응답
   - 에러 응답 (서비스키 미등록·트래픽 초과)
   - 빈 결과

6. 환경변수 검증 모듈:
   - 없으면 명확한 에러 메시지

검증: 환경변수 mock 모드에서 어댑터 호출 → 정형화된 응답 반환.
```

---

## [P14] 메소돌로지 페이지 + 신뢰 강화

```
/methodology 페이지를 작성합니다. 이 페이지는 프로젝트의 신뢰성을
입증하는 핵심 자산입니다.

구성:
1. 헤로: "How we find ghosts."
2. 데이터 소스 섹션:
   - eaT, 국세청, 도로명주소, 사법정보 — 각 출처·갱신주기·라이선스
   - 공공누리 표시
3. 12개 신호 정의 (P11의 signals.ts와 동기화):
   - 각 신호: 정의 / 측정법 / 가중치 / 한계
4. 클러스터링 알고리즘:
   - 1차/2차/3차 매칭 규칙
   - 화이트리스트 정책
   - 한계: 직원명의·차명은 잡기 어려움
5. 의심도 스코어링:
   - 합산 공식
   - 임계값 (high 80+ / mid 50-79 / low 0-49)
6. 통계적 검증:
   - 확률 왜곡 측정 방법
   - 가설 검정
7. 한계 (반드시 강조):
   - 적발된 판례에 학습 편향
   - False Positive 가능성
   - 단정 금지
8. 거버넌스:
   - 운영주체
   - 자문 변호사 (법무법인 청송)
   - 이의제기 SLA (24시간)
   - 데이터 보존·삭제 정책
9. 변경 이력 (Git 커밋 링크 자동 생성)
10. 라이선스 (코드: MIT / 데이터: 공공누리 1유형)

각 섹션을 마크다운으로 작성하고 react-markdown으로 렌더,
또는 MDX 도입.

검증: 페이지가 인쇄 친화적으로 렌더, 목차 사이드바 작동.
```

---

## [P15] 관리자 대시보드 (내부용)

```
/admin 라우트 (인증 필요) 추가.

기능:
1. 인증: Supabase Auth (이메일 + 매직링크)
2. 권한: admin 역할만 접근 (RLS)

화면:
- 제보·이의제기 큐 (상태 변경, 답변, 비공개 처리)
- 클러스터 수동 검증 (각 클러스터에 verified | rejected | pending 라벨)
- 화이트리스트 관리 (도매시장 주소 등 추가)
- 신호 가중치 튜닝 (실시간 미리보기)
- 데이터 적재 로그 (Edge Function 실행 결과)
- 통계 대시보드 (일별 클러스터 변화, 제보 추이)

수동 검증 워크플로우:
- 각 클러스터에 메모 가능
- "법적 검토 요청 → 김창희 변호사" 보내기 버튼 (이메일)
- 승인된 클러스터만 공개 페이지에 노출 (옵션)

검증: 비로그인 시 접근 차단, 로그인 후 admin 권한 확인,
RLS 정책으로 일반 유저는 reports 조회 불가.
```

---

## [P16] 배포 + CI/CD

```
GitHub Actions + Vercel + Supabase로 배포 구성.

1. .github/workflows/ci.yml:
   - PR 시: lint, type check, unit test, build
   - main 푸시 시: 위 + Supabase migration 적용 + Vercel 배포

2. vercel.json:
   - SPA 라우팅 fallback
   - 환경변수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

3. Supabase:
   - production 프로젝트 분리
   - GitHub Action에서 supabase db push 자동화
   - Edge Function deploy 자동화

4. 모니터링:
   - Vercel Analytics
   - Supabase Logs
   - 간단한 uptime 체크 (UptimeRobot 무료티어 추천)

5. 도메인 (선택):
   - ghostbid.kr 또는 비슷한 .kr 도메인
   - SSL 자동 (Vercel 기본)

6. SEO:
   - meta tags (OpenGraph, Twitter Card)
   - sitemap.xml 자동 생성
   - robots.txt (admin 차단)

7. 분석:
   - Plausible 또는 Umami (개인정보 친화)
   - 핵심 지표: 페이지뷰·검색어·이의제기 클릭

검증: PR 워크플로우 정상 통과, Preview 배포 URL 확인,
production 배포 후 첫 요청 200 응답.
```

---

## [P17] 법적 안전성 최종 검토 통합

```
김창희 변호사 검토를 코드에 반영하는 작업.

체크리스트 (각 항목을 코드/문서로 확정):

1. 표현 가이드 (src/lib/wording.ts):
   - 금지: "유령사업자다", "이 회사는 페이퍼컴퍼니"
   - 권장: "의심 클러스터", "통계적 패턴", "추정"
   - lint 규칙: ESLint 커스텀 룰로 금지 표현 검출

2. 마스킹 정책 (P04 masking.ts 강화):
   - 일반 공개: 사업자번호 중간 마스킹, 대표자명 성씨만, 주소는 동까지
   - 회원(검증된 기자·연구자): 추가 노출 가능 — 단, 사용 로그 기록
   - 관리자: 모두 노출

3. 면책 표시 (src/components/Disclaimer.tsx):
   - 모든 클러스터·사업자 화면에 자동 노출
   - "본 정보는 공개정보 통계 결합으로 산출된 추정이며..."
   - 출처·라이선스·이의제기 채널 표시

4. 이의제기 SLA (src/server/sla.ts):
   - 접수 후 24시간 내 비공개 처리 트리거
   - Slack/이메일 알림
   - 처리 이력 reports.history jsonb에 기록

5. 데이터 출처 메타 (src/lib/dataProvenance.ts):
   - 모든 표시되는 수치에 출처·갱신일 메타데이터
   - 호버 시 출처 표시

6. 이용약관·개인정보처리방침 페이지 (/terms, /privacy):
   - 변호사 검토 후 확정 텍스트
   - 수집 항목·목적·보존기간 명시

7. 운영주체 명시 (Footer):
   - "법무법인 청송과 협력하는 부산 시민 공익 모니터링 도구"
   - 책임자 이메일

8. 광고·수익 표시:
   - 광고 없음 (현 단계)
   - 향후 유료 기능 도입 시 명확 분리

검증: 모든 페이지에 면책 표시, ESLint가 금지 표현 검출, 이의제기
플로우 e2e 테스트.
```

---

## [P18] 마무리 — 문서·README·시연

```
프로젝트를 외부에 보여줄 수 있도록 마감합니다.

1. README.md 풀버전:
   - 프로젝트 소개 (한국어 + 영문)
   - 스크린샷 4-6장
   - 데이터 출처
   - 기술 스택
   - 로컬 개발 가이드 (.env.example 안내)
   - 배포 가이드
   - 기여 가이드
   - 라이선스 (MIT)
   - Acknowledgements (공공데이터·법무법인 청송·자원봉사 기여자)

2. CHANGELOG.md (Conventional Commits 기반)

3. CONTRIBUTING.md
   - 이슈 템플릿
   - PR 템플릿
   - 커뮤니케이션 채널

4. docs/ 폴더:
   - architecture.md (아키텍처 다이어그램)
   - data-flow.md (데이터 흐름)
   - deployment.md
   - threat-model.md (보안·법적 위협 모델)

5. /presskit 페이지:
   - 로고·아이콘·스크린샷 다운로드
   - 보도자료 템플릿 (한국어)
   - 미디어 문의 연락처

6. 시연 시나리오 스크립트 (docs/demo-script.md):
   - 1분 데모: 메인 → 고위험 클러스터 → 상세 → 매칭 판례 → 정보공개청구
   - 5분 데모: + 학교별 보기 + 방법론

7. 시연용 .env.demo:
   - 시드 데이터 풍부한 mock 모드 ON

검증: 외부인이 README만 읽고 5분 안에 로컬 실행 가능 + 1분 데모 실행 가능.
```

---

## 부록 A — 자주 쓰는 후속 프롬프트

### 신호 추가
```
src/features/scoring/signals.ts에 신호를 하나 추가하고 싶습니다:
이름: [SIGNAL_ID]
설명: [한 문장]
가중치: [숫자]
계산 로직: [구체 설명]
이 신호의 evaluate 함수와 단위 테스트 3개를 작성해주세요.
```

### 새 데이터 소스 어댑터
```
src/server/adapters/[name]Api.ts 를 추가합니다.
원본 API: [URL]
인증: [방식]
주요 엔드포인트: [list]
도메인 매핑: [원본 → 우리 타입]
재시도·캐시 정책 포함하여 작성해주세요.
```

### UI 톤 변형
```
[페이지/컴포넌트]를 [더 미니멀하게 / 더 편집디자인스럽게 / 인쇄친화적으로]
조정해주세요. 다음을 유지하세요:
- 다크 톤
- Bodoni Moda + Noto Serif KR + IBM Plex Mono 폰트 시스템
- accent #d4ad3c 강조색
- 면책 표시 위치
```

### 법적 검토 반영
```
김창희 변호사가 다음 항목을 지적했습니다:
1. [지적 1]
2. [지적 2]
관련 코드/문서를 모두 찾아 수정하고, 변경 사항을 PR description으로
요약해주세요.
```

### 성능 개선
```
[페이지 또는 컴포넌트]가 느립니다. Lighthouse 또는 React DevTools Profiler
기준으로 병목을 찾아 개선해주세요. 가능한 기법:
- 메모이제이션 (useMemo, React.memo)
- 가상 스크롤 (react-window)
- 이미지 lazy loading
- 차트 데이터 다운샘플링
```

---

## 부록 B — 진행 체크리스트

| 단계 | 명칭 | 완료 |
|---|---|---|
| P00 | 컨텍스트 주입 (CLAUDE.md) | ☐ |
| P01 | Vite 스캐폴드 | ☐ |
| P02 | 디자인 시스템 | ☐ |
| P03 | 라우팅·페이지 골격 | ☐ |
| P04 | 도메인 타입·Supabase 클라이언트 | ☐ |
| P05 | 시드·Mock 데이터 | ☐ |
| P06 | 메인 대시보드 | ☐ |
| P07 | 클러스터 상세 | ☐ |
| P08 | 학교별 보기 + 지도 | ☐ |
| P09 | 판례 라이브러리 | ☐ |
| P10 | 제보·이의제기·정보공개청구 | ☐ |
| P11 | 의심도 스코어링 엔진 | ☐ |
| P12 | Supabase 스키마·Edge Functions | ☐ |
| P13 | 공공데이터 API 어댑터 | ☐ |
| P14 | 메소돌로지 페이지 | ☐ |
| P15 | 관리자 대시보드 | ☐ |
| P16 | 배포·CI/CD | ☐ |
| P17 | 법적 안전성 최종 검토 반영 | ☐ |
| P18 | 문서·시연 마감 | ☐ |

---

## 부록 C — 트러블슈팅 메모

- **공공데이터 API 응답 지연**: 트래픽 제한(10k/일) 또는 서비스키 미활성(첫 신청 후 1시간 대기). Edge Function 내 캐시 적극 사용.
- **CORS**: 모든 외부 API 호출은 Edge Function을 경유. 프론트에서 직접 호출 금지.
- **타입 에러**: Supabase 타입 자동 생성 활용 (`supabase gen types typescript`).
- **leaflet 마커 대량 렌더 시 끊김**: leaflet.markercluster 적용 + viewport 기반 lazy load.
- **변경 추적**: 커밋 메시지는 Conventional Commits (feat:, fix:, docs:, ...).
- **민감 데이터**: .env, supabase/.temp, *.local 절대 커밋 금지. pre-commit hook으로 검증.

---

## 운영 메모

이 프롬프트집은 **점진적·대화적 사용**을 전제로 합니다.
한 번에 전체를 던지지 말고, P00부터 차례로 입력하면서 각 단계 결과를
검증한 뒤 다음으로 넘어가세요. 도중에 막히면 부록 A의 후속 프롬프트로
보정하면 됩니다.

기술적 결정이 필요한 순간에 변호사 검토(김창희 변호사)·도메인 검토
(우철님 협동조합 경험)·디자인 검토를 병렬로 돌리는 것이
이 프로젝트의 속도를 좌우합니다.

— 부산 연제구에서, 2026
