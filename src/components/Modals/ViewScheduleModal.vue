<template>
  <div class="schedule-wrapper">
    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]" role="status">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
          <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 17h.01"/></svg>
        </div>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
    <!-- CONFIRMAR ELIMINACIÓN -->
    <transition name="toast">
      <div v-if="pendingDelete" class="confirm-overlay" @click.self="pendingDelete = null">
        <div class="confirm-box" role="alertdialog" aria-modal="true">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>
          </div>
          <h3>{{ t('deleteTitle') }}</h3>
          <p>
            {{ t('deletePrefix') }} <strong>{{ pendingDelete.nombre }}</strong> {{ t('deleteFromSchedule') }}
            ({{ dayLabel(pendingDelete.dia) }}, {{ formatHour(pendingDelete.inicio) }}). {{ t('deleteWarning') }}
          </p>
          <div class="confirm-actions">
            <button type="button" class="btn-ghost" @click="pendingDelete = null">{{ t('cancel') }}</button>
            <button type="button" class="btn-danger" @click="confirmDelete">{{ t('yesDelete') }}</button>
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
              <path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/>
              <path d="M8 13h3v3H8z"/>
            </svg>
          </div>
          <div>
            <span class="header-eyebrow">{{ t('gymSchedule') }}</span>
            <h2>{{ t('scheduleTitle') }} <span>{{ t('weekly') }}</span></h2>
            <p>{{ t('headerDescription') }}</p>
          </div>
        </div>
        <button class="close-btn" type="button" :aria-label="t('close')" @click="$emit('close')">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </header>
      <!-- ================= TOOLBAR ================= -->
      <div class="calendar-toolbar">
        <div class="week-navigation">
          <button type="button" class="nav-btn" :aria-label="t('previousWeek')" @click="previousWeek">
            <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button type="button" class="today-btn" @click="goToday">{{ t('today') }}</button>
          <button type="button" class="nav-btn" :aria-label="t('nextWeek')" @click="nextWeek">
            <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
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
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            <span>{{ t('newActivity') }}</span>
          </button>
        </div>
      </div>
      <p v-if="errorApi" role="alert" style="color:#f87171;padding:12px">{{ errorApi }} <button type="button" @click="cargarActividades">Reintentar</button></p>
      <!-- ================= RESUMEN ================= -->
      <div class="summary-grid">
        <article class="summary-card">
          <div class="summary-icon blue">
            <svg viewBox="0 0 24 24"><path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/></svg>
          </div>
          <div>
            <strong>{{ activities.length }}</strong>
            <span>{{ t('activities') }}</span>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon green">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 11a4 4 0 0 1 5 4v6"/></svg>
          </div>
          <div>
            <strong>{{ totalCapacity }}</strong>
            <span>{{ t('totalCapacity') }}</span>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon purple">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
          </div>
          <div>
            <strong>{{ instructorsCount }}</strong>
            <span>{{ t('instructors') }}</span>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon orange">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
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
          <!-- CABECERA DÍAS -->
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
          <!-- CUERPO -->
          <div class="calendar-body">
            <div class="time-column">
              <div v-for="hour in hours" :key="hour" class="time-row">
                <span>{{ formatHour(hour) }}</span>
              </div>
            </div>
            <div
              v-for="day in weekDays"
              :key="day.key"
              class="day-column"
              :class="{ today: day.isToday }"
            >
              <div
                v-for="hour in hours"
                :key="`${day.key}-${hour}`"
                class="calendar-slot"
                :class="{ occupied: !!getActivity(day.key, hour) }"
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
                        <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 21a6 6 0 0 1 12 0M17 11a4 4 0 0 1 4 4v6"/></svg>
                        {{ ev.inscritos || 0 }}/{{ ev.capacidad }}
                      </span>
                    </div>
                    <strong>{{ ev.nombre }}</strong>
                    <div class="event-detail">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>
                      <span>{{ ev.instructor }}</span>
                    </div>
                    <div class="event-detail">
                      <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>
                      <span>{{ ev.ubicacion }}</span>
                    </div>
                    <div class="event-progress"><i :style="{ width: fillPercent(ev) + '%' }"></i></div>
                    <!-- ACCIONES -->
                    <div v-if="(ev.imagenes||[]).length || ev.video_url" class="event-media" @click.stop><a v-for="(url,i) in (ev.imagenes||[])" :key="url" :href="url" target="_blank" rel="noopener"><img :src="url" :alt="`Imagen ${i+1}`" loading="lazy" @error="mediaError" /></a><a v-if="ev.video_url" :href="ev.video_url" target="_blank" rel="noopener">{{ idioma === 'en' ? 'Video' : 'Video' }}</a></div>
                    <div v-if="!locked(ev)" class="event-actions">
                      <button type="button" class="icon-btn" :title="t('edit')" :aria-label="t('editActivity')" @click.stop="editActivity(ev)">
                        <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4"/></svg>
                      </button>
                      <button type="button" class="icon-btn danger" :title="t('delete')" :aria-label="t('deleteActivity')" @click.stop="askDelete(ev)">
                        <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
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
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
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
                      <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4"/></svg>
                    </button>
                    <button type="button" class="icon-btn danger" :aria-label="t('deleteActivity')" @click.stop="askDelete(ev)">
                      <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                    </button>
                  </div>
                </div>
                <div class="mobile-event-details">
                  <span>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    {{ formatHour(ev.inicio) }} – {{ formatHour(ev.fin) }}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>
                    {{ ev.instructor }}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>
                    {{ ev.ubicacion }}
                  </span>
                </div>
                <div v-if="(ev.imagenes||[]).length || ev.video_url" class="event-media" @click.stop><a v-for="(url,i) in (ev.imagenes||[])" :key="url" :href="url" target="_blank" rel="noopener"><img :src="url" :alt="`Imagen ${i+1}`" loading="lazy" @error="mediaError" /></a><a v-if="ev.video_url" :href="ev.video_url" target="_blank" rel="noopener">Video</a></div>
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
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              {{ t('availableSchedule') }}
            </button>
          </div>
        </div>
      </div>
      <!-- ================= FOOTER ================= -->
      <footer class="calendar-footer">
        <div>
          <span class="footer-dot"></span>
          <p>{{ t('footerHint') }}</p>
        </div>
        <button type="button" @click="$emit('close')">{{ t('closeSchedule') }}</button>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import AddScheduleModal from './AddScheduleModal.vue';
