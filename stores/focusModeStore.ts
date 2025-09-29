import { create } from 'zustand';
import { useFocusLockStore } from './focusLockStore';

interface FocusModeState {
  isFocusModeActive: boolean;
  setFocusMode: (active: boolean) => void;
}

export const useFocusModeStore = create<FocusModeState>((set) => ({
  isFocusModeActive: false,

  setFocusMode: (active: boolean) => {
    set({ isFocusModeActive: active });
    
    // Also update focus lock state when focus mode changes
    const { isEnabled } = useFocusLockStore.getState();
    if (isEnabled) {
      // Focus lock will handle the page blocking
    }
  },
}));