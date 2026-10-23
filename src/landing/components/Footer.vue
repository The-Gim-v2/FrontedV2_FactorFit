<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const year = new Date().getFullYear();

const PHONE = '+52 481 111 1030';
const WHATSAPP = 'https://wa.me/524811111030';
const EMAIL = 'g-nafc@hotmail.com';

/* Ajusta los href a los ids reales de tus secciones */
const LINKS = [
  { label: 'Inicio', href: '#' },
  { label: 'Clases', href: '#clases' },
  { label: 'Comunidad', href: '#comunidad' },
  { label: 'Sedes y horarios', href: '#location' },
];

const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/* Aparición al hacer scroll */
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
  <footer ref="root" :class="['ff', { revealed }]">
    <div class="blob b1" aria-hidden="true"></div>
    <div class="blob b2" aria-hidden="true"></div>
    <svg class="wave" viewBox="0 0 2880 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,60 C240,10 480,110 720,60 C960,10 1200,110 1440,60 C1680,10 1920,110 2160,60 C2400,10 2640,110 2880,60 L2880,0 L0,0 Z" />
    </svg>

    <div class="container">
      <!-- ===== Columnas ===== -->
      <div class="main">
        <div class="col brand">
          <h3 class="logo">FACTOR <span>FIT</span></h3>
          <p class="desc">Entrenamiento funcional, GAP, Zumba, Tabata y mucho más. Asesoría cercana y un ambiente increíble en Ciudad Valles.</p>
          <div class="social">
            <a href="#" class="soc" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.52c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.03 24 18.06 24 12.07z"/></svg>
            </a>
            <a href="#" class="soc" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88"/></svg>
            </a>
            <a :href="WHATSAPP" target="_blank" rel="noopener" class="soc" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.78h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.34-1.66a11.9 11.9 0 0 0 5.63 1.44h.01c6.56 0 11.9-5.34 11.9-11.89 0-3.18-1.24-6.17-3.48-8.41"/></svg>
            </a>
          </div>
        </div>

        <nav class="col" aria-label="Navegación">
          <h4 class="title">Explorar</h4>
          <ul class="links">
            <li v-for="l in LINKS" :key="l.label"><a :href="l.href">{{ l.label }}</a></li>
          </ul>
        </nav>

        <div class="col">
          <h4 class="title">Escríbenos</h4>
          <ul class="links">
            <li><a :href="WHATSAPP" target="_blank" rel="noopener">{{ PHONE }}</a></li>
            <li><a :href="`mailto:${EMAIL}`">{{ EMAIL }}</a></li>
          </ul>
        </div>
      </div>

      <!-- ===== Barra inferior ===== -->
      <div class="bottom">
        <p class="copy">© {{ year }} <strong>Factor Fit</strong>. Todos los derechos reservados.</p>
        <nav class="legal" aria-label="Legal">
          <a href="#">Términos &amp; Condiciones</a>
          <span class="sep" aria-hidden="true">•</span>
          <a href="#">Política de Privacidad</a>
        </nav>
        <button class="top" type="button" aria-label="Volver arriba" @click="goTop">
          Volver arriba
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ff {
  --accent: #a78bfa;
  --accent2: #7c3aed;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(56px, 7vw, 80px) clamp(16px, 4vw, 56px) 24px;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse 60% 50% at 0% 0%, rgba(124, 58, 237, 0.4), transparent 62%),
    radial-gradient(ellipse 55% 45% at 100% 30%, rgba(217, 70, 239, 0.2), transparent 62%),
    linear-gradient(180deg, #170f3d 0%, #0d0922 45%, #07041a 100%);
}

.blob { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -3; pointer-events: none; will-change: transform; }
.b1 { width: 400px; height: 400px; background: rgba(109, 40, 217, 0.45); top: -120px; left: -120px; animation: fa 18s ease-in-out infinite alternate; }
.b2 { width: 340px; height: 340px; background: rgba(217, 70, 239, 0.22); bottom: -120px; right: -100px; animation: fb 22s ease-in-out infinite alternate; }
@keyframes fa { from { transform: translate(0, 0) scale(1); } to { transform: translate(80px, 50px) scale(1.18); } }
@keyframes fb { from { transform: translate(0, 0) scale(1.05); } to { transform: translate(-80px, -40px) scale(0.9); } }

.wave { position: absolute; top: -1px; left: 0; width: 200%; height: clamp(40px, 6vw, 80px); z-index: -1; pointer-events: none; fill: rgba(167, 139, 250, 0.14); animation: slide 28s linear infinite; }
@keyframes slide { to { transform: translateX(-50%); } }

.container { max-width: 1100px; margin: 0 auto; }

.main, .bottom { opacity: 0; transform: translateY(22px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.revealed .main { opacity: 1; transform: none; }
.revealed .bottom { opacity: 1; transform: none; transition-delay: 0.2s; }

.main { display: grid; grid-template-columns: 1.6fr 1fr 1.2fr; gap: clamp(28px, 5vw, 64px); padding-bottom: clamp(32px, 4vw, 48px); align-items: start; }
.col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.logo { margin: 0; font-family: 'Anton', 'Inter', sans-serif; font-weight: 400; font-size: clamp(1.9rem, 3.4vw, 2.5rem); letter-spacing: 1px; line-height: 1; text-transform: uppercase; }
.logo span { background: linear-gradient(135deg, #c4b5fd, #f0abfc); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
.desc { margin: 0; max-width: 38ch; font-size: 0.98rem; line-height: 1.7; color: rgba(255, 255, 255, 0.72); }

.social { display: flex; gap: 12px; margin-top: 4px; }
.soc { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; color: #fff; text-decoration: none; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, box-shadow 0.3s ease; }
.soc svg { width: 20px; height: 20px; }
.soc:hover { transform: translateY(-5px); background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 10px 22px rgba(124, 58, 237, 0.5); }
.soc:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

.title { margin: 0 0 2px; font-size: 0.82rem; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #d8c8ff; }

.links { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.links a { color: rgba(255, 255, 255, 0.85); font-weight: 600; font-size: 0.98rem; text-decoration: none; word-break: break-word; transition: color 0.2s ease, padding-left 0.25s ease; }
.links a:hover { color: #fff; padding-left: 6px; }
.links a:focus-visible, .legal a:focus-visible, .top:focus-visible { outline: 2px solid #fff; outline-offset: 3px; border-radius: 6px; }

.bottom {
  display: flex; align-items: center; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap;
  padding-top: 22px; border-top: 1px solid rgba(255, 255, 255, 0.12); font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);
}
.copy { margin: 0; }
.copy strong { color: rgba(255, 255, 255, 0.9); font-weight: 700; }
.legal { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.legal a { color: rgba(255, 255, 255, 0.7); text-decoration: none; transition: color 0.2s ease; }
.legal a:hover { color: #fff; text-decoration: underline; }
.sep { color: rgba(255, 255, 255, 0.25); }
.top { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 18px; border-radius: 999px; font: 700 0.85rem 'Inter', sans-serif; color: #fff; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.22); transition: background 0.25s ease; }
.top svg { width: 16px; height: 16px; transition: transform 0.25s ease; }
.top:hover { background: rgba(255, 255, 255, 0.2); }
.top:hover svg { transform: translateY(-3px); }

@media (max-width: 800px) {
  .main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .brand { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .main { grid-template-columns: minmax(0, 1fr); gap: 30px; }
  .bottom { flex-direction: column; text-align: center; }
  .legal { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .main, .bottom { opacity: 1 !important; transform: none !important; }
}
</style>