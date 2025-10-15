import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CrearServicioreservaComponent } from './crear-servicioreserva/crear-servicioreserva.component';

@Component({
  selector: 'app-servicioreserva',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule,
  ],
  templateUrl: './servicioreserva.component.html',
})
export class ServicioreservaComponent implements OnInit {
  datos: any[] = [];
  displayedColumns: string[] = [
    'reserva',
    'servicio',
    'cantidad',
    'precio',
    'fecha',
    'estado',
    'acciones',
  ];
  private endpoint: string = 'servicioreservas/';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarServiciosReserva();
  }

  cargarServiciosReserva() {
    this.apiService.listar(this.endpoint).subscribe({
      next: (serviciosReserva: any) => {
        this.datos = serviciosReserva.map((servicio: any) => ({
          ...servicio,
          id: servicio.id,
          reserva: servicio.reserva,
          servicio: servicio.servicio,
          folio_estancia: servicio.folio_estancia,
          cantidad: servicio.cantidad,
          precio_unitario: servicio.precio_unitario,
          fecha_servicio: servicio.fecha_servicio,
          estado: servicio.estado,
          observaciones: servicio.observaciones,
        }));
        console.log('Servicios de reserva cargados');
      },
      error: (error) => {
        console.error('Error al cargar servicios de reserva:', error);
      },
    });
  }

  abrirModalCrearServicio() {
    const dialogRef = this.dialog.open(CrearServicioreservaComponent, {
      width: '600px',
      height: 'auto',
      disableClose: false,
      data: { titulo: 'Crear Nuevo Servicio de Reserva' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Servicio de reserva creado:', result);
        this.cargarServiciosReserva();
      }
    });
  }

  editarServicio(servicio: any) {
    const dialogRef = this.dialog.open(CrearServicioreservaComponent, {
      width: '600px',
      height: 'auto',
      disableClose: false,
      data: {
        servicio: servicio,
        titulo: 'Editar Servicio de Reserva',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Servicio de reserva actualizado:', result);
        this.cargarServiciosReserva();
      }
    });
  }

  eliminarServicio(servicio: any) {
    const confirmar = confirm(
      `¿Estás seguro de eliminar este servicio de reserva?`
    );

    if (confirmar && servicio.id) {
      this.apiService.eliminar(this.endpoint, servicio.id).subscribe({
        next: () => {
          console.log('Servicio de reserva eliminado exitosamente');
          this.cargarServiciosReserva();
        },
        error: (error) => {
          console.error('Error al eliminar servicio de reserva:', error);
          alert('Error al eliminar el servicio de reserva');
        },
      });
    }
  }
}
