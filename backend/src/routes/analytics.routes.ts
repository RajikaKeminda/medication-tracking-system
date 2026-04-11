import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { UserRole } from '../models/user.model';
import { adminReportExportQuerySchema, adminReportQuerySchema } from '../validators/analytics.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard metrics and admin reports (system admin)
 */

/**
 * @swagger
 * /analytics/admin-report:
 *   get:
 *     summary: Generate platform summary report (System Admin)
 *     description: Aggregated counts for users, pharmacies, requests, orders, and inventory. Optional date range filters order and request metrics by createdAt.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Inclusive start of createdAt range (ISO 8601)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Inclusive end of createdAt range (ISO 8601)
 *     responses:
 *       200:
 *         description: Report payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/admin-report',
  authenticate,
  authorize(UserRole.SYSTEM_ADMIN),
  validate(adminReportQuerySchema),
  AnalyticsController.getAdminReport
);

/**
 * @swagger
 * /analytics/admin-report/export:
 *   get:
 *     summary: Download admin report as CSV or PDF
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: File download
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/admin-report/export',
  authenticate,
  authorize(UserRole.SYSTEM_ADMIN),
  validate(adminReportExportQuerySchema),
  AnalyticsController.exportAdminReport
);

export default router;
