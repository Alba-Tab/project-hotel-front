import { Component } from '@angular/core';

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

interface Estado {
  value: boolean;
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
  ],
  templateUrl: './crear-hotel.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearHotelComponent {

  hotelForm: FormGroup;

  estados: Estado[] = [
    { value: true, viewValue: 'Activo' },
    { value: false, viewValue: 'Inactivo' },
  ]

  categorias = [1,2,3,4,5];

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router
  ) {
    this.hotelForm = this.fb.group({
      nombre: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      categoria: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
      estado: [true, [Validators.required]],
    })
  }

  onSubmit() {
    if (this.hotelForm.valid) {
      const hotel: Hotel = this.hotelForm.value;

      this.hotelService.createHotel(hotel).subscribe({
        next: (response) => {
          console.log('hotel creado');
          this.router.navigate(['/hoteles']);
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
    this.router.navigate(['/hoteles']);
  }
}
