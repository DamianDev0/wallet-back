import { registerAs } from '@nestjs/config';

export const belvoConfig = registerAs('belvo', () => ({
  secretId: process.env.BELVO_SECRET_ID,
  secretPassword: process.env.BELVO_SECRET_PASSWORD,
  apiUrl: process.env.BELVO_API_URL || 'https://api.belvo.com',
  environment: process.env.BELVO_ENVIRONMENT || 'sandbox',
}));
