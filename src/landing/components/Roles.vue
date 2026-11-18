<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

/* ================= DATOS ================= */
const DAYS = [
  { key: 'monday', short: 'LUN', long: 'Lunes' },
  { key: 'tuesday', short: 'MAR', long: 'Martes' },
  { key: 'wednesday', short: 'MIÉ', long: 'Miércoles' },
  { key: 'thursday', short: 'JUE', long: 'Jueves' },
  { key: 'friday', short: 'VIE', long: 'Viernes' },
];

/* classes: Lun a Vie. start/end en minutos desde medianoche (vienen del backend). */
interface Row { time: string; period: 'am' | 'pm'; classes: (string | null)[]; colors: (string | null)[]; start: number; end: number }
interface Sede {
  id: string; apiId: number; name: string; short: string; hint: string; tagline: string; address: string;
  accent: string; accent2: string;
  lat: number | null; lng: number | null; exact: boolean; hasMap: boolean;
  mapSrc: string; openUrl: string; dirUrl: string; wazeUrl: string;
}
type Bloque = { id: number; dia: string; titulo: string; color: string; inicio: string; fin: string };
/* El backend puede mandar los campos en Mayúscula_Snake o en minúscula: se aceptan ambos. */
type Sucursal = { ID_Sede: number | string } & Record<string, unknown>;

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');

/* Colores de respaldo por nombre; si el backend manda color, ese tiene prioridad. */
const COLORS: Record<string, string> = {
  'entrenamiento funcional': '#c9a7ff', 'gap': '#7cc4ff', 'glute bands': '#7ee8b0',
  'tabata': '#ff8fa3', 'circuito': '#ffb37a', 'zumba': '#ff8fd8', 'core': '#5eead4',
  'meta hit': '#a5b4fc', 'full body': '#ffd36b', 'power rebounder': '#fff07a', 'clase libre': '#e5e7eb',
};
const hexValido = (color: string) => /^#[0-9a-f]{6}$/i.test(color) ? color : '';
const colorMap = ref<Record<string, string>>({});
const colorOf = (name: string) => {
  const k = name.toLowerCase();
  return colorMap.value[k] ?? COLORS[k] ?? '#f5d0fe';
};

/* Figuras que flotan en el fondo (pocas, para que no se trabe en celular) */
const KINDS = ['heart', 'dot', 'star', 'dot', 'heart', 'dot', 'star'] as const;
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 41 + 9) % 100,
  size: 8 + ((i * 7) % 12),
  dur: 20 + ((i * 5) % 16),
  delay: -((i * 3) % 22),
  drift: ((i * 13) % 80) - 40,
  kind: KINDS[i % KINDS.length]!,
}));

/* Título por palabras (solo presentación) */
const TITLE_WORDS = [
  { t: 'No', g: false }, { t: 'podemos', g: false }, { t: 'esperar', g: false },
  { t: 'a', g: true }, { t: 'verte', g: true },
];
const TITLE_TEXT = TITLE_WORDS.map(w => w.t).join(' ');

/* ================= ESTADO ================= */
const sedeId = ref('');
const day = ref(0);
const dir = ref(0); // dirección de la animación al cambiar de día (-1 / 1)
const todayIdx = ref(-1);
const view = ref<'day' | 'week'>('week');
const nowMin = ref(-1);
const copied = ref(false);
const mapReady = ref(false);

/* Sedes y horario desde el backend */
const sucursales = ref<Sucursal[]>([]);
const cargandoSedes = ref(false);
const errorSedes = ref('');

const PALETA = [
  ['#a78bfa', '#7c3aed'], ['#ff8a9b', '#e6397b'],
  ['#60a5fa', '#2563eb'], ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'], ['#f472b6', '#db2777'],
];

/* ---------- Dirección y ubicación EXACTA de cada sede ---------- */
const pick = (x: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) {
    const v = x[k];
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      if (s) return s;
    }
  }
  return '';
};
const toNum = (v: string) => (v ? Number(v.replace(',', '.')) : NaN);

