<template>
  <div class="recovery-page">
    <div class="photo-bg"></div>
    <div class="photo-overlay"></div>

    <!-- HEADER -->
    <header class="topbar">
      <router-link :to="{name:'home'}" class="brand" aria-label="Factor Fit - Inicio">
        <img src="../../assets/factor_fit-25.webp" alt="Factor Fit" class="brand-logo">
        <span>FACTOR FIT</span>
      </router-link>

      <router-link :to="{name:'login'}" class="back-link" aria-label="Volver al inicio de sesión">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m14.5 17-5-5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Volver a iniciar sesión</span>
      </router-link>
    </header>

    <main class="recovery-main">
      <div class="recovery-layout">

        <!-- PANEL IZQUIERDO -->
        <section class="info-panel">
          <div class="info-content">
            <span class="eyebrow">RECUPERACIÓN DE CUENTA</span>

            <h1>
              Vuelve a entrenar
              <span>sin contratiempos.</span>
            </h1>

            <p class="info-description">
              Verifica tu identidad con los datos de tu cuenta de Factor Fit y te enviaremos las instrucciones para recuperar tu acceso.
            </p>

            <div class="steps">
              <div class="step">
                <div class="step-number">01</div>
                <div>
                  <strong>Verifica tus datos</strong>
                  <span>Ingresa tu correo y fecha de nacimiento.</span>
                </div>
              </div>

              <div class="step-line"></div>

              <div class="step">
                <div class="step-number">02</div>
                <div>
                  <strong>Recibe las instrucciones</strong>
                  <span>Te indicaremos cómo continuar con la recuperación.</span>
                </div>
              </div>

              <div class="step-line"></div>

              <div class="step">
                <div class="step-number">03</div>
                <div>
                  <strong>Recupera tu acceso</strong>
                  <span>Inicia sesión y retoma tu rutina.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-footer">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" stroke-width="1.6"/>
              <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.6"/>
            </svg>
            <span>Proceso seguro de recuperación</span>
          </div>
        </section>

        <!-- FORMULARIO -->
        <section class="form-panel">
          <div class="form-container">

            <div class="form-header">
              <span class="form-eyebrow">VERIFICACIÓN</span>
              <h2>Recuperar <span>acceso</span></h2>
              <p>Ingresa tus datos para verificar tu identidad.</p>
            </div>

            <form class="recovery-form" @submit.prevent="handleRecovery">

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
                    :disabled="isLoading || isSuccess"
                    required
                    @input="clearMessages"
                  >
                </div>
              </div>

              <!-- FECHA -->
              <div class="input-group">
                <label for="birthDate">Fecha de nacimiento</label>

                <div class="input-wrapper date-wrapper" @click="showDatePicker">
                  <svg class="input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.7"/>
                    <path d="M7 3v4M17 3v4M3 9h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                    <path d="M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 17h.01M12 17h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                  </svg>

                  <input
                    id="birthDate"
                    ref="dateInput"
                    v-model="birthDate"
                    type="date"
                    :disabled="isLoading || isSuccess"
                    required
                    @input="clearMessages"
                  >

                  <svg class="date-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m8 10 4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
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
              <button type="submit" class="primary-button" :disabled="isLoading || isSuccess">
                <span v-if="isLoading" class="button-state">
                  <span class="spinner"></span>
                  Enviando instrucciones
                </span>

                <span v-else-if="isSuccess" class="button-state">
                  Redirigiendo ({{countdown}}s)
                </span>

                <span v-else class="button-state">
                  Mandar instrucciones
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>

              <!-- VOLVER -->
              <div class="login-link">
                <span>¿Ya la recordaste?</span>
                <router-link :to="{name:'login'}">Iniciar sesión</router-link>
              </div>

            </form>

            <div class="form-footer">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="m9.3 12 1.8 1.8 3.8-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Tus datos se utilizan únicamente para verificar tu identidad</span>
            </div>

          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {ref,onUnmounted} from 'vue';
import {useRouter} from 'vue-router';

const router=useRouter();
const email=ref('');
const birthDate=ref('');
const dateInput=ref<HTMLInputElement|null>(null);
const errorMessage=ref('');
const successMessage=ref('');
const isLoading=ref(false);
const isSuccess=ref(false);
const countdown=ref(3);

let timer:number|null=null;
let intervalTimer:number|null=null;

const clearMessages=()=>{
  errorMessage.value='';
  successMessage.value='';
};

const showDatePicker=()=>{
  if(dateInput.value&&!isLoading.value&&!isSuccess.value){
    dateInput.value.showPicker?.();
  }
};

