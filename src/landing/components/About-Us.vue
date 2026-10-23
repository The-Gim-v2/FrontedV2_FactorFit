<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// Misma foto de fondo que usa la pantalla de login
const heroBg = 'https://i.ibb.co/272HW3wN/fondo-landing.jpg';

const highlights = [
  { icon: 'cal', title: 'Clases grupales', text: 'Reserva tu lugar en segundos' },
  { icon: 'bolt', title: 'Entrenadores', text: 'Acompañamiento real' },
  { icon: 'chart', title: 'Tu progreso', text: 'Todo en un solo lugar' },
];
</script>

<template>
  <section class="hero" id="inicio">
    <!-- Fondo -->
    <div class="bg" :style="{ backgroundImage: `url(${heroBg})` }"></div>
    <div class="bg-tint"></div>
    <div class="bg-vignette"></div>
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="grain"></div>

    <div class="stage">
      <!-- Logo -->
      <div class="logo-card">
        <h1 class="logo-word"><span>FACTOR</span></h1>
        <div class="logo-fit" aria-hidden="true"><span>F</span><span>I</span><span>T</span></div>
        <p class="sr-only">Factor Fit</p>
      </div>

      <p class="tagline">Entrena con propósito. <strong>Supera tu mejor versión.</strong></p>

      <!-- CTA -->
      <div class="cta-wrap">
        <div class="cta-card">
          <h2>¿Ya te inscribiste?</h2>
          <p class="cta-sub">Entra a tu cuenta o empieza hoy tu cambio.</p>
          <div class="cta-actions">
            <button class="btn btn-primary" @click="router.push('/login')">
              Inicia sesión
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <button class="btn btn-dark" @click="router.push('/Record')">Registrarte</button>
          </div>
        </div>
      </div>

      <!-- Destacados -->
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
  </section>
</template>

<style scoped>
.hero {
  --purple: #a020ff;
  --purple-2: #7a12e6;
  --glass: rgba(255, 255, 255, 0.12);
  --glass-line: rgba(255, 255, 255, 0.22);
  /* Altura del header del sitio que queda encima (ajústala si cambia) */
  --host-header: 84px;

  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  isolation: isolate;
  padding: calc(var(--host-header) + clamp(28px, 5vw, 64px)) clamp(16px, 4vw, 48px) clamp(32px, 5vw, 64px);
}

/* ---------- Fondo ---------- */
.bg {
  position: absolute;
  inset: -24px;
  background-size: cover;
  background-position: center;
  filter: blur(2px) saturate(1.25) contrast(1.05);
  z-index: -5;
  animation: kenburns 26s ease-in-out infinite alternate;
}
.bg-tint {
  position: absolute; inset: 0; z-index: -4;
  background:
    linear-gradient(135deg, rgba(88, 16, 160, 0.55) 0%, rgba(20, 8, 44, 0.35) 45%, rgba(8, 6, 24, 0.6) 100%);
  mix-blend-mode: multiply;
}
.bg-vignette {
  position: absolute; inset: 0; z-index: -3;
  background:
    radial-gradient(ellipse 70% 60% at 50% 48%, rgba(8, 4, 18, 0) 0%, rgba(8, 4, 18, 0.55) 100%),
    linear-gradient(180deg, rgba(6, 4, 14, 0.7) 0%, rgba(6, 4, 14, 0) 22%, rgba(6, 4, 14, 0) 62%, rgba(6, 4, 14, 0.85) 100%);
}
.orb { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -2; pointer-events: none; }
.orb-a { width: 460px; height: 460px; background: rgba(160, 32, 255, 0.32); top: 8%; left: -140px; animation: drift 14s ease-in-out infinite alternate; }
.orb-b { width: 420px; height: 420px; background: rgba(40, 90, 255, 0.24); bottom: -40px; right: -120px; animation: drift 18s ease-in-out infinite alternate-reverse; }
.grain {
  position: absolute; inset: 0; z-index: -1; opacity: 0.06; pointer-events: none;
  background-image: radial-gradient(#fff 1px, transparent 1px);
  background-size: 3px 3px;
}

@keyframes kenburns { from { transform: scale(1.04); } to { transform: scale(1.13) translateY(-8px); } }
@keyframes drift { from { transform: translate(0, 0); } to { transform: translate(44px, -34px); } }
@keyframes rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shine { 0% { transform: translateX(-130%); } 60%, 100% { transform: translateX(130%); } }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(160, 32, 255, 0.55); } 50% { box-shadow: 0 0 0 7px rgba(160, 32, 255, 0); } }

/* ---------- Escenario ---------- */
.stage {
  width: 100%;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(16px, 2.4vw, 24px);
  text-align: center;
}

