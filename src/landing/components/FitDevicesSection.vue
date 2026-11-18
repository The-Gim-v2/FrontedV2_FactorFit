<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

/* ================= CONFIGURACIÓN ================= */
const FACEBOOK_HANDLE = 'factor.fit.2025';
const FACEBOOK_URL = `https://www.facebook.com/${FACEBOOK_HANDLE}/`;

interface Photo {
  image: string;
  caption: string;
  link?: string; // enlace a la publicación; si falta, abre tu página de Facebook
}

// Pega aquí tus fotos (URL directa o ruta de /public). Hay 8 tarjetas en el túnel.
// Si pones menos de 8, se repiten con recortes distintos para que no queden huecos.
const PHOTOS: Photo[] = [
  { image: 'https://i.ibb.co/272HW3wN/fondo-landing.jpg', caption: 'Clase grupal' },
  // { image: 'URL_IMAGEN_2', caption: 'Nuestra comunidad', link: 'https://www.facebook.com/...' },
];

// Capítulos que aparecen en grande mientras el túnel avanza (puedes cambiar los textos)
const CHAPTERS = [
  { word: 'Clases', kicker: 'Sudor y ritmo', line: 'Cada sesión, en movimiento.' },
  { word: 'Retos', kicker: 'Metas del mes', line: 'Se logran mejor en equipo.' },
  { word: 'Eventos', kicker: 'Momentos', line: 'Recuerdos que se quedan contigo.' },
  { word: 'Novedades', kicker: 'Al día', line: 'Entérate primero de todo.' },
];
/* ================================================= */

const SLOTS = 8;
const CROPS = ['center', '18% 40%', '82% 30%', '50% 90%', '8% 75%', '72% 62%', '35% 15%', '60% 50%'];
const ZOOMS = [1.05, 1.35, 1.3, 1.45, 1.4, 1.5, 1.35, 1.3];
const RATIOS = ['4 / 5', '1 / 1', '3 / 4', '4 / 5', '1 / 1', '3 / 4', '4 / 5', '1 / 1'];
const EXTRA = ['Entrenamos juntas', 'Energía de sobra', 'Aquí nadie va sola', 'Retos del mes', 'Risas y ritmo', 'Tu próxima clase', 'Siempre en equipo'];

const tiles = computed(() =>
  Array.from({ length: SLOTS }, (_, i) => {
    const p = PHOTOS[i % PHOTOS.length]!;
    const repeat = i >= PHOTOS.length;
    return {
      id: i,
      ...p,
      caption: repeat ? EXTRA[(i - PHOTOS.length) % EXTRA.length]! : p.caption,
      pos: repeat ? CROPS[i % CROPS.length]! : 'center',
      zoom: repeat ? ZOOMS[i % ZOOMS.length]! : 1.05,
      ar: RATIOS[i % RATIOS.length]!,
    };
  })
);

/* Título por palabras (aparecen una tras otra, de borroso a nítido) */
const TITLE_LINES = [['Lo', 'mejor', 'de'], ['Factor', 'Fit'], ['en', 'Facebook']];
const TITLE_TEXT = TITLE_LINES.map((l) => l.join(' ')).join(' ');
const wordIndex = (line: number, word: number) =>
  TITLE_LINES.slice(0, line).reduce((n, l) => n + l.length, 0) + word;

/* ---------- Geometría del túnel 3D ---------- */
const SPACING = 480; // distancia entre tarjetas (profundidad)
const START_Z = 1700; // qué tan lejos empieza la primera
const CAM_TOTAL = START_Z + (SLOTS - 1) * SPACING + 700; // recorrido total de la "cámara"
const XS = [-0.3, 0.29, -0.23, 0.32, -0.33, 0.25, -0.27, 0.3]; // × ancho
const YS = [-0.1, 0.12, 0.14, -0.14, 0.09, -0.09, 0.12, -0.12]; // × alto
const ROT = [-6, 5, -4, 7, -5, 4, -7, 6]; // grados Z
const TURN = [14, -14, 11, -16, 13, -11, 15, -13]; // grados Y (miran al centro)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

