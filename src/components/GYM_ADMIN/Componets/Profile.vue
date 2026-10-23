<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import HeadingGYM_ADMIN from '../HeadingGYM_ADMIN.vue';
import { traducciones } from '../i18n.js';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const currentLang = ref(localStorage.getItem('GYM_ADMIN-idioma') || 'es');
const router = useRouter();
const originalEmail = ref('contacto@ironfitness.com');

/* =========================================================
   TRADUCCIONES (con respaldo en español)
   ========================================================= */
const FALLBACKS: Record<string, string> = {
  labelNames: 'Nombre(s)',
  labelLastNameP: 'Apellido paterno',
  labelLastNameM: 'Apellido materno',
  labelBirthDate: 'Fecha de nacimiento',
  labelPhone: 'Celular',
  labelCurp: 'CURP',
  curpDisabledTitle: 'La CURP no se puede modificar',
  labelEmailModifiable: 'Correo de acceso',
  labelNewPassword: 'Nueva contraseña',
  passwordPlaceholder: 'Mínimo 8 caracteres',
  labelConfirmPassword: 'Confirmar contraseña',
  confirmPasswordPlaceholder: 'Repite la contraseña',
  btnSaveDataset: 'Guardar cambios',
  avatarUploadTitle: 'Cambiar fotografía',
  avatarPreviewAlt: 'Foto del propietario',
  avatarChangeTitle: 'Cambiar fotografía',
  credentialsUpdateModalTitle: 'Actualizar credenciales',
  emailChangeWarningText: 'Cambiaste el correo de acceso. Define una nueva contraseña para continuar; se cerrará tu sesión.',
  newAccessPasswordLabel: 'Nueva contraseña de acceso',
  enterNewPasswordPlaceholder: 'Escribe la nueva contraseña',
  confirmPasswordLabel: 'Confirmar contraseña',
  confirmNewPasswordPlaceholder: 'Repite la nueva contraseña',
  cancelBtn: 'Cancelar',
  confirmChangeBtn: 'Confirmar cambio',
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

const tr = (key: string, fallback: string) => {
  const dict = traducciones as Record<string, Record<string, string>>;
  const langTable = dict[currentLang.value] || dict['es'] || {};
  const fallbackTable = dict['es'] || {};
  return langTable[key] || fallbackTable[key] || fallback;
};

const txt = (es: string, en: string) => (currentLang.value === 'en' ? en : es);

const handleLangChange = (e: Event) => {
  const customEvent = e as CustomEvent<{ idioma?: string }>;
  if (customEvent.detail && customEvent.detail.idioma) {
    currentLang.value = customEvent.detail.idioma;
  }
};

/* =========================================================
   NAVEGACIÓN LATERAL (scroll spy)
   ========================================================= */
type NavSection = {
  id: string;
  title: [string, string];
  desc: [string, string];
  icon: string[];
};

const sections: NavSection[] = [
  {
    id: 'owner-personal',
    title: ['navOwnerPersonal', 'Datos personales'],
    desc: ['navOwnerPersonalDesc', 'Nombre y nacimiento'],
    icon: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  },
  {
    id: 'owner-contact',
    title: ['navOwnerContact', 'Contacto'],
    desc: ['navOwnerContactDesc', 'Celular y correo'],
    icon: ['M4 4h16v16H4z', 'm4 7 8 6 8-6'],
  },
  {
    id: 'owner-security',
    title: ['navOwnerSecurity', 'Seguridad'],
    desc: ['navOwnerSecurityDesc', 'Contraseña de acceso'],
    icon: ['M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M8 10V7a4 4 0 0 1 8 0v3'],
  },
];

const activeSection = ref('owner-personal');
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
  initScrollSpy();
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange as EventListener);
  sectionObserver?.disconnect();
  sectionObserver = null;
  stopCamera();
  if (previewImage.value?.startsWith('blob:')) URL.revokeObjectURL(previewImage.value);
});

/* =========================================================
   FORMULARIO
   ========================================================= */
