<template>
  <div class="app-wrapper">

    <!-- =====================================================
         NAVEGACIÓN ESCRITORIO
    ====================================================== -->
    <header class="desktop-navbar">
      <div class="desktop-navbar-inner">

        <!-- SUCURSAL (esquina izquierda) -->
        <div class="desktop-brand nav-dropdown-root">
          <button
            type="button"
            class="brand-button"
            :class="{ active: desktopDropdown === 'branch' }"
            :title="selectedGym"
            @click.stop="toggleDesktopDropdown('branch')"
          >
            <div class="brand-mark">
              <svg viewBox="0 0 24 24"><path :d="ICON.pin" /></svg>
            </div>

            <div class="brand-copy">
              <strong>{{ selectedGym }}</strong>
              <span>{{ label('currentBranch', 'Sucursal actual', 'Current branch') }}</span>
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
              <div class="dropdown-title">
                {{ label('', 'Seleccionar sucursal', 'Select branch') }}
              </div>

              <button
                v-for="gym in gyms"
                :key="gym"
                type="button"
                class="branch-option"
                :class="{ selected: selectedGym === gym }"
                @click="selectGym(gym)"
              >
                <span class="branch-option-icon">
                  <svg viewBox="0 0 24 24"><path :d="ICON.pin" /></svg>
                </span>

                <span class="branch-option-copy">
                  <strong>{{ gym }}</strong>
                  <small>
                    {{
                      selectedGym === gym
                        ? label('', 'Sucursal seleccionada', 'Selected branch')
                        : label('', 'Cambiar a esta sucursal', 'Switch to this branch')
                    }}
                  </small>
                </span>

                <svg v-if="selectedGym === gym" class="option-check" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </transition>
        </div>

        <!-- MENÚ CENTRAL -->
        <nav class="desktop-menu">

          <!-- INICIO -->
          <router-link to="/GYM_ADMIN/dashboard" class="desktop-nav-item" @click="closeDesktopDropdown">
            <svg viewBox="0 0 24 24"><path :d="ICON.home" /></svg>
            <span>{{ label('home', 'Inicio', 'Home') }}</span>
          </router-link>

          <!-- USUARIOS -->
          <div class="desktop-nav-group nav-dropdown-root">
            <button
              type="button"
              class="desktop-nav-item"
              :class="{ active: desktopDropdown === 'users', current: isGroupActive('users') }"
              @click.stop="toggleDesktopDropdown('users')"
            >
              <svg viewBox="0 0 24 24"><path :d="ICON.users" /></svg>
              <span>{{ label('users', 'Usuarios', 'Users') }}</span>
              <svg class="nav-chevron" :class="{ rotated: desktopDropdown === 'users' }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            <transition name="desktop-dropdown">
              <div v-if="desktopDropdown === 'users'" class="desktop-dropdown" @click.stop>
                <div class="dropdown-title">
                  {{ label('users', 'Gestión de usuarios', 'User management') }}
                </div>

                <template v-for="l in navUsers" :key="l.to">
                  <div v-if="l.divider" class="dropdown-divider"></div>
                  <router-link :to="l.to" class="dropdown-link" @click="closeDesktopDropdown">
                    <span class="dropdown-icon" :class="l.color">
                      <svg viewBox="0 0 24 24"><path :d="l.icon" /></svg>
                    </span>
                    <span class="dropdown-copy">
                      <strong>{{ label(l.key, l.es, l.en) }}</strong>
                      <small>{{ label('', l.dEs, l.dEn) }}</small>
                    </span>
                  </router-link>
                </template>
              </div>
            </transition>
          </div>

          <!-- PAGOS -->
          <router-link to="/GYM_ADMIN/payments" class="desktop-nav-item" @click="closeDesktopDropdown">
            <svg viewBox="0 0 24 24"><path :d="ICON.pay" /></svg>
            <span>{{ label('payments', 'Pagos', 'Payments') }}</span>
          </router-link>

          <!-- ADMINISTRACIÓN -->
          <div class="desktop-nav-group nav-dropdown-root">
            <button
              type="button"
              class="desktop-nav-item"
              :class="{ active: desktopDropdown === 'administration', current: isGroupActive('administration') }"
              @click.stop="toggleDesktopDropdown('administration')"
            >
              <svg viewBox="0 0 24 24"><path :d="ICON.admin" /></svg>
              <span>{{ label('administration', 'Administración', 'Administration') }}</span>
              <svg class="nav-chevron" :class="{ rotated: desktopDropdown === 'administration' }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            <transition name="desktop-dropdown">
              <div v-if="desktopDropdown === 'administration'" class="desktop-dropdown" @click.stop>
                <div class="dropdown-title">
                  {{ label('administration', 'Administración', 'Administration') }}
                </div>

                <router-link
                  v-for="l in navAdmin"
                  :key="l.to"
                  :to="l.to"
                  class="dropdown-link"
                  @click="closeDesktopDropdown"
                >
                  <span class="dropdown-icon" :class="l.color">
                    <svg viewBox="0 0 24 24"><path :d="l.icon" /></svg>
                  </span>
                  <span class="dropdown-copy">
                    <strong>{{ label(l.key, l.es, l.en) }}</strong>
                    <small>{{ label('', l.dEs, l.dEn) }}</small>
                  </span>
                </router-link>
              </div>
            </transition>
          </div>

          <!-- REPORTES / BITÁCORA -->
          <div class="desktop-nav-group nav-dropdown-root">
            <button
              type="button"
              class="desktop-nav-item"
              :class="{ active: desktopDropdown === 'reports', current: isGroupActive('reports') }"
              @click.stop="toggleDesktopDropdown('reports')"
            >
              <svg viewBox="0 0 24 24"><path :d="ICON.chart" /></svg>
              <span>{{ label('logbook', 'Reportes', 'Reports') }}</span>
              <svg class="nav-chevron" :class="{ rotated: desktopDropdown === 'reports' }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            <transition name="desktop-dropdown">
              <div v-if="desktopDropdown === 'reports'" class="desktop-dropdown reports-dropdown" @click.stop>
                <div class="dropdown-title">
                  {{ label('logbook', 'Reportes y bitácora', 'Reports & logbook') }}
                </div>

                <router-link
                  v-for="l in navReports"
                  :key="l.to"
                  :to="l.to"
                  class="dropdown-link"
                  @click="closeDesktopDropdown"
                >
                  <span class="dropdown-icon" :class="l.color">
                    <svg viewBox="0 0 24 24"><path :d="l.icon" /></svg>
                  </span>
                  <span class="dropdown-copy">
                    <strong>{{ label(l.key, l.es, l.en) }}</strong>
                    <small>{{ label('', l.dEs, l.dEn) }}</small>
                  </span>
                </router-link>
              </div>
            </transition>
          </div>
        </nav>

        <!-- ACCIONES DERECHA -->
        <div class="desktop-actions">

          <!-- SITIO WEB -->
          <button
            type="button"
            class="desktop-action"
            :title="t.irSitioWeb || label('', 'Sitio web', 'Website')"
            @click="activeModal = 'website'"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M3 12h18"></path>
              <path d="M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21"></path>
              <path d="M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21"></path>
            </svg>
          </button>

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
            :title="t.notificaciones || label('', 'Notificaciones', 'Notifications')"
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

          <!-- PERFIL (solo avatar, sin nombre) -->
          <div class="profile-menu-root nav-dropdown-root">
            <button
              type="button"
              class="desktop-profile"
              :class="{ active: desktopDropdown === 'profile' }"
              :aria-label="label('profile', 'Mi perfil', 'My profile')"
              @click.stop="toggleDesktopDropdown('profile')"
            >
              <span class="profile-avatar">{{ GYM_ADMINInitials }}</span>
              <span class="profile-user-name">{{ GYM_ADMINName }}</span>

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
                <router-link to="/GYM_ADMIN/profile" class="dropdown-link compact" @click="closeDesktopDropdown">
                  <span class="dropdown-icon neutral">
                    <svg viewBox="0 0 24 24"><path :d="ICON.user" /></svg>
                  </span>
                  <span class="dropdown-copy">
                    <strong>{{ label('profile', 'Mi perfil', 'My profile') }}</strong>
                  </span>
                </router-link>

                <router-link to="/GYM_ADMIN/settings" class="dropdown-link compact" @click="closeDesktopDropdown">
                  <span class="dropdown-icon neutral">
                    <svg viewBox="0 0 24 24"><path :d="ICON.gear" /></svg>
                  </span>
                  <span class="dropdown-copy">
                    <strong>{{ label('settings', 'Configuración', 'Settings') }}</strong>
                  </span>
                </router-link>

                <div class="dropdown-divider"></div>

                <button type="button" class="dropdown-link compact logout-link" @click="handleLogout">
                  <span class="dropdown-icon red">
                    <svg viewBox="0 0 24 24"><path :d="ICON.logout" /></svg>
                  </span>
                  <span class="dropdown-copy">
                    <strong>{{ label('logout', 'Cerrar sesión', 'Log out') }}</strong>
                  </span>
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
            <svg viewBox="0 0 24 24"><path :d="ICON.pin" /></svg>
          </span>
          <span class="mobile-branch-copy">
            <strong>{{ selectedGym }}</strong>
            <small>{{ label('currentBranch', 'Sucursal actual', 'Current branch') }}</small>
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
         BARRA INFERIOR MÓVIL (estilo Mercado Pago)
         Se puede ocultar hacia abajo (botón flecha o deslizando)
    ====================================================== -->
    <nav
      class="bottom-nav"
      :class="{ 'is-hidden': navHidden }"
      :aria-label="label('', 'Navegación principal', 'Main navigation')"
      @touchstart.passive="onNavTouchStart"
      @touchend.passive="onNavTouchEnd"
    >

      <router-link
        to="/GYM_ADMIN/dashboard"
        class="tab"
        :class="{ on: isTabOn('home') }"
        @click="closeSheet"
      >
        <svg viewBox="0 0 24 24"><path :d="ICON.home" /></svg>
        <span>{{ label('home', 'Inicio', 'Home') }}</span>
      </router-link>

      <button
        type="button"
        class="tab"
        :class="{ on: isTabOn('users') }"
        @click="toggleSheet('users')"
      >
        <svg viewBox="0 0 24 24"><path :d="ICON.users" /></svg>
        <span>{{ label('users', 'Usuarios', 'Users') }}</span>
      </button>

      <!-- BOTÓN CENTRAL: PAGOS -->
      <router-link
        to="/GYM_ADMIN/payments"
        class="tab tab-center"
        :class="{ on: isTabOn('payments') }"
        @click="closeSheet"
      >
        <span class="fab">
          <svg viewBox="0 0 24 24"><path :d="ICON.pay" /></svg>
        </span>
        <span>{{ label('payments', 'Pagos', 'Payments') }}</span>
      </router-link>

      <button
        type="button"
        class="tab"
        :class="{ on: isTabOn('reports') }"
        @click="toggleSheet('reports')"
      >
        <svg viewBox="0 0 24 24"><path :d="ICON.chart" /></svg>
        <span>{{ label('logbook', 'Reportes', 'Reports') }}</span>
      </button>

      <button
        type="button"
        class="tab"
        :class="{ on: isTabOn('more') }"
        @click="toggleSheet('more')"
      >
        <svg viewBox="0 0 24 24" class="stroke"><path d="M4 7h16M4 12h9M4 17h9M17 14v6M14 17h6" /></svg>
        <span>{{ label('', 'Más', 'More') }}</span>
      </button>
    </nav>

    <!-- BOTÓN PARA OCULTAR / MOSTRAR LA BARRA INFERIOR (solo móvil) -->
    <button
      type="button"
      class="nav-toggle"
      :class="{ collapsed: navHidden }"
      :aria-expanded="!navHidden"
      :aria-label="navHidden
        ? label('', 'Mostrar menú', 'Show menu')
        : label('', 'Ocultar menú', 'Hide menu')"
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

          <!-- USUARIOS -->
          <template v-if="mobileSheet === 'users'">
            <h3 class="sheet-title">{{ label('users', 'Gestión de usuarios', 'User management') }}</h3>

            <template v-for="l in navUsers" :key="l.to">
              <div v-if="l.divider" class="sheet-divider"></div>
              <router-link :to="l.to" class="sheet-link" @click="closeSheet">
                <span class="dropdown-icon" :class="l.color">
                  <svg viewBox="0 0 24 24"><path :d="l.icon" /></svg>
                </span>
                <span class="dropdown-copy">
                  <strong>{{ label(l.key, l.es, l.en) }}</strong>
                  <small>{{ label('', l.dEs, l.dEn) }}</small>
                </span>
              </router-link>
            </template>
          </template>

          <!-- REPORTES -->
          <template v-else-if="mobileSheet === 'reports'">
            <h3 class="sheet-title">{{ label('logbook', 'Reportes y bitácora', 'Reports & logbook') }}</h3>

            <router-link
              v-for="l in navReports"
              :key="l.to"
              :to="l.to"
              class="sheet-link"
              @click="closeSheet"
            >
              <span class="dropdown-icon" :class="l.color">
                <svg viewBox="0 0 24 24"><path :d="l.icon" /></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ label(l.key, l.es, l.en) }}</strong>
                <small>{{ label('', l.dEs, l.dEn) }}</small>
              </span>
            </router-link>
          </template>

          <!-- SUCURSAL -->
          <template v-else-if="mobileSheet === 'branch'">
            <h3 class="sheet-title">{{ label('', 'Seleccionar sucursal', 'Select branch') }}</h3>

            <button
              v-for="gym in gyms"
              :key="gym"
              type="button"
              class="sheet-link branch"
              :class="{ selected: selectedGym === gym }"
              @click="selectGym(gym)"
            >
              <span class="dropdown-icon blue">
                <svg viewBox="0 0 24 24"><path :d="ICON.pin" /></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ gym }}</strong>
                <small>
                  {{
                    selectedGym === gym
                      ? label('', 'Sucursal seleccionada', 'Selected branch')
                      : label('', 'Cambiar a esta sucursal', 'Switch to this branch')
                  }}
                </small>
              </span>
              <svg v-if="selectedGym === gym" class="sheet-check" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </template>

          <!-- MÁS -->
          <template v-else-if="mobileSheet === 'more'">
            <h3 class="sheet-title">{{ label('administration', 'Administración', 'Administration') }}</h3>

            <router-link
              v-for="l in navAdmin"
              :key="l.to"
              :to="l.to"
              class="sheet-link"
              @click="closeSheet"
            >
              <span class="dropdown-icon" :class="l.color">
                <svg viewBox="0 0 24 24"><path :d="l.icon" /></svg>
              </span>
              <span class="dropdown-copy">
                <strong>{{ label(l.key, l.es, l.en) }}</strong>
                <small>{{ label('', l.dEs, l.dEn) }}</small>
              </span>
            </router-link>

            <div class="sheet-divider"></div>

            <div class="sheet-grid">
              <router-link to="/GYM_ADMIN/profile" class="sheet-tile" @click="closeSheet">
                <span class="dropdown-icon neutral">
                  <svg viewBox="0 0 24 24"><path :d="ICON.user" /></svg>
                </span>
                <strong>{{ label('profile', 'Mi perfil', 'My profile') }}</strong>
              </router-link>

              <router-link to="/GYM_ADMIN/settings" class="sheet-tile" @click="closeSheet">
                <span class="dropdown-icon neutral">
                  <svg viewBox="0 0 24 24"><path :d="ICON.gear" /></svg>
                </span>
                <strong>{{ label('settings', 'Configuración', 'Settings') }}</strong>
              </router-link>

              <button type="button" class="sheet-tile" @click="openModal('website')">
                <span class="dropdown-icon neutral">
                  <svg viewBox="0 0 24 24" class="stroke">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M3 12h18"></path>
                    <path d="M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21"></path>
                    <path d="M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21"></path>
                  </svg>
                </span>
                <strong>{{ t.irSitioWeb || label('', 'Sitio web', 'Website') }}</strong>
              </button>

              <button type="button" class="sheet-tile danger" @click="handleLogout">
                <span class="dropdown-icon red">
                  <svg viewBox="0 0 24 24"><path :d="ICON.logout" /></svg>
                </span>
                <strong>{{ label('logout', 'Cerrar sesión', 'Log out') }}</strong>
              </button>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <!-- =====================================================
         MODALES
    ====================================================== -->
    <transition name="pop">
      <div
        v-if="activeModal"
        class="modal-wrapper"
        @click.self="activeModal = null"
      >
        <!-- QR -->
        <div v-if="activeModal === 'qr'" class="custom-panel">
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

        <!-- SITIO WEB -->
        <div v-if="activeModal === 'website'" class="custom-panel">
          <div class="panel-header">
            <div>
              <span class="modal-kicker">GYMPRO</span>
              <h3>{{ t.tuSitioWeb }}</h3>
            </div>

            <button type="button" class="close-panel" @click="activeModal = null">
              &times;
            </button>
          </div>

          <div class="panel-body">
            <div class="qr-preview-container">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ULTRAFITNESS-WEB"
                alt="QR Sitio Web"
                class="preview-qr-img"
              />
            </div>

            <p>{{ t.gestionaApariencia }}</p>

            <button type="button" class="action-btn-full outline">
              {{ t.visitarSitioPublico }}
            </button>

            <button type="button" class="action-btn-full">
              {{ t.descargarQr }}
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

