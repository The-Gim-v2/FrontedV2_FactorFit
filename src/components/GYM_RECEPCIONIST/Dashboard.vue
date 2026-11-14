<template>
  <HeadingAdmin :isGymOpen="isGymOpen" :billingStatus="billingStatus">
    <div class="dashboard">
      <main class="dashboard-container">

        <!-- 1. ENCABEZADO + HOY -->
        <section class="hero-row">
          <div
            class="hero"
            :class="{ 'has-cover': !!gym.coverUrl }"
            :style="heroStyle"
            id="tutorial-step-0"
          >
            <div class="hero-main">
              <!-- Logo: fuera del panel, al lado, con la misma altura que el panel -->
              <div v-if="gym.logoUrl" class="hero-logo">
                <img :src="gym.logoUrl" :alt="gym.name" />
              </div>

              <!-- Panel de texto -->
              <div class="hero-copy">
                <h1>
                  <template v-for="(w, i) in nameWords" :key="i">
                    <span v-if="i === highlightIndex">{{ w }}</span>
                    <template v-else>{{ w }}</template>{{ ' ' }}
                  </template>
                </h1>
                <p>{{ ui.receptionPanel }}</p>
              </div>
            </div>

            <div class="hero-status">
              <button
                type="button"
                class="status-pill"
                :class="isGymOpen ? 'open' : 'closed'"
                disabled
                title="Estado del gimnasio: solo consulta"
              >
                <span class="status-dot"></span>
                {{ isGymOpen ? t.gymAbierto : t.gymCerrado }}
              </button>

              <div class="billing-pill" :class="billingStatus">
                <span class="billing-dot"></span>
                {{ billingStatusText }}
              </div>
            </div>
          </div>

          <div class="today-card" id="tutorial-step-1">
            <div class="today-cell">
              <div class="kpi-icon">
                <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <strong>{{ todayEntries }}</strong>
              <span>{{ t.entradasHoy }}</span>
            </div>

            <div class="today-cell">
              <div class="kpi-icon accent">
                <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/></svg>
              </div>
              <strong class="highlight">{{ insideCount }}</strong>
              <span>{{ t.enInstalaciones }}</span>
            </div>

            <div class="today-cell">
              <div class="kpi-icon warning">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              </div>
              <strong>{{ metricasCargadas ? expiring.length : '—' }}</strong>
              <span>{{ t.porVencer }}</span>
            </div>
          </div>
        </section>

        <!-- 2. CONTROL DE ACCESO -->
        <section class="access-section" id="tutorial-step-2">
          <div class="section-title-row">
            <span class="section-eyebrow">{{ ui.operation }}</span>
            <h2>{{ t.controlAcceso }}</h2>
          </div>

          <div class="access-grid">
            <button type="button" class="access-card" disabled aria-disabled="true" title="Próximamente: reconocimiento facial">
              <span class="access-icon">
                <svg viewBox="0 0 24 24"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/></svg>
              </span>
              <span class="access-copy">
                <strong>{{ t.asistenciaFacial }}</strong>
                <small>{{ t.reconocimientoBio }}</small>
              </span>
              <span class="access-arrow">
                <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </button>

            <button type="button" class="access-card qr" @click="activeModal = 'scanner'">
              <span class="access-icon">
                <svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h3v2h-3zM18 13h2v2h-2zM13 17h2v3h-2zM17 17h3v3h-3z"/></svg>
              </span>
              <span class="access-copy">
                <strong>{{ t.escanerQr }}</strong>
                <small>{{ t.validacionPase }}</small>
              </span>
              <span class="access-arrow">
                <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </button>
          </div>
        </section>

        <!-- 3. ACCESOS DIRECTOS -->
        <section class="shortcuts">
          <div class="shortcut-grid">
            <button
              v-for="action in quickActions"
              :key="action.label"
              type="button"
              class="shortcut"
              @click="onShortcut(action)"
            >
              <span class="shortcut-icon">
                <svg viewBox="0 0 24 24"><path :d="action.icon"/></svg>
              </span>
              <span class="shortcut-copy">
                <strong>{{ action.label }}</strong>
                <small>{{ action.description }}</small>
              </span>
            </button>
          </div>
        </section>

        <!-- 4. ACCESOS RECIENTES + POR VENCER -->
        <section class="two-col">
          <article class="panel">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.today }}</span>
                <h2>{{ ui.recentAccess }}</h2>
              </div>
              <button type="button" class="link-btn" @click="go('/GYM_RECEPCIONIST/view-clients')">{{ ui.viewClients }} →</button>
            </div>

            <div class="row-list">
              <div
                v-for="item in recentAccess"
                :key="item.name + item.time"
                class="list-row"
              >
                <div class="avatar" :class="item.method">{{ item.initials }}</div>
                <div class="row-info">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.text }}</span>
                </div>
                <time>{{ item.time }}</time>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.attention }}</span>
                <h2>{{ ui.expiringTitle }}</h2>
              </div>
              <span class="count-chip">{{ expiring.length }}</span>
            </div>

            <div class="row-list">
              <div
                v-for="item in expiring"
                :key="item.id"
                class="list-row"
              >
                <div class="avatar" :class="item.level">{{ item.initials }}</div>
                <div class="row-info">
                  <strong>{{ item.name }}</strong>
                  <span>
                    {{ item.plan }} ·
                    <b class="due" :class="item.level">{{ item.due }}</b>
                  </span>
                </div>
                <button type="button" class="pay-btn" @click="go('/GYM_RECEPCIONIST/pay/' + item.id)">
                  {{ ui.charge }}
                </button>
              </div>
            </div>
          </article>
        </section>

        <!-- 5. UBICACIÓN DE LA SUCURSAL (MAPA) -->
        <section class="map-panel" :class="{ expanded: mapExpanded }">
          <!-- Mapa a pantalla completa del panel -->
          <div class="map-canvas">
            <iframe v-if="googleMapEmbedUrl" :key="`${sedeId()}-${googleMapEmbedUrl}`" class="google-map-frame" :src="googleMapEmbedUrl" :title="`Mapa de ${gym.location.branchName}`" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div v-else class="map-empty">{{ loadingIdentity ? ui.mapLoading : (identityError || 'Ubicación no registrada para esta sede.') }}</div>

            <div class="map-tools">
              <button type="button" :title="mapExpanded ? ui.collapseMap : ui.expandMap" @click="toggleExpand">
                {{ mapExpanded ? '−' : '+' }}
              </button>
            </div>
          </div>

          <!-- Tarjeta flotante con los datos de la sucursal -->
          <div class="map-card">
            <div class="map-card-head">
              <div class="map-card-icon">
                <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="map-card-title">
                <span class="section-eyebrow">{{ ui.location }}</span>
                <h2>{{ gym.location.branchName }}</h2>
              </div>
            </div>

            <span class="open-chip" :class="isGymOpen ? 'open' : 'closed'">
              <span class="status-dot"></span>
              {{ isGymOpen ? t.gymAbierto : t.gymCerrado }}
            </span>

            <address class="map-address">
              <strong>{{ addressStreet || 'Dirección no registrada' }}</strong>
              <span>{{ gym.location.neighborhood || 'Colonia no registrada' }} · C.P. {{ gym.location.zip || 'No registrado' }}</span>
              <span>{{ [gym.location.city, gym.location.state].filter(Boolean).join(', ') || 'Municipio y estado no registrados' }}</span>
            </address>

            <div class="map-card-actions">
              <a v-if="hasLocation" class="directions-btn" :href="directionsUrl" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                {{ ui.openInMaps }}
              </a>

              <button type="button" class="copy-btn" :disabled="!hasLocation" :class="{ done: addressCopied }" @click="copyAddress">
                <svg v-if="!addressCopied" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
                <svg v-else viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
                {{ addressCopied ? ui.copied : ui.copyAddress }}
              </button>
            </div>
          </div>
        </section>

        <!-- 6. HORARIOS (menos frecuente) -->
        <section class="tools" id="tutorial-step-3">
          <div class="tools-title">
            <span>{{ t.adminTurnos }}</span>
            <i></i>
          </div>

          <div class="tools-grid">
            <button type="button" class="action-card" @click="activeModal = 'add-schedule'">
              <div class="action-icon">
                <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18M8 13h3v3H8z"/></svg>
              </div>
              <div class="action-info">
                <strong>{{ t.anadirHorario }}</strong>
                <span>{{ t.gestionTurnos }}</span>
              </div>
              <ArrowIcon />
            </button>

            <button type="button" class="action-card" @click="activeModal = 'view-schedule'">
              <div class="action-icon">
                <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </div>
              <div class="action-info">
                <strong>{{ t.verHorario }}</strong>
                <span>{{ t.calendarioActivo }}</span>
              </div>
              <ArrowIcon />
            </button>
          </div>
        </section>
      </main>

      <!-- MODALES -->
      <transition name="pop">
        <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
          <AddScheduleModal v-if="activeModal === 'add-schedule'" @close="closeModal" />
          <ViewScheduleModal v-if="activeModal === 'view-schedule'" @close="closeModal" />

          <Promo
            v-if="activeModal === 'promo'"
            @select-oferta="closeModal"
            @close="closeModal"
          />

          <AccessAttendanceModal v-if="activeModal === 'scanner'" mode="scanner" :sede-id="sedeId()" @close="closeModal" @registered="onAttendanceRegistered" />
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
import AccessAttendanceModal from '../Modals/AccessAttendanceModal.vue';
import HeadingAdmin from './HeadingGYM_RECEPCIONIST.vue';
// Ajusta esta ruta a donde tengas Promos.vue
import Promo from './Payments/Promos.vue';

