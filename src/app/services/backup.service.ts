import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Backup,
  BackupStatsResponse,
  BackupConfig,
  CrearBackupFullRequest,
  CrearBackupTenantsRequest,
  CrearBackupTenantsResponse
} from '../interfaces/backup.interface';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private apiService = inject(ApiService);
  private readonly endpoint = 'backups';

  /**
   * Listar todos los backups con filtros opcionales
   * @param filtros Filtros opcionales: tipo, estado, tenant, backup_type
   */
  listarBackups(filtros?: {
    tipo?: string;
    estado?: string;
    tenant?: string;
    backup_type?: string;
  }): Observable<Backup[]> {
    return this.apiService.listar<Backup[]>(this.endpoint, filtros);
  }

  /**
   * Obtener un backup por ID
   * @param id ID del backup
   */
  obtenerBackup(id: number): Observable<Backup> {
    return this.apiService.obtener<Backup>(this.endpoint, id);
  }

  /**
   * Crear backup completo de toda la base de datos
   * @param datos Tipo de backup (manual por defecto)
   */
  crearBackupFull(datos: CrearBackupFullRequest = {}): Observable<Backup> {
    return this.apiService.crear<Backup>(`${this.endpoint}/crear-full`, datos);   /*POR VERIFICAR SI SI FUNCIONA */
    /*return this.apiService.crear<Backup>(`${this.endpoint}/crear-backup-full`, datos);*/
  }

  /**
   * Crear backups de todos los tenants o uno específico
   * @param datos Schema y tipo de backup
   */
  crearBackupTenants(datos: CrearBackupTenantsRequest = {}): Observable<CrearBackupTenantsResponse> {
    /*return this.apiService.crear<CrearBackupTenantsResponse>(`${this.endpoint}/crear-tenants`, datos);*/  /*POR VERIFICAR SI FUNCINONA TAMBIENE */
    return this.apiService.crear<CrearBackupTenantsResponse>(`${this.endpoint}/crear-tenants`, datos);
  }

  /**
   * Descargar un backup
   * @param id ID del backup a descargar
   */
  descargarBackup(id: number): void {
    // Construir URL de descarga
    const url = `${this.apiService['urlBase']}/${this.endpoint}/${id}/descargar/`;

    // Obtener token
    const token = localStorage.getItem('access_token');

    // Si hay token, usar fetch para descargar con autorización
    if (token) {
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('Error al descargar');
        return response.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `backup_${id}.sql`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error descargando backup:', error);
      });
    } else {
      // Sin token, abrir en nueva ventana
      window.open(url, '_blank');
    }
  }

  /**
   * Eliminar un backup
   * @param id ID del backup a eliminar
   */
  eliminarBackup(id: number): Observable<void> {
    return this.apiService.eliminar<void>(this.endpoint, id);
  }

  /**
   * Restaurar un backup
   * @param id ID del backup a restaurar
   */
  restaurarBackup(id: number): Observable<any> {
    return this.apiService.crear<any>(`${this.endpoint}/${id}/restaurar`, {});
  }

  /**
   * Obtener estadísticas de backups
   */
  obtenerEstadisticas(): Observable<BackupStatsResponse> {
    return this.apiService.listar<BackupStatsResponse>(`${this.endpoint}/estadisticas`);
  }

  /**
   * Obtener configuración de backups
   */
  obtenerConfiguracion(): Observable<BackupConfig> {
    return this.apiService.listar<BackupConfig>(`${this.endpoint}/configuracion`);
  }
}
