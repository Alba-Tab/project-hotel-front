import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { TenantService } from '../../services/tenant.service';
import { TenantForm } from '../../models/tenant.model';
import { PlanSeleccionado } from '../../interfaces/planes.interface';

@Component({
  selector: 'app-tenant-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './tenant-register.component.html',
  styleUrls: ['./tenant-register.component.scss'],
})
export class TenantRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  formulario: FormGroup;
  enviando = false;
  ocultarPassword = true;
  planSeleccionado: PlanSeleccionado | null = null;

  constructor() {
    this.formulario = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nombre_empresa: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      plan_suscripcion: [''], // Campo oculto para el plan
    });
  }

  ngOnInit(): void {
    // Obtener el plan del state de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (history.state as any);

    if (state && state.planSeleccionado) {
      this.planSeleccionado = state.planSeleccionado;
      this.formulario.patchValue({
        plan_suscripcion: this.planSeleccionado?.planId || null,
      });
    }
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mostrarError('Por favor complete todos los campos correctamente');
      return;
    }

    this.enviando = true;
    const datos: TenantForm = this.formulario.value;

    this.tenantService.registrarTenant(datos).subscribe({
      next: (response: any) => {
        // Mostrar el mensaje de la respuesta si existe
        const mensaje = response?.message || 'Tenant creado exitosamente';
        this.mostrarExito(mensaje);
        console.log('Respuesta completa:', response);

        this.formulario.reset();
        this.enviando = false;

        setTimeout(() => {
          this.router.navigate(['/principal']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.enviando = false;

        // Intentar extraer mensaje de error más específico
        let mensajeError = 'No se pudo crear el tenant';

        if (error.error) {
          if (typeof error.error === 'string') {
            mensajeError = error.error;
          } else if (error.error.message) {
            mensajeError = error.error.message;
          } else if (error.error.detail) {
            mensajeError = error.error.detail;
          } else if (error.error.error) {
            mensajeError = error.error.error;
          } else {
            // Si hay errores de validación por campo
            const errores = Object.keys(error.error)
              .map((key) => `${key}: ${error.error[key]}`)
              .join(', ');
            if (errores) mensajeError = errores;
          }
        } else if (error.message) {
          mensajeError = error.message;
        }

        this.mostrarError(mensajeError);
      },
    });
  }

  obtenerError(campo: string): string {
    const control = this.formulario.get(campo);

    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('email')) return 'Email inválido';
    if (control?.hasError('minlength')) {
      const min = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${min} caracteres`;
    }
    if (control?.hasError('pattern')) return 'Formato inválido (8 dígitos)';

    return '';
  }

  limpiar(): void {
    this.formulario.reset();
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}
