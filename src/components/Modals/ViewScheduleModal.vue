<template>
  <div class="schedule-wrapper">
    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]" role="status">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
          <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 17h.01" /></svg>
        </div>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- CONFIRMAR ELIMINACIÓN -->
    <transition name="toast">
      <div v-if="pendingDelete" class="confirm-overlay" @click.self="pendingDelete = null">
        <div class="confirm-box" role="alertdialog" aria-modal="true">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" /></svg>
          </div>
          <h3>{{ t('deleteTitle') }}</h3>
          <p>
            {{ t('deletePrefix') }} <strong>{{ pendingDelete.nombre }}</strong> {{ t('deleteFromSchedule') }}
            ({{ dayLabel(pendingDelete.dia) }}, {{ formatHour(pendingDelete.inicio) }}). {{ t('deleteWarning') }}
          </p>
          <div class="confirm-actions">
            <button type="button" class="btn-ghost" :disabled="guardando" @click="pendingDelete = null">
              {{ t('cancel') }}
            </button>
            <button type="button" class="btn-danger" :disabled="guardando" @click="confirmDelete">
              {{ t('yesDelete') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- FORMULARIO: NUEVA / EDITAR ACTIVIDAD -->
    <transition name="toast">
      <div v-if="showForm" class="form-overlay" @click.self="closeForm">
        <AddScheduleModal
          :initial-data="formData"
          :custom-categories="customCategories"
          :validator="validateActivity"
          :saving="guardando"
          @save="saveActivity"
          @close="closeForm"
        />
      </div>
    </transition>

    <div class="schedule-panel">
      <!-- ================= HEADER ================= -->
      <header class="schedule-header">
        <div class="header-info">
          <div class="header-icon">
            <svg viewBox="0 0 24 24">
              <path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
              <path d="M8 13h3v3H8z" />
            </svg>
          </div>
          <div>
            <span class="header-eyebrow">{{ t('gymSchedule') }}</span>
            <h2>{{ t('scheduleTitle') }} <span>{{ t('weekly') }}</span></h2>
            <p>{{ t('headerDescription') }}</p>
          </div>
        </div>
        <button class="close-btn" type="button" :aria-label="t('close')" @click="emit('close')">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div v-if="cargando" class="loading-bar" aria-hidden="true"><i></i></div>
      </header>

      <!-- ================= TOOLBAR ================= -->
      <div class="calendar-toolbar">
        <div class="week-navigation">
          <button type="button" class="nav-btn" :aria-label="t('previousWeek')" @click="previousWeek">
            <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" class="today-btn" @click="goToday">{{ t('today') }}</button>
          <button type="button" class="nav-btn" :aria-label="t('nextWeek')" @click="nextWeek">
            <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div class="week-info">
            <strong>{{ weekTitle }}</strong>
            <span>{{ weekRange }}</span>
          </div>
        </div>

        <div class="toolbar-right">
          <div class="legend">
            <span><i class="dot scheduled"></i> {{ t('scheduled') }}</span>
            <span><i class="dot available"></i> {{ t('available') }}</span>
          </div>
          <button class="new-activity-btn" type="button" @click="createActivity">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            <span>{{ t('newActivity') }}</span>
          </button>
        </div>
      </div>

      <!-- ERROR API -->
      <div v-if="errorApi" class="error-banner" role="alert">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 17h.01" /></svg>
        <span>{{ errorApi }}</span>
        <button type="button" @click="cargarActividades">{{ t('retry') }}</button>
      </div>

      <!-- ================= RESUMEN ================= -->
      <div class="summary-grid">
        <article class="summary-card">
          <div class="summary-icon blue">
            <svg viewBox="0 0 24 24"><path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" /></svg>
          </div>
          <div>
            <strong>{{ activities.length }}</strong>
            <span>{{ t('activities') }}</span>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon green">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" /><path d="M2 21a7 7 0 0 1 14 0M17 11a4 4 0 0 1 5 4v6" /></svg>
          </div>
          <div>
            <strong>{{ totalCapacity }}</strong>
            <span>{{ t('totalCapacity') }}</span>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon purple">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
          </div>
          <div>
            <strong>{{ instructorsCount }}</strong>
            <span>{{ t('instructors') }}</span>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon orange">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          </div>
          <div>
            <strong>{{ totalHours }}h</strong>
            <span>{{ t('scheduledHours') }}</span>
          </div>
        </article>
      </div>

      <!-- ============================================================
           DESKTOP — AGENDA SEMANAL
      ============================================================ -->
      <div class="desktop-calendar">
        <div class="calendar-scroll">
          <!-- CABECERA DÍAS (fija al hacer scroll) -->
          <div class="calendar-days-header">
            <div class="time-header"><span>{{ t('hour') }}</span></div>
            <div
              v-for="day in weekDays"
              :key="day.key"
              class="day-header"
              :class="{ today: day.isToday }"
            >
              <span class="day-name">{{ day.short }}</span>
              <strong>{{ day.number }}</strong>
              <small>{{ day.month }}</small>
              <span v-if="day.isToday" class="today-indicator">{{ t('todayUpper') }}</span>
              <div class="day-count">
                {{ activitiesForDay(day.key).length }}
                {{ activitiesForDay(day.key).length === 1 ? t('activity') : t('activitiesLower') }}
              </div>
            </div>
          </div>

          <!-- CUERPO: una fila por hora; la fila crece si el evento lo necesita -->
          <div class="calendar-body">
            <div
              v-for="hour in hours"
              :key="hour"
              class="hour-row"
              :class="{ current: isCurrentHour(hour) }"
            >
              <div class="time-cell">
                <span>{{ formatHour(hour) }}</span>
              </div>

              <div
                v-for="day in weekDays"
                :key="`${day.key}-${hour}`"
                class="calendar-slot"
                :class="{ occupied: !!getActivity(day.key, hour), today: day.isToday }"
              >
                <!-- ACTIVIDAD -->
                <template v-for="ev in eventsAt(day.key, hour)" :key="ev.id">
                  <article
                    class="activity-event"
                    :style="{ '--event-color': colorOf(ev) }"
                    :title="`${catLabel(ev.categoria)} · ${levelLabel(ev.nivel)}`"
                    tabindex="0"
                    @click="openActivity(ev)"
                    @keydown.enter="openActivity(ev)"
                  >
                    <div class="event-accent"></div>
                    <div class="event-top">
                      <span class="event-time">{{ formatHour(ev.inicio) }}</span>
                      <span class="event-capacity">
                        <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3" /><path d="M3 21a6 6 0 0 1 12 0M17 11a4 4 0 0 1 4 4v6" /></svg>
                        {{ ev.inscritos || 0 }}/{{ ev.capacidad }}
                      </span>
                    </div>
                    <strong>{{ ev.nombre }}</strong>
                    <span class="event-tag">{{ catLabel(ev.categoria) }}</span>
                    <span class="event-price">{{ (ev.precio || 0) > 0 ? '$' + Number(ev.precio).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN' : (idioma === 'en' ? 'Free' : 'Gratis') }}</span>
                    <div class="event-detail">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>
                      <span>{{ ev.instructor }}</span>
                    </div>
                    <div v-if="ev.ubicacion" class="event-detail">
                      <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></svg>
                      <span>{{ ev.ubicacion }}</span>
                    </div>

                    <!-- MEDIA -->
                    <div v-if="hasMedia(ev)" class="event-media" @click.stop>
                      <a
                        v-for="(url, i) in ev.imagenes || []"
                        :key="url"
                        :href="imageView(ev, i)"
                        target="_blank"
                        rel="noopener"
                      >
                        <img :src="imageView(ev, i)" :alt="`${t('image')} ${i + 1}`" loading="lazy" @error="mediaError" />
                      </a>
                      <a v-if="ev.video_url" class="video-link" :href="videoView(ev)" target="_blank" rel="noopener">
                        ▶ {{ t('video') }}
                      </a>
                    </div>

                    <div class="event-progress"><i :style="{ width: fillPercent(ev) + '%' }"></i></div>

                    <!-- ACCIONES -->
                    <div v-if="!locked(ev)" class="event-actions">
                      <button type="button" class="icon-btn" :title="t('edit')" :aria-label="t('editActivity')" @click.stop="editActivity(ev)">
                        <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" /></svg>
                      </button>
                      <button type="button" class="icon-btn danger" :title="t('delete')" :aria-label="t('deleteActivity')" @click.stop="askDelete(ev)">
                        <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                      </button>
                    </div>
                  </article>
                </template>

                <!-- SLOT VACÍO -->
                <button
                  v-if="!getActivity(day.key, hour)"
                  type="button"
                  class="empty-slot"
                  @click="selectSlot(day.key, hour)"
                >
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  <span>{{ t('schedule') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           MOBILE
      ============================================================ -->
      <div class="mobile-calendar">
        <div class="mobile-days">
          <button
            v-for="(day, index) in weekDays"
            :key="day.key"
            type="button"
            :class="['mobile-day', { active: activeDay === index, today: day.isToday }]"
            @click="activeDay = index"
          >
            <span>{{ day.short }}</span>
            <strong>{{ day.number }}</strong>
            <i v-if="activitiesForDay(day.key).length"></i>
          </button>
        </div>

        <div class="mobile-day-header">
          <div>
            <span>{{ t('daySchedule') }}</span>
            <h3>{{ weekDays[activeDay]?.full }}</h3>
          </div>
          <strong>
            {{ activitiesForDay(activeKey).length }}
            {{ activitiesForDay(activeKey).length === 1 ? t('activity') : t('activitiesLower') }}
          </strong>
        </div>

        <div class="mobile-timeline">
          <div v-for="hour in hours" :key="hour" class="mobile-time-row">
            <div class="mobile-time">{{ formatHour(hour) }}</div>
            <div class="mobile-line"><span></span></div>

            <div class="mobile-content">
              <template v-for="ev in eventsAt(activeKey, hour)" :key="ev.id">
                <article
                  class="mobile-event"
                  :style="{ '--event-color': colorOf(ev) }"
                  @click="openActivity(ev)"
                >
                  <div class="mobile-event-top">
                    <div>
                      <span>{{ catLabel(ev.categoria) }}</span>
                      <strong>{{ ev.nombre }}</strong>
                    </div>
                    <div v-if="!locked(ev)" class="mobile-actions">
                      <button type="button" class="icon-btn" :aria-label="t('editActivity')" @click.stop="editActivity(ev)">
                        <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" /></svg>
                      </button>
                      <button type="button" class="icon-btn danger" :aria-label="t('deleteActivity')" @click.stop="askDelete(ev)">
                        <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                      </button>
                    </div>
                  </div>

                    <div class="mobile-event-price">{{ (ev.precio || 0) > 0 ? '$' + Number(ev.precio).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN' : (idioma === 'en' ? 'Free admission' : 'Entrada gratuita') }}</div>
                   <div class="mobile-event-details">
                    <span>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                      {{ formatHour(ev.inicio) }} – {{ formatHour(ev.fin) }}
                    </span>
                    <span>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>
                      {{ ev.instructor }}
                    </span>
                    <span v-if="ev.ubicacion">
                      <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></svg>
                      {{ ev.ubicacion }}
                    </span>
                  </div>

                  <div v-if="hasMedia(ev)" class="event-media" @click.stop>
                    <a
                      v-for="(url, i) in ev.imagenes || []"
                      :key="url"
                      :href="imageView(ev, i)"
                      target="_blank"
                      rel="noopener"
                    >
                      <img :src="imageView(ev, i)" :alt="`${t('image')} ${i + 1}`" loading="lazy" @error="mediaError" />
                    </a>
                    <a v-if="ev.video_url" class="video-link" :href="videoView(ev)" target="_blank" rel="noopener">
                      ▶ {{ t('video') }}
                    </a>
                  </div>

                  <div class="mobile-event-footer">
                    <span>{{ levelLabel(ev.nivel) }}</span>
                    <span>{{ ev.inscritos || 0 }}/{{ ev.capacidad }} {{ t('people') }}</span>
                  </div>
                  <div class="event-progress static"><i :style="{ width: fillPercent(ev) + '%' }"></i></div>
                </article>
              </template>

              <button
                v-if="!getActivity(activeKey, hour)"
                type="button"
                class="mobile-empty"
                @click="selectSlot(activeKey, hour)"
              >
                <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                {{ t('availableSchedule') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= FOOTER ================= -->
      <footer class="calendar-footer">
        <div>
          <span class="footer-dot"></span>
          <p>{{ t('footerHint') }}</p>
        </div>
        <button type="button" @click="emit('close')">{{ t('closeSchedule') }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import AddScheduleModal from './AddScheduleModal.vue';
import { categoryColor, categoryLabel } from './scheduleCategories.ts';

/* ============================================================
   TIPOS
============================================================ */
interface Activity {
  id: number;
  dia: string;
  fecha?: string;
  nombre: string;
  categoria: string;
  nivel: string;
  instructor: string;
  capacidad: number;
  precio: number;
  inscritos?: number;
  inicio: string;
  fin: string;
  ubicacion: string;
  descripcion?: string;
  color?: string;
  imagenes?: string[];
  imagenes_vista?: string[];
  video_url?: string;
  video_vista?: string;
}

type Lang = 'es' | 'en';
type ToastType = 'success' | 'error';

const emit = defineEmits(['close', 'activity-click', 'save-activity', 'delete-activity']);

/* ============================================================
   ESTADO
============================================================ */
const activeDay = ref(0);
const showForm = ref(false);
const formData = ref<Record<string, any> | null>(null);
const cargando = ref(false);
const guardando = ref(false);
const errorApi = ref('');
const currentDate = ref(new Date());
const pendingDelete = ref<Activity | null>(null);
const activities = ref<Activity[]>([]);
const now = ref(new Date());

const toast = reactive<{ show: boolean; message: string; type: ToastType }>({
  show: false,
  message: '',
  type: 'success'
});

/* ============================================================
   IDIOMA
============================================================ */
const normalizeLanguage = (value: unknown): Lang =>
  String(value || '').toLowerCase().startsWith('en') ? 'en' : 'es';

const idioma = ref<Lang>(normalizeLanguage(localStorage.getItem('owner-idioma')));

const translations: Record<Lang, Record<string, string>> = {
  es: {
    deleteTitle: '¿Eliminar evento?', deletePrefix: 'Se quitará', deleteFromSchedule: 'de la agenda',
    deleteWarning: 'Esta acción no se puede deshacer.', cancel: 'Cancelar', yesDelete: 'Sí, eliminar',
    gymSchedule: 'AGENDA DE EVENTOS', scheduleTitle: 'Eventos', weekly: 'Semanales',
    headerDescription: 'Agrega y administra los eventos del gimnasio.', close: 'Cerrar',
    previousWeek: 'Semana anterior', today: 'Hoy', nextWeek: 'Semana siguiente',
    scheduled: 'Programado', available: 'Disponible', newActivity: 'Nuevo evento',
    activities: 'Eventos', totalCapacity: 'Cupos totales', instructors: 'Responsables',
    scheduledHours: 'Horas agendadas', hour: 'HORA', todayUpper: 'HOY',
    activity: 'evento', activitiesLower: 'eventos', edit: 'Editar', delete: 'Eliminar',
    editActivity: 'Editar evento', deleteActivity: 'Eliminar evento', schedule: 'Agendar',
    daySchedule: 'AGENDA DEL DÍA', people: 'personas', availableSchedule: 'Espacio libre',
    footerHint: 'Selecciona un espacio libre para registrar un nuevo evento.',
    closeSchedule: 'Cerrar agenda', retry: 'Reintentar', image: 'Imagen', video: 'Video',
    imageUnavailable: 'Imagen no disponible',
    conflictPrefix: 'Ya existe el evento', conflictOn: 'el', conflictAt: 'a las', conflictChoose: 'Elige otra hora.',
    toastUpdated: 'Evento actualizado.', toastAdded: 'Evento registrado.', toastDeleted: 'Evento eliminado.',
    pastCreate: 'No se permiten eventos en fechas pasadas.',
    pastEdit: 'No se pueden editar eventos pasados.',
    pastDelete: 'No se pueden eliminar eventos pasados.',
    maxImages: 'Máximo 3 imágenes por evento.',
    uploadLimit: 'El archivo supera el límite del servidor. Ajusta upload_max_filesize y post_max_size en PHP.',
    noUrl: 'La API no devolvió la URL del archivo.',
    noSession: 'No hay sesión activa.',
    noConnection: 'No se pudo conectar con el servidor.',
    levelBeginner: 'Principiante', levelIntermediate: 'Intermedio', levelAdvanced: 'Avanzado', levelAll: 'Todos'
  },
  en: {
    deleteTitle: 'Delete event?', deletePrefix: 'This will remove', deleteFromSchedule: 'from the schedule',
    deleteWarning: 'This action cannot be undone.', cancel: 'Cancel', yesDelete: 'Yes, delete',
    gymSchedule: 'EVENT SCHEDULE', scheduleTitle: 'Weekly', weekly: 'Events',
    headerDescription: 'Add and manage the gym events.', close: 'Close',
    previousWeek: 'Previous week', today: 'Today', nextWeek: 'Next week',
    scheduled: 'Scheduled', available: 'Available', newActivity: 'New event',
    activities: 'Events', totalCapacity: 'Total capacity', instructors: 'Hosts',
    scheduledHours: 'Scheduled hours', hour: 'TIME', todayUpper: 'TODAY',
    activity: 'event', activitiesLower: 'events', edit: 'Edit', delete: 'Delete',
    editActivity: 'Edit event', deleteActivity: 'Delete event', schedule: 'Schedule',
    daySchedule: 'DAY SCHEDULE', people: 'people', availableSchedule: 'Free slot',
    footerHint: 'Select a free time slot to add a new event.',
    closeSchedule: 'Close schedule', retry: 'Retry', image: 'Image', video: 'Video',
    imageUnavailable: 'Image unavailable',
    conflictPrefix: 'There is already the event', conflictOn: 'on', conflictAt: 'at', conflictChoose: 'Choose another time.',
    toastUpdated: 'Event updated.', toastAdded: 'Event created.', toastDeleted: 'Event deleted.',
    pastCreate: 'You cannot schedule in the past.',
    pastEdit: 'Past events cannot be edited.',
    pastDelete: 'Past events cannot be deleted.',
    maxImages: 'Maximum 3 images per event.',
    uploadLimit: 'Server upload limit exceeded. Raise PHP upload_max_filesize/post_max_size.',
    noUrl: 'The API did not return the file URL.',
    noSession: 'No active session.',
    noConnection: 'Could not connect to the server.',
    levelBeginner: 'Beginner', levelIntermediate: 'Intermediate', levelAdvanced: 'Advanced', levelAll: 'All levels'
  }
};

const t = (key: string): string =>
  translations[idioma.value]?.[key] ?? translations.es[key] ?? key;

const syncLanguage = () => {
  idioma.value = normalizeLanguage(localStorage.getItem('owner-idioma'));
};

const handleLanguageChange = (event: Event) => {
  const detail = (event as CustomEvent<{ idioma?: string }>).detail;
  const next = normalizeLanguage(detail?.idioma || localStorage.getItem('owner-idioma'));
  idioma.value = next;
  localStorage.setItem('owner-idioma', next);
};

const locale = computed(() => (idioma.value === 'en' ? 'en-US' : 'es-MX'));

/* ============================================================
   API
============================================================ */
const API = String(import.meta.env.VITE_API_URL || '')
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

const SEDE_KEYS = [
  'selected_sede_id', 'sede_id', 'ID_Sede', 'id_sede', 'selectedSede',
  'selectedSedeId', 'sedeSeleccionada', 'gym_sede_id'
];
const TOKEN_KEYS = [
  'auth_token', 'token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken'
];
const SESSION_OBJECT_KEYS = ['auth', 'user', 'session', 'gymAccount', 'gym_account'];

const sedeActual = (): number => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of SEDE_KEYS) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        const value = typeof obj === 'object' && obj ? (obj.ID_Sede ?? obj.sede_id ?? obj.id ?? obj.value) : obj;
        const n = Number(value);
        if (Number.isInteger(n) && n > 0) return n;
      } catch {
        const n = Number(raw);
        if (Number.isInteger(n) && n > 0) return n;
      }
    }
  }
  return 1;
};

const tokenActual = (): string => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of TOKEN_KEYS) {
      const value = storage.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of SESSION_OBJECT_KEYS) {
      try {
        const obj = JSON.parse(storage.getItem(key) || 'null');
        const value = obj?.token || obj?.access_token || obj?.accessToken;
        if (value) return String(value).replace(/^Bearer\s+/i, '');
      } catch {
        /* JSON inválido: se ignora */
      }
    }
  }
  return '';
};

const consultar = async (path: string, init: RequestInit = {}) => {
  const token = tokenActual();
  if (!token) throw new Error(t('noSession'));

  let response: Response;
  try {
    response = await fetch(`${API}/api/gym/agenda${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers || {})
      }
    });
  } catch {
    throw new Error(t('noConnection'));
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.errors ? Object.values(data.errors).flat().join(' ') : '';
    const message = data?.message && data.message !== 'Server Error' ? data.message : '';
    throw new Error(detail || message || `Error HTTP ${response.status}. Revisa los logs de Railway.`);
  }
  return data;
};

let ultimaConsulta = 0;

const cargarActividades = async () => {
  const seq = ++ultimaConsulta;
  cargando.value = true;
  errorApi.value = '';
  try {
    const data = await consultar(`?sede_id=${sedeActual()}`);
    if (seq !== ultimaConsulta) return;
    activities.value = (data.actividades || []).map((a: any) => ({
      ...a,
      id: Number(a.id),
      capacidad: Number(a.capacidad),
      precio: Number(a.precio ?? 0),
      inscritos: Number(a.inscritos || 0)
    }));
  } catch (e: any) {
    if (seq === ultimaConsulta) {
      activities.value = [];
      errorApi.value = e.message;
    }
  } finally {
    if (seq === ultimaConsulta) cargando.value = false;
  }
};

const cambiarSede = () => {
  closeForm();
  pendingDelete.value = null;
  void cargarActividades();
};

/* ============================================================
   CALENDARIO
============================================================ */
const pad = (n: number) => String(n).padStart(2, '0');

/* De 6:00 a. m. hasta la franja de 11:00 p. m. (cierra a las 12:00 a. m.) */
const FIRST_HOUR = 6;
const LAST_HOUR = 23;
const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => `${pad(FIRST_HOUR + i)}:00`);

const isCurrentHour = (hour: string) => Number(hour.slice(0, 2)) === now.value.getHours();

const dayData = [
  { key: 'monday', es: 'Lunes', en: 'Monday', shortEs: 'LUN', shortEn: 'MON' },
  { key: 'tuesday', es: 'Martes', en: 'Tuesday', shortEs: 'MAR', shortEn: 'TUE' },
  { key: 'wednesday', es: 'Miércoles', en: 'Wednesday', shortEs: 'MIÉ', shortEn: 'WED' },
  { key: 'thursday', es: 'Jueves', en: 'Thursday', shortEs: 'JUE', shortEn: 'THU' },
  { key: 'friday', es: 'Viernes', en: 'Friday', shortEs: 'VIE', shortEn: 'FRI' },
  { key: 'saturday', es: 'Sábado', en: 'Saturday', shortEs: 'SÁB', shortEn: 'SAT' },
  { key: 'sunday', es: 'Domingo', en: 'Sunday', shortEs: 'DOM', shortEn: 'SUN' }
];

const catLabel = (key: string) => categoryLabel(key, idioma.value);

const predefinedCategories = new Set(['yoga', 'spinning', 'crossfit', 'boxing', 'pilates', 'zumba']);
const customCategories = computed(() =>
  Array.from(
    new Set(activities.value.map(a => a.categoria).filter(k => k && !predefinedCategories.has(k)))
  )
);

const levelLabel = (level: string) => {
  const map: Record<string, string> = {
    Principiante: t('levelBeginner'),
    Intermedio: t('levelIntermediate'),
    Avanzado: t('levelAdvanced'),
    Todos: t('levelAll')
  };
  return map[level] || level;
};

const colorOf = (activity: Activity) =>
  categoryColor(activity.categoria) || activity.color || 'var(--color-highlight, #3b82f6)';

const getMonday = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day + (day === 0 ? -6 : 1));
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const weekDays = computed(() => {
  const monday = getMonday(currentDate.value);
  const today = new Date();

  return dayData.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const monthLong = date.toLocaleDateString(locale.value, { month: 'long' });

    return {
      ...day,
      short: idioma.value === 'en' ? day.shortEn : day.shortEs,
      number: date.getDate(),
      month: date.toLocaleDateString(locale.value, { month: 'short' }).replace('.', '').toUpperCase(),
      full:
        idioma.value === 'en'
          ? `${day.en}, ${monthLong} ${date.getDate()}`
          : `${day.es}, ${date.getDate()} de ${monthLong}`,
      date,
      isToday
    };
  });
});

const activeKey = computed(() => weekDays.value[activeDay.value]?.key || '');

const weekTitle = computed(() => {
  const first = weekDays.value[0]?.date;
  if (!first) return '';
  const month = first.toLocaleDateString(locale.value, { month: 'long' });
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${first.getFullYear()}`;
});

const weekRange = computed(() => {
  const first = weekDays.value[0];
  const last = weekDays.value[6];
  if (!first || !last) return '';
  return `${first.number} ${first.month} — ${last.number} ${last.month}`;
});

const totalCapacity = computed(() =>
  activities.value.reduce((total, item) => total + item.capacidad, 0)
);

const instructorsCount = computed(
  () => new Set(activities.value.map(item => item.instructor)).size
);

const totalHours = computed(() => {
  const value = activities.value.reduce((total, activity) => {
    const [startHour = 0, startMinute = 0] = activity.inicio.split(':').map(Number);
    const [endHour = 0, endMinute = 0] = activity.fin.split(':').map(Number);
    return total + ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
  }, 0);
  return Math.round(value * 10) / 10;
});

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const dateForDay = (day: string): Date | undefined =>
  weekDays.value.find(d => d.key === day)?.date;

const showsOnDay = (a: Activity, day: string) => {
  if (a.dia !== day) return false;
  if (!a.fecha) return true;
  const date = dateForDay(day);
  return !!date && a.fecha === isoDate(date);
};

const locked = (a: Activity) => Boolean(a.fecha && a.fecha < isoDate(new Date()));

const activitiesForDay = (day: string) =>
  activities.value.filter(activity => showsOnDay(activity, day));

const sameHour = (a: string, b: string) => a.slice(0, 2) === b.slice(0, 2);

const getActivity = (day: string, hour: string) =>
  activities.value.find(activity => showsOnDay(activity, day) && sameHour(activity.inicio, hour));

/* Devuelve 0 o 1 elemento para poder usar v-for en la plantilla */
const eventsAt = (day: string, hour: string) => {
  const found = getActivity(day, hour);
  return found ? [found] : [];
};

const fillPercent = (activity: Activity) => {
  if (!activity.capacidad) return 0;
  return Math.min(100, Math.round(((activity.inscritos || 0) / activity.capacidad) * 100));
};

const dayLabel = (key: string) => {
  const day = dayData.find(item => item.key === key);
  if (!day) return key;
  return idioma.value === 'en' ? day.en : day.es;
};

const dayKeyFromLabel = (label: string) =>
  dayData.find(item => item.es === label || item.en === label)?.key || label;

const formatHour = (time: string) => {
  if (!time) return '';
  const [hoursValue, minutes] = time.split(':');
  const date = new Date();
  date.setHours(Number(hoursValue), Number(minutes), 0, 0);
  return date.toLocaleTimeString(locale.value, { hour: 'numeric', minute: '2-digit', hour12: true });
};

/* ============================================================
   MEDIA
============================================================ */
const hasMedia = (a: Activity) => Boolean((a.imagenes || []).length || a.video_url);
const imageView = (a: Activity, index: number) => a.imagenes_vista?.[index] || a.imagenes?.[index] || '';
const videoView = (a: Activity) => a.video_vista || a.video_url || '';

const mediaError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent && !parent.querySelector('.image-unavailable')) {
    const span = document.createElement('span');
    span.className = 'image-unavailable';
    span.textContent = t('imageUnavailable');
    parent.appendChild(span);
  }
};

const uploadMedia = async (file: File, kind: 'image' | 'video'): Promise<string> => {
  const body = new FormData();
  body.append('archivo', file);
  body.append('tipo', kind);
  body.append('sede_id', String(sedeActual()));

  const response = await fetch(`${API}/api/gym/agenda/media`, {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${tokenActual()}` },
    body
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 413) throw new Error(t('uploadLimit'));
    const detail = result?.errors?.archivo?.[0] || result?.message || `Error HTTP ${response.status}`;
    throw new Error(String(detail));
  }
  if (!result.url) throw new Error(t('noUrl'));
  return String(result.url);
};

/* ============================================================
   TOAST
============================================================ */
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const showToast = (message: string, type: ToastType = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.show = false;
  }, 2600);
};

/* ============================================================
   FORMULARIO
============================================================ */
const addOneHour = (hour: string) => {
  const [h = 0, m = 0] = hour.split(':').map(Number);
  if (h >= 23) return '23:59';
  return `${pad(h + 1)}:${pad(m)}`;
};

const openForm = (data: Record<string, any> | null = null) => {
  formData.value = data;
  showForm.value = true;
};

const closeForm = () => {
  if (guardando.value) return;
  showForm.value = false;
  formData.value = null;
};

/* Clic en un espacio libre */
const selectSlot = (day: string, hour: string) => {
  const date = dateForDay(day);
  if (!date || isoDate(date) < isoDate(new Date())) {
    showToast(t('pastCreate'), 'error');
    return;
  }
  openForm({
    day: dayData.find(item => item.key === day)?.es || day,
    fecha: isoDate(date),
    hour,
    fin: addOneHour(hour)
  });
};

const createActivity = () => openForm(null);

const openActivity = (activity: Activity) => emit('activity-click', activity);

const editActivity = (activity: Activity) => {
  if (locked(activity)) {
    showToast(t('pastEdit'), 'error');
    return;
  }
  openForm({
    id: activity.id,
    fecha: activity.fecha,
    imagenes: activity.imagenes || [],
    imagenes_vista: activity.imagenes_vista || [],
    video_url: activity.video_url || '',
    video_vista: activity.video_vista || '',
    day: dayData.find(item => item.key === activity.dia)?.es || activity.dia,
    hour: activity.inicio,
    fin: activity.fin,
    nombre: activity.nombre,
    categoria: activity.categoria,
    nivel: activity.nivel,
    instructor: activity.instructor,
    capacidad: activity.capacidad,
    precio: activity.precio ?? 0,
    ubicacion: activity.ubicacion,
    descripcion: activity.descripcion || ''
  });
};

/* El calendario muestra un evento por franja horaria: evita encimar eventos */
const validateActivity = (data: Record<string, any>) => {
  const dayKey = dayKeyFromLabel(data.dia);
  const conflict = activities.value.find(
    item =>
      item.id !== data.id &&
      item.dia === dayKey &&
      (!item.fecha || item.fecha === data.fecha) &&
      sameHour(item.inicio, data.inicio)
  );
  return conflict
    ? `${t('conflictPrefix')} "${conflict.nombre}" ${t('conflictOn')} ${dayLabel(dayKey).toLowerCase()} ${t('conflictAt')} ${formatHour(conflict.inicio)}. ${t('conflictChoose')}`
    : null;
};

/* GUARDAR (nueva o editada) */
const saveActivity = async (data: Record<string, any>) => {
  if (guardando.value) return;
  guardando.value = true;

  try {
    const files: File[] = data.imagesFiles || [];
    const path = data.id ? `/${Number(data.id)}` : '';
    const method = data.id ? 'PUT' : 'POST';

    const imagenes: string[] = files.length ? [] : Array.isArray(data.imagenes) ? [...data.imagenes] : [];
    if (imagenes.length + files.length > 3) throw new Error(t('maxImages'));

    for (const file of files) imagenes.push(await uploadMedia(file, 'image'));

    let video_url: string = data.video_url || '';
    if (data.videoFile) video_url = await uploadMedia(data.videoFile, 'video');

    await consultar(path, {
      method,
      body: JSON.stringify({
        sede_id: sedeActual(),
        dia: dayKeyFromLabel(data.dia),
        fecha: data.fecha,
        nombre: data.nombre,
        categoria: data.categoria,
        nivel: data.nivel,
        instructor: data.instructor,
        capacidad: Number(data.capacidad),
        precio: Number(data.precio),
        inicio: data.inicio,
        fin: data.fin,
        ubicacion: data.ubicacion || '',
        descripcion: data.descripcion || '',
        imagenes,
        video_url
      })
    });

    showForm.value = false;
    formData.value = null;
    await cargarActividades();
    showToast(data.id ? t('toastUpdated') : t('toastAdded'));
  } catch (e: any) {
    errorApi.value = e.message;
    showToast(e.message, 'error');
  } finally {
    guardando.value = false;
  }
};

/* ELIMINAR */
const askDelete = (activity: Activity) => {
  if (locked(activity)) {
    showToast(t('pastDelete'), 'error');
    return;
  }
  pendingDelete.value = activity;
};

const confirmDelete = async () => {
  const activity = pendingDelete.value;
  if (!activity || guardando.value) return;
  if (locked(activity)) {
    pendingDelete.value = null;
    return;
  }

  guardando.value = true;
  try {
    await consultar(`/${activity.id}?sede_id=${sedeActual()}`, { method: 'DELETE' });
    pendingDelete.value = null;
    await cargarActividades();
    showToast(t('toastDeleted'));
  } catch (e: any) {
    errorApi.value = e.message;
    showToast(e.message, 'error');
  } finally {
    guardando.value = false;
  }
};

/* ============================================================
   NAVEGACIÓN
============================================================ */
const shiftWeek = (days: number) => {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() + days);
  currentDate.value = date;
};

const previousWeek = () => shiftWeek(-7);
const nextWeek = () => shiftWeek(7);

const goToday = () => {
  currentDate.value = new Date();
  const jsDay = new Date().getDay();
  activeDay.value = jsDay === 0 ? 6 : jsDay - 1;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  if (pendingDelete.value) pendingDelete.value = null;
  else if (showForm.value) closeForm();
};

let clockTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  syncLanguage();
  goToday();
  window.addEventListener('idioma-changed', handleLanguageChange);
  window.addEventListener('factorfit:branch-changed', cambiarSede);
  window.addEventListener('keydown', handleKeydown);
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 60000);
  void cargarActividades();
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLanguageChange);
  window.removeEventListener('factorfit:branch-changed', cambiarSede);
  window.removeEventListener('keydown', handleKeydown);
  if (clockTimer) clearInterval(clockTimer);
  if (toastTimer) clearTimeout(toastTimer);
  ultimaConsulta++;
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

.schedule-wrapper,
.schedule-wrapper *,
.schedule-wrapper *::before,
.schedule-wrapper *::after { box-sizing: border-box; }

button { font: inherit; }

.schedule-wrapper {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: rgba(59, 130, 246, .12);
  --hl-line: rgba(59, 130, 246, .42);
  --text: var(--color-texto-general, #f5f5f4);
  --card: var(--bg-cards, #101010);
  --title: var(--color-titulos, #fff);
  --card-glass: rgba(16, 16, 16, .92);
  --icon-glass: rgba(10, 10, 10, .85);
  --w3: rgba(255, 255, 255, .03);
  --w4: rgba(255, 255, 255, .04);
  --w5: rgba(255, 255, 255, .05);
  --w6: rgba(255, 255, 255, .06);
  --w8: rgba(255, 255, 255, .08);
  --w14: rgba(255, 255, 255, .14);
  --w25: rgba(255, 255, 255, .25);
  --w35: rgba(255, 255, 255, .35);
  --w65: rgba(255, 255, 255, .65);
  --w85: rgba(255, 255, 255, .85);
  --line: var(--w8);
  --line-soft: var(--w6);
  --line-strong: var(--w14);
  --text-2: rgba(245, 245, 244, .66);
  --text-3: rgba(245, 245, 244, .44);
  --row: 76px;
  --header-h: 86px;

  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

@supports (background: color-mix(in srgb, red 10%, transparent)) {
  .schedule-wrapper {
    --hl-soft: color-mix(in srgb, var(--hl) 13%, transparent);
    --hl-line: color-mix(in srgb, var(--hl) 45%, transparent);
    --card-glass: color-mix(in srgb, var(--card) 90%, transparent);
    --icon-glass: color-mix(in srgb, var(--card) 88%, transparent);
    --text-2: color-mix(in srgb, var(--text) 68%, transparent);
    --text-3: color-mix(in srgb, var(--text) 46%, transparent);
    --w3: color-mix(in srgb, var(--text) 3%, transparent);
    --w4: color-mix(in srgb, var(--text) 4%, transparent);
    --w5: color-mix(in srgb, var(--text) 5%, transparent);
    --w6: color-mix(in srgb, var(--text) 6%, transparent);
    --w8: color-mix(in srgb, var(--text) 8%, transparent);
    --w14: color-mix(in srgb, var(--text) 14%, transparent);
    --w25: color-mix(in srgb, var(--text) 25%, transparent);
    --w35: color-mix(in srgb, var(--text) 35%, transparent);
    --w65: color-mix(in srgb, var(--text) 65%, transparent);
    --w85: color-mix(in srgb, var(--text) 85%, transparent);
  }
}

/* ============ PANEL ============ */
.schedule-panel {
  width: min(1320px, 97vw);
  max-height: 92vh;
  overflow: auto;
  background:
    radial-gradient(900px 260px at 0% 0%, var(--hl-soft), transparent 70%),
    var(--card);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 40px 110px rgba(0, 0, 0, .65), inset 0 1px 0 var(--w6);
  scrollbar-width: thin;
  scrollbar-color: var(--w14) transparent;
}

/* ============ HEADER ============ */
.schedule-header {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--header-h);
  padding: 0 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-glass);
  border-bottom: 1px solid var(--line-soft);
  backdrop-filter: blur(20px) saturate(140%);
}

.header-info { display: flex; align-items: center; gap: 15px; }

.header-icon {
  width: 50px;
  height: 50px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: linear-gradient(145deg, var(--hl-soft), transparent);
  border: 1px solid var(--hl-line);
  border-radius: 15px;
  box-shadow: 0 8px 24px var(--hl-soft);
}
.header-icon svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.header-eyebrow { display: block; margin-bottom: 3px; color: var(--hl); font-size: 10.5px; font-weight: 800; letter-spacing: 1.5px; }
.header-info h2 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 25px; font-weight: 600; line-height: 1.1; text-transform: uppercase; letter-spacing: .3px; }
.header-info h2 span { color: var(--hl); }
.header-info p { margin: 4px 0 0; color: var(--text-3); font-size: 12.5px; }

.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--w65);
  background: var(--w4);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: .2s;
}
.close-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.close-btn:hover { color: #f87171; background: rgba(239, 68, 68, .09); border-color: rgba(239, 68, 68, .3); transform: rotate(90deg); }

.loading-bar { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; overflow: hidden; background: var(--w6); }
.loading-bar i { display: block; width: 35%; height: 100%; background: linear-gradient(90deg, transparent, var(--hl), transparent); animation: loading 1.1s ease-in-out infinite; }
@keyframes loading { from { transform: translateX(-100%); } to { transform: translateX(300%); } }

/* ============ TOOLBAR ============ */
.calendar-toolbar {
  padding: 20px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.week-navigation, .toolbar-right, .legend { display: flex; align-items: center; }
.week-navigation { gap: 7px; }

.nav-btn, .today-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-2);
  background: var(--w4);
  border: 1px solid var(--line);
  border-radius: 11px;
  transition: .2s;
}
.nav-btn { width: 40px; }
.nav-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.today-btn { padding: 0 16px; font-size: 13px; font-weight: 650; }
.nav-btn:hover, .today-btn:hover { color: var(--title); border-color: var(--hl-line); background: var(--hl-soft); }

.week-info { margin-left: 12px; display: flex; flex-direction: column; gap: 2px; }
.week-info strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; }
.week-info span { color: var(--text-3); font-size: 12px; }

.toolbar-right { gap: 18px; }
.legend { gap: 14px; }
.legend span { display: flex; align-items: center; gap: 7px; color: var(--text-3); font-size: 12px; font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.scheduled { background: var(--hl); box-shadow: 0 0 8px var(--hl); }
.dot.available { border: 1.5px dashed var(--w35); }

.new-activity-btn {
  height: 42px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-texto-botones, #fff);
  background: linear-gradient(135deg, var(--color-botones, #1c4fd6), color-mix(in srgb, var(--color-botones, #1c4fd6) 75%, #000));
  border: 0;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(28, 79, 214, .3), inset 0 1px 0 rgba(255, 255, 255, .18);
  transition: .2s;
}
.new-activity-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; }
.new-activity-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }

/* ============ ERROR ============ */
.error-banner {
  margin: 0 26px 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fca5a5;
  background: rgba(239, 68, 68, .08);
  border: 1px solid rgba(239, 68, 68, .28);
  border-radius: 12px;
  font-size: 13px;
}
.error-banner svg { width: 18px; height: 18px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; }
.error-banner span { flex: 1; min-width: 0; }
.error-banner button { padding: 6px 12px; cursor: pointer; color: #fff; background: rgba(239, 68, 68, .5); border: 0; border-radius: 8px; font-size: 12px; font-weight: 700; }
.error-banner button:hover { background: rgba(239, 68, 68, .75); }

/* ============ RESUMEN ============ */
.summary-grid { padding: 0 26px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.summary-card {
  min-height: 74px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 13px;
  background: linear-gradient(160deg, var(--w5), var(--w3));
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  transition: transform .2s, border-color .2s;
}
.summary-card:hover { transform: translateY(-2px); border-color: var(--line-strong); }
.summary-icon { width: 42px; height: 42px; flex: none; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
.summary-icon svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.summary-icon.blue { color: #60a5fa; background: rgba(59, 130, 246, .12); }
.summary-icon.green { color: #34d399; background: rgba(16, 185, 129, .12); }
.summary-icon.purple { color: #c084fc; background: rgba(168, 85, 247, .12); }
.summary-icon.orange { color: #fb923c; background: rgba(249, 115, 22, .12); }
.summary-card > div:last-child { display: flex; flex-direction: column; }
.summary-card strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 600; line-height: 1; }
.summary-card span { margin-top: 5px; color: var(--text-3); font-size: 10.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }

/* ============ CALENDARIO (DESKTOP) ============ */
.desktop-calendar {
  margin: 0 26px 22px;
  overflow: hidden;
  overflow: clip; /* permite que la cabecera de días quede fija al hacer scroll */
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--w3);
}
.calendar-scroll { min-width: 0; }

.calendar-days-header,
.hour-row { display: grid; grid-template-columns: 78px repeat(7, minmax(0, 1fr)); }

.calendar-days-header {
  position: sticky;
  top: var(--header-h);
  z-index: 25;
  background: var(--card-glass);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px) saturate(140%);
}

.time-header { display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--line-soft); }
.time-header span { color: var(--text-3); font-size: 10px; font-weight: 800; letter-spacing: .9px; }

.day-header {
  position: relative;
  min-height: 92px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--line-soft);
}
.day-header:last-child { border-right: 0; }
.day-header.today { background: linear-gradient(180deg, var(--hl-soft), transparent); }
.day-header.today::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--hl); box-shadow: 0 0 12px var(--hl); }
.day-name { color: var(--text-3); font-size: 11px; font-weight: 800; letter-spacing: .9px; }
.day-header.today .day-name { color: var(--hl); }
.day-header strong { margin: 3px 0 1px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 28px; font-weight: 600; line-height: 1; }
.day-header small { color: var(--text-3); font-size: 10.5px; font-weight: 600; }
.today-indicator { position: absolute; top: 8px; right: 8px; padding: 2px 7px; color: var(--hl); background: var(--hl-soft); border-radius: 6px; font-size: 9px; font-weight: 800; letter-spacing: .5px; }
.day-count { margin-top: 6px; color: var(--text-3); font-size: 10.5px; }

/* Filas por hora: crecen según el contenido */
.hour-row { border-bottom: 1px solid var(--line-soft); }
.hour-row:last-child { border-bottom: 0; }

.time-cell {
  padding: 12px 10px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  background: rgba(0, 0, 0, .14);
  border-right: 1px solid var(--line-soft);
}
.time-cell span { color: var(--text-3); font-family: 'Oswald', sans-serif; font-size: 11.5px; font-weight: 500; white-space: nowrap; }
.hour-row.current .time-cell { background: var(--hl-soft); }
.hour-row.current .time-cell span { color: var(--hl); font-weight: 700; }

.calendar-slot {
  position: relative;
  min-width: 0;
  min-height: var(--row);
  padding: 5px;
  display: flex;
  border-right: 1px solid var(--line-soft);
  transition: background .15s;
}
.calendar-slot:last-child { border-right: 0; }
.calendar-slot.today { background: var(--w3); }
.hour-row.current .calendar-slot.today { background: var(--hl-soft); }
.calendar-slot:not(.occupied):hover { background: var(--hl-soft); }

.empty-slot {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  opacity: 0;
  cursor: pointer;
  color: var(--hl);
  background: transparent;
  border: 1px dashed var(--hl-line);
  border-radius: 11px;
  transition: opacity .18s;
}
.empty-slot svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
.empty-slot span { font-size: 11.5px; font-weight: 700; }
.calendar-slot:hover .empty-slot, .empty-slot:focus-visible { opacity: 1; }

/* ============ EVENTOS ============ */
.activity-event {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 9px 10px 13px 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  outline: none;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--event-color) 18%, transparent), transparent 70%),
    color-mix(in srgb, var(--event-color) 8%, var(--card));
  border: 1px solid color-mix(in srgb, var(--event-color) 34%, transparent);
  border-radius: 12px;
  transition: transform .18s, border-color .18s, box-shadow .18s;
}
.activity-event:hover, .activity-event:focus-visible {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--event-color) 75%, transparent);
  box-shadow: 0 12px 26px rgba(0, 0, 0, .38), 0 0 0 1px color-mix(in srgb, var(--event-color) 25%, transparent);
}
.event-accent { position: absolute; top: 0; bottom: 0; left: 0; width: 4px; background: var(--event-color); box-shadow: 0 0 12px var(--event-color); }
.activity-event > * { flex-shrink: 0; }

.event-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.event-time { color: var(--event-color); font-size: 11px; font-weight: 800; white-space: nowrap; }
.event-capacity { display: flex; align-items: center; gap: 4px; padding: 1px 6px; color: var(--text-2); background: var(--w6); border-radius: 20px; font-size: 10.5px; font-weight: 650; }
.event-capacity svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; }

.activity-event > strong {
  display: block;
  margin: 4px 0 3px;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-tag {
  align-self: flex-start;
  max-width: 100%;
  margin-bottom: 4px;
  padding: 1px 7px;
  overflow: hidden;
  color: var(--event-color);
  background: color-mix(in srgb, var(--event-color) 14%, transparent);
  border-radius: 20px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .5px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.event-detail { margin-top: 2px; display: flex; align-items: center; gap: 5px; min-width: 0; color: var(--text-2); }
.event-detail svg { width: 11px; height: 11px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.event-detail span { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }

.event-progress { position: absolute; right: 0; bottom: 0; left: 4px; height: 3px; background: var(--w6); }
.event-progress i { display: block; height: 100%; background: var(--event-color); border-radius: 0 3px 3px 0; transition: width .4s ease; }

/* Acciones: editar / eliminar */
.event-actions { position: absolute; top: 6px; right: 6px; display: flex; gap: 4px; opacity: 0; transform: translateY(-2px); transition: opacity .15s, transform .15s; }
.activity-event:hover .event-actions,
.activity-event:focus-within .event-actions { opacity: 1; transform: none; }

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  color: var(--w85);
  background: var(--icon-glass);
  border: 1px solid var(--w14);
  border-radius: 8px;
  backdrop-filter: blur(6px);
  transition: .18s;
}
.icon-btn svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.icon-btn:hover { color: #fff; background: var(--hl); border-color: var(--hl); }
.icon-btn.danger:hover { background: #dc2626; border-color: #dc2626; }

/* ============ MEDIA ============ */
.event-media { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; margin: 7px 0 2px; }
.event-media a { color: var(--hl); font-size: 11px; text-decoration: none; }
.event-media img { width: 32px; height: 32px; display: block; object-fit: cover; border: 1px solid var(--w14); border-radius: 7px; transition: transform .15s; }
.event-media img:hover { transform: scale(1.12); }
.video-link { padding: 4px 9px; background: var(--hl-soft); border: 1px solid var(--hl-line); border-radius: 20px; font-weight: 700; }
.image-unavailable { display: block; max-width: 90px; color: #fca5a5; font-size: 9px; overflow-wrap: anywhere; }

/* ============ MOBILE (oculto en desktop) ============ */
.mobile-calendar { display: none; }

/* ============ FOOTER ============ */
.calendar-footer { min-height: 62px; padding: 12px 26px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border-top: 1px solid var(--line-soft); }
.calendar-footer > div { display: flex; align-items: center; gap: 9px; }
.footer-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hl); box-shadow: 0 0 8px var(--hl); }
.calendar-footer p { margin: 0; color: var(--text-3); font-size: 12.5px; }
.calendar-footer button { padding: 9px 16px; cursor: pointer; color: var(--text-2); background: transparent; border: 1px solid var(--line); border-radius: 10px; font-size: 12.5px; font-weight: 650; transition: .2s; }
.calendar-footer button:hover { color: var(--title); background: var(--w4); }

/* ============ OVERLAYS ============ */
.form-overlay, .confirm-overlay { position: fixed; inset: 0; padding: 18px; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, .62); backdrop-filter: blur(5px); }
.form-overlay { z-index: 150; }
.confirm-overlay { z-index: 200; }

.confirm-box { width: min(420px, 100%); padding: 28px 26px 24px; text-align: center; background: var(--card); border: 1px solid var(--line-strong); border-radius: 22px; box-shadow: 0 30px 80px rgba(0, 0, 0, .6); }
.confirm-icon { width: 56px; height: 56px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: #f87171; background: rgba(239, 68, 68, .1); border: 1px solid rgba(239, 68, 68, .3); border-radius: 16px; }
.confirm-icon svg { width: 25px; height: 25px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.confirm-box h3 { margin: 0 0 8px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 21px; font-weight: 600; }
.confirm-box p { margin: 0 0 22px; color: var(--text-2); font-size: 13.5px; line-height: 1.55; }
.confirm-box p strong { color: var(--title); font-weight: 650; }
.confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.confirm-actions button { height: 46px; cursor: pointer; border-radius: 12px; font-size: 14px; font-weight: 700; transition: .2s; }
.confirm-actions button:disabled { opacity: .55; cursor: not-allowed; }
.btn-ghost { color: var(--text-2); background: transparent; border: 1px solid var(--line); }
.btn-ghost:hover:not(:disabled) { color: var(--title); background: var(--w5); }
.btn-danger { color: #fff; background: #dc2626; border: 0; box-shadow: 0 8px 20px rgba(220, 38, 38, .28); }
.btn-danger:hover:not(:disabled) { background: #ef4444; }

/* ============ TOAST ============ */
.toast { position: fixed; z-index: 300; left: 50%; bottom: 24px; max-width: min(440px, 92vw); padding: 12px 18px 12px 14px; display: flex; align-items: center; gap: 11px; color: var(--title); transform: translateX(-50%); background: var(--card); border: 1px solid var(--line-strong); border-radius: 14px; box-shadow: 0 20px 50px rgba(0, 0, 0, .55); }
.toast-icon { width: 30px; height: 30px; flex: none; display: flex; align-items: center; justify-content: center; color: #34d399; background: rgba(16, 185, 129, .13); border-radius: 9px; }
.toast.error .toast-icon { color: #f87171; background: rgba(239, 68, 68, .13); }
.toast-icon svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.toast span { font-size: 13px; line-height: 1.4; }
.toast-enter-active, .toast-leave-active { transition: opacity .22s, transform .22s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
.toast.toast-enter-from, .toast.toast-leave-to { transform: translate(-50%, 10px); }

/* ============ ACCESIBILIDAD ============ */
.close-btn:focus-visible, .nav-btn:focus-visible, .today-btn:focus-visible, .new-activity-btn:focus-visible,
.icon-btn:focus-visible, .mobile-day:focus-visible, .mobile-empty:focus-visible, .calendar-footer button:focus-visible,
.confirm-actions button:focus-visible, .empty-slot:focus-visible, .activity-event:focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .schedule-wrapper *, .schedule-wrapper *::before, .schedule-wrapper *::after { transition: none !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1100px) {
  .legend { display: none; }
}

/* Entre tablet y laptop pequeña: scroll horizontal (la cabecera deja de ser fija) */
@media (max-width: 1050px) {
  .desktop-calendar { overflow-x: auto; }
  .calendar-scroll { min-width: 980px; }
  .calendar-days-header { position: static; }
}

@media (max-width: 767px) {
  .schedule-wrapper { --header-h: 74px; }
  .schedule-panel { width: 96vw; max-height: 94vh; border-radius: 20px; }
  .schedule-header { padding: 0 16px; }
  .header-icon { width: 42px; height: 42px; }
  .header-info h2 { font-size: 20px; }
  .header-info p { display: none; }
  .calendar-toolbar { padding: 14px 16px; flex-wrap: nowrap; align-items: center; }
  .week-info { max-width: 150px; }
  .week-info strong { font-size: 16px; }
  .new-activity-btn { width: 42px; padding: 0; justify-content: center; }
  .new-activity-btn span { display: none; }
  .new-activity-btn svg { width: 18px; height: 18px; }
  .error-banner { margin: 0 16px 14px; }
  .summary-grid { padding: 0 16px 14px; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .summary-card { min-height: 64px; padding: 10px 12px; }
  .summary-card strong { font-size: 22px; }

  .desktop-calendar { display: none; }
  .mobile-calendar { display: block; padding: 0 16px 20px; }

  .mobile-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; padding: 6px 0 16px; }
  .mobile-day {
    position: relative;
    min-width: 0;
    height: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    color: var(--text-3);
    background: var(--w3);
    border: 1px solid var(--line-soft);
    border-radius: 13px;
    transition: .2s;
  }
  .mobile-day span { font-size: 10px; font-weight: 800; letter-spacing: .3px; }
  .mobile-day strong { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; }
  .mobile-day i { position: absolute; bottom: 6px; width: 4px; height: 4px; border-radius: 50%; background: var(--hl); }
  .mobile-day.active { color: var(--title); background: var(--hl-soft); border-color: var(--hl-line); }
  .mobile-day.active i { background: #fff; }
  .mobile-day.today strong { color: var(--hl); }

  .mobile-day-header { padding: 12px 0 14px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--line-soft); }
  .mobile-day-header span { color: var(--hl); font-size: 10.5px; font-weight: 800; letter-spacing: 1px; }
  .mobile-day-header h3 { margin: 3px 0 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 19px; font-weight: 600; text-transform: capitalize; }
  .mobile-day-header > strong { flex: none; color: var(--text-3); font-size: 12px; font-weight: 600; }

  .mobile-timeline { padding-top: 14px; }
  .mobile-time-row { min-height: 66px; display: grid; grid-template-columns: 62px 14px minmax(0, 1fr); gap: 6px; }
  .mobile-time { padding-top: 6px; color: var(--text-3); font-family: 'Oswald', sans-serif; font-size: 11.5px; text-align: right; }
  .mobile-line { position: relative; display: flex; justify-content: center; }
  .mobile-line::after { content: ""; position: absolute; top: 14px; bottom: -6px; width: 1px; background: var(--line); }
  .mobile-line span { position: relative; z-index: 1; width: 8px; height: 8px; margin-top: 10px; border: 1.5px solid var(--w25); border-radius: 50%; background: var(--card); }
  .mobile-content { min-width: 0; }

  .mobile-event {
    position: relative;
    margin-bottom: 10px;
    padding: 13px 14px 15px;
    overflow: hidden;
    cursor: pointer;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--event-color) 16%, transparent), transparent 70%),
      color-mix(in srgb, var(--event-color) 8%, var(--card));
    border: 1px solid color-mix(in srgb, var(--event-color) 30%, transparent);
    border-left: 4px solid var(--event-color);
    border-radius: 14px;
  }
  .mobile-event-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .mobile-event-top > div:first-child { min-width: 0; display: flex; flex-direction: column; }
  .mobile-event-top span { color: var(--event-color); font-size: 10.5px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; }
  .mobile-event-top strong { margin-top: 3px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; line-height: 1.2; }
  .mobile-actions { flex: none; display: flex; gap: 6px; }
  .mobile-actions .icon-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--w6); }
  .mobile-actions .icon-btn svg { width: 16px; height: 16px; }

  .mobile-event-details { margin-top: 11px; display: flex; flex-direction: column; gap: 6px; }
  .mobile-event-details span { display: flex; align-items: center; gap: 8px; color: var(--text-2); font-size: 13px; }
  .mobile-event-details svg { width: 14px; height: 14px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .mobile-event .event-media img { width: 44px; height: 44px; }

  .mobile-event-footer { margin-top: 12px; padding-top: 10px; display: flex; justify-content: space-between; border-top: 1px solid var(--line-soft); }
  .mobile-event-footer span { color: var(--text-3); font-size: 11.5px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; }
  .event-progress.static { left: 0; }

  .mobile-empty { width: 100%; min-height: 52px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; color: var(--text-3); background: transparent; border: 1px dashed var(--line); border-radius: 13px; font-size: 13px; font-weight: 600; transition: .2s; }
  .mobile-empty svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  .mobile-empty:hover { color: var(--hl); border-color: var(--hl-line); background: var(--hl-soft); }

  .calendar-footer { padding: 12px 16px; justify-content: center; }
  .calendar-footer > div { display: none; }
  .calendar-footer button { width: 100%; padding: 12px; font-size: 14px; }
  .toast { bottom: 16px; }
}

@media (max-width: 430px) {
  .mobile-days { gap: 3px; }
  .mobile-day { height: 58px; border-radius: 10px; }
  .mobile-day strong { font-size: 16px; }
  .mobile-time-row { grid-template-columns: 56px 12px minmax(0, 1fr); }
  .summary-icon { width: 36px; height: 36px; }
}
.event-price { display: inline-block; margin: 3px 0 5px; color: var(--color-highlight, #f59e0b); font-size: 12px; font-weight: 800; }
.mobile-event-price { margin-top: 8px; color: var(--color-highlight, #f59e0b); font-weight: 800; font-size: 14px; }
</style>