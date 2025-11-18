import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:atom-line-duotone',
    route: '/dashboard',
  },
  {
    displayName: 'Reservas',
    iconName: 'solar:calendar-mark-line-duotone',
    route: '/reservas',
  },
  {
    displayName: 'Servicios Asociados',
    iconName: 'solar:checklist-minimalistic-line-duotone',
    route: '/servicios-asociados',
  },
  {
    displayName: 'Pagos',
    iconName: 'solar:card-2-broken',
    route: '/pagos',
  },
  {
    displayName: 'Folios de Estancia',
    iconName: 'solar:add-folder-broken',
    route: '/folio-estancia',
  },
  {
    displayName: 'Usuarios',
    iconName: 'solar:atom-line-duotone',
    route: '/usuarios',
  },
  {
    displayName: 'Fidelización',
    iconName: 'solar:star-line-duotone',
    route: '/fidelizacion',
  },
  {
    displayName: 'Auditoría',
    iconName: 'solar:add-folder-broken',
    route: '/auditoria',
  },
  {
    displayName: 'Hoteles',
    iconName: 'solar:widget-add-line-duotone',
    route: '/hoteles',
  },
  {
    displayName: 'Habitaciones',
    iconName: 'solar:home-smile-line-duotone',
    route: '/habitaciones',
  },

  // {
  //   displayName: 'Login',
  //   iconName: 'solar:lock-keyhole-minimalistic-line-duotone',
  //   route: '/authentication',
  //   children: [
  //     {
  //       displayName: 'Login',
  //        subItemIcon: true,
  //       iconName: 'solar:round-alt-arrow-right-line-duotone',
  //       route: '/authentication/login',
  //     },
  //     {
  //       displayName: 'Side Login',
  //        subItemIcon: true,
  //       iconName: 'solar:round-alt-arrow-right-line-duotone',
  //       route: 'https://materialm-angular-main.netlify.app/authentication/login',
  //       external: true,
  //       chip: true,
  //       chipClass: 'bg-light-secondary text-secondary',
  //       chipContent: 'PRO',
  //     },
  //   ],
  // },

  {
    displayName: 'Servicios',
    iconName: 'solar:bag-2-line-duotone',
    route: '/servicios',
    chip: false,
    external: false,
  },
  {
    displayName: 'Roles y Permisos',
    iconName: 'solar:shield-user-line-duotone',
    route: '/roles-permisos',
  },
  {
    displayName: 'Backups',
    iconName: 'solar:server-2-line-duotone',
    route: '/backups',
    children: [
      {
        displayName: 'Lista de Backups',
        subItemIcon: true,
        iconName: 'solar:round-alt-arrow-right-line-duotone',
        route: '/backups',
      },
      {
        displayName: 'Crear Backup',
        subItemIcon: true,
        iconName: 'solar:round-alt-arrow-right-line-duotone',
        route: '/backups/crear',
      },
      // {
      //   displayName: 'Estadísticas',
      //   subItemIcon: true,
      //   iconName: 'solar:round-alt-arrow-right-line-duotone',
      //   route: '/backups/estadisticas',
      // },
    ],
  },

  {
    divider: true,
    navCap: 'Apps',
  },

  {
    displayName: 'Suscripciones',
    iconName: 'solar:home-smile-line-duotone',
    route: '/suscripcion',
  },

  {
    navCap: 'Ui Components',
    divider: true,
  },
  {
    displayName: 'Badge',
    iconName: 'solar:archive-minimalistic-line-duotone',
    route: '/ui-components/badge',
  },
  {
    displayName: 'Chips',
    iconName: 'solar:danger-circle-line-duotone',
    route: '/ui-components/chips',
  },
  {
    displayName: 'Lists',
    iconName: 'solar:bookmark-square-minimalistic-line-duotone',
    route: '/ui-components/lists',
  },
  {
    displayName: 'Menu',
    iconName: 'solar:file-text-line-duotone',
    route: '/ui-components/menu',
  },
  {
    displayName: 'Tooltips',
    iconName: 'solar:text-field-focus-line-duotone',
    route: '/ui-components/tooltips',
  },
  {
    displayName: 'Forms',
    iconName: 'solar:file-text-line-duotone',
    route: '/ui-components/forms',
  },
  {
    displayName: 'Tables',
    iconName: 'solar:tablet-line-duotone',
    route: '/ui-components/tables',
  },

  {
    divider: true,
    navCap: 'Pages',
  },

  {
    navCap: 'Extra',
    divider: true,
  },
  {
    displayName: 'Icons',
    iconName: 'solar:sticker-smile-circle-2-line-duotone',
    route: '/extra/icons',
  },
  {
    displayName: 'Sample Page',
    iconName: 'solar:planet-3-line-duotone',
    route: '/extra/sample-page',
  },

  {
    divider: true,
    navCap: 'Auth',
  },
  {
    displayName: 'Login',
    iconName: 'solar:lock-keyhole-minimalistic-line-duotone',
    route: '/authentication',
    children: [
      {
        displayName: 'Login',
        subItemIcon: true,
        iconName: 'solar:round-alt-arrow-right-line-duotone',
        route: '/authentication/login',
      },
    ],
  },
  {
    displayName: 'Register',
    iconName: 'solar:user-plus-rounded-line-duotone',
    route: '/authentication',
    children: [
      {
        displayName: 'Register',
        subItemIcon: true,
        iconName: 'solar:round-alt-arrow-right-line-duotone',
        route: '/authentication/register',
      },
    ],
  },
];
