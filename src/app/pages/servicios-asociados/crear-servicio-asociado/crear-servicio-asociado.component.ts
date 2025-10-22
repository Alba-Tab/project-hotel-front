import { Component, Inject, OnInit } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-crear-servicio-asociado',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './crear-servicio-asociado.component.html',
  styleUrls: ['./crear-servicio-asociado.component.scss'],
})
export class CrearServicioAsociadoComponent implements OnInit {
  servicioForm: FormGroup;
  isEditMode = false;
  servicioId?: number;
  enviando = false;

  servicios: any[] = [];
  foliosEstancia: any[] = [];
  reservaAsociada?: number;

  estados = [
    { value: 'solicitado', viewValue: 'Solicitado' },
    { value: 'confirmado', viewValue: 'Confirmado' },
    { value: 'en_proceso', viewValue: 'En Proceso' },
    { value: 'completado', viewValue: 'Completado' },
    { value: 'cancelado', viewValue: 'Cancelado' },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CrearServicioAsociadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.servicio;
    this.servicioId = data?.servicio?.id;

    const ahora = new Date();
    const servicio = data?.servicio;

    this.servicioForm = this.fb.group({
      servicio: [servicio?.servicio || '', Validators.required],
      folioestancia: [
        {
          value: servicio?.folio_estancia || data?.folioEstancia || data?.folioEstanciaId || '',
          disabled: !!(data?.folioEstancia || data?.folioEstanciaId),
        },
        Validators.required,
      ],
      cantidad: [
        servicio?.cantidad || 1,
        [Validators.required, Validators.min(1)],
      ],
      precio_unitario: [
        servicio?.precio_unitario || '',
        [Validators.required, Validators.min(0)],
      ],
      monto_total: [servicio?.precio_unitario * servicio?.cantidad || 0],
      fecha: [
        servicio?.fecha_servicio ? new Date(servicio.fecha_servicio) : ahora,
        Validators.required,
      ],
      hora: [
        servicio?.fecha_servicio
          ? this.extraerHora(servicio.fecha_servicio)
          : this.getHoraActual(),
        [
          Validators.required,
          Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ],
      ],
      estado: [servicio?.estado || 'solicitado', Validators.required],
      observaciones: [servicio?.observaciones || ''],
    });

    this.configurarListeners();
  }

  ngOnInit() {
    this.cargarServicios();
    this.cargarFoliosEstancia();

    // ✅ Obtener el folio precargado (puede venir como folioEstancia o folioEstanciaId)
    const folioInicial = this.servicioForm.getRawValue().folioestancia || 
                         this.data?.folioEstancia || 
                         this.data?.folioEstanciaId;
    
    if (folioInicial) {
      // ✅ Cargar la reserva automáticamente cuando hay folio precargado
      setTimeout(() => this.obtenerReservaDelFolio(folioInicial), 500);
    }
  }

  private configurarListeners() {
    this.servicioForm
      .get('cantidad')
      ?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.servicioForm
      .get('precio_unitario')
      ?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.servicioForm
      .get('servicio')
      ?.valueChanges.subscribe((id) => this.cargarPrecioServicio(id));
    this.servicioForm
      .get('folioestancia')
      ?.valueChanges.subscribe((id) => this.obtenerReservaDelFolio(id));
  }

  private getHoraActual(): string {
    const ahora = new Date();
    return `${ahora.getHours().toString().padStart(2, '0')}:${ahora
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private extraerHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return `${fecha.getHours().toString().padStart(2, '0')}:${fecha
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private calcularPrecioTotal() {
    const cantidad = this.servicioForm.get('cantidad')?.value || 0;
    const precioUnitario = this.servicioForm.get('precio_unitario')?.value || 0;
    this.servicioForm
      .get('monto_total')
      ?.setValue(cantidad * precioUnitario, { emitEvent: false });
  }

  private cargarPrecioServicio(servicioId: number) {
    const servicio = this.servicios.find((s) => s.id === servicioId);
    if (servicio?.precio) {
      this.servicioForm.get('precio_unitario')?.setValue(servicio.precio);
    }
  }

  private obtenerReservaDelFolio(folioId: number) {
    if (!folioId) return;

    const folio = this.foliosEstancia.find((f) => f.id === folioId);
    if (folio) {
      this.reservaAsociada = folio.reserva_id || folio.reserva;
      console.log('✅ Reserva:', this.reservaAsociada);
    } else {
      this.apiService.obtener<any>('folioestancias', folioId).subscribe({
        next: (f) => {
          this.reservaAsociada = f.reserva_id || f.reserva;
          console.log('✅ Reserva (backend):', this.reservaAsociada);
        },
        error: (err) => console.error('❌ Error al obtener folio:', err),
      });
    }
  }

  cargarServicios() {
    this.apiService.listar<any>('servicios').subscribe({
      next: (data) => (this.servicios = data),
      error: (err) => console.error('Error al cargar servicios:', err),
    });
  }

  cargarFoliosEstancia() {
    this.apiService.listar<any>('folioestancias').subscribe({
      next: (data) => {
        this.foliosEstancia = (data || []).filter(
          (f: any) => f.estado?.toLowerCase() !== 'pagado'
        );
      },
      error: (err) => console.error('Error al cargar folios:', err),
    });
  }

  onSubmit() {
    if (this.enviando || this.servicioForm.invalid) {
      console.log('❌ Formulario inválido:', this.servicioForm.errors);
      return;
    }

    this.enviando = true;
    const formValues = this.servicioForm.getRawValue();

    console.log('🔍 Valores del formulario RAW:', formValues);
    console.log('🔍 Reserva asociada:', this.reservaAsociada);

    const [horas, minutos] = formValues.hora.split(':');
    const fechaHora = new Date(formValues.fecha);
    fechaHora.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    // Django espera nombres de campo sin _id para ForeignKeys
    const datos = {
      servicio: formValues.servicio,
      folioestancia: formValues.folioestancia,
      reserva: this.reservaAsociada,
      cantidad: parseInt(formValues.cantidad) || 1,
      estado: formValues.estado || 'solicitado',
      observaciones: formValues.observaciones || '',
      // monto_total y fecha_servicio se calculan en el backend
    };

    console.log('📤 DATOS A ENVIAR:', JSON.stringify(datos, null, 2));

    if (!datos.reserva || !datos.servicio || !datos.folioestancia) {
      console.error('❌ Validación falló:', {
        reserva: datos.reserva,
        servicio: datos.servicio,
        folioestancia: datos.folioestancia,
      });
      alert(
        `Error: Faltan campos requeridos\n- Servicio: ${datos.servicio}\n- Folio: ${datos.folioestancia}\n- Reserva: ${datos.reserva}`
      );
      this.enviando = false;
      return;
    }

    console.log('📤 Enviando:', datos);

    const operacion = this.isEditMode
      ? this.apiService.actualizar(
          'servicios-asociados',
          this.servicioId!,
          datos
        )
      : this.apiService.crear('servicios-asociados', datos);

    operacion.subscribe({
      next: (response) => {
        this.enviando = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.enviando = false;
        alert('Error al guardar el servicio');
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
