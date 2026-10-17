<template>
  <HeadingMember>
    <div class="detail-wrapper">

      <template v-if="entrenador">

        <!-- Barra superior -->
        <div class="top-bar">
          <button type="button" class="back-btn" @click="volver">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {{ t('back') }}
          </button>
        </div>

        <!-- 1. HERO -->
        <section id="tutorial-trainer-header" class="trainer-hero-card">
          <div class="hero-bg" :style="{ backgroundImage: `url(${entrenador.fotoPortada})` }"></div>
          <div class="hero-overlay"></div>

          <div class="hero-content-flex">
            <div class="trainer-logo-box">
              <img :src="entrenador.foto" :alt="nombreCompleto" />
            </div>

            <div class="hero-texts">
              <div class="badge-row">
                <span class="badge">{{ entrenador.especialidad }}</span>
                <span class="rating-pill">
                  <svg class="star on" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {{ entrenador.calificacionPromedio.toFixed(1) }}
                  <small>({{ entrenador.resenas.length }} {{ t('reviews') }})</small>
                </span>
              </div>

              <h1>{{ nombreCompleto }}</h1>

              <p class="hero-address">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                {{ entrenador.sedeNombre }} · {{ entrenador.ciudad }}, {{ entrenador.estado }}
              </p>
            </div>

            <div class="hero-actions">
              <button type="button" class="hero-cta" @click="contactarWhatsapp">
                <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                {{ t('contactWhatsapp') }}
              </button>
              <a v-if="entrenador.celular" :href="`tel:${entrenador.celular}`" class="call-btn" :title="t('call')" :aria-label="t('call')">
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
              </a>
            </div>
          </div>
        </section>

        <!-- 2. INDICADORES -->
        <section id="tutorial-trainer-stats" class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-icon accent">
              <svg viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ entrenador.aniosExperiencia }}</strong>
              <span>{{ t('yearsExp') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon success">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ entrenador.alumnosEntrenados }}+</strong>
              <span>{{ t('studentsTrained') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon warning">
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ entrenador.calificacionPromedio.toFixed(1) }}</strong>
              <span>{{ t('avgRating') }}</span>
            </div>
          </article>

          <article class="kpi-card">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="kpi-body">
              <strong>{{ entrenador.resenas.length }}</strong>
              <span>{{ t('reviews') }}</span>
            </div>
          </article>
        </section>

        <!-- 3. DASHBOARD -->
        <div class="dashboard-grid">

          <!-- IZQUIERDA -->
          <div class="left-column">

            <section id="tutorial-trainer-bio" class="panel-box">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10"/></svg>
                </div>
                <div class="card-header-copy"><h3>{{ t('aboutTitle') }}</h3></div>
              </header>
              <p class="about-text">{{ entrenador.bio }}</p>
            </section>

            <div class="info-split-row">
              <section class="panel-box">
                <header class="card-header">
                  <div class="card-header-icon warning">
                    <svg viewBox="0 0 24 24"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                  </div>
                  <div class="card-header-copy"><h3>{{ t('specialtiesTitle') }}</h3></div>
                </header>
                <div class="tags-wrap">
                  <span v-for="esp in entrenador.especialidades" :key="esp" class="specialty-tag">{{ esp }}</span>
                </div>
              </section>

              <section v-if="entrenador.certificaciones?.length" class="panel-box">
                <header class="card-header">
                  <div class="card-header-icon success">
                    <svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>
                  </div>
                  <div class="card-header-copy"><h3>{{ t('certsTitle') }}</h3></div>
                </header>
                <div class="cert-list">
                  <span v-for="cert in entrenador.certificaciones" :key="cert" class="cert-item">
                    <i class="cert-check"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></i>
                    {{ cert }}
                  </span>
                </div>
              </section>
            </div>

            <!-- Mapa -->
            <section id="tutorial-trainer-location" class="panel-box map-panel">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="card-header-copy">
                  <span class="card-eyebrow">{{ entrenador.sedeNombre }}</span>
                  <h3>{{ t('locationTitle') }}</h3>
                </div>
                <a class="route-gps-btn" :href="mapsDirectionsUrl" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  {{ t('howToGetThere') }}
                </a>
              </header>

              <div class="map-container-inner">
                <div ref="mapElement" class="map-canvas"></div>

                <button type="button" class="recenter-map-btn" :title="t('recenter')" @click="recenterMap">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                  <span>{{ t('recenter') }}</span>
                </button>

                <div class="map-watermark-overlay">
                  <span class="watermark-text">{{ entrenador.sedeNombre }}</span>
                </div>
              </div>

              <p class="sede-address">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ entrenador.sedeDireccion }}
              </p>
            </section>
          </div>

          <!-- DERECHA -->
          <aside class="right-column">

            <section id="tutorial-trainer-contact" class="panel-box contact-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div class="card-header-copy"><h3>{{ t('contactTitle') }}</h3></div>
              </header>

              <ul class="contact-list">
                <li v-if="entrenador.celular">
                  <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg></span>
                  <div>
                    <small>{{ t('phone') }}</small>
                    <a :href="`tel:${entrenador.celular}`">{{ entrenador.celular }}</a>
                  </div>
                </li>
                <li v-if="entrenador.redes?.instagram">
                  <span class="contact-ico"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg></span>
                  <div>
                    <small>Instagram</small>
                    <a :href="`https://instagram.com/${entrenador.redes.instagram.replace('@', '')}`" target="_blank" rel="noopener noreferrer">{{ entrenador.redes.instagram }}</a>
                  </div>
                </li>
                <li v-if="entrenador.redes?.tiktok">
                  <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></span>
                  <div>
                    <small>TikTok</small>
                    <strong>{{ entrenador.redes.tiktok }}</strong>
                  </div>
                </li>
                <li v-if="entrenador.redes?.facebook">
                  <span class="contact-ico"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></span>
                  <div>
                    <small>Facebook</small>
                    <strong>{{ entrenador.redes.facebook }}</strong>
                  </div>
                </li>
              </ul>
            </section>

            <section class="panel-box">
              <header class="card-header">
                <div class="card-header-icon warning">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </div>
                <div class="card-header-copy"><h3>{{ t('scheduleTitle') }}</h3></div>
              </header>

              <div class="schedule-list">
                <div class="schedule-item today">
                  <span class="day">{{ t('scheduleDays') }}</span>
                  <span class="time">{{ entrenador.horaEntrada }} - {{ entrenador.horaSalida }}</span>
                </div>
              </div>
            </section>

            <button type="button" class="cta-main-btn" @click="contactarWhatsapp">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              {{ t('ctaContact') }}
            </button>
          </aside>
        </div>

        <!-- 4. RESEÑAS -->
        <section id="tutorial-trainer-reviews" class="panel-box reviews-panel">
          <header class="card-header">
            <div class="card-header-icon warning">
              <svg class="star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="card-header-copy"><h3>{{ t('reviewsTitle') }}</h3></div>

            <div class="rating-row">
              <div class="stars">
                <svg v-for="n in 5" :key="n" class="star" :class="{ on: n <= Math.round(entrenador.calificacionPromedio) }" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <span class="rating-number">{{ entrenador.calificacionPromedio.toFixed(1) }}</span>
            </div>
          </header>

          <div v-if="entrenador.resenas.length" class="reviews-grid">
            <article v-for="res in entrenador.resenas" :key="res.id" class="review-card">
              <div class="review-header">
                <div class="review-avatar">{{ res.iniciales }}</div>
                <div class="review-meta">
                  <strong>{{ res.nombre }}</strong>
                  <div class="stars small">
                    <svg v-for="n in 5" :key="n" class="star" :class="{ on: n <= res.calificacion }" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                </div>
                <span class="review-date">{{ res.fecha }}</span>
              </div>
              <p class="review-text">{{ res.comentario }}</p>
            </article>
          </div>
          <p v-else class="no-reviews-text">{{ t('noReviews') }}</p>
        </section>
      </template>

      <!-- ESTADO: ENTRENADOR NO ENCONTRADO -->
      <div v-else class="not-found-wrapper">
        <div class="not-found-card">
          <span class="empty-icon">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <h2>{{ t('notFoundTitle') }}</h2>
          <p>{{ t('notFoundDesc') }}</p>
          <button type="button" class="cta-main-btn auto" @click="volver">{{ t('back') }}</button>
        </div>
      </div>

    </div>
  </HeadingMember>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import HeadingMember from '../HeadingMember.vue';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const router = useRouter();
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');
const mapElement = ref(null);
let map = null;

