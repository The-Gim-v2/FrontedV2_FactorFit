<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Misma foto que usa el hero y el login
const photo = 'https://i.ibb.co/272HW3wN/fondo-landing.jpg';

const PILLARS = [
  { icon: 'move', title: 'Movimiento', text: 'El poder de transformar tu vida.' },
  { icon: 'people', title: 'Comunidad', text: 'Aquí entrenas, creces y te inspiras.' },
  { icon: 'heart', title: 'Bienestar', text: 'Física y mentalmente, es nuestra prioridad.' },
];

const el = ref<HTMLElement | null>(null);
const revealed = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!('IntersectionObserver' in window) || !el.value) {
    revealed.value = true;
    return;
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        revealed.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.15 }
  );
  observer.observe(el.value);
});
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <section id="sobre-nosotros" ref="el" :class="['about', { revealed }]">
    <!-- Fondo -->
    <div class="bg-orb orb-a"></div>
    <div class="bg-orb orb-b"></div>
    <div class="bg-orb orb-c"></div>
    <div class="watermark" aria-hidden="true">FACTOR</div>

    <div class="container">
      <div class="grid">
        <!-- Texto -->
        <div class="col-text">
          <h2 class="title">
            Sobre
            <span class="last-word">nosotros<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></span>
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

          <ul class="pillars">
            <li v-for="(p, i) in PILLARS" :key="p.title" :style="{ transitionDelay: `${0.35 + i * 0.12}s` }">
              <span class="pillar-icon">
                <svg v-if="p.icon === 'move'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>
                <svg v-else-if="p.icon === 'people'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4 5"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.4-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.6-7.5 10-7.5 10Z"/></svg>
              </span>
              <span class="pillar-text">
                <strong>{{ p.title }}</strong>
                <small>{{ p.text }}</small>
              </span>
            </li>
          </ul>
        </div>

        <!-- Visual -->
        <div class="col-visual">
          <div class="visual">
            <div class="ring ring-dashed"></div>
            <div class="ring ring-solid"></div>

            <div class="photo-circle">
              <img :src="photo" alt="Comunidad Factor FIT entrenando" loading="lazy" />
              <div class="photo-shade"></div>
            </div>

            <div class="chip chip-a">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4 5"/></svg>
              Comunidad
            </div>
            <div class="chip chip-b">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.4-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.6-7.5 10-7.5 10Z"/></svg>
              Tu bienestar
            </div>
            <div class="chip chip-c">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/></svg>
              Mejor versión
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

.about {
  --purple: #a020ff;
  position: relative;
  scroll-margin-top: 84px;
  padding: clamp(70px, 10vw, 130px) clamp(18px, 5vw, 64px);
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse 70% 60% at 0% 0%, #b44ce6 0%, rgba(180, 76, 230, 0) 55%),
    linear-gradient(150deg, #6c2f9c 0%, #43246a 45%, #131526 100%);
}

/* ---------- Fondo ---------- */
.bg-orb { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -2; pointer-events: none; }
.orb-a { width: 460px; height: 460px; background: rgba(255, 120, 255, 0.35); top: -120px; left: -120px; animation: drift 16s ease-in-out infinite alternate; }
.orb-b { width: 420px; height: 420px; background: rgba(70, 90, 255, 0.28); bottom: -140px; right: -100px; animation: drift 19s ease-in-out infinite alternate-reverse; }
.orb-c { width: 300px; height: 300px; background: rgba(160, 32, 255, 0.3); top: 40%; left: 45%; animation: drift 22s ease-in-out infinite alternate; }
.watermark {
  position: absolute;
  z-index: -1;
  right: -2%;
  bottom: -6%;
  font-family: 'Roboto Mono', 'Inter', monospace;
  font-weight: 800;
  font-size: clamp(6rem, 22vw, 20rem);
  letter-spacing: 0.1em;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.07);
  user-select: none;
  pointer-events: none;
}

@keyframes drift { from { transform: translate(0, 0); } to { transform: translate(50px, -36px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }

.container { max-width: 1240px; margin: 0 auto; position: relative; }

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(36px, 6vw, 90px);
  align-items: center;
}

/* ---------- Texto ---------- */
.col-text {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.revealed .col-text { opacity: 1; transform: none; }

.title {
  margin: 0 0 clamp(20px, 3vw, 30px);
  font-family: 'Permanent Marker', 'Inter', cursive;
  font-weight: 400;
  font-size: clamp(2.3rem, 7.4vw, 4.4rem);
  line-height: 1.08;
  letter-spacing: 1.5px;
  color: #fff;
  text-shadow: 0 3px 0 rgba(40, 10, 84, 0.7), 0 8px 30px rgba(20, 8, 44, 0.6);
}
.last-word { white-space: nowrap; }

/* Puntos suspensivos: junto a la palabra, alineados a la base */
.dots {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.13em;
  margin-left: 0.14em;
  vertical-align: baseline;
}
.dots i {
  display: block;
  width: 0.14em;
  height: 0.14em;
  min-width: 7px;
  min-height: 7px;
  border-radius: 50%;
  background: #f7c6ff;
  box-shadow: 0 0 12px rgba(247, 198, 255, 0.85);
  animation: dotJump 1.4s ease-in-out infinite;
}
.dots i:nth-child(2) { animation-delay: 0.18s; }
.dots i:nth-child(3) { animation-delay: 0.36s; }
@keyframes dotJump { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-0.3em); } }

