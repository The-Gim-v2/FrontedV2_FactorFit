<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import CorreoMasivo from '../Componets/Bulk-Email.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const t = (key) => {
 const langTable = traducciones[currentLang.value] || traducciones.es;
 return langTable[key] || traducciones.es[key] || key;
};
const handleLangChange = (e) => {
 if (e.detail && e.detail.idioma) {
  currentLang.value = e.detail.idioma;
 }
};
const windowWidth = ref(window.innerWidth);
const handleResize = () => {
 windowWidth.value = window.innerWidth;
};
onMounted(() => {
 window.addEventListener('resize', handleResize);
 window.addEventListener('idioma-changed', handleLangChange);
});
onUnmounted(() => {
 window.removeEventListener('resize', handleResize);
 window.removeEventListener('idioma-changed', handleLangChange);
});
const isMobile = computed(() => windowWidth.value <= 900);
const activeModal = ref(null);
const toastRef = ref(null);
const router = useRouter();
const showDelete = ref(false);
const selectedUser = ref(null);
const searchQuery = ref('');
const selectedMembership = ref('');
const selectedStatus = ref('');
const filteredUsers = computed(() => {
 return users.value.filter(user => {
  const matchMembership = selectedMembership.value ? user.mensualidad === selectedMembership.value : true;
  const matchStatus = selectedStatus.value ? user.status === selectedStatus.value : true;
  const term = searchQuery.value.toLowerCase();
  const matchSearch = user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.mensualidad.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term) ||
      user.expirationDate.toLowerCase().includes(term) ||
      user.id.toString().includes(term);
  return matchMembership && matchStatus && matchSearch;
 });
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
watch([searchQuery, selectedMembership, selectedStatus], () => { page.value = 1; });
const pagerLabels = {
 es: ['Paginación', 'Página anterior', 'Página siguiente'],
 en: ['Pagination', 'Previous page', 'Next page'],
 fr: ['Pagination', 'Page précédente', 'Page suivante'],
 pt: ['Paginação', 'Página anterior', 'Próxima página']
};
const pagerLabel = (i) => (pagerLabels[currentLang.value] || pagerLabels.es)[i];
const getStatusClass = (status) => {
 const classes = {
  'Activo': 'status-green',
  'Inactivo': 'status-red',
  'Pendiente': 'status-orange',
  'Próximo a vencer': 'status-yellow'
 };
 return classes[status] || 'status-default';
};
// Iniciales + gradiente de avatar (sin depender de fotos reales)
const avatarGradients = [
 'linear-gradient(135deg, #7e22ce, #4c1d95)',
 'linear-gradient(135deg, #ea580c, #9a3412)',
 'linear-gradient(135deg, #db2777, #9d174d)',
 'linear-gradient(135deg, #dc2626, #7f1d1d)',
 'linear-gradient(135deg, #2563eb, #1e3a8a)',
 'linear-gradient(135deg, #059669, #064e3b)',
];
const getInitials = (name) => {
 const parts = name.trim().split(/\s+/).filter(Boolean);
 return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
};
const avatarStyle = (id) => ({ backgroundImage: avatarGradients[id % avatarGradients.length] });
// Datos reales: misma fuente que la lista de clientes.
const users = ref([]);
const loadingUsers = ref(false);
const errorUsers = ref('');
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const getToken = () => {
 for (const storage of [sessionStorage, localStorage]) {
  for (const key of ['token', 'auth_token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken']) {
   const value = storage.getItem(key);
   if (value) return value.replace(/^Bearer\s+/i, '');
  }
  for (const key of ['auth', 'user', 'session', 'gymAccount', 'gym_account']) {
   try {
    const obj = JSON.parse(storage.getItem(key) || 'null');
    const token = obj?.token || obj?.access_token || obj?.accessToken;
    if (token) return token;
   } catch { /* Ignorar sesiones no JSON */ }
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
const apiRequest = async (path, options = {}) => {
 const token = getToken();
 if (!token) throw new Error('No se encontró el token de sesión.');
 const response = await fetch(`${API}${path}`, {
  ...options,
  headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
 });
 const body = await response.json().catch(() => null);
 if (!response.ok) throw new Error(body?.message || `Error HTTP ${response.status}`);
 return body;
};
const formatDate = (date) => {
 if (!date) return '—';
 const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
 return match ? `${match[3]}/${match[2]}/${match[1]}` : String(date);
};
let requestSequence = 0;
const cargarClientes = async () => {
 const current = ++requestSequence;
 loadingUsers.value = true;
 errorUsers.value = '';
 try {
  const sedeId=await resolverSedeId(getToken());if(!sedeId)throw new Error('Selecciona una sucursal para visualizar sus clientes.');
  const response = await apiRequest(`/api/gym/clientes?sede_id=${encodeURIComponent(sedeId)}`);
  const rows = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
  if (current !== requestSequence) return;
  users.value = rows.map(row => ({
   id: Number(row.ID_Inscripto),
   clienteId: Number(row.ID_Cliente),
   name: [row.Nombre, row.Apellido_P, row.Apellido_M].filter(Boolean).join(' ') || 'Sin nombre',
   email: row.Correo_Electronico || '',
   phone: row.Celular || '',
   expirationDate: formatDate(row.Fecha_Vencimiento),
   status: row.Estatus || 'Pendiente',
   mensualidad: row.Nombre_Paquete || '',
   foto: row.foto_url || null
  })).filter(user => Number.isInteger(user.id) && user.id > 0 && user.status !== 'Eliminado temporal');
 } catch (e) {
  if (current !== requestSequence) return;
  errorUsers.value = e.message || 'No se pudieron cargar los clientes.';
  toastRef.value?.notify(errorUsers.value, 'error');
 } finally {
  if (current === requestSequence) loadingUsers.value = false;
 }
};
onMounted(() => {
 cargarClientes();
 window.addEventListener('factorfit:branch-changed', cargarClientes);
});
onUnmounted(() => {
 requestSequence++;
 window.removeEventListener('factorfit:branch-changed', cargarClientes);
});
const confirmDelete = (user) => {
 selectedUser.value = user;
 showDelete.value = true;
};
const deleting = ref(false);
const executeDelete = async () => {
 if (!selectedUser.value || deleting.value) return;
 deleting.value = true;
 try {
  const user = selectedUser.value;
  const sedeId = await resolverSedeId(getToken());
  if (!sedeId) throw new Error('Selecciona una sucursal para visualizar sus clientes.');
  // El endpoint debe cambiar Estatus a "Eliminado temporal", SIN borrar filas.
  await apiRequest(`/api/gym/clientes/${user.id}?sede_id=${encodeURIComponent(sedeId)}`, { method: 'DELETE' });
  users.value = users.value.filter(u => u.id !== user.id);
  showDelete.value = false;
  selectedUser.value = null;
  toastRef.value?.notify('Cliente retirado temporalmente. Sus datos y pagos se conservan.', 'success');
 } catch (error) {
  toastRef.value?.notify(error.message || 'No se pudo retirar al cliente.', 'error');
 } finally {
  deleting.value = false;
 }
};
const goToPayments = (id) => {
  const user = users.value.find(u => u.id === id);
  if (!user) return toastRef.value?.notify('No se encontró el cliente seleccionado.', 'error');
  // La ruta utiliza ID_Inscripto, no ID_Cliente.
  router.push({ path: `/GYM_ACCOUNT/pay/${user.id}`, query: { sede_id: obtenerSedeId() || undefined } });
};
// La pantalla de edición y ClienteGymController::show buscan por ID_Cliente, no ID_Inscripto.
const goToEdit = (id) => {
 const user = users.value.find(u => u.id === id);
 if (!user?.clienteId) return toastRef.value?.notify('No se encontró el ID del cliente.', 'error');
 router.push(`/GYM_ACCOUNT/editar-usuario/${user.clienteId}`);
};
const photoUser = ref(null);
const openPhoto = (user) => { if (user.foto) photoUser.value = user; };
const closePhoto = () => { photoUser.value = null; };
// va al final: totalPages depende de `users`, que se declara arriba
watch(totalPages, (n) => { if (page.value > n) page.value = n; });
</script>
<template>
 <HeadingGYM_ACCOUNT>
  <NotificationSystem ref="toastRef" />
  <main class="main-content">
   <header class="header-section">
    <div class="title-wrapper">
     <h1 class="main-title">{{ t('paymentsTitle') }}</h1>
     <span class="title-underline"></span>
     <p class="main-subtitle">{{ t('paymentsSubtitle') }}</p>
    </div>
    <div class="actions-bar" id="tutorial-step-0">
      <div class="select-wrapper">
      <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
      <select class="status-select" v-model="selectedMembership">
      <option value="">{{ t('allMembershipsOption') }}</option>
      <option value="Mensual">{{ t('monthlyOption') }}</option>
      <option value="Quincenal">{{ t('biweeklyOption') }}</option>
      </select>
      <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div class="select-wrapper">
      <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <select class="status-select" v-model="selectedStatus">
      <option value="">{{ t('allStatusesOption') }}</option>
      <option value="Activo">{{ t('statusActive') }}</option>
      <option value="Inactivo">{{ t('statusInactive') }}</option>
      <option value="Pendiente">{{ t('statusPending') }}</option>
      <option value="Próximo a vencer">{{ t('statusExpiringSoon') }}</option>
      </select>
      <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <button class="btn-bulk" @click="activeModal = 'enviomasivo'">
      <span class="btn-bulk-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
      </span>
      {{ t('bulkEmailBtn') }}
      </button>
      <div class="search-wrapper">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" class="search-input" :placeholder="t('searchUserPlaceholder')" v-model="searchQuery">
      </div>
    </div>
   </header>
   <p v-if="loadingUsers" role="status">Cargando clientes...</p>
   <p v-if="errorUsers" role="alert">{{ errorUsers }} <button type="button" @click="cargarClientes">Reintentar</button></p>
   <!-- VISTA ESCRITORIO -->
   <div v-if="!isMobile" class="table-container desktop-only" id="tutorial-step-1">
    <table class="user-table">
     <thead>
      <tr><th>{{ t('tablePhoto') }}</th><th>{{ t('tableName') }}</th><th>{{ t('tableEmail') }}</th><th>{{ t('tableExpiration') }}</th><th>{{ t('tableStatus') }}</th><th>{{ t('tableActions') }}</th></tr>
     </thead>
     <tbody>
      <tr v-for="(user, index) in pagedUsers" :key="user.id">
      <td><div class="avatar-small" :style="avatarStyle(user.id)" :class="{ 'avatar-clickable': user.foto }" :title="user.foto ? 'Ver fotografía' : user.name" @click="openPhoto(user)"><img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" /><span v-else>{{ getInitials(user.name) }}</span></div></td>
      <td class="text-bold">{{user.name}}</td>
      <td class="text-muted">{{user.email}}</td>
      <td class="text-muted">{{user.expirationDate}}</td>
      <td><span :class="['status-badge', getStatusClass(user.status)]">{{ user.status }}</span></td>
      <td class="actions-cell" :id="!isMobile && index === 0 ? 'tutorial-step-2' : null">
      <button class="icon-btn" :title="t('tooltipPayment')" @click="goToPayments(user.id)">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6M10.5 10.5h3M10.5 13.5h3"/><path d="M6 3h14c1.1 0 2 .9 2 2v10"/></svg>
      </button>
      <button class="icon-btn" :title="t('tooltipEdit')" @click="goToEdit(user.id)">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="icon-btn delete-icon-btn" :title="t('tooltipDelete')" @click="confirmDelete(user)">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
      </td>
      </tr>
      <tr v-if="filteredUsers.length === 0">
      <td colspan="6" class="empty-state-cell">
      <div class="empty-state">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span>{{ t('emptyStateUsers') }}</span>
      </div>
      </td>
      </tr>
     </tbody>
    </table>
   </div>
   <!-- VISTA MÓVIL -->
   <div class="mobile-only">
   <div
     v-for="(user, index) in pagedUsers"
     :key="user.id"
     class="user-card"
     :class="getStatusClass(user.status)"
     :id="isMobile && index === 0 ? 'tutorial-step-1' : null"
    >
     <div class="card-top-section">
      <div class="avatar-small" :style="avatarStyle(user.id)" :class="{ 'avatar-clickable': user.foto }" :title="user.foto ? 'Ver fotografía' : user.name" @click="openPhoto(user)"><img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" /><span v-else>{{ getInitials(user.name) }}</span></div>
      <div class="card-user-titles">
      <div class="text-bold name-text">{{ user.name }}</div>
      <div class="badges-row">
      <span class="status-badge" :class="getStatusClass(user.status)">{{ user.status }}</span>
      <span class="membership-badge">{{ user.mensualidad }}</span>
      </div>
      </div>
     </div>
     <div class="card-meta">
      <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="email-text">{{ user.email }}</span></span>
      <span class="meta-row expiration-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="vence-label">{{ t('expiresLabel') }}:</span> {{ user.expirationDate }}</span>
      <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="phone-text">{{ user.phone }}</span></span>
     </div>
     <div class="card-actions" :id="isMobile && index === 0 ? 'tutorial-step-2' : null">
      <button class="action-chip btn-pay-chip" @click="goToPayments(user.id)">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6M10.5 10.5h3M10.5 13.5h3"/><path d="M6 3h14c1.1 0 2 .9 2 2v10"/></svg>
      <span>{{ t('actionPayment') }}</span>
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
    <div v-if="filteredUsers.length === 0" class="empty-state-mobile">
     <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
     <span>{{ t('emptyStateUsers') }}</span>
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
  </main>
   <transition name="pop">
    <div v-if="showDelete" class="modal-wrapper" @click.self="showDelete = false">
     <div class="custom-modal-card">
      <div class="modal-body-custom">
      <div class="modal-icon-container danger-bg">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2>Retirar cliente temporalmente</h2>
      <p>¿Deseas retirar temporalmente a <span class="highlight-name">{{ selectedUser?.name }}</span> de esta sucursal? Sus datos, pagos e historial se conservarán para una futura renovación.</p>
      <div class="modal-buttons">
      <button class="btn-modal secondary" @click="showDelete = false">{{ t('btnCancel') }}</button>
      <button class="btn-modal danger" :disabled="deleting" @click="executeDelete">{{ deleting ? 'Procesando...' : 'Confirmar retiro' }}</button>
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
  <div v-if="photoUser" class="photo-viewer" role="dialog" aria-modal="true" :aria-label="`Fotografía de ${photoUser.name}`" @click.self="closePhoto">
   <div class="photo-viewer-card"><button type="button" class="photo-viewer-close" aria-label="Cerrar" @click="closePhoto">×</button><img :src="photoUser.foto" :alt="photoUser.name" /><p>{{ photoUser.name }}</p></div>
  </div>
 </HeadingGYM_ACCOUNT>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600&display=swap');
/* =========================================================
 PANEL DE PAGOS
 ========================================================= */
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
 --btn: var(--color-botones, #2563eb);
 --btn-text: var(--color-texto-botones, #ffffff);
 --r: var(--app-border-radius, 16px);
 --r-sm: calc(var(--app-border-radius, 16px) * 0.62);
 --muted: color-mix(
  in srgb,
  var(--color-texto-general, #94a3b8) 78%,
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
 CABECERA
 ========================================================= */
.header-section {
 display: flex;
 align-items: flex-end;
 justify-content: space-between;
 gap: 24px;
 margin-bottom: 22px;
}
.main-title {
 margin: 0;
 color: var(--color-titulos, #ffffff);
 font-family: 'Anton', sans-serif;
 font-size: clamp(1.9rem, 3vw, 2.6rem);
 font-weight: 400;
 line-height: 1.05;
 letter-spacing: 0.01em;
 text-transform: uppercase;
}
.title-underline {
 width: 58px;
 height: 3px;
 display: block;
 border-radius: 999px;
 background:
  linear-gradient(
   90deg,
   var(--accent),
   transparent
  );
}
.main-subtitle {
 max-width: 500px;
 margin: 0;
 color: var(--muted);
 font-size: 0.8rem;
 font-weight: 500;
 line-height: 1.5;
}
/* =========================================================
 BARRA DE ACCIONES
 ========================================================= */
.actions-bar {
 display: flex;
 align-items: center;
 justify-content: flex-end;
 gap: 9px;
 flex-wrap: wrap;
}
/* =========================================================
 SELECTS
 ========================================================= */
.select-wrapper,
.search-wrapper {
 position: relative;
 display: flex;
 align-items: center;
}
.select-icon,
.search-icon {
 position: absolute;
 z-index: 2;
 left: 13px;
 color: var(--muted);
 pointer-events: none;
 opacity: 0.72;
}
.select-arrow {
 position: absolute;
 z-index: 2;
 right: 12px;
 color: var(--muted);
 pointer-events: none;
 opacity: 0.7;
}
.status-select,
.search-input {
 min-height: 44px;
 border: 1px solid var(--line);
 border-radius: var(--r-sm);
 background: var(--bg-cards, #14161b);
 color: var(--color-texto-general, #e5e7eb);
 font-family: 'Inter', sans-serif;
 font-size: 0.82rem;
 font-weight: 500;
 outline: none;
 transition:
  border-color 0.18s ease,
  background 0.18s ease,
  box-shadow 0.18s ease;
}
.status-select {
 min-width: 170px;
 padding:
  0 36px
  0 39px;
 cursor: pointer;
 appearance: none;
 -webkit-appearance: none;
}
.status-select:hover,
.search-input:hover {
 border-color:
  color-mix(
   in srgb,
   var(--color-texto-general, #ffffff) 26%,
   transparent
  );
}
.status-select:focus,
.search-input:focus {
 border-color: var(--accent);
 box-shadow:
  0 0 0 3px
  color-mix(
   in srgb,
   var(--accent) 14%,
   transparent
  );
}
.status-select option {
 background: var(--bg-cards, #18181b);
 color: var(--color-texto-general, #ffffff);
}
/* =========================================================
 BUSCADOR
 ========================================================= */
.search-input {
 width: 225px;
 padding:
  0 14px
  0 39px;
}
.search-input::placeholder {
 color: var(--muted);
 opacity: 0.68;
}
.search-input:focus {
 width: 245px;
}
/* =========================================================
 BOTÓN CORREO MASIVO
 ========================================================= */
.btn-bulk {
 min-height: 44px;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 gap: 9px;
 padding: 0 17px;
 cursor: pointer;
 white-space: nowrap;
 border: 1px solid var(--btn);
 border-radius: var(--r-sm);
 background: var(--btn);
 color: var(--btn-text);
 font-family: 'Inter', sans-serif;
 font-size: 0.82rem;
 font-weight: 600;
 box-shadow:
  0 5px 14px
  color-mix(
   in srgb,
   var(--btn) 20%,
   transparent
  );
 transition:
  background 0.18s ease,
  border-color 0.18s ease,
  box-shadow 0.18s ease,
  transform 0.18s ease;
}
.btn-bulk-icon {
 width: 24px;
 height: 24px;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
 border-radius: 7px;
 background:
  rgba(255, 255, 255, 0.13);
 color: var(--btn-text);
}
.btn-bulk-icon svg {
 width: 16px;
 height: 16px;
 stroke: currentColor;
}
.btn-bulk:hover {
 transform: translateY(-1px);
 background:
  color-mix(
   in srgb,
   var(--btn) 88%,
   white
  );
 border-color:
  color-mix(
   in srgb,
   var(--btn) 88%,
   white
  );
 box-shadow:
  0 8px 20px
  color-mix(
   in srgb,
   var(--btn) 28%,
   transparent
  );
}
.btn-bulk:active {
 transform: translateY(0);
}
.btn-bulk:focus-visible {
 outline: none;
 box-shadow:
  0 0 0 3px
   color-mix(
    in srgb,
    var(--btn) 24%,
    transparent
   ),
  0 5px 14px
   color-mix(
    in srgb,
    var(--btn) 20%,
    transparent
   );
}
/* =========================================================
 DESKTOP / MOBILE
 ========================================================= */
.desktop-only {
 display: block;
}
.mobile-only {
 display: none;
}
/* =========================================================
 TABLA
 ========================================================= */
.table-container {
 position: relative;
 width: 100%;
 overflow: hidden;
 border: 1px solid var(--line);
 border-radius: var(--r);
 background: var(--bg-cards, #121419);
 box-shadow:
  0 18px 45px
  rgba(0, 0, 0, 0.2);
}
.table-container::before {
 content: '';
 position: absolute;
 z-index: 3;
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
 opacity: 0.72;
}
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
   var(--color-texto-general, #ffffff)
  );
}
.user-table th {
 padding: 15px 18px;
 border-bottom: 1px solid var(--line);
 color: var(--muted);
 font-size: 0.69rem;
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
 transition:
  background 0.17s ease;
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
/* =========================================================
 TEXTO DE TABLA
 ========================================================= */
.text-bold {
 color: var(--color-titulos, #f8fafc);
 font-weight: 600;
}
.text-muted {
 color: var(--muted);
}
/* =========================================================
 AVATAR
 ========================================================= */
.avatar-small {
 width: 40px;
 height: 40px;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
 border:
  1px solid
  rgba(255, 255, 255, 0.14);
 border-radius: 12px;
 color: #ffffff;
 font-size: 0.75rem;
 font-weight: 700;
 letter-spacing: 0.025em;
 box-shadow:
  0 5px 14px
  rgba(0, 0, 0, 0.22);
}
/* =========================================================
 ESTADOS
 ========================================================= */
.status-badge {
 width: fit-content;
 min-height: 27px;
 display: inline-flex;
 align-items: center;
 gap: 7px;
 padding: 4px 10px;
 border: 1px solid transparent;
 border-radius: 999px;
 font-size: 0.7rem;
 font-weight: 650;
 white-space: nowrap;
}
.status-badge::before {
 content: '';
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
/* ACTIVO */
.status-green {
 color: #34d399;
 border-color:
  rgba(52, 211, 153, 0.25);
 background:
  rgba(52, 211, 153, 0.08);
}
/* INACTIVO */
.status-red {
 color: #f87171;
 border-color:
  rgba(248, 113, 113, 0.25);
 background:
  rgba(248, 113, 113, 0.08);
}
/* PENDIENTE */
.status-orange {
 color: #fbbf24;
 border-color:
  rgba(251, 191, 36, 0.25);
 background:
  rgba(251, 191, 36, 0.08);
}
/* PRÓXIMO A VENCER */
.status-yellow {
 color: #facc15;
 border-color:
  rgba(250, 204, 21, 0.25);
 background:
  rgba(250, 204, 21, 0.08);
}
.status-default {
 color: #cbd5e1;
 border-color:
  rgba(203, 213, 225, 0.18);
 background:
  rgba(203, 213, 225, 0.06);
}
/* =========================================================
 MEMBRESÍA
 ========================================================= */
.membership-badge {
 width: fit-content;
 display: inline-flex;
 align-items: center;
 padding: 4px 10px;
 border:
  1px solid
  rgba(56, 189, 248, 0.24);
 border-radius: 999px;
 background:
  rgba(56, 189, 248, 0.07);
 color: #38bdf8;
 font-size: 0.7rem;
 font-weight: 600;
}
/* =========================================================
 ACCIONES
 ========================================================= */
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
 color: #60a5fa;
 border-color:
  rgba(96, 165, 250, 0.3);
 background:
  rgba(96, 165, 250, 0.08);
 box-shadow:
  0 7px 16px
  rgba(96, 165, 250, 0.08);
}
.icon-btn:active {
 transform: translateY(0);
}
/* EDITAR - segundo botón */
.actions-cell .icon-btn:nth-child(2):hover {
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
.delete-icon-btn:hover {
 color: #f87171 !important;
 border-color:
  rgba(248, 113, 113, 0.3) !important;
 background:
  rgba(248, 113, 113, 0.08) !important;
 box-shadow:
  0 7px 16px
  rgba(248, 113, 113, 0.08) !important;
}
/* =========================================================
 EMPTY STATE
 ========================================================= */
.empty-state-cell {
 padding: 0 !important;
 border-top: none !important;
}
.empty-state,
.empty-state-mobile {
 min-height: 270px;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 gap: 12px;
 padding: 50px 20px;
 color: var(--muted);
 font-size: 0.82rem;
 font-weight: 500;
 text-align: center;
}
.empty-state svg,
.empty-state-mobile svg {
 opacity: 0.42;
}
/* =========================================================
 MODAL
 ========================================================= */
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
 Sin backdrop-filter para evitar
 artefactos negros durante el scroll.
*/
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
  0 30px 80px
  rgba(0, 0, 0, 0.55);
}
.modal-body-custom {
 padding: 3px;
 color: var(--color-texto-general, #ffffff);
 text-align: center;
}
.modal-body-custom h2 {
 margin: 0 0 10px;
 color: var(--color-titulos, #ffffff);
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
.highlight-name {
 color: var(--color-titulos, #ffffff);
 font-weight: 700;
}
/* =========================================================
 ICONO MODAL
 ========================================================= */
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
/* =========================================================
 BOTONES MODAL
 ========================================================= */
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
   var(--color-texto-general, #ffffff) 4%,
   transparent
  );
 color: var(--color-texto-general, #d1d5db);
}
.btn-modal.secondary:hover {
 background:
  color-mix(
   in srgb,
   var(--color-texto-general, #ffffff) 8%,
   transparent
  );
}
.btn-modal.danger {
 border:
  1px solid
  rgba(239, 68, 68, 0.75);
 background: #dc2626;
 color: #ffffff;
}
.btn-modal.danger:hover {
 background: #ef4444;
 box-shadow:
  0 8px 20px
  rgba(239, 68, 68, 0.2);
}
/* =========================================================
 NOTIFICACIONES
 ========================================================= */
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
 TRANSICIÓN MODALES
 ========================================================= */
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
.title-wrapper {
 min-width: 220px;
 display: flex;
 flex-direction: column;
 gap: 8px;
}
@media (max-width: 1100px) {
 .main-content {
  padding: 28px 22px 44px;
 }
 .header-section {
  align-items: flex-start;
  flex-direction: column;
  gap: 16px;
 }
 .actions-bar {
  width: 100%;
  justify-content: flex-start;
 }
 .search-wrapper {
  flex: 1;
  min-width: 200px;
 }
 .search-input,
 .search-input:focus {
  width: 100%;
 }
}
/* =========================================================
 MÓVIL
 ========================================================= */
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
 /* HEADER */
 .header-section {
  margin-bottom: 18px;
 }
 .main-title {
  font-size: 1.85rem;
 }
 .main-subtitle {
  font-size: 0.75rem;
 }
 /* FILTROS */
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
 .select-wrapper {
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
  TARJETAS
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
   0 9px 28px
   rgba(0, 0, 0, 0.17);
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
  background: currentColor;
  opacity: 0.65;
 }
 .user-card.status-green::before {
  background: #34d399;
 }
 .user-card.status-red::before {
  background: #f87171;
 }
 .user-card.status-orange::before {
  background: #fbbf24;
 }
 .user-card.status-yellow::before {
  background: #facc15;
 }
 .user-card:active {
  transform: scale(0.995);
 }
 /* CABECERA TARJETA */
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
  color: var(--color-titulos, #ffffff);
  font-size: 0.9rem;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
 }
 .badges-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
 }
 /* INFORMACIÓN */
 .card-meta {
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
  padding: 11px 12px;
  border: 1px solid var(--line-soft);
  border-radius: 11px;
  background:
   color-mix(
    in srgb,
    var(--color-texto-general, #ffffff) 2%,
    transparent
   );
  color: var(--muted);
  font-size: 0.75rem;
 }
 .meta-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
 }
 .meta-row svg {
  flex-shrink: 0;
  opacity: 0.68;
 }
 .email-text {
  overflow: hidden;
  color: #93c5fd;
  text-overflow: ellipsis;
  white-space: nowrap;
 }
 .expiration-warning {
  color: #fb923c;
  font-weight: 500;
 }
 .vence-label {
  color: #fb923c;
  font-weight: 600;
 }
 .phone-text {
  color: var(--muted);
 }
 /* =========================================================
  ACCIONES MÓVIL
 ========================================================= */
 .card-actions {
  display: grid;
  grid-template-columns:
   repeat(3, minmax(0, 1fr));
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
    var(--color-texto-general, #ffffff) 2.2%,
    transparent
   );
  color: var(--muted);
  font-family: 'Inter', sans-serif;
  font-size: 0.61rem;
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
 /* PAGO */
 .btn-pay-chip {
  color: #38bdf8;
 }
 .btn-pay-chip:hover {
  border-color:
   rgba(56, 189, 248, 0.25);
  background:
   rgba(56, 189, 248, 0.07);
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
 /* EMPTY */
 .empty-state-mobile {
  min-height: 250px;
  margin-top: 8px;
  border: 1px dashed var(--line);
  border-radius: var(--r);
  background: var(--bg-cards, #14161b);
 }
}
/* =========================================================
 TELÉFONOS
 ========================================================= */
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
 .select-wrapper,
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
   repeat(3, minmax(0, 1fr));
  gap: 5px;
 }
 .action-chip {
  min-height: 52px;
  padding: 6px 2px;
  font-size: 0.57rem;
 }
 .custom-modal-card {
  padding: 24px 19px;
 }
}
/* =========================================================
 TELÉFONOS MUY PEQUEÑOS
 ========================================================= */
@media (max-width: 380px) {
 .card-actions {
  grid-template-columns: 1fr;
 }
 .action-chip {
  min-height: 46px;
  flex-direction: row;
  gap: 8px;
  font-size: 0.65rem;
 }
}
/* =========================================================
 FOCUS / ACCESIBILIDAD
 ========================================================= */
.icon-btn:focus-visible,
.action-chip:focus-visible,
.btn-modal:focus-visible {
 outline: 2px solid var(--accent);
 outline-offset: 2px;
}
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
.avatar-small { overflow: hidden; }
.avatar-small img { width: 100%; height: 100%; object-fit: cover; display: block; }
.avatar-clickable { cursor: zoom-in; }
.photo-viewer { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(0,0,0,.82); }
.photo-viewer-card { position: relative; max-width: min(95vw, 540px); padding: 16px; border-radius: 16px; background: var(--bg-cards, #181a20); color: var(--color-texto-general, #fff); text-align: center; }
.photo-viewer-card img { display: block; max-width: 100%; max-height: 72vh; object-fit: contain; border-radius: 10px; }
.photo-viewer-card p { margin: 12px 0 0; font-weight: 600; }
.photo-viewer-close { position: absolute; top: 4px; right: 8px; border: 0; background: rgba(0,0,0,.6); color: #fff; font-size: 27px; cursor: pointer; border-radius: 6px; }
</style>
