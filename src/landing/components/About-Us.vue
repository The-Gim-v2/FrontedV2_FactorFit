<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Misma foto de fondo que usa la pantalla de login
const heroBg = 'https://i.ibb.co/272HW3wN/fondo-landing.jpg';

const highlights = [
  { icon: 'cal', title: 'Clases grupales', text: 'Reserva tu lugar en segundos' },
  { icon: 'bolt', title: 'Entrenadores', text: 'Acompañamiento real' },
  { icon: 'chart', title: 'Tu progreso', text: 'Todo en un solo lugar' },
];

const factor = 'FACTOR'.split('');
const fit = 'FIT'.split('');

/* La luz y el título reaccionan al cursor (solo con mouse y sin "reducir movimiento") */
const hero = ref<HTMLElement | null>(null);
let raf = 0;
let tx = 50;
let ty = 40;
let bounds: DOMRect | null = null;
const refreshBounds = () => { bounds = hero.value?.getBoundingClientRect() ?? null; };

function onMove(e: PointerEvent) {
  const el = hero.value;
  if (!el) return;
  const r = bounds ?? el.getBoundingClientRect();
  tx = ((e.clientX - r.left) / r.width) * 100;
  ty = ((e.clientY - r.top) / r.height) * 100;
  if (!raf) {
    raf = requestAnimationFrame(() => {
      raf = 0;
      el.style.setProperty('--mx', tx.toFixed(1) + '%');
      el.style.setProperty('--my', ty.toFixed(1) + '%');
    });
  }
}

onMounted(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !calm) {
    hero.value?.addEventListener('pointerenter', refreshBounds);
    hero.value?.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', refreshBounds, { passive: true });
  }
});
onBeforeUnmount(() => {
  hero.value?.removeEventListener('pointerenter', refreshBounds);
  hero.value?.removeEventListener('pointermove', onMove);
  window.removeEventListener('resize', refreshBounds);
  if (raf) cancelAnimationFrame(raf);
});
</script>

<template>
  <section ref="hero" class="hero" id="inicio">
    <!-- Fondo -->
    <div class="bg" :style="{ backgroundImage: `url(${heroBg})` }"></div>
    <div class="bg-tint"></div>
    <div class="spot"></div>
    <div class="bg-vignette"></div>
    <div class="grain"></div>

    <div class="stage">
      <!-- Marca -->
      <h1 class="brand" aria-label="Factor Fit">
        <span class="word word-factor" aria-hidden="true">
          <span v-for="(c, i) in factor" :key="'f' + i" class="ch" :style="{ '--i': i }"><span>{{ c }}</span></span>
        </span>
        <span class="word word-fit" aria-hidden="true">
          <span v-for="(c, i) in fit" :key="'t' + i" class="ch" :style="{ '--i': i }"><span>{{ c }}</span></span>
        </span>
      </h1>

      <div class="lower">
        <div class="pitch">
          <p class="tagline">
            <span>Entrena con propósito.</span>
            <span>Supera tu mejor versión.</span>
          </p>

          <div class="cta">
            <p class="cta-q">
              <strong>¿Ya te inscribiste?</strong>
              <span>Entra a tu cuenta o empieza hoy tu cambio.</span>
            </p>
            <div class="cta-actions">
              <button class="btn btn-primary" @click="router.push('/login')">
                <span>Inicia sesión</span>
                <i class="go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </i>
              </button>
              <button class="btn btn-ghost" @click="router.push('/Record')">Registrarte</button>
            </div>
          </div>
        </div>

        <ul class="highlights">
          <li v-for="h in highlights" :key="h.title">
            <span class="hl-icon">
              <svg v-if="h.icon === 'cal'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>
              <svg v-else-if="h.icon === 'bolt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l5.5-5.5 3.5 3.5L20 7.5"/><path d="M14.5 7.5H20V13"/></svg>
            </span>
            <span class="hl-text"><strong>{{ h.title }}</strong><small>{{ h.text }}</small></span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tipografía: Anton para la marca, Inter para el texto. */
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');

