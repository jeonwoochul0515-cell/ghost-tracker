-- 003_rls.sql — RLS 정책 + 마스킹 뷰 (idempotent)

-- ─── RLS 활성화 ───────────────────────────────────────────────────────
ALTER TABLE businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids                ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_cases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist_addresses ENABLE ROW LEVEL SECURITY;

-- ─── 공개 SELECT ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "public read clusters" ON clusters;
CREATE POLICY "public read clusters"
  ON clusters FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public read schools" ON schools;
CREATE POLICY "public read schools"
  ON schools FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public read court_cases" ON court_cases;
CREATE POLICY "public read court_cases"
  ON court_cases FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public read cluster_members" ON cluster_members;
CREATE POLICY "public read cluster_members"
  ON cluster_members FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public read bids" ON bids;
CREATE POLICY "public read bids"
  ON bids FOR SELECT TO anon, authenticated USING (true);

-- ─── businesses_public 마스킹 뷰 ──────────────────────────────────────
CREATE OR REPLACE VIEW businesses_public AS
SELECT
  bizno,
  CASE
    WHEN LENGTH(REGEXP_REPLACE(bizno, '\D', '', 'g')) = 10
      THEN SUBSTRING(REGEXP_REPLACE(bizno, '\D', '', 'g') FROM 1 FOR 3)
        || '-XX-'
        || SUBSTRING(REGEXP_REPLACE(bizno, '\D', '', 'g') FROM 6 FOR 5)
    ELSE bizno
  END AS bizno_masked,
  name,
  CASE
    WHEN rep_name ~ '^[가-힣]{2,}$'
      THEN SUBSTRING(rep_name FROM 1 FOR 1) || 'OO'
    ELSE rep_name
  END AS rep_name_masked,
  address_normalized,
  district,
  open_date,
  close_date,
  status,
  industry
FROM businesses;

GRANT SELECT ON businesses_public TO anon, authenticated;

-- ─── businesses 원본은 admin 만 ───────────────────────────────────────
DROP POLICY IF EXISTS "admin full access businesses" ON businesses;
CREATE POLICY "admin full access businesses"
  ON businesses FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ─── reports: 익명 INSERT, admin SELECT/UPDATE ────────────────────────
DROP POLICY IF EXISTS "anon insert reports" ON reports;
CREATE POLICY "anon insert reports"
  ON reports FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin manage reports" ON reports;
CREATE POLICY "admin manage reports"
  ON reports FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ─── whitelist_addresses: admin 만 ────────────────────────────────────
DROP POLICY IF EXISTS "admin manage whitelist" ON whitelist_addresses;
CREATE POLICY "admin manage whitelist"
  ON whitelist_addresses FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
