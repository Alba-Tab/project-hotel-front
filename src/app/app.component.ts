import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfiguracionAparienciaService } from './services/configuracion-apariencia.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Modernize Angular Admin Tempplate';

  // 🎨 Inyectar servicio de configuración
  private configuracionService = inject(ConfiguracionAparienciaService);

  ngOnInit() {
    // 🔥 Solo cargar configuración si el usuario está autenticado
    const token = localStorage.getItem('access_token');
    if (token) {
      this.cargarConfiguracionInicial();
    }
  }

  private cargarConfiguracionInicial() {
    // Obtener hotelId del usuario autenticado
    const hotelId = this.configuracionService.obtenerHotelIdActual();

    console.log('🎨 Cargando configuración de apariencia para hotel:', hotelId);

    this.configuracionService.cargarConfiguracion(hotelId).subscribe({
      next: (config) => {
        console.log(
          '✅ Configuración de apariencia aplicada al inicio:',
          config
        );
      },
      error: (error) => {
        console.warn(
          '⚠️ No se pudo cargar configuración de apariencia (usando valores por defecto):',
          error
        );
      },
    });
  }
}
