import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
export declare const authorize: (...allowedRoles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.middleware.d.ts.map