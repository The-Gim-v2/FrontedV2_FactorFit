<template>
  <HeadingMember>
    <div class="dashboard">
      <p v-if="dashboardError" role="alert" class="member-dashboard-message">{{ dashboardError }} <button type="button" @click="cargarDashboardMiembro(selectedInscripcionId)">Reintentar</button></p>
      <p v-if="loadingDashboard" class="member-dashboard-message">Cargando datos reales del miembro…</p>
      <main class="dashboard-container">

        <!-- 1. ENCABEZADO: miembro a la izquierda, gimnasio a la derecha -->
        <section class="hero">
          <div class="hero-member">
            <div class="avatar">
              <img v-if="member.photoUrl" :src="member.photoUrl" :alt="member.name" />
              <span v-else class="avatar-fallback">{{ member.name && member.name !== '—' ? member.name.split(/\s+/).map(p => p[0]).slice(0, 3).join('').toUpperCase() : '?' }}</span>
            </div>

            <div class="hero-copy">
              <span class="welcome">{{ ui.welcome }}</span>
              <h1>{{ member.name }}</h1>

              <div class="hero-meta">
                <span class="plan-badge">{{ member.plan || '—' }}</span>
                <span class="billing-pill" :class="membershipPillClass">
                  <span class="billing-dot"></span>
                  {{ membershipStatusText }}
                </span>
              </div>
            </div>
          </div>

          <aside class="hero-gym" :class="{ 'has-cover': !!gym.coverUrl }" :style="heroStyle">
            <div class="gym-head">
              <div v-if="gym.logoUrl" class="gym-logo">
                <img :src="gym.logoUrl" :alt="gym.name" />
              </div>
              <div class="gym-title">
                <small>{{ ui.registeredAt }}</small>
                <strong>{{ gym.name }}</strong>
                <span>{{ gym.branchName }}</span>
                <select v-if="inscripciones.length > 1" :value="selectedInscripcionId" aria-label="Cambiar inscripción" @change="cargarDashboardMiembro(Number($event.target.value))" class="member-inscription-select"><option v-for="ins in inscripciones" :key="ins.id" :value="ins.id">{{ ins.gimnasio }} · {{ ins.sede }}</option></select>
              </div>
            </div>

            <div class="status-pill" :class="isGymOpen ? 'open' : 'closed'">
              <span class="status-dot"></span>
              {{ isGymOpen ? ui.gymOpen : ui.gymClosed }}
            </div>

            <div class="gym-foot">
              <div class="gym-hours">
                <small>{{ ui.todayHours }}</small>
                <strong>{{ gym.todayHours }}</strong>
              </div>
              <a v-if="gym.address || gym.city" class="directions-btn" :href="directionsUrl" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                {{ ui.getDirections }}
              </a>
            </div>
          </aside>
        </section>

        <!-- 2. INDICADORES -->
        <section class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ attendedCount }}<em>/{{ member.monthGoal }}</em></strong>
              <span>{{ ui.attendanceMonth }}</span>
            </div>
          </article>

          <article class="kpi-card" style="--tint: var(--green)">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18M8 13h3v3H8z"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ member.classesReserved ?? '—' }}</strong>
              <span>{{ ui.classesReserved }}</span>
            </div>
          </article>

          <article class="kpi-card" :style="{ '--tint': cutTint }">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="sm">{{ nextCutText }}</strong>
              <span>{{ membershipState === 'expired' ? ui.membershipExpiredOn : ui.nextCut }}</span>
            </div>
          </article>

          <article class="kpi-card" :style="{ '--tint': balanceTint }">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="sm">{{ balanceText }}</strong>
              <span>{{ ui.balanceDue }} · {{ member.balance == null ? 'Sin datos' : member.balance > 0 ? ui.pendingPayment : ui.upToDate }}</span>
            </div>
          </article>
        </section>

        <!-- 3. CALENDARIO + RACHA -->
        <section class="two-col">

          <article class="panel calendar-panel">
            <div class="panel-header">
              <h2>{{ ui.calendarTitle }}</h2>
              <span class="month-badge">{{ monthLabel }} {{ currentYear }}</span>
            </div>

            <div class="chip-row">
              <div class="stat-chip streak">
                <svg viewBox="0 0 24 24"><path d="M12 2c0 4-4 7-4 11a4 4 0 0 0 8 0c0-2-.5-3.5-1.5-5C15.5 10 16 12 16 12s2-2 2-4c0-3.5-3-6-6-6z"/></svg>
                <span>{{ ui.currentStreakMonth }}: <b>{{ rachaActualMes }}</b></span>
              </div>
              <div class="stat-chip best">
                <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17h4v-2.34M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <span>{{ ui.bestStreakMonth }}: <b>{{ mejorRachaMes }}</b></span>
              </div>
            </div>

            <div class="cal-progress">
              <div class="cal-progress-label">
                <span>{{ ui.monthlyGoal }}</span>
                <b>{{ goalPercent }}%</b>
              </div>
              <div class="cal-progress-track">
                <i :style="{ width: goalPercent + '%' }"></i>
              </div>
            </div>

            <div class="cal-grid-col">
              <div class="weekdays-row">
                <span v-for="(d, i) in ui.weekdays" :key="i">{{ d }}</span>
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
                    <span
                      v-if="item.estado === 'asistio' || (item.estado === 'hoy' && rachaInfo.activoHoy)"
                      class="day-icon asistio"
                    >
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span v-else-if="item.estado === 'falto'" class="day-icon falto">
                      <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </span>
                  </template>
                </div>
              </div>
            </div>

            <div class="legend">
              <div class="legend-item"><i class="dot asistio"></i>{{ ui.legendAttended }} <b>{{ attendedCount }}</b></div>
              <div class="legend-item"><i class="dot falto"></i>{{ currentLang === 'es' ? 'Sin registro' : 'No record' }}</div>
              <div class="legend-item"><i class="dot hoy"></i>{{ ui.legendToday }}</div>
            </div>
          </article>

          <article class="panel streak-panel">
            <div class="panel-header">
              <h2>{{ ui.petTitle }}</h2>
              <div class="streak-number">
                <strong>{{ rachaInfo.dias }}</strong>
                <svg viewBox="0 0 24 24"><path d="M12 2c0 4-4 7-4 11a4 4 0 0 0 8 0c0-2-.5-3.5-1.5-5C15.5 10 16 12 16 12s2-2 2-4c0-3.5-3-6-6-6z"/></svg>
              </div>
            </div>

            <div class="streak-banner">
              <span class="streak-dot" :class="{ active: rachaInfo.activoHoy }"></span>
              <div>
                <strong>{{ rachaInfo.activoHoy ? ui.trainedToday : ui.pendingToday }}</strong>
                <small>{{ ui.streakTip }}</small>
              </div>
            </div>

            <div class="pets-wrap">
              <MascotasColeccion
                :dias-totales="rachaInfo.dias"
                :activo-hoy="rachaInfo.activoHoy"
              />
            </div>

            <div class="mini-grid">
              <div class="mini-card">
                <span>{{ ui.record }}</span>
                <strong>{{ rachaRecord }} {{ ui.days }}</strong>
              </div>
              <div class="mini-card">
                <span>{{ ui.nextReward }}</span>
                <strong class="pink">{{ ui.missing }} {{ daysToReward }} {{ ui.days }}</strong>
              </div>
            </div>

            <div class="reward-track" :title="rewardPercent + '%'"><i :style="{ width: rewardPercent + '%' }"></i></div>
          </article>
        </section>

        <!-- 4. CUENTA + RUTINA DE HOY -->
        <section class="two-col">

          <article class="panel account-panel">
            <div class="panel-header">
              <h2>{{ ui.yourAccount }}</h2>
              <button type="button" class="link-btn" @click="go('/Member/membership')">{{ ui.viewMembership }}</button>
            </div>

            <div class="account-body">
              <div class="ring" :style="{ '--ring': cutTint }">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle class="ring-bg" cx="60" cy="60" r="52" />
                  <circle class="ring-fg" cx="60" cy="60" r="52" :stroke-dasharray="ringDash" />
                </svg>
                <div class="ring-center">
                  <strong>{{ daysRemaining === null ? '—' : Math.max(daysRemaining, 0) }}</strong>
                  <small>{{ ui.daysLeft }}</small>
                </div>
              </div>

              <ul class="account-list">
                <li>
                  <span class="al-icon">
                    <svg viewBox="0 0 24 24"><path d="M1 4h22v16H1zM1 10h22"/></svg>
                  </span>
                  <span class="al-copy">
                    <small>{{ ui.planLabel }}</small>
                    <strong>{{ member.plan || '—' }}</strong>
                  </span>
                </li>
                <li>
                  <span class="al-icon">
                    <svg viewBox="0 0 24 24"><path d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4M16 2v4M3 9h18"/></svg>
                  </span>
                  <span class="al-copy">
                    <small>{{ ui.cycleStart }}</small>
                    <strong>{{ cycleStartText }}</strong>
                  </span>
                </li>
                <li>
                  <span class="al-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </span>
                  <span class="al-copy">
                    <small>{{ ui.lastPayment }}</small>
                    <strong>{{ member.lastPayment ? `${formatMoney(member.lastPayment.monto)} · ${formatDate(member.lastPayment.fecha)}` : '—' }}</strong>
                  </span>
                </li>
              </ul>
            </div>

            <div class="account-actions">
              <button type="button" class="btn-primary" @click="go('/Member/membership')">{{ ui.payNow }}</button>
              <button type="button" class="btn-ghost" @click="go('/Member/payments-history')">{{ ui.paymentsHistory }}</button>
            </div>
          </article>

          <article class="panel routine-panel">
            <div class="panel-header">
              <div>
                <h2>{{ ui.todayRoutine }}</h2>
                <p class="panel-sub">{{ todayRoutine.name }} · {{ todayRoutine.duration }} min</p>
              </div>
              <button type="button" class="link-btn" @click="go('/Member/my-routines')">{{ ui.viewRoutine }}</button>
            </div>

            <p v-if="!todayRoutine.exercises.length" class="member-dashboard-message">No hay una rutina asignada disponible.</p>
            <ol v-else class="exercise-list">
              <li v-for="(ex, i) in todayRoutine.exercises" :key="ex.name">
                <span class="ex-index">{{ i + 1 }}</span>
                <span class="ex-name">{{ ex.name }}</span>
                <span class="ex-sets">{{ ex.sets }}</span>
              </li>
            </ol>
          </article>
        </section>

        <!-- 5. PRÓXIMAS ACTIVIDADES + ACCESOS RÁPIDOS -->
        <section class="two-col">
          <article class="panel activity-panel">
            <div class="panel-header">
              <h2>{{ ui.nextActivities }}</h2>
              <button type="button" class="link-btn" @click="go('/Member/classes')">{{ ui.viewAll }}</button>
            </div>

            <div class="activity-list">
              <p v-if="!nextActivities.length" class="member-dashboard-message">No hay actividades próximas registradas.</p>
              <div v-for="item in nextActivities" :key="item.title + item.day" class="activity-row">
                <div class="date-box">
                  <strong>{{ item.day }}</strong>
                  <span>{{ item.month }}</span>
                </div>
                <div class="activity-info">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.time }} · {{ item.trainer }}</span>
                </div>
                <span class="activity-status" :class="{ booked: item.booked }">{{ item.status }}</span>
              </div>
            </div>
          </article>

          <article class="panel quick-panel">
            <div class="panel-header">
              <h2>{{ ui.quickAccess }}</h2>
            </div>

            <div class="quick-grid">
              <button
                v-for="action in quickActions"
                :key="action.label"
                type="button"
                class="quick-action"
                @click="go(action.route)"
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
        </section>

      </main>
    </div>
  </HeadingMember>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingMember from './HeadingMember.vue';
