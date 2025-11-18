import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  NativeDateAdapter,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-reservas-form-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: './reservas-form-modal.html',
  styleUrl: './reservas-form-modal.scss',
})
export class ReservasFormModal {
  reservaForm: FormGroup;
  isEdit: boolean;
  habitaciones: any[] = [];
  habitacionesFiltradas: any[] = [];
  huespedes: any[] = [];
  hoteles: any[] = [];
  cargandoHabitaciones = false;
  cargandoHuespedes = false;
  cargandoHoteles = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ReservasFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data?.isEdit || false;

    // total deshabilitado y fijo en 0
    this.reservaForm = this.fb.group({
      fecha_entrada: ['', Validators.required],
      fecha_salida: ['', Validators.required],
      total: [
        { value: 0, disabled: true },
        [Validators.required, Validators.min(0)],
      ],
      estado: ['confirmada', Validators.required],
      huesped: ['', Validators.required],
      hotel: ['', Validators.required],
      habitacion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerHabitaciones();
    this.obtenerHuespedes();
    this.obtenerHoteles();

    // Escuchar cambios en el hotel para filtrar habitaciones
    this.reservaForm.get('hotel')?.valueChanges.subscribe((hotelId) => {
      this.filtrarHabitacionesPorHotel(hotelId);
      // Limpiar selección de habitación cuando cambia el hotel
      this.reservaForm.get('habitacion')?.setValue('');
    });

    if (this.isEdit && this.data?.reserva) {
      this.reservaForm.patchValue({
        // si vienen como string YYYY-MM-DD, el datepicker también acepta string ISO
        fecha_entrada: this.data.reserva.fecha_entrada,
        fecha_salida: this.data.reserva.fecha_salida,
        estado: this.data.reserva.estado ?? 'confirmada',
        huesped: this.data.reserva.huesped,
        hotel: this.data.reserva.hotel,
        habitacion: this.data.reserva.habitacion,
      });

      // ['habitacion', 'fecha_entrada', 'fecha_salida'].forEach((campo) => {
      //   this.reservaForm
      //     .get(campo)
      //     ?.valueChanges.subscribe(() => this.calcularTotal());
      // });
    }

    // aseguramos que total se muestre como 0 siempre
    this.reservaForm.get('habitacion')?.valueChanges.subscribe(() => {
      this.calcularTotal();
    });

    this.reservaForm.get('fecha_entrada')?.valueChanges.subscribe(() => {
      this.calcularTotal();
    });

    this.reservaForm.get('fecha_salida')?.valueChanges.subscribe(() => {
      this.calcularTotal();
    });
  }

  /** Filtrar habitaciones por hotel seleccionado */
  filtrarHabitacionesPorHotel(hotelId: number): void {
    if (!hotelId) {
      this.habitacionesFiltradas = [];
      return;
    }
    this.habitacionesFiltradas = this.habitaciones.filter(
      (hab) => hab.hotel === hotelId
    );
    this.habitacionesFiltradas = this.habitaciones.filter(
      (hab) => hab.estado == 'disponible'
    );
  }

  /** Cargar habitaciones desde la API */
  obtenerHabitaciones(): void {
    //const inicio = this.formatearFecha(
    //  this.reservaForm.get('fecha_entrada')?.value
    //);
    //const fin = this.formatearFecha(
    //  this.reservaForm.get('fecha_salida')?.value
    //);
    //const params = { inicio, fin }; // query params
    //console.log(params);
    this.cargandoHabitaciones = true;
    this.apiService.listar<any[]>('habitaciones').subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones || [];
        this.cargandoHabitaciones = false;
      },
      error: (error) => {
        console.error('Error al cargar habitaciones:', error);
        this.cargandoHabitaciones = false;
      },
    });
  }

  /** Cargar huéspedes desde la API */
  obtenerHuespedes(): void {
    this.cargandoHuespedes = true;
    this.apiService.listar<any[]>('usuarios').subscribe({
      next: (huespedes) => {
        this.huespedes = huespedes || [];
        this.cargandoHuespedes = false;
      },
      error: (error) => {
        console.error('Error al cargar huéspedes:', error);
        this.cargandoHuespedes = false;
      },
    });
  }

  /** Cargar hoteles desde la API */
  obtenerHoteles(): void {
    this.cargandoHoteles = true;
    this.apiService.listar<any[]>('hoteles').subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles || [];
        this.cargandoHoteles = false;
      },
      error: (error) => {
        console.error('Error al cargar hoteles:', error);
        this.cargandoHoteles = false;
      },
    });
  }
  /** Calcular total automáticamente al seleccionar habitación o fechas */
  calcularTotal(): void {
    const habitacion = this.reservaForm.get('habitacion')?.value;
    const fechaEntrada = this.reservaForm.get('fecha_entrada')?.value;
    const fechaSalida = this.reservaForm.get('fecha_salida')?.value;

    if (!habitacion || !fechaEntrada || !fechaSalida) {
      this.reservaForm.get('total')?.setValue(0);
      return;
    }

    const fechaIn = new Date(fechaEntrada);
    const fechaOut = new Date(fechaSalida);
    const noches = Math.max(
      1,
      Math.ceil(
        (fechaOut.getTime() - fechaIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Busca el precio de la habitación seleccionada
    const habSeleccionada = this.habitaciones.find(
      (h) => h.id === Number(habitacion)
    );

    const precio =
      habSeleccionada?.precio || habSeleccionada?.precio_noche || 0;
    const total = noches * precio;

    this.reservaForm.get('total')?.setValue(total.toFixed(2));
  }

  /** Enviar formulario (crear/actualizar) */
  enviarFormulario(): void {
    if (this.reservaForm.valid) {
      // incluir controles deshabilitados (total)
      const raw = this.reservaForm.getRawValue();

      const payload = {
        fecha_entrada: this.formatearFecha(raw.fecha_entrada),
        fecha_salida: this.formatearFecha(raw.fecha_salida),
        total: 0, // forzado a 0 siempre
        estado: raw.estado,
        huesped: Number(raw.huesped),
        hotel: Number(raw.hotel),
        habitacion: Number(raw.habitacion),
      };

      this.dialogRef.close(payload);
    } else {
      this.marcarCamposTocados();
    }
  }

  /** Cancelar y cerrar modal */
  cancelar(): void {
    this.dialogRef.close();
  }

  /** Marcar todos los campos como tocados para mostrar errores */
  private marcarCamposTocados(): void {
    Object.keys(this.reservaForm.controls).forEach((key) => {
      this.reservaForm.get(key)?.markAsTouched();
    });
  }

  /** Mensajes de error de validación */
  obtenerMensajeError(nombreCampo: string): string {
    const campo = this.reservaForm.get(nombreCampo);
    if (campo?.hasError('required')) {
      return `${this.obtenerEtiquetaCampo(nombreCampo)} es obligatorio`;
    }
    if (campo?.hasError('min')) {
      return `${this.obtenerEtiquetaCampo(
        nombreCampo
      )} debe ser un número positivo`;
    }
    return '';
  }

  /** Etiquetas legibles por campo */
  private obtenerEtiquetaCampo(nombreCampo: string): string {
    const labels: Record<string, string> = {
      fecha_entrada: 'La fecha de entrada',
      fecha_salida: 'La fecha de salida',
      total: 'El total',
      estado: 'El estado',
      huesped: 'El huésped',
      hotel: 'El hotel',
      habitacion: 'La habitación',
    };
    return labels[nombreCampo] || nombreCampo;
  }

  /** Asegura formato YYYY-MM-DD si el control tiene Date o string */
  private formatearFecha(valor: any): string {
    if (!valor) return '';
    // Si es Date
    if (Object.prototype.toString.call(valor) === '[object Date]') {
      const d = valor as Date;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    // Si ya viene como string (YYYY-MM-DD) lo normalizamos
    if (typeof valor === 'string') {
      return valor.substring(0, 10);
    }
    return '';
  }
}
