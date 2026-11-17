<script setup>
import { ref, computed } from 'vue';
import { useLang } from '../useLang.js';

const props = defineProps({
  visible: { type: Boolean, default: false },
  pago: { type: Object, default: null },
  gimnasio: { type: Object, default: () => ({}) },
  locale: { type: String, default: 'es-MX' }
});

const emit = defineEmits(['close', 'notify']);
const reciboRef = ref(null);
const modalContentRef = ref(null);
const generando = ref(false);
const logoRoto = ref(false);

const { lang } = useLang();

/* ---------------- TEXTOS ---------------- */
const traducciones = {
  es: {
    modalTitle: 'Recibo de pago',
    modalSubtitle: 'Comprobante de transacción',
    receiptPreview: 'VISTA PREVIA',
    subTitle: 'COMPROBANTE DE PAGO',
    date: 'Fecha',
    time: 'Hora',
    operationNum: 'Folio',
    client: 'Cliente',
    registeredBy: 'Registrado por',
    atReception: 'Recepción',
    registeredPayment: 'Pago registrado',
    paymentMethod: 'Método de pago',
    status: 'Estado',
    paid: 'PAGO CONFIRMADO',
    paidSub: 'Registrado en el sistema',
    conceptPlan: 'CONCEPTO / PLAN',
    amount: 'IMPORTE',
    monthly: 'Mensualidad',
    monthlySurcharge: 'Mensualidad + recargo',
    membership: 'Membresía',
    subtotal: 'Subtotal',
    vat: 'IVA (0%)',
    totalAmount: 'TOTAL PAGADO',
    authCode: 'REFERENCIA REGISTRADA',
    footer1: 'Conserve este comprobante para cualquier aclaración.',
    footer2: 'Gracias por su preferencia.',
    genPng: 'Generando recibo PNG...',
    genPdf: 'Generando recibo PDF...',
    successPng: 'Recibo descargado con éxito',
    successPdf: 'Recibo PDF descargado con éxito',
    errorPng: 'No se pudo generar la imagen del recibo. Intenta de nuevo.',
    errorPdf: 'No se pudo generar el PDF del recibo. Intenta de nuevo.',
    btnPng: 'Descargar PNG',
    btnPdf: 'Descargar PDF',
    btnClose: 'Cerrar',
    generating: 'Generando…',
    downloadAs: 'DESCARGAR COMPROBANTE',
    image: 'Imagen',
    document: 'Documento',
    paymentInformation: 'INFORMACIÓN DEL PAGO',
    paymentDetail: 'DETALLE',
    closeLabel: 'Cerrar'
  },
  en: {
    modalTitle: 'Payment receipt',
    modalSubtitle: 'Transaction receipt',
    receiptPreview: 'PREVIEW',
    subTitle: 'PAYMENT RECEIPT',
    date: 'Date',
    time: 'Time',
    operationNum: 'Reference',
    client: 'Client',
    registeredBy: 'Registered by',
    atReception: 'Front desk',
    registeredPayment: 'Registered payment',
    paymentMethod: 'Payment method',
    status: 'Status',
    paid: 'PAYMENT CONFIRMED',
    paidSub: 'Recorded in the system',
    conceptPlan: 'CONCEPT / PLAN',
    amount: 'AMOUNT',
    monthly: 'Monthly fee',
    monthlySurcharge: 'Monthly fee + late fee',
    membership: 'Membership',
    subtotal: 'Subtotal',
    vat: 'VAT (0%)',
    totalAmount: 'TOTAL PAID',
    authCode: 'REGISTERED REFERENCE',
    footer1: 'Keep this receipt for any inquiries.',
    footer2: 'Thank you for your preference.',
    genPng: 'Generating PNG receipt...',
    genPdf: 'Generating PDF receipt...',
    successPng: 'Receipt downloaded successfully',
    successPdf: 'PDF receipt downloaded successfully',
    errorPng: 'We could not generate the receipt image. Please try again.',
    errorPdf: 'We could not generate the receipt PDF. Please try again.',
    btnPng: 'Download PNG',
    btnPdf: 'Download PDF',
    btnClose: 'Close',
    generating: 'Generating…',
    downloadAs: 'DOWNLOAD RECEIPT',
    image: 'Image',
    document: 'Document',
    paymentInformation: 'PAYMENT INFORMATION',
    paymentDetail: 'DETAILS',
    closeLabel: 'Close'
  }
};

