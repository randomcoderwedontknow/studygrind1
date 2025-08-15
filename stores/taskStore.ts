import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { UserTask } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description?: string;
  tagId?: string;
  priority: 'low' | 'medium' | 'high';
  timerMode: 'pomodoro' | 'extended' | 'custom';
  customDuration?: number;
  customBreaks?: { minute: number; duration: number }[];
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  sessionTime: number; // in minutes
}

interface TaskState {
  tasks: Task[];
  completedTasks: Task[];
  activeTask: Task | null;
  filterTag: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'sessionTime'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setActiveTask: (task: Task | null) => void;
  updateTaskTime: (id: string, minutes: number) => void;
  setFilterTag: (tagId: string | null) => void;
  getFilteredTasks: () => Task[];
  loadTasks: (tasks: UserTask[]) => void;
  syncToDatabase: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  completedTasks: [],
  activeTask: null,
  filterTag: null,

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
      completed: false,
      sessionTime: 0,
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    get().syncToDatabase();
  },

  toggleTask: (id: string) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return state;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined,
      };

      // Update achievements when task is completed
      if (!task.completed && updatedTask.completed) {
      }
      const updatedTasks = state.tasks.filter(t => t.id !== id);
      const updatedCompletedTasks = updatedTask.completed 
        ? [...state.completedTasks, updatedTask]
        : state.completedTasks.filter(t => t.id !== id);

      return {
        tasks: updatedTask.completed ? updatedTasks : [...updatedTasks, updatedTask],
        completedTasks: updatedCompletedTasks,
      };
    });
    get().syncToDatabase();
  },

  deleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id),
      completedTasks: state.completedTasks.filter(t => t.id !== id),
    }));
    get().syncToDatabase();
  },

  setActiveTask: (task: Task | null) => set({ activeTask: task }),

  updateTaskTime: (id: string, minutes: number) => {
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, sessionTime: task.sessionTime + minutes } : task
      ),
    }));
    
    // Update tag statistics
    const task = get().tasks.find(t => t.id === id);
    if (task?.tagId) {
      const { updateTagStats } = require('./tagStore').useTagStore.getState();
      updateTagStats(task.tagId, minutes);
    }
  },

  setFilterTag: (tagId: string | null) => set({ filterTag: tagId }),

  getFilteredTasks: () => {
    const { tasks, filterTag } = get();
    if (!filterTag) return tasks;
    return tasks.filter(task => task.tagId === filterTag);
  },

  loadTasks: (tasks: UserTask[]) => {
    const activeTasks: Task[] = [];
    const completedTasks: Task[] = [];

    tasks.forEach(task => {
      const taskData: Task = {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        tagId: task.tag_id || undefined,
        priority: task.priority,
        timerMode: task.timer_mode,
        customDuration: task.custom_duration || undefined,
        completed: task.completed,
        createdAt: new Date(task.created_at),
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        sessionTime: task.session_time,
      };

      if (task.completed) {
        completedTasks.push(taskData);
      } else {
        activeTasks.push(taskData);
      }
    });

    set({ tasks: activeTasks, completedTasks });
  },

  syncToDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === 'owner') return;

      const state = get();
      const allTasks = [...state.tasks, ...state.completedTasks];

      // Sync each task
      for (const task of allTasks) {
        const { error } = await supabase
          .from('user_tasks')
          .upsert({
            id: task.id,
            user_id: user.id,
            title: task.title,
            description: task.description || null,
            tag_id: task.tagId || null,
            priority: task.priority,
            timer_mode: task.timerMode,
            custom_duration: task.customDuration || null,
            completed: task.completed,
            session_time: task.sessionTime,
            completed_at: task.completedAt?.toISOString() || null,
          });
        
        if (error) {
          console.error('Error syncing task:', task.id, error);
        }
      }
    } catch (error) {
      console.error('Error syncing tasks:', error);
    }
  },
}));