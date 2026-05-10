// 전역 UI 상태 — 사이드바 열림 여부, 테마(현재 다크 고정 — P02 명세)
import { create } from 'zustand'

type Theme = 'dark'

interface UiState {
  sidebarOpen: boolean
  theme: Theme
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
