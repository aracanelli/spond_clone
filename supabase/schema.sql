-- Spond Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
CREATE TYPE rsvp_status AS ENUM ('yes', 'no', 'pending');
CREATE TYPE member_role AS ENUM ('admin', 'organizer', 'player');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  carrier TEXT,
  allow_sms BOOLEAN DEFAULT false,
  allow_push BOOLEAN DEFAULT true,
  allow_email BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'player',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Subgroups table
CREATE TABLE subgroups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subgroup Members table
CREATE TABLE subgroup_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subgroup_id UUID REFERENCES subgroups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subgroup_id, user_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  subgroup_id UUID REFERENCES subgroups(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_rule TEXT,
  participant_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Attendees table
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rsvp rsvp_status DEFAULT 'pending',
  rsvp_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  subgroup_id UUID REFERENCES subgroups(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Invitations table
CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role member_role DEFAULT 'player',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX idx_announcements_group_id ON announcements(group_id);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subgroups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subgroup_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- User Preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (true);

-- Push Subscriptions policies
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions FOR ALL USING (true);

-- Groups policies
CREATE POLICY "Anyone can view groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Group owners can update groups" ON groups FOR UPDATE USING (true);
CREATE POLICY "Group owners can delete groups" ON groups FOR DELETE USING (true);

-- Group Members policies
CREATE POLICY "Anyone can view group members" ON group_members FOR SELECT USING (true);
CREATE POLICY "Group admins can manage members" ON group_members FOR ALL USING (true);

-- Subgroups policies
CREATE POLICY "Group members can view subgroups" ON subgroups FOR SELECT USING (true);
CREATE POLICY "Group admins can manage subgroups" ON subgroups FOR ALL USING (true);

-- Subgroup Members policies
CREATE POLICY "Group members can view subgroup members" ON subgroup_members FOR SELECT USING (true);
CREATE POLICY "Group admins can manage subgroup members" ON subgroup_members FOR ALL USING (true);

-- Events policies
CREATE POLICY "Group members can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Group organizers can create events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Event creators can update events" ON events FOR UPDATE USING (true);
CREATE POLICY "Event creators can delete events" ON events FOR DELETE USING (true);

-- Event Attendees policies
CREATE POLICY "Anyone can view event attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Attendees can update their own RSVP" ON event_attendees FOR UPDATE USING (true);
CREATE POLICY "Event creators can manage attendees" ON event_attendees FOR ALL USING (true);

-- Announcements policies
CREATE POLICY "Group members can view announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Group organizers can create announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Announcement senders can delete" ON announcements FOR DELETE USING (true);

-- Group Invitations policies
CREATE POLICY "Admins can manage invitations" ON group_invitations FOR ALL USING (true);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_attendees_updated_at BEFORE UPDATE ON event_attendees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





