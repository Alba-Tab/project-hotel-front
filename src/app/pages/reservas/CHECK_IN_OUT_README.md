# Integración de Check-In/Check-Out en Reservas

## Descripción

Esta funcionalidad permite gestionar el proceso de check-in y check-out de las reservas confirmadas, implementando la lógica del modelo Django `CheckInOut`.

## Características Implementadas

### 1. **Lógica de Negocio**

- ✅ Solo las reservas con estado **"Confirmada"** pueden hacer check-in
- ✅ Solo las reservas con check-in realizado pueden hacer check-out
- ✅ Las reservas **"Canceladas"** no pueden hacer check-in/check-out
- ✅ Relación uno a uno entre Reserva y CheckInOut

### 2. **Componentes Creados**

#### **CheckInOutModal** (`check-in-out-modal/`)

Modal reutilizable para manejar tanto check-in como check-out:

**Campos:**

- Fecha de Check-In (requerido)
- Hora de Check-In (requerido)
- Fecha de Check-Out (requerido solo en check-out)
- Hora de Check-Out (requerido solo en check-out)
- Observaciones (opcional)

**Características:**

- Los campos de check-in se deshabilitan al hacer check-out
- Validación de formularios
- Pre-carga de datos del check-in al hacer check-out
- Muestra información de la reserva

### 3. **Actualizaciones en Reservas**

#### **Componente `reservas.ts`**

Nuevos métodos agregados:

```typescript
// Validación de estados
puedeHacerCheckIn(reserva: any): boolean
puedeHacerCheckOut(reserva: any): boolean
tieneCheckIn(reserva: any): boolean
tieneCheckOut(reserva: any): boolean

// Acciones
abrirModalCheckIn(reserva: any): void
abrirModalCheckOut(reserva: any): void
realizarCheckIn(datos: any): void
realizarCheckOut(checkInOutId: number, datos: any): void

// Utilidades
getEstadoCheckInOut(reserva: any): string
getEstadoColor(reserva: any): string
```

#### **Template `reservas.html`**

Nueva columna agregada: `check_in_out`

**Muestra:**

- Estado actual (Pendiente, Check-In, Completado, N/A)
- Botones de acción según el estado
- Fechas de check-in/check-out cuando están disponibles
- Chips de colores para visualización rápida

### 4. **Interfaz TypeScript**

Archivo: `interfaces/reserva.interface.ts`

```typescript
interface CheckInOut {
  id?: number;
  reserva: number;
  fecha_checkin: string;
  hora_checkin: string;
  fecha_checkout?: string | null;
  hora_checkout?: string | null;
  observaciones?: string;
}
```

## Flujo de Uso

### 1. Check-In

1. La reserva debe estar en estado **"Confirmada"**
2. El usuario hace clic en el botón de Check-In (icono de login)
3. Se abre el modal con los campos de fecha y hora pre-cargados
4. Al confirmar, se crea el registro de CheckInOut en el backend
5. El estado visual cambia a "Check-In" con chip azul

### 2. Check-Out

1. La reserva debe tener un check-in previo
2. El usuario hace clic en el botón de Check-Out (icono de logout)
3. Se abre el modal con los datos del check-in (deshabilitados) y campos para check-out
4. Al confirmar, se actualiza el registro de CheckInOut con las fechas de salida
5. El estado visual cambia a "Completado" con chip verde

## Estados Visuales

| Estado     | Color          | Descripción                             |
| ---------- | -------------- | --------------------------------------- |
| Pendiente  | Gris           | Reserva confirmada sin check-in         |
| Check-In   | Azul (primary) | Check-in realizado, pendiente check-out |
| Completado | Verde (accent) | Check-in y check-out completados        |
| N/A        | -              | Reserva cancelada o no confirmada       |

## Endpoints de Backend Requeridos

Asegúrate de que el backend tenga estos endpoints configurados:

```python
# urls.py
path('check-in-out/', CheckInOutViewSet.as_view({'get': 'list', 'post': 'create'}))
path('check-in-out/<int:pk>/', CheckInOutViewSet.as_view({'put': 'update', 'patch': 'partial_update'}))

# ViewSet debe incluir checkinout en el serializer de reservas
class ReservaSerializer(serializers.ModelSerializer):
    checkinout = CheckInOutSerializer(required=False, read_only=True)
    # ...
```

## Validaciones del Backend

El backend debe validar:

- Una reserva solo puede tener un CheckInOut (OneToOneField)
- Solo reservas confirmadas pueden crear CheckInOut
- La fecha de check-out debe ser posterior al check-in
- No se puede modificar un check-in una vez creado (excepto para agregar check-out)

## Consideraciones

1. **Permisos**: Asegúrate de que los usuarios tengan permisos para crear/editar check-in-out
2. **Zona Horaria**: Las horas se manejan en el formato HH:MM (24 horas)
3. **Fechas**: Se formatean como YYYY-MM-DD para el backend
4. **Relación**: La relación es OneToOne, por lo que no puede haber múltiples check-in/out por reserva

## Mejoras Futuras

- [ ] Agregar validación de fechas (check-out no antes de check-in)
- [ ] Mostrar historial de cambios
- [ ] Agregar notificaciones por email al hacer check-in/out
- [ ] Dashboard con estadísticas de check-in/out
- [ ] Filtros por estado de check-in/out
- [ ] Exportar reportes de ocupación

## Archivos Modificados/Creados

```
src/app/
├── pages/reservas/
│   ├── check-in-out-modal/
│   │   ├── check-in-out-modal.ts (nuevo)
│   │   ├── check-in-out-modal.html (nuevo)
│   │   └── check-in-out-modal.scss (nuevo)
│   ├── reservas.ts (modificado)
│   ├── reservas.html (modificado)
│   └── reservas.scss (modificado)
└── interfaces/
    └── reserva.interface.ts (nuevo)
```
