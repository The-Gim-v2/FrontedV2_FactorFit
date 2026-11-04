<template>
<div class="reactivate-backdrop" @click.self="emit('close')">
<section class="reactivate-window" role="dialog" aria-modal="true" aria-labelledby="react-title">
<!-- ENCABEZADO -->
<header class="react-header">
<span class="react-badge">
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
</span>
<div class="react-titles">
<small>{{ tr('heading') }}</small>
<h2 id="react-title">{{ tr('reactivate') }} <span>{{ tr('account') }}</span></h2>
<p>{{ tr('subtitle') }}</p>
</div>
<button type="button" class="close" @click="emit('close')" :aria-label="tr('close')">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
</button>
</header>
<!-- CONTENIDO -->
<main class="react-body">
<div v-if="loading" class="skeleton" role="status" :aria-label="tr('loadingDebt')">
<div class="sk sk-lg"></div><div class="sk sk-md"></div><div class="sk sk-md"></div>
</div>
<p v-if="error" class="feedback danger" role="alert">
<span>{{error}}</span>
<button type="button" @click="cargar">{{ tr('retry') }}</button>
</p>
<template v-if="cliente">
<!-- 01 CLIENTE -->
<section class="react-card">
<div class="section-head"><span>01</span><div><strong>{{ tr('clientAccount') }}</strong><small>{{ tr('branchData') }}</small></div></div>
<div class="client-row">
<div class="client-avatar" :style="{backgroundImage:avatarBg(cliente.nombre)}">{{initials(cliente.nombre)}}</div>
<div class="client-info">
<strong>{{cliente.nombre}}</strong>
<span class="client-mail">
<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
{{cliente.correo||tr('noEmail')}}
</span>
</div>
</div>
<div class="client-tags">
<span class="tag" :class="estatusClass(cliente.estatus_inscripcion)"><i></i>{{ traducirEstatus(cliente.estatus_inscripcion) }}</span>
<span class="tag tag-plain">
<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
{{cliente.plan}}
</span>
<span class="tag tag-plain">
<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
{{ tr('expires') }}: {{fecha(cliente.fecha_vencimiento)}}
</span>
</div>
</section>
<!-- 02 DESGLOSE -->
<section class="react-card">
<div class="section-head"><span>02</span><div><strong>{{ tr('breakdown') }}</strong><small>{{ tr('calculatedAmounts') }}</small></div></div>
<ul class="breakdown">
<li v-for="f in filas" :key="f.k" :class="['row-'+f.tone,{zero:!(f.amount>0)}]">
<span class="row-icon">
<svg v-if="f.icon==='alert'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<svg v-else-if="f.icon==='clock'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
<svg v-else-if="f.icon==='card'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
<svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>
</span>
<span class="row-label">{{f.label}}</span>
<strong class="row-amount">{{f.negative&&f.amount>0?'- ':''}}{{moneda(f.amount)}}</strong>
</li>
</ul>
</section>
<!-- TOTAL -->
<div class="total-card" :class="{'total-free':desglose.total<=0}">
<span class="total-icon">$</span>
<div class="total-text"><small>{{ tr('totalCharge') }}</small><strong>{{ tr('membershipReactivation') }}</strong></div>
<div class="total-amount"><b>{{desglose.total>0?moneda(desglose.total):tr('noCharge')}}</b><em v-if="desglose.total>0">MXN</em></div>
</div>
<!-- 03 MÉTODO DE PAGO -->
<section class="react-card">
<div class="section-head"><span>03</span><div><strong>{{ tr('paymentMethod') }}</strong><small>{{ tr('serverStatus') }}</small></div></div>
<template v-if="desglose.total>0">
<div class="methods" role="radiogroup" :aria-label="tr('paymentMethod')">
<button v-for="m in metodosPago" :key="m.value" type="button" role="radio" class="method-tile" :class="{active:metodo===m.value}" :aria-checked="metodo===m.value" @click="metodo=m.value">
<span class="method-icon">
<svg v-if="m.icon==='cash'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>
<svg v-else-if="m.icon==='transfer'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 21h18"/></svg>
<svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>
</span>
<span class="method-text"><strong>{{m.label}}</strong><small>{{m.hint}}</small></span>
<span class="method-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
</button>
</div>
<div class="reference">
<label for="folio-re">
{{ tr('folioReference') }}
<span v-if="metodo" class="folio-badge" :class="folioAutomatico?'auto':'required'">{{ folioAutomatico?tr('automatic'):tr('required') }}</span>
</label>
<div class="field-control" :class="{'is-disabled':metodo!=='Transferencia'}">
<svg class="field-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<*template* v-if="metodo!=='Transferencia'"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></*template*>
<*template* v-else><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></*template*>
</svg>
<input id="folio-re" v-model.trim="referencia" type="text" autocomplete="off" :disabled="metodo!=='Transferencia'" :placeholder="folioPlaceholder" />
</div>
<p v-if="folioAyuda" class="folio-note">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
<span>{{folioAyuda}}</span>
</p>
</div>
</template>
<p v-else class="info">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>
<span>{{ tr('alreadyPaid') }}</span>
</p>
</section>
<p v-if="saveError" role="alert" class="feedback danger"><span>{{saveError}}</span></p>
</template>
</main>
<!-- PIE FIJO -->
<footer v-if="cliente" class="actions">
<p class="foot-hint" :class="{ok:footHint.ok}" role="status">
<svg v-if="footHint.ok" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
<svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<span>{{footHint.text}}</span>
</p>
<div class="foot-buttons">
<button type="button" class="cancel" @click="emit('close')">{{ tr('cancel') }}</button>
<button type="button" class="confirm" :disabled="guardando||loading||!cliente||(desglose.total>0&&!metodo)" @click="guardar">
<span v-if="guardando" class="spin" aria-hidden="true"></span>
{{guardando?tr('processing'):desglose.total>0?tr('chargeReactivate'):tr('restoreAccount')}}
</button>
</div>
</footer>
</section>
</div>
</template>
<script setup lang="ts">
import {ref,onMounted,onUnmounted,computed,watch} from 'vue';
const i18n={ heading:{"es":"GESTIÓN DE MEMBRESÍAS / RENOVACIONES","en":"MEMBERSHIP MANAGEMENT / RENEWALS"},reactivate:{"es":"Reactivar","en":"Reactivate"},account:{"es":"cuenta","en":"account"},subtitle:{"es":"Regulariza el adeudo y confirma la renovación para habilitar el acceso.","en":"Settle the outstanding balance and confirm renewal to restore access."},close:{"es":"Cerrar","en":"Close"},loadingDebt:{"es":"Consultando el adeudo real del cliente","en":"Loading the customer’s outstanding balance"},retry:{"es":"Reintentar","en":"Retry"},clientAccount:{"es":"Cuenta del cliente","en":"Member account"},branchData:{"es":"Datos registrados en la sucursal","en":"Details registered at this branch"},noEmail:{"es":"Sin correo registrado","en":"No email on file"},expires:{"es":"Vence","en":"Expires"},breakdown:{"es":"Desglose de reactivación","en":"Reactivation breakdown"},calculatedAmounts:{"es":"Importes calculados por el sistema","en":"Amounts calculated by the system"},totalCharge:{"es":"TOTAL A COBRAR","en":"TOTAL TO CHARGE"},membershipReactivation:{"es":"Reactivación de membresía","en":"Membership reactivation"},noCharge:{"es":"Sin cobro","en":"No charge"},paymentMethod:{"es":"Método de pago","en":"Payment method"},serverStatus:{"es":"El estado cambiará solo después de la respuesta del servidor","en":"The status will change only after server confirmation"},folioReference:{"es":"Folio / Referencia","en":"Receipt / Reference"},automatic:{"es":"AUTOMÁTICO","en":"AUTOMATIC"},required:{"es":"OBLIGATORIO","en":"REQUIRED"},alreadyPaid:{"es":"La cuenta ya tiene cobertura pagada. Se restaurará sin generar otro cobro.","en":"This account is already paid through the current period. It will be restored without an additional charge."},cancel:{"es":"Cancelar","en":"Cancel"},processing:{"es":"Procesando...","en":"Processing..."},chargeReactivate:{"es":"Cobrar y reactivar","en":"Charge and reactivate"},restoreAccount:{"es":"Restaurar cuenta","en":"Restore account"},cash:{"es":"Efectivo","en":"Cash"},transfer:{"es":"Transferencia","en":"Bank transfer"},card:{"es":"Tarjeta","en":"Card"},autoFolio:{"es":"Folio automático","en":"Automatic receipt number"},requiredRef:{"es":"Referencia obligatoria","en":"Reference required"},stripeQR:{"es":"QR de Stripe","en":"Stripe QR"},receiptNumber:{"es":"Número del comprobante","en":"Receipt reference number"},folioOnConfirm:{"es":"Se asigna al confirmar el pago","en":"Assigned when payment is confirmed"},folioStripe:{"es":"Lo asigna Stripe al cobrar","en":"Assigned by Stripe after payment"},chooseMethod:{"es":"Elige primero un método de pago","en":"Choose a payment method first"},cashHelp:{"es":"El folio real se genera al confirmar el pago y aparecerá en el recibo. No necesitas capturarlo.","en":"The receipt number is generated after payment confirmation. You do not need to enter it."},transferHelp:{"es":"Captura el folio o número de referencia que aparece en el comprobante de la transferencia.","en":"Enter the reference number shown on the bank transfer receipt."},cardHelp:{"es":"El folio se asigna cuando Stripe confirma el cobro y aparecerá en el recibo.","en":"The receipt number is assigned when Stripe confirms the payment."},pastDebt:{"es":"Adeudo anterior","en":"Previous balance"},fees:{"es":"Recargos ya registrados","en":"Accrued late fees"},newMembership:{"es":"Nueva membresía, cuando corresponde","en":"New membership, if applicable"},credit:{"es":"Saldo a favor","en":"Account credit"},processingHint:{"es":"Procesando el cobro, no cierres esta ventana...","en":"Processing payment, please do not close this window..."},noPaymentHint:{"es":"Sin cobro pendiente. La cuenta se restaurará.","en":"No outstanding payment. The account will be restored."},chooseHint:{"es":"Elige un método de pago para continuar.","en":"Choose a payment method to continue."},referenceHint:{"es":"Captura la referencia de la transferencia.","en":"Enter the bank transfer reference."},readyHint:{"es":"Todo listo para cobrar y reactivar.","en":"Ready to charge and reactivate."},loginAgain:{"es":"Inicia sesión nuevamente.","en":"Please sign in again."},loadError:{"es":"No se pudo consultar la cuenta.","en":"Could not load the account."},selectMethodError:{"es":"Selecciona un método de pago.","en":"Select a payment method."},referenceError:{"es":"La transferencia necesita su referencia.","en":"A bank transfer reference is required."},saveError:{"es":"No se pudo reactivar. No se confirmó ningún pago.","en":"Reactivation failed. No payment was confirmed."},statusActive:{"es":"Activo","en":"Active"},statusInactive:{"es":"Inactivo","en":"Inactive"},statusPending:{"es":"Pendiente","en":"Pending"},statusUpcoming:{"es":"Próximo a vencer","en":"Expiring soon"},statusTolerance:{"es":"En tolerancia","en":"In grace period"},statusExtra:{"es":"Pago con recargo","en":"Late fee due"},statusVisit:{"es":"Visita","en":"Day pass"},statusDeleted:{"es":"Eliminado temporal","en":"Temporarily removed"} } as Record<string,{es:string;en:string}>;
const idioma=ref<'es'|'en'>('es');const idiomaActual=()=>{const v=localStorage.getItem('GYM_ACCOUNT-idioma')||localStorage.getItem('app-language')||localStorage.getItem('language')||'es';return v.toLowerCase().startsWith('en')?'en':'es';};const tr=(k:string)=>i18n[k]?.[idioma.value]||i18n[k]?.es||k;const traducirEstatus=(s:string)=>{const e=String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const m:Record<string,string>={'activo':'statusActive','inactivo':'statusInactive','pendiente':'statusPending','proximo a vencer':'statusUpcoming','en tolerancia':'statusTolerance','tolerancia':'statusTolerance','pago con recargo':'statusExtra','visita':'statusVisit','eliminado temporal':'statusDeleted'};return m[e]?tr(m[e]):s;};const actualizarIdioma=(ev?:Event)=>{const v=(ev as CustomEvent)?.detail?.idioma;idioma.value=String(v||idiomaActual()).toLowerCase().startsWith('en')?'en':'es';};
onMounted(()=>{actualizarIdioma();window.addEventListener('idioma-changed',actualizarIdioma);window.addEventListener('storage',actualizarIdioma);});onUnmounted(()=>{window.removeEventListener('idioma-changed',actualizarIdioma);window.removeEventListener('storage',actualizarIdioma);});
const props=defineProps<{inscripcionId:number;sedeId:number}>();const emit=defineEmits<{(e:'close'):void;(e:'reactivated'):void}>();
type Desglose={adeudo:number;recargos:number;renovacion:number;saldo_a_favor:number;total:number};type Cliente={nombre:string;correo:string|null;plan:string;estatus_inscripcion:string;fecha_vencimiento:string|null;desglose:Desglose};
const API=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');const cliente=ref<Cliente|null>(null),loading=ref(false),guardando=ref(false),error=ref(''),saveError=ref(''),metodo=ref(''),referencia=ref('');const desglose=computed<Desglose>(()=>cliente.value?.desglose||{adeudo:0,recargos:0,renovacion:0,saldo_a_favor:0,total:0});
// La tarjeta (Stripe) no está disponible al reactivar. Cambia a true cuando el servidor la soporte y aparecerá sola.
const TARJETA_HABILITADA=false;
const metodosPago=computed(()=>[{value:'Efectivo',label:tr('cash'),hint:tr('autoFolio'),icon:'cash'},{value:'Transferencia',label:tr('transfer'),hint:tr('requiredRef'),icon:'transfer'},...(TARJETA_HABILITADA?[{value:'Tarjeta',label:tr('card'),hint:tr('stripeQR'),icon:'card'}]:[])]);
watch(metodo,n=>{if(n!=='Transferencia')referencia.value='';});
const folioAutomatico=computed(()=>metodo.value==='Efectivo'||metodo.value==='Tarjeta');
const folioPlaceholder=computed(()=>metodo.value==='Transferencia'?tr('receiptNumber'):metodo.value==='Efectivo'?tr('folioOnConfirm'):metodo.value==='Tarjeta'?tr('folioStripe'):tr('chooseMethod'));
const folioAyuda=computed(()=>({Efectivo:tr('cashHelp'),Transferencia:tr('transferHelp'),Tarjeta:tr('cardHelp')} as Record<string,string>)[metodo.value]||'');
// Filas del desglose (misma información, presentada con icono y color por concepto).
const filas=computed(()=>[
{k:'adeudo',label:tr('pastDebt'),amount:desglose.value.adeudo,tone:'bad',icon:'alert',negative:false},
{k:'recargos',label:tr('fees'),amount:desglose.value.recargos,tone:'warn',icon:'clock',negative:false},
{k:'renovacion',label:tr('newMembership'),amount:desglose.value.renovacion,tone:'info',icon:'card',negative:false},
{k:'saldo',label:tr('credit'),amount:desglose.value.saldo_a_favor,tone:'ok',icon:'check',negative:true}
]);
// Mensaje guía del pie: dice qué falta antes de poder confirmar.
const footHint=computed(()=>{
if(guardando.value)return{ok:false,text:tr('processingHint')};
if(desglose.value.total<=0)return{ok:true,text:tr('noPaymentHint')};
if(!metodo.value)return{ok:false,text:tr('chooseHint')};
if(metodo.value==='Transferencia'&&!referencia.value)return{ok:false,text:tr('referenceHint')};
return{ok:true,text:tr('readyHint')};
});
const initials=(n:string)=>{const p=String(n||'').trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'?';};
const gradients=['linear-gradient(135deg,#7e22ce,#4c1d95)','linear-gradient(135deg,#ea580c,#9a3412)','linear-gradient(135deg,#db2777,#9d174d)','linear-gradient(135deg,#dc2626,#7f1d1d)','linear-gradient(135deg,#2563eb,#1e3a8a)','linear-gradient(135deg,#059669,#064e3b)'];
const avatarBg=(n:string)=>{let h=0;for(const c of String(n||''))h=(h*31+c.charCodeAt(0))>>>0;return gradients[h%gradients.length];};
const estatusClass=(s:string)=>s==='Inactivo'?'tag-red':s==='Eliminado temporal'?'tag-yellow':'tag-blue';
const onEsc=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!guardando.value)emit('close');};
onMounted(()=>window.addEventListener('keydown',onEsc));
onUnmounted(()=>window.removeEventListener('keydown',onEsc));
const token=()=>{for(const st of [sessionStorage,localStorage]){for(const k of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']){const v=st.getItem(k);if(v)return v.replace(/^Bearer\s+/i,'');}for(const k of ['auth','user','session','gymAccount','gym_account'])try{const x=JSON.parse(st.getItem(k)||'null');if(x?.token||x?.access_token||x?.accessToken)return String(x.token||x.access_token||x.accessToken).replace(/^Bearer\s+/i,'');}catch{}}return '';};
const request=async(path:string,init:RequestInit={})=>{const t=token();if(!t)throw new Error(tr('loginAgain'));const r=await fetch(`${API}/api/gym/reactivaciones/${props.inscripcionId}${path}`,{...init,headers:{Accept:'application/json',Authorization:`Bearer ${t}`,...(init.body?{'Content-Type':'application/json'}:{}),...(init.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok){const e=d.errors?Object.values(d.errors).flat().join(' '):'';throw new Error(e||d.message||`Error HTTP ${r.status}`);}return d;};
const cargar=async()=>{loading.value=true;error.value='';cliente.value=null;try{const d=await request(`?sede_id=${props.sedeId}`);cliente.value=d.cliente;}catch(e:any){error.value=e?.message||tr('loadError');}finally{loading.value=false;}};
const guardar=async()=>{if(guardando.value||!cliente.value)return;saveError.value='';if(desglose.value.total>0&&!metodo.value){saveError.value=tr('selectMethodError');return;}if(metodo.value==='Transferencia'&&!referencia.value){saveError.value=tr('referenceError');return;}guardando.value=true;try{await request('',{method:'POST',body:JSON.stringify({sede_id:props.sedeId,monto:desglose.value.total,metodo_pago:desglose.value.total>0?metodo.value:null,referencia_pago:metodo.value==='Transferencia'?referencia.value:null})});emit('reactivated');}catch(e:any){saveError.value=e.message||tr('saveError');}finally{guardando.value=false;}};
const moneda=(n:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(n)||0);const fecha=(v:string|null)=>{const m=String(v||'').match(/^(\d{4})-(\d\d)-(\d\d)/);return m?`${m[3]}/${m[2]}/${m[1]}`:'—';};onMounted(()=>void cargar());
</script>
<style scoped>
*{box-sizing:border-box}
/* ---------- Ventana ---------- */
.reactivate-backdrop{position:fixed;z-index:11000;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(4,4,8,.74);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:var(--color-texto-general,#f5f5f7);font-family:'Inter',system-ui,sans-serif;animation:react-fade .18s ease}
.reactivate-window{--accent:var(--color-highlight,#60a5fa);--bd:rgba(255,255,255,.11);--muted:#9ca3b8;--ok:#34d399;--warn:#fbbf24;--bad:#f87171;position:relative;width:min(760px,100%);max-height:94vh;display:flex;flex-direction:column;overflow:hidden;background:var(--bg-cards,#191a25);border:1px solid rgba(255,255,255,.14);border-radius:20px;box-shadow:0 35px 90px rgba(0,0,0,.65);animation:react-in .24s cubic-bezier(.2,.8,.2,1)}
.reactivate-window::before{content:'';position:absolute;z-index:2;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.85;pointer-events:none}
@keyframes react-fade{from{opacity:0}to{opacity:1}}
@keyframes react-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
/* ---------- Encabezado ---------- */
.react-header{flex:none;display:flex;align-items:center;gap:16px;padding:24px 26px 20px;border-bottom:1px solid rgba(255,255,255,.09);background:linear-gradient(110deg,color-mix(in srgb,var(--accent) 12%,transparent),transparent 70%)}
.react-badge{width:50px;height:50px;flex:none;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);border-radius:15px;background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent);box-shadow:0 8px 22px color-mix(in srgb,var(--accent) 14%,transparent)}
.react-titles{min-width:0;flex:1}
.react-titles small{display:block;font-size:10.5px;letter-spacing:1.3px;font-weight:800;color:var(--accent)}
.react-titles h2{margin:5px 0 4px;font-family:'Oswald',sans-serif;font-size:28px;font-weight:700;line-height:1.15;text-transform:uppercase;letter-spacing:.02em}
.react-titles h2 span{color:var(--accent)}
.react-titles p{margin:0;font-size:13px;color:#a9acbc;line-height:1.5}
.close{width:36px;height:36px;flex:none;display:grid;place-items:center;padding:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:50%;color:#c4c5d0;cursor:pointer;align-self:flex-start;transition:background .18s ease,color .18s ease,transform .18s ease,border-color .18s ease}
.close:hover{background:color-mix(in srgb,var(--accent) 18%,transparent);border-color:color-mix(in srgb,var(--accent) 55%,transparent);color:#fff;transform:rotate(90deg)}
.close:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
/* ---------- Cuerpo con scroll ---------- */
.react-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:20px 26px 24px;display:grid;gap:14px;align-content:start;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}
.react-body::-webkit-scrollbar{width:8px}
.react-body::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:999px;background:rgba(255,255,255,.2);background-clip:content-box}
.react-card{padding:20px;border:1px solid var(--bd);border-radius:16px;background:rgba(255,255,255,.025)}
.section-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.section-head>span{display:grid;place-items:center;width:34px;height:34px;flex:none;font-size:12px;font-weight:800;color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);background:color-mix(in srgb,var(--accent) 9%,transparent);border-radius:10px}
.section-head>div{display:flex;flex-direction:column;gap:3px;min-width:0}
.section-head strong{font-family:'Oswald',sans-serif;font-size:17px;font-weight:600}
.section-head small{color:var(--muted);font-size:12px}
/* ---------- Cliente ---------- */
.client-row{display:flex;align-items:center;gap:14px}
.client-avatar{width:56px;height:56px;flex:none;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);border-radius:16px;color:#fff;font-size:1rem;font-weight:700;letter-spacing:.02em;box-shadow:0 8px 20px rgba(0,0,0,.3)}
.client-info{min-width:0;display:flex;flex-direction:column;gap:5px}
.client-info>strong{font-size:16px;font-weight:650;color:#fff;overflow-wrap:anywhere}
.client-mail{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:12.5px;overflow-wrap:anywhere}
.client-mail svg{flex:none;opacity:.7}
.client-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.07)}
.tag{display:inline-flex;align-items:center;gap:7px;min-height:28px;padding:5px 12px;border:1px solid;border-radius:999px;font-size:11.5px;font-weight:650;white-space:nowrap}
.tag i{width:6px;height:6px;flex:none;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 16%,transparent)}
.tag-red{color:#f87171;border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.09)}
.tag-yellow{color:#fbbf24;border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.09)}
.tag-blue{color:#60a5fa;border-color:rgba(96,165,250,.3);background:rgba(96,165,250,.09)}
.tag-plain{color:#d6d8e3;border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.04);font-weight:600}
.tag-plain svg{opacity:.7}
/* ---------- Desglose ---------- */
.breakdown{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.breakdown li{display:flex;align-items:center;gap:12px;padding:11px 13px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(0,0,0,.16)}
.row-icon{width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:9px;color:var(--c);background:color-mix(in srgb,var(--c) 13%,transparent)}
.row-bad{--c:var(--bad)}.row-warn{--c:var(--warn)}.row-info{--c:#60a5fa}.row-ok{--c:var(--ok)}
.row-label{flex:1;min-width:0;font-size:13px;color:#c8cbd8;line-height:1.35}
.row-amount{flex:none;font-size:14px;font-weight:700;color:#f4f5fa;white-space:nowrap}
.row-ok .row-amount{color:var(--ok)}
.breakdown li.zero .row-label{color:#7d8298}
.breakdown li.zero .row-amount{color:#7d8298;font-weight:600}
.breakdown li.zero .row-icon{opacity:.55}
/* ---------- Total ---------- */
.total-card{display:flex;align-items:center;gap:14px;padding:18px 20px;border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:16px;background:linear-gradient(115deg,color-mix(in srgb,var(--accent) 18%,transparent),rgba(6,13,37,.3));box-shadow:0 14px 34px color-mix(in srgb,var(--accent) 10%,transparent)}
.total-icon{width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:13px;background:color-mix(in srgb,var(--accent) 20%,transparent);color:var(--accent);font-family:'Oswald',sans-serif;font-size:22px;font-weight:700}
.total-text{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
.total-text small{font-size:10.5px;color:var(--accent);font-weight:800;letter-spacing:.9px}
.total-text strong{font-family:'Oswald',sans-serif;font-size:17px;font-weight:600}
.total-amount{display:flex;align-items:baseline;gap:7px;flex:none}
.total-amount b{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;line-height:1;color:var(--ok);white-space:nowrap}
.total-amount em{font-style:normal;font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--muted)}
.total-card.total-free{border-color:rgba(52,211,153,.4);background:linear-gradient(115deg,rgba(52,211,153,.14),rgba(6,13,37,.3));box-shadow:0 14px 34px rgba(52,211,153,.08)}
.total-card.total-free .total-icon{background:rgba(52,211,153,.18);color:var(--ok)}
.total-card.total-free .total-text small{color:var(--ok)}
.total-card.total-free .total-amount b{font-size:22px}
/* ---------- Método de pago ---------- */
.methods{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px}
.method-tile{position:relative;min-width:0;min-height:70px;display:flex;align-items:center;gap:12px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:rgba(0,0,0,.2);color:#e5e7eb;font-family:inherit;text-align:left;cursor:pointer;transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .18s ease}
.method-tile:hover{border-color:color-mix(in srgb,var(--accent) 55%,rgba(255,255,255,.16));transform:translateY(-1px)}
.method-tile:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.method-tile.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,rgba(0,0,0,.2));box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}
.method-icon{width:42px;height:42px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:11px;color:var(--muted);background:rgba(255,255,255,.07);transition:color .18s ease,background .18s ease}
.method-tile.active .method-icon{color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,transparent)}
.method-text{min-width:0}
.method-text strong{display:block;color:#fff;font-size:.95rem;font-weight:600;line-height:1.25}
.method-text small{display:block;margin-top:2px;color:var(--muted);font-size:.78rem;line-height:1.3}
.method-check{position:absolute;top:8px;right:8px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--accent);color:#111;opacity:0;transform:scale(.6);transition:opacity .18s ease,transform .18s ease}
.method-tile.active .method-check{opacity:1;transform:scale(1)}
/* ---------- Folio / referencia ---------- */
.reference{display:flex;flex-direction:column;gap:9px}
.reference label{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;font-weight:700}
.folio-badge{padding:2px 8px;border-radius:999px;font-size:.68rem;font-weight:700;letter-spacing:.6px}
.folio-badge.auto{color:#6ee7b7;background:rgba(52,211,153,.12)}
.folio-badge.required{color:#fcd34d;background:rgba(251,191,36,.12)}
.field-control{position:relative;display:flex;align-items:center}
.field-icon{position:absolute;left:14px;color:var(--muted);pointer-events:none}
.reference input{width:100%;height:46px;border-radius:11px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.15);color:#fff;padding:0 13px 0 40px;font-family:inherit;font-size:13px;outline:none;transition:border-color .18s ease,box-shadow .18s ease}
.reference input::placeholder{color:#7d8298}
.reference input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}
.reference input:disabled{opacity:.55;cursor:not-allowed}
.field-control.is-disabled .field-icon{opacity:.6}
.folio-note{display:flex;align-items:flex-start;gap:10px;margin:2px 0 0;padding:10px 12px;border:1px solid color-mix(in srgb,var(--accent) 24%,transparent);border-radius:10px;background:color-mix(in srgb,var(--accent) 6%,transparent);color:#a9acbc;font-size:.82rem;line-height:1.45}
.folio-note svg{flex:none;margin-top:2px;color:var(--accent)}
.info{display:flex;align-items:center;gap:11px;margin:0;padding:13px 15px;border:1px solid rgba(52,211,153,.28);border-radius:12px;background:rgba(52,211,153,.07);color:#a7f3d0;font-size:13px;line-height:1.45}
.info svg{flex:none;color:var(--ok)}
/* ---------- Mensajes ---------- */
.feedback{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:12px 14px;border:1px solid rgba(96,165,250,.2);border-radius:12px;font-size:13px;line-height:1.45}
.danger{color:#fda4af;border-color:rgba(244,63,94,.32);background:rgba(244,63,94,.07)}
.feedback button{flex:none;padding:6px 12px;border:1px solid rgba(253,164,175,.4);border-radius:8px;background:transparent;color:inherit;font-family:inherit;font-size:12px;font-weight:650;cursor:pointer;transition:background .15s ease}
.feedback button:hover{background:rgba(244,63,94,.12)}
/* ---------- Carga (esqueleto) ---------- */
.skeleton{display:grid;gap:14px}
.sk{border-radius:16px;background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 70%);background-size:220% 100%;animation:react-shimmer 1.3s linear infinite}
.sk-lg{height:128px}
.sk-md{height:96px}
@keyframes react-shimmer{from{background-position:120% 0}to{background-position:-120% 0}}
/* ---------- Pie fijo ---------- */
.actions{flex:none;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 26px;border-top:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.22)}
.foot-hint{display:flex;align-items:center;gap:9px;margin:0;min-width:0;color:#fcd34d;font-size:12.5px;font-weight:550;line-height:1.35}
.foot-hint svg{flex:none}
.foot-hint.ok{color:#6ee7b7}
.foot-buttons{display:flex;gap:10px;flex:none}
.actions button{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:44px;padding:0 20px;border-radius:12px;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;transition:background .18s ease,transform .18s ease,box-shadow .18s ease,opacity .18s ease}
.cancel{color:#d1d5db;background:transparent;border:1px solid rgba(255,255,255,.18)}
.cancel:hover{background:rgba(255,255,255,.07);transform:translateY(-1px)}
.confirm{color:var(--color-texto-botones,#fff);background:var(--color-botones,#2563eb);border:0;box-shadow:0 10px 24px color-mix(in srgb,var(--color-botones,#2563eb) 30%,transparent)}
.confirm:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 30px color-mix(in srgb,var(--color-botones,#2563eb) 40%,transparent)}
.confirm:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.actions button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.spin{width:15px;height:15px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:react-spin .7s linear infinite}
@keyframes react-spin{to{transform:rotate(360deg)}}
/* ---------- Móvil: hoja inferior ---------- */
@media(max-width:600px){
.reactivate-backdrop{align-items:flex-end;padding:0}
.reactivate-window{max-height:95dvh;border-radius:20px 20px 0 0;border-bottom:0}
.react-header{padding:18px 16px 16px;gap:12px}
.react-badge{width:42px;height:42px;border-radius:13px}
.react-titles h2{font-size:22px}
.react-titles p{display:none}
.react-body{padding:14px 14px 18px;gap:12px}
.react-card{padding:16px}
.client-avatar{width:48px;height:48px;border-radius:14px}
.total-card{padding:15px;gap:11px;flex-wrap:wrap}
.total-text{flex:1 1 140px}
.total-amount{width:100%;justify-content:flex-end}
.total-amount b{font-size:26px}
.methods{grid-template-columns:1fr;gap:10px}
.actions{flex-direction:column;align-items:stretch;gap:12px;padding:14px 14px calc(14px + env(safe-area-inset-bottom))}
.foot-buttons{flex-direction:column-reverse}
.actions button{width:100%}
}
@media(prefers-reduced-motion:reduce){
.reactivate-backdrop,.reactivate-window,.sk,.spin{animation:none!important}
.close,.method-tile,.method-icon,.method-check,.actions button,.reference input{transition:none!important}
}
</style>
