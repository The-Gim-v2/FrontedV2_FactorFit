<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingAtleta from '../HeadingMember.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { solicitudMiembro, cargarSesionMiembro } from '../memberSesion.js';

const router = useRouter();

/* =========================================================
   IDIOMA
   ========================================================= */
const currentLang = ref(localStorage.getItem('member-idioma') || 'es');

const translations = {
  es: {
    // Encabezado
    pageEyebrow: 'MI CUENTA',
    pageTitle: 'Perfil del atleta',
    pageDescription: 'Administra tus datos personales, ubicación, medidas corporales, membresía y la seguridad de tu cuenta.',
    athleteRole: 'Atleta',
    profileLabel: 'PERFIL DEL ATLETA',
    profileHintText: 'Sube una fotografía oficial o reciente para tu expediente de atleta.',
    statusActive: 'Activo',
    statusPending: 'Pendiente',
    statusSuspended: 'Suspendido',
    changePhoto: 'Cambiar fotografía',
    uploadPhotoTooltip: 'Subir fotografía oficial',
    avatarAlt: 'Foto del atleta',

    // Resumen lateral
    summaryRole: 'Rol',
    summaryAge: 'Edad',
    summaryPhone: 'Celular',
    summaryMembership: 'Membresía',
    summaryCutoff: 'Próximo corte',
    years: 'años',

    // Navegación
    sectionsLabel: 'SECCIONES',
    navPersonal: 'Datos personales',
    navPersonalDesc: 'Nombre y nacimiento',
    navContact: 'Contacto',
    navContactDesc: 'Celular y correo',
    navLocation: 'Ubicación',
    navLocationDesc: 'Dirección y ciudad',
    navBody: 'Medidas corporales',
    navBodyDesc: 'Peso, altura y perímetros',
    navGym: 'Membresía del gimnasio',
    navGymDesc: 'Plan, fechas y pagos',
    navSecurity: 'Seguridad',
    navSecurityDesc: 'Contraseña de acceso',

    // Datos personales
    personalEyebrow: 'INFORMACIÓN PERSONAL',
    personalTitle: 'Datos personales',
    personalDescription: 'Datos registrados por el gimnasio. Son de solo lectura.',
    namesLabel: 'Nombres',
    paternalLastNameLabel: 'Apellido paterno',
    maternalLastNameLabel: 'Apellido materno',
    birthDateLabel: 'Fecha de nacimiento',

    // Contacto
    contactEyebrow: 'CONTACTO',
    contactTitle: 'Celular y correo',
    contactDescription: 'Datos de contacto. El correo también se utiliza para iniciar sesión.',
    cellphoneEditableLabel: 'Celular',
    cellphonePlaceholder: '10 dígitos',
    emailLabel: 'Correo electrónico',
    emailNotice: 'Si cambias el correo de acceso deberás definir una nueva contraseña y volver a iniciar sesión.',

    // Ubicación
    locationEyebrow: 'UBICACIÓN',
    locationTitle: 'Dirección',
    locationDescription: 'Dónde vives actualmente.',
    addressLabel: 'Dirección (calle y número)',
    addressPlaceholder: 'Ej. Av. Las Palmas #420',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Ej. Ciudad Valles',
    stateLabel: 'Estado / Provincia',
    statePlaceholder: 'Ej. San Luis Potosí',
    postalCodeLabel: 'Código postal',
    postalCodePlaceholder: 'Ej. 79000',

    // Medidas
    bodyEyebrow: 'ANTROPOMETRÍA',
    bodyTitle: 'Medidas corporales',
    bodyDescription: 'Mantén tus medidas al día para dar seguimiento a tu progreso.',
    bodyCompositionTitle: 'Composición corporal',
    bodyPerimeterTitle: 'Perímetros',
    weightLabel: 'Peso',
    alturaLabel: 'Altura',
    bodyFatLabel: '% Grasa corporal',
    muscleMassLabel: 'Masa muscular',
    chestLabel: 'Pecho / tórax',
    waistLabel: 'Cintura',
    armsLabel: 'Brazos',
    legsLabel: 'Piernas',

    // Membresía gimnasio
    gymEyebrow: 'MEMBRESÍA FÍSICA',
    gymMembershipTitle: 'Membresía del gimnasio',
    gymDescription: 'Información de tu plan en la sede. Solo la puede modificar el gimnasio.',
    gymMembershipTypeLabel: 'Tipo de membresía',
    monthlyMembership: 'Mensual',
    weeklyMembership: 'Semanal',
    enrollmentDateLabel: 'Fecha de inscripción',
    cutoffDateLabel: 'Fecha de corte',
    amountPaidLabel: 'Cantidad pagada',

    // Seguridad
    securityEyebrow: 'SEGURIDAD',
    securityAndPasswordTitle: 'Contraseña de acceso',
    securityDescription: 'Déjala en blanco si no quieres cambiarla.',
    securityNoticeTitle: 'Protege tu cuenta',
    securityNoticeText: 'Usa una contraseña de al menos 8 caracteres que no utilices en otros sitios.',
    newPasswordLabel: 'Nueva contraseña',
    optionalPlaceholder: 'Mínimo 8 caracteres',
    confirmPasswordLabel: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repite la contraseña',
    showPassword: 'Mostrar',
    hidePassword: 'Ocultar',

    // Guardar
    saveTitle: '¿Actualizaste tus datos?',
    saveDescription: 'Revisa la información antes de guardar los cambios.',
    saveChangesBtn: 'Guardar cambios',

    // Modal correo
    credentialsUpdateModalTitle: 'Actualizar credenciales',
    emailChangeWarningText: 'Cambiaste el correo de acceso. Por seguridad debes ingresar y confirmar una nueva contraseña; se cerrará tu sesión.',
    newAccessPasswordLabel: 'Nueva contraseña de acceso',
    enterNewPasswordPlaceholder: 'Escribe la nueva contraseña',
    confirmNewPasswordPlaceholder: 'Repite la nueva contraseña',
    cancelBtn: 'Cancelar',
    confirmChangeBtn: 'Confirmar cambio',

    // Foto y cámara
    photoEyebrow: 'FOTO DE PERFIL',
    photoModalTitle: 'Agregar foto de perfil',
    photoModalDesc: 'Selecciona cómo quieres agregar la imagen.',
    takePhoto: 'Tomar foto',
    takePhotoDesc: 'Abrir la cámara del dispositivo',
    chooseImage: 'Subir desde galería',
    chooseImageDesc: 'Seleccionar una imagen existente',
    cameraEyebrow: 'CÁMARA',
    cameraTitle: 'Tomar foto de perfil',
    frontCamera: 'Cámara frontal',
    rearCamera: 'Cámara trasera',
    rear: 'Trasera',
    front: 'Frontal',

    // Mensajes
    photoUpdatedMsg: 'Fotografía actualizada correctamente',
    photoCapturedMsg: 'Foto tomada correctamente.',
    invalidImageMsg: 'Selecciona una imagen válida.',
    savedSuccessMsg: 'Cambios guardados con éxito',
    passwordWarningMsg: 'Las contraseñas no coinciden o tienen menos de 8 caracteres.',
    emailChangedMsg: 'Correo actualizado. Inicia sesión de nuevo.',
    phoneInvalidMsg: 'El celular debe tener 10 dígitos.',
    emailInvalidMsg: 'Escribe un correo válido.',
    cameraUnsupported: 'Este navegador no permite utilizar la cámara.',
    cameraError: 'No se pudo acceder a la cámara.',
    cameraDenied: 'Permiso de cámara rechazado. Actívalo desde el navegador.',
    cameraNotFound: 'No se encontró una cámara en este dispositivo.',
    cameraBusy: 'La cámara está siendo utilizada por otra aplicación.',
    cameraUnavailable: 'La cámara seleccionada no está disponible.',
    cameraNotReady: 'La cámara todavía no está lista.',
    photoProcessError: 'No se pudo procesar la fotografía.',
    photoCaptureError: 'No se pudo capturar la fotografía.',
    close: 'Cerrar'
  },
  en: {
    pageEyebrow: 'MY ACCOUNT',
    pageTitle: 'Athlete profile',
    pageDescription: 'Manage your personal data, location, body measurements, membership and account security.',
    athleteRole: 'Athlete',
    profileLabel: 'ATHLETE PROFILE',
    profileHintText: 'Upload an official or recent photograph for your athlete record.',
    statusActive: 'Active',
    statusPending: 'Pending',
    statusSuspended: 'Suspended',
    changePhoto: 'Change photo',
    uploadPhotoTooltip: 'Upload official photograph',
    avatarAlt: 'Athlete photo',

    summaryRole: 'Role',
    summaryAge: 'Age',
    summaryPhone: 'Mobile',
    summaryMembership: 'Membership',
    summaryCutoff: 'Next cutoff',
    years: 'years',

    sectionsLabel: 'SECTIONS',
    navPersonal: 'Personal data',
    navPersonalDesc: 'Name and birth date',
    navContact: 'Contact',
    navContactDesc: 'Mobile and email',
    navLocation: 'Location',
    navLocationDesc: 'Address and city',
    navBody: 'Body measurements',
    navBodyDesc: 'Weight, height and girths',
    navGym: 'Gym membership',
    navGymDesc: 'Plan, dates and payments',
    navSecurity: 'Security',
    navSecurityDesc: 'Access password',

    personalEyebrow: 'PERSONAL INFORMATION',
    personalTitle: 'Personal data',
    personalDescription: 'Data registered by the gym. Read-only.',
    namesLabel: 'First names',
    paternalLastNameLabel: 'Last name',
    maternalLastNameLabel: "Mother's last name",
    birthDateLabel: 'Birth date',

    contactEyebrow: 'CONTACT',
    contactTitle: 'Mobile and email',
    contactDescription: 'Contact details. Your email is also used to sign in.',
    cellphoneEditableLabel: 'Mobile',
    cellphonePlaceholder: '10 digits',
    emailLabel: 'Email address',
    emailNotice: 'If you change your access email you will need to set a new password and sign in again.',

    locationEyebrow: 'LOCATION',
    locationTitle: 'Address',
    locationDescription: 'Where you currently live.',
    addressLabel: 'Address (street & number)',
    addressPlaceholder: 'e.g. 420 Palm Ave.',
    cityLabel: 'City',
    cityPlaceholder: 'e.g. Ciudad Valles',
    stateLabel: 'State / Province',
    statePlaceholder: 'e.g. San Luis Potosí',
    postalCodeLabel: 'Postal code',
    postalCodePlaceholder: 'e.g. 79000',

    bodyEyebrow: 'ANTHROPOMETRY',
    bodyTitle: 'Body measurements',
    bodyDescription: 'Keep your measurements up to date to track your progress.',
    bodyCompositionTitle: 'Body composition',
    bodyPerimeterTitle: 'Girths',
    weightLabel: 'Weight',
    alturaLabel: 'Height',
    bodyFatLabel: 'Body fat %',
    muscleMassLabel: 'Muscle mass',
    chestLabel: 'Chest',
    waistLabel: 'Waist',
    armsLabel: 'Arms',
    legsLabel: 'Legs',

    gymEyebrow: 'PHYSICAL MEMBERSHIP',
    gymMembershipTitle: 'Gym membership',
    gymDescription: 'Your plan at the venue. Only the gym can change it.',
    gymMembershipTypeLabel: 'Membership type',
    monthlyMembership: 'Monthly',
    weeklyMembership: 'Weekly',
    enrollmentDateLabel: 'Enrollment date',
    cutoffDateLabel: 'Cutoff date',
    amountPaidLabel: 'Amount paid',

    securityEyebrow: 'SECURITY',
    securityAndPasswordTitle: 'Access password',
    securityDescription: 'Leave it blank if you do not want to change it.',
    securityNoticeTitle: 'Protect your account',
    securityNoticeText: 'Use a password of at least 8 characters that you do not use on other sites.',
    newPasswordLabel: 'New password',
    optionalPlaceholder: 'At least 8 characters',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat the password',
    showPassword: 'Show',
    hidePassword: 'Hide',

    saveTitle: 'Did you update your data?',
    saveDescription: 'Review the information before saving your changes.',
    saveChangesBtn: 'Save changes',

    credentialsUpdateModalTitle: 'Update credentials',
    emailChangeWarningText: 'You changed your access email. For security you must enter and confirm a new password; you will be signed out.',
    newAccessPasswordLabel: 'New access password',
    enterNewPasswordPlaceholder: 'Enter new password',
    confirmNewPasswordPlaceholder: 'Repeat new password',
    cancelBtn: 'Cancel',
    confirmChangeBtn: 'Confirm change',

    photoEyebrow: 'PROFILE PHOTO',
    photoModalTitle: 'Add profile photo',
    photoModalDesc: 'Choose how you want to add the image.',
    takePhoto: 'Take photo',
    takePhotoDesc: 'Open your device camera',
    chooseImage: 'Choose image',
    chooseImageDesc: 'Select an existing image',
    cameraEyebrow: 'CAMERA',
    cameraTitle: 'Take profile photo',
    frontCamera: 'Front camera',
    rearCamera: 'Rear camera',
    rear: 'Rear',
    front: 'Front',

    photoUpdatedMsg: 'Photograph updated successfully',
    photoCapturedMsg: 'Photo captured successfully.',
    invalidImageMsg: 'Select a valid image.',
    savedSuccessMsg: 'Changes saved successfully',
    passwordWarningMsg: 'Passwords do not match or are shorter than 8 characters.',
    emailChangedMsg: 'Email updated. Please sign in again.',
    phoneInvalidMsg: 'Phone number must have 10 digits.',
    emailInvalidMsg: 'Enter a valid email.',
    cameraUnsupported: 'Camera is not supported by this browser.',
    cameraError: 'Could not access the camera.',
    cameraDenied: 'Camera permission was denied. Enable it in your browser.',
    cameraNotFound: 'No camera was found on this device.',
    cameraBusy: 'The camera is being used by another application.',
    cameraUnavailable: 'The selected camera is not available.',
    cameraNotReady: 'The camera is not ready yet.',
    photoProcessError: 'Could not process the photo.',
    photoCaptureError: 'Could not capture the photo.',
    close: 'Close'
  }
};

