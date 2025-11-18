import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { BackupService } from '../../../services/backup.service';

@Component({
  selector: 'app-crear-backup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatInputModule,
    MatRadioModule
  ],
  templateUrl: './crear-backup.component.html',
  styleUrl: './crear-backup.component.scss'
})
export class CrearBackupComponent implements OnInit {
  private backupService = inject(BackupService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Formulario
  tipoBackup: 'full' | 'tenant' = 'tenant';
  tipoFrecuencia: 'manual' | 'auto_daily' | 'auto_weekly' | 'auto_monthly' = 'manual';
  schemaName = '';

  // Estado
  creando = false;
  progreso = 0;

  // Opciones
  tiposFrecuencia = [
    { value: 'manual', label: 'Manual' },
    { value: 'auto_daily', label: 'Automático Diario' },
    { value: 'auto_weekly', label: 'Automático Semanal' },
    { value: 'auto_monthly', label: 'Automático Mensual' }
  ];

  ngOnInit(): void {
    // 🎯 Capturar el tenant automáticamente al cargar el componente
    this.capturarTenantDesdeURL();
  }

  /**
   * 🔍 Captura el subdominio (tenant) de la URL actual
   * Ejemplo: noelhotel.localhost:4200 → schemaName = "noelhotel"
   */
  capturarTenantDesdeURL(): void {
    const hostname = window.location.hostname;

    console.log('🌐 URL completa:', window.location.href);
    console.log('🏠 Hostname:', hostname);

    // Extraer el subdominio (todo antes del primer punto)
    const partes = hostname.split('.');

    if (partes.length > 1) {
      // Si hay subdominios (ej: noelhotel.localhost)
      const subdominio = partes[0];

      // Validar que no sea 'localhost' o 'www' o IPs
      if (subdominio !== 'localhost' &&
          subdominio !== 'www' &&
          subdominio !== '127' &&
          !subdominio.match(/^\d+$/)) { // No es un número (IP)
        this.schemaName = subdominio;
        console.log('✅ Tenant capturado:', this.schemaName);

        // Mostrar notificación de éxito
        this.snackBar.open(`✅ Tenant detectado: ${this.schemaName}`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.schemaName = '';
        console.log('⚠️ No se detectó tenant válido (es localhost directo)');
      }
    } else {
      // Si solo es 'localhost' o una IP sin subdominios
      this.schemaName = '';
      console.log('⚠️ URL sin subdominios (localhost o IP directa)');
    }
  }

  /**
   * Obtener label de la frecuencia seleccionada
   */
  getFrecuenciaLabel(): string {
    return this.tiposFrecuencia.find(t => t.value === this.tipoFrecuencia)?.label || 'Manual';
  }

  /**
   * 🚀 Crear backup según el tipo seleccionado
   */
  crearBackup(): void {
    // Validación adicional para tenant
    if (this.tipoBackup === 'tenant' && !this.schemaName) {
      this.snackBar.open(
        '⚠️ No se detectó un tenant. Accede desde un subdominio (ej: noelhotel.localhost:4200)',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    if (this.tipoBackup === 'full') {
      this.crearBackupFull();
    } else {
      this.crearBackupTenant();
    }
  }

  /**
   * Crear backup completo (toda la base de datos)
   */
  private crearBackupFull(): void {
    console.log('🚀 Iniciando creación de backup FULL');
    console.log('📋 Tipo frecuencia:', this.tipoFrecuencia);

    this.creando = true;
    this.progreso = 0;

    // Simular progreso
    const intervalo = setInterval(() => {
      if (this.progreso < 90) {
        this.progreso += 10;
      }
    }, 500);

    this.backupService.crearBackupFull({ tipo: this.tipoFrecuencia }).subscribe({
      next: (response: any) => {
        console.log('✅ Backup creado exitosamente:', response);
        clearInterval(intervalo);
        this.progreso = 100;

        this.snackBar.open(
          `✅ Backup completo creado exitosamente (${response.tamano_mb} MB)`,
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

        // Redirigir a la lista después de 1 segundo
        setTimeout(() => {
          this.router.navigate(['/backups']);
        }, 1000);
      },
      error: (error: any) => {
        console.error('❌ ERROR COMPLETO:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error body:', error.error);

        clearInterval(intervalo);
        this.creando = false;
        this.progreso = 0;

        let mensaje = 'Error al crear el backup completo';

        if (error.status === 0) {
          mensaje = 'Error de conexión. Verifica que el backend esté corriendo.';
        } else if (error.status === 401) {
          mensaje = 'No estás autenticado. Por favor inicia sesión.';
        } else if (error.status === 403) {
          mensaje = 'No tienes permisos para crear backups.';
        } else if (error.status === 404) {
          mensaje = 'Endpoint no encontrado. Verifica la URL del backend.';
        } else if (error.error?.error) {
          mensaje = error.error.error;
        }

        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
          duration: 7000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Crear backup de tenant específico
   */
  private crearBackupTenant(): void {
    console.log('🚀 Iniciando creación de backup TENANT');
    console.log('📋 Schema:', this.schemaName);
    console.log('📋 Tipo frecuencia:', this.tipoFrecuencia);

    this.creando = true;
    this.progreso = 0;

    // Simular progreso
    const intervalo = setInterval(() => {
      if (this.progreso < 90) {
        this.progreso += 10;
      }
    }, 500);

    const datos = {
      tipo: this.tipoFrecuencia,
      schema: this.schemaName // ✅ Siempre enviar el schema capturado
    };

    console.log('📤 Datos enviados al backend:', datos);

    this.backupService.crearBackupTenants(datos).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        clearInterval(intervalo);
        this.progreso = 100;

        const exitosos = response.resultados.filter((r: any) => r.estado === 'ok').length;
        const fallidos = response.resultados.filter((r: any) => r.estado === 'error').length;

        let mensaje = `✅ Backups creados: ${exitosos} exitosos`;
        if (fallidos > 0) {
          mensaje += `, ${fallidos} fallidos`;
        }

        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          panelClass: fallidos > 0 ? ['warning-snackbar'] : ['success-snackbar']
        });

        // Redirigir a la lista después de 1 segundo
        setTimeout(() => {
          this.router.navigate(['/backups']);
        }, 1000);
      },
      error: (error: any) => {
        console.error('❌ ERROR:', error);
        clearInterval(intervalo);
        this.creando = false;
        this.progreso = 0;

        let mensaje = 'Error al crear backup de tenant';

        if (error.status === 404) {
          mensaje = `Tenant "${this.schemaName}" no encontrado`;
        } else if (error.error?.error) {
          mensaje = error.error.error;
        }

        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Cancelar y volver a la lista
   */
  cancelar(): void {
    if (this.creando) {
      const confirmar = confirm('¿Seguro que deseas cancelar? El backup en progreso se perderá.');
      if (!confirmar) return;
    }

    this.router.navigate(['/backups']);
  }
}
