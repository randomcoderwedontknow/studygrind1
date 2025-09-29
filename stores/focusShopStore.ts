import { create } from 'zustand';
import { useThemeStore } from './themeStore';
import { supabase } from '@/lib/supabase';

export interface Theme {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  preview: string;
  unlocked: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'theme' | 'background' | 'sound';
  unlocked: boolean;
  preview?: string;
}

interface FocusShopState {
  points: number;
  themes: Theme[];
  items: ShopItem[];
  unlockedItems: string[];
  previewTheme: string | null;
  purchaseItem: (itemId: string) => boolean;
  purchaseTheme: (themeId: string) => boolean;
  addPoints: (amount: number) => void;
  setOwnerPoints: () => void;
  setPoints: (points: number) => void;
  isItemUnlocked: (itemId: string) => boolean;
  isThemeUnlocked: (themeId: string) => boolean;
  previewThemeTemporarily: (themeId: string) => void;
  clearPreview: () => void;
  syncToDatabase: () => Promise<void>;
  awardSessionPoints: (sessionMinutes: number) => number;
  awardStreakBonus: (streakDays: number) => number;
  awardMilestoneBonus: (totalSessions: number) => number;
  awardFlashcardPoints: (cardsReviewed: number, sessionCompleted: boolean) => number;
}

const defaultThemes: Theme[] = [
  {
    id: 'default',
    name: 'StudyGrind Green',
    description: 'The classic StudyGrind experience',
    price: 0,
    colors: {
      primary: '#10B981',
      secondary: '#ECFDF5',
      accent: '#6366F1',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1F2937',
    },
    preview: 'Default green theme with clean design',
    unlocked: true,
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue waves for deep focus',
    price: 300,
    colors: {
      primary: '#0EA5E9',
      secondary: '#E0F2FE',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F0F9FF',
      text: '#0C4A6E',
    },
    preview: 'Soothing blue tones inspired by ocean depths',
    unlocked: false,
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energizing sunset vibes',
    price: 400,
    colors: {
      primary: '#F97316',
      secondary: '#FFF7ED',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#FEF3C7',
      text: '#9A3412',
    },
    preview: 'Energizing orange and yellow sunset colors',
    unlocked: false,
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural forest environment for concentration',
    price: 350,
    colors: {
      primary: '#059669',
      secondary: '#ECFDF5',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text: '#064E3B',
    },
    preview: 'Deep forest greens for natural focus',
    unlocked: false,
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'Mysterious purple for late-night sessions',
    price: 500,
    colors: {
      primary: '#7C3AED',
      secondary: '#F3E8FF',
      accent: '#A855F7',
      background: '#FFFFFF',
      surface: '#FAF5FF',
      text: '#581C87',
    },
    preview: 'Rich purple tones for evening study sessions',
    unlocked: false,
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft pink petals for gentle motivation',
    price: 450,
    colors: {
      primary: '#EC4899',
      secondary: '#FDF2F8',
      accent: '#F472B6',
      background: '#FFFFFF',
      surface: '#FEF7FF',
      text: '#831843',
    },
    preview: 'Delicate pink cherry blossom theme',
    unlocked: false,
  },
];

const shopItems: ShopItem[] = [
  // Backgrounds
  { id: 'bg-mountains', name: 'Mountain View', description: 'Peaceful mountain scenery', price: 200, category: 'background', unlocked: false },
  { id: 'bg-library', name: 'Cozy Library', description: 'Classic study environment', price: 200, category: 'background', unlocked: false },
  { id: 'bg-space', name: 'Space Station', description: 'Futuristic space theme', price: 300, category: 'background', unlocked: false },
  
  // Sounds
  { id: 'sound-rain', name: 'Rain Sounds', description: 'Gentle rainfall ambience', price: 150, category: 'sound', unlocked: false },
  { id: 'sound-cafe', name: 'Coffee Shop', description: 'Bustling cafe atmosphere', price: 150, category: 'sound', unlocked: false },
  { id: 'sound-nature', name: 'Forest Sounds', description: 'Birds and nature sounds', price: 200, category: 'sound', unlocked: false },
];

