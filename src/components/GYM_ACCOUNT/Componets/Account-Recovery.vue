<template>
<div class="reactivate-backdrop" @click.self="emit('close')">
  <section class="reactivate-window" role="dialog" aria-modal="true" aria-label="Reactivar cuenta">
    <header class="react-header">
      <div>
        <small>GESTIÓN DE MEMBRESÍAS / RENOVACIONES</small>
        <h2>REACTIVAR <span>CUENTA</span></h2>
        <p>Regulariza el adeudo y confirma la renovación para habilitar el acceso.</p>
      </div>
      <button type="button" class="close" @click="emit('close')" aria-label="Cerrar">×</button>
    </header>
    <main class="react-body">
      <p v-if="loading" class="feedback">Consultando el adeudo real del cliente...</p>
      <p v-if="error" class="feedback danger" role="alert">{{error}} <button type="button" @click="cargar">Reintentar</button></p>
      <template v-if="cliente">
        <section class="react-card">
          <div class="section-head"><span>01</span><div><strong>Cuenta del cliente</strong><small>Datos registrados en la sucursal</small></div></div>
          <div class="client-data">
            <strong>{{cliente.nombre}}</strong>
            <span>{{cliente.correo||'Sin correo registrado'}}</span>
            <div class="client-tags"><span>{{cliente.estatus_inscripcion}}</span><span>{{cliente.plan}}</span><span>Vencimiento: {{fecha(cliente.fecha_vencimiento)}}</span></div>
          </div>
        </section>
        <section class="react-card">
          <div class="section-head"><span>02</span><div><strong>Desglose de reactivación</strong><small>Importes calculados por Laravel, sin valores de ejemplo</small></div></div>
          <div class="breakdown">
            <div><span>Adeudo anterior</span><strong>{{moneda(desglose.adeudo)}}</strong></div>
            <div><span>Recargos ya registrados</span><strong>{{moneda(desglose.recargos)}}</strong></div>
            <div><span>Nueva membresía, cuando corresponde</span><strong>{{moneda(desglose.renovacion)}}</strong></div>
            <div><span>Saldo a favor</span><strong>- {{moneda(desglose.saldo_a_favor)}}</strong></div>
          </div>
        </section>
        <div class="total-card">
          <div><small>TOTAL A COBRAR</small><strong>Reactivación de membresía</strong></div>
          <b>{{moneda(desglose.total)}}</b>
        </div>
        <section class="react-card">
          <div class="section-head"><span>03</span><div><strong>Método de pago</strong><small>El estado cambiará solo después de la respuesta del servidor</small></div></div>
          <template v-if="desglose.total>0">
            <div class="methods" role="radiogroup" aria-label="Método de pago">
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
                Folio / Referencia
                <span v-if="metodo" class="folio-badge" :class="folioAutomatico?'auto':'required'">{{folioAutomatico?'AUTOMÁTICO':'OBLIGATORIO'}}</span>
              </label>
              <div class="field-control" :class="{'is-disabled':metodo!=='Transferencia'}">
                <svg class="field-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <template v-if="metodo!=='Transferencia'"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></template>
                  <template v-else><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></template>
                </svg>
                <input id="folio-re" v-model.trim="referencia" type="text" autocomplete="off" :disabled="metodo!=='Transferencia'" :placeholder="folioPlaceholder" />
              </div>
              <p v-if="folioAyuda" class="folio-note">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
                <span>{{folioAyuda}}</span>
              </p>
            </div>
          </template>
          <p v-else class="info">La cuenta ya tiene cobertura pagada. Se restaurará sin generar otro cobro.</p>
        </section>
        <p v-if="saveError" role="alert" class="feedback danger">{{saveError}}</p>
        <footer class="actions">
          <button type="button" class="cancel" @click="emit('close')">Cancelar</button>
          <button type="button" class="confirm" :disabled="guardando||loading||!cliente||(desglose.total>0&&!metodo)" @click="guardar">{{guardando?'Procesando...':desglose.total>0?'Cobrar y reactivar':'Restaurar cuenta'}}</button>
        </footer>
      </template>
    </main>
  </section>