/* -------------------------------------------------------------------- */
/* En producción esto vendría de tu API usando route.params.id.         */
/* -------------------------------------------------------------------- */
const entrenadoresDB = {
  101: {
    id: 101, nombres: 'Daniela', apellidoP: 'Reyes', apellidoM: 'Cortés',
    especialidad: 'Entrenamiento de Fuerza',
    especialidades: ['Fuerza', 'Hipertrofia', 'Powerlifting', 'Movilidad'],
    foto: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    fotoPortada: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
    sedeId: 1, sedeNombre: 'IronFit Valles Centro', sedeDireccion: 'Blvd. Carlos Lasso #120, Centro',
    sedeLat: 21.9902, sedeLng: -99.0301,
    ciudad: 'Ciudad Valles', estado: 'San Luis Potosí',
    celular: '+52 481 100 2211', horaEntrada: '06:00', horaSalida: '14:00', aniosExperiencia: 6,
    alumnosEntrenados: 180,
    bio: 'Especialista en fuerza e hipertrofia, con enfoque en técnica y progresión segura de cargas. Trabajo contigo desde el primer día para construir una base sólida antes de aumentar la intensidad.',
    certificaciones: ['NSCA-CPT', 'Especialidad en Powerlifting'],
    redes: { instagram: '@dani.fuerza', tiktok: '@dani.fuerza' },
    calificacionPromedio: 4.8,
    resenas: [
      { id: 1, nombre: 'Luis M.', iniciales: 'LM', calificacion: 5, fecha: 'Jul 2026', comentario: 'Excelente seguimiento en cada sesión, mi técnica en sentadilla mejoró muchísimo.' },
      { id: 2, nombre: 'Karla P.', iniciales: 'KP', calificacion: 5, fecha: 'Jun 2026', comentario: 'Muy profesional y puntual, siempre explica el porqué de cada ejercicio.' },
      { id: 3, nombre: 'Ricardo A.', iniciales: 'RA', calificacion: 4, fecha: 'May 2026', comentario: 'Buenas rutinas, a veces el horario se complica pero vale la pena.' }
    ]
  },
  102: {
    id: 102, nombres: 'Marco', apellidoP: 'Villanueva', apellidoM: 'Ibarra',
    especialidad: 'Boxeo y Acondicionamiento',
    especialidades: ['Boxeo', 'HIIT', 'Acondicionamiento'],
    foto: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80',
    fotoPortada: 'https://images.unsplash.com/photo-1571902943202-507f2718ea0d?auto=format&fit=crop&w=1400&q=80',
    sedeId: 1, sedeNombre: 'IronFit Valles Centro', sedeDireccion: 'Blvd. Carlos Lasso #120, Centro',
    sedeLat: 21.9902, sedeLng: -99.0301,
    ciudad: 'Ciudad Valles', estado: 'San Luis Potosí',
    celular: '+52 481 100 3344', horaEntrada: '14:00', horaSalida: '21:00', aniosExperiencia: 4,
    alumnosEntrenados: 95,
    bio: 'Ex boxeador amateur, entrena acondicionamiento de alta intensidad basado en fundamentos de boxeo. Ideal si buscas quemar grasa mientras aprendes técnica real.',
    certificaciones: ['Entrenador de Boxeo FMB'],
    redes: { instagram: '@marcobox_fit', facebook: 'MarcoBoxFit' },
    calificacionPromedio: 4.6,
    resenas: [
      { id: 1, nombre: 'Andrea G.', iniciales: 'AG', calificacion: 5, fecha: 'Jul 2026', comentario: 'Las clases son intensas pero muy divertidas, se nota que sabe de boxeo real.' },
      { id: 2, nombre: 'Pablo S.', iniciales: 'PS', calificacion: 4, fecha: 'Jun 2026', comentario: 'Buen entrenador, a veces las sesiones se alargan un poco.' }
    ]
  },
  103: {
    id: 103, nombres: 'Paola', apellidoP: 'Serrano', apellidoM: 'Munguía',
    especialidad: 'Yoga y Movilidad',
    especialidades: ['Yoga', 'Movilidad', 'Recuperación'],
    foto: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    fotoPortada: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    sedeId: 1, sedeNombre: 'IronFit Valles Centro', sedeDireccion: 'Blvd. Carlos Lasso #120, Centro',
    sedeLat: 21.9902, sedeLng: -99.0301,
    ciudad: 'Ciudad Valles', estado: 'San Luis Potosí',
    celular: '+52 481 100 5566', horaEntrada: '07:00', horaSalida: '13:00', aniosExperiencia: 8,
    alumnosEntrenados: 210,
    bio: 'Instructora certificada en Hatha y Vinyasa, enfocada en movilidad funcional y recuperación activa para complementar cualquier rutina de fuerza o cardio.',
    certificaciones: ['RYT-500'],
    redes: { instagram: '@paola.yoga' },
    calificacionPromedio: 5.0,
    resenas: [
      { id: 1, nombre: 'Mariana V.', iniciales: 'MV', calificacion: 5, fecha: 'Ago 2026', comentario: 'Sus clases me ayudaron a recuperarme de una lesión de rodilla, súper atenta.' },
      { id: 2, nombre: 'Jorge T.', iniciales: 'JT', calificacion: 5, fecha: 'Jul 2026', comentario: 'La mejor forma de terminar la semana, muy relajante y profesional.' }
    ]
  },
  104: {
    id: 104, nombres: 'Héctor', apellidoP: 'Domínguez', apellidoM: 'Ramos',
    especialidad: 'CrossFit',
    especialidades: ['CrossFit', 'Levantamientos Olímpicos', 'Metcon'],
    foto: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    fotoPortada: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
    sedeId: 2, sedeNombre: 'IronFit Norte - Plaza San José', sedeDireccion: 'Carretera Mante #450, Local 4',
    sedeLat: 22.0050, sedeLng: -99.0210,
    ciudad: 'Ciudad Valles', estado: 'San Luis Potosí',
    celular: '+52 481 200 1122', horaEntrada: '05:00', horaSalida: '12:00', aniosExperiencia: 5,
    alumnosEntrenados: 140,
    bio: 'Coach de CrossFit nivel 2, especializado en levantamientos olímpicos y metcons de alta intensidad.',
    certificaciones: ['CrossFit Level 2'],
    redes: { instagram: '@hector.crossfit' },
    calificacionPromedio: 4.7,
    resenas: [
      { id: 1, nombre: 'Fernando C.', iniciales: 'FC', calificacion: 5, fecha: 'Jul 2026', comentario: 'Sabe corregir técnica en tiempo real, mis levantamientos mejoraron mucho.' }
    ]
  }
};

