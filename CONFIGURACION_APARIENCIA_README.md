# 🎨 Configuración de Apariencia - Guía de Implementación

## 📋 Resumen de la Implementación

Sistema completo de personalización de apariencia para hoteles que permite modificar:

- ✅ Colores primario, secundario y de fondo
- ✅ Familia de fuente y tamaño base
- ✅ Modo tema (claro/oscuro)
- ✅ Previsualización en tiempo real
- ✅ Persistencia en base de datos Django

---

## 🔧 Componentes Implementados

### 1. **Modelo Django** (`ConfiguracionApariencia`)

```python
class ConfiguracionApariencia(models.Model):
    hotel = models.OneToOneField(Hotel, on_delete=models.CASCADE)
    color_primario = models.CharField(max_length=7, default='#00a1ff')
    color_secundario = models.CharField(max_length=7, default='#16cdc7')
    color_fondo = models.CharField(max_length=7, default='#f8fafd')
    familia_fuente = models.CharField(max_length=50, default='Inter')
    tamano_fuente_base = models.PositiveIntegerField(default=14)
    modo_tema = models.CharField(max_length=6, choices=[...], default='claro')
```

### 2. **Servicio Angular** (`ConfiguracionAparienciaService`)

**Ubicación:** `src/app/services/configuracion-apariencia.service.ts`

**Características principales:**

- 🔥 Uso de **Signals** para reactividad automática
- 🎨 Aplica estilos CSS dinámicamente mediante `setProperty()`
- 📡 Integración con API Django mediante `ApiService`
- ⚡ Effect que actualiza estilos automáticamente cuando cambia la configuración

**Métodos principales:**

```typescript
cargarConfiguracion(hotelId: number)      // Carga desde backend
guardarConfiguracion(hotelId, datos)      // Guarda en backend
previsualizarCambios(cambios)             // Vista previa temporal
restaurarConfiguracion()                  // Vuelve a configuración guardada
obtenerHotelIdActual()                    // Obtiene hotel del usuario autenticado
```

### 3. **Componente de Configuración**

**Ubicación:** `src/app/pages/configuracion-apariencia/`

**Características:**

- 📝 Formulario reactivo con validaciones
- 👁️ Previsualización en tiempo real (toggle)
- 💾 Botón de guardar con feedback
- 🔄 Botón para restablecer valores por defecto
- 🎨 Selectores de color visual

### 4. **Integración en App Component**

**Ubicación:** `src/app/app.component.ts`

**¿Qué hace?**

- Se ejecuta al iniciar la aplicación
- Carga la configuración del hotel del usuario autenticado
- Aplica los estilos CSS globalmente
- Maneja errores con valores por defecto

```typescript
ngOnInit() {
  const hotelId = this.configuracionService.obtenerHotelIdActual();
  this.configuracionService.cargarConfiguracion(hotelId).subscribe();
}
```

---

## 🚀 Flujo de Funcionamiento

### **Al Iniciar la Aplicación:**

1. `AppComponent.ngOnInit()` se ejecuta
2. Obtiene `hotelId` del usuario en `localStorage`
3. Llama a `configuracionService.cargarConfiguracion(hotelId)`
4. El backend responde con la configuración guardada
5. El **Effect** del servicio detecta el cambio y ejecuta `aplicarEstilosCSS()`
6. Se modifican las variables CSS de `:root`:
   ```css
   --mat-sys-primary: #00a1ff
   --mat-sys-secondary: #16cdc7
   --mat-sys-background: #f8fafd
   --font-family: 'Inter'
   --font-size-base: 14px
   ```
7. Se aplica la clase `dark-theme` o `light-theme` al `<body>`

### **Al Cambiar la Configuración:**

1. Usuario modifica valores en el formulario
2. Si tiene **previsualización activada**:
   - Los cambios se aplican instantáneamente (temporal)
   - NO se guardan en la base de datos
3. Al hacer clic en **"Guardar"**:
   - Se envía petición PUT al backend
   - Django guarda en la BD
   - El servicio actualiza su signal interno
   - El Effect aplica los nuevos estilos
4. Los cambios se reflejan **en toda la aplicación** automáticamente

---

## 📝 Variables CSS Disponibles

Estas variables están disponibles globalmente y se actualizan dinámicamente:

```scss
:root {
  // Colores de Material Design
  --mat-sys-primary: #00a1ff;
  --mat-sys-secondary: #16cdc7;
  --mat-sys-background: #f8fafd;
  --mat-sys-primary-fixed-dim: #00a1ff26; // Con transparencia
  --mdc-theme-primary: #00a1ff;
  --mdc-theme-secondary: #16cdc7;

  // Tipografía
  --font-family: 'Inter';
  --font-size-base: 14px;
}

// Temas
body.light-theme { ... }
body.dark-theme { ... }
```

### **Cómo usar las variables en tus componentes:**

```scss
.mi-componente {
  color: var(--mat-sys-primary);
  background: var(--mat-sys-background);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
}
```

---

## 🔑 Obtención del Hotel ID

El sistema obtiene el `hotelId` del usuario autenticado desde `localStorage`:

```typescript
obtenerHotelIdActual(): number {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.hotel || user.hotel_id || 1;
  }
  return 1; // Valor por defecto
}
```

