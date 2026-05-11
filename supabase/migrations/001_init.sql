-- 001_init.sql — Ghost Bidder Tracker 기본 스키마
-- 8 테이블 + REPORT-YYYY-XXXX 시퀀스. Snake_case 컬럼.

-- ─── businesses ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
  bizno              TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  rep_name           TEXT,
  address            TEXT,
  address_normalized TEXT,
  district           TEXT,
  open_date          DATE,
  close_date         DATE,
  status             TEXT NOT NULL CHECK (status IN ('active', 'closed', 'reopened')),
  industry           TEXT,
  raw_data           JSONB,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── bids ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bids (
  id              TEXT PRIMARY KEY,
  school_code     TEXT,
  school_name     TEXT,
  district        TEXT,
  bid_date        DATE,
  announce_date   DATE,
  category        TEXT,
  estimated_price BIGINT,
  winner_bizno    TEXT,
  participants    TEXT[] NOT NULL DEFAULT '{}',
  raw_data        JSONB
);

-- ─── schools ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  code          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  address       TEXT,
  district      TEXT,
  lat           DOUBLE PRECISION,
  lon           DOUBLE PRECISION,
  student_count INTEGER
);

-- ─── clusters ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clusters (
  id             TEXT PRIMARY KEY,
  district       TEXT,
  location_label TEXT,
  risk_level     TEXT NOT NULL CHECK (risk_level IN ('high', 'mid', 'low')),
  risk_score     INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  period_from    DATE,
  period_to      DATE,
  stats          JSONB,
  signals        JSONB,
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cluster_members (composite PK) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_members (
  cluster_id TEXT NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  bizno      TEXT NOT NULL REFERENCES businesses(bizno) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cluster_id, bizno)
);

-- ─── court_cases ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS court_cases (
  id             TEXT PRIMARY KEY,
  court          TEXT,
  verdict        TEXT NOT NULL CHECK (verdict IN ('유죄', '무죄', '일부유죄')),
  date           DATE,
  summary        TEXT,
  pattern        JSONB,
  evidence       JSONB,
  sentence       TEXT,
  full_text_url  TEXT
);

-- ─── reports (REPORT-YYYY-XXXX 자동 ID) ───────────────────────────────
CREATE SEQUENCE IF NOT EXISTS reports_seq START 1;

CREATE TABLE IF NOT EXISTS reports (
  id                TEXT PRIMARY KEY DEFAULT
                    'REPORT-' || EXTRACT(YEAR FROM NOW())::TEXT
                    || '-' || LPAD(NEXTVAL('reports_seq')::TEXT, 4, '0'),
  type              TEXT NOT NULL CHECK (type IN ('tip', 'objection')),
  target_cluster_id TEXT,
  target_bizno      TEXT,
  content           TEXT NOT NULL CHECK (CHAR_LENGTH(content) >= 10),
  contact_email     TEXT,
  status            TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'resolved')),
  history           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── whitelist_addresses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whitelist_addresses (
  address_normalized TEXT PRIMARY KEY,
  reason             TEXT,
  added_by           TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
