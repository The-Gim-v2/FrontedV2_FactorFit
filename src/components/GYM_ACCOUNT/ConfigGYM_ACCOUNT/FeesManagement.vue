<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';

/* =========================================================
   IDIOMA
========================================================= */
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const txt = (es, en) => (currentLang.value === 'en' ? en : es);

const extraTexts = {
  es: {
    fp_pageTitle: 'GESTIÓN DE',
    fp_pageHighlight: 'MOROSIDAD Y RECARGOS',
    fp_pageSubtitle: 'Configura estados de morosidad, períodos de gracia, recargos, límites y notificaciones de pago.',
    fp_kpiRules: 'Reglas activas',
    fp_kpiGrace: 'Período de gracia',
    fp_kpiFine: 'Multa base',
    fp_kpiCap: 'Tope máximo',
    fp_days: 'días',
    fp_charges: 'Recargos',
    fp_cap: 'Tope',
    fp_day: 'Día',
    fp_fine: 'Multa',
    fp_ofCap: '% del tope',
    fp_remTitle1: 'Avisos al',
    fp_remTitleHl: 'socio',
    fp_remSubtitle: 'Comunica vencimientos y recargos de forma automática.',
    fp_remBefore: 'Recordatorio antes del vencimiento',
    fp_remBeforeDesc: 'Envía un aviso por correo antes de que venza el pago.',
    fp_daysBefore: 'días antes',
    fp_notifyFine: 'Notificar al aplicar una multa',
    fp_notifyFineDesc: 'El socio recibe un mensaje cada vez que se genera un recargo.',
    fp_noteNoCap: 'Sin tope: las multas pueden acumularse sin límite.',
    fp_warnExceeds: 'La multa base supera el tope máximo.',
    fp_invalidFine: 'La multa base no puede ser mayor que el tope máximo.',
    fp_invalidValues: 'Los montos no pueden ser negativos.',
    fp_timingTitle1: 'Plazos y',
    fp_timingTitleHl: 'tolerancia',
    fp_timingSub: 'Define cuánto tiempo se espera antes de cobrar recargo y de pasar a inactivo.',
    fp_inactiveTitle: 'Plazo para pasar a inactivo',
    fp_inactiveDesc: 'Días adicionales después de la gracia. Si sigue sin pago, la membresía pasa a Inactivo.',
    fp_tlTitle: 'Así se ve la línea de tiempo',
    fp_tlDue: 'Vence el pago',
    fp_tlDueSub: 'Empieza la gracia',
    fp_tlGrace: 'Termina la gracia',
    fp_tlGraceSub: 'Empieza el recargo',
    fp_tlInactive: 'Pasa a inactivo',
    fp_tlInactiveSub: 'Si no hay pago',
    fp_previewTitle1: 'Vista previa de',
    fp_previewTitleHl: 'recargos',
    fp_previewSub: 'Cuánto se acumularía según los días de retraso con tu configuración.',
    fp_applyAll: 'Aplicar a todas las sedes al guardar',
    fp_copyAll: 'Copiar a todas las sedes',
    fp_copyConfirm: '¿Copiar la configuración actual de esta sede a todas las demás?',
    fp_copied: 'Configuración copiada a todas las sucursales.',
    fp_selectBranch: 'Selecciona una sucursal.',
    fp_noSession: 'Sesión no iniciada.',
    fp_autosave: 'Los interruptores y plazos se guardan solos. Los montos requieren Guardar.'
  },
  en: {
    fp_pageTitle: 'DELINQUENCY &',
    fp_pageHighlight: 'LATE FEE MANAGEMENT',
    fp_pageSubtitle: 'Configure delinquency statuses, grace periods, late fees, limits and payment notifications.',
    fp_kpiRules: 'Active rules',
    fp_kpiGrace: 'Grace period',
    fp_kpiFine: 'Base fine',
    fp_kpiCap: 'Maximum cap',
    fp_days: 'days',
    fp_charges: 'Charges',
    fp_cap: 'Cap',
    fp_day: 'Day',
    fp_fine: 'Fine',
    fp_ofCap: '% of cap',
    fp_remTitle1: 'Member',
    fp_remTitleHl: 'notices',
    fp_remSubtitle: 'Communicate due dates and charges automatically.',
    fp_remBefore: 'Reminder before due date',
    fp_remBeforeDesc: 'Sends an email notice before payment is due.',
    fp_daysBefore: 'days before',
    fp_notifyFine: 'Notify when a fine is applied',
    fp_notifyFineDesc: 'The member receives a message every time a charge is generated.',
    fp_noteNoCap: 'No cap: fines can accumulate without limit.',
    fp_warnExceeds: 'The base fine exceeds the maximum cap.',
    fp_invalidFine: 'The base fine cannot exceed the maximum cap.',
    fp_invalidValues: 'Amounts cannot be negative.',
    fp_timingTitle1: 'Deadlines &',
    fp_timingTitleHl: 'tolerance',
    fp_timingSub: 'Define how long to wait before charging a fine and before marking a member inactive.',
    fp_inactiveTitle: 'Time before becoming inactive',
    fp_inactiveDesc: 'Additional days after the grace period. If there is still no payment, the membership becomes Inactive.',
    fp_tlTitle: 'This is how the timeline looks',
    fp_tlDue: 'Payment due',
    fp_tlDueSub: 'Grace starts',
    fp_tlGrace: 'Grace ends',
    fp_tlGraceSub: 'Fine starts',
    fp_tlInactive: 'Becomes inactive',
    fp_tlInactiveSub: 'If unpaid',
    fp_previewTitle1: 'Fine',
    fp_previewTitleHl: 'preview',
    fp_previewSub: 'How much would accumulate by days late with your settings.',
    fp_applyAll: 'Apply to all branches on save',
    fp_copyAll: 'Copy to all branches',
    fp_copyConfirm: 'Copy this branch’s current settings to all other branches?',
    fp_copied: 'Settings copied to all branches.',
    fp_selectBranch: 'Select a branch.',
    fp_noSession: 'Not signed in.',
    fp_autosave: 'Switches and deadlines save automatically. Amounts need Save.'
  }
};

