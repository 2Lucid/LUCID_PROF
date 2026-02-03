-- 1. Quizzes
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_created_by_fkey;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES professors(id) ON UPDATE CASCADE;

-- 2. Courses
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_created_by_fkey;
ALTER TABLE courses ADD CONSTRAINT courses_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES professors(id) ON UPDATE CASCADE;

-- 3. Flashcards
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_created_by_fkey;
ALTER TABLE flashcards ADD CONSTRAINT flashcards_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES professors(id) ON UPDATE CASCADE;

-- 4. Exercises
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_created_by_fkey;
ALTER TABLE exercises ADD CONSTRAINT exercises_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES professors(id) ON UPDATE CASCADE;

-- 5. Collections
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_created_by_fkey;
ALTER TABLE collections ADD CONSTRAINT collections_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES professors(id) ON UPDATE CASCADE;

-- 6. Validations
ALTER TABLE validations DROP CONSTRAINT IF EXISTS validations_validator_id_fkey;
ALTER TABLE validations ADD CONSTRAINT validations_validator_id_fkey 
    FOREIGN KEY (validator_id) REFERENCES professors(id) ON UPDATE CASCADE;

-- 7. Insert Admin User (Tanguy)
INSERT INTO professors (id, display_name, password) 
VALUES ('tanguy', 'Tanguy Admin', 'duvert')
ON CONFLICT (id) DO NOTHING;
