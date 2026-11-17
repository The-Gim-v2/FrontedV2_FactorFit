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
onMounted(() => window.addEventListener('idioma-changed', handleLangChange));
onUnmounted(() => window.removeEventListener('idioma-changed', handleLangChange));

const traducciones = {
  es: {
    pageTitlePrefix: 'Portal de',
    pageTitleHighlight: 'Pagos',
    pageSubtitle: 'Realiza el pago de tu membresía de forma rápida, segura y mantén tu cuenta al día.',
    statusActive: 'ACTIVA',
    statusExpiringSoon: 'POR VENCER',
    statusExpired: 'VENCIDA',
    daysRemaining: 'días restantes',
    daysOverdue: 'días de atraso',
    dueDate: 'Vence el',
    reviewPill: 'Transferencia en revisión',
    choosePlan: '1. Selecciona tu plan de pago',
    save: 'AHORRA',
    totalToPay: 'Total a pagar',
    surcharge: 'recargo por atraso',
    paymentMethod: '2. Elige tu método de pago',
    selectOption: 'Selecciona una opción',
    cardOption: 'Tarjeta de crédito / débito',
    transferOption: 'Transferencia bancaria',
    cardNumberLabel: 'Número de tarjeta',
    expiryLabel: 'Vencimiento (MM/AA)',
    cvvLabel: 'CVV / CVC',
    viewBankDetailsBtn: 'Ver datos bancarios para depósito',
    bankDetailsTitle: 'Datos bancarios',
    bankDetailsSubtitle: 'Realiza tu depósito o transferencia a la siguiente cuenta',
    bankNameLabel: 'Banco',
    accountHolderLabel: 'Titular de la cuenta',
    accountNumberLabel: 'Número de cuenta',
    clabeLabel: 'CLABE interbancaria',
    conceptLabel: 'Concepto de pago',
    copyBtn: 'Copiar',
    copiedToast: 'Copiado al portapapeles',
    closeBtn: 'Cerrar',
    gotItBtn: 'Ya realicé la transferencia',
    transferReferenceLabel: 'Número de folio o referencia',
    transferReferencePlaceholder: 'Ej. 00123456',
    transferNote: 'Importante: Después de realizar tu transferencia, ingresa el folio o número de autorización para agilizar la validación por parte de administración.',
    submitTransferBtn: 'Enviar comprobante de pago',
    payButton: 'Pagar membresía ahora',
    processingLabel: 'Procesando pago seguro…',
    selectPaymentTypeError: 'Selecciona un método de pago',
    formInvalidError: 'Por favor verifica que los datos de tu tarjeta estén completos y correctos',
    folioRequiredError: 'Ingresa el número de folio de tu transferencia',
    paymentConfirmedToast: '¡Pago confirmado con éxito!',
    transferPendingToast: 'Comprobante enviado. Tu pago se encuentra en proceso de verificación.',
    cashNote: '¿Prefieres efectivo? Los pagos en efectivo se reciben directamente en recepción del centro deportivo.',
    accountStatement: 'Resumen de Cuenta',
    nextCut: 'Próximo Corte',
    newCut: 'Nuevo Corte (Al Pagar)',
    pendingBalance: 'Saldo Pendiente',
  },
  en: {
    pageTitlePrefix: 'Payment',
    pageTitleHighlight: 'Portal',
    pageSubtitle: 'Pay your membership quickly, securely, and keep your account up to date.',
    statusActive: 'ACTIVE',
    statusExpiringSoon: 'EXPIRING SOON',
    statusExpired: 'EXPIRED',
    daysRemaining: 'days remaining',
    daysOverdue: 'days overdue',
    dueDate: 'Due on',
    reviewPill: 'Transfer under review',
    choosePlan: '1. Select your payment plan',
    save: 'SAVE',
    totalToPay: 'Total to pay',
    surcharge: 'late fee',
    paymentMethod: '2. Choose your payment method',
    selectOption: 'Select an option',
    cardOption: 'Credit / debit card',
    transferOption: 'Bank transfer',
    cardNumberLabel: 'Card number',
    expiryLabel: 'Expiry (MM/YY)',
    cvvLabel: 'CVV / CVC',
    viewBankDetailsBtn: 'View bank details for deposit',
    bankDetailsTitle: 'Bank details',
    bankDetailsSubtitle: 'Make your deposit or transfer to the following account',
    bankNameLabel: 'Bank',
    accountHolderLabel: 'Account holder',
    accountNumberLabel: 'Account number',
    clabeLabel: 'CLABE / IBAN',
    conceptLabel: 'Reference concept',
    copyBtn: 'Copy',
    copiedToast: 'Copied to clipboard',
    closeBtn: 'Close',
    gotItBtn: 'I have made the transfer',
    transferReferenceLabel: 'Transfer reference or folio',
    transferReferencePlaceholder: 'e.g. 00123456',
    transferNote: 'Important: After making your transfer, enter the reference folio so administration can quickly verify your payment.',
    submitTransferBtn: 'Submit proof of payment',
    payButton: 'Pay membership now',
    processingLabel: 'Processing secure payment…',
    selectPaymentTypeError: 'Select a payment method',
    formInvalidError: 'Please check that your card details are complete and correct',
    folioRequiredError: 'Enter your transfer reference folio',
    paymentConfirmedToast: 'Payment successfully confirmed!',
    transferPendingToast: 'Proof submitted. Your payment is pending verification.',
    cashNote: 'Prefer cash? Cash payments are accepted directly at the facility reception desk.',
    accountStatement: 'Account Summary',
    nextCut: 'Next Cut',
    newCut: 'New Cut (Upon Payment)',
    pendingBalance: 'Pending Balance',
  },
};

