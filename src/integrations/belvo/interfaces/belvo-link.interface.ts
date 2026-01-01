export interface BelvoLink {
  id: string;
  institution: string;
  access_mode: string;
  status: string;
  created_at: string;
  external_id?: string;
  created_by?: string;
}

export interface BelvoAccount {
  id: string;
  link: string;
  institution: {
    name: string;
    type: string;
  };
  collected_at: string;
  category: string;
  type: string;
  name: string;
  number: string;
  balance: {
    current: number;
    available: number;
  };
  currency: string;
  public_identification_name?: string;
  public_identification_value?: string;
}

export interface BelvoTransaction {
  id: string;
  account: {
    id: string;
    name: string;
  };
  collected_at: string;
  value_date: string;
  accounting_date: string;
  amount: number;
  balance: number;
  currency: string;
  description: string;
  observations?: string;
  merchant?: {
    name: string;
    logo?: string;
  };
  category: string;
  subcategory?: string;
  reference?: string;
  type: string;
  status: string;
}

export interface BelvoBalance {
  id: string;
  account: {
    id: string;
    name: string;
  };
  collected_at: string;
  value_date: string;
  balance: number;
  current_balance: number;
  available_balance?: number;
  currency: string;
}
