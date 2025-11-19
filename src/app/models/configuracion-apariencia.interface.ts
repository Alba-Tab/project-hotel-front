// interfaces/configuracion-apariencia.interface.ts
export interface ConfiguracionAparienciaData {
  readonly id?: number;
  hotel: number;
  color_primario: string;
  color_secundario: string;
  color_fondo: string;
  familia_fuente: string;
  tamano_fuente_base: number;
  modo_tema: 'claro' | 'oscuro';
  logo_key?: string | null;
  tema: string;
  tipo_letra: string;
  readonly creado_en?: string;
  readonly actualizado_en?: string;
}

// Tipos para las fuentes disponibles
export type FuenteDisponible = 'Inter' | 'Roboto' | 'Poppins' | 'Montserrat' | 'Raleway' | 'Ubuntu' | 'Nunito' | 'Outfit' | 'Quicksand';

// Constantes
export const FUENTES_DISPONIBLES: readonly FuenteDisponible[] = [
  'Inter',        // Moderna, neutral
  'Roboto',       // Clásica, profesional
  'Poppins',      // Redondeada, moderna
  'Montserrat',   // Geométrica, elegante
  'Raleway',      // Delgada, sofisticada
  'Ubuntu',       // Humanista, amigable
  'Nunito',       // Muy redondeada, suave
  'Outfit',       // Geométrica moderna
  'Quicksand'     // Súper redondeada, casual
] as const;