const t = computed(() => traducciones[currentLang.value] || traducciones.es);
const toastRef = ref(null);

const socio = reactive({ nombre: '', apellido: '', id: '', foto: null });
const iniciales = computed(() => socio.nombre.trim().slice(0, 1).toUpperCase() + socio.apellido.trim().slice(0, 1).toUpperCase());
const cargando = ref(true);
const errorApi = ref('');
const fechaVencimiento = ref(null);
const diasRestantes = ref(null);
const saldoPendiente = ref(0);
const planReal = ref('');
const precioReal = ref(null);
const estadoRegistrado = ref('');
const transferenciaEnRevision = ref(false);
const localeActual = computed(() => currentLang.value === 'en' ? 'en-US' : 'es-MX');
const fechaFormateada = computed(() => fechaVencimiento.value ? new Date(fechaVencimiento.value + 'T12:00:00').toLocaleDateString(localeActual.value, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const estadoMembresia = computed(() => {
  if (diasRestantes.value === null) return { label: 'SIN DATOS', color: '#94a3b8' };
  if (diasRestantes.value < 0 || /inactivo|vencid/i.test(estadoRegistrado.value)) return { label: t.value.statusExpired, color: '#ef4444' };
  if (diasRestantes.value <= 5) return { label: t.value.statusExpiringSoon, color: '#f59e0b' };
  return { label: t.value.statusActive, color: '#4ade80' };
});
const RADIO = 54;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
const dashOffset = computed(() => CIRCUNFERENCIA * (1 - (diasRestantes.value === null ? 0 : Math.min(1, Math.max(0, diasRestantes.value / 30)))));
const planes = computed(() => precioReal.value === null ? [] : [{ id: 'registrado', nombre: planReal.value || 'Plan registrado', precio: precioReal.value, ahorro: null }]);
const planSeleccionado = ref('registrado');
const plan = computed(() => planes.value[0] || null);
const totalAPagar = computed(() => saldoPendiente.value);
const recargoPorVencida = computed(() => 0);
const nuevoCorteCalculado = computed(() => '—');
const tipoPago = ref('');
const procesando = ref(false);
const modalDatosBancarios = ref(false);
const datosBancarios = computed(() => null);
const folioTransferencia = ref('');
const formularioTarjetaValido = computed(() => false);
const numeroTarjetaFormateado = ref('');
const vencimientoTarjetaFormateado = ref('');
const cvvTarjeta = ref('');
const seleccionarPlan = () => {};
const copiarDato = () => {};
const pagarConTarjeta = () => toastRef.value?.notify('El pago con tarjeta no está disponible hasta integrar Stripe Checkout.', 'warning');
const enviarComprobanteTransferencia = () => toastRef.value?.notify('Las transferencias deben verificarse en recepción. No se ha registrado ningún pago.', 'warning');
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
    transferenciaEnRevision.value = Array.isArray(datos.pagos) && datos.pagos.some(p => p.estado === 'pendiente');
  } catch (e) {
    errorApi.value = e?.message || 'No fue posible consultar la membresía.';
    toastRef.value?.notify(errorApi.value, 'error');
  } finally { cargando.value = false; }
}
onMounted(() => { void cargarMembresia(); window.addEventListener('focus', cargarMembresia); });
onUnmounted(() => window.removeEventListener('focus', cargarMembresia));
</script>

