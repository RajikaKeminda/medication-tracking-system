import { z } from 'zod';
import { UrgencyLevel, RequestStatus } from '../models/request.model';
export declare const createRequestSchema: z.ZodObject<{
    body: z.ZodObject<{
        pharmacyId: z.ZodEffects<z.ZodString, string, string>;
        medicationName: z.ZodString;
        quantity: z.ZodNumber;
        urgencyLevel: z.ZodDefault<z.ZodOptional<z.ZodNativeEnum<typeof UrgencyLevel>>>;
        prescriptionRequired: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        prescriptionImage: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        estimatedAvailability: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        pharmacyId: string;
        quantity: number;
        medicationName: string;
        urgencyLevel: UrgencyLevel;
        prescriptionRequired: boolean;
        notes?: string | undefined;
        prescriptionImage?: string | undefined;
        estimatedAvailability?: string | undefined;
    }, {
        pharmacyId: string;
        quantity: number;
        medicationName: string;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionRequired?: boolean | undefined;
        prescriptionImage?: string | undefined;
        estimatedAvailability?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        pharmacyId: string;
        quantity: number;
        medicationName: string;
        urgencyLevel: UrgencyLevel;
        prescriptionRequired: boolean;
        notes?: string | undefined;
        prescriptionImage?: string | undefined;
        estimatedAvailability?: string | undefined;
    };
}, {
    body: {
        pharmacyId: string;
        quantity: number;
        medicationName: string;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionRequired?: boolean | undefined;
        prescriptionImage?: string | undefined;
        estimatedAvailability?: string | undefined;
    };
}>;
export declare const updateRequestSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        quantity: z.ZodOptional<z.ZodNumber>;
        urgencyLevel: z.ZodOptional<z.ZodNativeEnum<typeof UrgencyLevel>>;
        notes: z.ZodOptional<z.ZodString>;
        prescriptionImage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity?: number | undefined;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionImage?: string | undefined;
    }, {
        quantity?: number | undefined;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionImage?: string | undefined;
    }>, {
        quantity?: number | undefined;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionImage?: string | undefined;
    }, {
        quantity?: number | undefined;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionImage?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        quantity?: number | undefined;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionImage?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        quantity?: number | undefined;
        notes?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        prescriptionImage?: string | undefined;
    };
}>;
export declare const updateRequestStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        status: z.ZodNativeEnum<typeof RequestStatus>;
        responseDate: z.ZodOptional<z.ZodString>;
        estimatedAvailability: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: RequestStatus;
        notes?: string | undefined;
        responseDate?: string | undefined;
        estimatedAvailability?: string | undefined;
    }, {
        status: RequestStatus;
        notes?: string | undefined;
        responseDate?: string | undefined;
        estimatedAvailability?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status: RequestStatus;
        notes?: string | undefined;
        responseDate?: string | undefined;
        estimatedAvailability?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        status: RequestStatus;
        notes?: string | undefined;
        responseDate?: string | undefined;
        estimatedAvailability?: string | undefined;
    };
}>;
export declare const listRequestsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodOptional<z.ZodNativeEnum<typeof RequestStatus>>;
        urgencyLevel: z.ZodOptional<z.ZodNativeEnum<typeof UrgencyLevel>>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["createdAt", "urgencyLevel", "requestDate", "status"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "status" | "createdAt" | "urgencyLevel" | "requestDate";
        sortOrder: "asc" | "desc";
        status?: RequestStatus | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    }, {
        status?: RequestStatus | undefined;
        limit?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        page?: string | undefined;
        sortBy?: "status" | "createdAt" | "urgencyLevel" | "requestDate" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "status" | "createdAt" | "urgencyLevel" | "requestDate";
        sortOrder: "asc" | "desc";
        status?: RequestStatus | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    };
}, {
    query: {
        status?: RequestStatus | undefined;
        limit?: string | undefined;
        urgencyLevel?: UrgencyLevel | undefined;
        page?: string | undefined;
        sortBy?: "status" | "createdAt" | "urgencyLevel" | "requestDate" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    };
}>;
export declare const requestParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const userParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
    }, {
        userId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: string;
    };
}, {
    params: {
        userId: string;
    };
}>;
export declare const pharmacyParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        pharmacyId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        pharmacyId: string;
    }, {
        pharmacyId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        pharmacyId: string;
    };
}, {
    params: {
        pharmacyId: string;
    };
}>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>['body'];
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>['body'];
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>['body'];
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>['query'];
//# sourceMappingURL=request.validator.d.ts.map