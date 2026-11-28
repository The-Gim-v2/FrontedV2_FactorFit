<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import NoGymModal from './NoGymModal.vue';
import NotificationSystem from '../../components/Modals/NotificationSystem.vue';

type Sucursal = { ID_Gym: number; ID_Sede: number; Nombre_Gym: string; Nombre_Sede: string; Ciudad?: string; Estado?: string; Direccion?: string };
type Tarifa = { ID_Precio: number; Nombre_Paquete: string; Precio: number; Periodo?: string };
type CampoNombre = 'nombres' | 'apellidoP' | 'apellidoM';

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const TERMINOS_VERSION = '1.0', TERMINOS_PDF_URL = '../../docs/terminos-y-condiciones.pdf';

const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const gymSearchInput = ref<HTMLInputElement | null>(null);
const gymPickerRef = ref<HTMLElement | null>(null);

const foto = ref<File | null>(null);
const previewImage = ref<string | null>(null);
const showPassword = ref(false), showConfirmPassword = ref(false), showNoGymModal = ref(false), aceptaTerminos = ref(false);
const isGymDropdownOpen = ref(false), gymSearch = ref(''), selectedGym = ref<Sucursal | null>(null);
const sucursales = ref<Sucursal[]>([]), tarifas = ref<Tarifa[]>([]), selectedTarifa = ref<number | null>(null);
const loadingGyms = ref(false), loadingTarifas = ref(false), guardando = ref(false);
const mensaje = ref(''), registroExitoso = ref(false), errorSucursales = ref('');

const form = reactive({ nombres: '', apellidoP: '', apellidoM: '', curp: '', fechaNac: '', celular: '', email: '', password: '', confirmPassword: '', peso: '', altura: '' });

const filteredGyms = computed(() => {
  const q = gymSearch.value.trim().toLocaleLowerCase();
  return sucursales.value.filter(s => `${s.Nombre_Gym} ${s.Nombre_Sede} ${s.Ciudad || ''} ${s.Estado || ''}`.toLocaleLowerCase().includes(q));
});
const tarifaElegida = computed(() => tarifas.value.find(p => Number(p.ID_Precio) === selectedTarifa.value) || null);
const notify = (msg: string, type: 'success' | 'warning' | 'error' = 'warning') => { mensaje.value = msg; toastRef.value?.notify(msg, type); };

/* ===== Validación anti-datos falsos y de ejemplo ===== */
const PALABRAS_FALSAS = new Set([
  'test', 'testing', 'prueba', 'pruebas', 'ejemplo', 'ejemplos', 'demo', 'fake', 'falso',
  'asdf', 'asdfg', 'qwer', 'qwerty', 'zxcv', 'xxx', 'xxxx', 'none', 'null', 'na', 'n/a',
  'nombre', 'nombres', 'paterno', 'materno', 'apellido', 'usuario', 'admin', 'cliente',
  'sin nombre', 'desconocido', 'anonimo', 'anónimo', 'abc', 'abcd', 'xyz'
]);
const DOMINIOS_FALSOS = new Set([
  'ejemplo.test', 'ejemplo.com', 'example.com', 'example.org', 'example.net',
  'test.com', 'test.test', 'correo.com', 'mail.test', 'fake.com', 'asdf.com',
  'mailinator.com', 'yopmail.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com'
]);
const TELEFONOS_FALSOS = new Set([
  '4810000000', '0000000000', '1234567890', '0123456789', '9876543210',
  '1111111111', '2222222222', '3333333333', '4444444444', '5555555555',
  '6666666666', '7777777777', '8888888888', '9999999999', '1231231234', '1234512345'
]);
const CURPS_EJEMPLO = new Set(['LOPL010515HSLPRS09', 'ABCD010101HDFXXX00']);
const CLAVES_FALSAS = new Set([
  'demofactorfit2026!', '12345678', '123456789', '1234567890', '00000000',
  '11111111', 'password', 'contrasena', 'contraseña', 'qwertyui', 'abcdefgh', 'admin123'
]);

