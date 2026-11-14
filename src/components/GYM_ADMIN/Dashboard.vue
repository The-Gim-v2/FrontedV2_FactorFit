<template>
  <HeadingAdmin :isGymOpen="isGymOpen" :billingStatus="billingStatus">
    <div class="dashboard">
      <main class="dashboard-container">
        <p v-if="gymStatusError" class="dashboard-data-error" role="alert">{{ gymStatusError }}</p>
        <p v-if="profileError" class="dashboard-data-error" role="alert">{{ profileError }} <button type="button" @click="loadDashboard">{{ ui.retry }}</button></p>
        <p v-if="metricsError" class="dashboard-data-error" role="alert">{{ metricsError }}</p>
        <!-- 1. ENCABEZADO -->
        <section class="hero" :class="{ 'has-cover': !!gym.coverUrl }" :style="heroStyle" id="tutorial-step-0">
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
              <p>{{ gym.description || ui.GYM_ACCOUNTPanel }}</p>
              <small v-if="branchName" class="hero-branch">{{ branchName }}</small>
            </div>
          </div>
          <div class="hero-status" id="tutorial-step-12">
            <button
              type="button"
              class="status-pill"
              :class="isGymOpen ? 'open' : 'closed'"
              :title="gymStatus ? `${gymStatus.motivo} · ${gymStatus.apertura || '—'}–${gymStatus.cierre || '—'} · Clic para cambiar el estado de hoy` : 'Consultar horario del gimnasio'"
              @click="toggleGymStatus"
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
        <!-- 2. INDICADORES CLAVE -->
        <section class="kpi-grid" id="tutorial-step-1">
          <article class="kpi-card" id="tutorial-step-2">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ dashboardStats.entradasHoy }}</strong>
              <span>{{ t.entradasHoy }}</span>
            </div>
          </article>
          <article class="kpi-card" id="tutorial-step-3">
            <div class="kpi-icon accent">
              <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="highlight">{{ dashboardStats.enInstalaciones }}</strong>
              <span>{{ t.enInstalaciones }}</span>
            </div>
          </article>
          <article class="kpi-card" id="tutorial-step-4">
            <div class="kpi-icon success">
              <svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ formatMoney(dashboardStats.ingresoHoy) }}</strong>
              <span>{{ ui.incomeToday }}</span>
            </div>
          </article>
          <article class="kpi-card" id="tutorial-step-5">
            <div class="kpi-icon warning">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ dashboardStats.porVencer }}</strong>
              <span>{{ t.porVencer }}</span>
            </div>
          </article>
        </section>
        <!-- 3. ALERTAS + FINANZAS -->
        <section class="two-col">
          <article class="panel alerts-panel" id="tutorial-step-6">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.attention }}</span>
                <h2>{{ ui.alerts }}</h2>
              </div>
              <span class="alert-count">{{ alerts.length }}</span>
            </div>
            <div class="alert-list">
              <p v-if="!alerts.length" class="dashboard-empty">{{ ui.noAlerts }}</p>
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
          <article class="panel finance-panel" id="tutorial-step-7">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.finance }}</span>
                <h2>{{ ui.financialSummary }}</h2>
              </div>
              <button type="button" class="link-btn" @click="go('/GYM_ACCOUNT/revenue')">{{ ui.details }} →</button>
            </div>
            <div class="finance-main">
              <span>{{ ui.monthIncome }}</span>
              <strong>{{ formatMoney(dashboardStats.ingresoMes) }}</strong>
              <small>{{ ui.fromConfirmedPayments }}</small>
            </div>
            <div class="finance-stats">
              <div><span>{{ ui.todayIncome }}</span><strong>{{ formatMoney(dashboardStats.ingresoHoy) }}</strong></div>
              <div><span>{{ ui.pending }}</span><strong>{{ formatMoney(dashboardStats.adeudoPendiente) }}</strong></div>
              <div><span>{{ ui.overdue }}</span><strong>{{ dashboardStats.porcentajeMorosidad }}</strong></div>
            </div>
          </article>
        </section>
        <!-- 4. ACCIONES RÁPIDAS + ACTIVIDAD -->
        <section class="two-col">
          <article class="panel quick-panel" id="tutorial-step-8">
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
          <article class="panel activity-panel" id="tutorial-step-9">
            <div class="panel-header">
              <div>
                <span class="section-eyebrow">{{ ui.today }}</span>
                <h2>{{ ui.recentActivity }}</h2>
              </div>
              <button type="button" class="link-btn" @click="go('/GYM_ACCOUNT/attendance')">{{ ui.viewAll }} →</button>
            </div>
            <div class="activity-list">
              <p v-if="!recentActivity.length" class="dashboard-empty">{{ ui.noActivity }}</p>
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
        <section class="panel chart-panel" id="tutorial-step-10">
          <div class="panel-header">
            <div>
              <span class="section-eyebrow">{{ ui.last7 }}</span>
              <h2>{{ ui.weeklyPerformance }}</h2>
            </div>
            <div class="chart-summary">
              <strong>{{ weeklyTotalDisplay }}</strong>
              <span>{{ ui.weekAccess }}</span>
              <em>{{ attendanceNote }}</em>
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
        <!-- MAPA REAL POR SEDE: Google Maps, solo lectura, sin coordenadas ficticias -->
        <section class="panel sede-map-panel" v-if="branchName" id="tutorial-step-mapa">
          <div class="panel-header"><div><span class="section-eyebrow">{{ currentLang === 'en' ? 'LOCATION' : 'UBICACIÓN' }}</span><h2>{{ currentLang === 'en' ? 'Branch location' : 'Ubicación de la sucursal' }}</h2></div></div>
          <div class="sede-map-grid">
            <div class="sede-map-details">
              <strong class="sede-map-name">{{ branchName }}</strong>
              <p><small>{{ currentLang === 'en' ? 'Address' : 'Dirección' }}</small>{{ sedeDireccion || '—' }}</p>
              <p><small>{{ currentLang === 'en' ? 'Postal code' : 'Código postal' }}</small>{{ profile.codigo_postal || 'No registrado' }}</p>
              <p><small>{{ currentLang === 'en' ? 'Coordinates' : 'Coordenadas' }}</small>{{ coordenadasValidas ? `${profile.latitud}, ${profile.longitud}` : 'No registradas' }}</p>
              <a v-if="busquedaMapa" class="sede-map-link" :href="mapaGoogleUrl" target="_blank" rel="noopener noreferrer">{{ currentLang === 'en' ? 'Open Google Maps' : 'Cómo llegar con Google Maps' }} ↗</a>
            </div>
            <div class="sede-map-frame"><iframe v-if="mapaGoogleSrc" :key="sedeId()" :src="mapaGoogleSrc" :title="`${branchName} · Google Maps`" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><p v-else>{{ currentLang === 'en' ? 'No address available' : 'La sede no tiene dirección registrada' }}</p></div>
          </div>
        </section>
        <!-- 6. OPERACIÓN Y CONFIGURACIÓN (menos frecuente) -->
        <section class="tools" id="tutorial-step-11">
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
                <!-- Asistencia facial: DESHABILITADA (pendiente de integración biométrica) -->
                <button
                  type="button"
                  class="action-card is-disabled"
                  disabled
                  aria-disabled="true"
                  :title="ui.comingSoon"
                >
                  <div class="action-icon">
                    <svg viewBox="0 0 24 24"><circle cx="9" cy="10" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 8a3 3 0 0 1 0 6M21 21v-2a5 5 0 0 0-3-4.58"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ t.asistenciaFacial }}</strong>
                    <span>{{ t.reconocimientoBio }}</span>
                  </div>
                  <span class="soon-badge">{{ ui.comingSoon }}</span>
                </button>
                <button type="button" class="action-card" @click="openCamera('scanner')">
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
                <h2>{{ ui.scheduleHeading }}</h2>
              </div>
              <div class="action-list">
                <button type="button" class="action-card" @click="activeModal = 'add-schedule'">
                  <div class="action-icon accent">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ ui.gymScheduleTitle }}</strong>
                    <span>{{ ui.gymScheduleDesc }}</span>
                  </div>
                  <ArrowIcon />
                </button>
                <button type="button" class="action-card" @click="activeModal = 'view-schedule'">
                  <div class="action-icon accent">
                    <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18M12 12v5M9.5 14.5h5"/></svg>
                  </div>
                  <div class="action-info">
                    <strong>{{ ui.eventsTitle }}</strong>
                    <span>{{ ui.eventsDesc }}</span>
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
          <AddScheduleModal v-if="activeModal === 'add-schedule'" @close="closeModal" @saved="loadGymStatus" />
          <ViewScheduleModal v-if="activeModal === 'view-schedule'" @close="closeModal" />
          <CorreoMasivo v-if="activeModal === 'enviomasivo'" @close="closeModal" />
          <AddCorteComponent v-if="activeModal === 'corte'" @close="closeModal" />
          <AccessAttendanceModal v-if="activeModal === 'scanner'" mode="scanner" :sede-id="sedeId()" @close="closeModal" @registered="onAttendanceRegistered" />
        </div>
      </transition>
      <!-- CONFIRMAR CAMBIO DE ESTADO DEL GIMNASIO -->
      <transition name="pop">
        <div v-if="confirmEstado" class="modal-overlay" @click.self="cancelarEstado">
          <section class="confirm-modal" :class="confirmEstado" role="alertdialog" aria-modal="true" aria-labelledby="confirm-estado-title" aria-describedby="confirm-estado-desc">
            <span class="confirm-icon">
              <svg v-if="confirmEstado === 'cerrado'" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/></svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/></svg>
            </span>
            <h2 id="confirm-estado-title">{{ confirmTxt.titulo }}</h2>
            <p id="confirm-estado-desc" class="confirm-sub">{{ confirmTxt.sub }}</p>
            <ol class="confirm-steps">
              <li v-for="(s, i) in confirmTxt.pasos" :key="i">
                <span class="confirm-num">{{ i + 1 }}</span>
                <div><strong>{{ s[0] }}</strong><small>{{ s[1] }}</small></div>
              </li>
            </ol>
            <p v-if="confirmError" class="confirm-error" role="alert">{{ confirmError }}</p>
            <div class="confirm-actions">
              <button type="button" class="confirm-btn ghost" :disabled="cambiandoEstado" @click="cancelarEstado">{{ confirmTxt.cancelar }}</button>
              <button type="button" class="confirm-btn primary" :disabled="cambiandoEstado" @click="confirmarEstado">{{ cambiandoEstado ? confirmTxt.guardando : confirmTxt.confirmar }}</button>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </HeadingAdmin>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, watch, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { traducciones } from './i18n.js';
