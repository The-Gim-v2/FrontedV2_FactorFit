<script setup lang="ts">
import { reactive, ref, computed, nextTick } from 'vue';
import NoGymModal from './NoGymModal.vue';
import NotificationSystem from '../../components/Modals/NotificationSystem.vue'; // ajusta la ruta según dónde esté tu archivo

interface Gimnasio {
  id: string;
  nombre: string;
  ciudad: string;
  estado: string;
  direccion: string;
  precioMes: number;
  precioSem: number;
}

const gymsList: Gimnasio[] = [
  { id: 'g1', nombre: 'IronFit Valles Centro', ciudad: 'Ciudad Valles', estado: 'San Luis Potosí', direccion: 'Blvd. Carlos Lasso #120, Centro', precioMes: 650, precioSem: 180 },
  { id: 'g2', nombre: 'IronFit Norte - Plaza San José', ciudad: 'Ciudad Valles', estado: 'San Luis Potosí', direccion: 'Carretera Mante #450, Local 4', precioMes: 600, precioSem: 170 },
  { id: 'g3', nombre: 'Gold Gym Tampico', ciudad: 'Tampico', estado: 'Tamaulipas', direccion: 'Av. Hidalgo #250', precioMes: 700, precioSem: 200 },
  { id: 'g4', nombre: 'PowerZone Ciudad Madero', ciudad: 'Ciudad Madero', estado: 'Tamaulipas', direccion: 'Av. Universidad #88', precioMes: 550, precioSem: 150 }
];

const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const previewImage = ref<string | null>(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showNoGymModal = ref(false);
const gymSearch = ref('');
const gymSearchInput = ref<HTMLInputElement | null>(null);
const gymPickerRef = ref<HTMLElement | null>(null);
const isGymDropdownOpen = ref(false);
const selectedGymId = ref<string | null>(null);

const selectedGym = computed(() => gymsList.find(g => g.id === selectedGymId.value) || null);

const filteredGyms = computed(() => {
  const q = gymSearch.value.trim().toLowerCase();
  if (!q) return gymsList;
  return gymsList.filter(g => g.nombre.toLowerCase().includes(q) || g.ciudad.toLowerCase().includes(q) || g.estado.toLowerCase().includes(q));
});

const form = reactive({
  nombres: '',
  apellidoP: '',
  apellidoM: '',
  fechaNac: '',
  celular: '',
  email: '',
  password: '',
  confirmPassword: '',
  peso: '',
  altura: '',
  tipoMembresia: 'mes' as 'mes' | 'sem'
});

const selectGym = (gym: Gimnasio) => {
  selectedGymId.value = gym.id;
  gymSearch.value = '';
  isGymDropdownOpen.value = false;
};

const clearGym = () => {
  selectedGymId.value = null;
};

const triggerFileInput = () => fileInput.value?.click();

const onFileSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) previewImage.value = URL.createObjectURL(file);
};

const finishRegister = () => {
  console.log('Registro de atleta:', { ...form, gimnasioId: selectedGymId.value });

  toastRef.value?.notify(
    '¡Solicitud enviada con éxito! La sucursal revisará tu registro y te contactará pronto.',
    'success'
  );
};

const handleRegisterClick = () => {
  if (form.password !== form.confirmPassword) {
    toastRef.value?.notify(
      'Las contraseñas no coinciden. Por favor, verifícalas.',
      'warning'
    );
    return;
  }

  if (!selectedGymId.value) {
    showNoGymModal.value = true;
    return;
  }

  finishRegister();
};

const onAddGym = async () => {
  showNoGymModal.value = false;
  await nextTick();
  gymPickerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  isGymDropdownOpen.value = true;
  gymSearchInput.value?.focus({ preventScroll: true });
};
</script>

