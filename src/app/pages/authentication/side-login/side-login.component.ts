import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Signals para estado reactivo
  loading = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
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

        // Llamar al endpoint de login usando ApiService
        const response = await firstValueFrom(
          this.apiService.crear<any>('usuarios/login', this.form.value)
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
        this.errorMessage.set('Credenciales inválidas. Verifique usuario y contraseña.');
      } finally {
        this.loading.set(false);
      }
    } else {
      console.log('❌ Formulario inválido');
      this.errorMessage.set('Por favor complete todos los campos correctamente.');
    }
  }

  // Función para verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    console.log('🔍 Verificando autenticación - Token:', token ? 'EXISTE' : 'NO EXISTE');
    return !!token;
  }

  // Función para hacer logout
  logout() {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    console.log('🗑️ Tokens eliminados');
    this.router.navigate(['/authentication/login']);
  }
}
