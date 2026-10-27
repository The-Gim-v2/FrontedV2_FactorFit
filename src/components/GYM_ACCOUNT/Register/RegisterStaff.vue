<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="main-content">
      <div class="profile-card">
        <!-- =====================================================
             PERFIL / FOTO
        ====================================================== -->
        <aside class="profile-section" id="tutorial-step-0">
          <div class="profile-content">
            <h1 class="main-title">
              <template v-if="currentLang === 'es'">
                Registra a tu <br>
                <span class="highlight">Personal</span>
              </template>
              <template v-else-if="currentLang === 'en'">
                Register your <br>
                <span class="highlight">Staff</span>
              </template>
              <template v-else-if="currentLang === 'fr'">
                Enregistrez votre <br>
                <span class="highlight">Personnel</span>
              </template>
              <template v-else-if="currentLang === 'pt'">
                Registre sua <br>
                <span class="highlight">Equipe</span>
              </template>
            </h1>
            <!-- FOTO DE PERFIL -->
            <div class="avatar-wrapper">
              <div class="avatar-ring">
                <div
                  class="avatar-circle"
                  @click="openPhotoOptions"
                  :title="t('titleAvatarClick')"
                >
                  <img
                    v-if="avatarPreview"
                    :src="avatarPreview"
                    :alt="t('altEmployeePreview')"
                    class="avatar-img"
                  />
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                class="avatar-action btn-camera"
                @click="openPhotoOptions"
                :title="t('titleUploadPhoto')"
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
              <!--
                Este input se usa ÚNICAMENTE cuando el usuario
                selecciona "Subir una foto".
              -->
              <input
                type="file"
                ref="fileInput"
                accept="image/jpeg,image/png,image/webp"
                style="display: none"
                @change="handleFileChange"
              />
            </div>
            <p class="profile-hint">
              {{ t('hintEmployeePhoto') }}
            </p>
            <!-- RESUMEN -->
            <dl class="profile-summary">
              <div class="summary-item">
                <dt>{{ t('names') }}</dt>
                <dd
                  :class="{
                    empty: !form.nombres && !form.apellidoP
                  }"
                >
                  {{
                    [
                      form.nombres,
                      form.apellidoP,
                      form.apellidoM
                    ]
                      .filter(Boolean)
                      .join(' ') || '—'
                  }}
                </dd>
              </div>
              <div class="summary-item">
                <dt>{{ t('systemRole') }}</dt>
                <dd>
                  <span
                    v-if="form.rol"
                    class="plan-chip"
                  >
                    {{ roleLabel }}
                  </span>
                  <span
                    v-else
                    class="empty"
                  >
                    —
                  </span>
                </dd>
              </div>
              <div class="summary-item">
                <dt>{{ t('allowedLocations') }}</dt>
                <dd :class="{ empty: sedesSummary.empty }">
                  {{ sedesSummary.text }}
                </dd>
              </div>
              <div class="summary-item">
                <dt>{{ t('workSchedule') }}</dt>
                <dd :class="{ empty: scheduleSummary.empty }">
                  {{ scheduleSummary.text }}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
        <!-- =====================================================
             FORMULARIOS
        ====================================================== -->
        <div class="forms-wrapper">
          <!-- CREDENCIALES Y ROL -->
          <section
            class="login-card"
            id="tutorial-step-1"
          >
            <header class="card-header">
              <h3 class="section-title">
                {{ t('credentialsAndRole') }}
              </h3>
            </header>
            <div class="form-grid">
              <!-- ROL -->
              <div class="input-group">
                <label>
                  {{ t('systemRole') }}
                  <span class="required">*</span>
                </label>
                <select
                  v-model="form.rol"
                  class="custom-select"
                >
                  <option
                    value=""
                    disabled
                  >
                    {{ t('selectRole') }}
                  </option>
                  <option value="GYM_ADMIN">
                    {{ L('Propietario', 'Owner', 'Propriétaire', 'Proprietário') }}
                  </option>
                  <option value="GYM_MANAGER">
                    Gerente
                  </option>
                  <option value="GYM_COACH">
                    {{ t('roleTrainer') }}
                  </option>
                  <option value="GYM_RECEPCIONIST">
                    {{ t('roleReception') }}
                  </option>
                </select>
              </div>
              <!-- CORREO -->
              <div class="input-group">
                <label>
                  {{ t('email') }}
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
                    <polyline
                      points="22,6 12,13 2,6"
                    />
                  </svg>
                  <input
                    type="email"
                    v-model="form.email"
                    placeholder="correo@ejemplo.com"
                  >
                </div>
              </div>
              <!-- CONTRASEÑAS -->
              <template v-if="needsPassword">
                <div class="input-group">
                  <label>
                    {{ t('password') }}
                    <span class="required">*</span>
                  </label>
                  <input
                    type="password"
                    v-model="form.password"
                    placeholder="••••••••"
                  >
                </div>
                <div class="input-group">
                  <label>
                    {{ t('confirmPassword') }}
                    <span class="required">*</span>
                  </label>
                  <input
                    type="password"
                    v-model="form.confirmPassword"
                    placeholder="••••••••"
                  >
                </div>
              </template>
              <!-- ESPECIALIDAD -->
              <div
                class="input-group"
                v-if="isTrainer"
              >
                <label>
                  {{ t('specialty') }}
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  v-model="form.especialidad"
                  :placeholder="t('placeholderSpecialty')"
                >
              </div>
              <!-- SEDES -->
              <div
                class="input-group"
                :class="{ 'span-full': !isTrainer }"
              >
                <label>
                  {{ t('allowedLocations') }}
                  <span
                    v-if="form.rol && !isOwner"
                    class="required"
                  >*</span>
                </label>
                <!-- PROPIETARIO: todas las sucursales, sin selector -->
                <div
                  v-if="isOwner"
                  class="sedes-static"
                >
                  <div class="sedes-static-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div class="sedes-static-text">
                    <strong>
                      {{ L('Todas las sucursales', 'All locations', 'Tous les sites', 'Todas as unidades') }}
                    </strong>
                    <span>
                      {{ listaSedes.length }}
                      {{ L('sedes, incluidas las futuras', 'locations, including future ones', 'sites, y compris les futurs', 'unidades, incluindo as futuras') }}
                    </span>
                  </div>
                </div>
                <!-- OTROS ROLES -->
                <div
                  v-else
                  class="custom-multiselect"
                  ref="dropdownRef"
                >
                  <div
                    class="select-box-trigger"
                    :class="{
                      open: isDropdownOpen,
                      disabled: !form.rol
                    }"
                    @click="toggleDropdown"
                  >
                    <span
                      class="trigger-text"
                      :class="{
                        'placeholder-text':
                          form.sedes.length === 0
                      }"
                    >
                      {{ getSedesDisplayText() }}
                    </span>
                    <svg
                      class="dropdown-arrow"
                      :class="{
                        rotate: isDropdownOpen
                      }"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline
                        points="6 9 12 15 18 9"
                      />
                    </svg>
                  </div>
                  <div
                    class="dropdown-options-list"
                    v-if="isDropdownOpen"
                  >
                    <!-- SELECCIONAR TODAS (gerente / entrenador) -->
                    <div
                      v-if="multiSedes"
                      class="dropdown-option-item select-all"
                      :class="{ selected: allSedesSelected }"
                      @click="toggleAllSedes"
                    >
                      <div class="option-checkbox">
                        <svg
                          v-if="allSedesSelected"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>
                        {{ L('Todas las sedes', 'All locations', 'Tous les sites', 'Todas as unidades') }}
                      </span>
                    </div>
                    <div v-if="sedesCargando && !listaSedes.length" class="dropdown-option-item">Cargando sucursales...</div>
                    <div v-else-if="!listaSedes.length" class="dropdown-option-item">No hay sucursales disponibles</div>
                    <div
                      v-for="sede in listaSedes"
                      :key="sede.id"
                      class="dropdown-option-item"
                      :class="{
                        selected: form.sedes.includes(sede.id)
                      }"
                      @click="toggleSede(sede.id)"
                    >
                      <div
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
                      </div>
                      <span>
                        {{ sede.nombre }}
                      </span>
                    </div>
                  </div>
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
          <!-- =================================================
               DATOS PERSONALES
          ================================================== -->
          <section
            class="login-card"
            id="tutorial-step-2"
          >
            <header class="card-header">
              <h3 class="section-title">
                {{ L('Datos personales', 'Personal data', 'Données personnelles', 'Dados pessoais') }}
              </h3>
            </header>
            <div class="form-grid">
              <div class="input-group span-full">
                <label>
                  {{ t('curp') }}
                </label>
                <input
                  type="text"
                  v-model="form.curp"
                  @input="form.curp = $event.target.value.toUpperCase()"
                  placeholder="Ej. ABCD010101HDF000"
                  maxlength="18"
                  autocomplete="off"
                  autocapitalize="characters"
                  style="text-transform: uppercase;"
                  :aria-invalid="!!form.curp && !curpValidation.valid"
                  aria-describedby="curp-validation-message"
                >
                <small v-if="form.curp" id="curp-validation-message" :style="{color: curpValidation.valid ? '#16a34a' : '#ef4444', display: 'block', marginTop: '6px'}" aria-live="polite">{{ curpValidation.valid ? '✓ CURP válida en formato y dígito verificador' : '✕ ' + curpValidation.message }}</small>
              </div>
              <div class="input-group">
                <label>
                  {{ t('names') }}
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  v-model="form.nombres"
                  :placeholder="t('placeholderName')"
                >
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
                >
              </div>
              <div class="input-group">
                <label>
                  {{ t('lastNameM') }}
                </label>
                <input
                  type="text"
                  v-model="form.apellidoM"
                  :placeholder="t('placeholderLastNameM')"
                >
              </div>
              <div class="input-group">
                <label>
                  {{ t('birthDate') }}
                </label>
                <input
                  type="date"
                  v-model="form.fechaNacimiento"
                >
              </div>
              <div class="input-group">
                <label>
                  {{ t('cellphone') }} <span class="required">*</span>
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
                  <input type="tel" :value="form.celular" @input="onCelularInput" @paste="onCelularPaste" placeholder="481 111 1231" inputmode="numeric" autocomplete="tel-national" maxlength="12" aria-describedby="staff-cell-hint">
                </div>
                <small id="staff-cell-hint" class="field-hint">10 dígitos, sin +52. Ejemplo: 481 111 1231.</small>
              </div>
            </div>
          </section>
          <!-- =================================================
               REDES SOCIALES (solo entrenador)
          ================================================== -->
          <section
            v-if="isTrainer"
            class="login-card"
          >
            <header class="card-header card-header-row">
              <h3 class="section-title">
                {{ L('Redes sociales', 'Social networks', 'Réseaux sociaux', 'Redes sociais') }}
              </h3>
              <span class="card-badge">
                {{ L('Opcional', 'Optional', 'Facultatif', 'Opcional') }}
              </span>
            </header>
            <div class="form-grid">
              <div class="input-group">
                <label>
                  {{ t('facebook') }}
                </label>
                <input
                  type="text"
                  v-model="form.facebook"
                  placeholder="usuario_fb"
                >
              </div>
              <div class="input-group">
                <label>
                  {{ t('instagram') }}
                </label>
                <input
                  type="text"
                  v-model="form.instagram"
                  placeholder="@usuario_ig"
                >
              </div>
              <div class="input-group">
                <label>
                  {{ t('tiktok') }}
                </label>
                <input
                  type="text"
                  v-model="form.tiktok"
                  placeholder="@usuario_tt"
                >
              </div>
              <div class="input-group">
                <label>
                  {{ t('otherApps') }}
                </label>
                <input
                  type="text"
                  v-model="form.otrasApps"
                  :placeholder="t('placeholderOtherApps')"
                >
              </div>
            </div>
          </section>
          <!-- =================================================
               HORARIO DE TRABAJO
               - Recepción: obligatorio
               - Entrenador: opcional
               - Propietario / Gerente: no aplica
          ================================================== -->
          <section
            class="login-card"
            id="tutorial-step-3"
          >
            <header class="card-header card-header-row">
              <h3 class="section-title">
                {{ t('workSchedule') }}
              </h3>
              <span
                v-if="scheduleMode === 'required'"
                class="card-badge required-badge"
              >
                {{ L('Obligatorio', 'Required', 'Obligatoire', 'Obrigatório') }}
              </span>
              <span
                v-else-if="scheduleMode === 'optional'"
                class="card-badge"
              >
                {{ L('Opcional', 'Optional', 'Facultatif', 'Opcional') }}
              </span>
            </header>
            <!-- Sin horario -->
            <div
              v-if="scheduleMode === 'idle' || scheduleMode === 'none'"
              class="schedule-note"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>{{ scheduleNote }}</span>
            </div>
            <!-- Con horario -->
            <div
              v-else
              class="schedule-body"
            >
              <label
                v-if="scheduleMode === 'optional'"
                class="switch-row"
              >
                <span class="switch-toggle">
                  <input
                    type="checkbox"
                    v-model="form.tieneHorario"
                  >
                  <span class="slider-round"></span>
                </span>
                <span class="switch-copy">
                  <strong>
                    {{ L('Asignar horario de trabajo', 'Assign work schedule', 'Attribuer un horaire de travail', 'Atribuir horário de trabalho') }}
                  </strong>
                  <small>
                    {{ L('Actívalo solo si este entrenador tiene un horario fijo.', 'Turn it on only if this trainer has a fixed schedule.', 'Activez-le uniquement si cet entraîneur a un horaire fixe.', 'Ative apenas se este treinador tiver horário fixo.') }}
                  </small>
                </span>
              </label>
              <div
                v-if="showTimes"
                class="form-grid"
              >
                <div class="date-field">
                  <div class="date-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div class="date-content">
                    <label>
                      {{ t('entryTime') }}
                      <span
                        v-if="scheduleMode === 'required'"
                        class="required"
                      >*</span>
                    </label>
                    <input
                      type="time"
                      v-model="form.horaEntrada"
                    >
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
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div class="date-content">
                    <label>
                      {{ t('exitTime') }}
                      <span
                        v-if="scheduleMode === 'required'"
                        class="required"
                      >*</span>
                    </label>
                    <input
                      type="time"
                      v-model="form.horaSalida"
                    >
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- BOTÓN REGISTRAR -->
          <div class="registration-footer">
            <div class="required-hint">
              <span class="required">*</span>
              {{ L('Campos obligatorios', 'Required fields', 'Champs obligatoires', 'Campos obrigatórios') }}
            </div>
            <button
              type="button"
              class="btn-primary"
              @click="saveRegistration"
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
                <polyline
                  points="17 21 17 13 7 13 7 21"
                />
                <polyline
                  points="7 3 7 8 15 8"
                />
              </svg>
              {{ t('finishButtonStaff') }}
            </button>
          </div>
        </div>
      </div>
    </main>
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
                    ? 'Add staff photo'
                    : 'Agregar foto del personal'
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
                    ? 'Take staff photo'
                    : 'Tomar foto del personal'
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
  onMounted,
  onUnmounted,
  nextTick
} from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';
/* =========================================================
   NOTIFICACIONES
========================================================= */
const toastRef = ref(null);
/* =========================================================
   IDIOMA
========================================================= */
const currentLang = ref(
  localStorage.getItem('GYM_ACCOUNT-idioma') || 'es'
);
const t = (key) => {
  const langTable =
    traducciones[currentLang.value] ||
    traducciones.es;
  return (
    langTable?.[key] ||
    traducciones.es?.[key] ||
    key
  );
};
/*
  Texto en 4 idiomas para las cadenas nuevas.
  Si falta fr/pt se usa el inglés.
*/
const L = (es, en, fr, pt) => {
  const texts = {
    es,
    en,
    fr: fr ?? en,
    pt: pt ?? en
  };
  return texts[currentLang.value] ?? es;
};
const handleLangChange = (event) => {
  if (event.detail?.idioma) {
    currentLang.value =
      event.detail.idioma;
  }
};
/* =========================================================
   FORMULARIO
========================================================= */
const form = reactive({
  /* CREDENCIALES */
  rol: '',
  email: '',
  password: '',
  confirmPassword: '',
  /* ENTRENADOR */
  especialidad: '',
  /* SEDES */
  sedes: [],
  /* DATOS PERSONALES */
  curp: '',
  nombres: '',
  apellidoP: '',
  apellidoM: '',
  fechaNacimiento: '',
  celular: '',
  /* REDES (solo entrenador) */
  facebook: '',
  instagram: '',
  tiktok: '',
  otrasApps: '',
  /* HORARIO */
  tieneHorario: false,
  horaEntrada: '',
  horaSalida: ''
});
/* CELULAR: 10 dígitos nacionales, formato XXX XXX XXXX. */
const celularDigitos = (valor) => String(valor ?? '').replace(/\D/g, '').slice(0, 10);
const formatoCelular = (valor) => {
  const d = celularDigitos(valor);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(' ');
};
const onCelularInput = (event) => {
  const valor = String(event.target.value ?? '');
  if (valor.includes('+') || /^\s*52[\s-]/.test(valor)) {
    warn('No agregues +52. Ingresa solamente los 10 dígitos de tu celular.');
    form.celular = '';
    event.target.value = '';
    return;
  }
  form.celular = formatoCelular(valor);
  event.target.value = form.celular;
};
const onCelularPaste = (event) => {
  const texto = event.clipboardData?.getData('text') ?? '';
  if (/\+\s*52/.test(texto) || /^\s*52[\s-]/.test(texto)) {
    event.preventDefault();
    warn('El número no debe incluir +52. Pega únicamente los 10 dígitos nacionales.');
  }
};
/* =========================================================
   REGLAS POR ROL
   - propietario : todas las sedes · sin horario · con contraseña
   - gerente     : una, varias o todas · sin horario · con contraseña
   - recepcion   : UNA sola sede · horario obligatorio · con contraseña
   - entrenador  : varias sedes · horario opcional · sin contraseña
========================================================= */
const isOwner = computed(() => form.rol === 'GYM_ADMIN');
const isManager = computed(() => form.rol === 'GYM_MANAGER');
const isTrainer = computed(() => form.rol === 'GYM_COACH');
const isReception = computed(() => form.rol === 'GYM_RECEPCIONIST');
const needsPassword = computed(() => true);
/* Roles que pueden elegir varias sedes */
const multiSedes = computed(
  () => isManager.value || isTrainer.value
);
/*
  required = recepción
  optional = entrenador
  none     = propietario / gerente
  idle     = todavía no hay rol
*/
const scheduleMode = computed(() => {
  if (isReception.value) return 'required';
  if (isTrainer.value) return 'optional';
  if (form.rol) return 'none';
  return 'idle';
});
const showTimes = computed(
  () =>
    scheduleMode.value === 'required' ||
    (scheduleMode.value === 'optional' && form.tieneHorario)
);
const roleLabel = computed(() => {
  if (isOwner.value) {
    return L('Propietario', 'Owner', 'Propriétaire', 'Proprietário');
  }
  if (isManager.value) return 'Gerente';
  if (isTrainer.value) return t('roleTrainer');
  if (isReception.value) return t('roleReception');
  return '';
});
const scheduleNote = computed(() =>
  scheduleMode.value === 'idle'
    ? L(
        'Selecciona un rol para ver las opciones de horario.',
        'Select a role to see the schedule options.',
        'Sélectionnez un rôle pour voir les options d’horaire.',
        'Selecione uma função para ver as opções de horário.'
      )
    : L(
        'Este rol no tiene horario de trabajo.',
        'This role has no work schedule.',
        'Ce rôle n’a pas d’horaire de travail.',
        'Esta função não tem horário de trabalho.'
      )
);
const sedesHint = computed(() => {
  if (!form.rol) {
    return L(
      'Selecciona primero un rol.',
      'Select a role first.',
      'Sélectionnez d’abord un rôle.',
      'Selecione primeiro uma função.'
    );
  }
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
/* Resumen del panel lateral */
const sedesSummary = computed(() => {
  if (isOwner.value) {
    return {
      text: L('Todas', 'All', 'Tous', 'Todas'),
      empty: false
    };
  }
  if (form.sedes.length === 0) {
    return { text: '—', empty: true };
  }
  return { text: String(form.sedes.length), empty: false };
});
const scheduleSummary = computed(() => {
  if (scheduleMode.value === 'none') {
    return {
      text: L('No aplica', 'Not applicable', 'Non applicable', 'Não se aplica'),
      empty: true
    };
  }
  if (scheduleMode.value === 'optional' && !form.tieneHorario) {
    return {
      text: L('Sin horario asignado', 'No schedule assigned', 'Aucun horaire attribué', 'Sem horário atribuído'),
      empty: true
    };
  }
  if (showTimes.value && form.horaEntrada && form.horaSalida) {
    return {
      text: `${form.horaEntrada} – ${form.horaSalida}`,
      empty: false
    };
  }
  return { text: '—', empty: true };
});
/* =========================================================
   SEDES
========================================================= */
const leerSedesSesion = () => {
  try {
    const raw = JSON.parse(sessionStorage.getItem('gym_account') || '{}');
    const account = raw.usuario || raw;
    return (Array.isArray(account.sedes) ? account.sedes : []).map(s => ({
      id: Number(s.ID_Sede ?? s.id),
      nombre: String(s.Sede_Colonia ?? s.nombre ?? s.Nombre ?? `Sucursal ${s.ID_Sede ?? s.id}`)
    })).filter(s => Number.isFinite(s.id) && s.id > 0);
  } catch { return []; }
};
const listaSedes = ref(leerSedesSesion());
const sedesCargando = ref(false);
const sedesError = ref('');
const cargarSedes = async () => {
  sedesCargando.value = true;
  sedesError.value = '';
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const url = `${base}${base.endsWith('/api') ? '' : '/api'}/personal/sedes`;
  const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('token');
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    const type = response.headers.get('content-type') || '';
    if (!type.includes('application/json')) throw new Error('La API devolvió HTML en lugar de JSON. Revisa VITE_API_URL y /api/personal/sedes.');
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || `Error HTTP ${response.status} al cargar sucursales`);
    const items = Array.isArray(json) ? json : (json.sedes ?? json.data ?? []);
    if (!Array.isArray(items)) throw new Error('Formato de sucursales no válido');
    const sedes = items.map(x => ({ id: Number(x.ID_Sede ?? x.id), nombre: String(x.Sede_Colonia ?? x.nombre ?? x.Nombre ?? `Sucursal ${x.ID_Sede ?? x.id}`) })).filter(x => Number.isFinite(x.id) && x.id > 0);
    listaSedes.value = sedes;
    form.sedes = form.sedes.filter(id => sedes.some(x => x.id === id));
  } catch (e) {
    sedesError.value = e.message;
    // Si falla la API, conservar las sucursales del login como en HeadingGYM_ACCOUNT.
    if (!listaSedes.value.length) console.error('Error al cargar sucursales:', e);
  } finally { sedesCargando.value = false; }
};
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const allSedesSelected = computed(
  () =>
    listaSedes.value.length > 0 &&
    form.sedes.length === listaSedes.value.length
);
const toggleDropdown = () => {
  if (!form.rol) return;
  isDropdownOpen.value = !isDropdownOpen.value;
};
/*
  Recepción: una sola sede (se reemplaza y se cierra).
  Gerente / entrenador: se agrega o se quita.
*/
const toggleSede = (id) => {
  if (isReception.value) {
    form.sedes = [id];
    isDropdownOpen.value = false;
    return;
  }
  const index = form.sedes.indexOf(id);
  if (index === -1) {
    form.sedes.push(id);
  } else {
    form.sedes.splice(index, 1);
  }
};
const toggleAllSedes = () => {
  form.sedes = allSedesSelected.value
    ? []
    : listaSedes.value.map((sede) => sede.id);
};
/*
  Texto que aparece en el selector de sedes.
*/
const getSedesDisplayText = () => {
  if (!form.rol) {
    return L(
      'Selecciona un rol primero',
      'Select a role first',
      'Sélectionnez d’abord un rôle',
      'Selecione primeiro uma função'
    );
  }
  if (form.sedes.length === 0) {
    return L(
      isReception.value ? 'Seleccionar sede' : 'Seleccionar sedes',
      isReception.value ? 'Select location' : 'Select locations',
      isReception.value ? 'Sélectionner le site' : 'Sélectionner les sites',
      isReception.value ? 'Selecionar unidade' : 'Selecionar unidades'
    );
  }
  if (allSedesSelected.value && multiSedes.value) {
    return L(
      'Todas las sedes',
      'All locations',
      'Tous les sites',
      'Todas as unidades'
    );
  }
  if (form.sedes.length === 1) {
    const sede = listaSedes.value.find(
      (item) => item.id === form.sedes[0]
    );
    return sede?.nombre || '1';
  }
  if (currentLang.value === 'en') {
    return `${form.sedes.length} locations selected`;
  }
  if (currentLang.value === 'fr') {
    return `${form.sedes.length} sites sélectionnés`;
  }
  if (currentLang.value === 'pt') {
    return `${form.sedes.length} unidades selecionadas`;
  }
  return `${form.sedes.length} sedes seleccionadas`;
};
/*
  Cierra el dropdown cuando se hace
  clic fuera de él.
*/
const handleClickOutside = (event) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    isDropdownOpen.value = false;
  }
};
/*
  Al cambiar de rol se ajustan sedes y horario
  para que siempre cumplan las reglas.
*/
watch(
  () => form.rol,
  (rol, previous) => {
    isDropdownOpen.value = false;
    /* SEDES */
    if (rol === 'propietario') {
      form.sedes = listaSedes.value.map((sede) => sede.id);
    } else if (previous === 'propietario') {
      form.sedes = [];
    } else if (rol === 'recepcion' && form.sedes.length > 1) {
      form.sedes = [form.sedes[0]];
    }
    /* HORARIO */
    form.horaEntrada = '';
    form.horaSalida = '';
    form.tieneHorario = rol === 'recepcion';
  }
);
/*
  Si el entrenador desactiva el horario, se limpian las horas.
*/
watch(
  () => form.tieneHorario,
  (active) => {
    if (!active && isTrainer.value) {
      form.horaEntrada = '';
      form.horaSalida = '';
    }
  }
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
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) { toastRef.value?.notify('Foto JPG, PNG o WEBP de máximo 4 MiB.', 'warning'); return; }
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};
const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
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
        `personal-${Date.now()}.jpg`,
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
   VALIDACIÓN
