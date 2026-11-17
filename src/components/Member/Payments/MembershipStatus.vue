<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import HeadingMember from '../HeadingMember.vue';
import { solicitudMiembro } from '../memberSesion.js';

/* ---------------- IDIOMA (es/en) ---------------- */
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');
const handleLangChange = (e) => {
  if (e.detail && e.detail.idioma) currentLang.value = e.detail.idioma;
};

const traducciones = {
  es: {
    pageTitlePrefix: 'Portal de',
    pageTitleHighlight: 'Pagos',
    pageSubtitle: 'Consulta el estado de tu membresía y mantén tu cuenta al día.',
    statusActive: 'ACTIVA',
    statusExpiringSoon: 'POR VENCER',
    statusExpired: 'VENCIDA',
    statusNoData: 'SIN DATOS',
    daysRemaining: 'días restantes',
    daysOverdue: 'días de atraso',
    dueDate: 'Vence el',
    reviewPill: 'Pago en revisión',
    memberPhotoAlt: 'Foto del miembro',
    idLabel: 'ID',
    loading: 'Cargando tu membresía…',
    loadError: 'No pudimos cargar tu membresía. Intenta de nuevo.',
    retryBtn: 'Reintentar',
    nextCut: 'Próximo corte',
    newCut: 'Nuevo corte al pagar',
    registeredPlan: 'Tu plan',
    noPlan: 'Aún no tienes un plan asignado.',
    accountStatement: 'Resumen de cuenta',
    pendingBalance: 'Saldo pendiente',
    upToDate: 'Cuenta al corriente',
    paymentInfoMessage: 'Los pagos se realizan mediante los métodos autorizados por tu gimnasio. Si ya realizaste un pago, tu estado de cuenta se actualizará cuando sea verificado en recepción.',
    refreshStatementBtn: 'Actualizar estado de cuenta',
    cashNote: '¿Prefieres efectivo? Los pagos en efectivo se reciben directamente en recepción del centro deportivo.',
    cardUnavailable: 'Esta opción no está disponible por el momento. Realiza tu pago en recepción.',
    transferUnavailable: 'Las transferencias se verifican en recepción. Aún no se ha registrado ningún pago.',
  },
  en: {
    pageTitlePrefix: 'Payment',
    pageTitleHighlight: 'Portal',
    pageSubtitle: 'Check your membership status and keep your account up to date.',
    statusActive: 'ACTIVE',
    statusExpiringSoon: 'EXPIRING SOON',
    statusExpired: 'EXPIRED',
    statusNoData: 'NO DATA',
    daysRemaining: 'days remaining',
    daysOverdue: 'days overdue',
    dueDate: 'Due on',
    reviewPill: 'Payment under review',
    memberPhotoAlt: 'Member photo',
    idLabel: 'ID',
    loading: 'Loading your membership…',
    loadError: 'We could not load your membership. Please try again.',
    retryBtn: 'Retry',
    nextCut: 'Next cut-off',
    newCut: 'New cut-off after payment',
    registeredPlan: 'Your plan',
    noPlan: 'You do not have a plan assigned yet.',
    accountStatement: 'Account summary',
    pendingBalance: 'Pending balance',
    upToDate: 'Account up to date',
    paymentInfoMessage: 'Payments are made through the methods authorized by your gym. If you have already made a payment, your account status will be updated once it is verified at reception.',
    refreshStatementBtn: 'Refresh account status',
    cashNote: 'Prefer cash? Cash payments are accepted directly at the facility reception desk.',
    cardUnavailable: 'This option is not available at the moment. Please pay at reception.',
    transferUnavailable: 'Transfers are verified at reception. No payment has been recorded yet.',
  },
};

const t = computed(() => traducciones[currentLang.value] || traducciones.es);
const toastRef = ref(null);

