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
  <div class="new-gym-form">
    <form @submit.prevent="save">
      <!-- Aviso inicial -->
      <div class="info-box">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 11v5M12 8h.01"/>
        </svg>
        <p>{{ tx('Crearás una cuenta independiente de gimnasio y su primera sede. El nuevo propietario podrá iniciar sesión con el correo y la contraseña que captures.','You will create an independent gym account and its first branch. The new owner can log in with these credentials.') }}</p>
      </div>

      <!-- ================= GIMNASIO ================= -->
      <section class="form-section">
        <div class="section-title">
          <div class="section-number">01</div>
          <div>
            <h3>{{ tx('Gimnasio y propietario','Gym and owner') }}</h3>
            <p>{{ tx('Nombre del gimnasio y de quien lo administrará.','Gym name and who will manage it.') }}</p>
          </div>
        </div>

        <div class="fields-grid">
          <div class="field">
            <label for="gym-name">{{ tx('Nombre del gimnasio','Gym name') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>
                </svg>
              </div>
              <input id="gym-name" v-model.trim="form.nombre" required minlength="2" maxlength="180" :placeholder="tx('Ej. Iron Fitness','E.g. Iron Fitness')">
            </div>
          </div>

          <div class="field">
            <label for="gym-owner">{{ tx('Nombre del propietario','Owner name') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 21a8 8 0 0 1 16 0"/>
                </svg>
              </div>
              <input id="gym-owner" v-model.trim="form.propietario" required minlength="2" maxlength="180">
            </div>
          </div>
        </div>
      </section>

      <!-- ================= CUENTA ================= -->
      <section class="form-section">
        <div class="section-title">
          <div class="section-number">02</div>
          <div>
            <h3>{{ tx('Cuenta de acceso','Access account') }}</h3>
            <p>{{ tx('Con estos datos el propietario iniciará sesión.','The owner will log in with these credentials.') }}</p>
          </div>
        </div>

        <div class="fields-grid">
          <div class="field field-large">
            <label for="gym-email">{{ tx('Correo de la nueva cuenta','New account email') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-10 6L2 7"/>
                </svg>
              </div>
              <input id="gym-email" v-model.trim="form.email" required type="email" autocomplete="off">
            </div>
          </div>

          <div class="field">
            <label for="gym-pass">{{ tx('Contraseña de la nueva cuenta','New account password') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input id="gym-pass" v-model="form.password" required minlength="10" :type="showPassword?'text':'password'" autocomplete="new-password">
            </div>
          </div>

          <div class="field">
            <label for="gym-pass2">{{ tx('Confirmar contraseña','Confirm password') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input id="gym-pass2" v-model="form.password_confirmation" required minlength="10" :type="showPassword?'text':'password'" autocomplete="new-password">
            </div>
          </div>

          <label class="check field-large">
            <input v-model="showPassword" type="checkbox">
            <span class="check-box"></span>
            <span>{{ tx('Mostrar contraseñas','Show passwords') }}</span>
          </label>
        </div>
      </section>

      <!-- ================= SEDE ================= -->
      <section class="form-section">
        <div class="section-title">
          <div class="section-number">03</div>
          <div>
            <h3>{{ tx('Primera sede','First branch') }}</h3>
            <p>{{ tx('Nombre y ubicación general de la sede.','Branch name and general location.') }}</p>
          </div>
        </div>

        <div class="fields-grid">
          <div class="field field-large">
            <label for="gym-branch">{{ tx('Nombre de la primera sede','First branch name') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 9l1-5h16l1 5M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>
                </svg>
              </div>
              <input id="gym-branch" v-model.trim="form.sede" required minlength="2" maxlength="180" :placeholder="tx('Ej. Sede Centro','E.g. Downtown branch')">
            </div>
          </div>

          <div class="field">
            <label for="gym-state">{{ tx('Estado','State') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/>
                  <path d="M9 3v15M15 6v15"/>
                </svg>
              </div>
              <input id="gym-state" v-model.trim="form.entidad" required maxlength="150">
            </div>
          </div>

          <div class="field">
            <label for="gym-city">{{ tx('Municipio','City / Municipality') }}</label>
            <div class="input-control">
              <div class="field-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
                  <circle cx="12" cy="10" r="2.5"/>
                </svg>
              </div>
              <input id="gym-city" v-model.trim="form.municipio" required maxlength="150">
            </div>
          </div>
        </div>
      </section>

      <!-- Nota final -->
      <div class="info-box note">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 11v5M12 8h.01"/>
        </svg>
        <p>{{ tx('La dirección completa, horarios y precios se terminan de configurar desde la nueva cuenta. Se enviará un aviso de registro por Brevo, pero nunca la contraseña.','Finish address, hours and prices in the new account. A registration notice will be sent via Brevo, but never the password.') }}</p>
      </div>

      <!-- Mensajes -->
      <p v-if="error" class="alert error" role="alert">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v5M12 17h.01"/>
        </svg>
        <span>{{ error }}</span>
      </p>
      <p v-if="success" class="alert success" role="status">
        <svg viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6"/>
        </svg>
        <span>{{ success }}</span>
      </p>

      <!-- ================= FOOTER ================= -->
      <div class="actions">
        <button type="button" class="secondary" :disabled="saving" @click="emit('close')">{{ tx('Cancelar','Cancel') }}</button>
        <button type="submit" class="primary" :disabled="saving">
          <svg v-if="!saving" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span v-else class="spinner"></span>
          {{ saving ? tx('Registrando...','Saving...') : tx('Crear gimnasio','Create gym') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import url('https\://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button, input { font: inherit; }

.new-gym-form {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: rgba(59,130,246,.1);
  --hl-line: rgba(59,130,246,.45);
  --text: var(--color-texto-general, #f5f5f4);
  --card: var(--bg-cards, #111);
  --title: var(--color-titulos, #fff);
  --field: rgba(0,0,0,.28);
  --field-focus: rgba(0,0,0,.36);
  --w3: rgba(255,255,255,.03);
  --w5: rgba(255,255,255,.05);
  --w8: rgba(255,255,255,.08);
  --w14: rgba(255,255,255,.14);
  --w25: rgba(255,255,255,.25);
  --line: var(--w8);
  --line-strong: var(--w14);
  --text-2: rgba(245,245,244,.66);
  --text-3: rgba(245,245,244,.42);
  width: 100%;
  font-family: 'Inter', sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

@supports (background: color-mix(in srgb, red 10%, transparent)) {
  .new-gym-form {
    --hl-soft: color-mix(in srgb, var(--hl) 11%, transparent);
    --hl-line: color-mix(in srgb, var(--hl) 50%, transparent);
    --field: color-mix(in srgb, var(--card) 72%, #000);
    --field-focus: color-mix(in srgb, var(--card) 62%, #000);
    --text-2: color-mix(in srgb, var(--text) 68%, transparent);
    --text-3: color-mix(in srgb, var(--text) 45%, transparent);
    --w3: color-mix(in srgb, var(--text) 3%, transparent);
    --w5: color-mix(in srgb, var(--text) 5%, transparent);
    --w8: color-mix(in srgb, var(--text) 8%, transparent);
    --w14: color-mix(in srgb, var(--text) 14%, transparent);
    --w25: color-mix(in srgb, var(--text) 25%, transparent);
  }
}

/* ============ AVISOS ============ */
.info-box {
  margin: 0;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 14px;
}
.info-box svg { width: 20px; height: 20px; flex: none; margin-top: 1px; fill: none; stroke: var(--hl); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.info-box p { margin: 0; color: var(--text-2); font-size: 13px; line-height: 1.6; }
.info-box.note { margin-top: 24px; background: var(--w3); border-color: var(--line); }
.info-box.note svg { stroke: var(--text-3); }
.info-box.note p { color: var(--text-3); font-size: 12.5px; }

/* ============ SECCIONES ============ */
.form-section { padding: 26px 0; border-bottom: 1px solid var(--line); }
.form-section:first-of-type { padding-top: 24px; }
.section-title { margin-bottom: 18px; display: flex; align-items: center; gap: 13px; }
.section-number {
  width: 34px;
  height: 34px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.section-title h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; }
.section-title p { margin: 3px 0 0; color: var(--text-3); font-size: 12.5px; }

/* ============ CAMPOS ============ */
.fields-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field-large { grid-column: 1 / -1; }
.field { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.field > label {
  color: var(--text-2);
  font-family: 'Oswald', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .6px;
  text-transform: uppercase;
}
.input-control { position: relative; width: 100%; }
.input-control input {
  width: 100%;
  height: 50px;
  padding: 0 14px 0 46px;
  outline: none;
  color: var(--color-texto-input, var(--text));
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  font-size: 14px;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.input-control input:hover { border-color: var(--w25); }
.input-control input::placeholder { color: rgba(245,245,244,.28); }
.input-control input:focus { border-color: var(--hl); background: var(--field-focus); box-shadow: 0 0 0 4px var(--hl-soft); }
.field-icon { position: absolute; z-index: 2; top: 50%; left: 15px; transform: translateY(-50%); width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: var(--text-3); pointer-events: none; transition: color .2s; }
.field-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.input-control:focus-within .field-icon { color: var(--hl); }

/* Casilla "Mostrar contraseñas" */
.check { display: inline-flex; align-items: center; gap: 10px; width: fit-content; cursor: pointer; color: var(--text-2); font-size: 13px; font-weight: 600; user-select: none; }
.check input { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
.check-box { position: relative; width: 20px; height: 20px; flex: none; background: var(--field); border: 1px solid var(--line-strong); border-radius: 6px; transition: .2s ease; }
.check-box::after { content: ''; position: absolute; top: 3px; left: 6.5px; width: 5px; height: 10px; border: solid var(--title); border-width: 0 2px 2px 0; transform: rotate(45deg) scale(0); transition: transform .15s ease; }
.check:hover .check-box { border-color: var(--hl); }
.check input:checked + .check-box { background: var(--hl); border-color: var(--hl); }
.check input:checked + .check-box::after { transform: rotate(45deg) scale(1); }
.check input:focus-visible + .check-box { box-shadow: 0 0 0 4px var(--hl-soft); border-color: var(--hl); }

/* ============ ALERTAS ============ */
.alert { margin: 18px 0 0; padding: 12px 14px; display: flex; align-items: flex-start; gap: 10px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
.alert svg { width: 18px; height: 18px; flex: none; margin-top: 1px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.alert.error { color: #f87171; background: rgba(239,68,68,.09); border: 1px solid rgba(239,68,68,.3); }
.alert.success { color: #34d399; background: rgba(16,185,129,.09); border: 1px solid rgba(16,185,129,.28); }

/* ============ FOOTER ============ */
.actions { padding-top: 22px; display: flex; align-items: center; justify-content: flex-end; gap: 11px; }
.actions button {
  height: 48px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  cursor: pointer;
  border-radius: 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 15px;
  font-weight: 600;
  transition: .2s ease;
}
.secondary { color: var(--text-2); background: transparent; border: 1px solid var(--line-strong); }
.secondary:hover:not(:disabled) { color: var(--title); background: var(--w5); }
.primary {
  min-width: 190px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, #1c4fd6);
  border: 0;
  box-shadow: 0 8px 22px rgba(28,79,214,.28);
}
.primary svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; stroke-linejoin: round; }
.primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); box-shadow: 0 12px 28px rgba(28,79,214,.38); }
.actions button:disabled { opacity: .6; cursor: not-allowed; }
.actions button:focus-visible { outline: 2px solid var(--hl); outline-offset: 3px; }

.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: currentColor; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after { transition: none !important; animation-duration: .01ms !important; }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 650px) {
  .fields-grid { grid-template-columns: 1fr; gap: 18px; }
  .field-large { grid-column: auto; }
  /* 16px evita el zoom automático de iOS */
  .input-control input { height: 52px; font-size: 16px; }
  .actions { flex-direction: column-reverse; gap: 10px; }
  .actions button { width: 100%; height: 52px; }
  .section-number { width: 30px; height: 30px; }
}
</style>