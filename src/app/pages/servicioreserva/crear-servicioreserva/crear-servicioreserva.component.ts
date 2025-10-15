import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-crear-servicioreserva',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './crear-servicioreserva.component.html',
})
export class CrearServicioreservaComponent {
  servicioForm: FormGroup;
  isEditMode = false;
  servicioId?: number;
  enviando = false;

  // Listas para los selectores
  reservas: any[] = [];
  servicios: any[] = [];

  estados = [
    { value: 'solicitado', viewValue: 'Solicitado' },
    { value: 'confirmado', viewValue: 'Confirmado' },
    { value: 'en_proceso', viewValue: 'En Proceso' },
    { value: 'completado', viewValue: 'Completado' },
    { value: 'cancelado', viewValue: 'Cancelado' },
  ];

  private endpoint: string = 'servicioreserva/';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CrearServicioreservaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.servicio;
    this.servicioId = data?.servicio?.id;

    this.servicioForm = this.fb.group({
      reserva: [data?.servicio?.reserva || '', [Validators.required]],
      servicio: [data?.servicio?.servicio || '', [Validators.required]],
      folio_estancia: [
        data?.servicio?.folio_estancia || '',
        [Validators.required],
      ],
      cantidad: [
        data?.servicio?.cantidad || 1,
        [Validators.required, Validators.min(1)],
      ],
      precio_unitario: [
        data?.servicio?.precio_unitario || '',
        [Validators.required, Validators.min(0)],
      ],
      fecha_servicio: [
        data?.servicio?.fecha_servicio
          ? new Date(data.servicio.fecha_servicio)
          : new Date(),
        [Validators.required],
      ],
      estado: [data?.servicio?.estado || 'solicitado', [Validators.required]],
      observaciones: [data?.servicio?.observaciones || ''],
    });

    // Cargar datos para los selectores
    this.cargarReservas();
    this.cargarServicios();
  }

  cargarReservas() {
    this.apiService.listar<any>('reservas').subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
      },
    });
  }

  cargarServicios() {
    this.apiService.listar<any>('servicios').subscribe({
      next: (data) => {
        this.servicios = data;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
      },
    });
  }

  onSubmit() {
    if (this.enviando || this.servicioForm.invalid) return;

    this.enviando = true;
    const servicioData = {
      ...this.servicioForm.value,
      fecha_servicio: this.servicioForm.value.fecha_servicio.toISOString(),
    };

    const operation = this.isEditMode
      ? this.apiService.actualizar(
          this.endpoint,
          this.servicioId!,
          servicioData
        )
      : this.apiService.crear(this.endpoint, servicioData);

    operation.subscribe({
      next: (response) => {
        console.log(
          `Servicio ${this.isEditMode ? 'actualizado' : 'creado'}:`,
          response
        );
        this.enviando = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error:', error);
        this.enviando = false;
        alert('Error al procesar el servicio de reserva');
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
