<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('asistenciaTitle') }} <span class="highlight">{{ t('mensualHighlight') }}</span></h1>
          <span class="title-underline"></span>
          <p class="main-subtitle">{{ t('pageSubtitle') }}</p>
        </div>
        <div class="actions-bar" id="tutorial-step-0">
          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <select class="status-select" v-model="selectedDay">
              <option value="">{{ t('allDaysOption') }}</option>
              <option v-for="d in days" :key="d.value" :value="d.value">{{ t(d.key) }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" :placeholder="t('searchPlaceholder')" v-model="searchQuery">
            <button v-if="searchQuery" class="search-clear" type="button" @click="searchQuery = ''" aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button class="btn-bulk" @click="activeModal = 'asistencias'">
            <span class="btn-bulk-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </span>
            <div class="btn-text-wrapper">
              <span class="btn-label">{{ t('reportsLabel') }}</span>
              <span class="highlight-text-custom">{{ t('viewGraph') }}</span>
            </div>
          </button>
        </div>
      </header>

      <!-- NAVEGADOR DE MES -->
      <section class="month-bar" aria-label="Month navigation">
        <div class="month-nav">
          <button class="nav-btn" type="button" :aria-label="t('prevMonth')" @click="shiftMonth(-1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="nav-btn nav-today" type="button" :disabled="isCurrentMonth" @click="goToday">{{ t('today') }}</button>
          <button class="nav-btn" type="button" :aria-label="t('nextMonth')" :disabled="isCurrentMonth" @click="shiftMonth(1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="month-label">
          <span class="month-name">{{ monthLabel }}</span>
          <span class="month-range">{{ rangeLabel }}</span>
        </div>
        <label class="month-picker">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <input type="month" :value="monthValue" :max="maxMonthValue" :aria-label="t('pickMonth')" @change="pickMonth">
        </label>
      </section>

      <!-- RESUMEN -->
      <p v-if="loading" class="data-message" role="status">{{ t('loading') }}</p>
      <p v-if="errorCarga" class="data-message error" role="alert">{{ errorCarga }} <button type="button" @click="loadUsers">{{ t('retry') }}</button></p>
      <p v-if="avisoAsistencia" class="data-message warning" role="alert">{{ avisoAsistencia }}</p>
      <section class="stats-row">
        <div class="stat-card" v-for="s in stats" :key="s.key" :class="'stat-' + s.tone">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ t(s.key) }}</span>
        </div>
      </section>

      <!-- ESCRITORIO -->
      <div class="table-container desktop-only" :id="!isMobile ? 'tutorial-step-1' : undefined">
        <div class="table-scroll">
          <table class="user-table">
            <thead>
              <tr>
                <th class="col-photo">{{ t('colPhoto') }}</th>
                <th class="col-name">{{ t('colName') }}</th>
                <th class="col-days">
                  <div class="days-strip head" :style="stripStyle">
                    <span v-for="d in monthDays" :key="d.n" class="head-day" :class="{ weekend: d.weekend, today: d.isToday }">
                      <b>{{ d.n }}</b><i>{{ d.initial }}</i>
                    </span>
                  </div>
                </th>
                <th class="col-total">{{ t('colTotal') }}</th>
                <th class="col-status">{{ t('colStatus') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in pagedUsers" :key="user.id">
                <td><div class="avatar-small" :style="avatarStyle(user.id)"><img v-if="user.photo" :src="user.photo" :alt="user.name" @error="user.photo=null" />{{ user.photo ? '' : getInitials(user.name) }}</div></td>
                <td>
                  <div class="name-cell">
                    <span class="text-bold">{{ user.name }}</span>
                    <span class="text-muted small">{{ user.email || '—' }}</span>
                    <span :class="['status-badge2', getMembershipClass(user.membership)]">{{ user.membership }}</span>
                  </div>
                </td>
                <td class="cell-days">
                  <div class="days-strip" :style="stripStyle">
                    <span
                      v-for="d in monthDays"
                      :key="d.n"
                      class="day-dot"
                      :class="{ on: user.attendedSet.has(d.n), weekend: d.weekend, today: d.isToday, future: d.future }"
                      :title="`${d.label} · ${user.attendedSet.has(d.n) ? t('attended') : t('noAttended')}`"
                    ></span>
                  </div>
                </td>
                <td>
                  <div class="total-cell">
                    <span class="total-num">{{ user.attendedSet.size }}<small> / {{ elapsedDays }}</small></span>
                    <span class="total-bar"><span class="total-fill" :style="{ width: percent(user) + '%' }"></span></span>
                  </div>
                </td>
                <td><span :class="['status-badge', getStatusClass(user.status)]">{{ user.status }}</span></td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="empty-state-cell">
                  <div class="empty-state">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span>{{ t('emptyState') }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span class="legend"><i class="day-dot on"></i>{{ t('attended') }}</span>
          <span class="legend"><i class="day-dot"></i>{{ t('noAttended') }}</span>
          <span class="legend"><i class="day-dot today"></i>{{ t('today') }}</span>
          <span class="footer-count">{{ filteredUsers.length }} {{ t('resultsLabel') }}</span>
        </div>
      </div>

      <!-- MÓVIL -->
      <div class="mobile-only">
        <div
          v-for="(user, index) in pagedUsers"
          :key="user.id"
          class="user-card"
          :class="'card-' + getStatusClass(user.status)"
          :id="isMobile && index === 0 ? 'tutorial-step-1' : undefined"
        >
          <div class="card-top-section">
            <div class="avatar-small" :style="avatarStyle(user.id)"><img v-if="user.photo" :src="user.photo" :alt="user.name" @error="user.photo=null" />{{ user.photo ? '' : getInitials(user.name) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <div class="badges-row">
                <span :class="['status-badge2', getMembershipClass(user.membership)]">{{ user.membership }}</span>
                <span :class="['status-badge', getStatusClass(user.status)]">{{ user.status }}</span>
              </div>
            </div>
            <span class="day-chip">{{ user.attendedSet.size }} / {{ elapsedDays }}</span>
          </div>
          <div class="mini-cal">
            <span v-for="(w, i) in weekInitials" :key="'w' + i" class="mini-head">{{ w }}</span>
            <span v-for="b in firstOffset" :key="'b' + b" class="mini-blank"></span>
            <span
              v-for="d in monthDays"
              :key="d.n"
              class="mini-day"
              :class="{ on: user.attendedSet.has(d.n), today: d.isToday, future: d.future }"
            >{{ d.n }}</span>
          </div>
          <div class="card-meta">
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="email-text">{{ user.email }}</span></span>
            <span class="meta-row expiration-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="vence-label">{{ t('expiresLabel') }}:</span> {{ user.expirationDate }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="phone-text">{{ user.phone }}</span></span>
          </div>
        </div>
        <div v-if="filteredUsers.length === 0" class="empty-state-mobile">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{{ t('emptyState') }}</span>
        </div>
      </div>

      <!-- PAGINACIÓN (solo con más de 40 resultados) -->
      <nav v-if="showPager" class="pager" :aria-label="t('pagination')">
        <button class="pager-btn" type="button" :disabled="page <= 1" :aria-label="t('prevPage')" @click="goPage(page - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page >= totalPages" :aria-label="t('nextPage')" @click="goPage(page + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>
    </main>
    <transition name="pop">
      <div v-if="activeModal === 'asistencias'" class="modal-wrapper" @click.self="activeModal = null">
        <Asistencias @close="activeModal = null" />
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import Asistencias from '../Componets/Attendance.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

type User = {
  id: number; name: string; email: string; expirationDate: string;
  status: string; phone: string; mensualidad: string; membership: string;
  attendedSet: Set<number>; weekdays: string[]; photo: string | null;
};
type ApiRow = {
  ID_Inscripto: number | string; ID_Cliente: number | string;
  nombre: string; correo: string | null; celular: string | null;
  foto_url: string | null; fecha_vencimiento: string | null;
  plan: string | null; periodo: string | null;
  estatus_inscripcion?: string | null;
};
type ApiIngresos = { inscripciones?: ApiRow[]; message?: string };
type ApiAsistencia = { ID_Inscripto: number | string; fecha: string; dia?: string };
type ApiMes = { asistencias?: ApiAsistencia[] };
type NotifyRef = { notify?: (message: string, type?: string) => void };
type MonthDay = {
  n: number; weekend: boolean; isToday: boolean; future: boolean;
  initial: string; label: string; weekday: string;
};

const route = useRoute();
const activeModal = ref<string | null>(null);
const toastRef = ref<NotifyRef | null>(null);
const selectedDay = ref('');
const searchQuery = ref('');
const users = ref<User[]>([]);
const loading = ref(false);
const errorCarga = ref('');
const avisoAsistencia = ref('');
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const isMobile = ref(window.innerWidth <= 900);
const sedeEvento = ref(0);

const days = [
  { value: 'Lunes', key: 'monday' },
  { value: 'Martes', key: 'tuesday' },
  { value: 'Miercoles', key: 'wednesday' },
  { value: 'Jueves', key: 'thursday' },
  { value: 'Viernes', key: 'friday' },
  { value: 'Sabado', key: 'saturday' },
  { value: 'Domingo', key: 'sunday' }
] as const;
// Índice de Date.getUTCDay() (0 = domingo) -> valor interno del día.
const weekdayByIndex = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

const langData: Record<'es' | 'en', Record<string, string>> = {
  es: {
    asistenciaTitle: 'Asistencia', mensualHighlight: 'Mensual',
    pageSubtitle: 'Consulta la asistencia de tus miembros mes por mes.',
    allDaysOption: 'Todos los días', monday: 'Lunes', tuesday: 'Martes',
    wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes',
    saturday: 'Sábado', sunday: 'Domingo', reportsLabel: 'Reportes',
    viewGraph: 'Ver Gráfica', searchPlaceholder: 'Buscar cliente...',
    colPhoto: 'Foto', colName: 'Nombre', colTotal: 'Asistencias',
    colStatus: 'Status', expiresLabel: 'Vence',
    emptyState: 'No se encontraron clientes en esta sucursal.',
    resultsLabel: 'resultados', pagination: 'Paginación',
    prevPage: 'Página anterior', nextPage: 'Página siguiente',
    statTotal: 'Total', statActive: 'Activos', statPending: 'Pendientes',
    statInactive: 'Inactivos', statVisits: 'Asistencias del mes',
    loading: 'Cargando asistencias...', retry: 'Reintentar',
    today: 'Hoy', prevMonth: 'Mes anterior', nextMonth: 'Mes siguiente',
    pickMonth: 'Elegir mes', attended: 'Asistió', noAttended: 'Sin asistencia'
  },
  en: {
    asistenciaTitle: 'Monthly', mensualHighlight: 'Attendance',
    pageSubtitle: 'Review your members’ attendance month by month.',
    allDaysOption: 'All days', monday: 'Monday', tuesday: 'Tuesday',
    wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday',
    saturday: 'Saturday', sunday: 'Sunday', reportsLabel: 'Reports',
    viewGraph: 'View Chart', searchPlaceholder: 'Search client...',
    colPhoto: 'Photo', colName: 'Name', colTotal: 'Visits',
    colStatus: 'Status', expiresLabel: 'Expires',
    emptyState: 'No clients found at this branch.', resultsLabel: 'results',
    pagination: 'Pagination', prevPage: 'Previous page', nextPage: 'Next page',
    statTotal: 'Total', statActive: 'Active', statPending: 'Pending',
    statInactive: 'Inactive', statVisits: 'Visits this month',
    loading: 'Loading attendance...', retry: 'Retry',
    today: 'Today', prevMonth: 'Previous month', nextMonth: 'Next month',
    pickMonth: 'Pick month', attended: 'Attended', noAttended: 'No visit'
  }
};

const t = (key: string): string =>
  langData[currentLang.value === 'en' ? 'en' : 'es'][key] ?? langData.es[key] ?? key;

const pad = (n: number): string => String(n).padStart(2, '0');
const formatDate = (value: string | null | undefined): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '—';
};
const dateParts = (): [number, number, number] => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Monterrey', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const value = (key: string) => Number(parts.find(part => part.type === key)?.value || 0);
  return [value('year'), value('month'), value('day')];
};
const dayDiff = (day: string | null | undefined): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(day || ''));
  if (!match) return null;
  const today = dateParts();
  const start = Date.UTC(today[0], today[1] - 1, today[2]);
  const end = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Math.round((end - start) / 86400000);
};
const membershipFromRow = (row: ApiRow): string => {
  const period = String(row.periodo || '').toLowerCase();
  if (period !== 'mensual' && period !== 'promocion') return String(row.plan || row.periodo || '—');
  const remaining = dayDiff(row.fecha_vencimiento);
  if (remaining === null) return String(row.plan || '—');
  if (remaining <= 0) return currentLang.value === 'en' ? 'Expired' : 'Sin vigencia';
  const months = Math.max(1, Math.ceil(remaining / 30.44));
  return currentLang.value === 'en'
    ? `${months} ${months === 1 ? 'Month' : 'Months'}`
    : `${months} ${months === 1 ? 'Mes' : 'Meses'}`;
};
const getMembershipClass = (membership: string): string => {
  const months = Number.parseInt(membership, 10);
  const classes = ['membership-red', 'membership-blue', 'membership-green',
    'membership-purple', 'membership-orange', 'membership-pink'];
  const index = Math.max(0, Math.min(classes.length - 1, (Number.isFinite(months) ? months : 1) - 1));
  return classes[index] ?? 'membership-red';
};
const getStatusClass = (status: string): string => ({
  'Activo': 'status-green', 'Inactivo': 'status-red', 'Pendiente': 'status-orange',
  'En tolerancia': 'status-orange', 'Próximo a vencer': 'status-yellow'
} as Record<string, string>)[status] || 'status-default';

// ---------- MES SELECCIONADO ----------
const initial = dateParts();
const viewYear = ref(initial[0]);
const viewMonth = ref(initial[1]); // 1-12
const todayKey = computed(() => { const p = dateParts(); return p[0] * 100 + p[1]; });
const viewKey = computed(() => viewYear.value * 100 + viewMonth.value);
const isCurrentMonth = computed(() => viewKey.value >= todayKey.value);
const monthValue = computed(() => `${viewYear.value}-${pad(viewMonth.value)}`);
const maxMonthValue = computed(() => { const p = dateParts(); return `${p[0]}-${pad(p[1])}`; });
const daysInMonth = computed(() => new Date(Date.UTC(viewYear.value, viewMonth.value, 0)).getUTCDate());
const locale = computed(() => (currentLang.value === 'en' ? 'en-US' : 'es-MX'));
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const monthLabel = computed(() => capitalize(new Intl.DateTimeFormat(locale.value, {
  month: 'long', year: 'numeric', timeZone: 'UTC'
}).format(Date.UTC(viewYear.value, viewMonth.value - 1, 1))));
const rangeLabel = computed(() => {
  const short = new Intl.DateTimeFormat(locale.value, { month: 'short', timeZone: 'UTC' })
    .format(Date.UTC(viewYear.value, viewMonth.value - 1, 1)).replace('.', '').toUpperCase();
  return `1 ${short} — ${daysInMonth.value} ${short}`;
});
const initialsByLang = computed<string[]>(() => currentLang.value === 'en'
  ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['D', 'L', 'M', 'M', 'J', 'V', 'S']);
const weekInitials = computed(() => [...initialsByLang.value.slice(1), initialsByLang.value[0] as string]);
const firstOffset = computed(() => {
  const dow = new Date(Date.UTC(viewYear.value, viewMonth.value - 1, 1)).getUTCDay();
  return (dow + 6) % 7; // semana que empieza en lunes
});
const monthDays = computed<MonthDay[]>(() => {
  const p = dateParts();
  const isThisMonth = p[0] === viewYear.value && p[1] === viewMonth.value;
  const inFuture = viewKey.value > todayKey.value;
  return Array.from({ length: daysInMonth.value }, (_, i) => {
    const n = i + 1;
    const date = new Date(Date.UTC(viewYear.value, viewMonth.value - 1, n));
    const dow = date.getUTCDay();
    return {
      n,
      weekend: dow === 0 || dow === 6,
      isToday: isThisMonth && p[2] === n,
      future: inFuture || (isThisMonth && n > p[2]),
      initial: initialsByLang.value[dow] as string,
      weekday: weekdayByIndex[dow] as string,
      label: new Intl.DateTimeFormat(locale.value, {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC'
      }).format(date)
    };
  });
});
const elapsedDays = computed(() => {
  const p = dateParts();
  if (viewKey.value < todayKey.value) return daysInMonth.value;
  if (viewKey.value > todayKey.value) return 0;
  return Math.min(p[2], daysInMonth.value);
});
const stripStyle = computed(() => ({
  gridTemplateColumns: `repeat(${daysInMonth.value}, minmax(0, 1fr))`
}));
const percent = (user: User): number =>
  elapsedDays.value ? Math.min(100, Math.round((user.attendedSet.size / elapsedDays.value) * 100)) : 0;

const shiftMonth = (delta: number): void => {
  let y = viewYear.value;
  let m = viewMonth.value + delta;
  if (m < 1) { m = 12; y--; }
  if (m > 12) { m = 1; y++; }
  if (y * 100 + m > todayKey.value) return; // no se navega a meses futuros
  viewYear.value = y;
  viewMonth.value = m;
};
const goToday = (): void => {
  const p = dateParts();
  viewYear.value = p[0];
  viewMonth.value = p[1];
};
const pickMonth = (event: Event): void => {
  const match = /^(\d{4})-(\d{2})$/.exec((event.target as HTMLInputElement).value);
  if (!match) return;
  const y = Number(match[1]);
  const m = Number(match[2]);
  if (y * 100 + m > todayKey.value) { goToday(); return; }
  viewYear.value = y;
  viewMonth.value = m;
};

// Normaliza una VITE_API_URL con o sin /api final. Nunca inventa URLs.
const API = String(import.meta.env.VITE_API_URL || '')
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');
const getToken = (): string => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['token', 'auth_token', 'access_token', 'gym_token',
      'GYM_ACCOUNT_token', 'gymAccountToken']) {
      const value = store.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth', 'user', 'session', 'gymAccount', 'gym_account']) {
      try {
        const data = JSON.parse(store.getItem(key) || 'null');
        const value = data?.token || data?.access_token || data?.accessToken;
        if (value) return String(value).replace(/^Bearer\s+/i, '');
      } catch { /* La clave no guarda JSON válido. */ }
    }
  }
  return '';
};
const getStoredSede = (): number => {
  const keys = ['selected_sede_id', 'sede_id', 'ID_Sede', 'id_sede',
    'selectedSede', 'selectedSedeId', 'sedeSeleccionada', 'gym_sede_id'];
  for (const store of [sessionStorage, localStorage]) {
    for (const key of keys) {
      const raw = store.getItem(key);
      if (!raw) continue;
      let value: unknown = raw;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const data = parsed as Record<string, unknown>;
          value = data.ID_Sede ?? data.sede_id ?? data.id ?? data.value;
        } else value = parsed;
      } catch { /* Un número simple también es válido. */ }
      const id = Number(value);
      if (Number.isInteger(id) && id > 0) return id;
    }
  }
  return 0;
};
const sedeId = (): number => {
  if (sedeEvento.value > 0) return sedeEvento.value;
  const fromUrl = Number(route.query.sede_id);
  if (Number.isInteger(fromUrl) && fromUrl > 0) return fromUrl;
  return getStoredSede() || 1;
};
const apiRequest = async <T,>(path: string): Promise<T> => {
  const token = getToken();
  if (!token) throw new Error('No se encontró el token de sesión. Vuelve a iniciar sesión.');
  const response = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data
      ? String(data.message) : `Error HTTP ${response.status} consultando la sede ${sedeId()}.`;
    throw new Error(message);
  }
  return data as T;
};

