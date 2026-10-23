<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import RegisterGymModal from '../../Record/Record-Gym.vue';
import { traducciones } from '../i18n.js';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

// --- MAPA REAL (Leaflet + OpenStreetMap) ---
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const router = useRouter();
const originalEmail = ref('contacto@ironfitness.com');

/* =========================================================
   TRADUCCIONES
   Si una clave no existe en i18n.js se usa este respaldo en
   español, así nunca se muestra el nombre crudo de la clave
   (por ejemplo "labelPostalCode").
   ========================================================= */
const FALLBACKS: Record<string, string> = {
  statusActive: 'Activo',
  statusPending: 'Pendiente',
  statusSuspended: 'Suspendido',
  avatarUploadTitle: 'Cambiar fotografía',
  avatarPreviewAlt: 'Foto del gimnasio',
  avatarChangeTitle: 'Cambiar fotografía',
  profileHintText: 'Esta imagen identifica a tu gimnasio dentro de la plataforma.',
  sectionGymInfo: 'Datos del gimnasio',
  labelCoverPhoto: 'Foto de portada',
  coverPreviewAlt: 'Portada del gimnasio',
  coverPlaceholderText: 'Haz clic para seleccionar una imagen',
  labelGymName: 'Nombre del gimnasio',
  btnAddBranch: 'Agregar sede',
  sectionGymDetailsTitle: 'Acerca del gimnasio',
  labelGymDescription: 'Descripción del gimnasio',
  placeholderGymDescription: 'Describe las instalaciones, servicios y ambiente de tu gimnasio…',
  labelAmenitiesServices: 'Amenidades y servicios',
  placeholderNewAmenity: 'Ej. Zona de crossfit',
  btnAddAmenity: 'Agregar',
  titleRemoveAmenity: 'Quitar amenidad',
  sectionGeographicLocation: 'Ubicación del Establecimiento',
  labelState: 'Entidad Federativa',
  labelMunicipality: 'Municipio / Alcaldía',
  labelNeighborhood: 'Colonia',
  labelPostalCode: 'Código postal',
  labelStreet: 'Calle',
  labelOpenDays: 'Días de servicio',
  labelSchedulesPerDay: 'Horarios por día',
  labelOpens: 'Abre',
  labelCloses: 'Cierra',
  labelMonthlyPrice: 'Precio mensual',
  labelWeeklyPrice: 'Precio semanal',
  labelEmailModifiable: 'Correo de acceso',
  labelNewPassword: 'Nueva contraseña',
  passwordPlaceholder: 'Mínimo 8 caracteres',
  labelConfirmPassword: 'Confirmar contraseña',
  confirmPasswordPlaceholder: 'Repite la contraseña',
  btnSaveDataset: 'Guardar cambios',
  credentialsUpdateModalTitle: 'Actualizar credenciales',
  emailChangeWarningText: 'Cambiaste el correo de acceso. Define una nueva contraseña para continuar; se cerrará tu sesión.',
  newAccessPasswordLabel: 'Nueva contraseña de acceso',
  enterNewPasswordPlaceholder: 'Escribe la nueva contraseña',
  confirmPasswordLabel: 'Confirmar contraseña',
  confirmNewPasswordPlaceholder: 'Repite la nueva contraseña',
  cancelBtn: 'Cancelar',
  confirmChangeBtn: 'Confirmar cambio',
  modalAddSedeTitle: 'Agregar nueva sede',
  passwordWarningMsg: 'Las contraseñas no coinciden o están vacías.',
  emailChangedMsg: 'Correo actualizado. Inicia sesión de nuevo.',
  'Guardado Correctamente': 'Guardado correctamente',
};

const t = (key: string) => {
  const dict = traducciones as Record<string, Record<string, string>>;
  const langTable = dict[currentLang.value] || dict['es'] || {};
  const fallbackTable = dict['es'] || {};
  return langTable[key] || fallbackTable[key] || FALLBACKS[key] || key;
};

// Traducción con texto de respaldo propio
const tr = (key: string, fallback: string) => {
  const v = (() => {
    const dict = traducciones as Record<string, Record<string, string>>;
    const langTable = dict[currentLang.value] || dict['es'] || {};
    const fallbackTable = dict['es'] || {};
    return langTable[key] || fallbackTable[key] || '';
  })();
  return v || fallback;
};

// Texto rápido es / en
const txt = (es: string, en: string) => (currentLang.value === 'en' ? en : es);

const handleLangChange = (e: Event) => {
  const customEvent = e as CustomEvent<{ idioma?: string }>;
  if (customEvent.detail && customEvent.detail.idioma) {
    currentLang.value = customEvent.detail.idioma;
  }
};

/* =========================================================
   NAVEGACIÓN LATERAL (con scroll spy)
   ========================================================= */
type NavSection = {
  id: string;
  title: [string, string];
  desc: [string, string];
  icon: string[];
};

const sections: NavSection[] = [
  {
    id: 'gym-info',
    title: ['navGeneral', 'Información general'],
    desc: ['navGeneralDesc', 'Perfil y sedes'],
    icon: ['M3 21h18', 'M5 21V7l7-4 7 4v14', 'M9 21v-5h6v5'],
  },
  {
    id: 'gym-details',
    title: ['navDetails', 'Acerca del gimnasio'],
    desc: ['navDetailsDesc', 'Descripción y amenidades'],
    icon: ['M4 5h16', 'M4 12h16', 'M4 19h10'],
  },
  {
    id: 'gym-location',
    title: ['navLocation', 'Ubicación'],
    desc: ['navLocationDesc', 'Dirección y mapa'],
    icon: ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  },
  {
    id: 'gym-operation',
    title: ['navOperation', 'Operación'],
    desc: ['navOperationDesc', 'Horarios y precios'],
    icon: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
  },
  {
    id: 'gym-security',
    title: ['navSecurity', 'Seguridad y acceso'],
    desc: ['navSecurityDesc', 'Correo y contraseña'],
    icon: ['M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M8 10V7a4 4 0 0 1 8 0v3'],
  },
];

const activeSection = ref('gym-info');
let sectionObserver: IntersectionObserver | null = null;

const scrollToSection = (id: string) => {
  activeSection.value = id;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const initScrollSpy = () => {
  if (!('IntersectionObserver' in window)) return;
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id;
      });
    },
    { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) sectionObserver!.observe(el);
  });
};

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange as EventListener);
  initMap();
  initScrollSpy();
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  window.removeEventListener('resize', handleWindowResizeMap);

  if (geocodeTimer) clearTimeout(geocodeTimer);

  resizeObserver?.disconnect();
  resizeObserver = null;

  sectionObserver?.disconnect();
  sectionObserver = null;

  mapInstance?.remove();
  mapInstance = null;

  // Apagar la cámara si el usuario cambia de pantalla con ella abierta
  stopCamera();

  if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value);
  if (previewCoverImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewCoverImage.value);
});

type Dia = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom';
type Turno = { abierto: string; cerrado: string };
type Horario = { activo: boolean; turnos: Turno[] };

