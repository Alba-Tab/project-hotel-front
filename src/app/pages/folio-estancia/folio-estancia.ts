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
    data: { folioId: folio.id }
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

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
