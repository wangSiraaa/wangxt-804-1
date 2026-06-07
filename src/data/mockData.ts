import type { User, Workstation, Vehicle, Assignment } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user_supervisor',
    username: 'supervisor',
    password: '123456',
    role: 'supervisor',
    name: '张主管'
  },
  {
    id: 'user_tech1',
    username: 'tech1',
    password: '123456',
    role: 'technician',
    name: '李技师'
  },
  {
    id: 'user_tech2',
    username: 'tech2',
    password: '123456',
    role: 'technician',
    name: '王技师'
  },
  {
    id: 'user_tech3',
    username: 'tech3',
    password: '123456',
    role: 'technician',
    name: '赵技师'
  },
  {
    id: 'user_reception',
    username: 'reception',
    password: '123456',
    role: 'reception',
    name: '陈前台'
  }
];

export const mockWorkstations: Workstation[] = [
  { id: 'ws_001', code: 'W01', name: '机修工位1', type: '机修' },
  { id: 'ws_002', code: 'W02', name: '机修工位2', type: '机修' },
  { id: 'ws_003', code: 'W03', name: '钣金工位1', type: '钣金' },
  { id: 'ws_004', code: 'W04', name: '喷漆工位1', type: '喷漆' },
  { id: 'ws_005', code: 'W05', name: '快保工位1', type: '快保' },
  { id: 'ws_006', code: 'W06', name: '快保工位2', type: '快保' }
];

export const mockVehicles: Vehicle[] = [
  { id: 'v_001', plateNumber: '京A12345', brand: '丰田', model: '凯美瑞', owner: '刘先生', phone: '13800138001' },
  { id: 'v_002', plateNumber: '京B67890', brand: '大众', model: '迈腾', owner: '周女士', phone: '13800138002' },
  { id: 'v_003', plateNumber: '京C11111', brand: '奔驰', model: 'C200L', owner: '吴先生', phone: '13800138003' },
  { id: 'v_004', plateNumber: '京D22222', brand: '宝马', model: '325Li', owner: '郑女士', phone: '13800138004' },
  { id: 'v_005', plateNumber: '京E33333', brand: '奥迪', model: 'A4L', owner: '孙先生', phone: '13800138005' },
  { id: 'v_006', plateNumber: '京F44444', brand: '本田', model: '雅阁', owner: '马女士', phone: '13800138006' }
];

const getTodayStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getMockAssignments = (): Assignment[] => {
  const today = getTodayStr();
  return [
    {
      id: 'assign_001',
      workstationId: 'ws_001',
      technicianId: 'user_tech1',
      vehicleId: 'v_001',
      startTime: `${today}T09:00:00`,
      endTime: `${today}T11:00:00`,
      status: 'in_progress',
      description: '常规保养+更换机油',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'assign_002',
      workstationId: 'ws_002',
      technicianId: 'user_tech2',
      vehicleId: 'v_002',
      startTime: `${today}T08:30:00`,
      endTime: `${today}T10:30:00`,
      status: 'completed',
      description: '发动机检修',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'assign_003',
      workstationId: 'ws_003',
      technicianId: 'user_tech3',
      vehicleId: 'v_003',
      startTime: `${today}T10:00:00`,
      endTime: `${today}T12:00:00`,
      status: 'pending',
      description: '车身钣金修复',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'assign_004',
      workstationId: 'ws_001',
      technicianId: 'user_tech1',
      vehicleId: 'v_004',
      startTime: `${today}T13:00:00`,
      endTime: `${today}T15:00:00`,
      status: 'pending',
      description: '变速箱维修',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'assign_005',
      workstationId: 'ws_005',
      technicianId: 'user_tech2',
      vehicleId: 'v_005',
      startTime: `${today}T14:00:00`,
      endTime: `${today}T15:30:00`,
      status: 'pending',
      description: '快速保养',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'assign_006',
      workstationId: 'ws_004',
      technicianId: 'user_tech3',
      vehicleId: 'v_006',
      startTime: `${today}T13:30:00`,
      endTime: `${today}T17:00:00`,
      status: 'pending',
      description: '全车喷漆',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};