const allDays: Dia[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const fileInput = ref<HTMLInputElement | null>(null);
const previewImage = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

const coverFileInput = ref<HTMLInputElement | null>(null);
const previewCoverImage = ref<string | null>(null);

const showPassword = ref(false);

const showAddSedeModal = ref(false);
const showEmailModal = ref(false);

const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const handleSaveChanges = () => {
  const diaInvalido = diasSeleccionados.value.find((d) => errorDia(d));
  if (diaInvalido) {
    showNotification(`${diaInvalido}: ${errorDia(diaInvalido)}`, 'warning', 5000);
    scrollToSection('gym-operation');
    return;
  }
  if (!isValidEmail(form.email)) {
    showNotification(txt('Escribe un correo válido.', 'Enter a valid email.'), 'warning');
    return;
  }
  if (form.email.trim() !== originalEmail.value) {
    showEmailModal.value = true;
  } else {
    showNotification(t('Guardado Correctamente'), 'success');
  }
};

const form = reactive({
  nombreGimnasio: 'Iron Fitness Center',
  nombrePropietario: 'Juan Carlos Pérez Gómez',
  entidad: 'San Luis Potosí',
  municipio: 'Ciudad Valles',
  cp: '79000',
  status: 'activo',

  colonia: 'Zona Centro',
  calle: 'Av. Universitaria',
  otrasCalles: '',
  numExt: '420',
  numInt: '',
  selectedDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as Dia[],
  precioMes: '450',
  precioSem: '150',
  email: 'contacto@ironfitness.com',
  password: '',
  confirmPassword: '',
  membresiaActual: 'Plan Pro - Sede Principal (Activa)',
  tipoMembresia: 'pro',
  descripcionGimnasio: 'Instalaciones de clase mundial con tecnología de seguimiento biomecánico y áreas especializadas para entrenamiento de alto rendimiento.',
  nuevaAmenidadTexto: '',
  amenidades: [
    { id: 1, nombre: 'Estacionamiento Gratuito' },
    { id: 2, nombre: 'Regaderas y Lockers' },
    { id: 3, nombre: 'Wi-Fi de Alta Velocidad' },
    { id: 4, nombre: 'Zona de Sauna' },
    { id: 5, nombre: 'Bebidas Energéticas' }
  ],
  horariosCompletos: {
    'Lun': { activo: true, turnos: [{ abierto: '06:00', cerrado: '23:00' }] },
    'Mar': { activo: true, turnos: [{ abierto: '06:00', cerrado: '23:00' }] },
    'Mié': { activo: true, turnos: [{ abierto: '06:00', cerrado: '23:00' }] },
    'Jue': { activo: true, turnos: [{ abierto: '06:00', cerrado: '23:00' }] },
    'Vie': { activo: true, turnos: [{ abierto: '06:00', cerrado: '23:00' }] },
    'Sáb': { activo: true, turnos: [{ abierto: '07:00', cerrado: '20:00' }] },
    'Dom': { activo: true, turnos: [{ abierto: '08:00', cerrado: '16:00' }] }
  } as Record<Dia, Horario>,
  latitud: '21.9903',
  longitud: '-99.0152',
  mapZoomLevel: 15
});

const isProMember = computed(() => form.tipoMembresia.toLowerCase() === 'pro');

// Días seleccionados, siempre en orden de la semana
const diasSeleccionados = computed(() => allDays.filter((d) => form.selectedDays.includes(d)));

const toggleDay = (day: Dia) => {
  const index = form.selectedDays.indexOf(day);
  if (index > -1) form.selectedDays.splice(index, 1);
  else form.selectedDays.push(day);
};


/* ---------- Turnos por día (horario partido) ---------- */
const MAX_TURNOS = 3;

const toMin = (h: string) => {
  const [hh = 0, mm = 0] = (h || '').split(':').map(Number);
  return hh * 60 + mm;
};
const pad2 = (n: number) => String(n).padStart(2, '0');
const fromMin = (m: number) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
const fmt12 = (h: string) => {
  if (!h) return '--:--';
  const [hh = 0, mm = 0] = h.split(':').map(Number);
  const suf = hh >= 12 ? 'p. m.' : 'a. m.';
  return `${(hh % 12) || 12}:${pad2(mm)} ${suf}`;
};

const resumenDia = (dia: Dia) => {
  const d = form.horariosCompletos[dia];
  if (!d.activo) return tr('labelClosed', 'Cerrado');
  return d.turnos.map((t) => `${fmt12(t.abierto)} – ${fmt12(t.cerrado)}`).join('  ·  ');
};

const errorDia = (dia: Dia): string => {
  const d = form.horariosCompletos[dia];
  if (!d.activo) return '';
  for (const t of d.turnos) {
    if (!t.abierto || !t.cerrado) return txt('Completa todas las horas del día.', 'Fill in all times for this day.');
    if (toMin(t.cerrado) <= toMin(t.abierto))
      return txt('La hora de cierre debe ser posterior a la de apertura.', 'Closing time must be after opening time.');
  }
  const orden = [...d.turnos].sort((a, b) => toMin(a.abierto) - toMin(b.abierto));
  for (let i = 1; i < orden.length; i++) {
    const actual = orden[i];
    const previo = orden[i - 1];
    if (actual && previo && toMin(actual.abierto) < toMin(previo.cerrado))
      return txt('Los turnos de un mismo día no pueden traslaparse.', 'Shifts on the same day cannot overlap.');
  }
  return '';
};

const agregarTurno = (dia: Dia) => {
  const d = form.horariosCompletos[dia];
  if (d.turnos.length >= MAX_TURNOS) return;
  const ultimo = d.turnos[d.turnos.length - 1];
  const ini = Math.min(toMin(ultimo?.cerrado || '13:00') + 120, 22 * 60);
  const fin = Math.min(ini + 180, 23 * 60 + 59);
  d.turnos.push({ abierto: fromMin(ini), cerrado: fromMin(fin) });
};

const quitarTurno = (dia: Dia, index: number) => {
  const d = form.horariosCompletos[dia];
  if (d.turnos.length > 1) d.turnos.splice(index, 1);
};

const copiarATodos = (dia: Dia) => {
  const origen = form.horariosCompletos[dia];
  allDays.forEach((otro) => {
    if (otro === dia) return;
    form.horariosCompletos[otro].turnos = origen.turnos.map((t) => ({ ...t }));
    form.horariosCompletos[otro].activo = origen.activo;
  });
  showNotification(txt('Horario copiado a los demás días.', 'Schedule copied to the other days.'), 'success');
};

const agregarAmenidad = () => {
  if (!form.nuevaAmenidadTexto.trim()) return;
  form.amenidades.push({
    id: Date.now(),
    nombre: form.nuevaAmenidadTexto.trim()
  });
  form.nuevaAmenidadTexto = '';
  showNotification('Amenidad agregada correctamente', 'success');
};

const eliminarAmenidad = (id: number) => {
  form.amenidades = form.amenidades.filter(a => a.id !== id);
  showNotification('Amenidad eliminada', 'info');
};

const showNotification = (
  msg: string,
  type: 'success' | 'warning' | 'info' | 'error' = 'success',
  duration = 4000
) => {
  toastRef.value?.notify(msg, type, duration);
};

/* =========================================================
   FOTO DEL GIMNASIO (cámara o galería)
   ========================================================= */
const showPhotoOptions = ref(false);
const openPhotoOptions = () => (showPhotoOptions.value = true);
const closePhotoOptions = () => (showPhotoOptions.value = false);

const selectPhoto = () => {
  showPhotoOptions.value = false;
  if (!fileInput.value) return;
  fileInput.value.value = '';
  fileInput.value.click();
};

const setAvatarFile = (file: File) => {
  if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value);
  avatarFile.value = file;
  previewImage.value = URL.createObjectURL(file);
};

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showNotification(txt('Selecciona una imagen válida.', 'Select a valid image.'), 'warning');
    input.value = '';
    return;
  }

  setAvatarFile(file);
  showNotification(tr('toastLogoUpdated', 'Foto actualizada correctamente'), 'success');
  input.value = '';
};

/* ---------- Cámara real ---------- */
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const cameraStream = ref<MediaStream | null>(null);
// user = frontal · environment = trasera
const cameraFacingMode = ref<'user' | 'environment'>('user');
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

  if (!videoRef.value) throw new Error('No se encontró el visor de cámara.');

  videoRef.value.srcObject = stream;
  await videoRef.value.play();
};

const takePhoto = async () => {
  showPhotoOptions.value = false;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showNotification(
      txt('Este navegador no permite utilizar la cámara.', 'Camera is not supported by this browser.'),
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

    const name = (error as DOMException)?.name;
    let message = txt('No se pudo acceder a la cámara.', 'Could not access the camera.');

    if (name === 'NotAllowedError') {
      message = txt(
        'Permiso de cámara rechazado. Actívalo desde el navegador.',
        'Camera permission was denied. Enable it in your browser.'
      );
    }
    if (name === 'NotFoundError') {
      message = txt('No se encontró una cámara en este dispositivo.', 'No camera was found on this device.');
    }
    if (name === 'NotReadableError') {
      message = txt(
        'La cámara está siendo utilizada por otra aplicación.',
        'The camera is being used by another application.'
      );
    }

    showNotification(message, 'warning');
  }
};

const closeCamera = () => {
  stopCamera();
  showCamera.value = false;
  switchingCamera.value = false;
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

    showNotification(
      txt('La cámara seleccionada no está disponible.', 'The selected camera is not available.'),
      'warning'
    );
  } finally {
    switchingCamera.value = false;
  }
};

const capturePhoto = () => {
  if (switchingCamera.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;

  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    showNotification(txt('La cámara todavía no está lista.', 'The camera is not ready yet.'), 'warning');
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    showNotification(txt('No se pudo procesar la fotografía.', 'Could not process the photo.'), 'error');
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (cameraFacingMode.value === 'user') {
    // Frontal: se guarda como se ve en la vista previa (espejo)
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
      if (!blob) {
        showNotification(txt('No se pudo capturar la fotografía.', 'Could not capture the photo.'), 'error');
        return;
      }

      const file = new File([blob], `gimnasio-${Date.now()}.jpg`, { type: 'image/jpeg' });

      setAvatarFile(file);
      closeCamera();

      showNotification(txt('Foto tomada correctamente.', 'Photo captured successfully.'), 'success');
    },
    'image/jpeg',
    0.92
  );
};

/* ---------- Portada ---------- */
const triggerCoverFileInput = () => coverFileInput.value?.click();
const onCoverFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    if (!file.type.startsWith('image/')) {
      showNotification(txt('Selecciona una imagen válida.', 'Select a valid image.'), 'warning');
      input.value = '';
      return;
    }
    if (previewCoverImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewCoverImage.value);
    previewCoverImage.value = URL.createObjectURL(file);
    showNotification('Foto de portada actualizada correctamente', 'info');
  }
  input.value = '';
};

const confirmEmailAndPasswordChange = () => {
  if (!form.password || form.password !== form.confirmPassword) {
    showNotification(t('passwordWarningMsg'), 'warning');
    return;
  }
  // Lógica de guardado...
  originalEmail.value = form.email.trim();
  showEmailModal.value = false;
  showNotification(t('emailChangedMsg'), 'info', 5000);

  setTimeout(() => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    router.replace({ name: 'login' });
  }, 2000);
};

const handleAddSede = () => {
  if (!isProMember.value) {
    showNotification(tr('toastProOnlySede', 'Función exclusiva para miembros Pro'), 'warning');
    return;
  }
  showAddSedeModal.value = true;
};

/* =========================================================
   MAPA REAL: Leaflet + OpenStreetMap
   ========================================================= */
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let marker: L.Marker | null = null;
let accuracyCircle: L.Circle | null = null;
let baseLayer: L.TileLayer | null = null;
let resizeObserver: ResizeObserver | null = null;
let geocodeTimer: ReturnType<typeof setTimeout> | null = null;
let geocodeToken = 0;

const mapCargando = ref(true);
const direccionBusqueda = ref('');
const buscandoDireccion = ref(false);
const obteniendoUbicacion = ref(false);
const resolviendoDireccion = ref(false);
const locationStatus = ref<'idle' | 'ok' | 'partial' | 'error'>('idle');
const locationMessage = ref('');

type MapStyle = 'calles' | 'satelite';
const mapStyle = ref<MapStyle>('calles');

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string; maxZoom: number; subdomains?: string }> = {
  calles: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  },
};

function handleWindowResizeMap() {
  mapInstance?.invalidateSize();
}

function aplicarCapaBase() {
  if (!mapInstance) return;
  if (baseLayer) mapInstance.removeLayer(baseLayer);
  const cfg = TILE_LAYERS[mapStyle.value];
  baseLayer = L.tileLayer(cfg.url, {
    attribution: cfg.attribution,
    maxZoom: cfg.maxZoom,
    ...(cfg.subdomains ? { subdomains: cfg.subdomains } : {}),
  }).addTo(mapInstance);
  baseLayer.bringToBack();
}

function cambiarEstiloMapa(id: MapStyle) {
  if (mapStyle.value === id) return;
  mapStyle.value = id;
  aplicarCapaBase();
}

function initMap() {
  if (!mapContainer.value) return;

  const lat = parseFloat(form.latitud) || 21.9903;
  const lng = parseFloat(form.longitud) || -99.0152;

  mapInstance = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: form.mapZoomLevel,
    zoomControl: false,
    attributionControl: false,
  });
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(mapInstance);
  aplicarCapaBase();

  const pinIcon = L.divIcon({
    className: 'gym-pin',
    html: '<span class="gym-pin-body"><span class="gym-pin-dot"></span></span>',
    iconSize: [36, 42],
    iconAnchor: [18, 40],
    popupAnchor: [0, -38],
  });

  marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(mapInstance);
  actualizarPopupMarcador(true);

  marker.on('dragend', () => {
    const pos = marker!.getLatLng();
    guardarCoordenadas(pos.lat, pos.lng);
  });

  mapInstance.on('click', (e: L.LeafletMouseEvent) => {
    guardarCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  mapInstance.on('zoomend', () => {
    form.mapZoomLevel = mapInstance!.getZoom();
  });

  const finalizarCarga = () => {
    mapInstance?.invalidateSize();
    mapCargando.value = false;
  };
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(finalizarCarga, 250)));

  if ('ResizeObserver' in window && mapContainer.value) {
    resizeObserver = new ResizeObserver(() => mapInstance?.invalidateSize());
    resizeObserver.observe(mapContainer.value);
  }
  window.addEventListener('resize', handleWindowResizeMap);
}

