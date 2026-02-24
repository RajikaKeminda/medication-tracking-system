"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const logger_1 = require("../utils/logger");
/**
 * NotificationService
 *
 * A mock implementation of SMS (Twilio) and Email (SendGrid) notification sending.
 * In production, replace the method bodies with the real Twilio SDK and
 * @sendgrid/mail SDK calls respectively, using credentials from `env`.
 *
 * Twilio reference: https://github.com/twilio/twilio-node
 * SendGrid reference: https://github.com/sendgrid/sendgrid-nodejs
 */
class NotificationService {
    // -----------------------------------------------------------------------
    // SMS (mock Twilio)
    // -----------------------------------------------------------------------
    /**
     * Send an SMS message to the patient's phone number.
     *
     * Production replacement:
     * ```ts
     * import twilio from 'twilio';
     * const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
     * await client.messages.create({ body, from: env.TWILIO_PHONE_NUMBER, to: phone });
     * ```
     */
    static async sendSms(phone, body) {
        // --- MOCK IMPLEMENTATION ---
        logger_1.logger.info(`[SMS Mock] To: ${phone} | Message: ${body}`);
        // Simulate async network call
        await Promise.resolve();
    }
    // -----------------------------------------------------------------------
    // Email (mock SendGrid)
    // -----------------------------------------------------------------------
    /**
     * Send a transactional email to the patient.
     *
     * Production replacement:
     * ```ts
     * import sgMail from '@sendgrid/mail';
     * sgMail.setApiKey(env.SENDGRID_API_KEY);
     * await sgMail.send({ to, from: 'noreply@medtracker.com', subject, html });
     * ```
     */
    static async sendEmail(to, subject, html) {
        // --- MOCK IMPLEMENTATION ---
        logger_1.logger.info(`[Email Mock] To: ${to} | Subject: ${subject} | Body: ${html}`);
        await Promise.resolve();
    }
    // -----------------------------------------------------------------------
    // Domain-level helpers — send both channels at once
    // -----------------------------------------------------------------------
    /** Notify a patient that their new request has been received. */
    static async notifyRequestCreated(opts) {
        const subject = 'Medication Request Received';
        const body = `Hi ${opts.patientName}, your request for "${opts.medicationName}" ` +
            `(ID: ${opts.requestId}) has been received and is pending review.`;
        await this.sendEmail(opts.email, subject, `<p>${body}</p>`);
        if (opts.phone)
            await this.sendSms(opts.phone, body);
    }
    /** Notify a patient whenever the status of their request changes. */
    static async notifyStatusChanged(opts) {
        const status = opts.newStatus.toUpperCase();
        const subject = `Medication Request Update — ${status}`;
        let body = `Hi ${opts.patientName}, your request for "${opts.medicationName}" ` +
            `(ID: ${opts.requestId}) has been updated to: ${status}.`;
        if (opts.notes)
            body += ` Notes: ${opts.notes}`;
        await this.sendEmail(opts.email, subject, `<p>${body}</p>`);
        if (opts.phone)
            await this.sendSms(opts.phone, body);
    }
    /** Notify a patient that their request has been cancelled. */
    static async notifyRequestCancelled(opts) {
        const subject = 'Medication Request Cancelled';
        const body = `Hi ${opts.patientName}, your request for "${opts.medicationName}" ` +
            `(ID: ${opts.requestId}) has been cancelled.`;
        await this.sendEmail(opts.email, subject, `<p>${body}</p>`);
        if (opts.phone)
            await this.sendSms(opts.phone, body);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map