<template>
  <HeadingAdmin :isGymOpen="isGymOpen" :billingStatus="billingStatus">
    <div class="dashboard">
      <main class="dashboard-container">

        <!-- 1. ENCABEZADO -->
        <section class="hero" :class="{ 'has-cover': !!gym.coverUrl }" :style="heroStyle">
          <div class="hero-main">
            <!-- Logo: fuera del panel, al lado, con la misma altura que el panel -->
            <div v-if="gym.logoUrl" class="hero-logo">
              <img :src="gym.logoUrl" :alt="gym.name" @error="gym.logoUrl = null" />
            </div>

            <!-- Panel de texto -->
            <div class="hero-copy">
              <h1>
                <template v-for="(w, i) in nameWords" :key="i">
                  <span v-if="i === highlightIndex">{{ w }}</span>
                  <template v-else>{{ w }}</template>{{ ' ' }}
                </template>
              </h1>
              <p>{{ ui.GYM_MANAGERPanel }}</p>
            </div>
          </div>

          <div class="hero-status">
            <button
              type="button"
              class="status-pill"
              :class="isGymOpen ? 'open' : 'closed'"

            >
              <span class="status-dot"></span>
              {{ isGymOpen ? t.gymAbierto : t.gymCerrado }}
            </button>

            <div class="billing-pill" :class="billingStatus">
              <span class="billing-dot"></span>
              {{ billingStatusText }}
            </div>

            <div v-if="gym.membershipEnd" class="membership-pill" :class="membershipState">
              <span class="membership-icon">
                <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18"/></svg>
              </span>
              <span class="membership-copy">
                <small>{{ membershipState === 'expired' ? ui.membershipExpired : ui.membershipExpires }}</small>
                <strong>{{ membershipDate }}</strong>
              </span>
            </div>
          </div>
        </section>

        <p v-if="identityError" class="identity-error">{{ identityError }}</p>
        <p v-if="metricsError" class="identity-error">No se pudieron cargar algunas métricas: {{ metricsError }}</p>
        <!-- 2. INDICADORES CLAVE -->
        <section class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ managerStats.entradasHoy }}</strong>
              <span>{{ t.entradasHoy }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon accent">
              <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="highlight">{{ managerStats.enInstalaciones }}</strong>
              <span>{{ t.enInstalaciones }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon danger">
              <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ managerStats.deudores }}</strong>
              <span>{{ ui.clientsWithDebt }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon warning">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ managerStats.porVencer }}</strong>
              <span>{{ t.porVencer }}</span>
            </div>
          </article>
        </section>

        <!-- 3. ALERTAS + ESTADO DE LA SUCURSAL -->
        <section class="two-col">
          <article class="panel alerts-panel">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.attention }}</span>
                <h2>{{ ui.alerts }}</h2>
              </div>
              <span class="alert-count">{{ alerts.length }}</span>
            </div>

            <div class="alert-list">
              <p v-if="!alerts.length" class="manager-empty">Sin alertas registradas para esta sede.</p>
              <button
                v-for="alert in alerts"
                :key="alert.title"
                type="button"
                class="alert-row"
                @click="go(alert.route)"
              >
                <span class="alert-icon" :class="alert.level">
                  <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                </span>
                <span class="alert-info">
                  <strong>{{ alert.title }}</strong>
                  <small>{{ alert.subtitle }}</small>
                </span>
                <svg class="chevron" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </article>

          <article class="panel finance-panel">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.operation }}</span>
                <h2>{{ ui.occupancyStatus }}</h2>
              </div>
              <span class="occupancy-badge">{{ occupancyRatio }}</span>
            </div>

            <div class="finance-main occupancy-main">
              <span>{{ ui.currentOccupancy }}</span>
              <strong>{{ managerStats.enInstalaciones }} <small>/ —</small></strong>
              <div class="occupancy-progress"><i style="width:0%"></i></div>
              <small>{{ ingresosLoaded ? 'Aforo no configurado en los datos consultados' : 'Sin datos de ocupación' }}</small>
            </div>

            <div class="finance-stats operation-stats">
              <div><span>{{ ui.peakHour }}</span><strong>—</strong></div>
              <div><span>{{ ui.averageStay }}</span><strong>—</strong></div>
              <div><span>{{ ui.accessStatus }}</span><strong class="status-ok">—</strong></div>
            </div>
          </article>
        </section>

        <!-- 4. ACCIONES RÁPIDAS + ACTIVIDAD -->
        <section class="two-col">
          <article class="panel quick-panel">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.management }}</span>
                <h2>{{ ui.quickActions }}</h2>
              </div>
            </div>

            <div class="quick-grid">
              <button
                v-for="action in quickActions"
                :key="action.label"
                type="button"
                class="quick-action"
                @click="runQuickAction(action)"
              >
                <span class="quick-icon">
                  <svg viewBox="0 0 24 24"><path :d="action.icon"/></svg>
                </span>
                <span class="quick-copy">
                  <strong>{{ action.label }}</strong>
                  <small>{{ action.description }}</small>
                </span>
              </button>
            </div>
          </article>

          <article class="panel activity-panel">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.today }}</span>
                <h2>{{ ui.recentActivity }}</h2>
              </div>
              <button type="button" class="link-btn" @click="go('/GYM_MANAGER/attendance')">{{ ui.viewAll }} →</button>
            </div>

            <div class="activity-list">
              <p v-if="!recentActivity.length" class="manager-empty">Sin actividad registrada para esta sede.</p>
              <div
                v-for="item in recentActivity"
                :key="item.name + item.time"
                class="activity-row"
              >
                <div class="avatar" :class="item.type">{{ item.initials }}</div>
                <div class="activity-info">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.text }}</span>
                </div>
                <time>{{ item.time }}</time>
              </div>
            </div>
          </article>
        </section>

        <!-- 5. RENDIMIENTO SEMANAL -->
        <section class="panel chart-panel">
          <div class="panel-header">
            <div>
              <span class="section-eyebrow">{{ ui.last7 }}</span>
              <h2>{{ ui.weeklyPerformance }}</h2>
            </div>
            <div class="chart-summary">
              <strong>{{ weeklyTotal }}</strong>
              <span>{{ ui.weekAccess }}</span>
              <em>{{ attendanceLoaded ? (currentLang === 'es' ? 'Datos registrados' : 'Registered data') : '—' }}</em>
            </div>
          </div>

          <div class="bar-chart">
            <div
              v-for="day in weeklyData"
              :key="day.day"
              class="bar-column"
              :class="{ peak: day.peak }"
            >
              <span>{{ day.value }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: day.height + '%' }"></div>
              </div>
              <small>{{ day.day }}</small>
            </div>
          </div>
        </section>

        <!-- 6. UBICACIÓN DE LA SUCURSAL (MAPA) -->
        <section class="panel map-panel">
          <div class="panel-header">
            <div>
              <span class="section-eyebrow">{{ ui.location }}</span>
              <h2>{{ ui.branchLocation }}</h2>
            </div>
          </div>

          <div class="location-grid">
            <!-- Datos de la dirección -->
            <div class="location-info">
              <div class="branch-chip">
                <span class="branch-chip-icon">
                  <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/></svg>
                </span>
                <span class="branch-chip-copy">
                  <small>{{ ui.branch }}</small>
                  <strong>{{ gym.location.branchName }}</strong>
                </span>
              </div>

              <div class="info-list">
                <div class="info-item">
                  <span>{{ ui.address }}</span>
                  <strong>{{ addressStreet }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ ui.neighborhood }}</span>
                  <strong>{{ gym.location.neighborhood }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ ui.city }}</span>
                  <strong>{{ gym.location.city }}, {{ gym.location.state }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ ui.postalCode }}</span>
                  <strong>{{ gym.location.zip }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ ui.coordinates }}</span>
                  <strong class="mono">{{ coordsText }}</strong>
                </div>
              </div>

              <a v-if="hasLocation" class="directions-btn" :href="directionsUrl" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                {{ ui.openInMaps }}
              </a>
            </div>

            <!-- Google Maps de la sede seleccionada (ubicación guardada en PostgreSQL) -->
            <div class="map-stage">
              <iframe v-if="googleMapEmbedUrl" :key="`${sedeId()}-${googleMapEmbedUrl}`" class="google-map-frame" :src="googleMapEmbedUrl" :title="`Mapa de ${gym.location.branchName}`" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
              <div v-else class="map-loading">{{ loadingIdentity ? ui.mapLoading : 'Ubicación no registrada para esta sede.' }}</div>
            </div>
          </div>
        </section>

        <!-- 7. OPERACIÓN -->
        <section class="tools">
          <div class="tools-title">
            <span>{{ ui.moreTools }}</span>
            <i></i>
          </div>

          <div class="modules-grid">
            <div class="module-section">
              <div class="section-header">
                <span class="section-eyebrow">{{ ui.operation }}</span>
                <h2>{{ t.controlAcceso }}</h2>
              </div>

              <div class="action-list">
                <button type="button" class="action-card" disabled title="Próximamente: reconocimiento facial">
                  <div class="action-icon">
                    <svg viewBox="0 0 24 24"><circle cx="9" cy="10" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 8a3 3 0 0 1 0 6M21 21v-2a5 5 0 0 0-3-4.58"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ t.asistenciaFacial }}</strong>
                    <span>{{ t.reconocimientoBio }}</span>
                  </div>
                  <ArrowIcon />
                </button>

                <button type="button" class="action-card" @click="activeModal = 'scanner'">
                  <div class="action-icon">
                    <svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h3v2h-3zM18 13h2v2h-2zM13 17h2v3h-2zM17 17h3v3h-3z"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ t.escanerQr }}</strong>
                    <span>{{ t.validacionPase }}</span>
                  </div>
                  <ArrowIcon />
                </button>
              </div>
            </div>

            <div class="module-section">
              <div class="section-header">
                <span class="section-eyebrow">{{ ui.schedule }}</span>
                <h2>{{ t.adminTurnos }}</h2>
              </div>

              <div class="action-list">
                <button type="button" class="action-card" @click="activeModal = 'add-schedule'">
                  <div class="action-icon accent">
                    <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18M8 13h3v3H8z"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ t.anadirHorario }}</strong>
                    <span>{{ t.gestionTurnos }}</span>
                  </div>
                  <ArrowIcon />
                </button>

                <button type="button" class="action-card" @click="activeModal = 'view-schedule'">
                  <div class="action-icon accent">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ t.verHorario }}</strong>
                    <span>{{ t.calendarioActivo }}</span>
                  </div>
                  <ArrowIcon />
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>

      <!-- MODALES -->
      <transition name="pop">
        <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
          <AddScheduleModal v-if="activeModal === 'add-schedule'" @close="closeModal" />
          <ViewScheduleModal v-if="activeModal === 'view-schedule'" @close="closeModal" />
          <CorreoMasivo v-if="activeModal === 'enviomasivo'" @close="closeModal" />
          <AddCorteComponent v-if="activeModal === 'corte'" @close="closeModal" />

          <AccessAttendanceModal v-if="activeModal === 'scanner'" mode="scanner" :sede-id="sedeId()" @close="closeModal" @registered="onAttendanceRegistered" />
          <div v-if="activeModal === 'facial'" class="camera-panel">
            <div class="camera-header">
              <div>
                <span>{{ ui.accessControl }}</span>
                <h3>{{ activeModal === 'facial' ? t.escaneoFacialTitle : t.escaneandoQrTitle }}</h3>
              </div>
              <button type="button" @click="closeModal">&times;</button>
            </div>

            <div class="camera-container">
              <video ref="videoPlayer" autoplay playsinline></video>
              <div v-if="activeModal === 'facial'" class="face-overlay"></div>
              <div v-else class="qr-overlay"><div class="scanner-line"></div></div>
            </div>

            <div class="camera-footer">
              <p>{{ activeModal === 'facial' ? t.instruccionFacial : t.instruccionQr }}</p>
              <button type="button" @click="closeModal">{{ t.cancelar }}</button>
            </div>
          </div>
        </div>
      </transition>


    </div>
  </HeadingAdmin>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { traducciones } from './i18n.js';
