<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';

const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');

const extraTexts = {
  es: {
    fp_pageTitle: 'GESTIÓN DE',
    fp_pageHighlight: 'MOROSIDAD Y RECARGOS',
    fp_pageSubtitle:
      'Configura estados de morosidad, períodos de gracia, recargos, límites y notificaciones de pago.',
    fp_kpiRules: 'Reglas activas',
    fp_kpiGrace: 'Período de gracia',
    fp_kpiFine: 'Multa base',
    fp_kpiCap: 'Tope máximo',
    fp_days: 'días',
    fp_remTitle1: 'Avisos al',
    fp_remTitleHl: 'socio',
    fp_remSubtitle: 'Comunica vencimientos y recargos de forma automática.',
    fp_remBefore: 'Recordatorio antes del vencimiento',
    fp_remBeforeDesc: 'Envía un aviso por correo antes de que venza el pago.',
    fp_daysBefore: 'días antes',
    fp_notifyFine: 'Notificar al aplicar una multa',
    fp_notifyFineDesc:
      'El socio recibe un mensaje cada vez que se genera un recargo.',
    fp_noteNoCap: 'Sin tope: las multas pueden acumularse sin límite.',
    fp_warnExceeds: 'La multa base supera el tope máximo.',
    fp_invalidFine: 'La multa base no puede ser mayor que el tope máximo.',
    fp_invalidValues: 'Los montos no pueden ser negativos.'
  },
  en: {
    fp_pageTitle: 'DELINQUENCY &',
    fp_pageHighlight: 'LATE FEE MANAGEMENT',
    fp_pageSubtitle:
      'Configure delinquency statuses, grace periods, late fees, limits and payment notifications.',
    fp_kpiRules: 'Active rules',
    fp_kpiGrace: 'Grace period',
    fp_kpiFine: 'Base fine',
    fp_kpiCap: 'Maximum cap',
    fp_days: 'days',
    fp_remTitle1: 'Member',
    fp_remTitleHl: 'notices',
    fp_remSubtitle: 'Communicate due dates and charges automatically.',
    fp_remBefore: 'Reminder before due date',
    fp_remBeforeDesc: 'Sends an email notice before payment is due.',
    fp_daysBefore: 'days before',
    fp_notifyFine: 'Notify when a fine is applied',
    fp_notifyFineDesc:
      'The member receives a message every time a charge is generated.',
    fp_noteNoCap: 'No cap: fines can accumulate without limit.',
    fp_warnExceeds: 'The base fine exceeds the maximum cap.',
    fp_invalidFine: 'The base fine cannot exceed the maximum cap.',
    fp_invalidValues: 'Amounts cannot be negative.'
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

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
});

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

const notify = (message, type = 'success') => {
  toastRef.value?.notify?.(message, type);
};

const selectedSede = ref(sessionStorage.getItem('selected_sede_id') || '');
const loading = ref(false);
const saving = ref(false);
const aplicarTodas = ref(false);
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = `${base}${base.endsWith('/api') ? '' : '/api'}/gym/morosidad`;

