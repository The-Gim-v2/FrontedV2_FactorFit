<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('incomesTitle') }}</h1>
          <span class="title-underline"></span>
          <p class="main-subtitle">{{ t('pageSubtitle') }}</p>
        </div>
        <div class="actions-bar" id="tutorial-step-0">
          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <select class="status-select" v-model="selectedMembership">
              <option value="">{{ t('membershipAll') }}</option>
              <option value="Mensual">{{ t('monthly') }}</option>
              <option value="Quincenal">{{ t('fortnightly') }}</option>
                <option value="Semanal">{{ t('weekly') }}</option>
                <option value="Diario">{{ t('daily') }}</option>
                <option value="Promocion">{{ t('promotion') }}</option>
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
          <button class="btn-bulk" @click="activeModal = 'ganancias'">
            <span class="btn-bulk-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </span>
            <div class="btn-text-wrapper">
              <span class="btn-label">{{ t('analysisLabel') }}</span>
              <span class="highlight-text-custom">{{ t('viewAnalysis') }}</span>
            </div>
          </button>
        </div>
      </header>
      <div v-if="loading" class="earnings-message" role="status">{{ t('loading') }}</div>
        <div v-if="errorCarga" class="earnings-message error" role="alert">{{ errorCarga }}
          <button type="button" @click="obtenerIngresos">{{ t('retry') }}</button>
        </div>
        <!-- RESUMEN -->
      <section class="stats-row">
        <div class="stat-card" v-for="s in stats" :key="s.key" :class="'stat-' + s.tone">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ t(s.key) }}</span>
        </div>
      </section>
      <!-- ESCRITORIO -->
      <div class="table-container desktop-only" :id="!isMobile ? 'tutorial-step-1' : undefined">
        <table class="user-table">
          <thead>
            <tr>
              <th>{{ t('colPhoto') }}</th>
              <th>{{ t('colName') }}</th>
              <th>{{ t('colEmail') }}</th>
              <th>{{ t('colType') }}</th>
                <th>{{ t('colMethod') }}</th>
                <th>{{ t('colEnrollmentDate') }}</th>
                <th>{{ t('colPaymentDate') }}</th>
              <th>{{ t('colExpiration') }}</th>
              <th>{{ t('colMembership') }}</th>
              <th class="th-right">{{ t('colAmount') }}</th>
                <th class="th-right">{{ t('colDue') }}</th>
                <th class="th-right">{{ t('colCredit') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in pagedUsers" :key="user.id">
              <td><div class="avatar-small" :style="avatarStyle(user.id)"><img v-if="user.photo" :src="user.photo" :alt="user.name" @error="user.photo = null" />{{ user.photo ? '' : getInitials(user.name) }}</div></td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email }}</td>
              <td><span class="type-chip">{{ typeLabel(user.mensualidad) }}</span></td>
                <td class="text-muted">{{ user.metodoPago }}</td>
                <td class="text-muted">{{ user.enrollmentDate }}</td>
                <td class="text-muted">{{ user.paymentDate }}</td>
              <td class="text-muted">{{ user.expirationDate }}</td>
              <td><span :class="['status-badge2', getMembershipClass(user.mensualidad)]">{{ user.membership }}</span></td>
              <td class="td-right"><span class="status-badge income">{{ user.amount }}</span></td>
                <td class="td-right text-muted">{{ user.saldoAPagar }}</td>
                <td class="td-right text-muted">{{ user.saldoAFavor }}</td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="12" class="empty-state-cell">
                <div class="empty-state">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>{{ t('emptyState') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">{{ filteredUsers.length }} {{ t('resultsLabel') }}</div>
      </div>
      <!-- MÓVIL -->
      <div class="mobile-only">
        <div
          v-for="(user, index) in pagedUsers"
          :key="user.id"
          class="user-card"
          :id="isMobile && index === 0 ? 'tutorial-step-1' : undefined"
        >
          <div class="card-top-section">
            <div class="avatar-small" :style="avatarStyle(user.id)"><img v-if="user.photo" :src="user.photo" :alt="user.name" @error="user.photo = null" />{{ user.photo ? '' : getInitials(user.name) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <div class="badges-row">
                <span :class="['status-badge2', getMembershipClass(user.mensualidad)]">{{ user.membership }}</span>
                <span class="type-chip">{{ typeLabel(user.mensualidad) }}</span>
              </div>
            </div>
            <span class="status-badge income">{{ user.amount }}</span>
          </div>
          <div class="card-meta">
              <span class="meta-row">{{ t('colMethod') }}: {{ user.metodoPago }}</span>
              <span class="meta-row">{{ t('enrolledLabel') }}: {{ user.enrollmentDate }}</span>
              <span class="meta-row">{{ t('paidLabel') }}: {{ user.paymentDate }}</span>
              <span class="meta-row">{{ t('dueLabel') }}: {{ user.saldoAPagar }}</span>
              <span class="meta-row">{{ t('creditLabel') }}: {{ user.saldoAFavor }}</span>
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
      <!-- Modal Eliminar -->
      <ModalComponent :isOpen="showDelete" @close="showDelete = false">
        <div class="modal-body-custom">
          <div class="modal-icon-container danger-bg">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <h2>{{ t('deleteTitle') }}</h2>
          <p>{{ t('deleteMsgPre') }} <span class="highlight-name">{{ selectedUser?.name }}</span> {{ t('deleteMsgPost') }}</p>
          <div class="modal-buttons">
            <button class="btn-modal secondary" @click="showDelete = false">{{ t('cancelBtn') }}</button>
            <button class="btn-modal danger">{{ t('confirmBtn') }}</button>
          </div>
        </div>
      </ModalComponent>
    </main>
    <transition name="pop">
      <div v-if="activeModal === 'ganancias'" class="modal-wrapper" @click.self="activeModal = null">
        <Ganancias :users="filteredUsers" @close="activeModal = null" />
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import ModalComponent from '../../Modals/ModalComponent.vue';
import Ganancias from '../Componets/Earnings.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
type PagoIngreso = {
  id: number;
  pagoId: number;
  clienteId: number;
  inscripcionId: number;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  expirationDate: string;
  enrollmentDate: string;
  paymentDate: string;
  membership: string;
  amount: string;
  monto: number;
  mensualidad: string;
  metodoPago: string;
  saldoAPagar: string;
  saldoAFavor: string;
  saldoPendienteNumero: number;
  saldoFavorNumero: number;
  folio: string;
};
type PagoAPI = {
  ID_Pago: number | string;
  ID_Inscripto: number | string;
  ID_Cliente: number | string;
  nombre: string;
  correo: string | null;
  celular: string | null;
  foto_url: string | null;
  fecha_pago: string | null;
  fecha_inscripcion: string | null;
  fecha_vencimiento: string | null;
  plan: string | null;
  periodo: string | null;
  monto: number | string;
  metodo_pago: string | null;
  folio: string | null;
  saldo_a_pagar: number | string;
  saldo_a_favor: number | string;
};
const route = useRoute();
const activeModal = ref<string | null>(null);
const showDelete = ref(false);
const selectedUser = ref<PagoIngreso | null>(null);
const selectedMembership = ref('');
const searchQuery = ref('');
const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const loading = ref(false);
const errorCarga = ref('');
const users = ref<PagoIngreso[]>([]);
let requestId = 0;
const langData = {
  es: {
    incomesTitle:'Ingresos', pageSubtitle:'Consulta los clientes registrados, sus pagos reales, fechas y saldos.',
    membershipAll:'Todos los tipos', monthly:'Mensual', fortnightly:'Quincenal', weekly:'Semanal',
    daily:'Diario', promotion:'Promoción', analysisLabel:'Análisis', viewAnalysis:'Ver desglose',
    searchPlaceholder:'Buscar cliente, folio o pago...', colPhoto:'Foto', colName:'Nombre',
    colEmail:'Correo', colType:'Tipo', colExpiration:'Próximo corte', colMembership:'Membresía',
    colAmount:'Total pagado', colPaymentDate:'Último pago', colEnrollmentDate:'Inscripción',
    colDue:'Saldo a pagar', colCredit:'Saldo a favor', colMethod:'Método',
    expiresLabel:'Vence', paidLabel:'Último pago', enrolledLabel:'Inscripción', dueLabel:'Debe', creditLabel:'A favor',
    emptyState:'No hay clientes registrados con estos filtros.', resultsLabel:'inscripciones',
    pagination:'Paginación', prevPage:'Página anterior', nextPage:'Página siguiente',
    statTotal:'Ingresos', statMembers:'Miembros registrados', statAverage:'Promedio por miembro',
    statHighest:'Ingreso mayor por miembro', deleteTitle:'¿Eliminar usuario?',
    deleteMsgPre:'¿Deseas eliminar a', deleteMsgPost:'temporalmente?', cancelBtn:'Cancelar', confirmBtn:'Confirmar',
    loading:'Cargando clientes y pagos registrados...', retry:'Reintentar'
  },
  en: {
    incomesTitle:'Income', pageSubtitle:'View registered members, their payments, dates and balances.',
    membershipAll:'All types', monthly:'Monthly', fortnightly:'Fortnightly', weekly:'Weekly',
    daily:'Daily', promotion:'Promotion', analysisLabel:'Analysis', viewAnalysis:'View breakdown',
    searchPlaceholder:'Search client, reference or payment...', colPhoto:'Photo', colName:'Name',
    colEmail:'Email', colType:'Type', colExpiration:'Next renewal', colMembership:'Membership',
    colAmount:'Total paid', colPaymentDate:'Latest payment', colEnrollmentDate:'Enrollment',
    colDue:'Balance due', colCredit:'Credit balance', colMethod:'Method',
    expiresLabel:'Expires', paidLabel:'Latest paid', enrolledLabel:'Enrollment', dueLabel:'Due', creditLabel:'Credit',
    emptyState:'No registered members match the filters.', resultsLabel:'enrollments',
    pagination:'Pagination', prevPage:'Previous', nextPage:'Next',
    statTotal:'Income', statMembers:'Registered members', statAverage:'Average per member',
    statHighest:'Highest member income', deleteTitle:'Delete user?',
    deleteMsgPre:'Do you want to temporarily delete', deleteMsgPost:'?', cancelBtn:'Cancel', confirmBtn:'Confirm',
    loading:'Loading registered members and payments...', retry:'Retry'
  }
} as const;
const t = (key: keyof typeof langData.es): string =>
  (currentLang.value === 'en' ? langData.en[key] : langData.es[key]) || langData.es[key] || key;
const typeLabel = (periodo: string): string => ({
  Mensual:t('monthly'), Quincenal:t('fortnightly'), Semanal:t('weekly'),
  Diario:t('daily'), Promocion:t('promotion')
} as Record<string, string>)[periodo] || periodo || '—';
const formatCurrency = (value: number): string => new Intl.NumberFormat(
  currentLang.value === 'en' ? 'en-US' : 'es-MX', { style:'currency', currency:'MXN' }
).format(Number(value) || 0);
const formatDate = (value: string | null | undefined): string => {
  const raw = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '—';
  const [y, m, d] = raw.split('-');
  return `${d}/${m}/${y}`;
};
const obtenerToken = (): string => {
  for (const store of [sessionStorage, localStorage]) {
    for (const k of ['auth_token','token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
      const v = store.getItem(k);
      if (v) return v.replace(/^Bearer\s+/i, '');
    }
    for (const k of ['auth','user','session','gymAccount','gym_account']) {
      try {
        const p = JSON.parse(store.getItem(k) || 'null');
        const v = p?.token || p?.access_token || p?.accessToken;
        if (v) return String(v).replace(/^Bearer\s+/i, '');
      } catch { /* Sin JSON */ }
    }
  }
  return '';
};
const sedeId = (): number => {
  const q = Number(route.query.sede_id);
  if (Number.isInteger(q) && q > 0) return q;
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['selected_sede_id','sede_id','ID_Sede','selectedSedeId','gym_sede_id']) {
      const raw = store.getItem(key);
      if (!raw) continue;
      try {
        const o = JSON.parse(raw);
        const v = typeof o === 'object' && o ? (o.ID_Sede ?? o.sede_id ?? o.id ?? o.value) : o;
        const n = Number(v);
        if (Number.isInteger(n) && n > 0) return n;
      } catch { const n = Number(raw); if (Number.isInteger(n) && n > 0) return n; }
    }
  }
  return 0;
};
const normalizarPago = (p: PagoAPI): PagoIngreso => ({
  id: Number(p.ID_Inscripto), pagoId: Number(p.ID_Pago),
  clienteId: Number(p.ID_Cliente), inscripcionId: Number(p.ID_Inscripto),
  name: String(p.nombre || '—'), email: p.correo || '—', phone: p.celular || '—',
  photo: p.foto_url || null,
  enrollmentDate: formatDate(p.fecha_inscripcion),
  paymentDate: formatDate(p.fecha_pago),
  expirationDate: formatDate(p.fecha_vencimiento),
  membership: p.plan || '—', mensualidad: p.periodo || '—',
  metodoPago: p.metodo_pago || '—', folio: p.folio || '—',
  monto: Number(p.monto || 0), amount: formatCurrency(Number(p.monto || 0)),
  saldoAPagar: formatCurrency(Number(p.saldo_a_pagar || 0)),
  saldoAFavor: formatCurrency(Number(p.saldo_a_favor || 0)),
  saldoPendienteNumero: Number(p.saldo_a_pagar || 0),
  saldoFavorNumero: Number(p.saldo_a_favor || 0)
});
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const obtenerIngresos = async () => {
  const seq = ++requestId;
  const sede = sedeId();
  const token = obtenerToken();
  if (!sede || !token) {
    users.value = [];
    errorCarga.value = !sede ? 'Selecciona una sucursal.' : 'Inicia sesión nuevamente.';
    loading.value = false;
    return;
  }
  loading.value = true;
  errorCarga.value = '';
  try {
    const respuesta = await fetch(`${API}/api/gym/ingresos?sede_id=${encodeURIComponent(sede)}`, {
      headers: { Accept:'application/json', Authorization:`Bearer ${token}` }
    });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(json.message || `Error HTTP ${respuesta.status}`);
    const pagos: unknown = Array.isArray(json) ? json : (json.inscripciones ?? json.pagos ?? json.data);
    if (!Array.isArray(pagos)) throw new Error('El servidor no devolvió una lista de clientes.');
    if (seq !== requestId) return;
    users.value = (pagos as PagoAPI[]).map(normalizarPago);
  } catch (e) {
    if (seq !== requestId) return;
    errorCarga.value = e instanceof Error ? e.message : 'No se pudieron cargar los ingresos.';
    toastRef.value?.notify?.(errorCarga.value, 'error');
    users.value = [];
  } finally {
    if (seq === requestId) loading.value = false;
  }
};
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth <= 900);
const updateWidth = () => { isMobile.value = window.innerWidth <= 900; };
const handleLangChange = (e: Event) => {
  const idioma = (e as CustomEvent<{ idioma?: string }>).detail?.idioma;
  if (idioma) {
    currentLang.value = idioma;
    users.value = users.value.map(u => ({ ...u, amount:formatCurrency(u.monto), saldoAPagar:formatCurrency(u.saldoPendienteNumero), saldoAFavor:formatCurrency(u.saldoFavorNumero) }));
  }
};
const cambioSede = () => { void obtenerIngresos(); };
onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange as EventListener);
  window.addEventListener('factorfit:branch-changed', cambioSede);
  window.addEventListener('resize', updateWidth);
  void obtenerIngresos();
});
onUnmounted(() => {
  requestId++;
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  window.removeEventListener('factorfit:branch-changed', cambioSede);
  window.removeEventListener('resize', updateWidth);
});
watch(() => route.query.sede_id, () => { void obtenerIngresos(); });
const filteredUsers = computed(() => {
  const term = searchQuery.value.trim().toLocaleLowerCase();
  return users.value.filter(p =>
    (!selectedMembership.value || p.mensualidad === selectedMembership.value) &&
    (!term || [p.name,p.email,p.phone,p.membership,p.mensualidad,p.metodoPago,
      p.folio,p.paymentDate,p.enrollmentDate,p.expirationDate,p.saldoAPagar,p.saldoAFavor,
      String(p.clienteId),String(p.pagoId)].some(v => String(v).toLocaleLowerCase().includes(term)))
  );
});
const PAGE_SIZE = 40;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)));
const showPager = computed(() => filteredUsers.value.length > PAGE_SIZE);
const pagedUsers = computed(() => filteredUsers.value.slice((page.value - 1)*PAGE_SIZE, page.value*PAGE_SIZE));
const goPage = (n: number) => { page.value = Math.min(Math.max(1,n),totalPages.value); window.scrollTo({top:0,behavior:'smooth'}); };
watch([searchQuery, selectedMembership], () => { page.value = 1; });
watch(totalPages, n => { if (page.value > n) page.value = n; });
const stats = computed(() => {
  const list = filteredUsers.value;
  const total = list.reduce((sum,p) => sum + p.monto, 0);
  const amounts = list.map(p => p.monto);
  return [
    { key:'statTotal' as const, value:formatCurrency(total), tone:'green' },
    { key:'statMembers' as const, value:String(new Set(list.map(p => p.clienteId)).size), tone:'total' },
    { key:'statAverage' as const, value:formatCurrency(list.length ? total/list.length : 0), tone:'blue' },
    { key:'statHighest' as const, value:formatCurrency(amounts.length ? Math.max(...amounts) : 0), tone:'orange' }
  ];
});
const avatarGradients = [
  'linear-gradient(135deg, #7e22ce, #4c1d95)', 'linear-gradient(135deg, #ea580c, #9a3412)',
  'linear-gradient(135deg, #db2777, #9d174d)', 'linear-gradient(135deg, #dc2626, #7f1d1d)',
  'linear-gradient(135deg, #2563eb, #1e3a8a)', 'linear-gradient(135deg, #059669, #064e3b)'
];
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};
const avatarStyle = (id: number) => ({backgroundImage:avatarGradients[Math.abs(id)%avatarGradients.length]});
const getMembershipClass = (periodo: string): string => ({
  Mensual:'membership-green', Quincenal:'membership-blue', Semanal:'membership-purple',
  Diario:'membership-orange', Promocion:'membership-pink'
} as Record<string, string>)[periodo] || 'membership-default';
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');.main-content, .modal-wrapper{--accent: var(--color-highlight, #3b82f6);--income: #34d399;--card-bg: var(--bg-cards, #121416);--radius: var(--app-border-radius, 14px);--radius-small: 10px;--line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent);--line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);--muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 68%, transparent)}
.main-content *, .main-content *::before, .main-content *::after{box-sizing: border-box}
.main-content{width: 100%;max-width: 1500px;margin: 0 auto;padding: 34px 36px 55px;color: var(--color-texto-general, #e5e7eb);font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;-webkit-font-smoothing: antialiased}
.header-section{display: flex;align-items: flex-end;justify-content: space-between;gap: 24px;margin-bottom: 22px}
.title-wrapper{min-width: 240px;display: flex;flex-direction: column;gap: 6px}
.main-title{margin: 0;color: var(--color-titulos, #ffffff);font-family: 'Anton', sans-serif;font-size: clamp(1.9rem, 3vw, 2.55rem);font-weight: 400;line-height: 1;letter-spacing: 0.02em;text-transform: uppercase}
.title-underline{display: block;width: 58px;height: 3px;margin-top: 2px;border-radius: 999px;background: linear-gradient(90deg, var(--accent), transparent)}
.main-subtitle{max-width: 560px;margin: 1px 0 0;color: var(--muted);font-size: 0.82rem;font-weight: 500;line-height: 1.5}
.actions-bar{display: flex;align-items: center;justify-content: flex-end;gap: 10px;flex-wrap: wrap}
.search-wrapper, .select-wrapper{position: relative;display: flex;align-items: center}
.search-icon, .select-icon{position: absolute;z-index: 2;left: 14px;color: var(--muted);pointer-events: none;opacity: 0.75}
.select-arrow{position: absolute;z-index: 2;right: 14px;color: var(--muted);pointer-events: none;opacity: 0.75}
.search-input, .status-select{height: 44px;border: 1px solid var(--line);border-radius: var(--radius-small);background: var(--card-bg);color: var(--color-texto-general, #ffffff);font-family: 'Inter', sans-serif;font-size: 0.82rem;font-weight: 500;outline: none;transition: width 0.2s ease, border-color 0.18s ease, box-shadow 0.18s ease}
.search-input:hover, .status-select:hover{border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 25%, transparent)}
.search-input:focus, .status-select:focus{border-color: var(--accent);box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent)}
.search-input{width: 240px;padding: 0 38px 0 40px}
.search-input:focus{width: 270px}
.search-input::placeholder{color: var(--muted);opacity: 0.68}
.search-clear{position: absolute;right: 10px;width: 22px;height: 22px;display: flex;align-items: center;justify-content: center;border: none;border-radius: 50%;background: color-mix(in srgb, var(--color-texto-general, #ffffff) 10%, transparent);color: var(--muted);cursor: pointer;transition: background 0.15s ease}
.search-clear:hover{background: color-mix(in srgb, var(--color-texto-general, #ffffff) 20%, transparent)}
.status-select{min-width: 190px;padding: 0 38px 0 40px;appearance: none;-webkit-appearance: none;cursor: pointer;color-scheme: dark}
.status-select option{background: #111315;color: #ffffff}
.btn-bulk{min-height: 44px;display: inline-flex;align-items: center;gap: 10px;padding: 5px 16px 5px 7px;border: 1px solid rgba(52, 211, 153, 0.34);border-radius: var(--radius-small);background: rgba(52, 211, 153, 0.08);color: var(--color-texto-general, #ffffff);font-family: 'Inter', sans-serif;white-space: nowrap;cursor: pointer;transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease}
.btn-bulk-icon{width: 32px;height: 32px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border-radius: 8px;background: rgba(52, 211, 153, 0.14);color: #34d399}
.btn-text-wrapper{display: flex;flex-direction: column;align-items: flex-start;gap: 1px;line-height: 1.1}
.btn-label{color: var(--muted);font-size: 0.58rem;font-weight: 700;letter-spacing: 0.06em;text-transform: uppercase}
.highlight-text-custom{color: #34d399;font-size: 0.88rem;font-weight: 700;letter-spacing: -0.01em}
.btn-bulk:hover{border-color: rgba(52, 211, 153, 0.6);background: rgba(52, 211, 153, 0.13);box-shadow: 0 8px 20px rgba(52, 211, 153, 0.1);transform: translateY(-1px)}
.btn-bulk:active{transform: translateY(0)}
.stats-row{display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));gap: 12px;margin-bottom: 18px}
.stat-card{position: relative;overflow: hidden;display: flex;flex-direction: column;gap: 3px;padding: 15px 18px;border: 1px solid var(--line);border-radius: var(--radius);background: var(--card-bg)}
.stat-card::before{content: '';position: absolute;top: 0;bottom: 0;left: 0;width: 3px;background: var(--tone, var(--accent))}
.stat-total{--tone: var(--accent)}
.stat-green{--tone: #34d399}
.stat-blue{--tone: #60a5fa}
.stat-orange{--tone: #fbbf24}
.stat-value{color: var(--color-titulos, #ffffff);font-family: 'Oswald', sans-serif;font-size: 1.5rem;font-weight: 600;line-height: 1.15;white-space: nowrap}
.stat-label{color: var(--muted);font-size: 0.68rem;font-weight: 700;letter-spacing: 0.07em;text-transform: uppercase}
.desktop-only{display: block}
.mobile-only{display: none}
.table-container{position: relative;width: 100%;overflow: hidden;border: 1px solid var(--line);border-radius: var(--radius);background: var(--card-bg);box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18)}
.table-container::before{content: '';position: absolute;z-index: 3;top: 0;left: 0;right: 0;height: 2px;background: linear-gradient(90deg, transparent, #34d399, transparent);opacity: 0.7;pointer-events: none}
.user-table{width: 100%;border-collapse: collapse;color: var(--color-texto-general, #e5e7eb);text-align: left}
.user-table thead{background: color-mix(in srgb, var(--card-bg) 95%, var(--color-texto-general, #ffffff))}
.user-table th{padding: 15px 18px;border-bottom: 1px solid var(--line);color: var(--muted);font-size: 0.68rem;font-weight: 700;letter-spacing: 0.065em;text-transform: uppercase;white-space: nowrap}
.user-table td{padding: 13px 18px;border-top: 1px solid var(--line-soft);font-size: 0.82rem;vertical-align: middle}
.user-table tbody tr:first-child td{border-top: none}
.user-table tbody tr{transition: background 0.17s ease, box-shadow 0.17s ease}
.th-right, .td-right{text-align: right}
@media (hover: hover){.user-table tbody tr:hover{background: rgba(52, 211, 153, 0.04);box-shadow: inset 3px 0 0 rgba(52, 211, 153, 0.8)}
}
.table-footer{padding: 11px 18px;border-top: 1px solid var(--line-soft);color: var(--muted);font-size: 0.72rem;font-weight: 500;text-align: right}
.avatar-small{width: 41px;height: 41px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border: 1px solid rgba(255, 255, 255, 0.14);border-radius: 11px;color: #ffffff;font-size: 0.74rem;font-weight: 700;letter-spacing: 0.02em;box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24)}
.text-bold{color: var(--color-titulos, #ffffff);font-weight: 600}
.text-muted{color: var(--muted)}
.type-chip{display: inline-flex;align-items: center;min-height: 26px;padding: 3px 10px;border: 1px solid var(--line);border-radius: 8px;background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent);color: var(--color-texto-general, #e5e7eb);font-size: 0.7rem;font-weight: 600;white-space: nowrap}
.status-badge2{min-height: 26px;display: inline-flex;align-items: center;justify-content: center;padding: 4px 10px;border: 1px solid;border-radius: 999px;font-size: 0.69rem;font-weight: 650;line-height: 1;white-space: nowrap}
.membership-purple{color: #c084fc;border-color: rgba(192, 132, 252, 0.25);background: rgba(192, 132, 252, 0.08)}
.membership-orange{color: #fb923c;border-color: rgba(251, 146, 60, 0.25);background: rgba(251, 146, 60, 0.08)}
.membership-pink{color: #f472b6;border-color: rgba(244, 114, 182, 0.25);background: rgba(244, 114, 182, 0.08)}
.membership-red{color: #f87171;border-color: rgba(248, 113, 113, 0.25);background: rgba(248, 113, 113, 0.08)}
.membership-blue{color: #60a5fa;border-color: rgba(96, 165, 250, 0.25);background: rgba(96, 165, 250, 0.08)}
.membership-green{color: #34d399;border-color: rgba(52, 211, 153, 0.25);background: rgba(52, 211, 153, 0.08)}
.membership-default{color: var(--color-texto-general, #ffffff);border-color: var(--line);background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent)}
.status-badge{min-height: 27px;display: inline-flex;align-items: center;gap: 7px;padding: 4px 11px;border: 1px solid transparent;border-radius: 999px;font-size: 0.72rem;font-weight: 700;white-space: nowrap}
.status-badge.income{color: #34d399;border-color: rgba(52, 211, 153, 0.25);background: rgba(52, 211, 153, 0.08)}
.status-badge.income::before{content: '';width: 6px;height: 6px;flex-shrink: 0;border-radius: 50%;background: currentColor;box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.12)}
.badges-row{display: flex;align-items: center;gap: 7px;flex-wrap: wrap}
.card-meta{display: flex;flex-direction: column;gap: 7px;color: var(--muted);font-size: 0.78rem}
.meta-row{min-width: 0;display: flex;align-items: center;gap: 7px}
.meta-row svg{flex-shrink: 0;opacity: 0.65}
.email-text{overflow-wrap: anywhere;color: #93c5fd}
.expiration-warning, .vence-label{color: #fb923c}
.expiration-warning{font-weight: 500}
.vence-label{font-weight: 600}
.phone-text{color: var(--muted)}
.empty-state-cell{padding: 0 !important;border-top: none !important}
.empty-state, .empty-state-mobile{min-height: 260px;display: flex;flex-direction: column;align-items: center;justify-content: center;gap: 12px;padding: 45px 20px;color: var(--muted);font-size: 0.82rem;font-weight: 500;text-align: center}
.empty-state svg, .empty-state-mobile svg{opacity: 0.4}
.modal-wrapper{position: fixed;z-index: 9999;inset: 0;display: flex;align-items: center;justify-content: center;padding: 20px;background: rgba(0, 0, 0, 0.78)}
.modal-body-custom{padding: 10px 5px;color: var(--color-texto-general, #ffffff);text-align: center}
.modal-icon-container{width: 54px;height: 54px;display: flex;align-items: center;justify-content: center;margin: 0 auto 16px;border-radius: 15px}
.danger-bg{border: 1px solid rgba(248, 113, 113, 0.2);background: rgba(248, 113, 113, 0.08)}
.modal-body-custom h2{margin: 0 0 9px;color: var(--color-titulos, #ffffff);font-family: 'Oswald', sans-serif;font-size: 1.25rem;font-weight: 600}
.modal-body-custom p{margin: 0 0 22px;color: var(--muted);font-size: 0.8rem;line-height: 1.6}
.highlight-name{color: var(--color-titulos, #ffffff);font-weight: 700}
.modal-buttons{display: flex;gap: 10px}
.btn-modal{min-height: 42px;flex: 1;padding: 0 16px;border-radius: 10px;font-family: 'Inter', sans-serif;font-size: 0.78rem;font-weight: 650;cursor: pointer;transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease}
.btn-modal.secondary{border: 1px solid var(--line);background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent);color: var(--color-texto-general, #d1d5db)}
.btn-modal.secondary:hover{background: color-mix(in srgb, var(--color-texto-general, #ffffff) 8%, transparent);transform: translateY(-1px)}
.btn-modal.danger{border: 1px solid rgba(239, 68, 68, 0.75);background: #dc2626;color: #ffffff}
.btn-modal.danger:hover{background: #ef4444;box-shadow: 0 6px 16px rgba(239, 68, 68, 0.2);transform: translateY(-1px)}
:deep(.notification-container), :deep(.toast-container){width: calc(100% - 32px) !important;max-width: 480px !important;box-sizing: border-box !important;left: 50% !important;right: auto !important;margin: 0 auto !important;transform: translateX(-50%) !important}
.pager{display: flex;align-items: center;justify-content: center;gap: 14px;margin-top: 18px}
.pager-btn{width: 40px;height: 40px;display: grid;place-items: center;padding: 0;border: 1px solid var(--line);border-radius: var(--radius-small, var(--r-sm, 10px));background: var(--card-bg, var(--bg-cards, #121416));color: var(--color-texto-general, #e5e7eb);cursor: pointer;transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease}
.pager-btn:hover:not(:disabled){border-color: var(--accent);background: color-mix(in srgb, var(--accent) 12%, transparent);color: var(--color-titulos, #ffffff);transform: translateY(-1px)}
.pager-btn:disabled{opacity: 0.35;cursor: not-allowed}
.pager-btn:focus-visible{outline: 2px solid var(--accent);outline-offset: 2px}
.pager-info{min-width: 64px;color: var(--muted);font-size: 0.8rem;font-weight: 600;text-align: center}
.pager-info b{color: var(--color-titulos, #ffffff);font-weight: 700}
.pop-enter-active, .pop-leave-active{transition: opacity 0.2s ease}
.pop-enter-from, .pop-leave-to{opacity: 0}
.search-input:focus-visible, .status-select:focus-visible, .btn-bulk:focus-visible, .btn-modal:focus-visible, .search-clear:focus-visible{outline: 2px solid var(--accent);outline-offset: 2px}
@media (max-width: 1150px){.main-content{padding: 30px 24px 48px}
.header-section{align-items: flex-start;flex-direction: column;gap: 17px}
.actions-bar{width: 100%;justify-content: flex-start}
.search-wrapper{flex: 1;min-width: 220px}
.search-input, .search-input:focus{width: 100%}
}
@media (max-width: 900px){.desktop-only{display: none !important}
.mobile-only{display: block !important}
.main-content{width: 100%;max-width: 100%;padding: 20px 14px 36px;overflow-x: hidden}
.header-section{width: 100%;align-items: stretch;margin-bottom: 16px}
.title-wrapper{width: 100%;min-width: 0}
.main-title{font-size: 1.85rem}
.main-subtitle{max-width: 100%;font-size: 0.76rem}
.actions-bar{width: 100%;display: grid;grid-template-columns: repeat(2, minmax(0, 1fr));gap: 9px}
.search-wrapper{width: 100%;min-width: 0;grid-column: 1 / -1;grid-row: 1}
.search-input, .search-input:focus{width: 100%}
.select-wrapper{width: 100%;min-width: 0}
.status-select{width: 100%;min-width: 0;text-overflow: ellipsis}
.btn-bulk{width: 100%;min-width: 0;min-height: 44px}
.stats-row{grid-template-columns: repeat(2, minmax(0, 1fr));gap: 9px;margin-bottom: 14px}
.stat-card{padding: 12px 14px}
.stat-value{font-size: 1.2rem}
.user-card{position: relative;width: 100%;overflow: hidden;margin-bottom: 11px;padding: 16px;border: 1px solid var(--line);border-radius: var(--radius);background: var(--card-bg);box-shadow: 0 9px 28px rgba(0, 0, 0, 0.17)}
.user-card::before{content: '';position: absolute;top: 0;bottom: 0;left: 0;width: 3px;background: #34d399}
.card-top-section{display: flex;align-items: flex-start;gap: 12px;margin-bottom: 13px}
.user-card .avatar-small{width: 44px;height: 44px;border-radius: 12px;font-size: 0.78rem}
.card-user-titles{min-width: 0;display: flex;flex: 1;flex-direction: column;align-items: flex-start;gap: 7px}
.name-text{width: 100%;overflow: hidden;color: var(--color-titulos, #ffffff);font-size: 0.88rem;font-weight: 600;line-height: 1.3;text-overflow: ellipsis;white-space: nowrap}
.card-meta{display: grid;gap: 8px;padding: 11px 12px;border: 1px solid var(--line-soft);border-radius: 11px;background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent);font-size: 0.75rem}
.email-text{overflow: hidden;text-overflow: ellipsis;white-space: nowrap}
.empty-state-mobile{min-height: 240px;margin-top: 8px;border: 1px dashed var(--line);border-radius: var(--radius);background: var(--card-bg)}
}
@media (max-width: 560px){.main-content{padding: 17px 11px 30px}
.main-title{font-size: 1.7rem}
.actions-bar{grid-template-columns: 1fr}
.search-wrapper, .select-wrapper, .btn-bulk{grid-column: 1}
.search-wrapper{grid-row: auto}
.user-card{padding: 15px}
}
@media (max-width: 380px){.main-content{padding-left: 9px;padding-right: 9px}
.main-title{font-size: 1.55rem}
.stat-value{font-size: 1.05rem}
.status-badge, .status-badge2{font-size: 0.65rem}
}
@media (prefers-reduced-motion: reduce){.search-input, .status-select, .btn-bulk, .user-table tbody tr, .btn-modal, .pop-enter-active, .pop-leave-active{transition: none !important}
}
.table-container{overflow-x: auto}
.user-table{min-width: 1370px}
.avatar-small{overflow: hidden}
.avatar-small img{width: 100%;height: 100%;object-fit: cover;border-radius: inherit}
.earnings-message{margin: 0 0 14px;padding: 12px 14px;border-radius: 10px;background: var(--bg-cards,#121416);font-size: .82rem}
.earnings-message.error{color: #fca5a5;border: 1px solid rgba(239,68,68,.3)}
.earnings-message button{margin-left: 8px;padding: 5px 10px;color: inherit;background: transparent;border: 1px solid currentColor;border-radius: 6px;cursor: pointer}

</style>
