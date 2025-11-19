import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { ConfiguracionAparienciaService } from '../../services/configuracion-apariencia.service';
import { ConfiguracionAparienciaData, FUENTES_DISPONIBLES } from '../../models/configuracion-apariencia.interface';

@Component({
  selector: 'app-configuracion-apariencia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './configuracion-apariencia.html',
  styleUrl: './configuracion-apariencia.scss'
})
export class ConfiguracionApariencia implements OnInit {

  // 🔥 INYECCIONES MODERNAS
  private fb = inject(FormBuilder);
  private configuracionService = inject(ConfiguracionAparienciaService);
  private snackBar = inject(MatSnackBar);

  // 🔥 SIGNALS LOCALES
  guardando = signal(false);
  previsualizando = signal(false);
  hotelId = signal(this.configuracionService.obtenerHotelIdActual());

  // 🔥 COMPUTED DESDE EL SERVICE
  configuracion = this.configuracionService.configuracion;
  cargando = this.configuracionService.cargando;
  temaActivo = this.configuracionService.temaActivo;
  coloresActivos = this.configuracionService.coloresActivos;

  // 🔥 DATOS CONSTANTES
  fuentesDisponibles = FUENTES_DISPONIBLES;
  temasDisponibles = [
    { value: 'claro', label: 'Claro' },
    { value: 'oscuro', label: 'Oscuro' }
  ];

  // 🔥 FORMULARIO REACTIVO
  formulario: FormGroup = this.fb.group({
    color_primario: ['#00a1ff', Validators.required],
    color_secundario: ['#16cdc7', Validators.required],
    color_fondo: ['#f8fafd', Validators.required],
    familia_fuente: ['Inter', Validators.required],
    tamano_fuente_base: [14, [Validators.required, Validators.min(10), Validators.max(24)]],
    modo_tema: ['claro', Validators.required]
  });

  constructor() {
    // 🔥 EFFECT - Previsualización automática mientras escribes
    effect(() => {
      if (this.previsualizando()) {
        const valores = this.formulario.value;
        this.configuracionService.previsualizarCambios(valores);
      }
    });

    // 🔥 EFFECT - Cargar datos en el formulario cuando llegan del service
    effect(() => {
      const config = this.configuracion();
      if (config && !this.guardando()) {
        this.cargarDatosEnFormulario(config);
      }
    });
  }

  ngOnInit(): void {
    this.cargarConfiguracion();
    this.configurarListeners();
  }

  // 📡 CARGAR CONFIGURACIÓN INICIAL
  private cargarConfiguracion(): void {
    const id = this.hotelId();
    this.configuracionService.cargarConfiguracion(id).subscribe({
      next: () => {
        console.log('✅ Configuración cargada');
      },
      error: (error) => {
        console.error('❌ Error al cargar configuración:', error);
        this.mostrarMensaje('Error al cargar configuración', 'error');
      }
    });
  }

  // 🎨 CONFIGURAR LISTENERS DEL FORMULARIO
  private configurarListeners(): void {
    // Previsualización en tiempo real cuando cambia cualquier campo
    this.formulario.valueChanges.subscribe(() => {
      if (this.previsualizando()) {
        const valores = this.formulario.value;
        this.configuracionService.previsualizarCambios(valores);
      }
    });
  }

  // 📝 CARGAR DATOS EN EL FORMULARIO
  private cargarDatosEnFormulario(config: ConfiguracionAparienciaData): void {
    this.formulario.patchValue({
      color_primario: config.color_primario,
      color_secundario: config.color_secundario,
      color_fondo: config.color_fondo,
      familia_fuente: config.familia_fuente,
      tamano_fuente_base: config.tamano_fuente_base,
      modo_tema: config.modo_tema
    }, { emitEvent: false }); // No emitir evento para evitar bucle
  }

  // 🎨 ACTIVAR/DESACTIVAR PREVISUALIZACIÓN
  togglePrevisualizacion(): void {
    this.previsualizando.update(prev => !prev);

    if (this.previsualizando()) {
      this.mostrarMensaje('Previsualización activada', 'success');
      // Aplicar inmediatamente
      const valores = this.formulario.value;
      this.configuracionService.previsualizarCambios(valores);
    } else {
      this.configuracionService.restaurarConfiguracion();
      this.mostrarMensaje('Previsualización desactivada', 'info');
    }
  }

  // 💾 GUARDAR CONFIGURACIÓN
  guardarConfiguracion(): void {
    if (this.formulario.invalid) {
      this.mostrarMensaje('Por favor, completa todos los campos', 'error');
      return;
    }

    this.guardando.set(true);
    const hotelId = this.hotelId();
    const datos = this.formulario.value;

    this.configuracionService.guardarConfiguracion(hotelId, datos).subscribe({
      next: (config) => {
        console.log('✅ Configuración guardada:', config);
        this.mostrarMensaje('Configuración guardada correctamente', 'success');
        this.previsualizando.set(false); // Desactivar previsualización
      },
      error: (error) => {
        console.error('❌ Error al guardar:', error);
        this.mostrarMensaje('Error al guardar configuración', 'error');
      },
      complete: () => {
        this.guardando.set(false);
      }
    });
  }

  // 🔄 RESTABLECER VALORES POR DEFECTO
  restablecerDefecto(): void {
    const valoresPorDefecto: Partial<ConfiguracionAparienciaData> = {
      color_primario: '#00a1ff',
      color_secundario: '#16cdc7',
      color_fondo: '#f8fafd',
      familia_fuente: 'Inter',
      tamano_fuente_base: 14,
      modo_tema: 'claro'
    };

    this.formulario.patchValue(valoresPorDefecto);

    if (this.previsualizando()) {
      this.configuracionService.previsualizarCambios(valoresPorDefecto);
    }

    this.mostrarMensaje('Valores restablecidos por defecto', 'info');
  }

  // 🎨 MOSTRAR MENSAJES
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      panelClass: [`${tipo}-snackbar`]
    };

    this.snackBar.open(mensaje, 'Cerrar', config);
  }

  // 🎯 GETTERS PARA EL TEMPLATE
  get colorPrimario() { return this.formulario.get('color_primario'); }
  get colorSecundario() { return this.formulario.get('color_secundario'); }
  get colorFondo() { return this.formulario.get('color_fondo'); }
  get familiaFuente() { return this.formulario.get('familia_fuente'); }
  get tamanoFuenteBase() { return this.formulario.get('tamano_fuente_base'); }
  get modoTema() { return this.formulario.get('modo_tema'); }
}
