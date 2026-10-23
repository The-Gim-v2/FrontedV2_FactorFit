<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface LoginResponse {
  message: string
  token: string
  token_type: string
  rol: string
  usuario: {
    id: number
    nombre: string
    propietario: string
    email: string
    logo: string | null
    fondo: string | null
    sedes: Array<Record<string, unknown>>
  }
}

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const dashboardRoutes: Record<string, string> = {
  GYM_ACCOUNT: 'GYM_ACCOUNT-dashboard',
  GYM_RECEPCIONIST: 'GYM_RECEPCIONIST-dashboard',
  GYM_ADMIN: 'GYM_ADMIN-dashboard',
  GYM_MANAGER: 'GYM_MANAGER-dashboard',
  Admin: 'Admin-dashboard',
  Member: 'Member-dashboard'
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const handleSubmit = async () => {
  if (loading.value) return
  clearMessages()
  loading.value = true

  try {
    const apiUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
    if (!apiUrl) throw new Error('No está configurada la URL del servidor.')

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase(),
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Correo o contraseña incorrectos.'
      return
    }

    const result = data as LoginResponse
    const role = String(result.rol ?? '').trim()
    const routeName = dashboardRoutes[role]

    if (!result.token || !role || !routeName) {
      errorMessage.value = 'La respuesta del servidor no contiene una sesión válida.'
      return
    }

    if (!router.hasRoute(routeName)) {
      errorMessage.value = `No se encontró el dashboard para el rol ${role}.`
      return
    }

    sessionStorage.setItem('auth_token', result.token)
    sessionStorage.setItem('user_role', role)
    sessionStorage.setItem('gym_account', JSON.stringify(result.usuario ?? {}))
    localStorage.removeItem('user_role')

    successMessage.value = `Bienvenido a ${result.usuario?.nombre || 'Factor Fit'}.`

    const failure = await router.replace({ name: routeName })

    if (failure) {
      console.error('Error de navegación:', failure)
      errorMessage.value = 'No fue posible acceder al dashboard.'
      return
    }

    console.log('Inicio de sesión exitoso:', role)
    console.log('Dashboard:', router.currentRoute.value.fullPath)
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    errorMessage.value = error instanceof Error && error.message === 'No está configurada la URL del servidor.'
      ? error.message
      : 'No se pudo completar el inicio de sesión. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="photo-bg"></div>
    <div class="photo-overlay"></div>

    <!-- ENCABEZADO -->
    <header class="topbar">
      <router-link :to="{name:'home'}" class="brand" aria-label="Factor Fit - Inicio">
        <img src="../../assets/factor_fit-25.webp" alt="Factor Fit" class="brand-logo">
        <span>FACTOR FIT</span>
      </router-link>

      <router-link :to="{name:'home'}" class="back-link" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m14.5 17-5-5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Volver al inicio</span>
      </router-link>
    </header>

    <main class="login-main">
      <div class="login-layout">

        <!-- PANEL IZQUIERDO -->
        <section class="welcome-panel">
          <div class="welcome-content">
            <span class="eyebrow">COMUNIDAD FACTOR FIT</span>

            <h1>
              Entrena, reserva
              <span>y supera tus metas.</span>
            </h1>

            <p class="welcome-description">
              Ingresa a tu cuenta para consultar tus clases, rutinas y todo lo que necesitas para seguir tu progreso en Factor Fit.
            </p>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.7"/>
                    <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <strong>Clases grupales</strong>
                  <span>Consulta horarios y reserva tu lugar en segundos.</span>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <strong>Rutinas de entrenadores</strong>
                  <span>Planifica tu semana con el apoyo de tu equipo.</span>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 17 9.5 11.5l3.5 3.5L20 7.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.5 7.5H20V13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <strong>Tu progreso al día</strong>
                  <span>Todo tu avance reunido en un solo lugar.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="welcome-footer">
            <span class="status-dot"></span>
            <span>Sistema disponible</span>
          </div>
        </section>

        <!-- PANEL LOGIN -->
        <section class="login-panel">
          <div class="form-container">

            <div class="form-header">
              <span class="form-eyebrow">HOLA DE NUEVO</span>
              <h2>Inicia <span>sesión</span></h2>
              <p>Ingresa tus datos para entrar a tu cuenta de Factor Fit.</p>
            </div>

            <form class="login-form" @submit.prevent="handleSubmit">

              <!-- CORREO -->
              <div class="input-group">
                <label for="email">Correo electrónico</label>

                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.7"/>
                    <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="usuario@ejemplo.com"
                    required
                    @input="clearMessages"
                  >
                </div>
              </div>

              <!-- CONTRASEÑA -->
              <div class="input-group">
                <div class="label-row">
                  <label for="password">Contraseña</label>

                  <router-link :to="{name:'recover-password'}" class="forgot-link">
                    ¿Has olvidado tu contraseña?
                  </router-link>
                </div>

                <div class="input-wrapper">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" stroke-width="1.7"/>
                    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                  </svg>

                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword?'text':'password'"
                    autocomplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    required
                    @input="clearMessages"
                  >

                  <button
                    type="button"
                    class="password-toggle"
                    :aria-label="showPassword?'Ocultar contraseña':'Mostrar contraseña'"
                    @click="showPassword=!showPassword"
                  >
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" stroke-width="1.7"/>
                      <circle cx="12" cy="12" r="2.7" stroke="currentColor" stroke-width="1.7"/>
                    </svg>

                    <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 6.15A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a14.7 14.7 0 0 1-2.3 2.9M6.2 6.2C3.9 7.8 2.5 12 2.5 12s3.5 6 9.5 6a10 10 0 0 0 3.1-.5M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- ERROR -->
              <div v-if="errorMessage" class="alert alert-error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>
                  <path d="M12 7.8v5.4M12 16.5h.01" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                </svg>
                <span>{{errorMessage}}</span>
              </div>

              <!-- ÉXITO -->
              <div v-if="successMessage" class="alert alert-success" role="status">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>
                  <path d="m8 12 2.6 2.6 5.4-5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{successMessage}}</span>
              </div>

              <!-- BOTÓN -->
              <button type="submit" class="login-button" :disabled="loading">
               <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- REGISTRO -->
              <div class="register">
                <span>¿Aún no eres parte?</span>
                <router-link to="/Record">Registrarse</router-link>
              </div>
            </form>

            <div class="form-footer">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
                <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.6"/>
              </svg>
              <span>Acceso seguro</span>
            </div>

          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

*{box-sizing:border-box}

.login-page{
  --bg:#12121c;
  --panel:rgba(24,25,40,.84);
  --panel-2:#161726;
  --field:rgba(255,255,255,.05);
  --line:rgba(255,255,255,.08);
  --line-strong:rgba(255,255,255,.14);
  --text:#f3eee8;
  --text-2:#bdb9c8;
  --text-3:#8f8ba0;
  --accent:#d4506e;
  --accent-hover:#de5f7c;
  --soft:#e9b08a;
  --danger:#f0a3a3;
  --ok:#8fd4a8;

  width:100%;
  min-height:100dvh;
  position:relative;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  background:var(--bg);
  color:var(--text);
  font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
}

.photo-bg{
  position:absolute;
  inset:0;
  background:url('https://i.ibb.co/272HW3wN/fondo-landing.jpg') center/cover no-repeat;
  filter:blur(3px);
  transform:scale(1.05);
}

.photo-overlay{
  position:absolute;
  inset:0;
  background:
    radial-gradient(ellipse 55% 45% at 22% 8%,rgba(224,74,109,.14),transparent 70%),
    linear-gradient(180deg,rgba(18,18,28,.86),rgba(18,18,28,.95));
}

/* HEADER */

.topbar{
  width:100%;
  max-width:1500px;
  height:84px;
  margin:0 auto;
  padding:0 clamp(24px,5vw,76px);
  position:relative;
  z-index:5;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.brand{
  display:flex;
  align-items:center;
  gap:12px;
  color:#fff;
  text-decoration:none;
  border-radius:8px;
}

.brand-logo{
  width:38px;
  height:38px;
  border-radius:50%;
  object-fit:cover;
  border:2px solid rgba(255,255,255,.22);
  background:#fff;
}

.brand span{
  color:var(--text);
  font-size:17px;
  font-weight:800;
  letter-spacing:2px;
}

.back-link{
  display:flex;
  align-items:center;
  gap:6px;
  padding:9px 14px 9px 10px;
  border:1px solid var(--line-strong);
  border-radius:999px;
  background:rgba(18,18,28,.55);
  color:var(--text-2);
  font-size:13px;
  font-weight:600;
  text-decoration:none;
  transition:color .2s,border-color .2s,background .2s;
}

.back-link svg{
  width:17px;
  height:17px;
  transition:transform .2s;
}

.back-link:hover{
  color:#fff;
  border-color:rgba(255,255,255,.28);
  background:rgba(255,255,255,.08);
}

.back-link:hover svg{
  transform:translateX(-2px);
}

.brand:focus-visible,
.back-link:focus-visible,
.forgot-link:focus-visible,
.register a:focus-visible,
.login-button:focus-visible,
.password-toggle:focus-visible{
  outline:2px solid var(--soft);
  outline-offset:3px;
}

/* CONTENEDOR */

.login-main{
  flex:1;
  min-height:0;
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px clamp(30px,6vw,90px) 72px;
}

.login-layout{
  width:100%;
  max-width:1160px;
  min-height:610px;
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(420px,.95fr);
  overflow:hidden;
  border:1px solid var(--line);
  border-radius:28px;
  background:var(--panel);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  box-shadow:0 30px 80px rgba(0,0,0,.45);
}

/* PANEL IZQUIERDO */

.welcome-panel{
  position:relative;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  padding:60px 62px 38px;
  border-right:1px solid var(--line);
  background:
    radial-gradient(circle at 8% 0%,rgba(255,178,122,.1),transparent 45%),
    linear-gradient(160deg,rgba(255,255,255,.04),rgba(255,255,255,0) 65%);
}

.welcome-panel:before,
.welcome-panel:after{
  content:"";
  position:absolute;
  border:1px solid rgba(255,255,255,.05);
  border-radius:50%;
  pointer-events:none;
}

.welcome-panel:before{
  width:380px;
  height:380px;
  right:-170px;
  bottom:-190px;
}

.welcome-panel:after{
  width:250px;
  height:250px;
  right:-110px;
  bottom:-125px;
}

.welcome-content{
  max-width:500px;
  position:relative;
  z-index:2;
}

.eyebrow{
  display:inline-flex;
  align-items:center;
  gap:9px;
  margin-bottom:22px;
  padding:7px 13px 7px 11px;
  border:1px solid rgba(233,176,138,.28);
  border-radius:999px;
  background:rgba(233,176,138,.08);
  color:var(--soft);
  font-size:11px;
  font-weight:700;
  letter-spacing:1.2px;
}

.eyebrow:before{
  content:"";
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--soft);
  box-shadow:0 0 0 3px rgba(233,176,138,.16);
}

.welcome-content h1{
  max-width:500px;
  margin:0;
  color:var(--text);
  font-size:clamp(36px,3.4vw,50px);
  line-height:1.06;
  font-weight:800;
  letter-spacing:-1.8px;
}

.welcome-content h1 span{
  display:block;
  background:linear-gradient(90deg,#ecb892,#e58a7c);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  color:var(--soft);
}

.welcome-description{
  max-width:450px;
  margin:22px 0 0;
  color:var(--text-2);
  font-size:15px;
  line-height:1.65;
}

/* CARACTERÍSTICAS */

.features{
  display:flex;
  flex-direction:column;
  gap:12px;
  margin-top:38px;
}

.feature{
  display:flex;
  align-items:center;
  gap:15px;
  padding:13px 15px;
  border:1px solid var(--line);
  border-radius:14px;
  background:rgba(255,255,255,.025);
  transition:border-color .2s,background .2s;
}

.feature:hover{
  border-color:rgba(255,255,255,.16);
  background:rgba(255,255,255,.045);
}

.feature-icon{
  width:42px;
  height:42px;
  flex:0 0 42px;
  display:grid;
  place-items:center;
  border:1px solid rgba(233,176,138,.25);
  border-radius:11px;
  background:rgba(233,176,138,.08);
  color:var(--soft);
}

.feature-icon svg{
  width:20px;
  height:20px;
}

.feature>div:last-child{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}

.feature strong{
  color:var(--text);
  font-size:14.5px;
  font-weight:650;
}

.feature span{
  color:var(--text-3);
  font-size:13px;
  line-height:1.45;
}

.welcome-footer{
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  gap:9px;
  margin-top:32px;
  color:var(--text-3);
  font-size:12.5px;
}

.status-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#4fae7e;
  box-shadow:0 0 0 3px rgba(79,174,126,.16);
}

/* PANEL LOGIN */

.login-panel{
  min-width:0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:56px 58px;
  background:var(--panel-2);
}

.form-container{
  width:100%;
  max-width:390px;
}

.form-header{
  margin-bottom:32px;
}

.form-eyebrow{
  display:block;
  margin-bottom:10px;
  color:var(--soft);
  font-size:11px;
  font-weight:700;
  letter-spacing:1.3px;
}

.form-header h2{
  margin:0 0 10px;
  color:var(--text);
  font-size:34px;
  line-height:1.1;
  font-weight:800;
  letter-spacing:-1px;
}

.form-header h2 span{
  color:var(--soft);
}

.form-header p{
  margin:0;
  color:var(--text-2);
  font-size:14px;
  line-height:1.55;
}

.login-form{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.input-group{
  display:flex;
  flex-direction:column;
  gap:9px;
}

.label-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

label{
  color:#e6e0e8;
  font-size:13px;
  font-weight:600;
}

.forgot-link{
  color:var(--soft);
  font-size:12.5px;
  font-weight:600;
  text-decoration:none;
  border-radius:4px;
}

.forgot-link:hover{
  color:#fff;
  text-decoration:underline;
  text-underline-offset:3px;
}

.input-wrapper{
  position:relative;
}

.input-icon{
  position:absolute;
  left:16px;
  top:50%;
  width:18px;
  height:18px;
  transform:translateY(-50%);
  color:var(--text-3);
  pointer-events:none;
  transition:color .2s;
}

.input-wrapper input{
  width:100%;
  height:54px;
  padding:0 50px 0 46px;
  border:1px solid var(--line-strong);
  border-radius:12px;
  outline:0;
  background:var(--field);
  color:var(--text);
  font-family:inherit;
  font-size:14.5px;
  font-weight:500;
  transition:border-color .2s,background .2s,box-shadow .2s;
}

.input-wrapper input::placeholder{
  color:#716e83;
}

.input-wrapper input:hover{
  border-color:rgba(255,255,255,.24);
}

.input-wrapper input:focus{
  border-color:var(--accent);
  background:rgba(212,80,110,.06);
  box-shadow:0 0 0 3px rgba(212,80,110,.2);
}

.input-wrapper:focus-within .input-icon{
  color:var(--text-2);
}

.input-wrapper input:-webkit-autofill,
.input-wrapper input:-webkit-autofill:hover,
.input-wrapper input:-webkit-autofill:focus{
  -webkit-text-fill-color:var(--text);
  -webkit-box-shadow:0 0 0 1000px #1c1d2e inset;
  caret-color:#fff;
}

.password-toggle{
  position:absolute;
  top:6px;
  right:6px;
  width:42px;
  height:42px;
  display:grid;
  place-items:center;
  padding:0;
  border:0;
  border-radius:9px;
  background:transparent;
  color:var(--text-3);
  cursor:pointer;
  transition:background .2s,color .2s;
}

.password-toggle:hover{
  background:rgba(255,255,255,.07);
  color:#fff;
}

.password-toggle svg{
  width:19px;
  height:19px;
}

/* MENSAJES */

.alert{
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:13px 14px;
  border-radius:12px;
  font-size:13px;
  font-weight:500;
  line-height:1.45;
}

.alert svg{
  width:18px;
  height:18px;
  flex:0 0 18px;
}

.alert-error{
  border:1px solid rgba(240,163,163,.3);
  background:rgba(200,70,70,.1);
  color:var(--danger);
}

.alert-success{
  border:1px solid rgba(143,212,168,.3);
  background:rgba(60,160,100,.1);
  color:var(--ok);
}

/* BOTÓN */

.login-button{
  width:100%;
  height:54px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  margin-top:4px;
  border:0;
  border-radius:12px;
  background:linear-gradient(90deg,#d4506e,#cf4a77);
  color:#fff;
  font-family:inherit;
  font-size:14.5px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 8px 20px rgba(212,80,110,.22);
  transition:filter .2s,transform .2s,box-shadow .2s;
}

.login-button svg{
  width:18px;
  height:18px;
  transition:transform .2s;
}

.login-button:hover{
  filter:brightness(1.07);
  transform:translateY(-1px);
  box-shadow:0 10px 24px rgba(212,80,110,.32);
}

.login-button:hover svg{
  transform:translateX(3px);
}

.login-button:active{
  transform:none;
  filter:brightness(.97);
}

.register{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  color:var(--text-3);
  font-size:13px;
}

.register a{
  color:var(--soft);
  font-weight:650;
  text-decoration:none;
  border-radius:4px;
}

.register a:hover{
  color:#fff;
  text-decoration:underline;
  text-underline-offset:3px;
}

.form-footer{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  margin-top:30px;
  padding-top:20px;
  border-top:1px solid var(--line);
  color:var(--text-3);
  font-size:12px;
}

.form-footer svg{
  width:15px;
  height:15px;
}

@media(prefers-reduced-motion:reduce){
  *,*:before,*:after{
    transition:none!important;
    animation-duration:.01ms!important;
  }
}

/* TABLET */

@media(max-width:1000px){
  .login-main{
    padding-left:25px;
    padding-right:25px;
  }

  .login-layout{
    max-width:900px;
    grid-template-columns:minmax(0,.95fr) minmax(390px,1.05fr);
  }

  .welcome-panel{
    padding:48px 38px 34px;
  }

  .welcome-content h1{
    font-size:35px;
  }

  .welcome-description{
    font-size:14px;
  }

  .login-panel{
    padding:48px 40px;
  }
}

/* MÓVIL */

@media(max-width:760px){
  .login-page{
    min-height:100dvh;
    overflow-x:hidden;
    overflow-y:auto;
  }

  .topbar{
    width:100%;
    height:68px;
    padding:0 17px;
  }

  .brand{
    gap:9px;
  }

  .brand-logo{
    width:34px;
    height:34px;
  }

  .brand span{
    font-size:15px;
    letter-spacing:1.6px;
  }

  .back-link{
    width:40px;
    height:40px;
    margin-left:auto;
    justify-content:center;
    padding:0;
    border-radius:12px;
  }

  .back-link span{
    display:none;
  }

  .back-link svg{
    width:19px;
    height:19px;
  }

  .login-main{
    flex:1;
    width:100%;
    min-height:calc(100dvh - 68px);
    align-items:center;
    padding:14px 15px 36px;
  }

  .login-layout{
    width:100%;
    max-width:440px;
    min-height:0;
    display:block;
    overflow:visible;
    border:0;
    border-radius:0;
    background:transparent;
    box-shadow:none;
    backdrop-filter:none;
    -webkit-backdrop-filter:none;
  }

  .welcome-panel{
    display:none;
  }

  .login-panel{
    width:100%;
    display:block;
    padding:0;
    background:transparent;
  }

  .form-container{
    width:100%;
    max-width:none;
    padding:32px 24px 26px;
    border:1px solid var(--line);
    border-radius:20px;
    background:var(--panel-2);
    box-shadow:0 20px 50px rgba(0,0,0,.4);
  }

  .form-header{
    margin-bottom:28px;
  }

  .form-header h2{
    font-size:30px;
  }

  .login-form{
    gap:19px;
  }

  .input-wrapper input{
    height:54px;
    font-size:16px; /* evita el zoom automático en iOS */
  }

  .login-button{
    height:54px;
    font-size:15px;
  }

  .form-footer{
    margin-top:26px;
    padding-top:18px;
  }
}

/* TELÉFONOS */

@media(max-width:480px){
  .topbar{
    height:62px;
    padding:0 14px;
  }

  .brand span{
    font-size:14px;
  }

  .back-link{
    width:38px;
    height:38px;
    border-radius:11px;
  }

  .login-main{
    min-height:calc(100dvh - 62px);
    align-items:flex-start;
    padding:14px 11px 26px;
  }

  .login-layout{
    max-width:none;
  }

  .form-container{
    padding:28px 20px 24px;
    border-radius:18px;
  }

  .form-header{
    margin-bottom:26px;
  }

  .form-header h2{
    font-size:28px;
  }

  .label-row{
    gap:8px;
  }

  .input-wrapper input{
    padding-left:44px;
  }

  .register{
    flex-wrap:wrap;
  }
}

/* MÓVILES PEQUEÑOS */

@media(max-width:360px){
  .topbar{
    padding:0 10px;
  }

  .login-main{
    padding-left:8px;
    padding-right:8px;
  }

  .form-container{
    padding:24px 16px 21px;
  }

  .form-header h2{
    font-size:25px;
  }

  .label-row{
    align-items:flex-start;
    flex-direction:column;
    gap:5px;
  }

  .forgot-link{
    align-self:flex-end;
  }
}

/* PANTALLAS DE POCA ALTURA */

@media(max-height:720px) and (min-width:761px){
  .topbar{
    height:66px;
  }

  .login-main{
    padding-top:14px;
    padding-bottom:30px;
  }

  .login-layout{
    min-height:540px;
  }

  .welcome-panel{
    padding-top:40px;
    padding-bottom:30px;
  }

  .features{
    margin-top:26px;
    gap:9px;
  }

  .feature{
    padding:10px 13px;
  }

  .login-panel{
    padding-top:36px;
    padding-bottom:36px;
  }
}
</style>