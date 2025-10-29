
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
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';


@Component({
  selector: 'app-reportes-pagos',
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
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reportes-pagos.html',
  styleUrls: ['./reportes-pagos.scss']
})
export class ReportesPagos {

  private dialogRef = inject(MatDialogRef<ReportesPagos>);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  generando = false;

  // Formulario de parámetros
  parametrosForm = this.fb.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: [''],
    metodo: [''],
    montoMinimo: [''],
    montoMaximo: [''],
    formato: ['pdf', Validators.required]
  });

  // Columnas disponibles para pagos
  columnasDisponibles = [
    { key: 'id', label: 'ID', selected: true },
    { key: 'estado', label: 'Estado', selected: true },
    { key: 'monto', label: 'Monto', selected: true },
    { key: 'metodo', label: 'Método de Pago', selected: true },
    { key: 'fecha_pago', label: 'Fecha de Pago', selected: true },
    { key: 'referencia', label: 'Referencia', selected: true },
    { key: 'folio_estancia', label: 'Folio ID', selected: false },
    { key: 'observaciones', label: 'Observaciones', selected: false }
  ];

  // Opciones para filtros
  estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'rechazado', label: 'Rechazado' }
  ];

  metodosDisponibles = [
    { value: '', label: 'Todos los métodos' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito' },
    { value: 'debito', label: 'Tarjeta de Débito' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'digital', label: 'Pago Digital' }
  ];

  formatosDisponibles = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'docx', label: 'Word' }
  ];

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

    console.log('Enviando configuración de pagos:', config);

    this.apiService.generarReporte('pagos/reportes/pagos_base/export', config).subscribe({
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
          'Error al generar reporte de pagos';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
      }
    });
  }

  private construirFiltros() {
    const filtros = [];
    const form = this.parametrosForm.value;

    if (form.fechaInicio) {
      filtros.push({
        field: 'fecha_pago',
        op: 'gte',
        value: new Date(form.fechaInicio).toISOString().split('T')[0]
      });
    }

    if (form.fechaFin) {
      filtros.push({
        field: 'fecha_pago',
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

    if (form.metodo) {
      filtros.push({
        field: 'metodo',
        op: 'eq',
        value: form.metodo
      });
    }

    if (form.montoMinimo) {
      filtros.push({
        field: 'monto',
        op: 'gte',
        value: parseFloat(form.montoMinimo)
      });
    }

    if (form.montoMaximo) {
      filtros.push({
        field: 'monto',
        op: 'lte',
        value: parseFloat(form.montoMaximo)
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

    link.download = `reporte-pagos-${fecha}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  cancelar() {
    this.dialogRef.close(false);
  }

}
