import { z } from 'zod';

const optionalDateString = z
  .union([z.string(), z.undefined()])
  .transform((s) => (s === undefined || s === '' ? undefined : s))
  .refine((s) => s === undefined || !Number.isNaN(Date.parse(s)), {
    message: 'Invalid date',
  });

export const adminReportQuerySchema = z
  .object({
    query: z.object({
      from: optionalDateString,
      to: optionalDateString,
    }),
  })
  .superRefine((data, ctx) => {
    const { from, to } = data.query;
    if (from && to && Date.parse(from) > Date.parse(to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '"from" must be before or equal to "to"',
        path: ['query', 'to'],
      });
    }
  });

export const adminReportExportQuerySchema = z
  .object({
    query: z.object({
      from: optionalDateString,
      to: optionalDateString,
      format: z.enum(['csv', 'pdf']),
    }),
  })
  .superRefine((data, ctx) => {
    const { from, to } = data.query;
    if (from && to && Date.parse(from) > Date.parse(to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '"from" must be before or equal to "to"',
        path: ['query', 'to'],
      });
    }
  });

export type AdminReportQuery = z.infer<typeof adminReportQuerySchema>['query'];

export type AdminReportExportQuery = z.infer<typeof adminReportExportQuerySchema>['query'];
