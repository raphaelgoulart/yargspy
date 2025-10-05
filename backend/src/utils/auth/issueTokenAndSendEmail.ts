import { EmailToken, Purpose } from "../../models/EmailToken";
import { isDev } from "../checkers/isDev";

export async function issueAndSendVerification(userId: string, email: string) {
  const { token } = await EmailToken.issue(userId, Purpose.Verify);
  const url = 'https://yargspy.com/user/register' // TODO: fetch URL dynamically
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
  const url = 'https://yargspy.com/user/passwordReset' // TODO: fetch URL dynamically
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

async function sendEmail(data: { to: string; subject: string; html: string; text: string; }) {
  if (isDev()) {
    console.log(data)
  } else {
    // TODO: in prod, send via SES
  }
}
