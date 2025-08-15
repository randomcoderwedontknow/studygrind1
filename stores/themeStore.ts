import { create } from 'zustand';

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
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  darkColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  backgroundType: 'solid' | 'gradient';
  gradient?: {
    start: string;
    end: string;
    direction: string;
  };
  preview: string;
  unlocked: boolean;
}

interface ThemeState {
  themes: Theme[];
  currentThemeId: string;
  currentTheme: Theme;
  isDarkMode: boolean;
  themeVersion: number;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  unlockTheme: (themeId: string) => void;
  equipTheme: (themeId: string) => void;
  unequipTheme: () => void;
  isThemeUnlocked: (themeId: string) => boolean;
  getThemeById: (themeId: string) => Theme | undefined;
  getCurrentColors: () => Theme['colors'];
  initializeThemes: () => void;
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
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    darkColors: {
      primary: '#10B981',
      secondary: '#064E3B',
      accent: '#6366F1',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    backgroundType: 'solid',
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
      textSecondary: '#0369A1',
      border: '#BAE6FD',
      success: '#06B6D4',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    backgroundType: 'gradient',
    gradient: {
      start: '#E0F2FE',
      end: '#F0F9FF',
      direction: 'to bottom',
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
      textSecondary: '#C2410C',
      border: '#FED7AA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    backgroundType: 'gradient',
    gradient: {
      start: '#FFF7ED',
      end: '#FEF3C7',
      direction: 'to bottom right',
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
      textSecondary: '#065F46',
      border: '#A7F3D0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    backgroundType: 'solid',
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
      textSecondary: '#6B21A8',
      border: '#C4B5FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    backgroundType: 'gradient',
    gradient: {
      start: '#F3E8FF',
      end: '#FAF5FF',
      direction: 'to bottom',
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
      textSecondary: '#BE185D',
      border: '#F9A8D4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    backgroundType: 'gradient',
    gradient: {
      start: '#FDF2F8',
      end: '#FEF7FF',
      direction: 'to bottom right',
    },
    preview: 'Delicate pink cherry blossom theme',
    unlocked: false,
  },
];

export const useThemeStore = create<ThemeState>((set, get) => ({
  themes: defaultThemes,
  currentThemeId: 'default',
  currentTheme: defaultThemes[0],
  isDarkMode: false,
  themeVersion: 0,

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
    get().applyThemeColors();
  },

  setDarkMode: (isDark: boolean) => {
    set({ isDarkMode: isDark });
    get().applyThemeColors();
  },

  getCurrentColors: () => {
    const state = get();
    const theme = state.currentTheme;
    return state.isDarkMode && theme.darkColors ? theme.darkColors : theme.colors;
  },

  unlockTheme: (themeId: string) => {
    set((state) => ({
      themes: state.themes.map(theme =>
        theme.id === themeId ? { ...theme, unlocked: true } : theme
      ),
    }));
  },

  equipTheme: (themeId: string) => {
    const theme = get().themes.find(t => t.id === themeId);
    if (theme && theme.unlocked) {
      set({
        currentThemeId: themeId,
        currentTheme: theme,
      });
      
      get().applyThemeColors();
      
      // Force re-render of all components by updating a global theme version
      set((state) => ({ 
        ...state,
        themeVersion: (state.themeVersion || 0) + 1 
      }));
    }
  },

  applyThemeColors: () => {
    const state = get();
    const colors = state.getCurrentColors();
    
    // Apply theme to CSS variables for global styling (web only)
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-secondary', colors.secondary);
      root.style.setProperty('--color-accent', colors.accent);
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-surface', colors.surface);
      root.style.setProperty('--color-text', colors.text);
      root.style.setProperty('--color-text-secondary', colors.textSecondary);
      root.style.setProperty('--color-border', colors.border);
      root.style.setProperty('--color-success', colors.success);
      root.style.setProperty('--color-warning', colors.warning);
      root.style.setProperty('--color-error', colors.error);
      
      const theme = state.currentTheme;
      if (theme.backgroundType === 'gradient' && theme.gradient) {
        root.style.setProperty('--background-gradient', 
          `linear-gradient(${theme.gradient.direction}, ${theme.gradient.start}, ${theme.gradient.end})`
        );
      }
    }
  },
  unequipTheme: () => {
    const defaultTheme = get().themes.find(t => t.id === 'default');
    if (defaultTheme) {
      get().equipTheme('default');
    }
  },

  isThemeUnlocked: (themeId: string) => {
    const theme = get().themes.find(t => t.id === themeId);
    return theme ? theme.unlocked : false;
  },

  getThemeById: (themeId: string) => {
    return get().themes.find(t => t.id === themeId);
  },

  initializeThemes: () => {
    const currentTheme = get().currentTheme;
    get().equipTheme(currentTheme.id);
  },
}));