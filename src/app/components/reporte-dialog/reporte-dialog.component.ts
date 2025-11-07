import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { ReporteService } from '../../services/reporte.service';
import {
  ReporteDefinition,
  ReporteFiltro,
  ReportePreviewRequest,
  ReporteExportRequest,
  ReporteEmailRequest
} from '../../interfaces/reporte.interface';

@Component({
  selector: 'app-reporte-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTableModule
  ],
  template: `
    <h2 mat-dialog-title>Generar Reporte de Habitaciones</h2>

    <div mat-dialog-content class="dialog-content">
      <mat-tab-group>
        <!-- Tab de Configuración -->
        <mat-tab label="Configuración">
          <div class="tab-content">

            <!-- Selección de Columnas -->
            <div class="section">
              <h3>Columnas a incluir:</h3>
              <div class="checkbox-grid">
                @for (column of reporteEsquema()?.columns; track column.key) {
                  <mat-checkbox
                    [(ngModel)]="columnasSeleccionadas[column.key]"
                    [checked]="columnasSeleccionadas[column.key]">
                    {{column.label}}
                  </mat-checkbox>
                }
              </div>
            </div>

            <!-- Filtros -->
            <div class="section">
              <h3>Filtros:</h3>
              @for (filtro of filtros; track $index) {
                <div class="filtro-row">
                  <mat-form-field>
                    <mat-label>Campo</mat-label>
                    <mat-select [(ngModel)]="filtro.field" (selectionChange)="onCampoFiltroChange(filtro)">
                      @for (campo of reporteEsquema()?.filterable; track campo.key) {
                        <mat-option [value]="campo.key">{{campo.label}}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Operación</mat-label>
                    <mat-select [(ngModel)]="filtro.op">
                      @for (op of obtenerOperacionesDisponibles(filtro.field); track op.value) {
                        <mat-option [value]="op.value">{{op.label}}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Valor</mat-label>
                    <input matInput [(ngModel)]="filtro.value" [placeholder]="'Ingrese valor'">
                  </mat-form-field>

                  <button mat-icon-button (click)="eliminarFiltro($index)" color="warn">
                    ×
                  </button>
                </div>
              }
              <button mat-stroked-button (click)="agregarFiltro()" class="add-filter-btn">
                Agregar Filtro
              </button>
            </div>

            <!-- Ordenamiento -->
            <div class="section">
              <h3>Ordenamiento:</h3>
              <mat-form-field>
                <mat-label>Ordenar por</mat-label>
                <mat-select [(ngModel)]="ordenamiento" multiple>
                  @for (column of reporteEsquema()?.columns; track column.key) {
                    <mat-option [value]="column.key">{{column.label}}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

          </div>
        </mat-tab>

        <!-- Tab de Vista Previa -->
        <mat-tab label="Vista Previa">
          <div class="tab-content">
            <div class="preview-controls">
              <mat-form-field>
                <mat-label>Límite de registros</mat-label>
                <mat-select [(ngModel)]="limite">
                  <mat-option [value]="10">10</mat-option>
                  <mat-option [value]="25">25</mat-option>
                  <mat-option [value]="50">50</mat-option>
                  <mat-option [value]="100">100</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button (click)="generarVistaPrevia()" [disabled]="cargandoPreview()">
                Generar Vista Previa
              </button>
            </div>

            @if (cargandoPreview()) {
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            }

            @if (datosPreview().length > 0) {
              <div class="preview-results">
                <p><strong>Total de registros:</strong> {{totalRegistros()}}</p>
                <div class="table-container">
                  <table mat-table [dataSource]="datosPreview()" class="preview-table">
                    @for (column of columnasSeleccionadasArray(); track column) {
                      <ng-container [matColumnDef]="column">
                        <th mat-header-cell *matHeaderCellDef>{{obtenerLabelColumna(column)}}</th>
                        <td mat-cell *matCellDef="let element">{{element[column] || '-'}}</td>
                      </ng-container>
                    }
                    <tr mat-header-row *matHeaderRowDef="columnasSeleccionadasArray()"></tr>
                    <tr mat-row *matRowDef="let row; columns: columnasSeleccionadasArray()"></tr>
                  </table>
                </div>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Tab de Exportación -->
        <mat-tab label="Exportar">
          <div class="tab-content">

            <!-- Formato de Exportación -->
            <div class="section">
              <h3>Formato de Exportación:</h3>
              <mat-form-field>
                <mat-label>Formato</mat-label>
                <mat-select [(ngModel)]="formatoExport">
                  <mat-option value="xlsx">Excel (.xlsx)</mat-option>
                  <mat-option value="docx">Word (.docx)</mat-option>
                  <mat-option value="pdf">PDF (.pdf)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Exportación Directa -->
            <div class="section">
              <h3>Descargar Archivo:</h3>
              <button mat-raised-button color="primary" (click)="exportarArchivo()" [disabled]="cargandoExport()">
                Descargar Reporte
              </button>
              @if (cargandoExport()) {
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              }
            </div>

            <!-- Envío por Email -->
            <div class="section">
              <h3>Enviar por Email:</h3>
              <mat-form-field>
                <mat-label>Email destinatario</mat-label>
                <input matInput [(ngModel)]="emailDestinatario" type="email" placeholder="correo@ejemplo.com">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Asunto (obligatorio)</mat-label>
                <input matInput [(ngModel)]="emailAsunto" placeholder="Reporte de Habitaciones">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Mensaje (opcional)</mat-label>
                <textarea matInput [(ngModel)]="emailMensaje" rows="3" placeholder="Mensaje adicional"></textarea>
              </mat-form-field>

              <button mat-raised-button color="accent" (click)="enviarPorEmail()" [disabled]="cargandoEmail() || !emailDestinatario">
                Enviar por Email
              </button>
              @if (cargandoEmail()) {
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              }
            </div>

          </div>
        </mat-tab>

      </mat-tab-group>
    </div>

    <div mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="cerrar()">Cancelar</button>
    </div>
  `,
  styles: [`
    .dialog-content {
      width: 800px;
      max-height: 600px;
      overflow-y: auto;
    }

    .tab-content {
      padding: 16px 0;
    }

    .section {
      margin-bottom: 24px;
    }

    .section h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }

    .filtro-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .filtro-row mat-form-field {
      flex: 1;
    }

    .add-filter-btn {
      margin-top: 8px;
    }

    .preview-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .preview-results {
      margin-top: 16px;
    }

    .table-container {
      max-height: 300px;
      overflow: auto;
      border: 1px solid #e0e0e0;
    }

    .preview-table {
      width: 100%;
    }

    .dialog-actions {
      padding: 16px;
      justify-content: flex-end;
    }

    mat-progress-bar {
      margin: 8px 0;
    }
  `]
})
export class ReporteDialogComponent implements OnInit {

