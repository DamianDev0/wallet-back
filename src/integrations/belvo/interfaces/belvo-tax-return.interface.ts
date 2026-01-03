export interface BelvoTaxReturn {
  id: string;
  link: string;
  collected_at: string;
  created_at: string;
  informacion_general: InformacionGeneral;
  sueldos_salarios: SueldosSalarios;
  servicios_profesionales: any;
  deducciones_personales: DeduccionesPersonales;
  determinacion_isr: DeterminacionISR;
  retenciones: Retenciones;
  dividendos: any;
  datos_informativos: DatosInformativos;
  pdf?: string;
}

export interface InformacionGeneral {
  ejercicio: string;
  tipo_declaracion: string;
  datos_generales: {
    rfc: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
}

export interface SueldosSalarios {
  ingresos_gravados: number;
  ingresos_exentos: number;
  subsidio_empleo: number;
  isr_retenido: number;
}

export interface DeduccionesPersonales {
  gastos_medicos: number;
  colegiaturas: number;
  intereses_hipotecarios: number;
  donativos: number;
  aportaciones_voluntarias: number;
  total_deducciones: number;
}

export interface DeterminacionISR {
  base_gravable: number;
  impuesto_cargo: number;
  subsidio_empleo: number;
  isr_pagar: number;
  isr_favor: number;
}

export interface Retenciones {
  isr_retenido: number;
  iva_retenido: number;
}

export interface DatosInformativos {
  cuentas_extranjero: any[];
  participacion_extranjero: any[];
  prestamos: any[];
}

export interface BelvoTaxReturnsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BelvoTaxReturn[];
}

export interface BelvoTaxReturnsRetrieveRequest {
  link: string;
  year_from: string;
  year_to: string;
  attach_pdf?: boolean;
  save_data?: boolean;
}
