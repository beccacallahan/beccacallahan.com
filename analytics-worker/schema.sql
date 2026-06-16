CREATE TABLE IF NOT EXISTS daily_stats (
  day TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_visitors (
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day, visitor_hash)
);

CREATE TABLE IF NOT EXISTS daily_dimension_visitors (
  day TEXT NOT NULL,
  dimension TEXT NOT NULL,
  label TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day, dimension, label, visitor_hash)
);

CREATE TABLE IF NOT EXISTS page_stats (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);

CREATE TABLE IF NOT EXISTS referrer_stats (
  day TEXT NOT NULL,
  referrer TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, referrer)
);

CREATE TABLE IF NOT EXISTS country_stats (
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country)
);

CREATE TABLE IF NOT EXISTS device_stats (
  day TEXT NOT NULL,
  device TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, device)
);

CREATE TABLE IF NOT EXISTS browser_stats (
  day TEXT NOT NULL,
  browser TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, browser)
);

CREATE INDEX IF NOT EXISTS idx_page_stats_day ON page_stats(day);
CREATE INDEX IF NOT EXISTS idx_referrer_stats_day ON referrer_stats(day);
CREATE INDEX IF NOT EXISTS idx_country_stats_day ON country_stats(day);
CREATE INDEX IF NOT EXISTS idx_device_stats_day ON device_stats(day);
CREATE INDEX IF NOT EXISTS idx_browser_stats_day ON browser_stats(day);
CREATE INDEX IF NOT EXISTS idx_daily_dimension_visitors_day ON daily_dimension_visitors(day);
