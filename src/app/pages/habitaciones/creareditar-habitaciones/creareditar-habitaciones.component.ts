import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';



interface Estado {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-creareditar-habitaciones',
  imports: [
    CommonModule,
    FormsModule,

    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
  templateUrl: './creareditar-habitaciones.component.html',
})
export class CreareditarHabitacionesComponent {

  habitacionForm: FormGroup;
  isEditMode = false;
  habitacionId?: number;

  estados: Estado[] = [
    { value: 'Activo', viewValue: 'Activo' },
    { value: 'Inactivo', viewValue: 'Inactivo' },
  ];


  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreareditarHabitacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.isEditMode = !!data?.habitacion;
    this.habitacionId = data?.habitacion?.id;

    this.habitacionForm = this.fb.group({
      hotel: [data?.habitacion?.hotel || '', [Validators.required]],
      numero: [data?.habitacion?.numero || '', [Validators.required]],
      descripcion: [data?.habitacion?.descripcion ||'', [Validators.required]],
      capacidad: [data?.habitacion?.capacidad ||'', [Validators.required]],
      precio_noche: [data?.habitacion?.precio_noche ||'', [Validators.required]],
      estado: [data?.habitacion?.estado ||'Activo', [Validators.required]],
      tamanio: [data?.habitacion?.tamanio ||'', [Validators.required]],
      tipo: [data?.habitacion?.tipo ||'', [Validators.required]],
    })
  }

  onSubmit() {
    if (this.habitacionForm.valid) {
      const habitacion = this.habitacionForm.value;

      const operation = this.isEditMode
        ? this.apiService.actualizar('habitaciones', this.habitacionId!, habitacion)
        : this.apiService.crear('habitaciones', habitacion);

      operation.subscribe({
        next: (response) => {
          console.log(`Habitacion ${this.isEditMode ? 'actualizado':'creado'}:`, response);
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.log('Error', error);
        }
      })


    } else {
      console.log('Formulario invalido');
    }
  }

  cancelar() {
    this.dialogRef.close();
    // this.router.navigate(['/habitaciones/habitacion']);
  }

}
