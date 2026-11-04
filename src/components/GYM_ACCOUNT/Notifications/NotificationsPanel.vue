<template>
  <transition name="notification-panel">
    <div v-if="isOpen" ref="panelRef" class="notifications-panel" role="dialog" :aria-label="t('notificationsTitle')">
      <!-- Barra de carga -->
      <div v-if="loading" class="loading-bar" aria-hidden="true"></div>
      <!-- ==================================================
           LISTA DE NOTIFICACIONES
      =================================================== -->
      <template v-if="currentView === 'list'">
        <!-- HEADER -->
        <header class="panel-header">
          <div class="header-main">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
            <button type="button" class="icon-button" :title="t('settingsTooltip')" :aria-label="t('settingsTooltip')" @click="currentView = 'settings'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.2.08.42.12.64.12H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1z" />
              </svg>
            </button>
            <button type="button" class="icon-button" :title="t('closeTooltip')" :aria-label="t('closeTooltip')" @click="$emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </header>
        <!-- ERROR -->
        <div v-if="apiError" class="api-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span>{{ apiError }}</span>
          <button type="button" @click="loadRemote(true)">{{ t('retry') }}</button>
        </div>
        <!-- FILTROS -->
        <nav class="filter-tabs" role="tablist">
          <div class="segmented">
            <button type="button" role="tab" :aria-selected="listFilter === 'all'" :class="{ active: listFilter === 'all' }" @click="changeFilter('all')">
              {{ t('filterAll') }}
              <span>{{ filteredTypes.length }}</span>
            </button>
            <button type="button" role="tab" :aria-selected="listFilter === 'unread'" :class="{ active: listFilter === 'unread' }" @click="changeFilter('unread')">
              {{ t('filterUnread') }}
              <span>{{ unreadCount }}</span>
            </button>
            <button type="button" role="tab" :aria-selected="listFilter === 'read'" :class="{ active: listFilter === 'read' }" @click="changeFilter('read')">
              {{ t('filterRead') }}
            </button>
          </div>
        </nav>
        <!-- RESUMEN / ACCIÓN -->
        <section class="notification-summary">
          <div class="summary-status">
            <span class="summary-dot" :class="{ idle: unreadCount === 0 }"></span>
            <span v-if="unreadCount > 0">
              {{ currentLang === 'en' ? `${unreadCount} unread` : `${unreadCount} sin leer` }}
            </span>
            <span v-else>{{ t('noPending') }}</span>
          </div>
          <button v-if="unreadCount > 0" type="button" class="mark-all-button" @click="markAllAsRead">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 12 4 4L17 6" />
              <path d="m10 12 4 4 7-7" />
            </svg>
            {{ t('markAllRead') }}
          </button>
        </section>
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
            <button type="button" class="ghost-action" @click="cancelSelection">{{ t('cancel') }}</button>
          </div>
        </div>
        <!-- LISTA -->
        <div class="notifications-scroll" @scroll.passive="openMenuId = null">
          <!-- VACÍO -->
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
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
                <span class="group-count">{{ group.items.length }}</span>
                <span class="group-line"></span>
              </div>
              <article
                v-for="item in group.items"
                :key="item.id"
                class="notification-item"
                :class="[
                  { unread: !item.read, 'menu-open': openMenuId === item.id, 'is-alert': isAlertItem(item) },
                  `type-${getNotificationType(item)}`
                ]"
                @click="handleNotificationClick(item)"
              >
                <label v-if="selectionMode" class="notification-checkbox" @click.stop>
                  <input v-model="selectedIds" type="checkbox" :value="item.id" />
                  <span class="check-box"></span>
                </label>
                <div class="notification-icon" :class="getNotificationType(item)">
                  <!-- ALERTA -->
                  <svg v-if="isAlertItem(item)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                  <!-- PAGO -->
                  <svg v-else-if="getNotificationType(item) === 'payment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                    <path d="M6 15h2" />
                  </svg>
                  <!-- MEMBRESÍA -->
                  <svg v-else-if="getNotificationType(item) === 'membership'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" />
                  </svg>
                  <!-- AGENDA -->
                  <svg v-else-if="getNotificationType(item) === 'schedule'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4" />
                    <path d="M8 3v4" />
                    <path d="M3 11h18" />
                  </svg>
                  <!-- CLIENTE -->
                  <svg v-else-if="getNotificationType(item) === 'client'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <!-- SISTEMA -->
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
                    <span class="meta-time">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {{ item.time }}
                    </span>
                    <span class="type-chip">{{ getTypeLabel(item) }}</span>
                  </footer>
                </div>
                <button
                  v-if="!selectionMode"
                  type="button"
                  class="more-button"
                  :title="t('moreOptions')"
                  :aria-label="t('moreOptions')"
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m3 12 4 4L17 6" />
                    </svg>
                    {{ item.read ? t('markUnread') : t('markAsReadBtn') }}
                  </button>
                  <button type="button" @click="startSelection(item.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="3" />
                      <path d="m8 12 3 3 5-6" />
                    </svg>
                    {{ t('select') }}
                  </button>
                  <span class="menu-divider"></span>
                  <button type="button" class="delete-menu-item" @click="deleteOne(item.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
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
          <button type="button" @click="selectionMode = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <path d="m8 12 3 3 5-6" />
            </svg>
            {{ t('manageNotifications') }}
          </button>
          <span></span>
          <button type="button" @click="currentView = 'settings'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            {{ t('notificationSettings') }}
          </button>
        </footer>
      </template>
      <!-- ==================================================
           CONFIGURACIÓN
      =================================================== -->
      <template v-else>
        <header class="panel-header settings-header">
          <div class="header-main">
            <button type="button" class="back-button" :aria-label="t('back')" @click="currentView = 'list'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div class="header-copy">
              <h3>{{ t('settingsTitle') }}</h3>
              <p>{{ t('settingsSubtitle') }}</p>
            </div>
          </div>
          <button type="button" class="icon-button" :aria-label="t('closeTooltip')" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>
        <div v-if="apiError" class="api-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span>{{ apiError }}</span>
        </div>
        <div class="settings-scroll">
          <!-- ENTREGA -->
          <section class="settings-section">
            <div class="settings-heading">
              <span>{{ t('deliverySection') }}</span>
            </div>
            <div class="settings-card">
              <div class="setting-row">
                <div class="setting-icon blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
                  <svg v-if="item.key === 'payments'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  <svg v-else-if="item.key === 'memberships'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" />
                  </svg>
                  <svg v-else-if="item.key === 'clients'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <svg v-else-if="item.key === 'schedule'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 11h18" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
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
  'toggle-read',
  'notifications-updated'
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
    emit('notifications-updated',remoteNotifications.value);
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
      emit('notifications-updated',remoteNotifications.value);
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
const onBranchUpdate=()=>{apiLoaded.value=false;remoteNotifications.value=[];emit('notifications-updated',[]);if(props.isOpen)void loadRemote(true);};
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
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
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
    back: 'Volver',
    retry: 'Reintentar',
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
    system: 'Sistema',
    alert: 'Alerta'
  },
  en: {
    notificationsTitle: 'Notifications',
    settingsTooltip: 'Notification settings',
    closeTooltip: 'Close',
    back: 'Back',
    retry: 'Retry',
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
    system: 'System',
    alert: 'Alert'
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
/* Alertas de sistema (p. ej. "Alerta de control de acceso") se resaltan en ámbar */
const isAlertItem = (item: NotificationItem) =>
  getNotificationType(item) === 'system' &&
  /alerta|atenci[oó]n|alert|warning/i.test(`${item.title} ${item.message}`);
const getTypeLabel = (item: NotificationItem) =>
  isAlertItem(item) ? t('alert') : t(getNotificationType(item));
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
const MENU_WIDTH = 200;
const MENU_HEIGHT = 140;
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
  loadPreferences();
  if(props.isOpen){void loadRemote(true);startPolling();}
  window.addEventListener('idioma-changed', handleLangChange as EventListener);
  window.addEventListener('factorfit:branch-changed', onBranchUpdate);
  document.addEventListener('mousedown', handleClickOutside);
});
onUnmounted(() => {
  stopPolling();
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  window.removeEventListener('factorfit:branch-changed', onBranchUpdate);
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
<style scoped>
.notifications-panel {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #111318);
  --title: var(--color-titulos, #f8fafc);
  --text: var(--color-texto-general, #d7dce5);
  --muted: color-mix(in srgb, var(--text) 58%, transparent);
  --faint: color-mix(in srgb, var(--text) 40%, transparent);
  --line: color-mix(in srgb, var(--text) 9%, transparent);
  --line2: color-mix(in srgb, var(--text) 15%, transparent);
  --surface: color-mix(in srgb, var(--text) 4%, transparent);
  --surface2: color-mix(in srgb, var(--text) 8%, transparent);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: fixed;
  z-index: 2500;
  top: 70px;
  right: 18px;
  width: min(460px, calc(100vw - 28px));
  height: min(720px, calc(100dvh - 88px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line2);
  border-radius: 22px;
  background:
    radial-gradient(380px 170px at 100% 0%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 72%),
    var(--card);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.55),
    0 6px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.notifications-panel * {
  box-sizing: border-box;
}
.notifications-panel button {
  font-family: inherit;
}
/* Barra de carga */
.loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  height: 2px;
  overflow: hidden;
  background: transparent;
}
.loading-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  animation: loading 1.1s ease-in-out infinite;
}
@keyframes loading {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
/* ================= HEADER ================= */
.panel-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 18px 16px;
}
.header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 13px;
}
.header-icon {
  position: relative;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 14px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent) 7%, transparent));
  color: var(--accent);
  box-shadow: 0 8px 22px -10px var(--accent);
}
.header-icon svg {
  width: 21px;
  height: 21px;
}
.header-indicator {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 11px;
  height: 11px;
  border: 2.5px solid var(--card);
  border-radius: 50%;
  background: #ef4444;
}
.header-copy {
  min-width: 0;
}
.header-title-row {
  display: flex;
  align-items: center;
  gap: 9px;
}
.header-copy h3 {
  margin: 0;
  color: var(--title);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.header-copy p {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 12.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unread-counter {
  min-width: 24px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  box-shadow: 0 6px 14px -6px var(--accent);
}
.header-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-button,
.back-button {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.25s var(--ease);
}
.icon-button:hover,
.back-button:hover {
  border-color: var(--line2);
  background: var(--surface2);
  color: var(--title);
}
.icon-button svg,
.back-button svg {
  width: 18px;
  height: 18px;
}
.back-button {
  flex: 0 0 38px;
}
.back-button:hover { transform: translateX(-2px); }
/* ================= ERROR ================= */
.api-error {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 10px;
  padding: 10px 12px;
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.09);
  color: #fca5a5;
  font-size: 12.5px;
  line-height: 1.4;
}
.api-error svg {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
}
.api-error span {
  flex: 1;
  min-width: 0;
}
.api-error button {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 8px;
  background: transparent;
  color: #fecaca;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.api-error button:hover {
  background: rgba(248, 113, 113, 0.14);
}
/* ================= FILTROS ================= */
.filter-tabs {
  flex: 0 0 auto;
  padding: 0 16px;
}
.segmented {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
}
.segmented button {
  flex: 1;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}
.segmented button:hover {
  color: var(--title);
}
.segmented button.active {
  background: color-mix(in srgb, var(--accent) 17%, transparent);
  color: color-mix(in srgb, var(--accent) 80%, white);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent);
}
.segmented button span {
  min-width: 22px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--surface2);
  font-size: 11px;
  font-weight: 700;
}
.segmented button.active span {
  background: color-mix(in srgb, var(--accent) 28%, transparent);
}
/* ================= RESUMEN ================= */
.notification-summary {
  flex: 0 0 auto;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 18px 6px;
}
.summary-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 550;
}
.summary-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
}
.summary-dot.idle {
  background: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.16);
}
.mark-all-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--accent);
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.18s ease;
}
.mark-all-button:hover {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
.mark-all-button svg {
  width: 15px;
  height: 15px;
}
/* ================= SELECCIÓN ================= */
.selection-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 4px 14px 2px;
  padding: 9px 12px;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
.selection-toolbar label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--title);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
.selection-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.selection-actions button {
  padding: 5px 10px;
  border: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: color-mix(in srgb, var(--accent) 80%, white);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.selection-actions button:hover {
  filter: brightness(1.15);
}
.selection-actions .danger-action {
  background: rgba(248, 113, 113, 0.14);
  color: #fca5a5;
}
.selection-actions .ghost-action {
  background: transparent;
  color: var(--muted);
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
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  display: block;
  border: 1.5px solid var(--line2);
  border-radius: 6px;
  background: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.check-box::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5.5px;
  width: 4px;
  height: 8px;
  border: solid #fff;
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
  scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
}
.notifications-scroll {
  padding: 0 12px 14px;
}
.notifications-scroll::-webkit-scrollbar,
.settings-scroll::-webkit-scrollbar {
  width: 6px;
}
.notifications-scroll::-webkit-scrollbar-thumb,
.settings-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}
/* ================= GRUPOS ================= */
.group-heading {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 6px 8px;
  background: linear-gradient(180deg, var(--card) 70%, transparent);
}
.group-heading > span:first-child {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.group-count {
  min-width: 20px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--surface2);
  color: var(--muted);
  font-size: 10.5px;
  font-weight: 700;
}
.group-line {
  flex: 1;
  height: 1px;
  background: var(--line);
}
/* ================= NOTIFICACIÓN ================= */
.notification-item {
  --tone: #94a3b8;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin-bottom: 8px;
  padding: 14px 12px 14px 16px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.25s var(--ease), box-shadow 0.25s ease;
}
.notification-item.type-payment { --tone: #34d399; }
.notification-item.type-membership { --tone: #fb923c; }
.notification-item.type-client { --tone: var(--accent); }
.notification-item.type-schedule { --tone: #a78bfa; }
.notification-item.type-system { --tone: #94a3b8; }
.notification-item.is-alert { --tone: #fbbf24; }
.notification-item:hover,
.notification-item.menu-open {
  border-color: var(--line2);
  background: var(--surface2);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -14px rgba(0, 0, 0, 0.6);
}
/* Barra lateral de color en las no leídas */
.notification-item.unread {
  border-color: color-mix(in srgb, var(--tone) 24%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--tone) 9%, transparent), transparent 55%),
    var(--surface);
}
.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: var(--tone);
}
.notification-checkbox {
  flex: 0 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  height: 42px;
  cursor: pointer;
}
.notification-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--tone) 26%, transparent);
  border-radius: 13px;
  background: color-mix(in srgb, var(--tone) 13%, transparent);
  color: var(--tone);
}
.notification-icon svg {
  width: 20px;
  height: 20px;
}
.notification-body {
  flex: 1 1 auto;
  min-width: 0;
}
.notification-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notification-title-row h4 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notification-item:not(.unread) .notification-title-row h4 {
  color: color-mix(in srgb, var(--title) 78%, transparent);
  font-weight: 560;
}
.unread-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--tone);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone) 22%, transparent);
}
.notification-body p {
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.notification-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.meta-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--faint);
  font-size: 11.5px;
  font-weight: 500;
}
.meta-time svg {
  width: 12px;
  height: 12px;
}
.type-chip {
  padding: 3px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  color: var(--tone);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.more-button {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 9px;
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
  background: var(--surface2);
  color: var(--title);
}
.more-button svg {
  width: 16px;
  height: 16px;
}
/* ================= MENÚ ================= */
.item-menu {
  position: fixed;
  z-index: 3000;
  width: 200px;
  padding: 6px;
  border: 1px solid var(--line2);
  border-radius: 14px;
  background: color-mix(in srgb, var(--card) 92%, #ffffff);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
  animation: menu-in 0.16s var(--ease);
}
@keyframes menu-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
.item-menu button {
  width: 100%;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-weight: 550;
  text-align: left;
  cursor: pointer;
}
.item-menu button:hover {
  background: var(--surface2);
  color: var(--title);
}
.item-menu svg {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}
.menu-divider {
  display: block;
  height: 1px;
  margin: 4px 6px;
  background: var(--line);
}
.item-menu .delete-menu-item {
  color: #f87171;
}
.item-menu .delete-menu-item:hover {
  background: rgba(248, 113, 113, 0.12);
  color: #fca5a5;
}
/* ================= VACÍO ================= */
.empty-state {
  min-height: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px 25px;
  text-align: center;
}
.empty-icon {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border: 1px solid var(--line2);
  border-radius: 20px;
  background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--accent) 14%, transparent), var(--surface));
  color: var(--accent);
}
.empty-icon svg {
  width: 30px;
  height: 30px;
}
.empty-state h4 {
  margin: 0;
  color: var(--title);
  font-size: 16px;
  font-weight: 700;
}
.empty-state p {
  max-width: 260px;
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}
/* ================= FOOTER ================= */
.panel-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--card) 88%, black);
}
.panel-footer button {
  flex: 1;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}
