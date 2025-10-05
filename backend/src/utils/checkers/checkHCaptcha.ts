const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY;

interface IHCaptchaResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string,
  hostname?: string,
  credit?: boolean
}

export async function checkHCaptcha(hcaptchaToken: string) {
  if (!hcaptchaToken) {
    return false;
  }
  const params = new URLSearchParams();
  params.append('response', hcaptchaToken);
  params.append('secret', HCAPTCHA_SECRET ?? '');
  const response = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const data = await response.json() as IHCaptchaResponse;
  return data.success
}