const form = reactive({
  nombreGimnasio: 'Iron Fitness Center',
  curp: 'IFC220101HSLPR01',
  nombres: 'Juan Carlos',
  apellidoP: 'Pérez',
  apellidoM: 'Gómez',
  fechaNac: '1985-06-15',
  celular: '4811234567',
  email: 'contacto@ironfitness.com',
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showEmailModal = ref(false);
const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);

const showNotification = (
  msg: string,
  type: 'success' | 'warning' | 'info' | 'error' = 'success',
  duration = 4000
) => {
  toastRef.value?.notify(msg, type, duration);
};

const nombreCompleto = computed(() =>
  [form.nombres, form.apellidoP, form.apellidoM].map((s) => s.trim()).filter(Boolean).join(' ')
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

const edad = computed(() => calcularEdad(form.fechaNac));
const hoyISO = new Date().toISOString().slice(0, 10);

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Solo dígitos en el celular
const onPhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  form.celular = input.value.replace(/\D/g, '').slice(0, 10);
  input.value = form.celular;
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
  if (!form.nombres.trim() || !form.apellidoP.trim()) {
    return warn(txt('Completa tu nombre y apellido paterno.', 'Enter your name and last name.'), 'owner-personal');
  }

  if (edad.value === null) {
    return warn(txt('Ingresa tu fecha de nacimiento.', 'Enter your birth date.'), 'owner-personal');
  }
  if (edad.value < 18 || edad.value > 110) {
    return warn(txt('La fecha de nacimiento no es válida (mínimo 18 años).', 'Invalid birth date (minimum age 18).'), 'owner-personal');
  }

  if (form.celular.length !== 10) {
    return warn(txt('El celular debe tener 10 dígitos.', 'Phone number must have 10 digits.'), 'owner-contact');
  }

  if (!isValidEmail(form.email)) {
    return warn(txt('Escribe un correo válido.', 'Enter a valid email.'), 'owner-contact');
  }

  if (form.password || form.confirmPassword) {
    if (form.password.length < 8) {
      return warn(txt('La contraseña debe tener al menos 8 caracteres.', 'Password must be at least 8 characters.'), 'owner-security');
    }
    if (form.password !== form.confirmPassword) {
      return warn(t('passwordWarningMsg'), 'owner-security');
    }
  }
  return true;
};

const handleSaveChanges = () => {
  if (!validateForm()) return;

  if (form.email.trim() !== originalEmail.value) {
    showEmailModal.value = true;
    return;
  }

  // Lógica de guardado...
  form.password = '';
  form.confirmPassword = '';
  showNotification(t('Guardado Correctamente'), 'success');
};

const confirmEmailAndPasswordChange = () => {
  if (!form.password || form.password.length < 8 || form.password !== form.confirmPassword) {
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

/* =========================================================
   FOTO DE PERFIL (cámara o galería)
   ========================================================= */
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

      const file = new File([blob], `propietario-${Date.now()}.jpg`, { type: 'image/jpeg' });

      setAvatarFile(file);
      closeCamera();

      showNotification(txt('Foto tomada correctamente.', 'Photo captured successfully.'), 'success');
    },
    'image/jpeg',
    0.92
  );
};
</script>

