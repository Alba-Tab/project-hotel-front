import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackupService } from '../../../services/backup.service';
import { Backup } from '../../../interfaces/backup.interface';
import { ConfirmRestoreDialogComponent } from './confirm-restore-dialog.component';

@Component({
  selector: 'app-lista-backups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './lista-backups.component.html',
  styleUrl: './lista-backups.component.scss'
})
export class ListaBackupsComponent implements OnInit {
  private backupService = inject(BackupService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Tabla
  displayedColumns: string[] = [
    'id',
    'fecha',
    'backup_type_display',
    'tenant_schema',
    'tipo_display',
    'estado',
    'tamaño_mb',
    'duracion_segundos',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Backup>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtros
  filtros = {
    tipo: '',
    estado: '',
    backup_type: ''
  };

  // Estado
  cargando = false;
  backups: Backup[] = [];

  // Opciones para los selects
  tiposBackup = [
    { value: '', label: 'Todos' },
    { value: 'manual', label: 'Manual' },
    { value: 'auto_daily', label: 'Automático Diario' },
    { value: 'auto_weekly', label: 'Automático Semanal' },
    { value: 'auto_monthly', label: 'Automático Mensual' }
  ];

  estadosBackup = [
    { value: '', label: 'Todos' },
    { value: 'ok', label: 'Correcto' },
    { value: 'error', label: 'Fallido' },
    { value: 'en_progreso', label: 'En Progreso' }
  ];

  tiposBackupType = [
    { value: '', label: 'Todos' },
    { value: 'full', label: 'Completo' },
    { value: 'tenant', label: 'Por Tenant' }
  ];

  ngOnInit(): void {
    this.cargarBackups();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Cargar lista de backups
   */
  cargarBackups(): void {
    this.cargando = true;

    this.backupService.listarBackups(this.filtros).subscribe({
      next: (data: any) => {
        this.backups = data;
        this.dataSource.data = data;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar backups:', error);
        this.snackBar.open('Error al cargar los backups', 'Cerrar', {
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
   // Filtrar localmente los datos ya cargados
    console.log('🔍 Filtros actuales:', this.filtros);

    let datosFiltrados = [...this.backups];

    // Filtrar por tipo (frecuencia)
    if (this.filtros.tipo) {
      console.log('Filtrando por tipo:', this.filtros.tipo);
      datosFiltrados = datosFiltrados.filter(b => b.tipo === this.filtros.tipo);
    }

    // Filtrar por estado
    if (this.filtros.estado) {
      console.log('Filtrando por estado:', this.filtros.estado);
      datosFiltrados = datosFiltrados.filter(b => b.estado === this.filtros.estado);
    }

    // Filtrar por tipo de backup
    if (this.filtros.backup_type) {
      console.log('Filtrando por backup_type:', this.filtros.backup_type);
      datosFiltrados = datosFiltrados.filter(b => b.backup_type === this.filtros.backup_type);
    }

    console.log('📊 Total original:', this.backups.length, '| Filtrados:', datosFiltrados.length);

    // Actualizar la tabla
    this.dataSource.data = datosFiltrados;

    // Resetear paginador a la primera página
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      tipo: '',
      estado: '',
      backup_type: ''
    };
    // Restaurar todos los datos originales
    this.dataSource.data = this.backups;

    // Resetear paginador
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Filtro de búsqueda en la tabla
   */
  aplicarFiltroTabla(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Descargar backup
   */
  descargarBackup(backup: Backup): void {
    if (backup.estado !== 'ok') {
      this.snackBar.open('Solo se pueden descargar backups exitosos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.backupService.descargarBackup(backup.id);
    this.snackBar.open('Descargando backup...', 'Cerrar', {
      duration: 2000
    });
  }

  /**
   * Restaurar backup (con confirmación)
   */
  restaurarBackup(backup: Backup): void {
    if (backup.estado !== 'ok') {
      this.snackBar.open('⚠️ Solo se pueden restaurar backups exitosos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Diálogo de confirmación más elegante
    const dialogRef = this.dialog.open(ConfirmRestoreDialogComponent, {
      width: '500px',
      data: {
        backup: backup,
        titulo: '🔄 Restaurar Backup',
        mensaje: `¿Estás seguro de restaurar la base de datos a esta versión?`,
        detalles: [
          { label: 'Tipo', value: backup.backup_type_display },
          { label: 'Tenant', value: backup.tenant_schema || 'Todos' },
          { label: 'Fecha', value: new Date(backup.fecha).toLocaleString('es-ES') },
          { label: 'Tamaño', value: `${backup.tamano_mb} MB` },
          { label: 'Frecuencia', value: backup.tipo_display }
        ],
        advertencia: '⚠️ Esta acción reemplazará todos los datos actuales. Asegúrate de tener un backup reciente.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.ejecutarRestauracion(backup);
      }
    });
  }

  /**
   * Ejecutar la restauración del backup
   */
  private ejecutarRestauracion(backup: Backup): void {
    console.log('🔄 Iniciando restauración del backup:', backup.id);

    this.snackBar.open('⏳ Iniciando restauración... Esto puede tardar varios minutos.', 'Cerrar', {
      duration: 5000,
      panelClass: ['info-snackbar']
    });

    this.backupService.restaurarBackup(backup.id).subscribe({
      next: (response: any) => {
        console.log('✅ Restauración exitosa:', response);

        this.snackBar.open(
          `✅ ${response.mensaje || 'Backup restaurado exitosamente'}`,
          'Cerrar',
          {
            duration: 8000,
            panelClass: ['success-snackbar']
          }
        );

        // Mostrar detalles adicionales si existen
        if (response.backup_id) {
          console.log('📋 Backup ID:', response.backup_id);
        }
        if (response.tipo) {
          console.log('📦 Tipo:', response.tipo);
        }
        if (response.tenant) {
          console.log('🏢 Tenant:', response.tenant);
        }
        if (response.duracion_segundos) {
          console.log('⏱️ Duración:', response.duracion_segundos, 'segundos');
        }

        // Recargar la lista de backups
        this.cargarBackups();
      },
      error: (error: any) => {
        console.error('❌ Error al restaurar backup:', error);

        let mensajeError = 'Error al restaurar el backup';
        if (error.error?.error) {
          mensajeError = error.error.error;
        } else if (error.message) {
          mensajeError = error.message;
        }

        this.snackBar.open(`❌ ${mensajeError}`, 'Cerrar', {
          duration: 8000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Eliminar backup (con confirmación)
   */
  eliminarBackup(backup: Backup): void {
    const confirmar = confirm(
      `¿Estás seguro de eliminar este backup?\n\n` +
      `Tipo: ${backup.backup_type_display}\n` +
      `Fecha: ${new Date(backup.fecha).toLocaleString()}\n` +
      `Tamaño: ${backup.tamano_mb} MB`
    );

    if (!confirmar) return;

    this.backupService.eliminarBackup(backup.id).subscribe({
      next: () => {
        this.snackBar.open('Backup eliminado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.cargarBackups();
      },
      error: (error: any) => {
        console.error('Error al eliminar backup:', error);
        this.snackBar.open('Error al eliminar el backup', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Obtener clase CSS según el estado
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'ok':
        return 'estado-ok';
      case 'error':
        return 'estado-error';
      case 'en_progreso':
        return 'estado-progreso';
      default:
        return '';
    }
  }

  /**
   * Obtener color del chip según el estado
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ok':
        return 'primary';
      case 'error':
        return 'warn';
      case 'en_progreso':
        return 'accent';
      default:
        return '';
    }
  }

  /**
   * Formatear duración en formato legible
   */
  formatearDuracion(segundos: number): string {
    if (segundos < 60) {
      return `${segundos}s`;
    }
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}m ${segs}s`;
  }
}