.hero {
  --purple: #a020ff;
  --violet-hi: #d3a0ff;
  --ink: #07050d;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  /* Altura del header del sitio que queda encima (ajústala si cambia) */
  --host-header: 84px;
  /* Crece con el ancho, pero nunca tanto como para empujar el botón fuera de pantalla */
  --brand-size: min(26.5vw, 52svh, 22rem);
  --mx: 62%;
  --my: 38%;

  box-sizing: border-box;
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  background: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  isolation: isolate;
  padding: calc(var(--host-header) + 24px) clamp(16px, 4vw, 56px) clamp(28px, 4.5vw, 56px);
}

/* ---------- Fondo ---------- */
.bg {
  position: absolute; inset: -3%;
  background-size: cover; background-position: center;
  filter: grayscale(0.4) contrast(1.15) brightness(0.5) saturate(1.2);
  z-index: -5;
  animation: push 30s ease-in-out infinite alternate;
}
.bg-tint {
  position: absolute; inset: 0; z-index: -4;
  background: linear-gradient(160deg, rgba(110, 20, 200, 0.5) 0%, rgba(14, 6, 30, 0.2) 50%, rgba(7, 5, 13, 0.7) 100%);
  mix-blend-mode: multiply;
}
/* Foco de luz que sigue al cursor */
.spot {
  position: absolute; inset: 0; z-index: -3; pointer-events: none;
  background: radial-gradient(520px circle at var(--mx) var(--my), rgba(190, 110, 255, 0.36), rgba(160, 32, 255, 0.1) 45%, transparent 72%);
  mix-blend-mode: screen;
  animation: lamp 1.6s 0.2s var(--ease) both;
}
.bg-vignette {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background:
    /* zona del texto, abajo a la izquierda, más oscura para que se lea */
    radial-gradient(ellipse 75% 55% at 18% 100%, rgba(7, 5, 13, 0.85), transparent 70%),
    linear-gradient(180deg, rgba(7, 5, 13, 0.85) 0%, rgba(7, 5, 13, 0) 26%, rgba(7, 5, 13, 0) 40%, rgba(7, 5, 13, 0.92) 100%),
    radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(7, 5, 13, 0.7) 100%);
}
.grain {
  position: absolute; inset: 0; z-index: -1; opacity: 0.07; pointer-events: none;
  background-image: radial-gradient(#fff 1px, transparent 1px);
  background-size: 3px 3px;
}

@keyframes push { from { transform: scale(1.02); } to { transform: scale(1.1) translateY(-6px); } }
@keyframes lamp { from { opacity: 0; } to { opacity: 1; } }
@keyframes letter { from { transform: translateY(108%) rotate(4deg); } to { transform: translateY(0) rotate(0); } }
@keyframes fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes grow-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }

/* Onda de luz que recorre las letras de izquierda a derecha y descansa unos segundos */
@keyframes sheen {
  0%   { background-position: 170% 0, 0 0; }
  38%, 100% { background-position: -70% 0, 0 0; }
}
/* Tubo de neón: respira, y la "I" parpadea de vez en cuando */
@keyframes neon {
  0%   { filter: drop-shadow(0 0 12px rgba(160, 32, 255, 0.65)) drop-shadow(0 0 2px rgba(220, 170, 255, 0.5)); }
  100% { filter: drop-shadow(0 0 34px rgba(190, 100, 255, 1)) drop-shadow(0 0 6px rgba(235, 200, 255, 0.85)); }
}
@keyframes flicker {
  0%, 18%, 22%, 62%, 100% { opacity: 1; }
  20% { opacity: 0.35; }
  24% { opacity: 0.7; }
  64% { opacity: 0.5; }
  66% { opacity: 1; }
}
@keyframes breathe {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

/* ---------- Escenario ---------- */
.stage {
  width: 100%;
  max-width: 1320px;
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 5vw, 64px);
}