/* ---------- Refs ---------- */
const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const world = ref<HTMLElement | null>(null);
const introEl = ref<HTMLElement | null>(null);
const outroEl = ref<HTMLElement | null>(null);
const wmEl = ref<HTMLElement | null>(null);
const gridEl = ref<HTMLElement | null>(null);
const floorEl = ref<HTMLElement | null>(null);
const barEl = ref<HTMLElement | null>(null);
const cardEls: HTMLElement[] = [];
const chapEls: HTMLElement[] = [];
const dotEls: HTMLElement[] = [];
const setCard = (el: unknown, i: number) => { if (el) cardEls[i] = el as HTMLElement; };
const setChap = (el: unknown, i: number) => { if (el) chapEls[i] = el as HTMLElement; };
const setDot = (el: unknown, i: number) => { if (el) dotEls[i] = el as HTMLElement; };

const revealed = ref(false);
const visible = ref(false);
const reduced = ref(false);
const activeChapter = ref(0);

let W = 1200;
let H = 800;
let raf = 0;
let running = false;
let io: IntersectionObserver | null = null;
let mq: MediaQueryList | null = null;

/* ---------- Dibujo de cada fotograma según el progreso (0 → 1) ---------- */
function render(p: number) {
  // 1) Intro: el título se acerca a la cámara y se desvanece
  const ti = clamp(p / 0.13);
  const gone = smooth((ti - 0.5) / 0.5);
  if (introEl.value) {
    introEl.value.style.opacity = String(Math.min(1 - gone, smooth(p / 0.02)));
    introEl.value.style.transform = `scale(${1 + ti * 0.85})`;
    introEl.value.style.filter = gone > 0.01 ? `blur(${(gone * 18).toFixed(1)}px)` : 'none';
    introEl.value.style.visibility = gone >= 1 ? 'hidden' : 'visible';
  }

  // 2) Túnel: la cámara avanza y las tarjetas pasan volando
  const tp = clamp((p - 0.08) / 0.72);
  const cam = tp * CAM_TOTAL;
  for (let i = 0; i < SLOTS; i++) {
    const el = cardEls[i];
    if (!el) continue;
    const rel = -(START_Z + i * SPACING) + cam;
    const op = Math.min(smooth((rel + 1500) / 500), 1 - smooth((rel - 150) / 450));
    if (op <= 0.005) {
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      continue;
    }
    el.style.visibility = 'visible';
    el.style.opacity = op.toFixed(3);
    el.style.pointerEvents = op > 0.7 ? 'auto' : 'none';
    el.style.transform =
      `translate3d(${(W / 2 + XS[i]! * W).toFixed(1)}px, ${(H / 2 + YS[i]! * H).toFixed(1)}px, ${rel.toFixed(1)}px) ` +
      `translate(-50%, -50%) rotateY(${TURN[i]}deg) rotateZ(${ROT[i]}deg)`;
  }
  if (gridEl.value) gridEl.value.style.backgroundPosition = `0 ${(cam * 0.16).toFixed(1)}px`;
  if (wmEl.value) wmEl.value.style.transform = `translate3d(${(10 - p * 55).toFixed(2)}%, -50%, 0)`;

  // 3) Capítulos: palabras gigantes que se relevan
  let ac = 0;
  for (let k = 0; k < CHAPTERS.length; k++) {
    const el = chapEls[k];
    if (!el) continue;
    const u = tp * CHAPTERS.length - k;
    const a = smooth(u / 0.24);
    const b = 1 - smooth((u - 0.76) / 0.24);
    const op = u < 0 || u > 1 ? 0 : Math.min(a, b);
    if (op > 0.5) ac = k;
    el.style.opacity = op.toFixed(3);
    el.style.visibility = op <= 0.005 ? 'hidden' : 'visible';
    el.style.transform = `translate3d(0, ${((1 - a) * 60 - (1 - b) * 60).toFixed(1)}px, 0) scale(${(0.9 + 0.1 * a + (1 - b) * 0.16).toFixed(3)})`;
    el.style.filter = op < 0.98 ? `blur(${((1 - op) * 16).toFixed(1)}px)` : 'none';
  }
  activeChapter.value = ac;
  for (let k = 0; k < dotEls.length; k++) dotEls[k]?.classList.toggle('on', k === ac && tp > 0 && tp < 1);

  // 4) Final: llamada a la acción
  const o = smooth((p - 0.84) / 0.08) * (1 - smooth((p - 0.965) / 0.035));
  if (outroEl.value) {
    outroEl.value.style.opacity = o.toFixed(3);
    outroEl.value.style.visibility = o <= 0.005 ? 'hidden' : 'visible';
    outroEl.value.style.transform = `translate3d(0, ${((1 - o) * 40).toFixed(1)}px, 0) scale(${(0.86 + 0.14 * o).toFixed(3)})`;
    outroEl.value.style.filter = o < 0.98 ? `blur(${((1 - o) * 14).toFixed(1)}px)` : 'none';
    outroEl.value.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
  }
  if (floorEl.value) floorEl.value.style.opacity = (0.55 + 0.45 * Math.max(o, 1 - gone) * 0.9).toFixed(2);
  if (barEl.value) barEl.value.style.transform = `scaleX(${p.toFixed(4)})`;
}