const t = computed(() => traducciones[lang.value] || traducciones.es);

/* ---------------- DATOS DEL RECIBO ---------------- */
const gymNombre = computed(() => props.gimnasio?.nombre || 'Gimnasio');
const gymLogo = computed(() => (logoRoto.value ? '' : props.gimnasio?.logo_url || ''));
const inicialGym = computed(() => gymNombre.value.trim().charAt(0).toUpperCase() || 'G');

const folioRecibo = computed(() => String(props.pago?.folio || '').trim() || '—');
const folioCorto = computed(() => {
  const f = folioRecibo.value;
  if (f.length <= 14) return f;
  const prefijo = f.includes('-') ? f.split('-')[0] + '-' : '';
  return `${prefijo}…${f.slice(-6)}`;
});

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(`${iso}T12:00:00`).toLocaleDateString(props.locale, {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const horaPago = computed(() => {
  const value = String(props.pago?.fecha_hora || '');
  const match = value.match(/(?:T|\s)(\d{2}:\d{2}(?::\d{2})?)/);
  return match ? match[1] : '—';
});

const montoFormateado = computed(() =>
  new Intl.NumberFormat(props.locale || 'es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(props.pago?.monto) || 0)
);

const conceptoTexto = computed(() => {
  const c = props.pago?.concepto;
  if (c === 'monthly' || c === 'Mensualidad') return t.value.monthly;
  if (c === 'monthlySurcharge') return t.value.monthlySurcharge;
  return t.value.membership;
});

const metodoTexto = computed(() => {
  const metodo = props.pago?.metodo;
  if (!metodo) return '—';
  if (lang.value === 'en') {
    return { Efectivo: 'Cash', Transferencia: 'Bank transfer', Tarjeta: 'Card' }[metodo] || metodo;
  }
  return metodo;
});

const registradoPor = computed(() =>
  props.pago?.registradoPorStaff ? t.value.atReception : t.value.registeredPayment
);

const nombreArchivo = computed(() => {
  const f = folioRecibo.value;
  return `Ticket_${f === '—' ? 'pago' : f}`;
});

const cerrar = () => {
  if (generando.value) return;
  emit('close');
};

/* ---------------- CAPTURA ---------------- */
const liberarRecorteParaCaptura = async () => {
  const el = reciboRef.value;
  const contenedor = modalContentRef.value;
  if (!el) return () => {};

  const original = {
    elOverflow: el.style.overflow,
    elMaxHeight: el.style.maxHeight,
    contOverflow: contenedor?.style.overflow,
    contMaxHeight: contenedor?.style.maxHeight
  };

  el.style.overflow = 'visible';
  el.style.maxHeight = 'none';
  if (contenedor) {
    contenedor.style.overflow = 'visible';
    contenedor.style.maxHeight = 'none';
  }

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await new Promise((resolve) => setTimeout(resolve, 50));

  return () => {
    el.style.overflow = original.elOverflow;
    el.style.maxHeight = original.elMaxHeight;
    if (contenedor) {
      contenedor.style.overflow = original.contOverflow;
      contenedor.style.maxHeight = original.contMaxHeight;
    }
  };
};

const capturarTicketCompleto = async () => {
  const html2canvas = (await import('html2canvas')).default;
  const el = reciboRef.value;
  if (!el) throw new Error('Receipt element not found');
  const restaurar = await liberarRecorteParaCaptura();
  try {
    return await html2canvas(el, {
      scale: 2.5,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    });
  } finally {
    restaurar();
  }
};

const descargarPng = async () => {
  if (!props.pago?.pago_confirmado) return;
  if (!reciboRef.value || generando.value) return;
  generando.value = true;
  emit('notify', { message: t.value.genPng, type: 'info' });

  try {
    const canvas = await capturarTicketCompleto();
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${nombreArchivo.value}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    emit('notify', { message: t.value.successPng, type: 'success' });
  } catch (error) {
    console.error('Error al generar PNG:', error);
    emit('notify', { message: t.value.errorPng, type: 'error' });
  } finally {
    generando.value = false;
  }
};

const descargarPdf = async () => {
  if (!props.pago?.pago_confirmado) return;
  if (!reciboRef.value || generando.value) return;
  generando.value = true;
  emit('notify', { message: t.value.genPdf, type: 'info' });

  try {
    const canvas = await capturarTicketCompleto();
    const { jsPDF } = await import('jspdf');
    const anchoMm = 80;
    const altoMm = (canvas.height * anchoMm) / canvas.width;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [anchoMm, altoMm] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, anchoMm, altoMm);
    pdf.save(`${nombreArchivo.value}.pdf`);
    emit('notify', { message: t.value.successPdf, type: 'success' });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    emit('notify', { message: t.value.errorPdf, type: 'error' });
  } finally {
    generando.value = false;
  }
};
</script>

<template>
  <div v-if="visible && pago?.pago_confirmado" class="modal-overlay" @click.self="cerrar">
    <div ref="modalContentRef" class="modal-shell" role="dialog" aria-modal="true" :aria-label="t.modalTitle">

      <!-- Cabecera del modal -->
      <header class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 2h12a2 2 0 0 1 2 2v18l-4-2-4 2-4-2-4 2V4a2 2 0 0 1 2-2Z" />
              <path d="M8 7h8" />
              <path d="M8 11h8" />
            </svg>
          </div>
          <div>
            <h3>{{ t.modalTitle }}</h3>
            <p>{{ t.modalSubtitle }}</p>
          </div>
        </div>
        <button type="button" class="close-button" :disabled="generando" :aria-label="t.closeLabel" @click="cerrar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <!-- Vista previa -->
      <div class="receipt-viewport">
        <div ref="reciboRef" class="receipt">

          <!-- Encabezado del recibo -->
          <header class="receipt-header">
            <div class="receipt-brand">
              <div class="brand-mark">
                <img v-if="gymLogo" :src="gymLogo" :alt="gymNombre" crossorigin="anonymous" class="gym-logo" @error="logoRoto = true" />
                <span v-else>{{ inicialGym }}</span>
              </div>
              <div class="brand-copy">
                <strong>{{ gymNombre }}</strong>
                <span>{{ t.subTitle }}</span>
              </div>
            </div>
            <div class="receipt-type">
              <span>{{ t.operationNum }}</span>
              <strong>#{{ folioCorto }}</strong>
            </div>
          </header>

          <!-- Estado -->
          <div class="receipt-status">
            <div class="status-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>
            <div class="status-copy">
              <strong>{{ t.paid }}</strong>
              <span>{{ t.paidSub }}</span>
            </div>
          </div>

          <!-- Fecha, hora, método -->
          <div class="receipt-meta">
            <div>
              <span>{{ t.date }}</span>
              <strong>{{ formatFecha(pago?.fecha) }}</strong>
            </div>
            <div>
              <span>{{ t.time }}</span>
              <strong>{{ horaPago }}</strong>
            </div>
            <div>
              <span>{{ t.paymentMethod }}</span>
              <strong>{{ metodoTexto }}</strong>
            </div>
          </div>

          <!-- Información -->
          <section class="receipt-section">
            <div class="section-label">{{ t.paymentInformation }}</div>
            <div class="information-list">
              <div class="information-row">
                <span>{{ t.operationNum }}</span>
                <strong class="mono">{{ folioRecibo }}</strong>
              </div>
              <div class="information-row">
                <span>{{ t.client }}</span>
                <strong>{{ pago?.cliente || '—' }}</strong>
              </div>
              <div class="information-row">
                <span>{{ t.registeredBy }}</span>
                <strong>{{ registradoPor }}</strong>
              </div>
            </div>
          </section>

          <!-- Detalle -->
          <section class="receipt-section">
            <div class="section-label">{{ t.paymentDetail }}</div>
            <div class="concept-header">
              <span>{{ t.conceptPlan }}</span>
              <span>{{ t.amount }}</span>
            </div>
            <div class="concept-row">
              <div>
                <strong>{{ conceptoTexto }}</strong>
                <span>{{ pago?.plan || '—' }}</span>
              </div>
              <strong class="concept-amount mono">${{ montoFormateado }}</strong>
            </div>
          </section>

          <!-- Totales -->
          <section class="totals-section">
            <div class="subtotal-row">
              <span>{{ t.subtotal }}</span>
              <strong class="mono">${{ montoFormateado }}</strong>
            </div>
            <div class="subtotal-row">
              <span>{{ t.vat }}</span>
              <strong class="mono">$0.00</strong>
            </div>
            <div class="total-divider"></div>
            <div class="grand-total">
              <div>
                <span>{{ t.totalAmount }}</span>
                <small>MXN</small>
              </div>
              <strong class="mono">${{ montoFormateado }}</strong>
            </div>
          </section>

          <!-- Referencia -->
          <section class="verification">
            <div class="barcode" aria-hidden="true">
              <span
                v-for="n in 36"
                :key="n"
                class="barcode-line"
                :class="{ wide: n % 4 === 0, medium: n % 3 === 0 }"
              ></span>
            </div>
            <strong class="verification-number">{{ folioRecibo }}</strong>
            <span class="verification-label">{{ t.authCode }}</span>
          </section>

          <!-- Pie -->
          <footer class="receipt-footer">
            <p>{{ t.footer1 }}</p>
            <strong>{{ t.footer2 }}</strong>
            <div class="footer-divider"></div>
            <span>{{ gymNombre }}</span>
          </footer>
        </div>
      </div>

      <!-- Acciones -->
      <footer class="modal-footer">
        <div class="download-title">
          <span>{{ t.downloadAs }}</span>
          <small>PNG / PDF</small>
        </div>
        <div class="modal-actions">
          <button type="button" class="action-button png-button" :disabled="generando" @click="descargarPng">
            <span class="action-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </span>
            <span class="action-text">
              <strong>{{ generando ? t.generating : t.btnPng }}</strong>
              <small>{{ t.image }}</small>
            </span>
          </button>

          <button type="button" class="action-button pdf-button" :disabled="generando" @click="descargarPdf">
            <span class="action-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h6" />
              </svg>
            </span>
            <span class="action-text">
              <strong>{{ generando ? t.generating : t.btnPdf }}</strong>
              <small>{{ t.document }}</small>
            </span>
          </button>

          <button type="button" class="close-footer-button" :disabled="generando" @click="cerrar">
            {{ t.btnClose }}
          </button>
        </div>
      </footer>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap');

* { box-sizing: border-box; }

/* ---------- Modal ---------- */
.modal-overlay {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #111317);
  --text: var(--color-texto-general, #f5f7fa);
  --title: var(--color-titulos, #ffffff);
  --line: rgba(255, 255, 255, 0.1);
  --muted: rgba(245, 247, 250, 0.6);
  --surface: rgba(255, 255, 255, 0.05);

  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(4px);
  font-family: 'Inter', sans-serif;
}

.modal-shell {
  width: 100%;
  max-width: 460px;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card);
  box-shadow: 0 28px 75px rgba(0, 0, 0, 0.6);
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.header-left { min-width: 0; display: flex; align-items: center; gap: 12px; }
.header-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.1);
}
.modal-header h3 { margin: 0; color: var(--title); font-size: 1rem; font-weight: 700; }
.modal-header p { margin: 2px 0 0; color: var(--muted); font-size: 0.78rem; }

.close-button {
  width: 34px; height: 34px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.17s ease, color 0.17s ease;
}
.close-button:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); color: var(--text); }
.close-button:disabled { cursor: not-allowed; opacity: 0.45; }

