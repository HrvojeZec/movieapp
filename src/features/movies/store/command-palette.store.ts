import { create } from "zustand";

interface CommandPaletteState {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Opened from anywhere (Ctrl+K, the navbar), so its state can't live in one component
export const useCommandPaletteStore = create<CommandPaletteState>()((set) => ({
  opened: false,
  open: () => set({ opened: true }),
  close: () => set({ opened: false }),
  toggle: () => set((state) => ({ opened: !state.opened })),
}));
