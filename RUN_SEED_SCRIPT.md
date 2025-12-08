# ✅ Ready to Run: Supabase Seed Script

Your seed script is **ready to run** with the Clerk User IDs you provided!

## 🚀 Quick Steps

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Select your project
- Click **SQL Editor** in the left sidebar

### 2. Run the Seed Script
1. Open the file: `supabase/seed-test-data.sql`
2. **Copy the entire contents** (all 262 lines)
3. **Paste into Supabase SQL Editor**
4. Click **Run** (or press Ctrl+Enter)

### 3. Verify the Results
The script includes a verification query at the end. You should see:

```
type            | count
----------------|-------
Groups          | 2
Group Members   | 4
Events          | 2
Event Attendees | 4
Announcements   | 1
```

## 📋 What the Script Creates

✅ **3 Test Users** (using your Clerk IDs):
- Admin: `user_36ZVMm8AM6LGwtdHSzokWsFwbrr`
- Organizer: `user_36ZVQVCFbvoc61FdpL6dVDuaFrZ`
- Player: `user_36ZVSZFTBSfxzcB9WpXWoO7LEdc`

✅ **2 Test Groups**:
- Test Soccer Team (owned by Admin)
- Test Basketball Club (owned by Organizer)

✅ **4 Group Memberships**:
- Admin → Soccer Team (admin role)
- Organizer → Soccer Team (organizer role)
- Player → Soccer Team (player role)
- Organizer → Basketball Club (admin role)

✅ **2 Test Events**:
- Soccer Practice (7 days from now)
- Basketball Game (14 days from now)

✅ **4 Event Attendees** (with RSVP tokens):
- All members added to both events with pending RSVP

✅ **1 Test Announcement**:
- Welcome message for Soccer Team

## ⚠️ Important Notes

1. **Idempotent Script**: Safe to run multiple times
   - Uses `ON CONFLICT` to update existing records
   - Won't create duplicates

2. **Works Without Login**: Creates users directly using Clerk IDs
   - No need to login first
   - Users will sync when they login later

3. **Fixed UUIDs**: Uses predictable IDs for easy cleanup
   - All test data uses fixed UUIDs
   - Easy to identify and remove later

## 🔍 Troubleshooting

**Error: "duplicate key value violates unique constraint"**
- This is normal if you run it twice
- The script handles conflicts gracefully

**Error: "violates foreign key constraint"**
- Make sure the users table exists
- Check that the schema was created first

**No data created?**
- Check the SQL Editor for error messages
- Verify you're in the correct Supabase project
- Make sure the schema.sql was run first

## ✅ After Running

1. **Test in your app:**
   - Login with `test-admin@spond-test.com`
   - Should see "Test Soccer Team" on dashboard
   - Navigate to `/groups` to see test groups
   - Navigate to `/events` to see test events

2. **Re-run TestSprite:**
   - Tests should now have data to work with
   - Expected: 12-15/20 tests passing (60-75%)

## 🎯 Next Steps

After seeding:
1. ✅ Verify data in Supabase (run verification query)
2. ✅ Test login and dashboard in your app
3. ✅ Re-run TestSprite tests
4. ✅ Review test results

---

**Ready?** Copy the script and paste it into Supabase SQL Editor! 🚀

