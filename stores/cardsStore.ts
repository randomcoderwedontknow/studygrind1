import { create } from 'zustand';

export interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  createdAt: Date;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: Card[];
  createdAt: Date;
  lastStudied?: Date;
  totalReviews: number;
}

interface CardsState {
  decks: Deck[];
  currentDeck: Deck | null;
  currentCard: Card | null;
  reviewSession: {
    deckId: string;
    cards: Card[];
    currentIndex: number;
    showAnswer: boolean;
    completed: number;
    total: number;
  } | null;
  
  // Deck management
  createDeck: (name: string, description?: string) => string;
  updateDeck: (deckId: string, name: string, description?: string) => void;
  deleteDeck: (deckId: string) => void;
  
  // Card management
  addCard: (deckId: string, front: string, back: string) => void;
  updateCard: (cardId: string, front: string, back: string) => void;
  deleteCard: (cardId: string) => void;
  
  // Review system
  startReviewSession: (deckId: string) => void;
  showCardAnswer: () => void;
  markCard: (difficulty: 'easy' | 'medium' | 'hard') => void;
  endReviewSession: () => number; // Returns points earned
  
  // Utilities
  getDeckById: (deckId: string) => Deck | undefined;
  getCardsForReview: (deckId: string) => Card[];
  getDeckStats: (deckId: string) => { total: number; dueForReview: number; mastered: number };
}

const calculateNextReview = (difficulty: 'easy' | 'medium' | 'hard', reviewCount: number): Date => {
  const now = new Date();
  let daysToAdd = 1;
  
  switch (difficulty) {
    case 'easy':
      daysToAdd = Math.min(30, Math.pow(2, reviewCount + 2)); // 4, 8, 16, 30 days max
      break;
    case 'medium':
      daysToAdd = Math.min(7, Math.pow(2, reviewCount)); // 1, 2, 4, 7 days max
      break;
    case 'hard':
      daysToAdd = 1; // Always review tomorrow
      break;
  }
  
  return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
};

