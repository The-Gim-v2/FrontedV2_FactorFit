<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

/* ================= CONFIGURACIÓN ================= */
const INSTAGRAM_USER = 'factorfit_cdvalles';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USER}/`;
const FACEBOOK_URL = ''; // URL de la página de Facebook (vacío = no se muestra el botón)

// URL de tu endpoint o del JSON de un servicio de feed. Vacío = se usan las fotos de abajo.
const FEED_URL = '';
const SLOTS = 6; // historias que se reproducen en bucle
const STORY_MS = 4800; // lo que dura cada historia (sube el número para ir más lento)

// Tus fotos mientras no haya feed conectado. Agrega aquí las que quieras (ruta o URL).
// Si hay menos de 6, se repiten con recortes distintos para que no queden huecos.
const FALLBACK_POSTS: Post[] = [
  { id: 'p1', image: 'https://i.ibb.co/272HW3wN/fondo-landing.jpg', link: INSTAGRAM_URL, caption: 'Clase grupal' },
];
/* ================================================= */

interface Post { id: string; image: string; link: string; caption?: string }
interface Slot extends Post { pos: string; zoom: number; kx: string; ky: string; repeat: boolean }

const posts = ref<Post[]>([]);
const loading = ref(false);
const failed = ref(false);

/* Título por palabras: cada una pasa de borrosa a nítida, una tras otra */
const TITLE_LINES = [['Así', 'se', 'vive'], ['Factor', 'Fit']];
const TITLE_TEXT = TITLE_LINES.map((l) => l.join(' ')).join(' ');
const wordIndex = (line: number, word: number) =>
  TITLE_LINES.slice(0, line).reduce((n, l) => n + l.length, 0) + word;

/* Acepta el formato de la Graph API de Meta y el de servicios tipo Behold */
const normalize = (raw: any): Post | null => {
  const image =
    raw.sizes?.medium?.mediaUrl || raw.thumbnailUrl || raw.thumbnail_url ||
    raw.mediaUrl || raw.media_url || raw.image;
  if (!image) return null;
  return {
    id: String(raw.id ?? image),
    image,
    link: raw.permalink || raw.link || INSTAGRAM_URL,
    caption: raw.caption || raw.prunedCaption || '',
  };
};

const loadFeed = async () => {
  if (!FEED_URL) return;
  loading.value = true;
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const list: any[] = Array.isArray(json) ? json : json.data || json.posts || [];
    posts.value = list.map(normalize).filter(Boolean) as Post[];
    if (!posts.value.length) failed.value = true;
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
};

// Recortes distintos (la foto es horizontal y la historia es vertical) y dirección del zoom lento
const CROPS = ['38% 50%', '18% 40%', '82% 35%', '55% 70%', '8% 60%', '70% 45%'];
const ZOOMS = [1, 1.15, 1.1, 1.2, 1.12, 1.18];
const KX = ['-3%', '3.5%', '-4%', '3%', '-3.5%', '4%'];
const KY = ['-2%', '2%', '2.5%', '-2.5%', '2%', '-2%'];
const EXTRA = ['Entrenamos juntas', 'Energía de sobra', 'Aquí nadie va sola', 'Retos del mes', 'Risas y ritmo', 'Tu próxima clase'];

const slots = computed<Slot[]>(() => {
  const base = posts.value.length ? posts.value : FALLBACK_POSTS;
  if (!base.length) return [];
  return Array.from({ length: SLOTS }, (_, i): Slot => {
    const p = base[i % base.length]!;
    const repeat = i >= base.length;
    return {
      ...p,
      id: repeat ? `${p.id}-r${i}` : p.id,
      caption: repeat || !p.caption ? EXTRA[i % EXTRA.length]! : p.caption,
      pos: CROPS[i % CROPS.length]!,
      zoom: repeat ? ZOOMS[i % ZOOMS.length]! : 1,
      kx: KX[i % KX.length]!,
      ky: KY[i % KY.length]!,
      repeat,
    };
  });
});
const N = computed(() => (loading.value ? SLOTS : slots.value.length) || 1);
const words = (t: string) => t.split(/\s+/).filter(Boolean).slice(0, 10);

/* ---------- Reproductor de historias (corre solo) ---------- */
const root = ref<HTMLElement | null>(null);
const deck = ref<HTMLElement | null>(null);
const revealed = ref(false);
const visible = ref(false);
const reduced = ref(false);
const holding = ref(false);
const active = ref(0);
const snap = ref<number[]>([]); // tarjetas que "saltan" del extremo izquierdo al derecho sin animarse

// Posición relativa de cada historia respecto a la activa (0 = centro, ±1 vecinas…)
const relOf = (i: number, act = active.value) => {
  const n = N.value;
  let r = (((i - act) % n) + n) % n;
  if (r > n / 2) r -= n;
  return r;
};
const OPA = [1, 0.62, 0.2];
const cardStyle = (i: number) => {
  const r = relOf(i);
  const a = Math.abs(r);
  const hidden = a > 2 || snap.value.includes(i);
  return {
    transform:
      `translate3d(calc(-50% + ${r} * var(--step)), -50%, ${-a * 150}px) ` +
      `rotateY(${(-r * 24).toFixed(1)}deg) scale(${(1 - a * 0.12).toFixed(3)})`,
    opacity: hidden ? 0 : OPA[a],
    filter: a ? `blur(${(a * 1.3).toFixed(1)}px) brightness(${(1 - a * 0.16).toFixed(2)})` : 'none',
    zIndex: 20 - a,
    pointerEvents: a > 1 ? 'none' : 'auto',
    transition: snap.value.includes(i) ? 'none' : undefined,
  } as Record<string, string | number | undefined>;
};

function setActive(next: number) {
  const n = N.value;
  next = ((next % n) + n) % n;
  if (next === active.value) return;
  const before = Array.from({ length: n }, (_, i) => relOf(i));
  active.value = next;
  snap.value = before.map((r, i) => (Math.abs(relOf(i) - r) > 2 ? i : -1)).filter((i) => i >= 0);
  if (snap.value.length) setTimeout(() => (snap.value = []), 90);
  prog = 0;
}
const onCardClick = (e: MouseEvent, i: number) => {
  if (relOf(i) !== 0) {
    e.preventDefault();
    setActive(i);
  }
};

let prog = 0;
let rate = 1;
let last = 0;
let raf = 0;
let running = false;
let io: IntersectionObserver | null = null;

function loop(now: number) {
  if (!running) return;
  const dt = Math.min(now - last, 50);
  last = now;
  rate += ((holding.value ? 0 : 1) - rate) * 0.12; // se frena suave con el mouse encima
  prog += (dt * rate) / STORY_MS;
  if (prog >= 1) setActive(active.value + 1);
  deck.value?.style.setProperty('--prog', Math.min(prog, 1).toFixed(4));
  raf = requestAnimationFrame(loop);
}
function start() {
  if (reduced.value || running || document.hidden) return;
  running = true;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}
function stop() {
  running = false;
  cancelAnimationFrame(raf);
}
const onDocumentVisibility = () => {
  if (document.hidden) stop();
  else if (visible.value) start();
};
const onHold = (e: PointerEvent, v: boolean) => {
  if (e.pointerType === 'mouse') holding.value = v;
};

onMounted(() => {
  loadFeed();
  document.addEventListener('visibilitychange', onDocumentVisibility);
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced.value || !('IntersectionObserver' in window)) {
    revealed.value = true;
    visible.value = true;
    if (!reduced.value) start();
    return;
  }
  io = new IntersectionObserver(
    ([e]) => {
      if (!e) return;
      visible.value = e.isIntersecting;
      if (e.isIntersecting) { revealed.value = true; start(); }
      else stop();
    },
    { threshold: 0.2 }
  );
  io.observe(root.value!);
});
onUnmounted(() => {
  io?.disconnect();
  document.removeEventListener('visibilitychange', onDocumentVisibility);
  stop();
});
</script>

<template>
  <section
    id="comunidad"
    ref="root"
    :class="['ig-section', { revealed, paused: !visible, hold: holding, reduced }]"
  >
    <div class="stage">
      <!-- ===== Fondo cinematográfico ===== -->
      <div class="floor" aria-hidden="true"></div>
      <div class="grid" aria-hidden="true"></div>
      <div class="watermark" aria-hidden="true">FACTOR FIT</div>
      <div class="beam beam-a" aria-hidden="true"></div>
      <div class="beam beam-b" aria-hidden="true"></div>
      <svg class="float f1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
      <svg class="float f2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
      <svg class="float f3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
      <svg class="float f4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>

      <div class="content">
        <div class="layout">
          <!-- ===== Texto ===== -->
          <div class="info">
            <p class="eyebrow">
              <span class="ig-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
              </span>
              Síguenos en Instagram
            </p>

            <h2 class="title" :aria-label="TITLE_TEXT">
              <span v-for="(line, li) in TITLE_LINES" :key="li" class="line" aria-hidden="true">
                <span
                  v-for="(w, wi) in line"
                  :key="wi"
                  :class="['word', { hot: li === 1 }]"
                  :style="{ '--w': wordIndex(li, wi) }"
                >{{ w }}</span>
              </span>
            </h2>

            <p class="subtitle">Momentos reales de quienes entrenan con nosotros. Mira las historias y únete a la comunidad.</p>

            <p v-if="failed" class="note" role="status">No pudimos cargar las publicaciones ahora. Míralas directo en Instagram.</p>

            <div class="actions">
              <a class="btn btn-primary" :href="INSTAGRAM_URL" target="_blank" rel="noopener">
                Ver más en Instagram
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
              </a>
              <a v-if="FACEBOOK_URL" class="btn btn-dark" :href="FACEBOOK_URL" target="_blank" rel="noopener">Facebook</a>
              <a class="handle" :href="INSTAGRAM_URL" target="_blank" rel="noopener">@{{ INSTAGRAM_USER }}</a>
            </div>
          </div>

          <!-- ===== Historias ===== -->
          <div
            class="deck-wrap"
            @pointerenter="onHold($event, true)"
            @pointerleave="onHold($event, false)"
          >
            <div class="halo" aria-hidden="true"></div>
            <div ref="deck" class="deck">
              <template v-if="loading">
                <div v-for="k in SLOTS" :key="k" class="story skeleton" :style="cardStyle(k - 1)"></div>
              </template>
              <template v-else>
                <a
                  v-for="(s, i) in slots"
                  :key="s.id"
                  :class="['story', { 'is-active': relOf(i) === 0 }]"
                  :href="s.link"
                  target="_blank"
                  rel="noopener"
                  :style="{ ...cardStyle(i), '--kx': s.kx, '--ky': s.ky, '--dur': `${STORY_MS}ms` }"
                  :aria-label="s.caption || 'Ver publicación en Instagram'"
                  :tabindex="relOf(i) === 0 ? 0 : -1"
                  @click="onCardClick($event, i)"
                >
                  <img
                    :src="s.image"
                    :alt="s.caption || 'Publicación de Factor FIT'"
                    :style="{ objectPosition: s.pos, '--zoom': s.zoom }"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    referrerpolicy="no-referrer"
                  />
                  <span class="shade-top" aria-hidden="true"></span>
                  <span class="shade-bot" aria-hidden="true"></span>

                  <!-- barras de progreso estilo historias -->
                  <span class="bars" aria-hidden="true">
                    <i v-for="j in N" :key="j"><b :class="{ full: j - 1 < i, cur: j - 1 === i }"></b></i>
                  </span>
                  <!-- cabecera -->
                  <span class="who" aria-hidden="true">
                    <span class="avatar"><span>FF</span></span>
                    <span class="name">{{ INSTAGRAM_USER }}</span>
                    <span class="when">Ahora</span>
                  </span>
                  <!-- pie -->
                  <span class="foot">
                    <span class="cap">
                      <span v-for="(w, wi) in words(s.caption || '')" :key="wi" class="cw" :style="{ '--d': `${0.35 + wi * 0.09}s` }">{{ w }}</span>
                    </span>
                    <span class="like" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
                    </span>
                  </span>
                  <!-- corazones que suben -->
                  <svg class="react r1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
                  <svg class="react r2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
                  <svg class="react r3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
                </a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Permanent+Marker&display=swap');

.ig-section {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ice: #f3d3ff;
  --ig: linear-gradient(135deg, #feda75 0%, #fa7e1e 22%, #d62976 50%, #962fbf 76%, #4f5bd5 100%);
  position: relative;
  scroll-margin-top: 84px;
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background: #0a0716;
}

/* ---------- Escenario (mismo fondo que la sección de Facebook) ---------- */
.stage {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: clamp(64px, 8vw, 110px) clamp(18px, 5vw, 64px);
  background:
    radial-gradient(ellipse 70% 55% at 50% 100%, #3a1768 0%, rgba(58, 23, 104, 0) 70%),
    linear-gradient(180deg, #07040f 0%, #120a26 55%, #1d0e3a 100%);
}
.floor {
  position: absolute; z-index: 0; pointer-events: none;
  left: 50%; bottom: -22%; width: 130%; height: 56%;
  translate: -50% 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 106, 213, 0.55) 0%, rgba(178, 92, 255, 0.32) 32%, transparent 68%);
}
.grid {
  position: absolute; z-index: 1; pointer-events: none;
  left: -40%; right: -40%; bottom: -6%; height: 50%;
  background-image:
    linear-gradient(rgba(243, 211, 255, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(243, 211, 255, 0.2) 1px, transparent 1px);
  background-size: 70px 70px;
  transform: perspective(520px) rotateX(64deg);
  transform-origin: 50% 100%;
  animation: grid-run 6s linear infinite;
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 85%);
  mask-image: linear-gradient(to top, #000 0%, transparent 85%);
}
@keyframes grid-run { to { background-position: 0 70px; } }

.watermark {
  position: absolute; z-index: 1; pointer-events: none; white-space: nowrap;
  left: 0; top: 50%;
  font: 400 clamp(10rem, 34vw, 30rem) 'Anton', 'Inter', sans-serif;
  letter-spacing: 0.02em; line-height: 1;
  color: transparent;
  -webkit-text-stroke: 2px rgba(243, 211, 255, 0.08);
  transform: translate3d(-6%, -50%, 0);
  animation: wm-slide 70s linear infinite alternate;
  will-change: transform;
}
@keyframes wm-slide { from { transform: translate3d(-6%, -50%, 0); } to { transform: translate3d(-48%, -50%, 0); } }

.beam {
  position: absolute; z-index: 1; pointer-events: none; top: -20%; width: 34%; height: 140%;
  background: linear-gradient(180deg, rgba(255, 130, 200, 0.18), transparent 70%);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  transform-origin: 50% 0;
  animation: sway 9s ease-in-out infinite alternate;
  will-change: transform;
}
.beam-a { left: 8%; rotate: 18deg; }
.beam-b { right: 6%; rotate: -20deg; animation-delay: -4s; animation-direction: alternate-reverse; }
@keyframes sway { from { transform: rotate(-5deg); opacity: 0.55; } to { transform: rotate(6deg); opacity: 1; } }

.float { position: absolute; z-index: 2; pointer-events: none; opacity: 0; animation: rise 11s ease-in infinite; }
.f1 { left: 6%;  bottom: 4%; width: 24px; height: 24px; color: #ff7ad1; }
.f2 { left: 30%; bottom: 2%; width: 22px; height: 22px; color: #c9a2ff; animation-delay: -3.6s; }
.f3 { right: 22%; bottom: 3%; width: 20px; height: 20px; color: #ffd6f4; animation-delay: -7s; }
.f4 { right: 6%; bottom: 3%; width: 18px; height: 18px; color: #ff9be0; animation-delay: -5s; }
@keyframes rise {
  0%   { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
  12%  { opacity: 0.75; }
  100% { transform: translate3d(28px, -70vh, 0) scale(1.2); opacity: 0; }
}
.paused .grid, .paused .watermark, .paused .beam, .paused .float, .paused .halo,
.paused .react, .paused .btn-primary::before, .paused .ig-badge::after { animation-play-state: paused; }

.content { position: relative; z-index: 3; max-width: 1180px; margin: 0 auto; }
.layout {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
}

/* ---------- Texto ---------- */
.eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  margin: 0 0 clamp(14px, 2vw, 22px);
  font-size: clamp(0.7rem, 1.3vw, 0.82rem); font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase;
  color: #ffd6ec;
  opacity: 0; transform: translate3d(0, 14px, 0);
  transition: opacity 0.6s var(--ease-out), transform 0.7s var(--ease-out);
}
.revealed .eyebrow { opacity: 1; transform: none; }
.ig-badge {
  position: relative; display: grid; place-items: center;
  width: 36px; height: 36px; border-radius: 11px;
  background: var(--ig); color: #fff;
  box-shadow: 0 6px 20px rgba(214, 41, 118, 0.55);
}
.ig-badge svg { width: 20px; height: 20px; }
.ig-badge::after {
  content: ''; position: absolute; inset: 0; border-radius: 11px;
  border: 2px solid rgba(255, 140, 200, 0.75);
  animation: pulse 2.6s ease-out infinite;
}
@keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.9); opacity: 0; } }

.title {
  margin: 0 0 clamp(14px, 2vw, 20px);
  font-family: 'Permanent Marker', 'Inter', cursive;
  font-weight: 400;
  font-size: clamp(2.8rem, 6.4vw, 5.4rem);
  line-height: 1.04;
  letter-spacing: 1px;
  color: var(--ice);
  text-shadow: 0 4px 0 rgba(40, 10, 84, 0.7), 0 14px 44px rgba(20, 8, 44, 0.6);
}
.line { display: block; }
.word {
  display: inline-block;
  margin-right: 0.18em;
  opacity: 0;
  filter: blur(16px);
  transform: translate3d(0, 0.5em, 0) rotate(3deg);
  transition:
    opacity 0.7s var(--ease-out) calc(var(--w) * 0.09s + 0.1s),
    filter 0.9s var(--ease-out) calc(var(--w) * 0.09s + 0.1s),
    transform 0.9s var(--ease-out) calc(var(--w) * 0.09s + 0.1s);
}
.revealed .word { opacity: 1; filter: blur(0); transform: none; }
.word.hot {
  background: linear-gradient(90deg, #ff8ad6, #ffb86b);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  text-shadow: none;
}
.revealed .word.hot { filter: drop-shadow(0 4px 0 rgba(40, 10, 84, 0.7)) drop-shadow(0 12px 30px rgba(20, 8, 44, 0.55)); }

.subtitle, .actions {
  opacity: 0; transform: translate3d(0, 16px, 0);
  transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
}
.revealed .subtitle { opacity: 1; transform: none; transition-delay: 0.85s; }
.revealed .actions { opacity: 1; transform: none; transition-delay: 1.05s; }
.subtitle { margin: 0 0 clamp(22px, 3vw, 30px); max-width: 42ch; font-size: clamp(0.95rem, 1.6vw, 1.1rem); line-height: 1.65; color: rgba(255, 255, 255, 0.86); }
.note { margin: -10px 0 18px; font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); }

.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 56px; padding: 0 32px; border-radius: 999px; text-decoration: none; color: #fff;
  font: 700 1rem 'Inter', sans-serif;
}
.btn:active { transform: scale(0.97); }
.btn-primary {
  background: linear-gradient(135deg, #d62976, #962fbf 60%, #6a3df0);
  box-shadow: 0 14px 34px rgba(190, 40, 160, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
}
.btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.4) 50%, transparent 65%);
  transform: translateX(-120%);
  animation: sweep 3.4s ease-in-out infinite;
}
@keyframes sweep { 0%, 55% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
.btn-primary svg { transition: transform 0.2s var(--ease-out); }
.btn-dark { background: rgba(15, 20, 34, 0.9); border: 1px solid rgba(255, 255, 255, 0.16); transition: transform 0.2s var(--ease-out), background-color 0.2s var(--ease-out); }
.handle {
  color: rgba(255, 255, 255, 0.85); font-weight: 600; font-size: 0.98rem; text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35); padding-bottom: 2px;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.btn:focus-visible, .handle:focus-visible, .story:focus-visible { outline: 2px solid #ffd0ee; outline-offset: 4px; }
@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 20px 44px rgba(190, 40, 160, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.3) inset; }
  .btn-primary:hover svg { transform: translateX(4px); }
  .btn-dark:hover { transform: translateY(-3px); background: #222d47; }
  .handle:hover { color: #fff; border-color: #fff; }
}

/* ---------- Historias ---------- */
.deck-wrap {
  --cw: clamp(190px, 21vw, 280px); /* ancho de la historia en primer plano */
  --step: calc(var(--cw) * 0.92);
  position: relative;
  height: calc(var(--cw) * 1.7778 + 56px);
  display: grid; place-items: center;
  opacity: 0; transform: translate3d(0, 34px, 0);
  transition: opacity 1s 0.35s var(--ease-out), transform 1.1s 0.35s var(--ease-out);
}
.revealed .deck-wrap { opacity: 1; transform: none; }

/* Aro de luz con los colores de Instagram detrás de la historia activa */
.halo {
  position: absolute; left: 50%; top: 50%;
  width: calc(var(--cw) * 1.7); aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5, #feda75);
  filter: blur(70px);
  opacity: 0.42;
  animation: spin 14s linear infinite;
  pointer-events: none;
}
@keyframes spin { to { transform: rotate(360deg); } }

.deck {
  --prog: 0;
  position: absolute; inset: 0;
  perspective: 1500px;
  perspective-origin: 50% 40%;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%);
}
.story {
  position: absolute; left: 50%; top: 50%;
  width: var(--cw); aspect-ratio: 9 / 16;
  border-radius: clamp(20px, 2.4vw, 30px);
  overflow: hidden;
  background: #2a1646;
  color: #fff; text-decoration: none;
  box-shadow: 0 30px 70px rgba(6, 2, 20, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.16);
  transition: transform 0.95s var(--ease-out), opacity 0.7s var(--ease-out), filter 0.7s var(--ease-out);
  will-change: transform, opacity;
  -webkit-tap-highlight-color: transparent;
}
.story.is-active { box-shadow: 0 40px 90px rgba(6, 2, 20, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 70px rgba(214, 41, 118, 0.35); }

.story img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
  transform: scale(calc(var(--zoom, 1) * 1.1));
}
/* Zoom lento tipo cine mientras dura la historia */
.story.is-active img { animation: kb var(--dur, 4800ms) linear forwards; }
@keyframes kb {
  from { transform: scale(calc(var(--zoom, 1) * 1.1)) translate(0, 0); }
  to   { transform: scale(calc(var(--zoom, 1) * 1.3)) translate(var(--kx, 3%), var(--ky, -2%)); }
}
.hold .story.is-active img, .hold .react { animation-play-state: paused; }

.shade-top, .shade-bot { position: absolute; left: 0; right: 0; pointer-events: none; }
.shade-top { top: 0; height: 28%; background: linear-gradient(to bottom, rgba(8, 3, 26, 0.62), transparent); }
.shade-bot { bottom: 0; height: 40%; background: linear-gradient(to top, rgba(8, 3, 26, 0.82), transparent); }

/* Barras de progreso */
.bars { position: absolute; z-index: 4; top: 12px; left: 12px; right: 12px; display: flex; gap: 4px; }
.bars i { flex: 1; height: 3px; border-radius: 3px; background: rgba(255, 255, 255, 0.34); overflow: hidden; }
.bars b { display: block; height: 100%; background: #fff; transform-origin: 0 50%; transform: scaleX(0); }
.bars b.full { transform: scaleX(1); }
.is-active .bars b.cur { transform: scaleX(var(--prog)); }

.who { position: absolute; z-index: 4; top: 26px; left: 12px; right: 12px; display: flex; align-items: center; gap: 8px; font-size: clamp(0.68rem, 1vw, 0.8rem); }
.avatar { width: 30px; height: 30px; padding: 2px; border-radius: 50%; background: var(--ig); display: grid; place-items: center; flex: none; }
.avatar span { width: 100%; height: 100%; border-radius: 50%; background: #1a0f33; display: grid; place-items: center; font-weight: 800; font-size: 0.62rem; letter-spacing: 0.02em; }
.name { font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); }
.when { color: rgba(255, 255, 255, 0.7); font-weight: 500; }

.foot { position: absolute; z-index: 4; left: 12px; right: 12px; bottom: 14px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.cap { font: 800 clamp(1rem, 1.7vw, 1.4rem)/1.15 'Inter', sans-serif; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6); }
.cw { display: inline-block; margin-right: 0.28em; opacity: 0; transform: translateY(10px); filter: blur(6px); }
.is-active .cw { animation: word-in 0.7s var(--ease-out) var(--d) forwards; }
@keyframes word-in { to { opacity: 1; transform: none; filter: blur(0); } }
.like {
  flex: none; width: 36px; height: 36px; border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.like svg { width: 18px; height: 18px; color: #ff4d86; }
.is-active .like { animation: beat 1.6s ease-in-out infinite; }
@keyframes beat { 0%, 100% { transform: scale(1); } 12% { transform: scale(1.18); } 24% { transform: scale(1); } }

/* Corazones que suben solo en la historia activa */
.react { position: absolute; z-index: 5; right: 18px; bottom: 56px; width: 22px; height: 22px; color: #ff5c93; opacity: 0; pointer-events: none; }
.is-active .react { animation: heart-up 2.8s ease-out infinite; }
.r2 { right: 34px; animation-delay: 0.9s !important; color: #ffb86b; width: 18px; height: 18px; }
.r3 { right: 10px; animation-delay: 1.8s !important; color: #ff8ad6; width: 16px; height: 16px; }
@keyframes heart-up {
  0%   { transform: translate3d(0, 0, 0) scale(0.6); opacity: 0; }
  15%  { opacity: 0.95; }
  100% { transform: translate3d(-14px, -150px, 0) scale(1.25); opacity: 0; }
}

.skeleton { background: linear-gradient(100deg, #2a1646 30%, #3c2468 50%, #2a1646 70%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* ---------- Tablet y móvil ---------- */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; gap: 20px; }
  .info { text-align: center; display: flex; flex-direction: column; align-items: center; }
  .subtitle { margin-inline: auto; }
  .actions { justify-content: center; }
  .deck-wrap { --cw: clamp(190px, 46vw, 270px); --step: calc(var(--cw) * 0.86); }
}
@media (max-width: 560px) {
  .deck-wrap { --cw: 58vw; --step: 50vw; }
  .btn { width: 100%; }
  .actions { width: 100%; }
  .grid { background-size: 48px 48px; }
  .beam { display: none; }
}

/* ---------- Movimiento reducido: una historia estática, sin animaciones ---------- */
.reduced .eyebrow, .reduced .word, .reduced .subtitle, .reduced .actions, .reduced .deck-wrap { opacity: 1; filter: none; transform: none; transition: none; }
.reduced .cw { opacity: 1; transform: none; filter: none; }
.reduced .watermark, .reduced .beam, .reduced .float, .reduced .halo { display: none; }
.reduced *, .reduced *::before, .reduced *::after { animation: none !important; }
</style>