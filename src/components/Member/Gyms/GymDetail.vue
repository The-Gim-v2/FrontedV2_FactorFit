<template>
  <HeadingMember>
    <div class="gym-detail-wrapper">

      <!-- Barra superior: regresar + estado -->
      <div class="top-bar">
        <button id="tutor-back-btn" type="button" class="back-btn" @click="$router.push({ name: 'member-gyms-list' })">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {{ t('back') }}
        </button>
      </div>

      <!-- 1. HERO -->
      <section id="tutor-hero-card" class="gym-hero-card">
        <div class="hero-bg" :style="{ backgroundImage: `url(${gymData.image})` }"></div>
        <div class="hero-overlay"></div>

        <div class="hero-content-flex">
          <div id="tutor-logo-box" class="gym-logo-box">
            <img :src="gymData.logo" alt="Logo" class="gym-logo-img" />
          </div>

          <div class="hero-texts">
            <div class="badge-row">
              <span class="badge">{{ gymData.category }}</span>
              <span class="status-badge" :class="{ open: isOpenNow }">
                <i></i>{{ isOpenNow ? t('openNow') : t('closedNow') }}
              </span>
            </div>

            <h1>{{ gymData.name }}</h1>

            <p class="hero-address">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ currentBranch.address }}
            </p>
          </div>

          <button v-if="!isEnrolled" type="button" class="hero-cta" @click="handleJoin">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            {{ t('join') }}
          </button>

          <div v-else class="enrolled-pill">
            <span class="enrolled-ico"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
            <div>
              <strong>{{ t('enrolled') }}</strong>
              <small>{{ currentBranch.name }}</small>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. INDICADORES -->
      <section class="kpi-grid">
        <article class="kpi-card">
          <div class="kpi-icon accent">
            <svg viewBox="0 0 24 24"><path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg>
          </div>
          <div class="kpi-body">
            <strong>{{ gymData.branches.length }}</strong>
            <span>{{ t('kpiBranches') }}</span>
          </div>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon success">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          </div>
          <div class="kpi-body">
            <strong class="kpi-text">{{ todayHours }}</strong>
            <span>{{ t('kpiToday') }}</span>
          </div>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon warning">
            <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
          </div>
          <div class="kpi-body">
            <strong>{{ gymData.amenities.length }}</strong>
            <span>{{ t('kpiAmenities') }}</span>
          </div>
        </article>
      </section>

      <!-- 3. DASHBOARD -->
      <div class="dashboard-grid">

        <!-- IZQUIERDA -->
        <div class="left-column">

          <!-- Mapa -->
          <section id="tutor-map-panel" class="panel-box map-panel">
            <header class="card-header">
              <div class="card-header-icon">
                <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="card-header-copy">
                <span class="card-eyebrow">{{ currentBranch.name }}</span>
                <h3>{{ t('mapTitle') }}</h3>
              </div>

              <div class="map-actions">
                <button id="tutor-route-btn" type="button" class="route-gps-btn" @click="calculateRouteFromCurrentLocation">
                  <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  {{ t('howToGetThere') }}
                </button>

                <button
                  id="tutor-toggle-steps-btn"
                  v-if="hasActiveRoute"
                  type="button"
                  class="toggle-instructions-btn"
                  @click="toggleInstructions"
                >
                  <svg viewBox="0 0 24 24">
                    <path v-if="showInstructions" d="M18 6L6 18M6 6l12 12"/>
                    <path v-else d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  {{ showInstructions ? t('hideSteps') : t('showSteps') }}
                </button>

                <button v-if="hasActiveRoute" type="button" class="toggle-instructions-btn danger" @click="clearRoute">
                  {{ t('clearRoute') }}
                </button>
              </div>
            </header>

            <div class="map-container-inner">
              <div ref="mapElement" class="map-canvas"></div>

              <button id="tutor-recenter-btn" type="button" class="recenter-map-btn" :title="t('recenterMap')" @click="recenterMap">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                <span>{{ t('recenter') }}</span>
              </button>

              <div class="map-watermark-overlay">
                <span class="watermark-text">{{ currentBranch.name }}</span>
              </div>
            </div>

            <transition name="fade">
              <div v-if="routeInfo" class="route-summary">
                <span><svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg><b>{{ routeInfo.km }} km</b></span>
                <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><b>{{ routeInfo.min }} min</b></span>
                <small>{{ t('routeFromYou') }}</small>
              </div>
            </transition>
          </section>

          <!-- Acerca + Amenidades -->
          <div class="info-split-row">
            <section id="tutor-about-box" class="panel-box">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10"/></svg>
                </div>
                <div class="card-header-copy">
                  <h3>{{ t('about') }}</h3>
                </div>
              </header>
              <p class="about-text">{{ gymData.description }}</p>
            </section>

            <section id="tutor-amenities-box" class="panel-box">
              <header class="card-header">
                <div class="card-header-icon success">
                  <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
                </div>
                <div class="card-header-copy">
                  <h3>{{ t('amenities') }}</h3>
                </div>
              </header>

              <div class="amenities-grid">
                <span v-for="a in gymData.amenities" :key="a" class="amenity-item">
                  <i class="amenity-check">
                    <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                  </i>
                  {{ a }}
                </span>
              </div>
            </section>
          </div>
        </div>

        <!-- DERECHA -->
        <aside class="right-column">

          <!-- Contacto -->
          <section id="tutor-contact-card" class="panel-box contact-card">
            <header class="card-header">
              <div class="card-header-icon">
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div class="card-header-copy">
                <span class="card-eyebrow">{{ t('contactTag') }}</span>
                <h3>{{ currentBranch.name }}</h3>
              </div>
            </header>

            <ul class="contact-list">
              <li>
                <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg></span>
                <div>
                  <small>{{ t('phone') }}</small>
                  <a :href="telUrl">{{ currentBranch.phone }}</a>
                </div>
              </li>
              <li>
                <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg></span>
                <div>
                  <small>{{ t('email') }}</small>
                  <a :href="`mailto:${currentBranch.email}`">{{ currentBranch.email }}</a>
                </div>
              </li>
              <li>
                <span class="contact-ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg></span>
                <div>
                  <small>{{ t('manager') }}</small>
                  <strong>{{ currentBranch.manager }}</strong>
                </div>
              </li>
            </ul>

            <button type="button" class="whatsapp-contact-btn" @click="contactOwner">
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              {{ t('contactOwnerWhatsapp') }}
            </button>
          </section>

          <!-- Sucursales -->
          <section id="tutor-branches-box" class="panel-box">
            <header class="card-header">
              <div class="card-header-icon">
                <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/></svg>
              </div>
              <div class="card-header-copy">
                <h3>{{ t('selectBranch') }}</h3>
                <p class="box-sub">{{ t('branchSub') }}</p>
              </div>
            </header>

            <div class="branches-list">
              <div
                v-for="branch in gymData.branches"
                :key="branch.id"
                :id="`tutor-branch-item-${branch.id}`"
                class="branch-card-item"
                :class="{ selected: selectedBranchId === branch.id }"
                role="button"
                tabindex="0"
                @click="updateMapLocation(branch)"
                @keydown.enter="updateMapLocation(branch)"
              >
                <div class="radio-indicator">
                  <div v-if="selectedBranchId === branch.id" class="radio-dot"></div>
                </div>
                <div class="branch-info">
                  <strong>{{ branch.name }}</strong>
                  <span>{{ branch.address }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Horarios -->
          <section id="tutor-schedule-box" class="panel-box">
            <header class="card-header">
              <div class="card-header-icon warning">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              </div>
              <div class="card-header-copy">
                <h3>{{ t('scheduleTitle') }}</h3>
              </div>
            </header>

            <div class="schedule-list">
              <div
                v-for="row in scheduleRows"
                :key="row.key"
                class="schedule-item"
                :class="{ today: row.key === todayKey }"
              >
                <span class="day">
                  {{ row.label }}
                  <em v-if="row.key === todayKey">{{ t('today') }}</em>
                </span>
                <span class="time">{{ row.time }}</span>
              </div>
            </div>
          </section>

          <!-- CTA -->
          <button v-if="!isEnrolled" id="tutor-join-btn" type="button" class="cta-main-btn" @click="handleJoin">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            {{ t('join') }}
          </button>
        </aside>
      </div>

      <!-- TOAST -->
      <transition name="toast-fade">
        <div v-if="toast.visible" class="custom-toast-notification" role="status">
          <div class="toast-icon-wrapper">
            <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button type="button" class="toast-close-btn" @click="toast.visible = false">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </transition>

    </div>
  </HeadingMember>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';
import HeadingMember from '../HeadingMember.vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const route = useRoute();
const gymId = route.params.id;

const mapElement = ref(null);
const selectedBranchId = ref(1);
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');
let map = null;
let routingControl = null;

const hasActiveRoute = ref(false);
const showInstructions = ref(true);
const routeInfo = ref(null);

/* ---------- Toast ---------- */
const toast = ref({ visible: false, message: '', timer: null });

const showToast = (message) => {
  if (toast.value.timer) clearTimeout(toast.value.timer);
  toast.value.message = message;
  toast.value.visible = true;
  toast.value.timer = setTimeout(() => {
    toast.value.visible = false;
  }, 4000);
};

/* ---------- Datos ---------- */
const gymData = ref({
  id: gymId,
  name: 'Iron Fitness Center Pro',
  category: 'Musculación & Crossfit',
  logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop',
  description: 'Instalaciones de clase mundial con tecnología de seguimiento biomecánico y áreas especializadas para entrenamiento de alto rendimiento.',
  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  amenities: ['Estacionamiento Gratuito', 'Regaderas y Lockers', 'Wi-Fi de Alta Velocidad', 'Zona de Sauna', 'Bebidas Energéticas'],
  schedule: {
    weekdays: '06:00 AM - 11:00 PM',
    saturday: '07:00 AM - 08:00 PM',
    sunday: '08:00 AM - 04:00 PM'
  },
  branches: [
    {
      id: 1,
      lat: 21.9902,
      lng: -99.0301,
      name: 'Sede Principal Centro',
      address: 'Av. Universitaria #420, Zona Centro',
      phone: '+52 (481) 381-9021',
      email: 'centro@ironfitness.com',
      manager: 'Lic. Roberto Garza'
    },
    {
      id: 2,
      lat: 22.0050,
      lng: -99.0210,
      name: 'Sede Norte Galerías',
      address: 'Blvd. Industrial #1200, Plaza Norte',
      phone: '+52 (481) 384-1192',
      email: 'norte@ironfitness.com',
      manager: 'Ing. Carlos Mendoza'
    }
  ]
});

/* Sedes en las que el usuario ya está inscrito.
   Reemplaza este arreglo con los datos del backend (ids de sucursal). */
const enrolledBranchIds = ref([]);

const currentBranch = computed(() => {
  return gymData.value.branches.find(b => b.id === selectedBranchId.value) || gymData.value.branches[0];
});

const isEnrolled = computed(() => enrolledBranchIds.value.includes(currentBranch.value.id));

const telUrl = computed(() => `tel:${String(currentBranch.value.phone || '').replace(/[^\d+]/g, '')}`);

/* ---------- Horarios: hoy y "abierto ahora" ---------- */
const todayKey = computed(() => {
  const d = new Date().getDay();
  return d === 0 ? 'sunday' : d === 6 ? 'saturday' : 'weekdays';
});

const scheduleRows = computed(() => [
  { key: 'weekdays', label: t('weekdays'), time: gymData.value.schedule.weekdays },
  { key: 'saturday', label: t('saturday'), time: gymData.value.schedule.saturday },
  { key: 'sunday', label: t('sunday'), time: gymData.value.schedule.sunday }
]);

const todayHours = computed(() => gymData.value.schedule[todayKey.value]);

const parseClock = (str) => {
  const m = String(str).trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
};

const isOpenNow = computed(() => {
  const [a, b] = todayHours.value.split('-');
  const open = parseClock(a);
  const close = parseClock(b);
  if (open == null || close == null) return false;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= open && mins < close;
});

/* ---------- Mapa ---------- */
const markerIcon = (extra = '') =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="marker-pin ${extra}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

const initMap = () => {
  if (!mapElement.value) return;

  map = L.map(mapElement.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([currentBranch.value.lat, currentBranch.value.lng], 16);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  updateBranchMarkerOnly();
};

const removeRoute = () => {
  if (routingControl && map) {
    map.removeControl(routingControl);
  }
  routingControl = null;
  hasActiveRoute.value = false;
  routeInfo.value = null;
};

const updateBranchMarkerOnly = () => {
  if (!map) return;

  removeRoute();

  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  L.marker([currentBranch.value.lat, currentBranch.value.lng], { icon: markerIcon() })
    .addTo(map)
    .bindPopup(`<b>${currentBranch.value.name}</b><br>${currentBranch.value.address}`)
    .openPopup();

  map.setView([currentBranch.value.lat, currentBranch.value.lng], 16, { animate: true });
};

const updateMapLocation = (branch) => {
  selectedBranchId.value = branch.id;
  updateBranchMarkerOnly();
};

const calculateRouteFromCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert(t('geoUnsupported'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      if (!map) return;
      if (routingControl) map.removeControl(routingControl);

      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(currentBranch.value.lat, currentBranch.value.lng)
        ],
        routeWhileDragging: false,
        language: currentLang.value === 'en' ? 'en' : 'es',
        createMarker: (i, waypoint) =>
          L.marker(waypoint.latLng, { icon: markerIcon(i === 0 ? 'user-loc' : '') }),
        lineOptions: {
          styles: [{ color: '#3b82f6', opacity: 0.85, weight: 5 }]
        },
        show: true,
        fitSelectedRoutes: true
      }).addTo(map);

      routingControl.on('routesfound', (e) => {
        const s = e.routes?.[0]?.summary;
        if (s) {
          routeInfo.value = {
            km: (s.totalDistance / 1000).toFixed(1),
            min: Math.max(1, Math.round(s.totalTime / 60))
          };
        }
      });

      hasActiveRoute.value = true;
      showInstructions.value = true;
    },
    (error) => {
      console.error(error);
      alert(t('geoError'));
    },
    { enableHighAccuracy: true }
  );
};

