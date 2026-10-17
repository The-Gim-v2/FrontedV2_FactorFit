<template>
  <RouterView />
  <!--<HelpButton v-if="userRole === 'GYM_ACCOUNT'" />
  <HelpButton2 v-if="userRole === 'GYM_RECEPCIONIST'" />
  <HelpButton3 v-if="userRole === 'member'" />-->
  <HelpButton/>
  <HelpButton2/>
  <HelpButton3/>
  <HelpButton4/>
  <HelpButton5/>
  <transition name="fade">
    <div v-if="mostrarAvisoInactividad" class="inactivity-overlay">
      <div class="inactivity-modal glass-effect">
        <div class="warning-icon-wrap">
          <svg viewBox="0 0 24 24" class="warning-icon" fill="none" xmlns="http\://www.w3.org/2000/svg">
            <path d="M12 2L1 21h22L12 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="rgba(245,158,11,0.12)"/>
            <path d="M12 9v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        </div>
        <h3>Inactividad detectada</h3>
        <p>Por tu seguridad, la sesión se cerrará automáticamente por falta de actividad.</p>
        <div class="countdown-ring">
          <svg viewBox="0 0 120 120" class="ring-svg">
            <circle cx="60" cy="60" r="54" class="ring-track" />
            <circle
              cx="60" cy="60" r="54"
              class="ring-progress"
              :stroke-dasharray="2 * Math.PI * 54"
              :stroke-dashoffset="dashOffset"
            />
          </svg>
          <div class="countdown-number">
            {{ segundosRestantes }}<span>s</span>
          </div>
        </div>
        <p class="sub-text">Mueve el cursor o presiona cualquier tecla para continuar trabajando.</p>
        <div class="modal-actions">
          <button class="action-btn-secondary" @click="ejecutarCierreSesion">
            Cerrar sesión ahora
          </button>
          <button class="action-btn-full" @click="reiniciarTemporizador">
            Continuar sesión
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
const tieneSesion = () => Boolean(localStorage.getItem('token') || localStorage.getItem('user_role'));
const ultimaActividad = () => Number(localStorage.getItem(LAST_ACTIVITY_KEY));
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
  lastWrite = Date.now(); localStorage.setItem(LAST_ACTIVITY_KEY, String(lastWrite));
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
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }
  if (!monitored) {
    EVENTOS.forEach(evento => window.addEventListener(evento, registrarActividad, { passive: true }));
    monitored = true;
  }
  revisarInactividad();
}
function manejarCambioStorage(evento: StorageEvent) {
  if (evento.key === 'user_role' || evento.key === 'token') {
    if (wasAuthenticated && !tieneSesion()) { ejecutarCierreSesion(); return; }
    sincronizarSesion(); actualizarApariencia();
  }
  if (evento.key === LAST_ACTIVITY_KEY && tieneSesion()) revisarInactividad();
}
function cargarEstiloDelRol() {
  const rol = (localStorage.getItem('user_role') || '').toLowerCase();
  const ruta = RUTAS_CSS_POR_ROL[rol];
  let link = document.getElementById('role-stylesheet') as HTMLLinkElement | null;
  if (!ruta) { link?.remove(); return; }
  if (!link) { link = document.createElement('link'); link.id = 'role-stylesheet'; link.rel = 'stylesheet'; document.head.appendChild(link); }
  if (link.href !== new URL(ruta, location.href).href) link.href = ruta;
}
function aplicarEstilosGlobales() {
  const rol = (localStorage.getItem('user_role') || '').toLowerCase();
  const savedColors = safeJsonParse(localStorage.getItem(`app-colors-${rol}`));
  const savedRadius = localStorage.getItem(`app-radius-${rol}`);
  const savedDensidad = localStorage.getItem(`app-densidad-${rol}`);
  const root = document.documentElement;
  const aplicar = (prop: string, valor?: string | null) => valor ? root.style.setProperty(prop, valor) : root.style.removeProperty(prop);
  aplicar('--color-heading-bg', savedColors.headingBg); aplicar('--color-tablas', savedColors.tablas);
  aplicar('--color-interfaz', savedColors.interfaz); aplicar('--bg-custom', savedColors.interfaz);
  aplicar('--color-botones', savedColors.botones); aplicar('--bg-cards', savedColors.tarjetas);
  aplicar('--color-titulos', savedColors.titulos); aplicar('--color-highlight', savedColors.highlight);
  aplicar('--color-etiquetas', savedColors.etiquetas); aplicar('--color-texto-general', savedColors.textoGeneral);
  aplicar('--color-texto-botones', savedColors.textoBotones); aplicar('--color-svg', savedColors.svgColor);
  aplicar('--app-border-radius', savedRadius);
  root.style.setProperty('--panel-padding', savedDensidad === 'compacto' ? '16px' : savedDensidad === 'espacioso' ? '38px' : '30px');
  root.style.setProperty('--row-padding', savedDensidad === 'compacto' ? '10px 0' : savedDensidad === 'espacioso' ? '22px 0' : '16px 0');
}
function actualizarApariencia() { cargarEstiloDelRol(); aplicarEstilosGlobales(); }
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
  if (document.visibilityState === 'visible') void verificarVersion();
}
onMounted(() => {
  actualizarApariencia();
  window.addEventListener('app-settings-updated', actualizarApariencia);
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
  window.removeEventListener('app-settings-updated', actualizarApariencia);
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
@import './assets/global-theme.css'; body {   margin: 0; padding: 0; background-color: var(--bg-custom, #0f172a); color: var(--color-texto-general, white); font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.3s ease, color 0.3s ease; }
::-webkit-scrollbar {   width: 8px; }
::-webkit-scrollbar-track {   background: var(--bg-custom, #0f172a); }
::-webkit-scrollbar-thumb {   background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover {   background: #334155; }
/* ---------- Modal de Inactividad (rediseñado) ---------- */
.inactivity-overlay {   position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; }
.inactivity-modal {   background: var(--bg-cards, #121212); border: 1px solid rgba(245, 158, 11, 0.25); padding: 32px 28px; border-radius: var(--app-border-radius, 24px); width: 100%; max-width: 380px; text-align: center; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(245, 158, 11, 0.05); animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-sizing: border-box; }
.warning-icon-wrap {   width: 56px; height: 56px; margin: 0 auto 14px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); display: flex; align-items: center; justify-content: center; animation: pulseRing 2s ease-in-out infinite; }
.warning-icon {   width: 28px; height: 28px; color: #f59e0b; }
.inactivity-modal h3 {   font-family: 'Oswald', sans-serif; font-size: 1.35rem; margin: 0 0 8px 0; color: var(--color-titulos, #ffffff); letter-spacing: 0.3px; }
.inactivity-modal p {   color: var(--color-texto-general, rgba(245, 245, 244, 0.7)); font-size: 0.9rem; line-height: 1.5; margin: 0 0 20px 0; }
.countdown-ring {   position: relative; width: 120px; height: 120px; margin: 0 auto 20px; }
.ring-svg {   width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track {   fill: none; stroke: rgba(255, 255, 255, 0.08); stroke-width: 8; }
.ring-progress {   fill: none; stroke: #f59e0b; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s linear; filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5)); }
.countdown-number {   position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Oswald', sans-serif; font-size: 2.1rem; font-weight: bold; color: #ffffff; }
.countdown-number span {   font-size: 1rem; opacity: 0.6; margin-left: 3px; align-self: center; }
.sub-text {   font-size: 0.82rem !important; opacity: 0.5; margin-bottom: 22px !important; }
.modal-actions {   display: flex; flex-direction: column; gap: 10px; }
.action-btn-full {   background: #f59e0b; color: #1a1a1a; border: none; border-radius: calc(var(--app-border-radius, 24px) / 2); padding: 13px 20px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; }
.action-btn-full:hover {   filter: brightness(1.08); transform: translateY(-1px); }
.action-btn-secondary {   background: transparent; color: rgba(255, 255, 255, 0.55); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: calc(var(--app-border-radius, 24px) / 2); padding: 11px 20px; font-weight: 500; font-size: 0.85rem; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
.action-btn-secondary:hover {   background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.85); }
.fade-enter-active, .fade-leave-active {   transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to {   opacity: 0; }
@keyframes modalPop {   0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; } }
@keyframes pulseRing {   0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.25); }
  50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } }
</style>