.panel-footer button svg {
  width: 16px;
  height: 16px;
}
.panel-footer button:hover {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
}
.panel-footer > span {
  width: 1px;
  height: 20px;
  background: var(--line2);
}
/* =========================================================
   CONFIGURACIÓN
========================================================= */
.settings-header .header-main {
  gap: 12px;
}
.settings-scroll {
  padding: 0 16px 22px;
}
.settings-section {
  margin-top: 8px;
  padding-top: 12px;
}
.settings-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 9px;
  padding: 0 4px;
}
.settings-heading > span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.09em;
}
.settings-heading small {
  color: var(--faint);
  font-size: 11.5px;
  text-align: right;
}
.settings-card {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
}
.setting-row {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 15px;
  border-bottom: 1px solid var(--line);
  transition: background 0.18s ease;
}
.setting-row:hover {
  background: var(--surface);
}
.setting-row:last-child {
  border-bottom: 0;
}
.setting-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
}
.setting-icon svg {
  width: 19px;
  height: 19px;
}
.setting-icon.blue { background: rgba(59, 130, 246, 0.12); border-color: rgba(59, 130, 246, 0.24); color: #60a5fa; }
.setting-icon.green { background: rgba(52, 211, 153, 0.12); border-color: rgba(52, 211, 153, 0.24); color: #34d399; }
.setting-icon.orange { background: rgba(251, 146, 60, 0.12); border-color: rgba(251, 146, 60, 0.24); color: #fb923c; }
.setting-icon.purple { background: rgba(167, 139, 250, 0.12); border-color: rgba(167, 139, 250, 0.24); color: #a78bfa; }
.setting-icon.neutral { background: rgba(148, 163, 184, 0.1); border-color: rgba(148, 163, 184, 0.22); color: #94a3b8; }
.setting-copy {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}
.setting-copy strong {
  color: var(--title);
  font-size: 13.5px;
  font-weight: 650;
}
.setting-copy span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}
/* ================= SWITCH ================= */
.switch {
  position: relative;
  width: 44px;
  height: 26px;
  flex: 0 0 44px;
}
.switch input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.switch span {
  position: absolute;
  inset: 0;
  border: 1px solid var(--line2);
  border-radius: 999px;
  background: var(--surface2);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.switch span::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.22s var(--ease);
}
.switch input:checked + span {
  border-color: transparent;
  background: var(--accent);
}
.switch input:checked + span::before {
  transform: translateX(18px);
}
.switch input:focus-visible + span {
  outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
  outline-offset: 2px;
}
/* ================= GUARDAR ================= */
.settings-footer {
  flex: 0 0 auto;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--card) 88%, black);
}
.save-settings-button {
  width: 100%;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 13px;
  background: var(--color-botones, var(--accent));
  color: var(--color-texto-botones, #ffffff);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 30px -14px var(--color-botones, var(--accent));
  transition: filter 0.18s ease, transform 0.18s ease;
}
.save-settings-button svg {
  width: 17px;
  height: 17px;
}
.save-settings-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
.save-settings-button:active {
  transform: scale(0.99);
}
/* ================= FOCO ================= */
.icon-button:focus-visible,
.back-button:focus-visible,
.segmented button:focus-visible,
.mark-all-button:focus-visible,
.panel-footer button:focus-visible,
.save-settings-button:focus-visible,
.item-menu button:focus-visible,
.api-error button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
/* ================= TRANSICIÓN ================= */
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.22s var(--ease);
}
.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.985);
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
    right: 8px;
    left: 8px;
    width: auto;
    height: calc(100dvh - 68px);
    border-radius: 18px;
  }
  .panel-header {
    padding: 14px 14px 12px;
  }
  .header-icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
    border-radius: 12px;
  }
  .header-copy h3 {
    font-size: 16.5px;
  }
  .header-copy p {
    max-width: 190px;
    font-size: 12px;
  }
  .icon-button,
  .back-button {
    width: 36px;
    height: 36px;
  }
  .filter-tabs {
    padding: 0 12px;
  }
  .segmented button {
    padding: 0 6px;
    font-size: 12.5px;
  }
  .notification-summary {
    padding: 8px 14px 4px;
  }
  .notifications-scroll {
    padding: 0 8px 12px;
  }
  .notification-item {
    gap: 11px;
    padding: 12px 8px 12px 14px;
    border-radius: 14px;
  }
  .notification-icon {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
    border-radius: 12px;
  }
  .notification-title-row h4 {
    font-size: 13.5px;
  }
  .selection-toolbar {
    flex-direction: column;
    align-items: flex-start;
    margin: 4px 10px 2px;
  }
  .selection-actions {
    justify-content: flex-start;
  }
  .settings-scroll {
    padding: 0 12px 18px;
  }
  .setting-row {
    padding: 12px;
    gap: 11px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .notifications-panel *,
  .notifications-panel *::before,
  .notifications-panel *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
