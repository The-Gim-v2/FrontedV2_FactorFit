<template>
  <section
    class="access-panel"
    role="dialog"
    aria-modal="true"
    :aria-label="mode === 'scanner' ? 'Escáner QR' : 'Asistencia facial'"
  >
    <!-- ENCABEZADO -->
    <header class="access-head">
      <div class="head-icon" aria-hidden="true">
        <svg v-if="mode === 'scanner'" viewBox="0 0 24 24">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h3v2h-3zM18 13h2v2h-2zM13 17h2v3h-2zM17 17h3v3h-3z" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10v1M15 10v1M9.5 15a3.5 3.5 0 0 0 5 0" />
        </svg>
      </div>
      <div class="head-copy">
        <span class="eyebrow">Control de acceso · Sede {{ sedeId }}</span>
        <h2>{{ mode === 'scanner' ? 'Escáner QR' : 'Asistencia facial' }}</h2>
        <p>
          {{ mode === 'scanner'
            ? 'Acerca el QR del pase digital al centro del recuadro.'
            : 'Reconocimiento biométrico: pendiente de integración.' }}
        </p>
      </div>
      <button type="button" class="close-btn" aria-label="Cerrar" @click="$emit('close')">
        <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </header>

    <div class="access-body">
      <!-- CÁMARA -->
      <div class="camera-frame">
        <video ref="video" autoplay playsinline muted @loadeddata="cameraReady = true"></video>

        <div v-if="!cameraReady" class="camera-placeholder">
          <svg viewBox="0 0 24 24">
            <path d="M23 7l-7 5 7 5V7zM3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            <path v-if="camFailed" d="M2 2l20 20" />
          </svg>
          <span>{{ camFailed ? 'Cámara no disponible' : 'Iniciando cámara…' }}</span>
        </div>

        <!-- Visor QR -->
        <div v-if="mode === 'scanner' && cameraReady" class="scan-box" aria-hidden="true">
          <i class="corner tl"></i><i class="corner tr"></i>
          <i class="corner bl"></i><i class="corner br"></i>
          <span v-if="scanning" class="scan-line"></span>
        </div>

        <!-- Guía de rostro -->
        <div v-if="mode === 'facial' && cameraReady" class="face-guide" aria-hidden="true"></div>

        <span v-if="cameraReady" class="cam-chip" :class="{ live: mode === 'scanner' && scanning }">
          <i></i>
          {{ mode === 'facial' ? 'Vista previa' : scanning ? 'Escaneando' : 'Cámara activa' }}
        </span>
      </div>

      <!-- AVISOS -->
      <p v-if="notice" class="msg info" role="status">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></svg>
        <span>{{ notice }}</span>
      </p>
      <p v-if="error" class="msg danger" role="alert">
        <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
        <span>{{ error }}</span>
      </p>

      <!-- MODO ESCÁNER: registro alternativo plegable -->
      <div v-if="mode === 'scanner'" class="manual" :class="{ open: manualOpen }">
        <button type="button" class="manual-toggle" :aria-expanded="manualOpen" @click="manualOpen = !manualOpen">
          <span class="manual-title">
            <strong>Registro alternativo</strong>
            <span>Busca al socio por nombre, correo o inscripción</span>
          </span>
          <svg class="chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
        </button>

        <div v-if="manualOpen" class="manual-body">
          <p class="access-help">Verifica la identidad del socio antes de registrar su entrada.</p>

          <form class="access-form" @submit.prevent="buscarClientes">
            <div class="field">
              <input
                v-model.trim="busqueda"
                maxlength="120"
                minlength="3"
                placeholder="Nombre, correo o número de inscripción"
                autocomplete="off"
                aria-label="Buscar cliente"
              />
            </div>
            <button type="submit" :disabled="buscando || busqueda.trim().length < 3">
              <i v-if="buscando" class="spinner"></i>
              {{ buscando ? 'Buscando…' : 'Buscar cliente' }}
            </button>
          </form>

          <div v-if="resultados.length" class="client-results">
            <button
              v-for="cliente in resultados"
              :key="cliente.id_inscripto"
              type="button"
              class="client-result"
              :class="{ selected: seleccionado?.id_inscripto === cliente.id_inscripto }"
              @click="seleccionado = cliente; resultado = null; error = ''"
            >
              <span>
                <strong>{{ cliente.nombre }}</strong>
                <small>{{ cliente.correo || 'Sin correo' }} · Inscripción #{{ cliente.id_inscripto }} · Sede {{ cliente.sede_registro }}</small>
              </span>
              <span class="client-status">{{ cliente.estatus }}</span>
            </button>
          </div>
          <p v-else-if="busquedaRealizada" class="access-help">No se encontraron inscripciones con esa búsqueda.</p>

          <p v-if="seleccionado" class="access-help">
            Seleccionado: <strong>{{ seleccionado.nombre }}</strong>. Confirma visualmente su identidad antes de registrar.
          </p>

          <button class="manual-submit" type="button" :disabled="saving || !seleccionado" @click="registrarManual">
            {{ saving ? 'Registrando…' : 'Registrar entrada del cliente seleccionado' }}
          </button>
        </div>
      </div>

      <!-- MODO FACIAL: aviso -->
      <div v-else class="facial-note">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
        <div>
          <strong>Aún no disponible</strong>
          <p>
            Falta el motor de identificación facial, el consentimiento y el enrolamiento biométrico.
            Para registrar entradas verificadas usa el Escáner QR; no se registrarán rostros sin identificar.
          </p>
        </div>
      </div>

      <!-- RESULTADO -->
      <div v-if="resultado" class="result" :class="tone" role="status">
        <span class="result-icon" aria-hidden="true">
          <svg v-if="tone === 'ok'" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
          <svg v-else-if="tone === 'dup'" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></svg>
          <svg v-else viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
        </span>
        <div class="result-main">
          <strong>{{ resultado.mensaje }}</strong>
          <span class="result-name">{{ resultado.nombre }}</span>
        </div>
        <span v-if="resultado.estatus" class="badge">{{ resultado.estatus }}</span>
        <dl class="result-meta">
          <div><dt>Inscrito en</dt><dd>Sede {{ resultado.sede_registro }}</dd></div>
          <div><dt>Escaneado en</dt><dd>Sede {{ resultado.sede_escaneo }}</dd></div>
        </dl>
        <p v-if="resultado.aviso" class="result-notice">{{ resultado.aviso }}</p>
      </div>
    </div>

    <footer class="access-foot">
      <button type="button" @click="$emit('close')">Cerrar</button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

