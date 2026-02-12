import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantDomainService } from './tenant-domain.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  // private urlBase = environment.apiUrl; // 'http://localhost:3000/api'
  private urlBase = inject(TenantDomainService).getTenantApiUrl();

  /**
   * GET - Listar todos los registros
   */
  listar<T>(endpoint: string, parametros?: any): Observable<T> {
    const params = this.construirParametros(parametros);
    return this.http.get<T>(`${this.urlBase}/${endpoint}`, { params });
  }

  /**
   * GET - Obtener un registro por ID
   */
  obtener<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.urlBase}/${endpoint}/${id}`);
  }

  /**
   * POST - Crear nuevo registro
   */
  crear<T>(endpoint: string, datos: any): Observable<T> {
    return this.http.post<T>(`${this.urlBase}/${endpoint}/`, datos);
  }

  /**
   * PUT - Editar registro completo
   */
  editar<T>(endpoint: string, id: string | number, datos: any): Observable<T> {
    return this.http.put<T>(`${this.urlBase}/${endpoint}/${id}/`, datos);
  }

  /**
   * PATCH - Actualizar parcialmente
   */
  actualizar<T>(endpoint: string, id: string | number, datos: any): Observable<T> {
    return this.http.patch<T>(`${this.urlBase}/${endpoint}/${id}/`, datos);
  }

  /**
   * DELETE - Eliminar registro
   */
  eliminar<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http.delete<T>(`${this.urlBase}/${endpoint}/${id}/`);
  }

  /**
   * POST - Subir archivo
   */
  subirArchivo<T>(endpoint: string, archivo: File, datosAdicionales?: any): Observable<T> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    if (datosAdicionales) {
      Object.keys(datosAdicionales).forEach(clave => {
        formData.append(clave, datosAdicionales[clave]);
      });
    }

    return this.http.post<T>(`${this.urlBase}/${endpoint}/`, formData);
  }

  /**
   * POST - Generar reporte
   */
  generarReporte(endpoint: string, config: any): Observable<Blob> {
    return this.http.post(`${this.urlBase}/${endpoint}`, config, {
      responseType: 'blob',
    });
  }

  /**
   * GET - Obtener detalle del folio por ID
   */
  obtenerDetalleFolio(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/folioestancias/${id}/detalle-folio/`);
  }

  /**
   * Construir parámetros HTTP
   */
  private construirParametros(parametros?: any): HttpParams {
    let httpParams = new HttpParams();

    if (parametros) {
      Object.keys(parametros).forEach(clave => {
        const valor = parametros[clave];
        if (valor !== undefined && valor !== null && valor !== '') {
          httpParams = httpParams.set(clave, valor.toString());
        }
      });
    }

    return httpParams;
  }
}
