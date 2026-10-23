<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
/* Ajusta la ruta a donde tengas el logo */
import logoImg from '@/assets/factor_fit-25.webp';

const REGISTER_ROUTE = '/Record'; // cambia si el registro de atleta usa otra ruta

const isMenuOpen = ref(false);
const scrolled = ref(false);
const activeId = ref('');
const header = ref<HTMLElement | null>(null);
const route = useRoute();

/* Ajusta los ids si tus secciones usan otros */
const NAV_LINKS = [
  { id: 'sobre-nosotros', label: 'Sobre nosotros' },
  { id: 'comunidad', label: 'Comunidad' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'location', label: 'Sedes y horarios' },
];

/* Cierra el menú, espera a que se libere el scroll y DESPUÉS se desplaza.
   Hacer ambas cosas a la vez era lo que hacía que se trabara. */
const scrollToSection = async (id: string) => {
  isMenuOpen.value = false;
  await nextTick();
  const el = document.getElementById(id);
  if (el) {
    const offset = (header.value?.offsetHeight ?? 70) + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const goTop = async () => {
  isMenuOpen.value = false;
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };
const closeMenu = () => { isMenuOpen.value = false; };

/* Un solo cambio de estado por scroll (evita re-renders innecesarios) */
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const v = window.scrollY > 12;
    if (v !== scrolled.value) scrolled.value = v;
    ticking = false;
  });
};
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };

/* Bloquea el scroll del fondo mientras el menú está abierto */
watch(isMenuOpen, open => {
  document.documentElement.style.overflow = open ? 'hidden' : '';
});

/* Si cambias de página, cierra el menú */
watch(() => route.fullPath, closeMenu);

/* Si la pantalla pasa a escritorio con el menú abierto, ciérralo */
let mq: MediaQueryList | null = null;
const onMq = (e: MediaQueryListEvent) => { if (e.matches) closeMenu(); };

/* Resalta el enlace de la sección que se está viendo */
let io: IntersectionObserver | null = null;

onMounted(() => {
  scrolled.value = window.scrollY > 12;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onKey);

  mq = window.matchMedia('(min-width: 961px)');
  mq.addEventListener('change', onMq);

  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) activeId.value = e.target.id; }),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV_LINKS.forEach(l => {
      const el = document.getElementById(l.id);
      if (el) io!.observe(el);
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('keydown', onKey);
  mq?.removeEventListener('change', onMq);
  io?.disconnect();
  document.documentElement.style.overflow = '';
});
</script>

