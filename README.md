# Ghost Bidder Tracker

> 부산 학교급식 유령입찰(분신 응찰) 추적기 — 공익 모니터링 도구

학교급식 식자재 입찰의 **제한최저가 + 추첨** 구조에서, 한 운영자가 가족·지인 명의로
사업자 N개를 만들어 같은 추첨에 분산 응찰하는 "분신술"을 공공데이터와 공개 판례로
탐지·시각화합니다. 부산 시민·기자·연구자가 학교급식 시장 투명성을 점검할 수 있도록
무료로 공개합니다.

**운영주체**: 법무법인 청송 협력 / 부산 시민 공익 모니터링
**상태**: 개발 중 (Vol. 01 — 2026.01.03 ~ 04.30 모니터링 분량 준비)

---

## 데이터 소스

- [공공데이터포털 / eaT](https://www.data.go.kr/) — 학교급식 입찰·낙찰 이력
- [국세청 사업자등록 정보](https://www.data.go.kr/) — 사업자 진위·상태 확인
- [도로명주소](https://business.juso.go.kr/) — 주소 정규화
- [사법정보공유포털](https://portal.scourt.go.kr/) — 학교급식 입찰방해 판례
- 라이선스: 공공누리 1유형

## 기술 스택

- **프론트**: React 19 + Vite + TypeScript
- **스타일**: TailwindCSS (커스텀 컬러 토큰)
- **백엔드**: Supabase (Postgres + Edge Functions + Auth)
- **차트**: Recharts / **지도**: react-leaflet
- **상태**: Zustand / **라우팅**: React Router v6
- **폼**: React Hook Form + Zod / **테스트**: Vitest

## 로컬 개발

요구사항: Node.js 20+ / npm 10+

```bash
# 의존성 설치
npm install

# 환경변수 설정 (mock 모드로 시작 가능)
cp .env.example .env

# 개발 서버
npm run dev          # http://localhost:5173

# 검증
npm run test         # Vitest 단위 테스트
npm run typecheck    # TypeScript 타입 검증
npm run build        # 프로덕션 빌드
```

`.env` 의 `VITE_USE_MOCK=true` 로 두면 Supabase 연결 없이 시드 데이터로 동작합니다.

## Supabase 로컬 개발

요구사항: [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker.

```bash
# 1. 로컬 Supabase 기동 (Postgres + Auth + Storage + Edge Runtime)
supabase start

# 2. 마이그레이션 적용 (supabase/migrations/{001_init,002_indexes,003_rls}.sql)
supabase db reset      # 또는: supabase db push

# 3. 시드 적재 (supabase/seed.sql)
#   db reset 시 자동 적용. 별도 실행:
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" -f supabase/seed.sql

# 4. Edge Functions 로컬 서빙
supabase functions serve --no-verify-jwt

# 5. 프론트 .env 갱신
#   supabase status 출력에서 API URL / anon key 복사
#   VITE_SUPABASE_URL=http://localhost:54321
#   VITE_SUPABASE_ANON_KEY=<anon key>
#   VITE_USE_MOCK=  (비워서 mock 끄기)
```

### 배포 (production)

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                       # 마이그레이션
supabase functions deploy submit-report
supabase functions deploy ingest-eat
supabase functions deploy ingest-nts
supabase functions deploy normalize-addresses
supabase functions deploy recompute-clusters
```

`ingest-eat` / `recompute-clusters` 는 `pg_cron` 또는 GitHub Actions 스케줄로 일배치.

## 폴더 구조

```
src/
  components/   # 공용 UI 컴포넌트
  features/     # 도메인 모듈 (clusters, schools, cases, reports)
  lib/          # supabase, utils, masking, format
  hooks/        # 커스텀 React 훅
  stores/       # Zustand 전역 상태
  types/        # 도메인 타입 정의
  pages/        # 라우트별 페이지
  styles/       # 글로벌 스타일
  test/         # Vitest 설정
```

## 진행 상태

`checklist.md` 참고. 단계별 결정 근거는 `context-notes.md` 에 누적 기록됩니다.

## 법적 가이드라인

- 본 도구는 공개정보 통계 결합으로 산출된 **추정**이며 위법 단정이 아닙니다.
- 사업자번호·대표자명·주소는 마스킹 표시되며, 이의제기는 24시간 내 비공개 처리됩니다.
- 자세한 방법론과 한계는 `/methodology` 페이지 참고.

## 라이선스

- 코드: MIT
- 데이터: 공공누리 1유형
