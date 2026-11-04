<template>
  <transition name="notification-panel">
    <div v-if="isOpen" ref="panelRef" class="notifications-panel">
      <!-- ==================================================
           LISTA DE NOTIFICACIONES
      =================================================== -->
      <template v-if="currentView === 'list'">
        <!-- HEADER -->
        <header class="panel-header">
          <div class="header-main">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span v-if="unreadCount > 0" class="header-indicator"></span>
            </div>

            <div class="header-copy">
              <div class="header-title-row">
                <h3>{{ t('notificationsTitle') }}</h3>
                <span v-if="unreadCount > 0" class="unread-counter">{{ unreadCount }}</span>
              </div>
              <p>{{ unreadCount > 0 ? t('pendingNotifications') : t('everythingUpToDate') }}</p>
            </div>
          </div>

          <div class="header-actions">
            <button type="button" class="icon-button" :title="t('settingsTooltip')" @click="currentView = 'settings'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.2.08.42.12.64.12H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1z" />
              </svg>
            </button>

            <button type="button" class="icon-button" :title="t('closeTooltip')" @click="$emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </header>

        <p v-if="apiError" role="alert" style="padding:8px 16px;color:#fca5a5;font-size:12px">{{ apiError }}</p>

        <!-- RESUMEN / ACCIÓN -->
        <section class="notification-summary">
          <div class="summary-status">
            <span class="summary-dot"></span>
            <span v-if="unreadCount > 0">
              {{ currentLang === 'en' ? `${unreadCount} unread` : `${unreadCount} sin leer` }}
            </span>
            <span v-else>{{ t('noPending') }}</span>
          </div>

          <button v-if="unreadCount > 0" type="button" class="mark-all-button" @click="markAllAsRead">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="m3 12 4 4L17 6" />
              <path d="m10 12 4 4 7-7" />
            </svg>
            {{ t('markAllRead') }}
          </button>
        </section>

        <!-- FILTROS -->
        <nav class="filter-tabs">
          <button type="button" :class="{ active: listFilter === 'all' }" @click="changeFilter('all')">
            {{ t('filterAll') }}
            <span>{{ filteredTypes.length }}</span>
          </button>

          <button type="button" :class="{ active: listFilter === 'unread' }" @click="changeFilter('unread')">
            {{ t('filterUnread') }}
            <span>{{ unreadCount }}</span>
          </button>

          <button type="button" :class="{ active: listFilter === 'read' }" @click="changeFilter('read')">
            {{ t('filterRead') }}
          </button>
        </nav>

        <!-- SELECCIÓN MÚLTIPLE -->
        <div v-if="selectionMode" class="selection-toolbar">
          <label>
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            <span class="check-box"></span>
            <span>
              {{ selectedIds.length > 0 ? `${selectedIds.length} ${t('selected')}` : t('selectAll') }}
            </span>
          </label>

          <div class="selection-actions">
            <button v-if="selectedIds.length > 0" type="button" @click="markSelectedAsRead">
              {{ t('markAsReadBtn') }}
            </button>

            <button v-if="selectedIds.length > 0" type="button" class="danger-action" @click="deleteSelected">
              {{ t('deleteSelectedBtn') }}
            </button>

            <button type="button" @click="cancelSelection">{{ t('cancel') }}</button>
          </div>
        </div>

        <!-- LISTA -->
        <div class="notifications-scroll" @scroll.passive="openMenuId = null">
          <!-- VACÍO -->
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h4>{{ t('emptyTitle') }}</h4>
            <p>{{ t('emptyList') }}</p>
          </div>

          <template v-else>
            <!-- GRUPOS: HOY / ANTERIORES -->
            <section v-for="group in groups" :key="group.key" class="notification-group">
              <div class="group-heading">
                <span>{{ t(group.labelKey) }}</span>
                <span class="group-line"></span>
              </div>

              <article
                v-for="item in group.items"
                :key="item.id"
                class="notification-item"
                :class="[
                  { unread: !item.read, 'menu-open': openMenuId === item.id },
                  `type-${getNotificationType(item)}`
                ]"
                @click="handleNotificationClick(item)"
              >
                <label v-if="selectionMode" class="notification-checkbox" @click.stop>
                  <input v-model="selectedIds" type="checkbox" :value="item.id" />
                  <span class="check-box"></span>
                </label>

                <div class="notification-icon" :class="getNotificationType(item)">
                  <!-- PAGO -->
                  <svg v-if="getNotificationType(item) === 'payment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                    <path d="M6 15h2" />
                  </svg>

                  <!-- MEMBRESÍA -->
                  <svg v-else-if="getNotificationType(item) === 'membership'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" />
                  </svg>

                  <!-- AGENDA -->
                  <svg v-else-if="getNotificationType(item) === 'schedule'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4" />
                    <path d="M8 3v4" />
                    <path d="M3 11h18" />
                  </svg>

                  <!-- CLIENTE -->
                  <svg v-else-if="getNotificationType(item) === 'client'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  <!-- SISTEMA -->
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>

                <div class="notification-body">
                  <div class="notification-title-row">
                    <h4>{{ item.title }}</h4>
                    <span v-if="!item.read" class="unread-dot"></span>
                  </div>

                  <p>{{ item.message }}</p>

                  <footer class="notification-meta">
                    <span>{{ item.time }}</span>
                    <span class="meta-divider"></span>
                    <span>{{ getTypeLabel(item) }}</span>
                  </footer>
                </div>

                <button
                  v-if="!selectionMode"
                  type="button"
                  class="more-button"
                  :title="t('moreOptions')"
                  @click.stop="toggleMenu(item.id, $event)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.7" />
                    <circle cx="12" cy="12" r="1.7" />
                    <circle cx="12" cy="19" r="1.7" />
                  </svg>
                </button>

                <!-- MENÚ (position: fixed, no se recorta por el scroll) -->
                <div
                  v-if="openMenuId === item.id"
                  class="item-menu"
                  :style="menuStyle"
                  @click.stop
                >
                  <button type="button" @click="toggleRead(item)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="m3 12 4 4L17 6" />
                    </svg>
                    {{ item.read ? t('markUnread') : t('markAsReadBtn') }}
                  </button>

                  <button type="button" @click="startSelection(item.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="4" y="4" width="16" height="16" rx="3" />
                      <path d="m8 12 3 3 5-6" />
                    </svg>
                    {{ t('select') }}
                  </button>

                  <button type="button" class="delete-menu-item" @click="deleteOne(item.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                    </svg>
                    {{ t('deleteSelectedBtn') }}
                  </button>
                </div>
              </article>
            </section>
          </template>
        </div>

        <!-- FOOTER -->
        <footer class="panel-footer">
          <button type="button" @click="selectionMode = true">{{ t('manageNotifications') }}</button>
          <span></span>
          <button type="button" @click="currentView = 'settings'">{{ t('notificationSettings') }}</button>
        </footer>
      </template>

      <!-- ==================================================
           CONFIGURACIÓN
      =================================================== -->
      <template v-else>
        <header class="panel-header settings-header">
          <div class="header-main">
            <button type="button" class="back-button" @click="currentView = 'list'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div class="header-copy">
              <h3>{{ t('settingsTitle') }}</h3>
              <p>{{ t('settingsSubtitle') }}</p>
            </div>
          </div>

          <button type="button" class="icon-button" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <div class="settings-scroll">
          <!-- ENTREGA -->
          <section class="settings-section">
            <div class="settings-heading">
              <span>{{ t('deliverySection') }}</span>
            </div>

            <div class="settings-card">
              <div class="setting-row">
                <div class="setting-icon blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div class="setting-copy">
                  <strong>{{ t('inAppTitle') }}</strong>
                  <span>{{ t('inAppRealDesc') }}</span>
                </div>
                <label class="switch">
                  <input v-model="settings.inApp" type="checkbox" />
                  <span></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-icon purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </div>
                <div class="setting-copy">
                  <strong>{{ t('emailNotifications') }}</strong>
                  <span>{{ t('emailNotificationsDesc') }}</span>
                </div>
                <label class="switch">
                  <input v-model="settings.email" type="checkbox" />
                  <span></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-icon green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M11 5 6 9H2v6h4l5 4z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M19 5a10 10 0 0 1 0 14" />
                  </svg>
                </div>
                <div class="setting-copy">
                  <strong>{{ t('soundTitle') }}</strong>
                  <span>{{ t('soundRealDesc') }}</span>
                </div>
                <label class="switch">
                  <input v-model="settings.sound" type="checkbox" />
                  <span></span>
                </label>
              </div>
            </div>
          </section>

          <!-- TIPOS -->
          <section class="settings-section">
            <div class="settings-heading">
              <span>{{ t('typesSectionTitle') }}</span>
              <small>{{ t('chooseAlerts') }}</small>
            </div>

            <div class="settings-card">
              <div v-for="item in notificationTypes" :key="item.key" class="setting-row">
                <div class="setting-icon" :class="item.color">
                  <svg v-if="item.key === 'payments'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>

                  <svg v-else-if="item.key === 'memberships'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" />
                  </svg>

                  <svg v-else-if="item.key === 'clients'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  <svg v-else-if="item.key === 'schedule'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 11h18" />
                  </svg>

                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>

                <div class="setting-copy">
                  <strong>{{ t(item.titleKey) }}</strong>
                  <span>{{ t(item.descKey) }}</span>
                </div>

                <label class="switch">
                  <input v-model="item.value" type="checkbox" />
                  <span></span>
                </label>
              </div>
            </div>
          </section>

          <!-- PREFERENCIAS -->
          <section class="settings-section">
            <div class="settings-heading">
              <span>{{ t('preferences') }}</span>
            </div>

            <div class="settings-card">
              <div class="setting-row">
                <div class="setting-icon neutral">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
                <div class="setting-copy">
                  <strong>{{ t('quietHours') }}</strong>
                  <span>{{ t('quietHoursDesc') }}</span>
                </div>
                <label class="switch">
                  <input v-model="settings.quietHours" type="checkbox" />
                  <span></span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <footer class="settings-footer">
          <button type="button" class="save-settings-button" @click="saveSettings">
            {{ t('savePreferences') }}
          </button>
        </footer>
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