const entrenador = computed(() => entrenadoresDB[route.params.id] || null);
const nombreCompleto = computed(() =>
  entrenador.value
    ? `${entrenador.value.nombres} ${entrenador.value.apellidoP}${entrenador.value.apellidoM ? ' ' + entrenador.value.apellidoM : ''}`
    : ''
);

const mapsDirectionsUrl = computed(() => {
  if (!entrenador.value) return '#';
  return `https://www.google.com/maps/dir/?api=1&destination=${entrenador.value.sedeLat},${entrenador.value.sedeLng}`;
});

/* ---------- Mapa ---------- */
const initMap = () => {
  if (!mapElement.value || !entrenador.value) return;

  map = L.map(mapElement.value, { zoomControl: false, attributionControl: false })
    .setView([entrenador.value.sedeLat, entrenador.value.sedeLng], 15);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const customIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="marker-pin"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  L.marker([entrenador.value.sedeLat, entrenador.value.sedeLng], { icon: customIcon })
    .addTo(map)
    .bindPopup(`<b>${entrenador.value.sedeNombre}</b><br>${entrenador.value.sedeDireccion}`);
};

const destroyMap = () => {
  if (map) {
    map.remove();
    map = null;
  }
};

const recenterMap = () => {
  if (!map || !entrenador.value) return;
  map.setView([entrenador.value.sedeLat, entrenador.value.sedeLng], 15, { animate: true });
};

