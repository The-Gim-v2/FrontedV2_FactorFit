// Única fuente de claves para la apariencia de Member.
// No reutilizar las claves generales porque mezclarían temas de distintos roles.
export const MEMBER_APARIENCIA = Object.freeze({
  colors: 'app-colors-member',
  radius: 'app-radius-member',
  density: 'app-densidad-member',
  language: 'member-idioma',
  tutorial: 'member-tutorialActivo',
});

export function leerAparienciaMember() {
  let colors = null;
  try {
    const raw = localStorage.getItem(MEMBER_APARIENCIA.colors);
    colors = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Colores de Member inválidos, se usarán valores por defecto', e);
  }
  return {
    colors: colors && typeof colors === 'object' && !Array.isArray(colors) ? colors : null,
    borderRadius: localStorage.getItem(MEMBER_APARIENCIA.radius),
    densidad: localStorage.getItem(MEMBER_APARIENCIA.density),
  };
}

export function aplicarAparienciaMember(preferencias) {
  const colors = preferencias?.colors || {};
  const root = document.documentElement;
  const colores = {
    headingBg: '--color-heading-bg', tablas: '--color-tablas',
    interfaz: '--color-interfaz', botones: '--color-botones',
    tarjetas: '--bg-cards', titulos: '--color-titulos',
    highlight: '--color-highlight', etiquetas: '--color-etiquetas',
    textoGeneral: '--color-texto-general', textoBotones: '--color-texto-botones',
    svgColor: '--color-svg',
  };
  for (const [clave, variable] of Object.entries(colores)) {
    if (typeof colors[clave] === 'string' && /^#[0-9a-f]{6}$/i.test(colors[clave])) {
      root.style.setProperty(variable, colors[clave]);
    }
  }
  if (typeof colors.interfaz === 'string') root.style.setProperty('--bg-custom', colors.interfaz);
  if (['8px','16px','24px'].includes(preferencias?.borderRadius)) {
    root.style.setProperty('--app-border-radius', preferencias.borderRadius);
  }
  const densidad = preferencias?.densidad;
  root.style.setProperty('--panel-padding', densidad === 'compacto' ? '16px' : densidad === 'espacioso' ? '38px' : '30px');
  root.style.setProperty('--row-padding', densidad === 'compacto' ? '10px 0' : densidad === 'espacioso' ? '22px 0' : '16px 0');
}

export function guardarAparienciaLocalMember(preferencias) {
  localStorage.setItem(MEMBER_APARIENCIA.colors, JSON.stringify(preferencias.colors));
  localStorage.setItem(MEMBER_APARIENCIA.radius, preferencias.borderRadius);
  localStorage.setItem(MEMBER_APARIENCIA.density, preferencias.densidad);
  localStorage.setItem(MEMBER_APARIENCIA.language, preferencias.idioma);
  localStorage.setItem(MEMBER_APARIENCIA.tutorial, String(!!preferencias.tutorial));
  aplicarAparienciaMember(preferencias);
  window.dispatchEvent(new CustomEvent('app-settings-updated', { detail: { role: 'member' } }));
}

export function aplicarAparienciaLocalMember() {
  const local = leerAparienciaMember();
  if (local.colors || local.borderRadius || local.densidad) aplicarAparienciaMember(local);
}
