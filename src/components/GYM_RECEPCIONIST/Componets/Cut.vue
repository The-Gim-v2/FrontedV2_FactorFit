<template>
  <div class="form-panel">
    <NotificationSystem ref="toastRef" />
    <header class="panel-header">
      <div class="header-left">
        <div class="header-icon"><i class="bi bi-calendar3"></i></div>
        <div class="title-group">
          <span class="section-kicker">{{ t('billingConfig') }}</span>
          <h2 class="form-title">{{ t('viewTitle') }} <span class="highlight">{{ t('viewHighlight') }}</span></h2>
          <p class="form-subtitle">{{ t('viewSubtitle') }}</p>
        </div>
      </div>
      <button type="button" class="close-x" @click="$emit('close')" :aria-label="t('close')"><i class="bi bi-x-lg"></i></button>
    </header>
    <div class="form-body">
      <div class="readonly-banner"><i class="bi bi-lock"></i><span>{{ t('readOnlyNotice') }}</span></div>
      <section class="card saved-section">
        <div class="section-heading">
          <div class="section-icon"><i class="bi bi-list-ul"></i></div>
          <div class="heading-grow">
            <h3>{{ t('activeConfigs') }}</h3>
            <p>{{ cortes.length }} {{ cortes.length === 1 ? t('configuredRule') : t('configuredRules') }}</p>
          </div>
          <span v-if="cortes.length" class="count-badge">{{ cortes.length }}</span>
        </div>
        <p v-if="cargando" class="data-message">{{ t('loading') }}</p>
        <p v-else-if="errorCarga" class="data-message" role="alert">{{ errorCarga }} <button type="button" class="retry-btn" @click="cargarCortes">{{ t('retry') }}</button></p>
        <div v-else-if="!cortes.length" class="empty-state">
          <div class="empty-icon"><i class="bi bi-calendar3"></i></div>
          <div><strong>{{ t('noConfigs') }}</strong><p>{{ t('noConfigsDesc') }}</p></div>
        </div>
        <div v-else class="saved-list">
          <article v-for="item in cortes" :key="item.id" class="saved-item">
            <div class="saved-item-accent" :class="item.tipo === 'Mensual' ? 'monthly-accent' : 'biweekly-accent'"></div>
            <div class="saved-main">
              <div class="saved-top">
                <strong class="saved-range">{{ t('dayLabel') }} {{ item.inicio }} <i class="bi bi-arrow-right"></i> {{ t('dayLabel') }} {{ item.termino }}</strong>
                <span class="type-badge" :class="item.tipo === 'Mensual' ? 'badge-mes' : 'badge-quin'">{{ item.tipo === 'Mensual' ? t('monthly') : t('biweekly') }}</span>
              </div>
              <div class="saved-bottom">
                <span class="meta cutoff-info"><i class="bi bi-scissors"></i>{{ t('cutoffLabel') }} <strong>{{ item.cortes.length ? item.cortes.join(', ') : '—' }}</strong></span>
                <span class="meta"><i class="bi bi-calendar-range"></i>{{ diasEnRango(item) }} {{ t('daysUnit') }}</span>
                <span v-if="cruzaMes(item)" class="meta wrap-meta"><i class="bi bi-arrow-repeat"></i>{{ t('crossesMonth') }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
      <section class="card calendar-section">
        <div class="calendar-header-info">
          <div class="section-heading no-margin">
            <div class="section-icon"><i class="bi bi-calendar3"></i></div>
            <div><h3>{{ t('previewMonth') }}</h3><p>{{ t('calendarDesc') }}</p></div>
          </div>
          <div class="calendar-legend">
            <span class="legend-item"><span class="dot dot-corte"></span>{{ t('cutoff') }}</span>
            <span class="legend-item"><span class="dot dot-mes"></span>{{ t('monthly') }}</span>
            <span class="legend-item"><span class="dot dot-quin"></span>{{ t('biweekly') }}</span>
          </div>
        </div>
        <div class="calendar-grid">
          <div v-for="n in 31" :key="n" :class="['cal-day', getDayClass(n)]" :title="`${t('dayLabel')} ${n}`">
            <span>{{ n }}</span><i v-if="getDayClass(n) === 'is-corte'" class="bi bi-scissors cut-icon"></i>
          </div>
        </div>
        <div v-if="!cortes.length && !cargando" class="calendar-hint"><i class="bi bi-info-circle"></i>{{ t('calendarHint') }}</div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
defineEmits<{ (e: 'close'): void }>();
interface CorteItem { id: number; inicio: number; termino: number; cortes: number[]; tipo: string; }
const currentLang = ref(localStorage.getItem('GYM_RECEPCIONIST-idioma') || 'es');
const translations = {
  es: { billingConfig: 'Configuración de cobros', viewTitle: 'CONSULTAR', viewHighlight: 'CORTES', viewSubtitle: 'Consulta las reglas y fechas de corte registradas en tu sede.', close: 'Cerrar', readOnlyNotice: 'Vista de solo lectura. Los cortes únicamente pueden ser administrados por personal autorizado.', activeConfigs: 'Configuraciones activas', configuredRule: 'regla configurada', configuredRules: 'reglas configuradas', noConfigs: 'Sin configuraciones', noConfigsDesc: 'Todavía no hay cortes registrados en esta sede.', previewMonth: 'Vista previa del mes', calendarDesc: 'Distribución visual de los periodos configurados.', calendarHint: 'No hay cortes que mostrar en el calendario.', cutoff: 'Corte', monthly: 'Mensual', biweekly: 'Quincenal', cutoffLabel: 'Día de corte', dayLabel: 'Día', daysUnit: 'días', crossesMonth: 'Cruza de mes', loading: 'Cargando cortes...', retry: 'Reintentar', selectBranch: 'Selecciona una sucursal.', loadError: 'No se pudieron consultar los cortes.' },
  en: { billingConfig: 'Billing configuration', viewTitle: 'VIEW', viewHighlight: 'CUTOFFS', viewSubtitle: 'View the billing rules and dates saved for your branch.', close: 'Close', readOnlyNotice: 'Read-only view. Cutoffs can only be managed by authorized staff.', activeConfigs: 'Active configurations', configuredRule: 'configured rule', configuredRules: 'configured rules', noConfigs: 'No configurations', noConfigsDesc: 'No cutoffs have been configured for this branch.', previewMonth: 'Month preview', calendarDesc: 'Visual distribution of configured periods.', calendarHint: 'No cutoffs to display.', cutoff: 'Cutoff', monthly: 'Monthly', biweekly: 'Biweekly', cutoffLabel: 'Cutoff day', dayLabel: 'Day', daysUnit: 'days', crossesMonth: 'Crosses months', loading: 'Loading cutoffs...', retry: 'Retry', selectBranch: 'Select a branch.', loadError: 'Could not load cutoffs.' }
};
type TranslationKey = keyof typeof translations.es;
const t = (key: TranslationKey): string => translations[currentLang.value === 'en' ? 'en' : 'es'][key];
const cortes = ref<CorteItem[]>([]);
const cargando = ref(false);
const errorCarga = ref('');
const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const base = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/i, '');
const api = `${base}/api/gym/cortes`;
const token = (): string => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['auth_token', 'token', 'access_token', 'gym_token', 'GYM_RECEPCIONIST_token']) {
      const value = store.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
  }
  return '';
};
const obtenerSede = (): number => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['selected_sede_id', 'sede_id', 'ID_Sede']) {
      const value = store.getItem(key);
      if (value && Number(value) > 0) return Number(value);
    }
  }
  return 0;
};
const cargarCortes = async (): Promise<void> => {
  const sede = obtenerSede();
  if (!sede) { cortes.value = []; errorCarga.value = t('selectBranch'); return; }
  const bearer = token();
  if (!bearer) { cortes.value = []; errorCarga.value = 'Tu sesión ha caducado. Inicia sesión nuevamente.'; return; }
  cargando.value = true;
  errorCarga.value = '';
  try {
    const response = await fetch(`${api}?sede_id=${encodeURIComponent(sede)}`, { method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${bearer}` }, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data.message === 'string' ? data.message : t('loadError'));
    const rows: Record<string, unknown>[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    cortes.value = rows.map((x, index) => {
      const parsed = Array.isArray(x.Dias_Corte) ? x.Dias_Corte : typeof x.Dias_Corte === 'string' ? (() => { try { return JSON.parse(x.Dias_Corte); } catch { return []; } })() : [];
      const dias = Array.isArray(parsed) ? parsed.map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 31) : [];
      const corte = Number(x.Corte);
      return { id: Number(x.ID_Corte_Regla) || index + 1, inicio: Number(x.Inicio), termino: Number(x.Termino), cortes: dias.length ? dias : Number.isInteger(corte) && corte > 0 ? [corte] : [], tipo: String(x.Tipo_Pago || 'Mensual') };
    });
  } catch (e) {
    cortes.value = [];
    errorCarga.value = e instanceof Error ? e.message : t('loadError');
    toastRef.value?.notify(errorCarga.value, 'error');
  } finally { cargando.value = false; }
};
const cruzaMes = (c: CorteItem): boolean => c.inicio > c.termino;
const diasEnRango = (c: CorteItem): number => cruzaMes(c) ? 32 - c.inicio + c.termino : c.termino - c.inicio + 1;
const enRango = (n: number, c: CorteItem): boolean => cruzaMes(c) ? n >= c.inicio || n <= c.termino : n >= c.inicio && n <= c.termino;
const getDayClass = (n: number): string => {
  if (cortes.value.some(c => c.cortes.includes(n))) return 'is-corte';
  const corte = cortes.value.find(c => enRango(n, c));
  return !corte ? 'default-bg' : corte.tipo === 'Mensual' ? 'mes' : 'quin';
};
const handleLanguageChange = (e: Event): void => {
  const lang = (e as CustomEvent<{ idioma?: string }>).detail?.idioma;
  if (lang) currentLang.value = lang;
};
onMounted(() => {
  window.addEventListener('idioma-changed', handleLanguageChange);
  window.addEventListener('factorfit:branch-changed', cargarCortes);
  void cargarCortes();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLanguageChange);
  window.removeEventListener('factorfit:branch-changed', cargarCortes);
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&family=Oswald:wght@500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
* { box-sizing: border-box; }
i.bi { display: inline-block; line-height: 1; }
/* ================= PANEL ================= */
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
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.58);
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--text) 18%, transparent) transparent;
}
.form-panel::-webkit-scrollbar { width: 6px; }
.form-panel::-webkit-scrollbar-thumb { border-radius: 10px; background: color-mix(in srgb, var(--text) 18%, transparent); }
/* ================= ENCABEZADO ================= */
.panel-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--line);
}
.header-left { min-width: 0; display: flex; align-items: center; gap: 14px; }
.header-icon {
  width: 48px; height: 48px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.3rem;
  color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 12px; background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.title-group { min-width: 0; }
.section-kicker { display: block; margin-bottom: 2px; color: var(--accent); font-size: 0.78rem; font-weight: 600; }
.form-title { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.6rem; font-weight: 600; line-height: 1.1; letter-spacing: 0.4px; }
.highlight { color: var(--accent); }
.form-subtitle { margin: 5px 0 0; color: var(--muted); font-size: 0.88rem; line-height: 1.45; }
.close-x {
  width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; cursor: pointer;
  color: var(--muted); border: 1px solid var(--line); border-radius: 10px; background: var(--surface);
  transition: all 0.17s ease;
}
.close-x:hover { color: var(--text); border-color: var(--line-strong); background: color-mix(in srgb, var(--text) 7%, var(--surface)); }
/* ================= TARJETAS ================= */
.form-body { display: flex; flex-direction: column; gap: 16px; }
.card { padding: 22px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
.section-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.section-heading.no-margin { margin-bottom: 0; }
.heading-grow { flex: 1; min-width: 0; }
.section-icon {
  width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.1rem;
  color: var(--accent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.section-heading h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.3px; }
.section-heading p { margin: 2px 0 0; color: var(--muted); font-size: 0.82rem; line-height: 1.4; }
.count-badge {
  min-width: 30px; height: 30px; display: grid; place-items: center; padding: 0 9px;
  color: var(--accent); font-family: 'IBM Plex Mono', monospace; font-size: 0.82rem; font-weight: 700;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
/* ================= CAMPOS ================= */
.field { min-width: 0; display: flex; flex-direction: column; }
.field > label, .field-label {
  display: block; margin: 0 0 8px; color: var(--muted); font-size: 0.82rem; font-weight: 600;
}
.field > label em { color: var(--muted-2); font-style: normal; font-weight: 500; }
.range-row {
  display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end; gap: 12px; margin-bottom: 18px;
}
.range-link { height: 50px; display: grid; place-items: center; color: var(--muted-2); font-size: 1.1rem; }
.select-wrapper { position: relative; min-width: 0; }
.select-lead {
  position: absolute; top: 50%; left: 14px; z-index: 1; transform: translateY(-50%);
  color: var(--muted); font-size: 0.95rem; pointer-events: none;
}
.select-arrow {
  position: absolute; top: 50%; right: 14px; transform: translateY(-50%);
  color: var(--muted); font-size: 0.75rem; pointer-events: none; transition: transform 0.2s ease;
}
.select-arrow.flip { transform: translateY(-50%) rotate(180deg); }
.custom-select {
  width: 100%; height: 50px; padding: 0 38px 0 14px; outline: none; cursor: pointer;
  appearance: none; -webkit-appearance: none; color-scheme: dark;
  color: var(--text); font-family: 'Inter', sans-serif; font-size: 0.92rem; font-weight: 600;
  border: 1px solid var(--line-strong); border-radius: 10px; background: var(--surface-2);
  transition: border-color 0.17s ease, box-shadow 0.17s ease;
}
.custom-select.has-lead { padding-left: 40px; }
.custom-select:hover { border-color: color-mix(in srgb, var(--text) 32%, transparent); }
.custom-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.custom-select option { background: #15171b; color: #f4f4f5; }
.wrap-note {
  display: flex; align-items: flex-start; gap: 10px; margin-bottom: 18px; padding: 12px 14px;
  color: var(--text); font-size: 0.85rem; line-height: 1.45;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
.wrap-note i { flex-shrink: 0; margin-top: 2px; color: var(--accent); }
/* ================= SELECT MÚLTIPLE ================= */
.cutoff-field { position: relative; margin-bottom: 18px; }
.multi-trigger {
  position: relative; width: 100%; min-height: 50px; display: flex; align-items: center;
  padding: 7px 40px 7px 40px; text-align: left; cursor: pointer; outline: none;
  color: var(--text); font-family: 'Inter', sans-serif; font-size: 0.92rem; font-weight: 600;
  border: 1px solid var(--line-strong); border-radius: 10px; background: var(--surface-2);
  transition: border-color 0.17s ease, box-shadow 0.17s ease;
}
.multi-trigger:hover { border-color: color-mix(in srgb, var(--text) 32%, transparent); }
.multi-trigger:focus-visible, .multi-trigger.open {
  border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}
.multi-trigger.has-value .select-lead { color: var(--amber); }
.multi-value { min-width: 0; flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.placeholder { color: var(--muted-2); font-weight: 500; }
.multi-tag {
  display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 6px 0 10px;
  color: var(--amber); font-family: 'IBM Plex Mono', monospace; font-size: 0.82rem; font-weight: 700;
  border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 7px; background: rgba(251, 191, 36, 0.12);
}
.multi-tag i { display: grid; place-items: center; width: 16px; height: 16px; font-size: 1rem; border-radius: 4px; opacity: 0.75; }
.multi-tag i:hover { opacity: 1; background: rgba(251, 191, 36, 0.22); }
.multi-more { color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 600; }
.multi-panel {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 30;
  padding: 14px; border: 1px solid var(--line-strong); border-radius: 12px;
  background: color-mix(in srgb, var(--card-bg) 94%, black); box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
}
.multi-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; color: var(--muted); font-size: 0.8rem; font-weight: 600; }
.multi-actions { display: flex; align-items: center; gap: 4px; }
.link-btn {
  height: 28px; padding: 0 10px; cursor: pointer; color: var(--accent);
  font-family: inherit; font-size: 0.78rem; font-weight: 600; border: 0; border-radius: 7px; background: transparent;
  transition: background 0.15s ease;
}
.link-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 12%, transparent); }
.link-btn.muted { color: var(--muted); }
.link-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.multi-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(46px, 1fr)); gap: 6px;
  max-height: 190px; overflow-y: auto; padding: 2px; scrollbar-width: thin;
}
.day-opt {
  height: 40px; cursor: pointer; color: var(--muted);
  font-family: 'IBM Plex Mono', monospace; font-size: 0.88rem; font-weight: 600;
  border: 1px solid var(--line); border-radius: 8px; background: var(--surface-2);
  transition: all 0.14s ease;
}
.day-opt:hover { color: var(--text); border-color: var(--line-strong); }
.day-opt.active {
  color: var(--amber); border-color: rgba(251, 191, 36, 0.6); background: rgba(251, 191, 36, 0.16);
}
.multi-panel-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line);
}
.multi-panel-foot small { color: var(--muted-2); font-size: 0.75rem; line-height: 1.35; }
.btn-done {
  height: 34px; padding: 0 16px; cursor: pointer; flex-shrink: 0;
  color: var(--color-texto-botones, #fff); font-family: inherit; font-size: 0.8rem; font-weight: 700;
  border: 0; border-radius: 8px; background: var(--color-botones, #2563eb);
}
.btn-done:hover { filter: brightness(1.1); }
.pop-enter-active, .pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-6px); }
/* ================= TIPO DE PAGO ================= */
.payment-type-group { margin-bottom: 18px; }
.payment-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.payment-option {
  min-width: 0; display: flex; align-items: center; gap: 12px; padding: 13px 14px; cursor: pointer;
  color: var(--muted); font-family: inherit; text-align: left;
  border: 1px solid var(--line-strong); border-radius: 12px; background: var(--surface-2);
  transition: all 0.17s ease;
}
.payment-option:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 32%, transparent); }
.payment-option.active { color: var(--text); border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface-2)); }
.payment-option-icon {
  width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.1rem;
  border-radius: 9px; background: color-mix(in srgb, var(--text) 6%, transparent);
}
.payment-option.active .payment-option-icon { color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, transparent); }
.payment-option-text { min-width: 0; flex: 1; }
.payment-option strong { display: block; color: inherit; font-size: 0.95rem; font-weight: 700; }
.payment-option small { display: block; margin-top: 2px; color: var(--muted); font-size: 0.78rem; }
.radio-dot { width: 18px; height: 18px; flex-shrink: 0; border: 2px solid var(--line-strong); border-radius: 50%; transition: all 0.17s ease; }
.payment-option.active .radio-dot { border-color: var(--accent); background: radial-gradient(circle, var(--accent) 0 45%, transparent 50%); }
/* ================= RESUMEN ================= */
.rule-preview {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line)); border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 5%, var(--surface-2));
}
.rule-preview-content { min-width: 0; flex: 1; }
.rule-label { display: block; color: var(--accent); font-size: 0.78rem; font-weight: 600; }
.rule-range { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 4px; color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 1.15rem; }
.rule-range i { color: var(--muted-2); font-size: 0.95rem; }
.rule-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tag {
  display: inline-flex; align-items: center; gap: 5px; min-height: 26px; padding: 0 10px;
  color: var(--muted); font-size: 0.76rem; font-weight: 600; border-radius: 999px;
  background: color-mix(in srgb, var(--text) 8%, transparent);
}
.tag-cutoff { color: var(--amber); background: rgba(251, 191, 36, 0.12); }
.tag-mes { color: var(--blue); background: rgba(59, 130, 246, 0.14); }
.tag-quin { color: var(--green); background: rgba(34, 197, 94, 0.13); }
.tag-wrap { color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
.conflict-msg { display: flex; align-items: flex-start; gap: 7px; margin: 12px 0 0; color: var(--red); font-size: 0.82rem; line-height: 1.4; }
.conflict-msg i { flex-shrink: 0; margin-top: 2px; }
.btn-save {
  min-height: 50px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0 22px; cursor: pointer; white-space: nowrap;
  color: var(--color-texto-botones, #fff); font-family: 'Inter', sans-serif; font-size: 0.92rem; font-weight: 700;
  border: 0; border-radius: 10px; background: var(--color-botones, #2563eb);
  transition: filter 0.15s ease, transform 0.15s ease;
}
.btn-save:hover:not(:disabled) { filter: brightness(1.1); }
.btn-save:active:not(:disabled) { transform: scale(0.97); }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
/* ================= GUARDADOS ================= */
.empty-state { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px dashed var(--line-strong); border-radius: 12px; background: var(--surface-2); }
.empty-icon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.3rem; color: var(--muted); border-radius: 11px; background: color-mix(in srgb, var(--text) 5%, transparent); }
.empty-state strong { display: block; color: var(--text); font-size: 0.95rem; }
.empty-state p { margin: 3px 0 0; color: var(--muted); font-size: 0.85rem; }
.saved-list { display: flex; flex-direction: column; gap: 10px; }
.saved-item {
  display: grid; grid-template-columns: 4px 1fr auto; align-items: center; gap: 14px; padding: 14px;
  border: 1px solid var(--line); border-radius: 12px; background: var(--surface-2); transition: border-color 0.17s ease;
}
.saved-item:hover { border-color: var(--line-strong); }
.saved-item-accent { align-self: stretch; width: 4px; border-radius: 5px; }
.monthly-accent { background: #3b82f6; }
.biweekly-accent { background: #22c55e; }
.saved-main { min-width: 0; }
.saved-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.saved-range { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; color: var(--text); font-family: 'IBM Plex Mono', monospace; font-size: 1rem; }
.saved-range i { color: var(--muted-2); font-size: 0.85rem; }
.type-badge { display: inline-flex; align-items: center; min-height: 24px; padding: 0 10px; font-size: 0.76rem; font-weight: 700; border-radius: 999px; }
.badge-mes { color: var(--blue); background: rgba(59, 130, 246, 0.14); }
.badge-quin { color: var(--green); background: rgba(34, 197, 94, 0.13); }
.saved-bottom { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; }
.meta { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.82rem; }
.cutoff-info i { color: var(--amber); }
.cutoff-info strong { color: var(--amber); font-family: 'IBM Plex Mono', monospace; }
.wrap-meta { color: var(--accent); }
.icon-del {
  width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; cursor: pointer;
  color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 9px; background: rgba(239, 68, 68, 0.07);
  transition: all 0.17s ease;
}
.icon-del:hover:not(:disabled) { border-color: rgba(239, 68, 68, 0.45); background: rgba(239, 68, 68, 0.14); }
.icon-del:disabled { opacity: 0.5; cursor: not-allowed; }
/* ================= CALENDARIO ================= */
.calendar-header-info { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.calendar-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
.legend-item { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.8rem; font-weight: 500; }
.dot { width: 9px; height: 9px; flex-shrink: 0; border-radius: 50%; }
.dot-corte { background: var(--amber); }
.dot-mes { background: #3b82f6; }
.dot-quin { background: #22c55e; }
.calendar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); gap: 7px; }
.cal-day {
  position: relative; min-height: 46px; display: grid; place-items: center;
  font-family: 'IBM Plex Mono', monospace; font-size: 0.92rem; font-weight: 600;
  border: 1px solid transparent; border-radius: 9px;
}
.cut-icon { position: absolute; top: 4px; right: 4px; font-size: 0.6rem; }
.default-bg { color: var(--muted-2); border-color: var(--line); background: var(--surface-2); }
.mes { color: #93c5fd; border-color: rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.15); }
.quin { color: #86efac; border-color: rgba(34, 197, 94, 0.35); background: rgba(34, 197, 94, 0.14); }
.is-corte { color: var(--amber) !important; border-color: rgba(251, 191, 36, 0.6) !important; background: rgba(251, 191, 36, 0.18) !important; }
.calendar-hint { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-top: 14px; color: var(--muted); font-size: 0.85rem; border-top: 1px solid var(--line); }
/* ================= FOCUS ================= */
.payment-option:focus-visible, .btn-save:focus-visible, .close-x:focus-visible, .icon-del:focus-visible,
.day-opt:focus-visible, .btn-done:focus-visible, .link-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* ================= RESPONSIVE ================= */
@media (max-width: 640px) {
  .form-panel { width: min(97vw, 560px); padding: 18px; }
  .card { padding: 16px; }
  .rule-preview { flex-direction: column; align-items: stretch; }
  .btn-save { width: 100%; }
}
@media (max-width: 480px) {
  .form-panel { width: calc(100vw - 12px); max-height: 96vh; padding: 14px; border-radius: 13px; }
  .form-title { font-size: 1.35rem; }
  .header-icon { width: 42px; height: 42px; }
  .payment-options { grid-template-columns: 1fr; }
  .calendar-grid { grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
  .cal-day { min-height: 40px; font-size: 0.82rem; }
  .multi-grid { grid-template-columns: repeat(auto-fill, minmax(42px, 1fr)); }
  .multi-panel-foot small { display: none; }
  .multi-panel-foot { justify-content: flex-end; }
}
@media (max-width: 380px) {
  .range-row { grid-template-columns: 1fr; }
  .range-link { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .close-x, .custom-select, .multi-trigger, .payment-option, .btn-save, .saved-item, .icon-del, .radio-dot,
  .day-opt, .select-arrow, .pop-enter-active, .pop-leave-active { transition: none !important; }
}
.readonly-banner { display:flex; align-items:center; gap:10px; padding:12px 15px; border:1px solid var(--line); border-radius:10px; background:var(--surface); color:var(--muted); font-size:0.85rem; }
.readonly-banner i { color:var(--accent); font-size:1.1rem; }
.saved-item { grid-template-columns:4px minmax(0,1fr); }
.data-message { padding:16px; color:var(--muted); text-align:center; }
.retry-btn { padding:8px 12px; margin-left:8px; border:1px solid var(--line-strong); border-radius:8px; background:var(--surface-2); color:var(--text); cursor:pointer; }

</style>
