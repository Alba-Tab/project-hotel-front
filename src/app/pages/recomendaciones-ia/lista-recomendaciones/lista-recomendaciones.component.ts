import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecomendacionIA } from '../../../interfaces/recomendacion-ia.interface';
import { RecomendacionIAService } from '../../../services/recomendacion-ia.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lista-recomendaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './lista-recomendaciones.component.html',
  styleUrl: './lista-recomendaciones.component.scss',
})
export class ListaRecomendacionesComponent implements OnInit {
  private recomendacionService = inject(RecomendacionIAService);
  private snackBar = inject(MatSnackBar);

  recomendaciones: RecomendacionIA[] = [];
  cargando = false;
  generando = false;
  entrenando = false;

  ngOnInit(): void {
    this.cargarRecomendaciones();
  }

  /**
   * Cargar recomendaciones actuales del backend
   */
  cargarRecomendaciones(): void {
    this.cargando = true;

    this.recomendacionService.listarRecomendaciones().subscribe({
      next: (response: any) => {
        // Manejar diferentes formatos de respuesta del backend
        if (Array.isArray(response)) {
          this.recomendaciones = response;
        } else if (response && Array.isArray(response.recomendaciones)) {
          this.recomendaciones = response.recomendaciones;
        } else if (response && Array.isArray(response.results)) {
          this.recomendaciones = response.results;
        } else {
          this.recomendaciones = [];
        }

        console.log(`Cargadas ${this.recomendaciones.length} recomendaciones`);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando recomendaciones:', error);
        this.snackBar.open('❌ Error al cargar recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.cargando = false;
      },
    });
  }

  /**
   * Generar nuevas recomendaciones IA
   */
  generarRecomendaciones(): void {
    this.generando = true;

    this.snackBar.open('⏳ Generando recomendaciones...', 'Cerrar', {
      duration: 3000,
    });

    this.recomendacionService.generarRecomendaciones().subscribe({
      next: (resp: any) => {
        const total = resp?.total_generadas || 0;
        const errores = resp?.errores || [];

        if (errores.length > 0) {
          console.warn('Errores al generar recomendaciones:', errores);
          this.snackBar.open(
            `⚠️ Generadas con errores (${total} exitosas)`,
            'Cerrar',
            {
              duration: 4000,
              panelClass: ['warning-snackbar'],
            }
          );
        } else {
          this.snackBar.open(
            `✨ ${total} recomendaciones generadas correctamente`,
            'Cerrar',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
        }

        this.generando = false;
        this.cargarRecomendaciones();
      },
      error: (error) => {
        console.error('Error generando recomendaciones:', error);
        const mensaje =
          error?.error?.error || 'Error al generar recomendaciones';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
        this.generando = false;
      },
    });
  }

  /**
   * Entrenar modelo IA manualmente (secuencial)
   */
  async entrenarIA(): Promise<void> {
    this.entrenando = true;

    // Obtener todos los tipos de las recomendaciones actuales
    const tipos = Array.from(
      new Set(this.recomendaciones.map((r) => r.habitacion_detalle?.tipo))
    ).filter((tipo) => tipo); // Filtrar undefined/null

    if (tipos.length === 0) {
      this.snackBar.open(
        '⚠️ No hay tipos de habitación para entrenar',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['warning-snackbar'],
        }
      );
      this.entrenando = false;
      return;
    }

    this.snackBar.open(
      `🔄 Entrenando IA para ${tipos.length} tipos...`,
      'Cerrar',
      {
        duration: 2000,
      }
    );

    let exitosos = 0;
    let fallidos = 0;
    const resultados: string[] = [];

    // Entrenar secuencialmente cada tipo
    for (const tipo of tipos) {
      try {
        const response = await this.recomendacionService
          .entrenarIA(tipo)
          .toPromise();

        // Validar respuesta del backend
        if (response && typeof response === 'object') {
          const resp = response as any;

          if (resp.exito) {
            exitosos++;
            resultados.push(
              `✅ ${tipo}: ${resp.mensaje} (${resp.confianza?.toFixed(2)}%)`
            );
          } else {
            fallidos++;
            resultados.push(`⚠️ ${tipo}: ${resp.mensaje}`);
          }
        } else {
          exitosos++;
          resultados.push(`✅ ${tipo}: Entrenado`);
        }
      } catch (error: any) {
        fallidos++;
        const mensaje =
          error?.error?.error || error?.message || 'Error desconocido';
        resultados.push(`❌ ${tipo}: ${mensaje}`);
      }
    }

    // Mostrar resumen
    console.log('Resultados de entrenamiento:', resultados);

    if (exitosos > 0 && fallidos === 0) {
      this.snackBar.open(
        `🤖 Todos los modelos entrenados (${exitosos}/${tipos.length})`,
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['success-snackbar'],
        }
      );
    } else if (exitosos > 0) {
      this.snackBar.open(
        `⚠️ Entrenamiento parcial (${exitosos} exitosos, ${fallidos} fallidos)`,
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['warning-snackbar'],
        }
      );
    } else {
      this.snackBar.open(
        `❌ Error al entrenar modelos. Verifica que haya suficientes datos históricos.`,
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    }

    this.entrenando = false;
    this.cargarRecomendaciones();
  }

  /**
   * Formato de valores
   */
  formatearMoneda(valor: any): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(num) ? '0 Bs' : `${num.toFixed(2)} Bs`;
  }

  formatearConfianza(valor: any): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(num) ? '0%' : `${num.toFixed(2)}%`;
  }
}
