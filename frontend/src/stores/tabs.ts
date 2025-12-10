import { create } from "zustand";

interface TabsState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resetTabs: () => void;
}

export const useTabsStore = create<TabsState>((set) => ({
  activeTab: "",

  setActiveTab: (tab) => set({ activeTab: tab }),

  resetTabs: () => set({ activeTab: "" }),
}));

