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
import { UsuariosDialog } from './usuarios-dialog/usuarios-dialog';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  usuarioPermisos = signal<any[]>([]);

  // 🧪 PRUEBA DE SIGNALS - Signal contador para verificar reactividad
  testCounter = signal(0);

  // Signals para estado reactivo
  usuarios = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedUser = signal<any | null>(null);
  operationLoading = signal(false);

  displayedColumns: string[] = [
    'id',
    'username',
    'first_name',
    'last_name',
    'email',
    'groups',
    'acciones',
  ];

  ngOnInit() {
    this.obtenerPermisosUsuarioActual();
    this.cargarUsuarios();

    //   // 🧪 PRUEBA: Incrementar contador cada 2 segundos para verificar reactividad
    //   setInterval(() => {
    //     this.testCounter.update(count => count + 1);
    //     console.log('🧪 Contador actualizado:', this.testCounter());
    //   }, 2000);

    //   // 🧪 PRUEBA: Agregar permisos de prueba cada 3 segundos
    //   setTimeout(() => {
    //     this.usuarioPermisos.set(['add_user', 'change_user']);
    //     console.log('🧪 Permisos añadidos:', this.usuarioPermisos());
    //   }, 3000);

    //   setTimeout(() => {
    //     this.usuarioPermisos.update(perms => [...perms, 'delete_user']);
    //     console.log('🧪 Permiso delete añadido:', this.usuarioPermisos());
    //   }, 6000);
  }

  /**
   * Cargar todos los usuarios
   */

  async obtenerPermisosUsuarioActual() {
    try {
      console.log('🔄 Obteniendo permisos del usuario actual...');
      const response = await firstValueFrom(
        this.apiService.listar<any>('usuarios/me')
      );
      console.log('✅ Datos obtenidos del usuario actual:', response);
      this.usuarioPermisos.set(response.permissions || []);
      console.log('🔐 Permisos del usuario actual:', this.usuarioPermisos());
    } catch (error) {
      console.error('❌ Error al obtener permisos del usuario actual:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async cargarUsuarios() {
    try {
      console.log('🔄 Cargando usuarios...');
      this.loading.set(true);
      this.error.set(null);

      const response = await firstValueFrom(
        this.apiService.listar<any>('usuarios')
      );
      console.log('✅ Usuarios cargados:', response);

      this.usuarios.set(response);
      this.showMessage('Usuarios cargados correctamente');
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      this.error.set('Error al cargar usuarios');
      this.showMessage('Error al cargar usuarios', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crear nuevo usuario
   */
  async crearUsuario(userData: any) {
    try {
      console.log('🔄 Creando usuario:', userData);
      this.operationLoading.set(true);

      // Crear FormData si hay foto
      let dataToSend: any;
      if (userData.photo instanceof File) {
        const formData = new FormData();
        Object.keys(userData).forEach((key) => {
          if (key === 'photo') {
            formData.append(key, userData[key]);
          } else if (key === 'group_ids' && Array.isArray(userData[key])) {
            userData[key].forEach((id: number) =>
              formData.append('group_ids', id.toString())
            );
          } else if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });
        dataToSend = formData;
      } else {
        // Si no hay foto, remover el campo del objeto
        const { photo, ...dataWithoutPhoto } = userData;
        dataToSend = dataWithoutPhoto;
      }

      const response = await firstValueFrom(
        this.apiService.crear<any>('usuarios', dataToSend)
      );
      console.log('✅ Usuario creado:', response);

      // Actualizar la lista local agregando el nuevo usuario
      this.usuarios.update((users) => [...users, response]);
      this.showMessage('Usuario creado correctamente');

      return response;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      this.showMessage('Error al crear usuario', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Editar usuario existente
   */
  async editarUsuario(id: number, userData: any) {
    try {
      console.log('🔄 Editando usuario:', id, userData);
      this.operationLoading.set(true);

      // Crear FormData si hay foto
      let dataToSend: any;
      if (userData.photo instanceof File) {
        const formData = new FormData();
        Object.keys(userData).forEach((key) => {
          if (key === 'photo') {
            formData.append(key, userData[key]);
          } else if (key === 'group_ids' && Array.isArray(userData[key])) {
            userData[key].forEach((id: number) =>
              formData.append('group_ids', id.toString())
            );
          } else if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });
        dataToSend = formData;
      } else {
        // Si no hay foto nueva, remover el campo photo del objeto
        const { photo, ...dataWithoutPhoto } = userData;
        dataToSend = dataWithoutPhoto;
      }

      const response = await firstValueFrom(
        this.apiService.actualizar<any>('usuarios', id, dataToSend)
      );
      console.log('✅ Usuario editado:', response);

      // Actualizar la lista local
      this.usuarios.update((users) =>
        users.map((user) => (user.id === id ? { ...user, ...response } : user))
      );
      this.showMessage('Usuario editado correctamente');

      return response;
    } catch (error) {
      console.error('❌ Error al editar usuario:', error);
      this.showMessage('Error al editar usuario', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Eliminar usuario
   */
  async eliminarUsuario(id: number) {
    try {
      console.log('🔄 Eliminando usuario:', id);
      this.operationLoading.set(true);

      await firstValueFrom(this.apiService.eliminar<any>('usuarios', id));
      console.log('✅ Usuario eliminado:', id);

      // Actualizar la lista local removiendo el usuario
      this.usuarios.update((users) => users.filter((user) => user.id !== id));
      this.showMessage('Usuario eliminado correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      this.showMessage('Error al eliminar usuario', 'error');
      throw error;
    } finally {
      this.operationLoading.set(false);
    }
  }

  /**
   * Obtener un usuario específico
   */
  async obtenerUsuario(id: number) {
    try {
      console.log('🔄 Obteniendo usuario:', id);
      this.operationLoading.set(true);

      const response = await firstValueFrom(
        this.apiService.obtener<any>('usuarios', id)
      );
      console.log('✅ Usuario obtenido:', response);

      this.selectedUser.set(response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      this.showMessage('Error al obtener usuario', 'error');
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
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar'],
    });
  }

  /**
   * Métodos de UI para las acciones de la tabla
   */
  onCrearUsuario() {
    console.log('➕ Abrir diálogo para crear usuario');

    const dialogRef = this.dialog.open(UsuariosDialog, {
      width: '500px',
      data: { usuario: null }, // null = modo creación
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.action === 'create') {
        await this.crearUsuario(result.data);
        // 🔄 Refrescar permisos si se creó usuario (por si afecta permisos)
        await this.obtenerPermisosUsuarioActual();
      }
    });
  }

  onEditarUsuario(usuario: any) {
    console.log('🎯 Abrir diálogo para editar usuario:', usuario);

    const dialogRef = this.dialog.open(UsuariosDialog, {
      width: '500px',
      data: { usuario }, // pasar usuario = modo edición
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.action === 'edit') {
        await this.editarUsuario(result.userId, result.data);
        // 🔄 Refrescar permisos después de editar usuario (por si cambió roles)
        await this.obtenerPermisosUsuarioActual();
      }
    });
  }

  onEliminarUsuario(usuario: any) {
    console.log('🗑️ Confirmar eliminación:', usuario);
    // Aquí deberías mostrar un diálogo de confirmación
    // Por ahora elimino directamente para pruebas
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.username}?`)) {
      this.eliminarUsuario(usuario.id);
    }
  }

  onVerDetalles(usuario: any) {
    console.log('👀 Ver detalles:', usuario);
    this.obtenerUsuario(usuario.id);
  }
}
