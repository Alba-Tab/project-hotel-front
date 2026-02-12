import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantDomainService {
  private readonly subdomain: string | null;
  private readonly isTenant: boolean;
  private readonly apiUrl: string;

  constructor() {
    const host = window.location.hostname; // ej: jhoelasoc.localhost
    const parts = host.split('.');

    // Detectamos si tiene subdominio (tipo jhoelasoc.localhost)
    this.subdomain =
      parts.length === 2 && host.includes('localhost') ? parts[0] : null;
    this.isTenant = !!this.subdomain;

    this.apiUrl = this.isTenant
      ? `http://${this.subdomain}.localhost:8000/api`
      : `http://localhost:8000/api`;

    this.logInfo();
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
