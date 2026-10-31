<template>
  <div class="form-panel glass-effect">
    <NotificationSystem ref="toastRef" />

    <div class="panel-header">
      <div class="header-top">
        <span class="header-icon-badge" aria-hidden="true">🏷️</span>
        <div class="title-group">
          <h2 class="form-title">{{ t('offerTitle') }} <span class="highlight">{{ t('offerHighlight') }}</span></h2>
          <p class="form-subtitle">{{ t('offerSubtitle') }}</p>
        </div>
      </div>
      <button type="button" class="close-x" @click="emit('close')" :aria-label="t('close')">✕</button>
    </div>

    <div class="form-body">
      <div v-if="estaCargando" class="empty-state">{{ t('loading') }}</div>
      <div v-else-if="errorCarga" class="empty-state" role="alert">
        <p class="empty-text">{{ errorCarga }}</p>
        <button type="button" class="retry-btn" @click="obtenerPromociones">{{ t('retry') }}</button>
      </div>
      <div v-else-if="ofertasValidas.length === 0" class="empty-state">{{ t('empty') }}</div>

      <div v-else class="oferta-list">
        <button v-for="oferta in ofertasValidas" :key="oferta.id ?? oferta.nombre" type="button" class="oferta-item" @click="seleccionar(oferta)">
          <span class="icon-wrapper" aria-hidden="true">{{ Number(oferta.personas) > 1 ? '👥' : '⭐' }}</span>

          <span class="offer-title-stack">
            <span class="nombre-oferta">{{ getLocalizedOfferName(oferta.nombre) }}</span>
            <span v-if="Number(oferta.personas) > 1" class="offer-group-label">{{ oferta.personas }} {{ t('people') }}</span>
          </span>

          <span class="oferta-precio">
            <span class="precio">{{ formatoPrecio(oferta.precio) }}</span>
            <span class="arrow-wrapper" aria-hidden="true">→</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

type OfertaItem = {
  id?: number | string;
  id_precio?: number | string;
  ID_Precio?: number | string;
  nombre: string;
  precio: number;
  meses?: number;
  personas?: number;
  periodo?: string;
  Cantidad_Personas?: number;
  [key: string]: unknown;
};

type PrecioApi = {
  ID_Precio: number | string;
  Nombre_Paquete: string;
  Precio: number | string;
  Cantidad_Meses?: number | string | null;
  Cantidad_Personas?: number | string | null;
  Periodo: string;
  Estado_Paquete?: string | null;
};

const props = withDefaults(defineProps<{
  ofertas?: OfertaItem[];
  cargando?: boolean;
  sedeId?: number | string | null;
}>(), { cargando: false });

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select-oferta', oferta: OfertaItem): void;
}>();

const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const idioma = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const promocionesApi = ref<OfertaItem[]>([]);
const cargandoApi = ref(false);
const errorCarga = ref('');
let peticion: AbortController | null = null;

const translations: Record<string, Record<string, string>> = {
  es: {
    offerTitle: 'SELECCIONAR',
    offerHighlight: 'OFERTA',
    offerSubtitle: 'Elige un plan o paquete disponible',
    close: 'Cerrar modal',
    selectedPrefix: 'Seleccionaste: ',
    empty: 'No hay ofertas disponibles para esta sucursal.',
    loading: 'Cargando ofertas...',
    retry: 'Reintentar',
    noSede: 'Selecciona una sucursal para consultar las promociones.',
    noSession: 'Inicia sesión nuevamente para consultar las promociones.',
    failed: 'No se pudieron cargar las promociones.',
    people: 'personas',
    person: 'persona'
  },
  en: {
    offerTitle: 'SELECT',
    offerHighlight: 'OFFER',
    offerSubtitle: 'Choose an available plan or package',
    close: 'Close modal',
    selectedPrefix: 'Selected: ',
    empty: 'No offers available for this branch.',
    loading: 'Loading offers...',
    retry: 'Retry',
    noSede: 'Select a branch to load promotions.',
    noSession: 'Sign in again to load promotions.',
    failed: 'Could not load promotions.',
    people: 'people',
    person: 'person'
  }
};

