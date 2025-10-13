import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  console.log('🛡️ Auth Guard ejecutándose para ruta:', state.url);
  console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');

  if (token) {
    console.log('✅ Acceso permitido');
    return true;
  } else {
    console.log('❌ Acceso denegado - Redirigiendo a login');
    router.navigate(['/authentication/login']);
    return false;
  }
};
