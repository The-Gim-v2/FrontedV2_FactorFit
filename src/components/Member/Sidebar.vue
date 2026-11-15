<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="gym-selector">
        <div class="header-main">
          <svg class="icon-small" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <div class="gym-titles-container">
            <span class="gym-label">{{ t('currentBranch') }}</span>
            <span class="gym-title">{{ selectedGym }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-scroll">

      <router-link to="/Member/profile" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="nav-text">{{ t('profile') }}</span>
        </div>
      </router-link>
      
      <!-- Dashboard -->
      <router-link to="/Member/dashboard" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="nav-text">{{ t('home') }}</span>
        </div>
      </router-link>

      <!-- Gimnasios y Sedes -->
      <router-link to="/Member/gyms" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="nav-text">{{ t('gymsAndVenues') }}</span>
        </div>
      </router-link>

      <!-- Rutinas -->
      <div class="nav-group" :class="{ 'is-open': openSection === 'routines' }">
        <div class="nav-item group-header" @click="toggleGroup('routines')">
          <div class="nav-content">
            <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M4 6.5V4h3v2.5M17 6.5V4h3v2.5M4 17.5V20h3v-2.5M17 17.5V20h3v-2.5"/>
            </svg>
            <span class="nav-text">{{ t('routines') }}</span>
          </div>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="submenu">
          <router-link to="/Member/routines" class="sub-item">
            <svg class="sub-icon color-blue" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <span>{{ t('exploreRoutines') }}</span>
          </router-link>
          <router-link to="/Member/my-routines" class="sub-item">
            <svg class="sub-icon color-purple" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span>{{ t('myRoutines') }}</span>
          </router-link>
          <router-link to="/Member/trainer-routines" class="sub-item">
            <svg class="sub-icon color-blue" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{{ t('trainerRoutines') }}</span>
          </router-link>
        </div>
      </div>

      <!-- Salud y Nutrición -->
      <div class="nav-group" :class="{ 'is-open': openSection === 'tools' }">
        <div class="nav-item group-header" @click="toggleGroup('tools')">
          <div class="nav-content">
            <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span class="nav-text">{{ t('healthAndNutrition') }}</span>
          </div>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="submenu">
          <router-link to="/Member/body-calculator" class="sub-item">
            <svg class="sub-icon color-blue" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>
            </svg>
            <span>{{ t('bodyCalculator') }}</span>
          </router-link>
          <router-link to="/Member/nutrition-plan" class="sub-item">
            <svg class="sub-icon color-purple" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            <span>{{ t('nutritionPlan') }}</span>
          </router-link>
        </div>
      </div>

      <!-- Otros -->
      <router-link to="/Member/classes" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="nav-text">{{ t('classesAndBookings') }}</span>
        </div>
      </router-link>

      <router-link to="/Member/trainers" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="nav-text">{{ t('trainers') }}</span>
        </div>
      </router-link>

      <router-link to="/Member/statistics" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span class="nav-text">{{ t('statistics') }}</span>
        </div>
      </router-link>

      <!-- Pagos -->
      <div class="nav-group" :class="{ 'is-open': openSection === 'payments' }">
        <div class="nav-item group-header" @click="toggleGroup('payments')">
          <div class="nav-content">
            <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span class="nav-text">{{ t('membershipAndPayments') }}</span>
          </div>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="submenu">
          <router-link to="/Member/membership" class="sub-item">
            <svg class="sub-icon color-blue" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>{{ t('membershipStatus') }}</span>
          </router-link>
          <router-link to="/Member/payments-history" class="sub-item">
            <svg class="sub-icon color-purple" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>{{ t('paymentsHistory') }}</span>
          </router-link>
        </div>
      </div>

      <router-link to="/Member/settings" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span class="nav-text">{{ t('settings') }}</span>
        </div>
      </router-link>

      <router-link to="/Member/help" class="nav-item">
        <div class="nav-content">
          <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span class="nav-text">{{ t('help') }}</span>
        </div>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <button class="btn-logout" @click="handleLogout">
        <svg class="logout-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>{{ t('logout') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { aplicarAparienciaLocalMember } from './memberAppearance.js';
import { useRouter } from 'vue-router';
import { sesionMiembro, cargarSesionMiembro } from './memberSesion.js'; 

const router = useRouter(); 
const openSection = ref<string | null>(null);
const selectedGym = computed(() => sesionMiembro.gimnasio?.sede || 'Sin sede registrada');

const currentLang = ref<string>(localStorage.getItem('member-idioma') || 'es');
const handleLangChange = (e: Event): void => {
  const customEvent = e as CustomEvent<{ idioma?: string }>;
  if (customEvent.detail?.idioma) currentLang.value = customEvent.detail.idioma;
};




// Función para aplicar los estilos globales del tema
const aplicarEstilosGlobales = () => aplicarAparienciaLocalMember();

onMounted(() => {
  aplicarEstilosGlobales();
  void cargarSesionMiembro().catch(() => {});
  window.addEventListener('language-changed', handleLangChange as EventListener);
  window.addEventListener('app-settings-updated', aplicarEstilosGlobales);
});

onUnmounted(() => {
  window.removeEventListener('language-changed', handleLangChange as EventListener);
  window.removeEventListener('app-settings-updated', aplicarEstilosGlobales);
});

const langData: Record<'es' | 'en', Record<string, string>> = {
  es: {
    currentBranch: 'Sucursal Actual',
    home: 'Inicio',
    gymsAndVenues: 'Gimnasios y Sedes',
    routines: 'Rutinas',
    exploreRoutines: 'Explorar Rutinas',
    myRoutines: 'Mis Rutinas',
    trainerRoutines: 'Rutinas de Entrenador',
    healthAndNutrition: 'Salud y Nutrición',
    bodyCalculator: 'Calculadora Corporal',
    nutritionPlan: 'Plan Nutricional',
    classesAndBookings: 'Clases y Reservas',
    trainers: 'Entrenadores',
    statistics: 'Estadísticas',
    membershipAndPayments: 'Membresía y Pagos',
    membershipStatus: 'Estado de Membresía',
    paymentsHistory: 'Historial de Pagos',
    profile: 'Perfil',
    settings: 'Configuración',
    help: 'Ayuda',
    logout: 'Cerrar Sesión'
  },
  en: {
    currentBranch: 'Current Branch',
    home: 'Home',
    gymsAndVenues: 'Gyms & Venues',
    routines: 'Routines',
    exploreRoutines: 'Explore Routines',
    myRoutines: 'My Routines',
    trainerRoutines: 'Trainer Routines',
    healthAndNutrition: 'Health & Nutrition',
    bodyCalculator: 'Body Calculator',
    nutritionPlan: 'Nutrition Plan',
    classesAndBookings: 'Classes & Bookings',
    trainers: 'Trainers',
    statistics: 'Statistics',
    membershipAndPayments: 'Membership & Payments',
    membershipStatus: 'Membership Status',
    paymentsHistory: 'Payments History',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    logout: 'Log Out'
  }
};

const t = (key: string): string => {
  return langData[currentLang.value as 'es' | 'en']?.[key] || key;
};

const toggleGroup = (section: string) => {
  openSection.value = openSection.value === section ? null : section;
};

const handleLogout = (): void => {
  localStorage.removeItem('user_role');
  localStorage.removeItem('token'); 
  localStorage.removeItem('user');
  
  router.replace({ name: 'login' }); 
};


const cambiarIdioma = (nuevoIdioma: string) => {
  // 1. Guardar con la clave que lee el sidebar
  localStorage.setItem('member-idioma', nuevoIdioma);

  // 2. Disparar el evento global para actualizar en tiempo real
  window.dispatchEvent(
    new CustomEvent('language-changed', {
      detail: { idioma: nuevoIdioma }
    })
  );
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--bg-dashboard, linear-gradient(140deg, #070b12 0%, #111827 50%, #1e0b0b 100%));
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  color: var(--color-texto-general, #f8fafc);
  position: relative;
}

.sidebar {
  width: 280px;
  background: var(--bg-cards, #0a0a0a);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  height: 100vh;
  max-height: 100dvh; 
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-cards, rgba(255, 255, 255, 0.06));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
}

/* --- SELECTOR DE SUCURSALES --- */
.gym-selector {
  position: relative;
  cursor: pointer;
  border-radius: var(--app-border-radius, 12px);
  background: var(--bg-input, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-input, rgba(255, 255, 255, 0.06));
  transition: all 0.2s ease;
}

.gym-selector:hover {
  background: var(--bg-input-focus, rgba(255, 255, 255, 0.06));
  border-color: rgba(59, 130, 246, 0.3);
}

.sidebar-header .header-main {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.gym-titles-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.gym-label {
  font-size: 0.7rem;
  color: var(--color-etiquetas, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.gym-title { 
  font-weight: 600; 
  font-size: 0.95rem; 
  color: var(--color-titulos, #f8fafc);
}

.gym-arrow {
  width: 18px;
  height: 18px;
  color: var(--color-etiquetas, #64748b);
  transition: transform 0.25s ease;
}

.gym-selector.is-open .gym-arrow {
  transform: rotate(180deg);
  color: var(--color-botones, #3b82f6);
}

.gym-dropdown-menu {
  max-height: 0;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0 0 var(--app-border-radius, 12px) var(--app-border-radius, 12px);
  transition: max-height 0.25s ease;
}

.gym-selector.is-open .gym-dropdown-menu {
  max-height: 150px;
  border-top: 1px solid var(--border-cards, rgba(255, 255, 255, 0.06));
}

.gym-option {
  padding: 10px 16px;
  font-size: 0.88rem;
  color: var(--color-etiquetas, #94a3b8);
  transition: background 0.2s, color 0.2s;
}

.gym-option:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-texto-general, #ffffff);
}

.gym-option.active {
  color: var(--color-botones, #3b82f6);
  font-weight: 600;
  background: rgba(59, 130, 246, 0.08);
}

.sidebar-header {
  padding: 20px; 
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border-cards, rgba(255, 255, 255, 0.04));
  flex-shrink: 0; 
}

.icon-small {
  width: 20px;
  height: 20px;
  color: var(--color-botones, #3b82f6);
}

/* --- SCROLL MENU --- */
.menu-scroll { 
  flex: 1; 
  overflow-y: auto; 
  padding: 12px;
}

/* --- ITEMS DEL MENÚ --- */
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: var(--color-etiquetas, #94a3b8);
  text-decoration: none;
  cursor: pointer;
  border-radius: var(--app-border-radius, 12px);
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.nav-item:hover { 
  background: rgba(255, 255, 255, 0.05); 
  color: var(--color-texto-general, #ffffff); 
}

.router-link-active.nav-item {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: var(--color-botones, #3b82f6);
}

.router-link-active.nav-item .nav-icon {
  color: var(--color-botones, #3b82f6);
}

.nav-content { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.nav-text { 
  font-weight: 500; 
  font-size: 0.92rem; 
}

.nav-icon { 
  width: 20px; 
  height: 20px; 
  color: var(--color-etiquetas, #64748b);
  transition: color 0.2s;
}

.nav-item:hover .nav-icon {
  color: var(--color-texto-general, #f1f5f9);
}

.arrow-icon { 
  width: 18px; 
  height: 18px;
  color: var(--color-etiquetas, #475569);
  transition: transform 0.25s ease; 
}
.is-open .arrow-icon { 
  transform: rotate(180deg); 
  color: var(--color-botones, #3b82f6);
}

/* --- SUBMENÚS DESPLEGABLES --- */
.submenu { 
  max-height: 0; 
  overflow: hidden; 
  background: rgba(0, 0, 0, 0.15); 
  border-radius: var(--app-border-radius, 8px);
  margin: 0 4px;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}

.is-open .submenu { 
  max-height: 300px; 
  margin-bottom: 8px;
  border: 1px solid var(--border-cards, rgba(255, 255, 255, 0.02));
}

.sub-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 44px;
  color: var(--color-etiquetas, #64748b);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sub-item:hover { 
  color: var(--color-texto-general, #ffffff); 
  background: rgba(255, 255, 255, 0.03);
}

.router-link-active.sub-item {
  color: var(--color-texto-general, #ffffff);
  font-weight: 600;
}

.sub-icon { 
  width: 16px; 
  height: 16px;
  opacity: 0.7;
}
.sub-item:hover .sub-icon {
  opacity: 1;
}

.color-blue { fill: #3b82f6; }
.color-purple { fill: #a855f7; }
.color-gray { fill: #94a3b8; }

/* --- FOOTER / LOGOUT --- */
.sidebar-footer { 
  padding: 14px 16px; 
  border-top: 1px solid var(--border-cards, rgba(255, 255, 255, 0.04)); 
  flex-shrink: 0; 
  background: var(--bg-cards, #0a0a0a);
}

.btn-logout {
  width: 100%; 
  background: rgba(239, 68, 68, 0.06); 
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: var(--app-border-radius, 10px);
  padding: 12px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 10px;
  color: #ef4444; 
  font-weight: 600; 
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
}

.logout-icon { 
  width: 18px; 
  height: 18px; 
}

/* --- ESTRUCTURA MAIN LAYOUT --- */
.main-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  width: 100%; 
  margin-left: 0;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 901px) {
  .main-content {
    margin-left: 280px;
  }
}

.top-bar {
  padding: 0 24px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 70px;
  border-bottom: 1px solid var(--border-cards, rgba(255, 255, 255, 0.05));
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 900;
}

/* --- RESPONSIVO MÓVIL --- */
.mobile-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input, rgba(255,255,255,0.03)); 
  border: 1px solid var(--border-input, rgba(255,255,255,0.12));
  color: var(--color-texto-general, white); 
  cursor: pointer;
  padding: 10px;
  border-radius: var(--app-border-radius, 12px);
  transition: all 0.2s ease;
}

.mobile-toggle:hover {
  background: var(--bg-input-focus, rgba(255, 255, 255, 0.08));
  border-color: var(--color-botones, #3b82f6);
}

.svg-icon {
  width: 22px;
  height: 22px;
}

.sidebar {
  transform: translateX(-100%);
}

.sidebar-open .sidebar {
  transform: translateX(0);
  box-shadow: 20px 0 40px rgba(0,0,0,0.5);
}

@media (min-width: 901px) {
  .sidebar {
    transform: translateX(0);
  }
  .mobile-toggle {
    display: none;
  }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  z-index: 999;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.menu-scroll::-webkit-scrollbar { width: 5px; }
.menu-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.menu-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
</style>