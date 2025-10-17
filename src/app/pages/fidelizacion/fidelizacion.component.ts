import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FidelizacionDialogComponent } from './fidelizacion-dialog/fidelizacion-dialog.component';
import { CuentaFidelizacionDialogComponent } from './cuenta-fidelizacion-dialog/cuenta-fidelizacion-dialog.component';
import { AcumularPuntosDialogComponent } from './acumular-puntos-dialog/acumular-puntos-dialog.component';
import { CanjearPuntosDialogComponent } from './canjear-puntos-dialog/canjear-puntos-dialog.component';

@Component({
  selector: 'app-fidelizacion',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './fidelizacion.component.html',
  styleUrls: ['./fidelizacion.component.scss'],
})
export class FidelizacionComponent implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals para programas
  programas = signal<any[]>([]);
  displayedColumnsProgramas: string[] = [
    'nombre',
    'descripcion',
    'descuento_maximo',
    'puntos_por_dolar',
    'activo',
    'acciones',
  ];

  // Signals para cuentas de fidelización
  cuentas = signal<any[]>([]);
  displayedColumnsCuentas: string[] = [
    'cliente',
    'programa',
    'puntos',
    'descuento_disponible',
    'acciones',
  ];

  ngOnInit() {
    this.cargarProgramas();
    this.cargarCuentas();
  }

  // ==================== PROGRAMAS ====================

  cargarProgramas() {
    this.apiService.listar<any>('fidelizacion/programas').subscribe({
      next: (data) => this.programas.set(data),
      error: (err) =>
        this.snackBar.open('Error al cargar programas', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  agregarPrograma() {
    const dialogRef = this.dialog.open(FidelizacionDialogComponent, {
      width: '500px',
      data: { programa: null },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cargarProgramas();
      }
    });
  }

  editarPrograma(programa: any) {
    const dialogRef = this.dialog.open(FidelizacionDialogComponent, {
      width: '500px',
      data: { programa },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cargarProgramas();
      }
    });
  }

  eliminarPrograma(programaId: number) {
    if (confirm('¿Está seguro de eliminar este programa de fidelización?')) {
      this.apiService
        .eliminar<any>('fidelizacion/programas', programaId)
        .subscribe({
          next: () => {
            this.snackBar.open('Programa eliminado', 'Cerrar', {
              duration: 3000,
            });
            this.cargarProgramas();
          },
          error: (err) =>
            this.snackBar.open('Error al eliminar programa', 'Cerrar', {
              duration: 3000,
            }),
        });
    }
  }

  // ==================== CUENTAS DE FIDELIZACIÓN ====================

  cargarCuentas() {
    this.apiService.listar<any>('fidelizacion/cuentas').subscribe({
      next: (data) => this.cuentas.set(data),
      error: (err) =>
        this.snackBar.open('Error al cargar cuentas', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  agregarCuenta() {
    const dialogRef = this.dialog.open(CuentaFidelizacionDialogComponent, {
      width: '500px',
      data: { cuenta: null, programas: this.programas() },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cargarCuentas();
      }
    });
  }

  acumularPuntos(cuenta: any) {
    const dialogRef = this.dialog.open(AcumularPuntosDialogComponent, {
      width: '400px',
      data: { cuenta },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cargarCuentas();
      }
    });
  }

  canjearPuntos(cuenta: any) {
    const dialogRef = this.dialog.open(CanjearPuntosDialogComponent, {
      width: '400px',
      data: { cuenta },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.cargarCuentas();
      }
    });
  }

  eliminarCuenta(cuentaId: number) {
    if (confirm('¿Está seguro de eliminar esta cuenta de fidelización?')) {
      this.apiService
        .eliminar<any>('fidelizacion/cuentas', cuentaId)
        .subscribe({
          next: () => {
            this.snackBar.open('Cuenta eliminada', 'Cerrar', {
              duration: 3000,
            });
            this.cargarCuentas();
          },
          error: (err) =>
            this.snackBar.open('Error al eliminar cuenta', 'Cerrar', {
              duration: 3000,
            }),
        });
    }
  }
}