/** Coordenadas válidas (o null). Con esto el mapa cae justo en el punto de la sede. */
function coordsDe(x: Sucursal): { lat: number; lng: number } | null {
  const lat = toNum(pick(x, 'Latitud', 'latitud', 'Lat', 'lat'));
  const lng = toNum(pick(x, 'Longitud', 'longitud', 'Lng', 'lng', 'Lon', 'lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) return null;
  return { lat, lng };
}

function partesDireccion(x: Sucursal) {
  const calle = pick(x, 'Calle', 'calle') || pick(x, 'Direccion', 'direccion');
  const ext = pick(x, 'Numero_Ext', 'numero_ext');
  const int = pick(x, 'Numero_Int', 'numero_int');
  return {
    via: [calle, ext ? `#${ext}` : '', int ? `Int. ${int}` : ''].filter(Boolean).join(' '),
    colonia: pick(x, 'Colonia', 'colonia', 'Sede_Colonia'),
    ciudad: pick(x, 'Ciudad', 'ciudad', 'Municipio', 'municipio'),
    estado: pick(x, 'Estado', 'estado', 'Entidad', 'entidad'),
    cp: pick(x, 'CP', 'cp', 'Codigo_Postal', 'codigo_postal'),
  };
}

const norm = (s: string) => s.toLocaleLowerCase('es-MX');

const SEDES = computed<Sede[]>(() => sucursales.value.map((x, i) => {
  const nombre = pick(x, 'Nombre_Sede', 'nombre_sede', 'Sede_Colonia') || `Sede ${x.ID_Sede}`;
  const short = nombre.replace(/^sede\s+/i, '');
  const p = partesDireccion(x);
  const coords = coordsDe(x);

  const address = [p.via, p.colonia ? `Col. ${p.colonia}` : '', p.ciudad, p.estado, p.cp ? `C.P. ${p.cp}` : '']
    .filter(Boolean).join(', ') || 'Dirección no registrada';
  const consulta = (p.via || p.colonia || p.ciudad)
    ? [p.via, p.colonia, p.ciudad, p.estado, p.cp, 'México'].filter(Boolean).join(', ')
    : '';

  /* Pista corta bajo el nombre (nunca repite el nombre) */
  let hint = p.colonia;
  if (!hint || norm(hint) === norm(short)) hint = p.via;
  if (!hint || norm(hint) === norm(short)) hint = p.ciudad;
  if (norm(hint) === norm(short)) hint = '';

  const baseNombre = norm(nombre);
  const color = baseNombre.includes('emiliano zapata') ? PALETA[0]! :
    baseNombre.includes('obrera') ? PALETA[1]! : PALETA[(i + 2) % PALETA.length]!;

  /* Prioridad: coordenadas (punto exacto) → dirección completa */
  const q = coords ? `${coords.lat},${coords.lng}` : consulta;
  const enc = encodeURIComponent(q);
  return {
    id: String(x.ID_Sede), apiId: Number(x.ID_Sede),
    name: nombre, short, hint,
    tagline: pick(x, 'Descripcion', 'descripcion') || 'Conoce nuestras clases y horarios.',
    address,
    accent: color[0]!, accent2: color[1]!,
    lat: coords?.lat ?? null, lng: coords?.lng ?? null,
    exact: !!coords, hasMap: !!q,
    mapSrc: q ? `https://maps.google.com/maps?q=${enc}&z=${coords ? 17 : 16}&output=embed` : '',
    openUrl: q ? `https://www.google.com/maps/search/?api=1&query=${enc}` : '',
    dirUrl: q ? `https://www.google.com/maps/dir/?api=1&destination=${enc}` : '',
    wazeUrl: !q ? '' : coords
      ? `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes&zoom=17`
      : `https://waze.com/ul?q=${enc}&navigate=yes`,
  };
}));

const rows = ref<Row[]>([]);
const cargando = ref(false);
const error = ref('');
let solicitud = 0;

const sede = computed<Sede>(() => SEDES.value.find(s => s.id === sedeId.value) ?? SEDES.value[0] ?? {
  id: '', apiId: 0, name: 'Sucursal', short: '', hint: '', tagline: '', address: '',
  accent: '#a78bfa', accent2: '#7c3aed', lat: null, lng: null, exact: false, hasMap: false,
  mapSrc: '', openUrl: '', dirUrl: '', wazeUrl: '',
});
const coordsTexto = computed(() =>
  sede.value.exact && sede.value.lat !== null && sede.value.lng !== null
    ? `${sede.value.lat.toFixed(5)}, ${sede.value.lng.toFixed(5)}` : ''
);

/* ================= BACKEND ================= */
const aMinutos = (h: string) => {
  const [a = '0', b = '0'] = h.split(':');
  return Number(a) * 60 + Number(b);
};
const hora12 = (h: string) => {
  const [hh = '0', mm = '00'] = h.split(':');
  return `${Number(hh) % 12 || 12}:${mm}`;
};

/** Convierte los bloques del backend en filas (una por rango de hora) con Lun–Vie. */
function construirFilas(bloques: Bloque[]): Row[] {
  const mapa = new Map<string, Row>();
  for (const b of bloques) {
    const inicio = String(b.inicio).slice(0, 5);
    const fin = String(b.fin).slice(0, 5);
    const clave = `${inicio}|${fin}`;
    let fila = mapa.get(clave);
    if (!fila) {
      const s = aMinutos(inicio);
      const e = aMinutos(fin);
      fila = {
        time: `${hora12(inicio)} – ${hora12(fin)}`,
        period: s >= 720 ? 'pm' : 'am',
        classes: DAYS.map(() => null),
        colors: DAYS.map(() => null),
        start: s,
        end: e > s ? e : s + 60,
      };
      mapa.set(clave, fila);
    }
    const i = DAYS.findIndex(d => d.key === b.dia);
    if (i >= 0) {
      fila.classes[i] = b.titulo;
      fila.colors[i] = hexValido(String(b.color || '')) || null;
    }
  }
  return [...mapa.values()].sort((a, b) => a.start - b.start);
}

async function cargarSucursales() {
  cargandoSedes.value = true;
  errorSedes.value = '';
  try {
    const r = await fetch(`${API}/api/public/sucursales`, { headers: { Accept: 'application/json' } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.message || `No se pudieron consultar las sedes (${r.status}).`);
    const lista: Sucursal[] = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
    sucursales.value = lista.filter(x => Number(x.ID_Sede) > 0);
    if (!sucursales.value.some(x => String(x.ID_Sede) === sedeId.value)) {
      sedeId.value = sucursales.value.length ? String(sucursales.value[0]!.ID_Sede) : '';
    }
  } catch (e) {
    errorSedes.value = e instanceof Error ? e.message : 'Error al cargar sucursales.';
  } finally {
    cargandoSedes.value = false;
  }
}

async function cargarHorario() {
  const indice = ++solicitud;
  rows.value = [];
  error.value = '';
  cargando.value = true;
  const id = sede.value.apiId;
  if (!id) {
    cargando.value = false;
    error.value = 'Selecciona una sucursal para consultar su horario.';
    return;
  }
  try {
    const respuesta = await fetch(`${API}/api/public/horario-clases/${id}`, { headers: { Accept: 'application/json' } });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(json?.message || `No se pudo consultar el horario (${respuesta.status}).`);
    if (indice !== solicitud) return;
    const bloques: Bloque[] = Array.isArray(json?.bloques) ? json.bloques : [];
    const colores: Record<string, string> = {};
    for (const b of bloques) {
      const c = hexValido(String(b.color || ''));
      if (c && b.titulo) colores[b.titulo.toLowerCase()] = c;
    }
    colorMap.value = colores;
    rows.value = construirFilas(bloques);
  } catch (e) {
    if (indice === solicitud) error.value = e instanceof Error ? e.message : 'Error de conexión.';
  } finally {
    if (indice === solicitud) cargando.value = false;
  }
}

/* ================= HORARIO: CÁLCULOS ================= */
const fmt = (min: number) => {
  const h24 = Math.floor(min / 60), m = min % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'pm' : 'am'}`;
};
const statusOf = (r: Row): 'live' | 'past' | '' => {
  if (todayIdx.value !== day.value || nowMin.value < 0) return '';
  if (nowMin.value >= r.start && nowMin.value < r.end) return 'live';
  if (nowMin.value >= r.end) return 'past';
  return '';
};

/* Datos rápidos de la sede (salen de los horarios) */
const stats = computed(() => {
  const list = rows.value;
  if (!list.length) return { total: '—', first: '—', last: '—' };
  const total = list.reduce((a, r) => a + r.classes.filter(Boolean).length, 0);
  return {
    total: String(total),
    first: fmt(Math.min(...list.map(r => r.start))),
    last: fmt(Math.max(...list.map(r => r.end))),
  };
});

/* Tabla de escritorio: filas con separadores Mañana / Tarde */
const tableRows = computed(() => {
  const out: ({ kind: 'label'; text: string } | { kind: 'row'; row: Row })[] = [];
  let last = '';
  rows.value.forEach(r => {
    if (r.period !== last) {
      out.push({ kind: 'label', text: r.period === 'am' ? 'Mañana' : 'Tarde y noche' });
      last = r.period;
    }
    out.push({ kind: 'row', row: r });
  });
  return out;
});

/* Vista por día */
const groups = computed(() => {
  const pickGroup = (period: 'am' | 'pm') =>
    rows.value
      .filter(r => r.period === period && r.classes[day.value])
      .map(r => ({ time: r.time, name: r.classes[day.value] as string, color: r.colors[day.value], status: statusOf(r) }));
  return [
    { label: 'Mañana', kind: 'am', items: pickGroup('am') },
    { label: 'Tarde y noche', kind: 'pm', items: pickGroup('pm') },
  ].filter(g => g.items.length);
});

const banner = computed(() => {
  if (todayIdx.value < 0) return { kind: 'rest', title: 'Hoy descansamos', text: 'Nos vemos el lunes con toda la energía.', color: '' };
  const today = rows.value
    .filter(r => r.classes[todayIdx.value])
    .map(r => ({ s: r.start, e: r.end, name: r.classes[todayIdx.value] as string, color: r.colors[todayIdx.value] }))
    .sort((a, b) => a.s - b.s);
  const live = today.find(c => nowMin.value >= c.s && nowMin.value < c.e);
  if (live) return { kind: 'live', title: 'En curso ahora', text: `${live.name} · termina a las ${fmt(live.e)}`, color: live.color || colorOf(live.name) };
  const next = today.find(c => c.s > nowMin.value);
  if (next) return { kind: 'next', title: 'Siguiente clase hoy', text: `${next.name} · ${fmt(next.s)}`, color: next.color || colorOf(next.name) };
  return { kind: 'rest', title: 'Por hoy terminamos', text: 'Mañana te esperamos con más ganas.', color: '' };
});

const legend = computed(() => {
  const set = new Set<string>();
  rows.value.forEach(r => r.classes.forEach(c => c && set.add(c)));
  return [...set];
});

/* ---------- Interacciones ---------- */
const pickSede = (id: string, e?: Event) => {
  sedeId.value = id;
  const el = e?.currentTarget as HTMLElement | null;
  el?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' });
};
const setDay = (i: number) => {
  const n = Math.min(DAYS.length - 1, Math.max(0, i));
  if (n === day.value) return;
  dir.value = n > day.value ? 1 : -1;
  day.value = n;
};
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(sede.value.address);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1800);
  } catch { /* sin permiso */ }
};

/* Deslizar a izquierda/derecha para cambiar de día (celular) */
let tx0 = 0;
let ty0 = 0;
const onTouchStart = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!t) return;
  tx0 = t.clientX;
  ty0 = t.clientY;
};
const onTouchEnd = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - tx0;
  const dy = t.clientY - ty0;
  if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
  setDay(day.value + (dx < 0 ? 1 : -1));
};

/* Al cambiar de sede se vuelve a consultar el horario y se reinicia el mapa */
watch(sedeId, () => {
  mapReady.value = false;
  if (sedeId.value) void cargarHorario();
});

/* ---------- Aparición + reloj ---------- */
const root = ref<HTMLElement | null>(null);
const revealed = ref(false);
const visible = ref(false); // pausa el fondo animado cuando la sección no se ve
let io: IntersectionObserver | null = null;
let timer: ReturnType<typeof setInterval> | undefined;

const tick = () => {
  const d = new Date();
  nowMin.value = d.getHours() * 60 + d.getMinutes();
  const g = d.getDay();
  todayIdx.value = g >= 1 && g <= 5 ? g - 1 : -1;
};

onMounted(() => {
  tick();
  if (todayIdx.value >= 0) day.value = todayIdx.value;
  if (window.innerWidth < 900) view.value = 'day'; // en celular arranca por día
  timer = setInterval(tick, 30000);
  void cargarSucursales();

  if (!('IntersectionObserver' in window) || !root.value) { revealed.value = true; visible.value = true; return; }
  io = new IntersectionObserver(([e]) => {
    if (!e) return;
    visible.value = e.isIntersecting;
    if (e.isIntersecting) revealed.value = true;
  }, { threshold: 0.04 });
  io.observe(root.value);
});
onUnmounted(() => {
  solicitud++;
  io?.disconnect();
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section
    id="location"
    ref="root"
    :class="['loc', { revealed, paused: !visible }]"
    :style="{ '--accent': sede.accent, '--accent2': sede.accent2 }"
  >
    <!-- ===== Fondo cinematográfico (igual que las demás secciones) ===== -->
    <div class="spot" aria-hidden="true"></div>
    <div class="floor" aria-hidden="true"></div>
    <div class="grid-bg" aria-hidden="true"><div class="grid-in"></div></div>
    <div class="watermark" aria-hidden="true">FACTOR FIT</div>
    <div class="beam beam-a" aria-hidden="true"></div>
    <div class="beam beam-b" aria-hidden="true"></div>
    <div class="floaters" aria-hidden="true">
      <i
        v-for="(p, i) in PARTICLES"
        :key="i"
        :class="['pt', p.kind]"
        :style="{ left: p.left + '%', '--s': p.size + 'px', animationDuration: p.dur + 's', animationDelay: p.delay + 's', '--dx': p.drift + 'px' }"
      >{{ p.kind === 'heart' ? '♥' : p.kind === 'star' ? '✦' : '' }}</i>
    </div>

    <div class="container">
      <!-- ===== Cabecera ===== -->
      <header class="head">
        <span class="eyebrow"><i class="dot"></i> Contáctanos · Cd. Valles</span>
        <h2 class="title" :aria-label="TITLE_TEXT">
          <span class="line" aria-hidden="true">
            <span
              v-for="(w, i) in TITLE_WORDS"
              :key="i"
              :class="['word', { grad: w.g }]"
              :style="{ '--w': i }"
            >{{ w.t }}</span>
          </span>
        </h2>
        <p class="subtitle">Elige tu sede, descubre cómo llegar y encuentra la clase perfecta para ti.</p>
      </header>

      <!-- ===== Selector de sede ===== -->
      <div v-if="cargandoSedes" class="msg" role="status"><i class="spinner" aria-hidden="true"></i> Cargando sucursales...</div>
      <div v-else-if="errorSedes" class="msg error" role="alert">{{ errorSedes }} <button type="button" @click="cargarSucursales">Reintentar</button></div>
      <div v-else-if="!SEDES.length" class="msg">No hay sedes registradas.</div>

      <div v-if="SEDES.length" class="sedes" role="tablist" aria-label="Sedes">
        <button
          v-for="(s, si) in SEDES"
          :key="s.id"
          role="tab"
          :aria-selected="s.id === sedeId"
          :class="['sede-btn', { active: s.id === sedeId }]"
          :style="{ '--c1': s.accent, '--c2': s.accent2 }"
          @click="pickSede(s.id, $event)"
        >
          <span class="sede-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <span class="sede-txt">
            <small class="sede-n">Sede 0{{ si + 1 }}</small>
            <strong>{{ s.short }}</strong>
            <em v-if="s.hint">{{ s.hint }}</em>
          </span>
          <span class="check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
          </span>
        </button>
      </div>

      <!-- ===== UBICACIÓN: info + mapa ===== -->
      <div v-if="SEDES.length" class="where">
        <article class="card info">
          <div :key="sede.id" class="info-body">
            <span class="kicker"><i class="kick-bar"></i> Ubicación</span>
            <h3>{{ sede.name }}</h3>
            <p class="tag">{{ sede.tagline }}</p>

            <span :class="['loc-badge', sede.exact ? 'exact' : 'approx']">
              <i></i>
              {{ sede.exact ? 'Ubicación exacta por coordenadas' : 'Ubicación según la dirección' }}
            </span>

            <div class="stats">
              <div class="stat"><strong>{{ stats.total }}</strong><span>clases por semana</span></div>
              <div class="stat"><strong>{{ stats.first }}</strong><span>primera clase</span></div>
              <div class="stat"><strong>{{ stats.last }}</strong><span>cierre</span></div>
            </div>

            <ul class="contact">
              <li>
                <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>
                <span class="c-body">
                  <small>Dirección</small>
                  <span class="c-val">{{ sede.address }}</span>
                  <span v-if="coordsTexto" class="c-coords">GPS · {{ coordsTexto }}</span>
                  <button class="copy" type="button" aria-label="Copiar dirección" @click="copyAddress">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>
                    {{ copied ? '¡Copiada!' : 'Copiar dirección' }}
                  </button>
                </span>
              </li>
            </ul>

            <div v-if="sede.hasMap" class="btns">
              <a class="btn btn-main" :href="sede.dirUrl" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8-8-2Z"/></svg>
                Cómo llegar
              </a>
              <a class="btn btn-ghost" :href="sede.wazeUrl" target="_blank" rel="noopener">Abrir en Waze</a>
              <a class="btn btn-ghost" :href="sede.openUrl" target="_blank" rel="noopener">Ver en Maps ↗</a>
            </div>
          </div>
        </article>

        <article class="card map">
          <div class="map-frame">
            <div v-if="sede.mapSrc && !mapReady" class="map-skel" aria-hidden="true"><i class="skel-pin"></i></div>
            <iframe
              v-if="sede.mapSrc"
              :key="sede.id"
              :class="{ ready: mapReady }"
              :src="sede.mapSrc"
              :title="`Mapa de ${sede.name}`"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              @load="mapReady = true"
            ></iframe>
            <p v-else class="map-empty">Esta sede todavía no tiene dirección ni coordenadas registradas.</p>
          </div>
          <span class="map-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ sede.name }}
          </span>
        </article>
      </div>

      <!-- ===== HORARIOS ===== -->
      <article v-if="SEDES.length" class="card schedule">
        <div class="sched-head">
          <div class="sched-left">
            <span class="kicker"><i class="kick-bar"></i> Clases</span>
            <h3>Horarios</h3>
            <p class="sched-sub">{{ sede.name }} · Lunes a Viernes</p>
            <div class="seg" :data-view="view" role="tablist" aria-label="Vista de horarios">
              <span class="seg-pill" aria-hidden="true"></span>
              <button :class="{ on: view === 'day' }" role="tab" :aria-selected="view === 'day'" @click="view = 'day'">Por día</button>
              <button :class="{ on: view === 'week' }" role="tab" :aria-selected="view === 'week'" @click="view = 'week'">Semana</button>
            </div>
          </div>
          <div v-if="rows.length" :key="sede.id + banner.kind + banner.text" :class="['now-bar', banner.kind]" :style="{ '--k': banner.color || 'var(--accent)' }">
            <span class="pulse" aria-hidden="true"></span>
            <span class="now-txt"><strong>{{ banner.title }}</strong><span>{{ banner.text }}</span></span>
          </div>
        </div>

        <!-- Estados de carga -->
        <div v-if="cargando" class="msg" role="status"><i class="spinner" aria-hidden="true"></i> Cargando horario...</div>
        <div v-else-if="error" class="msg error" role="alert">
          <span>{{ error }}</span>
          <button type="button" @click="cargarHorario">Reintentar</button>
        </div>
        <div v-else-if="!rows.length" class="msg">Aún no hay clases registradas para esta sede.</div>

        <template v-else>
          <!-- Tabla grande -->
          <div v-if="view === 'week'" class="desk">
            <table :key="sede.id" class="week">
              <thead>
                <tr>
                  <th class="corner">Hora</th>
                  <th v-for="(d, i) in DAYS" :key="d.short" :class="{ now: todayIdx === i }">
                    {{ d.long }}
                    <small v-if="todayIdx === i">Hoy</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(e, ei) in tableRows" :key="ei">
                  <tr v-if="e.kind === 'label'" class="band">
                    <td colspan="6"><span>{{ e.text }}</span></td>
                  </tr>
                  <tr v-else>
                    <th class="time">{{ e.row.time }}<small>{{ e.row.period }}</small></th>
                    <td v-for="(c, ci) in e.row.classes" :key="ci" :class="{ today: todayIdx === ci }">
                      <span v-if="c" class="chip" :style="{ '--k': e.row.colors[ci] || colorOf(c), '--n': ei + ci }">{{ c }}</span>
                      <span v-else class="dash">—</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Vista por día (con deslizamiento táctil) -->
          <div v-else class="mob">
            <div class="days" :style="{ '--di': day }" role="tablist" aria-label="Días">
              <span class="day-pill" aria-hidden="true"></span>
              <button
                v-for="(d, i) in DAYS"
                :key="d.short"
                role="tab"
                :aria-selected="day === i"
                :class="['day', { active: day === i }]"
                @click="setDay(i)"
              >
                <span>{{ d.short }}</span>
                <i v-if="todayIdx === i" class="today-tag">Hoy</i>
              </button>
            </div>
            <div
              :key="sede.id + day"
              class="day-body"
              :style="{ '--dir': dir }"
              @touchstart.passive="onTouchStart"
              @touchend.passive="onTouchEnd"
            >
              <p class="day-name">{{ DAYS[day]?.long }}<em v-if="todayIdx === day"> · Hoy</em></p>
              <div class="groups">
                <section v-for="g in groups" :key="g.kind" class="group">
                  <h4>{{ g.label }}</h4>
                  <ul>
                    <li
                      v-for="(it, i) in g.items"
                      :key="i"
                      :class="[it.status]"
                      :style="{ '--k': it.color || colorOf(it.name), '--i': i }"
                    >
                      <span class="t">{{ it.time }}<small>{{ g.kind }}</small></span>
                      <span class="n">{{ it.name }}</span>
                      <em v-if="it.status === 'live'" class="live-tag">En vivo</em>
                    </li>
                  </ul>
                </section>
              </div>
              <p v-if="!groups.length" class="empty">No hay clases este día.</p>
              <p class="swipe-hint" aria-hidden="true">← desliza para cambiar de día →</p>
            </div>
          </div>

          <ul class="legend" aria-label="Tipos de clase">
            <li v-for="l in legend" :key="l" :style="{ '--k': colorOf(l) }"><i></i>{{ l }}</li>
          </ul>
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Permanent+Marker&display=swap');

.loc {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --pad: clamp(14px, 4vw, 56px);
  --accent: #a78bfa;
  --accent2: #7c3aed;
  --ice: #f3d3ff;
  --glass: linear-gradient(160deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.025)), rgba(18, 9, 44, 0.74);
  position: relative;
  scroll-margin-top: 84px;
  padding: clamp(56px, 8vw, 100px) var(--pad) clamp(80px, 10vw, 130px);
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse 70% 55% at 50% 100%, #3a1768 0%, rgba(58, 23, 104, 0) 70%),
    linear-gradient(180deg, #07040f 0%, #120a26 55%, #1d0e3a 100%);
}

/* ================= FONDO CINEMATOGRÁFICO ================= */
.spot {
  position: absolute; z-index: -5; pointer-events: none; inset: 0;
  background: radial-gradient(700px circle at 50% 6%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%);
  transition: background 0.6s ease;
}
.floor {
  position: absolute; z-index: -5; pointer-events: none;
  left: 50%; bottom: -22%; width: 130%; height: 52%;
  translate: -50% 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 106, 213, 0.5) 0%, rgba(178, 92, 255, 0.3) 32%, transparent 68%);
}
/* Rejilla: se mueve solo con transform (no repinta en cada fotograma) */
.grid-bg {
  position: absolute; z-index: -4; pointer-events: none; overflow: hidden;
  left: -40%; right: -40%; bottom: -6%; height: 44%;
  transform: perspective(520px) rotateX(64deg);
  transform-origin: 50% 100%;
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 85%);
  mask-image: linear-gradient(to top, #000 0%, transparent 85%);
}
.grid-in {
  position: absolute; left: 0; right: 0; bottom: 0; top: -70px;
  background-image:
    linear-gradient(rgba(243, 211, 255, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(243, 211, 255, 0.18) 1px, transparent 1px);
  background-size: 70px 70px;
  animation: grid-run 6s linear infinite;
  will-change: transform;
}
@keyframes grid-run { to { transform: translate3d(0, 70px, 0); } }

.watermark {
  position: absolute; z-index: -4; pointer-events: none; white-space: nowrap;
  left: 0; top: 36%;
  font: 400 clamp(8rem, 30vw, 24rem) 'Anton', 'Inter', sans-serif;
  letter-spacing: 0.02em; line-height: 1;
  color: transparent;
  -webkit-text-stroke: 2px rgba(243, 211, 255, 0.065);
  transform: translate3d(-6%, -50%, 0);
  animation: wm-slide 80s linear infinite alternate;
  will-change: transform;
}
@keyframes wm-slide { from { transform: translate3d(-6%, -50%, 0); } to { transform: translate3d(-48%, -50%, 0); } }

.beam {
  position: absolute; z-index: -4; pointer-events: none; top: -20%; width: 34%; height: 140%;
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 24%, transparent), transparent 70%);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  transform-origin: 50% 0;
  animation: sway 10s ease-in-out infinite alternate;
  will-change: transform;
}
.beam-a { left: 8%; rotate: 18deg; }
.beam-b { right: 6%; rotate: -20deg; animation-delay: -4s; animation-direction: alternate-reverse; }
@keyframes sway { from { transform: rotate(-5deg); } to { transform: rotate(6deg); } }

/* Corazones, destellos y burbujas que suben */
.floaters { position: absolute; inset: 0; z-index: -3; pointer-events: none; overflow: hidden; }
.pt { position: absolute; bottom: -40px; font-style: normal; line-height: 1; opacity: 0; color: rgba(255, 255, 255, 0.75); animation: riseUp linear infinite; }
.pt.heart, .pt.star { font-size: var(--s); }
.pt.heart { color: rgba(255, 140, 220, 0.85); }
.pt.star { color: rgba(220, 205, 255, 0.9); }
.pt.dot { width: var(--s); height: var(--s); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, rgba(255, 255, 255, 0.05) 70%); border: 1px solid rgba(255, 255, 255, 0.3); }
@keyframes riseUp {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.85; }
  50% { transform: translate3d(calc(var(--dx) * 0.5), -55vh, 0) rotate(18deg); }
  90% { opacity: 0.5; }
  100% { transform: translate3d(var(--dx), -115vh, 0) rotate(-14deg); opacity: 0; }
}

/* Fuera de pantalla: se pausa todo lo infinito */
.paused .grid-in, .paused .watermark, .paused .beam, .paused .pt, .paused .dot,
.paused .btn-main::after, .paused .pulse, .paused .spinner, .paused .map-skel::after, .paused .skel-pin { animation-play-state: paused; }

.container { max-width: 1240px; margin: 0 auto; position: relative; }

/* ================= CABECERA ================= */
.head { text-align: center; margin-bottom: clamp(22px, 3.4vw, 34px); }
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px; margin-bottom: 14px; padding: 7px 16px; border-radius: 999px;
  font-size: clamp(0.66rem, 1.3vw, 0.76rem); font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #e9c9ff;
  background: rgba(20, 9, 44, 0.6); border: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0; transform: translate3d(0, 12px, 0);
  transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
}
.revealed .eyebrow { opacity: 1; transform: none; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #7ef0b8; animation: ping 2s infinite; }
@keyframes ping { 0% { box-shadow: 0 0 0 0 rgba(126, 240, 184, 0.8); } 70%, 100% { box-shadow: 0 0 0 9px rgba(126, 240, 184, 0); } }

/* Título más pequeño y con salto de línea real en celular */
.title {
  margin: 0 0 12px;
  font-family: 'Permanent Marker', 'Inter', cursive;
  font-weight: 400;
  font-size: clamp(1.9rem, min(6vw, 9svh), 3.9rem);
  line-height: 1.1;
  letter-spacing: 0.5px;
  color: var(--ice);
  text-shadow: 0 3px 0 rgba(40, 10, 84, 0.7), 0 8px 24px rgba(20, 8, 44, 0.55);
}
.line { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.02em 0.28em; }
.word {
  display: inline-block;
  opacity: 0;
  filter: blur(12px);
  transform: translate3d(0, 0.45em, 0) rotate(3deg);
  transition:
    opacity 0.7s var(--ease-out) calc(var(--w) * 0.09s + 0.1s),
    filter 0.9s var(--ease-out) calc(var(--w) * 0.09s + 0.1s),
    transform 0.9s var(--ease-out) calc(var(--w) * 0.09s + 0.1s);
}
.revealed .word { opacity: 1; filter: none; transform: none; }
/* Degradado estático (antes se animaba y repintaba el texto en cada fotograma) */
.grad {
  background: linear-gradient(100deg, #fff 0%, #e4d4ff 35%, #ffb8ee 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent;
  text-shadow: none;
}
.revealed .grad { filter: drop-shadow(0 3px 0 rgba(40, 10, 84, 0.7)); }
.subtitle {
  margin: 0 auto; max-width: 48ch; font-size: clamp(0.92rem, 1.8vw, 1.08rem); line-height: 1.6; color: rgba(255, 255, 255, 0.86);
  text-wrap: balance;
  opacity: 0; transform: translate3d(0, 14px, 0);
  transition: opacity 0.7s var(--ease-out) 0.6s, transform 0.7s var(--ease-out) 0.6s;
}
.revealed .subtitle { opacity: 1; transform: none; }

/* ================= SELECTOR DE SEDE ================= */
.sedes {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: clamp(10px, 1.4vw, 16px);
  max-width: 1000px; margin: 0 auto clamp(20px, 3vw, 30px);
  opacity: 0; transform: translate3d(0, 16px, 0); transition: opacity 0.7s var(--ease-out) 0.75s, transform 0.7s var(--ease-out) 0.75s;
}
.revealed .sedes { opacity: 1; transform: none; }
.sede-btn {
  position: relative; overflow: hidden; display: flex; align-items: center; gap: 14px; text-align: left; cursor: pointer;
  min-height: 84px; padding: 14px 16px; border-radius: 20px; color: #fff; font: inherit;
  background: var(--glass); border: 1px solid rgba(255, 255, 255, 0.16);
  transition: transform 0.25s var(--ease-out), border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
/* Capa de color que se revela en la sede activa */
.sede-btn::before {
  content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.35s var(--ease-out);
  background: linear-gradient(135deg, var(--c1), var(--c2));
}
.sede-btn > * { position: relative; }
.sede-btn.active { border-color: rgba(255, 255, 255, 0.85); box-shadow: 0 16px 36px rgba(5, 2, 20, 0.5), 0 0 40px color-mix(in srgb, var(--c1) 40%, transparent); }
.sede-btn.active::before { opacity: 1; }
.sede-btn:active { transform: scale(0.98); transition-duration: 0.1s; }
.sede-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
@media (hover: hover) and (pointer: fine) {
  .sede-btn:hover { transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.5); }
  .sede-btn:active { transform: scale(0.98); }
}
.sede-pin {
  flex: 0 0 auto; width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.4s var(--ease-out), background-color 0.3s ease;
}
.sede-btn.active .sede-pin { background: rgba(255, 255, 255, 0.22); transform: rotate(-8deg) scale(1.05); }
.sede-pin svg { width: 21px; height: 21px; }
.sede-txt { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; line-height: 1.25; }
.sede-n { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255, 255, 255, 0.55); }
.sede-btn.active .sede-n { color: rgba(255, 255, 255, 0.85); }
.sede-txt strong { font-size: clamp(0.98rem, 2vw, 1.12rem); font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sede-txt em { font-style: normal; font-size: 0.8rem; color: rgba(255, 255, 255, 0.72); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.check { flex: 0 0 auto; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: #fff; color: var(--c2); transform: scale(0); transition: transform 0.35s var(--ease-out); }
.check svg { width: 14px; height: 14px; }
.sede-btn.active .check { transform: scale(1); }

/* ================= TARJETAS ================= */
.card {
  position: relative;
  background: var(--glass);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: clamp(20px, 2.6vw, 30px);
  box-shadow: 0 24px 50px rgba(5, 2, 20, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  opacity: 0; transform: translate3d(0, 28px, 0);
  transition: opacity 0.8s var(--ease-out), transform 0.9s var(--ease-out);
}
.card::before {
  content: ''; position: absolute; left: 32px; right: 32px; top: 0; height: 3px; border-radius: 3px;
  background: linear-gradient(90deg, transparent, #e4d4ff, var(--accent), #e4d4ff, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 70%, transparent);
}
.revealed .card { opacity: 1; transform: none; }
.kicker { display: inline-flex; align-items: center; gap: 10px; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: #e0c8ff; }
.kick-bar { display: block; width: 26px; height: 3px; border-radius: 3px; background: linear-gradient(90deg, var(--accent), transparent); }

/* ================= UBICACIÓN ================= */
.where { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: clamp(14px, 2.4vw, 26px); align-items: stretch; margin-bottom: clamp(16px, 2.6vw, 26px); }
.info { padding: clamp(20px, 2.8vw, 34px); display: flex; flex-direction: column; transition-delay: 0.9s; }
.info-body { display: flex; flex-direction: column; flex: 1; animation: swap-in 0.5s var(--ease-out) both; }
@keyframes swap-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: none; } }
.info h3 {
  margin: 10px 0 8px; font-family: 'Permanent Marker', 'Inter', cursive; font-weight: 400;
  font-size: clamp(1.6rem, 3.2vw, 2.25rem); line-height: 1.12; letter-spacing: 0.5px;
  color: var(--ice); text-shadow: 0 3px 0 rgba(40, 10, 84, 0.65);
}
.tag { margin: 0 0 16px; font-size: clamp(0.92rem, 1.7vw, 1.02rem); line-height: 1.55; color: rgba(255, 255, 255, 0.84); }

/* Etiqueta: ubicación exacta (verde) o aproximada (ámbar) */
.loc-badge {
  --b: #7ef0b8;
  align-self: flex-start; display: inline-flex; align-items: center; gap: 9px; margin-bottom: 18px; padding: 7px 14px 7px 12px; border-radius: 999px;
  font-size: 0.74rem; font-weight: 800; letter-spacing: 0.4px; color: var(--b);
  background: color-mix(in srgb, var(--b) 12%, rgba(16, 8, 40, 0.7)); border: 1px solid color-mix(in srgb, var(--b) 40%, transparent);
}
.loc-badge.approx { --b: #fbbf24; }
.loc-badge i { width: 8px; height: 8px; border-radius: 50%; background: var(--b); box-shadow: 0 0 10px var(--b); }

.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px; }
.stat {
  position: relative; overflow: hidden; padding: 14px 8px 13px; border-radius: 16px; text-align: center;
  background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14);
  transition: transform 0.3s var(--ease-out), border-color 0.3s ease;
}
.stat::after { content: ''; position: absolute; left: 24%; right: 24%; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
@media (hover: hover) and (pointer: fine) { .stat:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--accent) 70%, #fff); } }
.stat strong { display: block; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: clamp(1.15rem, 2.2vw, 1.55rem); letter-spacing: 0.5px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.stat span { display: block; margin-top: 5px; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255, 255, 255, 0.68); }

.contact { list-style: none; margin: 0 0 20px; padding: 0; }
.contact li { display: flex; align-items: flex-start; gap: 14px; padding: 14px; border-radius: 18px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); }
.ic { flex: 0 0 auto; width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 8px 18px rgba(5, 2, 20, 0.4); }
.ic svg { width: 22px; height: 22px; }
.c-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.c-body small { font-size: 0.7rem; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255, 255, 255, 0.66); }
.c-val { font-size: clamp(0.95rem, 1.8vw, 1.08rem); font-weight: 700; line-height: 1.45; color: #fff; overflow-wrap: anywhere; }
.c-coords { font-size: 0.76rem; font-weight: 600; color: rgba(255, 255, 255, 0.6); font-variant-numeric: tabular-nums; }
.copy {
  display: inline-flex; align-items: center; gap: 8px;
  align-self: flex-start; margin-top: 8px; cursor: pointer; min-height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.28); background: rgba(255, 255, 255, 0.07); color: #fff;
  font: 700 0.78rem 'Inter', sans-serif; padding: 0 15px; border-radius: 999px;
  transition: background-color 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}
.copy:active { transform: scale(0.97); }
.copy:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
@media (hover: hover) and (pointer: fine) { .copy:hover { background: rgba(255, 255, 255, 0.2); } }

.btns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: auto; }
.btn {
  position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  min-height: 52px; padding: 0 14px; border-radius: 999px; text-decoration: none; color: #fff; font: 800 0.95rem 'Inter', sans-serif;
  transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), background-color 0.25s ease;
}
.btn-main { grid-column: 1 / -1; min-height: 56px; font-size: 1.02rem; background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 12px 28px rgba(5, 2, 20, 0.5), 0 0 26px color-mix(in srgb, var(--accent) 32%, transparent); border: 1px solid rgba(255, 255, 255, 0.45); }
.btn-main::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%); transform: translateX(-120%); animation: sweep 3.6s ease-in-out infinite; }
@keyframes sweep { 60%, 100% { transform: translateX(120%); } }
.btn-ghost { background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.28); font-size: 0.88rem; }
.btn:active { transform: scale(0.97); }
.btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
@media (hover: hover) and (pointer: fine) {
  .btn-main:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(5, 2, 20, 0.55), 0 0 36px color-mix(in srgb, var(--accent) 48%, transparent); }
  .btn-ghost:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.16); }
}

/* Mapa */
.map { padding: 8px; min-height: 540px; transition-delay: 1s; box-shadow: 0 24px 50px rgba(5, 2, 20, 0.5), 0 0 60px color-mix(in srgb, var(--accent) 20%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.18); }
.map-frame { position: absolute; inset: 8px; overflow: hidden; border-radius: clamp(14px, 2vw, 22px); background: #1a1030; }
.map-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; opacity: 0; transition: opacity 0.6s var(--ease-out); }
.map-frame iframe.ready { opacity: 1; }
/* Esqueleto mientras carga el mapa */
.map-skel {
  position: absolute; inset: 0; overflow: hidden; display: grid; place-items: center;
  background-image:
    linear-gradient(rgba(243, 211, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(243, 211, 255, 0.07) 1px, transparent 1px);
  background-size: 44px 44px;
}
.map-skel::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.07) 50%, transparent 70%);
  transform: translateX(-100%); animation: skel 1.6s ease-in-out infinite;
}
@keyframes skel { to { transform: translateX(100%); } }
.skel-pin { width: 22px; height: 22px; border-radius: 50% 50% 50% 0; rotate: -45deg; background: linear-gradient(135deg, var(--accent), var(--accent2)); animation: hop 1.1s ease-in-out infinite; }
@keyframes hop { 50% { transform: translate3d(0, -10px, 0); } }
.map-empty { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.8); }
.map-tag {
  position: absolute; left: 22px; top: 22px; z-index: 2; display: inline-flex; align-items: center; gap: 8px; max-width: calc(100% - 44px);
  padding: 8px 15px 8px 11px; border-radius: 999px; font: 800 0.86rem 'Inter', sans-serif; color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 10px 24px rgba(5, 2, 20, 0.45); border: 1px solid rgba(255, 255, 255, 0.45);
  pointer-events: none;
}
.map-tag svg { width: 17px; height: 17px; flex: 0 0 auto; }

/* ================= HORARIOS ================= */
.schedule { padding: clamp(16px, 2.8vw, 34px); transition-delay: 1.1s; }
.sched-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px 24px; flex-wrap: wrap; margin-bottom: clamp(16px, 2.2vw, 24px); }
.sched-head h3 {
  margin: 6px 0 0; font-family: 'Permanent Marker', 'Inter', cursive; font-weight: 400;
  font-size: clamp(1.9rem, 4.2vw, 2.8rem); letter-spacing: 1px; line-height: 1.08;
  color: var(--ice); text-shadow: 0 3px 0 rgba(40, 10, 84, 0.7), 0 8px 24px rgba(20, 8, 44, 0.5);
}
.sched-sub { margin: 6px 0 0; font-size: clamp(0.88rem, 1.8vw, 1rem); color: rgba(255, 255, 255, 0.8); font-weight: 600; }
.now-bar {
  --k: var(--accent);
  display: flex; align-items: center; gap: 14px; padding: 13px 20px; border-radius: 18px; max-width: 100%;
  background: color-mix(in srgb, var(--k) 20%, rgba(16, 8, 40, 0.8));
  border: 1px solid color-mix(in srgb, var(--k) 60%, transparent);
  box-shadow: 0 0 30px color-mix(in srgb, var(--k) 22%, transparent);
  animation: fadeIn 0.5s var(--ease-out) both;
}
.now-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; line-height: 1.3; }
.now-txt strong { font-size: 0.68rem; letter-spacing: 1.3px; text-transform: uppercase; color: color-mix(in srgb, var(--k) 70%, #fff); }
.now-txt span { font-weight: 800; font-size: 0.98rem; color: #fff; }
.pulse { flex: 0 0 auto; width: 12px; height: 12px; border-radius: 50%; background: var(--k); animation: ring 1.8s infinite; }
.now-bar.rest .pulse { animation: none; opacity: 0.6; }
@keyframes ring { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--k) 70%, transparent); } 80%, 100% { box-shadow: 0 0 0 12px transparent; } }

/* Interruptor con píldora deslizante */
.seg { position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; margin-top: 14px; padding: 5px; border-radius: 999px; background: rgba(8, 4, 24, 0.7); border: 1px solid rgba(255, 255, 255, 0.18); }
.seg-pill {
  position: absolute; top: 5px; bottom: 5px; left: 5px; width: calc((100% - 10px) / 2); border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 8px 18px rgba(5, 2, 20, 0.5), 0 0 22px color-mix(in srgb, var(--accent) 38%, transparent);
  transition: transform 0.45s var(--ease-out);
}
.seg[data-view='week'] .seg-pill { transform: translateX(100%); }
.seg button {
  position: relative; z-index: 1;
  border: 0; cursor: pointer; min-height: 42px; padding: 0 24px; border-radius: 999px; background: transparent; color: rgba(255, 255, 255, 0.72);
  font: 800 0.92rem 'Inter', sans-serif;
  transition: color 0.25s var(--ease-out), transform 0.15s var(--ease-out);
}
.seg button:active { transform: scale(0.97); }
.seg button:hover, .seg button.on { color: #fff; }
.seg button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* Mensajes de carga / error / vacío */
.msg {
  display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
  min-height: 110px; padding: 20px; margin-bottom: 18px; text-align: center; border-radius: 20px;
  font-weight: 700; color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06); border: 1px dashed rgba(255, 255, 255, 0.28);
  animation: fadeIn 0.4s var(--ease-out) both;
}
.schedule .msg { margin-bottom: 0; }
.msg.error { border-color: #fa8da5; color: #ffd0da; }
.msg button { cursor: pointer; border: 0; border-radius: 999px; min-height: 40px; padding: 0 18px; background: #fff; color: #3b2459; font: 800 0.9rem 'Inter', sans-serif; }
.msg button:active { transform: scale(0.97); }
.msg button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.spinner { width: 20px; height: 20px; border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.25); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Tabla */
.desk { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
.desk .week { min-width: 800px; }
.week { width: 100%; border-collapse: separate; border-spacing: 8px; table-layout: fixed; animation: fadeIn 0.45s var(--ease-out) both; }
.week thead th {
  padding: 13px 6px; border-radius: 16px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);
  font: 800 clamp(0.84rem, 1.2vw, 1rem) 'Inter', sans-serif; letter-spacing: 0.4px; color: #fff; text-transform: uppercase;
}
.week thead th small { display: block; margin-top: 2px; font-size: 0.64rem; letter-spacing: 1px; opacity: 0.95; }
.week thead th.now { background: linear-gradient(135deg, var(--accent), var(--accent2)); border-color: #fff; box-shadow: 0 8px 20px rgba(5, 2, 20, 0.45), 0 0 28px color-mix(in srgb, var(--accent) 42%, transparent); }
.week thead th.corner { background: transparent; border-color: transparent; width: 150px; text-align: left; color: rgba(255, 255, 255, 0.65); font-size: 0.74rem; letter-spacing: 1.4px; padding-left: 6px; }
.week tbody th.time { text-align: left; white-space: nowrap; font: 800 clamp(0.86rem, 1.15vw, 1rem) 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; padding: 0 6px; }
.week tbody th.time small { margin-left: 5px; padding: 2px 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.5px; }
.week tr.band td { padding: 14px 0 2px; }
.week tr.band span { display: inline-flex; align-items: center; gap: 12px; width: 100%; font: 800 0.74rem 'Inter', sans-serif; letter-spacing: 0.22em; text-transform: uppercase; color: #e0c8ff; }
.week tr.band span::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 70%, #fff), transparent); }
.week td { padding: 0; }
.chip {
  display: flex; align-items: center; justify-content: center; text-align: center; min-height: 70px; padding: 10px 8px;
  border-radius: 16px; color: #fff;
  font-size: clamp(0.76rem, 1.1vw, 0.92rem); font-weight: 800; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(5, 2, 20, 0.6);
  background: linear-gradient(170deg, color-mix(in srgb, var(--k) 42%, rgba(16, 8, 40, 0.85)), color-mix(in srgb, var(--k) 16%, rgba(16, 8, 40, 0.85)));
  border: 1px solid color-mix(in srgb, var(--k) 60%, transparent);
  box-shadow: inset 0 3px 0 var(--k), 0 8px 18px rgba(5, 2, 20, 0.3);
  transition: transform 0.25s var(--ease-out), filter 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
  animation: chip-in 0.5s var(--ease-out) calc(var(--n, 0) * 30ms) backwards;
}
@keyframes chip-in { from { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.96); } }
@media (hover: hover) and (pointer: fine) { .chip:hover { transform: translateY(-4px) scale(1.03); filter: brightness(1.15); box-shadow: inset 0 3px 0 var(--k), 0 16px 30px rgba(5, 2, 20, 0.5), 0 0 24px color-mix(in srgb, var(--k) 50%, transparent); } }
.week td.today .chip { border-color: rgba(255, 255, 255, 0.85); box-shadow: inset 0 3px 0 var(--k), 0 0 20px color-mix(in srgb, var(--k) 40%, transparent); }
.dash { display: flex; align-items: center; justify-content: center; min-height: 70px; border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.18); color: rgba(255, 255, 255, 0.32); font-weight: 700; }
.legend { list-style: none; margin: clamp(14px, 2.2vw, 22px) 0 0; padding: 16px 0 0; display: flex; flex-wrap: wrap; gap: 9px; border-top: 1px dashed rgba(255, 255, 255, 0.24); }
.legend li {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 13px 6px 10px; border-radius: 999px;
  font-size: 0.8rem; font-weight: 700; color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.14);
}
.legend i { width: 10px; height: 10px; border-radius: 50%; background: var(--k); box-shadow: 0 0 10px var(--k); }

/* Vista por día */
.days { --gap: 6px; position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--gap); padding: 6px; margin-bottom: 18px; border-radius: 24px; background: rgba(8, 4, 24, 0.6); border: 1px solid rgba(255, 255, 255, 0.16); }
.day-pill {
  position: absolute; top: 6px; bottom: 6px; left: 6px; border-radius: 18px;
  width: calc((100% - 12px - 4 * var(--gap)) / 5);
  transform: translate3d(calc(var(--di, 0) * (100% + var(--gap))), 0, 0);
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  box-shadow: 0 10px 22px rgba(5, 2, 20, 0.5), 0 0 24px color-mix(in srgb, var(--accent) 38%, transparent);
  transition: transform 0.5s var(--ease-out);
}
.day {
  position: relative; z-index: 1;
  cursor: pointer; border: 0; border-radius: 18px; min-height: 60px;
  color: rgba(255, 255, 255, 0.8); background: transparent;
  font: 800 0.92rem 'Inter', sans-serif; letter-spacing: 0.4px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  transition: color 0.25s var(--ease-out), transform 0.15s var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.day:active { transform: scale(0.96); }
.day.active { color: #fff; }
.day:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
@media (hover: hover) and (pointer: fine) { .day:not(.active):hover { color: #fff; } }
.today-tag { font-style: normal; font-size: 0.6rem; font-weight: 700; padding: 1px 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.26); }
.day-body { animation: day-in 0.42s var(--ease-out) both; touch-action: pan-y; }
@keyframes day-in { from { opacity: 0; transform: translate3d(calc(var(--dir, 0) * 28px), 0, 0); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; transform: translate3d(0, 8px, 0); } to { opacity: 1; transform: none; } }
.day-name { margin: 0 0 4px; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: clamp(1.5rem, 3.2vw, 2.1rem); letter-spacing: 1.5px; text-transform: uppercase; }
.day-name em { font-style: normal; color: #e0c8ff; }
.groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 clamp(18px, 3vw, 36px); align-items: start; }
.group { margin-top: 14px; }
.group h4 { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; font-size: 0.74rem; letter-spacing: 0.22em; text-transform: uppercase; color: #e0c8ff; }
.group h4::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 70%, #fff), transparent); }
.group ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.group li {
  display: flex; align-items: center; gap: 14px; padding: 15px; border-radius: 18px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--k) 26%, rgba(16, 8, 40, 0.85)), rgba(255, 255, 255, 0.05) 78%);
  border: 1px solid rgba(255, 255, 255, 0.14); border-left: 5px solid var(--k);
  animation: fadeIn 0.5s var(--ease-out) both; animation-delay: calc(var(--i) * 0.06s);
  transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
}
@media (hover: hover) and (pointer: fine) { .group li:hover { transform: translateX(5px); box-shadow: 0 12px 26px rgba(5, 2, 20, 0.45); } }
.group li.past { opacity: 0.5; }
.group li.live { border-color: var(--k); box-shadow: 0 0 28px color-mix(in srgb, var(--k) 55%, transparent); }
.t { flex: 0 0 auto; min-width: 104px; font-weight: 800; font-size: 0.96rem; font-variant-numeric: tabular-nums; }
.t small { margin-left: 4px; font-size: 0.7rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.7); }
.n { flex: 1; min-width: 0; font-weight: 800; font-size: 1.04rem; color: #fff; }
.live-tag { flex: 0 0 auto; font-style: normal; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; color: #1a1033; background: var(--k); }
.empty { margin: 18px 0 6px; text-align: center; color: rgba(255, 255, 255, 0.85); }
.swipe-hint { display: none; margin: 16px 0 0; text-align: center; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.5px; color: rgba(255, 255, 255, 0.45); }

/* ================= SCROLL (Chrome, Edge, Safari 26+) ================= */
@supports (animation-timeline: view()) {
  .where .card, .schedule {
    animation: card-open linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 55%;
  }
  @keyframes card-open { from { scale: 0.96; } to { scale: 1; } }
}

/* ================= RESPONSIVE ================= */
@media (max-width: 960px) {
  .where { grid-template-columns: minmax(0, 1fr); }
  .map { min-height: 380px; }
  .groups { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 640px) {
  /* Sedes: carrusel horizontal con imán */
  .sedes {
    display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 10px;
    margin-left: calc(var(--pad) * -1); margin-right: calc(var(--pad) * -1);
    padding: 4px var(--pad) 12px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .sedes::-webkit-scrollbar { display: none; }
  .sede-btn { flex: 0 0 min(72vw, 260px); scroll-snap-align: center; min-height: 78px; }
  .title { font-size: clamp(1.9rem, min(9.4vw, 8.5svh), 2.8rem); }
  .stats { gap: 8px; }
  .stat { padding: 12px 6px; }
  .stat span { font-size: 0.58rem; letter-spacing: 0.4px; }
  .contact li { padding: 12px; gap: 12px; }
  .ic { width: 42px; height: 42px; }
  .btns { grid-template-columns: minmax(0, 1fr); }
  .btn-main { grid-column: auto; }
  .sched-head { align-items: stretch; }
  .now-bar { width: 100%; }
  .seg { display: grid; width: 100%; }
  .grid-in { background-size: 48px 48px; }
  .beam { display: none; }
  .map { min-height: 340px; }
  .t { min-width: 92px; font-size: 0.9rem; }
  .n { font-size: 0.98rem; }
  .swipe-hint { display: block; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .eyebrow, .word, .subtitle, .sedes, .card { opacity: 1 !important; transform: none !important; filter: none !important; }
  .pt { opacity: 0.4 !important; }
  .watermark, .beam { display: none; }
  .map-frame iframe { opacity: 1 !important; }
}
</style>