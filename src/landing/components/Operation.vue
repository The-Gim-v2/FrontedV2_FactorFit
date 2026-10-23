<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useReveal } from '../useReveal';
import { ChevronLeft, ChevronRight, MapPin, Clock, Heart, Pause, Play } from 'lucide-vue-next';

/* ─────────────────────────────────────────────────────────────
   Tus eventos. Para usar fotos o flyers, impórtalos y ponlos en `img`:
     import sanValentin from '../../assets/Events/san-valentin.webp';
     { ..., img: sanValentin }
   Funciona con fotos horizontales y con flyers verticales: la imagen
   siempre se ve completa, sin recortes.
   ───────────────────────────────────────────────────────────── */
interface EventItem {
  title: string;
  desc: string;
  branch: string;
  day: string;
  month: string;
  time?: string;
  img?: string;
}

const events: EventItem[] = [
  {
    title: 'San Valentín 2026 💖',
    desc: 'Festejando el día del amor y la amistad. Reforzamos lazos y disfrutamos de un lindo día de convivencia en el parque. Gracias por su participación, a las entrenadoras de Factor FIT y, por supuesto, a nuestro invitado especial Osiel.',
    branch: 'Sucursal Obrera',
    day: '14', month: 'FEB',
  },
  /* EJEMPLOS: cámbialos o bórralos */
  {
    title: 'Clase especial de San Valentín',
    desc: 'Una clase pensada para celebrar entrenando juntas, con música, retos en pareja y sorpresas para las asistentes.',
    branch: 'Sucursal Obrera',
    day: '14', month: 'FEB', time: '8:00 AM',
  },
  {
    title: 'Día de la Mujer',
    desc: 'Una mañana de entrenamiento, convivencia y reconocimientos para todas las mujeres de la comunidad.',
    branch: 'Sucursal Centro',
    day: '08', month: 'MAR', time: '9:00 AM',
  },
  {
    title: 'Reto 30 días',
    desc: 'Suma rachas, registra tu progreso en la app y celebra con nosotras al terminar el mes.',
    branch: 'App Factor Fit',
    day: '01', month: 'ABR',
  },
];

/* ---------- Estado ---------- */
const { el, revealed } = useReveal();
const total = events.length;
const active = ref(0);
const hovering = ref(false);
const inView = ref(true);
const userPaused = ref(false);

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const autoplayOn = computed(() => !reduceMotion && !userPaused.value && total > 1);

/* ---------- Navegación ---------- */
const wrap = (n: number) => ((n % total) + total) % total;
const goTo = (i: number) => { active.value = wrap(i); };
const next = () => goTo(active.value + 1);
const prev = () => goTo(active.value - 1);

/* Distancia circular de cada tarjeta respecto a la activa (-2, -1, 0, 1, 2…) */
const offsetOf = (i: number) => {
  let d = i - active.value;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
};

const cardStyle = (i: number) => {
  const d = offsetOf(i);
  const a = Math.abs(d);
  const opacity = a === 0 ? 1 : a === 1 ? 0.6 : a === 2 ? 0.25 : 0;
  return {
    transform: `translate3d(calc(${d} * var(--step)), 0, 0) scale(${1 - a * 0.13}) rotate(${d * 2.5}deg)`,
    opacity,
    zIndex: 10 - a,
    pointerEvents: a > 2 ? 'none' : 'auto',
  } as Record<string, string | number>;
};

/* Swipe con dedo o mouse */
let startX = 0;
let dragged = false;
const onDown = (e: PointerEvent) => { startX = e.clientX; dragged = false; };
const onUp = (e: PointerEvent) => {
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 8) dragged = true;
  if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
};
const onCardClick = (i: number) => { if (!dragged && i !== active.value) goTo(i); };

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
};

/* El avance automático lo marca la barra de progreso del punto activo:
   cuando termina su animación (6 s) pasa al siguiente evento. */
const onProgressEnd = () => { if (autoplayOn.value) next(); };

/* Pausa cuando la sección no está a la vista */
let io: IntersectionObserver | null = null;
onMounted(() => {
  const node = el.value as unknown as HTMLElement | null;
  if (node && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(([entry]) => { inView.value = entry.isIntersecting; }, { threshold: 0.2 });
    io.observe(node);
  }
});
onUnmounted(() => io?.disconnect());
</script>

