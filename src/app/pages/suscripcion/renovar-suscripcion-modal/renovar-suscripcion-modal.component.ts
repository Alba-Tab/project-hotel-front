import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/api.service';

interface PlanVariante {
  id: number;
  precio: string;
  tipo: string;
  tipo_display: string;
}

interface PlanAgrupado {
  nombre: string;
  max_usuarios: number;
  max_hoteles: number;
  variantes: PlanVariante[];
}

@Component({
  selector: 'app-renovar-suscripcion-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './renovar-suscripcion-modal.component.html',
  styleUrls: ['./renovar-suscripcion-modal.component.scss'],
})
export class RenovarSuscripcionModalComponent implements OnInit {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  planes: PlanAgrupado[] = [];
  cargandoPlanes = true;
  renovando = false;
  planSeleccionado: PlanVariante | null = null;

  constructor(
    public dialogRef: MatDialogRef<RenovarSuscripcionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargandoPlanes = true;

    this.http
      .get<PlanAgrupado[]>(`${environment.apiUrl}/api/planes/agrupados/`)
      .subscribe({
        next: (data) => {
          this.planes = data;
          this.cargandoPlanes = false;
        },
        error: (err) => {
          console.error('Error al cargar planes:', err);
          this.cargandoPlanes = false;
          this.mostrarError('No se pudieron cargar los planes disponibles');
        },
      });
  }

  seleccionarPlan(variante: PlanVariante): void {
    this.planSeleccionado = variante;
  }

  renovarSuscripcion(): void {
    if (!this.planSeleccionado) {
      this.mostrarError('Por favor selecciona un plan');
      return;
    }

    this.renovando = true;

    this.apiService
      .crear('mi-suscripcion/renovar', { plan_id: this.planSeleccionado.id })
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta renovación:', response);
          const mensaje =
            response?.detail || 'Suscripción renovada exitosamente';
          this.mostrarExito(mensaje);

          // Cerrar modal después de 2 segundos
          setTimeout(() => {
            this.dialogRef.close(true);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al renovar:', error);
          this.renovando = false;

          let mensajeError = 'No se pudo renovar la suscripción';

          if (error.error) {
            if (typeof error.error === 'string') {
              mensajeError = error.error;
            } else if (error.error.detail) {
              mensajeError = error.error.detail;
            }
          }

          this.mostrarError(mensajeError);
        },
      });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }

  obtenerColorPlan(index: number): string {
    const colores = ['accent', 'primary', 'warn'];
    return colores[index % colores.length];
  }

  esPlanActual(variante: PlanVariante): boolean {
    return variante.id === this.data?.suscripcionActual?.plan_detalles?.id;
  }

  esPlanSeleccionado(plan: PlanAgrupado): boolean {
    if (!this.planSeleccionado) {
      return false;
    }
    return plan.variantes.some(v => v.id === this.planSeleccionado!.id);
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 0, // No se cierra automáticamente
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 0, // No se cierra automáticamente
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}