/* ---------- Círculo de precisión ---------- */
function limpiarCirculoPrecision() {
  if (accuracyCircle) {
    accuracyCircle.remove();
    accuracyCircle = null;
  }
}

function dibujarCirculoPrecision(lat: number, lng: number, radio: number) {
  limpiarCirculoPrecision();
  if (!mapInstance || !radio) return;
  accuracyCircle = L.circle([lat, lng], {
    radius: radio,
    color: '#60a5fa',
    weight: 1,
    fillColor: '#3b82f6',
    fillOpacity: 0.12,
  }).addTo(mapInstance);
}

/* ---------- Popup del pin ---------- */
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function actualizarPopupMarcador(abrir = false) {
  if (!marker) return;
  const linea = [
    form.calle && `${form.calle}${form.numExt ? ' #' + form.numExt : ''}`,
    form.colonia,
  ].filter(Boolean).join(', ');
  const html = `<strong>${escapeHtml(form.nombreGimnasio)}</strong>${linea ? '<br>' + escapeHtml(linea) : ''}`;
  if (marker.getPopup()) marker.setPopupContent(html);
  else marker.bindPopup(html);
  if (abrir) marker.openPopup();
}

watch(
  () => [form.nombreGimnasio, form.calle, form.numExt, form.colonia],
  () => actualizarPopupMarcador()
);

/* ---------- Coordenadas ---------- */
function guardarCoordenadas(lat: number, lng: number) {
  form.latitud = lat.toFixed(6);
  form.longitud = lng.toFixed(6);
  marker?.setLatLng([lat, lng]);
  limpiarCirculoPrecision();
  if (geocodeTimer) clearTimeout(geocodeTimer);
  geocodeTimer = setTimeout(() => resolverDireccion(lat, lng), 500); // evita saturar Nominatim
}

// Aplica coordenadas escritas a mano. Solo actúa si realmente cambiaron
// (así un simple "blur" ya no sobrescribe la dirección).
function aplicarCoordenadasManuales() {
  const lat = parseFloat(form.latitud);
  const lng = parseFloat(form.longitud);
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    showNotification(tr('toastInvalidCoords', 'Coordenadas inválidas'), 'warning');
    return;
  }

  const actual = marker?.getLatLng();
  if (actual && Math.abs(actual.lat - lat) < 1e-6 && Math.abs(actual.lng - lng) < 1e-6) return;

  mapInstance?.setView([lat, lng], Math.max(form.mapZoomLevel, 16));
  guardarCoordenadas(lat, lng);
}

function centrarSedeMapa() {
  if (!mapInstance || !marker) return;
  mapInstance.setView(marker.getLatLng(), Math.max(form.mapZoomLevel, 16));
  marker.openPopup();
}
const zoomInMap = () => mapInstance?.zoomIn();
const zoomOutMap = () => mapInstance?.zoomOut();

/* ---------- Geocodificación inversa ---------- */
type AddressResult = 'ok' | 'partial' | 'error';

async function obtenerDireccionDesdeCoordenadas(lat: number, lng: number): Promise<AddressResult | null> {
  const token = ++geocodeToken;
  resolviendoDireccion.value = true;
  try {
    const lang = currentLang.value === 'en' ? 'en' : 'es';
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18` +
      `&accept-language=${lang}&lat=${lat}&lon=${lng}`;
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resp.ok) throw new Error('Reverse geocoding error');
    const data = await resp.json();
    if (token !== geocodeToken) return null;

    const a: Record<string, string> = data.address || {};

    form.entidad = a.state || a.region || a.state_district || form.entidad;
    form.municipio =
      a.municipality || a.city_district || a.city || a.town || a.village || a.county || form.municipio;
    form.colonia = a.neighbourhood || a.suburb || a.quarter || a.hamlet || '';
    form.calle = a.road || a.pedestrian || a.footway || a.path || '';
    form.cp = a.postcode || '';
    form.numExt = a.house_number || '';

    const completo = Boolean(form.entidad && form.municipio && form.colonia && form.calle && form.cp);
    return completo ? 'ok' : 'partial';
  } catch {
    return token === geocodeToken ? 'error' : null;
  } finally {
    if (token === geocodeToken) resolviendoDireccion.value = false;
  }
}

async function resolverDireccion(lat: number, lng: number, accuracy = 0) {
  const r = await obtenerDireccionDesdeCoordenadas(lat, lng);
  if (r === null) return;
  locationStatus.value = r;
  let msg =
    r === 'ok' ? 'Dirección completada. Verifica los datos.'
    : r === 'partial' ? 'Dirección incompleta: revisa los campos vacíos.'
    : 'No se pudo obtener la dirección. Captúrala manualmente.';
  if (accuracy > 100) msg += ` Precisión ±${Math.round(accuracy)} m: ajusta el pin si es necesario.`;
  locationMessage.value = msg;
  actualizarPopupMarcador(true);
}

/* ---------- Mi ubicación ---------- */
function usarMiUbicacion() {
  if (!navigator.geolocation) {
    locationStatus.value = 'error';
    locationMessage.value = 'Tu navegador no soporta geolocalización.';
    showNotification(tr('toastGeoNotSupported', 'Tu navegador no soporta geolocalización'), 'warning');
    return;
  }

  obteniendoUbicacion.value = true;
  locationStatus.value = 'idle';
  locationMessage.value = '';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const zoom = accuracy > 500 ? 15 : 17;
      mapInstance?.setView([latitude, longitude], zoom);
      marker?.setLatLng([latitude, longitude]);
      form.latitud = latitude.toFixed(6);
      form.longitud = longitude.toFixed(6);
      dibujarCirculoPrecision(latitude, longitude, accuracy);
      obteniendoUbicacion.value = false;

      await resolverDireccion(latitude, longitude, accuracy);
      showNotification(tr('toastLocationUpdated', 'Ubicación detectada'), 'success');
    },
    (err) => {
      obteniendoUbicacion.value = false;
      locationStatus.value = 'error';
      locationMessage.value =
        err.code === err.PERMISSION_DENIED
          ? 'Permiso de ubicación denegado. Actívalo en el navegador o marca el punto en el mapa.'
          : 'No se pudo obtener tu ubicación. Búscala o márcala en el mapa.';
      showNotification(tr('toastGeoDenied', 'No se pudo obtener tu ubicación'), 'warning');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

/* ---------- Buscar dirección ---------- */
async function buscarDireccion() {
  const consulta = direccionBusqueda.value.trim();
  if (!consulta) return;
  buscandoDireccion.value = true;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(consulta)}`;
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    const resultados = await resp.json();
    if (resultados?.length) {
      const lat = parseFloat(resultados[0].lat);
      const lng = parseFloat(resultados[0].lon);
      mapInstance?.setView([lat, lng], 17);
      guardarCoordenadas(lat, lng);
    } else {
      showNotification(tr('toastAddressNotFound', 'No se encontró esa dirección'), 'warning');
    }
  } catch {
    showNotification(tr('toastAddressSearchError', 'No se pudo buscar la dirección'), 'warning');
  } finally {
    buscandoDireccion.value = false;
  }
}
</script>