type NotificationItem = {
  id: string | number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'payment' | 'membership' | 'client' | 'schedule' | 'system';
  date?: string | Date;
};

const props = defineProps<{
  isOpen: boolean;
  notifications?: NotificationItem[];
}>();

const emit = defineEmits([
  'close',
  'mark-read',
  'delete-notifications',
  'toggle-read'
]);

// Fuente real: Laravel/PostgreSQL. El prop externo se conserva como respaldo para no romper el padre.
const remoteNotifications = ref<NotificationItem[]>([]);
const apiLoaded = ref(false);
const apiError = ref('');
const loading = ref(false);
const scopeSede = () => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['selected_sede_id','sede_id','ID_Sede','selectedSedeId']) {
      const n = Number(store.getItem(key)); if (Number.isInteger(n) && n > 0) return n;
    }
  }
  return 1;
};
const token = () => {
  for (const store of [sessionStorage,localStorage]) for(const key of ['auth_token','token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
    const v=store.getItem(key);if(v) return v.replace(/^Bearer\s+/i,'');
  }
  return '';
};
const baseApi=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');
const apiRequest = async (path:string,method='GET',payload?:unknown) => {
  const t=token();if(!t) throw new Error('Sesión no disponible. Inicia sesión nuevamente.');
  const r=await fetch(`${baseApi}/api/gym/notificaciones${path}`,{method,headers:{Accept:'application/json',Authorization:`Bearer ${t}`,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),cache:'no-store'});
  const d=await r.json().catch(()=>({}));if(!r.ok) throw new Error(d?.message||`Error HTTP ${r.status}`);return d;
};
const notificationsData = computed(()=>apiLoaded.value ? remoteNotifications.value : (props.notifications||[]));
const filteredTypes = computed(()=>notificationsData.value.filter(n=>settings.value.inApp && (notificationTypes.value.find(x=>({payments:'payment',memberships:'membership',clients:'client',schedule:'schedule',system:'system'}[x.key]||'system')===getNotificationType(n))?.value!==false)));
const loadRemote = async (sync=false) => {
  if(loading.value)return;loading.value=true;apiError.value='';
  try {
    const sede=scopeSede();
    if(sync)await apiRequest('/sincronizar','POST',{sede_id:sede});
    const d=await apiRequest(`?sede_id=${sede}`);
    remoteNotifications.value=Array.isArray(d.notifications)?d.notifications:[];apiLoaded.value=true;
    if(d.preferences){
      if(d.preferences.settings)settings.value={...settings.value,...d.preferences.settings};
      if(Array.isArray(d.preferences.types))notificationTypes.value.forEach(x=>{const v=d.preferences.types.find((z:{key:string,value:boolean})=>z.key===x.key);if(v)x.value=!!v.value;});
    }
  }catch(e){apiError.value=e instanceof Error?e.message:'No se pudieron cargar las notificaciones.';}
  finally{loading.value=false;}
};
const updateNotifications = async(ids:Array<string|number>,accion:'leer'|'no_leer'|'eliminar')=>{
  if(!ids.length)return;
  try{
    if(apiLoaded.value){
      await apiRequest('','PATCH',{sede_id:scopeSede(),ids:ids.map(Number),accion});
      if(accion==='eliminar')remoteNotifications.value=remoteNotifications.value.filter(n=>!ids.some(id=>String(id)===String(n.id)));
      else remoteNotifications.value=remoteNotifications.value.map(n=>ids.some(id=>String(id)===String(n.id))?{...n,read:accion==='leer'}:n);
    }else{
      if(accion==='eliminar')emit('delete-notifications',ids);
      else if(accion==='leer')emit('mark-read',ids);
      else ids.forEach(id=>emit('toggle-read',id));
    }
  }catch(e){apiError.value=e instanceof Error?e.message:'No fue posible guardar el cambio.';}
};
let polling:ReturnType<typeof setInterval>|null=null;
const stopPolling=()=>{if(polling){clearInterval(polling);polling=null;}};
const startPolling=()=>{stopPolling();polling=setInterval(()=>{if(props.isOpen)void loadRemote(false);},60000);};
const panelRef = ref<HTMLElement | null>(null);
const currentView = ref<'list' | 'settings'>('list');
const listFilter = ref<'all' | 'unread' | 'read'>('all');
const selectedIds = ref<Array<string | number>>([]);
const selectionMode = ref(false);
const openMenuId = ref<string | number | null>(null);
const menuStyle = ref<Record<string, string>>({});

/* =========================================================
   IDIOMA
========================================================= */

const currentLang = ref(localStorage.getItem('member-idioma') || 'es');

const handleLangChange = (event: Event) => {
  const customEvent = event as CustomEvent<{ idioma?: string }>;
  if (customEvent.detail?.idioma) {
    currentLang.value = customEvent.detail.idioma;
  }
};

const langData = {
  es: {
    notificationsTitle: 'Notificaciones',
    settingsTooltip: 'Configurar notificaciones',
    closeTooltip: 'Cerrar',
    pendingNotifications: 'Tienes actividad pendiente por revisar',
    everythingUpToDate: 'Estás al día con tus notificaciones',
    noPending: 'Sin notificaciones pendientes',
    markAllRead: 'Marcar todas como leídas',
    filterAll: 'Todas',
    filterUnread: 'No leídas',
    filterRead: 'Leídas',
    today: 'Hoy',
    earlier: 'Anteriores',
    emptyTitle: 'Todo al día',
    emptyList: 'No tienes notificaciones en esta sección.',
    selected: 'seleccionadas',
    selectAll: 'Seleccionar todas',
    select: 'Seleccionar',
    cancel: 'Cancelar',
    markAsReadBtn: 'Marcar como leída',
    markUnread: 'Marcar como no leída',
    deleteSelectedBtn: 'Eliminar',
    moreOptions: 'Más opciones',
    manageNotifications: 'Administrar',
    notificationSettings: 'Preferencias',
    settingsTitle: 'Preferencias',
    settingsSubtitle: 'Controla cómo y cuándo recibir alertas',
    deliverySection: 'CANALES DE NOTIFICACIÓN',
    inAppTitle: 'Notificaciones en la aplicación',
    inAppRealDesc: 'Mostrar alertas dentro del sistema',
    emailNotifications: 'Correo electrónico',
    emailNotificationsDesc: 'Recibir avisos importantes por correo',
    soundTitle: 'Sonido de alertas',
    soundRealDesc: 'Reproducir un sonido para nuevas alertas',
    typesSectionTitle: 'TIPOS DE NOTIFICACIÓN',
    chooseAlerts: 'Selecciona cuáles quieres recibir',
    paymentsTitle: 'Pagos y cobros',
    paymentsDesc: 'Pagos recibidos, rechazados y pendientes',
    membershipsTitle: 'Membresías',
    membershipsDesc: 'Vencimientos, renovaciones y cambios',
    clientsTitle: 'Clientes',
    clientsDesc: 'Altas, actualizaciones y actividad relevante',
    scheduleTitle: 'Agenda',
    scheduleDesc: 'Citas, clases y recordatorios',
    systemTitle: 'Sistema',
    systemDesc: 'Seguridad, acceso y avisos importantes',
    preferences: 'PREFERENCIAS',
    quietHours: 'Horario silencioso',
    quietHoursDesc: 'Evitar alertas sonoras fuera del horario laboral',
    savePreferences: 'Guardar preferencias',
    payment: 'Pago',
    membership: 'Membresía',
    client: 'Cliente',
    schedule: 'Agenda',
    system: 'Sistema'
  },

  en: {
    notificationsTitle: 'Notifications',
    settingsTooltip: 'Notification settings',
    closeTooltip: 'Close',
    pendingNotifications: 'You have activity waiting for review',
    everythingUpToDate: 'You are up to date with your notifications',
    noPending: 'No pending notifications',
    markAllRead: 'Mark all as read',
    filterAll: 'All',
    filterUnread: 'Unread',
    filterRead: 'Read',
    today: 'Today',
    earlier: 'Earlier',
    emptyTitle: 'All caught up',
    emptyList: 'There are no notifications in this section.',
    selected: 'selected',
    selectAll: 'Select all',
    select: 'Select',
    cancel: 'Cancel',
    markAsReadBtn: 'Mark as read',
    markUnread: 'Mark as unread',
    deleteSelectedBtn: 'Delete',
    moreOptions: 'More options',
    manageNotifications: 'Manage',
    notificationSettings: 'Preferences',
    settingsTitle: 'Preferences',
    settingsSubtitle: 'Control how and when alerts are delivered',
    deliverySection: 'NOTIFICATION CHANNELS',
    inAppTitle: 'In-app notifications',
    inAppRealDesc: 'Show alerts inside the system',
    emailNotifications: 'Email',
    emailNotificationsDesc: 'Receive important notices by email',
    soundTitle: 'Alert sounds',
    soundRealDesc: 'Play a sound for new alerts',
    typesSectionTitle: 'NOTIFICATION TYPES',
    chooseAlerts: 'Choose which alerts you want to receive',
    paymentsTitle: 'Payments',
    paymentsDesc: 'Received, rejected and pending payments',
    membershipsTitle: 'Memberships',
    membershipsDesc: 'Expirations, renewals and changes',
    clientsTitle: 'Clients',
    clientsDesc: 'Registrations, updates and relevant activity',
    scheduleTitle: 'Schedule',
    scheduleDesc: 'Appointments, classes and reminders',
    systemTitle: 'System',
    systemDesc: 'Security, access and important notices',
    preferences: 'PREFERENCES',
    quietHours: 'Quiet hours',
    quietHoursDesc: 'Disable sounds outside business hours',
    savePreferences: 'Save preferences',
    payment: 'Payment',
    membership: 'Membership',
    client: 'Client',
    schedule: 'Schedule',
    system: 'System'
  }
};

const t = (key: string) => {
  const language = currentLang.value === 'en' ? 'en' : 'es';
  return (
    langData[language][key as keyof typeof langData.es] ||
    langData.es[key as keyof typeof langData.es] ||
    key
  );
};

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const settings = ref({
  inApp: true,
  email: true,
  sound: true,
  quietHours: false
});

const notificationTypes = ref([
  { key: 'payments', titleKey: 'paymentsTitle', descKey: 'paymentsDesc', color: 'green', value: true },
  { key: 'memberships', titleKey: 'membershipsTitle', descKey: 'membershipsDesc', color: 'orange', value: true },
  { key: 'clients', titleKey: 'clientsTitle', descKey: 'clientsDesc', color: 'blue', value: true },
  { key: 'schedule', titleKey: 'scheduleTitle', descKey: 'scheduleDesc', color: 'purple', value: true },
  { key: 'system', titleKey: 'systemTitle', descKey: 'systemDesc', color: 'neutral', value: true }
]);

/* =========================================================
   CONTADORES / FILTRO
========================================================= */

const unreadCount = computed(
  () => filteredTypes.value.filter(item => !item.read).length
);

const filteredNotifications = computed(() => {
  if (listFilter.value === 'unread') {
    return filteredTypes.value.filter(item => !item.read);
  }
  if (listFilter.value === 'read') {
    return filteredTypes.value.filter(item => item.read);
  }
  return filteredTypes.value;
});

/* =========================================================
   AGRUPACIÓN
========================================================= */

const isToday = (item: NotificationItem) => {
  // Si la API devuelve `date`, se usa la fecha real.
  // Si no, se infiere por el texto ("min", "hora", "ahora", etc.).
  if (item.date) {
    const date = new Date(item.date);
    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  const time = item.time?.toLowerCase() || '';

  return (
    time.includes('min') ||
    time.includes('hora') ||
    time.includes('hour') ||
    time.includes('now') ||
    time.includes('ahora') ||
    time.includes('hoy') ||
    time.includes('today')
  );
};

const groups = computed(() => {
  const today = filteredNotifications.value.filter(isToday);
  const older = filteredNotifications.value.filter(item => !isToday(item));

  return [
    { key: 'today', labelKey: 'today', items: today },
    { key: 'earlier', labelKey: 'earlier', items: older }
  ].filter(group => group.items.length > 0);
});

/* =========================================================
   TIPO DE NOTIFICACIÓN
========================================================= */

const getNotificationType = (item: NotificationItem) => {
  if (item.type) return item.type;

  const content = `${item.title} ${item.message}`.toLowerCase();

  if (content.includes('pago') || content.includes('payment') || content.includes('cobro')) {
    return 'payment';
  }
  if (content.includes('membres') || content.includes('renov') || content.includes('venc')) {
    return 'membership';
  }
  if (content.includes('cliente') || content.includes('client') || content.includes('usuario')) {
    return 'client';
  }
  if (
    content.includes('agenda') ||
    content.includes('cita') ||
    content.includes('clase') ||
    content.includes('schedule')
  ) {
    return 'schedule';
  }

  return 'system';
};

const getTypeLabel = (item: NotificationItem) => t(getNotificationType(item));

/* =========================================================
   FILTROS
========================================================= */

const changeFilter = (filter: 'all' | 'unread' | 'read') => {
  listFilter.value = filter;
  selectedIds.value = [];
  openMenuId.value = null;
};

/* =========================================================
   SELECCIÓN
========================================================= */

const isAllSelected = computed(
  () =>
    filteredNotifications.value.length > 0 &&
    filteredNotifications.value.every(item => selectedIds.value.includes(item.id))
);

const toggleSelectAll = (event: Event) => {
  const input = event.target as HTMLInputElement;

  selectedIds.value = input.checked
    ? filteredNotifications.value.map(item => item.id)
    : [];
};

const startSelection = (id: string | number) => {
  selectionMode.value = true;

  if (!selectedIds.value.includes(id)) {
    selectedIds.value.push(id);
  }

  openMenuId.value = null;
};

const cancelSelection = () => {
  selectionMode.value = false;
  selectedIds.value = [];
};

const markSelectedAsRead = () => {
  if (!selectedIds.value.length) return;

  void updateNotifications([...selectedIds.value],'leer');

  selectedIds.value = [];
  selectionMode.value = false;
};

const deleteSelected = () => {
  if (!selectedIds.value.length) return;

  void updateNotifications([...selectedIds.value],'eliminar');

  selectedIds.value = [];
  selectionMode.value = false;
};

const deleteOne = (id: string | number) => {
  void updateNotifications([id],'eliminar');
  openMenuId.value = null;
};

/* =========================================================
   LEÍDAS
========================================================= */

const markAllAsRead = () => {
  const ids = filteredTypes.value.filter(item => !item.read).map(item => item.id);

  if (!ids.length) return;

  void updateNotifications(ids,'leer');
};

const toggleRead = (item: NotificationItem) => {
  void updateNotifications([item.id],item.read?'no_leer':'leer');
  openMenuId.value = null;
};

const handleNotificationClick = (item: NotificationItem) => {
  openMenuId.value = null;

  if (selectionMode.value) {
    const index = selectedIds.value.indexOf(item.id);

    if (index >= 0) {
      selectedIds.value.splice(index, 1);
    } else {
      selectedIds.value.push(item.id);
    }

    return;
  }

  if (!item.read) {
    void updateNotifications([item.id],item.read?'no_leer':'leer');
  }
};

/* =========================================================
   MENÚ INDIVIDUAL (posicionado con coordenadas fijas)
========================================================= */

const MENU_WIDTH = 176;
const MENU_HEIGHT = 132;
const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;

const toggleMenu = (id: string | number, event: MouseEvent) => {
  if (openMenuId.value === id) {
    openMenuId.value = null;
    return;
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN)
  );

  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < MENU_HEIGHT + MENU_GAP + VIEWPORT_MARGIN;

  menuStyle.value = openUp
    ? {
        left: `${left}px`,
        bottom: `${window.innerHeight - rect.top + MENU_GAP}px`
      }
    : {
        left: `${left}px`,
        top: `${rect.bottom + MENU_GAP}px`
      };

  openMenuId.value = id;
};

/* =========================================================
   GUARDAR / CARGAR PREFERENCIAS
========================================================= */

const saveSettings = async () => {
  localStorage.setItem(
    'notification-preferences',
    JSON.stringify({
      settings: settings.value,
      types: notificationTypes.value.map(item => ({
        key: item.key,
        value: item.value
      }))
    })
  );

  try{await apiRequest('/preferencias','PUT',{sede_id:scopeSede(),settings:settings.value,types:notificationTypes.value.map(x=>({key:x.key,value:x.value}))});currentView.value='list';}catch(e){apiError.value=e instanceof Error?e.message:'No se pudieron guardar preferencias.';}
};

const loadPreferences = () => {
  const stored = localStorage.getItem('notification-preferences');

  if (!stored) return;

  try {
    const data = JSON.parse(stored);

    if (data.settings) {
      settings.value = { ...settings.value, ...data.settings };
    }

    if (Array.isArray(data.types)) {
      notificationTypes.value.forEach(item => {
        const saved = data.types.find((savedItem: any) => savedItem.key === item.key);
        if (saved) item.value = saved.value;
      });
    }
  } catch {
    // Preferencias inválidas: se conservan los valores por defecto.
  }
};

/* =========================================================
   CLICK EXTERIOR
========================================================= */

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element;

  if (props.isOpen && panelRef.value && !panelRef.value.contains(target)) {
    emit('close');
    return;
  }

  if (!target?.closest?.('.item-menu') && !target?.closest?.('.more-button')) {
    openMenuId.value = null;
  }
};

