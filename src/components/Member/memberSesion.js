import { reactive } from 'vue';

export const sesionMiembro = reactive({ cargando: false, error: '', miembro: null, gimnasio: null });
let solicitud = null;
const apiBase = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
export function tokenMiembro() {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['auth_token', 'token', 'access_token', 'member_token']) {
      const t = store.getItem(key);
      if (t) return t.replace(/^Bearer\s+/i, '');
    }
  }
  return '';
}
export async function solicitudMiembro(path, options = {}) {
  const token = tokenMiembro();
  if (!token) throw new Error('Sesión no disponible. Inicia sesión nuevamente.');
  const res = await fetch(`${apiBase}${path}`, {
    ...options, cache: 'no-store',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Error HTTP ${res.status}`);
  return json;
}
export async function cargarSesionMiembro(forzar = false) {
  if (solicitud) return solicitud;
  if (!forzar && sesionMiembro.miembro && sesionMiembro.gimnasio) return sesionMiembro;
  sesionMiembro.cargando = true;
  sesionMiembro.error = '';
  solicitud = solicitudMiembro('/api/member/dashboard')
    .then(datos => {
      sesionMiembro.miembro = datos.miembro || null;
      sesionMiembro.gimnasio = datos.gimnasio || null;
      return sesionMiembro;
    })
    .catch(e => { sesionMiembro.error = e.message || 'No fue posible consultar los datos'; throw e; })
    .finally(() => { sesionMiembro.cargando = false; solicitud = null; });
  return solicitud;
}
export function limpiarSesionMiembro() {
  sesionMiembro.miembro = null;
  sesionMiembro.gimnasio = null;
  sesionMiembro.error = '';
}