const esNombreReal = (valor: string, opcional = false) => {
  const limpio = valor.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (!limpio) return opcional;
  if (limpio.length < 2 || limpio.length > 150) return false;
  if (!/^[\p{L}\s.'’-]+$/u.test(limpio)) return false;
  const lower = limpio.toLocaleLowerCase('es-MX');
  if (PALABRAS_FALSAS.has(lower)) return false;
  if (/(.)\1{2,}/i.test(lower.replace(/\s+/g, ''))) return false;
  return true;
};

const esEdadReal = (fecha: string) => {
  const m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const nacimiento = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 12 && edad <= 95;
};

const esCelularReal = (valor: string) => {
  const digits = soloNumeros(valor);
  if (digits.length !== 10) return false;
  if (TELEFONOS_FALSOS.has(digits)) return false;
  if (/^(\d)\1{9}$/.test(digits)) return false;
  if (digits.endsWith('0000000')) return false;
  return true;
};

const esCorreoReal = (correo: string) => {
  const c = correo.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return false;
  if (c === 'luis.posada@ejemplo.test') return false;
  const [local, dominio] = c.split('@');
  if (!local || !dominio) return false;
  if (DOMINIOS_FALSOS.has(dominio)) return false;
  if (PALABRAS_FALSAS.has(local) && dominio.includes('test')) return false;
  return true;
};

const nombreTitulo = (valor: string) => String(valor ?? '').toLocaleLowerCase('es-MX').replace(/(^|[\s'-])([\p{L}])/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es-MX'));
function normalizarCampo(campo: CampoNombre) { form[campo] = nombreTitulo(form[campo]); }
function normalizarCorreo() { form.email = form.email.trim().toLowerCase(); }
function limpiarCurp() { form.curp = String(form.curp).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 18); }

// La CURP trae la fecha (AAMMDD); el carácter 17 es número antes del 2000 y letra desde el 2000
function fechaDesdeCurp() {
  if (validarCurp(form.curp)) return;
  const siglo = /\d/.test(form.curp.charAt(16)) ? '19' : '20';
  const fecha = `${siglo}${form.curp.slice(4, 6)}-${form.curp.slice(6, 8)}-${form.curp.slice(8, 10)}`;
  const d = new Date(`${fecha}T00:00:00Z`);
  if (!Number.isNaN(d.getTime()) && d.toISOString().startsWith(fecha) && d.getTime() <= Date.now()) form.fechaNac = fecha;
}

const validarCurp = (valor: string) => {
  const curp = valor.trim().toUpperCase();
  if (curp.length !== 18) return 'La CURP debe tener exactamente 18 caracteres.';
  if (!/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp)) return 'El formato de la CURP no es válido.';
  if (
    CURPS_EJEMPLO.has(curp) ||
    curp.startsWith('ABCD') ||
    curp.startsWith('AAAA') ||
    curp.startsWith('XXXX') ||
    curp.slice(4, 10) === '010101' ||
    curp.slice(4, 10) === '000000'
  ) {
    return 'La CURP ingresada es de ejemplo. Escribe tu CURP real.';
  }
  const mes = Number(curp.slice(6, 8)), dia = Number(curp.slice(8, 10));
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return 'La CURP contiene una fecha no válida.';
  return '';
};
const errorCurp = computed(() => form.curp ? validarCurp(form.curp) : '');

const soloNumeros = (v: string) => String(v || '').replace(/\D/g, '');
const formatearCelular = (v: string) => {
  const n = soloNumeros(v).slice(0, 10);
  return n.length <= 3 ? n : n.length <= 6 ? `${n.slice(0, 3)} ${n.slice(3)}` : `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
};
function actualizarCelular(event: Event) {
  const input = event.target as HTMLInputElement;
  const raw = input.value;
  if (raw.includes('+') || soloNumeros(raw).length > 10) {
    notify('El celular debe tener 10 dígitos, sin +52.', 'warning');
    input.value = form.celular;
    return;
  }
  form.celular = formatearCelular(raw);
  input.value = form.celular;
}
function pegarCelular(event: ClipboardEvent) {
  const valor = event.clipboardData?.getData('text') || '';
  if (valor.includes('+') || soloNumeros(valor).length > 10) {
    event.preventDefault();
    notify('Ingresa solamente 10 dígitos, sin +52.', 'warning');
  }
}
const limitarMedida = (value: string, decimal = false) => {
  const partes = String(value || '').replace(',', '.').replace(/[^0-9.]/g, '').split('.');
  const entero = (partes[0] ?? '').slice(0, 3);
  return decimal && partes.length > 1 ? entero + '.' + (partes[1] || '').slice(0, 1) : entero;
};
function normalizarPeso(event: Event) { form.peso = limitarMedida((event.target as HTMLInputElement).value, true); (event.target as HTMLInputElement).value = form.peso; }
function normalizarAltura(event: Event) { form.altura = limitarMedida((event.target as HTMLInputElement).value); (event.target as HTMLInputElement).value = form.altura; }

function rellenarEjemplo() {
  // Datos ilustrativos. No son identidad ni contacto de una persona real.
  Object.assign(form, { nombres: 'Luis', apellidoP: 'Posada', apellidoM: 'Lopez', curp: 'LOPL010515HSLPRS09', fechaNac: '2001-05-15', celular: '481 000 0000', email: 'luis.posada@ejemplo.test', password: 'DemoFactorFit2026!', confirmPassword: 'DemoFactorFit2026!', peso: '72.5', altura: '175' });
  notify('Datos de ejemplo cargados solo como guía; sustitúyelos por tus datos reales para registrarte.', 'warning');
}

async function jsonGet(url: string) {
  const res = await fetch(`${API}${url}`, { headers: { Accept: 'application/json' } });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Error HTTP ${res.status}`);
  return data;
}
async function cargarSucursales() {
  loadingGyms.value = true; errorSucursales.value = '';
  try {
    const data = await jsonGet('/api/public/sucursales');
    sucursales.value = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  } catch (e) {
    errorSucursales.value = e instanceof Error ? e.message : 'No se pudieron cargar las sucursales.';
    notify(errorSucursales.value, 'error');
  } finally {
    loadingGyms.value = false;
  }
}
async function selectGym(gym: Sucursal) {
  selectedGym.value = gym; selectedTarifa.value = null; tarifas.value = []; gymSearch.value = ''; isGymDropdownOpen.value = false; loadingTarifas.value = true;
  try {
    const data = await jsonGet(`/api/public/sucursales/${gym.ID_Sede}/tarifas`);
    tarifas.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    notify(e instanceof Error ? e.message : 'No se pudieron cargar las tarifas.', 'error');
  } finally {
    loadingTarifas.value = false;
  }
}
function clearGym() { selectedGym.value = null; selectedTarifa.value = null; tarifas.value = []; }
function triggerFileInput() { fileInput.value?.click(); }
function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size >= 3 * 1024 * 1024) {
    notify('La fotografía debe ser JPG, PNG o WebP y pesar menos de 3 MB.', 'warning');
    input.value = '';
    return;
  }
  if (previewImage.value) URL.revokeObjectURL(previewImage.value);
  foto.value = file;
  previewImage.value = URL.createObjectURL(file);
}
async function onAddGym() {
  showNoGymModal.value = false;
  await nextTick();
  gymPickerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  isGymDropdownOpen.value = true;
  gymSearchInput.value?.focus();
}