import MascotasColeccion from '@/components/MascotasColeccion.vue';

const router = useRouter();
const go = (path) => router.push(path);

/* =========================================================
   IDIOMA
========================================================= */

const currentLang = ref(localStorage.getItem('member-idioma') || 'es');

const handleLangChange = (event) => {
  const nuevo = event?.detail?.idioma || localStorage.getItem('member-idioma');
  if (nuevo) currentLang.value = nuevo;
};

const translations = {
  es: {
    registeredAt: 'Inscrito en',
    welcome: 'Bienvenido',
    gymOpen: 'Gimnasio abierto',
    gymClosed: 'Gimnasio cerrado',
    membershipActive: 'Membresía activa',
    membershipWarning: 'Membresía próxima a vencer',
    membershipExpired: 'Membresía vencida',
    nextCut: 'Próximo corte',
    membershipExpiredOn: 'Membresía venció el',
    attendanceMonth: 'Asistencias del mes',
    classesReserved: 'Clases reservadas',
    calendarTitle: 'Calendario de asistencia',
    currentStreakMonth: 'Racha del mes',
    bestStreakMonth: 'Mejor racha',
    monthlyGoal: 'Meta mensual',
    legendAttended: 'Asististe',
    legendMissed: 'Faltaste',
    legendToday: 'Hoy',
    weekdays: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
    petTitle: 'Tu compañero de racha',
    trainedToday: '¡Entrenamiento registrado hoy!',
    pendingToday: 'Pendiente de registrar hoy',
    streakTip: 'Cada día de asistencia hace crecer a tu compañero.',
    record: 'Récord histórico',
    nextReward: 'Siguiente generación',
    missing: 'Faltan',
    days: 'días',
    yourAccount: 'Tu cuenta',
    viewMembership: 'Ver membresía',
    balanceDue: 'Saldo a pagar',
    pendingPayment: 'Pago pendiente',
    upToDate: 'Estás al corriente',
    daysLeft: 'días restantes',
    planLabel: 'Plan',
    cycleStart: 'Inicio del ciclo',
    lastPayment: 'Último pago',
    payNow: 'Pagar ahora',
    paymentsHistory: 'Historial de pagos',
    inDays: 'Faltan',
    expiredAgo: 'Venció hace',
    today: 'Vence hoy',
    todayRoutine: 'Rutina de hoy',
    viewRoutine: 'Ver rutina',
    nextActivities: 'Próximas clases',
    viewAll: 'Ver todas',
    quickAccess: 'Accesos rápidos',
    todayHours: 'Horario de hoy',
    getDirections: 'Cómo llegar',
    plan: 'Plan Mensual'
  },
  en: {
    registeredAt: 'Enrolled at',
    welcome: 'Welcome',
    gymOpen: 'Gym open',
    gymClosed: 'Gym closed',
    membershipActive: 'Active membership',
    membershipWarning: 'Membership expiring soon',
    membershipExpired: 'Membership expired',
    nextCut: 'Next billing',
    membershipExpiredOn: 'Membership expired on',
    attendanceMonth: 'Attendance this month',
    classesReserved: 'Booked classes',
    calendarTitle: 'Attendance calendar',
    currentStreakMonth: 'Month streak',
    bestStreakMonth: 'Best streak',
    monthlyGoal: 'Monthly goal',
    legendAttended: 'Attended',
    legendMissed: 'Missed',
    legendToday: 'Today',
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    petTitle: 'Your streak companion',
    trainedToday: 'Workout logged today!',
    pendingToday: 'Not logged yet today',
    streakTip: 'Every day you show up, your companion grows.',
    record: 'All-time record',
    nextReward: 'Next generation',
    missing: 'Missing',
    days: 'days',
    yourAccount: 'Your account',
    viewMembership: 'View membership',
    balanceDue: 'Balance due',
    pendingPayment: 'Payment pending',
    upToDate: 'You are up to date',
    daysLeft: 'days left',
    planLabel: 'Plan',
    cycleStart: 'Cycle start',
    lastPayment: 'Last payment',
    payNow: 'Pay now',
    paymentsHistory: 'Payments history',
    inDays: 'In',
    expiredAgo: 'Expired',
    today: 'Due today',
    todayRoutine: 'Today\'s routine',
    viewRoutine: 'View routine',
    nextActivities: 'Upcoming classes',
    viewAll: 'View all',
    quickAccess: 'Quick access',
    todayHours: 'Today\'s hours',
    getDirections: 'Get directions',
    plan: 'Monthly Plan'
  }
};