const avatarGradients = [
  'linear-gradient(135deg,#7e22ce,#4c1d95)',
  'linear-gradient(135deg,#ea580c,#9a3412)',
  'linear-gradient(135deg,#db2777,#9d174d)',
  'linear-gradient(135deg,#dc2626,#7f1d1d)',
  'linear-gradient(135deg,#2563eb,#1e3a8a)',
  'linear-gradient(135deg,#059669,#064e3b)'
];
const avatarStyle = (id: number) => ({ backgroundImage: avatarGradients[Math.abs(id) % avatarGradients.length] });
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};
const PAGE_SIZE = 40;
const page = ref(1);
const filteredUsers = computed(() => {
  const term = searchQuery.value.toLocaleLowerCase().trim();
  return users.value.filter(user =>
    (!selectedDay.value || user.weekdays.includes(selectedDay.value)) &&
    (!term || [user.name, user.email, user.phone, user.membership,
      user.status, user.mensualidad, user.expirationDate, String(user.id)]
      .some(value => value.toLocaleLowerCase().includes(term)))
  );
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)));
const showPager = computed(() => filteredUsers.value.length > PAGE_SIZE);
const pagedUsers = computed(() => filteredUsers.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const goPage = (next: number): void => {
  page.value = Math.min(Math.max(1, next), totalPages.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const stats = computed(() => {
  const list = filteredUsers.value;
  return [
    { key: 'statTotal', value: list.length, tone: 'total' },
    { key: 'statActive', value: list.filter(u => u.status === 'Activo' || u.status === 'Próximo a vencer').length, tone: 'green' },
    { key: 'statPending', value: list.filter(u => u.status === 'Pendiente' || u.status === 'En tolerancia').length, tone: 'orange' },
    { key: 'statInactive', value: list.filter(u => u.status === 'Inactivo').length, tone: 'red' },
    { key: 'statVisits', value: list.reduce((sum, u) => sum + u.attendedSet.size, 0), tone: 'blue' }
  ];
});
watch([selectedDay, searchQuery], () => { page.value = 1; });
watch(totalPages, total => { if (page.value > total) page.value = total; });

let loadSequence = 0;
const loadUsers = async (): Promise<void> => {
  const seq = ++loadSequence;
  loading.value = true;
  errorCarga.value = '';
  avisoAsistencia.value = '';
  const branch = sedeId();
  const monthKey = monthValue.value; // YYYY-MM
  try {
    const income = await apiRequest<ApiIngresos>(`/api/gym/ingresos?sede_id=${branch}`);
    if (!Array.isArray(income.inscripciones)) {
      throw new Error('La API de ingresos no devolvió inscripciones[].');
    }
    let attendances: ApiAsistencia[] = [];
    try {
      // Endpoint mensual: mismo formato que asistencias-semana, filtrado por mes (YYYY-MM).
      const month = await apiRequest<ApiMes>(`/api/gym/asistencias-mes?sede_id=${branch}&mes=${monthKey}`);
      if (!Array.isArray(month.asistencias)) throw new Error('Formato de asistencia no válido.');
      attendances = month.asistencias;
    } catch (error) {
      if (seq === loadSequence) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        avisoAsistencia.value = `No se pudo consultar la asistencia del mes: ${message}. Se muestran los socios sin atribuirles entradas.`;
      }
    }
    if (seq !== loadSequence) return;
    const attendanceById = new Map<number, Set<number>>();
    for (const item of attendances) {
      const id = Number(item.ID_Inscripto);
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(item.fecha || ''));
      if (!id || !match || `${match[1]}-${match[2]}` !== monthKey) continue;
      if (!attendanceById.has(id)) attendanceById.set(id, new Set());
      attendanceById.get(id)?.add(Number(match[3]));
    }
    users.value = income.inscripciones
      .filter(row => Number(row.ID_Inscripto) > 0 && row.estatus_inscripcion !== 'Eliminado temporal')
      .map(row => {
        const id = Number(row.ID_Inscripto);
        const attendedSet = attendanceById.get(id) || new Set<number>();
        const weekdays = [...new Set([...attendedSet].map(n => {
          const dow = new Date(Date.UTC(viewYear.value, viewMonth.value - 1, n)).getUTCDay();
          return weekdayByIndex[dow] as string;
        }))];
        return {
          id, name: row.nombre || 'Sin nombre', email: row.correo || '',
          phone: row.celular || '', photo: row.foto_url || null,
          expirationDate: formatDate(row.fecha_vencimiento),
          status: row.estatus_inscripcion || 'Pendiente',
          mensualidad: String(row.periodo || '—'), membership: membershipFromRow(row),
          attendedSet, weekdays
        };
      });
  } catch (error) {
    if (seq !== loadSequence) return;
    users.value = [];
    errorCarga.value = error instanceof Error ? error.message : 'Error consultando socios.';
    toastRef.value?.notify?.(errorCarga.value, 'error');
  } finally {
    if (seq === loadSequence) loading.value = false;
  }
};
const handleLangChange = (event: Event): void => {
  const language = (event as CustomEvent<{ idioma?: string }>).detail?.idioma;
  if (language) currentLang.value = language;
};
const updateWidth = (): void => { isMobile.value = window.innerWidth <= 900; };
const branchChange = (event: Event): void => {
  const detail = (event as CustomEvent<Record<string, unknown>>).detail;
  const nested = detail?.sede && typeof detail.sede === 'object'
    ? detail.sede as Record<string, unknown> : {};
  const candidate = detail?.sede_id ?? detail?.ID_Sede ?? detail?.id ??
    detail?.sedeId ?? detail?.selectedSedeId ?? nested.ID_Sede ?? getStoredSede();
  const id = Number(candidate);
  sedeEvento.value = Number.isInteger(id) && id > 0 ? id : 0;
  void loadUsers();
};
const refreshVisible = (): void => {
  if (document.visibilityState === 'visible') void loadUsers();
};
const refreshFocus = (): void => { void loadUsers(); };

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('resize', updateWidth);
  window.addEventListener('factorfit:branch-changed', branchChange);
  window.addEventListener('focus', refreshFocus);
  document.addEventListener('visibilitychange', refreshVisible);
  void loadUsers();
});
onUnmounted(() => {
  loadSequence++;
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('resize', updateWidth);
  window.removeEventListener('factorfit:branch-changed', branchChange);
  window.removeEventListener('focus', refreshFocus);
  document.removeEventListener('visibilitychange', refreshVisible);
});
watch(() => route.query.sede_id, () => {
  sedeEvento.value = 0;
  void loadUsers();
});
// Al cambiar de mes se vuelve a consultar y se regresa a la primera página.
watch(monthValue, () => { page.value = 1; void loadUsers(); });
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600&display=swap');
.main-content, .modal-wrapper { --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent); --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent); --accent: var(--color-highlight, #3b82f6); --btn: var(--color-botones, #2563eb); --btn-text: var(--color-texto-botones, #ffffff); --r: var(--app-border-radius, 16px); --r-sm: 10px; --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 72%, transparent); }
.main-content *, .main-content *::before, .main-content *::after { box-sizing: border-box; }
.main-content { width: 100%; max-width: 1500px; margin: 0 auto; padding: 36px 36px 56px; color: var(--color-texto-general, #e5e7eb); font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
.header-section { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.title-wrapper { min-width: 250px; display: flex; flex-direction: column; gap: 7px; }
.main-title { margin: 0; color: var(--color-titulos, #ffffff); font-family: 'Anton', sans-serif; font-size: clamp(1.9rem, 3vw, 2.6rem); font-weight: 400; line-height: 1.05; letter-spacing: 0.01em; text-transform: uppercase; }
.highlight { color: var(--accent); }
.title-underline { width: 60px; height: 3px; display: block; border-radius: 999px; background: linear-gradient(90deg, var(--accent), transparent); }
.main-subtitle { max-width: 500px; margin: 0; color: var(--muted); font-size: 0.82rem; font-weight: 500; line-height: 1.5; }
.actions-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.select-wrapper, .search-wrapper { position: relative; display: flex; align-items: center; }
.select-icon, .search-icon { position: absolute; z-index: 2; left: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }
.select-arrow { position: absolute; z-index: 2; right: 14px; color: var(--muted); pointer-events: none; opacity: 0.7; }
.select-wrapper { min-width: 190px; z-index: 5; }
.status-select { width: 100%; min-width: 190px; height: 44px; padding: 0 40px; border: 1px solid var(--line); border-radius: var(--r-sm); background-color: var(--bg-cards, #14161b); color: var(--color-texto-general, #e5e7eb); font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; outline: none; appearance: none; -webkit-appearance: none; color-scheme: dark; transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.status-select:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 26%, transparent); }
.status-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.status-select option { background-color: #111214; color: #dbeafe; font-family: 'Inter', sans-serif; }
.search-wrapper { min-width: 240px; }
.search-input { width: 240px; height: 44px; padding: 0 38px 0 40px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--bg-cards, #14161b); color: var(--color-texto-general, #e5e7eb); font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500; outline: none; transition: width 0.2s ease, border-color 0.18s ease, box-shadow 0.18s ease; }
.search-input::placeholder { color: var(--muted); opacity: 0.7; }
.search-input:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 26%, transparent); }
.search-input:focus { width: 270px; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.search-clear { position: absolute; right: 10px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 50%; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 10%, transparent); color: var(--muted); cursor: pointer; transition: background 0.15s ease; }
.search-clear:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 20%, transparent); }
.btn-bulk { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 5px 18px 5px 7px; cursor: pointer; border: 1px solid var(--btn); border-radius: var(--r-sm); background: linear-gradient(135deg, var(--btn), color-mix(in srgb, var(--btn) 78%, black)); color: var(--btn-text); font-family: 'Inter', sans-serif; white-space: nowrap; box-shadow: 0 6px 16px color-mix(in srgb, var(--btn) 26%, transparent); transition: box-shadow 0.18s ease, transform 0.18s ease, filter 0.18s ease; }
.btn-bulk-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 8px; background: rgba(255, 255, 255, 0.16); color: var(--btn-text); }
.btn-bulk-icon svg { width: 17px; height: 17px; stroke: currentColor; }
.btn-text-wrapper { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; line-height: 1.05; }
.btn-label { color: rgba(255, 255, 255, 0.72); font-family: 'Oswald', sans-serif; font-size: 0.58rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; }
.highlight-text-custom { color: var(--btn-text); font-size: 0.78rem; font-weight: 700; }
.btn-bulk:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 10px 22px color-mix(in srgb, var(--btn) 34%, transparent); }
.btn-bulk:active { transform: translateY(0); }

/* ---- Navegador de mes ---- */
.month-bar { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-bottom: 18px; padding: 14px 18px; border: 1px solid var(--line); border-radius: var(--r); background: var(--bg-cards, #121419); }
.month-nav { display: flex; align-items: center; gap: 8px; }
.nav-btn { height: 40px; min-width: 40px; display: grid; place-items: center; padding: 0 14px; border: 1px solid var(--line); border-radius: var(--r-sm); background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); color: var(--color-texto-general, #e5e7eb); font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease; }
.nav-btn:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); transform: translateY(-1px); }
.nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.nav-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.month-label { display: flex; flex-direction: column; gap: 2px; margin-right: auto; }
.month-name { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.45rem; font-weight: 600; line-height: 1.1; }
.month-range { color: var(--muted); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; }
.month-picker { position: relative; display: flex; align-items: center; color: var(--muted); }
.month-picker svg { position: absolute; left: 12px; pointer-events: none; }
.month-picker input { height: 40px; padding: 0 12px 0 36px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--bg-cards, #14161b); color: var(--color-texto-general, #e5e7eb); font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 500; color-scheme: dark; outline: none; cursor: pointer; transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.month-picker input:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 26%, transparent); }
.month-picker input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }

.stats-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.stat-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 3px; padding: 15px 18px; border: 1px solid var(--line); border-radius: var(--r); background: var(--bg-cards, #121419); }
.stat-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone, var(--accent)); }
.stat-total { --tone: var(--accent); }
.stat-green { --tone: #34d399; }
.stat-orange { --tone: #fbbf24; }
.stat-red { --tone: #f87171; }
.stat-blue { --tone: #60a5fa; }
.stat-value { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.6rem; font-weight: 600; line-height: 1.1; }
.stat-label { color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
.desktop-only { display: block; }
.mobile-only { display: none; }
.table-container { position: relative; width: 100%; overflow: hidden; border: 1px solid var(--line); border-radius: var(--r); background: var(--bg-cards, #121419); box-shadow: 0 18px 45px rgba(0, 0, 0, 0.2); }
.table-container::before { content: ''; position: absolute; z-index: 3; top: 0; right: 0; left: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.72; }
.table-scroll { width: 100%; overflow-x: auto; }
.user-table { width: 100%; min-width: 1040px; border-collapse: collapse; color: var(--color-texto-general, #e5e7eb); text-align: left; }
.user-table thead { background: color-mix(in srgb, var(--bg-cards, #121419) 94%, var(--color-texto-general, #ffffff)); }
.user-table th { padding: 12px 14px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap; }
.user-table td { padding: 12px 14px; border-top: 1px solid var(--line-soft); font-size: 0.82rem; vertical-align: middle; }
.user-table tbody tr { transition: background 0.17s ease; }
.user-table tbody tr:first-child td { border-top: none; }
.user-table tbody tr:hover { background: color-mix(in srgb, var(--accent) 6%, transparent); }
.col-photo { width: 70px; }
.col-name { width: 230px; }
.col-total { width: 130px; }
.col-status { width: 140px; }
.col-days, .cell-days { min-width: 560px; }
.name-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-width: 0; }
.small { font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; max-width: 210px; white-space: nowrap; }

/* ---- Tira de días del mes ---- */
.days-strip { display: grid; gap: 3px; width: 100%; }
.head-day { display: flex; flex-direction: column; align-items: center; gap: 1px; line-height: 1.1; text-transform: none; letter-spacing: 0; }
.head-day b { color: var(--color-titulos, #ffffff); font-size: 0.7rem; font-weight: 700; }
.head-day i { color: var(--muted); font-size: 0.58rem; font-style: normal; font-weight: 600; }
.head-day.weekend b, .head-day.weekend i { opacity: 0.55; }
.head-day.today b { color: var(--accent); }
.head-day.today i { color: var(--accent); }
.day-dot { display: block; width: 100%; max-width: 22px; aspect-ratio: 1; margin: 0 auto; border: 1px solid var(--line); border-radius: 6px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 3%, transparent); transition: transform 0.15s ease; }
.day-dot.weekend { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 6%, transparent); }
.day-dot.future { opacity: 0.35; border-style: dashed; }
.day-dot.on { border-color: rgba(52, 211, 153, 0.55); background: linear-gradient(135deg, #34d399, #059669); box-shadow: 0 0 10px rgba(52, 211, 153, 0.28); }
.day-dot.today { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 28%, transparent); }
.day-dot.on.today { border-color: var(--accent); }
.cell-days .day-dot:hover { transform: scale(1.18); }

.total-cell { display: flex; flex-direction: column; gap: 6px; }
.total-num { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.15rem; font-weight: 600; line-height: 1; }
.total-num small { color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 600; }
.total-bar { display: block; width: 100%; height: 5px; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 8%, transparent); }
.total-fill { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--accent), #34d399); transition: width 0.3s ease; }

.table-footer { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 11px 18px; border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 0.72rem; font-weight: 500; }
.legend { display: inline-flex; align-items: center; gap: 7px; }
.legend .day-dot { width: 14px; max-width: 14px; margin: 0; border-radius: 4px; }
.footer-count { margin-left: auto; }
.avatar-small { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 12px; color: #ffffff; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.025em; box-shadow: 0 5px 14px rgba(0, 0, 0, 0.22); }
.avatar-small img { width: 100%; height: 100%; object-fit: cover; }
.text-bold { color: var(--color-titulos, #f8fafc); font-weight: 600; }
.text-muted { color: var(--muted); }
.day-chip { display: inline-flex; align-items: center; min-height: 26px; padding: 3px 10px; border: 1px solid var(--line); border-radius: 8px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); color: var(--color-texto-general, #e5e7eb); font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
.status-badge { width: fit-content; min-height: 27px; display: inline-flex; align-items: center; gap: 7px; padding: 4px 10px; border: 1px solid transparent; border-radius: 999px; font-size: 0.7rem; font-weight: 650; white-space: nowrap; }
.status-badge::before { content: ''; width: 6px; height: 6px; display: inline-block; flex-shrink: 0; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 14%, transparent); }
.status-green { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.status-red { color: #f87171; border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.08); }
.status-orange { color: #fbbf24; border-color: rgba(251, 191, 36, 0.25); background: rgba(251, 191, 36, 0.08); }
.status-yellow { color: #facc15; border-color: rgba(250, 204, 21, 0.25); background: rgba(250, 204, 21, 0.08); }
.status-default { color: #cbd5e1; border-color: rgba(203, 213, 225, 0.18); background: rgba(203, 213, 225, 0.06); }
.status-badge2 { width: fit-content; min-height: 24px; display: inline-flex; align-items: center; justify-content: center; padding: 3px 10px; border: 1px solid transparent; border-radius: 999px; font-size: 0.68rem; font-weight: 650; white-space: nowrap; }
.membership-red { color: #f87171; border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.08); }
.membership-blue { color: #60a5fa; border-color: rgba(96, 165, 250, 0.25); background: rgba(96, 165, 250, 0.08); }
.membership-green { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.membership-purple { color: #c084fc; border-color: rgba(192, 132, 252, 0.25); background: rgba(192, 132, 252, 0.08); }
.membership-orange { color: #fb923c; border-color: rgba(251, 146, 60, 0.25); background: rgba(251, 146, 60, 0.08); }
.membership-pink { color: #f472b6; border-color: rgba(244, 114, 182, 0.25); background: rgba(244, 114, 182, 0.08); }
.membership-default { color: #cbd5e1; border-color: rgba(203, 213, 225, 0.18); background: rgba(203, 213, 225, 0.06); }
.empty-state-cell { padding: 0 !important; border-top: none !important; }
.empty-state, .empty-state-mobile { min-height: 270px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 50px 20px; color: var(--muted); font-size: 0.82rem; font-weight: 500; text-align: center; }
.empty-state svg, .empty-state-mobile svg { opacity: 0.42; }
.modal-wrapper { position: fixed; z-index: 9999; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, 0.78); backdrop-filter: blur(4px); }
:deep(.notification-container), :deep(.toast-container) { width: calc(100% - 32px) !important; max-width: 480px !important; box-sizing: border-box !important; left: 50% !important; right: auto !important; margin: 0 auto !important; transform: translateX(-50%) !important; }
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.pager-btn { width: 40px; height: 40px; display: grid; place-items: center; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-small, var(--r-sm, 10px)); background: var(--card-bg, var(--bg-cards, #121416)); color: var(--color-texto-general, #e5e7eb); cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease; }
.pager-btn:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--color-titulos, #ffffff); transform: translateY(-1px); }
.pager-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pager-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.pager-info { min-width: 64px; color: var(--muted); font-size: 0.8rem; font-weight: 600; text-align: center; }
.pager-info b { color: var(--color-titulos, #ffffff); font-weight: 700; }
.pop-enter-active, .pop-leave-active { transition: opacity 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }
.btn-bulk:focus-visible, .search-clear:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.data-message { padding: 10px 14px; margin: 8px 0 14px; border: 1px solid rgba(96,165,250,.25); border-radius: 10px; color: #93c5fd; background: rgba(96,165,250,.06); font-size: .82rem; }
.data-message.error { color: #fca5a5; border-color: rgba(248,113,113,.35); }
.data-message.warning { color: #fbbf24; border-color: rgba(251,191,36,.3); }
.data-message button { margin-left: 8px; cursor: pointer; color: inherit; border: 0; background: transparent; text-decoration: underline; }

@media (max-width: 1150px) {
  .main-content { padding: 30px 24px 48px; }
  .header-section { align-items: flex-start; flex-direction: column; gap: 17px; }
  .actions-bar { width: 100%; justify-content: flex-start; }
  .search-wrapper { min-width: 220px; flex: 1; }
  .search-input, .search-input:focus { width: 100%; }
  .stats-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .main-content { width: 100%; max-width: 100%; padding: 20px 14px 34px; overflow-x: hidden; }
  .header-section { width: 100%; align-items: stretch; margin-bottom: 16px; }
  .title-wrapper { width: 100%; min-width: 0; gap: 6px; }
  .main-title { font-size: 1.85rem; }
  .main-subtitle { font-size: 0.76rem; }
  .actions-bar { width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 9px; }
  .search-wrapper { width: 100%; min-width: 0; grid-column: 1 / -1; grid-row: 1; }
  .search-input, .search-input:focus { width: 100%; max-width: 100%; }
  .select-wrapper { width: 100%; min-width: 0; max-width: 100%; grid-column: 1 / 2; position: relative; z-index: 20; }
  .status-select { width: 100%; min-width: 0; max-width: 100%; text-overflow: ellipsis; }
  .btn-bulk { width: 100%; min-width: 0; grid-column: 2 / 3; justify-content: center; overflow: hidden; }
  .month-bar { gap: 12px; padding: 12px 14px; }
  .month-label { order: -1; width: 100%; margin-right: 0; }
  .month-picker { margin-left: auto; }
  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 14px; }
  .stat-card { padding: 12px 14px; }
  .stat-value { font-size: 1.35rem; }
  .user-card { position: relative; width: 100%; overflow: hidden; margin-bottom: 11px; padding: 17px; border: 1px solid var(--line); border-radius: var(--r); background: var(--bg-cards, #14161b); box-shadow: 0 9px 28px rgba(0, 0, 0, 0.17); }
  .user-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--accent); opacity: 0.7; }
  .user-card.card-status-green::before { background: #34d399; }
  .user-card.card-status-red::before { background: #f87171; }
  .user-card.card-status-orange::before { background: #fbbf24; }
  .user-card.card-status-yellow::before { background: #facc15; }
  .card-top-section { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
  .user-card .avatar-small { width: 44px; height: 44px; font-size: 0.8rem; }
  .card-user-titles { min-width: 0; display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 7px; }
  .name-text { width: 100%; overflow: hidden; color: var(--color-titulos, #ffffff); font-size: 0.9rem; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
  .badges-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .mini-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; margin-bottom: 13px; padding: 10px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent); }
  .mini-head { color: var(--muted); font-size: 0.6rem; font-weight: 700; text-align: center; }
  .mini-day { display: grid; place-items: center; aspect-ratio: 1; border: 1px solid var(--line-soft); border-radius: 7px; color: var(--muted); font-size: 0.68rem; font-weight: 600; }
  .mini-day.future { opacity: 0.35; border-style: dashed; }
  .mini-day.on { border-color: rgba(52, 211, 153, 0.55); background: linear-gradient(135deg, #34d399, #059669); color: #04130d; font-weight: 700; }
  .mini-day.today { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 28%, transparent); }
  .card-meta { display: grid; gap: 7px; padding: 11px 12px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent); color: var(--muted); font-size: 0.75rem; }
  .meta-row { min-width: 0; display: flex; align-items: center; gap: 7px; }
  .meta-row svg { flex-shrink: 0; opacity: 0.68; }
  .email-text { overflow: hidden; color: #93c5fd; text-overflow: ellipsis; white-space: nowrap; }
  .expiration-warning { color: #fb923c; font-weight: 500; }
  .vence-label { color: #fb923c; font-weight: 600; }
  .phone-text { color: var(--muted); }
  .empty-state-mobile { min-height: 250px; margin-top: 8px; border: 1px dashed var(--line); border-radius: var(--r); background: var(--bg-cards, #14161b); }
}
@media (max-width: 560px) {
  .main-content { padding: 17px 11px 30px; }
  .main-title { font-size: 1.7rem; }
  .actions-bar { grid-template-columns: minmax(0, 1fr); }
  .search-wrapper { grid-column: 1; grid-row: auto; }
  .select-wrapper { grid-column: 1; }
  .btn-bulk { grid-column: 1; }
  .status-select, .search-input, .btn-bulk { min-height: 44px; }
  .user-card { padding: 15px; }
  .month-name { font-size: 1.25rem; }
}
@media (max-width: 380px) {
  .main-content { padding-left: 9px; padding-right: 9px; }
  .status-select, .search-input { font-size: 0.78rem; }
  .btn-label { font-size: 0.55rem; }
  .highlight-text-custom { font-size: 0.73rem; }
}
@media (prefers-reduced-motion: reduce) {
  .status-select, .search-input, .btn-bulk, .nav-btn, .day-dot, .total-fill, .pop-enter-active, .pop-leave-active { transition: none !important; }
}
</style>