import AddScheduleModal from '../Modals/GymOpeningHours.vue';
import ViewScheduleModal from '../Modals/ViewScheduleModal.vue';
import CorreoMasivo from './Componets/Bulk-Email.vue';
import AddCorteComponent from './Componets/Cut.vue';
import HeadingAdmin from './HeadingGYM_MANAGER.vue';
import AccessAttendanceModal from '../Modals/AccessAttendanceModal.vue';

const router = useRouter();

const currentLang = ref(localStorage.getItem('GYM_MANAGER-idioma') || 'es');
const activeModal = ref(null);
const videoPlayer = ref(null);
const isGymOpen = ref(false);
const billingStatus = ref('unknown');

let stream = null;

/* =========================================================
   DATOS DEL GIMNASIO (encabezado y ubicación)
   Cuando vengan del backend solo hay que llenar estos campos:
   - logoUrl:       logo del gimnasio (opcional)
   - coverUrl:      foto de fondo del encabezado (opcional)
   - membershipEnd: fecha de vencimiento de la membresía, formato AAAA-MM-DD
   - location:      dirección y coordenadas de la sucursal
========================================================= */

const gym = ref({
  name: 'Mi gimnasio', logoUrl: null, coverUrl: null, membershipEnd: null,
  location: { branchName: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', lat: null, lng: null }
});
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const route = useRoute();
const activeSede = ref(0);
const loadingIdentity = ref(false);
const identityError = ref('');
let identityRequest = 0;
// El encabezado de Gerente lee la sucursal asignada desde gym_account.usuario.sedes.
// El dashboard usa exactamente esa misma información, evitando sede_id=0.
const readManagerSession = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['gym_account', 'user', 'auth', 'session']) {
      try {
        const value = JSON.parse(storage.getItem(key) || 'null');
        if (!value || typeof value !== 'object') continue;
        const account = value.usuario || value.user || value;
        if (account && typeof account === 'object' && (account.sedes?.length || account.ID_Sede || account.sede_id)) return account;
      } catch { /* Sesión no almacenada bajo esta clave. */ }
    }
  }
  return {};
};
const validSedeId = (value) => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : 0;
};
const assignedSedeIds = () => {
  const account = readManagerSession();
  const list = Array.isArray(account.sedes) ? account.sedes : [];
  const ids = list.map(s => validSedeId(s?.ID_Sede ?? s?.sede_id ?? s?.id)).filter(Boolean);
  const own = validSedeId(account.ID_Sede ?? account.sede_id ?? account.id_sede);
  if (own && !ids.includes(own)) ids.push(own);
  return ids;
};
const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const name of ['auth_token', 'token', 'access_token', 'GYM_MANAGER_token', 'gym_token']) {
      const value = storage.getItem(name);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const name of ['gym_account', 'auth', 'user', 'session']) {
      try {
        const data = JSON.parse(storage.getItem(name) || 'null');
        const value = data?.token || data?.access_token || data?.accessToken;
        if (value) return String(value).replace(/^Bearer\s+/i, '');
      } catch { /* No es JSON. */ }
    }
  }
  return '';
};
const storedSede = () => {
  const assigned = assignedSedeIds();
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['selected_sede_id', 'sede_id', 'ID_Sede', 'id_sede', 'selectedSede', 'selectedSedeId', 'sedeSeleccionada', 'gym_sede_id']) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      let item = raw;
      try {
        const parsed = JSON.parse(raw);
        item = parsed && typeof parsed === 'object' ? (parsed.ID_Sede ?? parsed.sede_id ?? parsed.id ?? parsed.value) : parsed;
      } catch { /* ID numérico directo. */ }
      const id = validSedeId(item);
      if (id && (!assigned.length || assigned.includes(id))) return id;
    }
  }
  // Caso real: la barra superior sí dice la sede, pero selected_sede_id está vacío.
  // Coincide con la sede que el encabezado eligió como primera asignada.
  return assigned[0] || 0;
};
const sedeId = () => {
  const assigned = assignedSedeIds();
  const candidate = activeSede.value || validSedeId(route.query.sede_id) || storedSede();
  return candidate && (!assigned.length || assigned.includes(candidate)) ? candidate : (assigned[0] || 0);
};
const loadGymIdentity = async () => {
  const seq = ++identityRequest;
  const id = sedeId();
  loadingIdentity.value = true;
  identityError.value = '';
  if (!id) { identityError.value = 'No se encontró la sucursal asignada en la sesión del gerente. Vuelve a iniciar sesión.'; loadingIdentity.value = false; return; }
  try {
    const token = getToken();
    if (!token) throw new Error('No se encontró la sesión del gerente.');
    const response = await fetch(`${API}/api/gym/identidad-visual?sede_id=${id}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`No se pudo cargar la sede ${id} (${response.status}): ${data?.message || 'Consulta no autorizada o no disponible'}`);
    if (seq !== identityRequest) return;
    const info = data.gimnasio || {};
    const branch = data.sede || {};
    gym.value = {
      name: String(info.nombre || 'Mi gimnasio'), logoUrl: info.logo_url || null, coverUrl: info.portada_url || null,
      membershipEnd: null,
      location: {
        branchName: String(branch.nombre || `Sede ${id}`), street: String(branch.calle || ''), number: String(branch.numero_ext || ''),
        neighborhood: String(branch.colonia || ''), city: String(branch.municipio || ''), state: String(branch.entidad || ''),
        zip: String(branch.codigo_postal || ''), lat: branch.latitud ?? null, lng: branch.longitud ?? null
      }
    };
  } catch (error) {
    if (seq === identityRequest) identityError.value = error?.message || 'No se pudo consultar la identidad de esta sede.';
  } finally { if (seq === identityRequest) loadingIdentity.value = false; }
};
const onBranchChanged = (event) => {
  const detail = event.detail || {};
  const branch = detail.sede && typeof detail.sede === 'object' ? detail.sede : {};
  const id = Number(detail.sede_id ?? detail.ID_Sede ?? detail.id ?? detail.sedeId ?? branch.ID_Sede ?? storedSede());
  activeSede.value = validSedeId(id) && (!assignedSedeIds().length || assignedSedeIds().includes(id)) ? id : 0;
  void loadGymIdentity();
};
const onGymProfileUpdated = (event) => {
  const id = Number(event.detail?.sede_id || 0);
  if (!id || id === sedeId()) { void loadGymIdentity(); void loadManagerMetrics(); void loadManagerStatus(); }
};
const onTabVisible = () => { if (document.visibilityState === 'visible') { void loadGymIdentity(); void loadManagerMetrics(); void loadManagerStatus(); } };
watch(() => route.query.sede_id, () => { activeSede.value = 0; void loadGymIdentity(); void loadManagerMetrics(); void loadManagerStatus(); });

const nameWords = computed(() => gym.value.name.trim().toUpperCase().split(/\s+/));

/* Palabra resaltada con el color de acento: la segunda del nombre */
const highlightIndex = computed(() => (nameWords.value.length > 1 ? 1 : 0));

const heroStyle = computed(() =>
  gym.value.coverUrl ? { '--cover': `url('${gym.value.coverUrl}')` } : {}
);

/* ---------- Vencimiento de la membresía ---------- */

const MONTHS = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

const parseDate = (value) => {
  const [y, m, d] = String(value || '').split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
};

/* Ej. 26/mayo/2027 */
const membershipDate = computed(() => {
  const date = parseDate(gym.value.membershipEnd);
  if (!date) return '';

  const months = MONTHS[currentLang.value] || MONTHS.es;
  return `${date.d}/${months[date.m - 1]}/${date.y}`;
});

/* ok = vigente · soon = vence en 30 días o menos · expired = ya venció */
const membershipState = computed(() => {
  const date = parseDate(gym.value.membershipEnd);
  if (!date) return 'ok';

  const end = new Date(date.y, date.m - 1, date.d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.ceil((end - today) / 86400000);

  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return 'ok';
});

/* =========================================================
   UTILIDADES
========================================================= */

const ArrowIcon = () =>
  h('div', { class: 'action-arrow' }, [
    h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'm9 18 6-6-6-6' })])
  ]);

const go = (path) => router.push(path);

/* =========================================================
   TRADUCCIONES
========================================================= */

const t = computed(() => {
  const lang = traducciones[currentLang.value] || traducciones.es;
  const fallback = traducciones.es;

  return new Proxy({}, {
    get(_, key) {
      return lang[key] !== undefined ? lang[key] : fallback[key];
    }
  });
});

const dashboardTranslations = {
  es: {
    GYM_MANAGERPanel: 'Panel del Gerente',
    operation: 'OPERACIÓN',
    occupancyStatus: 'Ocupación de la sucursal',
    currentOccupancy: 'OCUPACIÓN ACTUAL',
    normalOccupancy: 'Nivel de ocupación normal',
    peakHour: 'HORA PICO',
    averageStay: 'ESTANCIA PROMEDIO',
    accessStatus: 'ESTADO DE ACCESO',
    normal: 'Normal',
    clientsWithDebt: 'CLIENTES CON ADEUDO',
    schedule: 'AGENDA',
    moreTools: 'Operación',
    accessControl: 'CONTROL DE ACCESO',
    cameraError: 'No se pudo acceder a la cámara. Verifica los permisos.',
    membershipExpires: 'Membresía vence el',
    membershipExpired: 'Membresía venció el',
    today: 'ACTIVIDAD',
    recentActivity: 'Actividad reciente',
    viewAll: 'Ver todo',
    attention: 'ATENCIÓN',
    alerts: 'Alertas importantes',
    last7: 'ÚLTIMOS 7 DÍAS',
    weeklyPerformance: 'Rendimiento semanal',
    attendance: 'Asistencias',
    weekAccess: 'accesos esta semana',
    management: 'GESTIÓN',
    quickActions: 'Acciones rápidas',
    peopleInside: 'personas dentro',
    location: 'UBICACIÓN',
    branchLocation: 'Ubicación de la sucursal',
    branch: 'Sucursal',
    address: 'Dirección',
    neighborhood: 'Colonia',
    city: 'Ciudad',
    postalCode: 'Código postal',
    coordinates: 'Coordenadas',
    openInMaps: 'Cómo llegar',
    mapStreets: 'Calles',
    mapSatellite: 'Satélite',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    centerMap: 'Centrar en la sede',
    mapLoading: 'Cargando mapa…'
  },
  en: {
    GYM_MANAGERPanel: 'Manager panel',
    operation: 'OPERATIONS',
    occupancyStatus: 'Branch occupancy',
    currentOccupancy: 'CURRENT OCCUPANCY',
    normalOccupancy: 'Normal occupancy level',
    peakHour: 'PEAK HOUR',
    averageStay: 'AVERAGE STAY',
    accessStatus: 'ACCESS STATUS',
    normal: 'Normal',
    clientsWithDebt: 'CLIENTS WITH DEBT',
    schedule: 'SCHEDULE',
    moreTools: 'Operations',
    accessControl: 'ACCESS CONTROL',
    cameraError: 'Camera access failed. Check your permissions.',
    membershipExpires: 'Membership expires on',
    membershipExpired: 'Membership expired on',
    today: 'ACTIVITY',
    recentActivity: 'Recent activity',
    viewAll: 'View all',
    attention: 'ATTENTION',
    alerts: 'Important alerts',
    last7: 'LAST 7 DAYS',
    weeklyPerformance: 'Weekly performance',
    attendance: 'Attendance',
    weekAccess: 'accesses this week',
    management: 'MANAGEMENT',
    quickActions: 'Quick actions',
    peopleInside: 'people inside',
    location: 'LOCATION',
    branchLocation: 'Branch location',
    branch: 'Branch',
    address: 'Address',
    neighborhood: 'Neighborhood',
    city: 'City',
    postalCode: 'Postal code',
    coordinates: 'Coordinates',
    openInMaps: 'Get directions',
    mapStreets: 'Streets',
    mapSatellite: 'Satellite',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    centerMap: 'Center on the branch',
    mapLoading: 'Loading map…'
  }
};

const ui = computed(
  () => dashboardTranslations[currentLang.value] || dashboardTranslations.es
);

/* =========================================================
   DATOS (de prueba)
========================================================= */

/* =========================================================
   DATOS REALES DE LA SEDE: ingresos, asistencia y alertas
========================================================= */
const inscripciones = ref([]);
const pagosConfirmados = ref([]);
const registrosAsistencia = ref([]);
const ingresosLoaded = ref(false);
const asistenciaLoaded = ref(false);
const metricsError = ref('');
let metricsSeq = 0;
const apiGet = async (path) => {
  const token = getToken();
  if (!token) throw new Error('Sesión del gerente no encontrada.');
  const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `Error HTTP ${response.status}`);
  return data;
};
const nowParts = () => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Monterrey', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (k) => parts.find(p => p.type === k)?.value || '';
  return { today: `${value('year')}-${value('month')}-${value('day')}` };
};
const loadManagerMetrics = async () => {
  const seq = ++metricsSeq;
  const id = sedeId();
  if (!id) { inscripciones.value = []; pagosConfirmados.value = []; registrosAsistencia.value = []; ingresosLoaded.value = false; asistenciaLoaded.value = false; return; }
  const results = await Promise.allSettled([
    apiGet(`/api/gym/ingresos?sede_id=${id}`),
    apiGet(`/api/gym/asistencias-semana?sede_id=${id}`)
  ]);
  if (seq !== metricsSeq) return;
  const [ingresos, asistencia] = results;
  ingresosLoaded.value = ingresos.status === 'fulfilled' && Array.isArray(ingresos.value.inscripciones);
  asistenciaLoaded.value = asistencia.status === 'fulfilled' && Array.isArray(asistencia.value.asistencias);
  inscripciones.value = ingresosLoaded.value ? ingresos.value.inscripciones : [];
  pagosConfirmados.value = ingresosLoaded.value && Array.isArray(ingresos.value.pagos_confirmados) ? ingresos.value.pagos_confirmados : [];
  registrosAsistencia.value = asistenciaLoaded.value ? asistencia.value.asistencias : [];
  metricsError.value = [ingresos, asistencia].filter(r => r.status === 'rejected').map(r => r.reason?.message || 'Error al consultar métricas').join(' · ');
};
const loadManagerStatus = async () => {
  const id = sedeId();
  if (!id) return;
  try { const data = await apiGet(`/api/gym/estado?sede_id=${id}`); isGymOpen.value = Boolean(data?.estado?.abierto); }
  catch { isGymOpen.value = false; }
};
const managerStats = computed(() => {
  const today = nowParts().today;
  const debtors = inscripciones.value.filter(r => Number(r.saldo_a_pagar || 0) > 0);
  const expiring = inscripciones.value.filter(r => r.estatus_inscripcion === 'Próximo a vencer');
  const todayAccess = new Set(registrosAsistencia.value.filter(r => r.fecha === today).map(r => Number(r.ID_Inscripto)));
  return { entradasHoy: asistenciaLoaded.value ? todayAccess.size : '—', enInstalaciones: '—', deudores: ingresosLoaded.value ? debtors.length : '—', porVencer: ingresosLoaded.value ? expiring.length : '—', vencidos: ingresosLoaded.value ? inscripciones.value.filter(r => r.estatus_inscripcion === 'Inactivo').length : 0 };
});
const occupancyRatio = computed(() => '—'); // No hay aforo máximo ni ocupación actual verificados en estas APIs.
const initials = (name) => String(name || 'Cliente').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
const recentActivity = computed(() => {
  const clients = new Map(inscripciones.value.map(i => [Number(i.ID_Inscripto), i]));
  const payments = pagosConfirmados.value.filter(p => p.fecha_pago).map(p => {
    const name = clients.get(Number(p.id_inscripto))?.nombre || 'Cliente';
    return { name, initials: initials(name), text: `${currentLang.value === 'en' ? 'Payment received' : 'Pago recibido'} · $${Number(p.monto || 0).toFixed(2)}`, time: String(p.fecha_pago).slice(0, 10), type: 'payment', sort: String(p.fecha_pago) };
  });
  const attendance = registrosAsistencia.value.filter(a => a.fecha).map(a => {
    const name = clients.get(Number(a.ID_Inscripto))?.nombre || 'Cliente';
    return { name, initials: initials(name), text: currentLang.value === 'en' ? 'Access registered' : 'Acceso registrado', time: String(a.fecha).slice(0, 10), type: 'access', sort: String(a.fecha) };
  });
  return [...payments, ...attendance].sort((a,b) => b.sort.localeCompare(a.sort)).slice(0,5);
});
const alertOrder = { danger: 0, warning: 1, info: 2 };
const alerts = computed(() => {
  if (!ingresosLoaded.value) return [];
  const result = [];
  if (managerStats.value.deudores > 0) result.push({ title: `${managerStats.value.deudores} clientes con adeudo`, subtitle: 'Requieren seguimiento', level: 'danger', route: '/GYM_MANAGER/debtors' });
  if (managerStats.value.vencidos > 0) result.push({ title: `${managerStats.value.vencidos} membresías vencidas`, subtitle: 'Requieren renovación', level: 'danger', route: '/GYM_MANAGER/renewals' });
  if (managerStats.value.porVencer > 0) result.push({ title: `${managerStats.value.porVencer} membresías por vencer`, subtitle: 'Requieren seguimiento', level: 'warning', route: '/GYM_MANAGER/renewals' });
  return result.sort((a,b) => alertOrder[a.level] - alertOrder[b.level]);
});
const weeklyData = computed(() => {
  const labels = currentLang.value === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const counts = [0,0,0,0,0,0,0], seen = new Set();
  if (asistenciaLoaded.value) for (const a of registrosAsistencia.value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(a.fecha || ''))) continue;
    const key = `${a.ID_Inscripto}:${a.fecha}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const index = (new Date(`${a.fecha}T00:00:00Z`).getUTCDay() + 6) % 7;
    counts[index]++;
  }
  const max = Math.max(...counts,1);
  return labels.map((day,i) => ({ day, value: asistenciaLoaded.value ? counts[i] : '—', height: asistenciaLoaded.value ? counts[i] / max * 100 : 0, peak: asistenciaLoaded.value && counts[i] === max && max > 0 }));
});
const weeklyTotal = computed(() => asistenciaLoaded.value ? weeklyData.value.reduce((s,d) => s + Number(d.value || 0),0) : '—');