function measure() {
  if (!stage.value) return;
  W = stage.value.clientWidth;
  H = stage.value.clientHeight;
}

/* ---------- Reloj propio: la animación corre sola en bucle ---------- */
const DURATION = 26000; // ms que dura una vuelta completa (sube el número para ir más lento)
let elapsed = 0;
let last = 0;
let rate = 1; // 1 = corriendo, 0 = en pausa (con transición suave)
let hold = false;

function loop(now: number) {
  if (!running) return;
  const dt = Math.min(now - last, 50);
  last = now;
  rate += ((hold ? 0 : 1) - rate) * 0.1;
  elapsed = (elapsed + dt * rate) % DURATION;
  render(elapsed / DURATION);
  raf = requestAnimationFrame(loop);
}
function start() {
  if (reduced.value || running) return;
  running = true;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}
function stop() {
  running = false;
  cancelAnimationFrame(raf);
}
/* Con el mouse sobre una foto o el botón, la animación se frena para poder hacer clic */
const onHold = (e: PointerEvent, v: boolean) => {
  if (e.pointerType === 'mouse') hold = v;
};

/* Foco de luz y ligera inclinación del mundo con el mouse (solo con mouse) */
const onPointer = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' || reduced.value || !stage.value) return;
  const r = stage.value.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  stage.value.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
  stage.value.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  if (world.value) world.value.style.transform = `rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 4.5).toFixed(2)}deg)`;
};

let ro: ResizeObserver | null = null;
onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced.value = mq.matches;
  measure();

  if (reduced.value) {
    revealed.value = true;
    visible.value = true;
    return;
  }
  render(0);
  if ('ResizeObserver' in window && stage.value) {
    ro = new ResizeObserver(() => { measure(); render(elapsed / DURATION); });
    ro.observe(stage.value);
  }
  if (!('IntersectionObserver' in window)) {
    revealed.value = true;
    visible.value = true;
    start();
    return;
  }
  io = new IntersectionObserver(
    ([e]) => {
      if (!e) return;
      visible.value = e.isIntersecting;
      if (e.isIntersecting) { revealed.value = true; start(); }
      else stop();
    },
    { threshold: 0.15 }
  );
  io.observe(root.value!);
});
onUnmounted(() => {
  io?.disconnect();
  ro?.disconnect();
  stop();
});
</script>

