import { Component, Inject, inject } from '@angular/core';
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
import { ApiService } from '../../../services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fidelizacion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './fidelizacion-dialog.component.html',
  styleUrls: ['./fidelizacion-dialog.component.scss'],
})
export class FidelizacionDialogComponent {
  form: FormGroup;
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<FidelizacionDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: [this.data.programa?.nombre || '', Validators.required],
      descripcion: [this.data.programa?.descripcion || '', Validators.required],
      descuento_maximo: [
        this.data.programa?.descuento_maximo || '',
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      puntos_por_dolar_descuento: [
        this.data.programa?.puntos_por_dolar_descuento || 100,
        [Validators.required, Validators.min(1)],
      ],
      activo: [
        this.data.programa?.activo !== undefined
          ? this.data.programa.activo
          : true,
      ],
    });
  }

  guardar() {
    if (this.form.valid) {
      const formData = this.form.value;

      if (this.data.programa) {
        // Editar programa existente
        this.apiService
          .actualizar('fidelizacion/programas', this.data.programa.id, formData)
          .subscribe({
            next: (response) => {
              this.snackBar.open(
                'Programa actualizado exitosamente',
                'Cerrar',
                {
                  duration: 3000,
                }
              );
              this.dialogRef.close(response);
            },
            error: (err) => {
              this.snackBar.open('Error al actualizar el programa', 'Cerrar', {
                duration: 3000,
              });
            },
          });
      } else {
        // Crear nuevo programa
        this.apiService.crear('fidelizacion/programas', formData).subscribe({
          next: (response) => {
            this.snackBar.open('Programa creado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.dialogRef.close(response);
          },
          error: (err) => {
            this.snackBar.open('Error al crear el programa', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
