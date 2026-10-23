<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

/* ================= DATOS ================= */
const DAYS = [
  { short: 'LUN', long: 'Lunes' },
  { short: 'MAR', long: 'Martes' },
  { short: 'MIÉ', long: 'Miércoles' },
  { short: 'JUE', long: 'Jueves' },
  { short: 'VIE', long: 'Viernes' },
];

interface Row { time: string; period: 'am' | 'pm'; classes: (string | null)[] } // classes: Lun a Vie
interface Sede {
  id: string; name: string; short: string; tagline: string;
  address: string; phone: string; phoneLink: string; email: string;
  accent: string; accent2: string; mapSrc: string; rows: Row[];
}

const SEDES: Sede[] = [
  {
    id: 'emiliano',
    name: 'Sede Emiliano Zapata',
    short: 'Emiliano',
    tagline: 'Asesoría cercana a ti, con un ambiente increíble.',
    address: 'Rosales #301 esq. con Álamo, Col. Emiliano Zapata, Cd. Valles',
    phone: '+52 481 111 1030',
    phoneLink: 'https://wa.me/524811111030',
    email: 'g-nafc@hotmail.com',
    accent: '#a78bfa',
    accent2: '#7c3aed',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3699.1108590337626!2d-99.0218956!3d22.007062899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d612aa4818ecdf%3A0xa45c1ad4926a32c4!2sLos%20Delfines%20Sal%C3%B3n%20de%20Eventos!5e0!3m2!1ses!2smx!4v1767058530057!5m2!1ses!2smx',
    rows: [
      { time: '7:00 – 8:00',  period: 'am', classes: ['Glute Bands', 'Circuito', 'GAP', 'Tabata', 'Entrenamiento Funcional'] },
      { time: '8:00 – 9:00',  period: 'am', classes: ['Entrenamiento Funcional', 'Tabata', 'Zumba', 'Entrenamiento Funcional', 'Circuito'] },
      { time: '9:00 – 10:00', period: 'am', classes: ['Entrenamiento Funcional', 'Meta HIT', 'GAP', 'Core', 'Glute Bands'] },
      { time: '6:00 – 7:00',  period: 'pm', classes: ['GAP', 'Entrenamiento Funcional', 'Glute Bands', 'Entrenamiento Funcional', 'Circuito'] },
      { time: '7:00 – 8:00',  period: 'pm', classes: ['Zumba', 'Core', 'Circuito', 'Tabata', 'Entrenamiento Funcional'] },
    ],
  },
  {
    id: 'obrera',
    name: 'Sede Obrera',
    short: 'Obrera',
    tagline: 'Entrenamiento intensivo en el corazón de la ciudad.',
    address: 'Tampico – Cd. Valles esq. con Bocanegra, Col. Obrera, Cd. Valles',
    phone: '+52 481 111 1030',
    phoneLink: 'https://wa.me/524811111030',
    email: 'g-nafc@hotmail.com',
    accent: '#ff8a9b',
    accent2: '#e6397b',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3699.7266367143366!2d-99.00868919999999!3d21.9834523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d66d99c8e6a805%3A0x7a04e0cfe709160!2sOFICINA%20MUNICIPAL%20DE%20ENLACE%20SECRETARIA%20DE%20RELACIONES%20EXTERIORES%20SRE!5e0!3m2!1ses!2smx!4v1767058431791!5m2!1ses!2smx',
    rows: [
      { time: '7:00', period: 'am', classes: ['GAP', 'Entrenamiento Funcional', 'Glute Bands', 'Entrenamiento Funcional', 'Tabata'] },
      { time: '8:00', period: 'am', classes: ['Entrenamiento Funcional', 'GAP', 'Entrenamiento Funcional', 'Meta HIT', 'Circuito'] },
      { time: '9:00', period: 'am', classes: ['Glute Bands', 'Entrenamiento Funcional', 'Full Body', 'Power Rebounder', 'Zumba'] },
      { time: '5:00', period: 'pm', classes: ['Circuito', 'Entrenamiento Funcional', 'Full Body', 'Entrenamiento Funcional', null] },
      { time: '6:00', period: 'pm', classes: ['Glute Bands', 'Circuito', 'Tabata', 'Full Body', 'Clase libre'] },
      { time: '7:00', period: 'pm', classes: ['Entrenamiento Funcional', 'Zumba', 'Entrenamiento Funcional', 'GAP', 'Entrenamiento Funcional'] },
      { time: '8:00', period: 'pm', classes: ['Entrenamiento Funcional', 'Meta HIT', 'Glute Bands', 'Entrenamiento Funcional', null] },
    ],
  },
];

