import type { Assignment, User, Workstation, Vehicle } from '@/types';
import { formatDateTime, getStatusLabel } from './dateUtils';

interface ExportData {
  assignments: Assignment[];
  technicians: User[];
  workstations: Workstation[];
  vehicles: Vehicle[];
}

export const exportToCSV = (data: ExportData): void => {
  const { assignments, technicians, workstations, vehicles } = data;

  const headers = ['工位编号', '工位名称', '技师', '车牌号', '品牌车型', '开始时间', '结束时间', '状态', '维修项目', '车主', '联系电话'];

  const rows = assignments.map(assignment => {
    const ws = workstations.find(w => w.id === assignment.workstationId);
    const tech = technicians.find(t => t.id === assignment.technicianId);
    const vehicle = vehicles.find(v => v.id === assignment.vehicleId);

    return [
      ws?.code || '',
      ws?.name || '',
      tech?.name || '',
      vehicle?.plateNumber || '',
      vehicle ? `${vehicle.brand} ${vehicle.model}` : '',
      formatDateTime(assignment.startTime),
      formatDateTime(assignment.endTime),
      getStatusLabel(assignment.status),
      assignment.description,
      vehicle?.owner || '',
      vehicle?.phone || ''
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`);
  });

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `工位安排_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printSchedule = (): void => {
  window.print();
};
