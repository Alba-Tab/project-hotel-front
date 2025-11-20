import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgFor, NgIf ya incluidos en CommonModule
import { FormsModule } from '@angular/forms';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  templateUrl: './recomendaciones.component.html',
  imports: [
    CommonModule,
    FormsModule,
    // NgFor, // Ya incluido en CommonModule
    // NgIf,  // Ya incluido en CommonModule
    MatTableModule,
    MatCardModule
  ]
})
export class RecomendacionesComponent implements OnInit {

  recomendaciones: any = null;
  loading: boolean = true;

  // fechas para enviar al backend
  fechaInicio: string | null = null;
  fechaFin: string | null = null;

  columnas: string[] = [
    "habitacion_id",
    "numero",
    "tipo",
    "precio_actual",
    "ocupacion",
    "ranking",
    "recomendacion",
    "precio",
    "motivo"
  ];

  constructor(private habitacionesService: HabitacionesService) {}

  ngOnInit(): void {
    // carga inicial sin filtros
    this.buscar();
  }

  buscar() {
    this.loading = true;

    this.habitacionesService.getRecomendacionesPrecio(
      this.fechaInicio ?? undefined,
      this.fechaFin ?? undefined
    ).subscribe({
      next: (resp) => {
        this.recomendaciones = resp;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