const request = async (path = '', options = {}) => {
  const token = sessionStorage.getItem('auth_token');
  if (!token) throw new Error('Sesión no iniciada.');
  const r = await fetch(`${api}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(
      data.message ||
        Object.values(data.errors || {}).flat().join(' ') ||
        `Error HTTP ${r.status}`
    );
  return data;
};

const resolveSede = () => {
  selectedSede.value = sessionStorage.getItem('selected_sede_id') || '';
  if (!selectedSede.value) {
    try {
      const acc = JSON.parse(sessionStorage.getItem('gym_account') || '{}');
      selectedSede.value = String((acc.usuario || acc).sedes?.[0]?.ID_Sede || '');
    } catch {}
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
  if (!selectedSede.value) return notify('Selecciona una sucursal.', 'error');
  const fine = Number(settings.value.fineAmount);
  const cap = Number(settings.value.maxFineLimit);
  if (!Number.isFinite(fine) || !Number.isFinite(cap) || fine < 0 || cap < 0)
    return notify(t('fp_invalidValues'), 'error');
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
  if (!selectedSede.value) return notify('Selecciona una sucursal.', 'error');
  if (!window.confirm('¿Copiar la configuración actual de esta sede a todas las demás?'))
    return;
  try {
    await request('/copiar-sedes', {
      method: 'POST',
      body: JSON.stringify({ sede_id: Number(selectedSede.value) })
    });
    notify('Configuración copiada a todas las sucursales.', 'success');
  } catch (e) {
    notify(e.message, 'error');
  }
};

const handleBranchChange = () => {
  clearTimeout(timer);
  cargarConfiguracion();
};

onMounted(() => {
  window.addEventListener('factorfit:branch-changed', handleBranchChange);
  cargarConfiguracion();
});
onUnmounted(() => {
  clearTimeout(timer);
  window.removeEventListener('factorfit:branch-changed', handleBranchChange);
});

const incrementDays = () => {
  graceDays.value++;
  guardarCambiosRapidos();
};
const decrementDays = () => {
  if (graceDays.value <= 0) return;
  graceDays.value--;
  guardarCambiosRapidos();
};

const gracePresets = [0, 3, 5, 7, 15];
const inactivePresets = [0, 3, 5, 7, 15, 30];

const setInactiveDays = (days) => {
  inactiveDays.value = days;
  guardarCambiosRapidos();
};
const incInactive = () => setInactiveDays(Math.min(365, inactiveDays.value + 1));
const decInactive = () => setInactiveDays(Math.max(0, inactiveDays.value - 1));

const setGrace = (days) => {
  if (graceDays.value === days) return;
  graceDays.value = days;
  guardarCambiosRapidos();
};

const remindPresets = [1, 3, 5, 7];
const setRemindDays = (days) => {
  if (settings.value.remindDays === days) return;
  settings.value.remindDays = days;
  guardarCambiosRapidos();
};

const fmt = (number) => {
  const value = Number(number) || 0;
  return (
    '$' +
    value.toLocaleString(currentLang.value === 'en' ? 'en-US' : 'es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  );
};

const activeRules = computed(
  () =>
    [
      settings.value.pendingStatus,
      settings.value.inactiveStatus,
      settings.value.blockTurnstile
    ].filter(Boolean).length
);

const fineValue = computed(() => Math.max(Number(settings.value.fineAmount) || 0, 0));
const capValue = computed(() => Math.max(Number(settings.value.maxFineLimit) || 0, 0));

const finePercent = computed(() => {
  if (capValue.value <= 0) return 0;
  return Math.min(Math.round((fineValue.value / capValue.value) * 100), 100);
});

const fineExceedsLimit = computed(
  () => capValue.value > 0 && fineValue.value > capValue.value
);

const fineLevel = computed(() => {
  if (fineExceedsLimit.value || finePercent.value >= 90) return 'danger';
  if (finePercent.value >= 60) return 'warn';
  return 'ok';
});
</script>

<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <main class="mor-page">
      <!-- ENCABEZADO -->
      <header class="mor-heading">
        <h1 class="mor-title">
          {{ t('fp_pageTitle') }}
          <span>{{ t('fp_pageHighlight') }}</span>
        </h1>
        <p class="mor-description">{{ t('fp_pageSubtitle') }}</p>
      </header>

      <!-- KPIs -->
      <section class="kpi-grid">
        <article class="kpi-card">
          <span class="kpi-icon amber"><i class="bi bi-shield-check"></i></span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiRules') }}</span>
            <strong class="kpi-value">{{ activeRules }}<small>/3</small></strong>
          </div>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon amber"><i class="bi bi-clock-history"></i></span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiGrace') }}</span>
            <strong class="kpi-value">{{ graceDays }}<small>{{ t('fp_days') }}</small></strong>
          </div>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon blue"><i class="bi bi-cash-coin"></i></span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiFine') }}</span>
            <strong class="kpi-value">{{ fmt(fineValue) }}</strong>
          </div>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon red"><i class="bi bi-bar-chart-line"></i></span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiCap') }}</span>
            <strong class="kpi-value">{{ capValue > 0 ? fmt(capValue) : '∞' }}</strong>
          </div>
        </article>
      </section>

      <!-- COLUMNAS PRINCIPALES -->
      <div class="mor-columns">
        <!-- REGLAS -->
        <section class="card accent-amber" id="tutorial-step-0">
          <header class="card-header">
            <span class="badge-icon"><i class="bi bi-exclamation-triangle"></i></span>
            <div class="card-header-text">
              <h2>
                {{ t('delinquencyRulesTitlePart1') }}
                <span class="highlight">{{ t('delinquencyRulesTitleHighlight') }}</span>
              </h2>
              <p>{{ t('delinquencyRulesSubtitle') }}</p>
            </div>
            <span class="counter-pill">{{ activeRules }}<small>/3</small></span>
          </header>

          <div class="card-body">
            <div class="row" :class="{ 'is-on': settings.pendingStatus }">
              <span class="row-icon"><i class="bi bi-hourglass-split"></i></span>
              <div class="row-text">
                <h4>{{ t('statusPendingTitle') }}</h4>
                <p>{{ t('statusPendingDesc') }}</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.pendingStatus" @change="guardarCambiosRapidos" />
                <span class="switch-track"><span class="switch-knob"></span></span>
              </label>
            </div>

            <div class="row" :class="{ 'is-on': settings.inactiveStatus }">
              <span class="row-icon"><i class="bi bi-person-x"></i></span>
              <div class="row-text">
                <h4>{{ t('statusInactiveTitle') }}</h4>
                <p>{{ t('statusInactiveDesc') }}</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.inactiveStatus" @change="guardarCambiosRapidos" />
                <span class="switch-track"><span class="switch-knob"></span></span>
              </label>
            </div>

            <div class="row" :class="{ 'is-on': settings.blockTurnstile }">
              <span class="row-icon"><i class="bi bi-lock"></i></span>
              <div class="row-text">
                <h4>{{ t('turnstileBlockTitle') }}</h4>
                <p>{{ t('turnstileBlockDesc') }}</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.blockTurnstile" @change="guardarCambiosRapidos" />
                <span class="switch-track"><span class="switch-knob"></span></span>
              </label>
            </div>

            <!-- Gracia -->
            <div class="row stacked">
              <div class="row-head">
                <span class="row-icon"><i class="bi bi-clock"></i></span>
                <div class="row-text">
                  <h4>{{ t('gracePeriodTitle') }}</h4>
                  <p>{{ t('gracePeriodDesc') }}</p>
                </div>
              </div>

              <div class="stepper">
                <button class="step-btn" type="button" :disabled="graceDays === 0" @click="decrementDays" aria-label="-1">
                  <i class="bi bi-dash-lg"></i>
                </button>
                <div class="step-value">
                  <span class="num">{{ graceDays }}</span>
                  <span class="lbl">{{ t('daysDisplayLabel') }}</span>
                </div>
                <button class="step-btn" type="button" @click="incrementDays" aria-label="+1">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <div class="chips">
                <button
                  v-for="d in gracePresets"
                  :key="'gp-' + d"
                  type="button"
                  class="chip"
                  :class="{ active: graceDays === d }"
                  @click="setGrace(d)"
                >{{ d }}</button>
              </div>
            </div>

            <!-- Inactivo -->
            <div class="row stacked">
              <div class="row-head">
                <span class="row-icon"><i class="bi bi-calendar-x"></i></span>
                <div class="row-text">
                  <h4>{{ currentLang === 'en' ? 'Days after grace before deactivation' : 'Plazo para pasar a inactivo' }}</h4>
                  <p>
                    {{ currentLang === 'en'
                      ? 'Additional days after the grace period. If there is still no payment, the membership becomes inactive.'
                      : 'Días adicionales después de la tolerancia. Si no se ha pagado, la membresía pasa a Inactivo.' }}
                  </p>
                </div>
              </div>

              <div class="stepper">
                <button class="step-btn" type="button" :disabled="inactiveDays === 0" @click="decInactive" aria-label="-1">
                  <i class="bi bi-dash-lg"></i>
                </button>
                <div class="step-value">
                  <span class="num">{{ inactiveDays }}</span>
                  <span class="lbl">{{ t('fp_days') }}</span>
                </div>
                <button class="step-btn" type="button" :disabled="inactiveDays >= 365" @click="incInactive" aria-label="+1">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <div class="chips">
                <button
                  v-for="d in inactivePresets"
                  :key="'iv-' + d"
                  type="button"
                  class="chip"
                  :class="{ active: inactiveDays === d }"
                  @click="setInactiveDays(d)"
                >{{ d }}</button>
              </div>

              <p class="note info">
                <i class="bi bi-info-circle"></i>
                {{ currentLang === 'en'
                  ? 'Grace: ' + graceDays + ' days. Deactivation: ' + inactiveDays + ' additional days. The fee applies only after grace.'
                  : 'Tolerancia: ' + graceDays + ' días. Inactivo: ' + inactiveDays + ' días adicionales. El recargo comienza después de la tolerancia.' }}
              </p>
            </div>
          </div>
        </section>

        <!-- COSTO Y FRECUENCIA -->
        <section class="card accent-blue" id="tutorial-step-1">
          <header class="card-header">
            <span class="badge-icon blue"><i class="bi bi-currency-dollar"></i></span>
            <div class="card-header-text">
              <h2>
                {{ t('costFrequencyTitlePart1') }}
                <span class="highlight">{{ t('costFrequencyTitleHighlight') }}</span>
              </h2>
              <p>{{ t('costFrequencySubtitle') }}</p>
            </div>
          </header>

          <div class="card-body form-body">
            <div class="field">
              <label>{{ t('affectedServiceLabel') }}</label>
              <div class="select-wrap">
                <select v-model="settings.paymentType" class="control">
                  <option value="membresia">{{ t('serviceMembershipOption') }}</option>
                  <option value="clases">{{ t('serviceClassesOption') }}</option>
                  <option value="taquilla">{{ t('serviceLockerOption') }}</option>
                  <option value="todos">{{ t('serviceAllOption') }}</option>
                </select>
                <i class="bi bi-chevron-down select-chevron"></i>
              </div>
            </div>

            <div class="fine-card">
              <div class="fine-grid">
                <div class="field">
                  <label>{{ t('fineAmountLabel') }}</label>
                  <div class="money">
                    <span class="money-sign">$</span>
                    <input
                      type="number"
                      inputmode="decimal"
                      min="0"
                      v-model.number="settings.fineAmount"
                      class="control mono"
                      :class="{ 'is-warn': fineExceedsLimit }"
                    />
                  </div>
                </div>

                <div class="field">
                  <label>{{ t('maxFineLimitLabel') }}</label>
                  <div class="money">
                    <span class="money-sign">$</span>
                    <input
                      type="number"
                      inputmode="decimal"
                      min="0"
                      v-model.number="settings.maxFineLimit"
                      class="control mono"
                    />
                  </div>
                </div>
              </div>

              <div class="ratio" :class="'level-' + fineLevel" aria-hidden="true">
                <div class="ratio-track"><div class="ratio-fill" :style="{ width: finePercent + '%' }"></div></div>
                <span class="ratio-label">{{ finePercent }}%</span>
              </div>

              <p v-if="fineExceedsLimit" class="note danger">
                <i class="bi bi-exclamation-circle"></i> {{ t('fp_warnExceeds') }}
              </p>
              <p v-else-if="capValue <= 0" class="note">
                <i class="bi bi-infinity"></i> {{ t('fp_noteNoCap') }}
              </p>
            </div>

            <div class="field">
              <label>{{ t('recurrenceLabel') }}</label>
              <div class="select-wrap">
                <select v-model="settings.recurrence" class="control">
                  <option value="unica">{{ t('recurrenceSingleOption') }}</option>
                  <option value="diaria">{{ t('recurrenceDailyOption') }}</option>
                  <option value="semanal">{{ t('recurrenceWeeklyOption') }}</option>
                  <option value="mensual">{{ t('recurrenceMonthlyOption') }}</option>
                </select>
                <i class="bi bi-chevron-down select-chevron"></i>
              </div>
            </div>

            <!-- Sedes -->
            <div class="sync-box">
              <label class="check">
                <input type="checkbox" v-model="aplicarTodas" />
                <span class="check-box"><i class="bi bi-check-lg"></i></span>
                <span class="check-text">Aplicar esta configuración a todas las sedes</span>
              </label>
              <button type="button" class="btn-ghost" @click="copiarSedes">
                <i class="bi bi-copy"></i> Copiar a todas las sedes
              </button>
            </div>

            <button type="button" class="btn-primary" :disabled="saving || loading" @click="guardarConfiguracionGeneral">
              <i class="bi bi-floppy"></i>
              {{ t('saveConfigurationBtn') }}
            </button>
          </div>
        </section>
      </div>

      <!-- AVISOS -->
      <section class="card accent-amber">
        <header class="card-header">
          <span class="badge-icon"><i class="bi bi-bell"></i></span>
          <div class="card-header-text">
            <h2>{{ t('fp_remTitle1') }} <span class="highlight">{{ t('fp_remTitleHl') }}</span></h2>
            <p>{{ t('fp_remSubtitle') }}</p>
          </div>
        </header>

        <div class="card-body notice-grid">
          <div class="row top" :class="{ 'is-on': settings.remindBefore }">
            <span class="row-icon"><i class="bi bi-calendar-event"></i></span>
            <div class="row-text">
              <h4>{{ t('fp_remBefore') }}</h4>
              <p>{{ t('fp_remBeforeDesc') }}</p>
              <div v-if="settings.remindBefore" class="chips left">
                <button
                  v-for="d in remindPresets"
                  :key="'rp-' + d"
                  type="button"
                  class="chip"
                  :class="{ active: settings.remindDays === d }"
                  @click="setRemindDays(d)"
                >{{ d }}</button>
                <span class="chip-suffix">{{ t('fp_daysBefore') }}</span>
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.remindBefore" @change="guardarCambiosRapidos" />
              <span class="switch-track"><span class="switch-knob"></span></span>
            </label>
          </div>

          <div class="row top" :class="{ 'is-on': settings.notifyFine }">
            <span class="row-icon"><i class="bi bi-envelope"></i></span>
            <div class="row-text">
              <h4>{{ t('fp_notifyFine') }}</h4>
              <p>{{ t('fp_notifyFineDesc') }}</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.notifyFine" @change="guardarCambiosRapidos" />
              <span class="switch-track"><span class="switch-knob"></span></span>
            </label>
          </div>
        </div>
      </section>
    </main>
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

/* ================= BASE ================= */
.mor-page {
  --accent: var(--color-highlight, #3b82f6);
  --amber: #f59e0b;
  --red: #f87171;
  --card: var(--bg-cards, #121416);
  --input: var(--bg-input, #0c0e10);
  --title: var(--color-titulos, #ffffff);
  --text: var(--color-texto-general, #e5e7eb);
  --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 62%, transparent);
  --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 15%, transparent);
  --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);
  --radius: var(--app-border-radius, 14px);

  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 32px 60px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
.mor-page *, .mor-page *::before, .mor-page *::after { box-sizing: border-box; }
.mor-page i.bi { line-height: 1; display: inline-block; }

/* ================= ENCABEZADO ================= */
.mor-heading { display: flex; flex-direction: column; gap: 8px; }
.mor-title {
  margin: 0; color: var(--title); font-family: 'Oswald', sans-serif;
  font-size: clamp(1.5rem, 2.4vw, 2.1rem); font-weight: 600; line-height: 1.1;
  letter-spacing: 0.03em; text-transform: uppercase;
}
.mor-title span { color: var(--accent); }
.mor-description { max-width: 720px; margin: 0; color: var(--muted); font-size: 0.82rem; line-height: 1.55; }

/* ================= KPIs ================= */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.kpi-card {
  min-width: 0; display: flex; align-items: center; gap: 14px; padding: 16px 18px;
  border: 1px solid var(--line); border-radius: var(--radius); background: var(--card);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
}
.kpi-icon {
  width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center;
  border: 1px solid; border-radius: 12px; font-size: 1.2rem;
}
.kpi-icon.amber { color: var(--amber); border-color: color-mix(in srgb, var(--amber) 30%, transparent); background: color-mix(in srgb, var(--amber) 10%, transparent); }
.kpi-icon.blue  { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 30%, transparent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
.kpi-icon.red   { color: var(--red); border-color: color-mix(in srgb, var(--red) 30%, transparent); background: color-mix(in srgb, var(--red) 10%, transparent); }
.kpi-copy { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.kpi-label { overflow: hidden; color: var(--muted); font-size: 0.7rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.kpi-value { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.55rem; font-weight: 600; line-height: 1; white-space: nowrap; }
.kpi-value small { margin-left: 5px; color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 500; }

/* ================= COLUMNAS ================= */
.mor-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; align-items: stretch; }

/* ================= TARJETAS ================= */
.card {
  position: relative; min-width: 0; display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--line); border-radius: var(--radius); background: var(--card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}
.card::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 2px; opacity: 0.85; pointer-events: none; }
.accent-amber::before { background: linear-gradient(90deg, transparent, var(--amber), transparent); }
.accent-blue::before  { background: linear-gradient(90deg, transparent, var(--accent), transparent); }

.card-header {
  display: flex; align-items: center; gap: 14px; padding: 20px 22px;
  border-bottom: 1px solid var(--line-soft);
  background: linear-gradient(180deg, color-mix(in srgb, var(--text) 3%, transparent), transparent);
}
.badge-icon {
  width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.2rem;
  color: var(--amber); border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent);
  border-radius: 12px; background: color-mix(in srgb, var(--amber) 9%, transparent);
}
.badge-icon.blue { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 28%, transparent); background: color-mix(in srgb, var(--accent) 9%, transparent); }
.card-header-text { min-width: 0; flex: 1; }
.card-header h2 {
  margin: 0 0 4px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.1rem;
  font-weight: 600; letter-spacing: 0.03em; line-height: 1.2; text-transform: uppercase;
}
.card-header p { margin: 0; color: var(--muted); font-size: 0.75rem; line-height: 1.45; }
.highlight { color: var(--accent); }
.accent-amber .highlight { color: var(--amber); }
.counter-pill {
  flex-shrink: 0; padding: 6px 12px; color: var(--amber); font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem; font-weight: 600; line-height: 1; border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent);
  background: color-mix(in srgb, var(--amber) 9%, transparent);
}
.counter-pill small { color: var(--muted); font-size: 0.68rem; }

.card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 20px; }
.form-body { gap: 18px; }

/* ================= FILAS ================= */
.row {
  position: relative; min-width: 0; display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  border: 1px solid var(--line-soft); border-radius: 12px;
  background: color-mix(in srgb, var(--text) 1.5%, transparent);
  transition: border-color 0.18s, background 0.18s;
}
.row:hover { border-color: color-mix(in srgb, var(--text) 20%, transparent); }
.row.top { align-items: flex-start; }
.row.is-on { border-color: color-mix(in srgb, var(--amber) 26%, var(--line)); background: linear-gradient(90deg, color-mix(in srgb, var(--amber) 7%, transparent), transparent 65%); }
.row.is-on::before { content: ''; position: absolute; top: 12px; bottom: 12px; left: -1px; width: 3px; border-radius: 0 3px 3px 0; background: var(--amber); }
.row.stacked { flex-direction: column; align-items: stretch; gap: 14px; }
.row-head { display: flex; align-items: flex-start; gap: 14px; }

.row-icon {
  width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.05rem;
  color: var(--muted); border: 1px solid var(--line); border-radius: 10px;
  background: color-mix(in srgb, var(--text) 3%, transparent); transition: all 0.18s;
}
.row.is-on .row-icon { color: var(--amber); border-color: color-mix(in srgb, var(--amber) 26%, transparent); background: color-mix(in srgb, var(--amber) 9%, transparent); }
.row-text { min-width: 0; flex: 1; }
.row-text h4 { margin: 0 0 3px; color: var(--title); font-size: 0.85rem; font-weight: 600; line-height: 1.3; }
.row-text p { margin: 0; color: var(--muted); font-size: 0.72rem; line-height: 1.5; }

/* ================= SWITCH ================= */
.switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; display: inline-flex; cursor: pointer; }
.switch input { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.switch-track { position: absolute; inset: 0; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, var(--input)); transition: all 0.2s; }
.switch-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); transition: transform 0.2s; }
.switch input:checked + .switch-track { border-color: var(--amber); background: var(--amber); }
.switch input:checked + .switch-track .switch-knob { transform: translateX(20px); }
.switch input:focus-visible + .switch-track { box-shadow: 0 0 0 3px color-mix(in srgb, var(--amber) 25%, transparent); }

/* ================= STEPPER Y CHIPS ================= */
.stepper {
  display: grid; grid-template-columns: 42px 1fr 42px; align-items: center; gap: 12px;
  padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--input);
}
.step-btn {
  width: 42px; height: 42px; display: grid; place-items: center; padding: 0; font-size: 1rem; cursor: pointer;
  color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 10px; background: color-mix(in srgb, var(--accent) 9%, transparent);
  transition: all 0.16s;
}
.step-btn:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 18%, transparent); transform: translateY(-1px); }
.step-btn:active:not(:disabled) { transform: scale(0.94); }
.step-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.step-value { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.step-value .num { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 1.6rem; font-weight: 600; line-height: 1; }
.step-value .lbl { color: var(--muted); font-size: 0.62rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

.chips { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; }
.chips.left { justify-content: flex-start; margin-top: 12px; }
.chip {
  min-width: 42px; height: 32px; padding: 0 12px; cursor: pointer; color: var(--text);
  font-family: 'IBM Plex Mono', monospace; font-size: 0.74rem; font-weight: 600;
  border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--text) 3%, transparent);
  transition: all 0.16s;
}
.chip:hover { color: var(--amber); border-color: color-mix(in srgb, var(--amber) 55%, transparent); }
.chip.active { color: var(--amber); border-color: var(--amber); background: color-mix(in srgb, var(--amber) 14%, transparent); }
.chip-suffix { color: var(--muted); font-size: 0.7rem; }

/* ================= NOTAS ================= */
.note { display: flex; align-items: flex-start; gap: 8px; margin: 0; color: var(--muted); font-size: 0.7rem; line-height: 1.5; }
.note i { margin-top: 2px; flex-shrink: 0; }
.note.info { padding: 10px 12px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 7%, transparent); color: var(--text); }
.note.info i { color: var(--accent); }
.note.danger { color: var(--red); }

/* ================= FORMULARIO ================= */
.field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.field label { color: var(--color-etiquetas, var(--text)); font-size: 0.74rem; font-weight: 600; line-height: 1.3; }
.select-wrap, .money { position: relative; width: 100%; }
.money { display: flex; align-items: center; }
.control {
  width: 100%; height: 46px; padding: 0 14px; outline: none; color: var(--color-texto-input, var(--text));
  font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500;
  border: 1px solid var(--line); border-radius: 10px; background: var(--input);
  transition: border-color 0.18s, box-shadow 0.18s;
}
.control:hover { border-color: color-mix(in srgb, var(--text) 26%, transparent); }
.control:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent); }
.control.is-warn { border-color: color-mix(in srgb, var(--red) 70%, transparent); }
select.control { padding-right: 40px; appearance: none; -webkit-appearance: none; color-scheme: dark; cursor: pointer; }
select.control option { background: #111315; color: #fff; }
.select-chevron { position: absolute; top: 50%; right: 14px; color: var(--muted); font-size: 0.8rem; pointer-events: none; transform: translateY(-50%); }
.money-sign { position: absolute; left: 14px; z-index: 2; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.82rem; font-weight: 600; pointer-events: none; }
.money .control { padding-left: 30px; }
.control.mono { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-variant-numeric: tabular-nums; }
.control[type='number'] { -moz-appearance: textfield; appearance: textfield; }
.control[type='number']::-webkit-inner-spin-button,
.control[type='number']::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }

.fine-card { display: flex; flex-direction: column; gap: 14px; padding: 16px; border: 1px solid var(--line-soft); border-radius: 12px; background: color-mix(in srgb, var(--text) 1.5%, transparent); }
.fine-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.fine-grid .field { justify-content: flex-end; }
.fine-grid .field label { min-height: 2.6em; display: flex; align-items: flex-end; }

.ratio { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; }
.ratio-track { height: 6px; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, transparent); }
.ratio-fill { height: 100%; border-radius: inherit; background: var(--accent); transition: width 0.35s, background 0.25s; }
.ratio-label { min-width: 38px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; font-weight: 600; text-align: right; }
.ratio.level-warn .ratio-fill { background: var(--amber); }
.ratio.level-warn .ratio-label { color: var(--amber); }
.ratio.level-danger .ratio-fill { background: var(--red); }
.ratio.level-danger .ratio-label { color: var(--red); }

/* ================= SEDES ================= */
.sync-box {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding: 14px 16px; border: 1px dashed var(--line); border-radius: 12px;
  background: color-mix(in srgb, var(--text) 1.5%, transparent);
}
.check { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; position: relative; }
.check input { position: absolute; opacity: 0; width: 0; height: 0; }
.check-box {
  width: 20px; height: 20px; display: grid; place-items: center; flex-shrink: 0; color: transparent; font-size: 0.8rem;
  border: 1px solid var(--line); border-radius: 6px; background: var(--input); transition: all 0.16s;
}
.check input:checked + .check-box { color: #fff; border-color: var(--accent); background: var(--accent); }
.check input:focus-visible + .check-box { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent); }
.check-text { font-size: 0.76rem; font-weight: 500; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; cursor: pointer;
  color: var(--text); font-family: 'Inter', sans-serif; font-size: 0.74rem; font-weight: 600;
  border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--text) 3%, transparent);
  transition: all 0.16s;
}
.btn-ghost:hover { color: var(--accent); border-color: var(--accent); }

.btn-primary {
  width: 100%; min-height: 48px; margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 0 16px; cursor: pointer; color: var(--color-texto-botones, #fff);
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 650;
  border: 1px solid color-mix(in srgb, var(--accent) 80%, transparent); border-radius: 10px;
  background: var(--color-botones, var(--accent));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 20%, transparent);
  transition: filter 0.18s, box-shadow 0.18s, transform 0.18s;
}
.btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 9px 22px color-mix(in srgb, var(--accent) 28%, transparent); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* ================= AVISOS ================= */
.notice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }

/* ================= NOTIFICACIONES ================= */
:deep(.notification-container), :deep(.toast-container) {
  width: calc(100% - 32px) !important; max-width: 480px !important; left: 50% !important;
  right: auto !important; margin: 0 auto !important; transform: translateX(-50%) !important;
}

.step-btn:focus-visible, .btn-primary:focus-visible, .chip:focus-visible, .btn-ghost:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ================= RESPONSIVE ================= */
@media (max-width: 1050px) {
  .mor-page { max-width: 780px; padding: 26px 22px 48px; }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mor-columns { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .mor-page { gap: 16px; padding: 18px 12px 36px; overflow-x: hidden; }
  .mor-title { font-size: 1.35rem; }
  .mor-description { font-size: 0.74rem; }
  .kpi-grid { gap: 10px; }
  .kpi-card { gap: 10px; padding: 12px; }
  .kpi-icon { width: 36px; height: 36px; font-size: 1rem; }
  .kpi-value { font-size: 1.2rem; }
  .card-header { padding: 16px; gap: 11px; }
  .badge-icon { width: 38px; height: 38px; font-size: 1.05rem; }
  .card-header h2 { font-size: 1rem; }
  .card-body { padding: 13px; }
  .row { padding: 13px 12px; gap: 11px; }
  .row-icon { width: 34px; height: 34px; }
  .fine-grid { grid-template-columns: 1fr; }
  .fine-grid .field label { min-height: 0; }
  .notice-grid { grid-template-columns: 1fr; }
  .sync-box { flex-direction: column; align-items: stretch; }
  .btn-ghost { justify-content: center; }
}
@media (max-width: 390px) {
  .counter-pill { display: none; }
  .stepper { grid-template-columns: 38px 1fr 38px; gap: 8px; padding: 9px; }
  .step-btn { width: 38px; height: 38px; }
}
@media (prefers-reduced-motion: reduce) {
  .row, .row-icon, .switch-track, .switch-knob, .step-btn, .control, .ratio-fill, .btn-primary, .chip { transition: none !important; }
}
</style>