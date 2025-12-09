# Complete Setup Checklist

Since you've already created the test accounts in Clerk, here's what's left to do:

## ✅ Step 1: Configure Clerk Settings (2 minutes)

### Disable CAPTCHA:
1. Go to: https://dashboard.clerk.com
2. Select your app: **stable-mudfish-23**
3. Navigate to: **Settings** → **Restrictions**
4. Find **CAPTCHA Settings**
5. Toggle **CAPTCHA** to **OFF** for Development environment

### Disable Email Verification:
1. In Clerk Dashboard, go to: **User & Authentication** → **Email Verification**
2. Set **Require email verification** to **OFF** for Development environment

### Verify Authentication Methods:
1. Go to: **User & Authentication** → **Email, Phone, Username**
2. Ensure **Email address** is enabled ✅

---

## ✅ Step 2: Test Login (1 minute)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test login with each account:**
   - Open: http://localhost:3000/sign-in
   - Try logging in with:
     - `test-admin@spond-test.com` / `TestPassword123!`
     - `test-organizer@spond-test.com` / `TestPassword123!`
     - `test-player@spond-test.com` / `TestPassword123!`
   - Each should login successfully ✅
   - Each should redirect to `/dashboard` ✅

**Important:** Logging in once with each account will automatically create them in Supabase!

---

## ✅ Step 3: Seed Supabase Test Data (2 minutes)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project
   - Go to **SQL Editor**

2. **Run the seed script:**
   - Open: `supabase/seed-test-data.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run**

   **Note:** The script automatically finds user IDs by email, so no manual ID replacement needed!

3. **Verify the seed:**
   - The script includes a verification query at the end
   - You should see:
     - 2 Groups
     - 4 Group Members
     - 2 Events
     - 4 Event Attendees
     - 1 Announcement

---

## ✅ Step 4: Verify Everything Works (1 minute)

1. **Test Dashboard:**
   - Login as `test-admin@spond-test.com`
   - Should see "Test Soccer Team" group ✅
   - Should see "Soccer Practice" event ✅

2. **Test Groups:**
   - Navigate to `/groups`
   - Should see test groups ✅

3. **Test Events:**
   - Navigate to `/events`
   - Should see test events ✅

---

## ✅ Step 5: Re-run TestSprite

Now you're ready to run TestSprite tests again:

```bash
# TestSprite should now be able to:
# 1. Login with test accounts
# 2. Access dashboard
# 3. Test groups, events, announcements
# 4. Test RSVP functionality
```

**Expected Results:**
- Before: 4/20 tests passing (20%)
- After: 12-15/20 tests passing (60-75%)

---

## 🎯 Quick Summary

1. ✅ Test accounts created (DONE)
2. ⏳ Configure Clerk settings (2 min)
3. ⏳ Test login manually (1 min)
4. ⏳ Seed Supabase data (2 min)
5. ⏳ Verify setup (1 min)
6. ⏳ Re-run TestSprite

**Total time remaining: ~6 minutes**

---

## 🔍 Troubleshooting

**Can't disable CAPTCHA?**
- Make sure you're in the Development environment settings
- Check you have admin permissions in Clerk

**Login fails?**
- Verify email verification was skipped in Clerk Dashboard
- Check password is correct
- Try resetting password in Clerk Dashboard

**Supabase seed fails?**
- Make sure you logged in with each test account at least once
- Check that users exist: `SELECT * FROM users WHERE email LIKE 'test-%@spond-test.com';`
- Verify the SQL script syntax

**Dashboard shows no data?**
- Verify Supabase seed script ran successfully
- Check browser console for errors
- Verify you're logged in with the correct account

---

## 📝 Notes

- Users are automatically created in Supabase on first login (via `useUserViewModel`)
- The seed script uses email lookups, so no manual ID replacement needed
- Test data uses fixed UUIDs for easy cleanup later
- All test data can be removed by deleting the groups/events

---

**Ready?** Start with Step 1 (Clerk Settings) and work through each step! 🚀


