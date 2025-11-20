import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { TenantForm, TenantResponse } from '../models/tenant.model';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private apiService = inject(ApiService);

  // BehaviorSubject para mantener el tenant en memoria y permitir suscripciones
  private tenantSubject = new BehaviorSubject<string | null>(
    this.getTenantFromStorage()
  );
  public tenant$ = this.tenantSubject.asObservable();

  private readonly TENANT_KEY = 'tenant_code';

  private getTenantFromStorage(): string | null {
    try {
      return localStorage.getItem(this.TENANT_KEY);
    } catch (error) {
      console.error('❌ Error al leer tenant de localStorage:', error);
      return null;
    }
  }

  setTenant(tenant: string): void {
    if (!tenant || tenant.trim() === '') {
      console.error('❌ TenantService.setTenant: Tenant vacío o inválido');
      return;
    }

    const tenantCode = tenant.trim().toLowerCase();

    try {
      localStorage.setItem(this.TENANT_KEY, tenantCode);
      this.tenantSubject.next(tenantCode);
      console.log('✅ Tenant guardado correctamente:', tenantCode);
    } catch (error) {
      console.error('❌ Error al guardar tenant en localStorage:', error);
    }
  }

  // Obtener el tenant actual (desde memoria o localStorage)

  getTenant(): string | null {
    const tenant = this.tenantSubject.value || this.getTenantFromStorage();

    if (!tenant) {
      console.warn('⚠️ No se encontró tenant en memoria ni en localStorage');
    }

    return tenant;
  }

  hasTenant(): boolean {
    const tenant = this.getTenant();
    return tenant !== null && tenant.trim() !== '';
  }

  clearTenant(): void {
    try {
      localStorage.removeItem(this.TENANT_KEY);
      this.tenantSubject.next(null);
      console.log('🗑️ Tenant eliminado correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar tenant:', error);
    }
  }

  registrarTenant(datos: TenantForm): Observable<TenantResponse> {
    console.log('🌐 TenantService - Datos recibidos:', datos);
    console.log('🌐 TenantService - plan_id:', datos.plan_id);
    console.log('🌐 TenantService - Tipo de plan_id:', typeof datos.plan_id);

    return this.apiService.crear<TenantResponse>('public/tenants-forms', datos);
  }
}
