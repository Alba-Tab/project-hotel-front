import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './auditoria.component.html'
})
export class AuditoriaComponent implements OnInit {

  displayedColumns: string[] = ['actor', 'action', 'content_type', 'object_pk', 'changes', 'timestamp'];
  dataSource: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarAuditorias();
  }

  cargarAuditorias() {
    this.apiService.listar('auditoria/').subscribe({
      next: (data: any) => {
        this.dataSource = data;
      },
      error: (error) => {
        console.error('Error al cargar auditorías:', error);
      }
    });
  }

  getActionLabel(action: number): string {
    switch (action) {
      case 0: return 'Creación';
      case 1: return 'Actualización';
      case 2: return 'Eliminación';
      default: return 'Desconocido';
    }
  }

  formatChanges(changes: any): string[] {
    if (!changes) return [];
    return Object.entries(changes).map(([campo, valores]: any) =>
      `${campo}: ${valores[0]} → ${valores[1]}`
    );
  }
}
