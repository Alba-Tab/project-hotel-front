
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
    MatIconModule
  ],
  templateUrl: './lista-recomendaciones.component.html',
  styleUrl: './lista-recomendaciones.component.scss'
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
        this.recomendaciones = Array.isArray(response)
          ? response
          : (response.recomendaciones || []);
        this.cargando = false;
      },
      error: () => {
        this.snackBar.open('❌ Error al cargar recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.cargando = false;
      }
    });
  }

  /**
   * Generar nuevas recomendaciones IA
   */
  generarRecomendaciones(): void {
    this.generando = true;

    this.snackBar.open('⏳ Generando recomendaciones...', 'Cerrar', {
      duration: 3000
    });

    this.recomendacionService.generarRecomendaciones().subscribe({
      next: (resp) => {
        this.snackBar.open('✨ Recomendaciones generadas correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.generando = false;
        this.cargarRecomendaciones();
      },
      error: () => {
        this.snackBar.open('❌ Error al generar recomendaciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.generando = false;
      }
    });
  }

  /**
   * Entrenar modelo IA manualmente
   */
  entrenarIA(): void {
    this.entrenando = true;

    this.snackBar.open('🔄 Entrenando IA para todos los tipos...', 'Cerrar', { duration: 2000 });

    // Obtener todos los tipos de las recomendaciones actuales
    const tipos = Array.from(
      new Set(this.recomendaciones.map(r => r.habitacion_detalle.tipo))
    );

    let completados = 0;

    tipos.forEach(tipo => {
      this.recomendacionService.entrenarIA(tipo).subscribe({
        next: () => {
          completados++;

          if (completados === tipos.length) {
            this.snackBar.open(`🤖 Modelos entrenados correctamente`, 'Cerrar', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.entrenando = false;
            this.cargarRecomendaciones();
          }
        },
        error: () => {
          this.snackBar.open(`❌ Error entrenando tipo ${tipo}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.entrenando = false;
        }
      });
    });
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
