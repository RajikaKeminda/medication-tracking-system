"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const user_model_1 = require("../models/user.model");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({ required_error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters')
            .trim(),
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email('Invalid email format')
            .trim()
            .toLowerCase(),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password cannot exceed 128 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, 'Password must contain at least one uppercase, one lowercase, one number, and one special character'),
        role: zod_1.z
            .nativeEnum(user_model_1.UserRole, {
            errorMap: () => ({
                message: `Role must be one of: ${Object.values(user_model_1.UserRole).join(', ')}`,
            }),
        })
            .optional()
            .default(user_model_1.UserRole.PATIENT),
        phone: zod_1.z
            .string()
            .regex(/^\+?[\d\s-()]{7,15}$/, 'Invalid phone number format')
            .optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email('Invalid email format')
            .trim()
            .toLowerCase(),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(1, 'Password is required'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z
            .string({ required_error: 'Refresh token is required' })
            .min(1, 'Refresh token is required'),
    }),
});
//# sourceMappingURL=auth.validator.js.map