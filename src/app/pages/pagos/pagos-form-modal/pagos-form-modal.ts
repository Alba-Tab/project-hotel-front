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

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<PagosFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.pagoForm = this.fb.group({
      monto: [0, [Validators.required, Validators.min(0.01)]],
      metodo: ['', Validators.required],
      referencia: ['', Validators.required],
      folio_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
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
    this.usuariosFiltrados = this.usuarios.filter((usuario) =>
      `${usuario.first_name} ${usuario.last_name}`.toLowerCase().includes(termino)
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
  this.apiService.listar<any[]>(`folioestancias/huesped/${idUsuario}/`).subscribe({
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
 /** Seleccionar folio y establecer monto automáticamente */
seleccionarFolio(folio: any): void {
  this.folioSeleccionado = folio;
  this.pagoForm.get('folio_id')?.setValue(folio.id);
  this.pagoForm.get('monto')?.setValue(Number(folio.reserva_total));
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

  /** Enviar formulario (crear pago) */
  /** Enviar formulario (crear/actualizar) */
enviarFormulario(): void {
  if (this.pagoForm.valid) {
    const raw = this.pagoForm.value;

    const fechaActual = new Date();
    const fechaISO = fechaActual.toISOString().split('T')[0]; // formato YYYY-MM-DD

    const payload = {
      folio_id: Number(raw.folio_id),
      metodo: raw.metodo,
      referencia: raw.referencia,
      monto: Number(raw.monto),
      fecha_pago: fechaISO, // ✅ Añadimos la fecha
    };

    console.log('📦 Payload enviado a backend:', payload);
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
}
