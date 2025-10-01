/*
  # Event Registration Management System - Initial Schema

  ## Overview
  Creates the complete database schema for an event registration management system
  with support for event organizers, public attendees, and comprehensive tracking.

  ## New Tables

  ### 1. `events`
  Stores all event information created by organizers.
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event name/title
  - `description` (text) - Full event description
  - `date_time` (timestamptz) - When the event occurs
  - `location` (text) - Venue or online location
  - `featured_image_url` (text, nullable) - Banner image URL
  - `max_attendees` (integer, nullable) - Maximum capacity limit
  - `created_by` (uuid) - Admin user who created the event
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. `registrations`
  Tracks all attendee registrations for events.
  - `id` (uuid, primary key) - Unique registration identifier
  - `event_id` (uuid, foreign key) - Links to events table
  - `full_name` (text) - Attendee's full name
  - `email` (text) - Attendee's email address
  - `phone` (text, nullable) - Optional phone number
  - `company` (text, nullable) - Optional company/organization
  - `qr_code_data` (text) - Unique ticket identifier for QR code
  - `checked_in` (boolean) - Check-in status (default: false)
  - `registration_date` (timestamptz) - When registration occurred

  ### 3. `admin_users`
  Manages event organizer/admin accounts.
  - `id` (uuid, primary key) - Matches auth.users.id
  - `username` (text, unique) - Admin username
  - `email` (text, unique) - Admin email
  - `created_at` (timestamptz) - Account creation timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with appropriate policies:

  #### Events Table
  - Public can view all events
  - Authenticated admins can create events
  - Admins can update/delete their own events

  #### Registrations Table
  - Public can create registrations (no auth required)
  - Admins can view all registrations for their events
  - Admins can update check-in status for their events

  #### Admin Users Table
  - Admins can view their own profile
  - Admins can update their own profile

  ## Indexes
  - Index on event date_time for efficient event listing
  - Index on registration event_id for fast attendee lookups
  - Index on registration email for duplicate checking
  - Unique index on qr_code_data for ticket validation
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date_time timestamptz NOT NULL,
  location text NOT NULL,
  featured_image_url text,
  max_attendees integer,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  qr_code_data text UNIQUE NOT NULL,
  checked_in boolean DEFAULT false,
  registration_date timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date_time ON events(date_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_code ON registrations(qr_code_data);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Events Policies

-- Anyone can view events
CREATE POLICY "Public can view all events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own events
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own events
CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Registrations Policies

-- Anyone can register for events (no auth required)
CREATE POLICY "Public can create registrations"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Event creators can view registrations for their events
CREATE POLICY "Event creators can view registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = registrations.event_id
      AND events.created_by = auth.uid()
    )
  );

-- Event creators can update check-in status for their events
CREATE POLICY "Event creators can update check-in status"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = registrations.event_id
      AND events.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = registrations.event_id
      AND events.created_by = auth.uid()
    )
  );

-- Admin Users Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on events table
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();