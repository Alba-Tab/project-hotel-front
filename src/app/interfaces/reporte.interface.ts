export interface ReporteField {
  key: string;
  label: string;
  type: 'int' | 'str' | 'decimal' | 'date' | 'datetime' | 'bool';
  ops: string[];
}

export interface ReporteDefinition {
  slug: string;
  name: string;
  description: string;
  columns: ReporteField[];
  filterable: ReporteField[];
  default_ordering: string[];
}

export interface ReporteFiltro {
  field: string;
  op: string;
  value: any;
}

export interface ReportePreviewRequest {
  columns: string[];
  filters?: ReporteFiltro[];
  limit?: number;
  ordering?: string[];
}

export interface ReporteExportRequest extends ReportePreviewRequest {
  format: 'xlsx' | 'docx' | 'pdf';
}

export interface ReporteEmailRequest extends ReporteExportRequest {
  recipient_email: string;
  subject?: string;
  message?: string;
}

export interface ReportePreviewResponse {
  total: number;
  rows: any[];
}

export interface ReporteListItem {
  slug: string;
  name: string;
  description: string;
}