<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const clave = ref('')
const copiado = ref(false)
const fallo = ref(false)
let timer = null

onMounted(() => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  clave.value = params.get('k') || ''
  // Quita la contraseña de la URL visible
  history.replaceState(null, '', window.location.pathname)
})

onBeforeUnmount(() => clearTimeout(timer))

function marcarCopiado() {
  copiado.value = true
  fallo.value = false
  clearTimeout(timer)
  timer = setTimeout(() => (copiado.value = false), 3000)
}

async function copiar() {
  if (!clave.value) return
  try {
    await navigator.clipboard.writeText(clave.value)
    marcarCopiado()
  } catch (e) {
    try {
      const ta = document.createElement('textarea')
      ta.value = clave.value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      marcarCopiado()
    } catch (e2) {
      fallo.value = true
    }
  }
}
</script>

<template>
  <main class="cc-wrap">
    <section class="cc-card">
      <header class="cc-head">
        <div class="cc-badge">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <p class="cc-eyebrow">SEGURIDAD DE TU CUENTA</p>
        <h1 class="cc-title">Tu nueva contraseña</h1>
      </header>

      <div class="cc-body">
        <template v-if="clave">
          <p class="cc-text">Cópiala y úsala para iniciar sesión. Cuando puedas, cámbiala desde tu perfil.</p>

          <div class="cc-clave">{{ clave }}</div>

          <button type="button" class="cc-btn" :class="{ 'cc-ok': copiado }" @click="copiar">
            <svg v-if="!copiado" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span>{{ copiado ? 'Contraseña copiada' : 'Copiar contraseña' }}</span>
          </button>

          <p v-if="fallo" class="cc-error">No se pudo copiar automáticamente. Mantén presionada la contraseña para seleccionarla y copiarla.</p>

          <router-link class="cc-btn cc-sec" to="/login">
            <span>Ir a iniciar sesión</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </router-link>

          <div class="cc-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>No compartas esta contraseña con nadie. Si no solicitaste este cambio, comunícate con soporte.</span>
          </div>
        </template>

        <template v-else>
          <p class="cc-text">Este enlace ya no contiene la contraseña. Vuelve a abrir el botón desde el correo o solicita una nueva.</p>
          <router-link class="cc-btn cc-sec" to="/login">
            <span>Ir a iniciar sesión</span>
          </router-link>
        </template>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Cubre toda la pantalla sin depender de estilos globales (#app, body, etc.) */
.cc-wrap {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
  background: #efecf4;
  font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
}
.cc-wrap *, .cc-wrap *::before, .cc-wrap *::after { box-sizing: border-box; }

.cc-card {
  width: 100%;
  max-width: 460px;
  margin: auto;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(36, 32, 54, .16);
}

.cc-head {
  padding: 34px 24px 28px;
  text-align: center;
  background: linear-gradient(135deg, #242036 0%, #3a2f5b 100%);
  border-bottom: 5px solid #d4506e;
}
.cc-badge {
  width: 56px; height: 56px;
  margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 16px;
  background: #d4506e;
  color: #fff;
}
.cc-eyebrow { margin: 0 0 8px; color: #f2b8c8; font-size: 11px; letter-spacing: 3px; font-weight: 700; }
.cc-title { margin: 0; color: #fff; font-size: 26px; line-height: 1.2; font-weight: 800; }

.cc-body { padding: 28px 26px 30px; }
.cc-text { margin: 0 0 20px; color: #625b6e; font-size: 15px; line-height: 1.6; text-align: center; }

.cc-clave {
  padding: 20px 14px;
  background: #fff5f8;
  border: 2px dashed #d4506e;
  border-radius: 14px;
  text-align: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #242036;
  word-break: break-all;
  user-select: all;
  -webkit-user-select: all;
}

.cc-btn {
  width: 100%;
  margin-top: 14px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #d4506e;
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background .2s, transform .1s;
}
.cc-btn:hover { background: #bd4262; }
.cc-btn:active { transform: scale(.98); }
.cc-btn.cc-ok, .cc-btn.cc-ok:hover { background: #2f9e6b; }

.cc-sec { background: #fff; color: #a04a68; border-color: #f0c9d4; }
.cc-sec:hover { background: #fff5f8; }

.cc-error { margin: 12px 0 0; color: #b3261e; font-size: 13px; line-height: 1.5; text-align: center; }

.cc-note {
  margin-top: 22px;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #fff9e8;
  border-left: 4px solid #f0b429;
  border-radius: 8px;
  color: #7a6a3a;
  font-size: 12.5px;
  line-height: 1.6;
}
.cc-note svg { flex: 0 0 18px; margin-top: 1px; }
</style>