<script setup>
import { reactive, ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import { traducciones } from '../i18n.js';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

/* ============================ GENERAL ============================ */

const route = useRoute();
const router = useRouter();

const toastRef = ref(null);
const searchQuery = ref('');
const showSuggestions = ref(false);
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');

const t = (key) => {
  const langTable = traducciones[currentLang.value] || traducciones.es;
  return langTable?.[key] || traducciones.es?.[key] || key;
};

const txt = (es, en) => (currentLang.value === 'en' ? en : es);

/* Texto en 4 idiomas para las cadenas nuevas. Si falta fr/pt se usa el inglés. */
const L = (es, en, fr, pt) => {
  const texts = { es, en, fr: fr ?? en, pt: pt ?? en };
  return texts[currentLang.value] ?? es;
};

const handleLangChange = (event) => {
  if (event.detail?.idioma) currentLang.value = event.detail.idioma;
};

const warn = (message) => {
  toastRef.value?.notify(message, 'warning');
  return false;
};

/* ============================ SEDES ============================ */

const listaSedes = ref([]);
const ALL_SEDES = computed(() => listaSedes.value.map(s => s.id));
const staffDB = ref([]);
const loadingProfile = ref(false);
const saving = ref(false);
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const token = () => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['token','auth_token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']) {
      const value = store.getItem(key);
      if (value) return value.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth','user','session','gymAccount','gym_account']) {
      try {
        const value = JSON.parse(store.getItem(key) || 'null');
        if (value?.token || value?.access_token || value?.accessToken)
          return value.token || value.access_token || value.accessToken;
      } catch {}
    }
  }
  return '';
};
const request = async (path, options = {}) => {
  const auth = token();
  if (!auth) throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Accept: 'application/json', Authorization: `Bearer ${auth}`, ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errors = Object.values(data?.errors || {}).flat().filter(Boolean).join(' ');
    throw new Error(errors || data?.message || `Error HTTP ${response.status}`);
  }
  return data;
};
const fetchSedes = async () => {
  const data = await request('/api/personal/sedes');
  const rows = Array.isArray(data) ? data : (data?.data || data?.sedes || []);
  listaSedes.value = rows.map(x => ({
    id: Number(x.ID_Sede ?? x.id),
    nombre: x.Sede_Colonia ?? x.Nombre_Sede ?? x.nombre ?? `Sede ${x.ID_Sede ?? x.id}`
  })).filter(x => x.id > 0);
};
const fetchStaffSearch = async () => {
  const data = await request('/api/personal');
  staffDB.value = Array.isArray(data) ? data : (data?.data || []);
};
/* ============================ FORMULARIO ============================ */

const emptyForm = () => ({
  /* comunes */
  rol: '',
  correo: '',
  sedes: [],
  curp: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  celular: '',
  /* propietario, gerente, recepción */
  password: '',
  confirmPassword: '',
  /* entrenador */
  especialidad: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  otrasApp: '',
  /* horario */
  tieneHorario: false,
  entrada: '',
  salida: ''
});

const form = reactive(emptyForm());
const currentStaffId = ref(null);

const loaded = computed(() => currentStaffId.value !== null);

const staffCode = computed(() =>
  loaded.value ? `GymPer${String(currentStaffId.value).padStart(3, '0')}` : '—'
);

const initials = computed(() =>
  [form.nombres, form.apellidoPaterno]
    .filter(Boolean)
    .map((value) => value.trim().charAt(0))
    .join('')
    .toUpperCase()
);

/* ============================ REGLAS POR ROL ============================
   propietario : todas las sedes · sin horario · con contraseña
   gerente     : una, varias o todas · sin horario · con contraseña
   recepcion   : UNA sola sede · horario obligatorio · con contraseña
   entrenador  : varias sedes · especialidad y redes · horario opcional · sin contraseña
================================================================== */

const isOwner = computed(() => form.rol === 'propietario');
const isManager = computed(() => form.rol === 'gerente');
const isTrainer = computed(() => form.rol === 'entrenador');
const isReception = computed(() => form.rol === 'recepcion');

const needsPassword = computed(
  () => isOwner.value || isManager.value || isReception.value
);

const multiSedes = computed(() => isManager.value || isTrainer.value);

/* Solo recepción y entrenador tienen horario */
const showScheduleCard = computed(() => isReception.value || isTrainer.value);

const scheduleMode = computed(() => {
  if (isReception.value) return 'required';
  if (isTrainer.value) return 'optional';
  return 'none';
});

const showTimes = computed(
  () =>
    scheduleMode.value === 'required' ||
    (scheduleMode.value === 'optional' && form.tieneHorario)
);

const roleLabel = computed(() => {
  if (isOwner.value) return L('Propietario', 'Owner', 'Propriétaire', 'Proprietário');
  if (isManager.value) return L('Gerente', 'Manager', 'Gérant', 'Gerente');
  if (isTrainer.value) return t('roleTrainer');
  if (isReception.value) return t('roleReception');
  return '';
});

const sedesHint = computed(() => {
  if (isReception.value) {
    return L(
      'Recepción solo puede tener una sede.',
      'Reception can only have one location.',
      'La réception ne peut avoir qu’un seul site.',
      'A recepção só pode ter uma unidade.'
    );
  }

  if (multiSedes.value) {
    return L(
      'Puede tener una, varias o todas las sedes.',
      'Can have one, several or all locations.',
      'Peut avoir un, plusieurs ou tous les sites.',
      'Pode ter uma, várias ou todas as unidades.'
    );
  }

  return '';
});

/* ============================ CARGAR USUARIO ============================ */

const resetAvatar = () => {
  if (avatarSrc.value && avatarSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarSrc.value);
  }
  avatarFile.value = null;
  avatarSrc.value = '';
};

const loadUser = async (id) => {
  if (!id) return;
  loadingProfile.value = true;
  try {
    const data = await request(`/api/personal/${encodeURIComponent(id)}`);
    const user = data?.data || data;
    const roleMap = { GYM_ADMIN: 'propietario', GYM_MANAGER: 'gerente', GYM_COACH: 'entrenador', GYM_RECEPCIONIST: 'recepcion' };
    const assigned = user.sedes_asignadas || user.sedes || [];
    const sedes = assigned.map(x => Number(typeof x === 'object' ? (x.ID_Sede ?? x.id) : x)).filter(x => x > 0);
    const horario = user.horario || {};
    Object.assign(form, emptyForm(), {
      rol: roleMap[user.Nombre_Rol ?? user.rol?.Nombre_Rol] || '',
      correo: user.Correo_Electronico || '',
      sedes: sedes.length ? sedes : [Number(user.ID_Sede)].filter(Boolean),
      curp: user.Curp || '',
      nombres: user.Nombre || '',
      apellidoPaterno: user.Apellido_P || '',
      apellidoMaterno: user.Apellido_M || '',
      fechaNacimiento: String(user.Fecha_Nacimiento || '').slice(0, 10),
      celular: user.Celular || '',
      especialidad: user.Especialidad || user.datos_extras?.Especialidad || '',
      facebook: user.Facebook || user.datos_extras?.Facebook || '',
      instagram: user.Instagram || user.datos_extras?.Instagram || '',
      tiktok: user.TikTok || user.datos_extras?.TikTok || '',
      otrasApp: user.Otras_App || user.datos_extras?.Otras_App || '',
      entrada: horario.entrada || user.Horario_Entrada || '',
      salida: horario.salida || user.Horario_Salida || '',
      tieneHorario: Boolean(horario.entrada || user.Horario_Entrada)
    });
    if (form.rol === 'recepcion') form.sedes = form.sedes.slice(0, 1);
    currentStaffId.value = Number(user.ID_Personal);
    isDropdownOpen.value = false;
    resetAvatar();
    avatarSrc.value = user.foto_url || '';
  } catch (error) {
    currentStaffId.value = null;
    toastRef.value?.notify(error.message, 'error');
  } finally {
    loadingProfile.value = false;
  }
};