/* =========================================================
   ICONOS
========================================================= */

const ICON = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  users: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  userAdd: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  pay: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V7H12v9z',
  admin: 'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
  tag: 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z',
  fee: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 1.9 1.55 3.28 3.5 3.71V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
  chart: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
  alert: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  calendar: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z',
  renew: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z',
  gear: 'M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z',
  logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'
};

/* =========================================================
   ENLACES DEL MENÚ (se usan en escritorio y en móvil)
========================================================= */

const navUsers = [
  {
    to: '/GYM_ADMIN/view-clients', key: 'viewClients', es: 'Clientes', en: 'Clients',
    dEs: 'Consultar y administrar clientes', dEn: 'Manage clients',
    icon: ICON.user, color: 'blue'
  },
  {
    to: '/GYM_ADMIN/view-staff', key: 'viewStaff', es: 'Personal', en: 'Staff',
    dEs: 'Consultar y administrar personal', dEn: 'Manage staff',
    icon: ICON.user, color: 'purple'
  },
  {
    to: '/GYM_ADMIN/register-clients', key: 'registerClients', es: 'Registrar cliente', en: 'Register client',
    dEs: 'Agregar un nuevo cliente', dEn: 'Add a new client',
    icon: ICON.userAdd, color: 'green', divider: true
  },
  {
    to: '/GYM_ADMIN/register-staff', key: 'registerStaff', es: 'Registrar personal', en: 'Register staff',
    dEs: 'Agregar nuevo personal', dEn: 'Add new staff',
    icon: ICON.userAdd, color: 'orange'
  }
];