const toggleInstructions = () => {
  showInstructions.value = !showInstructions.value;
  if (routingControl) {
    const container = routingControl.getContainer();
    if (container) container.style.display = showInstructions.value ? 'block' : 'none';
  }
};

const clearRoute = () => updateBranchMarkerOnly();

const recenterMap = () => {
  if (!map) return;
  map.setView([currentBranch.value.lat, currentBranch.value.lng], 16, { animate: true });
  showToast(`${t('centeredOn')} ${currentBranch.value.name}`);
};

const handleJoin = () => {
  if (isEnrolled.value) return;
  enrolledBranchIds.value.push(currentBranch.value.id);
  showToast(`${t('joinedOk')} ${currentBranch.value.name}`);
};

const contactOwner = () => {
  const cleanPhone = currentBranch.value.phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    `Hola ${currentBranch.value.manager}, me comunico desde la plataforma para consultar información sobre la sucursal ${currentBranch.value.name}.`
  );
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
};

/* ---------- Traducciones ---------- */
const translations = {
  es: {
    back: 'Regresar a sedes',
    mapTitle: 'Ubicación geográfica',
    howToGetThere: '¿Cómo llegar?',
    showSteps: 'Ver indicaciones',
    hideSteps: 'Ocultar indicaciones',
    clearRoute: 'Quitar ruta',
    routeFromYou: 'desde tu ubicación',
    about: 'Acerca del gimnasio',
    amenities: 'Amenidades y servicios',
    selectBranch: 'Selecciona tu sucursal',
    branchSub: 'Elige la sede donde entrenarás',
    scheduleTitle: 'Horarios completos',
    weekdays: 'Lunes a viernes',
    saturday: 'Sábados',
    sunday: 'Domingos',
    today: 'Hoy',
    join: 'Inscribirme en esta sede',
    enrolled: 'Ya estás inscrito',
    contactOwnerWhatsapp: 'Contactar por WhatsApp',
    contactTag: 'Contacto directo de la sede',
    phone: 'Teléfono',
    email: 'Correo',
    manager: 'Encargado',
    recenter: 'Centrar sede',
    recenterMap: 'Centrar vista en el gimnasio',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado ahora',
    kpiBranches: 'Sedes disponibles',
    kpiToday: 'Horario de hoy',
    kpiAmenities: 'Amenidades',
    centeredOn: 'Mapa centrado en:',
    joinedOk: '¡Te has inscrito exitosamente en la sucursal:',
    geoUnsupported: 'Tu navegador no soporta geolocalización',
    geoError: 'No se pudo obtener tu ubicación actual. Revisa los permisos del navegador.'
  },
  en: {
    back: 'Back to gyms',
    mapTitle: 'Geographic location',
    howToGetThere: 'Get directions',
    showSteps: 'Show steps',
    hideSteps: 'Hide steps',
    clearRoute: 'Clear route',
    routeFromYou: 'from your location',
    about: 'About the gym',
    amenities: 'Amenities & services',
    selectBranch: 'Select your branch',
    branchSub: 'Choose your training location',
    scheduleTitle: 'Full schedule',
    weekdays: 'Monday to Friday',
    saturday: 'Saturdays',
    sunday: 'Sundays',
    today: 'Today',
    join: 'Join this location',
    enrolled: 'You are enrolled',
    contactOwnerWhatsapp: 'Contact via WhatsApp',
    contactTag: 'Branch direct contact',
    phone: 'Phone',
    email: 'Email',
    manager: 'Manager',
    recenter: 'Center gym',
    recenterMap: 'Center view on gym',
    openNow: 'Open now',
    closedNow: 'Closed now',
    kpiBranches: 'Available branches',
    kpiToday: "Today's hours",
    kpiAmenities: 'Amenities',
    centeredOn: 'Map centered on:',
    joinedOk: 'You have successfully joined the branch:',
    geoUnsupported: 'Your browser does not support geolocation',
    geoError: 'Could not get your location. Check your browser permissions.'
  }
};

