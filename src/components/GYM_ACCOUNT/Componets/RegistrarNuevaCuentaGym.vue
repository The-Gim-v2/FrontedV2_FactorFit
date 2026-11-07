<script setup lang="ts">
import { reactive, ref, computed } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', value: { ID_Gym: number; ID_Sede: number }): void;
}>();

const idioma = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const en = computed(() => idioma.value === 'en');
const tx = (es: string, english: string) => (en.value ? english : es);

const form = reactive<{
  nombre: string;
  propietario: string;
  email: string;
  password: string;
  password_confirmation: string;
  sede: string;
  entidad: string;
  municipio: string;
  precio_semanal: number | '';
  precio_mensual: number | '';
}>({
  nombre: '',
  propietario: '',
  email: '',
  password: '',
  password_confirmation: '',
  sede: '',
  entidad: '',
  municipio: '',
  precio_semanal: '',
  precio_mensual: ''
});

const saving = ref(false);
const error = ref('');
const success = ref('');
const showPassword = ref(false);

const API = String(import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '');

/* ---------- Fortaleza de la contraseña (solo visual) ---------- */
const checks = computed(() => ({
  length: form.password.length >= 10,
  mixed: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password),
  number: /\d/.test(form.password),
  symbol: /[^A-Za-z0-9]/.test(form.password)
}));

const strength = computed(() => {
  if (!form.password) return 0;
  const c = checks.value;
  return [c.length, c.mixed, c.number, c.symbol].filter(Boolean).length;
});

const strengthLabel = computed(() => {
  const labels = [
    '',
    tx('Débil', 'Weak'),
    tx('Regular', 'Fair'),
    tx('Buena', 'Good'),
    tx('Excelente', 'Excellent')
  ];
  return labels[strength.value] || '';
});

const passwordsMatch = computed(
  () => form.password_confirmation.length > 0 && form.password === form.password_confirmation
);
const passwordsMismatch = computed(
  () => form.password_confirmation.length > 0 && form.password !== form.password_confirmation
);

/* ---------- Precios ---------- */
const toPrice = (value: number | ''): number => (value === '' ? NaN : Number(value));

const validPrice = (value: number | '') => {
  const n = toPrice(value);
  return Number.isFinite(n) && n > 0;
};

