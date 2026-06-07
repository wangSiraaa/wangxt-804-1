import { create } from "zustand";
import type { AssignmentStatus } from "@/types";
import { getTodayDate } from "@/utils/dateUtils";

interface FilterState {
  selectedDate: string;
  selectedWorkstations: string[];
  selectedTechnicians: string[];
  statusFilter: AssignmentStatus[];
  sortBy: "time" | "workstation" | "technician";
  sortOrder: "asc" | "desc";
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  toggleWorkstation: (id: string) => void;
  toggleTechnician: (id: string) => void;
  toggleStatus: (status: AssignmentStatus) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  selectedDate: getTodayDate(),
  selectedWorkstations: [],
  selectedTechnicians: [],
  statusFilter: [],
  sortBy: "time",
  sortOrder: "asc",

  setFilter: (key, value) => set({ [key]: value } as Partial<FilterState>),  

  resetFilters: () => set({
    selectedWorkstations: [],
    selectedTechnicians: [],
    statusFilter: [],
    sortBy: "time",
    sortOrder: "asc"
  }),

  toggleWorkstation: (id) => {
    const { selectedWorkstations } = get();
    set({
      selectedWorkstations: selectedWorkstations.includes(id)
        ? selectedWorkstations.filter(w => w !== id)
        : [...selectedWorkstations, id]
    });
  },

  toggleTechnician: (id) => {
    const { selectedTechnicians } = get();
    set({
      selectedTechnicians: selectedTechnicians.includes(id)
        ? selectedTechnicians.filter(t => t !== id)
        : [...selectedTechnicians, id]
    });
  },

  toggleStatus: (status) => {
    const { statusFilter } = get();
    set({
      statusFilter: statusFilter.includes(status)
        ? statusFilter.filter(s => s !== status)
        : [...statusFilter, status]
    });
  }
}));
