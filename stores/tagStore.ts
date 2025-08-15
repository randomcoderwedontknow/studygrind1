import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  totalTime: number; // in minutes
  sessionCount: number;
}

interface TagState {
  tags: Tag[];
  addTag: (name: string, color: string) => string;
  updateTag: (id: string, name: string, color: string) => void;
  deleteTag: (id: string) => void;
  updateTagStats: (tagId: string, minutes: number) => void;
  getTagById: (id: string) => Tag | undefined;
  getTagStats: () => { tag: Tag; percentage: number }[];
  loadTags: (userTags: any[]) => void;
  syncToDatabase: () => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],

  addTag: (name: string, color: string) => {
    const newTag: Tag = {
      id: uuidv4(),
      name: name.trim(),
      color,
      createdAt: new Date(),
      totalTime: 0,
      sessionCount: 0,
    };
    set((state) => ({ tags: [...state.tags, newTag] }));
    get().syncToDatabase();
    return newTag.id;
  },

  updateTag: (id: string, name: string, color: string) => {
    set((state) => ({
      tags: state.tags.map(tag =>
        tag.id === id ? { ...tag, name: name.trim(), color } : tag
      ),
    }));
    get().syncToDatabase();
  },

  deleteTag: (id: string) => {
    set((state) => ({
      tags: state.tags.filter(tag => tag.id !== id),
    }));
    get().syncToDatabase();
  },

  updateTagStats: (tagId: string, minutes: number) => {
    set((state) => ({
      tags: state.tags.map(tag =>
        tag.id === tagId
          ? {
              ...tag,
              totalTime: tag.totalTime + minutes,
              sessionCount: tag.sessionCount + 1,
            }
          : tag
      ),
    }));
    get().syncToDatabase();
  },

  getTagById: (id: string) => {
    return get().tags.find(tag => tag.id === id);
  },

  getTagStats: () => {
    const tags = get().tags;
    const totalTime = tags.reduce((sum, tag) => sum + tag.totalTime, 0);
    
    return tags
      .filter(tag => tag.totalTime > 0)
      .map(tag => ({
        tag,
        percentage: totalTime > 0 ? (tag.totalTime / totalTime) * 100 : 0,
      }))
      .sort((a, b) => b.tag.totalTime - a.tag.totalTime);
  },

  loadTags: (userTags: any[]) => {
    const tags: Tag[] = userTags.map(userTag => ({
      id: userTag.id,
      name: userTag.name,
      color: userTag.color,
      createdAt: new Date(userTag.created_at),
      totalTime: userTag.total_time || 0,
      sessionCount: userTag.session_count || 0,
    }));
    set({ tags });
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      
      // Sync each tag's statistics
      for (const tag of state.tags) {
        const { error } = await supabase
          .from('user_tags')
          .upsert({
            id: tag.id,
            user_id: user.id,
            name: tag.name,
            color: tag.color,
            total_time: tag.totalTime,
            session_count: tag.sessionCount,
          });
        
        if (error) {
          console.error('Error syncing tag:', tag.id, error);
        }
      }
    } catch (error) {
      console.error('Error syncing tag stats:', error);
    }
  },
}));