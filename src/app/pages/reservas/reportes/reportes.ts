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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';

interface FiltroQBE {
  field: string;
  op: string;
  value: any;
  fieldLabel?: string;
}


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
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
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
  previsualizando = false;
  datosPreview: any[] = [];
  tabSeleccionada = 0;

  // Formulario básico
  parametrosForm = this.fb.group({
    fechaInicio: [''],
    fechaFin: [''],
    estado: [''],
    formato: ['pdf', Validators.required],
    limite: [30],
    // Campos de email
    enviarPorEmail: [false],
    emailDestinatario: [''],
    asuntoEmail: [''],
    mensajeEmail: ['Adjunto el reporte solicitado de reservas.']
  });

  // Filtros QBE dinámicos
  filtrosQBE: FiltroQBE[] = [];

    // Columnas disponibles (basadas en el registry del backend)
  columnasDisponibles = [
    { key: 'id', label: 'ID', selected: true },
    { key: 'estado', label: 'Estado', selected: true },
    { key: 'fecha_entrada', label: 'Fecha Entrada', selected: true },
    { key: 'fecha_salida', label: 'Fecha Salida', selected: true },
    { key: 'hotel__nombre', label: 'Hotel', selected: true },
    { key: 'huesped__username', label: 'Huésped', selected: true },
    { key: 'habitacion__numero', label: 'Nº Habitación', selected: false }
  ];

  // Campos disponibles para QBE (basados en el registry del backend)
  camposQBE = [
    { key: 'id', label: 'ID', tipo: 'number' },
    { key: 'estado', label: 'Estado', tipo: 'select' },
    { key: 'fecha_entrada', label: 'Fecha Entrada', tipo: 'date' },
    { key: 'fecha_salida', label: 'Fecha Salida', tipo: 'date' },
    { key: 'hotel__nombre', label: 'Hotel', tipo: 'text' },
    { key: 'habitacion__numero', label: 'Nº Habitación', tipo: 'text' },
    { key: 'huesped__username', label: 'Huésped', tipo: 'text' }
  ];

  // Operadores por tipo (basados en el registry del backend)
  operadoresPorTipo = {
    text: [
      { key: 'eq', label: 'Igual a' },
      { key: 'ne', label: 'Diferente de' },
      { key: 'icontains', label: 'Contiene (sin mayús.)' },
      { key: 'in', label: 'En lista' }
    ],
    number: [
      { key: 'eq', label: 'Igual a' },
      { key: 'gte', label: 'Mayor o igual' },
      { key: 'lte', label: 'Menor o igual' },
      { key: 'in', label: 'En lista' }
    ],
    date: [
      { key: 'eq', label: 'Igual a' },
      { key: 'between', label: 'Entre fechas' },
      { key: 'gte', label: 'Posterior o igual' },
      { key: 'lte', label: 'Anterior o igual' }
    ],
    select: [
      { key: 'eq', label: 'Igual a' },
      { key: 'ne', label: 'Diferente de' },
      { key: 'icontains', label: 'Contiene (sin mayús.)' },
      { key: 'in', label: 'En lista' }
    ]
  };

  // Opciones para filtros (basadas en el modelo del backend)
  estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'realizada', label: 'Realizada' }
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
    if (!filtro || !filtro.field) return [];

    const campo = this.camposQBE.find(c => c.key === filtro.field);
    if (!campo || !campo.tipo) return [];

    return this.operadoresPorTipo[campo.tipo as keyof typeof this.operadoresPorTipo] || [];
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

    this.apiService.generarReporte('reservas/reportes/reservas_base/preview', config).subscribe({
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

  // Generar reporte
  generarReporte() {
    if (!this.validarConfiguracion()) return;

    const formValue = this.parametrosForm.value;

    // Validar email si está marcado
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

    this.generando = true;
    const config = this.construirConfiguracion();

    // Agregar campos de email si corresponde
    if (formValue.enviarPorEmail) {
      Object.assign(config, {
        recipient_email: formValue.emailDestinatario,
        subject: formValue.asuntoEmail,
        message: formValue.mensajeEmail || 'Adjunto el reporte solicitado de reservas.'
      });
    }

    // Determinar endpoint
    const endpoint = formValue.enviarPorEmail ?
      'reservas/reportes/reservas_base/email' :
      'reservas/reportes/reservas_base/export';

    this.apiService.generarReporte(endpoint, config).subscribe({
      next: (blob: Blob) => {
        this.generando = false;

        if (formValue.enviarPorEmail) {
          this.snackBar.open('Reporte enviado por email exitosamente', 'Cerrar', { duration: 3000 });
        } else {
          this.descargarArchivo(blob, config.format || 'pdf');
          this.snackBar.open('Reporte generado exitosamente', 'Cerrar', { duration: 3000 });
        }

        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error:', error);
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
      ordering: ['fecha_entrada', 'hotel__nombre'],
      format: formValue.formato,
      limit: formValue.limite || 30
    };

    return config;
  }

  private construirFiltros() {
    const filtros: any[] = [];
    const formValue = this.parametrosForm.value;

    // Filtros básicos del formulario
    if (formValue.fechaInicio) {
      filtros.push({
        field: 'fecha_entrada',
        op: 'gte',
        value: new Date(formValue.fechaInicio).toISOString().split('T')[0]
      });
    }

    if (formValue.fechaFin) {
      filtros.push({
        field: 'fecha_salida',
        op: 'lte',
        value: new Date(formValue.fechaFin).toISOString().split('T')[0]
      });
    }

    if (formValue.estado) {
      filtros.push({
        field: 'estado',
        op: 'eq',
        value: formValue.estado
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
    let extension = formato === 'xlsx' ? 'xlsx' : formato === 'docx' ? 'docx' : 'pdf';
    link.download = `reporte-reservas-qbe-${fecha}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Propiedad computed para columnas seleccionadas
  get columnasSeleccionadas(): string[] {
    return this.columnasDisponibles
      .filter(col => col.selected)
      .map(col => col.key);
  }

  getLabelForColumn(columnKey: string): string {
    const column = this.columnasDisponibles.find(c => c.key === columnKey);
    return column ? column.label : columnKey;
  }

  limpiarFiltrosQBE() {
    this.filtrosQBE = [];
    this.snackBar.open('Filtros QBE limpiados', 'Cerrar', { duration: 2000 });
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