const t = (key) => {
  const lang = currentLang.value;
  return (
    traducciones[lang]?.[key] ||
    extraTexts[lang]?.[key] ||
    traducciones.es?.[key] ||
    extraTexts.es?.[key] ||
    key
  );
};

const handleLangChange = (event) => {
  const idioma = event?.detail?.idioma;
  if (idioma && ['es', 'en'].includes(idioma)) {
    currentLang.value = idioma;
    localStorage.setItem('GYM_ACCOUNT-idioma', idioma);
  }
};

/* =========================================================
   ESTADO
========================================================= */
const toastRef = ref(null);
const graceDays = ref(0);
const inactiveDays = ref(7);
const settings = ref({
  pendingStatus: true,
  inactiveStatus: true,
  blockTurnstile: true,
  paymentType: 'membresia',
  fineAmount: 800,
  recurrence: 'unica',
  maxFineLimit: 2500,
  remindBefore: true,
  remindDays: 3,
  notifyFine: true
});
const notify = (message, type = 'success') => toastRef.value?.notify?.(message, type);

const selectedSede = ref(sessionStorage.getItem('selected_sede_id') || '');
const loading = ref(false);
const saving = ref(false);
const aplicarTodas = ref(false);

/* =========================================================
   API
========================================================= */
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = `${base}${base.endsWith('/api') ? '' : '/api'}/gym/morosidad`;

