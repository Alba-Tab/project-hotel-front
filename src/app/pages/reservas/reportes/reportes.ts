// import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Component, inject } from '@angular/core';
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
  selector: 'app-reportes',
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
export class Reportes {
  private dialogRef = inject(MatDialogRef<Reportes>);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  generando = false;

  // Formulario de parámetros
  parametrosForm = this.fb.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: [''],
    formato: ['pdf', Validators.required],
    // tipoReporte: ['gerencial', Validators.required]
  });

  // Columnas disponibles
  columnasDisponibles = [
    { key: 'id', label: 'ID', selected: true },
    { key: 'estado', label: 'Estado', selected: true },
    { key: 'fecha_entrada', label: 'Fecha Entrada', selected: true },
    { key: 'fecha_salida', label: 'Fecha Salida', selected: true },
    { key: 'hotel__nombre', label: 'Hotel', selected: true },
    { key: 'huesped__username', label: 'Huésped', selected: true },
    // { key: 'nro_habitacion', label: 'Nº Habitación', selected: false },
    { key: 'total', label: 'Total', selected: true },
    // { key: 'fecha_reserva', label: 'Fecha Reserva', selected: false },
    // { key: 'checkinout__fecha_checkin', label: 'Check-in', selected: false },
    // { key: 'checkinout__fecha_checkout', label: 'Check-out', selected: false }
  ];

  // Opciones
  estadosDisponibles = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'completada', label: 'Completada' }
  ];

  formatosDisponibles = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'docx', label: 'Word' }
  ];

  // tiposReporte = [
  //   { value: 'gerencial', label: 'Gerencial' },
  //   { value: 'analitico', label: 'Analítico' }
  // ];

  // onTipoChange() {
  //   const tipo = this.parametrosForm.get('tipoReporte')?.value;
  //   if (tipo === 'gerencial') {
  //     // Columnas básicas para gerencial
  //     this.columnasDisponibles.forEach(col => {
  //       col.selected = ['id', 'estado', 'fecha_entrada', 'fecha_salida', 'hotel__nombre', 'huesped__username', 'total'].includes(col.key);
  //     });
  //   } else {
  //     // Todas las columnas para analítico
  //     this.columnasDisponibles.forEach(col => {
  //       col.selected = true;
  //     });
  //   }
  // }

  generarReporte() {
    if (this.parametrosForm.invalid) {
      this.snackBar.open('Complete los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const columnasSeleccionadas = this.columnasDisponibles
      .filter(col => col.selected)
      .map(col => col.key);

    if (columnasSeleccionadas.length === 0) {
      this.snackBar.open('Seleccione al menos una columna', 'Cerrar', { duration: 3000 });
      return;
    }

    this.generando = true;

    const config = {
      columns: columnasSeleccionadas,
      filters: this.construirFiltros(),
      ordering: ['-id'],
      format: this.parametrosForm.get('formato')?.value
    };

    console.log('Enviando configuración de reporte:', config);

    this.apiService.generarReporte('reservas/reportes/reservas_base/export', config).subscribe({
      next: (blob: Blob) => {
        console.log('Blob recibido - Tipo:', blob.type, 'Tamaño:', blob.size);
        this.descargarArchivo(blob, config.format || 'pdf');
        this.generando = false;
        this.snackBar.open('Reporte generado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.generando = false;
        const mensaje = error.status === 406 ?
        'Error 406: El servidor no puede generar el formato solicitado' :
        'Error al generar reporte';
        this.snackBar.open('Error al generar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private construirFiltros() {
    const filtros = [];
    const form = this.parametrosForm.value;

    if (form.fechaInicio) {
      filtros.push({
        field: 'fecha_entrada',
        op: 'gte',
        value: new Date(form.fechaInicio).toISOString().split('T')[0]
      });
    }

    if (form.fechaFin) {
      filtros.push({
        field: 'fecha_salida',
        op: 'lte',
        value: new Date(form.fechaFin).toISOString().split('T')[0]
      });
    }

    if (form.estado) {
      filtros.push({
        field: 'estado',
        op: 'eq',
        value: form.estado
      });
    }

    return filtros;
  }

  private descargarArchivo(blob: Blob, formato: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const fecha = new Date().toISOString().split('T')[0];
    // const tipo = this.parametrosForm.get('tipoReporte')?.value;
    const tipo = 'gerencial';

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

    link.download = `reporte-reservas-${tipo}-${fecha}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  cancelar() {
    this.dialogRef.close(false);
  }

}
