import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface ConfirmRestoreDialogData {
  backup: any;
  titulo: string;
  mensaje: string;
  detalles: Array<{ label: string; value: string }>;
  advertencia: string;
}

@Component({
  selector: 'app-confirm-restore-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="restore-dialog">
      <h2 mat-dialog-title class="dialog-title">
        {{ data.titulo }}
      </h2>

      <mat-dialog-content class="dialog-content">
        <p class="mensaje">{{ data.mensaje }}</p>

        <div class="detalles-container">
          <div class="detalle-item" *ngFor="let detalle of data.detalles">
            <span class="detalle-label">{{ detalle.label }}:</span>
            <span class="detalle-value">{{ detalle.value }}</span>
          </div>
        </div>

        <mat-divider class="my-3"></mat-divider>

        <div class="advertencia">
          <mat-icon color="warn">warning</mat-icon>
          <p>{{ data.advertencia }}</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()" class="btn-cancelar">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="accent" (click)="onConfirm()" class="btn-confirmar">
          <mat-icon>restore</mat-icon>
          Sí, Restaurar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .restore-dialog {
      min-width: 450px;
    }

    .dialog-title {
      color: #1976d2;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dialog-content {
      padding: 20px 24px;
    }

    .mensaje {
      font-size: 16px;
      color: #424242;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .detalles-container {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .detalle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .detalle-item:last-child {
      border-bottom: none;
    }

    .detalle-label {
      font-weight: 600;
      color: #616161;
      font-size: 14px;
    }

    .detalle-value {
      color: #212121;
      font-size: 14px;
      font-weight: 500;
    }

    .advertencia {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
    }

    .advertencia mat-icon {
      margin-top: 2px;
    }

    .advertencia p {
      margin: 0;
      color: #e65100;
      font-size: 14px;
      line-height: 1.5;
    }

    .dialog-actions {
      padding: 16px 24px;
      gap: 12px;
    }

    .btn-cancelar {
      color: #757575;
    }

    .btn-confirmar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-confirmar mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class ConfirmRestoreDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmRestoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmRestoreDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
