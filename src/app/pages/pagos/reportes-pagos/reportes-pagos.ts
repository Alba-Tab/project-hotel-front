
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
import { MatTab, MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
// import { DataSource } from '@angular/cdk/data-source.d';


interface FiltroQBE {
  field: string;
  op: string;
  value: any;
  fieldLabel?: string;
}

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
    MatTabsModule,
    MatTableModule,
    MatCardModule,
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
  previsualizando = false;
  datosPreview: any[] = [];

  // Formulario de parámetros
  parametrosForm = this.fb.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: [''],
    metodo: [''],
    montoMinimo: [''],
    montoMaximo: [''],
    formato: ['pdf', Validators.required],
    limite: [20],

    enviarPorEmail: [false],
    emailDestinatario: [''],
    asuntoEmail: [''],
    mensajeEmail: ['Adjunto el reporte solicitado de reservas.']
  });

  // Filtros QBE dinámicos
  filtrosQBE: FiltroQBE[] = [];

  // Columnas disponibles para pagos
  columnasDisponibles = [
    { key: 'id', label: 'ID', selected: true },
    { key: 'estado', label: 'Estado', selected: true },
    { key: 'monto', label: 'Monto', selected: true },
    { key: 'metodo', label: 'Método de Pago', selected: true },
    { key: 'fecha_pago', label: 'Fecha de Pago', selected: true },
    { key: 'referencia', label: 'Referencia', selected: true },
    { key: 'folio_estancia', label: 'Folio ID', selected: false },
    { key: 'folio_estancia__reserva__hotel__nombre', label: 'Hotel', selected: false },
    { key: 'folio_estancia__reserva__huesped__username', label: 'Huésped', selected: false },
    { key: 'observaciones', label: 'Observaciones', selected: false }
  ];

  // Campos disponibles para QBE
  camposQBE = [
    { key: 'id', label: 'ID', tipo: 'number' },
    { key: 'estado', label: 'Estado', tipo: 'select' },
    { key: 'monto', label: 'Monto', tipo: 'number' },
    { key: 'metodo', label: 'Método', tipo: 'select' },
    { key: 'fecha_pago', label: 'Fecha Pago', tipo: 'date' },
    { key: 'referencia', label: 'Referencia', tipo: 'text' },
    { key: 'folio_estancia', label: 'Folio ID', tipo: 'number' },
    { key: 'folio_estancia__reserva__hotel__nombre', label: 'Hotel', tipo: 'text' },
    { key: 'folio_estancia__reserva__huesped__username', label: 'Huésped', tipo: 'text' },
  ];

  // Operadores por tipo
  operadoresPorTipo = {
    text: [
      { key: 'eq', label: 'Igual a' },
      { key: 'ne', label: 'Diferente de' },
      { key: 'contains', label: 'Contiene' },
      { key: 'icontains', label: 'Contiene (sin mayús.)' },
      { key: 'startswith', label: 'Empieza con' },
      { key: 'endswith', label: 'Termina con' }
    ],
    number: [
      { key: 'eq', label: 'Igual a' },
      { key: 'ne', label: 'Diferente de' },
      { key: 'gt', label: 'Mayor que' },
      { key: 'gte', label: 'Mayor o igual' },
      { key: 'lt', label: 'Menor que' },
      { key: 'lte', label: 'Menor o igual' }
    ],
    date: [
      { key: 'eq', label: 'Igual a' },
      { key: 'ne', label: 'Diferente de' },
      { key: 'gt', label: 'Posterior a' },
      { key: 'gte', label: 'Posterior o igual' },
      { key: 'lt', label: 'Anterior a' },
      { key: 'lte', label: 'Anterior o igual' }
    ],
    select: [
      { key: 'eq', label: 'Igual a' },
      { key: 'ne', label: 'Diferente de' },
      { key: 'in', label: 'En lista' }
    ]
  };

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

  // Métodos QBE
  agregarFiltroQBE() {
    this.filtrosQBE.push({
      field: '',
      op: '',
      value: '',
      fieldLabel: ''
    });
  }

  eliminarFiltroQBE(index: number) {
    this.filtrosQBE.splice(index, 1);
  }

  onCampoQBEChange(index: number, campo: string) {
    const campoInfo = this.camposQBE.find(c => c.key === campo);
    this.filtrosQBE[index].field = campo;
    this.filtrosQBE[index].fieldLabel = campoInfo?.label || campo;
    this.filtrosQBE[index].op = '';
    this.filtrosQBE[index].value = '';
  }

  getOperadoresParaCampo(index: number) {
    const filtro = this.filtrosQBE[index];
    if (!filtro.field) return [];

    const campo = this.camposQBE.find(c => c.key === filtro.field);
    return this.operadoresPorTipo[campo?.tipo as keyof typeof this.operadoresPorTipo] || [];
  }

  getTipoCampo(field: string): string {
    const campo = this.camposQBE.find(c => c.key === field);
    return campo?.tipo || 'text';
  }

  // Preview de datos
  previsualizarDatos() {
    if (!this.validarConfiguracion()) return;

    this.previsualizando = true;
    const config = this.construirConfiguracion();

    this.apiService.generarReporte('pagos/reportes/pagos_base/preview', config).subscribe({
      next: (response: any) => {
        this.datosPreview = response.results || response;
        this.previsualizando = false;
        this.snackBar.open('Vista previa cargada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error en preview:', error);
        this.previsualizando = false;
        this.snackBar.open('Error al cargar vista previa', 'Cerrar', { duration: 3000 });
      }
    });
  }

  generarReporte() {
    // if (this.parametrosForm.invalid) {
    //   this.snackBar.open('Complete los campos requeridos', 'Cerrar', { duration: 3000 });
    //   return;
    // }

    if (!this.validarConfiguracion()) return;

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

    // const columnasSeleccionadas = this.columnasDisponibles
    //   .filter(col => col.selected)
    //   .map(col => col.key);

    // if (columnasSeleccionadas.length === 0) {
    //   this.snackBar.open('Seleccione al menos una columna', 'Cerrar', { duration: 3000 });
    //   return;
    // }

    this.generando = true;
    const config = this.construirConfiguracion();

    // const config = {
    //   columns: columnasSeleccionadas,
    //   filters: this.construirFiltros(),
    //   ordering: ['-id'],
    //   format: formValue.formato
    // };


    // Si es envío por email, agregar campos adicionales
    if (formValue.enviarPorEmail) {
      Object.assign(config, {
        recipient_email: formValue.emailDestinatario,
        subject: formValue.asuntoEmail,
        message: formValue.mensajeEmail || 'Adjunto el reporte solicitado de reservas.'
      });
    }

    // Determinar endpoint según si es email o descarga
    const endpoint = formValue.enviarPorEmail ?
    'pagos/reportes/pagos_base/email' :
    'pagos/reportes/pagos_base/export';

    this.apiService.generarReporte(endpoint, config).subscribe({
      next: (blob: Blob) => {
        // console.log('Blob recibido - Tipo:', blob.type, 'Tamaño:', blob.size);

        // this.descargarArchivo(blob, config.format || 'pdf');
        this.generando = false;

        if (formValue.enviarPorEmail) {
          // Para email, el servidor responde con un mensaje de éxito
          this.snackBar.open('Reporte enviado por email exitosamente', 'Cerrar', { duration: 3000 });
        } else {
          // Para descarga, procesar el blob
          // console.log('Blob recibido - Tipo:', blob.type, 'Tamaño:', blob.size);
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

  private validarConfiguracion(): boolean {
    const columnasSeleccionadas = this.columnasDisponibles.filter(col => col.selected);
    if (columnasSeleccionadas.length === 0) {
      this.snackBar.open('Seleccione al menos una columna', 'Cerrar', { duration: 3000 });
      return false;
    }
    return true;
  }

  private construirConfiguracion() {
    const formValue = this.parametrosForm.value;
    const columnasSeleccionadas = this.columnasDisponibles
      .filter(col => col.selected)
      .map(col => col.key);

    const config = {
      columns: columnasSeleccionadas,
      filters: this.construirFiltros(),
      ordering: ['-id'],
      format: formValue.formato,
      limit: formValue.limite || 20
    };

    return config;
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

    // Agregar filtros QBE
    this.filtrosQBE.forEach(filtro => {
      if (filtro.field && filtro.op && filtro.value !== '') {
        let valor = filtro.value;

        // Convertir valores según tipo
        const tipoCampo = this.getTipoCampo(filtro.field);
        if (tipoCampo === 'number') {
          valor = parseFloat(valor);
        } else if (tipoCampo === 'date') {
          valor = new Date(valor).toISOString().split('T')[0];
        }

        filtros.push({
          field: filtro.field,
          op: filtro.op,
          value: valor
        });
      }
    });

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
        asuntoEmail: `Reporte de Reservas - ${fechaActual}`
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
