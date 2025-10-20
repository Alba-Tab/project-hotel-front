import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PagosService } from 'src/app/services/pagos_service';
import { ApiService } from 'src/app/services/api.service';
import { MaterialModule } from "src/app/material.module";
import { PagosFormModal } from './pagos-form-modal/pagos-form-modal';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './pagos.html',
  styleUrls: ['./pagos.scss']
})
export class PagosComponent implements OnInit {
  pagos: any[] = [];
  pagosFiltrados: any[] = [];
  loading = true;
  error = '';

  // Columnas para la tabla
  columnasTabla: string[] = [
    'id',
    'estado', 
    'monto',
    'metodo',
    'fecha_pago',
    'referencia',
    'folio_id',
    'acciones'
  ];

  nuevoPago = {
    estado: 'pendiente',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo: '',
    monto: 0,
    referencia: '',
    folio_estancia: null
  };

  constructor(
    private apiServices: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    this.apiServices.listar<any[]>('pagos/list').subscribe({
      next: (data) => {
        this.pagos = data;
        this.pagosFiltrados = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pagos';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // Métodos para el HTML
  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(PagosFormModal, {
      width: '600px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (payload) {
        this.crearPago(payload);
      }
    });
  }

  abrirModalEditar(pago: any): void {
    const dialogRef = this.dialog.open(PagosFormModal, {
      width: '600px',
      data: { isEdit: true, pago }
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (payload) {
        this.editarPago(pago.id, payload);
      }
    });
  }

  abrirModalEliminar(pago: any): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar el pago #${pago.id}?`);
    if (confirmacion) {
      this.eliminarPago(pago.id);
    }
  }

  getEstadoColor(pago: any): string {
    switch (pago.estado?.toLowerCase()) {
      case 'pagado':
      case 'completado':
        return 'primary';
      case 'pendiente':
        return 'accent';
      case 'fallido':
      case 'cancelado':
        return 'warn';
      default:
        return '';
    }
  }

  // Función para convertir fecha UTC al huso horario del navegador
  convertirFechaUTC(fechaISO: string): Date {
    if (!fechaISO) return new Date();
    
    // Si ya tiene información de zona horaria, crear la fecha directamente
    if (fechaISO.includes('Z') || fechaISO.includes('+') || fechaISO.includes('-')) {
      return new Date(fechaISO);
    }
    
    // Si no tiene zona horaria, asumir que es UTC y convertir al huso local
    return new Date(fechaISO + 'Z');
  }

  crearPago(payload?: any): void {
    const pagoData = payload || this.nuevoPago;
    
    this.apiServices.crear('pagos', pagoData).subscribe({
      next: () => {
        this.snackBar.open('Pago creado correctamente', 'Cerrar', {
          duration: 3000
        });
        this.loadPagos();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al crear el pago', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  editarPago(id: number, payload: any): void {
    this.apiServices.actualizar('pagos', id, payload).subscribe({
      next: () => {
        this.snackBar.open('Pago actualizado correctamente', 'Cerrar', {
          duration: 3000
        });
        this.loadPagos();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al actualizar el pago', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  eliminarPago(id: number): void {
    this.apiServices.eliminar('pagos', id).subscribe({
      next: () => {
        this.snackBar.open('Pago eliminado correctamente', 'Cerrar', {
          duration: 3000
        });
        this.loadPagos();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al eliminar el pago', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}
