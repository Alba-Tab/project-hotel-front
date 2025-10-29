export interface PlanVariante {
  id: number;
  precio: string;
  tipo: string;
  tipo_display: string;
}

export interface PlanAgrupado {
  nombre: string;
  max_usuarios: number;
  max_hoteles: number;
  variantes: PlanVariante[];
}

export interface PlanSeleccionado {
  planId: number;
  planNombre: string;
  precio: string;
  tipo: string;
  maxUsuarios: number;
  maxHoteles: number;
}

export interface TenantRegistroPayload {
  first_name: string;
  last_name: string;
  email: string;
  nombre_empresa: string;
  username: string;
  password: string;
  phone: string;
  plan_suscripcion?: number;
}

export interface TenantRegistroResponse {
  message: string;
  tenant?: any;
  usuario?: any;
  [key: string]: any;
}
