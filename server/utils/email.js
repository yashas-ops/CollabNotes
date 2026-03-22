import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  requireTLS: true,
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.error('[Email] CRITICAL: EMAIL_USER or EMAIL_PASS is not set!');
}

const transporter = nodemailer.createTransport(emailConfig);

transporter.verify()
  .then(() => console.log('[Email] SMTP connection verified and ready'))
  .catch(err => console.error('[Email] SMTP verification failed:', err.message));

/**
 * Send email with retry logic (up to 2 retries with backoff)
 */
async function sendWithRetry(mailOptions, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] Sent successfully:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: info.messageId
      });
      return info;
    } catch (error) {
      console.error(`[Email] Attempt ${attempt + 1} failed:`, error.message);
      if (attempt === retries) {
        console.error('[Email] All retries exhausted for:', mailOptions.to);
        throw error;
      }
      // Exponential backoff: 1s, 2s
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Fire-and-forget email sender — does NOT block the calling function.
 * Logs errors but never rejects back to the caller.
 */
export function sendEmailAsync(sendFn, ...args) {
  // Execute in background — caller does not await this
  sendFn(...args).catch(err => {
    console.error('[Email] Background send failed:', err.message);
  });
}

const emailFrom = process.env.EMAIL_FROM || 'CollabNotes <no-reply@collabnotes.com>';

export async function sendShareNotification(toEmail, documentTitle, documentLink, sharedByName) {
  if (!toEmail || !documentLink || !sharedByName) {
    throw new Error('Invalid email parameters');
  }

  const mailOptions = {
    from: emailFrom,
    to: toEmail,
    subject: `${sharedByName} shared "${documentTitle}" with you`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">CollabNotes</h2>
        <p>Hello,</p>
        <p><strong>${sharedByName}</strong> has shared a document with you:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${documentTitle}</h3>
          <p style="margin: 0; color: #666;">You have access to view and edit this document.</p>
        </div>
        <a href="${documentLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Open Document</a>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">This link will expire in 7 days.</p>
      </div>
    `
  };

  return sendWithRetry(mailOptions);
}

export async function sendInviteEmail(toEmail, documentTitle, documentLink, sharedByName) {
  if (!toEmail || !documentLink || !sharedByName) {
    throw new Error('Invalid email parameters');
  }

  const mailOptions = {
    from: emailFrom,
    to: toEmail,
    subject: `${sharedByName} invited you to join CollabNotes`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">CollabNotes</h2>
        <p>Hello,</p>
        <p><strong>${sharedByName}</strong> has invited you to collaborate on:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${documentTitle}</h3>
          <p style="margin: 0; color: #666;">Join CollabNotes to start collaborating!</p>
        </div>
        <a href="${documentLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join & View Document</a>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">Create your free account to access this document.</p>
      </div>
    `
  };

  return sendWithRetry(mailOptions);
}

export async function sendResetPasswordEmail(toEmail, resetLink) {
  if (!toEmail || !resetLink) {
    throw new Error('Invalid email parameters');
  }

  const mailOptions = {
    from: emailFrom,
    to: toEmail,
    subject: 'Reset your CollabNotes password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">CollabNotes</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        </div>
        <p style="color: #666;">This link will expire in 1 hour.</p>
        <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  };

  return sendWithRetry(mailOptions);
}