const offerNameMap: Record<string, Record<string, string>> = {
  es: {
    '3 Meses': '3 Meses',
    '1 Semana': '1 Semana',
    '12 Meses': '12 Meses',
    '1 Mes': '1 Mes'
  },
  en: {
    '3 Meses': '3 Months',
    '1 Semana': '1 Week',
    '12 Meses': '12 Months',
    '1 Mes': '1 Month'
  }
};

const t = (key: string) => translations[idioma.value]?.[key] ?? translations['es']?.[key] ?? key;
const getLocalizedOfferName = (name: string) => offerNameMap[idioma.value]?.[name] ?? name;
const usaOfertasExternas = computed(() => props.ofertas !== undefined);
const estaCargando = computed(() => !!props.cargando || (!usaOfertasExternas.value && cargandoApi.value));

const enteroPersonas = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 30 ? n : 1;
};

const normalizarOferta = (o: OfertaItem): OfertaItem => ({
  ...o,
  id: o.id ?? o.id_precio ?? o.ID_Precio,
  id_precio: o.id_precio ?? o.ID_Precio ?? o.id,
  nombre: String(o.nombre ?? o.Nombre_Paquete ?? '').trim(),
  precio: Number(o.precio ?? o.Precio),
  meses: Number(o.meses ?? o.Cantidad_Meses ?? 1) || 1,
  personas: enteroPersonas(o.personas ?? o.Cantidad_Personas),
  periodo: String(o.periodo ?? o.Periodo ?? 'Promocion'),
  Cantidad_Personas: enteroPersonas(o.personas ?? o.Cantidad_Personas)
});

const ofertasValidas = computed(() =>
  (usaOfertasExternas.value ? props.ofertas ?? [] : promocionesApi.value)
    .map(normalizarOferta)
    .filter(o => o.nombre && Number.isFinite(o.precio) && o.precio >= 0)
);

const formatoPrecio = (precio: number) =>
  new Intl.NumberFormat(idioma.value === 'en' ? 'en-US' : 'es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(precio);

const seleccionar = (o: OfertaItem) => {
  const oferta = normalizarOferta(o);
  if (!oferta.id_precio) {
    toastRef.value?.notify?.('La promoción no tiene ID de tarifa.', 'error');
    return;
  }
  toastRef.value?.notify?.(`${t('selectedPrefix')}${getLocalizedOfferName(oferta.nombre)}`, 'success');
  emit('select-oferta', oferta);
};

const leerSede = (): string => {
  if (props.sedeId !== null && props.sedeId !== undefined && String(props.sedeId) !== '') {
    return String(props.sedeId);
  }
  const guardada = sessionStorage.getItem('selected_sede_id');
  if (guardada) return guardada;
  try {
    const cuenta = JSON.parse(sessionStorage.getItem('gym_account') || '{}');
    const sede = (cuenta.usuario ?? cuenta).sedes?.[0]?.ID_Sede;
    if (sede != null) return String(sede);
  } catch {
    // Sin cuenta en sesión.
  }
  return '';
};

const obtenerPromociones = async () => {
  if (usaOfertasExternas.value) return;
  peticion?.abort();
  const controller = new AbortController();
  peticion = controller;
  errorCarga.value = '';
  promocionesApi.value = [];
  cargandoApi.value = false;

  const sede = leerSede();
  if (!sede) {
    errorCarga.value = t('noSede');
    return;
  }

  const token = sessionStorage.getItem('auth_token');
  if (!token) {
    errorCarga.value = t('noSession');
    return;
  }

  const base = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const url = `${base}${base.endsWith('/api') ? '' : '/api'}/gym/precios?sede_id=${encodeURIComponent(sede)}`;

  cargandoApi.value = true;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const json: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const mensaje = json && typeof json === 'object' && 'message' in json
        ? String(json.message)
        : `Error HTTP ${response.status}`;
      throw new Error(mensaje);
    }

    const rows: unknown = Array.isArray(json)
      ? json
      : json && typeof json === 'object' && 'data' in json
        ? json.data
        : [];

    if (!Array.isArray(rows)) throw new Error(t('failed'));
    if (peticion !== controller) return;

    promocionesApi.value = (rows as PrecioApi[])
      .filter(p =>
        String(p.Periodo ?? '').trim().toLowerCase() === 'promocion' &&
        String(p.Estado_Paquete ?? 'Activo').trim().toLowerCase() === 'activo'
      )
      .map(p => normalizarOferta({
        id: p.ID_Precio,
        ID_Precio: p.ID_Precio,
        nombre: String(p.Nombre_Paquete ?? '').trim(),
        precio: Number(p.Precio),
        meses: Number(p.Cantidad_Meses ?? 1),
        personas: enteroPersonas(p.Cantidad_Personas),
        periodo: p.Periodo
      }));

  } catch (e: unknown) {
    if (!controller.signal.aborted) {
      errorCarga.value = e instanceof Error ? e.message : t('failed');
    }
  } finally {
    if (peticion === controller) cargandoApi.value = false;
  }
};

