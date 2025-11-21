import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-usuarios-detalle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './usuarios-detalle-dialog.html',
  styleUrl: './usuarios-detalle-dialog.scss',
})
export class UsuariosDetalleDialog {
  private dialogRef = inject(MatDialogRef<UsuariosDetalleDialog>);
  data = inject(MAT_DIALOG_DATA);

  get usuario() {
    return this.data?.usuario;
  }

  onClose() {
    this.dialogRef.close();
  }
}