/* ---------------- DATOS ---------------- */
const socio = reactive({ nombre: '', apellido: '', id: '', foto: null });
const iniciales = computed(() =>
  socio.nombre.trim().slice(0, 1).toUpperCase() + socio.apellido.trim().slice(0, 1).toUpperCase()
);
const cargando = ref(true);
const errorApi = ref('');
const fechaVencimiento = ref(null);
const diasRestantes = ref(null);
const saldoPendiente = ref(0);
const planReal = ref('');
const precioReal = ref(null);
const estadoRegistrado = ref('');
const transferenciaEnRevision = ref(false);
const nuevoCorte = ref(null); // se muestra solo cuando exista un valor real

const localeActual = computed(() => (currentLang.value === 'en' ? 'en-US' : 'es-MX'));
const fechaFormateada = computed(() =>
  fechaVencimiento.value
    ? new Date(fechaVencimiento.value + 'T12:00:00').toLocaleDateString(localeActual.value, {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—'
);

const estadoMembresia = computed(() => {
  if (diasRestantes.value === null) return { label: t.value.statusNoData, color: '#94a3b8' };
  if (diasRestantes.value < 0 || /inactivo|vencid/i.test(estadoRegistrado.value))
    return { label: t.value.statusExpired, color: '#ef4444' };
  if (diasRestantes.value <= 5) return { label: t.value.statusExpiringSoon, color: '#f59e0b' };
  return { label: t.value.statusActive, color: '#4ade80' };
});

/* Anillo de progreso */
const RADIO = 54;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
const dashOffset = computed(() => {
  const progreso = diasRestantes.value === null ? 0 : Math.min(1, Math.max(0, diasRestantes.value / 30));
  return CIRCUNFERENCIA * (1 - progreso);
});

const plan = computed(() =>
  precioReal.value === null ? null : { nombre: planReal.value || t.value.registeredPlan, precio: precioReal.value }
);
const totalAPagar = computed(() => saldoPendiente.value);
const tienePendiente = computed(() => saldoPendiente.value > 0);

/* Pagos en línea no disponibles todavía */
const pagarConTarjeta = () => toastRef.value?.notify(t.value.cardUnavailable, 'warning');
const enviarComprobanteTransferencia = () => toastRef.value?.notify(t.value.transferUnavailable, 'warning');

async function cargarMembresia() {
  cargando.value = true;
  errorApi.value = '';
  try {
    const datos = await solicitudMiembro('/api/member/pagos');
    const m = datos.membresia || {};
    const partes = String(datos.miembro?.nombre || '').trim().split(/\s+/);
    socio.nombre = partes.shift() || '';
    socio.apellido = partes.join(' ');
    socio.id = String(datos.miembro?.id ?? '');
    socio.foto = datos.miembro?.foto || null;
    fechaVencimiento.value = m.fecha_vencimiento || null;
    diasRestantes.value = m.dias_restantes ?? null;
    saldoPendiente.value = Math.max(0, Number(m.saldo_pendiente || 0));
    planReal.value = m.plan || '';
    precioReal.value = m.precio === null || m.precio === undefined ? null : Number(m.precio);
    estadoRegistrado.value = m.estado || '';
    transferenciaEnRevision.value = Array.isArray(datos.pagos) && datos.pagos.some((p) => p.estado === 'pendiente');
  } catch (e) {
    errorApi.value = t.value.loadError;
    toastRef.value?.notify(errorApi.value, 'error');
  } finally {
    cargando.value = false;
  }
}

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('focus', cargarMembresia);
  void cargarMembresia();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('focus', cargarMembresia);
});
</script>

