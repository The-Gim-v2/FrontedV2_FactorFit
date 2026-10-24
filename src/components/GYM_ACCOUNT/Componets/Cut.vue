<template>
<div class="form-panel">
<NotificationSystem ref="toastRef" />
<header class="panel-header">
<div class="header-left">
<div class="header-icon">
<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="4" width="18" height="17" rx="2" />
<line x1="16" y1="2" x2="16" y2="6" />
<line x1="8" y1="2" x2="8" y2="6" />
<line x1="3" y1="10" x2="21" y2="10" />
</svg>
</div>
<div class="title-group">
<span class="section-kicker">{{ t('billingConfig') }}</span>
<h2 class="form-title">
{{ t('addTitle') }}
<span class="highlight">{{ t('addHighlight') }}</span>
</h2>
<p class="form-subtitle">{{ t('addSubtitle') }}</p>
</div>
</div>
<button type="button" class="close-x" @click="$emit('close')" :aria-label="t('close')">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
<path d="M18 6L6 18M6 6l12 12" />
</svg>
</button>
</header>
<div class="form-body">
<section class="card config-section">
<div class="section-heading">
<div class="section-icon">
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
<circle cx="16" cy="6" r="2" />
<circle cx="8" cy="12" r="2" />
<circle cx="18" cy="18" r="2" />
</svg>
</div>
<div>
<h3>{{ t('periodConfig') }}</h3>
<p>{{ t('periodConfigDesc') }}</p>
</div>
</div>
<div class="time-row">
<div class="input-group">
<label for="sel-inicio">{{ t('start') }}</label>
<div class="select-wrapper">
<select id="sel-inicio" v-model.number="form.inicio" class="custom-select">
<option v-for="n in 31" :key="'in-' + n" :value="n" :disabled="diaOcupado(n)">{{ t('dayLabel') }} {{ n }}{{ diaOcupado(n) ? ' · ' + t('occupied') : '' }}</option>
</select>
<svg class="select-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
</div>
</div>
<div class="range-link" aria-hidden="true">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M5 12h14M13 6l6 6-6 6" />
</svg>
</div>
<div class="input-group">
<label for="sel-termino">{{ t('end') }}</label>
<div class="select-wrapper">
<select id="sel-termino" v-model.number="form.termino" class="custom-select">
<option v-for="n in 31" :key="'ter-' + n" :value="n" :disabled="diaOcupado(n)">{{ t('dayLabel') }} {{ n }}{{ diaOcupado(n) ? ' · ' + t('occupied') : '' }}</option>
</select>
<svg class="select-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
</div>
</div>
<div class="input-group cutoff-group">
<label for="sel-corte">{{ t('cutoff') }}</label>
<div class="select-wrapper">
<select id="sel-corte" v-model.number="form.corte" class="custom-select cutoff-select">
<option v-for="n in 31" :key="'cor-' + n" :value="n">{{ t('dayLabel') }} {{ n }}</option>
</select>
<svg class="select-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
</div>
</div>
</div>
<div v-if="formCruzaMes" class="wrap-note">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
<path d="M21 3v5h-5" />
<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
<path d="M3 21v-5h5" />
</svg>
<span>{{ t('wrapNote') }}</span>
</div>
<div class="input-group payment-type-group">
<span class="field-label">{{ t('paymentType') }}</span>
<div class="payment-options" role="radiogroup" :aria-label="t('paymentType')">
<button
type="button"
role="radio"
:aria-checked="form.tipo === 'Mensual'"
class="payment-option"
:class="{ active: form.tipo === 'Mensual', 'is-taken': tipoRegistrado('Mensual') }"
:disabled="tipoRegistrado('Mensual')"
@click="form.tipo = 'Mensual'"
>
<span class="payment-option-icon">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
<rect x="3" y="4" width="18" height="17" rx="2" />
<path d="M3 10h18M8 2v4M16 2v4" />
</svg>
</span>
<span class="payment-option-text">
<strong>{{ t('monthly') }}</strong>
<small>{{ tipoRegistrado('Mensual') ? t('alreadyRegistered') : t('monthlyDesc') }}</small>
</span>
<span class="radio-dot"></span>
</button>
<button
type="button"
role="radio"
:aria-checked="form.tipo === 'Quincenal'"
class="payment-option"
:class="{ active: form.tipo === 'Quincenal', 'is-taken': tipoRegistrado('Quincenal') }"
:disabled="tipoRegistrado('Quincenal')"
@click="form.tipo = 'Quincenal'"
>
<span class="payment-option-icon">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
<rect x="3" y="4" width="18" height="17" rx="2" />
<path d="M3 10h18M12 10v11M8 2v4M16 2v4" />
</svg>
</span>
<span class="payment-option-text">
<strong>{{ t('biweekly') }}</strong>
<small>{{ tipoRegistrado('Quincenal') ? t('alreadyRegistered') : t('biweeklyDesc') }}</small>
</span>
<span class="radio-dot"></span>
</button>
</div>
</div>
<div class="rule-preview">
<div class="rule-preview-content">
<span class="rule-label">{{ t('newRule') }}</span>
<strong class="rule-range">
{{ t('dayLabel') }} {{ form.inicio }}
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
{{ t('dayLabel') }} {{ form.termino }}
</strong>
<div class="rule-tags">
<span class="tag tag-days">{{ diasEnRango(form) }} {{ t('daysUnit') }}</span>
<span class="tag tag-cutoff">{{ t('cutoff') }} · {{ t('dayLabel') }} {{ form.corte }}</span>
<span class="tag" :class="form.tipo === 'Mensual' ? 'tag-mes' : 'tag-quin'">
{{ form.tipo === 'Mensual' ? t('monthly') : t('biweekly') }}
</span>
<span v-if="formCruzaMes" class="tag tag-wrap">{{ t('crossesMonth') }}</span>
</div>
<p v-if="conflicto" class="conflict-msg" role="alert">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
{{ conflicto === 'type' ? t('typeTaken') : conflicto === 'full' ? t('allTaken') : t('daysTaken') }}
</p>
</div>
<button type="button" class="btn-save" :disabled="!!conflicto || guardando || cargando" @click="addCorte" :title="t('addBtnTitle')">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round">
<path d="M12 5v14M5 12h14" />
</svg>
<span>{{ t('addRule') }}</span>
</button>
</div>
</section>
<section class="card saved-section">
<div class="section-heading">
<div class="section-icon">
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 6h13M8 12h13M8 18h13" />
<path d="M3 6h.01M3 12h.01M3 18h.01" />
</svg>
</div>
<div class="heading-grow">
<h3>{{ t('activeConfigs') }}</h3>
<p>
{{ cortes.length }}
{{ cortes.length === 1 ? t('configuredRule') : t('configuredRules') }}
</p>
</div>
<span v-if="cortes.length" class="count-badge">{{ cortes.length }}</span>
</div>
<div v-if="cortes.length === 0" class="empty-state">
<div class="empty-icon">
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7">
<rect x="3" y="4" width="18" height="17" rx="2" />
<path d="M3 10h18M8 2v4M16 2v4" />
</svg>
</div>
<div>
<strong>{{ t('noConfigs') }}</strong>
<p>{{ t('noConfigsDesc') }}</p>
</div>
</div>
<div v-else class="saved-list">
<article v-for="(item, index) in cortes" :key="index" class="saved-item">
<div class="saved-item-accent" :class="item.tipo === 'Mensual' ? 'monthly-accent' : 'biweekly-accent'"></div>
<div class="saved-main">
<div class="saved-top">
<strong class="saved-range">
{{ t('dayLabel') }} {{ item.inicio }}
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
{{ t('dayLabel') }} {{ item.termino }}
</strong>
<span class="type-badge" :class="item.tipo === 'Mensual' ? 'badge-mes' : 'badge-quin'">
{{ item.tipo === 'Mensual' ? t('monthly') : t('biweekly') }}
</span>
</div>
<div class="saved-bottom">
<span class="meta cutoff-info">
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
{{ t('cutoffLabel') }} <strong>{{ item.corte }}</strong>
</span>
<span class="meta">{{ diasEnRango(item) }} {{ t('daysUnit') }}</span>
<span v-if="cruzaMes(item)" class="meta wrap-meta">
<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 3v5h-5" /></svg>
{{ t('crossesMonth') }}
</span>
</div>
</div>
<button type="button" class="icon-del" @click="removeCorte(index)" :disabled="guardando || cargando" :title="t('delete')" :aria-label="t('delete')">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
<path d="M3 6h18" />
<path d="M8 6V4h8v2" />
<path d="M19 6l-1 14H6L5 6" />
<path d="M10 11v5M14 11v5" />
</svg>
</button>
</article>
</div>
</section>
<section class="card calendar-section">
<div class="calendar-header-info">
<div class="section-heading no-margin">
<div class="section-icon">
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
<rect x="3" y="4" width="18" height="17" rx="2" />
<path d="M3 10h18M8 2v4M16 2v4" />
</svg>
</div>
<div>
<h3>{{ t('previewMonth') }}</h3>
<p>{{ t('calendarDesc') }}</p>
</div>
</div>
<div class="calendar-legend">
<span class="legend-item"><span class="dot dot-corte"></span>{{ t('cutoff') }}</span>
<span class="legend-item"><span class="dot dot-mes"></span>{{ t('monthly') }}</span>
<span class="legend-item"><span class="dot dot-quin"></span>{{ t('biweekly') }}</span>
</div>
</div>
<div class="calendar-grid">
<div
v-for="n in 31"
:key="n"
:class="['cal-day', getDayClass(n)]"
:title="`${t('dayLabel')} ${n}`"
>
<span>{{ n }}</span>
<svg v-if="getDayClass(n) === 'is-corte'" class="cut-icon" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
</div>
</div>
<div v-if="cortes.length === 0" class="calendar-hint">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
<circle cx="12" cy="12" r="9" />
<path d="M12 8h.01M11 12h1v4h1" />
</svg>
{{ t('calendarHint') }}
</div>
</section>
</div>
</div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
interface CorteItem {
id?: number;
inicio: number;
termino: number;
corte: number;
tipo: string;
}
const settings = reactive({
idioma: localStorage.getItem('GYM_ACCOUNT-idioma') || 'es'
});
const translations: Record<string, Record<string, string>> = {
es: {
addTitle: 'AGREGAR',
addHighlight: 'CORTE',
addSubtitle: 'Configura los periodos, fechas de corte y frecuencia de cobro.',
billingConfig: 'Configuración de cobros',
close: 'Cerrar modal',
start: 'Inicio',
end: 'Término',
cutoff: 'Corte',
paymentType: 'Tipo de pago',
monthly: 'Mensual',
biweekly: 'Quincenal',
monthlyDesc: 'Un cobro por mes',
biweeklyDesc: 'Dos periodos al mes',
addBtnTitle: 'Agregar corte',
addRule: 'Agregar corte',
activeConfigs: 'Configuraciones activas',
cutoffLabel: 'Día de corte',
delete: 'Eliminar',
previewMonth: 'Vista previa del mes',
dayLabel: 'Día',
duplicateError: 'Esta configuración ya existe',
successMsg: 'Corte guardado con éxito',
deleteMsg: 'Corte eliminado',
periodConfig: 'Configuración del periodo',
periodConfigDesc: 'Define el inicio, el término y el día de corte.',
newRule: 'Nueva configuración',
configuredRule: 'regla configurada',
configuredRules: 'reglas configuradas',
noConfigs: 'Sin configuraciones',
noConfigsDesc: 'Agrega un periodo de cobro para verlo aquí.',
calendarDesc: 'Distribución visual de los periodos configurados.',
calendarHint: 'Agrega una configuración para ver los días de cobro.',
daysUnit: 'días',
crossesMonth: 'Cruza de mes',
wrapNote: 'El periodo empieza en un mes y termina en el siguiente (por ejemplo, del 24 al 7).',
occupied: 'ocupado',
alreadyRegistered: 'Ya registrado',
typeTaken: 'Ya hay un corte de este tipo. Elimínalo para registrar otro.',
daysTaken: 'Esos días ya están ocupados por otro corte.',
allTaken: 'Ya registraste un corte mensual y uno quincenal. Elimina uno para agregar otro.'
},
en: {
addTitle: 'ADD',
addHighlight: 'CUTOFF',
addSubtitle: 'Configure billing periods, cutoff dates and payment frequency.',
billingConfig: 'Billing configuration',
close: 'Close modal',
start: 'Start',
end: 'End',
cutoff: 'Cutoff',
paymentType: 'Payment type',
monthly: 'Monthly',
biweekly: 'Biweekly',
monthlyDesc: 'One charge per month',
biweeklyDesc: 'Two periods per month',
addBtnTitle: 'Add cutoff',
addRule: 'Add cutoff',
activeConfigs: 'Active configurations',
cutoffLabel: 'Cutoff day',
delete: 'Delete',
previewMonth: 'Month preview',
dayLabel: 'Day',
duplicateError: 'This configuration already exists',
successMsg: 'Cutoff saved successfully',
deleteMsg: 'Cutoff deleted',
periodConfig: 'Period configuration',
periodConfigDesc: 'Define the start, the end and the cutoff day.',
newRule: 'New configuration',
configuredRule: 'configured rule',
configuredRules: 'configured rules',
noConfigs: 'No configurations',
noConfigsDesc: 'Add a billing period to see it here.',
calendarDesc: 'Visual distribution of configured periods.',
calendarHint: 'Add a configuration to see the billing days.',
daysUnit: 'days',
crossesMonth: 'Crosses months',
wrapNote: 'The period starts in one month and ends in the next (for example, from the 24th to the 7th).',
occupied: 'taken',
alreadyRegistered: 'Already registered',
typeTaken: 'A cutoff of this type already exists. Delete it to register another.',
daysTaken: 'Those days are already used by another cutoff.',
allTaken: 'You already registered one monthly and one biweekly cutoff. Delete one to add another.'
}
};
const t = (key: string) =>
translations[settings.idioma]?.[key] || translations.es?.[key] || key;
const form = reactive<CorteItem>({
inicio: 1,
termino: 15,
corte: 2,
tipo: 'Mensual'
});
const cortes = ref<CorteItem[]>([]);
const cargando = ref(false);
const guardando = ref(false);
const selectedSede = ref<number>(0);
const base = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const api = `${base}${base.endsWith("/api") ? "" : "/api"}/gym/cortes`;
const token = () => sessionStorage.getItem("auth_token") || "";
const obtenerSede = () => Number(sessionStorage.getItem("selected_sede_id") || 0);
const request = async (path: string, options: RequestInit = {}) => {
const res = await fetch(`${api}${path}`, { ...options, headers: { Accept: "application/json", Authorization: `Bearer ${token()}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) } });
const data = await res.json().catch(() => ({}));
if (!res.ok) throw new Error(data.message || data.error || `Error HTTP ${res.status}`);
return data;
};
const cargarCortes = async () => {
const sede = obtenerSede();
selectedSede.value = sede;
if (!sede) { cortes.value = []; toastRef.value?.notify?.("Selecciona una sucursal", "error"); return; }
cargando.value = true;
try { const data = await request(`?sede_id=${sede}`); cortes.value = (Array.isArray(data) ? data : data.data || []).map((x: any) => ({ id: Number(x.ID_Corte_Regla), inicio: Number(x.Inicio), termino: Number(x.Termino), corte: Number(x.Corte), tipo: x.Tipo_Pago })); }
catch (e: any) { cortes.value = []; toastRef.value?.notify?.(e.message, "error"); }
finally { cargando.value = false; }
};
const toastRef = ref<any>(null);
const cruzaMes = (c: { inicio: number; termino: number }) =>
c.inicio > c.termino;
const formCruzaMes = computed(() => cruzaMes(form));
const diasEnRango = (c: { inicio: number; termino: number }) =>
cruzaMes(c)
? 31 - c.inicio + 1 + c.termino
: c.termino - c.inicio + 1;
const enRango = (n: number, c: CorteItem) =>
cruzaMes(c)
? n >= c.inicio || n <= c.termino
: n >= c.inicio && n <= c.termino;
const tipoRegistrado = (tipo: string) =>
cortes.value.some((c) => c.tipo === tipo);
const diaOcupado = (n: number) =>
cortes.value.some((c) => enRango(n, c));
const diasDe = (c: CorteItem) =>
Array.from({length:31},(_,i)=>i+1).filter(n=>enRango(n,c));
const conflicto = computed<'type' | 'days' | 'full' | null>(() => {
if (tipoRegistrado('Mensual') && tipoRegistrado('Quincenal')) return 'full';
if (tipoRegistrado(form.tipo)) return 'type';
if (diasDe(form).some((n) => diaOcupado(n))) return 'days';
return null;
});
watch(
cortes,
() => {
if (tipoRegistrado(form.tipo)) {
const libre = form.tipo === 'Mensual' ? 'Quincenal' : 'Mensual';
if (!tipoRegistrado(libre)) form.tipo = libre;
}
},
{ deep: true }
);
const addCorte = async () => {
if (conflicto.value || guardando.value) return;
const sede = obtenerSede();
if (!sede) { toastRef.value?.notify?.('Selecciona una sucursal', 'error'); return; }
guardando.value = true;
try {
await request('', { method: 'POST', body: JSON.stringify({ sede_id: sede, inicio: form.inicio, termino: form.termino, corte: form.corte, tipo: form.tipo }) });
await cargarCortes();
window.dispatchEvent(new CustomEvent('factorfit:cortes-changed', { detail: { sede_id: sede } }));
toastRef.value?.notify?.(t('successMsg'), 'success');
} catch (e: any) { toastRef.value?.notify?.(e.message, 'error'); }
finally { guardando.value = false; }
};
const removeCorte = async (index: number) => {
const item = cortes.value[index];
if (!item?.id || guardando.value) return;
guardando.value = true;
try {
await request(`/${item.id}?sede_id=${obtenerSede()}`, { method: 'DELETE' });
await cargarCortes();
window.dispatchEvent(new CustomEvent('factorfit:cortes-changed', { detail: { sede_id: obtenerSede() } }));
toastRef.value?.notify?.(t('deleteMsg'), 'info');
} catch (e: any) { toastRef.value?.notify?.(e.message, 'error'); }
finally { guardando.value = false; }
};
const getDayClass = (n: number) => {
if (cortes.value.some((c) => Number(c.corte) === n)) {
return 'is-corte';
}
const rangeMatch = cortes.value.find((c) => enRango(n, c));
if (!rangeMatch) return 'default-bg';
return rangeMatch.tipo === 'Mensual' ? 'mes' : 'quin';
};
const handleLanguageChange = (e: Event) => {
const customEvent = e as CustomEvent;
if (customEvent.detail?.idioma) {
settings.idioma = customEvent.detail.idioma;
}
};
onMounted(() => {
window.addEventListener('idioma-changed', handleLanguageChange);
window.addEventListener('factorfit:branch-changed', cargarCortes);
cargarCortes();
});
onUnmounted(() => {
window.removeEventListener('idioma-changed', handleLanguageChange);
window.removeEventListener('factorfit:branch-changed', cargarCortes);
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&family=Oswald:wght@500;600;700&display=swap');
* {
box-sizing: border-box;
}
.form-panel {
--accent: var(--color-highlight, #3b82f6);
--card-bg: var(--bg-cards, #111317);
--surface: color-mix(in srgb, var(--card-bg) 90%, black);
--surface-2: color-mix(in srgb, var(--card-bg) 80%, black);
--text: var(--color-texto-general, #f4f4f5);
--title: var(--color-titulos, #ffffff);
--muted: color-mix(in srgb, var(--text) 62%, transparent);
--muted-2: color-mix(in srgb, var(--text) 42%, transparent);
--line: color-mix(in srgb, var(--text) 11%, transparent);
--line-strong: color-mix(in srgb, var(--text) 20%, transparent);
--blue: #60a5fa;
--green: #4ade80;
--amber: #fbbf24;
--red: #f87171;
width: min(96vw, 720px);
max-height: 92vh;
overflow-y: auto;
padding: 26px;
border: 1px solid var(--line);
border-radius: var(--app-border-radius, 16px);
background: var(--card-bg);
color: var(--text);
font-family: 'Inter', sans-serif;
font-size: 1rem;
box-shadow: 0 28px 70px rgba(0, 0, 0, 0.58);
scrollbar-width: thin;
scrollbar-color: color-mix(in srgb, var(--text) 18%, transparent) transparent;
}
.form-panel::-webkit-scrollbar { width: 6px; }
.form-panel::-webkit-scrollbar-track { background: transparent; }
.form-panel::-webkit-scrollbar-thumb {
border-radius: 10px;
background: color-mix(in srgb, var(--text) 18%, transparent);
}
.panel-header {
display: flex;
align-items: flex-start;
justify-content: space-between;
gap: 16px;
padding-bottom: 20px;
margin-bottom: 20px;
border-bottom: 1px solid var(--line);
}
.header-left {
min-width: 0;
display: flex;
align-items: center;
gap: 14px;
}
.header-icon {
width: 48px;
height: 48px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
border-radius: 12px;
color: var(--accent);
background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.title-group { min-width: 0; }
.section-kicker {
display: block;
margin-bottom: 2px;
color: var(--accent);
font-size: 0.78rem;
font-weight: 600;
}
.form-title {
margin: 0;
color: var(--title);
font-family: 'Oswald', sans-serif;
font-size: 1.6rem;
font-weight: 600;
line-height: 1.1;
letter-spacing: 0.4px;
}
.highlight { color: var(--accent); }
.form-subtitle {
margin: 5px 0 0;
color: var(--muted);
font-size: 0.88rem;
line-height: 1.45;
}
.close-x {
width: 38px;
height: 38px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid var(--line);
border-radius: 10px;
background: var(--surface);
color: var(--muted);
cursor: pointer;
transition: background 0.17s ease, border-color 0.17s ease, color 0.17s ease;
}
.close-x:hover {
border-color: var(--line-strong);
background: color-mix(in srgb, var(--text) 7%, var(--surface));
color: var(--text);
}
.form-body {
display: flex;
flex-direction: column;
gap: 16px;
}
.card {
padding: 20px;
border: 1px solid var(--line);
border-radius: 14px;
background: var(--surface);
}
.section-heading {
display: flex;
align-items: center;
gap: 12px;
margin-bottom: 18px;
}
.section-heading.no-margin { margin-bottom: 0; }
.heading-grow { flex: 1; min-width: 0; }
.section-icon {
width: 38px;
height: 38px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border-radius: 10px;
color: var(--accent);
background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.section-heading h3 {
margin: 0;
color: var(--title);
font-family: 'Oswald', sans-serif;
font-size: 1.1rem;
font-weight: 600;
letter-spacing: 0.3px;
}
.section-heading p {
margin: 2px 0 0;
color: var(--muted);
font-size: 0.82rem;
line-height: 1.4;
}
.count-badge {
min-width: 30px;
height: 30px;
display: flex;
align-items: center;
justify-content: center;
padding: 0 9px;
border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
border-radius: 8px;
color: var(--accent);
background: color-mix(in srgb, var(--accent) 10%, transparent);
font-family: 'IBM Plex Mono', monospace;
font-size: 0.82rem;
font-weight: 700;
}
.time-row {
display: grid;
grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) minmax(0, 1fr);
align-items: end;
gap: 10px;
margin-bottom: 14px;
}
.input-group { min-width: 0; }
.input-group label,
.field-label {
display: block;
margin: 0 0 7px;
color: var(--muted);
font-size: 0.82rem;
font-weight: 600;
}
.range-link {
height: 48px;
display: flex;
align-items: center;
color: var(--muted-2);
}
.cutoff-group {
padding-left: 12px;
border-left: 1px solid var(--line);
}
.select-wrapper { position: relative; min-width: 0; }
.select-arrow {
position: absolute;
top: 50%;
right: 13px;
transform: translateY(-50%);
color: var(--muted);
pointer-events: none;
}
.custom-select {
width: 100%;
height: 48px;
padding: 0 36px 0 14px;
border: 1px solid var(--line-strong);
border-radius: 10px;
outline: none;
appearance: none;
-webkit-appearance: none;
background: var(--surface-2);
color: var(--text);
font-family: 'Inter', sans-serif;
font-size: 0.95rem;
font-weight: 600;
cursor: pointer;
transition: border-color 0.17s ease, box-shadow 0.17s ease;
}
.custom-select:hover { border-color: color-mix(in srgb, var(--text) 30%, transparent); }
.custom-select:focus {
border-color: var(--accent);
box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}
.cutoff-select {
border-color: rgba(251, 191, 36, 0.4);
color: var(--amber);
}
.custom-select option { background: #15171b; color: #f4f4f5; }
.wrap-note {
display: flex;
align-items: flex-start;
gap: 10px;
margin-bottom: 16px;
padding: 11px 13px;
border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
border-radius: 10px;
background: color-mix(in srgb, var(--accent) 8%, transparent);
color: var(--text);
font-size: 0.85rem;
line-height: 1.45;
}
.wrap-note svg { flex-shrink: 0; margin-top: 1px; color: var(--accent); }
.payment-type-group { margin-bottom: 16px; }
.payment-options {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 10px;
}
.payment-option {
min-width: 0;
display: flex;
align-items: center;
gap: 12px;
padding: 12px 14px;
border: 1px solid var(--line-strong);
border-radius: 12px;
background: var(--surface-2);
color: var(--muted);
font-family: inherit;
text-align: left;
cursor: pointer;
transition: border-color 0.17s ease, background 0.17s ease, color 0.17s ease;
}
.payment-option:hover { border-color: color-mix(in srgb, var(--text) 32%, transparent); color: var(--text); }
.payment-option.active {
border-color: var(--accent);
background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
color: var(--text);
}
.payment-option:disabled {
opacity: 0.45;
cursor: not-allowed;
}
.payment-option:disabled:hover {
border-color: var(--line-strong);
color: var(--muted);
}
.conflict-msg {
display: flex;
align-items: flex-start;
gap: 7px;
margin: 10px 0 0;
color: var(--red);
font-size: 0.82rem;
line-height: 1.4;
}
.conflict-msg svg { flex-shrink: 0; margin-top: 1px; }
.btn-save:disabled {
opacity: 0.4;
cursor: not-allowed;
filter: none;
}
.btn-save:disabled:active { transform: none; }
.payment-option:focus-visible,
.btn-save:focus-visible,
.close-x:focus-visible,
.icon-del:focus-visible {
outline: 2px solid var(--accent);
outline-offset: 2px;
}
.payment-option-icon {
width: 38px;
height: 38px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border-radius: 9px;
background: color-mix(in srgb, var(--text) 6%, transparent);
}
.payment-option.active .payment-option-icon {
background: color-mix(in srgb, var(--accent) 16%, transparent);
color: var(--accent);
}
.payment-option-text { min-width: 0; flex: 1; }
.payment-option strong {
display: block;
color: inherit;
font-size: 0.95rem;
font-weight: 700;
}
.payment-option small {
display: block;
margin-top: 2px;
color: var(--muted);
font-size: 0.78rem;
}
.radio-dot {
width: 18px;
height: 18px;
flex-shrink: 0;
border: 2px solid var(--line-strong);
border-radius: 50%;
transition: border-color 0.17s ease, background 0.17s ease;
}
.payment-option.active .radio-dot {
border-color: var(--accent);
background: radial-gradient(circle, var(--accent) 0 45%, transparent 50%);
}
.rule-preview {
display: flex;
align-items: center;
justify-content: space-between;
gap: 14px;
padding: 16px;
border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line));
border-radius: 12px;
background: color-mix(in srgb, var(--accent) 5%, var(--surface-2));
}
.rule-preview-content { min-width: 0; flex: 1; }
.rule-label {
display: block;
color: var(--accent);
font-size: 0.78rem;
font-weight: 600;
}
.rule-range {
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 7px;
margin-top: 3px;
color: var(--title);
font-family: 'IBM Plex Mono', monospace;
font-size: 1.15rem;
}
.rule-range svg { color: var(--muted-2); }
.rule-tags {
display: flex;
flex-wrap: wrap;
gap: 6px;
margin-top: 10px;
}
.tag {
display: inline-flex;
align-items: center;
min-height: 24px;
padding: 0 9px;
border-radius: 999px;
background: color-mix(in srgb, var(--text) 8%, transparent);
color: var(--muted);
font-size: 0.76rem;
font-weight: 600;
}
.tag-cutoff { background: rgba(251, 191, 36, 0.12); color: var(--amber); }
.tag-mes { background: rgba(59, 130, 246, 0.14); color: var(--blue); }
.tag-quin { background: rgba(34, 197, 94, 0.13); color: var(--green); }
.tag-wrap {
background: color-mix(in srgb, var(--accent) 14%, transparent);
color: var(--accent);
}
.btn-save {
min-height: 48px;
flex-shrink: 0;
display: inline-flex;
align-items: center;
justify-content: center;
gap: 8px;
padding: 0 20px;
border: 0;
border-radius: 10px;
background: var(--color-botones, #2563eb);
color: var(--color-texto-botones, #ffffff);
font-family: 'Inter', sans-serif;
font-size: 0.92rem;
font-weight: 700;
white-space: nowrap;
cursor: pointer;
transition: filter 0.15s ease, transform 0.15s ease;
}
.btn-save:hover { filter: brightness(1.1); }
.btn-save:active { transform: scale(0.97); }
.empty-state {
display: flex;
align-items: center;
gap: 14px;
padding: 18px;
border: 1px dashed var(--line-strong);
border-radius: 12px;
background: var(--surface-2);
}
.empty-icon {
width: 46px;
height: 46px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border-radius: 11px;
color: var(--muted);
background: color-mix(in srgb, var(--text) 5%, transparent);
}
.empty-state strong { display: block; color: var(--text); font-size: 0.95rem; }
.empty-state p { margin: 3px 0 0; color: var(--muted); font-size: 0.85rem; }
.saved-list { display: flex; flex-direction: column; gap: 10px; }
.saved-item {
display: grid;
grid-template-columns: 4px 1fr auto;
align-items: center;
gap: 14px;
padding: 13px 14px;
border: 1px solid var(--line);
border-radius: 12px;
background: var(--surface-2);
transition: border-color 0.17s ease;
}
.saved-item:hover { border-color: var(--line-strong); }
.saved-item-accent { align-self: stretch; width: 4px; border-radius: 5px; }
.monthly-accent { background: #3b82f6; }
.biweekly-accent { background: #22c55e; }
.saved-main { min-width: 0; }
.saved-top {
display: flex;
align-items: center;
justify-content: space-between;
gap: 10px;
}
.saved-range {
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 6px;
color: var(--text);
font-family: 'IBM Plex Mono', monospace;
font-size: 1rem;
}
.saved-range svg { color: var(--muted-2); }
.type-badge {
display: inline-flex;
align-items: center;
min-height: 24px;
padding: 0 10px;
border-radius: 999px;
font-size: 0.76rem;
font-weight: 700;
}
.badge-mes { background: rgba(59, 130, 246, 0.14); color: var(--blue); }
.badge-quin { background: rgba(34, 197, 94, 0.13); color: var(--green); }
.saved-bottom {
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 6px 14px;
margin-top: 7px;
}
.meta {
display: inline-flex;
align-items: center;
gap: 5px;
color: var(--muted);
font-size: 0.82rem;
}
.cutoff-info { color: var(--muted); }
.cutoff-info svg { color: var(--amber); }
.cutoff-info strong { color: var(--amber); font-family: 'IBM Plex Mono', monospace; }
.wrap-meta { color: var(--accent); }
.icon-del {
width: 38px;
height: 38px;
flex-shrink: 0;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid rgba(239, 68, 68, 0.2);
border-radius: 9px;
background: rgba(239, 68, 68, 0.07);
color: var(--red);
cursor: pointer;
transition: background 0.17s ease, border-color 0.17s ease;
}
.icon-del:hover {
border-color: rgba(239, 68, 68, 0.45);
background: rgba(239, 68, 68, 0.14);
}
.calendar-header-info {
display: flex;
align-items: center;
justify-content: space-between;
flex-wrap: wrap;
gap: 12px;
margin-bottom: 16px;
}
.calendar-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
.legend-item {
display: flex;
align-items: center;
gap: 6px;
color: var(--muted);
font-size: 0.8rem;
font-weight: 500;
}
.dot { width: 9px; height: 9px; flex-shrink: 0; border-radius: 50%; }
.dot-corte { background: var(--amber); }
.dot-mes { background: #3b82f6; }
.dot-quin { background: #22c55e; }
.calendar-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
gap: 7px;
}
.cal-day {
position: relative;
min-height: 46px;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid transparent;
border-radius: 9px;
font-family: 'IBM Plex Mono', monospace;
font-size: 0.92rem;
font-weight: 600;
}
.cut-icon { position: absolute; top: 4px; right: 4px; }
.default-bg {
border-color: var(--line);
background: var(--surface-2);
color: var(--muted-2);
}
.mes {
border-color: rgba(59, 130, 246, 0.35);
background: rgba(59, 130, 246, 0.15);
color: #93c5fd;
}
.quin {
border-color: rgba(34, 197, 94, 0.35);
background: rgba(34, 197, 94, 0.14);
color: #86efac;
}
.is-corte {
border-color: rgba(251, 191, 36, 0.6) !important;
background: rgba(251, 191, 36, 0.18) !important;
color: var(--amber) !important;
}
.calendar-hint {
display: flex;
align-items: center;
gap: 8px;
margin-top: 14px;
padding-top: 14px;
border-top: 1px solid var(--line);
color: var(--muted);
font-size: 0.85rem;
}
@media (max-width: 640px) {
.form-panel { width: min(97vw, 560px); padding: 18px; }
.card { padding: 16px; }
.time-row { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
.cutoff-group {
grid-column: 1 / -1;
padding-left: 0;
border-left: 0;
}
.rule-preview { flex-direction: column; align-items: stretch; }
.btn-save { width: 100%; }
}
@media (max-width: 480px) {
.form-panel {
width: calc(100vw - 12px);
max-height: 96vh;
padding: 14px;
border-radius: 13px;
}
.form-title { font-size: 1.35rem; }
.header-icon { width: 42px; height: 42px; }
.payment-options { grid-template-columns: 1fr; }
.calendar-grid {
grid-template-columns: repeat(7, minmax(0, 1fr));
gap: 5px;
}
.cal-day { min-height: 40px; font-size: 0.82rem; }
}
@media (max-width: 380px) {
.time-row { grid-template-columns: 1fr; }
.range-link { display: none; }
}
@media (prefers-reduced-motion: reduce) {
.close-x, .custom-select, .payment-option, .btn-save, .saved-item, .icon-del, .radio-dot {
transition: none !important;
}
}
</style>