const navAdmin = [
  {
    to: '/GYM_ADMIN/pricing', key: 'pricingAndPromos', es: 'Precios y promociones', en: 'Pricing & promos',
    dEs: 'Tarifas, planes y promociones', dEn: 'Rates, plans and promotions',
    icon: ICON.tag, color: 'blue'
  },
  {
    to: '/GYM_ADMIN/fees', key: 'feesAndSurcharges', es: 'Multas y recargos', en: 'Fees & surcharges',
    dEs: 'Reglas de morosidad y recargos', dEn: 'Late fees and surcharge rules',
    icon: ICON.fee, color: 'purple'
  }
];


const navReports = [
  {
    to: '/GYM_ADMIN/revenue', key: 'revenue',
    es: 'Ingresos', en: 'Revenue',
    dEs: 'Historial de ingresos', dEn: 'Revenue history',
    icon: ICON.chart, color: 'green'
  },
  {
    to: '/GYM_ADMIN/debtors', key: 'debtors',
    es: 'Deudores', en: 'Debtors',
    dEs: 'Clientes con adeudos', dEn: 'Outstanding balances',
    icon: ICON.alert, color: 'red'
  },
  {
    to: '/GYM_ADMIN/attendance', key: 'attendance',
    es: 'Asistencias', en: 'Attendance',
    dEs: 'Registro de asistencias', dEn: 'Attendance records',
    icon: ICON.calendar, color: 'blue'
  },
  {
    to: '/GYM_ADMIN/renewals', key: 'renewals',
    es: 'Renovaciones', en: 'Renewals',
    dEs: 'Seguimiento de membresías', dEn: 'Membership renewals',
    icon: ICON.renew, color: 'purple'
  },
  {
    to: '/GYM_ADMIN/audit-log', key: 'auditLog',
    es: 'Auditoría', en: 'Audit log',
    dEs: 'Registro de acciones del sistema',
    dEn: 'System activity records',
    icon: ICON.alert, color: 'blue'
  },
  {
    to: '/GYM_ADMIN/cash-history', key: 'cashHistory',
    es: 'Historial de caja', en: 'Cash history',
    dEs: 'Aperturas, cierres y cortes de caja',
    dEn: 'Cash opening and closing records',
    icon: ICON.pay, color: 'green'
  },
  {
    to: '/GYM_ADMIN/membership-history',
    key: 'membershipHistory',
    es: 'Historial de membresías',
    en: 'Membership history',
    dEs: 'Inscripciones, cambios y cancelaciones',
    dEn: 'Registrations, changes and cancellations',
    icon: ICON.renew, color: 'purple'
  }
];


