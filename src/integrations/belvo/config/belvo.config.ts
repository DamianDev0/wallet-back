import { registerAs } from '@nestjs/config';

export const belvoConfig = registerAs('belvo', () => {
  const environment = process.env.BELVO_ENVIRONMENT || 'sandbox';
  const defaultUrl =
    environment === 'sandbox'
      ? 'https://sandbox.belvo.com'
      : 'https://api.belvo.com';

  return {
    secretId: process.env.BELVO_SECRET_ID,
    secretPassword: process.env.BELVO_SECRET_PASSWORD,
    apiUrl: process.env.BELVO_API_URL || defaultUrl,
    environment,
  };
});
