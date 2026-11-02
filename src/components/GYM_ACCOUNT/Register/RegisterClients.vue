<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <!-- =====================================================
         MODAL: QR DE ACCESO (tras registrar)
    ====================================================== -->
    <div v-if="qrModal" class="overlay" @click.self="cerrarQR">
      <section class="dialog qr-dialog">
        <button type="button" class="dialog-close" @click="cerrarQR" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>

        <span class="dialog-icon" :class="qrPagoConfirmado ? 'ok' : 'warn'">
          <i class="bi" :class="qrPagoConfirmado ? 'bi-check-circle-fill' : 'bi-hourglass-split'"></i>
        </span>
        <h2>{{ txt('Inscripción registrada', 'Enrollment registered') }}</h2>
        <p class="dialog-sub">{{ txt('Cliente', 'Client') }} #{{ qrModal.ID_Cliente }} · {{ txt('Inscripción', 'Enrollment') }} #{{ qrModal.ID_Inscripto }}</p>
        <p v-if="qrFolio" class="dialog-folio">{{ txt('Folio', 'Reference') }}: <strong>{{ qrFolio }}</strong></p>

        <p class="dialog-status" :class="{ ok: qrPagoConfirmado }">
          {{ qrPagoConfirmado
            ? txt('Pago confirmado · Membresía activa.', 'Payment confirmed · Membership active.')
            : txt('Pendiente de pago · El QR no habilita el acceso hasta activar la membresía.', 'Payment pending · The QR will not grant access until the membership is active.') }}
        </p>

        <p v-if="qrCargando" class="dialog-muted">{{ txt('Cargando código QR...', 'Loading QR code...') }}</p>
        <p v-else-if="qrError" class="dialog-error">{{ qrError }}</p>
        <img v-else-if="qrUrl" :src="qrUrl" :alt="txt('Código QR de inscripción', 'Enrollment QR code')" class="qr-image" />

        <div class="dialog-actions">
          <button type="button" class="btn btn-primary" @click="descargarQR" :disabled="!qrModal || qrCargando">
            <i class="bi bi-download"></i> {{ txt('Descargar PNG', 'Download PNG') }}
          </button>
          <button v-if="qrPagoConfirmado && ultimoPago" type="button" class="btn btn-soft" @click="verReciboDesdeQR">
            <i class="bi bi-receipt"></i> {{ txt('Ver recibo', 'View receipt') }}
          </button>
          <button type="button" class="btn btn-ghost" @click="cerrarQR">{{ txt('Cerrar', 'Close') }}</button>
        </div>
      </section>
    </div>

    <!-- =====================================================
         MODAL: COBRO CON STRIPE (QR de pago)
    ====================================================== -->
    <div v-if="stripeQR" class="overlay" @click.self="ocultarStripe">
      <section class="dialog stripe-dialog">
        <button type="button" class="dialog-close" @click="ocultarStripe" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>

        <span class="dialog-icon stripe"><i class="bi bi-credit-card-2-front-fill"></i></span>
        <h2>{{ txt('Cobro con tarjeta', 'Card payment') }}</h2>
        <p class="dialog-sub">{{ stripeQR.cliente }} · {{ stripeQR.plan }}</p>

        <div class="stripe-qr-frame"><img :src="stripeQR.qr_data_url" :alt="txt('QR de pago Stripe', 'Stripe payment QR')" /></div>
        <p class="scan-hint"><i class="bi bi-qr-code-scan"></i> {{ txt('Pídele al cliente que escanee el código', 'Ask the client to scan the code') }}</p>

        <div class="stripe-amount">
          <span>{{ txt('MONTO A COBRAR', 'AMOUNT DUE') }}</span>
          <strong>${{ formatoMoneda(stripeQR.monto) }} <small>MXN</small></strong>
        </div>

        <span class="state-pill" :class="{ paid: String(stripeEstado).startsWith('Pagado') }">
          <i></i>{{ txt('Estado del pago:', 'Payment status:') }} {{ stripeEstado }}
        </span>

        <div class="dialog-actions">
          <button type="button" class="btn btn-primary" @click="consultarEstadoStripe(false)">
            <i class="bi bi-arrow-repeat"></i> {{ txt('Comprobar pago', 'Check payment') }}
          </button>
          <a class="btn btn-soft" :href="stripeQR.checkout_url" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-box-arrow-up-right"></i> {{ txt('Abrir enlace de pago', 'Open payment link') }}
          </a>
        </div>
        <button type="button" class="link-btn" @click="ocultarStripe">{{ txt('Ocultar QR (no cancela el pago)', 'Hide QR (does not cancel payment)') }}</button>
      </section>
    </div>

    <main class="reg-page">
      <div class="reg-layout">

        <!-- =====================================================
             PERFIL
        ====================================================== -->
        <aside class="profile-card" id="tutorial-step-0">
          <span class="chip-label">{{ t('personalData') }}</span>
          <h1 class="main-title">
            {{ t('title1') }}<br />
            <span class="highlight">{{ t('title2') }}</span>
          </h1>

          <div class="avatar-wrap">
            <div class="avatar-ring">
              <div class="avatar-circle" role="button" tabindex="0"
                @click="openPhotoOptions" @keydown.enter="openPhotoOptions" @keydown.space.prevent="openPhotoOptions">
                <img v-if="avatarPreview" :src="avatarPreview" :alt="t('altPreview')" class="avatar-img" />
                <i v-else class="bi bi-person-fill avatar-default"></i>
                <div class="avatar-overlay">
                  <i class="bi bi-camera-fill"></i>
                  <span>{{ txt('Cambiar foto', 'Change photo') }}</span>
                </div>
              </div>
            </div>
            <button type="button" class="avatar-action" @click="openPhotoOptions" :title="t('titleAvatar')">
              <i class="bi bi-camera-fill"></i>
            </button>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="handleFileChange" />
          </div>

          <p class="profile-hint">{{ txt('Toma una foto o selecciona una desde tu dispositivo.', 'Take a photo or select one from your device.') }}</p>

          <dl class="profile-summary">
            <div class="summary-row">
              <dt><i class="bi bi-person"></i>{{ txt('Cliente', 'Client') }}</dt>
              <dd :class="{ empty: !clientName }">{{ clientName || txt('Nuevo cliente', 'New client') }}</dd>
            </div>
            <div class="summary-row">
              <dt><i class="bi bi-tag"></i>{{ t('membershipData') }}</dt>
              <dd><span class="plan-chip">{{ periodoLabel }}</span></dd>
            </div>
            <div class="summary-row">
              <dt><i class="bi bi-calendar-event"></i>{{ t('enrollmentDate') }}</dt>
              <dd :class="{ empty: !form.fechaInscripcion }">{{ form.fechaInscripcion || '—' }}</dd>
            </div>
            <div class="summary-row">
              <dt><i class="bi bi-calendar-check"></i>{{ t('dueDate') }}</dt>
              <dd :class="{ empty: !form.fechaCorte }">{{ form.fechaCorte || '—' }}</dd>
            </div>
          </dl>
        </aside>

        <!-- =====================================================
             FORMULARIOS
        ====================================================== -->
        <div class="forms-col">

          <!-- DATOS PERSONALES -->
          <section class="card" id="tutorial-step-1">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-person-vcard"></i></span>
              <div>
                <h3 class="card-title">{{ t('personalData') }}</h3>
                <p class="card-desc">{{ txt('Información básica del cliente', 'Basic client information') }}</p>
              </div>
            </header>

            <div class="grid grid-3">
              <div class="field">
                <label>{{ t('names') }} <span class="req">*</span></label>
                <input type="text" v-model="form.nombres" :placeholder="t('placeholderName')" autocomplete="given-name" />
              </div>
              <div class="field">
                <label>{{ t('lastNameP') }} <span class="req">*</span></label>
                <input type="text" v-model="form.apellidoP" :placeholder="t('placeholderLastNameP')" autocomplete="family-name" />
              </div>
              <div class="field">
                <label>{{ t('lastNameM') }} <span class="req">*</span></label>
                <input type="text" v-model="form.apellidoM" :placeholder="t('placeholderLastNameM')" />
              </div>
              <div class="field">
                <label>{{ t('birthDate') }} <span class="req">*</span></label>
                <input type="date" v-model="form.fechaNacimiento" />
              </div>
              <div class="field">
                <label>{{ t('cellphone') }}</label>
                <div class="control has-icon">
                  <i class="bi bi-telephone control-icon"></i>
                  <input type="tel" :value="form.celular" @input="actualizarCelular" @paste="pegarCelular" @keydown="bloquearPrefijoCelular"
                    placeholder="481 111 1231" inputmode="numeric" autocomplete="tel-national" maxlength="12" />
                </div>
              </div>
              <div class="field">
                <label>{{ t('email') }}</label>
                <div class="control has-icon">
                  <i class="bi bi-envelope control-icon"></i>
                  <input type="email" v-model="form.email" placeholder="ejemplo@correo.com" autocomplete="email" />
                </div>
              </div>
            </div>
          </section>

          <!-- REGISTRO FÍSICO -->
          <section class="card" id="tutorial-step-2">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-activity"></i></span>
              <div>
                <h3 class="card-title">{{ t('physicalRecord') }}</h3>
                <p class="card-desc">{{ txt('Medidas físicas iniciales', 'Initial physical measurements') }}</p>
              </div>
            </header>

            <div class="grid grid-2">
              <div class="tile-field">
                <span class="tile-icon"><i class="bi bi-speedometer2"></i></span>
                <div class="tile-body">
                  <label>{{ t('weight') }}</label>
                  <div class="control has-suffix">
                    <input type="number" step="0.1" min="0" v-model="form.peso" placeholder="70" />
                    <span class="control-suffix">kg</span>
                  </div>
                </div>
              </div>
              <div class="tile-field">
                <span class="tile-icon"><i class="bi bi-rulers"></i></span>
                <div class="tile-body">
                  <label>{{ t('height') }}</label>
                  <div class="control has-suffix">
                    <input type="number" min="0" v-model="form.altura" placeholder="175" />
                    <span class="control-suffix">cm</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- =====================================================
               MEMBRESÍA + PAGO INICIAL
          ====================================================== -->
          <section class="card membership-card" id="tutorial-step-3">
            <header class="card-head">
              <span class="card-icon"><i class="bi bi-award"></i></span>
              <div class="grow">
                <h3 class="card-title">{{ t('membershipData') }}</h3>
                <p class="card-desc">{{ txt('Selecciona el periodo, las fechas y el pago inicial del cliente.', 'Select the membership period, dates and initial payment.') }}</p>
              </div>
              <div class="head-actions">
                <button type="button" class="icon-btn" :title="t('titleCut')" @click="activeModal = 'corte'"><i class="bi bi-file-earmark-text"></i></button>
                <button type="button" class="icon-btn" :title="t('titleHelp')" @click="activeModal = 'help'"><i class="bi bi-question-circle"></i></button>
              </div>
            </header>

            <!-- PERIODO -->
            <div class="field">
              <label>{{ txt('Periodo de membresía', 'Membership period') }}</label>
              <div class="segmented" role="radiogroup" :style="{ '--i': periodoIndex, '--n': periodos.length }">
                <span class="segmented-thumb"></span>
                <button v-for="p in periodos" :key="p.key" type="button" role="radio" class="segment"
                  :class="{ active: form.tipoMembresia === p.key }" :aria-checked="form.tipoMembresia === p.key"
                  @click="form.tipoMembresia = p.key">
                  <i class="bi" :class="p.icon"></i><span>{{ p.label }}</span>
                </button>
              </div>
            </div>

            <!-- TARIFA -->
            <div class="field">
              <label id="tarifa-label">{{ txt('Tarifa de inscripción', 'Enrollment rate') }} <span class="req">*</span></label>
              <div class="ff-select" :class="{ open: openSelect === 'tarifa' }">
                <button type="button" class="ff-trigger" aria-haspopup="listbox" aria-labelledby="tarifa-label"
                  :aria-expanded="openSelect === 'tarifa'" @click="toggleSelect('tarifa')" @keydown.esc="openSelect = ''">
                  <span class="ff-trigger-icon"><i class="bi bi-credit-card-2-front"></i></span>
                  <span class="ff-trigger-value" :class="{ placeholder: !tarifaSeleccionada }">
                    <template v-if="tarifaSeleccionada">
                      <strong>{{ tarifaSeleccionada.Nombre_Paquete }}</strong>
                      <em>{{ formatoPrecio(tarifaSeleccionada.Precio) }}</em>
                    </template>
                    <template v-else>{{ txt('Selecciona una tarifa', 'Select a rate') }}</template>
                  </span>
                  <i class="bi bi-chevron-down ff-chevron"></i>
                </button>

                <transition name="dd">
                  <ul v-if="openSelect === 'tarifa'" class="ff-menu" role="listbox" aria-labelledby="tarifa-label">
                    <li v-if="!tarifasFiltradas.length" class="ff-empty">
                      <i class="bi bi-inbox"></i>
                      {{ txt('No hay tarifas disponibles para este periodo.', 'No rates available for this period.') }}
                    </li>
                    <li v-for="p in tarifasFiltradas" :key="p.ID_Precio" role="option"
                      :aria-selected="String(p.ID_Precio) === String(idPrecio)"
                      :class="{ selected: String(p.ID_Precio) === String(idPrecio) }" @click="elegirTarifa(p)">
                      <span class="opt-name">{{ p.Nombre_Paquete }}</span>
                      <span class="opt-price">{{ formatoPrecio(p.Precio) }}</span>
                      <i v-if="String(p.ID_Precio) === String(idPrecio)" class="bi bi-check-lg opt-check"></i>
                    </li>
                  </ul>
                </transition>
              </div>
            </div>

            <!-- FECHAS -->
            <div class="grid grid-2">
              <div class="tile-field">
                <span class="tile-icon"><i class="bi bi-calendar-event"></i></span>
                <div class="tile-body">
                  <label>{{ t('enrollmentDate') }}</label>
                  <input type="date" v-model="form.fechaInscripcion" :max="fechaLocal()" />
                </div>
              </div>
              <div class="tile-field accent">
                <span class="tile-icon"><i class="bi bi-calendar-check"></i></span>
                <div class="tile-body">
                  <label>{{ t('dueDate') }}</label>
                  <input type="date" v-model="form.fechaCorte" readonly />
                </div>
              </div>
            </div>

            <!-- DÍA DE CORTE FIJO -->
            <div v-if="diasCorteDisponibles.length > 1" class="field">
              <label id="corte-label">{{ txt('Día de corte fijo', 'Fixed billing day') }}</label>
              <div class="ff-select" :class="{ open: openSelect === 'corte' }">
                <button type="button" class="ff-trigger" aria-haspopup="listbox" aria-labelledby="corte-label"
                  :aria-expanded="openSelect === 'corte'" @click="toggleSelect('corte')" @keydown.esc="openSelect = ''">
                  <span class="ff-trigger-icon"><i class="bi bi-scissors"></i></span>
                  <span class="ff-trigger-value">
                    <strong>{{ txt('Día', 'Day') }} {{ diaCorteElegido }}</strong>
                    <em class="plain">{{ txt('mes siguiente', 'next month') }}</em>
                  </span>
                  <i class="bi bi-chevron-down ff-chevron"></i>
                </button>
                <transition name="dd">
                  <ul v-if="openSelect === 'corte'" class="ff-menu" role="listbox" aria-labelledby="corte-label">
                    <li v-for="d in diasCorteDisponibles" :key="d" role="option" :aria-selected="d === diaCorteElegido"
                      :class="{ selected: d === diaCorteElegido }" @click="elegirDiaCorte(d)">
                      <span class="opt-name">{{ txt('Día', 'Day') }} {{ d }}</span>
                      <span class="opt-hint">{{ txt('mes siguiente', 'next month') }}</span>
                      <i v-if="d === diaCorteElegido" class="bi bi-check-lg opt-check"></i>
                    </li>
                  </ul>
                </transition>
              </div>
            </div>

            <p v-if="!permitePendiente" class="note warn">
              <i class="bi bi-exclamation-triangle"></i>
              {{ txt('El corte de este mes ya pasó. Es obligatorio cobrar ahora.', 'This month\'s billing date has passed. Payment is required now.') }}
            </p>

            <!-- ---------------- PAGO INICIAL ---------------- -->
            <div class="payment-block">
              <div class="block-head">
                <span class="block-icon"><i class="bi bi-wallet2"></i></span>
                <div>
                  <h4>{{ txt('Pago inicial', 'Initial payment') }}</h4>
                  <p>{{ txt('Cobra la primera membresía o déjala pendiente.', 'Charge the first membership or leave it pending.') }}</p>
                </div>
              </div>

              <div class="total-box">
                <span>{{ txt('Total de membresía', 'Membership total') }}</span>
                <strong>{{ formatoPrecio(tarifaSeleccionada?.Precio) }}</strong>
              </div>

              <div class="choice-grid" role="radiogroup">
                <label class="choice" :class="{ selected: cobrarAhora }">
                  <input v-model="cobrarAhora" type="radio" name="cobro-inicial" :value="true" />
                  <span class="choice-dot"></span>
                  <span class="choice-text">
                    <strong>{{ txt('Registrar y cobrar ahora', 'Register and charge now') }}</strong>
                    <small>{{ txt('Activa la membresía', 'Activates the membership') }}</small>
                  </span>
                  <i class="bi bi-lightning-charge choice-icon"></i>
                </label>
                <label class="choice" :class="{ selected: !cobrarAhora, disabled: !permitePendiente }">
                  <input v-model="cobrarAhora" type="radio" name="cobro-inicial" :value="false" :disabled="!permitePendiente" />
                  <span class="choice-dot"></span>
                  <span class="choice-text">
                    <strong>{{ txt('Registrar pendiente de pago', 'Register as pending') }}</strong>
                    <small>{{ txt('Se cobra después', 'Charge it later') }}</small>
                  </span>
                  <i class="bi bi-hourglass-split choice-icon"></i>
                </label>
              </div>

              <!-- MÉTODO DE PAGO (igual que en Pagos) -->
              <template v-if="cobrarAhora">
                <div class="field">
                  <label>{{ txt('Método de pago', 'Payment method') }} <span class="req">*</span></label>
                  <div class="method-grid" role="radiogroup" :aria-label="txt('Método de pago', 'Payment method')">
                    <button v-for="m in metodos" :key="m.value" type="button" role="radio" class="method-tile"
                      :class="{ active: metodoPagoRegistro === m.value }" :aria-checked="metodoPagoRegistro === m.value"
                      @click="metodoPagoRegistro = m.value">
                      <span class="method-icon"><i class="bi" :class="m.icon"></i></span>
                      <span class="method-text"><strong>{{ m.label }}</strong><small>{{ m.hint }}</small></span>
                      <span class="method-check"><i class="bi bi-check-lg"></i></span>
                    </button>
                  </div>
                </div>

                <div class="field">
                  <label for="folio-registro">
                    {{ txt('Folio / referencia', 'Reference / folio') }}
                    <span v-if="metodoPagoRegistro" class="badge" :class="folioAutomatico ? 'auto' : 'required'">
                      {{ folioAutomatico ? txt('AUTOMÁTICO', 'AUTOMATIC') : txt('OBLIGATORIO', 'REQUIRED') }}
                    </span>
                  </label>
                  <div class="control has-icon" :class="{ locked: folioAutomatico || !metodoPagoRegistro }">
                    <i class="bi control-icon" :class="folioAutomatico || !metodoPagoRegistro ? 'bi-lock' : 'bi-hash'"></i>
                    <input id="folio-registro" v-model.trim="referenciaPagoRegistro" maxlength="120"
                      :disabled="folioAutomatico || !metodoPagoRegistro" :placeholder="folioPlaceholder" />
                  </div>
                  <p v-if="folioAyuda" class="note info"><i class="bi bi-info-circle"></i><span>{{ folioAyuda }}</span></p>
                </div>

                <!-- STRIPE -->
                <div v-if="metodoPagoRegistro === 'Tarjeta'" class="stripe-box">
                  <div class="stripe-head">
                    <span class="stripe-icon"><i class="bi bi-credit-card-2-front-fill"></i></span>
                    <div class="stripe-head-text">
                      <strong>{{ txt('Cobro con tarjeta mediante Stripe', 'Card payment via Stripe') }}</strong>
                      <span class="stripe-status" :class="stripeCuenta?.charges_enabled ? 'ok' : 'warn'">
                        <i></i>{{ stripeCuenta?.charges_enabled ? txt('Cuenta lista para cobrar.', 'Account ready for payments.') : txt('Cuenta no habilitada', 'Account not enabled') }}
                      </span>
                    </div>
                    <button type="button" class="btn btn-ghost sm" @click="consultarStripeCuenta(false)">
                      <i class="bi bi-arrow-repeat"></i> {{ txt('Actualizar estado de cuenta', 'Refresh account status') }}
                    </button>
                  </div>

                  <template v-if="!stripeCuenta?.charges_enabled">
                    <p class="stripe-hint">{{ txt('Conecta y habilita la cuenta Stripe del gimnasio antes de cobrar.', 'Connect and enable the gym Stripe account before charging.') }}</p>
                    <button type="button" class="btn btn-primary sm" :disabled="stripeLoading" @click="conectarStripe">
                      <i class="bi bi-link-45deg"></i> {{ txt('Conectar cuenta Stripe', 'Connect Stripe account') }}
                    </button>
                  </template>
                  <p v-else class="stripe-hint">
                    <i class="bi bi-qr-code"></i>
                    {{ txt('Al registrar se generará un QR de cobro para que el cliente pague con su tarjeta.', 'When you register, a payment QR will be generated for the client to pay by card.') }}
                  </p>
                </div>
              </template>

              <p class="note muted">
                <i class="bi bi-shield-check"></i>
                <span v-if="cobrarAhora">{{ txt('El acceso solo se habilitará cuando el servidor confirme el pago.', 'Access will only be enabled after the server confirms payment.') }}</span>
                <span v-else>{{ txt('El QR no dará acceso hasta que se confirme el pago.', 'The QR will not grant access until payment is confirmed.') }}</span>
              </p>
            </div>
          </section>

          <!-- GUARDAR -->
          <div class="reg-footer">
            <div class="req-hint"><span class="req">*</span> {{ txt('Campos obligatorios', 'Required fields') }}</div>
            <div class="footer-actions">
              <button type="button" class="btn btn-soft receipt-btn" :class="{ ready: ultimoPago }" @click="downloadReceipt">
                <i class="bi bi-receipt"></i>
                <span>{{ txt('Recibo del último pago', 'Last payment receipt') }}</span>
                <em v-if="ultimoPago"><i></i>{{ txt('Disponible', 'Ready') }}</em>
              </button>
              <button type="button" class="btn btn-primary save-btn" @click="saveRegistration" :disabled="guardando || stripeLoading">
                <i class="bi" :class="guardando || stripeLoading ? 'bi-arrow-repeat spin' : (usaStripe ? 'bi-qr-code' : 'bi-floppy')"></i>
                {{ textoGuardar }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- =====================================================
         MODALES EXISTENTES
    ====================================================== -->
    <transition name="pop">
      <div v-if="activeModal === 'corte'" class="modal-wrapper" @click.self="activeModal = null">
        <AddCorteComponent @close="activeModal = null" />
      </div>
    </transition>
    <transition name="pop">
      <div v-if="activeModal === 'help'" class="modal-wrapper" @click.self="activeModal = null">
        <Help @close="activeModal = null" />
      </div>
    </transition>

    <!-- RECIBO -->
    <ReciboPago :visible="reciboVisible" :pago="ultimoPago" :locale="reciboLocale" @close="reciboVisible = false" @notify="handleReciboNotify" />

    <!-- =====================================================
         CÁMARA O GALERÍA
    ====================================================== -->
    <transition name="photo-menu">
      <div v-if="showPhotoOptions" class="overlay sheet" @click.self="closePhotoOptions">
        <div class="dialog photo-dialog">
          <div class="sheet-handle"></div>
          <div class="dialog-head">
            <div>
              <span class="eyebrow">{{ txt('FOTO DE PERFIL', 'PROFILE PHOTO') }}</span>
              <h3>{{ txt('Agregar foto del cliente', 'Add client photo') }}</h3>
              <p>{{ txt('Selecciona cómo quieres agregar la imagen.', 'Choose how you want to add the image.') }}</p>
            </div>
            <button type="button" class="dialog-x" @click="closePhotoOptions" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
          </div>

          <div class="photo-options">
            <button type="button" class="photo-option" @click="takePhoto">
              <span class="photo-option-icon"><i class="bi bi-camera"></i></span>
              <span class="photo-option-text">
                <strong>{{ txt('Tomar foto', 'Take photo') }}</strong>
                <small>{{ txt('Abrir la cámara del dispositivo', 'Open your device camera') }}</small>
              </span>
              <i class="bi bi-chevron-right"></i>
            </button>
            <button type="button" class="photo-option" @click="selectPhoto">
              <span class="photo-option-icon"><i class="bi bi-images"></i></span>
              <span class="photo-option-text">
                <strong>{{ txt('Subir desde galería', 'Choose image') }}</strong>
                <small>{{ txt('Seleccionar una imagen existente', 'Select an existing image') }}</small>
              </span>
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>

          <button type="button" class="btn btn-ghost block" @click="closePhotoOptions">{{ txt('Cancelar', 'Cancel') }}</button>
        </div>
      </div>
    </transition>

    <transition name="photo-menu">
      <div v-if="showCamera" class="overlay sheet dark" @click.self="closeCamera">
        <div class="dialog camera-dialog">
          <div class="dialog-head">
            <div>
              <span class="eyebrow">{{ txt('CÁMARA', 'CAMERA') }}</span>
              <h3>{{ txt('Tomar foto del cliente', 'Take client photo') }}</h3>
              <p>{{ cameraFacingMode === 'user' ? txt('Cámara frontal', 'Front camera') : txt('Cámara trasera', 'Rear camera') }}</p>
            </div>
            <button type="button" class="dialog-x" @click="closeCamera" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
          </div>

          <div class="camera-preview">
            <video ref="videoRef" autoplay playsinline muted :class="{ mirrored: cameraFacingMode === 'user' }"></video>
            <button type="button" class="switch-camera" :disabled="switchingCamera" @click.stop="switchCamera">
              <i class="bi bi-arrow-repeat" :class="{ spin: switchingCamera }"></i>
              <span>{{ cameraFacingMode === 'user' ? txt('Trasera', 'Rear') : txt('Frontal', 'Front') }}</span>
            </button>
            <div class="camera-guide"><div class="face-guide"></div></div>
            <div v-if="switchingCamera" class="camera-switching"><span class="loader"></span></div>
          </div>
          <canvas ref="canvasRef" class="hidden-canvas"></canvas>

          <div class="camera-actions">
            <button type="button" class="btn btn-ghost" @click="closeCamera">{{ txt('Cancelar', 'Cancel') }}</button>
            <button type="button" class="capture-btn" :disabled="switchingCamera" @click="capturePhoto">
              <span class="capture-circle"><span></span></span>
              {{ txt('Tomar foto', 'Take photo') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </HeadingGYM_ACCOUNT>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import AddCorteComponent from '../Componets/Cut.vue';
import Help from '../Componets/Help.vue';
import ReciboPago from '../Componets/ReciboPago.vue'; // ⚠ Ajusta la ruta si ReciboPago.vue está en otra carpeta
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';

/* =========================================================
   IDIOMA
========================================================= */
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const t = (key) => {
  const langTable = traducciones[currentLang.value] || traducciones.es;
  return langTable[key] || traducciones.es[key] || key;
};
const txt = (es, en) => (currentLang.value === 'en' ? en : es);
const handleLangChange = (event) => {
  if (event.detail?.idioma) currentLang.value = event.detail.idioma;
};

/* =========================================================
   ESTADO GENERAL
========================================================= */
const toastRef = ref(null);
const fechaLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fechaSolo = (v) => String(v || '').slice(0, 10);

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
  fechaInscripcion: fechaLocal(),
  fechaCorte: ''
});

const activeModal = ref(null);
const guardando = ref(false);
const cobrarAhora = ref(true);
const metodoPagoRegistro = ref('');
const referenciaPagoRegistro = ref('');
const qrPagoConfirmado = ref(false);
const qrFolio = ref('');
const tarifas = ref([]);
const idPrecio = ref('');
const diasCorteDisponibles = ref([]);
const diaCorteElegido = ref(null);
const permitePendiente = ref(true);

const clientName = computed(() =>
  [form.nombres, form.apellidoP, form.apellidoM].filter(Boolean).join(' ')
);

/* =========================================================
   API
========================================================= */
const base = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');
const gymApi = `${base}/api/gym`;
const clientesApi = `${gymApi}/clientes`;
const sedeActual = () => Number(sessionStorage.getItem('selected_sede_id') || 0);
const authHeaders = () => ({
  Accept: 'application/json',
  Authorization: `Bearer ${sessionStorage.getItem('auth_token') || ''}`
});
// Petición JSON genérica sobre /api/gym
const apiRequest = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${gymApi}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Comprueba la conexión.');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const details = body?.errors ? Object.values(body.errors).flat().join(' ') : '';
    const message = details || body?.message;
    throw new Error(message && message !== 'Server Error' ? message : `Error HTTP ${response.status}. Intenta de nuevo o contacta a soporte.`);
  }
  return body;
};

