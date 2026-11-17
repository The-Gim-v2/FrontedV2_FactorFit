<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeadingMember from '../HeadingMember.vue';
import MascotasColeccion from '@/components/MascotasColeccion.vue';
import FitnessPet from '@/components/FitnessPet.vue';
import LineChartSimple from '@/components/LineChartSimple.vue';
import DonutChart from '@/components/DonutChart.vue';
import AvatarCuerpo from '@/components/AvatarCuerpo.vue';
import CalorieRingsChart from '@/components/CalorieRingsChart.vue';
import { solicitudMiembro } from '../memberSesion.js';

const currentLang = ref(localStorage.getItem('member-idioma') || 'es');
const handleLangChange = (e) => { if (e.detail?.idioma) currentLang.value = e.detail.idioma; };
const traducciones = {
  es: {
    statsTitlePrefix: 'Mis',
    statsTitleHighlight: 'Estadísticas',
    statsSubtitle: 'Tu progreso, tu constancia y tu evolución física en un solo lugar.',
    myProfileTag: 'Mi Perfil',
    loading: 'Cargando estadísticas…',
    retry: 'Reintentar',
    errorDefault: 'No se pudieron cargar las estadísticas',
    attendanceTitle: 'Asistencia del mes',
    petProgressTitle: 'Progreso de tu compañero',
    ageSuffix: 'años',
    bodyCompositionTitle: 'Composición corporal',
    initialWeightLabel: 'Peso inicial',
    currentWeightLabel: 'Peso actual',
    heightLabel: 'Estatura',
    bodyFatLabel: 'Grasa corporal',
    muscleMassLabel: 'Masa muscular',
    avgCaloriesLabel: 'Calorías prom.',
    advancedMetricsTitle: 'Métricas avanzadas',
    bodyWaterLabel: 'Agua corporal',
    bmiLabel: 'IMC',
    strengthGainLabel: 'Aumento de fuerza',
    physiqueTitle: 'Tu físico',
    physiqueDesc: 'Vista de tu composición actual, según tu peso, IMC y grasa corporal',
    weightProgressTitle: 'Progreso de peso',
    strengthProgressTitle: 'Progreso de fuerza',
    calendarHeaderTitle: 'Calendario de asistencia',
    calendarDaysAttended: 'días asistidos',
    legendAttended: 'Asististe',
    legendMissed: 'Faltaste',
    legendToday: 'Hoy',
    currentStreakLabel: 'Asistencias del mes',
    bestStreakLabel: 'Total acumulado',
    weekLabel: 'Sem',
    weeklyCaloriesTitle: 'Calorías quemadas',
    bodyCompositionChartTitle: 'Composición corporal',
    petAndStreakTitle: 'Racha y compañero',
    streakSub: 'Cada día de asistencia hace crecer a tu compañero',
    streakFooterText: 'Asistencias acumuladas',
    statusToday: '¡Asistencia registrada hoy!',
    statusPending: 'Pendiente de registrar hoy',
    motivationTip: 'Las faltas no descuentan tus asistencias acumuladas.',
    animalLabel: 'Animal',
    nameLabel: 'Nombre',
    showCollection: 'Ver colección de compañeros',
    hideCollection: 'Ocultar colección',
    stageMax: 'Etapa máxima alcanzada',
    daysUnit: 'días',
    nextRewardIn: (n) => `Faltan ${n} ${n === 1 ? 'día' : 'días'} para tu siguiente recompensa`,
    noAvatar: 'Sin datos suficientes para representar el avatar corporal.',
    noWeight: 'Sin mediciones registradas',
    noStrength: 'Sin registros de fuerza',
    noBodyFat: 'Sin medición de grasa corporal',
    noCalories: 'Sin registros de calorías',
    other: 'Otros',
    animals: { perro: 'Perro', gato: 'Gato', conejo: 'Conejo', zorro: 'Zorro' },
    weekdays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    locale: 'es-ES',
  },
  en: {
    statsTitlePrefix: 'My',
    statsTitleHighlight: 'Stats',
    statsSubtitle: 'Your progress, consistency and physical evolution in one place.',
    myProfileTag: 'My Profile',
    loading: 'Loading statistics…',
    retry: 'Retry',
    errorDefault: 'Could not load the statistics',
    attendanceTitle: 'Attendance this month',
    petProgressTitle: 'Companion progress',
    ageSuffix: 'years old',
    bodyCompositionTitle: 'Body composition',
    initialWeightLabel: 'Initial weight',
    currentWeightLabel: 'Current weight',
    heightLabel: 'Height',
    bodyFatLabel: 'Body fat',
    muscleMassLabel: 'Muscle mass',
    avgCaloriesLabel: 'Avg. calories',
    advancedMetricsTitle: 'Advanced metrics',
    bodyWaterLabel: 'Body water',
    bmiLabel: 'BMI',
    strengthGainLabel: 'Strength gain',
    physiqueTitle: 'Your physique',
    physiqueDesc: 'A view of your current composition, based on your weight, BMI and body fat',
    weightProgressTitle: 'Weight progress',
    strengthProgressTitle: 'Strength progress',
    calendarHeaderTitle: 'Attendance calendar',
    calendarDaysAttended: 'days attended',
    legendAttended: 'Attended',
    legendMissed: 'Missed',
    legendToday: 'Today',
    currentStreakLabel: 'Visits this month',
    bestStreakLabel: 'Lifetime total',
    weekLabel: 'Wk',
    weeklyCaloriesTitle: 'Calories burned',
    bodyCompositionChartTitle: 'Body composition',
    petAndStreakTitle: 'Streak & companion',
    streakSub: 'Every day you show up, your companion grows',
    streakFooterText: 'Total visits',
    statusToday: 'Attendance registered today!',
    statusPending: 'Not registered yet today',
    motivationTip: 'Missed days never reduce your total visits.',
    animalLabel: 'Animal',
    nameLabel: 'Name',
    showCollection: 'View companion collection',
    hideCollection: 'Hide collection',
    stageMax: 'Max stage reached',
    daysUnit: 'days',
    nextRewardIn: (n) => `${n} ${n === 1 ? 'day' : 'days'} left for your next reward`,
    noAvatar: 'Not enough data to render the body avatar.',
    noWeight: 'No measurements recorded',
    noStrength: 'No strength records',
    noBodyFat: 'No body fat measurement',
    noCalories: 'No calorie records',
    other: 'Other',
    animals: { perro: 'Dog', gato: 'Cat', conejo: 'Rabbit', zorro: 'Fox' },
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    locale: 'en-US',
  },
};