/* ---------- Visor ---------- */
.receipt-viewport {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #090a0c;
  scrollbar-width: thin;
  scrollbar-color: #34363d transparent;
}

/* ---------- Recibo ---------- */
.receipt {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 6px;
  background: #ffffff;
  color: #18181b;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 13px 32px rgba(0, 0, 0, 0.35);
}

.receipt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 20px 16px;
  border-top: 5px solid #2563eb;
  border-bottom: 1px solid #e4e4e7;
}
.receipt-brand { min-width: 0; display: flex; align-items: center; gap: 10px; }
.brand-mark {
  width: 42px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
}
.brand-mark span { font-size: 1.3rem; font-weight: 800; }
.gym-logo { width: 100%; height: 100%; object-fit: contain; background: #fff; }
.brand-copy { min-width: 0; }
.brand-copy strong { display: block; color: #111827; font-size: 0.95rem; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
.brand-copy span { display: block; margin-top: 3px; color: #6b7280; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.6px; }

.receipt-type { min-width: 0; text-align: right; }
.receipt-type span { display: block; margin-bottom: 3px; color: #9ca3af; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }
.receipt-type strong { display: block; color: #111827; font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; white-space: nowrap; }

/* Estado */
.receipt-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 20px;
  padding: 12px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
}
.status-icon { width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #16a34a; color: #fff; }
.status-copy strong { display: block; color: #166534; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.3px; }
.status-copy span { display: block; margin-top: 2px; color: #4d7c5d; font-size: 0.68rem; }

/* Meta */
.receipt-meta {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  margin: 0 20px 16px;
  padding: 10px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}
.receipt-meta > div { min-width: 0; padding: 0 10px; border-right: 1px solid #e5e7eb; }
.receipt-meta > div:first-child { padding-left: 0; }
.receipt-meta > div:last-child { padding-right: 0; border-right: 0; }
.receipt-meta span { display: block; margin-bottom: 3px; color: #9ca3af; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }
.receipt-meta strong { display: block; color: #27272a; font-family: 'IBM Plex Mono', monospace; font-size: 0.74rem; font-weight: 600; overflow-wrap: anywhere; }

/* Secciones */
.receipt-section { padding: 0 20px 16px; }
.section-label { margin-bottom: 8px; color: #2563eb; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.8px; }

.information-list { overflow: hidden; border: 1px solid #e5e7eb; border-radius: 8px; }
.information-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 10px 12px; border-bottom: 1px solid #f0f1f3; }
.information-row:last-child { border-bottom: 0; }
.information-row span { flex-shrink: 0; color: #6b7280; font-size: 0.72rem; font-weight: 600; }
.information-row strong { max-width: 66%; color: #27272a; font-size: 0.78rem; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
.information-row .mono { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; }

/* Concepto */
.concept-header { display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 0 2px 6px; border-bottom: 1px solid #d4d4d8; color: #9ca3af; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.4px; }
.concept-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; padding: 12px 2px; border-bottom: 1px solid #e5e7eb; }
.concept-row > div { min-width: 0; }
.concept-row > div strong { display: block; color: #18181b; font-size: 0.86rem; }
.concept-row > div span { display: block; margin-top: 2px; color: #71717a; font-size: 0.72rem; }
.concept-amount { color: #18181b; font-size: 0.9rem; }

/* Totales */
.totals-section { margin: 0 20px 16px; padding: 14px; border: 1px solid #dbeafe; border-radius: 10px; background: #f8fbff; }
.subtotal-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.subtotal-row span { color: #71717a; font-size: 0.74rem; }
.subtotal-row strong { color: #52525b; font-size: 0.78rem; }
.total-divider { height: 1px; margin: 10px 0; background: #dbeafe; }
.grand-total { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.grand-total > div span { display: block; color: #1d4ed8; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.3px; }
.grand-total > div small { display: block; margin-top: 2px; color: #9ca3af; font-size: 0.62rem; }
.grand-total > strong { color: #1d4ed8; font-size: 1.35rem; font-weight: 700; }

.mono { font-family: 'IBM Plex Mono', monospace; }

/* Referencia */
.verification { margin: 0 20px 16px; padding: 14px 8px; border-top: 1px dashed #d4d4d8; border-bottom: 1px dashed #d4d4d8; text-align: center; }
.barcode { height: 34px; display: flex; align-items: stretch; justify-content: center; gap: 1.5px; margin-bottom: 8px; }
.barcode-line { width: 1px; display: block; background: #18181b; }
.barcode-line.medium { width: 2px; }
.barcode-line.wide { width: 3px; }
.verification-number { display: block; color: #27272a; font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; letter-spacing: 0.5px; overflow-wrap: anywhere; }
.verification-label { display: block; margin-top: 4px; color: #a1a1aa; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.5px; }

/* Pie del recibo */
.receipt-footer { padding: 0 20px 22px; text-align: center; }
.receipt-footer p { margin: 0; color: #9ca3af; font-size: 0.68rem; }
.receipt-footer > strong { display: block; margin-top: 3px; color: #52525b; font-size: 0.72rem; }
.footer-divider { width: 36px; height: 2px; margin: 12px auto 8px; border-radius: 10px; background: #2563eb; }
.receipt-footer > span { display: block; color: #52525b; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.4px; }

/* ---------- Acciones ---------- */
.modal-footer { flex-shrink: 0; padding: 14px 16px 16px; border-top: 1px solid var(--line); background: var(--card); }
.download-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.download-title > span { color: var(--muted); font-size: 0.68rem; font-weight: 800; letter-spacing: 0.7px; }
.download-title small { color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.64rem; }

.modal-actions { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; }

.action-button {
  min-width: 0;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.17s ease, background 0.17s ease;
}
.action-button:disabled, .close-footer-button:disabled { cursor: not-allowed; opacity: 0.5; }
.action-icon { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.action-text { min-width: 0; text-align: left; }
.action-button strong { display: block; font-size: 0.78rem; line-height: 1.2; }
.action-button small { display: block; margin-top: 1px; font-size: 0.65rem; opacity: 0.7; }

.png-button { border-color: rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.08); color: #93c5fd; }
.png-button:hover:not(:disabled) { border-color: #3b82f6; background: rgba(59, 130, 246, 0.16); }
.png-button .action-icon { background: rgba(59, 130, 246, 0.15); }

.pdf-button { border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.07); color: #fca5a5; }
.pdf-button:hover:not(:disabled) { border-color: #ef4444; background: rgba(239, 68, 68, 0.14); }
.pdf-button .action-icon { background: rgba(239, 68, 68, 0.14); }

.close-footer-button {
  min-width: 78px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--muted);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.17s ease, color 0.17s ease;
}
.close-footer-button:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.25); color: var(--text); }

.close-button:focus-visible, .action-button:focus-visible, .close-footer-button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* ---------- Responsivo ---------- */
@media (max-width: 520px) {
  .modal-overlay { padding: 8px; }
  .modal-shell { max-height: 97vh; border-radius: 14px; }
  .modal-header { padding: 12px 14px; }
  .receipt-viewport { padding: 12px 8px; }
  .modal-footer { padding: 12px; }
  .modal-actions { grid-template-columns: 1fr 1fr; }
  .close-footer-button { grid-column: 1 / -1; min-height: 42px; }
}

@media (max-width: 380px) {
  .receipt-header { padding: 16px 14px 14px; }
  .receipt-status, .receipt-meta, .totals-section, .verification { margin-left: 14px; margin-right: 14px; }
  .receipt-section, .receipt-footer { padding-left: 14px; padding-right: 14px; }
  .receipt-meta { grid-template-columns: 1fr 1fr; row-gap: 8px; }
  .receipt-meta > div:nth-child(2) { border-right: 0; }
  .receipt-meta > div:last-child { grid-column: 1 / -1; padding: 8px 0 0; border-top: 1px solid #e5e7eb; }
  .modal-actions { grid-template-columns: 1fr; }
  .close-footer-button { grid-column: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .close-button, .action-button, .close-footer-button { transition: none !important; }
}
</style>