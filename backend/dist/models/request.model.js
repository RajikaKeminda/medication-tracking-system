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
exports.MedicationRequest = exports.UrgencyLevel = exports.RequestStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "pending";
    RequestStatus["PROCESSING"] = "processing";
    RequestStatus["AVAILABLE"] = "available";
    RequestStatus["UNAVAILABLE"] = "unavailable";
    RequestStatus["FULFILLED"] = "fulfilled";
    RequestStatus["CANCELLED"] = "cancelled";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["URGENT"] = "urgent";
    UrgencyLevel["NORMAL"] = "normal";
    UrgencyLevel["LOW"] = "low";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
const requestSchema = new mongoose_1.Schema({
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
    medicationName: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
    },
    urgencyLevel: {
        type: String,
        enum: Object.values(UrgencyLevel),
        default: UrgencyLevel.NORMAL,
    },
    status: {
        type: String,
        enum: Object.values(RequestStatus),
        default: RequestStatus.PENDING,
    },
    prescriptionRequired: {
        type: Boolean,
        default: false,
    },
    prescriptionImage: String,
    notes: { type: String, trim: true },
    requestDate: { type: Date, default: Date.now },
    responseDate: Date,
    estimatedAvailability: Date,
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            return ret;
        },
    },
});
requestSchema.index({ status: 1 });
requestSchema.index({ urgencyLevel: 1 });
exports.MedicationRequest = mongoose_1.default.model('Request', requestSchema);
//# sourceMappingURL=request.model.js.map