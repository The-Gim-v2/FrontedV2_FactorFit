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

// El collage tiene 7 espacios. Pega aquí tus fotos (URL directa o ruta de /public).
// Si pones menos de 7, se repiten con recortes distintos para que no queden huecos.
const PHOTOS: Photo[] = [
  { image: 'https://i.ibb.co/272HW3wN/fondo-landing.jpg', caption: 'Clase grupal' },
  // { image: 'URL_IMAGEN_2', caption: 'Nuestra comunidad', link: 'https://www.facebook.com/...' },
];
/* ================================================= */

const SLOTS = 7;
const CROPS = ['center', '18% 40%', '82% 30%', '50% 90%', '8% 75%', '72% 62%', '35% 15%'];
const ZOOMS = [1, 1.35, 1.3, 1.45, 1.4, 1.5, 1.35];
const EXTRA = ['Entrenamos juntas', 'Energía de sobra', 'Aquí nadie va sola', 'Retos del mes', 'Risas y ritmo', 'Tu próxima clase'];

const tiles = computed(() =>
  Array.from({ length: SLOTS }, (_, i) => {
    const p = PHOTOS[i % PHOTOS.length];
    const repeat = i >= PHOTOS.length;
    return {
      ...p,
      caption: repeat ? EXTRA[(i - PHOTOS.length) % EXTRA.length] : p?.caption,
      pos: repeat ? CROPS[i % CROPS.length] : 'center',
      zoom: repeat ? ZOOMS[i % ZOOMS.length] : 1,
    };
  })
);

/* ---------- Aparición ---------- */
const root = ref<HTMLElement | null>(null);
const revealed = ref(false);
let io: IntersectionObserver | null = null;

onMounted(() => {
  if (!('IntersectionObserver' in window) || !root.value) { revealed.value = true; return; }
  io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { revealed.value = true; io?.disconnect(); } }, { threshold: 0.08 });
  io.observe(root.value);
});
onUnmounted(() => io?.disconnect());
</script>

<template>
  <section id="facebook" ref="root" :class="['fb-section', { revealed }]">
    <!-- Fondo animado -->
    <div class="aurora" aria-hidden="true"></div>
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="orb orb-c"></div>
    <div class="watermark" aria-hidden="true">FACTOR FIT</div>
    <div class="ring ring-1" aria-hidden="true"></div>
    <div class="ring ring-2" aria-hidden="true"></div>
    <div class="grain"></div>
    <svg class="spark s1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="spark s2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="spark s3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="spark s4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="float f1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
    <svg class="float f2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21h4V9H2v12Zm20-11a2 2 0 0 0-2-2h-6.3l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 1 6.59 7.59A2 2 0 0 0 6 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z"/></svg>
    <svg class="float f3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="float f4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
    <svg class="float f5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z"/></svg>
    <svg class="float f6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21h4V9H2v12Zm20-11a2 2 0 0 0-2-2h-6.3l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 1 6.59 7.59A2 2 0 0 0 6 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z"/></svg>

    <div class="container">
      <header class="head">
        <h2 class="title">Lo mejor de Factor Fit<br />en Facebook</h2>
        <p class="subtitle">Fotos de nuestras clases, retos, eventos y novedades. Todo lo que publicamos, en un solo lugar.</p>
        <a class="handle" :href="FACEBOOK_URL" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z"/></svg>
          @{{ FACEBOOK_HANDLE }}
        </a>
      </header>

      <!-- MOSAICO -->
      <div class="mosaic">
        <a
          v-for="(t, i) in tiles"
          :key="i"
          :class="['tile', `t${i + 1}`]"
          :href="t.link || FACEBOOK_URL"
          target="_blank"
          rel="noopener"
          :style="{ '--delay': `${i * 0.08}s` }"
          :aria-label="`${t.caption} – ver en Facebook`"
        >
          <img
            :src="t.image"
            :alt="t.caption"
            :style="{ objectPosition: t.pos, '--zoom': t.zoom }"
            loading="lazy"
            draggable="false"
            referrerpolicy="no-referrer"
          />
          <span class="fade" aria-hidden="true"></span>
          <span class="fb-dot" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z"/></svg>
          </span>
          <span class="cap">{{ t.caption }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fb-section {
  --gap: clamp(8px, 1.4vw, 16px);
  --row: clamp(120px, 17vw, 210px);
  position: relative;
  scroll-margin-top: 84px;
  padding: clamp(56px, 9vw, 120px) clamp(14px, 4vw, 60px) clamp(48px, 8vw, 100px);
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse 65% 50% at 0% 0%, rgba(214, 90, 255, 0.45) 0%, rgba(214, 90, 255, 0) 60%),
    radial-gradient(ellipse 55% 45% at 100% 100%, rgba(255, 90, 190, 0.28) 0%, rgba(255, 90, 190, 0) 60%),
    linear-gradient(200deg, #120f26 0%, #3a1d68 52%, #6c2f9c 100%);
}

/* ---------- Fondo animado ---------- */
.aurora {
  position: absolute; z-index: -4; pointer-events: none;
  left: 50%; top: 50%;
  width: 150%; aspect-ratio: 1;
  translate: -50% -50%;
  background: conic-gradient(from 0deg, rgba(160, 32, 255, 0), rgba(180, 76, 230, 0.5), rgba(255, 110, 200, 0.35), rgba(120, 70, 255, 0.45), rgba(160, 32, 255, 0));
  filter: blur(90px);
  opacity: 0.55;
  animation: spin 45s linear infinite;
}
.orb { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -3; pointer-events: none; }
.orb-a { width: 460px; height: 460px; background: rgba(160, 32, 255, 0.34); top: -140px; left: -110px; animation: drift 16s ease-in-out infinite alternate; }
.orb-b { width: 420px; height: 420px; background: rgba(255, 110, 230, 0.26); top: 42%; right: -130px; animation: drift 20s ease-in-out infinite alternate-reverse; }
.orb-c { width: 380px; height: 380px; background: rgba(90, 100, 255, 0.24); bottom: -120px; left: 28%; animation: drift 23s ease-in-out infinite alternate; }
.grain { position: absolute; inset: 0; z-index: -1; opacity: 0.05; pointer-events: none; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 3px 3px; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(60px, -44px) scale(1.12); } }

