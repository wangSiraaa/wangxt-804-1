import { useAuthStore } from "@/store/useAuthStore";
import type { RoleAccess } from "@/types";

export const useRoleAccess = (): RoleAccess => {
  const currentUser = useAuthStore(state => state.currentUser);
  const role = currentUser?.role;

  return {
    canEditAssignment: role === "supervisor",
    canViewAllTechnicians: role !== "technician",
    canExport: role === "supervisor" || role === "reception",
    canUpdateStatus: role === "technician" || role === "supervisor",
    canCreateAssignment: role === "supervisor" || role === "reception",
    canDeleteAssignment: role === "supervisor"
  };
};
