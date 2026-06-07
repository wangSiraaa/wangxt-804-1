content = '''import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkstationStore } from "@/store/useWorkstationStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getRoleLabel } from "@/utils/dateUtils";

const Dashboard = () => {
  const currentUser = useAuthStore(state => state.currentUser);
  const users = useAuthStore(state => state.users);
  const initData = useWorkstationStore(state => state.initData);
  const workstations = useWorkstationStore(state => state.workstations);
  const assignments = useWorkstationStore(state => state.assignments);
  const technicians = useWorkstationStore(state => state.technicians);
  const { canCreateAssignment, canExport } = useRoleAccess();

  useEffect(() => {
    initData(users);
  }, [initData, users]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">维修工位占用图</h1>
      <p className="text-slate-500 mb-6">当前角色: {getRoleLabel(currentUser?.role)} | {currentUser?.name}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">工位总数</p>
          <p className="text-2xl font-bold text-blue-600">{workstations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">今日分配</p>
          <p className="text-2xl font-bold text-green-600">{assignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">技师人数</p>
          <p className="text-2xl font-bold text-amber-600">{technicians.length}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-semibold text-slate-700 mb-3">权限说明</h2>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>可创建分配: {canCreateAssignment ? "✅ 是" : "❌ 否"}</li>
          <li>可导出数据: {canExport ? "✅ 是" : "❌ 否"}</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
'''

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)

print('Dashboard.tsx written successfully')