const t = computed(() => traducciones[currentLang.value] || traducciones.es);
const cargando = ref(true);
const errorApi = ref('');
const hoyISO = () => {
  // Fecha civil del gimnasio, no UTC; coincide con el servidor Laravel.
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Monterrey', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
};
const hoy = ref(hoyISO());
const usuarioReal = ref(null);
const fotoError = ref(false);
const mostrarColeccion = ref(false);
const mascotaReal = ref({ tipo: 'perro', nombre: 'Mi mascota', nivel: 'Nivel 1' });
const medidasReales = ref(null);
const fechasAsistencia = ref([]);
const fechaInscripcion = ref(null);
const rachaInfo = ref({ dias: 0, activoHoy: false });

/* ---------- Mascota / etapas ---------- */
const UMBRALES_MASCOTA = [0, 1, 10, 30, 100, 200, 365];
const siguienteMeta = computed(() => UMBRALES_MASCOTA.find(n => n > rachaInfo.value.dias) ?? null);
const anteriorMeta = computed(() => [...UMBRALES_MASCOTA].reverse().find(n => n <= rachaInfo.value.dias) ?? 0);
const faltanMeta = computed(() => siguienteMeta.value === null ? 0 : Math.max(0, siguienteMeta.value - rachaInfo.value.dias));
const progresoMeta = computed(() => siguienteMeta.value === null ? 100 : Math.round(Math.min(100, Math.max(0, (rachaInfo.value.dias - anteriorMeta.value) * 100 / Math.max(1, siguienteMeta.value - anteriorMeta.value)))));
const etapaIdx = computed(() => Math.max(0, UMBRALES_MASCOTA.findLastIndex(n => n <= rachaInfo.value.dias)));
const etapaActual = computed(() => {
  const d = rachaInfo.value.dias;
  if (d === 0) return 'huevo';
  if (d < 10) return 'bebe';
  if (d < 30) return 'adolescente';
  if (d < 100) return 'adulto';
  if (d < 200) return 'senior';
  return 'musculoso';
});
const etapaMensaje = computed(() => siguienteMeta.value === null ? t.value.stageMax : t.value.nextRewardIn(faltanMeta.value));
const animalNombre = computed(() => t.value.animals[mascotaReal.value.tipo] || mascotaReal.value.tipo);

