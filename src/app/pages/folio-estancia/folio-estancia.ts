import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { FolioEstanciaFormModal } from './folio-estancia-form-modal/folio-estancia-form-modal';
import { FolioVerModal } from './folio-ver-modal/folio-ver-modal';

@Component({
  selector: 'app-folio-estancia',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    FormsModule,
  ],
  templateUrl: './folio-estancia.html',
  styleUrls: ['./folio-estancia.scss'],
})
export class FolioEstanciaComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'estado',
    'total_pagado',
    'huesped_nombre',
    'reserva_id',
    'acciones',
  ];
  dataSource: any[] = [];
  cargando = false;

  // Control de pestañas
  tabSeleccionada = 0; // 0 = Pendientes, 1 = Pagados

  // Para la búsqueda de usuarios
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busquedaUsuario = '';
  usuarioSeleccionado: any = null;
  cargandoUsuarios = false;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarFolios();
    this.obtenerUsuarios();
  }

  cargarFolios(): void {
    this.cargando = true;
    let endpoint: string;
    
    // Determinar endpoint según la pestaña seleccionada y si hay usuario
    if (this.tabSeleccionada === 0) { // Folios Pendientes
      endpoint = this.usuarioSeleccionado 
        ? 'folioestancias/pendientes-por-usuario'
        : 'folioestancias/folios-pendientes';
    } else { // Folios Pagados (Historial)
      endpoint = this.usuarioSeleccionado 
        ? 'folioestancias/pagados-por-usuario'
        : 'folioestancias/folios-pagados';
    }
    
    const params = this.usuarioSeleccionado 
      ? { id_usuario: this.usuarioSeleccionado.id }
      : undefined;

    this.apiService.listar<any[]>(endpoint, params).subscribe({
      next: (folios) => {
        this.dataSource = folios || [];
        this.cargando = false;
        console.log(`Folios ${this.tabSeleccionada === 0 ? 'pendientes' : 'pagados'} cargados:`, this.dataSource);
      },
      error: (error) => {
        console.error('Error al cargar folios de estancia:', error);
        this.mostrarMensaje('Error al cargar folios de estancia');
        this.cargando = false;
      },
    });
  }

  /** Cargar usuarios desde la API */
  obtenerUsuarios(): void {
    this.cargandoUsuarios = true;
    this.apiService.listar<any[]>('usuarios').subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios || [];
        this.usuariosFiltrados = []; // Inicializar vacío
        this.cargandoUsuarios = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargandoUsuarios = false;
      },
    });
  }

  /** Filtrar usuarios por nombre */
  filtrarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) {
      this.usuariosFiltrados = [];
      return;
    }

    const termino = this.busquedaUsuario.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(usuario => 
      usuario.first_name?.toLowerCase().includes(termino) ||
      usuario.last_name?.toLowerCase().includes(termino) ||
      `${usuario.first_name} ${usuario.last_name}`.toLowerCase().includes(termino)
    );
  }

  /** Seleccionar usuario y cargar sus folios */
  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.busquedaUsuario = `${usuario.first_name} ${usuario.last_name}`;
    this.usuariosFiltrados = [];
    this.cargarFolios(); // Recargar folios con el usuario seleccionado
  }

  /** Limpiar búsqueda y mostrar todos los folios */
  limpiarBusqueda(): void {
    this.usuarioSeleccionado = null;
    this.busquedaUsuario = '';
    this.usuariosFiltrados = [];
    this.cargarFolios(); // Recargar todos los folios
  }

  /** Cambiar de pestaña */
  cambiarTab(index: number): void {
    this.tabSeleccionada = index;
    // Limpiar la selección de usuario al cambiar de tab
    this.usuarioSeleccionado = null;
    this.busquedaUsuario = '';
    this.usuariosFiltrados = [];
    this.cargarFolios(); // Recargar folios según la nueva pestaña
  }

  abrirModalVer(folio: any): void {
   const dialogRef = this.dialog.open(FolioVerModal, {
    width: '900px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    data: { folioId: folio.id }
  });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
