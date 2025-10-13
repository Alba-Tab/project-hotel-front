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
  
];
