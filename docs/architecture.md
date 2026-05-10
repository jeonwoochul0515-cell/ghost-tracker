# Architecture

## 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
│   React 19 + Vite + TailwindCSS + Recharts + Leaflet         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────▼──────────┐         ┌─────────▼──────────┐
    │  Supabase Edge      │         │  Supabase Postgres │
    │  Functions (Deno)   │ ──────▶ │  + RLS + masked    │
    │                     │         │    view            │
    └──────┬──────────────┘         └────────────────────┘
           │
           │  scheduled (cron)
           ▼
    ┌──────────────────────────────────────────────────────┐
    │  Public APIs                                          │
    │  · eaT (학교급식전자조달)   · 국세청 사업자등록      │
    │  · 도로명주소               · 사법정보공유포털       │
    └──────────────────────────────────────────────────────┘
```

## 데이터 흐름

```
[1] cron (06:00 매일)
    └→ ingest-eat → eaT API → upsert businesses, bids
    └→ ingest-nts → NTS API → 사업자 진위·상태 갱신
    └→ normalize-addresses → 도로명주소 API → address_normalized 채움

[2] cron (03:00 매일)
    └→ recompute-clusters
        ├─ SELECT businesses, bids, whitelist
        ├─ clusterer.ts (Union-Find 3단계)
        ├─ for each group: scorer.ts (12 신호 합산)
        └─ UPSERT clusters, cluster_members

[3] 사용자 요청
    └→ Browser → Supabase REST (anon key)
        ├─ SELECT clusters, schools, court_cases (RLS allow)
        ├─ SELECT businesses_public (마스킹 view)
        └─ INSERT reports (anon allowed)

[4] 관리자
    └→ Browser → Supabase Auth (이메일 매직링크)
        └─ /admin → SELECT/UPDATE reports (RLS admin role)
```

## 모듈 경계

- `src/components/*` — 디자인 시스템 (도메인 무관)
- `src/features/*` — 도메인별 (`clusters` / `schools` / `cases` / `reports` / `scoring`)
- `src/hooks/*` — `useClusters`, `useBids` 등 + `_api.ts` 셀렉터 (mock vs 실)
- `src/lib/*` — `supabase.ts` · `mockApi.ts` · 유틸 (마스킹 / format / cn)
- `src/server/*` — Deno + Node 양립 어댑터·환경 헬퍼
- `src/pages/*` — 라우트별 페이지
- `supabase/*` — 마이그레이션 + Edge Functions + 시드

## 핵심 결정

- **mock 모드 우선** — `VITE_USE_MOCK=true` 면 `mockApi.ts` 활성화. 외부 의존성 없이 데모 가능.
- **마스킹은 SQL view + 어플리케이션 보강** — 공개 화면은 `businesses_public` view 만 노출. 복성·영문 이름은 `maskRepName` 으로 추가 처리.
- **점수 합산 100 클램프** — 신호 weight 누적 후 클램프. high/mid/low 임계는 `scorer.ts` 상수.
- **Union-Find 그룹화** — 사업자 N개 → 클러스터 그룹 (1차 주소 / 2차 대표자 / 3차 가족 휴리스틱).
