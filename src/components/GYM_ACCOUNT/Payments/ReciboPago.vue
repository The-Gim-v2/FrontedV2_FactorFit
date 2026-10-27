<script setup>
import { computed, ref, nextTick } from 'vue';
import { useLang } from '../useLang.js';

const props = defineProps({
  visible: { type: Boolean, default: false },
  pago: { type: Object, default: null },
  gimnasio: { type: Object, default: () => ({}) },
  locale: { type: String, default: 'es-MX' }
});
const emit = defineEmits(['close', 'notify']);
const { lang } = useLang();
const reciboRef = ref(null);
const generando = ref(false);
const errorLogo = ref(false);
const en = computed(() => lang.value === 'en');
const tr = (es, eng) => en.value ? eng : es;
const elegir = (...valores) => valores.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? null;
const dato = (obj, ...claves) => elegir(...claves.map(k => obj?.[k]));
const pago = computed(() => props.pago || {});
const gym = computed(() => props.gimnasio || {});
const nombreGym = computed(() => dato(gym.value, 'Nombre_Gym', 'nombre', 'nombre_gym', 'name') || dato(pago.value, 'nombre_gimnasio', 'Nombre_Gym', 'gimnasio_nombre') || 'Gimnasio');
const logoGym = computed(() => dato(gym.value, 'logo_url', 'Logo_URL', 'url_logo', 'Img_Logo', 'logo') || dato(pago.value, 'logo_url', 'logo_gimnasio') || '');
const logoVisible = computed(() => logoGym.value && !errorLogo.value);
const folio = computed(() => dato(pago.value, 'folio', 'Folio_Referencia', 'folio_referencia', 'referencia', 'ID_Pago', 'id_pago'));
const cliente = computed(() => {
  const directo = dato(pago.value, 'cliente', 'nombre_cliente', 'Nombre_Cliente');
  if (typeof directo === 'string') return directo;
  if (directo && typeof directo === 'object') return [directo.Nombre, directo.Apellido_P, directo.Apellido_M].filter(Boolean).join(' ') || directo.nombre || '—';
  return [pago.value.Nombre, pago.value.Apellido_P, pago.value.Apellido_M].filter(Boolean).join(' ') || '—';
});
const plan = computed(() => dato(pago.value, 'plan', 'Nombre_Paquete', 'nombre_plan', 'paquete') || '—');
const concepto = computed(() => {
  const c = dato(pago.value, 'concepto', 'Concepto', 'tipo_cobro');
  return ({ monthly: tr('Mensualidad','Monthly'), monthlySurcharge: tr('Mensualidad + recargo','Monthly + surcharge'), membership: tr('Membresía','Membership') })[c] || c || tr('Pago de membresía','Membership payment');
});
const metodo = computed(() => {
  const m = dato(pago.value, 'metodo', 'metodo_pago', 'Tipo_Pago', 'tipo_pago');
  return en.value ? ({ Efectivo:'Cash', Transferencia:'Bank transfer', Tarjeta:'Card' }[m] || m || '—') : m || '—';
});
const monto = computed(() => {
  const v = dato(pago.value, 'monto', 'monto_pagado', 'Cantidad_Pagada', 'cantidad_pagada', 'total_pagado');
  return v === null ? null : Number(v);
});
const dinero = computed(() => monto.value !== null && Number.isFinite(monto.value)
  ? new Intl.NumberFormat(props.locale, { style:'currency', currency:'MXN' }).format(monto.value) : '—');
