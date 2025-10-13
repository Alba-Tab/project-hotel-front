# 🎯 EJEMPLOS PRÁCTICOS PARA TU PROYECTO

## 📋 TABLA DE CONTENIDO

1. [Cómo usar el ApiService](#1-cómo-usar-el-apiservice)
2. [Crear un nuevo feature module](#2-crear-un-nuevo-feature-module)
3. [Implementar autenticación](#3-implementar-autenticación)
4. [Agregar validaciones personalizadas](#4-agregar-validaciones-personalizadas)
5. [Crear un dialog de confirmación](#5-crear-un-dialog-de-confirmación)
6. [Implementar paginación](#6-implementar-paginación)
7. [Manejo de errores global](#7-manejo-de-errores-global)
8. [Subir archivos](#8-subir-archivos)

---

## 1. Cómo usar el ApiService

Tu `ApiService` ya está creado. Así lo usas:

### Paso 1: Crear interfaz del modelo

```typescript
// src/app/models/reserva.interface.ts
export interface Reserva {
  id: number;
  hotel_id: number;
  usuario_id: number;
  fecha_entrada: Date;
  fecha_salida: Date;
  huespedes: number;
  precio_total: number;
  estado: "pendiente" | "confirmada" | "cancelada";
}
```

### Paso 2: Crear servicio específico

```typescript
// src/app/services/reservas.service.ts
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Reserva } from "../models/reserva.interface";

@Injectable({ providedIn: "root" })
export class ReservasService {
  private api = inject(ApiService);
  private endpoint = "reservas";

  obtenerMisReservas(): Observable<Reserva[]> {
    return this.api.listar<Reserva[]>(this.endpoint);
  }

  crearReserva(reserva: Omit<Reserva, "id">): Observable<Reserva> {
    return this.api.crear<Reserva>(this.endpoint, reserva);
  }

  cancelarReserva(id: number): Observable<Reserva> {
    return this.api.actualizar<Reserva>(this.endpoint, id, {
      estado: "cancelada",
    });
  }
}
```

### Paso 3: Usar en componente

```typescript
// src/app/pages/reservas/reservas-lista.component.ts
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReservasService } from "@app/services/reservas.service";
import { Reserva } from "@app/models/reserva.interface";

@Component({
  selector: "app-reservas-lista",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reservas-container">
      <h1>Mis Reservas</h1>

      @if (cargando) {
      <p>Cargando...</p>
      } @if (reservas.length > 0) { @for (reserva of reservas; track reserva.id) {
      <div class="reserva-card">
        <p>Hotel: {{ reserva.hotel_id }}</p>
        <p>Entrada: {{ reserva.fecha_entrada | date }}</p>
        <p>Salida: {{ reserva.fecha_salida | date }}</p>
        <p>Total: {{ reserva.precio_total | currency }}</p>

        @if (reserva.estado === 'pendiente') {
        <button (click)="cancelar(reserva.id)">Cancelar</button>
        }
      </div>
      } }
    </div>
  `,
})
export class ReservasListaComponent implements OnInit {
  private reservasService = inject(ReservasService);

  reservas: Reserva[] = [];
  cargando = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.reservasService.obtenerMisReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      },
    });
  }

  cancelar(id: number): void {
    if (confirm("¿Seguro que quieres cancelar?")) {
      this.reservasService.cancelarReserva(id).subscribe({
        next: () => {
          alert("Reserva cancelada");
          this.cargar();
        },
      });
    }
  }
}
```

---

## 2. Crear un nuevo feature module

### Estructura recomendada

```bash
# Crear carpeta de feature
mkdir -p src/app/features/reservas/components
mkdir -p src/app/features/reservas/services
mkdir -p src/app/features/reservas/models
```

### Archivos a crear

```typescript
// 1. features/reservas/models/reserva.interface.ts
export interface Reserva {
  id: number;
  hotel_id: number;
  // ... resto de campos
}

// 2. features/reservas/services/reservas.service.ts
@Injectable({ providedIn: 'root' })
export class ReservasService {
  // Lógica del servicio
}

// 3. features/reservas/components/reservas-lista/reservas-lista.component.ts
@Component({
  selector: 'app-reservas-lista',
  standalone: true,
  // ...
})
export class ReservasListaComponent { }

// 4. features/reservas/reservas.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';

export const ReservasRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ReservasListaComponent,
        canActivate: [authGuard]
      },
      {
        path: 'nueva',
        component: ReservasFormComponent,
        canActivate: [authGuard]
      },
      {
        path: ':id',
        component: ReservasDetalleComponent,
        canActivate: [authGuard]
      }
    ]
  }
];

