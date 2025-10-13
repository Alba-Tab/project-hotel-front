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
import { HotelService } from 'src/app/services/hotel.service';
import { Hotel } from 'src/app/interfaces/hotel.interface';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

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
  isEditMode = false;
  hotelId?: number;

  estados: Estado[] = [
    { value: 'Activo', viewValue: 'Activo' },
    { value: 'Inactivo', viewValue: 'Inactivo' },
  ]


  constructor(
    private fb: FormBuilder,
    // private hotelService: HotelService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CrearHotelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.isEditMode = !!data?.hotel;
    this.hotelId = data?.hotel?.id;

    this.hotelForm = this.fb.group({
      nombre: [data?.hotel?.nombre || '', [Validators.required]],
      telefono: [data?.hotel?.telefono ||'', [Validators.required]],
      direccion: [data?.hotel?.direccion ||'', [Validators.required]],
      ciudad: [data?.hotel?.ciudad ||'', [Validators.required]],
      pais: [data?.hotel?.pais ||'', [Validators.required]],
      estado: [data?.hotel?.estado ||'Activo', [Validators.required]],
    })
  }

  onSubmit() {
    if (this.hotelForm.valid) {
      const hotel: Hotel = this.hotelForm.value;

      const operation = this.isEditMode
        ? this.apiService.actualizar('hoteles',this.hotelId!, hotel)
        : this.apiService.crear('hoteles', hotel);

      operation.subscribe({
        next: (response) => {
          console.log(`Hotel ${this.isEditMode ? 'actualizado':'creado'}:`, response);
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.log('Error', error);
        }
      })

      // this.hotelService.createHotel(hotel).subscribe({
      //   next: (response) => {
      //     console.log('hotel creado', response);
      //     this.dialogRef.close(response);
      //     // this.router.navigate(['/hoteles/hotel']);
      //   },
      //   error: (error) => {
      //     console.log('Error al crear hotel: ', error);
      //   }
      // });
    } else {
      console.log('Formulario invalido');
    }
  }

  cancelar() {
    this.dialogRef.close();
    // this.router.navigate(['/hoteles/hotel']);
  }
}