/* Marca de agua gigante que se desliza lento */
.watermark {
  position: absolute; z-index: -2; pointer-events: none; white-space: nowrap;
  left: 0; top: 50%;
  font: 400 clamp(8rem, 28vw, 24rem) 'Anton', 'Inter', sans-serif;
  line-height: 1; text-transform: uppercase;
  color: transparent;
  -webkit-text-stroke: 2px rgba(243, 211, 255, 0.07);
  transform: translateY(-50%);
  animation: slide 60s linear infinite alternate;
}
@keyframes slide { from { transform: translate(-8%, -50%); } to { transform: translate(-36%, -50%); } }

/* Anillos concéntricos que giran */
.ring { position: absolute; z-index: -2; pointer-events: none; border-radius: 50%; right: -160px; top: 14%; aspect-ratio: 1; }
.ring-1 { width: 520px; border: 1px dashed rgba(243, 211, 255, 0.28); animation: spin 70s linear infinite; }
.ring-2 { width: 380px; margin: 70px; border: 1px solid rgba(243, 211, 255, 0.16); animation: spin 50s linear infinite reverse; }

/* Destellos (SVG) */
.spark { position: absolute; z-index: -1; color: rgba(243, 211, 255, 0.8); pointer-events: none; animation: twinkle 3.4s ease-in-out infinite; }
.s1 { top: 12%; left: 7%; width: 28px; height: 28px; }
.s2 { top: 48%; right: 5%; width: 20px; height: 20px; animation-delay: -1.2s; }
.s3 { bottom: 14%; left: 10%; width: 16px; height: 16px; animation-delay: -2.2s; }
.s4 { top: 26%; right: 22%; width: 14px; height: 14px; animation-delay: -0.6s; }
@keyframes twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.25) rotate(20deg); } }

