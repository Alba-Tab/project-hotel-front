import { Component } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

interface Food {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-crear-hotel',
  imports: [
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

  state: Food[] = [
    { value: 'steak-0', viewValue: 'Activo' },
    { value: 'pizza-1', viewValue: 'Inactivo' },
  ];

  selectedState = this.state[1].value;
}