export const useFocusShopStore = create<FocusShopState>((set, get) => ({
  points: 0, // Starting points for new users
  themes: defaultThemes,
  items: shopItems,
  unlockedItems: [],
  previewTheme: null,

  purchaseItem: (itemId: string) => {
    const state = get();
    const item = state.items.find(i => i.id === itemId);
    
    if (!item || state.points < item.price || state.unlockedItems.includes(itemId)) {
      return false;
    }

    set({
      points: state.points - item.price,
      unlockedItems: [...state.unlockedItems, itemId],
    });
    return true;
  },

  purchaseTheme: (themeId: string) => {
    const state = get();
    const themeStore = useThemeStore.getState();
    const theme = themeStore.getThemeById(themeId);
    
    if (!theme || state.points < theme.price || themeStore.isThemeUnlocked(themeId)) {
      return false;
    }

    set({
      points: state.points - theme.price,
    });
    
    themeStore.unlockTheme(themeId);
    return true;
  },

  addPoints: (amount: number) => {
    set((state) => ({ points: Math.max(0, state.points + amount) }));
    get().syncToDatabase();
  },

  setOwnerPoints: () => {
    set({ points: 9999 });
  },

  setPoints: (points: number) => {
    set({ points });
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      await supabase
        .from('user_profiles')
        .update({
          focus_points: state.points,
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error syncing focus points:', error);
    }
  },

  isItemUnlocked: (itemId: string) => {
    return get().unlockedItems.includes(itemId);
  },

  isThemeUnlocked: (themeId: string) => {
    return useThemeStore.getState().isThemeUnlocked(themeId);
  },

  previewThemeTemporarily: (themeId: string) => {
    const themeStore = useThemeStore.getState();
    const theme = themeStore.getThemeById(themeId);
    if (theme) {
      // Store the current theme before preview
      const currentThemeId = themeStore.currentThemeId;
      set({ previewTheme: themeId });
      
      // Temporarily apply the preview theme
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-background', theme.colors.background);
        root.style.setProperty('--color-surface', theme.colors.surface);
        root.style.setProperty('--color-text', theme.colors.text);
        root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
        root.style.setProperty('--color-border', theme.colors.border);
        root.style.setProperty('--color-success', theme.colors.success);
        root.style.setProperty('--color-warning', theme.colors.warning);
        root.style.setProperty('--color-error', theme.colors.error);
        
        if (theme.backgroundType === 'gradient' && theme.gradient) {
          root.style.setProperty('--background-gradient', 
            `linear-gradient(${theme.gradient.direction}, ${theme.gradient.start}, ${theme.gradient.end})`
          );
        }
      }
    }
  },

  clearPreview: () => {
    const state = get();
    if (state.previewTheme) {
      set({ previewTheme: null });
      const themeStore = useThemeStore.getState();
      // Revert to the currently equipped theme
      themeStore.equipTheme(themeStore.currentThemeId);
    }
  },

  awardSessionPoints: (sessionMinutes: number) => {
    // Award 100 points for 10+ minute sessions
    if (sessionMinutes >= 10) {
      const pointsEarned = 100;
      set((state) => ({ points: state.points + pointsEarned }));
      get().syncToDatabase();
      return pointsEarned;
    }
    return 0;
  },

  awardStreakBonus: (streakDays: number) => {
    let bonus = 0;
    if (streakDays === 7) bonus = 250;
    else if (streakDays === 14) bonus = 500;
    else if (streakDays === 30) bonus = 1000;
    
    if (bonus > 0) {
      set((state) => ({ points: state.points + bonus }));
      get().syncToDatabase();
    }
    return bonus;
  },

  awardMilestoneBonus: (totalSessions: number) => {
    let bonus = 0;
    if (totalSessions === 10) bonus = 200;
    else if (totalSessions === 50) bonus = 500;
    else if (totalSessions === 100) bonus = 1000;
    else if (totalSessions === 250) bonus = 2000;
    
    if (bonus > 0) {
      set((state) => ({ points: state.points + bonus }));
      get().syncToDatabase();
    }
    return bonus;
  },

  awardFlashcardPoints: (cardsReviewed: number, sessionCompleted: boolean) => {
    const cardPoints = cardsReviewed * 10; // 10 points per card reviewed
    const sessionBonus = sessionCompleted ? 50 : 0; // 50 bonus for completing full session
    const totalPoints = cardPoints + sessionBonus;
    
    if (totalPoints > 0) {
      set((state) => ({ points: state.points + totalPoints }));
      get().syncToDatabase();
    }
    return totalPoints;
  },
}));