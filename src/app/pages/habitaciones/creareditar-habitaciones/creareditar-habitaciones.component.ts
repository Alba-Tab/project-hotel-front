import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

interface Estado {
  value: string;
  viewValue: string;
}

interface Tipo {
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
  hoteles: any[] = []; // Lista de hoteles

  estados: Estado[] = [
    { value: 'disponible', viewValue: 'Disponible' },
    { value: 'ocupada', viewValue: 'Ocupada' },
    { value: 'mantenimiento', viewValue: 'Mantenimiento' },
    { value: 'reservada', viewValue: 'Reservada' },
  ];

  tipos: Tipo[] = [
    { value: 'individual', viewValue: 'Individual' },
    { value: 'doble', viewValue: 'Doble' },
    { value: 'suite', viewValue: 'Suite' },
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
      descripcion: [data?.habitacion?.descripcion || '', [Validators.required]],
      capacidad: [data?.habitacion?.capacidad || '', [Validators.required]],
      precio_noche: [
        data?.habitacion?.precio_noche || '',
        [Validators.required],
      ],
      estado: [data?.habitacion?.estado || 'disponible', [Validators.required]],
      tamanio: [data?.habitacion?.tamanio || '', [Validators.required]],
      tipo: [data?.habitacion?.tipo || 'individual', [Validators.required]],
    });

    // Cargar hoteles
    this.cargarHoteles();
  }

  cargarHoteles() {
    this.apiService.listar<any>('hoteles/hoteles/').subscribe({
      next: (data) => {
        this.hoteles = data;
      },
      error: (err) => {
        console.error('Error al cargar hoteles:', err);
      },
    });
  }

  onSubmit() {
    if (this.habitacionForm.valid) {
      const habitacion = this.habitacionForm.value;

      console.log('📤 Datos a enviar:', habitacion);

      const operation = this.isEditMode
        ? this.apiService.actualizar(
            'habitaciones',
            this.habitacionId!,
            habitacion
          )
        : this.apiService.crear('habitaciones', habitacion);

      operation.subscribe({
        next: (response) => {
          console.log(
            `✅ Habitacion ${this.isEditMode ? 'actualizada' : 'creada'}:`,
            response
          );
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('❌ Error completo:', error);
          console.error('📋 Detalles del error:', error.error);

          // Mostrar mensaje de error más descriptivo
          if (error.error && typeof error.error === 'object') {
            const errores = Object.entries(error.error)
              .map(([campo, mensajes]) => `${campo}: ${mensajes}`)
              .join('\n');
            alert(`Error en los datos:\n\n${errores}`);
          } else {
            alert(
              'Error al procesar la habitación. Revise los datos ingresados.'
            );
          }
        },
      });
    } else {
      console.log('⚠️ Formulario inválido');
      console.log('📋 Errores:', this.habitacionForm.errors);

      // Mostrar qué campos tienen errores
      Object.keys(this.habitacionForm.controls).forEach((key) => {
        const control = this.habitacionForm.get(key);
        if (control?.errors) {
          console.log(`Campo ${key}:`, control.errors);
        }
      });

      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  cancelar() {
    this.dialogRef.close();
    // this.router.navigate(['/habitaciones/habitacion']);
  }
}
