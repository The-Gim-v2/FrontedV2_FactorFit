
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
          <select v-model="selectedRoleFilter" class="status-select">
            <option value="Todos">{{ t('roleAll') }}</option>
            <option value="Propietario">{{ L('Propietario', 'Owner', 'Propriétaire', 'Proprietário') }}</option>
            <option value="Gerente">{{ L('Gerente', 'Manager', 'Gérant', 'Gerente') }}</option>
            <option value="Entrenador">{{ t('roleTrainer') }}</option>
            <option value="Recepcionista">{{ t('roleReceptionist') }}</option>
          </select>
          <button class="btn-bulk" @click="activeModal = 'enviomasivo'"><span>✉</span> {{ t('bulkEmailBtn') }}</button>
          <div class="search-wrapper"><span class="search-icon">⌕</span><input v-model="searchQuery" class="search-input" type="search" :placeholder="t('searchPlaceholder')" /></div>
        </div>
      </header>

      <div v-if="loadingUsers" class="data-message">Cargando personal registrado...</div>
      <div v-if="errorUsers" class="data-message error-message" role="alert">{{ errorUsers }} <button @click="cargarPersonal">Reintentar</button></div>

      <div v-if="!isMobile" class="table-container desktop-only" id="tutorial-step-1">
        <table v-if="filteredUsers.length" class="user-table">
          <thead><tr><th>{{ t('tablePhoto') }}</th><th>{{ t('tableName') }}</th><th>{{ t('tableEmail') }}</th><th>{{ t('tablePhone') }}</th><th>{{ t('tableSystemRole') }}</th><th>{{ t('tableActions') }}</th></tr></thead>
          <tbody>
            <tr v-for="(user, index) in pagedUsers" :key="user.id">
              <td><div class="avatar-small" :style="{ background: avatarColor(user.name) }"><img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" /><span v-else>{{ initials(user.name) }}</span></div></td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email }}</td>
              <td class="text-muted">{{ user.phone }}</td>
              <td><span :class="['status-badge', getRoleClass(user.role)]"><i class="status-dot"></i>{{ roleText(user.role) }}</span></td>
              <td class="actions-cell" :id="index === 0 ? 'tutorial-step-2' : null">
                <button class="icon-btn" :title="t('actionEmail')" @click="openEmail(user)">✉</button>
                <button class="icon-btn" :title="t('actionWhatsApp')" @click="openWhatsApp(user.phone)">✓</button>
                <button class="icon-btn" :title="t('actionEdit')" @click="goToEdit(user.id)">✎</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loadingUsers && !errorUsers" class="empty-state">No hay personal registrado para esta sucursal o filtro.</div>
      </div>

      <div v-else class="mobile-only">
        <div v-if="!loadingUsers && !errorUsers && !filteredUsers.length" class="empty-state">No hay personal registrado para esta sucursal o filtro.</div>
        <article v-for="(user, index) in pagedUsers" :key="user.id" class="user-card" :id="index === 0 ? 'tutorial-step-1' : null">
          <div class="card-top-section">
            <div class="avatar-small" :style="{ background: avatarColor(user.name) }"><img v-if="user.foto" :src="user.foto" :alt="`Foto de ${user.name}`" loading="lazy" @error="user.foto = null" /><span v-else>{{ initials(user.name) }}</span></div>
            <div class="card-user-titles"><div class="text-bold name-text">{{ user.name }}</div><span :class="['status-badge', getRoleClass(user.role)]"><i class="status-dot"></i>{{ roleText(user.role) }}</span></div>
          </div>
          <div class="card-meta"><span>{{ user.email }}</span><span>{{ user.phone || 'Sin teléfono' }}</span></div>
          <div class="card-actions">
            <button class="action-chip" @click="openEmail(user)">✉ Email</button>
            <button class="action-chip" @click="openWhatsApp(user.phone)">✓ WApp</button>
            <button class="action-chip" @click="goToEdit(user.id)">✎ {{ t('actionEdit') }}</button>
          </div>
        </article>
      </div>

      <nav v-if="showPager" class="pager" aria-label="Paginación">
        <button class="pager-btn" :disabled="page <= 1" @click="goPage(page - 1)">‹</button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">›</button>
      </nav>
    </main>

    <transition name="pop"><div v-if="activeModal === 'enviomasivo'" class="modal-wrapper" @click.self="activeModal = null"><CorreoMasivo @close="activeModal = null" /></div></transition>
    <transition name="pop"><div v-if="activeModal === 'enviocorreo'" class="modal-wrapper" @click.self="activeModal = null"><EnvioCorreo @close="activeModal = null" /></div></transition>
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
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const PAGE_SIZE = 40;
let requestSequence = 0;

