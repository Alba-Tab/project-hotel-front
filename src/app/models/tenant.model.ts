/**
 * Modelos de Tenant para sistema multitenant basado en headers.
 * Ya no se usan dominios - solo schema_name (código de empresa).
 */

export interface TenantForm {
  first_name: string;
  last_name: string;
  email: string;
  nombre_empresa: string;
  username: string;
  password: string;
  phone?: string;
  codigo_empresa?: string; // Código de empresa opcional (se genera del nombre si no se provee)
  plan_id?: number; // ID del plan de suscripción seleccionado
}

export interface TenantResponse {
  tenant_id: number;
  schema_name: string; // Código único de la empresa (reemplaza domain)
  admin_username: string;
  admin_email: string;
  message: string;
  status: 'creating' | 'active'; // Estado del tenant
}
