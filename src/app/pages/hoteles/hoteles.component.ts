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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CrearHotelComponent } from './crear-hotel/crear-hotel.component';
import { ApiService } from 'src/app/services/api.service';



@Component({
  selector: 'app-hoteles',
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
  templateUrl: './hoteles.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelesComponent {

  displayedColumns1: string[] = ['assigned', 'name', 'priority', 'budget'];
  dataSource1: Hotel[] = [];

  constructor(
    private hotelService: HotelService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.cargarHoteles();
  }

  abrirModal() {
    const dialogRef = this.dialog.open(CrearHotelComponent, {
      width: '600px',
      height: 'auto',
      disableClose: false,
      data: {titulo: 'Crear Hotel'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Hotel creado', result);
        this.cargarHoteles();
      }
    })

  }

  cargarHoteles() {
    this.apiService.listar('hoteles/hoteles').subscribe({
      next: (hoteles: any) => {
        this.dataSource1 = hoteles.map((hotel:any) => ({
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
    const dialogRef = this.dialog.open(CrearHotelComponent, {
      width: '600px',
      height: 'auto',
      disableClose: false,
      data: {
        hotel: hotel,
        titulo: 'Editar Hotel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHoteles();
      }
    })
  }

  eliminarHotel(hotel: Hotel) {
    if (confirm('¿Estás seguro de eliminar este hotel?')) {
      if (hotel.id) {
        this.apiService.eliminar('hoteles',hotel.id).subscribe({
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
