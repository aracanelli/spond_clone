# Comprehensive Guide: Configuring Clerk for TestSprite Testing

## Overview

This guide will help you configure Clerk authentication to allow TestSprite automated testing. The main issue is that Clerk's development environment blocks automated account creation. We'll solve this by creating test accounts manually and configuring Clerk settings.

---

## Table of Contents

1. [Understanding the Problem](#understanding-the-problem)
2. [Solution 1: Manual Test Account Creation (Recommended)](#solution-1-manual-test-account-creation-recommended)
3. [Solution 2: Configure Clerk for Automated Testing](#solution-2-configure-clerk-for-automated-testing)
4. [Solution 3: Using Clerk Testing Tokens](#solution-3-using-clerk-testing-tokens)
5. [Verifying the Setup](#verifying-the-setup)
6. [Troubleshooting](#troubleshooting)

---

## Understanding the Problem

### Current Issue
- TestSprite cannot create test accounts automatically
- Clerk development keys block automated sign-ups with `400` errors
- 13 out of 20 tests require authenticated users
- Tests fail at the authentication step, blocking all downstream testing

### Why This Happens
Clerk's development instances have:
- Strict usage limits
- CAPTCHA protection (by default)
- Rate limiting on sign-ups
- Restrictions on automated account creation

---

## Solution 1: Manual Test Account Creation (Recommended)

This is the **easiest and most reliable** approach. We'll create test accounts in Clerk Dashboard and provide credentials to TestSprite.

### Step 1: Access Clerk Dashboard

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in with your Clerk account
3. Select your application: **stable-mudfish-23** (or your instance name)

### Step 2: Create Test Users

You need to create **at least 3 test users** with different roles:

#### User 1: Admin/Organizer
1. Navigate to **Users** → **Create User**
2. Fill in the form:
   - **Email:** `test-admin@spond-test.com` (or any test email)
   - **Password:** `TestPassword123!` (use a strong password)
   - **First Name:** `Test`
   - **Last Name:** `Admin`
3. Click **Create User**
4. **Note:** You'll need to verify the email or skip verification for testing

#### User 2: Organizer
1. Create another user:
   - **Email:** `test-organizer@spond-test.com`
   - **Password:** `TestPassword123!`
   - **First Name:** `Test`
   - **Last Name:** `Organizer`

#### User 3: Player/Member
1. Create another user:
   - **Email:** `test-player@spond-test.com`
   - **Password:** `TestPassword123!`
   - **First Name:** `Test`
   - **Last Name:** `Player`

### Step 3: Skip Email Verification (For Testing)

1. For each user, go to their profile
2. Click **Actions** → **Skip Email Verification**
3. This allows immediate login without email confirmation

### Step 4: Create Test Credentials File

Create a file with test credentials (keep this secure, don't commit to git):

```bash
# Create a test credentials file
touch .test-credentials.json
```

Add this content (update with your actual test emails):

```json
{
  "testUsers": {
    "admin": {
      "email": "test-admin@spond-test.com",
      "password": "TestPassword123!",
      "role": "admin"
    },
    "organizer": {
      "email": "test-organizer@spond-test.com",
      "password": "TestPassword123!",
      "role": "organizer"
    },
    "player": {
      "email": "test-player@spond-test.com",
      "password": "TestPassword123!",
      "role": "player"
    }
  },
  "clerkInstance": "stable-mudfish-23",
  "appUrl": "http://localhost:3000"
}
```

### Step 5: Add to .gitignore

```bash
echo ".test-credentials.json" >> .gitignore
```

---

## Solution 2: Configure Clerk for Automated Testing

This approach configures Clerk to be more permissive for automated testing.

### Step 1: Disable CAPTCHA for Development

1. In Clerk Dashboard, go to **Settings** → **Restrictions**
2. Find **CAPTCHA Settings**
3. For **Development** environment:
   - Toggle **CAPTCHA** to **OFF**
   - This allows automated sign-ups without CAPTCHA challenges

### Step 2: Configure Allowed Origins

1. Go to **Settings** → **API Keys**
2. Scroll to **Allowed Origins**
3. Add these origins:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `https://tun.testsprite.com` (if TestSprite uses a tunnel)

### Step 3: Adjust Rate Limits

1. Go to **Settings** → **Rate Limits**
2. For **Development** environment:
   - Increase **Sign-up rate limit** to allow more frequent sign-ups
   - Increase **Sign-in rate limit** if needed
   - **Note:** Development instances have lower limits than production

### Step 4: Enable Test Mode (If Available)

1. Check **Settings** → **General**
2. Look for **Test Mode** or **Development Mode** toggle
3. Enable it if available (this relaxes some restrictions)

### Step 5: Configure Authentication Methods

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Ensure these are enabled:
   - ✅ Email address
   - ✅ Username (optional, but good for testing)
   - ✅ Phone number (optional)
   - ✅ Google OAuth (optional, for TC001)

### Step 6: Disable Email Verification (For Testing)

1. Go to **User & Authentication** → **Email Verification**
2. For **Development**:
   - Set **Require email verification** to **OFF**
   - This allows immediate account use without email confirmation

**⚠️ Warning:** Only disable email verification in development. Always enable it in production!

---

## Solution 3: Using Clerk Testing Tokens

For advanced CI/CD scenarios, you can use Clerk's testing tokens.

### Step 1: Generate Testing Token

1. Install Clerk CLI (if not already installed):
   ```bash
   npm install -g @clerk/clerk-cli
   ```

2. Login to Clerk:
   ```bash
   clerk login
   ```

3. Generate a testing token:
   ```bash
   clerk testing-token create --instance-id <your-instance-id>
   ```

### Step 2: Configure TestSprite with Token

You'll need to check TestSprite documentation for how to pass authentication tokens. This typically involves:
- Setting environment variables
- Configuring test credentials in TestSprite dashboard
- Using test fixtures

---

## Verifying the Setup

### Manual Verification

1. **Test Sign-Up:**
   ```bash
   # Start your dev server
   npm run dev
   
   # Open browser to http://localhost:3000/sign-up
   # Try creating a new account
   # Should work without CAPTCHA or verification
   ```

2. **Test Sign-In:**
   ```bash
   # Go to http://localhost:3000/sign-in
   # Use one of your test accounts
   # Should login successfully
   ```

3. **Test Dashboard Access:**
   ```bash
   # After login, should redirect to /dashboard
   # Should see dashboard without errors
   ```

### Automated Verification

Run a quick test to verify authentication works:

```bash
# Test with curl (replace with your test credentials)
curl -X POST http://localhost:3000/api/auth/test \
  -H "Content-Type: application/json" \
  -d '{"email":"test-admin@spond-test.com","password":"TestPassword123!"}'
```

---

## Configuring TestSprite

### Option A: Update TestSprite Test Plan

If TestSprite supports credential injection, update the test plan:

1. Locate test plan file: `testsprite_tests/testsprite_frontend_test_plan.json`
2. Add credentials section (if supported):
   ```json
   {
     "testCredentials": {
       "admin": {
         "email": "test-admin@spond-test.com",
         "password": "TestPassword123!"
       },
       "organizer": {
         "email": "test-organizer@spond-test.com",
         "password": "TestPassword123!"
       },
       "player": {
         "email": "test-player@spond-test.com",
         "password": "TestPassword123!"
       }
     }
   }
   ```

### Option B: Environment Variables

Set environment variables that TestSprite can use:

```bash
# Add to .env.local (or TestSprite config)
TEST_ADMIN_EMAIL=test-admin@spond-test.com
TEST_ADMIN_PASSWORD=TestPassword123!
TEST_ORGANIZER_EMAIL=test-organizer@spond-test.com
TEST_ORGANIZER_PASSWORD=TestPassword123!
TEST_PLAYER_EMAIL=test-player@spond-test.com
TEST_PLAYER_PASSWORD=TestPassword123!
```

### Option C: TestSprite Configuration File

Create a TestSprite configuration file:

```bash
touch testsprite_tests/config.json
```

```json
{
  "credentials": {
    "admin": {
      "email": "test-admin@spond-test.com",
      "password": "TestPassword123!"
    },
    "organizer": {
      "email": "test-organizer@spond-test.com",
      "password": "TestPassword123!"
    },
    "player": {
      "email": "test-player@spond-test.com",
      "password": "TestPassword123!"
    }
  },
  "baseUrl": "http://localhost:3000",
  "timeout": 30000
}
```

---

## Seeding Test Data in Supabase

For comprehensive testing, you may want to seed your Supabase database with test data.

### Step 1: Create Seed Script

Create `supabase/seed-test-data.sql`:

```sql
-- This assumes you have test users created in Clerk
-- You'll need to get their Clerk user IDs and insert them into the users table

-- Example: Insert test user (replace with actual Clerk user ID)
INSERT INTO users (id, email, full_name, created_at)
VALUES 
  ('user_2abc123...', 'test-admin@spond-test.com', 'Test Admin', NOW()),
  ('user_2def456...', 'test-organizer@spond-test.com', 'Test Organizer', NOW()),
  ('user_2ghi789...', 'test-player@spond-test.com', 'Test Player', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test groups
INSERT INTO groups (id, name, description, created_by, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Test Soccer Team', 'A test soccer team', 'user_2abc123...', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Test Basketball Club', 'A test basketball club', 'user_2def456...', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add members to groups
INSERT INTO group_members (group_id, user_id, role, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'user_2abc123...', 'admin', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'user_2def456...', 'organizer', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'user_2ghi789...', 'player', NOW())
ON CONFLICT (group_id, user_id) DO NOTHING;
```

### Step 2: Get Clerk User IDs

1. In Clerk Dashboard → **Users**
2. Click on each test user
3. Copy the **User ID** (starts with `user_2...`)
4. Update the seed script with actual IDs

### Step 3: Run Seed Script

1. Go to Supabase Dashboard → **SQL Editor**
2. Paste and run the seed script
3. Verify data was created

---

## Troubleshooting

### Issue: Still Getting 400 Errors on Sign-Up

**Solution:**
1. Check Clerk Dashboard → **Settings** → **Restrictions**
2. Ensure CAPTCHA is disabled for development
3. Check rate limits aren't too restrictive
4. Verify email verification is disabled for development

### Issue: TestSprite Can't Find Test Accounts

**Solution:**
1. Verify accounts exist in Clerk Dashboard
2. Check email addresses match exactly (case-sensitive)
3. Ensure passwords are correct
4. Try logging in manually first to verify credentials

### Issue: Tests Pass Locally But Fail in TestSprite

**Solution:**
1. Check TestSprite is using correct base URL
2. Verify network connectivity (TestSprite tunnel)
3. Check if TestSprite needs different credentials format
4. Review TestSprite logs for specific errors

### Issue: Rate Limiting Errors

**Solution:**
1. Increase rate limits in Clerk Dashboard
2. Add delays between test account creations
3. Use pre-created accounts instead of creating new ones
4. Consider using Clerk production instance for testing (with proper safeguards)

### Issue: Email Verification Required

**Solution:**
1. Disable email verification in Clerk Dashboard
2. Or manually verify test emails
3. Or use Clerk's "Skip Email Verification" feature per user

---

## Quick Start Checklist

- [ ] Create 3 test accounts in Clerk Dashboard (admin, organizer, player)
- [ ] Skip email verification for test accounts
- [ ] Disable CAPTCHA in Clerk development settings
- [ ] Disable email verification requirement in Clerk development
- [ ] Add test credentials to TestSprite configuration
- [ ] Verify manual login works with test accounts
- [ ] Run TestSprite tests again
- [ ] Check test results - should see improved pass rate

---

## Expected Results After Setup

After completing this setup, you should see:

| Metric | Before | After |
|--------|--------|-------|
| Tests Passed | 4 (20%) | 12-15 (60-75%) |
| Tests Failed (Auth) | 13 (65%) | 0-3 (0-15%) |
| Tests Partial | 3 (15%) | 2-5 (10-25%) |

The remaining failures should be actual feature bugs, not authentication issues.

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit test credentials to git**
   - Add `.test-credentials.json` to `.gitignore`
   - Use environment variables for CI/CD

2. **Use separate test accounts**
   - Don't use production accounts for testing
   - Test accounts should have limited permissions

3. **Rotate test passwords regularly**
   - Change test account passwords periodically
   - Use strong passwords even for test accounts

4. **Monitor test account usage**
   - Check Clerk Dashboard for suspicious activity
   - Set up alerts for unusual sign-in patterns

5. **Clean up test data**
   - Remove test accounts when no longer needed
   - Clean up test data in Supabase periodically

---

## Additional Resources

- [Clerk Dashboard](https://dashboard.clerk.com)
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Testing Guide](https://clerk.com/docs/testing/overview)
- [TestSprite Documentation](https://www.testsprite.com/docs)

---

## Support

If you encounter issues:

1. Check Clerk Dashboard logs for errors
2. Review TestSprite test execution logs
3. Verify environment variables are set correctly
4. Check network connectivity (TestSprite tunnel)
5. Review browser console logs in TestSprite test results

---

**Last Updated:** 2025-12-08  
**Version:** 1.0