<template>
  <HeadingGYM_ADMIN>
    <NotificationSystem ref="toastRef" />

    <main class="settings-page" id="tutor-0">

      <!-- ENCABEZADO GENERAL -->
      <header class="settings-header">
        <div class="settings-header-copy">
          <span class="page-eyebrow">{{ tr('ownerEyebrow', 'MI CUENTA') }}</span>
          <h1>{{ tr('ownerPageTitle', 'Perfil del propietario') }}</h1>
          <p>{{ tr('ownerPageDescription', 'Administra tus datos personales, información de contacto y la seguridad de tu cuenta.') }}</p>
        </div>

      </header>

      <!-- LAYOUT PRINCIPAL -->
      <div class="settings-layout">

        <!-- COLUMNA IZQUIERDA / RESUMEN -->
        <aside class="profile-sidebar">

          <section class="profile-summary" id="tutor-3">
            <div class="profile-top-label">
              {{ tr('ownerProfileLabel', 'PERFIL DEL PROPIETARIO') }}
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
              <h2>{{ nombreCompleto || '—' }}</h2>

              <span class="status-pill compact-status activo">
                <span class="status-dot"></span>
                {{ tr('ownerRole', 'Propietario') }}
              </span>

              <p>{{ tr('ownerPhotoHint', 'Esta foto se muestra en tu cuenta y en las acciones que realices en el sistema.') }}</p>
            </div>

            <div class="profile-divider"></div>

            <div class="profile-data-list">
              <div class="profile-data-item">
                <span>{{ tr('ownerGymLabel', 'Gimnasio') }}</span>
                <strong>{{ form.nombreGimnasio }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ tr('ownerAgeLabel', 'Edad') }}</span>
                <strong>{{ edad !== null && edad >= 0 ? `${edad} ${txt('años', 'years')}` : '—' }}</strong>
              </div>

              <div class="profile-data-item">
                <span>{{ tr('ownerPhoneLabel', 'Celular') }}</span>
                <strong>{{ form.celular || '—' }}</strong>
              </div>
            </div>

            <button type="button" class="sidebar-photo-btn" @click="openPhotoOptions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>

              {{ tr('changeOwnerPhoto', 'Cambiar fotografía') }}
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

            <!-- DATOS PERSONALES -->
            <section id="owner-personal" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ tr('ownerPersonalEyebrow', 'INFORMACIÓN PERSONAL') }}</span>
                  <h2>{{ tr('sectionAdminData', 'Datos personales') }}</h2>
                  <p>{{ tr('ownerPersonalDescription', 'Tu nombre completo y fecha de nacimiento tal como aparecen en tu identificación.') }}</p>
                </div>
              </header>

              <div class="form-grid">
                <div class="input-group">
                  <label for="nombres">{{ t('labelNames') }}</label>
                  <input id="nombres" v-model="form.nombres" type="text" autocomplete="given-name" required />
                </div>

                <div class="input-group">
                  <label for="apellidoP">{{ t('labelLastNameP') }}</label>
                  <input id="apellidoP" v-model="form.apellidoP" type="text" autocomplete="family-name" required />
                </div>

                <div class="input-group">
                  <label for="apellidoM">{{ t('labelLastNameM') }}</label>
                  <input id="apellidoM" v-model="form.apellidoM" type="text" required />
                </div>

                <div class="input-group">
                  <label for="fechaNac">{{ t('labelBirthDate') }}</label>
                  <input id="fechaNac" v-model="form.fechaNac" type="date" :max="hoyISO" required />
                </div>

                <div class="input-group span-full">
                  <label for="curp">{{ t('labelCurp') }}</label>

                  <div class="input-with-icon disabled" :title="t('curpDisabledTitle')">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="10" width="16" height="11" rx="2"/>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                    </svg>

                    <input id="curp" v-model="form.curp" type="text" disabled />
                  </div>

                  <small class="field-hint">
                    {{ tr('curpHint', 'La CURP no se puede modificar. Si hay un error, contacta a soporte.') }}
                  </small>
                </div>
              </div>
            </section>

            <!-- CONTACTO -->
            <section id="owner-contact" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4z"/>
                    <path d="m4 7 8 6 8-6"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow">{{ tr('ownerContactEyebrow', 'CONTACTO') }}</span>
                  <h2>{{ tr('ownerContactTitle', 'Celular y correo') }}</h2>
                  <p>{{ tr('ownerContactDescription', 'Medios con los que podemos comunicarnos contigo. El correo también es tu usuario de acceso.') }}</p>
                </div>
              </header>

              <div class="form-grid">
                <div class="input-group">
                  <label for="celular">{{ t('labelPhone') }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8.01 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/>
                    </svg>

                    <input
                      id="celular"
                      :value="form.celular"
                      type="tel"
                      inputmode="numeric"
                      maxlength="10"
                      placeholder="10 dígitos"
                      autocomplete="tel-national"
                      required
                      @input="onPhoneInput"
                    />
                  </div>
                </div>

                <div class="input-group">
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
                      autocomplete="email"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="security-notice contact-notice">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>

                <div>
                  <span>
                    {{ tr('ownerEmailNotice', 'Si cambias el correo de acceso deberás definir una nueva contraseña y volver a iniciar sesión.') }}
                  </span>
                </div>
              </div>
            </section>

            <!-- SEGURIDAD -->
            <section id="owner-security" class="settings-card">
              <header class="card-header">
                <div class="card-header-icon security">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="11" rx="2"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                  </svg>
                </div>

                <div>
                  <span class="card-eyebrow warn">{{ tr('securityEyebrow', 'SEGURIDAD') }}</span>
                  <h2>{{ tr('ownerSecurityTitle', 'Contraseña de acceso') }}</h2>
                  <p>{{ tr('ownerSecurityDescription', 'Déjala en blanco si no quieres cambiarla.') }}</p>
                </div>
              </header>

              <div class="security-notice">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>

                <div>
                  <strong>{{ tr('ownerSecurityNoticeTitle', 'Protege tu cuenta de propietario') }}</strong>
                  <span>
                    {{ tr('ownerSecurityNoticeText', 'Usa una contraseña de al menos 8 caracteres que no utilices en otros sitios.') }}
                  </span>
                </div>
              </div>

              <div class="form-grid">
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
                      autocomplete="new-password"
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

                <div class="input-group">
                  <label for="confirmPassword">{{ t('labelConfirmPassword') }}</label>

                  <div class="input-with-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12 4 4L19 6"/>
                    </svg>

                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      type="password"
                      autocomplete="new-password"
                      :placeholder="t('confirmPasswordPlaceholder')"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- GUARDAR -->
            <div class="save-bar">
              <div class="save-bar-copy">
                <strong>{{ tr('ownerSaveTitle', '¿Actualizaste tus datos?') }}</strong>
                <span>{{ tr('ownerSaveDescription', 'Revisa la información antes de guardar los cambios.') }}</span>
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
                  {{ txt('FOTO DE PERFIL', 'PROFILE PHOTO') }}
                </span>

                <h3>{{ txt('Agregar foto de perfil', 'Add profile photo') }}</h3>

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

                <h3>{{ txt('Tomar foto de perfil', 'Take profile photo') }}</h3>

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
                autocomplete="new-password"
                :placeholder="t('enterNewPasswordPlaceholder')"
                required
              />
            </div>

            <div class="input-group text-left modal-field-gap">
              <label>{{ t('confirmPasswordLabel') }}</label>

              <input
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
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

    </main>
  </HeadingGYM_ADMIN>
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
.save-button:focus-visible {
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

/* =========================================================
   INPUTS
========================================================= */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

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
  color-scheme: var(--color-scheme, dark);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.input-group > input:hover { border-color: rgba(255, 255, 255, 0.25); }

.input-group > input:focus {
  background: var(--field);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.input-group > input::placeholder { color: var(--muted2); }

.field-hint {
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

.input-with-icon input:disabled { color: var(--muted); cursor: not-allowed; }

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
   MODAL CAMBIO DE CORREO
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

@media (max-width: 380px) {
  .settings-card { padding: 18px 12px; }
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