import { create } from "zustand";
import type { Assignment, Workstation, Vehicle, User, ConflictResult, Annotation } from "@/types";
import { storage, generateId } from "@/utils/storage";
import { checkAllConflicts } from "@/utils/conflictUtils";
import { mockWorkstations, mockVehicles, getMockAssignments } from "@/data/mockData";

interface WorkstationState {
  workstations: Workstation[];
  vehicles: Vehicle[];
  technicians: User[];
  assignments: Assignment[];
  annotations: Annotation[];
  initData: (users: User[]) => void;
  addAssignment: (data: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => { success: boolean; conflict?: ConflictResult };
  updateAssignment: (id: string, data: Partial<Assignment>) => { success: boolean; conflict?: ConflictResult };
  deleteAssignment: (id: string) => void;
  checkConflict: (technicianId: string, workstationId: string, startTime: string, endTime: string, excludeId?: string) => ConflictResult;
  getAssignmentsByDate: (date: string) => Assignment[];
  getAssignmentsByTechnician: (techId: string) => Assignment[];
  getAssignmentById: (id: string) => Assignment | undefined;
  addAnnotation: (data: Omit<Annotation, "id" | "createdAt">) => void;
  getAnnotationsByAssignmentId: (assignmentId: string) => Annotation[];
  deleteAnnotation: (id: string) => void;
}

export const useWorkstationStore = create<WorkstationState>((set, get) => ({
  workstations: storage.get<Workstation[]>("workstations", []),
  vehicles: storage.get<Vehicle[]>("vehicles", []),
  technicians: [],
  assignments: storage.get<Assignment[]>("assignments", []),
  annotations: storage.get<Annotation[]>("annotations", []),

  initData: (users: User[]) => {
    const technicians = users.filter(u => u.role === "technician");
    const existingWS = storage.get<Workstation[]>("workstations", []);
    if (existingWS.length === 0) {
      storage.set("workstations", mockWorkstations);
      set({ workstations: mockWorkstations });
    } else {
      set({ workstations: existingWS });
    }
    const existingV = storage.get<Vehicle[]>("vehicles", []);
    if (existingV.length === 0) {
      storage.set("vehicles", mockVehicles);
      set({ vehicles: mockVehicles });
    } else {
      set({ vehicles: existingV });
    }
    const existingA = storage.get<Assignment[]>("assignments", []);
    if (existingA.length === 0) {
      const mockA = getMockAssignments();
      storage.set("assignments", mockA);
      set({ assignments: mockA, technicians });
    } else {
      set({ assignments: existingA, technicians });
    }
    set({ technicians });
  },

  addAssignment: (data) => {
    const { assignments } = get();
    const conflict = checkAllConflicts(assignments, data.technicianId, data.workstationId, data.startTime, data.endTime);
    if (conflict.hasConflict) {
      return { success: false, conflict };
    }
    const now = new Date().toISOString();
    const newAssignment: Assignment = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const newAssignments = [...assignments, newAssignment];
    storage.set("assignments", newAssignments);
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
    storage.set("assignments", newAssignments);
    set({ assignments: newAssignments });
    return { success: true };
  },

  deleteAssignment: (id) => {
    const newAssignments = get().assignments.filter(a => a.id !== id);
    storage.set("assignments", newAssignments);
    set({ assignments: newAssignments });
  },

  checkConflict: (technicianId, workstationId, startTime, endTime, excludeId) => {
    return checkAllConflicts(get().assignments, technicianId, workstationId, startTime, endTime, excludeId);
  },

  getAssignmentsByDate: (date) => get().assignments.filter(a => a.startTime.startsWith(date)),
  getAssignmentsByTechnician: (techId) => get().assignments.filter(a => a.technicianId === techId),
  getAssignmentById: (id) => get().assignments.find(a => a.id === id),

  addAnnotation: (data) => {
    const { annotations } = get();
    const now = new Date().toISOString();
    const newAnnotation: Annotation = { ...data, id: generateId(), createdAt: now };
    const newAnnotations = [...annotations, newAnnotation];
    storage.set("annotations", newAnnotations);
    set({ annotations: newAnnotations });
  },

  getAnnotationsByAssignmentId: (assignmentId) => {
    return get().annotations
      .filter(a => a.assignmentId === assignmentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  deleteAnnotation: (id) => {
    const newAnnotations = get().annotations.filter(a => a.id !== id);
    storage.set("annotations", newAnnotations);
    set({ annotations: newAnnotations });
  }
}));