/* =========================================================
   WATCH / CICLO DE VIDA
========================================================= */

watch(
  () => props.isOpen,
  value => {
    if (!value){stopPolling();return;}
    void loadRemote(true);startPolling();
    currentView.value = 'list';
    selectedIds.value = [];
    selectionMode.value = false;
    openMenuId.value = null;
  }
);

onMounted(() => {
  loadPreferences();if(props.isOpen){void loadRemote(true);startPolling();}
  window.addEventListener('idioma-changed', handleLangChange as EventListener);
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  stopPolling();
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
.notifications-panel {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #111318);
  --title: var(--color-titulos, #f8fafc);
  --text: var(--color-texto-general, #d7dce5);
  --muted: #858e9d;
  --line: color-mix(in srgb, var(--text) 9%, transparent);

  position: fixed;
  z-index: 2500;
  top: 70px;
  right: 18px;

  width: min(430px, calc(100vw - 28px));
  max-height: calc(100vh - 88px);

  display: flex;
  flex-direction: column;

  overflow: hidden;

  border: 1px solid var(--line);
  border-radius: var(--app-border-radius, 15px);
  background: var(--card);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;

  box-shadow:
    0 24px 65px rgba(0, 0, 0, 0.48),
    0 5px 18px rgba(0, 0, 0, 0.28);
}

/* ================= HEADER ================= */

.panel-header {
  flex: 0 0 auto;
  min-height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  padding: 14px 16px;

  border-bottom: 1px solid var(--line);
  background: var(--card);
}

.header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.header-icon {
  position: relative;

  width: 38px;
  height: 38px;
  flex: 0 0 38px;

  display: grid;
  place-items: center;

  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 9%, transparent);
  color: var(--accent);
}

.header-icon svg {
  width: 18px;
  height: 18px;
}

.header-indicator {
  position: absolute;
  top: -2px;
  right: -2px;

  width: 8px;
  height: 8px;

  border: 2px solid var(--card);
  border-radius: 50%;
  background: #ef4444;
}

.header-copy {
  min-width: 0;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.header-copy h3 {
  margin: 0;
  color: var(--title);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.header-copy p {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-counter {
  min-width: 20px;
  height: 20px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 5px;

  border-radius: 999px;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.59rem;
  font-weight: 800;
}

.header-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-button,
.back-button {
  width: 34px;
  height: 34px;

  display: grid;
  place-items: center;

  padding: 0;

  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;

  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.icon-button:hover,
.back-button:hover {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--title);
}

.icon-button svg,
.back-button svg {
  width: 17px;
  height: 17px;
}

/* ================= RESUMEN ================= */

.notification-summary {
  flex: 0 0 auto;
  min-height: 44px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 8px 16px;

  border-bottom: 1px solid var(--line);
}

.summary-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 0.65rem;
  font-weight: 550;
}

.summary-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.mark-all-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  padding: 5px 7px;

  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--accent);
  font-size: 0.62rem;
  font-weight: 650;
  cursor: pointer;

  transition: background 0.15s ease;
}

.mark-all-button:hover {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}

.mark-all-button svg {
  width: 14px;
  height: 14px;
}

/* ================= FILTROS ================= */

.filter-tabs {
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  gap: 2px;

  padding: 7px 12px;

  border-bottom: 1px solid var(--line);
}

.filter-tabs button {
  min-height: 31px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  padding: 0 10px;

  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-size: 0.64rem;
  font-weight: 600;
  cursor: pointer;

  transition: background 0.15s ease, color 0.15s ease;
}

.filter-tabs button:hover {
  background: rgba(255, 255, 255, 0.035);
  color: var(--title);
}

.filter-tabs button.active {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: color-mix(in srgb, var(--accent) 72%, white);
}

.filter-tabs button span {
  min-width: 17px;
  height: 17px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 4px;

  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  font-size: 0.52rem;
}

/* ================= SELECCIÓN ================= */

.selection-toolbar {
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  padding: 9px 14px;

  border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}

.selection-toolbar label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 0.63rem;
  cursor: pointer;
}

.selection-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 4px 10px;
}

.selection-actions button {
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: var(--accent);
  font-size: 0.6rem;
  font-weight: 650;
  cursor: pointer;
}

.selection-actions .danger-action {
  color: #f87171;
}

/* ================= CHECKBOX ================= */

.selection-toolbar input,
.notification-checkbox input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.check-box {
  position: relative;

  width: 16px;
  height: 16px;
  flex: 0 0 16px;

  display: block;

  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 5px;
  background: transparent;

  transition: background 0.15s ease, border-color 0.15s ease;
}

.check-box::after {
  content: "";

  position: absolute;
  top: 2px;
  left: 5px;

  width: 4px;
  height: 8px;

  border: solid #ffffff;
  border-width: 0 2px 2px 0;

  opacity: 0;
  transform: rotate(45deg);
}

input:checked + .check-box {
  border-color: var(--accent);
  background: var(--accent);
}

input:checked + .check-box::after {
  opacity: 1;
}

input:focus-visible + .check-box {
  outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
  outline-offset: 2px;
}

/* ================= SCROLL ================= */

.notifications-scroll,
.settings-scroll {
  flex: 1 1 auto;
  min-height: 0;

  overflow-y: auto;
  overscroll-behavior: contain;

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.notifications-scroll {
  padding: 5px 10px 12px;
}

.notifications-scroll::-webkit-scrollbar,
.settings-scroll::-webkit-scrollbar {
  width: 5px;
}

.notifications-scroll::-webkit-scrollbar-thumb,
.settings-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

/* ================= GRUPOS ================= */

.notification-group {
  padding-top: 9px;
}

.group-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 6px;
}

.group-heading > span:first-child {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 0.57rem;
  font-weight: 750;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.group-line {
  flex: 1;
  height: 1px;
  background: var(--line);
}

/* ================= NOTIFICACIÓN ================= */

.notification-item {
  position: relative;

  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-bottom: 3px;
  padding: 11px 7px;

  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;

  transition: background 0.15s ease, border-color 0.15s ease;
}

.notification-item:hover,
.notification-item.menu-open {
  background: rgba(255, 255, 255, 0.025);
}

.notification-item.unread {
  background: color-mix(in srgb, var(--accent) 4%, transparent);
}

.notification-item.unread:hover,
.notification-item.unread.menu-open {
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

.notification-checkbox {
  flex: 0 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  cursor: pointer;
}

.notification-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;

  display: grid;
  place-items: center;

  border-radius: 9px;
  background: rgba(148, 163, 184, 0.08);
  color: #94a3b8;
}

.notification-icon svg {
  width: 17px;
  height: 17px;
}

.notification-icon.payment {
  background: rgba(52, 211, 153, 0.09);
  color: #34d399;
}

.notification-icon.membership {
  background: rgba(251, 146, 60, 0.09);
  color: #fb923c;
}

.notification-icon.client {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
}

.notification-icon.schedule {
  background: rgba(167, 139, 250, 0.09);
  color: #a78bfa;
}

.notification-body {
  flex: 1 1 auto;
  min-width: 0;
  padding-top: 1px;
}

.notification-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-right: 3px;
}

.notification-title-row h4 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-item:not(.unread) .notification-title-row h4 {
  color: color-mix(in srgb, var(--title) 80%, transparent);
  font-weight: 550;
}

.unread-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: var(--accent);
}

