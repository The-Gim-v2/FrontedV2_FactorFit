/** Declaraciones de TypeScript para el módulo memberSesion.js real. */
export interface MiembroSesionData {
  nombre?: string;
  [campo: string]: unknown;
}

export interface GimnasioSesionData {
  sede?: string;
  [campo: string]: unknown;
}

export interface SesionMiembroState {
  cargando: boolean;
  error: string;
  miembro: MiembroSesionData | null;
  gimnasio: GimnasioSesionData | null;
}

export const sesionMiembro: SesionMiembroState;
export function tokenMiembro(): string;
export function solicitudMiembro<T = Record<string, unknown>>(
  path: string,
  options?: RequestInit
): Promise<T>;
export function cargarSesionMiembro(forzar?: boolean): Promise<SesionMiembroState>;
export function limpiarSesionMiembro(): void;
