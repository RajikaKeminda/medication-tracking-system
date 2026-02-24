import mongoose, { Document } from 'mongoose';
export interface IRefreshToken extends Document {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
    isRevoked: boolean;
    replacedByToken?: string;
    createdAt: Date;
}
export declare const RefreshToken: mongoose.Model<IRefreshToken, {}, {}, {}, mongoose.Document<unknown, {}, IRefreshToken, {}, {}> & IRefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=refresh-token.model.d.ts.map