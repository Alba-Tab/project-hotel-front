import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService } from 'src/app/services/pagos_service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.html',
  styleUrls: ['./pagos.scss']
})
export class PagosComponent implements OnInit {
  pagos: any[] = [];
  nuevoPago = {
  estado: 'pendiente',
  fecha_pago: new Date().toISOString().split('T')[0],
  metodo: '',
  monto: 0,
  referencia: '',
  folio_estancia: null
};
  loading = true;
  error = '';

  constructor(private pagosService: PagosService) {}

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    this.pagosService.getPagos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pagos';
        this.loading = false;
        console.error(err);
      },
    });
  }


  crearPago(): void {
  this.pagosService.createPago(this.nuevoPago).subscribe({
    next: () => {
      alert('✅ Pago creado correctamente');
      this.nuevoPago = {
        estado: 'pendiente',
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo: '',
        monto: 0,
        referencia: '',
        folio_estancia: null
      };
      this.loadPagos();
    },
    error: (err) => {
      console.error(err);
      alert('❌ Error al crear el pago');
    }
  });
 }
}