const ui = computed(() => translations[currentLang.value] || translations.es);
const locale = computed(() => (currentLang.value === 'en' ? 'en-US' : 'es-MX'));

/* DATOS DESDE LARAVEL: sin nombres, imágenes ni cifras inventadas. */
const loadingDashboard = ref(true);
const dashboardError = ref('');
const inscripciones = ref([]);
const selectedInscripcionId = ref(null);
const gym = ref({ name: '—', branchName: '—', logoUrl: null, coverUrl: null, address: '', city: '', todayHours: '—' });
const member = ref({ name: '—', photoUrl: null, plan: '', nextCut: '', balance: null, lastPayment: null, classesReserved: null, monthGoal: 24, cycleDays: 30, cycleStart: '', membershipStatus: '' });
const rachaInfo = ref({ dias: 0, activoHoy: false });
const rachaRecord = ref(0);
const nextRewardAt = 800;
const isGymOpen = ref(false);
const actividadesReales = ref([]);
const baseApi = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const authToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const k of ['auth_token', 'token', 'access_token', 'gym_token']) {
      const value = storage.getItem(k);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
  }
  return '';
};
const cargarDashboardMiembro = async (id = null) => {
  loadingDashboard.value = true;
  dashboardError.value = '';
  try {
    const token = authToken();
    if (!token) throw new Error('Tu sesión caducó. Inicia sesión nuevamente.');
    const query = id ? `?inscripcion_id=${encodeURIComponent(id)}` : '';
    const response = await fetch(`${baseApi}/api/member/dashboard${query}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Error HTTP ${response.status}`);
    const c = data.cliente || {}, g = data.gimnasio || {}, m = data.membresia || {}, a = data.asistencia || {};
    member.value = {
      name: c.nombre || '—', photoUrl: c.foto_url || null, plan: m.plan || '',
      nextCut: m.vencimiento || '', balance: m.saldo == null ? null : Number(m.saldo),
      lastPayment: m.ultimo_pago || null, classesReserved: null,
      monthGoal: 24, cycleDays: 30, cycleStart: m.fecha_inscripcion || '', membershipStatus: m.estado || ''
    };
    gym.value = {
      name: g.nombre || '—', branchName: g.sede || '—',
      logoUrl: g.logo_url || null, coverUrl: g.portada_url || null,
      address: [g.direccion, g.colonia].filter(Boolean).join(', '),
      city: [g.municipio, g.entidad].filter(Boolean).join(', '), todayHours: g.horario_hoy || '—'
    };
    isGymOpen.value = g.abierto === true;
    attendedDays.value = [...new Set((a.fechas_mes || []).map(f => Number(String(f).slice(8, 10))).filter(n => n >= 1 && n <= 31))];
    rachaInfo.value = { dias: Number(a.dias_acumulados || 0), activoHoy: a.asistio_hoy === true };
    rachaRecord.value = Number(a.mejor_racha || 0);
    actividadesReales.value = Array.isArray(data.actividades) ? data.actividades : [];
    inscripciones.value = Array.isArray(data.inscripciones) ? data.inscripciones : [];
    selectedInscripcionId.value = data.inscripcion_id || null;
  } catch (e) { dashboardError.value = e?.message || 'No se pudo cargar el Dashboard.'; }
  finally { loadingDashboard.value = false; }
};
const onMemberDashboardRefresh = () => { void cargarDashboardMiembro(selectedInscripcionId.value); };

