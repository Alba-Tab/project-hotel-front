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
      plan_id: [null], // Sin validación por ahora, la agregaremos después
    });
  }

  ngOnInit(): void {
    // Obtener el plan del state de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (history.state as any);

    console.log('🔍 State recibido:', state);

    if (state && state.planSeleccionado) {
      this.planSeleccionado = state.planSeleccionado;
      console.log('✅ Plan detectado:', this.planSeleccionado);

      // Asegurarnos de que planId sea un número
      const planId = Number(this.planSeleccionado?.planId);

      console.log('🔢 Plan ID convertido a número:', planId);

      if (planId && !isNaN(planId)) {
        this.formulario.patchValue({
          plan_id: planId,
        });

        // Agregar validación de requerido DESPUÉS de asignar el valor
        this.formulario.get('plan_id')?.setValidators([Validators.required]);
        this.formulario.get('plan_id')?.updateValueAndValidity();

        console.log('✅ Plan ID asignado al formulario');
      } else {
        console.error('❌ Plan ID inválido:', this.planSeleccionado?.planId);
      }

      console.log(
        '📝 Valor del formulario después de patchValue:',
        this.formulario.value
      );
      console.log(
        '🆔 Plan ID en formulario:',
        this.formulario.get('plan_id')?.value
      );
    } else {
      console.log('⚠️ No se encontró plan seleccionado en el state');
    }
  }

  onSubmit(): void {
    console.log('🚀 Iniciando submit...');
    console.log('📋 Estado del formulario:', {
      valid: this.formulario.valid,
      invalid: this.formulario.invalid,
      errors: this.formulario.errors,
      value: this.formulario.value,
    });

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      // Verificar específicamente el plan_id
      const planIdControl = this.formulario.get('plan_id');
      console.log('🆔 Estado de plan_id:', {
        value: planIdControl?.value,
        valid: planIdControl?.valid,
        errors: planIdControl?.errors,
      });

      if (!planIdControl?.value) {
        this.mostrarError('Debe seleccionar un plan de suscripción');
      } else {
        this.mostrarError('Por favor complete todos los campos correctamente');
      }
      return;
    }

    this.enviando = true;
    const datos: TenantForm = this.formulario.value;

    console.log('📦 Datos finales a enviar:', datos);
    console.log('🆔 Plan ID específico:', datos.plan_id);
    console.log('🔢 Tipo de plan_id:', typeof datos.plan_id);

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
      duration: 0, // No se cierra automáticamente - usuario debe cerrar manualmente
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 0, // No se cierra automáticamente - usuario debe cerrar manualmente
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}
