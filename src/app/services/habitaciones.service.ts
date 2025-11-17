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
    this.baseUrl = `${this.tenantDomainService.getTenantApiUrl()}/habitaciones/`;
  }

  getRecomendacionesPrecio(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}recomendaciones-precio/`);
  }
}
