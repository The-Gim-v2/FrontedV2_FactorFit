<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

/* ================= CONFIGURACIÓN ================= */
const INSTAGRAM_USER = 'factorfit_cdvalles';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USER}/`;
const FACEBOOK_URL = ''; // URL de la página de Facebook (vacío = no se muestra el botón)

// URL de tu endpoint o del JSON de un servicio de feed. Vacío = se usan las fotos de abajo.
const FEED_URL = '';
const SLOTS = 8; // fotos que forman el collage

// Tus fotos mientras no haya feed conectado. Agrega aquí las que quieras (ruta o URL).
// Si hay menos de 8, se repiten con recortes distintos para que el collage no quede vacío.
const FALLBACK_POSTS: Post[] = [
  { id: 'p1', image: 'https://i.ibb.co/272HW3wN/fondo-landing.jpg', link: INSTAGRAM_URL, caption: 'Clase grupal' },
];
/* ================================================= */

interface Post { id: string; image: string; link: string; caption?: string }
interface Slot extends Post { pos: string; zoom: number; repeat: boolean }

const posts = ref<Post[]>([]);
const loading = ref(false);
const failed = ref(false);

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

const CROPS = ['center', '18% 40%', '82% 30%', '50% 90%', '8% 75%', '72% 62%', '35% 15%', '62% 8%'];
const ZOOMS = [1, 1.35, 1.3, 1.45, 1.4, 1.5, 1.35, 1.45];

const slots = computed<Slot[]>(() => {
  const base = posts.value.length ? posts.value : FALLBACK_POSTS;
  if (!base.length) return [];
  return Array.from({ length: SLOTS }, (_, i): Slot => {
    const p = base[i % base.length]!;
    const repeat = i >= base.length;
    return {
      ...p,
      id: repeat ? `${p.id}-r${i}` : p.id,
      pos: repeat ? (CROPS[i % CROPS.length] ?? 'center') : 'center',
      zoom: repeat ? (ZOOMS[i % ZOOMS.length] ?? 1) : 1,
      repeat
    };
  });
});

/* ---------- Aparición ---------- */
const root = ref<HTMLElement | null>(null);
const revealed = ref(false);
let io: IntersectionObserver | null = null;

onMounted(() => {
  loadFeed();
  if (!('IntersectionObserver' in window) || !root.value) { revealed.value = true; return; }
  io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { revealed.value = true; io?.disconnect(); } }, { threshold: 0.1 });
  io.observe(root.value);
});
onUnmounted(() => io?.disconnect());
</script>

<template>
  <section id="comunidad" ref="root" :class="['collage-section', { revealed }]">
    <!-- Fondo animado -->
    <div class="aurora" aria-hidden="true"></div>
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="orb orb-c"></div>
    <div class="watermark" aria-hidden="true">FACTOR FIT</div>
    <div class="bg-ring bg-ring-1" aria-hidden="true"></div>
    <div class="bg-ring bg-ring-2" aria-hidden="true"></div>
    <div class="grain"></div>
    <svg class="spark s1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="spark s2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="spark s3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="bg-float bf1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
    <svg class="bg-float bf2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
    <svg class="bg-float bf3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"/></svg>
    <svg class="bg-float bf4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
    <svg class="bg-float bf5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
    <svg class="bg-float bf6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>

    <div class="container">
      <header class="head">
        <h2 class="title">Así se vive<br />Factor Fit</h2>
        <p class="subtitle">Momentos reales de quienes entrenan con nosotros.</p>
        <a class="handle" :href="INSTAGRAM_URL" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
          @{{ INSTAGRAM_USER }}
        </a>
      </header>

      <!-- COLLAGE -->
      <div class="collage">
        <template v-if="loading">
          <div v-for="k in SLOTS" :key="k" :class="['polaroid', 'skeleton', `p${k}`]"></div>
        </template>

        <template v-else>
          <a
            v-for="(s, i) in slots"
            :key="s.id"
            :class="['polaroid', `p${i + 1}`]"
            :href="s.link"
            target="_blank"
            rel="noopener"
            :style="{ '--delay': `${i * 0.09}s` }"
            :aria-label="s.caption || 'Ver publicación en Instagram'"
          >
            <span class="tape" aria-hidden="true"></span>
            <span class="photo">
              <img
                :src="s.image"
                :alt="s.caption || 'Publicación de Factor FIT'"
                :style="{ objectPosition: s.pos, '--zoom': s.zoom }"
                loading="lazy"
                draggable="false"
                referrerpolicy="no-referrer"
              />
              <span class="shine"></span>
            </span>
            <span class="caption">
              <span class="cap-text">{{ s.caption || `@${INSTAGRAM_USER}` }}</span>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.1c0 5.8-7.5 10.2-7.5 10.2Z"/></svg>
            </span>
          </a>
        </template>

        <!-- Sello giratorio -->
        <a class="seal" :href="INSTAGRAM_URL" target="_blank" rel="noopener" aria-label="Síguenos en Instagram">
          <svg class="seal-ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="seal-path" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
            </defs>
            <text>
              <textPath href="#seal-path" startOffset="0">SÍGUENOS EN INSTAGRAM • FACTOR FIT • COMUNIDAD •</textPath>
            </text>
          </svg>
          <span class="seal-core">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
          </span>
        </a>
      </div>

      <p v-if="failed" class="note">No pudimos cargar las publicaciones ahora. Míralas directo en Instagram.</p>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

.collage-section {
  position: relative;
  scroll-margin-top: 84px;
  padding: clamp(64px, 9vw, 120px) clamp(16px, 5vw, 64px) clamp(56px, 8vw, 100px);
  overflow: hidden;
  isolation: isolate;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse 70% 55% at 100% 0%, #b44ce6 0%, rgba(180, 76, 230, 0) 60%),
    linear-gradient(200deg, #131526 0%, #3a1d68 55%, #6c2f9c 100%);
}
.orb { position: absolute; border-radius: 50%; filter: blur(90px); z-index: -3; pointer-events: none; }
.orb-a { width: 440px; height: 440px; background: rgba(160, 32, 255, 0.3); top: -120px; left: -100px; animation: drift 17s ease-in-out infinite alternate; }
.orb-b { width: 400px; height: 400px; background: rgba(60, 90, 255, 0.24); top: 45%; right: -120px; animation: drift 20s ease-in-out infinite alternate-reverse; }
.orb-c { width: 340px; height: 340px; background: rgba(255, 110, 230, 0.22); bottom: -100px; left: 30%; animation: drift 23s ease-in-out infinite alternate; }
.grain { position: absolute; inset: 0; z-index: -1; opacity: 0.05; pointer-events: none; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 3px 3px; }
@keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(60px, -44px) scale(1.12); } }

/* ---------- Fondo animado ---------- */
/* Resplandor que gira muy lento */
.aurora {
  position: absolute; z-index: -4; pointer-events: none;
  left: 50%; top: 50%;
  width: 150%; aspect-ratio: 1;
  translate: -50% -50%;
  background: conic-gradient(from 0deg, rgba(160, 32, 255, 0), rgba(180, 76, 230, 0.5), rgba(255, 110, 200, 0.38), rgba(120, 70, 255, 0.45), rgba(160, 32, 255, 0));
  filter: blur(90px);
  opacity: 0.55;
  animation: bg-spin 45s linear infinite;
}
/* Marca de agua gigante que se desliza */
.watermark {
  position: absolute; z-index: -2; pointer-events: none; white-space: nowrap;
  left: 0; top: 50%;
  font: 400 clamp(8rem, 28vw, 24rem) 'Anton', 'Inter', sans-serif;
  line-height: 1; text-transform: uppercase;
  color: transparent;
  -webkit-text-stroke: 2px rgba(243, 211, 255, 0.07);
  transform: translate(-8%, -50%);
  animation: bg-slide 60s linear infinite alternate;
}
@keyframes bg-slide { from { transform: translate(-8%, -50%); } to { transform: translate(-36%, -50%); } }
/* Anillos concéntricos que giran */
.bg-ring { position: absolute; z-index: -2; pointer-events: none; border-radius: 50%; aspect-ratio: 1; right: -170px; top: 12%; }
.bg-ring-1 { width: 520px; border: 1px dashed rgba(243, 211, 255, 0.28); animation: bg-spin 70s linear infinite; }
.bg-ring-2 { width: 380px; margin: 70px; border: 1px solid rgba(243, 211, 255, 0.16); animation: bg-spin 50s linear infinite reverse; }
@keyframes bg-spin { to { transform: rotate(360deg); } }

/* Destellos (SVG) */
.spark { position: absolute; z-index: -1; color: rgba(243, 211, 255, 0.8); pointer-events: none; animation: twinkle 3.4s ease-in-out infinite; }
.s1 { top: 14%; left: 7%; width: 26px; height: 26px; }
.s2 { top: 52%; right: 6%; width: 20px; height: 20px; animation-delay: -1.2s; }
.s3 { bottom: 12%; left: 12%; width: 16px; height: 16px; animation-delay: -2.2s; }
@keyframes twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.25) rotate(20deg); } }

/* Iconos SVG (corazones, cámara, destellos) que suben flotando */
.bg-float { position: absolute; z-index: -1; pointer-events: none; opacity: 0; animation: bg-rise 12s ease-in infinite; }
.bf1 { left: 5%;  bottom: 4%; width: 26px; height: 26px; color: #ff7ad1; animation-delay: 0s; }
.bf2 { left: 24%; bottom: 2%; width: 24px; height: 24px; color: #c9a2ff; animation-delay: -3.5s; }
.bf3 { left: 46%; bottom: 3%; width: 22px; height: 22px; color: #f3d3ff; animation-delay: -6s; }
.bf4 { left: 68%; bottom: 2%; width: 20px; height: 20px; color: #ff9be0; animation-delay: -1.5s; }
.bf5 { right: 8%; bottom: 4%; width: 28px; height: 28px; color: #ffd6f4; animation-delay: -8s; }
.bf6 { right: 28%; bottom: 3%; width: 22px; height: 22px; color: #b9a4ff; animation-delay: -4.5s; }
@keyframes bg-rise {
  0%   { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 0; }
  12%  { opacity: 0.85; }
  100% { transform: translateY(-560px) translateX(30px) scale(1.2) rotate(25deg); opacity: 0; }
}

.container { max-width: 1120px; margin: 0 auto; }

/* ---------- Cabecera ---------- */
.head { text-align: center; margin-bottom: clamp(30px, 5vw, 56px); opacity: 0; transform: translateY(22px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.revealed .head { opacity: 1; transform: none; }
.title {
  margin: 0;
  font-family: 'Permanent Marker', 'Inter', cursive;
  font-weight: 400;
  font-size: clamp(2.3rem, 8vw, 4.6rem);
  line-height: 1.05;
  letter-spacing: 1px;
  color: #f3d3ff;
  text-shadow: 0 3px 0 rgba(40, 10, 84, 0.65), 0 10px 34px rgba(20, 8, 44, 0.55);
}
.subtitle { margin: 14px 0 14px; font-size: clamp(0.95rem, 2.4vw, 1.1rem); color: rgba(255, 255, 255, 0.82); }
.handle {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: 999px; text-decoration: none; color: #fff;
  font-weight: 700; font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: background 0.25s ease, transform 0.25s ease;
}
.handle svg { width: 18px; height: 18px; }
.handle:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

/* ---------- Collage ---------- */
.collage {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-rows: clamp(120px, 15.5vw, 190px);
  gap: clamp(6px, 1.2vw, 14px);
  padding: 0 clamp(0px, 2vw, 24px);
}

.polaroid {
  --r: 0deg;
  --lift: 0px;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: clamp(6px, 1vw, 11px) clamp(6px, 1vw, 11px) 0;
  background: #fbf8fd;
  color: #2a1550;
  text-decoration: none;
  border-radius: 6px;
  box-shadow: 0 22px 46px rgba(8, 3, 26, 0.55), 0 2px 0 rgba(255, 255, 255, 0.6) inset;
  transform: translateY(calc(var(--lift) + 40px)) rotate(calc(var(--r) * 2.4)) scale(0.85);
  opacity: 0;
  transition:
    transform 0.9s cubic-bezier(0.2, 0.9, 0.3, 1.15) var(--delay, 0s),
    opacity 0.7s ease var(--delay, 0s),
    box-shadow 0.35s ease;
  will-change: transform;
}
.revealed .polaroid { opacity: 1; transform: translateY(var(--lift)) rotate(var(--r)); }
.revealed .polaroid:hover,
.revealed .polaroid:focus-visible {
  z-index: 30;
  transform: translateY(calc(var(--lift) - 10px)) rotate(0deg) scale(1.08);
  box-shadow: 0 34px 70px rgba(8, 3, 26, 0.7), 0 0 40px rgba(190, 90, 255, 0.45);
  transition-delay: 0s;
}
.polaroid:focus-visible { outline: 2px solid #e0b3ff; outline-offset: 4px; }

.tape {
  position: absolute; top: -9px; left: 50%;
  width: clamp(44px, 7vw, 76px); height: clamp(16px, 2.4vw, 24px);
  transform: translateX(-50%) rotate(-3deg);
  background: linear-gradient(90deg, rgba(243, 190, 255, 0.75), rgba(190, 160, 255, 0.7));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 2;
  opacity: 0.9;
}
.photo { position: relative; flex: 1; min-height: 0; overflow: hidden; border-radius: 3px; background: #2a1646; }
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(var(--zoom, 1)); transition: transform 0.9s ease; }
.polaroid:hover .photo img { transform: scale(calc(var(--zoom, 1) * 1.08)); }
.shine { position: absolute; inset: 0; background: linear-gradient(130deg, rgba(255, 255, 255, 0.22), transparent 40%); pointer-events: none; }

.caption {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  height: clamp(24px, 3.4vw, 38px);
  padding: 0 4px;
  font: 700 clamp(0.62rem, 1.1vw, 0.8rem) 'Inter', sans-serif;
  color: #5b3a9a;
}
.cap-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.caption svg { flex: 0 0 auto; width: clamp(12px, 1.6vw, 17px); height: clamp(12px, 1.6vw, 17px); color: #e0457b; transition: transform 0.3s ease; }
.polaroid:hover .caption svg { transform: scale(1.35); }

/* Distribución en escritorio (6 columnas) */
.p1 { grid-column: 1 / 3; grid-row: 1 / 3; --r: -4deg; }
.p2 { grid-column: 3 / 5; grid-row: 1 / 2; --r: 3deg; --lift: 14px; z-index: 2; }
.p3 { grid-column: 5 / 7; grid-row: 1 / 3; --r: -2.5deg; }
.p4 { grid-column: 3 / 5; grid-row: 2 / 4; --r: -3deg; z-index: 3; }
.p5 { grid-column: 1 / 3; grid-row: 3 / 4; --r: 4deg; --lift: -6px; }
.p6 { grid-column: 5 / 7; grid-row: 3 / 4; --r: 2.5deg; --lift: -4px; }
.p7 { grid-column: 2 / 4; grid-row: 4 / 5; --r: 3deg; --lift: 8px; }
.p8 { grid-column: 4 / 6; grid-row: 4 / 5; --r: -3deg; --lift: 4px; }

.skeleton { opacity: 1 !important; transform: rotate(var(--r)) !important; background: linear-gradient(100deg, #2a1646 30%, #3c2468 50%, #2a1646 70%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* Sello giratorio (nombres propios para que no choquen con otros estilos) */
.seal {
  position: absolute; z-index: 40;
  left: 50%; top: 50%;
  width: clamp(98px, 14vw, 150px); aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display: grid; place-items: center;
  text-decoration: none; color: #fff;
  background: linear-gradient(135deg, #d62976 0%, #962fbf 55%, #4f5bd5 100%);
  box-shadow: 0 20px 50px rgba(120, 20, 200, 0.6), 0 0 0 6px rgba(255, 255, 255, 0.18);
  opacity: 0; scale: 0.4;
  transition: opacity 0.7s 0.9s ease, scale 0.9s 0.9s cubic-bezier(0.2, 0.9, 0.3, 1.3), box-shadow 0.3s ease;
}
.revealed .seal { opacity: 1; scale: 1; }
.seal:hover { box-shadow: 0 26px 60px rgba(214, 41, 118, 0.7), 0 0 0 8px rgba(255, 255, 255, 0.3); }
.seal-ring { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; outline: 0; background: none; animation: seal-spin 18s linear infinite; }
.seal-ring text { font: 800 15px 'Inter', sans-serif; letter-spacing: 3.2px; fill: #fff; }
.seal-core { width: 38%; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); transition: transform 0.3s ease; }
.seal-core svg { width: 58%; height: 58%; }
.seal:hover .seal-core { transform: scale(1.15) rotate(-8deg); }
.seal:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
@keyframes seal-spin { to { transform: rotate(360deg); } }

.note { text-align: center; margin: 22px 0 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.75); }

.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: clamp(30px, 5vw, 52px); }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 52px; padding: 0 30px; border-radius: 999px; text-decoration: none; color: #fff;
  font: 700 1rem 'Inter', sans-serif;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.btn-primary { background: linear-gradient(135deg, #bb44ff, #8412ff); box-shadow: 0 12px 30px rgba(138, 18, 255, 0.55); }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 18px 38px rgba(138, 18, 255, 0.7); }
.btn-primary svg { transition: transform 0.25s ease; }
.btn-primary:hover svg { transform: translateX(4px); }
.btn-dark { background: rgba(15, 20, 34, 0.9); border: 1px solid rgba(255, 255, 255, 0.16); }
.btn-dark:hover { transform: translateY(-3px); background: #222d47; }
.btn:focus-visible, .handle:focus-visible { outline: 2px solid #e0b3ff; outline-offset: 3px; }

/* ---------- Tablet ---------- */
@media (max-width: 1000px) and (min-width: 761px) {
  .collage { grid-auto-rows: clamp(110px, 17vw, 160px); }
}

/* ---------- Móvil ---------- */
@media (max-width: 760px) {
  .collage-section { padding-bottom: 56px; }
  .collage {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: clamp(150px, 46vw, 230px);
    gap: 18px 12px;
    padding: 0 4px;
  }
  .p1, .p2, .p3, .p4, .p5, .p6, .p7, .p8 { grid-column: auto; grid-row: auto; z-index: auto; }
  /* La primera y la última ocupan todo el ancho: no queda ningún hueco */
  .p1 { grid-column: 1 / 3; --r: -2deg; --lift: 0px; }
  .p2 { --r: 3deg; --lift: 6px; }
  .p3 { --r: -3deg; --lift: 0px; }
  .p4 { --r: 2.5deg; --lift: 6px; }
  .p5 { --r: -3.5deg; --lift: 0px; }
  .p6 { --r: 3deg; --lift: 4px; }
  .p7 { --r: -2deg; --lift: 0px; }
  .p8 { grid-column: 1 / 3; --r: 2deg; --lift: 4px; }
  .p1 .caption, .p8 .caption { height: 32px; }
  /* El sello va como sticker sobre la esquina de la primera foto, sin tocar el usuario de Instagram */
  .seal {
    width: 84px;
    left: auto; right: 10px; top: 14px;
    transform: rotate(8deg);
    box-shadow: 0 12px 30px rgba(120, 20, 200, 0.55), 0 0 0 4px rgba(255, 255, 255, 0.2);
  }
  .seal-ring text { font-size: 14px; letter-spacing: 2.6px; }
  .btn { width: 100%; }
  .bg-ring, .bg-float { display: none; }
  .aurora { width: 260%; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .head, .polaroid, .seal { opacity: 1 !important; scale: 1 !important; }
  .bg-float, .bg-ring, .watermark { display: none; }
  .polaroid { transform: translateY(var(--lift)) rotate(var(--r)) !important; }
}
</style>