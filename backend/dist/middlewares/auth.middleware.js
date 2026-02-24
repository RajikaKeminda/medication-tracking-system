"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_service_1 = require("../services/auth.service");
const user_model_1 = require("../models/user.model");
const api_error_1 = require("../utils/api-error");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw api_error_1.ApiError.unauthorized('Access token is required');
        }
        const token = authHeader.split(' ')[1];
        const decoded = auth_service_1.AuthService.verifyAccessToken(token);
        const user = await user_model_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw api_error_1.ApiError.unauthorized('User not found or deactivated');
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map