  reporteEsquema = signal<ReporteDefinition | null>(null);
  columnasSeleccionadas: {[key: string]: boolean} = {};
  filtros: ReporteFiltro[] = [];
  ordenamiento: string[] = [];
  limite = 25;

  formatoExport = 'xlsx';
  emailDestinatario = '';
  emailAsunto = '';
  emailMensaje = '';

  cargandoPreview = signal(false);
  cargandoExport = signal(false);
  cargandoEmail = signal(false);

  datosPreview = signal<any[]>([]);
  totalRegistros = signal(0);

  operacionesMap: {[key: string]: {value: string, label: string}[]} = {
    'str': [
      { value: 'eq', label: 'Igual a' },
      { value: 'icontains', label: 'Contiene' },
      { value: 'ne', label: 'Diferente de' },
      { value: 'in', label: 'En lista' }
    ],
    'int': [
      { value: 'eq', label: 'Igual a' },
      { value: 'gte', label: 'Mayor o igual' },
      { value: 'lte', label: 'Menor o igual' },
      { value: 'ne', label: 'Diferente de' }
    ],
    'decimal': [
      { value: 'eq', label: 'Igual a' },
      { value: 'gte', label: 'Mayor o igual' },
      { value: 'lte', label: 'Menor o igual' },
      { value: 'between', label: 'Entre' }
    ],
    'date': [
      { value: 'eq', label: 'Igual a' },
      { value: 'gte', label: 'Después de' },
      { value: 'lte', label: 'Antes de' },
      { value: 'between', label: 'Entre fechas' }
    ],
    'datetime': [
      { value: 'eq', label: 'Igual a' },
      { value: 'gte', label: 'Después de' },
      { value: 'lte', label: 'Antes de' },
      { value: 'between', label: 'Entre fechas' }
    ],
    'bool': [
      { value: 'eq', label: 'Igual a' }
    ]
  };

