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
onMounted(() => window.addEventListener('idioma-changed', handleLangChange));
onUnmounted(() => window.removeEventListener('idioma-changed', handleLangChange));

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
    pagos.value = Array.isArray(data.pagos) ? data.pagos.map(p => ({ ...p, monto: Number(p.monto || 0), folio: String(p.folio || ''), metodo: String(p.metodo || 'No especificado') })) : [];
    gimnasio.value = data.gimnasio || { nombre: '', logo_url: null };
  } catch (e) {
    errorApi.value = e?.message || 'No se pudo consultar el historial.';
    toastRef.value?.notify(errorApi.value, 'error');
  } finally { cargando.value = false; }
}
onMounted(() => { void cargarPagos(); window.addEventListener('focus', cargarPagos); });
onUnmounted(() => window.removeEventListener('focus', cargarPagos));

const conceptoLabel = (clave) => {
  const map = { monthly: 'Mensualidad', monthlySurcharge: 'Mensualidad + recargo', membership: 'Membresía' };
  return map[clave] || clave;
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
    lista = lista.filter(p => new Date(p.fecha) >= limite);
  }

  if (metodoFiltro.value !== 'todos') {
    lista = lista.filter(p => p.metodo === metodoFiltro.value);
  }

  if (filtro.value.trim()) {
    const q = filtro.value.trim().toLowerCase();
    lista = lista.filter(p =>
      conceptoLabel(p.concepto).toLowerCase().includes(q) ||
      p.folio.toLowerCase().includes(q) ||
      p.metodo.toLowerCase().includes(q)
    );
  }

  return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const totalPagado = computed(() =>
  pagosFiltrados.value.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
);

