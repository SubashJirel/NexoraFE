import { create } from 'zustand'

/**
 * Global UI state — sidebar, theme, modal management.
 * Not persisted (resets on reload by design).
 */
export const useUIStore = create((set) => ({
  // Sidebar
  sidebarOpen: false,
  sidebarCollapsed: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Active modal
  activeModal: null,
  modalProps: {},

  openModal: (modalId, props = {}) => set({ activeModal: modalId, modalProps: props }),
  closeModal: () => set({ activeModal: null, modalProps: {} }),

  // Global loading (for full-page transitions)
  isPageLoading: false,
  setPageLoading: (v) => set({ isPageLoading: v }),
}))