  constructor(
    public dialogRef: MatDialogRef<ReporteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reporteService: ReporteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.cargarEsquemaReporte();
  }

  cargarEsquemaReporte() {
    this.reporteService.obtenerEsquemaReporte('habitaciones_base').subscribe({
      next: (esquema) => {
        this.reporteEsquema.set(esquema);
        // Seleccionar todas las columnas por defecto
        esquema.columns.forEach(col => {
          this.columnasSeleccionadas[col.key] = true;
        });
        this.ordenamiento = [...esquema.default_ordering];
      },
      error: (error) => {
        console.error('Error al cargar esquema:', error);
        this.mostrarMensaje('Error al conectar con el servidor. Usando configuración de respaldo.');

        // Esquema de fallback basado en el backend que proporcionaste
        const esquemaFallback: ReporteDefinition = {
          slug: 'habitaciones_base',
          name: 'Habitaciones (básico)',
          description: 'Listado y filtrado de habitaciones por hotel, número y estado.',
          columns: [
            { key: 'id', label: 'ID', type: 'int', ops: ['eq', 'in', 'gte', 'lte'] },
            { key: 'hotel__nombre', label: 'Hotel', type: 'str', ops: ['eq', 'icontains', 'in'] },
            { key: 'numero', label: 'Número', type: 'str', ops: ['eq', 'icontains', 'in'] },
            { key: 'estado', label: 'Estado', type: 'str', ops: ['eq', 'in', 'ne', 'icontains'] }
          ],
          filterable: [
            { key: 'hotel__nombre', label: 'Hotel', type: 'str', ops: ['eq', 'icontains', 'in'] },
            { key: 'estado', label: 'Estado', type: 'str', ops: ['eq', 'in', 'ne', 'icontains'] },
            { key: 'numero', label: 'Número', type: 'str', ops: ['eq', 'icontains', 'in'] }
          ],
          default_ordering: ['hotel__nombre', 'numero']
        };

        this.reporteEsquema.set(esquemaFallback);
        esquemaFallback.columns.forEach(col => {
          this.columnasSeleccionadas[col.key] = true;
        });
        this.ordenamiento = [...esquemaFallback.default_ordering];
      }
    });
  }

  agregarFiltro() {
    this.filtros.push({ field: '', op: '', value: '' });
  }

  eliminarFiltro(index: number) {
    this.filtros.splice(index, 1);
  }

  onCampoFiltroChange(filtro: ReporteFiltro) {
    filtro.op = '';
    filtro.value = '';
  }

  obtenerOperacionesDisponibles(campo: string) {
    const esquema = this.reporteEsquema();
    if (!esquema || !campo) return [];

    const campoInfo = esquema.filterable.find(f => f.key === campo);
    if (!campoInfo) return [];

    return this.operacionesMap[campoInfo.type] || [];
  }

  columnasSeleccionadasArray(): string[] {
    return Object.keys(this.columnasSeleccionadas).filter(key => this.columnasSeleccionadas[key]);
  }

  obtenerLabelColumna(key: string): string {
    const esquema = this.reporteEsquema();
    if (!esquema) return key;

    const columna = esquema.columns.find(c => c.key === key);
    return columna?.label || key;
  }