const quickActions = computed(() => {
  const icons = {
    client: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',
    payment: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    mail: 'M4 4h16v16H4zM4 7l8 6 8-6',
    cash: 'M4 4h16v16H4zM8 8h8M8 12h3M8 16h3M14 12h2M14 16h2'
  };

  return currentLang.value === 'es'
    ? [
        { label: 'Registrar cliente', description: 'Nueva membresía', route: '/GYM_MANAGER/register-clients', icon: icons.client },
        { label: 'Registrar pago', description: 'Cobrar membresía', route: '/GYM_MANAGER/payments', icon: icons.payment },
        { label: 'Correo masivo', description: 'Comunicar a clientes', modal: 'enviomasivo', icon: icons.mail },
        { label: 'Corte de caja', description: 'Resumen de operación', modal: 'corte', icon: icons.cash }
      ]
    : [
        { label: 'Register client', description: 'New membership', route: '/GYM_MANAGER/register-clients', icon: icons.client },
        { label: 'Register payment', description: 'Charge membership', route: '/GYM_MANAGER/payments', icon: icons.payment },
        { label: 'Bulk email', description: 'Message clients', modal: 'enviomasivo', icon: icons.mail },
        { label: 'Cash close', description: 'Operation summary', modal: 'corte', icon: icons.cash }
      ];
});

