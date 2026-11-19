import { create } from "zustand";

interface SidebarOverlayState {
  /** On tablets the rail opens wide over the page; on desktop this stays false. */
  opened: boolean;
  setOpened: (opened: boolean) => void;
  toggle: () => void;
}

// The toggle lives in the header and the panel in the sidebar, so the state can't sit in either
export const useSidebarOverlayStore = create<SidebarOverlayState>()((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
  toggle: () => set((state) => ({ opened: !state.opened })),
}));