/* ============================ BÚSQUEDA (CON SUGERENCIAS) ============================ */

const suggestions = computed(() => {
  const q = searchQuery.value.trim().toLocaleLowerCase();
  if (!q) return [];
  return staffDB.value
    .filter(u =>
      [u.Nombre, u.Apellido_P, u.Apellido_M, u.Celular, u.Correo_Electronico, u.ID_Personal]
        .some(v => String(v ?? '').toLocaleLowerCase().includes(q))
    )
    .slice(0, 8);
});

const chooseStaff = async (u) => {
  showSuggestions.value = false;
  searchQuery.value = '';
  const id = String(u.ID_Personal);
  if (String(route.params.id) === id) await loadUser(id);
  else await router.push(`/GYM_ACCOUNT/editar-staff/${id}`);
};

const handleSearch = () => {
  if (suggestions.value.length === 1) chooseStaff(suggestions.value[0]);
  else showSuggestions.value = true;
};

/* ============================ SEDES (SELECTOR) ============================ */

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const allSedesSelected = computed(
  () =>
    listaSedes.value.length > 0 &&
    form.sedes.length === listaSedes.value.length
);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

/* Recepción: una sola sede (se reemplaza y se cierra). Resto: agrega o quita. */
const toggleSede = (id) => {
  if (isReception.value) {
    form.sedes = [id];
    isDropdownOpen.value = false;
    return;
  }

  const index = form.sedes.indexOf(id);
  if (index > -1) form.sedes.splice(index, 1);
  else form.sedes.push(id);
};

const toggleAllSedes = () => {
  form.sedes = allSedesSelected.value ? [] : [...ALL_SEDES.value];
};

const getSedesDisplayText = () => {
  if (form.sedes.length === 0) {
    return L(
      isReception.value ? 'Seleccionar sede' : 'Seleccionar sedes',
      isReception.value ? 'Select location' : 'Select locations',
      isReception.value ? 'Sélectionner le site' : 'Sélectionner les sites',
      isReception.value ? 'Selecionar unidade' : 'Selecionar unidades'
    );
  }

  if (allSedesSelected.value && multiSedes.value) {
    return L('Todas las sedes', 'All locations', 'Tous les sites', 'Todas as unidades');
  }

  return listaSedes.value
    .filter((sede) => form.sedes.includes(sede.id))
    .map((sede) => sede.nombre)
    .join(', ');
};

const handleClickOutside = (event) => {
  if (!event.target.closest?.('.search-small')) showSuggestions.value = false;
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    isDropdownOpen.value = false;
    showSuggestions.value = false;
  }
};

/* Si el entrenador desactiva el horario, se limpian las horas */
watch(
  () => form.tieneHorario,
  (active) => {
    if (!active && isTrainer.value) {
      form.entrada = '';
      form.salida = '';
    }
  }
);

/* ============================ FOTO ============================ */

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const isValidImage = file => !!file && ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
const notifyInvalidImage = () => toastRef.value?.notify('Selecciona una imagen JPG, PNG o WebP de máximo 4 MB.', 'warning');
const fileInput = ref(null);
const avatarFile = ref(null);
const avatarSrc = ref('');

const showPhotoOptions = ref(false);
const openPhotoOptions = () => (showPhotoOptions.value = true);
const closePhotoOptions = () => (showPhotoOptions.value = false);

const selectPhoto = () => {
  showPhotoOptions.value = false;
  if (!fileInput.value) return;
  fileInput.value.value = '';
  fileInput.value.click();
};

const setAvatarFile = (file) => {
  if (!file) return;

  if (avatarSrc.value && avatarSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarSrc.value);
  }

  avatarFile.value = file;
  avatarSrc.value = URL.createObjectURL(file);
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!isValidImage(file)) {
    notifyInvalidImage();
    event.target.value = '';
    return;
  }

  setAvatarFile(file);
  toastRef.value?.notify(
    txt('Foto seleccionada correctamente.', 'Photo selected successfully.'),
    'success'
  );
  event.target.value = '';
};

/* ============================ CÁMARA REAL ============================ */

const showCamera = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
const cameraStream = ref(null);
const cameraFacingMode = ref('user');
const switchingCamera = ref(false);

const stopCamera = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }
  if (videoRef.value) videoRef.value.srcObject = null;
};

const startCamera = async () => {
  stopCamera();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: cameraFacingMode.value },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  });

  cameraStream.value = stream;
  await nextTick();

  if (!videoRef.value) {
    throw new Error('No se encontró el visor de cámara.');
  }

  videoRef.value.srcObject = stream;
  await videoRef.value.play();
};

const takePhoto = async () => {
  showPhotoOptions.value = false;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toastRef.value?.notify(
      txt(
        'Este navegador no permite utilizar la cámara.',
        'Camera is not supported by this browser.'
      ),
      'warning'
    );
    return;
  }

  cameraFacingMode.value = 'user';
  showCamera.value = true;
  await nextTick();

  try {
    await startCamera();
  } catch (error) {
    console.error(error);
    stopCamera();
    showCamera.value = false;

    let message = txt('No se pudo acceder a la cámara.', 'Could not access the camera.');

    if (error?.name === 'NotAllowedError') {
      message = txt(
        'Permiso de cámara rechazado. Actívalo desde el navegador.',
        'Camera permission was denied. Enable it in your browser.'
      );
    }
    if (error?.name === 'NotFoundError') {
      message = txt(
        'No se encontró una cámara en este dispositivo.',
        'No camera was found on this device.'
      );
    }
    if (error?.name === 'NotReadableError') {
      message = txt(
        'La cámara está siendo utilizada por otra aplicación.',
        'The camera is being used by another application.'
      );
    }

    toastRef.value?.notify(message, 'warning');
  }
};

const switchCamera = async () => {
  if (switchingCamera.value) return;
  switchingCamera.value = true;

  const previous = cameraFacingMode.value;
  cameraFacingMode.value = previous === 'user' ? 'environment' : 'user';

  try {
    await startCamera();
  } catch (error) {
    console.error(error);
    cameraFacingMode.value = previous;

    try {
      await startCamera();
    } catch {
      closeCamera();
    }

    toastRef.value?.notify(
      txt('La cámara seleccionada no está disponible.', 'The selected camera is not available.'),
      'warning'
    );
  } finally {
    switchingCamera.value = false;
  }
};

const closeCamera = () => {
  stopCamera();
  showCamera.value = false;
  switchingCamera.value = false;
};

