export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
    metadata: Record<string, string>;
    clientSecret: string;
    createdAt: Date;
}
export interface Refund {
    id: string;
    paymentIntentId: string;
    amount: number;
    status: 'succeeded' | 'pending' | 'failed';
    createdAt: Date;
}
/**
 * Mock Stripe SDK that simulates payment gateway operations.
 * Replace with the real Stripe SDK (`stripe` npm package) in production.
 */
export declare class StripeService {
    static createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<PaymentIntent>;
    static confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
    static cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;
    static createRefund(paymentIntentId: string, amount?: number): Promise<Refund>;
    static getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null>;
    private static simulateLatency;
}
//# sourceMappingURL=stripe.service.d.ts.map