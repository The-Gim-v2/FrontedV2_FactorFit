<script setup>
import { ref, onMounted } from 'vue'

const clave = ref('')
const copiado = ref(false)
const fallo = ref(false)

onMounted(() => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  clave.value = params.get('k') || ''
  // Quita la contraseña de la URL visible
  history.replaceState(null, '', window.location.pathname)
})

async function copiar() {
  if (!clave.value) return
  try {
    await navigator.clipboard.writeText(clave.value)
    copiado.value = true
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
      copiado.value = true
    } catch (e2) {
      fallo.value = true
    }
  }
}
</script>

<template>
  <main class="wrap">
    <section class="card">
      <p class="eyebrow">SEGURIDAD DE TU CUENTA</p>
      <h1>Tu nueva contraseña</h1>

      <template v-if="clave">
        <div class="clave">{{ clave }}</div>

        <button class="btn" :class="{ ok: copiado }" @click="copiar">
          <svg v-if="!copiado" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          {{ copiado ? 'Contraseña copiada' : 'Copiar contraseña' }}
        </button>

        <p v-if="fallo" class="aviso">No se pudo copiar automáticamente. Selecciona la contraseña y cópiala manualmente.</p>
        <router-link class="link" to="/login">Ir a iniciar sesión</router-link>
      </template>

      <template v-else>
        <p class="aviso">Este enlace ya no contiene la contraseña. Vuelve a abrir el botón desde el correo, o solicita una nueva.</p>
        <router-link class="link" to="/login">Ir a iniciar sesión</router-link>
      </template>
    </section>
  </main>
</template>

<style scoped>
.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#efecf4;font-family:'Segoe UI',Helvetica,Arial,sans-serif}
.card{width:100%;max-width:440px;background:#fff;border-radius:20px;padding:36px 28px;text-align:center;box-shadow:0 8px 30px rgba(36,32,54,.12)}
.eyebrow{margin:0 0 8px;color:#a04a68;font-size:11px;letter-spacing:3px;font-weight:700}
h1{margin:0 0 24px;color:#242036;font-size:24px}
.clave{background:#fff5f8;border:2px dashed #d4506e;border-radius:12px;padding:18px 12px;font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#242036;word-break:break-all;user-select:all}
.btn{display:inline-flex;align-items:center;gap:10px;margin-top:20px;padding:14px 28px;border:0;border-radius:12px;background:#d4506e;color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s}
.btn.ok{background:#2f9e6b}
.aviso{margin:18px 0 0;color:#625b6e;font-size:14px;line-height:1.6}
.link{display:inline-block;margin-top:22px;color:#a04a68;font-size:14px;font-weight:700}
</style>