<template>
  <div class="register-page">
    <div class="photo-bg"></div>
    <div class="photo-overlay"></div>

    <NotificationSystem ref="toastRef" />

    <NoGymModal v-if="showNoGymModal" rol="atleta" @add="onAddGym" @close="showNoGymModal = false" />

    <!-- ENCABEZADO -->
    <header class="topbar">
      <router-link :to="{ name: 'home' }" class="brand" aria-label="Factor Fit - Inicio">
        <img src="../../assets/factor_fit-25.webp" alt="Factor Fit" class="brand-logo" />
        <span>FACTOR FIT</span>
      </router-link>

      <router-link :to="{ name: 'login' }" class="back-link" aria-label="Volver a iniciar sesión">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m14.5 17-5-5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Volver a iniciar sesión</span>
      </router-link>
    </header>

    <main class="main-content">
      <div class="register-card">
        <div class="header-section">
          <h1 class="title">Regístrate a <span>Factor Fit</span></h1>
          <p>Elige tu sucursal de Factor Fit y crea tu cuenta para empezar a entrenar</p>
        </div>

        <form @submit.prevent="handleRegisterClick">
          <div class="rg-grid">

            <!-- COLUMNA IZQUIERDA -->
            <div class="form-column">
              <h3 class="section-title first">Fotografía</h3>

              <div class="upload-container">
                <div class="image-preview" @click="triggerFileInput">
                  <img v-if="previewImage" :src="previewImage" class="profile-img" alt="Vista previa" />
                  <div v-else class="upload-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Subir foto</span>
                  </div>
                </div>
                <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileSelected" />
                <p>Sube una fotografía reciente para tu expediente de atleta</p>
              </div>

              <h3 class="section-title">Datos personales</h3>

              <div class="fields">
                <div class="field">
                  <label for="nombres">Nombre(s)</label>
                  <input id="nombres" v-model="form.nombres" type="text" placeholder="Ingresa tus nombres" required />
                </div>

                <div class="field-row">
                  <div class="field">
                    <label for="apellidoP">Apellido paterno</label>
                    <input id="apellidoP" v-model="form.apellidoP" type="text" placeholder="Paterno" required />
                  </div>
                  <div class="field">
                    <label for="apellidoM">Apellido materno</label>
                    <input id="apellidoM" v-model="form.apellidoM" type="text" placeholder="Materno" required />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <label for="fechaNac">Fecha de nacimiento</label>
                    <input id="fechaNac" v-model="form.fechaNac" type="date" required />
                  </div>
                  <div class="field">
                    <label for="celular">Teléfono celular</label>
                    <input id="celular" v-model="form.celular" type="tel" placeholder="Ej. 4811234567" required />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <label for="peso">Peso (kg) <small>Opcional</small></label>
                    <input id="peso" v-model="form.peso" type="text" inputmode="decimal" placeholder="Ej. 70" />
                  </div>
                  <div class="field">
                    <label for="altura">Altura (m) <small>Opcional</small></label>
                    <input id="altura" v-model="form.altura" type="text" inputmode="decimal" placeholder="Ej. 1.75" />
                  </div>
                </div>
              </div>
            </div>

            <!-- COLUMNA DERECHA -->
            <div class="form-column">
              <h3 class="section-title first">Cuenta de acceso</h3>

              <div class="fields">
                <div class="field">
                  <label for="email">Correo electrónico</label>
                  <input id="email" v-model="form.email" type="email" placeholder="usuario@ejemplo.com" required />
                </div>

                <div class="field-row">
                  <div class="field">
                    <label for="password">Contraseña</label>
                    <div class="password-field">
                      <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
                      <button type="button" @click="showPassword = !showPassword" aria-label="Mostrar contraseña">
                        <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="field">
                    <label for="confirmPassword">Confirmar contraseña</label>
                    <div class="password-field">
                      <input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" required />
                      <button type="button" @click="showConfirmPassword = !showConfirmPassword" aria-label="Mostrar contraseña">
                        <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <h3 class="section-title">Tu sucursal</h3>

              <div ref="gymPickerRef" class="gym-picker">
                <div v-if="!selectedGym" class="field">
                  <label for="gymSearch">Buscar sucursal</label>
                  <input id="gymSearch" ref="gymSearchInput" v-model="gymSearch" type="text" placeholder="Nombre o ciudad de la sucursal..." autocomplete="off" @focus="isGymDropdownOpen = true" />
                </div>

                <div v-if="!selectedGym && isGymDropdownOpen" class="gym-dropdown">
                  <button v-for="gym in filteredGyms" :key="gym.id" type="button" class="gym-option" @click="selectGym(gym)">
                    <span><strong>{{ gym.nombre }}</strong><small>{{ gym.ciudad }}, {{ gym.estado }}</small></span>
                    <b>${{ gym.precioMes }}/mes</b>
                  </button>
                  <div v-if="filteredGyms.length === 0" class="gym-empty">No se encontraron sucursales.</div>
                </div>

                <div v-if="selectedGym" class="selected-gym">
                  <div>
                    <strong>{{ selectedGym.nombre }}</strong>
                    <span>{{ selectedGym.direccion }} · {{ selectedGym.ciudad }}, {{ selectedGym.estado }}</span>
                  </div>
                  <button type="button" @click="clearGym">Cambiar</button>
                </div>
              </div>

              <!-- MEMBRESÍA -->
              <div v-if="selectedGym" class="membership">
                <label>Tipo de membresía</label>

                <div class="membership-options">
                  <button type="button" class="membership-option" :class="{ active: form.tipoMembresia === 'mes' }" @click="form.tipoMembresia = 'mes'">
                    <span>
                      <strong>Mensual</strong>
                      <small>Pago cada mes</small>
                    </span>
                    <b>${{ selectedGym.precioMes }}</b>
                  </button>

                  <button type="button" class="membership-option" :class="{ active: form.tipoMembresia === 'sem' }" @click="form.tipoMembresia = 'sem'">
                    <span>
                      <strong>Semanal</strong>
                      <small>Pago cada semana</small>
                    </span>
                    <b>${{ selectedGym.precioSem }}</b>
                  </button>
                </div>
              </div>

              <div class="actions">
                <button type="submit" class="submit-btn">
                  Registrarme
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </button>

                <p class="login-link">
                  ¿Ya tienes cuenta?
                  <router-link :to="{ name: 'login' }">Inicia sesión</router-link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

