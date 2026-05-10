# Changelog

본 프로젝트의 주요 변경사항을 [Conventional Commits](https://www.conventionalcommits.org/) 형식으로 기록합니다.

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