/* =========================================================
   ESTADOS GENERALES
========================================================= */

const isNotificationsOpen = ref(false);

const activeModal = ref(null);
const desktopDropdown = ref(null);

/* Hoja inferior móvil: null | 'users' | 'reports' | 'more' | 'branch' */
const mobileSheet = ref(null);

const selectedGym = ref(
  localStorage.getItem('GYM_ADMIN-selected-gym') || 'Gimnasio Principal'
);

const gyms = ref(['Gimnasio Principal', 'Sucursal Secundaria']);

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
   PERFIL (datos de prueba)
========================================================= */

const GYM_ADMINName = 'Jose Luis';

/* Logo temporal generado en línea; reemplázalo por el real */
const gymLogo =
  'https://ui-avatars.com/api/?name=Ultra+Fitness&size=128&background=2563eb&color=ffffff&bold=true';

const logoOk = ref(true);

const GYM_ADMINInitials = computed(() =>
  GYM_ADMINName
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
  localStorage.getItem('GYM_ADMIN-idioma') || lang.value || 'es'
);

const t = computed(() => {
  return traducciones[idiomaActual.value] || traducciones.es || {};
});

const label = (key, es, en) => {
  const table = traducciones[idiomaActual.value] || traducciones.es || {};

  if (key && table[key]) {
    return table[key];
  }

  return idiomaActual.value === 'en' ? en : es;
};

