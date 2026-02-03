
-- Create Professors Table
CREATE TABLE IF NOT EXISTS professors (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  password text NOT NULL,
  subject text,
  additional_subjects text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  created_by text REFERENCES professors(id) ON UPDATE CASCADE NOT NULL,
  content jsonb NOT NULL,
  subject text,
  category text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  created_by text REFERENCES professors(id) ON UPDATE CASCADE NOT NULL,
  content jsonb NOT NULL,
  subject text,
  category text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  created_by text REFERENCES professors(id) ON UPDATE CASCADE NOT NULL,
  content jsonb NOT NULL,
  subject text,
  category text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  created_by text REFERENCES professors(id) ON UPDATE CASCADE NOT NULL,
  content jsonb NOT NULL,
  subject text,
  category text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Validations Table
CREATE TABLE IF NOT EXISTS validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  validator_id text REFERENCES professors(id) ON UPDATE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(content_id, validator_id)
);

-- Insert 10 Mock Professors
INSERT INTO professors (id, display_name, password) VALUES
('LUCID_PROF_01', 'Prof. Alan Turing', 'welcome123'),
('LUCID_PROF_02', 'Prof. Ada Lovelace', 'welcome123'),
('LUCID_PROF_03', 'Prof. Richard Feynman', 'welcome123'),
('LUCID_PROF_04', 'Prof. Marie Curie', 'welcome123'),
('LUCID_PROF_05', 'Prof. Albert Einstein', 'welcome123'),
('LUCID_PROF_06', 'Prof. Isaac Newton', 'welcome123'),
('LUCID_PROF_07', 'Prof. Grace Hopper', 'welcome123'),
('LUCID_PROF_08', 'Prof. Nikola Tesla', 'welcome123'),
('LUCID_PROF_09', 'Prof. Katherine Johnson', 'welcome123'),
('LUCID_PROF_10', 'Prof. Stephen Hawking', 'welcome123');

-- Create Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  subject text,
  is_public boolean DEFAULT false,
  created_by text REFERENCES professors(id) ON UPDATE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Collection Items Table
CREATE TABLE collection_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('quiz', 'course', 'flashcards', 'exercises')),
  content_id uuid NOT NULL,
  position integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add verification_status to content tables (Migration)
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Update Foreign Keys to CASCADE on UPDATE (Crucial for Admin ID changes)
-- Note: This requires dropping and recreating constraints if they exist without cascade.
-- For this simplified setup, we assume we can just add/alter.
-- A robust migration would look like:
-- ALTER TABLE quizzes DROP CONSTRAINT quizzes_created_by_fkey;
-- ALTER TABLE quizzes ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES professors(id) ON UPDATE CASCADE;

-- Insert Admin User
INSERT INTO professors (id, display_name, password) 
VALUES ('tanguy', 'Tanguy Admin', 'duvert')
ON CONFLICT (id) DO NOTHING;