/* ---------- Marca ---------- */
.brand {
  position: relative;
  isolation: isolate;
  margin: 0;
  display: flex; align-items: flex-end; gap: 0.07em;
  font-family: 'Anton', 'Impact', 'Arial Narrow', sans-serif; font-weight: 400;
  font-size: var(--brand-size);
}
/* Resplandor violeta detrás del título, respirando */
.brand::before {
  content: ''; position: absolute; z-index: -1; pointer-events: none;
  inset: -12% -6% -18%;
  background: radial-gradient(ellipse 60% 55% at 45% 55%, rgba(150, 40, 240, 0.42), transparent 70%);
  animation: breathe 6s ease-in-out infinite;
}
.word { display: flex; line-height: 0.86; text-transform: uppercase; transition: transform 0.6s var(--ease); }
/* Paralaje suave: FACTOR y FIT se mueven en sentidos opuestos con el cursor */
.word-factor {
  font-size: 1em; letter-spacing: 0.005em;
  transform: translate(calc((var(--mx) - 50%) * -0.035), calc((var(--my) - 40%) * -0.02));
  filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.55));
}
.word-fit {
  font-size: 0.6em; letter-spacing: 0.05em; margin-bottom: 0.02em;
  transform: translate(calc((var(--mx) - 50%) * 0.07), calc((var(--my) - 40%) * 0.04));
  animation: neon 3.4s 1.4s ease-in-out infinite alternate;
}

