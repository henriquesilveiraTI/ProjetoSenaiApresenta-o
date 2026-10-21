CREATE TYPE run_status AS ENUM ('active', 'completed', 'failed', 'abandoned');

CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  nickname varchar(20) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status run_status NOT NULL DEFAULT 'active',
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  lives smallint NOT NULL DEFAULT 3 CHECK (lives BETWEEN 0 AND 3),
  streak smallint NOT NULL DEFAULT 0 CHECK (streak >= 0),
  best_streak smallint NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  current_phase smallint NOT NULL DEFAULT 0 CHECK (current_phase >= 0),
  total_phases smallint NOT NULL DEFAULT 12 CHECK (total_phases > 0),
  correct_count smallint NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count smallint NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  phase_started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  phase_id text NOT NULL,
  phase_index smallint NOT NULL CHECK (phase_index >= 0),
  answer jsonb NOT NULL,
  correct boolean NOT NULL,
  points smallint NOT NULL DEFAULT 0 CHECK (points >= 0),
  duration_ms integer NOT NULL CHECK (duration_ms >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, phase_index)
);

CREATE INDEX runs_player_idx ON runs (player_id, started_at DESC);
CREATE INDEX runs_leaderboard_idx
  ON runs (status, score DESC, correct_count DESC, duration_ms ASC)
  WHERE status IN ('completed', 'failed');
CREATE INDEX answers_run_idx ON answers (run_id, phase_index);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_set_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
