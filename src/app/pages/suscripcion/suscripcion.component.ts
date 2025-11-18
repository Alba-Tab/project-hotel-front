import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { RenovarSuscripcionModalComponent } from './renovar-suscripcion-modal/renovar-suscripcion-modal.component';

interface Suscripcion {
  id: number;
  plan_nombre: string;
  plan_detalles: {
    id: number;
    nombre: string;
    max_usuarios: number;
    max_hoteles: number;
    precio: string;
    tipo: string;
  };
  estado: string;
  inicio_periodo: string;
  fin_periodo: string;
  esta_activa: boolean;
  dias_restantes: number;
}

interface UsoTenant {
  hoteles: number;
  usuarios: number;
  ultima_actualizacion: string;
  porcentaje_hoteles: number;
  porcentaje_usuarios: number;
}

interface Estadisticas {
  suscripcion: Suscripcion;
  uso: UsoTenant;
  limite_hoteles: number;
  limite_usuarios: number;
  puede_crear_hotel: boolean;
  puede_crear_usuario: boolean;
}

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './suscripcion.component.html',
  styleUrls: ['./suscripcion.component.scss'],
})
export class SuscripcionComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  estadisticas: Estadisticas | null = null;
  cargando = true;
  error = false;

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.error = false;

    this.apiService
      .listar<Estadisticas>('mi-suscripcion/estadisticas')
      .subscribe({
        next: (data) => {
          this.estadisticas = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar estadísticas:', err);
          this.error = true;
          this.cargando = false;
          this.mostrarError('No se pudo cargar la información de suscripción');
        },
      });
  }

  abrirModalRenovar(): void {
    const dialogRef = this.dialog.open(RenovarSuscripcionModalComponent, {
      width: '800px',
      data: {
        suscripcionActual: this.estadisticas?.suscripcion,
        uso: this.estadisticas?.uso,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Se renovó exitosamente
        this.cargarEstadisticas();
      }
    });
  }

  obtenerColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      activo: 'primary',
      prueba: 'accent',
      vencido: 'warn',
      cancelado: 'warn',
    };
    return colores[estado] || '';
  }

  obtenerTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      activo: 'Activo',
      prueba: 'En Prueba',
      vencido: 'Vencido',
      cancelado: 'Cancelado',
    };
    return textos[estado] || estado;
  }

  obtenerColorDias(dias: number): 'primary' | 'accent' | 'warn' {
    if (dias > 30) return 'primary';
    if (dias > 7) return 'accent';
    return 'warn';
  }

  obtenerColorProgreso(porcentaje: number): string {
    if (porcentaje < 70) return 'primary';
    if (porcentaje < 90) return 'accent';
    return 'warn';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
