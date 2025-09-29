import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface SpinReward {
  id: string;
  type: 'points' | 'badge' | 'discount' | 'theme' | 'multiplier';
  value: number | string;
  label: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic';
}

interface DailySpinState {
  lastSpinDate: string | null;
  canSpin: boolean;
  isSpinning: boolean;
  currentReward: SpinReward | null;
  availableRewards: SpinReward[];
  checkCanSpin: () => boolean;
  performSpin: () => Promise<SpinReward>;
  claimReward: (reward: SpinReward) => Promise<void>;
  initializeSpin: () => void;
}

const defaultRewards: SpinReward[] = [
  { id: '1', type: 'points', value: 100, label: '+100 Points', color: '#10B981', rarity: 'common' },
  { id: '2', type: 'points', value: 200, label: '+200 Points', color: '#3B82F6', rarity: 'common' },
  { id: '3', type: 'points', value: 300, label: '+300 Points', color: '#8B5CF6', rarity: 'rare' },
  { id: '4', type: 'points', value: 500, label: '+500 Points', color: '#F59E0B', rarity: 'rare' },
  { id: '5', type: 'badge', value: 'daily_spinner', label: 'Daily Spinner Badge', color: '#EC4899', rarity: 'rare' },
  { id: '6', type: 'discount', value: 50, label: '50% Off Next Theme', color: '#06B6D4', rarity: 'epic' },
  { id: '7', type: 'theme', value: 'ocean-blue', label: 'Free Ocean Theme', color: '#0EA5E9', rarity: 'epic' },
  { id: '8', type: 'multiplier', value: 2, label: '2x Points Next Session', color: '#EF4444', rarity: 'epic' },
];

export const useDailySpinStore = create<DailySpinState>((set, get) => ({
  lastSpinDate: null,
  canSpin: true,
  isSpinning: false,
  currentReward: null,
  availableRewards: defaultRewards,

  checkCanSpin: () => {
    const today = new Date().toDateString();
    const lastSpin = get().lastSpinDate;
    const canSpin = !lastSpin || lastSpin !== today;
    set({ canSpin });
    return canSpin;
  },

  performSpin: async () => {
    if (!get().canSpin || get().isSpinning) {
      throw new Error('Cannot spin right now');
    }

    set({ isSpinning: true });

    // Simulate spin animation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Weighted random selection
    const rewards = get().availableRewards;
    const weights = rewards.map(r => {
      switch (r.rarity) {
        case 'common': return 40;
        case 'rare': return 25;
        case 'epic': return 10;
        default: return 20;
      }
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedReward = rewards[0];
    for (let i = 0; i < rewards.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedReward = rewards[i];
        break;
      }
    }

    const today = new Date().toDateString();
    set({ 
      currentReward: selectedReward,
      lastSpinDate: today,
      canSpin: false,
      isSpinning: false 
    });

    return selectedReward;
  },

  claimReward: async (reward: SpinReward) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      // Apply the reward
      switch (reward.type) {
        case 'points':
          const { addPoints } = require('./focusShopStore').useFocusShopStore.getState();
          addPoints(reward.value as number);
          break;
        case 'theme':
          const { unlockTheme } = require('./themeStore').useThemeStore.getState();
          unlockTheme(reward.value as string);
          break;
        case 'discount':
          // Store discount for next purchase
          localStorage.setItem('theme_discount', JSON.stringify({
            percentage: reward.value,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          }));
          break;
        case 'multiplier':
          // Store multiplier for next session
          localStorage.setItem('points_multiplier', JSON.stringify({
            multiplier: reward.value,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          }));
          break;
      }

      set({ currentReward: null });
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  },

  initializeSpin: () => {
    get().checkCanSpin();
  },
}));