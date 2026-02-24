import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    PATIENT = "Patient",
    PHARMACY_STAFF = "Pharmacy Staff",
    SYSTEM_ADMIN = "System Admin"
}
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    profileImage?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    lastLogin?: Date;
    pharmacyId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=user.model.d.ts.map