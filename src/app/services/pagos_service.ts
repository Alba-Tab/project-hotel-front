import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantDomainService } from './tenant-domain.service';

@Injectable({
  providedIn: 'root',
})
export class PagosService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private tenantDomainService: TenantDomainService
  ) {
    // Usa el dominio del tenant actual detectado por tu servicio
    this.baseUrl = `${this.tenantDomainService.getTenantApiUrl()}/pagos/`;
  }

  getPagos(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  createPago(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updatePago(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${id}/`, data);
  }

  deletePago(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${id}/`);
  }
}
