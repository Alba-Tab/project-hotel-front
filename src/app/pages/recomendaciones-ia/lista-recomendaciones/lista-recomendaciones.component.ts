import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecomendacionIAService } from '../../../services/recomendacion-ia.service';
import { ApiService } from '../../../services/api.service';
import {
  RecomendacionIA,
  ListaRecomendacionesResponse,
  EventoHistorial
} from '../../../interfaces/recomendacion-ia.interface';

@Component({
  selector: 'app-lista-recomendaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './lista-recomendaciones.component.html',
  styleUrl: './lista-recomendaciones.component.scss'
})
export class ListaRecomendacionesComponent implements OnInit {
  private recomendacionService = inject(RecomendacionIAService);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Datos
  recomendaciones: RecomendacionIA[] = [];
  recomendacionesAgrupadas: any[] = []; // Agrupadas por tipo
  historialReciente: EventoHistorial[] = [];
  seleccionadas: Set<number> = new Set();
  todasSeleccionadas = false;
  habitacionesMap: Map<number, any> = new Map(); // Mapa de ID -> datos habitación

  // Configuración de vista
  maxRecomendaciones = 8; // Máximo 8 recomendaciones (las más prioritarias)
  mostrarTodas = false; // Control para expandir/contraer lista

  // Estados
  cargando = false;
  generando = false;
  procesando = false;

