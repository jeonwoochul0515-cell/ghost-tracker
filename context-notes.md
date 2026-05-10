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

**다음 — P04 도메인 타입 + Supabase 클라이언트**
- `src/types/domain.ts` — Business/Cluster/Bid/CourtCase/Report 등 5개 인터페이스
- `src/lib/supabase.ts` — createClient + 환경변수 검증 + 타입 안전 헬퍼
- `src/lib/masking.ts` — maskBizNo / maskRepName / maskAddress + 각 5개 단위 테스트
- `src/lib/format.ts` — formatKRW / formatPercent / formatRatio