export const useCardsStore = create<CardsState>((set, get) => ({
  decks: [],
  currentDeck: null,
  currentCard: null,
  reviewSession: null,

  createDeck: (name: string, description?: string) => {
    const newDeck: Deck = {
      id: require('uuid').v4(),
      name: name.trim(),
      description: description?.trim(),
      cards: [],
      createdAt: new Date(),
      totalReviews: 0,
    };
    set((state) => ({ decks: [...state.decks, newDeck] }));
    get().syncToDatabase();
    return newDeck.id;
  },

  updateDeck: (deckId: string, name: string, description?: string) => {
    set((state) => ({
      decks: state.decks.map(deck =>
        deck.id === deckId
          ? { ...deck, name: name.trim(), description: description?.trim() }
          : deck
      ),
    }));
    get().syncToDatabase();
  },

  deleteDeck: (deckId: string) => {
    set((state) => ({
      decks: state.decks.filter(deck => deck.id !== deckId),
    }));
    get().syncToDatabase();
  },

  addCard: (deckId: string, front: string, back: string) => {
    const newCard: Card = {
      id: require('uuid').v4(),
      front: front.trim(),
      back: back.trim(),
      deckId,
      difficulty: 'medium',
      nextReview: new Date(),
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
    };

    set((state) => ({
      decks: state.decks.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, newCard] }
          : deck
      ),
    }));
    get().syncToDatabase();
  },

  updateCard: (cardId: string, front: string, back: string) => {
    set((state) => ({
      decks: state.decks.map(deck => ({
        ...deck,
        cards: deck.cards.map(card =>
          card.id === cardId
            ? { ...card, front: front.trim(), back: back.trim() }
            : card
        ),
      })),
    }));
    get().syncToDatabase();
  },

  deleteCard: (cardId: string) => {
    set((state) => ({
      decks: state.decks.map(deck => ({
        ...deck,
        cards: deck.cards.filter(card => card.id !== cardId),
      })),
    }));
    get().syncToDatabase();
  },

  startReviewSession: (deckId: string) => {
    const cardsForReview = get().getCardsForReview(deckId);
    if (cardsForReview.length === 0) return;

    // Prioritize cards that need review (hard difficulty or overdue)
    const sortedCards = cardsForReview.sort((a, b) => {
      if (a.difficulty === 'hard' && b.difficulty !== 'hard') return -1;
      if (b.difficulty === 'hard' && a.difficulty !== 'hard') return 1;
      return a.nextReview.getTime() - b.nextReview.getTime();
    });

    set({
      reviewSession: {
        deckId,
        cards: sortedCards,
        currentIndex: 0,
        showAnswer: false,
        completed: 0,
        total: sortedCards.length,
      },
      currentCard: sortedCards[0],
    });
  },

  showCardAnswer: () => {
    set((state) => ({
      reviewSession: state.reviewSession
        ? { ...state.reviewSession, showAnswer: true }
        : null,
    }));
  },

  markCard: (difficulty: 'easy' | 'medium' | 'hard') => {
    const state = get();
    if (!state.reviewSession || !state.currentCard) return;

    const updatedCard = {
      ...state.currentCard,
      difficulty,
      lastReviewed: new Date(),
      nextReview: calculateNextReview(difficulty, state.currentCard.reviewCount),
      reviewCount: state.currentCard.reviewCount + 1,
      correctCount: difficulty !== 'hard' 
        ? state.currentCard.correctCount + 1 
        : state.currentCard.correctCount,
    };

    // Update the card in the decks
    set((state) => ({
      decks: state.decks.map(deck => ({
        ...deck,
        cards: deck.cards.map(card =>
          card.id === updatedCard.id ? updatedCard : card
        ),
        totalReviews: deck.id === state.reviewSession?.deckId 
          ? deck.totalReviews + 1 
          : deck.totalReviews,
        lastStudied: deck.id === state.reviewSession?.deckId 
          ? new Date() 
          : deck.lastStudied,
      })),
    }));

    // Move to next card or end session
    const nextIndex = state.reviewSession.currentIndex + 1;
    if (nextIndex >= state.reviewSession.cards.length) {
      // Session complete
      set((state) => ({
        reviewSession: state.reviewSession
          ? { ...state.reviewSession, completed: state.reviewSession.completed + 1 }
          : null,
      }));
    } else {
      set((state) => ({
        reviewSession: state.reviewSession
          ? {
              ...state.reviewSession,
              currentIndex: nextIndex,
              showAnswer: false,
              completed: state.reviewSession.completed + 1,
            }
          : null,
        currentCard: state.reviewSession?.cards[nextIndex] || null,
      }));
    }
    
    // Sync updated card data to database
    get().syncToDatabase();
  },

  endReviewSession: () => {
    const state = get();
    if (!state.reviewSession) return 0;

    const pointsEarned = Math.floor(state.reviewSession.completed * 10); // 10 points per card
    const bonusPoints = state.reviewSession.completed === state.reviewSession.total ? 50 : 0; // Bonus for completing full session
    const totalPoints = pointsEarned + bonusPoints;

    set({
      reviewSession: null,
      currentCard: null,
    });

    return totalPoints;
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      
      // Sync each deck
      for (const deck of state.decks) {
        const { error: deckError } = await supabase
          .from('user_decks')
          .upsert({
            id: deck.id,
            user_id: user.id,
            name: deck.name,
            description: deck.description || null,
            total_reviews: deck.totalReviews,
            last_studied: deck.lastStudied?.toISOString() || null,
          });
        
        if (deckError) {
          console.error('Error syncing deck:', deck.id, deckError);
        }

        // Sync each card in the deck
        for (const card of deck.cards) {
          const { error: cardError } = await supabase
            .from('user_cards')
            .upsert({
              id: card.id,
              deck_id: card.deckId,
              front: card.front,
              back: card.back,
              difficulty: card.difficulty,
              last_reviewed: card.lastReviewed?.toISOString() || null,
              next_review: card.nextReview.toISOString(),
              review_count: card.reviewCount,
              correct_count: card.correctCount,
            });
          
          if (cardError) {
            console.error('Error syncing card:', card.id, cardError);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing cards data:', error);
    }
  },

  loadDecks: (userDecks: any[]) => {
    const decks: Deck[] = userDecks.map(userDeck => ({
      id: userDeck.id,
      name: userDeck.name,
      description: userDeck.description,
      cards: userDeck.user_cards ? userDeck.user_cards.map((userCard: any) => ({
        id: userCard.id,
        front: userCard.front,
        back: userCard.back,
        deckId: userCard.deck_id,
        difficulty: userCard.difficulty,
        lastReviewed: userCard.last_reviewed ? new Date(userCard.last_reviewed) : undefined,
        nextReview: new Date(userCard.next_review),
        reviewCount: userCard.review_count,
        correctCount: userCard.correct_count,
        createdAt: new Date(userCard.created_at),
      })) : [],
      createdAt: new Date(userDeck.created_at),
      lastStudied: userDeck.last_studied ? new Date(userDeck.last_studied) : undefined,
      totalReviews: userDeck.total_reviews,
    }));
    set({ decks });
  },

  getDeckById: (deckId: string) => {
    return get().decks.find(deck => deck.id === deckId);
  },

  getCardsForReview: (deckId: string) => {
    const deck = get().getDeckById(deckId);
    if (!deck) return [];

    const now = new Date();
    return deck.cards.filter(card => card.nextReview <= now);
  },

  getDeckStats: (deckId: string) => {
    const deck = get().getDeckById(deckId);
    if (!deck) return { total: 0, dueForReview: 0, mastered: 0 };

    const now = new Date();
    const dueForReview = deck.cards.filter(card => card.nextReview <= now).length;
    const mastered = deck.cards.filter(card => 
      card.difficulty === 'easy' && card.reviewCount >= 3
    ).length;

    return {
      total: deck.cards.length,
      dueForReview,
      mastered,
    };
  },
}));