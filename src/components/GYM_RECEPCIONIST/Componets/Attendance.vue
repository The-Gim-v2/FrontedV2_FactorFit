<template>
  <div class="form-panel">
    <!-- HEADER -->
    <header class="panel-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-5 4 3 5-7" />
          </svg>
        </div>
        <div class="title-group">
          <div class="title-row">
            <h2 class="form-title">
              {{ t('attendanceTitle') }}
              <span class="highlight">{{ t('attendanceHighlight') }}</span>
            </h2>
            <span class="report-badge"><span class="report-dot"></span>{{ t('liveReport') }}</span>
          </div>
          <p class="form-subtitle">{{ t('attendanceSubtitle') }}</p>
        </div>
      </div>
      <button type="button" class="close-x" @click="$emit('close')" :aria-label="t('close')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </header>
    <!-- BODY -->
    <div class="form-body">
      <p v-if="cargando" class="attendance-api-message" role="status">Cargando asistencias reales...</p>
      <p v-if="errorApi" class="attendance-api-message attendance-api-error" role="alert">{{ errorApi }} <button type="button" @click="cargarAsistencias">Reintentar</button></p>
      <p v-if="!cargando && !errorApi && totalMesActual === 0 && totalMesAnterior === 0" class="attendance-api-message">No se registraron asistencias en estos dos meses para esta sede.</p>
      <!-- KPIs -->
      <section class="metrics-grid">
        <!-- MES ACTUAL -->
        <article class="metric-card metric-primary">
          <div class="metric-top">
            <div class="metric-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span class="metric-label">{{ t('currMonth') }}</span>
            <span class="trend-badge" :class="porcentajeCrecimiento >= 0 ? 'positive' : 'negative'">
              <svg v-if="porcentajeCrecimiento >= 0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
              <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
              {{ Math.abs(porcentajeCrecimiento) }}%
            </span>
          </div>
          <div class="metric-value">{{ totalMesActual }}</div>
          <div class="metric-footer"><span>{{ t('registeredAttendances') }}</span></div>
        </article>
        <!-- PROMEDIO -->
        <article class="metric-card">
          <div class="metric-top">
            <div class="metric-icon secondary-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <span class="metric-label">{{ t('dailyAverage') }}</span>
          </div>
          <div class="metric-value">{{ promedioActual }}</div>
          <div class="metric-footer"><span>{{ t('attendanceSuffix') }} / {{ t('dayShort') }}</span></div>
        </article>
        <!-- MES ANTERIOR -->
        <article class="metric-card">
          <div class="metric-top">
            <div class="metric-icon secondary-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span class="metric-label">{{ t('prevMonth') }}</span>
          </div>
          <div class="metric-value">{{ totalMesAnterior }}</div>
          <div class="metric-footer"><span>{{ t('registeredAttendances') }}</span></div>
        </article>
      </section>
      <!-- COMPARACIÓN -->
      <section class="analytics-section">
        <div class="section-header">
          <div>
            <h3>{{ t('comparisonTitle') }}</h3>
            <p>{{ t('comparisonDescription') }}</p>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-color previous"></span>{{ t('prevMonth') }}</div>
            <div class="legend-item"><span class="legend-color current"></span>{{ t('currMonth') }}</div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-wrap">
            <!-- Eje Y -->
            <div class="y-axis" aria-hidden="true">
              <span v-for="tick in ticks" :key="'y-' + tick">{{ tick }}</span>
            </div>
            <!-- Área de la gráfica -->
            <div class="plot">
              <div class="chart-grid" aria-hidden="true">
                <span v-for="tick in ticks" :key="'g-' + tick"></span>
              </div>
              <div class="comparison-chart">
                <div
                  v-for="(day, index) in mesActual"
                  :key="'compare-' + index"
                  class="chart-day"
                  :class="{
                    'edge-left': index < 4,
                    'edge-right': index >= mesActual.length - 4
                  }"
                  tabindex="0"
                >
                  <div class="bar-pair">
                    <div class="chart-bar previous-bar" :style="{ height: barHeight(mesAnterior[index]?.value ?? 0) }"></div>
                    <div class="chart-bar current-bar" :style="{ height: barHeight(day.value) }"></div>
                  </div>
                  <span class="day-number">{{ showDayLabel(index) ? index + 1 : '' }}</span>
                  <!-- Tooltip por día (muestra ambos meses) -->
                  <div class="bar-tooltip">
                    <strong>{{ t('dayLabel') }} {{ index + 1 }}</strong>
                    <div class="tip-row">
                      <span class="tip-dot current"></span>
                      <span>{{ t('currMonth') }}</span>
                      <b>{{ day.value }}</b>
                    </div>
                    <div class="tip-row">
                      <span class="tip-dot previous"></span>
                      <span>{{ t('prevMonth') }}</span>
                      <b>{{ mesAnterior[index]?.value }}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-axis-title">{{ t('daysOfMonth') }}</div>
        </div>
      </section>
      <!-- RESUMEN INFERIOR -->
      <section class="comparison-summary">
        <div class="summary-main">
          <div class="summary-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18" />
              <path d="m7 16 4-5 4 3 5-7" />
            </svg>
          </div>
          <div class="summary-copy">
            <span>{{ t('monthlyPerformance') }}</span>
            <strong>{{ porcentajeCrecimiento >= 0 ? t('attendanceIncrease') : t('attendanceDecrease') }}</strong>
          </div>
        </div>
        <div class="summary-stats">
          <div class="summary-stat">
            <span>{{ t('difference') }}</span>
            <strong :class="diferenciaAsistencias >= 0 ? 'text-success' : 'text-danger'">
              {{ diferenciaAsistencias >= 0 ? '+' : '' }}{{ diferenciaAsistencias }}
            </strong>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-stat">
            <span>{{ t('growth') }}</span>
            <strong :class="porcentajeCrecimiento >= 0 ? 'text-success' : 'text-danger'">
              {{ porcentajeCrecimiento >= 0 ? '+' : '' }}{{ porcentajeCrecimiento }}%
            </strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
