import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-folio-ver-modal',
  standalone: true,
  templateUrl: './folio-ver-modal.html',
  styleUrls: ['./folio-ver-modal.scss'],
  imports: [MaterialModule, CommonModule],
})
export class FolioVerModal implements OnInit {
  folio: any; // Almacena los detalles del folio
  cargando: boolean = true; // Estado de carga
  displayedColumns: string[] = [
    'concepto',
    'descripcion',
    'cantidad',
    'precio_unitario',
    'subtotal',
  ];

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<FolioVerModal>,
    @Inject(MAT_DIALOG_DATA) public data: { folioId: number }
  ) {}

  ngOnInit(): void {
    this.obtenerDetalleFolio(this.data.folioId);
  }

  // Método para obtener los detalles completos del folio
  obtenerDetalleFolio(id: number): void {
    this.apiService
      .listar<any>(`folioestancias/${id}/detalle-completo`)
      .subscribe({
        next: (detalle) => {
          this.folio = detalle;
          console.log('✅ Detalle folio cargado:', detalle);
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al obtener detalle del folio:', error);
          this.cargando = false;
        },
      });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