/* Cada letra sube desde una máscara y luego brilla en onda */
.ch { display: block; overflow: hidden; padding: 0.04em 0 0.02em; margin-bottom: -0.02em; }
.ch > span { display: block; }
.word-factor .ch > span {
  background:
    linear-gradient(105deg, transparent 36%, rgba(176, 82, 255, 0.95) 50%, transparent 64%) 170% 0 / 260% 100% no-repeat,
    linear-gradient(180deg, #fff 35%, rgba(255, 255, 255, 0.5) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation:
    letter 1.05s calc(var(--i) * 70ms + 120ms) var(--ease) both,
    sheen 7s calc(var(--i) * 150ms + 2s) ease-in-out infinite;
}
.word-fit .ch > span {
  color: transparent;
  -webkit-text-stroke: clamp(1.5px, 0.25vw, 3px) var(--violet-hi);
  animation: letter 1.05s calc(var(--i) * 70ms + 520ms) var(--ease) both;
}
.word-fit .ch:nth-child(2) > span {
  animation:
    letter 1.05s 0.66s var(--ease) both,
    flicker 9s 3s linear infinite;
}

/* ---------- Zona inferior ---------- */
.lower {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: end;
  animation: fade-up 0.9s 0.95s var(--ease) both;
}

/* Bloque de texto con filete de luz a la izquierda */
.pitch { position: relative; padding-left: clamp(18px, 2vw, 26px); }
.pitch::before {
  content: ''; position: absolute; left: 0; top: 4px; bottom: 4px; width: 3px; border-radius: 3px;
  background: linear-gradient(180deg, #e3c4ff, var(--purple) 55%, rgba(160, 32, 255, 0));
  box-shadow: 0 0 18px rgba(176, 82, 255, 0.9);
  transform-origin: top;
  animation: grow-y 1.2s 1.1s var(--ease) both;
}
.tagline {
  margin: 0 0 clamp(20px, 2.6vw, 28px);
  display: flex; flex-direction: column; gap: 4px;
  font-size: clamp(1.5rem, 3.1vw, 2.3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.7);
}
.tagline span:first-child { font-weight: 800; color: #fff; }
.tagline span:last-child { font-weight: 500; color: rgba(255, 255, 255, 0.78); }

.cta-q { margin: 0 0 18px; display: flex; flex-direction: column; gap: 3px; font-size: 0.98rem; line-height: 1.45; text-shadow: 0 1px 14px rgba(0, 0, 0, 0.8); }
.cta-q strong { font-size: 1.05rem; font-weight: 700; color: #fff; }
.cta-q span { color: rgba(255, 255, 255, 0.76); }
.cta-actions { display: flex; flex-wrap: wrap; gap: 12px; }

.btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: 14px;
  border: 0; cursor: pointer; color: #fff;
  font: 700 1rem 'Inter', sans-serif;
  letter-spacing: -0.005em;
  min-height: 56px;
  border-radius: 999px;
  overflow: hidden;
  transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease), background 0.3s ease, border-color 0.3s ease;
}
.btn-primary {
  padding: 0 7px 0 28px;
  background: linear-gradient(135deg, #b43dff, #7d10f5);
  box-shadow: 0 12px 34px rgba(138, 18, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
/* Reflejo que cruza el botón cada pocos segundos */
.btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%);
  transform: translateX(-130%);
  animation: btn-shine 5.5s 2.4s ease-in-out infinite;
}
@keyframes btn-shine { 0% { transform: translateX(-130%); } 30%, 100% { transform: translateX(130%); } }
.go {
  position: relative;
  display: grid; place-items: center;
  width: 42px; height: 42px; border-radius: 50%;
  background: #fff; color: #7d10f5;
  transition: transform 0.4s var(--ease);
}
.btn-primary:hover { box-shadow: 0 18px 44px rgba(138, 18, 255, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.3); }
.btn-primary:hover .go { transform: rotate(-45deg); }
.btn-ghost {
  padding: 0 30px;
  background: rgba(10, 6, 22, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.btn-ghost:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.65); }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: scale(0.97); }
.btn:focus-visible { outline: 2px solid var(--violet-hi); outline-offset: 3px; }

/* ---------- Destacados: lista con filetes, sin tarjetas ---------- */
.highlights { list-style: none; margin: 0; padding: 0; }
.highlights li {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.3s ease, padding-left 0.4s var(--ease);
}
.highlights li:last-child { border-bottom: 1px solid rgba(255, 255, 255, 0.2); }
.highlights li:hover { border-top-color: var(--violet-hi); padding-left: 8px; }
.hl-icon {
  flex: 0 0 42px; width: 42px; height: 42px; display: grid; place-items: center;
  border-radius: 50%; color: var(--violet-hi);
  background: rgba(160, 32, 255, 0.24); border: 1px solid rgba(200, 130, 255, 0.45);
  box-shadow: 0 0 18px rgba(160, 32, 255, 0.3);
}
.hl-icon svg { width: 20px; height: 20px; }
.hl-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-shadow: 0 1px 12px rgba(0, 0, 0, 0.8); }
.hl-text strong { font-size: 1rem; font-weight: 700; letter-spacing: -0.01em; }
.hl-text small { font-size: 0.86rem; line-height: 1.35; color: rgba(255, 255, 255, 0.74); }

/* ---------- Responsive ---------- */
@keyframes grow-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
/* Desplazamiento corto: la capa es más grande que la pantalla, así que nunca se ve su borde */
@keyframes spot-drift { from { transform: translate(-6%, 3%); } to { transform: translate(6%, -4%); } }

@media (max-width: 860px) {
  .hero {
    --host-header: 72px;
    --brand-size: min(30vw, 22svh);
    --mx: 50%;
    --my: 42%;
    align-items: stretch;
    padding-top: calc(var(--host-header) + 32px);
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
  .stage { flex: 1; justify-content: space-between; gap: 24px; }

  /* Corrección: el foco de luz se sale de la pantalla, así no aparece una franja al moverse */
  .spot {
    inset: -30%;
    animation: lamp 1.6s 0.2s var(--ease) both, spot-drift 12s 1.6s ease-in-out infinite alternate;
  }

  /* Marca */
  .brand {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.06em;
    justify-content: flex-start;
  }
  .word-factor { transform: none; }

  /* Barrido de luz más definido y letras más sólidas (sin transparencia abajo) */
  .word-factor .ch > span {
    background:
      linear-gradient(105deg, transparent 30%, rgba(190, 110, 255, 0.95) 50%, transparent 70%) 170% 0 / 300% 100% no-repeat,
      linear-gradient(180deg, #fff 45%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text; background-clip: text;
  }

  /* FIT: relleno suave y contorno firme para que se lea */
  .word-fit {
    width: 100%;
    align-items: center;
    margin-bottom: 0;
    font-size: 0.72em;
    letter-spacing: 0.1em;
    transform: none;
  }
  .word-fit .ch > span {
    color: rgba(160, 32, 255, 0.28);
    -webkit-text-stroke: 2px #e3c4ff;
    text-shadow: 0 0 22px rgba(176, 82, 255, 0.9);
  }
  .word-fit::after {
    content: '';
    flex: 1;
    height: 2px;
    margin-left: 0.3em;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--violet-hi), rgba(160, 32, 255, 0));
    box-shadow: 0 0 14px rgba(190, 100, 255, 0.8);
  }

  .lower { grid-template-columns: 1fr; gap: 18px; }

  .bg-vignette {
    background:
      linear-gradient(180deg, rgba(7, 5, 13, 0.75) 0%, rgba(7, 5, 13, 0) 22%, rgba(7, 5, 13, 0) 40%, rgba(7, 5, 13, 0.9) 68%, rgba(7, 5, 13, 0.98) 100%),
      radial-gradient(ellipse 90% 80% at 50% 40%, transparent 50%, rgba(7, 5, 13, 0.5) 100%);
  }

  /* Texto */
  .pitch { padding: 16px 0 0; }
  .pitch::before { left: 0; top: 0; bottom: auto; width: 48px; height: 3px; transform-origin: left; animation-name: grow-x; }
  .tagline { margin-bottom: 14px; gap: 2px; font-size: clamp(1.25rem, 5.8vw, 1.6rem); line-height: 1.1; }
  .tagline span:last-child { color: rgba(255, 255, 255, 0.86); }
  .cta-q { margin-bottom: 14px; gap: 2px; }
  .cta-q strong { font-size: 0.94rem; }
  .cta-q span { font-size: 0.82rem; color: rgba(255, 255, 255, 0.82); }

  /* Botones: lado a lado, bajos y compactos */
  .cta-actions { flex-wrap: nowrap; flex-direction: row; gap: 8px; }
  .btn { min-height: 44px; font-size: 0.86rem; gap: 8px; width: auto; }
  .btn-primary { flex: 1.3; padding: 0 4px 0 18px; justify-content: space-between; }
  .btn-ghost { flex: 1; padding: 0 12px; }
  .go { width: 36px; height: 36px; }
  .go svg { width: 14px; height: 14px; }

  /* Destacados */
  .highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; border: 0; }
  .highlights li,
  .highlights li:last-child {
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
    padding: 13px 6px 11px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .highlights li + li { border-left: 1px solid rgba(255, 255, 255, 0.16); }
  .highlights li:hover { padding-left: 6px; border-color: rgba(200, 130, 255, 0.5); }
  .hl-icon { flex-basis: 36px; width: 36px; height: 36px; }
  .hl-icon svg { width: 17px; height: 17px; }
  .hl-text small { display: none; }
  .hl-text strong { font-size: 0.75rem; line-height: 1.2; }
}

/* Celulares muy angostos */
@media (max-width: 360px) {
  .btn { font-size: 0.8rem; min-height: 40px; }
  .btn-primary { padding-left: 12px; }
  .btn-ghost { padding: 0 8px; }
  .hl-text strong { font-size: 0.7rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
</style>