const runQuickAction = (action) => {
  if (action.modal) {
    activeModal.value = action.modal;
    return;
  }

  go(action.route);
};

/* =========================================================
   ESTADO DEL GIMNASIO
========================================================= */

const billingStatusText = computed(() => {
  if (billingStatus.value === 'active') return t.value.cuentaCorriente;
  if (billingStatus.value === 'pending') return t.value.pendientePago;
  return billingStatus.value === 'blocked' ? t.value.bloqueadoPago : '—';
});



/* =========================================================
   GOOGLE MAPS: coordenadas de la sede o dirección de PostgreSQL
========================================================= */
const coords = computed(() => {
  const latValue = gym.value.location.lat, lngValue = gym.value.location.lng;
  const lat = latValue === null || latValue === '' ? NaN : Number(latValue);
  const lng = lngValue === null || lngValue === '' ? NaN : Number(lngValue);
  return { lat, lng };
});
const validCoords = computed(() => Number.isFinite(coords.value.lat) && Number.isFinite(coords.value.lng) && Math.abs(coords.value.lat) <= 90 && Math.abs(coords.value.lng) <= 180 && !(coords.value.lat === 0 && coords.value.lng === 0));
const addressStreet = computed(() => [gym.value.location.street, gym.value.location.number && `#${gym.value.location.number}`].filter(Boolean).join(' '));
const addressFull = computed(() => [addressStreet.value, gym.value.location.neighborhood, gym.value.location.city, gym.value.location.state, gym.value.location.zip, 'México'].filter(Boolean).join(', '));
const mapQuery = computed(() => validCoords.value ? `${coords.value.lat},${coords.value.lng}` : (gym.value.location.city || gym.value.location.street ? addressFull.value : ''));
const hasLocation = computed(() => !!mapQuery.value);
const coordsText = computed(() => validCoords.value ? `${coords.value.lat.toFixed(6)}, ${coords.value.lng.toFixed(6)}` : 'No registradas');
const googleMapEmbedUrl = computed(() => mapQuery.value ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery.value)}&z=16&output=embed` : '');
const directionsUrl = computed(() => mapQuery.value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery.value)}` : '#');
const onAttendanceRegistered = () => { void loadManagerMetrics(); };