const router = useRouter();

const currentLang = ref(localStorage.getItem('GYM_RECEPCIONIST-idioma') || 'es');
const activeModal = ref(null);
const videoPlayer = ref(null);
const isGymOpen = ref(true);
const billingStatus = ref('active');

let stream = null;

/* =========================================================
   DATOS DEL GIMNASIO (encabezado y ubicación)
   Cuando vengan del backend solo hay que llenar estos campos:
   - logoUrl:  logo del gimnasio (opcional)
   - coverUrl: foto de fondo del encabezado (opcional)
   - location: dirección y coordenadas de la sucursal
========================================================= */

const gym = ref({
  name: 'Mi gimnasio', logoUrl: null, coverUrl: null,
  location: { branchName: '', street: '', number: '', neighborhood: '', city: '', state: '', zip: '', lat: null, lng: null }
});
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const route = useRoute();
const activeSede = ref(0);
const loadingIdentity = ref(false);
const identityError = ref('');
let identityRequest = 0;
const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const name of ['auth_token', 'token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken']) {
      const value = storage.getItem(name);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const name of ['auth', 'user', 'session', 'gymAccount', 'gym_account']) {
      try {
        const value = JSON.parse(storage.getItem(name) || 'null');
        const token = value?.token || value?.access_token || value?.accessToken;
        if (token) return String(token).replace(/^Bearer\s+/i, '');
      } catch { /* No es JSON. */ }
    }
  }
  return '';
};
const sessionSedes = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['gym_account', 'user', 'auth', 'session']) {
      try {
        const data = JSON.parse(storage.getItem(key) || 'null');
        const listas = [data?.usuario?.sedes, data?.sedes, data?.user?.sedes, data?.data?.usuario?.sedes];
        const sedes = listas.find(list => Array.isArray(list) && list.length);
        if (sedes) return sedes;
      } catch { /* La sesión de esta clave no está disponible. */ }
    }
  }
  return [];
};
const sessionBranchId = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['gym_account', 'user', 'auth', 'session']) {
      try {
        const data = JSON.parse(storage.getItem(key) || 'null');
        const id = Number(data?.usuario?.sede_id ?? data?.usuario?.ID_Sede ?? data?.sede_id ?? data?.ID_Sede ?? data?.user?.sede_id);
        if (Number.isInteger(id) && id > 0) return id;
      } catch { /* Ignorar. */ }
    }
  }
  return 0;
};
const authorizedIds = () => sessionSedes().map(s => Number(s.ID_Sede ?? s.id ?? s.sede_id)).filter(id => Number.isInteger(id) && id > 0);
const permitted = (id) => Number.isInteger(id) && id > 0 && (!authorizedIds().length || authorizedIds().includes(id));
const storedSede = () => {
  const assigned = sessionBranchId();
  if (permitted(assigned)) return assigned;
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['selected_sede_id', 'sede_id', 'ID_Sede', 'selectedSedeId']) {
      const raw = storage.getItem(key);
      const id = Number(raw);
      if (permitted(id)) return id;
    }
  }
  return authorizedIds()[0] || 0;
};
const sedeId = () => {
  if (permitted(activeSede.value)) return activeSede.value;
  const query = Number(route.query.sede_id);
  return permitted(query) ? query : storedSede();
};
const persistBranchId = (id) => {
  if (!permitted(id)) return;
  activeSede.value = id;
  sessionStorage.setItem('selected_sede_id', String(id));
};
const resolveBranchFromApi = async () => {
  if (sedeId()) return sedeId();
  const token = getToken();
  if (!token) return 0;
  try {
    const response = await fetch(`${API}/api/auth/me`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) return 0;
    const data = await response.json();
    const sedes = data.sedes || data.usuario?.sedes || [];
    const asignada = Number(data.sede_id ?? data.ID_Sede ?? data.usuario?.sede_id ?? sedes[0]?.ID_Sede ?? 0);
    if (Number.isInteger(asignada) && asignada > 0 && (!sedes.length || sedes.some(s => Number(s.ID_Sede) === asignada))) {
      persistBranchId(asignada);
      return asignada;
    }
  } catch (error) { console.warn('No se pudo recuperar la sede de la sesión:', error); }
  return 0;
};
const loadGymIdentity = async () => {
  const seq = ++identityRequest;
  const id = sedeId() || await resolveBranchFromApi();
  loadingIdentity.value = true;
  identityError.value = '';
  if (!id) {
    identityError.value = 'Selecciona una sede para consultar su ubicación.';
    loadingIdentity.value = false;
    return;
  }
  try {
    const token = getToken();
    if (!token) throw new Error('No se encontró la sesión de recepción.');
    const response = await fetch(`${API}/api/gym/identidad-visual?sede_id=${id}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.message || `Error HTTP ${response.status}`);
    if (seq !== identityRequest) return;
    const info = data.gimnasio || {};
    const branch = data.sede || {};
    gym.value = {
      name: String(info.nombre || 'Mi gimnasio'),
      logoUrl: info.logo_url || null, coverUrl: info.portada_url || null,
      location: {
        branchName: String(branch.nombre || `Sede ${id}`),
        street: String(branch.calle || ''), number: String(branch.numero_ext || ''),
        neighborhood: String(branch.colonia || ''), city: String(branch.municipio || ''),
        state: String(branch.entidad || ''), zip: String(branch.codigo_postal || ''),
        lat: branch.latitud ?? null, lng: branch.longitud ?? null
      }
    };
  } catch (error) {
    if (seq === identityRequest) identityError.value = error?.message || 'No se pudo cargar la información del gimnasio.';
  } finally {
    if (seq === identityRequest) loadingIdentity.value = false;
  }
};
const onBranchChanged = (event) => {
  const detail = event.detail || {};
  const branch = detail.sede && typeof detail.sede === 'object' ? detail.sede : {};
  const id = Number(detail.sede_id ?? detail.ID_Sede ?? detail.id ?? detail.sedeId ?? branch.ID_Sede ?? detail.sede?.id ?? storedSede());
  if (permitted(id)) persistBranchId(id);
  void loadGymIdentity();
  void loadMetrics();
};
const onGymProfileUpdated = (event) => {
  const id = Number(event.detail?.sede_id || 0);
  if (!id || id === sedeId()) void loadGymIdentity();
};
const onTabVisible = () => { if (document.visibilityState === 'visible') { void loadGymIdentity(); void loadMetrics(); } };
watch(() => route.query.sede_id, () => { activeSede.value = 0; void loadGymIdentity(); void loadMetrics(); });

const nameWords = computed(() => gym.value.name.trim().toUpperCase().split(/\s+/));

/* Palabra resaltada con el color de acento: la segunda del nombre */
const highlightIndex = computed(() => (nameWords.value.length > 1 ? 1 : 0));

const heroStyle = computed(() =>
  gym.value.coverUrl ? { '--cover': `url('${gym.value.coverUrl}')` } : {}
);

/* =========================================================
   UTILIDADES
========================================================= */

const ArrowIcon = () =>
  h('div', { class: 'action-arrow' }, [
    h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'm9 18 6-6-6-6' })])
  ]);

const go = (path) => router.push(path);

/* Accesos directos: si traen "modal" abren modal, si no navegan */
const onShortcut = (action) => {
  if (action.modal) {
    activeModal.value = action.modal;
  } else {
    go(action.route);
  }
};

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
    receptionPanel: 'Panel de recepción',
    operation: 'OPERACIÓN',
    accessControl: 'CONTROL DE ACCESO',
    today: 'HOY',
    attention: 'ATENCIÓN',
    recentAccess: 'Accesos recientes',
    expiringTitle: 'Membresías por vencer',
    viewClients: 'Ver clientes',
    charge: 'Cobrar',
    cameraError: 'No se pudo acceder a la cámara. Verifica los permisos.',
    location: 'UBICACIÓN',
    openInMaps: 'Cómo llegar',
    copyAddress: 'Copiar dirección',
    copied: 'Copiada',
    mapStreets: 'Calles',
    mapSatellite: 'Satélite',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    centerMap: 'Centrar en la sede',
    expandMap: 'Agrandar mapa',
    collapseMap: 'Reducir mapa',
    mapLoading: 'Cargando mapa…'
  },
  en: {
    receptionPanel: 'Reception panel',
    operation: 'OPERATIONS',
    accessControl: 'ACCESS CONTROL',
    today: 'TODAY',
    attention: 'ATTENTION',
    recentAccess: 'Recent check-ins',
    expiringTitle: 'Expiring memberships',
    viewClients: 'View clients',
    charge: 'Charge',
    cameraError: 'Camera access failed. Check your permissions.',
    location: 'LOCATION',
    openInMaps: 'Get directions',
    copyAddress: 'Copy address',
    copied: 'Copied',
    mapStreets: 'Streets',
    mapSatellite: 'Satellite',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    centerMap: 'Center on the branch',
    expandMap: 'Enlarge map',
    collapseMap: 'Shrink map',
    mapLoading: 'Loading map…'
  }
};

const ui = computed(
  () => dashboardTranslations[currentLang.value] || dashboardTranslations.es
);

/* =========================================================
   DATOS (de prueba)
========================================================= */

const inscripciones = ref([]);
const asistencias = ref([]);
const metricasCargadas = ref(false);
const accesosCargados = ref(false);
const alertasControl = ref([]);
const currentDateMX = () => { const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Monterrey', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); const part = name => parts.find(p => p.type === name)?.value || ''; return `${part('year')}-${part('month')}-${part('day')}`; };
const todayEntries = computed(() => accesosCargados.value ? new Set(asistencias.value.filter(a => String(a.fecha || '').slice(0, 10) === currentDateMX()).map(a => Number(a.ID_Inscripto))).size : '—');
// La API de asistencia semanal NO indica quién sigue dentro del gimnasio.
const insideCount = computed(() => '—');
const expiring = computed(() => !metricasCargadas.value ? [] : inscripciones.value.filter(r => r.estatus_inscripcion === 'Próximo a vencer').slice(0, 8).map(r => {
  const nombre = String(r.nombre || 'Cliente');
  const initials = nombre.trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
  return { id: Number(r.ID_Inscripto), initials, name: nombre, plan: r.paquete || r.Nombre_Paquete || 'Membresía', due: r.fecha_vencimiento || 'Próximo a vencer', level: 'warning' };
}));
const recentAccess = computed(() => !accesosCargados.value ? [] : [...asistencias.value].filter(r => r.fecha).reverse().slice(0, 6).map(r => {
  const ins = inscripciones.value.find(i => Number(i.ID_Inscripto) === Number(r.ID_Inscripto));
  const name = String(ins?.nombre || 'Cliente');
  return { initials: name.trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase(), name, text: currentLang.value === 'en' ? 'Registered attendance' : 'Asistencia registrada', time: String(r.fecha), method: 'qr' };
}));
const loadMetrics = async () => {
  const id = sedeId() || await resolveBranchFromApi();
  if (!id) return;
  const token = getToken();
  if (!token) return;
  const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  const endpoints = [`/api/gym/ingresos?sede_id=${id}`, `/api/gym/asistencias-semana?sede_id=${id}`];
  const results = await Promise.allSettled(endpoints.map(async path => {
    const response = await fetch(`${API}${path}`, { headers, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`);
    return data;
  }));
  if (id !== sedeId()) return;
  if (results[0].status === 'fulfilled' && Array.isArray(results[0].value.inscripciones)) {
    inscripciones.value = results[0].value.inscripciones;
    metricasCargadas.value = true;
  } else { inscripciones.value = []; metricasCargadas.value = false; }
  if (results[1].status === 'fulfilled' && Array.isArray(results[1].value.asistencias)) {
    asistencias.value = results[1].value.asistencias;
    accesosCargados.value = true;
  } else { asistencias.value = []; accesosCargados.value = false; }
};
/* icon = path de un SVG de 24x24 */
const quickActions = computed(() => {
  const icons = {
    register: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',
    clients: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    payment: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    promo: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01'
  };

  return currentLang.value === 'es'
    ? [
        { label: 'Registrar cliente', description: 'Nueva membresía', route: '/GYM_RECEPCIONIST/register-clients', icon: icons.register },
        { label: 'Ver clientes', description: 'Consultar y editar', route: '/GYM_RECEPCIONIST/view-clients', icon: icons.clients },
        { label: 'Registrar pago', description: 'Cobrar membresía', route: '/GYM_RECEPCIONIST/payments', icon: icons.payment },
        { label: 'Promociones', description: 'Descuentos activos', modal: 'promo', icon: icons.promo }
      ]
    : [
        { label: 'Register client', description: 'New membership', route: '/GYM_RECEPCIONIST/register-clients', icon: icons.register },
        { label: 'View clients', description: 'Search and edit', route: '/GYM_RECEPCIONIST/view-clients', icon: icons.clients },
        { label: 'Register payment', description: 'Charge membership', route: '/GYM_RECEPCIONIST/payments', icon: icons.payment },
        { label: 'Promotions', description: 'Active discounts', modal: 'promo', icon: icons.promo }
      ];
});

