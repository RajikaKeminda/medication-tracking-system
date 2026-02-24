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
export declare class NotificationService {
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
    static sendSms(phone: string, body: string): Promise<void>;
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
    static sendEmail(to: string, subject: string, html: string): Promise<void>;
    /** Notify a patient that their new request has been received. */
    static notifyRequestCreated(opts: {
        email: string;
        phone?: string;
        patientName: string;
        medicationName: string;
        requestId: string;
    }): Promise<void>;
    /** Notify a patient whenever the status of their request changes. */
    static notifyStatusChanged(opts: {
        email: string;
        phone?: string;
        patientName: string;
        medicationName: string;
        requestId: string;
        newStatus: string;
        notes?: string;
    }): Promise<void>;
    /** Notify a patient that their request has been cancelled. */
    static notifyRequestCancelled(opts: {
        email: string;
        phone?: string;
        patientName: string;
        medicationName: string;
        requestId: string;
    }): Promise<void>;
}
//# sourceMappingURL=notification.service.d.ts.map