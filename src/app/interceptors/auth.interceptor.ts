import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const token = localStorage.getItem('access_token');

  console.log('🔄 Interceptor ejecutándose para:', req.url);
  console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');

  // Endpoints que NO deben tener token de autorización
  const publicEndpoints = ['/usuarios/login/', '/usuarios/logout/' , '/public/tenants-forms/'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // 🏨 Extraer tenant del hostname
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  let tenantDomain = '';
  
  // Detectar subdominio
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    if (parts.length === 2 && parts[1] === 'localhost') {
      tenantDomain = parts[0]; // hotel1.localhost -> hotel1
    } else if (parts.length >= 3) {
      tenantDomain = parts[0]; // hotel1.tudominio.com -> hotel1
    }
  }

  // 🔒 Construir headers
  const headers: any = {};
  
  // Agregar tenant si existe
  if (tenantDomain) {
    headers['X-Tenant-Domain'] = tenantDomain;
    console.log('🏨 Agregando tenant header:', tenantDomain);
  }
  
  // Agregar token si es necesario
  if (token && !isPublicEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Agregando Authorization header');
  } else if (isPublicEndpoint) {
    console.log('🚫 Endpoint público - NO agregar token');
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
        snackBar.open('Sesión expirada. Por favor, inicia sesión nuevamente.', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        router.navigate(['/authentication/login']);
      }

      // 🚫 Sin permisos
      else if (error.status === 403) {
        console.log('🚫 Error 403 - Sin permisos');
        snackBar.open('No tienes permisos para realizar esta acción.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }

      // 🌐 Errores de servidor
      else if (error.status >= 500) {
        console.log('🌐 Error de servidor:', error.status);
        snackBar.open('Error del servidor. Intenta nuevamente en unos momentos.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }

      // 📡 Error de red
      else if (error.status === 0) {
        console.log('📡 Error de conexión');
        snackBar.open('Error de conexión. Verifica tu internet.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }

      // 🔍 Recurso no encontrado
      else if (error.status === 404) {
        console.log('🔍 Error 404 - Recurso no encontrado');
        snackBar.open('Recurso no encontrado.', 'Cerrar', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      }

      // ⚠️ Otros errores del cliente (400-499)
      else if (error.status >= 400 && error.status < 500) {
        console.log('⚠️ Error del cliente:', error.status);
        const mensaje = error.error?.message || error.error?.detail || 'Error en la solicitud.';
        snackBar.open(mensaje, 'Cerrar', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
      }

      // 🔄 Re-lanzar el error para que los componentes puedan manejarlo si necesitan
      return throwError(() => error);
    })
  );
};
