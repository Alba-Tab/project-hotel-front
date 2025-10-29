# Sistema de Planes de Suscripción - Documentación

## 📋 Descripción General

Sistema completo de selección y registro de planes de suscripción dinámicos desde la API del backend.

## 🎯 Flujo de Usuario

### 1. Página Principal (Main Page)
- **Endpoint**: `GET http://localhost:8000/api/planes/agrupados/`
- **Componente**: `MainPageComponent`
- **Funcionalidad**:
  - Carga dinámica de planes desde el backend
  - Muestra tarjetas de suscripción con variantes (Mensual, Trimestral, Anual)
  - Permite seleccionar una variante específica
  - Estados de carga, error y vacío

### 2. Tarjeta de Suscripción
- **Componente**: `SubscriptionCardComponent` (Reutilizable)
- **Características**:
  - Muestra información del plan: nombre, límites de usuarios y hoteles
  - Chips interactivos para cambiar entre variantes de precio
  - Botón de suscripción que envía datos al registro
  - Diseño responsivo y destacado para planes populares

### 3. Registro de Tenant
- **Componente**: `TenantRegisterComponent`
- **Funcionalidad**:
  - Recibe datos del plan seleccionado mediante navegación con `state`
  - Muestra tarjeta lateral "sticky" con resumen del plan
  - Formulario completo de registro
  - Envía `plan_suscripcion` (ID) junto con los datos del usuario
  - Manejo de errores mejorado con mensajes específicos
  - Muestra el `message` de la respuesta exitosa del backend

## 📁 Estructura de Archivos

```
src/app/
├── interfaces/
│   └── planes.interface.ts          # Interfaces compartidas
├── pages/
│   ├── main-page/
│   │   ├── main-page.component.ts   # Lógica principal
│   │   ├── main-page.component.html # Template con estados
│   │   ├── main-page.component.scss # Estilos
│   │   └── subscription-card/       # Componente hijo
│   │       ├── subscription-card.component.ts
│   │       ├── subscription-card.component.html
│   │       └── subscription-card.component.scss
│   └── tenant-register/
│       ├── tenant-register.component.ts   # Con recepción de plan
│       ├── tenant-register.component.html # Layout 2 columnas
│       └── tenant-register.component.scss # Estilos del plan card
```

## 🔌 Endpoints Utilizados

### GET Planes Agrupados
```http
GET http://localhost:8000/api/planes/agrupados/
```

**Respuesta esperada:**
```json
[
  {
    "nombre": "Plan Básico",
    "max_usuarios": 5,
    "max_hoteles": 1,
    "variantes": [
      {
        "id": 1,
        "precio": "29.99",
        "tipo": "Mensual",
        "tipo_display": "Mensual"
      },
      {
        "id": 2,
        "precio": "299.99",
        "tipo": "Anual",
        "tipo_display": "Anual"
      }
    ]
  }
]
```

### POST Registrar Tenant
```http
POST http://localhost:8000/api/tenants/registrar/
```

**Payload enviado:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@ejemplo.com",
  "nombre_empresa": "Hotel Paradise",
  "username": "juanperez",
  "password": "password123",
  "phone": "72665897",
  "plan_suscripcion": 1
}
```

**Respuesta esperada:**
```json
{
  "message": "Tenant creado exitosamente",
  "tenant": { ... },
  "usuario": { ... }
}
```

## 🎨 Características de UI

### Main Page
- ✅ Spinner de carga mientras se obtienen planes
- ✅ Mensaje de error con botón de reintentar
- ✅ Estado vacío si no hay planes
- ✅ Tarjetas responsivas con efecto hover
- ✅ Ribbon "MÁS POPULAR" en plan destacado
- ✅ Chips interactivos para variantes de precio

### Tenant Register
- ✅ Layout 2 columnas (formulario + resumen del plan)
- ✅ Tarjeta sticky del plan en pantallas grandes
- ✅ Responsive: columna única en mobile
- ✅ Visualización clara de características del plan
- ✅ Total a pagar con tipo de facturación
- ✅ Info box con mensaje de activación automática

## 🔄 Flujo de Datos

```
1. Usuario accede a Main Page
   ↓
2. Main Page carga planes desde API
   ↓
3. Usuario selecciona variante (ej: Mensual)
   ↓
4. Click en "Suscribirse"
   ↓
5. Navegación a Tenant Register con state:
   {
     planId: 1,
     planNombre: "Plan Básico",
     precio: "29.99",
     tipo: "Mensual",
     maxUsuarios: 5,
     maxHoteles: 1
   }
   ↓
6. Tenant Register muestra formulario + plan seleccionado
   ↓
7. Usuario completa formulario
   ↓
8. Submit envía datos + plan_suscripcion
   ↓
9. Backend responde con message
   ↓
10. Muestra mensaje y redirige a /principal
```

## 🛠️ Interfaces TypeScript

```typescript
// planes.interface.ts
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
```

## 🎯 Manejo de Errores

### Error al cargar planes
- Muestra icono de error
- Mensaje: "No se pudieron cargar los planes de suscripción"
- Botón "Reintentar" para volver a intentar la carga

### Error al registrar tenant
- Extrae mensaje del error del backend
- Prioridad: `error.message` > `error.detail` > `error.error` > mensajes de campo
- Muestra en snackbar con estilo de error
- Mantiene el formulario con los datos ingresados

### Respuesta exitosa
- Muestra el `message` de la respuesta en snackbar verde
- Resetea el formulario
- Redirige a `/principal` después de 3 segundos

## 📱 Responsividad

### Desktop (1024px+)
- Layout 2 columnas en registro
- Tarjeta del plan sticky
- 3 columnas para planes

### Tablet (768px - 1023px)
- 2 columnas para planes
- 1 columna en registro

### Mobile (<768px)
- 1 columna para todo
- Tarjeta del plan no sticky
- Botones full-width

## 🚀 Mejoras Implementadas

1. **Componente Reutilizable**: `SubscriptionCardComponent` puede usarse en otras partes
2. **Interfaces Compartidas**: Tipos centralizados en `planes.interface.ts`
3. **Estados de Carga**: UX mejorada con spinners y mensajes
4. **Manejo de Errores Robusto**: Múltiples niveles de extracción de mensajes
5. **Navegación con State**: Datos del plan persistidos entre páginas
6. **Diseño Moderno**: Uso de Angular Material y estilos personalizados
7. **Validación Completa**: Formulario con validadores y mensajes de error

## 📝 Notas Importantes

- El campo `plan_suscripcion` en el formulario es opcional pero se llena automáticamente si se viene desde main-page
- La tarjeta del plan solo se muestra si existe `planSeleccionado`
- Se usa `history.state` como fallback para la navegación
- Los colores de planes rotan: accent, primary, warn
- El plan del medio siempre es destacado como "MÁS POPULAR"

## 🔧 Configuración

### Environment
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
};
```

### Rutas
Asegúrate de tener estas rutas configuradas:
```typescript
{ path: 'principal', component: MainPageComponent },
{ path: 'registrar-empresa', component: TenantRegisterComponent },
```
