<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div class="title-wrapper">
          <h1 class="main-title">{{ t('debtorsTitle') }}</h1>
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

          <div class="select-wrapper">
            <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <select class="status-select" v-model="selectedStatus">
              <option value="">{{ t('statusAll') }}</option>
              <option value="Pendiente">{{ t('pending') }}</option>
              <option value="Vencido">{{ t('overdue') }}</option>
            </select>
            <svg class="select-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" :placeholder="t('searchPlaceholder')" v-model="searchQuery">
            <button v-if="searchQuery" class="search-clear" type="button" @click="searchQuery=''" aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <button class="btn-bulk" @click="activeModal='enviomasivo'">
            <span class="btn-bulk-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
            {{ t('bulkEmail') }}
          </button>
        </div>
      </header>

      <section class="stats-row">
        <div class="stat-card" v-for="s in stats" :key="s.key" :class="'stat-'+s.tone">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ t(s.key) }}</span>
        </div>
      </section>

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
            <tr v-for="(user,index) in pagedUsers" :key="user.id">
              <td>
                <img v-if="user.photo" :src="user.photo" class="photo-img" alt="Foto cliente">
                <div v-else class="avatar-small" :style="avatarStyle(user.id)">{{ getInitials(user.name) }}</div>
              </td>
              <td class="text-bold">{{ user.name }}</td>
              <td class="text-muted">{{ user.email || '—' }}</td>
              <td><span class="type-chip" :class="membershipClass(user.membership)">{{ user.membership }}</span></td>
              <td class="text-muted">{{ user.expiredDate }}</td>
              <td><span class="status-badge" :class="getDebtClass(user.status)">{{ user.debt }}</span></td>
              <td>
                <div class="actions-cell" :id="!isMobile && index===0 ? 'tutorial-step-2' : undefined">
                  <button class="icon-btn" title="Email" @click="activeModal='enviocorreo'"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></button>
                  <button class="icon-btn whatsapp-icon-btn" title="WhatsApp" @click="openWhatsApp(user.phone)"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 5.6 8.5 8.5 0 0 1-7.6-5.6 8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/><path d="M9 12l2 2 4-4"/></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length===0">
              <td colspan="7" class="empty-state-cell">
                <div class="empty-state">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>{{ loading ? t('loading') : t('emptyState') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">{{ filteredUsers.length }} {{ t('resultsLabel') }}</div>
      </div>

      <div class="mobile-only">
        <div v-for="(user,index) in pagedUsers" :key="user.id" class="user-card" :class="'card-'+getDebtClass(user.status)" :id="isMobile && index===0 ? 'tutorial-step-1' : undefined">
          <div class="card-top-section">
            <img v-if="user.photo" :src="user.photo" class="photo-img photo-mobile" alt="Foto cliente">
            <div v-else class="avatar-small" :style="avatarStyle(user.id)">{{ getInitials(user.name) }}</div>
            <div class="card-user-titles">
              <div class="text-bold name-text">{{ user.name }}</div>
              <div class="badges-row">
                <span class="status-badge" :class="getDebtClass(user.status)">{{ user.debt }}</span>
                <span class="type-chip" :class="membershipClass(user.membership)">{{ user.membership }}</span>
              </div>
            </div>
          </div>

          <div class="card-meta">
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span class="email-text">{{ user.email || '—' }}</span></span>
            <span class="meta-row expiration-warning"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="vence-label">{{ t('expiresLabel') }}:</span> {{ user.expiredDate }}</span>
            <span class="meta-row"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="phone-text">{{ user.phone || '—' }}</span></span>
          </div>

          <div class="card-actions" :id="isMobile && index===0 ? 'tutorial-step-2' : undefined">
            <button class="action-chip btn-email-chip" @click="activeModal='enviocorreo'"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>Email</span></button>
            <button class="action-chip btn-whatsapp-chip" @click="openWhatsApp(user.phone)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 5.6 8.5 8.5 0 0 1-7.6-5.6 8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/><path d="M9 12l2 2 4-4"/></svg><span>WhatsApp</span></button>
          </div>
        </div>

        <div v-if="filteredUsers.length===0" class="empty-state-mobile">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>{{ loading ? t('loading') : t('emptyState') }}</span>
        </div>
      </div>

      <nav v-if="showPager" class="pager" :aria-label="t('pagination')">
        <button class="pager-btn" type="button" :disabled="page<=1" :aria-label="t('prevPage')" @click="goPage(page-1)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span class="pager-info"><b>{{ page }}</b> / {{ totalPages }}</span>
        <button class="pager-btn" type="button" :disabled="page>=totalPages" :aria-label="t('nextPage')" @click="goPage(page+1)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </nav>

      <ModalComponent :isOpen="showDelete" @close="showDelete=false">
        <div class="modal-body-custom">
          <div class="modal-icon-container danger-bg"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
          <h2>{{ t('deleteTitle') }}</h2>
          <p>{{ t('deleteMsgPre') }} <span class="highlight-name">{{ selectedUser?.name }}</span> {{ t('deleteMsgPost') }}</p>
          <div class="modal-buttons">
            <button class="btn-modal secondary" @click="showDelete=false">{{ t('cancelBtn') }}</button>
            <button class="btn-modal danger">{{ t('confirmBtn') }}</button>
          </div>
        </div>
      </ModalComponent>
    </main>

    <transition name="pop"><div v-if="activeModal==='enviomasivo'" class="modal-wrapper" @click.self="activeModal=null"><CorreoMasivo @close="activeModal=null" /></div></transition>
    <transition name="pop"><div v-if="activeModal==='enviocorreo'" class="modal-wrapper" @click.self="activeModal=null"><EnvioCorreo @close="activeModal=null" /></div></transition>
  </HeadingGYM_ACCOUNT>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import ModalComponent from '../../Modals/ModalComponent.vue';
import CorreoMasivo from '../Componets/Bulk-Email.vue';
import EnvioCorreo from '../Componets/Mail.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

interface User{ id:number; name:string; email:string; expiredDate:string; membership:string; debt:string; debtValue:number; status:'Pendiente'|'Vencido'; phone:string; photo:string|null; }
interface ApiRow{ ID_Inscripto:number; ID_Cliente:number; nombre:string; correo:string|null; celular:string|null; foto_url:string|null; fecha_vencimiento:string|null; plan:string|null; periodo:string|null; saldo_a_pagar:number|string|null; }
const activeModal=ref<string|null>(null),toastRef=ref<any>(null),showDelete=ref(false),selectedUser=ref<User|null>(null),selectedMembership=ref(''),selectedStatus=ref(''),searchQuery=ref(''),loading=ref(false),users=ref<User[]>([]);
const currentLang=ref<string>(localStorage.getItem('GYM_ACCOUNT-idioma')||'es');
const handleLangChange=(e:Event)=>{const ce=e as CustomEvent<{idioma?:string}>;if(ce.detail?.idioma)currentLang.value=ce.detail.idioma;};
const langData={es:{debtorsTitle:'Deudores',pageSubtitle:'Da seguimiento a los pagos pendientes y contacta a tus miembros.',membershipAll:'Todas las membresías',monthly:'Mensual',fortnightly:'Quincenal',statusAll:'Todos los estados',pending:'Pendiente',overdue:'Vencido',bulkEmail:'Correo Masivo',searchPlaceholder:'Buscar cliente...',colPhoto:'Foto',colName:'Nombre',colEmail:'Correo',colType:'Pago',colExpiration:'Vencimiento',colDebt:'Adeudo',colActions:'Acciones',expiresLabel:'Vence',emptyState:'No se encontraron resultados con esos filtros.',resultsLabel:'resultados',pagination:'Paginación',prevPage:'Página anterior',nextPage:'Página siguiente',statDebt:'Adeudo total',statDebtors:'Clientes',statPending:'Pendientes',statInactive:'Vencidos',deleteTitle:'¿Eliminar usuario?',deleteMsgPre:'¿Deseas eliminar a',deleteMsgPost:'temporalmente?',cancelBtn:'Cancelar',confirmBtn:'Confirmar',loading:'Cargando...'},en:{debtorsTitle:'Debtors',pageSubtitle:'Track pending payments and reach out to your members.',membershipAll:'All memberships',monthly:'Monthly',fortnightly:'Fortnightly',statusAll:'All statuses',pending:'Pending',overdue:'Overdue',bulkEmail:'Bulk Email',searchPlaceholder:'Search client...',colPhoto:'Photo',colName:'Name',colEmail:'Email',colType:'Payment',colExpiration:'Expiration',colDebt:'Debt',colActions:'Actions',expiresLabel:'Expires',emptyState:'No results found with those filters.',resultsLabel:'results',pagination:'Pagination',prevPage:'Previous page',nextPage:'Next page',statDebt:'Total debt',statDebtors:'Clients',statPending:'Pending',statInactive:'Overdue',deleteTitle:'Delete user?',deleteMsgPre:'Do you want to temporarily delete',deleteMsgPost:'?',cancelBtn:'Cancel',confirmBtn:'Confirm',loading:'Loading...'}} as const;
const t=(key:string)=>{const k=(currentLang.value==='en'?'en':'es') as 'es'|'en';return langData[k][key as keyof typeof langData['es']]||langData.es[key as keyof typeof langData['es']]||key;};
const isMobile=ref(window.innerWidth<=900),updateWidth=()=>{isMobile.value=window.innerWidth<=900;};
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'',headers:{Accept:'application/json'}});
api.interceptors.request.use(config=>{const token=localStorage.getItem('token')||localStorage.getItem('auth_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
const formatCurrency=(value:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(value||0));
const formatDate=(value:string|null|undefined)=>{if(!value)return '—';const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());if(!m)return value;return `${m[3]}/${m[2]}/${m[1]}`;};
const normalizeMembership=(value:string|null|undefined)=>{const s=String(value||'').toLowerCase();if(s.includes('quinc'))return 'Quincenal';return 'Mensual';};
const membershipClass=(value:string)=>value==='Quincenal'?'type-quincenal':'type-mensual';
const daysLate=(date:string|null|undefined)=>{if(!date)return 0;const d=new Date(String(date).slice(0,10)+'T00:00:00');const today=new Date();today.setHours(0,0,0,0);return Math.floor((today.getTime()-d.getTime())/86400000);};
const mapStatus=(vencimiento:string|null|undefined)=>daysLate(vencimiento)>=30?'Vencido':'Pendiente';
const loadDebtors=async()=>{loading.value=true;try{const sedeId=Number(new URLSearchParams(window.location.search).get('sede_id')||localStorage.getItem('sede_id')||1);const {data}=await api.get('/api/gym/ingresos',{params:{sede_id:sedeId}});const rows=(data?.inscripciones||[]) as ApiRow[];users.value=rows.filter(r=>Number(r.saldo_a_pagar||0)>0).map(r=>({id:Number(r.ID_Inscripto),name:r.nombre||'Sin nombre',email:r.correo||'',expiredDate:formatDate(r.fecha_vencimiento),membership:normalizeMembership(r.periodo||r.plan),debtValue:Number(r.saldo_a_pagar||0),debt:formatCurrency(Number(r.saldo_a_pagar||0)),status:mapStatus(r.fecha_vencimiento),phone:r.celular||'',photo:r.foto_url||null}));}catch(e:any){users.value=[];toastRef.value?.show?.({type:'error',title:'Error',message:e?.response?.data?.message||'No se pudo cargar la lista de deudores.'});}finally{loading.value=false;}};
const filteredUsers=computed(()=>{const term=searchQuery.value.toLowerCase().trim();return users.value.filter(user=>{const matchMembership=selectedMembership.value?user.membership===selectedMembership.value:true;const matchStatus=selectedStatus.value?user.status===selectedStatus.value:true;const matchSearch=!term||user.name.toLowerCase().includes(term)||user.email.toLowerCase().includes(term)||user.debt.toLowerCase().includes(term)||user.phone.toLowerCase().includes(term)||user.membership.toLowerCase().includes(term)||user.status.toLowerCase().includes(term)||user.expiredDate.toLowerCase().includes(term)||String(user.id).includes(term);return matchMembership&&matchStatus&&matchSearch;});});
const PAGE_SIZE=40,page=ref(1),totalPages=computed(()=>Math.max(1,Math.ceil(filteredUsers.value.length/PAGE_SIZE))),showPager=computed(()=>filteredUsers.value.length>PAGE_SIZE),pagedUsers=computed(()=>filteredUsers.value.slice((page.value-1)*PAGE_SIZE,(page.value-1)*PAGE_SIZE+PAGE_SIZE)),goPage=(n:number)=>{page.value=Math.min(Math.max(1,n),totalPages.value);window.scrollTo({top:0,behavior:'smooth'});};
watch([searchQuery,selectedMembership,selectedStatus],()=>page.value=1);watch(totalPages,n=>{if(page.value>n)page.value=n;});
const stats=computed(()=>{const list=filteredUsers.value,total=list.reduce((sum,u)=>sum+u.debtValue,0);return[{key:'statDebt',value:formatCurrency(total),tone:'red'},{key:'statDebtors',value:String(list.length),tone:'total'},{key:'statPending',value:String(list.filter(u=>u.status==='Pendiente').length),tone:'orange'},{key:'statInactive',value:String(list.filter(u=>u.status==='Vencido').length),tone:'red'}];});
const avatarGradients=['linear-gradient(135deg,#7e22ce,#4c1d95)','linear-gradient(135deg,#ea580c,#9a3412)','linear-gradient(135deg,#db2777,#9d174d)','linear-gradient(135deg,#dc2626,#7f1d1d)','linear-gradient(135deg,#2563eb,#1e3a8a)','linear-gradient(135deg,#059669,#064e3b)'];
const getInitials=(name:string)=>{const parts=name.trim().split(/\s+/).filter(Boolean);return((parts[0]?.[0]||'')+(parts[1]?.[0]||'')).toUpperCase();};
const avatarStyle=(id:number)=>({backgroundImage:avatarGradients[id%avatarGradients.length]});
const getDebtClass=(status:string)=>status==='Pendiente'?'debt-pending':status==='Vencido'?'debt-overdue':'debt-default';
const openWhatsApp=(phone:string)=>{if(!phone)return;window.open(`https://wa.me/${phone.replace(/\D/g,'')}`,'_blank','noopener');};
onMounted(()=>{window.addEventListener('idioma-changed',handleLangChange as EventListener);window.addEventListener('resize',updateWidth);loadDebtors();});
onUnmounted(()=>{window.removeEventListener('idioma-changed',handleLangChange as EventListener);window.removeEventListener('resize',updateWidth);});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
.main-content,.modal-wrapper{--accent:var(--color-highlight,#3b82f6);--card-bg:var(--bg-cards,#121416);--radius:var(--app-border-radius,14px);--radius-small:10px;--line:color-mix(in srgb,var(--color-texto-general,#94a3b8) 16%,transparent);--line-soft:color-mix(in srgb,var(--color-texto-general,#94a3b8) 9%,transparent);--muted:color-mix(in srgb,var(--color-texto-general,#94a3b8) 68%,transparent);}
.main-content *,.main-content *::before,.main-content *::after{box-sizing:border-box;}
.main-content{width:100%;max-width:1500px;margin:0 auto;padding:34px 36px 55px;color:var(--color-texto-general,#e5e7eb);font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;}
.header-section{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:22px;}
.title-wrapper{min-width:240px;display:flex;flex-direction:column;gap:6px;}
.main-title{margin:0;color:var(--color-titulos,#fff);font-family:'Anton',sans-serif;font-size:clamp(1.9rem,3vw,2.55rem);font-weight:400;line-height:1;letter-spacing:.02em;text-transform:uppercase;}
.title-underline{display:block;width:58px;height:3px;margin-top:2px;border-radius:999px;background:linear-gradient(90deg,var(--accent),transparent);}
.main-subtitle{max-width:560px;margin:1px 0 0;color:var(--muted);font-size:.82rem;font-weight:500;line-height:1.5;}
.actions-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;}
.search-wrapper,.select-wrapper{position:relative;display:flex;align-items:center;}
.search-icon,.select-icon{position:absolute;z-index:2;left:14px;color:var(--muted);pointer-events:none;opacity:.75;}
.select-arrow{position:absolute;z-index:2;right:14px;color:var(--muted);pointer-events:none;opacity:.75;}
.search-input,.status-select{height:44px;border:1px solid var(--line);border-radius:var(--radius-small);background:var(--card-bg);color:var(--color-texto-general,#fff);font-family:'Inter',sans-serif;font-size:.82rem;font-weight:500;outline:none;transition:width .2s ease,border-color .18s ease,box-shadow .18s ease;}
.search-input:hover,.status-select:hover{border-color:color-mix(in srgb,var(--color-texto-general,#fff) 25%,transparent);}
.search-input:focus,.status-select:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent);}
.search-input{width:230px;padding:0 38px 0 40px;}
.search-input:focus{width:260px;}
.search-input::placeholder{color:var(--muted);opacity:.68;}
.search-clear{position:absolute;right:10px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:none;border-radius:50%;background:color-mix(in srgb,var(--color-texto-general,#fff) 10%,transparent);color:var(--muted);cursor:pointer;transition:background .15s ease;}
.search-clear:hover{background:color-mix(in srgb,var(--color-texto-general,#fff) 20%,transparent);}
.status-select{min-width:180px;padding:0 38px 0 40px;appearance:none;-webkit-appearance:none;cursor:pointer;color-scheme:dark;}
.status-select option{background:#111315;color:#fff;}
.btn-bulk{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:0 18px 0 8px;border:1px solid var(--accent);border-radius:var(--radius-small);background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 78%,black));color:#fff;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:650;white-space:nowrap;cursor:pointer;box-shadow:0 6px 16px color-mix(in srgb,var(--accent) 24%,transparent);transition:filter .18s ease,box-shadow .18s ease,transform .18s ease;}
.btn-bulk-icon{width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:8px;background:rgba(255,255,255,.16);color:#fff;}
.btn-bulk:hover{filter:brightness(1.08);box-shadow:0 10px 22px color-mix(in srgb,var(--accent) 32%,transparent);transform:translateY(-1px);}
.btn-bulk:active{transform:translateY(0);}
.stats-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px;}
.stat-card{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:3px;padding:15px 18px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card-bg);}
.stat-card::before{content:'';position:absolute;top:0;bottom:0;left:0;width:3px;background:var(--tone,var(--accent));}
.stat-total{--tone:var(--accent);}
.stat-orange{--tone:#fbbf24;}
.stat-red{--tone:#f87171;}
.stat-value{color:var(--color-titulos,#fff);font-family:'Oswald',sans-serif;font-size:1.5rem;font-weight:600;line-height:1.15;white-space:nowrap;}
.stat-label{color:var(--muted);font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;}
.desktop-only{display:block;}
.mobile-only{display:none;}
.table-container{position:relative;width:100%;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius);background:var(--card-bg);box-shadow:0 16px 40px rgba(0,0,0,.18);}
.table-container::before{content:'';position:absolute;z-index:3;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.7;pointer-events:none;}
.user-table{width:100%;border-collapse:collapse;color:var(--color-texto-general,#e5e7eb);text-align:left;}
.user-table thead{background:color-mix(in srgb,var(--card-bg) 95%,var(--color-texto-general,#fff));}
.user-table th{padding:15px 18px;border-bottom:1px solid var(--line);color:var(--muted);font-size:.68rem;font-weight:700;letter-spacing:.065em;text-transform:uppercase;white-space:nowrap;}
.user-table td{padding:13px 18px;border-top:1px solid var(--line-soft);font-size:.82rem;vertical-align:middle;}
.user-table tbody tr:first-child td{border-top:none;}
.user-table tbody tr{transition:background .17s ease,box-shadow .17s ease;}
@media (hover:hover){.user-table tbody tr:hover{background:color-mix(in srgb,var(--accent) 5%,transparent);box-shadow:inset 3px 0 0 color-mix(in srgb,var(--accent) 80%,transparent);}}
.table-footer{padding:11px 18px;border-top:1px solid var(--line-soft);color:var(--muted);font-size:.72rem;font-weight:500;text-align:right;}
.avatar-small,.photo-img{width:41px;height:41px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:11px;box-shadow:0 5px 14px rgba(0,0,0,.24);}
.avatar-small{border:1px solid rgba(255,255,255,.14);color:#fff;font-size:.74rem;font-weight:700;letter-spacing:.02em;}
.photo-img{object-fit:cover;border:1px solid rgba(255,255,255,.14);}
.photo-mobile{width:44px;height:44px;border-radius:12px;}
.text-bold{color:var(--color-titulos,#fff);font-weight:600;}
.text-muted{color:var(--muted);}
.type-chip{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:4px 11px;border:1px solid transparent;border-radius:999px;font-size:.72rem;font-weight:700;white-space:nowrap;}
.type-mensual{color:#fb7185;border-color:rgba(251,113,133,.28);background:rgba(251,113,133,.10);}
.type-quincenal{color:#60a5fa;border-color:rgba(96,165,250,.28);background:rgba(96,165,250,.10);}
.status-badge{width:fit-content;min-height:27px;display:inline-flex;align-items:center;gap:7px;padding:4px 11px;border:1px solid transparent;border-radius:999px;font-size:.72rem;font-weight:700;white-space:nowrap;}
.status-badge::before{content:'';width:6px;height:6px;flex-shrink:0;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 14%,transparent);}
.debt-pending{color:#fbbf24;border-color:rgba(251,191,36,.25);background:rgba(251,191,36,.08);}
.debt-overdue{color:#f87171;border-color:rgba(248,113,113,.25);background:rgba(248,113,113,.08);}
.debt-default{color:#34d399;border-color:rgba(52,211,153,.25);background:rgba(52,211,153,.08);}
.badges-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.actions-cell{display:flex;align-items:center;gap:7px;}
.icon-btn{width:37px;height:37px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:1px solid var(--line);border-radius:9px;background:color-mix(in srgb,var(--color-texto-general,#fff) 2.5%,transparent);color:var(--muted);cursor:pointer;transition:color .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease;}
.icon-btn svg{width:17px;height:17px;}
.icon-btn:not(.whatsapp-icon-btn):hover{color:#60a5fa;border-color:rgba(59,130,246,.42);background:rgba(59,130,246,.1);transform:translateY(-1px);}
.whatsapp-icon-btn:hover{color:#4ade80;border-color:rgba(34,197,94,.42);background:rgba(34,197,94,.09);box-shadow:0 5px 13px rgba(34,197,94,.07);transform:translateY(-1px);}
.icon-btn:active{transform:translateY(0);}
.empty-state-cell{padding:0 !important;border-top:none !important;}
.empty-state,.empty-state-mobile{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:45px 20px;color:var(--muted);font-size:.82rem;font-weight:500;text-align:center;}
.empty-state svg,.empty-state-mobile svg{opacity:.4;}
.card-meta{display:flex;flex-direction:column;gap:7px;color:var(--muted);font-size:.78rem;}
.meta-row{min-width:0;display:flex;align-items:center;gap:7px;}
.meta-row svg{flex-shrink:0;opacity:.65;}
.email-text{overflow-wrap:anywhere;color:#93c5fd;}
.expiration-warning,.vence-label{color:#fb923c;}
.expiration-warning{font-weight:500;}
.vence-label{font-weight:600;}
.phone-text{color:var(--muted);}
.modal-wrapper{position:fixed;z-index:9999;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.78);}
.modal-body-custom{padding:10px 5px;color:var(--color-texto-general,#fff);text-align:center;}
.modal-icon-container{width:54px;height:54px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border-radius:15px;}
.danger-bg{border:1px solid rgba(248,113,113,.2);background:rgba(248,113,113,.08);}
.modal-body-custom h2{margin:0 0 9px;color:var(--color-titulos,#fff);font-family:'Oswald',sans-serif;font-size:1.25rem;font-weight:600;}
.modal-body-custom p{margin:0 0 22px;color:var(--muted);font-size:.8rem;line-height:1.6;}
.highlight-name{color:var(--color-titulos,#fff);font-weight:700;}
.modal-buttons{display:flex;gap:10px;}
.btn-modal{min-height:42px;flex:1;padding:0 16px;border-radius:10px;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:650;cursor:pointer;transition:background .18s ease,box-shadow .18s ease,transform .18s ease;}
.btn-modal.secondary{border:1px solid var(--line);background:color-mix(in srgb,var(--color-texto-general,#fff) 4%,transparent);color:var(--color-texto-general,#d1d5db);}
.btn-modal.secondary:hover{background:color-mix(in srgb,var(--color-texto-general,#fff) 8%,transparent);transform:translateY(-1px);}
.btn-modal.danger{border:1px solid rgba(239,68,68,.75);background:#dc2626;color:#fff;}
.btn-modal.danger:hover{background:#ef4444;box-shadow:0 6px 16px rgba(239,68,68,.2);transform:translateY(-1px);}
:deep(.notification-container),:deep(.toast-container){width:calc(100% - 32px)!important;max-width:480px!important;box-sizing:border-box!important;left:50%!important;right:auto!important;margin:0 auto!important;transform:translateX(-50%)!important;}
.pager{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px;}
.pager-btn{width:40px;height:40px;display:grid;place-items:center;padding:0;border:1px solid var(--line);border-radius:var(--radius-small,10px);background:var(--card-bg,#121416);color:var(--color-texto-general,#e5e7eb);cursor:pointer;transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease;}
.pager-btn:hover:not(:disabled){border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--color-titulos,#fff);transform:translateY(-1px);}
.pager-btn:disabled{opacity:.35;cursor:not-allowed;}
.pager-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
.pager-info{min-width:64px;color:var(--muted);font-size:.8rem;font-weight:600;text-align:center;}
.pager-info b{color:var(--color-titulos,#fff);font-weight:700;}
.pop-enter-active,.pop-leave-active{transition:opacity .2s ease;}
.pop-enter-from,.pop-leave-to{opacity:0;}
.search-input:focus-visible,.status-select:focus-visible,.btn-bulk:focus-visible,.icon-btn:focus-visible,.action-chip:focus-visible,.btn-modal:focus-visible,.search-clear:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
@media (max-width:1250px){.main-content{padding:30px 24px 48px;}.header-section{align-items:flex-start;flex-direction:column;gap:17px;}.actions-bar{width:100%;justify-content:flex-start;}.search-wrapper{flex:1;min-width:220px;}.search-input,.search-input:focus{width:100%;}}
@media (max-width:900px){.desktop-only{display:none!important;}.mobile-only{display:block!important;}.main-content{width:100%;max-width:100%;padding:20px 14px 36px;overflow-x:hidden;}.header-section{width:100%;align-items:stretch;margin-bottom:16px;}.title-wrapper{width:100%;min-width:0;}.main-title{font-size:1.85rem;}.main-subtitle{max-width:100%;font-size:.76rem;}.actions-bar{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}.search-wrapper{width:100%;min-width:0;grid-column:1 / -1;grid-row:1;}.search-input,.search-input:focus{width:100%;}.select-wrapper{width:100%;min-width:0;}.status-select{width:100%;min-width:0;text-overflow:ellipsis;}.btn-bulk{width:100%;grid-column:1 / -1;}.stats-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-bottom:14px;}.stat-card{padding:12px 14px;}.stat-value{font-size:1.2rem;}.user-card{position:relative;width:100%;overflow:hidden;margin-bottom:11px;padding:16px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card-bg);box-shadow:0 9px 28px rgba(0,0,0,.17);}.user-card::before{content:'';position:absolute;top:0;bottom:0;left:0;width:3px;background:var(--accent);}.user-card.card-debt-pending::before{background:#fbbf24;}.user-card.card-debt-overdue::before{background:#f87171;}.user-card.card-debt-default::before{background:#34d399;}.card-top-section{display:flex;align-items:flex-start;gap:12px;margin-bottom:13px;}.user-card .avatar-small{width:44px;height:44px;border-radius:12px;font-size:.78rem;}.card-user-titles{min-width:0;display:flex;flex:1;flex-direction:column;align-items:flex-start;gap:7px;}.name-text{width:100%;overflow:hidden;color:var(--color-titulos,#fff);font-size:.88rem;font-weight:600;line-height:1.3;text-overflow:ellipsis;white-space:nowrap;}.card-meta{display:grid;gap:8px;margin-bottom:13px;padding:11px 12px;border:1px solid var(--line-soft);border-radius:11px;background:color-mix(in srgb,var(--color-texto-general,#fff) 2%,transparent);font-size:.75rem;}.email-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.card-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding-top:12px;border-top:1px solid var(--line-soft);}.action-chip{min-width:0;min-height:40px;display:flex;align-items:center;justify-content:center;gap:7px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;font-family:'Inter',sans-serif;font-size:.75rem;font-weight:600;cursor:pointer;transition:background .18s ease,border-color .18s ease,color .18s ease,transform .18s ease;}.action-chip svg{flex-shrink:0;}.btn-email-chip{color:#60a5fa;border-color:rgba(59,130,246,.2);background:rgba(59,130,246,.06);}.btn-email-chip:hover{color:#93c5fd;border-color:rgba(59,130,246,.4);background:rgba(59,130,246,.12);transform:translateY(-1px);}.btn-whatsapp-chip{color:#4ade80;border-color:rgba(34,197,94,.2);background:rgba(34,197,94,.06);}.btn-whatsapp-chip:hover{color:#86efac;border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.11);transform:translateY(-1px);}.empty-state-mobile{min-height:240px;margin-top:8px;border:1px dashed var(--line);border-radius:var(--radius);background:var(--card-bg);}}
@media (max-width:560px){.main-content{padding:17px 11px 30px;}.main-title{font-size:1.7rem;}.actions-bar{grid-template-columns:1fr;}.search-wrapper,.select-wrapper,.btn-bulk{grid-column:1;}.search-wrapper{grid-row:auto;}.user-card{padding:15px;}}
@media (max-width:380px){.main-content{padding-left:9px;padding-right:9px;}.main-title{font-size:1.55rem;}.stat-value{font-size:1.05rem;}.card-actions{grid-template-columns:1fr;}}
@media (prefers-reduced-motion:reduce){.search-input,.status-select,.btn-bulk,.user-table tbody tr,.icon-btn,.action-chip,.btn-modal,.pop-enter-active,.pop-leave-active{transition:none!important;}}
</style>