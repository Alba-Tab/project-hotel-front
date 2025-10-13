import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { Usuarios } from './usuarios/usuarios';
import { RolesPermisos } from './roles-permisos/roles-permisos';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Starter' }],
    },
  },
  {
    path: 'usuarios',
    component: Usuarios,
    data: {
      title: 'Gestión de Usuarios',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Usuarios' },
      ],
    },
  },
  {
    path: 'roles-permisos',
    component: RolesPermisos,
    data: {
      title: 'Roles y Permisos',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Roles y Permisos' },
      ],
    },
  },
];
