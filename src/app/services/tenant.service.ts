import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TenantForm, TenantResponse } from '../models/tenant.model';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private apiService = inject(ApiService);

  /**
   * Registrar un nuevo tenant
   * @param datos Datos del formulario
   */
  registrarTenant(datos: TenantForm): Observable<TenantResponse> {
    console.log('🌐 TenantService - Datos recibidos:', datos);
    console.log('🌐 TenantService - plan_id:', datos.plan_id);
    console.log('🌐 TenantService - Tipo de plan_id:', typeof datos.plan_id);

    return this.apiService.crear<TenantResponse>('public/tenants-forms', datos);
  }
}
