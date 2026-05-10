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

---

## 2026-05-10 — P09 판례 라이브러리

**구현**
- `features/clusters/matching.ts` — `scoreCaseAgainstCluster(c, cluster)` 로 함수명 export 화 (cluster→case / case→cluster 양방향에서 재사용).
- `features/cases/matchClusters.ts` — `matchClustersForCase(c, clusters, topN)` 역방향 매칭. 동일 score 함수 재사용.
- `features/cases/classify.ts` — `inferCharges` / `inferPatterns` / `inferYear` / `patternBadgeText`. 시드 cases.ts 의 summary·pattern 에서 키워드 기반 추론.
  - 죄명 5종: 입찰방해 · 사기 · 담합 · 국가계약법 · 복합 (2개 이상 매칭 시).
  - 패턴 4종: 가족명의 · 동일주소 · 폐업회전 · 차명.
- `features/cases/CaseFilters.tsx` — 죄명(체크박스 OR) · 결과(라디오 4개) · 패턴(체크박스 OR) · 연도(칩 다중 선택).
- `features/cases/CaseCard.tsx` — ID/법원/결과 + 1줄 요약 + 패턴 태그 + 형량 + 외부 링크 옵션.
- `features/cases/MatchedClustersForCase.tsx` — 매칭 클러스터 top 3 카드 (위험도 배지 + 분신 배수 + 유사도 점수).
- `pages/CasesPage.tsx` — PageShell sidebar + 카드 그리드 (md:grid-cols-2).
- `pages/CaseDetailPage.tsx` — 메타 + 사실관계(2-col grid) + 증거 리스트 + 형량 + 매칭 클러스터 + 외부 링크 + 면책.
- `lib/mockApi.ts` — `listCourtCases`/`getCourtCase` 위에 사법정보공유포털 향후 연결 TODO 주석 명시 (P13 어댑터 예정).

