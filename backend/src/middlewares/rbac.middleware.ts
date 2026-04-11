import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
import { ApiError } from '../utils/api-error';

/** Canonical list — avoids `Object.values(enum)` quirks with TS emit. */
const KNOWN_ROLES: UserRole[] = [
  UserRole.PATIENT,
  UserRole.PHARMACY_STAFF,
  UserRole.DELIVERY_PARTNER,
  UserRole.SYSTEM_ADMIN,
];

/** Map stored role strings to enum values (handles whitespace). */
function resolveRole(role: unknown): UserRole | null {
  if (role === undefined || role === null) return null;
  const s = String(role).trim();
  const match = KNOWN_ROLES.find((v) => v === s);
  return match ?? null;
}

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const resolved = resolveRole(req.user.role);
    if (!resolved) {
      return next(
        ApiError.forbidden(
          'Your account role is missing or invalid. Ask an administrator to fix your profile.'
        )
      );
    }

    // Keep downstream checks (e.g. service layer string compares) aligned with canonical values
    req.user.role = resolved;

    if (!allowedRoles.includes(resolved)) {
      return next(
        ApiError.forbidden(
          `This action requires one of: ${allowedRoles.join(', ')}. Your role is "${resolved}".`
        )
      );
    }

    next();
  };
};
