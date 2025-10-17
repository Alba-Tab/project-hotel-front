import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cuenta-fidelizacion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './cuenta-fidelizacion-dialog.component.html',
  styleUrls: ['./cuenta-fidelizacion-dialog.component.scss'],
})
export class CuentaFidelizacionDialogComponent {
  form: FormGroup;
  usuarios: any[] = [];

  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CuentaFidelizacionDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      cliente: ['', Validators.required],
      fidelizacion: ['', Validators.required],
    });

    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.apiService.listar<any>('usuarios').subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  guardar() {
    if (this.form.valid) {
      const formData = this.form.value;

      this.apiService.crear('fidelizacion/cuentas', formData).subscribe({
        next: (response) => {
          this.snackBar.open('Cuenta creada exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(response);
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.error || 'Error al crear la cuenta',
            'Cerrar',
            {
              duration: 3000,
            }
          );
        },
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
