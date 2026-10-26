<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';
const currentLang=ref(localStorage.getItem('GYM_ACCOUNT-idioma')||'es');
const localTranslations={es:{commercialTitle:'PROMOCIONES Y',commercialHighlight:'TARIFAS',commercialSubtitle:'Administra promociones, membresías y precios del gimnasio desde un solo lugar.',activePromotions:'Promociones activas',monthlyPrice:'Mensualidad',weeklyPrice:'Costo semanal',averagePromo:'Promedio promociones',promotionsSection:'Promociones',promotionsDescription:'Ofertas y paquetes disponibles para tus clientes.',pricesSection:'Tarifas del sistema',pricesDescription:'Precios base utilizados en membresías y servicios.',newPromotion:'Nueva promoción',months:'meses',month:'mes',edit:'Editar',delete:'Eliminar',configured:'Configurado',active:'Activa',price:'Precio',duration:'Duración',noPromotions:'No tienes promociones registradas.',noPromotionsSub:'Crea tu primera promoción para comenzar.',addPromotion:'Crear promoción'},en:{commercialTitle:'PROMOTIONS &',commercialHighlight:'PRICING',commercialSubtitle:'Manage gym promotions, memberships and pricing from one place.',activePromotions:'Active promotions',monthlyPrice:'Monthly fee',weeklyPrice:'Weekly fee',averagePromo:'Promotion average',promotionsSection:'Promotions',promotionsDescription:'Offers and packages available to your customers.',pricesSection:'System pricing',pricesDescription:'Base prices used for memberships and services.',newPromotion:'New promotion',months:'months',month:'month',edit:'Edit',delete:'Delete',configured:'Configured',active:'Active',price:'Price',duration:'Duration',noPromotions:'No promotions registered.',noPromotionsSub:'Create your first promotion to get started.'}};
const t=(key)=>localTranslations[currentLang.value]?.[key]||traducciones[currentLang.value]?.[key]||localTranslations.es[key]||traducciones.es?.[key]||key;
const toastRef=ref(null),registros=ref([]),loading=ref(false),saving=ref(false),aplicarTodas=ref(false),copiando=ref(false),selectedSede=ref(sessionStorage.getItem('selected_sede_id')||'');
const base=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const api=`${base}${base.endsWith('/api')?'':'/api'}/gym/precios`;
const notify=(message,type='info')=>toastRef.value?.notify?.(message,type);
const request=async(path='',options={})=>{const token=sessionStorage.getItem('auth_token');if(!token)throw new Error('Inicia sesión nuevamente.');const response=await fetch(api+path,{...options,headers:{Accept:'application/json',Authorization:`Bearer ${token}`,...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||Object.values(data.errors||{}).flat().join(' ')||`Error ${response.status}`);return data;};

const duracionTexto=(x)=>{
  if(x.Periodo==='Semanal')return '1 semana';
  if(x.Periodo==='Quincenal')return '1 quincena';
  if(x.Cantidad_Meses)return `${x.Cantidad_Meses} mes(es)`;
  return '';
};
const preciosSistema=computed(()=>registros.value.filter(x=>x.Periodo!=='Promocion').map(x=>({id:x.ID_Precio,concepto:x.Nombre_Paquete,monto:Number(x.Precio),duracion:duracionTexto(x),periodo:x.Periodo,meses:x.Cantidad_Meses,estado:x.Estado_Paquete})));
const promociones=computed(()=>registros.value.filter(x=>x.Periodo==='Promocion').map(x=>({id:x.ID_Precio,nombre:x.Nombre_Paquete,meses:Number(x.Cantidad_Meses||1),precio:Number(x.Precio)})));
const precioMensual=computed(()=>preciosSistema.value.find(x=>x.periodo==='Mensual')?.monto||0);
const precioSemanal=computed(()=>preciosSistema.value.find(x=>x.periodo==='Semanal')?.monto||0);
const promedioPromociones=computed(()=>promociones.value.length?Math.round(promociones.value.reduce((a,p)=>a+p.precio,0)/promociones.value.length):0);
const formatCurrency=(value)=>new Intl.NumberFormat(currentLang.value==='en'?'en-US':'es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}).format(Number(value||0));
const precioPorMes=(p)=>Number(p.precio||0)/Math.max(1,Number(p.meses||1));
const modalConfig=reactive({isOpen:false,type:'precio',title:'',isNew:true,form:{id:null,nombre:'',meses:1,precio:'',concepto:'',monto:'',duracion:'',periodo:'Mensual'}});
const deleteModalConfig=reactive({isOpen:false,idItemToDelete:null});
const obtenerPrecios=async()=>{if(!selectedSede.value){registros.value=[];return;}loading.value=true;try{const data=await request(`?sede_id=${encodeURIComponent(selectedSede.value)}`);registros.value=Array.isArray(data)?data:data.data||[];}catch(e){notify(e.message,'error');}finally{loading.value=false;}};
const abrirModalAgregarPromo=()=>{Object.assign(modalConfig,{isOpen:true,type:'promo',title:'Nueva promoción',isNew:true,form:{id:null,nombre:'',meses:1,precio:'',concepto:'',monto:'',duracion:'',periodo:'Promocion'}});};
const abrirModalEditarPromocion=(p)=>{Object.assign(modalConfig,{isOpen:true,type:'promo',title:`Editar: ${p.nombre}`,isNew:false,form:{id:p.id,nombre:p.nombre,meses:p.meses,precio:p.precio,concepto:'',monto:'',duracion:'',periodo:'Promocion'}});};
const abrirModalAgregarPrecio=()=>{Object.assign(modalConfig,{isOpen:true,type:'precio',title:'Agregar tarifa',isNew:true,form:{id:null,nombre:'',meses:1,precio:'',concepto:'',monto:'',duracion:'',periodo:'Mensual'}});};
const abrirModalEditarPrecio=(p)=>{Object.assign(modalConfig,{isOpen:true,type:'precio',title:`Editar: ${p.concepto}`,isNew:false,form:{id:p.id,nombre:'',meses:p.meses||1,precio:'',concepto:p.concepto,monto:p.monto,duracion:p.duracion,periodo:p.periodo}});};
const cerrarModal=()=>{if(!saving.value)modalConfig.isOpen=false;aplicarTodas.value=false;};
const guardarDatos=async()=>{if(!selectedSede.value){notify('Selecciona una sucursal.','error');return;}const f=modalConfig.form;const promo=modalConfig.type==='promo';const periodo=promo?'Promocion':f.periodo;const payload={sede_id:Number(selectedSede.value),Nombre_Paquete:String(promo?f.nombre:f.concepto).trim(),Precio:Number(promo?f.precio:f.monto),Periodo:periodo,Cantidad_Meses:periodo==='Semanal'?null:Number(promo?f.meses:(periodo==='Mensual'?f.meses:1)),Estado_Paquete:'Activo',aplicar_todas:aplicarTodas.value};if(!payload.Nombre_Paquete||!Number.isFinite(payload.Precio)||payload.Precio<0){notify('Ingresa un nombre y precio válido.','error');return;}saving.value=true;try{await request(modalConfig.isNew?'':`/${f.id}`,{method:modalConfig.isNew?'POST':'PUT',body:JSON.stringify(payload)});modalConfig.isOpen=false;aplicarTodas.value=false;await obtenerPrecios();notify(modalConfig.isNew?'Tarifa registrada correctamente.':'Tarifa actualizada correctamente.','success');}catch(e){notify(e.message,'error');}finally{saving.value=false;}};
const copiarConfiguracion=async()=>{if(!selectedSede.value)return notify('Selecciona una sucursal.','error');if(!window.confirm('¿Copiar las tarifas y promociones activas de esta sede a todas tus sucursales? Se actualizarán las configuraciones que tengan el mismo nombre.'))return;copiando.value=true;try{const r=await request('/copiar-sedes',{method:'POST',body:JSON.stringify({sede_id:Number(selectedSede.value)})});notify(r.message||'Configuración copiada a todas las sucursales.','success');}catch(e){notify(e.message,'error');}finally{copiando.value=false;}};
const confirmarEliminarPromocion=(p)=>{deleteModalConfig.idItemToDelete=p.id;deleteModalConfig.isOpen=true;};
const ejecutarEliminacion=async()=>{try{await request(`/${deleteModalConfig.idItemToDelete}?sede_id=${encodeURIComponent(selectedSede.value)}`,{method:'DELETE'});deleteModalConfig.isOpen=false;await obtenerPrecios();notify('Promoción desactivada correctamente.','success');}catch(e){notify(e.message,'error');}};
const handleLangChange=(e)=>{if(e.detail?.idioma)currentLang.value=e.detail.idioma;};
const handleBranchChange=()=>{selectedSede.value=sessionStorage.getItem('selected_sede_id')||'';obtenerPrecios();};
onMounted(()=>{window.addEventListener('idioma-changed',handleLangChange);window.addEventListener('factorfit:branch-changed',handleBranchChange);if(!selectedSede.value){try{const account=JSON.parse(sessionStorage.getItem('gym_account')||'{}');selectedSede.value=String((account.usuario||account).sedes?.[0]?.ID_Sede||'');if(selectedSede.value)sessionStorage.setItem('selected_sede_id',selectedSede.value);}catch{}}obtenerPrecios();});
onUnmounted(()=>{window.removeEventListener('idioma-changed',handleLangChange);window.removeEventListener('factorfit:branch-changed',handleBranchChange);});
</script>

<template>
<HeadingGYM_ACCOUNT>
<NotificationSystem ref="toastRef" />
<main class="commercial-page">
<header class="page-header" id="tutorial-step-0">
<div class="page-heading">
<div class="heading-icon">
<svg
viewBox="0 0 24 24"
width="22"
height="22"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
>
<path d="M20 12v8H4v-8"/>
<path d="M2 7h20v5H2z"/>
<path d="M12 22V7"/>
<path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z"/>
<path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/>
</svg>
</div>
<div class="heading-copy">
<div class="title-row">
<h1>
{{ t('commercialTitle') }}
<span>{{ t('commercialHighlight') }}</span>
</h1>
<div class="live-badge">
<span></span>
{{ t('configured') }}
</div>
</div>
<p>{{ t('commercialSubtitle') }}</p>
</div>
</div>
<button
type="button"
class="new-promo-btn"
@click="abrirModalAgregarPromo"
>
<svg
width="17"
height="17"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2.2"
stroke-linecap="round"
>
<path d="M12 5v14M5 12h14"/>
</svg>
<span>{{ t('newPromotion') }}</span>
</button>
</header>

<div class="global-prices-action">
<span>Los precios y promociones se administran por sucursal.</span>
<button type="button" class="new-promo-btn" :disabled="copiando||loading" @click="copiarConfiguracion">{{ copiando ? 'Copiando...' : 'Copiar configuración a todas las sedes' }}</button>
</div>

<section class="metrics-grid">
<article class="metric-card tone-blue">
<div class="metric-head">
<div class="metric-icon blue">
<svg viewBox="0 0 24 24">
<path d="M20 12V8H4v4"/>
<path d="M4 8V5h16v3"/>
<path d="M6 12v7h12v-7"/>
</svg>
</div>
<span>{{ t('activePromotions') }}</span>
</div>
<strong>{{ promociones.length }}</strong>
<div class="metric-bottom">
<span class="status-dot"></span>
{{ t('active') }}
</div>
</article>
<article class="metric-card tone-green">
<div class="metric-head">
<div class="metric-icon green">
<svg viewBox="0 0 24 24">
<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
</svg>
</div>
<span>{{ t('monthlyPrice') }}</span>
</div>
<strong>{{ formatCurrency(precioMensual) }}</strong>
<div class="metric-bottom">
{{ t('price') }} / {{ t('month') }}
</div>
</article>
<article class="metric-card tone-violet">
<div class="metric-head">
<div class="metric-icon violet">
<svg viewBox="0 0 24 24">
<rect x="3" y="4" width="18" height="17" rx="2"/>
<path d="M16 2v4M8 2v4M3 10h18"/>
</svg>
</div>
<span>{{ t('weeklyPrice') }}</span>
</div>
<strong>{{ formatCurrency(precioSemanal) }}</strong>
<div class="metric-bottom">
{{ t('configured') }}
</div>
</article>
<article class="metric-card tone-orange">
<div class="metric-head">
<div class="metric-icon orange">
<svg viewBox="0 0 24 24">
<path d="M3 3v18h18"/>
<path d="m7 16 4-5 4 3 5-7"/>
</svg>
</div>
<span>{{ t('averagePromo') }}</span>
</div>
<strong>{{ formatCurrency(promedioPromociones) }}</strong>
<div class="metric-bottom">
{{ promociones.length }} {{ t('promotionsSection').toLowerCase() }}
</div>
</article>
</section>

<section class="management-grid">
<article class="management-panel tone-blue" id="tutorial-step-1">
<header class="section-header">
<div class="section-title">
<div class="section-icon blue">
<svg viewBox="0 0 24 24">
<path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z"/>
<circle cx="7.5" cy="7.5" r="1.5"/>
</svg>
</div>
<div>
<h2>{{ t('promotionsSection') }}</h2>
<p>{{ t('promotionsDescription') }}</p>
</div>
</div>
<span class="counter">
{{ promociones.length }}
</span>
</header>
<div
v-if="promociones.length"
class="promotion-list"
>
<article
v-for="promo in promociones"
:key="promo.id"
class="promotion-card"
>
<div class="promo-main">
<div class="promo-icon">
<svg viewBox="0 0 24 24">
<path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z"/>
<circle cx="7.5" cy="7.5" r="1.5"/>
</svg>
</div>
<div class="promo-info">
<div class="promo-title-row">
<h3>{{ promo.nombre }}</h3>
<span class="active-chip">
<span></span>
{{ t('active') }}
</span>
</div>
<div class="promo-meta">
<div>
<span>{{ t('duration') }}</span>
<strong>
{{ promo.meses }}
{{ Number(promo.meses) === 1 ? t('month') : t('months') }}
</strong>
</div>
<span class="meta-divider"></span>
<div>
<span>{{ t('price') }}</span>
<strong class="price-value">
{{ formatCurrency(promo.precio) }}
</strong>
</div>
<span v-if="Number(promo.meses) > 1" class="meta-divider"></span>
<div v-if="Number(promo.meses) > 1">
<span>{{ t('price') }} / {{ t('month') }}</span>
<strong>
{{ formatCurrency(precioPorMes(promo)) }}
</strong>
</div>
</div>
</div>
</div>
<div class="card-actions">
<button
type="button"
class="action-btn edit"
@click="abrirModalEditarPromocion(promo)"
:title="t('edit')"
>
<svg viewBox="0 0 24 24">
<path d="M12 20h9"/>
<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
</svg>
<span>{{ t('edit') }}</span>
</button>
<button
type="button"
class="action-btn delete"
@click="confirmarEliminarPromocion(promo)"
:title="t('delete')"
:aria-label="t('delete')"
>
<svg viewBox="0 0 24 24">
<path d="M3 6h18"/>
<path d="M8 6V4h8v2"/>
<path d="M19 6l-1 14H6L5 6"/>
<path d="M10 11v5M14 11v5"/>
</svg>
</button>
</div>
</article>
</div>
<div v-else class="empty-state">
<div class="empty-icon">
<svg viewBox="0 0 24 24">
<path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z"/>
<circle cx="7.5" cy="7.5" r="1.5"/>
</svg>
</div>
<h3>{{ t('noPromotions') }}</h3>
<p>{{ t('noPromotionsSub') }}</p>
<button type="button" @click="abrirModalAgregarPromo">
<svg viewBox="0 0 24 24">
<path d="M12 5v14M5 12h14"/>
</svg>
{{ t('addPromotion') }}
</button>
</div>
</article>

<article class="management-panel tone-violet" id="tutorial-step-2">
<header class="section-header">
<div class="section-title">
<div class="section-icon violet">
<svg viewBox="0 0 24 24">
<rect x="3" y="5" width="18" height="14" rx="2"/>
<path d="M3 10h18"/>
<path d="M7 15h3"/>
</svg>
</div>
<div>
<h2>{{ t('pricesSection') }}</h2>
<p>{{ t('pricesDescription') }}</p>
</div>
</div>
<div class="tariff-header-actions">
<button type="button" class="new-promo-btn" @click="abrirModalAgregarPrecio">+ Agregar tarifa</button>
<span class="counter violet-counter">
{{ preciosSistema.length }}
</span>
</div>
</header>
<div v-if="loading" class="empty-state"><p>Cargando tarifas...</p></div>
<div v-else-if="!preciosSistema.length" class="empty-state">
<h3>No hay tarifas registradas en esta sucursal.</h3>
<p>Agrega una tarifa mensual o semanal para comenzar.</p>
<button type="button" @click="abrirModalAgregarPrecio">+ Agregar tarifa</button>
</div>
<div v-else class="prices-list">
<article
v-for="precio in preciosSistema"
:key="precio.id"
class="price-card"
>
<div class="price-content">
<div class="price-icon">
<svg viewBox="0 0 24 24">
<path d="M12 2v20"/>
<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
</svg>
</div>
<div class="price-info">
<span class="price-label">{{ t('configured') }}</span>
<h3>{{ precio.concepto }}</h3>
<div class="price-amount">
{{ formatCurrency(precio.monto) }}
<span v-if="precio.duracion">
/ {{ precio.duracion }}
</span>
</div>
</div>
</div>
<button
type="button"
class="price-edit"
@click="abrirModalEditarPrecio(precio)"
:title="t('edit')"
:aria-label="t('edit')"
>
<svg viewBox="0 0 24 24">
<path d="M12 20h9"/>
<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
</svg>
</button>
</article>
</div>
</article>
</section>
</main>

<transition name="pop">
<div
v-if="modalConfig.isOpen"
class="modal-wrapper"
@click.self="cerrarModal"
>
<div
class="custom-modal-card"
:class="
modalConfig.type === 'promo'
? 'modal-accent-blue'
: 'modal-accent-violet'
"
>
<div
class="modal-icon-badge"
:class="
modalConfig.type === 'promo'
? 'badge-blue'
: 'badge-violet'
"
>
<svg
v-if="modalConfig.type === 'promo'"
viewBox="0 0 24 24"
>
<path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z"/>
<circle cx="7.5" cy="7.5" r="1.5"/>
</svg>
<svg v-else viewBox="0 0 24 24">
<rect x="3" y="5" width="18" height="14" rx="2"/>
<path d="M3 10h18"/>
<path d="M7 15h3"/>
</svg>
</div>
<h3>{{ modalConfig.title }}</h3>
<form @submit.prevent="guardarDatos">
<template v-if="modalConfig.type === 'promo'">
<div class="input-group">
<label>{{ t('promoNameLabel') }}</label>
<input
type="text"
v-model="modalConfig.form.nombre"
:placeholder="t('promoNamePlaceholder')"
required
/>
</div>
<div class="form-grid-modal">
<div class="input-group">
<label>{{ t('monthsFieldLabel') }}</label>
<input
type="number"
inputmode="numeric"
v-model="modalConfig.form.meses"
placeholder="Ej. 3"
min="1"
required
/>
</div>
<div class="input-group">
<label>{{ t('priceFieldLabel') }}</label>
<input
type="number"
inputmode="decimal"
v-model="modalConfig.form.precio"
placeholder="Ej. 1800"
min="0"
required
/>
</div>
</div>
</template>
<template v-if="modalConfig.type === 'precio'">
<div class="input-group">
<label>{{ t('conceptFieldLabel') }}</label>
<input
type="text"
v-model="modalConfig.form.concepto"
:placeholder="t('conceptPlaceholder')"
required
/>
</div>
<div class="input-group">
<label>{{ t('newPriceFieldLabel') }}</label>
<input
type="number"
inputmode="decimal"
v-model="modalConfig.form.monto"
placeholder="0.00"
required
/>
</div>
<div class="input-group">
<label>Frecuencia</label>
<select v-model="modalConfig.form.periodo" required>
<option value="Mensual">Mensual</option>
<option value="Semanal">Semanal</option>
<option value="Quincenal">Quincenal</option>
</select>
</div>
<div v-if="modalConfig.form.periodo === 'Mensual'" class="input-group">
<label>Cantidad de meses</label>
<input type="number" min="1" max="120" v-model.number="modalConfig.form.meses" required />
</div>
</template>
<div class="modal-actions">
<button
type="button"
class="btn-secondary"
@click="cerrarModal"
>
{{ t('btnCancel') }}
</button>
<button
type="submit"
class="btn-primary"
>
{{ t('btnSave') }}
</button>
</div>
</form>
</div>
</div>
</transition>

<transition name="pop">
<div
v-if="deleteModalConfig.isOpen"
class="modal-wrapper"
@click.self="deleteModalConfig.isOpen = false"
>
<div class="custom-modal-card delete-modal">
<div class="warning-icon">
<svg viewBox="0 0 24 24">
<path d="M3 6h18"/>
<path d="M8 6V4h8v2"/>
<path d="M19 6l-1 14H6L5 6"/>
<path d="M10 11v5M14 11v5"/>
</svg>
</div>
<h3>{{ t('deleteModalTitle') }}</h3>
<p class="delete-msg">
{{ t('deletePromoMsg') }}
</p>
<div class="modal-actions">
<button
type="button"
class="btn-secondary"
@click="deleteModalConfig.isOpen = false"
>
{{ t('btnCancel') }}
</button>
<button
type="button"
class="btn-danger"
@click="ejecutarEliminacion"
>
{{ t('btnConfirm') }}
</button>
</div>
</div>
</div>
</transition>
</HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https\://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');

.global-prices-action{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:20px;font-size:.8rem;color:var(--text)}
.global-prices-action .new-promo-btn{min-height:38px}
.all-branches-checkbox{display:flex;align-items:center;gap:9px;margin:14px 0;color:var(--text);font-size:.78rem;cursor:pointer}
.all-branches-checkbox input{accent-color:#8b5cf6;width:16px;height:16px}
.commercial-page, .modal-wrapper{--accent: var(--color-highlight, #3b82f6);--panel: var(--bg-cards, #121416);--input: var(--bg-input, #0c0e10);--text: var(--color-texto-general, #e5e7eb);--title: var(--color-titulos, #ffffff);--muted: color-mix(in srgb, var(--text) 62%, transparent);--line: color-mix(in srgb, var(--text) 15%, transparent);--line-soft: color-mix(in srgb, var(--text) 9%, transparent);--green: #34d399;--violet: #8b5cf6;--orange: #f59e0b;--red: #f87171;}
.commercial-page{width: 100%;max-width: 1450px;margin: 0 auto;padding: 30px 32px 56px;box-sizing: border-box;color: var(--text);font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;-webkit-font-smoothing: antialiased;}
.commercial-page *, .modal-wrapper *{box-sizing: border-box;}
.tone-blue{--tone: var(--accent);}
.tone-green{--tone: var(--green);}
.tone-violet{--tone: var(--violet);}
.tone-orange{--tone: var(--orange);}
.page-header{position: relative;display: flex;align-items: center;justify-content: space-between;gap: 24px;margin-bottom: 24px;padding-bottom: 22px;border-bottom: 1px solid var(--line-soft);}
.page-header::after{content: '';position: absolute;bottom: -1px;left: 0;width: 72px;height: 2px;border-radius: 999px;background: var(--accent);}
.page-heading{min-width: 0;display: flex;align-items: center;gap: 15px;}
.heading-icon{width: 48px;height: 48px;flex-shrink: 0;display: flex;align-items: center;justify-content: center;border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);border-radius: 13px;background: color-mix(in srgb, var(--accent) 9%, transparent);color: var(--accent);}
.heading-copy{min-width: 0;}
.title-row{display: flex;align-items: center;gap: 10px;flex-wrap: wrap;}
.page-heading h1{margin: 0;color: var(--title);font-family: 'Oswald', sans-serif;font-size: clamp(1.4rem, 2.4vw, 1.9rem);font-weight: 600;line-height: 1.1;letter-spacing: .035em;}
.page-heading h1 span{color: var(--accent);}
.page-heading p{max-width: 650px;margin: 6px 0 0;color: var(--muted);font-size: .8rem;line-height: 1.5;}
.live-badge{min-height: 23px;display: inline-flex;align-items: center;gap: 6px;padding: 3px 10px;border: 1px solid rgba(52, 211, 153, .24);border-radius: 999px;background: rgba(52, 211, 153, .07);color: var(--green);font-size: .62rem;font-weight: 700;}
.live-badge span, .status-dot, .active-chip span{width: 6px;height: 6px;border-radius: 50%;background: currentColor;box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 16%, transparent);}
.new-promo-btn{min-height: 46px;display: inline-flex;align-items: center;justify-content: center;gap: 9px;flex-shrink: 0;padding: 0 20px;border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);border-radius: 11px;background: var(--color-botones, var(--accent));color: var(--color-texto-botones, #fff);font-family: 'Inter', sans-serif;font-size: .8rem;font-weight: 700;cursor: pointer;box-shadow: 0 8px 20px color-mix(in srgb, var(--accent) 22%, transparent);transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;}
.new-promo-btn:hover{filter: brightness(1.08);box-shadow: 0 11px 26px color-mix(in srgb, var(--accent) 30%, transparent);transform: translateY(-1px);}
.new-promo-btn:active{transform: translateY(0);}
.metrics-grid{display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));gap: 14px;margin-bottom: 18px;}
.metric-card{position: relative;min-width: 0;padding: 17px 18px;overflow: hidden;border: 1px solid var(--line);border-radius: var(--app-border-radius, 14px);background: var(--panel);box-shadow: 0 10px 28px rgba(0, 0, 0, .14);transition: border-color .18s ease, transform .18s ease;}
.metric-card::before{content: '';position: absolute;top: 0;left: 0;right: 0;height: 2px;background: linear-gradient(90deg, var(--tone), transparent 75%);opacity: .85;}
.metric-card:hover{border-color: color-mix(in srgb, var(--tone) 32%, var(--line));transform: translateY(-2px);}
.metric-head{display: flex;align-items: center;gap: 10px;margin-bottom: 16px;color: var(--muted);font-size: .7rem;font-weight: 600;letter-spacing: .02em;}
.metric-head > span{min-width: 0;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}
.metric-icon{width: 34px;height: 34px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border: 1px solid;border-radius: 10px;}
.metric-icon svg{width: 17px;height: 17px;fill: none;stroke: currentColor;stroke-width: 1.8;stroke-linecap: round;stroke-linejoin: round;}
.metric-icon.blue{color: var(--accent);border-color: color-mix(in srgb, var(--accent) 26%, transparent);background: color-mix(in srgb, var(--accent) 9%, transparent);}
.metric-icon.green{color: var(--green);border-color: rgba(52, 211, 153, .26);background: rgba(52, 211, 153, .09);}
.metric-icon.violet{color: var(--violet);border-color: rgba(139, 92, 246, .28);background: rgba(139, 92, 246, .1);}
.metric-icon.orange{color: var(--orange);border-color: rgba(245, 158, 11, .28);background: rgba(245, 158, 11, .1);}
.metric-card > strong{display: block;overflow: hidden;margin-bottom: 9px;color: var(--title);font-family: 'Oswald', sans-serif;font-size: 1.8rem;font-weight: 600;line-height: 1.05;font-variant-numeric: tabular-nums;text-overflow: ellipsis;white-space: nowrap;}
.metric-bottom{display: flex;align-items: center;gap: 7px;color: var(--muted);font-size: .66rem;}
.metric-bottom .status-dot{color: var(--green);}
.management-grid{display: grid;grid-template-columns: minmax(0, 1.35fr) minmax(340px, .65fr);gap: 18px;align-items: start;}
.management-panel{position: relative;min-width: 0;overflow: hidden;border: 1px solid var(--line);border-radius: var(--app-border-radius, 16px);background: var(--panel);box-shadow: 0 16px 40px rgba(0, 0, 0, .18);}
.management-panel::before{content: '';position: absolute;z-index: 2;top: 0;left: 0;right: 0;height: 2px;background: linear-gradient(90deg, transparent, var(--tone), transparent);opacity: .8;pointer-events: none;}
.section-header{min-height: 80px;display: flex;align-items: center;justify-content: space-between;gap: 16px;padding: 17px 20px;border-bottom: 1px solid var(--line-soft);background: linear-gradient(180deg, color-mix(in srgb, var(--text) 2.5%, transparent), transparent);}
.section-title{min-width: 0;display: flex;align-items: center;gap: 12px;}
.section-icon{width: 40px;height: 40px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border: 1px solid;border-radius: 11px;}
.section-icon svg{width: 19px;height: 19px;fill: none;stroke: currentColor;stroke-width: 1.8;stroke-linecap: round;stroke-linejoin: round;}
.section-icon.blue{color: var(--accent);border-color: color-mix(in srgb, var(--accent) 26%, transparent);background: color-mix(in srgb, var(--accent) 8%, transparent);}
.section-icon.violet{color: var(--violet);border-color: rgba(139, 92, 246, .28);background: rgba(139, 92, 246, .09);}
.section-header h2{margin: 0 0 3px;color: var(--title);font-size: .9rem;font-weight: 700;}
.section-header p{margin: 0;color: var(--muted);font-size: .68rem;line-height: 1.45;}
.counter{min-width: 30px;height: 30px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;padding: 0 8px;border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent);border-radius: 999px;background: color-mix(in srgb, var(--accent) 8%, transparent);color: var(--accent);font-family: 'Oswald', sans-serif;font-size: .8rem;font-weight: 600;}
.violet-counter{border-color: rgba(139, 92, 246, .28);background: rgba(139, 92, 246, .09);color: var(--violet);}
.promotion-list{display: flex;flex-direction: column;gap: 10px;padding: 16px;}
.promotion-card{position: relative;display: flex;align-items: center;justify-content: space-between;gap: 18px;padding: 16px 17px;border: 1px solid var(--line-soft);border-radius: 13px;background: color-mix(in srgb, var(--text) 1.5%, transparent);transition: background .17s ease, border-color .17s ease, transform .17s ease;}
.promotion-card::before{content: '';position: absolute;left: -1px;top: 14px;bottom: 14px;width: 3px;border-radius: 0 3px 3px 0;background: var(--accent);opacity: .55;transition: opacity .17s ease;}
.promotion-card:hover{border-color: color-mix(in srgb, var(--accent) 30%, var(--line));background: color-mix(in srgb, var(--accent) 4%, transparent);}
.promotion-card:hover::before{opacity: 1;}
.promo-main{min-width: 0;display: flex;align-items: center;gap: 14px;}
.promo-icon{width: 46px;height: 46px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);border-radius: 12px;background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, transparent), color-mix(in srgb, var(--accent) 5%, transparent));color: var(--accent);}
.promo-icon svg{width: 21px;height: 21px;fill: none;stroke: currentColor;stroke-width: 1.8;stroke-linecap: round;stroke-linejoin: round;}
.promo-info{min-width: 0;}
.promo-title-row{display: flex;align-items: center;gap: 9px;flex-wrap: wrap;margin-bottom: 11px;}
.promo-title-row h3{margin: 0;color: var(--title);font-size: .88rem;font-weight: 650;}
.active-chip{display: inline-flex;align-items: center;gap: 5px;padding: 3px 8px;border: 1px solid rgba(52, 211, 153, .24);border-radius: 999px;background: rgba(52, 211, 153, .07);color: var(--green);font-size: .56rem;font-weight: 700;}
.active-chip span{width: 5px;height: 5px;}
.promo-meta{display: flex;align-items: center;flex-wrap: wrap;gap: 8px 15px;}
.promo-meta > div{display: flex;flex-direction: column;gap: 3px;}
.promo-meta > div > span{color: var(--muted);font-size: .58rem;font-weight: 600;letter-spacing: .03em;}
.promo-meta strong{color: var(--text);font-size: .76rem;font-weight: 650;font-variant-numeric: tabular-nums;}
.promo-meta .price-value{color: var(--green);font-family: 'Oswald', sans-serif;font-size: .95rem;}
.meta-divider{width: 1px;height: 28px;background: var(--line);}
.card-actions{display: flex;align-items: center;gap: 7px;flex-shrink: 0;}
.action-btn, .price-edit{min-height: 38px;display: inline-flex;align-items: center;justify-content: center;gap: 7px;padding: 0 12px;border: 1px solid var(--line);border-radius: 9px;background: color-mix(in srgb, var(--text) 3%, transparent);color: var(--muted);font-family: 'Inter', sans-serif;font-size: .68rem;font-weight: 600;cursor: pointer;transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;}
.action-btn svg, .price-edit svg{width: 15px;height: 15px;fill: none;stroke: currentColor;stroke-width: 1.9;stroke-linecap: round;stroke-linejoin: round;}
.action-btn.edit:hover{border-color: color-mix(in srgb, var(--accent) 38%, transparent);background: color-mix(in srgb, var(--accent) 9%, transparent);color: var(--accent);}
.action-btn.delete{width: 38px;padding: 0;}
.action-btn.delete:hover{border-color: rgba(248, 113, 113, .34);background: rgba(248, 113, 113, .09);color: var(--red);}
.action-btn:active, .price-edit:active{transform: scale(.95);}
.prices-list{display: flex;flex-direction: column;gap: 10px;padding: 16px;}
.price-card{position: relative;display: flex;align-items: center;justify-content: space-between;gap: 12px;padding: 14px 15px;border: 1px solid var(--line-soft);border-radius: 13px;background: color-mix(in srgb, var(--text) 1.5%, transparent);transition: border-color .17s ease, background .17s ease;}
.price-card:hover{border-color: rgba(139, 92, 246, .34);background: rgba(139, 92, 246, .045);}
.price-content{flex: 1;min-width: 0;display: flex;align-items: center;gap: 12px;}
.price-icon{width: 40px;height: 40px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border: 1px solid rgba(139, 92, 246, .26);border-radius: 11px;background: rgba(139, 92, 246, .09);color: var(--violet);}
.price-icon svg{width: 18px;height: 18px;fill: none;stroke: currentColor;stroke-width: 1.8;stroke-linecap: round;stroke-linejoin: round;}
.price-info{min-width: 0;}
.price-label{display: block;margin-bottom: 3px;color: var(--violet);font-size: .54rem;font-weight: 700;text-transform: uppercase;letter-spacing: .06em;}
.price-info h3{overflow: hidden;margin: 0 0 4px;color: var(--title);font-size: .78rem;font-weight: 600;text-overflow: ellipsis;white-space: nowrap;}
.price-amount{color: var(--green);font-family: 'Oswald', sans-serif;font-size: 1.15rem;font-weight: 600;font-variant-numeric: tabular-nums;}
.price-amount span{color: var(--muted);font-family: 'Inter', sans-serif;font-size: .6rem;font-weight: 500;}
.price-edit{width: 38px;flex-shrink: 0;padding: 0;}
.price-edit:hover{border-color: rgba(139, 92, 246, .4);background: rgba(139, 92, 246, .1);color: var(--violet);}
.empty-state{min-height: 280px;display: flex;flex-direction: column;align-items: center;justify-content: center;margin: 16px;padding: 30px;border: 1px dashed var(--line);border-radius: 13px;text-align: center;}
.empty-icon{width: 52px;height: 52px;display: flex;align-items: center;justify-content: center;margin-bottom: 14px;border: 1px solid var(--line);border-radius: 14px;background: color-mix(in srgb, var(--text) 3%, transparent);color: var(--muted);}
.empty-icon svg{width: 22px;height: 22px;fill: none;stroke: currentColor;stroke-width: 1.7;stroke-linecap: round;stroke-linejoin: round;}
.empty-state h3{margin: 0 0 5px;color: var(--title);font-size: .85rem;}
.empty-state p{margin: 0 0 16px;color: var(--muted);font-size: .7rem;}
.empty-state button{min-height: 40px;display: flex;align-items: center;gap: 8px;padding: 0 15px;border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);border-radius: 9px;background: color-mix(in srgb, var(--accent) 8%, transparent);color: var(--accent);font-family: 'Inter', sans-serif;font-size: .7rem;font-weight: 650;cursor: pointer;transition: background .16s ease, transform .16s ease;}
.empty-state button:hover{background: color-mix(in srgb, var(--accent) 14%, transparent);transform: translateY(-1px);}
.empty-state button svg{width: 14px;height: 14px;fill: none;stroke: currentColor;stroke-width: 2;stroke-linecap: round;}
.modal-wrapper{position: fixed;z-index: 9999;inset: 0;display: flex;align-items: center;justify-content: center;padding: 16px;background: rgba(0, 0, 0, .72);backdrop-filter: blur(4px);font-family: 'Inter', system-ui, sans-serif;}
.custom-modal-card{position: relative;width: 100%;max-width: 430px;max-height: calc(100dvh - 32px);overflow-y: auto;padding: 28px 26px 24px;border: 1px solid var(--line);border-radius: 16px;background: var(--panel);color: var(--text);box-shadow: 0 28px 70px rgba(0, 0, 0, .55);}
.custom-modal-card::before{content: '';position: absolute;top: 0;left: 0;right: 0;height: 2px;background: linear-gradient(90deg, transparent, var(--accent), transparent);}
.modal-accent-violet::before{background: linear-gradient(90deg, transparent, var(--violet), transparent);}
.modal-icon-badge, .warning-icon{width: 48px;height: 48px;display: flex;align-items: center;justify-content: center;margin: 0 auto 14px;border: 1px solid;border-radius: 13px;}
.modal-icon-badge{border-color: color-mix(in srgb, var(--accent) 26%, transparent);background: color-mix(in srgb, var(--accent) 9%, transparent);color: var(--accent);}
.modal-icon-badge.badge-violet{border-color: rgba(139, 92, 246, .28);background: rgba(139, 92, 246, .1);color: var(--violet);}
.modal-icon-badge svg, .warning-icon svg{width: 22px;height: 22px;fill: none;stroke: currentColor;stroke-width: 1.8;stroke-linecap: round;stroke-linejoin: round;}
.custom-modal-card > h3{margin: 0 0 22px;color: var(--title);font-family: 'Oswald', sans-serif;font-size: 1.1rem;font-weight: 600;letter-spacing: .02em;text-align: center;}
.input-group{display: flex;flex-direction: column;gap: 7px;margin-bottom: 14px;}
.input-group label{color: var(--color-etiquetas, var(--text));font-size: .7rem;font-weight: 600;letter-spacing: .015em;}
.input-group input{width: 100%;min-height: 45px;padding: 0 13px;outline: none;border: 1px solid var(--line);border-radius: 10px;background: var(--input);color: var(--color-texto-input, var(--text));font-family: 'Inter', sans-serif;font-size: .8rem;font-weight: 500;transition: border-color .16s ease, box-shadow .16s ease;}
.input-group input::placeholder{color: var(--muted);opacity: .65;}
.input-group input:hover{border-color: color-mix(in srgb, var(--text) 26%, transparent);}
.input-group input:focus{border-color: var(--accent);box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);}
.input-group input:disabled{opacity: .55;cursor: not-allowed;}
.input-group input[type='number']{-moz-appearance: textfield;appearance: textfield;}
.input-group input[type='number']::-webkit-inner-spin-button, .input-group input[type='number']::-webkit-outer-spin-button{margin: 0;-webkit-appearance: none;}
.input-group select{width: 100%;min-height: 45px;padding: 0 13px;outline: none;border: 1px solid var(--line);border-radius: 10px;background: var(--input);color: var(--color-texto-input, var(--text));font-family: 'Inter', sans-serif;font-size: .8rem;font-weight: 500;transition: border-color .16s ease, box-shadow .16s ease;}
.input-group select:focus{border-color: var(--accent);box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);}
.form-grid-modal{display: grid;grid-template-columns: 1fr 1fr;gap: 12px;}
.modal-actions{display: flex;gap: 10px;margin-top: 22px;}
.btn-primary, .btn-secondary, .btn-danger{flex: 1;min-height: 46px;border-radius: 10px;font-family: 'Inter', sans-serif;font-size: .76rem;font-weight: 700;cursor: pointer;transition: background .16s ease, border-color .16s ease, filter .16s ease, transform .16s ease;}
.btn-primary{border: 1px solid var(--accent);background: var(--color-botones, var(--accent));color: var(--color-texto-botones, #fff);box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 20%, transparent);}
.btn-primary:hover{filter: brightness(1.08);transform: translateY(-1px);}
.btn-secondary{border: 1px solid var(--line);background: transparent;color: var(--text);}
.btn-secondary:hover{background: color-mix(in srgb, var(--text) 6%, transparent);}
.btn-danger{border: 1px solid #dc2626;background: #dc2626;color: #fff;box-shadow: 0 6px 16px rgba(220, 38, 38, .22);}
.btn-danger:hover{background: #b91c1c;transform: translateY(-1px);}
.delete-modal{max-width: 380px;text-align: center;}
.delete-modal::before{background: linear-gradient(90deg, transparent, var(--red), transparent);}
.warning-icon{border-color: rgba(248, 113, 113, .26);background: rgba(248, 113, 113, .09);color: var(--red);}
.delete-msg{max-width: 310px;margin: -8px auto 4px;color: var(--muted);font-size: .74rem;line-height: 1.6;}
:deep(.notification-container), :deep(.toast-container){width: calc(100% - 32px) !important;max-width: 480px !important;left: 50% !important;right: auto !important;transform: translateX(-50%) !important;}
.new-promo-btn:focus-visible, .action-btn:focus-visible, .price-edit:focus-visible, .btn-primary:focus-visible, .btn-secondary:focus-visible, .btn-danger:focus-visible, .empty-state button:focus-visible{outline: 2px solid var(--accent);outline-offset: 2px;}
.pop-enter-active, .pop-leave-active{transition: opacity .2s ease;}
.pop-enter-active .custom-modal-card, .pop-leave-active .custom-modal-card{transition: transform .2s ease, opacity .2s ease;}
.pop-enter-from, .pop-leave-to{opacity: 0;}
.pop-enter-from .custom-modal-card, .pop-leave-to .custom-modal-card{opacity: 0;transform: translateY(10px) scale(.985);}

/* ===== Encabezado de "Tarifas del sistema" (corrección de diseño) ===== */
.management-panel.tone-violet .section-header{flex-wrap: wrap;align-items: center;row-gap: 12px;}
.management-panel.tone-violet .section-title{flex: 1 1 200px;min-width: 0;}
.tariff-header-actions{display: flex;align-items: center;gap: 10px;flex: 0 0 auto;margin-left: auto;}
.tariff-header-actions .new-promo-btn{min-height: 34px;padding: 0 12px;font-size: .7rem;white-space: nowrap;}
.tariff-header-actions .counter{flex-shrink: 0;}

@media (max-width: 1100px){.metrics-grid{grid-template-columns: repeat(2, minmax(0, 1fr));}
.management-grid{grid-template-columns: 1fr;}
}
@media (max-width: 700px){.commercial-page{padding: 20px 18px 40px;}
.page-header{align-items: stretch;flex-direction: column;gap: 18px;}
.page-header .new-promo-btn{width: 100%;}
}
@media (max-width: 560px){.commercial-page{padding: 16px 13px 36px;}
.heading-icon{width: 42px;height: 42px;border-radius: 11px;}
.page-heading h1{font-size: 1.25rem;}
.live-badge{display: none;}
.metrics-grid{gap: 9px;}
.metric-card{padding: 14px;}
.metric-head{margin-bottom: 12px;}
.metric-icon{width: 30px;height: 30px;border-radius: 9px;}
.metric-card > strong{font-size: 1.3rem;}
.management-panel{border-radius: 14px;}
.section-header{min-height: 0;padding: 14px;}
.section-icon{width: 36px;height: 36px;}
.promotion-list, .prices-list{padding: 12px;}
.promotion-card{align-items: stretch;flex-direction: column;gap: 14px;padding: 14px;}
.card-actions{padding-top: 12px;border-top: 1px solid var(--line-soft);}
.action-btn.edit{flex: 1;}
.promo-meta{gap: 10px 14px;}
.form-grid-modal{grid-template-columns: 1fr;gap: 0;}
.custom-modal-card{padding: 22px 18px 20px;}
.tariff-header-actions{width: 100%;justify-content: space-between;}
}
@media (max-width: 380px){.commercial-page{padding: 12px 10px 32px;}
.metrics-grid{grid-template-columns: 1fr;}
.page-heading{align-items: flex-start;}
.heading-icon{display: none;}
.promo-main{align-items: flex-start;}
.promo-meta{align-items: flex-start;flex-direction: column;gap: 8px;}
.meta-divider{display: none;}
.modal-actions{flex-direction: column-reverse;}
}
@media (prefers-reduced-motion: reduce){.new-promo-btn, .metric-card, .promotion-card, .price-card, .action-btn, .price-edit, .btn-primary, .btn-secondary, .btn-danger, .empty-state button, .pop-enter-active, .pop-leave-active, .pop-enter-active .custom-modal-card, .pop-leave-active .custom-modal-card{transition: none !important;}
}
</style>