.text-card {
  position: relative;
  padding: clamp(22px, 3vw, 34px) clamp(20px, 3vw, 36px);
  border-radius: 24px;
  background: linear-gradient(150deg, rgba(36, 12, 74, 0.78), rgba(22, 9, 50, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  box-shadow: 0 30px 70px rgba(15, 6, 36, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.text-card::before {
  content: '';
  position: absolute;
  left: 0; top: 24px; bottom: 24px;
  width: 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, #ffd0ff, var(--purple));
}
.text-card p {
  margin: 0 0 16px;
  font-size: clamp(1rem, 1.5vw, 1.12rem);
  line-height: 1.75;
  font-weight: 500;
  color: #fff;
}
.text-card p:last-child { margin-bottom: 0; }
.text-card mark {
  background: linear-gradient(transparent 62%, rgba(206, 110, 255, 0.6) 62%);
  color: #fff;
  font-weight: 700;
  padding: 0 3px;
}

/* Pilares */
.pillars {
  list-style: none;
  margin: clamp(20px, 3vw, 28px) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.pillars li {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(14, 8, 30, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, background 0.25s ease;
}
.revealed .pillars li { opacity: 1; transform: none; }
.revealed .pillars li:hover { transform: translateY(-5px); border-color: rgba(240, 180, 255, 0.6); background: rgba(60, 20, 100, 0.55); }
.pillar-icon {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 13px;
  color: #f1c4ff;
  background: rgba(160, 32, 255, 0.28);
  border: 1px solid rgba(220, 150, 255, 0.45);
}
.pillar-icon svg { width: 21px; height: 21px; }
.pillar-text { display: flex; flex-direction: column; gap: 3px; }
.pillar-text strong { font-size: 0.98rem; font-weight: 700; }
.pillar-text small { font-size: 0.8rem; line-height: 1.4; color: rgba(255, 255, 255, 0.7); }

/* ---------- Visual ---------- */
.col-visual {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: scale(0.92);
  transition: opacity 1s 0.15s ease, transform 1s 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.revealed .col-visual { opacity: 1; transform: none; }

.visual {
  position: relative;
  width: min(100%, 460px);
  aspect-ratio: 1;
}
.ring { position: absolute; border-radius: 50%; }
.ring-dashed {
  inset: 0;
  border: 2px dashed rgba(255, 255, 255, 0.35);
  animation: spin 40s linear infinite;
}
.ring-solid {
  inset: 5.5%;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 80px rgba(210, 110, 255, 0.4);
}
.photo-circle {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 30px 70px rgba(10, 4, 28, 0.55);
  background: #2a1646;
}
.photo-circle img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transform: scale(1.08);
  transition: transform 1.2s ease;
}
.visual:hover .photo-circle img { transform: scale(1.16); }
.photo-shade {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(160, 32, 255, 0.28), rgba(10, 6, 30, 0.2) 55%, rgba(10, 6, 30, 0.45));
}

.chip {
  position: absolute;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px 10px 12px;
  border-radius: 999px;
  font-size: clamp(0.78rem, 1.6vw, 0.9rem);
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
  background: rgba(20, 8, 44, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
  animation: bob 5s ease-in-out infinite;
}
.chip svg { width: 18px; height: 18px; color: #e9b3ff; }
.chip-a { top: 8%; right: -3%; }
.chip-b { bottom: 12%; left: -5%; animation-delay: -1.6s; }
.chip-c { bottom: -2%; right: 10%; animation-delay: -3.2s; }

/* ---------- Responsive ---------- */
@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; gap: 44px; }
  .col-visual { order: -1; }
  .col-text { text-align: center; }
  .title { text-align: center; }
  .text-card { text-align: left; }
  .visual { width: min(78vw, 400px); }
  .chip-a { right: -2%; }
  .chip-b { left: -2%; }
}
@media (max-width: 640px) {
  .pillars { grid-template-columns: 1fr; }
  .pillars li { flex-direction: row; align-items: center; gap: 14px; text-align: left; }
  .pillar-icon { flex: 0 0 42px; }
  .text-card::before { display: none; }
  .chip { padding: 8px 13px 8px 10px; }
  .chip svg { width: 16px; height: 16px; }
}
@media (max-width: 380px) {
  .chip-c { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .col-text, .col-visual, .pillars li { opacity: 1 !important; transform: none !important; }
}
</style>