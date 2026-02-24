"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const api_error_1 = require("../utils/api-error");
const api_response_1 = require("../utils/api-response");
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, _req, res, _next) => {
    logger_1.logger.error(err);
    if (err instanceof api_error_1.ApiError) {
        return api_response_1.ApiResponse.error(res, err.statusCode, err.message, err.code, err.details);
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return api_response_1.ApiResponse.error(res, 400, 'Validation failed', 'VALIDATION_ERROR', details);
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        return api_response_1.ApiResponse.error(res, 400, `Invalid ${err.path}: ${err.value}`, 'CAST_ERROR');
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return api_response_1.ApiResponse.error(res, 409, `Duplicate value for field: ${field}`, 'DUPLICATE_ERROR', [{ field, message: `${field} already exists` }]);
    }
    return api_response_1.ApiResponse.error(res, 500, process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message, 'INTERNAL_ERROR');
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, _res, next) => {
    next(api_error_1.ApiError.notFound(`Route ${req.originalUrl} not found`));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map