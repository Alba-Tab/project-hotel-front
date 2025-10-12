import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

import { CrearHotelComponent } from './hoteles/crear-hotel/crear-hotel.component';
import { HotelesComponent } from './hoteles/hoteles.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        // { title: 'Hoteles', url: '/hoteles' },
        { title: 'Starter' },
      ],
    },
    // children: [
    //       {
    //         path: 'hotel',
    //         component: HotelesComponent,
    //       },
    //       {
    //         path: 'crearhotel',
    //         component: CrearHotelComponent,
    //       },
    //     ],
  },

];
