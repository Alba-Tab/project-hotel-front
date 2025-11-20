# 🧪 Guía de Prueba - Configuración de Apariencia

## ✅ Checklist de Verificación

### 1. **Verificar que el usuario tenga hotel_id en localStorage**

Abre la consola del navegador y ejecuta:

```javascript
JSON.parse(localStorage.getItem("user"));
```

Deberías ver algo como:

```json
{
  "id": 1,
  "username": "admin",
  "hotel": 1, // 👈 Este campo es importante
  "email": "admin@hotel.com"
}
```

Si no tienes `hotel` o `hotel_id`, cierra sesión y vuelve a iniciar sesión.

---

### 2. **Verificar que existe configuración en Django**

En tu Django admin o base de datos, confirma que existe un registro en la tabla `configuracion_apariencia` para tu hotel.

Si no existe, créalo:

```python
# En Django shell o admin
from apps.configuracion.models import ConfiguracionApariencia
from apps.habitaciones.models import Hotel

hotel = Hotel.objects.get(id=1)
config = ConfiguracionApariencia.objects.create(
    hotel=hotel,
    color_primario='#FF5733',      # Naranja llamativo para probar
    color_secundario='#33FF57',    # Verde llamativo
    color_fondo='#F0F0F0',
    familia_fuente='Inter',
    tamano_fuente_base=14,
    modo_tema='claro'
)
```

---

### 3. **Verificar endpoint del backend**

Abre tu navegador y ve a:

```
http://localhost:8000/api/configuracion-apariencia/1/
```

Deberías recibir un JSON con la configuración.

---

### 4. **Verificar en la consola del navegador**

Recarga la app (Ctrl + F5) y busca estos logs:

✅ **Logs esperados:**

```
🎨 Cargando configuración de apariencia para hotel: 1
✅ Configuración de apariencia aplicada al inicio: {hotel: 1, color_primario: "#FF5733", ...}
🎨 Tema personalizado aplicado: {hotel: 1, primario: "#FF5733", ...}
```

❌ **Si ves errores:**

```
⚠️ No se pudo cargar configuración de apariencia (usando valores por defecto): ...
```

→ Revisa el endpoint del backend

---

### 5. **Inspeccionar el DOM**

1. Abre DevTools (F12)
2. Ve a la pestaña **Elements**
3. Busca en el `<head>` un elemento:

   ```html
   <style id="custom-theme-variables">
     /* 🎨 Configuración de Apariencia Dinámica - Hotel 1 */
     html,
     html .blue_theme,
     html .light-theme,
     html .dark-theme {
       --mat-sys-primary: #ff5733 !important;
       --mat-sys-secondary: #33ff57 !important;
       ...;
     }
   </style>
   ```

4. Si NO ves este `<style>`:
   - El servicio no se está ejecutando
   - Revisa los errores en la consola

---

### 6. **Verificar variables CSS aplicadas**

1. En DevTools → Elements
2. Selecciona el elemento `<html>`
3. En el panel **Styles**, busca:

   ```css
   --mat-sys-primary: #ff5733;
   --mat-sys-secondary: #33ff57;
   ```

4. Si las variables están ahí pero no se ven reflejadas:
   - Puede que algún componente use colores hardcodeados
   - Verifica que los botones/componentes usen `var(--mat-sys-primary)`

---

### 7. **Probar cambios en vivo**

1. Ve a `/configuracion-apariencia`
2. Activa el toggle **"Vista Previa"**
3. Cambia el color primario a algo muy diferente (ej: `#FF0000` rojo)
4. Observa si los botones, links, etc. cambian de color inmediatamente
5. Haz clic en **"Guardar"**
6. Recarga la página
7. Los cambios deben persistir

---

### 8. **Elementos que DEBEN cambiar de color**

Si cambiaste el color primario, estos elementos deben reflejar el cambio:

✅ Botones primarios (`mat-flat-button color="primary"`)
✅ Links/vínculos
✅ Sidebar activo
✅ Iconos con `color="primary"`
✅ Chips, badges con color primario
✅ Progress bars, spinners
✅ Checkboxes, radios, toggles

---

## 🚨 Problemas Comunes

### **Problema: Los colores NO cambian**

**Posibles causas:**

1. **El backend no responde:**

   - Verifica en Network tab que la petición sea 200 OK
   - Revisa la URL del endpoint

2. **No hay configuración en la BD:**

   - Crea un registro en `configuracion_apariencia`

3. **Usuario sin hotel_id:**

   - Verifica `localStorage.getItem('user')`
   - Re-login si es necesario

4. **La clase .blue_theme tiene prioridad:**

   - Ya lo arreglamos con `!important`
   - Pero verifica que el `<style id="custom-theme-variables">` esté en el DOM

5. **Componentes con estilos inline:**
   - Algunos componentes pueden tener `style="color: #00a1ff"` hardcodeado
   - Busca en el código si hay estilos inline

---

### **Problema: Los cambios solo duran hasta recargar**

**Causa:** No se está guardando en el backend

**Solución:**

- Verifica que el endpoint PUT funcione
- Revisa el método `guardarConfiguracion()` en el servicio
- Mira la consola si hay errores al guardar

---

### **Problema: Error "Cannot read property 'hotel' of null"**

**Causa:** No hay usuario en localStorage

**Solución:**

```javascript
// En la consola del navegador
localStorage.setItem(
  "user",
  JSON.stringify({
    id: 1,
    username: "test",
    hotel: 1,
  })
);
```

Luego recarga la página.

---

## 🎨 Ejemplo de Prueba Rápida

Ejecuta esto en la consola del navegador para aplicar colores de prueba:

```javascript
// Simular configuración
const testConfig = {
  hotel: 1,
  color_primario: "#FF0000", // Rojo
  color_secundario: "#00FF00", // Verde
  color_fondo: "#FFFF00", // Amarillo
  familia_fuente: "Arial",
  tamano_fuente_base: 16,
  modo_tema: "claro",
};

// Aplicar manualmente
const style = document.createElement("style");
style.id = "custom-theme-variables";
style.textContent = `
  html, html .blue_theme {
    --mat-sys-primary: #FF0000 !important;
    --mat-sys-secondary: #00FF00 !important;
  }
`;
document.head.appendChild(style);
```

Si después de esto los botones se vuelven rojos, significa que el sistema funciona.

---

## ✅ Lista de Verificación Final

- [ ] Usuario tiene `hotel` en localStorage
- [ ] Existe registro en tabla `configuracion_apariencia`
- [ ] Endpoint GET `/api/configuracion-apariencia/{id}/` responde
- [ ] Endpoint PUT `/api/configuracion-apariencia/hotel/{id}/` funciona
- [ ] Se ve el log "🎨 Tema personalizado aplicado" en consola
- [ ] Existe `<style id="custom-theme-variables">` en el DOM
- [ ] Variables CSS están aplicadas en `<html>`
- [ ] Botones/componentes cambian de color
- [ ] Los cambios persisten después de recargar
- [ ] La vista previa funciona en `/configuracion-apariencia`

Si todos los puntos están marcados, ¡tu sistema funciona perfectamente! 🎉