const contactarWhatsapp = () => {
  if (!entrenador.value?.celular) return;
  const cleanPhone = entrenador.value.celular.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(`Hola ${entrenador.value.nombres}, te escribo desde la plataforma de IronFit para conocer más sobre tus clases.`);
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
};

/* ---------- i18n ---------- */
const traducciones = {
  es: {
    back: 'Volver a entrenadores',
    reviews: 'reseñas',
    reviewsTitle: 'Reseñas de alumnos',
    noReviews: 'Este entrenador aún no tiene reseñas.',
    yearsExp: 'Años de experiencia',
    studentsTrained: 'Alumnos entrenados',
    avgRating: 'Calificación',
    aboutTitle: 'Sobre el entrenador',
    specialtiesTitle: 'Especialidades',
    certsTitle: 'Certificaciones',
    contactTitle: 'Contacto y redes',
    phone: 'Teléfono',
    scheduleTitle: 'Horario',
    scheduleDays: 'Horario de atención',
    locationTitle: 'Ubicación de la sede',
    howToGetThere: '¿Cómo llegar?',
    recenter: 'Centrar sede',
    contactWhatsapp: 'Contactar por WhatsApp',
    call: 'Llamar',
    ctaContact: 'Contactar a este entrenador',
    notFoundTitle: 'No encontramos a este entrenador',
    notFoundDesc: 'Puede que el enlace sea incorrecto o que necesites una membresía Plus para verlo.'
  },
  en: {
    back: 'Back to trainers',
    reviews: 'reviews',
    reviewsTitle: 'Member reviews',
    noReviews: 'This trainer has no reviews yet.',
    yearsExp: 'Years of experience',
    studentsTrained: 'Students trained',
    avgRating: 'Rating',
    aboutTitle: 'About the trainer',
    specialtiesTitle: 'Specialties',
    certsTitle: 'Certifications',
    contactTitle: 'Contact & social',
    phone: 'Phone',
    scheduleTitle: 'Schedule',
    scheduleDays: 'Available hours',
    locationTitle: 'Gym location',
    howToGetThere: 'Get directions',
    recenter: 'Center gym',
    contactWhatsapp: 'Contact via WhatsApp',
    call: 'Call',
    ctaContact: 'Contact this trainer',
    notFoundTitle: "We couldn't find this trainer",
    notFoundDesc: 'The link may be wrong, or you may need a Plus membership to view it.'
  }
};

