<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import FitnessPet from '@/components/FitnessPet.vue';
import { traducciones } from '../i18n.js';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const route = useRoute();
const router = useRouter();
const toastRef = ref(null);
const notify = (message, type = 'error') => toastRef.value?.notify(message, type);
const searchQuery = ref('');
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const t = (key) => (traducciones[currentLang.value] || traducciones.es)?.[key] || traducciones.es?.[key] || key;
const txt = (es, en) => currentLang.value === 'en' ? en : es;
const handleLangChange = (e) => { if (e.detail?.idioma) currentLang.value = e.detail.idioma; };

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const token = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
      const value = storage.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth','user','session','gymAccount','gym_account']) {
      try {
        const value = JSON.parse(storage.getItem(key) || 'null');
        if (value?.token || value?.access_token || value?.accessToken) return value.token || value.access_token || value.accessToken;
      } catch (_) {}
    }
  }
  return '';
};
const sedeId = () => {
  const routeSede = Number(route.query.sede_id);
  if (Number.isInteger(routeSede) && routeSede > 0) return routeSede;
  const keys = ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id'];
  for (const storage of [sessionStorage, localStorage]) for (const key of keys) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    let value = raw;
    try {
      const obj = JSON.parse(raw);
      value = typeof obj === 'object' ? (obj?.ID_Sede ?? obj?.sede_id ?? obj?.id ?? obj?.value) : obj;
    } catch (_) {}
    const id = Number(value);
    if (Number.isInteger(id) && id > 0) return id;
  }
  return 0;
};
const request = async (path, options={}) => {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token()}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.errors ? Object.values(data.errors).flat().join(' ') : '';
    throw new Error(detail || data?.message || `Error HTTP ${response.status}`);
  }
  return data;
};

const clienteId = computed(() => Number(route.params.id) || 0);
const loading = ref(false);
const imageError = ref(false);
const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth() + 1);
const user = ref({
  nombre:'', id:'', foto:null, pesoInicial:'—', pesoActual:'—', estatura:'—',
  grasaCorporal:'—', masaMuscular:'—', aguaCorporal:'—', imc:'—',
  aumentoFuerza:'—', caloriasPromedio:'—', inscripcion:'—', celular:'—',
  correo:'—', asistenciaPorcentaje:0, proximoCorte:'—', saldoAPagar:'$0.00',
  eficienciaMuscular:'—', eficienciaMuscularPorcentaje:0,
});
const rachaInfo = ref({ dias:0, mejorRacha:0, nombreMascota:'Mi mascota', nivelMascota:'Nivel 1', tipoMascota:'perro' });
const diasCalendario = ref([]);
const handleImageError = () => { imageError.value = true; };
const initials = computed(() => (user.value.nombre || '?').split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase());
const etapaActual = computed(() => {
  const dias = rachaInfo.value.dias;
  if (dias === 0) return 'huevo';
  if (dias < 10) return 'bebe';
  if (dias < 30) return 'adolescente';
  if (dias < 100) return 'adulto';
  if (dias < 200) return 'senior';
  return 'musculoso';
});
const ETAPAS = [
  { key:'huevo', min:0, es:'Huevito', en:'Egg' },
  { key:'bebe', min:1, es:'Bebé', en:'Baby' },
  { key:'adolescente', min:10, es:'Adolescente', en:'Teen' },
  { key:'adulto', min:30, es:'Adulto', en:'Adult' },
  { key:'senior', min:100, es:'Senior', en:'Senior' },
  { key:'musculoso', min:200, es:'Musculoso', en:'Muscular' },
];
const etapaIdx = computed(() => Math.max(0, ETAPAS.findIndex(e => e.key === etapaActual.value)));
const etapaSiguiente = computed(() => ETAPAS[etapaIdx.value + 1] || null);
const etapaPct = computed(() => {
  const siguiente = etapaSiguiente.value;
  if (!siguiente) return 100;
  const actual = ETAPAS[etapaIdx.value];
  const pct = (rachaInfo.value.dias - actual.min) / (siguiente.min - actual.min) * 100;
  return Math.round(Math.min(100, Math.max(0, pct)));
});
const etapaMensaje = computed(() => {
  const siguiente = etapaSiguiente.value;
  if (!siguiente) return txt('¡Etapa máxima alcanzada!', 'Max stage reached!');
  const faltan = Math.max(0, siguiente.min - rachaInfo.value.dias);
  return txt(`Faltan ${faltan} ${faltan === 1 ? 'día' : 'días'} para ${siguiente.es}`, `${faltan} ${faltan === 1 ? 'day' : 'days'} left to ${siguiente.en}`);
});
const animalLabel = computed(() => ({ perro: txt('Perro', 'Dog'), gato: txt('Gato', 'Cat'), conejo: txt('Conejo', 'Rabbit'), zorro: txt('Zorro', 'Fox') })[rachaInfo.value.tipoMascota] || rachaInfo.value.tipoMascota);
const RING_RADIUS = 44;
const ringCircumference = 2 * Math.PI * RING_RADIUS;
const ringOffset = computed(() => ringCircumference * (1 - Math.min(100, Math.max(0, user.value.asistenciaPorcentaje || 0)) / 100));
const diasAsistidosMes = computed(() => diasCalendario.value.filter(d => d.estado === 'asistio').length);
const diasFaltoMes = computed(() => diasCalendario.value.filter(d => d.estado === 'falto').length);
const diasRegistradosMes = computed(() => diasAsistidosMes.value + diasFaltoMes.value);
const porcentajeMes = computed(() => diasRegistradosMes.value ? Math.round(diasAsistidosMes.value / diasRegistradosMes.value * 100) : 0);
const rachaActualMes = computed(() => rachaInfo.value.dias);
const mejorRachaMes = computed(() => rachaInfo.value.mejorRacha);
const semanasCalendario = computed(() => {
  const semanas = [];
  for (let i=0; i<diasCalendario.value.length; i+=7) semanas.push(diasCalendario.value.slice(i, i+7));
  return semanas;
});
const resumenSemanas = computed(() => semanasCalendario.value.map((semana, idx) => {
  const asistidos = semana.filter(d=>d.estado === 'asistio').length;
  const registrados = semana.filter(d=>d.estado === 'asistio'||d.estado === 'falto').length;
  return {numero:idx+1, pct:registrados ? Math.round(asistidos/registrados*100) : 0};
}));

