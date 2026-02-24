"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
const paymentIntents = new Map();
const refunds = new Map();
/**
 * Mock Stripe SDK that simulates payment gateway operations.
 * Replace with the real Stripe SDK (`stripe` npm package) in production.
 */
class StripeService {
    static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        await this.simulateLatency();
        const intent = {
            id: `pi_${crypto_1.default.randomBytes(12).toString('hex')}`,
            amount: Math.round(amount * 100),
            currency,
            status: 'requires_confirmation',
            metadata,
            clientSecret: `pi_${crypto_1.default.randomBytes(12).toString('hex')}_secret_${crypto_1.default.randomBytes(8).toString('hex')}`,
            createdAt: new Date(),
        };
        paymentIntents.set(intent.id, intent);
        logger_1.logger.info(`[Stripe Mock] Payment intent created: ${intent.id} for ${currency} ${amount}`);
        return intent;
    }
    static async confirmPaymentIntent(paymentIntentId) {
        await this.simulateLatency();
        const intent = paymentIntents.get(paymentIntentId);
        if (!intent) {
            throw new Error(`Payment intent ${paymentIntentId} not found`);
        }
        if (intent.status === 'canceled') {
            throw new Error('Cannot confirm a canceled payment intent');
        }
        if (intent.status === 'succeeded') {
            throw new Error('Payment intent has already succeeded');
        }
        intent.status = 'succeeded';
        paymentIntents.set(paymentIntentId, intent);
        logger_1.logger.info(`[Stripe Mock] Payment intent confirmed: ${paymentIntentId}`);
        return intent;
    }
    static async cancelPaymentIntent(paymentIntentId) {
        await this.simulateLatency();
        const intent = paymentIntents.get(paymentIntentId);
        if (!intent) {
            throw new Error(`Payment intent ${paymentIntentId} not found`);
        }
        if (intent.status === 'succeeded') {
            throw new Error('Cannot cancel a succeeded payment intent — create a refund instead');
        }
        intent.status = 'canceled';
        paymentIntents.set(paymentIntentId, intent);
        logger_1.logger.info(`[Stripe Mock] Payment intent canceled: ${paymentIntentId}`);
        return intent;
    }
    static async createRefund(paymentIntentId, amount) {
        await this.simulateLatency();
        const intent = paymentIntents.get(paymentIntentId);
        if (!intent) {
            throw new Error(`Payment intent ${paymentIntentId} not found`);
        }
        if (intent.status !== 'succeeded') {
            throw new Error('Can only refund a succeeded payment intent');
        }
        const refundAmount = amount ?? intent.amount;
        const refund = {
            id: `re_${crypto_1.default.randomBytes(12).toString('hex')}`,
            paymentIntentId,
            amount: refundAmount,
            status: 'succeeded',
            createdAt: new Date(),
        };
        refunds.set(refund.id, refund);
        logger_1.logger.info(`[Stripe Mock] Refund created: ${refund.id} for payment ${paymentIntentId}`);
        return refund;
    }
    static async getPaymentIntent(paymentIntentId) {
        return paymentIntents.get(paymentIntentId) ?? null;
    }
    static simulateLatency() {
        const delay = 50 + Math.random() * 150;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map