import AddScheduleModal from '../Modals/GymOpeningHours.vue';
import ViewScheduleModal from '../Modals/ViewScheduleModal.vue';
import CorreoMasivo from './Componets/Bulk-Email.vue';
import AddCorteComponent from './Componets/Cut.vue';
import HeadingAdmin from './HeadingGYM_ACCOUNT.vue';
import AccessAttendanceModal from '../Modals/AccessAttendanceModal.vue';
const router = useRouter();
const route = useRoute();
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const activeModal = ref(null);
const videoPlayer = ref(null);
const isGymOpen = ref(false);const gymStatus=ref(null);const gymStatusError=ref('');let statusTimer=null;
const billingStatus = ref('active');
let stream = null;
/* =========================================================
   DATOS DEL GIMNASIO (encabezado)
   Cuando vengan del backend solo hay que llenar estos campos:
   - logoUrl:       logo del gimnasio (opcional)
   - coverUrl:      foto de fondo del encabezado (opcional)
   - membershipEnd: fecha de vencimiento de la membresía, formato AAAA-MM-DD
========================================================= */
const gym = ref({ name: '', logoUrl: null, coverUrl: null, membershipEnd: null, description: '' });
const profile = ref({});
const branchName = ref('');
const profileError = ref('');
const metricsError = ref('');
const branchFromEvent = ref(0);
const inscripciones = ref([]);
const pagosConfirmados = ref([]);
const registrosAsistencia = ref([]);
const ingresosLoaded = ref(false);
const asistenciaLoaded = ref(false);
const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const name of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
      const value = storage.getItem(name);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const name of ['auth','user','session','gymAccount','gym_account']) {
      try {
        const value = JSON.parse(storage.getItem(name) || 'null');
        const token = value?.token || value?.access_token || value?.accessToken;
        if (token) return String(token).replace(/^Bearer\s+/i, '');
      } catch { /* Dato no JSON */ }
    }
  }
  return '';
};
const storedBranchId = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const name of ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id']) {
      const raw = storage.getItem(name);
      if (!raw) continue;
      let value = raw;
      try {
        const parsed = JSON.parse(raw);
        value = parsed && typeof parsed === 'object' ? (parsed.ID_Sede ?? parsed.sede_id ?? parsed.id ?? parsed.value) : parsed;
      } catch { /* El valor puede ser un número directo */ }
      const id = Number(value);
      if (Number.isInteger(id) && id > 0) return id;
    }
  }
  return 1;
};
const sedeId = () => {
  if (branchFromEvent.value > 0) return branchFromEvent.value;
  const id = Number(route.query.sede_id);
  return Number.isInteger(id) && id > 0 ? id : storedBranchId();
};
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const apiGet = async (path) => {
  const token = getToken();
  if (!token) throw new Error('No se encontró una sesión activa. Inicia sesión nuevamente.');
  const response = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store'
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Error HTTP ${response.status}`);
  return body;
};
const nowParts = () => {
  const pieces = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Monterrey', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const get = (type) => pieces.find(x => x.type === type)?.value || '';
  return { today: `${get('year')}-${get('month')}-${get('day')}`, month: `${get('year')}-${get('month')}` };
};
const formatMoney = (n) => n === null || n === undefined ? '—' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);
// Dirección de la sucursal (se muestra en la tarjeta de "Sucursales").
const sedeDireccion = computed(() => [
  [profile.value.calle, profile.value.numero_ext ? `#${profile.value.numero_ext}` : '', profile.value.numero_int ? `Int. ${profile.value.numero_int}` : ''].filter(Boolean).join(' '),
  profile.value.colonia, profile.value.municipio, profile.value.entidad,
  profile.value.codigo_postal, 'México'
].filter(Boolean).join(', '));
const coordenadasValidas = computed(() => profile.value.latitud != null && profile.value.longitud != null && profile.value.latitud !== '' && profile.value.longitud !== '' &&
  Number.isFinite(Number(profile.value.latitud)) && Number.isFinite(Number(profile.value.longitud)) &&
  Math.abs(Number(profile.value.latitud)) <= 90 && Math.abs(Number(profile.value.longitud)) <= 180);
