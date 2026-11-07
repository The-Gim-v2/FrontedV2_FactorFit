<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />
    <main class="reg-page">
      <div class="reg-layout">
        <!-- =====================================================
             PERFIL / FOTO
        ====================================================== -->
        <aside class="profile-card" id="tutorial-step-0">
          <span class="chip-label">{{ L('Nuevo integrante', 'New team member', 'Nouveau membre', 'Novo membro') }}</span>
          <h1 class="main-title">
            <template v-if="currentLang === 'en'">Register your <br><span class="highlight">Staff</span></template>
            <template v-else-if="currentLang === 'fr'">Enregistrez votre <br><span class="highlight">Personnel</span></template>
            <template v-else-if="currentLang === 'pt'">Registre sua <br><span class="highlight">Equipe</span></template>
            <template v-else>Registra a tu <br><span class="highlight">Personal</span></template>
          </h1>
          <div class="avatar-wrap">
            <div class="avatar-ring">
              <div class="avatar-circle" role="button" tabindex="0" :title="t('titleAvatarClick')"
                @click="openPhotoOptions" @keydown.enter="openPhotoOptions" @keydown.space.prevent="openPhotoOptions">
                <img v-if="avatarPreview" :src="avatarPreview" :alt="t('altEmployeePreview')" class="avatar-img" />
                <i v-else class="bi bi-person-fill avatar-default"></i>
                <div class="avatar-overlay">
                  <i class="bi bi-camera-fill"></i>
                  <span>{{ L('Cambiar foto', 'Change photo', 'Changer la photo', 'Alterar foto') }}</span>
                </div>
              </div>
            </div>
            <button type="button" class="avatar-action" @click="openPhotoOptions" :title="t('titleUploadPhoto')">
              <i class="bi bi-camera-fill"></i>
            </button>
            <input type="file" ref="fileInput" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="handleFileChange" />
          </div>
          <p class="profile-hint">{{ t('hintEmployeePhoto') }}</p>
          <ul class="profile-summary">
            <li class="summary-row">
              <span class="summary-ico"><i class="bi bi-person"></i></span>
              <span class="summary-body">
                <span class="summary-label">{{ L('Personal', 'Staff member', 'Employé', 'Funcionário') }}</span>
                <strong class="summary-value" :class="{ empty: !staffName }">{{ staffName || L('Nuevo integrante', 'New team member', 'Nouveau membre', 'Novo membro') }}</strong>
              </span>
            </li>
            <li class="summary-row">
              <span class="summary-ico"><i class="bi bi-shield-check"></i></span>
              <span class="summary-body">
                <span class="summary-label">{{ t('systemRole') }}</span>
                <strong class="summary-value" :class="{ empty: !form.rol }">
                  <span v-if="form.rol" class="plan-chip">{{ roleLabel }}</span>
                  <template v-else>—</template>
                </strong>
              </span>
            </li>
            <li class="summary-row">
              <span class="summary-ico"><i class="bi bi-geo-alt"></i></span>
              <span class="summary-body">
                <span class="summary-label">{{ t('allowedLocations') }}</span>
                <strong class="summary-value" :class="{ empty: sedesSummary.empty }">{{ sedesSummary.text }}</strong>
              </span>
            </li>
            <li class="summary-row">
              <span class="summary-ico ok"><i class="bi bi-clock"></i></span>
              <span class="summary-body">
                <span class="summary-label">{{ t('workSchedule') }}</span>
                <strong class="summary-value" :class="{ empty: scheduleSummary.empty }">{{ scheduleSummary.text }}</strong>
              </span>
            </li>
          </ul>
        </aside>
        <!-- =====================================================
             FORMULARIOS
        ====================================================== -->
        <div class="forms-col">
          <!-- CREDENCIALES Y ROL -->
          <section class="card credentials-card" id="tutorial-step-1">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-shield-lock"></i></span>
              <div class="grow">
                <h3 class="card-title">{{ t('credentialsAndRole') }}</h3>
                <p class="card-desc">{{ L('Elige el rol y los datos de acceso al sistema.', 'Choose the role and the system access details.', 'Choisissez le rôle et les accès au système.', 'Escolha a função e os dados de acesso ao sistema.') }}</p>
              </div>
            </header>
            <div class="stack">
              <!-- ROL -->
              <div class="field">
                <label id="rol-label">{{ t('systemRole') }} <span class="req">*</span></label>
                <div class="role-grid" role="radiogroup" aria-labelledby="rol-label">
                  <button v-for="r in roleOptions" :key="r.value" type="button" role="radio" class="role-tile"
                    :class="{ active: form.rol === r.value }" :aria-checked="form.rol === r.value" @click="form.rol = r.value">
                    <span class="role-icon"><i class="bi" :class="r.icon"></i></span>
                    <span class="role-text"><strong>{{ r.label }}</strong><small>{{ r.hint }}</small></span>
                    <span class="role-check"><i class="bi bi-check-lg"></i></span>
                  </button>
                </div>
              </div>
              <div class="grid grid-2">
                <!-- CORREO -->
                <div class="field">
                  <label for="staff-email">{{ t('email') }} <span class="req">*</span></label>
                  <div class="control has-icon">
                    <i class="bi bi-envelope control-icon"></i>
                    <input id="staff-email" type="email" v-model="form.email" @blur="normalizarCorreo" placeholder="correo@ejemplo.com" autocomplete="email" />
                  </div>
                </div>
                <!-- ESPECIALIDAD -->
                <div v-if="isTrainer" class="field">
                  <label for="staff-specialty">{{ t('specialty') }} <span class="req">*</span></label>
                  <div class="control has-icon">
                    <i class="bi bi-trophy control-icon"></i>
                    <input id="staff-specialty" type="text" v-model="form.especialidad" :placeholder="t('placeholderSpecialty')" />
                  </div>
                </div>
              </div>
              <!-- CONTRASEÑAS -->
              <div v-if="needsPassword" class="grid grid-2">
                <div class="field">
                  <label for="staff-pass">{{ t('password') }} <span class="req">*</span></label>
                  <div class="control has-icon has-action">
                    <i class="bi bi-lock control-icon"></i>
                    <input id="staff-pass" :type="verPass ? 'text' : 'password'" v-model="form.password" placeholder="••••••••" autocomplete="new-password" />
                    <button type="button" class="control-action" :aria-label="verPass ? L('Ocultar contraseña', 'Hide password', 'Masquer', 'Ocultar senha') : L('Mostrar contraseña', 'Show password', 'Afficher', 'Mostrar senha')" @click="verPass = !verPass">
                      <i class="bi" :class="verPass ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="field">
                  <label for="staff-pass2">{{ t('confirmPassword') }} <span class="req">*</span></label>
                  <div class="control has-icon has-action" :class="{ ok: passwordsMatch }">
                    <i class="bi control-icon" :class="passwordsMatch ? 'bi-check2-circle' : 'bi-lock-fill'"></i>
                    <input id="staff-pass2" :type="verPass ? 'text' : 'password'" v-model="form.confirmPassword" placeholder="••••••••" autocomplete="new-password" />
                    <button type="button" class="control-action" :aria-label="verPass ? L('Ocultar contraseña', 'Hide password', 'Masquer', 'Ocultar senha') : L('Mostrar contraseña', 'Show password', 'Afficher', 'Mostrar senha')" @click="verPass = !verPass">
                      <i class="bi" :class="verPass ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>
              <!-- SEDES -->
              <div class="field">
                <label id="sedes-label">
                  {{ t('allowedLocations') }}
                  <span v-if="form.rol && !isOwner" class="req">*</span>
                </label>
                <!-- PROPIETARIO: todas las sucursales -->
                <div v-if="isOwner" class="sedes-static">
                  <span class="sedes-static-icon"><i class="bi bi-buildings"></i></span>
                  <span class="sedes-static-text">
                    <strong>{{ L('Todas las sucursales', 'All locations', 'Tous les sites', 'Todas as unidades') }}</strong>
                    <small>{{ listaSedes.length }} {{ L('sedes, incluidas las futuras', 'locations, including future ones', 'sites, y compris les futurs', 'unidades, incluindo as futuras') }}</small>
                  </span>
                  <i class="bi bi-lock sedes-static-lock"></i>
                </div>
                <!-- OTROS ROLES -->
                <div v-else class="ff-select" :class="{ open: isDropdownOpen }" ref="dropdownRef">
                  <button type="button" class="ff-trigger" :disabled="!form.rol" aria-haspopup="listbox" aria-labelledby="sedes-label"
                    :aria-expanded="isDropdownOpen" @click="toggleDropdown" @keydown.esc="isDropdownOpen = false">
                    <span class="ff-trigger-icon"><i class="bi bi-geo-alt"></i></span>
                    <span class="ff-trigger-value" :class="{ placeholder: form.sedes.length === 0 }">
                      <strong v-if="form.sedes.length">{{ getSedesDisplayText() }}</strong>
                      <template v-else>{{ getSedesDisplayText() }}</template>
                    </span>
                    <i class="bi bi-chevron-down ff-chevron"></i>
                  </button>
                  <transition name="dd">
                    <ul v-if="isDropdownOpen" class="ff-menu" role="listbox" aria-labelledby="sedes-label" :aria-multiselectable="!isReception">
                      <li v-if="multiSedes" role="option" class="select-all" :class="{ selected: allSedesSelected }" :aria-selected="allSedesSelected" @click="toggleAllSedes">
                        <span class="opt-box"><i v-if="allSedesSelected" class="bi bi-check-lg"></i></span>
                        <span class="opt-name">{{ L('Todas las sedes', 'All locations', 'Tous les sites', 'Todas as unidades') }}</span>
                      </li>
                      <li v-if="sedesCargando && !listaSedes.length" class="ff-empty"><i class="bi bi-arrow-repeat spin"></i> Cargando sucursales...</li>
                      <li v-else-if="!listaSedes.length" class="ff-empty"><i class="bi bi-inbox"></i> No hay sucursales disponibles</li>
                      <li v-for="sede in listaSedes" :key="sede.id" role="option" :class="{ selected: form.sedes.includes(sede.id) }"
                        :aria-selected="form.sedes.includes(sede.id)" @click="toggleSede(sede.id)">
                        <span class="opt-box" :class="{ radio: isReception }">
                          <i v-if="form.sedes.includes(sede.id) && !isReception" class="bi bi-check-lg"></i>
                          <span v-else-if="form.sedes.includes(sede.id) && isReception" class="radio-dot"></span>
                        </span>
                        <span class="opt-name">{{ sede.nombre }}</span>
                      </li>
                    </ul>
                  </transition>
                </div>
                <p v-if="sedesHint" class="field-hint"><i class="bi bi-info-circle"></i>{{ sedesHint }}</p>
              </div>
            </div>
          </section>
          <!-- DATOS PERSONALES -->
          <section class="card" id="tutorial-step-2">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-person-vcard"></i></span>
              <div class="grow">
                <h3 class="card-title">{{ L('Datos personales', 'Personal data', 'Données personnelles', 'Dados pessoais') }}</h3>
                <p class="card-desc">{{ L('Información básica del integrante.', 'Basic information about the team member.', 'Informations de base du membre.', 'Informações básicas do integrante.') }}</p>
              </div>
            </header>
            <div class="stack">
              <div class="grid grid-3">
                <div class="field">
                  <label for="staff-nombres">{{ t('names') }} <span class="req">*</span></label>
                  <input id="staff-nombres" type="text" v-model="form.nombres" @input="normalizarCampo('nombres')" :placeholder="t('placeholderName')" autocomplete="given-name" />
                </div>
                <div class="field">
                  <label for="staff-ap">{{ t('lastNameP') }} <span class="req">*</span></label>
                  <input id="staff-ap" type="text" v-model="form.apellidoP" @input="normalizarCampo('apellidoP')" :placeholder="t('placeholderLastNameP')" autocomplete="family-name" />
                </div>
                <div class="field">
                  <label for="staff-am">{{ t('lastNameM') }}</label>
                  <input id="staff-am" type="text" v-model="form.apellidoM" @input="normalizarCampo('apellidoM')" :placeholder="t('placeholderLastNameM')" />
                </div>
              </div>
              <div class="grid grid-2">
                <div class="field">
                  <label for="staff-nac">{{ t('birthDate') }}</label>
                  <div class="control has-icon">
                    <i class="bi bi-calendar-event control-icon"></i>
                    <input id="staff-nac" type="date" v-model="form.fechaNacimiento" />
                  </div>
                </div>
                <div class="field">
                  <label for="staff-cel">{{ t('cellphone') }} <span class="req">*</span></label>
                  <div class="control has-icon">
                    <i class="bi bi-telephone control-icon"></i>
                    <input id="staff-cel" type="tel" :value="form.celular" @input="onCelularInput" @paste="onCelularPaste"
                      placeholder="481 111 1231" inputmode="numeric" autocomplete="tel-national" maxlength="12" aria-describedby="staff-cell-hint" />
                  </div>
                  <small id="staff-cell-hint" class="field-hint">10 dígitos, sin +52. Ejemplo: 481 111 1231.</small>
                </div>
              </div>
              <div class="field">
                <label for="staff-curp">
                  {{ t('curp') }}
                  <span class="badge opt">{{ L('OPCIONAL', 'OPTIONAL', 'FACULTATIF', 'OPCIONAL') }}</span>
                </label>
                <div class="control has-icon" :class="{ ok: form.curp && curpValidation.valid, bad: form.curp && !curpValidation.valid }">
                  <i class="bi control-icon" :class="!form.curp ? 'bi-person-badge' : curpValidation.valid ? 'bi-patch-check' : 'bi-exclamation-octagon'"></i>
                  <input id="staff-curp" type="text" v-model="form.curp" @input="form.curp = $event.target.value.toUpperCase()"
                    placeholder="Ej. ABCD010101HDF000" maxlength="18" autocomplete="off" autocapitalize="characters" class="uppercase"
                    :aria-invalid="!!form.curp && !curpValidation.valid" aria-describedby="curp-validation-message" />
                </div>
                <a class="curp-lookup" href="https://www.gob.mx/curp/" target="_blank" rel="noopener noreferrer">{{ L('¿No conoces tu CURP? Consúltala aquí', 'Don’t know your CURP? Look it up', 'Consulter la CURP', 'Consultar CURP') }}</a>
                <p v-if="form.curp" id="curp-validation-message" class="note" :class="curpValidation.valid ? 'ok' : 'bad'" aria-live="polite">
                  <i class="bi" :class="curpValidation.valid ? 'bi-check-circle' : 'bi-x-circle'"></i>
                  <span>{{ curpValidation.valid ? 'CURP válida en formato y dígito verificador' : curpValidation.message }}</span>
                </p>
              </div>
            </div>
          </section>
          <!-- REDES SOCIALES (solo entrenador) -->
          <section v-if="isTrainer" class="card">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-share"></i></span>
              <div class="grow">
                <h3 class="card-title">{{ L('Redes sociales', 'Social networks', 'Réseaux sociaux', 'Redes sociais') }}</h3>
                <p class="card-desc">{{ L('Para que los miembros encuentren al entrenador.', 'So members can find the trainer.', 'Pour que les membres trouvent l’entraîneur.', 'Para que os membros encontrem o treinador.') }}</p>
              </div>
              <span class="badge opt">{{ L('OPCIONAL', 'OPTIONAL', 'FACULTATIF', 'OPCIONAL') }}</span>
            </header>
            <div class="grid grid-2">
              <div class="field">
                <label for="staff-fb">{{ t('facebook') }}</label>
                <div class="control has-icon"><i class="bi bi-facebook control-icon"></i><input id="staff-fb" type="text" v-model="form.facebook" placeholder="usuario_fb" /></div>
              </div>
              <div class="field">
                <label for="staff-ig">{{ t('instagram') }}</label>
                <div class="control has-icon"><i class="bi bi-instagram control-icon"></i><input id="staff-ig" type="text" v-model="form.instagram" placeholder="@usuario_ig" /></div>
              </div>
              <div class="field">
                <label for="staff-tt">{{ t('tiktok') }}</label>
                <div class="control has-icon"><i class="bi bi-tiktok control-icon"></i><input id="staff-tt" type="text" v-model="form.tiktok" placeholder="@usuario_tt" /></div>
              </div>
              <div class="field">
                <label for="staff-otras">{{ t('otherApps') }}</label>
                <div class="control has-icon"><i class="bi bi-link-45deg control-icon"></i><input id="staff-otras" type="text" v-model="form.otrasApps" :placeholder="t('placeholderOtherApps')" /></div>
              </div>
            </div>
          </section>
          <!-- HORARIO DE TRABAJO
               Recepción: obligatorio · Entrenador: opcional · Propietario / Gerente: no aplica -->
          <section class="card" id="tutorial-step-3">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-clock-history"></i></span>
              <div class="grow">
                <h3 class="card-title">{{ t('workSchedule') }}</h3>
                <p class="card-desc">{{ L('Hora de entrada y salida del integrante.', 'Check-in and check-out time for the team member.', 'Heure d’arrivée et de départ.', 'Horário de entrada e saída.') }}</p>
              </div>
              <span v-if="scheduleMode === 'required'" class="badge required">{{ L('OBLIGATORIO', 'REQUIRED', 'OBLIGATOIRE', 'OBRIGATÓRIO') }}</span>
              <span v-else-if="scheduleMode === 'optional'" class="badge opt">{{ L('OPCIONAL', 'OPTIONAL', 'FACULTATIF', 'OPCIONAL') }}</span>
            </header>
            <p v-if="scheduleMode === 'idle' || scheduleMode === 'none'" class="note info">
              <i class="bi bi-info-circle"></i><span>{{ scheduleNote }}</span>
            </p>
            <div v-else class="stack">
              <label v-if="scheduleMode === 'optional'" class="switch-row">
                <span class="switch">
                  <input type="checkbox" v-model="form.tieneHorario" />
                  <span class="switch-track"></span>
                </span>
                <span class="switch-copy">
                  <strong>{{ L('Asignar horario de trabajo', 'Assign work schedule', 'Attribuer un horaire de travail', 'Atribuir horário de trabalho') }}</strong>
                  <small>{{ L('Actívalo solo si este entrenador tiene un horario fijo.', 'Turn it on only if this trainer has a fixed schedule.', 'Activez-le uniquement si cet entraîneur a un horaire fixe.', 'Ative apenas se este treinador tiver horário fixo.') }}</small>
                </span>
              </label>
              <div v-if="showTimes" class="grid grid-2">
                <div class="field">
                  <label for="staff-entrada">{{ t('entryTime') }} <span v-if="scheduleMode === 'required'" class="req">*</span></label>
                  <div class="control has-icon">
                    <i class="bi bi-box-arrow-in-right control-icon"></i>
                    <input id="staff-entrada" type="time" v-model="form.horaEntrada" />
                  </div>
                </div>
                <div class="field">
                  <label for="staff-salida">{{ t('exitTime') }} <span v-if="scheduleMode === 'required'" class="req">*</span></label>
                  <div class="control has-icon">
                    <i class="bi bi-box-arrow-right control-icon"></i>
                    <input id="staff-salida" type="time" v-model="form.horaSalida" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- REGISTRAR -->
          <div class="reg-footer">
            <div class="req-hint"><span class="req">*</span> {{ L('Campos obligatorios', 'Required fields', 'Champs obligatoires', 'Campos obrigatórios') }}</div>
            <div class="footer-actions">
              <button type="button" class="btn btn-primary save-btn" :disabled="guardando" @click="saveRegistration">
                <i class="bi" :class="guardando ? 'bi-arrow-repeat spin' : 'bi-person-plus'"></i>
                {{ guardando ? L('Guardando...', 'Saving...', 'Enregistrement...', 'Salvando...') : t('finishButtonStaff') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- =====================================================
         CÁMARA O GALERÍA
    ====================================================== -->
    <transition name="photo-menu">
      <div v-if="showPhotoOptions" class="overlay sheet" @click.self="closePhotoOptions">
        <div class="dialog photo-dialog">
          <div class="sheet-handle"></div>
          <div class="dialog-head">
            <div>
              <span class="eyebrow">{{ L('FOTO DE PERFIL', 'PROFILE PHOTO', 'PHOTO DE PROFIL', 'FOTO DE PERFIL') }}</span>
              <h3>{{ L('Agregar foto del personal', 'Add staff photo', 'Ajouter la photo', 'Adicionar foto') }}</h3>
              <p>{{ L('Selecciona cómo quieres agregar la imagen.', 'Choose how you want to add the image.', 'Choisissez comment ajouter l’image.', 'Escolha como adicionar a imagem.') }}</p>
            </div>
            <button type="button" class="dialog-x" @click="closePhotoOptions" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="photo-options">
            <button type="button" class="photo-option" @click="takePhoto">
              <span class="photo-option-icon"><i class="bi bi-camera"></i></span>
              <span class="photo-option-text">
                <strong>{{ L('Tomar foto', 'Take photo', 'Prendre une photo', 'Tirar foto') }}</strong>
                <small>{{ L('Abrir la cámara del dispositivo', 'Open your device camera', 'Ouvrir la caméra', 'Abrir a câmera') }}</small>
              </span>
              <i class="bi bi-chevron-right"></i>
            </button>
            <button type="button" class="photo-option" @click="selectPhoto">
              <span class="photo-option-icon"><i class="bi bi-images"></i></span>
              <span class="photo-option-text">
                <strong>{{ L('Subir desde galería', 'Choose image', 'Choisir une image', 'Escolher imagem') }}</strong>
                <small>{{ L('Seleccionar una imagen existente', 'Select an existing image', 'Sélectionner une image existante', 'Selecionar uma imagem existente') }}</small>
              </span>
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <button type="button" class="btn btn-ghost block" @click="closePhotoOptions">{{ L('Cancelar', 'Cancel', 'Annuler', 'Cancelar') }}</button>
        </div>
      </div>
    </transition>
    <transition name="photo-menu">
      <div v-if="showCamera" class="overlay sheet dark" @click.self="closeCamera">
        <div class="dialog camera-dialog">
          <div class="dialog-head">
            <div>
              <span class="eyebrow">{{ L('CÁMARA', 'CAMERA', 'CAMÉRA', 'CÂMERA') }}</span>
              <h3>{{ L('Tomar foto del personal', 'Take staff photo', 'Photo de l’employé', 'Foto do funcionário') }}</h3>
              <p>{{ cameraFacingMode === 'user' ? L('Cámara frontal', 'Front camera', 'Caméra avant', 'Câmera frontal') : L('Cámara trasera', 'Rear camera', 'Caméra arrière', 'Câmera traseira') }}</p>
            </div>
            <button type="button" class="dialog-x" @click="closeCamera" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="camera-preview">
            <video ref="videoRef" autoplay playsinline muted :class="{ mirrored: cameraFacingMode === 'user' }"></video>
            <button type="button" class="switch-camera" :disabled="switchingCamera" @click.stop="switchCamera">
              <i class="bi bi-arrow-repeat" :class="{ spin: switchingCamera }"></i>
              <span>{{ cameraFacingMode === 'user' ? L('Trasera', 'Rear', 'Arrière', 'Traseira') : L('Frontal', 'Front', 'Avant', 'Frontal') }}</span>
            </button>
            <div class="camera-guide"><div class="face-guide"></div></div>
            <div v-if="switchingCamera" class="camera-switching"><span class="loader"></span></div>
          </div>
          <canvas ref="canvasRef" class="hidden-canvas"></canvas>
          <div class="camera-actions">
            <button type="button" class="btn btn-ghost" @click="closeCamera">{{ L('Cancelar', 'Cancel', 'Annuler', 'Cancelar') }}</button>
            <button type="button" class="capture-btn" :disabled="switchingCamera" @click="capturePhoto">
              <span class="capture-circle"><span></span></span>
              {{ L('Tomar foto', 'Take photo', 'Prendre une photo', 'Tirar foto') }}
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
/* Normalización visible de nombres, CURP y correo; validación al guardar. */
const nombreTitulo = (valor) => String(valor ?? '').toLocaleLowerCase('es-MX').replace(/(^|[\s'-])([\p{L}])/gu, (_, sep, letra) => sep + letra.toLocaleUpperCase('es-MX'));
const correoNormal = (valor) => String(valor ?? '').trim().toLowerCase();
const validarCorreo = (valor) => { const correo = correoNormal(valor); if (!/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(correo)) return false; const partes = correo.split('@'); const dominio = partes[1]; const errores = ['gmail.con','gmial.com','gmal.com','gmai.com','gmail.co','gmail.comm','hotmail.con','hotmial.com','hotmail.co','outlook.con','outlok.com','yahoo.con','yaho.com','icloud.con']; if (errores.includes(dominio)) return false; const tld = dominio.split('.').at(-1); return tld.length >= 2 && tld.length <= 24; };
const normalizarCampo = (clave) => { form[clave] = nombreTitulo(form[clave]); };
const normalizarCorreo = () => { form.email = correoNormal(form.email); };
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
const verPass = ref(false);
const guardando = ref(false);
const passwordsMatch = computed(() => !!form.password && form.password === form.confirmPassword);
const staffName = computed(() =>
  [form.nombres, form.apellidoP, form.apellidoM].filter(Boolean).join(' ')
);
const roleOptions = computed(() => [
  {
    value: 'GYM_ADMIN',
    icon: 'bi-award',
    label: L('Propietario', 'Owner', 'Propriétaire', 'Proprietário'),
    hint: L('Todas las sedes · sin horario', 'All locations · no schedule', 'Tous les sites · sans horaire', 'Todas as unidades · sem horário')
  },
  {
    value: 'GYM_MANAGER',
    icon: 'bi-briefcase',
    label: L('Gerente', 'Manager', 'Gérant', 'Gerente'),
    hint: L('Una, varias o todas las sedes', 'One, several or all locations', 'Un, plusieurs ou tous les sites', 'Uma, várias ou todas as unidades')
  },
  {
    value: 'GYM_COACH',
    icon: 'bi-trophy',
    label: t('roleTrainer'),
    hint: L('Varias sedes · horario opcional', 'Several locations · optional schedule', 'Plusieurs sites · horaire facultatif', 'Várias unidades · horário opcional')
  },
  {
    value: 'GYM_RECEPCIONIST',
    icon: 'bi-headset',
    label: t('roleReception'),
    hint: L('Una sola sede · horario obligatorio', 'One location · required schedule', 'Un seul site · horaire obligatoire', 'Uma unidade · horário obrigatório')
  }
]);
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
  const n = form.sedes.length;
  return {
    text: L(
      `${n} ${n === 1 ? 'sede' : 'sedes'}`,
      `${n} ${n === 1 ? 'location' : 'locations'}`,
      `${n} ${n === 1 ? 'site' : 'sites'}`,
      `${n} ${n === 1 ? 'unidade' : 'unidades'}`
    ),
    empty: false
  };
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
  if (form.email.trim() && !validarCorreo(form.email)) return warn('Revisa el correo electrónico y su dominio (ej. gmail.com, hotmail.com, outlook.com).');
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
  if (guardando.value) return;
  if (!validateForm()) {
    return;
  }
  guardando.value = true;
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
        correoNormal(form.email),
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
        nombreTitulo(form.nombres.trim()),
      apellidoP:
        nombreTitulo(form.apellidoP.trim()),
      apellidoM:
        nombreTitulo(form.apellidoM.trim()),
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
  } finally {
    guardando.value = false;
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
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
* { box-sizing: border-box; }
i.bi { display: inline-block; line-height: 1; }
.hidden-input, .hidden-canvas { display: none; }
/* =========================================================
   BASE
========================================================= */
.reg-page,
.overlay {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #14161c);
  --text: var(--color-texto-general, #e5e7eb);
  --title: var(--color-titulos, #ffffff);
  --button: var(--color-botones, #2563eb);
  --button-text: var(--color-texto-botones, #ffffff);
  --muted: color-mix(in srgb, var(--text) 66%, transparent);
  --muted-2: color-mix(in srgb, var(--text) 44%, transparent);
  --line: color-mix(in srgb, var(--text) 11%, transparent);
  --line-strong: color-mix(in srgb, var(--text) 20%, transparent);
  --input-bg: color-mix(in srgb, var(--card) 84%, black);
  --radius: var(--app-border-radius, 16px);
  --ok: #34d399;
  --ok-text: #6ee7b7;
  --bad: #f87171;
  --warn: #fbbf24;
  --warn-text: #fcd34d;
}
.reg-page {
  width: 100%;
  padding: 34px clamp(14px, 3vw, 40px) 60px;
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.reg-layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 24px; width: 100%; max-width: 1200px; margin: 0 auto; align-items: start; }
.highlight { color: var(--accent); }
.req { color: var(--accent); }
/* =========================================================
   PERFIL
========================================================= */
.profile-card {
  position: sticky; top: 16px; min-width: 0; overflow: hidden; padding: 32px 22px 22px; text-align: center;
  border: 1px solid var(--line); border-radius: var(--radius); background: var(--card);
}
.profile-card::before { content: ''; position: absolute; inset: 0 0 auto; height: 200px; pointer-events: none; background: radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 75%); }
.profile-card > * { position: relative; }
.chip-label { display: inline-block; margin-bottom: 12px; padding: 4px 12px; color: var(--accent); font-size: 0.68rem; font-weight: 600; border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--accent) 10%, transparent); }
.main-title { margin: 0 0 24px; color: var(--title); font-family: 'Anton', sans-serif; font-size: 1.85rem; font-weight: 400; line-height: 1.08; letter-spacing: 0.4px; text-transform: uppercase; }
.avatar-wrap { position: relative; width: 140px; margin: 0 auto 14px; }
.avatar-ring { padding: 4px; border-radius: 50%; background: conic-gradient(from 210deg, var(--button), var(--accent), var(--button)); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4); }
.avatar-circle { position: relative; width: 132px; height: 132px; display: grid; place-items: center; overflow: hidden; cursor: pointer; outline: none; border: 4px solid var(--card); border-radius: 50%; background: var(--input-bg); }
.avatar-default { color: #fff; font-size: 3.4rem; opacity: 0.45; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; color: #fff; font-size: 0.64rem; font-weight: 600; background: rgba(0, 0, 0, 0.58); opacity: 0; transition: opacity 0.2s ease; }
.avatar-overlay i { font-size: 1.3rem; }
.avatar-circle:hover .avatar-overlay, .avatar-circle:focus-visible .avatar-overlay { opacity: 1; }
.avatar-circle:focus-visible { box-shadow: 0 0 0 3px var(--accent); }
.avatar-action { position: absolute; z-index: 3; right: 2px; bottom: 4px; width: 38px; height: 38px; display: grid; place-items: center; padding: 0; cursor: pointer; color: #fff; font-size: 0.95rem; border: 3px solid var(--card); border-radius: 50%; background: var(--accent); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35); transition: transform 0.2s ease, filter 0.2s ease; }
.avatar-action:hover { transform: scale(1.08); filter: brightness(1.08); }
.profile-hint { max-width: 230px; margin: 0 auto; color: var(--muted); font-size: 0.76rem; line-height: 1.5; }
.profile-summary { display: grid; gap: 0; margin: 24px 0 0; padding: 6px; list-style: none; text-align: left; border: 1px solid var(--line); border-radius: 16px; background: color-mix(in srgb, var(--text) 2.5%, transparent); }
.summary-row { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 11px 10px; }
.summary-row + .summary-row { border-top: 1px solid var(--line); }
.summary-ico { width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 0.95rem; border-radius: 10px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
.summary-ico.ok { color: var(--ok); background: rgba(52, 211, 153, 0.12); }
.summary-body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.summary-label { color: var(--muted); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; }
.summary-value { min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; overflow: hidden; color: var(--title); font-size: 0.92rem; font-weight: 600; line-height: 1.25; text-overflow: ellipsis; overflow-wrap: anywhere; }
.summary-value.empty { color: var(--muted-2); font-weight: 500; }
.plan-chip { display: inline-block; padding: 3px 11px; color: var(--accent); font-size: 0.8rem; border-radius: 999px; background: color-mix(in srgb, var(--accent) 16%, transparent); }
/* =========================================================
   TARJETAS
========================================================= */
.forms-col { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.card { position: relative; min-width: 0; padding: 26px 28px 28px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); }
.credentials-card { z-index: 2; }
.card-head { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.card-head .grow { flex: 1; min-width: 0; }
.card-icon { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1.2rem; border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent); border-radius: 12px; background: color-mix(in srgb, var(--accent) 10%, transparent); }
.card-title { margin: 0; color: var(--title); font-family: 'Anton', sans-serif; font-size: 1.15rem; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase; }
.card-desc { margin: 3px 0 0; color: var(--muted); font-size: 0.78rem; line-height: 1.4; }
.stack { display: flex; flex-direction: column; gap: 20px; }
.grid { display: grid; gap: 18px; }
.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
/* =========================================================
   CAMPOS
========================================================= */
.field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.field > label { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--muted); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.01em; }
input:where(:not([type='radio']):not([type='file']):not([type='checkbox'])) {
  width: 100%; height: 48px; min-width: 0; padding: 0 14px; outline: none;
  color: var(--color-texto-input, var(--text)); color-scheme: dark; font-family: 'Inter', sans-serif; font-size: 0.9rem;
  border: 1.5px solid var(--line-strong); border-radius: 12px; background: var(--input-bg);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
input::placeholder { color: var(--muted-2); }
input:not([type='radio']):not([type='checkbox']):hover { border-color: color-mix(in srgb, var(--text) 32%, transparent); }
input:not([type='radio']):not([type='checkbox']):focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
input.uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
.control { position: relative; display: flex; align-items: center; min-width: 0; }
.control-icon { position: absolute; left: 14px; z-index: 2; color: var(--muted-2); font-size: 0.95rem; pointer-events: none; transition: color 0.18s ease; }
.control.has-icon input { padding-left: 42px; }
.control:focus-within .control-icon { color: var(--accent); }
.control.has-action input { padding-right: 46px; }
.control-action { position: absolute; z-index: 2; right: 6px; width: 36px; height: 36px; display: grid; place-items: center; padding: 0; cursor: pointer; color: var(--muted); font-size: 1rem; border: 0; border-radius: 9px; background: transparent; transition: color 0.16s ease, background 0.16s ease; }
.control-action:hover { color: var(--text); background: color-mix(in srgb, var(--text) 8%, transparent); }
.control.ok .control-icon { color: var(--ok); }
.control.ok input:not(:focus) { border-color: color-mix(in srgb, var(--ok) 45%, var(--line-strong)); }
.control.bad .control-icon { color: var(--bad); }
.control.bad input:not(:focus) { border-color: color-mix(in srgb, var(--bad) 55%, var(--line-strong)); }
.badge { padding: 2px 8px; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.6px; border-radius: 999px; }
.badge.opt { color: var(--muted); background: color-mix(in srgb, var(--text) 9%, transparent); }
.badge.required { color: var(--warn-text); background: rgba(251, 191, 36, 0.12); }
.card-head > .badge { flex-shrink: 0; }
.field-hint { display: flex; align-items: flex-start; gap: 7px; margin: 0; color: var(--muted-2); font-size: 0.74rem; line-height: 1.45; }
.field-hint i { flex-shrink: 0; margin-top: 1px; }
.note { display: flex; align-items: flex-start; gap: 9px; margin: 0; font-size: 0.78rem; line-height: 1.5; }
.note i { flex-shrink: 0; margin-top: 2px; }
.note.info { padding: 12px 14px; color: var(--muted); border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 6%, transparent); }
.note.info i { color: var(--accent); }
.note.ok { color: var(--ok-text); }
.note.bad { color: #fca5a5; }
/* =========================================================
   ROL (tarjetas seleccionables)
========================================================= */
.role-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.role-tile { position: relative; min-width: 0; min-height: 76px; display: flex; align-items: center; gap: 14px; padding: 13px 16px; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; border: 1.5px solid var(--line-strong); border-radius: 14px; background: var(--input-bg); transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
.role-tile:hover { border-color: color-mix(in srgb, var(--accent) 55%, var(--line-strong)); transform: translateY(-1px); }
.role-tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.role-tile.active { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--input-bg)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.role-icon { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; color: var(--muted); font-size: 1.25rem; border-radius: 12px; background: color-mix(in srgb, var(--text) 7%, transparent); transition: all 0.18s ease; }
.role-tile.active .role-icon { color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, transparent); }
.role-text { min-width: 0; flex: 1; display: grid; gap: 3px; }
.role-text strong { color: var(--title); font-size: 0.92rem; font-weight: 700; line-height: 1.2; }
.role-text small { color: var(--muted); font-size: 0.72rem; line-height: 1.35; }
.role-check { position: absolute; top: 9px; right: 9px; width: 18px; height: 18px; display: grid; place-items: center; color: var(--card); font-size: 0.7rem; border-radius: 50%; background: var(--accent); opacity: 0; transform: scale(0.6); transition: opacity 0.18s ease, transform 0.18s ease; }
.role-tile.active .role-check { opacity: 1; transform: scale(1); }
/* =========================================================
   SEDES
========================================================= */
.sedes-static { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1.5px dashed color-mix(in srgb, var(--ok) 40%, var(--line-strong)); border-radius: 14px; background: color-mix(in srgb, var(--ok) 6%, var(--input-bg)); }
.sedes-static-icon { width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; color: var(--ok); font-size: 1.15rem; border-radius: 11px; background: rgba(52, 211, 153, 0.13); }
.sedes-static-text { min-width: 0; flex: 1; display: grid; gap: 2px; }
.sedes-static-text strong { color: var(--title); font-size: 0.9rem; font-weight: 700; }
.sedes-static-text small { color: var(--muted); font-size: 0.76rem; }
.sedes-static-lock { color: var(--muted-2); font-size: 1rem; }
.ff-select { position: relative; }
.ff-select.open { z-index: 60; }
.ff-trigger { width: 100%; min-height: 56px; display: flex; align-items: center; gap: 12px; padding: 0 16px 0 10px; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; font-size: 0.9rem; border: 1.5px solid var(--line-strong); border-radius: 14px; background: var(--input-bg); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.ff-trigger:hover:not(:disabled) { border-color: color-mix(in srgb, var(--accent) 55%, transparent); }
.ff-trigger:disabled { cursor: not-allowed; opacity: 0.6; }
.ff-select.open .ff-trigger, .ff-trigger:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); }
.ff-trigger-icon { width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1rem; border-radius: 10px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
.ff-trigger-value { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ff-trigger-value.placeholder { color: var(--muted-2); }
.ff-trigger-value strong { min-width: 0; overflow: hidden; color: var(--title); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.ff-chevron { flex-shrink: 0; color: var(--muted); font-size: 0.85rem; transition: transform 0.2s ease; }
.ff-select.open .ff-chevron { transform: rotate(180deg); }
.ff-menu { position: absolute; z-index: 70; top: calc(100% + 8px); left: 0; right: 0; max-height: 280px; margin: 0; padding: 6px; overflow-y: auto; list-style: none; border: 1px solid var(--line-strong); border-radius: 14px; background: var(--card); box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55); scrollbar-width: thin; }
.ff-menu li { display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer; color: var(--text); font-size: 0.88rem; font-weight: 500; border-radius: 10px; transition: background 0.14s ease; }
.ff-menu li + li { margin-top: 2px; }
.ff-menu li:hover { background: color-mix(in srgb, var(--accent) 13%, transparent); }
.ff-menu li.selected { color: var(--title); background: color-mix(in srgb, var(--accent) 18%, transparent); }
.ff-menu li.select-all { margin-bottom: 4px; font-weight: 700; border-bottom: 1px solid var(--line); border-radius: 10px 10px 4px 4px; }
.ff-menu li.ff-empty { justify-content: center; gap: 8px; padding: 18px 12px; color: var(--muted); font-size: 0.8rem; cursor: default; }
.ff-menu li.ff-empty:hover { background: transparent; }
.opt-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.opt-box { width: 22px; height: 22px; flex-shrink: 0; display: grid; place-items: center; color: var(--button-text); font-size: 0.85rem; border: 2px solid var(--line-strong); border-radius: 7px; transition: all 0.16s ease; }
.opt-box.radio { border-radius: 50%; }
.ff-menu li.selected .opt-box { border-color: var(--accent); background: var(--accent); }
.ff-menu li.selected .opt-box.radio { background: transparent; }
.radio-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
.dd-enter-active, .dd-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.dd-enter-from, .dd-leave-to { opacity: 0; transform: translateY(-6px); }
/* =========================================================
   INTERRUPTOR (horario opcional)
========================================================= */
.switch-row { display: flex; align-items: center; gap: 16px; padding: 14px 16px; cursor: pointer; border: 1.5px solid var(--line-strong); border-radius: 14px; background: var(--input-bg); transition: border-color 0.18s ease, background 0.18s ease; }
.switch-row:hover { border-color: color-mix(in srgb, var(--accent) 55%, transparent); }
.switch-row:has(input:checked) { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--input-bg)); }
.switch { position: relative; flex-shrink: 0; }
.switch input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; }
.switch-track { position: relative; display: block; width: 48px; height: 28px; border: 1px solid var(--line-strong); border-radius: 999px; background: color-mix(in srgb, var(--text) 14%, transparent); transition: background 0.2s ease, border-color 0.2s ease; }
.switch-track::before { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); transition: transform 0.2s ease; }
.switch input:checked + .switch-track { border-color: transparent; background: var(--accent); }
.switch input:checked + .switch-track::before { transform: translateX(20px); }
.switch input:focus-visible + .switch-track { outline: 2px solid var(--accent); outline-offset: 2px; }
.switch-copy { min-width: 0; display: grid; gap: 3px; }
.switch-copy strong { color: var(--title); font-size: 0.9rem; font-weight: 700; }
.switch-copy small { color: var(--muted); font-size: 0.76rem; line-height: 1.4; }
/* =========================================================
   BOTONES
========================================================= */
.btn { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 20px; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: 'Inter', sans-serif; font-size: 0.86rem; font-weight: 700; border: 1px solid transparent; border-radius: 12px; transition: filter 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease; }
.btn i { font-size: 1rem; }
.btn.block { width: 100%; }
.btn-primary { color: var(--button-text); background: linear-gradient(135deg, var(--button), color-mix(in srgb, var(--button) 76%, black)); box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--button) 65%, transparent); }
.btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-primary:disabled { cursor: wait; opacity: 0.55; box-shadow: none; }
.btn-ghost { color: var(--muted); border-color: var(--line-strong); background: transparent; }
.btn-ghost:hover { color: var(--text); border-color: var(--text); }
.btn:focus-visible, .control-action:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.reg-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 2px 0; }
.req-hint { color: var(--muted); font-size: 0.78rem; font-weight: 500; }
.footer-actions { display: flex; align-items: center; gap: 12px; }
.save-btn { min-width: 250px; min-height: 52px; font-family: 'Oswald', sans-serif; font-size: 0.98rem; letter-spacing: 0.3px; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* =========================================================
   DIÁLOGOS (foto y cámara)
========================================================= */
.overlay { position: fixed; z-index: 3500; inset: 0; display: grid; place-items: center; padding: 18px; background: rgba(0, 0, 0, 0.78); backdrop-filter: blur(5px); }
.overlay.dark { background: rgba(0, 0, 0, 0.9); }
.dialog { position: relative; width: min(440px, 100%); max-height: 94vh; overflow-y: auto; padding: 30px 24px 24px; color: var(--text); border: 1px solid var(--line-strong); border-radius: 22px; background: var(--card); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55); font-family: 'Inter', sans-serif; }
.dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; text-align: left; }
.eyebrow { display: block; margin-bottom: 5px; color: var(--accent); font-size: 0.62rem; font-weight: 700; letter-spacing: 1px; }
.dialog-head h3 { margin: 0; color: var(--title); font-family: 'Anton', sans-serif; font-size: 1.25rem; font-weight: 400; text-transform: uppercase; }
.dialog-head p { margin: 5px 0 0; color: var(--muted); font-size: 0.76rem; line-height: 1.5; }
.dialog-x { width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center; cursor: pointer; color: var(--text); border: 1px solid var(--line); border-radius: 10px; background: rgba(255, 255, 255, 0.04); }
.dialog-x:hover { border-color: var(--line-strong); }
.sheet-handle { display: none; }
.photo-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.photo-option { width: 100%; min-height: 72px; display: flex; align-items: center; gap: 14px; padding: 12px 14px; cursor: pointer; text-align: left; color: var(--muted); font-family: inherit; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 2.5%, transparent); transition: border-color 0.16s ease, background 0.16s ease; }
.photo-option:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent); }
.photo-option-icon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1.25rem; border-radius: 12px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
.photo-option-text { flex: 1; min-width: 0; }
.photo-option-text strong { display: block; color: var(--title); font-size: 0.88rem; font-weight: 600; }
.photo-option-text small { display: block; margin-top: 3px; color: var(--muted); font-size: 0.72rem; }
.camera-dialog { width: min(620px, 100%); }
.camera-preview { position: relative; width: 100%; aspect-ratio: 4 / 3; overflow: hidden; border: 1px solid var(--line); border-radius: 18px; background: #000; }
.camera-preview video { width: 100%; height: 100%; display: block; object-fit: cover; }
.camera-preview video.mirrored { transform: scaleX(-1); }
.camera-guide { position: absolute; z-index: 2; inset: 0; display: grid; place-items: center; pointer-events: none; }
.face-guide { width: 47%; height: 70%; border: 2px dashed rgba(255, 255, 255, 0.45); border-radius: 50%; }
.switch-camera { position: absolute; z-index: 10; top: 14px; right: 14px; min-height: 38px; display: flex; align-items: center; gap: 7px; padding: 0 13px; cursor: pointer; color: #fff; font: 600 0.72rem 'Inter', sans-serif; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; background: rgba(0, 0, 0, 0.62); }
.switch-camera:hover { background: rgba(0, 0, 0, 0.8); }
.switch-camera:disabled { cursor: wait; opacity: 0.65; }
.camera-switching { position: absolute; z-index: 8; inset: 0; display: grid; place-items: center; background: rgba(0, 0, 0, 0.28); pointer-events: none; }
.loader { width: 38px; height: 38px; border: 3px solid rgba(255, 255, 255, 0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
.camera-actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 18px; }
.capture-btn { display: flex; align-items: center; gap: 10px; padding: 8px 20px 8px 8px; cursor: pointer; color: var(--button-text); font: 700 0.8rem 'Inter', sans-serif; border: 0; border-radius: 999px; background: var(--button); }
.capture-btn:disabled { cursor: wait; opacity: 0.6; }
.capture-circle { width: 38px; height: 38px; display: grid; place-items: center; border: 2px solid #fff; border-radius: 50%; }
.capture-circle span { width: 27px; height: 27px; display: block; border-radius: 50%; background: #fff; transition: transform 0.15s ease; }
.capture-btn:hover:not(:disabled) .capture-circle span { transform: scale(0.85); }
.photo-menu-enter-active, .photo-menu-leave-active { transition: opacity 0.2s ease; }
.photo-menu-enter-active .dialog, .photo-menu-leave-active .dialog { transition: opacity 0.2s ease, transform 0.22s ease; }
.photo-menu-enter-from, .photo-menu-leave-to { opacity: 0; }
.photo-menu-enter-from .dialog, .photo-menu-leave-to .dialog { opacity: 0; transform: translateY(10px) scale(0.97); }
/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1050px) {
  .reg-layout { grid-template-columns: 260px minmax(0, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 850px) {
  .reg-layout { grid-template-columns: minmax(0, 1fr); }
  .profile-card { position: relative; top: 0; max-width: 460px; width: 100%; margin: 0 auto; }
}
@media (max-width: 650px) {
  .reg-page { padding: 14px 12px calc(34px + env(safe-area-inset-bottom, 0px)); }
  .card { padding: 20px 16px 22px; }
  .card-head { flex-wrap: wrap; }
  .card-head .grow { flex-basis: calc(100% - 70px); }
  .card-head > .badge { margin-left: 58px; }
  .grid-3, .grid-2, .role-grid { grid-template-columns: minmax(0, 1fr); }
  input:where(:not([type='radio']):not([type='file']):not([type='checkbox'])) { font-size: 1rem; } /* evita el zoom de iOS */
  .reg-footer { flex-direction: column-reverse; align-items: stretch; }
  .footer-actions { flex-direction: column-reverse; align-items: stretch; }
  .save-btn { min-width: 0; width: 100%; }
  .switch-row { align-items: flex-start; }
  .overlay.sheet { align-items: end; padding: 0; }
  .overlay.sheet .dialog { width: 100%; max-width: none; padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0px)); border-radius: 22px 22px 0 0; }
  .sheet-handle { display: block; width: 38px; height: 4px; margin: 0 auto 16px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); }
  .camera-preview { aspect-ratio: 3 / 4; }
  .camera-actions { flex-direction: column-reverse; }
  .camera-actions .btn, .capture-btn { width: 100%; justify-content: center; }
}
@media (max-width: 420px) {
  .profile-card { padding: 28px 16px 20px; }
  .main-title { font-size: 1.6rem; }
  .switch-camera span { display: none; }
  .switch-camera { width: 40px; height: 40px; padding: 0; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
.curp-lookup{display:inline-flex;margin-top:7px;font-size:12px;color:var(--color-highlight,#60a5fa);text-decoration:underline;text-underline-offset:3px}
</style>