// services/configuracion-apariencia.service.ts
import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Observable, tap, finalize, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { ConfiguracionAparienciaData } from '../models/configuracion-apariencia.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionAparienciaService {
  private apiService = inject(ApiService);

  // 🔥 SIGNALS - Estado reactivo
  private configuracionSignal = signal<ConfiguracionAparienciaData | null>(null);
  private cargandoSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // 🔥 COMPUTED SIGNALS - Se recalculan automáticamente
  public configuracion = this.configuracionSignal.asReadonly();
  public cargando = this.cargandoSignal.asReadonly();
  public error = this.errorSignal.asReadonly();
  public temaActivo = computed(() => this.configuracionSignal()?.modo_tema ?? 'claro');
  public coloresActivos = computed(() => {
    const config = this.configuracionSignal();
    return config ? {
      primario: config.color_primario,
      secundario: config.color_secundario,
      fondo: config.color_fondo
    } : null;
  });

  constructor() {
    // 🔥 EFFECT - Se ejecuta automáticamente cuando cambia configuracionSignal
    effect(() => {
      const config = this.configuracionSignal();
      if (config) {
        this.aplicarEstilosCSS(config);
      }
    });
  }

  // 📡 MÉTODOS DE API (devuelven Observable)

  /**
   * 1️⃣ CARGAR configuración desde backend
   * Ahora usa el endpoint /mi-hotel/ que obtiene automáticamente el hotel del usuario autenticado
   */
  cargarConfiguracion(): Observable<ConfiguracionAparienciaData | null> {
    this.cargandoSignal.set(true);
    this.errorSignal.set(null);

    return this.apiService.listar<ConfiguracionAparienciaData>('configuracion-apariencia/mi-hotel')
      .pipe(
        tap(config => {
          // ✅ Al recibir datos, actualizar el signal
          this.configuracionSignal.set(config);
        }),
        catchError(error => {
          this.errorSignal.set('Error al cargar configuración');
          console.error('Error:', error);

          // 🔥 Si falla, aplicar valores por defecto
          const configPorDefecto = this.obtenerConfiguracionPorDefecto();
          this.configuracionSignal.set(configPorDefecto);

          return of(configPorDefecto);
        }),
        finalize(() => {
          // ✅ Siempre quitar loading
          this.cargandoSignal.set(false);
        })
      );
  }

  /**
   * 📋 OBTENER configuración por defecto
   */
  private obtenerConfiguracionPorDefecto(): ConfiguracionAparienciaData {
    const hotelId = this.obtenerHotelIdActual();
    return {
      hotel: hotelId,
      color_primario: '#00a1ff',
      color_secundario: '#16cdc7',
      color_fondo: '#f8fafd',
      familia_fuente: 'Inter',
      tamano_fuente_base: 14,
      modo_tema: 'claro',
      tema: 'Por defecto',
      tipo_letra: 'Inter'
    };
  }

  /**
   * 🔑 OBTENER hotelId del usuario autenticado
   */
  obtenerHotelIdActual(): number {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Asumiendo que el objeto user tiene el campo hotel_id
        return user.hotel || user.hotel_id || 1;
      }
    } catch (error) {
      console.error('Error al obtener hotelId del usuario:', error);
    }
    return 1; // Valor por defecto
  }

  /**
   * 2️⃣ GUARDAR configuración en backend
   * Ahora usa el endpoint /mi-hotel/ que identifica automáticamente el hotel del usuario
   */
  guardarConfiguracion(datos: Partial<ConfiguracionAparienciaData>): Observable<ConfiguracionAparienciaData | null> {
    this.cargandoSignal.set(true);
    this.errorSignal.set(null);

    // Usar el endpoint genérico de actualización sin ID
    return this.apiService.crear<ConfiguracionAparienciaData>('configuracion-apariencia/mi-hotel', datos)
      .pipe(
        tap(config => {
          // ✅ Al guardar, actualizar el signal con los nuevos datos
          this.configuracionSignal.set(config);
        }),
        catchError(error => {
          this.errorSignal.set('Error al guardar configuración');
          console.error('Error:', error);
          return of(null);
        }),
        finalize(() => {
          this.cargandoSignal.set(false);
        })
      );
  }

  // 🎨 MÉTODOS DE PREVISUALIZACIÓN (NO tocan la API)

  /**
   * 3️⃣ PREVISUALIZAR cambios (temporal, no guarda)
   */
  previsualizarCambios(cambios: Partial<ConfiguracionAparienciaData>): void {
    const configActual = this.configuracionSignal();
    if (configActual) {
      const configTemporal = { ...configActual, ...cambios };
      this.aplicarEstilosCSS(configTemporal);
    }
  }

  /**
   * 4️⃣ RESTAURAR configuración original
   */
  restaurarConfiguracion(): void {
    const configOriginal = this.configuracionSignal();
    if (configOriginal) {
      this.aplicarEstilosCSS(configOriginal);
    }
  }

  /**
   * 5️⃣ APLICAR configuración inmediatamente (sin previsualización)
   */
  aplicarConfiguracion(config: ConfiguracionAparienciaData): void {
    this.configuracionSignal.set(config);
    // ✅ El effect() se encarga automáticamente de aplicar los estilos
  }

  // 🎨 MÉTODO PRIVADO - Aplica estilos CSS usando el sistema de la plantilla
  private aplicarEstilosCSS(config: ConfiguracionAparienciaData): void {
    // 🔥 ENFOQUE MEJORADO: Usar el sistema de temas existente de la plantilla
    // La plantilla ya tiene todo configurado con var(--mat-sys-primary), etc.
    // Solo necesitamos inyectar las variables CSS personalizadas

    // Calcular color con transparencia para -fixed-dim (15% opacity)
    const primaryDim = this.hexToRgba(config.color_primario, 0.15);
    const secondaryDim = this.hexToRgba(config.color_secundario, 0.15);

    // Eliminar style anterior si existe
    const oldStyle = document.getElementById('custom-theme-variables');
    if (oldStyle) {
      oldStyle.remove();
    }

    // Crear nuevo <style> con las variables CSS personalizadas
    // ⚠️ IMPORTANTE: Usar mayor especificidad para sobreescribir .blue_theme
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-theme-variables';
    styleElement.textContent = `
      /* 🎨 Configuración de Apariencia Dinámica - Hotel ${config.hotel} */
      /* Mayor especificidad para sobreescribir .blue_theme */
      html, html .blue_theme, html .light-theme, html .dark-theme {
        /* 🎨 COLORES PRINCIPALES */
        --mat-sys-primary: ${config.color_primario} !important;
        --mat-sys-primary-fixed-dim: ${primaryDim} !important;
        --mat-sys-secondary: ${config.color_secundario} !important;
        --mat-sys-secondary-fixed-dim: ${secondaryDim} !important;
        --mat-sys-background: ${config.color_fondo} !important;

        /* 🎨 COLORES ADICIONALES DE MATERIAL DESIGN */
        --mdc-theme-primary: ${config.color_primario} !important;
        --mdc-theme-secondary: ${config.color_secundario} !important;
        --mat-sys-surface-container: ${config.color_fondo} !important;

        /* 🔤 TIPOGRAFÍA */
        --font-family: "${config.familia_fuente}" !important;
        --font-size-base: ${config.tamano_fuente_base}px !important;
      }

      /* 🔤 Aplicar fuente y tamaño en body y elementos principales */
      body,
      .mat-typography,
      .mat-mdc-form-field,
      .mat-mdc-button,
      .mdc-button,
      .mat-mdc-card {
        font-family: "${config.familia_fuente}", "Inter", sans-serif !important;
      }

      body {
        font-size: ${config.tamano_fuente_base}px !important;
      }

      /* 🎨 Color de fondo del body según tema */
      body.light-theme {
        background-color: ${config.color_fondo} !important;
      }
    `;

    // Inyectar en el <head>
    document.head.appendChild(styleElement);

    // 🌙 Aplicar clase de tema (dark/light)
    const body = document.body;
    const html = document.documentElement;

    body.classList.remove('dark-theme', 'light-theme');
    html.classList.remove('dark-theme', 'light-theme');

    const temaClass = config.modo_tema === 'oscuro' ? 'dark-theme' : 'light-theme';
    body.classList.add(temaClass);
    html.classList.add(temaClass);

    console.log('🎨 Tema personalizado aplicado:', {
      hotel: config.hotel,
      primario: config.color_primario,
      secundario: config.color_secundario,
      fondo: config.color_fondo,
      fuente: config.familia_fuente,
      tamaño: config.tamano_fuente_base,
      tema: config.modo_tema
    });
  }

  /**
   * 🎨 Convertir HEX a RGBA
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
