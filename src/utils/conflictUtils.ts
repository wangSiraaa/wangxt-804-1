import type { Assignment, ConflictResult } from '@/types';
import { formatTimeRange } from './dateUtils';

export const checkTechnicianConflict = (
  assignments: Assignment[],
  technicianId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): ConflictResult => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (start >= end) {
    return {
      hasConflict: true,
      conflictType: 'technician',
      message: '结束时间必须晚于开始时间'
    };
  }

  const techAssignments = assignments.filter(
    a => a.technicianId === technicianId && a.id !== excludeId
  );

  for (const assignment of techAssignments) {
    const aStart = new Date(assignment.startTime).getTime();
    const aEnd = new Date(assignment.endTime).getTime();
    const hasOverlap = start < aEnd && end > aStart;

    if (hasOverlap) {
      return {
        hasConflict: true,
        conflictType: 'technician',
        message: `该技师在 ${formatTimeRange(assignment.startTime, assignment.endTime)} 已有分配`,
        conflictingAssignment: assignment
      };
    }
  }

  return { hasConflict: false };
};

export const checkWorkstationConflict = (
  assignments: Assignment[],
  workstationId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): ConflictResult => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  const wsAssignments = assignments.filter(
    a => a.workstationId === workstationId && a.id !== excludeId
  );

  for (const assignment of wsAssignments) {
    const aStart = new Date(assignment.startTime).getTime();
    const aEnd = new Date(assignment.endTime).getTime();
    const hasOverlap = start < aEnd && end > aStart;

    if (hasOverlap) {
      return {
        hasConflict: true,
        conflictType: 'workstation',
        message: `该工位在 ${formatTimeRange(assignment.startTime, assignment.endTime)} 已有分配`,
        conflictingAssignment: assignment
      };
    }
  }

  return { hasConflict: false };
};

export const checkAllConflicts = (
  assignments: Assignment[],
  technicianId: string,
  workstationId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): ConflictResult => {
  const techConflict = checkTechnicianConflict(assignments, technicianId, startTime, endTime, excludeId);
  if (techConflict.hasConflict) return techConflict;

  const wsConflict = checkWorkstationConflict(assignments, workstationId, startTime, endTime, excludeId);
  if (wsConflict.hasConflict) return wsConflict;

  return { hasConflict: false };
};
