import mongoose, { Document } from 'mongoose';
export declare enum RequestStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
    FULFILLED = "fulfilled",
    CANCELLED = "cancelled"
}
export declare enum UrgencyLevel {
    URGENT = "urgent",
    NORMAL = "normal",
    LOW = "low"
}
export interface IRequest extends Document {
    userId: mongoose.Types.ObjectId;
    pharmacyId: mongoose.Types.ObjectId;
    medicationName: string;
    quantity: number;
    urgencyLevel: UrgencyLevel;
    status: RequestStatus;
    prescriptionRequired: boolean;
    prescriptionImage?: string;
    notes?: string;
    requestDate: Date;
    responseDate?: Date;
    estimatedAvailability?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MedicationRequest: mongoose.Model<IRequest, {}, {}, {}, mongoose.Document<unknown, {}, IRequest, {}, {}> & IRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=request.model.d.ts.map