/* =========================================================
   CELULAR (10 dígitos, formato 000 000 0000, sin +52)
========================================================= */
const soloDigitosCelular = (valor) => String(valor ?? '').replace(/\D/g, '');
const formatearCelular = (valor) => {
  const n = soloDigitosCelular(valor).slice(0, 10);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)} ${n.slice(3)}`;
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
};
const errorPrefijoCelular = () =>
  toastRef.value?.notify('No incluyas +52. Ingresa solamente los 10 dígitos de tu celular.', 'warning');
const actualizarCelular = (event) => {
  const texto = String(event.target.value ?? '');
  const numeros = soloDigitosCelular(texto);
  if (texto.includes('+') || numeros.length > 10) {
    errorPrefijoCelular();
    event.target.value = form.celular;
    return;
  }
  form.celular = formatearCelular(texto);
  event.target.value = form.celular;
};
const pegarCelular = (event) => {
  const texto = event.clipboardData?.getData('text') || '';
  if (texto.includes('+') || soloDigitosCelular(texto).length > 10) {
    event.preventDefault();
    errorPrefijoCelular();
  }
};
const bloquearPrefijoCelular = (event) => {
  if (event.key === '+') { event.preventDefault(); errorPrefijoCelular(); }
};
const celularParaGuardar = () => soloDigitosCelular(form.celular);
const celularValido = () => /^\d{10}$/.test(celularParaGuardar());

/* =========================================================
   PERIODOS / MÉTODOS DE PAGO
========================================================= */
const periodos = computed(() => [
  { key: 'mes', label: t('month'), icon: 'bi-calendar-month' },
  { key: 'semana', label: t('week'), icon: 'bi-calendar-week' },
  { key: 'quincena', label: txt('Quincena', 'Fortnight'), icon: 'bi-calendar2-range' },
  { key: 'visita', label: txt('Visita', 'Day visit'), icon: 'bi-door-open' }
]);
const periodoIndex = computed(() => Math.max(0, periodos.value.findIndex((p) => p.key === form.tipoMembresia)));
const periodoLabel = computed(() => periodos.value[periodoIndex.value]?.label || '');

const metodos = computed(() => [
  { value: 'Efectivo', label: txt('Efectivo', 'Cash'), hint: txt('Folio automático', 'Automatic reference'), icon: 'bi-cash-coin' },
  { value: 'Transferencia', label: txt('Transferencia', 'Bank transfer'), hint: txt('Requiere folio', 'Reference required'), icon: 'bi-bank' },
  { value: 'Tarjeta', label: txt('Tarjeta', 'Card'), hint: txt('QR de Stripe', 'Stripe QR'), icon: 'bi-credit-card-2-front' }
]);

const esEfectivo = computed(() => metodoPagoRegistro.value === 'Efectivo');
const folioAutomatico = computed(() => metodoPagoRegistro.value === 'Efectivo' || metodoPagoRegistro.value === 'Tarjeta');
const usaStripe = computed(() => cobrarAhora.value && metodoPagoRegistro.value === 'Tarjeta');

const folioPlaceholder = computed(() => {
  if (metodoPagoRegistro.value === 'Efectivo') return txt('Se asigna al confirmar el pago', 'Assigned when you confirm');
  if (metodoPagoRegistro.value === 'Tarjeta') return txt('Lo asigna Stripe al cobrar', 'Assigned by Stripe on charge');
  if (metodoPagoRegistro.value === 'Transferencia') return txt('Folio o referencia del comprobante', 'Reference from the transfer receipt');
  return txt('Elige primero un método de pago', 'Choose a payment method first');
});
const folioAyuda = computed(() => ({
  Efectivo: txt('El folio real se genera al confirmar el pago y aparecerá en el recibo.', 'The real reference is generated when you confirm the payment and will appear on the receipt.'),
  Tarjeta: txt('El folio se asigna cuando Stripe confirma el cobro y aparecerá en el recibo.', 'The reference is assigned once Stripe confirms the charge and will appear on the receipt.'),
  Transferencia: txt('Captura el folio o número de referencia que aparece en el comprobante de la transferencia.', 'Enter the reference number shown on the transfer receipt.')
})[metodoPagoRegistro.value] || '');

const textoGuardar = computed(() => {
  if (guardando.value || stripeLoading.value) return txt('Guardando...', 'Saving...');
  if (usaStripe.value) return txt('Registrar y generar QR', 'Register and generate QR');
  return cobrarAhora.value ? txt('Registrar y cobrar', 'Register and charge') : txt('Registrar pendiente', 'Register as pending');
});

watch(metodoPagoRegistro, (metodo) => {
  if (metodo === 'Efectivo' || referenciaPagoRegistro.value.startsWith('OP-')) referenciaPagoRegistro.value = '';
  if (metodo === 'Tarjeta') consultarStripeCuenta();
});
watch(cobrarAhora, (activo) => {
  if (!activo) {
    metodoPagoRegistro.value = '';
    referenciaPagoRegistro.value = '';
  }
});

/* =========================================================
   TARIFAS Y VENCIMIENTO
========================================================= */
const tarifasFiltradas = computed(() => {
  const periodosMap = { mes: 'mensual', semana: 'semanal', quincena: 'quincenal', visita: 'diario' };
  return tarifas.value.filter((p) => String(p.Periodo || '').trim().toLowerCase() === periodosMap[form.tipoMembresia]);
});

const cargarTarifas = async () => {
  idPrecio.value = '';
  tarifas.value = [];
  const sede = sedeActual();
  if (!sede) return;
  try {
    const res = await fetch(`${clientesApi}/tarifas?sede_id=${sede}`, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Error HTTP ${res.status} al consultar tarifas`);
    tarifas.value = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    if (tarifasFiltradas.value.length === 1) idPrecio.value = String(tarifasFiltradas.value[0].ID_Precio);
  } catch (e) {
    toastRef.value?.notify(e.message, 'error');
  }
};