type Cliente = { id_inscripto: number; nombre: string; correo: string | null; estatus: string; sede_registro: number };

const props = defineProps<{ mode: 'facial' | 'scanner'; sedeId: number }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'registered'): void }>();

const video = ref<HTMLVideoElement | null>(null);
const codigo = ref('');
const error = ref('');
const notice = ref('');
const saving = ref(false);
const scanning = ref(false);
const cameraReady = ref(false);
const camFailed = ref(false);
const manualOpen = ref(false);
const resultado = ref<Record<string, any> | null>(null);

const busqueda = ref('');
const buscando = ref(false);
const busquedaRealizada = ref(false);
const resultados = ref<Cliente[]>([]);
const seleccionado = ref<Cliente | null>(null);

let stream: MediaStream | null = null;
let frame = 0;
let detector: any = null; // BarcodeDetector nativo
let jsQR: any = null;     // respaldo para navegadores sin BarcodeDetector
let canvas: HTMLCanvasElement | null = null;
let busy = false;
let alive = true;
let lastQR = '';

const tone = computed(() =>
  resultado.value?.duplicado ? 'dup' : resultado.value?.permitido ? 'ok' : 'warn'
);

const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');

const getToken = () => {
  for (const store of [sessionStorage, localStorage]) {
    for (const key of ['token', 'auth_token', 'access_token', 'gym_token', 'GYM_ACCOUNT_token', 'gymAccountToken']) {
      const v = store.getItem(key);
      if (v) return v.replace(/^Bearer\s+/i, '');
    }
    for (const key of ['auth', 'user', 'session', 'gymAccount', 'gym_account']) {
      try {
        const o = JSON.parse(store.getItem(key) || 'null');
        const v = o?.token || o?.access_token || o?.accessToken;
        if (v) return String(v).replace(/^Bearer\s+/i, '');
      } catch { /* dato no JSON */ }
    }
  }
  return '';
};

