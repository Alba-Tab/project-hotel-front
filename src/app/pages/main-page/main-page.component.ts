import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  color: string;
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  plans: SubscriptionPlan[] = [
    {
      name: 'Básico',
      price: '99',
      period: 'mes',
      features: [
        'Gestión de hasta 10 habitaciones',
        'Panel de control básico',
        'Soporte por email',
        'Reportes mensuales',
      ],
      highlighted: false,
      color: 'accent',
    },
    {
      name: 'Profesional',
      price: '199',
      period: 'mes',
      features: [
        'Habitaciones ilimitadas',
        'Panel de control avanzado',
        'Soporte prioritario 24/7',
        'Reportes en tiempo real',
        'Integración con sistemas externos',
        'Subdominio personalizado',
      ],
      highlighted: true,
      color: 'primary',
    },
    {
      name: 'Empresa',
      price: '299',
      period: 'mes',
      features: [
        'Todo lo de Profesional',
        'Múltiples propiedades',
        'API personalizada',
        'Gestor de cuentas dedicado',
        'Capacitación personalizada',
        'SLA garantizado',
      ],
      highlighted: false,
      color: 'warn',
    },
  ];

  constructor(private router: Router) {}

  goToRegister(): void {
    this.router.navigate(['/registrar-empresa']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
