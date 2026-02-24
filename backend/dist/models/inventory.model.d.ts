import mongoose, { Document } from 'mongoose';
export declare enum MedicationCategory {
    PRESCRIPTION = "prescription",
    OTC = "otc",
    CONTROLLED = "controlled"
}
export declare enum MedicationForm {
    TABLET = "tablet",
    CAPSULE = "capsule",
    SYRUP = "syrup",
    INJECTION = "injection"
}
export interface IInventory extends Document {
    pharmacyId: mongoose.Types.ObjectId;
    medicationName: string;
    genericName?: string;
    category: MedicationCategory;
    dosage?: string;
    form?: MedicationForm;
    quantity: number;
    unitPrice: number;
    batchNumber?: string;
    expiryDate?: Date;
    manufacturer?: string;
    requiresPrescription: boolean;
    lowStockThreshold: number;
    storageConditions?: string;
    sideEffects?: string[];
    contraindications?: string[];
    activeIngredients?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Inventory: mongoose.Model<IInventory, {}, {}, {}, mongoose.Document<unknown, {}, IInventory, {}, {}> & IInventory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=inventory.model.d.ts.map