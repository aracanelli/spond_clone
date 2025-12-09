-- Quick Fix: Create Test Users in Supabase
-- Run this if you're getting "Not authenticated" errors
-- This creates the users directly in Supabase using their Clerk IDs

-- ============================================
-- CREATE TEST USERS (if they don't exist)
-- ============================================

-- Create Admin user
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES 
  ('user_36ZVMm8AM6LGwtdHSzokWsFwbrr', 'test-admin@spond-test.com', 'Test Admin', NOW())
ON CONFLICT (clerk_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- Create Organizer user
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES 
  ('user_36ZVQVCFbvoc61FdpL6dVDuaFrZ', 'test-organizer@spond-test.com', 'Test Organizer', NOW())
ON CONFLICT (clerk_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- Create Player user
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES 
  ('user_36ZVSZFTBSfxzcB9WpXWoO7LEdc', 'test-player@spond-test.com', 'Test Player', NOW())
ON CONFLICT (clerk_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- ============================================
-- VERIFY USERS WERE CREATED
-- ============================================

SELECT 
  id,
  clerk_id,
  email,
  full_name,
  created_at
FROM users 
WHERE email LIKE 'test-%@spond-test.com'
ORDER BY email;

-- ============================================
-- NEXT STEPS
-- ============================================

-- After running this:
-- 1. Refresh your browser
-- 2. The user should now be synced
-- 3. Try creating a group again
-- 4. If it still doesn't work, check the browser console for errors