.notification-body p {
  display: -webkit-box;

  margin: 4px 0 0;
  overflow: hidden;

  color: var(--muted);
  font-size: 0.63rem;
  line-height: 1.42;

  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-top: 6px;

  color: color-mix(in srgb, var(--muted) 78%, transparent);
  font-size: 0.54rem;
  font-weight: 500;
}

.meta-divider {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--muted) 55%, transparent);
}

.more-button {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;

  display: grid;
  place-items: center;

  padding: 0;

  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;

  opacity: 0;

  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.notification-item:hover .more-button,
.notification-item.menu-open .more-button,
.more-button:focus-visible {
  opacity: 1;
}

.more-button:hover,
.notification-item.menu-open .more-button {
  background: rgba(255, 255, 255, 0.07);
  color: var(--title);
}

.more-button svg {
  width: 15px;
  height: 15px;
}

/* ================= MENÚ ================= */

.item-menu {
  position: fixed;
  z-index: 3000;

  width: 176px;

  padding: 5px;

  border: 1px solid var(--line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--card) 94%, #ffffff);

  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.5);
}

.item-menu button {
  width: 100%;
  min-height: 34px;

  display: flex;
  align-items: center;
  gap: 9px;

  padding: 0 9px;

  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font-size: 0.64rem;
  text-align: left;
  cursor: pointer;
}

