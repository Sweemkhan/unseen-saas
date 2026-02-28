-- Unseen App Schema: Journal Entries & Emotion Logs
-- Run this in your Supabase SQL editor

-- ==========================================
-- JOURNAL ENTRIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id
  ON journal_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at
  ON journal_entries(created_at DESC);

-- ==========================================
-- EMOTION LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL CHECK (
    emotion IN (
      'joy', 'calm', 'gratitude', 'hope', 'neutral',
      'anxious', 'sad', 'frustrated', 'angry', 'overwhelmed'
    )
  ),
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user + date queries
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_id
  ON emotion_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_emotion_logs_logged_at
  ON emotion_logs(logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_emotion_logs_entry_id
  ON emotion_logs(entry_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- Journal entries: users can only see/modify their own
CREATE POLICY "Users can manage their own journal entries"
  ON journal_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Emotion logs: users can only see/modify their own
CREATE POLICY "Users can manage their own emotion logs"
  ON emotion_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
