<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import HeadingMember from '../HeadingMember.vue';
import PaymentReceiptModal from './PaymentReceiptModal.vue';
import { solicitudMiembro } from '../memberSesion.js';

/* ---------------- IDIOMA (es/en) ---------------- */
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');
const handleLangChange = (e) => {
  if (e.detail && e.detail.idioma) currentLang.value = e.detail.idioma;
};

const traducciones = {
  es: {
    pageTitlePrefix: 'Historial',
    pageTitleHighlight: 'de Pagos',
    pageSubtitle: 'Consulta y descarga tus recibos de mensualidad.',
    totalPeriodLabel: 'Total en este periodo',
    searchPlaceholder: 'Buscar por folio, concepto o método',
    timeAll: 'Todo el historial',
    time3m: 'Últimos 3 meses',
    time6m: 'Últimos 6 meses',
    time12m: 'Últimos 12 meses',
    methodAll: 'Todos los métodos',
    methodCard: 'Tarjeta',
    methodTransfer: 'Transferencia',
    methodCash: 'Efectivo',
    colDate: 'Fecha',
    colConcept: 'Concepto',
    colMethod: 'Método',
    colFolio: 'Folio',
    colAmount: 'Monto',
    colStatus: 'Estado',
    colReceipt: 'Recibo',
    statusPaid: 'Pagado',
    statusPending: 'En revisión',
    staffTag: 'Registrado en recepción',
    emptyState: 'No se encontraron pagos con esos filtros.',
    downloadReceiptTitle: 'Ver y descargar recibo',
    loading: 'Cargando tus pagos…',
    loadError: 'No pudimos cargar tu historial. Intenta de nuevo.',
    retryBtn: 'Reintentar',
    conceptMonthly: 'Mensualidad',
    conceptMonthlySurcharge: 'Mensualidad + recargo',
    conceptMembership: 'Membresía',
    methodUnspecified: 'Sin especificar',
    folioFull: 'Folio completo',
  },
  en: {
    pageTitlePrefix: 'Payment',
    pageTitleHighlight: 'History',
    pageSubtitle: 'Check and download your membership receipts.',
    totalPeriodLabel: 'Total this period',
    searchPlaceholder: 'Search by reference, concept or method',
    timeAll: 'Entire history',
    time3m: 'Last 3 months',
    time6m: 'Last 6 months',
    time12m: 'Last 12 months',
    methodAll: 'All methods',
    methodCard: 'Card',
    methodTransfer: 'Transfer',
    methodCash: 'Cash',
    colDate: 'Date',
    colConcept: 'Concept',
    colMethod: 'Method',
    colFolio: 'Reference',
    colAmount: 'Amount',
    colStatus: 'Status',
    colReceipt: 'Receipt',
    statusPaid: 'Paid',
    statusPending: 'Under review',
    staffTag: 'Registered at front desk',
    emptyState: 'No payments matched those filters.',
    downloadReceiptTitle: 'View and download receipt',
    loading: 'Loading your payments…',
    loadError: 'We could not load your history. Please try again.',
    retryBtn: 'Retry',
    conceptMonthly: 'Monthly fee',
    conceptMonthlySurcharge: 'Monthly fee + late fee',
    conceptMembership: 'Membership',
    methodUnspecified: 'Not specified',
    folioFull: 'Full reference',
  },
};

const t = computed(() => traducciones[currentLang.value] || traducciones.es);
const localeActual = computed(() => (currentLang.value === 'en' ? 'en-US' : 'es-MX'));

const toastRef = ref(null);
const modalReciboVisible = ref(false);
const pagoSeleccionado = ref(null);

const pagos = ref([]);
const cargando = ref(true);
const errorApi = ref('');
const gimnasio = ref({ nombre: '', logo_url: null });

async function cargarPagos() {
  cargando.value = true;
  errorApi.value = '';
  try {
    const data = await solicitudMiembro('/api/member/pagos');
    pagos.value = Array.isArray(data.pagos)
      ? data.pagos.map((p) => ({
          ...p,
          monto: Number(p.monto || 0),
          folio: String(p.folio || ''),
          metodo: String(p.metodo || 'No especificado'),
        }))
      : [];
    gimnasio.value = data.gimnasio || { nombre: '', logo_url: null };
  } catch (e) {
    errorApi.value = t.value.loadError;
    toastRef.value?.notify(errorApi.value, 'error');
  } finally {
    cargando.value = false;
  }
}

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('focus', cargarPagos);
  void cargarPagos();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('focus', cargarPagos);
});

