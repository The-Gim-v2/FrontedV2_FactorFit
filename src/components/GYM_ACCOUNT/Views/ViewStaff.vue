<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('staffTitle') }}</h1>
          <p class="result-count">{{ filteredUsers.length }} {{ filteredUsers.length === 1 ? t('resultSingular') : t('resultPlural') }}</p>
        </div>
        <div class="actions-bar" id="tutorial-step-0">
            <select class="status-select" v-model="selectedRoleFilter">
              <option value="Todos">{{ t('roleAll') }}</option>
              <option value="Propietario">{{ L('Propietario', 'Owner', 'Propriétaire', 'Proprietário') }}</option>
              <option value="Gerente">{{ L('Gerente', 'Manager', 'Gérant', 'Gerente') }}</option>
              <option value="Entrenador">{{ t('roleTrainer') }}</option>
              <option value="Recepcionista">{{ t('roleReceptionist') }}</option>
            </select>
            <button class="btn-bulk" @click="activeModal = 'enviomasivo'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {{ t('bulkEmailBtn') }}
            </button>
            <div class="search-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="search-input" :placeholder="t('searchPlaceholder')" v-model="searchQuery">
            </div>
        </div>
      </header>
      <p v-if="loadingUsers" class="data-message">Cargando personal registrado...</p>
      <p v-if="errorUsers" class="data-message" role="alert">
        {{ errorUsers }} <button type="button" @click="cargarPersonal">Reintentar</button>
      </p>
      <div v-if="!isMobile" class="table-container desktop-only" id="tutorial-step-1">
        <table class="user-table" v-if="filteredUsers.length">
          <thead>
            <tr>
              <th>{{ t('tablePhoto') }}</th>
              <th>{{ t('tableName') }}</th>
              <th>{{ t('tableEmail') }}</th>
              <th>{{ t('tablePhone') }}</th>
              <th>{{ t('tableSystemRole') }}</th>
              <th class="th-actions">{{ t('tableActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in pagedUsers" :key="user.id">
              <td><div class="avatar-small" :style="{ background: avatarColor(user.name) }">
                  <img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" />
                  <span v-else>{{ initials(user.name) }}</span>
                </div></td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email }}</td>
              <td class="text-muted">{{ user.phone }}</td>
              <td><span :class="['status-badge', getRoleClass(user.role)]"><i class="status-dot"></i>{{ roleText(user.role) }}</span></td>
              <td class="actions-cell" :id="index === 0 ? 'tutorial-step-2' : null">
                <button class="icon-btn btn-email" :title="t('actionEmail')" @click="activeModal = 'enviocorreo'">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </button>
                <button class="icon-btn btn-wa" :title="t('actionWhatsApp')" @click="openWhatsApp(user.phone)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 5.6 8.5 8.5 0 0 1-7.6-5.6 8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/><path d="M9 12l2 2 4-4"/></svg>
                </button>
                <button class="icon-btn btn-edit" :title="t('actionEdit')" @click="goToEdit(user.id)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="false" class="icon-btn btn-delete" :title="t('actionDelete')" @click="confirmDelete(user)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loadingUsers && !errorUsers" class="empty-state">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>{{ t('emptyStateText') || 'Sin resultados para tu búsqueda' }}</p>
        </div>
      </div>
      <!-- VISTA MÓVIL (Renderizada solo si SÍ es móvil) -->
      <div v-else class="mobile-only">
        <div v-if="!loadingUsers && !errorUsers && !filteredUsers.length" class="empty-state">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>{{ t('emptyStateText') || 'Sin resultados para tu búsqueda' }}</p>
        </div>
        <div v-for="(user, index) in pagedUsers" :key="user.id" class="user-card" :id="index === 0 ? 'tutorial-step-1' : null">
           <div class="card-top-section">
            <div class="avatar-small" :style="{ background: avatarColor(user.name) }">
                  <img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" />
                  <span v-else>{{ initials(user.name) }}</span>
                </div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <span :class="['status-badge', getRoleClass(user.role)]"><i class="status-dot"></i>{{ roleText(user.role) }}</span>
            </div>
          </div>
          <div class="card-meta">
            <span class="email-text">{{ user.email }}</span>
            <span class="phone-text">{{ user.phone }}</span>
          </div>
          <div class="card-actions" :id="index === 0 ? 'tutorial-step-2' : null">
            <button class="action-chip btn-email-chip" @click="activeModal = 'enviocorreo'">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>Email</span>
            </button>
            <button class="action-chip btn-wa-chip" @click="openWhatsApp(user.phone)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 5.6 8.5 8.5 0 0 1-7.6-5.6 8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/><path d="M9 12l2 2 4-4"/></svg>
              <span>WApp</span>
            </button>
            <button class="action-chip btn-edit-chip" @click="goToEdit(user.id)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>{{ t('actionEdit') }}</span>
            </button>
            <button v-if="false" class="action-chip btn-delete-chip" @click="confirmDelete(user)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>{{ t('actionDelete') }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- PAGINACIÓN (solo con más de 40 resultados) -->
      <nav v-if="showPager" class="pager" :aria-label="pagerLabel(0)">
        <button class="pager-btn" type="button" :disabled="page <= 1" :aria-label="pagerLabel(1)" @click="goPage(page - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page >= totalPages" :aria-label="pagerLabel(2)" @click="goPage(page + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>
      <!-- Modal QR -->
      <ModalComponent :isOpen="showQR" @close="showQR = false">
        <div class="modal-body-custom">
          <h2 class="modal-heading-accent">{{ t('modalQrTitle') }}</h2>
          <div class="qr-wrapper">
              <img src="../../../assets/qr.png" alt="QR" class="qr-image" />
          </div>
          <p class="modal-subtext">
              {{ t('modalQrText') }}
          </p>
          <button class="btn-bulk btn-block">{{ t('modalQrDownload') }}</button>
        </div>
      </ModalComponent>
    </main>
    <!-- Modal de Eliminación -->
    <transition name="pop">
      <div v-if="false && showDelete" class="modal-wrapper" @click.self="showDelete = false">
        <div class="custom-modal-card">
          <div class="modal-body-custom">
            <div class="modal-icon-container danger-bg">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2>{{ t('modalDeleteTitle') }}</h2>
            <p>{{ t('modalDeleteDescPart1') }} <span class="highlight-name">{{ selectedUser?.name }}</span> {{ t('modalDeleteDescPart2') }}</p>
            <div class="modal-buttons">
              <button class="btn-modal secondary" @click="showDelete = false">{{ t('modalCancel') }}</button>
              <button class="btn-modal danger" @click="executeDelete">{{ t('modalConfirm') }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="pop">
      <div v-if="activeModal === 'enviomasivo'" class="modal-wrapper" @click.self="activeModal = null">
        <CorreoMasivo @close="activeModal = null" />
      </div>
    </transition>
    <transition name="pop">
      <div v-if="activeModal === 'enviocorreo'" class="modal-wrapper" @click.self="activeModal = null">
        <EnvioCorreo @close="activeModal = null" />
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import ModalComponent from '../../Modals/ModalComponent.vue';
import CorreoMasivo from '../Componets/Bulk-Email.vue';
import EnvioCorreo from '../Componets/Mail.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';
const activeModal = ref(null);
const toastRef = ref(null);
const router = useRouter();
const showQR = ref(false);
const showDelete = ref(false);
const selectedUser = ref(null);
const searchQuery = ref('');
const selectedRoleFilter = ref('Todos');
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const t = (key) => {
  const langTable = traducciones[currentLang.value] || traducciones.es;
  return langTable[key] || traducciones.es[key] || key;
};
// Texto en 4 idiomas para cadenas que no están en i18n.js
const L = (es, en, fr, pt) => {
  const texts = { es, en, fr: fr ?? en, pt: pt ?? en };
  return texts[currentLang.value] ?? es;
};
const handleLangChange = (e) => {
  if (e.detail && e.detail.idioma) {
    currentLang.value = e.detail.idioma;
  }
};
// Detección reactiva para saber si está en móvil (< 900px)
const isMobile = ref(window.innerWidth <= 900);
const handleResize = () => {
  isMobile.value = window.innerWidth <= 900;
};
onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('idioma-changed', handleLangChange);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('idioma-changed', handleLangChange);
});
// Texto del rol traducido según el idioma actual
const roleText = (role) => {
  const labels = {
    'Propietario': L('Propietario', 'Owner', 'Propriétaire', 'Proprietário'),
    'Gerente': L('Gerente', 'Manager', 'Gérant', 'Gerente'),
    'Entrenador': t('roleTrainer'),
    'Recepcionista': t('roleReceptionist')
  };
  return labels[role] || role;
};
const filteredUsers = computed(() => {
  let result = selectedRoleFilter.value === 'Todos'
    ? users.value
    : users.value.filter(user => user.role === selectedRoleFilter.value);
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    result = result.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      roleText(user.role).toLowerCase().includes(term) ||
      user.id.toString().includes(term)
    );
  }
  return result;
});
// Paginación: se muestra solo cuando hay más de 40 resultados
const PAGE_SIZE = 40;
const page = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)));
const showPager = computed(() => filteredUsers.value.length > PAGE_SIZE);
const pagedUsers = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredUsers.value.slice(start, start + PAGE_SIZE);
});
const goPage = (n) => {
  page.value = Math.min(Math.max(1, n), totalPages.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
watch([searchQuery, selectedRoleFilter], () => { page.value = 1; });
const pagerLabels = {
  es: ['Paginación', 'Página anterior', 'Página siguiente'],
  en: ['Pagination', 'Previous page', 'Next page'],
  fr: ['Pagination', 'Page précédente', 'Page suivante'],
  pt: ['Paginação', 'Página anterior', 'Próxima página']
};
const pagerLabel = (i) => (pagerLabels[currentLang.value] || pagerLabels.es)[i];
const getRoleClass = (role) => {
  const classes = {
    'Propietario': 'role-propietario',
    'Gerente': 'role-gerente',
    'Entrenador': 'role-entrenador',
    'Recepcionista': 'role-recepcionista'
  };
  return classes[role] || 'role-default';
};
// --- Iniciales y color de avatar (identidad visual consistente por usuario) ---
const AVATAR_PALETTE = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#ef4444'];
const initials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const second = parts.length > 1 ? parts[1][0] : '';
  return (first + second).toUpperCase();
};
const avatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  return `linear-gradient(135deg, ${color}, ${color}99)`;
};
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const users = ref([]);
const loadingUsers = ref(false);
const errorUsers = ref('');
const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['token', 'auth_token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken']) {
      const value = storage.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth', 'user', 'session', 'gymAccount', 'gym_account']) {
      try {
        const data = JSON.parse(storage.getItem(key) || 'null');
        const token = data?.token || data?.access_token || data?.accessToken;
        if (token) return token;
      } catch { /* Sin sesión en esta clave */ }
    }
  }
  return '';
};
const cargarPersonal = async () => {
  loadingUsers.value = true;
  errorUsers.value = '';
  try {
    const token = getToken();
    if (!token) throw new Error('No se encontró el token de sesión.');
    const response = await fetch(
        `${API}/api/personal?sede_id=${encodeURIComponent(sedeId)}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || `Error HTTP ${response.status}`);
    const rows = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : []);
    const roles = {
      GYM_ADMIN: 'Propietario', GYM_MANAGER: 'Gerente',
      GYM_COACH: 'Entrenador', GYM_RECEPCIONIST: 'Recepcionista'
    };
    users.value = rows.map(row => ({
      id: Number(row.ID_Personal),
      name: [row.Nombre, row.Apellido_P, row.Apellido_M].filter(Boolean).join(' '),
      email: row.Correo_Electronico || '',
      phone: row.Celular || '',
      role: roles[row.Nombre_Rol] || row.Nombre_Rol || 'Sin rol',
      status: row.Status || 'Activo',
      sede: row.Nombre_Sede || '',
      foto: row.foto_url || null
    }));
  } catch (error) {
    users.value = [];
    errorUsers.value = error.message || 'No se pudo cargar el personal.';
    toastRef.value?.notify(errorUsers.value, 'error');
  } finally {
    loadingUsers.value = false;
  }
};
onMounted(() => {
  cargarPersonal();
  window.addEventListener('factorfit:branch-changed', cargarPersonal);
});
onUnmounted(() => window.removeEventListener('factorfit:branch-changed', cargarPersonal));
const confirmDelete = (user) => {
  selectedUser.value = user;
  showDelete.value = true;
};
const executeDelete = () => {
  toastRef.value?.notify('La eliminación de personal requiere un endpoint en Laravel.', 'error');
  showDelete.value = false;
};
const goToEdit = (id) => router.push(`/GYM_ACCOUNT/editar-staff/${id}`);
const openWhatsApp = (phone) => window.open(`https\://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
// va al final: totalPages depende de `users`, que se declara arriba
watch(totalPages, (n) => { if (page.value > n) page.value = n; });
</script>
<style scoped>
@import url('https\://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600&display=swap');
/* =========================================================
   PANEL DE PERSONAL
   Estilo adaptado desde el Panel de Usuarios
\========================================================= */
.main-content,
.modal-wrapper {
  --line: color-mix(
    in srgb,
    var(--color-texto-general, #94a3b8) 16%,
    transparent
  );
  --line-soft: color-mix(
    in srgb,
    var(--color-texto-general, #94a3b8) 9%,
    transparent
  );
  --surface-2: color-mix(
    in srgb,
    var(--color-texto-general, #94a3b8) 6%,
    transparent
  );
  --accent: var(--color-highlight, #3b82f6);
  --btn: var(--color-botones, #1c4fd6);
  --btn-text: var(--color-texto-botones, #fff);
  --r: var(--app-border-radius, 16px);
  --r-sm: calc(var(--app-border-radius, 16px) * 0.55);
  --muted: color-mix(
    in srgb,
    var(--color-texto-general, #94a3b8) 85%,
    transparent
  );
}
* {
  box-sizing: border-box;
}
.main-content {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 36px 36px 56px;
  color: var(--color-texto-general, #e5e7eb);
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* =========================================================
   COLORES POR ROL
\========================================================= */
.role-propietario {
  --tone: #fbbf24; /* dorado */
}
.role-gerente {
  --tone: #c084fc; /* morado */
}
.role-entrenador {
  --tone: #60a5fa; /* azul */
}
.role-recepcionista {
  --tone: #34d399; /* verde */
}
.role-default {
  --tone: #cbd5e1;
}
/* =========================================================
   CABECERA
\========================================================= */
.header-section {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}
.title-wrapper {
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.main-title {
  margin: 0;
  color: var(--color-titulos, #fff);
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.9rem, 3vw, 2.6rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.result-count {
  align-self: flex-start;
  margin: 0;
  padding: 4px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
}
/* =========================================================
   BARRA DE ACCIONES
\========================================================= */
.actions-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.status-select,
.search-input,
.btn-bulk {
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--bg-cards, #14161b);
  color: var(--color-texto-general, #e5e7eb);
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
/* =========================================================
   SELECT DE ROLES
\========================================================= */
.status-select {
  min-width: 165px;
  padding: 0 38px 0 14px;
  cursor: pointer;
  appearance: auto;
}
.status-select:hover {
  border-color:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 26%,
      transparent
    );
  background:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 4%,
      var(--bg-cards, #14161b)
    );
}
.status-select:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(--accent) 15%,
      transparent
    );
}
.status-select option {
  background: var(--bg-cards, #14161b);
  color: var(--color-texto-general, #fff);
}
/* =========================================================
   BUSCADOR
\========================================================= */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  z-index: 1;
  left: 13px;
  pointer-events: none;
  color: var(--muted);
  opacity: 0.75;
}
.search-input {
  width: 230px;
  padding: 0 14px 0 39px;
}
.search-input::placeholder {
  color: var(--muted);
  opacity: 0.7;
}
.search-input:hover {
  border-color:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 26%,
      transparent
    );
}
.search-input:focus {
  width: 260px;
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(--accent) 15%,
      transparent
    );
}
/* =========================================================
   BOTÓN CORREO MASIVO - AZUL
\========================================================= */
.btn-bulk {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--color-botones, #2563eb);
  border-radius: var(--r-sm);
  background: var(--color-botones, #2563eb);
  color: var(--color-texto-botones, #ffffff);
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  box-shadow:
    0 4px 12px rgba(37, 99, 235, 0.18);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.btn-bulk svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--color-texto-botones, #ffffff);
  stroke: currentColor;
}
.btn-bulk:hover {
  transform: translateY(-1px);
  background:
    color-mix(
      in srgb,
      var(--color-botones, #2563eb) 88%,
      white
    );
  border-color:
    color-mix(
      in srgb,
      var(--color-botones, #2563eb) 88%,
      white
    );
  box-shadow:
    0 7px 18px rgba(37, 99, 235, 0.28);
}
.btn-bulk:active {
  transform: translateY(0);
  box-shadow:
    0 3px 8px rgba(37, 99, 235, 0.2);
}
.btn-bulk:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px
      color-mix(
        in srgb,
        var(--color-botones, #2563eb) 25%,
        transparent
      ),
    0 5px 14px rgba(37, 99, 235, 0.22);
}
.btn-block {
  width: 100%;
}
/* =========================================================
   VISIBILIDAD
\========================================================= */
.desktop-only {
  display: block;
}
.mobile-only {
  display: none;
}
/* =========================================================
   CONTENEDOR DE TABLA
\========================================================= */
.table-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--bg-cards, #121419);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.2);
}
.table-container::before {
  content: '';
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  left: 0;
  height: 2px;
  background:
    linear-gradient(
      90deg,
      transparent,
      var(--accent),
      transparent
    );
  opacity: 0.7;
}
/* =========================================================
   TABLA
\========================================================= */
.user-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--color-texto-general, #e5e7eb);
  text-align: left;
}
.user-table thead {
  background:
    color-mix(
      in srgb,
      var(--bg-cards, #121419) 94%,
      var(--color-texto-general, #fff)
    );
}
.user-table th {
  padding: 15px 18px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.065em;
  text-transform: uppercase;
  white-space: nowrap;
}
.user-table td {
  padding: 14px 18px;
  border-top: 1px solid var(--line-soft);
  font-size: 0.82rem;
  vertical-align: middle;
}
.user-table tbody tr {
  position: relative;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease;
}
.user-table tbody tr:nth-child(even) {
  background:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 0.8%,
      transparent
    );
}
.user-table tbody tr:hover {
  background:
    color-mix(
      in srgb,
      var(--accent) 5%,
      transparent
    );
}
.user-table tbody tr:hover td {
  border-top-color:
    color-mix(
      in srgb,
      var(--accent) 12%,
      transparent
    );
}
.th-actions {
  text-align: left;
}
/* =========================================================
   TEXTO
\========================================================= */
.text-bold {
  color: var(--color-titulos, #f8fafc);
  font-weight: 600;
}
.text-muted {
  color: var(--muted);
  font-weight: 400;
}
/* =========================================================
   AVATAR
\========================================================= */
.avatar-small {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border:
    1px solid
    color-mix(
      in srgb,
      white 18%,
      transparent
    );
  border-radius: 12px;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  box-shadow:
    0 5px 14px rgba(0, 0, 0, 0.22);
}
/* =========================================================
   BADGES DE ROL
\========================================================= */
.status-badge {
  width: fit-content;
  min-height: 27px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border:
    1px solid
    color-mix(
      in srgb,
      var(--tone, #cbd5e1) 28%,
      transparent
    );
  border-radius: 999px;
  background:
    color-mix(
      in srgb,
      var(--tone, #cbd5e1) 9%,
      transparent
    );
  color: var(--tone, #cbd5e1);
  font-size: 0.7rem;
  font-weight: 650;
  white-space: nowrap;
}
.status-dot {
  width: 6px;
  height: 6px;
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      currentColor 12%,
      transparent
    );
}
/* =========================================================
   ACCIONES DE TABLA
\========================================================= */
.actions-cell {
  display: flex;
  align-items: center;
  gap: 7px;
}
.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border: 1px solid var(--line);
  border-radius: 10px;
  background:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 2.5%,
      transparent
    );
  color: var(--muted);
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.icon-btn svg {
  width: 17px;
  height: 17px;
}
.icon-btn:hover {
  transform: translateY(-2px);
}
.icon-btn:active {
  transform: translateY(0);
}
/* EMAIL */
.btn-email:hover {
  color: #38bdf8;
  border-color:
    rgba(56, 189, 248, 0.3);
  background:
    rgba(56, 189, 248, 0.08);
  box-shadow:
    0 7px 16px
    rgba(56, 189, 248, 0.08);
}
/* WHATSAPP */
.btn-wa:hover {
  color: #4ade80;
  border-color:
    rgba(74, 222, 128, 0.3);
  background:
    rgba(74, 222, 128, 0.08);
  box-shadow:
    0 7px 16px
    rgba(74, 222, 128, 0.08);
}
/* EDITAR */
.btn-edit:hover {
  color: #fbbf24;
  border-color:
    rgba(251, 191, 36, 0.3);
  background:
    rgba(251, 191, 36, 0.08);
  box-shadow:
    0 7px 16px
    rgba(251, 191, 36, 0.08);
}
/* ELIMINAR */
.btn-delete:hover {
  color: #f87171;
  border-color:
    rgba(248, 113, 113, 0.3);
  background:
    rgba(248, 113, 113, 0.08);
  box-shadow:
    0 7px 16px
    rgba(248, 113, 113, 0.08);
}
/* =========================================================
   ESTADO VACÍO
\========================================================= */
.empty-state {
  min-height: 330px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  padding: 60px 20px;
  color: var(--muted);
  text-align: center;
}
.empty-state svg {
  opacity: 0.4;
}
.empty-state p {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 500;
  opacity: 0.8;
}
/* =========================================================
   MODAL WRAPPER
\========================================================= */
.modal-wrapper {
  position: fixed;
  z-index: 9999;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    rgba(0, 0, 0, 0.78);
}
/*
  No usamos backdrop-filter.
  Evita cuadros/artefactos negros en algunos navegadores
  durante el scroll.
*/
/* =========================================================
   TARJETA MODAL
\========================================================= */
.custom-modal-card {
  position: relative;
  width: min(100%, 420px);
  overflow: hidden;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--bg-cards, #181a20);
  color: var(--color-texto-general, #e5e7eb);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.55);
}
.modal-body-custom {
  padding: 3px;
  text-align: center;
}
.modal-body-custom h2 {
  margin: 0 0 10px;
  color: var(--color-titulos, #fff);
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
}
.modal-body-custom p {
  margin: 0 0 22px;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.6;
}
/* =========================================================
   MODAL ELIMINAR
\========================================================= */
.modal-icon-container {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border-radius: 15px;
}
.danger-bg {
  border:
    1px solid
    rgba(248, 113, 113, 0.2);
  background:
    rgba(248, 113, 113, 0.08);
}
.highlight-name {
  color: var(--color-titulos, #fff);
  font-weight: 700;
}
.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.btn-modal {
  min-height: 42px;
  flex: 1;
  padding: 0 16px;
  cursor: pointer;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 650;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.btn-modal:hover {
  transform: translateY(-1px);
}
.btn-modal:active {
  transform: translateY(0);
}
.btn-modal.secondary {
  border: 1px solid var(--line);
  background:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 4%,
      transparent
    );
  color: var(--color-texto-general, #d1d5db);
}
.btn-modal.secondary:hover {
  background:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 8%,
      transparent
    );
}
.btn-modal.danger {
  border:
    1px solid
    rgba(239, 68, 68, 0.75);
  background: #dc2626;
  color: #fff;
}
.btn-modal.danger:hover {
  background: #ef4444;
  box-shadow:
    0 8px 20px
    rgba(239, 68, 68, 0.2);
}
/* =========================================================
   QR
\========================================================= */
.modal-heading-accent {
  margin-bottom: 8px !important;
  color: var(--accent) !important;
}
.modal-subtext {
  margin: 16px 0 20px !important;
}
.qr-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background:
    color-mix(
      in srgb,
      var(--color-texto-general, #fff) 3%,
      transparent
    );
}
.qr-image {
  width: 180px;
  max-width: 100%;
  display: block;
  border-radius: 10px;
}
/* =========================================================
   NOTIFICACIONES
\========================================================= */
:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important;
  max-width: 480px !important;
  box-sizing: border-box !important;
  left: 50% !important;
  right: auto !important;
  margin: 0 auto !important;
  transform:
    translateX(-50%) !important;
}
/* =========================================================
   TRANSICIONES
\========================================================= */
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.2s ease;
}
.pop-enter-active .custom-modal-card,
.pop-leave-active .custom-modal-card {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}
.pop-enter-from .custom-modal-card,
.pop-leave-to .custom-modal-card {
  opacity: 0;
  transform:
    translateY(10px)
    scale(0.985);
}
/* =========================================================
   TABLET
\========================================================= */
@media (max-width: 1150px) {
  .main-content {
    padding:
      30px 24px
      48px;
  }
  .header-section {
    align-items: flex-start;
    flex-direction: column;
    gap: 17px;
  }
  .actions-bar {
    width: 100%;
    justify-content: flex-start;
  }
  .search-wrapper {
    min-width: 210px;
    flex: 1;
  }
  .search-input,
  .search-input:focus {
    width: 100%;
  }
}
/* =========================================================
   MÓVIL
\========================================================= */
@media (max-width: 900px) {
  .desktop-only {
    display: none !important;
  }
  .mobile-only {
    display: block !important;
  }
  .main-content {
    padding:
      20px 14px
      34px;
  }
  /* ---------------------------------------------------------
     HEADER
  --------------------------------------------------------- */
  .header-section {
    margin-bottom: 18px;
  }
  .title-wrapper {
    width: 100%;
    gap: 7px;
  }
  .main-title {
    font-size: 1.85rem;
  }
  .result-count {
    font-size: 0.72rem;
    padding: 4px 10px;
  }
  /* ---------------------------------------------------------
     FILTROS
  --------------------------------------------------------- */
  .actions-bar {
    display: grid;
    grid-template-columns:
      1fr 1fr;
    gap: 9px;
  }
  .search-wrapper {
    width: 100%;
    grid-column:
      1 / -1;
    grid-row: 1;
  }
  .search-input,
  .search-input:focus {
    width: 100%;
  }
  .status-select {
    width: 100%;
    min-width: 0;
  }
  .btn-bulk {
    width: 100%;
    grid-column:
      1 / -1;
  }
  /* =========================================================
     TARJETAS PERSONAL
  ========================================================= */
  .user-card {
    position: relative;
    overflow: hidden;
    margin-bottom: 11px;
    padding: 17px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--bg-cards, #14161b);
    box-shadow:
      0 9px 28px rgba(0, 0, 0, 0.17);
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease;
  }
  .user-card::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    background: var(--accent);
    opacity: 0.65;
  }
  .user-card:active {
    transform: scale(0.995);
    border-color:
      color-mix(
        in srgb,
        var(--accent) 25%,
        var(--line)
      );
  }
  /* ---------------------------------------------------------
     CABECERA TARJETA
  --------------------------------------------------------- */
  .card-top-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 13px;
  }
  .user-card .avatar-small {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    font-size: 0.8rem;
  }
  .card-user-titles {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
  }
  .name-text {
    width: 100%;
    overflow: hidden;
    color: var(--color-titulos, #fff);
    font-size: 0.9rem;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* ---------------------------------------------------------
     INFORMACIÓN
  --------------------------------------------------------- */
  .card-meta {
    display: grid;
    gap: 6px;
    margin-bottom: 13px;
    padding: 11px 12px;
    border: 1px solid var(--line-soft);
    border-radius: 11px;
    background:
      color-mix(
        in srgb,
        var(--color-texto-general, #fff) 2%,
        transparent
      );
    font-size: 0.75rem;
  }
  .email-text {
    overflow: hidden;
    color: var(--color-texto-general, #cbd5e1);
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.82;
  }
  .phone-text {
    color: var(--muted);
    opacity: 0.82;
  }
  /* ---------------------------------------------------------
     ACCIONES
  --------------------------------------------------------- */
  .card-actions {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 7px;
    padding-top: 13px;
    border-top: 1px solid var(--line-soft);
  }
  .action-chip {
    min-width: 0;
    min-height: 55px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 4px;
    cursor: pointer;
    border: 1px solid var(--line);
    border-radius: 10px;
    background:
      color-mix(
        in srgb,
        var(--color-texto-general, #fff) 2.2%,
        transparent
      );
    color: var(--muted);
    font-family: 'Inter', sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    transition:
      color 0.16s ease,
      background 0.16s ease,
      border-color 0.16s ease,
      transform 0.16s ease;
  }
  .action-chip svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  .action-chip:active {
    transform: scale(0.96);
  }
  /* EMAIL */
  .btn-email-chip {
    color: #38bdf8;
  }
  .btn-email-chip:hover {
    border-color:
      rgba(56, 189, 248, 0.25);
    background:
      rgba(56, 189, 248, 0.07);
  }
  /* WHATSAPP */
  .btn-wa-chip {
    color: #4ade80;
  }
  .btn-wa-chip:hover {
    border-color:
      rgba(74, 222, 128, 0.25);
    background:
      rgba(74, 222, 128, 0.07);
  }
  /* EDITAR */
  .btn-edit-chip {
    color: #fbbf24;
  }
  .btn-edit-chip:hover {
    border-color:
      rgba(251, 191, 36, 0.25);
    background:
      rgba(251, 191, 36, 0.07);
  }
  /* ELIMINAR */
  .btn-delete-chip {
    color: #f87171;
  }
  .btn-delete-chip:hover {
    border-color:
      rgba(248, 113, 113, 0.25);
    background:
      rgba(248, 113, 113, 0.07);
  }
  /* ---------------------------------------------------------
     EMPTY STATE
  --------------------------------------------------------- */
  .empty-state {
    min-height: 260px;
    padding: 45px 20px;
    border: 1px dashed var(--line);
    border-radius: var(--r);
    background: var(--bg-cards, #14161b);
  }
}
/* =========================================================
   TELÉFONOS
\========================================================= */
@media (max-width: 560px) {
  .main-content {
    padding:
      17px 11px
      30px;
  }
  .main-title {
    font-size: 1.7rem;
  }
  .actions-bar {
    grid-template-columns: 1fr;
  }
  .search-wrapper,
  .status-select,
  .btn-bulk {
    grid-column: 1;
  }
  .status-select,
  .search-input,
  .btn-bulk {
    min-height: 43px;
  }
  .user-card {
    padding: 15px;
  }
  .card-actions {
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 5px;
  }
  .action-chip {
    min-height: 52px;
    padding:
      6px 2px;
    font-size: 0.56rem;
  }
  .custom-modal-card {
    padding:
      24px 19px;
  }
}
/* =========================================================
   TELÉFONOS MUY PEQUEÑOS
\========================================================= */
@media (max-width: 380px) {
  .card-actions {
    grid-template-columns:
      repeat(2, 1fr);
  }
  .action-chip {
    min-height: 50px;
    flex-direction: row;
    gap: 7px;
    font-size: 0.62rem;
  }
}
/* =========================================================
   ACCESIBILIDAD
\========================================================= */
@media (prefers-reduced-motion: reduce) {
  .status-select,
  .search-input,
  .btn-bulk,
  .icon-btn,
  .user-card,
  .action-chip,
  .btn-modal,
  .pop-enter-active,
  .pop-leave-active,
  .pop-enter-active .custom-modal-card,
  .pop-leave-active .custom-modal-card {
    transition: none !important;
  }
}
/* ---------- Paginación (solo con más de 40 resultados) ---------- */
.pager { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.pager-btn { width: 40px; height: 40px; display: grid; place-items: center; padding: 0; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--bg-cards, #14161b); color: var(--color-texto-general, #e5e7eb); cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease; }
.pager-btn:hover:not(:disabled) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--color-titulos, #ffffff); transform: translateY(-1px); }
.pager-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pager-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.pager-info { min-width: 64px; color: var(--muted); font-size: 0.8rem; font-weight: 600; text-align: center; }
.pager-info b { color: var(--color-titulos, #ffffff); font-weight: 700; }
.avatar-small img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block; }
.data-message { padding: 14px 18px; margin: 12px 0; border: 1px solid var(--line); border-radius: 10px; color: var(--color-texto-general, #e5e7eb); }
.data-message button { margin-left: 10px; cursor: pointer; color: var(--accent); background: transparent; border: 0; font-weight: 600; }
</style>
