"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    static badRequest(message, details) {
        return new ApiError(400, message, 'BAD_REQUEST', details);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message, 'UNAUTHORIZED');
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message, 'FORBIDDEN');
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message, 'NOT_FOUND');
    }
    static conflict(message) {
        return new ApiError(409, message, 'CONFLICT');
    }
    static validationError(details) {
        return new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details);
    }
    static internal(message = 'Internal server error') {
        return new ApiError(500, message, 'INTERNAL_ERROR');
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api-error.js.map