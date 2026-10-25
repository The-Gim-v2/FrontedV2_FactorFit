<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <div v-if="qrModal" class="ff-qr-overlay" @click.self="cerrarQR"><section class="ff-qr-card"><button type="button" class="ff-qr-close" @click="cerrarQR">×</button><h2>Inscripción registrada</h2><p>Cliente #{{ qrModal.ID_Cliente }} · Inscripción #{{ qrModal.ID_Inscripto }}</p><p class="ff-qr-status">Pendiente de pago · El QR no habilita el acceso hasta activar la membresía.</p><p v-if="qrCargando">Cargando código QR...</p><p v-else-if="qrError" class="ff-qr-error">{{ qrError }}</p><img v-else-if="qrUrl" :src="qrUrl" alt="Código QR de inscripción" class="ff-qr-image" /><div class="ff-qr-actions"><button type="button" @click="descargarQR" :disabled="!qrModal || qrCargando">Descargar PNG</button><button type="button" @click="cerrarQR">Cerrar</button></div></section></div>

    <main class="main-content">
      <div class="profile-card">
        <!-- =====================================================
             PERFIL
        ====================================================== -->
        <aside class="profile-section" id="tutorial-step-0">
          <div class="profile-content">
            <span class="profile-label">{{ t('personalData') }}</span>

            <h1 class="main-title">
              {{ t('title1') }}<br />
              <span class="highlight">{{ t('title2') }}</span>
            </h1>

            <!-- FOTO -->
            <div class="avatar-wrapper">
              <div class="avatar-ring">
                <div
                  class="avatar-circle"
                  role="button"
                  tabindex="0"
                  @click="openPhotoOptions"
                  @keydown.enter="openPhotoOptions"
                  @keydown.space.prevent="openPhotoOptions"
                >
                  <img
                    v-if="avatarPreview"
                    :src="avatarPreview"
                    :alt="t('altPreview')"
                    class="avatar-img"
                  />

                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="default-avatar"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>

                  <div class="avatar-overlay">
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

                    <span>
                      {{ currentLang === 'en' ? 'Change photo' : 'Cambiar foto' }}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="avatar-action"
                @click="openPhotoOptions"
                :title="t('titleAvatar')"
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

              <!-- ÚNICAMENTE PARA GALERÍA/ARCHIVOS -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="handleFileChange"
              />
            </div>

            <p class="profile-hint">
              {{
                currentLang === 'en'
                  ? 'Take a photo or select one from your device.'
                  : 'Toma una foto o selecciona una desde tu dispositivo.'
              }}
            </p>

            <dl class="profile-summary">
              <div class="summary-item">
                <dt>{{ currentLang === 'en' ? 'Client' : 'Cliente' }}</dt>
                <dd :class="{ empty: !clientName }">
                  {{
                    clientName ||
                    (currentLang === 'en' ? 'New client' : 'Nuevo cliente')
                  }}
                </dd>
              </div>

              <div class="summary-item">
                <dt>{{ t('membershipData') }}</dt>
                <dd>
                  <span class="plan-chip">
                    {{
                      form.tipoMembresia === 'mes'
                        ? t('month')
                        : t('week')
                    }}
                  </span>
                </dd>
              </div>

              <div class="summary-item">
                <dt>{{ t('enrollmentDate') }}</dt>
                <dd :class="{ empty: !form.fechaInscripcion }">
                  {{ form.fechaInscripcion || '—' }}
                </dd>
              </div>

              <div class="summary-item">
                <dt>{{ t('dueDate') }}</dt>
                <dd :class="{ empty: !form.fechaCorte }">
                  {{ form.fechaCorte || '—' }}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <!-- =====================================================
             FORMULARIOS
        ====================================================== -->
        <div class="forms-wrapper">
          <!-- DATOS PERSONALES -->
          <section class="login-card" id="tutorial-step-1">
            <header class="card-header">
              <div class="card-header-text">
                <h3 class="section-title">{{ t('personalData') }}</h3>

                <p class="section-description">
                  {{
                    currentLang === 'en'
                      ? 'Basic client information'
                      : 'Información básica del cliente'
                  }}
                </p>
              </div>
            </header>

            <div class="form-grid form-grid-3">
              <div class="input-group">
                <label>
                  {{ t('names') }}
                  <span class="required">*</span>
                </label>

                <input
                  type="text"
                  v-model="form.nombres"
                  :placeholder="t('placeholderName')"
                  autocomplete="given-name"
                />
              </div>

              <div class="input-group">
                <label>
                  {{ t('lastNameP') }}
                  <span class="required">*</span>
                </label>

                <input
                  type="text"
                  v-model="form.apellidoP"
                  :placeholder="t('placeholderLastNameP')"
                  autocomplete="family-name"
                />
              </div>

              <div class="input-group">
                <label>
                  {{ t('lastNameM') }}
                  <span class="required">*</span>
                </label>

                <input
                  type="text"
                  v-model="form.apellidoM"
                  :placeholder="t('placeholderLastNameM')"
                />
              </div>

              <div class="input-group">
                <label>
                  {{ t('birthDate') }}
                  <span class="required">*</span>
                </label>

                <input
                  type="date"
                  v-model="form.fechaNacimiento"
                />
              </div>

              <div class="input-group">
                <label>{{ t('cellphone') }}</label>

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
                    type="tel"
                    v-model="form.celular"
                    placeholder="+52 000 000 0000"
                    autocomplete="tel"
                  />
                </div>
              </div>

              <div class="input-group">
                <label>{{ t('email') }}</label>

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
                    type="email"
                    v-model="form.email"
                    placeholder="ejemplo@correo.com"
                    autocomplete="email"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- REGISTRO FÍSICO -->
          <section
            class="login-card physical-card"
            id="tutorial-step-2"
          >
            <header class="card-header">
              <div class="card-header-text">
                <h3 class="section-title">{{ t('physicalRecord') }}</h3>

                <p class="section-description">
                  {{
                    currentLang === 'en'
                      ? 'Initial physical measurements'
                      : 'Medidas físicas iniciales'
                  }}
                </p>
              </div>
            </header>

            <div class="physical-grid">
              <div class="measurement-field">
                <div class="measurement-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M6 3h12l3 18H3L6 3z" />
                    <path d="M9 8a3 3 0 0 1 6 0" />
                  </svg>
                </div>

                <div class="measurement-content">
                  <label>{{ t('weight') }}</label>

                  <div class="measurement-input">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      v-model="form.peso"
                      placeholder="70"
                    />
                    <span>kg</span>
                  </div>
                </div>
              </div>

              <div class="measurement-field">
                <div class="measurement-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M6 2v20" />
                    <path d="M6 4h5" />
                    <path d="M6 8h3" />
                    <path d="M6 12h5" />
                    <path d="M6 16h3" />
                    <path d="M6 20h5" />
                    <path d="M15 4v16" />
                    <path d="m12 7 3-3 3 3" />
                    <path d="m12 17 3 3 3-3" />
                  </svg>
                </div>

                <div class="measurement-content">
                  <label>{{ t('height') }}</label>

                  <div class="measurement-input">
                    <input
                      type="number"
                      min="0"
                      v-model="form.altura"
                      placeholder="175"
                    />
                    <span>cm</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- MEMBRESÍA -->
          <section class="login-card" id="tutorial-step-3">
            <header class="card-header membership-header">
              <div class="card-header-text">
                <h3 class="section-title">{{ t('membershipData') }}</h3>

                <p class="section-description">
                  {{
                    currentLang === 'en'
                      ? 'Select the membership period and registration dates.'
                      : 'Selecciona el periodo de membresía y las fechas del cliente.'
                  }}
                </p>
              </div>

              <div class="membership-actions-row">
                <div
                  class="toggle-group-small"
                  :data-active="form.tipoMembresia"
                >
                  <button
                    type="button"
                    class="btn-toggle-small"
                    :class="{ active: form.tipoMembresia === 'mes' }"
                    @click="form.tipoMembresia = 'mes'"
                  >
                    {{ t('month') }}
                  </button>

                  <button
                    type="button"
                    class="btn-toggle-small"
                    :class="{ active: form.tipoMembresia === 'semana' }"
                    @click="form.tipoMembresia = 'semana'"
                  >
                    {{ t('week') }}
                  </button>
                </div>

                <div class="actions-group">
                  <button
                    type="button"
                    class="action-btn"
                    :title="t('titleCut')"
                    @click="activeModal = 'corte'"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="action-btn"
                    :title="t('titleHelp')"
                    @click="activeModal = 'help'"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path
                        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                      />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            <div class="input-group" style="margin-bottom:16px"><label>Tarifa de inscripción <span class="required">*</span></label><select v-model="idPrecio" required style="width:100%;height:46px;padding:0 14px;border-radius:12px;background:var(--bg-input,#17191f);color:var(--color-texto-input,#fff);border:1px solid var(--border-input,#555)"><option value="" disabled>Selecciona una tarifa</option><option v-for="p in tarifasFiltradas" :key="p.ID_Precio" :value="String(p.ID_Precio)">{{ p.Nombre_Paquete }} — ${{ p.Precio }}</option></select></div>
            <div class="membership-date-grid">
              <div class="date-field">
                <div class="date-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>

                <div class="date-content">
                  <label>{{ t('enrollmentDate') }}</label>
                  <input
                    type="date"
                    v-model="form.fechaInscripcion"
                  />
                </div>
              </div>

              <div class="date-field">
                <div class="date-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>

                <div class="date-content">
                  <label>{{ t('dueDate') }}</label>
                  <input
                    type="date"
                    v-model="form.fechaCorte"
                    readonly
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- GUARDAR -->
          <div class="registration-footer">
            <div class="required-hint">
              <span class="required">*</span>
              {{
                currentLang === 'en'
                  ? 'Required fields'
                  : 'Campos obligatorios'
              }}
            </div>

            <button
              type="button"
              class="btn-primary"
              @click="saveRegistration"
              :disabled="guardando"
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

              {{ t('finishButton') }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- =====================================================
         MODALES EXISTENTES
    ====================================================== -->
    <transition name="pop">
      <div
        v-if="activeModal === 'corte'"
        class="modal-wrapper"
        @click.self="activeModal = null"
      >
        <AddCorteComponent @close="activeModal = null" />
      </div>
    </transition>

    <transition name="pop">
      <div
        v-if="activeModal === 'help'"
        class="modal-wrapper"
        @click.self="activeModal = null"
      >
        <Help @close="activeModal = null" />
      </div>
    </transition>

    <!-- =====================================================
         SELECCIONAR CÁMARA O GALERÍA
    ====================================================== -->
    <transition name="photo-menu">
      <div
        v-if="showPhotoOptions"
        class="photo-options-overlay"
        @click.self="closePhotoOptions"
      >
        <div class="photo-options-modal">
          <div class="photo-options-handle"></div>

          <div class="photo-options-header">
            <div>
              <span class="photo-options-eyebrow">
                {{ currentLang === 'en' ? 'PROFILE PHOTO' : 'FOTO DE PERFIL' }}
              </span>

              <h3>
                {{
                  currentLang === 'en'
                    ? 'Add client photo'
                    : 'Agregar foto del cliente'
                }}
              </h3>

              <p>
                {{
                  currentLang === 'en'
                    ? 'Choose how you want to add the image.'
                    : 'Selecciona cómo quieres agregar la imagen.'
                }}
              </p>
            </div>

            <button
              type="button"
              class="modal-close-btn"
              @click="closePhotoOptions"
            >
              ×
            </button>
          </div>

          <div class="photo-options-grid">
            <!-- CÁMARA -->
            <button
              type="button"
              class="photo-option"
              @click="takePhoto"
            >
              <div class="photo-option-icon">
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
              </div>

              <div class="photo-option-text">
                <strong>
                  {{ currentLang === 'en' ? 'Take photo' : 'Tomar foto' }}
                </strong>

                <span>
                  {{
                    currentLang === 'en'
                      ? 'Open your device camera'
                      : 'Abrir la cámara del dispositivo'
                  }}
                </span>
              </div>

              <svg
                class="photo-option-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <!-- GALERÍA -->
            <button
              type="button"
              class="photo-option"
              @click="selectPhoto"
            >
              <div class="photo-option-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              <div class="photo-option-text">
                <strong>
                  {{
                    currentLang === 'en'
                      ? 'Choose image'
                      : 'Subir desde galería'
                  }}
                </strong>

                <span>
                  {{
                    currentLang === 'en'
                      ? 'Select an existing image'
                      : 'Seleccionar una imagen existente'
                  }}
                </span>
              </div>

              <svg
                class="photo-option-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            class="photo-cancel"
            @click="closePhotoOptions"
          >
            {{ currentLang === 'en' ? 'Cancel' : 'Cancelar' }}
          </button>
        </div>
      </div>
    </transition>

    <!-- =====================================================
         CÁMARA REAL
    ====================================================== -->
    <transition name="photo-menu">
      <div
        v-if="showCamera"
        class="camera-overlay"
        @click.self="closeCamera"
      >
        <div class="camera-modal">
          <div class="camera-header">
            <div>
              <span class="camera-eyebrow">
                {{ currentLang === 'en' ? 'CAMERA' : 'CÁMARA' }}
              </span>

              <h3>
                {{
                  currentLang === 'en'
                    ? 'Take client photo'
                    : 'Tomar foto del cliente'
                }}
              </h3>

              <p>
                {{
                  cameraFacingMode === 'user'
                    ? (
                      currentLang === 'en'
                        ? 'Front camera'
                        : 'Cámara frontal'
                    )
                    : (
                      currentLang === 'en'
                        ? 'Rear camera'
                        : 'Cámara trasera'
                    )
                }}
              </p>
            </div>

            <button
              type="button"
              class="modal-close-btn"
              @click="closeCamera"
            >
              ×
            </button>
          </div>

          <!-- VISOR -->
          <div class="camera-preview">
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              :class="{
                'camera-mirrored': cameraFacingMode === 'user'
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
                {{
                  cameraFacingMode === 'user'
                    ? (
                      currentLang === 'en'
                        ? 'Rear'
                        : 'Trasera'
                    )
                    : (
                      currentLang === 'en'
                        ? 'Front'
                        : 'Frontal'
                    )
                }}
              </span>
            </button>

            <div class="camera-guide">
              <div class="face-guide"></div>
            </div>

            <div
              v-if="switchingCamera"
              class="camera-switching"
            >
              <span class="camera-loader"></span>
            </div>
          </div>

          <canvas
            ref="canvasRef"
            class="hidden-canvas"
          ></canvas>

          <div class="camera-actions">
            <button
              type="button"
              class="camera-cancel-btn"
              @click="closeCamera"
            >
              {{ currentLang === 'en' ? 'Cancel' : 'Cancelar' }}
            </button>

            <button
              type="button"
              class="capture-btn"
              :disabled="switchingCamera"
              @click="capturePhoto"
            >
              <span class="capture-circle">
                <span></span>
              </span>

              {{
                currentLang === 'en'
                  ? 'Take photo'
                  : 'Tomar foto'
              }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted
} from 'vue';

import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import AddCorteComponent from '../Componets/Cut.vue';
import Help from '../Componets/Help.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';

/* =========================================================
   ESTADO GENERAL
========================================================= */

const activeModal = ref(null);
const guardando = ref(false);
const tarifas = ref([]);
const idPrecio = ref('');
const base = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const clientesApi = `${base}${base.endsWith('/api') ? '' : '/api'}/gym/clientes`;
const sedeActual = () => Number(sessionStorage.getItem('selected_sede_id') || 0);
const authHeaders = () => ({Accept:'application/json',Authorization:`Bearer ${sessionStorage.getItem('auth_token') || ''}`});
const cargarTarifas = async () => {idPrecio.value='';tarifas.value=[];const sede=sedeActual();if(!sede)return;try{const res=await fetch(`${clientesApi}/tarifas?sede_id=${sede}`,{headers:authHeaders()});const data=await res.json();if(!res.ok)throw new Error(data.message||`HTTP ${res.status}`);tarifas.value=data;if(tarifasFiltradas.value.length===1)idPrecio.value=String(tarifasFiltradas.value[0].ID_Precio);}catch(e){toastRef.value?.notify(e.message,'error');}};
const tarifasFiltradas=computed(()=>tarifas.value.filter(p=>form.tipoMembresia==='mes'?String(p.Periodo).toLowerCase()==='mensual':String(p.Periodo).toLowerCase()==='semanal'));
let versionCalculo=0;
const calcularVencimiento=async()=>{const version=++versionCalculo;form.fechaCorte='';if(!idPrecio.value||!sedeActual())return;try{const q=new URLSearchParams({sede_id:String(sedeActual()),id_precio:String(idPrecio.value)});if(form.fechaInscripcion)q.set('fechaInscripcion',form.fechaInscripcion);const res=await fetch(`${clientesApi}/vencimiento?${q}`,{headers:authHeaders()});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||`HTTP ${res.status}`);if(version===versionCalculo)form.fechaCorte=data.fecha_vencimiento;}catch(e){if(version===versionCalculo)toastRef.value?.notify(e.message,'error');}};
watch(()=>form.tipoMembresia,()=>{if(!tarifasFiltradas.value.some(p=>String(p.ID_Precio)===idPrecio.value))idPrecio.value='';});
watch([idPrecio,()=>form.fechaInscripcion],calcularVencimiento);
const qrModal=ref(null),qrUrl=ref(''),qrError=ref(''),qrCargando=ref(false);
let qrVersion=0;
const cerrarQR=()=>{qrVersion++;qrModal.value=null;qrUrl.value='';qrError.value='';qrCargando.value=false;};
const mostrarQR=async registro=>{const version=++qrVersion;qrModal.value=registro;qrUrl.value='';qrError.value='';qrCargando.value=true;try{const res=await fetch(`${clientesApi}/${registro.ID_Inscripto}/qr`,{headers:authHeaders()});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||`Error ${res.status}`);if(version===qrVersion){if(!data.qr_url)throw new Error('El servidor no devolvió la imagen QR.');qrUrl.value=data.qr_url;}}catch(e){if(version===qrVersion)qrError.value=e.message||'No se pudo consultar el QR.';}finally{if(version===qrVersion)qrCargando.value=false;}};
const descargarQR=async()=>{if(!qrModal.value)return;try{const res=await fetch(`${clientesApi}/${qrModal.value.ID_Inscripto}/qr/descargar`,{headers:authHeaders()});if(!res.ok){const data=await res.json().catch(()=>({}));throw new Error(data.message||`Error ${res.status}`);}const blob=await res.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`factorfit-qr-${qrModal.value.ID_Inscripto}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){toastRef.value?.notify(e.message||'No se pudo descargar el QR.','error');}};
const toastRef = ref(null);

const currentLang = ref(
  localStorage.getItem('GYM_ACCOUNT-idioma') || 'es'
);

const t = (key) => {
  const langTable =
    traducciones[currentLang.value] || traducciones.es;

  return langTable[key] || traducciones.es[key] || key;
};

const handleLangChange = (event) => {
  if (event.detail?.idioma) {
    currentLang.value = event.detail.idioma;
  }
};

/* =========================================================
   FORMULARIO
========================================================= */

const form = reactive({
  nombres: '',
  apellidoP: '',
  apellidoM: '',
  fechaNacimiento: '',
  celular: '',
  email: '',
  peso: '',
  altura: '',
  tipoMembresia: 'mes',
  fechaInscripcion: '',
  fechaCorte: ''
});

const clientName = computed(() =>
  [
    form.nombres,
    form.apellidoP,
    form.apellidoM
  ]
    .filter(Boolean)
    .join(' ')
);

/* =========================================================
   FOTO / GALERÍA
========================================================= */

const fileInput = ref(null);
const avatarPreview = ref(null);
const avatarFile = ref(null);

const showPhotoOptions = ref(false);

const openPhotoOptions = () => {
  showPhotoOptions.value = true;
};

const closePhotoOptions = () => {
  showPhotoOptions.value = false;
};

const selectPhoto = () => {
  showPhotoOptions.value = false;

  if (!fileInput.value) return;

  fileInput.value.value = '';
  fileInput.value.click();
};

const setAvatarFile = (file) => {
  if (!file) return;

  if (
    avatarPreview.value &&
    avatarPreview.value.startsWith('blob:')
  ) {
    URL.revokeObjectURL(avatarPreview.value);
  }

  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toastRef.value?.notify(
      currentLang.value === 'en'
        ? 'Select a valid image.'
        : 'Selecciona una imagen válida.',
      'warning'
    );

    event.target.value = '';
    return;
  }

  setAvatarFile(file);

  toastRef.value?.notify(
    currentLang.value === 'en'
      ? 'Photo added successfully.'
      : 'Foto agregada correctamente.',
    'success'
  );

  event.target.value = '';
};

/* =========================================================
   CÁMARA
========================================================= */

const showCamera = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);

const cameraStream = ref(null);

/*
  user        = frontal
  environment = trasera
*/
const cameraFacingMode = ref('user');

const switchingCamera = ref(false);

/*
  Detiene todos los tracks activos.
*/
const stopCamera = () => {
  if (cameraStream.value) {
    cameraStream.value
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    cameraStream.value = null;
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

/*
  Inicia la cámara correspondiente.
*/
const startCamera = async () => {
  stopCamera();

  const constraints = {
    audio: false,
    video: {
      facingMode: {
        ideal: cameraFacingMode.value
      },
      width: {
        ideal: 1280
      },
      height: {
        ideal: 720
      }
    }
  };

  const stream =
    await navigator.mediaDevices.getUserMedia(
      constraints
    );

  cameraStream.value = stream;

  await nextTick();

  if (!videoRef.value) {
    throw new Error(
      'No se encontró el elemento de video.'
    );
  }

  videoRef.value.srcObject = stream;

  await videoRef.value.play();
};

/*
  Abre el modal y solicita permiso de cámara.
*/
const takePhoto = async () => {
  showPhotoOptions.value = false;

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    toastRef.value?.notify(
      currentLang.value === 'en'
        ? 'Camera is not supported by this browser.'
        : 'Este navegador no permite utilizar la cámara.',
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
    console.error(
      'No se pudo abrir la cámara:',
      error
    );

    stopCamera();
    showCamera.value = false;

    let message =
      currentLang.value === 'en'
        ? 'Could not access the camera.'
        : 'No se pudo acceder a la cámara.';

    if (error?.name === 'NotAllowedError') {
      message =
        currentLang.value === 'en'
          ? 'Camera permission was denied. Enable camera permission in your browser.'
          : 'El permiso de cámara fue rechazado. Activa el permiso de cámara en tu navegador.';
    }

    if (error?.name === 'NotFoundError') {
      message =
        currentLang.value === 'en'
          ? 'No camera was found on this device.'
          : 'No se encontró una cámara en este dispositivo.';
    }

    if (error?.name === 'NotReadableError') {
      message =
        currentLang.value === 'en'
          ? 'The camera is being used by another application.'
          : 'La cámara está siendo utilizada por otra aplicación.';
    }

    toastRef.value?.notify(
      message,
      'warning'
    );
  }
};

/*
  Cambia entre frontal y trasera.
*/
const switchCamera = async () => {
  if (switchingCamera.value) return;

  switchingCamera.value = true;

  const previousMode =
    cameraFacingMode.value;

  const nextMode =
    previousMode === 'user'
      ? 'environment'
      : 'user';

  cameraFacingMode.value = nextMode;

  try {
    await startCamera();
  } catch (error) {
    console.error(
      'No se pudo cambiar de cámara:',
      error
    );

    /*
      Regresamos a la cámara anterior.
    */
    cameraFacingMode.value =
      previousMode;

    try {
      await startCamera();
    } catch (restoreError) {
      console.error(
        'No se pudo restaurar la cámara:',
        restoreError
      );

      closeCamera();
    }

    toastRef.value?.notify(
      currentLang.value === 'en'
        ? 'The selected camera is not available.'
        : 'La cámara seleccionada no está disponible.',
      'warning'
    );
  } finally {
    switchingCamera.value = false;
  }
};

/*
  Cierra modal y apaga cámara.
*/
const closeCamera = () => {
  stopCamera();
  showCamera.value = false;
  switchingCamera.value = false;
};

/*
  Captura el frame actual.
*/
const capturePhoto = () => {
  if (switchingCamera.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;

  if (!video || !canvas) return;

  if (
    !video.videoWidth ||
    !video.videoHeight
  ) {
    toastRef.value?.notify(
      currentLang.value === 'en'
        ? 'The camera is not ready yet.'
        : 'La cámara todavía no está lista.',
      'warning'
    );

    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context =
    canvas.getContext('2d');

  if (!context) {
    toastRef.value?.notify(
      currentLang.value === 'en'
        ? 'Could not process the photo.'
        : 'No se pudo procesar la fotografía.',
      'error'
    );

    return;
  }

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
    Frontal:
    guardamos la imagen como se ve
    en la vista previa (espejo).
  */
  if (cameraFacingMode.value === 'user') {
    context.save();

    context.translate(
      canvas.width,
      0
    );

    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.restore();
  } else {
    /*
      Trasera:
      orientación normal.
    */
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        toastRef.value?.notify(
          currentLang.value === 'en'
            ? 'Could not capture the photo.'
            : 'No se pudo capturar la fotografía.',
          'error'
        );

        return;
      }

      const file = new File(
        [blob],
        `cliente-${Date.now()}.jpg`,
        {
          type: 'image/jpeg'
        }
      );

      setAvatarFile(file);

      closeCamera();

      toastRef.value?.notify(
        currentLang.value === 'en'
          ? 'Photo captured successfully.'
          : 'Foto tomada correctamente.',
        'success'
      );
    },
    'image/jpeg',
    0.92
  );
};

/* =========================================================
   REGISTRO
========================================================= */

const saveRegistration = async () => {
  if(guardando.value)return;
  if(!form.nombres.trim() || !form.apellidoP.trim() || !idPrecio.value){toastRef.value?.notify('Nombre, apellido paterno y tarifa son obligatorios.','warning');return;}
  if(!sedeActual()){toastRef.value?.notify('Selecciona una sucursal.','warning');return;}
  if(!tarifasFiltradas.value.some(p=>String(p.ID_Precio)===idPrecio.value)){toastRef.value?.notify('La tarifa no coincide con el tipo de membresía.','warning');return;}
  guardando.value=true;
  try {
    const data=new FormData();
    const values={sede_id:sedeActual(),id_precio:idPrecio.value,nombres:form.nombres.trim(),apellidoP:form.apellidoP.trim(),apellidoM:form.apellidoM.trim(),fechaNacimiento:form.fechaNacimiento,celular:form.celular.trim(),email:form.email.trim(),peso:form.peso,altura:form.altura,fechaInscripcion:form.fechaInscripcion};
    Object.entries(values).forEach(([key,value])=>{if(value!==''&&value!==null&&value!==undefined)data.append(key,String(value));});
    if(avatarFile.value)data.append('foto',avatarFile.value);
    const res=await fetch(clientesApi,{method:'POST',headers:authHeaders(),body:data});
    const result=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(result.message || Object.values(result.errors||{}).flat().join(' ') || `HTTP ${res.status}`);
    toastRef.value?.notify(result.message||'Cliente registrado correctamente.','success');
    if(result.ID_Inscripto)await mostrarQR(result);
    Object.assign(form,{nombres:'',apellidoP:'',apellidoM:'',fechaNacimiento:'',celular:'',email:'',peso:'',altura:'',tipoMembresia:'mes',fechaInscripcion:'',fechaCorte:''});
    if(avatarPreview.value?.startsWith('blob:'))URL.revokeObjectURL(avatarPreview.value);
    avatarPreview.value=null;avatarFile.value=null;idPrecio.value='';
    window.dispatchEvent(new CustomEvent('factorfit:clientes-changed',{detail:{sede_id:sedeActual()}}));
  }catch(error){toastRef.value?.notify(error.message||'No se pudo registrar el cliente.','error');}
  finally{guardando.value=false;}
};

/* =========================================================
   CICLO DE VIDA
========================================================= */

onMounted(() => {
  window.addEventListener(
    'idioma-changed',
    handleLangChange
  );
  window.addEventListener('factorfit:branch-changed',cargarTarifas);
  cargarTarifas();
});

onUnmounted(() => {
  window.removeEventListener(
    'idioma-changed',
    handleLangChange
  );

  stopCamera();cerrarQR();
  window.removeEventListener('factorfit:branch-changed',cargarTarifas);

  if (
    avatarPreview.value &&
    avatarPreview.value.startsWith('blob:')
  ) {
    URL.revokeObjectURL(
      avatarPreview.value
    );
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&display=swap');

* {
  box-sizing: border-box;
}

.hidden-input,
.hidden-canvas {
  display: none;
}

.main-content {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 36px clamp(16px, 3vw, 40px) 56px;
  color: var(--color-texto-general, #e5e5e5);
}

.highlight {
  color: var(--color-highlight, #3b82f6);
}

.profile-card {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  align-items: start;
}

/* =========================================================
   PERFIL
========================================================= */

.profile-section {
  position: relative;
  align-self: start;
  overflow: hidden;
  padding: 34px 24px 26px;
  text-align: center;
  border: 1px solid var(--border-cards, rgba(255, 255, 255, .1));
  border-radius: var(--app-border-radius, 24px);
  background: var(--bg-cards, rgba(18, 18, 18, .75));
}

.profile-section::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 210px;
  background:
    radial-gradient(
      ellipse 70% 100% at 50% 0%,
      color-mix(
        in srgb,
        var(--color-botones, #1c4fd6) 32%,
        transparent
      ),
      transparent 75%
    );
  pointer-events: none;
}

.profile-content {
  position: relative;
  width: 100%;
}

.profile-label {
  display: inline-block;
  margin-bottom: 12px;
  padding: 4px 11px;
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-highlight, #3b82f6) 35%,
      transparent
    );
  border-radius: 999px;
  background:
    color-mix(
      in srgb,
      var(--color-highlight, #3b82f6) 10%,
      transparent
    );
  color: var(--color-highlight, #60a5fa);
  font: 600 .66rem 'Inter', sans-serif;
  letter-spacing: .3px;
}

.main-title {
  margin: 0 0 26px;
  color: var(--color-titulos, #fff);
  font-family: 'Anton', sans-serif;
  font-size: 1.85rem;
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: .4px;
  text-transform: uppercase;
}

/* =========================================================
   AVATAR
========================================================= */

.avatar-wrapper {
  position: relative;
  width: 140px;
  margin: 0 auto 14px;
}

.avatar-ring {
  padding: 4px;
  border-radius: 50%;
  background:
    conic-gradient(
      from 210deg,
      var(--color-botones, #1c4fd6),
      var(--color-highlight, #60a5fa),
      var(--color-botones, #1c4fd6)
    );
  box-shadow: 0 12px 30px rgba(0, 0, 0, .4);
}

.avatar-circle {
  position: relative;
  width: 132px;
  height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid var(--bg-cards, #121212);
  border-radius: 50%;
  outline: none;
  background: #17191f;
}

.default-avatar {
  width: 52px;
  height: 52px;
  color: #fff;
  opacity: .55;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .58);
  color: #fff;
  opacity: 0;
  transition: opacity .2s ease;
}

.avatar-overlay svg {
  width: 23px;
  height: 23px;
}

.avatar-overlay span {
  font: 600 .6rem 'Inter', sans-serif;
}

.avatar-circle:hover .avatar-overlay,
.avatar-circle:focus-visible .avatar-overlay {
  opacity: 1;
}

.avatar-circle:focus-visible {
  box-shadow: 0 0 0 3px var(--color-highlight, #3b82f6);
}

.avatar-action {
  position: absolute;
  z-index: 3;
  right: 2px;
  bottom: 4px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  border: 3px solid var(--bg-cards, #121212);
  border-radius: 50%;
  background: var(--color-highlight, #3b82f6);
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, .35);
  transition:
    transform .2s ease,
    filter .2s ease;
}

.avatar-action:hover {
  transform: scale(1.08);
  filter: brightness(1.08);
}

.avatar-action svg {
  width: 17px;
  height: 17px;
}

.profile-hint {
  max-width: 230px;
  margin: 0 auto;
  color: var(--color-texto-general, #94a3b8);
  font: 400 .76rem/1.5 'Inter', sans-serif;
  opacity: .7;
}

/* =========================================================
   RESUMEN
========================================================= */

.profile-summary {
  display: grid;
  gap: 2px;
  margin: 26px 0 0;
  padding: 6px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: var(--app-border-radius, 14px);
  background: rgba(255, 255, 255, .025);
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.summary-item + .summary-item {
  border-top: 1px solid rgba(255, 255, 255, .05);
}

.summary-item dt {
  color: var(--color-texto-general, #94a3b8);
  font: 500 .7rem 'Inter', sans-serif;
  opacity: .7;
}

.summary-item dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--color-titulos, #fff);
  font: 600 .78rem 'Inter', sans-serif;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-item dd.empty {
  opacity: .4;
}

.plan-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background:
    color-mix(
      in srgb,
      var(--color-highlight, #3b82f6) 18%,
      transparent
    );
  color: var(--color-highlight, #60a5fa);
}

/* =========================================================
   FORMULARIOS
========================================================= */

.forms-wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
}

.login-card {
  width: 100%;
  padding: 26px 28px 28px;
  border: 1px solid var(--border-cards, rgba(255, 255, 255, .12));
  border-radius: var(--app-border-radius, 24px);
  background: var(--bg-cards, rgba(18, 18, 18, .75));
  backdrop-filter: blur(12px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, .07);
}

.card-header-text {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: var(--color-titulos, #fff);
  font-family: 'Anton', sans-serif;
  font-size: 1.2rem;
  font-weight: 400;
  letter-spacing: .5px;
  text-transform: uppercase;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  border-radius: 4px;
  background: var(--color-highlight, #3b82f6);
}

.section-description {
  margin: 3px 0 0;
  color: var(--color-texto-general, #94a3b8);
  font: 400 .74rem/1.4 'Inter', sans-serif;
  opacity: .6;
}

.form-grid {
  display: grid;
  gap: 18px;
}

.form-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

label {
  color: var(--color-texto-general, #f5f5f4);
  font: 600 .78rem 'Oswald', sans-serif;
  letter-spacing: .4px;
}

.required {
  color: var(--color-highlight, #3b82f6);
}

input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1.5px solid var(--border-input, rgba(255, 255, 255, .12));
  border-radius: var(--app-border-radius, 12px);
  outline: none;
  background: var(--bg-input, rgba(255, 255, 255, .03));
  color: var(--color-texto-input, var(--color-texto-general, #fff));
  color-scheme: var(--color-scheme, dark);
  font: 400 .88rem 'Inter', sans-serif;
}

input:focus {
  border-color: var(--color-highlight, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .18);
}

.input-with-icon {
  position: relative;
}

.input-with-icon > svg {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 14px;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  color: var(--color-texto-general, #94a3b8);
  opacity: .55;
}

.input-with-icon input {
  padding-left: 40px;
}

/* =========================================================
   MEDIDAS
========================================================= */

.physical-grid,
.membership-date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.measurement-field,
.date-field {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: var(--app-border-radius, 14px);
  background: rgba(255, 255, 255, .02);
}

.measurement-icon,
.date-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background:
    color-mix(
      in srgb,
      var(--color-highlight, #3b82f6) 14%,
      transparent
    );
  color: var(--color-highlight, #60a5fa);
}

.measurement-icon svg,
.date-icon svg {
  width: 20px;
  height: 20px;
}

.measurement-content,
.date-content {
  flex: 1;
  min-width: 0;
}

.measurement-content label,
.date-content label {
  display: block;
  margin-bottom: 7px;
}

.measurement-input {
  position: relative;
}

.measurement-input input {
  padding-right: 46px;
}

.measurement-input span {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: var(--color-texto-general, #94a3b8);
  font: 600 .74rem 'Inter', sans-serif;
}

/* =========================================================
   MEMBRESÍA
========================================================= */

.membership-header {
  flex-wrap: wrap;
}

.membership-actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-group-small {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 12px;
  background: rgba(255, 255, 255, .05);
}

.toggle-group-small::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: 9px;
  background: var(--color-highlight, #3b82f6);
  transition: transform .25s ease;
}

.toggle-group-small[data-active='semana']::before {
  transform: translateX(100%);
}

.btn-toggle-small {
  position: relative;
  z-index: 1;
  min-width: 84px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #a1a1aa;
  cursor: pointer;
}

.btn-toggle-small.active {
  color: #fff;
}

.actions-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 12px;
  background: rgba(255, 255, 255, .05);
  color: var(--color-texto-general, #cbd5e1);
  cursor: pointer;
}

.action-btn:hover {
  background: var(--color-highlight, #3b82f6);
  color: #fff;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* =========================================================
   GUARDAR
========================================================= */

.registration-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.required-hint {
  color: var(--color-texto-general, #94a3b8);
  font: 500 .74rem 'Inter', sans-serif;
}

.btn-primary {
  min-width: 240px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 14px 30px;
  border: none;
  border-radius: 12px;
  background: var(--color-botones, #1c4fd6);
  color: var(--color-texto-botones, #fff);
  cursor: pointer;
  font: 700 .95rem 'Oswald', sans-serif;
}

.btn-primary svg {
  width: 17px;
  height: 17px;
}

/* =========================================================
   MODALES
========================================================= */

.modal-wrapper,
.photo-options-overlay,
.camera-overlay {
  position: fixed;
  z-index: 3000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, .78);
}

.camera-overlay {
  z-index: 4000;
  background: rgba(0, 0, 0, .9);
}

.photo-options-modal,
.camera-modal {
  width: 100%;
  max-width: 440px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 20px;
  background: var(--bg-cards, #151515);
  box-shadow: 0 30px 80px rgba(0, 0, 0, .55);
}

.camera-modal {
  max-width: 620px;
}

.photo-options-handle {
  display: none;
}

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
  color: var(--color-highlight, #3b82f6);
  font: 700 .6rem 'Inter', sans-serif;
  letter-spacing: 1px;
}

.photo-options-header h3,
.camera-header h3 {
  margin: 0;
  color: var(--color-titulos, #fff);
  font: 400 1.25rem 'Anton', sans-serif;
  text-transform: uppercase;
}

.photo-options-header p,
.camera-header p {
  margin: 5px 0 0;
  color: var(--color-texto-general, #94a3b8);
  font: 400 .74rem/1.5 'Inter', sans-serif;
  opacity: .7;
}

.modal-close-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 9px;
  background: rgba(255, 255, 255, .04);
  color: #fff;
  cursor: pointer;
  font-size: 1.3rem;
}

/* =========================================================
   OPCIONES FOTO
========================================================= */

.photo-options-grid {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.photo-option {
  width: 100%;
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px 13px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 13px;
  background: rgba(255, 255, 255, .025);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.photo-option:hover {
  border-color: var(--color-highlight, #3b82f6);
}

.photo-option-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background:
    color-mix(
      in srgb,
      var(--color-highlight, #3b82f6) 13%,
      transparent
    );
  color: var(--color-highlight, #60a5fa);
}

.photo-option-icon svg {
  width: 20px;
  height: 20px;
}

.photo-option-text {
  flex: 1;
}

.photo-option-text strong {
  display: block;
  color: var(--color-titulos, #fff);
  font: 600 .8rem 'Inter', sans-serif;
}

.photo-option-text span {
  display: block;
  margin-top: 3px;
  color: var(--color-texto-general, #94a3b8);
  font: 400 .68rem 'Inter', sans-serif;
}

.photo-option-arrow {
  width: 16px;
  color: var(--color-texto-general, #94a3b8);
}

.photo-cancel {
  width: 100%;
  height: 40px;
  margin-top: 13px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 10px;
  background: transparent;
  color: var(--color-texto-general, #94a3b8);
  cursor: pointer;
}

/* =========================================================
   CÁMARA
========================================================= */

.camera-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 18px;
  background: #000;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.camera-preview video.camera-mirrored {
  transform: scaleX(-1);
}

/* GUÍA DEL ROSTRO */

.camera-guide {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.face-guide {
  width: 47%;
  height: 70%;
  border: 2px dashed rgba(255, 255, 255, .45);
  border-radius: 50%;
}

/* =========================================================
   CAMBIAR CÁMARA
========================================================= */

.switch-camera-btn {
  position: absolute;
  z-index: 10;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(255, 255, 255, .25);
  border-radius: 999px;
  background: rgba(0, 0, 0, .62);
  color: #fff;
  font: 600 .7rem 'Inter', sans-serif;
  cursor: pointer;
  box-shadow: 0 5px 16px rgba(0, 0, 0, .3);
}

.switch-camera-btn:hover {
  background: rgba(0, 0, 0, .8);
}

.switch-camera-btn:disabled {
  cursor: wait;
  opacity: .65;
}

.switch-camera-btn svg {
  width: 16px;
  height: 16px;
}

.switch-camera-btn svg.rotating {
  animation: cameraRotate .7s linear infinite;
}

@keyframes cameraRotate {
  to {
    transform: rotate(360deg);
  }
}

/* LOADER AL CAMBIAR */

.camera-switching {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, .28);
  pointer-events: none;
}

.camera-loader {
  width: 38px;
  height: 38px;
  border: 3px solid rgba(255, 255, 255, .25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cameraRotate .7s linear infinite;
}

/* =========================================================
   CAPTURAR
========================================================= */

.camera-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.camera-cancel-btn {
  min-width: 110px;
  padding: 11px 18px;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 12px;
  background: rgba(255, 255, 255, .04);
  color: var(--color-texto-general, #cbd5e1);
  cursor: pointer;
}

.capture-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px 8px 8px;
  border: none;
  border-radius: 999px;
  background: var(--color-botones, #1c4fd6);
  color: var(--color-texto-botones, #fff);
  font: 700 .78rem 'Inter', sans-serif;
  cursor: pointer;
}

.capture-btn:disabled {
  cursor: wait;
  opacity: .6;
}

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
  transition: transform .15s ease;
}

.capture-btn:hover:not(:disabled) .capture-circle span {
  transform: scale(.85);
}

/* =========================================================
   ANIMACIONES
========================================================= */

.photo-menu-enter-active,
.photo-menu-leave-active {
  transition: opacity .2s ease;
}

.photo-menu-enter-active .photo-options-modal,
.photo-menu-leave-active .photo-options-modal,
.photo-menu-enter-active .camera-modal,
.photo-menu-leave-active .camera-modal {
  transition:
    opacity .2s ease,
    transform .22s ease;
}

.photo-menu-enter-from,
.photo-menu-leave-to {
  opacity: 0;
}

.photo-menu-enter-from .photo-options-modal,
.photo-menu-leave-to .photo-options-modal,
.photo-menu-enter-from .camera-modal,
.photo-menu-leave-to .camera-modal {
  opacity: 0;
  transform: translateY(10px) scale(.97);
}

.pop-enter-active,
.pop-leave-active {
  transition: all .25s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(.95);
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1050px) {
  .profile-card {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .form-grid-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .profile-card {
    grid-template-columns: 1fr;
  }

  .profile-content {
    max-width: 420px;
    margin: 0 auto;
  }
}

@media (max-width: 650px) {
  .main-content {
    padding: 14px 12px 30px;
  }

  .login-card {
    padding: 20px 17px 22px;
  }

  .form-grid-3,
  .physical-grid,
  .membership-date-grid {
    grid-template-columns: 1fr;
  }

  .membership-actions-row {
    width: 100%;
    justify-content: space-between;
  }

  .registration-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    min-width: 0;
  }

  /* MODAL OPCIONES */
  .photo-options-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .photo-options-modal {
    max-width: none;
    padding: 12px 17px 20px;
    border-radius: 22px 22px 0 0;
  }

  .photo-options-handle {
    width: 38px;
    height: 4px;
    display: block;
    margin: 0 auto 17px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .16);
  }

  /* CÁMARA PANTALLA INFERIOR */
  .camera-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .camera-modal {
    max-width: none;
    padding:
      17px
      14px
      calc(18px + env(safe-area-inset-bottom));
    border-radius: 24px 24px 0 0;
  }

  .camera-preview {
    aspect-ratio: 3 / 4;
  }

  .switch-camera-btn {
    top: 11px;
    right: 11px;
    min-height: 38px;
    padding: 0 12px;
  }

  .camera-actions {
    flex-direction: column-reverse;
  }

  .camera-cancel-btn,
  .capture-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 420px) {
  .profile-section {
    padding: 28px 16px 22px;
  }

  .main-title {
    font-size: 1.6rem;
  }

  .measurement-field,
  .date-field {
    padding: 13px;
  }

  .camera-header h3 {
    font-size: 1.05rem;
  }

  .switch-camera-btn span {
    display: none;
  }

  .switch-camera-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
  }

  .switch-camera-btn svg {
    width: 19px;
    height: 19px;
  }
}
</style>
<style scoped>
.ff-qr-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(5px)}.ff-qr-card{position:relative;width:min(420px,100%);padding:30px 22px;border-radius:22px;background:#191b25;border:1px solid #454654;text-align:center;color:#f8fafc;box-shadow:0 20px 70px #0009}.ff-qr-card h2{font-size:24px;font-weight:750;margin:0 0 8px}.ff-qr-card p{margin:8px 0;color:#cbd5e1}.ff-qr-card .ff-qr-status{font-size:13px;color:#fbbf24}.ff-qr-image{width:min(290px,100%);aspect-ratio:1;object-fit:contain;background:white;padding:12px;border-radius:14px;margin:14px auto}.ff-qr-close{position:absolute;top:8px;right:14px;border:0;background:none;color:white;font-size:28px;cursor:pointer}.ff-qr-error{color:#fca5a5!important}.ff-qr-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:16px}.ff-qr-actions button{border:1px solid #666;border-radius:10px;padding:10px 16px;background:#334155;color:white;cursor:pointer}.ff-qr-actions button:first-child{background:#2563eb;border-color:#2563eb}.ff-qr-actions button:disabled{opacity:.5;cursor:not-allowed}
</style>