const COLORS: Record<string, string> = {
  'entrenamiento funcional': '#c9a7ff', 'gap': '#7cc4ff', 'glute bands': '#7ee8b0',
  'tabata': '#ff8fa3', 'circuito': '#ffb37a', 'zumba': '#ff8fd8', 'core': '#5eead4',
  'meta hit': '#a5b4fc', 'full body': '#ffd36b', 'power rebounder': '#fff07a', 'clase libre': '#e5e7eb',
};
const colorOf = (name: string) => COLORS[name.toLowerCase()] ?? '#f5d0fe';

/* Figuras que flotan en el fondo */
const KINDS = ['heart', 'dot', 'star', 'dot', 'heart', 'dot', 'star'] as const;
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 41 + 9) % 100,
  size: 8 + ((i * 7) % 14),
  dur: 18 + ((i * 5) % 16),
  delay: -((i * 3) % 22),
  drift: ((i * 13) % 80) - 40,
  kind: KINDS[i % KINDS.length]!,
}));

/* ================= ESTADO ================= */
const sedeId = ref(SEDES[0]!.id);
const day = ref(0);
const todayIdx = ref(-1);
const view = ref<'day' | 'week'>('week');
const nowMin = ref(-1);
const copied = ref(false);

const sede = computed(() => SEDES.find(s => s.id === sedeId.value) ?? SEDES[0]!);

const startMin = (r: Row) => {
  const m = r.time.match(/(\d+):(\d+)/);
  const h = m ? parseInt(m[1]!, 10) : 0;
  const mi = m ? parseInt(m[2]!, 10) : 0;
  return (r.period === 'pm' && h < 12 ? h + 12 : h) * 60 + mi;
};
const fmt = (min: number) => {
  const h24 = Math.floor(min / 60), m = min % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'pm' : 'am'}`;
};

const statusOf = (r: Row): 'live' | 'past' | '' => {
  if (todayIdx.value !== day.value || nowMin.value < 0) return '';
  const s = startMin(r);
  if (nowMin.value >= s && nowMin.value < s + 60) return 'live';
  if (nowMin.value >= s + 60) return 'past';
  return '';
};

/* Datos rápidos de la sede (salen de los horarios) */
const stats = computed(() => {
  const rows = sede.value.rows;
  const total = rows.reduce((a, r) => a + r.classes.filter(Boolean).length, 0);
  const starts = rows.map(startMin);
  return {
    total,
    first: fmt(Math.min(...starts)),
    last: fmt(Math.max(...starts) + 60),
  };
});

/* Tabla de escritorio: filas con separadores Mañana / Tarde */
const tableRows = computed(() => {
  const out: ({ kind: 'label'; text: string } | { kind: 'row'; row: Row })[] = [];
  let last = '';
  sede.value.rows.forEach(r => {
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
  const pick = (period: 'am' | 'pm') =>
    sede.value.rows
      .filter(r => r.period === period && r.classes[day.value])
      .map(r => ({ time: r.time, name: r.classes[day.value] as string, status: statusOf(r) }));
  return [
    { label: 'Mañana', kind: 'am', items: pick('am') },
    { label: 'Tarde y noche', kind: 'pm', items: pick('pm') },
  ].filter(g => g.items.length);
});

const banner = computed(() => {
  if (todayIdx.value < 0) return { kind: 'rest', title: 'Hoy descansamos', text: 'Nos vemos el lunes con toda la energía.', color: '' };
  const today = sede.value.rows
    .filter(r => r.classes[todayIdx.value])
    .map(r => ({ s: startMin(r), name: r.classes[todayIdx.value] as string }))
    .sort((a, b) => a.s - b.s);
  const live = today.find(c => nowMin.value >= c.s && nowMin.value < c.s + 60);
  if (live) return { kind: 'live', title: 'En curso ahora', text: `${live.name} · termina a las ${fmt(live.s + 60)}`, color: colorOf(live.name) };
  const next = today.find(c => c.s > nowMin.value);
  if (next) return { kind: 'next', title: 'Siguiente clase hoy', text: `${next.name} · ${fmt(next.s)}`, color: colorOf(next.name) };
  return { kind: 'rest', title: 'Por hoy terminamos', text: 'Mañana te esperamos con más ganas.', color: '' };
});

const legend = computed(() => {
  const set = new Set<string>();
  sede.value.rows.forEach(r => r.classes.forEach(c => c && set.add(c)));
  return [...set];
});

const directions = computed(() =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sede.value.address)}`
);

const pickSede = (id: string) => { sedeId.value = id; };

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(sede.value.address);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1800);
  } catch { /* sin permiso */ }
};

