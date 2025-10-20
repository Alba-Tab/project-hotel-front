import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
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
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pagos-form-modal',
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
    MatCardModule,
    MatListModule,
    MatChipsModule,
  ],
  templateUrl: './pagos-form-modal.html',
  styleUrl: './pagos-form-modal.scss',
})
export class PagosFormModal implements OnInit {
  pagoForm: FormGroup;
  isEdit: boolean;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  folios: any[] = [];
  cargandoUsuarios = false;
  cargandoFolios = false;
  busquedaUsuario = '';
  usuarioSeleccionado: any = null;
  folioSeleccionado: any = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<PagosFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data?.isEdit || false;

    this.pagoForm = this.fb.group({
      monto: [0, [Validators.required, Validators.min(0.01)]],
      metodo: ['', Validators.required],
      referencia: ['', Validators.required],
      folio_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();

    if (this.isEdit && this.data?.pago) {
      this.pagoForm.patchValue({
        monto: this.data.pago.monto,
        metodo: this.data.pago.metodo,
        referencia: this.data.pago.referencia,
        folio_id: this.data.pago.folio_id,
      });
    }
  }

  /** Cargar usuarios desde la API */
  obtenerUsuarios(): void {
    this.cargandoUsuarios = true;
    this.apiService.listar<any[]>('usuarios').subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios || [];
        this.usuariosFiltrados = [...this.usuarios];
        this.cargandoUsuarios = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargandoUsuarios = false;
      },
    });
  }

  /** Filtrar usuarios por nombre */
  filtrarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    const termino = this.busquedaUsuario.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(usuario => 
      usuario.first_name?.toLowerCase().includes(termino) ||
      usuario.last_name?.toLowerCase().includes(termino) ||
      `${usuario.first_name} ${usuario.last_name}`.toLowerCase().includes(termino)
    );
  }

  /** Seleccionar usuario y cargar sus folios */
  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.busquedaUsuario = `${usuario.first_name} ${usuario.last_name}`;
    this.usuariosFiltrados = [];
    this.obtenerFoliosPorUsuario(usuario.id);
    // Limpiar selección de folio
    this.folioSeleccionado = null;
    this.pagoForm.get('folio_id')?.setValue('');
    this.pagoForm.get('monto')?.setValue('');
  }

  /** Cargar folios por usuario desde la API */
  obtenerFoliosPorUsuario(idUsuario: number): void {
    this.cargandoFolios = true;
    this.apiService.listar<any[]>('folioestancias/por-usuario', { id_usuario: idUsuario }).subscribe({
      next: (folios) => {
        this.folios = folios || [];
        this.cargandoFolios = false;
      },
      error: (error) => {
        console.error('Error al cargar folios:', error);
        this.cargandoFolios = false;
      },
    });
  }

  /** Seleccionar folio y calcular monto total */
  seleccionarFolio(folio: any): void {
    console.log('Folio seleccionado:', folio);
    this.folioSeleccionado = folio;
    this.pagoForm.get('folio_id')?.setValue(folio.id);
    
    // Obtener detalle del folio para calcular monto total
    console.log('Llamando a obtenerDetalleFolio con ID:', folio.id);
    this.apiService.obtenerDetalleFolio(folio.id).subscribe({
      next: (detalle) => {
        console.log('Detalle recibido del API:', detalle);
        const montoTotal = this.calcularMontoTotal(detalle);
        console.log('Monto total calculado:', montoTotal);
        this.pagoForm.get('monto')?.setValue(montoTotal);
        console.log('Valor en el formulario:', this.pagoForm.get('monto')?.value);
      },
      error: (error) => {
        console.error('Error al obtener detalle del folio:', error);
      }
    });
  }

  /** Calcular monto total sumando servicios_reservas + total de la reserva */
  calcularMontoTotal(detalleFolio: any): number {
    console.log('Detalle del folio recibido:', detalleFolio);
    
    // Obtener el total de la reserva
    const totalReserva = parseFloat(detalleFolio.reserva?.total || 0);
    console.log('Total de la reserva:', totalReserva);

    // Sumar servicios_reservas
    let totalServicios = 0;
    if (detalleFolio.servicios_reservas && detalleFolio.servicios_reservas.length > 0) {
      console.log('Servicios encontrados:', detalleFolio.servicios_reservas);
      
      totalServicios = detalleFolio.servicios_reservas.reduce((total: number, servicio: any) => {
        const montoServicio = parseFloat(servicio.monto_total || 0);
        console.log(`Servicio: ${servicio.nombre_servicio} - Monto: ${montoServicio}`);
        return total + montoServicio;
      }, 0);
    } else {
      console.log('No hay servicios_reservas');
    }

    console.log('Total servicios:', totalServicios);

    // Total final = reserva + servicios
    const totalFinal = totalReserva + totalServicios;
    console.log('Total final calculado (reserva + servicios):', totalFinal);

    return totalFinal;
  }

  /** Formatear texto del folio para mostrar en select */
  formatearFolio(folio: any): string {
    const formato = `Folio #${folio.id} - ${folio.estado} - Reserva #${folio.reserva_id}`;
    console.log('Formato de folio:', formato);
    return formato;
  }

  /** Limpiar búsqueda de usuario */
  limpiarBusqueda(): void {
    this.busquedaUsuario = '';
    this.usuarioSeleccionado = null;
    this.folios = [];
    this.folioSeleccionado = null;
    this.usuariosFiltrados = [...this.usuarios];
    this.pagoForm.get('folio_id')?.setValue('');
    this.pagoForm.get('monto')?.setValue('');
  }

  /** Enviar formulario (crear/actualizar) */
  enviarFormulario(): void {
    if (this.pagoForm.valid) {
      const raw = this.pagoForm.value; // Usar value en lugar de getRawValue

      const payload = {
        monto: Number(raw.monto),
        metodo: raw.metodo,
        referencia: raw.referencia,
        folio_id: Number(raw.folio_id),
        // fecha_pago se asigna en el backend
      };

      console.log('Payload a enviar:', payload);
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
    Object.keys(this.pagoForm.controls).forEach((key) => {
      this.pagoForm.get(key)?.markAsTouched();
    });
  }

  /** Mensajes de error de validación */
  obtenerMensajeError(nombreCampo: string): string {
    const campo = this.pagoForm.get(nombreCampo);
    if (campo?.hasError('required')) {
      return `${this.obtenerEtiquetaCampo(nombreCampo)} es obligatorio`;
    }
    if (campo?.hasError('min')) {
      return `${this.obtenerEtiquetaCampo(
        nombreCampo
      )} debe ser mayor a 0`;
    }
    return '';
  }

  /** Etiquetas legibles por campo */
  private obtenerEtiquetaCampo(nombreCampo: string): string {
    const labels: Record<string, string> = {
      monto: 'El monto',
      metodo: 'El método de pago',
      referencia: 'La referencia',
      folio_id: 'El folio',
    };
    return labels[nombreCampo] || nombreCampo;
  }
}