async function handleRegisterClick() {
  if (guardando.value) return;
  normalizarCampo('nombres'); normalizarCampo('apellidoP'); normalizarCampo('apellidoM'); normalizarCorreo(); limpiarCurp();

  if (!form.nombres || !form.apellidoP || !form.fechaNac || !form.email || !form.celular) {
    return notify('Completa los datos personales obligatorios.');
  }
  if (!esNombreReal(form.nombres) || !esNombreReal(form.apellidoP) || !esNombreReal(form.apellidoM, true)) {
    return notify('Ingresa tu nombre y apellidos reales, sin números ni textos de ejemplo.');
  }
  if (
    form.nombres.toLowerCase() === 'luis' &&
    form.apellidoP.toLowerCase() === 'posada' &&
    form.apellidoM.toLowerCase() === 'lopez'
  ) {
    return notify('Sustituye los datos de ejemplo por tu nombre real para registrarte.');
  }
  if (validarCurp(form.curp)) return notify(validarCurp(form.curp));
  if (!esEdadReal(form.fechaNac)) return notify('Ingresa una fecha de nacimiento real.');

  // Comprobar que los 6 dígitos AAMMDD de la CURP coincidan con la fecha de nacimiento
  // Comprobar que los 6 dígitos AAMMDD de la CURP coincidan con la fecha de nacimiento
  const matchFecha = form.fechaNac.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchFecha?.[1] && matchFecha[2] && matchFecha[3]) {
    const esperado = matchFecha[1].slice(2) + matchFecha[2] + matchFecha[3];
    if (form.curp.slice(4, 10) !== esperado) {
      return notify('La fecha de tu CURP no coincide con tu fecha de nacimiento.');
    }
  }

  if (!esCelularReal(form.celular)) {
    return notify('Ingresa un número celular real de 10 dígitos, sin +52 (no se permiten números de ejemplo).');
  }
  if (!esCorreoReal(form.email)) {
    return notify('Ingresa un correo electrónico real y válido (no se permiten correos de ejemplo).');
  }
  if (form.peso && (!/^\d{1,3}(\.\d)?$/.test(form.peso) || Number(form.peso) <= 0 || Number(form.peso) > 999.9)) {
    return notify('El peso debe ser de máximo 3 dígitos y un decimal.');
  }
  if (form.altura && (!/^\d{1,3}$/.test(form.altura) || Number(form.altura) < 50 || Number(form.altura) > 300)) {
    return notify('La altura debe estar entre 50 y 300 cm.');
  }
  if (form.password.length < 8 || CLAVES_FALSAS.has(form.password.toLowerCase())) {
    return notify('Usa una contraseña personal de al menos 8 caracteres (no uses contraseñas de ejemplo).');
  }
  if (form.password !== form.confirmPassword) return notify('Las contraseñas no coinciden.');
  if (!selectedGym.value) { showNoGymModal.value = true; return; }
  if (!selectedTarifa.value) return notify('Selecciona una tarifa.');
  if (!aceptaTerminos.value) return notify('Debes leer y aceptar los Términos y Condiciones para registrarte.');

  guardando.value = true; mensaje.value = '';
  try {
    const data = new FormData();
    const fields: Record<string, string | number> = {
      sede_id: selectedGym.value.ID_Sede,
      id_precio: selectedTarifa.value,
      nombres: form.nombres,
      apellidoP: form.apellidoP,
      apellidoM: form.apellidoM,
      curp: form.curp,
      fechaNacimiento: form.fechaNac,
      celular: soloNumeros(form.celular),
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword,
      acepta_terminos: '1',
      terminos_version: TERMINOS_VERSION
    };
    for (const [key, value] of Object.entries(fields)) if (String(value)) data.append(key, String(value));
    if (form.peso) data.append('peso', form.peso);
    if (form.altura) data.append('altura', form.altura);
    if (foto.value) data.append('foto', foto.value);

    const res = await fetch(`${API}/api/public/registro`, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
    const result = await res.json().catch(() => ({}));
    if (res.status === 429) {
      throw new Error('Demasiados intentos de registro. Espera 1 minuto e intenta de nuevo.');
    }
    if (!res.ok) {
      const errors = result?.errors ? Object.values(result.errors).flat().join(' ') : '';
      throw new Error(errors || result?.message || `Error HTTP ${res.status}`);
    }
    registroExitoso.value = true;
    notify(result?.message || 'Registro completado. Te enviamos tu QR al correo; tu membresía está pendiente de activación.', 'success');
  } catch (e) {
    notify(e instanceof Error ? e.message : 'No se pudo completar el registro.', 'error');
  } finally {
    guardando.value = false;
  }
}