let versionCalculo = 0;
const calcularVencimiento = async () => {
  const version = ++versionCalculo;
  form.fechaCorte = '';
  diasCorteDisponibles.value = [];
  permitePendiente.value = true;
  if (!idPrecio.value || !sedeActual() || !form.fechaInscripcion) return;
  try {
    const q = new URLSearchParams({
      sede_id: String(sedeActual()),
      id_precio: String(idPrecio.value),
      fechaInscripcion: form.fechaInscripcion
    });
    if (diaCorteElegido.value) q.set('dia_corte_elegido', String(diaCorteElegido.value));
    const res = await fetch(`${clientesApi}/vencimiento?${q}`, { headers: authHeaders() });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
    if (version !== versionCalculo) return;
    form.fechaCorte = d.fecha_vencimiento || '';
    diasCorteDisponibles.value = Array.isArray(d.dias_corte) ? d.dias_corte.map(Number) : [];
    if (diasCorteDisponibles.value.length && !diasCorteDisponibles.value.includes(Number(diaCorteElegido.value))) {
      diaCorteElegido.value = Number(d.dia_corte_elegido || diasCorteDisponibles.value[0]);
    }
    permitePendiente.value = d.permite_pendiente !== false;
    if (!permitePendiente.value) cobrarAhora.value = true;
  } catch (e) {
    if (version === versionCalculo) toastRef.value?.notify(e.message, 'error');
  }
};

