const fs = require('fs');
const path = require('path');

const files = {
  'src/store/useWorkstationStore.ts': `import { create } from 'zustand';
import type { Assignment, Workstation, Vehicle, User, ConflictResult } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { checkAllConflicts } from '@/utils/conflictUtils';
import { mockWorkstations, mockVehicles, getMockAssignments } from '@/data/mockData';

interface WorkstationState {
  workstations: Workstation[];
  vehicles: Vehicle[];
  technicians: User[];
  assignments: Assignment[];
  
  initData: (users: User[]) => void;
  
  addAssignment: (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; conflict?: ConflictResult };
  updateAssignment: (id: string, data: Partial<Assignment>) => { success: boolean; conflict?: ConflictResult };
  deleteAssignment: (id: string) => void;
  
  checkConflict: (technicianId: string, workstationId: string, startTime: string, endTime: string, excludeId?: string) => ConflictResult;
  getAssignmentsByDate: (date: string) => Assignment[];
  getAssignmentsByTechnician: (techId: string) => Assignment[];
  getAssignmentById: (id: string) => Assignment | undefined;
}

export const useWorkstationStore = create<WorkstationState>((set, get) => ({
  workstations: storage.get<Workstation[]>('workstations', []),
  vehicles: storage.get<Vehicle[]>('vehicles', []),
  technicians: [],
  assignments: storage.get<Assignment[]>('assignments', []),

  initData: (users: User[]) => {
    const technicians = users.filter(u => u.role === 'technician');
    
    const existingWS = storage.get<Workstation[]>('workstations', []);
    if (existingWS.length === 0) {
      storage.set('workstations', mockWorkstations);
      set({ workstations: mockWorkstations });
    } else {
      set({ workstations: existingWS });
    }

    const existingV = storage.get<Vehicle[]>('vehicles', []);
    if (existingV.length === 0) {
      storage.set('vehicles', mockVehicles);
      set({ vehicles: mockVehicles });
    } else {
      set({ vehicles: existingV });
    }

    const existingA = storage.get<Assignment[]>('assignments', []);
    if (existingA.length === 0) {
      const mockA = getMockAssignments();
      storage.set('assignments', mockA);
      set({ assignments: mockA, technicians });
    } else {
      set({ assignments: existingA, technicians });
    }

    set({ technicians });
  },

  addAssignment: (data) => {
    const { assignments } = get();
    const conflict = checkAllConflicts(
      assignments,
      data.technicianId,
      data.workstationId,
      data.startTime,
      data.endTime
    );

    if (conflict.hasConflict) {
      return { success: false, conflict };
    }

    const now = new Date().toISOString();
    const newAssignment: Assignment = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };

    const newAssignments = [...assignments, newAssignment];
    storage.set('assignments', newAssignments);
    set({ assignments: newAssignments });
    return { success: true };
  },

  updateAssignment: (id, data) => {
    const { assignments } = get();
    const existing = assignments.find(a => a.id === id);
    if (!existing) return { success: false };

    const techId = data.technicianId || existing.technicianId;
    const wsId = data.workstationId || existing.workstationId;
    const start = data.startTime || existing.startTime;
    const end = data.endTime || existing.endTime;

    const conflict = checkAllConflicts(assignments, techId, wsId, start, end, id);
    if (conflict.hasConflict) {
      return { success: false, conflict };
    }

    const newAssignments = assignments.map(a =>
      a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
    );
    storage.set('assignments', newAssignments);
    set({ assignments: newAssignments });
    return { success: true };
  },

  deleteAssignment: (id) => {
    const newAssignments = get().assignments.filter(a => a.id !== id);
    storage.set('assignments', newAssignments);
    set({ assignments: newAssignments });
  },

  checkConflict: (technicianId, workstationId, startTime, endTime, excludeId) => {
    return checkAllConflicts(get().assignments, technicianId, workstationId, startTime, endTime, excludeId);
  },

  getAssignmentsByDate: (date) => {
    return get().assignments.filter(a => a.startTime.startsWith(date));
  },

  getAssignmentsByTechnician: (techId) => {
    return get().assignments.filter(a => a.technicianId === techId);
  },

  getAssignmentById: (id) => {
    return get().assignments.find(a => a.id === id);
  }
}));
`,

  'src/store/useFilterStore.ts': `import { create } from 'zustand';
import type { AssignmentStatus } from '@/types';
import { getTodayDate } from '@/utils/dateUtils';

interface FilterState {
  selectedDate: string;
  selectedWorkstations: string[];
  selectedTechnicians: string[];
  statusFilter: AssignmentStatus[];
  sortBy: 'time' | 'workstation' | 'technician';
  sortOrder: 'asc' | 'desc';
  
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
  sortBy: 'time',
  sortOrder: 'asc',

  setFilter: (key, value) => {
    set({ [key]: value } as Partial<FilterState>);
  },

  resetFilters: () => {
    set({
      selectedWorkstations: [],
      selectedTechnicians: [],
      statusFilter: [],
      sortBy: 'time',
      sortOrder: 'asc'
    });
  },

  toggleWorkstation: (id) => {
    const { selectedWorkstations } = get();
    if (selectedWorkstations.includes(id)) {
      set({ selectedWorkstations: selectedWorkstations.filter(w => w !== id) });
    } else {
      set({ selectedWorkstations: [...selectedWorkstations, id] });
    }
  },

  toggleTechnician: (id) => {
    const { selectedTechnicians } = get();
    if (selectedTechnicians.includes(id)) {
      set({ selectedTechnicians: selectedTechnicians.filter(t => t !== id) });
    } else {
      set({ selectedTechnicians: [...selectedTechnicians, id] });
    }
  },

  toggleStatus: (status) => {
    const { statusFilter } = get();
    if (statusFilter.includes(status)) {
      set({ statusFilter: statusFilter.filter(s => s !== status) });
    } else {
      set({ statusFilter: [...statusFilter, status] });
    }
  }
}));
`,

  'src/hooks/useRoleAccess.ts': `import { useAuthStore } from '@/store/useAuthStore';
import type { RoleAccess } from '@/types';

export const useRoleAccess = (): RoleAccess => {
  const currentUser = useAuthStore(state => state.currentUser);
  const role = currentUser?.role;

  return {
    canEditAssignment: role === 'supervisor',
    canViewAllTechnicians: role !== 'technician',
    canExport: role === 'supervisor' || role === 'reception',
    canUpdateStatus: role === 'technician' || role === 'supervisor',
    canCreateAssignment: role === 'supervisor' || role === 'reception',
    canDeleteAssignment: role === 'supervisor'
  };
};
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`Created: ${filePath}`);
}

console.log('All store and hook files created successfully!');