/* ---------------- TEXTOS DE CADA PAGO ---------------- */
const conceptoLabel = (clave) => {
  const map = {
    monthly: t.value.conceptMonthly,
    monthlySurcharge: t.value.conceptMonthlySurcharge,
    membership: t.value.conceptMembership,
    Membresía: t.value.conceptMembership,
    Membresia: t.value.conceptMembership,
    Mensualidad: t.value.conceptMonthly,
  };
  return map[clave] || clave || '—';
};

/* Folio corto: "OP-EE622FD46FE0335F330B2844" -> "OP-…0B2844" */
const folioCorto = (folio) => {
  if (!folio) return '—';
  if (folio.length <= 14) return folio;
  const prefijo = folio.includes('-') ? folio.split('-')[0] + '-' : '';
  return `${prefijo}…${folio.slice(-6)}`;
};

const filtro = ref('');
const rangoTiempo = ref('todos');
const metodoFiltro = ref('todos');

const pagosFiltrados = computed(() => {
  let lista = [...pagos.value];

  if (rangoTiempo.value !== 'todos') {
    const meses = { '3m': 3, '6m': 6, '12m': 12 };
    const limite = new Date();
    limite.setMonth(limite.getMonth() - meses[rangoTiempo.value]);
    lista = lista.filter((p) => new Date(p.fecha) >= limite);
  }

  if (metodoFiltro.value !== 'todos') {
    lista = lista.filter((p) => p.metodo === metodoFiltro.value);
  }

  if (filtro.value.trim()) {
    const q = filtro.value.trim().toLowerCase();
    lista = lista.filter(
      (p) =>
        conceptoLabel(p.concepto).toLowerCase().includes(q) ||
        p.folio.toLowerCase().includes(q) ||
        p.metodo.toLowerCase().includes(q)
    );
  }

  return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const totalPagado = computed(() =>
  pagosFiltrados.value.filter((p) => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
);

const formatoMoneda = (n) =>
  new Intl.NumberFormat(localeActual.value, { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);

const formatFecha = (iso) =>
  iso
    ? new Date(iso + 'T12:00:00').toLocaleDateString(localeActual.value, { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const metodoIcono = (metodo) => {
  if (metodo === 'Tarjeta') return 'card';
  if (metodo === 'Transferencia') return 'transfer';
  return 'cash';
};

const metodoLabel = (metodo) => {
  if (metodo === 'Tarjeta') return t.value.methodCard;
  if (metodo === 'Transferencia') return t.value.methodTransfer;
  if (metodo === 'Efectivo') return t.value.methodCash;
  return t.value.methodUnspecified;
};

const abrirRecibo = (pago) => {
  if (pago.estado !== 'pagado') return;
  pagoSeleccionado.value = pago;
  modalReciboVisible.value = true;
};

const cerrarModal = () => {
  modalReciboVisible.value = false;
  pagoSeleccionado.value = null;
};

const handleNotification = ({ message, type }) => {
  toastRef.value?.notify(message, type);
};
</script>

<template>
  <HeadingMember>
    <NotificationSystem ref="toastRef" />

    <main class="main-content">
      <div class="page-container">

        <!-- Encabezado -->
        <div class="view-header-flex">
          <div class="view-header" id="tutorial-history-header">
            <h1 class="title">{{ t.pageTitlePrefix }} <span class="highlight-text">{{ t.pageTitleHighlight }}</span></h1>
            <span class="title-underline"></span>
            <p class="subtitle">{{ t.pageSubtitle }}</p>
          </div>
          <div class="total-chip" id="tutorial-total-period">
            <span class="total-label">{{ t.totalPeriodLabel }}</span>
            <span class="total-value">{{ formatoMoneda(totalPagado) }}</span>
          </div>
        </div>

        <p v-if="cargando" class="state-message" role="status">{{ t.loading }}</p>
        <p v-if="errorApi" class="state-message state-error" role="alert">
          {{ errorApi }}
          <button type="button" class="btn-retry" @click="cargarPagos">{{ t.retryBtn }}</button>
        </p>

        <div v-if="!cargando && !errorApi" class="history-card">

          <!-- Filtros -->
          <div class="filters-row" id="tutorial-history-filters">
            <div class="input-wrapper search-wrapper">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" v-model="filtro" :placeholder="t.searchPlaceholder" :aria-label="t.searchPlaceholder">
            </div>

            <div class="input-wrapper select-wrapper-container filter-select">
              <select v-model="metodoFiltro" class="custom-select" :aria-label="t.colMethod">
                <option value="todos">{{ t.methodAll }}</option>
                <option value="Tarjeta">{{ t.methodCard }}</option>
                <option value="Transferencia">{{ t.methodTransfer }}</option>
                <option value="Efectivo">{{ t.methodCash }}</option>
              </select>
              <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div class="input-wrapper select-wrapper-container filter-select">
              <select v-model="rangoTiempo" class="custom-select" :aria-label="t.colDate">
                <option value="todos">{{ t.timeAll }}</option>
                <option value="3m">{{ t.time3m }}</option>
                <option value="6m">{{ t.time6m }}</option>
                <option value="12m">{{ t.time12m }}</option>
              </select>
              <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Tabla (escritorio) -->
          <div class="table-wrapper" id="tutorial-payments-table">
            <div class="table-head">
              <span>{{ t.colDate }}</span>
              <span>{{ t.colConcept }}</span>
              <span>{{ t.colMethod }}</span>
              <span>{{ t.colFolio }}</span>
              <span class="align-right">{{ t.colAmount }}</span>
              <span class="align-center">{{ t.colStatus }}</span>
              <span class="align-center">{{ t.colReceipt }}</span>
            </div>

            <div v-if="pagosFiltrados.length === 0" class="empty-state">{{ t.emptyState }}</div>

            <div v-for="pago in pagosFiltrados" :key="pago.id" class="table-row">
              <span class="cell fecha-cell">{{ formatFecha(pago.fecha) }}</span>

              <span class="cell">
                <span class="concepto-nombre">{{ conceptoLabel(pago.concepto) }}</span>
                <span v-if="pago.plan" class="concepto-plan">{{ pago.plan }}</span>
              </span>

              <span class="cell metodo-cell">
                <span class="metodo-main-info">
                  <svg v-if="metodoIcono(pago.metodo) === 'card'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <svg v-else-if="metodoIcono(pago.metodo) === 'transfer'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>{{ metodoLabel(pago.metodo) }}</span>
                </span>
                <span v-if="pago.registradoPorStaff" class="staff-tag">{{ t.staffTag }}</span>
              </span>

              <span class="cell">
                <span class="folio-pill" :title="`${t.folioFull}: ${pago.folio}`">{{ folioCorto(pago.folio) }}</span>
              </span>

              <span class="cell align-right monto-cell">{{ formatoMoneda(pago.monto) }}</span>

              <span class="cell align-center">
                <span class="estado-badge" :class="pago.estado">
                  {{ pago.estado === 'pagado' ? t.statusPaid : t.statusPending }}
                </span>
              </span>

              <span class="cell align-center">
                <button v-if="pago.estado === 'pagado'" class="btn-download" type="button" @click="abrirRecibo(pago)" :title="t.downloadReceiptTitle" :aria-label="t.downloadReceiptTitle">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </button>
                <span v-else class="cell-dash">—</span>
              </span>
            </div>
          </div>

          <!-- Tarjetas (móvil) -->
          <div class="cards-wrapper">
            <div v-if="pagosFiltrados.length === 0" class="empty-state">{{ t.emptyState }}</div>

            <div v-for="pago in pagosFiltrados" :key="pago.id" class="payment-card-mobile">
              <div class="pcm-top">
                <div class="pcm-title">
                  <span class="concepto-nombre">{{ conceptoLabel(pago.concepto) }}</span>
                  <span class="concepto-plan">{{ pago.plan }}<template v-if="pago.plan"> · </template>{{ formatFecha(pago.fecha) }}</span>
                </div>
                <span class="estado-badge" :class="pago.estado">
                  {{ pago.estado === 'pagado' ? t.statusPaid : t.statusPending }}
                </span>
              </div>

              <div v-if="pago.registradoPorStaff" class="staff-tag mobile">{{ t.staffTag }}</div>

              <div class="pcm-bottom">
                <div class="pcm-metodo">
                  <span class="metodo-main-info">
                    <svg v-if="metodoIcono(pago.metodo) === 'card'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <svg v-else-if="metodoIcono(pago.metodo) === 'transfer'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <polyline points="17 1 21 5 17 9"></polyline>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                      <polyline points="7 23 3 19 7 15"></polyline>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>{{ metodoLabel(pago.metodo) }}</span>
                  </span>
                  <span class="folio-pill" :title="`${t.folioFull}: ${pago.folio}`">{{ folioCorto(pago.folio) }}</span>
                </div>
                <div class="pcm-actions">
                  <span class="monto-cell">{{ formatoMoneda(pago.monto) }}</span>
                  <button v-if="pago.estado === 'pagado'" class="btn-download" type="button" @click="abrirRecibo(pago)" :title="t.downloadReceiptTitle" :aria-label="t.downloadReceiptTitle">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de recibo -->
        <PaymentReceiptModal
          :visible="modalReciboVisible"
          :pago="pagoSeleccionado"
          :gimnasio="gimnasio"
          :locale="localeActual"
          @close="cerrarModal"
          @notify="handleNotification"
        />

      </div>
    </main>
  </HeadingMember>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&display=swap');

* { box-sizing: border-box; }

.main-content {
  min-height: calc(100vh - 80px);
  background: transparent;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  padding: 24px 32px;
  position: relative;
}

:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important;
  max-width: 480px !important;
  box-sizing: border-box !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  right: auto !important;
  margin: 0 auto !important;
}

.page-container { max-width: 1100px; margin: 0 auto; }

/* Encabezado */
.view-header-flex { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.view-header { flex: 1; min-width: 240px; }
.title { font-family: 'Anton', sans-serif; font-size: clamp(1.8rem, 5vw, 2.5rem); color: var(--color-titulos, #fff); margin: 0; letter-spacing: 1px; text-transform: uppercase; }
.highlight-text { color: var(--color-highlight, #3b82f6); }
.title-underline { display: block; width: 70px; height: 4px; margin: 6px 0 10px; border-radius: 4px; background: linear-gradient(90deg, var(--color-highlight, #3b82f6), transparent); }
.subtitle { font-size: 0.95rem; color: rgba(245, 245, 244, 0.8); margin: 0; line-height: 1.5; font-weight: 500; }

/* Total del periodo */
.total-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: var(--app-border-radius, 14px);
  padding: 12px 22px;
  min-width: 190px;
}
.total-label { font-family: 'Oswald', sans-serif; font-size: 0.75rem; color: rgba(245, 245, 244, 0.7); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; }
.total-value { font-family: 'Anton', sans-serif; font-size: 1.8rem; line-height: 1.1; letter-spacing: 0.5px; color: var(--color-highlight, #3b82f6); }

/* Estados de carga / error */
.state-message { padding: 16px 18px; border: 1px solid var(--border-line, rgba(255,255,255,.15)); border-radius: 12px; margin: 0 0 16px; }
.state-error { border-color: rgba(239, 68, 68, 0.45); color: #fca5a5; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.btn-retry { background: transparent; border: 1px solid currentColor; color: inherit; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }

/* Tarjeta contenedora */
.history-card {
  background: var(--bg-cards, rgba(18, 18, 18, 0.8));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.12));
  border-radius: var(--app-border-radius, 24px);
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

/* Filtros */
.filters-row { display: flex; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.search-wrapper { flex: 2 1 260px; }
.filter-select { flex: 1 1 180px; }
.input-icon { position: absolute; left: 14px; color: rgba(245, 245, 244, 0.5); pointer-events: none; }

.search-wrapper input,
.custom-select {
  width: 100%;
  height: 44px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.12));
  border-radius: var(--app-border-radius, 12px);
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}
.search-wrapper input { padding: 0 14px 0 40px; }
.search-wrapper input::placeholder { color: rgba(245, 245, 244, 0.45); }
.custom-select { padding: 0 36px 0 14px; appearance: none; -webkit-appearance: none; cursor: pointer; }
.custom-select option { background-color: #18181b; color: #fff; }
.search-wrapper input:focus,
.custom-select:focus { border-color: var(--color-highlight, #3b82f6); }
.select-arrow { position: absolute; right: 14px; color: rgba(245, 245, 244, 0.5); pointer-events: none; }

/* Tabla */
.table-wrapper { display: block; overflow-x: auto; }

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 120px minmax(130px, 1.3fr) minmax(170px, 1.5fr) minmax(120px, 1fr) 110px 110px 70px;
  align-items: center;
  column-gap: 16px;
  min-width: 860px;
}

.table-head {
  padding: 0 16px 12px;
  border-bottom: 1px solid var(--border-line, rgba(255, 255, 255, 0.1));
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(245, 245, 244, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.table-row {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
  transition: background 0.2s ease;
}
.table-row:hover { background: rgba(255, 255, 255, 0.03); }
.table-row:last-child { border-bottom: none; }

.cell { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.fecha-cell { color: rgba(245, 245, 244, 0.75); font-weight: 500; white-space: nowrap; }
.concepto-nombre { font-weight: 700; line-height: 1.3; color: #fff; }
.concepto-plan { font-size: 0.78rem; color: rgba(245, 245, 244, 0.55); margin-top: 2px; }

.metodo-cell { align-items: flex-start; gap: 6px; }
.metodo-main-info { display: inline-flex; align-items: center; gap: 8px; color: rgba(245, 245, 244, 0.9); font-weight: 600; }
.metodo-main-info svg { color: var(--color-highlight, #3b82f6); flex-shrink: 0; }

/* Folio corto en pastilla */
.folio-pill {
  display: inline-block;
  align-self: flex-start;
  max-width: 100%;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 0.78rem;
  letter-spacing: 0.3px;
  color: rgba(245, 245, 244, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

.monto-cell { font-weight: 800; color: #fff; white-space: nowrap; font-variant-numeric: tabular-nums; }

.staff-tag {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.65rem;
  font-weight: 600;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.2px;
  white-space: nowrap;
}
.staff-tag.mobile { margin: 0 0 10px; }

.align-right { text-align: right; align-items: flex-end; }
.align-center { text-align: center; align-items: center; justify-content: center; }

/* Estado */
.estado-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  text-align: center;
  white-space: nowrap;
}
.estado-badge.pagado { background: rgba(74, 222, 128, 0.12); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); }
.estado-badge.pendiente { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); }

.cell-dash { color: rgba(245, 245, 244, 0.3); }

/* Botón de recibo */
.btn-download {
  background: transparent;
  border: 1px solid var(--color-highlight, #3b82f6);
  color: var(--color-highlight, #3b82f6);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.btn-download:hover { background: var(--color-highlight, #3b82f6); color: #fff; }
.btn-download:focus-visible,
.btn-retry:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

.empty-state { padding: 48px 14px; text-align: center; color: rgba(245, 245, 244, 0.55); font-size: 0.95rem; }

/* Tarjetas móvil */
.cards-wrapper { display: none; flex-direction: column; gap: 12px; }
.payment-card-mobile { background: rgba(0, 0, 0, 0.28); border: 1px solid var(--border-line, rgba(255, 255, 255, 0.1)); border-radius: var(--app-border-radius, 14px); padding: 16px; }
.pcm-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
.pcm-title { display: flex; flex-direction: column; min-width: 0; }
.pcm-bottom { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.pcm-metodo { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; font-size: 0.85rem; }
.pcm-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.pcm-actions .monto-cell { font-size: 1.05rem; }

/* Responsivo */
@media (max-width: 768px) {
  .main-content { padding: 16px 12px; }
  .history-card { padding: 16px; }
  .table-wrapper { display: none; }
  .cards-wrapper { display: flex; }
  .total-chip { width: 100%; }
}
</style>