<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <main class="settings-page" id="tutor-0">

      <!-- ENCABEZADO GENERAL -->
      <header class="settings-header">
        <div class="settings-header-copy">
          <span class="page-eyebrow">{{ tr('profileEyebrow', 'CONFIGURACIÓN') }}</span>
          <h1>{{ tr('profilePageTitle', 'Perfil y configuración del gimnasio') }}</h1>
          <p>{{ tr('profilePageDescription', 'Administra la identidad, ubicación, operación y seguridad de tu gimnasio.') }}</p>
        </div>

      </header>

      <!-- LAYOUT PRINCIPAL -->
      <div class="settings-layout">

        <!-- COLUMNA IZQUIERDA / RESUMEN -->
        <aside class="profile-sidebar">

          <section class="profile-summary">
            <div class="profile-top-label">
              {{ tr('gymProfileLabel', 'PERFIL DEL GIMNASIO') }}
            </div>

            <div
              class="avatar-wrapper"
              id="tutor-5"
              role="button"
              tabindex="0"
              :title="t('avatarUploadTitle')"
              @click="openPhotoOptions"
              @keydown.enter.prevent="openPhotoOptions"
            >
              <div class="avatar-circle">
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  :alt="t('avatarPreviewAlt')"
                  class="avatar-img"
                />

                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>

              <span class="avatar-action" :title="t('avatarChangeTitle')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display:none"
                @change="onFileSelected"
              />
            </div>

            <div class="profile-identity">
              <h2>{{ form.nombreGimnasio }}</h2>

              <span class="status-pill compact-status" :class="form.status">
                <span class="status-dot"></span>
                {{ form.status === 'activo' ? t('statusActive') : form.status === 'pendiente' ? t('statusPending') : t('statusSuspended') }}
              </span>

              <p>{{ t('profileHintText') }}</p>
            </div>

            <div class="profile-divider"></div>

            <div class="profile-data-list">
              <div class="profile-data-item">
                <span>{{ tr('branchLabel', 'Sede') }}</span>
                <strong>{{ tr('mainBranchLabel', 'Sede Principal') }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ tr('membershipLabel', 'Membresía') }}</span>
                <strong>Plan Pro</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ tr('locationLabel', 'Ubicación') }}</span>
                <strong>{{ form.municipio }}, {{ form.entidad }}</strong>
              </div>
            </div>

            <button type="button" class="sidebar-photo-btn" @click="openPhotoOptions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>

              {{ tr('changeGymPhoto', 'Cambiar fotografía') }}
            </button>
          </section>

          <!-- NAVEGACIÓN -->
          <nav class="settings-nav" :aria-label="tr('configurationSections', 'Secciones')">
            <span class="settings-nav-title">
              {{ tr('configurationSections', 'SECCIONES') }}
            </span>

            <button
              v-for="s in sections"
              :key="s.id"
              type="button"
              class="settings-nav-item"
              :class="{ active: activeSection === s.id }"
              @click="scrollToSection(s.id)"
            >
              <span class="nav-icon">
                <svg viewBox="0 0 24 24">
                  <path v-for="d in s.icon" :key="d" :d="d" />
                </svg>
              </span>

              <span class="nav-copy">
                <strong>{{ tr(s.title[0], s.title[1]) }}</strong>
                <small>{{ tr(s.desc[0], s.desc[1]) }}</small>
              </span>
            </button>
          </nav>
        </aside>

        <!-- FORMULARIO -->
        <div class="settings-content">
          <form @submit.prevent="handleSaveChanges">

            <!-- INFORMACIÓN GENERAL -->
            <section id="gym-info" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ tr('sectionGeneralEyebrow', 'INFORMACIÓN GENERAL') }}</span>
                  <h2>{{ t('sectionGymInfo') }}</h2>
                  <p>{{ tr('sectionGeneralDescription', 'Información principal que identifica a tu gimnasio.') }}</p>
                </div>
              </header>

              <!-- PORTADA -->
              <div class="cover-field">
                <div class="field-heading">
                  <div>
                    <label>{{ t('labelCoverPhoto') }}</label>
                    <small>
                      {{ tr('coverRecommended', 'Recomendado: imagen horizontal de al menos 1200 × 400 px.') }}
                    </small>
                  </div>

                  <button
                    v-if="previewCoverImage"
                    type="button"
                    class="small-action-btn"
                    @click="triggerCoverFileInput"
                  >
                    {{ tr('changeCover', 'Cambiar portada') }}
                  </button>
                </div>

                <div class="cover-upload-container" @click="triggerCoverFileInput">
                  <img
                    v-if="previewCoverImage"
                    :src="previewCoverImage"
                    :alt="t('coverPreviewAlt')"
                    class="cover-preview-img"
                  />

                  <div v-else class="cover-placeholder-content">
                    <span class="cover-placeholder-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </span>

                    <strong>{{ tr('uploadCoverTitle', 'Subir foto de portada') }}</strong>
                    <span>{{ t('coverPlaceholderText') }}</span>
                  </div>

                  <input
                    ref="coverFileInput"
                    type="file"
                    accept="image/*"
                    style="display:none"
                    @click.stop
                    @change="onCoverFileSelected"
                  />
                </div>
              </div>

              <div class="form-grid">
                <div class="input-group">
                  <label for="nombreGimnasio">{{ t('labelGymName') }}</label>
                  <input id="nombreGimnasio" v-model="form.nombreGimnasio" type="text" required />
                </div>

                <div class="input-group">
                  <label for="nombrePropietario">{{ tr('labelOwnerName', 'Nombre del propietario') }}</label>
                  <input id="nombrePropietario" v-model="form.nombrePropietario" type="text" required />
                </div>
              </div>

              <!-- AGREGAR SEDE -->
              <div class="branch-row">
                <div class="branch-copy">
                  <strong>{{ tr('branchesTitle', 'Sedes') }}</strong>
                  <span>{{ tr('branchesHint', 'Registra una nueva sede para tu gimnasio.') }}</span>
                </div>

                <button
                  type="button"
                  class="primary-action-btn"
                  :class="{ disabled: !isProMember }"
                  @click="handleAddSede"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  {{ t('btnAddBranch') }}
                </button>
              </div>
            </section>

            <!-- ACERCA DEL GIMNASIO -->
            <section id="gym-details" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 5h16M4 12h16M4 19h10"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ tr('detailsEyebrow', 'PRESENTACIÓN') }}</span>
                  <h2>{{ t('sectionGymDetailsTitle') }}</h2>
                  <p>{{ tr('detailsDescription', 'Describe tu gimnasio y los servicios disponibles para tus clientes.') }}</p>
                </div>
              </header>

              <div class="input-group">
                <label for="descripcionGimnasio">{{ t('labelGymDescription') }}</label>

                <textarea
                  id="descripcionGimnasio"
                  v-model="form.descripcionGimnasio"
                  rows="4"
                  :placeholder="t('placeholderGymDescription')"
                ></textarea>
              </div>

              <div class="section-divider"></div>

              <div class="amenities-block">
                <div class="field-heading">
                  <div>
                    <label>{{ t('labelAmenitiesServices') }}</label>
                    <small>
                      {{ tr('amenitiesDescription', 'Agrega las amenidades y servicios que ofrece esta sede.') }}
                    </small>
                  </div>
                </div>

                <div class="add-amenity-row">
                  <input
                    v-model="form.nuevaAmenidadTexto"
                    type="text"
                    class="plain-input"
                    :placeholder="t('placeholderNewAmenity')"
                    @keyup.enter.prevent="agregarAmenidad"
                  />

                  <button type="button" class="btn-add-amenity" @click="agregarAmenidad">
                    <span>+</span>
                    {{ t('btnAddAmenity') }}
                  </button>
                </div>

                <div class="amenities-tags-container">
                  <div v-for="amenidad in form.amenidades" :key="amenidad.id" class="amenity-tag-pill">
                    <span class="amenity-check">✓</span>

                    <input v-model="amenidad.nombre" type="text" class="amenity-tag-input" />

                    <button
                      type="button"
                      class="btn-remove-amenity-tag"
                      :title="t('titleRemoveAmenity')"
                      @click="eliminarAmenidad(amenidad.id)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- UBICACIÓN -->
            <section id="gym-location" class="settings-card">
              <header class="card-header card-header-actions">
                <div class="card-header-main">
                  <div class="card-header-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>

                  <div>
                    <span class="card-eyebrow">{{ tr('locationEyebrow', 'UBICACIÓN') }}</span>
                    <h2>{{ t('sectionGeographicLocation') }}</h2>
                    <p>{{ tr('locationDescription', 'Define la dirección y posición exacta de tu gimnasio.') }}</p>
                  </div>
                </div>

                <button
                  type="button"
                  class="location-button"
                  :disabled="obteniendoUbicacion"
                  @click="usarMiUbicacion"
                >
                  <span v-if="obteniendoUbicacion" class="map-spinner"></span>

                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    <circle cx="12" cy="12" r="8"/>
                  </svg>

                  {{ obteniendoUbicacion
                    ? tr('btnLocating', 'Ubicando…')
                    : tr('btnUseMyLocationShort', 'Usar mi ubicación')
                  }}
                </button>
              </header>

              <p v-if="locationMessage" class="location-message" :class="locationStatus">
                <span class="location-dot"></span>
                {{ locationMessage }}
              </p>

              <div class="location-layout">
                <!-- CAMPOS DE DIRECCIÓN -->
                <div class="location-fields">
                  <div class="form-grid">
                    <div class="input-group">
                      <label for="entidad">{{ t('labelState') }}</label>
                      <input id="entidad" v-model="form.entidad" type="text" required />
                    </div>

                    <div class="input-group">
                      <label for="municipio">{{ t('labelMunicipality') }}</label>
                      <input id="municipio" v-model="form.municipio" type="text" required />
                    </div>

                    <div class="input-group">
                      <label for="colonia">{{ t('labelNeighborhood') }}</label>
                      <input id="colonia" v-model="form.colonia" type="text" />
                    </div>

                    <div class="input-group">
                      <label for="cp">{{ t('labelPostalCode') }}</label>
                      <input id="cp" v-model="form.cp" type="text" inputmode="numeric" required />
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="calle">{{ t('labelStreet') }}</label>
                    <input id="calle" v-model="form.calle" type="text" required />
                  </div>

                  <div class="form-grid">
                    <div class="input-group">
                      <label for="numExt">{{ tr('labelExteriorNumber', 'Número exterior') }}</label>
                      <input id="numExt" v-model="form.numExt" type="text" />
                    </div>

                    <div class="input-group">
                      <label for="numInt">{{ tr('labelInteriorNumber', 'Número interior') }}</label>
                      <input id="numInt" v-model="form.numInt" type="text" />
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="otrasCalles">{{ tr('labelReferences', 'Referencias / entre calles') }}</label>
                    <input id="otrasCalles" v-model="form.otrasCalles" type="text" />
                  </div>
                </div>

                <!-- MAPA -->
                <div class="map-column">
                  <div class="address-search">
                    <label>{{ tr('searchAddressLabel', 'Buscar dirección en el mapa') }}</label>

                    <div class="address-search-row">
                      <input
                        v-model="direccionBusqueda"
                        type="text"
                        class="plain-input"
                        :placeholder="tr('searchAddressPlaceholder', 'Ej. Av. Universidad 420, Ciudad Valles')"
                        @keyup.enter.prevent="buscarDireccion"
                      />

                      <button type="button" :disabled="buscandoDireccion" @click="buscarDireccion">
                        <span v-if="buscandoDireccion" class="map-spinner"></span>

                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="7"/>
                          <path d="m20 20-3.5-3.5"/>
                        </svg>

                        {{ tr('searchBtn', 'Buscar') }}
                      </button>
                    </div>
                  </div>

                  <div class="map-topbar">
                    <div>
                      <strong>{{ tr('mapLocationTitle', 'Ubicación en el mapa') }}</strong>
                      <span>{{ tr('mapLocationHint', 'Arrastra el marcador para ajustar el punto exacto.') }}</span>
                    </div>

                    <span class="map-live-status" :class="{ busy: resolviendoDireccion }">
                      <i></i>
                      {{ resolviendoDireccion
                        ? tr('mapResolving', 'Obteniendo dirección…')
                        : tr('mapInteractive', 'Interactivo') }}
                    </span>
                  </div>

                  <div class="map-stage">
                    <div ref="mapContainer" class="leaflet-map"></div>

                    <div class="map-style-switch">
                      <button
                        type="button"
                        :class="{ active: mapStyle === 'calles' }"
                        @click="cambiarEstiloMapa('calles')"
                      >
                        {{ tr('mapStreets', 'Calles') }}
                      </button>
                      <button
                        type="button"
                        :class="{ active: mapStyle === 'satelite' }"
                        @click="cambiarEstiloMapa('satelite')"
                      >
                        {{ tr('mapSatellite', 'Satélite') }}
                      </button>
                    </div>

                    <div class="map-tools">
                      <button type="button" :title="tr('mapZoomIn', 'Acercar')" @click="zoomInMap">+</button>
                      <button type="button" :title="tr('mapZoomOut', 'Alejar')" @click="zoomOutMap">−</button>
                      <button type="button" :title="tr('mapCenter', 'Centrar en la sede')" @click="centrarSedeMapa">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                        </svg>
                      </button>
                    </div>

                    <div v-if="mapCargando" class="map-loading">
                      <span class="map-spinner"></span>
                      {{ tr('mapLoading', 'Cargando mapa…') }}
                    </div>
                  </div>

                  <div class="coordinates-grid">
                    <label class="coord-field">
                      <span>LAT</span>
                      <input
                        v-model="form.latitud"
                        type="text"
                        inputmode="decimal"
                        @keyup.enter.prevent="aplicarCoordenadasManuales"
                        @blur="aplicarCoordenadasManuales"
                      />
                    </label>

                    <label class="coord-field">
                      <span>LNG</span>
                      <input
                        v-model="form.longitud"
                        type="text"
                        inputmode="decimal"
                        @keyup.enter.prevent="aplicarCoordenadasManuales"
                        @blur="aplicarCoordenadasManuales"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <!-- OPERACIÓN -->
            <section id="gym-operation" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ tr('operationEyebrow', 'OPERACIÓN') }}</span>
                  <h2>{{ tr('operationTitle', 'Horarios y tarifas') }}</h2>
                  <p>{{ tr('operationDescription', 'Configura los días de servicio, horarios y precios de esta sede.') }}</p>
                </div>
              </header>

              <div class="operation-block">
                <div class="field-heading">
                  <div>
                    <label>{{ t('labelOpenDays') }}</label>
                    <small>{{ tr('openDaysDescription', 'Selecciona los días en los que opera el gimnasio.') }}</small>
                  </div>
                </div>

                <div class="days-selector">
                  <button
                    v-for="day in allDays"
                    :key="day"
                    type="button"
                    class="day-btn"
                    :class="{ active: form.selectedDays.includes(day) }"
                    @click="toggleDay(day)"
                  >
                    <span class="day-check">{{ form.selectedDays.includes(day) ? '✓' : '' }}</span>
                    {{ day }}
                  </button>
                </div>
              </div>

              <div v-if="diasSeleccionados.length > 0" class="operation-block">
                <div class="field-heading">
                  <div>
                    <label>{{ t('labelSchedulesPerDay') }}</label>
                    <small>
                      {{ tr('scheduleDescription', 'Define los horarios de cada día. Si cierras a medio día, agrega un segundo turno.') }}
                    </small>
                  </div>
                </div>

                <div class="weekly-schedule-list">
                  <div
                    v-for="dia in diasSeleccionados"
                    :key="dia"
                    class="day-card"
                    :class="{ closed: !form.horariosCompletos[dia].activo, invalid: !!errorDia(dia) }"
                  >
                    <div class="day-card-head">
                      <div class="weekly-day-state">
                        <label class="switch-toggle">
                          <input v-model="form.horariosCompletos[dia].activo" type="checkbox" />
                          <span class="slider-round"></span>
                        </label>

                        <div class="weekly-day-copy">
                          <strong>{{ dia }}</strong>
                          <span>{{ resumenDia(dia) }}</span>
                        </div>
                      </div>

                      <button
                        v-if="form.horariosCompletos[dia].activo"
                        type="button"
                        class="copy-day-btn"
                        :title="txt('Copiar este horario a todos los días', 'Copy this schedule to all days')"
                        @click="copiarATodos(dia)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="9" y="9" width="12" height="12" rx="2"/>
                          <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
                        </svg>
                        <span>{{ txt('Copiar a todos', 'Copy to all') }}</span>
                      </button>
                    </div>

                    <div v-if="form.horariosCompletos[dia].activo" class="shifts">
                      <div
                        v-for="(turno, i) in form.horariosCompletos[dia].turnos"
                        :key="i"
                        class="shift-row"
                      >
                        <span class="shift-badge">{{ i + 1 }}</span>

                        <div class="weekly-time-field">
                          <label>{{ t('labelOpens') }}</label>
                          <input v-model="turno.abierto" type="time" />
                        </div>

                        <span class="weekly-time-separator">—</span>

                        <div class="weekly-time-field">
                          <label>{{ t('labelCloses') }}</label>
                          <input v-model="turno.cerrado" type="time" />
                        </div>

                        <button
                          v-if="form.horariosCompletos[dia].turnos.length > 1"
                          type="button"
                          class="shift-remove"
                          :title="txt('Quitar turno', 'Remove shift')"
                          @click="quitarTurno(dia, i)"
                        >
                          ×
                        </button>
                        <span v-else class="shift-remove-placeholder"></span>
                      </div>

                      <p v-if="errorDia(dia)" class="shift-error">{{ errorDia(dia) }}</p>

                      <button
                        v-if="form.horariosCompletos[dia].turnos.length < MAX_TURNOS"
                        type="button"
                        class="add-shift-btn"
                        @click="agregarTurno(dia)"
                      >
                        <span>+</span>
                        {{ txt('Agregar otro turno (ej. reabrir después de comer)', 'Add another shift (e.g. reopen after lunch)') }}
                      </button>
                    </div>

                    <div v-else class="weekly-closed-text">
                      {{ tr('labelClosed', 'Cerrado') }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="price-grid">
                <div class="price-field">
                  <div class="price-icon">$</div>

                  <div class="price-input-wrap">
                    <label for="precioMes">{{ t('labelMonthlyPrice') }}</label>

                    <div class="money-input">
                      <span>$</span>
                      <input id="precioMes" v-model="form.precioMes" type="number" min="0" required />
                      <small>MXN</small>
                    </div>
                  </div>
                </div>

                <div class="price-field">
                  <div class="price-icon">$</div>

                  <div class="price-input-wrap">
                    <label for="precioSem">{{ t('labelWeeklyPrice') }}</label>

                    <div class="money-input">
                      <span>$</span>
                      <input id="precioSem" v-model="form.precioSem" type="number" min="0" required />
                      <small>MXN</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- SEGURIDAD -->
            <section id="gym-security" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon security">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="11" rx="2"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow warn">{{ tr('securityEyebrow', 'SEGURIDAD') }}</span>
                  <h2>{{ tr('sectionAccessAccount', 'Cuenta de acceso') }}</h2>
                  <p>{{ tr('securityDescription', 'Administra el correo de acceso y cambia la contraseña de la cuenta.') }}</p>
                </div>
              </header>

              <div class="security-notice">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>

                <div>
                  <strong>{{ tr('securityNoticeTitle', 'Protege el acceso de tu gimnasio') }}</strong>
                  <span>
                    {{ tr('securityNoticeText', 'Si modificas el correo de acceso deberás confirmar una nueva contraseña.') }}
                  </span>
                </div>
              </div>

              <div class="security-grid">
                <div class="input-group email-field">
                  <label for="email">{{ t('labelEmailModifiable') }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 4h16v16H4z"/>
                      <path d="m4 7 8 6 8-6"/>
                    </svg>

                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label for="password">{{ t('labelNewPassword') }}</label>

                  <div class="input-with-icon password-input">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="10" width="16" height="11" rx="2"/>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                    </svg>

                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      :placeholder="t('passwordPlaceholder')"
                    />

                    <button
                      type="button"
                      class="toggle-password-btn"
                      :title="showPassword ? txt('Ocultar', 'Hide') : txt('Mostrar', 'Show')"
                      @click="showPassword = !showPassword"
                    >
                      <svg v-if="showPassword" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>

                      <svg v-else viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M3 3l18 18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="input-group confirm-password-field">
                  <label for="confirmPassword">{{ t('labelConfirmPassword') }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12 4 4L19 6"/>
                    </svg>

                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      type="password"
                      :placeholder="t('confirmPasswordPlaceholder')"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- GUARDAR -->
            <div class="save-bar">
              <div class="save-bar-copy">
                <strong>{{ tr('saveChangesTitle', '¿Terminaste de configurar tu gimnasio?') }}</strong>
                <span>{{ tr('saveChangesDescription', 'Revisa la información antes de guardar los cambios.') }}</span>
              </div>

              <button type="submit" class="save-button">
                <svg viewBox="0 0 24 24">
                  <path d="M5 3h14l2 2v16H3V3z"/>
                  <path d="M8 3v6h8V3M8 21v-7h8v7"/>
                </svg>

                {{ t('btnSaveDataset') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PANEL: TOMAR FOTO O SELECCIONAR DE GALERÍA -->
      <transition name="photo-menu">
        <div v-if="showPhotoOptions" class="photo-options-overlay" @click.self="closePhotoOptions">
          <div class="photo-options-modal" role="dialog" aria-modal="true">
            <div class="photo-options-handle"></div>

            <div class="photo-options-header">
              <div>
                <span class="photo-options-eyebrow">
                  {{ txt('FOTO DEL GIMNASIO', 'GYM PHOTO') }}
                </span>

                <h3>{{ txt('Agregar foto del gimnasio', 'Add gym photo') }}</h3>

                <p>{{ txt('Selecciona cómo quieres agregar la imagen.', 'Choose how you want to add the image.') }}</p>
              </div>

              <button type="button" class="modal-close-btn" @click="closePhotoOptions">×</button>
            </div>

            <div class="photo-options-grid">
              <button type="button" class="photo-option" @click="takePhoto">
                <div class="photo-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>

                <div class="photo-option-text">
                  <strong>{{ txt('Tomar foto', 'Take photo') }}</strong>
                  <span>{{ txt('Abrir la cámara del dispositivo', 'Open your device camera') }}</span>
                </div>

                <svg class="photo-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button type="button" class="photo-option" @click="selectPhoto">
                <div class="photo-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>

                <div class="photo-option-text">
                  <strong>{{ txt('Subir desde galería', 'Choose image') }}</strong>
                  <span>{{ txt('Seleccionar una imagen existente', 'Select an existing image') }}</span>
                </div>

                <svg class="photo-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <button type="button" class="photo-cancel" @click="closePhotoOptions">
              {{ txt('Cancelar', 'Cancel') }}
            </button>
          </div>
        </div>
      </transition>

      <!-- CÁMARA REAL -->
      <transition name="photo-menu">
        <div v-if="showCamera" class="camera-overlay" @click.self="closeCamera">
          <div class="camera-modal" role="dialog" aria-modal="true">
            <div class="camera-header">
              <div>
                <span class="camera-eyebrow">{{ txt('CÁMARA', 'CAMERA') }}</span>

                <h3>{{ txt('Tomar foto del gimnasio', 'Take gym photo') }}</h3>

                <p>
                  {{ cameraFacingMode === 'user'
                    ? txt('Cámara frontal', 'Front camera')
                    : txt('Cámara trasera', 'Rear camera') }}
                </p>
              </div>

              <button type="button" class="modal-close-btn" @click="closeCamera">×</button>
            </div>

            <div class="camera-preview">
              <video
                ref="videoRef"
                autoplay
                playsinline
                muted
                :class="{ 'camera-mirrored': cameraFacingMode === 'user' }"
              ></video>

              <button
                type="button"
                class="switch-camera-btn"
                :disabled="switchingCamera"
                @click.stop="switchCamera"
              >
                <svg
                  :class="{ rotating: switchingCamera }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
                </svg>

                <span>
                  {{ cameraFacingMode === 'user' ? txt('Trasera', 'Rear') : txt('Frontal', 'Front') }}
                </span>
              </button>

              <div class="camera-guide">
                <div class="face-guide"></div>
              </div>

              <div v-if="switchingCamera" class="camera-switching">
                <span class="camera-loader"></span>
              </div>
            </div>

            <canvas ref="canvasRef" class="hidden-canvas"></canvas>

            <div class="camera-actions">
              <button type="button" class="camera-cancel-btn" @click="closeCamera">
                {{ txt('Cancelar', 'Cancel') }}
              </button>

              <button type="button" class="capture-btn" :disabled="switchingCamera" @click="capturePhoto">
                <span class="capture-circle"><span></span></span>
                {{ txt('Tomar foto', 'Take photo') }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL CAMBIO DE CORREO -->
      <div v-if="showEmailModal" class="modal-overlay" @click.self="showEmailModal = false">
        <div class="modal-container modal-small animate-modal">
          <div class="modal-header">
            <h3>{{ t('credentialsUpdateModalTitle') }}</h3>

            <button type="button" class="close-btn" @click="showEmailModal = false">×</button>
          </div>

          <div class="modal-body text-center">
            <div class="warning-icon-wrapper info">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>

            <p class="modal-text">{{ t('emailChangeWarningText') }}</p>

            <div class="input-group text-left">
              <label>{{ t('newAccessPasswordLabel') }}</label>

              <input
                v-model="form.password"
                type="password"
                :placeholder="t('enterNewPasswordPlaceholder')"
                required
              />
            </div>

            <div class="input-group text-left modal-field-gap">
              <label>{{ t('confirmPasswordLabel') }}</label>

              <input
                v-model="form.confirmPassword"
                type="password"
                :placeholder="t('confirmNewPasswordPlaceholder')"
                required
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary-modal" @click="showEmailModal = false">
                {{ t('cancelBtn') }}
              </button>

              <button type="button" class="btn-primary-modal" @click="confirmEmailAndPasswordChange">
                {{ t('confirmChangeBtn') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL AGREGAR SEDE -->
      <div v-if="showAddSedeModal" class="modal-overlay" @click.self="showAddSedeModal = false">
        <div class="modal-container animate-modal modal-large">
          <div class="modal-header">
            <h3>{{ t('modalAddSedeTitle') }}</h3>

            <button type="button" class="close-btn" @click="showAddSedeModal = false">×</button>
          </div>

          <div class="modal-body">
            <RegisterGymModal @close="showAddSedeModal = false"/>
          </div>
        </div>
      </div>

    </main>
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

button, input, textarea { font: inherit; }

/* =========================================================
   BASE
========================================================= */
.settings-page {
  --accent: var(--color-highlight, #3b82f6);
  --accent-soft: color-mix(in srgb, var(--accent) 10%, transparent);
  --accent-border: color-mix(in srgb, var(--accent) 35%, transparent);
  --card: var(--bg-cards, rgba(18, 18, 18, 0.75));
  --title: var(--color-titulos, #fff);
  --text: var(--color-texto-general, #e5e5e5);
  --muted: rgba(229, 229, 229, 0.62);
  --muted2: rgba(229, 229, 229, 0.42);
  --line: var(--border-cards, rgba(255, 255, 255, 0.09));
  --line-strong: var(--border-input, rgba(255, 255, 255, 0.15));
  --field: var(--bg-input, rgba(255, 255, 255, 0.03));
  --radius: var(--app-border-radius, 18px);

  width: 100%;
  max-width: 100%;
  padding: 34px clamp(18px, 4vw, 64px) 70px;
  overflow-x: clip;
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

.hidden-canvas { display: none; }

/* =========================================================
   ENCABEZADO
========================================================= */
.settings-header {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.settings-header-copy { min-width: 0; max-width: 760px; }

.page-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.settings-header h1 {
  margin: 0;
  color: var(--title);
  font-family: 'Anton', sans-serif;
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 400;
  letter-spacing: 0.3px;
  line-height: 1.1;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.settings-header p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pill.activo { color: #34d399; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.28); }
.status-pill.pendiente { color: #fbbf24; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.28); }
.status-pill.suspendido { color: #f87171; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.28); }

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 7px currentColor;
}

/* =========================================================
   LAYOUT
========================================================= */
.settings-layout {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.profile-sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-content { min-width: 0; }

.settings-content form {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* =========================================================
   PERFIL LATERAL
========================================================= */
.profile-summary {
  position: relative;
  min-width: 0;
  padding: 26px 22px 22px;
  overflow: hidden;
  text-align: center;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.profile-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), transparent);
}

.profile-top-label {
  margin-bottom: 22px;
  color: var(--muted2);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.avatar-wrapper {
  position: relative;
  width: 112px;
  height: 112px;
  margin: 0 auto 18px;
  cursor: pointer;
  border-radius: 28px;
}

.avatar-wrapper:focus-visible,
.sidebar-photo-btn:focus-visible,
.settings-nav-item:focus-visible,
.save-button:focus-visible,
.day-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.avatar-circle {
  width: 112px;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.55);
  background: #1b1b1b;
  border: 2px solid var(--line-strong);
  border-radius: 28px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.25);
  transition: border-color 0.2s ease, filter 0.2s ease;
}

.avatar-wrapper:hover .avatar-circle {
  border-color: var(--accent-border);
  filter: brightness(1.08);
}

.avatar-circle svg { width: 54px; height: 54px; }

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-action {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--accent));
  border: 3px solid var(--card);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.avatar-wrapper:hover .avatar-action { transform: scale(1.08); }

.avatar-action svg { width: 16px; height: 16px; }

.profile-identity h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.compact-status { margin-top: 10px; }

.profile-identity p {
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
}

.profile-divider,
.section-divider {
  height: 1px;
  margin: 20px 0;
  background: var(--line);
}

.profile-data-list { display: flex; flex-direction: column; }

.profile-data-item {
  padding: 11px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.profile-data-item:last-child { border-bottom: 0; }

.profile-data-item span {
  color: var(--muted2);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
}

.profile-data-item strong {
  min-width: 0;
  max-width: 160px;
  overflow: hidden;
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-photo-btn {
  width: 100%;
  height: 42px;
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.sidebar-photo-btn:hover {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: var(--accent-border);
}

.sidebar-photo-btn svg { width: 15px; height: 15px; }

/* =========================================================
   NAVEGACIÓN LATERAL
========================================================= */
.settings-nav {
  min-width: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.settings-nav-title {
  display: block;
  padding: 4px 8px 10px;
  color: var(--muted2);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.settings-nav-item {
  width: 100%;
  padding: 9px 8px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 11px;
  transition: background 0.2s;
}

.settings-nav-item:hover,
.settings-nav-item.active { background: var(--accent-soft); }

.nav-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  border-radius: 9px;
  transition: color 0.2s, border-color 0.2s;
}

.settings-nav-item.active .nav-icon,
.settings-nav-item:hover .nav-icon {
  color: var(--accent);
  border-color: var(--accent-border);
}

.nav-icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-nav-item strong {
  overflow: hidden;
  color: var(--text);
  font-size: 12.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-nav-item small {
  overflow: hidden;
  color: var(--muted2);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   TARJETAS
========================================================= */
.settings-card {
  width: 100%;
  min-width: 0;
  padding: 28px 30px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
  scroll-margin-top: 90px;
}

.card-header {
  margin-bottom: 26px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.card-header-icon {
  width: 40px;
  height: 40px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 12px;
}

.card-header-icon.security {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.22);
}

.card-header-icon svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.card-header > div:last-child,
.card-header-main > div:last-child { min-width: 0; }

.card-eyebrow {
  display: block;
  margin-bottom: 4px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.card-eyebrow.warn { color: #fbbf24; }

.card-header h2 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.card-header p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.5;
}

.card-header-actions {
  justify-content: space-between;
  gap: 18px;
}

.card-header-main {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

/* =========================================================
   INPUTS
========================================================= */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.input-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label,
.field-heading label,
.address-search label,
.price-input-wrap label {
  color: var(--text);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.2;
}

/* Estilo base de los campos (siempre visible, no solo al enfocar) */
.input-group > input,
.input-group > textarea,
.plain-input,
.weekly-time-field input {
  width: 100%;
  min-width: 0;
  color: var(--text);
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.input-group > input,
.plain-input { height: 46px; padding: 0 14px; font-size: 14px; }

.input-group > textarea {
  padding: 13px 14px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.input-group > input:hover,
.input-group > textarea:hover,
.plain-input:hover { border-color: rgba(255, 255, 255, 0.25); }

.input-group > input:focus,
.input-group > textarea:focus,
.plain-input:focus,
.weekly-time-field input:focus {
  background: var(--field);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.input-group > input::placeholder,
.input-group > textarea::placeholder,
.plain-input::placeholder { color: var(--muted2); }

.field-heading {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.field-heading > div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.field-heading small {
  color: var(--muted2);
  font-size: 11.5px;
  line-height: 1.4;
}

.input-with-icon {
  height: 46px;
  min-width: 0;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-with-icon:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.input-with-icon > svg {
  width: 16px;
  height: 16px;
  margin-left: 13px;
  fill: none;
  stroke: var(--muted2);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.input-with-icon input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 12px 0 6px;
  color: var(--text);
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: none;
}

.input-with-icon input::placeholder { color: var(--muted2); }

.password-input { grid-template-columns: 38px minmax(0, 1fr) 40px; }

.toggle-password-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 8px;
}

.toggle-password-btn:hover { color: var(--accent); background: var(--accent-soft); }

.toggle-password-btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   PORTADA
========================================================= */
.cover-field { margin-bottom: 22px; }

.cover-upload-container {
  height: 190px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--field);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  transition: border-color 0.2s, background 0.2s;
}

.cover-upload-container:hover { background: var(--accent-soft); border-color: var(--accent); }

.cover-preview-img { width: 100%; height: 100%; object-fit: cover; }

.cover-placeholder-content {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  text-align: center;
}

.cover-placeholder-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 12px;
}

.cover-placeholder-icon svg { width: 22px; height: 22px; }

.cover-placeholder-content strong { color: var(--text); font-size: 13px; }

.cover-placeholder-content > span:last-child { font-size: 12px; }

.small-action-btn {
  padding: 8px 12px;
  color: var(--accent);
  white-space: nowrap;
  cursor: pointer;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 700;
}

/* =========================================================
   AGREGAR SEDE
========================================================= */
.branch-row {
  margin-top: 22px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--field);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.branch-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.branch-copy strong { color: var(--title); font-size: 14px; }

.branch-copy span { color: var(--muted); font-size: 12px; line-height: 1.45; }

.primary-action-btn {
  height: 40px;
  padding: 0 16px;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  white-space: nowrap;
  cursor: pointer;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, var(--accent));
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  transition: filter 0.2s, transform 0.2s;
}

.primary-action-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

.primary-action-btn.disabled { opacity: 0.45; }

.primary-action-btn svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   AMENIDADES
========================================================= */
.add-amenity-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.btn-add-amenity {
  height: 46px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-texto-botones, #fff);
  white-space: nowrap;
  cursor: pointer;
  background: var(--color-botones, var(--accent));
  border: 0;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
}

.btn-add-amenity span { font-size: 18px; font-weight: 400; line-height: 1; }

.amenities-tags-container {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.amenity-tag-pill {
  min-width: 0;
  max-width: 100%;
  height: 38px;
  padding: 0 8px 0 11px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: border-color 0.2s;
}

.amenity-tag-pill:focus-within { border-color: var(--accent); }

.amenity-check { color: #34d399; font-size: 11px; }

.amenity-tag-input {
  width: 170px;
  min-width: 0;
  max-width: 100%;
  padding: 0;
  color: var(--text);
  font-size: 12.5px;
  background: transparent;
  border: 0;
  outline: none;
}

.btn-remove-amenity-tag {
  width: 22px;
  height: 22px;
  flex: none;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 6px;
  font-size: 16px;
  line-height: 1;
}

.btn-remove-amenity-tag:hover { color: #f87171; background: rgba(239, 68, 68, 0.1); }

/* =========================================================
   UBICACIÓN
========================================================= */
.location-button {
  height: 40px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
  color: var(--accent);
  white-space: nowrap;
  cursor: pointer;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.location-button svg { width: 16px; height: 16px; }

.location-button:disabled { cursor: wait; opacity: 0.65; }

.location-message {
  margin: 0 0 20px;
  padding: 10px 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.45;
}

.location-dot { width: 7px; height: 7px; flex: none; background: #34d399; border-radius: 50%; }

.location-message.partial .location-dot { background: #fbbf24; }
.location-message.error .location-dot { background: #f87171; }

.location-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 22px;
  align-items: start;
}

.location-fields { min-width: 0; display: flex; flex-direction: column; gap: 16px; }

.map-column {
  min-width: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.address-search { display: flex; flex-direction: column; gap: 8px; }

.address-search-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }

.address-search-row .plain-input { height: 44px; }

.address-search-row button {
  height: 44px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, var(--accent));
  border: 0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.address-search-row button:disabled { cursor: wait; opacity: 0.7; }

.address-search-row button svg { width: 15px; height: 15px; }

.map-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.map-topbar > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.map-topbar strong { color: var(--text); font-size: 13px; }

.map-topbar span { color: var(--muted2); font-size: 11.5px; }

.map-topbar .map-live-status {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #34d399;
  font-weight: 600;
}

.map-live-status i {
  width: 7px;
  height: 7px;
  background: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.map-topbar .map-live-status.busy { color: #fbbf24; }

.map-stage { position: relative; min-width: 0; }

.leaflet-map {
  width: 100%;
  height: 380px;
  overflow: hidden;
  background: #161616;
  border-radius: 12px;
  z-index: 1;
}

.map-style-switch {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  padding: 3px;
  display: flex;
  gap: 2px;
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid var(--line-strong);
  border-radius: 10px;
}

.map-style-switch button {
  padding: 6px 11px;
  color: var(--muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
}

.map-style-switch button.active { color: #fff; background: var(--accent); }

.map-tools {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid var(--line-strong);
  border-radius: 10px;
}

.map-tools button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  font-size: 18px;
  line-height: 1;
}

.map-tools button:last-child { border-bottom: 0; }

.map-tools button:hover { background: var(--accent-soft); color: var(--accent); }

.map-tools svg { width: 16px; height: 16px; }

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted);
  background: #141414;
  border-radius: 12px;
  font-size: 12.5px;
}

.coordinates-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }

.coord-field {
  height: 40px;
  min-width: 0;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--line);
  border-radius: 9px;
  cursor: text;
  transition: border-color 0.2s;
}

.coord-field:focus-within { border-color: var(--accent); }

.coord-field span { color: var(--muted2); font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }

.coord-field input {
  width: 100%;
  min-width: 0;
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  background: transparent;
  border: 0;
  outline: none;
}

.map-spinner {
  width: 14px;
  height: 14px;
  display: inline-block;
  flex: none;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: map-spin 0.8s linear infinite;
}

@keyframes map-spin { to { transform: rotate(360deg); } }

/* ---------- Pin y controles de Leaflet ---------- */
:deep(.gym-pin) { background: transparent; border: 0; }

:deep(.gym-pin-body) {
  position: relative;
  display: block;
  width: 34px;
  height: 34px;
  margin: 0 1px;
  background: var(--accent, #3b82f6);
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
  transform: rotate(-45deg);
}

:deep(.gym-pin-dot) {
  position: absolute;
  inset: 0;
  width: 10px;
  height: 10px;
  margin: auto;
  background: #fff;
  border-radius: 50%;
}

:deep(.leaflet-control-attribution) { color: #888 !important; background: rgba(15, 15, 15, 0.88) !important; }
:deep(.leaflet-control-attribution a) { color: #9db8e8 !important; }

:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) { color: #eee !important; background: #171717 !important; }

/* =========================================================
   OPERACIÓN
========================================================= */
.operation-block { margin-bottom: 24px; min-width: 0; }

.days-selector { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }

.day-btn {
  height: 46px;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--muted);
  cursor: pointer;
  background: var(--field);
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.day-btn:hover { border-color: var(--line-strong); }

.day-btn.active { color: var(--accent); background: var(--accent-soft); border-color: var(--accent-border); }

.day-check {
  width: 15px;
  height: 15px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  font-size: 9px;
}

.day-btn.active .day-check { background: var(--accent); border-color: var(--accent); }

.weekly-schedule-list {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.weekly-day-state { display: flex; align-items: center; gap: 12px; min-width: 0; }

.weekly-day-copy { display: flex; flex-direction: column; gap: 2px; }

.weekly-day-copy strong { color: var(--text); font-size: 13px; }

.weekly-day-copy span { color: var(--muted2); font-size: 11px; }

.switch-toggle { position: relative; width: 38px; height: 21px; flex: none; display: inline-block; }

.switch-toggle input { width: 0; height: 0; opacity: 0; position: absolute; }

.slider-round {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: #303030;
  border-radius: 999px;
  transition: background 0.2s;
}

.slider-round::before {
  content: '';
  position: absolute;
  left: 3px;
  bottom: 3px;
  width: 15px;
  height: 15px;
  background: #aaa;
  border-radius: 50%;
  transition: transform 0.2s, background 0.2s;
}

.switch-toggle input:checked + .slider-round { background: var(--accent); }
.switch-toggle input:checked + .slider-round::before { transform: translateX(17px); background: #fff; }
.switch-toggle input:focus-visible + .slider-round { box-shadow: 0 0 0 3px var(--accent-soft); }

/* Horas: grid con minmax(0,1fr) para que nunca se salgan de la tarjeta */
.weekly-time-field { min-width: 0; display: flex; flex-direction: column; gap: 5px; }

.weekly-time-field label {
  color: var(--muted2);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
}

.weekly-time-field input {
  height: 40px;
  padding: 0 10px;
  font-size: 13.5px;
  color-scheme: dark;
  -webkit-appearance: none;
  appearance: none;
}

.weekly-time-field input::-webkit-date-and-time-value { text-align: left; min-width: 0; }

.weekly-time-separator { padding-bottom: 11px; color: var(--muted2); }

.weekly-closed-text { color: var(--muted2); font-size: 12.5px; }

/* ---------- Tarjeta por día con turnos ---------- */
.day-card {
  min-width: 0;
  padding: 14px 16px;
  background: var(--field);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color 0.2s, opacity 0.2s;
}

.day-card.closed { opacity: 0.7; }
.day-card.invalid { border-color: rgba(248, 113, 113, 0.5); }

.day-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.weekly-day-copy { min-width: 0; }
.weekly-day-copy span { overflow-wrap: anywhere; }

.copy-day-btn {
  flex: none;
  height: 32px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.copy-day-btn:hover { color: var(--accent); background: var(--accent-soft); border-color: var(--accent-border); }
.copy-day-btn svg { width: 14px; height: 14px; }

.shifts {
  margin-top: 14px;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--line);
}

.shift-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto minmax(0, 1fr) 34px;
  align-items: end;
  gap: 10px;
}

.shift-badge {
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
  display: grid;
  place-items: center;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
}

.shift-remove,
.shift-remove-placeholder { width: 34px; height: 40px; }

.shift-remove {
  color: var(--muted);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  border-radius: 9px;
  font-size: 18px;
  line-height: 1;
}

.shift-remove:hover { color: #f87171; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }

.shift-error {
  margin: 0;
  padding: 8px 11px;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.22);
  border-radius: 9px;
  font-size: 11.5px;
  line-height: 1.4;
}

.add-shift-btn {
  min-height: 38px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--accent);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px dashed var(--accent-border);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s;
}

.add-shift-btn:hover { background: var(--accent-soft); }
.add-shift-btn span { font-size: 16px; line-height: 1; }


.price-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }

.price-field {
  min-width: 0;
  padding: 14px;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.price-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 11px;
  font-family: 'Oswald', sans-serif;
  font-size: 17px;
}

.price-input-wrap { min-width: 0; display: flex; flex-direction: column; gap: 8px; }

.money-input {
  height: 46px;
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) 42px;
  align-items: center;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.money-input:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

.money-input > span { padding-left: 12px; color: #34d399; font-weight: 700; }

.money-input input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 6px;
  color: var(--text);
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: none;
}

.money-input small { color: var(--muted2); font-size: 10px; font-weight: 700; }

/* =========================================================
   SEGURIDAD
========================================================= */
.security-notice {
  margin-bottom: 20px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(245, 158, 11, 0.055);
  border: 1px solid rgba(245, 158, 11, 0.16);
  border-radius: 11px;
}

.security-notice > svg {
  width: 22px;
  height: 22px;
  flex: none;
  fill: none;
  stroke: #fbbf24;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.security-notice > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.security-notice strong { color: var(--text); font-size: 12.5px; }

.security-notice span { color: var(--muted); font-size: 12px; line-height: 1.45; }

.security-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px 20px; }

.email-field { grid-column: 1 / -1; }

/* =========================================================
   GUARDAR
========================================================= */
.save-bar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
}

.save-bar-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.save-bar-copy strong { color: var(--text); font-size: 13px; }

.save-bar-copy span { color: var(--muted2); font-size: 12px; }

.save-button {
  height: 46px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  white-space: nowrap;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  background: var(--color-botones, var(--accent));
  border: 0;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--accent) 20%, transparent);
  transition: filter 0.2s, transform 0.2s;
}

.save-button:hover { filter: brightness(1.08); transform: translateY(-1px); }

.save-button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   PANEL DE FOTO Y CÁMARA
========================================================= */
.photo-options-overlay,
.camera-overlay {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.78);
}

.camera-overlay { z-index: 10100; background: rgba(0, 0, 0, 0.9); }

.photo-options-modal,
.camera-modal {
  width: 100%;
  max-width: 440px;
  max-height: 100%;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: var(--card);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.camera-modal { max-width: 620px; }

.photo-options-handle { display: none; }

.photo-options-header,
.camera-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.photo-options-eyebrow,
.camera-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--accent);
  font: 700 0.64rem 'Inter', sans-serif;
  letter-spacing: 1px;
}

.photo-options-header h3,
.camera-header h3 {
  margin: 0;
  color: var(--title);
  font: 400 1.3rem 'Anton', sans-serif;
  text-transform: uppercase;
}

.photo-options-header p,
.camera-header p {
  margin: 6px 0 0;
  color: var(--muted);
  font: 400 0.8rem/1.5 'Inter', sans-serif;
}

.modal-close-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  padding: 0;
  color: #fff;
  cursor: pointer;
  font-size: 1.3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.04);
}

.modal-close-btn:hover { background: rgba(255, 255, 255, 0.09); }

.photo-options-grid { display: flex; flex-direction: column; gap: 10px; }

.photo-option {
  width: 100%;
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.025);
  transition: border-color 0.18s, background 0.18s;
}

.photo-option:hover { border-color: var(--accent); background: var(--accent-soft); }

.photo-option:focus-visible,
.photo-cancel:focus-visible,
.modal-close-btn:focus-visible,
.camera-cancel-btn:focus-visible,
.capture-btn:focus-visible,
.switch-camera-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.photo-option-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: var(--accent);
  border-radius: 12px;
  background: var(--accent-soft);
}

.photo-option-icon svg { width: 21px; height: 21px; }

.photo-option-text { flex: 1; min-width: 0; }

.photo-option-text strong { display: block; color: var(--title); font: 600 0.88rem 'Inter', sans-serif; }

.photo-option-text span { display: block; margin-top: 3px; color: var(--muted); font: 400 0.76rem 'Inter', sans-serif; }

.photo-option-arrow { width: 16px; flex: none; color: var(--muted); }

.photo-cancel {
  width: 100%;
  height: 42px;
  margin-top: 14px;
  color: var(--muted);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
}

.photo-cancel:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }

/* ---------- Visor ---------- */
.camera-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: #000;
}

.camera-preview video { width: 100%; height: 100%; display: block; object-fit: cover; }

.camera-preview video.camera-mirrored { transform: scaleX(-1); }

.camera-guide { position: absolute; z-index: 2; inset: 0; display: grid; place-items: center; pointer-events: none; }

.face-guide { width: 47%; height: 70%; border: 2px dashed rgba(255, 255, 255, 0.45); border-radius: 50%; }

.switch-camera-btn {
  position: absolute;
  z-index: 10;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 14px;
  color: #fff;
  cursor: pointer;
  font: 600 0.74rem 'Inter', sans-serif;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.3);
}

.switch-camera-btn:hover { background: rgba(0, 0, 0, 0.8); }

.switch-camera-btn:disabled { cursor: wait; opacity: 0.65; }

.switch-camera-btn svg { width: 16px; height: 16px; }

.switch-camera-btn svg.rotating { animation: cameraRotate 0.7s linear infinite; }

@keyframes cameraRotate { to { transform: rotate(360deg); } }

.camera-switching {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.28);
  pointer-events: none;
}

.camera-loader {
  width: 38px;
  height: 38px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cameraRotate 0.7s linear infinite;
}

/* ---------- Capturar ---------- */
.camera-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.camera-cancel-btn {
  min-width: 110px;
  padding: 12px 18px;
  color: var(--text);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 13px;
  font-weight: 600;
}

.camera-cancel-btn:hover { background: rgba(255, 255, 255, 0.08); }

.capture-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px 8px 8px;
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  font: 700 0.84rem 'Inter', sans-serif;
  border: none;
  border-radius: 999px;
  background: var(--color-botones, var(--accent));
}

.capture-btn:disabled { cursor: wait; opacity: 0.6; }

.capture-circle {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
}

.capture-circle span {
  width: 27px;
  height: 27px;
  display: block;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s ease;
}

.capture-btn:hover:not(:disabled) .capture-circle span { transform: scale(0.85); }

/* ---------- Transición ---------- */
.photo-menu-enter-active,
.photo-menu-leave-active { transition: opacity 0.2s ease; }

.photo-menu-enter-active .photo-options-modal,
.photo-menu-leave-active .photo-options-modal,
.photo-menu-enter-active .camera-modal,
.photo-menu-leave-active .camera-modal { transition: opacity 0.2s ease, transform 0.22s ease; }

.photo-menu-enter-from,
.photo-menu-leave-to { opacity: 0; }

.photo-menu-enter-from .photo-options-modal,
.photo-menu-leave-to .photo-options-modal,
.photo-menu-enter-from .camera-modal,
.photo-menu-leave-to .camera-modal { opacity: 0; transform: translateY(10px) scale(0.97); }

/* =========================================================
   MODALES GENERALES
========================================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
}

.modal-container {
  width: min(920px, 96vw);
  max-height: 92vh;
  overflow: auto;
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

.modal-small { width: min(480px, 94vw); }

.modal-large { width: min(1200px, 96vw); }

.modal-header {
  min-height: 64px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
}

.modal-header h3 {
  margin: 0;
  color: var(--title);
  font-family: 'Oswald', sans-serif;
  font-size: 19px;
}

.close-btn {
  width: 36px;
  height: 36px;
  flex: none;
  color: var(--muted);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 20px;
  line-height: 1;
}

.close-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }

.modal-body { padding: 22px; }

.text-center { text-align: center; }

.text-left { text-align: left; }

.warning-icon-wrapper {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 15px;
}

.warning-icon-wrapper.info { background: rgba(59, 130, 246, 0.1); }

.warning-icon-wrapper svg { width: 28px; height: 28px; }

.modal-text { margin: 0 0 18px; color: var(--muted); font-size: 13.5px; line-height: 1.6; }

.modal-field-gap { margin-top: 14px; }

.modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }

.btn-secondary-modal,
.btn-primary-modal {
  min-height: 42px;
  padding: 0 18px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
}

.btn-secondary-modal { color: var(--text); background: rgba(255, 255, 255, 0.04); border: 1px solid var(--line); }

.btn-primary-modal { color: #fff; background: var(--accent); border: 1px solid var(--accent); }

.animate-modal { animation: modal-in 0.18s ease; }

@keyframes modal-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

/* =========================================================
   TABLET
========================================================= */
@media (max-width: 1180px) {
  .settings-layout { grid-template-columns: 250px minmax(0, 1fr); gap: 18px; }
  .settings-card { padding: 24px; }
  .location-layout { grid-template-columns: minmax(0, 1fr); }
}

/* =========================================================
   MÓVIL / TABLET PEQUEÑA
========================================================= */
@media (max-width: 900px) {
  .settings-page { padding: 24px 18px 50px; }

  .settings-layout { grid-template-columns: minmax(0, 1fr); }

  .profile-summary { padding: 22px; }

  /* La navegación pasa a una fila de chips con scroll horizontal */
  .settings-nav {
    padding: 10px;
    flex-direction: row;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .settings-nav::-webkit-scrollbar { display: none; }

  .settings-nav-title { display: none; }

  .settings-nav-item {
    width: auto;
    flex: none;
    padding: 7px 14px 7px 7px;
    grid-template-columns: auto auto;
    border: 1px solid var(--line);
    border-radius: 999px;
  }

  .settings-nav-item.active { border-color: var(--accent-border); }

  .nav-icon { width: 28px; height: 28px; border-radius: 50%; }

  .settings-nav-item small { display: none; }

  .form-grid,
  .security-grid { grid-template-columns: minmax(0, 1fr); }

  .days-selector { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* =========================================================
   TELÉFONO
========================================================= */
@media (max-width: 650px) {
  .settings-page { padding: 18px 12px 40px; }

  .settings-header { margin-bottom: 18px; flex-direction: column; align-items: flex-start; }

  .settings-header h1 { font-size: 27px; }

  .settings-card { padding: 20px 14px; border-radius: 16px; }

  .card-header { margin-bottom: 20px; }

  .card-header-actions { flex-direction: column; align-items: stretch; }

  .card-header-main { gap: 12px; }

  .location-button { align-self: stretch; justify-content: center; }

  .cover-upload-container { height: 150px; }

  .field-heading { flex-wrap: wrap; }

  .branch-row { flex-direction: column; align-items: stretch; padding: 14px; }

  .primary-action-btn { width: 100%; }

  .days-selector { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  /* Horarios por turnos en móvil */
  .day-card { padding: 12px; }

  .copy-day-btn span { display: none; }
  .copy-day-btn { width: 34px; padding: 0; justify-content: center; }

  .shift-row { grid-template-columns: minmax(0, 1fr) 10px minmax(0, 1fr); gap: 6px; }
  .shift-badge { display: none; }
  .shift-remove { grid-column: 1 / -1; width: 100%; height: 34px; font-size: 14px; }
  .shift-remove::after { content: ' quitar turno'; font-size: 11px; font-weight: 600; }
  .shift-remove-placeholder { display: none; }

  .weekly-time-field input { height: 38px; padding: 0 8px; font-size: 13px; }
  .weekly-time-field input::-webkit-calendar-picker-indicator { display: none; }

  .price-grid { grid-template-columns: minmax(0, 1fr); }

  .price-field { padding: 12px; gap: 10px; }

  .add-amenity-row,
  .address-search-row { grid-template-columns: minmax(0, 1fr); }

  .btn-add-amenity,
  .address-search-row button { justify-content: center; }

  .amenity-tag-pill { width: 100%; }
  .amenity-tag-input { width: 100%; flex: 1; }

  .map-column { padding: 10px; }

  .map-topbar { flex-direction: column; }

  .leaflet-map { height: 300px; }

  .security-notice { align-items: flex-start; }

  .save-bar { align-items: stretch; flex-direction: column; }

  .save-button { width: 100%; }

  .modal-overlay { padding: 8px; }

  .modal-body { padding: 16px; }

  .modal-actions { flex-direction: column-reverse; }

  .modal-actions button { width: 100%; }

  /* Panel de foto y cámara: hoja inferior en móvil */
  .photo-options-overlay { align-items: flex-end; padding: 0; }

  .photo-options-modal { max-width: none; padding: 12px 17px 20px; border-radius: 22px 22px 0 0; }

  .photo-options-handle {
    width: 38px;
    height: 4px;
    display: block;
    margin: 0 auto 17px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
  }

  .camera-overlay { align-items: flex-end; padding: 0; }

  .camera-modal {
    max-width: none;
    padding: 17px 14px calc(18px + env(safe-area-inset-bottom));
    border-radius: 24px 24px 0 0;
  }

  .camera-preview { aspect-ratio: 3 / 4; }

  .camera-actions { flex-direction: column-reverse; }

  .camera-cancel-btn,
  .capture-btn { width: 100%; justify-content: center; }
}

/* Pantallas muy angostas */
@media (max-width: 380px) {
  .settings-card { padding: 18px 12px; }
  .days-selector { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .weekly-time-field label { font-size: 9.5px; }
}

/* =========================================================
   REDUCIR MOVIMIENTO
========================================================= */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition: none !important;
    animation-duration: 0.01ms !important;
  }

  .camera-loader,
  .switch-camera-btn svg.rotating { animation-duration: 1.4s !important; }
}
</style>