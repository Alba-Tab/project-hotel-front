# 🎯 Guía de Uso - Sistema de Planes de Suscripción

## 🚀 Inicio Rápido

### 1. Asegúrate que el Backend esté corriendo

```bash
# Backend debe estar en http://localhost:8000
# Endpoint requerido: GET /api/planes/agrupados/
```

### 2. Navega a la Página Principal

```
http://localhost:4200/principal
```

### 3. Observa el Flujo

1. Los planes se cargan automáticamente
2. Selecciona una variante (Mensual, Trimestral, Anual)
3. Click en "Suscribirse"
4. Completa el formulario de registro
5. Observa el resumen del plan seleccionado
6. Envía el formulario

## 📖 Ejemplos de Uso

### Uso del SubscriptionCardComponent en otro componente

```typescript
import { Component } from "@angular/core";
import { SubscriptionCardComponent } from "./path/to/subscription-card.component";
import { PlanAgrupado, PlanVariante } from "./interfaces/planes.interface";

@Component({
  selector: "app-mi-componente",
  standalone: true,
  imports: [SubscriptionCardComponent],
  template: ` <app-subscription-card [plan]="miPlan" [highlighted]="true" [color]="'primary'" (varianteSeleccionada)="onPlanSeleccionado($event)"></app-subscription-card> `,
})
export class MiComponente {
  miPlan: PlanAgrupado = {
    nombre: "Plan Premium",
    max_usuarios: 50,
    max_hoteles: 10,
    variantes: [
      {
        id: 1,
        precio: "99.99",
        tipo: "M",
        tipo_display: "Mensual",
      },
    ],
  };

  onPlanSeleccionado(data: { plan: PlanAgrupado; variante: PlanVariante }) {
    console.log("Plan seleccionado:", data);
    // Tu lógica aquí
  }
}
```

### Navegación Programática con Plan

```typescript
import { Router } from "@angular/router";
import { inject } from "@angular/core";

export class MiComponente {
  private router = inject(Router);

  irARegistroConPlan() {
    this.router.navigate(["/registrar-empresa"], {
      state: {
        planSeleccionado: {
          planId: 1,
          planNombre: "Plan Básico",
          precio: "29.99",
          tipo: "Mensual",
          maxUsuarios: 5,
          maxHoteles: 1,
        },
      },
    });
  }
}
```

### Recibir Plan en Componente

```typescript
import { Router } from "@angular/router";
import { OnInit, inject } from "@angular/core";
import { PlanSeleccionado } from "./interfaces/planes.interface";

export class MiComponente implements OnInit {
  private router = inject(Router);
  planSeleccionado: PlanSeleccionado | null = null;

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (history.state as any);

    if (state?.planSeleccionado) {
      this.planSeleccionado = state.planSeleccionado;
      console.log("Plan recibido:", this.planSeleccionado);
    }
  }
}
```

## 🔧 Personalización

### Cambiar Colores de Planes

```typescript
// En main-page.component.ts
obtenerColorPlan(index: number): string {
  // Personaliza los colores aquí
  const colores = ['accent', 'primary', 'warn', 'success'];
  return colores[index % colores.length];
}
```

### Cambiar Plan Destacado

```typescript
// En main-page.component.ts
esPlanDestacado(index: number): boolean {
  // Destacar el primer plan
  return index === 0;

  // O el último
  // return index === this.planes.length - 1;

  // O ninguno
  // return false;
}
```

### Agregar Características Personalizadas

```html
<!-- En subscription-card.component.html -->
<div class="d-flex align-items-start m-b-12">
  <mat-icon [color]="color" class="icon-20 m-r-8"> star </mat-icon>
  <span class="mat-body-2">Tu característica personalizada</span>
</div>
```

## 🎨 Personalización de Estilos

### Cambiar Colores del Plan Card

```scss
// En subscription-card.component.scss
.subscription-card {
  &.highlighted-plan {
    border-color: #ff6b6b; // Tu color personalizado
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
  }
}
```

### Cambiar Efectos Hover

```scss
.subscription-card {
  &:hover {
    transform: translateY(-12px); // Más elevación
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  }
}
```

### Personalizar Ribbon

```scss
.ribbon {
  background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
  transform: rotate(45deg);
  padding: 8px 50px;
}
```

## 🐛 Troubleshooting

### Los planes no se cargan

**Problema:** La página muestra estado de carga indefinidamente.

**Solución:**

1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador para errores
3. Verifica la URL del endpoint en `environment.ts`
4. Asegúrate de que el endpoint devuelva el formato correcto

```typescript
// Verificar en consola del navegador
console.log("API URL:", environment.apiUrl);
```

