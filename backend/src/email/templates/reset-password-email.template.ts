import { SendEmailDto } from '../dto/email.dto';

type Params = {
  email: string;
  resetLink: string;
  name?: string;
};

export function resetPasswordEmailTemplate({
  email,
  resetLink,
  name,
}: Params): SendEmailDto {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  return {
    recipients: email,
    subject: 'Reset your password',
    devMessage: `Password reset link for ${email}: ${resetLink}`,
    text: `${greeting}

We received a request to reset your Project Manager password.

Open this link to choose a new password:

${resetLink}

This link expires in 5 minutes.

If you did not request a password reset, you can safely ignore this email.`,
    html: `
      <div style="margin: 0; padding: 32px 16px; background-color: #f4f7fb;">
        <div style="max-width: 560px; margin: 0 auto; font-family: Arial, sans-serif; color: #1f2937;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 10px 18px; border-radius: 999px; background-color: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
              Project Manager
            </div>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 40px 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            <h1 style="margin: 0 0 20px; font-size: 28px; line-height: 1.2; color: #111827;">
              Reset your password
            </h1>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7; color: #374151;">
              ${greeting}
            </p>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #374151;">
              We received a request to reset your password. Use the button below to choose a new password.
            </p>

            <div style="margin: 0 0 24px; text-align: center;">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 22px; border-radius: 12px; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none;">
                Reset password
              </a>
            </div>

            <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.7; color: #4b5563;">
              This link expires in <strong>5 minutes</strong>.
            </p>
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>

          <div style="padding: 20px 8px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #6b7280;">
              This is an automated message from Project Manager. Please do not reply directly to this email.
            </p>
            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9ca3af;">
              Sent to ${email}
            </p>
          </div>
        </div>
      </div>
    `,
  };
}
