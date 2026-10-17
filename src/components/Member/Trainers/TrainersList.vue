<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import HeadingMember from '../HeadingMember.vue';
import UpgradeMembershipModal from '../Modals/UpgradeMembershipModal.vue';

const router = useRouter();
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');

/* -------------------------------------------------------------------- */
/* DATOS MOCK — sustituir por la respuesta real de tu API / backend.    */
/* La forma de cada entrenador refleja los campos capturados en el      */
/* formulario de registro de personal (RegistroPersonal.vue).          */
/* -------------------------------------------------------------------- */

// Sede a la que pertenece el socio (misma que registeredGym en GestionSedes)
const miSedeId = 1;

const entrenadoresMiSede = ref([
  {
    id: 101,
    nombres: 'Daniela',
    apellidoP: 'Reyes',
    apellidoM: 'Cortés',
    especialidad: 'Entrenamiento de Fuerza',
    foto: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    sedeId: 1,
    sedeNombre: 'IronFit Valles Centro',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    celular: '+52 481 100 2211',
    horaEntrada: '06:00',
    horaSalida: '14:00',
    aniosExperiencia: 6,
    redes: { instagram: '@dani.fuerza', tiktok: '@dani.fuerza' }
  },
  {
    id: 102,
    nombres: 'Marco',
    apellidoP: 'Villanueva',
    apellidoM: 'Ibarra',
    especialidad: 'Boxeo y Acondicionamiento',
    foto: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
    sedeId: 1,
    sedeNombre: 'IronFit Valles Centro',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    celular: '+52 481 100 3344',
    horaEntrada: '14:00',
    horaSalida: '21:00',
    aniosExperiencia: 4,
    redes: { instagram: '@marcobox_fit', facebook: 'MarcoBoxFit' }
  },
  {
    id: 103,
    nombres: 'Paola',
    apellidoP: 'Serrano',
    apellidoM: 'Munguía',
    especialidad: 'Yoga y Movilidad',
    foto: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
    sedeId: 1,
    sedeNombre: 'IronFit Valles Centro',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    celular: '+52 481 100 5566',
    horaEntrada: '07:00',
    horaSalida: '13:00',
    aniosExperiencia: 8,
    redes: { instagram: '@paola.yoga' }
  }
]);

const entrenadoresLocales = ref([
  {
    id: 104,
    nombres: 'Héctor',
    apellidoP: 'Domínguez',
    apellidoM: 'Ramos',
    especialidad: 'CrossFit',
    foto: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    sedeId: 2,
    sedeNombre: 'IronFit Norte - Plaza San José',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    celular: '+52 481 200 1122',
    horaEntrada: '05:00',
    horaSalida: '12:00',
    aniosExperiencia: 5,
    redes: { instagram: '@hector.crossfit' }
  },
  {
    id: 105,
    nombres: 'Renata',
    apellidoP: 'Cabrera',
    apellidoM: 'Solís',
    especialidad: 'Spinning',
    foto: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80',
    sedeId: 3,
    sedeNombre: 'IronFit Poniente',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    celular: '+52 481 300 7788',
    horaEntrada: '16:00',
    horaSalida: '20:00',
    aniosExperiencia: 3,
    redes: { tiktok: '@renata.spin', instagram: '@renata.spin' }
  },
  {
    id: 106,
    nombres: 'Iván',
    apellidoP: 'Torres',
    apellidoM: 'Guerra',
    especialidad: 'Nutrición Deportiva',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sedeId: 6,
    sedeNombre: 'IronFit Sur - Plaza Tangamanga',
    ciudad: 'Ciudad Valles',
    estado: 'San Luis Potosí',
    celular: '+52 481 400 9900',
    horaEntrada: '09:00',
    horaSalida: '17:00',
    aniosExperiencia: 7,
    redes: { instagram: '@ivan.nutricion' }
  }
]);