onMounted(() => { void cargarSucursales(); });
onBeforeUnmount(() => { if (previewImage.value) URL.revokeObjectURL(previewImage.value); });

/* ===== Registro con Google: solo autocompleta nombre, apellidos y correo ===== */
const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
const googleBtn = ref<HTMLElement | null>(null);
const vieneDeGoogle = ref(false);
const datosRef = ref<HTMLElement | null>(null);
function ponerNombre(nombres: string, apellidos: string) {
  const [paterno = '', ...resto] = apellidos.trim().split(/\s+/);
  form.nombres = nombreTitulo(nombres);
  form.apellidoP = nombreTitulo(paterno);
  form.apellidoM = nombreTitulo(resto.join(' '));
}
function intercambiarNombre() { ponerNombre(`${form.apellidoP} ${form.apellidoM}`.trim(), form.nombres); }
function usarDatosGoogle({ credential }: { credential: string }) {
  try {
    const base64 = (credential.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const u = JSON.parse(new TextDecoder().decode(bytes));
    let nombres = String(u.given_name || '').trim(), apellidos = String(u.family_name || '').trim();
    const simple = (v: string) => v.normalize('NFD').toLowerCase().replace(/[^a-z]/g, '');
    const correo = simple(String(u.email || '').split('@')[0] ?? '');
    if (nombres && apellidos && correo.startsWith(simple(apellidos))) [nombres, apellidos] = [apellidos, nombres];
    ponerNombre(nombres, apellidos);
    vieneDeGoogle.value = true;
    form.email = String(u.email || '').toLowerCase();
    notify('Datos de Google cargados. Revísalos y completa los que faltan.', 'success');
    datosRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    notify('No se pudieron leer los datos de Google.', 'error');
  }
}
function iniciarGoogle() {
  const google = (window as any).google;
  if (!google || !googleBtn.value) return;
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: usarDatosGoogle });
  google.accounts.id.renderButton(googleBtn.value, { theme: 'filled_black', size: 'large', text: 'signup_with', shape: 'pill', width: 280, locale: 'es' });
}
onMounted(() => {
  if (!GOOGLE_CLIENT_ID) return console.warn('Falta VITE_GOOGLE_CLIENT_ID en el archivo .env');
  if ((window as any).google?.accounts) return iniciarGoogle();
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.onload = iniciarGoogle;
  document.head.appendChild(script);
});
</script>

