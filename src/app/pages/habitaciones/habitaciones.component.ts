import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { ApiService } from '../../services/api.service'


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
    RouterModule
  ],
  templateUrl: './habitaciones.component.html',
})
export class HabitacionesComponent implements OnInit {

  datos: any[] = [];
  displayedColumns: string[] = ['numero', 'descripcion', 'capacidad', 'precio', 'estado', 'budget'];

  private endpoint: string = 'habitaciones/';
  constructor(
      private apiService: ApiService,
      private router: Router,
    ) {
      // console.log('HabitacionesComponent constructor');
    }

    ngOnInit() {
      // console.log('HabitacionesComponent ngOnInit');
      this.cargarHabitaciones();
    }

    cargarHabitaciones() {

      this.apiService.listar( this.endpoint ).subscribe({
        next: (habitaciones: any) => {
          this.datos = habitaciones.map((habitacion: any) => ({
            ...habitacion,
            numero: habitacion.numero,
            descripcion: habitacion.descripcion,
            capacidad: habitacion.capacidad,
            precio_noche: habitacion.precio_noche,
            estado: habitacion.estado,
            tamanio: habitacion.tamanio,
            tipo: habitacion.tipo
          }));
          console.log('get funcionando')
        },
        error: (error) => {
          console.log('Error al cargar habitaciones', error);
        }
      });

    }

    // editarHabitacion(habitacion: Habitacion) {

    // }

    // eliminarHabitacion(habitacion: Habitacion) {
    //   if (confirm('¿Estás seguro de eliminar este habitacion?')) {
    //     if (habitacion.id) {
    //       this.apiService.deleteHabitacion(habitacion.id).subscribe({
    //         next: () => {
    //           this.cargarHabitaciones(); // Recargar la lista
    //         },
    //         error: (error) => {
    //           console.error('Error al eliminar habitacion:', error);
    //         }
    //       });
    //     }
    //   }
    // }

}
