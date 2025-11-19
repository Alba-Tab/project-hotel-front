/**
 * Interfaces para el módulo de Recomendaciones IA
 */

/**
 * Recomendación de tarifa generada por IA
 */
export interface RecomendacionIA {
  id: number;
  habitacion: number; // ID de la habitación real
  habitacion_detalle?: any; // Detalles completos de la habitación
  tarifa_actual: number | string; // Puede venir como string del backend
  tarifa_sugerida: number | string; // Puede venir como string del backend
  confianza: number | string; // Puede venir como string del backend
  cambio_absoluto?: number | string;
  cambio_porcentaje?: number | string;
  motivo?: string; // Razón de la recomendación
  fecha_generacion: string;
  aceptado?: boolean; // Si fue aceptada
  aplicada: boolean; // Si ya se aplicó

  // Campos legacy (compatibilidad)
  tipo_habitacion?: number;
  tipo_habitacion_display?: string;
  diferencia_porcentual?: number;
  tendencia?: 'aumento' | 'disminucion' | 'igual';
  razon?: string;
  estado?: 'pendiente' | 'aceptada' | 'rechazada';
  fecha_aplicacion?: string | null;
}

/**
 * Respuesta al listar recomendaciones
 */
export interface ListaRecomendacionesResponse {
  recomendaciones: RecomendacionIA[];
  total: number;
  fecha_generacion: string;
  estado_general: string;
}

/**
 * Request para generar nuevas recomendaciones
 */
export interface GenerarRecomendacionesRequest {
  forzar?: boolean;
  tipos_habitacion?: string[];
}

/**
 * Respuesta al generar recomendaciones
 */
export interface GenerarRecomendacionesResponse {
  mensaje: string;
  recomendaciones_generadas: number;
  fecha_generacion: string;
  modelo_utilizado: string;
  recomendaciones: RecomendacionIA[];
}

/**
 * Request para aceptar recomendaciones
 */
export interface AceptarRecomendacionesRequest {
  todas?: boolean;
  ids?: number[];
}

/**
 * Respuesta al aceptar recomendaciones
 */
export interface AceptarRecomendacionesResponse {
  mensaje: string;
  recomendaciones_aceptadas: number;
  tarifas_actualizadas: Array<{
    tipo_habitacion: string;
    tarifa_anterior: number;
    tarifa_nueva: number;
  }>;
}

/**
 * Request para rechazar recomendaciones
 */
export interface RechazarRecomendacionesRequest {
  todas?: boolean;
  ids?: number[];
  motivo?: string;
}

/**
 * Respuesta al rechazar recomendaciones
 */
export interface RechazarRecomendacionesResponse {
  mensaje: string;
  recomendaciones_rechazadas: number;
}

/**
 * Evento del historial
 */
export interface EventoHistorial {
  id: number;
  tipo: 'modelo_entrenado' | 'actualizacion_automatica' | 'analisis_demanda' | 'recomendacion_aceptada' | 'recomendacion_rechazada';
  tipo_display: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  detalles: {
    precios_ajustados?: number;
    recomendaciones_aplicadas?: number;
    periodo_detectado?: string;
    tipos_habitacion?: string[];
    [key: string]: any;
  };
  icono?: string;
  color?: string;
}

/**
 * Respuesta del historial
 */
export interface HistorialRecomendacionesResponse {
  eventos: EventoHistorial[];
  total: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Filtros para el historial
 */
export interface FiltrosHistorial {
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo?: string;
  page?: number;
  page_size?: number;
}

/**
 * Estadísticas de recomendaciones
 */
export interface EstadisticasRecomendaciones {
  total_recomendaciones: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
  promedio_confianza: number;
  ultima_generacion: string;
  proxima_generacion?: string;
}
