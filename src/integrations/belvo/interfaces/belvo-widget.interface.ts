export interface WidgetTokenResponse {
  access: string;
  refresh?: string;
}

export interface WidgetConfiguration {
  access_mode?: 'single' | 'recurrent';
  external_id?: string;
  callback_url?: string;
  widget_type?: 'embedded' | 'standalone';
}