<template>
  <div class="register-page">
    <div class="photo-bg"></div>
    <div class="photo-overlay"></div>
    <NotificationSystem ref="toastRef" />
    <NoGymModal v-if="showNoGymModal" rol="atleta" @add="onAddGym" @close="showNoGymModal = false" />

    <header class="topbar">
      <router-link :to="{ name: 'home' }" class="brand">
        <img src="../../assets/factor_fit-25.webp" alt="Factor Fit" class="brand-logo" />
        <span>FACTOR FIT</span>
      </router-link>
      <router-link :to="{ name: 'login' }" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        <span>Volver a iniciar sesión</span>
      </router-link>
    </header>

    <main class="main-content">
      <div class="register-card">
        <!-- ===== Encabezado ===== -->
        <div class="header-section">
          <button type="button" class="demo-fill" @click="rellenarEjemplo" title="Carga datos ficticios solo como guía visual">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"/><path d="M19 15l.8 1.9 1.9.8-1.9.8L19 20l-.8-1.9-1.9-.8 1.9-.8L19 15z"/></svg>
            <span>Datos de ejemplo</span>
          </button>
          <h1 class="title">Regístrate a <span>Factor Fit</span></h1>
          <p class="subtitle">Elige tu sucursal y crea tu cuenta para empezar a entrenar</p>
        </div>

        <div v-if="registroExitoso" class="success-box">
          <h2>Solicitud registrada</h2>
          <p>{{ mensaje }}</p>
          <router-link :to="{ name: 'login' }">Ir a iniciar sesión</router-link>
        </div>

        <form v-else @submit.prevent="handleRegisterClick">
          <div class="rg-grid">
            <!-- ===== Fotografía ===== -->
            <div class="form-column area-foto">
              <h3 class="section-title first">Fotografía</h3>
              <div class="upload-container">
                <div class="image-preview" role="button" tabindex="0" aria-label="Subir fotografía" @click="triggerFileInput" @keydown.enter="triggerFileInput">
                  <img v-if="previewImage" :src="previewImage" class="profile-img" alt="Vista previa" />
                  <div v-else class="upload-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span>Subir foto</span>
                  </div>
                </div>
                <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onFileSelected" />
                <p>Sube una fotografía reciente<br /><span class="hint">JPG, PNG o WebP, menos de 3 MB</span></p>
              </div>
            </div>

            <!-- ===== Datos personales ===== -->
            <div ref="datosRef" class="form-column area-datos">
              <h3 class="section-title first">Datos personales</h3>
              <button v-if="vieneDeGoogle" type="button" class="swap-name" @click="intercambiarNombre">⇄ ¿Nombre y apellidos al revés? Intercambiar</button>
              <div class="fields">
                <div class="field">
                  <label>Nombre(s)</label>
                  <input v-model="form.nombres" @input="normalizarCampo('nombres')" required maxlength="150" placeholder="Tu(s) nombre(s)" />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Apellido paterno</label>
                    <input v-model="form.apellidoP" @input="normalizarCampo('apellidoP')" required maxlength="150" placeholder="Primer apellido" />
                  </div>
                  <div class="field">
                    <label>Apellido materno</label>
                    <input v-model="form.apellidoM" @input="normalizarCampo('apellidoM')" maxlength="150" placeholder="Segundo apellido" />
                  </div>
                </div>
                <div class="field">
                  <label>CURP</label>
                  <input v-model="form.curp" @input="limpiarCurp(); fechaDesdeCurp()" type="text" maxlength="18" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase" placeholder="18 caracteres oficiales" required />
                  <div class="field-foot">
                    <small v-if="errorCurp" class="field-note invalid">{{ errorCurp }}</small>
                    <small v-else-if="form.curp.length === 18" class="field-note">CURP con formato válido (sin consulta oficial).</small>
                    <a class="curp-link" href="https://www.gob.mx/curp/" target="_blank" rel="noopener noreferrer">Consultar mi CURP</a>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Fecha de nacimiento</label>
                    <input v-model="form.fechaNac" type="date" required />
                  </div>
                  <div class="field">
                    <label>Teléfono celular</label>
                    <input :value="form.celular" @input="actualizarCelular" @paste="pegarCelular" @keydown.plus.prevent type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="10 dígitos sin +52" required maxlength="12" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Peso (kg) <small>Opcional</small></label>
                    <input v-model="form.peso" @input="normalizarPeso" type="text" inputmode="decimal" maxlength="5" placeholder="72.5" />
                  </div>
                  <div class="field">
                    <label>Altura (cm) <small>Opcional</small></label>
                    <input v-model="form.altura" @input="normalizarAltura" type="text" inputmode="numeric" maxlength="3" placeholder="175" />
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== Cuenta y sucursal ===== -->
            <div class="form-column area-cuenta">
              <h3 class="section-title first">Cuenta de acceso</h3>
              <div class="fields">
                <div class="field">
                  <label>Correo electrónico</label>
                  <input v-model="form.email" @blur="normalizarCorreo" placeholder="tu@correo.com" type="email" required maxlength="255" autocomplete="email" />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Contraseña</label>
                    <div class="password-field">
                      <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required minlength="8" autocomplete="new-password" />
                      <button type="button" @click="showPassword = !showPassword">{{ showPassword ? 'Ocultar' : 'Ver' }}</button>
                    </div>
                  </div>
                  <div class="field">
                    <label>Confirmar contraseña</label>
                    <div class="password-field">
                      <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required minlength="8" autocomplete="new-password" />
                      <button type="button" @click="showConfirmPassword = !showConfirmPassword">{{ showConfirmPassword ? 'Ocultar' : 'Ver' }}</button>
                    </div>
                    <small v-if="form.confirmPassword" class="field-note" :class="{ invalid: form.password !== form.confirmPassword }" aria-live="polite">
                      {{ form.password === form.confirmPassword ? '✓ Las contraseñas son idénticas' : '✗ Las contraseñas no coinciden' }}
                    </small>
                  </div>
                </div>
              </div>

              <h3 class="section-title">Tu sucursal</h3>
              <div ref="gymPickerRef" class="gym-picker">
                <div v-if="!selectedGym" class="field">
                  <label>Buscar sucursal</label>
                  <input ref="gymSearchInput" v-model="gymSearch" placeholder="Nombre o ciudad de la sucursal..." autocomplete="off" @focus="isGymDropdownOpen = true" />
                </div>
                <div v-if="!selectedGym && isGymDropdownOpen" class="gym-dropdown">
                  <button v-for="gym in filteredGyms" :key="gym.ID_Sede" type="button" class="gym-option" @click="selectGym(gym)">
                    <span>
                      <strong>{{ gym.Nombre_Gym }} — {{ gym.Nombre_Sede }}</strong>
                      <small>{{ gym.Ciudad || '' }} {{ gym.Estado || '' }}</small>
                    </span>
                  </button>
                  <div v-if="loadingGyms" class="gym-empty">Cargando sucursales...</div>
                  <div v-else-if="errorSucursales" class="gym-empty">{{ errorSucursales }} <button type="button" @click="cargarSucursales">Reintentar</button></div>
                  <div v-else-if="!filteredGyms.length" class="gym-empty">No se encontraron sucursales.</div>
                </div>
                <div v-if="selectedGym" class="selected-gym">
                  <div>
                    <strong>{{ selectedGym.Nombre_Gym }} — {{ selectedGym.Nombre_Sede }}</strong>
                    <span>{{ selectedGym.Direccion || '' }} · {{ selectedGym.Ciudad || '' }}</span>
                  </div>
                  <button type="button" @click="clearGym">Cambiar</button>
                </div>
              </div>

              <div v-if="selectedGym" class="membership">
                <label>Tipo de membresía</label>
                <p v-if="loadingTarifas" class="membership-note">Cargando tarifas...</p>
                <div v-else class="membership-options">
                  <button v-for="p in tarifas" :key="p.ID_Precio" type="button" class="membership-option" :class="{ active: selectedTarifa === Number(p.ID_Precio) }" @click="selectedTarifa = Number(p.ID_Precio)">
                    <span>
                      <strong>{{ p.Nombre_Paquete }}</strong>
                      <small>{{ p.Periodo || 'Membresía' }}</small>
                    </span>
                    <b>${{ Number(p.Precio).toFixed(2) }}</b>
                  </button>
                  <p v-if="!tarifas.length" class="membership-note">Esta sucursal no tiene tarifas disponibles.</p>
                </div>
                <p v-if="tarifaElegida" class="membership-note chosen">Seleccionaste: {{ tarifaElegida.Nombre_Paquete }}</p>
              </div>
            </div>
          </div>

          <!-- ===== Acciones a todo el ancho ===== -->
          <div class="actions">
            <label class="terms-check">
              <input v-model="aceptaTerminos" type="checkbox" />
              <span>
                He leído y acepto los
                <a :href="TERMINOS_PDF_URL" target="_blank" rel="noopener noreferrer" @click.stop>Términos y Condiciones (PDF)</a>.
              </span>
            </label>
            <p v-if="mensaje" role="alert" class="form-message">{{ mensaje }}</p>
            <button type="submit" class="submit-btn" :disabled="guardando || loadingTarifas || !selectedGym || !selectedTarifa || !aceptaTerminos">
              {{ guardando ? 'Registrando...' : 'Registrarme' }}
              <svg v-if="!guardando" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <!-- ===== Registro con Google ===== -->
            <div v-show="GOOGLE_CLIENT_ID" class="google-box">
              <span class="google-sep">o</span>
              <div ref="googleBtn" class="google-btn"></div>
            </div>
            <p class="login-link">¿Ya tienes cuenta? <router-link :to="{ name: 'login' }">Inicia sesión</router-link></p>
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
  gap: 8px;
  padding: 9px 16px 9px 12px;
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
.submit-btn:focus-visible,
.demo-fill:focus-visible,
.curp-link:focus-visible,
.terms-check a:focus-visible {
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
  position: relative;
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

/* ---- Encabezado de la tarjeta ---- */
.header-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
  padding-bottom: 30px;
  text-align: center;
}
.header-section::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(233, 176, 138, .38), transparent);
}
.header-section .title {
  margin: 0;
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
.header-section .subtitle {
  max-width: 420px;
  margin: 0;
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.6;
}
.demo-fill {
  order: 3;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
  padding: 7px 13px 7px 11px;
  border: 1px dashed rgba(233, 176, 138, .4);
  border-radius: 999px;
  background: transparent;
  color: var(--text-2);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color .2s, border-color .2s, background .2s;
}
.demo-fill svg { width: 14px; height: 14px; color: var(--soft); }
.demo-fill:hover { color: #fff; border-color: var(--soft); background: rgba(233, 176, 138, .1); }

/* ---- Formulario ---- */
.rg-grid { display: grid; grid-template-columns: 1fr; gap: clamp(30px, 4vw, 52px); align-items: start; }
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
input:not([type="checkbox"]) {
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
input:not([type="checkbox"])::placeholder { color: #716e83; font-weight: 400; }
input:not([type="checkbox"]):hover { border-color: rgba(255, 255, 255, .24); }
input:not([type="checkbox"]):focus { border-color: var(--accent); background: rgba(212, 80, 110, .06); box-shadow: 0 0 0 3px rgba(212, 80, 110, .2); }
input[type="date"] { color-scheme: dark; }

.field-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; min-height: 16px; }
.field-note { font-size: 11px; color: #76dfb4; }
.field-note.invalid { color: #ffb36c; }
.curp-link { margin-left: auto; font-size: 11px; color: var(--soft); text-decoration: underline; text-underline-offset: 2px; border-radius: 4px; }
.curp-link:hover { color: #fff; }

.upload-container {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px;
  background: rgba(255, 255, 255, .03);
  border: 1px dashed rgba(233, 176, 138, .3);
  border-radius: 14px;
}
.upload-container p { margin: 0; color: var(--text-2); font-size: 12.5px; font-weight: 600; line-height: 1.5; }
.upload-container .hint { color: var(--text-3); font-size: 11.5px; font-weight: 400; }
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
.image-preview:focus-visible { outline: 2px solid var(--soft); outline-offset: 3px; }
.profile-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--soft); }
.upload-placeholder svg { width: 20px; height: 20px; }
.upload-placeholder span { font-size: 8px; font-weight: 700; text-transform: uppercase; }
.password-field { position: relative; }
.password-field input { padding-right: 60px; }
.password-field button {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 0 13px;
  border: 0;
  background: transparent;
  color: var(--soft);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color .2s;
}
.password-field button:hover { color: #fff; }

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
.membership-note { margin: 0; color: var(--text-3); font-size: 12px; }
.membership-note.chosen { color: var(--soft); }
.membership-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.membership-options .membership-note { grid-column: 1 / -1; }
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
.membership-option.active small,
.membership-option.active b { color: var(--soft); }

/* ACCIONES */
.actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 440px;
  margin: 36px auto 0;
  padding-top: 30px;
  position: relative;
}
.actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: -40%;
  right: -40%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-strong), transparent);
}
.terms-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: rgba(255, 255, 255, .03);
  color: var(--text-2);
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
}
.terms-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 2px 0 0;
  flex-shrink: 0;
  accent-color: var(--accent);
  cursor: pointer;
}
.terms-check a {
  color: var(--soft);
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
  border-radius: 4px;
}
.terms-check a:hover { color: #fff; }
.form-message { margin: 0; color: #ffb5c5; font-size: 13px; text-align: center; }
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
.submit-btn:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 10px 24px rgba(212, 80, 110, .32); }
.submit-btn:active:not(:disabled) { transform: none; filter: brightness(.97); }
.submit-btn:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.submit-btn svg { width: 18px; height: 18px; transition: transform .2s; }
.submit-btn:hover:not(:disabled) svg { transform: translateX(3px); }
.login-link { margin: 0; color: var(--text-3); font-size: 13px; text-align: center; }
.login-link a { color: var(--soft); font-weight: 650; text-decoration: none; }
.login-link a:hover { color: #fff; text-decoration: underline; text-underline-offset: 3px; }

.success-box { text-align: center; padding: 30px; border: 1px solid rgba(233, 176, 138, .3); border-radius: 16px; }
.success-box h2 { margin: 0 0 8px; }
.success-box p { margin: 0 0 14px; color: var(--text-2); }
.success-box a { color: var(--soft); font-weight: 650; }

/* GOOGLE */
.google-box { display: flex; flex-direction: column; gap: 14px; }
.google-sep { display: flex; align-items: center; gap: 12px; color: var(--text-3); font-size: 12px; }
.google-sep::before, .google-sep::after { content: ''; flex: 1; height: 1px; background: var(--line-strong); }
.google-btn { display: flex; justify-content: center; min-height: 40px; color-scheme: light; }
.swap-name { align-self: flex-start; padding: 0; border: 0; background: none; color: var(--soft); font-family: inherit; font-size: 11.5px; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.swap-name:hover { color: #fff; }

@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after { transition: none !important; animation-duration: .01ms !important; }
}
@media (min-width: 900px) {
  .rg-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "foto cuenta"
      "datos cuenta";
    row-gap: 30px;
  }
  .area-foto { grid-area: foto; }
  .area-datos { grid-area: datos; }
  .area-cuenta { grid-area: cuenta; }
  .demo-fill { position: absolute; top: -12px; right: -12px; order: 0; margin: 0; background: rgba(18, 18, 28, .5); }
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
  .header-section { margin-bottom: 26px; padding-bottom: 24px; }
  .field-row { grid-template-columns: 1fr; }
  .membership-options { grid-template-columns: 1fr; }
  .actions { margin-top: 28px; padding-top: 24px; }
  .actions::before { left: 0; right: 0; }
  input:not([type="checkbox"]) { font-size: 16px; }
}
@media (max-width: 420px) {
  .topbar { height: 62px; padding: 0 14px; }
  .brand span { font-size: 14px; }
  .register-card { padding: 22px 15px; }
  .header-section .title { font-size: 1.75rem; }
  .selected-gym { flex-direction: column; align-items: stretch; }
  .upload-container { flex-direction: column; text-align: center; }
}
</style>