/* ---------- Aparición + reloj ---------- */
const root = ref<HTMLElement | null>(null);
const revealed = ref(false);
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
  if (!('IntersectionObserver' in window) || !root.value) { revealed.value = true; return; }
  io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { revealed.value = true; io?.disconnect(); } }, { threshold: 0.04 });
  io.observe(root.value);
});
onUnmounted(() => { io?.disconnect(); if (timer) clearInterval(timer); });
</script>

<template>
  <section
    id="location"
    ref="root"
    :class="['loc', { revealed }]"
    :style="{ '--accent': sede.accent, '--accent2': sede.accent2 }"
  >
    <!-- ===== Fondo animado ===== -->
    <div class="aurora" aria-hidden="true"></div>
    <div class="blob b1" aria-hidden="true"></div>
    <div class="blob b2" aria-hidden="true"></div>
    <div class="blob b3" aria-hidden="true"></div>
    <div class="blob b4" aria-hidden="true"></div>

    <div class="floaters" aria-hidden="true">
      <i
        v-for="(p, i) in PARTICLES"
        :key="i"
        :class="['pt', p.kind]"
        :style="{ left: p.left + '%', '--s': p.size + 'px', animationDuration: p.dur + 's', animationDelay: p.delay + 's', '--dx': p.drift + 'px' }"
      >{{ p.kind === 'heart' ? '♥' : p.kind === 'star' ? '✦' : '' }}</i>
    </div>

    <svg class="wave w1" viewBox="0 0 2880 160" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,80 C240,20 480,140 720,80 C960,20 1200,140 1440,80 C1680,20 1920,140 2160,80 C2400,20 2640,140 2880,80 L2880,160 L0,160 Z" />
    </svg>
    <svg class="wave w2" viewBox="0 0 2880 160" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,60 C300,130 540,10 720,70 C900,130 1140,10 1440,60 C1740,130 1980,10 2160,70 C2340,130 2580,10 2880,60 L2880,160 L0,160 Z" />
    </svg>

    <div class="container">
      <!-- ===== Cabecera ===== -->
      <header class="head">
        <span class="eyebrow"><i class="dot"></i> Contáctanos · Cd. Valles</span>
        <h2 class="title">No podemos esperar <span class="grad">a verte</span></h2>
        <p class="subtitle">Elige tu sede, descubre cómo llegar y encuentra la clase perfecta para ti.</p>
      </header>

      <!-- ===== Selector de sede ===== -->
      <div class="sedes" role="tablist" aria-label="Sedes">
        <button
          v-for="s in SEDES"
          :key="s.id"
          role="tab"
          :aria-selected="s.id === sedeId"
          :class="['sede-btn', { active: s.id === sedeId }]"
          :style="{ '--c1': s.accent, '--c2': s.accent2 }"
          @click="pickSede(s.id)"
        >
          <span class="sede-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <span class="sede-txt">
            <strong>{{ s.name }}</strong>
            <small>{{ s.address.split(',')[1]?.trim() || s.address }}</small>
          </span>
          <span class="check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
          </span>
        </button>
      </div>

      <!-- ===== UBICACIÓN: info + mapa ===== -->
      <div class="where">
        <article class="card info" :key="sede.id">
          <span class="kicker">Ubicación</span>
          <h3>{{ sede.name }}</h3>
          <p class="tag">{{ sede.tagline }}</p>

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
                <button class="copy" type="button" aria-label="Copiar dirección" @click="copyAddress">{{ copied ? '¡Copiada!' : 'Copiar dirección' }}</button>
              </span>
            </li>
            <li>
              <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
              <span class="c-body">
                <small>Teléfono / WhatsApp</small>
                <a class="c-val" :href="sede.phoneLink" target="_blank" rel="noopener">{{ sede.phone }}</a>
              </span>
            </li>
            <li>
              <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
              <span class="c-body">
                <small>Correo</small>
                <a class="c-val" :href="`mailto:${sede.email}`">{{ sede.email }}</a>
              </span>
            </li>
          </ul>

          <div class="btns">
            <a class="btn btn-main" :href="directions" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8-8-2Z"/></svg>
              Cómo llegar
            </a>
            <a class="btn btn-ghost" :href="sede.phoneLink" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg>
              WhatsApp
            </a>
          </div>
        </article>

        <article class="card map">
          <iframe
            :key="sede.id"
            :src="sede.mapSrc"
            :title="`Mapa de ${sede.name}`"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <span class="map-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ sede.name }}
          </span>
        </article>
      </div>

      <!-- ===== HORARIOS ===== -->
      <article class="card schedule">
        <div class="sched-head">
          <div>
            <span class="kicker">Clases</span>
            <h3>Horarios</h3>
            <p class="sched-sub">{{ sede.name }} · Lunes a Viernes</p>
            <div class="seg" role="tablist" aria-label="Vista de horarios">
              <button :class="{ on: view === 'day' }" role="tab" :aria-selected="view === 'day'" @click="view = 'day'">Por día</button>
              <button :class="{ on: view === 'week' }" role="tab" :aria-selected="view === 'week'" @click="view = 'week'">Semana</button>
            </div>
          </div>
          <div :key="sede.id + banner.kind + banner.text" :class="['now-bar', banner.kind]" :style="{ '--k': banner.color || 'var(--accent)' }">
            <span class="pulse" aria-hidden="true"></span>
            <span class="now-txt"><strong>{{ banner.title }}</strong><span>{{ banner.text }}</span></span>
          </div>
        </div>

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
                    <span v-if="c" class="chip" :style="{ '--k': colorOf(c) }">{{ c }}</span>
                    <span v-else class="dash">—</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Vista por día -->
        <div v-else class="mob">
          <div class="days" role="tablist" aria-label="Días">
            <button
              v-for="(d, i) in DAYS"
              :key="d.short"
              role="tab"
              :aria-selected="day === i"
              :class="['day', { active: day === i }]"
              @click="day = i"
            >
              <span>{{ d.short }}</span>
              <i v-if="todayIdx === i" class="today-tag">Hoy</i>
            </button>
          </div>

          <div :key="sede.id + day" class="day-body">
            <p class="day-name">{{ DAYS[day]?.long }}<em v-if="todayIdx === day"> · Hoy</em></p>
            <div class="groups">
              <section v-for="g in groups" :key="g.kind" class="group">
                <h4>{{ g.label }}</h4>
                <ul>
                  <li
                    v-for="(it, i) in g.items"
                    :key="i"
                    :class="[it.status]"
                    :style="{ '--k': colorOf(it.name), '--i': i }"
                  >
                    <span class="t">{{ it.time }}<small>{{ g.kind }}</small></span>
                    <span class="n">{{ it.name }}</span>
                    <em v-if="it.status === 'live'" class="live-tag">En vivo</em>
                  </li>
                </ul>
              </section>
            </div>
            <p v-if="!groups.length" class="empty">No hay clases este día.</p>
          </div>
        </div>

        <ul class="legend" aria-label="Tipos de clase">
          <li v-for="l in legend" :key="l" :style="{ '--k': colorOf(l) }"><i></i>{{ l }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.loc {
  --accent: #a78bfa;
  --accent2: #7c3aed;
  --glass: linear-gradient(160deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04)), rgba(22, 12, 54, 0.5);
  position: relative;
  scroll-margin-top: 84px;
  padding: clamp(56px, 9vw, 110px) clamp(14px, 4vw, 56px) clamp(90px, 11vw, 150px);
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse 60% 50% at 0% 0%, rgba(124, 58, 237, 0.45), transparent 62%),
    radial-gradient(ellipse 55% 45% at 100% 22%, rgba(59, 130, 246, 0.26), transparent 62%),
    radial-gradient(ellipse 60% 50% at 10% 100%, rgba(217, 70, 239, 0.26), transparent 62%),
    linear-gradient(170deg, #0d0922 0%, #170f3d 45%, #261361 100%);
}

