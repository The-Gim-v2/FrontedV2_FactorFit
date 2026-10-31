<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeadingGYM_ACCOUNT from '../HeadingGYM_ACCOUNT.vue';
import Promo from './Promos.vue';
import ReciboPago from './ReciboPago.vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
import { traducciones } from '../i18n.js';

const route = useRoute();
const router = useRouter();
const currentLang = ref(localStorage.getItem('GYM_ACCOUNT-idioma') || 'es');
const t = key => (traducciones[currentLang.value] || traducciones.es)[key] || traducciones.es[key] || key;
const txt = (es, en) => (currentLang.value === 'en' ? en : es);
const localStrings = {
  es: { confirmBeforeDownload: 'Primero confirma el pago para generar el recibo.', receiptReadyToast: 'Recibo generado. Descárgalo en PNG o PDF.' },
  en: { confirmBeforeDownload: 'Confirm the payment first to generate the receipt.', receiptReadyToast: 'Receipt ready. Download it as PNG or PDF.' }
};
const lt = key => localStrings[currentLang.value]?.[key] || localStrings.es[key] || key;
const handleLangChange = e => { if (e.detail?.idioma) currentLang.value = e.detail.idioma; };

const activeModal = ref(null);
const toastRef = ref(null);
const reciboRef = ref(null);
const montoRecibir = ref(null);
const tipoPago = ref('');
const folioReferencia = ref('');
const ofertaSeleccionada = ref(null);
// Una clave estable evita duplicar la operación si se repite la solicitud.
const nuevaOperacionId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ff${Date.now()}_${Math.random().toString(36).slice(2)}`);
const operacionId = ref(nuevaOperacionId());
const ultimoPago = ref(null);
const reciboVisible = ref(false);
const loading = ref(true);
const saving = ref(false);
const errorCarga = ref('');

const stripeCuenta = ref(null);
const stripeQR = ref(null);
const stripeEstado = ref('');
const stripeLoading = ref(false);
let stripeTimer = null;

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const fotoDefault = new URL('../../../assets/humano.jpg', import.meta.url).href;

/* =========================================================
   SESIÓN / API
========================================================= */
const getToken = () => {
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['token', 'auth_token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken']) {
      const v = storage.getItem(key);
      if (v) return v.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth', 'user', 'session', 'gymAccount', 'gym_account']) {
      try {
        const v = JSON.parse(storage.getItem(key) || 'null');
        const token = v?.token || v?.access_token || v?.accessToken;
        if (token) return token;
      } catch { /* valor no JSON */ }
    }
  }
  return '';
};

const obtenerSedeId = () => {
  const queryId = Number(route.query.sede_id);
  if (Number.isInteger(queryId) && queryId > 0) return queryId;
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of ['selected_sede_id', 'sede_id', 'ID_Sede', 'id_sede', 'selectedSede', 'selectedSedeId', 'sedeSeleccionada', 'gym_sede_id']) {
      const raw = storage.getItem(key);
      if (!raw) continue;
      let v = raw;
      try {
        const parsed = JSON.parse(raw);
        v = typeof parsed === 'object' ? (parsed?.ID_Sede ?? parsed?.sede_id ?? parsed?.id ?? parsed?.value) : parsed;
      } catch { /* valor simple */ }
      const id = Number(v);
      if (Number.isInteger(id) && id > 0) return id;
    }
  }
  return null;
};

const apiRequest = async (path, options = {}) => {
  const token = getToken();
  if (!token) throw new Error('No se encontró el token de sesión.');
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
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
   CLIENTE / INSCRIPCIÓN
========================================================= */
const cliente = ref({ nombre: '', apellido: '', id: '', foto: fotoDefault, estado: 'Pendiente' });
const clienteActual = computed(() => [cliente.value.nombre, cliente.value.apellido].filter(Boolean).join(' '));
const inscripcion = ref(null);
const fechaSolo = v => String(v || '').slice(0, 10);
const fechaProximoCorte = computed(() => fechaSolo(inscripcion.value?.Fecha_Vencimiento) || '—');

/* =========================================================
   PROMOCIÓN SELECCIONADA (normalizada)
========================================================= */
const periodoOferta = computed(() => ofertaSeleccionada.value?.periodo || 'Mensual');
const esVisita = computed(() => periodoOferta.value === 'Diario');

const fechaNuevoCorte = computed(() => {
  const base = fechaProximoCorte.value === '—' ? new Date() : new Date(`${fechaProximoCorte.value}T12:00:00`);
  if (Number.isNaN(base.getTime())) return '—';
  const p = periodoOferta.value;
  if (p === 'Diario') base.setDate(base.getDate() + 1);
  else if (p === 'Semanal') base.setDate(base.getDate() + 7);
  else if (p === 'Quincenal') base.setDate(base.getDate() + 15);
  else {
    const months = Number(ofertaSeleccionada.value?.meses) || 1;
    const day = base.getDate();
    base.setDate(1);
    base.setMonth(base.getMonth() + months);
    const max = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    base.setDate(Math.min(day, max));
  }
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
});

/* =========================================================
   FOLIO
   El folio de Efectivo y Tarjeta lo genera el servidor al registrar el pago.
   Solo en Transferencia el usuario captura la referencia de su comprobante.
========================================================= */
watch(tipoPago, n => { if (n !== 'Transferencia') folioReferencia.value = ''; });
const folioAutomatico = computed(() => tipoPago.value === 'Efectivo' || tipoPago.value === 'Tarjeta');
const folioPlaceholder = computed(() => {
  if (tipoPago.value === 'Efectivo') return txt('Se asigna al confirmar el pago', 'Assigned when you confirm');
  if (tipoPago.value === 'Tarjeta') return txt('Lo asigna Stripe al cobrar', 'Assigned by Stripe on charge');
  if (tipoPago.value === 'Transferencia') return t('voucherPlaceholder');
  return txt('Elige primero un método de pago', 'Choose a payment method first');
});
const folioAyuda = computed(() => ({
  Efectivo: txt('El folio real se genera al confirmar el pago y aparecerá en el recibo. No necesitas capturarlo.', 'The real reference is generated when you confirm the payment and will appear on the receipt. You do not need to enter it.'),
  Tarjeta: txt('El folio se asigna cuando Stripe confirma el cobro y aparecerá en el recibo.', 'The reference is assigned once Stripe confirms the charge and will appear on the receipt.'),
  Transferencia: txt('Captura el folio o número de referencia que aparece en el comprobante de la transferencia.', 'Enter the reference number shown on the transfer receipt.')
})[tipoPago.value] || '');
const folioResumen = computed(() => {
  if (tipoPago.value === 'Transferencia') return folioReferencia.value.trim() || '—';
  if (folioAutomatico.value) return txt('Al confirmar', 'On confirmation');
  return '—';
});

const metodosPago = computed(() => [
  { value: 'Efectivo', label: t('cashOption'), hint: txt('Folio automático', 'Automatic reference'), icon: 'cash' },
  { value: 'Transferencia', label: t('transferOption'), hint: txt('Requiere folio', 'Reference required'), icon: 'transfer' },
  { value: 'Tarjeta', label: txt('Tarjeta', 'Card'), hint: txt('QR de Stripe', 'Stripe QR'), icon: 'card' }
]);

/* =========================================================
   MONTOS
========================================================= */
const formatoMoneda = n => new Intl.NumberFormat(currentLang.value === 'en' ? 'en-US' : 'es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
const reciboLocale = computed(() => (currentLang.value === 'en' ? 'en-US' : 'es-MX'));
const montoMostrado = computed(() => formatoMoneda(montoRecibir.value));

// Total a pagar: independiente del campo "Monto a recibir".
// Solo cambia al elegir una promoción o al cargar el precio de la inscripción.
const totalAPagar = computed(() => {
  const precio = ofertaSeleccionada.value ? Number(ofertaSeleccionada.value.precio) : Number(inscripcion.value?.Precio);
  return Number.isFinite(precio) ? precio : 0;
});
const totalMostrado = computed(() => formatoMoneda(totalAPagar.value));

const planActual = computed(() => ofertaSeleccionada.value?.nombre || inscripcion.value?.Nombre_Paquete || t('monthlyOption'));
const duracionPlan = computed(() => {
  const p = periodoOferta.value;
  if (p === 'Diario') return txt('1 día', '1 day');
  if (p === 'Semanal') return txt('1 semana', '1 week');
  if (p === 'Quincenal') return txt('1 quincena', '1 fortnight');
  const m = Number(ofertaSeleccionada.value?.meses) || 1;
  return `${m} ${m === 1 ? txt('mes', 'month') : txt('meses', 'months')}`;
});
const metodoPagoLabel = computed(() => ({
  Efectivo: txt('Efectivo', 'Cash'),
  Transferencia: txt('Transferencia', 'Transfer'),
  Tarjeta: txt('Tarjeta (Stripe QR)', 'Card (Stripe QR)')
})[tipoPago.value] || txt('Sin seleccionar', 'Not selected'));

/* =========================================================
   PROMOCIÓN GRUPAL (amigos, parejas, familia…)
========================================================= */
const personasPromo = computed(() => Math.max(1, Math.floor(Number(ofertaSeleccionada.value?.personas) || 1)));
const requiereGrupo = computed(() => personasPromo.value > 1);
const acompanantes = ref([]);
const busquedaGrupo = ref('');
const groupSearchRef = ref(null);
const groupSectionRef = ref(null);
const resultadosGrupo = ref([]);
const buscandoGrupo = ref(false);
let busquedaTimer = null;

const participantes = computed(() => [
  { inscripcionId: inscripcion.value?.ID_Inscripto, nombre: clienteActual.value, foto: cliente.value.foto, titular: true },
  ...acompanantes.value
]);
const lugaresFaltan = computed(() => Math.max(0, personasPromo.value - participantes.value.length));
const grupoCompleto = computed(() => !requiereGrupo.value || lugaresFaltan.value === 0);
const precioPorPersonaPago = computed(() => totalAPagar.value / personasPromo.value);

const normalizarCliente = c => ({
  inscripcionId: c.ID_Inscripto ?? c.ID_Inscripcion ?? c.id_inscripto,
  clienteId: c.ID_Cliente ?? c.id_cliente,
  nombre: [c.Nombre, c.Apellido_P, c.Apellido_M].filter(Boolean).join(' '),
  foto: c.foto_url || fotoDefault
});

/* =========================================================
   BUSCADOR DE CLIENTES (funciona igual que en Editar usuario)
========================================================= */
const searchQuery = ref('');
const searchBoxRef = ref(null);
const showSuggestions = ref(false);
const clientesBusqueda = ref([]);

const loadSearch = async () => {
  const sede = obtenerSedeId();
  if (!sede) { clientesBusqueda.value = []; return; }
  try {
    const data = await apiRequest(`/api/gym/clientes?sede_id=${encodeURIComponent(sede)}`);
    const lista = Array.isArray(data) ? data : data?.data || [];
    clientesBusqueda.value = lista.map(c => ({ ...normalizarCliente(c), correo: c.Correo_Electronico || '', celular: c.Celular || '' }));
  } catch (e) { console.error(e); }
};

const suggestions = computed(() => {
  const q = searchQuery.value.trim().toLocaleLowerCase();
  if (!q) return [];
  return clientesBusqueda.value
    .filter(c => c.inscripcionId && [c.nombre, c.correo, c.celular, c.clienteId, c.inscripcionId]
      .some(v => String(v ?? '').toLocaleLowerCase().includes(q)))
    .slice(0, 8);
});

// Misma pantalla, solo cambia el id de la inscripción en la ruta
const irAInscripcion = id => router.push(route.name
  ? { name: route.name, params: { ...route.params, id: String(id) }, query: { ...route.query } }
  : { path: route.path.replace(/[^/]+\/?$/, String(id)), query: { ...route.query } });

const chooseClient = async c => {
  showSuggestions.value = false;
  searchQuery.value = '';
  if (String(route.params.id) === String(c.inscripcionId)) { await cargarCliente(); return; }
  await irAInscripcion(c.inscripcionId);
};
const handleSearch = () => {
  if (suggestions.value.length === 1) chooseClient(suggestions.value[0]);
  else showSuggestions.value = true;
};
const handleDocumentClick = e => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(e.target)) showSuggestions.value = false;
};
const handleBranchChange = () => { clientesBusqueda.value = []; loadSearch(); };

/* =========================================================
   BÚSQUEDA DE ACOMPAÑANTES (promoción grupal)
========================================================= */
const buscarAcompanantes = () => {
  clearTimeout(busquedaTimer);
  const q = busquedaGrupo.value.trim();
  if (q.length < 2) { resultadosGrupo.value = []; buscandoGrupo.value = false; return; }
  buscandoGrupo.value = true;
  busquedaTimer = setTimeout(async () => {
    try {
      const data = await apiRequest(`/api/gym/clientes?sede_id=${encodeURIComponent(obtenerSedeId())}&buscar=${encodeURIComponent(q)}`);
      const lista = Array.isArray(data) ? data : data?.data || [];
      const usados = new Set(participantes.value.map(p => String(p.inscripcionId)));
      resultadosGrupo.value = lista
        .map(normalizarCliente)
        .filter(c => c.inscripcionId && !usados.has(String(c.inscripcionId)) &&
          [c.nombre,c.inscripcionId,c.clienteId].some(v => String(v??'').toLocaleLowerCase().includes(q.toLocaleLowerCase())))
        .slice(0, 6);
    } catch (e) {
      toastRef.value?.notify(e.message, 'error');
    } finally {
      buscandoGrupo.value = false;
    }
  }, 300);
};

const agregarAcompanante = c => {
  if (lugaresFaltan.value <= 0) return;
  acompanantes.value.push(c);
  busquedaGrupo.value = '';
  resultadosGrupo.value = [];
};
const quitarAcompanante = id => {
  acompanantes.value = acompanantes.value.filter(a => String(a.inscripcionId) !== String(id));
};
const quitarPromocion = () => {
  ofertaSeleccionada.value = null;
  montoRecibir.value = Number(inscripcion.value?.Precio) || null;
};

watch(ofertaSeleccionada, () => {
  acompanantes.value = acompanantes.value.slice(0, Math.max(0, personasPromo.value - 1));
  busquedaGrupo.value = '';
  resultadosGrupo.value = [];
  operacionId.value = nuevaOperacionId();
});

/* =========================================================
   VALIDACIÓN DEL BOTÓN
========================================================= */
const isButtonDisabled = computed(() =>
  loading.value || saving.value || stripeLoading.value || !!stripeQR.value || !inscripcion.value ||
  !Number.isFinite(Number(montoRecibir.value)) || Number(montoRecibir.value) <= 0 || !tipoPago.value ||
  (tipoPago.value === 'Tarjeta' && !stripeCuenta.value?.charges_enabled) ||
  (tipoPago.value === 'Transferencia' && !folioReferencia.value.trim()) ||
  (ofertaSeleccionada.value && Math.round(Number(montoRecibir.value) * 100) !== Math.round(totalAPagar.value * 100)) ||
  !grupoCompleto.value
);

const motivoBloqueo = computed(() => {
  if (loading.value || !inscripcion.value) return '';
  if (!grupoCompleto.value) return txt(`Faltan ${lugaresFaltan.value} persona(s) por agregar a la promoción.`, `${lugaresFaltan.value} more person(s) to add to the promotion.`);
  if (!tipoPago.value) return txt('Elige un método de pago.', 'Choose a payment method.');
  if (tipoPago.value === 'Transferencia' && !folioReferencia.value.trim()) return txt('Captura el folio de la transferencia.', 'Enter the transfer reference.');
  if (tipoPago.value === 'Tarjeta' && !stripeCuenta.value?.charges_enabled) return txt('Habilita la cuenta Stripe del gimnasio.', 'Enable the gym Stripe account.');
  if (ofertaSeleccionada.value && Math.round(Number(montoRecibir.value)*100) !== Math.round(totalAPagar.value*100)) return txt('La promoción se cobra completa en una sola operación.', 'The promotion must be paid in full in one transaction.');
  if (!(Number(montoRecibir.value) > 0)) return txt('Ingresa un monto mayor a $0.', 'Enter an amount greater than $0.');
  return '';
});

/* =========================================================
   CARGA DEL CLIENTE
========================================================= */
const cargarCliente = async () => {
  loading.value = true;
  errorCarga.value = '';
  inscripcion.value = null;
  try {
    const id = Number(route.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error('ID de inscripción inválido.');
    const sede = obtenerSedeId();
    if (!sede) throw new Error('Selecciona una sucursal para consultar al cliente.');
    const found = await apiRequest(`/api/gym/clientes/${id}/pagos?sede_id=${encodeURIComponent(sede)}`);
    if (!found) throw new Error('No se encontró la inscripción en esta sucursal.');
    inscripcion.value = found;
    cliente.value = {
      nombre: found.Nombre || '',
      apellido: [found.Apellido_P, found.Apellido_M].filter(Boolean).join(' '),
      id: String(found.ID_Cliente),
      foto: found.foto_url || fotoDefault,
      estado: found.Estatus || 'Pendiente'
    };
    if (!stripeQR.value) montoRecibir.value = Number(found.Precio) || null;
  } catch (e) {
    errorCarga.value = e.message || 'No se pudo cargar el cliente.';
    toastRef.value?.notify(errorCarga.value, 'error');
  } finally {
    loading.value = false;
  }
};

/* =========================================================
   SELECCIÓN DE PROMOCIÓN / TARIFA
   Se normaliza lo que emite Promos.vue por si llega con nombres de la BD.
========================================================= */
const handleSelectOferta = async oferta => {
  const normalizada = {
    ...oferta,
    id_precio: oferta.id_precio ?? oferta.ID_Precio ?? oferta.id ?? null,
    nombre: oferta.nombre ?? oferta.Nombre_Paquete,
    precio: Number(oferta.precio ?? oferta.Precio),
    meses: Number(oferta.meses ?? oferta.Cantidad_Meses) || 1,
    personas: Math.max(1, Number(oferta.personas ?? oferta.Cantidad_Personas) || 1),
    periodo: oferta.periodo ?? oferta.Periodo ?? 'Promocion'
  };
  acompanantes.value = [];
  ofertaSeleccionada.value = normalizada;
  montoRecibir.value = Number(normalizada.precio) || null;
  activeModal.value = null;
  await nextTick();
  if (normalizada.personas > 1) {
    groupSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    groupSearchRef.value?.focus({ preventScroll: true });
  }
  toastRef.value?.notify(`${t('offerAppliedToast')} ${normalizada.nombre}`, 'success');
};

/* =========================================================
   CONFIRMAR PAGO
========================================================= */
const confirmPayment = async () => {
  if (isButtonDisabled.value) return;
  if (tipoPago.value === 'Tarjeta') { await crearStripeQR(); return; }
  saving.value = true;
  try {
    // El servidor debe registrar Clientes_Pagos, Clientes_Detalle_Pagos y Referencias_Pagos en una transacción.
    const result = await apiRequest(`/api/gym/clientes/${inscripcion.value.ID_Inscripto}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sede_id: obtenerSedeId(),
        monto: Number(montoRecibir.value),
        metodo_pago: tipoPago.value,
        referencia_pago: tipoPago.value === 'Efectivo' ? null : folioReferencia.value.trim(),
        id_precio: ofertaSeleccionada.value?.id_precio ?? null,
        participantes: participantes.value.map(p => p.inscripcionId),
        personas: personasPromo.value,
        operacion_id: operacionId.value
      })
    });
    const pagoGuardado = {
      folio: result.folio || result.Folio_Referencia,
      fecha: fechaSolo(result.fecha || new Date().toISOString()),
      cliente: clienteActual.value,
      metodo: tipoPago.value,
      monto: Number(result.monto ?? montoRecibir.value),
      concepto: ofertaSeleccionada.value ? 'membership' : 'monthly',
      plan: result.plan || planActual.value,
      participantes: Array.isArray(result.participantes) ? result.participantes.map(p=>p.nombre) : participantes.value.map(p => p.nombre),
      gimnasio: result.gimnasio
    };
    toastRef.value?.notify(t('paymentConfirmedToast'), 'success');
    await cargarCliente(); // Actualizar estado y fecha de corte desde el servidor.
    ultimoPago.value = pagoGuardado;
    acompanantes.value = [];
    ofertaSeleccionada.value = null;
    operacionId.value = nuevaOperacionId();
  } catch (e) {
    toastRef.value?.notify(e.message || 'No se pudo registrar el pago.', 'error');
  } finally {
    saving.value = false;
  }
};

