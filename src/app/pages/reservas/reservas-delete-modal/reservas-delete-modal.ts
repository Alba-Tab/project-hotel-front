import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reservas-delete-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reservas-delete-modal.html',
  styleUrl: './reservas-delete-modal.scss'
})
export class ReservasDeleteModal {

  constructor(
    public dialogRef: MatDialogRef<ReservasDeleteModal>,
    @Inject(MAT_DIALOG_DATA) public reserva: any
  ) {}

  confirmarEliminacion(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
