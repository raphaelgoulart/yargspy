import { EmailToken, Purpose } from "../../models/EmailToken";
import { isDev } from "../checkers/isDev";
import nodemailer from 'nodemailer'

export async function issueAndSendVerification(userId: string, email: string) {
  const { token } = await EmailToken.issue(userId, Purpose.Verify);
  const url = `${process.env.FRONTEND_URL}/#/${process.env.FRONTEND_VERIFY}`
  const link = `${url}/${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: 'Confirm your email',
    html: `
      <p>Hi,</p>
      <p>Please confirm your email by clicking the link below:</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>This link expires in 60 minutes.</p>
    `,
    text: `Confirm your email: ${link}`
  });
}

export async function issueAndSendReset(userId: string, email: string) {
  const { token } = await EmailToken.issue(userId, Purpose.Reset);
  const url = `${process.env.FRONTEND_URL}/#/${process.env.FRONTEND_RESET}`
  const link = `${url}/${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
    <p>We received a request to reset your password.</p>
    <p><a href="${link}">Reset password</a></p>
    <p>If you didn't request this, you can ignore this email. The link expires in 30 minutes.</p>
    `,
    text: `Reset your password: ${link}`
  });
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(data: { to: string; subject: string; html: string; text: string; }) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (isDev()) console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    console.log(data)
  }
};