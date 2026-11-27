<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const sedeId = Number(route.query.sede || 0);

const estado = ref<'cargando' | 'redirigiendo' | 'ok' | 'duplicado' | 'aviso' | 'error'>('cargando');
const titulo = ref('Verificando asistencia...');
const mensaje = ref('Un momento por favor.');
const sedeNombre = ref('');
const gymNombre = ref('Factor Fit');
const estatusMembresia = ref('');

const cargarInfoSede = async () => {
  if (!Number.isInteger(sedeId) || sedeId <= 0) return;
  try {
    const res = await fetch(`${API}/api/public/sucursales`, { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => []);
    const lista = Array.isArray(data) ? data : (data?.data || []);
    const encontrada = lista.find((s: any) => Number(s.ID_Sede) === sedeId);
    if (encontrada) {
      sedeNombre.value = encontrada.Nombre_Sede || '';
      gymNombre.value = encontrada.Nombre_Gym || 'Factor Fit';
    }
  } catch { /* No bloquea el flujo */ }
};

const irAlLogin = () => {
  router.replace({
    name: 'login',
    query: { redirect: route.fullPath },
  });
};

onMounted(async () => {
  if (!Number.isInteger(sedeId) || sedeId <= 0) {
    estado.value = 'error';
    titulo.value = 'Código QR inválido';
    mensaje.value = 'Este código no contiene una sucursal válida. Pide ayuda en recepción.';
    return;
  }

  await cargarInfoSede();

  const token = (sessionStorage.getItem('auth_token') || '').replace(/^Bearer\s+/i, '');
  const role = (sessionStorage.getItem('user_role') || '').trim();

  // Si no ha iniciado sesión como cliente (Member), avisa y redirige al login conservando la sede.
  if (!token || role !== 'Member') {
    estado.value = 'redirigiendo';
    titulo.value = 'Asistencia escaneada';
    mensaje.value = `Detectamos tu llegada en ${sedeNombre.value || `Sede ${sedeId}`}. Redirigiendo al inicio de sesión para registrar tu entrada...`;
    window.setTimeout(irAlLogin, 1600);
    return;
  }

  try {
    const res = await fetch(`${API}/api/member/asistencia-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sede_id: sedeId }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      estado.value = 'redirigiendo';
      titulo.value = 'Sesión expirada';
      mensaje.value = 'Inicia sesión nuevamente para registrar tu asistencia...';
      window.setTimeout(irAlLogin, 1500);
      return;
    }

    if (!res.ok) {
      throw new Error(data?.message || `Error HTTP ${res.status}`);
    }

    sedeNombre.value = data.sede_nombre || sedeNombre.value;
    gymNombre.value = data.gimnasio || gymNombre.value;
    estatusMembresia.value = data.estatus || '';

    if (data.duplicado) {
      estado.value = 'duplicado';
      titulo.value = 'Asistencia ya registrada';
      mensaje.value = data.mensaje || 'Ya registraste tu asistencia hoy.';
    } else if (data.permitido) {
      estado.value = 'ok';
      titulo.value = '¡Asistencia registrada!';
      mensaje.value = `Bienvenido a ${sedeNombre.value || gymNombre.value}. ¡Buen entrenamiento!`;
    } else {
      estado.value = 'aviso';
      titulo.value = 'Asistencia con aviso de pago';
      mensaje.value = data.aviso || 'Tu membresía presenta un pago pendiente. Acude a recepción.';
    }
  } catch (e) {
    estado.value = 'error';
    titulo.value = 'No se pudo registrar';
    mensaje.value = e instanceof Error ? e.message : 'Intenta escanear nuevamente o acude a recepción.';
  }
});
</script>

<template>
  <main class="qr-checkin-page">
    <section class="qr-card" :class="estado">
      <span class="kicker">{{ gymNombre }} · {{ sedeNombre || `Sede ${sedeId}` }}</span>

      <div class="icon-wrap" aria-hidden="true">
        <span v-if="estado === 'cargando' || estado === 'redirigiendo'" class="loader"></span>
        <svg v-else-if="estado === 'ok'" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
        <svg v-else-if="estado === 'duplicado'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
      </div>

      <h1>{{ titulo }}</h1>
      <p>{{ mensaje }}</p>

      <span v-if="estatusMembresia" class="status-tag">Estatus: {{ estatusMembresia }}</span>

      <div class="actions">
        <button v-if="estado === 'redirigiendo'" type="button" class="btn-primary" @click="irAlLogin">
          Ir a iniciar sesión ahora
        </button>
        <router-link v-else-if="estado !== 'cargando'" :to="{ name: 'Member-dashboard' }" class="btn-primary">
          Ir a mi panel
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.qr-checkin-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: radial-gradient(circle at 20% 10%, rgba(212, 80, 110, 0.16), transparent 60%), #12121c;
  color: #f3eee8;
  font-family: 'Inter', system-ui, sans-serif;
}
.qr-card {
  width: min(440px, 100%);
  padding: 34px 26px;
  text-align: center;
  background: rgba(24, 25, 40, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.5);
}
.kicker {
  display: inline-block;
  margin-bottom: 18px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(233, 176, 138, 0.12);
  color: #e9b08a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.icon-wrap {
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(212, 80, 110, 0.14);
  color: #e9b08a;
}
.qr-card.ok .icon-wrap { background: rgba(52, 211, 153, 0.14); color: #34d399; }
.qr-card.duplicado .icon-wrap { background: rgba(96, 165, 250, 0.14); color: #60a5fa; }
.qr-card.aviso .icon-wrap { background: rgba(251, 191, 36, 0.14); color: #fbbf24; }
.qr-card.error .icon-wrap { background: rgba(248, 113, 113, 0.14); color: #f87171; }
.icon-wrap svg {
  width: 32px;
  height: 32px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.loader {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #e9b08a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
h1 { margin: 0 0 10px; font-size: 24px; font-weight: 800; }
p { margin: 0; color: #bdb9c8; font-size: 14px; line-height: 1.6; }
.status-tag {
  display: inline-block;
  margin-top: 14px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  font-size: 12px;
  font-weight: 600;
}
.actions { margin-top: 24px; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #d4506e, #cf4a77);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}
</style>