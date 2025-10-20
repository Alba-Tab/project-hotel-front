import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-check-in-out-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './check-in-out-modal.html',
  styleUrls: ['./check-in-out-modal.scss'],
})
export class CheckInOutModal implements OnInit {
  form: FormGroup;
  isCheckOut: boolean = false;
  reserva: any;
  checkInData: any = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckInOutModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reserva = data.reserva;
    this.isCheckOut = data.isCheckOut || false;
    this.checkInData = data.checkInData || null;

    this.form = this.fb.group({
      fecha_checkin: [
        {
          value: this.checkInData?.fecha_checkin || new Date(),
          disabled: this.isCheckOut,
        },
        Validators.required,
      ],
      hora_checkin: [
        {
          value: this.checkInData?.hora_checkin || this.getCurrentTime(),
          disabled: this.isCheckOut,
        },
        Validators.required,
      ],
      fecha_checkout: [
        this.isCheckOut ? new Date() : null,
        this.isCheckOut ? Validators.required : null,
      ],
      hora_checkout: [
        this.isCheckOut ? this.getCurrentTime() : null,
        this.isCheckOut ? Validators.required : null,
      ],
      observaciones: [''],
    });
  }

  ngOnInit(): void {}

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      const data: any = {
        reserva_id: this.reserva.id,
        fecha_checkin: this.formatDate(formValue.fecha_checkin),
        hora_checkin: formValue.hora_checkin,
        observaciones: formValue.observaciones || '',
      };

      if (this.isCheckOut) {
        data.fecha_checkout = this.formatDate(formValue.fecha_checkout);
        data.hora_checkout = formValue.hora_checkout;
      }

      this.dialogRef.close(data);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
