-- Test Data Seed Script for Supabase
-- This script creates test users and seed data for automated testing
-- Users are created using Clerk IDs, so this works even if users haven't logged in yet

-- ============================================
-- TEST DATA SEED SCRIPT
-- ============================================

-- Clerk User IDs (from Clerk Dashboard)
-- Admin: user_36ZVMm8AM6LGwtdHSzokWsFwbrr
-- Organizer: user_36ZVQVCFbvoc61FdpL6dVDuaFrZ
-- Player: user_36ZVSZFTBSfxzcB9WpXWoO7LEdc

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
-- CREATE TEST GROUPS
-- ============================================

-- Test Group 1: Soccer Team
INSERT INTO groups (id, name, description, owner_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Test Soccer Team',
  'A test soccer team for automated testing',
  id,
  NOW()
FROM users 
WHERE email = 'test-admin@spond-test.com'
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    owner_id = EXCLUDED.owner_id;

-- Test Group 2: Basketball Club
INSERT INTO groups (id, name, description, owner_id, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Test Basketball Club',
  'A test basketball club for automated testing',
  id,
  NOW()
FROM users 
WHERE email = 'test-organizer@spond-test.com'
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    owner_id = EXCLUDED.owner_id;

-- ============================================
-- ADD MEMBERS TO GROUPS
-- ============================================

-- Add admin as admin to Soccer Team
INSERT INTO group_members (group_id, user_id, role, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  id,
  'admin',
  NOW()
FROM users 
WHERE email = 'test-admin@spond-test.com'
ON CONFLICT (group_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- Add organizer as organizer to Soccer Team
INSERT INTO group_members (group_id, user_id, role, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  id,
  'organizer',
  NOW()
FROM users 
WHERE email = 'test-organizer@spond-test.com'
ON CONFLICT (group_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- Add player as player to Soccer Team
INSERT INTO group_members (group_id, user_id, role, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  id,
  'player',
  NOW()
FROM users 
WHERE email = 'test-player@spond-test.com'
ON CONFLICT (group_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- Add organizer as admin to Basketball Club
INSERT INTO group_members (group_id, user_id, role, created_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  id,
  'admin',
  NOW()
FROM users 
WHERE email = 'test-organizer@spond-test.com'
ON CONFLICT (group_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- ============================================
-- CREATE TEST EVENTS
-- ============================================

-- Test Event 1: Upcoming Soccer Practice
INSERT INTO events (id, group_id, creator_id, title, description, location, start_time, end_time, participant_limit, created_at)
SELECT 
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  id,
  'Soccer Practice',
  'Weekly soccer practice session',
  'Local Soccer Field',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
  20,
  NOW()
FROM users 
WHERE email = 'test-admin@spond-test.com'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

-- Test Event 2: Basketball Game
INSERT INTO events (id, group_id, creator_id, title, description, location, start_time, end_time, participant_limit, created_at)
SELECT 
  '660e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  id,
  'Basketball Game',
  'Friendly match against local team',
  'Community Center',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
  10,
  NOW()
FROM users 
WHERE email = 'test-organizer@spond-test.com'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

-- ============================================
-- ADD EVENT ATTENDEES (with RSVP tokens)
-- ============================================

-- Add all members to Soccer Practice with pending RSVP
INSERT INTO event_attendees (event_id, user_id, rsvp, rsvp_token, updated_at)
SELECT 
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  u.id,
  'pending',
  gen_random_uuid()::text,
  NOW()
FROM users u
INNER JOIN group_members gm ON gm.user_id = u.id
WHERE gm.group_id = '550e8400-e29b-41d4-a716-446655440001'::uuid
ON CONFLICT (event_id, user_id) DO UPDATE
SET rsvp_token = COALESCE(EXCLUDED.rsvp_token, event_attendees.rsvp_token);

-- Add all members to Basketball Game with pending RSVP
INSERT INTO event_attendees (event_id, user_id, rsvp, rsvp_token, updated_at)
SELECT 
  '660e8400-e29b-41d4-a716-446655440002'::uuid,
  u.id,
  'pending',
  gen_random_uuid()::text,
  NOW()
FROM users u
INNER JOIN group_members gm ON gm.user_id = u.id
WHERE gm.group_id = '550e8400-e29b-41d4-a716-446655440002'::uuid
ON CONFLICT (event_id, user_id) DO UPDATE
SET rsvp_token = COALESCE(EXCLUDED.rsvp_token, event_attendees.rsvp_token);

-- ============================================
-- CREATE TEST ANNOUNCEMENTS
-- ============================================

-- Announcement 1: Soccer Team
INSERT INTO announcements (id, group_id, sender_id, title, content, created_at)
SELECT 
  '770e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  id,
  'Welcome to Test Soccer Team!',
  'This is a test announcement for the soccer team. Welcome all new members!',
  NOW()
FROM users 
WHERE email = 'test-admin@spond-test.com'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify the seed data:
SELECT 
  'Groups' as type,
  COUNT(*) as count
FROM groups
WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002')
UNION ALL
SELECT 
  'Group Members',
  COUNT(*)
FROM group_members
WHERE group_id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002')
UNION ALL
SELECT 
  'Events',
  COUNT(*)
FROM events
WHERE id IN ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002')
UNION ALL
SELECT 
  'Event Attendees',
  COUNT(*)
FROM event_attendees
WHERE event_id IN ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002')
UNION ALL
SELECT 
  'Announcements',
  COUNT(*)
FROM announcements
WHERE id = '770e8400-e29b-41d4-a716-446655440001';

