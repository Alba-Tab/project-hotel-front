import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './guards/auth.guard';

import { TenantRegisterComponent } from './pages/tenant-register/tenant-register.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { Usuarios } from './pages/usuarios/usuarios';
import { RolesPermisos } from './pages/roles-permisos/roles-permisos';
export const routes: Routes = [

  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard], // ← Agregar esto
    children: [
      // {
      //   path: '',
      //   redirectTo: '/dashboard',
      //   pathMatch: 'full',
      // },
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
        path: 'hoteles',
        loadComponent: () =>
          import('./pages/hoteles/hoteles.component').then(
            (m) => m.HotelesComponent
          ),
      },
      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./pages/habitaciones/habitaciones.component').then(
            (m) => m.HabitacionesComponent
          ),
        // data: {
        //   title: 'Habitaciones',
        //   urls: [
        //     { title: 'Dashboard', url: '/dashboard' },
        //     { title: 'Habitaciones' },
        //   ],
        // },
      },
      // {
      //   path: '',
      //   component: BlankComponent,
      //   children: [
      //     {
      //       path: 'hoteles',
      //       loadChildren: () =>
      //         import('./pages/hoteles/hoteles.routes').then(
      //           (m) => m.HotelesRoutes
      //         ),
      //     },
      //   ],
      // },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'usuarios',
        component: Usuarios,

      },
      {
        path: 'roles-permisos',
        component: RolesPermisos,
      }
    ],
  },

  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'inicio',
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
    path: '**',
    redirectTo: 'authentication/error',
  },
];