const capturePhoto = () => {
  if (switchingCamera.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;

  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    toastRef.value?.notify(
      txt('La cámara todavía no está lista.', 'The camera is not ready yet.'),
      'warning'
    );
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  if (!context) return;

  if (cameraFacingMode.value === 'user') {
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();
  } else {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      const file = new File([blob], `personal-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      if (!isValidImage(file)) { notifyInvalidImage(); return; }
      setAvatarFile(file);
      closeCamera();

      toastRef.value?.notify(
        txt('Foto tomada correctamente.', 'Photo captured successfully.'),
        'success'
      );
    },
    'image/jpeg',
    0.92
  );
};

/* ============================ VALIDACIÓN ============================ */

const validateForm = () => {
  if (!form.nombres.trim() || !form.apellidoPaterno.trim()) {
    return warn(
      L(
        'Completa los datos personales obligatorios.',
        'Complete the required personal information.',
        'Complétez les informations personnelles obligatoires.',
        'Preencha as informações pessoais obrigatórias.'
      )
    );
  }

  if (!form.correo.trim()) {
    return warn(
      L(
        'Ingresa un correo electrónico.',
        'Enter an email address.',
        'Entrez une adresse e-mail.',
        'Digite um endereço de e-mail.'
      )
    );
  }

  /* Contraseña: opcional al editar, pero si se escribe debe coincidir */
  if (needsPassword.value && (form.password || form.confirmPassword)) {
    if (form.password !== form.confirmPassword) {
      return warn(
        L(
          'Las contraseñas no coinciden.',
          'Passwords do not match.',
          'Les mots de passe ne correspondent pas.',
          'As senhas não coincidem.'
        )
      );
    }
  }

  if (isTrainer.value && !form.especialidad.trim()) {
    return warn(
      L(
        'Ingresa la especialidad del entrenador.',
        'Enter the trainer specialty.',
        'Entrez la spécialité de l’entraîneur.',
        'Digite a especialidade do treinador.'
      )
    );
  }

  if (!isOwner.value && form.sedes.length === 0) {
    return warn(
      L(
        isReception.value
          ? 'Selecciona la sede de recepción.'
          : 'Selecciona al menos una sede.',
        isReception.value
          ? 'Select the reception location.'
          : 'Select at least one location.',
        isReception.value
          ? 'Sélectionnez le site de la réception.'
          : 'Sélectionnez au moins un site.',
        isReception.value
          ? 'Selecione a unidade da recepção.'
          : 'Selecione pelo menos uma unidade.'
      )
    );
  }

  if (showTimes.value && (!form.entrada || !form.salida)) {
    return warn(
      L(
        'Ingresa la hora de entrada y de salida.',
        'Enter the entry and exit time.',
        'Entrez l’heure d’entrée et de sortie.',
        'Informe o horário de entrada e de saída.'
      )
    );
  }

  return true;
};

/* ============================ GUARDAR ============================ */

const saveChanges = async () => {
  if (!loaded.value || saving.value || !validateForm()) return;
  if (avatarFile.value && !isValidImage(avatarFile.value)) { notifyInvalidImage(); return; }
  saving.value = true;
  try {
    const fd = new FormData();
    const values = {
      rol: form.rol,
      correo: form.correo.trim(),
      curp: form.curp.trim(),
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      fechaNacimiento: form.fechaNacimiento,
      celular: form.celular.trim(),
      especialidad: form.especialidad.trim(),
      facebook: form.facebook.trim(),
      instagram: form.instagram.trim(),
      tiktok: form.tiktok.trim(),
      otrasApp: form.otrasApp.trim()
    };
    if (showTimes.value) values.horario = JSON.stringify({ entrada: form.entrada, salida: form.salida });
    if (form.password) values.password = form.password;
    for (const [key, value] of Object.entries(values)) fd.append(key, value ?? '');
    const selected = isOwner.value ? ALL_SEDES.value : form.sedes;
    selected.forEach(id => fd.append('sedes[]', String(id)));
    if (avatarFile.value) fd.append('foto', avatarFile.value);
    await request(`/api/personal/${currentStaffId.value}`, { method: 'POST', body: fd });
    await loadUser(currentStaffId.value);
    await fetchStaffSearch();
    toastRef.value?.notify('Cambios guardados correctamente.', 'success');
  } catch (error) {
    toastRef.value?.notify(error.message || 'No se pudieron guardar los cambios.', 'error');
  } finally {
    saving.value = false;
  }
};
/* ============================ CICLO DE VIDA ============================ */

/* Carga el usuario según el id de la ruta: /GYM_ACCOUNT/editar-staff/:id */
watch(
  () => route.params.id,
  (id) => {
    if (id === undefined || id === null || id === '') {
      currentStaffId.value = null;
      return;
    }
    loadUser(id);
  },
  { immediate: true }
);

onMounted(async () => {
  try { await Promise.all([fetchSedes(), fetchStaffSearch()]); }
  catch (error) { toastRef.value?.notify(error.message, 'error'); }
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', fetchStaffSearch);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', fetchStaffSearch);
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
  stopCamera();

  if (avatarSrc.value && avatarSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarSrc.value);
  }
});
</script>

<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <main class="main-content">
      <!-- ==================== ENCABEZADO ==================== -->
      <header class="page-header">
        <div class="page-heading">
          <span class="eyebrow">
            {{ txt('GESTIÓN DE PERSONAL', 'STAFF MANAGEMENT') }}
          </span>

          <h1>
            {{ txt('Perfil del', 'Staff') }}
            <span>{{ txt('personal', 'profile') }}</span>
          </h1>

          <p>
            {{
              txt(
                'Consulta y actualiza la información, permisos, sedes y horarios del personal registrado en el sistema.',
                'Review and update the information, permissions, locations and schedules of staff registered in the system.'
              )
            }}
          </p>
        </div>

        <!-- TUTOR 0: BUSCAR PERSONAL -->
        <div id="tutor-0" class="input-group search-small">
          <label for="staff-search">{{ t('searchStaffLabel') }}</label>

          <div class="search-input-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              id="staff-search"
              v-model="searchQuery"
              type="text"
              autocomplete="off"
              :placeholder="t('searchPlaceholder')"
              @focus="showSuggestions = true"
              @input="showSuggestions = true"
              @keyup.enter="handleSearch"
            />
          </div>

          <div
            v-if="showSuggestions && searchQuery.trim()"
            class="client-suggestions"
            role="listbox"
          >
            <button
              v-for="u in suggestions"
              :key="u.ID_Personal"
              type="button"
              class="client-suggestion"
              role="option"
              @click="chooseStaff(u)"
            >
              <span class="suggestion-avatar">{{ String(u.Nombre || '?').charAt(0).toUpperCase() }}</span>
              <span class="suggestion-info">
                <strong>{{ [u.Nombre, u.Apellido_P, u.Apellido_M].filter(Boolean).join(' ') }}</strong>
                <small>{{ u.Correo_Electronico || u.Celular || 'Personal registrado' }}</small>
              </span>
              <span class="suggestion-id">#{{ u.ID_Personal }}</span>
            </button>
            <p v-if="!suggestions.length" class="suggestion-empty">
              No se encontró personal en esta sucursal.
            </p>
          </div>
        </div>
      </header>

      <div v-if="loadingProfile" class="login-card">Cargando información del personal...</div>

      <!-- ==================== SIN PERSONAL SELECCIONADO ==================== -->
      <section v-if="!loaded" class="login-card empty-staff">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        <h3>
          {{
            L(
              'Selecciona a un miembro del personal',
              'Select a staff member',
              'Sélectionnez un membre du personnel',
              'Selecione um funcionário'
            )
          }}
        </h3>

        <p>
          {{
            L(
              'Elige a alguien desde la tabla de personal o búscalo por nombre, correo o ID.',
              'Pick someone from the staff table or search by name, email or ID.',
              'Choisissez quelqu’un dans le tableau ou cherchez par nom, e-mail ou ID.',
              'Escolha alguém na tabela ou busque por nome, e-mail ou ID.'
            )
          }}
        </p>
      </section>

      <!-- ==================== PERSONAL SELECCIONADO ==================== -->
      <div v-else class="profile-card">

        <!-- ==================== PERFIL LATERAL ==================== -->
        <!-- TUTOR 1: PERFIL -->
        <aside id="tutor-1" class="profile-section">

          <!-- TUTOR 2: FOTO -->
          <div id="tutor-2" class="avatar-wrapper">
            <button
              type="button"
              class="avatar-circle"
              :aria-label="txt('Cambiar foto', 'Change photo')"
              @click="openPhotoOptions"
            >
              <img
                v-if="avatarSrc"
                :src="avatarSrc"
                :alt="t('avatarAlt')"
                class="user-avatar-img"
              />

              <span v-else class="avatar-initials">
                {{ initials }}
              </span>

              <span class="avatar-overlay">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  />
                  <circle cx="12" cy="13" r="4" />
                </svg>

                {{ txt('Cambiar foto', 'Change photo') }}
              </span>
            </button>

            <!-- TUTOR 3: BOTÓN CAMBIAR FOTO -->
            <button
              id="tutor-3"
              type="button"
              class="avatar-action btn-camera"
              :title="t('changePhotoTitle')"
              :aria-label="t('changePhotoTitle')"
              @click="openPhotoOptions"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleFileChange"
            />
          </div>

          <!-- NOMBRE -->
          <h2 class="main-title">
            {{ form.nombres || '—' }}
            <span>{{ form.apellidoPaterno || '—' }}</span>
          </h2>

          <!-- ESTADO -->
          <span class="status-badge">
            <i></i>
            {{ t('statusActive') }}
          </span>

          <p class="photo-hint">
            {{
              txt(
                'Toma una foto o selecciónala desde la galería.',
                'Take a photo or choose one from the gallery.'
              )
            }}
          </p>

          <!-- INFORMACIÓN RESUMIDA -->
          <dl class="profile-meta">

            <!-- TUTOR 4: ID -->
            <div id="tutor-4">
              <dt>ID</dt>
              <dd>{{ staffCode }}</dd>
            </div>

            <div>
              <dt>{{ txt('Rol', 'Role') }}</dt>
              <dd>{{ roleLabel }}</dd>
            </div>

            <div>
              <dt>{{ txt('Sedes', 'Locations') }}</dt>
              <dd>
                {{
                  isOwner
                    ? L('Todas', 'All', 'Tous', 'Todas')
                    : form.sedes.length
                }}
              </dd>
            </div>

            <div v-if="showScheduleCard">
              <dt>{{ t('workScheduleTitle') }}</dt>
              <dd>
                {{
                  showTimes && form.entrada && form.salida
                    ? `${form.entrada} – ${form.salida}`
                    : '—'
                }}
              </dd>
            </div>
          </dl>

          <!-- TUTOR 5: ESTADO -->
          <div id="tutor-5" class="profile-status-info">
            <span class="status-dot"></span>
            <div>
              <strong>
                {{ txt('Empleado activo', 'Active employee') }}
              </strong>
              <small>
                {{
                  txt(
                    'Registro habilitado en el sistema',
                    'Record enabled in the system'
                  )
                }}
              </small>
            </div>
          </div>
        </aside>

        <!-- ==================== FORMULARIOS ==================== -->
        <div class="forms-wrapper">

          <!-- ================================================== -->
          <!-- TUTOR 6: DATOS PERSONALES -->
          <!-- ================================================== -->
          <section id="tutor-6" class="login-card">
            <div class="card-header-flex">
              <div class="card-title-group">
                <span class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>

                <div>
                  <h3 class="section-title">
                    {{ t('personalDataTitle') }}
                  </h3>

                  <p>
                    {{
                      txt(
                        'Información personal e identificación del empleado registrado en el sistema',
                        'Personal and identification information of the registered employee'
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>

            <div class="form-grid-3">

              <!-- CURP -->
              <div class="input-group">
                <label for="p-curp">CURP</label>

                <input
                  id="p-curp"
                  v-model="form.curp"
                  type="text"
                  maxlength="18"
                  placeholder="CURP"
                />
              </div>

              <!-- NOMBRES -->
              <div class="input-group">
                <label for="p-nombres">
                  {{ t('namesLabel') }}
                  <span class="required">*</span>
                </label>

                <input
                  id="p-nombres"
                  v-model="form.nombres"
                  type="text"
                  autocomplete="given-name"
                  placeholder="Carlos Luis"
                />
              </div>

              <!-- APELLIDO PATERNO -->
              <div class="input-group">
                <label for="p-paterno">
                  {{ t('lastNamePaternalLabel') }}
                  <span class="required">*</span>
                </label>

                <input
                  id="p-paterno"
                  v-model="form.apellidoPaterno"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Ramírez"
                />
              </div>

              <!-- APELLIDO MATERNO -->
              <div class="input-group">
                <label for="p-materno">
                  {{ t('lastNameMaternalLabel') }}
                </label>

                <input
                  id="p-materno"
                  v-model="form.apellidoMaterno"
                  type="text"
                  placeholder="García"
                />
              </div>

              <!-- FECHA NACIMIENTO -->
              <div class="input-group">
                <label for="p-fecha">
                  {{ t('birthDateLabel') }}
                </label>

                <input
                  id="p-fecha"
                  v-model="form.fechaNacimiento"
                  type="date"
                />
              </div>

              <!-- CELULAR -->
              <div class="input-group">
                <label for="p-celular">
                  {{ t('phoneLabel') }}
                </label>

                <div class="input-with-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"
                    />
                  </svg>

                  <input
                    id="p-celular"
                    v-model="form.celular"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+52 000 000 0000"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- ================================================== -->
          <!-- TUTOR 7: REDES SOCIALES -->
          <!-- SOLO ENTRENADOR -->
          <!-- ================================================== -->
          <section
            v-if="isTrainer"
            id="tutor-7"
            class="login-card"
          >
            <div class="card-header-flex">
              <div class="card-title-group">
                <span class="card-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </span>

                <div>
                  <h3 class="section-title">
                    {{
                      L(
                        'Redes sociales',
                        'Social networks',
                        'Réseaux sociaux',
                        'Redes sociais'
                      )
                    }}
                  </h3>

                  <p>
                    {{
                      txt(
                        'Información profesional y redes sociales del entrenador',
                        'Trainer professional information and social media'
                      )
                    }}
                  </p>
                </div>
              </div>

              <span class="card-badge">
                {{
                  L(
                    'Opcional',
                    'Optional',
                    'Facultatif',
                    'Opcional'
                  )
                }}
              </span>
            </div>

            <div class="form-grid-2">

              <!-- FACEBOOK -->
              <div class="input-group">
                <label for="p-facebook">Facebook</label>

                <div class="social-input">
                  <span>f</span>

                  <input
                    id="p-facebook"
                    v-model="form.facebook"
                    type="text"
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <!-- INSTAGRAM -->
              <div class="input-group">
                <label for="p-instagram">Instagram</label>

                <div class="social-input">
                  <span>◎</span>

                  <input
                    id="p-instagram"
                    v-model="form.instagram"
                    type="text"
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <!-- TIKTOK -->
              <div class="input-group">
                <label for="p-tiktok">TikTok</label>

                <div class="social-input">
                  <span>♪</span>

                  <input
                    id="p-tiktok"
                    v-model="form.tiktok"
                    type="text"
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <!-- OTRAS REDES -->
              <div class="input-group">
                <label for="p-otras">
                  {{ t('otherAppsLabel') }}
                </label>

                <input
                  id="p-otras"
                  v-model="form.otrasApp"
                  type="text"
                  :placeholder="
                    txt(
                      'LinkedIn, sitio web, otras redes...',
                      'LinkedIn, website, other social networks...'
                    )
                  "
                />
              </div>
            </div>
          </section>

          <!-- ==================== BLOQUE INFERIOR ==================== -->
          <div
            class="lower-grid"
            :class="{ single: !showScheduleCard }"
          >

            <!-- ================================================== -->
            <!-- TUTOR 8: CREDENCIALES -->
            <!-- ================================================== -->
            <section id="tutor-8" class="login-card">
              <div class="card-header-flex">
                <div class="card-title-group">
                  <span class="card-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>

                  <div>
                    <h3 class="section-title">
                      {{ t('credentialsTitle') }}
                    </h3>

                    <p>
                      {{
                        txt(
                          'Rol, cuenta de acceso, contraseña y sedes autorizadas',
                          'Role, login account, password and authorized locations'
                        )
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="form-grid-2">

                <!-- ROL -->
                <div class="input-group">
                  <label>{{ t('systemRoleLabel') }}</label>

                  <div class="readonly-field">
                    <span class="role-chip">
                      {{ roleLabel }}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>

                <!-- CORREO -->
                <div class="input-group">
                  <label for="p-correo">
                    {{ t('emailLabel') }}
                    <span class="required">*</span>
                  </label>

                  <div class="input-with-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>

                    <input
                      id="p-correo"
                      v-model="form.correo"
                      type="email"
                      autocomplete="email"
                      placeholder="personal@gimnasio.com"
                    />
                  </div>
                </div>

                <!-- CONTRASEÑA -->
                <template v-if="needsPassword">
                  <div class="input-group">
                    <label for="p-password">
                      {{
                        L(
                          'Nueva contraseña',
                          'New password',
                          'Nouveau mot de passe',
                          'Nova senha'
                        )
                      }}
                    </label>

                    <input
                      id="p-password"
                      v-model="form.password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div class="input-group">
                    <label for="p-confirm">
                      {{
                        L(
                          'Confirmar contraseña',
                          'Confirm password',
                          'Confirmer le mot de passe',
                          'Confirmar senha'
                        )
                      }}
                    </label>

                    <input
                      id="p-confirm"
                      v-model="form.confirmPassword"
                      type="password"
                      autocomplete="new-password"
                      placeholder="••••••••"
                    />
                  </div>

                  <p class="field-hint span-full">
                    {{
                      L(
                        'Déjalo en blanco para conservar la contraseña actual.',
                        'Leave blank to keep the current password.',
                        'Laissez vide pour conserver le mot de passe actuel.',
                        'Deixe em branco para manter a senha atual.'
                      )
                    }}
                  </p>
                </template>

                <!-- ESPECIALIDAD -->
                <div
                  v-if="isTrainer"
                  class="input-group span-full"
                >
                  <label for="p-especialidad">
                    {{ t('specialtyLabel') }}
                    <span class="required">*</span>
                  </label>

                  <input
                    id="p-especialidad"
                    v-model="form.especialidad"
                    type="text"
                    :placeholder="txt('Musculación', 'Strength training')"
                  />
                </div>

                <!-- ==================== SEDES ==================== -->
                <div class="input-group span-full">
                  <label>
                    {{ t('locationLabel') }}
                    <span
                      v-if="!isOwner"
                      class="required"
                    >
                      *
                    </span>
                  </label>

                  <!-- PROPIETARIO -->
                  <div
                    v-if="isOwner"
                    class="sedes-static"
                  >
                    <span class="sedes-static-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>

                    <span class="sedes-static-text">
                      <strong>
                        {{
                          L(
                            'Todas las sucursales',
                            'All locations',
                            'Tous les sites',
                            'Todas as unidades'
                          )
                        }}
                      </strong>

                      <small>
                        {{ listaSedes.length }}
                        {{
                          L(
                            'sedes, incluidas las futuras',
                            'locations, including future ones',
                            'sites, y compris les futurs',
                            'unidades, incluindo as futuras'
                          )
                        }}
                      </small>
                    </span>
                  </div>

                  <!-- OTROS ROLES -->
                  <div
                    v-else
                    ref="dropdownRef"
                    class="custom-multiselect"
                  >
                    <button
                      type="button"
                      class="select-box-trigger"
                      :class="{ open: isDropdownOpen }"
                      :aria-expanded="isDropdownOpen"
                      aria-haspopup="listbox"
                      @click.stop="toggleDropdown"
                    >
                      <span
                        :class="{
                          'placeholder-text': form.sedes.length === 0
                        }"
                      >
                        {{ getSedesDisplayText() }}
                      </span>

                      <svg
                        class="dropdown-arrow"
                        :class="{ rotate: isDropdownOpen }"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <transition name="dropdown">
                      <div
                        v-if="isDropdownOpen"
                        class="dropdown-options-list"
                        @click.stop
                      >
                        <!-- TODAS LAS SEDES -->
                        <button
                          v-if="multiSedes"
                          type="button"
                          class="dropdown-option-item select-all"
                          :class="{ selected: allSedesSelected }"
                          @click="toggleAllSedes"
                        >
                          <span class="option-checkbox">
                            <svg
                              v-if="allSedesSelected"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>

                          <span>
                            {{
                              L(
                                'Todas las sedes',
                                'All locations',
                                'Tous les sites',
                                'Todas as unidades'
                              )
                            }}
                          </span>
                        </button>

                        <!-- SEDES -->
                        <button
                          v-for="sede in listaSedes"
                          :key="sede.id"
                          type="button"
                          class="dropdown-option-item"
                          :class="{
                            selected: form.sedes.includes(sede.id)
                          }"
                          @click="toggleSede(sede.id)"
                        >
                          <span
                            class="option-checkbox"
                            :class="{ radio: isReception }"
                          >
                            <svg
                              v-if="
                                form.sedes.includes(sede.id) &&
                                !isReception
                              "
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>

                            <span
                              v-else-if="
                                form.sedes.includes(sede.id) &&
                                isReception
                              "
                              class="radio-dot"
                            ></span>
                          </span>

                          <span>{{ sede.nombre }}</span>
                        </button>
                      </div>
                    </transition>
                  </div>

                  <p
                    v-if="sedesHint"
                    class="field-hint"
                  >
                    {{ sedesHint }}
                  </p>
                </div>
              </div>
            </section>

            <!-- ================================================== -->
            <!-- TUTOR 9: HORARIO -->
            <!-- ================================================== -->
            <section
              v-if="showScheduleCard"
              id="tutor-9"
              class="login-card"
            >
              <div class="card-header-flex">
                <div class="card-title-group">
                  <span class="card-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                  </span>

                  <div>
                    <h3 class="section-title">
                      {{ t('workScheduleTitle') }}
                    </h3>

                    <p>
                      {{
                        txt(
                          'Horario de entrada y salida asignado al empleado',
                          'Employee assigned check-in and check-out schedule'
                        )
                      }}
                    </p>
                  </div>
                </div>

                <span
                  class="card-badge"
                  :class="{
                    'required-badge':
                      scheduleMode === 'required'
                  }"
                >
                  {{
                    scheduleMode === 'required'
                      ? L(
                          'Obligatorio',
                          'Required',
                          'Obligatoire',
                          'Obrigatório'
                        )
                      : L(
                          'Opcional',
                          'Optional',
                          'Facultatif',
                          'Opcional'
                        )
                  }}
                </span>
              </div>

              <!-- INTERRUPTOR ENTRENADOR -->
              <label
                v-if="scheduleMode === 'optional'"
                class="switch-row"
              >
                <span class="switch-toggle">
                  <input
                    v-model="form.tieneHorario"
                    type="checkbox"
                  />

                  <span class="slider-round"></span>
                </span>

                <span class="switch-copy">
                  <strong>
                    {{
                      L(
                        'Asignar horario de trabajo',
                        'Assign work schedule',
                        'Attribuer un horaire de travail',
                        'Atribuir horário de trabalho'
                      )
                    }}
                  </strong>

                  <small>
                    {{
                      L(
                        'Actívalo solo si este entrenador tiene un horario fijo.',
                        'Turn it on only if this trainer has a fixed schedule.',
                        'Activez-le uniquement si cet entraîneur a un horaire fixe.',
                        'Ative apenas se este treinador tiver horário fixo.'
                      )
                    }}
                  </small>
                </span>
              </label>

              <!-- HORAS -->
              <div
                v-if="showTimes"
                class="form-grid-2"
                :class="{
                  'with-gap':
                    scheduleMode === 'optional'
                }"
              >
                <div class="input-group">
                  <label for="p-entrada">
                    {{ t('entryTimeLabel') }}

                    <span
                      v-if="scheduleMode === 'required'"
                      class="required"
                    >
                      *
                    </span>
                  </label>

                  <input
                    id="p-entrada"
                    v-model="form.entrada"
                    type="time"
                  />
                </div>

                <div class="input-group">
                  <label for="p-salida">
                    {{ t('exitTimeLabel') }}

                    <span
                      v-if="scheduleMode === 'required'"
                      class="required"
                    >
                      *
                    </span>
                  </label>

                  <input
                    id="p-salida"
                    v-model="form.salida"
                    type="time"
                  />
                </div>
              </div>

              <p
                v-if="showTimes"
                class="schedule-help"
              >
                {{
                  txt(
                    'Define la hora de entrada y salida del personal.',
                    'Set the staff check-in and check-out times.'
                  )
                }}
              </p>

              <div
                v-if="
                  showTimes &&
                  form.entrada &&
                  form.salida
                "
                class="schedule-summary"
              >
                <span>
                  {{
                    txt(
                      'Jornada configurada',
                      'Schedule configured'
                    )
                  }}
                </span>

                <strong>
                  {{ form.entrada }} — {{ form.salida }}
                </strong>
              </div>
            </section>
          </div>

          <!-- ================================================== -->
          <!-- TUTOR 10: GUARDAR CAMBIOS -->
          <!-- ================================================== -->
          <footer class="action-footer">
            <span class="required-hint">
              <span class="required">*</span>

              {{
                L(
                  'Campos obligatorios',
                  'Required fields',
                  'Champs obligatoires',
                  'Campos obrigatórios'
                )
              }}
            </span>

            <button
              id="tutor-10"
              type="button"
              class="btn-primary"
              :disabled="saving || loadingProfile"
              @click="saveChanges"
            >
              <span v-if="saving" class="btn-spinner"></span>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>

              {{
                saving
                  ? L(
                      'Procesando cambios...',
                      'Processing changes...',
                      'Traitement en cours...',
                      'Processando alterações...'
                    )
                  : t('saveChangesBtn')
              }}
            </button>
          </footer>
        </div>
      </div>
    </main>

    <!-- ====================================================== -->
    <!-- MODAL: OPCIONES DE FOTO -->
    <!-- ====================================================== -->
    <transition name="modal">
      <div
        v-if="showPhotoOptions"
        class="modal-overlay"
        @click.self="closePhotoOptions"
      >
        <div
          class="photo-modal"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <div>
              <h3>
                {{
                  txt(
                    'Actualizar fotografía',
                    'Update photo'
                  )
                }}
              </h3>

              <p>
                {{
                  txt(
                    'Selecciona cómo quieres agregar la fotografía.',
                    'Choose how you want to add the photo.'
                  )
                }}
              </p>
            </div>

            <button
              type="button"
              class="modal-close"
              :aria-label="txt('Cerrar', 'Close')"
              @click="closePhotoOptions"
            >
              ×
            </button>
          </header>

          <div class="photo-options">

            <!-- TOMAR FOTO -->
            <button
              type="button"
              class="photo-option"
              @click="takePhoto"
            >
              <span class="option-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>

              <span>
                <strong>
                  {{ txt('Tomar foto', 'Take photo') }}
                </strong>

                <small>
                  {{
                    txt(
                      'Utilizar la cámara de este dispositivo',
                      'Use this device camera'
                    )
                  }}
                </small>
              </span>

              <b>›</b>
            </button>

            <!-- GALERÍA -->
            <button
              type="button"
              class="photo-option"
              @click="selectPhoto"
            >
              <span class="option-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                  />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>

              <span>
                <strong>
                  {{
                    txt(
                      'Seleccionar de galería',
                      'Choose from gallery'
                    )
                  }}
                </strong>

                <small>
                  {{
                    txt(
                      'Seleccionar una imagen existente',
                      'Select an existing image'
                    )
                  }}
                </small>
              </span>

              <b>›</b>
            </button>
          </div>

          <button
            type="button"
            class="cancel-btn"
            @click="closePhotoOptions"
          >
            {{ txt('Cancelar', 'Cancel') }}
          </button>
        </div>
      </div>
    </transition>

    <!-- ====================================================== -->
    <!-- MODAL: CÁMARA -->
    <!-- ====================================================== -->
    <transition name="modal">
      <div
        v-if="showCamera"
        class="modal-overlay camera-overlay"
        @click.self="closeCamera"
      >
        <div
          class="camera-modal"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <div>
              <h3>
                {{ txt('Tomar fotografía', 'Take photo') }}
              </h3>

              <p>
                {{
                  cameraFacingMode === 'user'
                    ? txt(
                        'Cámara frontal',
                        'Front camera'
                      )
                    : txt(
                        'Cámara trasera',
                        'Rear camera'
                      )
                }}
              </p>
            </div>

            <button
              type="button"
              class="modal-close"
              :aria-label="txt('Cerrar', 'Close')"
              @click="closeCamera"
            >
              ×
            </button>
          </header>

          <div class="camera-preview">
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              :class="{
                'camera-mirrored':
                  cameraFacingMode === 'user'
              }"
            ></video>

            <button
              type="button"
              class="switch-camera-btn"
              :disabled="switchingCamera"
              @click.stop="switchCamera"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"
                />
                <path
                  d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
                />
              </svg>

              {{
                cameraFacingMode === 'user'
                  ? txt('Trasera', 'Rear')
                  : txt('Frontal', 'Front')
              }}
            </button>

            <div class="face-guide"></div>

            <div
              v-if="switchingCamera"
              class="camera-loading"
            >
              <span></span>
            </div>
          </div>

          <canvas
            ref="canvasRef"
            class="hidden-canvas"
          ></canvas>

          <div class="camera-actions">
            <button
              type="button"
              class="camera-cancel"
              @click="closeCamera"
            >
              {{ txt('Cancelar', 'Cancel') }}
            </button>

            <button
              type="button"
              class="capture-btn"
              :disabled="switchingCamera"
              @click="capturePhoto"
            >
              <i>
                <span></span>
              </i>

              {{ txt('Tomar foto', 'Take photo') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');

/* ============================ BUSCADOR CON SUGERENCIAS ============================ */

.page-header{position:relative;z-index:20;isolation:isolate}
.search-small{position:relative;z-index:21}
.client-suggestions{position:absolute;top:calc(100% + 8px);right:0;left:0;z-index:50;max-height:310px;overflow-y:auto;border:1px solid #39394e;border-radius:12px;background:#1b1b2b;box-shadow:0 18px 42px rgba(0,0,0,.45);padding:5px;box-sizing:border-box}
.client-suggestion{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border:0;border-radius:8px;background:transparent;color:#f5f5fa;text-align:left;cursor:pointer;font-family:inherit}
.client-suggestion:hover,.client-suggestion:focus-visible{background:#303047;outline:none}
.suggestion-avatar{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:rgba(238,80,126,.15);color:#ff789f;font-size:13px;font-weight:700}
.suggestion-info{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}
.suggestion-info strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600}
.suggestion-info small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;color:#a8a9c2}
.suggestion-id{flex-shrink:0;color:#a8a9c2;font-size:11px}
.suggestion-empty{margin:0;padding:12px;color:#b6b7c9;font-size:12px}
@media(max-width:640px){.client-suggestions{right:0;left:0;max-height:240px}}

.main-content {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #121416);
  --text: var(--color-texto-general, #e5e7eb);
  --title: var(--color-titulos, #ffffff);
  --muted: #8b95a7;
  --line: color-mix(in srgb, var(--text) 10%, transparent);
  --input: color-mix(in srgb, var(--card) 90%, #ffffff);
  --radius: 14px;

  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 36px 56px;
  box-sizing: border-box;
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

/* ============================ ENCABEZADO ============================ */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 26px;
}

.page-heading {
  min-width: 0;
}

.eyebrow {
  display: block;
  margin-bottom: 6px;
  color: var(--accent);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.page-header h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.7rem, 2.6vw, 2.25rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.page-header h1 span {
  color: var(--accent);
}

.page-header p {
  max-width: 600px;
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.55;
}

/* ============================ INPUTS ============================ */

.search-small {
  width: min(100%, 320px);
  flex-shrink: 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.input-group label {
  color: color-mix(in srgb, var(--text) 78%, transparent);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.2;
}

.required {
  color: #ef4444;
}

.input-group input {
  width: 100%;
  height: 44px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input);
  color: var(--color-texto-input, var(--text));
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.input-group input::placeholder {
  color: color-mix(in srgb, var(--muted) 70%, transparent);
  font-weight: 400;
}

.input-group input:hover {
  border-color: color-mix(in srgb, var(--text) 24%, transparent);
}

.input-group input:focus {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--input) 90%, var(--accent));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}

.input-group input[type='date'],
.input-group input[type='time'] {
  color-scheme: dark;
}

.input-group input[type='date']::-webkit-calendar-picker-indicator,
.input-group input[type='time']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
}

.field-hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.68rem;
  line-height: 1.45;
}

.search-input-wrapper,
.input-with-icon,
.social-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper svg,
.input-with-icon svg {
  position: absolute;
  z-index: 2;
  left: 13px;
  width: 16px;
  height: 16px;
  color: var(--muted);
  pointer-events: none;
}

.search-input-wrapper input,
.input-with-icon input {
  padding-left: 38px;
}

.social-input > span {
  position: absolute;
  z-index: 2;
  left: 13px;
  width: 18px;
  color: var(--accent);
  font-size: 0.84rem;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}

.social-input input {
  padding-left: 40px;
}

/* ============================ ROL (SOLO LECTURA) ============================ */

.readonly-field {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px dashed var(--line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--card) 96%, #ffffff);
}

.readonly-field svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--muted);
  opacity: 0.7;
}

.role-chip {
  display: inline-flex;
  align-items: center;
  min-height: 25px;
  padding: 4px 10px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--accent) 11%, transparent);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
}

/* ============================ ESTRUCTURA ============================ */

.profile-card {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.profile-section,
.login-card {
  box-sizing: border-box;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
}

/* ============================ SIN SELECCIÓN ============================ */

.empty-staff {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 24px;
  border-style: dashed;
  text-align: center;
}

.empty-staff svg {
  width: 42px;
  height: 42px;
  color: var(--muted);
  opacity: 0.55;
}

.empty-staff h3 {
  margin: 6px 0 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.empty-staff p {
  max-width: 380px;
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.55;
}

/* ============================ PERFIL ============================ */

.profile-section {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 22px 22px;
  overflow: hidden;
}

.profile-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--accent);
}

.avatar-wrapper {
  position: relative;
  width: 148px;
  margin-bottom: 20px;
}

.avatar-circle {
  position: relative;
  display: block;
  width: 148px;
  height: 148px;
  padding: 0;
  overflow: hidden;
  border: 2px solid color-mix(in srgb, var(--accent) 70%, transparent);
  border-radius: 50%;
  background: #080a0d;
  cursor: pointer;
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 8%, transparent);
}

.user-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--accent);
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
}

.avatar-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px 14px;
  background: rgba(0, 0, 0, 0.72);
  color: #ffffff;
  font-size: 0.66rem;
  font-weight: 600;
  transform: translateY(100%);
  transition: transform 0.2s ease;
}

.avatar-circle:hover .avatar-overlay,
.avatar-circle:focus-visible .avatar-overlay {
  transform: translateY(0);
}

.avatar-overlay svg {
  width: 14px;
  height: 14px;
}

.avatar-action {
  position: absolute;
  right: -6px;
  bottom: 4px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 3px solid var(--card);
  border-radius: 50%;
  background: var(--color-botones, var(--accent));
  color: var(--color-texto-botones, #ffffff);
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease;
}

.avatar-action:hover {
  transform: scale(1.08);
  filter: brightness(1.08);
}

.avatar-action svg {
  width: 16px;
  height: 16px;
}

.hidden-input,
.hidden-canvas {
  display: none;
}

.main-title {
  margin: 0 0 12px;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.15;
  text-align: center;
  text-transform: uppercase;
}

.main-title span {
  display: block;
  color: var(--accent);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.08);
  color: #34d399;
  font-size: 0.66rem;
  font-weight: 600;
}

.status-badge i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.photo-hint {
  margin: 16px 0 20px;
  color: var(--muted);
  font-size: 0.7rem;
  line-height: 1.5;
  text-align: center;
}

.profile-meta {
  width: 100%;
  margin: 0;
  padding-top: 6px;
  border-top: 1px solid var(--line);
}

.profile-meta > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 2px;
  border-bottom: 1px solid var(--line);
}

.profile-meta > div:last-child {
  padding-bottom: 2px;
  border-bottom: 0;
}

.profile-meta dt {
  color: var(--muted);
  font-size: 0.72rem;
}

.profile-meta dd {
  margin: 0;
  overflow: hidden;
  color: var(--title);
  font-size: 0.76rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================ FORMULARIOS ============================ */

.forms-wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.login-card {
  padding: 24px;
  overflow: visible;
}

.card-header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
}

.card-icon svg {
  width: 17px;
  height: 17px;
}

.card-title-group p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 0.7rem;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--text) 4%, transparent);
  color: var(--muted);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.card-badge.required-badge {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  background: color-mix(in srgb, var(--accent) 11%, transparent);
  color: var(--accent);
}

.section-title {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-grid-2.with-gap {
  margin-top: 16px;
}

.form-grid-3 .span-full,
.form-grid-2 .span-full {
  grid-column: 1 / -1;
}

.lower-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

.lower-grid.single {
  grid-template-columns: 1fr;
}

/* ============================ MULTISELECT ============================ */

.custom-multiselect {
  position: relative;
  width: 100%;
}

.select-box-trigger {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.select-box-trigger > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-box-trigger:hover {
  border-color: color-mix(in srgb, var(--text) 24%, transparent);
}

.select-box-trigger.open {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
}

.placeholder-text {
  color: var(--muted);
  font-weight: 400;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--muted);
  transition: transform 0.18s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-options-list {
  position: absolute;
  z-index: 200;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  max-height: 240px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--bg-cards, #121416);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.dropdown-option-item {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.dropdown-option-item:hover {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text);
}

.dropdown-option-item.selected {
  background: color-mix(in srgb, var(--accent) 13%, transparent);
  color: #93c5fd;
}

.dropdown-option-item.select-all {
  margin-bottom: 4px;
  border-bottom: 1px solid var(--line);
  border-radius: 8px 8px 0 0;
  color: var(--text);
  font-weight: 600;
}

.option-checkbox {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--text) 25%, transparent);
  border-radius: 4px;
}

.option-checkbox.radio {
  border-radius: 50%;
}

.radio-dot {
  width: 7px;
  height: 7px;
  display: block;
  border-radius: 50%;
  background: #ffffff;
}

.dropdown-option-item.selected .option-checkbox {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}

.option-checkbox svg {
  width: 10px;
  height: 10px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.985);
}

/* ============================ PROPIETARIO: TODAS LAS SEDES ============================ */

.sedes-static {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 13px;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 7%, transparent);
}

.sedes-static-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}

.sedes-static-icon svg {
  width: 16px;
  height: 16px;
}

.sedes-static-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sedes-static-text strong {
  color: var(--title);
  font-size: 0.8rem;
  font-weight: 600;
}

.sedes-static-text small {
  color: var(--muted);
  font-size: 0.68rem;
}

/* ============================ HORARIO ============================ */

.switch-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--text) 2.5%, transparent);
  cursor: pointer;
  transition: border-color 0.18s ease;
}

.switch-row:hover {
  border-color: color-mix(in srgb, var(--text) 24%, transparent);
}

.switch-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.switch-copy strong {
  color: var(--title);
  font-size: 0.8rem;
  font-weight: 600;
}

.switch-copy small {
  color: var(--muted);
  font-size: 0.68rem;
  line-height: 1.4;
}

.switch-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.switch-toggle input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.slider-round {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: #2a2e39;
  transition: background 0.2s ease;
}

.slider-round::before {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.switch-toggle input:checked + .slider-round {
  background: var(--accent);
}

.switch-toggle input:checked + .slider-round::before {
  transform: translateX(18px);
}

.switch-toggle input:focus-visible + .slider-round {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}

.schedule-help {
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 0.72rem;
  line-height: 1.5;
}

.schedule-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  padding: 11px 13px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 10px;
  background: rgba(52, 211, 153, 0.07);
  color: #34d399;
  font-size: 0.72rem;
}

.schedule-summary strong {
  font-size: 0.78rem;
}

/* ============================ GUARDAR ============================ */

.action-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.required-hint {
  color: var(--muted);
  font-size: 0.7rem;
}

.btn-primary {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 28px;
  border: 0;
  border-radius: 10px;
  background: var(--color-botones, var(--accent));
  color: var(--color-texto-botones, #ffffff);
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease;
}

.btn-primary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary svg {
  width: 16px;
  height: 16px;
}

.btn-primary:disabled,
.btn-primary:disabled:hover {
  opacity: 0.65;
  cursor: not-allowed;
  filter: none;
  transform: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ============================ FOCO VISIBLE ============================ */

.avatar-circle:focus-visible,
.avatar-action:focus-visible,
.btn-primary:focus-visible,
.select-box-trigger:focus-visible,
.dropdown-option-item:focus-visible,
.photo-option:focus-visible,
.modal-close:focus-visible,
.cancel-btn:focus-visible,
.camera-cancel:focus-visible,
.capture-btn:focus-visible,
.switch-camera-btn:focus-visible {
  outline: 2px solid var(--color-highlight, #3b82f6);
  outline-offset: 2px;
}

/* ============================ MODALES ============================ */

.modal-overlay {
  position: fixed;
  z-index: 4000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(3px);
}

.camera-overlay {
  z-index: 4100;
  background: rgba(0, 0, 0, 0.92);
}

.photo-modal,
.camera-modal {
  width: min(100%, 440px);
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: var(--bg-cards, #121416);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
}

.camera-modal {
  width: min(100%, 620px);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: var(--color-titulos, #ffffff);
  font-family: 'Oswald', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  text-transform: uppercase;
}

.modal-header p {
  margin: 6px 0 0;
  color: #8b95a7;
  font-size: 0.74rem;
  line-height: 1.5;
}

.modal-close {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.modal-close:hover {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.09);
}

/* ============================ OPCIONES FOTO ============================ */

.photo-options {
  display: grid;
  gap: 10px;
}

.photo-option {
  width: 100%;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.photo-option:hover {
  border-color: var(--color-highlight, #3b82f6);
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 7%, transparent);
}

.option-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 13%, transparent);
  color: var(--color-highlight, #60a5fa);
}

.option-icon svg {
  width: 20px;
  height: 20px;
}

.photo-option strong {
  display: block;
  color: var(--color-titulos, #ffffff);
  font-size: 0.8rem;
}

.photo-option small {
  display: block;
  margin-top: 3px;
  color: #8b95a7;
  font-size: 0.68rem;
}

.photo-option b {
  color: #8b95a7;
  font-size: 1.2rem;
}

.cancel-btn,
.camera-cancel {
  height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: transparent;
  color: #aab2c0;
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.cancel-btn:hover,
.camera-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.cancel-btn {
  width: 100%;
  margin-top: 14px;
}

/* ============================ CÁMARA ============================ */

.camera-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: #000000;
}

.camera-preview video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-mirrored {
  transform: scaleX(-1);
}

.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 46%;
  height: 70%;
  border: 2px dashed rgba(255, 255, 255, 0.38);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.switch-camera-btn {
  position: absolute;
  z-index: 3;
  top: 12px;
  right: 12px;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 13px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
}

.switch-camera-btn:disabled,
.capture-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.switch-camera-btn svg {
  width: 15px;
  height: 15px;
}

.camera-loading {
  position: absolute;
  z-index: 4;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.25);
}

.camera-loading span {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.camera-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.capture-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 18px 7px 7px;
  border: 0;
  border-radius: 999px;
  background: var(--color-botones, #2563eb);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.18s ease, transform 0.18s ease;
}

.capture-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.capture-btn i {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.capture-btn i span {
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: #ffffff;
}

/* ============================ TRANSICIONES ============================ */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============================ TOAST ============================ */

:deep(.notification-container),
:deep(.toast-container) {
  width: calc(100% - 32px) !important;
  max-width: 480px !important;
  left: 50% !important;
  right: auto !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  transform: translateX(-50%) !important;
}

/* ============================ TABLET ============================ */

@media (max-width: 1100px) {
  .profile-card {
    grid-template-columns: 250px minmax(0, 1fr);
  }

  .form-grid-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lower-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================ MÓVIL / TABLET ============================ */

@media (max-width: 900px) {
  .main-content {
    padding: 22px 18px 40px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .search-small {
    width: 100%;
  }

  .profile-card {
    grid-template-columns: 1fr;
  }

  .profile-section {
    position: relative;
    top: auto;
  }

  .forms-wrapper {
    gap: 16px;
  }
}

/* ============================ TELÉFONO ============================ */

@media (max-width: 600px) {
  .main-content {
    padding: 16px 12px 32px;
  }

  .page-header {
    margin-bottom: 18px;
  }

  .page-header h1 {
    font-size: 1.45rem;
  }

  .profile-section {
    padding: 22px 16px 16px;
  }

  .login-card {
    padding: 18px 16px;
  }

  .card-header-flex {
    align-items: flex-start;
  }

  .form-grid-3,
  .form-grid-2 {
    grid-template-columns: 1fr;
  }

  .form-grid-3 .span-full,
  .form-grid-2 .span-full {
    grid-column: auto;
  }

  .action-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .btn-primary {
    width: 100%;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 8px;
  }

  .photo-modal,
  .camera-modal {
    padding: 18px 16px;
    border-radius: 16px;
  }

  .camera-overlay {
    align-items: center;
  }

  .camera-actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .camera-cancel,
  .capture-btn {
    width: 100%;
    justify-content: center;
  }

  .face-guide {
    width: 52%;
    height: 68%;
  }

  .dropdown-options-list {
    max-height: 200px;
  }
}

@media (max-width: 380px) {
  .main-content {
    padding-right: 8px;
    padding-left: 8px;
  }
}
</style>