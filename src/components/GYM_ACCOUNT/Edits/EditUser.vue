<script setup>
import { reactive, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import { traducciones } from '../i18n.js';
import NotificationSystem from '../../Modals/NotificationSystem.vue';

const router = useRouter();
const toastRef = ref(null);
const searchQuery = ref('');
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');

const t = (key) => {
  const langTable = traducciones[currentLang.value] || traducciones.es;
  return langTable?.[key] || traducciones.es?.[key] || key;
};

const txt = (es, en) => (currentLang.value === 'en' ? en : es);

const handleLangChange = (event) => {
  if (event.detail?.idioma) currentLang.value = event.detail.idioma;
};

/* ============================ FORMULARIO ============================ */

const form = reactive({
  nombres: 'José Luis',
  apellidoPaterno: 'Ramírez',
  apellidoMaterno: '',
  fechaNacimiento: '',
  celular: '',
  correo: '',
  peso: '',
  altura: '',
  sede: 'Matriz',
  status: 'Activo'
});

const handleSearch = () => {
  if (!searchQuery.value.trim()) return;
  console.log('Buscando cliente:', searchQuery.value);
};

const goToStatistics = () => {
  router.push({ name: 'statistics', params: { id: 'GymPer001' } });
};

/* ============================ FOTO / GALERÍA ============================ */

const fileInput = ref(null);
const avatarFile = ref(null);

const avatarSrc = ref(
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
);

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

  if (!file.type.startsWith('image/')) {
    toastRef.value?.notify(
      txt('Selecciona una imagen válida.', 'Select a valid image.'),
      'warning'
    );
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
    throw new Error('No se encontró el elemento de video.');
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
        'Permiso de cámara rechazado. Actívalo en el navegador.',
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

  /* Cámara frontal: se refleja la foto final para que coincida con el visor */
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

      const file = new File([blob], `cliente-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

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

/* ============================ GUARDAR ============================ */

const saveChanges = () => {
  console.log('Guardando cambios...', { ...form, foto: avatarFile.value });

  toastRef.value?.notify(
    txt('Guardado correctamente', 'Saved successfully'),
    'success'
  );
};

/* ============================ CICLO DE VIDA ============================ */

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
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
            {{ txt('GESTIÓN DE CLIENTE', 'CLIENT MANAGEMENT') }}
          </span>

          <h1>
            {{ txt('Perfil del', 'Client') }}
            <span>{{ txt('cliente', 'profile') }}</span>
          </h1>

          <p>
            {{
              txt(
                'Consulta y actualiza la información personal, física y de membresía.',
                'Review and update personal, physical and membership information.'
              )
            }}
          </p>
        </div>

        <!-- TUTOR 0: BUSCAR CLIENTE -->
        <div id="tutor-0" class="search-small input-group">
          <label for="client-search">
            {{ t('searchClientLabel') }}
          </label>

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
              id="client-search"
              v-model="searchQuery"
              type="text"
              :placeholder="t('searchPlaceholder')"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
      </header>

      <!-- ==================== PERFIL COMPLETO ==================== -->
      <div class="profile-card">
        <!-- ================================================== -->
        <!-- TUTOR 1: PERFIL DEL CLIENTE -->
        <!-- ================================================== -->
        <aside id="tutor-1" class="profile-section">
          <!-- ================================================== -->
          <!-- TUTOR 2: FOTOGRAFÍA -->
          <!-- ================================================== -->
          <div id="tutor-2" class="avatar-wrapper">
            <button
              type="button"
              class="avatar-circle"
              :aria-label="txt('Cambiar foto', 'Change photo')"
              @click="openPhotoOptions"
            >
              <img
                :src="avatarSrc"
                :alt="t('avatarAlt')"
              />

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

            <!-- TUTOR 3: VER ESTADÍSTICAS -->
            <button
              id="tutor-3"
              type="button"
              class="avatar-action btn-stats"
              :title="t('viewStatsTitle')"
              :aria-label="t('viewStatsTitle')"
              @click="goToStatistics"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>

            <!-- TUTOR 4: CAMBIAR FOTO -->
            <button
              id="tutor-4"
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

          <!-- ==================== NOMBRE ==================== -->
          <h2 class="main-title">
            {{ form.nombres || '—' }}
            <span>{{ form.apellidoPaterno || '—' }}</span>
          </h2>

          <!-- ==================== ESTADO ==================== -->
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

          <!-- ==================== RESUMEN ==================== -->
          <dl class="profile-meta">
            <!-- TUTOR 5: INFORMACIÓN DEL CLIENTE -->
            <div id="tutor-5">
              <dt>ID</dt>
              <dd>GymPer001</dd>
            </div>

            <div>
              <dt>{{ txt('Sede', 'Location') }}</dt>
              <dd>{{ form.sede || '—' }}</dd>
            </div>

            <div>
              <dt>{{ txt('Estado', 'Status') }}</dt>
              <dd>{{ form.status || '—' }}</dd>
            </div>
          </dl>
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
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>

                <h3 class="section-title">
                  {{ t('personalDataTitle') }}
                </h3>
              </div>

              <span class="card-subtitle">
                {{ t('clientDataSubtitle') }}
              </span>
            </div>

            <div class="form-grid-3">
              <!-- NOMBRES -->
              <div class="input-group">
                <label for="f-nombres">
                  {{ t('namesLabel') }}
                </label>

                <input
                  id="f-nombres"
                  v-model="form.nombres"
                  type="text"
                  autocomplete="given-name"
                  placeholder="José Luis"
                />
              </div>

              <!-- APELLIDO PATERNO -->
              <div class="input-group">
                <label for="f-paterno">
                  {{ t('lastNamePaternalLabel') }}
                </label>

                <input
                  id="f-paterno"
                  v-model="form.apellidoPaterno"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Ramírez"
                />
              </div>

              <!-- APELLIDO MATERNO -->
              <div class="input-group">
                <label for="f-materno">
                  {{ t('lastNameMaternalLabel') }}
                </label>

                <input
                  id="f-materno"
                  v-model="form.apellidoMaterno"
                  type="text"
                  placeholder="García"
                />
              </div>

              <!-- FECHA DE NACIMIENTO -->
              <div class="input-group">
                <label for="f-fecha">
                  {{ t('birthDateLabel') }}
                </label>

                <input
                  id="f-fecha"
                  v-model="form.fechaNacimiento"
                  type="date"
                />
              </div>

              <!-- CELULAR -->
              <div class="input-group">
                <label for="f-celular">
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
                    id="f-celular"
                    v-model="form.celular"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+52 000 000 0000"
                  />
                </div>
              </div>

              <!-- CORREO -->
              <div class="input-group">
                <label for="f-correo">
                  {{ t('emailLabel') }}
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
                    id="f-correo"
                    v-model="form.correo"
                    type="email"
                    autocomplete="email"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- ==================== BLOQUE INFERIOR ==================== -->
          <div class="lower-grid">
            <!-- ================================================== -->
            <!-- TUTOR 7: SEGUIMIENTO FÍSICO -->
            <!-- ================================================== -->
            <section id="tutor-7" class="login-card">
              <div class="card-header-flex">
                <div class="card-title-group">
                  <span class="card-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline
                        points="22 12 18 12 15 21 9 3 6 12 2 12"
                      />
                    </svg>
                  </span>

                  <h3 class="section-title">
                    {{ t('physicalTrackingTitle') }}
                  </h3>
                </div>
              </div>

              <div class="measurement-grid">
                <!-- PESO -->
                <div class="input-group">
                  <label for="f-peso">
                    {{ t('initialWeightLabel') }}
                  </label>

                  <div class="unit-input">
                    <input
                      id="f-peso"
                      v-model="form.peso"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="70"
                    />

                    <span>kg</span>
                  </div>
                </div>

                <!-- ALTURA -->
                <div class="input-group">
                  <label for="f-altura">
                    {{ t('initialHeightLabel') }}
                  </label>

                  <div class="unit-input">
                    <input
                      id="f-altura"
                      v-model="form.altura"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="175"
                    />

                    <span>cm</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- ================================================== -->
            <!-- TUTOR 8: MEMBRESÍA -->
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
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                      />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </span>

                  <h3 class="section-title">
                    {{ t('membershipTitle') }}
                  </h3>
                </div>
              </div>

              <div class="form-grid-2">
                <!-- SEDE -->
                <div class="input-group">
                  <label for="f-sede">
                    {{ t('locationLabel') }}
                  </label>

                  <input
                    id="f-sede"
                    v-model="form.sede"
                    type="text"
                    placeholder="Matriz"
                  />
                </div>

                <!-- ESTADO -->
                <div class="input-group">
                  <label for="f-status">
                    {{ t('statusLabel') }}
                  </label>

                  <input
                    id="f-status"
                    v-model="form.status"
                    type="text"
                    placeholder="Activo"
                  />
                </div>
              </div>
            </section>
          </div>

          <!-- ================================================== -->
          <!-- TUTOR 9: GUARDAR CAMBIOS -->
          <!-- ================================================== -->
          <footer class="action-footer">
            <button
              id="tutor-9"
              type="button"
              class="btn-primary"
              @click="saveChanges"
            >
              <svg
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

              {{ t('saveChangesBtn') }}
            </button>
          </footer>
        </div>
      </div>
    </main>

    <!-- ====================================================== -->
    <!-- MODAL: OPCIONES DE FOTO -->
    <!-- ====================================================== -->
    <transition name="photo-menu">
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
          <div class="modal-header">
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
                    'Selecciona cómo quieres agregar la fotografía del cliente.',
                    'Choose how you want to add the client photo.'
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
          </div>

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

            <!-- SELECCIONAR GALERÍA -->
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
    <transition name="photo-menu">
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
          <div class="modal-header">
            <div>
              <h3>
                {{ txt('Tomar fotografía', 'Take photo') }}
              </h3>

              <p>
                {{
                  cameraFacingMode === 'user'
                    ? txt('Cámara frontal', 'Front camera')
                    : txt('Cámara trasera', 'Rear camera')
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
          </div>

          <!-- ==================== VISTA DE CÁMARA ==================== -->
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

            <!-- CAMBIAR CÁMARA -->
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

            <!-- CARGANDO CÁMARA -->
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

          <!-- ==================== ACCIONES CÁMARA ==================== -->
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

.page-header h1 span {
  color: var(--accent);
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

.page-header p {
  max-width: 560px;
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.55;
}

/* ============================ BÚSQUEDA / INPUTS ============================ */

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

.search-input-wrapper,
.input-with-icon,
.unit-input {
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
  padding-left: 38px !important;
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

.input-group input[type='date'] {
  color-scheme: dark;
}

.input-group input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
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

/* ============================ PERFIL ============================ */

.profile-section {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 22px 22px;
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

.avatar-circle img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.btn-stats {
  top: 4px;
  left: -6px;
}

.btn-camera {
  right: -6px;
  bottom: 4px;
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

.profile-section {
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
}

.card-header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 11px;
}

.card-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
}

.card-icon svg {
  width: 16px;
  height: 16px;
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

.card-subtitle {
  color: var(--muted);
  font-size: 0.72rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.form-grid-2,
.measurement-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.lower-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.unit-input input {
  padding-right: 44px;
}

.unit-input span {
  position: absolute;
  right: 13px;
  color: var(--muted);
  font-size: 0.7rem;
  pointer-events: none;
}

/* ============================ GUARDAR ============================ */

.action-footer {
  display: flex;
  justify-content: flex-end;
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

/* ============================ FOCO VISIBLE ============================ */

.avatar-circle:focus-visible,
.avatar-action:focus-visible,
.btn-primary:focus-visible,
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

.photo-menu-enter-active,
.photo-menu-leave-active {
  transition: opacity 0.18s ease;
}

.photo-menu-enter-from,
.photo-menu-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============================ NOTIFICACIONES ============================ */

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

  .form-grid-3,
  .form-grid-2,
  .measurement-grid {
    grid-template-columns: 1fr;
  }

  .card-header-flex {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .action-footer {
    justify-content: stretch;
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
}

@media (max-width: 380px) {
  .main-content {
    padding-right: 8px;
    padding-left: 8px;
  }
}
</style>