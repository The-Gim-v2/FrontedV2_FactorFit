<template>
  <RouterView />
  <HelpButton/>
  <HelpButton2/>
  <HelpButton3/>
  <HelpButton4/>
  <HelpButton5/>
  <transition name="fade">
    <div v-if="mostrarAvisoInactividad" class="inactivity-overlay">
      <div class="ambient ambient-a"></div>
      <div class="ambient ambient-b"></div>

      <div class="inactivity-modal glass-effect" :class="{ urgente }" role="alertdialog" aria-live="assertive">
        <div class="modal-glow"></div>

        <div class="stagger" style="--i:0">
          <div class="warning-icon-wrap">
            <span class="ripple"></span>
            <span class="ripple r2"></span>
            <div class="icon-core">
              <svg viewBox="0 0 24 24" class="warning-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.8L1.9 20.2h20.2L12 2.8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
                <path d="M12 9.5v4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <circle cx="12" cy="17" r="1.1" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>

        <h3 class="stagger" style="--i:1">Inactividad detectada</h3>
        <p class="stagger" style="--i:2">Por tu seguridad, la sesión se cerrará automáticamente por falta de actividad.</p>

        <div class="countdown-ring stagger" style="--i:3">
          <svg viewBox="0 0 120 120" class="ring-svg">
            <defs>
              <linearGradient id="gradAmbar" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#fcd34d"/>
                <stop offset="100%" stop-color="#f59e0b"/>
              </linearGradient>
              <linearGradient id="gradUrgente" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#fb923c"/>
                <stop offset="100%" stop-color="#ef4444"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="45" class="ring-ticks" />
            <circle cx="60" cy="60" r="54" class="ring-track" />
            <circle
              cx="60" cy="60" r="54"
              class="ring-progress"
              :stroke="urgente ? 'url(#gradUrgente)' : 'url(#gradAmbar)'"
              :stroke-dasharray="CIRCUNFERENCIA"
              :stroke-dashoffset="dashOffset"
            />
          </svg>
          <div class="countdown-number">
            <transition name="num" mode="out-in">
              <b :key="segundosRestantes">{{ segundosRestantes }}</b>
            </transition>
            <span>s</span>
          </div>
        </div>

        <p class="sub-text stagger" style="--i:4">Mueve el cursor o presiona cualquier tecla para continuar trabajando.</p>

        <div class="modal-actions stagger" style="--i:5">
          <button class="action-btn-full" @click="reiniciarTemporizador">
            <span class="shine"></span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.6-5.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M20 4v4.5h-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Continuar sesión
          </button>
          <button class="action-btn-secondary" @click="ejecutarCierreSesion">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M15 8l4 4-4 4M19 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cerrar sesión ahora
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, RouterView } from 'vue-router';
import HelpButton from './components/GYM_ACCOUNT/HelpButton.vue';
import HelpButton2 from './components/GYM_RECEPCIONIST/HelpButton.vue';
import HelpButton3 from './components/Member/HelpButton.vue';
import HelpButton4 from './components/GYM_ADMIN/HelpButton.vue';
import HelpButton5 from './components/GYM_MANAGER/HelpButton.vue';
const router = useRouter();
const INACTIVITY_TIME_LIMIT = 10 * 60 * 1000;
const COUNTDOWN_TIME_LIMIT = 60;
const LAST_ACTIVITY_KEY = 'last_activity_timestamp';
const VERSION_KEY = 'gym_app_version';
const HOME_PATH = '/';
const EVENTOS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
const mostrarAvisoInactividad = ref(false);
const segundosRestantes = ref(COUNTDOWN_TIME_LIMIT);
const CIRCUNFERENCIA = 2 * Math.PI * 54;
const dashOffset = computed(() => CIRCUNFERENCIA * (1 - segundosRestantes.value / COUNTDOWN_TIME_LIMIT));
const urgente = computed(() => segundosRestantes.value <= 10);
let inactivityTimer: number | undefined;
let countdownTimer: number | undefined;
let versionTimer: number | undefined;
let lastWrite = 0;
let closing = false;
let checkingVersion = false;
let monitored = false;
let wasAuthenticated = false;
let unregisterRoute: (() => void) | undefined;
const estilosPorRol = import.meta.glob('./assets/styles-*.css', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const RUTAS_CSS_POR_ROL: Record<string, string | undefined> = {
  gym_account: estilosPorRol['./assets/styles-GYM_ACCOUNT.css'], gym_admin: estilosPorRol['./assets/styles-GYM_ADMIN.css'],
  gym_manager: estilosPorRol['./assets/styles-GYM_MANAGER.css'], member: estilosPorRol['./assets/styles-member.css'],
  gym_recepcionist: estilosPorRol['./assets/styles-GYM_RECEPCIONIST.css']
};
const tieneSesion = () => Boolean(sessionStorage.getItem('auth_token') && sessionStorage.getItem('user_role'));
const ultimaActividad = () => Number(sessionStorage.getItem(LAST_ACTIVITY_KEY));
function safeJsonParse(raw: string | null): Record<string, string> { try { const data = raw ? JSON.parse(raw) : {}; return data && typeof data === 'object' ? data : {}; } catch { return {}; } }
function detenerTemporizadores() {
  if (inactivityTimer !== undefined) clearTimeout(inactivityTimer);
  if (countdownTimer !== undefined) clearInterval(countdownTimer);
  inactivityTimer = countdownTimer = undefined;
}
function ejecutarCierreSesion() {
  if (closing) return;
  closing = true;
  detenerTemporizadores();
  mostrarAvisoInactividad.value = false;
  sessionStorage.removeItem('auth_token'); sessionStorage.removeItem('user_role'); sessionStorage.removeItem('gym_account'); sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('user_role'); localStorage.removeItem(LAST_ACTIVITY_KEY);
  window.location.replace(HOME_PATH);
}
function programarRevision() {
  if (inactivityTimer !== undefined) clearTimeout(inactivityTimer);
  const elapsed = Date.now() - ultimaActividad();
  if (elapsed < INACTIVITY_TIME_LIMIT) inactivityTimer = window.setTimeout(revisarInactividad, Math.max(100, INACTIVITY_TIME_LIMIT - elapsed));
}
function revisarInactividad() {
  if (closing || !tieneSesion()) return;
  const last = ultimaActividad();
  if (!Number.isFinite(last) || last <= 0 || last > Date.now() + 60000) { ejecutarCierreSesion(); return; }
  const elapsed = Date.now() - last;
  if (elapsed >= INACTIVITY_TIME_LIMIT + COUNTDOWN_TIME_LIMIT * 1000) { ejecutarCierreSesion(); return; }
  if (elapsed >= INACTIVITY_TIME_LIMIT) {
    mostrarAvisoInactividad.value = true;
    segundosRestantes.value = Math.max(0, Math.ceil((INACTIVITY_TIME_LIMIT + COUNTDOWN_TIME_LIMIT * 1000 - elapsed) / 1000));
    if (countdownTimer === undefined) countdownTimer = window.setInterval(revisarInactividad, 1000);
  } else {
    mostrarAvisoInactividad.value = false;
    if (countdownTimer !== undefined) { clearInterval(countdownTimer); countdownTimer = undefined; }
    programarRevision();
  }
}
function reiniciarTemporizador() {
  if (!tieneSesion() || closing) return;
  const last = ultimaActividad();
  if (last > 0 && Date.now() - last >= INACTIVITY_TIME_LIMIT + COUNTDOWN_TIME_LIMIT * 1000) { ejecutarCierreSesion(); return; }
  lastWrite = Date.now(); sessionStorage.setItem(LAST_ACTIVITY_KEY, String(lastWrite));
  mostrarAvisoInactividad.value = false; revisarInactividad();
}
function registrarActividad() {
  if (!tieneSesion() || closing) return;
  const last = ultimaActividad();
  if (!last || Date.now() - last >= INACTIVITY_TIME_LIMIT + COUNTDOWN_TIME_LIMIT * 1000) { revisarInactividad(); return; }
  if (mostrarAvisoInactividad.value) { reiniciarTemporizador(); return; }
  if (Date.now() - lastWrite < 1000) return;
  reiniciarTemporizador();
}
function sincronizarSesion() {
  if (closing) return;
  const authenticated = tieneSesion();
  if (!authenticated) { wasAuthenticated = false; mostrarAvisoInactividad.value = false; detenerTemporizadores(); return; }
  if (!wasAuthenticated) {
    wasAuthenticated = true;
    // Sesiones nuevas o heredadas sin marca: inicializar sin expulsar al usuario recién autenticado.
    if (!sessionStorage.getItem(LAST_ACTIVITY_KEY)) sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }
  if (!monitored) {
    EVENTOS.forEach(evento => window.addEventListener(evento, registrarActividad, { passive: true }));
    monitored = true;
  }
  revisarInactividad();
}
function manejarCambioStorage(evento: StorageEvent) {
  if (evento.key === 'user_role' || evento.key === 'token' || evento.key === 'auth_token') {
    if (wasAuthenticated && !tieneSesion()) { ejecutarCierreSesion(); return; }
    sincronizarSesion(); actualizarApariencia();
  }
  if (evento.key === LAST_ACTIVITY_KEY && tieneSesion()) revisarInactividad();
}
function cargarEstiloDelRol() {
  const rol = (sessionStorage.getItem('user_role') || '').toLowerCase();
  const ruta = RUTAS_CSS_POR_ROL[rol];
  let link = document.getElementById('role-stylesheet') as HTMLLinkElement | null;
  if (!ruta) { link?.remove(); return; }
  if (!link) { link = document.createElement('link'); link.id = 'role-stylesheet'; link.rel = 'stylesheet'; document.head.appendChild(link); }
  if (link.href !== new URL(ruta, location.href).href) link.href = ruta;
}
// Variables CSS compartidas por gimnasio: cache local + Railway por sucursal.
const coloresDefault: Record<string,string> = { headingBg:'#161726', tablas:'#25283d', interfaz:'#12121c', botones:'#e04a6d', tarjetas:'#1a1b2b', titulos:'#fff7f1', highlight:'#ffb27a', etiquetas:'#f6e8df', textoGeneral:'#c9c5d3', textoBotones:'#ffffff', svgColor:'#ffc7a1' };
const mapaCss: Record<string,string> = { headingBg:'--color-heading-bg',tablas:'--color-tablas',interfaz:'--color-interfaz',botones:'--color-botones',tarjetas:'--bg-cards',titulos:'--color-titulos',highlight:'--color-highlight',etiquetas:'--color-etiquetas',textoGeneral:'--color-texto-general',textoBotones:'--color-texto-botones',svgColor:'--color-svg' };
const rolActivo = () => (sessionStorage.getItem('user_role') || localStorage.getItem('user_role') || '').toLowerCase();
const sedeActiva = () => { for(const storage of [sessionStorage,localStorage]) for(const key of ['selected_sede_id','sede_id','ID_Sede','selectedSedeId']){const value=Number(storage.getItem(key));if(Number.isInteger(value)&&value>0)return value;}return 1; };
const tokenActivo = () => { for(const storage of [sessionStorage,localStorage]) for(const key of ['auth_token','token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']){const value=storage.getItem(key);if(value)return value.replace(/^Bearer\s+/i,'');}return ''; };
const claveTema=(rol:string)=>`app-colors-${rol}`;
let appearanceRequest=0;
let lastAppearanceKey='';
let lastAppearanceCheck=0;
let themeChangedLocally=false;
function aplicarEstilosGlobales() {
  const rol=rolActivo();
  if(!rol)return;
  const savedColors=safeJsonParse(localStorage.getItem(claveTema(rol)));
  const savedRadius=localStorage.getItem(`app-radius-${rol}`) || '16px';
  const savedDensidad=localStorage.getItem(`app-densidad-${rol}`) || 'normal';
  const root=document.documentElement;
  for(const [key,property] of Object.entries(mapaCss)) root.style.setProperty(property, String(savedColors[key] ?? coloresDefault[key] ?? '#12121c'));
  root.style.setProperty('--color-interfaz', String(savedColors.interfaz ?? coloresDefault.interfaz ?? '#12121c'));
  root.style.setProperty('--bg-custom', String(savedColors.interfaz ?? coloresDefault.interfaz ?? '#12121c'));
  root.style.setProperty('--app-border-radius',savedRadius);
  root.style.setProperty('--panel-padding',savedDensidad==='compacto'?'16px':savedDensidad==='espacioso'?'38px':'30px');
  root.style.setProperty('--row-padding',savedDensidad==='compacto'?'10px 0':savedDensidad==='espacioso'?'22px 0':'16px 0');
}
async function cargarAparienciaGimnasio(force=false) {
  const rol=rolActivo();
  if(!['gym_account','gym_admin','gym_manager','gym_recepcionist'].includes(rol)||!tieneSesion())return;
  const token=tokenActivo();if(!token)return;
  const sede=sedeActiva(),key=`${rol}:${sede}:${token.slice(-8)}`;
  if(!force&&key===lastAppearanceKey&&Date.now()-lastAppearanceCheck<60000)return;
  const request=++appearanceRequest;
  lastAppearanceKey=key;lastAppearanceCheck=Date.now();
  try {
    const api=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');
    const res=await fetch(`${api}/api/gym/configuracion-apariencia?sede_id=${sede}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const json=await res.json(),a=json?.apariencia;
    // A newer request or a local edit supersedes this response.
    if(request!==appearanceRequest||themeChangedLocally||sede!==sedeActiva()||rol!==rolActivo())return;
    if(!a||typeof a!=='object'||!a.colors||typeof a.colors!=='object')return;
    const colors={...coloresDefault};
    for(const name of Object.keys(coloresDefault))if(typeof a.colors[name]==='string'&&/^#[0-9a-f]{6}$/i.test(a.colors[name]))colors[name]=a.colors[name];
    localStorage.setItem(claveTema(rol),JSON.stringify(colors));
    if(['normal','compacto','espacioso'].includes(a.densidad))localStorage.setItem(`app-densidad-${rol}`,a.densidad);
    if(['8px','16px','24px'].includes(a.borderRadius))localStorage.setItem(`app-radius-${rol}`,a.borderRadius);
    aplicarEstilosGlobales();
  } catch(e){console.warn('Apariencia remota no disponible; se conserva cache local.',e);}
}
function actualizarApariencia() { cargarEstiloDelRol(); aplicarEstilosGlobales(); void cargarAparienciaGimnasio(); }
function alActualizarTema() { themeChangedLocally=true; ++appearanceRequest; aplicarEstilosGlobales(); window.setTimeout(()=>{themeChangedLocally=false;lastAppearanceCheck=0;},1500); }
async function verificarVersion() {
  if (checkingVersion || document.visibilityState === 'hidden') return;
  checkingVersion = true;
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) return;
    const data: { version?: string } = await response.json();
    if (typeof data.version !== 'string' || !data.version) return;
    const previous = sessionStorage.getItem(VERSION_KEY);
    if (!previous) { sessionStorage.setItem(VERSION_KEY, data.version); return; }
    if (previous !== data.version) {
      sessionStorage.setItem(VERSION_KEY, data.version);
      if (tieneSesion()) revisarInactividad();
      if (!closing) window.location.reload();
    }
  } catch (error) { console.warn('No se pudo verificar la versión:', error); }
  finally { checkingVersion = false; }
}
function verificarAlRegresar() {
  sincronizarSesion();
  if (document.visibilityState === 'visible') { void verificarVersion(); void cargarAparienciaGimnasio(); }
}
onMounted(() => {
  actualizarApariencia();
  window.addEventListener('app-settings-updated', alActualizarTema);
  window.addEventListener('storage', manejarCambioStorage);
  window.addEventListener('focus', verificarAlRegresar);
  window.addEventListener('pageshow', verificarAlRegresar);
  document.addEventListener('visibilitychange', verificarAlRegresar);
  unregisterRoute = router.afterEach(() => { actualizarApariencia(); sincronizarSesion(); });
  sincronizarSesion();
  void verificarVersion();
  versionTimer = window.setInterval(() => { if (tieneSesion()) revisarInactividad(); void verificarVersion(); }, 60000);
});
onUnmounted(() => {
  window.removeEventListener('app-settings-updated', alActualizarTema);
  window.removeEventListener('storage', manejarCambioStorage);
  window.removeEventListener('focus', verificarAlRegresar);
  window.removeEventListener('pageshow', verificarAlRegresar);
  document.removeEventListener('visibilitychange', verificarAlRegresar);
  EVENTOS.forEach(evento => window.removeEventListener(evento, registrarActividad));
  if (versionTimer !== undefined) clearInterval(versionTimer);
  detenerTemporizadores(); unregisterRoute?.();
});
</script>
<style>
@import './assets/global-theme.css';
body { margin: 0; padding: 0; background-color: var(--bg-custom, #0f172a); color: var(--color-texto-general, white); font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.3s ease, color 0.3s ease; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg-custom, #0f172a); }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }

/* ---------- Modal de Inactividad ---------- */
@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

.inactivity-overlay {
  position: fixed; inset: 0; z-index: 99999; padding: 16px; box-sizing: border-box;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  background: radial-gradient(circle at 50% 40%, rgba(20, 20, 30, 0.7), rgba(0, 0, 0, 0.92));
  backdrop-filter: blur(12px) saturate(1.2);
}
.ambient { position: absolute; width: 380px; height: 380px; border-radius: 50%; filter: blur(90px); opacity: 0.28; pointer-events: none; }
.ambient-a { background: #f59e0b; top: -80px; left: -60px; animation: drift 9s ease-in-out infinite alternate; }
.ambient-b { background: #ef4444; bottom: -100px; right: -70px; animation: drift 11s ease-in-out infinite alternate-reverse; }

.inactivity-modal {
  --accent: #f59e0b; --accent-soft: rgba(245, 158, 11, 0.14); --accent-glow: rgba(245, 158, 11, 0.45);
  position: relative; width: 100%; max-width: 380px; box-sizing: border-box; text-align: center; overflow: hidden;
  padding: 34px 28px 28px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--bg-cards, #1a1b2b) 94%, white 6%), var(--bg-cards, #121212) 55%);
  border-radius: var(--app-border-radius, 24px);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.65), 0 0 60px -20px var(--accent-glow);
  animation: modalIn 0.55s cubic-bezier(0.22, 1.2, 0.36, 1) both;
}
.inactivity-modal.urgente { --accent: #ef4444; --accent-soft: rgba(239, 68, 68, 0.14); --accent-glow: rgba(239, 68, 68, 0.5); }

/* Borde con luz giratoria */
.inactivity-modal::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; pointer-events: none;
  background: conic-gradient(from var(--angle), rgba(255,255,255,0.06) 0 55%, var(--accent) 80%, rgba(255,255,255,0.06) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: spinAngle 4s linear infinite;
}
.modal-glow {
  position: absolute; top: -90px; left: 50%; width: 260px; height: 180px; transform: translateX(-50%);
  background: radial-gradient(closest-side, var(--accent-glow), transparent); opacity: 0.55; filter: blur(20px); pointer-events: none;
  animation: breathe 3s ease-in-out infinite;
}

/* Entrada escalonada */
.stagger { position: relative; animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: calc(0.12s + var(--i) * 0.08s); }

/* Icono */
.warning-icon-wrap { position: relative; width: 64px; height: 64px; margin: 0 auto 16px; display: grid; place-items: center; }
.icon-core {
  position: relative; z-index: 1; width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 30% 25%, var(--accent-soft), rgba(255,255,255,0.02));
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
}
.warning-icon { width: 28px; height: 28px; color: var(--accent); transform-origin: 50% 90%; animation: wiggle 2.8s ease-in-out infinite; filter: drop-shadow(0 0 6px var(--accent-glow)); }
.ripple { position: absolute; inset: 4px; border-radius: 50%; border: 1.5px solid var(--accent); opacity: 0; animation: ripple 2.4s ease-out infinite; }
.ripple.r2 { animation-delay: 1.2s; }

.inactivity-modal h3 { font-family: 'Oswald', sans-serif; font-size: 1.45rem; margin: 0 0 8px; color: var(--color-titulos, #fff); letter-spacing: 0.4px; }
.inactivity-modal p { color: var(--color-texto-general, rgba(245,245,244,0.7)); font-size: 0.9rem; line-height: 1.55; margin: 0 0 22px; }

/* Anillo */
.countdown-ring { position: relative; width: 132px; height: 132px; margin: 0 auto 22px; }
.inactivity-modal.urgente .countdown-ring { animation: rise 0.6s both, heartbeat 1s ease-in-out infinite 0.8s; }
.ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.ring-ticks { fill: none; stroke: rgba(255,255,255,0.16); stroke-width: 4; stroke-dasharray: 1.2 3.31; }
.ring-track { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 8; }
.ring-progress { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s linear; filter: drop-shadow(0 0 8px var(--accent-glow)); }
.countdown-number { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Oswald', sans-serif; color: #fff; }
.countdown-number b { font-size: 2.4rem; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; text-shadow: 0 0 18px var(--accent-glow); display: inline-block; }
.countdown-number span { font-size: 1rem; opacity: 0.55; margin-left: 3px; align-self: center; margin-top: 6px; }
.num-enter-active, .num-leave-active { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease; }
.num-enter-from { transform: translateY(-14px) scale(0.85); opacity: 0; }
.num-leave-to { transform: translateY(14px) scale(0.85); opacity: 0; }

.sub-text { font-size: 0.82rem !important; opacity: 0.55; margin-bottom: 24px !important; }

/* Botones */
.modal-actions { display: flex; flex-direction: column; gap: 10px; }
.modal-actions svg { width: 18px; height: 18px; flex-shrink: 0; }
.action-btn-full, .action-btn-secondary {
  display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; position: relative; overflow: hidden;
  border-radius: calc(var(--app-border-radius, 24px) / 2); font-family: inherit;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.action-btn-full {
  background: linear-gradient(135deg, #fbbf24, var(--accent)); color: #1a1a1a; border: none; padding: 14px 20px; font-weight: 700; font-size: 0.95rem;
  box-shadow: 0 8px 24px -8px var(--accent-glow);
}
.action-btn-full .shine {
  position: absolute; top: 0; left: -80%; width: 50%; height: 100%; pointer-events: none;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent); transform: skewX(-20deg);
  animation: shine 3.2s ease-in-out infinite 1s;
}
.action-btn-full:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -8px var(--accent-glow); }
.action-btn-full:active { transform: translateY(0) scale(0.98); }
.action-btn-secondary { background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.12); padding: 12px 20px; font-weight: 500; font-size: 0.85rem; }
.action-btn-secondary:hover { background: rgba(255,255,255,0.07); color: #fff; border-color: rgba(255,255,255,0.28); transform: translateY(-1px); }
.action-btn-secondary:active { transform: scale(0.98); }

/* Transición del overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-leave-active .inactivity-modal { transition: transform 0.3s ease; transform: scale(0.94) translateY(10px); }

/* Keyframes */
@keyframes modalIn { 0% { opacity: 0; transform: translateY(30px) scale(0.9); filter: blur(6px); } 100% { opacity: 1; transform: none; filter: blur(0); } }
@keyframes rise { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: none; } }
@keyframes spinAngle { to { --angle: 360deg; } }
@keyframes ripple { 0% { transform: scale(0.85); opacity: 0.6; } 100% { transform: scale(1.7); opacity: 0; } }
@keyframes wiggle { 0%, 82%, 100% { transform: rotate(0); } 86% { transform: rotate(-9deg); } 90% { transform: rotate(8deg); } 94% { transform: rotate(-5deg); } 97% { transform: rotate(3deg); } }
@keyframes breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
@keyframes heartbeat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.05); } 30% { transform: scale(1); } 45% { transform: scale(1.03); } }
@keyframes shine { 0%, 60% { left: -80%; } 100% { left: 140%; } }
@keyframes drift { to { transform: translate(60px, 40px) scale(1.15); } }

@media (prefers-reduced-motion: reduce) {
  .inactivity-modal, .inactivity-modal *, .ambient { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
</style>