defineEmits<{ (e: 'close'): void }>();
/* ---------- CONFIGURACIÓN ---------- */
const route = useRoute();
const settings = reactive({
  idioma: localStorage.getItem('GYM_RECEPCIONIST-idioma') || 'es'
});
/* ---------- TRADUCCIONES ---------- */
const translations: Record<string, Record<string, string>> = {
  es: {
    attendanceTitle: 'BITÁCORA DE',
    attendanceHighlight: 'ASISTENCIA',
    attendanceSubtitle: 'Análisis y comparativa del comportamiento mensual de asistencias.',
    close: 'Cerrar modal',
    liveReport: 'Resumen mensual',
    prevMonth: 'Mes anterior',
    currMonth: 'Mes actual',
    dayLabel: 'Día',
    dayShort: 'día',
    daysOfMonth: 'Días del mes',
    dailyAverage: 'Promedio diario',
    attendanceSuffix: 'asistencias',
    registeredAttendances: 'asistencias registradas',
    growth: 'Crecimiento',
    difference: 'Diferencia',
    comparisonTitle: 'Comparativa diaria',
    comparisonDescription: 'Asistencias registradas por día entre el mes actual y el anterior.',
    monthlyPerformance: 'Rendimiento mensual',
    attendanceIncrease: 'La asistencia aumentó respecto al mes anterior',
    attendanceDecrease: 'La asistencia disminuyó respecto al mes anterior'
  },
  en: {
    attendanceTitle: 'ATTENDANCE',
    attendanceHighlight: 'LOG',
    attendanceSubtitle: 'Analysis and comparison of monthly attendance behavior.',
    close: 'Close modal',
    liveReport: 'Monthly summary',
    prevMonth: 'Previous month',
    currMonth: 'Current month',
    dayLabel: 'Day',
    dayShort: 'day',
    daysOfMonth: 'Days of the month',
    dailyAverage: 'Daily average',
    attendanceSuffix: 'attendances',
    registeredAttendances: 'registered attendances',
    growth: 'Growth',
    difference: 'Difference',
    comparisonTitle: 'Daily comparison',
    comparisonDescription: 'Daily attendance comparison between the current and previous month.',
    monthlyPerformance: 'Monthly performance',
    attendanceIncrease: 'Attendance increased compared to the previous month',
    attendanceDecrease: 'Attendance decreased compared to the previous month'
  }
};
  const t = (key: string): string =>
  translations[settings.idioma]?.[key] ?? translations['es']?.[key] ?? key;