const entrenadoresNacionales = ref([
  {
    id: 107,
    nombres: 'Fernanda',
    apellidoP: 'López',
    apellidoM: 'Aguilar',
    especialidad: 'Pilates Reformer',
    foto: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80',
    sedeNombre: 'IronFit CDMX Polanco (Plus)',
    ciudad: 'Polanco',
    estado: 'Ciudad de México'
  },
  {
    id: 108,
    nombres: 'Rodrigo',
    apellidoP: 'Elizondo',
    apellidoM: 'Farías',
    especialidad: 'Halterofilia',
    foto: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    sedeNombre: 'IronFit Monterrey San Pedro (Plus)',
    ciudad: 'San Pedro Garza García',
    estado: 'Nuevo León'
  },
  {
    id: 109,
    nombres: 'Ximena',
    apellidoP: 'Bravo',
    apellidoM: 'Delgado',
    especialidad: 'Funcional / HIIT',
    foto: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    sedeNombre: 'IronFit Guadalajara Andares (Plus)',
    ciudad: 'Zapopan',
    estado: 'Jalisco'
  },
  {
    id: 110,
    nombres: 'Álvaro',
    apellidoP: 'Nájera',
    apellidoM: 'Pineda',
    especialidad: 'Boxeo',
    foto: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
    sedeNombre: 'IronFit Querétaro Antea (Plus)',
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

const nombreCompleto = (e) => `${e.nombres} ${e.apellidoP}${e.apellidoM ? ' ' + e.apellidoM : ''}`;
const iniciales = (e) => `${e.nombres?.[0] || ''}${e.apellidoP?.[0] || ''}`.toUpperCase();

/* =========================================================
   FILTROS, BÚSQUEDA Y ORDEN
========================================================= */
const PAGE_SIZE = 40;

const searchQuery = ref('');
const scope = ref('all');          /* all | local | national */
const sortBy = ref('relevance');   /* relevance | name | experience */
const viewMode = ref(localStorage.getItem('member-trainers-list-view') === 'list' ? 'list' : 'grid');
const pageLocal = ref(1);

watch(viewMode, (v) => localStorage.setItem('member-trainers-list-view', v));

const normalize = (str) =>
  (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const query = computed(() => normalize(searchQuery.value.trim()));

const matchesQuery = (ent) =>
  !query.value ||
  normalize(nombreCompleto(ent)).includes(query.value) ||
  normalize(ent.especialidad).includes(query.value) ||
  normalize(ent.ciudad).includes(query.value) ||
  normalize(ent.estado).includes(query.value) ||
  normalize(ent.sedeNombre).includes(query.value);

const sortList = (list) => {
  const copy = [...list];
  if (sortBy.value === 'name') {
    copy.sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b)));
  } else if (sortBy.value === 'experience') {
    copy.sort((a, b) => (b.aniosExperiencia || 0) - (a.aniosExperiencia || 0));
  }
  return copy;
};

const hasActiveFilters = computed(
  () => !!query.value || scope.value !== 'all' || sortBy.value !== 'relevance'
);

const clearFilters = () => {
  searchQuery.value = '';
  scope.value = 'all';
  sortBy.value = 'relevance';
};

const filteredMiSede = computed(() =>
  scope.value === 'national' ? [] : sortList(entrenadoresMiSede.value.filter(matchesQuery))
);

const filteredLocales = computed(() =>
  scope.value === 'national' ? [] : sortList(entrenadoresLocales.value.filter(matchesQuery))
);

const filteredNacionalesPorEstado = computed(() => {
  if (scope.value === 'local') return {};
  const groups = {};
  for (const ent of sortList(entrenadoresNacionales.value.filter(matchesQuery))) {
    (groups[ent.estado] ||= []).push(ent);
  }
  return groups;
});

const nacionalesCount = computed(() =>
  Object.values(filteredNacionalesPorEstado.value).reduce((sum, list) => sum + list.length, 0)
);

const resultsCount = computed(
  () => filteredMiSede.value.length + filteredLocales.value.length + nacionalesCount.value
);

const hasNoResults = computed(() => resultsCount.value === 0);

/* Paginación de entrenadores de otras sedes */
const totalPagesLocal = computed(() => Math.max(1, Math.ceil(filteredLocales.value.length / PAGE_SIZE)));
const pagedLocales = computed(() => {
  const start = (pageLocal.value - 1) * PAGE_SIZE;
  return filteredLocales.value.slice(start, start + PAGE_SIZE);
});
const rangeStart = computed(() => (filteredLocales.value.length ? (pageLocal.value - 1) * PAGE_SIZE + 1 : 0));
const rangeEnd = computed(() => Math.min(pageLocal.value * PAGE_SIZE, filteredLocales.value.length));

watch([searchQuery, scope, sortBy], () => { pageLocal.value = 1; });
watch(totalPagesLocal, (n) => { if (pageLocal.value > n) pageLocal.value = n; });

const goPageLocal = (n) => {
  pageLocal.value = Math.min(Math.max(1, n), totalPagesLocal.value);
  nextTick(() => {
    document.getElementById('tutorial-other-headquarters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

/* =========================================================
   INDICADORES
========================================================= */
const miSedeNombre = computed(() => entrenadoresMiSede.value[0]?.sedeNombre || '');
const statesCount = computed(() => new Set(entrenadoresNacionales.value.map((e) => e.estado)).size);

const scrollToMySede = () => {
  document.getElementById('tutorial-my-headquarters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* =========================================================
   NAVEGACIÓN Y MODAL
========================================================= */
const showMembershipModal = ref(false);
const openMembershipModal = () => { showMembershipModal.value = true; };
const closeMembershipModal = () => { showMembershipModal.value = false; };

const irADetalle = (id) => {
  router.push({ name: 'member-trainers-chat', params: { id } });
};

const telUrl = (ent) => `tel:${String(ent.celular || '').replace(/[^\d+]/g, '')}`;

/* =========================================================
   i18n
========================================================= */
const traducciones = {
  es: {
    eyebrow: 'EQUIPO DE ENTRENADORES',
    pageTitle: 'Nuestros Entrenadores',
    pageDesc: 'Conoce al equipo que entrena contigo en tu sede, descubre entrenadores en otras sucursales de la ciudad, o desbloquea la red nacional con Plus.',
    seePlus: 'Ver Plus',
    yourGym: 'TU SEDE',
    kpiMiSede: 'ENTRENADORES EN TU SEDE',
    kpiLocales: 'EN OTRAS SEDES DE LA CIUDAD',
    kpiStates: 'ESTADOS CON COBERTURA PLUS',
    kpiNational: 'ENTRENADORES RED PLUS',
    searchPlaceholder: 'Busca por nombre, especialidad, sede o ciudad…',
    clearSearch: 'Limpiar búsqueda',
    sortBy: 'Ordenar',
    sortRelevance: 'Relevancia',
    sortName: 'Nombre (A-Z)',
    sortExperience: 'Más experiencia',
    viewGrid: 'Cuadrícula',
    viewList: 'Lista',
    scopeAll: 'Todos',
    scopeLocal: 'Mi ciudad',
    scopeNational: 'Red nacional Plus',
    clearFilters: 'Limpiar filtros',
    results: 'resultados',
    result: 'resultado',
    miSedeTitle: 'Entrenadores en tu Sede',
    miSedeSub: 'El equipo que entrena contigo todos los días.',
    localesTitle: 'Entrenadores en Ciudad Valles',
    localesSub: 'Otras sucursales de la ciudad incluidas en tu membresía.',
    nacionalesTitle: 'Red Nacional (Acceso Plus Requerido)',
    nacionalesSub: 'Conoce entrenadores en otras ciudades del país con Membresía Plus.',
    yearsExp: 'años de experiencia',
    scheduleLabel: 'Horario',
    yourGymBadge: 'Tu Sede',
    viewProfile: 'Ver perfil',
    call: 'Llamar',
    lockTitle: 'Exclusivo Membresía Plus',
    lockBtn: 'Desbloquear con Plus',
    plusBadge: 'PLUS',
    pagination: 'Paginación de entrenadores',
    pagerOf: 'de',
    prevPage: 'Página anterior',
    nextPage: 'Página siguiente',
    noResultsTitle: 'No encontramos entrenadores con ese criterio',
    noResultsDesc: 'Intenta buscar por otra especialidad, ciudad o nombre, o quita algunos filtros.'
  },
  en: {
    eyebrow: 'TRAINER TEAM',
    pageTitle: 'Our Trainers',
    pageDesc: 'Meet the team training with you at your gym, discover trainers at other branches in the city, or unlock the national network with Plus.',
    seePlus: 'See Plus',
    yourGym: 'YOUR GYM',
    kpiMiSede: 'TRAINERS AT YOUR GYM',
    kpiLocales: 'AT OTHER BRANCHES IN THE CITY',
    kpiStates: 'STATES WITH PLUS COVERAGE',
    kpiNational: 'PLUS NETWORK TRAINERS',
    searchPlaceholder: 'Search by name, specialty, branch or city…',
    clearSearch: 'Clear search',
    sortBy: 'Sort',
    sortRelevance: 'Relevance',
    sortName: 'Name (A-Z)',
    sortExperience: 'Most experience',
    viewGrid: 'Grid',
    viewList: 'List',
    scopeAll: 'All',
    scopeLocal: 'My city',
    scopeNational: 'Plus national network',
    clearFilters: 'Clear filters',
    results: 'results',
    result: 'result',
    miSedeTitle: 'Trainers at Your Gym',
    miSedeSub: 'The team that trains with you every day.',
    localesTitle: 'Trainers in Ciudad Valles',
    localesSub: 'Other branches in the city included in your membership.',
    nacionalesTitle: 'National Network (Plus Access Required)',
    nacionalesSub: 'Meet trainers in other cities nationwide with Plus Membership.',
    yearsExp: 'years of experience',
    scheduleLabel: 'Schedule',
    yourGymBadge: 'Your Gym',
    viewProfile: 'View profile',
    call: 'Call',
    lockTitle: 'Plus Membership Exclusive',
    lockBtn: 'Unlock with Plus',
    plusBadge: 'PLUS',
    pagination: 'Trainers pagination',
    pagerOf: 'of',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    noResultsTitle: "We couldn't find any trainers matching that",
    noResultsDesc: 'Try a different specialty, city or name, or remove some filters.'
  }
};

const t = (key) => {
  const langTable = traducciones[currentLang.value] || traducciones.es;
  return langTable[key] ?? traducciones.es[key] ?? key;
};

const titleParts = computed(() => {
  const words = t('pageTitle').split(' ');
  const last = words.pop();
  return { first: words.join(' '), last };
});

const handleLangChange = (e) => {
  const nuevo = e?.detail?.idioma || localStorage.getItem('member-idioma');
  if (nuevo) currentLang.value = nuevo;
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showMembershipModal.value) closeMembershipModal();
};

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <HeadingMember>
    <div class="trainers-page">
      <main class="trainers-container">

        <!-- 1. ENCABEZADO -->
        <section id="tutorial-dashboard-header" class="hero">
          <div class="hero-main">
            <span class="eyebrow">{{ t('eyebrow') }}</span>

            <h1>{{ titleParts.first }} <span>{{ titleParts.last }}</span></h1>

            <p>{{ t('pageDesc') }}</p>

            <div class="hero-actions">
              <button type="button" class="btn-primary" @click="scrollToMySede">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                {{ t('miSedeTitle') }}
              </button>
              <button type="button" class="btn-ghost" @click="openMembershipModal">
                <svg viewBox="0 0 24 24"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                {{ t('seePlus') }}
              </button>
            </div>
          </div>

          <button v-if="entrenadoresMiSede.length" type="button" class="hero-base" @click="scrollToMySede">
            <span class="hero-base-img">
              <img :src="entrenadoresMiSede[0].foto" :alt="miSedeNombre" />
            </span>
            <span class="hero-base-copy">
              <small>{{ t('yourGym') }}</small>
              <strong>{{ miSedeNombre }}</strong>
              <span class="hero-base-meta">
                <i class="dot open"></i>
                {{ entrenadoresMiSede.length }} {{ t('kpiMiSede').toLowerCase() }}
              </span>
            </span>
            <svg class="hero-base-arrow" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </section>

        <!-- 2. INDICADORES -->
        <section class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-icon accent">
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
            </div>
            <div class="kpi-body">
              <strong class="highlight">{{ entrenadoresMiSede.length }}</strong>
              <span>{{ t('kpiMiSede') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon success">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ entrenadoresLocales.length }}</strong>
              <span>{{ t('kpiLocales') }}</span>
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
              <svg viewBox="0 0 24 24"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ entrenadoresNacionales.length }}</strong>
              <span>{{ t('kpiNational') }}</span>
            </div>
          </article>
        </section>

        <!-- 3. BARRA DE EXPLORACIÓN -->
        <section id="tutorial-dashboard-search" class="toolbar">
          <div class="toolbar-row">
            <label class="search-box">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="t('searchPlaceholder')"
                :aria-label="t('searchPlaceholder')"
              />
              <button v-if="searchQuery" type="button" class="clear-search" :aria-label="t('clearSearch')" @click="searchQuery = ''">&times;</button>
            </label>

            <label class="select-box">
              <span>{{ t('sortBy') }}</span>
              <select v-model="sortBy">
                <option value="relevance">{{ t('sortRelevance') }}</option>
                <option value="name">{{ t('sortName') }}</option>
                <option value="experience">{{ t('sortExperience') }}</option>
              </select>
            </label>

            <div class="view-toggle" role="group">
              <button type="button" :class="{ active: viewMode === 'grid' }" :title="t('viewGrid')" :aria-label="t('viewGrid')" @click="viewMode = 'grid'">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              </button>
              <button type="button" :class="{ active: viewMode === 'list' }" :title="t('viewList')" :aria-label="t('viewList')" @click="viewMode = 'list'">
                <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>

          <div class="toolbar-row">
            <div class="segmented" role="tablist">
              <button type="button" :class="{ active: scope === 'all' }" @click="scope = 'all'">{{ t('scopeAll') }}</button>
              <button type="button" :class="{ active: scope === 'local' }" @click="scope = 'local'">{{ t('scopeLocal') }}</button>
              <button type="button" :class="{ active: scope === 'national' }" @click="scope = 'national'">{{ t('scopeNational') }}</button>
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

        <!-- 4. ENTRENADORES DE TU SEDE -->
        <section v-if="filteredMiSede.length" id="tutorial-my-headquarters" class="block">
          <header class="block-head">
            <div>
              <span class="section-eyebrow">{{ t('yourGym') }}</span>
              <h2>{{ t('miSedeTitle') }}</h2>
              <p>{{ t('miSedeSub') }}</p>
            </div>
            <span class="count-pill">{{ filteredMiSede.length }}</span>
          </header>

          <div class="trainers-grid" :class="viewMode">
            <article
              v-for="ent in filteredMiSede"
              :key="ent.id"
              class="trainer-card"
              tabindex="0"
              role="link"
              @click="irADetalle(ent.id)"
              @keydown.enter="irADetalle(ent.id)"
            >
              <div class="trainer-media">
                <img v-if="ent.foto" :src="ent.foto" :alt="nombreCompleto(ent)" loading="lazy" />
                <span v-else class="trainer-initials">{{ iniciales(ent) }}</span>
                <span class="open-badge open"><i></i>{{ t('yourGymBadge') }}</span>
                <span v-if="ent.aniosExperiencia" class="loc-badge">
                  <svg viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                  {{ ent.aniosExperiencia }} {{ t('yearsExp') }}
                </span>
              </div>

              <div class="trainer-body">
                <h3>{{ nombreCompleto(ent) }}</h3>
                <p class="trainer-specialty">{{ ent.especialidad }}</p>

                <ul class="meta">
                  <li>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    <span>{{ t('scheduleLabel') }}: {{ ent.horaEntrada }} - {{ ent.horaSalida }}</span>
                  </li>
                </ul>

                <div class="gym-actions">
                  <button type="button" class="btn-primary" @click.stop="irADetalle(ent.id)">{{ t('viewProfile') }}</button>
                  <a v-if="ent.celular" class="btn-ghost icon-only" :href="telUrl(ent)" :title="t('call')" :aria-label="t('call')" @click.stop>
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- 5. ENTRENADORES DE OTRAS SEDES -->
        <section v-if="filteredLocales.length" id="tutorial-other-headquarters" class="block">
          <header class="block-head">
            <div>
              <span class="section-eyebrow">{{ t('scopeLocal') }}</span>
              <h2>{{ t('localesTitle') }}</h2>
              <p>{{ t('localesSub') }}</p>
            </div>
            <span class="count-pill">{{ filteredLocales.length }}</span>
          </header>

          <div class="trainers-grid" :class="viewMode">
            <article
              v-for="ent in pagedLocales"
              :key="ent.id"
              class="trainer-card"
              tabindex="0"
              role="link"
              @click="irADetalle(ent.id)"
              @keydown.enter="irADetalle(ent.id)"
            >
              <div class="trainer-media">
                <img v-if="ent.foto" :src="ent.foto" :alt="nombreCompleto(ent)" loading="lazy" />
                <span v-else class="trainer-initials">{{ iniciales(ent) }}</span>
                <span class="loc-badge">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ ent.ciudad }}, {{ abreviarEstado(ent.estado) }}
                </span>
              </div>

              <div class="trainer-body">
                <h3>{{ nombreCompleto(ent) }}</h3>
                <p class="trainer-specialty">{{ ent.especialidad }}</p>

                <ul class="meta">
                  <li>
                    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                    <span>{{ ent.sedeNombre }}</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    <span>{{ t('scheduleLabel') }}: {{ ent.horaEntrada }} - {{ ent.horaSalida }}</span>
                  </li>
                </ul>

                <div class="gym-actions">
                  <button type="button" class="btn-primary" @click.stop="irADetalle(ent.id)">{{ t('viewProfile') }}</button>
                  <a v-if="ent.celular" class="btn-ghost icon-only" :href="telUrl(ent)" :title="t('call')" :aria-label="t('call')" @click.stop>
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                </div>
              </div>
            </article>
          </div>

          <!-- Paginación: aparece con más de 40 entrenadores -->
          <nav v-if="filteredLocales.length > PAGE_SIZE" class="pager" :aria-label="t('pagination')">
            <span class="pager-range">{{ rangeStart }}–{{ rangeEnd }} {{ t('pagerOf') }} {{ filteredLocales.length }}</span>
            <div class="pager-btns">
              <button type="button" :disabled="pageLocal === 1" :title="t('prevPage')" :aria-label="t('prevPage')" @click="goPageLocal(pageLocal - 1)">
                <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button type="button" :disabled="pageLocal === totalPagesLocal" :title="t('nextPage')" :aria-label="t('nextPage')" @click="goPageLocal(pageLocal + 1)">
                <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </nav>
        </section>

        <!-- 6. RED NACIONAL (PLUS) -->
        <section v-if="nacionalesCount" class="block">
          <header class="block-head">
            <div>
              <span class="section-eyebrow">PLUS</span>
              <h2>{{ t('nacionalesTitle') }}</h2>
              <p>{{ t('nacionalesSub') }}</p>
            </div>
            <span class="count-pill">{{ nacionalesCount }}</span>
          </header>

          <div v-for="(ents, estado) in filteredNacionalesPorEstado" :key="estado" class="state-group">
            <h3 class="state-title">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ estado }}
              <span class="count-pill sm">{{ ents.length }}</span>
            </h3>

            <div id="tutorial-national-network" class="trainers-grid" :class="viewMode">
              <article v-for="ent in ents" :key="ent.id" class="trainer-card locked">
                <div class="trainer-media">
                  <img :src="ent.foto" :alt="nombreCompleto(ent)" loading="lazy" />
                  <span class="plus-badge">
                    <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    {{ t('plusBadge') }}
                  </span>
                  <span class="loc-badge">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ ent.ciudad }}, {{ abreviarEstado(ent.estado) }}
                  </span>
                </div>

                <div class="trainer-body">
                  <h3>{{ nombreCompleto(ent) }}</h3>
                  <p class="trainer-specialty">{{ ent.especialidad }}</p>

                  <ul class="meta">
                    <li>
                      <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                      <span>{{ ent.sedeNombre }}</span>
                    </li>
                  </ul>

                  <div class="gym-actions">
                    <button type="button" class="btn-lock" @click.stop="openMembershipModal">
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

