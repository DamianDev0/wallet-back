# Belvo Widget Integration

## Implementation Overview

This document shows how the Belvo Widget token is generated according to the official OFDA documentation.

## Example Request

When `getWidgetAccessToken()` is called, the following request is sent to Belvo:

```json
POST https://sandbox.belvo.com/api/token/
Content-Type: application/json
Authorization: Basic <base64(secretId:secretPassword)>

{
  "id": "042bc739-9cce-4f57-b49f-2d7f06f95e8c",
  "password": "1VD*cWtefCk0gijEATeYFF4lbyagVSPXCnva-oI24KwNh3hITGnp7Y-IHdGG4mYl",
  "scopes": "read_institutions,write_links,read_consents,write_consents,write_consent_callback,delete_consents",
  "fetch_resources": [
    "ACCOUNTS",
    "TRANSACTIONS",
    "OWNERS",
    "BILLS"
  ],
  "stale_in": "365d",
  "widget": {
    "openfinance_feature": "consent_link_creation",
    "callback_urls": {
      "success": "your_deeplink_here://success",
      "exit": "your_deeplink_here://exit",
      "event": "your_deeplink_here://error"
    },
    "branding": {
      "company_icon": "https://mysite.com/icon.svg",
      "company_logo": "https://mysite.com/logo.svg",
      "company_name": "ACME",
      "company_terms_url": "https://belvo.com/terms-service/",
      "overlay_background_color": "#F0F2F4",
      "social_proof": true
    },
    "consent": {
      "purpose": "Soluções financeiras personalizadas oferecidas por meio de recomendações sob medida, visando melhores ofertas de produtos financeiros e de crédito.",
      "terms_and_conditions_url": "https://www.your_terms_and_conditions.com",
      "permissions": [
        "REGISTER",
        "ACCOUNTS",
        "CREDIT_CARDS",
        "CREDIT_OPERATIONS"
      ],
      "identification_info": [
        {
          "type": "CPF",
          "number": "00000000000",
          "name": "Customer Full Name"
        }
      ]
    }
  }
}
```

## Response

```json
{
  "access": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
}
```

## Code Usage

```typescript
// In your controller or service
const tokenResponse = await customerFinancialService.getWidgetAccessToken(customerId);

// Returns
{
  "access_token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "customer_id": "uuid-customer-id",
  "external_id": "uuid-customer-id"
}
```

## Configuration

All widget settings can be customized via environment variables in `.env`:

```bash
# Branding
BELVO_WIDGET_COMPANY_ICON=https://mysite.com/icon.svg
BELVO_WIDGET_COMPANY_LOGO=https://mysite.com/logo.svg
BELVO_WIDGET_COMPANY_NAME=ACME
BELVO_WIDGET_COMPANY_TERMS_URL=https://belvo.com/terms-service/
BELVO_WIDGET_OVERLAY_BG_COLOR=#F0F2F4
BELVO_WIDGET_SOCIAL_PROOF=true

# Consent
BELVO_WIDGET_CONSENT_PURPOSE=Your custom purpose message
BELVO_WIDGET_TERMS_CONDITIONS_URL=https://www.your_terms_and_conditions.com

# Callbacks
BELVO_WIDGET_CALLBACK_SUCCESS=your_deeplink_here://success
BELVO_WIDGET_CALLBACK_EXIT=your_deeplink_here://exit
BELVO_WIDGET_CALLBACK_EVENT=your_deeplink_here://error
```

## Architecture

1. **WidgetConfigBuilder** - Builds the widget configuration from environment variables
2. **BelvoWidgetService** - Handles API communication with Belvo
3. **CustomerFinancialService** - Orchestrates the token generation for customers

## Adding CPF/CNPJ Support

To support real CPF/CNPJ values, add these fields to the Customer entity:

```typescript
@Column({ type: 'varchar', length: 14, nullable: true })
cpf?: string;

@Column({ type: 'varchar', length: 18, nullable: true })
cnpj?: string;
```

Then update the service call:

```typescript
const widgetConfig = this.widgetConfigBuilder.buildForCustomer(
  customer.fullName,
  customer.cpf,
  customer.cnpj
);
```