const handleIdiomaChanged = (event) => {
  if (event.detail && event.detail.idioma) {
    idiomaActual.value = event.detail.idioma;
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

const grupos = {
  users: [
    '/GYM_ADMIN/view-clients',
    '/GYM_ADMIN/view-staff',
    '/GYM_ADMIN/register-clients',
    '/GYM_ADMIN/register-staff'
  ],
  administration: ['/GYM_ADMIN/pricing', '/GYM_ADMIN/fees'],
  
reports: [
  '/GYM_ADMIN/revenue',
  '/GYM_ADMIN/debtors',
  '/GYM_ADMIN/attendance',
  '/GYM_ADMIN/renewals',
  '/GYM_ADMIN/membership-history',
  '/GYM_ADMIN/cash-history',
  '/GYM_ADMIN/audit-log'
]

};

const isGroupActive = (name) =>
  (grupos[name] || []).some((ruta) => route.path.startsWith(ruta));

/* =========================================================
   BARRA INFERIOR MÓVIL
========================================================= */

/* Pestaña que corresponde a la página actual */
const activeTab = computed(() => {
  const path = route.path;

  if (path.startsWith('/GYM_ADMIN/dashboard')) return 'home';
  if (path.startsWith('/GYM_ADMIN/payments')) return 'payments';
  if (isGroupActive('users')) return 'users';
  if (isGroupActive('reports')) return 'reports';

  if (
    isGroupActive('administration') ||
    path.startsWith('/GYM_ADMIN/profile') ||
    path.startsWith('/GYM_ADMIN/settings')
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

const openModal = (name) => {
  closeSheet();
  activeModal.value = name;
};

/* Bloquea el scroll del fondo mientras la hoja está abierta */
watch(mobileSheet, (value) => {
  document.body.style.overflow = value ? 'hidden' : '';
});

/* ---------- Ocultar / mostrar la barra inferior ---------- */

const NAV_HIDDEN_KEY = 'GYM_ADMIN-nav-hidden';

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
   SUCURSAL
========================================================= */

const selectGym = (gym) => {
  selectedGym.value = gym;
  localStorage.setItem('GYM_ADMIN-selected-gym', gym);
  closeDesktopDropdown();
  closeSheet();
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
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('app-settings-updated', aplicarEstilosGlobales);
  window.removeEventListener('idioma-changed', handleIdiomaChanged);

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

.dropdown-icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.dropdown-icon svg.stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
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

.mobile-branch-icon svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
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

.mobile-branch-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: var(--muted);
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

.tab > svg {
  width: 25px;
  height: 25px;
  fill: currentColor;
  transition: transform .18s ease, filter .18s ease;
}

.tab > svg.stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tab:active > svg {
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

.tab.on > svg {
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

.fab svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
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

.sheet-link.logout-link {
  color: #f87171;
}

/* Flecha que indica que la fila abre una página */
.sheet-link:not(.branch):not(.logout-link)::after {
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

.sheet-check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--accent);
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
   MODALES
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

.qr-container,
.qr-preview-container {
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

.qr-preview-container {
  width: 170px;
  height: 170px;
}

.preview-qr-img {
  width: 100%;
  height: 100%;
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

.action-btn-full.outline {
  margin-top: 3px;
  border: 1px solid rgba(255, 255, 255, .11);
  background: rgba(255, 255, 255, .035);
  color: var(--text);
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
    gap: 16px;
    padding: 0 clamp(18px, 2.3vw, 40px);
  }

  /* ---------- SUCURSAL (izquierda) ---------- */

  .desktop-brand {
    min-width: 0;
    max-width: 250px;
    position: relative;
    justify-self: start;
  }

  .brand-button {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
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

  .brand-mark svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .brand-copy {
    min-width: 0;
    flex: 1;
    display: flex;
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
    color: var(--muted);
    font-size: 0.74rem;
    font-weight: 500;
  }

  .brand-chevron {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    fill: var(--muted);
    transition: transform 0.17s ease;
  }

  .brand-chevron.rotated { transform: rotate(180deg); }

  /* ---------- MENÚ CENTRAL ---------- */

  .desktop-menu {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  /* Divisor fino entre el menú y los botones de la derecha */
  .desktop-menu::after {
    content: '';
    width: 1px;
    height: 28px;
    flex-shrink: 0;
    margin: 0 4px 0 10px;
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
    padding: 0 14px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: color-mix(in srgb, var(--text) 78%, transparent);
    font-family: 'Inter', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .desktop-nav-item > svg:first-child {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
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
  .brand-button:focus-visible,
  .dropdown-link:focus-visible,
  .branch-option:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* ---------- DROPDOWNS ---------- */

  .nav-dropdown-root { position: relative; }

  .desktop-dropdown {
    width: 300px;
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

  .reports-dropdown { width: 310px; }
  .branch-menu { width: 280px; }
  .profile-dropdown { width: 240px; }

  .dropdown-title {
    padding: 8px 10px 11px;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--nav-line);
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .dropdown-link,
  .branch-option {
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

  .dropdown-link:hover,
  .branch-option:hover { background: var(--hover-bg); }

  .dropdown-link.router-link-active {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: color-mix(in srgb, var(--accent) 70%, white);
  }

  .branch-option-icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }

  .branch-option-icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .branch-option-copy {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .branch-option-copy strong {
    max-width: 100%;
    overflow: hidden;
    color: inherit;
    font-size: 0.9rem;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .branch-option-copy small {
    max-width: 100%;
    margin-top: 2px;
    overflow: hidden;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .branch-option.selected {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .branch-option.selected .branch-option-copy strong {
    color: color-mix(in srgb, var(--accent) 70%, white);
  }

  .option-check {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--accent);
  }

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
    width: 42px;
    height: 42px;
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
    margin: 0 10px;
    background: var(--nav-line);
  }

  /* ---------- PERFIL (solo avatar) ---------- */

  .profile-menu-root { position: relative; }

  .desktop-profile {
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

  .profile-avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    color: color-mix(in srgb, var(--accent) 55%, white);
    font-size: 0.8rem;
    font-weight: 800;
  }

  .profile-chevron {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    fill: var(--muted);
    transition: transform 0.17s ease;
  }

  .profile-chevron.rotated { transform: rotate(180deg); }

  .dropdown-link.compact { min-height: 46px; }

  .logout-link:hover { background: rgba(239, 68, 68, 0.1); }

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
   LAPTOPS (900 - 1439)
========================================================= */

@media (min-width: 900px) and (max-width: 1439px) {

  .desktop-navbar-inner {
    gap: 10px;
    padding: 0 20px;
  }

  .desktop-brand { max-width: 230px; }

  .desktop-menu { gap: 2px; }

  .desktop-nav-item {
    padding: 0 11px;
    font-size: 0.84rem;
  }

  .desktop-separator { margin: 0 6px; }
}

/* =========================================================
   900 - 1279: logo solo icono, sucursal solo icono
========================================================= */

@media (min-width: 900px) and (max-width: 1279px) {

  .desktop-navbar-inner {
    gap: 6px;
    padding: 0 14px;
  }

  .brand-copy { display: none; }

  .desktop-brand { max-width: 84px; }

  .desktop-nav-item {
    padding: 0 8px;
    font-size: 0.8rem;
  }

  .desktop-action {
    width: 38px;
    height: 38px;
  }
}

/* =========================================================
   900 - 1160: menú sin iconos
========================================================= */

@media (min-width: 900px) and (max-width: 1160px) {

  .desktop-nav-item {
    padding: 0 7px;
    font-size: 0.78rem;
  }

  .desktop-nav-item > svg:first-child { display: none; }

  .nav-chevron { display: none; }

  .brand-chevron { display: none; }

  .desktop-brand { max-width: 56px; }

  .brand-button { padding: 0 8px; }
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

  .qr-preview-container {
    width: 155px;
    height: 155px;
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