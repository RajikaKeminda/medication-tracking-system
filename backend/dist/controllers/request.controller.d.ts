import { Request, Response, NextFunction } from 'express';
export declare class RequestController {
    /** POST /api/requests — Patient creates a new medication request */
    static createRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    /** GET /api/requests — System admin / pharmacy staff sees all (with filters) */
    static getRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
    /** GET /api/requests/urgent — All urgent-priority requests (admin / pharmacy staff) */
    static getUrgentRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/requests/user/:userId
     * Patients can only access their own; admins can access any user's.
     */
    static getRequestsByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    /** GET /api/requests/pharmacy/:pharmacyId — Pharmacy staff / admin only */
    static getRequestsByPharmacy(req: Request, res: Response, next: NextFunction): Promise<void>;
    /** GET /api/requests/:id — Get a single request (owner or staff/admin) */
    static getRequestById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PUT /api/requests/:id
     * Patient updates their own PENDING request (quantity, urgencyLevel, notes, prescriptionImage).
     */
    static updateRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/requests/:id/status
     * Pharmacy staff updates the request status. Triggers patient notification.
     */
    static updateRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/requests/:id
     * Cancel a request. Patients cancel their own; pharmacy staff/admin can cancel any.
     */
    static cancelRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=request.controller.d.ts.map