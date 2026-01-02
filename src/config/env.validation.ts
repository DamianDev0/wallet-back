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

  // Belvo Widget
  BELVO_WIDGET_COMPANY_ICON: Joi.string().uri().default('https://mysite.com/icon.svg'),
  BELVO_WIDGET_COMPANY_LOGO: Joi.string().uri().default('https://mysite.com/logo.svg'),
  BELVO_WIDGET_COMPANY_NAME: Joi.string().default('ACME'),
  BELVO_WIDGET_COMPANY_TERMS_URL: Joi.string().uri().default('https://belvo.com/terms-service/'),
  BELVO_WIDGET_TERMS_CONDITIONS_URL: Joi.string().uri().default('https://www.your_terms_and_conditions.com'),
  BELVO_WIDGET_OVERLAY_BG_COLOR: Joi.string().default('#F0F2F4'),
  BELVO_WIDGET_SOCIAL_PROOF: Joi.string().valid('true', 'false').default('true'),
  BELVO_WIDGET_CONSENT_PURPOSE: Joi.string().default('Soluções financeiras personalizadas oferecidas por meio de recomendações sob medida, visando melhores ofertas de produtos financeiros e de crédito.'),
  BELVO_WIDGET_CALLBACK_SUCCESS: Joi.string().default('your_deeplink_here://success'),
  BELVO_WIDGET_CALLBACK_EXIT: Joi.string().default('your_deeplink_here://exit'),
  BELVO_WIDGET_CALLBACK_EVENT: Joi.string().default('your_deeplink_here://error'),
});