*{ box-sizing: border-box; }

.register-page {
  --bg: #12121c;
  --panel: rgba(24, 25, 40, .84);
  --field: rgba(255, 255, 255, .05);
  --line: rgba(255, 255, 255, .08);
  --line-strong: rgba(255, 255, 255, .14);
  --text: #f3eee8;
  --text-2: #bdb9c8;
  --text-3: #8f8ba0;
  --accent: #d4506e;
  --soft: #e9b08a;

  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.photo-bg {
  position: fixed;
  inset: 0;
  background: url('https://i.ibb.co/272HW3wN/fondo-landing.jpg') center/cover no-repeat;
  filter: blur(3px);
  transform: scale(1.05);
}

.photo-overlay {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 45% at 22% 8%, rgba(224, 74, 109, .14), transparent 70%),
    linear-gradient(180deg, rgba(18, 18, 28, .86), rgba(18, 18, 28, .95));
}

/* HEADER */

.topbar {
  width: 100%;
  max-width: 1500px;
  height: 84px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 76px);
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
}

.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, .22);
  background: #fff;
}

.brand span {
  color: var(--text);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 2px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px 9px 10px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgba(18, 18, 28, .55);
  color: var(--text-2);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: color .2s, border-color .2s, background .2s;
}

.back-link svg { width: 17px; height: 17px; transition: transform .2s; }
.back-link:hover { color: #fff; border-color: rgba(255, 255, 255, .28); background: rgba(255, 255, 255, .08); }
.back-link:hover svg { transform: translateX(-2px); }

.brand:focus-visible,
.back-link:focus-visible,
.login-link a:focus-visible,
.submit-btn:focus-visible {
  outline: 2px solid var(--soft);
  outline-offset: 3px;
}

/* CONTENIDO */

.main-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 12px clamp(16px, 3vw, 40px) 48px;
}

.register-card {
  width: 100%;
  max-width: 1020px;
  padding: clamp(26px, 3vw, 42px);
  background: var(--panel);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .45);
}

.header-section { margin-bottom: 32px; text-align: center; }

.header-section .title {
  margin: 0 0 10px;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.2px;
}

.header-section .title span {
  background: linear-gradient(90deg, #ecb892, #e58a7c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--soft);
}

.header-section p { margin: 0; color: var(--text-2); font-size: 14px; line-height: 1.55; }

.rg-grid { display: grid; grid-template-columns: 1fr; gap: clamp(30px, 4vw, 48px); align-items: start; }
.form-column, .fields, .field { display: flex; flex-direction: column; }
.form-column { gap: 15px; min-width: 0; }
.fields { gap: 14px; }
.field { gap: 7px; min-width: 0; }
.field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }

.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 16px 0 1px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
  color: var(--soft);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.section-title.first { margin-top: 0; }
label small {
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(255, 255, 255, .08);
  color: var(--text-3);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: .3px;
  text-transform: uppercase;
}

label { color: #e6e0e8; font-family: inherit; font-size: 12px; font-weight: 600; line-height: 1.4; }

input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 11px 14px;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  outline: none;
  color: var(--text);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  transition: .2s ease;
}
input::placeholder { color: #716e83; font-weight: 400; }
input:hover { border-color: rgba(255, 255, 255, .24); }
input:focus { border-color: var(--accent); background: rgba(212, 80, 110, .06); box-shadow: 0 0 0 3px rgba(212, 80, 110, .2); }
input[type="date"] { color-scheme: dark; }

.upload-container {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px;
  background: rgba(255, 255, 255, .03);
  border: 1px dashed rgba(233, 176, 138, .3);
  border-radius: 14px;
}
.upload-container p { margin: 0; color: var(--text-2); font-size: 12px; line-height: 1.5; }

.image-preview {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(233, 176, 138, .08);
  border: 2px solid rgba(233, 176, 138, .35);
  border-radius: 50%;
  cursor: pointer;
  transition: border-color .2s, background .2s;
}
.image-preview:hover { border-color: var(--soft); background: rgba(233, 176, 138, .16); }
.profile-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 5px; color: var(--soft); }
.upload-placeholder svg { width: 20px; height: 20px; }
.upload-placeholder span { font-size: 8px; font-weight: 700; text-transform: uppercase; }

