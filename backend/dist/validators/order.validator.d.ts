import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '../models/order.model';
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        requestId: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            medicationId: z.ZodString;
            name: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            medicationId: string;
            quantity: number;
            unitPrice: number;
        }, {
            name: string;
            medicationId: string;
            quantity: number;
            unitPrice: number;
        }>, "many">;
        deliveryAddress: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            postalCode: z.ZodString;
            phoneNumber: z.ZodString;
            coordinates: z.ZodOptional<z.ZodObject<{
                latitude: z.ZodNumber;
                longitude: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                latitude: number;
                longitude: number;
            }, {
                latitude: number;
                longitude: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        }, {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        }>;
        deliveryFee: z.ZodDefault<z.ZodNumber>;
        paymentMethod: z.ZodOptional<z.ZodNativeEnum<typeof PaymentMethod>>;
    }, "strip", z.ZodTypeAny, {
        requestId: string;
        items: {
            name: string;
            medicationId: string;
            quantity: number;
            unitPrice: number;
        }[];
        deliveryFee: number;
        deliveryAddress: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        };
        paymentMethod?: PaymentMethod | undefined;
    }, {
        requestId: string;
        items: {
            name: string;
            medicationId: string;
            quantity: number;
            unitPrice: number;
        }[];
        deliveryAddress: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        };
        deliveryFee?: number | undefined;
        paymentMethod?: PaymentMethod | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        requestId: string;
        items: {
            name: string;
            medicationId: string;
            quantity: number;
            unitPrice: number;
        }[];
        deliveryFee: number;
        deliveryAddress: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        };
        paymentMethod?: PaymentMethod | undefined;
    };
}, {
    body: {
        requestId: string;
        items: {
            name: string;
            medicationId: string;
            quantity: number;
            unitPrice: number;
        }[];
        deliveryAddress: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        };
        deliveryFee?: number | undefined;
        paymentMethod?: PaymentMethod | undefined;
    };
}>;
export declare const updateOrderSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        deliveryAddress: z.ZodOptional<z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            postalCode: z.ZodString;
            phoneNumber: z.ZodString;
            coordinates: z.ZodOptional<z.ZodObject<{
                latitude: z.ZodNumber;
                longitude: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                latitude: number;
                longitude: number;
            }, {
                latitude: number;
                longitude: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        }, {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        }>>;
        deliveryFee: z.ZodOptional<z.ZodNumber>;
        estimatedDelivery: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        deliveryFee?: number | undefined;
        deliveryAddress?: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        } | undefined;
        estimatedDelivery?: string | undefined;
    }, {
        deliveryFee?: number | undefined;
        deliveryAddress?: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        } | undefined;
        estimatedDelivery?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        deliveryFee?: number | undefined;
        deliveryAddress?: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        } | undefined;
        estimatedDelivery?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        deliveryFee?: number | undefined;
        deliveryAddress?: {
            street: string;
            city: string;
            postalCode: string;
            phoneNumber: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            } | undefined;
        } | undefined;
        estimatedDelivery?: string | undefined;
    };
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        status: z.ZodNativeEnum<typeof OrderStatus>;
        location: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: OrderStatus;
        location?: string | undefined;
        notes?: string | undefined;
    }, {
        status: OrderStatus;
        location?: string | undefined;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status: OrderStatus;
        location?: string | undefined;
        notes?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        status: OrderStatus;
        location?: string | undefined;
        notes?: string | undefined;
    };
}>;
export declare const processPaymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
    }, "strip", z.ZodTypeAny, {
        paymentMethod: PaymentMethod;
    }, {
        paymentMethod: PaymentMethod;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        paymentMethod: PaymentMethod;
    };
}, {
    params: {
        id: string;
    };
    body: {
        paymentMethod: PaymentMethod;
    };
}>;
export declare const assignDeliverySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        deliveryPartnerId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        deliveryPartnerId: string;
    }, {
        deliveryPartnerId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        deliveryPartnerId: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        deliveryPartnerId: string;
    };
}>;
export declare const cancelOrderSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason?: string | undefined;
    }, {
        reason?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        reason?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        reason?: string | undefined;
    };
}>;
export declare const getOrdersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodOptional<z.ZodNativeEnum<typeof OrderStatus>>;
        paymentStatus: z.ZodOptional<z.ZodString>;
        page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: string;
        page: string;
        sortBy: string;
        sortOrder: "asc" | "desc";
        status?: OrderStatus | undefined;
        paymentStatus?: string | undefined;
    }, {
        status?: OrderStatus | undefined;
        limit?: string | undefined;
        paymentStatus?: string | undefined;
        page?: string | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: string;
        page: string;
        sortBy: string;
        sortOrder: "asc" | "desc";
        status?: OrderStatus | undefined;
        paymentStatus?: string | undefined;
    };
}, {
    query: {
        status?: OrderStatus | undefined;
        limit?: string | undefined;
        paymentStatus?: string | undefined;
        page?: string | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export declare const orderIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
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
export declare const userIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodString;
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
export declare const pharmacyIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        pharmacyId: z.ZodString;
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
export declare const partnerIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        partnerId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        partnerId: string;
    }, {
        partnerId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        partnerId: string;
    };
}, {
    params: {
        partnerId: string;
    };
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>['body'];
export type AssignDeliveryInput = z.infer<typeof assignDeliverySchema>['body'];
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>['body'];
//# sourceMappingURL=order.validator.d.ts.map