-- Run this in your Supabase SQL editor to set up the Writo database

CREATE TABLE IF NOT EXISTS language_progress (
  language VARCHAR(5) PRIMARY KEY,
  cefr_level VARCHAR(5) NOT NULL DEFAULT 'A1',
  total_submissions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_submission_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the 4 languages
INSERT INTO language_progress (language) VALUES ('es'), ('it'), ('fr'), ('zh')
ON CONFLICT (language) DO NOTHING;

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language VARCHAR(5) NOT NULL,
  date DATE NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_type VARCHAR(50) NOT NULL,
  target_words TEXT[],
  instructions TEXT,
  difficulty VARCHAR(5) NOT NULL DEFAULT 'A1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(language, date)
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) NOT NULL,
  language VARCHAR(5) NOT NULL,
  user_text TEXT NOT NULL,
  feedback JSONB,
  estimated_level VARCHAR(5),
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language VARCHAR(5) NOT NULL,
  from_level VARCHAR(5),
  to_level VARCHAR(5) NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_lang_date ON prompts(language, date);
CREATE INDEX IF NOT EXISTS idx_submissions_lang ON submissions(language);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_level_history_lang ON level_history(language);

-- Writo is single-user and only ever accessed through our own server using the
-- service role key (never the anon key from a browser), so Row Level Security
-- adds no protection here and only blocks legitimate writes. Disable it.
ALTER TABLE language_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE level_history DISABLE ROW LEVEL SECURITY;
