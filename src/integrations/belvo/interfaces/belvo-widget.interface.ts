export interface WidgetTokenResponse {
  access: string;
  refresh?: string;
}

export interface WidgetTheme {
  css_key: string;
  value: string;
}

export interface WidgetCallbackUrls {
  success: string;
  exit: string;
  event: string;
}

export interface WidgetBranding {
  company_icon: string;
  company_logo: string;
  company_name: string;
  company_terms_url: string;
  overlay_background_color?: string;
  social_proof?: boolean;
}

export interface IdentificationInfo {
  type: 'CPF' | 'CNPJ';
  number: string | number;
  name: string;
}

export interface WidgetConsent {
  purpose: string;
  terms_and_conditions_url: string;
  permissions: ['REGISTER', 'ACCOUNTS', 'CREDIT_CARDS', 'CREDIT_OPERATIONS'];
  identification_info: IdentificationInfo[];
}

export interface WidgetConfiguration {
  openfinance_feature: 'consent_link_creation';
  callback_urls: WidgetCallbackUrls;
  branding: WidgetBranding;
  theme?: WidgetTheme[];
  consent: WidgetConsent;
}

export type FetchResource =
  | 'ACCOUNTS'
  | 'TRANSACTIONS'
  | 'OWNERS'
  | 'BILLS'
  | 'INVESTMENTS'
  | 'INVESTMENT_TRANSACTIONS'
  | 'EXHANGES'
  | 'INCOMES'
  | 'RECURRING_EXPENSES'
  | 'RISK_INSIGHTS';

export interface CreateWidgetTokenRequest {
  id: string;
  password: string;
  scopes: string;
  fetch_resources: FetchResource[];
  stale_in: string;
  widget: WidgetConfiguration;
}