const heroStyle = computed(() =>
  gym.value.coverUrl ? { '--cover': `url('${gym.value.coverUrl}')` } : {}
);

/* =========================================================
   FECHAS, CORTE Y SALDO
========================================================= */

const MONTHS = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

const parseDate = (value) => {
  const [y, m, d] = String(value || '').split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso) => {
  const date = parseDate(iso);
  if (!date) return '—';
  const months = MONTHS[currentLang.value] || MONTHS.es;
  return `${date.d}/${capitalize(months[date.m - 1])}/${date.y}`;
};

const formatMoney = (n) =>
  `$${Number(n || 0).toLocaleString(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const nextCutText = computed(() => formatDate(member.value.nextCut));
const balanceText = computed(() => member.value.balance == null ? '—' : formatMoney(member.value.balance));

const daysRemaining = computed(() => {
  const date = parseDate(member.value.nextCut);
  if (!date) return null;

  const end = new Date(date.y, date.m - 1, date.d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((end - today) / 86400000);
});

/* ok = vigente · soon = vence en 7 días o menos · expired = ya venció */
const membershipState = computed(() => {
  if (['inactivo', 'suspendido', 'cancelado', 'eliminado temporal'].includes(String(member.value.membershipStatus || '').toLowerCase())) return 'expired';
  if (daysRemaining.value === null) return 'unknown';
  if (daysRemaining.value < 0) return 'expired';
  if (daysRemaining.value <= 7) return 'soon';
  return 'ok';
});

const membershipPillClass = computed(() =>
  membershipState.value === 'expired' ? 'blocked' : membershipState.value === 'soon' ? 'pending' : membershipState.value === 'unknown' ? 'pending' : 'active'
);

const membershipStatusText = computed(() =>
  membershipState.value === 'unknown' ? 'Estado no disponible' : membershipState.value === 'expired'
    ? ui.value.membershipExpired
    : membershipState.value === 'soon'
      ? ui.value.membershipWarning
      : ui.value.membershipActive
);

const cutSubtitle = computed(() => {
  const n = daysRemaining.value;
  if (n === null) return '—';
  const days = ui.value.days;

  if (n < 0) return `${ui.value.expiredAgo} ${Math.abs(n)} ${days}`;
  if (n === 0) return ui.value.today;
  return `${ui.value.inDays} ${n} ${days}`;
});

const balanceState = computed(() => {
  if (member.value.balance == null) return 'unknown';
  if (member.value.balance <= 0) return 'clear';
  return membershipState.value === 'expired' ? 'expired' : membershipState.value === 'soon' ? 'soon' : 'due';
});

const cutTint = computed(() =>
  membershipState.value === 'expired' ? 'var(--red)' : membershipState.value === 'soon' ? 'var(--amber)' : 'var(--hl)'
);

const balanceTint = computed(() => {
  if (balanceState.value === 'clear') return 'var(--green)';
  if (balanceState.value === 'expired') return 'var(--red)';
  return balanceState.value === 'soon' ? 'var(--amber)' : 'var(--hl)';
});

const cycleStartText = computed(() => {
  if (member.value.cycleStart) return formatDate(member.value.cycleStart);
  const date = parseDate(member.value.nextCut);
  if (!date) return '—';
  const start = new Date(date.y, date.m - 1, date.d - (member.value.cycleDays || 30));
  return formatDate(`${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`);
});

const cyclePercent = computed(() => {
  if (daysRemaining.value === null) return 0;
  const total = member.value.cycleDays || 30;
  const used = total - Math.max(daysRemaining.value, 0);
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
});

/* Anillo: muestra lo que le queda al ciclo */
const RING_LENGTH = 2 * Math.PI * 52;
const ringDash = computed(() => {
  const left = RING_LENGTH * ((100 - cyclePercent.value) / 100);
  return `${left} ${RING_LENGTH}`;
});

/* =========================================================
   CALENDARIO DE ASISTENCIA (mes actual)
========================================================= */

const now = new Date();
const todayDay = now.getDate();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();

const attendedDays = ref([]);

const diasCalendario = computed(() =>
  Array.from({ length: daysInMonth }, (_, i) => {
    const dia = i + 1;
    let estado = 'futuro';

    if (dia === todayDay) estado = 'hoy';
    else if (dia < todayDay) estado = attendedDays.value.includes(dia) ? 'asistio' : 'sinregistro';

    return { dia, estado };
  })
);

const celdasCalendario = computed(() => [
  ...Array.from({ length: firstWeekday }, () => null),
  ...diasCalendario.value
]);

const cuenta = (d) => d.estado === 'asistio' || (d.estado === 'hoy' && rachaInfo.value.activoHoy);

const attendedCount = computed(() => diasCalendario.value.filter(cuenta).length);
// No contar ausencias como faltas sin un horario personal verificado.
const missedCount = computed(() => 0);

const goalPercent = computed(() =>
  member.value.monthGoal > 0
    ? Math.min(100, Math.round((attendedCount.value / member.value.monthGoal) * 100))
    : 0
);

/* Racha dentro del mes, contando hacia atrás desde hoy */
const rachaActualMes = computed(() => {
  let racha = rachaInfo.value.activoHoy ? 1 : 0;

  for (let d = todayDay - 1; d >= 1; d--) {
    if (attendedDays.value.includes(d)) racha++;
    else break;
  }

  return racha;
});

const mejorRachaMes = computed(() => {
  let max = 0;
  let actual = 0;

  diasCalendario.value.forEach((d) => {
    if (cuenta(d)) {
      actual++;
      max = Math.max(max, actual);
    } else {
      actual = 0;
    }
  });

  return Math.max(max, rachaActualMes.value);
});

const monthLabel = computed(() =>
  capitalize(new Date(currentYear, currentMonth, 1).toLocaleDateString(locale.value, { month: 'long' }))
);

/* =========================================================
   RACHA Y MASCOTAS
========================================================= */

const daysToReward = computed(() => Math.max(nextRewardAt - rachaInfo.value.dias, 0));
const rewardPercent = computed(() =>
  Math.min(100, Math.round((rachaInfo.value.dias / nextRewardAt) * 100))
);

/* =========================================================
   RUTINA, ACTIVIDADES Y ACCESOS RÁPIDOS
========================================================= */

// No inventar rutinas; requieren una API de rutinas asignadas al miembro.
const todayRoutine = computed(() => ({ name: 'Sin rutina asignada', duration: '—', exercises: [] }));
const nextActivities = computed(() => actividadesReales.value.map(a => {
  const date = String(a.fecha || '');
  return { day: date.slice(8, 10), month: date.slice(5, 7), title: a.nombre,
    time: a.hora || '—', trainer: a.instructor || '—', status: 'Disponible', booked: false };
}));

/* Sin "Pagar membresía" ni "Reservar clase": ya tienen su botón en sus paneles */
const quickActions = computed(() => {
  const icons = {
    routines: 'M6.5 6.5h11M6.5 17.5h11M3 12h18M4 6.5V4h3v2.5M17 6.5V4h3v2.5M4 17.5V20h3v-2.5M17 17.5V20h3v-2.5',
    stats: 'M18 20V10M12 20V4M6 20v-6',
    calculator: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h.01M12 18h.01',
    nutrition: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
    profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
    qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4'
  };

  return currentLang.value === 'es'
    ? [
        { label: 'Mis rutinas', description: 'Consulta tu entrenamiento', route: '/Member/my-routines', icon: icons.routines },
        { label: 'Mis estadísticas', description: 'Revisa tu progreso', route: '/Member/statistics', icon: icons.stats },
        { label: 'Calculadora corporal', description: 'IMC, peso ideal y más', route: '/Member/body-calculator', icon: icons.calculator },
        { label: 'Plan nutricional', description: 'Tu alimentación', route: '/Member/nutrition-plan', icon: icons.nutrition },
        { label: 'Mi QR de acceso', description: 'Entra sin credencial', route: '/Member/access-qr', icon: icons.qr },
        { label: 'Mi perfil', description: 'Tus datos y medidas', route: '/Member/profile', icon: icons.profile }
      ]
    : [
        { label: 'My routines', description: 'View your training', route: '/Member/my-routines', icon: icons.routines },
        { label: 'My statistics', description: 'Review your progress', route: '/Member/statistics', icon: icons.stats },
        { label: 'Body calculator', description: 'BMI, ideal weight and more', route: '/Member/body-calculator', icon: icons.calculator },
        { label: 'Nutrition plan', description: 'Your nutrition', route: '/Member/nutrition-plan', icon: icons.nutrition },
        { label: 'Access QR', description: 'Enter without a card', route: '/Member/access-qr', icon: icons.qr },
        { label: 'My profile', description: 'Your data and measures', route: '/Member/profile', icon: icons.profile }
      ];
});

/* =========================================================
   GIMNASIO
========================================================= */

const directionsUrl = computed(
  () =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${gym.value.address}, ${gym.value.city}`
    )}`
);

onMounted(() => {
  void cargarDashboardMiembro();
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('language-changed', handleLangChange);
  window.addEventListener('focus', onMemberDashboardRefresh);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('language-changed', handleLangChange);
  window.removeEventListener('focus', onMemberDashboardRefresh);
});
</script>

<style scoped>
.member-dashboard-message { padding: 10px 16px; margin: 12px 0; color: var(--color-texto-general, #d4d4dc); }
.member-dashboard-message button { text-decoration: underline; cursor: pointer; }
.avatar-fallback { display: grid; place-items: center; width: 100%; height: 100%; font-size: 1.4rem; font-weight: 800; }
.member-inscription-select { display: block; max-width: 250px; margin-top: 6px; font-size: 12px; background: #191923; color: #fff; border: 1px solid #555; border-radius: 8px; padding: 5px; }

@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button { font: inherit; }

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
  --text3: rgba(245, 245, 244, 0.48);
  --surface: rgba(255, 255, 255, 0.03);
  --surface-hover: rgba(255, 255, 255, 0.055);
  --green: #34d399;
  --amber: #fbbf24;
  --red: #f87171;
  --pink: #f472b6;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: calc(100vh - 72px);
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
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

/* =========================================================
   1. ENCABEZADO
========================================================= */

.hero {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 20px;
}

/* Miembro (izquierda) */
.hero-member {
  position: relative;
  min-width: 0;
  padding: 20px 32px 20px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
  background:
    radial-gradient(520px 260px at 100% 0%, var(--hl-mid), transparent 70%),
    linear-gradient(135deg, color-mix(in srgb, var(--card) 92%, white), var(--card) 60%);
  border: 1px solid var(--line2);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.avatar {
  position: relative;
  flex: none;
  width: 148px;
  height: 148px;
  padding: 3px;
  background: linear-gradient(145deg, var(--hl), rgba(255, 255, 255, 0.18));
  border-radius: 26px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 34px var(--hl-mid);
}

.avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: #111;
  border: 3px solid var(--card);
  border-radius: 23px;
}

.hero-copy { min-width: 0; display: flex; flex-direction: column; gap: 8px; }

.welcome { color: var(--hl); font-size: 15px; font-weight: 700; }

.hero-copy h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(22px, 2.5vw, 36px);
  line-height: 1.04;
  letter-spacing: -0.8px;
  overflow-wrap: anywhere;
}

.hero-meta { margin-top: 6px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.plan-badge,
.hero-meta .billing-pill {
  height: 34px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 800;
  white-space: nowrap;
}

.plan-badge { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }

.billing-pill.active { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.32); }
.billing-pill.blocked { color: var(--red); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.32); }
.billing-pill.pending { color: var(--amber); background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.32); }

.status-dot,
.billing-dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 18%, transparent), 0 0 12px currentColor;
}

/* Gimnasio (derecha) */
/* Solo esta tarjeta lleva la foto de portada del gimnasio */
.hero-gym {
  position: relative;
  overflow: hidden;
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "head status"
    "foot foot";
  align-content: center;
  align-items: center;
  gap: 18px 16px;
  background: var(--card);
  border: 1px solid var(--line2);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
}

.hero-gym.has-cover {
  background:
    linear-gradient(180deg, rgba(8, 8, 8, 0.5), rgba(8, 8, 8, 0.82)),
    var(--cover) center / cover no-repeat,
    var(--card);
}

.hero-gym > * { position: relative; }

.gym-head { grid-area: head; min-width: 0; display: flex; align-items: center; gap: 16px; }

.gym-logo {
  width: 84px;
  height: 84px;
  flex: none;
  overflow: hidden;
  background: #111;
  border: 1px solid var(--line2);
  border-radius: 22px;
}

.gym-logo img { width: 100%; height: 100%; display: block; object-fit: cover; }

.gym-title { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.gym-title small { color: var(--text3); font-size: 12px; font-weight: 600; }

.gym-title strong {
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: 19px;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.gym-title span { color: var(--text2); font-size: 13px; }

.status-pill {
  grid-area: status;
  height: 38px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
}

.status-pill.open { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.32); }
.status-pill.closed { color: var(--red); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.32); }

.gym-foot {
  grid-area: foot;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.gym-hours { display: flex; flex-direction: column; gap: 3px; }
.gym-hours small { color: var(--text3); font-size: 11.5px; font-weight: 600; }
.gym-hours strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; }

.directions-btn {
  height: 42px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-texto-botones, #fff);
  text-decoration: none;
  background: var(--color-botones, var(--hl));
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  transition: filter 0.2s ease;
}

.directions-btn:hover { filter: brightness(1.1); }

.directions-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   2. INDICADORES
========================================================= */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  --tint: var(--hl);

  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  background:
    radial-gradient(180px 90px at 0% 0%, color-mix(in srgb, var(--tint) 12%, transparent), transparent 75%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 22px;
  right: 22px;
  height: 2px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--tint), transparent);
}


.kpi-icon {
  width: 50px;
  height: 50px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tint);
  background: color-mix(in srgb, var(--tint) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--tint) 32%, transparent);
  border-radius: 15px;
}

.kpi-icon.accent,
.kpi-icon.success,
.kpi-icon.warning { color: var(--tint); }

.kpi-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.kpi-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }

.kpi-body strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
}

.kpi-body strong.sm { font-size: 24px; white-space: nowrap; }

.kpi-body strong em {
  color: var(--text3);
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
}

.kpi-body span {
  overflow: hidden;
  color: var(--text3);
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   PANELES
========================================================= */

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.panel {
  min-width: 0;
  padding: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.panel-header {
  margin-bottom: 18px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.panel-header h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.panel-sub { margin: 4px 0 0; color: var(--text3); font-size: 12.5px; }

.link-btn {
  padding: 7px 13px;
  color: var(--hl);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.link-btn:hover { background: var(--hl-mid); border-color: var(--hl-line); }

:is(button, a):focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }

/* =========================================================
   3. CALENDARIO
========================================================= */

.calendar-panel { display: flex; flex-direction: column; }

.month-badge {
  padding: 6px 12px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 9px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }

.stat-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
}

.stat-chip svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stat-chip.streak { color: #facc15; border-color: rgba(250, 204, 21, 0.28); background: rgba(250, 204, 21, 0.06); }
.stat-chip.best { color: #93c5fd; border-color: rgba(147, 197, 253, 0.28); background: rgba(147, 197, 253, 0.06); }
.stat-chip b { font-weight: 800; }

.cal-progress { margin-bottom: 18px; }

.cal-progress-label {
  margin-bottom: 7px;
  display: flex;
  justify-content: space-between;
  color: var(--text2);
  font-size: 12px;
  font-weight: 600;
}

.cal-progress-label b { color: #4ade80; }

.cal-progress-track {
  height: 7px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 999px;
}

.cal-progress-track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--hl), #4ade80);
  border-radius: 999px;
  transition: width 0.8s var(--ease);
}

.cal-grid-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: var(--text3);
  font-size: 11px;
  font-weight: 700;
}

.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  align-content: center;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  font-size: clamp(11px, 1.4vw, 13px);
  font-weight: 600;
}

.day-number { position: relative; z-index: 1; }
.day-cell.vacio { background: transparent; border-color: transparent; }

.day-cell.asistio {
  color: #86efac;
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.32), rgba(34, 197, 94, 0.08));
  border-color: rgba(34, 197, 94, 0.45);
}

.day-cell.falto {
  color: #fca5a5;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.28), rgba(239, 68, 68, 0.06));
  border-color: rgba(239, 68, 68, 0.4);
}

.day-cell.hoy {
  color: #fde047;
  background: linear-gradient(145deg, rgba(234, 179, 8, 0.34), rgba(234, 179, 8, 0.1));
  border-color: rgba(234, 179, 8, 0.6);
  box-shadow: 0 0 14px rgba(234, 179, 8, 0.35);
  font-weight: 800;
}

.day-cell.futuro { color: rgba(245, 245, 244, 0.28); }

.day-icon {
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.day-icon.asistio { background: #4ade80; }
.day-icon.falto { background: #f87171; }

.day-icon svg {
  width: 8px;
  height: 8px;
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.day-icon.asistio svg { stroke: #0a2e18; }
.day-icon.falto svg { stroke: #3a0d0d; }

.hoy-ring {
  position: absolute;
  inset: -2px;
  border: 1.5px solid rgba(250, 204, 21, 0.55);
  border-radius: 12px;
  pointer-events: none;
  animation: pulse-ring 1.8s ease-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.3); opacity: 0; }
}

.legend {
  margin-top: 18px;
  padding-top: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid var(--line);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.legend-item b { color: #fff; font-weight: 800; }

.dot { width: 8px; height: 8px; flex: none; border-radius: 50%; }
.dot.asistio { background: #4ade80; }
.dot.falto { background: #f87171; }
.dot.hoy { background: #facc15; }

/* =========================================================
   RACHA Y MASCOTAS
========================================================= */

.streak-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, transparent 55%), var(--card);
  border-color: rgba(236, 72, 153, 0.28);
}

.streak-panel .panel-header { margin-bottom: 4px; border-color: rgba(236, 72, 153, 0.18); }

.streak-number { display: flex; align-items: center; gap: 6px; }

.streak-number strong {
  color: #fff;
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
}

.streak-number svg {
  width: 26px;
  height: 26px;
  fill: #facc15;
  stroke: #f97316;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px #facc15);
  animation: flame 1.8s ease-in-out infinite;
}

@keyframes flame { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }

.streak-banner {
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 11px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(236, 72, 153, 0.16);
  border-radius: 14px;
}

.streak-banner div { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.streak-banner strong { color: #fff; font-size: 13px; }
.streak-banner small { color: var(--text3); font-size: 11.5px; }

.streak-dot {
  width: 9px;
  height: 9px;
  flex: none;
  background: var(--red);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--red);
}

.streak-dot.active { background: #4ade80; box-shadow: 0 0 8px #4ade80; }

.pets-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; }

.mini-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }

.mini-card {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.mini-card span { color: var(--text3); font-size: 11px; font-weight: 600; }
.mini-card strong { color: #fff; font-size: 14px; }
.mini-card strong.pink { color: var(--pink); }

.reward-track { height: 6px; overflow: hidden; background: rgba(255, 255, 255, 0.07); border-radius: 999px; }

.reward-track i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ec4899, #f43f5e);
  border-radius: 999px;
}

/* =========================================================
   4. CUENTA
========================================================= */

.account-panel { display: flex; flex-direction: column; }

.account-body {
  margin: 2px 0 20px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 28px;
}

.ring { position: relative; width: 156px; height: 156px; flex: none; border: 0; outline: 0; background: none; box-shadow: none; }
.ring svg { width: 100%; height: 100%; display: block; transform: rotate(-90deg); border: 0; outline: 0; background: none; box-shadow: none; }

.ring-bg,
.ring-fg { fill: none; stroke-width: 9; }

.ring-bg { stroke: rgba(255, 255, 255, 0.07); }

.ring-fg {
  stroke: var(--ring, var(--hl));
  stroke-linecap: round;
  filter: drop-shadow(0 0 7px color-mix(in srgb, var(--ring, var(--hl)) 55%, transparent));
  transition: stroke-dasharray 0.8s var(--ease);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.ring-center strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 44px;
  font-weight: 600;
  line-height: 1;
}

.ring-center small { color: var(--text3); font-size: 12px; font-weight: 600; }

.account-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }

.account-list li {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 13px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.al-icon {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 11px;
}

.al-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.al-copy { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.al-copy small { color: var(--text3); font-size: 11.5px; font-weight: 600; }
.al-copy strong { color: var(--title); font-size: 14px; overflow-wrap: anywhere; }

.account-actions {
  margin-top: auto;
  padding-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-primary,
.btn-ghost {
  height: 46px;
  padding: 0 14px;
  cursor: pointer;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  transition: filter 0.2s ease, background 0.2s ease;
}

.btn-primary {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
}

.btn-primary:hover { filter: brightness(1.1); }

.btn-ghost { color: var(--title); background: var(--surface); border: 1px solid var(--line2); }
.btn-ghost:hover { background: var(--surface-hover); }

/* =========================================================
   RUTINA DE HOY
========================================================= */

.routine-panel { display: flex; flex-direction: column; }

.exercise-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }

.exercise-list li {
  min-height: 56px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  border-top: 1px solid var(--line);
}

.exercise-list li:first-child { border-top: 0; }

.ex-index {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 15px;
}

.ex-name { overflow: hidden; color: var(--title); font-size: 14px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }

.ex-sets {
  padding: 5px 11px;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

/* =========================================================
   5. ACTIVIDADES Y ACCESOS RÁPIDOS
========================================================= */

.activity-list { display: flex; flex-direction: column; }

.activity-row {
  min-height: 72px;
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  border-top: 1px solid var(--line);
}

.activity-row:first-child { border-top: 0; }

.date-box {
  width: 50px;
  height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
}

.date-box strong { color: #fff; font-family: 'Oswald', sans-serif; font-size: 19px; line-height: 1; }
.date-box span { margin-top: 3px; color: var(--hl); font-size: 10px; font-weight: 800; letter-spacing: 0.6px; }

.activity-info { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.activity-info strong { overflow: hidden; color: var(--title); font-size: 14.5px; text-overflow: ellipsis; white-space: nowrap; }
.activity-info span { color: var(--text3); font-size: 12px; }

.activity-status {
  padding: 5px 11px;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.activity-status.booked {
  color: var(--green);
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.28);
}

.quick-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }

.quick-action {
  min-height: 74px;
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
  transition: border-color 0.2s ease, background 0.2s ease;
}

.quick-action:hover { border-color: var(--hl-line); background: var(--hl-soft); }

.quick-icon {
  width: 42px;
  height: 42px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
  transition: background 0.2s ease, color 0.2s ease;
}

.quick-action:hover .quick-icon { color: #fff; background: var(--hl); }

.quick-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.quick-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.quick-copy strong { overflow: hidden; color: var(--title); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.quick-copy small { overflow: hidden; color: var(--text3); font-size: 11.5px; text-overflow: ellipsis; white-space: nowrap; }

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1000px) {
  .hero { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
}

@media (max-width: 680px) {
  .dashboard-container { padding: 14px 12px 44px; gap: 14px; }

  .hero { gap: 14px; }
  /* Tarjeta del miembro: foto + nombre arriba, etiquetas en una fila abajo */
  .hero-member {
    padding: 16px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      "avatar welcome"
      "avatar name"
      "meta meta";
    column-gap: 14px;
    row-gap: 2px;
    align-items: center;
    border-radius: 22px;
  }

  .hero-copy { display: contents; }

  .avatar { grid-area: avatar; width: 88px; height: 88px; padding: 2px; border-radius: 20px; }
  .avatar img { border-width: 2px; border-radius: 17px; }

  .welcome { grid-area: welcome; align-self: end; font-size: 12px; }

  .hero-copy h1 {
    grid-area: name;
    align-self: start;
    font-size: 20px;
    line-height: 1.12;
    letter-spacing: -0.3px;
  }

  .hero-meta {
    grid-area: meta;
    margin-top: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .plan-badge,
  .hero-meta .billing-pill {
    height: 34px;
    padding: 0 8px;
    justify-content: center;
    gap: 6px;
    font-size: 11.5px;
  }

  /* Tarjeta del gimnasio: nombre arriba, horario + estado en medio, botón completo */
  .hero-gym {
    padding: 16px;
    gap: 14px 12px;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "head head"
      "hours status"
      "btn btn";
    border-radius: 22px;
  }

  .hero-gym.has-cover {
    background:
      linear-gradient(180deg, rgba(8, 8, 8, 0.78), rgba(8, 8, 8, 0.92)),
      var(--cover) center / cover no-repeat,
      var(--card);
  }

  .gym-head { gap: 14px; }
  .gym-logo { width: 56px; height: 56px; border-radius: 15px; }
  .gym-title { gap: 2px; }
  .gym-title strong { font-size: 16px; }

  .gym-foot { display: contents; }
  .gym-hours { grid-area: hours; }
  .gym-hours strong { font-size: 19px; }
  .status-pill { height: 34px; padding: 0 12px; font-size: 11.5px; }
  .directions-btn { grid-area: btn; height: 44px; }

  .account-body { grid-template-columns: 1fr; justify-items: center; gap: 18px; }
  .account-list { width: 100%; }

  .account-body { grid-template-columns: 1fr; justify-items: center; gap: 18px; }
  .account-list { width: 100%; }

  .kpi-card { padding: 16px 14px; flex-direction: column; align-items: flex-start; gap: 12px; border-radius: 17px; }
  .kpi-card::before { left: 14px; right: 14px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 12px; }
  .kpi-body { width: 100%; }
  .kpi-body strong { font-size: 28px; }
  .kpi-body strong.sm { font-size: 18px; line-height: 1.15; white-space: normal; }
  .kpi-body span { white-space: normal; line-height: 1.3; }

  .panel { padding: 18px 15px; border-radius: 18px; }
  .panel-header { margin-bottom: 14px; padding-bottom: 13px; }
  .panel-header h2 { font-size: 18px; }

  .days-grid { gap: 4px; }
  .day-cell { border-radius: 8px; }

  .quick-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }

  .quick-action {
    min-height: 98px;
    padding: 13px 6px 10px;
    flex-direction: column;
    justify-content: center;
    gap: 9px;
    text-align: center;
  }

  .quick-copy { width: 100%; align-items: center; }

  .quick-copy strong {
    display: -webkit-box;
    font-size: 11px;
    line-height: 1.25;
    white-space: normal;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .quick-copy small { display: none; }

  .activity-row { grid-template-columns: 46px minmax(0, 1fr); }
  .activity-status { display: none; }

}

@media (max-width: 420px) {
  .account-actions { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>