const busquedaMapa = computed(() => coordenadasValidas.value
  ? `${profile.value.latitud},${profile.value.longitud}` : sedeDireccion.value);
const mapaGoogleSrc = computed(() => busquedaMapa.value ? `https://maps.google.com/maps?q=${encodeURIComponent(busquedaMapa.value)}&z=16&output=embed` : '');
const mapaGoogleUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busquedaMapa.value)}`);
let requestSeq = 0;
const loadDashboard = async () => {
  const seq = ++requestSeq;
  profileError.value = ''; metricsError.value = '';
  const id = sedeId();
  const requests = await Promise.allSettled([
    apiGet(`/api/gym/identidad-visual?sede_id=${id}`),
    apiGet(`/api/gym/ingresos?sede_id=${id}`),
    apiGet(`/api/gym/asistencias-semana?sede_id=${id}`)
  ]);
  if (seq !== requestSeq) return;
  const [perfilResult, ingresosResult, asistenciaResult] = requests;
  if (perfilResult.status === 'fulfilled') {
    const data = perfilResult.value;
    const sede = data.sede || {};
    profile.value = sede;
    gym.value = {
      name: String(data.gimnasio?.nombre || 'Mi gimnasio'),
      logoUrl: data.gimnasio?.logo_url || null,
      coverUrl: data.gimnasio?.portada_url || null,
      description: String(sede.descripcion || ''),
      membershipEnd: null
    };
    branchName.value = String(sede.nombre || `Sede ${id}`);
  } else {
    gym.value = { name: 'Mi gimnasio', logoUrl: null, coverUrl: null, membershipEnd: null, description: '' };
    profileError.value = `No se pudo cargar el perfil: ${perfilResult.reason?.message || 'Error de conexión'}`;
  }
  if (ingresosResult.status === 'fulfilled' && Array.isArray(ingresosResult.value.inscripciones)) {
    inscripciones.value = ingresosResult.value.inscripciones;
    pagosConfirmados.value = Array.isArray(ingresosResult.value.pagos_confirmados) ? ingresosResult.value.pagos_confirmados : [];
    ingresosLoaded.value = true;
  } else {
    inscripciones.value = []; pagosConfirmados.value = []; ingresosLoaded.value = false;
    metricsError.value = 'No se pudieron cargar los ingresos; revisa la API del gimnasio.';
  }
  if (asistenciaResult.status === 'fulfilled' && Array.isArray(asistenciaResult.value.asistencias)) {
    registrosAsistencia.value = asistenciaResult.value.asistencias;
    asistenciaLoaded.value = true;
  } else {
    registrosAsistencia.value = []; asistenciaLoaded.value = false;
  }
};
const onBranchChanged = (event) => {
  const detail = event.detail || {};
  const branch = detail.sede && typeof detail.sede === 'object' ? detail.sede : {};
  const id = Number(detail.sede_id ?? detail.ID_Sede ?? detail.id ?? detail.sedeId ?? branch.ID_Sede ?? storedBranchId());
  branchFromEvent.value = Number.isInteger(id) && id > 0 ? id : 0;
  void loadDashboard();void loadGymStatus();void loadAccessAlerts();
};
const onProfileUpdated = (event) => {
  const changed = Number(event.detail?.sede_id || 0);
  if (!changed || changed === sedeId()) void loadDashboard();
};
const onFocus = () => { void loadDashboard();void loadGymStatus();void loadAccessAlerts(); };
const onVisible = () => { if (document.visibilityState === 'visible') { void loadDashboard();void loadGymStatus();void loadAccessAlerts(); } };
watch(() => route.query.sede_id, () => { branchFromEvent.value = 0; void loadDashboard();void loadGymStatus();void loadAccessAlerts(); });
const nameWords = computed(() => gym.value.name.trim().toUpperCase().split(/\s+/));
/* Palabra resaltada con el color de acento: la segunda del nombre */
const highlightIndex = computed(() => (nameWords.value.length > 1 ? 1 : 0));
const heroStyle = computed(() =>
  gym.value.coverUrl && /^https?:\/\//i.test(gym.value.coverUrl) ? { '--cover': `url(\"${gym.value.coverUrl.replace(/[\"\\]/g, '')}\")` } : {}
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
    GYM_ACCOUNTPanel: 'Panel del gimnasio',
    operation: 'OPERACIÓN',
    schedule: 'AGENDA',
    scheduleHeading: 'Horarios y Eventos',
    gymScheduleTitle: 'Añadir Horario',
    gymScheduleDesc: 'Días y horas de apertura del gimnasio',
    eventsTitle: 'Añadir Eventos',
    eventsDesc: 'Clases, torneos y actividades especiales',
    expansion: 'EXPANSIÓN',
    moreTools: 'Operación y configuración',
    branches: 'Sucursales',
    addBranch: 'Agregar sucursal',
    addBranchDescription: 'Registra una nueva sede en tu cuenta.',
    accessControl: 'CONTROL DE ACCESO',
    branchManagement: 'GESTIÓN DE SUCURSALES',
    registerBranch: 'Registrar nueva sede',
    comingSoon: 'Próximamente',
    cameraError: 'No se pudo acceder a la cámara. Verifica los permisos.',
    membershipExpires: 'Membresía vence el',
    membershipExpired: 'Membresía venció el',
    incomeToday: 'INGRESOS HOY',
    today: 'ACTIVIDAD',
    recentActivity: 'Actividad reciente',
    viewAll: 'Ver todo',
    finance: 'FINANZAS',
    financialSummary: 'Resumen financiero',
    details: 'Detalles',
    monthIncome: 'Ingresos del mes',
    vsLastMonth: 'vs. mes anterior',
    todayIncome: 'Hoy',
    pending: 'Pendiente',
    overdue: 'Morosidad',
    attention: 'ATENCIÓN',
    alerts: 'Alertas importantes',
    last7: 'SEMANA ACTUAL',
    weeklyPerformance: 'Rendimiento semanal',
    attendance: 'Asistencias',
    weekAccess: 'asistencias esta semana',
    management: 'GESTIÓN',
    quickActions: 'Acciones rápidas',
    mainBranch: 'Gimnasio Principal',
    peopleInside: 'personas dentro',
    addressNotSet: 'Sin dirección registrada',
    retry: 'Reintentar', noAlerts: 'No hay alertas registradas.', noActivity: 'Sin actividad registrada.',
    fromConfirmedPayments: 'Calculado con pagos confirmados', withDebt: 'clientes con adeudo',
    requiresFollowup: 'Requieren seguimiento', expiredMemberships: 'membresías vencidas',
    requiresRenewal: 'Requieren renovación', expiringMemberships: 'membresías próximas a vencer',
    paymentReceived: 'Pago recibido', attendanceRegistered: 'Asistencia registrada',
    realAttendance: 'Datos registrados', attendanceUnavailable: 'Sin datos de asistencia'
  },
  en: {
    GYM_ACCOUNTPanel: 'Gym Account Panel',
    operation: 'OPERATIONS',
    schedule: 'SCHEDULE',
    scheduleHeading: 'Schedules & Events',
    gymScheduleTitle: 'Add Schedule',
    gymScheduleDesc: 'Gym opening days and hours',
    eventsTitle: 'Add Events',
    eventsDesc: 'Classes, tournaments and special activities',
    expansion: 'EXPANSION',
    moreTools: 'Operations & settings',
    branches: 'Branches',
    addBranch: 'Add branch',
    addBranchDescription: 'Register a new location in your account.',
    accessControl: 'ACCESS CONTROL',
    branchManagement: 'BRANCH MANAGEMENT',
    registerBranch: 'Register new location',
    comingSoon: 'Coming soon',
    cameraError: 'Camera access failed. Check your permissions.',
    membershipExpires: 'Membership expires on',
    membershipExpired: 'Membership expired on',
    incomeToday: 'TODAY INCOME',
    today: 'ACTIVITY',
    recentActivity: 'Recent activity',
    viewAll: 'View all',
    finance: 'FINANCE',
    financialSummary: 'Financial summary',
    details: 'Details',
    monthIncome: 'Monthly income',
    vsLastMonth: 'vs. last month',
    todayIncome: 'Today',
    pending: 'Pending',
    overdue: 'Overdue',
    attention: 'ATTENTION',
    alerts: 'Important alerts',
    last7: 'THIS WEEK',
    weeklyPerformance: 'Weekly performance',
    attendance: 'Attendance',
    weekAccess: 'attendances this week',
    management: 'MANAGEMENT',
    quickActions: 'Quick actions',
    mainBranch: 'Main Gym',
    peopleInside: 'people inside',
    addressNotSet: 'No address on file',
    retry: 'Retry', noAlerts: 'No alerts at this time.', noActivity: 'No activity recorded.',
    fromConfirmedPayments: 'Calculated from confirmed payments', withDebt: 'clients with debt',
    requiresFollowup: 'Follow-up required', expiredMemberships: 'expired memberships',
    requiresRenewal: 'Renewal required', expiringMemberships: 'memberships expiring soon',
    paymentReceived: 'Payment received', attendanceRegistered: 'Attendance recorded',
    realAttendance: 'Recorded data', attendanceUnavailable: 'Attendance data unavailable'
  }
};
const ui = computed(
  () => dashboardTranslations[currentLang.value] || dashboardTranslations.es
);
/* =========================================================
   ESTADÍSTICAS REALES: pagos confirmados, deuda y asistencia
   ========================================================= */