const t = (key) => {
  const langTable = traducciones[currentLang.value] || traducciones.es;
  return langTable[key] || traducciones.es[key] || key;
};

const handleLangChange = (e) => {
  if (e.detail && e.detail.idioma) currentLang.value = e.detail.idioma;
};

const volver = () => router.back();

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  nextTick(() => initMap());
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  destroyMap();
});

watch(() => route.params.id, () => {
  destroyMap();
  nextTick(() => initMap());
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
.detail-wrapper {
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
a:focus-visible {
  outline: 2px solid var(--hl);
  outline-offset: 2px;
}

/* Estrellas */
.star { width: 15px; height: 15px; color: var(--amber); fill: none; }
.star.on { fill: var(--amber); }
.stars { display: flex; gap: 2px; }
.stars.small .star { width: 12px; height: 12px; }

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
.trainer-hero-card {
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

.trainer-hero-card::before {
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

.trainer-logo-box {
  width: 112px;
  height: 112px;
  flex: none;
  overflow: hidden;
  background: #141418;
  border: 2px solid rgba(255, 255, 255, 0.22);
  border-radius: 28px;
  box-shadow: 0 0 0 5px var(--hl-soft), 0 14px 30px rgba(0, 0, 0, 0.6);
}
.trainer-logo-box img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block; }

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

.rating-pill {
  padding: 5px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid var(--line2);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  font-size: 11.5px;
  font-weight: 800;
}
.rating-pill .star { width: 13px; height: 13px; }
.rating-pill small { color: rgba(255, 255, 255, 0.6); font-size: 11px; font-weight: 600; }

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

.hero-actions { flex: none; display: flex; align-items: center; gap: 10px; }

.hero-cta {
  height: 46px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--green);
  white-space: nowrap;
  cursor: pointer;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.45);
  border-radius: 13px;
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s var(--ease);
}
.hero-cta svg { width: 17px; height: 17px; }
.hero-cta:hover { color: #fff; background: rgba(16, 185, 129, 0.34); transform: translateY(-2px); }

.call-btn {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--line2);
  border-radius: 13px;
  backdrop-filter: blur(8px);
  transition: background 0.2s ease, transform 0.2s var(--ease);
}
.call-btn svg { width: 18px; height: 18px; }
.call-btn:hover { background: rgba(255, 255, 255, 0.16); transform: translateY(-2px); }

/* =========================================================
   INDICADORES
========================================================= */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }

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
.kpi-card:nth-child(4) { --tint: rgba(255, 255, 255, 0.7); }

.kpi-icon {
  width: 48px;
  height: 48px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--line);
  border-radius: 14px;
}
.kpi-icon.accent { color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }
.kpi-icon.success { color: var(--green); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.kpi-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.28); }
.kpi-icon svg { width: 21px; height: 21px; }

