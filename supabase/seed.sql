-- seed.sql — 로컬 supabase 기동 시 자동 적재되는 시연용 시드.
-- 압축적으로 4 cluster + 6 schools + 2 cases + 1 report.
-- 전체 시드는 src/lib/seed/* (TypeScript) 가 권위 데이터.
-- 향후 자동 변환 스크립트로 동기화 예정.

-- ─── businesses ───────────────────────────────────────────────────────
INSERT INTO businesses (bizno, name, rep_name, address, address_normalized, district, open_date, status, industry) VALUES
  ('9991100001', '(주)데모유통A', '김영수', '부산광역시 동래구 가상로 11번길 5 101호', '부산광역시 동래구 가상로 11번길 5', '동래구', '2022-03-12', 'active', '식자재 도소매'),
  ('9991100002', '(주)데모유통B', '김영희', '부산광역시 동래구 가상로 11번길 5 102호', '부산광역시 동래구 가상로 11번길 5', '동래구', '2022-04-01', 'active', '식자재 도소매'),
  ('9991100003', '(주)샘플식품',  '김영민', '부산광역시 동래구 가상로 11번길 5 103호', '부산광역시 동래구 가상로 11번길 5', '동래구', '2022-05-15', 'active', '식자재 도소매'),
  ('9991100004', '데모상사',       '박영수', '부산광역시 동래구 가상로 11번길 5 201호', '부산광역시 동래구 가상로 11번길 5', '동래구', '2022-06-10', 'active', '식자재 도소매'),
  ('9991100005', '샘플무역',       '김영도', '부산광역시 동래구 가상로 11번길 5 202호', '부산광역시 동래구 가상로 11번길 5', '동래구', '2022-07-22', 'active', '식자재 도소매'),
  ('9992100001', '(주)데모푸드',   '이정훈', '부산광역시 연제구 가상대로 88 1층', '부산광역시 연제구 가상대로 88', '연제구', '2021-08-05', 'closed', '식자재 도소매'),
  ('9992100002', '데모푸드코리아', '이정훈', '부산광역시 연제구 가상대로 88 1층', '부산광역시 연제구 가상대로 88', '연제구', '2024-03-15', 'active', '식자재 도소매')
ON CONFLICT (bizno) DO NOTHING;

UPDATE businesses SET close_date = '2024-02-28' WHERE bizno = '9992100001';

-- ─── schools ──────────────────────────────────────────────────────────
INSERT INTO schools (code, name, address, district, lat, lon, student_count) VALUES
  ('PSN-001', '동래데모초등학교 (가상)', '부산광역시 동래구 가상로 11', '동래구', 35.2058, 129.0790, 612),
  ('PSN-002', '동래샘플중학교 (가상)',   '부산광역시 동래구 가상대로 88', '동래구', 35.2104, 129.0815, 488),
  ('PSN-006', '연산데모초등학교 (가상)', '부산광역시 연제구 가상로 77', '연제구', 35.1788, 129.0810, 678),
  ('PSN-011', '해운대데모초등학교 (가상)', '부산광역시 해운대구 가상해변로 12', '해운대구', 35.1631, 129.1635, 720),
  ('PSN-016', '사상데모초등학교 (가상)', '부산광역시 사상구 가상공단로 55', '사상구', 35.1525, 128.9911, 421),
  ('PSN-049', '중구데모초등학교 (가상)', '부산광역시 중구 가상로 7', '중구', 35.1010, 129.0327, 198)
ON CONFLICT (code) DO NOTHING;

-- ─── clusters ─────────────────────────────────────────────────────────
INSERT INTO clusters (id, district, location_label, risk_level, risk_score, period_from, period_to, stats, signals) VALUES
  ('BSN-2026-0001', '동래구', '부산 동래구 가상로 11번길', 'high', 92, '2024-05-01', '2026-04-30',
   '{"schoolCount":18,"totalWinAmount":2840000000,"bidCount":142,"winCount":38,"schoolWinRate":0.27,"expectedRate":0.06,"multiplier":4.5}'::jsonb,
   '[{"text":"동일주소 5인 등록","level":"S+"},{"text":"같은 성씨 4명 가족 추정","level":"A"},{"text":"동일학교 동시응찰 24회","level":"S"},{"text":"낙찰률 4.5× 시장 평균","level":"S"}]'::jsonb),
  ('BSN-2026-0002', '연제구', '부산 연제구 가상대로 88', 'high', 88, '2024-05-01', '2026-04-30',
   '{"schoolCount":12,"totalWinAmount":1620000000,"bidCount":89,"winCount":22,"schoolWinRate":0.25,"expectedRate":0.07,"multiplier":3.6}'::jsonb,
   '[{"text":"폐업 후 같은 주소 재등록","level":"S+"},{"text":"동일 대표자 연속 운영","level":"S"},{"text":"낙찰률 3.6× 시장 평균","level":"A"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cluster_members (cluster_id, bizno) VALUES
  ('BSN-2026-0001', '9991100001'),
  ('BSN-2026-0001', '9991100002'),
  ('BSN-2026-0001', '9991100003'),
  ('BSN-2026-0001', '9991100004'),
  ('BSN-2026-0001', '9991100005'),
  ('BSN-2026-0002', '9992100001'),
  ('BSN-2026-0002', '9992100002')
ON CONFLICT DO NOTHING;

-- ─── court_cases ──────────────────────────────────────────────────────
INSERT INTO court_cases (id, court, verdict, date, summary, pattern, evidence, sentence) VALUES
  ('2023고단1234 (가상)', '부산지방법원', '유죄', '2023-08-14',
   '학교급식 식자재 입찰에서 가족 명의 사업자 4개를 동원해 동일 추첨에 분산 응찰, 당첨 확률을 부풀린 입찰방해 사례.',
   '{"shellCount":4,"relationship":"배우자 · 자녀 · 형제","sharedAddress":true,"sharedPhone":true,"method":"가족 명의 분산 응찰"}'::jsonb,
   '["동일 IP 응찰 로그","주소·연락처 동일성 확인","계좌 자금 흐름 분석","자백 및 참고인 진술"]'::jsonb,
   '징역 1년 6월, 집행유예 2년, 추징 8억'),
  ('2025고단145 (가상)', '서울중앙지방법원', '유죄', '2025-01-30',
   '폐업 후 같은 주소·동일 대표자로 신규 사업자 등록을 반복 (3회 회전). 회당 평균 낙찰 7.5건의 패턴.',
   '{"shellCount":3,"relationship":"동일 대표자 반복 등록","sharedAddress":true,"sharedPhone":true,"method":"폐업 회전"}'::jsonb,
   '["사업자 등록 이력","동일 대표자 인감 사용 기록","예금계좌 연속성"]'::jsonb,
   '징역 1년 4월, 집행유예 2년, 추징 4.2억')
ON CONFLICT (id) DO NOTHING;

-- ─── reports (시연용 1건, 자동 ID) ────────────────────────────────────
INSERT INTO reports (type, target_cluster_id, content, contact_email, status) VALUES
  ('tip', 'BSN-2026-0001',
   '같은 빌라에 등록된 5개 사업자가 우리 학교 입찰에 매번 함께 들어옵니다. 가족 명의로 분산 응찰하는 것 같습니다.',
   'tipster@example.com', 'reviewing');

-- ─── whitelist_addresses ──────────────────────────────────────────────
INSERT INTO whitelist_addresses (address_normalized, reason, added_by) VALUES
  ('부산광역시 강서구 가상시장로 1', '도매시장 — 다수 사업자 정상 입점', 'admin')
ON CONFLICT DO NOTHING;
