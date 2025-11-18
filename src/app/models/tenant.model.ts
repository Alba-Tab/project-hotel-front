export interface TenantForm {
  first_name: string;
  last_name: string;
  email: string;
  nombre_empresa: string;
  username: string;
  password: string;
  phone: string;
  plan_id?: number; // ID del plan de suscripción seleccionado
}

export interface TenantResponse {
  tenant_id: number;
  schema_name: string;
  domain: string;
  admin_username: string;
  admin_email: string;
}