/* ---------- Buscador de clientes (igual que en Editar usuario) ---------- */
const clientesBusqueda = ref([]);
const showSuggestions = ref(false);
const searchBox = ref(null);
const suggestions = computed(() => {
  const q = searchQuery.value.trim().toLocaleLowerCase();
  if (!q) return [];
  return clientesBusqueda.value
    .filter(c => [c.Nombre, c.Apellido_P, c.Apellido_M, c.Celular, c.Correo_Electronico, c.ID_Cliente]
      .some(v => String(v ?? '').toLocaleLowerCase().includes(q)))
    .slice(0, 8);
});
const loadSearch = async () => {
  if (!sedeId()) { clientesBusqueda.value = []; return; }
  try {
    const data = await request(`/api/gym/clientes?sede_id=${sedeId()}`);
    clientesBusqueda.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (e) { console.error(e); }
};
const chooseClient = (c) => {
  showSuggestions.value = false;
  searchQuery.value = '';
  router.push({ path: `/GYM_ACCOUNT/statistics/${c.ID_Cliente}`, query: { sede_id: Number(c.ID_Sede) || sedeId() } });
};
const handleSearch = () => {
  if (suggestions.value.length === 1) chooseClient(suggestions.value[0]);
  else showSuggestions.value = true;
};
const closeSuggestionsOutside = (e) => {
  if (searchBox.value && !searchBox.value.contains(e.target)) showSuggestions.value = false;
};

let loadSequence = 0;
const loadStats = async () => {
  const seq = ++loadSequence;
  if (!clienteId.value) { loading.value = false; return; }
  if (!sedeId()) {
    notify(txt('Selecciona una sucursal para ver las estadísticas.', 'Select a branch to view the statistics.'), 'warning');
    return;
  }
  loading.value = true;
  try {
    const data = await request(`/api/gym/clientes/${clienteId.value}/estadisticas?sede_id=${sedeId()}`);
    if (seq !== loadSequence) return;
    user.value = data.user;
    rachaInfo.value = data.rachaInfo;
    diasCalendario.value = data.calendario || [];
    year.value = data.anio;
    month.value = data.mes;
    imageError.value = false;
  } catch (e) {
    if (seq === loadSequence) notify(e.message, 'error');
  } finally {
    if (seq === loadSequence) loading.value = false;
  }
};

const branchChange = () => { clientesBusqueda.value = []; loadSearch(); loadStats(); };
onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', branchChange);
  document.addEventListener('click', closeSuggestionsOutside);
  loadSearch();
  loadStats();
});
onUnmounted(() => {
  loadSequence++;
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', branchChange);
  document.removeEventListener('click', closeSuggestionsOutside);
});
watch(() => [route.params.id, route.query.sede_id], loadStats);
</script>



