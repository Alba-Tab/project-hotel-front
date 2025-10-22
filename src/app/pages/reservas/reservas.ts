import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ReservasFormModal } from './reservas-form-modal/reservas-form-modal';
import { ReservasDeleteModal } from './reservas-delete-modal/reservas-delete-modal';
import { CheckInOutModal } from './check-in-out-modal/check-in-out-modal';

@Component({
  selector: 'app-reservas',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    FormsModule,
  ],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class Reservas implements OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  reservas$ = new BehaviorSubject<any[]>([]);
  reservasFiltradas: any[] = [];
  loading = false;

  // Propiedades para tabs y búsqueda
  tabSeleccionada = 0;
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;
  busquedaUsuario = '';
  usuariosFiltrados: any[] = [];

  columnasTabla: string[] = [
    'id',
    'fecha_reserva',
    'fecha_entrada',
    'fecha_salida',
    'nombre_huesped',
    'nro_habitacion',
    'nombre_hotel',
    'total',
    'estado',
    'check_in_out',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarUsuarios();
  }

  cargarDatos(): void {
    this.loading = true;
    
    // Determinar el endpoint según el tab seleccionado
    let endpoint = '';
    if (this.tabSeleccionada === 0) {
      // Tab de reservas confirmadas
      endpoint = this.usuarioSeleccionado 
        ? `reservas/reservas-confirmadas-por-usuario?id_usuario=${this.usuarioSeleccionado.id}`
        : 'reservas/reservas-confirmadas';
    } else {
      // Tab de reservas realizadas
      endpoint = this.usuarioSeleccionado 
        ? `reservas/reservas-realizadas-por-usuario?id_usuario=${this.usuarioSeleccionado.id}`
        : 'reservas/reservas-realizadas';
    }

    this.apiService.listar<any[]>(endpoint).subscribe({
      next: (reservas) => {
        this.reservas$.next(reservas);
        console.log('Reservas cargadas:', reservas);
        this.reservasFiltradas = reservas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.snackBar.open('Error al cargar las reservas', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  cargarUsuarios(): void {
    this.apiService.listar<any[]>('usuarios').subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      },
    });
  }

  cambiarTab(index: number): void {
    this.tabSeleccionada = index;
    this.usuarioSeleccionado = null;
    this.busquedaUsuario = '';
    this.usuariosFiltrados = this.usuarios;
    this.cargarDatos();
  }

  filtrarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    const termino = this.busquedaUsuario.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.first_name?.toLowerCase().includes(termino) ||
      usuario.last_name?.toLowerCase().includes(termino)
    );
  }

  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.busquedaUsuario = `${usuario.first_name} ${usuario.last_name}`;
    this.usuariosFiltrados = this.usuarios;
    this.cargarDatos();
  }

  limpiarSeleccion(): void {
    this.usuarioSeleccionado = null;
    this.busquedaUsuario = '';
    this.usuariosFiltrados = this.usuarios;
    this.cargarDatos();
  }

  crearReserva(datos: any): void {
    this.loading = true;
    this.apiService.crear('reservas', datos).subscribe({
      next: () => {
        this.snackBar.open('Reserva creada correctamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        const mensaje = error?.error?.detail || 'Error al crear la reserva';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  actualizarReserva(id: number, datos: any): void {
    this.loading = true;
    this.apiService.editar('reservas', id, datos).subscribe({
      next: () => {
        this.snackBar.open('Reserva actualizada correctamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al actualizar reserva:', error);
        const mensaje =
          error?.error?.detail || 'Error al actualizar la reserva';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  eliminarReserva(reserva: any): void {
    this.loading = true;
    this.apiService.eliminar('reservas', reserva.id).subscribe({
      next: () => {
        this.snackBar.open('Reserva eliminada correctamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al eliminar reserva:', error);
        const mensaje = error?.error?.detail || 'Error al eliminar la reserva';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(ReservasFormModal, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { isEdit: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.crearReserva(result);
    });
  }

  abrirModalEditar(reserva: any): void {
    const dialogRef = this.dialog.open(ReservasFormModal, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { isEdit: true, reserva },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.actualizarReserva(reserva.id, result);
    });
  }

  abrirModalEliminar(reserva: any): void {
    const dialogRef = this.dialog.open(ReservasDeleteModal, {
      width: '500px',
      data: reserva,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) this.eliminarReserva(reserva);
    });
  }

  // Métodos para Check-In/Check-Out
  puedeHacerCheckIn(reserva: any): boolean {
    return (
      reserva.estado?.toLowerCase() === 'confirmada' && !reserva.checkin
    );
  }

  puedeHacerCheckOut(reserva: any): boolean {
    return reserva.checkin && reserva.checkin.fecha_checkin &&
           (!reserva.checkout || !reserva.checkout.fecha_checkout);
  }

  tieneCheckIn(reserva: any): boolean {
    return reserva.checkin && reserva.checkin.fecha_checkin;
  }

  tieneCheckOut(reserva: any): boolean {
    return reserva.checkout && reserva.checkout.fecha_checkout;
  }

  abrirModalCheckIn(reserva: any): void {
    const dialogRef = this.dialog.open(CheckInOutModal, {
      width: '700px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        reserva,
        isCheckOut: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.realizarCheckIn(result);
    });
  }

  abrirModalCheckOut(reserva: any): void {
    const dialogRef = this.dialog.open(CheckInOutModal, {
      width: '700px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        reserva,
        isCheckOut: true,
        checkInData: reserva.checkin,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.realizarCheckOut(reserva.id, result);
    });
  }

  realizarCheckIn(datos: any): void {
    console.log('🔄 Realizando Check-In con datos:', datos);
    this.loading = true;
    this.apiService.crear('checkinout/checkin', datos).subscribe({
      next: () => {
        console.log('✅ Check-In realizado correctamente');
        this.snackBar.open('Check-In realizado correctamente', 'Cerrar', {
          duration: 3000,
        });
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al realizar check-in:', error);
        const mensaje = error?.error?.detail || 'Error al realizar el check-in';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  realizarCheckOut(reservaId: number, datos: any): void {
    console.log('🔄 Realizando Check-Out con datos:', datos);
    console.log('🏨 ID de reserva:', reservaId);
    this.loading = true;
    
    // Realizar check-out usando el ID de la reserva
    this.apiService.editar(`checkinout/checkout`, reservaId, datos).subscribe({
      next: () => {
        console.log('✅ Check-Out actualizado');
        this.cargarDatos();
        
        // // Cambiar el estado de la reserva a 'realizada' al completar el check-out
        // const updateData = { estado: 'realizada' };
        // this.apiService.editar('reservas', reservaId, updateData).subscribe({
        //   next: () => {
        //     console.log('✅ Estado de reserva actualizado a realizada');
        //     this.snackBar.open('Check-Out realizado correctamente', 'Cerrar', {
        //       duration: 3000,
        //     });
        //     this.cargarDatos();
        //   },
        //   error: (error) => {
        //     console.error('❌ Error al actualizar estado de reserva:', error);
        //     this.snackBar.open('Check-Out realizado, pero error al actualizar estado', 'Cerrar', {
        //       duration: 3000,
        //     });
        //     this.cargarDatos();
        //   }
        // });
      },
      error: (error) => {
        console.error('❌ Error al realizar check-out:', error);
        const mensaje =
          error?.error?.detail || 'Error al realizar el check-out';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  getEstadoCheckInOut(reserva: any): string {
    if (this.tieneCheckOut(reserva)) {
      return 'Completado';
    } else if (this.tieneCheckIn(reserva)) {
      return 'Check-In';
    } else if (this.puedeHacerCheckIn(reserva)) {
      return 'Pendiente';
    }
    return 'N/A';
  }

  getEstadoColor(reserva: any): string {
    const estado = reserva.estado?.toLowerCase();
    if (estado === 'cancelada') return 'warn';
    if (this.tieneCheckOut(reserva)) return 'accent';
    if (this.tieneCheckIn(reserva)) return 'primary';
    if (estado === 'confirmada') return '';
    return '';
  }

  // Métodos para formatear fechas y horas de check-in/check-out
  getCheckInDateTime(reserva: any): Date | null {
    if (!reserva.checkin || !reserva.checkin.fecha_checkin || !reserva.checkin.hora_checkin) {
      return null;
    }
    
    const fechaStr = reserva.checkin.fecha_checkin;
    const horaStr = reserva.checkin.hora_checkin;
    
    // Combinar fecha y hora en formato ISO
    const dateTimeStr = `${fechaStr}T${horaStr}`;
    return new Date(dateTimeStr);
  }

  getCheckOutDateTime(reserva: any): Date | null {
    if (!reserva.checkout || !reserva.checkout.fecha_checkout || !reserva.checkout.hora_checkout) {
      return null;
    }
    
    const fechaStr = reserva.checkout.fecha_checkout;
    const horaStr = reserva.checkout.hora_checkout;
    
    // Combinar fecha y hora en formato ISO
    const dateTimeStr = `${fechaStr}T${horaStr}`;
    return new Date(dateTimeStr);
  }
}