/* =========================================================
   IDIOMA
========================================================= */

const handleLangChange = (event) => {
  if (!event.detail?.idioma) return;

  currentLang.value = event.detail.idioma;
  localStorage.setItem('GYM_MANAGER-idioma', event.detail.idioma);
};

/* =========================================================
   MODALES
========================================================= */

const closeModal = () => { activeModal.value = null; };

/* Cerrar modales con Escape */
const handleKeydown = (event) => {
  if (event.key !== 'Escape') return;

  if (activeModal.value) {
    closeModal();
  }
};

/* =========================================================
   CICLO DE VIDA
========================================================= */

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('factorfit:branch-changed', onBranchChanged);
  window.addEventListener('sede-changed', onBranchChanged);
  window.addEventListener('factorfit:gym-profile-updated', onGymProfileUpdated);
  document.addEventListener('visibilitychange', onTabVisible);
  void loadGymIdentity();
});
onUnmounted(() => {
  identityRequest++;
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('factorfit:branch-changed', onBranchChanged);
  window.removeEventListener('sede-changed', onBranchChanged);
  window.removeEventListener('factorfit:gym-profile-updated', onGymProfileUpdated);
  document.removeEventListener('visibilitychange', onTabVisible);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

/* =========================================================
   BASE
========================================================= */

.dashboard {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: color-mix(in srgb, var(--hl) 11%, transparent);
  --hl-mid: color-mix(in srgb, var(--hl) 22%, transparent);
  --hl-line: color-mix(in srgb, var(--hl) 45%, transparent);
  --card: var(--bg-cards, #121212);
  --line: rgba(255, 255, 255, 0.07);
  --line2: rgba(255, 255, 255, 0.13);
  --title: var(--color-titulos, #fff);
  --text2: rgba(245, 245, 244, 0.66);
  --text3: rgba(245, 245, 244, 0.45);
  --surface: rgba(255, 255, 255, 0.03);
  --surface-hover: rgba(255, 255, 255, 0.055);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: calc(100vh - 65px);
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.dashboard-container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 30px 32px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.eyebrow,
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  color: var(--hl);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.eyebrow::before,
.section-eyebrow::before {
  content: '';
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: var(--hl);
}

.highlight {
  color: var(--hl) !important;
}

/* =========================================================
   1. ENCABEZADO
========================================================= */

.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 28px;
  padding: 34px 36px;
  background:
    radial-gradient(520px 260px at 100% 0%, var(--hl-mid), transparent 70%),
    linear-gradient(135deg, color-mix(in srgb, var(--card) 92%, white), var(--card) 55%, rgba(10, 10, 10, 0.96));
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* Cuadrícula sutil de fondo */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse at 100% 0%, #000, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 100% 0%, #000, transparent 70%);
  pointer-events: none;
}

/* Anillos decorativos */
.hero::after {
  content: '';
  position: absolute;
  right: -70px;
  bottom: -190px;
  width: 320px;
  height: 320px;
  border: 1px solid var(--hl-mid);
  border-radius: 50%;
  box-shadow: 0 0 0 38px var(--hl-soft), 0 0 0 39px var(--hl-soft);
  pointer-events: none;
}

.hero-main,
.hero-status {
  position: relative;
  z-index: 1;
}

/* Contenedor transparente: logo + panel de texto lado a lado */
.hero-main {
  min-width: 0;
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.hero-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Logo: su alto es el mismo que el del panel (stretch) */
.hero-logo {
  position: relative;
  flex: none;
  align-self: stretch;
  width: 120px;
  min-height: 96px;
  overflow: hidden;
  background: #111;
  border: 1px solid var(--line2);
  border-radius: 32px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
}

.hero-logo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.branch-badge {
  display: inline-flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line2);
  border-radius: 999px;
  color: var(--text2);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  backdrop-filter: blur(6px);
}

.hero-copy h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(28px, 3.6vw, 44px);
  line-height: 1.05;
  letter-spacing: -0.5px;
}

.hero-copy h1 span {
  color: var(--hl);
  text-shadow: 0 0 36px var(--hl-line);
}

.hero-copy p {
  max-width: 560px;
  margin: 12px 0 0;
  color: var(--text2);
  font-size: 14px;
  line-height: 1.55;
}

.hero-status {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 240px;
}

.status-pill,
.billing-pill {
  height: 42px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

.status-pill {
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s var(--ease);
}

.status-pill:hover {
  filter: brightness(1.18);
  transform: translateY(-1px);
}

.status-pill.open,
.billing-pill.active {
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.32);
}

.status-pill.closed,
.billing-pill.blocked {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.32);
}

.billing-pill.pending {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.32);
}

.status-dot,
.billing-dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 18%, transparent), 0 0 12px currentColor;
}