### Error CORS

**Problema:** Error de CORS al hacer la petición.

**Solución:** Configura CORS en tu backend Django:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
```

### El plan no aparece en registro

**Problema:** El plan seleccionado no se muestra en tenant-register.

**Solución:**

1. Verifica que estás navegando con `router.navigate` y `state`
2. No uses `routerLink` directo, usa el método del componente
3. Verifica que `ngOnInit` esté capturando el state correctamente

```typescript
// ❌ NO USAR
<a routerLink="/registrar-empresa">Ir</a>

// ✅ USAR
<button (click)="navegarConPlan()">Ir</button>
```

### Errores de compilación TypeScript

**Problema:** Errores de tipos o interfaces.

**Solución:**

```bash
# Verificar errores
ng build

# O en tiempo real
ng serve
```

## 📱 Testing Manual

### Checklist de Pruebas

- [ ] **Carga de Planes**

  - [ ] Los planes se cargan al entrar a `/principal`
  - [ ] Spinner se muestra durante la carga
  - [ ] Planes se muestran correctamente

- [ ] **Interacción con Tarjetas**

  - [ ] Click en chip cambia el precio mostrado
  - [ ] Todas las variantes son clickeables
  - [ ] Hover en tarjeta muestra efecto
  - [ ] Botón "Suscribirse" funciona

- [ ] **Navegación**

  - [ ] Click en "Suscribirse" navega a registro
  - [ ] Datos del plan se transfieren correctamente
  - [ ] Tarjeta del plan aparece en registro

- [ ] **Formulario de Registro**

  - [ ] Todos los campos validan correctamente
  - [ ] Tarjeta del plan muestra información correcta
  - [ ] Submit envía datos + plan_suscripcion
  - [ ] Mensaje de éxito se muestra
  - [ ] Redirección funciona

- [ ] **Responsividad**

  - [ ] Mobile: 1 columna
  - [ ] Tablet: 2 columnas para planes
  - [ ] Desktop: 3 columnas + sticky plan card

- [ ] **Manejo de Errores**
  - [ ] Error al cargar planes muestra mensaje
  - [ ] Botón "Reintentar" funciona
  - [ ] Error en registro muestra mensaje apropiado

## 🔍 Debugging

### Ver datos del plan en consola

```typescript
// En main-page.component.ts
onVarianteSeleccionada(data: any): void {
  console.log('Plan completo:', data.plan);
  console.log('Variante seleccionada:', data.variante);
  console.log('Datos a enviar:', {
    planId: data.variante.id,
    planNombre: data.plan.nombre,
    precio: data.variante.precio,
    tipo: data.variante.tipo_display,
    maxUsuarios: data.plan.max_usuarios,
    maxHoteles: data.plan.max_hoteles,
  });
  // ... resto del código
}
```

### Ver payload de registro

```typescript
// En tenant-register.component.ts
onSubmit(): void {
  const datos = this.formulario.value;
  console.log('Datos a enviar:', datos);
  console.log('Plan seleccionado:', this.planSeleccionado);
  // ... resto del código
}
```

### Verificar respuesta del backend

```typescript
// En tenant-register.component.ts
this.tenantService.registrarTenant(datos).subscribe({
  next: (response: any) => {
    console.log("Respuesta completa:", response);
    console.log("Message:", response.message);
    // ... resto del código
  },
  error: (error) => {
    console.error("Error completo:", error);
    console.error("Error body:", error.error);
    // ... resto del código
  },
});
```

## 💡 Tips y Mejores Prácticas

### 1. Validación del Backend

Siempre valida que el plan seleccionado existe en el backend antes de crear el tenant.

### 2. Seguridad

No confíes completamente en los datos del frontend. Valida en el backend.

### 3. Feedback al Usuario

Siempre muestra el estado de las operaciones (cargando, éxito, error).

### 4. Persistencia

Si el usuario recarga la página en `/registrar-empresa`, los datos del plan se pierden. Considera usar:

- Query parameters
- LocalStorage (menos seguro)
- Session storage

### 5. Analytics

Considera agregar eventos de analytics:

```typescript
// Ejemplo con Google Analytics
onVarianteSeleccionada(data: any): void {
  // @ts-ignore
  gtag('event', 'plan_selected', {
    plan_name: data.plan.nombre,
    plan_price: data.variante.precio,
    plan_type: data.variante.tipo_display
  });
  // ... resto del código
}
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador
2. Verifica los logs del backend
3. Consulta `PLANES_SUSCRIPCION.md` para documentación completa
4. Revisa `IMPLEMENTACION_COMPLETA.md` para el checklist