const fechaOriginal = computed(() => dato(pago.value, 'fecha_pago', 'Fecha_Pagada', 'fecha_pagada', 'fecha', 'created_at'));
const fechaParseada = computed(() => {
  const v = fechaOriginal.value;
  if (!v) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
});
const fecha = computed(() => fechaParseada.value?.toLocaleDateString(props.locale, {day:'2-digit',month:'2-digit',year:'numeric'}) || '—');
const hora = computed(() => {
  const v = fechaOriginal.value;
  if (!v || /^\d{4}-\d{2}-\d{2}$/.test(String(v).trim())) return '—';
  return fechaParseada.value?.toLocaleTimeString(props.locale, {hour:'2-digit',minute:'2-digit',hour12:false}) || '—';
});
const estado = computed(() => dato(pago.value, 'Estatus', 'estatus', 'estado', 'status'));
const confirmado = computed(() => {
  const v = dato(pago.value, 'pago_confirmado', 'confirmado');
  if (v !== null) return v === true || v === 1 || v === '1';
  return ['pagado','pagada','confirmado','confirmada','completado','completada','paid','approved','aprobado'].includes(String(estado.value || '').toLowerCase());
});
const valido = computed(() => confirmado.value && folio.value !== null && monto.value !== null && Number.isFinite(monto.value) && monto.value > 0 && !!fechaOriginal.value);
const cajero = computed(() => dato(pago.value, 'cajero', 'registrado_por', 'nombre_cajero', 'usuario') || null);
const rfc = computed(() => dato(gym.value, 'RFC', 'rfc') || null);
const aviso = (message, type='info') => emit('notify', {message,type});
const cerrar = () => { if (!generando.value) emit('close'); };
const nombreArchivo = computed(() => `Recibo_${String(folio.value || 'pago').replace(/[^a-zA-Z0-9_-]/g,'_')}`);
async function capturar() {
  if (!valido.value || !reciboRef.value) throw new Error('Pago sin confirmación o datos completos');
  await nextTick();
  if (document.fonts?.ready) await document.fonts.ready;
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas(reciboRef.value, {scale:2.5, backgroundColor:'#ffffff',useCORS:true,logging:false,scrollX:0,scrollY:0});
}
async function descargar(tipo) {
  if (generando.value) return;
  generando.value = true;
  try {
    const canvas = await capturar();
    if (tipo === 'png') {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${nombreArchivo.value}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      const { jsPDF } = await import('jspdf');
      const ancho = 86, alto = canvas.height * ancho / canvas.width;
      const pdf = new jsPDF({orientation:'portrait',unit:'mm',format:[ancho,alto]});
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,ancho,alto);
      pdf.save(`${nombreArchivo.value}.pdf`);
    }
    aviso(tr('Recibo descargado correctamente','Receipt downloaded'), 'success');
  } catch (e) {
    console.error('Error al descargar recibo:', e);
    aviso(tr('No se pudo descargar el recibo. Verifica los datos del pago y el acceso al logo.','Could not download receipt. Check payment data and logo access.'),'error');
  } finally { generando.value = false; }
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="cerrar">
    <div class="modal-shell" role="dialog" aria-modal="true" :aria-label="tr('Recibo de pago','Payment receipt')">
      <header class="modal-header">
        <div class="header-left">
          <div class="header-icon">▤</div>
          <div><span class="modal-kicker">{{ tr('VISTA PREVIA','PREVIEW') }}</span><h3>{{ tr('RECIBO DE PAGO','PAYMENT RECEIPT') }}</h3><p>{{ tr('Comprobante de transacción','Transaction receipt') }}</p></div>
        </div>
        <button class="close-button" type="button" :disabled="generando" @click="cerrar" aria-label="Cerrar">×</button>
      </header>

      <div class="receipt-viewport">
        <div ref="reciboRef" class="receipt">
          <header class="receipt-header">
            <div class="receipt-brand">
              <div class="brand-mark">
                <img v-if="logoVisible" :src="logoGym" alt="Logo del gimnasio" crossorigin="anonymous" @error="errorLogo=true">
                <span v-else>{{ nombreGym.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="brand-copy"><strong>{{ nombreGym }}</strong><span>FITNESS CENTER</span></div>
            </div>
            <div class="receipt-type"><span>{{ tr('COMPROBANTE DE PAGO','PAYMENT RECEIPT') }}</span><strong>{{ folio ? `#${folio}` : '—' }}</strong></div>
          </header>

          <div class="receipt-status" :class="{ pendiente: !confirmado }">
            <div class="status-icon">{{ confirmado ? '✓' : '!' }}</div>
            <div class="status-copy"><strong>{{ confirmado ? tr('PAGO CONFIRMADO','PAYMENT CONFIRMED') : tr('PAGO SIN CONFIRMAR','UNCONFIRMED PAYMENT') }}</strong><span>{{ confirmado ? tr('Transacción registrada','Recorded transaction') : tr('No es comprobante válido','Not a valid receipt') }}</span></div>
            <div class="status-code"><span>{{ tr('ESTADO','STATUS') }}</span><strong>{{ estado || (confirmado ? 'OK' : '—') }}</strong></div>
          </div>

          <div class="receipt-meta">
            <div><span>{{ tr('Fecha','Date') }}</span><strong>{{ fecha }}</strong></div>
            <div><span>{{ tr('Hora','Time') }}</span><strong>{{ hora }}</strong></div>
            <div><span>{{ tr('Método de pago','Payment method') }}</span><strong>{{ metodo }}</strong></div>
          </div>

          <section class="receipt-section">
            <div class="section-label">{{ tr('INFORMACIÓN DEL PAGO','PAYMENT INFORMATION') }}</div>
            <div class="information-list">
              <div class="information-row"><span>{{ tr('FOLIO DE OPERACIÓN','OPERATION REFERENCE') }}</span><strong class="mono">{{ folio || '—' }}</strong></div>
              <div class="information-row"><span>{{ tr('CLIENTE','CLIENT') }}</span><strong>{{ cliente }}</strong></div>
              <div v-if="cajero" class="information-row"><span>{{ tr('REGISTRADO POR','REGISTERED BY') }}</span><strong>{{ cajero }}</strong></div>
              <div class="information-row"><span>{{ tr('MÉTODO DE PAGO','PAYMENT METHOD') }}</span><strong>{{ metodo }}</strong></div>
            </div>
          </section>

          <section class="receipt-section">
            <div class="section-label">{{ tr('DETALLE DE LA TRANSACCIÓN','TRANSACTION DETAILS') }}</div>
            <div class="concept-header"><span>{{ tr('CONCEPTO / PLAN','CONCEPT / PLAN') }}</span><span>{{ tr('IMPORTE','AMOUNT') }}</span></div>
            <div class="concept-row"><div><strong>{{ concepto }}</strong><span>{{ plan }}</span></div><strong class="concept-amount mono">{{ dinero }}</strong></div>
          </section>

          <section class="totals-section">
            <div class="grand-total"><div><span>{{ tr('TOTAL PAGADO','TOTAL PAID') }}</span><small>MXN</small></div><strong class="mono">{{ dinero }}</strong></div>
          </section>

          <section v-if="folio" class="verification">
            <div class="barcode" aria-hidden="true"><span v-for="n in 36" :key="n" class="barcode-line" :class="{wide:n%4===0,medium:n%3===0}"></span></div>
            <strong class="verification-number">{{ folio }}</strong><span class="verification-label">{{ tr('REFERENCIA DE OPERACIÓN','OPERATION REFERENCE') }}</span>
          </section>

          <footer class="receipt-footer">
            <div v-if="confirmado" class="footer-check">✓ {{ tr('TRANSACCIÓN REGISTRADA','RECORDED TRANSACTION') }}</div>
            <p>{{ tr('Conserve este comprobante para cualquier aclaración.','Keep this receipt for inquiries.') }}</p>
            <strong>{{ tr('Gracias por su preferencia.','Thank you for choosing us.') }}</strong>
            <div class="footer-divider"></div><span>{{ nombreGym }}</span>
            <small v-if="rfc">RFC: {{ rfc }}</small>
            <small>{{ tr('Comprobante generado electrónicamente','Electronically generated receipt') }}</small>
          </footer>
        </div>
      </div>

      <footer class="modal-footer">
        <div class="download-title"><span>{{ tr('DESCARGAR COMPROBANTE','DOWNLOAD RECEIPT') }}</span><small>PNG / PDF</small></div>
        <p v-if="!valido" class="warning">{{ tr('Para descargar se requiere un pago confirmado con folio, importe y fecha reales.','A confirmed payment with reference, amount and date is required.') }}</p>
        <div class="modal-actions">
          <button class="action-button png-button" type="button" :disabled="generando || !valido" @click="descargar('png')"><span class="action-icon">▧</span><span><strong>{{ generando ? tr('Generando…','Generating…') : tr('Descargar PNG','Download PNG') }}</strong><small>{{ tr('Imagen','Image') }}</small></span></button>
          <button class="action-button pdf-button" type="button" :disabled="generando || !valido" @click="descargar('pdf')"><span class="action-icon">▤</span><span><strong>{{ generando ? tr('Generando…','Generating…') : tr('Descargar PDF','Download PDF') }}</strong><small>{{ tr('Documento','Document') }}</small></span></button>
          <button class="close-footer-button" type="button" :disabled="generando" @click="cerrar">{{ tr('Cerrar','Close') }}</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Oswald:wght@500;600;700&display=swap');
*{box-sizing:border-box}
.modal-overlay{--accent:var(--color-highlight,#3b82f6);--card:var(--bg-cards,#111317);--text:var(--color-texto-general,#f5f7fa);--title:var(--color-titulos,#fff);--line:color-mix(in srgb,var(--text) 10%,transparent);--muted:color-mix(in srgb,var(--text) 52%,transparent);--surface:color-mix(in srgb,var(--card) 88%,black);position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.82);font-family:Inter,sans-serif}
.modal-shell{width:100%;max-width:465px;max-height:94vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line);border-radius:17px;background:var(--card);box-shadow:0 28px 75px #0009}
.modal-header{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:15px 17px;border-bottom:1px solid var(--line)}
.header-left{min-width:0;display:flex;align-items:center;gap:10px}.header-icon{width:36px;height:36px;flex-shrink:0;display:grid;place-items:center;border:1px solid #3b82f640;border-radius:9px;color:#93c5fd;background:#3b82f614;font-size:22px}
.modal-kicker{display:block;margin-bottom:1px;color:var(--accent);font-size:.49rem;font-weight:800;letter-spacing:1px}
.modal-header h3{margin:0;color:var(--title);font:600 .96rem Oswald,sans-serif;letter-spacing:.3px}.modal-header p{margin:1px 0 0;color:var(--muted);font-size:.58rem}
.close-button{width:31px;height:31px;flex-shrink:0;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--muted);font-size:21px;cursor:pointer}
.receipt-viewport{min-height:0;flex:1;overflow-y:auto;padding:18px;background:#090a0c;scrollbar-width:thin;scrollbar-color:#34363d transparent}
.receipt{width:100%;max-width:350px;margin:0 auto;overflow:hidden;border-radius:5px;background:#fff;color:#18181b;box-shadow:0 13px 32px #0006}
.receipt-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 19px 17px;border-top:5px solid #2563eb;border-bottom:1px solid #e4e4e7}
.receipt-brand{min-width:0;display:flex;align-items:center;gap:9px}.brand-mark{width:37px;height:37px;flex-shrink:0;display:grid;place-items:center;overflow:hidden;border-radius:9px;background:#2563eb;color:#fff}
.brand-mark img{width:100%;height:100%;object-fit:contain;background:#fff}.brand-mark span{font:700 1.3rem Oswald,sans-serif}
.brand-copy{min-width:0}.brand-copy strong{display:block;color:#111827;font:600 .91rem Oswald,sans-serif;line-height:1.1;overflow-wrap:anywhere}.brand-copy span{display:block;margin-top:3px;color:#6b7280;font-size:.46rem;font-weight:700;letter-spacing:1px}
.receipt-type{min-width:0;text-align:right}.receipt-type span{display:block;margin-bottom:3px;color:#9ca3af;font-size:.48rem;font-weight:700;letter-spacing:.5px}.receipt-type strong{display:block;max-width:130px;overflow:hidden;color:#111827;font:600 .59rem 'IBM Plex Mono',monospace;text-overflow:ellipsis;white-space:nowrap}
.receipt-status{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:9px;margin:15px 19px;padding:10px;border:1px solid #bbf7d0;border-radius:8px;background:#f0fdf4}
.status-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#16a34a;color:#fff;font-size:20px;font-weight:800}.status-copy strong{display:block;color:#166534;font-size:.62rem;font-weight:800}.status-copy span{display:block;margin-top:1px;color:#4d7c5d;font-size:.47rem}.status-code{text-align:right}.status-code span{display:block;color:#6b7280;font-size:.43rem}.status-code strong{display:block;margin-top:1px;color:#16a34a;font:700 .63rem 'IBM Plex Mono',monospace;overflow-wrap:anywhere}
.receipt-status.pendiente{border-color:#fed7aa;background:#fff7ed}.pendiente .status-icon{background:#ea580c}.pendiente .status-copy strong,.pendiente .status-code strong{color:#9a3412}.pendiente .status-copy span{color:#c2410c}
.receipt-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0 19px 15px;padding:10px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}.receipt-meta>div{min-width:0;padding:0 8px;border-right:1px solid #e5e7eb}.receipt-meta>div:first-child{padding-left:0}.receipt-meta>div:last-child{padding-right:0;border:0}.receipt-meta span{display:block;margin-bottom:3px;color:#9ca3af;font-size:.43rem;font-weight:700;letter-spacing:.4px;text-transform:uppercase}.receipt-meta strong{display:block;overflow:hidden;color:#27272a;font:600 .55rem 'IBM Plex Mono',monospace;text-overflow:ellipsis;white-space:nowrap}
.receipt-section{padding:0 19px 15px}.section-label{margin-bottom:9px;color:#2563eb;font-size:.46rem;font-weight:800;letter-spacing:.8px}.information-list{overflow:hidden;border:1px solid #e5e7eb;border-radius:7px}
.information-row{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:8px 10px;border-bottom:1px solid #f0f1f3}.information-row:last-child{border-bottom:0}.information-row span{flex-shrink:0;color:#9ca3af;font-size:.49rem;font-weight:600}.information-row strong{max-width:62%;color:#27272a;font-size:.54rem;font-weight:700;text-align:right;overflow-wrap:anywhere}.mono{font-family:'IBM Plex Mono',monospace}
.concept-header{display:grid;grid-template-columns:1fr auto;gap:10px;padding:0 2px 6px;border-bottom:1px solid #d4d4d8;color:#9ca3af;font-size:.45rem;font-weight:700}
.concept-row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:10px 2px;border-bottom:1px solid #e5e7eb}.concept-row>div{min-width:0}.concept-row>div strong{display:block;color:#18181b;font-size:.59rem}.concept-row>div span{display:block;margin-top:2px;color:#71717a;font-size:.49rem}.concept-amount{color:#18181b;font-size:.63rem}
.totals-section{margin:0 19px 16px;padding:12px;border:1px solid #dbeafe;border-radius:8px;background:#f8fbff}.grand-total{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.grand-total>div span{display:block;color:#1d4ed8;font-size:.52rem;font-weight:800}.grand-total>div small{display:block;margin-top:2px;color:#9ca3af;font-size:.43rem}.grand-total>strong{color:#1d4ed8;font-size:1.02rem;font-weight:700}
.verification{margin:0 19px 16px;padding:13px 10px;border-top:1px dashed #d4d4d8;border-bottom:1px dashed #d4d4d8;text-align:center}.barcode{height:31px;display:flex;align-items:stretch;justify-content:center;gap:1.2px;margin-bottom:7px}.barcode-line{width:1px;background:#18181b}.barcode-line.medium{width:2px}.barcode-line.wide{width:3px}.verification-number{display:block;color:#27272a;font:600 .61rem 'IBM Plex Mono',monospace;letter-spacing:2px;overflow-wrap:anywhere}.verification-label{display:block;margin-top:3px;color:#a1a1aa;font-size:.42rem;font-weight:700;letter-spacing:.5px}
.receipt-footer{padding:0 19px 19px;text-align:center}.footer-check{display:inline-flex;align-items:center;gap:4px;margin-bottom:9px;padding:4px 7px;border-radius:5px;background:#f0fdf4;color:#16a34a;font-size:.43rem;font-weight:800}.receipt-footer p{margin:0;color:#9ca3af;font-size:.48rem}.receipt-footer>strong{display:block;margin-top:3px;color:#52525b;font-size:.5rem}.footer-divider{width:35px;height:2px;margin:12px auto 8px;border-radius:10px;background:#2563eb}.receipt-footer>span{display:block;color:#52525b;font:700 .54rem Oswald,sans-serif;letter-spacing:.5px}.receipt-footer>small{display:block;margin-top:2px;color:#a1a1aa;font-size:.4rem}
.modal-footer{flex-shrink:0;padding:12px 15px 14px;border-top:1px solid var(--line);background:var(--card)}.download-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.download-title>span{color:var(--muted);font-size:.49rem;font-weight:800;letter-spacing:.7px}.download-title small{color:var(--muted);font:500 .46rem 'IBM Plex Mono',monospace}.warning{margin:0 0 8px;color:#fca5a5;font-size:.64rem}
.modal-actions{display:grid;grid-template-columns:1fr 1fr auto;gap:7px}.action-button{min-width:0;min-height:45px;display:flex;align-items:center;gap:7px;padding:6px 9px;border:1px solid var(--line);border-radius:9px;font-family:inherit;cursor:pointer;transition:transform .17s,border-color .17s,background .17s}.action-button:hover:not(:disabled){transform:translateY(-1px)}button:disabled{cursor:not-allowed;opacity:.5}
.action-icon{width:28px;height:28px;flex-shrink:0;display:grid;place-items:center;border-radius:7px;font-size:18px}.action-button>span:last-child{min-width:0;text-align:left}.action-button strong{display:block;font-size:.56rem}.action-button small{display:block;margin-top:1px;font-size:.43rem;opacity:.65}
.png-button{border-color:#3b82f647;background:#3b82f60f;color:#93c5fd}.png-button:hover:not(:disabled){border-color:#3b82f6;background:#3b82f61a}.png-button .action-icon{background:#3b82f61a}.pdf-button{border-color:#ef444440;background:#ef44440d;color:#fca5a5}.pdf-button:hover:not(:disabled){border-color:#ef4444;background:#ef444417}.pdf-button .action-icon{background:#ef444417}
.close-footer-button{min-width:70px;padding:0 11px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--muted);font:700 .56rem Inter,sans-serif;cursor:pointer}
@media(max-width:520px){.modal-overlay{padding:7px}.modal-shell{max-height:97vh;border-radius:14px}.modal-header{padding:12px}.receipt-viewport{padding:12px 8px}.modal-footer{padding:10px}.modal-actions{grid-template-columns:1fr 1fr}.close-footer-button{grid-column:1/-1;min-height:38px}}
@media(max-width:380px){.receipt-header{padding:16px 14px 14px}.brand-mark{width:32px;height:32px}.receipt-status,.receipt-meta,.totals-section,.verification{margin-left:14px;margin-right:14px}.receipt-section,.receipt-footer{padding-left:14px;padding-right:14px}.receipt-meta{grid-template-columns:1fr 1fr;row-gap:8px}.receipt-meta>div:nth-child(2){border-right:0}.receipt-meta>div:last-child{grid-column:1/-1;padding:8px 0 0;border-top:1px solid #e5e7eb}.modal-actions{grid-template-columns:1fr}.close-footer-button{grid-column:auto}}
@media(prefers-reduced-motion:reduce){.action-button{transition:none!important}}
</style>
