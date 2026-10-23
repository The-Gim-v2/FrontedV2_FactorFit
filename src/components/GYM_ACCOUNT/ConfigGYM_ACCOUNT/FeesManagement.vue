<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';

const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');

const extraTexts = {
  es: {
    /* Encabezado general */
    fp_pageTitle: 'GESTIÓN DE',
    fp_pageHighlight: 'MOROSIDAD Y RECARGOS',
    fp_pageSubtitle:
      'Configura estados de morosidad, períodos de gracia, recargos, límites y notificaciones de pago.',

    /* KPIs */
    fp_kpiRules: 'Reglas activas',
    fp_kpiGrace: 'Período de gracia',
    fp_kpiFine: 'Multa base',
    fp_kpiCap: 'Tope máximo',
    fp_days: 'días',

    /* Simulador */
    fp_simTitle1: 'Simulador de',
    fp_simTitleHl: 'multas',
    fp_simSubtitle:
      'Prueba tus reglas: mira cuánto pagaría un socio según los días de retraso.',
    fp_amountDue: 'Monto adeudado',
    fp_daysLate: 'Días de retraso',

    fp_statusGrace: 'Dentro del período de gracia',
    fp_statusFine: 'Multa en curso',
    fp_statusCap: 'Tope de multas alcanzado',
    fp_statusOnTime: 'Pago al corriente',

    fp_accumulated: 'Multa acumulada',
    fp_charges: 'Recargos',
    fp_totalToPay: 'Total a pagar',

    /* Gráfica */
    fp_projection: 'Proyección a 90 días',
    fp_cap: 'Tope',
    fp_graceShort: 'Gracia',
    fp_milestones: 'Hitos de acumulación',
    fp_day: 'Día',
    fp_fine: 'Multa',
    fp_ofCap: '% del tope',

    /* Avisos */
    fp_remTitle1: 'Avisos al',
    fp_remTitleHl: 'socio',
    fp_remSubtitle:
      'Comunica vencimientos y recargos de forma automática.',
    fp_remBefore: 'Recordatorio antes del vencimiento',
    fp_remBeforeDesc:
      'Envía un aviso por correo antes de que venza el pago.',
    fp_daysBefore: 'días antes',
    fp_notifyFine: 'Notificar al aplicar una multa',
    fp_notifyFineDesc:
      'El socio recibe un mensaje cada vez que se genera un recargo.',

    /* Validaciones */
    fp_noteNoCap:
      'Sin tope: las multas pueden acumularse sin límite.',
    fp_warnExceeds:
      'La multa base supera el tope máximo.',
    fp_invalidFine:
      'La multa base no puede ser mayor que el tope máximo.',
    fp_invalidValues:
      'Los montos no pueden ser negativos.'
  },

  en: {
    /* General heading */
    fp_pageTitle: 'DELINQUENCY &',
    fp_pageHighlight: 'LATE FEE MANAGEMENT',
    fp_pageSubtitle:
      'Configure delinquency statuses, grace periods, late fees, limits and payment notifications.',

    /* KPIs */
    fp_kpiRules: 'Active rules',
    fp_kpiGrace: 'Grace period',
    fp_kpiFine: 'Base fine',
    fp_kpiCap: 'Maximum cap',
    fp_days: 'days',

    /* Simulator */
    fp_simTitle1: 'Fine',
    fp_simTitleHl: 'simulator',
    fp_simSubtitle:
      'Test your rules: see how much a member would pay based on days late.',
    fp_amountDue: 'Amount due',
    fp_daysLate: 'Days late',

    fp_statusGrace: 'Within the grace period',
    fp_statusFine: 'Fine in progress',
    fp_statusCap: 'Fine cap reached',
    fp_statusOnTime: 'Payment up to date',

    fp_accumulated: 'Accumulated fine',
    fp_charges: 'Charges',
    fp_totalToPay: 'Total to pay',

    /* Chart */
    fp_projection: '90-day projection',
    fp_cap: 'Cap',
    fp_graceShort: 'Grace',
    fp_milestones: 'Accumulation milestones',
    fp_day: 'Day',
    fp_fine: 'Fine',
    fp_ofCap: '% of cap',

    /* Notices */
    fp_remTitle1: 'Member',
    fp_remTitleHl: 'notices',
    fp_remSubtitle:
      'Communicate due dates and charges automatically.',
    fp_remBefore: 'Reminder before due date',
    fp_remBeforeDesc:
      'Sends an email notice before payment is due.',
    fp_daysBefore: 'days before',
    fp_notifyFine: 'Notify when a fine is applied',
    fp_notifyFineDesc:
      'The member receives a message every time a charge is generated.',

    /* Validation */
    fp_noteNoCap:
      'No cap: fines can accumulate without limit.',
    fp_warnExceeds:
      'The base fine exceeds the maximum cap.',
    fp_invalidFine:
      'The base fine cannot exceed the maximum cap.',
    fp_invalidValues:
      'Amounts cannot be negative.'
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

/* =========================================================
   IDIOMA
========================================================= */

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

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const toastRef = ref(null);

const graceDays = ref(3);

const settings = ref({
  pendingStatus: true,
  inactiveStatus: true,
  blockTurnstile: true,

  paymentType: 'membresia',

  fineAmount: 800,

  /*
   * unica
   * diaria
   * semanal
   * mensual
   */
  recurrence: 'unica',

  maxFineLimit: 2500,

  remindBefore: true,
  remindDays: 3,
  notifyFine: true
});

/* =========================================================
   NOTIFICACIONES
========================================================= */

const notify = (message, type = 'success') => {
  toastRef.value?.notify?.(message, type);
};

const guardarCambiosRapidos = () => {
  notify(t('quickSettingsUpdatedToast'), 'success');
};

const guardarConfiguracionGeneral = () => {
  const fine = Number(settings.value.fineAmount) || 0;
  const cap = Number(settings.value.maxFineLimit) || 0;

  if (fine < 0 || cap < 0) {
    notify(t('fp_invalidValues'), 'error');
    return;
  }

  if (cap > 0 && fine > cap) {
    notify(t('fp_invalidFine'), 'error');
    return;
  }

  /*
   * Aquí posteriormente puedes colocar la petición real:
   *
   * await api.post('/configuracion/morosidad', {
   *   graceDays: graceDays.value,
   *   ...settings.value
   * });
   */

  notify(t('generalSettingsSavedToast'), 'success');
};

/* =========================================================
   PERÍODO DE GRACIA
========================================================= */

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

const setGrace = (days) => {
  if (graceDays.value === days) return;

  graceDays.value = days;
  guardarCambiosRapidos();
};

/* =========================================================
   RECORDATORIOS
========================================================= */

const remindPresets = [1, 3, 5, 7];

const setRemindDays = (days) => {
  if (settings.value.remindDays === days) return;

  settings.value.remindDays = days;
  guardarCambiosRapidos();
};

/* =========================================================
   FORMATOS
========================================================= */

const fmt = (number) => {
  const value = Number(number) || 0;

  return (
    '$' +
    value.toLocaleString(
      currentLang.value === 'en' ? 'en-US' : 'es-MX',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    )
  );
};

const fmtShort = (number) => {
  const value = Number(number) || 0;

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(
      value % 1000000 === 0 ? 0 : 1
    )}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(
      value % 1000 === 0 ? 0 : 1
    )}k`;
  }

  return String(Math.round(value));
};

/* =========================================================
   KPIs
========================================================= */

const activeRules = computed(() => {
  return [
    settings.value.pendingStatus,
    settings.value.inactiveStatus,
    settings.value.blockTurnstile
  ].filter(Boolean).length;
});

const fineValue = computed(() => {
  return Math.max(Number(settings.value.fineAmount) || 0, 0);
});

const capValue = computed(() => {
  return Math.max(Number(settings.value.maxFineLimit) || 0, 0);
});

const finePercent = computed(() => {
  if (capValue.value <= 0) return 0;

  return Math.min(
    Math.round((fineValue.value / capValue.value) * 100),
    100
  );
});

const fineExceedsLimit = computed(() => {
  return (
    capValue.value > 0 &&
    fineValue.value > capValue.value
  );
});

const fineLevel = computed(() => {
  if (
    fineExceedsLimit.value ||
    finePercent.value >= 90
  ) {
    return 'danger';
  }

  if (finePercent.value >= 60) {
    return 'warn';
  }

  return 'ok';
});

/* =========================================================
   SIMULADOR
========================================================= */

const simDays = ref(20);
const simAmount = ref(1200);

const normalizeDays = (days) => {
  return Math.max(Math.floor(Number(days) || 0), 0);
};

/*
 * IMPORTANTE:
 *
 * El primer recargo se aplica inmediatamente después
 * de terminar el período de gracia.
 *
 * Ejemplo:
 *
 * gracia = 3 días
 * recurrencia semanal
 *
 * día 1 - 3  -> 0 recargos
 * día 4 - 10 -> 1 recargo
 * día 11-17  -> 2 recargos
 *
 * Esto deja explícita la regla utilizada por el simulador.
 */
const periodsFor = (days) => {
  const normalizedDays = normalizeDays(days);

  const overdueDays = Math.max(
    normalizedDays - graceDays.value,
    0
  );

  if (overdueDays === 0) {
    return 0;
  }

  switch (settings.value.recurrence) {
    case 'diaria':
      return overdueDays;

    case 'semanal':
      return Math.ceil(overdueDays / 7);

    case 'mensual':
      return Math.ceil(overdueDays / 30);

    case 'unica':
    default:
      return 1;
  }
};

const fineFor = (days) => {
  const periods = periodsFor(days);

  const rawFine =
    periods * fineValue.value;

  if (capValue.value <= 0) {
    return rawFine;
  }

  return Math.min(
    rawFine,
    capValue.value
  );
};

const simPeriods = computed(() => {
  return periodsFor(simDays.value);
});

const simFine = computed(() => {
  return fineFor(simDays.value);
});

const simTotal = computed(() => {
  const debt = Math.max(
    Number(simAmount.value) || 0,
    0
  );

  return debt + simFine.value;
});

const simStatus = computed(() => {
  const days = normalizeDays(simDays.value);

  if (days === 0) {
    return 'ok';
  }

  if (days <= graceDays.value) {
    return 'grace';
  }

  if (
    capValue.value > 0 &&
    simFine.value >= capValue.value
  ) {
    return 'cap';
  }

  return 'fine';
});

const simStatusText = computed(() => {
  const statuses = {
    ok: 'fp_statusOnTime',
    grace: 'fp_statusGrace',
    fine: 'fp_statusFine',
    cap: 'fp_statusCap'
  };

  return t(
    statuses[simStatus.value] ||
    'fp_statusOnTime'
  );
});

/* =========================================================
   GRÁFICA
========================================================= */

const CW = 640;
const CH = 210;

const PL = 44;
const PR = 14;
const PT = 14;
const PB = 28;

const MAX_DAYS = 90;

const xAt = (day) => {
  const normalizedDay = Math.min(
    Math.max(Number(day) || 0, 0),
    MAX_DAYS
  );

  return (
    PL +
    (normalizedDay / MAX_DAYS) *
      (CW - PL - PR)
  );
};

const yMax = computed(() => {
  const maximum = Math.max(
    capValue.value,
    fineFor(MAX_DAYS),
    fineValue.value,
    1
  ) * 1.08;

  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(maximum))
  );

  const normalized =
    maximum / magnitude;

  const steps = [
    1,
    1.5,
    2,
    2.5,
    3,
    4,
    5,
    6,
    8,
    10
  ];

  const nice =
    steps.find(
      (step) => step >= normalized
    ) || 10;

  return nice * magnitude;
});

const yAt = (value) => {
  const safeValue = Math.max(
    Number(value) || 0,
    0
  );

  return (
    CH -
    PB -
    (safeValue / yMax.value) *
      (CH - PT - PB)
  );
};

const linePath = computed(() => {
  let path =
    `M ${xAt(0)} ${yAt(fineFor(0))}`;

  let previousFine =
    fineFor(0);

  for (
    let day = 1;
    day <= MAX_DAYS;
    day++
  ) {
    const currentFine =
      fineFor(day);

    if (
      currentFine !== previousFine
    ) {
      path +=
        ` H ${xAt(day)}` +
        ` V ${yAt(currentFine)}`;

      previousFine =
        currentFine;
    }
  }

  return (
    path +
    ` H ${xAt(MAX_DAYS)}`
  );
});

const areaPath = computed(() => {
  return (
    `${linePath.value} ` +
    `V ${CH - PB} ` +
    `H ${xAt(0)} Z`
  );
});

const yTicks = computed(() => {
  return [0, 1, 2, 3, 4].map(
    (index) =>
      (yMax.value / 4) * index
  );
});

const xTicks = [
  0,
  15,
  30,
  45,
  60,
  75,
  90
];

const graceWidth = computed(() => {
  const days = Math.min(
    Math.max(graceDays.value, 0),
    MAX_DAYS
  );

  return Math.max(
    xAt(days) - PL,
    0
  );
});

/* =========================================================
   HITOS
========================================================= */

const milestoneDays = [
  7,
  15,
  30,
  60,
  90
];

const milestones = computed(() => {
  return milestoneDays.map((day) => {
    const amount =
      fineFor(day);

    const periods =
      periodsFor(day);

    const percentage =
      capValue.value > 0
        ? Math.min(
            Math.round(
              (amount /
                capValue.value) *
                100
            ),
            100
          )
        : null;

    return {
      d: day,
      periods,
      amount,
      pct: percentage
    };
  });
});
</script>
<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content-promos">
      <header class="page-heading">
        <div>
          <h1 class="page-title">
            {{ t('fp_pageTitle') }}
            <span>{{ t('fp_pageHighlight') }}</span>
          </h1>

          <p class="page-description">
            {{ t('fp_pageSubtitle') }}
          </p>
        </div>
      </header>
      <!-- ================= RESUMEN (KPIs) ================= -->
      <section class="kpi-grid">
        <article class="kpi-card">
          <span class="kpi-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
          </span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiRules') }}</span>
            <strong class="kpi-value">{{ activeRules }}<small>/3</small></strong>
          </div>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiGrace') }}</span>
            <strong class="kpi-value">{{ graceDays }}<small>{{ t('fp_days') }}</small></strong>
          </div>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiFine') }}</span>
            <strong class="kpi-value">{{ fmt(fineValue) }}</strong>
          </div>
        </article>

        <article class="kpi-card">
          <span class="kpi-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M7 14h4"></path><path d="M7 9h10"></path></svg>
          </span>
          <div class="kpi-copy">
            <span class="kpi-label">{{ t('fp_kpiCap') }}</span>
            <strong class="kpi-value">{{ capValue > 0 ? fmt(capValue) : '∞' }}</strong>
          </div>
        </article>
      </section>

      <!-- ================= CUADRO IZQUIERDO: REGLAS DE MOROSIDAD ================= -->
      <section class="promo-box-container accent-amber" id="tutorial-step-0">
        <div class="box-header">
          <div class="header-top">
            <span class="header-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path></svg>
            </span>
            <div class="header-text">
              <h2>{{ t('delinquencyRulesTitlePart1') }} <span class="highlight">{{ t('delinquencyRulesTitleHighlight') }}</span></h2>
              <p class="box-subtitle">{{ t('delinquencyRulesSubtitle') }}</p>
            </div>
            <span class="header-counter" aria-hidden="true">{{ activeRules }}<small>/3</small></span>
          </div>
        </div>

        <div class="box-content">
          <!-- Pendientes -->
          <div class="item-row" :class="{ 'is-on': settings.pendingStatus }">
            <div class="item-info">
              <div class="icon-wrapper">
                <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div class="text-grow">
                <h4>{{ t('statusPendingTitle') }}</h4>
                <p>{{ t('statusPendingDesc') }}</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.pendingStatus" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>

          <!-- Inactivos -->
          <div class="item-row" :class="{ 'is-on': settings.inactiveStatus }">
            <div class="item-info">
              <div class="icon-wrapper">
                <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div class="text-grow">
                <h4>{{ t('statusInactiveTitle') }}</h4>
                <p>{{ t('statusInactiveDesc') }}</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.inactiveStatus" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>

          <!-- Torniquete -->
          <div class="item-row" :class="{ 'is-on': settings.blockTurnstile }">
            <div class="item-info">
              <div class="icon-wrapper">
                <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div class="text-grow">
                <h4>{{ t('turnstileBlockTitle') }}</h4>
                <p>{{ t('turnstileBlockDesc') }}</p>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.blockTurnstile" @change="guardarCambiosRapidos" />
              <span class="toggle-track"><span class="toggle-knob"></span></span>
            </label>
          </div>

          <!-- Período de gracia -->
          <div class="item-row vertical-layout grace-row">
            <div class="item-info full-width">
              <div class="icon-wrapper">
                <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="text-grow">
                <h4>{{ t('gracePeriodTitle') }}</h4>
                <p>{{ t('gracePeriodDesc') }}</p>
              </div>
            </div>

            <div class="grace-panel">
              <div class="grace-period-control">
                <button class="btn-counter" @click="decrementDays" type="button" :disabled="graceDays === 0" aria-label="-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <div class="days-display-wrap">
                  <span class="days-display">{{ graceDays }}</span>
                  <span class="days-label">{{ t('daysDisplayLabel') }}</span>
                </div>
                <button class="btn-counter" @click="incrementDays" type="button" aria-label="+1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>

              <div class="chip-row">
                <button
                  v-for="d in gracePresets"
                  :key="'gp-' + d"
                  type="button"
                  class="chip-btn"
                  :class="{ active: graceDays === d }"
                  @click="setGrace(d)"
                >{{ d }}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= CUADRO DERECHO: COSTO Y FRECUENCIA ================= -->
      <section class="promo-box-container accent-blue" id="tutorial-step-1">
        <div class="box-header">
          <div class="header-top">
            <span class="header-icon-badge badge-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </span>
            <div class="header-text">
              <h2>{{ t('costFrequencyTitlePart1') }} <span class="highlight">{{ t('costFrequencyTitleHighlight') }}</span></h2>
              <p class="box-subtitle">{{ t('costFrequencySubtitle') }}</p>
            </div>
          </div>
        </div>

        <div class="box-content">
          <div class="form-column-layout">
            <div class="input-group">
              <label>{{ t('affectedServiceLabel') }}</label>
              <div class="select-wrap">
                <select v-model="settings.paymentType" class="custom-select">
                  <option value="membresia">{{ t('serviceMembershipOption') }}</option>
                  <option value="clases">{{ t('serviceClassesOption') }}</option>
                  <option value="taquilla">{{ t('serviceLockerOption') }}</option>
                  <option value="todos">{{ t('serviceAllOption') }}</option>
                </select>
                <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <div class="fine-card">
              <div class="fine-grid">
                <div class="input-group">
                  <label>{{ t('fineAmountLabel') }}</label>
                  <div class="input-money-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" inputmode="decimal" v-model.number="settings.fineAmount" class="custom-input mono" :class="{ 'is-warn': fineExceedsLimit }" min="0">
                  </div>
                </div>

                <div class="input-group">
                  <label>{{ t('maxFineLimitLabel') }}</label>
                  <div class="input-money-wrapper">
                    <span class="currency-symbol">$</span>
                    <input type="number" inputmode="decimal" v-model.number="settings.maxFineLimit" class="custom-input mono" min="0">
                  </div>
                </div>
              </div>

              <div class="fine-ratio-bar" :class="'level-' + fineLevel" aria-hidden="true">
                <div class="fine-ratio-track">
                  <div class="fine-ratio-fill" :style="{ width: finePercent + '%' }"></div>
                </div>
                <span class="fine-ratio-label">{{ finePercent }}%</span>
              </div>

              <p v-if="fineExceedsLimit" class="field-note danger">{{ t('fp_warnExceeds') }}</p>
              <p v-else-if="capValue <= 0" class="field-note">{{ t('fp_noteNoCap') }}</p>
            </div>

            <div class="input-group">
              <label>{{ t('recurrenceLabel') }}</label>
              <div class="select-wrap">
                <select v-model="settings.recurrence" class="custom-select">
                  <option value="unica">{{ t('recurrenceSingleOption') }}</option>
                  <option value="diaria">{{ t('recurrenceDailyOption') }}</option>
                  <option value="semanal">{{ t('recurrenceWeeklyOption') }}</option>
                  <option value="mensual">{{ t('recurrenceMonthlyOption') }}</option>
                </select>
                <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <div class="button-container">
              <button type="button" class="btn-primary-action" @click="guardarConfiguracionGeneral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {{ t('saveConfigurationBtn') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= AVISOS AL SOCIO ================= -->
      <section class="promo-box-container accent-amber span-full">
        <div class="box-header">
          <div class="header-top">
            <span class="header-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </span>
            <div class="header-text">
              <h2>{{ t('fp_remTitle1') }} <span class="highlight">{{ t('fp_remTitleHl') }}</span></h2>
              <p class="box-subtitle">{{ t('fp_remSubtitle') }}</p>
            </div>
          </div>
        </div>

        <div class="box-content">
          <div class="notice-grid">
            <div class="item-row notice-row" :class="{ 'is-on': settings.remindBefore }">
              <div class="item-info">
                <div class="icon-wrapper">
                  <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div class="text-grow">
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
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.remindBefore" @change="guardarCambiosRapidos" />
                <span class="toggle-track"><span class="toggle-knob"></span></span>
              </label>
            </div>

            <div class="item-row notice-row" :class="{ 'is-on': settings.notifyFine }">
              <div class="item-info">
                <div class="icon-wrapper">
                  <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>
                </div>
                <div class="text-grow">
                  <h4>{{ t('fp_notifyFine') }}</h4>
                  <p>{{ t('fp_notifyFineDesc') }}</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifyFine" @change="guardarCambiosRapidos" />
                <span class="toggle-track"><span class="toggle-knob"></span></span>
              </label>
            </div>
          </div>
        </div>
      </section>


    

    </main>
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

/* =========================================================
   ENCABEZADO GENERAL
========================================================= */

.page-heading {
  grid-column: 1 / -1;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: -2px;
}

.page-title {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.45rem, 2.2vw, 2rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.page-title span {
  color: var(--accent);
}

.page-description {
  max-width: 720px;
  margin: 7px 0 0;
  color: var(--muted);
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 450;
  line-height: 1.55;
}

@media (max-width: 600px) {
  .page-heading {
    margin-bottom: 0;
  }

  .page-title {
    font-size: 1.35rem;
  }

  .page-description {
    margin-top: 6px;
    font-size: 0.71rem;
    line-height: 1.5;
  }
}
/* BASE */
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
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  align-items: stretch;
  gap: 20px;
  margin: 0 auto;
  padding: 30px 32px 56px;
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
.main-content-promos *, .main-content-promos *::before, .main-content-promos *::after { box-sizing: border-box; }
.span-full { grid-column: 1 / -1; }

/* KPIs */
.kpi-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.kpi-card {
  min-width: 0; display: flex; align-items: center; gap: 13px; padding: 15px 17px;
  border: 1px solid var(--line); border-radius: var(--app-border-radius, 14px);
  background: var(--card); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
}
.kpi-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid; border-radius: 11px; }
.kpi-icon svg { width: 19px; height: 19px; }
.kpi-icon.amber { border-color: color-mix(in srgb, var(--amber) 28%, transparent); background: color-mix(in srgb, var(--amber) 9%, transparent); color: var(--amber); }
.kpi-icon.blue { border-color: color-mix(in srgb, var(--accent) 28%, transparent); background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent); }
.kpi-icon.red { border-color: color-mix(in srgb, var(--red) 28%, transparent); background: color-mix(in srgb, var(--red) 9%, transparent); color: var(--red); }
.kpi-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.kpi-label { overflow: hidden; color: var(--muted); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.02em; text-overflow: ellipsis; white-space: nowrap; }
.kpi-value { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.45rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
.kpi-value small { margin-left: 5px; color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 500; }

/* TARJETAS PRINCIPALES */
.promo-box-container {
  position: relative; width: 100%; min-width: 0; display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--line); border-radius: var(--app-border-radius, 16px);
  background: var(--card); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}
.promo-box-container::before { content: ''; position: absolute; z-index: 3; top: 0; right: 0; left: 0; height: 2px; pointer-events: none; }
.accent-amber::before { background: linear-gradient(90deg, transparent, var(--amber), transparent); opacity: 0.8; }
.accent-blue::before { background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.8; }

/* HEADER TARJETAS */
.box-header { flex-shrink: 0; padding: 20px 22px 18px; border-bottom: 1px solid var(--line-soft); background: linear-gradient(180deg, color-mix(in srgb, var(--text) 2.5%, transparent), transparent); }
.header-top { display: flex; align-items: center; gap: 13px; }
.header-icon-badge {
  width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--amber) 26%, transparent); border-radius: 11px;
  background: color-mix(in srgb, var(--amber) 8%, transparent); color: var(--amber);
}
.header-icon-badge.badge-blue { border-color: color-mix(in srgb, var(--accent) 26%, transparent); background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent); }
.header-icon-badge svg { width: 20px; height: 20px; }
.header-text { min-width: 0; flex: 1; }
.box-header h2 { margin: 0 0 4px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; line-height: 1.15; letter-spacing: 0.03em; text-transform: uppercase; }
.highlight { color: var(--accent); }
.accent-amber .highlight { color: var(--amber); }
.box-subtitle { max-width: 520px; margin: 0; color: var(--muted); font-size: 0.74rem; font-weight: 450; line-height: 1.45; }

.header-counter {
  flex-shrink: 0; padding: 5px 11px; border: 1px solid color-mix(in srgb, var(--amber) 26%, transparent); border-radius: 999px;
  background: color-mix(in srgb, var(--amber) 8%, transparent); color: var(--amber);
  font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 600; line-height: 1;
}
.header-counter small { color: var(--muted); font-size: 0.66rem; font-weight: 500; }

/* CONTENIDO */
.box-content { min-width: 0; display: flex; flex: 1; flex-direction: column; gap: 10px; padding: 18px; }

/* FILAS DE CONFIGURACIÓN */
.item-row {
  position: relative; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 15px; border: 1px solid var(--line-soft); border-radius: 12px;
  background: color-mix(in srgb, var(--text) 1.5%, transparent);
  transition: border-color 0.18s ease, background 0.18s ease;
}
.item-row:hover { border-color: color-mix(in srgb, var(--text) 20%, transparent); background: color-mix(in srgb, var(--text) 2.7%, transparent); }
.item-row.is-on { border-color: color-mix(in srgb, var(--amber) 24%, var(--line)); background: linear-gradient(90deg, color-mix(in srgb, var(--amber) 6%, transparent), transparent 62%); }
.item-row.is-on::before { content: ''; position: absolute; top: 12px; bottom: 12px; left: -1px; width: 3px; border-radius: 0 3px 3px 0; background: var(--amber); }

.item-info { min-width: 0; display: flex; align-items: center; gap: 12px; }
.item-info.full-width { width: 100%; }
.text-grow { min-width: 0; flex: 1; }
.icon-wrapper {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--muted);
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.item-row.is-on .icon-wrapper { border-color: color-mix(in srgb, var(--amber) 24%, transparent); background: color-mix(in srgb, var(--amber) 8%, transparent); color: var(--amber); }
.icon-tag { width: 17px; height: 17px; color: inherit; }
.item-info h4 { margin: 0 0 3px; color: var(--title); font-size: 0.82rem; font-weight: 600; line-height: 1.3; }
.item-info p { max-width: 430px; margin: 0; color: var(--muted); font-size: 0.7rem; font-weight: 450; line-height: 1.45; }

/* TOGGLE */
.toggle-switch { position: relative; width: 44px; height: 25px; display: inline-flex; flex-shrink: 0; cursor: pointer; }
.toggle-switch input { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.toggle-track { position: absolute; inset: 0; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, var(--input)); transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
.toggle-knob { position: absolute; top: 3px; left: 3px; width: 17px; height: 17px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); transition: transform 0.2s ease; }
.toggle-switch input:checked + .toggle-track { border-color: var(--amber); background: var(--amber); }
.toggle-switch input:checked + .toggle-track .toggle-knob { transform: translateX(19px); }
.toggle-switch input:focus-visible + .toggle-track { box-shadow: 0 0 0 3px color-mix(in srgb, var(--amber) 22%, transparent); }

/* PERÍODO DE GRACIA */
.vertical-layout { flex-direction: column; align-items: stretch; gap: 13px; }
.grace-row { margin-top: 2px; }
.grace-panel { display: flex; flex-direction: column; gap: 11px; }

.grace-period-control { min-height: 62px; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 11px; background: var(--input); }
.btn-counter {
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; padding: 0;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent); cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
}
.btn-counter svg { width: 14px; height: 14px; }
.btn-counter:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 17%, transparent); transform: translateY(-1px); }
.btn-counter:active:not(:disabled) { transform: scale(0.94); }
.btn-counter:disabled { opacity: 0.3; cursor: not-allowed; }

.days-display-wrap { min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
.days-display { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 1.5rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.days-label { color: var(--muted); font-size: 0.6rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

/* Atajos (chips) */
.chip-row { display: flex; align-items: center; justify-content: center; gap: 7px; flex-wrap: wrap; }
.chip-row.left { justify-content: flex-start; margin-top: 10px; }
.chip-btn {
  min-width: 38px; height: 30px; padding: 0 11px; border: 1px solid var(--line); border-radius: 999px;
  background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--text);
  font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; font-weight: 600; cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.chip-btn:hover { border-color: color-mix(in srgb, var(--amber) 55%, transparent); color: var(--amber); }
.chip-btn.active { border-color: var(--amber); background: color-mix(in srgb, var(--amber) 14%, transparent); color: var(--amber); }
.chip-suffix { color: var(--muted); font-size: 0.68rem; font-weight: 500; }

/* COLUMNA DE CONFIGURACIÓN */
.form-column-layout { min-width: 0; min-height: 100%; display: flex; flex: 1; flex-direction: column; gap: 16px; }
.input-group { min-width: 0; width: 100%; display: flex; flex-direction: column; gap: 7px; }
.input-group label { color: var(--color-etiquetas, var(--color-texto-general, #cbd5e1)); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.015em; line-height: 1.3; }

.fine-card { display: flex; flex-direction: column; gap: 14px; padding: 14px; border: 1px solid var(--line-soft); border-radius: 12px; background: color-mix(in srgb, var(--text) 1.5%, transparent); }
.fine-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
/* Alinea los dos campos aunque una etiqueta ocupe 2 líneas */
.fine-grid .input-group { justify-content: flex-end; }
.fine-grid .input-group label { min-height: 2.6em; display: flex; align-items: flex-end; }

.field-note { margin: -4px 0 0; color: var(--muted); font-size: 0.66rem; line-height: 1.4; }
.field-note.danger { color: var(--red); }

/* INPUTS Y SELECTS */
.select-wrap, .input-money-wrapper { position: relative; width: 100%; }
.input-money-wrapper { display: flex; align-items: center; }

.custom-select, .custom-input {
  width: 100%; height: 44px; padding: 0 13px; border: 1px solid var(--line); border-radius: 10px;
  background: var(--input); color: var(--color-texto-input, var(--text));
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 500; outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.custom-select:hover, .custom-input:hover { border-color: color-mix(in srgb, var(--text) 26%, transparent); }
.custom-select:focus, .custom-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent); }
.custom-input.is-warn { border-color: color-mix(in srgb, var(--red) 70%, transparent); }
.custom-input.is-warn:focus { border-color: var(--red); box-shadow: 0 0 0 3px color-mix(in srgb, var(--red) 16%, transparent); }

.custom-select { padding-right: 38px; appearance: none; -webkit-appearance: none; color-scheme: dark; cursor: pointer; }
.custom-select option { background: #111315; color: #ffffff; }
.select-chevron { position: absolute; top: 50%; right: 13px; width: 14px; height: 14px; color: var(--muted); pointer-events: none; transform: translateY(-50%); }

.currency-symbol { position: absolute; z-index: 2; left: 13px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 600; pointer-events: none; }
.input-money-wrapper .custom-input { padding-left: 28px; }
.custom-input.mono { font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; font-weight: 600; font-variant-numeric: tabular-nums; }

.custom-input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
.custom-input[type='number']::-webkit-inner-spin-button, .custom-input[type='number']::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }

/* PROPORCIÓN MULTA / LÍMITE */
.fine-ratio-bar { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; }
.fine-ratio-track { position: relative; height: 6px; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--text) 8%, transparent); }
.fine-ratio-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #ffffff)); transition: width 0.35s ease, background 0.25s ease; }
.fine-ratio-label { min-width: 36px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.66rem; font-weight: 600; text-align: right; }
.fine-ratio-bar.level-warn .fine-ratio-fill { background: linear-gradient(90deg, var(--amber), color-mix(in srgb, var(--amber) 70%, #ffffff)); }
.fine-ratio-bar.level-warn .fine-ratio-label { color: var(--amber); }
.fine-ratio-bar.level-danger .fine-ratio-fill { background: linear-gradient(90deg, var(--red), color-mix(in srgb, var(--red) 70%, #ffffff)); }
.fine-ratio-bar.level-danger .fine-ratio-label { color: var(--red); }

/* BOTÓN GUARDAR */
.button-container { margin-top: auto; padding-top: 6px; }
.btn-primary-action {
  width: 100%; min-height: 46px; display: flex; align-items: center; justify-content: center; gap: 9px; padding: 0 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 80%, transparent); border-radius: 10px;
  background: var(--color-botones, var(--accent)); color: var(--color-texto-botones, #ffffff);
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 650; cursor: pointer;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 18%, transparent);
  transition: filter 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.btn-primary-action svg { width: 16px; height: 16px; flex-shrink: 0; }
.btn-primary-action:hover { filter: brightness(1.08); box-shadow: 0 9px 22px color-mix(in srgb, var(--accent) 26%, transparent); transform: translateY(-1px); }
.btn-primary-action:active { transform: translateY(0); }

/* SIMULADOR */
.sim-grid { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 22px; align-items: start; }
.sim-left { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.sim-right { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

.range-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.range-value { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 1rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.range-value small { color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 500; }
.range-scale { display: flex; justify-content: space-between; padding: 0 2px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.6rem; }

.range {
  -webkit-appearance: none; appearance: none; width: 100%; height: 6px; margin: 6px 0 2px; border-radius: 999px; outline: none; cursor: pointer;
  background: linear-gradient(90deg, var(--accent) var(--p), color-mix(in srgb, var(--text) 12%, transparent) var(--p));
}
.range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border: 3px solid var(--card); border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 3px 8px rgba(0, 0, 0, 0.4); cursor: grab; }
.range::-moz-range-thumb { width: 16px; height: 16px; border: 3px solid var(--card); border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 3px 8px rgba(0, 0, 0, 0.4); cursor: grab; }
.range:focus-visible { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent); }

.sim-status {
  display: inline-flex; align-items: center; gap: 9px; align-self: flex-start; padding: 7px 13px;
  border: 1px solid; border-radius: 999px; font-size: 0.7rem; font-weight: 650;
}
.sim-status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 18%, transparent); }
.sim-status.st-ok { border-color: color-mix(in srgb, var(--green) 30%, transparent); background: color-mix(in srgb, var(--green) 8%, transparent); color: var(--green); }
.sim-status.st-grace { border-color: color-mix(in srgb, var(--accent) 30%, transparent); background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent); }
.sim-status.st-fine { border-color: color-mix(in srgb, var(--amber) 32%, transparent); background: color-mix(in srgb, var(--amber) 9%, transparent); color: var(--amber); }
.sim-status.st-cap { border-color: color-mix(in srgb, var(--red) 32%, transparent); background: color-mix(in srgb, var(--red) 9%, transparent); color: var(--red); }

.sim-result { margin: 0; padding: 4px 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--input); }
.sim-line { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line-soft); }
.sim-line:last-child { border-bottom: 0; }
.sim-line dt { color: var(--muted); font-size: 0.72rem; font-weight: 550; }
.sim-line dt small { font-size: 0.64rem; font-weight: 500; opacity: 0.85; }
.sim-line dd { margin: 0; color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 0.86rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.sim-line dd.fine-amount { color: var(--amber); }
.sim-line dd.fine-amount.zero { color: var(--muted); }
.sim-line.total { padding-top: 14px; }
.sim-line.total dt { color: var(--title); font-size: 0.78rem; font-weight: 650; }
.sim-line.total dd { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.55rem; line-height: 1; }

/* Gráfica */
.chart-card { padding: 14px 14px 8px; border: 1px solid var(--line); border-radius: 13px; background: color-mix(in srgb, var(--input) 62%, var(--card)); }
.chart-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; }
.chart-head strong { color: var(--title); font-size: 0.76rem; font-weight: 650; }
.chart-legend { display: flex; align-items: center; gap: 13px; flex-wrap: wrap; }
.legend-item { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.64rem; font-weight: 500; white-space: nowrap; }
.lg { width: 10px; height: 10px; display: inline-block; border-radius: 3px; }
.lg-fine { background: var(--accent); }
.lg-cap { height: 0; border-top: 2px dashed var(--red); border-radius: 0; }
.lg-grace { background: color-mix(in srgb, var(--accent) 22%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); }

.chart-svg { width: 100%; height: auto; display: block; overflow: visible; }
.grace-zone { fill: color-mix(in srgb, var(--accent) 9%, transparent); }
.grid-line { stroke: color-mix(in srgb, var(--text) 8%, transparent); stroke-width: 1; }
.grid-line.base { stroke: color-mix(in srgb, var(--text) 20%, transparent); }
.axis-label { fill: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 10px; }
.cap-line { stroke: var(--red); stroke-width: 1.5; stroke-dasharray: 5 4; opacity: 0.85; }
.fine-line { fill: none; stroke: var(--accent); stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; }
.marker-line { stroke: color-mix(in srgb, var(--text) 38%, transparent); stroke-width: 1; stroke-dasharray: 3 3; }
.marker-dot { fill: var(--card); stroke: var(--accent); stroke-width: 3; }

/* Hitos */
.milestones { border: 1px solid var(--line); border-radius: 13px; overflow: hidden; background: var(--card); }
.milestones-title { padding: 11px 15px; border-bottom: 1px solid var(--line-soft); color: var(--title); font-size: 0.74rem; font-weight: 650; }
.ms-table { display: flex; flex-direction: column; }
.ms-row { display: grid; grid-template-columns: 0.6fr 0.8fr 1.1fr 1.5fr; align-items: center; gap: 10px; padding: 10px 15px; border-bottom: 1px solid var(--line-soft); color: var(--text); font-size: 0.72rem; font-variant-numeric: tabular-nums; }
.ms-row:last-child { border-bottom: 0; }
.ms-row:not(.ms-head) { cursor: pointer; transition: background 0.16s ease; }
.ms-row:not(.ms-head):hover { background: color-mix(in srgb, var(--text) 3%, transparent); }
.ms-row.current { background: color-mix(in srgb, var(--accent) 9%, transparent); box-shadow: inset 3px 0 0 var(--accent); }
.ms-head { padding-top: 8px; padding-bottom: 8px; background: color-mix(in srgb, var(--text) 2.5%, transparent); color: var(--muted); font-size: 0.6rem; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase; }
.ms-day { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
.ms-amount { color: var(--amber); font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
.ms-pct { display: flex; align-items: center; gap: 8px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; font-size: 0.66rem; }
.ms-bar { height: 5px; min-width: 30px; flex: 1; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--text) 9%, transparent); }
.ms-bar-fill { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
.ms-bar-fill.full { background: var(--red); }

/* AVISOS */
.notice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.notice-row { align-items: flex-start; }
.notice-row .item-info { align-items: flex-start; }

/* NOTIFICACIONES */
:deep(.notification-container), :deep(.toast-container) {
  width: calc(100% - 32px) !important; max-width: 480px !important; box-sizing: border-box !important;
  left: 50% !important; right: auto !important; margin: 0 auto !important; transform: translateX(-50%) !important;
}

/* FOCUS */
.btn-counter:focus-visible, .btn-primary-action:focus-visible, .chip-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* TABLET */
@media (max-width: 1050px) {
  .main-content-promos { grid-template-columns: 1fr; max-width: 760px; padding: 26px 24px 48px; }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .form-column-layout { min-height: 0; }
  .sim-grid { grid-template-columns: 1fr; }
}

/* MÓVIL */
@media (max-width: 600px) {
  .main-content-promos { gap: 14px; padding: 18px 12px 36px; overflow-x: hidden; }
  .kpi-grid { gap: 10px; }
  .kpi-card { gap: 10px; padding: 12px; }
  .kpi-icon { width: 34px; height: 34px; border-radius: 9px; }
  .kpi-icon svg { width: 16px; height: 16px; }
  .kpi-value { font-size: 1.18rem; }
  .promo-box-container { border-radius: 14px; }
  .box-header { padding: 16px; }
  .header-top { gap: 10px; }
  .header-icon-badge { width: 38px; height: 38px; border-radius: 10px; }
  .header-icon-badge svg { width: 18px; height: 18px; }
  .box-header h2 { font-size: 1rem; }
  .box-subtitle { font-size: 0.69rem; }
  .header-counter { padding: 4px 9px; font-size: 0.74rem; }
  .box-content { gap: 9px; padding: 13px; }
  .item-row { gap: 11px; padding: 13px 12px; }
  .item-info { gap: 10px; }
  .icon-wrapper { width: 34px; height: 34px; }
  .item-info h4 { font-size: 0.78rem; }
  .item-info p { font-size: 0.66rem; }
  .fine-card { padding: 12px; }
  .fine-grid { grid-template-columns: 1fr; gap: 13px; }
  .fine-grid .input-group label { min-height: 0; }
  .custom-select, .custom-input { height: 46px; }
  .btn-primary-action { min-height: 48px; }
  .notice-grid { grid-template-columns: 1fr; }
  .chart-card { padding: 12px 8px 6px; }
  .ms-row { grid-template-columns: 0.5fr 0.7fr 1.1fr 1.3fr; gap: 6px; padding: 10px 11px; font-size: 0.68rem; }
  .sim-line.total dd { font-size: 1.35rem; }
}

/* MÓVIL PEQUEÑO */
@media (max-width: 390px) {
  .main-content-promos { padding-right: 9px; padding-left: 9px; }
  .box-header { padding: 14px; }
  .box-content { padding: 11px; }
  .item-row { padding: 12px 10px; }
  .header-counter { display: none; }
  .toggle-switch { width: 42px; height: 24px; }
  .toggle-knob { width: 16px; height: 16px; }
  .toggle-switch input:checked + .toggle-track .toggle-knob { transform: translateX(18px); }
  .grace-period-control { grid-template-columns: 36px 1fr 36px; gap: 8px; padding: 9px; }
  .btn-counter { width: 36px; height: 36px; }
  .ms-bar { display: none; }
}

/* REDUCIR MOVIMIENTO */
@media (prefers-reduced-motion: reduce) {
  .item-row, .icon-wrapper, .toggle-track, .toggle-knob, .btn-counter, .custom-select, .custom-input, .fine-ratio-fill, .btn-primary-action, .chip-btn, .ms-row { transition: none !important; }
}

/* =========================================================
   SIMULADOR TEMPORALMENTE DESHABILITADO
========================================================= */
.simulator-disabled {
  position: relative;
  opacity: .58;
  filter: grayscale(.18);
  user-select: none;
}

.simulator-disabled::after {
  content: '';
  position: absolute;
  z-index: 20;
  inset: 0;
  cursor: not-allowed;
  background: transparent;
  pointer-events: auto;
}

.simulator-disabled input,
.simulator-disabled button,
.simulator-disabled select,
.simulator-disabled .ms-row {
  cursor: not-allowed !important;
}

.simulator-disabled .range,
.simulator-disabled input:disabled {
  opacity: .72;
}

</style>