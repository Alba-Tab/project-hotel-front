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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-pagos-form-modal',
  standalone: true,
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './pagos-form-modal.html',
  styleUrls: ['./pagos-form-modal.scss'],
})
export class PagosFormModal implements OnInit {
  pagoForm: FormGroup;
  isEdit: boolean = false;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  folios: any[] = [];
  cargandoUsuarios = false;
  cargandoFolios = false;
  busquedaUsuario = '';
  usuarioSeleccionado: any = null;
  folioSeleccionado: any = null;

  // ✅ Variables para fidelización
  cuentaFidelizacion: any = null;
  descuentoDisponible: any = null;
  cargandoDescuento = false;
  aplicarDescuento = false;
  montoOriginal = 0;
  montoConDescuento = 0;
  descuentoAplicado = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<PagosFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('🔍 PagosFormModal - Datos recibidos:', this.data);

    this.pagoForm = this.fb.group({
      monto: [0, [Validators.required, Validators.min(0.01)]],
      metodo: ['', Validators.required],
      referencia: ['', Validators.required],
      folio_id: ['', Validators.required],
      monto_descuento: [0],
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();

    // ✅ Modo edición: cargar datos del pago existente
    if (this.data?.isEdit && this.data?.pago) {
      console.log('✏️ MODO EDICIÓN - Cargando pago:', this.data.pago);
      this.isEdit = true;
      const pago = this.data.pago;

      // Cargar datos del pago en el formulario
      this.pagoForm.patchValue({
        monto: pago.monto || 0,
        metodo: pago.metodo || '',
        referencia: pago.referencia || '',
        folio_id: pago.folio || pago.folio_id || '',
        monto_descuento: pago.monto_descuento || 0,
      });

      console.log('📝 Formulario cargado con valores:', this.pagoForm.value);

      // Si tiene información del folio, cargarla
      if (pago.folio || pago.folio_id) {
        this.folioSeleccionado = {
          id: pago.folio || pago.folio_id,
          display: `Folio #${pago.folio || pago.folio_id}`,
        };
        this.folios = [this.folioSeleccionado];
      }
    }
    // ✅ Si viene con folio precargado desde folio-estancia
    else if (this.data?.folioPrecargado) {
      const folioPrecargado = this.data.folioPrecargado;

      // Simular usuario seleccionado
      this.usuarioSeleccionado = {
        id: folioPrecargado.huesped_id,
        first_name: folioPrecargado.huesped_nombre.split(' ')[0] || '',
        last_name:
          folioPrecargado.huesped_nombre.split(' ').slice(1).join(' ') || '',
      };
      this.busquedaUsuario = folioPrecargado.huesped_nombre;

      // Agregar folio precargado a la lista de folios
      this.folioSeleccionado = {
        id: folioPrecargado.id,
        reserva_total: folioPrecargado.total,
        display: `Folio #${folioPrecargado.id} - $${folioPrecargado.total}`,
      };

      // Agregar a la lista de folios para que aparezca en el select
      this.folios = [this.folioSeleccionado];

      // Establecer valores en el formulario
      this.pagoForm.get('folio_id')?.setValue(folioPrecargado.id);
      this.montoOriginal = Number(folioPrecargado.total);
      this.pagoForm.get('monto')?.setValue(this.montoOriginal);

      // Cargar puntos de fidelización
      this.cargarPuntosFidelizacion(
        folioPrecargado.huesped_id,
        this.montoOriginal
      );

      // Cargar todos los folios del usuario (para permitir cambiar si es necesario)
      this.obtenerFoliosPorUsuario(folioPrecargado.huesped_id);
    }
  }

  /** Cargar usuarios desde la API */
  obtenerUsuarios(): void {
    this.cargandoUsuarios = true;
    this.apiService.listar<any>('usuarios').subscribe({
      next: (response) => {
        this.usuarios = this.apiService.normalizarRespuestaArray(response);
        this.usuariosFiltrados = [...this.usuarios];
        this.cargandoUsuarios = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
        this.usuariosFiltrados = [];
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
    this.usuariosFiltrados = this.usuarios.filter((usuario) =>
      `${usuario.first_name} ${usuario.last_name}`
        .toLowerCase()
        .includes(termino)
    );
  }

  /** Seleccionar usuario y cargar sus folios */
  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.busquedaUsuario = `${usuario.first_name} ${usuario.last_name}`;
    this.usuariosFiltrados = [];

    this.obtenerFoliosPorUsuario(usuario.id);
    this.pagoForm.get('folio_id')?.setValue('');
    this.pagoForm.get('monto')?.setValue('');
  }

  /** Cargar folios por usuario desde la API */
  obtenerFoliosPorUsuario(idUsuario: number): void {
    this.cargandoFolios = true;

    // ✅ Endpoint actualizado según backend actual
    this.apiService
      .listar<any[]>(`folioestancias/huesped/${idUsuario}/`)
      .subscribe({
        next: (folios) => {
          // Solo folios que no estén pagados
          this.folios = (folios || [])
            .filter((f) => f.estado !== 'Pagado')
            .map((f) => ({
              ...f,
              // ✅ Creamos el texto visible del folio
              display: `Folio #${f.id} - ${f.hotel_nombre} - ${f.estado}`,
            }));
          this.cargandoFolios = false;
        },
        error: (error) => {
          console.error('Error al cargar folios:', error);
          this.cargandoFolios = false;
        },
      });
  }

  /** Seleccionar folio y establecer monto automáticamente */
  seleccionarFolio(folio: any): void {
    this.folioSeleccionado = folio;
    this.pagoForm.get('folio_id')?.setValue(folio.id);
    this.montoOriginal = Number(folio.reserva_total);
    this.pagoForm.get('monto')?.setValue(this.montoOriginal);

    // ✅ Resetear descuento al cambiar de folio
    this.resetearDescuento();

    // ✅ Cargar puntos de fidelización del cliente
    if (this.usuarioSeleccionado?.id) {
      this.cargarPuntosFidelizacion(
        this.usuarioSeleccionado.id,
        this.montoOriginal
      );
    }
  }

  /** Manejador del cambio de folio en el select */
  onFolioChange(folioId: number): void {
    const folio = this.folios.find((f) => f.id === folioId);
    if (folio) {
      this.seleccionarFolio(folio);
    }
  }

  /** Cargar cuenta de fidelización del cliente */
  cargarPuntosFidelizacion(clienteId: number, totalAPagar: number): void {
    this.cargandoDescuento = true;
    this.cuentaFidelizacion = null;
    this.descuentoDisponible = null;

    // Paso 1: Obtener cuenta de fidelización
    this.apiService
      .listar<any[]>(`fidelizacion/cuentas/?cliente=${clienteId}`)
      .subscribe({
        next: (cuentas) => {
          if (cuentas && cuentas.length > 0) {
            this.cuentaFidelizacion = cuentas[0];
            console.log('✅ Cuenta fidelización:', this.cuentaFidelizacion);

            // Paso 2: Calcular descuento disponible
            this.calcularDescuentoDisponible(
              this.cuentaFidelizacion.id,
              totalAPagar
            );
          } else {
            console.log('ℹ️ Cliente sin cuenta de fidelización');
            this.cargandoDescuento = false;
          }
        },
        error: (err) => {
          console.error('Error al cargar puntos:', err);
          this.cargandoDescuento = false;
        },
      });
  }

  /** Calcular descuento máximo disponible */
  calcularDescuentoDisponible(cuentaId: number, totalCuenta: number): void {
    this.apiService
      .crear(`fidelizacion/cuentas/${cuentaId}/calcular_descuento`, {
        total_cuenta: totalCuenta,
      })
      .subscribe({
        next: (descuento) => {
          this.descuentoDisponible = descuento;
          console.log('✅ Descuento disponible:', descuento);
          this.cargandoDescuento = false;
        },
        error: (err) => {
          console.error('Error al calcular descuento:', err);
          this.cargandoDescuento = false;
        },
      });
  }

  /** Toggle para aplicar/quitar descuento */
  toggleDescuento(aplicar: boolean): void {
    this.aplicarDescuento = aplicar;

    if (aplicar && this.descuentoDisponible) {
      // Aplicar descuento máximo disponible
      this.descuentoAplicado =
        this.descuentoDisponible.descuento_maximo_disponible;
      this.montoConDescuento = this.montoOriginal - this.descuentoAplicado;
      this.pagoForm.get('monto_descuento')?.setValue(this.descuentoAplicado);
    } else {
      // Quitar descuento
      this.resetearDescuento();
    }
  }

  /** Resetear valores de descuento */
  resetearDescuento(): void {
    this.aplicarDescuento = false;
    this.descuentoAplicado = 0;
    this.montoConDescuento = this.montoOriginal;
    this.pagoForm.get('monto_descuento')?.setValue(0);
  }

  /** Mostrar formato legible del folio en el select */
  formatearFolio(folio: any): string {
    return `Folio #${folio.id} - ${folio.nombre_hotel} - ${folio.estado}`;
  }

  /** Limpiar búsqueda y selección */
  limpiarBusqueda(): void {
    this.busquedaUsuario = '';
    this.usuarioSeleccionado = null;
    this.folios = [];
    this.folioSeleccionado = null;
    this.usuariosFiltrados = [...this.usuarios];
    this.pagoForm.get('folio_id')?.setValue('');
    this.pagoForm.get('monto')?.setValue('');
  }

  /** Enviar formulario (crear pago con descuento opcional) */
  enviarFormulario(): void {
    if (this.pagoForm.valid) {
      const raw = this.pagoForm.value;
      const fechaActual = new Date();
      const fechaISO = fechaActual.toISOString().split('T')[0];

      const payload: any = {
        folio_id: Number(raw.folio_id),
        metodo: raw.metodo,
        referencia: raw.referencia,
        monto: this.montoOriginal, // ✅ Siempre enviamos el monto original
        fecha_pago: fechaISO,
      };

      // ✅ Si aplicó descuento, agregar campos de fidelización
      if (this.aplicarDescuento && this.descuentoAplicado > 0) {
        payload.canjear_puntos = true;
        payload.monto_descuento = this.descuentoAplicado;
        console.log(`🎁 Aplicando descuento de $${this.descuentoAplicado}`);
      }

      console.log('📦 Payload enviado:', payload);
      this.dialogRef.close(payload);
    } else {
      this.marcarCamposTocados();
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  /** Marcar todos los campos como tocados */
  private marcarCamposTocados(): void {
    Object.keys(this.pagoForm.controls).forEach((key) =>
      this.pagoForm.get(key)?.markAsTouched()
    );
  }

  /** Mensajes de error */
  obtenerMensajeError(nombreCampo: string): string {
    const campo = this.pagoForm.get(nombreCampo);
    if (campo?.hasError('required')) {
      return `${this.obtenerEtiquetaCampo(nombreCampo)} es obligatorio`;
    }
    if (campo?.hasError('min')) {
      return `${this.obtenerEtiquetaCampo(nombreCampo)} debe ser mayor a 0`;
    }
    return '';
  }

  private obtenerEtiquetaCampo(nombreCampo: string): string {
    const labels: Record<string, string> = {
      monto: 'El monto',
      metodo: 'El método de pago',
      referencia: 'La referencia',
      folio_id: 'El folio',
    };
    return labels[nombreCampo] || nombreCampo;
  }

  /** Obtener título del modal */
  getTitle(): string {
    return this.isEdit ? 'Editar Pago' : 'Crear Pago';
  }

  /** Obtener texto del botón */
  getButtonText(): string {
    return this.isEdit ? 'Actualizar Pago' : 'Crear Pago';
  }

  /** Obtener icono del título */
  getTitleIcon(): string {
    return this.isEdit ? 'edit' : 'add';
  }

  /** Obtener icono del botón */
  getButtonIcon(): string {
    return this.isEdit ? 'save' : 'add';
  }
}