const t = computed(
  () => translations[currentLang.value as keyof typeof translations] || translations.es
);

const handleLangChange = (e: Event) => {
  const customEvent = e as CustomEvent<{ idioma?: string }>;
  if (customEvent.detail && customEvent.detail.idioma) {
    currentLang.value = customEvent.detail.idioma;
  }
};

/* =========================================================
   NOTIFICACIONES (toast)
   ========================================================= */
type ToastType = 'success' | 'warning' | 'info' | 'error';

// Mismo sistema visual de notificaciones utilizado por GYM_ACCOUNT.
const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const showNotification = (msg: string, type: ToastType = 'success', duration = 4000) => {
  toastRef.value?.notify(msg, type, duration);
};

/* =========================================================
   FORMULARIO
   ========================================================= */
const form = reactive({
  nombres: '', apellidoP: '', apellidoM: '', fechaNacimiento: '',
  celular: '', email: '', direccion: '', ciudad: '', estado: '', codigoPostal: '',
  status: 'pendiente' as 'activo' | 'pendiente' | 'suspendido',
  peso: '', altura: '', grasaCorporal: '', masaMuscular: '',
  pecho: '', cintura: '', brazos: '', legs: '',
  tipoMembresia: 'mes', fechaInscripcion: '', fechaCorte: '', montoPagado: '',
  webPlan: 'No disponible', password: '', confirmPassword: ''
});
const cargandoPerfil = ref(true);
const guardandoPerfil = ref(false);
let fotoPersistida: string | null = null;
const camposPerfil = [
  'nombres','apellidoP','apellidoM','fechaNacimiento','celular','email',
  'direccion','ciudad','estado','codigoPostal','peso','altura',
  'grasaCorporal','masaMuscular','pecho','cintura','brazos','legs',
  'tipoMembresia','fechaInscripcion','fechaCorte','montoPagado','webPlan','status'
] as const;
function asignarPerfil(perfil: Record<string, unknown>) {
  for (const campo of camposPerfil) {
    const valor = perfil[campo];
    if (campo === 'status') {
      form.status = (valor === 'activo' || valor === 'suspendido' ? valor : 'pendiente');
    } else {
      (form as unknown as Record<string, string>)[campo] = valor === null || valor === undefined ? '' : String(valor);
    }
  }
  form.webPlan = 'No disponible';
  fotoPersistida = typeof perfil.foto_url === 'string' ? perfil.foto_url : null;
  if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value);
  previewImage.value = fotoPersistida;
  avatarFile.value = null;
  originalEmail.value = form.email;
}
async function cargarPerfil() {
  cargandoPerfil.value = true;
  try {
    const datos = await solicitudMiembro<{ perfil: Record<string, unknown> }>('/api/member/perfil');
    asignarPerfil(datos.perfil || {});
  } catch (e) {
    showNotification(e instanceof Error ? e.message : 'No se pudo cargar el perfil', 'error', 6000);
  } finally {
    cargandoPerfil.value = false;
  }
}


