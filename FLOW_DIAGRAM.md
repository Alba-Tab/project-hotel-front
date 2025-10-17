# 📊 Diagrama de Flujo - Check-In/Check-Out

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GESTIÓN DE RESERVAS                             │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Reserva  │  │ Reserva  │  │ Reserva  │  │ Reserva  │            │
│  │ Pendiente│  │Confirmada│  │ Check-In │  │Completado│            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│       ↓              ↓              ↓              ↓                 │
│   No aplica     [Check-In]    [Check-Out]      ✓ Done              │
│                     ↓              ↓                                 │
│                     └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘

ESTADOS DE RESERVA:
════════════════════

┌──────────────┐
│  PENDIENTE   │ → Reserva creada, esperando confirmación
└──────────────┘

┌──────────────┐
│ CONFIRMADA   │ → ✅ Puede hacer CHECK-IN
└──────────────┘   [Botón LOGIN visible]
       │
       ↓ [Click Check-In]
       │
┌──────────────────────────────────┐
│  MODAL CHECK-IN                  │
│  ┌────────────────────────────┐  │
│  │ Fecha Check-In: [____]     │  │
│  │ Hora Check-In:  [____]     │  │
│  │ Observaciones:  [____]     │  │
│  │                            │  │
│  │ [Cancelar] [Confirmar ✓]  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
       │
       ↓ [Confirmar]
       │
┌──────────────┐
│  CHECK-IN    │ → ✅ Puede hacer CHECK-OUT
│  (En Hotel)  │   [Botón LOGOUT visible]
└──────────────┘
       │           Muestra:
       │           🔵 Chip Azul "Check-In"
       │           📅 Fecha/Hora de entrada
       │
       ↓ [Click Check-Out]
       │
┌──────────────────────────────────┐
│  MODAL CHECK-OUT                 │
│  ┌────────────────────────────┐  │
│  │ Fecha Check-In: [disabled] │  │ ← Deshabilitado
│  │ Hora Check-In:  [disabled] │  │ ← Deshabilitado
│  │ ─────────────────────────  │  │
│  │ Fecha Check-Out: [____]    │  │ ← Editable
│  │ Hora Check-Out:  [____]    │  │ ← Editable
│  │ Observaciones:   [____]    │  │
│  │                            │  │
│  │ [Cancelar] [Confirmar ✓]  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
       │
       ↓ [Confirmar]
       │
┌──────────────┐
│  COMPLETADO  │ → ✓ Proceso terminado
└──────────────┘
                   Muestra:
                   🟢 Chip Verde "Completado"
                   📅 Fecha/Hora de entrada
                   📅 Fecha/Hora de salida


VISTA DE TABLA:
═══════════════

┌─────────────────────────────────────────────────────────────────────┐
│ ID │ Huésped │ Hotel │ Estado    │ Check-In/Out │ Acciones         │
├─────────────────────────────────────────────────────────────────────┤
│ 1  │ Juan P. │ HTL-A │ Pendiente │   [N/A]      │ ✏️ 🗑️            │
├─────────────────────────────────────────────────────────────────────┤
│ 2  │ María G.│ HTL-B │ Confirmada│ [Pendiente]  │ ✏️ 🗑️ 🔵[LOGIN]  │
│    │         │       │           │   [LOGIN]    │                  │
├─────────────────────────────────────────────────────────────────────┤
│ 3  │ Pedro L.│ HTL-C │ Confirmada│ [Check-In]   │ ✏️ 🗑️ 🟢[LOGOUT] │
│    │         │       │           │ 📅 15/10 14h │                  │
│    │         │       │           │  [LOGOUT]    │                  │
├─────────────────────────────────────────────────────────────────────┤
│ 4  │ Ana M.  │ HTL-D │ Confirmada│ [Completado] │ ✏️ 🗑️            │
│    │         │       │           │ 📅 14/10 14h │                  │
│    │         │       │           │ 📅 15/10 12h │                  │
├─────────────────────────────────────────────────────────────────────┤
│ 5  │ Luis R. │ HTL-E │ Cancelada │   [N/A]      │ ✏️ 🗑️            │
└─────────────────────────────────────────────────────────────────────┘


LÓGICA DE BOTONES:
═════════════════

Estado: PENDIENTE
  → No muestra botones de check-in/out
  → Chip: Gris "N/A"

Estado: CONFIRMADA (sin check-in)
  → ✅ Muestra botón LOGIN (Check-In)
  → ❌ No muestra botón LOGOUT
  → Chip: Gris "Pendiente"

Estado: CONFIRMADA (con check-in, sin check-out)
  → ❌ No muestra botón LOGIN
  → ✅ Muestra botón LOGOUT (Check-Out)
  → Chip: Azul "Check-In"
  → Muestra fecha/hora de entrada

Estado: CONFIRMADA (con check-in y check-out)
  → ❌ No muestra botones
  → Chip: Verde "Completado"
  → Muestra fecha/hora de entrada y salida

Estado: CANCELADA
  → ❌ No muestra botones de check-in/out
  → Chip: Rojo "Cancelada"


MODELO DE DATOS:
════════════════

Reserva {
  id: number
  fecha_reserva: date
  fecha_entrada: date
  fecha_salida: date
  nombre_huesped: string
  nro_habitacion: string
  nombre_hotel: string
  total: number
  estado: string              ← "confirmada" | "cancelada" | "pendiente"
  checkinout?: CheckInOut     ← Relación OneToOne
}

CheckInOut {
  id: number
  reserva: number             ← FK a Reserva
  fecha_checkin: date         ← Required
  hora_checkin: time          ← Required
  fecha_checkout?: date       ← Optional (null si solo check-in)
  hora_checkout?: time        ← Optional (null si solo check-in)
  observaciones?: string      ← Optional
}


API ENDPOINTS:
═════════════

POST   /api/check-in-out/
Body:  {
  "reserva": 123,
  "fecha_checkin": "2024-10-15",
  "hora_checkin": "14:00",
  "observaciones": "Check-in normal"
}

PUT/PATCH   /api/check-in-out/{id}/
Body:  {
  "fecha_checkout": "2024-10-16",
  "hora_checkout": "12:00",
  "observaciones": "Check-out sin problemas"
}

GET    /api/reservas/
Response: [
  {
    "id": 1,
    "estado": "confirmada",
    "checkinout": {
      "id": 1,
      "fecha_checkin": "2024-10-15",
      "hora_checkin": "14:00:00",
      "fecha_checkout": null,
      "hora_checkout": null
    }
  }
]


VALIDACIONES:
════════════

Frontend:
✓ Solo muestra botón check-in si estado === "confirmada" && !checkinout
✓ Solo muestra botón check-out si checkinout && !checkinout.fecha_checkout
✓ No muestra botones si estado === "cancelada"
✓ Formularios con validación required
✓ Pre-carga fecha/hora actual

Backend (requerido):
✓ Validar estado "confirmada" antes de crear check-in
✓ Validar OneToOne: solo un CheckInOut por reserva
✓ Validar fecha_checkout >= fecha_checkin
✓ Validar que existe check-in antes de permitir check-out
✓ Validar hora_checkout > hora_checkin si mismo día
```
