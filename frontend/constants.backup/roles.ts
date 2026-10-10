import { UserRole } from '../types/auth';
import { ROUTES } from './routes';

export const ROLES = {
  ATHLETE: 'athlete' as const,
  SPORTS_COMPLEX_ADMIN: 'sportsComplex_admin' as const,
  SUPER_ADMIN: 'super_admin' as const,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  athlete: 'ورزشکار',
  sportsComplex_admin: 'مدیر باشگاه',
  super_admin: 'مدیر سیستم',
};

// Using constant ROUTES instead of hardcoding
export const ROLE_ROUTES: Record<UserRole, string> = {
  athlete: ROUTES.HOME, // "/"
  sportsComplex_admin: ROUTES.DASHBOARD_SELLER, // "/dashboard/seller"
  super_admin: ROUTES.DASHBOARD_ADMIN, // "/dashboard/admin"
};

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  athlete: ROUTES.HOME,
  sportsComplex_admin: ROUTES.DASHBOARD_SELLER,
  super_admin: ROUTES.DASHBOARD_ADMIN,
};

export const DEFAULT_ROUTE = ROUTES.HOME;
export const LOGIN_ROUTE = ROUTES.LOGIN;
export const DASHBOARD_BASE = ROUTES.DASHBOARD;
