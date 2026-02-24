"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pharmacyParamSchema = exports.userParamSchema = exports.requestParamSchema = exports.listRequestsQuerySchema = exports.updateRequestStatusSchema = exports.updateRequestSchema = exports.createRequestSchema = void 0;
const zod_1 = require("zod");
const request_model_1 = require("../models/request.model");
const mongoose_1 = __importDefault(require("mongoose"));
// ─── Reusable helpers ────────────────────────────────────────────────────────
const objectIdSchema = zod_1.z
    .string({ required_error: 'A valid MongoDB ObjectId is required' })
    .refine((v) => mongoose_1.default.Types.ObjectId.isValid(v), {
    message: 'Must be a valid MongoDB ObjectId',
});
// ─── Create Request ──────────────────────────────────────────────────────────
exports.createRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        pharmacyId: objectIdSchema,
        medicationName: zod_1.z
            .string({ required_error: 'Medication name is required' })
            .min(2, 'Medication name must be at least 2 characters')
            .max(200, 'Medication name cannot exceed 200 characters')
            .trim(),
        quantity: zod_1.z
            .number({ required_error: 'Quantity is required' })
            .int('Quantity must be a whole number')
            .min(1, 'Quantity must be at least 1')
            .max(10000, 'Quantity cannot exceed 10,000'),
        urgencyLevel: zod_1.z
            .nativeEnum(request_model_1.UrgencyLevel, {
            errorMap: () => ({
                message: `Urgency level must be one of: ${Object.values(request_model_1.UrgencyLevel).join(', ')}`,
            }),
        })
            .optional()
            .default(request_model_1.UrgencyLevel.NORMAL),
        prescriptionRequired: zod_1.z.boolean().optional().default(false),
        prescriptionImage: zod_1.z.string().url('Prescription image must be a valid URL').optional(),
        notes: zod_1.z
            .string()
            .max(1000, 'Notes cannot exceed 1,000 characters')
            .trim()
            .optional(),
        estimatedAvailability: zod_1.z
            .string()
            .datetime({ message: 'Must be a valid ISO 8601 datetime' })
            .optional(),
    }),
});
// ─── Update Request (patient edits their own pending request) ────────────────
exports.updateRequestSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectIdSchema }),
    body: zod_1.z
        .object({
        quantity: zod_1.z
            .number()
            .int('Quantity must be a whole number')
            .min(1, 'Quantity must be at least 1')
            .max(10000, 'Quantity cannot exceed 10,000')
            .optional(),
        urgencyLevel: zod_1.z
            .nativeEnum(request_model_1.UrgencyLevel, {
            errorMap: () => ({
                message: `Urgency level must be one of: ${Object.values(request_model_1.UrgencyLevel).join(', ')}`,
            }),
        })
            .optional(),
        notes: zod_1.z.string().max(1000).trim().optional(),
        prescriptionImage: zod_1.z.string().url('Must be a valid URL').optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    }),
});
// ─── Update Status (pharmacy staff only) ─────────────────────────────────────
exports.updateRequestStatusSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectIdSchema }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(request_model_1.RequestStatus, {
            errorMap: () => ({
                message: `Status must be one of: ${Object.values(request_model_1.RequestStatus).join(', ')}`,
            }),
        }),
        responseDate: zod_1.z
            .string()
            .datetime({ message: 'Must be a valid ISO 8601 datetime' })
            .optional(),
        estimatedAvailability: zod_1.z
            .string()
            .datetime({ message: 'Must be a valid ISO 8601 datetime' })
            .optional(),
        notes: zod_1.z.string().max(1000).trim().optional(),
    }),
});
// ─── Query filters (GET /api/requests) ───────────────────────────────────────
exports.listRequestsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(request_model_1.RequestStatus).optional(),
        urgencyLevel: zod_1.z.nativeEnum(request_model_1.UrgencyLevel).optional(),
        dateFrom: zod_1.z.string().datetime().optional(),
        dateTo: zod_1.z.string().datetime().optional(),
        page: zod_1.z
            .string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .optional()
            .transform((v) => (v ? parseInt(v, 10) : 1)),
        limit: zod_1.z
            .string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .optional()
            .transform((v) => (v ? Math.min(parseInt(v, 10), 100) : 20)),
        sortBy: zod_1.z.enum(['createdAt', 'urgencyLevel', 'requestDate', 'status']).optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
// ─── Param-only schemas ───────────────────────────────────────────────────────
exports.requestParamSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectIdSchema }),
});
exports.userParamSchema = zod_1.z.object({
    params: zod_1.z.object({ userId: objectIdSchema }),
});
exports.pharmacyParamSchema = zod_1.z.object({
    params: zod_1.z.object({ pharmacyId: objectIdSchema }),
});
//# sourceMappingURL=request.validator.js.map