/* Logo */
.logo-card {
  position: relative;
  width: min(100%, 560px);
  padding: clamp(14px, 2.4vw, 24px) clamp(16px, 2.6vw, 28px) clamp(10px, 1.6vw, 16px);
  border-radius: clamp(20px, 3vw, 30px);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.5), 0 0 70px rgba(160, 32, 255, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.45);
  overflow: hidden;
  animation: rise 0.8s 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.logo-card::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.22) 50%, transparent 65%);
  animation: shine 5.5s ease-in-out infinite;
}
.logo-word { margin: 0; line-height: 1; }
.logo-word span {
  display: block;
  background: #000;
  color: #fff;
  font-family: 'Roboto Mono', 'Inter', monospace;
  font-weight: 700;
  font-size: clamp(2.5rem, 11.5vw, 5.4rem);
  letter-spacing: 0.14em;
  padding: clamp(6px, 1.2vw, 12px) 0 clamp(6px, 1.2vw, 12px) 0.14em;
  text-shadow: 0 0 30px rgba(160, 32, 255, 0.75), 0 0 6px rgba(255, 255, 255, 0.4);
}
.logo-fit {
  display: flex; justify-content: space-between;
  padding: clamp(8px, 1.4vw, 12px) clamp(4px, 1vw, 8px) 2px;
  font-family: 'Roboto Mono', monospace;
  font-weight: 800;
  font-size: clamp(1.1rem, 3.6vw, 1.65rem);
  color: #fff;
  text-shadow: 0 0 14px rgba(160, 32, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.5);
}
.logo-fit span { animation: rise 0.7s ease both; }
.logo-fit span:nth-child(1) { animation-delay: 0.4s; }
.logo-fit span:nth-child(2) { animation-delay: 0.55s; }
.logo-fit span:nth-child(3) { animation-delay: 0.7s; }

.tagline {
  margin: 0;
  font-size: clamp(1rem, 2.6vw, 1.3rem);
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
  animation: rise 0.8s 0.18s ease both;
}
.tagline strong { color: #fff; font-weight: 800; }

/* CTA con borde degradado */
.cta-wrap {
  width: min(100%, 460px);
  padding: 1.5px;
  border-radius: clamp(22px, 3vw, 28px);
  background: linear-gradient(140deg, rgba(210, 140, 255, 0.9), rgba(160, 32, 255, 0.25) 40%, rgba(90, 120, 255, 0.6));
  box-shadow: 0 30px 80px rgba(80, 10, 160, 0.5);
  animation: rise 0.8s 0.26s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.cta-card {
  padding: clamp(22px, 3.4vw, 32px) clamp(18px, 3vw, 30px) clamp(22px, 3.4vw, 30px);
  border-radius: inherit;
  background: linear-gradient(150deg, rgba(92, 22, 160, 0.86), rgba(34, 12, 72, 0.9));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}
.cta-card h2 {
  margin: 0;
  font-size: clamp(1.6rem, 5.4vw, 2.2rem);
  font-style: italic;
  font-weight: 800;
  letter-spacing: -0.4px;
}
.cta-sub { margin: 10px 0 24px; font-size: clamp(0.9rem, 2.4vw, 1rem); color: rgba(255, 255, 255, 0.76); }
.cta-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }

.btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: 0; cursor: pointer; color: #fff;
  font: 700 1rem 'Inter', sans-serif;
  padding: 0 30px;
  min-height: 52px;
  border-radius: 999px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.btn-primary { background: linear-gradient(135deg, #bb44ff, #8412ff); box-shadow: 0 12px 30px rgba(138, 18, 255, 0.55); }
.btn-primary::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
  transform: translateX(-120%); transition: transform 0.7s ease;
}
.btn-primary:hover::before { transform: translateX(120%); }
.btn-primary svg { transition: transform 0.25s ease; }
.btn-primary:hover svg { transform: translateX(4px); }
.btn-dark { background: rgba(15, 20, 34, 0.9); border: 1px solid rgba(255, 255, 255, 0.16); }
.btn:hover { transform: translateY(-3px); }
.btn-primary:hover { box-shadow: 0 18px 38px rgba(138, 18, 255, 0.7); }
.btn-dark:hover { background: #222d47; box-shadow: 0 14px 30px rgba(0, 0, 0, 0.5); }
.btn:active { transform: scale(0.98); }
.btn:focus-visible { outline: 2px solid #e0b3ff; outline-offset: 3px; }

/* Destacados */
.highlights {
  list-style: none; margin: 0; padding: 0;
  width: min(100%, 720px);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  animation: rise 0.8s 0.34s ease both;
}
.highlights li {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  text-align: left;
  border-radius: 16px;
  background: rgba(14, 8, 28, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}
.highlights li:hover { transform: translateY(-3px); border-color: rgba(200, 130, 255, 0.55); background: rgba(40, 14, 72, 0.55); }
.hl-icon {
  flex: 0 0 40px; width: 40px; height: 40px; display: grid; place-items: center;
  border-radius: 12px; color: #e4b8ff;
  background: rgba(160, 32, 255, 0.22); border: 1px solid rgba(190, 110, 255, 0.4);
}
.hl-icon svg { width: 20px; height: 20px; }
.hl-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.hl-text strong { font-size: 0.92rem; font-weight: 700; }
.hl-text small { font-size: 0.78rem; line-height: 1.35; color: rgba(255, 255, 255, 0.66); }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* ---------- Responsive ---------- */
@media (max-width: 760px) {
  .hero { --host-header: 72px; align-items: flex-start; }
  .highlights { grid-template-columns: 1fr; gap: 10px; }
  .highlights li { padding: 12px 14px; }
}
@media (max-width: 480px) {
  .cta-actions { flex-direction: column; }
  .btn { width: 100%; }
  .stage { gap: 20px; }
  .logo-card { width: 100%; padding: 18px 14px 14px; border-radius: 24px; }
  .logo-word span { font-size: 15.5vw; letter-spacing: 0.1em; padding: 10px 0 10px 0.1em; }
  .logo-fit { padding: 12px 6px 4px; font-size: 1.9rem; }
  .tagline { font-size: 1.1rem; }
}
@media (max-width: 340px) {
  .logo-word span { font-size: 14.5vw; letter-spacing: 0.06em; }
}
@media (min-width: 1200px) {
  .stage { max-width: 820px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
</style>