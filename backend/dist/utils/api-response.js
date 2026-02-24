"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }
    static created(res, data, message = 'Created successfully') {
        return ApiResponse.success(res, data, message, 201);
    }
    static error(res, statusCode, message, code = 'INTERNAL_ERROR', details) {
        const response = {
            success: false,
            error: {
                code,
                message,
                ...(details && { details }),
            },
        };
        return res.status(statusCode).json(response);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.js.map