export type UserRole = 'supervisor' | 'technician' | 'reception';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

export interface Workstation {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  owner: string;
  phone: string;
}

export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';

export interface Assignment {
  id: string;
  workstationId: string;
  technicianId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: AssignmentStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictType?: 'technician' | 'workstation';
  message?: string;
  conflictingAssignment?: Assignment;
}

export interface RoleAccess {
  canEditAssignment: boolean;
  canViewAllTechnicians: boolean;
  canExport: boolean;
  canUpdateStatus: boolean;
  canCreateAssignment: boolean;
  canDeleteAssignment: boolean;
}
}
}
