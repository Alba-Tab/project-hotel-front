import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantDomainService } from './tenant-domain.service';

export interface Auditoria {
  id: number;
  actor: string | null;
  action: number;
  object_pk: string;
  content_type: string;
  changes: any;
  remote_addr: string | null;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private tenantDomainService: TenantDomainService
  ) {
    this.baseUrl = `${this.tenantDomainService.getTenantApiUrl()}/auditoria/`;
  }

  /**
   * Obtiene los registros de auditoría del tenant actual.
   * @param token JWT actual del usuario autenticado
   */
  getAuditorias(token: string): Observable<Auditoria[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Auditoria[]>(this.baseUrl, { headers });
  }
}
