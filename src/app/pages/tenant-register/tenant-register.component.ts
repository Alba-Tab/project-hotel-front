import { Component, inject } from '@angular/core';
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

import { TenantService } from '../../services/tenant.service';
import { TenantForm } from '../../models/tenant.model';

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
  ],
  templateUrl: './tenant-register.component.html',
  styleUrls: ['./tenant-register.component.scss'],
})
export class TenantRegisterComponent {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  formulario: FormGroup;
  enviando = false;
  ocultarPassword = true;

  constructor() {
    this.formulario = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nombre_empresa: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
    });
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
      next: (response) => {
        this.mostrarExito('Tenant creado exitosamente');
        console.log('Respuesta:', response);
        this.formulario.reset();
        this.enviando = false;

        setTimeout(() => {
          this.router.navigate(['/principal']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error:', error);
        const mensaje = error.error?.message || 'Error al crear el tenant';
        this.mostrarError(mensaje);
        this.enviando = false;
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
