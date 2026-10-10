export const ROUTES = {
  // Public paths
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  OTP: '/auth/otp',
  PHONE: '/auth/phone',

  // Protected routes
  DASHBOARD: '/dashboard',
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_SELLER: '/dashboard/seller',
  SETTINGS: '/settings',
  SETTINGS_PASSWORD: '/settings/password',
  SETTINGS_SESSIONS: '/settings/sessions',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Error paths
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// Public routes (do not require login)
export const PUBLIC_ROUTES: AppRoute[] = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.OTP,
  ROUTES.PHONE,
];

// Protected routes (require login)
export const PROTECTED_ROUTES: AppRoute[] = [
  ROUTES.DASHBOARD,
  ROUTES.DASHBOARD_ADMIN,
  ROUTES.DASHBOARD_SELLER,
  ROUTES.SETTINGS,
  ROUTES.SETTINGS_PASSWORD,
  ROUTES.SETTINGS_SESSIONS,
  ROUTES.ADMIN_USERS,     
  ROUTES.ADMIN_SETTINGS, 
];

// Admin-only routes
export const ADMIN_ROUTES: AppRoute[] = [
  ROUTES.DASHBOARD_ADMIN,
  ROUTES.ADMIN_USERS,     
  ROUTES.ADMIN_SETTINGS, 
];
