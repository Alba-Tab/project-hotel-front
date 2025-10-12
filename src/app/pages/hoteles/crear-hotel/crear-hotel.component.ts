import { Component, Inject } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { Value } from 'sass';
import { HotelService } from 'src/app/services/hotel.service';
import { Router } from '@angular/router';
import { Hotel } from 'src/app/interfaces/hotel.interface';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Estado {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-crear-hotel',
  imports: [
    CommonModule,
    FormsModule,

    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
  templateUrl: './crear-hotel.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearHotelComponent {

  hotelForm: FormGroup;

  estados: Estado[] = [
    { value: 'Activo', viewValue: 'Activo' },
    { value: 'Inactivo', viewValue: 'Inactivo' },
  ]


  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router,
    private dialogRef: MatDialogRef<CrearHotelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.hotelForm = this.fb.group({
      nombre: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      pais: ['', [Validators.required]],

      estado: ['Activo', [Validators.required]],
    })
  }

  onSubmit() {
    if (this.hotelForm.valid) {
      const hotel: Hotel = this.hotelForm.value;

      this.hotelService.createHotel(hotel).subscribe({
        next: (response) => {
          console.log('hotel creado', response);
          this.dialogRef.close(response);
          // this.router.navigate(['/hoteles/hotel']);
        },
        error: (error) => {
          console.log('Error al crear hotel: ', error);
        }
      });
    } else {
      console.log('Formulario invalido');
    }
  }

  cancelar() {
    this.dialogRef.close();
    // this.router.navigate(['/hoteles/hotel']);
  }
}