const t = (key) => {
  const table = translations[currentLang.value] || translations.es;
  return table[key] || translations.es[key] || key;
};

onMounted(() => {
  nextTick(() => initMap());
});

onUnmounted(() => {
  if (toast.value.timer) clearTimeout(toast.value.timer);
  if (map) map.remove();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button { font: inherit; }

svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   BASE
========================================================= */
.gym-detail-wrapper {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: color-mix(in srgb, var(--hl) 11%, transparent);
  --hl-mid: color-mix(in srgb, var(--hl) 22%, transparent);
  --hl-line: color-mix(in srgb, var(--hl) 45%, transparent);
  --card: var(--bg-cards, #121212);
  --line: rgba(255, 255, 255, 0.07);
  --line2: rgba(255, 255, 255, 0.13);
  --title: var(--color-titulos, #fff);
  --text2: rgba(245, 245, 244, 0.66);
  --text3: rgba(245, 245, 244, 0.45);
  --surface: rgba(255, 255, 255, 0.03);
  --surface-hover: rgba(255, 255, 255, 0.055);
  --green: #34d399;
  --amber: #fbbf24;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  width: 100%;
  min-height: 100vh;
  max-width: 1320px;
  margin: 0 auto;
  padding: 28px clamp(14px, 3vw, 32px) 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
}

button:focus-visible,
a:focus-visible,
[role='button']:focus-visible {
  outline: 2px solid var(--hl);
  outline-offset: 2px;
}

/* =========================================================
   BARRA SUPERIOR
========================================================= */
.top-bar { display: flex; align-items: center; justify-content: space-between; }

.back-btn {
  height: 40px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--title);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.2s var(--ease), border-color 0.2s ease;
}

.back-btn svg { width: 16px; height: 16px; }
.back-btn:hover { background: var(--surface-hover); border-color: var(--hl-line); transform: translateX(-2px); }

/* =========================================================
   HERO
========================================================= */
.gym-hero-card {
  position: relative;
  min-height: 280px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 32px;
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.gym-hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3;
  background: linear-gradient(90deg, var(--hl), transparent 70%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.55) saturate(1.05);
  transform: scale(1.02);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(520px 260px at 100% 0%, var(--hl-mid), transparent 70%),
    linear-gradient(180deg, rgba(9, 9, 9, 0.1) 10%, rgba(9, 9, 9, 0.94) 100%);
}

.hero-content-flex {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 22px;
}

.gym-logo-box {
  width: 96px;
  height: 96px;
  flex: none;
  overflow: hidden;
  background: #141418;
  border: 2px solid rgba(255, 255, 255, 0.22);
  border-radius: 24px;
  box-shadow: 0 0 0 5px var(--hl-soft), 0 14px 30px rgba(0, 0, 0, 0.6);
}

.gym-logo-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero-texts { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 10px; }

.badge-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.badge {
  padding: 5px 12px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.status-badge {
  padding: 5px 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #fff;
  background: rgba(239, 68, 68, 0.88);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 11px;
  font-weight: 800;
}

.status-badge.open { background: rgba(16, 185, 129, 0.92); }

.status-badge i {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff;
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
}

.hero-texts h1 {
  margin: 0;
  color: #fff;
  font-family: 'Anton', sans-serif;
  font-size: clamp(28px, 3.6vw, 46px);
  font-weight: 400;
  letter-spacing: 0.4px;
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.hero-address {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13.5px;
  overflow-wrap: anywhere;
}

.hero-address svg { width: 15px; height: 15px; flex: none; color: var(--hl); }

.hero-cta {
  height: 46px;
  padding: 0 22px;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-texto-botones, #fff);
  white-space: nowrap;
  cursor: pointer;
  background: var(--color-botones, var(--hl));
  border: 0;
  border-radius: 13px;
  box-shadow: 0 10px 26px color-mix(in srgb, var(--hl) 35%, transparent);
  font-size: 13px;
  font-weight: 700;
  transition: filter 0.2s ease, transform 0.2s var(--ease);
}

.hero-cta svg { width: 16px; height: 16px; }
.hero-cta:hover { filter: brightness(1.1); transform: translateY(-2px); }

.enrolled-pill {
  padding: 10px 18px 10px 12px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 14px;
  backdrop-filter: blur(8px);
}

.enrolled-ico {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #10b981;
  border-radius: 50%;
}

.enrolled-ico svg { width: 16px; height: 16px; stroke-width: 3; }

.enrolled-pill div { display: flex; flex-direction: column; gap: 2px; }
.enrolled-pill strong { color: #fff; font-size: 13px; }
.enrolled-pill small { color: rgba(255, 255, 255, 0.7); font-size: 11.5px; }

/* =========================================================
   INDICADORES
========================================================= */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  --tint: var(--hl);

  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  background:
    radial-gradient(180px 90px at 0% 0%, color-mix(in srgb, var(--tint) 12%, transparent), transparent 75%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 60%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 22px;
  right: 22px;
  height: 2px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--tint), transparent);
  opacity: 0.85;
}

.kpi-card:nth-child(2) { --tint: var(--green); }
.kpi-card:nth-child(3) { --tint: #f59e0b; }

.kpi-icon {
  width: 48px;
  height: 48px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 14px;
}

.kpi-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.kpi-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.28); }
.kpi-icon svg { width: 21px; height: 21px; }

.kpi-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }

.kpi-body strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
}

.kpi-body strong.kpi-text { font-size: 17px; line-height: 1.2; }

.kpi-body span {
  color: var(--text3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

/* =========================================================
   GRID PRINCIPAL
========================================================= */
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 22px;
  align-items: start;
}

.left-column,
.right-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

@media (min-width: 1101px) {
  .right-column { position: sticky; top: 88px; }
}

/* =========================================================
   TARJETAS
========================================================= */
.panel-box {
  min-width: 0;
  padding: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
  transition: border-color 0.2s ease;
}

.panel-box:hover { border-color: var(--line2); }

.card-header {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 13px;
}

.card-header-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
}

.card-header-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.card-header-icon.warning { color: var(--amber); background: rgba(245, 158, 11, 0.09); border-color: rgba(245, 158, 11, 0.28); }
.card-header-icon svg { width: 19px; height: 19px; }

.card-header-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }

