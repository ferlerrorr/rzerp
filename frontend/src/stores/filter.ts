import { create } from "zustand";

interface FilterState {
  selectedFilters: Record<string, string[]>;
  isOpen: boolean;
  setSelectedFilters: (filters: Record<string, string[]>) => void;
  setFilter: (groupKey: string, value: string) => void;
  clearFilter: (groupKey: string) => void;
  clearAllFilters: () => void;
  setIsOpen: (open: boolean) => void;
  toggleFilter: (groupKey: string, value: string) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  selectedFilters: {},
  isOpen: false,

  setSelectedFilters: (filters) => set({ selectedFilters: filters }),

  setFilter: (groupKey, value) => {
    const current = get().selectedFilters[groupKey] || [];
    if (!current.includes(value)) {
      set({
        selectedFilters: {
          ...get().selectedFilters,
          [groupKey]: [...current, value],
        },
      });
    }
  },

  toggleFilter: (groupKey, value) => {
    const current = get().selectedFilters[groupKey] || [];
    const newGroup = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    set({
      selectedFilters: {
        ...get().selectedFilters,
        [groupKey]: newGroup,
      },
    });
  },

  clearFilter: (groupKey) => {
    set({
      selectedFilters: {
        ...get().selectedFilters,
        [groupKey]: [],
      },
    });
  },

  clearAllFilters: () => set({ selectedFilters: {} }),

  setIsOpen: (open) => set({ isOpen: open }),
}));
