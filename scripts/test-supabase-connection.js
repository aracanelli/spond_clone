// Diagnostic Script: Test Supabase Connection
// Run with: node scripts/test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Connection Diagnostic\n');
console.log('='.repeat(50));

console.log('\n📋 Environment Variables:');
console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`  ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Missing environment variables. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n📡 Testing Connection...\n');
  
  try {
    // Test 1: Check if users table exists
    console.log('Test 1: Query users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, clerk_id, email')
      .limit(5);
    
    if (usersError) {
      console.log(`  ❌ Error: ${usersError.message}`);
      console.log(`  Code: ${usersError.code}`);
      console.log(`  Hint: ${usersError.hint || 'None'}`);
    } else {
      console.log(`  ✅ Found ${users?.length || 0} users`);
      if (users && users.length > 0) {
        console.log('  Users found:');
        users.forEach(u => console.log(`    - ${u.email} (${u.clerk_id})`));
      }
    }

    // Test 2: Check for test users specifically
    console.log('\nTest 2: Query test users...');
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, clerk_id, email, full_name')
      .like('email', 'test-%@spond-test.com');
    
    if (testError) {
      console.log(`  ❌ Error: ${testError.message}`);
    } else {
      console.log(`  Found ${testUsers?.length || 0} test users:`);
      if (testUsers && testUsers.length > 0) {
        testUsers.forEach(u => console.log(`    ✅ ${u.email} (ID: ${u.id})`));
      } else {
        console.log('  ❌ No test users found - they need to be created!');
      }
    }

    // Test 3: Check groups
    console.log('\nTest 3: Query groups...');
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, owner_id')
      .limit(5);
    
    if (groupsError) {
      console.log(`  ❌ Error: ${groupsError.message}`);
      console.log(`  Code: ${groupsError.code}`);
    } else {
      console.log(`  Found ${groups?.length || 0} groups`);
      if (groups && groups.length > 0) {
        groups.forEach(g => console.log(`    - ${g.name} (ID: ${g.id})`));
      }
    }

    // Test 4: Test inserting a user (to check RLS)
    console.log('\nTest 4: Test user insert (RLS check)...');
    const testClerkId = 'test_' + Date.now();
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        clerk_id: testClerkId,
        email: `test-${Date.now()}@test.com`,
        full_name: 'Test User'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log(`  ❌ Insert failed: ${insertError.message}`);
      console.log(`  Code: ${insertError.code}`);
      if (insertError.code === '42501') {
        console.log('  💡 This might be an RLS policy issue');
      }
    } else {
      console.log(`  ✅ Insert succeeded! User ID: ${newUser?.id}`);
      // Clean up
      await supabase.from('users').delete().eq('clerk_id', testClerkId);
      console.log('  🧹 Cleaned up test user');
    }

  } catch (error) {
    console.log(`\n❌ Unexpected error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Diagnostic complete.\n');
}

testConnection();



