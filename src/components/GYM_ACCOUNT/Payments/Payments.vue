<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import Promo from './Promos.vue';
import ReciboPago from './ReciboPago.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';
const route = useRoute();
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const t = key => (traducciones[currentLang.value] || traducciones.es)[key] || traducciones.es[key] || key;
const txt = (es, en) => currentLang.value === 'en' ? en : es;
const localStrings = { es: { confirmBeforeDownload: 'Primero confirma el pago para generar el recibo.', receiptReadyToast: 'Recibo generado. Descárgalo en PNG o PDF.' }, en: { confirmBeforeDownload: 'Confirm the payment first to generate the receipt.', receiptReadyToast: 'Receipt ready. Download it as PNG or PDF.' } };
const lt = key => localStrings[currentLang.value]?.[key] || localStrings.es[key] || key;
const handleLangChange = e => { if (e.detail?.idioma) currentLang.value = e.detail.idioma; };
const activeModal = ref(null), toastRef = ref(null), reciboRef = ref(null);
const montoRecibir = ref(null), tipoPago = ref(''), folioReferencia = ref(''), ofertaSeleccionada = ref(null);
const ultimoPago = ref(null), reciboVisible = ref(false), loading = ref(true), saving = ref(false), errorCarga = ref('');
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const getToken = () => {
 for (const storage of [sessionStorage, localStorage]) {
  for (const key of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
   const v=storage.getItem(key); if(v)return v.replace(/^Bearer\s+/i,'');
  }
  for(const key of ['auth','user','session','gymAccount','gym_account']) {
   try {const v=JSON.parse(storage.getItem(key)||'null');const token=v?.token||v?.access_token||v?.accessToken;if(token)return token;}catch{}
  }
 }
 return '';
};
const obtenerSedeId = () => {
 const queryId=Number(route.query.sede_id); if(Number.isInteger(queryId)&&queryId>0)return queryId;
 for(const storage of [sessionStorage,localStorage])for(const key of ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id']) {
  const raw=storage.getItem(key);if(!raw)continue;let v=raw;
  try {const parsed=JSON.parse(raw);v=typeof parsed==='object'?(parsed?.ID_Sede??parsed?.sede_id??parsed?.id??parsed?.value):parsed;}catch{}
  const id=Number(v);if(Number.isInteger(id)&&id>0)return id;
 }
 return null;
};
const apiRequest=async(path,options={})=>{
 const token=getToken();if(!token)throw new Error('No se encontró el token de sesión.');
 const response=await fetch(`${API}${path}`,{...options,headers:{Accept:'application/json',Authorization:`Bearer ${token}`,...(options.headers||{})}});
 const body=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(body?.message || `Error HTTP ${response.status}`);
 return body;
};
const cliente=ref({nombre:'',apellido:'',id:'',foto:new URL('../../../assets/humano.jpg',import.meta.url).href,estado:'Pendiente'});
const clienteActual=computed(()=>[cliente.value.nombre,cliente.value.apellido].filter(Boolean).join(' '));
const inscripcion=ref(null);
const fechaSolo=v=>String(v||'').slice(0,10);
const fechaProximoCorte=computed(()=>fechaSolo(inscripcion.value?.Fecha_Vencimiento)||'—');
const fechaNuevoCorte=computed(()=>{
 const base=fechaProximoCorte.value==='—'?new Date():new Date(`${fechaProximoCorte.value}T12:00:00`);
 if(Number.isNaN(base.getTime()))return '—';
 const months=Number(ofertaSeleccionada.value?.meses)||1;
 const day=base.getDate();base.setDate(1);base.setMonth(base.getMonth()+months);
 const max=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();base.setDate(Math.min(day,max));
 return `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(base.getDate()).padStart(2,'0')}`;
});
const generarFolio=()=>`OP-${Date.now().toString().slice(-8)}`;
watch(tipoPago,n=>{if(n==='Efectivo')folioReferencia.value=generarFolio();else if(folioReferencia.value.startsWith('OP-'))folioReferencia.value='';});
const isButtonDisabled=computed(()=>loading.value||saving.value||!inscripcion.value||!montoRecibir.value||Number(montoRecibir.value)<=0||!tipoPago.value||(tipoPago.value!=='Efectivo'&&!folioReferencia.value.trim()));
const reciboLocale=computed(()=>currentLang.value==='en'?'en-US':'es-MX');
const montoMostrado=computed(()=>new Intl.NumberFormat(currentLang.value==='en'?'en-US':'es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(montoRecibir.value)||0));
const planActual=computed(()=>ofertaSeleccionada.value?.nombre||inscripcion.value?.Nombre_Paquete||t('monthlyOption'));
const duracionPlan=computed(()=>{const m=Number(ofertaSeleccionada.value?.meses)||1;return `${m} ${m===1?txt('mes','month'):txt('meses','months')}`;});
const metodoPagoLabel=computed(()=>({Efectivo:txt('Efectivo','Cash'),Transferencia:txt('Transferencia','Transfer'),Tarjeta:txt('Tarjeta','Card')})[tipoPago.value]||txt('Sin seleccionar','Not selected'));
const cargarCliente=async()=>{
 loading.value=true;errorCarga.value='';ultimoPago.value=null;inscripcion.value=null;
 try{
  const id=Number(route.params.id);if(!Number.isInteger(id)||id<=0)throw new Error('ID de inscripción inválido.');
  const sede=obtenerSedeId();if(!sede)throw new Error('Selecciona una sucursal para consultar al cliente.');
  const data=await apiRequest(`/api/gym/clientes?sede_id=${encodeURIComponent(sede)}`);
  const rows=Array.isArray(data)?data:(Array.isArray(data?.data)?data.data:[]);
  const found=rows.find(r=>Number(r.ID_Inscripto)===id);
  if(!found)throw new Error('No se encontró la inscripción en esta sucursal.');
  inscripcion.value=found;
  cliente.value={nombre:found.Nombre||'',apellido:[found.Apellido_P,found.Apellido_M].filter(Boolean).join(' '),id:String(found.ID_Cliente),foto:found.foto_url||new URL('../../../assets/humano.jpg',import.meta.url).href,estado:found.Estatus||'Pendiente'};
  montoRecibir.value=Number(found.Precio)||null;
 }catch(e){errorCarga.value=e.message||'No se pudo cargar el cliente.';toastRef.value?.notify(errorCarga.value,'error');}
 finally{loading.value=false;}
};
const handleSelectOferta=oferta=>{ofertaSeleccionada.value=oferta;montoRecibir.value=Number(oferta.precio)||null;activeModal.value=null;toastRef.value?.notify(`${t('offerAppliedToast')} ${oferta.nombre}`,'success');};
const confirmPayment=async()=>{
 if(isButtonDisabled.value)return;
 saving.value=true;
 try{
  // El servidor debe registrar Clientes_Pagos, Clientes_Detalle_Pagos y Referencias_Pagos en una transacción.
  const result=await apiRequest(`/api/gym/clientes/${inscripcion.value.ID_Inscripto}/pagos`,{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sede_id:obtenerSedeId(),monto:Number(montoRecibir.value),metodo_pago:tipoPago.value,referencia_pago:tipoPago.value==='Efectivo'?null:folioReferencia.value.trim(),id_precio:ofertaSeleccionada.value?.id_precio??ofertaSeleccionada.value?.ID_Precio??null})
  });
  ultimoPago.value={folio:result.folio||result.Folio_Referencia,fecha:fechaSolo(result.fecha||new Date().toISOString()),cliente:clienteActual.value,metodo:tipoPago.value,monto:Number(montoRecibir.value),concepto:ofertaSeleccionada.value?'membership':'monthly',plan:planActual.value};
  toastRef.value?.notify(t('paymentConfirmedToast'),'success');
  await cargarCliente(); // Actualizar estado y fecha de corte desde Laravel.
  ultimoPago.value={folio:result.folio||result.Folio_Referencia,fecha:fechaSolo(result.fecha||new Date().toISOString()),cliente:clienteActual.value,metodo:tipoPago.value,monto:Number(result.monto??montoRecibir.value),concepto:ofertaSeleccionada.value?'membership':'monthly',plan:planActual.value};
 }catch(e){toastRef.value?.notify(e.message||'No se pudo registrar el pago.','error');}
 finally{saving.value=false;}
};
const downloadReceipt=()=>{if(!ultimoPago.value){toastRef.value?.notify(lt('confirmBeforeDownload'),'error');return;}reciboVisible.value=true;};
const handleReciboNotify=payload=>{if(payload)toastRef.value?.notify(payload.message,payload.type);};
onMounted(()=>{window.addEventListener('idioma-changed',handleLangChange);cargarCliente();});
onUnmounted(()=>window.removeEventListener('idioma-changed',handleLangChange));
watch(()=>[route.params.id,route.query.sede_id],cargarCliente);
</script>
<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="payment-page">
      <div class="payment-container">
        <!-- ================================================
             ENCABEZADO
        ================================================= -->
        <header class="page-header">
          <div>
            <div class="eyebrow">
              <span></span>
              {{ txt('OPERACIONES / COBROS', 'OPERATIONS / PAYMENTS') }}
            </div>
            <h1>
              {{ txt('REGISTRAR', 'REGISTER') }}
              <strong>{{ txt('PAGO', 'PAYMENT') }}</strong>
            </h1>
            <p>
              {{
                txt(
                  'Registra el pago del cliente, aplica promociones y genera su comprobante.',
                  'Register the client payment, apply promotions and generate the receipt.'
                )
              }}
            </p>
          </div>
          <div class="header-status">
            <span class="status-light"></span>
            <div>
              <small>
                {{ txt('Sistema de cobro', 'Payment system') }}
              </small>
              <strong>
                {{ txt('Disponible', 'Available') }}
              </strong>
            </div>
          </div>
        </header>
        <!-- ================================================
             LAYOUT
        ================================================= -->
        <p v-if="loading" role="status">Cargando información del cliente...</p>