========================================================= */
const warn = (message) => {
  toastRef.value?.notify(message, 'warning');
  return false;
};
/* CURP opcional: estructura, fecha real, entidad y dígito verificador. No consulta RENAPO. */
const validarCURP = (entrada) => {
  const curp = String(entrada || '').trim().toUpperCase();
  if (!curp) return { valid: true, message: '' };
  if (curp.length !== 18) return { valid: false, message: 'La CURP debe tener exactamente 18 caracteres.' };
  const patron = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
  if (!patron.test(curp)) return { valid: false, message: 'La estructura de la CURP no es válida.' };
  const yy = Number(curp.slice(4, 6));
  const mm = Number(curp.slice(6, 8));
  const dd = Number(curp.slice(8, 10));
  const year = (/[0-9]/.test(curp[16]) ? 1900 : 2000) + yy;
  const fecha = new Date(Date.UTC(year, mm - 1, dd));
  const hoy = new Date();
  if (fecha.getUTCFullYear() !== year || fecha.getUTCMonth() !== mm - 1 || fecha.getUTCDate() !== dd || fecha.getTime() > hoy.getTime()) {
    return { valid: false, message: 'La fecha de nacimiento dentro de la CURP es inválida.' };
  }
  const alfabeto = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const valor = alfabeto.indexOf(curp[i]);
    if (valor < 0) return { valid: false, message: 'La CURP contiene caracteres no permitidos.' };
    suma += valor * (18 - i);
  }
  const digito = (10 - (suma % 10)) % 10;
  if (digito !== Number(curp[17])) return { valid: false, message: 'El dígito verificador de la CURP es incorrecto.' };
  return { valid: true, message: '' };
};
const curpValidation = computed(() => validarCURP(form.curp));
const validateForm = () => {
  /* DATOS PERSONALES */
  if (!curpValidation.value.valid) return warn(curpValidation.value.message);
  if (
    !form.nombres.trim() ||
    !form.apellidoP.trim()
  ) {
    return warn(
      L(
        'Completa los datos personales obligatorios.',
        'Complete the required personal information.',
        'Complétez les informations personnelles obligatoires.',
        'Preencha as informações pessoais obrigatórias.'
      )
    );
  }
  if (!form.celular.trim()) return warn('El celular es obligatorio.');
  if (!/^[0-9]{10}$/.test(celularDigitos(form.celular))) return warn('El celular debe tener exactamente 10 dígitos, sin +52. Ejemplo: 481 111 1231.');
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return warn('Correo electrónico inválido.');
  /* ROL */
  if (!form.rol) {
    return warn(
      L(
        'Selecciona un rol del sistema.',
        'Select a system role.',
        'Sélectionnez un rôle système.',
        'Selecione uma função no sistema.'
      )
    );
  }
  /* CORREO */
  if (!form.email.trim()) {
    return warn(
      L(
        'Ingresa un correo electrónico.',
        'Enter an email address.',
        'Entrez une adresse e-mail.',
        'Digite um endereço de e-mail.'
      )
    );
  }
  /* CONTRASEÑA: propietario, gerente y recepción */
  if (needsPassword.value) {
    if (!form.password || !form.confirmPassword) {
      return warn(
        L(
          'Ingresa y confirma la contraseña.',
          'Enter and confirm the password.',
          'Entrez et confirmez le mot de passe.',
          'Digite e confirme a senha.'
        )
      );
    }
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
  /* SEDES (el propietario tiene todas automáticamente) */
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
  if (showTimes.value && (form.horaEntrada || form.horaSalida) && (!form.horaEntrada || !form.horaSalida)) return warn('Completa ambas horas o deja ambas vacías.');
  return true;
};
/* =========================================================
   GUARDAR REGISTRO
========================================================= */
const saveRegistration = async () => {
  if (!validateForm()) {
    return;
  }
  try {
    /*
      Solo se envía lo que aplica al rol:
      - contraseña: propietario, gerente, recepción
      - especialidad y redes: entrenador
      - horario: recepción (siempre) y entrenador (si lo activó)
      avatarFile contiene tanto la foto subida
      desde galería como la tomada con cámara.
    */
    const data = {
      rol:
        form.rol,
      email:
        form.email.trim(),
      ...(needsPassword.value && {
        password: form.password
      }),
      sedes:
        [...form.sedes],
      todasLasSedes:
        isOwner.value || allSedesSelected.value,
      curp:
        form.curp.trim().toUpperCase(),
      nombres:
        form.nombres.trim(),
      apellidoP:
        form.apellidoP.trim(),
      apellidoM:
        form.apellidoM.trim(),
      fechaNacimiento:
        form.fechaNacimiento,
      celular:
        celularDigitos(form.celular),
      ...(isTrainer.value && {
        especialidad: form.especialidad.trim(),
        facebook: form.facebook.trim(),
        instagram: form.instagram.trim(),
        tiktok: form.tiktok.trim(),
        otrasApps: form.otrasApps.trim()
      }),
      horario: showTimes.value
        ? {
            entrada: form.horaEntrada,
            salida: form.horaSalida
          }
        : null,
      foto:
        avatarFile.value
    };
    const payload = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (key === 'foto') { if (value) payload.append('foto', value); }
      else if (key === 'sedes') value.forEach(id => payload.append('sedes[]', String(id)));
      else if (key === 'horario') { if (value) payload.append('horario', JSON.stringify(value)); }
      else if (value !== null && value !== undefined) payload.append(key, String(value));
    }
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const url = `${base}${base.endsWith('/api') ? '' : '/api'}/personal`;
    const bearer = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await fetch(url, { method: 'POST', headers: { Accept: 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body: payload });
    const type = response.headers.get('content-type') || '';
    if (!type.includes('application/json')) throw new Error(`El servidor devolvió HTML (HTTP ${response.status}). Revisa VITE_API_URL y /api/personal.`);
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 422 && result.errors?.curp?.length) {
        throw new Error('Esta CURP ya está registrada.');
      }

      const validationMessages = Object.values(result.errors || {})
        .flat()
        .filter(Boolean);

      throw new Error(
        validationMessages.join(' ') ||
        result.message ||
        'No se pudo registrar al personal.'
      );
    }
    toastRef.value?.notify(
      L(
        'Personal registrado correctamente.',
        'Staff member registered successfully.',
        'Personnel enregistré avec succès.',
        'Funcionário registrado com sucesso.'
      ),
      'success'
    );
  } catch (error) {
    console.error(
      'Error al registrar personal:',
      error
    );
    toastRef.value?.notify(error.message || 'Error al registrar personal.', 'error');
  }
};
/* =========================================================
   CICLO DE VIDA
========================================================= */
onMounted(() => {
  cargarSedes();
  /*
    Cambio global de idioma.
  */
  window.addEventListener(
    'idioma-changed',
    handleLangChange
  );
  /*
    Cerrar selector de sedes
    haciendo clic afuera.
  */
  document.addEventListener(
    'click',
    handleClickOutside
  );
});
onUnmounted(() => {
  window.removeEventListener(
    'idioma-changed',
    handleLangChange
  );
  document.removeEventListener(
    'click',
    handleClickOutside
  );
  /*
    MUY IMPORTANTE:
    Si el usuario cambia de pantalla
    mientras la cámara está abierta,
    apagamos la cámara.
  */
  stopCamera();
  /*
    Liberamos la URL temporal
    de la fotografía.
  */
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&display=swap');
/* =========================================================
   BASE
========================================================= */
* { box-sizing: border-box; }
.hidden-canvas { display: none; }
.main-content {
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 28px;
  font-family: 'Inter', sans-serif;
  color: var(--color-texto-general, #e5e7eb);
}
.profile-card {
  width: 100%;
  max-width: 1450px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
/* =========================================================
   PANEL PERFIL
========================================================= */
.profile-section {
  position: sticky;
  top: 24px;
  overflow: hidden;
  border: 1px solid var(--border-cards, rgba(255,255,255,.08));
  border-radius: var(--app-border-radius, 20px);
  background: var(--bg-cards, #14161b);
  box-shadow: 0 12px 35px rgba(0,0,0,.18);
}
.profile-content { padding: 30px 26px; }
.main-title {
  margin: 0 0 27px;
  color: var(--color-titulos, #fff);
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -.02em;
}
.highlight { color: var(--color-highlight, #3b82f6); }
/* ---------- Avatar ---------- */
.avatar-wrapper { position: relative; width: 132px; height: 132px; margin: 0 auto 15px; }
.avatar-ring {
  width: 132px; height: 132px;
  display: flex; align-items: center; justify-content: center;
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--color-highlight, #3b82f6), color-mix(in srgb, var(--color-highlight, #3b82f6) 35%, transparent));
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--color-highlight, #3b82f6) 8%, transparent), 0 12px 30px rgba(0,0,0,.28);
}
.avatar-circle {
  width: 100%; height: 100%;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid var(--bg-cards, #14161b);
  border-radius: 50%;
  background: #262a31;
  transition: transform .2s ease, filter .2s ease;
}
.avatar-circle:hover { transform: scale(1.015); filter: brightness(1.08); }
.avatar-circle svg { width: 60px; height: 60px; opacity: .8; }
.avatar-img { width: 100%; height: 100%; display: block; object-fit: cover; }
.avatar-action {
  position: absolute; right: 0; bottom: 5px;
  width: 39px; height: 39px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  border: 3px solid var(--bg-cards, #14161b);
  border-radius: 50%;
  background: var(--color-highlight, #3b82f6);
  color: #fff;
  box-shadow: 0 6px 16px rgba(0,0,0,.3);
  transition: transform .2s ease, filter .2s ease;
}
.avatar-action:hover { transform: translateY(-2px) scale(1.05); filter: brightness(1.1); }
.avatar-action:active { transform: scale(.95); }
.avatar-action svg { width: 18px; height: 18px; }
.profile-hint { margin: 0 0 25px; text-align: center; color: var(--color-texto-general, #94a3b8); font-size: .73rem; line-height: 1.5; opacity: .65; }
/* ---------- Resumen ---------- */
.profile-summary { margin: 0; padding: 20px 0 0; border-top: 1px solid rgba(255,255,255,.07); }
.summary-item { padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,.055); }
.summary-item:last-child { border-bottom: none; }
.summary-item dt {
  margin-bottom: 6px;
  color: var(--color-texto-general, #94a3b8);
  font-size: .66rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  opacity: .58;
}
.summary-item dd { margin: 0; color: var(--color-titulos, #fff); font-size: .83rem; font-weight: 500; line-height: 1.4; overflow-wrap: anywhere; }
.summary-item dd.empty, .empty { color: var(--color-texto-general, #94a3b8); opacity: .45; }
.plan-chip {
  display: inline-flex; align-items: center;
  min-height: 25px; padding: 4px 9px;
  border: 1px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 22%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 10%, transparent);
  color: var(--color-highlight, #60a5fa);
  font-size: .68rem; font-weight: 700;
}
/* =========================================================
   FORMULARIOS
========================================================= */
.forms-wrapper { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
.login-card {
  overflow: visible;
  border: 1px solid var(--border-cards, rgba(255,255,255,.08));
  border-radius: var(--app-border-radius, 18px);
  background: var(--bg-cards, #14161b);
  box-shadow: 0 8px 28px rgba(0,0,0,.12);
}
.card-header { padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,.065); }
.card-header-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.card-badge {
  display: inline-flex; align-items: center;
  min-height: 24px; padding: 3px 10px;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 999px;
  background: rgba(255,255,255,.04);
  color: var(--color-texto-general, #94a3b8);
  font-size: .64rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
  white-space: nowrap;
}
.card-badge.required-badge {
  border-color: color-mix(in srgb, var(--color-highlight, #3b82f6) 30%, transparent);
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 11%, transparent);
  color: var(--color-highlight, #60a5fa);
}
.section-title {
  position: relative;
  margin: 0; padding-left: 13px;
  color: var(--color-titulos, #fff);
  font-family: 'Oswald', sans-serif;
  font-size: 1.05rem; font-weight: 600; letter-spacing: .01em;
}
.section-title::before {
  content: '';
  position: absolute; top: 50%; left: 0;
  width: 3px; height: 18px;
  border-radius: 3px;
  background: var(--color-highlight, #3b82f6);
  transform: translateY(-50%);
}
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 20px; padding: 22px; }
.span-full { grid-column: 1 / -1; }
.input-group { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.input-group label, .date-content label {
  color: var(--color-texto-general, #d1d5db);
  font-size: .71rem; font-weight: 600; letter-spacing: .015em;
}
.required { color: #ef4444; }
.field-hint { margin: 0; color: var(--color-texto-general, #94a3b8); font-size: .67rem; line-height: 1.45; opacity: .55; }
.input-group input, .input-group select, .date-content input {
  width: 100%; min-height: 43px;
  padding: 0 13px;
  outline: none;
  border: 1px solid var(--border-inputs, rgba(255,255,255,.1));
  border-radius: 10px;
  background: var(--bg-inputs, rgba(255,255,255,.035));
  color: var(--color-texto-general, #e5e7eb);
  font-family: 'Inter', sans-serif; font-size: .79rem;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.input-group input::placeholder { color: var(--color-texto-general, #94a3b8); opacity: .35; }
.input-group input:hover, .input-group select:hover, .date-content input:hover { border-color: rgba(255,255,255,.17); }
.input-group input:focus, .input-group select:focus, .date-content input:focus {
  border-color: var(--color-highlight, #3b82f6);
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 3%, var(--bg-inputs, #1a1d23));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-highlight, #3b82f6) 11%, transparent);
}
.custom-select { cursor: pointer; appearance: auto; }
.custom-select option { background: #17191e; color: #fff; }
.input-with-icon { position: relative; }
.input-with-icon svg {
  position: absolute; top: 50%; left: 13px;
  width: 16px; height: 16px;
  pointer-events: none;
  color: var(--color-texto-general, #94a3b8);
  opacity: .55;
  transform: translateY(-50%);
}
.input-with-icon input { padding-left: 40px; }
/* ---------- Multiselect sedes ---------- */
.custom-multiselect { position: relative; width: 100%; }
.select-box-trigger {
  width: 100%; min-height: 43px;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 0 12px 0 13px;
  cursor: pointer; user-select: none;
  border: 1px solid var(--border-inputs, rgba(255,255,255,.1));
  border-radius: 10px;
  background: var(--bg-inputs, rgba(255,255,255,.035));
  transition: border-color .2s ease, box-shadow .2s ease;
}
.select-box-trigger:hover { border-color: rgba(255,255,255,.17); }
.select-box-trigger.open {
  border-color: var(--color-highlight, #3b82f6);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-highlight, #3b82f6) 10%, transparent);
}
.select-box-trigger.disabled { cursor: not-allowed; opacity: .55; }
.select-box-trigger.disabled:hover { border-color: var(--border-inputs, rgba(255,255,255,.1)); }
.trigger-text { min-width: 0; overflow: hidden; color: var(--color-texto-general, #e5e7eb); font-size: .79rem; text-overflow: ellipsis; white-space: nowrap; }
.placeholder-text { opacity: .4; }
.dropdown-arrow { width: 15px; height: 15px; flex-shrink: 0; color: var(--color-texto-general, #94a3b8); transition: transform .2s ease; }
.dropdown-arrow.rotate { transform: rotate(180deg); }
.dropdown-options-list {
  position: absolute; z-index: 80;
  top: calc(100% + 6px); right: 0; left: 0;
  max-height: 230px; overflow-y: auto;
  padding: 6px;
  border: 1px solid var(--border-cards, rgba(255,255,255,.1));
  border-radius: 11px;
  background: var(--bg-cards, #17191e);
  box-shadow: 0 15px 35px rgba(0,0,0,.4);
}
.dropdown-options-list::-webkit-scrollbar { width: 5px; }
.dropdown-options-list::-webkit-scrollbar-track { background: transparent; }
.dropdown-options-list::-webkit-scrollbar-thumb { border-radius: 10px; background: rgba(255,255,255,.14); }
.dropdown-option-item {
  display: flex; align-items: center; gap: 10px;
  min-height: 39px; padding: 7px 9px;
  cursor: pointer; border-radius: 7px;
  color: var(--color-texto-general, #e5e7eb);
  font-size: .77rem;
  transition: background .16s ease;
}
.dropdown-option-item:hover { background: rgba(255,255,255,.055); }
.dropdown-option-item.selected { background: color-mix(in srgb, var(--color-highlight, #3b82f6) 10%, transparent); }
.dropdown-option-item.select-all { margin-bottom: 5px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,.07); border-radius: 7px 7px 0 0; }
.option-checkbox {
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.18); border-radius: 5px;
}
.option-checkbox.radio { border-radius: 50%; }
.radio-dot { width: 8px; height: 8px; display: block; border-radius: 50%; background: #fff; }
.dropdown-option-item.selected .option-checkbox { border-color: var(--color-highlight, #3b82f6); background: var(--color-highlight, #3b82f6); color: #fff; }
.option-checkbox svg { width: 12px; height: 12px; }
/* ---------- Propietario: todas las sedes ---------- */
.sedes-static {
  min-height: 56px;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 13px;
  border: 1px solid color-mix(in srgb, var(--color-highlight, #3b82f6) 28%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 7%, transparent);
}
.sedes-static-icon {
  width: 34px; height: 34px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 9px;
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 14%, transparent);
  color: var(--color-highlight, #60a5fa);
}
.sedes-static-icon svg { width: 16px; height: 16px; }
.sedes-static-text { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.sedes-static-text strong { color: var(--color-titulos, #fff); font-size: .8rem; font-weight: 600; }
.sedes-static-text span { color: var(--color-texto-general, #94a3b8); font-size: .68rem; opacity: .7; }
/* ---------- Horarios ---------- */
.schedule-note {
  display: flex; align-items: center; gap: 11px;
  margin: 22px; padding: 14px 16px;
  border: 1px dashed rgba(255,255,255,.12);
  border-radius: 12px;
  background: rgba(255,255,255,.02);
  color: var(--color-texto-general, #94a3b8);
  font-size: .76rem; line-height: 1.45;
}
.schedule-note svg { width: 18px; height: 18px; flex-shrink: 0; opacity: .6; }
.schedule-body { display: flex; flex-direction: column; gap: 18px; padding: 22px; }
.schedule-body .form-grid { padding: 0; }
.switch-row {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 14px;
  cursor: pointer;
  border: 1px solid var(--border-inputs, rgba(255,255,255,.08));
  border-radius: 12px;
  background: rgba(255,255,255,.022);
  transition: border-color .2s ease;
}
.switch-row:hover { border-color: rgba(255,255,255,.17); }
.switch-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.switch-copy strong { color: var(--color-titulos, #fff); font-size: .8rem; font-weight: 600; }
.switch-copy small { color: var(--color-texto-general, #94a3b8); font-size: .68rem; line-height: 1.4; opacity: .65; }
.switch-toggle { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
.switch-toggle input { position: absolute; width: 0; height: 0; opacity: 0; }
.slider-round { position: absolute; inset: 0; border-radius: 22px; background: #2a2e39; transition: background .25s ease; }
.slider-round::before {
  content: '';
  position: absolute; bottom: 3px; left: 3px;
  width: 16px; height: 16px;
  border-radius: 50%; background: #fff;
  transition: transform .25s ease;
}
.switch-toggle input:checked + .slider-round { background: var(--color-highlight, #3b82f6); }
.switch-toggle input:checked + .slider-round::before { transform: translateX(18px); }
.switch-toggle input:focus-visible + .slider-round { box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-highlight, #3b82f6) 25%, transparent); }
.date-field {
  min-height: 78px;
  display: flex; align-items: center; gap: 13px;
  padding: 13px;
  border: 1px solid var(--border-inputs, rgba(255,255,255,.08));
  border-radius: 12px;
  background: rgba(255,255,255,.022);
}
.date-icon {
  width: 39px; height: 39px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 11%, transparent);
  color: var(--color-highlight, #60a5fa);
}
.date-icon svg { width: 18px; height: 18px; }
.date-content { min-width: 0; flex: 1; }
.date-content label { display: block; margin-bottom: 6px; }
.date-content input { min-height: 37px; }
/* ---------- Pie ---------- */
.registration-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 5px 2px 18px; }
.required-hint { color: var(--color-texto-general, #94a3b8); font-size: .7rem; opacity: .6; }
.btn-primary {
  min-height: 45px;
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  padding: 0 22px;
  cursor: pointer; border: none; border-radius: 10px;
  background: var(--color-botones, var(--color-highlight, #3b82f6));
  color: var(--color-texto-botones, #fff);
  font-family: 'Inter', sans-serif; font-size: .78rem; font-weight: 700;
  box-shadow: 0 7px 18px color-mix(in srgb, var(--color-botones, #3b82f6) 20%, transparent);
  transition: transform .2s ease, filter .2s ease, box-shadow .2s ease;
}
.btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 9px 22px color-mix(in srgb, var(--color-botones, #3b82f6) 27%, transparent); }
.btn-primary:active { transform: scale(.98); }
.btn-primary svg { width: 17px; height: 17px; }
/* =========================================================
   PANEL DE FOTO Y CÁMARA (idéntico al registro de clientes)
========================================================= */
.photo-options-overlay, .camera-overlay {
  position: fixed; z-index: 3000; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 18px;
  background: rgba(0,0,0,.78);
}
.camera-overlay { z-index: 4000; background: rgba(0,0,0,.9); }
.photo-options-modal, .camera-modal {
  width: 100%; max-width: 440px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px;
  background: var(--bg-cards, #151515);
  box-shadow: 0 30px 80px rgba(0,0,0,.55);
}
.camera-modal { max-width: 620px; }
.photo-options-handle { display: none; }
.photo-options-header, .camera-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 18px; margin-bottom: 20px;
}
.photo-options-eyebrow, .camera-eyebrow {
  display: block; margin-bottom: 5px;
  color: var(--color-highlight, #3b82f6);
  font: 700 .6rem 'Inter', sans-serif; letter-spacing: 1px;
}
.photo-options-header h3, .camera-header h3 {
  margin: 0;
  color: var(--color-titulos, #fff);
  font: 400 1.25rem 'Anton', sans-serif;
  text-transform: uppercase;
}
.photo-options-header p, .camera-header p {
  margin: 5px 0 0;
  color: var(--color-texto-general, #94a3b8);
  font: 400 .74rem/1.5 'Inter', sans-serif;
  opacity: .7;
}
.modal-close-btn {
  width: 34px; height: 34px; flex-shrink: 0;
  display: grid; place-items: center;
  padding: 0;
  border: 1px solid rgba(255,255,255,.1); border-radius: 9px;
  background: rgba(255,255,255,.04);
  color: #fff; cursor: pointer; font-size: 1.3rem;
}
/* ---------- Opciones ---------- */
.photo-options-grid { display: flex; flex-direction: column; gap: 9px; }
.photo-option {
  width: 100%; min-height: 72px;
  display: flex; align-items: center; gap: 13px;
  padding: 11px 13px;
  border: 1px solid rgba(255,255,255,.08); border-radius: 13px;
  background: rgba(255,255,255,.025);
  color: inherit; text-align: left; cursor: pointer;
}
.photo-option:hover { border-color: var(--color-highlight, #3b82f6); }
.photo-option-icon {
  width: 44px; height: 44px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 11px;
  background: color-mix(in srgb, var(--color-highlight, #3b82f6) 13%, transparent);
  color: var(--color-highlight, #60a5fa);
}
.photo-option-icon svg { width: 20px; height: 20px; }
.photo-option-text { flex: 1; }
.photo-option-text strong { display: block; color: var(--color-titulos, #fff); font: 600 .8rem 'Inter', sans-serif; }
.photo-option-text span { display: block; margin-top: 3px; color: var(--color-texto-general, #94a3b8); font: 400 .68rem 'Inter', sans-serif; }
.photo-option-arrow { width: 16px; color: var(--color-texto-general, #94a3b8); }
.photo-cancel {
  width: 100%; height: 40px; margin-top: 13px;
  border: 1px solid rgba(255,255,255,.08); border-radius: 10px;
  background: transparent;
  color: var(--color-texto-general, #94a3b8); cursor: pointer;
}
/* ---------- Visor ---------- */
.camera-preview {
  position: relative; width: 100%;
  aspect-ratio: 4 / 3; overflow: hidden;
  border: 1px solid rgba(255,255,255,.1); border-radius: 18px;
  background: #000;
}
.camera-preview video { width: 100%; height: 100%; display: block; object-fit: cover; }
.camera-preview video.camera-mirrored { transform: scaleX(-1); }
.camera-guide { position: absolute; z-index: 2; inset: 0; display: grid; place-items: center; pointer-events: none; }
.face-guide { width: 47%; height: 70%; border: 2px dashed rgba(255,255,255,.45); border-radius: 50%; }
.switch-camera-btn {
  position: absolute; z-index: 10; top: 14px; right: 14px;
  display: flex; align-items: center; gap: 7px;
  min-height: 38px; padding: 0 13px;
  border: 1px solid rgba(255,255,255,.25); border-radius: 999px;
  background: rgba(0,0,0,.62);
  color: #fff; font: 600 .7rem 'Inter', sans-serif;
  cursor: pointer; box-shadow: 0 5px 16px rgba(0,0,0,.3);
}
.switch-camera-btn:hover { background: rgba(0,0,0,.8); }
.switch-camera-btn:disabled { cursor: wait; opacity: .65; }
.switch-camera-btn svg { width: 16px; height: 16px; }
.switch-camera-btn svg.rotating { animation: cameraRotate .7s linear infinite; }
@keyframes cameraRotate { to { transform: rotate(360deg); } }
.camera-switching { position: absolute; z-index: 8; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.28); pointer-events: none; }
.camera-loader { width: 38px; height: 38px; border: 3px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: cameraRotate .7s linear infinite; }
/* ---------- Capturar ---------- */
.camera-actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 18px; }
.camera-cancel-btn {
  min-width: 110px; padding: 11px 18px;
  border: 1px solid rgba(255,255,255,.1); border-radius: 12px;
  background: rgba(255,255,255,.04);
  color: var(--color-texto-general, #cbd5e1); cursor: pointer;
}
.capture-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 18px 8px 8px;
  border: none; border-radius: 999px;
  background: var(--color-botones, #1c4fd6);
  color: var(--color-texto-botones, #fff);
  font: 700 .78rem 'Inter', sans-serif; cursor: pointer;
}
.capture-btn:disabled { cursor: wait; opacity: .6; }
.capture-circle { width: 38px; height: 38px; display: grid; place-items: center; border: 2px solid #fff; border-radius: 50%; }
.capture-circle span { width: 27px; height: 27px; display: block; border-radius: 50%; background: #fff; transition: transform .15s ease; }
.capture-btn:hover:not(:disabled) .capture-circle span { transform: scale(.85); }
/* ---------- Transición ---------- */
.photo-menu-enter-active, .photo-menu-leave-active { transition: opacity .2s ease; }
.photo-menu-enter-active .photo-options-modal, .photo-menu-leave-active .photo-options-modal,
.photo-menu-enter-active .camera-modal, .photo-menu-leave-active .camera-modal { transition: opacity .2s ease, transform .22s ease; }
.photo-menu-enter-from, .photo-menu-leave-to { opacity: 0; }
.photo-menu-enter-from .photo-options-modal, .photo-menu-leave-to .photo-options-modal,
.photo-menu-enter-from .camera-modal, .photo-menu-leave-to .camera-modal { opacity: 0; transform: translateY(10px) scale(.97); }
/* =========================================================
   RESPONSIVE (formulario del personal)
========================================================= */
@media (max-width: 1150px) {
  .main-content { padding: 22px; }
  .profile-card { grid-template-columns: 275px minmax(0, 1fr); gap: 18px; }
  .profile-content { padding: 25px 21px; }
  .main-title { font-size: 1.75rem; }
}
@media (max-width: 900px) {
  .main-content { padding: 18px; }
  .profile-card { grid-template-columns: 1fr; }
  .profile-section { position: relative; top: auto; }
  .profile-content { display: grid; grid-template-columns: 1fr auto; column-gap: 30px; align-items: center; }
  .main-title { grid-column: 1; margin-bottom: 15px; }
  .avatar-wrapper { grid-column: 2; grid-row: 1 / span 2; margin: 0 10px 0 0; }
  .profile-hint { display: none; }
  .profile-summary { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-top: 20px; }
  .summary-item { padding: 12px 15px; border-right: 1px solid rgba(255,255,255,.06); border-bottom: none; }
  .summary-item:first-child { padding-left: 0; }
  .summary-item:last-child { border-right: none; }
}
@media (max-width: 680px) {
  .main-content { padding: 12px; }
  .profile-card { gap: 14px; }
  .profile-content { display: block; padding: 23px 18px; text-align: center; }
  .main-title { font-size: 1.65rem; }
  .avatar-wrapper { margin: 0 auto 14px; }
  .profile-hint { display: block; }
  .profile-summary { display: grid; grid-template-columns: repeat(2, 1fr); margin-top: 15px; text-align: left; }
  .summary-item { padding: 12px; border-right: 1px solid rgba(255,255,255,.055); border-bottom: 1px solid rgba(255,255,255,.055); }
  .summary-item:nth-child(2n) { border-right: none; }
  .summary-item:nth-last-child(-n + 2) { border-bottom: none; }
  .form-grid { grid-template-columns: 1fr; gap: 16px; padding: 18px; }
  .span-full { grid-column: 1; }
  .card-header { padding: 16px 18px; }
  .schedule-note { margin: 18px; }
  .schedule-body { padding: 18px; }
  .registration-footer { flex-direction: column; align-items: stretch; gap: 12px; padding: 2px 0 14px; }
  .required-hint { padding-left: 2px; }
  .btn-primary { width: 100%; }
}
@media (max-width: 430px) {
  .main-content { padding: 9px; }
  .profile-content { padding: 21px 15px; }
  .main-title { font-size: 1.5rem; }
  .avatar-wrapper, .avatar-ring { width: 120px; height: 120px; }
  .profile-summary { grid-template-columns: 1fr; }
  .summary-item { padding: 11px 0; border-right: none; border-bottom: 1px solid rgba(255,255,255,.055); }
  .summary-item:nth-last-child(-n + 2) { border-bottom: 1px solid rgba(255,255,255,.055); }
  .summary-item:last-child { border-bottom: none; }
  .form-grid { padding: 16px 14px; }
  .schedule-body { padding: 16px 14px; }
  .date-field { padding: 11px; }
  .camera-header h3 { font-size: 1.05rem; }
  .switch-camera-btn span { display: none; }
  .switch-camera-btn { width: 40px; height: 40px; padding: 0; justify-content: center; }
  .switch-camera-btn svg { width: 19px; height: 19px; }
}
/* =========================================================
   RESPONSIVE (panel de foto / cámara, igual que clientes)
========================================================= */
@media (max-width: 650px) {
  .photo-options-overlay { align-items: flex-end; padding: 0; }
  .photo-options-modal { max-width: none; padding: 12px 17px 20px; border-radius: 22px 22px 0 0; }
  .photo-options-handle { width: 38px; height: 4px; display: block; margin: 0 auto 17px; border-radius: 999px; background: rgba(255,255,255,.16); }
  .camera-overlay { align-items: flex-end; padding: 0; }
  .camera-modal { max-width: none; padding: 17px 14px calc(18px + env(safe-area-inset-bottom)); border-radius: 24px 24px 0 0; }
  .camera-preview { aspect-ratio: 3 / 4; }
  .switch-camera-btn { top: 11px; right: 11px; min-height: 38px; padding: 0 12px; }
  .camera-actions { flex-direction: column-reverse; }
  .camera-cancel-btn, .capture-btn { width: 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .avatar-circle, .avatar-action, .btn-primary, .capture-circle span, .slider-round, .slider-round::before { transition: none; }
  .camera-loader, .switch-camera-btn svg.rotating { animation-duration: 1.4s; }
}
</style>