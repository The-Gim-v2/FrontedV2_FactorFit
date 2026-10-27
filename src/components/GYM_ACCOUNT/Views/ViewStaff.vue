<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('staffTitle') }}</h1>
          <p class="result-count">{{ filteredUsers.length }} {{ filteredUsers.length === 1 ? t('resultSingular') : t('resultPlural') }}</p>
        </div>
        <div class="actions-bar">
          <select v-model="selectedRoleFilter" class="status-select">
            <option value="Todos">Status (Todos)</option>
            <option value="Propietario">Propietario</option>
            <option value="Gerente">Gerente</option>
            <option value="Entrenador">{{ t('roleTrainer') }}</option>
            <option value="Recepcionista">{{ t('roleReceptionist') }}</option>
          </select>
          <button class="btn-bulk" @click="activeModal = 'enviomasivo'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Correo Masivo
          </button>
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQuery" class="search-input" type="text" :placeholder="t('searchPlaceholder')" />
          </div>
        </div>
      </header>

      <p v-if="loadingUsers" class="data-message">Cargando personal registrado...</p>
      <p v-if="errorUsers" class="data-message" role="alert">{{ errorUsers }} <button type="button" @click="cargarPersonal">Reintentar</button></p>

      <div class="table-container desktop-only">
        <table v-if="filteredUsers.length" class="user-table">
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
            <tr v-for="user in pagedUsers" :key="user.id" :class="getRoleClass(user.role)">
              <td><div class="avatar-small" :style="{ background: avatarColor(user.name) }"><img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" /><span v-else>{{ initials(user.name) }}</span></div></td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email }}</td>
              <td class="text-muted">{{ user.phone }}</td>
              <td><span :class="['status-badge', getRoleClass(user.role)]"><i class="status-dot"></i>{{ roleText(user.role) }}</span></td>
              <td class="actions-cell">
                <button class="icon-btn btn-email" :title="t('actionEmail')" @click="openEmail(user)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </button>
                <button class="icon-btn btn-wa" :title="t('actionWhatsApp')" @click="openWhatsApp(user.phone)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 5.6 8.5 8.5 0 0 1-7.6-5.6 8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/><path d="M9 12l2 2 4-4"/></svg>
                </button>
                <button class="icon-btn btn-edit" :title="t('actionEdit')" @click="goToEdit(user.id)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn btn-delete" title="Eliminar personal" @click="confirmDelete(user)">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loadingUsers && !errorUsers" class="empty-state">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>No hay personal registrado para esta sucursal o filtro.</p>
        </div>
      </div>

      <div class="mobile-only">
        <div v-if="!loadingUsers && !errorUsers && !filteredUsers.length" class="empty-state">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>No hay personal registrado para esta sucursal o filtro.</p>
        </div>
        <div v-for="user in pagedUsers" :key="user.id" class="user-card" :class="getRoleClass(user.role)">
          <div class="card-top-section">
            <div class="avatar-small" :style="{ background: avatarColor(user.name) }"><img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" /><span v-else>{{ initials(user.name) }}</span></div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <span class="status-badge" :class="getRoleClass(user.role)"><i class="status-dot"></i>{{ roleText(user.role) }}</span>
            </div>
          </div>
          <div class="card-meta">
            <span class="email-text">{{ user.email }}</span>
            <span class="phone-text">{{ user.phone || 'Sin teléfono' }}</span>
          </div>
          <div class="card-actions">
            <button class="action-chip btn-email-chip" @click="openEmail(user)">
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
            <button class="action-chip btn-delete-chip" @click="confirmDelete(user)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>{{ t('actionDelete') }}</span>
            </button>
          </div>
        </div>
      </div>

      <nav v-if="showPager" class="pager" aria-label="Paginación">
        <button class="pager-btn" type="button" :disabled="page <= 1" aria-label="Página anterior" @click="goPage(page - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page >= totalPages" aria-label="Página siguiente" @click="goPage(page + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>
    </main>

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
    <transition name="pop">
      <div v-if="showDelete" class="modal-wrapper" @click.self="closeDelete">
        <div class="custom-modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div class="modal-body-custom">
            <div class="modal-icon-container danger-bg">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 id="delete-title">Eliminar personal</h2>
            <p>¿Estás seguro de que deseas eliminar a <span class="highlight-name">{{ selectedUser?.name }}</span>?</p>
            <p class="delete-warning">El empleado dejará de aparecer en todas las sucursales asignadas. Su historial permanecerá guardado.</p>
            <div class="modal-buttons">
              <button type="button" class="btn-modal secondary" :disabled="deleting" @click="closeDelete">Cancelar</button>
              <button type="button" class="btn-modal danger" :disabled="deleting" @click="executeDelete">{{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import CorreoMasivo from '../Componets/Bulk-Email.vue';
import EnvioCorreo from '../Componets/Mail.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';
const router = useRouter();
const toastRef = ref(null);
const activeModal = ref(null);
const users = ref([]);
const loadingUsers = ref(false);
const errorUsers = ref('');
const searchQuery = ref('');
const selectedRoleFilter = ref('Todos');
const page = ref(1);
const isMobile = ref(window.innerWidth <= 900);
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const showDelete = ref(false);
const selectedUser = ref(null);
const deleting = ref(false);
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const PAGE_SIZE = 40;
let requestSequence = 0;
const t = key => traducciones[currentLang.value]?.[key] || traducciones.es?.[key] || key;
const roleText = role => ({
  Propietario: ({ es: 'Propietario', en: 'Owner', fr: 'Propriétaire', pt: 'Proprietário' })[currentLang.value] || 'Propietario',
  Gerente: ({ es: 'Gerente', en: 'Manager', fr: 'Gérant', pt: 'Gerente' })[currentLang.value] || 'Gerente',
  Entrenador: t('roleTrainer'),
  Recepcionista: t('roleReceptionist')
})[role] || role;
const getRoleClass = role => ({
  Propietario: 'role-propietario',
  Gerente: 'role-gerente',
  Entrenador: 'role-entrenador',
  Recepcionista: 'role-recepcionista'
})[role] || 'role-default';
const initials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};
const avatarColor = (name = '') => {
  const colors = ['#3b82f6','#a855f7','#22c55e','#f59e0b','#ec4899','#14b8a6','#6366f1','#ef4444'];
  let hash = 0;
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  return `linear-gradient(135deg,${color},${color}99)`;
};
const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
      const value = storage.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth','user','session','gymAccount','gym_account']) {
      try {
        const data = JSON.parse(storage.getItem(key) || 'null');
        const token = data?.token || data?.access_token || data?.accessToken;
        if (token) return token;
      } catch {}
    }
  }
  return '';
};
const obtenerSedeId = () => {
  const keys = ['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id'];
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of keys) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      let value = raw;
      try {
        const obj = JSON.parse(raw);
        value = typeof obj === 'object' ? (obj?.ID_Sede ?? obj?.sede_id ?? obj?.id ?? obj?.value) : obj;
      } catch {}
      const id = Number(value);
      if (Number.isInteger(id) && id > 0) return id;
    }
  }
  return null;
};