const dashboardStats = computed(() => {
  const { today, month } = nowParts();
  const payments = pagosConfirmados.value;
  const rows = inscripciones.value;
  const amount = (paymentsFiltered) => Math.round(paymentsFiltered.reduce((s, p) => s + Number(p.monto || 0), 0) * 100) / 100;
  const pendientes = rows.filter(r => Number(r.saldo_a_pagar || 0) > 0);
  const vencidos = rows.filter(r => r.estatus_inscripcion === 'Inactivo');
  const porVencer = rows.filter(r => r.estatus_inscripcion === 'Próximo a vencer');
  const hoyEntradas = new Set(registrosAsistencia.value.filter(r => r.fecha === today).map(r => Number(r.ID_Inscripto)));
  return {
    entradasHoy: asistenciaLoaded.value ? hoyEntradas.size : '—',
    enInstalaciones: '—', // El endpoint semanal no registra quién sigue dentro.
    ingresoHoy: ingresosLoaded.value ? amount(payments.filter(p => String(p.fecha_pago || '').slice(0, 10) === today)) : null,
    ingresoMes: ingresosLoaded.value ? amount(payments.filter(p => String(p.fecha_pago || '').slice(0, 7) === month)) : null,
    porVencer: ingresosLoaded.value ? porVencer.length : '—',
    adeudoPendiente: ingresosLoaded.value ? amount(pendientes.map(p => ({ monto: p.saldo_a_pagar }))) : null,
    porcentajeMorosidad: ingresosLoaded.value ? `${rows.length ? (vencidos.length * 100 / rows.length).toFixed(1) : '0.0'}%` : '—',
    deudores: pendientes.length,
    vencidos: vencidos.length
  };
});
const recentActivity = computed(() => {
  const byId = new Map(inscripciones.value.map(r => [Number(r.ID_Inscripto), r]));
  const payments = pagosConfirmados.value.filter(p => p.fecha_pago).map(p => {
    const row = byId.get(Number(p.id_inscripto));
    const name = row?.nombre || 'Cliente';
    const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
    return { initials, name, text: `${ui.value.paymentReceived} · ${formatMoney(p.monto)}`, time: String(p.fecha_pago).slice(0, 10), type: 'payment', sort: String(p.fecha_pago) };
  });
  const attendances = registrosAsistencia.value.filter(a => a.fecha).map(a => {
    const row = byId.get(Number(a.ID_Inscripto));
    const name = row?.nombre || 'Cliente';
    return { initials: name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(), name, text: ui.value.attendanceRegistered, time: String(a.fecha), type: 'access', sort: String(a.fecha) };
  });
  return [...payments, ...attendances].sort((a, b) => b.sort.localeCompare(a.sort)).slice(0, 5);
});
const alertOrder = { danger: 0, warning: 1, info: 2 };
const alerts = computed(() => {
  const result = alertasAcceso.value.slice(0,5).map(a=>({title:'Asistencia con advertencia de pago',subtitle:a.Descripcion,level:'warning',route:'/GYM_ACCOUNT/attendance'}));
  if (!ingresosLoaded.value) return result;
  if (dashboardStats.value.deudores > 0) result.push({ title: `${dashboardStats.value.deudores} ${ui.value.withDebt}`, subtitle: ui.value.requiresFollowup, level: 'danger', route: '/GYM_ACCOUNT/debtors' });
  if (dashboardStats.value.vencidos > 0) result.push({ title: `${dashboardStats.value.vencidos} ${ui.value.expiredMemberships}`, subtitle: ui.value.requiresRenewal, level: 'danger', route: '/GYM_ACCOUNT/renewals' });
  if (dashboardStats.value.porVencer > 0) result.push({ title: `${dashboardStats.value.porVencer} ${ui.value.expiringMemberships}`, subtitle: ui.value.requiresRenewal, level: 'warning', route: '/GYM_ACCOUNT/renewals' });
  return result.sort((a, b) => alertOrder[a.level] - alertOrder[b.level]);
});
const weeklyData = computed(() => {
  const names = currentLang.value === 'es' ? ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weeklyCounts = Array.from({ length: 7 }, () => 0);
  const seen = new Set();
  if (asistenciaLoaded.value) for (const a of registrosAsistencia.value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(a.fecha || ''))) continue;
    const day = new Date(`${a.fecha}T00:00:00Z`).getUTCDay();
    const idx = (day + 6) % 7;
    const key = `${a.ID_Inscripto}-${a.fecha}`;
    if (seen.has(key)) continue;
    seen.add(key); weeklyCounts[idx] += 1;
  }
  const max = Math.max(...weeklyCounts, 1);
  return names.map((day, index) => ({ day, value: asistenciaLoaded.value ? weeklyCounts[index] : '—', height: asistenciaLoaded.value ? (weeklyCounts[index] / max * 100) : 0, peak: asistenciaLoaded.value && weeklyCounts[index] === max && max > 0 }));
});
const weeklyTotalDisplay = computed(() => asistenciaLoaded.value ? weeklyData.value.reduce((sum, d) => sum + Number(d.value || 0), 0) : '—');
const attendanceNote = computed(() => asistenciaLoaded.value ? ui.value.realAttendance : ui.value.attendanceUnavailable);
/*
  icon  = path de un SVG de 24x24
  modal = si existe, la acción abre un modal en vez de navegar
*/
const quickActions = computed(() => {
  const icons = {
    client: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',
    payment: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    staff: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
    mail: 'M4 4h16v16H4zM4 7l8 6 8-6',
    promo: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
    cash: 'M4 4h16v16H4zM8 8h8M8 12h3M8 16h3M14 12h2M14 16h2'
  };
  return currentLang.value === 'es'
    ? [
        { label: 'Registrar cliente', description: 'Nueva membresía', route: '/GYM_ACCOUNT/register-clients', icon: icons.client },
        { label: 'Registrar pago', description: 'Cobrar membresía', route: '/GYM_ACCOUNT/payments', icon: icons.payment },
        { label: 'Registrar personal', description: 'Nuevo colaborador', route: '/GYM_ACCOUNT/register-staff', icon: icons.staff },
        { label: 'Correo masivo', description: 'Comunicar a clientes', modal: 'enviomasivo', icon: icons.mail },
        { label: 'Crear promoción', description: 'Campañas y descuentos', route: '/GYM_ACCOUNT/pricing', icon: icons.promo },
        { label: 'Corte de caja', description: 'Resumen de operación', modal: 'corte', icon: icons.cash }
      ]
    : [
        { label: 'Register client', description: 'New membership', route: '/GYM_ACCOUNT/register-clients', icon: icons.client },
        { label: 'Register payment', description: 'Charge membership', route: '/GYM_ACCOUNT/payments', icon: icons.payment },
        { label: 'Register staff', description: 'New collaborator', route: '/GYM_ACCOUNT/register-staff', icon: icons.staff },
        { label: 'Bulk email', description: 'Message clients', modal: 'enviomasivo', icon: icons.mail },
        { label: 'Create promotion', description: 'Campaigns and discounts', route: '/GYM_ACCOUNT/pricing', icon: icons.promo },
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
  return t.value.bloqueadoPago;
});
const loadGymStatus=async()=>{try{const d=await apiGet(`/api/gym/estado?sede_id=${sedeId()}`);gymStatus.value=d.estado||null;isGymOpen.value=!!d.estado?.abierto;gymStatusError.value='';}catch(e){gymStatus.value=null;isGymOpen.value=false;gymStatusError.value=e?.message||'No se pudo consultar el estado del gimnasio.';}};
const confirmEstado = ref(null);
const cambiandoEstado = ref(false);
const confirmError = ref('');
const confirmTxt = computed(() => {
  const en = currentLang.value === 'en';
  const cerrar = confirmEstado.value === 'cerrado';
  const registro = en
    ? ['Saved as a special date', 'It is stored as "Cambio manual desde Dashboard" in Special dates.']
    : ['Se registra', 'Queda guardado como fecha especial: «Cambio manual desde Dashboard».'];
  if (cerrar) {
    return en
      ? { titulo: 'Close the gym', sub: 'You are about to mark the gym as closed for the rest of the day.', cancelar: 'Cancel', confirmar: 'Close gym', guardando: 'Saving...',
          pasos: [['Closed today', 'It will show as closed for the rest of the day.'], ['Members see it', 'Members will see that the gym is closed.'], registro] }
      : { titulo: 'Cerrar el gimnasio', sub: 'Vas a marcar el gimnasio como cerrado durante el resto del día.', cancelar: 'Cancelar', confirmar: 'Cerrar gimnasio', guardando: 'Guardando...',
          pasos: [['Se cierra hoy', 'Quedará como cerrado durante el resto del día.'], ['Los miembros lo ven', 'Verán que el gimnasio está cerrado.'], registro] };
  }
  return en
    ? { titulo: 'Open the gym', sub: 'You are about to mark the gym as open for the rest of the day, even outside its usual hours.', cancelar: 'Cancel', confirmar: 'Open gym', guardando: 'Saving...',
        pasos: [['Open today', 'It will show as open for the rest of the day, even outside its usual hours.'], ['Members see it', 'Members will see that the gym is open.'], registro] }
    : { titulo: 'Abrir el gimnasio', sub: 'Vas a marcar el gimnasio como abierto durante el resto del día, incluso fuera de su horario habitual.', cancelar: 'Cancelar', confirmar: 'Abrir gimnasio', guardando: 'Guardando...',
        pasos: [['Se abre hoy', 'Quedará como abierto el resto del día, aunque sea fuera de su horario habitual.'], ['Los miembros lo ven', 'Verán que el gimnasio está abierto.'], registro] };
});
const toggleGymStatus = () => {
  if (cambiandoEstado.value) return;
  confirmError.value = '';
  confirmEstado.value = isGymOpen.value ? 'cerrado' : 'abierto';
};
const cancelarEstado = () => { if (!cambiandoEstado.value) confirmEstado.value = null; };
const confirmarEstado = async () => {
  const siguiente = confirmEstado.value;
  if (!siguiente || cambiandoEstado.value) return;
  cambiandoEstado.value = true;
  confirmError.value = '';
  try {
    const token = getToken();
    const r = await fetch(`${API}/api/gym/estado?sede_id=${sedeId()}`, {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sede_id: sedeId(), estado: siguiente, motivo: 'Cambio manual desde Dashboard' })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d?.message || `Error HTTP ${r.status}`);
    gymStatus.value = d.estado;
    isGymOpen.value = !!d.estado?.abierto;
    gymStatusError.value = '';
    confirmEstado.value = null;
  } catch (e) {
    confirmError.value = e?.message || 'No se pudo actualizar el estado.';
  } finally {
    cambiandoEstado.value = false;
  }
};
const onEscConfirm = (e) => { if (e.key === 'Escape') cancelarEstado(); };
watch(confirmEstado, (v) => {
  if (v) window.addEventListener('keydown', onEscConfirm);
  else window.removeEventListener('keydown', onEscConfirm);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onEscConfirm));