const api = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) throw new Error('No se encontró la sesión activa.');
  const r = await fetch(`${API}/api/gym/control-acceso/${path}`, {
    ...options,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    cache: 'no-store'
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || `Error HTTP ${r.status}`);
  return d;
};

const buscarClientes = async () => {
  if (buscando.value || busqueda.value.trim().length < 3) return;
  buscando.value = true;
  busquedaRealizada.value = false;
  resultados.value = [];
  seleccionado.value = null;
  error.value = '';
  try {
    const d = await api(`buscar?sede_id=${props.sedeId}&q=${encodeURIComponent(busqueda.value.trim())}`);
    resultados.value = Array.isArray(d.clientes) ? d.clientes : [];
    busquedaRealizada.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo consultar clientes.';
  } finally {
    buscando.value = false;
  }
};

const registrarSolicitud = async (payload: { codigo_qr?: string; id_inscripto?: number }) => {
  if (busy) return;
  busy = true;
  saving.value = true;
  error.value = '';
  resultado.value = null;
  try {
    const d = await api('registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sede_id: props.sedeId, ...payload })
    });
    resultado.value = d;
    if (d.registrado) emit('registered');
    codigo.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No fue posible registrar la asistencia.';
  } finally {
    busy = false;
    saving.value = false;
  }
};

const registrar = async () => {
  if (codigo.value.length === 64) await registrarSolicitud({ codigo_qr: codigo.value });
};
const registrarManual = async () => {
  if (seleccionado.value) await registrarSolicitud({ id_inscripto: seleccionado.value.id_inscripto });
};

/* Lee un cuadro de la cámara y devuelve el texto del QR (o '') */
const decodeFrame = async (): Promise<string> => {
  const v = video.value;
  if (!v) return '';
  if (detector) {
    const found = await detector.detect(v);
    return String(found?.[0]?.rawValue || '').trim();
  }
  if (jsQR && v.videoWidth) {
    canvas ??= document.createElement('canvas');
    const w = Math.min(v.videoWidth, 800);
    const h = Math.round((v.videoHeight * w) / v.videoWidth);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';
    ctx.drawImage(v, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
    return String(code?.data || '').trim();
  }
  return '';
};

const scan = async () => {
  if (!alive || (!detector && !jsQR) || !video.value) return;
  try {
    if (video.value.readyState >= 2 && !saving.value && !busy) {
      const raw = await decodeFrame();
      if (raw.length === 64 && raw !== lastQR) {
        lastQR = raw;
        codigo.value = raw;
        await registrar();
      }
    }
  } catch { /* cuadro no legible */ }
  if (alive) frame = window.setTimeout(scan, 400);
};

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: props.mode === 'scanner' ? 'environment' : 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    if (!alive) {
      stream.getTracks().forEach(t => t.stop());
      return;
    }
    if (video.value) {
      video.value.srcObject = stream;
      await video.value.play().catch(() => {});
    }
    if (props.mode === 'scanner') {
      const D = (window as any).BarcodeDetector;
      if (D) {
        detector = new D({ formats: ['qr_code'] });
      } else {
        try {
          jsQR = (await import('jsqr')).default;
        } catch {
          notice.value = 'No se pudo cargar el lector QR de respaldo. Usa el registro alternativo.';
          manualOpen.value = true;
        }
      }
      if (detector || jsQR) {
        scanning.value = true;
        void scan();
      }
    }
  } catch {
    camFailed.value = true;
    manualOpen.value = true;
    notice.value = 'La cámara no está disponible. Revisa los permisos o usa el registro alternativo.';
  }
});

