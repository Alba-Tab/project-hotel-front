/**
 * Interface para el modelo Backup
 * Basada en el serializer del backend Django
 */
export interface Backup {
  id: number;
  tenant: number | null;
  tenant_nombre: string | null;
  tenant_schema: string | null;
  archivo: string;
  tipo: 'manual' | 'auto_daily' | 'auto_weekly' | 'auto_monthly';
  tipo_display: string;
  backup_type: 'full' | 'tenant';
  backup_type_display: string;
  fecha: string; // ISO date string
  estado: 'ok' | 'error' | 'en_progreso';
  estado_display: string;
  mensaje: string;
  tamano_bytes: number;
  tamano_mb: number;
  duracion_segundos: number;
  es_exitoso: boolean;
}

/**
 * Estadísticas de backups
 */
export interface BackupStats {
  total_backups: number;
  total_size: number;
  total_size_mb: number;
  oldest: string | null;
  newest: string | null;
  exitosos?: number;
  fallidos?: number;
}

/**
 * Respuesta de estadísticas completas
 */
export interface BackupStatsResponse {
  full: BackupStats;
  tenant: BackupStats;
  base_datos: {
    total: number;
    exitosos: number;
    fallidos: number;
  };
}

/**
 * Configuración de backups
 */
export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention_days: number;
  storage: 'local' | 's3' | 'both';
}

/**
 * Request para crear backup completo
 */
export interface CrearBackupFullRequest {
  tipo?: 'manual' | 'auto_daily' | 'auto_weekly' | 'auto_monthly';
}

/**
 * Request para crear backup de tenants
 */
export interface CrearBackupTenantsRequest {
  tipo?: 'manual' | 'auto_daily' | 'auto_weekly' | 'auto_monthly';
  schema?: string;
}

/**
 * Respuesta al crear backup de tenants
 */
export interface CrearBackupTenantsResponse {
  resultados: {
    tenant: string;
    estado: string;
    mensaje: string;
    archivo: string;
  }[];
}
