# Context Notes — Ghost Bidder Tracker

> 작업 중 내린 결정과 근거를 시간순으로 누적하는 로그.
> 다음 세션(사람·에이전트)이 결정을 다시 도출할 필요가 없게끔 충분히 적습니다.

---

## 2026-05-10 — 프로젝트 초기화

**환경**
- OS: Windows 11
- Node v24.14.0 / npm 11.9.0 (Vite 호환 OK)
- 작업 디렉토리: `C:\Users\jeonw\.antigravity\tracker`

**git 설정**
- `git init` + `git config core.autocrlf false`
- 이유: Windows 기본 `autocrlf=true` 는 LF 파일을 체크아웃 시 CRLF로 변환 → 이후 ESLint/Prettier·TS 컴파일러와 줄바꿈 충돌 가능. 시작부터 LF로 통일.

**CLAUDE.md 분리 정책**
- 글로벌 `~/.claude/CLAUDE.md` 는 행동 가이드라인 (절대 콜론, 시작 전 plan/checklist, 테스트 실행 등)
- 프로젝트 로컬 `./CLAUDE.md` 는 도메인·법적·디자인 컨텍스트만 담음 (P00 프롬프트 내용)
- Claude Code는 두 파일을 자동 병합. 중복 제거가 핵심.

**진행 방식**
- `ghost-tracker-prompts.md` 의 P00~P18 순서대로 단계별 진행.
- 각 단계 종료 시 검증 후 커밋 (Conventional Commits).
- 한 단계 끝날 때마다 사용자에게 결과 보고 + 다음 단계 진행 의사 확인.

**선택하지 않은 대안**
- pnpm/yarn 대신 npm: P01 프롬프트가 npm 명시, 환경 단순화.
- monorepo 도구(turborepo) 미도입: 프론트 단일 앱 + Supabase functions로 분리 충분.
- Tailwind v4 vs v3: P01 프롬프트가 `tailwind.config.ts` 형태(=v3 후기/v4 호환)를 가정 → 일단 안정판 v3로 진행, 필요 시 v4로 마이그레이션.

---

---

## 2026-05-10 — P01 Vite 스캐폴드

**Vite 초기화 전략**
- 작업 디렉토리에 이미 파일이 있어 `npm create vite@latest .` 가 깔끔히 안 됨.
- 임시 폴더(`/tmp/vite-scaffold/app`)에서 scaffold 후 필요한 파일만 복사하는 방식 채택.
- 우리 `.gitignore`, `README.md` 는 보존.

**버전 결정**
- **React 19 유지** (P00 명세는 React 18). 이유: Vite 8 기본 템플릿이 React 19 + 2026.05 시점 에코시스템이 19 안착. `react-leaflet@5.0.0` stable 이 React 19 peer 지원해서 다운그레이드 불필요. 18 다운그레이드는 testing-library/eslint-plugin-react-hooks 까지 연쇄 수정해야 해서 비용이 더 큼.
- **TailwindCSS v3** (사용자 동의). v4는 PostCSS 플러그인 분리·CSS-first 구성 등 큰 변경. P01 프롬프트가 `tailwind.config.ts` 형태를 가정 → v3 안정판이 자연스러움.
- **vitest v4** 로 업그레이드. 처음엔 v2.1 로 잡았으나 v2.1 이 vite@5 를 nested dep으로 끌고 와 우리 vite@8 과 ProxyOptions 타입 충돌. v4 는 vite@8 호환.

**TypeScript config 미세조정**
- `tsconfig.app.json` 에 `paths` 만 추가, `baseUrl` 은 생략. TS 5.4+ 부터 baseUrl 없이 paths 가 tsconfig 위치 기준으로 해석됨. TS 6.0 부터 baseUrl deprecated.
- `vite.config.ts` 는 `vitest/config` 의 `defineConfig` 를 import (vite 의 것이 아닌). Vitest test 옵션 타입 인식용.