onUnmounted(() => {
  alive = false;
  window.clearTimeout(frame);
  stream?.getTracks().forEach(t => t.stop());
});
</script>

<style scoped>
.access-panel {
  /* Hereda los tokens del dashboard, con valores de respaldo */
  --a-hl: var(--hl, #3b82f6);
  --a-hl-soft: color-mix(in srgb, var(--a-hl) 12%, transparent);
  --a-hl-line: color-mix(in srgb, var(--a-hl) 42%, transparent);
  --a-card: var(--card, #121212);
  --a-line: var(--line, rgba(255, 255, 255, 0.07));
  --a-line2: var(--line2, rgba(255, 255, 255, 0.13));
  --a-title: var(--title, #fff);
  --a-text2: var(--text2, rgba(245, 245, 244, 0.66));
  --a-text3: var(--text3, rgba(245, 245, 244, 0.45));
  --a-surface: var(--surface, rgba(255, 255, 255, 0.03));
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  width: min(96vw, 760px);
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f5f5f4;
  font-family: 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(420px 200px at 100% 0%, var(--a-hl-soft), transparent 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 30%),
    var(--a-card);
  border: 1px solid var(--a-line2);
  border-radius: 24px;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: panel-in 0.26s var(--ease);
}

@keyframes panel-in {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

/* ---------- Encabezado ---------- */
.access-head {
  flex: none;
  padding: 20px 24px 18px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  border-bottom: 1px solid var(--a-line);
}

.head-icon {
  width: 46px;
  height: 46px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--a-hl);
  background: var(--a-hl-soft);
  border: 1px solid var(--a-hl-line);
  border-radius: 14px;
}

.head-icon svg,
.close-btn svg,
.msg svg,
.manual-toggle svg,
.facial-note svg,
.camera-placeholder svg,
.result-icon svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.head-icon svg { width: 22px; height: 22px; }

.head-copy { min-width: 0; flex: 1; }

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--a-hl);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.eyebrow::before {
  content: '';
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: var(--a-hl);
}

.access-head h2 {
  margin: 0;
  color: var(--a-title);
  font-family: 'Oswald', sans-serif;
  font-size: 25px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.access-head p {
  margin: 4px 0 0;
  color: var(--a-text2);
  font-size: 13px;
}

.close-btn {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--a-line2);
  border-radius: 11px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s var(--ease);
}
.close-btn svg { width: 17px; height: 17px; }
.close-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.1); transform: rotate(90deg); }

/* ---------- Cuerpo ---------- */
.access-body {
  flex: 1;
  min-height: 0;
  padding: 18px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

/* Nada dentro del cuerpo se encoge: la cámara conserva su tamaño */
.access-body > * { flex: none; }

/* ---------- Cámara (grande) ---------- */
.camera-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 300px;
  max-height: 60vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.05), transparent 60%),
    #07080b;
  border: 1px solid var(--a-line2);
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
}

.camera-frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--a-text3);
  font-size: 13px;
  font-weight: 600;
}
.camera-placeholder svg { width: 42px; height: 42px; opacity: 0.8; }

/* Visor QR: cuadrado grande basado en la altura de la cámara */
.scan-box {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 72%;
  max-height: 380px;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 36px;
  height: 36px;
  border: 0 solid var(--a-hl);
  filter: drop-shadow(0 0 6px var(--a-hl-line));
}
.corner.tl { top: 0; left: 0; border-top-width: 4px; border-left-width: 4px; border-top-left-radius: 20px; }
.corner.tr { top: 0; right: 0; border-top-width: 4px; border-right-width: 4px; border-top-right-radius: 20px; }
.corner.bl { bottom: 0; left: 0; border-bottom-width: 4px; border-left-width: 4px; border-bottom-left-radius: 20px; }
.corner.br { bottom: 0; right: 0; border-bottom-width: 4px; border-right-width: 4px; border-bottom-right-radius: 20px; }

