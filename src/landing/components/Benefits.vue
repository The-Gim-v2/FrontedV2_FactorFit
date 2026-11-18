<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Misma foto que usa el hero y el login
const photo = 'https://i.ibb.co/272HW3wN/fondo-landing.jpg';

const PILLARS = [
  { icon: 'move', title: 'Movimiento', text: 'El poder de transformar tu vida.' },
  { icon: 'people', title: 'Comunidad', text: 'Aquí entrenas, creces y te inspiras.' },
  { icon: 'heart', title: 'Bienestar', text: 'Física y mentalmente, es nuestra prioridad.' },
];

/* Título dividido por letras (cada una entra con su propio retraso) */
let ci = 0;
const titleWords = ['Sobre', 'nosotros'].map((text) => ({
  text,
  chars: text.split('').map((c) => ({ c, i: ci++ })),
}));

const el = ref<HTMLElement | null>(null);
const revealed = ref(false); // ya entró en pantalla alguna vez
const inview = ref(false); // está en pantalla ahora (las animaciones infinitas solo corren así)
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window) || !el.value) {
    revealed.value = true;
    inview.value = true;
    return;
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      inview.value = !!entry?.isIntersecting;
      if (entry?.isIntersecting) revealed.value = true;
    },
    { threshold: 0.12 }
  );
  observer.observe(el.value);
});
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <section id="sobre-nosotros" ref="el" :class="['about', { revealed, inview }]">
    <!-- Fondo cinematográfico (igual que Facebook e Instagram) -->
    <div class="floor" aria-hidden="true"></div>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="watermark" aria-hidden="true">FACTOR FIT</div>
    <div class="beam beam-a" aria-hidden="true"></div>
    <div class="beam beam-b" aria-hidden="true"></div>
    <svg class="float f1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
    <svg class="float f2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z"/></svg>
    <svg class="float f3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="float f4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>

    <div class="container">
      <div class="grid">
        <!-- Texto -->
        <div class="col-text">
          <h2 class="title" aria-label="Sobre nosotros">
            <span
              v-for="w in titleWords"
              :key="w.text"
              :class="['word', { last: w.text === 'nosotros' }]"
              aria-hidden="true"
            >
              <span v-for="ch in w.chars" :key="ch.i" class="ch" :style="{ '--i': ch.i }">{{ ch.c }}</span>
              <template v-if="w.text === 'nosotros'">
                <svg class="squiggle" viewBox="0 0 200 14" preserveAspectRatio="none">
                  <path pathLength="1" d="M2 8 C 28 1, 52 14, 82 7 S 140 1, 198 8" />
                </svg>
                <span class="dots"><i></i><i></i><i></i></span>
              </template>
            </span>
          </h2>

          <div class="text-card">
            <p>
              En Factor FIT creemos que cada persona tiene el poder de
              <mark>transformar su vida a través del movimiento</mark>. No solo somos un gimnasio, somos una
              <mark>comunidad</mark> dedicada a ayudarte a alcanzar tu mejor versión, tanto física como mentalmente.
            </p>
            <p>
              Aquí no solo entrenas, creces, te inspiras y te conviertes en la
              <mark>mejor versión de ti mismo</mark>. En Factor FIT tu bienestar es nuestra prioridad.
            </p>
          </div>
        </div>

        <!-- Visual -->
        <div class="col-visual">
          <div class="visual">
            <span class="ripple r1"></span>
            <span class="ripple r2"></span>

            <div class="ring ring-dashed"></div>
            <div class="orbit"><i></i></div>
            <div class="ring ring-solid"></div>

            <div class="photo-circle">
              <img :src="photo" alt="Comunidad Factor FIT entrenando" loading="lazy" decoding="async" />
              <div class="photo-shade"></div>
            </div>

            <svg class="spark sp1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/></svg>
            <svg class="spark sp2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/></svg>
            <svg class="spark sp3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/></svg>

            <div class="chip chip-a" style="--cd: 1s">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4 5"/></svg>
              Comunidad
            </div>
            <div class="chip chip-b" style="--cd: 1.15s">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.4-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.6-7.5 10-7.5 10Z"/></svg>
              Tu bienestar
            </div>
            <div class="chip chip-c" style="--cd: 1.3s">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/></svg>
              Mejor versión
            </div>
          </div>
        </div>
      </div>

      <!-- Pilares: fila completa debajo -->
      <ul class="pillars">
        <li v-for="(p, i) in PILLARS" :key="p.title" :style="{ '--rd': `${0.55 + i * 0.12}s` }">
          <span class="pillar-icon">
            <svg v-if="p.icon === 'move'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>
            <svg v-else-if="p.icon === 'people'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4 5"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.4-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.6-7.5 10-7.5 10Z"/></svg>
          </span>
          <span class="pillar-text">
            <strong>{{ p.title }}</strong>
            <small>{{ p.text }}</small>
          </span>
          <span class="pillar-num">0{{ i + 1 }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&display=swap');

.about {
  --purple: #a020ff;
  --ease: cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  scroll-margin-top: 84px;
  padding: clamp(70px, 10vw, 120px) clamp(18px, 5vw, 64px);
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  /* Mismo fondo que las secciones de Facebook e Instagram */
  background:
    radial-gradient(ellipse 70% 55% at 50% 100%, #3a1768 0%, rgba(58, 23, 104, 0) 70%),
    linear-gradient(180deg, #07040f 0%, #120a26 55%, #1d0e3a 100%);
}

/* Rendimiento: fuera de pantalla se pausan todas las animaciones */
.about:not(.inview) *,
.about:not(.inview) *::before,
.about:not(.inview) *::after {
  animation-play-state: paused !important;
}

/* ---------- Fondo cinematográfico ---------- */
.floor {
  position: absolute; z-index: -2; pointer-events: none;
  left: 50%; bottom: -22%; width: 130%; height: 56%;
  translate: -50% 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(255, 106, 213, 0.55) 0%, rgba(178, 92, 255, 0.32) 32%, transparent 68%);
}
.grid-bg {
  position: absolute; z-index: -2; pointer-events: none;
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
  position: absolute; z-index: -1; pointer-events: none; white-space: nowrap;
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

/* Haces de luz */
.beam {
  position: absolute; z-index: -1; pointer-events: none; top: -20%; width: 34%; height: 140%;
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
.float { position: absolute; z-index: -1; pointer-events: none; opacity: 0; animation: rise 11s ease-in infinite; }
.f1 { left: 6%;  bottom: 4%; width: 24px; height: 24px; color: #ff7ad1; }
.f2 { left: 30%; bottom: 2%; width: 20px; height: 20px; color: #ffd6f4; animation-delay: -3.6s; }
.f3 { right: 22%; bottom: 3%; width: 18px; height: 18px; color: #f3d3ff; animation-delay: -7s; }
.f4 { right: 6%; bottom: 3%; width: 20px; height: 20px; color: #ff9be0; animation-delay: -5s; }
@keyframes rise {
  0%   { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
  12%  { opacity: 0.75; }
  100% { transform: translate3d(28px, -70vh, 0) scale(1.2); opacity: 0; }
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bob { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -8px, 0); } }
@keyframes ripple {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.45); opacity: 0; }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.55) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(45deg); }
}
@keyframes shine { to { transform: translateX(130%); } }
@keyframes dotJump { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-0.3em); } }

.container { max-width: 1180px; margin: 0 auto; position: relative; }

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  gap: clamp(36px, 6vw, 88px);
  align-items: center;
}

/* ---------- Texto ---------- */
.col-text {
  opacity: 0;
  transform: translate3d(-24px, 0, 0);
  transition: opacity 0.8s var(--ease), transform 0.9s var(--ease);
}
.revealed .col-text { opacity: 1; transform: none; }

.title {
  margin: 0 0 clamp(22px, 3vw, 32px);
  font-family: 'Permanent Marker', 'Inter', cursive;
  font-weight: 400;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1.12;
  letter-spacing: 1.5px;
  color: #fff;
  text-shadow: 0 3px 0 rgba(40, 10, 84, 0.7), 0 8px 30px rgba(20, 8, 44, 0.6);
}
/* El espacio entre palabras viene del margen */
.word { display: inline-block; position: relative; white-space: nowrap; margin-right: 0.28em; }
.word.last { margin-right: 0; }

/* Cada letra sube con un pequeño giro (solo transform y opacity) */
.ch {
  display: inline-block;
  opacity: 0;
  transform: translate3d(0, 0.5em, 0) rotate(7deg);
  transition: opacity 0.55s var(--ease), transform 0.8s var(--ease);
  transition-delay: calc(var(--i) * 45ms + 150ms);
}
.revealed .ch { opacity: 1; transform: none; }

/* Línea ondulada que se dibuja sola bajo "nosotros" */
.squiggle {
  position: absolute;
  left: 0;
  right: 0.95em;
  bottom: -0.12em;
  width: auto;
  height: 0.2em;
  overflow: visible;
  pointer-events: none;
}
.squiggle path {
  fill: none;
  stroke: #f7c6ff;
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.1s 1.1s var(--ease);
}
.revealed .squiggle path { stroke-dashoffset: 0; }

/* Puntos suspensivos */
.dots {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.13em;
  margin-left: 0.14em;
  vertical-align: baseline;
  opacity: 0;
  transition: opacity 0.5s 0.9s ease;
}
.revealed .dots { opacity: 1; }
.dots i {
  display: block;
  width: 0.14em;
  height: 0.14em;
  min-width: 7px;
  min-height: 7px;
  border-radius: 50%;
  background: #f7c6ff;
  box-shadow: 0 0 10px rgba(247, 198, 255, 0.8);
  animation: dotJump 1.4s ease-in-out infinite;
}
.dots i:nth-child(2) { animation-delay: 0.18s; }
.dots i:nth-child(3) { animation-delay: 0.36s; }

.text-card {
  position: relative;
  overflow: hidden;
  padding: clamp(22px, 3vw, 34px) clamp(20px, 3vw, 36px);
  border-radius: 24px;
  /* Fondo casi sólido: se ve igual de bien y no obliga a desenfocar lo de atrás */
  background: linear-gradient(150deg, rgba(40, 14, 80, 0.9), rgba(24, 10, 54, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 24px 60px rgba(15, 6, 36, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
/* Barra lateral que crece de arriba hacia abajo */
.text-card::before {
  content: '';
  position: absolute;
  left: 0; top: 24px; bottom: 24px;
  width: 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, #ffd0ff, var(--purple));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 1s 0.6s var(--ease);
}
.revealed .text-card::before { transform: scaleY(1); }
/* Destello de luz que cruza la tarjeta una sola vez */
.text-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.14) 50%, transparent 62%);
  transform: translateX(-130%);
}
.revealed .text-card::after { animation: shine 1.6s 0.9s var(--ease) 1 both; }

.text-card p {
  margin: 0 0 16px;
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  line-height: 1.72;
  font-weight: 500;
  color: #fff;
}
.text-card p:last-child { margin-bottom: 0; }

/* Subrayado que se dibuja de izquierda a derecha */
.text-card mark {
  color: #fff;
  font-weight: 700;
  padding: 0 3px;
  background: linear-gradient(rgba(206, 110, 255, 0.6), rgba(206, 110, 255, 0.6)) 0 100% / 0% 38% no-repeat;
  transition: background-size 0.9s 1s var(--ease);
}
.revealed .text-card mark { background-size: 100% 38%; }
.revealed .text-card mark:nth-of-type(2) { transition-delay: 1.25s; }
.revealed .text-card p:last-child mark { transition-delay: 1.5s; }

/* ---------- Visual ---------- */
.col-visual {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: scale(0.94);
  transition: opacity 0.9s 0.15s var(--ease), transform 1.1s 0.15s var(--ease);
}
.revealed .col-visual { opacity: 1; transform: none; }

.visual {
  position: relative;
  width: min(100%, 480px);
  aspect-ratio: 1;
}

.ripple {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  border: 2px solid rgba(240, 180, 255, 0.5);
  pointer-events: none;
  opacity: 0;
}
.revealed .ripple { animation: ripple 4.6s 1.2s ease-out infinite; }
.revealed .r2 { animation-delay: 3.5s; }

.ring { position: absolute; border-radius: 50%; }
.ring-dashed {
  inset: 0;
  border: 2px dashed rgba(255, 255, 255, 0.35);
  animation: spin 40s linear infinite;
}
/* Puntito brillante que recorre el anillo */
.orbit {
  position: absolute;
  inset: 0;
  animation: spin 14s linear infinite;
  pointer-events: none;
}
.orbit i {
  position: absolute;
  top: -5px;
  left: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 12px 3px rgba(240, 170, 255, 0.85);
}
.ring-solid {
  inset: 5.5%;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 70px rgba(210, 110, 255, 0.4);
}
.photo-circle {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 26px 60px rgba(10, 4, 28, 0.5);
  background: #2a1646;
}
.photo-circle img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  /* Empieza con zoom y se asienta al entrar (una sola vez) */
  transform: scale(1.25);
  transition: transform 1.8s var(--ease);
}
.revealed .photo-circle img { transform: scale(1.06); }
.photo-shade {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(160, 32, 255, 0.28), rgba(10, 6, 30, 0.2) 55%, rgba(10, 6, 30, 0.45));
}

