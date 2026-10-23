<template>
  <HeadingMember>
  <div class="help-wrapper">
  <div class="help-page">

    <!-- =====================================================
         ENCABEZADO + BUSCADOR
    ====================================================== -->
    <section class="help-hero">
      <div class="hero-copy">
        <span class="kicker">{{ tr('kicker') }}</span>
        <h1>{{ tr('title') }}</h1>
        <p>{{ tr('subtitle') }}</p>
      </div>

      <label class="search-box">
        <svg class="ico" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          v-model="query"
          type="text"
          :placeholder="tr('searchPlaceholder')"
          :aria-label="tr('searchPlaceholder')"
        />
        <button v-if="query" type="button" class="clear-btn" @click="query = ''" :aria-label="tr('clear')">
          &times;
        </button>
      </label>
    </section>

    <!-- =====================================================
         CONTACTO RÁPIDO
    ====================================================== -->
    <section class="quick-grid">
      <a
        v-for="c in contactCards"
        :key="c.key"
        :href="c.href"
        :target="c.external ? '_blank' : undefined"
        rel="noopener"
        class="quick-card"
      >
        <span class="quick-icon" :class="c.color">
          <svg class="ico" viewBox="0 0 24 24" v-html="c.svg"></svg>
        </span>
        <span class="quick-copy">
          <strong>{{ tr(c.key) }}</strong>
          <small>{{ c.value }}</small>
        </span>
        <svg class="quick-arrow" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </a>
    </section>

    <div class="help-layout">

      <!-- =====================================================
           COLUMNA PRINCIPAL: PREGUNTAS FRECUENTES
      ====================================================== -->
      <section class="panel faq-panel">
        <div class="panel-head">
          <div>
            <span class="kicker">{{ tr('faqKicker') }}</span>
            <h2>{{ tr('faqTitle') }}</h2>
          </div>
        </div>

        <!-- Filtros por tema -->
        <div class="chips" role="tablist">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="chip"
            :class="{ on: activeCategory === cat.id }"
            role="tab"
            :aria-selected="activeCategory === cat.id"
            @click="activeCategory = cat.id"
          >
            {{ tr(cat.key) }}
          </button>
        </div>

        <!-- Acordeón -->
        <div v-if="filteredFaqs.length" class="faq-list">
          <article
            v-for="item in filteredFaqs"
            :key="item.id"
            class="faq-item"
            :class="{ open: openFaq === item.id }"
          >
            <button
              type="button"
              class="faq-question"
              :aria-expanded="openFaq === item.id"
              @click="toggleFaq(item.id)"
            >
              <span class="faq-icon">
                <svg class="ico" viewBox="0 0 24 24" v-html="ICON.help"></svg>
              </span>
              <span class="faq-text">{{ item.q[idioma] }}</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
            </button>

            <div class="faq-answer-wrap">
              <div class="faq-answer">
                <p>{{ item.a[idioma] }}</p>
              </div>
            </div>
          </article>
        </div>

        <!-- Sin resultados -->
        <div v-else class="empty-state">
          <span class="empty-icon">
            <svg class="ico" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          <strong>{{ tr('noResults') }}</strong>
          <p>{{ tr('noResultsHint') }}</p>
          <button type="button" class="btn-ghost" @click="resetFilters">{{ tr('clearFilters') }}</button>
        </div>
      </section>

      <!-- =====================================================
           COLUMNA LATERAL
      ====================================================== -->
      <aside class="side-column">

        <!-- Guías rápidas -->
        <section class="panel">
          <div class="panel-head">
            <div>
              <span class="kicker">{{ tr('guidesKicker') }}</span>
              <h2>{{ tr('guidesTitle') }}</h2>
            </div>
          </div>

          <div class="guide-list">
            <router-link
              v-for="g in guides"
              :key="g.to"
              :to="g.to"
              class="guide-link"
            >
              <span class="guide-icon" :class="g.color">
                <svg class="ico" viewBox="0 0 24 24" v-html="g.svg"></svg>
              </span>
              <span class="guide-copy">
                <strong>{{ tr(g.key) }}</strong>
                <small>{{ tr(g.key + 'Desc') }}</small>
              </span>
              <svg class="quick-arrow" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
            </router-link>
          </div>
        </section>

        <!-- Horario de atención -->
        <section class="panel hours-panel">
          <div class="hours-head">
            <span class="quick-icon green">
              <svg class="ico" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <div>
              <strong>{{ tr('hoursTitle') }}</strong>
              <small>{{ tr('hoursSubtitle') }}</small>
            </div>
          </div>

          <ul class="hours-list">
            <li><span>{{ tr('weekdays') }}</span><strong>6:00 – 22:00</strong></li>
            <li><span>{{ tr('saturday') }}</span><strong>8:00 – 18:00</strong></li>
            <li><span>{{ tr('sunday') }}</span><strong>9:00 – 14:00</strong></li>
          </ul>
        </section>
      </aside>
    </div>

    <!-- =====================================================
         FORMULARIO DE SOPORTE
    ====================================================== -->
    <section class="panel contact-panel">
      <div class="contact-intro">
        <span class="kicker">{{ tr('formKicker') }}</span>
        <h2>{{ tr('formTitle') }}</h2>
        <p>{{ tr('formSubtitle') }}</p>

        <div class="contact-note">
          <svg class="ico" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{{ tr('responseTime') }}</span>
        </div>
      </div>

      <form class="contact-form" @submit.prevent="submitForm">
        <div class="field-row">
          <div class="field">
            <label for="help-topic">{{ tr('fieldTopic') }}</label>
            <select id="help-topic" v-model="form.topic" required>
              <option value="" disabled>{{ tr('selectTopic') }}</option>
              <option v-for="opt in topicOptions" :key="opt" :value="opt">{{ tr(opt) }}</option>
            </select>
          </div>

          <div class="field">
            <label for="help-subject">{{ tr('fieldSubject') }}</label>
            <input
              id="help-subject"
              v-model.trim="form.subject"
              type="text"
              maxlength="80"
              :placeholder="tr('subjectPlaceholder')"
              required
            />
          </div>
        </div>

        <div class="field">
          <label for="help-message">{{ tr('fieldMessage') }}</label>
          <textarea
            id="help-message"
            v-model.trim="form.message"
            rows="5"
            maxlength="600"
            :placeholder="tr('messagePlaceholder')"
            required
          ></textarea>
          <small class="counter">{{ form.message.length }}/600</small>
        </div>

        <div class="form-actions">
          <transition name="fade">
            <span v-if="sent" class="sent-badge">
              <svg class="ico" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
              {{ tr('sentOk') }}
            </span>
          </transition>

          <button type="submit" class="btn-primary" :disabled="sending">
            <svg class="ico" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {{ sending ? tr('sending') : tr('send') }}
          </button>
        </div>
      </form>
    </section>
  </div>
  </div>
  </HeadingMember>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeadingMember from '@/components/Member/HeadingMember.vue';