.scan-line {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--a-hl), transparent);
  box-shadow: 0 0 14px var(--a-hl);
  animation: sweep 2.2s ease-in-out infinite;
}
@keyframes sweep {
  0%, 100% { top: 8%; }
  50% { top: 92%; }
}

/* Guía de rostro */
.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 78%;
  max-height: 400px;
  aspect-ratio: 3 / 4;
  transform: translate(-50%, -50%);
  border: 2px dashed var(--a-hl-line);
  border-radius: 50%;
  box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.cam-chip {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 12px 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 700;
  background: rgba(10, 10, 10, 0.7);
  border: 1px solid var(--a-line2);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.cam-chip i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9ca3af;
}
.cam-chip.live { color: #34d399; border-color: rgba(52, 211, 153, 0.35); }
.cam-chip.live i {
  background: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2), 0 0 10px #34d399;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 50% { opacity: 0.4; } }

/* ---------- Avisos ---------- */
.msg {
  margin: 0;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  font-size: 12.5px;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 13px;
}
.msg svg { width: 18px; height: 18px; flex: none; margin-top: 1px; }
.msg.info { color: #93c5fd; background: rgba(59, 130, 246, 0.09); border-color: rgba(59, 130, 246, 0.28); }
.msg.danger { color: #fca5a5; background: rgba(239, 68, 68, 0.09); border-color: rgba(239, 68, 68, 0.3); }

/* ---------- Registro alternativo (plegable) ---------- */
.manual {
  background: var(--a-surface);
  border: 1px solid var(--a-line);
  border-radius: 16px;
  overflow: hidden;
}

.manual-toggle {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  transition: background 0.2s ease;
}
.manual-toggle:hover { background: rgba(255, 255, 255, 0.035); }

.manual-title { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.manual-title strong { color: var(--a-title); font-size: 13.5px; }
.manual-title span { color: var(--a-text3); font-size: 12px; }

.chev {
  width: 18px;
  height: 18px;
  flex: none;
  color: var(--a-text2);
  transition: transform 0.25s var(--ease);
}
.manual.open .chev { transform: rotate(180deg); }

.manual-body {
  padding: 4px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--a-line);
  padding-top: 14px;
}

.access-help { margin: 0; color: var(--a-text2); font-size: 12.5px; line-height: 1.5; }
.access-help strong { color: var(--a-title); }

.access-form { display: flex; gap: 10px; flex-wrap: wrap; }

.field { flex: 1 1 220px; min-width: 0; }

.field input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  color: #fff;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--a-line2);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.field input::placeholder { color: var(--a-text3); }
.field input:focus { border-color: var(--a-hl); box-shadow: 0 0 0 3px var(--a-hl-soft); }

.access-form button,
.manual-submit {
  height: 46px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(180deg, color-mix(in srgb, var(--a-hl) 92%, white), var(--a-hl));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  box-shadow: 0 12px 26px -12px var(--a-hl);
  transition: transform 0.2s var(--ease), filter 0.2s ease;
}
.access-form button { flex: 0 0 auto; }
.manual-submit { width: 100%; }
.access-form button:hover:not(:disabled),
.manual-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.access-form button:disabled,
.manual-submit:disabled {
  color: var(--a-text3);
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--a-line2);
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Lista de clientes */
.client-results {
  max-height: 210px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  overflow: auto;
}

.client-result {
  width: 100%;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--a-title);
  text-align: left;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--a-line2);
  border-radius: 12px;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.client-result:hover { background: rgba(255, 255, 255, 0.07); }
.client-result.selected { border-color: var(--a-hl); background: var(--a-hl-soft); }
.client-result > span:first-child { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.client-result strong { font-size: 12.5px; }
.client-result small { color: var(--a-text2); font-size: 11px; overflow-wrap: anywhere; }
.client-status { color: var(--a-hl); font-size: 10.5px; font-weight: 700; white-space: nowrap; }

/* ---------- Nota facial ---------- */
.facial-note {
  padding: 16px;
  display: flex;
  gap: 14px;
  background: rgba(245, 158, 11, 0.07);
  border: 1px solid rgba(245, 158, 11, 0.28);
  border-radius: 16px;
}
.facial-note svg { width: 26px; height: 26px; flex: none; color: #fbbf24; }
.facial-note strong { display: block; color: var(--a-title); font-size: 13.5px; }
.facial-note p { margin: 5px 0 0; color: var(--a-text2); font-size: 12.5px; line-height: 1.55; }

/* ---------- Resultado ---------- */
.result {
  --tone: #34d399;
  padding: 16px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 4px 14px;
  background:
    radial-gradient(240px 110px at 0% 0%, color-mix(in srgb, var(--tone) 14%, transparent), transparent 75%),
    color-mix(in srgb, var(--tone) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--tone) 38%, transparent);
  border-radius: 16px;
  animation: panel-in 0.28s var(--ease);
}
.result.warn { --tone: #fbbf24; }
.result.dup { --tone: #94a3b8; }

.result-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
  border-radius: 13px;
}
.result-icon svg { width: 21px; height: 21px; stroke-width: 2.2; }

.result-main { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.result-main strong { color: var(--a-title); font-size: 14.5px; }
.result-name { overflow: hidden; color: var(--a-text2); font-size: 12.5px; text-overflow: ellipsis; white-space: nowrap; }

.badge {
  padding: 5px 11px;
  color: var(--tone);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  background: color-mix(in srgb, var(--tone) 13%, transparent);
  border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
  border-radius: 999px;
}

.result-meta {
  grid-column: 1 / -1;
  margin: 12px 0 0;
  padding-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  border-top: 1px solid var(--a-line);
}
.result-meta div { display: flex; flex-direction: column; gap: 3px; }
.result-meta dt { color: var(--a-text3); font-size: 10.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
.result-meta dd { margin: 0; color: var(--a-title); font-size: 13px; font-weight: 600; }

.result-notice {
  grid-column: 1 / -1;
  margin: 10px 0 0;
  padding: 10px 12px;
  color: var(--tone);
  font-size: 12.5px;
  line-height: 1.5;
  background: color-mix(in srgb, var(--tone) 9%, transparent);
  border-radius: 10px;
}

/* ---------- Pie ---------- */
.access-foot {
  flex: none;
  padding: 12px 24px 18px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--a-line);
}
.access-foot button {
  padding: 11px 26px;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--a-line2);
  border-radius: 11px;
  transition: background 0.2s ease;
}
.access-foot button:hover { background: rgba(255, 255, 255, 0.1); }

/* ---------- Accesibilidad ---------- */
.close-btn:focus-visible,
.manual-toggle:focus-visible,
.access-form button:focus-visible,
.manual-submit:focus-visible,
.client-result:focus-visible,
.access-foot button:focus-visible {
  outline: 2px solid var(--a-hl);
  outline-offset: 2px;
}

/* ---------- Móvil ---------- */
@media (max-width: 520px) {
  .access-panel { width: 100%; max-height: 97vh; border-radius: 20px; }
  .access-head { padding: 14px 14px 12px; gap: 11px; }
  .head-icon { width: 40px; height: 40px; border-radius: 12px; }
  .access-head h2 { font-size: 20px; }
  .access-head p { font-size: 12px; }
  .access-body { padding: 12px 12px 16px; gap: 12px; }
  .camera-frame { min-height: 280px; max-height: 62vh; border-radius: 16px; }
  .scan-box { height: 76%; }
  .access-form button { flex: 1 1 100%; }
  .result { grid-template-columns: 40px minmax(0, 1fr); }
  .badge { grid-column: 2; justify-self: start; margin-top: 4px; }
  .access-foot { padding: 10px 14px 14px; }
  .access-foot button { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .access-panel, .result { animation: none; }
  .scan-line, .cam-chip.live i, .spinner { animation-duration: 0.01ms; animation-iteration-count: 1; }
  .close-btn:hover { transform: none; }
}
</style>