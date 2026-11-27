<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const sedeId = Number(route.query.sede || 0);

const estado = ref<'cargando' | 'login' | 'ok' | 'duplicado' | 'aviso' | 'error'>('cargando');
const titulo = ref('Verificando asistencia...');
const mensaje = ref('Un momento por favor.');
const sedeNombre = ref('');
const gymNombre = ref('Factor Fit');
const estatusMembresia = ref('');

// Mini-login cuando la cámara abre una pestaña nueva sin sessionStorage
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loginLoading = ref(false);
const loginError = ref('');

const onIdentifierInput = () => {
  const value = email.value.trim();
  if (!value.includes('@') && /^[0-9+()\s-]+$/.test(value)) {
    let digits = value.replace(/\D/g, '');
    if (value.startsWith('+52') && digits.startsWith('52')) digits = digits.slice(2);
    email.value = digits.slice(0, 10);
  }
};

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

const registrarAsistencia = async (token: string) => {
  estado.value = 'cargando';
  titulo.value = 'Registrando asistencia...';
  mensaje.value = `Confirmando tu entrada en ${sedeNombre.value || `Sede ${sedeId}`}.`;

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
      estado.value = 'login';
      titulo.value = 'Inicia sesión para registrar';
      mensaje.value = `Escaneaste el QR de ${sedeNombre.value || `Sede ${sedeId}`}. Ingresa tus datos de miembro para marcar tu entrada.`;
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
};

const iniciarYRegistrar = async () => {
  if (loginLoading.value) return;
  loginError.value = '';

  const identifier = email.value.trim();
  if (!identifier.includes('@') && !/^[0-9]{10}$/.test(identifier)) {
    loginError.value = 'Escribe los 10 dígitos de tu celular, sin +52, o tu correo.';
    return;
  }
  if (identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    loginError.value = 'Escribe un correo electrónico válido.';
    return;
  }

  loginLoading.value = true;
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: identifier.includes('@') ? identifier.toLowerCase() : identifier,
        password: password.value,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      loginError.value = data?.message || 'Correo, celular o contraseña incorrectos.';
      return;
    }

    const role = String(data.rol || '').trim();
    if (role !== 'Member' || !data.token) {
      loginError.value = 'Este QR es exclusivo para cuentas de atletas (miembros).';
      return;
    }

    sessionStorage.setItem('auth_token', data.token);
    sessionStorage.setItem('user_role', role);
    sessionStorage.setItem('gym_account', JSON.stringify(data.usuario || {}));
    sessionStorage.setItem('last_activity_timestamp', String(Date.now()));
    if (data.usuario?.sede_id) {
      sessionStorage.setItem('selected_sede_id', String(data.usuario.sede_id));
      localStorage.setItem('selected_sede_id', String(data.usuario.sede_id));
    }

    await registrarAsistencia(data.token);
  } catch {
    loginError.value = 'No se pudo conectar con el servidor. Intenta nuevamente.';
  } finally {
    loginLoading.value = false;
  }
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

  if (token && role === 'Member') {
    await registrarAsistencia(token);
  } else {
    estado.value = 'login';
    titulo.value = 'Registrar asistencia';
    mensaje.value = `Inicia sesión con tu cuenta de atleta para marcar tu entrada en ${sedeNombre.value || `Sede ${sedeId}`}.`;
  }
});
</script>

<template>
  <main class="qr-checkin-page">
    <section class="qr-card" :class="estado">
      <span class="kicker">{{ gymNombre }} · {{ sedeNombre || `Sede ${sedeId}` }}</span>

      <div class="icon-wrap" aria-hidden="true">
        <span v-if="estado === 'cargando'" class="loader"></span>
        <svg v-else-if="estado === 'login'" viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2" /></svg>
        <svg v-else-if="estado === 'ok'" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
        <svg v-else-if="estado === 'duplicado'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
      </div>

      <h1>{{ titulo }}</h1>
      <p>{{ mensaje }}</p>

      <!-- Formulario directo si abrió en pestaña nueva -->
      <form v-if="estado === 'login'" class="qr-login-form" @submit.prevent="iniciarYRegistrar">
        <div class="field">
          <label for="qr-email">Correo o celular (10 dígitos)</label>
          <input
            id="qr-email"
            v-model="email"
            type="text"
            autocomplete="username"
            placeholder="ejemplo@gmail.com o 4811234567"
            required
            @input="onIdentifierInput(); loginError = ''"
          />
        </div>

        <div class="field">
          <label for="qr-pass">Contraseña</label>
          <div class="pass-wrap">
            <input
              id="qr-pass"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Tu contraseña"
              required
              @input="loginError = ''"
            />
            <button type="button" class="pass-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
        </div>

        <p v-if="loginError" class="error-msg" role="alert">{{ loginError }}</p>

        <button type="submit" class="btn-primary" :disabled="loginLoading">
          {{ loginLoading ? 'Registrando asistencia...' : 'Iniciar sesión y registrar asistencia' }}
        </button>
      </form>

      <template v-else-if="estado !== 'cargando'">
        <span v-if="estatusMembresia" class="status-tag">Estatus: {{ estatusMembresia }}</span>
        <div class="actions">
          <router-link :to="{ name: 'Member-dashboard' }" class="btn-primary">
            Ir a mi panel
          </router-link>
        </div>
      </template>
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
  padding: 32px 24px;
  text-align: center;
  background: rgba(24, 25, 40, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.5);
}
.kicker {
  display: inline-block;
  margin-bottom: 16px;
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
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(212, 80, 110, 0.14);
  color: #e9b08a;
}
.qr-card.ok .icon-wrap { background: rgba(52, 211, 153, 0.14); color: #34d399; }
.qr-card.duplicado .icon-wrap { background: rgba(96, 165, 250, 0.14); color: #60a5fa; }
.qr-card.aviso .icon-wrap { background: rgba(251, 191, 36, 0.14); color: #fbbf24; }
.qr-card.error .icon-wrap { background: rgba(248, 113, 113, 0.14); color: #f87171; }
.icon-wrap svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.loader {
  width: 26px;
  height: 26px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #e9b08a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
h1 { margin: 0 0 8px; font-size: 23px; font-weight: 800; }
p { margin: 0; color: #bdb9c8; font-size: 13.5px; line-height: 1.55; }

.qr-login-form {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { color: #e6e0e8; font-size: 12px; font-weight: 600; }
.field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 16px;
  outline: none;
}
.field input:focus { border-color: #d4506e; box-shadow: 0 0 0 3px rgba(212, 80, 110, 0.2); }
.pass-wrap { position: relative; }
.pass-wrap input { padding-right: 68px; }
.pass-toggle {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: #e9b08a;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.error-msg {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  background: rgba(248, 113, 113, 0.1);
  color: #fca5a5;
  font-size: 12.5px;
  text-align: center;
}
.status-tag {
  display: inline-block;
  margin-top: 14px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  font-size: 12px;
  font-weight: 600;
}
.actions { margin-top: 22px; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 50px;
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
.btn-primary:disabled { opacity: 0.6; cursor: wait; }
</style>