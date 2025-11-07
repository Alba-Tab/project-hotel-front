import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantDomainService } from './tenant-domain.service';
import {
  ReporteListItem,
  ReporteDefinition,
  ReportePreviewRequest,
  ReportePreviewResponse,
  ReporteExportRequest,
  ReporteEmailRequest
} from '../interfaces/reporte.interface';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private tenantDomainService = inject(TenantDomainService);

  private get baseUrl(): string {
    return `${this.tenantDomainService.getTenantApiUrl()}/habitaciones/reportes`;
  }

  /**
   * Obtener lista de reportes disponibles
   */
  obtenerReportes(): Observable<ReporteListItem[]> {
    return this.http.get<ReporteListItem[]>(`${this.baseUrl}/`);
  }

  /**
   * Obtener esquema de un reporte específico
   */
  obtenerEsquemaReporte(slug: string): Observable<ReporteDefinition> {
    return this.http.get<ReporteDefinition>(`${this.baseUrl}/${slug}/schema`);
  }

  /**
   * Generar vista previa del reporte
   */
  generarVistaPrevia(slug: string, request: ReportePreviewRequest): Observable<ReportePreviewResponse> {
    return this.http.post<ReportePreviewResponse>(`${this.baseUrl}/${slug}/preview`, request);
  }

  /**
   * Exportar reporte como archivo
   */
  exportarReporte(slug: string, request: ReporteExportRequest): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${slug}/export`, request, {
      responseType: 'blob'
    });
  }

  /**
   * Enviar reporte por email
   */
  enviarReportePorEmail(slug: string, request: ReporteEmailRequest): Observable<{success: boolean, message: string}> {
    return this.http.post<{success: boolean, message: string}>(`${this.baseUrl}/${slug}/email`, request);
  }
}
