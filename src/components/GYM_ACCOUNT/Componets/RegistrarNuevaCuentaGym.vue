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
<p class="hint">{{ tx('Crearás una cuenta independiente de gimnasio y su primera sede. El nuevo propietario podrá iniciar sesión con el correo y la contraseña que captures.','You will create an independent gym account and its first branch. The new owner can log in with these credentials.') }}</p>
<form @submit.prevent="save">
<div class="new-gym-grid">
<label>{{tx('Nombre del gimnasio','Gym name')}}<input v-model.trim="form.nombre" required minlength="2" maxlength="180" :placeholder="tx('Ej. Iron Fitness','E.g. Iron Fitness')"></label>
<label>{{tx('Nombre del propietario','Owner name')}}<input v-model.trim="form.propietario" required minlength="2" maxlength="180"></label>
<label>{{tx('Correo de la nueva cuenta','New account email')}}<input v-model.trim="form.email" required type="email" autocomplete="off"></label>
<label>{{tx('Contraseña de la nueva cuenta','New account password')}}<input v-model="form.password" required minlength="10" :type="showPassword?'text':'password'" autocomplete="new-password"></label>
<label>{{tx('Confirmar contraseña','Confirm password')}}<input v-model="form.password_confirmation" required minlength="10" :type="showPassword?'text':'password'" autocomplete="new-password"></label>
<label class="check"><input v-model="showPassword" type="checkbox">{{tx('Mostrar contraseñas','Show passwords')}}</label>
<label>{{tx('Nombre de la primera sede','First branch name')}}<input v-model.trim="form.sede" required minlength="2" maxlength="180" :placeholder="tx('Ej. Sede Centro','E.g. Downtown branch')"></label>
<label>{{tx('Estado','State')}}<input v-model.trim="form.entidad" required maxlength="150"></label>
<label>{{tx('Municipio','City / Municipality')}}<input v-model.trim="form.municipio" required maxlength="150"></label>
</div>
<p class="hint">{{tx('La dirección completa, horarios y precios se terminan de configurar desde la nueva cuenta. Se enviará un aviso de registro por Brevo, pero nunca la contraseña.','Finish address, hours and prices in the new account. A registration notice will be sent via Brevo, but never the password.')}}</p>
<p v-if="error" class="alert error" role="alert">{{error}}</p><p v-if="success" class="alert success">{{success}}</p>
<div class="actions"><button type="button" class="secondary" :disabled="saving" @click="emit('close')">{{tx('Cancelar','Cancel')}}</button><button type="submit" class="primary" :disabled="saving">{{saving?tx('Registrando...','Saving...'):tx('Crear gimnasio','Create gym')}}</button></div>
</form>
</div>
</template>
<style scoped>
.new-gym-form{color:var(--color-texto-general,#edeaf4);font-family:Inter,Arial,sans-serif}.hint{font-size:12px;line-height:1.6;opacity:.75;margin:0 0 18px}.new-gym-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.new-gym-grid label{font-size:12px;font-weight:700;display:flex;flex-direction:column;gap:7px}.new-gym-grid input:not([type=checkbox]){background:var(--bg-input,#202032);border:1px solid var(--border-input,#49465d);color:inherit;border-radius:10px;padding:12px;min-width:0;outline:none}.new-gym-grid input:focus{border-color:#e04f7a}.check{display:flex!important;flex-direction:row!important;align-items:center;gap:8px!important;align-self:end;margin-bottom:12px}.alert{font-size:13px;padding:10px 12px;margin-top:14px;border-radius:9px}.error{color:#ff9aa6;background:#511d3033;border:1px solid #e24b70}.success{color:#71e6b1;background:#214b3a55}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.actions button{border-radius:9px;padding:11px 18px;cursor:pointer;font-weight:700;border:1px solid #605b6d;color:inherit}.secondary{background:transparent}.primary{background:#df4770;border-color:#df4770!important;color:#fff!important}.actions button:disabled{opacity:.6;cursor:not-allowed}@media(max-width:650px){.new-gym-grid{grid-template-columns:1fr}}
</style>
