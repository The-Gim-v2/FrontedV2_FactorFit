<script setup lang="ts">
import { reactive,ref,computed } from 'vue';
const emit=defineEmits<{(e:'close'):void;(e:'created',value:{ID_Gym:number;ID_Sede:number}):void}>();
const idioma=ref(localStorage.getItem('GYM_ACCOUNT-idioma')||'es');
const en=computed(()=>idioma.value==='en');
const tx=(es:string,english:string)=>en.value?english:es;
const form=reactive({nombre:'',propietario:'',email:'',password:'',password_confirmation:'',sede:'',entidad:'',municipio:''});
const saving=ref(false);const error=ref('');const success=ref('');const showPassword=ref(false);
const API=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');
const save=async()=>{
if(saving.value)return;error.value='';success.value='';
if(form.password.length<10){error.value=tx('La contraseña debe tener al menos 10 caracteres.','Password must be at least 10 characters.');return;}
if(form.password!==form.password_confirmation){error.value=tx('Las contraseñas no coinciden.','Passwords do not match.');return;}
const token=sessionStorage.getItem('auth_token')||localStorage.getItem('auth_token')||'';
if(!token){error.value=tx('No hay una sesión activa.','No active session.');return;}
saving.value=true;
try{const response=await fetch(`${API}/api/gym/cuentas`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Authorization:`Bearer ${token.replace(/^Bearer\s+/i,'')}`},body:JSON.stringify({...form,email:form.email.trim().toLowerCase()})});
const body=await response.json().catch(()=>({}));if(!response.ok){const errors=Object.values(body.errors||{}).flat();throw new Error(String(errors[0]||body.message||`HTTP ${response.status}`));}
success.value=tx('Gimnasio registrado.','Gym registered.');window.dispatchEvent(new CustomEvent('factorfit:gyms-updated',{detail:body}));emit('created',{ID_Gym:Number(body.ID_Gym),ID_Sede:Number(body.ID_Sede)});emit('close');
}catch(e){error.value=e instanceof Error?e.message:tx('No se pudo registrar el gimnasio.','Could not register gym.');}finally{saving.value=false;}
};
</script>