.item-menu button:hover {
  background: rgba(255, 255, 255, 0.055);
}

.item-menu svg {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
}

.item-menu .delete-menu-item {
  color: #f87171;
}

.item-menu .delete-menu-item:hover {
  background: rgba(248, 113, 113, 0.1);
}

/* ================= VACÍO ================= */

.empty-state {
  min-height: 310px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 35px 25px;

  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  margin-bottom: 13px;

  border: 1px solid var(--line);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.025);
  color: var(--muted);
}

.empty-icon svg {
  width: 21px;
  height: 21px;
}

.empty-state h4 {
  margin: 0;
  color: var(--title);
  font-size: 0.76rem;
}

.empty-state p {
  max-width: 250px;
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.64rem;
  line-height: 1.45;
}

/* ================= FOOTER ================= */

.panel-footer {
  flex: 0 0 auto;
  min-height: 45px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  padding: 7px 14px;

  border-top: 1px solid var(--line);
  background: var(--card);
}

.panel-footer button {
  padding: 4px 6px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.59rem;
  font-weight: 600;
  cursor: pointer;
}

.panel-footer button:hover {
  color: var(--accent);
}

.panel-footer > span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--muted);
}

/* =========================================================
   CONFIGURACIÓN
========================================================= */

.settings-header .header-main {
  gap: 7px;
}