/* ---------- Usuario ---------- */
const user = computed(() => {
  const c = usuarioReal.value || {}, m = medidasReales.value || {};
  const f = (v, s = '') => v === null || v === undefined || v === '' ? '—' : `${Number(v).toLocaleString(currentLang.value === 'en' ? 'en-US' : 'es-MX', { maximumFractionDigits: 2 })}${s}`;
  return {
    nombre: c.nombre || '—', id: c.id || '—', foto: c.foto_url || null, edad: c.edad ?? null, sexo: null,
    pesoInicial: f(m.peso_inicial, ' kg'), pesoActual: f(m.peso_actual, ' kg'), estatura: f(m.altura_m, ' m'),
    grasaCorporal: f(m.grasa_corporal, '%'), masaMuscular: f(m.masa_muscular, ' kg'), imc: f(m.imc), aguaCorporal: '—', aumentoFuerza: '—', caloriasPromedio: '—',
    asistenciaPorcentaje: porcentajeMes.value,
  };
});
const initials = computed(() => (user.value.nombre || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase());
const ringOffset = computed(() => 100 - Math.min(100, Math.max(0, user.value.asistenciaPorcentaje || 0)));

/* ---------- Calendario ---------- */
const mesISO = computed(() => hoy.value.slice(0, 7));
const anioActual = computed(() => Number(hoy.value.slice(0, 4)));
const mesActual = computed(() => Number(hoy.value.slice(5, 7)));
const etiquetaMes = computed(() => {
  const d = new Date(`${mesISO.value}-01T12:00:00`);
  const s = d.toLocaleDateString(t.value.locale, { month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
});
const diasCalendario = computed(() => {
  const count = new Date(anioActual.value, mesActual.value, 0).getDate();
  const asistidos = new Set(fechasAsistencia.value);
  return Array.from({ length: count }, (_, i) => {
    const dia = i + 1, fecha = `${mesISO.value}-${String(dia).padStart(2, '0')}`;
    let estado = 'futuro';
    if (fecha > hoy.value) estado = 'futuro';
    else if (asistidos.has(fecha)) estado = 'asistio';
    else if (fecha === hoy.value) estado = 'hoy';
    else if (!fechaInscripcion.value || fecha < fechaInscripcion.value) estado = 'futuro';
    else estado = 'falto';
    return { dia, fecha, estado };
  });
});
const celdasCalendario = computed(() => [
  ...Array.from({ length: new Date(anioActual.value, mesActual.value - 1, 1).getDay() }, () => null),
  ...diasCalendario.value
]);
const semanasCalendario = computed(() => {
  const result = []; for (let i = 0; i < celdasCalendario.value.length; i += 7) result.push(celdasCalendario.value.slice(i, i + 7)); return result;
});
const resumenSemanas = computed(() => semanasCalendario.value.map((semana, i) => {
  const dias = semana.filter(Boolean);
  const asistidos = dias.filter(d => d.estado === 'asistio').length;
  const elegibles = dias.filter(d => d.estado === 'asistio' || d.estado === 'falto').length;
  return { numero: i + 1, pct: elegibles ? Math.round(asistidos / elegibles * 100) : 0 };
}));
const diasAsistidosMes = computed(() => diasCalendario.value.filter(d => d.estado === 'asistio').length);
const diasFaltoMes = computed(() => diasCalendario.value.filter(d => d.estado === 'falto').length);
const diasRegistradosMes = computed(() => diasAsistidosMes.value + diasFaltoMes.value);
const porcentajeMes = computed(() => diasRegistradosMes.value ? Math.round(diasAsistidosMes.value / diasRegistradosMes.value * 100) : 0);
// Racha de asistencia ACUMULADA, no consecutiva: ninguna falta resta puntos.
const rachaActualMes = computed(() => diasAsistidosMes.value);

/* ---------- Gráficas ---------- */
// Sin mediciones de fuerza en las tablas actuales: mantener la gráfica visible sin inventar datos.
const fuerzaHistorico = ref([]);
const caloriasSemanales = ref([]);
const pesoHistorico = computed(() => {
  const a = medidasReales.value?.historial_peso || [];
  return a.map(m => ({ label: m.fecha, value: Number(m.peso) }));
});
const composicionCorporal = computed(() => {
  const m = medidasReales.value || {};
  // Masa muscular en kg y grasa en porcentaje no son categorías equivalentes.
  // Solo mostrar grasa corporal si existe; no inventar el resto de la composición.
  const grasa = Number(m.grasa_corporal);
  if (m.grasa_corporal === null || m.grasa_corporal === undefined || !Number.isFinite(grasa)) return [];
  return [{ label: t.value.bodyFatLabel, value: Math.max(0, Math.min(100, grasa)), color: '#facc15' },
          { label: t.value.other, value: Math.max(0, 100 - grasa), color: '#64748b' }];
});

async function cargarEstadisticas() {
  cargando.value = true; errorApi.value = '';
  try {
    const r = await solicitudMiembro('/api/member/estadisticas');
    usuarioReal.value = r.cliente || null;
    fotoError.value = false;
    mascotaReal.value = { tipo: r.mascota?.tipo || 'perro', nombre: r.mascota?.nombre || 'Mi mascota', nivel: r.mascota?.nivel || 'Nivel 1' };
    medidasReales.value = r.medidas || null;
    fechasAsistencia.value = Array.isArray(r.asistencia?.fechas) ? r.asistencia.fechas : [];
    fechaInscripcion.value = r.fecha_inscripcion || null;
    rachaInfo.value = { dias: Number(r.asistencia?.dias_acumulados || 0), activoHoy: Boolean(r.asistencia?.asistio_hoy) };
    hoy.value = hoyISO();
  } catch (e) { errorApi.value = e?.message || t.value.errorDefault; }
  finally { cargando.value = false; }
}
onMounted(() => { window.addEventListener('idioma-changed', handleLangChange); void cargarEstadisticas(); });
onUnmounted(() => window.removeEventListener('idioma-changed', handleLangChange));
</script>

<template>
  <HeadingMember>
    <main class="main-content">
      <!-- capa decorativa ambiental -->
      <div class="ambient-glow glow-a" aria-hidden="true"></div>
      <div class="ambient-glow glow-b" aria-hidden="true"></div>

      <div class="stats-container">

        <header class="view-header">
          <span class="eyebrow">{{ t.myProfileTag }}</span>
          <h1 class="title">{{ t.statsTitlePrefix }} <span class="highlight-text">{{ t.statsTitleHighlight }}</span></h1>
          <p class="subtitle">{{ t.statsSubtitle }}</p>
        </header>

        <div v-if="cargando" class="loading-bar" role="status" :aria-label="t.loading"></div>
        <div v-if="errorApi" class="error-banner" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorApi }}</span>
          <button type="button" class="btn-retry" @click="cargarEstadisticas">{{ t.retry }}</button>
        </div>

        <div class="dashboard-grid" :class="{ 'is-loading': cargando }">

          <!-- ================= PERFIL ================= -->
          <section class="user-profile-card area-perfil reveal" style="--reveal-delay:0">
            <div class="profile-main-info">
              <div class="avatar-wrapper">
                <svg class="avatar-ring" viewBox="0 0 96 96" aria-hidden="true">
                  <rect class="ring-track" x="4" y="4" width="88" height="88" rx="24" pathLength="100" />
                  <rect class="ring-fill" x="4" y="4" width="88" height="88" rx="24" pathLength="100" stroke-dasharray="100" :stroke-dashoffset="ringOffset" />
                </svg>
                <div class="avatar-circle">
                  <img v-if="user.foto && !fotoError" :src="user.foto" :alt="user.nombre" class="avatar-image" @error="fotoError = true" />
                  <span v-else class="avatar-initials">{{ initials }}</span>
                </div>
              </div>
              <div class="user-names">
                <div class="user-badges">
                  <span class="user-id">ID · {{ user.id }}</span>
                  <span v-if="user.edad !== null" class="user-age">{{ user.edad }} {{ t.ageSuffix }}</span>
                </div>
                <h2>{{ user.nombre }}</h2>
              </div>
            </div>

            <div class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.bodyCompositionTitle }}</div>
            <div class="metrics-grid">
              <div class="metric-box"><span class="metric-label">{{ t.initialWeightLabel }}</span><span class="metric-value">{{ user.pesoInicial }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.currentWeightLabel }}</span><span class="metric-value accent">{{ user.pesoActual }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.heightLabel }}</span><span class="metric-value">{{ user.estatura }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.bodyFatLabel }}</span><span class="metric-value warning">{{ user.grasaCorporal }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.muscleMassLabel }}</span><span class="metric-value accent">{{ user.masaMuscular }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.avgCaloriesLabel }}</span><span class="metric-value">{{ user.caloriasPromedio }}</span></div>
            </div>

            <div class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.advancedMetricsTitle }}</div>
            <div class="metrics-grid advanced-metrics">
              <div class="metric-box"><span class="metric-label">{{ t.bodyWaterLabel }}</span><span class="metric-value info">{{ user.aguaCorporal }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.bmiLabel }}</span><span class="metric-value">{{ user.imc }}</span></div>
              <div class="metric-box"><span class="metric-label">{{ t.strengthGainLabel }}</span><span class="metric-value accent">{{ user.aumentoFuerza }}</span></div>
            </div>

            <div class="progress-pair">
              <div class="performance-chart-box">
                <div class="chart-header">
                  <span class="chart-title">{{ t.attendanceTitle }}</span>
                  <span class="chart-percentage">{{ user.asistenciaPorcentaje }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill attendance-fill" :style="{ width: user.asistenciaPorcentaje + '%' }"></div>
                </div>
              </div>
              <div class="performance-chart-box">
                <div class="chart-header">
                  <span class="chart-title">{{ t.petProgressTitle }}</span>
                  <span class="chart-percentage pink">{{ progresoMeta }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill pet-fill" :style="{ width: progresoMeta + '%' }"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- ================= CALENDARIO ================= -->
          <section class="calendar-card area-calendario reveal" style="--reveal-delay:1">
            <div class="calendar-glow glow-1" aria-hidden="true"></div>
            <div class="calendar-glow glow-2" aria-hidden="true"></div>
            <div class="calendar-grid-pattern" aria-hidden="true"></div>

            <div class="calendar-content">
              <div class="calendar-header">
                <div class="calendar-header-title">
                  <span class="calendar-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                  <div>
                    <h3>{{ t.calendarHeaderTitle }}</h3>
                    <span class="calendar-month">{{ etiquetaMes }}</span>
                  </div>
                </div>
                <span class="year-badge">{{ anioActual }}</span>
              </div>

              <div class="calendar-stats-row">
                <div class="calendar-stat-chip streak">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#facc15" stroke="#f97316" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 4-4 7-4 11a4 4 0 0 0 8 0c0-2-.5-3.5-1.5-5C15.5 10 16 12 16 12s2-2 2-4c0-3.5-3-6-6-6z"/></svg>
                  <span>{{ t.currentStreakLabel }}: <b>{{ rachaActualMes }}</b></span>
                </div>
                <div class="calendar-stat-chip best">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17h4v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                  <span>{{ t.bestStreakLabel }}: <b>{{ rachaInfo.dias }}</b></span>
                </div>
              </div>

              <div class="calendar-progress-row">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: porcentajeMes + '%' }"></div>
                </div>
                <div class="progress-label">
                  <span>{{ diasAsistidosMes }}/{{ diasRegistradosMes }} {{ t.calendarDaysAttended }}</span>
                  <span class="progress-percent">{{ porcentajeMes }}%</span>
                </div>
              </div>

              <div class="calendar-body-row">
                <div class="calendar-grid-column">
                  <div class="weekdays-row" aria-hidden="true">
                    <span v-for="(d, i) in t.weekdays" :key="i">{{ d }}</span>
                  </div>
                  <div class="days-grid">
                    <div
                      v-for="(item, index) in celdasCalendario"
                      :key="index"
                      class="day-cell"
                      :class="item ? item.estado : 'vacio'"
                    >
                      <template v-if="item">
                        <span class="day-number">{{ item.dia }}</span>
                        <span v-if="item.estado === 'hoy'" class="hoy-ring"></span>
                        <span v-if="item.estado === 'asistio' || item.estado === 'falto'" class="day-icon" :class="item.estado">
                          <svg v-if="item.estado === 'asistio'" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0a2e18" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <svg v-else width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#3a0d0d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </span>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="weeks-summary-column">
                  <span class="weeks-summary-title">{{ t.weekLabel }}</span>
                  <div v-for="semana in resumenSemanas" :key="semana.numero" class="week-summary-item">
                    <div class="week-bar-track">
                      <div class="week-bar-fill" :style="{ height: semana.pct + '%' }"></div>
                    </div>
                    <span class="week-summary-pct">{{ semana.pct }}%</span>
                  </div>
                </div>
              </div>

              <div class="calendar-legend">
                <div class="legend-item asistio"><span class="dot asistio"></span> {{ t.legendAttended }} <b>{{ diasAsistidosMes }}</b></div>
                <div class="legend-item falto"><span class="dot falto"></span> {{ t.legendMissed }} <b>{{ diasFaltoMes }}</b></div>
                <div class="legend-item"><span class="dot hoy"></span> {{ t.legendToday }}</div>
              </div>
            </div>
          </section>

          <!-- ================= RACHA Y COMPAÑERO ================= -->
          <section class="streak-card area-mascotas reveal" :class="`theme-${etapaActual}`" style="--reveal-delay:2">
            <div class="streak-glow" aria-hidden="true"></div>

            <div class="streak-header-row">
              <div class="streak-title-group">
                <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.petAndStreakTitle }}</span>
                <span class="streak-sub">{{ t.streakSub }}</span>
              </div>
              <span class="pet-level-badge">{{ mascotaReal.nivel }}</span>
            </div>

            <div class="streak-content-layout">
              <!-- Mascota -->
              <div class="pet-display-box">
                <div class="pet-visual">
                  <FitnessPet :nombre="mascotaReal.nombre" :nivel="mascotaReal.nivel" :tipo="mascotaReal.tipo" :racha="rachaInfo.dias" :activo-hoy="rachaInfo.activoHoy" />
                </div>
                <div class="pet-configuration">
                  <div class="pet-chip">
                    <span class="pet-chip-label">{{ t.animalLabel }}</span>
                    <strong>{{ animalNombre }}</strong>
                  </div>
                  <div class="pet-chip">
                    <span class="pet-chip-label">{{ t.nameLabel }}</span>
                    <strong :title="mascotaReal.nombre">{{ mascotaReal.nombre }}</strong>
                  </div>
                </div>
              </div>

              <!-- Racha -->
              <div class="streak-counter-box">
                <span class="streak-footer-text">{{ t.streakFooterText }}</span>
                <div class="streak-number-wrapper">
                  <span class="streak-number animate-bounce">{{ rachaInfo.dias }}</span>
                  <span class="fire-icon animate-pulse" aria-hidden="true">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="#facc15" stroke="#f97316" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 4-4 7-4 11a4 4 0 0 0 8 0c0-2-.5-3.5-1.5-5C15.5 10 16 12 16 12s2-2 2-4c0-3.5-3-6-6-6z"/></svg>
                  </span>
                </div>

                <div class="streak-status-pill" :class="{ active: rachaInfo.activoHoy }">
                  <span class="status-indicator-dot"></span>
                  <span>{{ rachaInfo.activoHoy ? t.statusToday : t.statusPending }}</span>
                </div>

                <div class="stage-progress">
                  <div class="stage-progress-head">
                    <span>{{ anteriorMeta }} {{ t.daysUnit }}</span>
                    <span v-if="siguienteMeta !== null">{{ siguienteMeta }} {{ t.daysUnit }}</span>
                  </div>
                  <div class="stage-track">
                    <div class="stage-fill" :style="{ width: progresoMeta + '%' }"></div>
                  </div>
                  <p class="stage-message">{{ etapaMensaje }}</p>
                  <div class="stage-steps" aria-hidden="true">
                    <template v-for="(n, i) in UMBRALES_MASCOTA" :key="n">
                      <span v-if="i > 0" class="stage-line" :class="{ done: i <= etapaIdx }"></span>
                      <span class="stage-dot" :class="{ done: i < etapaIdx, current: i === etapaIdx }" :title="`${n} ${t.daysUnit}`"></span>
                    </template>
                  </div>
                </div>

                <span class="streak-motivation-tip">{{ t.motivationTip }}</span>
              </div>
            </div>

            <div class="collection-zone">
              <button class="member-collection-toggle" type="button" :aria-expanded="mostrarColeccion" @click="mostrarColeccion = !mostrarColeccion">
                {{ mostrarColeccion ? t.hideCollection : t.showCollection }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" :class="{ flip: mostrarColeccion }"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <MascotasColeccion v-if="mostrarColeccion" :dias-totales="rachaInfo.dias" :activo-hoy="rachaInfo.activoHoy" />
            </div>
          </section>

          <!-- ================= PROGRESO DE PESO ================= -->
          <section class="chart-card area-peso reveal" style="--reveal-delay:2">
            <LineChartSimple v-if="pesoHistorico.length" :data="pesoHistorico" color="#3b82f6" unit=" kg" :titulo="t.weightProgressTitle" />
            <div v-else class="chart-empty">
              <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.weightProgressTitle }}</span>
              <div class="chart-empty-body">
                <span class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></svg></span>
                <p>{{ t.noWeight }}</p>
              </div>
            </div>
          </section>

          <!-- ================= PROGRESO DE FUERZA ================= -->
          <section class="chart-card area-fuerza reveal" style="--reveal-delay:3">
            <LineChartSimple v-if="fuerzaHistorico.length" :data="fuerzaHistorico" color="#4ade80" unit=" kg" :titulo="t.strengthProgressTitle" />
            <div v-else class="chart-empty">
              <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.strengthProgressTitle }}</span>
              <div class="chart-empty-body">
                <span class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg></span>
                <p>{{ t.noStrength }}</p>
              </div>
            </div>
          </section>

          <!-- ================= FÍSICO ================= -->
          <section class="chart-card body-avatar-card area-avatar reveal" style="--reveal-delay:3">
            <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.physiqueTitle }}</span>
            <span class="card-desc">{{ t.physiqueDesc }}</span>
            <div class="body-avatar-display-box">
              <AvatarCuerpo v-if="user.sexo && user.imc !== '—'"
                :sexo="user.sexo" :imc="user.imc" :grasa-corporal="user.grasaCorporal" tamano="md" />
              <div v-else class="chart-empty-body">
                <span class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg></span>
                <p>{{ t.noAvatar }}</p>
              </div>
            </div>
          </section>

          <!-- ================= COMPOSICIÓN ================= -->
          <section class="chart-card area-composicion reveal" style="--reveal-delay:4">
            <DonutChart v-if="composicionCorporal.length"
              :segmentos="composicionCorporal"
              :titulo="t.bodyCompositionChartTitle"
              :centro-valor="`${composicionCorporal[0].value}%`"
              :centro-label="t.bodyFatLabel" />
            <div v-else class="chart-empty">
              <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.bodyCompositionChartTitle }}</span>
              <div class="chart-empty-body">
                <span class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg></span>
                <p>{{ t.noBodyFat }}</p>
              </div>
            </div>
          </section>

          <!-- ================= CALORÍAS ================= -->
          <section class="chart-card area-semanal reveal" style="--reveal-delay:4">
            <CalorieRingsChart v-if="caloriasSemanales.length" :data="caloriasSemanales" color="#fb923c" unit=" kcal" :titulo="t.weeklyCaloriesTitle" />
            <div v-else class="chart-empty">
              <span class="section-subtitle-small"><span class="subtitle-bar"></span>{{ t.weeklyCaloriesTitle }}</span>
              <div class="chart-empty-body">
                <span class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 4-4 7-4 11a4 4 0 0 0 8 0c0-2-.5-3.5-1.5-5C15.5 10 16 12 16 12s2-2 2-4c0-3.5-3-6-6-6z"/></svg></span>
                <p>{{ t.noCalories }}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  </HeadingMember>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&display=swap');

