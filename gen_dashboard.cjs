
const fs = require("fs");

const code = `import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkstationStore } from "@/store/useWorkstationStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getRoleLabel, formatDate, formatTime, getStatusLabel } from "@/utils/dateUtils";
import { exportToCSV, printSchedule } from "@/utils/exportUtils";

export default function Dashboard() {
  const currentUser = useAuthStore(s => s.currentUser);
  const logout = useAuthStore(s => s.logout);
  const users = useAuthStore(s => s.users);
  const initData = useWorkstationStore(s => s.initData);
  const workstations = useWorkstationStore(s => s.workstations);
  const assignments = useWorkstationStore(s => s.assignments);
  const technicians = useWorkstationStore(s => s.technicians);
  const vehicles = useWorkstationStore(s => s.vehicles);
  const addAssignment = useWorkstationStore(s => s.addAssignment);
  const { canCreateAssignment, canExport, canViewAllTechnicians, canUpdateStatus } = useRoleAccess();

  const [conflictMessage, setConflictMessage] = useState<string>("");
  const [conflictType, setConflictType] = useState<"success" | "error" | "">("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    initData(users);
  }, [initData, users]);

  const filteredAssignments = useMemo(() => {
    let result = [...assignments];
    
    if (!canViewAllTechnicians && currentUser) {
      result = result.filter(a => a.technicianId === currentUser.id);
    }
    
    result = result.filter(a => a.startTime.startsWith(selectedDate));
    
    return result;
  }, [assignments, canViewAllTechnicians, currentUser, selectedDate]);

  const getTechnicianName = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? tech.name : "未知技师";
  };

  const getWorkstationName = (wsId: string) => {
    const ws = workstations.find(w => w.id === wsId);
    return ws ? ws.name : "未知工位";
  };

  const getVehicleInfo = (vhId: string) => {
    const vh = vehicles.find(v => v.id === vhId);
    return vh ? vh.plateNumber + " " + vh.model : "未知车辆";
  };

  const handleTestConflict = () => {
    if (technicians.length === 0 || workstations.length === 0) {
      setConflictMessage("暂无技师或工位数据");
      setConflictType("error");
      setTimeout(() => setConflictMessage(""), 5000);
      return;
    }

    const tech = technicians[0];
    const ws1 = workstations[0];
    const ws2 = workstations[1] || workstations[0];
    const today = new Date().toISOString().split("T")[0];

    const result1 = addAssignment({
      workstationId: ws1.id,
      technicianId: tech.id,
      vehicleId: vehicles[0]?.id || "",
      startTime: today + "T09:00:00",
      endTime: today + "T11:00:00",
      status: "IN_PROGRESS",
      description: "冲突测试任务1",
    });

    if (result1.conflict) {
      setConflictMessage("步骤1失败: " + result1.conflict.message);
      setConflictType("error");
      setTimeout(() => setConflictMessage(""), 5000);
      return;
    }

    const result2 = addAssignment({
      workstationId: ws2.id,
      technicianId: tech.id,
      vehicleId: vehicles[1]?.id || "",
      startTime: today + "T10:00:00",
      endTime: today + "T12:00:00",
      status: "PENDING",
      description: "冲突测试任务2",
    });

    if (result2.conflict) {
      setConflictMessage("冲突检测生效: " + result2.conflict.message);
      setConflictType("success");
    } else {
      setConflictMessage("冲突检测未生效，未检测到预期冲突");
      setConflictType("error");
    }

    setTimeout(() => setConflictMessage(""), 8000);
  };

  const handleExport = () => {
    exportToCSV({
      assignments: filteredAssignments,
      technicians,
      workstations,
      vehicles,
    });
  };

  const handlePrint = () => {
    printSchedule();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">维修工位占用图</h1>
          <p className="text-slate-500 mt-1">
            当前角色: {getRoleLabel(currentUser?.role)} | {currentUser?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {conflictMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          conflictType === "success" 
            ? "bg-green-50 border border-green-200 text-green-700" 
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {conflictType === "success" ? "✅ " : "❌ "}
          {conflictMessage}
        </div>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
          <label className="text-sm text-slate-600">日期:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-0 focus:ring-0 text-sm"
          />
        </div>

        {canCreateAssignment && (
          <button
            onClick={handleTestConflict}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            🧪 测试冲突
          </button>
        )}

        {canExport && (
          <>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              📥 导出CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              🖨️ 打印
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">工位总数</p>
          <p className="text-2xl font-bold text-blue-600">{workstations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">今日分配</p>
          <p className="text-2xl font-bold text-green-600">{filteredAssignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">技师人数</p>
          <p className="text-2xl font-bold text-amber-600">{canViewAllTechnicians ? technicians.length : 1}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">工位分配明细</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">工位</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">技师</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">车辆</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">任务描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    暂无分配记录
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-700">
                      {getWorkstationName(assignment.workstationId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {getTechnicianName(assignment.technicianId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {getVehicleInfo(assignment.vehicleId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === "IN_PROGRESS" 
                          ? "bg-green-100 text-green-700"
                          : assignment.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {getStatusLabel(assignment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {assignment.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-semibold text-slate-700 mb-3">角色权限说明</h2>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>👁️ 查看所有技师分配: {canViewAllTechnicians ? "是" : "否（仅查看自己）"}</li>
          <li>➕ 可创建分配: {canCreateAssignment ? "是" : "否"}</li>
          <li>📥 可导出数据: {canExport ? "是" : "否"}</li>
          <li>🔄 可更新状态: {canUpdateStatus ? "是" : "否"}</li>
        </ul>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/pages/Dashboard.tsx", code);
console.log("Dashboard.tsx created with", code.split("\n").length, "lines");
