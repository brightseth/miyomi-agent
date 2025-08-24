-- Supabase Setup for Miyomi Agent
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS pick_performance CASCADE;
DROP TABLE IF EXISTS picks CASCADE;
DROP TABLE IF EXISTS personality_state CASCADE;

-- Create picks table
CREATE TABLE picks (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  market_id TEXT NOT NULL,
  market_question TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('YES', 'NO')),
  reasoning TEXT NOT NULL,
  consensus_price DECIMAL(3,2) NOT NULL CHECK (consensus_price >= 0 AND consensus_price <= 1),
  miyomi_price DECIMAL(3,2) NOT NULL CHECK (miyomi_price >= 0 AND miyomi_price <= 1),
  post TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance tracking table
CREATE TABLE pick_performance (
  pick_id TEXT PRIMARY KEY REFERENCES picks(id) ON DELETE CASCADE,
  current_price DECIMAL(3,2) NOT NULL CHECK (current_price >= 0 AND current_price <= 1),
  pnl DECIMAL(4,3) NOT NULL,
  pnl_percent DECIMAL(6,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('winning', 'losing', 'flat')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create personality state table
CREATE TABLE personality_state (
  id SERIAL PRIMARY KEY,
  mood TEXT NOT NULL CHECK (mood IN ('chaotic', 'confident', 'sassy', 'philosophical')),
  energy TEXT NOT NULL CHECK (energy IN ('high', 'medium', 'chill')),
  current_vibe TEXT NOT NULL,
  win_rate DECIMAL(3,2) CHECK (win_rate >= 0 AND win_rate <= 1),
  total_picks INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_picks_timestamp ON picks(timestamp DESC);
CREATE INDEX idx_picks_market_id ON picks(market_id);
CREATE INDEX idx_picks_position ON picks(position);
CREATE INDEX idx_performance_status ON pick_performance(status);

-- Create a view for easy stats querying
CREATE OR REPLACE VIEW miyomi_stats AS
SELECT 
  COUNT(DISTINCT p.id) as total_picks,
  COUNT(DISTINCT CASE WHEN pp.status = 'winning' THEN p.id END) as winning_picks,
  COUNT(DISTINCT CASE WHEN pp.status = 'losing' THEN p.id END) as losing_picks,
  ROUND(AVG(CASE WHEN pp.status = 'winning' THEN 1 ELSE 0 END) * 100, 2) as win_rate,
  ROUND(AVG(pp.pnl_percent), 2) as avg_pnl_percent,
  MAX(pp.pnl_percent) as best_pick_pnl,
  MIN(pp.pnl_percent) as worst_pick_pnl
FROM picks p
LEFT JOIN pick_performance pp ON p.id = pp.pick_id;

-- Insert initial personality state
INSERT INTO personality_state (mood, energy, current_vibe, win_rate, total_picks)
VALUES ('confident', 'high', 'market oracle', 0, 0);

-- Grant permissions (RLS is disabled by default for service key)
-- If you want to enable RLS later, add policies here

-- Success message
SELECT 'Supabase tables created successfully for Miyomi!' as message;