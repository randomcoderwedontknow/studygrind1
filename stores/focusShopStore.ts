import { create } from 'zustand';

export interface FocusShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'themes' | 'games' | 'features' | 'rewards';
  icon: string;
  unlocked: boolean;
}

interface FocusShopState {
  points: number;
  items: FocusShopItem[];
  purchasedItems: string[];
  addPoints: (amount: number) => void;
  setPoints: (amount: number) => void;
  setOwnerPoints: () => void;
  purchaseItem: (itemId: string) => boolean;
  isItemPurchased: (itemId: string) => boolean;
  getItemById: (itemId: string) => FocusShopItem | undefined;
}

const defaultItems: FocusShopItem[] = [
  {
    id: 'theme-ocean',
    name: 'Ocean Blue Theme',
    description: 'Calming blue waves for deep focus',
    price: 300,
    category: 'themes',
    icon: '🌊',
    unlocked: false,
  },
  {
    id: 'theme-sunset',
    name: 'Sunset Orange Theme',
    description: 'Warm and energizing sunset vibes',
    price: 400,
    category: 'themes',
    icon: '🌅',
    unlocked: false,
  },
  {
    id: 'game-word-scramble',
    name: 'Word Scramble Game',
    description: 'Unscramble letters to form words',
    price: 200,
    category: 'games',
    icon: '🔤',
    unlocked: false,
  },
  {
    id: 'game-memory-match',
    name: 'Memory Match Game',
    description: 'Match pairs of cards',
    price: 300,
    category: 'games',
    icon: '🧠',
    unlocked: false,
  },
];

export const useFocusShopStore = create<FocusShopState>((set, get) => ({
  points: 0,
  items: defaultItems,
  purchasedItems: [],

  addPoints: (amount: number) => {
    set((state) => ({ points: Math.max(0, state.points + amount) }));
  },

  setPoints: (amount: number) => {
    set({ points: Math.max(0, amount) });
  },

  setOwnerPoints: () => {
    set({ points: 9999 });
  },

  purchaseItem: (itemId: string) => {
    const state = get();
    const item = state.items.find(i => i.id === itemId);
    
    if (!item || state.points < item.price || state.purchasedItems.includes(itemId)) {
      return false;
    }

    set((state) => ({
      points: state.points - item.price,
      purchasedItems: [...state.purchasedItems, itemId],
      items: state.items.map(i => 
        i.id === itemId ? { ...i, unlocked: true } : i
      ),
    }));

    return true;
  },

  isItemPurchased: (itemId: string) => {
    return get().purchasedItems.includes(itemId);
  },

  getItemById: (itemId: string) => {
    return get().items.find(i => i.id === itemId);
  },
}));