/* ================= FONDO ANIMADO ================= */
.aurora {
  position: absolute; z-index: -6; pointer-events: none; left: 50%; top: 50%; width: 150%; aspect-ratio: 1; translate: -50% -50%;
  background: conic-gradient(from 0deg, rgba(124, 58, 237, 0), rgba(139, 92, 246, 0.5), rgba(217, 70, 239, 0.32), rgba(56, 189, 248, 0.3), rgba(139, 92, 246, 0.5), rgba(124, 58, 237, 0));
  filter: blur(100px); opacity: 0.42; animation: spin 70s linear infinite;
}
.blob { position: absolute; border-radius: 50%; filter: blur(85px); z-index: -5; pointer-events: none; will-change: transform; }
.b1 { width: 520px; height: 520px; background: rgba(109, 40, 217, 0.5); top: -160px; left: -140px; animation: floatA 18s ease-in-out infinite alternate; }
.b2 { width: 460px; height: 460px; background: color-mix(in srgb, var(--accent) 45%, transparent); top: 30%; right: -150px; transition: background 0.9s ease; animation: floatB 22s ease-in-out infinite alternate; }
.b3 { width: 420px; height: 420px; background: rgba(217, 70, 239, 0.3); bottom: 8%; left: 6%; animation: floatC 20s ease-in-out infinite alternate; }
.b4 { width: 340px; height: 340px; background: rgba(56, 189, 248, 0.2); top: 8%; left: 42%; animation: floatA 26s ease-in-out infinite alternate-reverse; }

