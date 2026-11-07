<template>
  <div class="activity-wrapper">
    <div class="activity-panel">
      <!-- ================= HEADER ================= -->
      <header class="panel-header">
        <div class="header-left">
          <div class="calendar-icon">
            <svg viewBox="0 0 24 24">
              <path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/>
              <path d="M7 13h3v3H7z"/>
            </svg>
          </div>
          <div>
            <span class="header-kicker">{{ t('agendaKicker') }}</span>
            <h2>
              {{ isEdit ? t('editTitle') : t('newTitle') }}
              <span>{{ isEdit ? t('editHighlight') : t('newHighlight') }}</span>
            </h2>
            <p>
              {{ isEdit ? t('editSubtitle') : t('newSubtitle') }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="close-btn"
          @click="$emit('close')"
          :title="t('closeTooltip')"
          :aria-label="t('closeTooltip')"
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6 6 18"/>
          </svg>
        </button>
      </header>

      <form class="activity-form" @submit.prevent="guardarActividad">
        <!-- ================= DÍA ================= -->
        <section class="form-section">
          <div class="section-title">
            <div class="section-number">01</div>
            <div>
              <h3>{{ t('daySectionTitle') }}</h3>
              <p>{{ t('daySectionDescription') }}</p>
            </div>
          </div>

          <div class="day-picker">
            <!-- Fecha -->
            <div class="field date-field">
              <label for="act-date">{{ t('eventDateLabel') }}</label>
              <div class="input-control">
                <div class="field-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/>
                  </svg>
                </div>
                <input
                  id="act-date"
                  v-model="form.fecha"
                  type="date"
                  :min="todayLocal"
                  :disabled="isEdit && isPastEvent"
                  required
                  class="date-input"
                >
              </div>
            </div>

            <!-- Día de la semana (compacto) -->
            <div class="field weekday-field">
              <span class="field-title">{{ t('weekdayLabel') }}</span>
              <div class="days-grid" role="group" :aria-label="t('weekdayLabel')">
                <button
                  v-for="(day, index) in currentDays"
                  :key="day"
                  type="button"
                  class="day-card"
                  :class="{ active: form.dia === daysEs[index] }"
                  :title="day"
                  :aria-label="day"
                  :aria-pressed="form.dia === daysEs[index]"
                  @click="selectDay(index)"
                  :disabled="isPastEvent"
                >
                  <span>{{ shortDay(day) }}</span>
                  <strong>{{ day }}</strong>
                </button>
              </div>
            </div>
          </div>

          <small v-if="isPastEvent" class="field-error">{{ t('pastEventLocked') }}</small>
        </section>

        <!-- ================= INFORMACIÓN ================= -->
        <section class="form-section">
          <div class="section-title">
            <div class="section-number">02</div>
            <div>
              <h3>{{ t('infoSectionTitle') }}</h3>
              <p>{{ t('infoSectionDescription') }}</p>
            </div>
          </div>

          <div class="fields-grid">
            <div class="field field-large">
              <label for="act-name">
                {{ t('activityNameLabel') }}
              </label>
              <div class="input-control">
                <div class="field-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                  </svg>
                </div>
                <input
                  id="act-name"
                  v-model="form.nombre"
                  type="text"
                  :placeholder="t('activityNamePlaceholder')"
                  required
                >
              </div>
            </div>

            <div class="field">
              <label for="act-cat">
                {{ t('categoryLabel') }}
              </label>
              <div class="select-control">
                <span
                  class="category-dot"
                  :style="{ background: selectedCategoryColor }"
                ></span>
                <select
                  id="act-cat"
                  v-model="form.categoria"
                  @change="customCategory = ''"
                  class="category-select"
                  :required="!customCategory.trim()"
                  :disabled="isPastEvent"
                >
                  <option disabled value="">
                    {{ t('selectCategoryPlaceholder') }}
                  </option>
                  <optgroup
                    v-for="group in categoryGroups"
                    :key="group.key"
                    :label="groupLabel(group)"
                  >
                    <option
                      v-for="cat in group.items"
                      :key="cat.key"
                      :value="cat.key"
                    >
                      {{ catLabel(cat.key) }}
                    </option>
                  </optgroup>
                  <option v-for="cat in customCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <svg class="select-arrow" viewBox="0 0 24 24">
                  <path d="m7 10 5 5 5-5"/>
                </svg>
              </div>
              <div class="custom-category">
                <label for="custom-cat">{{ t('customCategoryLabel') }}</label>
                <div class="input-control">
                  <div class="field-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  <input
                    id="custom-cat"
                    v-model.trim="customCategory"
                    maxlength="60"
                    :placeholder="t('customCategoryPlaceholder')"
                    @input="onCustomCategory"
                    :disabled="isPastEvent"
                  />
                </div>
              </div>
            </div>

            <div class="field">
              <label for="act-level">
                {{ t('levelLabel') }}
              </label>
              <div class="select-control">
                <select
                  id="act-level"
                  v-model="form.nivel"
                  required
                >
                  <option disabled value="">
                    {{ t('selectLevelPlaceholder') }}
                  </option>
                  <option value="Principiante">
                    {{ t('levelBeginner') }}
                  </option>
                  <option value="Intermedio">
                    {{ t('levelIntermediate') }}
                  </option>
                  <option value="Avanzado">
                    {{ t('levelAdvanced') }}
                  </option>
                </select>
                <svg class="select-arrow" viewBox="0 0 24 24">
                  <path d="m7 10 5 5 5-5"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- ================= HORARIO ================= -->
        <section class="form-section schedule-section">
          <div class="section-title">
            <div class="section-number">03</div>
            <div>
              <h3>{{ t('scheduleSectionTitle') }}</h3>
              <p>{{ t('scheduleSectionDescription') }}</p>
            </div>
          </div>

          <div class="schedule-card">
            <div class="schedule-time">
              <div class="time-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
              </div>
              <div class="time-field">
                <label for="act-start">
                  {{ t('startTimeLabel') }}
                </label>
                <input
                  id="act-start"
                  v-model="form.inicio"
                  type="time"
                  required
                >
              </div>
            </div>

            <div class="time-connector">
              <span></span>
              <strong
                :class="{ invalid: durationText === t('invalidSchedule') }"
              >
                {{ durationText }}
              </strong>
              <span></span>
            </div>

            <div class="schedule-time">
              <div class="time-icon end">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
              </div>
              <div class="time-field">
                <label for="act-end">
                  {{ t('endTimeLabel') }}
                </label>
                <input
                  id="act-end"
                  v-model="form.fin"
                  type="time"
                  required
                >
              </div>
            </div>
          </div>
        </section>

        <!-- ================= RESPONSABLE ================= -->
        <section class="form-section">
          <div class="section-title">
            <div class="section-number">04</div>
            <div>
              <h3>{{ t('instructorSectionTitle') }}</h3>
              <p>{{ t('instructorSectionDescription') }}</p>
            </div>
          </div>

          <div class="fields-grid two-columns">
            <div class="field">
              <label for="act-instructor">
                {{ t('instructorLabel') }}
              </label>
              <div class="input-control">
                <div class="field-icon">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 21a8 8 0 0 1 16 0"/>
                  </svg>
                </div>
                <input
                  id="act-instructor"
                  v-model="form.instructor"
                  type="text"
                  :placeholder="t('instructorPlaceholder')"
                  required
                >
              </div>
            </div>

            <div class="field">
              <label for="act-capacity">
                {{ t('capacityLabel') }}
              </label>
              <div class="input-control">
                <div class="field-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <input
                  id="act-capacity"
                  v-model.number="form.capacidad"
                  type="number"
                  min="1"
                  step="1"
                  :placeholder="t('capacityPlaceholder')"
                  required
                >
              </div>
            </div>
          </div>
        </section>

        <!-- ================= UBICACIÓN ================= -->
        <section class="form-section">
          <div class="section-title">
            <div class="section-number">05</div>
            <div>
              <h3>{{ t('locationSectionTitle') }}</h3>
              <p>{{ t('locationSectionDescription') }}</p>
            </div>
          </div>

          <div class="fields-grid">
            <div class="field field-large">
              <label for="act-location">
                {{ t('locationLabel') }}
              </label>
              <div class="input-control">
                <div class="field-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
                    <circle cx="12" cy="10" r="2.5"/>
                  </svg>
                </div>
                <input
                  id="act-location"
                  v-model="form.ubicacion"
                  type="text"
                  :placeholder="t('locationPlaceholder')"
                >
              </div>
            </div>

            <div class="field field-large">
              <label for="act-notes">
                {{ t('descriptionLabel') }}
              </label>
              <textarea
                id="act-notes"
                v-model="form.descripcion"
                :placeholder="t('descriptionPlaceholder')"
                rows="3"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- ================= MULTIMEDIA ================= -->
        <section class="form-section">
          <div class="section-title">
            <div class="section-number">06</div>
            <div>
              <h3>{{ t('mediaTitle') }}</h3>
              <p>{{ t('mediaHint') }}</p>
            </div>
          </div>

          <div class="fields-grid">
            <!-- Fotografías -->
            <div class="field">
              <span class="field-title">{{ t('imagesLabel') }}</span>
              <div class="upload">
                <label
                  class="dropzone"
                  :class="{ disabled: isPastEvent, filled: pendingImages.length }"
                  for="act-images"
                >
                  <span class="drop-icon">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="m21 15-5-5L5 21"/>
                    </svg>
                  </span>
                  <span class="drop-text">
                    <strong>{{ pendingImages.length ? t('changeFiles') : t('imagesChoose') }}</strong>
                    <small>{{ t('imagesLimit') }}</small>
                  </span>
                </label>
                <input
                  id="act-images"
                  ref="imagesInput"
                  class="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  :disabled="isPastEvent"
                  @change="selectImages"
                />

                <ul v-if="pendingImages.length" class="file-list">
                  <li v-for="(file, i) in pendingImages" :key="file.name + i" class="file-chip">
                    <img class="file-thumb" :src="pendingPreviews[i]" :alt="file.name">
                    <span class="file-info">
                      <strong>{{ file.name }}</strong>
                      <small>{{ formatSize(file.size) }}</small>
                    </span>
                    <button
                      type="button"
                      class="file-remove"
                      :title="t('removeFile')"
                      :aria-label="t('removeFile')"
                      @click="removeImage(i)"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M6 6l12 12M18 6 6 18"/>
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Video -->
            <div class="field">
              <span class="field-title">{{ t('videoLabel') }}</span>
              <div class="upload">
                <label
                  class="dropzone"
                  :class="{ disabled: isPastEvent, filled: pendingVideo }"
                  for="act-video"
                >
                  <span class="drop-icon">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="6" width="14" height="12" rx="2"/>
                      <path d="m22 8-6 4 6 4V8Z"/>
                    </svg>
                  </span>
                  <span class="drop-text">
                    <strong>{{ pendingVideo ? t('changeFiles') : t('videoChoose') }}</strong>
                    <small>{{ t('videoLimit') }}</small>
                  </span>
                </label>
                <input
                  id="act-video"
                  ref="videoInput"
                  class="sr-only"
                  type="file"
                  accept="video/mp4,video/webm"
                  :disabled="isPastEvent"
                  @change="selectVideo"
                />

                <ul v-if="pendingVideo" class="file-list">
                  <li class="file-chip">
                    <span class="file-thumb file-thumb-icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="6" width="14" height="12" rx="2"/>
                        <path d="m22 8-6 4 6 4V8Z"/>
                      </svg>
                    </span>
                    <span class="file-info">
                      <strong>{{ pendingVideo.name }}</strong>
                      <small>{{ formatSize(pendingVideo.size) }}</small>
                    </span>
                    <button
                      type="button"
                      class="file-remove"
                      :title="t('removeFile')"
                      :aria-label="t('removeFile')"
                      @click="removeVideo"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M6 6l12 12M18 6 6 18"/>
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Archivos ya guardados -->
          <div v-if="form.imagenes.length" class="saved-media">
            <span class="field-title">{{ t('currentImages') }}</span>
            <div class="media-previews">
              <a
                v-for="(url, i) in form.imagenes"
                :key="url"
                :href="url"
                target="_blank"
                rel="noopener"
                class="media-thumb"
                :title="t('imageLabel') + ' ' + (i + 1)"
              >
                <img :src="url" :alt="t('imageLabel') + ' ' + (i + 1)" loading="lazy">
              </a>
            </div>
          </div>
          <a v-if="form.video_url" :href="form.video_url" target="_blank" rel="noopener" class="video-link">
            <svg viewBox="0 0 24 24">
              <rect x="2" y="6" width="14" height="12" rx="2"/>
              <path d="m22 8-6 4 6 4V8Z"/>
            </svg>
            {{ t('viewVideo') }}
          </a>
        </section>

        <!-- ================= RESUMEN ================= -->
        <div class="event-summary">
          <div
            class="summary-color"
            :style="{ background: selectedCategoryColor }"
          ></div>
          <div class="summary-icon">
            <svg viewBox="0 0 24 24">
              <path d="M6 2v3M18 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/>
            </svg>
          </div>
          <div class="summary-content">
            <span>{{ t('previewTitle') }}</span>
            <strong>
              {{ form.nombre || t('previewActivityPlaceholder') }}
            </strong>
            <p>
              {{ selectedDayDisplay || t('previewDayPlaceholder') }}
              <template v-if="form.inicio">
                · {{ formatTime(form.inicio) }}
              </template>
              <template v-if="form.fin">
                — {{ formatTime(form.fin) }}
              </template>
              <template v-if="form.instructor">
                · {{ form.instructor }}
              </template>
            </p>
          </div>
          <div
            v-if="form.categoria"
            class="summary-category"
          >
            <i :style="{ background: selectedCategoryColor }"></i>
            {{ catLabel(form.categoria) }}
          </div>
        </div>

        <!-- ================= FOOTER ================= -->
        <footer class="form-footer">
          <button
            type="button"
            class="cancel-btn"
            @click="$emit('close')"
          >
            {{ t('cancelBtn') }}
          </button>
          <button
            type="submit"
            class="save-btn"
            :disabled="enviando || isPastEvent"
          >
            <svg
              v-if="isEdit"
              viewBox="0 0 24 24"
            >
              <path d="m5 12 4 4L19 6"/>
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {{ isEdit ? t('saveChangesBtn') : t('saveActivityBtn') }}
          </button>
        </footer>
      </form>
    </div>

    <!-- ================= TOAST ================= -->
    <transition name="toast">
      <div
        v-if="toast.show"
        :class="['toast-message', toast.type]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <div class="toast-icon">
          <svg
            v-if="toast.type === 'success'"
            viewBox="0 0 24 24"
          >
            <path d="m5 12 4 4L19 6"/>
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 17h.01"/>
          </svg>
        </div>
        <div>
          <strong>
            {{
              toast.type === 'success'
                ? (isEdit ? t('toastUpdatedTitle') : t('toastSavedTitle'))
                : t('errorTitle')
            }}
          </strong>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { categoryGroups, categoryColor, categoryLabel } from './scheduleCategories.ts';

const props = defineProps({
  initialData: { type: Object, default: null },
  validator: { type: Function, default: null },
  customCategories: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'save']);
const enviando = ref(false);

/* ==================== IDIOMA ==================== */
const settings = reactive({
  idioma: (localStorage.getItem('GYM_ACCOUNT-idioma') || localStorage.getItem('owner-idioma')) || 'es'
});

const normalizeLanguage = (value) => String(value || '').toLowerCase().startsWith('en') ? 'en' : 'es';

const syncLanguage = () => {
  settings.idioma = normalizeLanguage((localStorage.getItem('GYM_ACCOUNT-idioma') || localStorage.getItem('owner-idioma')) || 'es');
};

const handleLanguageChange = (event) => {
  const nextLanguage = normalizeLanguage(
    event.detail?.idioma ||
    (localStorage.getItem('GYM_ACCOUNT-idioma') || localStorage.getItem('owner-idioma')) ||
    'es'
  );
  settings.idioma = nextLanguage;
  localStorage.setItem('GYM_ACCOUNT-idioma', nextLanguage);
};

const catLabel = (key) => categoryLabel(key, settings.idioma);
const groupLabel = (group) => settings.idioma === 'en' ? group.en : group.es;

/* ==================== TRADUCCIONES ==================== */
const translations = {
  es: {
    eventDateLabel: 'Fecha exacta del evento',
    weekdayLabel: 'Día de la semana',
    pastEventLocked: 'Este evento ya pasó y no puede modificarse.',
    customCategoryLabel: 'O escribe una nueva categoría',
    customCategoryPlaceholder: 'Ej. Torneo de fuerza',
    mediaTitle: 'Imágenes y videos',
    mediaHint: 'Archivos opcionales del evento, alojados en R2.',
    imagesLabel: 'Fotografías',
    imagesLimit: 'Hasta 3 fotos, máximo 3 MB por foto.',
    imagesChoose: 'Elegir fotografías',
    videoLabel: 'Video',
    videoLimit: 'MP4 o WEBM, máximo 15 MB.',
    videoChoose: 'Elegir video',
    changeFiles: 'Cambiar selección',
    removeFile: 'Quitar archivo',
    currentImages: 'Imágenes actuales',
    imageLabel: 'Imagen',
    viewVideo: 'Ver video',
    pastDateError: 'No puedes agendar ni modificar eventos pasados.',
    agendaKicker: 'AGENDA DE EVENTOS',
    newTitle: 'Nueva',
    newHighlight: 'Evento',
    newSubtitle: 'Programa un evento dentro del calendario del gimnasio.',
    editTitle: 'Editar',
    editHighlight: 'Evento',
    editSubtitle: 'Modifica los datos del evento en el calendario.',
    closeTooltip: 'Cerrar',
    daySectionTitle: 'Selecciona el día',
    daySectionDescription: 'Indica cuándo aparecerá el evento en la agenda.',
    infoSectionTitle: 'Información del evento',
    infoSectionDescription: 'Define el tipo de evento y su nivel.',
    scheduleSectionTitle: 'Horario del evento',
    scheduleSectionDescription: 'Establece el bloque que ocupará dentro de la agenda.',
    instructorSectionTitle: 'Responsable y cupo',
    instructorSectionDescription: 'Define quién dirigirá el evento y el cupo disponible.',
    locationSectionTitle: 'Ubicación y notas',
    locationSectionDescription: 'Agrega información adicional para identificar el evento.',
    activityNameLabel: 'Nombre del evento',
    activityNamePlaceholder: 'Ej. Torneo de CrossFit',
    categoryLabel: 'Categoría',
    selectCategoryPlaceholder: 'Seleccionar categoría...',
    yoga: 'Yoga',
    spinning: 'Spinning',
    crossfit: 'CrossFit',
    boxing: 'Boxeo',
    pilates: 'Pilates',
    zumba: 'Zumba',
    levelLabel: 'Nivel',
    selectLevelPlaceholder: 'Seleccionar nivel...',
    levelBeginner: 'Principiante',
    levelIntermediate: 'Intermedio',
    levelAdvanced: 'Avanzado',
    instructorLabel: 'Responsable',
    instructorPlaceholder: 'Ej. Marisol Reyes',
    capacityLabel: 'Cupo',
    capacityPlaceholder: 'Ej. 20 personas',
    startTimeLabel: 'Hora de inicio',
    endTimeLabel: 'Hora de término',
    locationLabel: 'Ubicación / Aula',
    locationPlaceholder: 'Ej. Sala funcional A',
    descriptionLabel: 'Descripción / Notas',
    descriptionPlaceholder: 'Indicaciones, material requerido o información adicional...',
    previewTitle: 'VISTA PREVIA EN LA AGENDA',
    previewActivityPlaceholder: 'Nombre del evento',
    previewDayPlaceholder: 'Día sin seleccionar',
    cancelBtn: 'Cancelar',
    saveActivityBtn: 'Agendar evento',
    saveChangesBtn: 'Guardar cambios',
    invalidSchedule: 'Horario inválido',
    selectDayError: 'Selecciona el día del evento.',
    endTimeError: 'La hora de término debe ser posterior a la hora de inicio.',
    toastSavedTitle: 'Evento registrado',
    toastUpdatedTitle: 'Evento actualizado',
    errorTitle: 'Error',
    toastSaved: 'El evento fue agregado correctamente a la agenda.',
    toastUpdated: 'Los cambios del evento se guardaron correctamente.'
  },
  en: {
    eventDateLabel: 'Event date',
    weekdayLabel: 'Day of the week',
    pastEventLocked: 'This event is in the past and cannot be edited.',
    customCategoryLabel: 'Or write a new category',
    customCategoryPlaceholder: 'E.g. Strength competition',
    mediaTitle: 'Images and videos',
    mediaHint: 'Optional media hosted in R2.',
    imagesLabel: 'Photos',
    imagesLimit: 'Up to 3 photos, max 3 MB each.',
    imagesChoose: 'Choose photos',
    videoLabel: 'Video',
    videoLimit: 'MP4 or WEBM, max 15 MB.',
    videoChoose: 'Choose video',
    changeFiles: 'Change selection',
    removeFile: 'Remove file',
    currentImages: 'Current images',
    imageLabel: 'Image',
    viewVideo: 'View video',
    pastDateError: 'You cannot schedule or edit past events.',
    agendaKicker: 'EVENT SCHEDULE',
    newTitle: 'New',
    newHighlight: 'Event',
    newSubtitle: 'Schedule an event in the gym calendar.',
    editTitle: 'Edit',
    editHighlight: 'Event',
    editSubtitle: 'Modify the event information in the calendar.',
    closeTooltip: 'Close',
    daySectionTitle: 'Select the day',
    daySectionDescription: 'Choose when the event will appear in the schedule.',
    infoSectionTitle: 'Event information',
    infoSectionDescription: 'Define the event type and level.',
    scheduleSectionTitle: 'Event time',
    scheduleSectionDescription: 'Set the time block the class will occupy in the schedule.',
    instructorSectionTitle: 'Host and capacity',
    instructorSectionDescription: 'Define who will host the event and the available capacity.',
    locationSectionTitle: 'Location and notes',
    locationSectionDescription: 'Add additional information to identify the event.',
    activityNameLabel: 'Event Name',
    activityNamePlaceholder: 'E.g. CrossFit tournament',
    categoryLabel: 'Category',
    selectCategoryPlaceholder: 'Select category...',
    yoga: 'Yoga',
    spinning: 'Spinning',
    crossfit: 'CrossFit',
    boxing: 'Boxing',
    pilates: 'Pilates',
    zumba: 'Zumba',
    levelLabel: 'Level',
    selectLevelPlaceholder: 'Select level...',
    levelBeginner: 'Beginner',
    levelIntermediate: 'Intermediate',
    levelAdvanced: 'Advanced',
    instructorLabel: 'Host',
    instructorPlaceholder: 'E.g. Marisol Reyes',
    capacityLabel: 'Capacity',
    capacityPlaceholder: 'E.g. 20 people',
    startTimeLabel: 'Start time',
    endTimeLabel: 'End time',
    locationLabel: 'Location / Room',
    locationPlaceholder: 'E.g. Functional room A',
    descriptionLabel: 'Description / Notes',
    descriptionPlaceholder: 'Instructions, required equipment or additional information...',
    previewTitle: 'SCHEDULE PREVIEW',
    previewActivityPlaceholder: 'Event name',
    previewDayPlaceholder: 'No day selected',
    cancelBtn: 'Cancel',
    saveActivityBtn: 'Schedule event',
    saveChangesBtn: 'Save changes',
    invalidSchedule: 'Invalid schedule',
    selectDayError: 'Select the day of the event.',
    endTimeError: 'The end time must be later than the start time.',
    toastSavedTitle: 'Event scheduled',
    toastUpdatedTitle: 'Event updated',
    errorTitle: 'Error',
    toastSaved: 'The event was successfully added to the schedule.',
    toastUpdated: 'The event changes were saved successfully.'
  }
};

const t = (key) => translations[settings.idioma]?.[key] || translations.es[key] || key;

/* ==================== DÍAS ==================== */
const daysEs = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const currentDays = computed(() => settings.idioma === 'en' ? daysEn : daysEs);

const form = reactive({
  id: null,
  dia: '', fecha: '', imagenes: [], video_url: '',
  nombre: '',
  categoria: '',
  nivel: '',
  instructor: '',
  capacidad: null,
  inicio: '08:00',
  fin: '09:00',
  ubicacion: '',
  descripcion: ''
});

const todayLocal = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

const customCategory = ref('');
const pendingImages = ref([]);
const pendingPreviews = ref([]);
const pendingVideo = ref(null);
const imagesInput = ref(null);
const videoInput = ref(null);

const isPastEvent = computed(() => Boolean(form.fecha && form.fecha < todayLocal));

const selectDay = (index) => {
  if (isPastEvent.value) return;
  form.dia = daysEs[index];
  const d = new Date();
  const todayIndex = (d.getDay() + 6) % 7;
  const diff = (index - todayIndex + 7) % 7;
  d.setDate(d.getDate() + diff);
  form.fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const onCustomCategory = () => {
  if (customCategory.value) form.categoria = customCategory.value;
};

/* ==================== ARCHIVOS ==================== */
const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const revokePreviews = () => {
  pendingPreviews.value.forEach((url) => URL.revokeObjectURL(url));
  pendingPreviews.value = [];
};

const refreshPreviews = () => {
  revokePreviews();
  pendingPreviews.value = pendingImages.value.map((file) => URL.createObjectURL(file));
};

const selectImages = (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  if (files.length > 3 || files.some((f) => !['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 3 * 1024 * 1024)) {
    mostrarToast(settings.idioma === 'en' ? 'Max 3 photos of 3 MB each.' : 'Máximo 3 imágenes de 3 MB cada una.', 'error');
    event.target.value = '';
    return;
  }
  pendingImages.value = files;
  refreshPreviews();
};

const removeImage = (index) => {
  pendingImages.value = pendingImages.value.filter((_, i) => i !== index);
  refreshPreviews();
  if (imagesInput.value) imagesInput.value.value = '';
};

const selectVideo = (event) => {
  const file = event.target.files?.[0] || null;
  if (!file) return;
  if (!['video/mp4', 'video/webm'].includes(file.type) || file.size > 15 * 1024 * 1024) {
    mostrarToast(settings.idioma === 'en' ? 'MP4/WEBM up to 15 MB.' : 'MP4/WEBM máximo 15 MB.', 'error');
    event.target.value = '';
    return;
  }
  pendingVideo.value = file;
};

const removeVideo = () => {
  pendingVideo.value = null;
  if (videoInput.value) videoInput.value.value = '';
};

const toLocalDate = (date) => {
  const d = new Date(date + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? '' : daysEs[(d.getDay() + 6) % 7];
};

watch(() => form.fecha, (date) => {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) form.dia = toLocalDate(date);
});

const selectedDayDisplay = computed(() => {
  if (!form.dia) return '';
  const spanishIndex = daysEs.indexOf(form.dia);
  if (spanishIndex !== -1) return currentDays.value[spanishIndex];
  const englishIndex = daysEn.indexOf(form.dia);
  if (englishIndex !== -1) return currentDays.value[englishIndex];
  return form.dia;
});

const isEdit = computed(() => form.id !== null && form.id !== undefined);

const selectedCategoryColor = computed(() => {
  return categoryColor(form.categoria) || 'var(--color-highlight, #3b82f6)';
});

const durationText = computed(() => {
  if (!form.inicio || !form.fin) return '';
  const [startHour = 0, startMinute = 0] = form.inicio.split(':').map(Number);
  const [endHour = 0, endMinute = 0] = form.fin.split(':').map(Number);
  const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  if (minutes <= 0) return t('invalidSchedule');
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours} h ${remainingMinutes} min`;
  if (hours) return `${hours} h`;
  return `${remainingMinutes} min`;
});

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
});

const mostrarToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 2500);
};

const shortDay = (day) => day.substring(0, 3).toUpperCase();

const formatTime = (time) => {
  if (!time) return '';
  const [hours = '0', minutes = '0'] = time.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0);
  return date.toLocaleTimeString(
    settings.idioma === 'en' ? 'en-US' : 'es-MX',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
  );
};

watch(() => props.initialData, (d) => {
  Object.assign(form, { id: null, dia: '', fecha: '', imagenes: [], video_url: '', nombre: '', categoria: '', nivel: '', instructor: '', capacidad: null, inicio: '08:00', fin: '09:00', ubicacion: '', descripcion: '' });
  pendingImages.value = [];
  revokePreviews();
  pendingVideo.value = null;
  customCategory.value = '';
  if (!d) {
    form.fecha = todayLocal;
    form.dia = toLocalDate(todayLocal);
    return;
  }
  const dia = String(d.dia ?? d.day ?? '').trim();
  const ix = daysEn.findIndex(x => x.toLowerCase() === dia.toLowerCase());
  form.id = d.id ?? null;
  form.fecha = String(d.fecha || d.fecha_evento || '');
  form.imagenes = Array.isArray(d.imagenes) ? d.imagenes : [];
  form.video_url = String(d.video_url || '');
  form.dia = ix >= 0 ? daysEs[ix] : dia;
  form.nombre = String(d.nombre ?? '');
  form.categoria = String(d.categoria ?? '');
  if (form.categoria && !categoryGroups.some(g => g.items.some(c => c.key === form.categoria))) customCategory.value = form.categoria;
  form.nivel = String(d.nivel ?? '');
  form.instructor = String(d.instructor ?? '');
  form.capacidad = d.capacidad ?? null;
  form.inicio = String(d.inicio ?? d.hour ?? '08:00').slice(0, 5);
  form.fin = String(d.fin ?? '09:00').slice(0, 5);
  form.ubicacion = String(d.ubicacion ?? '');
  form.descripcion = String(d.descripcion ?? '');
}, { immediate: true });

const guardarActividad = () => {
  if (enviando.value) return;
  if (isPastEvent.value || (form.fecha && form.fecha < todayLocal)) return mostrarToast(t('pastDateError'), 'error');
  if (!form.fecha) return mostrarToast(settings.idioma === 'en' ? 'Select an event date.' : 'Selecciona la fecha del evento.', 'error');

  const data = {
    ...form,
    dia: String(form.dia).trim(),
    nombre: String(form.nombre).trim(),
    categoria: String(form.categoria).trim(),
    nivel: String(form.nivel).trim(),
    instructor: String(form.instructor).trim(),
    capacidad: Number(form.capacidad),
    inicio: String(form.inicio).slice(0, 5),
    fin: String(form.fin).slice(0, 5),
    ubicacion: String(form.ubicacion ?? '').trim(),
    descripcion: String(form.descripcion ?? '').trim(),
    color: selectedCategoryColor.value,
    fecha: form.fecha,
    imagenes: form.imagenes,
    video_url: form.video_url,
    imagesFiles: pendingImages.value,
    videoFile: pendingVideo.value
  };
  if (customCategory.value) data.categoria = customCategory.value.trim();

  if (!daysEs.includes(data.dia)) return mostrarToast(t('selectDayError'), 'error');
  if (!data.nombre || !data.categoria || !['Principiante', 'Intermedio', 'Avanzado', 'Todos'].includes(data.nivel) || !data.instructor || !Number.isInteger(data.capacidad) || data.capacidad < 1 || data.capacidad > 10000) return mostrarToast(settings.idioma === 'en' ? 'Complete all required fields correctly.' : 'Completa correctamente todos los campos obligatorios.', 'error');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.inicio) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.fin) || data.inicio >= data.fin) return mostrarToast(t('endTimeError'), 'error');
  if (data.nombre.length > 150 || data.categoria.length > 60 || data.instructor.length > 150 || data.ubicacion.length > 180 || data.descripcion.length > 2000) return mostrarToast(settings.idioma === 'en' ? 'A field exceeds the allowed length.' : 'Uno de los campos excede la longitud permitida.', 'error');

  const error = typeof props.validator === 'function' ? props.validator(data) : null;
  if (error) return mostrarToast(String(error), 'error');

  // Solo emitir; el padre espera POST/PUT de Laravel y cierra el modal cuando confirma.
  enviando.value = true;
  try { emit('save', data); } finally { enviando.value = false; }
};

onMounted(() => {
  syncLanguage();
  window.addEventListener('idioma-changed', handleLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLanguageChange);
  revokePreviews();
});
</script>

<style scoped>
@import url('https\://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button, input, select, textarea { font: inherit; }

.activity-wrapper {
  --hl: var(--color-highlight, #3b82f6);
  --hl-soft: rgba(59,130,246,.1);
  --hl-line: rgba(59,130,246,.45);
  --text: var(--color-texto-general, #f5f5f4);
  --card: var(--bg-cards, #111);
  --title: var(--color-titulos, #fff);
  --field: rgba(0,0,0,.28);
  --field-focus: rgba(0,0,0,.36);
  --card-glass: rgba(17,17,17,.96);
  --w3: rgba(255,255,255,.03);
  --w4: rgba(255,255,255,.04);
  --w5: rgba(255,255,255,.05);
  --w6: rgba(255,255,255,.06);
  --w8: rgba(255,255,255,.08);
  --w10: rgba(255,255,255,.10);
  --w14: rgba(255,255,255,.14);
  --w18: rgba(255,255,255,.18);
  --w25: rgba(255,255,255,.25);
  --w35: rgba(255,255,255,.35);
  --w50: rgba(255,255,255,.50);
  --w65: rgba(255,255,255,.65);
  --w85: rgba(255,255,255,.85);
  --line: var(--w8);
  --line-strong: var(--w14);
  --text-2: rgba(245,245,244,.66);
  --text-3: rgba(245,245,244,.42);
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  color: var(--color-texto-general, #f5f5f4);
  -webkit-font-smoothing: antialiased;
}

@supports (background: color-mix(in srgb, red 10%, transparent)) {
  .activity-wrapper {
    --hl-soft: color-mix(in srgb, var(--hl) 11%, transparent);
    --hl-line: color-mix(in srgb, var(--hl) 50%, transparent);
    --field: color-mix(in srgb, var(--card) 72%, #000);
    --field-focus: color-mix(in srgb, var(--card) 62%, #000);
    --card-glass: color-mix(in srgb, var(--card) 94%, transparent);
    --text-2: color-mix(in srgb, var(--text) 68%, transparent);
    --text-3: color-mix(in srgb, var(--text) 45%, transparent);
    --w3: color-mix(in srgb, var(--text) 3%, transparent);
    --w4: color-mix(in srgb, var(--text) 4%, transparent);
    --w5: color-mix(in srgb, var(--text) 5%, transparent);
    --w6: color-mix(in srgb, var(--text) 6%, transparent);
    --w8: color-mix(in srgb, var(--text) 8%, transparent);
    --w10: color-mix(in srgb, var(--text) 10%, transparent);
    --w14: color-mix(in srgb, var(--text) 14%, transparent);
    --w18: color-mix(in srgb, var(--text) 18%, transparent);
    --w25: color-mix(in srgb, var(--text) 25%, transparent);
    --w35: color-mix(in srgb, var(--text) 35%, transparent);
    --w50: color-mix(in srgb, var(--text) 50%, transparent);
    --w65: color-mix(in srgb, var(--text) 65%, transparent);
    --w85: color-mix(in srgb, var(--text) 85%, transparent);
  }
}

.activity-panel {
  width: min(840px, 95vw);
  max-height: 92vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 22px;
  box-shadow: 0 35px 100px rgba(0,0,0,.65);
  scrollbar-width: thin;
  scrollbar-color: var(--w14) transparent;
}
.activity-panel::-webkit-scrollbar { width: 6px; }
.activity-panel::-webkit-scrollbar-track { background: transparent; }
.activity-panel::-webkit-scrollbar-thumb { background: var(--w14); border-radius: 10px; }

/* ============ HEADER ============ */
.panel-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 20px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: var(--card-glass);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(16px);
}
.header-left { display: flex; align-items: center; gap: 15px; min-width: 0; }
.calendar-icon {
  width: 48px;
  height: 48px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 14px;
}
.calendar-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.header-kicker { display: block; margin-bottom: 3px; color: var(--text-3); font-size: 10.5px; font-weight: 800; letter-spacing: 1.3px; }
.panel-header h2 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 600; line-height: 1.1; text-transform: uppercase; }
.panel-header h2 span { color: var(--hl); }
.panel-header p { margin: 5px 0 0; color: var(--text-3); font-size: 13px; }
.close-btn {
  width: 40px;
  height: 40px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--w65);
  background: var(--w4);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: .2s ease;
}
.close-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.close-btn:hover { color: #f87171; background: rgba(239,68,68,.09); border-color: rgba(239,68,68,.3); }

/* ============ FORMULARIO ============ */
.activity-form { padding: 0 26px 26px; }
.form-section { padding: 26px 0; border-bottom: 1px solid var(--line); }
.section-title { margin-bottom: 18px; display: flex; align-items: center; gap: 13px; }
.section-number {
  width: 34px;
  height: 34px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.section-title h3 { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600; }
.section-title p { margin: 3px 0 0; color: var(--text-3); font-size: 12.5px; }

/* ============ DÍA (compacto: fecha + días en una fila) ============ */
.day-picker {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  align-items: end;
  gap: 16px;
}
.field-error { display: block; margin-top: 10px; color: #f87171; font-size: 12.5px; }

.days-grid {
  height: 50px;
  padding: 4px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
}
.day-card {
  position: relative;
  min-width: 0;
  padding: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-3);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  transition: background .2s ease, color .2s ease, border-color .2s ease, box-shadow .2s ease;
}
.day-card > span { font-size: 11.5px; font-weight: 800; letter-spacing: .6px; }
/* El nombre completo solo se muestra en pantallas pequeñas */
.day-card > strong { display: none; font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 500; }
.day-card:hover:not(:disabled):not(.active) { color: var(--title); background: var(--w5); }
.day-card.active {
  color: var(--color-texto-botones, #fff);
  background: var(--hl);
  border-color: var(--hl);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--hl) 35%, transparent);
}
.day-card:disabled { opacity: .45; cursor: not-allowed; }

/* ============ CAMPOS ============ */
.fields-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field-large { grid-column: 1 / -1; }
.field { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.field > label, .field-title, .time-field label, .custom-category > label {
  color: var(--text-2);
  font-family: 'Oswald', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .6px;
  text-transform: uppercase;
}
.input-control, .select-control { position: relative; width: 100%; }
.input-control input, .select-control select, .field textarea {
  width: 100%;
  outline: none;
  color: var(--color-texto-input, var(--text));
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.input-control input { height: 50px; padding: 0 14px 0 46px; font-size: 14px; }
.select-control select { height: 50px; padding: 0 42px 0 14px; appearance: none; -webkit-appearance: none; cursor: pointer; font-size: 14px; }
.select-control .category-select { padding-left: 38px; }
.select-control select option, .select-control select optgroup { color: var(--text); background: var(--card); }
.select-control select optgroup { font-style: normal; font-weight: 700; }
.field textarea { min-height: 92px; padding: 13px 14px; resize: vertical; font-size: 14px; line-height: 1.55; }
.input-control input:hover, .select-control select:hover, .field textarea:hover { border-color: var(--w25); }
.input-control input::placeholder, .field textarea::placeholder { color: rgba(245,245,244,.28); }
.input-control input:disabled { opacity: .55; cursor: not-allowed; }
.field-icon { position: absolute; z-index: 2; top: 50%; left: 15px; transform: translateY(-50%); width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: var(--text-3); pointer-events: none; transition: color .2s; }
.field-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.select-arrow { position: absolute; top: 50%; right: 14px; width: 17px; height: 17px; transform: translateY(-50%); fill: none; stroke: var(--text-3); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
.category-dot { position: absolute; z-index: 2; top: 50%; left: 16px; width: 10px; height: 10px; transform: translateY(-50%); border-radius: 50%; box-shadow: 0 0 0 3px var(--w5); pointer-events: none; }
.input-control input:focus, .select-control select:focus, .field textarea:focus {
  border-color: var(--hl);
  background: var(--field-focus);
  box-shadow: 0 0 0 4px var(--hl-soft);
}
.input-control:focus-within .field-icon { color: var(--hl); }

/* Campo de fecha: mismo aspecto que el resto, el calendario nativo abre al hacer clic */
.date-input { color-scheme: dark; cursor: pointer; font-family: 'Inter', sans-serif; }
.date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.date-input::-webkit-datetime-edit { padding: 0; }

/* Categoría personalizada */
.custom-category { margin-top: 4px; display: flex; flex-direction: column; gap: 8px; }

/* ============ HORARIO ============ */
.schedule-card {
  padding: 20px 22px;
  display: grid;
  grid-template-columns: 1fr 150px 1fr;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, var(--hl-soft), var(--w3));
  border: 1px solid var(--hl-line);
  border-radius: 16px;
}
.schedule-time { min-width: 0; display: flex; align-items: center; gap: 13px; }
.time-icon { width: 44px; height: 44px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--hl); background: var(--hl-soft); border: 1px solid var(--hl-line); border-radius: 13px; }
.time-icon.end { color: #34d399; background: rgba(16,185,129,.09); border-color: rgba(16,185,129,.28); }
.time-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.time-field { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 7px; }
.time-field input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  outline: none;
  color: var(--title);
  background: var(--field);
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  color-scheme: dark;
  transition: border-color .2s, box-shadow .2s;
}
.time-field input:focus { border-color: var(--hl); box-shadow: 0 0 0 4px var(--hl-soft); }
.time-connector { display: flex; align-items: center; justify-content: center; gap: 8px; }
.time-connector span { flex: 1; height: 1px; background: var(--line-strong); }
.time-connector strong { padding: 6px 10px; white-space: nowrap; color: var(--text-2); background: var(--w5); border: 1px solid var(--line); border-radius: 8px; font-size: 12px; font-weight: 700; }
.time-connector strong.invalid { color: #f87171; background: rgba(239,68,68,.09); border-color: rgba(239,68,68,.3); }

/* ============ MULTIMEDIA ============ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.upload { position: relative; display: flex; flex-direction: column; gap: 10px; }
.dropzone {
  min-height: 78px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  background: var(--field);
  border: 1.5px dashed var(--line-strong);
  border-radius: 14px;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.dropzone:hover { border-color: var(--hl); background: var(--hl-soft); }
.upload:focus-within .dropzone { border-color: var(--hl); box-shadow: 0 0 0 4px var(--hl-soft); }
.dropzone.filled { border-style: solid; border-color: var(--hl-line); background: var(--hl-soft); }
.dropzone.disabled { opacity: .5; cursor: not-allowed; pointer-events: none; }
.drop-icon {
  width: 46px;
  height: 46px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 13px;
}
.drop-icon svg, .file-thumb-icon svg, .video-link svg { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.drop-text { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.drop-text strong { color: var(--title); font-family: 'Oswald', sans-serif; font-size: 15px; font-weight: 500; letter-spacing: .3px; }
.drop-text small { color: var(--text-3); font-size: 12px; line-height: 1.4; }

.file-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.file-chip {
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 11px;
  background: var(--w3);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.file-thumb { width: 42px; height: 42px; flex: none; object-fit: cover; border-radius: 9px; border: 1px solid var(--line); }
.file-thumb-icon { display: flex; align-items: center; justify-content: center; color: var(--hl); background: var(--hl-soft); border-color: var(--hl-line); }
.file-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.file-info strong { overflow: hidden; color: var(--title); font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.file-info small { color: var(--text-3); font-size: 11.5px; }
.file-remove {
  width: 30px;
  height: 30px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-3);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: .2s ease;
}
.file-remove svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
.file-remove:hover { color: #f87171; background: rgba(239,68,68,.09); border-color: rgba(239,68,68,.3); }

.saved-media { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
.media-previews { display: flex; flex-wrap: wrap; gap: 10px; }
.media-thumb { width: 84px; height: 84px; display: block; overflow: hidden; border: 1px solid var(--line-strong); border-radius: 12px; transition: border-color .2s, transform .2s; }
.media-thumb img { width: 100%; height: 100%; display: block; object-fit: cover; }
.media-thumb:hover { border-color: var(--hl); transform: translateY(-2px); }
.video-link {
  margin-top: 14px;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--hl);
  background: var(--hl-soft);
  border: 1px solid var(--hl-line);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
.video-link svg { width: 18px; height: 18px; }
.video-link:hover { filter: brightness(1.15); }

/* ============ RESUMEN ============ */
.event-summary {
  position: relative;
  margin-top: 24px;
  padding: 16px 18px 16px 22px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--w3);
  border: 1px solid var(--line);
  border-radius: 15px;
}
.summary-color { position: absolute; top: 0; bottom: 0; left: 0; width: 4px; }
.summary-icon { width: 42px; height: 42px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--hl); background: var(--hl-soft); border-radius: 12px; }
.summary-icon svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.summary-content { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.summary-content > span { margin-bottom: 4px; color: var(--text-3); font-size: 10.5px; font-weight: 800; letter-spacing: 1px; }
.summary-content strong { overflow: hidden; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.summary-content p { margin: 4px 0 0; overflow: hidden; color: var(--text-2); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.summary-category { padding: 7px 11px; display: flex; align-items: center; gap: 8px; color: var(--text-2); background: var(--w5); border: 1px solid var(--line); border-radius: 9px; font-size: 12px; font-weight: 700; }
.summary-category i { width: 8px; height: 8px; border-radius: 50%; }

/* ============ FOOTER ============ */
.form-footer { padding-top: 22px; display: flex; align-items: center; justify-content: flex-end; gap: 11px; }
.cancel-btn, .save-btn {
  height: 48px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  cursor: pointer;
  border-radius: 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 15px;
  font-weight: 600;
  transition: .2s ease;
}
.cancel-btn { color: var(--text-2); background: transparent; border: 1px solid var(--line-strong); }
.cancel-btn:hover { color: var(--title); background: var(--w5); }
.save-btn {
  min-width: 190px;
  color: var(--color-texto-botones, #fff);
  background: var(--color-botones, #1c4fd6);
  border: 0;
  box-shadow: 0 8px 22px rgba(28,79,214,.28);
}
.save-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; stroke-linejoin: round; }
.save-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); box-shadow: 0 12px 28px rgba(28,79,214,.38); }
.save-btn:disabled { opacity: .55; cursor: not-allowed; }
.close-btn:focus-visible, .day-card:focus-visible, .cancel-btn:focus-visible, .save-btn:focus-visible, .file-remove:focus-visible { outline: 2px solid var(--hl); outline-offset: 3px; }

/* ============ TOAST ============ */
.toast-message {
  position: fixed;
  z-index: 6000;
  left: 50%;
  bottom: 26px;
  width: max-content;
  min-width: 290px;
  max-width: min(420px, 92vw);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--title);
  transform: translateX(-50%);
  background: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,.55);
  backdrop-filter: blur(15px);
}
.toast-icon { width: 34px; height: 34px; flex: none; display: flex; align-items: center; justify-content: center; color: #34d399; background: rgba(16,185,129,.12); border-radius: 10px; }
.toast-message.error .toast-icon { color: #f87171; background: rgba(239,68,68,.12); }
.toast-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; stroke-linejoin: round; }
.toast-message > div:last-child { display: flex; flex-direction: column; gap: 3px; }
.toast-message strong { font-size: 14px; }
.toast-message span { color: var(--w65); font-size: 12.5px; line-height: 1.4; }
.toast-enter-active, .toast-leave-active { transition: opacity .25s ease, transform .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }

@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after { transition: none !important; animation-duration: .01ms !important; }
}

/* ============ RESPONSIVE ============ */
@media (max-width: 760px) {
  .schedule-card { grid-template-columns: 1fr; gap: 14px; }
  .time-connector { padding: 0 6px; }
  /* Fecha arriba y días debajo, a todo el ancho */
  .day-picker { grid-template-columns: minmax(0, 1fr); gap: 14px; }
}
@media (max-width: 700px) {
  .activity-panel { width: 96vw; max-height: 94vh; border-radius: 18px; }
  .panel-header { padding: 16px 18px; }
  .calendar-icon { width: 42px; height: 42px; }
  .panel-header h2 { font-size: 21px; }
  .panel-header p { display: none; }
  .activity-form { padding: 0 18px 22px; }
  .form-section { padding: 22px 0; }
  .fields-grid { grid-template-columns: 1fr; gap: 18px; }
  .field-large { grid-column: auto; }
  /* 16px evita el zoom automático de iOS */
  .input-control input, .select-control select, .field textarea, .time-field input { font-size: 16px; }
  .input-control input, .select-control select { height: 52px; }
  .event-summary { align-items: flex-start; }
  .summary-category { display: none; }
  .form-footer { flex-direction: column-reverse; gap: 10px; }
  .cancel-btn, .save-btn { width: 100%; height: 52px; }
  .toast-message { bottom: 16px; min-width: 0; }
}
@media (max-width: 520px) {
  .days-grid { height: auto; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .day-card { height: 42px; }
}
@media (max-width: 380px) {
  .days-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .day-card { height: 44px; justify-content: flex-start; gap: 10px; padding: 0 12px; }
  .day-card > span { min-width: 30px; text-align: left; }
  .day-card > strong { display: block; }
  .section-number { width: 30px; height: 30px; }
}
</style>