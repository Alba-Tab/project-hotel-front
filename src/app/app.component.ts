import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfiguracionAparienciaService } from './services/configuracion-apariencia.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'Modernize Angular Admin Tempplate';

  // 🎨 Inyectar servicio de configuración
  private configuracionService = inject(ConfiguracionAparienciaService);

  ngOnInit() {
    // 🔥 Cargar configuración del hotel al iniciar la app
    this.cargarConfiguracionInicial();
  }

  private cargarConfiguracionInicial() {
    console.log('🎨 Cargando configuración de apariencia del hotel del usuario autenticado...');

    this.configuracionService.cargarConfiguracion().subscribe({
      next: (config) => {
        console.log('✅ Configuración de apariencia aplicada al inicio:', config);
      },
      error: (error) => {
        console.warn('⚠️ No se pudo cargar configuración de apariencia (usando valores por defecto):', error);
      }
    });
  }
}
