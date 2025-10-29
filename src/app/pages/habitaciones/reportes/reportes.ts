import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';


@Component({
  selector: 'app-reportes-habitaciones',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
  standalone: true,
})
export class ReportesHabitaciones implements OnInit {
  private dialogRef = inject(MatDialogRef<ReportesHabitaciones>);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  generando = false;
  cargandoHoteles = false;
  hotelesDisponibles: any[] = [];

  // Formulario de parámetros
  parametrosForm = this.fb.group({
    hotel: [''],
    estado: [''],
    numero: [''],
    tipo: [''],
    fechaInicioOcupacion: [''],
    fechaFinOcupacion: [''],
    formato: ['pdf', Validators.required],
    enviarPorEmail: [false],
    emailDestinatario: [''],
    asuntoEmail: [''],
    mensajeEmail: ['Adjunto el reporte solicitado de habitaciones.']
  });

  // Columnas disponibles
  columnasDisponibles = [
    { key: 'id', label: 'ID', selected: true },
    { key: 'hotel__nombre', label: 'Hotel', selected: true },
    { key: 'numero', label: 'Número', selected: true },
    { key: 'estado', label: 'Estado', selected: true },
    { key: 'tipo', label: 'Tipo', selected: true },
    { key: 'precio_noche', label: 'Precio por noche', selected: true },
    { key: 'capacidad', label: 'Capacidad', selected: true }
  ];

  // Opciones
  estadosDisponibles = [
    { value: '', label: 'Todos' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reservada', label: 'Reservada' }
  ];

  formatosDisponibles = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'docx', label: 'Word' }
  ];

  ngOnInit(): void {
    this.cargarHoteles();
  }

  cargarHoteles(): void {
    this.cargandoHoteles = true;
    this.apiService.listar<any[]>('hoteles').subscribe({
      next: (hoteles) => {
        this.hotelesDisponibles = [
          { value: '', label: 'Todos' },
          ...hoteles.map(hotel => ({
            value: hotel.nombre,
            label: hotel.nombre
          }))
        ];
        this.cargandoHoteles = false;
      },
      error: (error) => {
        console.error('Error al cargar hoteles:', error);
        this.snackBar.open('Error al cargar la lista de hoteles', 'Cerrar', {
          duration: 3000,
        });
        this.hotelesDisponibles = [{ value: '', label: 'Todos' }];
        this.cargandoHoteles = false;
      }
    });
  }

  generarReporte() {
    if (this.parametrosForm.invalid) {
      this.snackBar.open('Complete los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const formValue = this.parametrosForm.value;

    // Validar email si está marcado envío por email
    if (formValue.enviarPorEmail) {
      if (!formValue.emailDestinatario) {
        this.snackBar.open('Ingrese el email de destino', 'Cerrar', { duration: 3000 });
        return;
      }
      if (!formValue.asuntoEmail) {
        this.snackBar.open('Ingrese el asunto del email', 'Cerrar', { duration: 3000 });
        return;
      }
    }

    const columnasSeleccionadas = this.columnasDisponibles
      .filter(col => col.selected)
      .map(col => col.key);

    if (columnasSeleccionadas.length === 0) {
      this.snackBar.open('Seleccione al menos una columna', 'Cerrar', { duration: 3000 });
      return;
    }

    this.generando = true;

    const config: any = {
      columns: columnasSeleccionadas,
      filters: this.construirFiltros(),
      ordering: ['hotel__nombre', 'numero'],
      format: this.parametrosForm.get('formato')?.value
    };

    // Agregar fechas de ocupación si están presentes
    if (formValue.fechaInicioOcupacion) {
      config.fecha_inicio_ocupacion = new Date(formValue.fechaInicioOcupacion).toISOString().split('T')[0];
    }

    if (formValue.fechaFinOcupacion) {
      config.fecha_fin_ocupacion = new Date(formValue.fechaFinOcupacion).toISOString().split('T')[0];
    }

    // Si es envío por email, agregar campos adicionales
    if (formValue.enviarPorEmail) {
      Object.assign(config, {
        recipient_email: formValue.emailDestinatario,
        subject: formValue.asuntoEmail,
        message: formValue.mensajeEmail || 'Adjunto el reporte solicitado de habitaciones.'
      });
    }

    console.log('Enviando configuración de reporte:', config);

    // Determinar endpoint según si es email o descarga
    const endpoint = formValue.enviarPorEmail ?
      'habitaciones/reportes/habitaciones_base/email' :
      'habitaciones/reportes/habitaciones_base/export';

    this.apiService.generarReporte(endpoint, config).subscribe({

      next: (blob: Blob) => {
        this.generando = false;

        if (formValue.enviarPorEmail) {
          // Para email, el servidor responde con un mensaje de éxito
          this.snackBar.open('Reporte enviado por email exitosamente', 'Cerrar', { duration: 3000 });
        } else {
          // Para descarga, procesar el blob
          console.log('Blob recibido - Tipo:', blob.type, 'Tamaño:', blob.size);
          this.descargarArchivo(blob, config.format || 'pdf');
          this.snackBar.open('Reporte generado exitosamente', 'Cerrar', { duration: 3000 });
        }

        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.generando = false;
        const mensaje = formValue.enviarPorEmail ?
        'Error al enviar reporte por email' :
        'Error al generar reporte';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
      }
    });
  }

  private construirFiltros() {
    const filtros = [];
    const form = this.parametrosForm.value;

    if (form.hotel) {
      filtros.push({
        field: 'hotel__nombre',
        op: 'eq',
        value: form.hotel
      });
    }

    if (form.estado) {
      filtros.push({
        field: 'estado',
        op: 'eq',
        value: form.estado
      });
    }

    if (form.numero) {
      filtros.push({
        field: 'numero',
        op: 'icontains',
        value: form.numero
      });
    }

    if (form.tipo) {
      filtros.push({
        field: 'tipo',
        op: 'icontains',
        value: form.tipo
      });
    }

    return filtros;
  }

  private descargarArchivo(blob: Blob, formato: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const fecha = new Date().toISOString().split('T')[0];

    let extension = 'pdf';
    switch (formato) {
      case 'xlsx':
        extension = 'xlsx';
        break;
      case 'docx':
        extension = 'docx';
        break;
      default:
        extension = 'pdf';
    }

    link.download = `reporte-habitaciones-${fecha}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  onEnviarEmailChange() {
    const enviarPorEmail = this.parametrosForm.get('enviarPorEmail')?.value;

    if (enviarPorEmail) {
      // Hacer campos de email obligatorios
      this.parametrosForm.get('emailDestinatario')?.setValidators([Validators.required, Validators.email]);
      this.parametrosForm.get('asuntoEmail')?.setValidators([Validators.required]);

      // Generar asunto por defecto
      const fechaActual = new Date().toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });
      this.parametrosForm.patchValue({
        asuntoEmail: `Reporte de Habitaciones - ${fechaActual}`
      });
    } else {
      // Quitar validaciones
      this.parametrosForm.get('emailDestinatario')?.clearValidators();
      this.parametrosForm.get('asuntoEmail')?.clearValidators();
    }

    this.parametrosForm.get('emailDestinatario')?.updateValueAndValidity();
    this.parametrosForm.get('asuntoEmail')?.updateValueAndValidity();
  }
}
