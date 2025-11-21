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
  selector: 'app-canjear-puntos-dialog',
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
  templateUrl: './canjear-puntos-dialog.component.html',
  styleUrls: ['./canjear-puntos-dialog.component.scss'],
})
export class CanjearPuntosDialogComponent {
  form: FormGroup;

  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CanjearPuntosDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      monto_descuento: ['', [Validators.required, Validators.min(0.01)]],
      total_cuenta: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  guardar() {
    if (this.form.valid) {
      const formData = this.form.value;

      this.apiService
        .crear(
          `fidelizacion/cuentas/${this.data.cuenta.id}/canjear_puntos`,
          formData
        )
        .subscribe({
          next: (response: any) => {
            this.snackBar.open(
              `Se canjearon ${response.puntos_canjeados} puntos. Descuento aplicado: $${response.descuento_aplicado}`,
              'Cerrar',
              { duration: 5000 }
            );
            this.dialogRef.close(response);
          },
          error: (err) => {
            this.snackBar.open(
              err.error?.error || 'Error al canjear puntos',
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
