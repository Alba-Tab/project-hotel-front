import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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
import { RolesPermisosDialog } from './roles-permisos-dialog/roles-permisos-dialog';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-roles-permisos',
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
  templateUrl: './roles-permisos.html',
  styleUrl: './roles-permisos.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush, // 🚀 Importante
  // signals: true, // 🚀 Esencial para que los signals refresquen la UI
})
export class RolesPermisos implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals para estado reactivo
  usuarioPermisos = signal<any[]>([]);
  roles = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedRol = signal<any | null>(null);
  operationLoading = signal(false);

  displayedColumns: string[] = ['id', 'name', 'permisos_count', 'created_at', 'acciones'];

  async ngOnInit() {
    await this.obtenerPermisosUsuarioActual();
    await this.cargarRoles();

  }


  async obtenerPermisosUsuarioActual() {
    try {
      console.log('🔄 Obteniendo permisos del usuario actual...')
      const response = await firstValueFrom(this.apiService.listar<any>('usuarios/me'))
      console.log('✅ Datos obtenidos del usuario actual:', response)
      this.usuarioPermisos.set(response.permissions || [])
      console.log('🔐 Permisos del usuario actual:', this.usuarioPermisos())
    } catch (error) {
      console.error('❌ Error al obtener permisos del usuario actual:', error)
    } finally {
      this.loading.set(false);
    }
  }


  /**
   * Cargar todos los roles
   */
  async cargarRoles() {
    try {
      console.log('🔄 Cargando roles...');
      this.loading.set(true);
      this.error.set(null);

      const response = await firstValueFrom(this.apiService.listar<any>('roles'));
      console.log('✅ Roles cargados:', response);

      this.roles.set(response);
      this.showMessage('Roles cargados correctamente');
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      this.error.set('Error al cargar roles');
      this.showMessage('Error al cargar roles', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crear nuevo rol
   */
  async crearRol(rolData: any) {
    try {
      console.log('🔄 Creando rol:', rolData);
      this.operationLoading.set(true);

      const response = await firstValueFrom(this.apiService.crear<any>('roles', rolData));
      console.log('✅ Rol creado:', response);

      // Actualizar la lista local agregando el nuevo rol
      this.roles.update(roles => [...roles, response]);
      this.showMessage('Rol creado correctamente');

      return response;
    } catch (error) {
      console.error('❌ Error al crear rol:', error);
      this.showMessage('Error al crear rol', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Editar rol existente
   */
  async editarRol(id: number, rolData: any) {
    try {
      console.log('🔄 Editando rol:', id, rolData);
      this.operationLoading.set(true);

      const response = await firstValueFrom(this.apiService.actualizar<any>('roles', id, rolData));
      console.log('✅ Rol editado:', response);

      // Actualizar la lista local
      this.roles.update(roles =>
        roles.map(rol => rol.id === id ? { ...rol, ...response } : rol)
      );
      this.showMessage('Rol editado correctamente');

      return response;
    } catch (error) {
      console.error('❌ Error al editar rol:', error);
      this.showMessage('Error al editar rol', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Eliminar rol
   */
  async eliminarRol(id: number) {
    try {
      console.log('🔄 Eliminando rol:', id);
      this.operationLoading.set(true);

      await firstValueFrom(this.apiService.eliminar<any>('roles', id));
      console.log('✅ Rol eliminado:', id);

      // Actualizar la lista local removiendo el rol
      this.roles.update(roles => roles.filter(rol => rol.id !== id));
      this.showMessage('Rol eliminado correctamente');

    } catch (error) {
      console.error('❌ Error al eliminar rol:', error);
      this.showMessage('Error al eliminar rol', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Obtener un rol específico con sus permisos
   */
  async obtenerRol(id: number) {
    try {
      console.log('🔄 Obteniendo rol:', id);
      this.operationLoading.set(true);

      const response = await firstValueFrom(this.apiService.obtener<any>('roles', id));
      console.log('✅ Rol obtenido:', response);

      this.selectedRol.set(response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener rol:', error);
      this.showMessage('Error al obtener rol', 'error');
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
  onCrearRol() {
    console.log('➕ Abrir diálogo para crear rol');

    const dialogRef = this.dialog.open(RolesPermisosDialog, {
      width: '600px',
      maxHeight: '80vh',
      data: { rol: null }, // null = modo creación
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.action === 'create') {
        await this.crearRol(result.data);
        // 🔄 Refrescar permisos del usuario actual después de crear rol
        await this.obtenerPermisosUsuarioActual();
      }
    });
  }

  onEditarRol(rol: any) {
    console.log('🎯 Abrir diálogo para editar rol:', rol);

    const dialogRef = this.dialog.open(RolesPermisosDialog, {
      width: '600px',
      maxHeight: '80vh',
      data: { rol }, // pasar rol = modo edición
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.action === 'edit') {
        await this.editarRol(result.rolId, result.data);
        // 🔄 Refrescar permisos del usuario actual después de editar rol
        await this.obtenerPermisosUsuarioActual();
      }
    });
  }

  onEliminarRol(rol: any) {
    console.log('🗑️ Confirmar eliminación:', rol);

    if (confirm(`¿Estás seguro de eliminar el rol "${rol.nombre}"?`)) {
      this.eliminarRol(rol.id).then(async () => {
        // 🔄 Refrescar permisos del usuario actual después de eliminar rol
        await this.obtenerPermisosUsuarioActual();
      });
    }
  }

  onVerDetalles(rol: any) {
    console.log('👀 Ver detalles:', rol);
    this.obtenerRol(rol.id);
  }

}
