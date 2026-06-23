import { createClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  goal: string | null;
  experience: string | null;
  equipment: string[] | null;
  weekly_goal: number;
  plan: string;
  billing_cycle: "monthly" | "annual";
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  workout_slug: string;
  workout_title: string;
  instructor: string;
  status: "booked" | "cancelled";
  created_at: string;
};

export type Completion = {
  id: string;
  user_id: string;
  workout_slug: string;
  workout_title: string;
  completed_at: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-anon-key"),
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // User profile, bookings, and progress are stored in Supabase tables.
        // A Vite SPA cannot issue secure HTTP-only cookies, so auth is kept in memory here.
        persistSession: false,
      },
    })
  : null;