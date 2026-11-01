<template>
  <div class="form-panel" role="dialog" aria-modal="true" aria-labelledby="ingresos-analisis-title">
    <div class="panel-header">
      <div class="title-group"><h2 id="ingresos-analisis-title" class="form-title">{{ t('title') }} <span class="highlight">{{ t('highlight') }}</span></h2><p class="form-subtitle">{{ t('subtitle') }}</p></div>
      <button type="button" class="close-x" :aria-label="t('close')" @click="emit('close')"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="tabs" role="tablist" :aria-label="t('subtitle')">
      <button v-for="tb in tabs" :key="tb" type="button" class="tab" :class="{active:tab===tb}" role="tab" :aria-selected="tab===tb" @click="tab=tb">{{ t('tab_'+tb) }}</button>
    </div>
    <div class="form-body">
      <div v-if="tab==='membership'" class="section">
        <div v-if="membershipRows.length" class="rows">
          <div v-for="r in membershipRows" :key="r.name" class="row">
            <div class="row-head"><span class="row-name"><i class="dot" :class="r.cls"></i>{{ r.name }}</span><span class="row-value">{{ money(r.amount) }}</span></div>
            <div class="track"><div class="fill" :class="r.cls" :style="{width:r.percent+'%'}"></div></div>
            <div class="row-foot"><span>{{ r.members }} {{ t('members') }} · {{ r.count }} {{ t('payments') }}</span><span>{{ r.percent }}%</span></div>
          </div>
        </div>
        <p v-else class="empty">{{ t('empty') }}</p>
        <div v-if="topMembership" class="insight"><span class="insight-label">{{ t('topMembership') }}</span><span class="insight-value">{{ topMembership.name }} · {{ topMembership.percent }}%</span></div>
      </div>
      <div v-else-if="tab==='payment'" class="section">
        <template v-if="paymentRows.length">
          <div class="split-bar"><div v-for="p in paymentRows" :key="p.name" class="split-seg" :class="p.cls" :style="{width:p.percent+'%'}"></div></div>
          <div class="pay-grid">
            <div v-for="p in paymentRows" :key="p.name" class="pay-card" :class="p.cls">
              <span class="pay-label"><i class="dot" :class="p.cls"></i>{{ p.name }}</span>
              <span class="pay-value">{{ money(p.amount) }}</span>
              <span class="pay-sub">{{ p.count }} {{ t('payments') }} · {{ p.percent }}%</span>
              <span class="pay-sub">{{ t('ticket') }}: {{ money(p.count ? p.amount/p.count : 0) }}</span>
            </div>
          </div>
        </template>
        <p v-else class="empty">{{ t('empty') }}</p>
      </div>
      <div v-else class="section">
        <template v-if="monthly.length">
          <div class="chart-container" :aria-label="t('chartLabel')">
            <div class="chart-bars">
              <div v-for="m in monthly" :key="m.key" class="bar-col">
                <div class="bar-track" :title="`${monthName(m.key)}: ${money(m.value)} · ${m.count} ${t('payments')}`">
                  <div class="tooltip-badge">{{ money(m.value) }}</div>
                  <div class="bar-fill" :class="{best:m.key===bestMonth?.key}" :style="{height:m.percent+'%'}"></div>
                </div>
                <span class="month-label">{{ monthName(m.key) }}</span>
              </div>
            </div>
          </div>
          <div class="kpi-grid">
            <div class="kpi"><span class="kpi-label">{{ t('lastMonth') }}</span><span v-if="delta!==null" class="kpi-value" :class="delta>=0?'up':'down'">{{ delta>0?'▲ ':delta<0?'▼ ':'' }}{{ Math.abs(delta).toFixed(1) }}%</span><span v-else class="kpi-value neutral">{{ t('noPrevious') }}</span></div>
            <div class="kpi"><span class="kpi-label">{{ t('bestMonth') }}</span><span class="kpi-value up">{{ bestMonth ? monthName(bestMonth.key)+' · '+money(bestMonth.value) : '—' }}</span></div>
          </div>
          <p class="note">{{ t('realNote') }}</p>
        </template>
        <p v-else class="empty">{{ confirmed.length ? t('noDated') : t('empty') }}</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
