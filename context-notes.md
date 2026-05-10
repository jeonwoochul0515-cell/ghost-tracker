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

**다음 — P02 디자인 시스템**
- 폰트 import (Bodoni Moda · Noto Serif KR · IBM Plex Mono)
- `src/styles/globals.css` (필름 그레인 노이즈 등)
- 원시 UI 컴포넌트 7개 + 타이포 3개 + 레이아웃 3개
- 각 컴포넌트 Vitest 렌더 테스트 1개씩