/* =========================================================
   IDIOMA
========================================================= */
const handleLangChange = (event) => {
  if (!event.detail?.idioma) return;
  currentLang.value = event.detail.idioma;
  localStorage.setItem('GYM_ACCOUNT-idioma', event.detail.idioma);
};
/* =========================================================
   MODALES
========================================================= */
const stopStream = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
};
/* La asistencia facial está deshabilitada: solo se permite abrir el escáner QR */
const openCamera = (type) => {
  if (type !== 'scanner') return;
  activeModal.value = type;
};
const onAttendanceRegistered=()=>{void loadDashboard();void loadAccessAlerts();};
const alertasAcceso=ref([]);
const loadAccessAlerts=async()=>{try{const d=await apiGet(`/api/gym/control-acceso/alertas?sede_id=${sedeId()}`);alertasAcceso.value=Array.isArray(d.alertas)?d.alertas:[];}catch{alertasAcceso.value=[];}};
const closeModal = () => {
  stopStream();
  activeModal.value = null;
};
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
  void loadGymStatus();statusTimer=window.setInterval(()=>{void loadGymStatus();void loadAccessAlerts();},60000);
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', onBranchChanged);
  window.addEventListener('factorfit:gym-profile-updated', onProfileUpdated);
  window.addEventListener('factorfit:gym-hours-updated', loadGymStatus);
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisible);
  void loadDashboard();void loadAccessAlerts();
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  requestSeq++;
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', onBranchChanged);
  window.removeEventListener('factorfit:gym-profile-updated', onProfileUpdated);
  window.removeEventListener('factorfit:gym-hours-updated', loadGymStatus);
  if(statusTimer!==null)window.clearInterval(statusTimer);
  window.removeEventListener('focus', onFocus);
  document.removeEventListener('visibilitychange', onVisible);
  window.removeEventListener('keydown', handleKeydown);
});
onBeforeUnmount(stopStream);
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
/* Logo: su alto es el mismo que el del panel (stretch) y es cuadrado */
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
/* El recuadro de cristal ahora es solo el panel de texto */
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
   6. OPERACIÓN Y CONFIGURACIÓN
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
.action-card.add-branch {
  border-style: dashed;
  border-color: var(--hl-line);
  background: var(--hl-soft);
}
.action-card.add-branch:hover {
  background: var(--hl-mid);
}
/* ---------- Tarjeta deshabilitada (Asistencia facial) ---------- */
.action-card:disabled,
.action-card.is-disabled {
  cursor: not-allowed;
}
.action-card:disabled:hover,
.action-card.is-disabled:hover {
  transform: none;
  border-color: var(--line);
  background: var(--surface);
  box-shadow: none;
}
.action-card:disabled .action-icon,
.action-card:disabled .action-info {
  opacity: 0.5;
  filter: grayscale(0.6);
}
.soon-badge {
  flex: none;
  padding: 5px 11px;
  color: #fbbf24;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 999px;
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
.online-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  vertical-align: middle;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18), 0 0 8px #34d399;
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
.modal-overlay,
.branch-modal-overlay {
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
.camera-header span,
.branch-modal-title span {
  color: var(--hl);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.camera-header h3,
.branch-modal-title h2 {
  margin: 4px 0 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 21px;
  font-weight: 600;
}
.camera-header button,
.branch-modal-close {
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
.camera-header button:hover,
.branch-modal-close:hover {
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
.branch-modal {
  width: min(1280px, 96vw);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--card);
  border: 1px solid var(--line2);
  border-radius: 24px;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6);
}
.branch-modal-header {
  min-height: 76px;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent);
  border-bottom: 1px solid var(--line);
}
.branch-modal-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.branch-modal-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
  font-size: 24px;
}
.branch-modal-body {
  padding: 22px;
  overflow-y: auto;
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.22s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}
/* ---------- Confirmar abrir / cerrar el gimnasio ---------- */
.confirm-modal {
  --tone: var(--hl);
  width: min(440px, 100%);
  padding: 30px 26px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--text2);
  border: 1px solid var(--line2);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 35%),
    var(--card);
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6);
  animation: confirm-in 0.24s var(--ease);
}
.confirm-modal.cerrado { --tone: #f87171; }
.confirm-modal.abierto { --tone: #34d399; }
@keyframes confirm-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: none; }
}
.confirm-icon {
  width: 58px;
  height: 58px;
  margin-bottom: 18px;
  display: grid;
  place-items: center;
  color: var(--tone);
  border: 1px solid color-mix(in srgb, var(--tone) 45%, transparent);
  border-radius: 17px;
  background: color-mix(in srgb, var(--tone) 12%, transparent);
}
.confirm-icon svg {
  width: 27px;
  height: 27px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.confirm-modal h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 23px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.confirm-sub {
  margin: 10px 0 20px;
  max-width: 340px;
  color: var(--text2);
  font-size: 13.5px;
  line-height: 1.55;
}
.confirm-steps {
  width: 100%;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
  list-style: none;
  text-align: left;
}
.confirm-steps li {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: start;
  gap: 13px;
  padding: 14px;
  border: 1px solid var(--line2);
  border-radius: 14px;
  background: var(--surface);
}
.confirm-num {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  color: var(--hl);
  font-size: 12px;
  font-weight: 800;
  border: 1px solid var(--hl-line);
  border-radius: 8px;
  background: var(--hl-soft);
}
.confirm-steps strong {
  display: block;
  color: var(--title);
  font-size: 13.5px;
  font-weight: 700;
}
.confirm-steps small {
  display: block;
  margin-top: 3px;
  color: var(--text2);
  font-size: 12.5px;
  line-height: 1.45;
}
.confirm-error {
  width: 100%;
  margin: 14px 0 0;
  padding: 11px 13px;
  color: #fca5a5;
  font-size: 12.5px;
  line-height: 1.45;
  text-align: left;
  border: 1px solid rgba(239, 68, 68, 0.32);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.09);
}
.confirm-actions {
  width: 100%;
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.confirm-btn {
  width: 100%;
  height: 48px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  transition: filter 0.17s ease, background 0.17s ease, transform 0.17s ease;
}
.confirm-btn.ghost {
  color: var(--title);
  border: 1px solid var(--line2);
  background: var(--surface);
}
.confirm-btn.ghost:hover:not(:disabled) { background: var(--surface-hover); }
.confirm-btn.primary {
  color: var(--color-texto-botones, #fff);
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: var(--color-botones, #e34d78);
  box-shadow: 0 12px 28px -12px var(--color-botones, #e34d78);
}
.confirm-btn.primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.confirm-btn:disabled { opacity: 0.6; cursor: wait; }
.confirm-btn:focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }
@media (max-width: 480px) {
  .confirm-modal { padding: 24px 18px 20px; border-radius: 20px; }
  .confirm-modal h2 { font-size: 21px; }
}
@media (prefers-reduced-motion: reduce) {
  .confirm-modal { animation: none; }
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
  .modal-overlay,
  .branch-modal-overlay {
    padding: 8px;
  }
  .camera-panel {
    padding: 20px;
    border-radius: 20px;
  }
  .branch-modal {
    width: 100%;
    max-height: 96vh;
    border-radius: 17px;
  }
  .branch-modal-body {
    padding: 16px;
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
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
/* Avisos de datos y estados vacíos */
.dashboard-data-error{padding:12px 15px;margin:0;border:1px solid rgba(248,113,113,.35);border-radius:12px;background:rgba(248,113,113,.07);color:#fca5a5;font-size:12px}
.dashboard-data-error button{margin-left:10px;border:0;background:transparent;color:inherit;cursor:pointer;text-decoration:underline}
.hero-branch{display:block;margin-top:8px;color:#e2e8f0;font-size:12px;font-weight:600}
.dashboard-empty{padding:14px 4px;color:var(--text3);font-size:12px}
/* Mapa de la sucursal real (Google Maps sin llave, pin por coordenadas si existen). */
.sede-map-grid{display:grid;grid-template-columns:minmax(240px,32%) minmax(0,1fr);gap:18px;min-height:330px}
.sede-map-details{padding:16px;border:1px solid var(--line2);border-radius:14px;background:var(--surface)}
.sede-map-name{display:block;margin-bottom:16px;font-family:'Oswald',sans-serif;font-size:20px;color:var(--title)}
.sede-map-details p{display:flex;flex-direction:column;gap:5px;padding:8px 0;margin:0;border-bottom:1px solid var(--line);font-size:13px;overflow-wrap:anywhere}
.sede-map-details p small{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase}
.sede-map-link{display:block;text-align:center;margin-top:16px;padding:13px 10px;border-radius:10px;background:var(--color-botones,#2563eb);color:var(--color-texto-botones,#fff);text-decoration:none;font-weight:700}
.sede-map-frame{min-height:330px;border:1px solid var(--line2);border-radius:14px;overflow:hidden;background:var(--surface);display:grid;place-items:center}
.sede-map-frame iframe{width:100%;height:100%;min-height:330px;border:0}
@media(max-width:760px){.sede-map-grid{grid-template-columns:1fr}.sede-map-frame,.sede-map-frame iframe{min-height:290px}}
</style>
