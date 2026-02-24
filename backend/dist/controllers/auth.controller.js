"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const api_response_1 = require("../utils/api-response");
class AuthController {
    static async register(req, res, next) {
        try {
            const { user, tokens } = await auth_service_1.AuthService.register(req.body);
            api_response_1.ApiResponse.created(res, {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }, 'User registered successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { user, tokens } = await auth_service_1.AuthService.login(req.body);
            api_response_1.ApiResponse.success(res, {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.AuthService.logout(refreshToken);
            api_response_1.ApiResponse.success(res, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await auth_service_1.AuthService.refreshAccessToken(refreshToken);
            api_response_1.ApiResponse.success(res, {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }, 'Token refreshed successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map