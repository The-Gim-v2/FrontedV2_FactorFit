<template>
  <div class="form-panel">
    <NotificationSystem ref="toastRef" />

    <!-- ENCABEZADO -->
    <header class="panel-header">
      <div class="header-left">
        <div class="header-icon"><i class="bi bi-calendar3"></i></div>
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
        <i class="bi bi-x-lg"></i>
      </button>
    </header>

    <div class="form-body">
      <!-- ============ CONFIGURACIÓN DEL PERIODO ============ -->
      <section class="card config-section">
        <div class="section-heading">
          <div class="section-icon"><i class="bi bi-sliders"></i></div>
          <div>
            <h3>{{ t('periodConfig') }}</h3>
            <p>{{ t('periodConfigDesc') }}</p>
          </div>
        </div>

        <!-- Inicio → Término -->
        <div class="range-row">
          <div class="field">
            <label for="sel-inicio">{{ t('start') }}</label>
            <div class="select-wrapper">
              <i class="bi bi-calendar-event select-lead"></i>
              <select id="sel-inicio" v-model.number="form.inicio" class="custom-select has-lead">
                <option v-for="n in 31" :key="'in-' + n" :value="n" :disabled="diaOcupado(n)">
                  {{ t('dayLabel') }} {{ n }}{{ diaOcupado(n) ? ' · ' + t('occupied') : '' }}
                </option>
              </select>
              <i class="bi bi-chevron-down select-arrow"></i>
            </div>
          </div>

          <span class="range-link" aria-hidden="true"><i class="bi bi-arrow-right"></i></span>

          <div class="field">
            <label for="sel-termino">{{ t('end') }}</label>
            <div class="select-wrapper">
              <i class="bi bi-calendar-check select-lead"></i>
              <select id="sel-termino" v-model.number="form.termino" class="custom-select has-lead">
                <option v-for="n in 31" :key="'ter-' + n" :value="n" :disabled="diaOcupado(n)">
                  {{ t('dayLabel') }} {{ n }}{{ diaOcupado(n) ? ' · ' + t('occupied') : '' }}
                </option>
              </select>
              <i class="bi bi-chevron-down select-arrow"></i>
            </div>
          </div>
        </div>

        <div v-if="formCruzaMes" class="wrap-note">
          <i class="bi bi-arrow-repeat"></i>
          <span>{{ t('wrapNote') }}</span>
        </div>

        <!-- Días de corte (select múltiple) -->
        <div class="field cutoff-field" ref="cortesBox">
          <label id="lbl-cortes">{{ t('cutoff') }} <em>· {{ t('multiHint') }}</em></label>

          <button
            type="button"
            class="multi-trigger"
            :class="{ open: cortesOpen, 'has-value': form.cortes.length }"
            aria-haspopup="listbox"
            :aria-expanded="cortesOpen"
            aria-labelledby="lbl-cortes"
            @click="cortesOpen = !cortesOpen"
            @keydown.esc="cortesOpen = false"
          >
            <i class="bi bi-scissors select-lead"></i>
            <span class="multi-value">
              <span v-if="!form.cortes.length" class="placeholder">{{ t('selectDays') }}</span>
              <template v-else>
                <span v-for="n in form.cortes.slice(0, 6)" :key="'tg-' + n" class="multi-tag">
                  {{ n }}
                  <i class="bi bi-x" role="button" :aria-label="t('delete')" @click.stop="toggleCorte(n)"></i>
                </span>
                <span v-if="form.cortes.length > 6" class="multi-more">+{{ form.cortes.length - 6 }}</span>
              </template>
            </span>
            <i class="bi bi-chevron-down select-arrow" :class="{ flip: cortesOpen }"></i>
          </button>

          <Transition name="pop">
            <div v-if="cortesOpen" class="multi-panel" role="listbox" aria-multiselectable="true">
              <div class="multi-panel-head">
                <span>{{ form.cortes.length }} {{ t('daysSelected') }}</span>
                <div class="multi-actions">
                  <button type="button" class="link-btn" @click="selectAllCortes">{{ t('selectAll') }}</button>
                  <button type="button" class="link-btn muted" @click="clearCortes" :disabled="!form.cortes.length">{{ t('clear') }}</button>
                </div>
              </div>

              <div class="multi-grid">
                <button
                  v-for="n in diasDe(form)"
                  :key="'cd-' + n"
                  type="button"
                  role="option"
                  :aria-selected="form.cortes.includes(n)"
                  class="day-opt"
                  :class="{ active: form.cortes.includes(n) }"
                  @click="toggleCorte(n)"
                >{{ n }}</button>
              </div>

              <div class="multi-panel-foot">
                <small>{{ t('cutoffHelp') }}</small>
                <button type="button" class="btn-done" @click="cortesOpen = false">{{ t('done') }}</button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Tipo de pago -->
        <div class="field payment-type-group">
          <span class="field-label">{{ t('paymentType') }}</span>
          <div class="payment-options" role="radiogroup" :aria-label="t('paymentType')">
            <button
              type="button"
              role="radio"
              :aria-checked="form.tipo === 'Mensual'"
              class="payment-option"
              :class="{ active: form.tipo === 'Mensual', 'is-taken': tipoRegistrado('Mensual') }"
              @click="form.tipo = 'Mensual'"
            >
              <span class="payment-option-icon"><i class="bi bi-calendar-month"></i></span>
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
              @click="form.tipo = 'Quincenal'"
            >
              <span class="payment-option-icon"><i class="bi bi-calendar2-week"></i></span>
              <span class="payment-option-text">
                <strong>{{ t('biweekly') }}</strong>
                <small>{{ tipoRegistrado('Quincenal') ? t('alreadyRegistered') : t('biweeklyDesc') }}</small>
              </span>
              <span class="radio-dot"></span>
            </button>
          </div>
        </div>

        <!-- Resumen + botón -->
        <div class="rule-preview">
          <div class="rule-preview-content">
            <span class="rule-label">{{ t('newRule') }}</span>
            <strong class="rule-range">
              {{ t('dayLabel') }} {{ form.inicio }}
              <i class="bi bi-arrow-right"></i>
              {{ t('dayLabel') }} {{ form.termino }}
            </strong>

            <div class="rule-tags">
              <span class="tag tag-days">{{ diasEnRango(form) }} {{ t('daysUnit') }}</span>
              <span class="tag tag-cutoff">
                <i class="bi bi-scissors"></i>
                {{ form.cortes.length ? form.cortes.join(', ') : '—' }}
              </span>
              <span class="tag" :class="form.tipo === 'Mensual' ? 'tag-mes' : 'tag-quin'">
                {{ form.tipo === 'Mensual' ? t('monthly') : t('biweekly') }}
              </span>
              <span v-if="formCruzaMes" class="tag tag-wrap">{{ t('crossesMonth') }}</span>
            </div>

            <p v-if="conflicto" class="conflict-msg" role="alert">
              <i class="bi bi-exclamation-circle"></i>
              {{ conflicto === 'type' ? t('typeTaken') : conflicto === 'full' ? t('pickCutoff') : t('daysTaken') }}
            </p>
          </div>

          <button
            type="button"
            class="btn-save"
            :disabled="!!conflicto || guardando || cargando"
            @click="addCorte"
            :title="t('addBtnTitle')"
          >
            <i class="bi bi-plus-lg"></i>
            <span>{{ t('addRule') }}</span>
          </button>
        </div>
      </section>

      <!-- ============ CONFIGURACIONES ACTIVAS ============ -->
      <section class="card saved-section">
        <div class="section-heading">
          <div class="section-icon"><i class="bi bi-list-ul"></i></div>
          <div class="heading-grow">
            <h3>{{ t('activeConfigs') }}</h3>
            <p>{{ cortes.length }} {{ cortes.length === 1 ? t('configuredRule') : t('configuredRules') }}</p>
          </div>
          <span v-if="cortes.length" class="count-badge">{{ cortes.length }}</span>
        </div>

        <div v-if="cortes.length === 0" class="empty-state">
          <div class="empty-icon"><i class="bi bi-calendar-plus"></i></div>
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
                  <i class="bi bi-arrow-right"></i>
                  {{ t('dayLabel') }} {{ item.termino }}
                </strong>
                <span class="type-badge" :class="item.tipo === 'Mensual' ? 'badge-mes' : 'badge-quin'">
                  {{ item.tipo === 'Mensual' ? t('monthly') : t('biweekly') }}
                </span>
              </div>

              <div class="saved-bottom">
                <span class="meta cutoff-info">
                  <i class="bi bi-scissors"></i>
                  {{ t('cutoffLabel') }} <strong>{{ item.cortes.join(', ') }}</strong>
                </span>
                <span class="meta"><i class="bi bi-calendar-range"></i> {{ diasEnRango(item) }} {{ t('daysUnit') }}</span>
                <span v-if="cruzaMes(item)" class="meta wrap-meta">
                  <i class="bi bi-arrow-repeat"></i> {{ t('crossesMonth') }}
                </span>
              </div>
            </div>

            <button
              type="button"
              class="icon-del"
              @click="removeCorte(index)"
              :disabled="guardando || cargando"
              :title="t('delete')"
              :aria-label="t('delete')"
            >
              <i class="bi bi-trash3"></i>
            </button>
          </article>
        </div>
      </section>

      <!-- ============ CALENDARIO ============ -->
      <section class="card calendar-section">
        <div class="calendar-header-info">
          <div class="section-heading no-margin">
            <div class="section-icon"><i class="bi bi-calendar3"></i></div>
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
          <div v-for="n in 31" :key="n" :class="['cal-day', getDayClass(n)]" :title="`${t('dayLabel')} ${n}`">
            <span>{{ n }}</span>
            <i v-if="getDayClass(n) === 'is-corte'" class="bi bi-scissors cut-icon"></i>
          </div>
        </div>

        <div v-if="cortes.length === 0" class="calendar-hint">
          <i class="bi bi-info-circle"></i>
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
  cortes: number[];
  tipo: string;
}