.settings-scroll {
  padding: 8px 13px 20px;
}

.settings-section {
  margin-top: 17px;
}

.settings-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  margin-bottom: 7px;
  padding: 0 4px;
}

.settings-heading > span {
  color: var(--muted);
  font-size: 0.55rem;
  font-weight: 750;
  letter-spacing: 0.065em;
}

.settings-heading small {
  color: color-mix(in srgb, var(--muted) 70%, transparent);
  font-size: 0.53rem;
  text-align: right;
}

.settings-card {
  overflow: hidden;

  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.018);
}

.setting-row {
  min-height: 63px;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 11px;

  border-bottom: 1px solid var(--line);
}

.setting-row:last-child {
  border-bottom: 0;
}

.setting-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;

  display: grid;
  place-items: center;

  border-radius: 9px;
}

.setting-icon svg {
  width: 16px;
  height: 16px;
}

.setting-icon.blue {
  background: rgba(59, 130, 246, 0.09);
  color: #60a5fa;
}

.setting-icon.green {
  background: rgba(52, 211, 153, 0.09);
  color: #34d399;
}

.setting-icon.orange {
  background: rgba(251, 146, 60, 0.09);
  color: #fb923c;
}

.setting-icon.purple {
  background: rgba(167, 139, 250, 0.09);
  color: #a78bfa;
}