**Importante:** Asegúrate de que tu backend Django devuelva el campo `hotel` o `hotel_id` en la respuesta del login.

Ejemplo de respuesta del login:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": 5,
    "username": "admin",
    "hotel": 1, // 👈 IMPORTANTE
    "hotel_id": 1, // 👈 O este campo
    "email": "admin@hotel.com"
  }
}
```

---

## 🧪 Pruebas y Debugging

### **Ver en consola si se aplican los estilos:**

Cuando se cargan o cambian estilos, verás logs como:

```
🎨 Cargando configuración de apariencia para hotel: 1
✅ Configuración de apariencia aplicada al inicio: {...}
🎨 Estilos aplicados: {
  primario: '#00a1ff',
  secundario: '#16cdc7',
  fondo: '#f8fafd',
  fuente: 'Inter',
  tamaño: 14,
  tema: 'claro'
}
```

### **Inspeccionar variables CSS en el navegador:**

1. Abre DevTools (F12)
2. Ve a la pestaña **Elements**
3. Selecciona `<html>` o `:root`
4. En el panel **Styles**, busca las variables `--mat-sys-*`
5. Verás los valores actuales aplicados

### **Probar cambios en tiempo real:**

1. Ve a la ruta `/configuracion-apariencia`
2. Activa el toggle **"Vista Previa"**
3. Cambia colores, fuentes, tamaño
4. Los cambios se aplican inmediatamente (temporal)
5. Haz clic en **"Guardar"** para persistir
6. Recarga la página → los cambios persisten

---

## ⚠️ Problemas Comunes y Soluciones

### **Problema 1: Los cambios NO se reflejan en la plantilla**

**Causa:** No se está cargando la configuración al inicio.

**Solución:**

- Verifica que `app.component.ts` tenga `ngOnInit()` implementado
- Revisa la consola para ver si hay errores de red
- Confirma que el endpoint del backend responda correctamente

### **Problema 2: El hotelId siempre es 1**

**Causa:** El objeto `user` en `localStorage` no tiene el campo `hotel` o `hotel_id`.

**Solución:**

- Verifica la respuesta del login en Django
- Asegúrate de serializar el campo `hotel` en el endpoint de login
- Revisa `localStorage.getItem('user')` en la consola del navegador

### **Problema 3: Los colores no cambian en componentes de Material**

**Causa:** Algunos componentes de Material usan nombres específicos de variables CSS.

**Solución:**

- Revisa `src/assets/scss/themecolors/_blue_theme.scss`
- Asegúrate de que las variables `--mat-sys-*` estén referenciadas
- Puede que necesites agregar `!important` en algunos casos

### **Problema 4: La previsualización no funciona**

**Causa:** El toggle de previsualización no está activado o hay error en el Effect.

**Solución:**

- Verifica que `previsualizando()` sea `true`
- Revisa que el formulario tenga `valueChanges` configurado
- Verifica en consola si hay errores en el Effect

---

## 🔄 API Endpoints Requeridos

Tu backend Django debe tener estos endpoints:

### **GET** `/api/configuracion-apariencia/{hotelId}/`

```json
// Respuesta:
{
  "id": 1,
  "hotel": 1,
  "color_primario": "#00a1ff",
  "color_secundario": "#16cdc7",
  "color_fondo": "#f8fafd",
  "familia_fuente": "Inter",
  "tamano_fuente_base": 14,
  "modo_tema": "claro",
  "tema": "Por defecto",
  "tipo_letra": "Inter",
  "creado_en": "2025-01-01T00:00:00Z",
  "actualizado_en": "2025-01-15T10:30:00Z"
}
```

### **PUT** `/api/configuracion-apariencia/hotel/{hotelId}/`

```json
// Request body:
{
  "color_primario": "#FF5733",
  "color_secundario": "#33FF57",
  "modo_tema": "oscuro"
  // ... otros campos
}

// Respuesta: objeto completo actualizado
```

---

## 📦 Archivos Modificados

✅ **Creados:**

- `src/app/services/configuracion-apariencia.service.ts`
- `src/app/models/configuracion-apariencia.interface.ts`
- `src/app/pages/configuracion-apariencia/*`

✅ **Modificados:**

- `src/app/app.component.ts` → Carga inicial de configuración
- `src/styles.scss` → Variables CSS globales y temas

---

## 🎯 Próximos Pasos Sugeridos

1. **Subir logos personalizados:**

   - Agregar campo de imagen en el formulario
   - Guardar URL en `logo_key`
   - Mostrar en el header/navbar

2. **Más opciones de personalización:**

   - Border radius (bordes redondeados)
   - Espaciado/padding
   - Altura del navbar
   - Ancho del sidebar

3. **Presets de temas:**

   - "Tema Elegante", "Tema Moderno", "Tema Minimalista"
   - Un clic para aplicar conjunto de configuraciones

4. **Multiidioma:**
   - Guardar preferencia de idioma por hotel
   - Integrar con i18n de Angular

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de consola del navegador
2. Verifica la respuesta del backend en la pestaña Network
3. Inspecciona las variables CSS en DevTools
4. Confirma que `localStorage` tenga `user` con `hotel_id`

---

**✨ ¡Listo! Tu sistema de configuración de apariencia está completamente funcional.**
