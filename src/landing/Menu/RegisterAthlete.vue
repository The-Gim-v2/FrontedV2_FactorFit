<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import NoGymModal from './NoGymModal.vue';
import NotificationSystem from '../../components/Modals/NotificationSystem.vue';
type Sucursal = { ID_Gym: number; ID_Sede: number; Nombre_Gym: string; Nombre_Sede: string; Ciudad?: string; Estado?: string; Direccion?: string };
type Tarifa = { ID_Precio: number; Nombre_Paquete: string; Precio: number; Periodo?: string };
type CampoNombre = 'nombres' | 'apellidoP' | 'apellidoM';
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const gymSearchInput = ref<HTMLInputElement | null>(null);
const gymPickerRef = ref<HTMLElement | null>(null);
const foto = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const showPassword = ref(false), showConfirmPassword = ref(false), showNoGymModal = ref(false);
const isGymDropdownOpen = ref(false), gymSearch = ref(''), selectedGym = ref<Sucursal | null>(null);
const sucursales = ref<Sucursal[]>([]), tarifas = ref<Tarifa[]>([]), selectedTarifa = ref<number | null>(null);
const loadingGyms = ref(false), loadingTarifas = ref(false), guardando = ref(false);
const mensaje = ref(''), registroExitoso = ref(false), errorSucursales = ref('');
const form = reactive({ nombres: '', apellidoP: '', apellidoM: '', curp: '', fechaNac: '', celular: '', email: '', password: '', confirmPassword: '', peso: '', altura: '' });
const filteredGyms = computed(() => { const q = gymSearch.value.trim().toLocaleLowerCase(); return sucursales.value.filter(s => `${s.Nombre_Gym} ${s.Nombre_Sede} ${s.Ciudad || ''} ${s.Estado || ''}`.toLocaleLowerCase().includes(q)); });
const tarifaElegida = computed(() => tarifas.value.find(p => Number(p.ID_Precio) === selectedTarifa.value) || null);
const notify = (msg: string, type: 'success' | 'warning' | 'error' = 'warning') => { mensaje.value = msg; toastRef.value?.notify(msg, type); };
const nombreTitulo = (valor: string) => String(valor ?? '').toLocaleLowerCase('es-MX').replace(/(^|[\s'-])([\p{L}])/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es-MX'));
function normalizarCampo(campo: CampoNombre) { form[campo] = nombreTitulo(form[campo]); }
function normalizarCorreo() { form.email = form.email.trim().toLowerCase(); }
function limpiarCurp() { form.curp = String(form.curp).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18); }
const validarCurp = (valor: string) => {
  const curp = valor.trim().toUpperCase();
  if (curp.length !== 18) return 'La CURP debe tener exactamente 18 caracteres.';
  if (!/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp)) return 'El formato de la CURP no es válido.';
  const mes = Number(curp.slice(6,8)), dia = Number(curp.slice(8,10));
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return 'La CURP contiene una fecha no válida.';
  return '';
};
const errorCurp = computed(() => form.curp ? validarCurp(form.curp) : '');
const soloNumeros = (v: string) => String(v || '').replace(/\D/g, '');
const formatearCelular = (v: string) => { const n = soloNumeros(v).slice(0,10); return n.length <= 3 ? n : n.length <= 6 ? `${n.slice(0,3)} ${n.slice(3)}` : `${n.slice(0,3)} ${n.slice(3,6)} ${n.slice(6)}`; };
function actualizarCelular(event: Event) { const input = event.target as HTMLInputElement; const raw = input.value; if (raw.includes('+') || soloNumeros(raw).length > 10) { notify('El celular debe tener 10 dígitos, sin +52.', 'warning'); input.value = form.celular; return; } form.celular = formatearCelular(raw); input.value = form.celular; }
function pegarCelular(event: ClipboardEvent) { const valor = event.clipboardData?.getData('text') || ''; if (valor.includes('+') || soloNumeros(valor).length > 10) { event.preventDefault(); notify('Ingresa solamente 10 dígitos, sin +52.', 'warning'); } }
const limitarMedida = (value: string, decimal = false) => { const partes = String(value || '').replace(',', '.').replace(/[^0-9.]/g,'').split('.'); const entero = (partes[0] ?? '').slice(0,3); return decimal && partes.length > 1 ? entero + '.' + (partes[1] || '').slice(0,1) : entero; };
function normalizarPeso(event: Event) { form.peso = limitarMedida((event.target as HTMLInputElement).value, true); (event.target as HTMLInputElement).value = form.peso; }
function normalizarAltura(event: Event) { form.altura = limitarMedida((event.target as HTMLInputElement).value); (event.target as HTMLInputElement).value = form.altura; }
function rellenarEjemplo() {
  // Datos ilustrativos. No son identidad ni contacto de una persona real.
  Object.assign(form, { nombres:'Luis', apellidoP:'Posada', apellidoM:'Lopez', curp:'LOPL010515HSLPRS09', fechaNac:'2001-05-15', celular:'481 000 0000', email:'luis.posada@ejemplo.test', password:'DemoFactorFit2026!', confirmPassword:'DemoFactorFit2026!', peso:'72.5', altura:'175' });
  notify('Datos ficticios cargados; sustituye CURP, correo y celular por los tuyos antes de registrarte.', 'success');
}
async function jsonGet(url: string) { const res = await fetch(`${API}${url}`, { headers: { Accept: 'application/json' } }); const data = await res.json().catch(() => null); if (!res.ok) throw new Error(data?.message || `Error HTTP ${res.status}`); return data; }
async function cargarSucursales() { loadingGyms.value = true; errorSucursales.value = ''; try { const data = await jsonGet('/api/public/sucursales'); sucursales.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []); } catch(e) { errorSucursales.value = e instanceof Error ? e.message : 'No se pudieron cargar las sucursales.'; notify(errorSucursales.value, 'error'); } finally { loadingGyms.value = false; } }
async function selectGym(gym: Sucursal) { selectedGym.value = gym; selectedTarifa.value = null; tarifas.value = []; gymSearch.value = ''; isGymDropdownOpen.value = false; loadingTarifas.value = true; try { const data = await jsonGet(`/api/public/sucursales/${gym.ID_Sede}/tarifas`); tarifas.value = Array.isArray(data) ? data : (data?.data || []); } catch(e) { notify(e instanceof Error ? e.message : 'No se pudieron cargar las tarifas.', 'error'); } finally { loadingTarifas.value = false; } }
function clearGym() { selectedGym.value = null; selectedTarifa.value = null; tarifas.value = []; }
function triggerFileInput() { fileInput.value?.click(); }
function onFileSelected(event: Event) { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size >= 3 * 1024 * 1024) { notify('La fotografía debe ser JPG, PNG o WebP y pesar menos de 3 MB.', 'warning'); input.value=''; return; } if (previewImage.value) URL.revokeObjectURL(previewImage.value); foto.value = file; previewImage.value = URL.createObjectURL(file); }
async function onAddGym() { showNoGymModal.value = false; await nextTick(); gymPickerRef.value?.scrollIntoView({ behavior:'smooth', block:'center' }); isGymDropdownOpen.value = true; gymSearchInput.value?.focus(); }
async function handleRegisterClick() {
  if (guardando.value) return;
  normalizarCampo('nombres'); normalizarCampo('apellidoP'); normalizarCampo('apellidoM'); normalizarCorreo(); limpiarCurp();
  if (!form.nombres || !form.apellidoP || !form.fechaNac || !form.email || !form.celular) return notify('Completa los datos personales obligatorios.');
  if (validarCurp(form.curp)) return notify(validarCurp(form.curp));
  if (soloNumeros(form.celular).length !== 10) return notify('El celular debe tener exactamente 10 dígitos.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return notify('Ingresa un correo electrónico válido.');
  if (form.peso && (!/^\d{1,3}(\.\d)?$/.test(form.peso) || Number(form.peso) <= 0 || Number(form.peso) > 999.9)) return notify('El peso debe ser de máximo 3 dígitos y un decimal.');
  if (form.altura && (!/^\d{1,3}$/.test(form.altura) || Number(form.altura) < 50 || Number(form.altura) > 300)) return notify('La altura debe estar entre 50 y 300 cm.');
  if (form.password.length < 8) return notify('La contraseña debe tener al menos 8 caracteres.');
  if (form.password !== form.confirmPassword) return notify('Las contraseñas no coinciden.');
  if (!selectedGym.value) { showNoGymModal.value = true; return; }
  if (!selectedTarifa.value) return notify('Selecciona una tarifa.');
  guardando.value = true; mensaje.value = '';
  try {
    const data = new FormData();
    const fields: Record<string, string | number> = { sede_id: selectedGym.value.ID_Sede, id_precio: selectedTarifa.value, nombres:form.nombres, apellidoP:form.apellidoP, apellidoM:form.apellidoM, curp:form.curp, fechaNacimiento:form.fechaNac, celular:soloNumeros(form.celular), email:form.email, password:form.password, password_confirmation:form.confirmPassword };
    for (const [key, value] of Object.entries(fields)) if (String(value)) data.append(key, String(value));
    if (form.peso) data.append('peso',form.peso);
    if (form.altura) data.append('altura',form.altura);
    if (foto.value) data.append('foto',foto.value);
    const res = await fetch(`${API}/api/public/registro`, { method:'POST', headers:{Accept:'application/json'}, body:data });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) { const errors = result?.errors ? Object.values(result.errors).flat().join(' ') : ''; throw new Error(errors || result?.message || `Error HTTP ${res.status}`); }
    registroExitoso.value = true; notify(result?.message || 'Registro completado. Tu membresía está pendiente de activación.','success');
  } catch(e) { notify(e instanceof Error ? e.message : 'No se pudo completar el registro.', 'error'); } finally { guardando.value = false; }
}
onMounted(() => { void cargarSucursales(); });
onBeforeUnmount(() => { if (previewImage.value) URL.revokeObjectURL(previewImage.value); });
</script>
<template>
<div class="register-page"><div class="photo-bg"></div><div class="photo-overlay"></div>
<NotificationSystem ref="toastRef" />
<NoGymModal v-if="showNoGymModal" rol="atleta" @add="onAddGym" @close="showNoGymModal = false" />
<header class="topbar"><router-link :to="{ name: 'home' }" class="brand"><img src="../../assets/factor_fit-25.webp" alt="Factor Fit" class="brand-logo"/><span>FACTOR FIT</span></router-link><router-link :to="{ name: 'login' }" class="back-link"><span>Volver a iniciar sesión</span></router-link></header>
<main class="main-content"><div class="register-card"><div class="header-section"><h1 class="title">Regístrate a <span>Factor Fit</span></h1><p>Elige tu sucursal y crea tu cuenta para empezar a entrenar</p><button type="button" class="demo-fill" @click="rellenarEjemplo">Rellenar datos de ejemplo</button></div>
<div v-if="registroExitoso" class="success-box"><h2>Solicitud registrada</h2><p>{{ mensaje }}</p><router-link :to="{ name: 'login' }">Ir a iniciar sesión</router-link></div>
<form v-else @submit.prevent="handleRegisterClick"><div class="rg-grid"><div class="form-column"><h3 class="section-title first">Fotografía</h3><div class="upload-container"><div class="image-preview" role="button" tabindex="0" @click="triggerFileInput" @keydown.enter="triggerFileInput"><img v-if="previewImage" :src="previewImage" class="profile-img" alt="Vista previa"/><div v-else class="upload-placeholder"><span>Subir foto</span></div></div><input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onFileSelected"/><p>Sube una fotografía reciente (JPG, PNG o WebP, menos de 3 MB)</p></div>
<h3 class="section-title">Datos personales</h3><div class="fields"><div class="field"><label>Nombre(s)</label><input v-model="form.nombres" @input="normalizarCampo('nombres')" required maxlength="150" placeholder="Luis"/></div><div class="field-row"><div class="field"><label>Apellido paterno</label><input v-model="form.apellidoP" @input="normalizarCampo('apellidoP')" required maxlength="150" placeholder="Posada"/></div><div class="field"><label>Apellido materno</label><input v-model="form.apellidoM" @input="normalizarCampo('apellidoM')" maxlength="150" placeholder="Lopez"/></div></div><div class="field"><label>CURP</label><input v-model="form.curp" @input="limpiarCurp" type="text" maxlength="18" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase" placeholder="ABCD010101HDFXXX00" required/><small v-if="errorCurp" class="field-note invalid">{{ errorCurp }}</small><small v-else-if="form.curp.length === 18" class="field-note">CURP con formato válido (sin consulta oficial).</small><a class="curp-link" href="https://www.gob.mx/curp/" target="_blank" rel="noopener noreferrer">Consultar mi CURP</a></div><div class="field-row"><div class="field"><label>Fecha de nacimiento</label><input v-model="form.fechaNac" type="date" required/></div><div class="field"><label>Teléfono celular</label><input  :value="form.celular" @input="actualizarCelular" @paste="pegarCelular" @keydown.plus.prevent type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="481 000 0000" required maxlength="12"/></div></div><div class="field-row"><div class="field"><label>Peso (kg) <small>Opcional</small></label><input v-model="form.peso" @input="normalizarPeso" type="text" inputmode="decimal" maxlength="5" placeholder="72.5"/></div><div class="field"><label>Altura (cm) <small>Opcional</small></label><input v-model="form.altura" @input="normalizarAltura" type="text" inputmode="numeric" maxlength="3" placeholder="175"/></div></div></div></div>
<div class="form-column"><h3 class="section-title first">Cuenta de acceso</h3><div class="fields"><div class="field"><label>Correo electrónico</label><input v-model="form.email" @blur="normalizarCorreo" placeholder="ejemplo@gmail.com" type="email" required maxlength="255" autocomplete="email"/></div><div class="field-row"><div class="field"><label>Contraseña</label><div class="password-field"><input v-model="form.password" :type="showPassword ? 'text' : 'password'" required minlength="8" autocomplete="new-password"/><button type="button" @click="showPassword = !showPassword">{{ showPassword ? 'Ocultar' : 'Ver' }}</button></div></div><div class="field"><label>Confirmar contraseña</label><div class="password-field"><input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required minlength="8" autocomplete="new-password"/><button type="button" @click="showConfirmPassword = !showConfirmPassword">{{ showConfirmPassword ? 'Ocultar' : 'Ver' }}</button></div></div></div></div>
<h3 class="section-title">Tu sucursal</h3><div ref="gymPickerRef" class="gym-picker"><div v-if="!selectedGym" class="field"><label>Buscar sucursal</label><input ref="gymSearchInput" v-model="gymSearch" placeholder="Nombre o ciudad de la sucursal..." autocomplete="off" @focus="isGymDropdownOpen = true"/></div><div v-if="!selectedGym && isGymDropdownOpen" class="gym-dropdown"><button v-for="gym in filteredGyms" :key="gym.ID_Sede" type="button" class="gym-option" @click="selectGym(gym)"><span><strong>{{ gym.Nombre_Gym }} — {{ gym.Nombre_Sede }}</strong><small>{{ gym.Ciudad || '' }} {{ gym.Estado || '' }}</small></span></button><div v-if="loadingGyms" class="gym-empty">Cargando sucursales...</div><div v-else-if="errorSucursales" class="gym-empty">{{ errorSucursales }} <button type="button" @click="cargarSucursales">Reintentar</button></div><div v-else-if="!filteredGyms.length" class="gym-empty">No se encontraron sucursales.</div></div><div v-if="selectedGym" class="selected-gym"><div><strong>{{ selectedGym.Nombre_Gym }} — {{ selectedGym.Nombre_Sede }}</strong><span>{{ selectedGym.Direccion || '' }} · {{ selectedGym.Ciudad || '' }}</span></div><button type="button" @click="clearGym">Cambiar</button></div></div>
<div v-if="selectedGym" class="membership"><label>Tipo de membresía</label><p v-if="loadingTarifas">Cargando tarifas...</p><div v-else class="membership-options"><button v-for="p in tarifas" :key="p.ID_Precio" type="button" class="membership-option" :class="{ active: selectedTarifa === Number(p.ID_Precio) }" @click="selectedTarifa = Number(p.ID_Precio)"><span><strong>{{ p.Nombre_Paquete }}</strong><small>{{ p.Periodo || 'Membresía' }}</small></span><b>${{ Number(p.Precio).toFixed(2) }}</b></button><p v-if="!tarifas.length">Esta sucursal no tiene tarifas disponibles.</p></div><p v-if="tarifaElegida">Seleccionaste: {{ tarifaElegida.Nombre_Paquete }}</p></div>
<div class="actions"><p v-if="mensaje" role="alert" class="form-message">{{ mensaje }}</p><button type="submit" class="submit-btn" :disabled="guardando || loadingTarifas || !selectedGym || !selectedTarifa">{{ guardando ? 'Registrando...' : 'Registrarme' }}</button><p class="login-link">¿Ya tienes cuenta? <router-link :to="{ name: 'login' }">Inicia sesión</router-link></p></div></div></div></form></div></main></div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.demo-fill{margin-top:14px;padding:9px 14px;border-radius:10px;border:1px solid rgba(233,176,138,.45);background:rgba(233,176,138,.09);color:#e9b08a;font-weight:700;cursor:pointer;}
.demo-fill:hover{background:rgba(233,176,138,.18);}
.field-note{font-size:11px;color:#76dfb4;} .field-note.invalid{color:#ffb36c;} .curp-link{font-size:11px;color:#e9b08a;text-decoration:underline;}

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
.form-message{color:#ffb5c5;font-size:13px}.success-box{text-align:center;padding:30px;border:1px solid rgba(233,176,138,.3);border-radius:16px}.success-box a{color:#e9b08a}.submit-btn:disabled{opacity:.6;cursor:wait}.password-field button{width:auto;padding:0 12px;font-size:12px;color:#e9b08a}
</style>
