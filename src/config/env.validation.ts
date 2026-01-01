import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_SSL: Joi.string().valid('true', 'false').default('false'),

  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // Belvo
  BELVO_SECRET_ID: Joi.string().required(),
  BELVO_SECRET_PASSWORD: Joi.string().required(),
  BELVO_API_URL: Joi.string().default('https://api.belvo.com'),
  BELVO_ENVIRONMENT: Joi.string()
    .valid('sandbox', 'production')
    .default('sandbox'),
});
