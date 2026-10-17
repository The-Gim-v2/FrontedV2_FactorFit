<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingMember from '../HeadingMember.vue';
import UpgradeMembershipModal from '../Modals/UpgradeMembershipModal.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const router = useRouter();
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');

/* =========================================================
   NOTIFICACIONES (mismo componente que Rutinas Semanales)
========================================================= */

const toastRef = ref(null);
const notify = (message, type = 'success', duration = 4000) => {
  toastRef.value?.notify(message, type, duration);
};

/* =========================================================
   DATOS (de prueba: reemplázalos por los del backend)
========================================================= */

const registeredGym = ref({
  id: 1,
  name: 'IronFit Valles Centro',
  address: 'Blvd. Carlos Lasso #120, Centro',
  schedule: 'Lun - Sáb: 6:00 AM - 10:00 PM',
  phone: '+52 481 382 0011',
  isOpen: true,
  occupancy: 45,
  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
  ciudad: 'Ciudad Valles',
  estado: 'San Luis Potosí',
  lat: 21.9902,
  lng: -99.0301
});

const localGyms = ref([
  {
    id: 2,
    name: 'IronFit Norte - Plaza San José',
    address: 'Carretera Mante #450, Local 4',
    schedule: 'Lun - Dom: 5:00 AM - 11:00 PM',
    phone: '+52 481 382 9922',
    isOpen: true,
    occupancy: 82,
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    lat: 22.005,
    lng: -99.021
  },
  {
    id: 3,
    name: 'IronFit Poniente',
    address: 'Av. Pedro Antonio Santos #800',
    schedule: 'Lun - Sáb: 6:00 AM - 10:00 PM',
    phone: '+52 481 383 4455',
    isOpen: false,
    occupancy: 15,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    lat: 21.985,
    lng: -99.045
  },
  {
    id: 6,
    name: 'IronFit Sur - Plaza Tangamanga',
    address: 'Blvd. México-Laredo #2200',
    schedule: 'Lun - Dom: 6:00 AM - 11:00 PM',
    phone: '+52 481 384 1234',
    isOpen: true,
    occupancy: 60,
    image: 'https://images.unsplash.com/photo-1571902943202-507f2718ea0d?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    lat: 21.97,
    lng: -99.015
  },
  {
    id: 7,
    name: 'IronFit Ébano Express',
    address: 'Av. Juárez #115, Col. Obrera',
    schedule: 'Lun - Sáb: 7:00 AM - 9:00 PM',
    phone: '+52 481 385 6789',
    isOpen: true,
    occupancy: 30,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    lat: 21.95,
    lng: -99.0
  }
]);

const nationalGyms = ref([
  {
    id: 4,
    name: 'IronFit CDMX Polanco (Plus)',
    address: 'Campos Elíseos #204, Polanco',
    schedule: '24 Horas',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Polanco',
    estado: 'Ciudad de México'
  },
  {
    id: 5,
    name: 'IronFit Monterrey San Pedro (Plus)',
    address: 'Av. Vasconcelos #400, Del Valle',
    schedule: '24 Horas',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ciudad: 'San Pedro Garza García',
    estado: 'Nuevo León'
  },
  {
    id: 8,
    name: 'IronFit Guadalajara Andares (Plus)',
    address: 'Boulevard Puerta de Hierro #4965',
    schedule: '24 Horas',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Zapopan',
    estado: 'Jalisco'
  },
  {
    id: 9,
    name: 'IronFit Querétaro Antea (Plus)',
    address: 'Carretera Pista Panamericana #10200',
    schedule: '24 Horas',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    ciudad: 'Querétaro',
    estado: 'Querétaro'
  }
]);

const estadoAbrevMap = {
  'San Luis Potosí': 'SLP',
  'Ciudad de México': 'CDMX',
  'Nuevo León': 'NL',
  'Jalisco': 'JAL',
  'Querétaro': 'QRO'
};
const abreviarEstado = (estado) => estadoAbrevMap[estado] || estado;

/* =========================================================
   IDIOMA
========================================================= */