<div v-if="errorCarga" role="alert" style="color:#f87171;margin-bottom:16px">{{ errorCarga }}</div>
<div class="payment-layout">
          <!-- ==============================================
               CLIENTE
          =============================================== -->
          <aside class="client-column">
            <article class="client-card">
              <div class="card-top-line"></div>
              <div class="client-card-header">
                <span class="client-label">
                  {{ txt('CLIENTE SELECCIONADO', 'SELECTED CLIENT') }}
                </span>
                <span class="active-pill">
                  <i></i>
                  {{ cliente.estado }}
                </span>
              </div>
              <div class="avatar-container">
                <div class="avatar-decoration"></div>
                <div class="avatar">
                  <img
                    :src="cliente.foto"
                    :alt="t('userAvatarAlt')"
                  />
                </div>
              </div>
              <div class="client-name">
                <h2>{{ cliente.nombre }}</h2>
                <h2 class="highlight">{{ cliente.apellido }}</h2>
              </div>
              <div class="client-id">
                <span>{{ txt('ID DE CLIENTE', 'CLIENT ID') }}</span>
                <strong>{{ cliente.id }}</strong>
              </div>
              <div class="client-divider"></div>
              <div class="client-mini-info">
                <div>
                  <span>
                    {{ txt('Plan actual', 'Current plan') }}
                  </span>
                  <strong>{{ planActual }}</strong>
                </div>
                <div>
                  <span>
                    {{ txt('Próximo corte', 'Next billing') }}
                  </span>
                  <strong>{{ fechaProximoCorte }}</strong>
                </div>
              </div>
            </article>
          </aside>
          <!-- ==============================================
               COBRO
          =============================================== -->
          <section class="operations-column">
            <!-- BUSCADOR -->
            <div
              id="tutorial-step-0"
              class="search-section"
            >
              <label>
                {{ t('searchClientLabel') }}
              </label>
              <div class="search-control">
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line
                    x1="21"
                    y1="21"
                    x2="16.65"
                    y2="16.65"
                  />
                </svg>
                <input
                  type="text"
                  :placeholder="t('searchClientPlaceholder')"
                />
                <kbd>⌘ K</kbd>
              </div>
            </div>
            <!-- PANEL -->
            <article
              id="tutorial-step-1"
              class="payment-card"
            >
              <div class="card-top-line"></div>
              <!-- ENCABEZADO DEL COBRO -->
              <div class="payment-card-header">
                <div class="payment-title">
                  <span class="payment-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="19"
                      height="19"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                      />
                      <path d="M2 10h20" />
                    </svg>
                  </span>
                  <div>
                    <span class="section-kicker">
                      {{ txt('TRANSACCIÓN', 'TRANSACTION') }}
                    </span>
                    <h3>
                      {{ txt('Detalle del pago', 'Payment details') }}
                    </h3>
                  </div>
                </div>
                <button
                  class="promo-button"
                  type="button"
                  @click="activeModal = 'promo'"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="currentColor"
                  >
                    <path
                      d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
                    />
                  </svg>
                  {{ t('promosBtn') }}
                </button>
              </div>
              <!-- FECHAS -->
              <div class="billing-dates">
                <div class="billing-date">
                  <span class="date-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="17"
                      height="17"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                      />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </span>
                  <div>
                    <span>{{ t('nextCutLabel') }}</span>
                    <strong>{{ fechaProximoCorte }}</strong>
                  </div>
                </div>
                <span class="date-arrow">
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
                <div class="billing-date new-date">
                  <span class="date-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="17"
                      height="17"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                      />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                      <path d="m9 16 2 2 4-5" />
                    </svg>
                  </span>
                  <div>
                    <span>{{ t('newCutLabel') }}</span>
                    <strong>{{ fechaNuevoCorte }}</strong>
                  </div>
                </div>
              </div>
              <!-- ============================================
                   TOTAL PRINCIPAL
              ============================================= -->
              <div class="payment-summary">
                <div class="summary-main">
                  <div class="summary-heading">
                    <span>
                      {{ t('totalToPayLabel') }}
                    </span>
                    <span class="summary-state">
                      {{ txt('POR COBRAR', 'DUE') }}
                    </span>
                  </div>
                  <div class="big-amount">
                    <span class="big-currency">$</span>
                    <strong>{{ montoMostrado }}</strong>
                    <span class="currency-code">MXN</span>
                  </div>
                  <div class="plan-line">
                    <span class="plan-icon">
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
                        <path d="M4 6v12a2 2 0 0 0 2 2h14v-8H6a2 2 0 0 1-2-2Z" />
                      </svg>
                    </span>
                    <strong>{{ planActual }}</strong>
                    <span>•</span>
                    <span>{{ duracionPlan }}</span>
                  </div>
                </div>
                <div class="summary-side">
                  <div class="surcharge-box">
                    <span>
                      {{ txt('RECARGO', 'SURCHARGE') }}
                    </span>
                    <strong>
                      + $0.00
                    </strong>
                  </div>
                  <div
                    v-if="ofertaSeleccionada"
                    class="promotion-applied"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.4"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    {{ txt('Promoción aplicada', 'Promotion applied') }}
                  </div>
                </div>
              </div>
              <!-- ============================================
                   MÉTODO DE PAGO
              ============================================= -->
              <section class="form-section">
                <div class="form-section-title">
                  <span>01</span>
                  <div>
                    <strong>
                      {{ txt('Método de pago', 'Payment method') }}
                    </strong>
                    <small>
                      {{
                        txt(
                          'Selecciona cómo realizará el cliente el pago.',
                          'Select how the client will make the payment.'
                        )
                      }}
                    </small>
                  </div>
                </div>
                <div class="payment-details-grid">
                  <div class="input-group">
                    <label>{{ t('paymentTypeLabel') }}</label>
                    <div class="field-control">
                      <svg
                        class="field-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect
                          x="1"
                          y="4"
                          width="22"
                          height="16"
                          rx="2"
                        />
                        <line
                          x1="1"
                          y1="10"
                          x2="23"
                          y2="10"
                        />
                      </svg>
                      <select
                        v-model="tipoPago"
                        class="field-select"
                      >
                        <option disabled value="">
                          {{ t('selectOption') }}
                        </option>
                        <option value="Efectivo">
                          {{ t('cashOption') }}
                        </option>
                        <option value="Transferencia">
                          {{ t('transferOption') }}
                        </option>
                        <option value="Tarjeta">
                          {{ t('cardOption') }}
                        </option>
                      </select>
                      <svg
                        class="select-arrow"
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>{{ t('folioReferenceLabel') }}</label>
                    <div
                      class="field-control"
                      :class="{
                        'is-disabled':
                          tipoPago === 'Efectivo'
                      }"
                    >
                      <svg
                        class="field-icon"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M4 4h16v16H4z" />
                        <path d="M8 9h8M8 13h5" />
                      </svg>
                      <input
                        v-model="folioReferencia"
                        type="text"
                        :placeholder="t('voucherPlaceholder')"
                        :disabled="tipoPago === 'Efectivo'"
                      />
                    </div>
                    <small
                      v-if="tipoPago === 'Efectivo'"
                      class="field-help"
                    >
                      {{
                        txt(
                          'El folio se genera automáticamente.',
                          'The reference is generated automatically.'
                        )
                      }}
                    </small>
                  </div>
                </div>
              </section>
              <!-- ============================================
                   MONTO
              ============================================= -->
              <section class="form-section amount-section">
                <div class="form-section-title">
                  <span>02</span>
                  <div>
                    <strong>
                      {{ txt('Monto a recibir', 'Amount to receive') }}
                    </strong>
                    <small>
                      {{
                        txt(
                          'Verifica el importe antes de confirmar.',
                          'Verify the amount before confirming.'
                        )
                      }}
                    </small>
                  </div>
                </div>
                <div class="amount-input-container">
                  <div class="amount-input-box">
                    <span class="amount-symbol">$</span>
                    <input
                      v-model="montoRecibir"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <span class="amount-mxn">MXN</span>
                  </div>
                  <div class="amount-validation">
                    <span
                      class="validation-dot"
                      :class="{
                        valid:
                          montoRecibir &&
                          Number(montoRecibir) > 0
                      }"
                    ></span>
                    {{
                      montoRecibir &&
                      Number(montoRecibir) > 0
                        ? txt(
                            'Monto válido para procesar',
                            'Valid amount to process'
                          )
                        : txt(
                            'Ingresa un monto mayor a $0',
                            'Enter an amount greater than $0'
                          )
                    }}
                  </div>
                </div>
              </section>
              <!-- ============================================
                   RESUMEN DE TRANSACCIÓN
              ============================================= -->
              <div class="transaction-review">
                <div class="review-heading">
                  <div>
                    <span class="section-kicker">
                      {{ txt('RESUMEN', 'SUMMARY') }}
                    </span>
                    <strong>
                      {{
                        txt(
                          'Revisa antes de confirmar',
                          'Review before confirming'
                        )
                      }}
                    </strong>
                  </div>
                  <span
                    class="review-status"
                    :class="{
                      ready: !isButtonDisabled
                    }"
                  >
                    <i></i>
                    {{
                      isButtonDisabled
                        ? txt('Incompleto', 'Incomplete')
                        : txt('Listo', 'Ready')
                    }}
                  </span>
                </div>
                <div class="review-grid">
                  <div class="review-item">
                    <span>
                      {{ txt('Cliente', 'Client') }}
                    </span>
                    <strong>{{ clienteActual }}</strong>
                  </div>
                  <div class="review-item">
                    <span>
                      {{ txt('Plan', 'Plan') }}
                    </span>
                    <strong>{{ planActual }}</strong>
                  </div>
                  <div class="review-item">
                    <span>
                      {{ txt('Método', 'Method') }}
                    </span>
                    <strong>{{ metodoPagoLabel }}</strong>
                  </div>
                  <div class="review-item">
                    <span>
                      {{ txt('Total', 'Total') }}
                    </span>
                    <strong class="review-total">
                      ${{ montoMostrado }}
                    </strong>
                  </div>
                </div>
              </div>
              <!-- ============================================
                   ACCIONES
              ============================================= -->
              <div
                id="tutorial-step-2"
                class="action-buttons"
              >
                <button
                  type="button"
                  class="confirm-button"
                  :disabled="isButtonDisabled"
                  @click="confirmPayment"
                >
                  <span class="button-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.4"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span class="button-text">
                    <strong>
                      {{ t('confirmPaymentBtn') }}
                    </strong>
                    <small>
                      {{
                        txt(
                          'Registrar transacción',
                          'Register transaction'
                        )
                      }}
                    </small>
                  </span>
                  <svg
                    class="button-arrow"
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="receipt-button"
                  :class="{ ready: ultimoPago }"
                  @click="downloadReceipt"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                  <span>
                    {{ t('downloadReceiptBtn') }}
                  </span>
                  <span
                    v-if="ultimoPago"
                    class="receipt-ready"
                  >
                    <i></i>
                    {{ txt('Disponible', 'Ready') }}
                  </span>
                </button>
              </div>
              <!-- PAGO CONFIRMADO -->
              <div
                v-if="ultimoPago"
                class="payment-success"
              >
                <span class="success-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </span>
                <div>
                  <strong>
                    {{
                      txt(
                        'Pago registrado correctamente',
                        'Payment registered successfully'
                      )
                    }}
                  </strong>
                  <span>
                    {{ txt('Folio', 'Reference') }}:
                    {{ ultimoPago.folio }}
                  </span>
                </div>
                <strong class="success-amount">
                  ${{ Number(ultimoPago.monto).toFixed(2) }}
                </strong>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
    <!-- ================================================
         PROMOCIONES
    ================================================= -->
    <transition name="pop">
      <div
        v-if="activeModal === 'promo'"
        class="modal-wrapper"
        @click.self="activeModal = null"
      >
        <Promo
          @select-oferta="handleSelectOferta"
          @close="activeModal = null"
        />
      </div>
    </transition>
    <!-- ================================================
         RECIBO
    ================================================= -->
    <ReciboPago
      ref="reciboRef"
      :visible="reciboVisible"
      :pago="ultimoPago"
      :locale="reciboLocale"
      @close="reciboVisible = false"
      @notify="handleReciboNotify"
    />
  </HeadingGYM_ACCOUNT>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&family=Oswald:wght@500;600;700&display=swap');
