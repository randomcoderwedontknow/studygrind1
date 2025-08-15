import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  experience_points: number;
  focus_points: number;
  total_study_time: number;
  completed_sessions: number;
  current_streak: number;
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tag_id: string | null;
  priority: 'low' | 'medium' | 'high';
  timer_mode: 'pomodoro' | 'extended' | 'custom';
  custom_duration: number | null;
  completed: boolean;
  session_time: number;
  created_at: string;
  completed_at: string | null;
}

export interface UserTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  total_time: number;
  session_count: number;
  created_at: string;
}

export interface UserNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDeck {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  total_reviews: number;
  last_studied: string | null;
  created_at: string;
}

export interface UserCard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  last_reviewed: string | null;
  next_review: string;
  review_count: number;
  correct_count: number;
  created_at: string;
}