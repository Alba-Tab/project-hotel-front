import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../services/api.service'
import { CreareditarHabitacionesComponent } from './creareditar-habitaciones/creareditar-habitaciones.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReportesHabitaciones } from './reportes/reportes';


@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    MatCardModule,
    MaterialModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    RouterModule,

    MatDialogModule,
  ],
  templateUrl: './habitaciones.component.html',
})
export class HabitacionesComponent implements OnInit {

  datos: any[] = [];
  displayedColumns: string[] = ['numero', 'descripcion', 'capacidad', 'precio', 'estado', 'budget'];

  private endpoint: string = 'habitaciones/';
  constructor(
      private apiService: ApiService,
      private dialog: MatDialog,
    ) {
      // console.log('HabitacionesComponent constructor');
    }

    ngOnInit() {
      // console.log('HabitacionesComponent ngOnInit');
      this.cargarHabitaciones();
    }

   abrirModal() {
       const dialogRef = this.dialog.open(CreareditarHabitacionesComponent, {
         width: '600px',
         height: 'auto',
         disableClose: false,
         data: {titulo: 'Crear Habitacion'}
       });

       dialogRef.afterClosed().subscribe(result => {
         if (result) {
           console.log('Habitacion creado', result);
           this.cargarHabitaciones();
         }
       })

     }

     cargarHabitaciones() {
       this.apiService.listar('habitaciones/').subscribe({
         next: (habitaciones: any) => {
           this.datos = habitaciones.map((habitacion: any) => ({
             ...habitacion,
             numero: habitacion.numero,
             descripcion: habitacion.descripcion,
             capacidad: habitacion.capacidad,
             precio_noche: habitacion.precio_noche,
             tamanio: habitacion.tamanio,
             tipo: habitacion.tipo,
             estado: habitacion.estado,
           }));
         },
         error: (error) => {
           console.log('Error al cargar habitaciones', error);
         }
       });
     }

     editarHabitacion(habitacion: any) {
       const dialogRef = this.dialog.open(CreareditarHabitacionesComponent, {
         width: '600px',
         height: 'auto',
         disableClose: false,
         data: {
           habitacion: habitacion,
           titulo: 'Editar Habitacion'
         }
       });

       dialogRef.afterClosed().subscribe(result => {
         if (result) {
           this.cargarHabitaciones();
         }
       })
     }

     eliminarHabitacion(habitacion: any) {
       if (confirm('¿Estás seguro de eliminar este habitacion?')) {
         if (habitacion.id) {
           this.apiService.eliminar( 'habitaciones', habitacion.id).subscribe({
             next: () => {
               this.cargarHabitaciones(); // Recargar la lista
             },
             error: (error) => {
               console.error('Error al eliminar habitacion:', error);
             }
           });
         }
       }
     }

     abrirModalReportes(): void {
       const dialogRef = this.dialog.open(ReportesHabitaciones, {
         width: '800px',
         maxHeight: '90vh',
         panelClass: 'custom-dialog-container',
         disableClose: false
       });

       dialogRef.afterClosed().subscribe((result) => {
         if (result) {
           console.log('Reporte generado exitosamente');
         }
       });
     }

}
