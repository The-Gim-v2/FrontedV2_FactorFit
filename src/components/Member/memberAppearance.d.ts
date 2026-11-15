export interface PreferenciasAparienciaMember {
  colors?: Record<string, string> | null;
  borderRadius?: string | null;
  densidad?: string | null;
  idioma?: string;
  tutorial?: boolean;
}
export const MEMBER_APARIENCIA: Readonly<Record<string, string>>;
export function leerAparienciaMember(): PreferenciasAparienciaMember;
export function aplicarAparienciaMember(preferencias?: PreferenciasAparienciaMember): void;
export function guardarAparienciaLocalMember(preferencias: Required<PreferenciasAparienciaMember>): void;
export function aplicarAparienciaLocalMember(): void;
