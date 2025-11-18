import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantDomainService } from './tenant-domain.service';

@Injectable({
  providedIn: 'root',
})
export class HabitacionesService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private tenantDomainService: TenantDomainService
  ) {
    this.baseUrl = `${this.tenantDomainService.getTenantApiUrl()}/habitaciones/habitaciones/`;
  }

  getRecomendacionesPrecio(inicio?: string, fin?: string): Observable<any> {
    let url = `${this.baseUrl}recomendaciones-precio/`;

    const params: any = {};

    if (inicio) params.inicio = inicio;
    if (fin) params.fin = fin;

    return this.http.get<any>(url, { params });
  }
}
