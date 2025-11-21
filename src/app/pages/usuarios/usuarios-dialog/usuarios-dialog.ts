import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-usuarios-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './usuarios-dialog.html',
  styleUrl: './usuarios-dialog.scss'
})
export class UsuariosDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UsuariosDialog>);
  private data = inject(MAT_DIALOG_DATA);
  private apiService = inject(ApiService);

  // Signals para estado reactivo
  loading = signal(false);
  loadingRoles = signal(true);
  loadingHoteles = signal(true);
  isEditMode = signal(false);

  // Datos de roles y hoteles
  rolesDisponibles = signal<any[]>([]);
  hotelesDisponibles = signal<any[]>([]);

  usuarioForm!: FormGroup;

  // Propiedades para foto
  photoFile: File | null = null;
  photoPreviewUrl: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadRoles();
    this.loadHoteles();
    this.loadUserData();
  }

  /**
   * Inicializar formulario reactivo
   */
  private initForm() {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      groups: ['', [Validators.required]], // Campo para grupo/rol (será un array con un elemento)
      hotel: ['', [Validators.required]], // Campo para hotel
      password: ['', [Validators.minLength(6)]] // Solo requerido en creación
    });
  }

  /**
   * Cargar lista de roles disponibles desde el backend
   */
  private async loadRoles() {
    try {
      console.log('🔄 Cargando roles disponibles...');
      this.loadingRoles.set(true);

      const response = await firstValueFrom(this.apiService.listar<any>('roles'));
      console.log('✅ Roles cargados:', response);

      this.rolesDisponibles.set(response);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
    } finally {
      this.loadingRoles.set(false);
    }
  }

  /**
   * Cargar lista de hoteles disponibles desde el backend
   */
  private async loadHoteles() {
    try {
      console.log('🔄 Cargando hoteles disponibles...');
      this.loadingHoteles.set(true);

      const response = await firstValueFrom(this.apiService.listar<any>('hoteles/hoteles'));
      console.log('✅ Hoteles cargados:', response);

      this.hotelesDisponibles.set(response);
    } catch (error) {
      console.error('❌ Error al cargar hoteles:', error);
    } finally {
      this.loadingHoteles.set(false);
    }
  }

  /**
   * Cargar datos del usuario si está en modo edición
   */
  private loadUserData() {
    if (this.data?.usuario) {
      this.isEditMode.set(true);
      console.log('🔧 Modo edición - Usuario:', this.data.usuario);

      // Llenar formulario con datos existentes
      this.usuarioForm.patchValue({
        username: this.data.usuario.username,
        first_name: this.data.usuario.first_name,
        last_name: this.data.usuario.last_name,
        email: this.data.usuario.email,
        groups: this.data.usuario.groups?.[0]?.id || '', // Tomar el primer grupo si existe
        hotel: this.data.usuario.hotel || '' // Asignar hotel si existe
      });

      // Cargar foto existente si hay
      if (this.data.usuario.photo_url) {
        this.photoPreviewUrl = this.data.usuario.photo_url;
      }

      // En modo edición, la contraseña es opcional
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    } else {
      this.isEditMode.set(false);
      console.log('➕ Modo creación - Nuevo usuario');

      // En modo creación, la contraseña es requerida
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }  /**
   * Obtener título del diálogo
   */
  getTitle(): string {
    return this.isEditMode() ? 'Editar Usuario' : 'Crear Nuevo Usuario';
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
    const field = this.usuarioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${requiredLength} caracteres`;
    }
    if (field.errors['email']) {
      return 'Ingrese un email válido';
    }
    return '';
  }

  /**
   * Obtener nombre de campo para mostrar
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'username': 'Username',
      'first_name': 'Nombre',
      'last_name': 'Apellido',
      'email': 'Email',
      'groups': 'Rol',
      'hotel': 'Hotel',
      'password': 'Contraseña'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit() {
    if (this.usuarioForm.valid) {
      this.loading.set(true);

      const formData = this.usuarioForm.value;

      // Remover password si está vacío en modo edición
      if (this.isEditMode() && !formData.password) {
        delete formData.password;
      }

      // Convertir groups de ID único a group_ids array para el backend
      if (formData.groups) {
        formData.group_ids = [formData.groups]; // Backend espera group_ids
        delete formData.groups; // Remover groups del envío
      }

      // Añadir foto si existe
      if (this.photoFile) {
        formData.photo = this.photoFile;
      }

      console.log('📤 Enviando datos:', formData);

      // Emitir datos al componente padre
      const result = {
        action: this.isEditMode() ? 'edit' : 'create',
        data: formData,
        userId: this.data?.usuario?.id
      };

      this.dialogRef.close(result);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      console.log('❌ Formulario inválido');
    }
  }

  /**
   * Manejar selección de foto
   */
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.photoFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remover foto seleccionada
   */
  removePhoto(): void {
    this.photoFile = null;
    this.photoPreviewUrl = null;
  }

  /**
   * Cerrar diálogo sin guardar
   */
  onCancel() {
    this.dialogRef.close();
  }
}