type Tab = 'membership' | 'payment' | 'trend';
type Payment = { id_pago?:number|string; id_inscripto?:number|string; fecha_pago?:string|null; monto?:number|string|null; periodo?:string|null; membresia?:string|null; tipo_pago?:string|null };
type IncomeUser = { membership?:string; amount?:string; mensualidad?:string };
type Group = { name:string; amount:number; count:number; members:number; percent:number; cls:string };
const props = withDefaults(defineProps<{ pagos?:Payment[]; users?:IncomeUser[] }>(),{ pagos:()=>[],users:()=>[] });
const emit = defineEmits<{(event:'close'):void}>();
const tabs:Tab[] = ['membership','payment','trend'];
const tab = ref<Tab>('membership');
const idioma = ref(typeof localStorage==='undefined'?'es':localStorage.getItem('GYM_ACCOUNT-idioma')||'es');
const translations:{es:Record<string,string>;en:Record<string,string>} = {
  es:{title:'ANÁLISIS',highlight:'DE INGRESOS',subtitle:'De dónde vienen tus ingresos confirmados',close:'Cerrar modal',tab_membership:'Membresía',tab_payment:'Tipo de pago',tab_trend:'Tendencia',members:'miembros',payments:'pagos',empty:'No hay pagos confirmados con estos filtros.',noDated:'Hay pagos confirmados, pero no tienen una fecha válida para la gráfica.',noPrevious:'Sin datos del mes anterior',topMembership:'Membresía que más aporta',ticket:'Ticket promedio',lastMonth:'Último mes vs anterior',bestMonth:'Mejor mes',chartLabel:'Ingresos por mes',realNote:'Solo se muestran meses con pagos confirmados registrados. No se usan datos de ejemplo.',unknown:'Sin especificar',unknownPlan:'Sin plan'},
  en:{title:'INCOME',highlight:'ANALYSIS',subtitle:'Where your confirmed revenue comes from',close:'Close modal',tab_membership:'Membership',tab_payment:'Payment method',tab_trend:'Trend',members:'members',payments:'payments',empty:'No confirmed payments match these filters.',noDated:'Confirmed payments exist, but none have a valid date for this chart.',noPrevious:'No data for previous month',topMembership:'Top contributing membership',ticket:'Average ticket',lastMonth:'Last month vs previous',bestMonth:'Best month',chartLabel:'Monthly revenue',realNote:'Only months with actual confirmed payments are shown. No sample data.',unknown:'Unspecified',unknownPlan:'No plan'}
};
const t=(key:string):string=>(idioma.value==='en'?translations.en:translations.es)[key]??key;
const locale=computed(()=>idioma.value==='en'?'en-US':'es-MX');
const money=(value:number)=>new Intl.NumberFormat(locale.value,{style:'currency',currency:'MXN'}).format(value);
const confirmed=computed(()=>props.pagos.filter(p=>Number.isFinite(Number(p.monto))&&Number(p.monto)>0));
const total=computed(()=>confirmed.value.reduce((sum,p)=>sum+Number(p.monto),0));
const pct=(amount:number)=>total.value>0?Math.round(amount/total.value*100):0;
const colors=['c-blue','c-purple','c-green','c-orange','c-pink','c-red'];
const membershipClass:Record<string,string>={'1 Mes':'c-red','2 Meses':'c-blue','3 Meses':'c-green','4 Meses':'c-purple','5 Meses':'c-orange','6 Meses':'c-pink'};
const membershipRows=computed<Group[]>(()=>{
  const grouped=new Map<string,{amount:number;count:number;ids:Set<string>}>();
  for(const p of confirmed.value){const name=String(p.membresia||p.periodo||t('unknownPlan')).trim()||t('unknownPlan');const row=grouped.get(name)||{amount:0,count:0,ids:new Set<string>()};row.amount+=Number(p.monto);row.count++;row.ids.add(String(p.id_inscripto??p.id_pago??`unknown-${row.count}`));grouped.set(name,row);}
  return [...grouped].map(([name,row])=>({name,amount:row.amount,count:row.count,members:row.ids.size,percent:pct(row.amount),cls:membershipClass[name]||'c-default'})).sort((a,b)=>b.amount-a.amount);
});
const topMembership=computed(()=>membershipRows.value[0]||null);
const paymentRows=computed<Group[]>(()=>{
  const grouped=new Map<string,{amount:number;count:number;ids:Set<string>}>();
  for(const p of confirmed.value){const name=String(p.tipo_pago||t('unknown')).trim()||t('unknown');const row=grouped.get(name)||{amount:0,count:0,ids:new Set<string>()};row.amount+=Number(p.monto);row.count++;row.ids.add(String(p.id_inscripto??p.id_pago??`unknown-${row.count}`));grouped.set(name,row);}
  return [...grouped].map(([name,row],i)=>({name,amount:row.amount,count:row.count,members:row.ids.size,percent:pct(row.amount),cls:colors[i%colors.length]??'c-default'})).sort((a,b)=>b.amount-a.amount);
});
type Month={key:string;value:number;count:number;percent:number};
const validMonth=(date:string|null|undefined):string|null=>{const match=/^(\d{4})-(\d{2})-(\d{2})(?:$|[ T])/.exec(String(date||''));if(!match)return null;const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);const parsed=new Date(Date.UTC(y,m-1,d));return parsed.getUTCFullYear()===y&&parsed.getUTCMonth()===m-1&&parsed.getUTCDate()===d?`${match[1]}-${match[2]}`:null;};
const monthly=computed<Month[]>(()=>{
  const values=new Map<string,{value:number;count:number}>();
  for(const p of confirmed.value){const key=validMonth(p.fecha_pago);if(!key)continue;const row=values.get(key)||{value:0,count:0};row.value+=Number(p.monto);row.count++;values.set(key,row);}
  const max=Math.max(1,...[...values.values()].map(v=>v.value));
  return [...values].sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>({key,...value,percent:Math.max(2,value.value/max*100)}));
});
const monthName=(key:string):string=>new Intl.DateTimeFormat(locale.value,{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${key}-01T12:00:00Z`)).replace(/\./g,'').toUpperCase();
const bestMonth=computed(()=>monthly.value.reduce<Month|null>((best,row)=>!best||row.value>best.value?row:best,null));
const delta=computed<number|null>(()=>{const current=monthly.value[monthly.value.length-1];if(!current)return null;const year=Number(current.key.slice(0,4)),month=Number(current.key.slice(5,7));const previousKey=new Date(Date.UTC(year,month-2,1)).toISOString().slice(0,7);const previous=monthly.value.find(row=>row.key===previousKey);return previous&&previous.value>0?(current.value-previous.value)/previous.value*100:null;});
const onLang=(e:Event)=>{const value=(e as CustomEvent<{idioma?:string}>).detail?.idioma;if(value)idioma.value=value;};
const onEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')emit('close');};
onMounted(()=>{window.addEventListener('idioma-changed',onLang as EventListener);window.addEventListener('keydown',onEscape);});
onUnmounted(()=>{window.removeEventListener('idioma-changed',onLang as EventListener);window.removeEventListener('keydown',onEscape);});
</script>
<style scoped>
.highlight { color: var(--color-highlight, #3b82f6); }
.form-panel {
  background: var(--bg-cards, #121214);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.08));
  color: var(--color-texto-general, #fff);
  border-radius: var(--app-border-radius, 20px);
  padding: 24px;
  width: 95%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', system-ui, sans-serif;
}
.form-panel *, .form-panel *::before, .form-panel *::after { box-sizing: border-box; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.title-group { display: flex; flex-direction: column; gap: 3px; }
.form-title { font-family: 'Oswald', sans-serif; font-size: 1.15rem; color: var(--color-titulos, #fff); margin: 0; letter-spacing: 0.8px; }
.form-subtitle { font-size: 0.78rem; color: var(--color-texto-secundario, #888); margin: 0; }
.close-x {
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-texto-secundario, #aaa); cursor: pointer; width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;
}
.close-x:hover { background: rgba(255, 255, 255, 0.1); color: var(--color-titulos, #fff); }
/* TABS */
.tabs { display: flex; gap: 4px; padding: 4px; margin-bottom: 16px; border-radius: 11px; background: var(--bg-input, #09090b); border: 1px solid var(--border-input, rgba(255, 255, 255, 0.05)); }
.tab {
  flex: 1; min-height: 34px; padding: 0 8px; border: none; border-radius: 8px; background: transparent;
  color: var(--color-texto-secundario, #888); font-family: 'Inter', sans-serif; font-size: 0.74rem; font-weight: 600;
  cursor: pointer; transition: background 0.18s ease, color 0.18s ease;
}
.tab:hover { color: var(--color-titulos, #fff); }
.tab.active { background: color-mix(in srgb, var(--color-highlight, #3b82f6) 18%, transparent); color: var(--color-highlight, #60a5fa); }
.section { display: flex; flex-direction: column; gap: 14px; }
.empty { margin: 30px 0; text-align: center; color: var(--color-texto-secundario, #888); font-size: 0.82rem; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; background: var(--c); }
.c-red { --c: #f87171; } .c-blue { --c: #60a5fa; } .c-green { --c: #34d399; }
.c-purple { --c: #c084fc; } .c-orange { --c: #fb923c; } .c-pink { --c: #f472b6; } .c-default { --c: #cbd5e1; }
/* MEMBRESÍA */
.rows { display: flex; flex-direction: column; gap: 14px; }
.row { display: flex; flex-direction: column; gap: 6px; }
.row-head { display: flex; justify-content: space-between; align-items: center; }
.row-name { display: inline-flex; align-items: center; font-size: 0.82rem; font-weight: 600; color: var(--color-titulos, #fff); }
.row-value { font-family: 'Oswald', sans-serif; font-size: 0.95rem; color: var(--color-titulos, #fff); }
.track { height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.05); overflow: hidden; }
.fill { height: 100%; border-radius: 999px; background: var(--c); transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.row-foot { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-texto-secundario, #888); }
.insight { display: flex; flex-direction: column; gap: 3px; padding: 13px 15px; border-radius: 12px; background: var(--bg-input, #09090b); border: 1px solid var(--border-input, rgba(255, 255, 255, 0.05)); }
.insight-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario, #888); }
.insight-value { font-family: 'Oswald', sans-serif; font-size: 1.1rem; color: #34d399; }
/* PAGO */
.split-bar { display: flex; height: 12px; border-radius: 999px; overflow: hidden; background: rgba(255, 255, 255, 0.05); }
.split-seg { background: var(--c); transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pay-card { display: flex; flex-direction: column; gap: 5px; padding: 15px; border-radius: 12px; background: var(--bg-input, #09090b); border: 1px solid var(--border-input, rgba(255, 255, 255, 0.05)); border-top: 2px solid var(--c); }
.pay-label { display: inline-flex; align-items: center; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-texto-secundario, #888); }
.pay-value { font-family: 'Oswald', sans-serif; font-size: 1.2rem; color: var(--color-titulos, #fff); }
.pay-sub { font-size: 0.72rem; color: var(--color-texto-secundario, #888); }
/* TENDENCIA */
.chart-container {
  display: flex; justify-content: space-between; align-items: flex-end; height: 170px; gap: 6px;
  background: var(--bg-input, #09090b); padding: 18px 12px 10px; border-radius: var(--app-border-radius, 12px);
  border: 1px solid var(--border-input, rgba(255, 255, 255, 0.04));
}
.bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; }
.bar-track { width: 100%; height: 100%; background: rgba(255, 255, 255, 0.02); border-radius: 6px; position: relative; display: flex; align-items: flex-end; }
.bar-fill { width: 100%; background: var(--color-highlight, #3b82f6); opacity: 0.75; border-radius: 6px; transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s; }
.bar-fill.best { background: #34d399; opacity: 1; }
.bar-track:hover .bar-fill { opacity: 1; }
.tooltip-badge {
  position: absolute; top: -24px; left: 50%; transform: translateX(-50%) translateY(4px);
  background: #1e1e24; color: var(--color-texto-general, #fff); font-size: 0.65rem; font-family: 'Oswald', sans-serif;
  padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0; visibility: hidden; transition: all 0.2s ease; white-space: nowrap; pointer-events: none; z-index: 10;
}
.bar-track:hover .tooltip-badge { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
.month-label { font-size: 9px; color: var(--color-texto-secundario, #888); margin-top: 8px; font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.kpi { display: flex; flex-direction: column; gap: 4px; padding: 13px 15px; border-radius: 12px; background: var(--bg-input, #09090b); border: 1px solid var(--border-input, rgba(255, 255, 255, 0.05)); }
.kpi-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-texto-secundario, #888); }
.kpi-value { font-family: 'Oswald', sans-serif; font-size: 1.1rem; }
.up { color: #34d399; }
.down { color: #f87171; }
.note { margin: 0; font-size: 0.68rem; color: var(--color-texto-secundario, #888); opacity: 0.8; }
@media (max-width: 480px) {
  .form-panel { padding: 18px; }
  .pay-grid, .kpi-grid { grid-template-columns: 1fr; }
  .chart-container { height: 150px; gap: 4px; padding: 14px 6px 8px; }
  .month-label { font-size: 8px; }
  .tab { font-size: 0.7rem; }
}
@media (prefers-reduced-motion: reduce) {
  .fill, .split-seg, .bar-fill, .tab, .tooltip-badge { transition: none !important; }
}
/* Mostrar solo columnas de meses con datos reales, sin extender barras a todo el ancho. */
.chart-container{justify-content:flex-start;overflow-x:auto;overflow-y:hidden}
.chart-bars{display:flex;justify-content:center;align-items:flex-end;gap:8px;min-width:100%;width:max-content;height:100%}
.bar-col{flex:0 0 54px;min-width:46px}
.bar-track{height:calc(100% - 26px);min-height:0}
.bar-fill{min-height:2px}
.tooltip-badge{top:4px;max-width:120px;overflow:hidden;text-overflow:ellipsis}
.bar-fill:focus-visible{outline:2px solid var(--color-highlight,#3b82f6)}
.kpi-value.neutral{color:var(--color-texto-secundario,#aaa);font-size:.9rem}
@media(max-width:480px){.chart-bars{gap:6px}.bar-col{flex-basis:48px;min-width:43px}.chart-container{overflow-x:auto}}

</style>
