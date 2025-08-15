import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface UserNote {
  id: string;
  title: string;
  content: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  taskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesState {
  notes: Note[];
  searchQuery: string;
  loadNotes: (userNotes: UserNote[]) => void;
  addNote: (title: string, content: string, taskId?: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  searchQuery: '',

  loadNotes: (userNotes: UserNote[]) => {
    const notes: Note[] = userNotes.map(userNote => ({
      id: userNote.id,
      title: userNote.title,
      content: userNote.content,
      taskId: userNote.task_id,
      createdAt: new Date(userNote.created_at),
      updatedAt: new Date(userNote.updated_at),
    }));
    set({ notes });
  },

  addNote: (title: string, content: string, taskId?: string) => {
    const newNote: Note = {
      id: require('uuid').v4(),
      title,
      content,
      taskId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ notes: [newNote, ...state.notes] }));
    get().syncToDatabase();
  },

  updateNote: (id: string, title: string, content: string) => {
    set((state) => ({
      notes: state.notes.map(note =>
        note.id === id
          ? { ...note, title, content, updatedAt: new Date() }
          : note
      ),
    }));
    get().syncToDatabase();
  },

  deleteNote: (id: string) => {
    set((state) => ({
      notes: state.notes.filter(note => note.id !== id),
    }));
    get().syncToDatabase();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    if (!searchQuery) return notes;
    
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      
      // Sync each note
      for (const note of state.notes) {
        const { error } = await supabase
          .from('user_notes')
          .upsert({
            id: note.id,
            user_id: user.id,
            title: note.title,
            content: note.content,
            task_id: note.taskId || null,
            updated_at: note.updatedAt.toISOString(),
          });
        
        if (error) {
          console.error('Error syncing note:', note.id, error);
        }
      }
    } catch (error) {
      console.error('Error syncing notes:', error);
    }
  },
}));