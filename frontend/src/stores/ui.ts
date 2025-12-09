import { create } from "zustand";

interface UIState {
  searchOpen: boolean;
  searchQuery: string;
  profileDropdownOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setProfileDropdownOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  searchQuery: "",
  profileDropdownOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setProfileDropdownOpen: (open) => set({ profileDropdownOpen: open }),
}));
