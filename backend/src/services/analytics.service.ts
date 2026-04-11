import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { MedicationRequest } from '../models/request.model';
import { Pharmacy } from '../models/pharmacy.model';
import { Inventory } from '../models/inventory.model';
import { User } from '../models/user.model';
import type { AdminReportQuery } from '../validators/analytics.validator';

function buildCreatedAtFilter(from?: string, to?: string): Record<string, Date> | undefined {
  if (!from && !to) return undefined;
  const range: Record<string, Date> = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return range;
}

export interface AdminReportPayload {
  generatedAt: string;
  period: { from?: string; to?: string };
  users: { total: number; byRole: Record<string, number> };
  pharmacies: { total: number; verified: number; active: number };
  medicationRequests: { total: number; byStatus: Record<string, number> };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    revenuePaid: number;
  };
  inventory: { totalSkus: number; lowStockCount: number };
}

export class AnalyticsService {
  static async getAdminReport(query: AdminReportQuery): Promise<AdminReportPayload> {
    const { from, to } = query;
    const createdAt = buildCreatedAtFilter(from, to);
    const orderMatch: Record<string, unknown> = {};
    const requestMatch: Record<string, unknown> = {};
    if (createdAt) {
      orderMatch.createdAt = createdAt;
      requestMatch.createdAt = createdAt;
    }

    const [
      userAgg,
      userTotal,
      pharmacyTotal,
      pharmacyVerified,
      pharmacyActive,
      requestStatusAgg,
      requestTotal,
      orderStatusAgg,
      orderPaymentAgg,
      orderTotal,
      revenueRow,
      inventoryTotal,
      lowStock,
    ] = await Promise.all([
      User.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      User.countDocuments(),
      Pharmacy.countDocuments(),
      Pharmacy.countDocuments({ isVerified: true }),
      Pharmacy.countDocuments({ isActive: true }),
      Object.keys(requestMatch).length
        ? MedicationRequest.aggregate<{ _id: string; count: number }>([
            { $match: requestMatch },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ])
        : MedicationRequest.aggregate<{ _id: string; count: number }>([
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ]),
      Object.keys(requestMatch).length
        ? MedicationRequest.countDocuments(requestMatch)
        : MedicationRequest.countDocuments(),
      Object.keys(orderMatch).length
        ? Order.aggregate<{ _id: string; count: number }>([
            { $match: orderMatch },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ])
        : Order.aggregate<{ _id: string; count: number }>([
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ]),
      Object.keys(orderMatch).length
        ? Order.aggregate<{ _id: string; count: number }>([
            { $match: orderMatch },
            { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
          ])
        : Order.aggregate<{ _id: string; count: number }>([
            { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
          ]),
      Object.keys(orderMatch).length
        ? Order.countDocuments(orderMatch)
        : Order.countDocuments(),
      Order.aggregate<{ total: number }>([
        {
          $match: {
            ...orderMatch,
            paymentStatus: PaymentStatus.PAID,
            status: { $ne: OrderStatus.CANCELLED },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Inventory.countDocuments(),
      Inventory.countDocuments({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      }),
    ]);

    const byRole: Record<string, number> = {};
    for (const row of userAgg) {
      byRole[row._id ?? 'unknown'] = row.count;
    }

    const reqByStatus: Record<string, number> = {};
    for (const row of requestStatusAgg) {
      reqByStatus[row._id ?? 'unknown'] = row.count;
    }

    const ordByStatus: Record<string, number> = {};
    for (const row of orderStatusAgg) {
      ordByStatus[row._id ?? 'unknown'] = row.count;
    }

    const ordByPayment: Record<string, number> = {};
    for (const row of orderPaymentAgg) {
      ordByPayment[row._id ?? 'unknown'] = row.count;
    }

    return {
      generatedAt: new Date().toISOString(),
      period: { from, to },
      users: { total: userTotal, byRole },
      pharmacies: {
        total: pharmacyTotal,
        verified: pharmacyVerified,
        active: pharmacyActive,
      },
      medicationRequests: {
        total: requestTotal,
        byStatus: reqByStatus,
      },
      orders: {
        total: orderTotal,
        byStatus: ordByStatus,
        byPaymentStatus: ordByPayment,
        revenuePaid: revenueRow[0]?.total ?? 0,
      },
      inventory: {
        totalSkus: inventoryTotal,
        lowStockCount: lowStock,
      },
    };
  }
}