/* =========================================================
   IDIOMA (mismo mecanismo que el navbar del miembro)
========================================================= */

const idioma = ref(localStorage.getItem('member-idioma') || 'es');

const handleIdiomaChanged = (event) => {
  const nuevo = event?.detail?.idioma || localStorage.getItem('member-idioma');
  if (nuevo) idioma.value = nuevo;
};

const text = {
  es: {
    kicker: 'CENTRO DE AYUDA',
    title: '¿En qué podemos ayudarte?',
    subtitle: 'Encuentra respuestas rápidas, revisa guías o escríbenos directamente.',
    searchPlaceholder: 'Busca una pregunta o tema…',
    clear: 'Limpiar búsqueda',

    whatsapp: 'WhatsApp',
    email: 'Correo',
    phone: 'Teléfono',

    faqKicker: 'PREGUNTAS FRECUENTES',
    faqTitle: 'Resuelve tus dudas',
    catAll: 'Todas',
    catAccount: 'Cuenta',
    catMembership: 'Membresía',
    catClasses: 'Clases',
    catProgress: 'Progreso',
    noResults: 'No encontramos resultados',
    noResultsHint: 'Prueba con otras palabras o escríbenos con el formulario.',
    clearFilters: 'Limpiar filtros',

    guidesKicker: 'GUÍAS RÁPIDAS',
    guidesTitle: 'Accesos directos',
    guideMembership: 'Mi membresía',
    guideMembershipDesc: 'Vigencia y renovación',
    guidePayments: 'Historial de pagos',
    guidePaymentsDesc: 'Recibos y comprobantes',
    guideClasses: 'Reservar una clase',
    guideClassesDesc: 'Horarios y cupos',
    guideProfile: 'Editar mi perfil',
    guideProfileDesc: 'Datos personales',

    hoursTitle: 'Horario de atención',
    hoursSubtitle: 'Soporte del gimnasio',
    weekdays: 'Lunes a viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',

    formKicker: 'CONTACTO',
    formTitle: '¿No encontraste lo que buscabas?',
    formSubtitle: 'Cuéntanos tu caso y el equipo de tu gimnasio te responderá lo antes posible.',
    responseTime: 'Respondemos normalmente en menos de 24 horas.',
    fieldTopic: 'Tema',
    selectTopic: 'Selecciona un tema',
    topicMembership: 'Membresía y pagos',
    topicClasses: 'Clases y reservas',
    topicAccount: 'Mi cuenta',
    topicOther: 'Otro',
    fieldSubject: 'Asunto',
    subjectPlaceholder: 'Resumen breve del problema',
    fieldMessage: 'Mensaje',
    messagePlaceholder: 'Describe con detalle lo que necesitas…',
    send: 'Enviar mensaje',
    sending: 'Enviando…',
    sentOk: 'Mensaje enviado'
  },
  en: {
    kicker: 'HELP CENTER',
    title: 'How can we help you?',
    subtitle: 'Find quick answers, browse guides or contact us directly.',
    searchPlaceholder: 'Search a question or topic…',
    clear: 'Clear search',

    whatsapp: 'WhatsApp',
    email: 'Email',
    phone: 'Phone',

    faqKicker: 'FAQ',
    faqTitle: 'Get your questions answered',
    catAll: 'All',
    catAccount: 'Account',
    catMembership: 'Membership',
    catClasses: 'Classes',
    catProgress: 'Progress',
    noResults: 'No results found',
    noResultsHint: 'Try different words or send us a message using the form.',
    clearFilters: 'Clear filters',

    guidesKicker: 'QUICK GUIDES',
    guidesTitle: 'Shortcuts',
    guideMembership: 'My membership',
    guideMembershipDesc: 'Validity and renewal',
    guidePayments: 'Payment history',
    guidePaymentsDesc: 'Receipts and invoices',
    guideClasses: 'Book a class',
    guideClassesDesc: 'Schedules and spots',
    guideProfile: 'Edit my profile',
    guideProfileDesc: 'Personal details',

    hoursTitle: 'Support hours',
    hoursSubtitle: 'Gym support team',
    weekdays: 'Monday to Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',

    formKicker: 'CONTACT',
    formTitle: "Didn't find what you were looking for?",
    formSubtitle: 'Tell us what happened and your gym team will get back to you as soon as possible.',
    responseTime: 'We usually reply within 24 hours.',
    fieldTopic: 'Topic',
    selectTopic: 'Select a topic',
    topicMembership: 'Membership & payments',
    topicClasses: 'Classes & bookings',
    topicAccount: 'My account',
    topicOther: 'Other',
    fieldSubject: 'Subject',
    subjectPlaceholder: 'Short summary of the issue',
    fieldMessage: 'Message',
    messagePlaceholder: 'Describe what you need in detail…',
    send: 'Send message',
    sending: 'Sending…',
    sentOk: 'Message sent'
  }
};

