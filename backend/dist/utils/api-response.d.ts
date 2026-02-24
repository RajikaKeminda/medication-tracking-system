import { Response } from 'express';
export declare class ApiResponse {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response<any, Record<string, any>>;
    static created<T>(res: Response, data: T, message?: string): Response<any, Record<string, any>>;
    static error(res: Response, statusCode: number, message: string, code?: string, details?: {
        field: string;
        message: string;
    }[]): Response<any, Record<string, any>>;
}
//# sourceMappingURL=api-response.d.ts.map