* {
  box-sizing: border-box;
}
.payment-page {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #111317);
  --text: var(--color-texto-general, #f5f7fa);
  --title: var(--color-titulos, #ffffff);
  --button: var(--color-botones, #2563eb);
  --button-text: var(--color-texto-botones, #ffffff);
  --muted: color-mix(in srgb, var(--text) 62%, transparent);
  --muted-2: color-mix(in srgb, var(--text) 42%, transparent);
  --line: color-mix(in srgb, var(--text) 11%, transparent);
  --line-strong: color-mix(in srgb, var(--text) 18%, transparent);
  --input-bg: color-mix(in srgb, var(--card) 86%, black);
  --ok: #34d399;
  --ok-text: #6ee7b7;
  --bad: #f87171;
  --bad-text: #fca5a5;
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 32px 40px 56px;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
}
.payment-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}
/* =========================================================
   HEADER
========================================================= */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.eyebrow > span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.page-header h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Anton', sans-serif;
  font-size: clamp(2.2rem, 4.5vw, 3.1rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.5px;
}
.page-header h1 strong {
  color: var(--accent);
  font-weight: 400;
}
.page-header p {
  max-width: 600px;
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.55;
}
.header-status {
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--card);
}
.status-light {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--ok);
}
.header-status small {
  display: block;
  margin-bottom: 1px;
  color: var(--muted);
  font-size: 0.75rem;
}
.header-status strong {
  display: block;
  color: var(--ok-text);
  font-size: 0.88rem;
}
/* =========================================================
   LAYOUT
========================================================= */
.payment-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.client-column,
.operations-column {
  min-width: 0;
}
/* =========================================================
   CLIENTE
========================================================= */
.client-card {
  position: relative;
  overflow: hidden;
  padding: 24px 22px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--card);
}
.card-top-line {
  position: absolute;
  top: 0;
  left: 22px;
  right: 22px;
  height: 3px;
  border-radius: 0 0 5px 5px;
  background: var(--accent);
}
.client-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.client-label {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.6px;
}
.active-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: 999px;
  color: var(--ok-text);
  background: rgba(52, 211, 153, 0.08);
  font-size: 0.72rem;
  font-weight: 600;
}
.active-pill i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ok);
}
/* ---------- FOTO (sin cambios) ---------- */
.avatar-container {
  position: relative;
  width: 132px;
  height: 132px;
  margin: 25px auto 18px;
}
.avatar-decoration {
  position: absolute;
  inset: -5px;
  border: 1px dashed
    color-mix(in srgb, var(--accent) 32%, transparent);
  border-radius: 31px;
  transform: rotate(7deg);
}
.avatar {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 2px solid
    color-mix(in srgb, var(--accent) 70%, transparent);
  border-radius: 27px;
  background: var(--input-bg);
}
.avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
/* ---------- FIN FOTO ---------- */
.client-name {
  margin-bottom: 16px;
  text-align: center;
}
.client-name h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.4px;
}
.client-name .highlight {
  margin-top: 2px;
  color: var(--accent);
}
.client-id {
  padding: 11px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input-bg);
  text-align: center;
}
.client-id span {
  display: block;
  margin-bottom: 3px;
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.client-id strong {
  color: var(--text);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
}
.client-divider {
  height: 1px;
  margin: 18px 0;
  background: var(--line);
}
.client-mini-info {
  display: grid;
  gap: 12px;
}
.client-mini-info > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.client-mini-info span {
  color: var(--muted);
  font-size: 0.8rem;
}
.client-mini-info strong {
  overflow: hidden;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* =========================================================
   BUSCADOR
========================================================= */
.operations-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.search-section {
  width: min(100%, 360px);
  align-self: flex-end;
}
.search-section > label {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
}
.search-control {
  position: relative;
  display: flex;
  align-items: center;
}
.search-control > svg {
  position: absolute;
  left: 13px;
  color: var(--muted);
  pointer-events: none;
}
.search-control input {
  width: 100%;
  height: 46px;
  padding: 0 58px 0 40px;
  border: 1px solid var(--line);
  border-radius: 11px;
  outline: none;
  background: var(--card);
  color: var(--text);
  font-family: inherit;
  font-size: 0.92rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.search-control input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}
.search-control input::placeholder {
  color: var(--muted-2);
}
.search-control kbd {
  position: absolute;
  right: 10px;
  padding: 3px 7px;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--muted);
  background: var(--input-bg);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
}
/* =========================================================
   PAYMENT CARD
========================================================= */
.payment-card {
  position: relative;
  overflow: visible;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--card);
}
.payment-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.payment-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.payment-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  border-radius: 11px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.section-kicker {
  display: block;
  margin-bottom: 2px;
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.payment-title h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  text-transform: uppercase;
}
.promo-button {
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.promo-button:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}
/* =========================================================
   FECHAS
========================================================= */
.billing-dates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.billing-date {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--input-bg);
}
.date-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: var(--muted);
  background: color-mix(in srgb, var(--text) 6%, transparent);
}
.new-date {
  border-color: rgba(52, 211, 153, 0.25);
}
.new-date .date-icon {
  color: var(--ok);
  background: rgba(52, 211, 153, 0.1);
}
.billing-date > div {
  min-width: 0;
}
.billing-date span:not(.date-icon) {
  display: block;
  margin-bottom: 2px;
  color: var(--muted);
  font-size: 0.78rem;
}
.billing-date strong {
  display: block;
  color: var(--text);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.95rem;
}
.date-arrow {
  display: flex;
  color: var(--muted-2);
}
/* =========================================================
   TOTAL
========================================================= */
.payment-summary {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
  padding: 22px;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
  border-radius: 14px;
  background: var(--input-bg);
}
.summary-main {
  min-width: 0;
  flex: 1;
}
.summary-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.summary-heading > span:first-child {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
}
.summary-state {
  padding: 3px 9px;
  border-radius: 999px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.4px;
}
.big-amount {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.big-currency {
  color: var(--muted);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.5rem;
  font-weight: 600;
}
.big-amount strong {
  color: var(--title);
  font-family: 'IBM Plex Mono', monospace;
  font-size: clamp(2.6rem, 6vw, 3.6rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1.5px;
}
.currency-code {
  margin-left: 4px;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
}
.plan-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  color: var(--muted);
  font-size: 0.88rem;
}
.plan-line strong {
  color: var(--text);
}
.plan-icon {
  display: flex;
  color: var(--accent);
}
.summary-side {
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
}
.surcharge-box {
  padding: 10px 14px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 10px;
  background: rgba(248, 113, 113, 0.07);
  text-align: right;
}
.surcharge-box span {
  display: block;
  margin-bottom: 2px;
  color: var(--bad-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.4px;
}
.surcharge-box strong {
  color: var(--bad);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
}
.promotion-applied {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ok-text);
  font-size: 0.8rem;
  font-weight: 600;
}
/* =========================================================
   FORM SECTIONS
========================================================= */
.form-section {
  padding: 22px 0;
  border-top: 1px solid var(--line);
}
.form-section-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.form-section-title > span {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 8px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  font-weight: 700;
}
.form-section-title strong {
  display: block;
  margin-bottom: 2px;
  color: var(--title);
  font-size: 1rem;
}
.form-section-title small {
  display: block;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.4;
}
.payment-details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.input-group {
  min-width: 0;
}
.input-group > label {
  display: block;
  margin-bottom: 7px;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
}
.field-control {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.field-icon {
  position: absolute;
  left: 13px;
  z-index: 2;
  color: var(--muted);
  pointer-events: none;
}
.field-control input,
.field-select {
  width: 100%;
  height: 48px;
  min-width: 0;
  padding: 0 38px 0 40px;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  outline: none;
  background: var(--input-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 0.92rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.field-control input:focus,
.field-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}
.field-control input::placeholder {
  color: var(--muted-2);
}
.field-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}
.field-select option {
  background: #16181c;
  color: #fff;
}
.select-arrow {
  position: absolute;
  right: 13px;
  color: var(--muted);
  pointer-events: none;
}
.field-control.is-disabled {
  opacity: 0.65;
}
.field-control input:disabled {
  cursor: not-allowed;
}
.field-help {
  display: block;
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.76rem;
}
/* =========================================================
   MONTO
========================================================= */
.amount-input-container {
  padding-left: 42px;
}
.amount-input-box {
  display: flex;
  align-items: center;
  min-height: 68px;
  padding: 0 18px;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
  border-radius: 12px;
  background: var(--input-bg);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.amount-input-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}
.amount-symbol {
  color: var(--muted);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
}
.amount-input-box input {
  min-width: 0;
  flex: 1;
  padding: 0 10px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--title);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.8rem;
  font-weight: 700;
}
.amount-input-box input::-webkit-inner-spin-button,
.amount-input-box input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}
.amount-mxn {
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
}
.amount-validation {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
  color: var(--muted);
  font-size: 0.82rem;
}
.validation-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bad);
}
.validation-dot.valid {
  background: var(--ok);
}
/* =========================================================
   REVIEW
========================================================= */
.transaction-review {
  margin-top: 4px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--input-bg);
}
.review-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.review-heading strong {
  display: block;
  color: var(--title);
  font-size: 0.95rem;
}
.review-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--bad-text);
  background: rgba(248, 113, 113, 0.1);
  font-size: 0.75rem;
  font-weight: 600;
}
.review-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bad);
}
.review-status.ready {
  color: var(--ok-text);
  background: rgba(52, 211, 153, 0.1);
}
.review-status.ready i {
  background: var(--ok);
}
.review-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.review-item {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 9px;
}
.review-item span {
  display: block;
  margin-bottom: 3px;
  color: var(--muted);
  font-size: 0.74rem;
}
.review-item strong {
  display: block;
  overflow: hidden;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.review-item .review-total {
  color: var(--ok-text);
  font-family: 'IBM Plex Mono', monospace;
}
/* =========================================================
   BUTTONS
========================================================= */
.action-buttons {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr);
  gap: 12px;
  margin-top: 20px;
}
.confirm-button,
.receipt-button {
  border: 0;
  font-family: inherit;
  cursor: pointer;
}
.confirm-button {
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--button);
  color: var(--button-text);
  transition: filter 0.18s ease, opacity 0.18s ease;
}
.confirm-button:hover:not(:disabled) {
  filter: brightness(1.1);
}
.confirm-button:focus-visible,
.receipt-button:focus-visible,
.promo-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.confirm-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.button-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.14);
}
.button-text {
  min-width: 0;
  flex: 1;
  text-align: left;
}
.button-text strong {
  display: block;
  font-size: 0.98rem;
}
.button-text small {
  display: block;
  margin-top: 1px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.76rem;
}
.button-arrow {
  flex-shrink: 0;
}
.receipt-button {
  position: relative;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--accent);
  font-size: 0.88rem;
  font-weight: 600;
  transition: border-color 0.18s ease, background 0.18s ease;
}
.receipt-button:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}
.receipt-button.ready {
  border-color: rgba(52, 211, 153, 0.4);
  color: var(--ok-text);
  background: rgba(52, 211, 153, 0.07);
}
.receipt-ready {
  position: absolute;
  top: 6px;
  right: 9px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--ok-text);
  font-size: 0.64rem;
}
.receipt-ready i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ok);
}
/* =========================================================
   SUCCESS
========================================================= */
.payment-success {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 13px 15px;
  border: 1px solid rgba(52, 211, 153, 0.28);
  border-radius: 11px;
  background: rgba(52, 211, 153, 0.07);
}
.success-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: var(--ok);
  background: rgba(52, 211, 153, 0.14);
}
.payment-success > div {
  min-width: 0;
  flex: 1;
}
.payment-success > div strong {
  display: block;
  margin-bottom: 2px;
  color: var(--ok-text);
  font-size: 0.9rem;
}
.payment-success > div span {
  color: var(--muted);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
}
.success-amount {
  color: var(--ok-text);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.05rem;
}
/* =========================================================
   MODAL
========================================================= */
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.82);
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.18s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}
/* =========================================================
   NOTIFICATIONS
========================================================= */
:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important;
  max-width: 480px !important;
  left: 50% !important;
  right: auto !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  transform: translateX(-50%) !important;
}
/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 950px) {
  .payment-page {
    padding: 24px 20px 40px;
  }
  .payment-layout {
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 18px;
  }
  .avatar-container {
    width: 110px;
    height: 110px;
  }
  .review-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 780px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .header-status {
    width: 100%;
  }
  .payment-layout {
    grid-template-columns: 1fr;
  }
  .client-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 15px;
    align-items: center;
  }
  .client-card-header {
    grid-column: 1 / -1;
  }
  .avatar-container {
    width: 92px;
    height: 92px;
    margin: 5px 0;
  }
  .avatar-decoration {
    border-radius: 24px;
  }
  .avatar {
    border-radius: 21px;
  }
  .client-name {
    margin: 0;
    text-align: left;
  }
  .client-id,
  .client-divider,
  .client-mini-info {
    grid-column: 1 / -1;
  }
  .client-divider {
    margin: 0;
  }
  .search-section {
    width: 100%;
    align-self: stretch;
  }
}
@media (max-width: 600px) {
  .payment-page {
    padding: 18px 12px 32px;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .payment-card {
    padding: 18px;
  }
  .payment-card-header {
    align-items: flex-start;
  }
  .promo-button {
    flex-shrink: 0;
  }
  .billing-dates {
    grid-template-columns: 1fr;
  }
  .date-arrow {
    display: none;
  }
  .payment-summary {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
  .summary-side {
    width: 100%;
    align-items: stretch;
  }
  .surcharge-box {
    text-align: left;
  }
  .payment-details-grid {
    grid-template-columns: 1fr;
  }
  .amount-input-container {
    padding-left: 0;
  }
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 400px) {
  .client-card {
    display: block;
  }
  .client-card-header {
    margin-bottom: 18px;
  }
  .avatar-container {
    margin: 0 auto 15px;
  }
  .client-name {
    margin-bottom: 14px;
    text-align: center;
  }
  .client-id {
    margin-top: 10px;
  }
  .client-divider {
    margin: 14px 0;
  }
  .payment-card-header {
    flex-direction: column;
  }
  .promo-button {
    width: 100%;
  }
  .review-grid {
    grid-template-columns: 1fr;
  }
  .success-amount {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>