const request = async (path = '', options = {}) => {
  const token = sessionStorage.getItem('auth_token');
  if (!token) throw new Error(t('fp_noSession'));
  const response = await fetch(`${api}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.message ||
      Object.values(data.errors || {}).flat().join(' ') ||
      `Error HTTP ${response.status}`
    );
  }
  return data;
};

const resolveSede = () => {
  selectedSede.value = sessionStorage.getItem('selected_sede_id') || '';
  if (!selectedSede.value) {
    try {
      const account = JSON.parse(sessionStorage.getItem('gym_account') || '{}');
      selectedSede.value = String((account.usuario || account).sedes?.[0]?.ID_Sede || '');
    } catch { /* sin cuenta en sesión */ }
  }
};

const cargarConfiguracion = async () => {
  resolveSede();
  if (!selectedSede.value) return;
  loading.value = true;
  try {
    const data = await request(`?sede_id=${encodeURIComponent(selectedSede.value)}`);
    if (data.configuracion) {
      const c = data.configuracion;
      graceDays.value = Number(c.graceDays ?? 0);
      inactiveDays.value = Number(c.inactiveDays ?? 7);
      Object.assign(settings.value, c);
    }
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    loading.value = false;
  }
};

const guardarConfiguracionGeneral = async () => {
  if (!selectedSede.value) return notify(t('fp_selectBranch'), 'error');
  const fine = Number(settings.value.fineAmount);
  const cap = Number(settings.value.maxFineLimit);
  if (!Number.isFinite(fine) || !Number.isFinite(cap) || fine < 0 || cap < 0) return notify(t('fp_invalidValues'), 'error');
  if (cap > 0 && fine > cap) return notify(t('fp_invalidFine'), 'error');
  saving.value = true;
  try {
    await request('', {
      method: 'PUT',
      body: JSON.stringify({
        sede_id: Number(selectedSede.value),
        graceDays: graceDays.value,
        inactiveDays: inactiveDays.value,
        ...settings.value,
        aplicar_todas: aplicarTodas.value
      })
    });
    notify(t('generalSettingsSavedToast'), 'success');
  } catch (e) {
    notify(e.message, 'error');
  } finally {
    saving.value = false;
  }
};

let timer = null;
const guardarCambiosRapidos = () => {
  clearTimeout(timer);
  timer = setTimeout(() => guardarConfiguracionGeneral(), 550);
};

const copiarSedes = async () => {
  if (!selectedSede.value) return notify(t('fp_selectBranch'), 'error');
  if (!window.confirm(t('fp_copyConfirm'))) return;
  try {
    await request('/copiar-sedes', { method: 'POST', body: JSON.stringify({ sede_id: Number(selectedSede.value) }) });
    notify(t('fp_copied'), 'success');
  } catch (e) {
    notify(e.message, 'error');
  }
};

const handleBranchChange = () => {
  clearTimeout(timer);
  cargarConfiguracion();
};

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', handleBranchChange);
  cargarConfiguracion();
});
onUnmounted(() => {
  clearTimeout(timer);
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', handleBranchChange);
});

/* =========================================================
   PLAZOS (gracia e inactivo)
========================================================= */
const gracePresets = [0, 3, 5, 7, 15];
const inactivePresets = [0, 3, 5, 7, 15, 30];

const setGrace = (days) => {
  if (graceDays.value === days) return;
  graceDays.value = days;
  guardarCambiosRapidos();
};
const incrementDays = () => { graceDays.value++; guardarCambiosRapidos(); };
const decrementDays = () => {
  if (graceDays.value <= 0) return;
  graceDays.value--;
  guardarCambiosRapidos();
};

const setInactiveDays = (days) => { inactiveDays.value = days; guardarCambiosRapidos(); };
const incInactive = () => setInactiveDays(Math.min(365, inactiveDays.value + 1));
const decInactive = () => setInactiveDays(Math.max(0, inactiveDays.value - 1));

const timingBlocks = computed(() => [
  {
    key: 'grace',
    title: t('gracePeriodTitle'),
    desc: t('gracePeriodDesc'),
    value: graceDays.value,
    presets: gracePresets,
    canDec: graceDays.value > 0,
    canInc: true,
    set: setGrace, dec: decrementDays, inc: incrementDays
  },
  {
    key: 'inactive',
    title: t('fp_inactiveTitle'),
    desc: t('fp_inactiveDesc'),
    value: inactiveDays.value,
    presets: inactivePresets,
    canDec: inactiveDays.value > 0,
    canInc: inactiveDays.value < 365,
    set: setInactiveDays, dec: decInactive, inc: incInactive
  }
]);

const timeline = computed(() => [
  { key: 'due', day: 0, label: t('fp_tlDue'), sub: t('fp_tlDueSub') },
  { key: 'grace', day: graceDays.value, label: t('fp_tlGrace'), sub: t('fp_tlGraceSub') },
  { key: 'inactive', day: graceDays.value + inactiveDays.value, label: t('fp_tlInactive'), sub: t('fp_tlInactiveSub') }
]);

/* =========================================================
   AVISOS
========================================================= */
const remindPresets = [1, 3, 5, 7];
const setRemindDays = (days) => {
  if (settings.value.remindDays === days) return;
  settings.value.remindDays = days;
  guardarCambiosRapidos();
};

/* =========================================================
   FORMATO Y CÁLCULOS
========================================================= */
const fmt = (number) => {
  const value = Number(number) || 0;
  return '$' + value.toLocaleString(currentLang.value === 'en' ? 'en-US' : 'es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const activeRules = computed(() =>
  [settings.value.pendingStatus, settings.value.inactiveStatus, settings.value.blockTurnstile].filter(Boolean).length
);

const fineValue = computed(() => Math.max(Number(settings.value.fineAmount) || 0, 0));
const capValue = computed(() => Math.max(Number(settings.value.maxFineLimit) || 0, 0));

const finePercent = computed(() => {
  if (capValue.value <= 0) return 0;
  return Math.min(Math.round((fineValue.value / capValue.value) * 100), 100);
});
const fineExceedsLimit = computed(() => capValue.value > 0 && fineValue.value > capValue.value);
const fineLevel = computed(() => {
  if (fineExceedsLimit.value || finePercent.value >= 90) return 'danger';
  if (finePercent.value >= 60) return 'warn';
  return 'ok';
});

const normalizeDays = (days) => Math.max(Math.floor(Number(days) || 0), 0);

const periodsFor = (days) => {
  const overdueDays = Math.max(normalizeDays(days) - graceDays.value, 0);
  if (overdueDays === 0) return 0;
  switch (settings.value.recurrence) {
    case 'diaria': return overdueDays;
    case 'semanal': return Math.ceil(overdueDays / 7);
    case 'mensual': return Math.ceil(overdueDays / 30);
    case 'unica':
    default: return 1;
  }
};

const fineFor = (days) => {
  const rawFine = periodsFor(days) * fineValue.value;
  return capValue.value <= 0 ? rawFine : Math.min(rawFine, capValue.value);
};

const recurrenceText = computed(() => ({
  unica: t('recurrenceSingleOption'),
  diaria: t('recurrenceDailyOption'),
  semanal: t('recurrenceWeeklyOption'),
  mensual: t('recurrenceMonthlyOption')
})[settings.value.recurrence] || '');

const milestoneDays = [7, 15, 30, 60, 90];
const milestones = computed(() => milestoneDays.map((day) => {
  const amount = fineFor(day);
  return {
    d: day,
    periods: periodsFor(day),
    amount,
    pct: capValue.value > 0 ? Math.min(Math.round((amount / capValue.value) * 100), 100) : null
  };
}));
</script>

<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <main class="main-content-promos">

      <!-- ENCABEZADO -->
      <header class="page-heading">
        <div>
          <h1 class="page-title">{{ t('fp_pageTitle') }} <span>{{ t('fp_pageHighlight') }}</span></h1>
          <p class="page-description">{{ t('fp_pageSubtitle') }}</p>
        </div>
      </header>

      <!-- INDICADORES -->
      <section class="kpi-grid">
        <article class="kpi-card">
          <span class="kpi-icon amber">🛡️</span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiRules') }}</span>
            <strong class="kpi-value">{{ activeRules }}<small>/3</small></strong>
          </div>
        </article>
        <article class="kpi-card">
          <span class="kpi-icon amber">⏳</span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiGrace') }}</span>
            <strong class="kpi-value">{{ graceDays }}<small>{{ t('fp_days') }}</small></strong>
          </div>
        </article>
        <article class="kpi-card">
          <span class="kpi-icon blue">💵</span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiFine') }}</span>
            <strong class="kpi-value">{{ fmt(fineValue) }}</strong>
          </div>
        </article>
        <article class="kpi-card">
          <span class="kpi-icon red">🚧</span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiCap') }}</span>
            <strong class="kpi-value">{{ capValue > 0 ? fmt(capValue) : '∞' }}</strong>
          </div>
        </article>
      </section>

      <!-- 1. REGLAS -->
      <section class="panel accent-amber area-rules" id="tutorial-step-0">
        <div class="panel-head">
          <span class="head-badge">⚠️</span>
          <div class="head-text">
            <h2>{{ t('delinquencyRulesTitlePart1') }} <span class="hl">{{ t('delinquencyRulesTitleHighlight') }}</span></h2>
            <p>{{ t('delinquencyRulesSubtitle') }}</p>
          </div>
          <span class="head-counter">{{ activeRules }}<small>/3</small></span>
        </div>

        <div class="panel-body">
          <div class="rule-row" :class="{ 'is-on': settings.pendingStatus }">
            <span class="rule-icon">🕓</span>
            <div class="rule-text">
              <h4>{{ t('statusPendingTitle') }}</h4>
              <p>{{ t('statusPendingDesc') }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.pendingStatus" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>

          <div class="rule-row" :class="{ 'is-on': settings.inactiveStatus }">
            <span class="rule-icon">💤</span>
            <div class="rule-text">
              <h4>{{ t('statusInactiveTitle') }}</h4>
              <p>{{ t('statusInactiveDesc') }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.inactiveStatus" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>

          <div class="rule-row" :class="{ 'is-on': settings.blockTurnstile }">
            <span class="rule-icon">🔒</span>
            <div class="rule-text">
              <h4>{{ t('turnstileBlockTitle') }}</h4>
              <p>{{ t('turnstileBlockDesc') }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.blockTurnstile" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>
        </div>
      </section>

      <!-- 2. PLAZOS -->
      <section class="panel accent-amber area-timing">
        <div class="panel-head">
          <span class="head-badge">⏳</span>
          <div class="head-text">
            <h2>{{ t('fp_timingTitle1') }} <span class="hl">{{ t('fp_timingTitleHl') }}</span></h2>
            <p>{{ t('fp_timingSub') }}</p>
          </div>
        </div>

        <div class="panel-body">
          <div v-for="block in timingBlocks" :key="block.key" class="timing-block">
            <div class="timing-info">
              <h4>{{ block.title }}</h4>
              <p>{{ block.desc }}</p>
            </div>
            <div class="timing-control">
              <div class="counter">
                <button class="btn-counter" type="button" :disabled="!block.canDec" aria-label="-1" @click="block.dec">−</button>
                <div class="counter-value">
                  <span class="counter-number">{{ block.value }}</span>
                  <span class="counter-unit">{{ t('fp_days') }}</span>
                </div>
                <button class="btn-counter" type="button" :disabled="!block.canInc" aria-label="+1" @click="block.inc">+</button>
              </div>
              <div class="chip-row">
                <button
                  v-for="d in block.presets"
                  :key="block.key + '-' + d"
                  type="button"
                  class="chip-btn"
                  :class="{ active: block.value === d }"
                  @click="block.set(d)"
                >{{ d }}</button>
              </div>
            </div>
          </div>

          <!-- Línea de tiempo -->
          <div class="timeline">
            <span class="timeline-title">{{ t('fp_tlTitle') }}</span>
            <ol class="timeline-steps">
              <li v-for="(step, i) in timeline" :key="step.key" class="tl-step" :class="'tl-' + step.key">
                <span class="tl-dot">{{ i + 1 }}</span>
                <span class="tl-day">{{ t('fp_day') }} {{ step.day }}</span>
                <strong>{{ step.label }}</strong>
                <small>{{ step.sub }}</small>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <!-- 3. RECARGO -->
      <section class="panel accent-blue area-fine" id="tutorial-step-1">
        <div class="panel-head">
          <span class="head-badge badge-blue">💰</span>
          <div class="head-text">
            <h2>{{ t('costFrequencyTitlePart1') }} <span class="hl">{{ t('costFrequencyTitleHighlight') }}</span></h2>
            <p>{{ t('costFrequencySubtitle') }}</p>
          </div>
        </div>

        <div class="panel-body">
          <div class="field">
            <label>{{ t('affectedServiceLabel') }}</label>
            <div class="select-wrap">
              <select v-model="settings.paymentType" class="custom-select">
                <option value="membresia">{{ t('serviceMembershipOption') }}</option>
                <option value="clases">{{ t('serviceClassesOption') }}</option>
                <option value="taquilla">{{ t('serviceLockerOption') }}</option>
                <option value="todos">{{ t('serviceAllOption') }}</option>
              </select>
              <span class="select-chevron">▾</span>
            </div>
          </div>

          <div class="field">
            <label>{{ t('recurrenceLabel') }}</label>
            <div class="select-wrap">
              <select v-model="settings.recurrence" class="custom-select">
                <option value="unica">{{ t('recurrenceSingleOption') }}</option>
                <option value="diaria">{{ t('recurrenceDailyOption') }}</option>
                <option value="semanal">{{ t('recurrenceWeeklyOption') }}</option>
                <option value="mensual">{{ t('recurrenceMonthlyOption') }}</option>
              </select>
              <span class="select-chevron">▾</span>
            </div>
          </div>

          <div class="fine-card">
            <div class="fine-grid">
              <div class="field">
                <label>{{ t('fineAmountLabel') }}</label>
                <div class="money">
                  <span class="money-symbol">$</span>
                  <input type="number" inputmode="decimal" v-model.number="settings.fineAmount" class="custom-input mono" :class="{ 'is-warn': fineExceedsLimit }" min="0" />
                </div>
              </div>
              <div class="field">
                <label>{{ t('maxFineLimitLabel') }}</label>
                <div class="money">
                  <span class="money-symbol">$</span>
                  <input type="number" inputmode="decimal" v-model.number="settings.maxFineLimit" class="custom-input mono" min="0" />
                </div>
              </div>
            </div>

            <div class="ratio" :class="'level-' + fineLevel" aria-hidden="true">
              <div class="ratio-track"><div class="ratio-fill" :style="{ width: finePercent + '%' }"></div></div>
              <span class="ratio-label">{{ finePercent }}%</span>
            </div>

            <p v-if="fineExceedsLimit" class="note danger">⚠️ {{ t('fp_warnExceeds') }}</p>
            <p v-else-if="capValue <= 0" class="note">ℹ️ {{ t('fp_noteNoCap') }}</p>
          </div>
        </div>
      </section>

      <!-- 4. VISTA PREVIA -->
      <section class="panel accent-blue area-preview">
        <div class="panel-head">
          <span class="head-badge badge-blue">📈</span>
          <div class="head-text">
            <h2>{{ t('fp_previewTitle1') }} <span class="hl">{{ t('fp_previewTitleHl') }}</span></h2>
            <p>{{ t('fp_previewSub') }}</p>
          </div>
        </div>

        <div class="panel-body">
          <div class="preview-summary">
            <span class="pill">{{ fmt(fineValue) }}</span>
            <span class="pill">{{ recurrenceText }}</span>
            <span class="pill">{{ t('fp_cap') }}: {{ capValue > 0 ? fmt(capValue) : '∞' }}</span>
            <span class="pill">{{ t('fp_kpiGrace') }}: {{ graceDays }} {{ t('fp_days') }}</span>
          </div>

          <div class="ms-table">
            <div class="ms-row ms-head">
              <span>{{ t('fp_day') }}</span>
              <span>{{ t('fp_charges') }}</span>
              <span>{{ t('fp_fine') }}</span>
              <span>{{ t('fp_ofCap') }}</span>
            </div>
            <div v-for="m in milestones" :key="m.d" class="ms-row">
              <span class="ms-day">{{ m.d }}</span>
              <span>{{ m.periods }}</span>
              <span class="ms-amount" :class="{ zero: m.amount === 0 }">{{ fmt(m.amount) }}</span>
              <span class="ms-pct">
                <span class="ms-bar"><i class="ms-bar-fill" :class="{ full: m.pct === 100 }" :style="{ width: (m.pct ?? 0) + '%' }"></i></span>
                {{ m.pct === null ? '—' : m.pct + '%' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. AVISOS -->
      <section class="panel accent-amber area-notices">
        <div class="panel-head">
          <span class="head-badge">🔔</span>
          <div class="head-text">
            <h2>{{ t('fp_remTitle1') }} <span class="hl">{{ t('fp_remTitleHl') }}</span></h2>
            <p>{{ t('fp_remSubtitle') }}</p>
          </div>
        </div>

        <div class="panel-body">
          <div class="rule-row" :class="{ 'is-on': settings.remindBefore }">
            <span class="rule-icon">📅</span>
            <div class="rule-text">
              <h4>{{ t('fp_remBefore') }}</h4>
              <p>{{ t('fp_remBeforeDesc') }}</p>
              <div v-if="settings.remindBefore" class="chip-row left">
                <button
                  v-for="d in remindPresets"
                  :key="'rp-' + d"
                  type="button"
                  class="chip-btn"
                  :class="{ active: settings.remindDays === d }"
                  @click="setRemindDays(d)"
                >{{ d }}</button>
                <span class="chip-suffix">{{ t('fp_daysBefore') }}</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.remindBefore" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>

          <div class="rule-row" :class="{ 'is-on': settings.notifyFine }">
            <span class="rule-icon">✉️</span>
            <div class="rule-text">
              <h4>{{ t('fp_notifyFine') }}</h4>
              <p>{{ t('fp_notifyFineDesc') }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.notifyFine" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>
        </div>
      </section>

      <!-- 6. ACCIONES -->
      <section class="actions-bar area-actions">
        <div class="actions-options">
          <label class="check">
            <input type="checkbox" v-model="aplicarTodas" />
            <span class="check-box"></span>
            <span>{{ t('fp_applyAll') }}</span>
          </label>
          <button type="button" class="btn-ghost" @click="copiarSedes">🏢 {{ t('fp_copyAll') }}</button>
        </div>
        <div class="actions-main">
          <small class="actions-note">{{ t('fp_autosave') }}</small>
          <button type="button" class="btn-primary-action" :disabled="saving || loading" @click="guardarConfiguracionGeneral">
            💾 {{ t('saveConfigurationBtn') }}
          </button>
        </div>
      </section>

    </main>
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

/* =========================================================
   BASE Y REJILLA
========================================================= */
.main-content-promos {
  --accent: var(--color-highlight, #3b82f6);
  --amber: #f59e0b;
  --green: #34d399;
  --red: #f87171;
  --card: var(--bg-cards, #121416);
  --input: var(--bg-input, #0c0e10);
  --title: var(--color-titulos, #ffffff);
  --text: var(--color-texto-general, #e5e7eb);
  --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 62%, transparent);
  --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 15%, transparent);
  --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);

  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 30px 32px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'head head'
    'kpis kpis'
    'rules timing'
    'fine preview'
    'fine notices'
    'actions actions';
  align-items: stretch;
  gap: 20px;
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
.main-content-promos *, .main-content-promos *::before, .main-content-promos *::after { box-sizing: border-box; }

.page-heading { grid-area: head; min-width: 0; }
.kpi-grid { grid-area: kpis; }
.area-rules { grid-area: rules; }
.area-timing { grid-area: timing; }
.area-fine { grid-area: fine; }
.area-preview { grid-area: preview; }
.area-notices { grid-area: notices; }
.area-actions { grid-area: actions; }

/* =========================================================
   TÍTULO
========================================================= */
.page-title { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: clamp(1.45rem, 2.2vw, 2rem); font-weight: 600; line-height: 1.1; letter-spacing: 0.025em; text-transform: uppercase; }
.page-title span { color: var(--accent); }
.page-description { max-width: 720px; margin: 7px 0 0; color: var(--muted); font-size: 0.78rem; line-height: 1.55; }

/* =========================================================
   KPIs
========================================================= */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.kpi-card { min-width: 0; display: flex; align-items: center; gap: 13px; padding: 15px 17px; border: 1px solid var(--line); border-radius: var(--app-border-radius, 14px); background: var(--card); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14); }
.kpi-icon { width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid; border-radius: 12px; font-size: 1.15rem; line-height: 1; }
.kpi-icon.amber { border-color: color-mix(in srgb, var(--amber) 28%, transparent); background: color-mix(in srgb, var(--amber) 9%, transparent); }
.kpi-icon.blue { border-color: color-mix(in srgb, var(--accent) 28%, transparent); background: color-mix(in srgb, var(--accent) 9%, transparent); }
.kpi-icon.red { border-color: color-mix(in srgb, var(--red) 28%, transparent); background: color-mix(in srgb, var(--red) 9%, transparent); }
.kpi-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.kpi-label { overflow: hidden; color: var(--muted); font-size: 0.68rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.kpi-value { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.45rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
.kpi-value small { margin-left: 5px; color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 500; }

/* =========================================================
   TARJETAS
========================================================= */
.panel { position: relative; min-width: 0; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--line); border-radius: var(--app-border-radius, 16px); background: var(--card); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
.panel::before { content: ''; position: absolute; z-index: 2; top: 0; left: 0; right: 0; height: 2px; pointer-events: none; opacity: 0.8; }
.accent-amber::before { background: linear-gradient(90deg, transparent, var(--amber), transparent); }
.accent-blue::before { background: linear-gradient(90deg, transparent, var(--accent), transparent); }

.panel-head { display: flex; align-items: center; gap: 13px; padding: 20px 22px 18px; border-bottom: 1px solid var(--line-soft); background: linear-gradient(180deg, color-mix(in srgb, var(--text) 2.5%, transparent), transparent); }
.head-badge { width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, var(--amber) 26%, transparent); border-radius: 11px; background: color-mix(in srgb, var(--amber) 8%, transparent); font-size: 1.15rem; line-height: 1; }
.head-badge.badge-blue { border-color: color-mix(in srgb, var(--accent) 26%, transparent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.head-text { min-width: 0; flex: 1; }
.head-text h2 { margin: 0 0 4px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; }
.head-text p { margin: 0; color: var(--muted); font-size: 0.74rem; line-height: 1.45; }
.hl { color: var(--accent); }
.accent-amber .hl { color: var(--amber); }
.head-counter { flex-shrink: 0; padding: 5px 11px; border: 1px solid color-mix(in srgb, var(--amber) 26%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--amber) 8%, transparent); color: var(--amber); font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 600; line-height: 1; }
.head-counter small { color: var(--muted); font-size: 0.66rem; font-weight: 500; }

.panel-body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 12px; padding: 18px; }

/* =========================================================
   FILAS CON INTERRUPTOR
========================================================= */
.rule-row { position: relative; min-width: 0; display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; align-items: flex-start; gap: 14px; padding: 14px 15px; border: 1px solid var(--line-soft); border-radius: 12px; background: color-mix(in srgb, var(--text) 1.5%, transparent); transition: border-color 0.18s ease, background 0.18s ease; }
.rule-row:hover { border-color: color-mix(in srgb, var(--text) 20%, transparent); }
.rule-row.is-on { border-color: color-mix(in srgb, var(--amber) 24%, var(--line)); background: linear-gradient(90deg, color-mix(in srgb, var(--amber) 6%, transparent), transparent 62%); }
.rule-row.is-on::before { content: ''; position: absolute; top: 12px; bottom: 12px; left: -1px; width: 3px; border-radius: 0 3px 3px 0; background: var(--amber); }
.rule-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--line); border-radius: 11px; background: color-mix(in srgb, var(--text) 3%, transparent); font-size: 1.05rem; line-height: 1; filter: grayscale(1); opacity: 0.7; transition: filter 0.18s ease, opacity 0.18s ease; }
.rule-row.is-on .rule-icon { border-color: color-mix(in srgb, var(--amber) 24%, transparent); background: color-mix(in srgb, var(--amber) 8%, transparent); filter: none; opacity: 1; }
.rule-text { min-width: 0; }
.rule-text h4 { margin: 2px 0 3px; color: var(--title); font-size: 0.84rem; font-weight: 600; line-height: 1.3; }
.rule-text p { margin: 0; color: var(--muted); font-size: 0.71rem; line-height: 1.5; }

/* Interruptor */
.toggle-switch { position: relative; width: 44px; height: 25px; margin-top: 7px; display: inline-flex; flex-shrink: 0; cursor: pointer; }
.toggle-switch input { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.toggle-track { position: absolute; inset: 0; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, var(--input)); transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.toggle-knob { position: absolute; top: 3px; left: 3px; width: 17px; height: 17px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); transition: transform 0.2s ease; }
.toggle-switch input:checked + .toggle-track { border-color: var(--amber); background: var(--amber); }
.toggle-switch input:checked + .toggle-track .toggle-knob { transform: translateX(19px); }
.toggle-switch input:focus-visible + .toggle-track { box-shadow: 0 0 0 3px color-mix(in srgb, var(--amber) 22%, transparent); }

/* =========================================================
   PLAZOS
========================================================= */
.timing-block { display: flex; flex-direction: column; gap: 12px; padding: 14px 15px; border: 1px solid var(--line-soft); border-radius: 12px; background: color-mix(in srgb, var(--text) 1.5%, transparent); }
.timing-info h4 { margin: 0 0 3px; color: var(--title); font-size: 0.84rem; font-weight: 600; }
.timing-info p { margin: 0; color: var(--muted); font-size: 0.71rem; line-height: 1.5; }
.timing-control { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.counter { display: inline-grid; grid-template-columns: 38px minmax(86px, auto) 38px; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 11px; background: var(--input); }
.btn-counter { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; padding: 0; border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent); font-family: 'IBM Plex Mono', monospace; font-size: 1.15rem; font-weight: 600; line-height: 1; cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease; }
.btn-counter:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 17%, transparent); transform: translateY(-1px); }
.btn-counter:active:not(:disabled) { transform: scale(0.94); }
.btn-counter:disabled { opacity: 0.3; cursor: not-allowed; }
.counter-value { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.counter-number { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 1.5rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.counter-unit { color: var(--muted); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

.chip-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.chip-row.left { margin-top: 10px; }
.chip-btn { min-width: 38px; height: 32px; padding: 0 11px; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--text); font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease; }
.chip-btn:hover { border-color: color-mix(in srgb, var(--amber) 55%, transparent); color: var(--amber); }
.chip-btn.active { border-color: var(--amber); background: color-mix(in srgb, var(--amber) 14%, transparent); color: var(--amber); }
.chip-suffix { color: var(--muted); font-size: 0.68rem; font-weight: 500; }

/* Línea de tiempo */
.timeline { padding: 15px; border: 1px dashed var(--line); border-radius: 12px; background: color-mix(in srgb, var(--input) 60%, transparent); }
.timeline-title { display: block; margin-bottom: 14px; color: var(--muted); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
.timeline-steps { position: relative; margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.timeline-steps::before { content: ''; position: absolute; top: 13px; left: 14%; right: 14%; height: 2px; background: linear-gradient(90deg, var(--green), var(--amber), var(--red)); opacity: 0.55; }
.tl-step { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; min-width: 0; }
.tl-dot { z-index: 1; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--card); border-radius: 50%; color: #0b0d0f; font-size: 0.72rem; font-weight: 800; }
.tl-due .tl-dot { background: var(--green); }
.tl-grace .tl-dot { background: var(--amber); }
.tl-inactive .tl-dot { background: var(--red); }
.tl-day { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; font-weight: 600; }
.tl-step strong { color: var(--text); font-size: 0.7rem; font-weight: 600; line-height: 1.25; }
.tl-step small { color: var(--muted); font-size: 0.62rem; line-height: 1.3; }

/* =========================================================
   FORMULARIO DE RECARGO
========================================================= */
.field { min-width: 0; width: 100%; display: flex; flex-direction: column; gap: 7px; }
.field label { color: var(--color-etiquetas, var(--color-texto-general, #cbd5e1)); font-size: 0.72rem; font-weight: 600; line-height: 1.3; }
.select-wrap, .money { position: relative; width: 100%; }
.money { display: flex; align-items: center; }
.custom-select, .custom-input { width: 100%; height: 44px; padding: 0 13px; border: 1px solid var(--line); border-radius: 10px; background: var(--input); color: var(--color-texto-input, var(--text)); font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 500; outline: none; transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.custom-select:hover, .custom-input:hover { border-color: color-mix(in srgb, var(--text) 26%, transparent); }
.custom-select:focus, .custom-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent); }
.custom-select { padding-right: 38px; appearance: none; -webkit-appearance: none; color-scheme: dark; cursor: pointer; }
.custom-select option { background: #111315; color: #ffffff; }
.select-chevron { position: absolute; top: 50%; right: 14px; color: var(--muted); font-size: 0.85rem; pointer-events: none; transform: translateY(-50%); }
.money-symbol { position: absolute; z-index: 2; left: 13px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 600; pointer-events: none; }
.money .custom-input { padding-left: 28px; }
.custom-input.mono { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-variant-numeric: tabular-nums; }
.custom-input.is-warn { border-color: color-mix(in srgb, var(--red) 70%, transparent); }
.custom-input.is-warn:focus { border-color: var(--red); box-shadow: 0 0 0 3px color-mix(in srgb, var(--red) 16%, transparent); }
.custom-input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
.custom-input[type='number']::-webkit-inner-spin-button, .custom-input[type='number']::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }

.fine-card { display: flex; flex-direction: column; gap: 14px; padding: 14px; border: 1px solid var(--line-soft); border-radius: 12px; background: color-mix(in srgb, var(--text) 1.5%, transparent); }
.fine-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.note { margin: 0; color: var(--muted); font-size: 0.68rem; line-height: 1.45; }
.note.danger { color: var(--red); }

.ratio { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; }
.ratio-track { height: 6px; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--text) 8%, transparent); }
.ratio-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #ffffff)); transition: width 0.35s ease, background 0.25s ease; }
.ratio-label { min-width: 36px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; font-weight: 600; text-align: right; }
.ratio.level-warn .ratio-fill { background: linear-gradient(90deg, var(--amber), color-mix(in srgb, var(--amber) 70%, #ffffff)); }
.ratio.level-warn .ratio-label { color: var(--amber); }
.ratio.level-danger .ratio-fill { background: linear-gradient(90deg, var(--red), color-mix(in srgb, var(--red) 70%, #ffffff)); }
.ratio.level-danger .ratio-label { color: var(--red); }

/* =========================================================
   VISTA PREVIA
========================================================= */
.preview-summary { display: flex; flex-wrap: wrap; gap: 8px; }
.pill { padding: 5px 11px; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--text); font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.ms-table { overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: var(--input); }
.ms-row { display: grid; grid-template-columns: 0.5fr 0.7fr 1fr 1.5fr; align-items: center; gap: 10px; padding: 11px 15px; border-bottom: 1px solid var(--line-soft); color: var(--text); font-size: 0.74rem; font-variant-numeric: tabular-nums; }
.ms-row:last-child { border-bottom: 0; }
.ms-head { padding-top: 9px; padding-bottom: 9px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--muted); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.ms-day { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
.ms-amount { color: var(--amber); font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
.ms-amount.zero { color: var(--muted); }
.ms-pct { display: flex; align-items: center; gap: 8px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; }
.ms-bar { height: 5px; min-width: 30px; flex: 1; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, transparent); }
.ms-bar-fill { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
.ms-bar-fill.full { background: var(--red); }

/* =========================================================
   ACCIONES
========================================================= */
.actions-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 14px 18px; border: 1px solid var(--line); border-radius: var(--app-border-radius, 16px); background: var(--card); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
.actions-options { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.actions-main { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.actions-note { max-width: 320px; color: var(--muted); font-size: 0.68rem; line-height: 1.4; }
.check { display: inline-flex; align-items: center; gap: 9px; color: var(--text); font-size: 0.76rem; font-weight: 500; cursor: pointer; }
.check input { position: absolute; opacity: 0; pointer-events: none; }
.check-box { width: 20px; height: 20px; flex-shrink: 0; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 6px; background: var(--input); transition: background 0.16s ease, border-color 0.16s ease; }
.check input:checked + .check-box { border-color: var(--accent); background: var(--accent); }
.check input:checked + .check-box::after { content: '✓'; color: #ffffff; font-size: 0.78rem; font-weight: 800; line-height: 1; }
.check input:focus-visible + .check-box { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
.btn-ghost { min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--text); font-family: inherit; font-size: 0.74rem; font-weight: 600; cursor: pointer; transition: border-color 0.16s ease, background 0.16s ease; }
.btn-ghost:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
.btn-primary-action { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 24px; border: 1px solid color-mix(in srgb, var(--accent) 80%, transparent); border-radius: 10px; background: var(--color-botones, var(--accent)); color: var(--color-texto-botones, #ffffff); font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 650; cursor: pointer; box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 18%, transparent); transition: filter 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
.btn-primary-action:hover:not(:disabled) { filter: brightness(1.08); box-shadow: 0 9px 22px color-mix(in srgb, var(--accent) 26%, transparent); transform: translateY(-1px); }
.btn-primary-action:disabled { opacity: 0.55; cursor: not-allowed; }

/* NOTIFICACIONES */
:deep(.notification-container), :deep(.toast-container) { width: calc(100% - 32px) !important; max-width: 480px !important; box-sizing: border-box !important; left: 50% !important; right: auto !important; margin: 0 auto !important; transform: translateX(-50%) !important; }

.btn-counter:focus-visible, .btn-primary-action:focus-visible, .btn-ghost:focus-visible, .chip-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* =========================================================
   TABLET: una columna
========================================================= */
@media (max-width: 1050px) {
  .main-content-promos {
    max-width: 760px;
    padding: 26px 24px 48px;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'head' 'kpis' 'rules' 'timing' 'fine' 'preview' 'notices' 'actions';
  }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* =========================================================
   MÓVIL
========================================================= */
@media (max-width: 600px) {
  .main-content-promos { gap: 14px; padding: 18px 12px 36px; overflow-x: hidden; }
  .page-title { font-size: 1.35rem; }
  .page-description { font-size: 0.71rem; }

  .kpi-grid { gap: 10px; }
  .kpi-card { gap: 10px; padding: 12px; }
  .kpi-icon { width: 36px; height: 36px; border-radius: 10px; font-size: 1rem; }
  .kpi-value { font-size: 1.18rem; }

  .panel { border-radius: 14px; }
  .panel-head { padding: 16px; gap: 10px; }
  .head-badge { width: 38px; height: 38px; border-radius: 10px; }
  .head-text h2 { font-size: 1rem; }
  .head-text p { font-size: 0.69rem; }
  .head-counter { padding: 4px 9px; font-size: 0.74rem; }
  .panel-body { gap: 10px; padding: 13px; }

  /* Fila de regla: icono + texto arriba, interruptor abajo a la derecha */
  .rule-row { grid-template-columns: 38px minmax(0, 1fr) auto; gap: 11px; padding: 13px 12px; }
  .rule-icon { width: 38px; height: 38px; }
  .rule-text h4 { font-size: 0.8rem; }
  .rule-text p { font-size: 0.68rem; }

  .timing-block { padding: 13px 12px; }
  .timing-control { flex-direction: column; align-items: stretch; }
  .counter { grid-template-columns: 42px 1fr 42px; }
  .btn-counter { width: 42px; height: 42px; }
  .chip-row { justify-content: center; }
  .chip-row.left { justify-content: flex-start; }
  .chip-btn { height: 34px; }

  .timeline { padding: 13px 10px; }
  .timeline-steps { gap: 6px; }
  .tl-step strong { font-size: 0.64rem; }
  .tl-step small { display: none; }

  .fine-card { padding: 12px; }
  .fine-grid { grid-template-columns: 1fr; gap: 13px; }
  .custom-select, .custom-input { height: 46px; font-size: 1rem; }

  .ms-row { grid-template-columns: 0.5fr 0.7fr 1.1fr 1.3fr; gap: 6px; padding: 10px 11px; font-size: 0.68rem; }

  /* Barra de acciones fija abajo para guardar siempre a la mano */
  .actions-bar { position: sticky; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 15; flex-direction: column; align-items: stretch; gap: 12px; padding: 12px; background: color-mix(in srgb, var(--card) 94%, transparent); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: 0 -10px 30px -12px rgba(0, 0, 0, 0.65); }
  .actions-options { justify-content: space-between; }
  .actions-main { flex-direction: column; align-items: stretch; gap: 10px; }
  .actions-note { max-width: none; text-align: center; }
  .btn-primary-action { width: 100%; min-height: 48px; }
  .btn-ghost { flex: 1; }
}

@media (max-width: 390px) {
  .main-content-promos { padding-right: 9px; padding-left: 9px; }
  .head-counter { display: none; }
  .ms-bar { display: none; }
  .actions-options { flex-direction: column; align-items: stretch; }
}

@media (prefers-reduced-motion: reduce) {
  .rule-row, .toggle-track, .toggle-knob, .btn-counter, .custom-select, .custom-input, .ratio-fill, .btn-primary-action, .chip-btn { transition: none !important; }
}
</style>