<template>
  <HeadingMember>
    <NotificationSystem ref="toastRef" />

    <main class="main-content">
      <div class="page-container">

        <div class="view-header-flex">
          <div class="view-header">
            <h1 class="title">{{ t.pageTitlePrefix }} <span class="highlight-text">{{ t.pageTitleHighlight }}</span></h1>
            <span class="title-underline"></span>
            <p class="subtitle">{{ t.pageSubtitle }}</p>
          </div>
        </div>

        <p v-if="cargando" role="status">Cargando membresía…</p>
        <p v-if="errorApi" role="alert">{{ errorApi }} <button type="button" @click="cargarMembresia">Reintentar</button></p>
        <div v-if="!cargando && !errorApi" class="membership-grid">

          <!-- Columna Izquierda: Estado del Atleta -->
          <div id="tutorial-member-status-card" class="status-card">
            <div class="avatar-ring-wrapper">
              <svg class="progress-ring" viewBox="0 0 120 120">
                <circle class="progress-ring__bg" cx="60" cy="60" r="54" />
                <circle
                  class="progress-ring__value"
                  cx="60" cy="60" r="54"
                  :style="{
                    stroke: estadoMembresia.color,
                    strokeDasharray: `${2 * Math.PI * 54}px`,
                    strokeDashoffset: `${dashOffset}px`
                  }"
                />
              </svg>
              <div class="avatar-circle">
                <img v-if="socio.foto" :src="socio.foto" alt="Foto del miembro" class="avatar-real" @error="socio.foto = null" />
                <span v-else class="avatar-initials">{{ iniciales }}</span>
              </div>
            </div>

            <h2 class="member-name">{{ socio.nombre }} <span class="highlight-text">{{ socio.apellido }}</span></h2>
            <p class="user-id">ID: {{ socio.id }}</p>

            <div class="status-badge" :style="{ background: estadoMembresia.color }">
              {{ estadoMembresia.label }}
            </div>

            <div v-if="transferenciaEnRevision" class="review-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ t.reviewPill }}
            </div>

            <div class="dias-restantes">
              <span class="dias-numero" :style="{ color: estadoMembresia.color }">
                {{ diasRestantes === null ? "—" : Math.abs(diasRestantes) }}
              </span>
              <span class="dias-label">{{ diasRestantes >= 0 ? t.daysRemaining : t.daysOverdue }}</span>
            </div>

            <div class="vencimiento-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ t.dueDate }} <strong>{{ fechaFormateada }}</strong></span>
            </div>
          </div>

          <!-- Columna Derecha: Panel de Transacción y Pagos -->
          <div class="payment-card">

            <!-- Fechas de Corte -->
            <div id="tutorial-billing-cuts" class="account-info-grid">
              <div class="info-box-date">
                <span class="info-box-label">{{ t.nextCut }}</span>
                <div class="info-box-val-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{{ fechaFormateada }}</span>
                </div>
              </div>
              <div class="info-box-date highlight-box">
                <span class="info-box-label">{{ t.newCut }}</span>
                <div class="info-box-val-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  <span>{{ nuevoCorteCalculado }}</span>
                </div>
              </div>
            </div>

            <!-- Plan y adeudo reales: no se capturan tarjetas ni se simulan transacciones -->
            <div class="section-subtitle-small"><span class="subtitle-dot"></span>Plan registrado en el gimnasio</div>
            <div id="tutorial-payment-plans" class="planes-grid">
              <div v-if="plan" class="plan-chip active"><span class="plan-nombre">{{ plan.nombre }}</span><span class="plan-precio">${{ plan.precio.toFixed(2) }} MXN</span></div>
              <p v-else>Sin tarifa registrada.</p>
            </div>
            <div class="account-statement-header"><span class="statement-title">{{ t.accountStatement }}</span><span v-if="saldoPendiente > 0" class="badge-pending">{{ t.pendingBalance }}: ${{ saldoPendiente.toFixed(2) }}</span></div>
            <div id="tutorial-account-summary" class="styled-box"><div class="amount-info"><span class="amount-label">Saldo pendiente registrado</span><div class="amount-row"><span class="currency">$</span><span class="amount-val">{{ totalAPagar.toFixed(2) }}</span></div></div><div class="recargo-container"><span class="mensual-text">{{ plan?.nombre || 'Sin plan registrado' }}</span></div></div>
            <div class="payment-status-message" role="status">
              Los pagos deben realizarse mediante los métodos autorizados por tu gimnasio. Esta pantalla consulta PostgreSQL y no procesa tarjetas ni confirma transferencias.
            </div>
            <button class="btn-primary" type="button" :disabled="cargando" @click="cargarMembresia">Actualizar estado de cuenta</button>
            <p class="cash-note">{{ t.cashNote }}</p>
          </div>
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