* { box-sizing: border-box; }
button { font: inherit; }

/* =========================================================
   BASE
========================================================= */
.main-content {
  --hl: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, rgba(18, 18, 18, 0.75));
  --card-border: var(--border-cards, rgba(255, 255, 255, 0.12));
  --line: var(--border-line, rgba(255, 255, 255, 0.07));
  --radius: var(--app-border-radius, 22px);
  --title: var(--color-titulos, #fff);
  --text2: rgba(245, 245, 244, 0.66);
  --text3: rgba(245, 245, 244, 0.45);
  --green: #4ade80;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: calc(100vh - 80px);
  background: transparent;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  padding: 30px 40px 56px;
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.ambient-glow { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; opacity: 0.35; }
.glow-a { width: 420px; height: 420px; top: -120px; right: -100px; background: radial-gradient(circle, var(--hl) 0%, transparent 70%); }
.glow-b { width: 380px; height: 380px; bottom: 10%; left: -140px; background: radial-gradient(circle, #22c55e 0%, transparent 70%); opacity: 0.18; }

.stats-container { max-width: 1320px; margin: 0 auto; position: relative; z-index: 2; }

/* ---------- Encabezado ---------- */
.view-header { margin-bottom: 26px; }
.eyebrow {
  display: inline-block; margin-bottom: 10px; padding: 3px 11px; border-radius: 20px;
  font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--hl);
  background: color-mix(in srgb, var(--hl) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--hl) 30%, transparent);
}
.title { margin: 0; font-family: 'Anton', sans-serif; font-size: clamp(1.9rem, 5vw, 2.7rem); line-height: 1.05; letter-spacing: 1px; text-transform: uppercase; color: var(--title); }
.highlight-text { background: linear-gradient(120deg, var(--hl), #60d394 120%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.subtitle { max-width: 540px; margin: 8px 0 0; font-size: 0.92rem; line-height: 1.45; color: var(--text2); }

/* ---------- Carga / error ---------- */
.loading-bar { position: relative; height: 3px; margin: -12px 0 20px; border-radius: 3px; overflow: hidden; background: rgba(255, 255, 255, 0.06); }
.loading-bar::after { content: ''; position: absolute; inset: 0; width: 35%; background: linear-gradient(90deg, transparent, var(--hl), transparent); animation: loadSlide 1.1s ease-in-out infinite; }
@keyframes loadSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }

.error-banner {
  display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding: 12px 16px;
  color: #fca5a5; font-size: 13px; line-height: 1.4;
  background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 14px;
}
.error-banner svg { flex: none; }
.error-banner span { flex: 1; min-width: 0; }
.btn-retry {
  flex: none; padding: 7px 14px; cursor: pointer; color: #fff; font-size: 12px; font-weight: 700;
  background: rgba(239, 68, 68, 0.25); border: 1px solid rgba(239, 68, 68, 0.45); border-radius: 10px;
  transition: background 0.2s ease;
}
.btn-retry:hover { background: rgba(239, 68, 68, 0.4); }

/* =========================================================
   GRID PRINCIPAL (12 columnas)
========================================================= */
.dashboard-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 22px; align-items: stretch; transition: opacity 0.25s ease; }
.dashboard-grid.is-loading { opacity: 0.6; pointer-events: none; }

.area-perfil { grid-column: span 7; }
.area-calendario { grid-column: span 5; }
.area-mascotas { grid-column: 1 / -1; }
.area-peso, .area-fuerza { grid-column: span 6; }
.area-avatar, .area-composicion, .area-semanal { grid-column: span 4; }
.dashboard-grid > * { min-width: 0; }

@media (max-width: 1100px) {
  .area-perfil, .area-calendario { grid-column: 1 / -1; }
  .area-avatar, .area-composicion { grid-column: span 6; }
  .area-semanal { grid-column: 1 / -1; }
}
@media (max-width: 760px) {
  .dashboard-grid { gap: 16px; }
  .area-peso, .area-fuerza, .area-avatar, .area-composicion, .area-semanal { grid-column: 1 / -1; }
}

/* ---------- Entrada animada ---------- */
.reveal { animation: revealCard 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: calc(var(--reveal-delay, 0) * 90ms); }
@keyframes revealCard { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

/* ---------- Base de tarjeta ---------- */
.user-profile-card,
.calendar-card,
.chart-card {
  position: relative;
  background: var(--card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  max-width: 100%;
}

.section-subtitle-small {
  position: relative; z-index: 1; display: flex; align-items: center; gap: 8px;
  margin: 20px 0 10px;
  font-family: 'Oswald', sans-serif; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
  color: var(--hl);
}
.subtitle-bar { width: 3px; height: 14px; flex-shrink: 0; border-radius: 2px; background: linear-gradient(180deg, var(--hl), transparent); }

/* =========================================================
   PERFIL
========================================================= */
.user-profile-card { padding: 28px; overflow: hidden; display: flex; flex-direction: column; }
.user-profile-card::before {
  content: ''; position: absolute; top: -60%; right: -30%; width: 300px; height: 300px; pointer-events: none;
  background: radial-gradient(circle, color-mix(in srgb, var(--hl) 14%, transparent) 0%, transparent 72%);
}
.user-profile-card > .section-subtitle-small:first-of-type { margin-top: 20px; }

.profile-main-info {
  position: relative; z-index: 1; display: flex; align-items: center; gap: 24px;
  margin-bottom: 4px; padding: 22px 24px; border-radius: 18px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--hl) 14%, rgba(255, 255, 255, 0.02)), rgba(255, 255, 255, 0.02) 72%);
  border: 1px solid color-mix(in srgb, var(--hl) 22%, rgba(255, 255, 255, 0.06));
}