<template>
  <HeadingMember>
    <NotificationSystem ref="toastRef" />

    <main class="main-content">
      <div class="page-container">

        <div class="view-header">
          <h1 class="title">{{ t.pageTitlePrefix }} <span class="highlight-text">{{ t.pageTitleHighlight }}</span></h1>
          <span class="title-underline"></span>
          <p class="subtitle">{{ t.pageSubtitle }}</p>
        </div>

        <p v-if="cargando" class="state-message" role="status">{{ t.loading }}</p>
        <p v-if="errorApi" class="state-message state-error" role="alert">
          {{ errorApi }}
          <button type="button" class="btn-retry" @click="cargarMembresia">{{ t.retryBtn }}</button>
        </p>

        <div v-if="!cargando && !errorApi" class="membership-grid">

          <!-- Columna izquierda: estado del socio -->
          <section id="tutorial-member-status-card" class="status-card">
            <div class="avatar-ring-wrapper">
              <svg class="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
                <circle class="progress-ring__bg" cx="60" cy="60" r="54" />
                <circle
                  class="progress-ring__value"
                  cx="60" cy="60" r="54"
                  :style="{
                    stroke: estadoMembresia.color,
                    strokeDasharray: `${CIRCUNFERENCIA}px`,
                    strokeDashoffset: `${dashOffset}px`
                  }"
                />
              </svg>
              <div class="avatar-circle">
                <img v-if="socio.foto" :src="socio.foto" :alt="t.memberPhotoAlt" class="avatar-real" @error="socio.foto = null" />
                <span v-else class="avatar-initials">{{ iniciales }}</span>
              </div>
            </div>

            <h2 class="member-name">{{ socio.nombre }} <span class="highlight-text">{{ socio.apellido }}</span></h2>
            <p class="user-id">{{ t.idLabel }}: {{ socio.id }}</p>

            <div class="status-badge" :style="{ background: estadoMembresia.color }">
              {{ estadoMembresia.label }}
            </div>

            <div v-if="transferenciaEnRevision" class="review-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ t.reviewPill }}
            </div>

            <div class="dias-restantes">
              <span class="dias-numero" :style="{ color: estadoMembresia.color }">
                {{ diasRestantes === null ? '—' : Math.abs(diasRestantes) }}
              </span>
              <span class="dias-label">{{ diasRestantes !== null && diasRestantes < 0 ? t.daysOverdue : t.daysRemaining }}</span>
            </div>

            <div class="vencimiento-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ t.dueDate }} <strong>{{ fechaFormateada }}</strong></span>
            </div>
          </section>

          <!-- Columna derecha: cuenta y pagos -->
          <section class="payment-card">

            <!-- Fechas de corte -->
            <div id="tutorial-billing-cuts" class="account-info-grid" :class="{ single: !nuevoCorte }">
              <div class="info-box-date">
                <span class="info-box-label">{{ t.nextCut }}</span>
                <div class="info-box-val-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{{ fechaFormateada }}</span>
                </div>
              </div>
              <div v-if="nuevoCorte" class="info-box-date highlight-box">
                <span class="info-box-label">{{ t.newCut }}</span>
                <div class="info-box-val-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  <span>{{ nuevoCorte }}</span>
                </div>
              </div>
            </div>

            <!-- Plan -->
            <div class="section-subtitle-small"><span class="subtitle-dot"></span>{{ t.registeredPlan }}</div>
            <div id="tutorial-payment-plans" class="plan-row">
              <div v-if="plan" class="plan-chip">
                <span class="plan-nombre">{{ plan.nombre }}</span>
                <span class="plan-precio">${{ plan.precio.toFixed(2) }} MXN</span>
              </div>
              <p v-else class="empty-note">{{ t.noPlan }}</p>
            </div>

            <!-- Resumen de cuenta -->
            <div class="account-statement-header">
              <span class="statement-title">{{ t.accountStatement }}</span>
              <span v-if="tienePendiente" class="badge-pending">{{ t.pendingBalance }}</span>
              <span v-else class="badge-ok">{{ t.upToDate }}</span>
            </div>
            <div id="tutorial-account-summary" class="styled-box">
              <div class="amount-info">
                <span class="amount-label">{{ t.pendingBalance }}</span>
                <div class="amount-row">
                  <span class="currency">$</span>
                  <span class="amount-val">{{ totalAPagar.toFixed(2) }}</span>
                </div>
              </div>
              <span class="mensual-text">{{ plan?.nombre || '' }}</span>
            </div>

            <div class="payment-status-message" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>{{ t.paymentInfoMessage }}</p>
            </div>

            <button class="btn-primary" type="button" :disabled="cargando" @click="cargarMembresia">
              {{ t.refreshStatementBtn }}
            </button>
            <p class="cash-note">{{ t.cashNote }}</p>
          </section>
        </div>
      </div>
    </main>
  </HeadingMember>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.main-content {
  min-height: calc(100vh - 80px);
  background: transparent;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  padding: 24px 32px;
  position: relative;
}
.page-container { max-width: 1100px; margin: 0 auto; }