const formatFecha = (iso) =>
  iso ? new Date(iso + 'T12:00:00').toLocaleDateString(localeActual.value, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const metodoIcono = (metodo) => {
  if (metodo === 'Tarjeta') return 'card';
  if (metodo === 'Transferencia') return 'transfer';
  return 'cash';
};

const metodoLabel = (metodo) => {
  if (metodo === 'Tarjeta') return t.value.methodCard;
  if (metodo === 'Transferencia') return t.value.methodTransfer;
  return t.value.methodCash;
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

        <div class="view-header-flex">
          <div class="view-header" id="tutorial-history-header">
            <h1 class="title">{{ t.pageTitlePrefix }} <span class="highlight-text">{{ t.pageTitleHighlight }}</span></h1>
            <span class="title-underline"></span>
            <p class="subtitle">{{ t.pageSubtitle }}</p>
          </div>
          <div class="total-chip" id="tutorial-total-period">
            <span class="total-label">{{ t.totalPeriodLabel }}</span>
            <span class="total-value">${{ totalPagado.toFixed(2) }}</span>
          </div>
        </div>

        <p v-if="cargando" role="status">Cargando pagos…</p>
        <p v-if="errorApi" role="alert">{{ errorApi }} <button type="button" @click="cargarPagos">Reintentar</button></p>
        <div v-if="!cargando && !errorApi" class="history-card">
          <div class="filters-row" id="tutorial-history-filters">
            <div class="input-wrapper search-wrapper">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" v-model="filtro" :placeholder="t.searchPlaceholder">
            </div>

            <div class="input-wrapper select-wrapper-container filter-select">
              <select v-model="metodoFiltro" class="custom-select">
                <option value="todos">{{ t.methodAll }}</option>
                <option value="Tarjeta">{{ t.methodCard }}</option>
                <option value="Transferencia">{{ t.methodTransfer }}</option>
                <option value="Efectivo">{{ t.methodCash }}</option>
              </select>
              <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div class="input-wrapper select-wrapper-container filter-select">
              <select v-model="rangoTiempo" class="custom-select">
                <option value="todos">{{ t.timeAll }}</option>
                <option value="3m">{{ t.time3m }}</option>
                <option value="6m">{{ t.time6m }}</option>
                <option value="12m">{{ t.time12m }}</option>
              </select>
              <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Tabla (desktop) -->
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
                <span class="concepto-plan">{{ pago.plan }}</span>
              </span>
              <span class="cell metodo-cell">
                <div class="metodo-main-info">
                  <svg v-if="metodoIcono(pago.metodo) === 'card'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <svg v-else-if="metodoIcono(pago.metodo) === 'transfer'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>{{ metodoLabel(pago.metodo) }}</span>
                </div>
                <span v-if="pago.registradoPorStaff" class="staff-tag">{{ t.staffTag }}</span>
              </span>
              <span class="cell folio-cell">{{ pago.folio }}</span>
              <span class="cell align-right monto-cell">${{ pago.monto.toFixed(2) }}</span>
              <span class="cell align-center">
                <span class="estado-badge" :class="pago.estado">
                  {{ pago.estado === 'pagado' ? t.statusPaid : t.statusPending }}
                </span>
              </span>
              <span class="cell align-center">
                <button v-if="pago.estado === 'pagado'" class="btn-download" type="button" @click="abrirRecibo(pago)" :title="t.downloadReceiptTitle">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </button>
                <span v-else class="cell-dash">—</span>
              </span>
            </div>
          </div>

          <!-- Cards (mobile) -->
          <div class="cards-wrapper">
            <div v-if="pagosFiltrados.length === 0" class="empty-state">{{ t.emptyState }}</div>

            <div v-for="pago in pagosFiltrados" :key="pago.id" class="payment-card-mobile">
              <div class="pcm-top">
                <div>
                  <span class="concepto-nombre">{{ conceptoLabel(pago.concepto) }}</span>
                  <span class="concepto-plan">{{ pago.plan }} · {{ formatFecha(pago.fecha) }}</span>
                </div>
                <span class="estado-badge" :class="pago.estado">
                  {{ pago.estado === 'pagado' ? t.statusPaid : t.statusPending }}
                </span>
              </div>
              <div v-if="pago.registradoPorStaff" class="staff-tag mobile">{{ t.staffTag }}</div>
              <div class="pcm-bottom">
                <div class="pcm-metodo">
                  <svg v-if="metodoIcono(pago.metodo) === 'card'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <svg v-else-if="metodoIcono(pago.metodo) === 'transfer'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>{{ metodoLabel(pago.metodo) }} · {{ pago.folio }}</span>
                </div>
                <div class="pcm-actions">
                  <span class="monto-cell">${{ pago.monto.toFixed(2) }}</span>
                  <button v-if="pago.estado === 'pagado'" class="btn-download" type="button" @click="abrirRecibo(pago)" :title="t.downloadReceiptTitle">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LLAMADA AL MODAL EXTERNO -->
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
.page-container { max-width: 1050px; margin: 0 auto; }

.view-header-flex { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.view-header { flex: 1; min-width: 240px; }
.title { font-family: 'Anton', sans-serif; font-size: clamp(1.7rem, 5vw, 2.4rem); color: var(--color-titulos, #fff); margin: 0; letter-spacing: 1px; text-transform: uppercase; }
.highlight-text { color: var(--color-highlight, #3b82f6); }
.title-underline {
  display: block;
  width: 64px;
  height: 4px;
  margin: 4px 0 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-highlight, #3b82f6), transparent);
}
.subtitle { font-size: 0.85rem; color: rgba(245, 245, 244, 0.6); margin: 0; line-height: 1.4; font-weight: 400; }

.total-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: var(--app-border-radius, 12px);
  padding: 10px 18px;
}
.total-label { font-family: 'Oswald', sans-serif; font-size: 0.7rem; color: rgba(245, 245, 244, 0.6); text-transform: uppercase; letter-spacing: 0.5px; }
.total-value { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1.3rem; color: var(--color-highlight, #3b82f6); }

.history-card {
  background: var(--bg-cards, rgba(18, 18, 18, 0.75));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.12));
  border-radius: var(--app-border-radius, 24px);
  padding: 26px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.filters-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.search-wrapper { flex: 1; min-width: 220px; }
.filter-select { min-width: 180px; flex: 1; }
.input-icon { position: absolute; left: 12px; color: rgba(245, 245, 244, 0.45); pointer-events: none; }

.search-wrapper input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.1));
  border-radius: var(--app-border-radius, 8px);
  color: var(--color-texto-general, #f5f5f4);
  padding: 10px 12px 10px 36px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
}

.custom-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.1));
  border-radius: var(--app-border-radius, 8px);
  color: var(--color-texto-general, #f5f5f4);
  padding: 10px 32px 10px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}
.custom-select option { background-color: #18181b; color: #fff; }
.select-arrow { position: absolute; right: 12px; color: rgba(245, 245, 244, 0.45); pointer-events: none; }

.table-wrapper { display: block; overflow-x: auto; }
.table-head, .table-row {
  display: grid;
  grid-template-columns: 1.1fr 1.8fr 1.6fr 1.1fr 0.9fr 1fr 0.7fr;
  align-items: center;
  gap: 12px;
}
.table-head {
  padding: 0 14px 12px 14px;
  border-bottom: 1px solid var(--border-line, rgba(255, 255, 255, 0.08));
  font-family: 'Oswald', sans-serif;
  font-size: 0.72rem;
  color: rgba(245, 245, 244, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.table-row {
  padding: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-family: 'Inter', sans-serif;
  color: var(--color-texto-general, #f5f5f4);
  font-size: 0.86rem;
  transition: background 0.2s ease;
  align-items: flex-start;
}
.table-row:hover { background: rgba(255,255,255,0.02); }
.table-row:last-child { border-bottom: none; }

.cell { display: flex; flex-direction: column; justify-content: center; }
.fecha-cell { color: rgba(245, 245, 244, 0.6); }
.concepto-nombre { font-weight: 600; line-height: 1.3; }
.concepto-plan { font-size: 0.74rem; color: rgba(245, 245, 244, 0.45); margin-top: 2px; }

.metodo-cell { flex-direction: column; align-items: flex-start; gap: 4px; }
.metodo-main-info { display: flex; align-items: center; gap: 6px; color: rgba(245, 245, 244, 0.75); font-weight: 500; }
.folio-cell { color: rgba(245, 245, 244, 0.55); font-family: 'Inter', monospace; font-size: 0.8rem; }
.monto-cell { font-weight: 700; }

.staff-tag {
  display: inline-block;
  font-size: 0.58rem;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 1px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.staff-tag.mobile { margin: -2px 0 8px; display: inline-block; }

.align-right { text-align: right; align-items: flex-end; }
.align-center { text-align: center; align-items: center; justify-content: center; }

.estado-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}
.estado-badge.pagado { background: rgba(74, 222, 128, 0.12); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.35); }
.estado-badge.pendiente { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); }

.cell-dash { color: rgba(245, 245, 244, 0.25); }

.btn-download {
  background: transparent;
  border: 1px solid var(--color-highlight, #3b82f6);
  color: var(--color-highlight, #3b82f6);
  border-radius: var(--app-border-radius, 8px);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-download:hover { background: rgba(59, 130, 246, 0.1); transform: scale(1.05); }

.empty-state { padding: 40px 14px; text-align: center; color: rgba(245, 245, 244, 0.45); font-size: 0.9rem; }

/* Cards mobile */
.cards-wrapper { display: none; flex-direction: column; gap: 10px; }
.payment-card-mobile { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-line, rgba(255, 255, 255, 0.08)); border-radius: var(--app-border-radius, 12px); padding: 14px; }
.pcm-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 10px; }
.pcm-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.pcm-metodo { display: flex; align-items: center; gap: 6px; color: rgba(245, 245, 244, 0.6); font-size: 0.8rem; }
.pcm-actions { display: flex; align-items: center; gap: 10px; }

@media(max-width: 768px) {
  .table-wrapper { display: none; }
  .cards-wrapper { display: flex; }
  .main-content { padding: 16px; }
}
</style>