</div>
</template>
<script setup lang="ts">
import {ref,onMounted,computed,watch} from 'vue';
const props=defineProps<{inscripcionId:number;sedeId:number}>();const emit=defineEmits<{(e:'close'):void;(e:'reactivated'):void}>();
type Desglose={adeudo:number;recargos:number;renovacion:number;saldo_a_favor:number;total:number};type Cliente={nombre:string;correo:string|null;plan:string;estatus_inscripcion:string;fecha_vencimiento:string|null;desglose:Desglose};
const API=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');const cliente=ref<Cliente|null>(null),loading=ref(false),guardando=ref(false),error=ref(''),saveError=ref(''),metodo=ref(''),referencia=ref('');const desglose=computed<Desglose>(()=>cliente.value?.desglose||{adeudo:0,recargos:0,renovacion:0,saldo_a_favor:0,total:0});
// La tarjeta (Stripe) no está disponible al reactivar. Cambia a true cuando el servidor la soporte y aparecerá sola.
const TARJETA_HABILITADA=false;
const metodosPago=computed(()=>[
 {value:'Efectivo',label:'Efectivo',hint:'Folio automático',icon:'cash'},
 {value:'Transferencia',label:'Transferencia',hint:'Referencia obligatoria',icon:'transfer'},
 ...(TARJETA_HABILITADA?[{value:'Tarjeta',label:'Tarjeta',hint:'QR de Stripe',icon:'card'}]:[])
]);
watch(metodo,n=>{if(n!=='Transferencia')referencia.value='';});
const folioAutomatico=computed(()=>metodo.value==='Efectivo'||metodo.value==='Tarjeta');
const folioPlaceholder=computed(()=>metodo.value==='Transferencia'?'Número del comprobante':metodo.value==='Efectivo'?'Se asigna al confirmar el pago':metodo.value==='Tarjeta'?'Lo asigna Stripe al cobrar':'Elige primero un método de pago');
const folioAyuda=computed(()=>({Efectivo:'El folio real se genera al confirmar el pago y aparecerá en el recibo. No necesitas capturarlo.',Transferencia:'Captura el folio o número de referencia que aparece en el comprobante de la transferencia.',Tarjeta:'El folio se asigna cuando Stripe confirma el cobro y aparecerá en el recibo.'} as Record<string,string>)[metodo.value]||'');
const token=()=>{for(const st of [sessionStorage,localStorage]){for(const k of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']){const v=st.getItem(k);if(v)return v.replace(/^Bearer\s+/i,'');}for(const k of ['auth','user','session','gymAccount','gym_account'])try{const x=JSON.parse(st.getItem(k)||'null');if(x?.token||x?.access_token||x?.accessToken)return String(x.token||x.access_token||x.accessToken).replace(/^Bearer\s+/i,'');}catch{}}return '';};
const request=async(path:string,init:RequestInit={})=>{const t=token();if(!t)throw new Error('Inicia sesión nuevamente.');const r=await fetch(`${API}/api/gym/reactivaciones/${props.inscripcionId}${path}`,{...init,headers:{Accept:'application/json',Authorization:`Bearer ${t}`,...(init.body?{'Content-Type':'application/json'}:{}),...(init.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok){const e=d.errors?Object.values(d.errors).flat().join(' '):'';throw new Error(e||d.message||`Error HTTP ${r.status}`);}return d;};
const cargar=async()=>{loading.value=true;error.value='';cliente.value=null;try{const d=await request(`?sede_id=${props.sedeId}`);cliente.value=d.cliente;}catch(e:any){error.value=e?.message||'No se pudo consultar la cuenta.';}finally{loading.value=false;}};
const guardar=async()=>{if(guardando.value||!cliente.value)return;saveError.value='';if(desglose.value.total>0&&!metodo.value){saveError.value='Selecciona un método de pago.';return;}if(metodo.value==='Transferencia'&&!referencia.value){saveError.value='La transferencia necesita su referencia.';return;}guardando.value=true;try{await request('',{method:'POST',body:JSON.stringify({sede_id:props.sedeId,monto:desglose.value.total,metodo_pago:desglose.value.total>0?metodo.value:null,referencia_pago:metodo.value==='Transferencia'?referencia.value:null})});emit('reactivated');}catch(e:any){saveError.value=e.message||'No se pudo reactivar. No se confirmó ningún pago.';}finally{guardando.value=false;}};
const moneda=(n:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(n)||0);const fecha=(v:string|null)=>{const m=String(v||'').match(/^(\d{4})-(\d\d)-(\d\d)/);return m?`${m[3]}/${m[2]}/${m[1]}`:'—';};onMounted(()=>void cargar());
</script>
<style scoped>
*{box-sizing:border-box}
.reactivate-backdrop{position:fixed;z-index:11000;inset:0;background:rgba(0,0,0,.79);display:flex;align-items:center;justify-content:center;padding:16px;color:var(--color-texto-general,#f5f5f7);font-family:'Inter',system-ui,sans-serif}
.reactivate-window{--accent:var(--color-highlight,#60a5fa);width:min(760px,100%);max-height:94vh;overflow:auto;background:var(--bg-cards,#191a25);border:1px solid rgba(255,255,255,.14);border-radius:20px;box-shadow:0 35px 90px rgba(0,0,0,.6)}
.react-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:27px 30px 22px;border-bottom:1px solid rgba(255,255,255,.09);background:linear-gradient(110deg,rgba(45,84,191,.1),transparent)}
.react-header small{font-size:11px;letter-spacing:1.3px;font-weight:800;color:var(--accent)}
.react-header h2{margin:8px 0 7px;font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;line-height:1.2}
.react-header h2 span{color:var(--accent)}
.react-header p{font-size:13px;color:#a9acbc;margin:0;line-height:1.5}
.close{width:38px;height:38px;flex:none;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#c4c5d0;font-size:24px;cursor:pointer}
.react-body{padding:22px 28px 28px;display:grid;gap:15px}
.react-card{padding:20px;border:1px solid rgba(255,255,255,.11);border-radius:15px;background:rgba(255,255,255,.025)}
.section-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.section-head>span{font-size:12px;color:var(--accent);font-weight:800;display:grid;place-items:center;width:33px;height:33px;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);background:color-mix(in srgb,var(--accent) 9%,transparent);border-radius:9px}
.section-head>div{display:flex;flex-direction:column;gap:3px}
.section-head strong{font-family:'Oswald',sans-serif;font-size:17px}
.section-head small,.client-data>span{color:#9ca3b8;font-size:12px}
.client-data{display:flex;flex-direction:column;gap:6px;padding-left:45px}
.client-data>strong{font-size:15px}
.client-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.client-tags span{border:1px solid rgba(96,165,250,.25);background:rgba(96,165,250,.08);padding:6px 10px;border-radius:20px;font-size:11px}
.breakdown{display:grid;gap:12px}
.breakdown>div{display:flex;justify-content:space-between;gap:15px;font-size:13px;color:#b6bac9}
.breakdown strong{color:#f4f5fa;white-space:nowrap}
.total-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:21px;border:1px solid rgba(96,165,250,.36);border-radius:15px;background:linear-gradient(115deg,rgba(24,75,183,.2),rgba(6,13,37,.3))}
.total-card>div{display:flex;flex-direction:column;gap:4px}
.total-card small{font-size:11px;color:var(--accent);font-weight:800;letter-spacing:.8px}
.total-card strong{font-family:'Oswald',sans-serif;font-size:17px}
.total-card b{font-size:25px;color:#34d399;white-space:nowrap}
/* MÉTODOS DE PAGO */
.methods{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px}
.method-tile{position:relative;min-width:0;min-height:68px;display:flex;align-items:center;gap:12px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(0,0,0,.2);color:#e5e7eb;font-family:inherit;text-align:left;cursor:pointer;transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .18s ease}
.method-tile:hover{border-color:color-mix(in srgb,var(--accent) 55%,rgba(255,255,255,.16));transform:translateY(-1px)}
.method-tile:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.method-tile.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,rgba(0,0,0,.2));box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}
.method-icon{width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:10px;color:#9ca3b8;background:rgba(255,255,255,.07);transition:color .18s ease,background .18s ease}
.method-tile.active .method-icon{color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,transparent)}
.method-text{min-width:0}
.method-text strong{display:block;color:#fff;font-size:.95rem;font-weight:600;line-height:1.25}
.method-text small{display:block;margin-top:2px;color:#9ca3b8;font-size:.78rem;line-height:1.3}
.method-check{position:absolute;top:8px;right:8px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--accent);color:#111;opacity:0;transform:scale(.6);transition:opacity .18s ease,transform .18s ease}
.method-tile.active .method-check{opacity:1;transform:scale(1)}
/* FOLIO / REFERENCIA */
.reference{display:flex;flex-direction:column;gap:9px}
.reference label{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;font-weight:700}
.folio-badge{padding:2px 8px;border-radius:999px;font-size:.68rem;font-weight:700;letter-spacing:.6px}
.folio-badge.auto{color:#6ee7b7;background:rgba(52,211,153,.12)}
.folio-badge.required{color:#fcd34d;background:rgba(251,191,36,.12)}
.field-control{position:relative;display:flex;align-items:center}
.field-icon{position:absolute;left:14px;color:#9ca3b8;pointer-events:none}
.reference input{width:100%;height:44px;border-radius:10px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.15);color:#fff;padding:0 13px 0 40px;font-family:inherit;font-size:13px;outline:none;transition:border-color .18s ease,box-shadow .18s ease}
.reference input::placeholder{color:#7d8298}
.reference input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent)}
.reference input:disabled{opacity:.55;cursor:not-allowed}
.field-control.is-disabled .field-icon{opacity:.6}
.folio-note{display:flex;align-items:flex-start;gap:10px;margin:2px 0 0;padding:10px 12px;border:1px solid color-mix(in srgb,var(--accent) 24%,transparent);border-radius:10px;background:color-mix(in srgb,var(--accent) 6%,transparent);color:#a9acbc;font-size:.82rem;line-height:1.45}
.folio-note svg{flex-shrink:0;margin-top:2px;color:var(--accent)}
.feedback{padding:12px;border:1px solid rgba(96,165,250,.2);border-radius:10px;font-size:13px}
.danger{color:#fda4af;border-color:rgba(244,63,94,.3)}
.feedback button{background:none;border:0;color:#93c5fd;cursor:pointer;text-decoration:underline}
.info{color:#a7f3d0;font-size:13px;margin:0}
.actions{display:flex;justify-content:flex-end;gap:10px}
.actions button{padding:13px 19px;border-radius:11px;font-weight:700;cursor:pointer}
.cancel{color:#d1d5db;background:transparent;border:1px solid rgba(255,255,255,.18)}
.confirm{color:var(--color-texto-botones,#fff);background:var(--color-botones,#2563eb);border:0}
.confirm:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:600px){
.reactivate-backdrop{align-items:flex-end;padding:0}
.reactivate-window{max-height:95dvh;border-radius:18px 18px 0 0}
.react-header{padding:19px}
.react-body{padding:14px}
.react-card{padding:16px}
.client-data{padding-left:0}
.methods{grid-template-columns:1fr;gap:10px}
.total-card b{font-size:20px}
.actions{flex-direction:column-reverse}
.actions button{width:100%}
}
</style>