/* Encabezado */
.view-header { margin-bottom: 24px; }
.title { font-family: 'Anton', sans-serif; font-size: clamp(1.8rem, 5vw, 2.5rem); color: var(--color-titulos, #fff); margin: 0; letter-spacing: 1px; text-transform: uppercase; }
.highlight-text { color: var(--color-highlight, #3b82f6); }
.title-underline { display: block; width: 70px; height: 4px; margin: 6px 0 10px; border-radius: 4px; background: linear-gradient(90deg, var(--color-highlight, #3b82f6), transparent); }
.subtitle { font-size: 0.95rem; color: rgba(245, 245, 244, 0.85); margin: 0; line-height: 1.5; font-weight: 500; }

/* Estados de carga / error */
.state-message { padding: 16px 18px; border: 1px solid var(--border-line, rgba(255,255,255,.15)); border-radius: 12px; margin: 0 0 16px; }
.state-error { border-color: rgba(239, 68, 68, 0.45); color: #fca5a5; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.btn-retry { background: transparent; border: 1px solid currentColor; color: inherit; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }

/* Rejilla principal */
.membership-grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }

.status-card, .payment-card {
  background: var(--bg-cards, rgba(18, 18, 18, 0.85));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.15));
  border-radius: var(--app-border-radius, 24px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  position: relative;
}

/* Tarjeta de estado */
.status-card { padding: 32px 26px; display: flex; flex-direction: column; align-items: center; text-align: center; }

.avatar-ring-wrapper { position: relative; width: 160px; height: 160px; margin-bottom: 20px; }
.progress-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.progress-ring__bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 6; }
.progress-ring__value { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease, stroke 0.3s ease; }
.avatar-circle { position: absolute; inset: 10px; background: var(--bg-input, #09090b); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 0 25px rgba(59, 130, 246, 0.25); }
.avatar-real { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.avatar-initials { font-family: 'Anton', sans-serif; font-size: 2.4rem; color: var(--color-highlight, #3b82f6); letter-spacing: 1px; }

.member-name { font-size: 1.35rem; font-weight: 800; color: var(--color-titulos, #fff); margin: 0 0 6px; line-height: 1.2; letter-spacing: 0.5px; text-transform: uppercase; }
.user-id { margin: 0 0 16px; color: rgba(245, 245, 244, 0.9); font-weight: 700; font-size: 0.95rem; letter-spacing: 0.5px; }

.status-badge { padding: 8px 28px; border-radius: var(--app-border-radius, 20px); font-weight: 700; font-family: 'Oswald', sans-serif; font-size: 0.95rem; color: #fff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }

.review-pill { display: flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 16px; }

.dias-restantes { display: flex; flex-direction: column; align-items: center; margin-bottom: 14px; }
.dias-numero { font-family: 'Anton', sans-serif; font-size: 2.6rem; line-height: 1; }
.dias-label { font-family: 'Oswald', sans-serif; font-size: 0.9rem; color: rgba(245, 245, 244, 0.8); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }

.vencimiento-row { display: flex; align-items: center; gap: 8px; color: rgba(245, 245, 244, 0.85); font-size: 0.9rem; font-weight: 500; }
.vencimiento-row strong { color: #fff; font-weight: 700; }

/* Tarjeta de cuenta */
.payment-card { padding: 32px; display: flex; flex-direction: column; }

.account-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 26px; }
.account-info-grid.single { grid-template-columns: 1fr; }
.info-box-date { background: rgba(0, 0, 0, 0.35); border: 1px solid var(--border-line, rgba(255, 255, 255, 0.12)); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.highlight-box { border-color: rgba(59, 130, 246, 0.5); background: rgba(59, 130, 246, 0.08); }
.info-box-label { font-family: 'Oswald', sans-serif; font-size: 0.8rem; text-transform: uppercase; color: rgba(245, 245, 244, 0.75); letter-spacing: 0.5px; font-weight: 600; }
.info-box-val-row { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem; color: #fff; }
.info-box-val-row svg { color: var(--color-highlight, #3b82f6); flex-shrink: 0; }

.section-subtitle-small { font-family: 'Oswald', sans-serif; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; color: var(--color-highlight, #3b82f6); margin-bottom: 12px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; }
.subtitle-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-highlight, #3b82f6); box-shadow: 0 0 8px var(--color-highlight, #3b82f6); flex-shrink: 0; }

/* Plan: una sola tarjeta horizontal */
.plan-row { margin-bottom: 26px; }
.plan-chip { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(59, 130, 246, 0.1); border: 1px solid var(--color-highlight, #3b82f6); border-radius: var(--app-border-radius, 12px); padding: 16px 20px; }
.plan-nombre { font-size: 0.95rem; font-weight: 700; text-transform: uppercase; color: rgba(245, 245, 244, 0.9); letter-spacing: 0.5px; }
.plan-precio { font-family: 'Anton', sans-serif; font-size: 1.3rem; color: #fff; letter-spacing: 0.5px; }
.empty-note { margin: 0; color: rgba(245, 245, 244, 0.7); font-size: 0.9rem; }

/* Resumen de cuenta */
.account-statement-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.statement-title { font-family: 'Oswald', sans-serif; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; color: var(--color-highlight, #3b82f6); letter-spacing: 0.5px; }
.badge-pending, .badge-ok { padding: 3px 10px; border-radius: 6px; font-size: 0.8rem; font-family: 'Oswald', sans-serif; font-weight: 700; }
.badge-pending { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
.badge-ok { background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); }

.styled-box { background: rgba(0, 0, 0, 0.35); border: 1px solid var(--border-line, rgba(255, 255, 255, 0.12)); border-radius: var(--app-border-radius, 14px); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.amount-info { display: flex; flex-direction: column; gap: 2px; }
.amount-label { font-family: 'Oswald', sans-serif; font-size: 0.85rem; text-transform: uppercase; color: rgba(245, 245, 244, 0.75); letter-spacing: 0.5px; }
.amount-row { display: flex; align-items: flex-start; gap: 4px; }
.currency { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--color-highlight, #3b82f6); margin-top: 2px; }
.amount-val { font-family: 'Anton', sans-serif; font-size: 2rem; color: #fff; line-height: 1; letter-spacing: 1px; }
.mensual-text { font-size: 0.85rem; font-weight: 600; color: rgba(245, 245, 244, 0.7); text-transform: uppercase; text-align: right; }

/* Mensaje informativo */
.payment-status-message { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: rgba(59, 130, 246, 0.07); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; margin-bottom: 18px; }
.payment-status-message svg { color: var(--color-highlight, #3b82f6); flex-shrink: 0; margin-top: 2px; }
.payment-status-message p { margin: 0; font-size: 0.9rem; line-height: 1.55; color: rgba(245, 245, 244, 0.9); }

/* Botón y nota */
.btn-primary { width: 100%; background: var(--color-highlight, #3b82f6); color: #fff; border: none; border-radius: 12px; padding: 14px; font-family: 'Oswald', sans-serif; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: filter 0.2s ease, opacity 0.2s ease; }
.btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:focus-visible, .btn-retry:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.cash-note { font-size: 0.8rem; color: rgba(245, 245, 244, 0.6); text-align: center; margin: 16px 0 0; line-height: 1.4; }

/* Notificaciones centradas */
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

/* Responsivo */
@media (max-width: 900px) {
  .membership-grid { grid-template-columns: 1fr; gap: 16px; }
}
@media (max-width: 600px) {
  .main-content { padding: 16px 12px; }
  .status-card, .payment-card { padding: 20px 16px; }
  .account-info-grid { grid-template-columns: 1fr; gap: 10px; }
  .member-name { font-size: 1.2rem; }
  .plan-chip { flex-direction: column; align-items: flex-start; }
  .styled-box { flex-direction: column; align-items: flex-start; }
  .mensual-text { text-align: left; }
}
</style>