  generarVistaPrevia() {
    const columnas = this.columnasSeleccionadasArray();
    if (columnas.length === 0) {
      this.mostrarMensaje('Debe seleccionar al menos una columna');
      return;
    }

    this.cargandoPreview.set(true);

    const request: ReportePreviewRequest = {
      columns: columnas,
      filters: this.filtros.filter(f => f.field && f.op && f.value !== ''),
      ordering: this.ordenamiento,
      limit: this.limite
    };

    this.reporteService.generarVistaPrevia('habitaciones_base', request).subscribe({
      next: (response) => {
        this.datosPreview.set(response.rows);
        this.totalRegistros.set(response.total);
        this.cargandoPreview.set(false);
        this.mostrarMensaje(`Vista previa generada: ${response.total} registros encontrados`);
      },
      error: (error) => {
        console.error('Error en vista previa:', error);
        this.cargandoPreview.set(false);
        this.mostrarMensaje('Error al conectar con el servidor. Mostrando datos de ejemplo.');

        // Datos de ejemplo para demostración
        const datosEjemplo = [
          { id: 1, hotel__nombre: 'Hotel Central', numero: '101', estado: 'Disponible' },
          { id: 2, hotel__nombre: 'Hotel Central', numero: '102', estado: 'Ocupada' },
          { id: 3, hotel__nombre: 'Hotel Plaza', numero: '201', estado: 'Disponible' },
          { id: 4, hotel__nombre: 'Hotel Plaza', numero: '202', estado: 'Mantenimiento' },
          { id: 5, hotel__nombre: 'Hotel Vista', numero: '301', estado: 'Disponible' }
        ];

        // Filtrar solo las columnas seleccionadas
        const datosFiltrados = datosEjemplo.map(row => {
          const filtrado: any = {};
          columnas.forEach(col => {
            if (row.hasOwnProperty(col)) {
              filtrado[col] = (row as any)[col];
            }
          });
          return filtrado;
        });

        this.datosPreview.set(datosFiltrados.slice(0, this.limite));
        this.totalRegistros.set(datosEjemplo.length);
      }
    });
  }

  exportarArchivo() {
    const columnas = this.columnasSeleccionadasArray();
    if (columnas.length === 0) {
      this.mostrarMensaje('Debe seleccionar al menos una columna');
      return;
    }

    this.cargandoExport.set(true);

    const request: ReporteExportRequest = {
      columns: columnas,
      filters: this.filtros.filter(f => f.field && f.op && f.value !== ''),
      ordering: this.ordenamiento,
      format: this.formatoExport as 'xlsx' | 'docx' | 'pdf'
    };

    this.reporteService.exportarReporte('habitaciones_base', request).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `reporte_habitaciones.${this.formatoExport}`);
        this.cargandoExport.set(false);
        this.mostrarMensaje('Reporte descargado exitosamente');
      },
      error: (error) => {
        console.error('Error al exportar:', error);
        this.cargandoExport.set(false);
        this.mostrarMensaje(`Error al exportar reporte: ${error.status || 'Sin conexión'} - Verifique que el servidor esté disponible y tenga permisos`);
      }
    });
  }

  enviarPorEmail() {
    const columnas = this.columnasSeleccionadasArray();
    if (columnas.length === 0) {
      this.mostrarMensaje('Debe seleccionar al menos una columna');
      return;
    }

    if (!this.emailDestinatario) {
      this.mostrarMensaje('Debe ingresar un email destinatario');
      return;
    }

    this.cargandoEmail.set(true);

    const request: ReporteEmailRequest = {
      columns: columnas,
      filters: this.filtros.filter(f => f.field && f.op && f.value !== ''),
      ordering: this.ordenamiento,
      format: this.formatoExport as 'xlsx' | 'docx' | 'pdf',
      recipient_email: this.emailDestinatario,
      subject: this.emailAsunto,
      message: this.emailMensaje
    };

    this.reporteService.enviarReportePorEmail('habitaciones_base', request).subscribe({
      next: (response) => {
        this.cargandoEmail.set(false);
        if (response && response.message) {
          this.mostrarMensaje(response.message);
        } else {
          this.mostrarMensaje(`Reporte enviado exitosamente a ${this.emailDestinatario}`);
        }
      },
      error: (error) => {
        console.error('Error al enviar email:', error);
        this.cargandoEmail.set(false);
        this.mostrarMensaje(`Error al enviar email: ${error.status || 'Sin conexión'} - Verifique la configuración del servidor de email`);
      }
    });
  }

  private descargarArchivo(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private mostrarMensaje(mensaje: string) {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
