-- Add status column to quizzes
ALTER TABLE quizzes ADD COLUMN status text DEFAULT 'published';

-- Add status column to courses
ALTER TABLE courses ADD COLUMN status text DEFAULT 'published';