/* =========================================================
   ESTADO DEL GIMNASIO
========================================================= */

const billingStatusText = computed(() => {
  if (billingStatus.value === 'active') return t.value.cuentaCorriente;
  if (billingStatus.value === 'pending') return t.value.pendientePago;
  return t.value.bloqueadoPago;
});

const toggleGymStatus = () => {
  isGymOpen.value = !isGymOpen.value;
  localStorage.setItem('isGymOpen', JSON.stringify(isGymOpen.value));
};

/* =========================================================
    GOOGLE MAPS: coordenadas reales o dirección registrada
========================================================= */
const mapExpanded = ref(false);
const addressCopied = ref(false);
let copyTimer = null;
const coords = computed(() => {
  const latitude = gym.value.location.lat, longitude = gym.value.location.lng;
  const lat = latitude == null || latitude === '' ? NaN : Number(latitude);
  const lng = longitude == null || longitude === '' ? NaN : Number(longitude);
  return { lat, lng };
});
const validCoords = computed(() => Number.isFinite(coords.value.lat) && Number.isFinite(coords.value.lng) && Math.abs(coords.value.lat) <= 90 && Math.abs(coords.value.lng) <= 180 && !(coords.value.lat === 0 && coords.value.lng === 0));
const addressStreet = computed(() => [gym.value.location.street, gym.value.location.number && `#${gym.value.location.number}`].filter(Boolean).join(' '));
const fullAddress = computed(() => [addressStreet.value, gym.value.location.neighborhood, gym.value.location.city, gym.value.location.state, gym.value.location.zip, 'México'].filter(Boolean).join(', '));
const mapQuery = computed(() => validCoords.value ? `${coords.value.lat},${coords.value.lng}` : (gym.value.location.city || gym.value.location.street ? fullAddress.value : ''));
const hasLocation = computed(() => !!mapQuery.value);
const googleMapEmbedUrl = computed(() => hasLocation.value ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery.value)}&z=16&output=embed` : '');
const directionsUrl = computed(() => hasLocation.value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery.value)}` : '#');
const toggleExpand = () => { mapExpanded.value = !mapExpanded.value; };
const copyAddress = async () => {
  if (!hasLocation.value) return;
  try {
    await navigator.clipboard.writeText(fullAddress.value);
    addressCopied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { addressCopied.value = false; }, 2000);
  } catch (error) { console.warn('No se pudo copiar la dirección.', error); }
};
const onAttendanceRegistered = () => { void loadGymIdentity(); void loadMetrics(); };

