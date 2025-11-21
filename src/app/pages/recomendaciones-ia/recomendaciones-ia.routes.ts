import { Routes } from '@angular/router';

export const RecomendacionesIARoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      },
      {
        path: 'lista',
        loadComponent: () =>
          import('./lista-recomendaciones/lista-recomendaciones.component').then(
            (m) => m.ListaRecomendacionesComponent
          )
      },
      
    ]
  }
];