<template>
  <div class="ng">
    <form class="ng-form" @submit.prevent="save">

      <!-- Aviso inicial -->
      <div class="ng-notice">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
        <p>{{ tx('Crearás una cuenta independiente de gimnasio y su primera sede. El nuevo propietario podrá iniciar sesión con el correo y la contraseña que captures.','You will create an independent gym account and its first branch. The new owner can log in with these credentials.') }}</p>
      </div>

      <div class="ng-layout">

        <!-- ============ COLUMNA 1 ============ -->
        <div class="ng-col">
          <h3 class="ng-title first">{{ tx('Tu gimnasio','Your gym') }}</h3>

          <div class="ng-field">
            <label for="gym-name">{{ tx('Nombre del gimnasio','Gym name') }}</label>
            <input id="gym-name" v-model.trim="form.nombre" required minlength="2" maxlength="180" :placeholder="tx('Ej. Iron Fitness','E.g. Iron Fitness')">
          </div>

          <h3 class="ng-title">{{ tx('Primera sede','First branch') }}</h3>

          <div class="ng-field">
            <label for="gym-branch">{{ tx('Nombre de la primera sede','First branch name') }}</label>
            <input id="gym-branch" v-model.trim="form.sede" required minlength="2" maxlength="180" :placeholder="tx('Ej. Sede Centro','E.g. Downtown branch')">
          </div>

          <div class="ng-row">
            <div class="ng-field">
              <label for="gym-state">{{ tx('Estado','State') }}</label>
              <input id="gym-state" v-model.trim="form.entidad" required maxlength="150">
            </div>
            <div class="ng-field">
              <label for="gym-city">{{ tx('Municipio','City / Municipality') }}</label>
              <input id="gym-city" v-model.trim="form.municipio" required maxlength="150">
            </div>
          </div>
        </div>

        <!-- ============ COLUMNA 2 ============ -->
        <div class="ng-col">
          <h3 class="ng-title first">{{ tx('Propietario','Owner') }}</h3>

          <div class="ng-field">
            <label for="gym-owner">{{ tx('Nombre del propietario','Owner name') }}</label>
            <input id="gym-owner" v-model.trim="form.propietario" required minlength="2" maxlength="180">
          </div>

          <h3 class="ng-title">{{ tx('Cuenta de acceso','Access account') }}</h3>

          <div class="ng-field">
            <label for="gym-email">{{ tx('Correo de la nueva cuenta','New account email') }}</label>
            <input id="gym-email" v-model.trim="form.email" required type="email" autocomplete="off">
          </div>

          <div class="ng-row">
            <div class="ng-field">
              <label for="gym-pass">{{ tx('Contraseña de la nueva cuenta','New account password') }}</label>
              <input id="gym-pass" v-model="form.password" required minlength="10" :type="showPassword?'text':'password'" autocomplete="new-password">
            </div>
            <div class="ng-field">
              <label for="gym-pass2">{{ tx('Confirmar contraseña','Confirm password') }}</label>
              <input id="gym-pass2" v-model="form.password_confirmation" required minlength="10" :type="showPassword?'text':'password'" autocomplete="new-password">
            </div>
          </div>

          <label class="ng-check">
            <input v-model="showPassword" type="checkbox">
            <span class="ng-box"></span>
            <span>{{ tx('Mostrar contraseñas','Show passwords') }}</span>
          </label>
        </div>
      </div>

      <!-- Nota final -->
      <p class="ng-hint">{{ tx('La dirección completa, horarios y precios se terminan de configurar desde la nueva cuenta. Se enviará un aviso de registro por Brevo, pero nunca la contraseña.','Finish address, hours and prices in the new account. A registration notice will be sent via Brevo, but never the password.') }}</p>

      <!-- Mensajes -->
      <p v-if="error" class="ng-alert error" role="alert">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 17h.01"/></svg>
        <span>{{ error }}</span>
      </p>
      <p v-if="success" class="ng-alert success" role="status">
        <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
        <span>{{ success }}</span>
      </p>

      <!-- Botones -->
      <div class="ng-actions">
        <button type="button" class="ng-btn secondary" :disabled="saving" @click="emit('close')">{{ tx('Cancelar','Cancel') }}</button>
        <button type="submit" class="ng-btn primary" :disabled="saving">
          <svg v-if="!saving" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          <span v-else class="ng-spinner"></span>
          {{ saving ? tx('Registrando...','Saving...') : tx('Crear gimnasio','Create gym') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import url('https\://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ng, .ng *, .ng *::before, .ng *::after { box-sizing: border-box; }

.ng {
  --accent: var(--color-highlight, #3b82f6);
  --accent-soft: rgba(59,130,246,.1);
  --accent-line: rgba(59,130,246,.4);
  --text: var(--color-texto-general, #f5f5f4);
  --title: var(--color-titulos, #fff);
  --muted: rgba(245,245,244,.62);
  --muted2: rgba(245,245,244,.4);
  --line: rgba(255,255,255,.08);
  --field: rgba(255,255,255,.03);
  --field-line: rgba(255,255,255,.12);
  width: 100%;
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}
@supports (background: color-mix(in srgb, red 10%, transparent)) {
  .ng {
    --accent-soft: color-mix(in srgb, var(--accent) 10%, transparent);
    --accent-line: color-mix(in srgb, var(--accent) 40%, transparent);
    --muted: color-mix(in srgb, var(--text) 62%, transparent);
    --muted2: color-mix(in srgb, var(--text) 40%, transparent);
    --line: color-mix(in srgb, var(--text) 8%, transparent);
    --field: color-mix(in srgb, var(--text) 3%, transparent);
    --field-line: color-mix(in srgb, var(--text) 12%, transparent);
  }
}

.ng-form { display: flex; flex-direction: column; gap: 24px; }

/* ============ AVISO ============ */
.ng-notice {
  padding: 13px 15px;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
  border-radius: 12px;
}
.ng-notice svg { width: 19px; height: 19px; flex: none; margin-top: 1px; fill: none; stroke: var(--accent); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.ng-notice p { margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.6; }

/* ============ LAYOUT EN COLUMNAS ============ */
.ng-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 34px;
  align-items: start;
}
.ng-col { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

.ng-title {
  margin: 14px 0 0;
  padding-bottom: 9px;
  color: var(--accent);
  border-bottom: 1px solid var(--line);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
}
.ng-title.first { margin-top: 0; }

.ng-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }

/* ============ CAMPOS ============ */
.ng-field { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.ng-field label { color: var(--muted); font-size: 12px; font-weight: 600; line-height: 1.35; }
.ng-field input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 14px;
  color: var(--color-texto-input, var(--text));
  background: var(--field);
  border: 1px solid var(--field-line);
  border-radius: 10px;
  outline: none;
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.ng-field input::placeholder { color: var(--muted2); font-weight: 400; }
.ng-field input:hover { border-color: rgba(255,255,255,.2); }
.ng-field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

/* ============ CASILLA ============ */
.ng-check {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  user-select: none;
}
.ng-check input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.ng-box {
  position: relative;
  width: 19px;
  height: 19px;
  flex: none;
  background: var(--field);
  border: 1px solid var(--field-line);
  border-radius: 6px;
  transition: .2s ease;
}
.ng-box::after {
  content: '';
  position: absolute;
  top: 2.5px;
  left: 6px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: transform .15s ease;
}
.ng-check:hover .ng-box { border-color: var(--accent); }
.ng-check input:checked + .ng-box { background: var(--accent); border-color: var(--accent); }
.ng-check input:checked + .ng-box::after { transform: rotate(45deg) scale(1); }
.ng-check input:focus-visible + .ng-box { box-shadow: 0 0 0 3px var(--accent-soft); border-color: var(--accent); }

/* ============ NOTA / ALERTAS ============ */
.ng-hint {
  margin: 0;
  padding-top: 18px;
  color: var(--muted2);
  border-top: 1px solid var(--line);
  font-size: 12px;
  line-height: 1.6;
}
.ng-alert {
  margin: 0;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
}
.ng-alert svg { width: 18px; height: 18px; flex: none; margin-top: 1px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.ng-alert.error { color: #f87171; background: rgba(239,68,68,.09); border: 1px solid rgba(239,68,68,.3); }
.ng-alert.success { color: #34d399; background: rgba(16,185,129,.09); border: 1px solid rgba(16,185,129,.28); }

/* ============ BOTONES ============ */
.ng-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.ng-btn {
  height: 46px;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  transition: background .2s ease, filter .2s ease, transform .2s ease, border-color .2s ease;
}
.ng-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; stroke-linejoin: round; }
.ng-btn.secondary { color: var(--muted); background: transparent; border: 1px solid var(--field-line); }
.ng-btn.secondary:hover:not(:disabled) { color: var(--title); background: var(--field); }
.ng-btn.primary {
  min-width: 190px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, #1c4fd6);
  border: 1px solid transparent;
  box-shadow: 0 8px 22px rgba(28,79,214,.22);
}
.ng-btn.primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.ng-btn:disabled { opacity: .6; cursor: not-allowed; }
.ng-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.ng-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ng-spin .8s linear infinite;
}
@keyframes ng-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .ng *, .ng *::before, .ng *::after { transition: none !important; animation-duration: .01ms !important; }
}

/* ============ TABLET: una columna, filas en pares ============ */
@media (max-width: 900px) {
  .ng-layout { grid-template-columns: minmax(0, 1fr); gap: 22px; }
}

/* ============ MÓVIL ============ */
@media (max-width: 560px) {
  .ng-form { gap: 20px; }
  .ng-row { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  /* 16px evita el zoom automático de iOS */
  .ng-field input { height: 50px; font-size: 16px; }
  .ng-actions { flex-direction: column-reverse; align-items: stretch; }
  .ng-btn { width: 100%; height: 50px; }
  .ng-btn.primary { min-width: 0; }
}
</style>