<template>
  <header ref="header" :class="['nav-wrapper', { scrolled, 'menu-open': isMenuOpen }]">
    <div class="nav-container">
      <button class="logo-section" type="button" aria-label="Ir al inicio" @click="goTop">
        <img class="logo-img" :src="logoImg" alt="Factor Fit" />
        <span class="logo-text">FACTOR <span class="text-accent">FIT</span></span>
      </button>

      <nav class="desktop-links" aria-label="Principal">
        <button
          v-for="link in NAV_LINKS"
          :key="link.id"
          :class="['nav-link', { active: activeId === link.id }]"
          @click="scrollToSection(link.id)"
        >
          {{ link.label }}
        </button>
      </nav>

      <div class="auth-actions">
        <router-link to="/login" class="login-link">Iniciar sesión</router-link>
        <router-link :to="REGISTER_ROUTE" class="register-btn">Registrarte</router-link>
      </div>

      <button
        class="mobile-toggle"
        type="button"
        :aria-label="isMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-menu"
        @click="toggleMenu"
      >
        <div :class="['hamburger', { 'is-active': isMenuOpen }]">
          <span></span><span></span><span></span>
        </div>
      </button>
    </div>

    <!-- Fondo para tocar fuera y cerrar -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="mobile-scrim" @click="closeMenu"></div>
    </Transition>

    <Transition name="menu">
      <nav v-if="isMenuOpen" id="mobile-menu" class="mobile-menu" aria-label="Menú móvil">
        <button
          v-for="link in NAV_LINKS"
          :key="link.id"
          type="button"
          :class="['mobile-link', { active: activeId === link.id }]"
          @click="scrollToSection(link.id)"
        >
          {{ link.label }}
        </button>

        <div class="mobile-auth">
          <router-link to="/login" class="mobile-login" @click="closeMenu">Iniciar sesión</router-link>
          <router-link :to="REGISTER_ROUTE" class="mobile-register" @click="closeMenu">Registrarte</router-link>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.nav-wrapper {
  --accent: #a78bfa;
  --accent2: #7c3aed;
  --header-h: 72px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(13, 9, 34, 0.6);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.nav-wrapper.scrolled {
  background: rgba(13, 9, 34, 0.94);
  box-shadow: 0 10px 30px rgba(5, 2, 20, 0.5);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px clamp(16px, 4vw, 60px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

/* ---------- Logo ---------- */
.logo-section {
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  user-select: none;
  color: #fff;
}
.logo-section:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 999px; }
.logo-img {
  width: clamp(40px, 5vw, 48px);
  height: clamp(40px, 5vw, 48px);
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 16px rgba(5, 2, 20, 0.5);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.logo-section:hover .logo-img { transform: rotate(-6deg) scale(1.06); }
.logo-text {
  font-family: 'Anton', 'Inter', sans-serif;
  font-size: clamp(20px, 4vw, 26px);
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
}
.text-accent {
  background: linear-gradient(135deg, #c4b5fd, #f0abfc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(167, 139, 250, 0.45));
}

/* ---------- Enlaces (solo texto) ---------- */
.desktop-links {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2.2vw, 34px);
}
.nav-link {
  position: relative;
  background: transparent;
  border: none;
  padding: 8px 2px;
  color: rgba(255, 255, 255, 0.72);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.25s ease;
}
/* Barra inferior */
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  box-shadow: 0 2px 10px rgba(124, 58, 237, 0.6);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link:hover { color: #fff; }
.nav-link:hover::after { transform: scaleX(0.4); }
.nav-link.active { color: #fff; }
.nav-link.active::after { transform: scaleX(1); }
.nav-link:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 4px; }

/* ---------- Acciones ---------- */
.auth-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: clamp(14px, 1.8vw, 24px);
}
.login-link {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.25s ease;
}
.login-link:hover { color: var(--accent); }

.register-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  padding: 12px 26px;
  border-radius: 999px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}
.register-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(124, 58, 237, 0.6); }
.register-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

/* ---------- Hamburguesa ---------- */
.mobile-toggle {
  display: none;
  justify-self: end;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 12px;
  margin: -12px; /* área de toque grande sin agrandar el header */
}
.mobile-toggle:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 8px; }
.hamburger { width: 24px; height: 18px; display: flex; flex-direction: column; justify-content: space-between; }
.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.2s ease;
}
.hamburger.is-active span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
.hamburger.is-active span:nth-child(2) { opacity: 0; }
.hamburger.is-active span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

/* ---------- Menú móvil ---------- */
.mobile-scrim {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100dvh;
  background: rgba(5, 2, 20, 0.6);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  /* Fondo sólido: sin blur extra, que es lo que más pesa en móviles */
  background: #0d0922;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(5, 2, 20, 0.65);
  /* Si la pantalla es baja, el menú hace scroll por dentro */
  max-height: calc(100dvh - var(--header-h));
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  will-change: transform, opacity;
}

.mobile-link {
  position: relative;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: left;
  padding: 16px 0 16px 0;
  min-height: 52px;
  cursor: pointer;
  transition: color 0.2s ease;
}
/* Indicador lateral (misma idea que la barra del escritorio) */
.mobile-link::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--accent), var(--accent2));
  transform: scaleY(0);
  transition: transform 0.25s ease;
}
.mobile-link.active { color: var(--accent); }
.mobile-link.active::before { transform: scaleY(1); }
.mobile-link:active { color: #fff; }

.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.mobile-login, .mobile-register {
  text-align: center;
  padding: 15px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  text-decoration: none;
}
.mobile-login { background: rgba(255, 255, 255, 0.08); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
.mobile-register {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.45);
}

/* Transiciones: solo opacity y transform (baratas para la GPU) */
.menu-enter-active, .menu-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translate3d(0, -8px, 0); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1180px) {
  .desktop-links { gap: 16px; }
  .nav-link { font-size: 12.5px; }
  .login-link { display: none; } /* sigue disponible en el menú móvil */
}
@media (max-width: 960px) {
  /* En móvil el header va casi sólido: el blur constante es lo que lo hacía trabarse */
  .nav-wrapper {
    background: rgba(13, 9, 34, 0.96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .nav-container { display: flex; justify-content: space-between; }
  .desktop-links, .auth-actions { display: none; }
  .mobile-toggle { display: block; }
}
@media (min-width: 961px) {
  .mobile-menu, .mobile-scrim { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
</style>