import { categoryColor, categoryLabel } from './scheduleCategories.ts';
interface Activity {
  id: number;
  dia: string;
  fecha?: string;imagenes?:string[];video_url?:string;
  nombre: string;
  categoria: string;
  nivel: string;
  instructor: string;
  capacidad: number;
  inscritos?: number;
  inicio: string;
  fin: string;
  ubicacion: string;
  descripcion?: string;
  color?: string;
}
const emit = defineEmits(['close', 'activity-click', 'save-activity', 'delete-activity']);
const activeDay = ref(0);
const showForm = ref(false);
const formData = ref<Record<string, any> | null>(null);
const idioma = ref(localStorage.getItem('owner-idioma') || 'es');
const cargando=ref(false);const guardando=ref(false);const errorApi=ref('');
const translations = {
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
    closeSchedule: 'Cerrar agenda',
    conflictPrefix: 'Ya existe el evento', conflictOn: 'el', conflictAt: 'a las', conflictChoose: 'Elige otra hora.',
    updated: 'se actualizó.', added: 'se agregó a la agenda.', removed: 'fue eliminada de la agenda.',
    levelBeginner: 'Principiante', levelIntermediate: 'Intermedio', levelAdvanced: 'Avanzado',
    levelAll: 'Todos'
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
    closeSchedule: 'Close schedule',
    conflictPrefix: 'There is already the event', conflictOn: 'on', conflictAt: 'at', conflictChoose: 'Choose another time.',
    updated: 'was updated.', added: 'was added to the schedule.', removed: 'was removed from the schedule.',
    levelBeginner: 'Beginner', levelIntermediate: 'Intermediate', levelAdvanced: 'Advanced',
    levelAll: 'All levels'
  }
};
const t = (key: string) => translations[idioma.value as 'es' | 'en']?.[key as keyof typeof translations.es] || translations.es[key as keyof typeof translations.es] || key;
const normalizeLanguage = (value: unknown): 'es' | 'en' =>
  String(value || '').toLowerCase().startsWith('en') ? 'en' : 'es';
