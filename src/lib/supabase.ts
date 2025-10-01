import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  featured_image_url?: string;
  max_attendees?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  qr_code_data: string;
  checked_in: boolean;
  registration_date: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
}