watch([idPrecio, () => form.fechaInscripcion, diaCorteElegido], calcularVencimiento);
watch(() => form.tipoMembresia, () => { diaCorteElegido.value = null; });
watch(() => form.fechaInscripcion, () => { diaCorteElegido.value = null; });
watch(() => form.tipoMembresia, () => {
  openSelect.value = '';
  if (!tarifasFiltradas.value.some((p) => String(p.ID_Precio) === idPrecio.value)) idPrecio.value = '';
});

/* =========================================================
   SELECTS PERSONALIZADOS
========================================================= */
const openSelect = ref('');
const toggleSelect = (name) => { openSelect.value = openSelect.value === name ? '' : name; };
const tarifaSeleccionada = computed(
  () => tarifasFiltradas.value.find((p) => String(p.ID_Precio) === String(idPrecio.value)) || null
);
const elegirTarifa = (p) => {
  idPrecio.value = String(p.ID_Precio);
  openSelect.value = '';
};
const elegirDiaCorte = (d) => {
  diaCorteElegido.value = d;
  openSelect.value = '';
};
const formatoPrecio = (value) =>
  new Intl.NumberFormat(currentLang.value === 'en' ? 'en-US' : 'es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 2
  }).format(Number(value || 0));
const formatoMoneda = (n) =>
  new Intl.NumberFormat(currentLang.value === 'en' ? 'en-US' : 'es-MX', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(Number(n) || 0);
const cerrarSelectsAlClickFuera = (event) => {
  if (!event.target?.closest?.('.ff-select')) openSelect.value = '';
};

/* =========================================================
   QR DE ACCESO
========================================================= */
const qrModal = ref(null);
const qrUrl = ref('');
const qrError = ref('');
const qrCargando = ref(false);
let qrVersion = 0;

const cerrarQR = () => {
  qrPagoConfirmado.value = false;
  qrFolio.value = '';
  qrVersion++;
  qrModal.value = null;
  qrUrl.value = '';
  qrError.value = '';
  qrCargando.value = false;
};
const mostrarQR = async (registro) => {
  const version = ++qrVersion;
  qrModal.value = registro;
  qrUrl.value = '';
  qrError.value = '';
  qrCargando.value = true;
  try {
    const res = await fetch(`${clientesApi}/${registro.ID_Inscripto}/qr`, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    if (version === qrVersion) {
      if (!data.qr_url) throw new Error('El servidor no devolvió la imagen QR.');
      qrUrl.value = data.qr_url;
    }
  } catch (e) {
    if (version === qrVersion) qrError.value = e.message || 'No se pudo consultar el QR.';
  } finally {
    if (version === qrVersion) qrCargando.value = false;
  }
};
const descargarQR = async () => {
  if (!qrModal.value) return;
  try {
    const res = await fetch(`${clientesApi}/${qrModal.value.ID_Inscripto}/qr/descargar`, { headers: authHeaders() });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Error ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factorfit-qr-${qrModal.value.ID_Inscripto}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    toastRef.value?.notify(e.message || 'No se pudo descargar el QR.', 'error');
  }
};

/* =========================================================
   STRIPE (mismo flujo que la pantalla de Pagos)
========================================================= */
const stripeCuenta = ref(null);
const stripeQR = ref(null);
const stripeEstado = ref('');
const stripeLoading = ref(false);
let stripeTimer = null;
const nuevaOperacionId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ff${Date.now()}_${Math.random().toString(36).slice(2)}`;

const consultarStripeCuenta = async (silent = true) => {
  try {
    stripeCuenta.value = await apiRequest('/stripe/cuenta');
    return stripeCuenta.value;
  } catch (e) {
    stripeCuenta.value = null;
    if (!silent) toastRef.value?.notify(e.message, 'error');
    return null;
  }
};

const conectarStripe = async () => {
  if (stripeLoading.value) return;
  // Abrir antes del await evita que el navegador bloquee la pestaña emergente.
  const tab = window.open('about:blank', '_blank');
  stripeLoading.value = true;
  try {
    const data = await apiRequest('/stripe/conectar', { method: 'POST' });
    if (!data?.url || !/^https:\/\//i.test(data.url)) throw new Error('Stripe no devolvió un enlace seguro de conexión.');
    if (tab) { tab.opener = null; tab.location.replace(data.url); } else window.location.assign(data.url);
    toastRef.value?.notify(txt('Completa la conexión en Stripe y luego actualiza el estado.', 'Finish setup in Stripe and refresh account status.'), 'success');
  } catch (e) {
    if (tab && !tab.closed) tab.close();
    toastRef.value?.notify(e.message, 'error');
  } finally {
    stripeLoading.value = false;
  }
};

const detenerStripe = () => {
  if (stripeTimer) { clearInterval(stripeTimer); stripeTimer = null; }
};

// Crea el cobro Stripe para la inscripción recién registrada (queda pendiente hasta que Stripe confirme).
const crearStripeQR = async (registro, tarifa, nombre) => {
  stripeLoading.value = true;
  try {
    const monto = Number(tarifa?.Precio);
    const data = await apiRequest(`/clientes/${registro.ID_Inscripto}/stripe/checkout`, {
      method: 'POST',
      body: JSON.stringify({
        sede_id: sedeActual(),
        monto,
        id_precio: null,
        participantes: [registro.ID_Inscripto],
        personas: 1,
        operacion_id: nuevaOperacionId()
      })
    });
    if (!data?.session_id || !data?.qr_data_url || !data?.checkout_url) {
      throw new Error('Stripe no devolvió todos los datos del cobro.');
    }
    ultimoPago.value = null;
    stripeQR.value = {
      ...data,
      monto,
      inscripcionId: registro.ID_Inscripto,
      sedeId: sedeActual(),
      cliente: nombre,
      plan: tarifa?.Nombre_Paquete || '',
      registro
    };
    stripeEstado.value = 'Pendiente';
    detenerStripe();
    stripeTimer = setInterval(() => { void consultarEstadoStripe(true); }, 5000);
    toastRef.value?.notify(txt('QR generado. Esperando la confirmación de Stripe.', 'QR generated. Waiting for Stripe confirmation.'), 'success');
    return true;
  } catch (e) {
    toastRef.value?.notify(e.message, 'error');
    return false;
  } finally {
    stripeLoading.value = false;
  }
};

let consultandoEstado = false;
const consultarEstadoStripe = async (silent = false) => {
  if (!stripeQR.value || consultandoEstado) return;
  consultandoEstado = true;
  try {
    const qr = stripeQR.value;
    const data = await apiRequest(`/stripe/checkout/${encodeURIComponent(qr.session_id)}/estado`);
    if (stripeQR.value?.session_id !== qr.session_id) return;
    stripeEstado.value = data.estado || 'Pendiente';

    if (data.estado === 'Pagado') {
      // El registro real debe existir antes de emitir un recibo.
      const pagoData = await apiRequest(`/clientes/${qr.inscripcionId}/pagos?sede_id=${encodeURIComponent(qr.sedeId)}`);
      const pago = (Array.isArray(pagoData.pagos) ? pagoData.pagos : []).find((p) => String(p.ID_Pago) === String(data.ID_Pago));
      const folio = pago?.Folio_Referencia || pago?.folio || data.folio || data.Folio_Referencia;
      if (!folio) { stripeEstado.value = 'Pagado · esperando folio'; return; }

      detenerStripe();
      ultimoPago.value = {
        folio,
        fecha: fechaSolo(pago?.Fecha_Pagada || data.fecha || new Date().toISOString()),
        cliente: qr.cliente,
        metodo: 'Stripe',
        monto: Number(pago?.Monto ?? qr.monto),
        concepto: 'monthly',
        plan: qr.plan,
        participantes: [qr.cliente],
        gimnasio: pagoData.gimnasio
      };
      const registro = qr.registro;
      stripeQR.value = null;
      stripeEstado.value = '';
      qrPagoConfirmado.value = true;
      qrFolio.value = folio;
      toastRef.value?.notify(txt('Pago confirmado. Folio y recibo disponibles.', 'Payment confirmed. Receipt ready.'), 'success');
      window.dispatchEvent(new CustomEvent('factorfit:clientes-changed', { detail: { sede_id: sedeActual() } }));
      await mostrarQR(registro);
    } else if (['Fallido', 'Cancelado', 'Expirado'].includes(data.estado)) {
      detenerStripe();
      toastRef.value?.notify(txt('El pago no se completó.', 'Payment was not completed.'), 'error');
    }
  } catch (e) {
    if (!silent) toastRef.value?.notify(e.message, 'error');
  } finally {
    consultandoEstado = false;
  }
};

// Cierra el QR de cobro sin cancelar el pago: la inscripción queda pendiente.
const ocultarStripe = async () => {
  const registro = stripeQR.value?.registro;
  detenerStripe();
  stripeQR.value = null;
  stripeEstado.value = '';
  toastRef.value?.notify(txt('Inscripción pendiente de pago. Puedes confirmarla desde Pagos.', 'Enrollment pending payment. You can confirm it from Payments.'), 'info');
  if (registro?.ID_Inscripto) await mostrarQR(registro);
};

/* =========================================================
   RECIBO
========================================================= */
const ultimoPago = ref(null);
const reciboVisible = ref(false);
const reciboLocale = computed(() => (currentLang.value === 'en' ? 'en-US' : 'es-MX'));
const downloadReceipt = () => {
  if (!ultimoPago.value) {
    toastRef.value?.notify(txt('Primero registra y confirma un pago para generar el recibo.', 'Register and confirm a payment first to generate the receipt.'), 'warning');
    return;
  }
  reciboVisible.value = true;
};
const verReciboDesdeQR = () => {
  cerrarQR();
  reciboVisible.value = true;
};
const handleReciboNotify = (payload) => {
  if (payload) toastRef.value?.notify(payload.message, payload.type);
};

/* =========================================================
   FOTO / GALERÍA
========================================================= */
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const isValidImage = (file) => !!file && ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
const notifyInvalidImage = () => {
  toastRef.value?.notify(txt('Selecciona una imagen de máximo 4 MB.', 'Select an image of up to 4 MB.'), 'warning');
};

const fileInput = ref(null);
const avatarPreview = ref(null);
const avatarFile = ref(null);
const showPhotoOptions = ref(false);

const openPhotoOptions = () => { showPhotoOptions.value = true; };
const closePhotoOptions = () => { showPhotoOptions.value = false; };
const selectPhoto = () => {
  showPhotoOptions.value = false;
  if (!fileInput.value) return;
  fileInput.value.value = '';
  fileInput.value.click();
};
const setAvatarFile = (file) => {
  if (!file) return;
  if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) URL.revokeObjectURL(avatarPreview.value);
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
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
  toastRef.value?.notify(txt('Foto agregada correctamente.', 'Photo added successfully.'), 'success');
  event.target.value = '';
};

/* =========================================================
   CÁMARA
========================================================= */
const showCamera = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
const cameraStream = ref(null);
const cameraFacingMode = ref('user'); // user = frontal, environment = trasera
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
    video: { facingMode: { ideal: cameraFacingMode.value }, width: { ideal: 1280 }, height: { ideal: 720 } }
  });
  cameraStream.value = stream;
  await nextTick();
  if (!videoRef.value) throw new Error('No se encontró el elemento de video.');
  videoRef.value.srcObject = stream;
  await videoRef.value.play();
};

const takePhoto = async () => {
  showPhotoOptions.value = false;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toastRef.value?.notify(txt('Este navegador no permite utilizar la cámara.', 'Camera is not supported by this browser.'), 'warning');
    return;
  }
  cameraFacingMode.value = 'user';
  showCamera.value = true;
  await nextTick();
  try {
    await startCamera();
  } catch (error) {
    console.error('No se pudo abrir la cámara:', error);
    stopCamera();
    showCamera.value = false;
    let message = txt('No se pudo acceder a la cámara.', 'Could not access the camera.');
    if (error?.name === 'NotAllowedError') message = txt('El permiso de cámara fue rechazado. Activa el permiso de cámara en tu navegador.', 'Camera permission was denied. Enable camera permission in your browser.');
    if (error?.name === 'NotFoundError') message = txt('No se encontró una cámara en este dispositivo.', 'No camera was found on this device.');
    if (error?.name === 'NotReadableError') message = txt('La cámara está siendo utilizada por otra aplicación.', 'The camera is being used by another application.');
    toastRef.value?.notify(message, 'warning');
  }
};

const switchCamera = async () => {
  if (switchingCamera.value) return;
  switchingCamera.value = true;
  const previousMode = cameraFacingMode.value;
  cameraFacingMode.value = previousMode === 'user' ? 'environment' : 'user';
  try {
    await startCamera();
  } catch (error) {
    console.error('No se pudo cambiar de cámara:', error);
    cameraFacingMode.value = previousMode;
    try {
      await startCamera();
    } catch (restoreError) {
      console.error('No se pudo restaurar la cámara:', restoreError);
      closeCamera();
    }
    toastRef.value?.notify(txt('La cámara seleccionada no está disponible.', 'The selected camera is not available.'), 'warning');
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
  if (!video || !canvas) return;
  if (!video.videoWidth || !video.videoHeight) {
    toastRef.value?.notify(txt('La cámara todavía no está lista.', 'The camera is not ready yet.'), 'warning');
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    toastRef.value?.notify(txt('No se pudo procesar la fotografía.', 'Could not process the photo.'), 'error');
    return;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (cameraFacingMode.value === 'user') {
    // Frontal: se guarda como se ve en la vista previa (espejo).
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();
  } else {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  canvas.toBlob((blob) => {
    if (!blob) {
      toastRef.value?.notify(txt('No se pudo capturar la fotografía.', 'Could not capture the photo.'), 'error');
      return;
    }
    const file = new File([blob], `cliente-${Date.now()}.jpg`, { type: 'image/jpeg' });
    if (!isValidImage(file)) { notifyInvalidImage(); return; }
    setAvatarFile(file);
    closeCamera();
    toastRef.value?.notify(txt('Foto tomada correctamente.', 'Photo captured successfully.'), 'success');
  }, 'image/jpeg', 0.92);
};

/* =========================================================
   REGISTRO
========================================================= */
const saveRegistration = async () => {
  if (guardando.value) return;
  const avisar = (mensaje, tipo = 'warning') => toastRef.value?.notify(mensaje, tipo);

  if (!form.nombres.trim() || !form.apellidoP.trim() || !idPrecio.value) {
    avisar('Nombre, apellido paterno y tarifa son obligatorios.');
    return;
  }
  if (form.celular && !celularValido()) { avisar('El celular debe tener exactamente 10 dígitos, sin +52.'); return; }
  if (!sedeActual()) { avisar('Selecciona una sucursal.'); return; }
  if (!permitePendiente.value && !cobrarAhora.value) { avisar('El corte de este mes pasó. Cobra ahora.'); return; }
  if (!tarifaSeleccionada.value) { avisar('La tarifa no coincide con la membresía.'); return; }
  if (!form.fechaInscripcion || !form.fechaCorte) { avisar('Espera a que se calcule la fecha de vencimiento.'); return; }
  if (avatarFile.value && !isValidImage(avatarFile.value)) { notifyInvalidImage(); return; }

  if (cobrarAhora.value) {
    if (!metodoPagoRegistro.value) { avisar('Selecciona el método de pago.'); return; }
    if (!(Number(tarifaSeleccionada.value.Precio) > 0)) { avisar('La tarifa debe tener un precio válido.'); return; }
    if (metodoPagoRegistro.value === 'Transferencia' && !referenciaPagoRegistro.value.trim()) {
      avisar('Ingresa la referencia del pago.');
      return;
    }
    if (usaStripe.value) {
      const cuenta = stripeCuenta.value || (await consultarStripeCuenta());
      if (!cuenta?.charges_enabled) {
        avisar(txt('Conecta y habilita la cuenta Stripe del gimnasio antes de cobrar con tarjeta.', 'Connect and enable the gym Stripe account before charging by card.'));
        return;
      }
    }
  }

  guardando.value = true;
  try {
    // Se capturan antes de limpiar el formulario.
    const nombreCliente = clientName.value;
    const tarifa = tarifaSeleccionada.value;
    const metodo = metodoPagoRegistro.value;
    const viaStripe = usaStripe.value;
    // Con tarjeta, la inscripción se registra pendiente y el cobro lo confirma Stripe.
    const cobrar = cobrarAhora.value && !viaStripe;

    const data = new FormData();
    const values = {
      sede_id: sedeActual(),
      id_precio: idPrecio.value,
      nombres: form.nombres.trim(),
      apellidoP: form.apellidoP.trim(),
      apellidoM: form.apellidoM.trim(),
      fechaNacimiento: form.fechaNacimiento,
      celular: celularParaGuardar(),
      email: form.email.trim(),
      peso: form.peso,
      altura: form.altura,
      fechaInscripcion: form.fechaInscripcion
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) data.append(key, String(value));
    });
    if (avatarFile.value) data.append('foto', avatarFile.value);
    if (diaCorteElegido.value) data.append('dia_corte_elegido', String(diaCorteElegido.value));
    data.append('cobrar_ahora', cobrar ? '1' : '0');
    if (cobrar) {
      data.append('metodo_pago', metodo);
      // Se envía siempre el folio: vacío (efectivo, lo genera el servidor) o la referencia capturada.
      data.append('referencia_pago', referenciaPagoRegistro.value.trim());
    }

    const res = await fetch(clientesApi, { method: 'POST', headers: authHeaders(), body: data });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Error API registro de cliente', { status: res.status, response: result });
      throw new Error(
        Object.values(result.errors || {}).flat().join(' ') ||
        (result.message && result.message !== 'Server Error' ? result.message : '') ||
        `Error HTTP ${res.status}: revisa los logs de Laravel.`
      );
    }

    // Nunca inferir pago exitoso de HTTP 200/201: el servidor debe confirmarlo.
    const pagoConfirmado = result.pago_confirmado === true && result.membresia_activa === true;
    qrPagoConfirmado.value = cobrar && pagoConfirmado;
    qrFolio.value = result.folio || '';

    if (cobrar && !pagoConfirmado) {
      avisar('Registro recibido, pero el pago y la activación NO están confirmados. Revisa el cliente en cobros antes de intentar otra vez.', 'warning');
    } else if (viaStripe) {
      avisar(txt('Cliente registrado. Escanea el QR para cobrar con tarjeta.', 'Client registered. Scan the QR to charge by card.'), 'success');
    } else {
      avisar(result.message || (pagoConfirmado ? 'Cliente registrado y pago confirmado.' : 'Cliente registrado pendiente de pago.'), 'success');
    }

    // Recibo del pago (efectivo / transferencia)
    if (cobrar && pagoConfirmado) {
      ultimoPago.value = {
        folio: result.folio || result.Folio_Referencia || '',
        fecha: fechaSolo(result.fecha || new Date().toISOString()),
        cliente: nombreCliente,
        metodo,
        monto: Number(result.monto ?? tarifa.Precio),
        concepto: 'monthly',
        plan: result.plan || tarifa.Nombre_Paquete,
        participantes: [nombreCliente],
        gimnasio: result.gimnasio
      };
    }

    // Limpiar formulario
    Object.assign(form, {
      nombres: '', apellidoP: '', apellidoM: '', fechaNacimiento: '', celular: '', email: '',
      peso: '', altura: '', tipoMembresia: 'mes', fechaInscripcion: fechaLocal(), fechaCorte: ''
    });
    if (avatarPreview.value?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview.value);
    avatarPreview.value = null;
    avatarFile.value = null;
    idPrecio.value = '';
    metodoPagoRegistro.value = '';
    referenciaPagoRegistro.value = '';
    cobrarAhora.value = true;
    openSelect.value = '';
    window.dispatchEvent(new CustomEvent('factorfit:clientes-changed', { detail: { sede_id: sedeActual() } }));

    if (result.ID_Inscripto) {
      if (viaStripe) {
        const ok = await crearStripeQR(result, tarifa, nombreCliente);
        if (!ok) await mostrarQR(result); // Quedó pendiente: muestra el QR de acceso.
      } else {
        await mostrarQR(result);
      }
    }
  } catch (error) {
    avisar(error.message || 'No se pudo registrar el cliente.', 'error');
  } finally {
    guardando.value = false;
  }
};

/* =========================================================
   CICLO DE VIDA
========================================================= */
onMounted(() => {
  if (!form.fechaInscripcion) form.fechaInscripcion = fechaLocal();
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', cargarTarifas);
  document.addEventListener('click', cerrarSelectsAlClickFuera);
  cargarTarifas();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', cargarTarifas);
  document.removeEventListener('click', cerrarSelectsAlClickFuera);
  detenerStripe();
  stopCamera();
  cerrarQR();
  if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) URL.revokeObjectURL(avatarPreview.value);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&family=Oswald:wght@400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

* { box-sizing: border-box; }
i.bi { display: inline-block; line-height: 1; }
.hidden-input, .hidden-canvas { display: none; }

/* =========================================================
   BASE
========================================================= */
.reg-page {
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

.profile-summary { display: grid; margin: 24px 0 0; padding: 4px 6px; text-align: left; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 2.5%, transparent); }
.summary-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 10px; min-width: 0; }
.summary-row + .summary-row { border-top: 1px solid var(--line); }
.summary-row dt { display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: var(--muted); font-size: 0.72rem; font-weight: 500; }
.summary-row dt i { color: var(--accent); font-size: 0.85rem; }
.summary-row dd { min-width: 0; margin: 0; overflow: hidden; color: var(--title); font-size: 0.8rem; font-weight: 600; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.summary-row dd.empty { opacity: 0.4; }
.plan-chip { display: inline-block; padding: 3px 11px; color: var(--accent); border-radius: 999px; background: color-mix(in srgb, var(--accent) 16%, transparent); }

/* =========================================================
   TARJETAS
========================================================= */
.forms-col { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.card { position: relative; min-width: 0; padding: 26px 28px 28px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); }
.membership-card { z-index: 2; display: flex; flex-direction: column; gap: 20px; }
.card-head { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.membership-card .card-head { margin-bottom: 2px; }
.card-head .grow { flex: 1; min-width: 0; }
.card-icon { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1.2rem; border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent); border-radius: 12px; background: color-mix(in srgb, var(--accent) 10%, transparent); }
.card-title { margin: 0; color: var(--title); font-family: 'Anton', sans-serif; font-size: 1.15rem; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase; }
.card-desc { margin: 3px 0 0; color: var(--muted); font-size: 0.78rem; line-height: 1.4; }
.head-actions { display: flex; gap: 8px; flex-shrink: 0; }
.icon-btn { width: 40px; height: 40px; display: grid; place-items: center; cursor: pointer; color: var(--text); font-size: 1rem; border: 1px solid var(--line-strong); border-radius: 11px; background: color-mix(in srgb, var(--text) 4%, transparent); transition: all 0.16s ease; }
.icon-btn:hover { color: var(--button-text); border-color: var(--accent); background: var(--accent); }

.grid { display: grid; gap: 18px; }
.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }

/* =========================================================
   CAMPOS
========================================================= */
.field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.field > label, .tile-body > label { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--muted); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.01em; }

input:not([type='radio']):not([type='file']) {
  width: 100%; height: 48px; min-width: 0; padding: 0 14px; outline: none;
  color: var(--color-texto-input, var(--text)); color-scheme: dark; font-family: 'Inter', sans-serif; font-size: 0.9rem;
  border: 1.5px solid var(--line-strong); border-radius: 12px; background: var(--input-bg);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
input::placeholder { color: var(--muted-2); }
input:not([type='radio']):hover { border-color: color-mix(in srgb, var(--text) 32%, transparent); }
input:not([type='radio']):focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
input[readonly] { cursor: default; }
input:disabled { cursor: not-allowed; }
input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
input[type='number']::-webkit-inner-spin-button, input[type='number']::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }

.control { position: relative; display: flex; align-items: center; min-width: 0; }
.control-icon { position: absolute; left: 14px; z-index: 2; color: var(--muted-2); font-size: 0.95rem; pointer-events: none; }
.control.has-icon input { padding-left: 42px; }
.control-suffix { position: absolute; right: 14px; color: var(--muted); font-size: 0.74rem; font-weight: 600; pointer-events: none; }
.control.has-suffix input { padding-right: 48px; }
.control.locked input { border-style: dashed; background: color-mix(in srgb, var(--text) 3%, var(--input-bg)); }
.control.locked input::placeholder { color: var(--muted); font-style: italic; }

.tile-field { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 16px; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 2%, transparent); }
.tile-icon { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1.15rem; border-radius: 12px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
.tile-field.accent { border-color: color-mix(in srgb, var(--ok) 28%, var(--line)); }
.tile-field.accent .tile-icon { color: var(--ok); background: rgba(52, 211, 153, 0.12); }
.tile-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }

.badge { padding: 2px 8px; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.6px; border-radius: 999px; }
.badge.auto { color: var(--ok-text); background: rgba(52, 211, 153, 0.12); }
.badge.required { color: var(--warn-text); background: rgba(251, 191, 36, 0.12); }

.note { display: flex; align-items: flex-start; gap: 9px; margin: 0; font-size: 0.78rem; line-height: 1.5; }
.note i { flex-shrink: 0; margin-top: 2px; }
.note.info { padding: 10px 12px; color: var(--muted); border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 6%, transparent); }
.note.info i { color: var(--accent); }
.note.warn { padding: 10px 12px; color: var(--warn-text); border: 1px solid rgba(251, 191, 36, 0.28); border-radius: 10px; background: rgba(251, 191, 36, 0.07); }
.note.muted { color: var(--muted); }
.note.muted i { color: var(--ok); }

/* =========================================================
   PERIODO (control segmentado de 4 opciones)
========================================================= */
.segmented { position: relative; display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); padding: 4px; border: 1px solid var(--line-strong); border-radius: 14px; background: var(--input-bg); }
.segmented-thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 8px) / var(--n, 4)); border-radius: 10px; background: var(--accent); box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--accent) 70%, transparent); transform: translateX(calc(var(--i, 0) * 100%)); transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.segment { position: relative; z-index: 1; min-width: 0; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 8px; cursor: pointer; color: var(--muted); font-family: inherit; font-size: 0.86rem; font-weight: 600; white-space: nowrap; border: 0; border-radius: 10px; background: transparent; transition: color 0.2s ease; }
.segment:hover:not(.active) { color: var(--text); }
.segment.active { color: var(--button-text, #fff); }
.segment i { font-size: 1rem; }
.segment:focus-visible { outline: 2px solid var(--title); outline-offset: -3px; }

/* =========================================================
   SELECT PERSONALIZADO
========================================================= */
.ff-select { position: relative; }
.ff-select.open { z-index: 60; }
.ff-trigger { width: 100%; min-height: 56px; display: flex; align-items: center; gap: 12px; padding: 0 16px 0 10px; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; font-size: 0.9rem; border: 1.5px solid var(--line-strong); border-radius: 14px; background: var(--input-bg); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.ff-trigger:hover { border-color: color-mix(in srgb, var(--accent) 55%, transparent); }
.ff-select.open .ff-trigger, .ff-trigger:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent); }
.ff-trigger-icon { width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1rem; border-radius: 10px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
.ff-trigger-value { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ff-trigger-value.placeholder { justify-content: flex-start; color: var(--muted-2); }
.ff-trigger-value strong { min-width: 0; overflow: hidden; color: var(--title); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.ff-trigger-value em { flex-shrink: 0; color: var(--ok); font: 600 1rem 'Oswald', sans-serif; font-style: normal; letter-spacing: 0.3px; }
.ff-trigger-value em.plain { color: var(--muted); font: 500 0.8rem 'Inter', sans-serif; letter-spacing: 0; }
.ff-chevron { flex-shrink: 0; color: var(--muted); font-size: 0.85rem; transition: transform 0.2s ease; }
.ff-select.open .ff-chevron { transform: rotate(180deg); }

.ff-menu { position: absolute; z-index: 70; top: calc(100% + 8px); left: 0; right: 0; max-height: 280px; margin: 0; padding: 6px; overflow-y: auto; list-style: none; border: 1px solid var(--line-strong); border-radius: 14px; background: var(--card); box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55); scrollbar-width: thin; }
.ff-menu li { display: flex; align-items: center; gap: 10px; padding: 12px 12px; cursor: pointer; color: var(--text); font-size: 0.88rem; font-weight: 500; border-radius: 10px; transition: background 0.14s ease; }
.ff-menu li + li { margin-top: 2px; }
.ff-menu li:hover { background: color-mix(in srgb, var(--accent) 13%, transparent); }
.ff-menu li.selected { color: var(--title); background: color-mix(in srgb, var(--accent) 18%, transparent); }
.opt-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.opt-price { flex-shrink: 0; color: var(--ok); font: 600 0.95rem 'Oswald', sans-serif; letter-spacing: 0.3px; }
.opt-hint { flex-shrink: 0; color: var(--muted); font-size: 0.76rem; }
.opt-check { flex-shrink: 0; color: var(--accent); font-size: 1rem; }
.ff-menu li.ff-empty { justify-content: center; gap: 8px; padding: 18px 12px; color: var(--muted); font-size: 0.8rem; cursor: default; }
.ff-menu li.ff-empty:hover { background: transparent; }
.dd-enter-active, .dd-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.dd-enter-from, .dd-leave-to { opacity: 0; transform: translateY(-6px); }

/* =========================================================
   PAGO INICIAL
========================================================= */
.payment-block { display: flex; flex-direction: column; gap: 18px; margin-top: 4px; padding-top: 24px; border-top: 1px solid var(--line); }
.block-head { display: flex; align-items: center; gap: 12px; }
.block-icon { width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1.05rem; border-radius: 11px; background: color-mix(in srgb, var(--accent) 12%, transparent); }
.block-head h4 { margin: 0; color: var(--title); font-family: 'Anton', sans-serif; font-size: 1.02rem; font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase; }
.block-head p { margin: 2px 0 0; color: var(--muted); font-size: 0.76rem; }

.total-box { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line)); border-radius: 14px; background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--input-bg)), var(--input-bg) 65%); }
.total-box span { color: var(--muted); font-size: 0.86rem; font-weight: 500; }
.total-box strong { color: var(--ok); font: 700 1.7rem 'Oswald', sans-serif; letter-spacing: 0.3px; }

.choice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.choice { position: relative; min-width: 0; min-height: 68px; display: flex; align-items: center; gap: 14px; padding: 12px 16px; cursor: pointer; border: 1.5px solid var(--line-strong); border-radius: 14px; background: color-mix(in srgb, var(--text) 2%, transparent); transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease; }
.choice:hover { border-color: color-mix(in srgb, var(--accent) 55%, transparent); }
.choice.selected { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
.choice.disabled { opacity: 0.45; cursor: not-allowed; }
.choice input { position: absolute; width: 1px; height: 1px; margin: 0; padding: 0; opacity: 0; pointer-events: none; }
.choice:focus-within { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
.choice-dot { position: relative; width: 22px; height: 22px; flex-shrink: 0; border: 2px solid var(--line-strong); border-radius: 50%; transition: border-color 0.18s ease; }
.choice-dot::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--accent); transform: scale(0); transition: transform 0.18s ease; }
.choice.selected .choice-dot { border-color: var(--accent); }
.choice.selected .choice-dot::after { transform: scale(1); }
.choice-text { min-width: 0; flex: 1; display: grid; gap: 2px; }
.choice-text strong { color: var(--title); font-size: 0.86rem; font-weight: 600; line-height: 1.25; }
.choice-text small { color: var(--muted); font-size: 0.72rem; }
.choice-icon { flex-shrink: 0; color: var(--muted-2); font-size: 1.15rem; }
.choice.selected .choice-icon { color: var(--accent); }

/* Método de pago (igual que en Pagos) */
.method-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.method-tile { position: relative; min-width: 0; min-height: 66px; display: flex; align-items: center; gap: 12px; padding: 13px 14px; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; border: 1.5px solid var(--line-strong); border-radius: 14px; background: var(--input-bg); transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
.method-tile:hover { border-color: color-mix(in srgb, var(--accent) 55%, var(--line-strong)); transform: translateY(-1px); }
.method-tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.method-tile.active { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--input-bg)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.method-icon { width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; color: var(--muted); font-size: 1.15rem; border-radius: 11px; background: color-mix(in srgb, var(--text) 7%, transparent); transition: all 0.18s ease; }
.method-tile.active .method-icon { color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, transparent); }
.method-text { min-width: 0; }
.method-text strong { display: block; color: var(--title); font-size: 0.88rem; font-weight: 600; line-height: 1.25; }
.method-text small { display: block; margin-top: 2px; color: var(--muted); font-size: 0.72rem; line-height: 1.3; }
.method-check { position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; display: grid; place-items: center; color: var(--card); font-size: 0.7rem; border-radius: 50%; background: var(--accent); opacity: 0; transform: scale(0.6); transition: opacity 0.18s ease, transform 0.18s ease; }
.method-tile.active .method-check { opacity: 1; transform: scale(1); }

/* Stripe */
.stripe-box { display: flex; flex-direction: column; gap: 14px; padding: 18px; border: 1px solid color-mix(in srgb, #635bff 38%, var(--line)); border-radius: 14px; background: linear-gradient(180deg, color-mix(in srgb, #635bff 9%, var(--input-bg)), var(--input-bg)); }
.stripe-head { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.stripe-icon { width: 42px; height: 42px; flex-shrink: 0; display: grid; place-items: center; color: #b4afff; font-size: 1.2rem; border-radius: 11px; background: rgba(99, 91, 255, 0.18); }
.stripe-head-text { min-width: 0; flex: 1 1 200px; }
.stripe-head-text strong { display: block; color: var(--title); font-size: 0.92rem; }
.stripe-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 0.8rem; font-weight: 600; }
.stripe-status i { width: 7px; height: 7px; border-radius: 50%; }
.stripe-status.ok { color: var(--ok-text); }
.stripe-status.ok i { background: var(--ok); box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18); }
.stripe-status.warn { color: var(--warn-text); }
.stripe-status.warn i { background: var(--warn); box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18); }
.stripe-hint { display: flex; align-items: flex-start; gap: 9px; margin: 0; color: var(--muted); font-size: 0.82rem; line-height: 1.5; }
.stripe-hint i { margin-top: 2px; color: var(--accent); }

/* =========================================================
   BOTONES
========================================================= */
.btn { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 20px; cursor: pointer; text-decoration: none; white-space: nowrap; font-family: 'Inter', sans-serif; font-size: 0.86rem; font-weight: 700; border: 1px solid transparent; border-radius: 12px; transition: filter 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease; }
.btn i { font-size: 1rem; }
.btn.sm { min-height: 38px; padding: 0 14px; font-size: 0.78rem; }
.btn.block { width: 100%; }
.btn-primary { color: var(--button-text); background: linear-gradient(135deg, var(--button), color-mix(in srgb, var(--button) 76%, black)); box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--button) 65%, transparent); }
.btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-primary:disabled { cursor: wait; opacity: 0.55; box-shadow: none; }
.btn-soft { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 45%, transparent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.btn-soft:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 15%, transparent); }
.btn-ghost { color: var(--muted); border-color: var(--line-strong); background: transparent; }
.btn-ghost:hover { color: var(--text); border-color: var(--text); }
.link-btn { padding: 8px; cursor: pointer; color: var(--muted); font-family: inherit; font-size: 0.8rem; text-decoration: underline; text-underline-offset: 3px; border: 0; background: transparent; }
.link-btn:hover { color: var(--text); }
.btn:focus-visible, .icon-btn:focus-visible, .link-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.reg-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 2px 0; }
.req-hint { color: var(--muted); font-size: 0.78rem; font-weight: 500; }
.footer-actions { display: flex; align-items: center; gap: 12px; }
.receipt-btn { min-height: 52px; }
.receipt-btn em { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; color: var(--ok-text); font-size: 0.68rem; font-style: normal; font-weight: 700; border-radius: 999px; background: rgba(52, 211, 153, 0.12); }
.receipt-btn em i { width: 5px; height: 5px; border-radius: 50%; background: var(--ok); }
.receipt-btn.ready { color: var(--ok-text); border-color: rgba(52, 211, 153, 0.4); background: rgba(52, 211, 153, 0.07); }
.save-btn { min-width: 250px; min-height: 52px; font-family: 'Oswald', sans-serif; font-size: 0.98rem; letter-spacing: 0.3px; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* =========================================================
   DIÁLOGOS (QR, Stripe, foto, cámara)
========================================================= */
.modal-wrapper { position: fixed; z-index: 3000; inset: 0; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(0, 0, 0, 0.78); }
.overlay { position: fixed; z-index: 3500; inset: 0; display: grid; place-items: center; padding: 18px; background: rgba(0, 0, 0, 0.78); backdrop-filter: blur(5px); }
.overlay.dark { background: rgba(0, 0, 0, 0.9); }
.dialog { position: relative; width: min(440px, 100%); max-height: 94vh; overflow-y: auto; padding: 30px 24px 24px; text-align: center; color: var(--text); border: 1px solid var(--line-strong); border-radius: 22px; background: var(--card); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55); font-family: 'Inter', sans-serif; }
.dialog h2 { margin: 12px 0 6px; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.5rem; font-weight: 600; letter-spacing: 0.3px; }
.dialog-sub { margin: 0; color: var(--muted); font-size: 0.86rem; }
.dialog-close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer; color: var(--muted); border: 1px solid var(--line); border-radius: 10px; background: transparent; }
.dialog-close:hover { color: var(--text); border-color: var(--line-strong); }
.dialog-icon { width: 58px; height: 58px; display: inline-grid; place-items: center; font-size: 1.7rem; border-radius: 18px; }
.dialog-icon.ok { color: var(--ok); background: rgba(52, 211, 153, 0.12); }
.dialog-icon.warn { color: var(--warn); background: rgba(251, 191, 36, 0.12); }
.dialog-icon.stripe { color: #b4afff; background: rgba(99, 91, 255, 0.18); }
.dialog-folio { margin: 10px 0 0; color: var(--muted); font-size: 0.84rem; }
.dialog-folio strong { color: var(--title); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.5px; }
.dialog-status { margin: 14px 0 0; padding: 10px 14px; color: var(--warn-text); font-size: 0.8rem; line-height: 1.45; border-radius: 10px; background: rgba(251, 191, 36, 0.09); }
.dialog-status.ok { color: var(--ok-text); background: rgba(52, 211, 153, 0.09); }
.dialog-muted { margin: 16px 0 0; color: var(--muted); font-size: 0.86rem; }
.dialog-error { margin: 16px 0 0; color: #fca5a5; font-size: 0.86rem; }
.qr-image { width: min(270px, 100%); aspect-ratio: 1; margin: 16px auto 0; padding: 12px; object-fit: contain; border-radius: 16px; background: #fff; }
.dialog-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px; }

.stripe-qr-frame { width: fit-content; margin: 18px auto 0; padding: 14px; border-radius: 18px; background: #fff; box-shadow: 0 16px 32px -10px rgba(0, 0, 0, 0.6); }
.stripe-qr-frame img { width: 216px; max-width: 100%; display: block; }
.scan-hint { display: inline-flex; align-items: center; gap: 7px; margin: 12px 0 0; color: var(--muted); font-size: 0.78rem; }
.scan-hint i { color: var(--accent); }
.stripe-amount { display: flex; flex-direction: column; gap: 2px; margin-top: 16px; }
.stripe-amount span { color: var(--muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.8px; }
.stripe-amount strong { color: var(--title); font-family: 'IBM Plex Mono', monospace; font-size: 2.1rem; font-weight: 700; letter-spacing: -0.5px; }
.stripe-amount small { color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; }
.state-pill { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 5px 13px; color: var(--warn-text); font-size: 0.76rem; font-weight: 700; border-radius: 999px; background: rgba(251, 191, 36, 0.12); }
.state-pill i { width: 7px; height: 7px; border-radius: 50%; background: var(--warn); animation: pulse 1.6s ease-in-out infinite; }
.state-pill.paid { color: var(--ok-text); background: rgba(52, 211, 153, 0.12); }
.state-pill.paid i { background: var(--ok); animation: none; }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.55); } 50% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); } }

.dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; text-align: left; }
.eyebrow { display: block; margin-bottom: 5px; color: var(--accent); font-size: 0.62rem; font-weight: 700; letter-spacing: 1px; }
.dialog-head h3 { margin: 0; color: var(--title); font-family: 'Anton', sans-serif; font-size: 1.25rem; font-weight: 400; text-transform: uppercase; }
.dialog-head p { margin: 5px 0 0; color: var(--muted); font-size: 0.76rem; line-height: 1.5; }
.dialog-x { width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center; cursor: pointer; color: var(--text); border: 1px solid var(--line); border-radius: 10px; background: rgba(255, 255, 255, 0.04); }

.photo-dialog { text-align: left; }
.sheet-handle { display: none; }
.photo-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.photo-option { width: 100%; min-height: 72px; display: flex; align-items: center; gap: 14px; padding: 12px 14px; cursor: pointer; text-align: left; color: var(--muted); font-family: inherit; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--text) 2.5%, transparent); transition: border-color 0.16s ease, background 0.16s ease; }
.photo-option:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent); }
.photo-option-icon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; color: var(--accent); font-size: 1.25rem; border-radius: 12px; background: color-mix(in srgb, var(--accent) 14%, transparent); }
.photo-option-text { flex: 1; min-width: 0; }
.photo-option-text strong { display: block; color: var(--title); font-size: 0.88rem; font-weight: 600; }
.photo-option-text small { display: block; margin-top: 3px; color: var(--muted); font-size: 0.72rem; }

.camera-dialog { width: min(620px, 100%); text-align: left; }
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
.pop-enter-active, .pop-leave-active { transition: all 0.25s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.95); }

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 1050px) {
  .reg-layout { grid-template-columns: 260px minmax(0, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .method-grid { grid-template-columns: 1fr; }
}

@media (max-width: 850px) {
  .reg-layout { grid-template-columns: minmax(0, 1fr); }
  .profile-card { position: relative; top: 0; max-width: 460px; width: 100%; margin: 0 auto; }
}

@media (max-width: 650px) {
  .reg-page { padding: 14px 12px calc(34px + env(safe-area-inset-bottom, 0px)); }
  .card { padding: 20px 16px 22px; }
  .card-head { flex-wrap: wrap; }
  .membership-card .card-head .grow { flex-basis: calc(100% - 70px); }
  .head-actions { margin-left: auto; }
  .grid-3, .grid-2, .choice-grid { grid-template-columns: minmax(0, 1fr); }
  .segment { flex-direction: column; gap: 3px; height: 54px; font-size: 0.72rem; }
  .segment i { font-size: 1.05rem; }
  .total-box strong { font-size: 1.45rem; }
  .ff-trigger-value { flex-direction: column; align-items: flex-start; gap: 1px; }
  input:not([type='radio']):not([type='file']) { font-size: 1rem; } /* evita el zoom de iOS */
  .reg-footer { flex-direction: column-reverse; align-items: stretch; }
  .footer-actions { flex-direction: column-reverse; align-items: stretch; }
  .save-btn { min-width: 0; width: 100%; }
  .receipt-btn { width: 100%; }

  /* Hojas inferiores */
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
  .tile-field { padding: 13px; }
  .switch-camera span { display: none; }
  .switch-camera { width: 40px; height: 40px; padding: 0; justify-content: center; }
  .dialog-actions .btn { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>