* { box-sizing: border-box; }
button, input, select { font: inherit; }

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
.trainers-page {
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

  min-height: calc(100vh - 72px);
  background:
    radial-gradient(900px 420px at 85% -80px, var(--hl-soft), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.trainers-container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 30px 32px 64px;
  display: flex;
  flex-direction: column;
  gap: 22px;
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
  text-transform: uppercase;
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
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }

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
   HERO
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
.hero-base { position: relative; z-index: 1; }

.hero-main h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(28px, 3.8vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.5px;
}

.hero-main h1 span { color: var(--hl); text-shadow: 0 0 36px var(--hl-line); }

.hero-main p {
  max-width: 560px;
  margin: 14px 0 0;
  color: var(--text2);
  font-size: 14px;
  line-height: 1.6;
}

.hero-actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; }

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
.hero-base-copy small { color: var(--hl); font-size: 9.5px; font-weight: 800; letter-spacing: 1px; }
.hero-base-copy strong {
  overflow: hidden;
  color: #fff;
  font-size: 14.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hero-base-meta { display: flex; align-items: center; gap: 7px; color: var(--text2); font-size: 11.5px; }
.hero-base-arrow { width: 18px; height: 18px; flex: none; color: var(--text3); }

/* =========================================================
   INDICADORES
========================================================= */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }

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
   BARRA DE EXPLORACIÓN
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

