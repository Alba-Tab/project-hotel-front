export interface RecomendacionHabitacion {
  habitacion_id: number;
  reservas_totales: number;
  noches_reservadas: number;
  porcentaje_ocupacion: number;
  ranking: number;
  recomendacion_porcentaje: number;
  precio_recomendado: number;
  motivo: string;
}

export interface RecomendacionesResponse {
  fecha_inicio: string;
  fecha_fin: string;
  dias_periodo: number;
  habitaciones: RecomendacionHabitacion[];
}
