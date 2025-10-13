import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-roles-permisos-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './roles-permisos-dialog.html',
  styleUrl: './roles-permisos-dialog.scss'
})
export class RolesPermisosDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RolesPermisosDialog>);
  private data = inject(MAT_DIALOG_DATA);
  private apiService = inject(ApiService);

  // Signals para estado reactivo
  loading = signal(false);
  loadingPermisos = signal(true);
  isEditMode = signal(false);

  // Datos
  permisosDisponibles = signal<any[]>([]);
  permisosSeleccionados = signal<number[]>([]);

  rolForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadPermisos();
    this.loadRolData();
  }

  /**
   * Inicializar formulario reactivo
   */
  private initForm() {
    this.rolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      permisos: this.fb.array([]) // Array de permisos seleccionados
    });
  }

  /**
   * Cargar lista de permisos disponibles desde el backend
   */
  private async loadPermisos() {
    try {
      console.log('🔄 Cargando permisos disponibles...');
      this.loadingPermisos.set(true);

      const response = await firstValueFrom(this.apiService.listar<any>('permisos'));
      console.log('✅ Permisos cargados:', response);

      this.permisosDisponibles.set(response);
    } catch (error) {
      console.error('❌ Error al cargar permisos:', error);
    } finally {
      this.loadingPermisos.set(false);
    }
  }

  /**
   * Cargar datos del rol si está en modo edición
   */
  private loadRolData() {
    if (this.data?.rol) {
      this.isEditMode.set(true);
      console.log('🔧 Modo edición - Rol:', this.data.rol);

      // Llenar formulario con datos existentes
      this.rolForm.patchValue({
        name: this.data.rol.name
      });

      // Configurar permisos seleccionados
      if (this.data.rol.permissions) {
        const permisosIds = this.data.rol.permissions.map((p: any) => p.id);
        this.permisosSeleccionados.set(permisosIds);
        console.log('🔑 Permisos del rol:', permisosIds);
      }
    } else {
      this.isEditMode.set(false);
      console.log('➕ Modo creación - Nuevo rol');
    }
  }

  /**
   * Obtener título del diálogo
   */
  getTitle(): string {
    return this.isEditMode() ? 'Editar Rol y Permisos' : 'Crear Nuevo Rol';
  }

  /**
   * Obtener texto del botón principal
   */
  getButtonText(): string {
    return this.isEditMode() ? 'Actualizar' : 'Crear';
  }

  /**
   * Verificar si un campo tiene errores
   */
  hasError(fieldName: string): boolean {
    const field = this.rolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.rolForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Nombre del rol es requerido';
    }
    if (field.errors['minlength']) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return '';
  }

  /**
   * Verificar si un permiso está seleccionado
   */
  isPermisoSelected(permisoId: number): boolean {
    return this.permisosSeleccionados().includes(permisoId);
  }

  /**
   * Manejar cambio en checkbox de permiso
   */
  onPermisoChange(permisoId: number, checked: boolean) {
    const current = this.permisosSeleccionados();

    if (checked) {
      // Agregar permiso
      if (!current.includes(permisoId)) {
        this.permisosSeleccionados.set([...current, permisoId]);
      }
    } else {
      // Quitar permiso
      this.permisosSeleccionados.set(current.filter(id => id !== permisoId));
    }

    console.log('🔑 Permisos actualizados:', this.permisosSeleccionados());
  }

  /**
   * Seleccionar/deseleccionar todos los permisos
   */
  toggleAllPermisos(selectAll: boolean) {
    if (selectAll) {
      const allIds = this.permisosDisponibles().map(p => p.id);
      this.permisosSeleccionados.set(allIds);
    } else {
      this.permisosSeleccionados.set([]);
    }
  }

  /**
   * Verificar si todos los permisos están seleccionados
   */
  areAllPermisosSelected(): boolean {
    const disponibles = this.permisosDisponibles().length;
    const seleccionados = this.permisosSeleccionados().length;
    return disponibles > 0 && disponibles === seleccionados;
  }

  /**
   * Verificar si algunos permisos están seleccionados (para indeterminate)
   */
  areSomePermisosSelected(): boolean {
    const seleccionados = this.permisosSeleccionados().length;
    const disponibles = this.permisosDisponibles().length;
    return seleccionados > 0 && seleccionados < disponibles;
  }

  /**
   * Filtrar permisos por búsqueda (opcional)
   */
  filtrarPermisos(searchTerm: string = ''): any[] {
    if (!searchTerm.trim()) {
      return this.permisosDisponibles();
    }

    return this.permisosDisponibles().filter(permiso =>
      permiso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.codename.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit() {
    if (this.rolForm.valid) {
      this.loading.set(true);

      const formData = {
        name: this.rolForm.get('name')?.value,
        permission_ids: this.permisosSeleccionados() // Enviar como permission_ids para el backend
      };

      console.log('📤 Enviando datos del rol:', formData);

      // Emitir datos al componente padre
      const result = {
        action: this.isEditMode() ? 'edit' : 'create',
        data: formData,
        rolId: this.data?.rol?.id
      };

      this.dialogRef.close(result);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.rolForm.controls).forEach(key => {
        this.rolForm.get(key)?.markAsTouched();
      });
      console.log('❌ Formulario inválido');
    }
  }

  /**
   * Cerrar diálogo sin guardar
   */
  onCancel() {
    this.dialogRef.close();
  }
}