/* Foto cuadrada con anillo de asistencia */
.avatar-wrapper { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.avatar-ring { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.ring-track { fill: none; stroke: rgba(255, 255, 255, 0.1); stroke-width: 4; }
.ring-fill { fill: none; stroke: var(--green); stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1); filter: drop-shadow(0 0 6px rgba(74, 222, 128, 0.5)); }
.avatar-circle {
  position: absolute; inset: 9.4%; display: flex; align-items: center; justify-content: center; overflow: hidden;
  border-radius: 18px; background: #080a0d;
  border: 2px solid color-mix(in srgb, var(--hl) 65%, transparent);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}
.avatar-image { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.avatar-initials { font-family: 'Oswald', sans-serif; font-size: 2rem; font-weight: 600; color: var(--hl); }

.user-names { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.user-badges { display: flex; flex-wrap: wrap; gap: 8px; }
.user-id, .user-age {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
}
.user-id { color: var(--hl); background: color-mix(in srgb, var(--hl) 12%, transparent); border: 1px solid color-mix(in srgb, var(--hl) 28%, transparent); }
.user-age { color: var(--text2); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
.user-names h2 { margin: 0; font-size: clamp(1.25rem, 2.6vw, 1.7rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.4px; color: var(--title); overflow-wrap: anywhere; text-wrap: balance; }

@media (max-width: 600px) {
  .user-profile-card { padding: 20px; }
  .profile-main-info { flex-direction: column; gap: 16px; padding: 22px 16px 20px; text-align: center; }
  .avatar-wrapper { width: 112px; height: 112px; }
  .user-names { align-items: center; }
  .user-badges { justify-content: center; }
}

/* Métricas */
.metrics-grid {
  position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 4px; padding: 14px;
  background: rgba(0, 0, 0, 0.28); border: 1px solid var(--line); border-radius: 16px;
}
.metric-box {
  min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 5px; padding: 12px 8px; text-align: center;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.metric-box:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.14); background: rgba(255, 255, 255, 0.055); }
.metric-label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.3px; line-height: 1.25; text-transform: uppercase; color: var(--text3); }
.metric-value { font-size: 14.5px; font-weight: 700; color: #f5f5f4; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.metric-value.accent { color: var(--green); }
.metric-value.warning { color: #facc15; }
.metric-value.info { color: #38bdf8; }

@media (max-width: 480px) {
  .metrics-grid { gap: 8px; padding: 10px; }
  .metrics-grid:not(.advanced-metrics), .advanced-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .advanced-metrics > .metric-box:last-child:nth-child(odd) { grid-column: 1 / -1; }
}

/* Barras de progreso */
.progress-pair { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: auto; padding-top: 18px; }
.performance-chart-box { padding: 15px 16px; background: rgba(0, 0, 0, 0.28); border: 1px solid var(--line); border-radius: 16px; }
.chart-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
.chart-title { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; color: var(--text2); }
.chart-percentage { font-size: 12px; font-weight: 700; color: var(--green); }
.chart-percentage.pink { color: #f472b6; }
.progress-bar-bg { width: 100%; height: 9px; overflow: hidden; border-radius: 5px; background: rgba(255, 255, 255, 0.06); }
.progress-bar-fill { height: 100%; min-width: 4px; border-radius: 5px; transition: width 0.8s var(--ease); }
.attendance-fill { background: linear-gradient(90deg, #16a34a, var(--green)); box-shadow: 0 0 10px rgba(74, 222, 128, 0.4); }
.pet-fill { background: linear-gradient(90deg, #ec4899, #f43f5e); box-shadow: 0 0 10px rgba(236, 72, 153, 0.4); }
@media (max-width: 560px) { .progress-pair { grid-template-columns: minmax(0, 1fr); } }

/* =========================================================
   CALENDARIO
========================================================= */
.calendar-card { padding: 26px; overflow: hidden; display: flex; flex-direction: column; }
.calendar-glow { position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none; z-index: 0; }
.calendar-glow.glow-1 { width: 180px; height: 180px; top: -60px; right: -50px; background: radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, transparent 70%); }
.calendar-glow.glow-2 { width: 160px; height: 160px; bottom: -60px; left: -50px; background: radial-gradient(circle, rgba(74, 222, 128, 0.18) 0%, transparent 70%); }
.calendar-grid-pattern {
  position: absolute; inset: 0; z-index: 0; opacity: 0.5; pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 18px 18px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%); mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
}
.calendar-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 16px; }

.calendar-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.calendar-header-title { min-width: 0; display: flex; align-items: center; gap: 10px; }
.calendar-icon {
  width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: #93c5fd;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.3);
}
.calendar-header h3 { margin: 0; font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px; line-height: 1.15; text-transform: uppercase; color: var(--title); }
.calendar-month { display: block; margin-top: 2px; font-size: 11px; font-weight: 500; color: var(--text3); }
.year-badge { flex-shrink: 0; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; color: #0f172a; background: var(--hl); }

.calendar-stats-row { display: flex; flex-wrap: wrap; gap: 8px; }
.calendar-stat-chip {
  display: flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 20px;
  font-size: 11px; font-weight: 500; color: rgba(245, 245, 244, 0.75);
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);
}
.calendar-stat-chip b { font-weight: 800; color: #f5f5f4; }
.calendar-stat-chip.streak { border-color: rgba(250, 204, 21, 0.25); background: rgba(250, 204, 21, 0.06); }
.calendar-stat-chip.streak b { color: #facc15; }
.calendar-stat-chip.best { border-color: rgba(147, 197, 253, 0.25); background: rgba(147, 197, 253, 0.06); }
.calendar-stat-chip.best b { color: #93c5fd; }

.calendar-progress-row { display: flex; flex-direction: column; gap: 5px; }
.progress-track { height: 6px; overflow: hidden; border-radius: 4px; background: rgba(255, 255, 255, 0.06); }
.progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--hl), var(--green)); box-shadow: 0 0 8px rgba(74, 222, 128, 0.35); transition: width 0.8s var(--ease); }
.progress-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 500; color: rgba(245, 245, 244, 0.55); }
.progress-percent { font-weight: 700; color: var(--green); }

.calendar-body-row { flex: 1; display: flex; gap: 12px; }
.calendar-grid-column { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.weekdays-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: var(--text3); }

.days-grid { --gap: 7px; flex: 1; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: var(--gap); align-content: start; }
.day-cell {
  position: relative; aspect-ratio: 1; min-width: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; font-size: 12px; font-weight: 600; color: rgba(245, 245, 244, 0.7);
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.day-cell.vacio { visibility: hidden; pointer-events: none; }
.day-cell:not(.vacio):hover { transform: translateY(-2px) scale(1.06); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4); z-index: 2; }
.day-number { position: relative; z-index: 1; line-height: 1; font-variant-numeric: tabular-nums; }
.day-cell.asistio { color: #86efac; background: linear-gradient(145deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.08)); border-color: rgba(34, 197, 94, 0.4); }
.day-cell.falto { color: #fca5a5; background: linear-gradient(145deg, rgba(239, 68, 68, 0.26), rgba(239, 68, 68, 0.06)); border-color: rgba(239, 68, 68, 0.35); }
.day-cell.hoy { color: #fde047; font-weight: 800; background: linear-gradient(145deg, rgba(234, 179, 8, 0.32), rgba(234, 179, 8, 0.1)); border-color: rgba(234, 179, 8, 0.55); box-shadow: 0 0 14px rgba(234, 179, 8, 0.3); }
.day-cell.futuro { opacity: 0.4; }

/* Cadena visual entre días asistidos consecutivos en la misma fila */
.day-cell.asistio:not(:nth-child(7n)):has(+ .day-cell.asistio)::before {
  content: ''; position: absolute; top: 50%; right: calc(var(--gap) * -1); width: var(--gap); height: 2px;
  background: rgba(74, 222, 128, 0.55); z-index: 2; transform: translateY(-1px);
}

.day-icon {
  position: absolute; bottom: 2px; right: 2px; z-index: 1; width: 12px; height: 12px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
.day-icon.asistio { background: var(--green); }
.day-icon.falto { background: #f87171; }
.hoy-ring { position: absolute; inset: -2px; border-radius: 12px; border: 1.5px solid rgba(250, 204, 21, 0.55); animation: pulseRing 1.8s ease-out infinite; pointer-events: none; }
@keyframes pulseRing { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(1.25); opacity: 0; } }

.weeks-summary-column { flex-shrink: 0; width: 38px; display: flex; flex-direction: column; align-items: center; gap: 5px; padding-left: 10px; border-left: 1px solid rgba(255, 255, 255, 0.07); }
.weeks-summary-title { margin-bottom: 2px; font-size: 9px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; color: var(--text3); }
.week-summary-item { flex: 1; width: 100%; min-height: 0; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.week-bar-track { flex: 1; width: 9px; min-height: 14px; display: flex; align-items: flex-end; overflow: hidden; border-radius: 4px; background: rgba(255, 255, 255, 0.05); }
.week-bar-fill { width: 100%; border-radius: 4px; background: linear-gradient(180deg, var(--green), var(--hl)); transition: height 0.6s ease; }
.week-summary-pct { font-size: 8px; font-weight: 700; color: var(--text3); }

.calendar-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 2px; padding-top: 16px; border-top: 1px solid var(--line); }
.legend-item {
  display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 500; color: rgba(245, 245, 244, 0.65); white-space: nowrap;
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);
}
.legend-item b { margin-left: 1px; font-weight: 800; color: #f5f5f4; }
.legend-item.asistio { border-color: rgba(34, 197, 94, 0.25); }
.legend-item.falto { border-color: rgba(239, 68, 68, 0.22); }
.dot { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; }
.dot.asistio { background: var(--green); box-shadow: 0 0 6px rgba(74, 222, 128, 0.6); }
.dot.falto { background: #f87171; box-shadow: 0 0 6px rgba(248, 113, 113, 0.6); }
.dot.hoy { background: #facc15; box-shadow: 0 0 6px rgba(250, 204, 21, 0.6); }

@media (max-width: 600px) {
  .calendar-card { padding: 20px 16px; }
  .days-grid { --gap: 5px; }
  .day-cell { border-radius: 9px; font-size: 11.5px; }
  .calendar-body-row { gap: 8px; }
  .weeks-summary-column { width: 30px; padding-left: 7px; }
}
@media (max-width: 400px) { .weeks-summary-column { display: none; } }

/* =========================================================
   RACHA Y COMPAÑERO
========================================================= */
.streak-card {
  --accent-color: #f472b6;
  container-type: inline-size;
  position: relative; display: flex; flex-direction: column; gap: 18px; padding: 26px; overflow: hidden;
  border-radius: var(--radius); backdrop-filter: blur(20px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: box-shadow 0.5s ease, border-color 0.5s ease;
}
.streak-card::after {
  content: ''; position: absolute; inset: 0; z-index: 0; opacity: 0.5; pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 18px 18px;
  -webkit-mask-image: radial-gradient(ellipse at 80% 0%, black 0%, transparent 70%); mask-image: radial-gradient(ellipse at 80% 0%, black 0%, transparent 70%);
}
.streak-glow {
  position: absolute; top: -40%; right: -20%; width: 260px; height: 260px; pointer-events: none; opacity: 0.2; filter: blur(12px);
  background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%); animation: glowDrift 6s ease-in-out infinite;
}
@keyframes glowDrift { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-10px, 10px) scale(1.08); } }

.theme-huevo { background: linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(148, 163, 184, 0.4); --accent-color: #cbd5e1; }
.theme-bebe { background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(234, 179, 8, 0.4); --accent-color: #facc15; }
.theme-adolescente { background: linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(249, 115, 22, 0.4); --accent-color: #fb923c; }
.theme-adulto { background: linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(236, 72, 153, 0.4); --accent-color: #f472b6; }
.theme-senior { background: linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(168, 85, 247, 0.4); --accent-color: #c084fc; }
.theme-musculoso { background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(18, 18, 18, 0.9) 100%); border: 1px solid rgba(59, 130, 246, 0.5); --accent-color: #60a5fa; }

.streak-header-row { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.streak-title-group { min-width: 0; display: flex; flex-direction: column; }
.streak-title-group .section-subtitle-small { margin: 0 0 3px; font-size: 1rem; color: var(--accent-color); }
.streak-title-group .subtitle-bar { background: linear-gradient(180deg, var(--accent-color), transparent); }
.streak-sub { padding-left: 11px; font-size: 12px; color: var(--text2); }
.pet-level-badge {
  flex: none; padding: 6px 13px; border-radius: 999px; white-space: nowrap;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 12%, rgba(0, 0, 0, 0.35));
  border: 1px solid color-mix(in srgb, var(--accent-color) 60%, transparent);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent-color) 22%, transparent);
}

.streak-content-layout { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
@container (max-width: 640px) { .streak-content-layout { grid-template-columns: minmax(0, 1fr); } }

.pet-display-box {
  min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 16px; text-align: center; border-radius: 18px;
  background: radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--accent-color) 16%, transparent), transparent 65%), rgba(0, 0, 0, 0.32);
  border: 1px solid color-mix(in srgb, var(--accent-color) 22%, rgba(255, 255, 255, 0.06));
}
.pet-visual { width: 100%; display: flex; justify-content: center; }
.pet-configuration { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.pet-chip { min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 9px 12px; text-align: left; border-radius: 11px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.07); }
.pet-chip-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase; color: var(--text3); }
.pet-chip strong { overflow: hidden; font-size: 0.9rem; font-weight: 600; color: #f5f5f4; text-overflow: ellipsis; white-space: nowrap; }

.streak-counter-box {
  min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px 18px; text-align: center; border-radius: 18px;
  background: radial-gradient(circle at 50% 22%, color-mix(in srgb, var(--accent-color) 14%, transparent), transparent 62%), rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.streak-footer-text { font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(245, 245, 244, 0.65); }
.streak-number-wrapper { display: flex; align-items: center; justify-content: center; gap: 10px; }
.streak-number {
  font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: 4.2rem; line-height: 1; letter-spacing: 1px;
  background: linear-gradient(180deg, #fff 35%, color-mix(in srgb, var(--accent-color) 75%, #fff) 130%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.55));
}
.fire-icon { display: flex; align-items: center; filter: drop-shadow(0 0 12px var(--accent-color)); }

.streak-status-pill {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 13px; border-radius: 999px;
  font-size: 11.5px; font-weight: 600; color: #f5f5f4;
  background: rgba(248, 113, 113, 0.08); border: 1px solid rgba(248, 113, 113, 0.28);
}
.streak-status-pill.active { background: rgba(74, 222, 128, 0.08); border-color: rgba(74, 222, 128, 0.3); }
.status-indicator-dot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: #f87171; box-shadow: 0 0 6px #f87171; }
.streak-status-pill.active .status-indicator-dot { background: var(--green); box-shadow: 0 0 6px var(--green); }

.stage-progress { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 2px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.stage-progress-head { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text3); }
.stage-progress-head span:first-child { color: var(--accent-color); }
.stage-track { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.07); }
.stage-fill {
  height: 100%; min-width: 4px; border-radius: 999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--accent-color) 55%, transparent), var(--accent-color));
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color) 55%, transparent);
  transition: width 0.8s var(--ease);
}
.stage-message { margin: 0; font-size: 11.5px; color: rgba(245, 245, 244, 0.65); }
.stage-steps { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.stage-line { flex: 1; height: 2px; border-radius: 2px; background: rgba(255, 255, 255, 0.1); }
.stage-line.done { background: var(--accent-color); opacity: 0.7; }
.stage-dot { width: 10px; height: 10px; flex-shrink: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.14); }
.stage-dot.done { background: var(--accent-color); opacity: 0.75; }
.stage-dot.current { background: var(--accent-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-color) 25%, transparent), 0 0 12px var(--accent-color); }

.streak-motivation-tip { font-size: 10.5px; color: var(--text3); }

.collection-zone { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.member-collection-toggle {
  display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; cursor: pointer; border-radius: 11px;
  font-size: 12px; font-weight: 700; color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 10%, transparent); border: 1px solid color-mix(in srgb, var(--accent-color) 35%, transparent);
  transition: background 0.2s ease;
}
.member-collection-toggle:hover { background: color-mix(in srgb, var(--accent-color) 18%, transparent); }
.member-collection-toggle svg { transition: transform 0.25s var(--ease); }
.member-collection-toggle svg.flip { transform: rotate(180deg); }
.collection-zone > :not(.member-collection-toggle) { width: 100%; }

@keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes pulseFlame { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.9; } }
.animate-bounce { animation: bounceSlow 2.5s ease-in-out infinite; }
.animate-pulse { animation: pulseFlame 1.8s ease-in-out infinite; display: inline-flex; }

@media (max-width: 600px) {
  .streak-card { padding: 18px; gap: 16px; }
  .streak-header-row { flex-direction: column; gap: 10px; }
  .streak-number { font-size: 3.4rem; }
}

/* =========================================================
   TARJETAS DE GRÁFICAS
========================================================= */
.chart-card { padding: 22px; display: flex; flex-direction: column; min-height: 280px; overflow: hidden; }
.chart-card::before {
  content: ''; position: absolute; top: 0; left: 22px; right: 22px; height: 2px; border-radius: 0 0 3px 3px; pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--hl), transparent); opacity: 0.6;
}
.chart-card > :not(.chart-empty):not(.section-subtitle-small):not(.card-desc):not(.body-avatar-display-box) { max-width: 100%; }

.chart-empty { flex: 1; display: flex; flex-direction: column; }
.chart-empty .section-subtitle-small, .chart-card > .section-subtitle-small { margin-top: 0; }
.chart-empty-body {
  flex: 1; min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 18px; text-align: center;
}
.chart-empty-body p { max-width: 260px; margin: 0; font-size: 13px; line-height: 1.5; color: var(--text2); }
.empty-icon {
  width: 48px; height: 48px; display: grid; place-items: center; border-radius: 14px; color: var(--hl);
  background: color-mix(in srgb, var(--hl) 12%, transparent); border: 1px solid color-mix(in srgb, var(--hl) 28%, transparent);
}

.body-avatar-card { align-items: stretch; }
.card-desc { margin: -4px 0 12px; font-size: 11.5px; line-height: 1.45; color: var(--text2); }
.body-avatar-display-box {
  flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center; padding: 12px;
  background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px;
}

@media (max-width: 600px) { .chart-card { padding: 18px 16px; min-height: 0; } }

/* =========================================================
   PREFERENCIAS DE MOVIMIENTO / MÓVIL GENERAL
========================================================= */
@media (max-width: 768px) {
  .ambient-glow { display: none; }
  .main-content { padding: 20px 16px 44px; }
}
@media (max-width: 480px) {
  .main-content { padding: 16px 12px 40px; }
  .view-header { margin-bottom: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .animate-bounce, .animate-pulse, .streak-glow, .hoy-ring, .loading-bar::after { animation: none !important; }
  .progress-fill, .progress-bar-fill, .week-bar-fill, .stage-fill, .ring-fill { transition: none !important; }
}
</style>