# Get Clerk User IDs for Supabase Seeding

## Quick Steps

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Select your app: **stable-mudfish-23**

2. **For each test user, get the User ID:**
   - Click **Users** in the sidebar
   - Click on each test user
   - Copy the **User ID** (it starts with `user_2...`)
   - The User ID is displayed at the top of the user profile page

3. **Save the User IDs here:**

```
Admin User ID: user_36ZVMm8AM6LGwtdHSzokWsFwbrr
Organizer User ID: user_36ZVQVCFbvoc61FdpL6dVDuaFrZ
Player User ID: user_36ZVSZFTBSfxzcB9WpXWoO7LEdc
```

4. **Once you have the IDs, run the Supabase seed script:**
   - Go to: `supabase/seed-test-data.sql`
   - Replace the placeholder IDs with your actual Clerk User IDs
   - Run in Supabase SQL Editor

---

## Alternative: Get IDs via API

If you prefer, you can also get the User IDs programmatically after logging in once. The users will be automatically created in Supabase on first login, and you can query them.

