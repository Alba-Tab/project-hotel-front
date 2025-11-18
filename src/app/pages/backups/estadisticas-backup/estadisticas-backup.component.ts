import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { BackupService } from '../../../services/backup.service';
import { BackupStatsResponse, BackupConfig } from '../../../interfaces/backup.interface';

@Component({
  selector: 'app-estadisticas-backup',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './estadisticas-backup.component.html',
  styleUrl: './estadisticas-backup.component.scss'
})
export class EstadisticasBackupComponent implements OnInit {
  private backupService = inject(BackupService);

  // Datos
  estadisticas: BackupStatsResponse | null = null;
  configuracion: BackupConfig | null = null;

  // Estado
  cargando = true;

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar estadísticas y configuración
   */
  cargarDatos(): void {
    this.cargando = true;

    // Cargar en paralelo
    Promise.all([
      this.backupService.obtenerEstadisticas().toPromise(),
      this.backupService.obtenerConfiguracion().toPromise()
    ]).then(([stats, config]) => {
      this.estadisticas = stats!;
      this.configuracion = config!;
      this.cargando = false;
    }).catch(error => {
      console.error('Error al cargar datos:', error);
      this.cargando = false;
    });
  }

  /**
   * Refrescar datos
   */
  refrescar(): void {
    this.cargarDatos();
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES');
  }

  /**
   * Formatear bytes a MB/GB
   */
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 MB';

    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }

    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  /**
   * Calcular porcentaje de éxito
   */
  calcularPorcentajeExito(): number {
    if (!this.estadisticas?.base_datos) return 0;

    const total = this.estadisticas.base_datos.total;
    if (total === 0) return 0;

    const exitosos = this.estadisticas.base_datos.exitosos;
    return Math.round((exitosos / total) * 100);
  }

  /**
   * Obtener color del porcentaje
   */
  getColorPorcentaje(): string {
    const porcentaje = this.calcularPorcentajeExito();
    if (porcentaje >= 90) return 'success';
    if (porcentaje >= 70) return 'warning';
    return 'danger';
  }
}
