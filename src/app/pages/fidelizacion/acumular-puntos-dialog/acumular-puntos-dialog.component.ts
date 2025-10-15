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
import { ApiService } from '../../../services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-acumular-puntos-dialog',
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
  templateUrl: './acumular-puntos-dialog.component.html',
  styleUrls: ['./acumular-puntos-dialog.component.scss'],
})
export class AcumularPuntosDialogComponent {
  form: FormGroup;

  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AcumularPuntosDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      monto_gastado: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  guardar() {
    if (this.form.valid) {
      const { monto_gastado } = this.form.value;

      this.apiService
        .crear(`fidelizacion/cuentas/${this.data.cuenta.id}/acumular_puntos`, {
          monto_gastado,
        })
        .subscribe({
          next: (response: any) => {
            this.snackBar.open(
              `Se acumularon ${response.puntos_acumulados} puntos. Total: ${response.puntos_totales}`,
              'Cerrar',
              { duration: 5000 }
            );
            this.dialogRef.close(response);
          },
          error: (err) => {
            this.snackBar.open(
              err.error?.error || 'Error al acumular puntos',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
