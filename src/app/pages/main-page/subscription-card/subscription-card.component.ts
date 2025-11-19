import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {
  PlanAgrupado,
  PlanVariante,
} from '../../../interfaces/planes.interface';

export { PlanAgrupado, PlanVariante };

@Component({
  selector: 'app-subscription-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss'],
})
export class SubscriptionCardComponent {
  @Input() plan!: PlanAgrupado;
  @Input() highlighted: boolean = false;
  @Input() color: string = 'primary';
  @Output() varianteSeleccionada = new EventEmitter<{
    plan: PlanAgrupado;
    variante: PlanVariante;
  }>();

  varianteActiva: PlanVariante | null = null;

  ngOnInit(): void {
    // Seleccionar la primera variante por defecto (generalmente Mensual)
    if (this.plan?.variantes?.length > 0) {
      this.varianteActiva = this.plan.variantes[0];
    }
  }

  seleccionarVariante(variante: PlanVariante): void {
    this.varianteActiva = variante;
  }

  suscribirse(): void {
    if (this.varianteActiva) {
      this.varianteSeleccionada.emit({
        plan: this.plan,
        variante: this.varianteActiva,
      });
    }
  }

  obtenerColorChip(variante: PlanVariante): string {
    return this.varianteActiva?.id === variante.id ? this.color : '';
  }
}