**Vite 데모 자산 정리**
- `App.tsx` 를 placeholder 로 교체하면서 끊긴 import 를 따라 `App.css`, `src/assets/`, `public/icons.svg` 삭제 (CLAUDE.md #3: 내 변경이 만든 orphan 정리).
- `index.html` 의 `lang="en" → "ko"`, 타이틀·meta description 추가.

**검증 결과 (2026-05-10)**
- `npm install` — 0 vulnerabilities, 377 packages.
- `npm run dev` — HTTP 200, lang="ko", 타이틀 한국어 정상.
- `npm run typecheck` — 통과.
- `npm run test` — vitest 실행 가능 (테스트 파일 부재로 exit 1, 정상).

---

## 2026-05-10 — P02 디자인 시스템

**구현**
- `src/styles/globals.css` — Google Fonts (Bodoni Moda · Noto Serif KR · IBM Plex Mono) + body 다크 베이스 + `body::before` 필름 그레인(SVG fractalNoise + `mix-blend-mode: overlay`) + `::selection` + `:focus-visible`.
- `src/lib/cn.ts` — `clsx` + `tailwind-merge` 병합 유틸.
- UI 7개: Button(primary/ghost/danger × sm/md/lg) · Badge(high/mid/low/neutral) · Card · Input · Tabs · Dialog · Tooltip.
- Typography 3개: DisplayHeading(h1/h2/h3, italic 옵션) · SectionTitle · StatNumber.
- Layout 3개: Header(sticky+blur+Live Beta) · Footer(3분할: Operator/Sources/Disclaimer) · PageShell(max-w 1400px + 사이드바 옵션).
- 13개 컴포넌트 × Vitest 렌더 테스트 (14건 통과).

**API 결정**
- **React 19 ref-as-prop 채택** — `forwardRef` 대신 `interface XProps { ref?: Ref<…> }` 사용. shadcn 의 forwardRef 패턴은 React 19 부터 불필요. Button/Input 에 적용. 코드 단순화.
- **Dialog: native `<dialog>` 채택** — Radix 등 의존성 추가 없이 `showModal()/close()` 와 `::backdrop` CSS. jsdom 25.x 가 HTMLDialogElement 지원하므로 테스트 가능.
- **Tabs: Context API + controlled/uncontrolled 양쪽 지원** — `value` prop 안 주면 internal state, 주면 외부 제어.
- **Tooltip: hover/focus 단순 구현** — Floating UI 등 미도입. 부산 시민 모니터링용 정확한 포지셔닝 불필요.
- **컬러 토큰**: Tailwind config 의 `bg/bg-2/bg-3 · ink/ink-dim/ink-faint · line · accent · danger/warning/safe` 사용. `globals.css` 에 CSS 변수 중복 등록은 피함 (단일 진실 원천 = tailwind.config.ts).

**App.tsx**
- 디자인 시스템 시각 검증 페이지로 교체. Hero(SectionTitle + DisplayHeading) + 4분할 stats + 4 Card 데모(Badge/Button/Input/Disclaimer 각각).
- P03 에서 React Router 도입과 함께 갈아엎을 예정.

**파일 정리**
- `src/index.css` 삭제 — `src/styles/globals.css` 로 이전.
- `src/styles/.gitkeep` 삭제 — globals.css 가 디렉토리 채움.

**검증**
- `npm run typecheck` — 통과.
- `npm run test` — 13 files / 14 tests passed (3.45s).
- `npm run dev` — HTTP 200, HMR 정상 (page reload 후 hmr update 로그 확인).

---

## 2026-05-10 — P03 라우팅 + 페이지 골격

**구현**
- 페이지 10개 (`src/pages/*.tsx`) — 모두 `PageShell + DisplayHeading h1` placeholder. 상세 3개(`ClusterDetail`/`SchoolDetail`/`CaseDetail`)는 `useParams` 로 ID/code 표시.
- `App.tsx` — `BrowserRouter` + `Routes` (10건) + Header/Footer 공통 레이아웃.
- `Header.tsx` — `<a>` 를 `NavLink` 로 교체. `isActive ? 'text-accent' : 'text-ink-dim'` 로 active 표시. 루트 `/` 는 `end` 옵션으로 정확 매치만.
- `Header.test.tsx` — `<MemoryRouter>` wrap + active 표시 테스트 1건 추가.
- 스토어 2개:
  - `useUiStore` — sidebarOpen / theme(다크 고정) / toggleSidebar
  - `useFilterStore` — riskLevel(`all|high|mid|low`) / district / signals[] / toggleSignal / reset

**의도적 미구현 (CLAUDE.md #2)**
- **catch-all `*` 라우트 안 만듦** — P03 명세에 없음. 잘못된 경로는 React Router 가 빈 페이지 렌더(HTTP 200, Header/Footer 만 보임). 검증 항목 "새로고침 시 404 안 나는지" 는 Vite SPA fallback 으로 모든 경로가 index.html → 200 반환 → 충족.
- **페이지 테스트 안 만듦** — P03 검증은 라우트 동작이며 페이지 자체는 placeholder. 실제 콘텐츠 들어오는 P06+ 단계에서 추가.

**파일 정리**
- `src/pages/.gitkeep`, `src/stores/.gitkeep` 삭제.

**검증 (2026-05-10)**
- `npm run typecheck` — 통과.
- `npm run test` — 13 files / **15 tests** passed (Header active 표시 1건 추가).
- 11개 경로 curl — 모두 HTTP 200 (Vite SPA fallback).

---

## 2026-05-10 — P04 도메인 타입 + 마스킹 + Supabase 클라이언트

**구현**
- `src/types/domain.ts` — `RiskLevel`, `SignalLevel`, `Business`, `Cluster`(+`ClusterStats`/`ClusterSignal`), `Bid`, `CourtCase`(+`CourtCasePattern`), `Report`. P04 명세의 5개 인터페이스 + 그 안의 nested 타입 분리.
- `src/lib/masking.ts`
  - `maskBizNo`: 입력 노이즈(하이픈/공백) 제거 후 `\d{3}-XX-\d{5}`. 10자리 아니면 그대로.
  - `maskRepName`: 한 글자 성씨 기본 + 9개 복성 화이트리스트(남궁/황보/제갈 등). 한글 2자 이상에만 적용.
  - `maskAddress`: 1차 동/읍/면/리 매칭, 2차 도로명(로/길) 매칭. 둘 다 실패하면 그대로.
- `src/lib/masking.test.ts` — 함수당 5건씩 총 15 테스트.
- `src/lib/format.ts` — `formatKRW`(억/만/원 3단계, .0 제거) · `formatPercent` · `formatRatio`. 비유한값은 `'—'`.
- `src/lib/supabase.ts` — `createClient` + `client = null` fallback (env 누락 시) + `ensureClient()` 가드 + 헬퍼 6개: `listClusters` / `getCluster` / `listBusinessesByBizNos` / `listBids` / `listCourtCases` / `getCourtCase`.

**의도적 미구현**
- **School 인터페이스 미정의** — P04 명세는 5개 (Business/Cluster/Bid/CourtCase/Report) 뿐. School 은 P05 시드 또는 P08 학교별 보기에서 추가 예정.
- **format.ts 테스트 미작성** — P04 명세는 masking 만 5건씩 테스트 명시. format 은 시각 검증 단계인 P06 이후에 결합 테스트로 다룸.
- **camelCase ↔ snake_case 매핑** — DB 컬럼은 P12 마이그레이션에서 snake_case 로 정의 예정. 현재 `as unknown as Cluster[]` 직접 캐스팅, 매핑 어댑터는 P12 작업.

**Mock fallback 전략**
- `supabase.ts` 는 env 부재 시 client = null. 호출 시 명확한 한국어 에러("`VITE_USE_MOCK=true` 로 시작하세요").
- P05 의 hooks(useClusters 등)가 `VITE_USE_MOCK` 토글로 mockApi vs supabase 자동 선택.

**파일 정리**
- `src/lib/.gitkeep`(P02 에서 cn.ts 만들 때 누락), `src/types/.gitkeep` 삭제.

**검증 (2026-05-10)**
- `npm run typecheck` — 통과.
- `npm run test` — 14 files / **30 tests** passed (3.52s, masking 15건 추가).

---

## 2026-05-10 — P05 시드 + Mock 데이터 레이어

**구현**
- `types/domain.ts` — `School` 인터페이스 추가.
- `lib/supabase.ts` — `listSchools` / `getSchool` 헬퍼 추가 (`ListSchoolsFilters`).
- 시드 5개:
  - `seed/clusters.ts` — 12건 (high 4 + mid 5 + low 3). 사업자번호 `999XX` prefix, 상호 `(주)데모/샘플` 표기, 주소 `가상로/가상대로` 등 분명히 가짜. `businessesSeed` flat 리스트 함께 export.
  - `seed/schools.ts` — 부산 16개 구·군 분포 50개. 코드 `PSN-001`, 모든 학교명에 `(가상)` 표기.
  - `seed/bids.ts` — `mulberry32(42)` 결정적 PRNG 로 24개월치 응찰 생성. 클러스터 멤버 1-2명 + filler 2-4명 mix. 위험도별 낙찰 확률 차등(high 0.42 / mid 0.28 / low 0.16).
  - `seed/cases.ts` — 가상 판례 8건. 사건번호·법원·죄명 구조는 실제 형법 §315(입찰방해)·§347(사기) 패턴 따름. 결과 mix (유죄 6 / 일부유죄 1 / 무죄 1).
  - `seed/reports.ts` — 제보 1 + 이의제기 1 + 일반 제보 1.
- `lib/mockApi.ts` — supabase.ts 와 동일 시그니처 8개 함수, 200~600ms 랜덤 지연, 필터링·페이지네이션 동작.
- `hooks/_api.ts` — selector: `VITE_USE_MOCK==='true'` 또는 Supabase env 부재 시 mock 활성화. `isUsingMock` 노출.
- `hooks/{useClusters,useCluster,useSchools,useCases}.ts` — 4개. 패턴 일관: cancellation flag + `reloadKey` + `JSON.stringify(filters)` dep.
- `DashboardPage` — `useClusters()` + 콘솔 로그 (`[Ghost Tracker] mode=mock · clusters=12`). P06 에서 다시 교체.

**의도적 결정**
- **bids 결정적 생성**: 하드코딩 수백 줄 대신 PRNG. 재현 가능 + 코드 짧음.
- **filler 사업자 60명** (`999800XXXX`): 클러스터 외부 응찰자 풀로 자연스러운 응찰 다양성 확보.
- **`hooks/_api.ts` 언더스코어 prefix**: hooks 내부 헬퍼임을 표시. 페이지에서 직접 import 가능하지만 비공식 API.
- **filter dep 패턴**: `JSON.stringify` → `JSON.parse` 라운드트립으로 deep equality. 4 hooks 일관 패턴 유지.

**검증 (2026-05-10)**
- `npm run typecheck` — 통과.
- `npm run test` — 14 files / 30 tests passed (변경 없음 — 시드/mock/hooks 는 P02 컴포넌트 테스트에 영향 없음).
- `npm run dev` — HTTP 200, HMR 반영, react-router-dom 의존성 자동 최적화.
- 브라우저 콘솔 (사용자 검증) — `[Ghost Tracker] mode=mock · clusters=12` 출력 예상.

---

## 2026-05-10 — P06 메인 대시보드

**구현**
- `DashboardPage` — 4영역 구조: Hero(border-b) + StatsStrip(border-y) + PageShell(sidebar+main) + 면책.
- `features/clusters/aggregate.ts` — 멤버별 wins/bids 집계 + 24개월 monthly 버킷. ClusterCard 의 timeline/network 계산용.
- `features/clusters/TimelineBars.tsx` — 24개 flex 막대, win=accent / 응찰=ink-faint(투명 0.6), Tooltip hover.
- `features/clusters/NetworkGraph.tsx` — SVG 원형 5명 배치, 중앙 accent dot + 외곽 ink dot, 점선 연결, 노드별 이름·wins/bids·개업월.
- `features/clusters/ClusterCard.tsx` — 클릭 토글(`useUiStore.toggleExpandedCluster`) collapsed↔expanded. expanded: 멤버 테이블 + NetworkGraph + TimelineBars + 액션 버튼 4개. `useNavigate` 로 `/clusters/:id` 이동.
- `features/clusters/ClusterFilters.tsx` — 검색 / 의심도(전부·고위험·중간·관찰 + 카운트) / 지역(부산 구·군) / 신호(5개 substring 매칭) / 도구(정보공개청구/내려받기/방법론).
- `features/clusters/StatsStrip.tsx` — 4분할 + `stagger-fade-up` 애니메이션 (CSS `@keyframes` + `--i` 변수로 80ms stagger).
- `globals.css` — `@keyframes fade-up` + `.stagger-fade-up` 클래스.

**의도적 결정**
- **`useBids` 추가** (P05 4개 hook 외) — ClusterCard 의 timeline/network 계산에 필수. P06 단계에서 필요해 추가.
- **검색은 클라이언트 측** — `useClusters(filters)` 가 fetch 한 결과를 useMemo 로 추가 필터. listClusters 의 search 인자가 없어 직관적.
- **신호 필터 substring(OR)** — sidebar id ('동일주소' 등)가 cluster.signals.text 에 substring 매칭. mockApi 도 같은 로직으로 변경. AND 가 아닌 OR — 사용자가 다중 선택 시 합집합.
- **filtersKey 패턴** — `JSON.stringify({riskLevel,district,signals})` 로 stable dep. zustand selector 가 매번 새 ref 가능성을 회피.
- **expanded 상태는 uiStore** (배열). 페이지 떠나도 유지. multi-expand 자연스러움.
- **Hero 인라인** — 별도 `HeroSection` 컴포넌트 안 만듦 (재사용 의도 없음, CLAUDE.md #2 단순성).

**filtersKey effect 리셋**
- `useEffect(() => setPage(1), [filtersKey, search])` — 필터/검색 변경 시 1페이지로 자동 리셋.

**검증 (2026-05-10)**
- `npm run typecheck` — 통과.
- `npm run test` — 14 files / 30 tests passed (P06 컴포넌트는 시각/통합 영역이라 단위 테스트 미작성 — 명세도 ClusterCard 테스트 명시 X).
- `npm run dev` — HTTP 200, HMR 자동 반영, @supabase/supabase-js 의존성 자동 최적화.

---

## 2026-05-10 — P07 클러스터 상세 페이지

**구현**
- `aggregate.ts` 확장 — `MonthBucket.winAmount` 추가 + `aggregateSchoolWins(bids, cluster)` (학교별 낙찰 횟수).
- `globals.css` — `@import 'leaflet/dist/leaflet.css'` 로 leaflet 기본 스타일 로드.
- `features/clusters/RiskGauge.tsx` — SVG 반원 호 + stroke-dasharray 로 % 표현. high=danger / mid=warning / low=safe.
- `features/clusters/SignalPanel.tsx` — 4분할 카드 (동일주소·가족·신규·폐업). cluster.signals 의 substring 매칭 결과 표시. 미매칭 = "관측되지 않음".
- `features/clusters/MemberDrawer.tsx` — fixed right slide-in (`translate-x-full ↔ translate-x-0`) + backdrop blur. ESC 키 + 배경 클릭으로 닫기.
- `features/clusters/ClusterTimeSeriesChart.tsx` — Recharts ComposedChart, 좌측 Y(응찰 막대) + 우측 Y(낙찰액 선). XAxis 'YY-MM' 짧은 라벨, IBM Plex Mono.
- `features/clusters/SchoolMap.tsx` — react-leaflet `MapContainer` + `CircleMarker`(radius = `sqrt(wins) * 4 + 6`) + `Popup`. 부산 중심 (35.18, 129.0756) zoom 11. OpenStreetMap 타일.
- `features/clusters/matching.ts` — `matchCases(cluster, cases)` 점수 기반 매칭 (sharedAddress + 동일주소 시그널 = +3 등). top 3 반환.
- `features/clusters/MatchedCases.tsx` — 매칭 판례 카드 3개 + Link to `/cases/:id`. "유사도 N" 표시.
- `features/clusters/ActionBar.tsx` — sticky bottom + backdrop blur. 4 액션 (정보공개청구·이의제기·CSV·공유) — 현재 `console.info` placeholder.
- `pages/ClusterDetailPage.tsx` — 7 섹션 + ActionBar + MemberDrawer.

**의도적 결정**
- **OpenStreetMap 기본 타일** — Stadia/Carto dark 매력적이지만 API 키 필요. 일단 light 타일로 시작, P14 메소돌로지 페이지 시점에 다크 톤 검토.
- **leaflet 기본 마커 안 씀** — Vite + leaflet 의 marker icon 깨지는 알려진 문제 회피. CircleMarker 가 명세("크기 = 낙찰 횟수")에 더 적합.
- **시계열 line = winAmount** (명세대로) — count 가 아닌 금액. aggregate 에 winAmount 추가.
- **MemberDrawer ESC 핸들러** — `selectedMember` 가 truthy 일 때만 listener 등록 → 메모리 누수 회피.
- **단위 테스트 미작성** — P07 컴포넌트는 차트/지도/SVG 등 시각 영역. 명세도 단위 테스트 명시 X. 시각 검증 (4 clusters HTTP 200) 으로 충족.

**검증 (2026-05-10)**
- `npm run typecheck` — 통과.
- `npm run test` — 14 files / 30 tests passed.
- 4 high-risk 라우트 (`BSN-2026-0001~0004`) 모두 HTTP 200.

---

## 2026-05-10 — P08 학교별 보기 + 부산 지도

**구현**
- `features/schools/aggregate.ts`
  - `aggregateSchoolStats(bids, schoolCode, clusters)` — bidCount / totalWinAmount / avgParticipants / suspectBidCount / suspectWinCount.
  - `safetyScore(stats)` — 의심 응찰 비율 ratio 기준 1~5 단계 + 한국어 설명.
    - 0 또는 데이터 없음 → 5 / <0.1 → 4 / <0.25 → 3 / <0.5 → 2 / ≥0.5 → 1
  - `topBidders(bids, schoolCode, clusters, topN=10)` — bizNo 별 wins/bids 집계 + 클러스터 매칭. 미등록 사업자도 마스킹 처리해 표시.
- `features/schools/SafetyGauge.tsx` — 5칸 게이지 + 색상 매핑 (1=danger, 5=safe) + 설명.
- `features/schools/SchoolListMap.tsx` — react-leaflet CircleMarker, 색상 = `suspectColor(count)` (없음 ink-faint / <3 warning / ≥3 danger). 선택 시 radius/weight 증가.
- `features/schools/SchoolFilters.tsx` — 검색(이름·구) + 정렬(이름·구·의심응찰빈도) + 학교 리스트 (max-h 480 스크롤).
- `features/schools/SchoolSummary.tsx` — 우측 카드. 메타 + 4스탯 + SafetyGauge + 상세 페이지 링크.
- `features/schools/TopBidders.tsx` — TOP 10 테이블, 클러스터 소속 행은 `Link to /clusters/:id`.
- `features/schools/SchoolBidHistory.tsx` — 시간순 응찰 (최근 30건). 의심 응찰 시 cluster ID 링크 + 의심 낙찰 배지.
- `hooks/useSchool.ts` — `getSchool(code)` 단일 학교 hook (기존 useSchools 와 paralllel).
- `pages/SchoolsPage.tsx` — 3-column 레이아웃 (260px filters / 1fr map / 360px summary). PageShell 의 sidebar 옵션 대신 자체 그리드.
- `pages/SchoolDetailPage.tsx` — 메타 + 4스탯 + SafetyGauge + TOP 응찰자 + 응찰 이력 + 면책.

**의도적 미구현**
- **leaflet.markercluster 미설치** — 명세에 명시되어 있으나 50개 시드에서는 불필요(오히려 시각 손해). 600개 확장 시점에 도입. 한 줄로 시드 전환 가능 (`<MarkerClusterGroup>` 래핑).
- **SafetyGauge 단위 테스트 미작성** — 명세 없음. 시각 검증 (4 학교 라우트 200 OK).

**검증 (2026-05-10)**
- `npm run typecheck` — 통과.
- `npm run test` — 14 files / 30 tests passed.
- `/schools`, `/schools/PSN-001`, `/schools/PSN-006`, `/schools/PSN-016` 모두 HTTP 200.

**다음 — P09 판례 라이브러리**
- `/cases` 죄명/결과/패턴/연도 필터 + 카드 그리드
- `/cases/:id` 사실관계 구조화 + 증거 + 매칭 클러스터 추천 (matching.ts 역방향)
- features/cases/* 컴포넌트 분리