const originalEmail = ref(form.email);
const showPassword = ref(false);

// Validación en tiempo real, compartida por Seguridad y el modal de correo.
const estadoConfirmacion = computed<'vacio' | 'incompleta' | 'diferente' | 'coincide'>(() => {
  if (!form.confirmPassword) return 'vacio';
  if (!form.password || form.password.length < 8) return 'incompleta';
  return form.password === form.confirmPassword ? 'coincide' : 'diferente';
});
const mensajeConfirmacion = computed(() => {
  if (estadoConfirmacion.value === 'vacio') return '';
  if (estadoConfirmacion.value === 'incompleta') {
    return currentLang.value === 'en'
      ? 'Enter a password of at least 8 characters.'
      : 'Escribe una contraseña de al menos 8 caracteres.';
  }
  if (estadoConfirmacion.value === 'coincide') {
    return currentLang.value === 'en' ? 'Passwords match.' : 'Las contraseñas coinciden.';
  }
  return currentLang.value === 'en' ? 'Passwords do not match.' : 'Las contraseñas no coinciden.';
});

const nombreCompleto = computed(() =>
  [form.nombres, form.apellidoP, form.apellidoM]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')
);

const calcularEdad = (iso: string): number | null => {
  const [y = 0, m = 0, d = 0] = (iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - y;
  const mesActual = hoy.getMonth() + 1;
  if (mesActual < m || (mesActual === m && hoy.getDate() < d)) edad--;
  return edad;
};

const edad = computed(() => calcularEdad(form.fechaNacimiento));

const statusLabel = computed(() =>
  form.status === 'activo'
    ? t.value.statusActive
    : form.status === 'pendiente'
      ? t.value.statusPending
      : t.value.statusSuspended
);

const membershipLabel = computed(() =>
  !form.fechaInscripcion ? '—' : (form.tipoMembresia === 'mes' ? t.value.monthlyMembership : t.value.weeklyMembership)
);

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00`);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(currentLang.value === 'en' ? 'en-US' : 'es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Solo dígitos en el celular
const onPhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  form.celular = input.value.replace(/\D/g, '').slice(0, 10);
  input.value = form.celular;
};

// Solo dígitos en el código postal
const onPostalInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  form.codigoPostal = input.value.replace(/\D/g, '').slice(0, 5);
  input.value = form.codigoPostal;
};

// Medidas corporales: máx. 3 dígitos enteros y, donde aplica, 1 decimal
type CampoMedida = 'peso' | 'altura' | 'grasaCorporal' | 'masaMuscular' | 'pecho' | 'cintura' | 'brazos' | 'legs';

const onMedidaInput = (campo: CampoMedida, e: Event, decimales = 1) => {
  const input = e.target as HTMLInputElement;
  const limpio = input.value.replace(',', '.').replace(/[^\d.]/g, '');
  const [entero = '', ...resto] = limpio.split('.');
  let valor = entero.slice(0, 3);
  if (decimales > 0 && resto.length) valor = (valor || '0') + '.' + resto.join('').slice(0, decimales);
  if (campo === 'grasaCorporal' && Number(valor) > 100) valor = '100';
  form[campo] = valor;
  input.value = valor;
};

/* =========================================================
   NAVEGACIÓN LATERAL (scroll spy)
   ========================================================= */
type NavSection = {
  id: string;
  title: string;
  desc: string;
  icon: string[];
};

const sections = computed<NavSection[]>(() => [
  {
    id: 'athlete-personal',
    title: t.value.navPersonal,
    desc: t.value.navPersonalDesc,
    icon: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z']
  },
  {
    id: 'athlete-contact',
    title: t.value.navContact,
    desc: t.value.navContactDesc,
    icon: ['M4 4h16v16H4z', 'm4 7 8 6 8-6']
  },
  {
    id: 'athlete-location',
    title: t.value.navLocation,
    desc: t.value.navLocationDesc,
    icon: ['M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11z', 'M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z']
  },
  {
    id: 'athlete-body',
    title: t.value.navBody,
    desc: t.value.navBodyDesc,
    icon: ['M3 12h3l3-8 4 16 3-8h5']
  },
  {
    id: 'athlete-gym',
    title: t.value.navGym,
    desc: t.value.navGymDesc,
    icon: ['M6 4v16M18 4v16M3 9v6M21 9v6M6 12h12']
  },
  {
    id: 'athlete-security',
    title: t.value.navSecurity,
    desc: t.value.navSecurityDesc,
    icon: ['M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M8 10V7a4 4 0 0 1 8 0v3']
  }
]);

const activeSection = ref('athlete-personal');
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
  sections.value.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) sectionObserver!.observe(el);
  });
};

/* =========================================================
   GUARDAR
   ========================================================= */
const warn = (msg: string, section?: string) => {
  showNotification(msg, 'warning', 5000);
  if (section) scrollToSection(section);
  return false;
};

const validateForm = () => {
  if (form.celular.length !== 10) {
    return warn(t.value.phoneInvalidMsg, 'athlete-contact');
  }

  if (!isValidEmail(form.email)) {
    return warn(t.value.emailInvalidMsg, 'athlete-contact');
  }

  if (form.password || form.confirmPassword) {
    if (form.password.length < 8 || form.password !== form.confirmPassword) {
      return warn(t.value.passwordWarningMsg, 'athlete-security');
    }
  }
  return true;
};

const showEmailModal = ref(false);
async function guardarPerfil() {
  if (guardandoPerfil.value || cargandoPerfil.value || !validateForm()) return;
  guardandoPerfil.value = true;
  try {
    const payload = new FormData();
    const editables = ['celular','email','direccion','ciudad','estado','codigoPostal',
      'peso','altura','grasaCorporal','masaMuscular','pecho','cintura','brazos','legs'] as const;
    for (const campo of editables) payload.append(campo, String(form[campo] ?? ''));
    if (form.password) {
      payload.append('password', form.password);
      payload.append('password_confirmation', form.confirmPassword);
    }
    if (avatarFile.value) payload.append('foto', avatarFile.value);
    const datos = await solicitudMiembro<{
      perfil: Record<string, unknown>; requiere_login?: boolean; message?: string;
      aviso_correo_anterior?: boolean; aviso_correo_nuevo?: boolean
    }>('/api/member/perfil', { method: 'POST', body: payload });
    asignarPerfil(datos.perfil || {});
    form.password = '';
    form.confirmPassword = '';
    showEmailModal.value = false;
    if (datos.requiere_login) {
      const aviso = datos.aviso_correo_anterior && datos.aviso_correo_nuevo
        ? 'Se enviaron avisos al correo anterior y al nuevo. Inicia sesión de nuevo.'
        : datos.aviso_correo_anterior || datos.aviso_correo_nuevo
          ? 'Correo actualizado. Solo se pudo enviar uno de los avisos. Inicia sesión de nuevo.'
          : 'Correo actualizado, pero no fue posible enviar avisos por email. Inicia sesión de nuevo.';
      showNotification(aviso, datos.aviso_correo_anterior && datos.aviso_correo_nuevo ? 'success' : 'warning', 6500);
      // Invalidar sólo la sesión de Member: no conservar credenciales revocadas.
      for (const storage of [sessionStorage, localStorage]) {
        for (const key of ['auth_token','token','access_token','member_token','user','user_role']) storage.removeItem(key);
      }
      await new Promise<void>(resolve => setTimeout(resolve, 1600));
      await router.replace('/login');
      return;
    }
    await cargarSesionMiembro(true).catch(() => {});
    showNotification(t.value.savedSuccessMsg, 'success');
  } catch (e) {
    showNotification(e instanceof Error ? e.message : 'No se pudieron guardar los datos', 'error', 6000);
  } finally { guardandoPerfil.value = false; }
}
const handleSaveChanges = () => {
  if (!validateForm() || guardandoPerfil.value || cargandoPerfil.value) return;
  if (form.email.trim().toLowerCase() !== originalEmail.value.trim().toLowerCase()) {
    showEmailModal.value = true;
    return;
  }
  void guardarPerfil();
};
const confirmEmailAndPasswordChange = () => {
  if (!form.password || form.password.length < 8 || form.password !== form.confirmPassword) {
    showNotification(t.value.passwordWarningMsg, 'warning'); return;
  }
  void guardarPerfil();
};

const fileInput = ref<HTMLInputElement | null>(null);
const previewImage = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

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

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
    showNotification(t.value.invalidImageMsg, 'warning');
    input.value = '';
    return;
  }

  setAvatarFile(file);
  showNotification('Foto seleccionada. Pulsa Guardar cambios para subirla.', 'info');
  input.value = '';
};

/* ---------- Cámara real ---------- */
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const cameraStream = ref<MediaStream | null>(null);
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
    showNotification(t.value.cameraUnsupported, 'warning');
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
    let message = t.value.cameraError;

    if (name === 'NotAllowedError') message = t.value.cameraDenied;
    if (name === 'NotFoundError') message = t.value.cameraNotFound;
    if (name === 'NotReadableError') message = t.value.cameraBusy;

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

    showNotification(t.value.cameraUnavailable, 'warning');
  } finally {
    switchingCamera.value = false;
  }
};

const capturePhoto = () => {
  if (switchingCamera.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;

  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    showNotification(t.value.cameraNotReady, 'warning');
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    showNotification(t.value.photoProcessError, 'error');
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

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
      if (!blob) {
        showNotification(t.value.photoCaptureError, 'error');
        return;
      }

      const file = new File([blob], `atleta-${Date.now()}.jpg`, { type: 'image/jpeg' });

      setAvatarFile(file);
      closeCamera();

      showNotification('Foto capturada. Pulsa Guardar cambios para subirla.', 'info');
    },
    'image/jpeg',
    0.92
  );
};

/* =========================================================
   CICLO DE VIDA
   ========================================================= */
onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange as EventListener);
  initScrollSpy();
  void cargarPerfil();
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  sectionObserver?.disconnect();
  sectionObserver = null;
  stopCamera();
  if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value);
});
</script>

<template>
  <HeadingAtleta>
    <main class="settings-page" id="tutorial-profile-main">

      <NotificationSystem ref="toastRef" />

      <!-- ENCABEZADO GENERAL -->
      <header class="settings-header">
        <div class="settings-header-copy">
          <span class="page-eyebrow">{{ t.pageEyebrow }}</span>
          <h1 id="tutorial-profile-title">{{ t.pageTitle }}</h1>
          <p>{{ t.pageDescription }}</p>
        </div>

      </header>

      <!-- LAYOUT PRINCIPAL -->
      <div class="settings-layout">

        <!-- COLUMNA IZQUIERDA / RESUMEN -->
        <aside class="profile-sidebar" id="tutorial-profile-sidebar">

          <section class="profile-summary">
            <div class="profile-top-label">{{ t.profileLabel }}</div>

            <div
              class="avatar-wrapper"
              id="tutorial-avatar-box"
              role="button"
              tabindex="0"
              :title="t.uploadPhotoTooltip"
              @click="openPhotoOptions"
              @keydown.enter.prevent="openPhotoOptions"
            >
              <div class="avatar-circle">
                <img v-if="previewImage" :src="previewImage" :alt="t.avatarAlt" class="avatar-img" />

                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              <span class="avatar-action" :title="t.changePhoto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>

              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelected" />
            </div>

            <div class="profile-identity">
              <h2 id="tutorial-athlete-name">{{ nombreCompleto || '—' }}</h2>

              <span class="status-pill compact-status" :class="form.status" id="tutorial-status-badge">
                <span class="status-dot"></span>
                {{ statusLabel }}
              </span>

              <p>{{ t.profileHintText }}</p>
            </div>

            <div class="profile-divider"></div>

            <div class="profile-data-list">
              <div class="profile-data-item">
                <span>{{ t.summaryRole }}</span>
                <strong>{{ t.athleteRole }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ t.summaryAge }}</span>
                <strong>{{ edad !== null && edad >= 0 ? `${edad} ${t.years}` : '—' }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ t.summaryPhone }}</span>
                <strong>{{ form.celular || '—' }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ t.summaryMembership }}</span>
                <strong>{{ membershipLabel }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ t.summaryCutoff }}</span>
                <strong>{{ formatDate(form.fechaCorte) }}</strong>
              </div>
            </div>

            <button type="button" class="sidebar-photo-btn" @click="openPhotoOptions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {{ t.changePhoto }}
            </button>
          </section>

          <!-- NAVEGACIÓN -->
          <nav class="settings-nav" :aria-label="t.sectionsLabel">
            <span class="settings-nav-title">{{ t.sectionsLabel }}</span>

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
                <strong>{{ s.title }}</strong>
                <small>{{ s.desc }}</small>
              </span>
            </button>
          </nav>
        </aside>

        <!-- FORMULARIO -->
        <div class="settings-content">
          <form @submit.prevent="handleSaveChanges">

            <!-- DATOS PERSONALES -->
            <section id="athlete-personal" class="settings-card">
              <div id="tutorial-personal-data-card"></div>
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ t.personalEyebrow }}</span>
                  <h2>{{ t.personalTitle }}</h2>
                  <p>{{ t.personalDescription }}</p>
                </div>
              </header>

              <div class="form-grid">
                <div class="input-group">
                  <label for="nombres">{{ t.namesLabel }}</label>
                  <div class="input-with-icon disabled">
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <input id="nombres" v-model="form.nombres" type="text" disabled />
                  </div>
                </div>

                <div class="input-group">
                  <label for="apellidoP">{{ t.paternalLastNameLabel }}</label>
                  <div class="input-with-icon disabled">
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <input id="apellidoP" v-model="form.apellidoP" type="text" disabled />
                  </div>
                </div>

                <div class="input-group">
                  <label for="apellidoM">{{ t.maternalLastNameLabel }}</label>
                  <div class="input-with-icon disabled">
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <input id="apellidoM" v-model="form.apellidoM" type="text" disabled />
                  </div>
                </div>

                <div class="input-group">
                  <label for="fechaNacimiento">{{ t.birthDateLabel }}</label>
                  <div class="input-with-icon disabled">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
                    <input id="fechaNacimiento" v-model="form.fechaNacimiento" type="date" disabled />
                  </div>
                </div>
              </div>
            </section>

            <!-- CONTACTO -->
            <section id="athlete-contact" class="settings-card">
              <div id="tutorial-credentials-card"></div>
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ t.contactEyebrow }}</span>
                  <h2>{{ t.contactTitle }}</h2>
                  <p>{{ t.contactDescription }}</p>
                </div>
              </header>

              <div class="form-grid">
                <div class="input-group">
                  <label for="celular">{{ t.cellphoneEditableLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
                    </svg>

                    <input
                      id="celular"
                      :value="form.celular"
                      type="tel"
                      inputmode="numeric"
                      maxlength="10"
                      :placeholder="t.cellphonePlaceholder"
                      autocomplete="tel-national"
                      required
                      @input="onPhoneInput"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label for="email">{{ t.emailLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 4h16v16H4z" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>

                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      autocomplete="email"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="security-notice contact-notice">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>

                <div>
                  <span>{{ t.emailNotice }}</span>
                </div>
              </div>
            </section>

            <!-- UBICACIÓN -->
            <section id="athlete-location" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11z" />
                    <circle cx="12" cy="10" r="2" />
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ t.locationEyebrow }}</span>
                  <h2>{{ t.locationTitle }}</h2>
                  <p>{{ t.locationDescription }}</p>
                </div>
              </header>

              <div class="form-grid">
                <div class="input-group span-full">
                  <label for="direccion">{{ t.addressLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
                    <input
                      id="direccion"
                      v-model="form.direccion"
                      type="text"
                      autocomplete="street-address"
                      :placeholder="t.addressPlaceholder"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label for="ciudad">{{ t.cityLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l6-4v17M11 21V11h8v10" /></svg>
                    <input
                      id="ciudad"
                      v-model="form.ciudad"
                      type="text"
                      autocomplete="address-level2"
                      :placeholder="t.cityPlaceholder"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label for="estado">{{ t.stateLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>
                    <input
                      id="estado"
                      v-model="form.estado"
                      type="text"
                      autocomplete="address-level1"
                      :placeholder="t.statePlaceholder"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label for="codigoPostal">{{ t.postalCodeLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h5" /></svg>
                    <input
                      id="codigoPostal"
                      :value="form.codigoPostal"
                      type="text"
                      inputmode="numeric"
                      maxlength="5"
                      autocomplete="postal-code"
                      :placeholder="t.postalCodePlaceholder"
                      @input="onPostalInput"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- MEDIDAS CORPORALES -->
            <section id="athlete-body" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M3 12h3l3-8 4 16 3-8h5" /></svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ t.bodyEyebrow }}</span>
                  <h2>{{ t.bodyTitle }}</h2>
                  <p>{{ t.bodyDescription }}</p>
                </div>
              </header>

              <h4 class="sub-heading">{{ t.bodyCompositionTitle }}</h4>

              <div class="form-grid grid-4">
                <div class="input-group">
                  <label for="peso">{{ t.weightLabel }}</label>
                  <div class="unit-input">
                    <input id="peso" :value="form.peso" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="75.5" @input="onMedidaInput('peso', $event)" />
                    <span>kg</span>
                  </div>
                </div>

                <div class="input-group">
                  <label for="altura">{{ t.alturaLabel }}</label>
                  <div class="unit-input">
                    <input id="altura" :value="form.altura" type="text" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="178" @input="onMedidaInput('altura', $event, 0)" />
                    <span>cm</span>
                  </div>
                </div>

                <div class="input-group">
                  <label for="grasaCorporal">{{ t.bodyFatLabel }}</label>
                  <div class="unit-input">
                    <input id="grasaCorporal" :value="form.grasaCorporal" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="14.5" @input="onMedidaInput('grasaCorporal', $event)" />
                    <span>%</span>
                  </div>
                </div>

                <div class="input-group">
                  <label for="masaMuscular">{{ t.muscleMassLabel }}</label>
                  <div class="unit-input">
                    <input id="masaMuscular" :value="form.masaMuscular" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="38.2" @input="onMedidaInput('masaMuscular', $event)" />
                    <span>kg</span>
                  </div>
                </div>
              </div>

              <h4 class="sub-heading">{{ t.bodyPerimeterTitle }}</h4>

              <div class="form-grid grid-4">
                <div class="input-group">
                  <label for="pecho">{{ t.chestLabel }}</label>
                  <div class="unit-input">
                    <input id="pecho" :value="form.pecho" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="102" @input="onMedidaInput('pecho', $event)" />
                    <span>cm</span>
                  </div>
                </div>

                <div class="input-group">
                  <label for="cintura">{{ t.waistLabel }}</label>
                  <div class="unit-input">
                    <input id="cintura" :value="form.cintura" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="81" @input="onMedidaInput('cintura', $event)" />
                    <span>cm</span>
                  </div>
                </div>

                <div class="input-group">
                  <label for="brazos">{{ t.armsLabel }}</label>
                  <div class="unit-input">
                    <input id="brazos" :value="form.brazos" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="37" @input="onMedidaInput('brazos', $event)" />
                    <span>cm</span>
                  </div>
                </div>

                <div class="input-group">
                  <label for="legs">{{ t.legsLabel }}</label>
                  <div class="unit-input">
                    <input id="legs" :value="form.legs" type="text" inputmode="decimal" maxlength="5" autocomplete="off" placeholder="58" @input="onMedidaInput('legs', $event)" />
                    <span>cm</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- SEGURIDAD -->
            <section id="athlete-security" class="settings-card">
              <div id="tutorial-security-card"></div>
              <header class="card-header">
                <div class="card-header-icon security">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow warn">{{ t.securityEyebrow }}</span>
                  <h2>{{ t.securityAndPasswordTitle }}</h2>
                  <p>{{ t.securityDescription }}</p>
                </div>
              </header>

              <div class="security-notice">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>

                <div>
                  <strong>{{ t.securityNoticeTitle }}</strong>
                  <span>{{ t.securityNoticeText }}</span>
                </div>
              </div>

              <div class="form-grid">
                <div class="input-group">
                  <label for="password">{{ t.newPasswordLabel }}</label>

                  <div class="input-with-icon password-input">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      :placeholder="t.optionalPlaceholder"
                    />

                    <button
                      type="button"
                      class="toggle-password-btn"
                      :title="showPassword ? t.hidePassword : t.showPassword"
                      @click="showPassword = !showPassword"
                    >
                      <svg v-if="showPassword" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>

                      <svg v-else viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M3 3l18 18" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="input-group">
                  <label for="confirmPassword">{{ t.confirmPasswordLabel }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12 4 4L19 6" />
                    </svg>

                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      type="password"
                      autocomplete="new-password"
                      :placeholder="t.confirmPasswordPlaceholder"
                      :aria-invalid="estadoConfirmacion === 'diferente' || estadoConfirmacion === 'incompleta'"
                      aria-describedby="confirm-password-feedback"
                    />
                  </div>
                  <p v-if="mensajeConfirmacion" id="confirm-password-feedback"
                     class="password-match-feedback"
                     :class="estadoConfirmacion === 'coincide' ? 'match-ok' : 'match-error'"
                     aria-live="polite">
                    {{ estadoConfirmacion === 'coincide' ? '✓' : '✕' }} {{ mensajeConfirmacion }}
                  </p>
                </div>
              </div>
            </section>

            <!-- GUARDAR -->
            <div class="save-bar">
              <div class="save-bar-copy">
                <strong>{{ t.saveTitle }}</strong>
                <span>{{ t.saveDescription }}</span>
              </div>

              <button type="submit" class="save-button" id="tutorial-save-btn" :disabled="guardandoPerfil || cargandoPerfil">
                <svg viewBox="0 0 24 24">
                  <path d="M5 3h14l2 2v16H3V3z" />
                  <path d="M8 3v6h8V3M8 21v-7h8v7" />
                </svg>

                {{ guardandoPerfil ? (currentLang === 'en' ? 'Saving…' : 'Guardando…') : t.saveChangesBtn }}
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
                <span class="photo-options-eyebrow">{{ t.photoEyebrow }}</span>
                <h3>{{ t.photoModalTitle }}</h3>
                <p>{{ t.photoModalDesc }}</p>
              </div>

              <button type="button" class="modal-close-btn" :aria-label="t.close" @click="closePhotoOptions">×</button>
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
                  <strong>{{ t.takePhoto }}</strong>
                  <span>{{ t.takePhotoDesc }}</span>
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
                  <strong>{{ t.chooseImage }}</strong>
                  <span>{{ t.chooseImageDesc }}</span>
                </div>

                <svg class="photo-option-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <button type="button" class="photo-cancel" @click="closePhotoOptions">
              {{ t.cancelBtn }}
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
                <span class="camera-eyebrow">{{ t.cameraEyebrow }}</span>
                <h3>{{ t.cameraTitle }}</h3>
                <p>{{ cameraFacingMode === 'user' ? t.frontCamera : t.rearCamera }}</p>
              </div>

              <button type="button" class="modal-close-btn" :aria-label="t.close" @click="closeCamera">×</button>
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

                <span>{{ cameraFacingMode === 'user' ? t.rear : t.front }}</span>
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
                {{ t.cancelBtn }}
              </button>

              <button type="button" class="capture-btn" :disabled="switchingCamera" @click="capturePhoto">
                <span class="capture-circle"><span></span></span>
                {{ t.takePhoto }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL: CAMBIO DE CORREO -->
      <div v-if="showEmailModal" class="modal-overlay" id="tutorial-email-modal" @click.self="showEmailModal = false">
        <div class="modal-container modal-small animate-modal">
          <div class="modal-header">
            <h3>{{ t.credentialsUpdateModalTitle }}</h3>
            <button type="button" class="close-btn" :aria-label="t.close" @click="showEmailModal = false">×</button>
          </div>

          <div class="modal-body text-center">
            <div class="warning-icon-wrapper info">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <p class="modal-text">{{ t.emailChangeWarningText }}</p>

            <div class="input-group text-left">
              <label>{{ t.newAccessPasswordLabel }}</label>

              <input
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                :placeholder="t.enterNewPasswordPlaceholder"
                required
              />
            </div>

            <div class="input-group text-left modal-field-gap">
              <label>{{ t.confirmPasswordLabel }}</label>

              <input
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                :placeholder="t.confirmNewPasswordPlaceholder"
                :aria-invalid="estadoConfirmacion === 'diferente' || estadoConfirmacion === 'incompleta'"
                aria-describedby="modal-confirm-password-feedback"
                required
              />
              <p v-if="mensajeConfirmacion" id="modal-confirm-password-feedback"
                 class="password-match-feedback"
                 :class="estadoConfirmacion === 'coincide' ? 'match-ok' : 'match-error'"
                 aria-live="polite">
                {{ estadoConfirmacion === 'coincide' ? '✓' : '✕' }} {{ mensajeConfirmacion }}
              </p>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary-modal" @click="showEmailModal = false">
                {{ t.cancelBtn }}
              </button>

              <button type="button" class="btn-primary-modal" @click="confirmEmailAndPasswordChange">
                {{ t.confirmChangeBtn }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

  </HeadingAtleta>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

button, input, textarea { font: inherit; }

/* =========================================================
   BASE
   Todo sale de las variables globales del tema. Esta página
   ya NO pinta su propio fondo: usa el del layout.
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

.pre-line { white-space: pre-line; }

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
.btn-icon-action:focus-visible,
.btn-text-danger:focus-visible {
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

.profile-divider {
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

.card-header > div:last-child { min-width: 0; }

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

.sub-heading {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.sub-heading:not(:first-of-type) {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

/* =========================================================
   INPUTS
========================================================= */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.form-grid.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

.span-full { grid-column: 1 / -1; }

.input-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: var(--text);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.2;
}

.input-group > input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 14px;
  color: var(--text);
  font-size: 14px;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.input-group > input:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.25); }

.input-group > input:focus {
  background: var(--field);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.input-group > input::placeholder { color: var(--muted2); }

.input-group > input:disabled {
  color: var(--muted);
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--line);
  -webkit-text-fill-color: var(--muted);
  opacity: 1;
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

.input-with-icon.disabled {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--line);
  cursor: not-allowed;
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

.input-with-icon input:disabled {
  color: var(--muted);
  cursor: not-allowed;
  -webkit-text-fill-color: var(--muted);
  opacity: 1;
}

.input-with-icon input::placeholder { color: var(--muted2); }

/* Campos con unidad (kg, cm, %) */
.unit-input {
  position: relative;
  min-width: 0;
}

.unit-input input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 44px 0 14px;
  color: var(--text);
  font-size: 14px;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.unit-input input:hover { border-color: rgba(255, 255, 255, 0.25); }

.unit-input input:focus {
  background: var(--field);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.unit-input input::placeholder { color: var(--muted2); }

.unit-input span {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: var(--muted2);
  font-size: 11.5px;
  font-weight: 700;
  pointer-events: none;
}

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
   AVISOS
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

.security-notice.contact-notice {
  margin: 20px 0 0;
  background: var(--accent-soft);
  border-color: var(--accent-border);
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

.security-notice.contact-notice > svg { stroke: var(--accent); }

.security-notice > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }

.security-notice strong { color: var(--text); font-size: 12.5px; }

.security-notice span { color: var(--muted); font-size: 12px; line-height: 1.45; }

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
   TOAST
========================================================= */
.floating-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100000;
  max-width: min(420px, calc(100vw - 32px));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.floating-toast svg { flex: none; }

.floating-toast.success { background: rgba(16, 185, 129, 0.92); border: 1px solid rgba(52, 211, 153, 0.4); }
.floating-toast.warning { background: rgba(245, 158, 11, 0.92); border: 1px solid rgba(251, 191, 36, 0.4); }
.floating-toast.error { background: rgba(239, 68, 68, 0.92); border: 1px solid rgba(248, 113, 113, 0.4); }
.floating-toast.info { background: rgba(59, 130, 246, 0.92); border: 1px solid rgba(96, 165, 250, 0.4); }

.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }

.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(-20px); }

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

/* ---------- Transiciones ---------- */
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

.pop-enter-active,
.pop-leave-active { transition: all 0.25s ease; }

.pop-enter-from,
.pop-leave-to { opacity: 0; transform: scale(0.95); }

/* =========================================================
   MODALES (correo)
========================================================= */
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
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

.modal-body .input-group input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  color: var(--text);
  font-size: 14px;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  outline: none;
}

.modal-body .input-group input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }

.btn-secondary-modal,
.btn-primary-modal,
.btn-danger-modal {
  min-height: 42px;
  padding: 0 18px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
}

.btn-secondary-modal { color: var(--text); background: rgba(255, 255, 255, 0.04); border: 1px solid var(--line); }

.btn-primary-modal { color: #fff; background: var(--accent); border: 1px solid var(--accent); }

.btn-danger-modal { color: #fff; background: #ef4444; border: 1px solid #ef4444; }

.btn-danger-modal:hover { background: #dc2626; }

.animate-modal { animation: modal-in 0.18s ease; }

@keyframes modal-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

/* =========================================================
   TABLET
========================================================= */
@media (max-width: 1180px) {
  .settings-layout { grid-template-columns: 250px minmax(0, 1fr); gap: 18px; }
  .settings-card { padding: 24px; }
  .form-grid.grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* =========================================================
   MÓVIL / TABLET PEQUEÑA
========================================================= */
@media (max-width: 900px) {
  .settings-page { padding: 24px 18px 50px; }

  .settings-layout { grid-template-columns: minmax(0, 1fr); }

  .profile-summary { padding: 22px; }

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

  .form-grid { grid-template-columns: minmax(0, 1fr); }

  .form-grid.grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .span-full { grid-column: auto; }
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

  .security-notice { align-items: flex-start; }

  .save-bar { align-items: stretch; flex-direction: column; }

  .save-button { width: 100%; }

  .floating-toast { top: 12px; right: 12px; left: 12px; max-width: none; }

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

@media (max-width: 420px) {
  .settings-card { padding: 18px 12px; }

  .form-grid.grid-4 { grid-template-columns: minmax(0, 1fr); }

  .switch-camera-btn span { display: none; }

  .switch-camera-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
  }
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

/* Confirmación de contraseña (sin alterar el diseño del formulario) */
.password-match-feedback {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 600;
}
.password-match-feedback.match-ok { color: #34d399; }
.password-match-feedback.match-error { color: #fb7185; }

</style>