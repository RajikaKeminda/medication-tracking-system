import { IRequest } from '../models/request.model';
import { CreateRequestInput, UpdateRequestInput, UpdateRequestStatusInput, ListRequestsQuery } from '../validators/request.validator';
interface PaginatedRequests {
    requests: IRequest[];
    total: number;
    page: number;
    pages: number;
}
export declare class RequestService {
    /**
     * Create a new medication request owned by the authenticated patient.
     */
    static createRequest(data: CreateRequestInput, userId: string): Promise<IRequest>;
    /**
     * List all requests with optional filters. Admins/pharmacy staff see all;
     * the caller's role filtering is enforced at the controller level.
     */
    static getRequests(query: ListRequestsQuery): Promise<PaginatedRequests>;
    /** Retrieve a single request by ID. */
    static getRequestById(requestId: string): Promise<IRequest>;
    /**
     * Retrieve all requests belonging to a specific patient.
     * The route guard ensures a Patient can only call this for their own userId.
     */
    static getRequestsByUser(userId: string, query: ListRequestsQuery): Promise<PaginatedRequests>;
    /** Retrieve all requests assigned to a specific pharmacy. */
    static getRequestsByPharmacy(pharmacyId: string, query: ListRequestsQuery): Promise<PaginatedRequests>;
    /** Get all requests with urgency level = "urgent". */
    static getUrgentRequests(query: ListRequestsQuery): Promise<PaginatedRequests>;
    /**
     * Update editable fields of a PENDING request.
     * Only the owning patient may perform this action (enforced at controller level).
     */
    static updateRequest(requestId: string, data: UpdateRequestInput, userId: string): Promise<IRequest>;
    /**
     * Update the status of a request (pharmacy staff only).
     * Enforces valid status state-machine transitions.
     */
    static updateRequestStatus(requestId: string, data: UpdateRequestStatusInput, pharmacyId?: string): Promise<IRequest>;
    /**
     * Cancel a pending request.
     * Patients can only cancel their own requests; pharmacy staff/admins can cancel any.
     */
    static cancelRequest(requestId: string, userId: string, userRole: string): Promise<IRequest>;
}
export {};
//# sourceMappingURL=request.service.d.ts.map