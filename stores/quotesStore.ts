import { create } from 'zustand';

const quotes = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Education is the most powerful weapon which you can use to change the world.",
  "Learning never exhausts the mind.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Study hard, for the well is deep, and our brains are shallow.",
  "The more that you read, the more things you will know.",
  "Knowledge is power. Information is liberating.",
  "An investment in knowledge pays the best interest.",
  "The capacity to learn is a gift; the ability to learn is a skill.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "Tell me and I forget, teach me and I may remember, involve me and I learn.",
  "The only source of knowledge is experience.",
  "Develop a passion for learning. If you do, you will never cease to grow.",
  "Learning is a treasure that will follow its owner everywhere.",
  "The mind is not a vessel to be filled, but a fire to be kindled.",
  "What we learn with pleasure we never forget.",
  "Study without desire spoils the memory.",
  "The roots of education are bitter, but the fruit is sweet.",
  "A little learning is a dangerous thing; drink deep, or taste not.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "You are never too old to set another goal or to dream a new dream.",
  "The only impossible journey is the one you never begin.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The way to get started is to quit talking and begin doing.",
  "Don't be afraid to give up the good to go for the great.",
  "Innovation distinguishes between a leader and a follower.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It is during our darkest moments that we must focus to see the light.",
  "Whoever is happy will make others happy too.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "You miss 100% of the shots you don't take.",
  "Whether you think you can or you think you can't, you're right.",
  "The two most important days in your life are the day you are born and the day you find out why.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
];

interface QuotesState {
  currentQuote: string;
  lastUpdated: Date;
  getNewQuote: () => void;
  getTodaysQuote: () => string;
}

export const useQuotesStore = create<QuotesState>((set, get) => ({
  currentQuote: quotes[0],
  lastUpdated: new Date(),

  getNewQuote: () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    set({ currentQuote: randomQuote, lastUpdated: new Date() });
  },

  getTodaysQuote: () => {
    const today = new Date().toDateString();
    const lastUpdate = get().lastUpdated.toDateString();
    
    if (today !== lastUpdate) {
      // New day, get a new quote based on the day
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const todaysQuote = quotes[dayOfYear % quotes.length];
      set({ currentQuote: todaysQuote, lastUpdated: new Date() });
      return todaysQuote;
    }
    
    return get().currentQuote;
  },
}));