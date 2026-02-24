"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PACKED"] = "packed";
    OrderStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "card";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["ONLINE"] = "online";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
const orderItemSchema = new mongoose_1.Schema({
    medicationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false });
const trackingUpdateSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: String,
    notes: String,
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },
    requestId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Request',
        required: [true, 'Request ID is required'],
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    pharmacyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: [true, 'Pharmacy ID is required'],
        index: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [(v) => v.length > 0, 'At least one item is required'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.CONFIRMED,
    },
    deliveryPartnerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
    },
    paymentIntentId: String,
    trackingUpdates: [trackingUpdateSchema],
    invoiceUrl: String,
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            return ret;
        },
    },
});
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ deliveryPartnerId: 1 });
orderSchema.index({ createdAt: -1 });
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=order.model.js.map