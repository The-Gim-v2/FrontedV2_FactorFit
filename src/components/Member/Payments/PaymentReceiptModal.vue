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

const { lang } = useLang();

// Diccionario de traducciones sincronizado con useLang
const traducciones = {
  es: {
    subTitle: 'COMPROBANTE DE PAGO REGISTRADO',
    date: 'Fecha:',
    time: 'Hora:',
    operationNum: 'NÚMERO DE OPERACIÓN',
    client: 'CLIENTE',
    registeredBy: 'REGISTRADO POR',
    mainCashier: 'CAJA PRINCIPAL',
    paymentMethod: 'MÉTODO DE PAGO',
    status: 'ESTADO',
    paid: 'PAGADO',
    conceptPlan: 'CONCEPTO / PLAN',
    amount: 'IMPORTE',
    monthly: 'Mensualidad',
    monthlySurcharge: 'Mensualidad + Recargo',
    membership: 'Membresía',
    subtotal: 'SUBTOTAL:',
    vat: 'IVA (0%):',
    totalAmount: 'IMPORTE TOTAL:',
    authCode: 'REFERENCIA REGISTRADA',
    footer1: 'Conserve este comprobante para cualquier aclaración.',
    footer2: 'Gracias por su preferencia.',
    genPng: 'Generando recibo PNG...',
    genPdf: 'Generando recibo PDF...',
    successPng: 'Recibo descargado con éxito',
    successPdf: 'Recibo PDF descargado con éxito',
    errorPng: 'Error al generar la imagen PNG',
    errorPdf: 'Error al generar el PDF. Verifica que jspdf esté instalado.',
    btnPng: 'Descargar PNG',
    btnPdf: 'Descargar PDF',
    btnClose: 'Cerrar',
    generating: 'Generando…'
  },
  en: {
    subTitle: 'REGISTERED PAYMENT RECEIPT',
    date: 'Date:',
    time: 'Time:',
    operationNum: 'OPERATION NUMBER',
    client: 'CLIENT',
    registeredBy: 'REGISTERED BY',
    mainCashier: 'MAIN CASHIER',
    paymentMethod: 'PAYMENT METHOD',
    status: 'STATUS',
    paid: 'PAID',
    conceptPlan: 'CONCEPT / PLAN',
    amount: 'AMOUNT',
    monthly: 'Monthly',
    monthlySurcharge: 'Monthly + Surcharge',
    membership: 'Membership',
    subtotal: 'SUBTOTAL:',
    vat: 'VAT (0%):',
    totalAmount: 'TOTAL AMOUNT:',
    authCode: 'REGISTERED REFERENCE',
    footer1: 'Keep this receipt for any inquiries.',
    footer2: 'Thank you for your preference.',
    genPng: 'Generating PNG receipt...',
    genPdf: 'Generating PDF receipt...',
    successPng: 'Receipt downloaded successfully',
    successPdf: 'PDF receipt downloaded successfully',
    errorPng: 'Error generating PNG image',
    errorPdf: 'Error generating PDF. Verify jspdf is installed.',
    btnPng: 'Download PNG',
    btnPdf: 'Download PDF',
    btnClose: 'Close',
    generating: 'Generating…'
  }
};

const t = computed(() => traducciones[lang.value] || traducciones.es);

const formatFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString(props.locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatHora = () => {
  const value = String(props.pago?.fecha_hora || '');
  const match = value.match(/(?:T|\s)(\d{2}:\d{2}(?::\d{2})?)/);
  return match ? match[1] : '—';
};

const cerrar = () => {
  if (generando.value) return;
  emit('close');
};

const liberarRecorteParaCaptura = async () => {
  const el = reciboRef.value;
  const contenedor = modalContentRef.value;

  const original = {
    elOverflow: el.style.overflow,
    elMaxHeight: el.style.maxHeight,
    elHeight: el.style.height,
    contOverflow: contenedor?.style.overflow,
    contMaxHeight: contenedor?.style.maxHeight,
  };

  el.style.overflow = 'visible';
  el.style.maxHeight = 'none';
  el.style.height = 'auto';
  if (contenedor) {
    contenedor.style.overflow = 'visible';
    contenedor.style.maxHeight = 'none';
  }

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await new Promise((resolve) => setTimeout(resolve, 50));

  return () => {
    el.style.overflow = original.elOverflow;
    el.style.maxHeight = original.elMaxHeight;
    el.style.height = original.elHeight;
    if (contenedor) {
      contenedor.style.overflow = original.contOverflow;
      contenedor.style.maxHeight = original.contMaxHeight;
    }
  };
};

const capturarTicketCompleto = async () => {
  const html2canvas = (await import('html2canvas')).default;
  const el = reciboRef.value;
  const restaurar = await liberarRecorteParaCaptura();

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    return canvas;
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
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = `Ticket_${props.pago?.folio || 'pago'}.png`;
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

    const imgData = canvas.toDataURL('image/png');
    const anchoMm = 80;
    const altoMm = (canvas.height * anchoMm) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [anchoMm, altoMm],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, anchoMm, altoMm);
    pdf.save(`Ticket_${props.pago?.folio || 'pago'}.pdf`);

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
    <div ref="modalContentRef" class="modal-content-container">

      <div ref="reciboRef" class="receipt-ticket">
        <div class="ticket-header">
          <div class="bank-name">{{ gimnasio?.nombre || "Gimnasio" }}</div>
          <div class="bank-sub">{{ t.subTitle }}</div>
        </div>

        <div class="ticket-info-top">
          <div class="info-line"><span>{{ t.date }}</span> <span>{{ formatFecha(pago?.fecha) }}</span></div>
          <div class="info-line"><span>{{ t.time }}</span> <span>{{ formatHora() }}</span></div>
        </div>

        <div class="ticket-divider">--------------------------------------------------</div>

        <div class="receipt-body">
          <div class="row">
            <span class="label">{{ t.operationNum }}</span>
            <span class="value bold">{{ pago?.folio }}</span>
          </div>
          <div class="row">
            <span class="label">{{ t.client }}</span>
            <span class="value">{{ pago?.cliente }}</span>
          </div>
          <div class="row">
            <span class="label">{{ t.registeredBy }}</span>
            <span class="value">{{ pago?.registradoPorStaff ? (lang === 'en' ? 'At reception' : 'En recepción') : (lang === 'en' ? 'Registered payment' : 'Pago registrado') }}</span>
          </div>
          <div class="row">
            <span class="label">{{ t.paymentMethod }}</span>
            <span class="value uppercase">{{ pago?.metodo }}</span>
          </div>
          <div class="row">
            <span class="label">{{ t.status }}</span>
            <span class="value bold">{{ t.paid }}</span>
          </div>
        </div>

        <div class="ticket-divider">--------------------------------------------------</div>

        <div class="receipt-items">
          <div class="item-header-row">
            <span>{{ t.conceptPlan }}</span>
            <span>{{ t.amount }}</span>
          </div>
          <div class="item-row">
            <div class="item-desc">
              <span class="bold">
                {{ pago?.concepto === 'monthly' ? t.monthly : pago?.concepto === 'monthlySurcharge' ? t.monthlySurcharge : t.membership }}
              </span>
              <span class="sub-desc">({{ pago?.plan }})</span>
            </div>
            <span class="bold">${{ Number(pago?.monto || 0).toFixed(2) }}</span>
          </div>
        </div>

        <div class="ticket-divider">--------------------------------------------------</div>

        <div class="receipt-totals">
          <div class="row">
            <span>{{ t.subtotal }}</span>
            <span>${{ Number(pago?.monto || 0).toFixed(2) }}</span>
          </div>
          <div class="row total-final">
            <span>{{ t.totalAmount }}</span>
            <span>${{ Number(pago?.monto || 0).toFixed(2) }} MXN</span>
          </div>
        </div>

        <div class="ticket-divider">--------------------------------------------------</div>

        <div class="ticket-barcode">
          <div class="barcode-lines">*{{ pago?.folio || '00000000' }}*</div>
          <div class="barcode-text">{{ t.authCode }}</div>
        </div>

        <div class="receipt-footer">
          <p>{{ t.footer1 }}</p>
          <p>{{ t.footer2 }}</p>
        </div>
      </div>

      <div class="modal-actions-bar">
        <button class="btn-action png" type="button" :disabled="generando" @click="descargarPng">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {{ generando ? t.generating : t.btnPng }}
        </button>
        <button class="btn-action pdf" type="button" :disabled="generando" @click="descargarPdf">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          {{ generando ? t.generating : t.btnPdf }}
        </button>
        <button class="btn-action close" type="button" :disabled="generando" @click="cerrar">
          {{ t.btnClose }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 12px;
}

.modal-content-container {
  background: #202024;
  border-radius: 12px;
  width: 100%;
  max-width: 380px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.receipt-ticket {
  padding: 20px 16px;
  background: #ffffff !important;
  color: #000000 !important;
  font-family: 'Courier New', Courier, monospace, sans-serif;
  font-size: 0.8rem;
  line-height: 1.3;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.ticket-header {
  text-align: center;
  margin-bottom: 10px;
}
.bank-name {
  font-weight: bold;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.bank-sub {
  font-size: 0.7rem;
  color: #333;
}

.ticket-info-top {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.75rem;
}

.ticket-divider {
  text-align: center;
  font-size: 0.75rem;
  color: #555;
  letter-spacing: -1px;
  margin: 8px 0;
  white-space: nowrap;
  overflow: hidden;
}

.receipt-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.label {
  color: #333;
  font-size: 0.75rem;
}

.value {
  text-align: right;
  word-break: break-all;
}

.value.bold, .bold {
  font-weight: bold;
}

.uppercase {
  text-transform: uppercase;
}

.receipt-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-header-row {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 0.75rem;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
  margin-bottom: 4px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-desc {
  display: flex;
  flex-direction: column;
}

.sub-desc {
  font-size: 0.7rem;
  color: #444;
}

.receipt-totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-final {
  font-weight: bold;
  font-size: 0.9rem;
  margin-top: 4px;
  border-top: 1px dashed #000;
  padding-top: 4px;
}

.ticket-barcode {
  text-align: center;
  margin: 12px 0 8px;
}

.barcode-lines {
  font-family: monospace;
  font-size: 1.1rem;
  letter-spacing: 2px;
  font-weight: bold;
  word-break: break-all;
}

.barcode-text {
  font-size: 0.65rem;
  color: #444;
  margin-top: 2px;
}

.receipt-footer {
  text-align: center;
  font-size: 0.68rem;
  color: #333;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-actions-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #18181b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.btn-action {
  flex: 1;
  min-width: 90px;
  padding: 10px 8px;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.2s;
  border: none;
}
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-action:hover:not(:disabled) { opacity: 0.9; }
.btn-action.png { background: #3b82f6; color: #fff; }
.btn-action.pdf { background: #ef4444; color: #fff; }
.btn-action.close { background: #3f3f46; color: #f4f4f5; }

/* Ajustes responsivos para móviles */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 6px;
  }
  .modal-content-container {
    max-width: 100%;
    max-height: 96vh;
  }
  .receipt-ticket {
    padding: 14px 10px;
  }
  .modal-actions-bar {
    flex-direction: column;
    gap: 6px;
    padding: 10px;
  }
  .btn-action {
    width: 100%;
    padding: 12px;
    font-size: 0.85rem;
  }
}
</style>