const tr = (key) => (text[idioma.value] || text.es)[key] || text.es[key] || key;

/* =========================================================
   ICONOS (trazo, igual que el resto del panel)
========================================================= */

const ICON = {
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  whatsapp: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  receipt: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  classes: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
};

/* =========================================================
   CONTACTO RÁPIDO  (reemplaza por los datos reales del gimnasio)
========================================================= */

const contactCards = [
  { key: 'whatsapp', value: '+52 833 000 0000', href: 'https://wa.me/528330000000', svg: ICON.whatsapp, color: 'green', external: true },
  { key: 'email', value: 'soporte@gympro.com', href: 'mailto:soporte@gympro.com', svg: ICON.mail, color: 'blue', external: false },
  { key: 'phone', value: '833 000 0000', href: 'tel:+528330000000', svg: ICON.phone, color: 'purple', external: false }
];

/* =========================================================
   GUÍAS RÁPIDAS (rutas del miembro)
========================================================= */

const guides = [
  { key: 'guideMembership', to: '/Member/membership', svg: ICON.star, color: 'blue' },
  { key: 'guidePayments', to: '/Member/payments-history', svg: ICON.receipt, color: 'purple' },
  { key: 'guideClasses', to: '/Member/classes', svg: ICON.classes, color: 'orange' },
  { key: 'guideProfile', to: '/Member/profile', svg: ICON.profile, color: 'green' }
];

/* =========================================================
   PREGUNTAS FRECUENTES
========================================================= */

