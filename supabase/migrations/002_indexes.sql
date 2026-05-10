-- 002_indexes.sql — 검색·조인 패턴에 따른 인덱스

CREATE INDEX idx_businesses_address_normalized
  ON businesses (address_normalized);

CREATE INDEX idx_businesses_rep_name
  ON businesses (rep_name);

CREATE INDEX idx_businesses_district_status
  ON businesses (district, status);

CREATE INDEX idx_bids_school_date
  ON bids (school_code, bid_date DESC);

CREATE INDEX idx_bids_winner
  ON bids (winner_bizno);

CREATE INDEX idx_bids_date
  ON bids (bid_date DESC);

CREATE INDEX idx_bids_participants_gin
  ON bids USING GIN (participants);

CREATE INDEX idx_cluster_members_bizno
  ON cluster_members (bizno);

CREATE INDEX idx_clusters_risk
  ON clusters (risk_level, risk_score DESC);

CREATE INDEX idx_court_cases_date
  ON court_cases (date DESC);

CREATE INDEX idx_reports_status_created
  ON reports (status, created_at DESC);