<template>
  <section
    id="facebook"
    ref="root"
    :class="['fb-section', { revealed, paused: !visible, reduced }]"
    aria-label="Factor Fit en Facebook"
  >
    <div ref="stage" class="stage" @pointermove="onPointer">
      <!-- ===== Fondo cinematográfico ===== -->
      <div class="bg-spot" aria-hidden="true"></div>
      <div ref="floorEl" class="floor" aria-hidden="true"></div>
      <div ref="gridEl" class="grid" aria-hidden="true"></div>
      <div ref="wmEl" class="watermark" aria-hidden="true">FACTOR FIT</div>
      <div class="beam beam-a" aria-hidden="true"></div>
      <div class="beam beam-b" aria-hidden="true"></div>
      <svg class="float f1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
      <svg class="float f2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21h4V9H2v12Zm20-11a2 2 0 0 0-2-2h-6.3l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 1 6.59 7.59A2 2 0 0 0 6 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z"/></svg>
      <svg class="float f3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z"/></svg>
      <svg class="float f4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
      <svg class="float f5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>

      <!-- ===== Túnel 3D de fotos ===== -->
      <div class="scene">
        <div ref="world" class="world">
          <a
            v-for="t in tiles"
            :key="t.id"
            :ref="(el) => setCard(el, t.id)"
            class="card"
            :href="t.link || FACEBOOK_URL"
            target="_blank"
            rel="noopener"
            :style="{ '--ar': t.ar }"
            :aria-label="`${t.caption} – ver en Facebook`"
            @pointerenter="onHold($event, true)"
            @pointerleave="onHold($event, false)"
          >
            <img
              :src="t.image"
              :alt="t.caption"
              :style="{ objectPosition: t.pos, '--zoom': t.zoom }"
              loading="lazy"
              decoding="async"
              draggable="false"
              referrerpolicy="no-referrer"
            />
            <span class="shade" aria-hidden="true"></span>
            <span class="shine" aria-hidden="true"></span>
            <span class="fb-dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z"/></svg>
            </span>
            <span class="cap">{{ t.caption }}</span>
          </a>
        </div>
      </div>
      <div class="vignette" aria-hidden="true"></div>

      <!-- ===== 1. Intro ===== -->
      <div ref="introEl" class="intro">
        <p class="eyebrow">
          <span class="badge">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z"/></svg>
          </span>
          Síguenos en redes
        </p>
        <h2 class="title" :aria-label="TITLE_TEXT">
          <span v-for="(line, li) in TITLE_LINES" :key="li" class="line" aria-hidden="true">
            <span
              v-for="(w, wi) in line"
              :key="wi"
              :class="['word', { hot: w === 'Facebook' }]"
              :style="{ '--w': wordIndex(li, wi) }"
            >{{ w }}</span>
          </span>
        </h2>
        <p class="subtitle">Fotos de nuestras clases, retos, eventos y novedades. Todo en un solo lugar.</p>
      </div>

      <!-- ===== 2. Capítulos ===== -->
      <div class="chapters" aria-hidden="true">
        <div v-for="(c, k) in CHAPTERS" :key="c.word" :ref="(el) => setChap(el, k)" class="chapter">
          <span class="ch-kicker"><b>0{{ k + 1 }}</b> {{ c.kicker }}</span>
          <span class="ch-word" :data-text="c.word">{{ c.word }}</span>
          <span class="ch-line">{{ c.line }}</span>
        </div>
      </div>

      <!-- ===== 3. Final ===== -->
      <div ref="outroEl" class="outro">
        <span class="badge badge-lg">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z"/></svg>
        </span>
        <h3 class="out-title">Únete a la <span>comunidad</span></h3>
        <p class="out-sub">Entra, mira todo lo que publicamos y no te pierdas ninguna clase.</p>
        <div class="actions" @pointerenter="onHold($event, true)" @pointerleave="onHold($event, false)">
          <a class="btn" :href="FACEBOOK_URL" target="_blank" rel="noopener">
            Ver más en Facebook
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </a>
          <a class="handle" :href="FACEBOOK_URL" target="_blank" rel="noopener">@{{ FACEBOOK_HANDLE }}</a>
        </div>
      </div>

      <!-- ===== Progreso ===== -->
      <div class="rail" aria-hidden="true">
        <span v-for="(c, k) in CHAPTERS" :key="c.word" :ref="(el) => setDot(el, k)" :class="['dot', { on: k === activeChapter }]">{{ c.word }}</span>
        <div class="bar"><i ref="barEl"></i></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Permanent+Marker&display=swap');

.fb-section {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --pink: #ff6ad5;
  --violet: #b25cff;
  --ice: #f3d3ff;
  position: relative;
  scroll-margin-top: 84px;
  height: clamp(640px, 100svh, 960px);
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background: #0a0716;
  overflow: hidden;
  isolation: isolate;
}