const t = key => traducciones[currentLang.value]?.[key] || traducciones.es?.[key] || key;
const L = (es, en, fr, pt) => ({ es, en, fr, pt })[currentLang.value] || es;
const roleText = role => ({ Propietario: L('Propietario','Owner','Propriétaire','Proprietário'), Gerente: L('Gerente','Manager','Gérant','Gerente'), Entrenador: t('roleTrainer'), Recepcionista: t('roleReceptionist') })[role] || role;
const getRoleClass = role => ({ Propietario: 'role-propietario', Gerente: 'role-gerente', Entrenador: 'role-entrenador', Recepcionista: 'role-recepcionista' })[role] || 'role-default';

const initials = (name = '') => { const parts = name.trim().split(/\s+/).filter(Boolean); return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'; };
const avatarColor = (name = '') => { const colors = ['#3b82f6','#a855f7','#22c55e','#f59e0b','#ec4899','#14b8a6']; let hash = 0; for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash); const color = colors[Math.abs(hash) % colors.length]; return `linear-gradient(135deg,${color},${color}99)`; };

const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
      const value = storage.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth','user','session','gymAccount','gym_account']) {
      try { const data = JSON.parse(storage.getItem(key) || 'null'); const token = data?.token || data?.access_token || data?.accessToken; if (token) return token; } catch {}
    }
  }
  return '';
};

