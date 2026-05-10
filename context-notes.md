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

## 다음 단계

**P01 — Vite 스캐폴드** 대기 중.
사용자 승인 후 진행.