const settings = reactive({
  idioma: localStorage.getItem('GYM_MANAGER-idioma') || 'es'
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
    periodConfigDesc: 'Define el inicio, el término y los días de corte.',
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
    allTaken: 'Ya registraste un corte mensual y uno quincenal. Elimina uno para agregar otro.',
    pickCutoff: 'Selecciona al menos un día de corte.',
    multiHint: 'puedes elegir varios',
    selectDays: 'Selecciona los días de corte',
    daysSelected: 'seleccionados',
    selectAll: 'Todos',
    clear: 'Limpiar',
    done: 'Listo',
    cutoffHelp: 'Solo se muestran los días dentro del periodo.'
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
    periodConfigDesc: 'Define the start, the end and the cutoff days.',
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
    allTaken: 'You already registered one monthly and one biweekly cutoff. Delete one to add another.',
    pickCutoff: 'Select at least one cutoff day.',
    multiHint: 'you can pick several',
    selectDays: 'Select cutoff days',
    daysSelected: 'selected',
    selectAll: 'All',
    clear: 'Clear',
    done: 'Done',
    cutoffHelp: 'Only days within the period are shown.'
  }
};

const t = (key: string) =>
  translations[settings.idioma]?.[key] || translations.es?.[key] || key;

const form = reactive<CorteItem>({
  inicio: 1,
  termino: 15,
  corte: 2,
  cortes: [2],
  tipo: 'Mensual'
});

