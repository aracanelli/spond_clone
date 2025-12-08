# Check User Sync Status

## Quick Diagnostic Steps

### 1. Check Browser Console
Open your browser's developer console (F12) and look for:
- `User synced successfully:` - Good! User exists in Supabase
- `No user found` - User sync failed
- `User sync error:` - There's an error

### 2. Check Supabase Database

Run this query in Supabase SQL Editor:

```sql
-- Check if your test admin user exists
SELECT id, clerk_id, email, full_name, created_at 
FROM users 
WHERE email = 'test-admin@spond-test.com';
```

**Expected Result:**
- Should return 1 row with your user data
- The `clerk_id` should match: `user_36ZVMm8AM6LGwtdHSzokWsFwbrr`

**If no rows returned:**
- The user hasn't been synced to Supabase yet
- The sync might have failed

### 3. Manual User Creation (if needed)

If the user doesn't exist, you can manually create it:

```sql
-- Insert the admin user manually
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES 
  ('user_36ZVMm8AM6LGwtdHSzokWsFwbrr', 'test-admin@spond-test.com', 'Test Admin', NOW())
ON CONFLICT (clerk_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
```

### 4. Check Clerk User ID

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to Users
3. Click on `test-admin@spond-test.com`
4. Verify the User ID matches: `user_36ZVMm8AM6LGwtdHSzokWsFwbrr`

**If the ID is different:**
- Update the seed script with the correct ID
- Or manually insert the user with the correct Clerk ID

### 5. Force User Sync

After logging in, the user should sync automatically. If not:

1. **Refresh the page** - This triggers a new sync attempt
2. **Check browser console** for errors
3. **Check Supabase logs** for any RLS policy violations

### 6. Common Issues

**Issue: "Not authenticated" error**
- **Cause:** `user?.id` is undefined
- **Fix:** User needs to exist in Supabase first

**Issue: User sync fails silently**
- **Cause:** RLS policy blocking insert
- **Fix:** Check RLS policies allow user creation

**Issue: Wrong Clerk ID**
- **Cause:** User ID changed after password reset
- **Fix:** Get new Clerk ID and update database

---

## Quick Fix: Run This SQL

If the user doesn't exist, run this in Supabase SQL Editor:

```sql
-- Create all test users manually
INSERT INTO users (clerk_id, email, full_name, created_at)
VALUES 
  ('user_36ZVMm8AM6LGwtdHSzokWsFwbrr', 'test-admin@spond-test.com', 'Test Admin', NOW()),
  ('user_36ZVQVCFbvoc61FdpL6dVDuaFrZ', 'test-organizer@spond-test.com', 'Test Organizer', NOW()),
  ('user_36ZVSZFTBSfxzcB9WpXWoO7LEdc', 'test-player@spond-test.com', 'Test Player', NOW())
ON CONFLICT (clerk_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- Verify users were created
SELECT id, clerk_id, email, full_name FROM users WHERE email LIKE 'test-%@spond-test.com';
```

After running this, refresh your browser and try creating a group again.

