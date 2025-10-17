import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';
import { FolioEstanciaFormModal } from './folio-estancia-form-modal/folio-estancia-form-modal';

@Component({
  selector: 'app-folio-estancia',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
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

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(FolioEstanciaFormModal, {
      width: '600px',
      data: { isEdit: false },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.crearFolio(resultado);
      }
    });
  }

  abrirModalEditar(folio: any): void {
    const dialogRef = this.dialog.open(FolioEstanciaFormModal, {
      width: '600px',
      data: { isEdit: true, folio },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.actualizarFolio(folio.id, resultado);
      }
    });
  }

  crearFolio(datos: any): void {
    this.apiService.crear('folioestancias', datos).subscribe({
      next: () => {
        this.mostrarMensaje('Folio de estancia creado exitosamente');
        this.cargarFolios();
      },
      error: (error) => {
        console.error('Error al crear folio de estancia:', error);
        this.mostrarMensaje('Error al crear folio de estancia');
      },
    });
  }

  actualizarFolio(id: number, datos: any): void {
    this.apiService.actualizar('folioestancias', id, datos).subscribe({
      next: () => {
        this.mostrarMensaje('Folio de estancia actualizado exitosamente');
        this.cargarFolios();
      },
      error: (error) => {
        console.error('Error al actualizar folio de estancia:', error);
        this.mostrarMensaje('Error al actualizar folio de estancia');
      },
    });
  }

  eliminarFolio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este folio de estancia?')) {
      this.apiService.eliminar('folioestancias', id).subscribe({
        next: () => {
          this.mostrarMensaje('Folio de estancia eliminado exitosamente');
          this.cargarFolios();
        },
        error: (error) => {
          console.error('Error al eliminar folio de estancia:', error);
          this.mostrarMensaje('Error al eliminar folio de estancia');
        },
      });
    }
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