const translations = {
  es: {
    eyebrow: 'RED DE SUCURSALES',
    gymsListTitle: 'Red de Sucursales',
    gymsListDesc: 'Gestiona tu base principal, descubre puntos cercanos para entrenar o expande tu acceso a nivel nacional.',
    nearMe: 'Cerca de mí',
    locating: 'Buscando…',
    seePlus: 'Ver Plus',
    yourBase: 'TU BASE ACTUAL',
    kpiBranches: 'SEDES EN CIUDAD VALLES',
    kpiOpen: 'ABIERTAS AHORA',
    kpiStates: 'ESTADOS CON COBERTURA PLUS',
    kpiOccupancy: 'AFLUENCIA PROMEDIO',
    searchPlaceholder: 'Busca por gimnasio, ciudad, estado o dirección…',
    clearSearch: 'Limpiar búsqueda',
    sortBy: 'Ordenar',
    sortRelevance: 'Relevancia',
    sortName: 'Nombre (A-Z)',
    sortOccupancy: 'Menor afluencia',
    sortNearest: 'Más cercanas',
    viewGrid: 'Cuadrícula',
    viewList: 'Lista',
    scopeAll: 'Todas',
    scopeLocal: 'Ciudad Valles',
    scopeNational: 'Red nacional Plus',
    filterOpen: 'Abiertas ahora',
    filterQuiet: 'Poco concurridas',
    clearFilters: 'Limpiar filtros',
    results: 'resultados',
    result: 'resultado',
    statusOpen: 'Abierto',
    statusClosed: 'Cerrado',
    registeredGymTitle: 'Tu Base de Entrenamiento Actual',
    registeredGymSub: 'Tu sede principal: aquí se registran tus asistencias.',
    localGymsTitle: 'Sucursales Disponibles en Ciudad Valles',
    localGymsSub: 'Puedes entrenar en cualquiera de ellas con tu membresía actual.',
    nationalGymsTitle: 'Red Nacional (Acceso Plus Requerido)',
    nationalGymsSub: 'Entrena en otras ciudades del país con Membresía Plus.',
    mainBaseBadge: 'Base Principal',
    liveOccupancyLabel: 'Afluencia en vivo',
    occLow: 'Tranquilo',
    occMid: 'Moderado',
    occHigh: 'Lleno',
    viewDetail: 'Ver detalle',
    directions: 'Cómo llegar',
    call: 'Llamar',
    allStates: 'Todos los estados',
    plusBannerTitle: 'Entrena en todo México con Membresía Plus',
    plusBannerDesc: 'Acceso a sedes 24 horas en las principales ciudades, sin pagar extra por sede.',
    plusBannerBtn: 'Ver planes',
    lockTitle: 'Exclusivo Membresía Plus',
    lockBtn: 'Desbloquear con Plus',
    open24: '24 Horas',
    plusBadge: 'PLUS',
    noResultsTitle: 'No encontramos sedes con ese criterio',
    noResultsDesc: 'Prueba con otra ciudad, estado o nombre, o quita algunos filtros.',
    geoError: 'No se pudo obtener tu ubicación. Revisa los permisos del navegador.',
    geoUnsupported: 'Tu navegador no soporta geolocalización.',
    geoOk: 'Ordenadas por cercanía a tu ubicación.',
    away: 'a'
  },
  en: {
    eyebrow: 'BRANCH NETWORK',
    gymsListTitle: 'Branch Network',
    gymsListDesc: 'Manage your home gym, discover nearby training spots, or expand your access nationwide.',
    nearMe: 'Near me',
    locating: 'Locating…',
    seePlus: 'See Plus',
    yourBase: 'YOUR HOME GYM',
    kpiBranches: 'BRANCHES IN CIUDAD VALLES',
    kpiOpen: 'OPEN NOW',
    kpiStates: 'STATES WITH PLUS COVERAGE',
    kpiOccupancy: 'AVERAGE OCCUPANCY',
    searchPlaceholder: 'Search by gym, city, state or address…',
    clearSearch: 'Clear search',
    sortBy: 'Sort',
    sortRelevance: 'Relevance',
    sortName: 'Name (A-Z)',
    sortOccupancy: 'Lowest occupancy',
    sortNearest: 'Nearest',
    viewGrid: 'Grid',
    viewList: 'List',
    scopeAll: 'All',
    scopeLocal: 'Ciudad Valles',
    scopeNational: 'Plus national network',
    filterOpen: 'Open now',
    filterQuiet: 'Not crowded',
    clearFilters: 'Clear filters',
    results: 'results',
    result: 'result',
    statusOpen: 'Open',
    statusClosed: 'Closed',
    registeredGymTitle: 'Your Current Home Gym',
    registeredGymSub: 'Your main branch: your attendance is logged here.',
    localGymsTitle: 'Available Branches in Ciudad Valles',
    localGymsSub: 'You can train at any of them with your current membership.',
    nationalGymsTitle: 'National Network (Plus Access Required)',
    nationalGymsSub: 'Train in other cities nationwide with Plus Membership.',
    mainBaseBadge: 'Home Base',
    liveOccupancyLabel: 'Live occupancy',
    occLow: 'Quiet',
    occMid: 'Moderate',
    occHigh: 'Busy',
    viewDetail: 'View details',
    directions: 'Directions',
    call: 'Call',
    allStates: 'All states',
    plusBannerTitle: 'Train all across Mexico with Plus Membership',
    plusBannerDesc: '24-hour access to branches in the main cities, with no extra fee per branch.',
    plusBannerBtn: 'View plans',
    lockTitle: 'Plus Membership Exclusive',
    lockBtn: 'Unlock with Plus',
    open24: '24 Hours',
    plusBadge: 'PLUS',
    noResultsTitle: "We couldn't find any branches matching that",
    noResultsDesc: 'Try a different city, state or name, or remove some filters.',
    geoError: 'Could not get your location. Check your browser permissions.',
    geoUnsupported: 'Your browser does not support geolocation.',
    geoOk: 'Sorted by distance from your location.',
    away: ''
  }
};

const t = (key) => {
  const table = translations[currentLang.value] || translations.es;
  return table[key] ?? translations.es[key] ?? key;
};

const handleLangChange = (event) => {
  const nuevo = event?.detail?.idioma || localStorage.getItem('member-idioma');
  if (nuevo) currentLang.value = nuevo;
};

/* Título con la última palabra resaltada */
const titleParts = computed(() => {
  const words = t('gymsListTitle').split(' ');
  const last = words.pop();
  return { first: words.join(' '), last };
});

/* =========================================================
   FILTROS Y BÚSQUEDA
========================================================= */

const searchQuery = ref('');
const scope = ref('all');            /* all | local | national */
const onlyOpen = ref(false);
const lowCrowd = ref(false);
const stateFilter = ref('all');
const sortBy = ref('relevance');     /* relevance | name | occupancy | nearest */
const viewMode = ref(localStorage.getItem('member-gyms-view') === 'list' ? 'list' : 'grid');

watch(viewMode, (v) => localStorage.setItem('member-gyms-view', v));

