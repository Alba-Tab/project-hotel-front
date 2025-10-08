import { Routes } from '@angular/router';

import { CrearHotelComponent } from './crear-hotel/crear-hotel.component';
import { HotelesComponent } from './hoteles.component';

export const HotelesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'hotel',
        component: HotelesComponent,
      },
      {
        path: 'crearhotel',
        component: CrearHotelComponent,
      },
    ],
  },
];