.card-eyebrow {
  overflow: hidden;
  color: var(--hl);
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-header h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.box-sub { margin: 0; color: var(--text3); font-size: 12px; }

.about-text { margin: 0; color: var(--text2); font-size: 13.5px; line-height: 1.75; }

/* =========================================================
   MAPA
========================================================= */
.map-panel { display: flex; flex-direction: column; }
.map-panel .card-header { flex-wrap: wrap; margin-bottom: 16px; }

.map-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.route-gps-btn,
.toggle-instructions-btn {
  height: 38px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s var(--ease), color 0.2s ease;
}

.route-gps-btn svg,
.toggle-instructions-btn svg { width: 15px; height: 15px; }

.route-gps-btn {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 22%, transparent);
}

.route-gps-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

.toggle-instructions-btn {
  color: var(--title);
  background: var(--surface);
  border: 1px solid var(--line2);
}

.toggle-instructions-btn:hover { background: var(--surface-hover); transform: translateY(-1px); }
.toggle-instructions-btn.danger:hover { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }

.map-container-inner {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--line2);
  border-radius: 16px;
}

.map-canvas { width: 100%; height: 100%; z-index: 1; background: #161616; }

.recenter-map-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 401;
  height: 36px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #fff;
  cursor: pointer;
  background: rgba(15, 15, 15, 0.9);
  border: 1px solid var(--line2);
  border-radius: 10px;
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  font-size: 11.5px;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.recenter-map-btn svg { width: 15px; height: 15px; }
.recenter-map-btn:hover { color: var(--hl); background: rgba(15, 15, 15, 0.98); border-color: var(--hl-line); }

.map-watermark-overlay {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 400;
  max-width: calc(100% - 90px);
  padding: 5px 11px;
  background: rgba(15, 15, 15, 0.88);
  border: 1px solid var(--line2);
  border-radius: 8px;
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.watermark-text {
  display: block;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-summary {
  margin-top: 14px;
  padding: 11px 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
}

.route-summary span { display: inline-flex; align-items: center; gap: 7px; color: var(--title); font-size: 13px; }
.route-summary svg { width: 15px; height: 15px; color: var(--hl); }
.route-summary small { margin-left: auto; color: var(--text3); font-size: 11.5px; }

/* Leaflet */
:deep(.leaflet-routing-container) {
  max-height: 200px;
  padding: 12px !important;
  overflow-y: auto;
  color: #f5f5f4 !important;
  background: #141418 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
  font-family: 'Inter', sans-serif !important;
}

:deep(.leaflet-routing-container h2),
:deep(.leaflet-routing-container h3) { color: #fff !important; font-family: 'Oswald', sans-serif !important; }

:deep(.leaflet-routing-alt) {
  color: rgba(245, 245, 244, 0.8) !important;
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

:deep(.leaflet-routing-alt table) { color: #fff !important; }

:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) { color: #eee !important; background: #171717 !important; }

:deep(.custom-map-marker) { background: transparent; border: none; }

:deep(.marker-pin) {
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
  animation: marker-pulse 2s infinite;
}

:deep(.marker-pin.user-loc) { background: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }

@keyframes marker-pulse {
  0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important;
  max-width: 480px !important;
  left: 50% !important;
  right: auto !important;
  margin: 0 auto !important;
  transform: translateX(-50%) !important;
}

/* =========================================================
   INFO + AMENIDADES
========================================================= */
.info-split-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: stretch;
}

.amenities-grid { display: flex; flex-direction: column; gap: 8px; }

.amenity-item {
  padding: 9px 11px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(245, 245, 244, 0.88);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 11px;
  font-size: 13px;
}

.amenity-check {
  width: 20px;
  height: 20px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--green);
  background: rgba(16, 185, 129, 0.12);
  border-radius: 50%;
}

.amenity-check svg { width: 11px; height: 11px; stroke-width: 3; }

/* =========================================================
   CONTACTO
========================================================= */
.contact-card { border-color: var(--hl-line); box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--hl-soft); }

.contact-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }

.contact-list li {
  padding: 11px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.contact-list li:first-child { padding-top: 0; }
.contact-list li:last-child { border-bottom: 0; }

.contact-ico {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.contact-ico svg { width: 15px; height: 15px; }

.contact-list li > div { min-width: 0; display: flex; flex-direction: column; gap: 2px; }

.contact-list small { color: var(--text3); font-size: 10.5px; font-weight: 700; }

.contact-list a,
.contact-list strong {
  overflow: hidden;
  color: var(--title);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-list a:hover { color: var(--hl); }

.whatsapp-contact-btn {
  width: 100%;
  min-height: 44px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--green);
  cursor: pointer;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s var(--ease);
}

.whatsapp-contact-btn svg { width: 17px; height: 17px; }
.whatsapp-contact-btn:hover { color: #fff; background: rgba(16, 185, 129, 0.28); transform: translateY(-1px); }

/* =========================================================
   SUCURSALES
========================================================= */
.branches-list { display: flex; flex-direction: column; gap: 10px; }

.branch-card-item {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 13px;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}

.branch-card-item:hover { background: var(--surface-hover); transform: translateY(-1px); }
.branch-card-item.selected { background: var(--hl-soft); border-color: var(--hl); }

.radio-indicator {
  width: 18px;
  height: 18px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  transition: border-color 0.2s ease;
}

.branch-card-item.selected .radio-indicator { border-color: var(--hl); }
.radio-dot { width: 8px; height: 8px; background: var(--hl); border-radius: 50%; }

.branch-info { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.branch-info strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 15px; font-weight: 600; }

.branch-info span { color: var(--text3); font-size: 12px; line-height: 1.4; overflow-wrap: anywhere; }

/* =========================================================
   HORARIOS
========================================================= */
.schedule-list { display: flex; flex-direction: column; gap: 8px; }

.schedule-item {
  padding: 11px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 13px;
}

.schedule-item .day { display: flex; align-items: center; gap: 8px; color: var(--text2); }

.schedule-item .day em {
  padding: 2px 8px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
}

.schedule-item .time {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  text-align: right;
}

.schedule-item.today { background: var(--hl-soft); border-color: var(--hl-line); }
.schedule-item.today .day { color: var(--title); font-weight: 600; }

/* =========================================================
   CTA
========================================================= */
.cta-main-btn {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, var(--hl));
  border: 0;
  border-radius: 16px;
  box-shadow: 0 12px 28px color-mix(in srgb, var(--hl) 30%, transparent);
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  transition: filter 0.2s ease, transform 0.2s var(--ease), box-shadow 0.2s ease;
}

.cta-main-btn svg { width: 18px; height: 18px; }
.cta-main-btn:hover { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 18px 36px color-mix(in srgb, var(--hl) 38%, transparent); }

/* =========================================================
   TOAST
========================================================= */
.custom-toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  max-width: 400px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  background: #10b981;
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(16, 185, 129, 0.4);
  font-size: 13.5px;
  font-weight: 600;
}

.toast-icon-wrapper {
  width: 26px;
  height: 26px;
  flex: none;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 50%;
}

.toast-icon-wrapper svg { width: 14px; height: 14px; stroke-width: 3; }

.toast-message { flex: 1; line-height: 1.4; overflow-wrap: anywhere; }

.toast-close-btn {
  width: 24px;
  height: 24px;
  flex: none;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.toast-close-btn svg { width: 14px; height: 14px; }
.toast-close-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.15); }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }

.toast-fade-enter-from,
.toast-fade-leave-to { opacity: 0; transform: translateY(-16px); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }

.fade-enter-from,
.fade-leave-to { opacity: 0; }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); }
  .right-column { position: static; }
}