.setting-icon.neutral {
  background: rgba(148, 163, 184, 0.08);
  color: #94a3b8;
}

.setting-copy {
  min-width: 0;

  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.setting-copy strong {
  color: var(--title);
  font-size: 0.67rem;
  font-weight: 650;
}

.setting-copy span {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.57rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ================= SWITCH ================= */

.switch {
  position: relative;

  width: 34px;
  height: 19px;
  flex: 0 0 34px;
}

.switch input {
  position: absolute;
  opacity: 0;
}

.switch span {
  position: absolute;
  inset: 0;

  border-radius: 999px;
  background: rgba(148, 163, 184, 0.22);
  cursor: pointer;

  transition: background 0.18s ease;
}

.switch span::before {
  content: "";

  position: absolute;
  top: 3px;
  left: 3px;

  width: 13px;
  height: 13px;

  border-radius: 50%;
  background: #ffffff;

  transition: transform 0.18s ease;
}

.switch input:checked + span {
  background: var(--accent);
}

.switch input:checked + span::before {
  transform: translateX(15px);
}

.switch input:focus-visible + span {
  outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
  outline-offset: 2px;
}

/* ================= GUARDAR ================= */

.settings-footer {
  flex: 0 0 auto;
  padding: 11px 14px;
  border-top: 1px solid var(--line);
}

.save-settings-button {
  width: 100%;
  height: 39px;

  border: 0;
  border-radius: 9px;

  background: var(--color-botones, var(--accent));
  color: var(--color-texto-botones, #ffffff);

  font-size: 0.67rem;
  font-weight: 700;
  cursor: pointer;

  transition: filter 0.15s ease, transform 0.15s ease;
}

.save-settings-button:hover {
  filter: brightness(1.08);
}

.save-settings-button:active {
  transform: scale(0.99);
}

/* ================= TRANSICIÓN ================= */

.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: translateY(-7px) scale(0.985);
}

/* ================= TÁCTIL: botón ⋮ siempre visible ================= */

@media (hover: none) {
  .more-button {
    opacity: 1;
  }
}

/* ================= RESPONSIVE ================= */

@media (max-width: 600px) {
  .notifications-panel {
    top: 58px;
    right: 7px;
    left: 7px;

    width: auto;
    max-height: calc(100dvh - 66px);

    border-radius: 12px;
  }

  .panel-header {
    min-height: 65px;
    padding: 11px 12px;
  }

  .header-icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .header-copy p {
    max-width: 200px;
  }

  .notification-summary {
    padding: 7px 12px;
  }

  .filter-tabs {
    overflow-x: auto;
    padding: 6px 9px;
  }

  .filter-tabs button {
    flex: 1;
    min-width: max-content;
  }

  .notifications-scroll {
    padding: 4px 7px 10px;
  }

  .notification-item {
    gap: 9px;
    padding: 10px 7px;
  }

  .notification-icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .notification-title-row h4 {
    font-size: 0.68rem;
  }

  .notification-body p {
    font-size: 0.61rem;
  }

  .selection-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .selection-actions {
    justify-content: flex-start;
  }

  .settings-scroll {
    padding: 7px 9px 16px;
  }

  .setting-row {
    padding: 10px 9px;
  }

  .setting-copy span {
    white-space: normal;
  }
}
</style>