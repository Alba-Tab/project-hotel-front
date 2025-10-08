import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../interfaces/hotel.interface';



@Component({
  selector: 'app-hoteles',
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
  templateUrl: './hoteles.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelesComponent {

  displayedColumns1: string[] = ['assigned', 'name', 'priority', 'budget'];
  dataSource1: Hotel[] = [];

  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarHoteles();
  }

  cargarHoteles() {
    this.hotelService.getHoteles().subscribe({
      next: (hoteles) => {
        this.dataSource1 = hoteles.map(hotel => ({
          ...hotel,
          nombre: hotel.nombre,
          direccion: hotel.direccion,
          telefono: hotel.telefono

        }));
      },
      error: (error) => {
        console.log('Error al cargar hoteles', error);
      }
    });
  }

  editarHotel(hotel: Hotel) {
  }

  eliminarHotel(hotel: Hotel) {
    if (confirm('¿Estás seguro de eliminar este hotel?')) {
      if (hotel.id) {
        this.hotelService.deleteHotel(hotel.id).subscribe({
          next: () => {
            this.cargarHoteles(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al eliminar hotel:', error);
          }
        });
      }
    }
  }

}