// 5. Agregar a app.routes.ts
{
  path: 'reservas',
  loadChildren: () => import('./features/reservas/reservas.routes')
    .then(m => m.ReservasRoutes)
}
```

---

## 3. Implementar Autenticación

### Paso 1: Crear AuthService

```typescript
// src/app/services/auth.service.ts
import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { ApiService } from "./api.service";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // Signal para el usuario actual
  currentUser = signal<AuthResponse["user"] | null>(null);
  isAuthenticated = signal(false);

  constructor() {
    // Verificar si hay token guardado
    this.checkAuthStatus();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.api.crear<AuthResponse>("auth/login", credentials).pipe(
      tap((response) => {
        // Guardar token
        localStorage.setItem("auth_token", response.token);

        // Guardar usuario
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);

        // Redirigir a dashboard
        this.router.navigate(["/dashboard"]);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.api.crear<AuthResponse>("auth/register", data).pipe(
      tap((response) => {
        localStorage.setItem("auth_token", response.token);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
        this.router.navigate(["/dashboard"]);
      })
    );
  }

  logout(): void {
    localStorage.removeItem("auth_token");
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(["/authentication/login"]);
  }

  checkAuthStatus(): void {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Verificar token con el servidor (opcional)
      this.api.obtener<AuthResponse["user"]>("auth/me", "").subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        },
        error: () => {
          this.logout();
        },
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.rol === role;
  }
}
```

### Paso 2: Componente de Login

```typescript
// src/app/pages/authentication/login/login.component.ts
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <h1>Iniciar Sesión</h1>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label>Email</label>
          <input type="email" formControlName="email" [class.error]="email?.invalid && email?.touched" />
          @if (email?.errors?.['required'] && email?.touched) {
          <span class="error-msg">Email es obligatorio</span>
          } @if (email?.errors?.['email']) {
          <span class="error-msg">Email inválido</span>
          }
        </div>

        <div class="form-field">
          <label>Contraseña</label>
          <input type="password" formControlName="password" [class.error]="password?.invalid && password?.touched" />
          @if (password?.errors?.['required'] && password?.touched) {
          <span class="error-msg">Contraseña es obligatoria</span>
          }
        </div>

        @if (error) {
        <div class="alert alert-error">
          {{ error }}
        </div>
        }

        <button type="submit" [disabled]="loginForm.invalid || loading">
          {{ loading ? "Iniciando sesión..." : "Iniciar Sesión" }}
        </button>

        <p class="register-link">
          ¿No tienes cuenta?
          <a routerLink="/authentication/register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
      }

      .form-field {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      input.error {
        border-color: #e53e3e;
      }

      .error-msg {
        color: #e53e3e;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      }

      .alert {
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .alert-error {
        background-color: #fff5f5;
        border: 1px solid #fc8181;
        color: #c53030;
      }

      button {
        width: 100%;
        padding: 0.75rem;
        background-color: #4299e1;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      button:hover:not(:disabled) {
        background-color: #3182ce;
      }

      button:disabled {
        background-color: #cbd5e0;
        cursor: not-allowed;
      }

      .register-link {
        text-align: center;
        margin-top: 1rem;
        color: #718096;
      }

      .register-link a {
        color: #4299e1;
        text-decoration: none;
        font-weight: 500;
      }

      .register-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  get email() {
    return this.loginForm.get("email");
  }

  get password() {
    return this.loginForm.get("password");
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      this.authService.login(this.loginForm.value as any).subscribe({
        next: () => {
          // Redirección manejada por el servicio
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || "Error al iniciar sesión";
        },
      });
    }
  }
}
```

### Paso 3: Actualizar Guard

```typescript
// src/app/guards/auth.guard.ts
import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(["/authentication/login"], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
};
```

---

## 4. Agregar Validaciones Personalizadas

```typescript
// src/app/validators/custom.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomValidators {
  /**
   * Validar que dos campos sean iguales (ej: password y confirmPassword)
   */
  static match(controlName: string, matchControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchControl = formGroup.get(matchControlName);

      if (!control || !matchControl) {
        return null;
      }

      if (matchControl.errors && !matchControl.errors["match"]) {
        return null;
      }

      if (control.value !== matchControl.value) {
        matchControl.setErrors({ match: true });
        return { match: true };
      } else {
        matchControl.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Validar que la fecha sea futura
   */
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return inputDate < today ? { pastDate: true } : null;
    };
  }

  /**
   * Validar teléfono (formato simple)
   */
  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(control.value) ? null : { invalidPhone: true };
    };
  }

  /**
   * Validar DNI/CI
   */
  static dni(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const dniRegex = /^[0-9]{7,8}$/;
      return dniRegex.test(control.value) ? null : { invalidDni: true };
    };
  }
}

// USO:
form = this.fb.group(
  {
    password: ["", Validators.required],
    confirmPassword: ["", Validators.required],
    telefono: ["", CustomValidators.phone()],
    fecha_nacimiento: ["", CustomValidators.futureDate()],
  },
  {
    validators: CustomValidators.match("password", "confirmPassword"),
  }
);
```

---

## 5. Crear un Dialog de Confirmación

```typescript
// src/app/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || "Cancelar" }}
      </button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        {{ data.confirmText || "Confirmar" }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

// SERVICIO HELPER
import { Injectable, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class DialogService {
  private dialog = inject(MatDialog);

  confirm(title: string, message: string, confirmText?: string, cancelText?: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: { title, message, confirmText, cancelText },
    });

    return dialogRef.afterClosed();
  }
}

