-- Add subject and category columns to quizzes table
ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS category text;

-- Add subject and category columns to flashcards table
ALTER TABLE flashcards
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS category text;

-- Add subject and category columns to exercises table
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS category text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject);
CREATE INDEX IF NOT EXISTS idx_flashcards_subject ON flashcards(subject);
CREATE INDEX IF NOT EXISTS idx_exercises_subject ON exercises(subject);
