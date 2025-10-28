export interface ServicioAsociado {
  id?: number;
  reserva: number;
  servicio: number;
  folio_estancia: number;
  cantidad: number;
  precio_unitario: number;
  monto_total?: number;
  fecha_servicio: string;
  estado:
    | 'solicitado'
    | 'confirmado'
    | 'en_proceso'
    | 'completado'
    | 'cancelado';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServicioAsociadoForm {
  reserva: number;
  servicio: number;
  folio_estancia: number;
  cantidad: number;
  precio_unitario: number;
  monto_total: number;
  fecha: Date;
  hora: string;
  estado: string;
  observaciones: string;
}
