import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ServiciosDialog } from './servicios-dialog/servicios-dialog';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-servicios',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss'
})
export class ServiciosComponent implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals para estado reactivo
  servicios = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedService = signal<any | null>(null);
  operationLoading = signal(false);

  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'precio', 'tipo', 'acciones'];

  ngOnInit() {
    this.cargarServicios();
  }

  /**
   * Cargar todos los servicios
   */
  async cargarServicios() {
    try {
      console.log('🔄 Cargando servicios...');
      this.loading.set(true);
      this.error.set(null);

      const response = await firstValueFrom(this.apiService.listar<any>('servicios'));
      console.log('✅ Servicios cargados:', response);

      this.servicios.set(response);
      this.showMessage('Servicios cargados correctamente');
    } catch (error) {
      console.error('❌ Error al cargar servicios:', error);
      this.error.set('Error al cargar servicios');
      this.showMessage('Error al cargar servicios', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crear nuevo servicio
   */
  async crearServicio(servicioData: any) {
    try {
      console.log('🔄 Creando servicio:', servicioData);
      this.operationLoading.set(true);

      const response = await firstValueFrom(this.apiService.crear<any>('servicios', servicioData));
      console.log('✅ Servicio creado:', response);

      // Actualizar la lista local agregando el nuevo servicio
      this.servicios.update(services => [...services, response]);
      this.showMessage('Servicio creado correctamente');

      return response;
    } catch (error) {
      console.error('❌ Error al crear servicio:', error);
      this.showMessage('Error al crear servicio', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Editar servicio existente
   */
  async editarServicio(id: number, servicioData: any) {
    try {
      console.log('🔄 Editando servicio:', id, servicioData);
      this.operationLoading.set(true);

      const response = await firstValueFrom(this.apiService.actualizar<any>('servicios', id, servicioData));
      console.log('✅ Servicio editado:', response);

      // Actualizar la lista local
      this.servicios.update(services =>
        services.map(service => service.id === id ? { ...service, ...response } : service)
      );
      this.showMessage('Servicio editado correctamente');

      return response;
    } catch (error) {
      console.error('❌ Error al editar servicio:', error);
      this.showMessage('Error al editar servicio', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Eliminar servicio
   */
  async eliminarServicio(id: number) {
    try {
      console.log('🔄 Eliminando servicio:', id);
      this.operationLoading.set(true);

      await firstValueFrom(this.apiService.eliminar<any>('servicios', id));
      console.log('✅ Servicio eliminado:', id);

      // Actualizar la lista local removiendo el servicio
      this.servicios.update(services => services.filter(service => service.id !== id));
      this.showMessage('Servicio eliminado correctamente');

    } catch (error) {
      console.error('❌ Error al eliminar servicio:', error);
      this.showMessage('Error al eliminar servicio', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Obtener un servicio específico
   */
  async obtenerServicio(id: number) {
    try {
      console.log('🔄 Obteniendo servicio:', id);
      this.operationLoading.set(true);

      const response = await firstValueFrom(this.apiService.obtener<any>('servicios', id));
      console.log('✅ Servicio obtenido:', response);

      this.selectedService.set(response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener servicio:', error);
      this.showMessage('Error al obtener servicio', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Mostrar mensaje al usuario
   */
  private showMessage(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  /**
   * Métodos de UI para las acciones de la tabla
   */
  onCrearServicio() {
    console.log('➕ Abrir diálogo para crear servicio');

    const dialogRef = this.dialog.open(ServiciosDialog, {
      width: '500px',
      data: { servicio: null }, // null = modo creación
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.action === 'create') {
        await this.crearServicio(result.data);
      }
    });
  }

  onEditarServicio(servicio: any) {
    console.log('🎯 Abrir diálogo para editar servicio:', servicio);

    const dialogRef = this.dialog.open(ServiciosDialog, {
      width: '500px',
      data: { servicio }, // pasar servicio = modo edición
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.action === 'edit') {
        await this.editarServicio(result.serviceId, result.data);
      }
    });
  }

  onEliminarServicio(servicio: any) {
    console.log('🗑️ Confirmar eliminación:', servicio);
    if (confirm(`¿Estás seguro de eliminar el servicio ${servicio.nombre}?`)) {
      this.eliminarServicio(servicio.id);
    }
  }

  onVerDetalles(servicio: any) {
    console.log('👀 Ver detalles:', servicio);
    this.obtenerServicio(servicio.id);
  }
}