@keyframes floatA { from { transform: translate(0, 0) scale(1); } to { transform: translate(90px, 70px) scale(1.18); } }
@keyframes floatB { from { transform: translate(0, 0) scale(1.05); } to { transform: translate(-100px, -60px) scale(0.9); } }
@keyframes floatC { from { transform: translate(0, 0) scale(0.95); } to { transform: translate(70px, -90px) scale(1.2); } }
@keyframes spin { to { transform: rotate(360deg); } }

/* Corazones, destellos y burbujas que suben */
.floaters { position: absolute; inset: 0; z-index: -3; pointer-events: none; overflow: hidden; }
.pt { position: absolute; bottom: -40px; font-style: normal; line-height: 1; opacity: 0; color: rgba(255, 255, 255, 0.75); animation: riseUp linear infinite; }
.pt.heart, .pt.star { font-size: var(--s); text-shadow: 0 0 14px rgba(196, 181, 253, 0.8); }
.pt.heart { color: rgba(244, 190, 255, 0.85); }
.pt.dot { width: var(--s); height: var(--s); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, rgba(255, 255, 255, 0.05) 70%); border: 1px solid rgba(255, 255, 255, 0.3); }
@keyframes riseUp {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.85; }
  50% { transform: translate(calc(var(--dx) * 0.5), -55vh) rotate(18deg); }
  90% { opacity: 0.5; }
  100% { transform: translate(var(--dx), -115vh) rotate(-14deg); opacity: 0; }
}

/* Olas suaves abajo */
.wave { position: absolute; left: 0; bottom: 0; width: 200%; height: clamp(70px, 10vw, 140px); z-index: -2; pointer-events: none; }
.w1 { fill: rgba(167, 139, 250, 0.12); animation: slide 26s linear infinite; }
.w2 { fill: rgba(217, 70, 239, 0.12); height: clamp(55px, 8vw, 110px); animation: slide 18s linear infinite reverse; }
@keyframes slide { to { transform: translateX(-50%); } }

.container { max-width: 1240px; margin: 0 auto; position: relative; }