.toolbar-row { display: flex; align-items: center; gap: 10px; }

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
.search-box:focus-within { border-color: var(--hl); box-shadow: 0 0 0 3px var(--hl-soft); }
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
.select-box span { color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; }
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

.segmented {
  padding: 4px;
  display: flex;
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
.block { display: flex; flex-direction: column; gap: 18px; }

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
.block-head p { margin: 5px 0 0; color: var(--text3); font-size: 12.5px; }

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
.count-pill.sm { min-width: 26px; height: 24px; border-radius: 999px; font-size: 11px; }

/* =========================================================
   TARJETAS DE ENTRENADORES
========================================================= */
.trainers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.trainer-card {
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
.trainer-card:hover { transform: translateY(-5px); border-color: var(--hl-line); box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38); }
.trainer-card.locked { cursor: default; }
.trainer-card.locked:hover { border-color: rgba(245, 158, 11, 0.4); }

.trainer-media {
  position: relative;
  height: 210px;
  flex: none;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hl-soft);
}

.trainer-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  display: block;
  transition: transform 0.6s var(--ease), filter 0.3s ease;
}
.trainer-card:hover .trainer-media img { transform: scale(1.06); }
.trainer-card.locked .trainer-media img { filter: brightness(0.7) saturate(0.85); }