/* ---------- Vencimiento de la membresía ---------- */

.membership-pill {
  min-height: 58px;
  padding: 8px 20px 8px 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid var(--line2);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
}

.membership-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
}

.membership-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.membership-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.membership-copy small {
  color: rgba(255, 255, 255, 0.78);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
}

.membership-copy strong {
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}

/* Vence pronto: ámbar */
.membership-pill.soon { border-color: rgba(245, 158, 11, 0.45); }
.membership-pill.soon .membership-icon { color: #fbbf24; background: rgba(245, 158, 11, 0.14); border-color: rgba(245, 158, 11, 0.4); }
.membership-pill.soon .membership-copy strong { color: #fbbf24; }

/* Vencida: rojo */
.membership-pill.expired { border-color: rgba(239, 68, 68, 0.45); }
.membership-pill.expired .membership-icon { color: #f87171; background: rgba(239, 68, 68, 0.14); border-color: rgba(239, 68, 68, 0.4); }
.membership-pill.expired .membership-copy strong { color: #f87171; }

/* ---------- Encabezado con foto de portada ---------- */

.hero.has-cover {
  background: var(--cover) center / cover no-repeat, var(--card);
}

/* Velo suave: oscurece lo justo para que la foto siga luciendo */
.hero.has-cover::before {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.08) 70%);
  background-size: auto;
  mask-image: none;
  -webkit-mask-image: none;
}

.hero.has-cover::after {
  display: none;
}

/* Contenedor ajustado a su contenido, sin fondo propio */
.hero.has-cover .hero-main {
  width: fit-content;
  max-width: 100%;
  justify-self: start;
}

/* El recuadro de cristal es solo el panel de texto */
.hero.has-cover .hero-copy {
  padding: 18px 26px;
  background: rgba(10, 10, 10, 0.66);
  border: 1px solid var(--line2);
  border-radius: 22px;
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
}

/* Pills legibles sobre la foto, conservando su color de estado */
.hero.has-cover .status-pill,
.hero.has-cover .billing-pill {
  background-color: color-mix(in srgb, currentColor 14%, rgba(10, 10, 10, 0.86));
}

/* =========================================================
   2. INDICADORES CLAVE
========================================================= */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  --tint: rgba(255, 255, 255, 0.7);

  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  background:
    radial-gradient(180px 90px at 0% 0%, color-mix(in srgb, var(--tint) 12%, transparent), transparent 75%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 60%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
  transition: transform 0.25s var(--ease), border-color 0.25s ease, box-shadow 0.25s ease;
}

/* Línea de color superior */
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 22px;
  right: 22px;
  height: 2px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--tint), transparent);
  opacity: 0.85;
}

.kpi-card:nth-child(2) { --tint: var(--hl); }
.kpi-card:nth-child(3) { --tint: #34d399; }
.kpi-card:nth-child(4) { --tint: #f59e0b; }

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--tint) 40%, transparent);
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.34);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line);
  border-radius: 15px;
}

.kpi-icon.accent { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }
.kpi-icon.success { color: #34d399; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.kpi-icon.danger { color: #f87171; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.28); }
.kpi-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.28); }

.kpi-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.kpi-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-body strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.3px;
}

