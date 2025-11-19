import { Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule,
  ],
  templateUrl: './check-in-out-modal.html',
  styleUrls: ['./check-in-out-modal.scss'],
})
export class CheckInOutModal implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  form: FormGroup;
  isCheckOut: boolean = false;
  reserva: any;
  checkInData: any = null;
  
  // Propiedades para captura de cámara
  isCameraOpen = false;
  photoCapture: File | null = null;
  photoPreviewUrl: string | null = null;
  stream: MediaStream | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckInOutModal>,
    private snackBar: MatSnackBar,
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
      // Validar foto solo para check-in
      if (!this.isCheckOut && !this.photoCapture) {
        this.snackBar.open('Debe capturar una foto para verificación facial', 'Cerrar', { duration: 3000 });
        return;
      }

      const formValue = this.form.getRawValue();

      const data: any = {
        reserva_id: this.reserva.id,
        fecha_checkin: this.formatDate(formValue.fecha_checkin),
        hora_checkin: formValue.hora_checkin,
        observaciones: formValue.observaciones || '',
        photo_checkin: this.photoCapture // Añadir foto
      };

      if (this.isCheckOut) {
        data.fecha_checkout = this.formatDate(formValue.fecha_checkout);
        data.hora_checkout = formValue.hora_checkout;
      }

      this.dialogRef.close(data);
    }
  }

  // Métodos para manejo de cámara
  async openCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      this.isCameraOpen = true;
      setTimeout(() => {
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
        }
      }, 100);
    } catch (error) {
      this.snackBar.open('No se pudo acceder a la cámara', 'Cerrar', { duration: 3000 });
      console.error('Error al acceder a la cámara:', error);
    }
  }

  capturePhoto(): void {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          this.photoCapture = new File([blob], 'photo_checkin.jpg', { type: 'image/jpeg' });
          this.photoPreviewUrl = URL.createObjectURL(blob);
          this.closeCamera();
          this.snackBar.open('Foto capturada correctamente', 'Cerrar', { duration: 2000 });
        }
      }, 'image/jpeg', 0.8);
    }
  }

  closeCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraOpen = false;
  }

  retakePhoto(): void {
    this.photoCapture = null;
    this.photoPreviewUrl = null;
    this.openCamera();
  }

  onCancel(): void {
    this.closeCamera();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.closeCamera();
  }
}