<template>

  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <main class="main-content">

      <!-- capa decorativa ambiental -->

      <div class="ambient-glow glow-a" aria-hidden="true"></div>

      <div class="ambient-glow glow-b" aria-hidden="true"></div>



      <div class="stats-container">



        <div class="view-header-flex">

          <div class="view-header">

            <span class="eyebrow">{{ t('activeUserTag') }}</span>

            <h1 class="title">{{ t('statsTitlePrefix') }} <span class="highlight-text">{{ t('statsTitleHighlight') }}</span></h1>

            <p class="subtitle">{{ t('statsSubtitle') }}</p>

          </div>

          <div id="tutor-0" ref="searchBox" class="search-small input-group">
            <label for="client-search">{{ t('searchClientLabel') }}</label>
            <div class="search-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                id="client-search"
                v-model="searchQuery"
                type="text"
                autocomplete="off"
                :placeholder="t('searchPlaceholder')"
                @focus="showSuggestions = true"
                @input="showSuggestions = true"
                @keyup.enter="handleSearch"
                @keyup.esc="showSuggestions = false"
              />
            </div>
            <div v-if="showSuggestions && searchQuery.trim()" class="client-suggestions" role="listbox">
              <button v-for="c in suggestions" :key="c.ID_Cliente" type="button" class="client-suggestion" role="option" @click="chooseClient(c)">
                <span class="suggestion-avatar">{{ String(c.Nombre || '?').charAt(0).toUpperCase() }}</span>
                <span class="suggestion-info"><strong>{{ [c.Nombre, c.Apellido_P, c.Apellido_M].filter(Boolean).join(' ') }}</strong><small>{{ c.Correo_Electronico || c.Celular || txt('Cliente registrado', 'Registered client') }}</small></span>
                <span class="suggestion-id">#{{ c.ID_Cliente }}</span>
              </button>
              <p v-if="!suggestions.length" class="suggestion-empty">{{ txt('No se encontraron clientes en esta sucursal.', 'No clients found in this branch.') }}</p>
            </div>
          </div>

        </div>



        <div v-if="loading" class="loading-bar" role="status" :aria-label="txt('Cargando estadísticas...', 'Loading statistics...')"></div>

        <div v-if="!clienteId" class="empty-state">
          <span class="empty-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <h3>{{ txt('Busca un cliente', 'Search for a client') }}</h3>
          <p>{{ txt('Escribe un nombre, correo, celular o ID para ver sus estadísticas.', 'Type a name, email, phone or ID to see their statistics.') }}</p>
        </div>

        <div v-else class="dashboard-grid" :class="{ 'is-loading': loading }">



          <!-- COLUMNA IZQUIERDA -->

          <div class="column-left">

            <div id="tutor-1" class="user-profile-card reveal" style="--reveal-delay:0">

              <div class="profile-main-info">
                <!-- FOTO DEL USUARIO (solo lectura) -->
                <div class="avatar-wrapper">
                  <svg id="tutor-2" class="avatar-ring" viewBox="0 0 96 96">
                    <circle class="ring-track" cx="48" cy="48" r="44" />
                    <circle
                      class="ring-fill"
                      cx="48" cy="48" r="44"
                      :stroke-dasharray="ringCircumference"
                      :stroke-dashoffset="ringOffset"
                    />
                  </svg>
                  <div class="avatar-circle">
                    <img
                      v-if="user.foto && !imageError"
                      :src="user.foto"
                      :alt="user.nombre"
                      class="avatar-image"
                      @error="handleImageError"
                    />
                    <span v-else class="avatar-initials">{{ initials }}</span>
                  </div>
                </div>

                <div class="user-names">
                  <span id="tutor-5" class="user-id">ID · {{ user.id }}</span>
                  <h2 id="tutor-4">{{ user.nombre }}</h2>
                  <div id="tutor-3" class="attendance-badge"><i></i>{{ user.asistenciaPorcentaje }}% {{ t('attendanceBadgeSuffix') }}</div>
                </div>
              </div>

              <div class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t('bodyCompositionTitle') }}</div>

              <div id="tutor-6" class="metrics-grid">

                <div id="tutor-7" class="metric-box"><span class="metric-label">{{ t('initialWeightLabel') }}</span><span class="metric-value">{{ user.pesoInicial }}</span></div>

                <div id="tutor-8" class="metric-box"><span class="metric-label">{{ t('currentWeightLabel') }}</span><span class="metric-value accent">{{ user.pesoActual }}</span></div>

                <div id="tutor-9" class="metric-box"><span class="metric-label">{{ t('heightLabel') }}</span><span class="metric-value">{{ user.estatura }}</span></div>

                <div id="tutor-10" class="metric-box"><span class="metric-label">{{ t('bodyFatLabel') }}</span><span class="metric-value warning">{{ user.grasaCorporal }}</span></div>

                <div id="tutor-11" class="metric-box"><span class="metric-label">{{ t('muscleMassLabel') }}</span><span class="metric-value accent">{{ user.masaMuscular }}</span></div>

                <div id="tutor-12" class="metric-box"><span class="metric-label">{{ t('avgCaloriesLabel') }}</span><span class="metric-value">{{ user.caloriasPromedio }}</span></div>

              </div>



              <div class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t('advancedMetricsTitle') }}</div>

              <div id="tutor-13" class="metrics-grid advanced-metrics">

                <div id="tutor-14" class="metric-box"><span class="metric-label">{{ t('bodyWaterLabel') }}</span><span class="metric-value info">{{ user.aguaCorporal }}</span></div>

                <div id="tutor-15" class="metric-box"><span class="metric-label">{{ t('bmiLabel') }}</span><span class="metric-value">{{ user.imc }}</span></div>

                <div id="tutor-16" class="metric-box"><span class="metric-label">{{ t('strengthGainLabel') }}</span><span class="metric-value accent">{{ user.aumentoFuerza }}</span></div>

              </div>



              <div id="tutor-17" class="performance-chart-box">

                <div class="chart-header">

                  <span class="chart-title">{{ t('muscleEfficiencyTitle') }}</span>

                  <span class="chart-percentage">{{ user.eficienciaMuscular }}</span>

                </div>

                <div class="progress-bar-bg">

                  <div class="progress-bar-fill" :style="{ width: (user.eficienciaMuscularPorcentaje || 0) + '%' }">

                    <span class="progress-bar-shine"></span>

                  </div>

                </div>

              </div>



              <div id="tutor-18" class="contact-info-list">

                <div class="contact-item">

                  <span class="contact-icon">

                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>

                  </span>

                  <div class="contact-text">

                    <span class="contact-label">{{ t('enrollmentDateLabel') }}</span>

                    <span class="contact-val">{{ user.inscripcion }}</span>

                  </div>

                </div>



                <div class="contact-item">

                  <span class="contact-icon">

                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"></path></svg>

                  </span>

                  <div class="contact-text">

                    <span class="contact-label">{{ t('phoneLabel') }}</span>

                    <span class="contact-val">{{ user.celular }}</span>

                  </div>

                </div>



                <div class="contact-item">

                  <span class="contact-icon">

                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>

                  </span>

                  <div class="contact-text">

                    <span class="contact-label">{{ t('emailLabel') }}</span>

                    <span class="contact-val email-text" :title="user.correo">{{ user.correo }}</span>

                  </div>

                </div>

              </div>

            </div>



            </div>



          <!-- COLUMNA DERECHA -->

          <div class="column-right">



            <!-- CALENDARIO (diseño original) -->

            <div id="tutor-21" class="calendar-card reveal" style="--reveal-delay:1">

              <div class="calendar-glow glow-1" aria-hidden="true"></div>

              <div class="calendar-glow glow-2" aria-hidden="true"></div>

              <div class="calendar-grid-pattern" aria-hidden="true"></div>



              <div class="calendar-content">

                <div class="calendar-header">

                  <div class="calendar-header-title">

                    <span class="calendar-icon">

                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>

                    </span>

                    <h3>{{ t('calendarHeaderTitle') }}</h3>

                  </div>

                  <span class="year-badge">{{ year }}</span>

                </div>



                <div class="calendar-stats-row">

                  <div class="calendar-stat-chip streak">

                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#facc15" stroke="#f97316" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 4-4 7-4 11a4 4 0 0 0 8 0c0-2-.5-3.5-1.5-5C15.5 10 16 12 16 12s2-2 2-4c0-3.5-3-6-6-6z"/></svg>

                    <span>{{ txt('Racha actual', 'Current streak') }}: <b>{{ rachaActualMes }}</b></span>

                  </div>

                  <div class="calendar-stat-chip best">

                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17h4v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>

                    <span>{{ txt('Mejor racha', 'Best streak') }}: <b>{{ mejorRachaMes }}</b></span>

                  </div>

                </div>



                <div class="calendar-progress-row">

                  <div class="progress-track">

                    <div class="progress-fill" :style="{ width: porcentajeMes + '%' }"></div>

                  </div>

                  <div class="progress-label">

                    <span>{{ diasAsistidosMes }}/{{ diasRegistradosMes }} {{ txt('días registrados', 'registered days') }}</span>

                    <span class="progress-percent">{{ porcentajeMes }}%</span>

                  </div>

                </div>



                <div class="calendar-body-row">

                  <div class="calendar-grid-column">

                    <div class="weekdays-row">

                      <span>{{ txt('D', 'Su') }}</span><span>{{ txt('L', 'Mo') }}</span><span>{{ txt('M', 'Tu') }}</span><span>{{ txt('M', 'We') }}</span><span>{{ txt('J', 'Th') }}</span><span>{{ txt('V', 'Fr') }}</span><span>{{ txt('S', 'Sa') }}</span>

                    </div>

                    <div class="days-grid">

                      <div v-for="(item, index) in diasCalendario" :key="index" class="day-cell" :class="item.estado">

                        <span class="day-number">{{ item.dia }}</span>

                        <span v-if="item.estado === 'hoy'" class="hoy-ring"></span>

                        <span v-if="item.estado === 'asistio' || item.estado === 'falto'" class="day-icon" :class="item.estado">

                          <svg v-if="item.estado === 'asistio'" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0a2e18" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>

                          <svg v-else width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3a0d0d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>

                        </span>

                      </div>

                    </div>

                  </div>



                  <div class="weeks-summary-column">

                    <span class="weeks-summary-title">{{ txt('Sem', 'Wk') }}</span>

                    <div v-for="semana in resumenSemanas" :key="semana.numero" class="week-summary-item">

                      <div class="week-bar-track">

                        <div class="week-bar-fill" :style="{ height: semana.pct + '%' }"></div>

                      </div>

                      <span class="week-summary-pct">{{ semana.pct }}%</span>

                    </div>

                  </div>

                </div>



                <div class="calendar-legend">

                  <div class="legend-item asistio"><span class="dot asistio"></span> {{ t('legendAttended') }} <b>{{ diasAsistidosMes }}</b></div>

                  <div class="legend-item falto"><span class="dot falto"></span> {{ t('legendMissed') }} <b>{{ diasFaltoMes }}</b></div>

                  <div class="legend-item"><span class="dot hoy"></span> {{ t('legendToday') }}</div>

                </div>

              </div>

            </div>



            <div class="bottom-financial-grid">

              <div id="tutor-19" class="info-card financial-card red-accent reveal" style="--reveal-delay:1">

                <div class="card-icon-badge red">

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>

                </div>

                <div class="card-text-group">

                  <span class="card-mini-title">{{ t('nextCutTitle') }}</span>

                  <span class="card-highlight-val red">{{ user.proximoCorte }}</span>

                </div>

              </div>

              <div id="tutor-20" class="info-card financial-card green-accent reveal" style="--reveal-delay:2">

                <div class="card-icon-badge green">

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>

                </div>

                <div class="card-text-group">

                  <span class="card-mini-title">{{ t('balanceDueTitle') }}</span>

                  <span class="card-highlight-val green">{{ user.saldoAPagar }}</span>

                </div>

              </div>

            </div>




          </div>

          <!-- TARJETA DE RACHA -->
            <div id="tutor-22" class="streak-card reveal" :class="`theme-${etapaActual}`" style="--reveal-delay:2">
              <div class="streak-glow" aria-hidden="true"></div>

              <div class="streak-header-row">
                <div class="streak-title-group">
                  <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t('petAndStreakTitle') }}</span>
                  <span class="streak-sub">{{ t('streakSub') }}</span>
                </div>
                <span class="pet-level-badge">{{ rachaInfo.nivelMascota }}</span>
              </div>

              <div class="streak-content-layout">
                <!-- MASCOTA -->
                <div class="pet-display-box">
                  <div class="pet-visual-readonly">
                    <FitnessPet
                      :nombre="rachaInfo.nombreMascota"
                      :nivel="rachaInfo.nivelMascota"
                      :racha="rachaInfo.dias"
                      :tipo="rachaInfo.tipoMascota"
                    />
                  </div>

                  <div class="pet-configuration">
                    <div class="pet-chip">
                      <span class="pet-chip-label">{{ txt('Animal', 'Animal') }}</span>
                      <strong>{{ animalLabel }}</strong>
                    </div>
                    <div class="pet-chip">
                      <span class="pet-chip-label">{{ txt('Nombre', 'Name') }}</span>
                      <strong :title="rachaInfo.nombreMascota">{{ rachaInfo.nombreMascota }}</strong>
                    </div>
                  </div>
                </div>

                <!-- RACHA -->
                <div class="streak-counter-box">
                  <span class="streak-footer-text">{{ t('streakFooterText') }}</span>

                  <div class="streak-number-wrapper">
                    <span class="streak-number animate-bounce">{{ rachaInfo.dias }}</span>
                    <span class="fire-icon animate-pulse">🔥</span>
                  </div>

                  <span class="streak-best">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17h4v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                    {{ txt('Mejor racha', 'Best streak') }}: <b>{{ mejorRachaMes }}</b>
                  </span>

                  <div class="stage-progress">
                    <div class="stage-progress-head">
                      <span>{{ txt(ETAPAS[etapaIdx].es, ETAPAS[etapaIdx].en) }}</span>
                      <span v-if="etapaSiguiente">{{ txt(etapaSiguiente.es, etapaSiguiente.en) }}</span>
                    </div>
                    <div class="stage-track">
                      <div class="stage-fill" :style="{ width: etapaPct + '%' }"></div>
                    </div>
                    <p class="stage-message">{{ etapaMensaje }}</p>

                    <div class="stage-steps" aria-hidden="true">
                      <template v-for="(e, i) in ETAPAS" :key="e.key">
                        <span v-if="i > 0" class="stage-line" :class="{ done: i <= etapaIdx }"></span>
                        <span
                          class="stage-dot"
                          :class="{ done: i < etapaIdx, current: i === etapaIdx }"
                          :title="txt(e.es, e.en)"
                        ></span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>



        </div>

      </div>

    </main>

  </HeadingGYM_ACCOUNT>

