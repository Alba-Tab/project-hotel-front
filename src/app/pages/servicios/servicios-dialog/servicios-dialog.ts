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
  selector: 'app-servicios-dialog',
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
  templateUrl: './servicios-dialog.html',
  styleUrl: './servicios-dialog.scss'
})
export class ServiciosDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ServiciosDialog>);
  private data = inject(MAT_DIALOG_DATA);
  private apiService = inject(ApiService);

  // Signals para estado reactivo
  loading = signal(false);
  isEditMode = signal(false);

  // Tipos de servicio disponibles
  tiposServicio = [
    { value: 'habitacion', label: 'Habitación' },
    { value: 'spa', label: 'Spa' },
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'otros', label: 'Otros' }
  ];

  servicioForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadServiceData();
  }

  /**
   * Inicializar formulario reactivo
   */
  private initForm() {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      tipo: ['', [Validators.required]]
    });
  }

  /**
   * Cargar datos del servicio si está en modo edición
   */
  private loadServiceData() {
    if (this.data?.servicio) {
      this.isEditMode.set(true);
      console.log('🔧 Modo edición - Servicio:', this.data.servicio);

      // Llenar formulario con datos existentes
      this.servicioForm.patchValue({
        nombre: this.data.servicio.nombre,
        descripcion: this.data.servicio.descripcion,
        precio: this.data.servicio.precio,
        tipo: this.data.servicio.tipo
      });
    } else {
      this.isEditMode.set(false);
      console.log('➕ Modo creación - Nuevo servicio');
    }
  }

  /**
   * Obtener título del diálogo
   */
  getTitle(): string {
    return this.isEditMode() ? 'Editar Servicio' : 'Crear Nuevo Servicio';
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
    const field = this.servicioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.servicioForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${requiredLength} caracteres`;
    }
    if (field.errors['min']) {
      return `${this.getFieldDisplayName(fieldName)} debe ser mayor o igual a 0`;
    }
    return '';
  }

  /**
   * Obtener nombre de campo para mostrar
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'nombre': 'Nombre',
      'descripcion': 'Descripción',
      'precio': 'Precio',
      'tipo': 'Tipo'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit() {
    if (this.servicioForm.valid) {
      this.loading.set(true);

      const formData = this.servicioForm.value;
      console.log('📤 Enviando datos:', formData);

      // Emitir datos al componente padre
      const result = {
        action: this.isEditMode() ? 'edit' : 'create',
        data: formData,
        serviceId: this.data?.servicio?.id
      };

      this.dialogRef.close(result);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.servicioForm.controls).forEach(key => {
        this.servicioForm.get(key)?.markAsTouched();
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
