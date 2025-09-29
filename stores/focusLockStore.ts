import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface FocusLockPage {
  id: string;
  name: string;
  route: string;
  description: string;
  icon: string;
}

interface FocusLockState {
  isEnabled: boolean;
  hasCompletedSetup: boolean;
  lockedPages: string[];
  showSetupModal: boolean;
  availablePages: FocusLockPage[];
  setEnabled: (enabled: boolean) => void;
  setLockedPages: (pageIds: string[]) => void;
  completeSetup: () => void;
  showSetup: () => void;
  hideSetup: () => void;
  isPageLocked: (route: string) => boolean;
  togglePageLock: (pageId: string) => void;
  selectAllPages: () => void;
  deselectAllPages: () => void;
  resetToDefaults: () => void;
  syncToDatabase: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
}

const defaultPages: FocusLockPage[] = [
  {
    id: 'focus-shop',
    name: 'Focus Shop',
    route: '/(tabs)/focus-shop',
    description: 'Themes and customization store',
    icon: '🛍️',
  },
  {
    id: 'games',
    name: 'Games',
    route: '/(tabs)/games',
    description: 'Mini-games for study breaks',
    icon: '🎮',
  },
  {
    id: 'profile',
    name: 'Profile',
    route: '/(tabs)/profile',
    description: 'Stats and achievements',
    icon: '👤',
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/(tabs)/settings',
    description: 'App preferences and account',
    icon: '⚙️',
  },
  {
    id: 'notes',
    name: 'Notes',
    route: '/(tabs)/notes',
    description: 'Study notes and ideas',
    icon: '📝',
  },
];

export const useFocusLockStore = create<FocusLockState>((set, get) => ({
  isEnabled: false,
  hasCompletedSetup: false,
  lockedPages: [],
  showSetupModal: false,
  availablePages: defaultPages,

  setEnabled: (enabled: boolean) => {
    const state = get();
    
    // If enabling for the first time and setup not completed, show setup
    if (enabled && !state.hasCompletedSetup) {
      set({ showSetupModal: true });
      return;
    }
    
    set({ isEnabled: enabled });
    get().syncToDatabase();
  },

  setLockedPages: (pageIds: string[]) => {
    set({ lockedPages: pageIds });
    get().syncToDatabase();
  },

  completeSetup: () => {
    set({ 
      hasCompletedSetup: true, 
      showSetupModal: false,
      isEnabled: true,
    });
    get().syncToDatabase();
  },

  showSetup: () => set({ showSetupModal: true }),
  hideSetup: () => set({ showSetupModal: false }),

  isPageLocked: (route: string) => {
    const state = get();
    if (!state.isEnabled) return false;
    
    const page = state.availablePages.find(p => p.route === route);
    return page ? state.lockedPages.includes(page.id) : false;
  },

  togglePageLock: (pageId: string) => {
    set((state) => ({
      lockedPages: state.lockedPages.includes(pageId)
        ? state.lockedPages.filter(id => id !== pageId)
        : [...state.lockedPages, pageId],
    }));
  },

  selectAllPages: () => {
    const allPageIds = get().availablePages.map(page => page.id);
    set({ lockedPages: allPageIds });
  },

  deselectAllPages: () => {
    set({ lockedPages: [] });
  },

  resetToDefaults: () => {
    // Default to locking distracting pages
    const defaultLocked = ['focus-shop', 'games', 'profile'];
    set({ lockedPages: defaultLocked });
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      
      // Store focus lock settings in user_profiles or create a separate table
      const focusLockData = {
        is_enabled: state.isEnabled,
        has_completed_setup: state.hasCompletedSetup,
        locked_pages: state.lockedPages,
      };

      // For now, we'll store this in localStorage since we don't have a focus_lock table
      // In a real app, you'd create a focus_lock_settings table
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`focus_lock_${user.id}`, JSON.stringify(focusLockData));
      }
    } catch (error) {
      console.error('Error syncing focus lock settings:', error);
    }
  },

  loadFromDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      // Load from localStorage for now
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(`focus_lock_${user.id}`);
        if (stored) {
          const data = JSON.parse(stored);
          set({
            isEnabled: data.is_enabled || false,
            hasCompletedSetup: data.has_completed_setup || false,
            lockedPages: data.locked_pages || [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading focus lock settings:', error);
    }
  },
}));