const syncLanguage = () => {
  idioma.value = normalizeLanguage(localStorage.getItem('owner-idioma') || 'es');
};
const handleLanguageChange = (event: Event) => {
  const customEvent = event as CustomEvent<{ idioma?: string }>;
  const nextLanguage = normalizeLanguage(customEvent.detail?.idioma || localStorage.getItem('owner-idioma') || 'es');
  idioma.value = nextLanguage;
  localStorage.setItem('owner-idioma', nextLanguage);
};
const currentDate = ref(new Date());
const pendingDelete = ref<Activity | null>(null);
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
});
/*
  EJEMPLOS VISUALES.
  Después puedes reemplazar este arreglo con tus actividades
  provenientes del backend.
*/
const activities = ref<Activity[]>([]);
const API=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');
const sedeActual=()=>{for(const st of [sessionStorage,localStorage])for(const key of ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id']){const raw=st.getItem(key);if(!raw)continue;try{const obj=JSON.parse(raw);const n=Number(typeof obj==='object'&&obj?(obj.ID_Sede??obj.sede_id??obj.id??obj.value):obj);if(Number.isInteger(n)&&n>0)return n;}catch{const n=Number(raw);if(Number.isInteger(n)&&n>0)return n;}}return 1;};
const tokenActual=()=>{for(const st of [sessionStorage,localStorage]){for(const key of ['auth_token','token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']){const v=st.getItem(key);if(v)return v.replace(/^Bearer\s+/i,'');}for(const key of ['auth','user','session','gymAccount','gym_account'])try{const o=JSON.parse(st.getItem(key)||'null');const v=o?.token||o?.access_token||o?.accessToken;if(v)return String(v).replace(/^Bearer\s+/i,'');}catch{}}return '';};
const consultar=async(path:string,init:RequestInit={})=>{const token=tokenActual();if(!token)throw new Error('No hay sesión activa.');let r:Response;try{r=await fetch(`${API}/api/gym/agenda${path}`,{...init,headers:{Accept:'application/json',Authorization:`Bearer ${token}`,...(init.body?{'Content-Type':'application/json'}:{}),...(init.headers||{})}});}catch{throw new Error('No se pudo conectar con el servidor.');}const d=await r.json().catch(()=>null);if(!r.ok){const detail=d?.errors?Object.values(d.errors).flat().join(' '):'';throw new Error(detail||((d?.message&&d.message!=='Server Error')?d.message:`Error HTTP ${r.status}. Revisa los logs de Railway.`));}return d;};
let ultimaConsulta=0;
const cargarActividades=async()=>{const seq=++ultimaConsulta;cargando.value=true;errorApi.value='';try{const d=await consultar(`?sede_id=${sedeActual()}`);if(seq!==ultimaConsulta)return;activities.value=(d.actividades||[]).map((a:any)=>({...a,id:Number(a.id),capacidad:Number(a.capacidad),inscritos:Number(a.inscritos||0)}));}catch(e:any){if(seq===ultimaConsulta){activities.value=[];errorApi.value=e.message;}}finally{if(seq===ultimaConsulta)cargando.value=false;}};
const cambiarSede=()=>{closeForm();pendingDelete.value=null;void cargarActividades();};
const hours = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];
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
const predefinedCategories=new Set(['yoga','spinning','crossfit','boxing','pilates','zumba']);
const customCategories=computed(()=>Array.from(new Set(activities.value.map(a=>a.categoria).filter(k=>k&&!predefinedCategories.has(k)))));
const levelLabel = (level: string) => {
  const map: Record<string, string> = {
    Principiante: t('levelBeginner'),
    Intermedio: t('levelIntermediate'),
    Avanzado: t('levelAdvanced'),
    Todos: t('levelAll')
  };
  return map[level] || level;
};
const colorOf = (activity: Activity) => categoryColor(activity.categoria) || activity.color || 'var(--color-highlight, #3b82f6)';
const getMonday = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
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
    return {
      ...day,
      short: idioma.value === 'en' ? day.shortEn : day.shortEs,
      number: date.getDate(),
      month: date.toLocaleDateString(idioma.value === 'en' ? 'en-US' : 'es-MX', { month: 'short' }).replace('.', '').toUpperCase(),
      full: idioma.value === 'en'
        ? `${day.en}, ${date.toLocaleDateString('en-US', { month: 'long' })} ${date.getDate()}`
        : `${day.es}, ${date.getDate()} de ${date.toLocaleDateString('es-MX', { month: 'long' })}`,
      date,
      isToday
    };
  });
});
const activeKey = computed(() => weekDays.value[activeDay.value]?.key || '');
const weekTitle = computed(() => {
  const first = weekDays.value[0]?.date;
  if (!first) return '';
  const month = first.toLocaleDateString(idioma.value === 'en' ? 'en-US' : 'es-MX', { month: 'long' });
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
const instructorsCount = computed(() =>
  new Set(activities.value.map(item => item.instructor)).size
);
const totalHours = computed(() => {
  const value = activities.value.reduce((total, activity) => {
    const [startHour = 0, startMinute = 0] = activity.inicio.split(':').map(Number);
    const [endHour = 0, endMinute = 0] = activity.fin.split(':').map(Number);
    return total + ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
  }, 0);
  return Math.round(value * 10) / 10;
});
const isoDate=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dateForDay=(day:string)=>weekDays.value.find(d=>d.key===day)?.date;
const showsOnDay=(a:Activity,day:string)=>a.dia===day&&(!a.fecha||a.fecha===isoDate(dateForDay(day)!));
const locked=(a:Activity)=>Boolean(a.fecha&&a.fecha<isoDate(new Date()));
const activitiesForDay = (day: string) =>
  activities.value.filter(activity => showsOnDay(activity,day));
const sameHour = (a: string, b: string) => a.slice(0, 2) === b.slice(0, 2);
const getActivity = (day: string, hour: string) =>
  activities.value.find(activity => showsOnDay(activity,day) && sameHour(activity.inicio, hour));
/* Devuelve un arreglo (0 o 1 elemento) para poder usar la actividad con v-for en la plantilla */
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
const formatHour = (time: string) => {
  if (!time) return '';
  const [hoursValue, minutes] = time.split(':');
  const hour = Number(hoursValue);
  const date = new Date();
  date.setHours(hour, Number(minutes), 0, 0);
  return date.toLocaleTimeString(idioma.value === 'en' ? 'en-US' : 'es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
const showToast = (message: string, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 2400);
};
const addOneHour = (hour: string) => {
  const [h = 0, m = 0] = hour.split(':').map(Number);
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
const openForm = (data: Record<string, any> | null = null) => {
  formData.value = data;
  showForm.value = true;
};
const closeForm = () => {
  showForm.value = false;
  formData.value = null;
};
/* Clic en un espacio libre del calendario */
const selectSlot = (day: string, hour: string) => {
  const date=dateForDay(day);if(!date||isoDate(date)<isoDate(new Date())){showToast(idioma.value==='en'?'You cannot schedule in the past.':'No se permiten eventos en fechas pasadas.','error');return;}openForm({ day: dayData.find(item => item.key === day)?.es || day, fecha:isoDate(date), hour, fin: addOneHour(hour) });
};
/* Botón "Nueva actividad" */
const createActivity = () => {
  openForm(null);
};
const openActivity = (activity: Activity) => {
  emit('activity-click', activity);
};
/* EDITAR: abre el formulario con los datos de la actividad */
const editActivity = (activity: Activity) => {
  if(locked(activity)){showToast(idioma.value==='en'?'Past events cannot be edited.':'No se pueden editar eventos pasados.','error');return;}
  openForm({
    id: activity.id,fecha:activity.fecha,imagenes:activity.imagenes||[],video_url:activity.video_url||'',
    day: dayData.find(item => item.key === activity.dia)?.es || activity.dia,
    hour: activity.inicio,
    fin: activity.fin,
    nombre: activity.nombre,
    categoria: activity.categoria,
    nivel: activity.nivel,
    instructor: activity.instructor,
    capacidad: activity.capacidad,
    ubicacion: activity.ubicacion,
    descripcion: activity.descripcion || ''
  });
};
const dayKeyFromLabel = (label: string) => dayData.find(item => item.es === label || item.en === label)?.key || label;
/* El calendario muestra una actividad por franja de hora: evita encimar clases */
const validateActivity = (data: Record<string, any>) => {
  const dayKey = dayKeyFromLabel(data.dia);
  const conflict = activities.value.find(
    item => item.id !== data.id && item.dia === dayKey && (!item.fecha||item.fecha===data.fecha) && sameHour(item.inicio, data.inicio)
  );
  return conflict
    ? `${t('conflictPrefix')} "${conflict.nombre}" ${t('conflictOn')} ${dayLabel(dayKey).toLowerCase()} ${t('conflictAt')} ${formatHour(conflict.inicio)}. ${t('conflictChoose')}`
    : null;
};
/* GUARDAR (nueva o editada) */
const mediaError=(event:Event)=>{const img=event.target as HTMLImageElement;img.style.display='none';const parent=img.parentElement;if(parent&&!parent.querySelector('.image-unavailable')){const span=document.createElement('span');span.className='image-unavailable';span.textContent=idioma.value==='en'?'Image unavailable':'Imagen no disponible';parent.appendChild(span);}};
const uploadMedia=async(file:File,kind:'image'|'video')=>{const fd=new FormData();fd.append('archivo',file);fd.append('tipo',kind);fd.append('sede_id',String(sedeActual()));const token=tokenActual();const response=await fetch(`${API}/api/gym/agenda/media`,{method:'POST',headers:{Accept:'application/json',Authorization:`Bearer ${token}`},body:fd});const result=await response.json().catch(()=>({}));if(!response.ok){const detail=result?.errors?.archivo?.[0]||result?.message||`Error HTTP ${response.status}`;throw new Error(String(detail));}if(!result.url)throw new Error('La API no devolvió URL del archivo.');return String(result.url);};
const saveActivity=async(data:Record<string,any>)=>{if(guardando.value)return;guardando.value=true;try{const sede=sedeActual();const path=data.id?`/${Number(data.id)}`:'';const method=data.id?'PUT':'POST';const imagenes=Array.isArray(data.imagenes)?[...data.imagenes]:[];if(imagenes.length+(data.imagesFiles||[]).length>3)throw new Error(idioma.value==='en'?'Maximum 3 images per event.':'Máximo 3 imágenes por evento.');for(const file of (data.imagesFiles||[]))imagenes.push(await uploadMedia(file,'image'));let video_url=data.video_url||'';if(data.videoFile)video_url=await uploadMedia(data.videoFile,'video');await consultar(path,{method,body:JSON.stringify({sede_id:sede,dia:dayKeyFromLabel(data.dia),fecha:data.fecha,nombre:data.nombre,categoria:data.categoria,nivel:data.nivel,instructor:data.instructor,capacidad:Number(data.capacidad),inicio:data.inicio,fin:data.fin,ubicacion:data.ubicacion||'',descripcion:data.descripcion||'',imagenes,video_url})});closeForm();await cargarActividades();showToast(data.id?'Evento actualizado.':'Evento registrado.');}catch(e:any){errorApi.value=e.message;showToast(e.message,'error');}finally{guardando.value=false;}};
/* ELIMINAR */
const askDelete = (activity: Activity) => {
  if(locked(activity)){showToast(idioma.value==='en'?'Past events cannot be deleted.':'No se pueden eliminar eventos pasados.','error');return;}pendingDelete.value = activity;
};
const confirmDelete=async()=>{const a=pendingDelete.value;if(!a||guardando.value)return;if(locked(a)){pendingDelete.value=null;return;}guardando.value=true;try{await consultar(`/${a.id}?sede_id=${sedeActual()}`,{method:'DELETE'});pendingDelete.value=null;await cargarActividades();showToast('Evento eliminado.');}catch(e:any){errorApi.value=e.message;showToast(e.message,'error');}finally{guardando.value=false;}};
const previousWeek = () => {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() - 7);
  currentDate.value = date;
};
const nextWeek = () => {
  const date = new Date(currentDate.value);
  date.setDate(date.getDate() + 7);
  currentDate.value = date;
};
const goToday = () => {
  currentDate.value = new Date();
  const jsDay = new Date().getDay();
  activeDay.value = jsDay === 0 ? 6 : jsDay - 1;
};
const handleLanguage = (event: Event) => {
  const lang = (event as CustomEvent).detail?.idioma;
  if (lang) idioma.value = lang;
};
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  if (pendingDelete.value) pendingDelete.value = null;
  else if (showForm.value) closeForm();
};
onMounted(() => {
  syncLanguage();
  window.addEventListener('idioma-changed', handleLanguageChange);
  window.addEventListener('factorfit:branch-changed',cambiarSede);
  void cargarActividades();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLanguageChange);
  window.removeEventListener('factorfit:branch-changed',cambiarSede);
  ultimaConsulta++;
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
button { font: inherit; }
.schedule-wrapper {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: rgba(59,130,246,.1);
  --hl-line: rgba(59,130,246,.4);
  --text: var(--color-texto-general, #f5f5f4);
  --card: var(--bg-cards, #101010);
  --title: var(--color-titulos, #fff);
  --card-glass: rgba(16,16,16,.96);
  --icon-glass: rgba(10,10,10,.82);
  --w3: rgba(255,255,255,.03);
  --w4: rgba(255,255,255,.04);
  --w5: rgba(255,255,255,.05);
  --w6: rgba(255,255,255,.06);
  --w8: rgba(255,255,255,.08);
  --w10: rgba(255,255,255,.10);
  --w14: rgba(255,255,255,.14);
  --w18: rgba(255,255,255,.18);
  --w25: rgba(255,255,255,.25);
  --w35: rgba(255,255,255,.35);
  --w50: rgba(255,255,255,.50);
  --w65: rgba(255,255,255,.65);
  --w85: rgba(255,255,255,.85);
  --line: var(--w8);
  --line-soft: var(--w6);
  --text-2: rgba(245,245,244,.64);
  --text-3: rgba(245,245,244,.42);
  --row: 104px;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  color: var(--color-texto-general, #f5f5f4);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
@supports (background: color-mix(in srgb, red 10%, transparent)) {
  .schedule-wrapper {
    --hl-soft: color-mix(in srgb, var(--hl) 12%, transparent);
    --hl-line: color-mix(in srgb, var(--hl) 45%, transparent);
    --card-glass: color-mix(in srgb, var(--card) 94%, transparent);
    --icon-glass: color-mix(in srgb, var(--card) 88%, transparent);
    --text-2: color-mix(in srgb, var(--text) 68%, transparent);
    --text-3: color-mix(in srgb, var(--text) 45%, transparent);
    --w3: color-mix(in srgb, var(--text) 3%, transparent);
    --w4: color-mix(in srgb, var(--text) 4%, transparent);
    --w5: color-mix(in srgb, var(--text) 5%, transparent);
    --w6: color-mix(in srgb, var(--text) 6%, transparent);
    --w8: color-mix(in srgb, var(--text) 8%, transparent);
    --w10: color-mix(in srgb, var(--text) 10%, transparent);
    --w14: color-mix(in srgb, var(--text) 14%, transparent);
    --w18: color-mix(in srgb, var(--text) 18%, transparent);
    --w25: color-mix(in srgb, var(--text) 25%, transparent);
    --w35: color-mix(in srgb, var(--text) 35%, transparent);
    --w50: color-mix(in srgb, var(--text) 50%, transparent);
    --w65: color-mix(in srgb, var(--text) 65%, transparent);
    --w85: color-mix(in srgb, var(--text) 85%, transparent);
  }
}
.schedule-panel {
  width: min(1280px, 97vw);
  max-height: 92vh;
  overflow: auto;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 35px 100px rgba(0,0,0,.65);
  scrollbar-width: thin;
  scrollbar-color: var(--w14) transparent;
}
/* ============ HEADER ============ */
.schedule-header {
  position: sticky;
  top: 0;
  z-index: 30;
  min-height: 82px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-glass);
  border-bottom: 1px solid var(--line-soft);
  backdrop-filter: blur(18px);
}
.header-info { display: flex; align-items: center; gap: 14px; }
.header-icon {
  width: 46px;
  height: 46px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
}
.header-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.header-eyebrow { display: block; margin-bottom: 3px; color: var(--text-3); font-size: 10.5px; font-weight: 800; letter-spacing: 1.3px; }
.header-info h2 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 23px; font-weight: 600; line-height: 1.1; text-transform: uppercase; }
.header-info h2 span { color: var(--hl); }
.header-info p { margin: 4px 0 0; color: var(--text-3); font-size: 12.5px; }
.close-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--w65);
  background: var(--w4);
  border: 1px solid var(--line);
  border-radius: 11px;
  transition: .2s;
}
.close-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.close-btn:hover { color: #f87171; background: rgba(239,68,68,.09); border-color: rgba(239,68,68,.3); }
/* ============ TOOLBAR ============ */
.calendar-toolbar {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.week-navigation, .toolbar-right, .legend { display: flex; align-items: center; }
.week-navigation { gap: 7px; }
.nav-btn, .today-btn {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-2);
  background: var(--w3);
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: .2s;
}
.nav-btn { width: 38px; }
.nav-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.today-btn { padding: 0 15px; font-size: 13px; font-weight: 650; }
.nav-btn:hover, .today-btn:hover { color: var(--title); border-color: var(--hl-line); background: var(--hl-soft); }
.week-info { margin-left: 10px; display: flex; flex-direction: column; gap: 2px; }
.week-info strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; }
.week-info span { color: var(--text-3); font-size: 12px; }
.toolbar-right { gap: 18px; }
.legend { gap: 14px; }
.legend span { display: flex; align-items: center; gap: 7px; color: var(--text-3); font-size: 12px; font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.scheduled { background: var(--hl); }
.dot.available { border: 1.5px dashed var(--w35); }
.new-activity-btn {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, #1c4fd6);
  border: 0;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(28,79,214,.25);
  transition: .2s;
}
.new-activity-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; }
.new-activity-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
/* ============ RESUMEN ============ */
.summary-grid { padding: 0 24px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.summary-card {
  min-height: 68px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--w3);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
}
.summary-icon { width: 38px; height: 38px; flex: none; display: flex; align-items: center; justify-content: center; border-radius: 11px; }
.summary-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.summary-icon.blue { color: #60a5fa; background: rgba(59,130,246,.1); }
.summary-icon.green { color: #34d399; background: rgba(16,185,129,.1); }
.summary-icon.purple { color: #c084fc; background: rgba(168,85,247,.1); }
.summary-icon.orange { color: #fb923c; background: rgba(249,115,22,.1); }
.summary-card > div:last-child { display: flex; flex-direction: column; }
.summary-card strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 23px; font-weight: 600; line-height: 1; }
.summary-card span { margin-top: 4px; color: var(--text-3); font-size: 11px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; }
/* ============ CALENDARIO (DESKTOP) ============ */
.desktop-calendar { margin: 0 24px 20px; overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: var(--w3); }
.calendar-scroll { min-width: 980px; overflow-x: auto; }
.calendar-days-header, .calendar-body { display: grid; grid-template-columns: 76px repeat(7, minmax(0, 1fr)); }
.calendar-days-header { background: var(--w3); border-bottom: 1px solid var(--line); }
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
.day-header.today { background: var(--hl-soft); }
.day-header.today::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--hl); }
.day-name { color: var(--text-3); font-size: 11px; font-weight: 800; letter-spacing: .8px; }
.day-header.today .day-name { color: var(--hl); }
.day-header strong { margin: 3px 0 1px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 600; line-height: 1; }
.day-header small { color: var(--text-3); font-size: 10.5px; font-weight: 600; }
.today-indicator { position: absolute; top: 8px; right: 8px; padding: 2px 6px; color: var(--hl); background: var(--hl-soft); border-radius: 5px; font-size: 9px; font-weight: 800; letter-spacing: .5px; }
.day-count { margin-top: 6px; color: var(--text-3); font-size: 10.5px; }
.time-column { border-right: 1px solid var(--line-soft); background: rgba(0,0,0,.12); }
.time-row { height: var(--row); padding: 9px 10px 0 0; display: flex; align-items: flex-start; justify-content: flex-end; border-bottom: 1px solid var(--line-soft); }
.time-row:last-child { border-bottom: 0; }
.time-row span { color: var(--text-3); font-family: 'Oswald', sans-serif; font-size: 11.5px; font-weight: 500; }
.day-column { min-width: 0; border-right: 1px solid var(--line-soft); }
.day-column:last-child { border-right: 0; }
.day-column.today { background: var(--w3); }
.calendar-slot { position: relative; height: var(--row); padding: 5px; border-bottom: 1px solid var(--line-soft); transition: background .15s; }
.day-column .calendar-slot:last-child { border-bottom: 0; }
.calendar-slot:not(.occupied):hover { background: var(--hl-soft); }
.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  opacity: 0;
  cursor: pointer;
  color: var(--hl);
  background: transparent;
  border: 1px dashed var(--hl-line);
  border-radius: 10px;
  transition: opacity .18s;
}
.empty-slot svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
.empty-slot span { font-size: 11.5px; font-weight: 700; }
.calendar-slot:hover .empty-slot, .empty-slot:focus-visible { opacity: 1; }
/* ============ EVENTOS ============ */
.activity-event {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 8px 9px 11px 13px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  outline: none;
  background: color-mix(in srgb, var(--event-color) 13%, var(--card));
  border: 1px solid color-mix(in srgb, var(--event-color) 32%, transparent);
  border-radius: 11px;
  transition: transform .18s, border-color .18s, box-shadow .18s;
}
.activity-event:hover, .activity-event:focus-visible {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--event-color) 70%, transparent);
  box-shadow: 0 10px 22px rgba(0,0,0,.32);
}
.event-accent { position: absolute; top: 0; bottom: 0; left: 0; width: 4px; background: var(--event-color); }
.activity-event > * { flex-shrink: 0; }
.event-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.event-time { color: var(--event-color); font-size: 11px; font-weight: 800; white-space: nowrap; }
.event-capacity { display: flex; align-items: center; gap: 4px; color: var(--text-2); font-size: 11px; font-weight: 650; }
.event-capacity svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; }
.activity-event > strong {
  display: block;
  margin: 3px 0 4px;
  overflow: hidden;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-detail { margin-top: 1px; display: flex; align-items: center; gap: 5px; min-width: 0; color: var(--text-2); }
.event-detail svg { width: 11px; height: 11px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.event-detail span { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.event-progress { position: absolute; right: 0; bottom: 0; left: 4px; height: 3px; background: var(--w6); }
.event-progress i { display: block; height: 100%; background: var(--event-color); border-radius: 0 3px 3px 0; }
/* Acciones: editar / eliminar */
.event-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity .15s, transform .15s;
}
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
/* ============ MOBILE ============ */
.mobile-calendar { display: none; }
/* ============ FOOTER ============ */
.calendar-footer { min-height: 60px; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border-top: 1px solid var(--line-soft); }
.calendar-footer > div { display: flex; align-items: center; gap: 9px; }
.footer-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hl); box-shadow: 0 0 8px var(--hl); }
.calendar-footer p { margin: 0; color: var(--text-3); font-size: 12.5px; }
.calendar-footer button { padding: 9px 15px; cursor: pointer; color: var(--text-2); background: transparent; border: 1px solid var(--line); border-radius: 10px; font-size: 12.5px; font-weight: 650; transition: .2s; }
.calendar-footer button:hover { color: var(--title); background: var(--w4); }
/* ============ FORMULARIO (NUEVA / EDITAR) ============ */
.form-overlay { position: fixed; inset: 0; z-index: 150; padding: 18px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }
/* ============ CONFIRMAR ELIMINACIÓN ============ */
.confirm-overlay { position: fixed; inset: 0; z-index: 200; padding: 18px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }
.confirm-box { width: min(400px, 100%); padding: 26px 24px 22px; text-align: center; background: var(--card); border: 1px solid var(--line-strong); border-radius: 20px; box-shadow: 0 30px 80px rgba(0,0,0,.6); }
.confirm-icon { width: 52px; height: 52px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; color: #f87171; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); border-radius: 15px; }
.confirm-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.confirm-box h3 { margin: 0 0 8px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 20px; font-weight: 600; }
.confirm-box p { margin: 0 0 20px; color: var(--text-2); font-size: 13.5px; line-height: 1.55; }
.confirm-box p strong { color: var(--title); font-weight: 650; }
.confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.confirm-actions button { height: 44px; cursor: pointer; border-radius: 11px; font-size: 14px; font-weight: 700; transition: .2s; }
.btn-ghost { color: var(--text-2); background: transparent; border: 1px solid var(--line); }
.btn-ghost:hover { color: var(--title); background: var(--w5); }
.btn-danger { color: #fff; background: #dc2626; border: 0; box-shadow: 0 8px 20px rgba(220,38,38,.28); }
.btn-danger:hover { background: #ef4444; }
/* ============ TOAST ============ */
.toast { position: fixed; z-index: 300; left: 50%; bottom: 24px; max-width: min(420px, 92vw); padding: 12px 16px; display: flex; align-items: center; gap: 11px; color: var(--title); transform: translateX(-50%); background: var(--card); border: 1px solid var(--line); border-radius: 13px; box-shadow: 0 20px 50px rgba(0,0,0,.55); }
.toast-icon { width: 30px; height: 30px; flex: none; display: flex; align-items: center; justify-content: center; color: #34d399; background: rgba(16,185,129,.12); border-radius: 9px; }
.toast.error .toast-icon { color: #f87171; background: rgba(239,68,68,.12); }
.toast-icon svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.toast span { font-size: 13px; line-height: 1.4; }
.toast-enter-active, .toast-leave-active { transition: opacity .22s, transform .22s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
.toast.toast-enter-from, .toast.toast-leave-to { transform: translate(-50%, 10px); }
.close-btn:focus-visible, .nav-btn:focus-visible, .today-btn:focus-visible, .new-activity-btn:focus-visible,
.icon-btn:focus-visible, .mobile-day:focus-visible, .mobile-empty:focus-visible, .calendar-footer button:focus-visible,
.confirm-actions button:focus-visible, .empty-slot:focus-visible { outline: 2px solid var(--hl); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after { transition: none !important; animation-duration: .01ms !important; }
}
/* ============ RESPONSIVE ============ */
@media (max-width: 1100px) {
  .legend { display: none; }
}
@media (max-width: 767px) {
  .schedule-panel { width: 96vw; max-height: 94vh; border-radius: 18px; }
  .schedule-header { min-height: 74px; padding: 14px 16px; }
  .header-icon { width: 42px; height: 42px; }
  .header-info h2 { font-size: 20px; }
  .header-info p { display: none; }
  .calendar-toolbar { padding: 14px 16px; flex-wrap: nowrap; align-items: center; }
  .week-info { max-width: 150px; }
  .week-info strong { font-size: 16px; }
  .new-activity-btn { width: 40px; padding: 0; justify-content: center; }
  .new-activity-btn span { display: none; }
  .new-activity-btn svg { width: 18px; height: 18px; }
  .summary-grid { padding: 0 16px 14px; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .summary-card { min-height: 62px; padding: 10px 12px; }
  .summary-card strong { font-size: 21px; }
  .desktop-calendar { display: none; }
  .mobile-calendar { display: block; padding: 0 16px 20px; }
  .mobile-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; padding: 6px 0 16px; }
  .mobile-day {
    position: relative;
    min-width: 0;
    height: 62px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    color: var(--text-3);
    background: var(--w3);
    border: 1px solid var(--line-soft);
    border-radius: 12px;
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
  .mobile-event {
    position: relative;
    margin-bottom: 10px;
    padding: 13px 14px 14px;
    overflow: hidden;
    cursor: pointer;
    background: color-mix(in srgb, var(--event-color) 12%, var(--card));
    border: 1px solid color-mix(in srgb, var(--event-color) 28%, transparent);
    border-left: 4px solid var(--event-color);
    border-radius: 13px;
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
  .mobile-event-footer { margin-top: 12px; padding-top: 10px; display: flex; justify-content: space-between; border-top: 1px solid var(--line-soft); }
  .mobile-event-footer span { color: var(--text-3); font-size: 11.5px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; }
  .event-progress.static { left: 0; }
  .mobile-empty { min-height: 52px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; color: var(--text-3); background: transparent; border: 1px dashed var(--line); border-radius: 12px; font-size: 13px; font-weight: 600; transition: .2s; }
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
  .summary-icon { width: 34px; height: 34px; }
}
.event-media{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:6px 0}.event-media img{width:35px;height:35px;object-fit:cover;border-radius:6px}.event-media a{font-size:11px;color:var(--color-highlight,#ffac70)}
.image-unavailable{display:block;font-size:9px;color:#fca5a5;max-width:90px;overflow-wrap:anywhere}
</style>
