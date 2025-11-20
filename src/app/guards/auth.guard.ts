import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { TenantService } from '../services/tenant.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tenantService = inject(TenantService);
  const token = localStorage.getItem('access_token');
  const tenant = tenantService.getTenant();

  console.log('🛡️ Auth Guard ejecutándose para ruta:', state.url);
  console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');
  console.log('🏨 Tenant encontrado:', tenant ? tenant : 'NO');

  // ✅ Validar que exista TANTO token COMO tenant
  if (token && tenant) {
    console.log('✅ Acceso permitido - Token y tenant válidos');
    return true;
  } else {
    // Determinar el mensaje de error específico
    if (!token && !tenant) {
      console.log('❌ Acceso denegado - Sin token ni tenant');
    } else if (!token) {
      console.log('❌ Acceso denegado - Sin token de autenticación');
    } else if (!tenant) {
      console.log('❌ Acceso denegado - Sin código de empresa (tenant)');
    }

    console.log('🔄 Redirigiendo a login');
    router.navigate(['/authentication/login']);
    return false;
  }
};
