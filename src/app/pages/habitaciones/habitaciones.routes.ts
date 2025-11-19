import { Routes } from '@angular/router';

export const HabitacionesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./habitaciones.component').then(
        (m) => m.HabitacionesComponent
      ),
  },
  {
    path: 'recomendaciones',
    loadComponent: () =>
      import('./recomendaciones/recomendaciones.component').then(
        (m) => m.RecomendacionesComponent
      ),
  },
];
