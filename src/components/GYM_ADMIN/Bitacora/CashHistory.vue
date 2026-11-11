<template>
  <HeadingGYM_ADMIN>
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ tx('Historial de caja', 'Cash register history') }}</h1>
          <span class="title-underline"></span>
          <p class="main-subtitle">{{ tx('Control de aperturas, cierres, ingresos y diferencias por sucursal.', 'Track cash sessions and balances by branch.') }}</p>
        </div>
        <div class="actions-bar" id="tutorial-step-0">
          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <select class="status-select" v-model="branch">
              <option v-for="s in branches" :key="s.id" :value="String(s.id)">{{ s.nombre }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <select class="status-select" v-model="status">
              <option value="">{{ tx('Todos los estados', 'All statuses') }}</option>
              <option value="Cerrado">{{ tx('Cerrado', 'Closed') }}</option>
              <option value="Abierto">{{ tx('Abierto', 'Open') }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="date-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <input type="date" class="date-input" v-model="date" :title="tx('Filtrar por fecha', 'Filter by date')" />
          </div>
          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" :placeholder="tx('Buscar responsable, folio...', 'Search employee, reference...')" v-model="search">
            <button v-if="search" class="search-clear" type="button" @click="search = ''" aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button v-if="hasFilters" class="btn-ghost" type="button" @click="reset">{{ tx('Limpiar', 'Clear') }}</button>
        </div>
      </header>
      <p v-if="loading" role="status" class="history-message">Cargando registros...</p>
      <p v-if="loadError" role="alert" class="history-message">{{ loadError }} <button type="button" @click="loadRecords">Reintentar</button></p>
      <!-- RESUMEN -->
      <section class="stats-row">
        <div class="stat-card" v-for="s in stats" :key="s.label" :class="'stat-' + s.tone">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </section>
      <!-- ESCRITORIO -->
      <div class="table-container desktop-only" :id="!isMobile ? 'tutorial-step-1' : undefined">
        <table class="user-table">
          <thead>
            <tr>
              <th>{{ tx('Folio', 'Reference') }}</th>
              <th>{{ tx('Fecha', 'Date') }}</th>
              <th>{{ tx('Sucursal', 'Branch') }}</th>
              <th>{{ tx('Responsable', 'Employee') }}</th>
              <th>{{ tx('Estado', 'Status') }}</th>
              <th class="th-right">{{ tx('Diferencia', 'Difference') }}</th>
              <th class="th-right">{{ tx('Recaudado', 'Collected') }}</th>
              <th class="th-right"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(x, index) in paged" :key="x.id">
              <td class="text-bold">#{{ x.id }}</td>
              <td class="text-muted nowrap">{{ x.fecha }}</td>
              <td><span class="type-chip">{{ x.sede }}</span></td>
              <td>
                <div class="person-cell">
                  <div class="avatar-small" :style="avatarStyle(x.id)">{{ getInitials(x.responsable) }}</div>
                  <span class="text-bold">{{ x.responsable }}</span>
                </div>
              </td>
              <td><span :class="['status-badge2', x.estado === 'Cerrado' ? 'tag-green' : 'tag-yellow']">{{ statusLabel(x.estado) }}</span></td>
              <td class="td-right" :class="{ 'text-warn': delta(x) !== 0 && x.estado === 'Cerrado' }">{{ x.estado === 'Cerrado' ? money(delta(x)) : '—' }}</td>
              <td class="td-right"><span class="status-badge income">{{ money(collected(x)) }}</span></td>
              <td class="td-right"><div class="details-cell" :id="!isMobile && index === 0 ? 'tutorial-step-2' : undefined"><button class="btn-link" type="button" @click="selected = x">{{ tx('Ver corte', 'View') }}</button></div></td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="8" class="empty-state-cell">
                <div class="empty-state">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>{{ tx('No se encontraron cortes.', 'No cash sessions found.') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">{{ filtered.length }} {{ tx('resultados', 'results') }}</div>
      </div>
      <!-- MÓVIL -->
      <div class="mobile-only">
        <div v-for="(x, index) in paged" :key="x.id" class="user-card" :id="isMobile && index === 0 ? 'tutorial-step-1' : undefined">
          <div class="card-top-section">
            <div class="avatar-small" :style="avatarStyle(x.id)">{{ getInitials(x.responsable) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ x.responsable }}</div>
              <div class="badges-row">
                <span :class="['status-badge2', x.estado === 'Cerrado' ? 'tag-green' : 'tag-yellow']">{{ statusLabel(x.estado) }}</span>
                <span class="type-chip">{{ x.sede }}</span>
              </div>
            </div>
            <span class="status-badge income">{{ money(collected(x)) }}</span>
          </div>
          <div class="card-meta">
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>#{{ x.id }} · {{ x.fecha }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{{ x.apertura }} — {{ x.cierre || '—' }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{{ tx('Diferencia', 'Difference') }}: <span :class="{ 'text-warn': delta(x) !== 0 && x.estado === 'Cerrado' }">{{ x.estado === 'Cerrado' ? money(delta(x)) : '—' }}</span></span>
          </div>
          <button class="btn-card" type="button" :id="isMobile && index === 0 ? 'tutorial-step-2' : undefined" @click="selected = x">{{ tx('Ver corte', 'View') }}</button>
        </div>
        <div v-if="filtered.length === 0" class="empty-state-mobile">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{{ tx('No se encontraron cortes.', 'No cash sessions found.') }}</span>
        </div>
      </div>
      <!-- PAGINACIÓN (solo con más de 40 resultados) -->
      <nav v-if="showPager" class="pager" :aria-label="tx('Paginación', 'Pagination')">
        <button class="pager-btn" type="button" :disabled="page <= 1" :aria-label="tx('Página anterior', 'Previous page')" @click="goPage(page - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page >= totalPages" :aria-label="tx('Página siguiente', 'Next page')" @click="goPage(page + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>
      <!-- Modal detalle -->
      <Teleport to="body">
        <Transition name="rep-pop">
          <div v-if="selected" class="rep-overlay" @click.self="selected = null">
            <div class="rep-modal" role="dialog" aria-modal="true" :aria-label="tx('Detalle del corte', 'Cash session details')">
              <button class="rep-close" type="button" :aria-label="tx('Cerrar', 'Close')" @click="selected = null">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div class="rep-scroll">
                <!-- Quién y estado -->
                <header class="detail-head">
                  <div class="avatar-small avatar-lg" :style="avatarStyle(selected.id)">{{ getInitials(selected.responsable) }}</div>
                  <div class="detail-who">
                    <span class="detail-kicker">{{ tx('Detalle del corte', 'Cash session details') }} · #{{ selected.id }}</span>
                    <h2>{{ selected.responsable }}</h2>
                    <div class="detail-tags">
                      <span :class="['status-badge2', selected.estado === 'Cerrado' ? 'tag-green' : 'tag-yellow']">{{ statusLabel(selected.estado) }}</span>
                      <span class="type-chip">{{ selected.sede }}</span>
                    </div>
                  </div>
                </header>
                <!-- Resumen -->
                <div class="detail-hero">
                  <div class="hero-card hero-ok">
                    <span class="hero-label">{{ tx('Total recaudado', 'Total collected') }}</span>
                    <strong class="hero-value">{{ money(collected(selected)) }}</strong>
                  </div>
                  <div class="hero-card" :class="diffClass">
                    <span class="hero-label">{{ tx('Diferencia', 'Difference') }}</span>
                    <strong class="hero-value">{{ selected.estado === 'Cerrado' ? money(delta(selected)) : '—' }}</strong>
                  </div>
                </div>
                <!-- Datos del corte -->
                <dl class="detail-grid">
                  <div class="detail-item" v-for="r in detailRows" :key="r.k">
                    <dt>{{ r.k }}</dt>
                    <dd>{{ r.v || '—' }}</dd>
                  </div>
                </dl>
                <!-- Por método -->
                <section class="diff-section">
                  <h3 class="diff-title">{{ tx('Recaudado por método', 'Collected by method') }}</h3>
                  <dl class="detail-grid method-grid">
                    <div class="detail-item" v-for="r in methodRows" :key="r.k">
                      <dt>{{ r.k }}</dt>
                      <dd>{{ r.v }}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>
  </HeadingGYM_ADMIN>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import HeadingGYM_ADMIN from '../HeadingGYM_ADMIN.vue';
// @ts-ignore: useLang.js no trae archivo de tipos
import { useLang } from '../useLang.js';
const { lang } = useLang();
const route = useRoute();
const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') selected.value = null; };
onMounted(() => window.addEventListener('keydown', onEsc));
onUnmounted(() => window.removeEventListener('keydown', onEsc));
const isMobile = ref<boolean>(window.innerWidth <= 900);
const updateWidth = (): void => { isMobile.value = window.innerWidth <= 900; };
onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));
const tx = (es: string, en: string) => (lang.value === 'en' ? en : es);
interface Cash { sedeId: number; id: number; fecha: string; sede: string; responsable: string; apertura: string; cierre: string; fondo: number; efectivo: number; tarjeta: number; transferencia: number; contado: number | null; estado: 'Abierto' | 'Cerrado' }
const records = ref<Cash[]>([]);
const money = (n: number) => new Intl.NumberFormat(lang.value === 'en' ? 'en-US' : 'es-MX', { style: 'currency', currency: 'MXN' }).format(n);
const collected = (x: Cash) => x.efectivo + x.tarjeta + x.transferencia;
const expected = (x: Cash) => x.fondo + x.efectivo;
const delta = (x: Cash) => (x.contado === null ? 0 : x.contado - expected(x));
const statusLabel = (e: 'Abierto' | 'Cerrado') => tx(e, e === 'Cerrado' ? 'Closed' : 'Open');
const search = ref('');
const branch = ref('1');
const sedeEvento = ref(0);
const sedeActiva = (): number => {
  if (sedeEvento.value > 0) return sedeEvento.value;
  const query = Number(route.query.sede_id); if (Number.isInteger(query) && query > 0) return query;
  for (const store of [sessionStorage, localStorage]) for (const key of ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id']) {
    const raw = store.getItem(key); if (!raw) continue;
    try { const o = JSON.parse(raw); const v = typeof o === 'object' && o ? (o.ID_Sede ?? o.sede_id ?? o.id ?? o.value) : o; const id = Number(v); if (Number.isInteger(id) && id > 0) return id; }
    catch { const id = Number(raw); if (Number.isInteger(id) && id > 0) return id; }
  }
  return 1;
};
const status = ref('');
const date = ref('');
const page = ref(1);
const selected = ref<Cash | null>(null);
const branches = ref<{ id: number; nombre: string }[]>([]);
const scoped = computed(() => records.value.filter(x => Number(branch.value) === x.sedeId));
const filtered = computed(() => {
  const term = search.value.toLowerCase().trim();
  return scoped.value.filter(x =>
    (!status.value || x.estado === status.value) &&
    (!date.value || x.fecha === date.value) &&
    Object.values(x).join(' ').toLowerCase().includes(term)
  );
});
const PAGE_SIZE = 40;
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));
const showPager = computed(() => filtered.value.length > PAGE_SIZE);
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const goPage = (n: number): void => {
  page.value = Math.min(Math.max(1, n), totalPages.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const hasFilters = computed(() => !!(search.value || status.value || date.value));
watch([search, branch, status, date], () => { page.value = 1; });
watch(totalPages, n => { if (page.value > n) page.value = n; });
const reset = () => { search.value = ''; status.value = ''; date.value = ''; };
const total = computed(() => filtered.value.reduce((a, x) => a + collected(x), 0));
const cashTotal = computed(() => filtered.value.reduce((a, x) => a + x.efectivo, 0));
const difference = computed(() => filtered.value.filter(x => x.estado === 'Cerrado').reduce((a, x) => a + delta(x), 0));
const stats = computed(() => [
  { label: tx('Efectivo registrado', 'Recorded cash'), value: money(total.value), tone: 'green' },
  { label: tx('Efectivo estimado', 'Estimated cash'), value: money(cashTotal.value), tone: 'blue' },
  { label: tx('Diferencia neta', 'Net difference'), value: money(difference.value), tone: 'orange' },
  { label: tx('Cortes cerrados', 'Closed sessions'), value: String(filtered.value.filter(x => x.estado === 'Cerrado').length), tone: 'purple' }
]);
const detailRows = computed(() => {
  const s = selected.value;
  if (!s) return [];
  return [
    { k: tx('Apertura', 'Opening'), v: s.apertura },
    { k: tx('Cierre', 'Closing'), v: s.cierre || '—' },
    { k: tx('Fondo inicial', 'Opening float'), v: money(s.fondo) },
    { k: tx('Efectivo esperado', 'Expected cash'), v: money(expected(s)) },
    { k: tx('Efectivo contado', 'Counted cash'), v: s.contado === null ? '—' : money(s.contado) }
  ];
});
const methodRows = computed(() => {
  const s = selected.value;
  if (!s) return [];
  return [
    { k: tx('Efectivo', 'Cash'), v: money(s.efectivo) },
    { k: tx('Tarjeta', 'Card'), v: money(s.tarjeta) },
    { k: tx('Transferencia', 'Transfer'), v: money(s.transferencia) }
  ];
});
const diffClass = computed(() => {
  const s = selected.value;
  if (!s || s.estado !== 'Cerrado') return 'hero-neutral';
  return delta(s) === 0 ? 'hero-ok' : 'hero-warn';
});
const avatarGradients: string[] = [
  'linear-gradient(135deg, #7e22ce, #4c1d95)',
  'linear-gradient(135deg, #ea580c, #9a3412)',
  'linear-gradient(135deg, #db2777, #9d174d)',
  'linear-gradient(135deg, #dc2626, #7f1d1d)',
  'linear-gradient(135deg, #2563eb, #1e3a8a)',
  'linear-gradient(135deg, #059669, #064e3b)'
];
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};
const avatarStyle = (id: number) => ({ backgroundImage: avatarGradients[id % avatarGradients.length] });
const loading = ref(false);
const loadError = ref('');
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const token = (): string => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['auth_token','token','access_token','gym_token','GYM_ADMIN_token','gymAccountToken']) { const v = store.getItem(key); if (v) return v.replace(/^Bearer\s+/i,''); }
    for (const key of ['auth','user','session','gymAccount','GYM_ADMIN']) { try { const p = JSON.parse(store.getItem(key) || 'null'); const v = p?.token || p?.access_token || p?.accessToken; if (v) return String(v).replace(/^Bearer\s+/i,''); } catch {} }
  }
  return '';
};
let activeRequest = 0;
const authGet = async (path: string) => {
  const t = token();
  if (!t) throw new Error('Inicia sesión nuevamente para consultar el historial.');
  const res = await fetch(`${API}/api/gym/${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${t}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error HTTP ${res.status}`);
  return data;
};
const loadBranches = async (): Promise<void> => {
  try {
    const d = await authGet('sedes');
    branches.value = (Array.isArray(d) ? d : (d.sedes || [])).map((x: any) => { const id = Number(x.ID_Sede ?? x.id); return {id, nombre: String(x.Sede_Colonia || x.nombre || `Sede ${id}`)}; }).filter((x: {id:number}) => Number.isInteger(x.id) && x.id > 0);
    const current = sedeActiva();
    if (branches.value.some(x => x.id === current)) branch.value = String(current);
    else if (branches.value.length) branch.value = String(branches.value[0]?.id);
    else loadError.value = 'No hay sedes registradas para este gimnasio.';
  } catch (e: any) { loadError.value = e.message || 'No fue posible consultar las sedes.'; }
};
const loadRecords = async (): Promise<void> => {
  const request = ++activeRequest;
  if (!branches.value.some(x => x.id === Number(branch.value))) { records.value = []; loadError.value = 'Selecciona una sede autorizada.'; loading.value = false; return; }
  loading.value = true; loadError.value = ''; records.value = [];
  try {
    const d = await authGet(`historiales/caja?sede_id=${encodeURIComponent(branch.value)}`);
    if (request === activeRequest) records.value = (Array.isArray(d.registros) ? d.registros : []).map((x: any) => ({...x, sedeId: Number(x.sedeId ?? branch.value), id: Number(x.id), fondo: Number(x.fondo ?? 0), efectivo: Number(x.efectivo ?? 0), tarjeta: Number(x.tarjeta ?? 0), transferencia: Number(x.transferencia ?? 0), contado: x.contado === null || x.contado === undefined ? null : Number(x.contado)}));
  } catch (e: any) { if (request === activeRequest) loadError.value = e.message || 'No fue posible cargar el historial.'; }
  finally { if (request === activeRequest) loading.value = false; }
};
const cambioSede = (event?: Event): void => {
  const detail = (event as CustomEvent<Record<string, unknown>> | undefined)?.detail;
  const id = Number(detail?.sede_id ?? detail?.sedeId ?? detail?.selectedSedeId ?? detail?.ID_Sede ?? detail?.id ?? 0);
  sedeEvento.value = Number.isInteger(id) && id > 0 ? id : 0;
  const next = sedeActiva();
  if (branches.value.some(s => s.id === next) && branch.value !== String(next)) branch.value = String(next);
};
watch(branch, () => { selected.value = null; void loadRecords(); });
watch(() => route.query.sede_id, () => { sedeEvento.value = 0; cambioSede(); });
onMounted(async () => { window.addEventListener('factorfit:branch-changed', cambioSede); await loadBranches(); if (branches.value.some(x => x.id === Number(branch.value)) && !loading.value) await loadRecords(); });
onUnmounted(() => { activeRequest++; window.removeEventListener('factorfit:branch-changed', cambioSede); });
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
.main-content { --tone-main: #34d399; --accent: var(--color-highlight, #3b82f6); --income: #34d399; --card-bg: var(--bg-cards, #121416); --radius: var(--app-border-radius, 14px); --radius-small: 10px; --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent); --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent); --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 68%, transparent); }
.main-content *,
.main-content *::before,
.main-content *::after { box-sizing: border-box; }
.main-content { width: 100%; max-width: 1500px; margin: 0 auto; padding: 34px 36px 55px; color: var(--color-texto-general, #e5e7eb); font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
.header-section { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.title-wrapper { min-width: 240px; display: flex; flex-direction: column; gap: 6px; }
.main-title { margin: 0; color: var(--color-titulos, #ffffff); font-family: 'Anton', sans-serif; font-size: clamp(1.9rem, 3vw, 2.55rem); font-weight: 400; line-height: 1; letter-spacing: 0.02em; text-transform: uppercase; }
.title-underline { display: block; width: 58px; height: 3px; margin-top: 2px; border-radius: 999px; background: linear-gradient(90deg, var(--tone-main), transparent); }
.main-subtitle { max-width: 560px; margin: 1px 0 0; color: var(--muted); font-size: 0.82rem; font-weight: 500; line-height: 1.5; }
.actions-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.search-wrapper, .select-wrapper, .date-wrapper { position: relative; display: flex; align-items: center; }
.search-icon, .select-icon { position: absolute; z-index: 2; left: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }
.select-arrow { position: absolute; z-index: 2; right: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }
.search-input, .status-select, .date-input { height: 44px; border: 1px solid var(--line); border-radius: var(--radius-small); background: var(--card-bg); color: var(--color-texto-general, #ffffff); font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500; outline: none; transition: width 0.2s ease, border-color 0.18s ease, box-shadow 0.18s ease; }
.search-input:hover, .status-select:hover, .date-input:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 25%, transparent); }
.search-input:focus, .status-select:focus, .date-input:focus { border-color: var(--tone-main); box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone-main) 16%, transparent); }
.search-input { width: 240px; padding: 0 38px 0 40px; }
.search-input:focus { width: 270px; }
.search-input::placeholder { color: var(--muted); opacity: 0.68; }
.search-clear { position: absolute; right: 10px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 50%; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 10%, transparent); color: var(--muted); cursor: pointer; transition: background 0.15s ease; }
.search-clear:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 20%, transparent); }
.status-select { min-width: 190px; padding: 0 38px 0 40px; appearance: none; -webkit-appearance: none; cursor: pointer; color-scheme: dark; }
.status-select option { background: #111315; color: #ffffff; }
.date-input { min-width: 170px; padding: 0 12px 0 40px; color-scheme: dark; cursor: pointer; }
.btn-ghost { height: 44px; padding: 0 14px; border: 1px solid var(--line); border-radius: var(--radius-small); background: transparent; color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
.btn-ghost:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 6%, transparent); color: var(--color-texto-general, #ffffff); }
.btn-bulk { min-height: 44px; display: inline-flex; align-items: center; gap: 10px; padding: 5px 16px 5px 7px; border: 1px solid color-mix(in srgb, var(--tone-main) 34%, transparent); border-radius: var(--radius-small); background: color-mix(in srgb, var(--tone-main) 8%, transparent); color: var(--color-texto-general, #ffffff); font-family: 'Inter', sans-serif; white-space: nowrap; cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
.btn-bulk-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 8px; background: color-mix(in srgb, var(--tone-main) 14%, transparent); color: var(--tone-main); }
.btn-text-wrapper { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; line-height: 1.1; }
.btn-label { color: var(--muted); font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.highlight-text-custom { color: var(--tone-main); font-size: 0.88rem; font-weight: 700; letter-spacing: -0.01em; }
.btn-bulk:hover { border-color: color-mix(in srgb, var(--tone-main) 60%, transparent); background: color-mix(in srgb, var(--tone-main) 13%, transparent); box-shadow: 0 8px 20px color-mix(in srgb, var(--tone-main) 10%, transparent); transform: translateY(-1px); }
.btn-bulk:active { transform: translateY(0); }
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.stat-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 3px; padding: 15px 18px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); }
.stat-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone, var(--accent)); }
.stat-green { --tone: #34d399; }
.stat-blue { --tone: #60a5fa; }
.stat-orange { --tone: #fbbf24; }
.stat-red { --tone: #f87171; }
.stat-purple { --tone: #c084fc; }
.stat-value { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.5rem; font-weight: 600; line-height: 1.15; white-space: nowrap; }
.stat-label { color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
.desktop-only { display: block; }
.mobile-only { display: none; }
.table-container { position: relative; width: 100%; overflow-x: auto; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
.table-container::before { content: ''; position: sticky; display: block; z-index: 3; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--tone-main), transparent); opacity: 0.7; pointer-events: none; }
.user-table { width: 100%; border-collapse: collapse; color: var(--color-texto-general, #e5e7eb); text-align: left; }
.user-table thead { background: color-mix(in srgb, var(--card-bg) 95%, var(--color-texto-general, #ffffff)); }
.user-table th { padding: 15px 18px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.065em; text-transform: uppercase; white-space: nowrap; }
.user-table td { padding: 13px 18px; border-top: 1px solid var(--line-soft); font-size: 0.82rem; vertical-align: middle; }
.user-table tbody tr:first-child td { border-top: none; }
.user-table tbody tr { transition: background 0.17s ease, box-shadow 0.17s ease; }
.th-right, .td-right { text-align: right; }
.nowrap { white-space: nowrap; }
.desc-cell { min-width: 220px; color: var(--color-texto-general, #e5e7eb); }
@media (hover: hover) {
.user-table tbody tr:hover { background: color-mix(in srgb, var(--tone-main) 4%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--tone-main) 80%, transparent); }
}
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.pager-btn { width: 40px; height: 40px; display: grid; place-items: center; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-small); background: var(--card-bg); color: var(--color-texto-general, #e5e7eb); cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease; }
.pager-btn:hover:not(:disabled) { border-color: var(--tone-main); background: color-mix(in srgb, var(--tone-main) 12%, transparent); color: var(--color-titulos, #ffffff); transform: translateY(-1px); }
.pager-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pager-info { min-width: 64px; color: var(--muted); font-size: 0.8rem; font-weight: 600; text-align: center; }
.pager-info b { color: var(--color-titulos, #ffffff); font-weight: 700; }
.table-footer { padding: 11px 18px; border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 0.72rem; font-weight: 500; text-align: right; }
.details-cell { display: inline-flex; }
.avatar-small { width: 41px; height: 41px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 11px; color: #ffffff; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.02em; box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24); }
.person-cell { display: flex; align-items: center; gap: 12px; }
.person-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.small { font-size: 0.72rem; }
.text-bold { color: var(--color-titulos, #ffffff); font-weight: 600; }
.text-muted { color: var(--muted); }
.text-warn { color: #fbbf24; font-weight: 700; }
.type-chip { display: inline-flex; align-items: center; min-height: 26px; padding: 3px 10px; border: 1px solid var(--line); border-radius: 8px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); color: var(--color-texto-general, #e5e7eb); font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
.status-badge2 { min-height: 26px; display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border: 1px solid; border-radius: 999px; font-size: 0.69rem; font-weight: 650; line-height: 1; white-space: nowrap; }
.tag-purple { color: #c084fc; border-color: rgba(192, 132, 252, 0.25); background: rgba(192, 132, 252, 0.08); }
.tag-orange { color: #fb923c; border-color: rgba(251, 146, 60, 0.25); background: rgba(251, 146, 60, 0.08); }
.tag-yellow { color: #fbbf24; border-color: rgba(251, 191, 36, 0.25); background: rgba(251, 191, 36, 0.08); }
.tag-red { color: #f87171; border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.08); }
.tag-blue { color: #60a5fa; border-color: rgba(96, 165, 250, 0.25); background: rgba(96, 165, 250, 0.08); }
.tag-green { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.status-badge { min-height: 27px; display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px; border: 1px solid transparent; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.status-badge.income { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.status-badge.income::before { content: ''; width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.12); }
.btn-link { padding: 6px 10px; border: none; border-radius: 8px; background: transparent; color: var(--tone-main); font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; transition: background 0.15s ease; }
.btn-link:hover { background: color-mix(in srgb, var(--tone-main) 10%, transparent); }
.badges-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.card-meta { display: flex; flex-direction: column; gap: 7px; color: var(--muted); font-size: 0.78rem; }
.meta-row { min-width: 0; display: flex; align-items: center; gap: 7px; }
.meta-row svg { flex-shrink: 0; opacity: 0.65; }
.empty-state-cell { padding: 0 !important; border-top: none !important; }
.empty-state, .empty-state-mobile { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 45px 20px; color: var(--muted); font-size: 0.82rem; font-weight: 500; text-align: center; }
.empty-state svg, .empty-state-mobile svg { opacity: 0.4; }
.modal-buttons { display: flex; gap: 10px; }
.btn-modal { min-height: 42px; flex: 1; padding: 0 16px; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; transition: background 0.18s ease, transform 0.18s ease; }
.btn-modal.secondary { border: 1px solid var(--line); background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); color: var(--color-texto-general, #d1d5db); }
.btn-modal.secondary:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 8%, transparent); transform: translateY(-1px); }
.search-input:focus-visible, .status-select:focus-visible, .date-input:focus-visible, .btn-bulk:focus-visible,
.btn-modal:focus-visible, .search-clear:focus-visible, .btn-link:focus-visible, .pager-btn:focus-visible { outline: 2px solid var(--tone-main); outline-offset: 2px; }
@media (max-width: 1150px) {
.main-content { padding: 30px 24px 48px; }
.header-section { align-items: flex-start; flex-direction: column; gap: 17px; }
.actions-bar { width: 100%; justify-content: flex-start; }
.search-wrapper { flex: 1; min-width: 220px; }
.search-input, .search-input:focus { width: 100%; }
}
@media (max-width: 900px) {
.desktop-only { display: none !important; }
.mobile-only { display: block !important; }
.main-content { width: 100%; max-width: 100%; padding: 20px 14px 36px; overflow-x: hidden; }
.header-section { width: 100%; align-items: stretch; margin-bottom: 16px; }
.title-wrapper { width: 100%; min-width: 0; }
.main-title { font-size: 1.85rem; }
.main-subtitle { max-width: 100%; font-size: 0.76rem; }
.actions-bar { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.search-wrapper { width: 100%; min-width: 0; grid-column: 1 / -1; grid-row: 1; }
.search-input, .search-input:focus { width: 100%; }
.select-wrapper, .date-wrapper { width: 100%; min-width: 0; }
.status-select, .date-input { width: 100%; min-width: 0; text-overflow: ellipsis; }
.btn-ghost, .btn-bulk { width: 100%; min-width: 0; grid-column: 1 / -1; min-height: 44px; }
.stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 14px; }
.stat-card { padding: 12px 14px; }
.stat-value { font-size: 1.2rem; }
.user-card { position: relative; width: 100%; overflow: hidden; margin-bottom: 11px; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 9px 28px rgba(0, 0, 0, 0.17); }
.user-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone-main); }
.card-top-section { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
.user-card .avatar-small { width: 44px; height: 44px; border-radius: 12px; font-size: 0.78rem; }
.card-user-titles { min-width: 0; display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 7px; }
.name-text { width: 100%; overflow: hidden; color: var(--color-titulos, #ffffff); font-size: 0.88rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
.card-meta { display: grid; gap: 8px; padding: 11px 12px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent); font-size: 0.75rem; }
.btn-card { width: 100%; min-height: 40px; margin-top: 11px; border: 1px solid color-mix(in srgb, var(--tone-main) 30%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--tone-main) 8%, transparent); color: var(--tone-main); font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; }
.empty-state-mobile { min-height: 240px; margin-top: 8px; border: 1px dashed var(--line); border-radius: var(--radius); background: var(--card-bg); }
}
@media (max-width: 560px) {
.main-content { padding: 17px 11px 30px; }
.main-title { font-size: 1.7rem; }
.actions-bar { grid-template-columns: 1fr; }
.search-wrapper, .select-wrapper, .date-wrapper, .btn-bulk, .btn-ghost { grid-column: 1; }
.search-wrapper { grid-row: auto; }
.user-card { padding: 15px; }
}
@media (max-width: 380px) {
.main-content { padding-left: 9px; padding-right: 9px; }
.main-title { font-size: 1.55rem; }
.stat-value { font-size: 1.05rem; }
.status-badge, .status-badge2 { font-size: 0.65rem; }
}
@media (prefers-reduced-motion: reduce) {
.search-input, .status-select, .date-input, .btn-bulk, .user-table tbody tr, .btn-modal, .pager-btn { transition: none !important; }
}
/* ---------- Modal de detalle (se teleporta al body, por eso define sus propias variables) ---------- */
.rep-overlay { --tone-main: #34d399; --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent); --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent); --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 68%, transparent); position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(4, 4, 8, 0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); font-family: 'Inter', system-ui, sans-serif; }
.rep-overlay *, .rep-overlay *::before, .rep-overlay *::after { box-sizing: border-box; }
.rep-modal { position: relative; width: min(580px, 100%); max-height: min(88vh, 760px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid color-mix(in srgb, var(--color-texto-general, #fff) 14%, transparent); border-radius: calc(var(--app-border-radius, 16px) * 1.1); background: var(--bg-cards, #121212); box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8); }
.rep-modal::before { content: ''; position: absolute; z-index: 1; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--tone-main), transparent); opacity: 0.8; pointer-events: none; }
.rep-close { position: absolute; top: 14px; right: 14px; z-index: 2; width: 34px; height: 34px; display: grid; place-items: center; padding: 0; border: 1px solid color-mix(in srgb, var(--color-texto-general, #fff) 14%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--color-texto-general, #fff) 7%, transparent); color: var(--color-texto-general, #cbd5e1); cursor: pointer; transition: background .18s ease, color .18s ease, transform .18s ease, border-color .18s ease; }
.rep-close:hover { background: color-mix(in srgb, var(--tone-main) 18%, transparent); border-color: color-mix(in srgb, var(--tone-main) 55%, transparent); color: var(--color-titulos, #fff); transform: rotate(90deg); }
.rep-close:focus-visible { outline: 2px solid var(--tone-main); outline-offset: 2px; }
.rep-scroll { overflow-y: auto; overscroll-behavior: contain; padding: 30px 28px 28px; text-align: left; color: var(--color-texto-general, #fff); scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--color-texto-general, #fff) 30%, transparent) transparent; }
.rep-scroll::-webkit-scrollbar { width: 8px; }
.rep-scroll::-webkit-scrollbar-track { background: transparent; margin: 18px 0; }
.rep-scroll::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: color-mix(in srgb, var(--color-texto-general, #fff) 26%, transparent); background-clip: content-box; }
.rep-scroll::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--tone-main) 75%, transparent); background-clip: content-box; }
/* Encabezado */
.detail-head { display: flex; align-items: center; gap: 16px; padding-right: 42px; margin-bottom: 18px; }
.avatar-lg { width: 60px; height: 60px; border-radius: 17px; font-size: 1.05rem; }
.detail-who { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.detail-kicker { color: var(--muted); font-size: 0.64rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; }
.detail-who h2 { margin: 0; color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.4rem; font-weight: 600; line-height: 1.15; overflow-wrap: anywhere; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 7px; }
/* Resumen destacado */
.detail-hero { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 14px; }
.hero-card { min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 5px; padding: 14px 16px; border: 1px solid var(--line); border-radius: 13px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 3%, transparent); }
.hero-label { color: var(--muted); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.hero-value { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.55rem; font-weight: 600; line-height: 1.1; overflow-wrap: anywhere; }
.hero-value.hero-sm { font-family: 'Inter', sans-serif; font-size: 0.98rem; font-weight: 650; line-height: 1.3; }
.hero-ok { border-color: rgba(52, 211, 153, 0.28); background: rgba(52, 211, 153, 0.07); }
.hero-ok .hero-value { color: #34d399; }
.hero-warn { border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.07); }
.hero-warn .hero-value { color: #fbbf24; }
/* Datos */
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 18px; }
.detail-grid .detail-item:last-child:nth-child(odd) { grid-column: 1 / -1; }
.detail-grid.method-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 0; }
.detail-item { min-width: 0; padding: 11px 13px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 3%, transparent); }
.detail-item dt { margin: 0 0 4px; color: var(--muted); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.detail-item dd { margin: 0; color: var(--color-titulos, #ffffff); font-size: 0.85rem; font-weight: 600; overflow-wrap: anywhere; }
/* Secciones */
.diff-section { margin-bottom: 18px; }
.diff-section:last-child { margin-bottom: 0; }
.diff-title { margin: 0 0 10px; color: var(--muted); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; }
.diff { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 10px; align-items: stretch; }
.diff-col { min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 12px 13px; border: 1px solid; border-radius: 12px; }
.diff-before { border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.06); }
.diff-after { border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.06); }
.diff-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.diff-before .diff-label { color: #f87171; }
.diff-after .diff-label { color: #34d399; }
.diff-col pre { margin: 0; color: var(--color-texto-general, #ffffff); font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 600; line-height: 1.4; white-space: pre-wrap; overflow-wrap: anywhere; }
.diff-arrow { align-self: center; display: grid; place-items: center; color: var(--muted); }
.detail-desc { margin: 0 0 18px; padding: 13px 15px; border: 1px solid color-mix(in srgb, var(--tone-main) 24%, transparent); border-left: 3px solid var(--tone-main); border-radius: 12px; background: color-mix(in srgb, var(--tone-main) 7%, transparent); color: var(--color-texto-general, #ffffff); font-size: 0.86rem; line-height: 1.5; overflow-wrap: anywhere; }
.detail-desc:last-child { margin-bottom: 0; }
.note-label { display: block; margin-bottom: 4px; color: var(--tone-main); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
/* Animación */
.rep-pop-enter-active, .rep-pop-leave-active { transition: opacity .18s ease; }
.rep-pop-enter-active .rep-modal, .rep-pop-leave-active .rep-modal { transition: transform .2s cubic-bezier(.2,.8,.2,1), opacity .18s ease; }
.rep-pop-enter-from, .rep-pop-leave-to { opacity: 0; }
.rep-pop-enter-from .rep-modal, .rep-pop-leave-to .rep-modal { transform: translateY(14px) scale(.97); opacity: 0; }
@media (max-width: 560px) { .rep-overlay { padding: 12px; } .rep-scroll { padding: 26px 18px 22px; } .avatar-lg { width: 52px; height: 52px; border-radius: 15px; } .detail-who h2 { font-size: 1.2rem; } .detail-hero { grid-template-columns: 1fr; } .hero-value { font-size: 1.35rem; } .detail-grid.method-grid { grid-template-columns: 1fr; } .diff { grid-template-columns: 1fr; } .diff-arrow { transform: rotate(90deg); } }
@media (prefers-reduced-motion: reduce) { .rep-close, .rep-pop-enter-active, .rep-pop-leave-active, .rep-pop-enter-active .rep-modal, .rep-pop-leave-active .rep-modal { transition: none !important; } }
</style>