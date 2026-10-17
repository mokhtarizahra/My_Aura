import { AccountType } from '../types/auth';
import { ROUTES } from './routes';

/**
 * Account types.
 * Must match backend AccountType enum.
 */
export const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  ORGANIZATION: 'organization',
  STAFF: 'staff',
} as const;

/**
 * Route to redirect each account type after login.
 */
export const ACCOUNT_TYPE_ROUTES: Record<AccountType, string> = {
  personal: ROUTES.HOME,
  organization: ROUTES.DASHBOARD_SELLER,
  staff: ROUTES.DASHBOARD_ADMIN,
};

export const DEFAULT_ROUTE = ROUTES.HOME;
export const LOGIN_ROUTE = ROUTES.LOGIN;
export const DASHBOARD_BASE = ROUTES.DASHBOARD;