// USO EN COMPONENTE
export class MiComponente {
  private dialogService = inject(DialogService);

  eliminar(id: number): void {
    this.dialogService.confirm("Confirmar eliminación", "¿Estás seguro de que quieres eliminar este hotel?", "Eliminar", "Cancelar").subscribe((confirmed) => {
      if (confirmed) {
        // Proceder con eliminación
      }
    });
  }
}
```

---

## 6. Implementar Paginación

```typescript
// src/app/components/hoteles-paginados/hoteles-paginados.component.ts
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { HotelesService, Hotel } from "@app/services/hoteles.service";

@Component({
  selector: "app-hoteles-paginados",
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  template: `
    <div class="container">
      @if (hoteles.length > 0) {
      <div class="hoteles-grid">
        @for (hotel of hoteles; track hotel.id) {
        <div class="hotel-card">
          <h3>{{ hotel.nombre }}</h3>
          <p>{{ hotel.ciudad }}</p>
        </div>
        }
      </div>

      <mat-paginator [length]="totalItems" [pageSize]="pageSize" [pageIndex]="pageIndex" [pageSizeOptions]="[5, 10, 25, 50]" (page)="onPageChange($event)" showFirstLastButtons></mat-paginator>
      }
    </div>
  `,
})
export class HotelesPaginadosComponent implements OnInit {
  private hotelesService = inject(HotelesService);

  hoteles: Hotel[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.hotelesService.obtenerPaginados(this.pageIndex + 1, this.pageSize).subscribe((response) => {
      this.hoteles = response.data;
      this.totalItems = response.total;
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargar();
  }
}
```

---

## 7. Manejo de Errores Global

```typescript
// src/app/services/error-handler.service.ts
import { Injectable, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class ErrorHandlerService {
  private snackBar = inject(MatSnackBar);

  handleError(error: HttpErrorResponse): void {
    let mensaje = "Ocurrió un error inesperado";

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      mensaje = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          mensaje = "Solicitud inválida";
          break;
        case 401:
          mensaje = "No autorizado";
          break;
        case 403:
          mensaje = "Acceso denegado";
          break;
        case 404:
          mensaje = "Recurso no encontrado";
          break;
        case 500:
          mensaje = "Error del servidor";
          break;
        default:
          mensaje = error.error?.message || mensaje;
      }
    }

    this.mostrarError(mensaje);
    console.error("Error completo:", error);
  }

  mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, "Cerrar", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "top",
      panelClass: ["error-snackbar"],
    });
  }

  mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, "Cerrar", {
      duration: 3000,
      horizontalPosition: "end",
      verticalPosition: "top",
      panelClass: ["success-snackbar"],
    });
  }
}

// USO:
export class MiComponente {
  private errorHandler = inject(ErrorHandlerService);

  guardar(): void {
    this.servicio.crear(datos).subscribe({
      next: () => {
        this.errorHandler.mostrarExito("Guardado exitosamente");
      },
      error: (err) => {
        this.errorHandler.handleError(err);
      },
    });
  }
}
```

---

## 8. Subir Archivos

```typescript
// src/app/components/upload-image/upload-image.component.ts
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "@app/services/api.service";

@Component({
  selector: "app-upload-image",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <input type="file" (change)="onFileSelected($event)" accept="image/*" #fileInput />

      <button (click)="fileInput.click()">Seleccionar imagen</button>

      @if (previsualizacion) {
      <div class="preview">
        <img [src]="previsualizacion" alt="Preview" />
        <button (click)="subirImagen()">Subir</button>
      </div>
      } @if (subiendo) {
      <p>Subiendo imagen...</p>
      }
    </div>
  `,
})
export class UploadImageComponent {
  private api = inject(ApiService);

  archivoSeleccionado: File | null = null;
  previsualizacion: string | null = null;
  subiendo = false;

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.archivoSeleccionado = file;

      // Crear previsualizacion
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacion = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  subirImagen(): void {
    if (!this.archivoSeleccionado) return;

    this.subiendo = true;

    this.api
      .subirArchivo("hoteles/imagen", this.archivoSeleccionado, {
        hotel_id: 123,
      })
      .subscribe({
        next: (response) => {
          console.log("Imagen subida:", response);
          this.subiendo = false;
          this.resetear();
        },
        error: (err) => {
          console.error(err);
          this.subiendo = false;
        },
      });
  }

  resetear(): void {
    this.archivoSeleccionado = null;
    this.previsualizacion = null;
  }
}
```

---

## 📌 PRÓXIMOS PASOS

Ahora que tienes estos ejemplos:

1. **Implementa el módulo de autenticación completo**
2. **Crea el CRUD de hoteles**
3. **Agrega el módulo de reservas**
4. **Implementa manejo de errores global**
5. **Agrega tests unitarios**

¡Todos estos ejemplos están listos para copiar y adaptar a tu proyecto!
