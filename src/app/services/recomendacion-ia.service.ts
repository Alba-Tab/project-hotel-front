import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  RecomendacionIA,
  ListaRecomendacionesResponse,
  GenerarRecomendacionesRequest,
  GenerarRecomendacionesResponse,
  AceptarRecomendacionesRequest,
  AceptarRecomendacionesResponse,
  RechazarRecomendacionesRequest,
  RechazarRecomendacionesResponse,
  HistorialRecomendacionesResponse,
  FiltrosHistorial,
  EstadisticasRecomendaciones
} from '../interfaces/recomendacion-ia.interface';

@Injectable({
  providedIn: 'root'
})
export class RecomendacionIAService {
  private apiService = inject(ApiService);
  private readonly endpoint = 'ia/recomendar';

  /**
   * Obtener lista de recomendaciones actuales
   */
  listarRecomendaciones(): Observable<ListaRecomendacionesResponse> {
    return this.apiService.listar<ListaRecomendacionesResponse>(this.endpoint);
  }

  /**
   * Generar nuevas recomendaciones con IA
   * @param datos Configuración para la generación
   */
  generarRecomendaciones(datos: GenerarRecomendacionesRequest = {}): Observable<GenerarRecomendacionesResponse> {
    return this.apiService.crear<GenerarRecomendacionesResponse>(`${this.endpoint}/generar`, datos);
  }

  /**
   * Aceptar recomendaciones (todas o específicas)
   * @param datos IDs específicos o todas
   */
  aceptarRecomendaciones(datos: AceptarRecomendacionesRequest): Observable<AceptarRecomendacionesResponse> {
    return this.apiService.crear<AceptarRecomendacionesResponse>(`${this.endpoint}/aceptar`, datos);
  }

  /**
   * Rechazar recomendaciones (todas o específicas)
   * @param datos IDs específicos o todas
   */
  rechazarRecomendaciones(datos: RechazarRecomendacionesRequest): Observable<RechazarRecomendacionesResponse> {
    return this.apiService.crear<RechazarRecomendacionesResponse>(`${this.endpoint}/rechazar`, datos);
  }

  /**
   * Obtener historial de cambios y eventos
   * @param filtros Filtros opcionales (fecha_desde, fecha_hasta, tipo)
   */
  obtenerHistorial(filtros?: FiltrosHistorial): Observable<HistorialRecomendacionesResponse> {
    return this.apiService.listar<HistorialRecomendacionesResponse>(`${this.endpoint}/historial`, filtros);
  }

  /**
   * Obtener estadísticas generales
   */
  obtenerEstadisticas(): Observable<EstadisticasRecomendaciones> {
    return this.apiService.listar<EstadisticasRecomendaciones>(`${this.endpoint}/estadisticas`);
  }
}