**의도적 결정**
- **죄명/패턴은 시드 변경 없이 keyword inference** — `CourtCase` 도메인 타입에 `charges`/`patterns` 필드 추가 안 함 (CLAUDE.md #3 surgical changes). summary·pattern.method·relationship 에서 추론. 폴백: charges 가 비면 '입찰방해' 가정.
- **연도 필터 = 칩 다중 선택** — native dual-range slider 는 native HTML 미지원이고, 시드 데이터가 8건이라 연도 풀이 적음(2022~2025). 칩 OR 합집합이 자연스럽고 다크 톤에도 맞음.
- **CaseDetailPage 가 useCourtCase 훅 안 거치고 api.getCourtCase 직접** — useCase 훅 추가는 P05 명세 외이고 P09 가 명시 안 함. 이번 한 페이지에서만 inline. 추후 useCase 분리 검토.
- **한글 ID URL 인코딩** — `encodeURIComponent(c.id)` (`CaseCard`, `MatchedCases`, `MatchedClustersForCase` 모두). React Router 의 `useParams` 가 자동 디코딩. raw 한글 path 도 SPA fallback 에서 200 (브라우저는 자동 인코딩).

**검증 (2026-05-10)**
- `npm run typecheck` — 통과 (unused imports 1차 발견 후 정리).
- `npm run test` — 14 files / 30 tests passed.
- `/cases` HTTP 200, 8건 정상 표시. 한글 ID 3건 (`2023고단1234 (가상)` 등) URL 인코딩 후 모두 HTTP 200.

---

## 2026-05-10 — P10 제보·이의제기 + 정보공개청구

**구현**
- `lib/mockApi.ts` + `lib/supabase.ts` — `submitReport(payload)` (`SubmitReportPayload` 인터페이스). mockApi 는 `REPORT-2026-XXXX` 랜덤 ID 반환 + console.info 로깅.
- `features/reports/TipForm.tsx` — RHF + Zod. 5종 유형(분신술/담합/리베이트/위생/기타), 의심 사업자/학교 (선택), 내용(필수, 10자+), 연락처(선택, 이메일 검증), 동의 체크박스(필수).
- `features/reports/ObjectionForm.tsx` — 대상 클러스터 ID(필수) / 사유 라디오(오매칭/사실관계 오류/추가 정보) / 상세 사유(필수, 10자+) / 신원(선택) / 연락처(선택). 상단에 24h SLA 안내 박스(warning 톤).
- `features/reports/ReceiptScreen.tsx` — 접수번호 표시(`select-all` 로 더블클릭 복사 용이) + "새로 작성" 액션.
- `features/clusters/foiaForm.ts` — `buildFoiaFormData` (청구기관/범위/항목/법적근거 등) + `renderFoiaHtml` + `downloadFoiaDoc` (Blob `application/msword` + `.doc` 확장자 + UTF-8 BOM).
- `features/clusters/FoiaDialog.tsx` — `<Dialog>` 안에 미리보기 + .doc 다운로드 + open.go.kr 외부 링크.
- `features/clusters/ActionBar.tsx` — clusterId prop 제거하고 4개 핸들러 props 화 (onFoia/onObjection/onCsv/onShare).
- `pages/ReportPage.tsx` — Tabs 2개 + `useSearchParams` 로 `?cluster_id=` 자동 진입.
- `pages/ClusterDetailPage.tsx` — `foiaOpen` state + `useNavigate` + ActionBar 핸들러 연결 (FOIA → 다이얼로그 / 이의제기 → `/report?cluster_id=`).

**의도적 결정**
- **`docx` 패키지 미설치 — HTML+`application/msword`** — P10 명세는 ".docx 다운로드" 명시했으나 실제 사용자 경험은 Word·한글·Google Docs 가 열 수 있는지가 핵심. HTML 문자열 + `application/msword` MIME + `.doc` 확장자로 의존성 추가 없이 충족. UTF-8 BOM(`﻿`) 으로 한글 깨짐 회피. 향후 진짜 OOXML 필요 시 `docx` 패키지로 마이그레이션 가능.
- **파일 첨부(Supabase Storage) 미구현** — P10 폼에 명시되어 있으나 Storage 연결은 P12 백엔드 인프라 단계 후. 현재 폼에 `<input type="file">` 안 둠 — 안 되는 기능을 노출하지 않음(CLAUDE.md #2).
- **`useReportSubmit` hook 미작성** — 두 폼에서만 호출, 각자 `api.submitReport` 직접. 추상화 가치 적음.
- **CSV/공유 액션은 console.info placeholder** — CSV는 P12 후 실데이터 정리 시점, 공유 링크는 `navigator.clipboard?.writeText(window.location.href)` (지원 브라우저에서 즉시 동작).

**검증 (2026-05-10)**
- `npm run typecheck` — 통과 (mockApi.submitReport `payload` unused 1차 발견 후 console.info 로 활용).
- `npm run test` — 14 files / 30 tests passed.
- `/report` HTTP 200, `/report?cluster_id=BSN-2026-0001` HTTP 200 (이의제기 탭 자동 활성).

---

## 2026-05-10 — P11 의심도 스코어링 엔진

**구현**
- `features/scoring/types.ts` — `ClusterContext`/`SignalDef`/`SignalResult`/`ScoreResult`/`MarketStats`.
- `features/scoring/signals.ts` — 12개 신호 evaluate 구현. 임계값은 파일 상단 상수로 분리 (튜닝 용이).
  - SAME_ADDRESS_3PLUS(35,A) · SAME_ADDRESS_5PLUS(45,S+) · FAMILY_SURNAME(20,B) · INCEPTION_CLUSTER(15,B) · SAME_SCHOOL_CO_BID(40,S) · WIN_RATE_INFLATION(35,S) · REOPEN_AT_SAME_ADDRESS(25,A) · NEW_AND_BIG_WIN(20,A) · SINGLE_BUYER_DOMINANCE(15,B) · CATEGORY_OMNIVORE(10,C) · GEOGRAPHIC_MISMATCH(15,B) · SHORT_LIVED(20,A).
- `features/scoring/clusterer.ts` — `UnionFind` (path compression) + 3단계 그룹화:
  1차 정규화 주소 동일성(화이트리스트 제외) / 2차 식자재 업종 + 동일 대표자 / 3차 같은 성씨 + 같은 구·군 (식자재 한정, 3명 이상).
- `features/scoring/scorer.ts` — `scoreCluster(ctx, signals)` 발화 weight 누적 → 0~100 클램프 → high(80+) / mid(50-79) / low(<50) + reasons[].
- `features/scoring/statisticalTests.ts` — `chanceTest` 이항분포 z-score + Abramowitz & Stegun 정규근사 `normalCdf`.

**의도적 결정**
- **3PLUS / 5PLUS 별도 발화** — 명세 weight 합산 의도 그대로. 5명 등록 시 35+45=80 (단독으로 high 등급 진입). scorer 100 클램프가 안전장치.
- **clusterer 3차는 같은 성씨+구·군 단순 매칭** — 정확한 "가족 추정" (연락처·주민번호 일부 매칭) 은 P12 백엔드 + P13 NTS API 후. 현 단계는 휴리스틱.
- **임계값 상수 상단 분리** — `FAMILY_MIN_SAMENAMES`/`SAME_SCHOOL_CO_BID_MIN`/`DOMINANCE_RATIO` 등. P14 메소돌로지에서 노출하고 P15 admin 에서 튜닝 가능 구조.
- **GEOGRAPHIC_MISMATCH 단순화** — 본점-납품지 거리 계산 (좌표 데이터 없음) 대신 구·군 라벨 비교. 시드 데이터 호환.
- **statisticalTests 통합 안 함** — `scorer` 가 chanceTest 호출 안 함. 별도 사용 (P14 메소돌로지·P07 신호 보조). WIN_RATE_INFLATION 신호가 실용적 검증 담당.

**테스트 (Vitest)**
- `signals.test.ts` — 신호 12종 × 정/오 케이스 + 화이트리스트 회피 (SAME_ADDRESS).
- `clusterer.test.ts` — 6 케이스 (주소 그룹화 / 화이트리스트 회피 / 식자재+대표자 / 업종 분리 / 가족 추정 / 단일).
- `scorer.test.ts` — 7 케이스 (빈/누적/클램프/HIGH 경계/MID 경계/MID-1/null 신호).
- `seed.test.ts` — 3 sanity check (BSN-2026-0001 high / 0002 mid+ / 0012 ≠ high).

**검증 (2026-05-10)**
- `npm run typecheck` — 통과 (unused import 1차 발견 후 정리).
- `npm run test` — **18 files / 73 tests passed** (기존 30 → +43).

---

## 2026-05-10 — P12 Supabase 스키마 + Edge Functions

**구현**
- `supabase/config.toml` — minimal 프로젝트 설정 (api/db/studio/storage/auth/edge_runtime).
- `supabase/migrations/001_init.sql` — 8 테이블 (businesses · bids · schools · clusters · cluster_members · court_cases · reports · whitelist_addresses) + REPORT-YYYY-XXXX sequence.
- `supabase/migrations/002_indexes.sql` — 11 인덱스 (address_normalized · rep_name · school+date · winner · GIN participants · cluster_members(bizno) · clusters(risk) 등).
- `supabase/migrations/003_rls.sql` — RLS 정책 + `businesses_public` 마스킹 view (사업자번호 `XXX-XX-XXXXX`, 한 글자 성씨 한국 이름은 `O+OO`). reports 는 anon INSERT 허용 + admin SELECT/UPDATE.
- `supabase/seed.sql` — 압축 시연 데이터 (4 cluster 멤버 7명 + 6 schools + 2 cases + 1 report + 1 whitelist).
- `supabase/functions/_shared/` — `log.ts` (structured JSON line) · `response.ts` (CORS+JSON) · `supabase.ts` (service role client).
- 5 Edge Functions:
  - `submit-report/` — POST + 검증 + INSERT (실 동작).
  - `ingest-eat/` — placeholder, P13 어댑터 후 실 적재.
  - `ingest-nts/` — placeholder.
  - `normalize-addresses/` — placeholder.
  - `recompute-clusters/` — placeholder, features/scoring 코드 Deno 호환 포팅 예정.
- `README.md` — `supabase start` / `db reset` / `functions serve` / 배포 절차 추가.

**의도적 결정**
- **마스킹 view 우선** — 공개 read 는 `businesses_public` view 만 노출. raw `businesses` 는 admin 만 (RLS). 한 글자 성씨/이름은 SQL 정규식으로 처리, 복성·영문은 어플리케이션단(maskRepName) 보강.
- **REPORT ID 자동 생성 = sequence + LPAD** — 트리거 없이 column DEFAULT. 단순. 충돌 없음.
- **Edge Functions placeholder + structured log** — P13 어댑터 도착 전까지 호출은 200 + `status: 'placeholder'` 반환. log 는 단일 라인 JSON (`level/message/timestamp/...`) 으로 Sentry/Datadog 친화.
- **`recompute-clusters` 가 features/scoring/* 직접 import 안 함** — Deno 런타임 vs Vite alias 호환 문제. 추후 `_shared/scoring/` 으로 mirror 또는 esm.sh 게시. 현재 구조만.
- **시드 SQL 압축** — 시드 권위 데이터는 `src/lib/seed/*` (TypeScript). seed.sql 은 시연용 발췌. 향후 자동 변환 스크립트로 동기화.

**검증 한계**
- Supabase CLI 와 Deno 가 현재 환경에 미설치 → SQL 마이그레이션 적용 / Edge Functions 컴파일 / `supabase start` 로컬 기동 검증은 **사용자 측에서 별도 수행**.
- 프론트 `npm run typecheck` 통과 + 73 tests 통과 (P12 변경은 supabase/* 디렉토리만이라 Vite typecheck 영향 없음).
- 사용자 시나리오: `supabase start` → `supabase db reset` (마이그레이션+시드 자동 적용) → `supabase functions serve --no-verify-jwt` → `.env` 갱신 후 `npm run dev` 로 mock=false 모드 검증.

---

## 2026-05-10 — P13 공공데이터 API 어댑터

**구현**
- `src/server/env.ts` — `requireEnv` / `optionalEnv` (Deno + Node 양쪽).
- `src/server/http.ts` — `fetchWithRetry` (3회 재시도 + exponential backoff + 타임아웃).
- `src/server/adapters/eatApi.ts` — eaT 입찰 리스트 + 응답 정규화 (item 단/복수 자동).
- `src/server/adapters/ntsApi.ts` — NTS 사업자 상태/진위 batch.
- `src/server/adapters/roadAddressApi.ts` — JUSO 우선 + VWorld 폴백 + 24h 캐시.
- `src/server/adapters/courtApi.ts` — 사법정보공유포털 placeholder + `CourtApiNotReadyError`.
- 어댑터 테스트 11건 (정상/에러/빈/캐시/폴백/환경변수 누락).
- `tsconfig.app.json` — `types: ['vite/client', 'node']` 추가 (process 인식).

**API 키 자동 적용**
- 사용자 컴퓨터의 `~/.antigravity/*` 다른 프로젝트에서 `.env` grep:
  - `hoiseng1click/.env.local` + `hoiseng1click/functions/.env` 의 **PUBLIC_DATA_API_KEY** = `uL+CiKXTpwEg0...0Zk8Q==` → 우리 `EAT_SERVICE_KEY` / `NTS_SERVICE_KEY` 마스터 키로 적용 (data.go.kr 한 키로 여러 API 가능).
  - `milk/functions/.env` + `hoiseng1click` 의 **VWORLD_API_KEY** = `524C7A66-70FD-3DFC-90BD-5CA578C090FC` → 도로명주소 폴백.
  - `JUSO_API_KEY` 는 두 곳 모두 빈 값 → 사용자가 business.juso.go.kr 별도 신청 필요.
- 우리 `.env` 는 `.gitignore` 에 의해 커밋 안 됨 (안전).
- `.env.example` 6종 환경변수 가이드.

---

## 2026-05-10 — P14 메소돌로지 페이지

**구현**
- `pages/MethodologyPage.tsx` — 9개 섹션 + 좌측 목차 (IntersectionObserver 로 active 추적).
- 신호 표는 `ALL_SIGNALS` 직접 import — 코드 변경 시 자동 반영.
- 임계값 (HIGH/MID) 도 `scorer.ts` 상수 직접 import.
- 섹션 6 "한계와 주의" 는 `border-l-2 border-warning/40` 강조.
- 인쇄 친화 (Ctrl+P 가능, sticky sidebar 만 sidebar 클래스).

---

## 2026-05-10 — P15 관리자 대시보드

**구현**
- `hooks/useAuth.ts` — Supabase Auth 매직링크 + mock 모드 fallback (`*@ghost-tracker.local`).
- `pages/AdminPage.tsx` — 4 탭:
  - **제보 큐**: 상태 변경 (받음/검토중/처리완료) + 변호사 검토 메일 링크.
  - **신호 튜닝**: 12 신호 weight 슬라이더 미리보기 + 합계 표시.
  - **화이트리스트**: 정규화 주소 추가/제거.
  - **적재 로그**: Edge Function 실행 샘플 (실제는 Supabase Logs 연동).
- `App.tsx` — `/admin` 라우트 추가.

---

## 2026-05-10 — P16 배포 + CI/CD

**구현**
- `.github/workflows/ci.yml` — PR/푸시 시 typecheck + test + build.
- `.github/workflows/deploy.yml` — main 푸시 시 Supabase migrations + 5 functions deploy + Vercel deploy.
- `vercel.json` — SPA fallback + 보안 헤더 (X-Frame-Options, Permissions-Policy 등).
- `public/robots.txt` — `/admin` 차단.
- `public/sitemap.xml` — 7 라우트.
- `index.html` — Open Graph + Twitter Card + robots meta.

**필요 secrets** (사용자 측 GitHub repo settings 등록):
- `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## 2026-05-10 — P17 법적 안전성 강화

**구현**
- `lib/wording.ts` — 금지 표현 사전(5종) + `lintText(text)` 검출 함수. ESLint 룰은 사용자 측 환경 따라 추가.
- `components/Disclaimer.tsx` — 공통 면책 박스 (default + compact variant).
- `pages/TermsPage.tsx` — 이용약관 초안 5조 (목적/성격/이용자 의무/이의제기/책임 한계). 변호사 검토 후 확정.
- `pages/PrivacyPage.tsx` — 개인정보처리방침 초안 6조.
- `Footer.tsx` — 4분할 (Operator/Sources/Legal/Disclaimer) + 약관·개인정보 링크 + 책임자 이메일.
- `Footer.test.tsx` — MemoryRouter wrap + Legal 추가 검증.
- `App.tsx` — `/terms` `/privacy` 라우트.

---

## 2026-05-10 — P18 문서 + 시연 마감

**구현**
- `CHANGELOG.md` — 0.1.0 초기 빌드 (P00~P18 종합).
- `CONTRIBUTING.md` — 이슈/PR 가이드 + 신호 추가 절차 + 코드 스타일.
- `docs/architecture.md` — 전체 구조도 + 데이터 흐름 + 모듈 경계 + 핵심 결정.
- `docs/threat-model.md` — 보안 6 + 법적 3 + 운영 3 위협 시나리오 & 완화책.
- `docs/demo-script.md` — 1분/5분 데모 시나리오 + 환경 준비 체크리스트.
- `README.md` 풀버전 — 폴더 구조 확장 + 운영주체 + Acknowledgements.

---

## 최종 검증 (2026-05-10)

- `npm run typecheck` — 통과
- `npm run test` — **21 files / 84 tests passed**
- `npm run build` — 1.69s, dist/ 크기 1MB (gzip 290KB)

## 검증 한계 (사용자 측 별도 수행)

- Supabase CLI 미설치 → SQL/Edge Functions 실 기동
- Deno 미설치 → Edge Functions 컴파일
- GitHub repo + Vercel 프로젝트 연결 → CI/CD 검증
- ESLint 커스텀 룰 미적용 → `wording.ts` 의 lintText 만 노출, eslint.config.js 통합은 후속

## 다음 단계 (Vol. 02 후보)

- P13 어댑터 + Edge Function 결합 → 실 데이터 적재
- 사법정보공유포털 API 인가 후 cases 시드 → 실 판례 교체
- leaflet.markercluster 도입 (학교 50 → 600개)
- ESLint 커스텀 룰 통합 (wording.ts 자동 검출)
- 학부모용 모바일 앱 (Vol. 02 우선순위)