const normalize = (str) =>
  (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const matchesQuery = (gym, q) =>
  !q ||
  normalize(gym.name).includes(q) ||
  normalize(gym.ciudad).includes(q) ||
  normalize(gym.estado).includes(q) ||
  normalize(gym.address).includes(q);

const query = computed(() => normalize(searchQuery.value.trim()));

const hasActiveFilters = computed(
  () =>
    !!query.value ||
    scope.value !== 'all' ||
    onlyOpen.value ||
    lowCrowd.value ||
    stateFilter.value !== 'all' ||
    sortBy.value !== 'relevance'
);

const clearFilters = () => {
  searchQuery.value = '';
  scope.value = 'all';
  onlyOpen.value = false;
  lowCrowd.value = false;
  stateFilter.value = 'all';
  sortBy.value = 'relevance';
};

/* Al elegir un estado se muestra la red nacional */
const pickState = (estado) => {
  stateFilter.value = estado;
  if (estado !== 'all' && scope.value === 'local') scope.value = 'all';
};

/* =========================================================
   UBICACIÓN DEL USUARIO (ordenar por cercanía)
========================================================= */

const userPos = ref(null);
const locating = ref(false);

const toRad = (deg) => (deg * Math.PI) / 180;

const distanceKm = (gym) => {
  if (!userPos.value || gym.lat == null || gym.lng == null) return null;

  const R = 6371;
  const dLat = toRad(gym.lat - userPos.value.lat);
  const dLng = toRad(gym.lng - userPos.value.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userPos.value.lat)) * Math.cos(toRad(gym.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
};

const formatDistance = (gym) => {
  const d = distanceKm(gym);
  if (d == null) return '';
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

const requestLocation = () => {
  if (!navigator.geolocation) {
    notify(t('geoUnsupported'), 'error');
    return;
  }

  locating.value = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userPos.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      sortBy.value = 'nearest';
      locating.value = false;
      notify(t('geoOk'), 'success');
    },
    () => {
      locating.value = false;
      notify(t('geoError'), 'error');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

/* =========================================================
   LISTAS FILTRADAS
========================================================= */

const sortList = (list) => {
  const copy = [...list];

  if (sortBy.value === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'occupancy') {
    copy.sort((a, b) => (a.occupancy ?? 101) - (b.occupancy ?? 101));
  } else if (sortBy.value === 'nearest' && userPos.value) {
    copy.sort((a, b) => (distanceKm(a) ?? 1e9) - (distanceKm(b) ?? 1e9));
  }

  return copy;
};

const passesLocalFilters = (gym) =>
  matchesQuery(gym, query.value) &&
  (!onlyOpen.value || gym.isOpen) &&
  (!lowCrowd.value || gym.occupancy < 50);

const showHome = computed(
  () => scope.value !== 'national' && stateFilter.value === 'all' && passesLocalFilters(registeredGym.value)
);

const filteredLocal = computed(() =>
  scope.value === 'national' || stateFilter.value !== 'all'
    ? []
    : sortList(localGyms.value.filter(passesLocalFilters))
);

const nationalByState = computed(() => {
  if (scope.value === 'local' || lowCrowd.value) return {};

  const list = sortList(
    nationalGyms.value.filter(
      (g) =>
        matchesQuery(g, query.value) &&
        (stateFilter.value === 'all' || g.estado === stateFilter.value)
    )
  );

  const groups = {};
  for (const gym of list) {
    (groups[gym.estado] ||= []).push(gym);
  }
  return groups;
});

const nationalCount = computed(() =>
  Object.values(nationalByState.value).reduce((sum, list) => sum + list.length, 0)
);

const stateChips = computed(() => {
  const counts = {};
  for (const gym of nationalGyms.value) {
    counts[gym.estado] = (counts[gym.estado] || 0) + 1;
  }
  return Object.entries(counts).map(([estado, count]) => ({ estado, count }));
});

const resultsCount = computed(
  () => (showHome.value ? 1 : 0) + filteredLocal.value.length + nationalCount.value
);

const hasNoResults = computed(() => resultsCount.value === 0);

/* =========================================================
   INDICADORES
========================================================= */

const allLocal = computed(() => [registeredGym.value, ...localGyms.value]);
const openNowCount = computed(() => allLocal.value.filter((g) => g.isOpen).length);
const avgOccupancy = computed(() => {
  const list = allLocal.value.filter((g) => g.isOpen);
  if (!list.length) return 0;
  return Math.round(list.reduce((sum, g) => sum + g.occupancy, 0) / list.length);
});
const statesCount = computed(() => stateChips.value.length);

/* =========================================================
   UTILIDADES DE TARJETAS
========================================================= */

const occLevel = (n) => (n > 75 ? 'high' : n >= 50 ? 'mid' : 'low');
const occLabel = (n) => t(n > 75 ? 'occHigh' : n >= 50 ? 'occMid' : 'occLow');

const mapsUrl = (gym) =>
  gym.lat != null && gym.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${gym.lat},${gym.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${gym.address}, ${gym.ciudad}, ${gym.estado}`
      )}`;

const telUrl = (gym) => `tel:${String(gym.phone || '').replace(/[^\d+]/g, '')}`;

const openGym = (gym) => router.push({ name: 'member-gym-detail', params: { id: gym.id } });

/* =========================================================
   MODAL DE MEMBRESÍAS
========================================================= */

const showMembershipModal = ref(false);
const openMembershipModal = () => (showMembershipModal.value = true);
const closeMembershipModal = () => (showMembershipModal.value = false);

/* =========================================================
   CICLO DE VIDA
========================================================= */

const handleKeydown = (event) => {
  if (event.key === 'Escape' && showMembershipModal.value) closeMembershipModal();
};

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('language-changed', handleLangChange);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('language-changed', handleLangChange);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <HeadingMember>
    <NotificationSystem ref="toastRef" />

    <div class="gyms-page">
      <main class="gyms-container">

        <!-- 1. ENCABEZADO -->
        <section class="hero">
          <div class="hero-main">
            <span class="eyebrow">{{ t('eyebrow') }}</span>

            <h1 id="turtor1">
              {{ titleParts.first }} <span>{{ titleParts.last }}</span>
            </h1>

            <p>{{ t('gymsListDesc') }}</p>

            <div class="hero-actions">
              <button type="button" class="btn-primary" :disabled="locating" @click="requestLocation">
                <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                {{ locating ? t('locating') : t('nearMe') }}
              </button>
              <button type="button" class="btn-ghost" @click="openMembershipModal">
                <svg viewBox="0 0 24 24"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                {{ t('seePlus') }}
              </button>
            </div>
          </div>

          <!-- Tu base actual -->
          <button type="button" class="hero-base" @click="openGym(registeredGym)">
            <span class="hero-base-img">
              <img :src="registeredGym.image" :alt="registeredGym.name" />
            </span>
            <span class="hero-base-copy">
              <small>{{ t('yourBase') }}</small>
              <strong>{{ registeredGym.name }}</strong>
              <span class="hero-base-meta">
                <i class="dot" :class="registeredGym.isOpen ? 'open' : 'closed'"></i>
                {{ registeredGym.isOpen ? t('statusOpen') : t('statusClosed') }}
                · {{ registeredGym.occupancy }}%
              </span>
            </span>
            <svg class="hero-base-arrow" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </section>

        <!-- 2. INDICADORES -->
        <section class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-icon accent">
              <svg viewBox="0 0 24 24"><path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="highlight">{{ localGyms.length + 1 }}</strong>
              <span>{{ t('kpiBranches') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon success">
              <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ openNowCount }}</strong>
              <span>{{ t('kpiOpen') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ statesCount }}</strong>
              <span>{{ t('kpiStates') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon warning">
              <svg viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ avgOccupancy }}%</strong>
              <span>{{ t('kpiOccupancy') }}</span>
            </div>
          </article>
        </section>

        <!-- 3. BARRA DE EXPLORACIÓN -->
        <section class="toolbar">
          <div class="toolbar-row">
            <label class="search-box">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="t('searchPlaceholder')"
                :aria-label="t('searchPlaceholder')"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="clear-search"
                :aria-label="t('clearSearch')"
                @click="searchQuery = ''"
              >&times;</button>
            </label>

            <label class="select-box">
              <span>{{ t('sortBy') }}</span>
              <select v-model="sortBy">
                <option value="relevance">{{ t('sortRelevance') }}</option>
                <option value="name">{{ t('sortName') }}</option>
                <option value="occupancy">{{ t('sortOccupancy') }}</option>
                <option value="nearest" :disabled="!userPos">{{ t('sortNearest') }}</option>
              </select>
            </label>

            <div class="view-toggle" role="group">
              <button
                type="button"
                :class="{ active: viewMode === 'grid' }"
                :title="t('viewGrid')"
                :aria-label="t('viewGrid')"
                @click="viewMode = 'grid'"
              >
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              </button>
              <button
                type="button"
                :class="{ active: viewMode === 'list' }"
                :title="t('viewList')"
                :aria-label="t('viewList')"
                @click="viewMode = 'list'"
              >
                <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>

          <div class="toolbar-row chips-row">
            <div class="segmented" role="tablist">
              <button type="button" :class="{ active: scope === 'all' }" @click="scope = 'all'">{{ t('scopeAll') }}</button>
              <button type="button" :class="{ active: scope === 'local' }" @click="scope = 'local'; stateFilter = 'all'">{{ t('scopeLocal') }}</button>
              <button type="button" :class="{ active: scope === 'national' }" @click="scope = 'national'">{{ t('scopeNational') }}</button>
            </div>

            <div class="chips">
              <button type="button" class="chip" :class="{ active: onlyOpen }" @click="onlyOpen = !onlyOpen">
                <i class="dot open"></i>{{ t('filterOpen') }}
              </button>
              <button type="button" class="chip" :class="{ active: lowCrowd }" @click="lowCrowd = !lowCrowd">
                <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>
                {{ t('filterQuiet') }}
              </button>
              <button type="button" class="chip" :class="{ active: sortBy === 'nearest' }" :disabled="locating" @click="sortBy === 'nearest' ? (sortBy = 'relevance') : requestLocation()">
                <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                {{ locating ? t('locating') : t('nearMe') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Resultados -->
        <div class="results-bar">
          <span><b>{{ resultsCount }}</b> {{ resultsCount === 1 ? t('result') : t('results') }}</span>
          <button v-if="hasActiveFilters" type="button" class="link-btn" @click="clearFilters">
            {{ t('clearFilters') }} ✕
          </button>
        </div>

        <!-- 4. TU BASE ACTUAL -->
        <section v-if="showHome" id="turtor2" class="block">
          <header class="block-head">
            <div>
              <span class="section-eyebrow">{{ t('yourBase') }}</span>
              <h2>{{ t('registeredGymTitle') }}</h2>
              <p>{{ t('registeredGymSub') }}</p>
            </div>
          </header>

          <article
            id="turtor3"
            class="home-card"
            tabindex="0"
            role="link"
            @click="openGym(registeredGym)"
            @keydown.enter="openGym(registeredGym)"
          >
            <div class="home-media">
              <img :src="registeredGym.image" :alt="registeredGym.name" />
              <span class="open-badge" :class="{ open: registeredGym.isOpen }">
                <i></i>{{ registeredGym.isOpen ? t('statusOpen') : t('statusClosed') }}
              </span>
              <span v-if="formatDistance(registeredGym)" class="dist-badge">{{ formatDistance(registeredGym) }}</span>
            </div>

            <div class="home-body">
              <div class="home-title">
                <h3>{{ registeredGym.name }}</h3>
                <span class="base-badge">{{ t('mainBaseBadge') }}</span>
              </div>

              <ul class="meta">
                <li>
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{{ registeredGym.address }} · {{ registeredGym.ciudad }}, {{ abreviarEstado(registeredGym.estado) }}</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  <span>{{ registeredGym.schedule }}</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                  <span>{{ registeredGym.phone }}</span>
                </li>
              </ul>

              <div class="occ">
                <div class="occ-head">
                  <span>{{ t('liveOccupancyLabel') }}</span>
                  <b :class="occLevel(registeredGym.occupancy)">
                    {{ occLabel(registeredGym.occupancy) }} · {{ registeredGym.occupancy }}%
                  </b>
                </div>
                <div class="occ-track" :class="occLevel(registeredGym.occupancy)">
                  <i :style="{ width: registeredGym.occupancy + '%' }"></i>
                </div>
              </div>

              <div class="gym-actions">
                <button type="button" class="btn-primary" @click.stop="openGym(registeredGym)">{{ t('viewDetail') }}</button>
                <a class="btn-ghost" :href="mapsUrl(registeredGym)" target="_blank" rel="noopener noreferrer" @click.stop>
                  <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  {{ t('directions') }}
                </a>
                <a class="btn-ghost icon-only" :href="telUrl(registeredGym)" :title="t('call')" :aria-label="t('call')" @click.stop>
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                </a>
              </div>
            </div>
          </article>
        </section>

        <!-- 5. SUCURSALES EN CIUDAD VALLES -->
        <section v-if="filteredLocal.length" id="turtor4" class="block">
          <header class="block-head">
            <div>
              <span class="section-eyebrow">{{ t('scopeLocal').toUpperCase() }}</span>
              <h2>{{ t('localGymsTitle') }}</h2>
              <p>{{ t('localGymsSub') }}</p>
            </div>
            <span class="count-pill">{{ filteredLocal.length }}</span>
          </header>

          <div class="gyms-grid" :class="viewMode">
            <article
              v-for="gym in filteredLocal"
              :key="gym.id"
              class="gym-card"
              :class="{ closed: !gym.isOpen }"
              tabindex="0"
              role="link"
              @click="openGym(gym)"
              @keydown.enter="openGym(gym)"
            >
              <div class="gym-media">
                <img :src="gym.image" :alt="gym.name" loading="lazy" />
                <span class="open-badge" :class="{ open: gym.isOpen }">
                  <i></i>{{ gym.isOpen ? t('statusOpen') : t('statusClosed') }}
                </span>
                <span v-if="formatDistance(gym)" class="dist-badge">{{ formatDistance(gym) }}</span>
                <span class="loc-badge">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ gym.ciudad }}, {{ abreviarEstado(gym.estado) }}
                </span>
              </div>

              <div class="gym-body">
                <h3>{{ gym.name }}</h3>

                <ul class="meta">
                  <li>
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{{ gym.address }}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    <span>{{ gym.schedule }}</span>
                  </li>
                </ul>

                <div class="occ">
                  <div class="occ-head">
                    <span>{{ t('liveOccupancyLabel') }}</span>
                    <b :class="occLevel(gym.occupancy)">{{ occLabel(gym.occupancy) }} · {{ gym.occupancy }}%</b>
                  </div>
                  <div class="occ-track" :class="occLevel(gym.occupancy)">
                    <i :style="{ width: gym.occupancy + '%' }"></i>
                  </div>
                </div>

                <div class="gym-actions">
                  <button type="button" class="btn-primary" @click.stop="openGym(gym)">{{ t('viewDetail') }}</button>
                  <a class="btn-ghost icon-only" :href="mapsUrl(gym)" target="_blank" rel="noopener noreferrer" :title="t('directions')" :aria-label="t('directions')" @click.stop>
                    <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  </a>
                  <a class="btn-ghost icon-only" :href="telUrl(gym)" :title="t('call')" :aria-label="t('call')" @click.stop>
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- 6. RED NACIONAL PLUS -->
        <section v-if="scope !== 'local' && !lowCrowd" id="turtor5" class="block">
          <header class="block-head">
            <div>
              <span class="section-eyebrow">PLUS</span>
              <h2>{{ t('nationalGymsTitle') }}</h2>
              <p>{{ t('nationalGymsSub') }}</p>
            </div>
            <span class="count-pill">{{ nationalCount }}</span>
          </header>

          <!-- Banner Plus -->
          <div class="plus-banner">
            <span class="plus-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
            </span>
            <div class="plus-copy">
              <strong>{{ t('plusBannerTitle') }}</strong>
              <span>{{ t('plusBannerDesc') }}</span>
            </div>
            <button type="button" class="btn-primary" @click="openMembershipModal">{{ t('plusBannerBtn') }}</button>
          </div>

          <!-- Estados -->
          <div class="state-chips" role="tablist">
            <button type="button" class="chip" :class="{ active: stateFilter === 'all' }" @click="pickState('all')">
              {{ t('allStates') }}
            </button>
            <button
              v-for="s in stateChips"
              :key="s.estado"
              type="button"
              class="chip"
              :class="{ active: stateFilter === s.estado }"
              @click="pickState(s.estado)"
            >
              {{ s.estado }} <em>{{ s.count }}</em>
            </button>
          </div>

          <div v-for="(gyms, estado) in nationalByState" :key="estado" class="state-group">
            <h3 class="state-title">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ estado }}
              <span class="count-pill sm">{{ gyms.length }}</span>
            </h3>

            <div class="gyms-grid" :class="viewMode">
              <article v-for="gym in gyms" :key="gym.id" class="gym-card locked">
                <div class="gym-media">
                  <img :src="gym.image" :alt="gym.name" loading="lazy" />
                  <span class="plus-badge">
                    <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    {{ t('plusBadge') }}
                  </span>
                  <span class="loc-badge">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ gym.ciudad }}, {{ abreviarEstado(gym.estado) }}
                  </span>
                </div>

                <div class="gym-body">
                  <h3>{{ gym.name }}</h3>

                  <ul class="meta">
                    <li>
                      <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{{ gym.address }}</span>
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                      <span>{{ gym.schedule }}</span>
                    </li>
                  </ul>

                  <div class="gym-actions">
                    <button type="button" class="btn-lock" @click="openMembershipModal">
                      <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                      {{ t('lockBtn') }}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- ESTADO VACÍO -->
        <div v-if="hasNoResults" class="empty-state">
          <span class="empty-icon">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <h3>{{ t('noResultsTitle') }}</h3>
          <p>{{ t('noResultsDesc') }}</p>
          <button type="button" class="btn-primary" @click="clearFilters">{{ t('clearFilters') }}</button>
        </div>
      </main>

      <!-- MODAL DE MEMBRESÍAS -->
      <transition name="pop">
        <div v-if="showMembershipModal" class="modal-wrapper" @click.self="closeMembershipModal">
          <UpgradeMembershipModal @close="closeMembershipModal" />
        </div>
      </transition>
    </div>
  </HeadingMember>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

button,
input,
select {
  font: inherit;
}

/* =========================================================
   BASE
========================================================= */

.gyms-page {
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
  --red: #f87171;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  min-height: calc(100vh - 72px);
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.gyms-container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 30px 32px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.eyebrow,
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  color: var(--hl);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.eyebrow::before,
.section-eyebrow::before {
  content: '';
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
}

.highlight { color: var(--hl) !important; }

.dot {
  width: 7px;
  height: 7px;
  flex: none;
  display: inline-block;
  border-radius: 50%;
  background: var(--text3);
}

.dot.open { background: var(--green); box-shadow: 0 0 8px var(--green); }
.dot.closed { background: var(--red); box-shadow: 0 0 8px var(--red); }

/* =========================================================
   BOTONES
========================================================= */

.btn-primary,
.btn-ghost,
.btn-lock {
  min-height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 0.2s ease, transform 0.2s var(--ease), background 0.2s ease, border-color 0.2s ease;
}

.btn-primary svg,
.btn-ghost svg,
.btn-lock svg { width: 16px; height: 16px; flex: none; }

.btn-primary {
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--hl));
  border: 0;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 22%, transparent);
}

.btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: wait; }

.btn-ghost {
  color: var(--title);
  background: var(--surface);
  border: 1px solid var(--line2);
}

.btn-ghost:hover { background: var(--surface-hover); transform: translateY(-1px); }

.btn-ghost.icon-only { width: 42px; padding: 0; }

.btn-lock {
  width: 100%;
  color: var(--amber);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.32);
}

.btn-lock:hover { background: rgba(245, 158, 11, 0.18); transform: translateY(-1px); }

.link-btn {
  padding: 7px 12px;
  color: var(--hl);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  background: var(--hl-soft);
  border: 1px solid transparent;
  border-radius: 999px;
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.link-btn:hover { background: var(--hl-mid); border-color: var(--hl-line); }

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
[role='link']:focus-visible {
  outline: 2px solid var(--hl);
  outline-offset: 2px;
}

/* =========================================================
   1. ENCABEZADO
========================================================= */

.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: center;
  gap: 28px;
  padding: 36px;
  background:
    radial-gradient(520px 260px at 100% 0%, var(--hl-mid), transparent 70%),
    linear-gradient(135deg, color-mix(in srgb, var(--card) 92%, white), var(--card) 55%, rgba(10, 10, 10, 0.96));
  border: 1px solid var(--line2);
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse at 100% 0%, #000, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 100% 0%, #000, transparent 70%);
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  right: -70px;
  bottom: -190px;
  width: 320px;
  height: 320px;
  border: 1px solid var(--hl-mid);
  border-radius: 50%;
  box-shadow: 0 0 0 38px var(--hl-soft), 0 0 0 39px var(--hl-soft);
  pointer-events: none;
}

