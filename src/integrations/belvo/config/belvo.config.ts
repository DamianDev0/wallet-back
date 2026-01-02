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
    widget: {
      companyIcon: process.env.BELVO_WIDGET_COMPANY_ICON || 'https://mysite.com/icon.svg',
      companyLogo: process.env.BELVO_WIDGET_COMPANY_LOGO || 'https://mysite.com/logo.svg',
      companyName: process.env.BELVO_WIDGET_COMPANY_NAME || 'ACME',
      companyTermsUrl: process.env.BELVO_WIDGET_COMPANY_TERMS_URL || 'https://belvo.com/terms-service/',
      termsAndConditionsUrl: process.env.BELVO_WIDGET_TERMS_CONDITIONS_URL || 'https://www.your_terms_and_conditions.com',
      overlayBackgroundColor: process.env.BELVO_WIDGET_OVERLAY_BG_COLOR || '#F0F2F4',
      socialProof: process.env.BELVO_WIDGET_SOCIAL_PROOF === 'true',
      consentPurpose: process.env.BELVO_WIDGET_CONSENT_PURPOSE || 'Soluções financeiras personalizadas por meio de recomendações sob medida para melhores ofertas de crédito.',
      callbackSuccess: process.env.BELVO_WIDGET_CALLBACK_SUCCESS || 'your_deeplink_here://success',
      callbackExit: process.env.BELVO_WIDGET_CALLBACK_EXIT || 'your_deeplink_here://exit',
      callbackEvent: process.env.BELVO_WIDGET_CALLBACK_EVENT || 'your_deeplink_here://error',
    },
  };
});
