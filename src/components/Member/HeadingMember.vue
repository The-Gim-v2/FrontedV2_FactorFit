<template>
  <div class="app-wrapper">

    <!-- =====================================================
         NAVEGACIÓN ESCRITORIO
    ====================================================== -->
    <header class="desktop-navbar">
      <div class="desktop-navbar-inner">

        <!-- SUCURSAL ACTUAL (esquina izquierda) -->
        <div class="desktop-brand nav-dropdown-root">
          <button
            type="button"
            class="brand-button"
            :class="{ active: desktopDropdown === 'branch' }"
            :title="selectedGym"
            :aria-label="nt('currentBranch')"
            @click.stop="toggleDesktopDropdown('branch')"
          >
            <div class="brand-mark">
              <svg class="ico" viewBox="0 0 24 24" v-html="ICON.pin"></svg>
            </div>

            <div class="brand-copy">
              <strong>{{ selectedGym }}</strong>
              <span>{{ nt('currentBranch') }}</span>
            </div>

            <svg class="brand-chevron" :class="{ rotated: desktopDropdown === 'branch' }" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          <transition name="desktop-dropdown">
            <div
              v-if="desktopDropdown === 'branch'"
              class="desktop-dropdown branch-menu"
              @click.stop
            >
              <div class="dropdown-title">{{ nt('myGyms') }}</div>

              <button
                v-for="gym in gyms"
                :key="gym"
                type="button"
                class="dropdown-link"
                :class="{ selected: selectedGym === gym }"
                @click="selectGym(gym)"
              >
                <span class="dropdown-icon blue">
                  <svg class="ico" viewBox="0 0 24 24" v-html="ICON.pin"></svg>
                </span>
                <span class="dropdown-copy">
                  <strong>{{ gym }}</strong>
                  <small>{{ selectedGym === gym ? nt('selectedGym') : nt('switchGym') }}</small>
                </span>
                <svg v-if="selectedGym === gym" class="option-check" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>

              <div class="dropdown-divider"></div>

              <router-link :to="`${BASE}/gyms`" class="dropdown-link compact" @click="closeDesktopDropdown">
                <span class="dropdown-icon neutral">
                  <svg class="ico" viewBox="0 0 24 24" v-html="ICON.gyms"></svg>
                </span>
                <span class="dropdown-copy"><strong>{{ nt('gymsAndVenues') }}</strong></span>
              </router-link>
            </div>
          </transition>
        </div>

        <!-- MENÚ CENTRAL -->
        <nav class="desktop-menu">
          <template v-for="m in desktopMenu" :key="m.key">

            <!-- ENLACE SIMPLE -->
            <router-link
              v-if="m.type === 'link'"
              :to="m.to"
              class="desktop-nav-item"
              @click="closeDesktopDropdown"
            >
              <svg class="nav-ico" viewBox="0 0 24 24"><path :d="m.navIcon" /></svg>
              <span>{{ nt(m.key) }}</span>
            </router-link>

            <!-- GRUPO CON SUBMENÚ -->
            <div v-else class="desktop-nav-group nav-dropdown-root">
              <button
                type="button"
                class="desktop-nav-item"
                :class="{ active: desktopDropdown === m.id, current: isGroupActive(m.id) }"
                @click.stop="toggleDesktopDropdown(m.id)"
              >
                <svg class="nav-ico" viewBox="0 0 24 24"><path :d="m.navIcon" /></svg>
                <span>{{ nt(m.key) }}</span>
                <svg class="nav-chevron" :class="{ rotated: desktopDropdown === m.id }" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              <transition name="desktop-dropdown">
                <div
                  v-if="desktopDropdown === m.id"
                  class="desktop-dropdown"
                  :class="{ 'dropdown-end': m.id === 'payments' }"
                  @click.stop
                >
                  <div class="dropdown-title">{{ nt(m.key) }}</div>

                  <router-link
                    v-for="l in m.items"
                    :key="l.to"
                    :to="l.to"
                    class="dropdown-link compact"
                    @click="closeDesktopDropdown"
                  >
                    <span class="dropdown-icon" :class="l.color">
                      <svg class="ico" viewBox="0 0 24 24" v-html="l.svg"></svg>
                    </span>
                    <span class="dropdown-copy">
                      <strong>{{ nt(l.key) }}</strong>
                    </span>
                  </router-link>
                </div>
              </transition>
            </div>
          </template>
        </nav>

        <!-- ACCIONES DERECHA -->
        <div class="desktop-actions">

          <!-- QR -->
          <button
            type="button"
            class="desktop-action"
            :title="t.qrGimnasio || 'QR'"
            @click="activeModal = 'qr'"
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 4h6v6H4z"></path>
              <path d="M14 4h6v6h-6z"></path>
              <path d="M4 14h6v6H4z"></path>
              <path d="M14 14h2v2h-2z"></path>
              <path d="M18 14h2v6h-6v-2"></path>
            </svg>
          </button>

          <!-- NOTIFICACIONES -->
          <button
            type="button"
            class="desktop-action notification-action"
            :title="t.notificaciones || 'Notificaciones'"
            @click="isNotificationsOpen = true"
          >
            <span v-if="unreadNotifications > 0" class="notification-count">
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
            <svg viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
              <path d="M10 21h4"></path>
            </svg>
          </button>

          <div class="desktop-separator"></div>

          <!-- PERFIL -->
          <div class="profile-menu-root nav-dropdown-root">
            <button
              type="button"
              class="desktop-profile"
              :class="{ active: desktopDropdown === 'profile', current: isProfileMenuActive }"
              :aria-label="nt('profile')"
              @click.stop="toggleDesktopDropdown('profile')"
            >
              <span class="profile-avatar">{{ memberInitials }}</span>
              <span class="profile-user-name">{{ memberName }}</span>

              <svg class="profile-chevron" :class="{ rotated: desktopDropdown === 'profile' }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"></path>
              </svg>
            </button>

            <transition name="desktop-dropdown">
              <div
                v-if="desktopDropdown === 'profile'"
                class="desktop-dropdown dropdown-end profile-dropdown"
                @click.stop
              >
                <div class="dropdown-title">{{ nt('more') }}</div>

                <router-link
                  v-for="l in profileLinks"
                  :key="l.to"
                  :to="l.to"
                  class="dropdown-link compact"
                  @click="closeDesktopDropdown"
                >
                  <span class="dropdown-icon" :class="l.color">
                    <svg class="ico" viewBox="0 0 24 24" v-html="l.svg"></svg>
                  </span>
                  <span class="dropdown-copy"><strong>{{ nt(l.key) }}</strong></span>
                </router-link>

                <div v-if="profileLinks.length" class="dropdown-divider"></div>

                <router-link :to="`${BASE}/profile`" class="dropdown-link compact" @click="closeDesktopDropdown">
                  <span class="dropdown-icon neutral">
                    <svg class="ico" viewBox="0 0 24 24" v-html="ICON.profile"></svg>
                  </span>
                  <span class="dropdown-copy"><strong>{{ nt('profile') }}</strong></span>
                </router-link>

                <router-link :to="`${BASE}/settings`" class="dropdown-link compact" @click="closeDesktopDropdown">
                  <span class="dropdown-icon neutral">
                    <svg class="ico" viewBox="0 0 24 24" v-html="ICON.settings"></svg>
                  </span>
                  <span class="dropdown-copy"><strong>{{ nt('settings') }}</strong></span>
                </router-link>

                <router-link :to="`${BASE}/help`" class="dropdown-link compact" @click="closeDesktopDropdown">
                  <span class="dropdown-icon neutral">
                    <svg class="ico" viewBox="0 0 24 24" v-html="ICON.help"></svg>
                  </span>
                  <span class="dropdown-copy"><strong>{{ nt('help') }}</strong></span>
                </router-link>

                <div class="dropdown-divider"></div>

                <button type="button" class="dropdown-link compact logout-link" @click="handleLogout">
                  <span class="dropdown-icon red">
                    <svg class="ico" viewBox="0 0 24 24" v-html="ICON.logout"></svg>
                  </span>
                  <span class="dropdown-copy"><strong>{{ nt('logout') }}</strong></span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <!-- =====================================================
         CONTENIDO GENERAL
    ====================================================== -->
    <div class="main-layout-container">

      <!-- TOP NAV MÓVIL: sucursal + QR + notificaciones -->
      <nav class="mobile-top-nav">
        <button type="button" class="mobile-branch" @click="toggleSheet('branch')">
          <span class="mobile-branch-icon">
            <svg class="ico" viewBox="0 0 24 24" v-html="ICON.pin"></svg>
          </span>
          <span class="mobile-branch-copy">
            <strong>{{ selectedGym }}</strong>
            <small>{{ nt('currentBranch') }}</small>
          </span>
          <svg class="mobile-branch-chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
        </button>

        <div class="nav-right">
          <button
            type="button"
            class="nav-action-btn"
            @click="activeModal = 'qr'"
            :title="t.qrGimnasio"
            :aria-label="t.qrGimnasio || 'QR'"
          >
            <svg viewBox="0 0 24 24" class="mobile-svg-icon">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"></path>
              <path d="M14 14h2v2h-2zM18 14h2v6h-6v-2"></path>
            </svg>
          </button>

          <button
            type="button"
            class="nav-action-btn notification"
            @click="isNotificationsOpen = true"
            :title="t.notificaciones"
            :aria-label="t.notificaciones || 'Notificaciones'"
          >
            <span v-if="unreadNotifications > 0" class="mobile-notification-dot"></span>
            <svg viewBox="0 0 24 24" class="mobile-svg-icon">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
              <path d="M10 21h4"></path>
            </svg>
          </button>
        </div>
      </nav>

      <main class="main-content-wrapper" :class="{ 'nav-collapsed': navHidden }">
        <slot />
      </main>
    </div>

    <!-- =====================================================
         BARRA INFERIOR MÓVIL
         Se puede ocultar hacia abajo (botón flecha o deslizando)
    ====================================================== -->
    <nav
      class="bottom-nav"
      :class="{ 'is-hidden': navHidden }"
      :aria-label="nt('mainNavigation')"
      @touchstart.passive="onNavTouchStart"
      @touchend.passive="onNavTouchEnd"
    >

      <router-link
        :to="`${BASE}/dashboard`"
        class="tab"
        :class="{ on: isTabOn('home') }"
        @click="closeSheet"
      >
        <svg class="ico" viewBox="0 0 24 24" v-html="ICON.home"></svg>
        <span>{{ nt('home') }}</span>
      </router-link>

      <button
        type="button"
        class="tab"
        :class="{ on: isTabOn('health') }"
        @click="toggleSheet('health')"
      >
        <svg class="ico" viewBox="0 0 24 24" v-html="ICON.health"></svg>
        <span>{{ nt('tabHealth') }}</span>
      </button>

      <!-- BOTÓN CENTRAL: RUTINAS -->
      <button
        type="button"
        class="tab tab-center"
        :class="{ on: isTabOn('routines') }"
        @click="toggleSheet('routines')"
      >
        <span class="fab">
          <svg class="ico" viewBox="0 0 24 24" v-html="ICON.routines"></svg>
        </span>
        <span>{{ nt('routines') }}</span>
      </button>

      <button
        type="button"
        class="tab"
        :class="{ on: isTabOn('payments') }"
        @click="toggleSheet('payments')"
      >
        <svg class="ico" viewBox="0 0 24 24" v-html="ICON.payments"></svg>
        <span>{{ nt('tabPayments') }}</span>
      </button>

      <button
        type="button"
        class="tab"
        :class="{ on: isTabOn('more') }"
        @click="toggleSheet('more')"
      >
        <svg class="ico" viewBox="0 0 24 24"><path d="M4 7h16M4 12h9M4 17h9M17 14v6M14 17h6" /></svg>
        <span>{{ nt('more') }}</span>
      </button>
    </nav>

    <!-- BOTÓN PARA OCULTAR / MOSTRAR LA BARRA INFERIOR (solo móvil) -->
    <button
      type="button"
      class="nav-toggle"
      :class="{ collapsed: navHidden }"
      :aria-expanded="!navHidden"
      :aria-label="navHidden ? nt('showMenu') : nt('hideMenu')"
      @click="toggleBottomNav"
    >
      <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
    </button>

    <!-- =====================================================
         HOJAS INFERIORES (móvil)
    ====================================================== -->
    <transition name="sheet">
      <div v-if="mobileSheet" class="sheet-overlay" @click.self="closeSheet">
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="sheet-handle"></div>

          <!-- GRUPOS: Rutinas, Salud y Nutrición, Membresía y Pagos -->
          <template v-if="groupsById[mobileSheet]">
            <h3 class="sheet-title">{{ nt(groupsById[mobileSheet].key) }}</h3>

            <router-link
              v-for="l in groupsById[mobileSheet].items"
              :key="l.to"
              :to="l.to"
              class="sheet-link"
              @click="closeSheet"
            >
              <span class="dropdown-icon" :class="l.color">
                <svg class="ico" viewBox="0 0 24 24" v-html="l.svg"></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ nt(l.key) }}</strong>
              </span>
            </router-link>
          </template>

          <!-- GIMNASIO ACTUAL -->
          <template v-else-if="mobileSheet === 'branch'">
            <h3 class="sheet-title">{{ nt('myGyms') }}</h3>

            <button
              v-for="gym in gyms"
              :key="gym"
              type="button"
              class="sheet-link branch"
              :class="{ selected: selectedGym === gym }"
              @click="selectGym(gym)"
            >
              <span class="dropdown-icon blue">
                <svg class="ico" viewBox="0 0 24 24" v-html="ICON.pin"></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ gym }}</strong>
                <small>{{ selectedGym === gym ? nt('selectedGym') : nt('switchGym') }}</small>
              </span>
              <svg v-if="selectedGym === gym" class="sheet-check" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <div class="sheet-divider"></div>

            <router-link :to="`${BASE}/gyms`" class="sheet-link" @click="closeSheet">
              <span class="dropdown-icon neutral">
                <svg class="ico" viewBox="0 0 24 24" v-html="ICON.gyms"></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ nt('gymsAndVenues') }}</strong>
              </span>
            </router-link>
          </template>

          <!-- MÁS -->
          <template v-else-if="mobileSheet === 'more'">
            <h3 class="sheet-title">{{ nt('more') }}</h3>

            <router-link
              v-for="l in moreLinks"
              :key="l.to"
              :to="l.to"
              class="sheet-link"
              @click="closeSheet"
            >
              <span class="dropdown-icon" :class="l.color">
                <svg class="ico" viewBox="0 0 24 24" v-html="l.svg"></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ nt(l.key) }}</strong>
              </span>
            </router-link>

            <div class="sheet-divider"></div>

            <div class="sheet-grid">
              <router-link :to="`${BASE}/profile`" class="sheet-tile" @click="closeSheet">
                <span class="dropdown-icon neutral">
                  <svg class="ico" viewBox="0 0 24 24" v-html="ICON.profile"></svg>
                </span>
                <strong>{{ nt('profile') }}</strong>
              </router-link>

              <router-link :to="`${BASE}/settings`" class="sheet-tile" @click="closeSheet">
                <span class="dropdown-icon neutral">
                  <svg class="ico" viewBox="0 0 24 24" v-html="ICON.settings"></svg>
                </span>
                <strong>{{ nt('settings') }}</strong>
              </router-link>

              <router-link :to="`${BASE}/help`" class="sheet-tile" @click="closeSheet">
                <span class="dropdown-icon neutral">
                  <svg class="ico" viewBox="0 0 24 24" v-html="ICON.help"></svg>
                </span>
                <strong>{{ nt('help') }}</strong>
              </router-link>

              <button type="button" class="sheet-tile danger" @click="handleLogout">
                <span class="dropdown-icon red">
                  <svg class="ico" viewBox="0 0 24 24" v-html="ICON.logout"></svg>
                </span>
                <strong>{{ nt('logout') }}</strong>
              </button>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <!-- =====================================================
         MODAL QR
    ====================================================== -->
    <transition name="pop">
      <div
        v-if="activeModal === 'qr'"
        class="modal-wrapper"
        @click.self="activeModal = null"
      >
        <div class="custom-panel">
          <div class="panel-header">
            <div>
              <span class="modal-kicker">GYMPRO</span>
              <h3>{{ t.codigoQrAcceso }}</h3>
            </div>

            <button type="button" class="close-panel" @click="activeModal = null">
              &times;
            </button>
          </div>

          <div class="panel-body">
            <div class="qr-container">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ULTRAFITNESS"
                alt="QR Code"
              />
            </div>

            <p>{{ t.muestraCodigoAsistencia }}</p>

            <button type="button" class="action-btn-full">
              {{ t.descargarImprimir }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- NOTIFICACIONES -->
    <NotificationsPanel
      :is-open="isNotificationsOpen"
      :notifications="notifications"
      @close="isNotificationsOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NotificationsPanel from './Notifications/NotificationsPanel.vue';
import { traducciones } from './i18n.js';
import { useLang } from './useLang.js';

const router = useRouter();
const route = useRoute();
const { lang } = useLang();

/* Prefijo de las rutas del miembro (igual que en Sidebar.vue) */
const BASE = '/Member';

/* =========================================================
   ICONOS (los mismos del Sidebar, estilo trazo)
========================================================= */

const ICON = {
  pin: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/>',
  profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  gyms: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  routines: '<path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M4 6.5V4h3v2.5M17 6.5V4h3v2.5M4 17.5V20h3v-2.5M17 17.5V20h3v-2.5"/>',
  health: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  classes: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  statistics: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  payments: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',

  explore: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  myRoutines: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>',
  nutrition: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  receipt: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'
};

/* =========================================================
   ICONOS DE LA BARRA SUPERIOR (rellenos, como en el menú del propietario)
========================================================= */

const NAV_ICON = {
  /* casa */
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  /* edificio: gimnasios y sedes */
  gyms: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
  /* mancuerna: rutinas */
  routines: 'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z',
  /* corazón: salud y nutrición */
  health: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  /* tarjeta de membresía: membresía y pagos */
  payments: 'M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z',
  /* personas: clases y reservas */
  classes: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  /* persona: entrenadores */
  trainers: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  /* barras: estadísticas */
  statistics: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z'
};

/* =========================================================
   SECCIONES DEL MIEMBRO (idénticas a Sidebar.vue)
========================================================= */

const menu = [
  { type: 'link', key: 'home', to: `${BASE}/dashboard`, svg: ICON.home, navIcon: NAV_ICON.home },
  { type: 'link', key: 'gymsAndVenues', to: `${BASE}/gyms`, svg: ICON.gyms, navIcon: NAV_ICON.gyms, color: 'blue' },
  {
    type: 'group', id: 'routines', key: 'routines', svg: ICON.routines, navIcon: NAV_ICON.routines,
    items: [
      { to: `${BASE}/routines`, key: 'exploreRoutines', svg: ICON.explore, color: 'blue' },
      { to: `${BASE}/my-routines`, key: 'myRoutines', svg: ICON.myRoutines, color: 'purple' },
      { to: `${BASE}/trainer-routines`, key: 'trainerRoutines', svg: ICON.classes, color: 'blue' }
    ]
  },
  {
    type: 'group', id: 'health', key: 'healthAndNutrition', svg: ICON.health, navIcon: NAV_ICON.health,
    items: [
      { to: `${BASE}/body-calculator`, key: 'bodyCalculator', svg: ICON.calculator, color: 'blue' },
      { to: `${BASE}/nutrition-plan`, key: 'nutritionPlan', svg: ICON.nutrition, color: 'purple' }
    ]
  },
  { type: 'link', key: 'classesAndBookings', to: `${BASE}/classes`, svg: ICON.classes, navIcon: NAV_ICON.classes, color: 'purple' },
  { type: 'link', key: 'trainers', to: `${BASE}/trainers`, svg: ICON.profile, navIcon: NAV_ICON.trainers, color: 'green' },
  { type: 'link', key: 'statistics', to: `${BASE}/statistics`, svg: ICON.statistics, navIcon: NAV_ICON.statistics, color: 'orange' },
  {
    type: 'group', id: 'payments', key: 'membershipAndPayments', svg: ICON.payments, navIcon: NAV_ICON.payments,
    items: [
      { to: `${BASE}/membership`, key: 'membershipStatus', svg: ICON.star, color: 'blue' },
      { to: `${BASE}/payments-history`, key: 'paymentsHistory', svg: ICON.receipt, color: 'purple' }
    ]
  }
];

const groupsById = Object.fromEntries(
  menu.filter((m) => m.type === 'group').map((g) => [g.id, g])
);

const menuByKey = Object.fromEntries(menu.map((m) => [m.key, m]));

/* Enlaces que en móvil van dentro de "Más" */
const moreLinks = menu.filter((m) => m.type === 'link' && m.key !== 'home');

/*
  Escritorio (barra superior): Inicio, Clases y Reservas,
  Entrenadores, Estadísticas y Membresía y Pagos.
*/
const desktopMenu = [
  menuByKey.home,
  menuByKey.classesAndBookings,
  menuByKey.trainers,
  menuByKey.statistics,
  menuByKey.membershipAndPayments
];

/*
  Panel del perfil: sin enlaces extra. Rutinas y Salud y Nutrición ya no
  se muestran en escritorio. Gimnasios y Sedes sigue en el menú de sucursal.
*/
const profileLinks = [];

/* =========================================================
   TEXTOS DEL MENÚ (los mismos del Sidebar + algunos de apoyo)
========================================================= */

const navLang = {
  es: {
    currentBranch: 'Sucursal Actual',
    myGyms: 'Mis gimnasios',
    selectedGym: 'Gimnasio seleccionado',
    switchGym: 'Cambiar a este gimnasio',
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
    logout: 'Cerrar Sesión',
    /* de apoyo para la barra inferior móvil */
    tabHealth: 'Salud',
    tabPayments: 'Pagos',
    more: 'Más',
    mainNavigation: 'Navegación principal',
    showMenu: 'Mostrar menú',
    hideMenu: 'Ocultar menú'
  },
  en: {
    currentBranch: 'Current Branch',
    myGyms: 'My gyms',
    selectedGym: 'Selected gym',
    switchGym: 'Switch to this gym',
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
    logout: 'Log Out',
    tabHealth: 'Health',
    tabPayments: 'Payments',
    more: 'More',
    mainNavigation: 'Main navigation',
    showMenu: 'Show menu',
    hideMenu: 'Hide menu'
  }
};

/* =========================================================
   ESTADOS GENERALES
========================================================= */

const isNotificationsOpen = ref(false);

const activeModal = ref(null);
const desktopDropdown = ref(null);

/* Hoja inferior móvil: null | 'routines' | 'health' | 'payments' | 'more' */
const mobileSheet = ref(null);

/*
  Gimnasios en los que el miembro está inscrito.
  Reemplaza esta lista por la real (por ejemplo, la que regrese tu API).
*/
const GYM_KEY = 'member-selected-gym';

const gyms = ref(['Gimnasio Principal', 'Sucursal Secundaria']);

const savedGym = localStorage.getItem(GYM_KEY);

const selectedGym = ref(
  gyms.value.includes(savedGym) ? savedGym : gyms.value[0]
);

const selectGym = (gym) => {
  selectedGym.value = gym;
  localStorage.setItem(GYM_KEY, gym);

  /* Para que las páginas puedan recargar sus datos al cambiar de gimnasio */
  window.dispatchEvent(new CustomEvent('gym-changed', { detail: { gym } }));

  closeDesktopDropdown();
  closeSheet();
};

const notifications = ref([
  {
    id: 1,
    title: 'Sistema',
    message: 'Bienvenido',
    time: 'ahora',
    read: false
  }
]);

/* =========================================================
   PERFIL (datos de prueba: reemplázalos por los reales)
========================================================= */

const memberName = 'Carlos Martínez';

const memberInitials = computed(() =>
  memberName
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
);

/* =========================================================
   IDIOMA
========================================================= */

const idiomaActual = ref(
  localStorage.getItem('member-idioma') || lang.value || 'es'
);

/* Traducciones generales (QR, notificaciones, etc.) */
const t = computed(() => {
  return traducciones[idiomaActual.value] || traducciones.es || {};
});

/* Traducciones del menú */
const nt = (key) => {
  const table = navLang[idiomaActual.value] || navLang.es;
  return table[key] || navLang.es[key] || key;
};

/* Escucha tanto 'idioma-changed' como 'language-changed' */
const handleIdiomaChanged = (event) => {
  const nuevo = event?.detail?.idioma || localStorage.getItem('member-idioma');

  if (nuevo) {
    idiomaActual.value = nuevo;
  }
};

/* =========================================================
   NOTIFICACIONES
========================================================= */

const unreadNotifications = computed(() => {
  return notifications.value.filter((n) => !n.read).length;
});

/* =========================================================
   GRUPO ACTIVO (resalta el menú cuando estás en una de sus páginas)
========================================================= */

const isGroupActive = (id) =>
  (groupsById[id]?.items || []).some((item) => route.path.startsWith(item.to));

/* Resalta el avatar cuando estás en una página que vive en su panel */
const isProfileMenuActive = computed(() => {
  const path = route.path;

  return (
    profileLinks.some((l) => path.startsWith(l.to)) ||
    path.startsWith(`${BASE}/profile`) ||
    path.startsWith(`${BASE}/settings`) ||
    path.startsWith(`${BASE}/help`)
  );
});

/* =========================================================
   BARRA INFERIOR MÓVIL
========================================================= */

/* Pestaña que corresponde a la página actual */
const activeTab = computed(() => {
  const path = route.path;

  if (path.startsWith(`${BASE}/dashboard`)) return 'home';

  for (const id of Object.keys(groupsById)) {
    if (isGroupActive(id)) return id;
  }

  if (
    moreLinks.some((l) => path.startsWith(l.to)) ||
    path.startsWith(`${BASE}/profile`) ||
    path.startsWith(`${BASE}/settings`) ||
    path.startsWith(`${BASE}/help`)
  ) {
    return 'more';
  }

  return '';
});

/* Si hay una hoja abierta, se resalta esa pestaña; si no, la de la página */
const isTabOn = (name) =>
  mobileSheet.value ? mobileSheet.value === name : activeTab.value === name;

const toggleSheet = (name) => {
  desktopDropdown.value = null;
  mobileSheet.value = mobileSheet.value === name ? null : name;
};

const closeSheet = () => {
  mobileSheet.value = null;
};

/* Bloquea el scroll del fondo mientras la hoja está abierta */
watch(mobileSheet, (value) => {
  document.body.style.overflow = value ? 'hidden' : '';
});

/* ---------- Ocultar / mostrar la barra inferior ---------- */

const NAV_HIDDEN_KEY = 'member-nav-hidden';

const navHidden = ref(localStorage.getItem(NAV_HIDDEN_KEY) === '1');

const setNavHidden = (value) => {
  navHidden.value = value;
  localStorage.setItem(NAV_HIDDEN_KEY, value ? '1' : '0');

  /* Al ocultar la barra se cierra cualquier hoja abierta */
  if (value) {
    closeSheet();
  }
};

const toggleBottomNav = () => setNavHidden(!navHidden.value);

/* Deslizar hacia abajo sobre la barra para ocultarla */
let touchStartY = 0;

const onNavTouchStart = (event) => {
  touchStartY = event.touches[0].clientY;
};

const onNavTouchEnd = (event) => {
  const deltaY = event.changedTouches[0].clientY - touchStartY;

  if (deltaY > 40) {
    setNavHidden(true);
  }
};

/* =========================================================
   DROPDOWNS DESKTOP
========================================================= */

const toggleDesktopDropdown = (name) => {
  desktopDropdown.value = desktopDropdown.value === name ? null : name;
};

const closeDesktopDropdown = () => {
  desktopDropdown.value = null;
};

/* =========================================================
   CERRAR MENÚ AL HACER CLICK AFUERA
========================================================= */

const handleDocumentClick = (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  if (!target.closest('.nav-dropdown-root')) {
    closeDesktopDropdown();
  }
};

/* =========================================================
   ESC
========================================================= */

const handleKeydown = (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  closeDesktopDropdown();
  closeSheet();
  activeModal.value = null;
};

/* =========================================================
   RESIZE
========================================================= */

const handleResize = () => {
  if (window.innerWidth >= 900) {
    closeSheet();
  } else {
    closeDesktopDropdown();
  }
};

/* =========================================================
   LOGOUT
========================================================= */

const handleLogout = () => {
  localStorage.removeItem('user_role');
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  closeDesktopDropdown();
  closeSheet();

  router.replace({ name: 'login' });
};

/* =========================================================
   ESTILOS GLOBALES
========================================================= */

const aplicarEstilosGlobales = () => {
  let savedColors = null;

  try {
    savedColors = JSON.parse(localStorage.getItem('app-colors') || 'null');
  } catch {
    savedColors = null;
  }

  const savedRadius = localStorage.getItem('app-radius');
  const savedDensidad = localStorage.getItem('app-densidad');

  const root = document.documentElement;

  if (savedColors) {
    if (savedColors.headingBg) {
      root.style.setProperty('--color-heading-bg', savedColors.headingBg);
    }

    if (savedColors.tablas) {
      root.style.setProperty('--color-tablas', savedColors.tablas);
    }

    if (savedColors.interfaz) {
      root.style.setProperty('--color-interfaz', savedColors.interfaz);
      root.style.setProperty('--bg-custom', savedColors.interfaz);
    }

    if (savedColors.botones) {
      root.style.setProperty('--color-botones', savedColors.botones);
    }

    if (savedColors.tarjetas) {
      root.style.setProperty('--bg-cards', savedColors.tarjetas);
    }

    if (savedColors.titulos) {
      root.style.setProperty('--color-titulos', savedColors.titulos);
    }

    if (savedColors.highlight) {
      root.style.setProperty('--color-highlight', savedColors.highlight);
    }

    if (savedColors.etiquetas) {
      root.style.setProperty('--color-etiquetas', savedColors.etiquetas);
    }

    if (savedColors.textoGeneral) {
      root.style.setProperty('--color-texto-general', savedColors.textoGeneral);
    }

    if (savedColors.textoBotones) {
      root.style.setProperty('--color-texto-botones', savedColors.textoBotones);
    }

    if (savedColors.svgColor) {
      root.style.setProperty('--color-svg', savedColors.svgColor);
    }
  }

  if (savedRadius) {
    root.style.setProperty('--app-border-radius', savedRadius);
  }

  if (savedDensidad === 'compacto') {
    root.style.setProperty('--panel-padding', '16px');
    root.style.setProperty('--row-padding', '10px 0');
  } else if (savedDensidad === 'espacioso') {
    root.style.setProperty('--panel-padding', '38px');
    root.style.setProperty('--row-padding', '22px 0');
  } else {
    root.style.setProperty('--panel-padding', '30px');
    root.style.setProperty('--row-padding', '16px 0');
  }
};

/* =========================================================
   CICLO DE VIDA
========================================================= */

onMounted(() => {
  aplicarEstilosGlobales();

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
  window.addEventListener('app-settings-updated', aplicarEstilosGlobales);
  window.addEventListener('idioma-changed', handleIdiomaChanged);
  window.addEventListener('language-changed', handleIdiomaChanged);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('app-settings-updated', aplicarEstilosGlobales);
  window.removeEventListener('idioma-changed', handleIdiomaChanged);
  window.removeEventListener('language-changed', handleIdiomaChanged);

  document.body.style.overflow = '';
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap');

/* =========================================================
   BASE
========================================================= */

* {
  box-sizing: border-box;
}

.app-wrapper {
  --nav-height: 72px;
  --bottom-nav-h: 70px;
  --nav-line: rgba(255, 255, 255, 0.09);
  --hover-bg: rgba(255, 255, 255, 0.07);
  --accent: var(--color-highlight, #3b82f6);
  --button: var(--color-botones, #2563eb);
  --card: var(--bg-cards, #101317);
  --text: var(--color-texto-general, #f8fafc);
  --title: var(--color-titulos, #ffffff);
  --muted: var(--color-etiquetas, #8b98aa);
  --line: rgba(255, 255, 255, 0.08);

  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background: var(--bg-custom, #090b0e);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  transition: background-color .25s ease;
}

/* Ocultos por defecto; cada breakpoint activa los suyos */
.desktop-navbar,
.bottom-nav,
.nav-toggle {
  display: none;
}

/* Iconos de trazo (los mismos del sidebar) */
.ico {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   LAYOUT
========================================================= */

.main-layout-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* =========================================================
   ICONOS Y TEXTOS COMPARTIDOS (dropdowns de escritorio y hojas móviles)
========================================================= */

.dropdown-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.dropdown-icon .ico {
  width: 18px;
  height: 18px;
}

.dropdown-icon.blue { color: #60a5fa; background: rgba(59, 130, 246, 0.14); }
.dropdown-icon.purple { color: #c084fc; background: rgba(168, 85, 247, 0.14); }
.dropdown-icon.green { color: #34d399; background: rgba(16, 185, 129, 0.14); }
.dropdown-icon.orange { color: #fb923c; background: rgba(249, 115, 22, 0.14); }
.dropdown-icon.red { color: #f87171; background: rgba(239, 68, 68, 0.14); }
.dropdown-icon.neutral { color: var(--muted); background: rgba(255, 255, 255, 0.06); }

.dropdown-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.dropdown-copy strong {
  max-width: 100%;
  overflow: hidden;
  color: inherit;
  font-size: 0.9rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  margin: 6px 8px;
  background: var(--nav-line);
}

.logout-link { color: #f87171; }

/* =========================================================
   TOP NAV MÓVIL
========================================================= */

.mobile-top-nav {
  min-height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  background: var(--color-heading-bg, #0c1118);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-branch {
  min-width: 0;
  max-width: calc(100% - 100px);
  height: 46px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px 0 6px;
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 12px;
  background: rgba(255, 255, 255, .035);
  color: var(--title);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.mobile-branch-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: var(--muted);
}

.dropdown-copy small {
  max-width: 100%;
  margin-top: 2px;
  overflow: hidden;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--accent);
}

.mobile-branch-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent);
}

.mobile-branch-icon .ico {
  width: 16px;
  height: 16px;
}

.mobile-branch-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.mobile-branch-copy strong {
  max-width: 100%;
  overflow: hidden;
  font-size: .82rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-branch-copy small {
  color: var(--muted);
  font-size: .68rem;
  font-weight: 500;
}

.nav-action-btn {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 11px;
  background: rgba(255, 255, 255, .035);
  color: var(--color-svg, #f8fafc);
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease, color .18s ease;
}

.nav-action-btn:hover {
  background: rgba(255, 255, 255, .075);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  color: var(--accent);
}

.mobile-svg-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mobile-notification-dot {
  width: 7px;
  height: 7px;
  position: absolute;
  top: 7px;
  right: 7px;
  border: 2px solid var(--color-heading-bg, #0c1118);
  border-radius: 50%;
  background: var(--accent);
}

/* =========================================================
   BARRA INFERIOR MÓVIL
========================================================= */

.bottom-nav {
  height: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom));
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2600;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: 0 8px env(safe-area-inset-bottom);
  border-top: 1px solid var(--nav-line);
  border-radius: 26px 26px 0 0;
  background: color-mix(in srgb, var(--card) 94%, transparent);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow: 0 -12px 34px rgba(0, 0, 0, .4);
  transition: transform .3s cubic-bezier(.32, .72, 0, 1);
}

/* Barra oculta: baja fuera de pantalla.
   +40px para que también se esconda el botón central flotante */
.bottom-nav.is-hidden {
  transform: translateY(calc(100% + 40px));
  pointer-events: none;
}

.tab {
  height: var(--bottom-nav-h);
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-family: 'Inter', sans-serif;
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .1px;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color .18s ease;
}

.tab > span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab > .ico {
  width: 25px;
  height: 25px;
  stroke-width: 1.9;
  transition: transform .18s ease, filter .18s ease;
}

.tab:active > .ico {
  transform: scale(.88);
}

/* Barrita superior de la pestaña activa */
.tab::before {
  content: '';
  width: 36px;
  height: 4px;
  position: absolute;
  top: -1px;
  left: 50%;
  border-radius: 0 0 5px 5px;
  background: var(--accent);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 70%, transparent);
  transform: translateX(-50%) scaleX(0);
  transition: transform .22s ease;
}

.tab.on {
  color: var(--accent);
}

.tab.on::before {
  transform: translateX(-50%) scaleX(1);
}

.tab.on > .ico {
  filter: drop-shadow(0 0 7px color-mix(in srgb, var(--accent) 60%, transparent));
}

/* Botón central flotante */
.tab-center {
  justify-content: flex-end;
  padding-bottom: 15px;
  color: var(--text);
}

.tab-center.on {
  color: var(--accent);
}

.fab {
  width: 64px;
  height: 64px;
  position: absolute;
  top: -30px;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--button) 78%, white),
    var(--button) 65%
  );
  color: var(--color-texto-botones, #fff);
  box-shadow:
    0 10px 26px color-mix(in srgb, var(--button) 60%, transparent),
    0 0 0 6px var(--card);
  transform: translateX(-50%);
  transition: transform .18s ease, box-shadow .18s ease;
}

.fab .ico {
  width: 28px;
  height: 28px;
  stroke-width: 1.9;
}

.tab-center:active .fab {
  transform: translateX(-50%) scale(.93);
}

.tab-center.on .fab {
  box-shadow:
    0 12px 30px color-mix(in srgb, var(--button) 75%, transparent),
    0 0 0 6px var(--card),
    0 0 0 8px color-mix(in srgb, var(--button) 45%, transparent);
}

/* ---------- Botón para ocultar / mostrar la barra ---------- */

.nav-toggle {
  width: 38px;
  height: 20px;
  position: fixed;
  left: 12px;
  bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 6px);
  z-index: 2650;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--nav-line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--card) 94%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: var(--muted);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .4);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: bottom .3s cubic-bezier(.32, .72, 0, 1), color .18s ease;
}

.nav-toggle svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  transition: transform .25s ease;
}

.nav-toggle:active {
  color: var(--accent);
}

/* Barra oculta: el botón baja al borde y la flecha apunta hacia arriba */
.nav-toggle.collapsed {
  bottom: calc(env(safe-area-inset-bottom) + 8px);
}

.nav-toggle.collapsed svg {
  transform: rotate(180deg);
}

/* =========================================================
   HOJAS INFERIORES (móvil)
========================================================= */

.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 2800;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, .62);
}

.sheet {
  width: 100%;
  max-height: 82dvh;
  overflow-y: auto;
  padding: 10px 14px calc(18px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  border-radius: 24px 24px 0 0;
  background: var(--card);
  box-shadow: 0 -20px 50px rgba(0, 0, 0, .45);
  overscroll-behavior: contain;
}

.sheet-handle {
  width: 38px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .16);
}

.sheet-title {
  margin: 0 0 8px;
  padding: 0 6px 10px;
  border-bottom: 1px solid var(--nav-line);
  color: var(--muted);
  font-size: .82rem;
  font-weight: 600;
}

.sheet-link {
  width: 100%;
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 8px 8px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background .14s ease;
}

.sheet-link:active,
.sheet-link:hover {
  background: var(--hover-bg);
}

.sheet-link.router-link-active,
.sheet-link.selected {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: color-mix(in srgb, var(--accent) 70%, white);
}

/* Flecha que indica que la fila abre una página */
.sheet-link:not(.branch)::after {
  content: '›';
  margin-left: auto;
  color: var(--muted);
  font-size: 1.5rem;
  line-height: 1;
}

.sheet-link .dropdown-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
}

/* Cuadrícula de accesos rápidos en "Más" */
.sheet-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 4px 2px 0;
}

.sheet-tile {
  min-height: 92px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255, 255, 255, .03);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background .14s ease, border-color .14s ease;
}

.sheet-tile strong {
  font-size: .84rem;
  font-weight: 650;
}

.sheet-tile:active,
.sheet-tile:hover {
  background: var(--hover-bg);
}

.sheet-tile.router-link-active {
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.sheet-tile.danger {
  border-color: rgba(239, 68, 68, .22);
  background: rgba(239, 68, 68, .07);
  color: #f87171;
}

.sheet-divider {
  height: 1px;
  margin: 6px 8px;
  background: var(--nav-line);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity .22s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform .26s cubic-bezier(.32, .72, 0, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}

/* =========================================================
   MODAL QR
========================================================= */

.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, .82);
}

.custom-panel {
  width: min(440px, 100%);
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 18px;
  background: var(--bg-cards, #111419);
  color: var(--text);
  box-shadow: 0 30px 70px rgba(0, 0, 0, .55);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.modal-kicker {
  display: block;
  margin-bottom: 4px;
  color: var(--accent);
  font-size: .58rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.panel-header h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-panel {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 9px;
  background: rgba(255, 255, 255, .04);
  color: var(--text);
  font-size: 1.45rem;
  cursor: pointer;
  transition: background .17s ease, color .17s ease;
}

.close-panel:hover {
  background: rgba(239, 68, 68, .12);
  color: #f87171;
}

.panel-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}

.panel-body p {
  margin: 0;
  color: var(--muted);
  font-size: .83rem;
  line-height: 1.6;
}

.qr-container {
  padding: 13px;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 14px 30px rgba(0, 0, 0, .3);
}

.qr-container img {
  width: 180px;
  height: 180px;
  display: block;
}

.action-btn-full {
  width: 100%;
  min-height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  background: var(--button);
  color: var(--color-texto-botones, #fff);
  font-family: 'Inter', sans-serif;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform .17s ease, filter .17s ease;
}

.action-btn-full:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

/* =========================================================
   DESKTOP >= 900
   (900 y no 1024, porque el "modo escritorio" de los
   navegadores móviles simula una pantalla de ~980px)
========================================================= */

@media (min-width: 900px) {

  .mobile-top-nav,
  .bottom-nav,
  .nav-toggle,
  .sheet-overlay {
    display: none !important;
  }

  /* ---------- NAVBAR (grid: sucursal | menú | acciones) ---------- */

  .desktop-navbar {
    width: 100%;
    height: var(--nav-height);
    position: sticky;
    top: 0;
    z-index: 2500;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--nav-line);
    background: var(--color-heading-bg, #08192e);
  }

  .desktop-navbar-inner {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 0 clamp(18px, 2.3vw, 40px);
  }

  /* ---------- SUCURSAL (izquierda; solo icono en pantallas medianas) ---------- */

  .desktop-brand {
    min-width: 0;
    max-width: 60px;
    position: relative;
    justify-self: start;
  }

  .brand-button {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: background 0.16s ease, border-color 0.16s ease;
  }

  .brand-button:hover,
  .brand-button.active {
    border-color: var(--nav-line);
    background: var(--hover-bg);
  }

  .brand-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .brand-chevron {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: none;
    fill: var(--muted);
    transition: transform 0.17s ease;
  }

  .brand-chevron.rotated { transform: rotate(180deg); }

  .branch-menu { width: 290px; }

  .dropdown-link.selected {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: color-mix(in srgb, var(--accent) 70%, white);
  }

  .option-check {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--accent);
  }

  .brand-mark {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: var(--accent);
  }

  .brand-mark .ico {
    width: 18px;
    height: 18px;
  }

  .brand-copy {
    min-width: 0;
    flex: 1;
    display: none;
    flex-direction: column;
    align-items: flex-start;
  }

  .brand-copy strong {
    width: 100%;
    overflow: hidden;
    color: var(--title);
    font-size: 0.88rem;
    font-weight: 700;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .brand-copy span {
    margin-top: 2px;
    display: none;
    color: var(--muted);
    font-size: 0.74rem;
    font-weight: 500;
  }

  /* ---------- MENÚ CENTRAL ---------- */

  .desktop-menu {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
  }

  /* Divisor fino entre el menú y los botones de la derecha */
  .desktop-menu::after {
    content: '';
    width: 1px;
    height: 28px;
    flex-shrink: 0;
    margin: 0 4px 0 8px;
    background: var(--nav-line);
  }

  .desktop-nav-group {
    position: relative;
    flex-shrink: 0;
  }

  .desktop-nav-item {
    min-width: 0;
    flex-shrink: 0;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 9px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: color-mix(in srgb, var(--text) 78%, transparent);
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }

  /* Iconos de las secciones (rellenos). Se muestran desde 1280 px */
  .desktop-nav-item > .nav-ico {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: none;
    fill: currentColor;
  }

  .desktop-nav-item:hover,
  .desktop-nav-item.active {
    color: #fff;
    background: var(--hover-bg);
  }

  .desktop-nav-item.router-link-active,
  .desktop-nav-item.current {
    border-color: color-mix(in srgb, var(--accent) 35%, transparent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: color-mix(in srgb, var(--accent) 65%, white);
  }

  .nav-chevron {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    fill: currentColor;
    opacity: 0.6;
    transition: transform 0.17s ease;
  }

  .nav-chevron.rotated { transform: rotate(180deg); }

  .desktop-nav-item:focus-visible,
  .desktop-action:focus-visible,
  .desktop-profile:focus-visible,
  .dropdown-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* ---------- DROPDOWNS ---------- */

  .nav-dropdown-root { position: relative; }

  .desktop-dropdown {
    width: 280px;
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 2700;
    padding: 8px;
    border: 1px solid var(--nav-line);
    border-radius: 14px;
    background: var(--bg-cards, #101419);
    box-shadow: 0 22px 55px rgba(0, 0, 0, 0.5);
  }

  /* Los menús de la derecha se abren hacia la izquierda */
  .desktop-dropdown.dropdown-end {
    right: 0;
    left: auto;
  }

  .profile-dropdown { width: 270px; }

  .dropdown-title {
    padding: 8px 10px 11px;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--nav-line);
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .dropdown-link {
    width: 100%;
    min-height: 54px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.14s ease, color 0.14s ease;
  }

  .dropdown-link:hover { background: var(--hover-bg); }

  .dropdown-link.router-link-active {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: color-mix(in srgb, var(--accent) 70%, white);
  }

  .dropdown-link.compact { min-height: 46px; }

  .logout-link:hover { background: rgba(239, 68, 68, 0.1); }

  /* ---------- ACCIONES DERECHA ---------- */

  .desktop-actions {
    min-width: 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    justify-content: flex-end;
    justify-self: end;
    gap: 4px;
  }

  .desktop-action {
    width: 40px;
    height: 40px;
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: color-mix(in srgb, var(--text) 85%, transparent);
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .desktop-action:hover {
    color: #fff;
    background: var(--hover-bg);
  }

  .desktop-action svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .notification-count {
    min-width: 18px;
    height: 18px;
    position: absolute;
    top: 2px;
    right: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid var(--color-heading-bg, #08192e);
    border-radius: 999px;
    background: var(--accent);
    color: #fff;
    font-size: 0.66rem;
    font-weight: 800;
    line-height: 1;
  }

  .desktop-separator {
    width: 1px;
    height: 28px;
    margin: 0 6px;
    background: var(--nav-line);
  }

  /* ---------- PERFIL: iniciales + nombre + flecha ---------- */

  .profile-menu-root { position: relative; }

  .desktop-profile {
    min-width: 0;
    height: 52px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px 0 6px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .desktop-profile:hover,
  .desktop-profile.active {
    border-color: var(--nav-line);
    background: var(--hover-bg);
  }

  .desktop-profile.current .profile-avatar {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }

  .profile-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: color-mix(in srgb, var(--accent) 55%, white);
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* El nombre aparece solo en pantallas anchas */
  .profile-user-name {
    min-width: 0;
    max-width: 120px;
    display: none;
    overflow: hidden;
    color: var(--title);
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.2;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-chevron {
    width: 15px;
    height: 15px;
    flex: 0 0 15px;
    margin-left: 2px;
    fill: var(--muted);
    transition: transform 0.17s ease;
  }

  .profile-chevron.rotated { transform: rotate(180deg); }

  /* ---------- MAIN ---------- */

  .main-layout-container {
    width: 100%;
    min-height: calc(100vh - var(--nav-height));
    margin-left: 0 !important;
  }

  /* ---------- TRANSICIONES ---------- */

  .desktop-dropdown-enter-active,
  .desktop-dropdown-leave-active {
    transition: opacity 0.14s ease, transform 0.14s ease;
  }

  .desktop-dropdown-enter-from,
  .desktop-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
}

/* =========================================================
   1100+: aparece el nombre del gimnasio
========================================================= */

@media (min-width: 1100px) {

  .desktop-navbar-inner { gap: 14px; }

  .desktop-brand { max-width: 220px; }

  .brand-copy { display: flex; }

  .brand-chevron { display: block; }

  .desktop-menu { gap: 4px; }

  .desktop-nav-item { padding: 0 10px; }
}

/* =========================================================
   1280+: aparecen los iconos de cada sección
========================================================= */

@media (min-width: 1280px) {

  .desktop-menu { gap: 6px; }

  .desktop-nav-item {
    padding: 0 12px;
    font-size: 0.8rem;
  }

  .desktop-nav-item > .nav-ico { display: block; }
}

/* =========================================================
   1440+: aparece el nombre del perfil y "Sucursal Actual"
========================================================= */

@media (min-width: 1440px) {

  .desktop-brand { max-width: 240px; }

  .brand-copy span { display: block; }

  .profile-user-name { display: block; }

  .desktop-profile { gap: 9px; padding: 0 10px 0 6px; }

  .desktop-menu { gap: 8px; }

  .desktop-nav-item { font-size: 0.82rem; }
}

/* =========================================================
   1600+: más aire entre las secciones
========================================================= */

@media (min-width: 1600px) {

  .desktop-brand { max-width: 260px; }

  .desktop-menu { gap: 10px; }

  .desktop-nav-item {
    padding: 0 14px;
    font-size: 0.86rem;
  }
}

/* =========================================================
   MÓVIL / TABLET (< 900)
========================================================= */

@media (max-width: 899px) {

  .desktop-navbar {
    display: none;
  }

  .mobile-top-nav {
    display: flex;
  }

  .bottom-nav {
    display: grid;
  }

  .nav-toggle {
    display: flex;
  }

  /* Deja espacio para que la barra inferior no tape el contenido */
  .main-content-wrapper {
    padding-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 14px);
    transition: padding-bottom .3s ease;
  }

  /* Barra oculta: solo queda espacio para el botón de mostrar */
  .main-content-wrapper.nav-collapsed {
    padding-bottom: calc(env(safe-area-inset-bottom) + 48px);
  }
}

/* =========================================================
   TELÉFONO
========================================================= */

@media (max-width: 560px) {

  .mobile-top-nav {
    min-height: 60px;
    padding: 9px 10px;
  }

  .nav-right {
    gap: 5px;
  }

  .nav-action-btn {
    width: 39px;
    height: 39px;
    border-radius: 10px;
  }

  .mobile-branch {
    height: 44px;
    max-width: calc(100% - 92px);
  }

  .custom-panel {
    padding: 20px;
    border-radius: 15px;
  }

  .qr-container img {
    width: 160px;
    height: 160px;
  }
}

/* =========================================================
   TELÉFONO PEQUEÑO
========================================================= */

@media (max-width: 380px) {

  .tab {
    font-size: .62rem;
  }

  .fab {
    width: 58px;
    height: 58px;
    top: -27px;
  }
}

/* =========================================================
   TRANSICIONES GENERALES
========================================================= */

.pop-enter-active,
.pop-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}

.pop-enter-from .custom-panel,
.pop-leave-to .custom-panel {
  transform: scale(.97);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation-duration: 0.01ms !important;
  }
}
</style>