</template>



<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&display=swap');



.main-content {

  min-height: calc(100vh - 80px);

  background: transparent;

  color: var(--color-texto-general, #f5f5f4);

  font-family: 'Inter', sans-serif;

  padding: 30px 40px;

  position: relative;

  overflow-x: hidden;

  box-sizing: border-box;

}



/* ---------- Ambiente decorativo ---------- */

.ambient-glow {

  position: absolute;

  border-radius: 50%;

  filter: blur(90px);

  pointer-events: none;

  z-index: 0;

  opacity: 0.35;

}

.glow-a { width: 420px; height: 420px; top: -120px; right: -100px; background: radial-gradient(circle, var(--color-highlight, #3b82f6) 0%, transparent 70%); }

.glow-b { width: 380px; height: 380px; bottom: 10%; left: -140px; background: radial-gradient(circle, #22c55e 0%, transparent 70%); opacity: 0.18; }

@media (max-width: 768px) { .ambient-glow { display: none; } }



.stats-container { max-width: 1300px; margin: 0 auto; position: relative; z-index: 2; }



.view-header-flex { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }

.view-header { flex: 1; min-width: 240px; }

.eyebrow { display: inline-block; font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--color-highlight, #60a5fa); background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; }

.title { font-family: 'Anton', sans-serif; font-size: clamp(1.9rem, 5vw, 2.7rem); color: var(--color-titulos, #fff); margin: 0; letter-spacing: 1px; text-transform: uppercase; line-height: 1.05; }

.highlight-text { background: linear-gradient(120deg, var(--color-highlight, #3b82f6), #60d394 120%); -webkit-background-clip: text; background-clip: text; color: transparent; }

.subtitle { font-size: 0.92rem; color: rgba(245, 245, 244, 0.6); margin: 8px 0 0; line-height: 1.4; font-weight: 400; max-width: 520px; }



/* ---------- Buscador (mismo estilo que Editar usuario) ---------- */
.view-header-flex, .search-small { position: relative; }
.view-header-flex { z-index: 20; }
.search-small { z-index: 21; width: min(100%, 320px); flex-shrink: 0; --accent: var(--color-highlight, #3b82f6); --card: var(--bg-cards, #121416); --text: var(--color-texto-general, #e5e7eb); --muted: #8b95a7; --line: color-mix(in srgb, var(--text) 10%, transparent); --input: color-mix(in srgb, var(--card) 90%, #ffffff); }
.input-group { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.input-group label { color: color-mix(in srgb, var(--text) 78%, transparent); font-size: 0.72rem; font-weight: 500; line-height: 1.2; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-input-wrapper svg { position: absolute; z-index: 2; left: 13px; width: 16px; height: 16px; color: var(--muted); pointer-events: none; }
.search-input-wrapper input {
  width: 100%; height: 44px; box-sizing: border-box; padding: 0 13px 0 38px;
  border: 1px solid var(--line); border-radius: 10px; background: var(--input);
  color: var(--color-texto-input, var(--text)); font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500; outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.search-input-wrapper input::placeholder { color: color-mix(in srgb, var(--muted) 70%, transparent); font-weight: 400; }
.search-input-wrapper input:hover { border-color: color-mix(in srgb, var(--text) 24%, transparent); }
.search-input-wrapper input:focus { border-color: var(--accent); background: color-mix(in srgb, var(--input) 90%, var(--accent)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.client-suggestions { position: absolute; top: calc(100% + 8px); right: 0; left: 0; z-index: 50; max-height: 310px; overflow-y: auto; border: 1px solid #39394e; border-radius: 12px; background: #1b1b2b; box-shadow: 0 18px 42px rgba(0,0,0,.45); padding: 5px; box-sizing: border-box; }
.client-suggestion { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border: 0; border-radius: 8px; background: transparent; color: #f5f5fa; text-align: left; cursor: pointer; font-family: inherit; }
.client-suggestion:hover, .client-suggestion:focus-visible { background: #303047; outline: none; }
.suggestion-avatar { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 9px; background: rgba(238,80,126,.15); color: #ff789f; font-size: 13px; font-weight: 700; }
.suggestion-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.suggestion-info strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 600; }
.suggestion-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: #a8a9c2; }
.suggestion-id { flex-shrink: 0; color: #a8a9c2; font-size: 11px; }
.suggestion-empty { margin: 0; padding: 12px; color: #b6b7c9; font-size: 12px; }
@media (max-width: 768px) { .search-small { width: 100%; } .client-suggestions { max-height: 240px; } }

/* ---------- Carga y estado vacío (sin notificaciones) ---------- */
.loading-bar { position: relative; height: 3px; margin: -14px 0 20px; border-radius: 3px; overflow: hidden; background: rgba(255, 255, 255, 0.06); }
.loading-bar::after { content: ''; position: absolute; inset: 0; width: 35%; background: linear-gradient(90deg, transparent, var(--color-highlight, #3b82f6), transparent); animation: loadSlide 1.1s ease-in-out infinite; }
@keyframes loadSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
.dashboard-grid { transition: opacity 0.25s ease; }
.dashboard-grid.is-loading { opacity: 0.55; pointer-events: none; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 64px 20px; text-align: center;
  border: 1px dashed var(--border-cards, rgba(255, 255, 255, 0.14)); border-radius: var(--app-border-radius, 20px);
  background: var(--bg-cards, rgba(18, 18, 18, 0.6));
}
.empty-icon { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 16px; color: var(--color-highlight, #60a5fa); background: color-mix(in srgb, var(--color-highlight, #3b82f6) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 28%, transparent); }
.empty-state h3 { margin: 6px 0 0; font-family: 'Oswald', sans-serif; font-size: 1.2rem; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; color: var(--color-titulos, #fff); }
.empty-state p { margin: 0; max-width: 360px; font-size: 0.85rem; line-height: 1.5; color: rgba(245, 245, 244, 0.6); }

/* ---------- Notificaciones (centradas, igual que Editar usuario) ---------- */
:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important;
  max-width: 480px !important;
  left: 50% !important;
  right: auto !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  transform: translateX(-50%) !important;
}



.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 24px; align-items: stretch; }
.dashboard-grid > .streak-card { grid-column: 1 / -1; }
.column-left > .user-profile-card { flex: 1; }
.column-right > .calendar-card { flex: 1; }
.calendar-content { height: 100%; justify-content: space-between; }

@media (max-width: 1024px) {

  .dashboard-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }

  .main-content { padding: 20px 16px; }

}



.column-left { display: flex; flex-direction: column; gap: 20px; min-width: 0; }



/* ---------- Entrada animada de tarjetas ---------- */

.reveal { animation: revealCard 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: calc(var(--reveal-delay, 0) * 90ms); }

@keyframes revealCard { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {

  .reveal, .animate-bounce, .animate-pulse, .progress-bar-shine, .streak-glow, .hoy-ring, .loading-bar::after { animation: none !important; }

  .progress-fill, .week-bar-fill { transition: none !important; }

}



/* ---------- Tarjeta de perfil ---------- */

.user-profile-card {

  background: var(--bg-cards, rgba(18, 18, 18, 0.75));

  backdrop-filter: blur(20px);

  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.12));

  border-radius: var(--app-border-radius, 24px);

  padding: 28px;

  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.04);

  position: relative;

  overflow: hidden;

}

.user-profile-card::before {

  content: '';

  position: absolute;

  top: -60%; right: -30%;

  width: 300px; height: 300px;

  background: radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 72%);

  pointer-events: none;

}



.profile-main-info {
  position: relative; z-index: 1; display: flex; align-items: center; gap: 24px;
  margin-bottom: 8px; padding: 22px 24px; border-radius: 18px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-highlight, #3b82f6) 14%, rgba(255, 255, 255, 0.02)), rgba(255, 255, 255, 0.02) 72%);
  border: 1px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 22%, rgba(255, 255, 255, 0.06));
}

/* Foto del usuario con anillo de asistencia */
.avatar-wrapper { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.avatar-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); z-index: 2; pointer-events: none; }
.ring-track { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 4; }
.ring-fill {
  fill: none; stroke: #4ade80; stroke-width: 4; stroke-linecap: round;
  transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 0 6px rgba(74, 222, 128, 0.5));
}
.avatar-circle {
  position: absolute; inset: 9.4%;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 65%, transparent);
  background: #080a0d;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}
.avatar-image { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.avatar-initials { font-family: 'Oswald', sans-serif; font-size: 2rem; font-weight: 600; color: var(--color-highlight, #60a5fa); }

.user-names { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 9px; }
.user-id {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px;
  font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
  color: var(--color-highlight, #93c5fd);
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 28%, transparent);
}
.user-names h2 {
  margin: 0; font-family: 'Inter', sans-serif; font-weight: 700; font-size: clamp(1.25rem, 2.6vw, 1.7rem);
  line-height: 1.15; letter-spacing: -0.4px; color: var(--color-titulos, #fff);
  overflow-wrap: anywhere; text-wrap: balance;
}
.attendance-badge {
  display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 999px;
  font-size: 11px; font-weight: 700; white-space: nowrap; color: #4ade80;
  background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.32);
}
.attendance-badge i { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px rgba(74, 222, 128, 0.8); }

@media (max-width: 600px) {
  .profile-main-info { flex-direction: column; text-align: center; gap: 16px; padding: 22px 16px 20px; }
  .avatar-wrapper { width: 112px; height: 112px; }
  .user-names { align-items: center; }
}

.section-subtitle-small { display: flex; align-items: center; gap: 8px; font-family: 'Oswald', sans-serif; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; color: var(--color-highlight, #3b82f6); margin-bottom: 10px; margin-top: 20px; letter-spacing: 0.5px; position: relative; z-index: 1; }

.subtitle-bar { width: 3px; height: 14px; border-radius: 2px; background: linear-gradient(180deg, var(--color-highlight, #3b82f6), transparent); flex-shrink: 0; }



.metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px; background: rgba(0, 0, 0, 0.28); padding: 14px; border-radius: var(--app-border-radius, 16px); border: 1px solid var(--border-line, rgba(255, 255, 255, 0.06)); position: relative; z-index: 1; }

.advanced-metrics { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 480px) {

  .metrics-grid, .advanced-metrics { grid-template-columns: repeat(2, 1fr); }
  .advanced-metrics > .metric-box:last-child:nth-child(odd) { grid-column: 1 / -1; }

}

.metric-box {

  display: flex; flex-direction: column; gap: 5px; text-align: center;

  background: rgba(255, 255, 255, 0.03); padding: 11px 8px; border-radius: 12px;

  border: 1px solid rgba(255, 255, 255, 0.05);

  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;

}

.metric-box:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.055); }

.metric-label { font-size: 9.5px; color: rgba(245, 245, 244, 0.5); text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px; }

.metric-value { font-family: 'Inter', sans-serif; font-size: 14.5px; font-weight: 700; color: #f5f5f4; }

.metric-value.accent { color: #4ade80; }

.metric-value.warning { color: #facc15; }

.metric-value.info { color: #38bdf8; }



.performance-chart-box { background: rgba(0, 0, 0, 0.28); border: 1px solid var(--border-line, rgba(255, 255, 255, 0.06)); border-radius: var(--app-border-radius, 16px); padding: 15px 16px; margin-top: 14px; margin-bottom: 18px; position: relative; z-index: 1; }

.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; font-size: 11px; font-family: 'Inter', sans-serif; }

.chart-title { color: rgba(245, 245, 244, 0.7); text-transform: uppercase; font-weight: 600; font-size: 10px; letter-spacing: 0.3px; }

.chart-percentage { color: #4ade80; font-weight: 700; }

.progress-bar-bg { width: 100%; height: 9px; background: rgba(255, 255, 255, 0.06); border-radius: 5px; overflow: hidden; }

.progress-bar-fill { position: relative; width: 75%; height: 100%; background: linear-gradient(90deg, var(--color-botones, #1c4fd6) 0%, #4ade80 100%); border-radius: 5px; box-shadow: 0 0 12px rgba(74, 222, 128, 0.45); overflow: hidden; }

.progress-bar-shine { position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shineMove 2.8s ease-in-out infinite; }

@keyframes shineMove { 0% { left: -60%; } 100% { left: 130%; } }



.contact-info-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; border-top: 1px solid var(--border-line, rgba(255, 255, 255, 0.08)); padding-top: 18px; position: relative; z-index: 1; }

.contact-item {

  display: flex; align-items: center; gap: 11px; min-width: 0;

  padding: 12px; border-radius: 12px;

  background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.06);

  transition: border-color 0.2s ease, background 0.2s ease;

}

.contact-item:hover { border-color: rgba(255, 255, 255, 0.14); background: rgba(255, 255, 255, 0.05); }

.contact-icon {

  width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;

  border-radius: 10px; color: var(--color-highlight, #60a5fa);

  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 13%, transparent);

  border: 1px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 24%, transparent);

}

.contact-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }

.contact-label { font-size: 10.5px; color: rgba(245, 245, 244, 0.5); font-weight: 500; }

.contact-val { font-size: 12.5px; color: #f5f5f4; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 760px) { .contact-info-list { grid-template-columns: minmax(0, 1fr); } }

@media (min-width: 1025px) and (max-width: 1280px) { .contact-info-list { grid-template-columns: minmax(0, 1fr); } }



.bottom-financial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

@media (max-width: 380px) { .bottom-financial-grid { grid-template-columns: 1fr; } }



.financial-card {

  background: var(--bg-cards, rgba(18, 18, 18, 0.75));

  backdrop-filter: blur(20px);

  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.12));

  border-radius: var(--app-border-radius, 20px);

  padding: 18px;

  display: flex;

  align-items: center;

  gap: 14px;

  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);

  transition: transform 0.25s ease, box-shadow 0.25s ease;

}

.financial-card:hover { transform: translateY(-3px); box-shadow: 0 20px 36px rgba(0,0,0,0.5); }

.card-icon-badge { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.card-icon-badge.red { background: rgba(248, 113, 113, 0.14); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }

.card-icon-badge.green { background: rgba(74, 222, 128, 0.14); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }

.card-text-group { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

.card-mini-title { font-family: 'Oswald', sans-serif; font-size: 0.78rem; color: var(--color-highlight, #3b82f6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.card-highlight-val { font-family: 'Inter', sans-serif; font-size: clamp(1.05rem, 3vw, 1.25rem); font-weight: 700; }

.card-highlight-val.red { color: #f87171; }

.card-highlight-val.green { color: #4ade80; }



.column-right { display: flex; flex-direction: column; gap: 20px; min-width: 0; }



/* ---------- Calendario ---------- */

.calendar-card {

  background: var(--bg-cards, rgba(18, 18, 18, 0.75));

  backdrop-filter: blur(20px);

  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.12));

  border-radius: var(--app-border-radius, 24px);

  padding: 26px;

  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.04);

  position: relative;

  overflow: hidden;

  width: 100%;

  box-sizing: border-box;

}



.calendar-glow { position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none; z-index: 0; }

.calendar-glow.glow-1 { width: 180px; height: 180px; top: -60px; right: -50px; background: radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%); }

.calendar-glow.glow-2 { width: 160px; height: 160px; bottom: -60px; left: -50px; background: radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%); }

.calendar-grid-pattern {

  position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.5;

  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);

  background-size: 18px 18px;

  -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);

  mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);

}



.calendar-content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 16px; }



.calendar-header { display: flex; justify-content: space-between; align-items: center; }

.calendar-header-title { display: flex; align-items: center; gap: 10px; }

.calendar-icon {

  width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;

  background: linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.05));

  border: 1px solid rgba(59,130,246,0.3); border-radius: 9px; color: #93c5fd;

}

.calendar-header h3 { font-family: 'Oswald', sans-serif; font-size: 1.15rem; font-weight: 600; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; color: var(--color-titulos, #fff); }

.year-badge { font-family: 'Inter', sans-serif; color: #0f172a; background: var(--color-highlight, #3b82f6); font-size: 0.8rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; }



/* Chips de racha */

.calendar-stats-row { display: flex; gap: 8px; flex-wrap: wrap; }

.calendar-stat-chip {

  display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500;

  color: rgba(245, 245, 244, 0.75); background: rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.06); padding: 5px 11px; border-radius: 20px;

}

.calendar-stat-chip b { font-weight: 800; color: #f5f5f4; }

.calendar-stat-chip.streak { border-color: rgba(250, 204, 21, 0.25); background: rgba(250, 204, 21, 0.06); }

.calendar-stat-chip.streak b { color: #facc15; }

.calendar-stat-chip.best { border-color: rgba(147, 197, 253, 0.25); background: rgba(147, 197, 253, 0.06); }

.calendar-stat-chip.best b { color: #93c5fd; }



/* Barra de progreso del mes */

.calendar-progress-row { display: flex; flex-direction: column; gap: 5px; }

.progress-track { height: 6px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }

.progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--color-highlight, #3b82f6), #4ade80); transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1); box-shadow: 0 0 8px rgba(74, 222, 128, 0.35); }

.progress-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(245, 245, 244, 0.55); font-weight: 500; }

.progress-percent { color: #4ade80; font-weight: 700; }



/* Cuerpo: grid + resumen semanal */

.calendar-body-row { display: flex; gap: 12px; }

.calendar-grid-column { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }



.weekdays-row { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(245, 245, 244, 0.45); font-weight: 700; letter-spacing: 0.5px; }

.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 7px; }

.day-cell {

  position: relative;

  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;

  border-radius: 10px; font-size: 12px; font-weight: 600;

  background: rgba(255, 255, 255, 0.03); color: rgba(245, 245, 244, 0.7);

  border: 1px solid rgba(255, 255, 255, 0.05);

  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);

  transition: transform 0.18s ease, box-shadow 0.18s ease;

}

.day-cell:hover { transform: translateY(-2px) scale(1.06); box-shadow: 0 6px 16px rgba(0,0,0,0.4); z-index: 2; }

.day-number { position: relative; z-index: 1; line-height: 1; }

.day-cell.asistio { background: linear-gradient(145deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.08)); color: #86efac; border-color: rgba(34, 197, 94, 0.4); }

.day-cell.falto { background: linear-gradient(145deg, rgba(239, 68, 68, 0.26), rgba(239, 68, 68, 0.06)); color: #fca5a5; border-color: rgba(239, 68, 68, 0.35); }

.day-cell.hoy { background: linear-gradient(145deg, rgba(234, 179, 8, 0.32), rgba(234, 179, 8, 0.1)); color: #fde047; border-color: rgba(234, 179, 8, 0.55); box-shadow: 0 0 14px rgba(234, 179, 8, 0.3); font-weight: 800; }

.day-cell.futuro { opacity: 0.4; }



/* Cadena visual entre días asistidos consecutivos en la misma fila */

.day-cell.asistio:not(:nth-child(7n)):has(+ .day-cell.asistio)::before {

  content: ''; position: absolute; top: 50%; right: -7px; width: 7px; height: 2px;

  background: rgba(74, 222, 128, 0.55); z-index: 2; transform: translateY(-1px);

}



.day-icon {

  position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%;

  display: flex; align-items: center; justify-content: center; z-index: 1;

  box-shadow: 0 1px 3px rgba(0,0,0,0.4);

}

.day-icon.asistio { background: #4ade80; }

.day-icon.falto { background: #f87171; }



.hoy-ring {

  position: absolute; inset: -2px; border-radius: 12px;

  border: 1.5px solid rgba(250, 204, 21, 0.55);

  animation: pulseRing 1.8s ease-out infinite;

  pointer-events: none;

}

@keyframes pulseRing { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(1.25); opacity: 0; } }



/* Mini resumen semanal */

.weeks-summary-column {

  display: flex; flex-direction: column; align-items: center; gap: 5px;

  padding-left: 10px; border-left: 1px solid rgba(255, 255, 255, 0.07);

  flex-shrink: 0; width: 38px;

}

.weeks-summary-title { font-size: 9px; color: rgba(245, 245, 244, 0.4); text-transform: uppercase; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 2px; }

.week-summary-item { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; width: 100%; min-height: 0; }

.week-bar-track { flex: 1; width: 9px; min-height: 14px; border-radius: 4px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: flex-end; overflow: hidden; }

.week-bar-fill { width: 100%; border-radius: 4px; background: linear-gradient(180deg, #4ade80, var(--color-highlight, #3b82f6)); transition: height 0.6s ease; }

.week-summary-pct { font-size: 8px; color: rgba(245, 245, 244, 0.45); font-weight: 700; }

@media (max-width: 400px) { .weeks-summary-column { display: none; } }



.calendar-legend { display: flex; justify-content: center; gap: 8px; margin-top: 2px; border-top: 1px solid var(--border-line, rgba(255, 255, 255, 0.08)); padding-top: 16px; flex-wrap: wrap; }

.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(245, 245, 244, 0.65); font-weight: 500; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px; }

.legend-item b { font-weight: 800; color: #f5f5f4; margin-left: 1px; }

.legend-item.asistio { border-color: rgba(34, 197, 94, 0.25); }

.legend-item.falto { border-color: rgba(239, 68, 68, 0.22); }

.dot { width: 8px; height: 8px; border-radius: 50%; }

.dot.asistio { background: #4ade80; box-shadow: 0 0 6px rgba(74,222,128,0.6); }

.dot.falto { background: #f87171; box-shadow: 0 0 6px rgba(248,113,113,0.6); }

.dot.hoy { background: #facc15; box-shadow: 0 0 6px rgba(250,204,21,0.6); }



/* ---------- Tarjeta de racha ---------- */
.streak-card {
  container-type: inline-size;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  overflow: hidden;
  border-radius: var(--app-border-radius, 22px);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: box-shadow 0.5s ease, border-color 0.5s ease;
}
.streak-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 18px 18px;
  -webkit-mask-image: radial-gradient(ellipse at 80% 0%, black 0%, transparent 70%);
  mask-image: radial-gradient(ellipse at 80% 0%, black 0%, transparent 70%);
}
.streak-glow {
  position: absolute; top: -40%; right: -20%; width: 260px; height: 260px;
  background: radial-gradient(circle, var(--accent-color, #facc15) 0%, transparent 70%);
  opacity: 0.2; pointer-events: none; filter: blur(12px);
  animation: glowDrift 6s ease-in-out infinite;
}
@keyframes glowDrift { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10px, 10px) scale(1.08); } }

.theme-huevo { background: linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(148, 163, 184, 0.4); --accent-color: #cbd5e1; }
.theme-bebe { background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(234, 179, 8, 0.4); --accent-color: #facc15; }
.theme-adolescente { background: linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(249, 115, 22, 0.4); --accent-color: #fb923c; }
.theme-adulto { background: linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(236, 72, 153, 0.4); --accent-color: #f472b6; }
.theme-senior { background: linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(168, 85, 247, 0.4); --accent-color: #c084fc; }
.theme-musculoso { background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(59, 130, 246, 0.5); --accent-color: #60a5fa; }

.streak-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; position: relative; z-index: 1; }
.streak-title-group { display: flex; flex-direction: column; }
.streak-title-group .section-subtitle-small { margin-top: 0; margin-bottom: 3px; font-size: 1rem; }
.streak-sub { font-size: 12px; color: rgba(245, 245, 244, 0.6); font-weight: 400; padding-left: 11px; }
.pet-level-badge {
  font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; white-space: nowrap;
  color: var(--accent-color, #facc15);
  padding: 6px 13px; border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent-color, #facc15) 60%, transparent);
  background: color-mix(in srgb, var(--accent-color, #facc15) 12%, rgba(0, 0, 0, 0.35));
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent-color, #facc15) 22%, transparent);
}

.streak-content-layout { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; width: 100%; box-sizing: border-box; }
@container (max-width: 520px) {
  .streak-content-layout { grid-template-columns: minmax(0, 1fr); }
}

/* Mascota */
.pet-display-box {
  min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  padding: 16px; border-radius: 18px; box-sizing: border-box; text-align: center;
  background:
    radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--accent-color, #facc15) 16%, transparent), transparent 65%),
    rgba(0, 0, 0, 0.32);
  border: 1px solid color-mix(in srgb, var(--accent-color, #facc15) 22%, rgba(255, 255, 255, 0.06));
}
.pet-visual-readonly { width: 100%; pointer-events: none; }
.pet-configuration { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; width: 100%; }
.pet-chip { min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 9px 12px; text-align: left; border-radius: 11px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.07); }
.pet-chip-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(245, 245, 244, 0.5); }
.pet-chip strong { font-size: 0.9rem; font-weight: 600; color: #f5f5f4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Racha */
.streak-counter-box {
  min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  padding: 20px 18px; border-radius: 18px; box-sizing: border-box; text-align: center;
  background:
    radial-gradient(circle at 50% 22%, color-mix(in srgb, var(--accent-color, #facc15) 14%, transparent), transparent 62%),
    rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.streak-footer-text { font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: rgba(245, 245, 244, 0.65); letter-spacing: 1px; }
.streak-number-wrapper { display: flex; align-items: center; justify-content: center; gap: 10px; }
.streak-number {
  font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: 4.2rem; line-height: 1; letter-spacing: 1px;
  color: #fff;
  background: linear-gradient(180deg, #fff 35%, color-mix(in srgb, var(--accent-color, #facc15) 75%, #fff) 130%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.55));
}
.fire-icon { font-size: 2.1rem; filter: drop-shadow(0 0 12px var(--accent-color, #facc15)); }
.streak-best {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px;
  font-size: 11.5px; font-weight: 500; color: rgba(245, 245, 244, 0.75);
  background: rgba(147, 197, 253, 0.07); border: 1px solid rgba(147, 197, 253, 0.25);
}
.streak-best svg { color: #93c5fd; }
.streak-best b { font-weight: 800; color: #93c5fd; }

/* Progreso de etapa */
.stage-progress { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 4px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.stage-progress-head { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: rgba(245, 245, 244, 0.5); }
.stage-progress-head span:first-child { color: var(--accent-color, #facc15); }
.stage-track { height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.07); overflow: hidden; }
.stage-fill { height: 100%; min-width: 4px; border-radius: 999px; background: linear-gradient(90deg, color-mix(in srgb, var(--accent-color, #facc15) 55%, transparent), var(--accent-color, #facc15)); box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color, #facc15) 55%, transparent); transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
.stage-message { margin: 0; font-size: 11.5px; color: rgba(245, 245, 244, 0.65); }
.stage-steps { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.stage-line { flex: 1; height: 2px; border-radius: 2px; background: rgba(255, 255, 255, 0.1); }
.stage-line.done { background: var(--accent-color, #facc15); opacity: 0.7; }
.stage-dot { width: 10px; height: 10px; flex-shrink: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.14); }
.stage-dot.done { background: var(--accent-color, #facc15); opacity: 0.75; }
.stage-dot.current { background: var(--accent-color, #facc15); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-color, #facc15) 25%, transparent), 0 0 12px var(--accent-color, #facc15); }

@keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes pulseFlame { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.9; } }
.animate-bounce { animation: bounceSlow 2.5s ease-in-out infinite; }
.animate-pulse { animation: pulseFlame 1.8s ease-in-out infinite; display: inline-block; }

/* ---------- Ajustes móviles finos ---------- */

@media (max-width: 600px) {

  .user-profile-card, .calendar-card { padding: 20px; }

  .financial-card { padding: 15px; }

  .streak-number { font-size: 3.2rem; }
  .streak-card { padding: 18px; }


}


/* Ajustes mínimos: mantiene las tarjetas, colores y distribución originales. */
.day-cell.vacio { visibility: hidden; pointer-events: none; }

/* ---------- Pulido visual general ---------- */
.metric-value, .card-highlight-val, .contact-val { font-variant-numeric: tabular-nums; }
.metric-box { background: linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)); }
.financial-card { position: relative; overflow: hidden; }
.financial-card::before { content: ''; position: absolute; left: 0; top: 18%; bottom: 18%; width: 3px; border-radius: 0 3px 3px 0; background: var(--card-accent, var(--color-highlight, #3b82f6)); }
.financial-card.red-accent { --card-accent: #f87171; }
.financial-card.green-accent { --card-accent: #4ade80; }
.user-profile-card, .calendar-card { box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05); }
.day-cell.hoy { font-weight: 800; }
</style>