.kpi-body { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.kpi-body strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 600; line-height: 1; }
.kpi-body span { color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.7px; line-height: 1.3; text-transform: uppercase; }

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
.right-column { min-width: 0; display: flex; flex-direction: column; gap: 22px; }

@media (min-width: 1101px) {
  .right-column { position: sticky; top: 88px; }
}

.info-split-row { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: stretch; }

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

.card-header { margin-bottom: 18px; display: flex; align-items: center; gap: 13px; }

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

.about-text { margin: 0; color: var(--text2); font-size: 13.5px; line-height: 1.75; }

.tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.specialty-tag {
  padding: 6px 13px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.cert-list { display: flex; flex-direction: column; gap: 8px; }
.cert-item {
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
.cert-check {
  width: 20px;
  height: 20px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--green);
  background: rgba(16, 185, 129, 0.12);
  border-radius: 50%;
}
.cert-check svg { width: 11px; height: 11px; stroke-width: 3; }

/* =========================================================
   MAPA
========================================================= */
.map-panel .card-header { flex-wrap: wrap; }

.route-gps-btn {
  height: 38px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--color-texto-botones, #fff);
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  background: var(--color-botones, var(--hl));
  border-radius: 11px;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--hl) 22%, transparent);
  font-size: 12px;
  font-weight: 700;
  transition: filter 0.2s ease, transform 0.2s var(--ease);
}
.route-gps-btn svg { width: 15px; height: 15px; }
.route-gps-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

