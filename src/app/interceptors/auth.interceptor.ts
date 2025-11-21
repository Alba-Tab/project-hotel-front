import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { TenantService } from '../services/tenant.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const tenantService = inject(TenantService);
  const token = localStorage.getItem('access_token');

  console.log('🔄 Interceptor ejecutándose para:', req.url);
  console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');

  // ⚡ RUTAS COMPLETAMENTE PÚBLICAS - NO requieren tenant NI token (schema public)
  const publicRoutesNoTenant = [
    '/api/public/',
    '/api/suscripciones/',
    '/api/planes/',
    '/health/',
    '/api/debug/',
  ];

  // 🔓 RUTAS DE TENANT SIN AUTENTICACIÓN - Requieren tenant pero NO token
  const tenantRoutesNoAuth = [
    '/api/usuarios/login/',
    '/api/forgot-password',
    '/api/reset-password',
    '/api/verify',
  ];

  // Verificar el tipo de ruta
  const isPublicNoTenant = publicRoutesNoTenant.some((route) =>
    req.url.includes(route)
  );
  const isTenantNoAuth = tenantRoutesNoAuth.some((route) =>
    req.url.includes(route)
  );
  const isPrivateRoute = !isPublicNoTenant && !isTenantNoAuth;

  console.log('🔍 Tipo de ruta:', {
    publicNoTenant: isPublicNoTenant,
    tenantNoAuth: isTenantNoAuth,
    private: isPrivateRoute,
  });

  // 🔒 Construir headers dinámicamente
  const headers: any = {};

  // ✅ AGREGAR TENANT (en rutas de tenant sin auth y rutas privadas)
  if (isTenantNoAuth || isPrivateRoute) {
    const tenant = tenantService.getTenant();

    if (tenant) {
      headers['X-Tenant'] = tenant;
      console.log('🏨 Agregando X-Tenant header:', tenant);
    } else {
      console.warn(
        '⚠️ Ruta de tenant sin código de empresa - Redirigiendo a login'
      );
      router.navigate(['/authentication/login']);
      snackBar.open('Por favor ingrese su código de empresa', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar'],
      });
      return throwError(() => new Error('Tenant no configurado'));
    }
  } else if (isPublicNoTenant) {
    console.log('🌐 Ruta pública (schema public) - NO se agrega tenant');
  }

  // ✅ AGREGAR TOKEN DE AUTORIZACIÓN (solo en rutas privadas)
  if (token && isPrivateRoute) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Agregando Authorization header');
  } else if (!isPrivateRoute) {
    console.log('🚫 Ruta sin autenticación - NO agregar token');
  } else {
    console.log('❌ Sin token - petición sin autenticación');
  }

  // Clonar request con headers
  if (Object.keys(headers).length > 0) {
    req = req.clone({ setHeaders: headers });
  }

  // 🚨 Manejar errores HTTP globalmente
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 Error HTTP interceptado:', error);

      // 🔐 Token expirado o inválido
      if (error.status === 401) {
        console.log('🔐 Error 401 - Token expirado');
        localStorage.removeItem('access_token');
        snackBar.open(
          'Sesión expirada. Por favor, inicia sesión nuevamente.',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
        router.navigate(['/authentication/login']);
      }

      // 🚫 Sin permisos
      else if (error.status === 403) {
        console.log('🚫 Error 403 - Sin permisos');
        snackBar.open(
          'No tienes permisos para realizar esta acción.',
          'Cerrar',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
          }
        );
      }

      // 🌐 Errores de servidor
      else if (error.status >= 500) {
        console.log('🌐 Error de servidor:', error.status);
        snackBar.open(
          'Error del servidor. Intenta nuevamente en unos momentos.',
          'Cerrar',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
          }
        );
      }

      // 📡 Error de red
      else if (error.status === 0) {
        console.log('📡 Error de conexión');
        snackBar.open('Error de conexión. Verifica tu internet.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      }

      // 🔍 Recurso no encontrado
      else if (error.status === 404) {
        console.log('🔍 Error 404 - Recurso no encontrado');
        snackBar.open('Recurso no encontrado.', 'Cerrar', {
          duration: 3000,
          panelClass: ['warning-snackbar'],
        });
      }

      // ⚠️ Otros errores del cliente (400-499)
      else if (error.status >= 400 && error.status < 500) {
        console.log('⚠️ Error del cliente:', error.status);
        const mensaje =
          error.error?.message ||
          error.error?.detail ||
          'Error en la solicitud.';
        snackBar.open(mensaje, 'Cerrar', {
          duration: 4000,
          panelClass: ['warning-snackbar'],
        });
      }

      // 🔄 Re-lanzar el error para que los componentes puedan manejarlo si necesitan
      return throwError(() => error);
    })
  );
};