/* ---------- Escenario ---------- */
.stage {
  --mx: 50%;
  --my: 42%;
  position: relative;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(ellipse 70% 55% at 50% 100%, #3a1768 0%, rgba(58, 23, 104, 0) 70%),
    linear-gradient(180deg, #07040f 0%, #120a26 55%, #1d0e3a 100%);
}
.bg-spot {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(520px circle at var(--mx) var(--my), rgba(190, 100, 255, 0.28), transparent 70%);
}

/* Suelo luminoso + rejilla en perspectiva (como en los videos) */
.floor {
  position: absolute; z-index: 0; pointer-events: none;
  left: 50%; bottom: -22%; width: 130%; height: 56%;
  translate: -50% 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 106, 213, 0.55) 0%, rgba(178, 92, 255, 0.32) 32%, transparent 68%);
}
.grid {
  position: absolute; z-index: 1; pointer-events: none;
  left: -40%; right: -40%; bottom: -6%; height: 56%;
  background-image:
    linear-gradient(rgba(243, 211, 255, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(243, 211, 255, 0.22) 1px, transparent 1px);
  background-size: 70px 70px;
  transform: perspective(520px) rotateX(64deg);
  transform-origin: 50% 100%;
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 85%);
  mask-image: linear-gradient(to top, #000 0%, transparent 85%);
}

.watermark {
  position: absolute; z-index: 1; pointer-events: none; white-space: nowrap;
  left: 0; top: 50%;
  font: 400 clamp(10rem, 34vw, 30rem) 'Anton', 'Inter', sans-serif;
  letter-spacing: 0.02em; line-height: 1;
  color: transparent;
  -webkit-text-stroke: 2px rgba(243, 211, 255, 0.09);
  will-change: transform;
}

/* Haces de luz */
.beam {
  position: absolute; z-index: 1; pointer-events: none; top: -20%; width: 34%; height: 140%;
  background: linear-gradient(180deg, rgba(210, 130, 255, 0.2), transparent 70%);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  transform-origin: 50% 0;
  animation: sway 9s ease-in-out infinite alternate;
  will-change: transform;
}
.beam-a { left: 8%; rotate: 18deg; }
.beam-b { right: 6%; rotate: -20deg; animation-delay: -4s; animation-direction: alternate-reverse; }
@keyframes sway { from { transform: rotate(-5deg); opacity: 0.55; } to { transform: rotate(6deg); opacity: 1; } }

/* Reacciones que suben */
.float { position: absolute; z-index: 2; pointer-events: none; opacity: 0; animation: rise 11s ease-in infinite; }
.f1 { left: 6%;  bottom: 4%; width: 24px; height: 24px; color: #ff7ad1; }
.f2 { left: 24%; bottom: 2%; width: 20px; height: 20px; color: #c9a2ff; animation-delay: -3.6s; }
.f3 { right: 22%; bottom: 3%; width: 22px; height: 22px; color: #ffd6f4; animation-delay: -7s; }
.f4 { right: 8%; bottom: 3%; width: 18px; height: 18px; color: #ff9be0; animation-delay: -5s; }
.f5 { left: 52%; bottom: 2%; width: 16px; height: 16px; color: #f3d3ff; animation-delay: -1.8s; }
@keyframes rise {
  0%   { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
  12%  { opacity: 0.75; }
  100% { transform: translate3d(28px, -62vh, 0) scale(1.2); opacity: 0; }
}
.paused .beam, .paused .float, .paused .badge::after, .paused .btn::before { animation-play-state: paused; }

/* ---------- Túnel ---------- */
.scene {
  position: absolute; inset: 0; z-index: 3;
  perspective: 900px;
  perspective-origin: 50% 46%;
  pointer-events: none;
}
.world {
  position: absolute; inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.5s var(--ease-out);
}
.card {
  --cw: clamp(150px, 25vw, 340px);
  position: absolute; left: 0; top: 0;
  width: var(--cw);
  aspect-ratio: var(--ar, 4 / 5);
  border-radius: clamp(16px, 2vw, 26px);
  overflow: hidden;
  background: #2a1646;
  color: #fff; text-decoration: none;
  opacity: 0; visibility: hidden;
  box-shadow:
    0 30px 70px rgba(6, 2, 20, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.16),
    0 0 60px rgba(190, 90, 255, 0.28);
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-tap-highlight-color: transparent;
}
.card img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
  transform: scale(var(--zoom, 1));
}
.shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to top, rgba(8, 3, 26, 0.85) 0%, rgba(8, 3, 26, 0) 50%); }
.shine {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.22) 48%, transparent 62%);
  transform: translateX(-120%);
  transition: transform 0.9s var(--ease-out);
}
.fb-dot {
  position: absolute; top: 10px; right: 10px; z-index: 2;
  width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center;
  background: #1877f2; color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
.fb-dot svg { width: 16px; height: 16px; }
.cap {
  position: absolute; left: 14px; right: 14px; bottom: 12px; z-index: 2;
  font: 700 clamp(0.82rem, 1.3vw, 1rem) 'Inter', sans-serif;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
@media (hover: hover) and (pointer: fine) {
  .card:hover .shine { transform: translateX(120%); }
  .card:hover { outline: 2px solid #e0b3ff; outline-offset: -2px; }
}
.card:focus-visible { outline: 3px solid #e0b3ff; outline-offset: 3px; }

.vignette {
  position: absolute; inset: 0; z-index: 4; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 70% at 50% 50%, transparent 45%, rgba(5, 2, 14, 0.75) 100%);
}

/* ---------- Textos centrados ---------- */
.intro, .outro, .chapters, .chapter {
  position: absolute; z-index: 6;
}
.intro, .outro {
  inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 0 clamp(18px, 5vw, 60px);
  will-change: transform, opacity, filter;
}
.outro { opacity: 0; visibility: hidden; }
.chapters { inset: 0; pointer-events: none; }
.chapter {
  inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; gap: clamp(6px, 1.2vw, 14px); padding: 0 16px;
  opacity: 0; visibility: hidden; will-change: transform, opacity, filter;
}

.eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  margin: 0 0 clamp(14px, 2.4vw, 24px);
  font-size: clamp(0.7rem, 1.4vw, 0.82rem); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase;
  color: #e9c9ff;
  opacity: 0; transform: translate3d(0, 14px, 0);
  transition: opacity 0.6s var(--ease-out), transform 0.7s var(--ease-out);
}
.revealed .eyebrow { opacity: 1; transform: none; }

.badge {
  position: relative; display: grid; place-items: center;
  width: 34px; height: 34px; border-radius: 50%;
  background: #1877f2; color: #fff;
  box-shadow: 0 6px 18px rgba(24, 119, 242, 0.55);
}
.badge svg { width: 18px; height: 18px; }
.badge::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid rgba(80, 150, 255, 0.7);
  animation: pulse 2.6s ease-out infinite;
}
@keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
.badge-lg { width: 64px; height: 64px; margin-bottom: 18px; }
.badge-lg svg { width: 34px; height: 34px; }

.title {
  margin: 0 0 clamp(14px, 2.4vw, 24px);
  font-family: 'Permanent Marker', 'Inter', cursive;
  font-weight: 400;
  font-size: clamp(2.8rem, 9.5vw, 7.6rem);
  line-height: 1.02;
  letter-spacing: 1px;
  color: var(--ice);
  text-shadow: 0 4px 0 rgba(40, 10, 84, 0.7), 0 14px 44px rgba(20, 8, 44, 0.6);
}
.line { display: block; }
.word {
  display: inline-block;
  margin: 0 0.1em;
  opacity: 0;
  filter: blur(16px);
  transform: translate3d(0, 0.5em, 0) rotate(3deg);
  transition:
    opacity 0.7s var(--ease-out) calc(var(--w) * 0.09s + 0.1s),
    filter 0.9s var(--ease-out) calc(var(--w) * 0.09s + 0.1s),
    transform 0.9s var(--ease-out) calc(var(--w) * 0.09s + 0.1s);
}
.revealed .word { opacity: 1; filter: blur(0); transform: none; }
.word.hot { color: #a9ceff; }

.subtitle {
  margin: 0; max-width: 42ch;
  font-size: clamp(0.95rem, 1.8vw, 1.15rem); line-height: 1.6; color: rgba(255, 255, 255, 0.86);
  opacity: 0; transform: translate3d(0, 16px, 0);
  transition: opacity 0.7s var(--ease-out) 0.9s, transform 0.7s var(--ease-out) 0.9s;
}
.revealed .subtitle { opacity: 1; transform: none; }

/* Capítulos: palabra gigante con eco en contorno */
.ch-kicker {
  font-size: clamp(0.72rem, 1.5vw, 0.9rem); font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;
  color: #e9c9ff;
  padding: 7px 16px; border-radius: 999px;
  background: rgba(20, 9, 44, 0.55); border: 1px solid rgba(255, 255, 255, 0.18);
}
.ch-kicker b { color: var(--pink); margin-right: 6px; }
.ch-word {
  position: relative; display: block;
  font: 400 clamp(4rem, 19vw, 15rem) 'Anton', 'Inter', sans-serif;
  line-height: 0.95; text-transform: uppercase; letter-spacing: 0.01em;
  background: linear-gradient(180deg, #fff 10%, #e6bdff 55%, #b25cff 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  filter: drop-shadow(0 10px 40px rgba(120, 40, 200, 0.55));
}
.ch-word::before {
  content: attr(data-text);
  position: absolute; inset: 0; z-index: -1;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 2px rgba(255, 140, 230, 0.5);
  transform: translate(0.05em, 0.05em);
}
.ch-line {
  font-size: clamp(0.95rem, 2vw, 1.3rem); font-weight: 500; color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 16px rgba(10, 4, 28, 0.9);
}

/* Final */
.out-title {
  margin: 0 0 14px;
  font-family: 'Permanent Marker', 'Inter', cursive; font-weight: 400;
  font-size: clamp(2.6rem, 8.4vw, 6.4rem); line-height: 1.04; color: var(--ice);
  text-shadow: 0 4px 0 rgba(40, 10, 84, 0.7), 0 14px 44px rgba(20, 8, 44, 0.6);
}
.out-title span { color: #a9ceff; }
.out-sub { margin: 0 0 clamp(22px, 3.4vw, 34px); max-width: 44ch; font-size: clamp(0.95rem, 1.8vw, 1.15rem); line-height: 1.6; color: rgba(255, 255, 255, 0.86); }
.actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px 22px; }
.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 58px; padding: 0 34px; border-radius: 999px; text-decoration: none; color: #fff;
  font: 700 1.05rem 'Inter', sans-serif;
  background: linear-gradient(135deg, #3b8bff, #1877f2);
  box-shadow: 0 14px 34px rgba(24, 119, 242, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
}
.btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.45) 50%, transparent 65%);
  transform: translateX(-120%);
  animation: sweep 3.4s ease-in-out infinite;
}
@keyframes sweep { 0%, 55% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
.btn svg { transition: transform 0.2s var(--ease-out); }
.btn:active { transform: scale(0.97); }
.handle {
  color: rgba(255, 255, 255, 0.85); font-weight: 600; font-size: 1rem; text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35); padding-bottom: 2px;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.btn:focus-visible, .handle:focus-visible { outline: 2px solid #e0b3ff; outline-offset: 4px; }
@media (hover: hover) and (pointer: fine) {
  .btn:hover { transform: translateY(-3px); box-shadow: 0 20px 42px rgba(24, 119, 242, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.3) inset; }
  .btn:hover svg { transform: translateX(4px); }
  .handle:hover { color: #fff; border-color: #fff; }
}

/* ---------- Riel de progreso ---------- */
.rail {
  position: absolute; z-index: 7; left: 50%; bottom: clamp(18px, 3.4vh, 34px);
  translate: -50% 0; width: min(520px, 84vw);
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px 0;
  pointer-events: none;
}
.dot {
  font-size: 0.66rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35); transition: color 0.3s ease;
}
.dot.on { color: #fff; }
.bar { flex: 0 0 100%; height: 3px; border-radius: 3px; background: rgba(255, 255, 255, 0.14); overflow: hidden; }
.bar i { display: block; height: 100%; transform-origin: 0 50%; transform: scaleX(0); background: linear-gradient(90deg, var(--violet), var(--pink)); }

/* ---------- Móvil ---------- */
@media (max-width: 640px) {
  .fb-section { height: clamp(620px, 100svh, 900px); }
  .card { --cw: 46vw; }
  .grid { background-size: 48px 48px; }
  .dot { font-size: 0.58rem; letter-spacing: 0.1em; }
  .btn { width: 100%; }
  .actions { width: 100%; }
  .beam { display: none; }
  .ch-word::before { -webkit-text-stroke-width: 1.5px; }
}

/* ---------- Movimiento reducido: sin recorrido, galería estática ---------- */
.reduced.fb-section { height: auto; }
.reduced .stage { position: relative; height: auto; min-height: 0; padding: clamp(56px, 9vw, 110px) clamp(16px, 4vw, 60px); display: flex; flex-direction: column; align-items: center; gap: 36px; }
.reduced .scene { position: static; perspective: none; order: 2; width: 100%; max-width: 1000px; }
.reduced .world { position: static; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; transform: none !important; }
.reduced .card { position: relative; width: 100%; opacity: 1; visibility: visible; }
.reduced .intro, .reduced .outro { position: static; opacity: 1; visibility: visible; transform: none; filter: none; }
.reduced .outro { order: 3; }
.reduced .intro { order: 1; }
.reduced .chapters, .reduced .rail, .reduced .vignette, .reduced .beam, .reduced .float, .reduced .watermark { display: none; }
.reduced .eyebrow, .reduced .word, .reduced .subtitle { opacity: 1; filter: none; transform: none; transition: none; }
.reduced *, .reduced *::before, .reduced *::after { animation: none !important; }
</style>