.map-container-inner {
  position: relative;
  width: 100%;
  height: 320px;
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

.sede-address { margin: 14px 0 0; display: flex; align-items: center; gap: 8px; color: var(--text2); font-size: 12.5px; }
.sede-address svg { width: 15px; height: 15px; flex: none; color: var(--hl); }

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

@keyframes marker-pulse {
  0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

/* =========================================================
   CONTACTO + HORARIO
========================================================= */
.contact-card { border-color: var(--hl-line); box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--hl-soft); }

.contact-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.contact-list li { padding: 11px 0; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--line); }
.contact-list li:first-child { padding-top: 0; }
.contact-list li:last-child { padding-bottom: 0; border-bottom: 0; }

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
.schedule-item .day { color: var(--text2); }
.schedule-item .time { color: var(--title); font-family: 'Oswald', sans-serif; font-weight: 500; text-align: right; }
.schedule-item.today { background: var(--hl-soft); border-color: var(--hl-line); }
.schedule-item.today .day { color: var(--title); font-weight: 600; }

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
.cta-main-btn.auto { width: auto; padding: 0 28px; }

/* =========================================================
   RESEÑAS
========================================================= */
.rating-row { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.rating-number { color: #fff; font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; }

.reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

.review-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: border-color 0.2s ease, transform 0.3s var(--ease);
}
.review-card:hover { border-color: var(--hl-line); transform: translateY(-3px); }

.review-header { display: flex; align-items: center; gap: 11px; }

.review-avatar {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.review-meta { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.review-meta strong { color: var(--title); font-size: 13px; }
.review-date { color: var(--text3); font-size: 11px; white-space: nowrap; }
.review-text { margin: 0; color: var(--text2); font-size: 13px; line-height: 1.6; }
.no-reviews-text { margin: 0; color: var(--text3); font-size: 13px; }

/* =========================================================
   NO ENCONTRADO
========================================================= */
.not-found-wrapper { min-height: 70vh; display: flex; align-items: center; justify-content: center; }

.not-found-card {
  width: 100%;
  max-width: 440px;
  padding: 44px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  background: var(--surface);
  border: 1.5px dashed var(--line2);
  border-radius: 24px;
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

.not-found-card h2 { margin: 4px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; }
.not-found-card p { margin: 0 0 8px; color: var(--text2); font-size: 13px; line-height: 1.6; }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1100px) {
  .dashboard-grid { grid-template-columns: minmax(0, 1fr); }
  .right-column { position: static; }
}

@media (max-width: 860px) {
  .hero-content-flex { flex-wrap: wrap; align-items: flex-start; }
  .hero-actions { width: 100%; }
  .hero-cta { flex: 1; justify-content: center; }
  .info-split-row { grid-template-columns: minmax(0, 1fr); }
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
}

@media (max-width: 680px) {
  .detail-wrapper { padding: 14px 12px 44px; gap: 16px; }

  .trainer-hero-card { min-height: 0; padding: 20px 16px; border-radius: 20px; }
  .hero-content-flex { flex-direction: column; gap: 14px; }
  .trainer-logo-box { width: 80px; height: 80px; border-radius: 20px; }

  .kpi-card { padding: 14px 16px; gap: 12px; border-radius: 17px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 12px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body strong { font-size: 26px; }

  .panel-box { padding: 18px 16px; border-radius: 18px; }
  .left-column, .right-column { gap: 16px; }

  .map-panel .card-header { align-items: flex-start; }
  .route-gps-btn { width: 100%; justify-content: center; }
  .map-container-inner { height: 260px; }

  .reviews-panel .card-header { flex-wrap: wrap; }
  .rating-row { margin-left: 0; width: 100%; }
}

@media (max-width: 400px) {
  .kpi-card { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation-duration: 0.01ms !important; }
}
</style>