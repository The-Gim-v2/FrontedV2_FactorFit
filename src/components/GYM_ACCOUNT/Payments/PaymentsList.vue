<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue'
import CorreoMasivo from '../Componets/Bulk-Email.vue'
import NotificationSystem from '../../Modals/NotificationSystem.vue'
import { traducciones } from '../i18n.js'

const router = useRouter()
const toastRef = ref(null)
const activeModal = ref(null)
const idioma = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es')
const t = key => traducciones[idioma.value]?.[key] || traducciones.es?.[key] || key
const usuarios = ref([])
const cargando = ref(false)
const error = ref('')
const busqueda = ref('')
const membresia = ref('')
const estatus = ref('')
const pagina = ref(1)
const ancho = ref(window.innerWidth)
const movil = computed(() => ancho.value <= 900)
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '')
const tamanoPagina = 40
let solicitud = 0

function tokenSesion() {
  for (const storage of [sessionStorage, localStorage]) {
    for (const clave of ['auth_token', 'token', 'access_token', 'gym_token']) {
      const valor = storage.getItem(clave)
      if (valor) return valor.replace(/^Bearer\s+/i, '')
    }
  }
  return ''
}
function sedeActual() {
  for (const storage of [sessionStorage, localStorage]) {
    for (const clave of ['selected_sede_id', 'sede_id', 'ID_Sede']) {
      const raw = storage.getItem(clave)
      if (!raw) continue
      let valor = raw
      try {
        const obj = JSON.parse(raw)
        valor = typeof obj === 'object' && obj !== null ? (obj.ID_Sede ?? obj.sede_id ?? obj.id) : obj
      } catch { /* Identificador numérico plano */ }
      const id = Number(valor)
      if (Number.isInteger(id) && id > 0) return id
    }
  }
  return null
}
function fecha(valor) {
  if (!valor) return '—'
  const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(valor)
}
async function cargarClientes() {
  const idSolicitud = ++solicitud
  cargando.value = true
  error.value = ''
  usuarios.value = []
  try {
    const token = tokenSesion()
    const sede = sedeActual()
    if (!token) throw new Error('No hay una sesión válida.')
    if (!sede) throw new Error('Selecciona una sucursal.')
    const res = await fetch(`${API}/api/gym/clientes?sede_id=${sede}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(json?.message || `Error HTTP ${res.status}`)
    const filas = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])
    if (idSolicitud !== solicitud) return
    usuarios.value = filas.filter(x => x.Estatus !== 'Eliminado temporal').map(x => ({
      id: Number(x.ID_Inscripto),
      nombre: [x.Nombre, x.Apellido_P, x.Apellido_M].filter(Boolean).join(' '),
      correo: x.Correo_Electronico || '—',
      telefono: x.Celular || '—',
      vence: fecha(x.Fecha_Vencimiento),
      estado: x.Estatus || 'Pendiente',
      plan: x.Nombre_Paquete || '—',
      foto: x.foto_url || null
    }))
  } catch (e) {
    if (idSolicitud !== solicitud) return
    error.value = e.message || 'No se pudo cargar la lista.'
    toastRef.value?.notify(error.value, 'error')
  } finally {
    if (idSolicitud === solicitud) cargando.value = false
  }
}
const planes = computed(() => [...new Set(usuarios.value.map(x => x.plan))].sort())
const filtrados = computed(() => usuarios.value.filter(x => {
  const q = busqueda.value.trim().toLocaleLowerCase()
  return (!membresia.value || x.plan === membresia.value)
    && (!estatus.value || x.estado === estatus.value)
    && (!q || [x.nombre, x.correo, x.telefono, x.vence, x.estado, x.plan, x.id]
      .some(v => String(v).toLocaleLowerCase().includes(q)))
}))
const paginas = computed(() => Math.max(1, Math.ceil(filtrados.value.length / tamanoPagina)))
const visibles = computed(() => filtrados.value.slice((pagina.value - 1) * tamanoPagina, pagina.value * tamanoPagina))
watch([busqueda, membresia, estatus], () => { pagina.value = 1 })
watch(paginas, n => { if (pagina.value > n) pagina.value = n })
function iniciales(nombre) {
  const p = nombre.trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase()
}
function colorAvatar(id) {
  const colores = ['#7e22ce', '#ea580c', '#db2777', '#2563eb', '#059669', '#9333ea']
  return colores[Math.abs(id) % colores.length]
}
function claseEstado(valor) {
  return ({ Activo: 'activo', Pendiente: 'pendiente', Inactivo: 'inactivo', 'Próximo a vencer': 'proximo' })[valor] || 'neutro'
}
const cobrar = id => router.push(`/GYM_ACCOUNT/pay/${id}`)
const editar = id => router.push(`/GYM_ACCOUNT/editar-usuario/${id}`)
const alRedimensionar = () => { ancho.value = window.innerWidth }
const alCambiarIdioma = e => { if (e.detail?.idioma) idioma.value = e.detail.idioma }
const alCambiarSede = () => { pagina.value = 1; cargarClientes() }
const alEscapar = e => { if (e.key === 'Escape') activeModal.value = null }
onMounted(() => {
  window.addEventListener('resize', alRedimensionar)
  window.addEventListener('idioma-changed', alCambiarIdioma)
  window.addEventListener('factorfit:branch-changed', alCambiarSede)
  window.addEventListener('keydown', alEscapar)
  cargarClientes()
})
onUnmounted(() => {
  solicitud++
  window.removeEventListener('resize', alRedimensionar)
  window.removeEventListener('idioma-changed', alCambiarIdioma)
  window.removeEventListener('factorfit:branch-changed', alCambiarSede)
  window.removeEventListener('keydown', alEscapar)
})
</script>

<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <header class="header-section">
        <div>
          <h1 class="main-title">{{ t('paymentsTitle') }}</h1>
          <p class="main-subtitle">{{ t('paymentsSubtitle') }}</p>
          <p class="result-count">{{ filtrados.length }} {{ filtrados.length === 1 ? 'resultado' : 'resultados' }}</p>
        </div>
        <div id="tutorial-step-0" class="actions-bar">
          <select v-model="membresia" class="status-select" aria-label="Filtrar membresía">
            <option value="">Todas las membresías</option>
            <option v-for="plan in planes" :key="plan" :value="plan">{{ plan }}</option>
          </select>
          <select v-model="estatus" class="status-select" aria-label="Filtrar estatus">
            <option value="">Todos los estados</option>
            <option v-for="estado in ['Activo', 'Pendiente', 'Inactivo', 'Próximo a vencer']" :key="estado">{{ estado }}</option>
          </select>
          <button class="btn-bulk" type="button" @click="activeModal = 'enviomasivo'">✉ {{ t('bulkEmailBtn') }}</button>
          <input v-model="busqueda" class="search-input" type="search" :placeholder="t('searchUserPlaceholder')" aria-label="Buscar clientes" />
        </div>
      </header>

      <p v-if="cargando" class="mensaje">Cargando clientes...</p>
      <p v-else-if="error" class="mensaje error">{{ error }} <button @click="cargarClientes">Reintentar</button></p>
      <template v-else>
        <div v-if="!movil" id="tutorial-step-1" class="table-container">
          <table class="user-table">
            <thead><tr><th>Foto</th><th>Nombre</th><th>Correo</th><th>Vencimiento</th><th>Estatus</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="(user, i) in visibles" :key="user.id">
                <td><div class="avatar-small" :style="{ background: colorAvatar(user.id) }"><img v-if="user.foto" :src="user.foto" alt="Foto del cliente" @error="user.foto = null" /><span v-else>{{ iniciales(user.nombre) }}</span></div></td>
                <td class="text-bold">{{ user.nombre }}</td>
                <td class="text-muted">{{ user.correo }}</td>
                <td class="text-muted">{{ user.vence }}</td>
                <td><span class="status-badge" :class="claseEstado(user.estado)">{{ user.estado }}</span></td>
                <td class="actions-cell" :id="i === 0 ? 'tutorial-step-2' : null">
                  <button class="icon-btn" title="Cobrar" :aria-label="`Cobrar a ${user.nombre}`" @click="cobrar(user.id)">$</button>
                  <button class="icon-btn" title="Editar" :aria-label="`Editar a ${user.nombre}`" @click="editar(user.id)">✎</button>
                </td>
              </tr>
              <tr v-if="!visibles.length"><td colspan="6" class="mensaje">No se encontraron clientes.</td></tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mobile-list" id="tutorial-step-1">
          <article v-for="user in visibles" :key="user.id" class="user-card">
            <div class="card-top-section">
              <div class="avatar-small" :style="{ background: colorAvatar(user.id) }"><img v-if="user.foto" :src="user.foto" alt="Foto del cliente" @error="user.foto = null" /><span v-else>{{ iniciales(user.nombre) }}</span></div>
              <div class="card-user-titles"><strong>{{ user.nombre }}</strong><div class="badges-row"><span class="status-badge" :class="claseEstado(user.estado)">{{ user.estado }}</span><span class="membership-badge">{{ user.plan }}</span></div></div>
            </div>
            <div class="card-meta"><p>{{ user.correo }}</p><p>Vence: {{ user.vence }}</p><p>{{ user.telefono }}</p></div>
            <div class="card-actions"><button class="action-chip" @click="cobrar(user.id)">Cobrar</button><button class="action-chip" @click="editar(user.id)">Editar</button></div>
          </article>
          <p v-if="!visibles.length" class="mensaje">No se encontraron clientes.</p>
        </div>
        <nav v-if="paginas > 1" class="pager" aria-label="Paginación">
          <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
          <span>{{ pagina }} / {{ paginas }}</span>
          <button :disabled="pagina === paginas" @click="pagina++">Siguiente</button>
        </nav>
      </template>
    </main>
    <div v-if="activeModal === 'enviomasivo'" class="modal-wrapper" @click.self="activeModal = null">
      <CorreoMasivo @close="activeModal = null" />
    </div>
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
.main-content{padding:28px;max-width:1500px;margin:auto;color:var(--text-primary,#e5e7eb)}
.header-section{display:flex;align-items:end;justify-content:space-between;flex-wrap:wrap;gap:22px;margin-bottom:25px}
.main-title{font-size:clamp(26px,3vw,36px);font-weight:800;margin:0}
.main-subtitle,.result-count,.text-muted{color:var(--text-secondary,#94a3b8)}
.main-subtitle{margin:6px 0}.result-count{font-size:13px;margin:5px 0}
.actions-bar{display:flex;align-items:center;flex-wrap:wrap;gap:10px}
.status-select,.search-input,.btn-bulk{border:1px solid #374151;border-radius:10px;background:#1f2937;color:#f8fafc;padding:11px 13px;font:inherit}
.search-input{min-width:210px}.btn-bulk{background:#7c3aed;border-color:#7c3aed;cursor:pointer;font-weight:600}
.table-container{overflow:auto;border:1px solid #374151;border-radius:15px;background:#111827}
.user-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
.user-table th,.user-table td{padding:15px 17px;border-bottom:1px solid #293445}
.user-table th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#a5b4c9;background:#1f2937}
.user-table tr:last-child td{border-bottom:0}.user-table tbody tr:hover{background:#1c283a}
.text-bold{font-weight:650}.avatar-small{width:42px;height:42px;flex:none;border-radius:50%;display:grid;place-items:center;color:white;font-weight:800;overflow:hidden}
.avatar-small img{width:100%;height:100%;object-fit:cover}.status-badge{display:inline-block;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:700}
.activo{background:#064e3b;color:#a7f3d0}.pendiente{background:#78350f;color:#fde68a}.inactivo{background:#7f1d1d;color:#fecaca}.proximo{background:#713f12;color:#fef08a}.neutro{background:#334155;color:#e2e8f0}
.actions-cell{display:flex;gap:8px}.icon-btn,.action-chip,.pager button{border:1px solid #475569;border-radius:9px;background:#243247;color:white;padding:9px 13px;cursor:pointer}
.icon-btn:hover,.action-chip:hover,.pager button:not(:disabled):hover{background:#7c3aed}.icon-btn{font-size:19px;font-weight:700}
.mobile-list{display:grid;gap:14px}.user-card{border:1px solid #374151;border-radius:15px;background:#111827;padding:17px}
.card-top-section{display:flex;align-items:center;gap:12px}.card-user-titles{min-width:0}.card-user-titles strong{overflow-wrap:anywhere}
.badges-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.membership-badge{padding:6px 10px;border-radius:20px;background:#312e81;color:#c7d2fe;font-size:12px}
.card-meta{color:#cbd5e1;font-size:13px;margin:14px 0}.card-meta p{margin:7px 0;overflow-wrap:anywhere}.card-actions{display:flex;gap:10px}.action-chip{flex:1}
.mensaje{text-align:center;padding:28px;color:#94a3b8}.error{color:#fca5a5}.error button{margin-left:10px;cursor:pointer}
.pager{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:22px}.pager button:disabled{opacity:.4;cursor:not-allowed}
.modal-wrapper{position:fixed;inset:0;z-index:9999;background:#000a;display:grid;place-items:center;padding:15px}
@media(max-width:900px){.main-content{padding:17px}.header-section{align-items:stretch}.actions-bar{width:100%}.status-select,.search-input{flex:1;min-width:130px}.btn-bulk{flex:1}}
</style>
