<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('renewalsTitle') }}</h1>
          <span class="title-underline"></span>
          <p class="main-subtitle">{{ t('renewalsSubtitle') }}</p>
        </div>
        <div class="actions-bar" id="tutorial-step-0">
          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" :placeholder="t('searchPlaceholder')" v-model="searchQuery">
            <button v-if="searchQuery" class="search-clear" type="button" @click="searchQuery = ''" aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>
      <!-- RESUMEN -->
      <p v-if="loading" class="data-message" role="status">{{ t('loading') }}</p>
      <p v-if="errorCarga" class="data-message error" role="alert">{{ errorCarga }} <button type="button" @click="loadUsers">{{ t('retry') }}</button></p>
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
              <th>{{ t('colDebt') }}</th>
              <th>{{ t('colActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in pagedUsers" :key="user.id">
              <td><div class="avatar-small" :style="avatarStyle(user.id)"><img v-if="user.photo" :src="user.photo" :alt="user.name" @error="user.photo=null" />{{ user.photo ? '' : getInitials(user.name) }}</div></td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email }}</td>
              <td><span class="type-chip" :class="periodClass(user.mensualidad)">{{ typeLabel(user.mensualidad) }}</span></td>
              <td class="text-muted">{{ user.expiredDate }}</td>
              <td><span class="status-badge" :class="getDebtClass(user.status)">{{ user.debt }}</span></td>
              <td>
                <div class="actions-cell" :id="!isMobile && index === 0 ? 'tutorial-step-2' : undefined">
                  <button class="icon-btn" :title="t('renewBtn')" @click="handleOpenRenew(user)"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.5 4a3.5 3.5 0 1 0 5 0m-5 0V3m5 6l-5-5-5 5"/></svg></button>
                  <button class="icon-btn delete-icon-btn" :title="t('deleteBtn')" @click="confirmDelete(user)"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
              </td>
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
          :class="'card-' + getDebtClass(user.status)"
          :id="isMobile && index === 0 ? 'tutorial-step-1' : undefined"
        >
          <div class="card-top-section">
            <div class="avatar-small" :style="avatarStyle(user.id)"><img v-if="user.photo" :src="user.photo" :alt="user.name" @error="user.photo=null" />{{ user.photo ? '' : getInitials(user.name) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <div class="badges-row">
                <span class="status-badge" :class="getDebtClass(user.status)">{{ user.debt }}</span>
                <span class="type-chip" :class="periodClass(user.mensualidad)">{{ typeLabel(user.mensualidad) }}</span>
              </div>
            </div>
          </div>
          <div class="card-meta">
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="email-text">{{ user.email }}</span></span>
            <span class="meta-row expiration-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="vence-label">{{ t('expiresLabel') }}:</span> {{ user.expiredDate }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="phone-text">{{ user.phone }}</span></span>
          </div>
          <div class="card-actions" :id="isMobile && index === 0 ? 'tutorial-step-2' : undefined">
            <button class="action-chip btn-renew-chip" @click="handleOpenRenew(user)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.5 4a3.5 3.5 0 1 0 5 0m-5 0V3m5 6l-5-5-5 5"/></svg>
              <span>{{ t('renewBtn') }}</span>
            </button>
            <button class="action-chip btn-delete-chip" @click="confirmDelete(user)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>{{ t('deleteBtn') }}</span>
            </button>
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
            <button class="btn-modal danger" :disabled="deleting" @click="executeDelete">{{ t('confirmDeleteBtn') }}</button>
          </div>
        </div>
      </ModalComponent>
    </main>
  </HeadingGYM_ACCOUNT>
</template>
<script setup lang="ts">
import {ref,computed,watch,onMounted,onUnmounted} from 'vue';
import {useRoute,useRouter} from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import ModalComponent from '../../Modals/ModalComponent.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
interface User{id:number;clienteId:number;name:string;email:string;expiredDate:string;mensualidad:string;debt:string;debtValue:number;status:string;phone:string;photo:string|null;}
const router=useRouter(),toastRef=ref<{notify?:(message:string,type:string)=>void}|null>(null),showDelete=ref(false),selectedUser=ref<User|null>(null),searchQuery=ref(''),users=ref<User[]>([]),loading=ref(false),errorCarga=ref(''),deleting=ref(false);
const langData={
 es:{renewalsTitle:'Renovaciones',renewalsSubtitle:'Gestiona las membresías vencidas o próximas a vencer de los usuarios',searchPlaceholder:'Buscar usuario...',monthly:'Mensual',fortnightly:'Quincenal',colPhoto:'Foto',colName:'Nombre',colEmail:'Correo',colType:'Pago',colExpiration:'Vencimiento',colDebt:'Adeudo',colActions:'Acciones',expiresLabel:'Vence',renewBtn:'Renovar',deleteBtn:'Retirar',emptyState:'No hay membresías que requieran renovación.',resultsLabel:'resultados',pagination:'Paginación',prevPage:'Página anterior',nextPage:'Página siguiente',statTotal:'Total',statExpired:'Vencidos',statPending:'Pendientes',statDebt:'Adeudo total',deleteTitle:'¿Retirar cliente?',deleteMsgPre:'¿Retirar temporalmente a',deleteMsgPost:'? Se conservarán sus pagos y datos.',cancelBtn:'Cancelar',confirmDeleteBtn:'Sí, retirar',successDeleted:'Cliente retirado temporalmente.',successRenewed:'Membresía actualizada.',loading:'Cargando renovaciones...',retry:'Reintentar'},
 en:{renewalsTitle:'Renewals',renewalsSubtitle:'Manage expired or upcoming membership renewals',searchPlaceholder:'Search client...',monthly:'Monthly',fortnightly:'Fortnightly',colPhoto:'Photo',colName:'Name',colEmail:'Email',colType:'Payment',colExpiration:'Expiration',colDebt:'Debt',colActions:'Actions',expiresLabel:'Expires',renewBtn:'Renew',deleteBtn:'Remove',emptyState:'No memberships currently require renewal.',resultsLabel:'results',pagination:'Pagination',prevPage:'Previous page',nextPage:'Next page',statTotal:'Total',statExpired:'Expired',statPending:'Pending',statDebt:'Total debt',deleteTitle:'Remove client?',deleteMsgPre:'Temporarily remove',deleteMsgPost:'? Their payments and data will be retained.',cancelBtn:'Cancel',confirmDeleteBtn:'Yes, remove',successDeleted:'Client temporarily removed.',successRenewed:'Membership updated.',loading:'Loading renewals...',retry:'Retry'}
} as const;
const t=(key:keyof typeof langData.es)=>langData[currentLang.value==='en'?'en':'es'][key]||langData.es[key];
const typeLabel=(p:string)=>p==='Mensual'?t('monthly'):p==='Quincenal'?t('fortnightly'):p;
const periodClass=(p:string)=>p==='Mensual'?'type-mensual':p==='Quincenal'?'type-quincenal':'type-other';
const getDebtClass=(s:string)=>s==='Inactivo'?'debt-inactive':s==='Próximo a vencer'?'debt-upcoming':s==='En tolerancia'?'debt-pending':'debt-pending';
type ApiRow={ID_Inscripto:number|string;ID_Cliente:number|string;nombre:string;correo:string|null;celular:string|null;foto_url:string|null;fecha_vencimiento:string|null;fecha_inscripcion?:string|null;plan:string|null;periodo:string|null;cantidad_meses?:number|null;estatus_inscripcion?:string|null;saldo_a_pagar:number|string|null;};
type ApiIngresos={inscripciones?:ApiRow[];message?:string;};
const API=String(import.meta.env.VITE_API_URL||'').trim().replace(/\/+$/,'').replace(/\/api$/i,'');
const getToken=():string=>{
 for(const store of [sessionStorage,localStorage]){
  for(const key of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']){const v=store.getItem(key);if(v)return v.replace(/^Bearer\s+/i,'');}
  for(const storageKey of ['auth','user','session','gymAccount','gym_account']){try{const session=JSON.parse(store.getItem(storageKey)||'null');const sessionToken=session?.token||session?.access_token||session?.accessToken;if(sessionToken)return String(sessionToken).replace(/^Bearer\s+/i,'');}catch{}}
 }
 return '';
};
const getStoredSede=():number=>{
 const keys=['selected_sede_id','sede_id','ID_Sede','id_sede','selectedSede','selectedSedeId','sedeSeleccionada','gym_sede_id'];
 for(const store of [sessionStorage,localStorage])for(const key of keys){
  const raw=store.getItem(key);if(!raw)continue;let value:unknown=raw;
  try{const obj:unknown=JSON.parse(raw);value=obj&&typeof obj==='object'?((obj as Record<string,unknown>).ID_Sede??(obj as Record<string,unknown>).sede_id??(obj as Record<string,unknown>).id??(obj as Record<string,unknown>).value):obj;}catch{}
  const num=Number(value);if(Number.isInteger(num)&&num>0)return num;
 }
 return 0;
};
const sedeEvento=ref(0),route=useRoute();
const sedeId=():number=>{if(sedeEvento.value>0)return sedeEvento.value;const fromUrl=Number(route.query.sede_id);if(Number.isInteger(fromUrl)&&fromUrl>0)return fromUrl;return getStoredSede()||1;};
const branchChange=(e:Event)=>{
 const detail=(e as CustomEvent<Record<string,unknown>>).detail;
 const nested=detail?.sede&&typeof detail.sede==='object'?detail.sede as Record<string,unknown>:{};
 const id=Number(detail?.sede_id??detail?.ID_Sede??detail?.id??detail?.sedeId??detail?.selectedSedeId??nested.ID_Sede??getStoredSede());
 sedeEvento.value=Number.isInteger(id)&&id>0?id:0;
 void loadUsers();
};
const apiRequest=async<T>(path:string):Promise<T>=>{
 const token=getToken();if(!token)throw new Error('No se encontró el token de sesión. Vuelve a iniciar sesión.');
 const r=await fetch(`${API}${path}`,{headers:{Accept:'application/json',Authorization:`Bearer ${token}`},cache:'no-store'});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||`HTTP ${r.status}: no se pudo consultar la sede ${sedeId()}.`);
 return d as T;
};
const formatDate=(value:string|null|undefined)=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(value||''));return m?`${m[3]}/${m[2]}/${m[1]}`:'—';};
const money=(n:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Math.max(0,n));
const notifyError=(message:string)=>{errorCarga.value=message;toastRef.value?.notify?.(message,'error');};
const avatarGradients=['linear-gradient(135deg,#7e22ce,#4c1d95)','linear-gradient(135deg,#ea580c,#9a3412)','linear-gradient(135deg,#db2777,#9d174d)','linear-gradient(135deg,#dc2626,#7f1d1d)','linear-gradient(135deg,#2563eb,#1e3a8a)','linear-gradient(135deg,#059669,#064e3b)'];
const avatarStyle=(id:number)=>({backgroundImage:avatarGradients[Math.abs(id)%avatarGradients.length]});
const getInitials=(name:string)=>{const p=name.trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase();};
const isMobile=ref(window.innerWidth<=900),updateWidth=()=>{isMobile.value=window.innerWidth<=900;};
const currentLang=ref(localStorage.getItem('GYM_ACCOUNT-idioma')||'es');
const handleLangChange=(e:Event)=>{const v=(e as CustomEvent<{idioma?:string}>).detail?.idioma;if(v)currentLang.value=v;};
const PAGE_SIZE=40,page=ref(1),totalPages=computed(()=>Math.max(1,Math.ceil(filteredUsers.value.length/PAGE_SIZE))),showPager=computed(()=>filteredUsers.value.length>PAGE_SIZE),pagedUsers=computed(()=>filteredUsers.value.slice((page.value-1)*PAGE_SIZE,page.value*PAGE_SIZE));
const goPage=(n:number)=>{page.value=Math.min(Math.max(1,n),totalPages.value);window.scrollTo({top:0,behavior:'smooth'});};
watch(totalPages,n=>{if(page.value>n)page.value=n;});
const refreshVisible=()=>{if(document.visibilityState==='visible')void loadUsers();};
const refreshFocus=()=>{void loadUsers();};
let loadSequence=0;
const loadUsers=async():Promise<void>=>{
 const seq=++loadSequence;loading.value=true;errorCarga.value='';
 try{
  const res=await apiRequest<ApiIngresos>(`/api/gym/ingresos?sede_id=${encodeURIComponent(sedeId())}`);
  if(!Array.isArray(res.inscripciones))throw new Error('La API de ingresos no devolvió inscripciones[].');
  if(seq!==loadSequence)return;
  // Usar estatus del servidor (calculado con la morosidad configurada), no fechas ni saldos inventados.
  const candidatos=new Set(['Próximo a vencer','Pendiente','En tolerancia','Inactivo']);
  users.value=res.inscripciones.filter(r=>Number(r.ID_Inscripto)>0&&candidatos.has(String(r.estatus_inscripcion||''))).map(r=>({
   id:Number(r.ID_Inscripto),clienteId:Number(r.ID_Cliente),name:r.nombre||'Sin nombre',email:r.correo||'',phone:r.celular||'',photo:r.foto_url||null,
   expiredDate:formatDate(r.fecha_vencimiento),mensualidad:String(r.periodo||'—'),status:String(r.estatus_inscripcion||'Pendiente'),debtValue:Math.max(0,Number(r.saldo_a_pagar||0)),debt:money(Number(r.saldo_a_pagar||0))
  }));
 }catch(e){if(seq!==loadSequence)return;users.value=[];notifyError(e instanceof Error?e.message:'Error consultando renovaciones.');}
 finally{if(seq===loadSequence)loading.value=false;}
};
const filteredUsers=computed(()=>{const q=searchQuery.value.toLocaleLowerCase().trim();return users.value.filter(u=>!q||[u.name,u.email,u.debt,u.phone,u.mensualidad,u.status,u.expiredDate,String(u.id)].some(v=>v.toLocaleLowerCase().includes(q)));});
watch(searchQuery,()=>page.value=1);
const stats=computed(()=>{const l=filteredUsers.value;return[{key:'statTotal' as const,value:String(l.length),tone:'total'},{key:'statExpired' as const,value:String(l.filter(u=>u.status==='Inactivo').length),tone:'red'},{key:'statPending' as const,value:String(l.filter(u=>u.status==='Pendiente'||u.status==='En tolerancia').length),tone:'orange'},{key:'statDebt' as const,value:money(l.reduce((a,u)=>a+u.debtValue,0)),tone:'red'}];});
// Renovar conduce al módulo real de cobro; no registra pagos fingidos en un modal local.
const handleOpenRenew=(user:User)=>{void router.push({path:`/GYM_ACCOUNT/pay/${user.clienteId}`,query:{sede_id:String(sedeId())}});};
const confirmDelete=(user:User)=>{selectedUser.value=user;showDelete.value=true;};
const executeDelete=async():Promise<void>=>{
 if(!selectedUser.value||deleting.value)return;deleting.value=true;
 try{
  const token=getToken();if(!token)throw new Error('Sesión caducada.');
  const res=await fetch(`${API}/api/gym/clientes/${selectedUser.value.clienteId}?sede_id=${encodeURIComponent(sedeId())}`,{method:'DELETE',headers:{Accept:'application/json',Authorization:`Bearer ${token}`}});
  if(!res.ok){const body=await res.json().catch(()=>({}));throw new Error(body?.message||`Error HTTP ${res.status}`);}
  showDelete.value=false;selectedUser.value=null;toastRef.value?.notify?.(t('successDeleted'),'success');await loadUsers();
 }catch(e){notifyError(e instanceof Error?e.message:'No se pudo retirar al cliente.');}
 finally{deleting.value=false;}
};
onMounted(()=>{window.addEventListener('idioma-changed',handleLangChange as EventListener);window.addEventListener('resize',updateWidth);window.addEventListener('factorfit:branch-changed',branchChange);window.addEventListener('focus',refreshFocus);document.addEventListener('visibilitychange',refreshVisible);void loadUsers();});
onUnmounted(()=>{loadSequence++;window.removeEventListener('idioma-changed',handleLangChange as EventListener);window.removeEventListener('resize',updateWidth);window.removeEventListener('factorfit:branch-changed',branchChange);window.removeEventListener('focus',refreshFocus);document.removeEventListener('visibilitychange',refreshVisible);});
watch(()=>route.query.sede_id,()=>{sedeEvento.value=0;void loadUsers();});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
.main-content,
.modal-wrapper {
  --accent: var(--color-highlight, #3b82f6);
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
.title-wrapper { min-width: 260px; display: flex; flex-direction: column; gap: 6px; }
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
.main-subtitle { max-width: 580px; margin: 1px 0 0; color: var(--muted); font-size: 0.82rem; font-weight: 500; line-height: 1.5; }
/* BUSCADOR */
.actions-bar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.search-wrapper { position: relative; display: flex; align-items: center; min-width: 250px; }
.search-icon { position: absolute; z-index: 2; left: 14px; color: var(--muted); pointer-events: none; opacity: 0.75; }
.search-input {
  width: 260px; height: 44px; padding: 0 38px 0 40px;
  border: 1px solid var(--line); border-radius: var(--radius-small);
  background: var(--card-bg); color: var(--color-texto-general, #ffffff);
  font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500; outline: none;
  transition: width 0.2s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.search-input::placeholder { color: var(--muted); opacity: 0.68; }
.search-input:hover { border-color: color-mix(in srgb, var(--color-texto-general, #ffffff) 25%, transparent); }
.search-input:focus { width: 290px; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.search-clear {
  position: absolute; right: 10px; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 50%;
  background: color-mix(in srgb, var(--color-texto-general, #ffffff) 10%, transparent);
  color: var(--muted); cursor: pointer; transition: background 0.15s ease;
}
.search-clear:hover { background: color-mix(in srgb, var(--color-texto-general, #ffffff) 20%, transparent); }
/* RESUMEN */
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.stat-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 3px; padding: 15px 18px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); }
.stat-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--tone, var(--accent)); }
.stat-total { --tone: var(--accent); }
.stat-orange { --tone: #fbbf24; }
.stat-red { --tone: #f87171; }
.stat-value { color: var(--color-titulos, #ffffff); font-family: 'Oswald', sans-serif; font-size: 1.5rem; font-weight: 600; line-height: 1.15; white-space: nowrap; }
.stat-label { color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
.desktop-only { display: block; }
.mobile-only { display: none; }
/* TABLA */
.table-container { position: relative; width: 100%; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); }
.table-container::before { content: ''; position: absolute; z-index: 3; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.7; pointer-events: none; }
.user-table { width: 100%; border-collapse: collapse; color: var(--color-texto-general, #e5e7eb); text-align: left; }
.user-table thead { background: color-mix(in srgb, var(--card-bg) 95%, var(--color-texto-general, #ffffff)); }
.user-table th { padding: 15px 18px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.065em; text-transform: uppercase; white-space: nowrap; }
.user-table td { padding: 13px 18px; border-top: 1px solid var(--line-soft); font-size: 0.82rem; vertical-align: middle; }
.user-table tbody tr:first-child td { border-top: none; }
.user-table tbody tr { transition: background 0.17s ease, box-shadow 0.17s ease; }
@media (hover: hover) {
  .user-table tbody tr:hover { background: color-mix(in srgb, var(--accent) 5%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--accent) 80%, transparent); }
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
/* ADEUDOS */
.status-badge { width: fit-content; min-height: 27px; display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px; border: 1px solid transparent; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.status-badge::before { content: ''; width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 14%, transparent); }
.debt-pending { color: #fbbf24; border-color: rgba(251, 191, 36, 0.25); background: rgba(251, 191, 36, 0.08); }
.debt-inactive { color: #f87171; border-color: rgba(248, 113, 113, 0.25); background: rgba(248, 113, 113, 0.08); }
.debt-default { color: #34d399; border-color: rgba(52, 211, 153, 0.25); background: rgba(52, 211, 153, 0.08); }
.badges-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
/* ACCIONES */
.actions-cell { display: flex; align-items: center; gap: 7px; }
.icon-btn {
  width: 37px; height: 37px; display: inline-flex; align-items: center; justify-content: center; padding: 0;
  border: 1px solid var(--line); border-radius: 9px;
  background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2.5%, transparent);
  color: var(--muted); cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.icon-btn svg { width: 17px; height: 17px; }
.icon-btn:not(.delete-icon-btn):hover { color: #60a5fa; border-color: rgba(59, 130, 246, 0.42); background: rgba(59, 130, 246, 0.1); box-shadow: 0 5px 13px rgba(59, 130, 246, 0.08); transform: translateY(-1px); }
.delete-icon-btn:hover { color: #f87171; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.09); box-shadow: 0 5px 13px rgba(239, 68, 68, 0.08); transform: translateY(-1px); }
.icon-btn:active { transform: translateY(0); }
/* EMPTY */
.empty-state-cell { padding: 0 !important; border-top: none !important; }
.empty-state, .empty-state-mobile { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 45px 20px; color: var(--muted); font-size: 0.82rem; font-weight: 500; text-align: center; }
.empty-state svg, .empty-state-mobile svg { opacity: 0.4; }
/* DATOS TARJETA */
.card-meta { display: flex; flex-direction: column; gap: 7px; color: var(--muted); font-size: 0.78rem; }
.meta-row { min-width: 0; display: flex; align-items: center; gap: 7px; }
.meta-row svg { flex-shrink: 0; opacity: 0.65; }
.email-text { overflow-wrap: anywhere; color: #93c5fd; }
.expiration-warning, .vence-label { color: #fb923c; }
.expiration-warning { font-weight: 500; }
.vence-label { font-weight: 600; }
.phone-text { color: var(--muted); }
/* MODALES (sin backdrop-filter para evitar artefactos al hacer scroll) */
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
.search-input:focus-visible, .icon-btn:focus-visible, .action-chip:focus-visible,
.btn-modal:focus-visible, .search-clear:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* TABLET */
@media (max-width: 1100px) {
  .main-content { padding: 30px 24px 48px; }
  .header-section { align-items: flex-start; flex-direction: column; gap: 17px; }
  .actions-bar { width: 100%; }
  .search-wrapper { width: 100%; }
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
  .actions-bar { width: 100%; }
  .search-wrapper { width: 100%; min-width: 0; }
  .search-input, .search-input:focus { width: 100%; max-width: 100%; }
  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 14px; }
  .stat-card { padding: 12px 14px; }
  .stat-value { font-size: 1.2rem; }
  .user-card { position: relative; width: 100%; overflow: hidden; margin-bottom: 11px; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card-bg); box-shadow: 0 9px 28px rgba(0, 0, 0, 0.17); }
  .user-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 3px; background: var(--accent); }
  .user-card.card-debt-pending::before { background: #fbbf24; }
  .user-card.card-debt-inactive::before { background: #f87171; }
  .user-card.card-debt-default::before { background: #34d399; }
  .card-top-section { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
  .user-card .avatar-small { width: 44px; height: 44px; border-radius: 12px; font-size: 0.78rem; }
  .card-user-titles { min-width: 0; display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 7px; }
  .name-text { width: 100%; overflow: hidden; color: var(--color-titulos, #ffffff); font-size: 0.88rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
  .card-meta { display: grid; gap: 8px; margin-bottom: 13px; padding: 11px 12px; border: 1px solid var(--line-soft); border-radius: 11px; background: color-mix(in srgb, var(--color-texto-general, #ffffff) 2%, transparent); font-size: 0.75rem; }
  .email-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding-top: 12px; border-top: 1px solid var(--line-soft); }
  .action-chip {
    min-width: 0; min-height: 40px; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 10px;
    border: 1px solid var(--line); border-radius: 9px; font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600; cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
  }
  .action-chip svg { flex-shrink: 0; }
  .btn-renew-chip { color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); background: rgba(59, 130, 246, 0.06); }
  .btn-renew-chip:hover { color: #93c5fd; border-color: rgba(59, 130, 246, 0.4); background: rgba(59, 130, 246, 0.12); transform: translateY(-1px); }
  .btn-delete-chip { color: #f87171; border-color: rgba(239, 68, 68, 0.18); background: rgba(239, 68, 68, 0.05); }
  .btn-delete-chip:hover { color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.11); transform: translateY(-1px); }
  .empty-state-mobile { min-height: 240px; margin-top: 8px; border: 1px dashed var(--line); border-radius: var(--radius); background: var(--card-bg); }
}
/* TELÉFONOS */
@media (max-width: 560px) {
  .main-content { padding: 17px 11px 30px; }
  .main-title { font-size: 1.7rem; }
  .user-card { padding: 15px; }
}
@media (max-width: 380px) {
  .main-content { padding-left: 9px; padding-right: 9px; }
  .main-title { font-size: 1.55rem; }
  .stat-value { font-size: 1.05rem; }
  .card-actions { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .search-input, .user-table tbody tr, .icon-btn, .action-chip, .btn-modal,
  .pop-enter-active, .pop-leave-active { transition: none !important; }
}
.data-message{padding:10px 14px;margin:8px 0 14px;border:1px solid rgba(96,165,250,.25);border-radius:10px;color:#93c5fd;background:rgba(96,165,250,.06);font-size:.82rem}.data-message.error{color:#fca5a5;border-color:rgba(248,113,113,.35)}.data-message button{margin-left:8px;cursor:pointer;color:inherit;border:0;background:transparent;text-decoration:underline}.avatar-small{overflow:hidden}.avatar-small img{width:100%;height:100%;object-fit:cover}.type-chip{font-weight:750;border-radius:8px}.type-mensual{color:#fda4af;border-color:rgba(251,113,133,.48);background:rgba(251,113,133,.17)}.type-quincenal{color:#93c5fd;border-color:rgba(96,165,250,.5);background:rgba(96,165,250,.17)}.type-other{color:#e9d5ff;border-color:rgba(192,132,252,.35);background:rgba(192,132,252,.12)}.debt-upcoming{color:#93c5fd;border-color:rgba(96,165,250,.3);background:rgba(96,165,250,.09)}.user-card.card-debt-upcoming::before{background:#60a5fa}
</style>
