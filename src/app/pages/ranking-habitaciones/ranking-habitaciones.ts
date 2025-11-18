import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexGrid,
  NgApexchartsModule,
} from 'ng-apexcharts';

// --- Interfaces de Datos ---
interface HabitacionRanking {
  id: number;
  numero: string;
  tipo: string;
  precio_noche: string;
  hotel__nombre: string;
  total_reservas: number;
}
interface DemandaMensual {
  year: number;
  month: number;
  total_reservas_mes: number;
}
interface RankingResponse {
  ranking_por_habitacion: HabitacionRanking[];
  demanda_mensual_historica: DemandaMensual[];
  periodo_ranking_usado: { inicio: string; fin: string; nota: string };
}
export interface DemandaChartConfig { 
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  plotOptions: any;
  stroke: any;
  markers: any;
  dynamicMinWidth: string;
}
// -----------------------------

@Component({
  selector: 'app-ranking-habitaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    DatePipe,
    NgApexchartsModule,
  ],
  templateUrl: './ranking-habitaciones.html',
  styleUrl: './ranking-habitaciones.scss', // Se debe crear un archivo SCSS si es necesario
})
export class RankingHabitaciones implements OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Filtros
  idHotel: number | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  hoteles = signal<any[]>([]); // Lista de hoteles (simulada o cargada)

  // Datos y Estados
  ranking = signal<HabitacionRanking[]>([]);
  demandaHistorica = signal<DemandaMensual[]>([]);
  periodoUsado = signal({ inicio: 'N/A', fin: 'N/A' });
  loading = signal(false);

  // 💡 Lógica para transformar la señal de datos en la configuración del gráfico
  demandaChart = computed<Partial<DemandaChartConfig>>(() => {
    const data = this.demandaHistorica();
    
    // 1. Limitar a 13 meses (último año + mes actual)
    // Usamos slice(0, 13) para obtener los 13 meses más recientes (si existen)
    const limitedData = [...data].slice(0, 13);
    // 2. Ordenar ascendentemente (Pasado -> Presente)
    const sortedData = limitedData.reverse(); 
    const dataCount = sortedData.length;

    const categories = sortedData.map(d => `${d.month}/${d.year}`);
    const seriesData = sortedData.map(d => d.total_reservas_mes);

    // Configuración base con valores por defecto (Gráfico de Líneas)
    const baseChartConfig: Partial<DemandaChartConfig> = {
        series: [],
        chart: { 
            type: 'line', 
            height: 250, 
            width: '100%', // 👈 Siempre ocupa el 100% del ancho disponible
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'inherit',
        },
        xaxis: { categories: [], title: { text: 'Mes' }, axisBorder: { show: false } },
        yaxis: { title: { text: 'Total' } },
        dataLabels: { enabled: false },
        grid: { show: true, borderColor: '#e0e0e0', strokeDashArray: 3 },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
        stroke: { curve: 'smooth', width: 3 }, 
        markers: { size: 6, strokeWidth: 2, hover: { sizeOffset: 4 } },
        dynamicMinWidth: '100%',
    };

    if (data.length === 0) {
      return baseChartConfig; 
    }

    return {
        ...baseChartConfig,
        series: [{
            name: "Reservas",
            data: seriesData
        }],
        xaxis: { categories: categories, title: { text: 'Mes' } },
        dynamicMinWidth: '100%',
    };
  });

  // Columnas de la tabla
  displayedColumns: string[] = [
    'ranking',
    'hotel',
    'numero',
    'tipo',
    'reservas',
    'precio',
    'accion',
  ];

  ngOnInit(): void {
    //Inicializa el ranking para el mes actual por defecto
    this.cargarHoteles();
    this.cargarRanking();
  }

  cargarHoteles(): void {
    // Si tu app ya está en modo tenant, es mejor cargar los hoteles para el select
    this.apiService.listar<any[]>('hoteles/hoteles').subscribe({
      next: (data) => {
        const hoteldData = Array.isArray(data) ? data : []; 
        this.hoteles.set(hoteldData);
      },
      error: (err) => console.error('Error cargando hoteles:', err),
    });
  }

  cargarRanking(): void {
    this.loading.set(true);

    // Formatear fechas para la API (YYYY-MM-DD)
    const params: any = {};
    if (this.idHotel) {
      params.id_hotel = this.idHotel;
    }
    if (this.fechaInicio) {
      params.fecha_inicio = this.formatDate(this.fechaInicio);
    }
    if (this.fechaFin) {
      params.fecha_fin = this.formatDate(this.fechaFin);
    }

    this.apiService
      .listar<RankingResponse>('habitaciones/ranking-demanda', params)
      .subscribe({
        next: (response) => {
          this.ranking.set(response.ranking_por_habitacion);
          this.demandaHistorica.set(response.demanda_mensual_historica);
          this.periodoUsado.set(response.periodo_ranking_usado);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.snackBar.open('Error al cargar el ranking: ' + (err.error?.error || 'Verifique filtros'), 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
        },
      });
  }

  abrirDialogoAjuste(habitacion: HabitacionRanking): void {
    // Lógica para abrir el diálogo de ajuste de precio (usando MatDialog)
    // Se usaría un componente de diálogo similar a FidelizacionDialogComponent
    
    // Aquí se simula la acción para actualizar el precio con PATCH
    const nuevoPrecio = prompt(`Habitación ${habitacion.numero} - Precio actual: $${habitacion.precio_noche}. Ingrese nuevo precio:`);
    
    if (nuevoPrecio && !isNaN(Number(nuevoPrecio))) {
        this.actualizarPrecio(habitacion.id, Number(nuevoPrecio));
    } else if (nuevoPrecio !== null) {
        this.snackBar.open('Precio inválido.', 'Cerrar', { duration: 3000 });
    }
  }

  actualizarPrecio(id: number, nuevoPrecio: number): void {
    const payload = { precio_noche: nuevoPrecio };
    
    this.apiService.actualizar('habitaciones', id, payload).subscribe({
      next: () => {
        this.snackBar.open(`Precio de Habitación ${id} actualizado a $${nuevoPrecio.toFixed(2)}`, 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
        this.cargarRanking(); // Recargar datos
      },
      error: (err) => {
         this.snackBar.open('Error al actualizar precio.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  }
}