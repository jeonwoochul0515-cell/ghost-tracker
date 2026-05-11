# Changelog

본 프로젝트의 주요 변경사항을 [Conventional Commits](https://www.conventionalcommits.org/) 형식으로 기록합니다.

## [0.2.0] — 2026-05-11 · 실 데이터 모드

### Added
- **실 Supabase 프로덕션 DB** 연결 (region: ap-northeast-2 Seoul, project `jjtsqkphxkxacmtauqzg`)
- 마이그레이션 idempotent 화 (CREATE TABLE/INDEX/SEQUENCE/VIEW IF NOT EXISTS, DROP POLICY IF EXISTS 패턴) + `005_view_security`
- DB ↔ 도메인 매핑 어댑터 (`rowToCluster` / `rowToBid` / `rowToCourtCase` / `rowToSchool`)
- Edge Functions 본격 구현 — `ingest-eat` (페이징 fetch + upsert) · `ingest-nts` (status batch + 매핑)
- 새 신호 **`CROSS_SCHOOL_DELIVERY`** (13번째, weight 40, S 등급) — 발주데이터 받으면 활성화
- `Delivery` 도메인 인터페이스 + `ClusterContext.deliveries?` 옵션
- xls 600 거래처 적재 스크립트 (`scripts/ingest-xls.ts`) + 자동 클러스터링 (39 의심 클러스터 생성)
- xls 분석 스크립트 (`scripts/analyze-xls.ts`) — 동일주소·배송담당자·팩스·핸드폰 공유 그룹 추출
- 시드 풀버전 적재 스크립트 (`scripts/seed-prod.ts`) — TS seed → Supabase upsert
- Cloudflare Pages 배포 + GitHub Actions 자동 배포 워크플로우
- `public/_redirects` + `public/_headers` (Cloudflare SPA fallback + 보안 헤더)

### Changed
- 코드 스플릿: 13 페이지 `React.lazy` + Suspense, `vite manualChunks` (recharts/leaflet/supabase/forms 분리)
  - 단일 1,032 KB → 초기 87 KB gzip (**75% 감소**)
- `supabase/config.toml`: `functions.verify_jwt` 함수별 분리, `db.major_version = 17`
- `.github/workflows/deploy.yml`: Vercel → Cloudflare Pages (cloudflare/wrangler-action@v3)
- 기본 모드: mock (`VITE_USE_MOCK=true`) → 실 Supabase

### Fixed
- `useAuth.ts` 의 무의미한 dynamic import 제거
- xls 적재 시 `clusterer` 3차 거짓 양성 회피 (`familyMinSameSurname: 9999`)
- `openDate` 합성 분산으로 `INCEPTION_CLUSTER` 오발화 방지

### Production Snapshot (2026-05-11)
- businesses **629** (시드 29 + xls 600)
- clusters **51** (시드 12 + 자동 39)
- 강서구 대저동 통합물류 핫스팟 10개 high 등급 자동 검출

---

## [0.1.0] — 2026-05-10 · 초기 빌드 (Vol. 01)

### Added
- 프론트 (Vite + React 19 + TypeScript + TailwindCSS)
- 디자인 시스템 13 컴포넌트 (UI 7 + Typography 3 + Layout 3)
- 라우팅 12 페이지 (대시보드/클러스터/학교/판례/제보/방법론/관리자/약관/개인정보 등)
- 의심도 스코어링 엔진 — 12 신호 + Union-Find 클러스터러 + 통계 검증
- 시드 데이터 (12 클러스터 + 50 학교 + 8 판례 + bids 24개월 결정적 생성)
- Mock API 레이어 + Hooks 6종
- Supabase 마이그레이션 (8 테이블 + 11 인덱스 + RLS + 마스킹 view)
- Edge Functions 5종 (submit-report 실 동작 + 4 placeholder)
- 공공데이터 어댑터 4종 (eaT / NTS / 도로명주소 / 사법정보공유포털)
- 정보공개청구 양식 .doc 생성기
- 관리자 대시보드 (제보 큐, 신호 튜닝, 화이트리스트, 적재 로그)
- 면책·이용약관·개인정보처리방침 페이지
- CI/CD (GitHub Actions + Vercel + Supabase)
- 단위 테스트 84건 (마스킹·신호·클러스터러·스코어러·어댑터)
- 환경변수 가이드 (.env.example) + 기존 프로젝트에서 PUBLIC_DATA_API_KEY 자동 적용

### Notes
- 사법정보공유포털 API 인가 신청 진행 중. 발급 후 cases 시드를 실 데이터로 교체.
- leaflet.markercluster 는 학교 600개로 확장 시 도입 예정.