/* Iconos SVG que suben flotando */
.float { position: absolute; z-index: -1; pointer-events: none; opacity: 0; animation: rise 12s ease-in infinite; }
.f1 { left: 5%;  bottom: 4%; width: 26px; height: 26px; color: #ff7ad1; animation-delay: 0s; }
.f2 { left: 24%; bottom: 2%; width: 22px; height: 22px; color: #c9a2ff; animation-delay: -3.5s; }
.f3 { left: 46%; bottom: 3%; width: 22px; height: 22px; color: #f3d3ff; animation-delay: -6s; }
.f4 { left: 68%; bottom: 2%; width: 20px; height: 20px; color: #ff9be0; animation-delay: -1.5s; }
.f5 { right: 8%; bottom: 4%; width: 26px; height: 26px; color: #ffd6f4; animation-delay: -8s; }
.f6 { right: 28%; bottom: 3%; width: 22px; height: 22px; color: #b9a4ff; animation-delay: -4.5s; }
@keyframes rise {
  0%   { transform: translateY(0) scale(0.7); opacity: 0; }
  12%  { opacity: 0.85; }
  100% { transform: translateY(-560px) translateX(30px) scale(1.2); opacity: 0; }
}

.container { max-width: 1120px; margin: 0 auto; }

/* ---------- Cabecera ---------- */
.head {
  text-align: center;
  margin-bottom: clamp(26px, 5vw, 52px);
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.revealed .head { opacity: 1; transform: none; }
.title {
  margin: 0 0 14px;
  font-family: 'Anton', 'Inter', sans-serif;
  font-weight: 400;
  font-size: clamp(2rem, 8vw, 4.2rem);
  line-height: 1.08;
  text-transform: uppercase;
  color: #fff;
}
.subtitle { margin: 0 auto 20px; max-width: 50ch; font-size: clamp(0.92rem, 2.6vw, 1.08rem); line-height: 1.6; color: rgba(255, 255, 255, 0.8); }
.handle {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: 999px; text-decoration: none; color: #fff;
  font-weight: 700; font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: background 0.25s ease, transform 0.25s ease;
}
.handle svg { width: 18px; height: 18px; }
.handle:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
.handle:focus-visible { outline: 2px solid #e0b3ff; outline-offset: 3px; }

/* ---------- Mosaico (escritorio: 4 columnas) ---------- */
.mosaic {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: var(--row);
  gap: var(--gap);
}

.tile {
  position: relative; display: block; min-width: 0; min-height: 0;
  border-radius: clamp(14px, 2.2vw, 24px);
  overflow: hidden;
  background: #2a1646;
  color: #fff; text-decoration: none;
  box-shadow: 0 16px 36px rgba(8, 3, 26, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
  opacity: 0; transform: translateY(26px) scale(0.96);
  transition: opacity 0.7s ease var(--delay), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) var(--delay), box-shadow 0.35s ease;
}
.revealed .tile { opacity: 1; transform: none; }
.tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(var(--zoom, 1)); transition: transform 0.8s ease; }
.fade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to top, rgba(8, 3, 26, 0.8) 0%, rgba(8, 3, 26, 0) 55%); opacity: 0; transition: opacity 0.35s ease; }

.fb-dot {
  position: absolute; top: 10px; right: 10px; z-index: 2;
  width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center;
  background: #1877f2; color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}
.fb-dot svg { width: 16px; height: 16px; }

.cap {
  position: absolute; left: 14px; right: 14px; bottom: 12px; z-index: 2;
  font: 700 clamp(0.8rem, 1.4vw, 0.98rem) 'Inter', sans-serif;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

@media (hover: hover) {
  .revealed .tile:hover, .revealed .tile:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 24px 50px rgba(8, 3, 26, 0.65), 0 0 0 2px #e0b3ff, 0 0 34px rgba(190, 90, 255, 0.5);
    transition-delay: 0s;
  }
  .tile:hover img { transform: scale(calc(var(--zoom, 1) * 1.07)); }
  .tile:hover .fade, .tile:focus-visible .fade { opacity: 1; }
  .tile:hover .cap, .tile:focus-visible .cap { opacity: 1; transform: none; }
}
.tile:focus-visible { outline: 3px solid #e0b3ff; outline-offset: 3px; }

/* Posiciones escritorio */
.t1 { grid-column: 1 / 3; grid-row: 1 / 3; }
.t2 { grid-column: 3 / 4; grid-row: 1 / 2; }
.t3 { grid-column: 4 / 5; grid-row: 1 / 3; }
.t4 { grid-column: 3 / 4; grid-row: 2 / 3; }
.t5 { grid-column: 1 / 3; grid-row: 3 / 4; }
.t6 { grid-column: 3 / 4; grid-row: 3 / 4; }
.t7 { grid-column: 4 / 5; grid-row: 3 / 4; }

/* ---------- Tablet ---------- */
@media (max-width: 900px) {
  .fb-section { --row: clamp(110px, 21vw, 190px); }
}

/* ---------- Móvil: 2 columnas, todo encaja sin huecos ---------- */
@media (max-width: 640px) {
  .fb-section { --row: 40vw; --gap: 8px; }
  .mosaic { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .t1 { grid-column: 1 / 3; grid-row: 1 / 3; }
  .t2 { grid-column: 1 / 2; grid-row: 3 / 4; }
  .t3 { grid-column: 2 / 3; grid-row: 3 / 5; }
  .t4 { grid-column: 1 / 2; grid-row: 4 / 5; }
  .t5 { grid-column: 1 / 3; grid-row: 5 / 6; }
  .t6 { grid-column: 1 / 2; grid-row: 6 / 7; }
  .t7 { grid-column: 2 / 3; grid-row: 6 / 7; }
  .fb-dot { width: 26px; height: 26px; top: 8px; right: 8px; }
  .fb-dot svg { width: 14px; height: 14px; }
  .aurora { width: 260%; }
  .float, .ring { display: none; }
  .watermark { -webkit-text-stroke-width: 1.5px; }
}
/* En pantallas táctiles no hay "hover": se muestra el texto en las fotos grandes */
@media (hover: none) {
  .t1 .fade, .t3 .fade, .t5 .fade { opacity: 1; }
  .t1 .cap, .t3 .cap, .t5 .cap { opacity: 1; transform: none; }
  .tile:active { transform: scale(0.98); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .head, .tile { opacity: 1 !important; transform: none !important; }
  .float, .watermark, .ring { display: none; }
}
</style>