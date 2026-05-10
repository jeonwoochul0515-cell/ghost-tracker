# Threat Model

## 보안 위협

### T1. RLS 우회로 비공개 데이터 노출
- **시나리오**: 클라이언트가 service-role key 로 직접 쿼리.
- **완화**: anon key 만 프론트 노출. service-role 은 Edge Functions 환경변수 한정.

### T2. SQL Injection
- **시나리오**: 검색 input 이 raw SQL 로 전달.
- **완화**: 모든 쿼리는 Supabase 클라이언트(parameterized) 사용. `lib/supabase.ts`.

### T3. XSS (제보 폼)
- **시나리오**: 제보 본문에 `<script>` 가 admin 화면에 그대로 렌더.
- **완화**: React 가 기본 escape. `dangerouslySetInnerHTML` 사용 금지 (lint 룰).

### T4. CSRF (관리자 액션)
- **시나리오**: admin 인증 쿠키 탈취 후 cluster 비공개 처리.
- **완화**: Supabase Auth JWT (Bearer) 사용. SameSite=Lax 쿠키.

### T5. 파일 업로드 공격
- **시나리오**: 제보 첨부에 악성 파일.
- **완화**: P12 시드 단계는 첨부 미구현. 도입 시 mime sniff + 크기 제한 + 별도 버킷 + virus scan.

### T6. API 키 유출
- **시나리오**: PUBLIC_DATA_API_KEY 가 프론트 번들에 포함.
- **완화**: 본 프로젝트의 모든 외부 API 호출은 Edge Functions 경유. 프론트는 Supabase anon key 만.

## 법적 위협

### L1. 명예훼손 / 신용훼손
- **시나리오**: 무고한 사업자가 "유령사업자" 로 표시되어 영업 손해.
- **완화**: (1) 단정 표현 금지 (`wording.ts`), (2) 마스킹, (3) 24h 이의제기 SLA, (4) 면책 표시 자동 노출.

### L2. 개인정보 보호법 위반
- **시나리오**: 제보 본문에 제3자 개인정보 포함되어 admin 외 노출.
- **완화**: RLS 로 admin 만 SELECT. 보존 기간 명시 (1년).

### L3. 공공데이터 라이선스 위반
- **시나리오**: 공공누리 1유형 의무(출처 표시) 누락.
- **완화**: Footer + 각 데이터 표시 옆에 출처 메타. methodology 페이지 명시.

## 운영 위협

### O1. 외부 API 장애
- **시나리오**: eaT API 다운으로 일배치 실패.
- **완화**: fetchWithRetry (3회 + backoff). 실패 시 structured log + 다음 배치까지 stale 데이터 유지.

### O2. 트래픽 스파이크
- **시나리오**: 보도 후 동시 접속 폭주.
- **완화**: Vercel CDN + Supabase 자동 스케일. SELECT 쿼리는 인덱스 강제.

### O3. 데이터 신선도
- **시나리오**: 사업자 폐업 후 며칠간 active 표시.
- **완화**: methodology 에 갱신 주기 명시. 사용자 기대치 정렬.
