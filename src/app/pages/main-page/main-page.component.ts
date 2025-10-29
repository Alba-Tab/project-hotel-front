import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { SubscriptionCardComponent } from './subscription-card/subscription-card.component';
import {
  PlanAgrupado,
  PlanVariante,
} from '../../interfaces/planes.interface';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SubscriptionCardComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  planes: PlanAgrupado[] = [];
  cargando = true;
  error = false;

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargando = true;
    this.error = false;

    // Endpoint de planes agrupados
    this.http
      .get<PlanAgrupado[]>(`${environment.apiUrl}/api/planes/agrupados/`)
      .subscribe({
        next: (data) => {
          this.planes = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar planes:', err);
          this.error = true;
          this.cargando = false;
          this.mostrarError(
            'No se pudieron cargar los planes de suscripción'
          );
        },
      });
  }

  onVarianteSeleccionada(data: {
    plan: PlanAgrupado;
    variante: PlanVariante;
  }): void {
    // Navegar a registro con los datos del plan seleccionado
    this.router.navigate(['/registrar-empresa'], {
      state: {
        planSeleccionado: {
          planId: data.variante.id,
          planNombre: data.plan.nombre,
          precio: data.variante.precio,
          tipo: data.variante.tipo_display,
          maxUsuarios: data.plan.max_usuarios,
          maxHoteles: data.plan.max_hoteles,
        },
      },
    });
  }

  obtenerColorPlan(index: number): string {
    const colores = ['accent', 'primary', 'warn'];
    return colores[index % colores.length];
  }

  esPlanDestacado(index: number): boolean {
    // Destacar el plan del medio (generalmente el más popular)
    return index === Math.floor(this.planes.length / 2);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}