const resolverSedeId = async (token) => {
  let id = obtenerSedeId();
  if (id) return id;
  await new Promise(r => setTimeout(r, 700));
  id = obtenerSedeId();
  if (id) return id;
  try {
    const response = await fetch(`${API}/api/personal/sedes`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => null);
    const rows = Array.isArray(data) ? data : (data?.data || data?.sedes || []);
    const first = Number(rows[0]?.ID_Sede ?? rows[0]?.id);
    if (Number.isInteger(first) && first > 0) {
      sessionStorage.setItem('selected_sede_id', String(first));
      return first;
    }
  } catch {}
  return null;
};
const cargarPersonal = async () => {
  const current = ++requestSequence;
  loadingUsers.value = true;
  errorUsers.value = '';
  users.value = [];
  page.value = 1;
  try {
    const token = getToken();
    if (!token) throw new Error('No se encontró el token de sesión.');
    const sedeId = await resolverSedeId(token);
      if (!sedeId) throw new Error('Selecciona una sucursal para visualizar el personal.');
    const response = await fetch(`${API}/api/personal?sede_id=${encodeURIComponent(sedeId)}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const messages = Object.values(body?.errors || {}).flat().filter(Boolean);
      throw new Error(messages.join(' ') || body?.message || `Error HTTP ${response.status}`);
    }
    if (current !== requestSequence) return;
    const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    const roles = { GYM_ADMIN: 'Propietario', GYM_MANAGER: 'Gerente', GYM_COACH: 'Entrenador', GYM_RECEPCIONIST: 'Recepcionista' };
    const unique = new Map();
    for (const row of rows) {
      const id = Number(row.ID_Personal ?? row.id);
      if (!Number.isInteger(id) || id <= 0) continue;
      const role = row.Nombre_Rol ?? row.rol?.Nombre_Rol ?? row.role ?? '';
      unique.set(id, {
        id,
        name: [row.Nombre, row.Apellido_P, row.Apellido_M].filter(Boolean).join(' ') || 'Sin nombre',
        email: row.Correo_Electronico || '',
        phone: row.Celular || '',
        role: roles[role] || role || 'Sin rol',
        status: row.Status || 'Activo',
        sede: row.Nombre_Sede || '',
        foto: row.foto_url || null
      });
    }
    users.value = [...unique.values()];
  } catch (error) {
    if (current !== requestSequence) return;
    errorUsers.value = error.message || 'No se pudo cargar el personal.';
    toastRef.value?.notify(errorUsers.value, 'error');
    console.error('Error al cargar personal:', error);
  } finally {
    if (current === requestSequence) loadingUsers.value = false;
  }
};
const filteredUsers = computed(() => {
  const term = searchQuery.value.trim().toLocaleLowerCase();
  return users.value.filter(user => {
    if (selectedRoleFilter.value !== 'Todos' && user.role !== selectedRoleFilter.value) return false;
    return !term || [user.name,user.email,user.phone,user.role,String(user.id)].some(value => String(value || '').toLocaleLowerCase().includes(term));
  });
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE)));
const showPager = computed(() => filteredUsers.value.length > PAGE_SIZE);
const pagedUsers = computed(() => filteredUsers.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const goPage = n => { page.value = Math.min(Math.max(1, n), totalPages.value); window.scrollTo({ top: 0, behavior: 'smooth' }); };
watch([searchQuery, selectedRoleFilter], () => { page.value = 1; });
watch(totalPages, n => { if (page.value > n) page.value = n; });
const openEmail = user => {
  if (!user.email) return toastRef.value?.notify('Este empleado no tiene correo.', 'error');
  activeModal.value = 'enviocorreo';
};
const openWhatsApp = phone => {
  const number = String(phone || '').replace(/\D/g, '');
  if (!number) return toastRef.value?.notify('Este empleado no tiene teléfono.', 'error');
  window.open(`https://wa.me/${number.length === 10 ? '52' + number : number}`, '_blank', 'noopener,noreferrer');
};
const goToEdit = id => router.push(`/GYM_ACCOUNT/editar-staff/${id}`);
const confirmDelete = user => {
  selectedUser.value = user;
  showDelete.value = true;
};
const closeDelete = () => {
  if (deleting.value) return;
  showDelete.value = false;
  selectedUser.value = null;
};
const executeDelete = async () => {
  if (!selectedUser.value || deleting.value) return;
  deleting.value = true;
  try {
    const token = getToken();
    if (!token) throw new Error('No se encontró el token de sesión.');
    const response = await fetch(`${API}/api/personal/${selectedUser.value.id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || `Error HTTP ${response.status}`);
    showDelete.value = false;
    selectedUser.value = null;
    await cargarPersonal();
    toastRef.value?.notify('Personal eliminado correctamente.', 'success');
  } catch (error) {
    toastRef.value?.notify(error.message || 'No se pudo eliminar el personal.', 'error');
    console.error('Error al eliminar personal:', error);
  } finally {
    deleting.value = false;
  }
};
const handleResize = () => { isMobile.value = window.innerWidth <= 900; };
const handleLangChange = event => { if (event.detail?.idioma) currentLang.value = event.detail.idioma; };
const handleBranchChange = () => cargarPersonal();
onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', handleBranchChange);
  cargarPersonal();
});
onUnmounted(() => {
  requestSequence++;
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', handleBranchChange);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600&display=swap');
.data-message{padding:12px;color:var(--color-texto-general,#fff)}
.data-message button{background:none;border:0;color:var(--accent);font-weight:700;cursor:pointer;margin-left:8px}
.table-container{overflow-x:auto!important}
.user-table{min-width:800px}
.main-content, .modal-wrapper{--line: color-mix(in srgb, var(--color-texto-general, #94a3b8) 16%, transparent);--line-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);--surface-2: color-mix(in srgb, var(--color-texto-general, #94a3b8) 6%, transparent);--accent: var(--color-highlight, #3b82f6);--btn: var(--color-botones, #1c4fd6);--btn-text: var(--color-texto-botones, #fff);--r: var(--app-border-radius, 16px);--r-sm: calc(var(--app-border-radius, 16px) * .55);--muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 85%, transparent)}
.main-content{width: 100%;max-width: 1500px;margin: 0 auto;padding: 36px 36px 56px;color: var(--color-texto-general, #e5e7eb);font-family: 'Inter', system-ui, sans-serif;-webkit-font-smoothing: antialiased}
*{box-sizing: border-box}
.role-propietario{--tone: #fbbf24}
.role-gerente{--tone: #c084fc}
.role-entrenador{--tone: #60a5fa}
.role-recepcionista{--tone: #34d399}
.role-default{--tone: #cbd5e1}
.header-section{display: flex;align-items: flex-end;justify-content: space-between;gap: 24px;margin-bottom: 22px}
.title-wrapper{min-width: 220px;display: flex;flex-direction: column;gap: 8px}
.main-title{margin: 0;color: var(--color-titulos, #fff);font-family: 'Anton', sans-serif;font-size: clamp(1.9rem, 3vw, 2.6rem);font-weight: 400;line-height: 1.05;letter-spacing: .01em;text-transform: uppercase}
.result-count{align-self: flex-start;margin: 0;padding: 4px 12px;border: 1px solid var(--line);border-radius: 999px;background: var(--surface-2);color: var(--muted);font-size: .8rem;font-weight: 600}
.actions-bar{display: flex;align-items: center;justify-content: flex-end;gap: 10px;flex-wrap: wrap}
.status-select, .search-input, .btn-bulk{min-height: 44px;border: 1px solid var(--line);border-radius: var(--r-sm);background: var(--bg-cards, #15171c);color: var(--color-texto-general, #e5e7eb);font: 500 .86rem 'Inter', sans-serif;outline: none;transition: border-color .15s, background .15s, box-shadow .15s, transform .15s, filter .15s}
.status-select{min-width: 150px;padding: 0 38px 0 14px;appearance: none;-webkit-appearance: none;cursor: pointer;color-scheme: dark;background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239a9aa3' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");background-repeat: no-repeat;background-position: right 13px center;background-size: 16px}
.status-select:hover, .search-input:hover{border-color: rgba(255,255,255,.2)}
.status-select:focus, .search-input:focus{border-color: var(--accent);box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent)}
.status-select option{background: var(--bg-cards, #15171c);color: var(--color-texto-general, #fff)}
.search-wrapper{position: relative;display: flex;align-items: center}
.search-icon{position: absolute;z-index: 1;left: 14px;width: 17px;height: 17px;pointer-events: none;color: var(--muted)}
.search-input{width: 250px;padding: 0 14px 0 42px}
.search-input::placeholder{color: var(--muted);opacity: .6}
.search-input:focus{width: 280px}
.btn-bulk{display: inline-flex;align-items: center;justify-content: center;gap: 9px;padding: 0 18px;border-color: transparent;background: var(--btn);color: var(--btn-text);font-weight: 600;white-space: nowrap;cursor: pointer;box-shadow: 0 1px 0 rgba(255,255,255,.18) inset, 0 10px 24px -10px color-mix(in srgb, var(--btn) 70%, transparent)}
.btn-bulk svg{flex-shrink: 0;width: 18px;height: 18px;color: currentColor}
.btn-bulk:hover{filter: brightness(1.1);transform: translateY(-1px)}
.btn-bulk:active{transform: translateY(0)}
.desktop-only{display: block}
.mobile-only{display: none}
.table-container{overflow: hidden;border: 1px solid var(--line);border-radius: var(--r);background: var(--bg-cards, #121419)}
.user-table{width: 100%;border-collapse: collapse;text-align: left;color: var(--color-texto-general, #e5e7eb)}
.user-table thead{background: var(--surface-2)}
.user-table th{padding: 16px 20px;border-bottom: 1px solid var(--line);color: var(--muted);font-size: .78rem;font-weight: 600;letter-spacing: .02em;white-space: nowrap}
.user-table td{padding: 14px 20px;border-top: 1px solid var(--line-soft);font-size: .9rem;vertical-align: middle}
.user-table tbody tr:first-child td{border-top: 0}
.user-table td:first-child{box-shadow: inset 4px 0 0 var(--tone, transparent)}
.user-table tbody tr{transition: background .15s}
.user-table tbody tr:hover{background: color-mix(in srgb, var(--tone, var(--accent)) 6%, transparent)}
.th-actions{text-align: left}
.text-bold{color: var(--color-titulos, #f8fafc);font-weight: 600}
.text-muted{color: var(--muted)}
.avatar-small img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
.avatar-small{overflow:hidden;width: 42px;height: 42px;display: flex;align-items: center;justify-content: center;flex-shrink: 0;border-radius: var(--r-sm);color: #fff;font: 500 .95rem 'Oswald', sans-serif;letter-spacing: .02em}
.status-badge{width: fit-content;min-height: 28px;display: inline-flex;align-items: center;gap: 7px;padding: 0 12px;border: 1px solid color-mix(in srgb, var(--tone, #cbd5e1) 35%, transparent);border-radius: 999px;background: color-mix(in srgb, var(--tone, #cbd5e1) 10%, transparent);color: var(--tone, #cbd5e1);font-size: .78rem;font-weight: 700;white-space: nowrap}
.status-dot{width: 6px;height: 6px;display: inline-block;flex-shrink: 0;border-radius: 50%;background: currentColor}
.actions-cell{white-space: nowrap}
.icon-btn + .icon-btn{margin-left: 6px}
.icon-btn{width: 38px;height: 38px;display: inline-flex;align-items: center;justify-content: center;padding: 0;cursor: pointer;border: 1px solid var(--line);border-radius: var(--r-sm);background: var(--surface-2);color: var(--muted);vertical-align: middle;transition: transform .15s, background .15s, border-color .15s, color .15s}
.icon-btn svg{width: 18px;height: 18px}
.icon-btn:hover{transform: translateY(-1px)}
.icon-btn.btn-email:hover{color: #38bdf8;border-color: rgba(56,189,248,.45);background: rgba(56,189,248,.1)}
.icon-btn.btn-wa:hover{color: #4ade80;border-color: rgba(74,222,128,.45);background: rgba(74,222,128,.1)}
.icon-btn.btn-edit:hover{color: #fbbf24;border-color: rgba(251,191,36,.45);background: rgba(251,191,36,.1)}
.icon-btn.btn-delete:hover{color: #f87171;border-color: rgba(248,113,113,.45);background: rgba(248,113,113,.1)}
.empty-state{min-height: 330px;display: flex;flex-direction: column;align-items: center;justify-content: center;gap: 12px;padding: 50px 20px;text-align: center;color: var(--muted)}
.empty-state svg{opacity: .4}
.empty-state p{margin: 0;font-size: .95rem}
.modal-wrapper{position: fixed;z-index: 9999;inset: 0;display: flex;align-items: center;justify-content: center;padding: 20px;overflow-y: auto;background: rgba(0,0,0,.72);font-family: 'Inter', system-ui, sans-serif}
.custom-modal-card{position: relative;width: min(100%, 400px);padding: 32px 28px 28px;border: 1px solid rgba(255,255,255,.1);border-radius: var(--r);background: var(--bg-cards, #181a20);box-shadow: 0 30px 80px rgba(0,0,0,.55)}
.modal-body-custom{color: var(--color-texto-general, #fff);text-align: center}
.modal-body-custom h2{margin: 0 0 10px;color: var(--color-titulos, #fff);font: 500 1.3rem 'Oswald', sans-serif;letter-spacing: .02em}
.modal-body-custom p{margin: 0 0 22px;color: var(--muted);font-size: .9rem;line-height: 1.55}
.modal-body-custom p.delete-warning{margin-top: -8px;color: #fca5a5;font-size: .8rem}
.highlight-name{color: var(--color-titulos, #fff);font-weight: 600}
.modal-icon-container{width: 58px;height: 58px;display: flex;align-items: center;justify-content: center;margin: 0 auto 16px;border-radius: 50%}
.danger-bg{background: rgba(239,68,68,.12);box-shadow: 0 0 0 6px rgba(239,68,68,.06)}
.modal-buttons{display: flex;gap: 10px}
.btn-modal{min-height: 46px;flex: 1;padding: 0 16px;cursor: pointer;border: 1px solid transparent;border-radius: var(--r-sm);font: 600 .88rem 'Inter', sans-serif;transition: transform .15s, filter .15s, background .15s}
.btn-modal:hover{transform: translateY(-1px)}
.btn-modal:disabled{opacity: .5;cursor: not-allowed}
.btn-modal.secondary{border-color: var(--line);background: transparent;color: #d1d5db}
.btn-modal.secondary:hover{background: var(--surface-2)}
.btn-modal.danger{background: #dc2626;color: #fff}
.btn-modal.danger:hover{filter: brightness(1.1)}
:deep(.notification-container), :deep(.toast-container){width: calc(100% - 32px) !important;max-width: 480px !important;box-sizing: border-box !important;left: 50% !important;right: auto !important;margin: 0 auto !important;transform: translateX(-50%) !important}
.pop-enter-active, .pop-leave-active{transition: opacity .2s ease}
.pop-enter-active > :deep(*), .pop-leave-active > :deep(*){transition: transform .2s ease, opacity .2s ease}
.pop-enter-from, .pop-leave-to{opacity: 0}
.pop-enter-from > :deep(*), .pop-leave-to > :deep(*){opacity: 0;transform: translateY(10px) scale(.98)}
.btn-bulk:focus-visible, .icon-btn:focus-visible, .action-chip:focus-visible, .btn-modal:focus-visible{outline: 2px solid var(--accent);outline-offset: 2px}
@media (max-width: 1100px){.main-content{padding: 28px 22px 44px}
.header-section{align-items: flex-start;flex-direction: column;gap: 16px}
.actions-bar{width: 100%;justify-content: flex-start}
.search-wrapper{flex: 1;min-width: 200px}
.search-input, .search-input:focus{width: 100%}
}
@media (max-width: 900px){.desktop-only{display: none}
.mobile-only{display: flex;flex-direction: column;gap: 12px}
.main-content{padding: 18px 14px calc(36px + env(safe-area-inset-bottom))}
.header-section{gap: 16px;margin-bottom: 16px}
.title-wrapper{width: 100%;flex-direction: row;align-items: center;justify-content: space-between;gap: 12px;min-width: 0}
.main-title{font-size: 1.8rem}
.result-count{align-self: center;white-space: nowrap}
.actions-bar{width: 100%;display: grid;grid-template-columns: 1fr 1fr;gap: 10px}
.search-wrapper{grid-column: 1 / -1;grid-row: 1;width: 100%}
.search-input, .search-input:focus{width: 100%;min-height: 48px;font-size: 1rem}
.status-select{width: 100%;min-width: 0;min-height: 48px;font-size: .95rem}
.actions-bar > .btn-bulk{grid-column: 1 / -1;width: 100%;min-height: 48px;font-size: .95rem}
.user-card{position: relative;padding: 16px 16px 14px 20px;overflow: hidden;border: 1px solid var(--line);border-radius: var(--r);background: var(--bg-cards, #14161b);box-shadow: inset 4px 0 0 var(--tone, var(--accent))}
.card-top-section{display: flex;align-items: center;gap: 13px;margin-bottom: 14px}
.user-card .avatar-small{width: 48px;height: 48px;font-size: 1rem}
.card-user-titles{min-width: 0;flex: 1;display: flex;flex-direction: column;align-items: flex-start;gap: 7px}
.name-text{width: 100%;color: var(--color-titulos, #fff);font-size: 1rem;line-height: 1.25;white-space: normal;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden}
.card-meta{display: grid;gap: 9px;margin-bottom: 14px;padding: 12px 14px;border: 1px solid var(--line-soft);border-radius: var(--r-sm);background: var(--surface-2);font-size: .9rem}
.email-text, .phone-text{display: block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap}
.email-text{color: var(--color-texto-general, #cbd5e1)}
.phone-text{color: var(--muted)}
.email-text::before, .phone-text::before{content: '';display: inline-block;width: 16px;height: 16px;margin-right: 10px;vertical-align: -3px;background: currentColor;opacity: .6;-webkit-mask-repeat: no-repeat;mask-repeat: no-repeat;-webkit-mask-position: center;mask-position: center;-webkit-mask-size: contain;mask-size: contain}
.email-text::before{-webkit-mask-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/%3e%3cpolyline points='22,6 12,13 2,6'/%3e%3c/svg%3e");mask-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/%3e%3cpolyline points='22,6 12,13 2,6'/%3e%3c/svg%3e")}
.phone-text::before{-webkit-mask-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z'/%3e%3c/svg%3e");mask-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z'/%3e%3c/svg%3e")}
.card-actions{display: grid;grid-template-columns: repeat(4, minmax(0, 1fr));gap: 7px;padding-top: 14px;border-top: 1px solid var(--line-soft)}
.action-chip{min-width: 0;min-height: 60px;display: flex;flex-direction: column;align-items: center;justify-content: center;gap: 6px;padding: 8px 2px;cursor: pointer;border: 1px solid var(--line);border-radius: var(--r-sm);background: var(--surface-2);font: 600 .7rem 'Inter', sans-serif;-webkit-tap-highlight-color: transparent;transition: background .15s, border-color .15s, transform .15s}
.action-chip span{max-width: 100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap}
.action-chip:active{transform: scale(.95)}
.action-chip svg{width: 20px;height: 20px}
.btn-email-chip{color: #38bdf8}
.btn-wa-chip{color: #4ade80}
.btn-edit-chip{color: #fbbf24}
.btn-delete-chip{color: #f87171}
.btn-email-chip:active{background: rgba(56,189,248,.14);border-color: rgba(56,189,248,.4)}
.btn-wa-chip:active{background: rgba(74,222,128,.14);border-color: rgba(74,222,128,.4)}
.btn-edit-chip:active{background: rgba(251,191,36,.14);border-color: rgba(251,191,36,.4)}
.btn-delete-chip:active{background: rgba(248,113,113,.14);border-color: rgba(248,113,113,.4)}
.empty-state{min-height: 260px;border: 1px dashed var(--line);border-radius: var(--r);background: var(--bg-cards, #14161b)}
.modal-wrapper{padding: 14px}
.modal-wrapper:has(> .custom-modal-card){align-items: flex-end;padding: 0}
.custom-modal-card{width: 100%;max-width: none;padding: 30px 20px calc(24px + env(safe-area-inset-bottom));border-radius: 22px 22px 0 0;border-bottom: 0}
.modal-buttons{flex-direction: column-reverse}
.btn-modal{min-height: 50px}
}
@media (max-width: 380px){.main-title{font-size: 1.55rem}
.card-actions{gap: 5px}
.action-chip{font-size: .62rem}
.action-chip svg{width: 18px;height: 18px}
}
@media (prefers-reduced-motion: reduce){.main-content *, .modal-wrapper *{transition: none !important}
}
.pager{display: flex;align-items: center;justify-content: center;gap: 14px;margin-top: 18px}
.pager-btn{width: 40px;height: 40px;display: grid;place-items: center;padding: 0;border: 1px solid var(--line);border-radius: var(--r-sm);background: var(--bg-cards, #14161b);color: var(--color-texto-general, #e5e7eb);cursor: pointer;transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease}
.pager-btn:hover:not(:disabled){border-color: var(--accent);background: color-mix(in srgb, var(--accent) 12%, transparent);color: var(--color-titulos, #ffffff);transform: translateY(-1px)}
.pager-btn:disabled{opacity: 0.35;cursor: not-allowed}
.pager-btn:focus-visible{outline: 2px solid var(--accent);outline-offset: 2px}
.pager-info{min-width: 64px;color: var(--muted);font-size: 0.8rem;font-weight: 600;text-align: center}
.pager-info b{color: var(--color-titulos, #ffffff);font-weight: 700}
</style>