/* ================= CABECERA ================= */
.head { text-align: center; margin-bottom: clamp(24px, 4vw, 38px); opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.revealed .head { opacity: 1; transform: none; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 8px 18px; border-radius: 999px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: #fff;
  background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: #7ef0b8; animation: ping 2s infinite; }
@keyframes ping { 0% { box-shadow: 0 0 0 0 rgba(126, 240, 184, 0.8); } 70%, 100% { box-shadow: 0 0 0 9px rgba(126, 240, 184, 0); } }
.title { margin: 0 0 14px; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: clamp(2.3rem, 7vw, 4.6rem); line-height: 1.06; text-transform: uppercase; text-shadow: 0 6px 30px rgba(5, 2, 20, 0.5); }
.grad {
  display: inline-block;
  background: linear-gradient(100deg, #fff 0%, #e4d4ff 35%, #ffd0f5 65%, #fff 100%);
  background-size: 220% auto; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent;
  animation: shine 6s linear infinite;
  filter: drop-shadow(0 4px 18px rgba(5, 2, 20, 0.45));
}
@keyframes shine { to { background-position: 220% center; } }
.subtitle { margin: 0 auto; max-width: 52ch; font-size: clamp(1rem, 2.4vw, 1.2rem); line-height: 1.6; color: rgba(255, 255, 255, 0.88); text-shadow: 0 2px 14px rgba(5, 2, 20, 0.4); }

/* ================= SELECTOR DE SEDE ================= */
.sedes {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(10px, 1.6vw, 18px);
  max-width: 820px; margin: 0 auto clamp(22px, 3vw, 34px);
  opacity: 0; transform: translateY(16px); transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
}
.revealed .sedes { opacity: 1; transform: none; }
.sede-btn {
  position: relative; display: flex; align-items: center; gap: 14px; text-align: left; cursor: pointer;
  padding: clamp(14px, 2vw, 20px); border-radius: 22px; color: #fff; font: inherit;
  background: var(--glass); border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  transition: transform 0.25s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.sede-btn:hover { transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.55); }
.sede-btn.active { background: linear-gradient(135deg, var(--c1), var(--c2)); border-color: #fff; box-shadow: 0 18px 40px rgba(5, 2, 20, 0.45); }
.sede-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.sede-pin { flex: 0 0 auto; width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; background: rgba(255, 255, 255, 0.2); }
.sede-pin svg { width: 22px; height: 22px; }
.sede-txt { min-width: 0; line-height: 1.3; flex: 1; }
.sede-txt strong { display: block; font-size: clamp(0.95rem, 2.2vw, 1.15rem); }
.sede-txt small { display: block; font-size: clamp(0.8rem, 1.8vw, 0.92rem); color: rgba(255, 255, 255, 0.85); }
.check { flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #fff; color: var(--c2); transform: scale(0); transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.5); }
.check svg { width: 15px; height: 15px; }
.sede-btn.active .check { transform: scale(1); }

/* ================= TARJETAS ================= */
.card {
  position: relative;
  background: var(--glass);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: clamp(22px, 2.8vw, 32px);
  backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2);
  box-shadow: 0 28px 60px rgba(5, 2, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  opacity: 0; transform: translateY(26px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.card::before {
  content: ''; position: absolute; left: 32px; right: 32px; top: 0; height: 3px; border-radius: 3px;
  background: linear-gradient(90deg, transparent, #e4d4ff, var(--accent), #e4d4ff, transparent);
}
.revealed .card { opacity: 1; transform: none; }
.kicker { font-size: 0.8rem; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #d8c8ff; }

/* ================= UBICACIÓN ================= */
.where { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: clamp(16px, 2.6vw, 30px); align-items: stretch; margin-bottom: clamp(18px, 3vw, 30px); }
.info { padding: clamp(22px, 3vw, 38px); display: flex; flex-direction: column; transition-delay: 0.25s; }
.info h3 { margin: 6px 0 8px; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; text-transform: uppercase; font-size: clamp(1.8rem, 4vw, 2.5rem); line-height: 1.1; }
.tag { margin: 0 0 20px; font-size: clamp(1rem, 2vw, 1.12rem); line-height: 1.55; color: rgba(255, 255, 255, 0.88); }

.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 22px; }
.stat { padding: 14px 10px; border-radius: 18px; text-align: center; background: rgba(255, 255, 255, 0.09); border: 1px solid rgba(255, 255, 255, 0.18); }
.stat strong { display: block; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: clamp(1.25rem, 2.6vw, 1.7rem); letter-spacing: 0.4px; line-height: 1.1; font-variant-numeric: tabular-nums; }
.stat span { display: block; margin-top: 4px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255, 255, 255, 0.72); }

.contact { list-style: none; margin: 0 0 26px; padding: 0; display: grid; gap: 18px; }
.contact li { display: flex; align-items: flex-start; gap: 16px; }
.ic { flex: 0 0 auto; width: 50px; height: 50px; border-radius: 16px; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 10px 22px rgba(5, 2, 20, 0.4); }
.ic svg { width: 24px; height: 24px; }
.c-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.c-body small { font-size: 0.76rem; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255, 255, 255, 0.7); }
.c-val { font-size: clamp(1.05rem, 2.2vw, 1.25rem); font-weight: 700; line-height: 1.4; color: #fff; text-decoration: none; word-break: break-word; }
a.c-val:hover { text-decoration: underline; }
.copy { align-self: flex-start; margin-top: 6px; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.32); background: rgba(255, 255, 255, 0.1); color: #fff; font: 700 0.8rem 'Inter', sans-serif; padding: 7px 14px; border-radius: 999px; transition: background 0.2s ease; }
.copy:hover { background: rgba(255, 255, 255, 0.24); }
.copy:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

.btns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: auto; }
.btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 58px; padding: 0 16px; border-radius: 999px; text-decoration: none; color: #fff; font: 800 1.05rem 'Inter', sans-serif; transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease; }
.btn-main { background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 12px 28px rgba(5, 2, 20, 0.45); border: 1px solid rgba(255, 255, 255, 0.45); }
.btn-main::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%); transform: translateX(-120%); animation: sweep 3.6s ease-in-out infinite; }
@keyframes sweep { 60%, 100% { transform: translateX(120%); } }
.btn-ghost { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.4); }
.btn:hover { transform: translateY(-3px); }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.22); }
.btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

.map { overflow: hidden; padding: 8px; min-height: 520px; transition-delay: 0.35s; }
.map iframe { display: block; width: 100%; height: 100%; min-height: 504px; border: 0; border-radius: clamp(16px, 2.2vw, 24px); }
.map-tag {
  position: absolute; left: 22px; top: 22px; display: inline-flex; align-items: center; gap: 8px; max-width: calc(100% - 44px);
  padding: 9px 16px 9px 12px; border-radius: 999px; font: 800 0.9rem 'Inter', sans-serif; color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 10px 24px rgba(5, 2, 20, 0.45); border: 1px solid rgba(255, 255, 255, 0.45);
  pointer-events: none;
}
.map-tag svg { width: 18px; height: 18px; flex: 0 0 auto; }

/* ================= HORARIOS ================= */
.schedule { padding: clamp(16px, 3vw, 34px); transition-delay: 0.45s; }
.sched-head { display: flex; align-items: center; justify-content: space-between; gap: 18px 24px; flex-wrap: wrap; margin-bottom: clamp(16px, 2.4vw, 24px); }
.sched-head h3 { margin: 2px 0 0; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; text-transform: uppercase; font-size: clamp(1.9rem, 4.6vw, 2.8rem); letter-spacing: 0.5px; line-height: 1.1; }
.sched-sub { margin: 4px 0 0; font-size: clamp(0.92rem, 2vw, 1.05rem); color: rgba(255, 255, 255, 0.82); font-weight: 600; }

.now-bar {
  --k: var(--accent);
  display: flex; align-items: center; gap: 14px; padding: 12px 20px; border-radius: 18px; max-width: 100%;
  background: color-mix(in srgb, var(--k) 20%, rgba(20, 10, 55, 0.55));
  border: 1px solid color-mix(in srgb, var(--k) 55%, transparent);
  animation: fadeIn 0.5s ease both;
}
.now-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; line-height: 1.3; }
.now-txt strong { font-size: 0.74rem; letter-spacing: 1.2px; text-transform: uppercase; color: color-mix(in srgb, var(--k) 70%, #fff); }
.now-txt span { font-weight: 800; font-size: 1.02rem; color: #fff; }
.pulse { flex: 0 0 auto; width: 12px; height: 12px; border-radius: 50%; background: var(--k); animation: ring 1.8s infinite; }
.now-bar.rest .pulse { animation: none; opacity: 0.6; }
@keyframes ring { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--k) 70%, transparent); } 80%, 100% { box-shadow: 0 0 0 12px transparent; } }

