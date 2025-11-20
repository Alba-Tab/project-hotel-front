import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { TenantService } from '../../../services/tenant.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-side-login',
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private tenantService = inject(TenantService);

  // Signals para estado reactivo
  loading = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    tenant_code: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  async submit() {
    if (this.form.valid) {
      try {
        this.loading.set(true);
        this.errorMessage.set('');

        console.log('🔄 Iniciando login con:', this.form.value);

        //  guardar el tenant ANTES de hacer la petición
        const tenantCode = this.form.value.tenant_code;
        if (tenantCode) {
          this.tenantService.setTenant(tenantCode);
          console.log('🏨 Tenant guardado:', tenantCode);
        }

        //  preparar datos de login
        const loginData = {
          username: this.form.value.username,
          password: this.form.value.password,
        };

        // Llamar al endpoint de login usando ApiService
        const response = await firstValueFrom(
          this.apiService.crear<any>('usuarios/login', loginData)
        );

        console.log('✅ Login exitoso. Respuesta del servidor:', response);

        // Guardar tokens en localStorage
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          console.log('💾 Token de acceso guardado');
        }

        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
          console.log('💾 Token de refresh guardado');
        }

        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('💾 Datos del usuario guardados:', response.user);
        }

        // Redirigir al dashboard
        console.log('🚀 Redirigiendo al dashboard...');
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        console.error('❌ Error en login:', error);

        // Limpiar tenant si el login falla
        this.tenantService.clearTenant();

        // Mensajes de error específicos
        if (error.status === 401) {
          this.errorMessage.set(
            'Credenciales inválidas. Verifique usuario, contraseña y código de empresa.'
          );
        } else if (error.status === 404) {
          this.errorMessage.set(
            'Empresa no encontrada. Verifique el código de empresa.'
          );
        } else {
          this.errorMessage.set('Error al iniciar sesión. Intente nuevamente.');
        }
      } finally {
        this.loading.set(false);
      }
    } else {
      console.log('❌ Formulario inválido');
      this.errorMessage.set(
        'Por favor complete todos los campos correctamente.'
      );
    }
  }

  // Función para verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    console.log(
      '🔍 Verificando autenticación - Token:',
      token ? 'EXISTE' : 'NO EXISTE'
    );
    return !!token;
  }

  // Función para hacer logout
  logout() {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.tenantService.clearTenant(); // Limpiar tenant también
    console.log('🗑️ Tokens y tenant eliminados');
    this.router.navigate(['/authentication/login']);
  }
}