// Esta es la misma clave que utiliza HeadingGYM_ACCOUNT.vue.
const obtenerSedeId = () => {
  const id = Number(sessionStorage.getItem('selected_sede_id'));
  return Number.isInteger(id) && id > 0 ? id : null;
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
    const sedeId = obtenerSedeId();
    if (!sedeId) throw new Error('Selecciona una sucursal para visualizar el personal.');
    const response = await fetch(`${API}/api/personal?sede_id=${encodeURIComponent(sedeId)}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.message || `Error HTTP ${response.status}`);
    const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    const roles = { GYM_ADMIN: 'Propietario', GYM_MANAGER: 'Gerente', GYM_COACH: 'Entrenador', GYM_RECEPCIONIST: 'Recepcionista' };
    if (current !== requestSequence) return;
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
    console.log('Personal cargado para sede:', sedeId, users.value);
  } catch (error) {
    if (current !== requestSequence) return;
    errorUsers.value = error.message || 'No se pudo cargar el personal.';
    console.error('Error al cargar personal:', error);
    toastRef.value?.notify(errorUsers.value, 'error');
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

const openEmail = user => { if (!user.email) return toastRef.value?.notify('Este empleado no tiene correo.', 'error'); activeModal.value = 'enviocorreo'; };
const openWhatsApp = phone => { const number = String(phone || '').replace(/\D/g, ''); if (!number) return toastRef.value?.notify('Este empleado no tiene teléfono.', 'error'); window.open(`https://wa.me/${number.length === 10 ? '52' + number : number}`, '_blank', 'noopener,noreferrer'); };
const goToEdit = id => router.push(`/GYM_ACCOUNT/editar-staff/${id}`);
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
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box}
.main-content{width:100%;min-height:calc(100vh - 90px);padding:34px clamp(16px,3vw,40px) 60px;color:var(--color-texto-general,#e5e7eb)}
.header-section{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:22px}
.main-title{font-family:Anton,Impact,sans-serif;font-size:42px;font-weight:400;line-height:1.15;color:var(--color-titulos,#fff);margin:0 0 7px}
.result-count{display:inline-block;border:1px solid rgba(148,163,184,.2);background:rgba(148,163,184,.07);border-radius:30px;padding:5px 12px;font-size:12px;margin:0;color:var(--color-texto-general,#cbd5e1)}
.actions-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
.status-select,.search-wrapper{height:44px;background:var(--bg-cards,#1c1d2b);color:var(--color-texto-general,#e2e8f0);border:1px solid rgba(148,163,184,.18);border-radius:13px}
.status-select{min-width:170px;padding:0 14px;outline:none;cursor:pointer}
.btn-bulk{height:44px;padding:0 20px;border:0;border-radius:12px;background:var(--color-botones,#e54470);color:var(--color-texto-botones,#fff);font-weight:700;cursor:pointer;white-space:nowrap}
.btn-bulk:hover{filter:brightness(1.08)}
.search-wrapper{display:flex;align-items:center;gap:8px;padding:0 13px;min-width:230px}
.search-icon{font-size:22px;color:#9ca3af}
.search-input{width:100%;background:transparent;border:0;outline:0;color:inherit;font:inherit;font-size:13px}
.search-input::placeholder{color:#8c90a3}
.data-message{padding:14px 16px;margin-bottom:14px;border:1px solid rgba(148,163,184,.18);border-radius:12px;background:var(--bg-cards,#1c1d2b);font-size:13px}
.error-message{color:#fca5a5}
.error-message button{background:none;border:0;color:#fb923c;font-weight:700;cursor:pointer;margin-left:8px}
.table-container{width:100%;overflow-x:auto;border:1px solid rgba(148,163,184,.2);border-radius:24px;background:var(--bg-cards,#1b1c2b)}
.user-table{width:100%;border-collapse:collapse;min-width:850px;text-align:left;font-size:13px}
.user-table thead{background:rgba(148,163,184,.07)}
.user-table th{padding:17px 18px;text-transform:uppercase;font-size:11px;letter-spacing:.35px;color:#a9b7d4;font-weight:800}
.user-table td{padding:13px 18px;border-top:1px solid rgba(148,163,184,.1);vertical-align:middle}
.text-bold{font-weight:700;color:var(--color-titulos,#fff)}
.text-muted{color:var(--color-texto-general,#c0c8df)}
.avatar-small{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#fff;font-size:12px;font-weight:800;border:1px solid rgba(255,255,255,.15);flex-shrink:0}
.avatar-small img{width:100%;height:100%;object-fit:cover}
.status-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border-radius:22px;border:1px solid currentColor;font-size:11px;font-weight:800;white-space:nowrap}
.status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor}
.role-propietario{color:#fbbf24;background:rgba(251,191,36,.08);border-color:rgba(251,191,36,.28)}
.role-gerente{color:#c084fc;background:rgba(192,132,252,.08);border-color:rgba(192,132,252,.28)}
.role-entrenador{color:#60a5fa;background:rgba(96,165,250,.08);border-color:rgba(96,165,250,.28)}
.role-recepcionista{color:#34d399;background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.28)}
.role-default{color:#cbd5e1;background:rgba(148,163,184,.08);border-color:rgba(148,163,184,.25)}
.actions-cell{white-space:nowrap}
.icon-btn{width:37px;height:37px;margin-right:5px;border:1px solid rgba(148,163,184,.2);border-radius:11px;background:rgba(148,163,184,.04);color:#aab1c6;font-size:20px;cursor:pointer}
.icon-btn:hover{color:#fff;border-color:var(--color-botones,#e54470)}
.empty-state{text-align:center;padding:55px 16px;color:#a4acc0;font-size:14px}
.mobile-only{display:none}
.user-card{border:1px solid rgba(148,163,184,.18);border-radius:19px;background:var(--bg-cards,#1b1c2b);padding:16px;margin-bottom:12px}
.card-top-section{display:flex;align-items:center;gap:12px}
.card-user-titles{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:7px}
.name-text{font-size:14px;overflow-wrap:anywhere}
.card-meta{display:flex;flex-direction:column;gap:6px;margin:15px 0;font-size:12px;color:#aab5ce;overflow-wrap:anywhere}
.card-actions{display:flex;gap:8px;border-top:1px solid rgba(148,163,184,.12);padding-top:12px}
.action-chip{flex:1;min-width:0;padding:10px 5px;background:rgba(148,163,184,.06);border:1px solid rgba(148,163,184,.16);border-radius:10px;color:var(--color-texto-general,#e5e7eb);font-size:12px;font-weight:700;cursor:pointer}
.pager{display:flex;justify-content:center;align-items:center;gap:15px;margin:25px auto}
.pager-btn{width:38px;height:38px;background:var(--bg-cards,#1b1c2b);border:1px solid rgba(148,163,184,.2);border-radius:10px;color:#fff;font-size:23px;cursor:pointer}
.pager-btn:disabled{opacity:.35;cursor:not-allowed}
.pager-info{font-size:13px}
.modal-wrapper{position:fixed;inset:0;z-index:3000;display:flex;justify-content:center;align-items:center;background:rgba(0,0,0,.7);padding:15px;overflow-y:auto}
.pop-enter-active,.pop-leave-active{transition:opacity .2s ease}
.pop-enter-from,.pop-leave-to{opacity:0}
@media(max-width:900px){.main-content{padding:24px 16px 110px}.main-title{font-size:35px}.header-section{display:block}.actions-bar{display:flex;flex-direction:column;align-items:stretch;margin-top:18px;gap:9px}.status-select,.btn-bulk,.search-wrapper{width:100%;min-width:0}.desktop-only{display:none}.mobile-only{display:block}.user-card .avatar-small{width:48px;height:48px}}
</style>
