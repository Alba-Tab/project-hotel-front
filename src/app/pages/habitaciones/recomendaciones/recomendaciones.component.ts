import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HabitacionesService } from 'src/app/services/habitaciones.service';

@Component({
  selector: 'app-recomendaciones',
  standalone: true,  // importantísimo
  imports: [CommonModule, CurrencyPipe],  // ← AQUI SE AGREGA
  templateUrl: './recomendaciones.component.html',
})
export class RecomendacionesComponent implements OnInit {
  data: any = null;
  loading = true;

  constructor(private habitacionesService: HabitacionesService) {}

  ngOnInit(): void {
    this.habitacionesService.getRecomendacionesPrecio().subscribe({
      next: (resp) => {
        this.data = resp;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
}
