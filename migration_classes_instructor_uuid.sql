-- Migration: Change classes.instructor_id from INTEGER to UUID
-- This aligns the database schema with the updated Go models

BEGIN;

-- Step 1: Drop the foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_classes_instructor' 
               AND table_name = 'classes') THEN
        ALTER TABLE classes DROP CONSTRAINT fk_classes_instructor;
    END IF;
END $$;

-- Step 2: Change the column type from INTEGER to UUID
-- This assumes all existing instructor_id values correspond to valid user UUIDs
-- If there are any records, this might need data migration first
ALTER TABLE classes 
ALTER COLUMN instructor_id TYPE uuid 
USING (SELECT id FROM users WHERE users.id::text = instructor_id::text LIMIT 1);

-- Step 3: Re-add the foreign key constraint
ALTER TABLE classes 
ADD CONSTRAINT fk_classes_instructor 
FOREIGN KEY (instructor_id) 
REFERENCES users(id) 
ON DELETE RESTRICT;

COMMIT;
