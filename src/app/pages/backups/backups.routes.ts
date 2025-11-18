import { Routes } from '@angular/router';
import { ListaBackupsComponent } from './lista-backups/lista-backups.component';
import { CrearBackupComponent } from './crear-backup/crear-backup.component';
// import { EstadisticasBackupComponent } from './estadisticas-backup/estadisticas-backup.component';

export const BackupsRoutes: Routes = [
  {
    path: '',
    component: ListaBackupsComponent,
  },
  {
    path: 'crear',
    component: CrearBackupComponent,
  },
  // {
  //   path: 'estadisticas',
  //   component: EstadisticasBackupComponent,
  // }
];