const categories = [
  { id: 'all', key: 'catAll' },
  { id: 'account', key: 'catAccount' },
  { id: 'membership', key: 'catMembership' },
  { id: 'classes', key: 'catClasses' },
  { id: 'progress', key: 'catProgress' }
];

const faqs = [
  {
    id: 1,
    cat: 'account',
    q: { es: '¿Cómo cambio mi contraseña o mis datos personales?', en: 'How do I change my password or personal details?' },
    a: {
      es: 'Entra a tu Perfil desde el menú de tu avatar. Ahí puedes actualizar tu nombre, teléfono y contraseña. Los cambios se guardan al presionar el botón de guardar.',
      en: 'Open your Profile from the avatar menu. There you can update your name, phone and password. Changes are saved when you press the save button.'
    }
  },
  {
    id: 2,
    cat: 'account',
    q: { es: '¿Cómo cambio de gimnasio o sucursal?', en: 'How do I switch gyms or branches?' },
    a: {
      es: 'Toca la sucursal actual en la esquina superior izquierda y elige otro de tus gimnasios. La información de la app se actualizará automáticamente.',
      en: 'Tap the current branch in the top-left corner and pick another of your gyms. The app information will refresh automatically.'
    }
  },
  {
    id: 3,
    cat: 'membership',
    q: { es: '¿Dónde veo cuándo vence mi membresía?', en: 'Where can I see when my membership expires?' },
    a: {
      es: 'En Membresía y Pagos → Estado de Membresía encontrarás tu plan activo, la fecha de vencimiento y los días restantes.',
      en: 'Under Membership & Payments → Membership Status you will find your active plan, expiry date and remaining days.'
    }
  },
  {
    id: 4,
    cat: 'membership',
    q: { es: '¿Cómo descargo un comprobante de pago?', en: 'How do I download a payment receipt?' },
    a: {
      es: 'Ve a Membresía y Pagos → Historial de Pagos y selecciona el pago que necesitas. Desde ahí podrás consultar o descargar el comprobante.',
      en: 'Go to Membership & Payments → Payments History and select the payment you need. From there you can view or download the receipt.'
    }
  },
  {
    id: 5,
    cat: 'classes',
    q: { es: '¿Cómo reservo o cancelo una clase?', en: 'How do I book or cancel a class?' },
    a: {
      es: 'En Clases y Reservas elige la clase y el horario y confirma tu lugar. Para cancelar, abre tu reserva y presiona cancelar con la anticipación que marque tu gimnasio.',
      en: 'In Classes & Bookings choose the class and time and confirm your spot. To cancel, open your booking and press cancel within the notice period set by your gym.'
    }
  },
  {
    id: 6,
    cat: 'classes',
    q: { es: '¿Qué pasa si la clase está llena?', en: 'What if the class is full?' },
    a: {
      es: 'Si ya no hay cupo, revisa otros horarios disponibles o vuelve más tarde: si alguien cancela, el lugar se libera para otros miembros.',
      en: 'If there are no spots left, check other available times or come back later: if someone cancels, the spot is released to other members.'
    }
  },
  {
    id: 7,
    cat: 'progress',
    q: { es: '¿Dónde reviso mi progreso y mis asistencias?', en: 'Where can I check my progress and attendance?' },
    a: {
      es: 'En Estadísticas encontrarás tu avance. También puedes ver tu calendario de asistencia y tu racha desde el Inicio.',
      en: 'In Statistics you will find your progress. You can also see your attendance calendar and streak from the Home page.'
    }
  },
  {
    id: 8,
    cat: 'progress',
    q: { es: '¿Cómo contacto a un entrenador?', en: 'How do I contact a trainer?' },
    a: {
      es: 'Entra a Entrenadores, elige al entrenador de tu gimnasio y abre el chat para enviarle tus dudas directamente.',
      en: 'Go to Trainers, choose a trainer from your gym and open the chat to send your questions directly.'
    }
  }
];

/* =========================================================
   ESTADO: búsqueda, filtros y acordeón
========================================================= */

const query = ref('');
const activeCategory = ref('all');
const openFaq = ref(1);

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const filteredFaqs = computed(() => {
  const q = normalize(query.value.trim());

  return faqs.filter((item) => {
    const matchCat = activeCategory.value === 'all' || item.cat === activeCategory.value;
    if (!matchCat) return false;
    if (!q) return true;

    const haystack = normalize(`${item.q[idioma.value]} ${item.a[idioma.value]}`);
    return haystack.includes(q);
  });
});