.view-header-flex { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.view-header { flex: 1; min-width: 240px; }
.title { font-family: 'Anton', sans-serif; font-size: clamp(1.8rem, 5vw, 2.5rem); color: var(--color-titulos, #fff); margin: 0; letter-spacing: 1px; text-transform: uppercase; }
.highlight-text { color: var(--color-highlight, #3b82f6); }
.title-underline {
  display: block;
  width: 70px;
  height: 4px;
  margin: 6px 0 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-highlight, #3b82f6), transparent);
}
.subtitle { font-size: 0.95rem; color: rgba(245, 245, 244, 0.85); margin: 0; line-height: 1.5; font-weight: 500; }

@keyframes floatCard {
  0% { transform: translateY(0px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.1); }
  50% { transform: translateY(-8px); box-shadow: 0 25px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(59, 130, 246, 0.2); }
  100% { transform: translateY(0px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.1); }
}

.membership-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  align-items: start;
}

.status-card, .payment-card {
  background: var(--bg-cards, rgba(18, 18, 18, 0.85));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.15));
  border-radius: var(--app-border-radius, 24px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  position: relative;
}

.status-card {
  padding: 32px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: floatCard 4s ease-in-out infinite;
  will-change: transform;
}

.avatar-ring-wrapper { position: relative; width: 160px; height: 160px; margin-bottom: 20px; }
.progress-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.progress-ring__bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 6; }
.progress-ring__value { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease, stroke 0.3s ease; }

.avatar-circle {
  position: absolute;
  top: 10px; left: 10px; right: 10px; bottom: 10px;
  background: var(--bg-input, #09090b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.25);
}
.avatar-initials { font-family: 'Anton', sans-serif; font-size: 2.4rem; color: var(--color-highlight, #3b82f6); letter-spacing: 1px; }

.member-name { 
  font-family: 'Inter', sans-serif; 
  font-size: 1.35rem; 
  font-weight: 800;
  color: var(--color-titulos, #fff); 
  margin: 0 0 6px 0; 
  line-height: 1.2; 
  letter-spacing: 0.5px; 
  text-transform: uppercase; 
}
.user-id { margin: 0 0 16px 0; color: rgba(245, 245, 244, 0.9); font-weight: 700; font-size: 0.95rem; letter-spacing: 0.5px; }

.status-badge {
  padding: 8px 28px;
  border-radius: var(--app-border-radius, 20px);
  font-weight: 700;
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  color: #ffffff;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.review-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 16px;
}

.dias-restantes { display: flex; flex-direction: column; align-items: center; margin-bottom: 14px; }
.dias-numero { font-family: 'Anton', sans-serif; font-size: 2.6rem; line-height: 1; }
.dias-label { font-family: 'Oswald', sans-serif; font-size: 0.9rem; color: rgba(245, 245, 244, 0.8); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }

.vencimiento-row { display: flex; align-items: center; gap: 8px; color: rgba(245, 245, 244, 0.85); font-size: 0.9rem; font-weight: 500; }
.vencimiento-row strong { color: #fff; font-weight: 700; }

.payment-card { padding: 32px; }

.account-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 22px;
}
.info-box-date {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.highlight-box {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.08);
}
.info-box-label {
  font-family: 'Oswald', sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: rgba(245, 245, 244, 0.75);
  letter-spacing: 0.5px;
  font-weight: 600;
}
.info-box-val-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
}
.info-box-val-row svg { color: var(--color-highlight, #3b82f6); flex-shrink: 0; }

.account-statement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.statement-title {
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-highlight, #3b82f6);
  letter-spacing: 0.5px;
}
.badge-pending {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
}

.section-subtitle-small {
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-highlight, #3b82f6);
  margin-bottom: 14px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.subtitle-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-highlight, #3b82f6); box-shadow: 0 0 8px var(--color-highlight, #3b82f6); flex-shrink: 0; }

.planes-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }

.plan-chip {
  position: relative;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.12));
  border-radius: var(--app-border-radius, 12px);
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-texto-general, #f5f5f4);
}
.plan-chip:hover { border-color: var(--color-highlight, #3b82f6); }
.plan-chip.active { border-color: var(--color-highlight, #3b82f6); background: rgba(59, 130, 246, 0.1); }
.plan-tag {
  position: absolute;
  top: -8px;
  background: var(--color-highlight, #3b82f6);
  color: #fff;
  font-size: 0.65rem;
  font-family: 'Oswald', sans-serif;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  font-weight: 700;
  text-transform: uppercase;
}
.plan-nombre { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: rgba(245, 245, 244, 0.8); }
.plan-precio { font-family: 'Anton', sans-serif; font-size: 1.15rem; color: #fff; letter-spacing: 0.5px; }

/* Caja de Total a Pagar */
.styled-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.12));
  border-radius: var(--app-border-radius, 14px);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}
.amount-info { display: flex; flex-direction: column; gap: 2px; }
.amount-label { font-family: 'Oswald', sans-serif; font-size: 0.85rem; text-transform: uppercase; color: rgba(245, 245, 244, 0.75); letter-spacing: 0.5px; }
.amount-row { display: flex; align-items: flex-start; gap: 4px; }
.currency { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--color-highlight, #3b82f6); margin-top: 2px; }
.amount-val { font-family: 'Anton', sans-serif; font-size: 2rem; color: #fff; line-height: 1; letter-spacing: 1px; }
.recargo-container { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.red { color: #f87171; font-size: 0.8rem; font-weight: 700; font-family: 'Oswald', sans-serif; text-transform: uppercase; }
.mensual-text { font-size: 0.85rem; font-weight: 600; color: rgba(245, 245, 244, 0.7); text-transform: uppercase; }

/* Grupos de Inputs y Select */
.input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.input-group label { font-family: 'Oswald', sans-serif; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; color: var(--color-highlight, #3b82f6); letter-spacing: 0.5px; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: rgba(245, 245, 244, 0.4); pointer-events: none; }
.select-wrapper-container { position: relative; width: 100%; }
.custom-select {
  width: 100%;
  background: var(--bg-input, #09090b);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.15));
  border-radius: 12px;
  padding: 12px 14px 12px 44px;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.custom-select:focus { outline: none; border-color: var(--color-highlight, #3b82f6); }
.select-arrow { position: absolute; right: 14px; color: rgba(245, 245, 244, 0.5); pointer-events: none; }

.card-fields { display: flex; flex-direction: column; gap: 14px; animation: fadeIn 0.3s ease; }
.input-with-icon-simple input { padding-left: 44px !important; }
.payment-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.card-fields input {
  width: 100%;
  background: var(--bg-input, #09090b);
  border: 1px solid var(--border-line, rgba(255, 255, 255, 0.15));
  border-radius: 12px;
  padding: 12px 14px;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
}
.card-fields input:focus { outline: none; border-color: var(--color-highlight, #3b82f6); }

.btn-bank-details {
  background: rgba(59, 130, 246, 0.1);
  border: 1px dashed var(--color-highlight, #3b82f6);
  color: var(--color-highlight, #3b82f6);
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease;
}
.btn-bank-details:hover { background: rgba(59, 130, 246, 0.2); }
.transfer-note { font-size: 0.8rem; color: rgba(245, 245, 244, 0.7); line-height: 1.4; margin: 0; }
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
.action-buttons { display: flex; gap: 12px; margin-top: 6px; }
.btn-primary {
  flex: 1;
  background: var(--color-highlight, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
}
.btn-primary:hover:not(.disabled) { background: #2563eb; }
.btn-primary.disabled { opacity: 0.5; cursor: not-allowed; }

.cash-note { font-size: 0.8rem; color: rgba(245, 245, 244, 0.6); text-align: center; margin-top: 18px; line-height: 1.4; }

/* Modal de Datos Bancarios */
.modal-wrapper {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.bank-modal {
  background: var(--bg-cards, #121212);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.2));
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bank-modal-title { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: #fff; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
.bank-modal-subtitle { font-size: 0.85rem; color: rgba(245, 245, 244, 0.75); margin: 0 0 4px 0; line-height: 1.4; }
.bank-field {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bank-field-info { display: flex; flex-direction: column; gap: 2px; }
.bank-field-label { font-size: 0.75rem; font-family: 'Oswald', sans-serif; text-transform: uppercase; color: rgba(245, 245, 244, 0.6); letter-spacing: 0.5px; }
.bank-field-value { font-size: 0.95rem; font-weight: 600; color: #fff; }
.bank-field-value.mono { font-family: monospace; letter-spacing: 1px; color: var(--color-highlight, #3b82f6); }
.btn-copy {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: var(--color-highlight, #3b82f6);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn-copy:hover { background: rgba(59, 130, 246, 0.3); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pop {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.pop-enter-active { animation: pop 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.pop-leave-active { animation: pop 0.2s reverse ease-in; }

/* Estilos responsivos */
@media (max-width: 900px) {
  .membership-grid { grid-template-columns: 1fr; }
  .status-card { animation: none; }
}

@media (max-width: 600px) {
  .main-content { padding: 16px 12px; }
  .payment-card { padding: 20px 16px; }
  .planes-grid { grid-template-columns: repeat(2, 1fr); }
  .account-info-grid { grid-template-columns: 1fr; }
  .member-name { font-size: 1.2rem; }
}
/* =========================================
   ESTILOS RESPONSIVOS PARA MÓVIL
   ========================================= */

@media (max-width: 768px) {
  .main-content {
    padding: 16px 12px;
  }

  /* La rejilla principal pasa a una sola columna */
  .membership-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* Reducir padding de las tarjetas principales en móvil */
  .status-card, .payment-card {
    padding: 20px 16px;
  }

  /* El selector de planes pasa a 2 columnas en lugar de 4 */
  .planes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  /* Las fechas de corte se acomodan mejor */
  .account-info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  /* En pantallas muy pequeñas, los planes pasan a 1 columna o mantienen 2 compactas */
  .planes-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-details-grid {
    grid-template-columns: 1fr;
  }
}

.avatar-real { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.payment-status-message { padding: 16px; border: 1px solid rgba(255,255,255,.15); border-radius: 12px; margin: 18px 0; line-height: 1.6; }
</style>