/* =========================================================
   IDIOMA
========================================================= */

const handleLangChange = (event) => {
  if (event.detail?.idioma) {
    currentLang.value = event.detail.idioma;
  }
};

/* =========================================================
    MODALES
========================================================= */
const closeModal = () => { activeModal.value = null; };
const handleKeydown = (event) => { if (event.key === 'Escape' && activeModal.value) closeModal(); };

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
  void loadMetrics();
});
onUnmounted(() => {
  identityRequest++;
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('factorfit:branch-changed', onBranchChanged);
  window.removeEventListener('sede-changed', onBranchChanged);
  window.removeEventListener('factorfit:gym-profile-updated', onGymProfileUpdated);
  document.removeEventListener('visibilitychange', onTabVisible);
  if (copyTimer) clearTimeout(copyTimer);
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
  --line: rgba(255, 255, 255, 0.08);
  --line2: rgba(255, 255, 255, 0.14);
  --title: var(--color-titulos, #fff);
  --text2: rgba(245, 245, 244, 0.63);
  --text3: rgba(245, 245, 244, 0.43);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: calc(100vh - 65px);
  background: var(--bg-custom, var(--color-interfaz, #090909));
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.dashboard-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 32px 56px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.eyebrow,
.section-eyebrow {
  display: block;
  margin-bottom: 6px;
  color: var(--hl);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.highlight {
  color: var(--hl) !important;
}

/* =========================================================
   1. ENCABEZADO + HOY
========================================================= */

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 18px;
}

.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 30px;
  background:
    radial-gradient(circle at 100% 0%, var(--hl-soft), transparent 55%),
    linear-gradient(140deg, var(--card), rgba(14, 14, 14, 0.92));
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.3);
}

.hero::after {
  content: '';
  position: absolute;
  right: -90px;
  bottom: -170px;
  width: 280px;
  height: 280px;
  border: 1px solid var(--hl-soft);
  border-radius: 50%;
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

.hero-copy h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(24px, 2.8vw, 34px);
  line-height: 1.1;
}

.hero-copy h1 span {
  color: var(--hl);
  text-shadow: 0 0 30px var(--hl-line);
}

.hero-copy p {
  margin: 8px 0 0;
  color: var(--text2);
  font-size: 13.5px;
}

.hero-status {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 190px;
}

.status-pill,
.billing-pill {
  height: 36px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

.status-pill {
  cursor: pointer;
  transition: filter 0.15s ease;
}

.status-pill:hover {
  filter: brightness(1.15);
}

.status-pill.open,
.billing-pill.active {
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.status-pill.closed,
.billing-pill.blocked {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.billing-pill.pending {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.status-dot,
.billing-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 9px currentColor;
}

/* ---------- Encabezado con foto de portada ---------- */

.hero.has-cover {
  background: var(--cover) center / cover no-repeat, var(--card);
}

/* Velo suave: oscurece lo justo para que la foto siga luciendo */
.hero.has-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.08) 70%);
  pointer-events: none;
}

.hero.has-cover::after {
  display: none;
}

/* Contenedor ajustado a su contenido, sin fondo propio */
.hero.has-cover .hero-main {
  flex: 0 1 auto;
  max-width: 100%;
}

/* El recuadro de cristal es solo el panel de texto */
.hero.has-cover .hero-copy {
  padding: 16px 24px;
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

/* ---------- Tarjeta "Hoy" ---------- */

.today-card {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  padding: 18px 6px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.today-cell {
  min-width: 0;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-align: center;
}

.today-cell + .today-cell {
  border-left: 1px solid var(--line);
}

.today-cell strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 30px;
  line-height: 1;
}

.today-cell > span {
  max-width: 100%;
  color: var(--text3);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.kpi-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 11px;
}

.kpi-icon.accent { color: var(--hl); background: var(--hl-soft); }
.kpi-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.kpi-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   2. CONTROL DE ACCESO
========================================================= */

.access-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title-row .section-eyebrow {
  margin-bottom: 3px;
  font-size: 9px;
}

.section-title-row h2,
.panel-header h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 19px;
  font-weight: 600;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.access-card {
  --tint: var(--hl);
  --tint-soft: color-mix(in srgb, var(--tint) 14%, transparent);
  --tint-line: color-mix(in srgb, var(--tint) 42%, transparent);

  position: relative;
  min-height: 130px;
  padding: 22px 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 20px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background:
    radial-gradient(circle at 0% 0%, var(--tint-soft), transparent 62%),
    var(--card);
  border: 1px solid var(--tint-line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.access-card.qr {
  --tint: #a78bfa;
}

.access-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.35);
  border-color: var(--tint);
}

.access-icon {
  width: 64px;
  height: 64px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tint);
  background: var(--tint-soft);
  border: 1px solid var(--tint-line);
  border-radius: 18px;
}

.access-icon svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.access-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.access-copy strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 21px;
  font-weight: 600;
}

.access-copy small {
  color: var(--text2);
  font-size: 12.5px;
}

.access-arrow {
  width: 38px;
  height: 38px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tint);
  background: var(--tint-soft);
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.access-card:hover .access-arrow {
  transform: translateX(3px);
}

.access-arrow svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   3. ACCESOS DIRECTOS
========================================================= */

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.shortcut {
  min-height: 74px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.shortcut:hover {
  transform: translateY(-2px);
  border-color: var(--hl-line);
  background: var(--hl-soft);
}

.shortcut-icon {
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
}

.shortcut-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.shortcut-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.shortcut-copy strong {
  overflow: hidden;
  color: var(--title);
  font-size: 12.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shortcut-copy small {
  overflow: hidden;
  color: var(--text3);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   4. LISTAS
========================================================= */

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel {
  min-width: 0;
  padding: 22px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.panel-header {
  min-height: 42px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.panel-header .section-eyebrow {
  margin-bottom: 3px;
  font-size: 9px;
}

.link-btn {
  padding: 3px 0;
  color: var(--hl);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  background: none;
  border: 0;
  white-space: nowrap;
}

.link-btn:hover {
  text-decoration: underline;
}

.count-chip {
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
}

.row-list {
  display: flex;
  flex-direction: column;
}

.list-row {
  min-height: 60px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--line);
}

.list-row:first-child {
  border-top: 0;
}

.avatar {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--hl);
  border-radius: 11px;
  font-size: 11px;
  font-weight: 800;
}

.avatar.qr { background: #7c3aed; }
.avatar.danger { background: #dc2626; }
.avatar.warning { background: #d97706; }

.row-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-info strong {
  overflow: hidden;
  color: var(--title);
  font-size: 12.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-info span {
  overflow: hidden;
  color: var(--text3);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-row time {
  color: var(--text3);
  font-size: 10.5px;
  white-space: nowrap;
}

.due {
  font-weight: 700;
}

.due.danger { color: #f87171; }
.due.warning { color: #fbbf24; }

.pay-btn {
  padding: 8px 14px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, #2563eb);
  border: 0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  transition: filter 0.15s ease, transform 0.15s ease;
}

.pay-btn:hover {
  filter: brightness(1.12);
  transform: translateY(-1px);
}

/* =========================================================
   5. UBICACIÓN DE LA SUCURSAL (MAPA)
========================================================= */

.map-panel {
  position: relative;
  height: 420px;
  overflow: hidden;
  background: var(--card);
  border: 1px solid var(--line2);
  border-radius: 22px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.3);
  transition: height 0.35s var(--ease);
}

.map-panel.expanded {
  height: 620px;
}

/* El mapa ocupa todo el panel; la tarjeta flota encima */
.map-canvas {
  position: absolute;
  inset: 0;
}

.google-map-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #161616;
}
.map-empty {
  display: grid;
  place-items: center;
  min-height: 100%;
  padding: 24px;
  text-align: center;
  color: #d5d5d5;
}

.map-card {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 6;
  width: 320px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(10, 10, 10, 0.84);
  border: 1px solid var(--line2);
  border-radius: 18px;
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.map-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map-card-icon {
  width: 42px;
  height: 42px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
}

.map-card-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-card-title {
  min-width: 0;
}

.map-card-title .section-eyebrow {
  margin-bottom: 2px;
  font-size: 9px;
}

.map-card-title h2 {
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.open-chip {
  align-self: flex-start;
  padding: 5px 11px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.open-chip.open {
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.open-chip.closed {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.map-address {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-style: normal;
}

.map-address strong {
  color: var(--title);
  font-size: 14px;
  line-height: 1.35;
}

.map-address span {
  color: var(--text2);
  font-size: 12px;
  line-height: 1.4;
}

.map-card-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.directions-btn,
.copy-btn {
  height: 42px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: filter 0.2s ease, transform 0.2s var(--ease), background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.directions-btn {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 24%, transparent);
}

.directions-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.copy-btn {
  color: var(--title);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line2);
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.copy-btn.done {
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.35);
}

.directions-btn svg,
.copy-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Controles sobre el mapa */
.map-tools {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid var(--line2);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.map-tools button {
  width: 38px;
  height: 38px;
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
  transition: background 0.2s ease, color 0.2s ease;
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

.map-style-switch {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 5;
  padding: 3px;
  display: flex;
  gap: 2px;
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid var(--line2);
  border-radius: 11px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.map-style-switch button {
  padding: 7px 13px;
  color: var(--text2);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease;
}

.map-style-switch button.active {
  color: #fff;
  background: var(--hl);
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text2);
  background: #141414;
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

/* ---------- Pin con pulso y controles de Leaflet ---------- */
:deep(.gym-pin) {
  background: transparent;
  border: 0;
}

:deep(.gym-pin-body) {
  position: relative;
  z-index: 2;
  display: block;
  width: 34px;
  height: 34px;
  margin: 0 1px;
  background: var(--hl, #3b82f6);
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
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

/* Anillo que late bajo la punta del pin */
:deep(.gym-pin-pulse) {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  width: 26px;
  height: 26px;
  margin-left: -13px;
  margin-bottom: -10px;
  background: color-mix(in srgb, var(--hl, #3b82f6) 45%, transparent);
  border-radius: 50%;
  transform: scale(0.4);
  animation: pin-pulse 2.2s ease-out infinite;
}

@keyframes pin-pulse {
  0%   { opacity: 0.9; transform: scale(0.4); }
  100% { opacity: 0;   transform: scale(2.6); }
}

:deep(.leaflet-control-attribution) {
  color: #888 !important;
  background: rgba(15, 15, 15, 0.88) !important;
}

:deep(.leaflet-control-attribution a) {
  color: #9db8e8 !important;
}

/* =========================================================
   6. HORARIOS
========================================================= */

.tools {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tools-title {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--text3);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.tools-title i {
  height: 1px;
  flex: 1;
  background: var(--line);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.action-card {
  width: 100%;
  min-height: 78px;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: var(--hl-line);
  background: rgba(255, 255, 255, 0.025);
}

.action-icon {
  width: 44px;
  height: 44px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
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
  gap: 3px;
}

.action-info strong {
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 15.5px;
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
  width: 28px;
  height: 28px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 9px;
  transition: color 0.2s ease, background 0.2s ease;
}

.action-arrow svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.action-card:hover .action-arrow {
  color: var(--hl);
  background: var(--hl-soft);
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
  background: rgba(0, 0, 0, 0.84);
}

.camera-panel {
  width: min(460px, 94vw);
  padding: 25px;
  background: var(--card);
  border: 1px solid var(--line2);
  border-radius: 21px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.camera-header {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.camera-header span {
  color: var(--hl);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
}

.camera-header h3 {
  margin: 4px 0 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
}

.camera-header button {
  width: 37px;
  height: 37px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 21px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #000;
  border: 1px solid var(--line2);
  border-radius: 15px;
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
  border-radius: 15px;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
}

.scanner-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: var(--hl);
  box-shadow: 0 0 10px var(--hl);
  animation: scan 2s infinite ease-in-out;
}

.camera-footer {
  text-align: center;
}

.camera-footer p {
  margin: 17px 0;
  color: var(--text2);
  font-size: 13px;
}

.camera-footer button {
  width: 100%;
  padding: 12px;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--line2);
  border-radius: 10px;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s;
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
  .hero-row {
    grid-template-columns: minmax(0, 1fr) 340px;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero-row {
    grid-template-columns: 1fr;
  }

  .two-col {
    grid-template-columns: 1fr;
  }

  /* Mapa arriba y la tarjeta de datos debajo */
  .map-panel,
  .map-panel.expanded {
    height: auto;
    display: flex;
    flex-direction: column;
    transition: none;
  }

  .map-canvas {
    position: relative;
    inset: auto;
    height: 340px;
    flex: none;
    transition: height 0.35s var(--ease);
  }

  .map-panel.expanded .map-canvas {
    height: 520px;
  }

  .map-card {
    position: static;
    width: auto;
    background: var(--card);
    border: 0;
    border-top: 1px solid var(--line2);
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

/* =========================================================
   MÓVIL (≤ 680px)
========================================================= */

@media (max-width: 680px) {
  .dashboard-container {
    padding: 14px 12px 40px;
    gap: 14px;
  }

  /* ---- Encabezado compacto ---- */
  .hero-row {
    gap: 12px;
  }

  .hero {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px;
    border-radius: 20px;
  }

  /* Con portada: la foto queda visible entre el recuadro y los botones */
  .hero.has-cover {
    min-height: 260px;
    justify-content: space-between;
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
  }

  .hero-copy p {
    margin-top: 6px;
    font-size: 12px;
  }

  .hero-status {
    min-width: 0;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Abierto y Cuenta al corriente: mitad y mitad */
  .status-pill,
  .billing-pill {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    height: 34px;
    padding: 0 10px;
    font-size: 11px;
  }

  /* ---- Hoy ---- */
  .today-card {
    padding: 14px 2px;
    border-radius: 18px;
  }

  .today-cell {
    padding: 4px 4px;
    gap: 6px;
  }

  .today-cell strong {
    font-size: 24px;
  }

  .today-cell > span {
    font-size: 8.5px;
  }

  .kpi-icon {
    width: 34px;
    height: 34px;
  }

  /* ---- Acceso: dos mosaicos grandes ---- */
  .access-grid {
    gap: 10px;
  }

  .access-card {
    min-height: 136px;
    padding: 16px 12px;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    text-align: center;
    border-radius: 18px;
  }

  .access-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .access-icon svg {
    width: 27px;
    height: 27px;
  }

  .access-copy {
    align-items: center;
    gap: 3px;
  }

  .access-copy strong {
    font-size: 16px;
  }

  .access-copy small {
    font-size: 11px;
  }

  .access-arrow {
    display: none;
  }

  /* ---- Accesos directos: mosaicos 2x2 ---- */
  .shortcut-grid {
    gap: 8px;
  }

  .shortcut {
    min-height: 92px;
    padding: 12px 8px 10px;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }

  .shortcut-copy {
    width: 100%;
    align-items: center;
  }

  .shortcut-copy strong {
    font-size: 12px;
  }

  .shortcut-copy small {
    display: none;
  }

  /* ---- Listas ---- */
  .panel {
    padding: 16px 14px;
    border-radius: 16px;
  }

  .panel-header {
    min-height: 0;
  }

  .panel-header h2 {
    font-size: 17px;
  }

  .list-row {
    grid-template-columns: 36px minmax(0, 1fr) auto;
    gap: 10px;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }

  .list-row time {
    display: none;
  }

  /* ---- Mapa ---- */
  .map-panel {
    border-radius: 18px;
  }

  .map-canvas {
    height: 280px;
  }

  .map-panel.expanded .map-canvas {
    height: 440px;
  }

  .map-tools {
    top: 10px;
    right: 10px;
  }

  .map-style-switch {
    right: 10px;
    bottom: 10px;
  }

  .map-card {
    padding: 16px 14px;
    gap: 12px;
  }

  /* ---- Horarios ---- */
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .action-card {
    min-height: 66px;
    padding: 10px 12px;
    gap: 11px;
    border-radius: 14px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .action-info strong {
    font-size: 14.5px;
  }

  /* ---- Modales ---- */
  .modal-overlay {
    padding: 8px;
  }

  .camera-panel {
    padding: 19px;
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

  .access-copy strong {
    font-size: 14.5px;
  }

  .today-cell strong {
    font-size: 21px;
  }

  .shortcut {
    padding: 10px 4px 8px;
  }

  .map-card-actions {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
   AJUSTE FINO DEL HERO EN MÓVIL
   Mantiene portada, logo, nombre y estados sin verse apretado.
========================================================= */
@media (max-width: 680px) {
  .hero {
    padding: 12px;
    gap: 10px;
  }

  .hero.has-cover {
    min-height: 230px;
    background-position: center;
  }

  .hero.has-cover::before {
    background:
      linear-gradient(
        180deg,
        rgba(0, 0, 0, .32) 0%,
        rgba(0, 0, 0, .08) 48%,
        rgba(0, 0, 0, .58) 100%
      );
  }

  .hero-main {
    width: 100%;
    display: grid;
    grid-template-columns: 66px minmax(0, 1fr);
    align-items: stretch;
    gap: 8px;
  }

  .hero.has-cover .hero-main {
    flex: none;
    width: 100%;
    max-width: none;
  }

  .hero-logo {
    width: 66px;
    min-height: 74px;
    height: auto;
    border-radius: 14px;
  }

  .hero.has-cover .hero-copy {
    min-width: 0;
    padding: 10px 12px;
    justify-content: center;
    border-radius: 14px;
    background: rgba(8, 10, 13, .86);
    border: 1px solid rgba(255, 255, 255, .12);
    box-shadow: 0 10px 24px rgba(0, 0, 0, .28);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .hero-copy h1 {
    font-size: clamp(17px, 5.2vw, 21px);
    line-height: 1.05;
    letter-spacing: -.25px;
    overflow-wrap: anywhere;
  }

  .hero-copy p {
    margin-top: 5px;
    font-size: 10px;
    line-height: 1.25;
  }

  .hero-status {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .status-pill,
  .billing-pill {
    width: 100%;
    min-width: 0;
    height: 30px;
    padding: 0 7px;
    gap: 6px;
    font-size: 9px;
    line-height: 1;
    overflow: hidden;
  }

  .status-dot,
  .billing-dot {
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 380px) {
  .hero {
    padding: 10px;
  }

  .hero.has-cover {
    min-height: 218px;
  }

  .hero-main {
    grid-template-columns: 58px minmax(0, 1fr);
    gap: 7px;
  }

  .hero-logo {
    width: 58px;
    min-height: 68px;
    border-radius: 12px;
  }

  .hero.has-cover .hero-copy {
    padding: 9px 10px;
    border-radius: 12px;
  }

  .hero-copy h1 {
    font-size: 16px;
  }

  .hero-copy p {
    font-size: 9px;
  }

  .status-pill,
  .billing-pill {
    height: 29px;
    padding: 0 5px;
    font-size: 8.3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>