export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: {
        field: string;
        message: string;
    }[];
    constructor(statusCode: number, message: string, code?: string, details?: {
        field: string;
        message: string;
    }[]);
    static badRequest(message: string, details?: {
        field: string;
        message: string;
    }[]): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(message?: string): ApiError;
    static conflict(message: string): ApiError;
    static validationError(details: {
        field: string;
        message: string;
    }[]): ApiError;
    static internal(message?: string): ApiError;
}
//# sourceMappingURL=api-error.d.ts.map