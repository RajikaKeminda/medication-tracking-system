"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const api_error_1 = require("../utils/api-error");
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(api_error_1.ApiError.unauthorized('Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(api_error_1.ApiError.forbidden(`Access denied. Required role(s): ${allowedRoles.join(', ')}`));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=rbac.middleware.js.map