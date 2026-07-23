import { UserRole } from "./auth";

export type Permission =
  | "view_dashboard"
  | "manage_athletes"
  | "manage_complex"
  | "manage_bookings"
  | "view_reports"
  | "manage_users"
  | "manage_system"
  | "view_analytics";

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

export const ROLE_PERMISSIONS: RolePermissions = {
  athlete: ["view_dashboard", "manage_bookings"],
  sportsComplex_admin: [
    "view_dashboard",
    "manage_athletes",
    "manage_complex",
    "manage_bookings",
    "view_reports",
  ],
  super_admin: [
    "view_dashboard",
    "manage_athletes",
    "manage_complex",
    "manage_bookings",
    "view_reports",
    "manage_users",
    "manage_system",
    "view_analytics",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}