/* ---------- Guardar ---------- */
const save = async () => {
  if (saving.value) return;
  error.value = '';
  success.value = '';

  if (form.password.length < 10) {
    error.value = tx('La contraseña debe tener al menos 10 caracteres.', 'Password must be at least 10 characters.');
    return;
  }
  if (form.password !== form.password_confirmation) {
    error.value = tx('Las contraseñas no coinciden.', 'Passwords do not match.');
    return;
  }
  if (!validPrice(form.precio_semanal)) {
    error.value = tx('Captura un precio semanal mayor a 0.', 'Enter a weekly price greater than 0.');
    return;
  }
  if (!validPrice(form.precio_mensual)) {
    error.value = tx('Captura un precio mensual mayor a 0.', 'Enter a monthly price greater than 0.');
    return;
  }

  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
  if (!token) {
    error.value = tx('No hay una sesión activa.', 'No active session.');
    return;
  }

  saving.value = true;
  try {
    const response = await fetch(`${API}/api/gym/cuentas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}`
      },
      body: JSON.stringify({
        ...form,
        email: form.email.trim().toLowerCase(),
        precio_semanal: Number(form.precio_semanal),
        precio_mensual: Number(form.precio_mensual)
      })
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errors = Object.values(body.errors || {}).flat();
      throw new Error(String(errors[0] || body.message || `HTTP ${response.status}`));
    }

    success.value = tx('Gimnasio registrado.', 'Gym registered.');
    window.dispatchEvent(new CustomEvent('factorfit:gyms-updated', { detail: body }));
    emit('created', { ID_Gym: Number(body.ID_Gym), ID_Sede: Number(body.ID_Sede) });
    emit('close');
  } catch (e) {
    error.value = e instanceof Error ? e.message : tx('No se pudo registrar el gimnasio.', 'Could not register gym.');
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="ng">
    <form class="ng-form" @submit.prevent="save">
      <!-- AVISO -->
      <p class="ng-intro">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {{ tx(
          'Crearás una cuenta independiente de gimnasio con su primera sede. El nuevo propietario iniciará sesión con el correo y la contraseña que captures aquí.',
          'You will create an independent gym account with its first branch. The new owner will sign in with the email and password you enter here.'
        ) }}
      </p>

      <div class="ng-grid">
        <!-- ================= COLUMNA IZQUIERDA ================= -->
        <div class="ng-column">
          <!-- GIMNASIO Y PROPIETARIO -->
          <section class="ng-card">
            <h3 class="ng-card-title">{{ tx('Datos del gimnasio', 'Gym details') }}</h3>
            <p class="ng-card-sub">{{ tx('Cómo se llamará y quién será el responsable.', 'Its name and who will be in charge.') }}</p>

            <div class="ng-stack">
              <div class="ng-group">
                <label for="gym-name">{{ tx('Nombre del gimnasio', 'Gym name') }}</label>
                <div class="ng-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
                  </svg>
                  <input
                    id="gym-name"
                    v-model.trim="form.nombre"
                    required
                    minlength="2"
                    maxlength="180"
                    :placeholder="tx('Ej. Iron Fitness', 'E.g. Iron Fitness')"
                  />
                </div>
              </div>

              <div class="ng-group">
                <label for="gym-owner">{{ tx('Nombre del propietario', 'Owner name') }}</label>
                <div class="ng-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="gym-owner"
                    v-model.trim="form.propietario"
                    required
                    minlength="2"
                    maxlength="180"
                    :placeholder="tx('Ej. Carlos Ramírez', 'E.g. Carlos Ramirez')"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- PRIMERA SEDE -->
          <section class="ng-card">
            <h3 class="ng-card-title">{{ tx('Primera sede', 'First branch') }}</h3>
            <p class="ng-card-sub">{{ tx('La dirección completa se termina de configurar después.', 'You can finish the full address later.') }}</p>

            <div class="ng-stack">
              <div class="ng-group">
                <label for="gym-branch">{{ tx('Nombre de la primera sede', 'First branch name') }}</label>
                <div class="ng-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    id="gym-branch"
                    v-model.trim="form.sede"
                    required
                    minlength="2"
                    maxlength="180"
                    :placeholder="tx('Ej. Sede Centro', 'E.g. Downtown branch')"
                  />
                </div>
              </div>

              <div class="ng-two">
                <div class="ng-group">
                  <label for="gym-state">{{ tx('Estado / Entidad', 'State') }}</label>
                  <div class="ng-input plain">
                    <input
                      id="gym-state"
                      v-model.trim="form.entidad"
                      required
                      maxlength="150"
                      :placeholder="tx('Ej. Tamaulipas', 'E.g. Texas')"
                    />
                  </div>
                </div>

                <div class="ng-group">
                  <label for="gym-city">{{ tx('Municipio', 'City / Municipality') }}</label>
                  <div class="ng-input plain">
                    <input
                      id="gym-city"
                      v-model.trim="form.municipio"
                      required
                      maxlength="150"
                      :placeholder="tx('Ej. Tampico', 'E.g. Austin')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- PRECIOS INICIALES -->
          <section class="ng-card">
            <h3 class="ng-card-title">{{ tx('Precios iniciales', 'Starting membership prices') }}</h3>
            <p class="ng-card-sub">
              {{ tx(
                'Se crearán automáticamente dos tarifas activas para la primera sede.',
                'Two active rates will be created automatically for the first branch.'
              ) }}
            </p>

            <div class="ng-two">
              <div class="ng-group">
                <label for="gym-weekly-price">{{ tx('Precio semanal (MXN)', 'Weekly price (MXN)') }}</label>
                <div class="ng-input plain">
                  <span class="ng-prefix">$</span>
                  <input
                    id="gym-weekly-price"
                    v-model.number="form.precio_semanal"
                    type="number"
                    inputmode="decimal"
                    min="0.01"
                    step="0.01"
                    required
                    :placeholder="tx('Ej. 150.00', 'E.g. 150.00')"
                  />
                </div>
              </div>

              <div class="ng-group">
                <label for="gym-monthly-price">{{ tx('Precio mensual (MXN)', 'Monthly price (MXN)') }}</label>
                <div class="ng-input plain">
                  <span class="ng-prefix">$</span>
                  <input
                    id="gym-monthly-price"
                    v-model.number="form.precio_mensual"
                    type="number"
                    inputmode="decimal"
                    min="0.01"
                    step="0.01"
                    required
                    :placeholder="tx('Ej. 500.00', 'E.g. 500.00')"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- ================= COLUMNA DERECHA ================= -->
        <div class="ng-column">
          <section class="ng-card">
            <h3 class="ng-card-title">{{ tx('Cuenta de acceso', 'Access account') }}</h3>
            <p class="ng-card-sub">{{ tx('Con estos datos el propietario entrará a la plataforma.', 'The owner will use these credentials to sign in.') }}</p>

            <div class="ng-stack">
              <div class="ng-group">
                <label for="gym-email">{{ tx('Correo de la nueva cuenta', 'New account email') }}</label>
                <div class="ng-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <input
                    id="gym-email"
                    v-model.trim="form.email"
                    required
                    type="email"
                    autocomplete="off"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div class="ng-group">
                <label for="gym-pass">{{ tx('Contraseña', 'Password') }}</label>
                <div class="ng-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    id="gym-pass"
                    v-model="form.password"
                    required
                    minlength="10"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    :placeholder="tx('Mínimo 10 caracteres', 'At least 10 characters')"
                  />
                  <button
                    type="button"
                    class="ng-eye"
                    :title="showPassword ? tx('Ocultar', 'Hide') : tx('Mostrar', 'Show')"
                    @click="showPassword = !showPassword"
                  >
                    <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M3 3l18 18" />
                    </svg>
                  </button>
                </div>

                <!-- Medidor -->
                <div v-if="form.password" class="ng-meter" :class="'s' + strength">
                  <div class="ng-meter-bars">
                    <span v-for="n in 4" :key="n" :class="{ on: n <= strength }"></span>
                  </div>
                  <small>{{ strengthLabel }}</small>
                </div>
              </div>

              <div class="ng-group">
                <label for="gym-pass2">{{ tx('Confirmar contraseña', 'Confirm password') }}</label>
                <div class="ng-input" :class="{ ok: passwordsMatch, bad: passwordsMismatch }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <input
                    id="gym-pass2"
                    v-model="form.password_confirmation"
                    required
                    minlength="10"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    :placeholder="tx('Repite la contraseña', 'Repeat the password')"
                  />
                </div>
                <small v-if="passwordsMismatch" class="ng-feedback bad">
                  {{ tx('Las contraseñas no coinciden.', 'Passwords do not match.') }}
                </small>
                <small v-else-if="passwordsMatch" class="ng-feedback ok">
                  {{ tx('Las contraseñas coinciden.', 'Passwords match.') }}
                </small>
              </div>

              <!-- Recomendaciones -->
              <ul class="ng-tips">
                <li :class="{ done: checks.length }">{{ tx('10 caracteres o más', '10 characters or more') }}</li>
                <li :class="{ done: checks.mixed }">{{ tx('Mayúsculas y minúsculas', 'Upper and lower case') }}</li>
                <li :class="{ done: checks.number }">{{ tx('Al menos un número', 'At least one number') }}</li>
                <li :class="{ done: checks.symbol }">{{ tx('Un símbolo (recomendado)', 'A symbol (recommended)') }}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <!-- MENSAJES -->
      <p v-if="error" class="ng-alert error" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
        </svg>
        <span>{{ error }}</span>
      </p>

      <p v-if="success" class="ng-alert success" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>{{ success }}</span>
      </p>

      <!-- ACCIONES -->
      <div class="ng-actions">
        <p class="ng-note">
          {{ tx(
            'Los precios semanal y mensual quedarán activos. Completa dirección y horarios desde la nueva cuenta. Nunca enviamos la contraseña por correo.',
            'Weekly and monthly prices will be active. Finish address and hours from the new account. We never email passwords.'
          ) }}
        </p>

        <div class="ng-buttons">
          <button type="button" class="ng-btn secondary" :disabled="saving" @click="emit('close')">
            {{ tx('Cancelar', 'Cancel') }}
          </button>
          <button type="submit" class="ng-btn primary" :disabled="saving">
            <span v-if="saving" class="ng-spinner"></span>
            <span>{{ saving ? tx('Registrando...', 'Saving...') : tx('Crear gimnasio', 'Create gym') }}</span>
            <svg v-if="!saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Oswald:wght@400;600;700&display=swap');

.ng,
.ng *,
.ng *::before,
.ng *::after { box-sizing: border-box; }

.ng {
  --accent: var(--color-highlight, #3b82f6);
  width: 100%;
  color: var(--color-texto-general, #e5e5e5);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.ng-form { display: flex; flex-direction: column; gap: 18px; }

/* =========================================================
   AVISO
   ========================================================= */
.ng-intro {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 12px 15px;
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  border-radius: var(--app-border-radius, 12px);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  color: var(--color-texto-general, #cbd5e1);
  font-size: 12.5px;
  line-height: 1.5;
}
.ng-intro svg { width: 16px; height: 16px; flex: none; margin-top: 2px; color: var(--accent); }

/* =========================================================
   LAYOUT Y TARJETAS
   ========================================================= */
.ng-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}
.ng-column { min-width: 0; display: flex; flex-direction: column; gap: 18px; }

.ng-card {
  padding: 20px 20px 22px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--app-border-radius, 18px);
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s ease;
}
.ng-card:focus-within { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.ng-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 6px;
  color: var(--color-titulos, #fff);
  font-family: 'Anton', sans-serif;
  font-size: 1.02rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ng-card-title::before {
  content: '';
  width: 4px;
  height: 17px;
  flex: none;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--color-botones, #1c4fd6), rgba(37, 99, 235, 0.25));
}
.ng-card-sub {
  margin: 0 0 18px 14px;
  color: var(--color-texto-general, #94a3b8);
  font-size: 11.5px;
  line-height: 1.4;
  opacity: 0.6;
}

.ng-stack { display: flex; flex-direction: column; gap: 16px; }
.ng-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }

/* =========================================================
   CAMPOS
   ========================================================= */
.ng-group { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.ng-group label {
  color: var(--color-texto-general, #f5f5f4);
  font: 600 0.76rem/1.3 'Oswald', sans-serif;
  letter-spacing: 0.35px;
}

.ng-input {
  position: relative;
  height: 46px;
  min-width: 0;
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-input, rgba(255, 255, 255, 0.12));
  border-radius: var(--app-border-radius, 12px);
  background: var(--bg-input, rgba(255, 255, 255, 0.03));
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.ng-input:hover { border-color: rgba(255, 255, 255, 0.22); }
.ng-input:focus-within {
  border-color: var(--accent);
  background: var(--bg-input-focus, rgba(255, 255, 255, 0.045));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
.ng-input > svg {
  width: 16px;
  height: 16px;
  flex: none;
  margin-left: 14px;
  color: var(--color-texto-general, #94a3b8);
  opacity: 0.5;
  transition: color 0.2s, opacity 0.2s;
}
.ng-input:focus-within > svg { color: var(--accent); opacity: 1; }
.ng-input input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 14px 0 11px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--color-texto-input, var(--color-texto-general, #fff));
  font: 400 0.88rem 'Inter', sans-serif;
}
.ng-input.plain input { padding-left: 14px; }
.ng-input input::placeholder { color: var(--color-texto-general, #94a3b8); opacity: 0.4; }

/* Prefijo de moneda ($) */
.ng-prefix {
  flex: none;
  margin-left: 14px;
  color: var(--accent);
  font: 700 0.9rem 'Oswald', sans-serif;
}
.ng-input.plain .ng-prefix + input { padding-left: 8px; }

/* Quita las flechas del input numérico */
.ng-input input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
.ng-input input[type='number']::-webkit-outer-spin-button,
.ng-input input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.ng-input.ok { border-color: rgba(52, 211, 153, 0.55); }
.ng-input.ok > svg { color: #34d399; opacity: 1; }
.ng-input.bad { border-color: rgba(248, 113, 113, 0.6); }
.ng-input.bad > svg { color: #f87171; opacity: 1; }

.ng-eye {
  width: 34px;
  height: 34px;
  flex: none;
  margin-right: 6px;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--color-texto-general, #94a3b8);
  border: 0;
  border-radius: 9px;
  background: transparent;
  transition: background 0.2s, color 0.2s;
}
.ng-eye:hover { color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
.ng-eye svg { width: 16px; height: 16px; }

.ng-feedback { font-size: 11.5px; font-weight: 500; }
.ng-feedback.ok { color: #34d399; }
.ng-feedback.bad { color: #f87171; }

/* ---------- Medidor de contraseña ---------- */
.ng-meter { display: flex; align-items: center; gap: 10px; }
.ng-meter-bars { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
.ng-meter-bars span {
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.25s;
}
.ng-meter small { min-width: 64px; text-align: right; font-size: 11px; font-weight: 700; }
.ng-meter.s1 small { color: #f87171; }
.ng-meter.s2 small { color: #fbbf24; }
.ng-meter.s3 small { color: #60a5fa; }
.ng-meter.s4 small { color: #34d399; }
.ng-meter.s1 .on { background: #f87171; }
.ng-meter.s2 .on { background: #fbbf24; }
.ng-meter.s3 .on { background: #60a5fa; }
.ng-meter.s4 .on { background: #34d399; }

/* ---------- Recomendaciones ---------- */
.ng-tips {
  margin: 2px 0 0;
  padding: 12px 14px;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--app-border-radius, 12px);
  background: rgba(255, 255, 255, 0.02);
}
.ng-tips li {
  position: relative;
  padding-left: 22px;
  color: var(--color-texto-general, #94a3b8);
  font-size: 11.5px;
  line-height: 1.35;
  opacity: 0.6;
  transition: color 0.2s, opacity 0.2s;
}
.ng-tips li::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 0;
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  transition: background 0.2s, border-color 0.2s;
}
.ng-tips li.done { color: #34d399; opacity: 1; }
.ng-tips li.done::before { border-color: #34d399; background: #34d399; }
.ng-tips li.done::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 5px;
  width: 3px;
  height: 6px;
  border: solid #0b1d16;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* =========================================================
   ALERTAS
   ========================================================= */
.ng-alert {
  margin: 0;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: var(--app-border-radius, 12px);
  font-size: 12.5px;
  line-height: 1.5;
}
.ng-alert svg { width: 18px; height: 18px; flex: none; margin-top: 1px; }
.ng-alert.error { color: #fca5a5; background: rgba(248, 113, 113, 0.09); border: 1px solid rgba(248, 113, 113, 0.4); }
.ng-alert.success { color: #86dba6; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); }

/* =========================================================
   ACCIONES
   ========================================================= */
.ng-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 2px 2px 0;
}
.ng-note {
  max-width: 440px;
  margin: 0;
  color: var(--color-texto-general, #94a3b8);
  font-size: 11.5px;
  line-height: 1.5;
  opacity: 0.6;
}
.ng-buttons { display: flex; align-items: center; gap: 10px; flex: none; }
.ng-btn {
  min-height: 50px;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  border-radius: var(--app-border-radius, 12px);
  font: 700 0.9rem 'Oswald', sans-serif;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  transition: filter 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.ng-btn svg { width: 17px; height: 17px; transition: transform 0.2s ease; }
.ng-btn.secondary {
  color: var(--color-texto-general, #94a3b8);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
}
.ng-btn.secondary:hover:not(:disabled) { color: #fff; background: rgba(255, 255, 255, 0.05); }
.ng-btn.primary {
  min-width: 220px;
  border: 0;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, #1c4fd6);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-botones, #1c4fd6) 40%, transparent);
}
.ng-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--color-botones, #1c4fd6) 50%, transparent);
}
.ng-btn.primary:hover:not(:disabled) svg { transform: translateX(3px); }
.ng-btn:active:not(:disabled) { transform: scale(0.98); }
.ng-btn:disabled { opacity: 0.6; cursor: progress; }
.ng-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.ng-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ng-spin 0.8s linear infinite;
}
@keyframes ng-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .ng *, .ng *::before, .ng *::after { transition: none !important; animation-duration: 1.4s !important; }
}

/* =========================================================
   RESPONSIVE
   ========================================================= */
@media (max-width: 980px) {
  .ng-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .ng-card { padding: 16px 14px 18px; }
  .ng-two,
  .ng-tips { grid-template-columns: minmax(0, 1fr); }
  .ng-actions { flex-direction: column-reverse; align-items: stretch; }
  .ng-note { max-width: none; text-align: center; }
  .ng-buttons { flex-direction: column-reverse; align-items: stretch; }
  .ng-btn,
  .ng-btn.primary { width: 100%; min-width: 0; }
  /* 16px evita el zoom automático en iOS */
  .ng-input input { font-size: 16px; }
}
</style>