const toggleFaq = (id) => {
  openFaq.value = openFaq.value === id ? null : id;
};

const resetFilters = () => {
  query.value = '';
  activeCategory.value = 'all';
};

/* =========================================================
   FORMULARIO DE SOPORTE
========================================================= */

const topicOptions = ['topicMembership', 'topicClasses', 'topicAccount', 'topicOther'];

const form = ref({ topic: '', subject: '', message: '' });
const sending = ref(false);
const sent = ref(false);

let sentTimer = null;

const submitForm = async () => {
  if (sending.value) return;

  sending.value = true;

  try {
    /*
      Aquí conecta tu API, por ejemplo:
      await api.post('/member/support', form.value);
    */
    await new Promise((resolve) => setTimeout(resolve, 700));

    form.value = { topic: '', subject: '', message: '' };
    sent.value = true;

    clearTimeout(sentTimer);
    sentTimer = setTimeout(() => {
      sent.value = false;
    }, 4000);
  } finally {
    sending.value = false;
  }
};

/* =========================================================
   CICLO DE VIDA
========================================================= */

onMounted(() => {
  window.addEventListener('idioma-changed', handleIdiomaChanged);
  window.addEventListener('language-changed', handleIdiomaChanged);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleIdiomaChanged);
  window.removeEventListener('language-changed', handleIdiomaChanged);
  clearTimeout(sentTimer);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap');

/* =========================================================
   BASE (usa las variables globales del tema)
========================================================= */

* {
  box-sizing: border-box;
}

/* Fondo igual que el Dashboard */
.help-wrapper {
  min-height: calc(100vh - 72px);
  background:
    radial-gradient(900px 420px at 85% -80px, color-mix(in srgb, var(--color-highlight, #3b82f6) 11%, transparent), transparent 70%),
    var(--bg-custom, var(--color-interfaz, #090909));
  overflow-x: clip;
}

.help-page {
  --accent: var(--color-highlight, #3b82f6);
  --button: var(--color-botones, #2563eb);
  --card: var(--bg-cards, #101317);
  --text: var(--color-texto-general, #f8fafc);
  --title: var(--color-titulos, #ffffff);
  --muted: var(--color-etiquetas, #8b98aa);
  --line: rgba(255, 255, 255, 0.08);
  --hover-bg: rgba(255, 255, 255, 0.05);
  --radius: var(--app-border-radius, 14px);
  --pad: var(--panel-padding, 30px);

  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: clamp(16px, 2.4vw, 34px);
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

.ico {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.kicker {
  display: block;
  margin-bottom: 6px;
  color: var(--accent);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

/* =========================================================
   HERO
========================================================= */

.help-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow: hidden;
  padding: clamp(22px, 3.5vw, 40px);
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 6px);
  background:
    radial-gradient(circle at 92% 0%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 55%),
    var(--card);
}

.hero-copy h1 {
  margin: 0 0 8px;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.6rem, 3.4vw, 2.3rem);
  font-weight: 600;
  line-height: 1.15;
}

.hero-copy p {
  max-width: 520px;
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.6;
}

.search-box {
  width: 100%;
  max-width: 560px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.28);
  color: var(--muted);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent);
}

.search-box input {
  min-width: 0;
  flex: 1;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.92rem;
}

.search-box input::placeholder {
  color: var(--muted);
}

.clear-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
}

/* =========================================================
   CONTACTO RÁPIDO
========================================================= */

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.quick-card,
.guide-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--text);
  text-decoration: none;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.quick-card:hover,
.guide-link:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  background: color-mix(in srgb, var(--card) 88%, white);
}

.quick-icon,
.guide-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.quick-icon.blue, .guide-icon.blue { color: #60a5fa; background: rgba(59, 130, 246, 0.14); }
.quick-icon.purple, .guide-icon.purple { color: #c084fc; background: rgba(168, 85, 247, 0.14); }
.quick-icon.green, .guide-icon.green { color: #34d399; background: rgba(16, 185, 129, 0.14); }
.quick-icon.orange, .guide-icon.orange { color: #fb923c; background: rgba(249, 115, 22, 0.14); }

.quick-copy,
.guide-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.quick-copy strong,
.guide-copy strong {
  color: var(--title);
  font-size: 0.92rem;
  font-weight: 650;
}

.quick-copy small,
.guide-copy small {
  margin-top: 2px;
  overflow: hidden;
  color: var(--muted);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-arrow {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: var(--muted);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.16s ease, stroke 0.16s ease;
}

.quick-card:hover .quick-arrow,
.guide-link:hover .quick-arrow {
  transform: translateX(3px);
  stroke: var(--accent);
}

/* =========================================================
   LAYOUT PRINCIPAL
========================================================= */

.help-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 22px;
  align-items: start;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.panel {
  padding: var(--pad);
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 4px);
  background: var(--card);
}

.panel-head {
  margin-bottom: 18px;
}

.panel-head h2,
.contact-intro h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
}

/* =========================================================
   CHIPS
========================================================= */

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.chip {
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}

.chip:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.chip.on {
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: color-mix(in srgb, var(--accent) 65%, white);
}

/* =========================================================
   ACORDEÓN
========================================================= */

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.18s ease, background 0.18s ease;
}

.faq-item:hover {
  border-color: rgba(255, 255, 255, 0.14);
}

.faq-item.open {
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.faq-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}

.faq-icon .ico {
  width: 17px;
  height: 17px;
}

.faq-text {
  flex: 1;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.4;
}

.faq-chevron {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: var(--muted);
  transition: transform 0.22s ease, fill 0.22s ease;
}

.faq-item.open .faq-chevron {
  transform: rotate(180deg);
  fill: var(--accent);
}

/* Animación de altura sin JS */
.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.26s ease;
}

.faq-item.open .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer {
  min-height: 0;
  overflow: hidden;
}

.faq-answer p {
  margin: 0;
  padding: 0 16px 18px 62px;
  color: var(--muted);
  font-size: 0.87rem;
  line-height: 1.7;
}

/* =========================================================
   SIN RESULTADOS
========================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 34px 16px;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted);
}

.empty-icon .ico {
  width: 26px;
  height: 26px;
}

.empty-state strong {
  color: var(--title);
  font-size: 1rem;
}

.empty-state p {
  max-width: 320px;
  margin: 0 0 6px;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.6;
}

/* =========================================================
   GUÍAS + HORARIO
========================================================= */

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-link {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
}

.guide-icon {
  width: 40px;
  height: 40px;
}

.hours-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.hours-head strong {
  display: block;
  color: var(--title);
  font-size: 0.95rem;
}

.hours-head small {
  color: var(--muted);
  font-size: 0.78rem;
}

.hours-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hours-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-top: 1px solid var(--line);
  font-size: 0.85rem;
}

.hours-list span {
  color: var(--muted);
}

.hours-list strong {
  color: var(--text);
  font-weight: 650;
}

/* =========================================================
   FORMULARIO
========================================================= */

.contact-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.4fr);
  gap: clamp(20px, 4vw, 48px);
}

.contact-intro p {
  margin: 10px 0 18px;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.7;
}

.contact-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius);
  background: rgba(16, 185, 129, 0.08);
  color: #34d399;
  font-size: 0.82rem;
  font-weight: 600;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: calc(var(--radius) - 2px);
  outline: 0;
  background: rgba(0, 0, 0, 0.26);
  color: var(--text);
  font-family: inherit;
  font-size: 0.88rem;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.field textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.field select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b98aa'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 20px;
  padding-right: 36px;
}

.field select option {
  background: #111419;
  color: #f8fafc;
}

.field input::placeholder,
.field textarea::placeholder {
  color: var(--muted);
  opacity: 0.8;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
}

.counter {
  align-self: flex-end;
  color: var(--muted);
  font-size: 0.72rem;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
}

.sent-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #34d399;
  font-size: 0.82rem;
  font-weight: 700;
}

.btn-primary {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 22px;
  border: 0;
  border-radius: calc(var(--radius) - 2px);
  background: var(--button);
  color: var(--color-texto-botones, #fff);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, filter 0.16s ease, opacity 0.16s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: wait;
}

.btn-primary .ico {
  width: 17px;
  height: 17px;
}

.btn-ghost {
  padding: 9px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.16s ease;
}

.btn-ghost:hover {
  background: var(--hover-bg);
}

/* =========================================================
   TRANSICIONES
========================================================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1020px) {
  .help-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .contact-panel {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 760px) {
  .quick-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .help-page {
    gap: 16px;
    padding: 14px;
  }

  .panel {
    padding: 20px 16px;
  }

  .field-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .faq-answer p {
    padding: 0 16px 16px;
  }

  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .sent-badge {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>