/* ---------- ASISTENCIA REAL DE POSTGRESQL ---------- */
type DiaAsistencia={value:number};
type ResumenMensual={sede_id:number;mes_actual:string;mes_anterior:string;dias_actual:number;dias_anterior:number;asistencias_actual:number[];asistencias_anterior:number[]};
const mesAnterior=ref<DiaAsistencia[]>([]);
const mesActual=ref<DiaAsistencia[]>([]);
const cargando=ref(false);
const errorApi=ref('');
const sedeEvento=ref(0);
const API=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');
const tokenActual=():string=>{for(const store of [sessionStorage,localStorage]){for(const key of ['token','auth_token','access_token','gym_token','GYM_RECEPCIONIST_token','gymAccountToken']){const value=store.getItem(key);if(value)return value.replace(/^Bearer\s+/i,'');}for(const key of ['auth','user','session','gymAccount','GYM_RECEPCIONIST'])try{const obj=JSON.parse(store.getItem(key)||'null');const value=obj?.token||obj?.access_token||obj?.accessToken;if(value)return String(value).replace(/^Bearer\s+/i,'');}catch{}}return '';};
const sedeGuardada=():number=>{for(const store of [sessionStorage,localStorage])for(const key of ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id']){const raw=store.getItem(key);if(!raw)continue;try{const obj=JSON.parse(raw);const n=Number(obj&&typeof obj==='object'?(obj.ID_Sede??obj.sede_id??obj.id??obj.value):obj);if(Number.isInteger(n)&&n>0)return n;}catch{const n=Number(raw);if(Number.isInteger(n)&&n>0)return n;}}return 1;};
const sedeId=():number=>{if(sedeEvento.value>0)return sedeEvento.value;const q=Number(route.query.sede_id);return Number.isInteger(q)&&q>0?q:sedeGuardada();};
let consultaId=0;
const cargarAsistencias=async():Promise<void>=>{const seq=++consultaId;const token=tokenActual();cargando.value=true;errorApi.value='';if(!token){errorApi.value='No hay una sesión activa.';mesActual.value=[];mesAnterior.value=[];cargando.value=false;return;}try{const response=await fetch(`${API}/api/gym/asistencias-mensuales?sede_id=${sedeId()}`,{headers:{Accept:'application/json',Authorization:`Bearer ${token}`},cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok){const detail=data?.errors?Object.values(data.errors).flat().join(' '):'';throw new Error(detail||((data?.message&&data.message!=='Server Error')?data.message:`Error HTTP ${response.status}. Revisa los logs de Railway.`));}if(!Array.isArray(data.asistencias_actual)||!Array.isArray(data.asistencias_anterior))throw new Error('La respuesta mensual no tiene el formato esperado.');if(seq!==consultaId)return;const totalDias=Math.max(data.asistencias_actual.length,data.asistencias_anterior.length);mesActual.value=Array.from({length:totalDias},(_,i)=>({value:Number(data.asistencias_actual[i]||0)}));mesAnterior.value=Array.from({length:totalDias},(_,i)=>({value:Number(data.asistencias_anterior[i]||0)}));diasTranscurridos.value=Number(data.dias_transcurridos)||1;}catch(e){if(seq===consultaId){mesActual.value=[];mesAnterior.value=[];errorApi.value=e instanceof Error?e.message:'No se pudo consultar la asistencia.';}}finally{if(seq===consultaId)cargando.value=false;}};
const diasTranscurridos=ref(1);
const cambioSede=(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};const n=Number(detail.sede_id??detail.sedeId??detail.selectedSedeId??detail.ID_Sede??detail.id??0);sedeEvento.value=Number.isInteger(n)&&n>0?n:0;void cargarAsistencias();};
watch(()=>route.query.sede_id,()=>{sedeEvento.value=0;void cargarAsistencias();});
/* ---------- ESTADÍSTICAS ---------- */
const totalMesAnterior = computed(() => mesAnterior.value.reduce((acc, d) => acc + d.value, 0));
const totalMesActual = computed(() => mesActual.value.reduce((acc, d) => acc + d.value, 0));
const promedioActual = computed(() => {
  if (mesActual.value.length === 0) return 0;
  return Math.round(totalMesActual.value / Math.max(1,diasTranscurridos.value));
});
const diferenciaAsistencias = computed(() => totalMesActual.value - totalMesAnterior.value);
const porcentajeCrecimiento = computed(() => {
  const prev = totalMesAnterior.value;
  const curr = totalMesActual.value;
  if (prev === 0) return 0;
  return Math.round(((curr - prev) / prev) * 100);
});
/* ---------- ESCALA DE LA GRÁFICA ----------
   El máximo se redondea a múltiplos de 20 para que el eje Y quede limpio
   y las barras usen todo el alto disponible. */
const escalaMax = computed(() => {
  const max = Math.max(
    1,
    ...mesActual.value.map(d => d.value),
    ...mesAnterior.value.map(d => d.value)
  );
  return Math.ceil(max / 20) * 20;
});
const ticks = computed(() =>
  [4, 3, 2, 1, 0].map(step => Math.round((escalaMax.value / 4) * step))
);
const barHeight = (value: number): string =>
  `${value > 0 ? Math.max((value / escalaMax.value) * 100, 1.5) : 0}%`;
const showDayLabel = (index: number): boolean =>
  index === 0 || (index + 1) % 5 === 0 || index === mesActual.value.length - 1;
/* ---------- CAMBIO DE IDIOMA ---------- */
const handleLanguageChange = (event: Event) => {
  const detail = (event as CustomEvent<{ idioma?: string }>).detail;
  if (detail?.idioma) settings.idioma = detail.idioma;
};
onMounted(() => {window.addEventListener('idioma-changed',handleLanguageChange);window.addEventListener('factorfit:branch-changed',cambioSede);void cargarAsistencias();});
onUnmounted(() => {window.removeEventListener('idioma-changed',handleLanguageChange);window.removeEventListener('factorfit:branch-changed',cambioSede);consultaId++;});
</script>
<style scoped>
.attendance-api-message { margin:0 0 14px;padding:10px 14px;border:1px solid var(--line);border-radius:9px;font-size:12px;color:var(--text) }.attendance-api-error { color:#f87171;border-color:#f8717155 }.attendance-api-message button { margin-left:12px;color:inherit;text-decoration:underline;cursor:pointer;background:transparent;border:0 }@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
.form-panel { --accent: var(--color-highlight, #3b82f6); --panel: var(--bg-cards, #121416); --input: var(--bg-input, #0c0e10); --text: var(--color-texto-general, #e5e7eb); --title: var(--color-titulos, #ffffff); --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 62%, transparent); --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 15%, transparent); --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent); width: min(94vw, 860px); max-height: min(92vh, 820px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--line); border-radius: var(--app-border-radius, 16px); background: var(--panel); color: var(--text); font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; box-shadow: 0 28px 70px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.015); }.form-panel *, .form-panel *::before, .form-panel *::after { box-sizing: border-box; }.panel-header { position: relative; flex-shrink: 0; min-height: 88px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 22px; border-bottom: 1px solid var(--line-soft); background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent); }.panel-header::after { content: ''; position: absolute; bottom: -1px; left: 22px; width: 64px; height: 2px; border-radius: 999px; background: var(--accent); }.header-left { min-width: 0; display: flex; align-items: center; gap: 13px; }.header-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent); border-radius: 12px; background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent); }.title-group { min-width: 0; display: flex; flex-direction: column; gap: 4px; }.title-row { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }.form-title { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.15rem; font-weight: 600; letter-spacing: 0.035em; }.highlight { color: var(--accent); }.form-subtitle { max-width: 520px; margin: 0; color: var(--muted); font-size: 0.76rem; font-weight: 500; line-height: 1.45; }.report-badge { min-height: 22px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--accent) 7%, transparent); color: var(--accent); font-size: 0.62rem; font-weight: 650; }.report-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }.close-x { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--muted); cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease; }.close-x:hover { border-color: rgba(248, 113, 113, 0.3); background: rgba(248, 113, 113, 0.07); color: #f87171; }.close-x:active { transform: scale(0.94); }.form-body { flex: 1; min-height: 0; overflow-y: auto; padding: 20px 22px 22px; scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--text) 16%, transparent) transparent; }.form-body::-webkit-scrollbar { width: 5px; }.form-body::-webkit-scrollbar-track { background: transparent; }.form-body::-webkit-scrollbar-thumb { border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); }.metrics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }.metric-card { position: relative; min-width: 0; overflow: hidden; padding: 15px 16px; border: 1px solid var(--line); border-radius: 13px; background: color-mix(in srgb, var(--panel) 94%, var(--text)); }.metric-primary { border-color: color-mix(in srgb, var(--accent) 28%, var(--line)); background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 9%, var(--panel)), var(--panel)); }.metric-primary::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), transparent); }.metric-top { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }.metric-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 9px; background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent); }.secondary-icon { border-color: var(--line); background: color-mix(in srgb, var(--text) 4%, transparent); color: var(--muted); }.metric-label { min-width: 0; flex: 1; overflow: hidden; color: var(--muted); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.02em; text-overflow: ellipsis; white-space: nowrap; }.metric-value { margin-bottom: 8px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.9rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }.metric-footer { color: var(--muted); font-size: 0.62rem; line-height: 1.4; }.trend-badge { flex-shrink: 0; display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 999px; font-size: 0.6rem; font-weight: 700; }.trend-badge.positive { border: 1px solid rgba(52, 211, 153, 0.22); background: rgba(52, 211, 153, 0.09); color: #34d399; }.trend-badge.negative { border: 1px solid rgba(248, 113, 113, 0.22); background: rgba(248, 113, 113, 0.09); color: #f87171; }.analytics-section { overflow: hidden; border: 1px solid var(--line); border-radius: 14px; background: var(--panel); }.section-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 15px 18px; border-bottom: 1px solid var(--line-soft); }.section-header h3 { margin: 0 0 3px; color: var(--title); font-size: 0.8rem; font-weight: 650; }.section-header p { margin: 0; color: var(--muted); font-size: 0.66rem; line-height: 1.4; }.chart-legend { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }.legend-item { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.64rem; font-weight: 500; white-space: nowrap; }.legend-color { width: 9px; height: 9px; border-radius: 3px; }.legend-color.previous { background: color-mix(in srgb, var(--text) 30%, transparent); }.legend-color.current { background: var(--accent); }.chart-card { padding: 20px 18px 12px; background: color-mix(in srgb, var(--input) 62%, var(--panel)); }.chart-wrap { display: flex; gap: 10px; }.y-axis { width: 26px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 22px; color: var(--muted); font-size: 0.58rem; font-variant-numeric: tabular-nums; text-align: right; }.y-axis span { height: 0; display: flex; align-items: center; justify-content: flex-end; }.plot { position: relative; min-width: 0; flex: 1; height: 232px; }.chart-grid { position: absolute; z-index: 0; inset: 0 0 22px 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }.chart-grid span { width: 100%; height: 1px; background: color-mix(in srgb, var(--text) 8%, transparent); }.chart-grid span:last-child { background: color-mix(in srgb, var(--text) 16%, transparent); }.comparison-chart { position: relative; z-index: 1; height: 100%; display: flex; align-items: stretch; gap: 2px; }.chart-day { position: relative; min-width: 0; flex: 1; display: flex; flex-direction: column; border-radius: 6px; outline: none; cursor: pointer; transition: background 0.16s ease; }.chart-day:hover, .chart-day:focus-visible { background: color-mix(in srgb, var(--accent) 7%, transparent); }.bar-pair { min-height: 0; flex: 1; display: flex; align-items: flex-end; justify-content: center; gap: 2px; }.chart-bar { width: 40%; min-width: 2px; max-width: 9px; border-radius: 3px 3px 0 0; transition: height 0.3s ease, filter 0.16s ease; }.previous-bar { background: color-mix(in srgb, var(--text) 26%, transparent); }.current-bar { background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #ffffff), var(--accent)); box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 14%, transparent); }.chart-day:hover .chart-bar, .chart-day:focus-visible .chart-bar { filter: brightness(1.18); }.day-number { height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--muted); font-size: 0.58rem; font-variant-numeric: tabular-nums; white-space: nowrap; }.bar-tooltip { position: absolute; z-index: 20; top: 6px; left: 50%; width: max-content; min-width: 136px; display: flex; flex-direction: column; gap: 5px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 9px; background: #17191c; color: #ffffff; font-family: 'Inter', sans-serif; pointer-events: none; opacity: 0; visibility: hidden; transform: translateX(-50%) translateY(4px); transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4); }.bar-tooltip strong { margin-bottom: 1px; font-size: 0.64rem; font-weight: 650; }.tip-row { display: flex; align-items: center; gap: 6px; color: #aeb5bf; font-size: 0.6rem; }.tip-row b { margin-left: auto; padding-left: 10px; color: #ffffff; font-size: 0.66rem; font-weight: 650; font-variant-numeric: tabular-nums; }.tip-dot { width: 7px; height: 7px; flex-shrink: 0; border-radius: 2px; }.tip-dot.current { background: var(--accent); }.tip-dot.previous { background: color-mix(in srgb, #ffffff 40%, transparent); }.chart-day.edge-left .bar-tooltip { left: 0; transform: translateX(0) translateY(4px); }.chart-day.edge-right .bar-tooltip { right: 0; left: auto; transform: translateX(0) translateY(4px); }.chart-day:hover .bar-tooltip, .chart-day:focus-visible .bar-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }.chart-day.edge-left:hover .bar-tooltip, .chart-day.edge-left:focus-visible .bar-tooltip,
.chart-day.edge-right:hover .bar-tooltip, .chart-day.edge-right:focus-visible .bar-tooltip { transform: translateX(0) translateY(0); }.chart-axis-title { margin-top: 4px; color: color-mix(in srgb, var(--text) 45%, transparent); font-size: 0.58rem; text-align: center; }.comparison-summary { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 14px; padding: 14px 16px; border: 1px solid var(--line); border-radius: 12px; background: color-mix(in srgb, var(--text) 2%, transparent); }.summary-main { min-width: 0; display: flex; align-items: center; gap: 11px; }.summary-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 7%, transparent); color: var(--accent); }.summary-copy { min-width: 0; display: flex; flex-direction: column; gap: 2px; }.summary-copy span, .summary-stat span { color: var(--muted); font-size: 0.62rem; }.summary-copy strong { overflow: hidden; color: var(--title); font-size: 0.72rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }.summary-stats { display: flex; align-items: center; gap: 18px; flex-shrink: 0; }.summary-stat { display: flex; flex-direction: column; gap: 2px; text-align: right; }.summary-stat strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1rem; font-weight: 600; font-variant-numeric: tabular-nums; }.summary-divider { width: 1px; height: 30px; background: var(--line); }.text-success { color: #34d399 !important; }.text-danger { color: #f87171 !important; }.close-x:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (max-width: 700px) {.form-panel { width: min(95vw, 600px); }.panel-header { padding: 17px; }.panel-header::after { left: 17px; }.form-body { padding: 17px; }.metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.metric-primary { grid-column: 1 / -1; }.plot { height: 210px; }.section-header { align-items: flex-start; flex-direction: column; gap: 10px; }
}
@media (max-width: 500px) {.form-panel { width: calc(100vw - 16px); max-height: calc(100dvh - 16px); border-radius: 13px; }.panel-header { min-height: 76px; padding: 14px; }.panel-header::after { left: 14px; }.header-icon { width: 38px; height: 38px; }.form-title { font-size: 1rem; }.form-subtitle { font-size: 0.68rem; }.report-badge { display: none; }.form-body { padding: 13px; }.metrics-grid { gap: 8px; }.metric-card { padding: 13px; }.metric-value { font-size: 1.6rem; }.section-header { padding: 13px; }.chart-card { padding: 16px 10px 10px; }.chart-wrap { gap: 6px; }.y-axis { width: 22px; font-size: 0.54rem; }.plot { height: 180px; }.comparison-chart { gap: 1px; }.chart-bar { max-width: 5px; }.day-number { font-size: 0.54rem; }.bar-tooltip { min-width: 124px; }.comparison-summary { align-items: flex-start; flex-direction: column; gap: 13px; }.summary-copy strong { white-space: normal; }.summary-stats { width: 100%; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--line-soft); }.summary-stat { flex: 1; text-align: left; }.summary-stat:last-child { text-align: right; }
}
@media (max-width: 360px) {.form-panel { width: calc(100vw - 8px); max-height: calc(100dvh - 8px); }.header-icon { display: none; }.form-body { padding: 11px; }.metrics-grid { grid-template-columns: 1fr; }.metric-primary { grid-column: auto; }.plot { height: 160px; }
}
@media (prefers-reduced-motion: reduce) {.close-x, .chart-bar, .bar-tooltip, .chart-day { transition: none !important; }
}
</style>