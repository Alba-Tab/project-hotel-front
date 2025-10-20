import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { MaterialModule } from "src/app/material.module";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-folio-ver-modal',
  templateUrl: './folio-ver-modal.html',
  styleUrls: ['./folio-ver-modal.scss'],
  imports: [MaterialModule,
    CommonModule,
  ]
})
export class FolioVerModal implements OnInit {
  folio: any;  // Almacena los detalles del folio
  cargando: boolean = true;  // Estado de carga

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<FolioVerModal>,
    @Inject(MAT_DIALOG_DATA) public data: { folioId: number }
  ) {}

  ngOnInit(): void {
    this.obtenerDetalleFolio(this.data.folioId);
  }

  // Método para obtener los detalles del folio
  obtenerDetalleFolio(id: number): void {
    this.apiService.obtenerDetalleFolio(id).subscribe({
      next: (detalle) => {
        this.folio = detalle;  // Asignamos los detalles del folio
        this.cargando = false;  // Terminamos la carga
      },
      error: (error) => {
        console.error('Error al obtener detalle del folio', error);
        this.cargando = false;  // Terminamos la carga en caso de error
      }
    });
  }

    // Método para calcular el total de los servicios
  calcularTotalServicios(): number {
    let total = 0;
    if (this.folio?.servicios_reservas) {
      this.folio.servicios_reservas.forEach((service: any) => {
        total += parseFloat(service.monto_total);  // Acumulamos el total de los servicios
      });
    }
    return total;
  }

  cancelar(): void {
    this.dialogRef.close();  // Cerrar el modal
  }
}
