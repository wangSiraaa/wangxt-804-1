export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatTimeRange = (start: Date | string, end: Date | string): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const getStartOfDay = (dateStr: string): Date => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (dateStr: string): Date => {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return formatDate(d1) === formatDate(d2);
};

export const getDayHours = (): number[] => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const calculateDurationMinutes = (start: string, end: string): number => {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / (1000 * 60));
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成'
  };
  return labels[status] || status;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    supervisor: '维修主管',
    technician: '技师',
    reception: '前台客服'
  };
  return labels[role] || role;
};
