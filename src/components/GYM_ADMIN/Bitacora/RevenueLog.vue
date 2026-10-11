<template>
  <HeadingGYM_ADMIN>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('incomesTitle') }}</h1>
          <span class="title-underline"></span>
          <p class="main-subtitle">{{ t('pageSubtitle') }}</p>
        </div>

        <div class="actions-bar" id="tutorial-step-0">
          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <select class="status-select" v-model="selectedMembership">
              <option value="">{{ t('membershipAll') }}</option>
              <option value="Mensual">{{ t('monthly') }}</option>
              <option value="Quincenal">{{ t('fortnightly') }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" :placeholder="t('searchPlaceholder')" v-model="searchQuery">
            <button v-if="searchQuery" class="search-clear" type="button" @click="searchQuery = ''" aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <button class="btn-bulk" @click="activeModal = 'ganancias'">
            <span class="btn-bulk-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </span>
            <div class="btn-text-wrapper">
              <span class="btn-label">{{ t('analysisLabel') }}</span>
              <span class="highlight-text-custom">{{ t('viewAnalysis') }}</span>
            </div>
          </button>
        </div>
      </header>

      <!-- RESUMEN -->
      <section class="stats-row">
        <div class="stat-card" v-for="s in stats" :key="s.key" :class="'stat-' + s.tone">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ t(s.key) }}</span>
        </div>
      </section>

      <!-- ESCRITORIO -->
      <div class="table-container desktop-only" :id="!isMobile ? 'tutorial-step-1' : undefined">
        <table class="user-table">
          <thead>
            <tr>
              <th>{{ t('colPhoto') }}</th>
              <th>{{ t('colName') }}</th>
              <th>{{ t('colEmail') }}</th>
              <th>{{ t('colType') }}</th>
              <th>{{ t('colExpiration') }}</th>
              <th>{{ t('colMembership') }}</th>
              <th class="th-right">{{ t('colAmount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in pagedUsers" :key="user.id">
              <td><div class="avatar-small" :style="avatarStyle(user.id)">{{ getInitials(user.name) }}</div></td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email }}</td>
              <td><span class="type-chip">{{ typeLabel(user.mensualidad) }}</span></td>
              <td class="text-muted">{{ user.expirationDate }}</td>
              <td><span :class="['status-badge2', getMembershipClass(user.membership)]">{{ user.membership }}</span></td>
              <td class="td-right"><span class="status-badge income">{{ user.amount }}</span></td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="empty-state-cell">
                <div class="empty-state">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>{{ t('emptyState') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">{{ filteredUsers.length }} {{ t('resultsLabel') }}</div>
      </div>

      <!-- MÓVIL -->
      <div class="mobile-only">
        <div
          v-for="(user, index) in pagedUsers"
          :key="user.id"
          class="user-card"
          :id="isMobile && index === 0 ? 'tutorial-step-1' : undefined"
        >
          <div class="card-top-section">
            <div class="avatar-small" :style="avatarStyle(user.id)">{{ getInitials(user.name) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <div class="badges-row">
                <span :class="['status-badge2', getMembershipClass(user.membership)]">{{ user.membership }}</span>
                <span class="type-chip">{{ typeLabel(user.mensualidad) }}</span>
              </div>
            </div>
            <span class="status-badge income">{{ user.amount }}</span>
          </div>

          <div class="card-meta">
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="email-text">{{ user.email }}</span></span>
            <span class="meta-row expiration-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="vence-label">{{ t('expiresLabel') }}:</span> {{ user.expirationDate }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="phone-text">{{ user.phone }}</span></span>
          </div>
        </div>

        <div v-if="filteredUsers.length === 0" class="empty-state-mobile">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{{ t('emptyState') }}</span>
        </div>
      </div>

      <!-- PAGINACIÓN (solo con más de 40 resultados) -->
      <nav v-if="showPager" class="pager" :aria-label="t('pagination')">
        <button class="pager-btn" type="button" :disabled="page <= 1" :aria-label="t('prevPage')" @click="goPage(page - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page >= totalPages" :aria-label="t('nextPage')" @click="goPage(page + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>

      <!-- Modal Eliminar -->
      <ModalComponent :isOpen="showDelete" @close="showDelete = false">
        <div class="modal-body-custom">
          <div class="modal-icon-container danger-bg">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <h2>{{ t('deleteTitle') }}</h2>
          <p>{{ t('deleteMsgPre') }} <span class="highlight-name">{{ selectedUser?.name }}</span> {{ t('deleteMsgPost') }}</p>
          <div class="modal-buttons">
            <button class="btn-modal secondary" @click="showDelete = false">{{ t('cancelBtn') }}</button>
            <button class="btn-modal danger">{{ t('confirmBtn') }}</button>
          </div>
        </div>
      </ModalComponent>
    </main>

    <transition name="pop">
      <div v-if="activeModal === 'ganancias'" class="modal-wrapper" @click.self="activeModal = null">
        <Ganancias :users="filteredUsers" @close="activeModal = null" />
      </div>
    </transition>
  </HeadingGYM_ADMIN>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ADMIN from '../HeadingGYM_ADMIN.vue';
import ModalComponent from '../../Modals/ModalComponent.vue';
import Ganancias from '../Componets/Earnings.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

interface User {
  id: number;
  name: string;
  email: string;
  expirationDate: string;
  membership: string;
  amount: string;
  mensualidad: string;
  phone: string;
}

const activeModal = ref<string | null>(null);
const showDelete = ref<boolean>(false);
const selectedUser = ref<User | null>(null);
const selectedMembership = ref<string>('');
const searchQuery = ref<string>('');
const toastRef = ref<any>(null);

// Idiomas
const currentLang = ref<string>(localStorage.getItem('GYM_ADMIN-idioma') || 'es');
const handleLangChange = (e: Event): void => {
  const customEvent = e as CustomEvent<{ idioma?: string }>;
  if (customEvent.detail?.idioma) currentLang.value = customEvent.detail.idioma;
};

const langData: Record<'es' | 'en', Record<string, string>> = {
  es: {
    incomesTitle: 'Ingresos',
    pageSubtitle: 'Visualiza los ingresos generados por membresías.',
    membershipAll: 'Todas las mensualidades',
    monthly: 'Mensual',
    fortnightly: 'Quincenal',
    analysisLabel: 'Análisis',
    viewAnalysis: 'Ver desglose',
    searchPlaceholder: 'Buscar usuario...',
    colPhoto: 'Foto',
    colName: 'Nombre',
    colEmail: 'Correo',
    colType: 'Pago',
    colExpiration: 'Fecha a Vencer',
    colMembership: 'Membresía',
    colAmount: 'Monto',
    expiresLabel: 'Vence',
    emptyState: 'No se encontraron resultados con esos filtros.',
    resultsLabel: 'resultados',
    pagination: 'Paginación',
    prevPage: 'Página anterior',
    nextPage: 'Página siguiente',
    statTotal: 'Ingresos',
    statMembers: 'Miembros',
    statAverage: 'Promedio',
    statHighest: 'Pago más alto',
    deleteTitle: '¿Eliminar usuario?',
    deleteMsgPre: '¿Deseas eliminar a',
    deleteMsgPost: 'temporalmente?',
    cancelBtn: 'Cancelar',
    confirmBtn: 'Confirmar'
  },
  en: {
    incomesTitle: 'Incomes',
    pageSubtitle: 'View the income generated by memberships.',
    membershipAll: 'All payment types',
    monthly: 'Monthly',
    fortnightly: 'Fortnightly',
    analysisLabel: 'Analysis',
    viewAnalysis: 'View breakdown',
    searchPlaceholder: 'Search user...',
    colPhoto: 'Photo',
    colName: 'Name',
    colEmail: 'Email',
    colType: 'Payment',
    colExpiration: 'Expiration Date',
    colMembership: 'Membership',
    colAmount: 'Amount',
    expiresLabel: 'Expires',
    emptyState: 'No results found with those filters.',
    resultsLabel: 'results',
    pagination: 'Pagination',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    statTotal: 'Income',
    statMembers: 'Members',
    statAverage: 'Average',
    statHighest: 'Highest payment',
    deleteTitle: 'Delete user?',
    deleteMsgPre: 'Do you want to temporarily delete',
    deleteMsgPost: '?',
    cancelBtn: 'Cancel',
    confirmBtn: 'Confirm'
  }
};

const t = (key: string): string => {
  const langKey = (currentLang.value === 'en' ? 'en' : 'es') as 'es' | 'en';
  return langData[langKey][key] || langData.es[key] || key;
};

const typeLabel = (m: string): string => (m === 'Quincenal' ? t('fortnightly') : t('monthly'));

const isMobile = ref<boolean>(window.innerWidth <= 900);
const updateWidth = (): void => {
  isMobile.value = window.innerWidth <= 900;
};

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange as EventListener);
  window.addEventListener('resize', updateWidth);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  window.removeEventListener('resize', updateWidth);
});

const users = ref<User[]>([

  { id: 1, name: 'Jesus Luis Ramirez Sanchez', email: 'jesusramirez@gmail.com', expirationDate: '18/03/2026', membership: '1 Mes', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 123 4321' },
  { id: 2, name: 'Maria Fernanda Lopez Garcia', email: 'maria.lopez@gmail.com', expirationDate: '25/10/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 234 5678' },
  { id: 3, name: 'Erick Alejandro Hernandez Ruiz', email: 'erick.hernandez@gmail.com', expirationDate: '12/11/2026', membership: '4 Meses', amount: '$ 1200.00', mensualidad: 'Mensual', phone: '+52 481 345 6789' },
  { id: 4, name: 'Luis Alberto Martinez Torres', email: 'luis.martinez@gmail.com', expirationDate: '30/10/2026', membership: '6 Meses', amount: '$ 800.00', mensualidad: 'Quincenal', phone: '+52 481 456 7890' },
  { id: 5, name: 'Fernando Daniel Perez Morales', email: 'fernando.perez@gmail.com', expirationDate: '15/12/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Mensual', phone: '+52 481 567 8901' },
  { id: 6, name: 'Mario Alberto Gonzalez Flores', email: 'mario.gonzalez@gmail.com', expirationDate: '08/11/2026', membership: '3 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 678 9012' },
  { id: 7, name: 'Jorge Eduardo Sanchez Castro', email: 'jorge.sanchez@gmail.com', expirationDate: '22/01/2027', membership: '5 Meses', amount: '$ 1500.00', mensualidad: 'Mensual', phone: '+52 481 789 0123' },
  { id: 8, name: 'Francisco Javier Torres Medina', email: 'francisco.torres@gmail.com', expirationDate: '05/10/2026', membership: '1 Mes', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 890 1234' },
  { id: 9, name: 'Ana Sofia Rodriguez Perez', email: 'ana.rodriguez@gmail.com', expirationDate: '18/11/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 901 2345' },
  { id: 10, name: 'Carlos Andres Mendoza Lopez', email: 'carlos.mendoza@gmail.com', expirationDate: '28/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 112 3456' },
  { id: 11, name: 'Daniela Guadalupe Garcia Reyes', email: 'daniela.garcia@gmail.com', expirationDate: '14/12/2026', membership: '2 Meses', amount: '$ 700.00', mensualidad: 'Mensual', phone: '+52 481 223 4567' },
  { id: 12, name: 'Jose Manuel Ortiz Hernandez', email: 'jose.ortiz@gmail.com', expirationDate: '02/11/2026', membership: '1 Mes', amount: '$ 250.00', mensualidad: 'Quincenal', phone: '+52 481 334 5678' },
  { id: 13, name: 'Valeria Fernanda Cruz Martinez', email: 'valeria.cruz@gmail.com', expirationDate: '20/02/2027', membership: '6 Meses', amount: '$ 1800.00', mensualidad: 'Mensual', phone: '+52 481 445 6789' },
  { id: 14, name: 'Miguel Angel Ramirez Castillo', email: 'miguel.ramirez@gmail.com', expirationDate: '09/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 556 7890' },
  { id: 15, name: 'Andrea Carolina Flores Vargas', email: 'andrea.flores@gmail.com', expirationDate: '25/11/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 667 8901' },
  { id: 16, name: 'Roberto Carlos Diaz Moreno', email: 'roberto.diaz@gmail.com', expirationDate: '17/10/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 778 9012' },
  { id: 17, name: 'Gabriela Alejandra Morales Ruiz', email: 'gabriela.morales@gmail.com', expirationDate: '11/01/2027', membership: '4 Meses', amount: '$ 1200.00', mensualidad: 'Mensual', phone: '+52 481 889 0123' },
  { id: 18, name: 'Ricardo Antonio Navarro Lopez', email: 'ricardo.navarro@gmail.com', expirationDate: '03/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 990 1234' },
  { id: 19, name: 'Paola Andrea Jimenez Sanchez', email: 'paola.jimenez@gmail.com', expirationDate: '29/12/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 101 2345' },
  { id: 20, name: 'Eduardo Sebastian Vargas Torres', email: 'eduardo.vargas@gmail.com', expirationDate: '07/11/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 212 3456' },
  { id: 21, name: 'Karla Vanessa Castillo Perez', email: 'karla.castillo@gmail.com', expirationDate: '19/03/2027', membership: '6 Meses', amount: '$ 1800.00', mensualidad: 'Mensual', phone: '+52 481 323 4567' },
  { id: 22, name: 'Hector Alejandro Salazar Medina', email: 'hector.salazar@gmail.com', expirationDate: '01/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 434 5678' },
  { id: 23, name: 'Monica Isabel Romero Garcia', email: 'monica.romero@gmail.com', expirationDate: '16/11/2026', membership: '2 Meses', amount: '$ 700.00', mensualidad: 'Mensual', phone: '+52 481 545 6789' },
  { id: 24, name: 'Oscar Ivan Aguilar Rodriguez', email: 'oscar.aguilar@gmail.com', expirationDate: '24/10/2026', membership: '1 Mes', amount: '$ 250.00', mensualidad: 'Quincenal', phone: '+52 481 656 7890' },
  { id: 25, name: 'Fernanda Guadalupe Rios Lopez', email: 'fernanda.rios@gmail.com', expirationDate: '13/02/2027', membership: '5 Meses', amount: '$ 1500.00', mensualidad: 'Mensual', phone: '+52 481 767 8901' },
  { id: 26, name: 'Alberto Enrique Vega Martinez', email: 'alberto.vega@gmail.com', expirationDate: '06/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 878 9012' },
  { id: 27, name: 'Lucia Fernanda Herrera Castro', email: 'lucia.herrera@gmail.com', expirationDate: '21/12/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 989 0123' },
  { id: 28, name: 'Diego Armando Molina Reyes', email: 'diego.molina@gmail.com', expirationDate: '31/10/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 190 1234' },
  { id: 29, name: 'Samantha Nicole Campos Flores', email: 'samantha.campos@gmail.com', expirationDate: '08/01/2027', membership: '4 Meses', amount: '$ 1200.00', mensualidad: 'Mensual', phone: '+52 481 201 2345' },
  { id: 30, name: 'Adrian Eduardo Fuentes Sanchez', email: 'adrian.fuentes@gmail.com', expirationDate: '04/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 312 3456' },
  { id: 31, name: 'Natalia Berenice Pineda Ortiz', email: 'natalia.pineda@gmail.com', expirationDate: '27/11/2026', membership: '2 Meses', amount: '$ 700.00', mensualidad: 'Mensual', phone: '+52 481 423 4567' },
  { id: 32, name: 'Victor Hugo Cardenas Lopez', email: 'victor.cardenas@gmail.com', expirationDate: '10/10/2026', membership: '1 Mes', amount: '$ 250.00', mensualidad: 'Quincenal', phone: '+52 481 534 5678' },
  { id: 33, name: 'Regina Alejandra Espinoza Torres', email: 'regina.espinoza@gmail.com', expirationDate: '15/04/2027', membership: '6 Meses', amount: '$ 1800.00', mensualidad: 'Mensual', phone: '+52 481 645 6789' },
  { id: 34, name: 'Emmanuel David Guerrero Ruiz', email: 'emmanuel.guerrero@gmail.com', expirationDate: '23/10/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 756 7890' },
  { id: 35, name: 'Brenda Lizbeth Acosta Garcia', email: 'brenda.acosta@gmail.com', expirationDate: '12/12/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 867 8901' },
  { id: 36, name: 'Rafael Antonio Bautista Perez', email: 'rafael.bautista@gmail.com', expirationDate: '29/09/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 978 9012' },
  { id: 37, name: 'Ximena Guadalupe Nunez Morales', email: 'ximena.nunez@gmail.com', expirationDate: '18/01/2027', membership: '4 Meses', amount: '$ 1200.00', mensualidad: 'Mensual', phone: '+52 481 189 0123' },
  { id: 38, name: 'Angel Gabriel Contreras Lopez', email: 'angel.contreras@gmail.com', expirationDate: '05/11/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 290 1234' },
  { id: 39, name: 'Diana Carolina Serrano Vargas', email: 'diana.serrano@gmail.com', expirationDate: '22/12/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 301 2345' },
  { id: 40, name: 'Kevin Alexander Valdez Martinez', email: 'kevin.valdez@gmail.com', expirationDate: '02/10/2026', membership: '1 Mes', amount: '$ 350.00', mensualidad: 'Mensual', phone: '+52 481 412 3456' },
  { id: 41, name: 'Mariana Alejandra Ochoa Sanchez', email: 'mariana.ochoa@gmail.com', expirationDate: '14/03/2027', membership: '6 Meses', amount: '$ 1800.00', mensualidad: 'Mensual', phone: '+52 481 523 4567' },
  { id: 42, name: 'Cristian Eduardo Padilla Flores', email: 'cristian.padilla@gmail.com', expirationDate: '26/10/2026', membership: '2 Meses', amount: '$ 500.00', mensualidad: 'Quincenal', phone: '+52 481 634 5678' },
  { id: 43, name: 'Alejandra Sofia Dominguez Reyes', email: 'alejandra.dominguez@gmail.com', expirationDate: '09/12/2026', membership: '3 Meses', amount: '$ 900.00', mensualidad: 'Mensual', phone: '+52 481 745 6789' },
  { id: 44, name: 'Ivan Alejandro Cabrera Torres', email: 'ivan.cabrera@gmail.com', expirationDate: '07/10/2026', membership: '1 Mes', amount: '$ 250.00', mensualidad: 'Quincenal', phone: '+52 481 856 7890' },
  { id: 45, name: 'Sofia Valentina Mendoza Garcia', email: 'sofia.mendoza@gmail.com', expirationDate: '20/02/2027', membership: '5 Meses', amount: '$ 1500.00', mensualidad: 'Mensual', phone: '+52 481 967 8901' }

]);

const filteredUsers = computed(() => {
  const term = searchQuery.value.toLowerCase().trim();
  return users.value.filter(user => {
    const matchMembership = selectedMembership.value ? user.mensualidad === selectedMembership.value : true;
    const matchSearch =
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.membership.toLowerCase().includes(term) ||
      user.amount.toLowerCase().includes(term) ||
      user.mensualidad.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.expirationDate.toLowerCase().includes(term) ||
      user.id.toString().includes(term);
    return matchMembership && matchSearch;
  });
});

const parseAmount = (s: string): number => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const totalIncome = computed(() =>
  filteredUsers.value.reduce((sum, user) => sum + parseAmount(user.amount), 0)
);

// Paginación: se muestra solo cuando hay más de 40 resultados
const PAGE_SIZE = 40;
const page = ref<number>(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)));
const showPager = computed(() => filteredUsers.value.length > PAGE_SIZE);
const pagedUsers = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredUsers.value.slice(start, start + PAGE_SIZE);
});
const goPage = (n: number): void => {
  page.value = Math.min(Math.max(1, n), totalPages.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
watch([searchQuery, selectedMembership], () => { page.value = 1; });
watch(totalPages, n => { if (page.value > n) page.value = n; });

const stats = computed(() => {
  const list = filteredUsers.value;
  const amounts = list.map(u => parseAmount(u.amount));
  const total = totalIncome.value;
  return [
    { key: 'statTotal', value: formatCurrency(total), tone: 'green' },
    { key: 'statMembers', value: String(list.length), tone: 'total' },
    { key: 'statAverage', value: formatCurrency(list.length ? total / list.length : 0), tone: 'blue' },
    { key: 'statHighest', value: formatCurrency(amounts.length ? Math.max(...amounts) : 0), tone: 'orange' }
  ];
});

const avatarGradients: string[] = [
  'linear-gradient(135deg, #7e22ce, #4c1d95)',
  'linear-gradient(135deg, #ea580c, #9a3412)',
  'linear-gradient(135deg, #db2777, #9d174d)',
  'linear-gradient(135deg, #dc2626, #7f1d1d)',
  'linear-gradient(135deg, #2563eb, #1e3a8a)',
  'linear-gradient(135deg, #059669, #064e3b)'
];
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};
const avatarStyle = (id: number) => ({ backgroundImage: avatarGradients[id % avatarGradients.length] });

const getMembershipClass = (membership: string): string => {
  const classes: Record<string, string> = {
    '1 Mes': 'membership-red',
    '2 Meses': 'membership-blue',
    '3 Meses': 'membership-green',
    '4 Meses': 'membership-purple',
    '5 Meses': 'membership-orange',
    '6 Meses': 'membership-pink'
  };
  return classes[membership] || 'membership-default';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');

.main-content,
.modal-wrapper {
  --accent: var(--color-highlight, #3b82f6);
  --income: #34d399;
  --card-bg: var(--bg-cards, #121416);
  --radius: var(--app-border-radius, 14px);
  --radius-small: 10px;
  --line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent);
  --line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);
  --muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 68%, transparent);
}

.main-content *,
.main-content *::before,
.main-content *::after { box-sizing: border-box; }

.main-content {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 34px 36px 55px;
  color: var(--color-texto-general, #e5e7eb);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* HEADER */
.header-section { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.title-wrapper { min-width: 240px; display: flex; flex-direction: column; gap: 6px; }
.main-title {
  margin: 0;
  color: var(--color-titulos, #ffffff);
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.title-underline { display: block; width: 58px; height: 3px; margin-top: 2px; border-radius: 999px; background: linear-gradient(90deg, var(--accent), transparent); }
.main-subtitle { max-width: 560px; margin: 1px 0 0; color: var(--muted); font-size: 0.82rem; font-weight: 500; line-height: 1.5; }

/* ACCIONES */
.actions-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.search-wrapper, .select-wrapper { position: relative; display: flex; align-items: center; }
.search-icon, .select-icon { position: absolute; z-index: 2; left: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }
.select-arrow { position: absolute; z-index: 2; right: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }

.search-input, .status-select {
  height: 44px;
  border: 1px solid var(--line);
  border-radius: var(--radius-small);
  background: var(--card-bg);
  color: var(--color-texto-general, #ffffff);
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
  transition: width 0.2s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.search-input:hover, .status-select:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 25%, transparent); }
.search-input:focus, .status-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}

.search-input { width: 240px; padding: 0 38px 0 40px; }
.search-input:focus { width: 270px; }
.search-input::placeholder { color: var(--muted); opacity: 0.68; }

.search-clear {
  position: absolute; right: 10px; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 50%;
  background: color-mix(in srgb, var(--color-texto-general, #ffffff) 10%, transparent);
  color: var(--muted); cursor: pointer; transition: background 0.15s ease;
}
.search-clear:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 20%, transparent); }

.status-select { min-width: 190px; padding: 0 38px 0 40px; appearance: none; -webkit-appearance: none; cursor: pointer; color-scheme: dark; }
.status-select option { background: #111315; color: #ffffff; }

/* BOTÓN INGRESOS */
.btn-bulk {
  min-height: 44px; display: inline-flex; align-items: center; gap: 10px;
  padding: 5px 16px 5px 7px;
  border: 1px solid rgba(52, 211, 153, 0.34);
  border-radius: var(--radius-small);
  background: rgba(52, 211, 153, 0.08);
  color: var(--color-texto-general, #ffffff);
  font-family: 'Inter', sans-serif;
  white-space: nowrap; cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.btn-bulk-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 8px; background: rgba(52, 211, 153, 0.14); color: #34d399; }
.btn-text-wrapper { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; line-height: 1.1; }
.btn-label { color: var(--muted); font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.highlight-text-custom { color: #34d399; font-size: 0.88rem; font-weight: 700; letter-spacing: -0.01em; }
.btn-bulk:hover { border-color: rgba(52, 211, 153, 0.6); background: rgba(52, 211, 153, 0.13); box-shadow: 0 8px 20px rgba(52, 211, 153, 0.1); transform: translateY(-1px); }
.btn-bulk:active { transform: translateY(0); }

/* RESUMEN */
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.stat-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 3px; padding: 15px 18px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); }
.stat-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone, var(--accent)); }
.stat-total { --tone: var(--accent); }
.stat-green { --tone: #34d399; }
.stat-blue { --tone: #60a5fa; }
.stat-orange { --tone: #fbbf24; }
.stat-value { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.5rem; font-weight: 600; line-height: 1.15; white-space: nowrap; }
.stat-label { color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }

.desktop-only { display: block; }
.mobile-only { display: none; }

/* TABLA */
.table-container { position: relative; width: 100%; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
.table-container::before { content: ''; position: absolute; z-index: 3; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #34d399, transparent); opacity: 0.7; pointer-events: none; }
.user-table { width: 100%; border-collapse: collapse; color: var(--color-texto-general, #e5e7eb); text-align: left; }
.user-table thead { background: color-mix(in srgb, var(--card-bg) 95%, var(--color-texto-general, #ffffff)); }
.user-table th { padding: 15px 18px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.065em; text-transform: uppercase; white-space: nowrap; }
.user-table td { padding: 13px 18px; border-top: 1px solid var(--line-soft); font-size: 0.82rem; vertical-align: middle; }
.user-table tbody tr:first-child td { border-top: none; }
.user-table tbody tr { transition: background 0.17s ease, box-shadow 0.17s ease; }
.th-right, .td-right { text-align: right; }

@media (hover: hover) {
  .user-table tbody tr:hover { background: rgba(52, 211, 153, 0.04); box-shadow: inset 3px 0 0 rgba(52, 211, 153, 0.8); }
}

.table-footer { padding: 11px 18px; border-top: 1px solid var(--line-soft); color: var(--muted); font-size: 0.72rem; font-weight: 500; text-align: right; }

/* AVATAR / TEXTO */
.avatar-small {
  width: 41px; height: 41px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 11px; color: #ffffff;
  font-size: 0.74rem; font-weight: 700; letter-spacing: 0.02em;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.24);
}
.text-bold { color: var(--color-titulos, #ffffff); font-weight: 600; }
.text-muted { color: var(--muted); }

.type-chip {
  display: inline-flex; align-items: center; min-height: 26px; padding: 3px 10px;
  border: 1px solid var(--line); border-radius: 8px;
  background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent);
  color: var(--color-texto-general, #e5e7eb); font-size: 0.7rem; font-weight: 600; white-space: nowrap;
}

/* MEMBRESÍAS */
.status-badge2 { min-height: 26px; display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border: 1px solid; border-radius: 999px; font-size: 0.69rem; font-weight: 650; line-height: 1; white-space: nowrap; }
.membership-purple { color: #c084fc; border-color: rgba(192, 132, 252, 0.25); background: rgba(192, 132, 252, 0.08); }
.membership-orange { color: #fb923c; border-color: rgba(251, 146, 60, 0.25); background: rgba(251, 146, 60, 0.08); }
.membership-pink { color: #f472b6; border-color: rgba(244, 114, 182, 0.25); background: rgba(244, 114, 182, 0.08); }
.membership-red { color: #f87171; border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.08); }
.membership-blue { color: #60a5fa; border-color: rgba(96, 165, 250, 0.25); background: rgba(96, 165, 250, 0.08); }
.membership-green { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.membership-default { color: var(--color-texto-general, #ffffff); border-color: var(--line); background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); }

/* MONTO */
.status-badge { min-height: 27px; display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px; border: 1px solid transparent; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.status-badge.income { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.status-badge.income::before { content: ''; width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.12); }

.badges-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }

.card-meta { display: flex; flex-direction: column; gap: 7px; color: var(--muted); font-size: 0.78rem; }
.meta-row { min-width: 0; display: flex; align-items: center; gap: 7px; }
.meta-row svg { flex-shrink: 0; opacity: 0.65; }
.email-text { overflow-wrap: anywhere; color: #93c5fd; }
.expiration-warning, .vence-label { color: #fb923c; }
.expiration-warning { font-weight: 500; }
.vence-label { font-weight: 600; }
.phone-text { color: var(--muted); }

/* EMPTY */
.empty-state-cell { padding: 0 !important; border-top: none !important; }
.empty-state, .empty-state-mobile { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 45px 20px; color: var(--muted); font-size: 0.82rem; font-weight: 500; text-align: center; }
.empty-state svg, .empty-state-mobile svg { opacity: 0.4; }

/* MODALES */
.modal-wrapper { position: fixed; z-index: 9999; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, 0.78); }
.modal-body-custom { padding: 10px 5px; color: var(--color-texto-general, #ffffff); text-align: center; }
.modal-icon-container { width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border-radius: 15px; }
.danger-bg { border: 1px solid rgba(248, 113, 113, 0.2); background: rgba(248, 113, 113, 0.08); }
.modal-body-custom h2 { margin: 0 0 9px; color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.25rem; font-weight: 600; }
.modal-body-custom p { margin: 0 0 22px; color: var(--muted); font-size: 0.8rem; line-height: 1.6; }
.highlight-name { color: var(--color-titulos, #ffffff); font-weight: 700; }
.modal-buttons { display: flex; gap: 10px; }
.btn-modal { min-height: 42px; flex: 1; padding: 0 16px; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer; transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
.btn-modal.secondary { border: 1px solid var(--line); background: color-mix(in srgb, var(--color-texto-general, #ffffff) 4%, transparent); color: var(--color-texto-general, #d1d5db); }
.btn-modal.secondary:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 8%, transparent); transform: translateY(-1px); }
.btn-modal.danger { border: 1px solid rgba(239, 68, 68, 0.75); background: #dc2626; color: #ffffff; }
.btn-modal.danger:hover { background: #ef4444; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.2); transform: translateY(-1px); }

:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important; max-width: 480px !important; box-sizing: border-box !important;
  left: 50% !important; right: auto !important; margin: 0 auto !important; transform: translateX(-50%) !important;
}

/* PAGINACIÓN */
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.pager-btn { width: 40px; height: 40px; display: grid; place-items: center; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-small, var(--r-sm, 10px)); background: var(--card-bg, var(--bg-cards, #121416)); color: var(--color-texto-general, #e5e7eb); cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease; }
.pager-btn:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--color-titulos, #ffffff); transform: translateY(-1px); }
.pager-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pager-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.pager-info { min-width: 64px; color: var(--muted); font-size: 0.8rem; font-weight: 600; text-align: center; }
.pager-info b { color: var(--color-titulos, #ffffff); font-weight: 700; }

.pop-enter-active, .pop-leave-active { transition: opacity 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }

.search-input:focus-visible, .status-select:focus-visible, .btn-bulk:focus-visible,
.btn-modal:focus-visible, .search-clear:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* TABLET */
@media (max-width: 1150px) {
  .main-content { padding: 30px 24px 48px; }
  .header-section { align-items: flex-start; flex-direction: column; gap: 17px; }
  .actions-bar { width: 100%; justify-content: flex-start; }
  .search-wrapper { flex: 1; min-width: 220px; }
  .search-input, .search-input:focus { width: 100%; }
}

/* MÓVIL */
@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .main-content { width: 100%; max-width: 100%; padding: 20px 14px 36px; overflow-x: hidden; }
  .header-section { width: 100%; align-items: stretch; margin-bottom: 16px; }
  .title-wrapper { width: 100%; min-width: 0; }
  .main-title { font-size: 1.85rem; }
  .main-subtitle { max-width: 100%; font-size: 0.76rem; }

  .actions-bar { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .search-wrapper { width: 100%; min-width: 0; grid-column: 1 / -1; grid-row: 1; }
  .search-input, .search-input:focus { width: 100%; }
  .select-wrapper { width: 100%; min-width: 0; }
  .status-select { width: 100%; min-width: 0; text-overflow: ellipsis; }
  .btn-bulk { width: 100%; min-width: 0; min-height: 44px; }

  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 14px; }
  .stat-card { padding: 12px 14px; }
  .stat-value { font-size: 1.2rem; }

  .user-card { position: relative; width: 100%; overflow: hidden; margin-bottom: 11px; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 9px 28px rgba(0, 0, 0, 0.17); }
  .user-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: #34d399; }
  .card-top-section { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
  .user-card .avatar-small { width: 44px; height: 44px; border-radius: 12px; font-size: 0.78rem; }
  .card-user-titles { min-width: 0; display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 7px; }
  .name-text { width: 100%; overflow: hidden; color: var(--color-titulos, #ffffff); font-size: 0.88rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
  .card-meta { display: grid; gap: 8px; padding: 11px 12px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent); font-size: 0.75rem; }
  .email-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .empty-state-mobile { min-height: 240px; margin-top: 8px; border: 1px dashed var(--line); border-radius: var(--radius); background: var(--card-bg); }
}

/* TELÉFONOS */
@media (max-width: 560px) {
  .main-content { padding: 17px 11px 30px; }
  .main-title { font-size: 1.7rem; }
  .actions-bar { grid-template-columns: 1fr; }
  .search-wrapper, .select-wrapper, .btn-bulk { grid-column: 1; }
  .search-wrapper { grid-row: auto; }
  .user-card { padding: 15px; }
}

@media (max-width: 380px) {
  .main-content { padding-left: 9px; padding-right: 9px; }
  .main-title { font-size: 1.55rem; }
  .stat-value { font-size: 1.05rem; }
  .status-badge, .status-badge2 { font-size: 0.65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .search-input, .status-select, .btn-bulk, .user-table tbody tr, .btn-modal,
  .pop-enter-active, .pop-leave-active { transition: none !important; }
}
</style>