import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface FocusLockState {
  lockedPages: string[];
  isLockActive: boolean;
  lockEndTime: Date | null;
  lockReason: string;
  isPageLocked: (pagePath: string) => boolean;
  lockPages: (pages: string[], duration: number, reason: string) => void;
  unlockAllPages: () => void;
  checkLockExpiry: () => void;
  loadFromDatabase: () => Promise<void>;
  syncToDatabase: () => Promise<void>;
}

export const useFocusLockStore = create<FocusLockState>((set, get) => ({
  lockedPages: [],
  isLockActive: false,
  lockEndTime: null,
  lockReason: '',

  isPageLocked: (pagePath: string) => {
    const state = get();
    if (!state.isLockActive) return false;
    
    // Check if lock has expired
    if (state.lockEndTime && new Date() > state.lockEndTime) {
      get().unlockAllPages();
      return false;
    }
    
    return state.lockedPages.includes(pagePath);
  },

  lockPages: (pages: string[], duration: number, reason: string) => {
    const lockEndTime = new Date(Date.now() + duration * 60 * 1000); // duration in minutes
    set({
      lockedPages: pages,
      isLockActive: true,
      lockEndTime,
      lockReason: reason,
    });
    get().syncToDatabase();
  },

  unlockAllPages: () => {
    set({
      lockedPages: [],
      isLockActive: false,
      lockEndTime: null,
      lockReason: '',
    });
    get().syncToDatabase();
  },

  checkLockExpiry: () => {
    const state = get();
    if (state.isLockActive && state.lockEndTime && new Date() > state.lockEndTime) {
      get().unlockAllPages();
    }
  },

  loadFromDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      // In a real implementation, this would load focus lock settings from the database
      // For now, we'll just initialize with empty state
      set({
        lockedPages: [],
        isLockActive: false,
        lockEndTime: null,
        lockReason: '',
      });
    } catch (error) {
      console.error('Error loading focus lock settings:', error);
    }
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      
      // In a real implementation, this would sync focus lock settings to the database
      // For now, we'll just log the state
      console.log('Focus lock state:', {
        lockedPages: state.lockedPages,
        isLockActive: state.isLockActive,
        lockEndTime: state.lockEndTime,
        lockReason: state.lockReason,
      });
    } catch (error) {
      console.error('Error syncing focus lock settings:', error);
    }
  },
}));