import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-folio-estancia-form-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './folio-estancia-form-modal.html',
  styleUrls: ['./folio-estancia-form-modal.scss'],
})
export class FolioEstanciaFormModal implements OnInit {
  folioForm: FormGroup;
  isEdit: boolean;
  huespedes: any[] = [];
  reservas: any[] = [];
  estados = ['Pendiente', 'Pagado', 'Cancelado'];
  cargandoHuespedes = false;
  cargandoReservas = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<FolioEstanciaFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data?.isEdit || false;

    this.folioForm = this.fb.group({
      estado: ['Pendiente', Validators.required],
      total_pagado: ['', [Validators.required, Validators.min(0)]],
      huesped: ['', Validators.required],
      reserva: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerHuespedes();
    this.obtenerReservas();

    if (this.isEdit && this.data?.folio) {
      this.folioForm.patchValue({
        estado: this.data.folio.estado,
        total_pagado: this.data.folio.total_pagado,
        huesped: this.data.folio.huesped,
        reserva: this.data.folio.reserva,
      });
    }
  }

  obtenerHuespedes(): void {
    this.cargandoHuespedes = true;
    this.apiService.listar<any[]>('usuarios').subscribe({
      next: (huespedes) => {
        this.huespedes = huespedes || [];
        this.cargandoHuespedes = false;
      },
      error: (error) => {
        console.error('Error al cargar huéspedes:', error);
        this.cargandoHuespedes = false;
      },
    });
  }

  obtenerReservas(): void {
    this.cargandoReservas = true;
    this.apiService.listar<any[]>('reservas').subscribe({
      next: (reservas) => {
        this.reservas = reservas || [];
        this.cargandoReservas = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.cargandoReservas = false;
      },
    });
  }

  enviarFormulario(): void {
    if (this.folioForm.valid) {
      const payload = {
        estado: this.folioForm.value.estado,
        total_pagado: Number(this.folioForm.value.total_pagado),
        huesped: Number(this.folioForm.value.huesped),
        reserva: Number(this.folioForm.value.reserva),
      };

      this.dialogRef.close(payload);
    } else {
      this.marcarCamposTocados();
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private marcarCamposTocados(): void {
    Object.keys(this.folioForm.controls).forEach((key) => {
      this.folioForm.get(key)?.markAsTouched();
    });
  }

  obtenerMensajeError(nombreCampo: string): string {
    const campo = this.folioForm.get(nombreCampo);
    if (campo?.hasError('required')) {
      return `${this.obtenerEtiquetaCampo(nombreCampo)} es obligatorio`;
    }
    if (campo?.hasError('min')) {
      return `${this.obtenerEtiquetaCampo(
        nombreCampo
      )} debe ser un número positivo`;
    }
    return '';
  }

  private obtenerEtiquetaCampo(nombreCampo: string): string {
    const labels: Record<string, string> = {
      estado: 'El estado',
      total_pagado: 'El total pagado',
      huesped: 'El huésped',
      reserva: 'La reserva',
    };
    return labels[nombreCampo] || nombreCampo;
  }
}
