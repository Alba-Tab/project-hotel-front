import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantDomainService {
  private readonly subdomain: string | null;
  private readonly isTenant: boolean;
  private readonly apiUrl: string;

  constructor() {
    const host = window.location.hostname;
    const parts = host.split('.');

    // Detectar subdominio en diferentes entornos:
    // localhost: hotelsol.localhost -> hotelsol
    // Amplify: hotelsol.tuapp.amplifyapp.com -> hotelsol
    // Custom: hotelsol.tudominio.com -> hotelsol
    this.subdomain = this.extractSubdomain(host, parts);
    this.isTenant = !!this.subdomain;

    // URL base desde environment
    const baseUrl = environment.apiUrl;

    this.apiUrl = this.isTenant
      ? `${baseUrl.replace('://', `://${this.subdomain}.`)}/api`
      : `${baseUrl}/api`;

    this.logInfo();
  }

  private extractSubdomain(host: string, parts: string[]): string | null {
    // Lista de dominios base conocidos (sin subdominio de tenant)
    const baseDomains = [
      'localhost',
      'amplifyapp.com',
      'netlify.app',
      'vercel.app'
      // Agrega aquí tu dominio personalizado si tienes uno
    ];

    // Si es localhost con subdominio: hotelsol.localhost
    if (parts.length === 2 && parts[1] === 'localhost') {
      return parts[0];
    }

    // Si tiene 3+ partes, verificar si es un dominio de hosting conocido
    // Ejemplo: hotelsol.tuapp.amplifyapp.com
    if (parts.length >= 3) {
      const baseDomain = parts.slice(-2).join('.'); // amplifyapp.com
      const appName = parts.slice(-3, -2)[0]; // tuapp
      
      // Si coincide con dominios conocidos y hay un subdominio adicional
      if (baseDomains.some(bd => baseDomain.includes(bd)) && parts.length > 3) {
        return parts[0]; // hotelsol
      }
      
      // Para dominios personalizados de 3 partes: hotelsol.tudominio.com
      if (parts.length === 3) {
        // Verificar que no sea el dominio principal
        const checkHost = `${parts[1]}.${parts[2]}`;
        // Si no es localhost ni un dominio de hosting, asumir que es subdominio
        if (!baseDomains.some(bd => checkHost.includes(bd))) {
          return parts[0];
        }
      }
    }

    return null;
  }

  private logInfo(): void {
    console.log(
      '%c🧠 TenantDomainService',
      'color: orange; font-weight: bold;'
    );
    console.log(`🌐 Hostname: ${window.location.hostname}`);
    console.log(`📦 Subdominio detectado: ${this.subdomain ?? '(ninguno)'}`);
    console.log(`🔧 Modo tenant: ${this.isTenant}`);
    console.log(`🔗 API base URL: ${this.apiUrl}`);
  }

  getSubdomain(): string | null {
    return this.subdomain;
  }

  isTenantMode(): boolean {
    return this.isTenant;
  }

  getTenantApiUrl(): string {
    return this.apiUrl;
  }
}