/* Estrellitas */
.spark { position: absolute; color: #f7c6ff; pointer-events: none; opacity: 0; }
.revealed .spark { animation: twinkle 3.2s ease-in-out infinite; }
.sp1 { width: 18px; height: 18px; top: 4%; left: 14%; animation-delay: 1.4s; }
.sp2 { width: 12px; height: 12px; top: 32%; right: -1%; animation-delay: 2.2s; }
.sp3 { width: 16px; height: 16px; bottom: 6%; left: 30%; animation-delay: 2.8s; }

.chip {
  position: absolute;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px 10px 12px;
  border-radius: 999px;
  font-size: clamp(0.78rem, 1.6vw, 0.9rem);
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
  background: rgba(24, 10, 52, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
  animation: bob 5s ease-in-out infinite;
  /* Entrada con "translate" para no chocar con la animación de flotar */
  opacity: 0;
  translate: 0 14px;
  transition: opacity 0.6s var(--ease), translate 0.9s var(--ease);
  transition-delay: var(--cd, 1s);
}
.revealed .chip { opacity: 1; translate: 0 0; }
.chip svg { width: 18px; height: 18px; color: #e9b3ff; }
.chip-a { top: 9%; right: -3%; }
.chip-b { bottom: 14%; left: -5%; animation-delay: -1.6s; }
.chip-c { bottom: -1%; right: 10%; animation-delay: -3.2s; }

/* ---------- Pilares: fila completa ---------- */
.pillars {
  list-style: none;
  margin: clamp(40px, 5.5vw, 68px) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(12px, 1.8vw, 20px);
}
.pillars li {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 20px;
  background: rgba(20, 9, 44, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.16);
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  transition:
    opacity 0.7s var(--ease), transform 0.8s var(--ease),
    border-color 0.25s ease, background 0.25s ease;
  /* El retraso solo aplica a la entrada, no al pasar el cursor */
  transition-delay: var(--rd, 0s), var(--rd, 0s), 0s, 0s;
}
.revealed .pillars li { opacity: 1; transform: none; }
.revealed .pillars li:hover {
  transform: translate3d(0, -5px, 0);
  border-color: rgba(240, 180, 255, 0.65);
  background: rgba(60, 20, 104, 0.82);
  transition-delay: 0s;
}
.revealed .pillars li:active { transform: scale(0.98); transition-delay: 0s; }
.pillar-icon {
  flex: 0 0 50px;
  width: 50px; height: 50px;
  display: grid; place-items: center;
  border-radius: 15px;
  color: #f1c4ff;
  background: rgba(160, 32, 255, 0.3);
  border: 1px solid rgba(220, 150, 255, 0.45);
  transition: transform 0.5s var(--ease);
}
.pillars li:hover .pillar-icon { transform: scale(1.08) rotate(-8deg); }
.pillar-icon svg { width: 24px; height: 24px; }
.pillar-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; padding-right: 26px; }
.pillar-text strong { font-size: 1.05rem; font-weight: 700; }
.pillar-text small { font-size: 0.86rem; line-height: 1.4; color: rgba(255, 255, 255, 0.72); }
.pillar-num {
  position: absolute;
  top: 12px; right: 16px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: rgba(241, 196, 255, 0.45);
}

/* ---------- Responsive ---------- */
@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; gap: 40px; }
  .col-visual { order: -1; }
  .col-text { text-align: center; }
  .title { text-align: center; }
  .text-card { text-align: left; }
  .visual { width: min(78vw, 400px); }
  .chip-a { right: -2%; }
  .chip-b { left: -2%; }
  .sp2 { right: 2%; }
}
@media (max-width: 760px) {
  .pillars { grid-template-columns: 1fr; margin-top: 32px; }
  .pillars li { padding: 16px 18px; }
  .pillar-icon { flex-basis: 46px; width: 46px; height: 46px; }
}
@media (max-width: 640px) {
  .text-card::before { display: none; }
  .chip { padding: 8px 13px 8px 10px; }
  .chip svg { width: 16px; height: 16px; }
  .grid-bg { background-size: 48px 48px; }
  .beam { display: none; }
}
@media (max-width: 380px) {
  .chip-c { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .col-text, .col-visual, .pillars li, .ch, .dots, .chip { opacity: 1 !important; transform: none !important; translate: none !important; }
  .squiggle path { stroke-dashoffset: 0 !important; }
  .text-card::before { transform: none !important; }
  .text-card mark { background-size: 100% 38% !important; }
  .ripple, .spark, .watermark, .beam, .float { display: none; }
}
</style>