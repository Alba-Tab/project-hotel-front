import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { authGuard } from './guards/auth.guard';

import { TenantRegisterComponent } from './pages/tenant-register/tenant-register.component';
import { MainPageComponent } from './pages/main-page/main-page.component';


export const routes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'principal',
        component: MainPageComponent, // ✅ Página principal como inicio
        pathMatch: 'full',
      },

      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
      {
        path: 'registrar-empresa',
        component: TenantRegisterComponent,
      },
    ],
  },
  {
    path: '',
    component: FullComponent,
    // canActivate: [authGuard], // ← Agregar esto
    children: [
      {
        path: '',
        redirectTo: 'dashboard', // ✅ Sin barra inicial - redirección relativa
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'hoteles',
        loadComponent: () =>
          import('./pages/hoteles/hoteles.component').then(
            (m) => m.HotelesComponent
          ),
      },
      {
        path: 'habitaciones',
        loadChildren: () =>
          import('./pages/habitaciones/habitaciones.routes').then(
            (m) => m.HabitacionesRoutes
          ),
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./pages/reservas/reservas').then((m) => m.Reservas),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./pages/pagos/pagos.component').then((m) => m.PagosComponent),
      },
      {
  path: 'auditoria',
  loadComponent: () =>
    import('./pages/auditoria/auditoria.component').then(
      (m) => m.AuditoriaComponent
    ),
},

      {
        path: 'fidelizacion',
        loadComponent: () =>
          import('./pages/fidelizacion/fidelizacion.component').then(
            (m) => m.FidelizacionComponent
          ),
      },
      {
        path: 'roles-permisos',
        loadComponent: () =>
          import('./pages/roles-permisos/roles-permisos').then(
            (m) => m.RolesPermisos
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./pages/servicios/servicios.component').then(
            (m) => m.ServiciosComponent
          ),
      },
      {
        path: 'servicios-asociados',
        loadComponent: () =>
          import(
            './pages/servicios-asociados/servicios-asociados.component'
          ).then((m) => m.ServiciosAsociadosComponent),
      },
      {
        path: 'folio-estancia',
        loadComponent: () =>
          import('./pages/folio-estancia/folio-estancia').then(
            (m) => m.FolioEstanciaComponent
          ),
      },

      {
        path: 'suscripcion',
        loadComponent: () =>
          import('./pages/suscripcion/suscripcion.component').then(
            (m) => m.SuscripcionComponent
          ),
      },
      {
        path: 'backups',
        loadChildren: () =>
          import('./pages/backups/backups.routes').then(
            (m) => m.BackupsRoutes
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
