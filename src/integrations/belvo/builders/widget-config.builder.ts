import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WidgetConfiguration,
  IdentificationInfo,
  FiscalMexicoWidgetConfiguration
} from '../interfaces/belvo-widget.interface';

@Injectable()
export class WidgetConfigBuilder {
  constructor(private readonly config: ConfigService) {}

  build(identificationInfo: IdentificationInfo[]): WidgetConfiguration {
    const termsUrl = this.config.get<string>('belvo.widget.termsAndConditionsUrl');

    if (!termsUrl || termsUrl === 'https://www.your_terms_and_conditions.com') {
      throw new Error('BELVO_WIDGET_TERMS_CONDITIONS_URL must be configured with a valid URL in your .env file');
    }

    return {
      openfinance_feature: 'consent_link_creation',
      callback_urls: {
        success: this.config.get<string>('belvo.widget.callbackSuccess'),
        exit: this.config.get<string>('belvo.widget.callbackExit'),
        event: this.config.get<string>('belvo.widget.callbackEvent'),
      },
      branding: {
        company_icon: this.config.get<string>('belvo.widget.companyIcon'),
        company_logo: this.config.get<string>('belvo.widget.companyLogo'),
        company_name: this.config.get<string>('belvo.widget.companyName'),
        company_terms_url: this.config.get<string>('belvo.widget.companyTermsUrl'),
        overlay_background_color: this.config.get<string>('belvo.widget.overlayBackgroundColor'),
        social_proof: this.config.get<boolean>('belvo.widget.socialProof'),
      },
      consent: {
        purpose: this.config.get<string>('belvo.widget.consentPurpose'),
        terms_and_conditions_url: termsUrl,
        permissions: ['REGISTER', 'ACCOUNTS', 'CREDIT_CARDS', 'CREDIT_OPERATIONS'],
        identification_info: identificationInfo,
      },
    };
  }

  buildForCustomer(customerName: string, cpf?: string, cnpj?: string): WidgetConfiguration {
    const identificationInfo: IdentificationInfo[] = [];

    if (cpf) {
      identificationInfo.push({
        type: 'CPF',
        number: cpf,
        name: customerName,
      });
    }

    if (cnpj) {
      identificationInfo.push({
        type: 'CNPJ',
        number: cnpj,
        name: customerName,
      });
    }

    if (identificationInfo.length === 0) {
      identificationInfo.push({
        type: 'CPF',
        number: '00000000000',
        name: customerName,
      });
    }

    return this.build(identificationInfo);
  }

  buildForFiscalMexico(): FiscalMexicoWidgetConfiguration {
    return {
      callback_urls: {
        success: this.config.get<string>('belvo.widget.callbackSuccess'),
        exit: this.config.get<string>('belvo.widget.callbackExit'),
        event: this.config.get<string>('belvo.widget.callbackEvent'),
      },
      branding: {
        company_icon: this.config.get<string>('belvo.widget.companyIcon'),
        company_logo: this.config.get<string>('belvo.widget.companyLogo'),
        company_name: this.config.get<string>('belvo.widget.companyName'),
        company_terms_url: this.config.get<string>('belvo.widget.companyTermsUrl'),
        overlay_background_color: this.config.get<string>('belvo.widget.overlayBackgroundColor'),
        social_proof: this.config.get<boolean>('belvo.widget.socialProof'),
      },
    };
  }
}