.hero-main,
.hero-base {
  position: relative;
  z-index: 1;
}

.hero-main h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(28px, 3.8vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.5px;
}

.hero-main h1 span {
  color: var(--hl);
  text-shadow: 0 0 36px var(--hl-line);
}

.hero-main p {
  max-width: 560px;
  margin: 14px 0 0;
  color: var(--text2);
  font-size: 14px;
  line-height: 1.6;
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-base {
  width: 100%;
  padding: 10px 14px 10px 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid var(--line2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s var(--ease), border-color 0.2s ease;
}

.hero-base:hover { transform: translateY(-3px); border-color: var(--hl-line); }

.hero-base-img {
  width: 68px;
  height: 68px;
  flex: none;
  overflow: hidden;
  border: 1px solid var(--line2);
  border-radius: 15px;
}

.hero-base-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero-base-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }

.hero-base-copy small {
  color: var(--hl);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
}

.hero-base-copy strong {
  overflow: hidden;
  color: #fff;
  font-size: 14.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-base-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text2);
  font-size: 11.5px;
}

.hero-base-arrow { width: 18px; height: 18px; flex: none; color: var(--text3); }

/* =========================================================
   2. INDICADORES
========================================================= */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  --tint: rgba(255, 255, 255, 0.7);

  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 20px 22px;
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
  transition: transform 0.25s var(--ease), border-color 0.25s ease, box-shadow 0.25s ease;
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