.seg { display: inline-flex; margin-top: 14px; padding: 5px; border-radius: 999px; background: rgba(10, 5, 30, 0.5); border: 1px solid rgba(255, 255, 255, 0.18); }
.seg button { border: 0; cursor: pointer; padding: 11px 24px; border-radius: 999px; background: transparent; color: rgba(255, 255, 255, 0.78); font: 800 0.95rem 'Inter', sans-serif; transition: background 0.25s ease, color 0.25s ease; }
.seg button:hover { color: #fff; }
.seg button.on { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 8px 18px rgba(5, 2, 20, 0.45); }
.seg button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* Tabla */
.desk { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.desk .week { min-width: 780px; }
.week { width: 100%; border-collapse: separate; border-spacing: 8px; table-layout: fixed; animation: fadeIn 0.45s ease both; }
.week thead th {
  padding: 14px 6px; border-radius: 16px; background: rgba(255, 255, 255, 0.11); border: 1px solid rgba(255, 255, 255, 0.16);
  font: 800 clamp(0.9rem, 1.3vw, 1.1rem) 'Inter', sans-serif; letter-spacing: 0.4px; color: #fff; text-transform: uppercase;
}
.week thead th small { display: block; margin-top: 2px; font-size: 0.66rem; letter-spacing: 1px; opacity: 0.95; }
.week thead th.now { background: linear-gradient(135deg, var(--accent), var(--accent2)); border-color: #fff; box-shadow: 0 8px 20px rgba(5, 2, 20, 0.45); }
.week thead th.corner { background: transparent; border-color: transparent; width: 148px; text-align: left; color: rgba(255, 255, 255, 0.7); font-size: 0.8rem; padding-left: 6px; }

.week tbody th.time { text-align: left; white-space: nowrap; font: 800 clamp(0.92rem, 1.25vw, 1.08rem) 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; padding: 0 6px; }
.week tbody th.time small { margin-left: 5px; padding: 2px 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.18); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.5px; }

.week tr.band td { padding: 14px 0 2px; }
.week tr.band span { display: inline-flex; align-items: center; gap: 12px; width: 100%; font: 800 0.8rem 'Inter', sans-serif; letter-spacing: 1.6px; text-transform: uppercase; color: #d8c8ff; }
.week tr.band span::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255, 255, 255, 0.4), transparent); }

