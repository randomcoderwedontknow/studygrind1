import { create } from 'zustand';
import { useFocusShopStore } from './focusShopStore';

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  price: number;
  category: 'word' | 'number' | 'memory' | 'logic';
  maxDuration: number; // in minutes
}

interface GamesState {
  games: MiniGame[];
  unlockedGames: string[];
  currentGame: string | null;
  unlockGame: (gameId: string) => void;
  purchaseGame: (gameId: string) => boolean;
  setCurrentGame: (gameId: string | null) => void;
  isGameUnlocked: (gameId: string) => boolean;
  getGameById: (gameId: string) => MiniGame | undefined;
}

const defaultGames: MiniGame[] = [
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble letters to form words',
    icon: '🔤',
    unlocked: false,
    price: 200,
    category: 'word',
    maxDuration: 3,
  },
  {
    id: 'number-puzzle',
    name: 'Number Puzzle',
    description: 'Solve mathematical sequences',
    icon: '🔢',
    unlocked: false,
    price: 250,
    category: 'number',
    maxDuration: 3,
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Match pairs of cards',
    icon: '🧠',
    unlocked: false,
    price: 300,
    category: 'memory',
    maxDuration: 2,
  },
  {
    id: 'logic-puzzle',
    name: 'Logic Puzzle',
    description: 'Solve calming logic challenges',
    icon: '🧩',
    unlocked: false,
    price: 350,
    category: 'logic',
    maxDuration: 3,
  },
];

export const useGamesStore = create<GamesState>((set, get) => ({
  games: defaultGames,
  unlockedGames: [],
  currentGame: null,

  unlockGame: (gameId: string) => {
    set((state) => ({
      unlockedGames: [...state.unlockedGames, gameId],
      games: state.games.map(game =>
        game.id === gameId ? { ...game, unlocked: true } : game
      ),
    }));
  },

  purchaseGame: (gameId: string) => {
    const game = get().games.find(g => g.id === gameId);
    if (!game || get().isGameUnlocked(gameId)) return false;

    const { points, addPoints } = useFocusShopStore.getState();
    if (points < game.price) return false;

    addPoints(-game.price);
    get().unlockGame(gameId);
    return true;
  },

  setCurrentGame: (gameId: string | null) => {
    set({ currentGame: gameId });
  },

  isGameUnlocked: (gameId: string) => {
    return get().unlockedGames.includes(gameId);
  },

  getGameById: (gameId: string) => {
    return get().games.find(g => g.id === gameId);
  },
}));