.password-field { position: relative; }
.password-field input { padding-right: 44px; }
.password-field button {
  position: absolute;
  top: 0;
  right: 0;
  width: 44px;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: color .2s;
}
.password-field button:hover { color: #fff; }
.password-field svg { width: 17px; height: 17px; }

.gym-picker { position: relative; min-width: 0; }
.gym-dropdown {
  max-height: 240px;
  margin-top: 7px;
  overflow-y: auto;
  background: #1a1b2b;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  box-shadow: 0 18px 38px rgba(0, 0, 0, .55);
}
.gym-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.gym-option:last-child { border-bottom: 0; }
.gym-option:hover { background: rgba(212, 80, 110, .14); }
.gym-option > span { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.gym-option strong { overflow: hidden; font-size: 12.5px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; }
.gym-option small { overflow: hidden; color: var(--text-3); font-size: 10.5px; white-space: nowrap; text-overflow: ellipsis; }
.gym-option b { flex-shrink: 0; color: var(--soft); font-size: 11.5px; font-weight: 700; }
.gym-empty { padding: 15px; color: var(--text-3); font-size: 12px; text-align: center; }

.selected-gym {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  background: rgba(233, 176, 138, .08);
  border: 1px solid rgba(233, 176, 138, .3);
  border-radius: 12px;
}
.selected-gym > div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.selected-gym strong { font-size: 13px; font-weight: 650; }
.selected-gym span { color: var(--text-2); font-size: 11px; line-height: 1.4; }
.selected-gym button {
  padding: 7px 11px;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  background: rgba(255, 255, 255, .05);
  color: var(--text-2);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.selected-gym button:hover { background: rgba(212, 80, 110, .25); color: #fff; }

/* MEMBRESÍA */
.membership { display: flex; flex-direction: column; gap: 8px; margin-top: 2px; }
.membership-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.membership-option {
  min-width: 0;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 13px;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  color: var(--text-2);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, color .2s ease;
}
.membership-option > span { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.membership-option strong { font-family: inherit; font-size: 12.5px; font-weight: 650; }
.membership-option small { color: var(--text-3); font-family: inherit; font-size: 10px; font-weight: 400; }
.membership-option b { flex-shrink: 0; color: var(--text-2); font-family: inherit; font-size: 13px; font-weight: 700; }
.membership-option:hover:not(.active) { background: rgba(255, 255, 255, .08); border-color: rgba(255, 255, 255, .24); }
.membership-option.active {
  background: rgba(212, 80, 110, .12);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 0 0 3px rgba(212, 80, 110, .16);
}
.membership-option.active small { color: var(--soft); }
.membership-option.active b { color: var(--soft); }

.actions { display: flex; flex-direction: column; gap: 14px; margin-top: 18px; }
.submit-btn {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #d4506e, #cf4a77);
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(212, 80, 110, .22);
  transition: filter .2s, transform .2s, box-shadow .2s;
}
.submit-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 10px 24px rgba(212, 80, 110, .32); }
.submit-btn:active { transform: none; filter: brightness(.97); }
.submit-btn svg { width: 18px; height: 18px; transition: transform .2s; }
.submit-btn:hover svg { transform: translateX(3px); }

.login-link { margin: 0; color: var(--text-3); font-size: 13px; text-align: center; }
.login-link a { color: var(--soft); font-weight: 650; text-decoration: none; }
.login-link a:hover { color: #fff; text-decoration: underline; text-underline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after { transition: none !important; animation-duration: .01ms !important; }
}

@media (min-width: 900px) {
  .rg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .topbar { height: 68px; padding: 0 17px; }
  .brand { gap: 9px; }
  .brand-logo { width: 34px; height: 34px; }
  .brand span { font-size: 15px; letter-spacing: 1.6px; }
  .back-link { width: 40px; height: 40px; justify-content: center; padding: 0; border-radius: 12px; }
  .back-link span { display: none; }
  .back-link svg { width: 19px; height: 19px; }
  .main-content { padding: 8px 14px 30px; }
  .register-card { padding: 24px 18px; border-radius: 20px; }
  .field-row { grid-template-columns: 1fr; }
  .membership-options { grid-template-columns: 1fr; }
  input { font-size: 16px; } /* evita el zoom automático en iOS */
}

@media (max-width: 420px) {
  .topbar { height: 62px; padding: 0 14px; }
  .brand span { font-size: 14px; }
  .register-card { padding: 22px 15px; }
  .header-section .title { font-size: 1.75rem; }
  .selected-gym { flex-direction: column; align-items: stretch; }
}
</style>