.kpi-card:nth-child(1) { --tint: var(--hl); }
.kpi-card:nth-child(2) { --tint: #34d399; }
.kpi-card:nth-child(4) { --tint: #f59e0b; }

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--tint) 40%, transparent);
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.34);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line);
  border-radius: 15px;
}

.kpi-icon.accent { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }
.kpi-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.kpi-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.28); }

.kpi-icon svg { width: 22px; height: 22px; stroke-width: 1.8; }

.kpi-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }

.kpi-body strong {
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.3px;
}

.kpi-body span {
  color: var(--text3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
  line-height: 1.3;
  text-transform: uppercase;
}

/* =========================================================
   3. BARRA DE EXPLORACIÓN
========================================================= */

.toolbar {
  position: sticky;
  top: 82px;
  z-index: 30;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: color-mix(in srgb, var(--card) 92%, transparent);
  border: 1px solid var(--line2);
  border-radius: 20px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box {
  min-width: 0;
  height: 46px;
  flex: 1;
  padding: 0 8px 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--hl);
  box-shadow: 0 0 0 3px var(--hl-soft);
}

.search-box > svg { width: 18px; height: 18px; flex: none; color: var(--text3); }

.search-box input {
  min-width: 0;
  flex: 1;
  height: 100%;
  color: #fff;
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: none;
}

.search-box input::placeholder { color: var(--text3); }
.search-box input::-webkit-search-cancel-button { display: none; }

.clear-search {
  width: 28px;
  height: 28px;
  flex: none;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border: 0;
  border-radius: 50%;
}

.clear-search:hover { background: rgba(255, 255, 255, 0.16); }

.select-box {
  height: 46px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
}

.select-box span {
  color: var(--text3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.select-box select {
  height: 100%;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  background: transparent;
  border: 0;
  outline: none;
  cursor: pointer;
  color-scheme: dark;
}

.select-box select option { background: #15171b; }

.view-toggle {
  height: 46px;
  padding: 4px;
  display: flex;
  gap: 3px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
}

.view-toggle button {
  width: 38px;
  display: grid;
  place-items: center;
  color: var(--text3);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;
  transition: background 0.2s ease, color 0.2s ease;
}

.view-toggle button svg { width: 17px; height: 17px; }
.view-toggle button:hover { color: #fff; }
.view-toggle button.active { color: #fff; background: var(--hl); }

.chips-row { justify-content: space-between; }

.segmented {
  padding: 4px;
  display: flex;
  flex: none;
  gap: 3px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line2);
  border-radius: 13px;
}

.segmented button {
  height: 34px;
  padding: 0 14px;
  color: var(--text2);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;
  transition: background 0.2s ease, color 0.2s ease;
}

.segmented button:hover { color: #fff; }
.segmented button.active { color: #fff; background: var(--hl); }

.chips {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.chip {
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text2);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.chip svg { width: 14px; height: 14px; }
.chip em { color: var(--text3); font-size: 10.5px; font-style: normal; font-weight: 800; }
.chip:hover:not(:disabled) { color: #fff; background: var(--surface-hover); }
.chip:disabled { opacity: 0.6; cursor: wait; }

.chip.active {
  color: #fff;
  background: var(--hl-mid);
  border-color: var(--hl-line);
}

.chip.active em { color: #fff; }

.results-bar {
  margin: -6px 2px -4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text2);
  font-size: 12.5px;
}

.results-bar b { color: #fff; }

/* =========================================================
   BLOQUES
========================================================= */

.block {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.block-head {
  padding-bottom: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.block-head .section-eyebrow { margin-bottom: 5px; font-size: 9.5px; }

.block-head h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.block-head p {
  margin: 5px 0 0;
  color: var(--text3);
  font-size: 12.5px;
}

.count-pill {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 800;
}

.count-pill.sm {
  min-width: 26px;
  height: 24px;
  border-radius: 999px;
  font-size: 11px;
}

/* =========================================================
   TARJETA: BASE ACTUAL
========================================================= */

.home-card {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%), var(--card);
  border: 1px solid var(--hl-line);
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32), 0 0 0 1px var(--hl-soft);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--hl-mid);
}

.home-media {
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

.home-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.home-card:hover .home-media img { transform: scale(1.04); }

.home-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 55%, var(--card)), linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.home-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.home-title h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 26px;
  font-weight: 600;
}

.base-badge {
  padding: 5px 11px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

/* =========================================================
   TARJETAS DE SEDES
========================================================= */

.gyms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.gym-card {
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.032), transparent 38%), var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
  transition: transform 0.3s var(--ease), border-color 0.25s ease, box-shadow 0.3s ease;
}

.gym-card:hover {
  transform: translateY(-5px);
  border-color: var(--hl-line);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38);
}

.gym-card.locked { cursor: default; }
.gym-card.locked:hover { border-color: rgba(245, 158, 11, 0.4); }

.gym-media {
  position: relative;
  height: 190px;
  flex: none;
  overflow: hidden;
}

.gym-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s var(--ease), filter 0.3s ease;
}

.gym-card:hover .gym-media img { transform: scale(1.06); }
.gym-card.closed .gym-media img { filter: grayscale(0.55) brightness(0.8); }
.gym-card.locked .gym-media img { filter: brightness(0.7) saturate(0.85); }

.gym-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.7));
  pointer-events: none;
}

.open-badge,
.dist-badge,
.loc-badge,
.plus-badge {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.open-badge {
  top: 12px;
  right: 12px;
  padding: 5px 11px;
  color: #fff;
  background: rgba(239, 68, 68, 0.9);
}

.open-badge.open { background: rgba(16, 185, 129, 0.92); }

.open-badge i {
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

.dist-badge {
  top: 12px;
  left: 12px;
  padding: 5px 11px;
  color: #fff;
  background: rgba(10, 10, 10, 0.72);
  border: 1px solid var(--line2);
}

.loc-badge {
  left: 12px;
  bottom: 12px;
  max-width: calc(100% - 24px);
  padding: 5px 11px;
  color: #93c5fd;
  background: rgba(10, 10, 10, 0.75);
  border: 1px solid var(--hl-line);
}

.loc-badge svg { width: 12px; height: 12px; flex: none; }

.plus-badge {
  top: 12px;
  right: 12px;
  padding: 5px 11px;
  color: var(--amber);
  background: rgba(10, 10, 10, 0.78);
  border: 1px solid rgba(245, 158, 11, 0.45);
  letter-spacing: 0.8px;
}

.plus-badge svg { width: 12px; height: 12px; }

.gym-body {
  min-width: 0;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gym-body h3 {
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.meta li {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text2);
  font-size: 12.5px;
  line-height: 1.45;
}

.meta li svg {
  width: 15px;
  height: 15px;
  margin-top: 1px;
  flex: none;
  color: var(--hl);
}

.meta li span { min-width: 0; overflow-wrap: anywhere; }

.occ {
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.occ-head {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text3);
  font-size: 10.5px;
  font-weight: 700;
}

.occ-head b { font-size: 11px; }
.occ-head b.low { color: var(--green); }
.occ-head b.mid { color: var(--amber); }
.occ-head b.high { color: var(--red); }

.occ-track {
  height: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 999px;
}

.occ-track i {
  display: block;
  height: 100%;
  background: var(--green);
  border-radius: 999px;
  transition: width 0.7s var(--ease);
}

.occ-track.mid i { background: var(--amber); }
.occ-track.high i { background: var(--red); }

.gym-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
}

.gym-actions .btn-primary { flex: 1; }

/* =========================================================
   RED NACIONAL
========================================================= */

.plus-banner {
  position: relative;
  overflow: hidden;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  background:
    radial-gradient(320px 140px at 0% 0%, rgba(245, 158, 11, 0.18), transparent 75%),
    linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent 70%),
    var(--card);
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-radius: 20px;
}

.plus-icon {
  width: 48px;
  height: 48px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--amber);
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 14px;
}

.plus-icon svg { width: 22px; height: 22px; }

.plus-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.plus-copy strong { color: var(--title); font-size: 14.5px; }
.plus-copy span { color: var(--text2); font-size: 12.5px; line-height: 1.5; }

.state-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.state-group { display: flex; flex-direction: column; gap: 14px; }

.state-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.state-title svg { width: 15px; height: 15px; color: var(--hl); }

/* =========================================================
   VISTA DE LISTA
========================================================= */

.gyms-grid.list { grid-template-columns: 1fr; gap: 14px; }

.gyms-grid.list .gym-card { flex-direction: row; }

.gyms-grid.list .gym-media {
  width: 260px;
  height: auto;
  min-height: 170px;
}

.gyms-grid.list .gym-body { padding: 18px 20px; }

.gyms-grid.list .gym-actions { max-width: 360px; }

/* =========================================================
   VACÍO
========================================================= */

.empty-state {
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  background: var(--surface);
  border: 1.5px dashed var(--line2);
  border-radius: 22px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 20px;
}

.empty-icon svg { width: 28px; height: 28px; }

.empty-state h3 {
  margin: 4px 0 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  max-width: 360px;
  margin: 0 0 8px;
  color: var(--text2);
  font-size: 13px;
  line-height: 1.6;
}

/* =========================================================
   MODAL Y TRANSICIONES
========================================================= */

.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 5000;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.pop-enter-active,
.pop-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }

.pop-enter-from,
.pop-leave-to { opacity: 0; transform: scale(0.96); }

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .hero { grid-template-columns: 1fr; }
  .hero-base { max-width: 420px; }
  .home-card { grid-template-columns: 1fr; }
  .home-media { min-height: 240px; }
  .home-media::after { background: linear-gradient(180deg, transparent 55%, var(--card)); }
}

