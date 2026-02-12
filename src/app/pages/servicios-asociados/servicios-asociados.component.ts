import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ServicioAsociado } from '../../interfaces/servicio-asociado.interface';
import { CrearServicioAsociadoComponent } from './crear-servicio-asociado/crear-servicio-asociado.component';

@Component({
  selector: 'app-servicios-asociados',
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
  templateUrl: './servicios-asociados.component.html',
  styleUrls: ['./servicios-asociados.component.scss'],
})
export class ServiciosAsociadosComponent implements OnInit {
  datos: ServicioAsociado[] = [];
  displayedColumns: string[] = [
    'folioestancia',
    'servicio',
    'cantidad',
    'monto_total',
    'fecha_servicio',
    'estado',
    'acciones',
  ];
  cargando = false;
  folioEstancia?: number;

  constructor(private apiService: ApiService, private dialog: MatDialog) {}

  ngOnInit() {
    this.cargarServiciosAsociados();
  }

  cargarServiciosAsociados() {
    this.cargando = true;
    const params = this.folioEstancia
      ? { folioestancia: this.folioEstancia }
      : {};

    this.apiService
      .listar<ServicioAsociado[]>('servicios-asociados', params)
      .subscribe({
        next: (servicios: any) => {
          this.datos = (servicios || []).sort(
            (a: ServicioAsociado, b: ServicioAsociado) =>
              new Date(b.fecha_servicio).getTime() -
              new Date(a.fecha_servicio).getTime()
          );
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar servicios:', error);
          this.cargando = false;
        },
      });
  }

  abrirModalCrearServicio(servicio?: ServicioAsociado) {
    const dialogRef = this.dialog.open(CrearServicioAsociadoComponent, {
      width: '700px',
      data: {
        servicio,
        folioEstancia: this.folioEstancia,
        titulo: servicio ? 'Editar Servicio' : 'Nuevo Servicio',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarServiciosAsociados();
    });
  }

  editarServicio(servicio: ServicioAsociado) {
    this.abrirModalCrearServicio(servicio);
  }

  eliminarServicio(servicio: ServicioAsociado) {
    if (!confirm('¿Eliminar este servicio asociado?') || !servicio.id) return;

    this.apiService.eliminar('servicios-asociados', servicio.id).subscribe({
      next: () => this.cargarServiciosAsociados(),
      error: (error) => {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el servicio');
      },
    });
  }

  obtenerEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      solicitado: 'bg-light-info text-info',
      confirmado: 'bg-light-success text-success',
      en_proceso: 'bg-light-warning text-warning',
      completado: 'bg-light-primary text-primary',
      cancelado: 'bg-light-error text-error',
    };
    return clases[estado] || 'bg-light-info text-info';
  }
}