const handleRecovery=()=>{
  if(!email.value||!birthDate.value){
    errorMessage.value='Por favor completa todos los campos.';
    return;
  }

  isLoading.value=true;
  clearMessages();

  setTimeout(()=>{
    isLoading.value=false;
    isSuccess.value=true;
    successMessage.value=`Instrucciones enviadas. Redirigiendo al login en ${countdown.value} segundos...`;

    intervalTimer=window.setInterval(()=>{
      countdown.value--;

      if(countdown.value>0){
        successMessage.value=`Instrucciones enviadas. Redirigiendo al login en ${countdown.value} segundos...`;
      }
    },1000);

    timer=window.setTimeout(()=>{
      router.push({name:'login'});
    },3000);
  },1000);
};

onUnmounted(()=>{
  if(timer)clearTimeout(timer);
  if(intervalTimer)clearInterval(intervalTimer);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

*{box-sizing:border-box}

.recovery-page{
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
.login-link a:focus-visible,
.primary-button:focus-visible{
  outline:2px solid var(--soft);
  outline-offset:3px;
}

/* LAYOUT */

.recovery-main{
  flex:1;
  min-height:0;
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px clamp(30px,6vw,90px) 72px;
}

.recovery-layout{
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

/* PANEL INFORMATIVO */

.info-panel{
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

.info-panel:before,
.info-panel:after{
  content:"";
  position:absolute;
  border:1px solid rgba(255,255,255,.05);
  border-radius:50%;
  pointer-events:none;
}

.info-panel:before{
  width:380px;
  height:380px;
  right:-170px;
  bottom:-190px;
}

.info-panel:after{
  width:250px;
  height:250px;
  right:-110px;
  bottom:-125px;
}

.info-content{
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

.info-content h1{
  max-width:500px;
  margin:0;
  color:var(--text);
  font-size:clamp(36px,3.4vw,50px);
  line-height:1.06;
  font-weight:800;
  letter-spacing:-1.8px;
}

.info-content h1 span{
  display:block;
  background:linear-gradient(90deg,#ecb892,#e58a7c);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  color:var(--soft);
}

.info-description{
  max-width:450px;
  margin:22px 0 0;
  color:var(--text-2);
  font-size:15px;
  line-height:1.65;
}

/* PASOS */

.steps{
  display:flex;
  flex-direction:column;
  margin-top:42px;
}

.step{
  display:flex;
  align-items:center;
  gap:16px;
}

.step-number{
  width:44px;
  height:44px;
  flex:0 0 44px;
  display:grid;
  place-items:center;
  border:1px solid rgba(233,176,138,.25);
  border-radius:12px;
  background:rgba(233,176,138,.08);
  color:var(--soft);
  font-size:12px;
  font-weight:800;
  letter-spacing:.5px;
}

.step:first-child .step-number{
  border-color:transparent;
  background:linear-gradient(135deg,#d4506e,#cf4a77);
  color:#fff;
  box-shadow:0 8px 20px rgba(212,80,110,.22);
}

.step>div:last-child{
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:3px;
}

.step strong{
  color:var(--text);
  font-size:14.5px;
  font-weight:650;
}

.step span{
  color:var(--text-3);
  font-size:13px;
  line-height:1.45;
}

.step-line{
  width:1px;
  height:20px;
  margin:4px 0 4px 21.5px;
  background:linear-gradient(to bottom,rgba(233,176,138,.4),rgba(233,176,138,.08));
}

.info-footer{
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:34px;
  color:var(--text-3);
  font-size:12.5px;
}

.info-footer svg{
  width:15px;
  height:15px;
}

/* FORMULARIO */

.form-panel{
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

.recovery-form{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.input-group{
  display:flex;
  flex-direction:column;
  gap:9px;
}

label{
  color:#e6e0e8;
  font-size:13px;
  font-weight:600;
}

.input-wrapper{
  position:relative;
}

.input-icon{
  position:absolute;
  z-index:2;
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
  padding:0 44px 0 46px;
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

.input-wrapper input:hover:not(:disabled){
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

.input-wrapper input:disabled{
  opacity:.55;
  cursor:not-allowed;
}

.input-wrapper input:-webkit-autofill,
.input-wrapper input:-webkit-autofill:hover,
.input-wrapper input:-webkit-autofill:focus{
  -webkit-text-fill-color:var(--text);
  -webkit-box-shadow:0 0 0 1000px #1c1d2e inset;
  caret-color:#fff;
}

.date-wrapper{
  cursor:pointer;
}

.date-wrapper input{
  cursor:pointer;
  color-scheme:dark;
}

.date-arrow{
  position:absolute;
  z-index:2;
  top:50%;
  right:15px;
  width:17px;
  height:17px;
  transform:translateY(-50%);
  color:var(--text-3);
  pointer-events:none;
}

/* Quita el icono nativo del navegador: solo se muestra la flecha propia */
.date-wrapper input[type="date"]{
  -webkit-appearance:none;
  appearance:none;
  display:block;
  min-width:0;
  text-align:left;
}

.date-wrapper input[type="date"]::-webkit-date-and-time-value{
  min-height:1.2em;
  text-align:left;
}

input[type="date"]::-webkit-calendar-picker-indicator{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  margin:0;
  padding:0;
  opacity:0;
  background:none;
  cursor:pointer;
}

input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-clear-button{
  display:none;
  -webkit-appearance:none;
}

/* ALERTAS */

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

.primary-button{
  width:100%;
  height:54px;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-top:4px;
  padding:0 16px;
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

.button-state{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:9px;
}

.button-state svg{
  width:18px;
  height:18px;
  transition:transform .2s;
}

.primary-button:hover:not(:disabled){
  filter:brightness(1.07);
  transform:translateY(-1px);
  box-shadow:0 10px 24px rgba(212,80,110,.32);
}

.primary-button:hover:not(:disabled) svg{
  transform:translateX(3px);
}

.primary-button:active:not(:disabled){
  transform:none;
  filter:brightness(.97);
}

.primary-button:disabled{
  opacity:.65;
  cursor:not-allowed;
  transform:none;
}

.spinner{
  width:16px;
  height:16px;
  border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff;
  border-radius:50%;
  animation:spin .7s linear infinite;
}

@keyframes spin{
  to{transform:rotate(360deg)}
}

/* LOGIN */

.login-link{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  color:var(--text-3);
  font-size:13px;
}

.login-link a{
  color:var(--soft);
  font-weight:650;
  text-decoration:none;
  border-radius:4px;
}

.login-link a:hover{
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
  line-height:1.4;
  text-align:center;
}

.form-footer svg{
  width:15px;
  height:15px;
  flex:0 0 15px;
}

@media(prefers-reduced-motion:reduce){
  *,*:before,*:after{
    transition:none!important;
    animation-duration:.01ms!important;
  }
}

/* TABLET */

@media(max-width:1000px){
  .recovery-main{
    padding-left:25px;
    padding-right:25px;
  }

  .recovery-layout{
    max-width:900px;
    grid-template-columns:minmax(0,.95fr) minmax(390px,1.05fr);
  }

  .info-panel{
    padding:48px 38px 34px;
  }

  .info-content h1{
    font-size:35px;
  }

  .info-description{
    font-size:14px;
  }

  .form-panel{
    padding:48px 40px;
  }
}

/* MÓVIL */

@media(max-width:760px){
  .recovery-page{
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

  .recovery-main{
    flex:1;
    width:100%;
    min-height:calc(100dvh - 68px);
    align-items:center;
    padding:14px 15px 36px;
  }

  .recovery-layout{
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

  .info-panel{
    display:none;
  }

  .form-panel{
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

  .recovery-form{
    gap:19px;
  }

  .input-wrapper input{
    height:54px;
    font-size:16px; /* evita el zoom automático en iOS */
  }

  .primary-button{
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

  .recovery-main{
    min-height:calc(100dvh - 62px);
    align-items:flex-start;
    padding:14px 11px 26px;
  }

  .recovery-layout{
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

  .input-wrapper input{
    padding-left:44px;
  }

  .login-link{
    flex-wrap:wrap;
  }
}

/* MÓVILES PEQUEÑOS */

@media(max-width:360px){
  .topbar{
    padding:0 10px;
  }

  .recovery-main{
    padding-left:8px;
    padding-right:8px;
  }

  .form-container{
    padding:24px 16px 21px;
  }

  .form-header h2{
    font-size:25px;
  }

  .form-footer{
    font-size:11px;
  }
}

/* PANTALLAS DE POCA ALTURA */

@media(max-height:720px) and (min-width:761px){
  .topbar{
    height:66px;
  }

  .recovery-main{
    padding-top:14px;
    padding-bottom:30px;
  }

  .recovery-layout{
    min-height:540px;
  }

  .info-panel{
    padding-top:40px;
    padding-bottom:30px;
  }

  .steps{
    margin-top:28px;
  }

  .form-panel{
    padding-top:36px;
    padding-bottom:36px;
  }
}
</style>