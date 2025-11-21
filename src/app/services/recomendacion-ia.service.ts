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

  listarRecomendaciones(): Observable<ListaRecomendacionesResponse> {
    return this.apiService.listar<ListaRecomendacionesResponse>(this.endpoint);
  }


  generarRecomendaciones(datos: GenerarRecomendacionesRequest = {}): Observable<GenerarRecomendacionesResponse> {
    return this.apiService.crear<GenerarRecomendacionesResponse>(`${this.endpoint}/generar`, datos);
  }


  obtenerEstadisticas(): Observable<EstadisticasRecomendaciones> {
    return this.apiService.listar<EstadisticasRecomendaciones>(`${this.endpoint}/estadisticas`);
  }

  entrenarIA(tipo: string) {
    return this.apiService.crear(`${this.endpoint}/entrenar`, { tipo
    });
}

}
