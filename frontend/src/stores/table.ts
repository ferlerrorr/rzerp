import { create } from "zustand";

interface TableState {
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  resetPagination: () => void;
}

export const useTableStore = create<TableState>((set) => ({
  currentPage: 1,
  itemsPerPage: 5,

  setCurrentPage: (page) => set({ currentPage: page }),

  setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }),

  resetPagination: () => set({ currentPage: 1 }),
}));