const cortes = ref<CorteItem[]>([]);
const cargando = ref(false);
const guardando = ref(false);
const selectedSede = ref<number>(0);
const toastRef = ref<any>(null);

const base = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const api = `${base}${base.endsWith('/api') ? '' : '/api'}/gym/cortes`;
const token = () => sessionStorage.getItem('auth_token') || '';
const obtenerSede = () => Number(sessionStorage.getItem('selected_sede_id') || 0);

const request = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${api}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Error HTTP ${res.status}`);
  return data;
};

const cargarCortes = async () => {
  const sede = obtenerSede();
  selectedSede.value = sede;
  if (!sede) {
    cortes.value = [];
    toastRef.value?.notify?.('Selecciona una sucursal', 'error');
    return;
  }
  cargando.value = true;
  try {
    const data = await request(`?sede_id=${sede}`);
    cortes.value = (Array.isArray(data) ? data : data.data || []).map((x: any) => ({
      id: Number(x.ID_Corte_Regla),
      inicio: Number(x.Inicio),
      termino: Number(x.Termino),
      corte: Number(x.Corte),
      cortes: (Array.isArray(x.Dias_Corte) ? x.Dias_Corte : [Number(x.Corte)]).map(Number),
      tipo: x.Tipo_Pago
    }));
  } catch (e: any) {
    cortes.value = [];
    toastRef.value?.notify?.(e.message, 'error');
  } finally {
    cargando.value = false;
  }
};

const cruzaMes = (c: { inicio: number; termino: number }) => c.inicio > c.termino;
const formCruzaMes = computed(() => cruzaMes(form));

const diasEnRango = (c: { inicio: number; termino: number }) =>
  cruzaMes(c) ? 31 - c.inicio + 1 + c.termino : c.termino - c.inicio + 1;

const enRango = (n: number, c: CorteItem) =>
  cruzaMes(c) ? n >= c.inicio || n <= c.termino : n >= c.inicio && n <= c.termino;

const tipoRegistrado = (_tipo: string) => false;
const diaOcupado = (n: number) => cortes.value.some((c) => enRango(n, c));
const diasDe = (c: CorteItem) =>
  Array.from({ length: 31 }, (_, i) => i + 1).filter((n) => enRango(n, c));

/* ---------- Select múltiple de días de corte ---------- */
const cortesOpen = ref(false);
const cortesBox = ref<HTMLElement | null>(null);

const syncCorte = () => {
  form.corte = form.cortes[0] || 0;
};
const toggleCorte = (n: number) => {
  form.cortes = form.cortes.includes(n)
    ? form.cortes.filter((x) => x !== n)
    : [...form.cortes, n].sort((a, b) => a - b);
  syncCorte();
};
const selectAllCortes = () => {
  form.cortes = diasDe(form);
  syncCorte();
};
const clearCortes = () => {
  form.cortes = [];
  syncCorte();
};
const onDocClick = (e: MouseEvent) => {
  if (cortesOpen.value && cortesBox.value && !cortesBox.value.contains(e.target as Node)) {
    cortesOpen.value = false;
  }
};

watch([() => form.inicio, () => form.termino], () => {
  form.cortes = form.cortes.filter((n) => enRango(n, form));
  syncCorte();
});

const conflicto = computed<'type' | 'days' | 'full' | null>(() => {
  if (!form.cortes.length) return 'full';
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
  if (!sede) {
    toastRef.value?.notify?.('Selecciona una sucursal', 'error');
    return;
  }
  guardando.value = true;
  try {
    await request('', {
      method: 'POST',
      body: JSON.stringify({
        sede_id: sede,
        inicio: form.inicio,
        termino: form.termino,
        corte: form.cortes[0],
        cortes: form.cortes,
        tipo: form.tipo
      })
    });
    await cargarCortes();
    window.dispatchEvent(new CustomEvent('factorfit:cortes-changed', { detail: { sede_id: sede } }));
    toastRef.value?.notify?.(t('successMsg'), 'success');
  } catch (e: any) {
    toastRef.value?.notify?.(e.message, 'error');
  } finally {
    guardando.value = false;
  }
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
  } catch (e: any) {
    toastRef.value?.notify?.(e.message, 'error');
  } finally {
    guardando.value = false;
  }
};

const getDayClass = (n: number) => {
  if (cortes.value.some((c) => c.cortes.includes(n))) return 'is-corte';
  const rangeMatch = cortes.value.find((c) => enRango(n, c));
  if (!rangeMatch) return 'default-bg';
  return rangeMatch.tipo === 'Mensual' ? 'mes' : 'quin';
};

const handleLanguageChange = (e: Event) => {
  const customEvent = e as CustomEvent;
  if (customEvent.detail?.idioma) settings.idioma = customEvent.detail.idioma;
};

onMounted(() => {
  window.addEventListener('idioma-changed', handleLanguageChange);
  window.addEventListener('factorfit:branch-changed', cargarCortes);
  document.addEventListener('click', onDocClick);
  cargarCortes();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLanguageChange);
  window.removeEventListener('factorfit:branch-changed', cargarCortes);
  document.removeEventListener('click', onDocClick);
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
</style>