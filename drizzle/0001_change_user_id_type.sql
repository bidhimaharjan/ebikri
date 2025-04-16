-- Step 1: Create a new column with bigint type
ALTER TABLE users ADD COLUMN new_id bigint;

-- Step 2: Copy data from old id to new_id (convert to string if needed)
UPDATE users SET new_id = id::bigint;

-- Step 3: Drop constraints that reference the old id
ALTER TABLE business DROP CONSTRAINT business_user_id_fkey;
-- Repeat for all other tables that reference users.id

-- Step 4: Drop the old primary key
ALTER TABLE users DROP CONSTRAINT users_pkey;

-- Step 5: Drop the old id column
ALTER TABLE users DROP COLUMN id;

-- Step 6: Rename new_id to id
ALTER TABLE users RENAME COLUMN new_id TO id;

-- Step 7: Add new primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 8: Recreate foreign keys with correct type
ALTER TABLE business ALTER COLUMN user_id TYPE bigint;
ALTER TABLE business ADD CONSTRAINT business_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- Repeat for all other tables that reference users.id

-- Step 9: Drop the old sequence (if no longer needed)
DROP SEQUENCE IF EXISTS users_id_seq;