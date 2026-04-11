import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { AnalyticsService, AdminReportPayload } from '../services/analytics.service';
import { ApiResponse } from '../utils/api-response';

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function reportToCsv(report: AdminReportPayload): string {
  const rows: string[] = ['section,key,value'];
  const push = (section: string, key: string, value: string | number) => {
    rows.push([section, csvEscape(key), csvEscape(String(value))].join(','));
  };

  push('meta', 'generatedAt', report.generatedAt);
  if (report.period.from) push('meta', 'periodFrom', report.period.from);
  if (report.period.to) push('meta', 'periodTo', report.period.to);

  push('users', 'total', report.users.total);
  for (const [role, count] of Object.entries(report.users.byRole)) {
    push('usersByRole', role, count);
  }

  push('pharmacies', 'total', report.pharmacies.total);
  push('pharmacies', 'verified', report.pharmacies.verified);
  push('pharmacies', 'active', report.pharmacies.active);

  push('medicationRequests', 'total', report.medicationRequests.total);
  for (const [status, count] of Object.entries(report.medicationRequests.byStatus)) {
    push('requestsByStatus', status, count);
  }

  push('orders', 'total', report.orders.total);
  push('orders', 'revenuePaid', report.orders.revenuePaid.toFixed(2));
  for (const [status, count] of Object.entries(report.orders.byStatus)) {
    push('ordersByStatus', status, count);
  }
  for (const [ps, count] of Object.entries(report.orders.byPaymentStatus)) {
    push('ordersByPaymentStatus', ps, count);
  }

  push('inventory', 'totalSkus', report.inventory.totalSkus);
  push('inventory', 'lowStockCount', report.inventory.lowStockCount);

  return `${rows.join('\n')}\n`;
}

function writeReportPdf(report: AdminReportPayload, doc: PDFInstance): void {
  doc.fontSize(18).text('Platform admin report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${report.generatedAt}`, { align: 'center' });
  if (report.period.from || report.period.to) {
    doc.text(`Period: ${report.period.from ?? '—'} → ${report.period.to ?? '—'}`, {
      align: 'center',
    });
  }
  doc.moveDown(1.5);
  doc.fontSize(12).text('Users');
  doc.fontSize(10).text(`Total: ${report.users.total}`);
  for (const [role, count] of Object.entries(report.users.byRole)) {
    doc.text(`  • ${role}: ${count}`);
  }
  doc.moveDown();
  doc.fontSize(12).text('Pharmacies');
  doc.fontSize(10).text(
    `Total: ${report.pharmacies.total} | Verified: ${report.pharmacies.verified} | Active: ${report.pharmacies.active}`
  );
  doc.moveDown();
  doc.fontSize(12).text('Medication requests');
  doc.fontSize(10).text(`Total (in period / overall filter): ${report.medicationRequests.total}`);
  for (const [status, count] of Object.entries(report.medicationRequests.byStatus)) {
    doc.text(`  • ${status}: ${count}`);
  }
  doc.moveDown();
  doc.fontSize(12).text('Orders');
  doc.fontSize(10).text(`Total (filtered): ${report.orders.total}`);
  doc.text(`Revenue (paid, non-cancelled): ${report.orders.revenuePaid.toFixed(2)}`);
  for (const [status, count] of Object.entries(report.orders.byStatus)) {
    doc.text(`  • ${status}: ${count}`);
  }
  doc.moveDown();
  doc.fontSize(12).text('Inventory');
  doc
    .fontSize(10)
    .text(`SKU rows: ${report.inventory.totalSkus} | Low stock rows: ${report.inventory.lowStockCount}`);
}

/** pdfkit instance type without pulling full typings into every call */
type PDFInstance = InstanceType<typeof PDFDocument>;

export class AnalyticsController {
  static async getAdminReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      const data = await AnalyticsService.getAdminReport({ from, to });
      ApiResponse.success(res, data, 'Report generated');
    } catch (error) {
      next(error);
    }
  }

  static async exportAdminReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, format } = req.query as {
        from?: string;
        to?: string;
        format: 'csv' | 'pdf';
      };
      const report = await AnalyticsService.getAdminReport({ from, to });
      const stamp = new Date().toISOString().slice(0, 10);

      if (format === 'csv') {
        const csv = reportToCsv(report);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="admin-report-${stamp}.csv"`
        );
        return res.status(200).send(csv);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="admin-report-${stamp}.pdf"`
      );

      const doc = new PDFDocument({ margin: 50 });
      doc.on('error', next);
      doc.pipe(res);
      writeReportPdf(report, doc);
      doc.end();
    } catch (error) {
      next(error);
    }
  }
}
