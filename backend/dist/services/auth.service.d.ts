import { IUser, UserRole } from '../models/user.model';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
interface JwtPayload {
    userId: string;
    role: UserRole;
}
export declare class AuthService {
    static generateAccessToken(userId: string, role: UserRole): string;
    static generateRefreshToken(userId: string): Promise<string>;
    static generateTokenPair(userId: string, role: UserRole): Promise<TokenPair>;
    static register(data: RegisterInput): Promise<{
        user: IUser;
        tokens: TokenPair;
    }>;
    static login(data: LoginInput): Promise<{
        user: IUser;
        tokens: TokenPair;
    }>;
    static logout(refreshToken: string): Promise<void>;
    static refreshAccessToken(oldRefreshToken: string): Promise<TokenPair>;
    static verifyAccessToken(token: string): JwtPayload;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map