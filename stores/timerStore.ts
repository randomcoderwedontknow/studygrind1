import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface ScheduledBreak {
  minute: number;
  duration: number;
  taken: boolean;
}

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  canEndEarly: boolean;
  currentMode: 'pomodoro' | 'extended' | 'custom';
  currentSession: 'work' | 'break';
  customDuration: number;
  scheduledBreaks: ScheduledBreak[];
  currentBreak: ScheduledBreak | null;
  isOnBreak: boolean;
  completedSessions: number;
  totalStudyTime: number;
  currentStreak: number;
  lastStudyDate: string | null;
  showSessionRecap: boolean;
  sessionStats: {
    duration: number;
    pointsEarned: number;
    tasksCompleted: number;
  } | null;
  
  setMode: (mode: 'pomodoro' | 'extended' | 'custom') => void;
  setCustomDuration: (seconds: number) => void;
  setScheduledBreaks: (breaks: ScheduledBreak[]) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  endSessionEarly: () => void;
  endBreak: () => void;
  tick: () => void;
  setUserStats: (stats: { completedSessions: number; totalStudyTime: number; currentStreak: number }) => void;
  syncToDatabase: () => Promise<void>;
}

const getInitialTime = (mode: 'pomodoro' | 'extended' | 'custom', customDuration: number) => {
  switch (mode) {
    case 'pomodoro':
      return 1500; // 25 minutes
    case 'extended':
      return 3600; // 60 minutes
    case 'custom':
      return customDuration;
    default:
      return 1500;
  }
};

export const useTimerStore = create<TimerState>((set, get) => ({
  timeLeft: 1500,
  isRunning: false,
  canEndEarly: false,
  currentMode: 'pomodoro',
  currentSession: 'work',
  customDuration: 1500,
  scheduledBreaks: [],
  currentBreak: null,
  isOnBreak: false,
  completedSessions: 0,
  totalStudyTime: 0,
  currentStreak: 0,
  lastStudyDate: null,
  showSessionRecap: false,
  sessionStats: null,

  setMode: (mode) => {
    const state = get();
    const newTime = getInitialTime(mode, state.customDuration);
    set({
      currentMode: mode,
      timeLeft: newTime,
      isRunning: false,
      canEndEarly: false,
      currentSession: 'work',
    });
  },

  setCustomDuration: (seconds) => {
    set({ customDuration: seconds });
    const state = get();
    if (state.currentMode === 'custom') {
      set({ timeLeft: seconds });
    }
  },

  setScheduledBreaks: (breaks) => {
    set({ scheduledBreaks: breaks });
  },

  startTimer: () => {
    set({ isRunning: true, canEndEarly: true });
    
    const interval = setInterval(() => {
      const state = get();
      if (state.isRunning && state.timeLeft > 0) {
        get().tick();
      } else if (state.timeLeft === 0) {
        clearInterval(interval);
        get().handleTimerComplete();
      }
    }, 1000);
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  stopTimer: () => {
    const state = get();
    const initialTime = getInitialTime(state.currentMode, state.customDuration);
    set({
      isRunning: false,
      canEndEarly: false,
      timeLeft: initialTime,
      currentSession: 'work',
      scheduledBreaks: state.scheduledBreaks.map(b => ({ ...b, taken: false })),
    });
  },

  endSessionEarly: () => {
    const state = get();
    const initialTime = getInitialTime(state.currentMode, state.customDuration);
    const studiedTime = Math.floor((initialTime - state.timeLeft) / 60);
    
    if (studiedTime > 0) {
      const pointsEarned = Math.floor(studiedTime * 2);
      
      set((state) => ({
        completedSessions: state.completedSessions + 1,
        totalStudyTime: state.totalStudyTime + studiedTime,
        sessionStats: {
          duration: studiedTime,
          pointsEarned,
          tasksCompleted: 0,
        },
        showSessionRecap: true,
        isRunning: false,
        canEndEarly: false,
        timeLeft: initialTime,
        currentSession: 'work',
      }));

      // Add points to focus shop
      const { addPoints } = require('./focusShopStore').useFocusShopStore.getState();
      addPoints(pointsEarned);

      // Add experience points
      const { addExperience } = require('./userStore').useUserStore.getState();
      addExperience(pointsEarned);

      get().syncToDatabase();
    } else {
      get().stopTimer();
    }
  },

  endBreak: () => {
    set({ isOnBreak: false, currentBreak: null });
    get().startTimer();
  },

  tick: () => {
    set((state) => {
      const newTimeLeft = state.timeLeft - 1;
      
      // Check for scheduled breaks
      if (state.scheduledBreaks.length > 0 && !state.isOnBreak) {
        const totalTime = getInitialTime(state.currentMode, state.customDuration);
        const elapsedTime = totalTime - newTimeLeft;
        const elapsedMinutes = Math.floor(elapsedTime / 60);
        
        const nextBreak = state.scheduledBreaks.find(b => 
          b.minute === elapsedMinutes && !b.taken
        );
        
        if (nextBreak) {
          // Mark break as taken and trigger break
          const updatedBreaks = state.scheduledBreaks.map(b =>
            b.minute === nextBreak.minute ? { ...b, taken: true } : b
          );
          
          return {
            ...state,
            timeLeft: newTimeLeft,
            scheduledBreaks: updatedBreaks,
            isOnBreak: true,
            currentBreak: nextBreak,
            isRunning: false,
          };
        }
      }
      
      return { ...state, timeLeft: newTimeLeft };
    });
  },

  handleTimerComplete: () => {
    const state = get();
    const studiedTime = Math.floor(getInitialTime(state.currentMode, state.customDuration) / 60);
    const pointsEarned = Math.floor(studiedTime * 2);
    
    set((state) => ({
      completedSessions: state.completedSessions + 1,
      totalStudyTime: state.totalStudyTime + studiedTime,
      sessionStats: {
        duration: studiedTime,
        pointsEarned,
        tasksCompleted: 0,
      },
      showSessionRecap: true,
      isRunning: false,
      canEndEarly: false,
      timeLeft: getInitialTime(state.currentMode, state.customDuration),
      currentSession: 'work',
    }));

    // Add points to focus shop
    const { addPoints } = require('./focusShopStore').useFocusShopStore.getState();
    addPoints(pointsEarned);

    // Add experience points
    const { addExperience } = require('./userStore').useUserStore.getState();
    addExperience(pointsEarned);

    get().syncToDatabase();
  },

  setUserStats: (stats) => {
    set({
      completedSessions: stats.completedSessions,
      totalStudyTime: stats.totalStudyTime,
      currentStreak: stats.currentStreak,
    });
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      await supabase
        .from('user_profiles')
        .update({
          completed_sessions: state.completedSessions,
          total_study_time: state.totalStudyTime,
          current_streak: state.currentStreak,
          last_study_date: new Date().toISOString(),
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error syncing timer data:', error);
    }
  },
}));