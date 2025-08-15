import { create } from 'zustand';

interface AppState {
  motivationMessages: string[];
  defaultTasks: string[];
  primaryColor: string;
  accentColor: string;
  appLogo: string;
  addMotivationMessage: (message: string) => void;
  removeMotivationMessage: (index: number) => void;
  updateMotivationMessage: (index: number, message: string) => void;
  addDefaultTask: (task: string) => void;
  removeDefaultTask: (index: number) => void;
  updateColors: (primary: string, accent: string) => void;
  updateLogo: (logo: string) => void;
  exportData: () => string;
  clearTestData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  motivationMessages: [
    "You're crushing it! Keep going! 💪",
    "Focus mode activated! Time to grind! 🔥",
    "Every minute counts. Stay strong! ⚡",
    "You're building something amazing! 🚀",
    "Consistency is key. You've got this! 🎯",
  ],
  defaultTasks: [
    "Complete React Chapter",
    "Practice JavaScript Algorithms",
    "Review Math Notes",
    "Prepare for Presentation",
    "Study for Exam",
  ],
  primaryColor: '#10B981',
  accentColor: '#6366F1',
  appLogo: 'StudyGrind',

  addMotivationMessage: (message: string) => {
    set((state) => ({
      motivationMessages: [...state.motivationMessages, message],
    }));
  },

  removeMotivationMessage: (index: number) => {
    set((state) => ({
      motivationMessages: state.motivationMessages.filter((_, i) => i !== index),
    }));
  },

  updateMotivationMessage: (index: number, message: string) => {
    set((state) => ({
      motivationMessages: state.motivationMessages.map((msg, i) => 
        i === index ? message : msg
      ),
    }));
  },

  addDefaultTask: (task: string) => {
    set((state) => ({
      defaultTasks: [...state.defaultTasks, task],
    }));
  },

  removeDefaultTask: (index: number) => {
    set((state) => ({
      defaultTasks: state.defaultTasks.filter((_, i) => i !== index),
    }));
  },

  updateColors: (primary: string, accent: string) => {
    set({ primaryColor: primary, accentColor: accent });
  },

  updateLogo: (logo: string) => {
    set({ appLogo: logo });
  },

  exportData: () => {
    const state = get();
    const data = {
      motivationMessages: state.motivationMessages,
      defaultTasks: state.defaultTasks,
      colors: {
        primary: state.primaryColor,
        accent: state.accentColor,
      },
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  clearTestData: () => {
    set({
      motivationMessages: ["You're crushing it! Keep going! 💪"],
      defaultTasks: ["Complete React Chapter"],
    });
  },
}));