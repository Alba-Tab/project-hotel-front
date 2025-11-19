import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecomendacionIAService } from '../../../services/recomendacion-ia.service';
import { EventoHistorial, FiltrosHistorial } from '../../../interfaces/recomendacion-ia.interface';

@Component({
  selector: 'app-historial-recomendaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './historial-recomendaciones.component.html',
  styleUrl: './historial-recomendaciones.component.scss'
})
export class HistorialRecomendacionesComponent implements OnInit {
  private recomendacionService = inject(RecomendacionIAService);
  private snackBar = inject(MatSnackBar);

  // Tabla
  dataSource = new MatTableDataSource<EventoHistorial>([]);
  displayedColumns: string[] = ['fecha', 'tipo', 'titulo', 'descripcion', 'detalles'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Filtros
  filtros: FiltrosHistorial = {
    fecha_desde: '',
    fecha_hasta: '',
    tipo: ''
  };

  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  // Estado
  cargando = false;
  totalEventos = 0;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Cargar historial con filtros
   */
  cargarHistorial(): void {
    this.cargando = true;

    // Convertir fechas a string ISO
    if (this.fechaDesde) {
      this.filtros.fecha_desde = this.fechaDesde.toISOString().split('T')[0];
    }
    if (this.fechaHasta) {
      this.filtros.fecha_hasta = this.fechaHasta.toISOString().split('T')[0];
    }

    console.log('🔍 Cargando historial con filtros:', this.filtros);

    this.recomendacionService.obtenerHistorial(this.filtros).subscribe({
      next: (response) => {
        console.log('✅ Historial cargado:', response);
        this.dataSource.data = response.eventos || [];
        this.totalEventos = response.total || 0;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
        this.snackBar.open('Error al cargar el historial', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cargando = false;
      }
    });
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    this.cargarHistorial();
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      fecha_desde: '',
      fecha_hasta: '',
      tipo: ''
    };
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.cargarHistorial();
  }

  /**
   * Obtener icono según tipo de evento
   */
  getEventoIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'modelo_entrenado': 'psychology',
      'actualizacion_automatica': 'sync',
      'analisis_demanda': 'trending_up',
      'recomendacion_aceptada': 'check_circle',
      'recomendacion_rechazada': 'cancel'
    };
    return iconos[tipo] || 'info';
  }

  /**
   * Obtener color según tipo de evento
   */
  getEventoColor(tipo: string): string {
    const colores: { [key: string]: string } = {
      'modelo_entrenado': 'primary',
      'actualizacion_automatica': 'accent',
      'analisis_demanda': 'accent',
      'recomendacion_aceptada': 'primary',
      'recomendacion_rechazada': 'warn'
    };
    return colores[tipo] || '';
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear detalles como texto
   */
  formatearDetalles(detalles: any): string {
    const items: string[] = [];

    if (detalles.precios_ajustados) {
      items.push(`${detalles.precios_ajustados} precios ajustados`);
    }
    if (detalles.recomendaciones_aplicadas) {
      items.push(`${detalles.recomendaciones_aplicadas} recomendaciones aplicadas`);
    }
    if (detalles.periodo_detectado) {
      items.push(`Período: ${detalles.periodo_detectado}`);
    }
    if (detalles.tipos_habitacion && detalles.tipos_habitacion.length > 0) {
      items.push(`Habitaciones: ${detalles.tipos_habitacion.join(', ')}`);
    }

    return items.join(' • ') || 'Sin detalles adicionales';
  }
}