.week td { padding: 0; }
.chip {
  display: flex; align-items: center; justify-content: center; text-align: center; min-height: 74px; padding: 10px 8px;
  border-radius: 16px; color: #fff;
  font-size: clamp(0.82rem, 1.2vw, 1rem); font-weight: 800; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(5, 2, 20, 0.6);
  background: linear-gradient(170deg, color-mix(in srgb, var(--k) 42%, rgba(20, 10, 55, 0.78)), color-mix(in srgb, var(--k) 18%, rgba(20, 10, 55, 0.78)));
  border: 1px solid color-mix(in srgb, var(--k) 60%, transparent);
  box-shadow: inset 0 3px 0 var(--k);
  transition: transform 0.2s ease, filter 0.2s ease;
}
.chip:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.15); }
.week td.today .chip { border-color: rgba(255, 255, 255, 0.85); }
.dash { display: flex; align-items: center; justify-content: center; min-height: 74px; border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.25); color: rgba(255, 255, 255, 0.45); font-weight: 700; }

.legend { list-style: none; margin: clamp(16px, 2.4vw, 24px) 0 0; padding: 18px 0 0; display: flex; flex-wrap: wrap; gap: 10px 20px; border-top: 1px dashed rgba(255, 255, 255, 0.28); }
.legend li { display: inline-flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: rgba(255, 255, 255, 0.9); }
.legend i { width: 12px; height: 12px; border-radius: 50%; background: var(--k); box-shadow: 0 0 10px var(--k); }

/* Vista por día */
.days { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; margin-bottom: 18px; }
.day {
  cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 18px; min-height: 64px;
  color: rgba(255, 255, 255, 0.92); background: rgba(255, 255, 255, 0.09);
  font: 800 0.95rem 'Inter', sans-serif; letter-spacing: 0.4px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  transition: background 0.25s ease, transform 0.25s ease;
}
.day:hover { background: rgba(255, 255, 255, 0.18); }
.day.active { background: linear-gradient(135deg, var(--accent), var(--accent2)); border-color: #fff; color: #fff; box-shadow: 0 10px 22px rgba(5, 2, 20, 0.45); }
.day:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.today-tag { font-style: normal; font-size: 0.62rem; font-weight: 700; padding: 1px 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.28); }
.day-body { animation: fadeIn 0.45s ease both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.day-name { margin: 0 0 4px; font-size: clamp(1.3rem, 3vw, 1.7rem); font-weight: 800; letter-spacing: 0.5px; }
.day-name em { font-style: normal; color: #d8c8ff; }
.groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 clamp(18px, 3vw, 36px); align-items: start; }
.group { margin-top: 14px; }
.group h4 { margin: 0 0 10px; font-size: 0.82rem; letter-spacing: 1.4px; text-transform: uppercase; color: #d8c8ff; }
.group ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.group li {
  display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 18px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--k) 26%, rgba(20, 10, 55, 0.65)), rgba(255, 255, 255, 0.06) 75%);
  border: 1px solid rgba(255, 255, 255, 0.16); border-left: 5px solid var(--k);
  animation: fadeIn 0.45s ease both; animation-delay: calc(var(--i) * 0.06s);
}
.group li.past { opacity: 0.5; }
.group li.live { border-color: var(--k); box-shadow: 0 0 26px color-mix(in srgb, var(--k) 50%, transparent); }
.t { flex: 0 0 auto; min-width: 104px; font-weight: 800; font-size: 1rem; font-variant-numeric: tabular-nums; }
.t small { margin-left: 4px; font-size: 0.72rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.72); }
.n { flex: 1; min-width: 0; font-weight: 800; font-size: 1.08rem; color: #fff; }
.live-tag { flex: 0 0 auto; font-style: normal; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; color: #1a1033; background: var(--k); }
.empty { margin: 18px 0 6px; text-align: center; color: rgba(255, 255, 255, 0.85); }

/* ================= RESPONSIVE ================= */
@media (max-width: 960px) {
  .where { grid-template-columns: minmax(0, 1fr); }
  .map { min-height: 360px; }
  .map iframe { min-height: 344px; }
  .groups { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .sede-pin { display: none; }
  .sede-btn { padding: 14px; }
  .stats { gap: 8px; }
  .stat { padding: 12px 6px; }
  .stat span { font-size: 0.62rem; letter-spacing: 0.4px; }
  .sched-head { align-items: stretch; }
  .now-bar { width: 100%; }
  .seg { display: flex; width: 100%; }
  .seg button { flex: 1; }
  .btns { grid-template-columns: minmax(0, 1fr); }
  .t { min-width: 92px; font-size: 0.92rem; }
  .n { font-size: 1rem; }
  .aurora { width: 260%; }
  .b1, .b2, .b3, .b4 { width: 300px; height: 300px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .head, .sedes, .card { opacity: 1 !important; transform: none !important; }
  .pt { opacity: 0.4 !important; }
}
</style>