/* =========================================================
   STRIPE
========================================================= */
const consultarStripeCuenta = async (silent = true) => {
  try {
    stripeCuenta.value = await apiRequest('/api/gym/stripe/cuenta');
    return stripeCuenta.value;
  } catch (e) {
    stripeCuenta.value = null;
    if (!silent) toastRef.value?.notify(e.message, 'error');
    return null;
  }
};

const conectarStripe = async () => {
  if (stripeLoading.value) return;
  // Abrir antes del await evita que los navegadores bloqueen la pestaña emergente.
  const tab = window.open('about:blank', '_blank');
  stripeLoading.value = true;
  try {
    const data = await apiRequest('/api/gym/stripe/conectar', { method: 'POST' });
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

const detenerStripe = () => { if (stripeTimer) { clearInterval(stripeTimer); stripeTimer = null; } };

const crearStripeQR = async () => {
  if (stripeQR.value || stripeLoading.value) return;
  if (!stripeCuenta.value?.charges_enabled) {
    toastRef.value?.notify(txt('Primero conecta y habilita la cuenta Stripe del gimnasio.', 'Connect and enable the gym Stripe account first.'), 'error');
    return;
  }
  stripeLoading.value = true;
  try {
    const data = await apiRequest(`/api/gym/clientes/${inscripcion.value.ID_Inscripto}/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sede_id: obtenerSedeId(),
        monto: Number(montoRecibir.value),
        id_precio: ofertaSeleccionada.value?.id_precio ?? null,
        participantes: participantes.value.map(p => p.inscripcionId),
        personas: personasPromo.value,
        operacion_id: operacionId.value
      })
    });
    if (!data?.session_id || !data?.qr_data_url || !data?.checkout_url) throw new Error('Stripe no devolvió todos los datos del cobro.');
    ultimoPago.value = null;
    stripeQR.value = {
      ...data,
      monto: Number(montoRecibir.value),
      inscripcionId: inscripcion.value.ID_Inscripto,
      sedeId: obtenerSedeId(),
      participantes: participantes.value.map(p => p.nombre)
    };
    stripeEstado.value = 'Pendiente';
    detenerStripe();
    stripeTimer = setInterval(() => { void consultarEstadoStripe(true); }, 5000);
    toastRef.value?.notify(txt('QR generado. Esperando la confirmación de Stripe.', 'QR generated. Waiting for Stripe confirmation.'), 'success');
  } catch (e) {
    toastRef.value?.notify(e.message, 'error');
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
    const data = await apiRequest(`/api/gym/stripe/checkout/${encodeURIComponent(qr.session_id)}/estado`);
    if (stripeQR.value?.session_id !== qr.session_id) return;
    stripeEstado.value = data.estado || 'Pendiente';
    if (data.estado === 'Pagado') {
      // El registro real debe existir antes de emitir un recibo.
      const pagoData = await apiRequest(`/api/gym/clientes/${qr.inscripcionId}/pagos?sede_id=${encodeURIComponent(qr.sedeId)}`);
      const pago = (Array.isArray(pagoData.pagos) ? pagoData.pagos : []).find(p => String(p.ID_Pago) === String(data.ID_Pago));
      const folio = pago?.Folio_Referencia || pago?.folio || data.folio || data.Folio_Referencia;
      if (!folio) { stripeEstado.value = 'Pagado · esperando folio'; return; }
      detenerStripe();
      ultimoPago.value = {
        folio,
        fecha: fechaSolo(pago?.Fecha_Pagada || data.fecha || new Date().toISOString()),
        cliente: clienteActual.value,
        metodo: 'Stripe',
        monto: Number(pago?.Monto ?? qr.monto),
        concepto: ofertaSeleccionada.value ? 'membership' : 'monthly',
        plan: planActual.value,
        participantes: Array.isArray(data.participantes) && data.participantes.length ? data.participantes : qr.participantes,
        gimnasio: pagoData.gimnasio
      };
      stripeQR.value = null;
      inscripcion.value = pagoData;
      cliente.value.estado = pagoData.Estatus || cliente.value.estado;
      acompanantes.value = [];
      ofertaSeleccionada.value = null;
      operacionId.value = nuevaOperacionId();
      toastRef.value?.notify(txt('Pago confirmado. Folio y recibo disponibles.', 'Payment confirmed. Receipt ready.'), 'success');
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

const cancelarQR = () => { detenerStripe(); stripeQR.value = null; stripeEstado.value = ''; };
watch(tipoPago, n => { if (n === 'Tarjeta') void consultarStripeCuenta(); });

/* =========================================================
   RECIBO / CICLO DE VIDA
========================================================= */
const downloadReceipt = () => {
  if (!ultimoPago.value) { toastRef.value?.notify(lt('confirmBeforeDownload'), 'error'); return; }
  reciboVisible.value = true;
};
const handleReciboNotify = payload => { if (payload) toastRef.value?.notify(payload.message, payload.type); };

onMounted(() => {
  window.addEventListener('idioma-changed', handleLangChange);
  window.addEventListener('factorfit:branch-changed', handleBranchChange);
  document.addEventListener('click', handleDocumentClick);
  cargarCliente();
  consultarStripeCuenta();
  loadSearch();
});
onUnmounted(() => {
  window.removeEventListener('idioma-changed', handleLangChange);
  window.removeEventListener('factorfit:branch-changed', handleBranchChange);
  document.removeEventListener('click', handleDocumentClick);
  clearTimeout(busquedaTimer);
  detenerStripe();
});
watch(() => [route.params.id, route.query.sede_id], () => {
  cancelarQR();
  ultimoPago.value = null;
  acompanantes.value = [];
  ofertaSeleccionada.value = null;
  cargarCliente();
});
</script>

<template>
  <HeadingGYM_ACCOUNT>
    <NotificationSystem ref="toastRef" />

    <main class="payment-page">
      <div class="payment-container">

        <!-- ENCABEZADO -->
        <header class="page-header">
          <div>
            <div class="eyebrow"><span></span>{{ txt('OPERACIONES / COBROS', 'OPERATIONS / PAYMENTS') }}</div>
            <h1>{{ txt('REGISTRAR', 'REGISTER') }} <strong>{{ txt('PAGO', 'PAYMENT') }}</strong></h1>
            <p>{{ txt('Registra el pago del cliente, aplica promociones y genera su comprobante.', 'Register the client payment, apply promotions and generate the receipt.') }}</p>
          </div>

          <!-- BUSCADOR -->
          <div id="tutorial-step-0" ref="searchBoxRef" class="search-section">
            <label for="client-search">{{ t('searchClientLabel') }}</label>
            <div class="search-control">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                id="client-search"
                v-model="searchQuery"
                type="text"
                autocomplete="off"
                :placeholder="t('searchClientPlaceholder')"
                @focus="showSuggestions = true"
                @input="showSuggestions = true"
                @keyup.enter="handleSearch"
                @keyup.esc="showSuggestions = false"
              />
            </div>

            <div v-if="showSuggestions && searchQuery.trim()" class="client-suggestions" role="listbox">
              <button v-for="c in suggestions" :key="c.inscripcionId" type="button" class="client-suggestion" role="option" @click="chooseClient(c)">
                <span class="suggestion-avatar">{{ String(c.nombre || '?').charAt(0).toUpperCase() }}</span>
                <span class="suggestion-info">
                  <strong>{{ c.nombre }}</strong>
                  <small>{{ c.correo || c.celular || txt('Cliente registrado', 'Registered client') }}</small>
                </span>
                <span class="suggestion-id">#{{ c.clienteId || c.inscripcionId }}</span>
              </button>
              <p v-if="!suggestions.length" class="suggestion-empty">{{ txt('No se encontraron clientes en esta sucursal.', 'No clients found at this branch.') }}</p>
            </div>
          </div>
        </header>

        <!-- CARGA / ERROR -->
        <p v-if="loading" role="status">{{ txt('Cargando información del cliente...', 'Loading client information...') }}</p>
        <div v-if="errorCarga" role="alert">{{ errorCarga }}</div>

        <div class="payment-layout">

          <!-- CLIENTE -->
          <aside class="client-column">
            <article class="client-card">
              <div class="card-top-line"></div>

              <span class="client-label">{{ txt('CLIENTE SELECCIONADO', 'SELECTED CLIENT') }}</span>

              <div class="avatar-container">
                <div class="avatar"><img :src="cliente.foto" :alt="t('userAvatarAlt')" /></div>
              </div>

              <div class="client-name">
                <h2>{{ cliente.nombre || '—' }}</h2>
                <h2 class="highlight">{{ cliente.apellido || '—' }}</h2>
              </div>

              <span class="active-pill"><i></i>{{ cliente.estado }}</span>

              <div class="client-mini-info">
                <div><span>ID</span><strong class="mono">{{ cliente.id || '—' }}</strong></div>
                <div><span>{{ txt('Plan actual', 'Current plan') }}</span><strong>{{ planActual }}</strong></div>
                <div><span>{{ txt('Próximo corte', 'Next billing') }}</span><strong class="mono">{{ fechaProximoCorte }}</strong></div>
                <div v-if="requiereGrupo">
                  <span>{{ txt('Grupo', 'Group') }}</span>
                  <strong :class="grupoCompleto ? 'mini-ok' : 'mini-warn'">{{ participantes.length }}/{{ personasPromo }}</strong>
                </div>
              </div>
            </article>
          </aside>

          <!-- COBRO -->
          <section class="operations-column">

            <!-- PANEL -->
            <article id="tutorial-step-1" class="payment-card">
              <div class="card-top-line"></div>

              <div class="payment-card-header">
                <div class="payment-title">
                  <span class="payment-icon">
                    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                  </span>
                  <div>
                    <span class="section-kicker">{{ txt('TRANSACCIÓN', 'TRANSACTION') }}</span>
                    <h3>{{ txt('Detalle del pago', 'Payment details') }}</h3>
                  </div>
                </div>

                <button class="promo-button" type="button" @click="activeModal = 'promo'">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                  </svg>
                  {{ t('promosBtn') }}
                </button>
              </div>

              <!-- FECHAS -->
              <div class="billing-dates">
                <div class="billing-date">
                  <span class="date-icon">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </span>
                  <div><span>{{ t('nextCutLabel') }}</span><strong>{{ fechaProximoCorte }}</strong></div>
                </div>

                <span class="date-arrow">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>

                <div class="billing-date new-date">
                  <span class="date-icon">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="m9 16 2 2 4-5" /></svg>
                  </span>
                  <div><span>{{ t('newCutLabel') }}</span><strong>{{ fechaNuevoCorte }}</strong></div>
                </div>
              </div>

              <!-- TOTAL PRINCIPAL -->
              <div class="payment-summary">
                <div class="summary-main">
                  <div class="summary-heading">
                    <span>{{ t('totalToPayLabel') }}</span>
                    <span class="summary-state">{{ txt('POR COBRAR', 'DUE') }}</span>
                    <span v-if="esVisita" class="summary-state visit">{{ txt('VISITA', 'DAY VISIT') }}</span>
                  </div>

                  <div class="big-amount">
                    <span class="big-currency">$</span>
                    <strong>{{ totalMostrado }}</strong>
                    <span class="currency-code">MXN</span>
                  </div>

                  <div class="plan-line">
                    <span class="plan-icon">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-8H6a2 2 0 0 1-2-2Z" /></svg>
                    </span>
                    <strong>{{ planActual }}</strong>
                    <span>•</span>
                    <span>{{ duracionPlan }}</span>
                    <template v-if="requiereGrupo">
                      <span>•</span>
                      <span class="group-tag">{{ personasPromo }} {{ txt('personas', 'people') }} · ${{ formatoMoneda(precioPorPersonaPago) }} {{ txt('c/u', 'each') }}</span>
                    </template>
                  </div>
                </div>

                <div class="summary-side">
                  <div class="surcharge-box">
                    <span>{{ txt('RECARGO', 'SURCHARGE') }}</span>
                    <strong>+ $0.00</strong>
                  </div>

                  <div v-if="ofertaSeleccionada" class="promotion-applied">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4L19 6" /></svg>
                    {{ txt('Promoción aplicada', 'Promotion applied') }}
                    <button type="button" class="promo-remove" @click="quitarPromocion">{{ txt('Quitar', 'Remove') }}</button>
                  </div>
                </div>
              </div>

              <!-- PERSONAS DE LA PROMOCIÓN -->
              <section v-if="requiereGrupo" ref="groupSectionRef" class="form-section group-section">
                <div class="form-section-title">
                  <span class="group-badge">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div class="group-title-text">
                    <strong>{{ txt('Personas de la promoción', 'Promotion members') }}</strong>
                    <small>{{ txt('Esta promoción aplica a ' + personasPromo + ' personas. Agrega a quienes la compartirán.', 'This promotion applies to ' + personasPromo + ' people. Add who will share it.') }}</small>
                  </div>
                  <span class="group-counter" :class="{ done: grupoCompleto }">{{ participantes.length }}/{{ personasPromo }}</span>
                </div>

                <div class="group-slots">
                  <article v-for="p in participantes" :key="p.inscripcionId" class="slot filled">
                    <img :src="p.foto" :alt="p.nombre" />
                    <div class="slot-text">
                      <strong>{{ p.nombre }}</strong>
                      <small>{{ p.titular ? txt('Titular', 'Holder') : txt('Acompañante', 'Companion') }}</small>
                    </div>
                    <button v-if="!p.titular" type="button" class="slot-remove" :aria-label="txt('Quitar', 'Remove')" @click="quitarAcompanante(p.inscripcionId)">×</button>
                    <span v-else class="slot-lock">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6" /></svg>
                    </span>
                  </article>

                  <div v-for="n in lugaresFaltan" :key="'empty' + n" class="slot empty">
                    <span class="slot-plus">+</span>
                    <div class="slot-text">
                      <strong>{{ txt('Falta agregar persona', 'Add a person') }}</strong>
                      <small>{{ txt('Lugar', 'Slot') }} {{ participantes.length + n }}</small>
                    </div>
                  </div>
                </div>

                <div v-if="lugaresFaltan > 0" class="group-search">
                  <div class="field-control">
                    <svg class="field-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input ref="groupSearchRef" v-model="busquedaGrupo" type="text" autocomplete="off" :placeholder="txt('Buscar cliente por nombre o ID…', 'Search client by name or ID…')" @input="buscarAcompanantes" />
                  </div>

                  <ul v-if="resultadosGrupo.length" class="group-results">
                    <li v-for="c in resultadosGrupo" :key="c.inscripcionId">
                      <button type="button" @click="agregarAcompanante(c)">
                        <img :src="c.foto" :alt="c.nombre" />
                        <span>{{ c.nombre }}</span>
                        <em>+ {{ txt('Agregar', 'Add') }}</em>
                      </button>
                    </li>
                  </ul>
                  <p v-else-if="buscandoGrupo" class="group-empty">{{ txt('Buscando…', 'Searching…') }}</p>
                  <p v-else-if="busquedaGrupo.trim().length >= 2" class="group-empty">{{ txt('Sin resultados.', 'No results.') }}</p>
                </div>

                <div class="group-price">
                  <div><span>{{ txt('Total del grupo', 'Group total') }}</span><strong>${{ totalMostrado }}</strong></div>
                  <div><span>{{ txt('Por persona', 'Per person') }}</span><strong>${{ formatoMoneda(precioPorPersonaPago) }}</strong></div>
                </div>
              </section>

              <!-- MÉTODO DE PAGO -->
              <section class="form-section">
                <div class="form-section-title">
                  <span>01</span>
                  <div>
                    <strong>{{ txt('Método de pago', 'Payment method') }}</strong>
                    <small>{{ txt('Selecciona cómo realizará el cliente el pago.', 'Select how the client will make the payment.') }}</small>
                  </div>
                </div>

                <div class="method-grid" role="radiogroup" :aria-label="t('paymentTypeLabel')">
                  <button
                    v-for="m in metodosPago"
                    :key="m.value"
                    type="button"
                    role="radio"
                    class="method-tile"
                    :class="{ active: tipoPago === m.value }"
                    :aria-checked="tipoPago === m.value"
                    @click="tipoPago = m.value"
                  >
                    <span class="method-icon">
                      <svg v-if="m.icon === 'cash'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" />
                      </svg>
                      <svg v-else-if="m.icon === 'transfer'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 21h18" />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" />
                      </svg>
                    </span>
                    <span class="method-text"><strong>{{ m.label }}</strong><small>{{ m.hint }}</small></span>
                    <span class="method-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                  </button>
                </div>

                <div class="input-group folio-group">
                  <label for="folio-referencia">
                    {{ t('folioReferenceLabel') }}
                    <span v-if="tipoPago" class="folio-badge" :class="folioAutomatico ? 'auto' : 'required'">
                      {{ folioAutomatico ? txt('AUTOMÁTICO', 'AUTOMATIC') : txt('OBLIGATORIO', 'REQUIRED') }}
                    </span>
                  </label>

                  <div class="field-control" :class="{ 'is-disabled': folioAutomatico || !tipoPago }">
                    <svg class="field-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <template v-if="folioAutomatico || !tipoPago">
                        <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </template>
                      <template v-else>
                        <path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h5" />
                      </template>
                    </svg>
                    <input id="folio-referencia" v-model="folioReferencia" type="text" autocomplete="off" :placeholder="folioPlaceholder" :disabled="folioAutomatico || !tipoPago" />
                  </div>

                  <p v-if="folioAyuda" class="folio-note">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
                    <span>{{ folioAyuda }}</span>
                  </p>
                </div>
              </section>

              <!-- MONTO -->
              <section class="form-section amount-section">
                <div class="form-section-title">
                  <span>02</span>
                  <div>
                    <strong>{{ txt('Monto a recibir', 'Amount to receive') }}</strong>
                    <small>{{ txt('Verifica el importe antes de confirmar.', 'Verify the amount before confirming.') }}</small>
                  </div>
                </div>

                <div class="amount-input-container">
                  <div class="amount-input-box">
                    <span class="amount-symbol">$</span>
                    <input v-model="montoRecibir" type="number" min="0" step="0.01" placeholder="0.00" />
                    <span class="amount-mxn">MXN</span>
                  </div>

                  <div class="amount-validation">
                    <span class="validation-dot" :class="{ valid: montoRecibir && Number(montoRecibir) > 0 }"></span>
                    {{ montoRecibir && Number(montoRecibir) > 0 ? txt('Monto válido para procesar', 'Valid amount to process') : txt('Ingresa un monto mayor a $0', 'Enter an amount greater than $0') }}
                  </div>
                </div>
              </section>

              <!-- RESUMEN -->
              <div class="transaction-review">
                <div class="review-heading">
                  <div>
                    <span class="section-kicker">{{ txt('RESUMEN', 'SUMMARY') }}</span>
                    <strong>{{ txt('Revisa antes de confirmar', 'Review before confirming') }}</strong>
                  </div>
                  <span class="review-status" :class="{ ready: !isButtonDisabled }">
                    <i></i>{{ isButtonDisabled ? txt('Incompleto', 'Incomplete') : txt('Listo', 'Ready') }}
                  </span>
                </div>

                <div class="review-grid">
                  <div class="review-item"><span>{{ txt('Cliente', 'Client') }}</span><strong>{{ clienteActual }}</strong></div>
                  <div class="review-item"><span>{{ txt('Plan', 'Plan') }}</span><strong>{{ planActual }}</strong></div>
                  <div class="review-item"><span>{{ txt('Método', 'Method') }}</span><strong>{{ metodoPagoLabel }}</strong></div>
                  <div class="review-item"><span>{{ txt('Folio', 'Reference') }}</span><strong class="review-folio">{{ folioResumen }}</strong></div>
                  <div class="review-item"><span>{{ t('newCutLabel') }}</span><strong class="review-date">{{ fechaNuevoCorte }}</strong></div>
                  <div v-if="requiereGrupo" class="review-item">
                    <span>{{ txt('Personas', 'People') }}</span>
                    <strong :class="grupoCompleto ? 'review-people ok' : 'review-people warn'">{{ participantes.length }}/{{ personasPromo }}</strong>
                  </div>
                  <div class="review-item"><span>{{ txt('Total', 'Total') }}</span><strong class="review-total">${{ montoMostrado }}</strong></div>
                </div>

                <p v-if="motivoBloqueo" class="review-hint">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
                  {{ motivoBloqueo }}
                </p>
              </div>

              <!-- ACCIONES -->
              <div id="tutorial-step-2" class="action-buttons">
                <button type="button" class="confirm-button" :disabled="isButtonDisabled" @click="confirmPayment">
                  <span class="button-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <span class="button-text">
                    <strong>{{ tipoPago === 'Tarjeta' ? txt('Generar QR de Stripe', 'Generate Stripe QR') : t('confirmPaymentBtn') }}</strong>
                    <small>{{ txt(tipoPago === 'Tarjeta' ? 'Esperar confirmación del pago' : 'Registrar transacción', tipoPago === 'Tarjeta' ? 'Wait for payment confirmation' : 'Register transaction') }}</small>
                  </span>
                  <svg class="button-arrow" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>

                <button type="button" class="receipt-button" :class="{ ready: ultimoPago }" @click="downloadReceipt">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
                  <span>{{ t('downloadReceiptBtn') }}</span>
                  <span v-if="ultimoPago" class="receipt-ready"><i></i>{{ txt('Disponible', 'Ready') }}</span>
                </button>
              </div>

              <!-- STRIPE -->
              <div v-if="tipoPago === 'Tarjeta' || stripeQR" class="stripe-box">
                <div class="stripe-head">
                  <span class="stripe-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>
                  </span>

                  <div class="stripe-head-text">
                    <strong>{{ txt('Cobro con tarjeta mediante Stripe', 'Card payment via Stripe') }}</strong>
                    <span class="stripe-status" :class="stripeCuenta?.charges_enabled ? 'ok' : 'warn'">
                      <i></i>
                      {{ stripeCuenta?.charges_enabled ? txt('Cuenta lista para cobrar.', 'Account ready for payments.') : txt('Cuenta no habilitada', 'Account not enabled') }}
                    </span>
                  </div>

                  <button type="button" class="stripe-link" @click="consultarStripeCuenta(false)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
                    {{ txt('Actualizar estado de cuenta', 'Refresh account status') }}
                  </button>
                </div>

                <template v-if="!stripeCuenta?.charges_enabled">
                  <p class="stripe-hint">{{ txt('Conecta y habilita la cuenta Stripe del gimnasio antes de cobrar.', 'Connect and enable the gym Stripe account before charging.') }}</p>
                  <div class="stripe-actions">
                    <button type="button" class="stripe-action" :disabled="stripeLoading" @click="conectarStripe">{{ txt('Conectar cuenta Stripe', 'Connect Stripe account') }}</button>
                  </div>
                </template>

                <div v-if="stripeQR" class="stripe-qr">
                  <div class="qr-side">
                    <div class="qr-frame"><img :src="stripeQR.qr_data_url" :alt="txt('QR de pago Stripe', 'Stripe payment QR')" /></div>
                    <span class="qr-scan">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M4 12h16" /></svg>
                      {{ txt('Pídele al cliente que escanee el código', 'Ask the client to scan the code') }}
                    </span>
                  </div>

                  <div class="qr-info">
                    <span class="qr-state" :class="{ paid: String(stripeEstado).startsWith('Pagado') }">
                      <i></i>{{ txt('Estado del pago:', 'Payment status:') }} {{ stripeEstado }}
                    </span>

                    <div class="qr-amount-block">
                      <span class="qr-amount-label">{{ txt('MONTO A COBRAR', 'AMOUNT DUE') }}</span>
                      <strong class="qr-amount">${{ formatoMoneda(stripeQR.monto) }} <small>MXN</small></strong>
                    </div>

                    <p class="qr-note">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
                      <span>{{ txt('El recibo se habilita cuando el sistema registra el folio real.', 'The receipt becomes available once the system registers the actual reference.') }}</span>
                    </p>

                    <div class="qr-actions">
                      <button type="button" class="stripe-action qr-primary" @click="consultarEstadoStripe(false)">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        {{ txt('Comprobar pago', 'Check payment') }}
                      </button>
                      <a class="stripe-open" :href="stripeQR.checkout_url" target="_blank" rel="noopener noreferrer">
                        {{ txt('Abrir enlace de pago', 'Open payment link') }}
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                      </a>
                    </div>

                    <button type="button" class="qr-hide" @click="cancelarQR">{{ txt('Ocultar QR (no cancela el pago)', 'Hide QR (does not cancel payment)') }}</button>
                  </div>
                </div>
              </div>

              <!-- PAGO CONFIRMADO -->
              <div v-if="ultimoPago" class="payment-success">
                <span class="success-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4L19 6" /></svg>
                </span>
                <div>
                  <strong>{{ txt('Pago registrado correctamente', 'Payment registered successfully') }}</strong>
                  <span>{{ txt('Folio', 'Reference') }}: {{ ultimoPago.folio }}</span>
                  <span v-if="ultimoPago.participantes?.length > 1" class="success-people">{{ ultimoPago.participantes.join(' · ') }}</span>
                </div>
                <strong class="success-amount">${{ Number(ultimoPago.monto).toFixed(2) }}</strong>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>

    <!-- PROMOCIONES -->
    <transition name="pop">
      <div v-if="activeModal === 'promo'" class="modal-wrapper" @click.self="activeModal = null">
        <Promo :sede-id="obtenerSedeId()" @select-oferta="handleSelectOferta" @close="activeModal = null" />
      </div>
    </transition>

    <!-- RECIBO -->
    <ReciboPago
      ref="reciboRef"
      :visible="reciboVisible"
      :pago="ultimoPago"
      :locale="reciboLocale"
      @close="reciboVisible = false"
      @notify="handleReciboNotify"
    />
  </HeadingGYM_ACCOUNT>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&family=Oswald:wght@500;600;700&display=swap');

* { box-sizing: border-box; }

.payment-page {
  --accent: var(--color-highlight, #3b82f6);
  --card: var(--bg-cards, #111317);
  --text: var(--color-texto-general, #f5f7fa);
  --title: var(--color-titulos, #ffffff);
  --button: var(--color-botones, #2563eb);
  --button-text: var(--color-texto-botones, #ffffff);
  --muted: color-mix(in srgb, var(--text) 68%, transparent);
  --muted-2: color-mix(in srgb, var(--text) 45%, transparent);
  --line: color-mix(in srgb, var(--text) 12%, transparent);
  --line-strong: color-mix(in srgb, var(--text) 20%, transparent);
  --input-bg: color-mix(in srgb, var(--card) 86%, black);
  --ok: #34d399;
  --ok-text: #6ee7b7;
  --bad: #f87171;
  --bad-text: #fca5a5;
  --warn: #fbbf24;
  --warn-text: #fcd34d;
  --group: #8b5cf6;
  --group-text: #c4b5fd;

  --font-display: 'Anton', Impact, 'Arial Narrow', sans-serif;
  --font-heading: 'Oswald', 'Arial Narrow', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 32px 40px calc(56px + env(safe-area-inset-bottom, 0px));
  color: var(--text);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  background:
    radial-gradient(900px 360px at 88% -120px, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%),
    radial-gradient(700px 320px at -5% 0, color-mix(in srgb, var(--accent) 5%, transparent), transparent 70%);
}

.payment-container { width: 100%; max-width: 1240px; margin: 0 auto; }

.payment-container > p[role='status'] {
  margin: 0 0 16px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 10px;
  background: var(--card); color: var(--muted); font-size: 0.92rem;
}
.payment-container > div[role='alert'] {
  margin-bottom: 16px; padding: 12px 16px; border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 10px;
  background: rgba(248, 113, 113, 0.08); color: var(--bad); font-size: 0.92rem; line-height: 1.45;
}

/* =========================================================
   HEADER
========================================================= */
.page-header {
  position: relative; z-index: 20;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
  margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--line);
}
.eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: var(--accent); font-size: 0.78rem; font-weight: 700; letter-spacing: 1.2px; }
.eyebrow > span { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; background: var(--accent); }
.page-header h1 { margin: 0; color: var(--title); font-family: var(--font-display); font-size: clamp(2.1rem, 5vw, 3.2rem); font-weight: 400; line-height: 1.05; letter-spacing: 0.6px; text-transform: uppercase; }
.page-header h1 strong { color: var(--accent); font-weight: 400; }
.page-header p { max-width: 600px; margin: 10px 0 0; color: var(--muted); font-size: 0.97rem; line-height: 1.55; }

/* =========================================================
   LAYOUT (escritorio: cliente a la izquierda, cobro a la derecha)
========================================================= */
.payment-layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 24px; align-items: start; }
.client-column, .operations-column { min-width: 0; }
.client-column { position: sticky; top: 16px; }

/* =========================================================
   CLIENTE (mismo estilo que el perfil de Editar usuario)
========================================================= */
.client-card {
  position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center;
  padding: 28px 22px 22px;
  border: 1px solid var(--line); border-radius: 16px; background: var(--card);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 22px 44px -28px rgba(0, 0, 0, 0.7);
}
.card-top-line { position: absolute; top: 0; left: 22px; right: 22px; height: 3px; border-radius: 0 0 5px 5px; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 25%, transparent)); }
.client-card > .card-top-line { left: 0; right: 0; border-radius: 0; background: var(--accent); }
.client-label { margin: 0 0 20px; color: var(--muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.8px; text-align: center; }
.avatar-container { position: relative; width: 148px; height: 148px; flex-shrink: 0; margin: 0 0 20px; }
.avatar { position: absolute; inset: 0; overflow: hidden; border: 2px solid color-mix(in srgb, var(--accent) 70%, transparent); border-radius: 50%; background: var(--input-bg); box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 8%, transparent); }
.avatar img { width: 100%; height: 100%; display: block; object-fit: cover; }
.client-name { max-width: 100%; min-width: 0; margin: 0 0 12px; text-align: center; }
.client-name h2 { margin: 0; color: var(--title); font-family: var(--font-heading); font-size: 1.5rem; font-weight: 600; line-height: 1.15; letter-spacing: 0.01em; text-transform: uppercase; overflow-wrap: anywhere; }
.client-name .highlight { color: var(--accent); }
.active-pill { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 999px; color: var(--ok-text); background: rgba(52, 211, 153, 0.08); font-size: 0.74rem; font-weight: 600; white-space: nowrap; }
.active-pill i { width: 6px; height: 6px; border-radius: 50%; background: var(--ok); }
.client-mini-info { width: 100%; display: block; margin-top: 22px; padding-top: 6px; border-top: 1px solid var(--line); }
.client-mini-info > div { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 2px; border-bottom: 1px solid var(--line); }
.client-mini-info > div:last-child { padding-bottom: 2px; border-bottom: 0; }
.client-mini-info span { flex-shrink: 0; color: var(--muted); font-size: 0.82rem; }
.client-mini-info strong { min-width: 0; color: var(--text); font-size: 0.9rem; font-weight: 600; text-align: right; overflow-wrap: anywhere; }
.client-mini-info .mono { font-family: var(--font-mono); }
.client-mini-info .mini-ok { color: var(--ok-text); font-family: var(--font-mono); }
.client-mini-info .mini-warn { color: var(--warn-text); font-family: var(--font-mono); }

/* =========================================================
   BUSCADOR (en el encabezado, igual que en Editar usuario)
========================================================= */
.operations-column { display: flex; flex-direction: column; gap: 14px; }
.search-section { position: relative; z-index: 21; width: min(100%, 320px); flex-shrink: 0; }
.search-section > label { display: block; margin-bottom: 7px; color: var(--muted); font-size: 0.85rem; font-weight: 600; }
.search-control { position: relative; display: flex; align-items: center; }
.search-control > svg { position: absolute; left: 13px; color: var(--muted); pointer-events: none; }
.search-control input { width: 100%; height: 44px; padding: 0 13px 0 40px; border: 1px solid var(--line); border-radius: 10px; outline: none; background: var(--card); color: var(--text); font-family: inherit; font-size: 0.9rem; transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.search-control input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.search-control input::placeholder { color: var(--muted-2); }
.client-suggestions { position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 50; max-height: 310px; overflow-y: auto; padding: 5px; border: 1px solid var(--line-strong); border-radius: 12px; background: var(--card); box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45); }
.client-suggestion { width: 100%; min-height: 48px; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: 8px; background: transparent; color: var(--text); font-family: inherit; text-align: left; cursor: pointer; }
.client-suggestion:hover, .client-suggestion:focus-visible { background: color-mix(in srgb, var(--accent) 10%, transparent); outline: none; }
.suggestion-avatar { width: 32px; height: 32px; flex-shrink: 0; display: grid; place-items: center; border-radius: 9px; background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); font-size: 0.82rem; font-weight: 700; }
.suggestion-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.suggestion-info strong { overflow: hidden; font-size: 0.82rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.suggestion-info small { overflow: hidden; color: var(--muted); font-size: 0.72rem; text-overflow: ellipsis; white-space: nowrap; }
.suggestion-id { flex-shrink: 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.74rem; }
.suggestion-empty { margin: 0; padding: 12px; color: var(--muted); font-size: 0.82rem; }

/* =========================================================
   PAYMENT CARD
   Cuadrícula de 2 columnas: todo ocupa el ancho completo,
   salvo "Método de pago" (izq.) y "Monto a recibir" (der.) en pantallas anchas.
========================================================= */
.payment-card {
  position: relative; overflow: visible; padding: 28px;
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px;
  border: 1px solid var(--line); border-radius: 16px; background: var(--card);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 22px 44px -28px rgba(0, 0, 0, 0.7);
}
.payment-card > * { grid-column: 1 / -1; min-width: 0; }
.payment-card-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.payment-title { min-width: 0; display: flex; align-items: center; gap: 12px; }
.payment-icon { width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent); border-radius: 11px; color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
.section-kicker { display: block; margin-bottom: 2px; color: var(--accent); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.9px; }
.payment-title h3 { margin: 0; color: var(--title); font-family: var(--font-heading); font-size: 1.35rem; font-weight: 600; line-height: 1.15; letter-spacing: 0.3px; text-transform: uppercase; }
.promo-button { min-height: 44px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 18px; border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--accent); font-family: inherit; font-size: 0.9rem; font-weight: 600; white-space: nowrap; cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease; }
.promo-button:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 18%, transparent); }

/* =========================================================
   FECHAS
========================================================= */
.billing-dates { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 12px; margin-bottom: 16px; }
.billing-date { min-width: 0; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--input-bg); }
.date-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 9px; color: var(--muted); background: color-mix(in srgb, var(--text) 6%, transparent); }
.new-date { border-color: rgba(52, 211, 153, 0.25); }
.new-date .date-icon { color: var(--ok); background: rgba(52, 211, 153, 0.1); }
.billing-date > div { min-width: 0; }
.billing-date span:not(.date-icon) { display: block; margin-bottom: 2px; color: var(--muted); font-size: 0.82rem; }
.billing-date strong { display: block; color: var(--text); font-family: var(--font-mono); font-size: 0.98rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.date-arrow { display: flex; color: var(--muted-2); }

/* =========================================================
   TOTAL
========================================================= */
.payment-summary {
  display: flex; align-items: stretch; justify-content: space-between; gap: 20px;
  margin-bottom: 26px; padding: 22px;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line)); border-radius: 14px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, var(--input-bg)), var(--input-bg) 60%);
}
.summary-main { min-width: 0; flex: 1; }
.summary-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
.summary-heading > span:first-child { color: var(--muted); font-size: 0.88rem; font-weight: 600; }
.summary-state { padding: 3px 10px; border-radius: 999px; color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.5px; }
.summary-state.visit { color: #67e8f9; background: rgba(34, 211, 238, 0.14); }
.big-amount { display: flex; align-items: baseline; flex-wrap: wrap; gap: 5px; }
.big-currency { color: var(--muted); font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600; }
.big-amount strong { color: var(--title); font-family: var(--font-mono); font-size: clamp(2.3rem, 6vw, 3.6rem); font-weight: 700; line-height: 1.05; letter-spacing: -1.5px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.currency-code { margin-left: 4px; color: var(--muted); font-size: 0.9rem; font-weight: 600; }
.plan-line { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px; color: var(--muted); font-size: 0.92rem; }
.plan-line strong { color: var(--text); overflow-wrap: anywhere; }
.plan-icon { display: flex; color: var(--accent); }
.group-tag { padding: 2px 9px; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 999px; background: rgba(139, 92, 246, 0.1); color: var(--group-text); font-size: 0.78rem; font-weight: 700; }
.summary-side { min-width: 140px; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 10px; }
.surcharge-box { padding: 10px 14px; border: 1px solid rgba(248, 113, 113, 0.25); border-radius: 10px; background: rgba(248, 113, 113, 0.07); text-align: right; }
.surcharge-box span { display: block; margin-bottom: 2px; color: var(--bad-text); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.5px; }
.surcharge-box strong { color: var(--bad); font-family: var(--font-mono); font-size: 1.02rem; }
.promotion-applied { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 6px; color: var(--ok-text); font-size: 0.85rem; font-weight: 600; }
.promo-remove { margin-left: 4px; padding: 2px 9px; border: 1px solid var(--line-strong); border-radius: 999px; background: transparent; color: var(--muted); font: inherit; font-size: 0.74rem; cursor: pointer; transition: color 0.16s ease, border-color 0.16s ease; }
.promo-remove:hover { color: var(--bad-text); border-color: rgba(248, 113, 113, 0.4); }

/* =========================================================
   FORM SECTIONS
========================================================= */
.form-section { padding: 22px 0; border-top: 1px solid var(--line); }
.form-section-title { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.form-section-title > span:first-child { width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); border-radius: 8px; color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; }
.form-section-title strong { display: block; margin-bottom: 2px; color: var(--title); font-size: 1.02rem; }
.form-section-title small { display: block; color: var(--muted); font-size: 0.86rem; line-height: 1.4; }
.input-group { min-width: 0; }
.input-group > label { display: block; margin-bottom: 7px; color: var(--muted); font-size: 0.86rem; font-weight: 600; }
.field-control { position: relative; display: flex; align-items: center; width: 100%; min-width: 0; }
.field-icon { position: absolute; left: 13px; z-index: 2; color: var(--muted); pointer-events: none; }
.field-control input { width: 100%; height: 50px; min-width: 0; padding: 0 38px 0 40px; border: 1px solid var(--line-strong); border-radius: 10px; outline: none; background: var(--input-bg); color: var(--text); font-family: inherit; font-size: 0.95rem; transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.field-control input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.field-control input::placeholder { color: var(--muted-2); }
.field-control.is-disabled input { border-style: dashed; background: color-mix(in srgb, var(--text) 3%, var(--input-bg)); }
.field-control input:disabled { cursor: not-allowed; }
.field-control.is-disabled input::placeholder { color: var(--muted); font-style: italic; }

/* =========================================================
   PROMOCIÓN GRUPAL
========================================================= */
.group-section { border-top-color: rgba(139, 92, 246, 0.28); }
.group-section .form-section-title { align-items: center; }
.group-title-text { flex: 1; min-width: 0; }
.group-badge { color: var(--group-text) !important; border-color: rgba(139, 92, 246, 0.35) !important; background: rgba(139, 92, 246, 0.1) !important; }
.group-counter { flex-shrink: 0; padding: 4px 12px; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 999px; background: rgba(251, 191, 36, 0.1); color: var(--warn-text); font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; }
.group-counter.done { border-color: rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.1); color: var(--ok-text); }

.group-slots { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px; margin-bottom: 14px; }
.slot { position: relative; min-width: 0; display: flex; align-items: center; gap: 11px; padding: 11px 12px; border-radius: 12px; background: var(--input-bg); }
.slot.filled { border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line)); }
.slot.empty { border: 1px dashed var(--line-strong); color: var(--muted); }
.slot img { width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px; object-fit: cover; border: 1px solid var(--line); }
.slot-text { min-width: 0; flex: 1; }
.slot-text strong { display: block; overflow: hidden; color: var(--title); font-size: 0.9rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.slot-text small { display: block; color: var(--muted); font-size: 0.76rem; }
.slot.empty .slot-text strong { color: var(--muted); font-weight: 500; }
.slot-plus { width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; border: 1px dashed var(--line-strong); border-radius: 11px; font-size: 1.3rem; }
.slot-lock { width: 22px; height: 22px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; color: var(--ok); background: rgba(52, 211, 153, 0.12); }
.slot-remove { width: 32px; height: 32px; flex-shrink: 0; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: var(--muted); font-size: 1.1rem; line-height: 1; cursor: pointer; transition: all 0.16s ease; }
.slot-remove:hover { border-color: rgba(248, 113, 113, 0.4); background: rgba(248, 113, 113, 0.1); color: var(--bad); }

.group-search { position: relative; margin-bottom: 14px; }
.group-results { position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px); margin: 0; padding: 6px; list-style: none; max-height: 260px; overflow-y: auto; border: 1px solid var(--line-strong); border-radius: 12px; background: var(--card); box-shadow: 0 18px 40px -12px rgba(0, 0, 0, 0.7); }
.group-results button { width: 100%; min-height: 44px; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: 9px; background: transparent; color: var(--text); font: inherit; font-size: 0.9rem; text-align: left; cursor: pointer; }
.group-results button:hover, .group-results button:focus-visible { background: color-mix(in srgb, var(--accent) 10%, transparent); outline: none; }
.group-results img { width: 32px; height: 32px; border-radius: 9px; object-fit: cover; }
.group-results span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-results em { color: var(--accent); font-size: 0.78rem; font-style: normal; font-weight: 700; }
.group-empty { margin: 8px 2px 0; color: var(--muted); font-size: 0.84rem; }

.group-price { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.group-price > div { padding: 10px 14px; border: 1px solid var(--line); border-radius: 10px; background: var(--input-bg); }
.group-price span { display: block; color: var(--muted); font-size: 0.78rem; }
.group-price strong { color: var(--ok-text); font-family: var(--font-mono); font-size: 1.05rem; }

/* =========================================================
   MONTO
========================================================= */
.amount-input-container { padding-left: 0; }
.amount-input-box { display: flex; align-items: center; min-height: 68px; padding: 0 18px; border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line)); border-radius: 12px; background: var(--input-bg); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.amount-input-box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.amount-symbol { color: var(--muted); font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; }
.amount-input-box input { min-width: 0; flex: 1; padding: 0 10px; border: 0; outline: 0; background: transparent; color: var(--title); font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; font-variant-numeric: tabular-nums; -moz-appearance: textfield; appearance: textfield; }
.amount-input-box input::-webkit-inner-spin-button, .amount-input-box input::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }
.amount-mxn { color: var(--muted); font-size: 0.9rem; font-weight: 600; }
.amount-validation { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: var(--muted); font-size: 0.86rem; }
.validation-dot { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; background: var(--bad); }
.validation-dot.valid { background: var(--ok); }

/* =========================================================
   REVIEW
========================================================= */
.transaction-review { margin-top: 4px; padding: 18px; border: 1px solid var(--line); border-radius: 12px; background: var(--input-bg); }
.review-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.review-heading strong { display: block; color: var(--title); font-size: 0.98rem; }
.review-status { display: flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; color: var(--bad-text); background: rgba(248, 113, 113, 0.1); font-size: 0.78rem; font-weight: 600; }
.review-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--bad); }
.review-status.ready { color: var(--ok-text); background: rgba(52, 211, 153, 0.1); }
.review-status.ready i { background: var(--ok); }
.review-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
.review-item { min-width: 0; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px dashed var(--line-strong); }
.review-item:last-child { margin-top: 2px; padding: 14px 0 0; border-bottom: 0; border-top: 1px solid var(--line-strong); align-items: center; }
.review-item span { flex-shrink: 0; margin: 0; color: var(--muted); font-size: 0.86rem; }
.review-item:last-child span { color: var(--text); font-weight: 600; }
.review-item strong { min-width: 0; display: block; color: var(--text); font-size: 0.92rem; font-weight: 600; line-height: 1.3; text-align: right; overflow-wrap: anywhere; }
.review-item .review-total { color: var(--ok-text); font-family: var(--font-mono); font-size: 1.4rem; font-variant-numeric: tabular-nums; }
.review-item .review-people { font-family: var(--font-mono); }
.review-item .review-people.ok { color: var(--ok-text); }
.review-item .review-people.warn { color: var(--warn-text); }
.review-folio, .review-date { font-family: var(--font-mono); font-size: 0.86rem !important; }
.review-hint { display: flex; align-items: center; gap: 8px; margin: 12px 0 0; padding: 9px 12px; border: 1px solid rgba(251, 191, 36, 0.28); border-radius: 9px; background: rgba(251, 191, 36, 0.07); color: var(--warn-text); font-size: 0.84rem; }
.review-hint svg { flex-shrink: 0; }

/* =========================================================
   BUTTONS
========================================================= */
.action-buttons { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 12px; margin-top: 20px; }
.confirm-button, .receipt-button { border: 0; font-family: inherit; cursor: pointer; }
.confirm-button { min-height: 62px; display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 12px; background: linear-gradient(135deg, var(--button), color-mix(in srgb, var(--button) 76%, black)); color: var(--button-text); box-shadow: 0 12px 26px -10px color-mix(in srgb, var(--button) 60%, transparent); transition: filter 0.18s ease, opacity 0.18s ease, transform 0.18s ease; }
.confirm-button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.confirm-button:focus-visible, .receipt-button:focus-visible, .promo-button:focus-visible, .promo-remove:focus-visible, .slot-remove:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.confirm-button:disabled { cursor: not-allowed; opacity: 0.4; box-shadow: none; }
.button-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 9px; background: rgba(255, 255, 255, 0.14); }
.button-text { min-width: 0; flex: 1; text-align: left; }
.button-text strong { display: block; font-size: 1rem; line-height: 1.25; }
.button-text small { display: block; margin-top: 1px; color: rgba(255, 255, 255, 0.8); font-size: 0.8rem; }
.button-arrow { flex-shrink: 0; }
.receipt-button { min-height: 62px; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px 8px; padding: 10px 14px; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-radius: 12px; background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent); font-size: 0.92rem; font-weight: 600; line-height: 1.25; text-align: center; transition: border-color 0.18s ease, background 0.18s ease; }
.receipt-button:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
.receipt-button.ready { border-color: rgba(52, 211, 153, 0.4); color: var(--ok-text); background: rgba(52, 211, 153, 0.07); }
.receipt-ready { width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px; color: var(--ok-text); font-size: 0.72rem; font-weight: 600; }
.receipt-ready i { width: 5px; height: 5px; border-radius: 50%; background: var(--ok); }

/* =========================================================
   SUCCESS
========================================================= */
.payment-success { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 13px 15px; border: 1px solid rgba(52, 211, 153, 0.28); border-radius: 11px; background: rgba(52, 211, 153, 0.07); }
.success-icon { width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 9px; color: var(--ok); background: rgba(52, 211, 153, 0.14); }
.payment-success > div { min-width: 0; flex: 1; }
.payment-success > div strong { display: block; margin-bottom: 2px; color: var(--ok-text); font-size: 0.94rem; }
.payment-success > div span { display: block; color: var(--muted); font-family: var(--font-mono); font-size: 0.82rem; overflow-wrap: anywhere; }
.payment-success > div .success-people { margin-top: 2px; font-family: var(--font-body); font-size: 0.8rem; }
.success-amount { color: var(--ok-text); font-family: var(--font-mono); font-size: 1.1rem; font-variant-numeric: tabular-nums; }

/* =========================================================
   MÉTODO DE PAGO
========================================================= */
.method-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px; }
.method-tile { position: relative; min-width: 0; min-height: 64px; display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--line-strong); border-radius: 12px; background: var(--input-bg); color: var(--text); font-family: inherit; text-align: left; cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease; }
.method-tile:hover { border-color: color-mix(in srgb, var(--accent) 55%, var(--line-strong)); transform: translateY(-1px); }
.method-tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.method-tile.active { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--input-bg)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent); }
.method-icon { width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: var(--muted); background: color-mix(in srgb, var(--text) 7%, transparent); transition: color 0.18s ease, background 0.18s ease; }
.method-tile.active .method-icon { color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, transparent); }
.method-text { min-width: 0; }
.method-text strong { display: block; color: var(--title); font-size: 0.95rem; font-weight: 600; line-height: 1.25; }
.method-text small { display: block; margin-top: 2px; color: var(--muted); font-size: 0.78rem; line-height: 1.3; }
.method-check { position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--accent); color: var(--card); opacity: 0; transform: scale(0.6); transition: opacity 0.18s ease, transform 0.18s ease; }
.method-tile.active .method-check { opacity: 1; transform: scale(1); }

/* =========================================================
   FOLIO
========================================================= */
.folio-group > label { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.folio-badge { padding: 2px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.6px; }
.folio-badge.auto { color: var(--ok-text); background: rgba(52, 211, 153, 0.12); }
.folio-badge.required { color: var(--warn-text); background: rgba(251, 191, 36, 0.12); }
.folio-note { display: flex; align-items: flex-start; gap: 10px; margin: 10px 0 0; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--accent) 6%, transparent); color: var(--muted); font-size: 0.84rem; line-height: 1.45; }
.folio-note svg { flex-shrink: 0; margin-top: 2px; color: var(--accent); }

/* =========================================================
   STRIPE
========================================================= */
.stripe-box { margin-top: 18px; padding: 18px; display: flex; flex-direction: column; gap: 14px; border: 1px solid color-mix(in srgb, #635bff 38%, var(--line)); border-radius: 14px; background: linear-gradient(180deg, color-mix(in srgb, #635bff 9%, var(--input-bg)), var(--input-bg)); }
.stripe-head { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.stripe-icon { width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 11px; color: #b4afff; background: rgba(99, 91, 255, 0.18); }
.stripe-head-text { min-width: 0; flex: 1 1 200px; }
.stripe-head-text strong { display: block; color: var(--title); font-size: 0.98rem; }
.stripe-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 0.84rem; font-weight: 600; }
.stripe-status i { width: 7px; height: 7px; border-radius: 50%; }
.stripe-status.ok { color: var(--ok-text); }
.stripe-status.ok i { background: var(--ok); box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18); }
.stripe-status.warn { color: var(--warn-text); }
.stripe-status.warn i { background: var(--warn); box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18); }
.stripe-hint { margin: 0; color: var(--muted); font-size: 0.88rem; line-height: 1.5; }
.stripe-actions, .qr-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.stripe-action { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 9px; background: var(--button); color: var(--button-text); font-family: inherit; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: filter 0.18s ease; }
.stripe-action:hover:not(:disabled) { filter: brightness(1.1); }
.stripe-action:disabled { opacity: 0.5; cursor: not-allowed; }
.stripe-link { min-height: 40px; display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px; border: 1px solid var(--line-strong); border-radius: 9px; background: transparent; color: var(--accent); font-family: inherit; font-size: 0.84rem; font-weight: 600; text-align: left; cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease; }
.stripe-link:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.stripe-qr { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: stretch; gap: 28px; padding: 22px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); }
.qr-side { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.qr-frame { padding: 14px; border-radius: 16px; background: #fff; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 32px -10px rgba(0, 0, 0, 0.6); }
.qr-frame img { width: 208px; max-width: 100%; height: auto; display: block; }
.qr-scan { max-width: 236px; display: inline-flex; align-items: center; gap: 7px; color: var(--muted); font-size: 0.78rem; line-height: 1.35; text-align: center; }
.qr-scan svg { flex-shrink: 0; color: var(--accent); }
.qr-info { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 16px; }
.qr-state { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 999px; color: var(--warn-text); background: rgba(251, 191, 36, 0.12); font-size: 0.78rem; font-weight: 700; }
.qr-state i { width: 7px; height: 7px; border-radius: 50%; background: var(--warn); animation: qr-pulse 1.6s ease-in-out infinite; }
.qr-state.paid { color: var(--ok-text); background: rgba(52, 211, 153, 0.12); }
.qr-state.paid i { background: var(--ok); animation: none; }
@keyframes qr-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.55); } 50% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); } }
.qr-amount-block { display: flex; flex-direction: column; gap: 2px; }
.qr-amount-label { color: var(--muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.8px; }
.qr-amount { color: var(--title); font-family: var(--font-mono); font-size: 2.3rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.qr-amount small { margin-left: 4px; color: var(--muted); font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; letter-spacing: 0; }
.qr-note { display: flex; align-items: flex-start; gap: 9px; margin: 0; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--muted); font-size: 0.84rem; line-height: 1.45; }
.qr-note svg { flex-shrink: 0; margin-top: 2px; color: var(--accent); }
.qr-actions { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.qr-primary { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.stripe-open { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 14px; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-radius: 9px; background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent); font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: border-color 0.18s ease, background 0.18s ease; }
.stripe-open:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
.qr-hide { min-height: 36px; padding: 2px 0; border: 0; background: transparent; color: var(--muted); font-family: inherit; font-size: 0.82rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.qr-hide:hover { color: var(--text); }

/* =========================================================
   MODAL
========================================================= */
.modal-wrapper { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; background: rgba(0, 0, 0, 0.82); }
.pop-enter-active, .pop-leave-active { transition: opacity 0.18s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }

/* =========================================================
   NOTIFICATIONS
========================================================= */
:deep(.notification-container), :deep(.toast-container) { width: calc(100% - 32px) !important; max-width: 480px !important; left: 50% !important; right: auto !important; margin: 0 auto !important; box-sizing: border-box !important; transform: translateX(-50%) !important; }

/* =========================================================
   RESPONSIVE
========================================================= */

/* Pantalla ancha: izquierda = método de pago + folio; derecha = monto + resumen; botones abajo a todo el ancho */
@media (min-width: 1180px) {
  .payment-card > .form-section:not(.group-section):not(.amount-section) { grid-column: 1; grid-row: span 3; }
  .payment-card > .amount-section { grid-column: 2; }
  .payment-card > .transaction-review { grid-column: 2; margin-top: 0; align-self: start; }
  .method-grid { grid-template-columns: 1fr; }
}

@media (max-width: 1100px) { .payment-page { padding: 28px 28px 48px; } }

/* Tableta y móvil: el cliente pasa arriba como tarjeta horizontal compacta y el cobro usa todo el ancho */
@media (max-width: 1000px) {
  .payment-page { padding: 24px 20px 40px; }
  .payment-layout { grid-template-columns: 1fr; gap: 16px; }
  .client-column { position: static; }
  /* Tableta: foto a la izquierda, nombre y estado a la derecha, datos abajo */
  .client-card {
    display: grid; grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas: "label label" "avatar name" "avatar pill" "info info";
    column-gap: 20px; row-gap: 6px; align-items: center; align-content: start;
    padding: 22px 20px 18px;
  }
  .client-label { grid-area: label; margin: 0 0 8px; text-align: left; }
  .avatar-container { grid-area: avatar; width: 104px; height: 104px; margin: 0; }
  .avatar { border-radius: 22px; box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 8%, transparent), 0 12px 24px -12px rgba(0, 0, 0, 0.6); }
  .client-name { grid-area: name; align-self: end; margin: 0; text-align: left; }
  .client-name h2 { font-size: 1.3rem; }
  .active-pill { grid-area: pill; align-self: start; justify-self: start; margin-top: 4px; }
  .client-mini-info { grid-area: info; width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0 24px; margin-top: 16px; }
  .client-mini-info > div { flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 2px; padding: 8px 2px; border-bottom: 0; }
  .client-mini-info strong { text-align: left; }
}

/* Celular: todo centrado en una sola columna */
@media (max-width: 560px) {
  /* Tarjeta compacta: foto cuadrada a la izquierda, nombre y estado a la derecha */
  .client-card { padding: 20px 16px 14px; column-gap: 16px; row-gap: 4px; }
  .client-label { margin: 0 0 14px; font-size: 0.68rem; }
  .avatar-container { width: 96px; height: 96px; }
  .avatar { border-radius: 18px; }
  .client-name h2 { font-size: 1.2rem; line-height: 1.2; }
  .active-pill {
    margin-top: 8px; padding: 4px 11px 4px 9px;
    font-size: 0.76rem; font-weight: 600;
  }
  .active-pill i { width: 7px; height: 7px; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18); }

  .client-mini-info { display: block; margin-top: 16px; }
  .client-mini-info > div { flex-direction: row; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 2px; border-bottom: 1px solid var(--line); }
  .client-mini-info > div:last-child { padding-bottom: 2px; border-bottom: 0; }
  .client-mini-info strong { text-align: right; }
}

@media (max-width: 780px) {
  .page-header { align-items: flex-start; flex-direction: column; gap: 16px; }
  .search-section { width: 100%; }
  .action-buttons { grid-template-columns: 1fr; }
  /* El botón de confirmar queda siempre a la mano al bajar por el formulario */
  .action-buttons {
    position: sticky; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 15;
    padding: 10px; border: 1px solid var(--line-strong); border-radius: 16px;
    background: color-mix(in srgb, var(--card) 94%, transparent);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    box-shadow: 0 -10px 30px -12px rgba(0, 0, 0, 0.65);
  }
  .receipt-button { min-height: 52px; }
  .stripe-qr { grid-template-columns: 1fr; justify-items: center; gap: 20px; }
  .qr-info { width: 100%; align-items: center; text-align: center; }
  .qr-amount-block { align-items: center; }
}

@media (max-width: 600px) {
  .payment-page { padding: 18px 12px calc(32px + env(safe-area-inset-bottom, 0px)); }
  .page-header { margin-bottom: 20px; padding-bottom: 18px; }
  .page-header p { font-size: 0.92rem; }
  .payment-card { padding: 18px 16px; }
  .payment-card-header { flex-direction: column; align-items: stretch; gap: 14px; margin-bottom: 18px; }
  .promo-button { width: 100%; }
  .payment-title h3 { font-size: 1.2rem; }
  .billing-dates { grid-template-columns: 1fr; gap: 8px; }
  .date-arrow { justify-content: center; transform: rotate(90deg); }
  .billing-date strong { white-space: normal; }

  /* Total a pagar con más aire */
  .payment-summary { align-items: stretch; flex-direction: column; gap: 18px; padding: 20px 18px; margin-bottom: 18px; }
  .summary-heading { gap: 8px; margin-bottom: 12px; }
  .big-amount { margin-bottom: 4px; }
  .plan-line { margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--line-strong); row-gap: 6px; }
  .summary-side { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .surcharge-box { flex: 1 1 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; text-align: left; }
  .surcharge-box span { margin: 0; }
  .promotion-applied { flex: 1 1 100%; justify-content: flex-start; }

  .form-section { padding: 18px 0; }
  /* 16px evita el zoom automático de iOS al enfocar un campo */
  .field-control input, .search-control input { font-size: 1rem; }
  .amount-input-box { min-height: 62px; padding: 0 14px; }
  .amount-input-box input { font-size: 1.6rem; }

  /* Resumen: encabezado y estado "Incompleto" */
  .transaction-review { padding: 16px; }
  /* Encabezado: "RESUMEN" a la izquierda y el estado a la derecha; el título debajo */
  .review-heading {
    display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center;
    column-gap: 10px; row-gap: 6px; flex-wrap: nowrap;
    margin-bottom: 6px; padding-bottom: 14px; border-bottom: 1px solid var(--line);
  }
  .review-heading > div { display: contents; }
  .review-heading .section-kicker { grid-column: 1; grid-row: 1; margin: 0; }
  .review-heading strong { grid-column: 1 / -1; grid-row: 2; font-size: 1rem; line-height: 1.25; }
  .review-status {
    grid-column: 2; grid-row: 1; gap: 6px; padding: 3px 10px 3px 8px;
    font-size: 0.72rem; font-weight: 600; white-space: nowrap;
  }

  .method-grid { grid-template-columns: 1fr; gap: 10px; }
  .stripe-box { padding: 14px; }
  .stripe-link { width: 100%; justify-content: center; }
  .qr-frame img { width: 100%; }
  .qr-actions { grid-template-columns: 1fr; }
  .stripe-qr { padding: 16px; }
  .qr-amount { font-size: 2rem; }
  .group-slots { grid-template-columns: 1fr; }
  .group-section .form-section-title { flex-wrap: wrap; }
  .group-counter { font-size: 0.78rem; }
  .group-price { grid-template-columns: 1fr; }
  .action-buttons { margin-left: -6px; margin-right: -6px; }
}

@media (max-width: 400px) {
  .avatar-container { width: 84px; height: 84px; }
  .client-name h2 { font-size: 1.1rem; }
  .summary-side { flex-direction: column; align-items: stretch; }
  .success-amount { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>