@media (max-width: 900px) {
  .toolbar { top: 76px; }
  .kpi-card { padding: 18px; gap: 13px; }
}

@media (max-width: 760px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }

  .toolbar-row.chips-row { flex-direction: column; align-items: stretch; }
  .segmented { width: 100%; }
  .segmented button { flex: 1; padding: 0 8px; }
  .chips { justify-content: flex-start; }
}

@media (max-width: 680px) {
  .gyms-container { padding: 14px 12px 44px; gap: 16px; }

  .hero { padding: 20px 16px; border-radius: 20px; gap: 18px; }
  .hero::after { right: -120px; bottom: -210px; }
  .hero-main p { font-size: 13px; }
  .hero-actions { margin-top: 16px; }
  .hero-actions > * { flex: 1; }
  .hero-base { max-width: none; }

  /* Indicadores 2x2 en vertical */
  .kpi-grid { gap: 9px; }

  .kpi-card {
    padding: 16px 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    border-radius: 17px;
  }

  .kpi-card::before { left: 14px; right: 14px; }
  .kpi-icon { width: 38px; height: 38px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body { gap: 5px; }
  .kpi-body strong { font-size: 28px; }
  .kpi-body span { font-size: 9.5px; }

  /* Barra de exploración */
  .toolbar { top: 70px; padding: 10px; gap: 10px; border-radius: 17px; }

  .toolbar-row:first-child { flex-wrap: wrap; }
  .search-box { flex: 1 1 100%; }
  .select-box { flex: 1; min-width: 0; }
  .select-box select { width: 100%; min-width: 0; }

  .chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -10px;
    padding: 0 10px;
    scrollbar-width: none;
  }

  .chips::-webkit-scrollbar { display: none; }

  .state-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -12px;
    padding: 0 12px 2px;
    scrollbar-width: none;
  }

  .state-chips::-webkit-scrollbar { display: none; }

  /* Bloques */
  .block { gap: 14px; }
  .block-head h2 { font-size: 20px; }

  .home-body { padding: 20px 16px; gap: 14px; }
  .home-title h3 { font-size: 22px; }
  .home-media { min-height: 200px; }

  .gyms-grid { grid-template-columns: 1fr; gap: 14px; }
  .gym-media { height: 170px; }
  .gym-body { padding: 16px; }

  /* Lista compacta en móvil */
  .gyms-grid.list .gym-card { flex-direction: row; }
  .gyms-grid.list .gym-media { width: 116px; min-height: 0; height: auto; }
  .gyms-grid.list .gym-media::after { background: rgba(0, 0, 0, 0.2); }
  .gyms-grid.list .dist-badge,
  .gyms-grid.list .loc-badge { display: none; }
  .gyms-grid.list .open-badge,
  .gyms-grid.list .plus-badge { top: 8px; right: 8px; padding: 4px 8px; font-size: 9px; }
  .gyms-grid.list .gym-body { padding: 12px 14px; gap: 10px; }
  .gyms-grid.list .gym-body h3 { font-size: 16px; }
  .gyms-grid.list .meta li:nth-child(2) { display: none; }
  .gyms-grid.list .occ { padding: 8px 10px; }
  .gyms-grid.list .gym-actions { max-width: none; }
  .gyms-grid.list .btn-primary,
  .gyms-grid.list .btn-lock { min-height: 38px; font-size: 12px; }
  .gyms-grid.list .btn-ghost.icon-only { width: 38px; min-height: 38px; }

  .plus-banner { flex-wrap: wrap; padding: 16px; }
  .plus-banner .btn-primary { width: 100%; }
}

@media (max-width: 400px) {
  .hero-actions { flex-direction: column; }
  .gyms-grid.list .gym-media { width: 96px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>