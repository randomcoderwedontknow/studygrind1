import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface UserState {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  level: number;
  experiencePoints: number;
  addExperience: (points: number) => void;
  setUserData: (data: { level: number; experiencePoints: number }) => void;
  syncToDatabase: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    name: 'New User',
    email: 'user@example.com',
  },
  level: 1,
  experiencePoints: 0,

  addExperience: (points: number) => {
    set((state) => {
      const newXP = state.experiencePoints + points;
      const newLevel = Math.floor(newXP / 250) + 1; // Level up every 250 XP
      
      // Sync to database
      get().syncToDatabase();
      
      return {
        experiencePoints: newXP,
        level: newLevel,
      };
    });
  },

  setUserData: (data: { level: number; experiencePoints: number }) => {
    set({
      level: data.level,
      experiencePoints: data.experiencePoints,
    });
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const state = get();
      await supabase
        .from('user_profiles')
        .update({
          level: state.level,
          experience_points: state.experiencePoints,
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  },
}));