.kpi-body span {
  overflow: hidden;
  color: var(--text3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

/* =========================================================
   PANELES
========================================================= */

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.panel {
  min-width: 0;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.panel-header {
  min-height: 44px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.panel-header .section-eyebrow {
  margin-bottom: 4px;
  font-size: 9px;
}

.panel-header h2,
.section-header h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.link-btn {
  padding: 7px 12px;
  color: var(--hl);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.link-btn:hover {
  background: var(--hl-mid);
  border-color: var(--hl-line);
}

/* =========================================================
   3. ALERTAS
========================================================= */

.alert-count {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: 9px;
  font-size: 12px;
  font-weight: 800;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.alert-row {
  --lvl: #60a5fa;

  position: relative;
  width: 100%;
  min-height: 62px;
  padding: 10px 14px 10px 16px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 13px;
  overflow: hidden;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 15px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.25s var(--ease);
}

/* Barra lateral según nivel */
.alert-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: var(--lvl);
}

.alert-row:has(.alert-icon.danger) { --lvl: #f87171; }
.alert-row:has(.alert-icon.warning) { --lvl: #fbbf24; }
.alert-row:has(.alert-icon.info) { --lvl: #60a5fa; }

.alert-row:hover {
  transform: translateX(3px);
  background: var(--surface-hover);
  border-color: color-mix(in srgb, var(--lvl) 35%, transparent);
}

.alert-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
}

.alert-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.alert-icon.danger { color: #f87171; background: rgba(239, 68, 68, 0.13); }
.alert-icon.warning { color: #fbbf24; background: rgba(245, 158, 11, 0.13); }
.alert-icon.info { color: #60a5fa; background: rgba(59, 130, 246, 0.13); }

.alert-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.alert-info strong {
  overflow: hidden;
  color: var(--title);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-info small {
  color: var(--text3);
  font-size: 11px;
}

.chevron {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: var(--text3);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s ease, stroke 0.2s ease;
}

.alert-row:hover .chevron {
  stroke: var(--title);
  transform: translateX(2px);
}

/* =========================================================
   3. FINANZAS
========================================================= */

.occupancy-badge {
  min-width: 48px;
  height: 30px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 9px;
  font-size: 12px;
  font-weight: 800;
}

.occupancy-main strong small {
  color: var(--text3);
  font-size: 20px;
  font-weight: 600;
}

.occupancy-progress {
  width: 100%;
  height: 7px;
  margin: 12px 0 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.occupancy-progress i {
  display: block;
  height: 100%;
  background: var(--hl);
  border-radius: inherit;
  box-shadow: 0 0 14px var(--hl-line);
}

.operation-stats .status-ok {
  color: #34d399;
}

.finance-main {
  position: relative;
  overflow: hidden;
  padding: 22px;
  background:
    radial-gradient(260px 140px at 100% 0%, var(--hl-mid), transparent 75%),
    linear-gradient(135deg, var(--hl-soft), transparent 80%);
  border: 1px solid var(--hl-line);
  border-radius: 18px;
}

.finance-main::after {
  content: '';
  position: absolute;
  right: -40px;
  bottom: -70px;
  width: 150px;
  height: 150px;
  border: 1px solid var(--hl-mid);
  border-radius: 50%;
  pointer-events: none;
}

.finance-main > span {
  display: block;
  color: var(--text2);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.finance-main strong {
  position: relative;
  display: block;
  margin: 8px 0 8px;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 46px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.4px;
}

.finance-main small {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.finance-stats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.finance-stats div {
  padding: 15px 8px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.finance-stats div:hover {
  background: var(--surface-hover);
  border-color: var(--line2);
}

.finance-stats span {
  display: block;
  color: var(--text3);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.finance-stats strong {
  display: block;
  margin-top: 6px;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
}

/* =========================================================
   4. ACCIONES RÁPIDAS
========================================================= */

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quick-action {
  position: relative;
  min-height: 72px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 15px;
  transition: transform 0.25s var(--ease), border-color 0.2s ease, background 0.2s ease, box-shadow 0.25s ease;
}

.quick-action:hover {
  transform: translateY(-3px);
  border-color: var(--hl-line);
  background: var(--hl-soft);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
}

.quick-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s var(--ease);
}

.quick-action:hover .quick-icon {
  color: #fff;
  background: var(--hl);
  transform: scale(1.06);
}

.quick-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.quick-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.quick-copy strong {
  overflow: hidden;
  color: var(--title);
  font-size: 12.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-copy small {
  overflow: hidden;
  color: var(--text3);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   4. ACTIVIDAD
========================================================= */

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-row {
  min-height: 62px;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  border-top: 1px solid var(--line);
}

.activity-row:first-child {
  border-top: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--hl), color-mix(in srgb, var(--hl) 60%, black));
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.avatar.payment { background: linear-gradient(135deg, #10b981, #047857); }
.avatar.renewal { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.avatar.client { background: linear-gradient(135deg, #f59e0b, #b45309); }

.activity-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.activity-info strong {
  overflow: hidden;
  color: var(--title);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-info span,
.activity-row time {
  color: var(--text3);
  font-size: 11px;
}

.activity-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-row time {
  padding: 4px 9px;
  background: var(--surface);
  border-radius: 999px;
  white-space: nowrap;
}

/* =========================================================
   5. GRÁFICA
========================================================= */

.chart-summary {
  display: flex;
  align-items: baseline;
  gap: 9px;
}

.chart-summary strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
}

.chart-summary span {
  color: var(--text3);
  font-size: 11.5px;
}

.chart-summary em {
  padding: 3px 9px;
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
  border-radius: 999px;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
}

.bar-chart {
  position: relative;
  height: 200px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: end;
  gap: 16px;
}

/* Líneas guía horizontales */
.bar-chart::before {
  content: '';
  position: absolute;
  top: 22px;
  bottom: 26px;
  left: 0;
  right: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.06) 0,
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px,
    transparent 25%
  );
  pointer-events: none;
}

.bar-column {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-rows: 22px 1fr 26px;
  align-items: end;
  text-align: center;
  cursor: default;
}

.bar-column > span {
  align-self: center;
  color: var(--text2);
  font-size: 11px;
  font-weight: 700;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.25s var(--ease);
}

.bar-column:hover > span,
.bar-column.peak > span {
  opacity: 1;
  transform: translateY(0);
}

.bar-column.peak > span {
  color: var(--hl);
}

.bar-track {
  position: relative;
  width: 100%;
  max-width: 58px;
  height: 100%;
  margin: auto;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px 10px 5px 5px;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--hl) 60%, transparent),
    color-mix(in srgb, var(--hl) 16%, transparent)
  );
  border-radius: 10px 10px 5px 5px;
  transition: height 0.5s var(--ease), filter 0.2s ease;
}

.bar-column:hover .bar-fill {
  filter: brightness(1.25);
}

.bar-column.peak .bar-fill {
  background: linear-gradient(180deg, var(--hl), color-mix(in srgb, var(--hl) 30%, transparent));
  box-shadow: 0 0 26px var(--hl-line);
}

.bar-column small {
  align-self: end;
  padding-top: 8px;
  color: var(--text3);
  font-size: 10.5px;
  font-weight: 600;
}

.bar-column.peak small {
  color: var(--title);
  font-weight: 800;
}

/* =========================================================
   6. UBICACIÓN DE LA SUCURSAL (MAPA)
========================================================= */

.location-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

.location-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.branch-chip {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 15px;
}

.branch-chip-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
}

.branch-chip-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.branch-chip-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.branch-chip-copy small {
  color: var(--text3);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.branch-chip-copy strong {
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 17px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  padding: 11px 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--line);
}

.info-item:last-child {
  border-bottom: 0;
}

.info-item span {
  flex: none;
  color: var(--text3);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.info-item strong {
  min-width: 0;
  color: var(--title);
  font-size: 12.5px;
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
}

.info-item strong.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}

.directions-btn {
  height: 44px;
  margin-top: auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--color-texto-botones, #fff);
  text-decoration: none;
  background: var(--color-botones, var(--hl));
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 22%, transparent);
  transition: filter 0.2s ease, transform 0.2s var(--ease);
}

.directions-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.directions-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-stage {
  position: relative;
  min-width: 0;
  min-height: 340px;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  min-height: 340px;
  overflow: hidden;
  background: #161616;
  border: 1px solid var(--line2);
  border-radius: 16px;
  z-index: 1;
}

.map-style-switch {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  padding: 3px;
  display: flex;
  gap: 2px;
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid var(--line2);
  border-radius: 10px;
}

.map-style-switch button {
  padding: 6px 11px;
  color: var(--text2);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
}

.map-style-switch button.active {
  color: #fff;
  background: var(--hl);
}

.map-tools {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid var(--line2);
  border-radius: 10px;
}

.map-tools button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  font-size: 18px;
  line-height: 1;
}

.map-tools button:last-child {
  border-bottom: 0;
}

.map-tools button:hover {
  color: var(--hl);
  background: var(--hl-soft);
}

.map-tools svg {
  width: 16px;
  height: 16px;
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text2);
  background: #141414;
  border-radius: 16px;
  font-size: 12.5px;
}

.map-spinner {
  width: 14px;
  height: 14px;
  display: inline-block;
  flex: none;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: map-spin 0.8s linear infinite;
}

@keyframes map-spin {
  to { transform: rotate(360deg); }
}

/* ---------- Pin y controles de Leaflet ---------- */
:deep(.gym-pin) {
  background: transparent;
  border: 0;
}

:deep(.gym-pin-body) {
  position: relative;
  display: block;
  width: 34px;
  height: 34px;
  margin: 0 1px;
  background: var(--hl, #3b82f6);
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
  transform: rotate(-45deg);
}

:deep(.gym-pin-dot) {
  position: absolute;
  inset: 0;
  width: 10px;
  height: 10px;
  margin: auto;
  background: #fff;
  border-radius: 50%;
}

:deep(.leaflet-control-attribution) {
  color: #888 !important;
  background: rgba(15, 15, 15, 0.88) !important;
}

:deep(.leaflet-control-attribution a) {
  color: #9db8e8 !important;
}

:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) {
  color: #eee !important;
  background: #171717 !important;
}

/* =========================================================
   7. OPERACIÓN
========================================================= */

.tools {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tools-title {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text3);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.tools-title i {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, var(--line2), transparent);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.module-section {
  min-width: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.028), transparent 40%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
}

.section-header {
  padding-bottom: 14px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--line);
}

.section-header .section-eyebrow {
  margin-bottom: 4px;
  font-size: 9px;
}

.section-header h2 {
  font-size: 18px;
}

.action-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  width: 100%;
  min-height: 78px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: transform 0.25s var(--ease), border-color 0.2s ease, background 0.2s ease, box-shadow 0.25s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: var(--hl-line);
  background: var(--surface-hover);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.26);
}

.action-icon {
  width: 46px;
  height: 46px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line2);
  border-radius: 14px;
}

.action-icon.accent {
  color: var(--hl);
  background: var(--hl-soft);
  border-color: var(--hl-line);
}

.action-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.action-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-info strong {
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-info span {
  overflow: hidden;
  color: var(--text2);
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-arrow {
  width: 30px;
  height: 30px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.32);
  border-radius: 10px;
  transition: color 0.2s ease, background 0.2s ease, transform 0.25s var(--ease);
}

.action-arrow svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.action-card:hover .action-arrow {
  color: var(--hl);
  background: var(--hl-soft);
  transform: translateX(2px);
}

/* =========================================================
   MODALES
========================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.camera-panel {
  width: min(480px, 94vw);
  padding: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 35%),
    var(--card);
  border: 1px solid var(--line2);
  border-radius: 24px;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6);
}

.camera-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.camera-header span {
  color: var(--hl);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.camera-header h3 {
  margin: 4px 0 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 21px;
  font-weight: 600;
}

.camera-header button {
  width: 38px;
  height: 38px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line2);
  border-radius: 11px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.camera-header button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #000;
  border: 1px solid var(--line2);
  border-radius: 17px;
}

.camera-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  mask: radial-gradient(circle, transparent 49%, #000 50%);
}

.qr-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 210px;
  height: 210px;
  transform: translate(-50%, -50%);
  border: 2px solid var(--hl);
  border-radius: 16px;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5), 0 0 26px var(--hl-line);
}

.scanner-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: var(--hl);
  box-shadow: 0 0 12px var(--hl);
  animation: scan 2s infinite ease-in-out;
}

.camera-footer {
  text-align: center;
}

.camera-footer p {
  margin: 18px 0;
  color: var(--text2);
  font-size: 13px;
  line-height: 1.5;
}

.camera-footer button {
  width: 100%;
  padding: 13px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line2);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.camera-footer button:hover {
  background: rgba(255, 255, 255, 0.09);
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.22s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}

@keyframes scan {
  0%, 100% { top: 0; }
  50% { top: 100%; }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .modules-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .two-col {
    grid-template-columns: 1fr;
  }

  .kpi-card {
    padding: 18px;
    gap: 13px;
  }

  /* Mapa arriba y los datos debajo */
  .location-grid {
    grid-template-columns: 1fr;
  }

  .map-stage {
    order: -1;
    min-height: 320px;
  }

  .directions-btn {
    margin-top: 4px;
  }
}

@media (max-width: 760px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
   MÓVIL (≤ 680px)
========================================================= */

@media (max-width: 680px) {
  .dashboard-container {
    padding: 14px 12px 44px;
    gap: 14px;
  }

  /* ---- Encabezado compacto ---- */
  .hero {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 14px;
    border-radius: 20px;
  }

  .hero::after {
    right: -120px;
    bottom: -210px;
  }

  /* Con portada: la foto queda visible entre el recuadro y los botones */
  .hero.has-cover {
    min-height: 260px;
    align-content: space-between;
  }

  .hero-main {
    gap: 10px;
  }

  /* El logo sigue siendo del alto del panel, solo más compacto */
  .hero-logo {
    width: 104px;
    min-height: 88px;
    border-radius: 16px;
  }

  .hero.has-cover .hero-copy {
    padding: 12px 16px;
    border-radius: 18px;
  }

  .hero-copy h1 {
    font-size: 22px;
    line-height: 1.1;
    letter-spacing: -0.2px;
  }

  .hero-copy p {
    margin-top: 6px;
    font-size: 12px;
  }

  .hero-status {
    min-width: 0;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Abierto y Cuenta al corriente: mitad y mitad */
  .status-pill,
  .billing-pill {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    height: 36px;
    padding: 0 10px;
    font-size: 11px;
  }

  .membership-pill {
    flex: 1 1 100%;
    min-height: 50px;
    padding: 6px 14px 6px 8px;
  }

  .membership-icon {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }

  .membership-copy strong {
    font-size: 14px;
  }

  /* ---- Indicadores 2x2, en vertical ---- */
  .kpi-grid {
    gap: 9px;
  }

  .kpi-card {
    padding: 16px 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    border-radius: 17px;
  }

  .kpi-card::before {
    left: 14px;
    right: 14px;
  }

  .kpi-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  .kpi-icon svg {
    width: 18px;
    height: 18px;
  }

  .kpi-body {
    width: 100%;
    gap: 5px;
  }

  .kpi-body strong {
    font-size: 28px;
  }

  .kpi-body span {
    font-size: 9.5px;
  }

  /* ---- Paneles ---- */
  .panel {
    padding: 18px 15px;
    border-radius: 18px;
  }

  .panel-header {
    min-height: 0;
    margin-bottom: 14px;
    padding-bottom: 13px;
  }

  .panel-header h2 {
    font-size: 18px;
  }

  .alert-row {
    min-height: 56px;
    padding: 9px 11px 9px 14px;
    gap: 11px;
  }

  .finance-main {
    padding: 18px;
  }

  .finance-main strong {
    font-size: 38px;
  }

  /* ---- Acciones rápidas: mosaicos de 3 columnas ---- */
  .quick-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .quick-action {
    min-height: 96px;
    padding: 13px 6px 10px;
    flex-direction: column;
    justify-content: center;
    gap: 9px;
    text-align: center;
  }

  .quick-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .quick-copy {
    width: 100%;
    align-items: center;
  }

  .quick-copy strong {
    display: -webkit-box;
    font-size: 11px;
    line-height: 1.25;
    white-space: normal;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .quick-copy small {
    display: none;
  }

  /* ---- Actividad ---- */
  .activity-row {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .avatar {
    width: 38px;
    height: 38px;
  }

  .activity-row time {
    display: none;
  }

  /* ---- Gráfica ---- */
  .panel-header:has(.chart-summary) {
    flex-direction: column;
    gap: 10px;
  }

  .bar-chart {
    height: 160px;
    gap: 7px;
  }

  /* ---- Mapa ---- */
  .map-stage,
  .leaflet-map {
    min-height: 280px;
  }

  .map-style-switch {
    top: 10px;
    left: 10px;
  }

  .map-tools {
    top: 10px;
    right: 10px;
  }

  .branch-chip {
    padding: 10px 12px;
  }

  /* ---- Herramientas ---- */
  .tools {
    gap: 13px;
  }

  .modules-grid {
    gap: 14px;
  }

  .module-section {
    padding: 16px 14px;
    border-radius: 18px;
  }

  .action-card {
    min-height: 68px;
    padding: 10px 12px;
    gap: 12px;
    border-radius: 14px;
  }

  .action-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .action-info strong {
    font-size: 15px;
  }

  .action-info span {
    font-size: 11px;
  }

  /* ---- Modales ---- */
  .modal-overlay {
    padding: 8px;
  }

  .camera-panel {
    padding: 20px;
    border-radius: 20px;
  }

}

@media (max-width: 380px) {
  .hero-logo {
    width: 88px;
    min-height: 80px;
  }

  .hero-copy h1 {
    font-size: 20px;
  }

  .status-pill,
  .billing-pill {
    font-size: 10.5px;
  }

  .finance-stats {
    grid-template-columns: 1fr;
  }

  .finance-main strong {
    font-size: 34px;
  }

  .kpi-body strong {
    font-size: 24px;
  }

  .quick-grid {
    gap: 6px;
  }

  .quick-action {
    padding: 10px 4px 8px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-item strong {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}

.manager-empty{color:var(--text2);font-size:12px;padding:12px 0;}
</style>
<style scoped>
.map-stage .google-map-frame { display: block; width: 100%; height: 100%; min-height: 340px; border: 1px solid var(--line2); border-radius: 16px; background: #161616; }
.identity-error { margin: 0; padding: 10px 16px; border-radius: 10px; color: #fca5a5; background: rgba(127,29,29,.16); font-size: 12px; }
.action-card:disabled { opacity: .6; cursor: not-allowed; }
</style>
