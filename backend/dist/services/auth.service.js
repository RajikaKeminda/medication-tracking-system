"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../models/user.model");
const refresh_token_model_1 = require("../models/refresh-token.model");
const env_1 = require("../config/env");
const api_error_1 = require("../utils/api-error");
class AuthService {
    static generateAccessToken(userId, role) {
        return jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRATION,
        });
    }
    static async generateRefreshToken(userId) {
        const token = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        const daysMatch = env_1.env.JWT_REFRESH_EXPIRATION.match(/(\d+)d/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 7;
        expiresAt.setDate(expiresAt.getDate() + days);
        await refresh_token_model_1.RefreshToken.create({
            token,
            userId,
            expiresAt,
        });
        return token;
    }
    static async generateTokenPair(userId, role) {
        const accessToken = this.generateAccessToken(userId, role);
        const refreshToken = await this.generateRefreshToken(userId);
        return { accessToken, refreshToken };
    }
    static async register(data) {
        const existingUser = await user_model_1.User.findOne({ email: data.email });
        if (existingUser) {
            throw api_error_1.ApiError.conflict('A user with this email already exists');
        }
        const user = await user_model_1.User.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || user_model_1.UserRole.PATIENT,
            phone: data.phone,
        });
        const tokens = await this.generateTokenPair(String(user._id), user.role);
        return { user, tokens };
    }
    static async login(data) {
        const user = await user_model_1.User.findOne({ email: data.email }).select('+password');
        if (!user) {
            throw api_error_1.ApiError.unauthorized('Invalid email or password');
        }
        if (!user.isActive) {
            throw api_error_1.ApiError.forbidden('Account has been deactivated. Contact support.');
        }
        const isPasswordValid = await user.comparePassword(data.password);
        if (!isPasswordValid) {
            throw api_error_1.ApiError.unauthorized('Invalid email or password');
        }
        user.lastLogin = new Date();
        await user.save();
        const tokens = await this.generateTokenPair(String(user._id), user.role);
        user.password = undefined;
        return { user, tokens };
    }
    static async logout(refreshToken) {
        const token = await refresh_token_model_1.RefreshToken.findOne({ token: refreshToken });
        if (token) {
            token.isRevoked = true;
            await token.save();
        }
    }
    static async refreshAccessToken(oldRefreshToken) {
        const storedToken = await refresh_token_model_1.RefreshToken.findOne({ token: oldRefreshToken });
        if (!storedToken) {
            throw api_error_1.ApiError.unauthorized('Invalid refresh token');
        }
        if (storedToken.isRevoked) {
            // Possible token reuse detected — revoke all tokens for user
            await refresh_token_model_1.RefreshToken.updateMany({ userId: storedToken.userId }, { isRevoked: true });
            throw api_error_1.ApiError.unauthorized('Refresh token has been revoked. Please login again.');
        }
        if (storedToken.expiresAt < new Date()) {
            throw api_error_1.ApiError.unauthorized('Refresh token has expired');
        }
        const user = await user_model_1.User.findById(storedToken.userId);
        if (!user || !user.isActive) {
            throw api_error_1.ApiError.unauthorized('User not found or deactivated');
        }
        // Rotate: revoke old token and issue new pair
        storedToken.isRevoked = true;
        const newTokens = await this.generateTokenPair(String(user._id), user.role);
        storedToken.replacedByToken = newTokens.refreshToken;
        await storedToken.save();
        return newTokens;
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch {
            throw api_error_1.ApiError.unauthorized('Invalid or expired access token');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map