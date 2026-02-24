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
exports.Inventory = exports.MedicationForm = exports.MedicationCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var MedicationCategory;
(function (MedicationCategory) {
    MedicationCategory["PRESCRIPTION"] = "prescription";
    MedicationCategory["OTC"] = "otc";
    MedicationCategory["CONTROLLED"] = "controlled";
})(MedicationCategory || (exports.MedicationCategory = MedicationCategory = {}));
var MedicationForm;
(function (MedicationForm) {
    MedicationForm["TABLET"] = "tablet";
    MedicationForm["CAPSULE"] = "capsule";
    MedicationForm["SYRUP"] = "syrup";
    MedicationForm["INJECTION"] = "injection";
})(MedicationForm || (exports.MedicationForm = MedicationForm = {}));
const inventorySchema = new mongoose_1.Schema({
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
    genericName: { type: String, trim: true },
    category: {
        type: String,
        enum: Object.values(MedicationCategory),
        default: MedicationCategory.OTC,
    },
    dosage: String,
    form: {
        type: String,
        enum: Object.values(MedicationForm),
    },
    quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative'],
    },
    unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Unit price cannot be negative'],
    },
    batchNumber: String,
    expiryDate: Date,
    manufacturer: String,
    requiresPrescription: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 10 },
    storageConditions: String,
    sideEffects: [String],
    contraindications: [String],
    activeIngredients: [String],
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            return ret;
        },
    },
});
inventorySchema.index({ medicationName: 1, pharmacyId: 1 });
exports.Inventory = mongoose_1.default.model('Inventory', inventorySchema);
//# sourceMappingURL=inventory.model.js.map