.trainer-initials { color: var(--hl); font-family: 'Oswald', sans-serif; font-size: 44px; font-weight: 700; }

.trainer-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.7));
  pointer-events: none;
}

.open-badge,
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

.open-badge { top: 12px; right: 12px; padding: 5px 11px; color: #fff; background: rgba(16, 185, 129, 0.92); }
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

.trainer-body { min-width: 0; padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; }

.trainer-body h3 {
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

.trainer-specialty { margin: -6px 0 0; color: var(--hl); font-size: 12.5px; font-weight: 700; }

.meta { margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; list-style: none; }
.meta li {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text2);
  font-size: 12.5px;
  line-height: 1.45;
}
.meta li svg { width: 15px; height: 15px; margin-top: 1px; flex: none; color: var(--hl); }
.meta li span { min-width: 0; overflow-wrap: anywhere; }

.gym-actions { margin-top: auto; display: flex; gap: 8px; }
.gym-actions .btn-primary { flex: 1; }

.state-group { display: flex; flex-direction: column; gap: 14px; }
.state-group + .state-group { margin-top: 6px; }

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

/* Lista */
.trainers-grid.list { grid-template-columns: 1fr; gap: 14px; }
.trainers-grid.list .trainer-card { flex-direction: row; }
.trainers-grid.list .trainer-media { width: 240px; height: auto; min-height: 160px; }
.trainers-grid.list .trainer-body { padding: 18px 20px; }
.trainers-grid.list .gym-actions { max-width: 360px; }

/* =========================================================
   PAGINACIÓN
========================================================= */
.pager { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
.pager-range { color: var(--text3); font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pager-btns { display: flex; gap: 10px; }
.pager-btns button {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: #fff;
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line2);
  border-radius: 12px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s var(--ease);
}
.pager-btns button svg { width: 17px; height: 17px; }
.pager-btns button:hover:not(:disabled) { background: var(--surface-hover); border-color: var(--hl-line); transform: translateY(-1px); }
.pager-btns button:disabled { color: var(--text3); cursor: not-allowed; opacity: 0.55; }

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
.empty-state h3 { margin: 4px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; }
.empty-state p { max-width: 360px; margin: 0 0 8px; color: var(--text2); font-size: 13px; line-height: 1.6; }

/* =========================================================
   MODAL
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
.pop-enter-active, .pop-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.96); }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .hero { grid-template-columns: 1fr; }
  .hero-base { max-width: 420px; }
}

@media (max-width: 900px) {
  .toolbar { top: 76px; }
  .kpi-card { padding: 18px; gap: 13px; }
}

@media (max-width: 760px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
}

@media (max-width: 680px) {
  .trainers-container { padding: 14px 12px 44px; gap: 16px; }

  .hero { padding: 20px 16px; border-radius: 20px; gap: 18px; }
  .hero::after { right: -120px; bottom: -210px; }
  .hero-main p { font-size: 13px; }
  .hero-actions { margin-top: 16px; }
  .hero-actions > * { flex: 1; }
  .hero-base { max-width: none; }

  .kpi-grid { gap: 9px; }
  .kpi-card { padding: 16px 14px; flex-direction: column; align-items: flex-start; gap: 12px; border-radius: 17px; }
  .kpi-card::before { left: 14px; right: 14px; }
  .kpi-icon { width: 38px; height: 38px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body { gap: 5px; }
  .kpi-body strong { font-size: 28px; }
  .kpi-body span { font-size: 9.5px; }

  .toolbar { top: 70px; padding: 10px; gap: 10px; border-radius: 17px; }
  .toolbar-row:first-child { flex-wrap: wrap; }
  .search-box { flex: 1 1 100%; }
  .select-box { flex: 1; min-width: 0; }
  .select-box select { width: 100%; min-width: 0; }
  .segmented { width: 100%; }
  .segmented button { flex: 1; padding: 0 8px; }

  .block { gap: 14px; }
  .block-head h2 { font-size: 20px; }

  .trainers-grid { grid-template-columns: 1fr; gap: 14px; }
  .trainer-media { height: 200px; }
  .trainer-body { padding: 16px; }

  .trainers-grid.list .trainer-card { flex-direction: row; }
  .trainers-grid.list .trainer-media { width: 116px; min-height: 0; height: auto; }
  .trainers-grid.list .trainer-media::after { background: rgba(0, 0, 0, 0.2); }
  .trainers-grid.list .loc-badge { display: none; }
  .trainers-grid.list .open-badge,
  .trainers-grid.list .plus-badge { top: 8px; right: 8px; padding: 4px 8px; font-size: 9px; }
  .trainers-grid.list .trainer-body { padding: 12px 14px; gap: 10px; }
  .trainers-grid.list .trainer-body h3 { font-size: 16px; }
  .trainers-grid.list .meta li:nth-child(2) { display: none; }
  .trainers-grid.list .gym-actions { max-width: none; }
  .trainers-grid.list .btn-primary,
  .trainers-grid.list .btn-lock { min-height: 38px; font-size: 12px; }
  .trainers-grid.list .btn-ghost.icon-only { width: 38px; min-height: 38px; }

  .pager { justify-content: space-between; }
}

@media (max-width: 400px) {
  .hero-actions { flex-direction: column; }
  .trainers-grid.list .trainer-media { width: 96px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; }
}
</style>