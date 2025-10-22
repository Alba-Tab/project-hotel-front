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
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatListModule,
    MatCardModule,
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

  // Propiedades para búsqueda de huésped
  busquedaUsuario = '';
  usuariosFiltrados: any[] = [];
  usuarioSeleccionado: any = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ReservasFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data?.isEdit || false;

    // total deshabilitado pero calculado dinámicamente
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
    // Primero configurar los listeners
    this.configurarListeners();
    
    // Cargar datos
    this.cargarDatosIniciales();
  }

  private configurarListeners(): void {
    // Escuchar cambios en el hotel para filtrar habitaciones
    this.reservaForm.get('hotel')?.valueChanges.subscribe((hotelId) => {
      if (!this.isEdit || this.habitaciones.length > 0) {
        this.filtrarHabitacionesPorHotel(hotelId);
        // Solo limpiar la habitación si no estamos en modo edición
        if (!this.isEdit) {
          this.reservaForm.get('habitacion')?.setValue('');
        }
      }
    });

    // Listeners para calcular total
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

  private cargarDatosIniciales(): void {
    // Cargar todos los datos en paralelo
    Promise.all([
      this.obtenerHabitacionesPromise(),
      this.obtenerHuespedesPromise(),
      this.obtenerHotelesPromise()
    ]).then(() => {
      // Una vez que todos los datos están cargados, configurar el formulario para edición
      if (this.isEdit && this.data?.reserva) {
        this.configurarFormularioParaEdicion();
      }
    });
  }

  private configurarFormularioParaEdicion(): void {
    // Convertir fechas string a objetos Date para el datepicker
    const fechaEntrada = this.data.reserva.fecha_entrada ? new Date(this.data.reserva.fecha_entrada) : null;
    const fechaSalida = this.data.reserva.fecha_salida ? new Date(this.data.reserva.fecha_salida) : null;

    // Configurar valores del formulario incluyendo el total actual
    this.reservaForm.patchValue({
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida,
      estado: this.data.reserva.estado ?? 'confirmada',
      huesped: this.data.reserva.huesped,
      hotel: this.data.reserva.hotel,
      habitacion: this.data.reserva.habitacion,
    });

    // Establecer el total actual de la reserva
    this.reservaForm.get('total')?.setValue(parseFloat(this.data.reserva.total || '0'));

    // Establecer el huésped seleccionado en modo edición
    this.usuarioSeleccionado = this.huespedes.find(h => h.id === this.data.reserva.huesped) || null;

    // Obtener la habitación reservada y agregarla a la lista
    this.obtenerHabitacionReservada(this.data.reserva.habitacion, this.data.reserva.hotel);
  }

  /** Obtener la habitación que está reservada para incluirla en la lista */
  private obtenerHabitacionReservada(habitacionId: number, hotelId: number): void {
    this.apiService.obtener<any>('habitaciones', habitacionId).subscribe({
      next: (habitacionReservada: any) => {
        // Verificar si la habitación ya está en la lista de habitaciones disponibles
        const habitacionExiste = this.habitaciones.find(h => h.id === habitacionId);
        
        if (!habitacionExiste && habitacionReservada) {
          // Agregar la habitación reservada a la lista completa
          this.habitaciones.push(habitacionReservada);
        }
        
        // Filtrar habitaciones por el hotel seleccionado (incluyendo la reservada)
        this.filtrarHabitacionesPorHotel(hotelId);
        
        // Recalcular el total una vez que tenemos toda la información
        setTimeout(() => {
          this.calcularTotal();
        }, 100);
      },
      error: (error: any) => {
        console.error('Error al obtener habitación reservada:', error);
        // Aún así filtrar las habitaciones disponibles
        this.filtrarHabitacionesPorHotel(hotelId);
      }
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
  }

  /** Cargar habitaciones desde la API */
  obtenerHabitaciones(): void {
    this.cargandoHabitaciones = true;
    this.apiService.listar<any[]>('habitaciones/disponibles').subscribe({
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

  /** Versión Promise de obtenerHabitaciones */
  obtenerHabitacionesPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.cargandoHabitaciones = true;
      this.apiService.listar<any[]>('habitaciones/disponibles').subscribe({
        next: (habitaciones) => {
          this.habitaciones = habitaciones || [];
          this.cargandoHabitaciones = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar habitaciones:', error);
          this.cargandoHabitaciones = false;
          resolve();
        },
      });
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

  /** Versión Promise de obtenerHuespedes */
  obtenerHuespedesPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.cargandoHuespedes = true;
      this.apiService.listar<any[]>('usuarios').subscribe({
        next: (huespedes) => {
          this.huespedes = huespedes || [];
          this.cargandoHuespedes = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar huéspedes:', error);
          this.cargandoHuespedes = false;
          resolve();
        },
      });
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

  /** Versión Promise de obtenerHoteles */
  obtenerHotelesPromise(): Promise<void> {
    return new Promise((resolve) => {
      this.cargandoHoteles = true;
      this.apiService.listar<any[]>('hoteles').subscribe({
        next: (hoteles) => {
          this.hoteles = hoteles || [];
          this.cargandoHoteles = false;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar hoteles:', error);
          this.cargandoHoteles = false;
          resolve();
        },
      });
    });
  }
  /** Calcular total automáticamente al seleccionar habitación o fechas */
  calcularTotal(): void {
    const habitacion = this.reservaForm.get('habitacion')?.value;
    const fechaEntrada = this.reservaForm.get('fecha_entrada')?.value;
    const fechaSalida = this.reservaForm.get('fecha_salida')?.value;

    console.log('🧮 Calculando total:', { habitacion, fechaEntrada, fechaSalida, isEdit: this.isEdit });

    if (!habitacion || !fechaEntrada || !fechaSalida) {
      // En modo edición, mantener el total actual si no hay datos completos
      if (!this.isEdit) {
        this.reservaForm.get('total')?.setValue(0);
      }
      console.log('⚠️ Datos incompletos para calcular total');
      return;
    }

    const fechaIn = new Date(fechaEntrada);
    const fechaOut = new Date(fechaSalida);
    const noches = Math.max(
      1,
      Math.ceil((fechaOut.getTime() - fechaIn.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Busca el precio de la habitación seleccionada
    const habSeleccionada = this.habitaciones.find(
      (h) => h.id === Number(habitacion)
    );

    const precio = habSeleccionada?.precio || habSeleccionada?.precio_noche || 0;
    const total = noches * precio;

    console.log('💰 Cálculo:', { noches, precio, total: total.toFixed(2) });
    
    this.reservaForm.get('total')?.setValue(parseFloat(total.toFixed(2)));
  }

  /** Enviar formulario (crear/actualizar) */
  enviarFormulario(): void {
    if (this.reservaForm.valid) {
      // incluir controles deshabilitados (total)
      const raw = this.reservaForm.getRawValue();

      const payload = {
        fecha_entrada: this.formatearFecha(raw.fecha_entrada),
        fecha_salida: this.formatearFecha(raw.fecha_salida),
        total: parseFloat(raw.total) || 0, // usar el total calculado
        estado: raw.estado,
        huesped: Number(raw.huesped),
        hotel: Number(raw.hotel),
        habitacion: Number(raw.habitacion),
      };

      console.log('📝 Datos del formulario para enviar:', payload);
      console.log('🔄 Modo edición:', this.isEdit);
      
      this.dialogRef.close(payload);
    } else {
      console.log('❌ Formulario inválido:', this.reservaForm.errors);
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

  /** Filtrar huéspedes por nombre o apellido */
  filtrarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) {
      this.usuariosFiltrados = [];
      return;
    }

    const termino = this.busquedaUsuario.toLowerCase();
    this.usuariosFiltrados = this.huespedes.filter(usuario =>
      usuario.first_name?.toLowerCase().includes(termino) ||
      usuario.last_name?.toLowerCase().includes(termino)
    );
  }

  /** Seleccionar un huésped */
  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.busquedaUsuario = '';
    this.usuariosFiltrados = [];
    this.reservaForm.get('huesped')?.setValue(usuario.id);
  }

  /** Limpiar selección de huésped */
  limpiarSeleccion(): void {
    this.usuarioSeleccionado = null;
    this.busquedaUsuario = '';
    this.usuariosFiltrados = [];
    this.reservaForm.get('huesped')?.setValue('');
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