@media (max-width: 860px) {
  .hero-content-flex { flex-wrap: wrap; align-items: flex-start; }
  .hero-cta { width: 100%; justify-content: center; }
  .enrolled-pill { width: 100%; }
  .info-split-row { grid-template-columns: minmax(0, 1fr); }
}

@media (max-width: 680px) {
  .gym-detail-wrapper { padding: 14px 12px 44px; gap: 16px; }

  .gym-hero-card { min-height: 0; padding: 20px 16px; border-radius: 20px; }
  .hero-content-flex { flex-direction: column; gap: 14px; }
  .gym-logo-box { width: 68px; height: 68px; border-radius: 18px; }

  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .kpi-card:first-child { grid-column: 1 / -1; }
  .kpi-card { padding: 14px 16px; gap: 12px; border-radius: 17px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body strong { font-size: 26px; }
  .kpi-body strong.kpi-text { font-size: 14px; }

  .panel-box { padding: 18px 16px; border-radius: 18px; }
  .left-column, .right-column { gap: 16px; }

  .map-panel .card-header { align-items: flex-start; }
  .map-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
  .route-gps-btn { grid-column: 1 / -1; }
  .route-gps-btn,
  .toggle-instructions-btn { width: 100%; justify-content: center; }

  .map-container-inner { height: 300px; }
  .route-summary small { width: 100%; margin-left: 0; }

  .custom-toast-notification { top: 12px; right: 12px; left: 12px; max-width: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>