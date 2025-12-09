# Quick Start: Setup Test Accounts for TestSprite

## 🚀 Fast Track Setup (5 minutes)

### Step 1: Create Test Accounts in Clerk (3 minutes)

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Sign in and select your app: **stable-mudfish-23**

2. **Create 3 Test Users:**
   
   **User 1 - Admin:**
   - Click **Users** → **Create User**
   - Email: `test-admin@spond-test.com`
   - Password: `TestPassword123!`
   - First Name: `Test`
   - Last Name: `Admin`
   - Click **Create User**
   - Click **Actions** → **Skip Email Verification**
   
   **User 2 - Organizer:**
   - Click **Users** → **Create User**
   - Email: `test-organizer@spond-test.com`
   - Password: `TestPassword123!`
   - First Name: `Test`
   - Last Name: `Organizer`
   - Click **Create User**
   - Click **Actions** → **Skip Email Verification**
   
   **User 3 - Player:**
   - Click **Users** → **Create User**
   - Email: `test-player@spond-test.com`
   - Password: `TestPassword123!`
   - First Name: `Test`
   - Last Name: `Player`
   - Click **Create User**
   - Click **Actions** → **Skip Email Verification**

### Step 2: Configure Clerk Settings (2 minutes)

1. **Disable CAPTCHA:**
   - Go to **Settings** → **Restrictions**
   - Find **CAPTCHA Settings**
   - Toggle **CAPTCHA** to **OFF** for Development

2. **Disable Email Verification:**
   - Go to **User & Authentication** → **Email Verification**
   - Set **Require email verification** to **OFF** for Development

3. **Verify Authentication Methods:**
   - Go to **User & Authentication** → **Email, Phone, Username**
   - Ensure **Email address** is enabled ✅

### Step 3: Test Manually (1 minute)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test login:**
   - Open: http://localhost:3000/sign-in
   - Email: `test-admin@spond-test.com`
   - Password: `TestPassword123!`
   - Should login successfully ✅

3. **Verify dashboard:**
   - Should redirect to `/dashboard`
   - Should see dashboard without errors ✅

### Step 4: Get Clerk User IDs (for Supabase seeding)

For each test user:

1. In Clerk Dashboard → **Users**
2. Click on the user
3. Copy the **User ID** (starts with `user_2...`)
4. Save them:

```
Admin User ID: user_2________________
Organizer User ID: user_2________________
Player User ID: user_2________________
```

### Step 5: Seed Supabase (Optional but Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project
   - Go to **SQL Editor**

2. **Run this SQL** (replace user IDs with actual IDs from Step 4):

```sql
-- Insert test users (replace with actual Clerk user IDs)
INSERT INTO users (id, email, full_name, created_at)
VALUES 
  ('USER_ID_FROM_CLERK_1', 'test-admin@spond-test.com', 'Test Admin', NOW()),
  ('USER_ID_FROM_CLERK_2', 'test-organizer@spond-test.com', 'Test Organizer', NOW()),
  ('USER_ID_FROM_CLERK_3', 'test-player@spond-test.com', 'Test Player', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test group
INSERT INTO groups (id, name, description, created_by, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Test Soccer Team', 'A test soccer team for automated testing', 'USER_ID_FROM_CLERK_1', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add members to test group
INSERT INTO group_members (group_id, user_id, role, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'USER_ID_FROM_CLERK_1', 'admin', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'USER_ID_FROM_CLERK_2', 'organizer', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'USER_ID_FROM_CLERK_3', 'player', NOW())
ON CONFLICT (group_id, user_id) DO NOTHING;
```

3. **Click Run** to execute the SQL

### Step 6: Verify Everything Works

Run a quick test:

```bash
# Make sure dev server is running
npm run dev

# Test the login flow manually
# 1. Go to http://localhost:3000/sign-in
# 2. Login with test-admin@spond-test.com / TestPassword123!
# 3. Should see dashboard
# 4. Should see test group "Test Soccer Team"
```

---

## 📋 Test Credentials Summary

Save these credentials securely:

```
Admin:
  Email: test-admin@spond-test.com
  Password: TestPassword123!
  Role: admin

Organizer:
  Email: test-organizer@spond-test.com
  Password: TestPassword123!
  Role: organizer

Player:
  Email: test-player@spond-test.com
  Password: TestPassword123!
  Role: player
```

---

## 🎯 Next Steps

1. **Re-run TestSprite tests:**
   ```bash
   # TestSprite should now be able to use these credentials
   # The tests will login with these accounts instead of trying to create new ones
   ```

2. **Expected Results:**
   - Before: 4/20 tests passing (20%)
   - After: 12-15/20 tests passing (60-75%)

3. **If tests still fail:**
   - Check TestSprite documentation for credential injection
   - Verify TestSprite can access localhost:3000
   - Check TestSprite logs for specific errors

---

## ⚠️ Important Notes

1. **Don't commit credentials to git**
   - These are test accounts only
   - Keep credentials in `.env.local` or secure config

2. **These are development accounts**
   - Only use in development environment
   - Never use in production

3. **Test accounts are shared**
   - Anyone with access to this repo can use them
   - Rotate passwords if needed

---

## 🔍 Troubleshooting

**Can't create users in Clerk?**
- Check you have proper permissions in Clerk Dashboard
- Verify you're in the correct Clerk instance

**Can't login with test accounts?**
- Verify email verification was skipped
- Check password is correct
- Try resetting password in Clerk Dashboard

**TestSprite still can't authenticate?**
- Check if TestSprite supports credential injection
- Review TestSprite documentation
- Check TestSprite test execution logs

---

**Ready to test?** Run TestSprite again and you should see much better results! 🚀


