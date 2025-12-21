-- ==========================================
-- SUPER IMPORTANT: RESET SCRIPT
-- This script drops existing tables to ensure a clean state
-- with the new columns (password, phone) and policies.
-- ==========================================

-- 1. Drop old tables/policies (CASCADE removes policies automatically)
DROP TABLE IF EXISTS garden CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS dhikr CASCADE;

-- 2. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  gender text DEFAULT 'boy', -- boy or girl
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Dhikr Content Table
CREATE TABLE IF NOT EXISTS dhikr (
  id serial PRIMARY KEY,
  title text NOT NULL,
  text text NOT NULL,
  count int DEFAULT 1,
  points int DEFAULT 10,
  category text DEFAULT 'both',
  audio_url text
);

-- 6. Create Garden Table (Points store)
CREATE TABLE IF NOT EXISTS garden (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  points int DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 7. New: Purchased Flowers Table
CREATE TABLE IF NOT EXISTS user_flowers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  flower_type text NOT NULL, -- tulip, rose, sunflower, etc.
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. New: Progress Table
CREATE TABLE IF NOT EXISTS progress (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  dhikr_id int REFERENCES dhikr(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  blooming_date date DEFAULT current_date,
  UNIQUE(user_id, dhikr_id, blooming_date)
);

-- 9. Enable Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhikr ENABLE ROW LEVEL SECURITY;

-- 10. Create Access Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public users access') THEN
        CREATE POLICY "Public users access" ON users FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public garden access') THEN
        CREATE POLICY "Public garden access" ON garden FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public flowers access') THEN
        CREATE POLICY "Public flowers access" ON user_flowers FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public progress access') THEN
        CREATE POLICY "Public progress access" ON progress FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public dhikr access') THEN
        CREATE POLICY "Public dhikr access" ON dhikr FOR ALL USING (true);
    END IF;
END $$;

-- ==========================================
-- 11. UPDATE SECTION (Run this to update an existing database)
-- ==========================================

-- A. Update Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text DEFAULT 'boy';

-- B. Update Garden
ALTER TABLE garden ADD COLUMN IF NOT EXISTS points int DEFAULT 0;

-- C. Create Flowers Table if missing
CREATE TABLE IF NOT EXISTS user_flowers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  flower_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Add Unique Constraint to Progress
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_daily_progress') THEN
        ALTER TABLE progress ADD CONSTRAINT unique_daily_progress UNIQUE (user_id, dhikr_id, blooming_date);
    END IF;
END $$;

-- E. Security for New Table
ALTER TABLE user_flowers ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public flowers access') THEN
        CREATE POLICY "Public flowers access" ON user_flowers FOR ALL USING (true);
    END IF;
END $$;
