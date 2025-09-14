import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  dateJoined: Date;
  totalHours: number;
  isOwner?: boolean;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  users: User[];
  allUsers: User[];
  isAuthenticated: boolean;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  loadAllUsers: () => Promise<void>;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  updateUserHours: (userId: string, hours: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [
    {
      id: 'demo-user-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      dateJoined: new Date('2024-12-01'),
      totalHours: 45,
    },
    {
      id: 'demo-user-2',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      dateJoined: new Date('2024-11-15'),
      totalHours: 78,
    },
    {
      id: 'demo-user-3',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      dateJoined: new Date('2024-10-20'),
      totalHours: 92,
    },
    {
      id: 'demo-user-4',
      name: 'Alex Thompson',
      email: 'alex.thompson@email.com',
      dateJoined: new Date('2024-12-10'),
      totalHours: 23,
    },
    {
      id: 'demo-user-5',
      name: 'Jessica Park',
      email: 'jessica.park@email.com',
      dateJoined: new Date('2024-11-28'),
      totalHours: 67,
    },
  ],
  allUsers: [],
  isAuthenticated: false,

  signUp: async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      if (data.user) {
        const newUser: User = {
          id: data.user.id,
          name,
          email,
          dateJoined: new Date(),
          totalHours: 0,
        };

        set({
          user: newUser,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      // Check for owner account first
      if (email === 'abdullahahmed' && password === 'owner') {
        const ownerUser: User = {
          id: 'owner',
          name: 'Abdullah Ahmed',
          email: 'abdullahahmed',
          dateJoined: new Date('2024-01-01'),
          totalHours: 150,
          isOwner: true,
        };
        
        set({ user: ownerUser, isAuthenticated: true });
        
        // Set owner account to have 9,999 points in Focus Shop
        const { setOwnerPoints } = require('./focusShopStore').useFocusShopStore.getState();
        setOwnerPoints();
        
        // Load all users for owner account
        await get().loadAllUsers();
        
        return true;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return false;
      }

      if (data.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return false;
        }

        const user: User = {
          id: data.user.id,
          name: profile.name,
          email: profile.email,
          dateJoined: new Date(profile.created_at),
          totalHours: Math.floor(profile.total_study_time / 60),
        };

        set({ user, isAuthenticated: true });
        
        // Load user data into stores
        await get().loadUserData(data.user.id);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    set({ user: null, isAuthenticated: false });
  },

  loadAllUsers: async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (profiles) {
        const users: User[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          dateJoined: new Date(profile.created_at),
          totalHours: Math.floor(profile.total_study_time / 60),
        }));
        
        set({ allUsers: users });
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  },

  loadUserData: async (userId: string) => {
    try {
      // Load user profile data into stores
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        // Update user store
        const { setUserData } = require('./userStore').useUserStore.getState();
        setUserData({
          level: profile.level,
          experiencePoints: profile.experience_points,
        });

        // Update focus shop store
        const { setPoints } = require('./focusShopStore').useFocusShopStore.getState();
        setPoints(profile.focus_points);

        // Update timer store
        const { setUserStats } = require('./timerStore').useTimerStore.getState();
        setUserStats({
          completedSessions: profile.completed_sessions,
          totalStudyTime: profile.total_study_time,
          currentStreak: profile.current_streak,
        });
      }

      // Load tasks
      const { data: tasks } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', userId);

      if (tasks) {
        const { loadTasks } = require('./taskStore').useTaskStore.getState();
        loadTasks(tasks);
      }

      // Load tags
      const { data: tags } = await supabase
        .from('user_tags')
        .select('*')
        .eq('user_id', userId);

      if (tags) {
        const { loadTags } = require('./tagStore').useTagStore.getState();
        loadTags(tags);
      }

      // Load notes
      const { data: notes } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId);

      if (notes) {
        const { loadNotes } = require('./notesStore').useNotesStore.getState();
        loadNotes(notes);
      }

      // Load decks and cards
      const { data: decks } = await supabase
        .from('user_decks')
        .select(`
          *,
          user_cards (*)
        `)
        .eq('user_id', userId);

      if (decks) {
        const { loadDecks } = require('./cardsStore').useCardsStore.getState();
        loadDecks(decks);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  },

  deleteUser: (userId: string) => {
    set((state) => ({
      users: state.users.filter(u => u.id !== userId),
    }));
  },

  resetUserPassword: (userId: string, newPassword: string) => {
    // In a real app, this would make an API call
    console.log(`Password reset for user ${userId}: ${newPassword}`);
  },

  updateUserHours: (userId: string, hours: number) => {
    set((state) => ({
      users: state.users.map(u => 
        u.id === userId ? { ...u, totalHours: u.totalHours + hours } : u
      ),
    }));
  },
}));