import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from 'src/app/services/api.service';
import { FolioEstanciaFormModal } from './folio-estancia-form-modal/folio-estancia-form-modal';
import { FolioVerModal } from './folio-ver-modal/folio-ver-modal';
import { CrearServicioAsociadoComponent } from '../servicios-asociados/crear-servicio-asociado/crear-servicio-asociado.component';
import { PagosFormModal } from '../pagos/pagos-form-modal/pagos-form-modal';

@Component({
  selector: 'app-folio-estancia',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './folio-estancia.html',
  styleUrls: ['./folio-estancia.scss'],
})
export class FolioEstanciaComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'estado',
    'total_pagado',
    'huesped_nombre',
    'reserva_id',
    'acciones',
  ];
  dataSource: any[] = [];
  cargando = false;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarFolios();
  }

  cargarFolios(): void {
    this.cargando = true;
    this.apiService.listar<any[]>('folioestancias').subscribe({
      next: (folios) => {
        this.dataSource = folios || [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar folios de estancia:', error);
        this.mostrarMensaje('Error al cargar folios de estancia');
        this.cargando = false;
      },
    });
  }

  abrirModalVer(folio: any): void {
    const dialogRef = this.dialog.open(FolioVerModal, {
      width: '600px',
      data: { folioId: folio.id },
    });
  }

  abrirModalServicioAsociado(folio: any): void {
    const dialogRef = this.dialog.open(CrearServicioAsociadoComponent, {
      width: '700px',
      height: 'auto',
      disableClose: false,
      data: {
        titulo: 'Crear Servicio Asociado',
        folioEstanciaId: folio.id,
        folioEstancia: folio.id, // ✅ Precargar folio
        huesped_nombre: folio.huesped_nombre, // ✅ Para mostrar en el modal
        reserva_id: folio.reserva_id, // ✅ Para referencia
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.mostrarMensaje('Servicio asociado creado exitosamente');
        // Opcionalmente recargar la tabla si es necesario
        this.cargarFolios();
      }
    });
  }

  abrirModalPagoDirecto(folio: any): void {
    // Abrir modal de pago con datos precargados del folio
    const dialogRef = this.dialog.open(PagosFormModal, {
      width: '700px',
      data: {
        isEdit: false,
        folioPrecargado: {
          id: folio.id,
          huesped_id: folio.huesped_id,
          huesped_nombre: folio.huesped_nombre,
          total: folio.total_pagado, // ✅ Usar total_pagado del folio
        }
      }
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (payload) {
        this.crearPago(payload);
      }
    });
  }

  crearPago(payload: any): void {
    this.apiService.crear('pagos', payload).subscribe({
      next: () => {
        this.mostrarMensaje('Pago creado correctamente');
        this.cargarFolios();
      },
      error: (err) => {
        console.error('Error al crear pago:', err);
        this.mostrarMensaje('Error al crear el pago');
      },
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