const idiomaChanged = (e: Event) => {
  const valor = (e as CustomEvent<{ idioma?: string }>).detail?.idioma;
  if (valor) idioma.value = valor;
};

const sedeChanged = () => { void obtenerPromociones(); };

watch(() => props.sedeId, () => { void obtenerPromociones(); });
watch(() => props.ofertas, () => {
  if (!usaOfertasExternas.value) void obtenerPromociones();
});

onMounted(() => {
  window.addEventListener('idioma-changed', idiomaChanged);
  window.addEventListener('factorfit:branch-changed', sedeChanged);
  void obtenerPromociones();
});

onUnmounted(() => {
  peticion?.abort();
  window.removeEventListener('idioma-changed', idiomaChanged);
  window.removeEventListener('factorfit:branch-changed', sedeChanged);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

* { box-sizing: border-box; }

.form-panel {
  --accent-blue: var(--color-highlight, #3b82f6);
  --accent-blue-border: rgba(59, 130, 246, 0.32);
  --accent-amber: #f59e0b;
  --accent-amber-soft: rgba(245, 158, 11, 0.12);
  --accent-amber-border: rgba(245, 158, 11, 0.3);
  --muted: var(--color-texto-secundario, #9a9aa3);

  position: relative;
  display: flex;
  flex-direction: column;
  width: 95%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  max-height: calc(100dvh - 32px);
  padding: 26px;
  overflow: hidden;
  background: var(--bg-cards, #121214);
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.08));
  border-radius: var(--app-border-radius, 22px);
  color: var(--color-texto-general, #f5f5f4);
  font-family: Inter, sans-serif;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
}
.form-panel::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
}

/* ENCABEZADO */
.panel-header { flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.header-top { min-width: 0; display: flex; align-items: center; gap: 12px; }
.header-icon-badge {
  width: 42px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--accent-amber-border); border-radius: 12px;
  background: var(--accent-amber-soft);
  font-size: 1.2rem; line-height: 1;
}
.title-group { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.form-title { margin: 0; color: var(--color-titulos, #fff); font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 700; letter-spacing: 0.4px; }
.form-subtitle { margin: 0; color: var(--muted); font-size: 0.8rem; line-height: 1.35; }
.highlight { color: var(--accent-blue); }
.close-x {
  width: 38px; height: 38px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted); font-family: inherit; font-size: 0.95rem; line-height: 1;
  cursor: pointer; transition: background 0.2s, color 0.2s;
}
.close-x:hover { background: rgba(255, 255, 255, 0.1); color: var(--color-titulos, #fff); }
.close-x:focus-visible, .oferta-item:focus-visible, .retry-btn:focus-visible { outline: 2px solid var(--accent-blue); outline-offset: 2px; }

/* LISTA */
.form-body { min-height: 0; flex: 1; overflow-y: auto; margin: 0 -6px; padding: 2px 6px 4px; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
.oferta-list { display: flex; flex-direction: column; gap: 10px; }

.oferta-item {
  position: relative; overflow: hidden;
  width: 100%; min-height: 68px;
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
  padding: 12px 14px 12px 16px;
  border: 1px solid var(--border-input, rgba(255, 255, 255, 0.06)); border-radius: var(--app-border-radius, 14px);
  background: var(--bg-input, #09090b);
  color: inherit; font: inherit; text-align: left;
  cursor: pointer; transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.oferta-item::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--accent-amber); opacity: 0.7; transition: opacity 0.2s, width 0.2s; }
.oferta-item:hover { transform: translateY(-2px); border-color: var(--accent-blue-border); background: var(--bg-cards, rgba(255, 255, 255, 0.04)); }
.oferta-item:hover::before { width: 4px; opacity: 1; }
.oferta-item:active { transform: scale(0.99); }

.icon-wrapper {
  width: 38px; height: 38px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; background: var(--accent-amber-soft);
  font-size: 1.1rem; line-height: 1;
}
.offer-title-stack { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
.nombre-oferta { color: var(--color-titulos, #fff); font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.2px; line-height: 1.2; overflow-wrap: anywhere; }
.offer-group-label {
  padding: 2px 9px; border: 1px solid var(--accent-amber-border); border-radius: 999px;
  background: var(--accent-amber-soft); color: var(--accent-amber);
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap;
}
.oferta-precio { display: flex; align-items: center; gap: 10px; flex-shrink: 0; color: #34d399; font-weight: 700; }
.precio { font-family: 'IBM Plex Mono', monospace; font-size: 1.05rem; letter-spacing: 0.2px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arrow-wrapper { color: var(--muted); font-size: 1.1rem; line-height: 1; transition: transform 0.2s, color 0.2s; }
.oferta-item:hover .arrow-wrapper { color: var(--accent-blue); transform: translateX(3px); }

/* ESTADOS */
.empty-state { padding: 26px 12px; color: var(--muted); font-size: 0.88rem; line-height: 1.5; text-align: center; }
.empty-text { margin: 0 0 12px; }
.retry-btn {
  min-height: 40px; padding: 8px 18px;
  border: 1px solid var(--accent-blue-border); border-radius: 10px;
  background: transparent; color: var(--accent-blue);
  font-family: inherit; font-size: 0.88rem; font-weight: 600; cursor: pointer;
}

/* CELULAR: hoja inferior a lo ancho */
@media (max-width: 600px) {
  .form-panel {
    width: 100%; max-width: none;
    max-height: calc(100vh - 24px); max-height: calc(100dvh - 24px);
    padding: 22px 16px calc(18px + env(safe-area-inset-bottom, 0px));
  }
  .panel-header { margin-bottom: 16px; }
  .form-title { font-size: 1.05rem; }
  .form-subtitle { font-size: 0.78rem; }
  .oferta-item { min-height: 72px; padding: 12px 12px 12px 14px; gap: 10px; }
}

@media (max-width: 400px) {
  .form-panel { padding: 20px 14px calc(16px + env(safe-area-inset-bottom, 0px)); }
  .header-icon-badge { width: 38px; height: 38px; }
  .icon-wrapper { width: 34px; height: 34px; }
  .nombre-oferta { font-size: 0.92rem; }
  .precio { font-size: 0.95rem; }
  .oferta-precio { gap: 6px; }
}

@media (prefers-reduced-motion: reduce) {
  .oferta-item, .arrow-wrapper, .oferta-item::before { transition: none !important; }
}
</style>