  /**
   * Getter para verificar si hay recomendaciones pendientes
   */
  get hayRecomendacionesPendientes(): boolean {
    return this.recomendaciones.filter(r => !r.aceptado && !r.aplicada).length > 0;
  }

  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarRecomendaciones();
    this.cargarHistorialReciente();
  }

  /**
   * Cargar catálogo de habitaciones
   */
  cargarHabitaciones(): void {
    this.apiService.listar('habitaciones/').subscribe({
      next: (habitaciones: any) => {
        const habArray = Array.isArray(habitaciones) ? habitaciones : [];
        habArray.forEach((hab: any) => {
          this.habitacionesMap.set(hab.id, hab);
        });
        console.log('🏨 Habitaciones cargadas:', this.habitacionesMap.size);
        console.log('🔑 IDs de habitaciones disponibles:', Array.from(this.habitacionesMap.keys()));

        // Mostrar algunas habitaciones de ejemplo
        const primerasCinco = habArray.slice(0, 5);
        console.log('📋 Primeras 5 habitaciones:', primerasCinco.map((h: any) => ({
          id: h.id,
          numero: h.numero,
          descripcion: h.descripcion,
          precio: h.precio_noche
        })));
      },
      error: (error: any) => {
        console.error('❌ Error al cargar habitaciones:', error);
      }
    });
  }

  /**
   * Cargar recomendaciones actuales
   */
  cargarRecomendaciones(): void {
    this.cargando = true;
    this.recomendacionService.listarRecomendaciones().subscribe({
      next: (response: any) => {
        console.log('✅ Recomendaciones cargadas:', response);

        // El backend puede devolver un array directo o un objeto con propiedad 'recomendaciones'
        if (Array.isArray(response)) {
          this.recomendaciones = response;
        } else if (response.recomendaciones) {
          this.recomendaciones = response.recomendaciones;
        } else {
          this.recomendaciones = [];
        }

        console.log('📊 Total recomendaciones:', this.recomendaciones.length);

        // Debug: ver la estructura del primer elemento
        if (this.recomendaciones.length > 0) {
          console.log('🔍 Primera recomendación:', this.recomendaciones[0]);
          console.log('🔑 Campos disponibles:', Object.keys(this.recomendaciones[0]));
        }

        // Actualizar recomendaciones mostradas (inicialmente solo las primeras)
        this.actualizarRecomendacionesMostradas();

        this.cargando = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar recomendaciones:', error);
        this.snackBar.open('Error al cargar las recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cargando = false;
      }
    });
  }

  /**
   * Cargar historial reciente (últimos 5 eventos)
   */
  cargarHistorialReciente(): void {
    this.recomendacionService.obtenerHistorial({ page_size: 5 }).subscribe({
      next: (response) => {
        console.log('✅ Historial cargado del backend:', response);

        // Si el backend devuelve eventos, usarlos
        if (response.eventos && response.eventos.length > 0) {
          this.historialReciente = response.eventos;
          console.log('📋 Usando historial del backend:', this.historialReciente.length, 'eventos');
        } else {
          // Si no hay eventos del backend, usar los guardados localmente
          this.historialReciente = this.obtenerHistorialLocal();
          console.log('📋 Usando historial local:', this.historialReciente.length, 'eventos');
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
        // Cargar historial local en caso de error
        this.historialReciente = this.obtenerHistorialLocal();
        console.log('📋 Usando historial local (por error):', this.historialReciente.length, 'eventos');
      }
    });
  }

  /**
   * Agregar evento al historial local
   */
  agregarEventoHistorial(evento: Partial<EventoHistorial>): void {
    const historial = this.obtenerHistorialLocal();

    const nuevoEvento: EventoHistorial = {
      id: Date.now(),
      tipo: evento.tipo || 'recomendacion_aceptada',
      tipo_display: evento.tipo_display || 'Actualización',
      titulo: evento.titulo || 'Evento sin título',
      descripcion: evento.descripcion || '',
      fecha: new Date().toISOString(),
      detalles: evento.detalles || {}
    };

    historial.unshift(nuevoEvento);

    // Mantener solo los últimos 20 eventos
    const historialLimitado = historial.slice(0, 20);

    // Guardar en localStorage
    localStorage.setItem('historial_recomendaciones_ia', JSON.stringify(historialLimitado));

    // Actualizar vista
    this.historialReciente = historialLimitado.slice(0, 5);
  }

  /**
   * Obtener historial guardado localmente
   */
  obtenerHistorialLocal(): EventoHistorial[] {
    try {
      const historialStr = localStorage.getItem('historial_recomendaciones_ia');
      if (historialStr) {
        const historial = JSON.parse(historialStr);
        return Array.isArray(historial) ? historial.slice(0, 5) : [];
      }
    } catch (error) {
      console.error('Error al parsear historial local:', error);
    }
    return [];
  }

  /**
   * Actualizar lista de recomendaciones mostradas según configuración
   */
  actualizarRecomendacionesMostradas(): void {
    // Ordenar por confianza descendente
    const recomendacionesOrdenadas = [...this.recomendaciones].sort((a, b) => {
      const confA = typeof a.confianza === 'string' ? parseFloat(a.confianza) : a.confianza;
      const confB = typeof b.confianza === 'string' ? parseFloat(b.confianza) : b.confianza;
      return confB - confA;
    });

    // Tomar solo las primeras N más prioritarias
    const recomendacionesPrioritarias = recomendacionesOrdenadas.slice(0, this.maxRecomendaciones);

    // Agrupar por tipo de habitación
    const grupos = new Map<string, RecomendacionIA[]>();

    recomendacionesPrioritarias.forEach(rec => {
      // Obtener tipo de habitación
      let tipo = 'Otros';

      if (rec.habitacion_detalle && rec.habitacion_detalle.descripcion) {
        const desc = rec.habitacion_detalle.descripcion.toLowerCase();
        if (desc.includes('simple') || desc.includes('individual')) tipo = 'Simple';
        else if (desc.includes('doble')) tipo = 'Doble';
        else if (desc.includes('suite')) tipo = 'Suite';
        else if (desc.includes('familiar')) tipo = 'Familiar';
        else if (desc.includes('lujo')) tipo = 'Lujo';
      }

      if (!grupos.has(tipo)) {
        grupos.set(tipo, []);
      }
      grupos.get(tipo)!.push(rec);
    });

    // Convertir a array de grupos
    this.recomendacionesAgrupadas = Array.from(grupos.entries()).map(([tipo, items]) => ({
      tipo,
      recomendaciones: items,
      tarifa_promedio_actual: this.calcularPromedio(items, 'tarifa_actual'),
      tarifa_promedio_sugerida: this.calcularPromedio(items, 'tarifa_sugerida'),
      confianza_promedio: this.calcularPromedio(items, 'confianza')
    }));

    console.log('📦 Recomendaciones agrupadas:', this.recomendacionesAgrupadas);
  }

  /**
   * Calcular promedio de un campo en un array de recomendaciones
   */
  calcularPromedio(items: RecomendacionIA[], campo: string): number {
    if (items.length === 0) return 0;

    const suma = items.reduce((acc, item: any) => {
      const valor = typeof item[campo] === 'string' ? parseFloat(item[campo]) : item[campo];
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    return suma / items.length;
  }

  /**
   * Ver todas las recomendaciones (expandir el límite)
   */
  verTodasRecomendaciones(): void {
    this.maxRecomendaciones = this.recomendaciones.length;
    this.actualizarRecomendacionesMostradas();
    this.snackBar.open('Mostrando todas las recomendaciones', 'Cerrar', {
      duration: 2000
    });
  }

  /**
   * Generar nuevas recomendaciones
   */
  generarRecomendaciones(): void {
    this.generando = true;

    this.snackBar.open('⏳ Generando recomendaciones con IA...', 'Cerrar', {
      duration: 3000
    });

    this.recomendacionService.generarRecomendaciones().subscribe({
      next: (response: any) => {
        console.log('✅ Recomendaciones generadas:', response);
        console.log('📋 Estructura de respuesta:', Object.keys(response));

        const mensaje = response.mensaje || response.message || 'Recomendaciones generadas exitosamente';
        const cantidad = response.recomendaciones_generadas || response.total || 0;

        this.snackBar.open(
          `✨ ${mensaje} - ${cantidad} recomendaciones generadas`,
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

        this.generando = false;
        this.cargarRecomendaciones();
        this.cargarHistorialReciente();
      },
      error: (error) => {
        console.error('❌ Error al generar recomendaciones:', error);

        let mensaje = 'Error al generar recomendaciones';
        if (error.error?.error) {
          mensaje = error.error.error;
        }

        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        this.generando = false;
      }
    });
  }

  /**
   * Toggle selección de una recomendación
   */
  toggleSeleccion(id: number): void {
    if (this.seleccionadas.has(id)) {
      this.seleccionadas.delete(id);
    } else {
      this.seleccionadas.add(id);
    }
    this.actualizarTodasSeleccionadas();
  }

  /**
   * Toggle selección de todas las recomendaciones
   */
  toggleTodasSeleccionadas(): void {
    if (this.todasSeleccionadas) {
      this.seleccionadas.clear();
    } else {
      this.recomendaciones.forEach(rec => {
        if (rec.estado === 'pendiente') {
          this.seleccionadas.add(rec.id);
        }
      });
    }
    this.actualizarTodasSeleccionadas();
  }

  /**
   * Actualizar estado de "todas seleccionadas"
   */
  private actualizarTodasSeleccionadas(): void {
    const pendientes = this.recomendaciones.filter(r => r.estado === 'pendiente');
    this.todasSeleccionadas = pendientes.length > 0 &&
                              pendientes.every(r => this.seleccionadas.has(r.id));
  }

  /**
   * Aceptar todas las recomendaciones
   */
  aceptarTodas(): void {
    if (this.recomendaciones.filter(r => r.estado === 'pendiente').length === 0) {
      this.snackBar.open('No hay recomendaciones pendientes', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de aceptar TODAS las recomendaciones?\n\n' +
      'Esto actualizará las tarifas de todas las habitaciones según las sugerencias de la IA.'
    );

    if (!confirmar) return;

    this.procesando = true;

    this.recomendacionService.aceptarRecomendaciones({ todas: true }).subscribe({
      next: (response) => {
        console.log('✅ Recomendaciones aceptadas:', response);

        const cantidad = response.recomendaciones_aceptadas || 0;

        this.snackBar.open(
          `✅ ${response.mensaje} - ${cantidad} tarifas actualizadas`,
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

        // Registrar evento en historial
        this.agregarEventoHistorial({
          tipo: 'recomendacion_aceptada',
          tipo_display: 'Actualización automática',
          titulo: 'Actualización automática',
          descripcion: `${cantidad} recomendaciones aplicadas`,
          detalles: { precios_ajustados: cantidad }
        });

        this.procesando = false;
        this.seleccionadas.clear();
        this.cargarRecomendaciones();
        this.cargarHistorialReciente();
      },
      error: (error) => {
        console.error('❌ Error al aceptar recomendaciones:', error);
        this.snackBar.open('❌ Error al aceptar las recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.procesando = false;
      }
    });
  }

  /**
   * Aceptar recomendaciones seleccionadas
   */
  aceptarSeleccionadas(): void {
    if (this.seleccionadas.size === 0) {
      this.snackBar.open('⚠️ Selecciona al menos una recomendación', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.procesando = true;

    this.recomendacionService.aceptarRecomendaciones({
      ids: Array.from(this.seleccionadas),
      todas: false
    }).subscribe({
      next: (response) => {
        console.log('✅ Recomendaciones aceptadas:', response);

        const cantidad = response.recomendaciones_aceptadas || this.seleccionadas.size;

        this.snackBar.open(
          `✅ ${response.mensaje} - ${cantidad} tarifas actualizadas`,
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

        // Registrar evento en historial
        this.agregarEventoHistorial({
          tipo: 'recomendacion_aceptada',
          tipo_display: 'Actualización manual',
          titulo: 'Recomendaciones aceptadas',
          descripcion: `${cantidad} recomendación(es) aplicadas manualmente`,
          detalles: { precios_ajustados: cantidad }
        });

        this.procesando = false;
        this.seleccionadas.clear();
        this.cargarRecomendaciones();
        this.cargarHistorialReciente();
      },
      error: (error) => {
        console.error('❌ Error al aceptar recomendaciones:', error);
        this.snackBar.open('❌ Error al aceptar las recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.procesando = false;
      }
    });
  }

  /**
   * Rechazar recomendaciones
   */
  rechazarRecomendaciones(): void {
    if (this.recomendaciones.filter(r => r.estado === 'pendiente').length === 0) {
      this.snackBar.open('No hay recomendaciones pendientes para rechazar', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de rechazar todas las recomendaciones pendientes?\n\n' +
      'Las recomendaciones rechazadas no se aplicarán.'
    );

    if (!confirmar) return;

    this.procesando = true;

    this.recomendacionService.rechazarRecomendaciones({ todas: true }).subscribe({
      next: (response) => {
        console.log('✅ Recomendaciones rechazadas:', response);

        const cantidad = response.recomendaciones_rechazadas || 0;

        this.snackBar.open(
          `✅ ${response.mensaje}`,
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );

        // Registrar evento en historial
        this.agregarEventoHistorial({
          tipo: 'recomendacion_rechazada',
          tipo_display: 'Recomendaciones rechazadas',
          titulo: 'Recomendaciones rechazadas',
          descripcion: `${cantidad} recomendación(es) rechazadas`,
          detalles: { rechazadas: cantidad }
        });

        this.procesando = false;
        this.seleccionadas.clear();
        this.cargarRecomendaciones();
        this.cargarHistorialReciente();
      },
      error: (error) => {
        console.error('❌ Error al rechazar recomendaciones:', error);
        this.snackBar.open('❌ Error al rechazar las recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.procesando = false;
      }
    });
  }

  /**
   * Obtener color según el nivel de confianza
   */
  getConfianzaColor(confianza: any): string {
    const nivel = typeof confianza === 'string' ? parseFloat(confianza) : confianza;
    if (!nivel || isNaN(nivel)) return '#9e9e9e'; // Gris por defecto

    if (nivel >= 90) return '#4caf50'; // Verde
    if (nivel >= 75) return '#8bc34a'; // Verde claro
    if (nivel >= 60) return '#ffc107'; // Amarillo
    return '#ff9800'; // Naranja
  }

  /**
   * Obtener color de fondo según el nivel de confianza
   */
  getConfianzaBgColor(confianza: any): string {
    const nivel = typeof confianza === 'string' ? parseFloat(confianza) : confianza;
    if (!nivel || isNaN(nivel)) return '#f5f5f5'; // Gris claro por defecto

    if (nivel >= 90) return '#e8f5e9';
    if (nivel >= 75) return '#f1f8e9';
    if (nivel >= 60) return '#fff9e6';
    return '#fff3e0';
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(valor: any): string {
    // Convertir a número si es string
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;

    // Verificar si es un número válido
    if (isNaN(numero) || numero === null || numero === undefined) {
      return '$0.00 Bs';
    }

    return `$${numero.toFixed(2)} Bs`;
  }

  /**
   * Formatear confianza
   */
  formatearConfianza(valor: any): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero) || numero === null || numero === undefined) {
      return '0.00';
    }
    return numero.toFixed(2);
  }

  /**
   * Obtener nombre de habitación
   */
  obtenerNombreHabitacion(rec: RecomendacionIA): string {
    // 1. Si tiene habitacion_detalle (del backend), usarlo directamente
    if (rec.habitacion_detalle) {
      const numero = rec.habitacion_detalle.numero || rec.habitacion;
      const descripcion = rec.habitacion_detalle.descripcion || '';
      return `Habitación #${numero}${descripcion ? ' - ' + descripcion : ''}`;
    }

    // 2. Si tiene tipo_habitacion_display (legacy)
    if (rec.tipo_habitacion_display) {
      return rec.tipo_habitacion_display;
    }

    // 3. Buscar en el mapa de habitaciones cargadas usando el campo 'habitacion'
    const habitacionId = rec.habitacion || rec.tipo_habitacion;
    if (habitacionId) {
      const habitacion = this.habitacionesMap.get(habitacionId);

      if (habitacion) {
        const numero = habitacion.numero || habitacionId;
        const descripcion = habitacion.descripcion || '';
        return `Habitación #${numero}${descripcion ? ' - ' + descripcion : ''}`;
      }

      return `Habitación #${habitacionId}`;
    }

    // Fallback
    return `Recomendación #${rec.id}`;
  }

  /**
   * Calcular tendencia comparando tarifas
   */
  obtenerTendencia(rec: RecomendacionIA): 'aumento' | 'disminucion' | 'igual' {
    // Si ya tiene tendencia, usarla
    if (rec.tendencia) {
      return rec.tendencia;
    }

    // Calcular comparando tarifas
    const actual = typeof rec.tarifa_actual === 'string' ? parseFloat(rec.tarifa_actual) : rec.tarifa_actual;
    const sugerida = typeof rec.tarifa_sugerida === 'string' ? parseFloat(rec.tarifa_sugerida) : rec.tarifa_sugerida;

    if (isNaN(actual) || isNaN(sugerida)) {
      return 'igual';
    }

    if (sugerida > actual) {
      return 'aumento';
    } else if (sugerida < actual) {
      return 'disminucion';
    }

    return 'igual';
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
   * Obtener clase CSS del icono según tipo
   */
  getEventoIconClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      'modelo_entrenado': 'icon-modelo',
      'actualizacion_automatica': 'icon-actualizacion',
      'analisis_demanda': 'icon-analisis',
      'recomendacion_aceptada': 'icon-aceptada',
      'recomendacion_rechazada': 'icon-rechazada'
    };
    return clases[tipo] || 'icon-default';
  }

  /**
   * Obtener clase del badge según tipo
   */
  getTipoBadgeClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      'modelo_entrenado': 'badge-modelo',
      'actualizacion_automatica': 'badge-actualizacion',
      'analisis_demanda': 'badge-analisis',
      'recomendacion_aceptada': 'badge-aceptada',
      'recomendacion_rechazada': 'badge-rechazada'
    };
    return clases[tipo] || 'badge-default';
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Formatear hora
   */
  formatearHora(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