<template>
  <section id="eventos" ref="el" class="events" :class="{ revealed }">
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>

    <div class="container">
      <header class="head">
        <h2 class="title">Eventos</h2>
        <p class="lead">Entrenamos, convivimos y celebramos juntas.</p>
      </header>

      <div
        class="carousel"
        :class="{ hold: hovering || !inView }"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Eventos de Factor Fit"
        tabindex="0"
        @keydown="onKey"
        @pointerenter="hovering = true"
        @pointerleave="hovering = false"
        @focusin="hovering = true"
        @focusout="hovering = false"
      >
        <div class="stage" @pointerdown="onDown" @pointerup="onUp" @pointercancel="dragged = true">
          <article
            v-for="(ev, i) in events"
            :key="i"
            class="card"
            :class="{ current: i === active, far: Math.abs(offsetOf(i)) === 2 }"
            :style="cardStyle(i)"
            :aria-hidden="i !== active"
            :aria-label="`${i + 1} de ${total}: ${ev.title}`"
            @click="onCardClick(i)"
          >
            <div class="media">
              <template v-if="ev.img">
                <img class="media-bg" :src="ev.img" alt="" aria-hidden="true" draggable="false" />
                <img class="media-fg" :src="ev.img" :alt="ev.title" loading="lazy" draggable="false" />
              </template>
              <div v-else class="media-empty"><Heart :size="46" /></div>

              <div class="date">
                <strong>{{ ev.day }}</strong>
                <span>{{ ev.month }}</span>
              </div>
            </div>

            <div class="body">
              <h3>{{ ev.title }}</h3>
              <p>{{ ev.desc }}</p>
              <div class="meta">
                <span class="branch"><MapPin :size="14" /> {{ ev.branch }}</span>
                <span v-if="ev.time" class="time"><Clock :size="14" /> {{ ev.time }}</span>
              </div>
            </div>
          </article>
        </div>

        <div class="controls">
          <button class="round" type="button" aria-label="Evento anterior" @click="prev">
            <ChevronLeft :size="20" />
          </button>

          <div class="dots" role="tablist" aria-label="Elegir evento">
            <button
              v-for="(_, d) in events"
              :key="d"
              type="button"
              role="tab"
              class="dot"
              :aria-selected="active === d"
              :aria-label="`Ir al evento ${d + 1}`"
              @click="goTo(d)"
            >
              <span
                class="dot-bar"
                :class="{ active: active === d, running: active === d && autoplayOn }"
                @animationend="onProgressEnd"
              ></span>
            </button>
          </div>

          <button class="round" type="button" aria-label="Evento siguiente" @click="next">
            <ChevronRight :size="20" />
          </button>

          <button
            v-if="!reduceMotion && total > 1"
            class="round ghost"
            type="button"
            :aria-label="userPaused ? 'Reanudar avance automático' : 'Pausar avance automático'"
            @click="userPaused = !userPaused"
          >
            <Play v-if="userPaused" :size="16" />
            <Pause v-else :size="16" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.events {
  --plum: #1d0a33;
  --violet: #6d2a9c;
  --orchid: #c26bf2;
  --pink: #f472b6;
  --blush: #fff6fb;
  --ink: #2a1245;
  --step: 74%;
  position: relative;
  overflow: hidden;
  padding: clamp(64px, 8vw, 120px) 16px clamp(56px, 7vw, 100px);
  background: linear-gradient(160deg, #2a0f4d 0%, var(--violet) 48%, #b84fd6 100%);
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  opacity: 0;
  transform: translateY(25px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.events.revealed { opacity: 1; transform: translateY(0); }

.blob { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
.blob-a { width: 520px; height: 520px; left: -140px; top: 18%; background: rgba(244, 114, 182, 0.35); }
.blob-b { width: 460px; height: 460px; right: -120px; bottom: -80px; background: rgba(168, 85, 247, 0.4); }

.container { position: relative; z-index: 2; max-width: 1300px; margin: 0 auto; }

/* ---------- Encabezado ---------- */
.head { text-align: center; margin-bottom: clamp(28px, 5vw, 56px); }
.title {
  /* Pon aquí la misma fuente script que ya usas en tu sitio */
  font-family: var(--font-script, 'Sedgwick Ave Display', 'Caveat Brush', cursive);
  font-weight: 400;
  font-size: clamp(3.4rem, 9vw, 6.4rem);
  line-height: 1;
  margin: 0;
  color: #fbe4ff;
  text-shadow: 0 6px 30px rgba(244, 114, 182, 0.55);
  transform: rotate(-2deg);
}
.lead { margin: 14px 0 0; font-size: clamp(0.95rem, 2vw, 1.1rem); color: rgba(255, 240, 250, 0.82); }

/* ---------- Escenario ---------- */
.carousel { outline: none; }
.carousel:focus-visible .stage { outline: 2px dashed rgba(255, 255, 255, 0.6); outline-offset: 8px; border-radius: 24px; }

.stage {
  display: grid;
  justify-items: center;
  align-items: start;
  padding: 6px 0 30px;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}
.stage:active { cursor: grabbing; }

.card {
  grid-area: 1 / 1;
  width: clamp(280px, 28vw, 360px);
  background: var(--blush);
  color: var(--ink);
  border-radius: 28px;
  padding: 10px 10px 22px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 50px rgba(20, 4, 40, 0.35);
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, box-shadow 0.5s ease;
  will-change: transform, opacity;
}
.card.current {
  box-shadow: 0 34px 70px rgba(20, 4, 40, 0.5), 0 0 0 6px rgba(255, 255, 255, 0.14);
}
.card:not(.current) { cursor: pointer; }

/* Imagen: siempre completa, con su propio desenfoque de fondo */
.media {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  background: #2a0f4d;
}
.media-bg {
  position: absolute;
  inset: -12%;
  width: 124%;
  height: 124%;
  object-fit: cover;
  filter: blur(22px) saturate(1.2) brightness(0.85);
}
.media-fg { position: relative; width: 100%; height: 100%; object-fit: contain; display: block; }
.media-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  background: linear-gradient(135deg, #8b3fc4, #f472b6);
}

.date {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  min-width: 52px;
  padding: 8px 10px 7px;
  border-radius: 14px;
  background: var(--blush);
  color: var(--ink);
  box-shadow: 0 8px 20px rgba(20, 4, 40, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.date strong { font-size: 1.45rem; font-weight: 800; color: #b3258f; }
.date span { margin-top: 4px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; color: var(--ink); }

/* Texto */
.body { padding: 18px 12px 0; text-align: center; display: flex; flex-direction: column; gap: 10px; }
.body h3 {
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.25rem, 2.2vw, 1.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: #24103d;
}
.body p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: rgba(42, 18, 69, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(0.9rem * 1.55 * 4);
}
.meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 4px; }
.branch, .time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}
.branch { background: linear-gradient(135deg, #f9a8d4, #d78bf5); color: #3b0f5c; }
.time { background: rgba(109, 42, 156, 0.1); color: #5b1f86; }

/* ---------- Controles ---------- */
.controls { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }

.round {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: background 0.25s ease, transform 0.2s ease, color 0.25s ease;
}
.round:hover { background: #fff; color: var(--violet); }
.round:active { transform: scale(0.93); }
.round:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.round.ghost { width: 36px; height: 36px; background: transparent; border-color: rgba(255, 255, 255, 0.25); }

.dots { display: flex; align-items: center; }
.dot { background: none; border: none; padding: 14px 4px; cursor: pointer; }
.dot:focus-visible { outline: 2px solid #fff; outline-offset: 0; border-radius: 8px; }
.dot-bar {
  position: relative;
  display: block;
  width: 9px;
  height: 9px;
  border-radius: 9px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.dot-bar.active { width: 42px; }
.dot-bar.active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffd1ea, #fff);
  transform-origin: left center;
}
.dot-bar.running::after { transform: scaleX(0); animation: fill 6s linear forwards; }
.carousel.hold .dot-bar.running::after { animation-play-state: paused; }
@keyframes fill { to { transform: scaleX(1); } }

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .events { --step: 66%; }
  .card { width: min(76vw, 340px); }
}
@media (max-width: 600px) {
  .events { --step: 60%; }
  .card.far { opacity: 0 !important; }
  .blob-a, .blob-b { filter: blur(60px); }
}
@media (prefers-reduced-motion: reduce) {
  .card, .dot-bar { transition: none; }
  .title { transform: none; }
}
</style>