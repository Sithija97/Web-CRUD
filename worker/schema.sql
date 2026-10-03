CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  paper_type TEXT NOT NULL,       -- 'past_paper' | 'model_paper' | 'marking_scheme' | 'notes' | 'other'
  year INTEGER,
  term TEXT,
  description TEXT,
  filename TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_subject ON files (subject);
CREATE INDEX IF NOT EXISTS idx_files_grade ON files (grade_level);
CREATE INDEX IF NOT EXISTS idx_files_paper_type ON files (paper_type);
-- One row per stored object; makes POST /files safely retryable.
CREATE UNIQUE INDEX IF NOT EXISTS idx_files_r2_key ON files (r2_key);
