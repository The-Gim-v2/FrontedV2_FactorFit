<template>
  <div ref="rootRef">
    <!-- Botón flotante de ayuda -->
    <button v-if="tutorialEnabled && steps.length > 0" class="btn-help" @click="startTutorial">
      <svg viewBox="0 0 24 24" width="24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
    </button>

    <!-- Overlay transparente -->
    <div v-if="activeStep !== null" class="tutorial-overlay" @click="closeTutorial">
      <!-- Recuadro iluminado (Spotlight): Su sombra oscurece el exterior y deja el centro transparente -->
      <div
        v-if="targetRect"
        class="spotlight-box"
        :style="{
          width: targetRect.width + 'px',
          height: targetRect.height + 'px',
          transform: `translate3d(${targetRect.left}px, ${targetRect.top}px, 0)`
        }"
      ></div>

      <!-- Tarjeta de explicación: en escritorio flota junto al elemento, en móvil es una hoja inferior fija -->
      <div
        v-if="steps[activeStep] && (!isMobile || textRevealed)"
        ref="sheetRef"
        class="help-popover"
        :class="{ 'mobile-sheet': isMobile }"
        :style="isMobile ? {} : popoverStyle"
        @click.stop
      >
        <div class="popover-header">
          <h3>{{ steps[activeStep].title }}</h3>
          <button class="close-btn" @click="closeTutorial">×</button>
        </div>
        <p>{{ steps[activeStep].description }}</p>
        <div class="modal-footer">
          <span class="step-badge">{{ activeStep + 1 }} {{ t('of') }} {{ steps.length }}</span>
          <div class="buttons-group">
            <button v-if="isMobile && !textRevealed" class="nav-btn secondary" @click="revealTextNow">
              {{ t('showText') }}
            </button>
            <button v-if="activeStep > 0" class="nav-btn secondary" @click="prevStep">{{ t('prev') }}</button>
            <button class="nav-btn primary" @click="nextStep">
              {{ activeStep < steps.length - 1 ? t('next') : t('finish') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeStep = ref(null);
const tutorialEnabled = ref(localStorage.getItem('tutorialActivo') === 'true');
const targetRect = ref(null);
const windowWidth = ref(window.innerWidth);

// Idioma actual de la interfaz, sincronizado con localStorage
const currentLang = ref(localStorage.getItem('GYM_ADMIN-idioma') || 'es');

// Control de revelación de texto en móvil tras 1.5 segundos
const textRevealed = ref(false);
let revealTimer = null;

// Seguimiento continuo (requestAnimationFrame) de la posición del elemento resaltado
let rafId = null;
let lastFrameTime = 0;
// Posición animada del recuadro en coordenadas de página (no de pantalla): así
// el recuadro se mantiene pegado al elemento mientras la página se desplaza y
// sólo se interpola de forma suave al pasar de un elemento a otro.
let spotlightPageRect = null;
let resizeTimer = null;
let previousBodyOverflow = '';

const rootRef = ref(null);
const sheetRef = ref(null);
// Altura real de la hoja inferior en móvil, medida cada vez que aparece el texto
let lastSheetHeight = 0;

const SPOTLIGHT_PADDING = 8;
const SCROLL_GAP = 12;
const SPOTLIGHT_SMOOTHING_MS = 70;
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const isMobile = computed(() => windowWidth.value <= 768);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (activeStep.value === null) return;
  // En móvil el resize se dispara constantemente (barra de direcciones, teclado,
  // rotación). El seguimiento por frame ya corrige el recuadro; aquí sólo se
  // vuelve a desplazar la página si el elemento quedó fuera de la zona visible.
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(ensureTargetVisible, 200);
};

// Traducciones de los textos fijos de la interfaz del tutorial (botones, contador)
const tutorialUiTranslations = {
  es: {
    of: 'de',
    showText: 'Mostrar texto',
    prev: 'Anterior',
    next: 'Siguiente →',
    finish: 'Finalizar'
  },
  en: {
    of: 'of',
    showText: 'Show text',
    prev: 'Previous',
    next: 'Next →',
    finish: 'Finish'
  }
};

const t = (key) => {
  const table = tutorialUiTranslations[currentLang.value] || tutorialUiTranslations.es;
  return table[key] || tutorialUiTranslations.es[key] || key;
};

// Diccionario de tutoriales bilingües
const tutoriales = {
  'GYM_ADMIN-dashboard': {
    es: [
      { title: "Encabezado y Estatus", description: "Este es el nombre del gimnasio registrado y la sucursal. Cuenta con botones para definir si está abierto o cerrado, y muestra tu estatus de pago al corriente.", selector: '#tutorial-step-0' },
      { title: "Métricas de Actividad", description: "Visualiza rápidamente las entradas del día, las personas que se encuentran actualmente en las instalaciones y las membresías por vencer.", selector: '#tutorial-step-1' },
      { title: "Control de Acceso", description: "Gestiona el ingreso mediante asistencia facial con reconocimiento biométrico por IA o utilizando el escáner de códigos QR para validar pases digitales.", selector: '#tutorial-step-2' },
      { title: "Administración y Turnos", description: "Configura turnos, clases y consulta el calendario activo que opera de lunes a domingo.", selector: '#tutorial-step-3' }
    ],
    en: [
      { title: "Header and Status", description: "This is the name of the registered gym and branch. It has buttons to set whether it's open or closed, and shows your current payment status.", selector: '#tutorial-step-0' },
      { title: "Activity Metrics", description: "Quickly view today's check-ins, the people currently inside the facility, and memberships about to expire.", selector: '#tutorial-step-1' },
      { title: "Access Control", description: "Manage entry using AI-powered facial recognition attendance or the QR code scanner to validate digital passes.", selector: '#tutorial-step-2' },
      { title: "Management and Shifts", description: "Set up shifts and classes, and check the active calendar that runs Monday through Sunday.", selector: '#tutorial-step-3' }
    ]
  },
  'GYM_ADMIN-register-clients': {
    es: [
      { title: "Fotografía del Cliente", description: "Sube o captura una fotografía reciente del cliente. Esto es fundamental para identificarlo rápidamente en el sistema al momento de registrar su asistencia.", selector: '#tutorial-step-0' },
      { title: "Datos Personales", description: "Ingresa la información básica de identificación del nuevo miembro, incluyendo su nombre completo, fecha de nacimiento, número celular y correo electrónico.", selector: '#tutorial-step-1' },
      { title: "Registro Físico", description: "Captura las medidas corporales iniciales del cliente como su peso en kilogramos y su altura para llevar un seguimiento de su progreso.", selector: '#tutorial-step-2' },
      { title: "Datos de Membresía y Vigencia", description: "Selecciona el esquema de cobro (por mes o semana), define las fechas de inscripción y el día de corte correspondiente para mantener sus accesos activos.", selector: '#tutorial-step-3' }
    ],
    en: [
      { title: "Client Photo", description: "Upload or capture a recent photo of the client. This is essential to quickly identify them in the system when registering attendance.", selector: '#tutorial-step-0' },
      { title: "Personal Data", description: "Enter the new member's basic identification information, including full name, date of birth, mobile number, and email address.", selector: '#tutorial-step-1' },
      { title: "Physical Record", description: "Record the client's initial body measurements, such as weight in kilograms and height, to track their progress.", selector: '#tutorial-step-2' },
      { title: "Membership and Validity Data", description: "Select the billing scheme (monthly or weekly), and set the enrollment dates and the corresponding cutoff day to keep their access active.", selector: '#tutorial-step-3' }
    ]
  },
  'GYM_ADMIN-register-staff': {
    es: [
      { title: "Fotografía del Empleado", description: "Sube una fotografía oficial o reciente para integrarla al expediente del colaborador dentro de la plataforma.", selector: '#tutorial-step-0' },
      { title: "Credenciales y Rol", description: "Define el rol que desempeñará en el sistema (permisos de acceso), asigna el correo electrónico, establece su contraseña y selecciona las sedes o ubicaciones autorizadas.", selector: '#tutorial-step-1' },
      { title: "Datos del Empleado", description: "Captura la información oficial y de contacto del colaborador, incluyendo su CURP, nombre completo, fecha de nacimiento, teléfono y perfiles de redes sociales.", selector: '#tutorial-step-2' },
      { title: "Horario de Trabajo", description: "Establece las horas de entrada y salida correspondientes para llevar el control de asistencia y turnos del personal.", selector: '#tutorial-step-3' }
    ],
    en: [
      { title: "Employee Photo", description: "Upload an official or recent photo to add to the staff member's file within the platform.", selector: '#tutorial-step-0' },
      { title: "Credentials and Role", description: "Define the role they will have in the system (access permissions), assign their email address, set their password, and select the authorized branches or locations.", selector: '#tutorial-step-1' },
      { title: "Employee Data", description: "Record the staff member's official and contact information, including their CURP (ID number), full name, date of birth, phone, and social media profiles.", selector: '#tutorial-step-2' },
      { title: "Work Schedule", description: "Set the corresponding clock-in and clock-out times to track staff attendance and shifts.", selector: '#tutorial-step-3' }
    ]
  },
  'GYM_ADMIN-view-clients': {
    es: [
      { title: "Filtros y Búsqueda General", description: "Filtra la lista de usuarios por tipo de membresía, su estatus actual (Activo/Inactivo), envía notificaciones masivas o busca a un cliente por su nombre de forma rápida.", selector: '#tutorial-step-0' },
      { title: "Listado de Clientes", description: "Visualiza la información resumida de cada usuario: foto de perfil, nombre completo, correo electrónico, número de celular y su estatus vigente.", selector: '#tutorial-step-1' },
      { title: "Acciones por Usuario", description: "Realiza acciones específicas para cada cliente: enviar correos individuales, cambiar estatus, ver su código QR de acceso, editar sus datos o eliminar el registro.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Filters and General Search", description: "Filter the user list by membership type or current status (Active/Inactive), send bulk notifications, or quickly search for a client by name.", selector: '#tutorial-step-0' },
      { title: "Client List", description: "View a summary of each user's information: profile photo, full name, email address, mobile number, and current status.", selector: '#tutorial-step-1' },
      { title: "Actions per User", description: "Perform specific actions for each client: send individual emails, change status, view their access QR code, edit their data, or delete the record.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-view-staff': {
    es: [
      { title: "Filtros y Búsqueda de Personal", description: "Filtra al personal por su rol en el sistema (Recepcionista, Entrenador), envía correos masivos o busca rápidamente a un empleado por su nombre.", selector: '#tutorial-step-0' },
      { title: "Listado de Personal", description: "Visualiza la información clave de cada empleado: foto de perfil, nombre completo, correo electrónico, número celular y el rol asignado.", selector: '#tutorial-step-1' },
      { title: "Acciones por Empleado", description: "Gestiona las acciones individuales para cada miembro del personal: enviar correo, cambiar estatus, editar su información o eliminar el registro.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Staff Filters and Search", description: "Filter staff by their role in the system (Receptionist, Trainer), send bulk emails, or quickly search for an employee by name.", selector: '#tutorial-step-0' },
      { title: "Staff List", description: "View key information for each employee: profile photo, full name, email address, mobile number, and assigned role.", selector: '#tutorial-step-1' },
      { title: "Actions per Employee", description: "Manage individual actions for each staff member: send an email, change status, edit their information, or delete the record.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-payments': {
    es: [
      { title: "Filtros y Búsqueda de Pagos", description: "Filtra el listado por tipo de mensualidad, su estatus actual (Activo, Pendiente, Inactivo), envía correos masivos o busca usuarios por su nombre de forma rápida.", selector: '#tutorial-step-0' },
      { title: "Listado de Pagos", description: "Visualiza la información general de cada registro: foto de perfil, nombre completo, correo electrónico, fecha a vencer y el estatus actual de su pago.", selector: '#tutorial-step-1' },
      { title: "Acciones de Pago", description: "Realiza acciones específicas para cada registro: registrar un pago, editar los datos del usuario o eliminar el registro.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Payment Filters and Search", description: "Filter the list by membership type or current status (Active, Pending, Inactive), send bulk emails, or quickly search for users by name.", selector: '#tutorial-step-0' },
      { title: "Payment List", description: "View general information for each record: profile photo, full name, email address, due date, and current payment status.", selector: '#tutorial-step-1' },
      { title: "Payment Actions", description: "Perform specific actions for each record: register a payment, edit the user's data, or delete the record.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-pricing-management': {
  es: [
    {
      title: "Promociones y tarifas",
      description: "Administra desde un solo lugar las promociones y los precios principales del gimnasio. En la parte superior puedes consultar rápidamente las promociones activas, la mensualidad, el costo semanal y el promedio de tus promociones.",
      selector: '#tutorial-step-0'
    },
    {
      title: "Gestión de promociones",
      description: "Consulta las promociones disponibles para tus clientes. Desde esta sección puedes crear nuevas promociones, revisar su duración y precio, además de editar o eliminar las promociones existentes.",
      selector: '#tutorial-step-1'
    },
    {
      title: "Tarifas del sistema",
      description: "Consulta y modifica los precios base utilizados por el gimnasio, como la mensualidad, el costo semanal y otros servicios configurados. Utiliza el botón de edición para actualizar el importe de cada tarifa.",
      selector: '#tutorial-step-2'
    }
  ],

  en: [
    {
      title: "Promotions and pricing",
      description: "Manage the gym's promotions and main pricing from one place. At the top, you can quickly review active promotions, the monthly fee, weekly cost, and the average value of your promotions.",
      selector: '#tutorial-step-0'
    },
    {
      title: "Promotion management",
      description: "Review the promotions available to your customers. From this section, you can create new promotions, check their duration and price, and edit or delete existing promotions.",
      selector: '#tutorial-step-1'
    },
    {
      title: "System pricing",
      description: "Review and update the gym's base prices, such as the monthly fee, weekly cost, and other configured services. Use the edit button to update the amount of each rate.",
      selector: '#tutorial-step-2'
    }
  ]
},
  'GYM_ADMIN-fees-management': {
  es: [
    {
      title: "Reglas de morosidad",
      description: "Configura cómo debe actuar el sistema cuando un socio tiene un pago vencido. Aquí puedes definir el período de gracia, los estados afectados, el bloqueo de acceso y los servicios a los que se aplicarán estas reglas.",
      selector: '#tutorial-step-0'
    },
    {
      title: "Costo y frecuencia del recargo",
      description: "Define el monto que se cobrará por atraso, la frecuencia con la que se aplicará el recargo y el límite máximo que podrá acumularse en la cuenta del socio.",
      selector: '#tutorial-step-1'
    },
    {
      title: "Simulador de multas",
      description: "Permite visualizar una proyección de los recargos según el monto adeudado y los días de atraso. Por el momento, el simulador se encuentra deshabilitado y estará disponible próximamente.",
      selector: '#tutorial-step-2'
    }
  ],

  en: [
    {
      title: "Late-payment rules",
      description: "Configure how the system should respond when a member has an overdue payment. Here you can define the grace period, affected statuses, access restrictions, and the services to which these rules apply.",
      selector: '#tutorial-step-0'
    },
    {
      title: "Late fee amount and frequency",
      description: "Set the amount charged for late payment, how often the fee will be applied, and the maximum amount that may accumulate on the member's account.",
      selector: '#tutorial-step-1'
    },
    {
      title: "Late fee simulator",
      description: "Preview projected late fees based on the outstanding balance and the number of overdue days. The simulator is currently disabled and will be available soon.",
      selector: '#tutorial-step-2'
    }
  ]
},
  'GYM_ADMIN-revenue-log': {
    es: [
      { title: "Filtros y Resumen de Ingresos", description: "Filtra los pagos por tipo de membresía, consulta el total recaudado en tiempo real o busca a un usuario específico mediante la barra de búsqueda.", selector: '#tutorial-step-0' },
      { title: "Tabla de Ingresos", description: "Visualiza el detalle completo de cada transacción: foto del usuario, nombre completo, correo electrónico, fecha de vencimiento, tipo de membresía adquirida y el monto pagado.", selector: '#tutorial-step-1' }
    ],
    en: [
      { title: "Filters and Revenue Summary", description: "Filter payments by membership type, check the real-time total collected, or search for a specific user using the search bar.", selector: '#tutorial-step-0' },
      { title: "Revenue Table", description: "View the full detail of each transaction: user photo, full name, email address, due date, membership type purchased, and amount paid.", selector: '#tutorial-step-1' }
    ]
  },
  'GYM_ADMIN-debtors-list': {
    es: [
      { title: "Filtros y Búsqueda", description: "Filtra los deudores por tipo de membresía o estatus, realiza búsquedas específicas y envía correos masivos de cobranza.", selector: '#tutorial-step-0' },
      { title: "Listado de Deudores", description: "Visualiza la información clave de cada usuario con adeudo: nombre, correo, fecha de vencimiento y el monto pendiente.", selector: '#tutorial-step-1' },
      { title: "Acciones Rápidas", description: "Comunícate de inmediato con el deudor enviándole un correo electrónico o un mensaje directo por WhatsApp.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Filters and Search", description: "Filter debtors by membership type or status, run specific searches, and send bulk collection emails.", selector: '#tutorial-step-0' },
      { title: "Debtors List", description: "View key information for each user with an outstanding balance: name, email, due date, and amount owed.", selector: '#tutorial-step-1' },
      { title: "Quick Actions", description: "Instantly reach out to the debtor by sending them an email or a direct WhatsApp message.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-attendance-log': {
    es: [
      { title: "Filtros y Reportes de Asistencia", description: "Filtra la asistencia por día de la semana, consulta la gráfica de reportes o busca a un usuario específico mediante la barra de búsqueda.", selector: '#tutorial-step-0' },
      { title: "Listado de Asistencia", description: "Visualiza la información clave de cada usuario: foto, nombre completo, correo electrónico, tipo de membresía, fecha a vencer y su estatus actual.", selector: '#tutorial-step-1' }
    ],
    en: [
      { title: "Attendance Filters and Reports", description: "Filter attendance by day of the week, view the report chart, or search for a specific user using the search bar.", selector: '#tutorial-step-0' },
      { title: "Attendance List", description: "View key information for each user: photo, full name, email address, membership type, due date, and current status.", selector: '#tutorial-step-1' }
    ]
  },
  'GYM_ADMIN-renewals': {
    es: [
      { title: "Búsqueda de Usuarios", description: "Busca de forma específica a los usuarios que necesitan renovación mediante la barra de búsqueda.", selector: '#tutorial-step-0' },
      { title: "Listado de Renovaciones", description: "Visualiza la información clave de cada usuario con membresía vencida o próxima a vencer: foto, nombre completo, correo, fecha de vencimiento y su adeudo.", selector: '#tutorial-step-1' },
      { title: "Acciones Rápidas", description: "Gestiona las cuentas realizando la renovación inmediata de la membresía o eliminando el registro del usuario según sea necesario.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "User Search", description: "Specifically search for users who need to renew using the search bar.", selector: '#tutorial-step-0' },
      { title: "Renewals List", description: "View key information for each user with an expired or soon-to-expire membership: photo, full name, email, due date, and balance owed.", selector: '#tutorial-step-1' },
      { title: "Quick Actions", description: "Manage accounts by immediately renewing the membership or deleting the user's record as needed.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-audit-log': {
    es: [
      { title: "Filtros y Búsqueda", description: "Filtra la bitácora por sucursal, tipo de acción o fecha, y busca por empleado o módulo. Usa el botón «Limpiar» para quitar todos los filtros de una vez.", selector: '#tutorial-step-0' },
      { title: "Registro de Actividad", description: "Consulta quién realizó cada acción, en qué sucursal y módulo, y la descripción del cambio. Los cuadros superiores resumen los eventos, modificaciones, eliminaciones y usuarios involucrados.", selector: '#tutorial-step-1' },
      { title: "Detalle de la Acción", description: "Abre el detalle completo del evento, incluyendo el valor anterior y el valor nuevo del cambio realizado.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Filters and Search", description: "Filter the log by branch, action type or date, and search by employee or module. Use the “Clear” button to remove all filters at once.", selector: '#tutorial-step-0' },
      { title: "Activity Log", description: "See who performed each action, in which branch and module, and a description of the change. The cards above summarize events, modifications, deletions and users involved.", selector: '#tutorial-step-1' },
      { title: "Action Details", description: "Open the full detail of the event, including the previous value and the new value of the change.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-cash-history': {
    es: [
      { title: "Filtros y Búsqueda de Cortes", description: "Filtra los cortes de caja por sucursal, estado (abierto o cerrado) o fecha, y busca por responsable o folio. Usa «Limpiar» para quitar los filtros.", selector: '#tutorial-step-0' },
      { title: "Historial de Cortes", description: "Visualiza el folio, la fecha, la sucursal, el responsable, el estado, la diferencia y el total recaudado de cada corte. Los cuadros superiores muestran el total recaudado, el efectivo recibido y la diferencia neta.", selector: '#tutorial-step-1' },
      { title: "Ver Corte", description: "Consulta el detalle del corte: apertura y cierre, fondo inicial, efectivo, tarjeta, transferencia, efectivo esperado y contado, y la diferencia.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Cash Session Filters and Search", description: "Filter cash sessions by branch, status (open or closed) or date, and search by employee or reference. Use “Clear” to remove the filters.", selector: '#tutorial-step-0' },
      { title: "Cash Session History", description: "View the reference, date, branch, employee, status, difference and total collected for each session. The cards above show the total collected, cash received and net difference.", selector: '#tutorial-step-1' },
      { title: "View Session", description: "Check the session details: opening and closing, opening float, cash, card, transfer, expected and counted cash, and the difference.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-membership-history': {
    es: [
      { title: "Filtros y Búsqueda", description: "Filtra los movimientos por sucursal, tipo (inscripción, renovación, cambio o cancelación) o fecha, y busca por cliente o paquete. Usa «Limpiar» para quitar los filtros.", selector: '#tutorial-step-0' },
      { title: "Historial de Membresías", description: "Visualiza la fecha, el cliente, la sucursal, el tipo de movimiento, el paquete, la vigencia y el importe de cada registro. Los cuadros superiores resumen movimientos, renovaciones, cambios de paquete y cancelaciones.", selector: '#tutorial-step-1' },
      { title: "Detalle del Movimiento", description: "Abre el detalle completo: paquete anterior y contratado, fechas de inicio y vencimiento, precio aplicado, responsable y observaciones.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Filters and Search", description: "Filter movements by branch, type (registration, renewal, plan change or cancellation) or date, and search by client or plan. Use “Clear” to remove the filters.", selector: '#tutorial-step-0' },
      { title: "Membership History", description: "View the date, client, branch, movement type, plan, validity and amount of each record. The cards above summarize transactions, renewals, plan changes and cancellations.", selector: '#tutorial-step-1' },
      { title: "Movement Details", description: "Open the full detail: previous and new plan, start and expiration dates, applied price, employee and notes.", selector: '#tutorial-step-2' }
    ]
  },
  'GYM_ADMIN-settings': {
    es: [
      { title: "Guardar Cambios", description: "Aplica y almacena de forma permanente todas las modificaciones realizadas en la configuración del sitio.", selector: '#btn-guardar-cambios' },
      { title: "Temas y Combinaciones", description: "Selecciona rápidamente entre 24 estilos y combinaciones predefinidas para cambiar la apariencia visual de todo el sistema.", selector: '#panel-temas' },
      { title: "Notificaciones", description: "Activa o desactiva la recepción y envío automático de alertas y preferencias de notificación.", selector: '#row-notificaciones' },
      { title: "Tutorial", description: "Habilita o deshabilita la guía interactiva para aprender a utilizar todas las funcionalidades de la plataforma.", selector: '#row-tutorial' },
      { title: "Idioma de la Interfaz", description: "Selecciona el idioma principal en el que se mostrarán los textos y menús del sistema.", selector: '#row-idioma' },
      { title: "Paleta de Colores Detallada", description: "Personaliza de forma independiente el color de cada componente de la interfaz, tablas, botones y encabezados.", selector: '#row-paleta-colores' },
      { title: "Densidad de la Interfaz", description: "Elige el espaciado general entre los elementos para una vista espaciosa, normal o más compacta.", selector: '#row-densidad' },
      { title: "Estilo de Bordes", description: "Define el nivel de curvatura y redondeo visual para los paneles, botones y contenedores de la aplicación.", selector: '#row-border-radius' },
      { title: "Exportación de Datos", description: "Descarga respaldos y bitácoras completas del sistema en formatos compatibles como Excel o YML.", selector: '#panel-exportacion' }
    ],
    en: [
      { title: "Save Changes", description: "Apply and permanently store all modifications made to the site configuration.", selector: '#btn-guardar-cambios' },
      { title: "Themes and Combinations", description: "Quickly select from 24 predefined styles and combinations to change the visual appearance of the entire system.", selector: '#panel-temas' },
      { title: "Notifications", description: "Enable or disable the automatic reception and sending of alerts and notification preferences.", selector: '#row-notificaciones' },
      { title: "Tutorial", description: "Enable or disable the interactive guide to learn how to use all the platform's features.", selector: '#row-tutorial' },
      { title: "Interface Language", description: "Select the main language in which system texts and menus will be displayed.", selector: '#row-idioma' },
      { title: "Detailed Color Palette", description: "Independently customize the color of each interface component, tables, buttons, and headers.", selector: '#row-paleta-colores' },
      { title: "Interface Density", description: "Choose the general spacing between elements for a spacious, normal, or more compact view.", selector: '#row-densidad' },
      { title: "Border Style", description: "Define the level of curvature and visual rounding for application panels, buttons, and containers.", selector: '#row-border-radius' },
      { title: "Data Export", description: "Download complete system backups and logs in compatible formats such as Excel or YML.", selector: '#panel-exportacion' }
    ]
  },
  'GYM_ADMIN-profile': {
    es: [
      { title: "Logotipo del Gimnasio", description: "Sube o cambia la imagen del logotipo oficial del establecimiento que se muestra en el perfil y encabezados.", selector: '#tutor-5' },
      { title: "Información del Establecimiento", description: "Modifica el nombre oficial del gimnasio y consulta información de registro intransferible como el CURP.", selector: '#tutor-13' },
      { title: "Membresía del Sitio", description: "Consulta el plan activo actual, actualiza tu suscripción o realiza la cancelación del servicio si lo requieres.", selector: '#tutor-20' },
      { title: "Acciones Pro", description: "Agrega nuevas sedes de operación o interactúa con el asistente de inteligencia artificial exclusivo para cuentas Pro.", selector: '#tutor-23' },
      { title: "Datos del Administrador", description: "Actualiza la información personal, datos de contacto, correo electrónico y credenciales de acceso del administrador.", selector: '#tutor-27' },
      { title: "Ubicación del Gimnasio", description: "Configura la dirección física completa del establecimiento incluyendo entidad, municipio, colonia y código postal.", selector: '#tutor-40' },
      { title: "Configuración de Operación", description: "Define los días de apertura de la semana y establece las tarifas predeterminadas para mensualidades y semanas.", selector: '#tutor-50' },
      { title: "Guardar Cambios", description: "Aplica y almacena de forma definitiva todas las modificaciones realizadas en el perfil del gimnasio y del administrador.", selector: '#tutor-64' }
    ],
    en: [
      { title: "Gym Logo", description: "Upload or change the official logo image for the establishment shown in the profile and headers.", selector: '#tutor-5' },
      { title: "Establishment Information", description: "Modify the gym's official name and view non-transferable registration information such as the CURP.", selector: '#tutor-13' },
      { title: "Site Membership", description: "View your current active plan, update your subscription, or cancel the service if needed.", selector: '#tutor-20' },
      { title: "Pro Actions", description: "Add new operating locations or interact with the AI assistant exclusive to Pro accounts.", selector: '#tutor-23' },
      { title: "Administrator Data", description: "Update the administrator's personal information, contact details, email address, and access credentials.", selector: '#tutor-27' },
      { title: "Gym Location", description: "Set up the establishment's complete physical address, including state, municipality, neighborhood, and postal code.", selector: '#tutor-40' },
      { title: "Operation Settings", description: "Set the days of the week the gym is open and establish default rates for monthly and weekly memberships.", selector: '#tutor-50' },
      { title: "Save Changes", description: "Permanently apply and store all modifications made to the gym's and administrator's profile.", selector: '#tutor-64' }
    ]
  },
  'GYM_ADMIN-pay': {
    es: [
      { title: "Búsqueda de Cliente", description: "Busca rápidamente al cliente por su nombre o ID de usuario para gestionar su estado de cuenta y pagos.", selector: '#tutorial-step-0' },
      { title: "Detalles del Pago y Fechas", description: "Consulta y modifica los cortes de fechas, revisa el estado de cuenta actual, calcula recargos e ingresa los datos del tipo de pago y folio.", selector: '#tutorial-step-1' },
      { title: "Acciones de Confirmación", description: "Confirma el registro del pago una vez completados los datos obligatorios o descarga el recibo correspondiente.", selector: '#tutorial-step-2' }
    ],
    en: [
      { title: "Client Search", description: "Quickly search for a client by name or user ID to manage their account status and payments.", selector: '#tutorial-step-0' },
      { title: "Payment and Date Details", description: "View and modify cutoff dates, check the current account status, calculate surcharges, and enter the payment type and reference number.", selector: '#tutorial-step-1' },
      { title: "Confirmation Actions", description: "Confirm the payment record once the required fields are complete, or download the corresponding receipt.", selector: '#tutorial-step-2' }
    ]
  },
'GYM_ADMIN-edit-user': {
  es: [
    {
      title: "Buscar cliente",
      description: "Busca rápidamente a un cliente registrado utilizando su nombre o número de identificación. Al seleccionar un resultado, se cargarán sus datos para consultar o actualizar su información.",
      selector: '#tutor-0'
    },
    {
      title: "Perfil del cliente",
      description: "Consulta un resumen del cliente seleccionado, incluyendo su fotografía, nombre, identificador, sede asignada y estado actual dentro del gimnasio.",
      selector: '#tutor-1'
    },
    {
      title: "Fotografía del cliente",
      description: "Aquí se muestra la fotografía registrada del cliente, utilizada para identificarlo visualmente dentro del sistema.",
      selector: '#tutor-2'
    },
    {
      title: "Estadísticas del cliente",
      description: "Accede al historial y las estadísticas del cliente para consultar información relacionada con su asistencia, progreso y seguimiento dentro del gimnasio.",
      selector: '#tutor-3'
    },
    {
      title: "Actualizar fotografía",
      description: "Utiliza esta opción para cambiar la fotografía del cliente. Puedes seleccionar una imagen desde la galería o tomar una nueva fotografía con la cámara del dispositivo.",
      selector: '#tutor-4'
    },
    {
      title: "Información del cliente",
      description: "Consulta la información principal del cliente, como su identificador de registro, sede asignada y estado actual dentro del sistema.",
      selector: '#tutor-5'
    },
    {
      title: "Datos personales",
      description: "Consulta y actualiza los datos personales y de contacto del cliente, incluyendo nombres, apellidos, fecha de nacimiento, número celular y correo electrónico.",
      selector: '#tutor-6'
    },
    {
      title: "Seguimiento físico",
      description: "Consulta y actualiza las medidas físicas registradas del cliente, como su peso y altura, utilizadas como referencia para dar seguimiento a su progreso.",
      selector: '#tutor-7'
    },
    {
      title: "Membresía",
      description: "Consulta y administra la información relacionada con la membresía del cliente, incluyendo la sede asignada y su estado actual.",
      selector: '#tutor-8'
    },
    {
      title: "Guardar cambios",
      description: "Cuando termines de actualizar la información del cliente, utiliza este botón para guardar definitivamente los cambios realizados en su perfil.",
      selector: '#tutor-9'
    }
  ],

  en: [
    {
      title: "Search client",
      description: "Quickly search for a registered client using their name or identification number. After selecting a result, their information will be loaded for review or editing.",
      selector: '#tutor-0'
    },
    {
      title: "Client profile",
      description: "View a summary of the selected client, including their photo, name, identifier, assigned location, and current status within the gym.",
      selector: '#tutor-1'
    },
    {
      title: "Client photo",
      description: "This section displays the client's registered photo, which is used to visually identify them throughout the system.",
      selector: '#tutor-2'
    },
    {
      title: "Client statistics",
      description: "Access the client's history and statistics to review information related to attendance, progress, and activity tracking within the gym.",
      selector: '#tutor-3'
    },
    {
      title: "Update photo",
      description: "Use this option to update the client's photo. You can select an image from the gallery or take a new photo using the device camera.",
      selector: '#tutor-4'
    },
    {
      title: "Client information",
      description: "View the client's main information, including their registration identifier, assigned location, and current status in the system.",
      selector: '#tutor-5'
    },
    {
      title: "Personal information",
      description: "Review and update the client's personal and contact information, including first name, last names, date of birth, mobile number, and email address.",
      selector: '#tutor-6'
    },
    {
      title: "Physical tracking",
      description: "Review and update the client's recorded physical measurements, such as weight and height, which are used as a reference for tracking progress.",
      selector: '#tutor-7'
    },
    {
      title: "Membership",
      description: "Review and manage the client's membership information, including their assigned location and current membership status.",
      selector: '#tutor-8'
    },
    {
      title: "Save changes",
      description: "After updating the client's information, use this button to permanently save the changes made to their profile.",
      selector: '#tutor-9'
    }
  ]
},
  'GYM_ADMIN-edit-staff': {
  es: [
    {
      title: "Buscar personal",
      description: "Desde aquí puedes localizar a cualquier empleado registrado en el sistema utilizando su nombre, correo electrónico o número de identificación. Al seleccionar un empleado, se cargarán automáticamente sus datos para editarlos.",
      selector: '#tutor-0'
    },
    {
      title: "Perfil del empleado",
      description: "Este panel muestra un resumen del empleado seleccionado, incluyendo su fotografía, nombre, estado actual, identificador, rol asignado, sedes autorizadas y horario de trabajo cuando corresponda.",
      selector: '#tutor-1'
    },
    {
      title: "Fotografía del empleado",
      description: "Aquí se muestra la fotografía registrada del empleado. Esta imagen permite identificar visualmente al miembro del personal dentro del sistema.",
      selector: '#tutor-2'
    },
    {
      title: "Actualizar fotografía",
      description: "Utiliza este botón para cambiar la fotografía del empleado. Puedes seleccionar una imagen desde la galería o tomar una nueva fotografía utilizando la cámara del dispositivo.",
      selector: '#tutor-3'
    },
    {
      title: "Identificador del empleado",
      description: "Este es el identificador único asignado al empleado dentro del sistema. Permite distinguir su registro y localizarlo de forma precisa.",
      selector: '#tutor-4'
    },
    {
      title: "Estado del empleado",
      description: "Indica el estado actual del empleado dentro del sistema. Un empleado activo puede continuar utilizando las funciones y permisos correspondientes a su rol.",
      selector: '#tutor-5'
    },
    {
      title: "Datos personales",
      description: "En esta sección se encuentran los datos personales del empleado registrado en el sistema. Puedes consultar y actualizar su CURP, nombres, apellidos, fecha de nacimiento y número de celular.",
      selector: '#tutor-6'
    },
    {
      title: "Redes sociales y contacto profesional",
      description: "Esta sección aparece para los entrenadores y permite registrar o actualizar sus perfiles profesionales, como Facebook, Instagram, TikTok, LinkedIn, sitio web u otras redes.",
      selector: '#tutor-7'
    },
    {
      title: "Credenciales, rol y permisos",
      description: "Aquí se administran las credenciales y permisos del empleado. Puedes consultar su rol, modificar su correo electrónico, actualizar su contraseña cuando corresponda y definir las sedes a las que tiene acceso.",
      selector: '#tutor-8'
    },
    {
      title: "Horario de trabajo",
      description: "En esta sección se administra la jornada laboral del empleado. Puedes establecer su hora de entrada y salida. Para recepción el horario es obligatorio y para entrenadores puede configurarse de manera opcional.",
      selector: '#tutor-9'
    },
    {
      title: "Guardar cambios",
      description: "Cuando termines de editar la información del empleado, utiliza este botón para guardar definitivamente los cambios realizados en su perfil.",
      selector: '#tutor-10'
    }
  ],

  en: [
    {
      title: "Search staff",
      description: "Use this section to locate any employee registered in the system by name, email address, or identification number. Selecting an employee automatically loads their information for editing.",
      selector: '#tutor-0'
    },
    {
      title: "Employee profile",
      description: "This panel provides a summary of the selected employee, including their photo, name, current status, identifier, assigned role, authorized locations, and work schedule when applicable.",
      selector: '#tutor-1'
    },
    {
      title: "Employee photo",
      description: "This is the employee's registered profile photo. It helps visually identify the staff member throughout the system.",
      selector: '#tutor-2'
    },
    {
      title: "Update photo",
      description: "Use this button to update the employee's profile photo. You can choose an image from the gallery or take a new photo using the device camera.",
      selector: '#tutor-3'
    },
    {
      title: "Employee identifier",
      description: "This is the unique identifier assigned to the employee in the system. It allows the employee record to be accurately identified and located.",
      selector: '#tutor-4'
    },
    {
      title: "Employee status",
      description: "Shows the employee's current status in the system. An active employee can continue using the features and permissions assigned to their role.",
      selector: '#tutor-5'
    },
    {
      title: "Personal information",
      description: "This section contains the personal information of the employee registered in the system. You can review and update their ID information, first and last names, date of birth, and phone number.",
      selector: '#tutor-6'
    },
    {
      title: "Social media and professional contact",
      description: "This section is available for trainers and allows you to register or update professional profiles such as Facebook, Instagram, TikTok, LinkedIn, websites, or other social networks.",
      selector: '#tutor-7'
    },
    {
      title: "Credentials, role and permissions",
      description: "Manage the employee's credentials and permissions here. You can review their role, update their email address and password when applicable, and define which locations they are authorized to access.",
      selector: '#tutor-8'
    },
    {
      title: "Work schedule",
      description: "This section manages the employee's workday. You can set their check-in and check-out times. A schedule is required for reception staff and optional for trainers.",
      selector: '#tutor-9'
    },
    {
      title: "Save changes",
      description: "After editing the employee information, use this button to permanently save all changes made to their profile.",
      selector: '#tutor-10'
    }
  ]
},
  'GYM_ADMIN-statistics': {
    es: [
      { title: "Búsqueda de Usuario", description: "Localiza rápidamente a cualquier usuario registrado mediante su nombre o número de identificación.", selector: '#tutor-0' },
      { title: "Perfil del Usuario", description: "Visualiza la tarjeta general de información, estado y métricas principales del usuario.", selector: '#tutor-1' },
      { title: "Avatar del Usuario", description: "Muestra el identificador visual o icono del usuario en el sistema.", selector: '#tutor-2' },
      { title: "Porcentaje de Asistencia", description: "Indica el nivel general de asistencia acumulada del usuario.", selector: '#tutor-3' },
      { title: "Nombre del Usuario", description: "Muestra el nombre completo registrado del usuario.", selector: '#tutor-4' },
      { title: "Identificador Único", description: "Muestra el código de registro del usuario en el sistema.", selector: '#tutor-5' },
      { title: "Composición Corporal Principal", description: "Contiene las métricas clave como peso inicial, actual, estatura, porcentaje de grasa, masa muscular y calorías.", selector: '#tutor-6' },
      { title: "Peso Inicial", description: "Muestra el peso registrado al inicio del seguimiento.", selector: '#tutor-7' },
      { title: "Peso Actual", description: "Muestra el peso más reciente del usuario.", selector: '#tutor-8' },
      { title: "Estatura", description: "Indica la altura registrada del usuario.", selector: '#tutor-9' },
      { title: "Porcentaje de Grasa", description: "Muestra el nivel de grasa corporal estimado.", selector: '#tutor-10' },
      { title: "Masa Muscular", description: "Muestra el valor de la masa muscular en kilogramos.", selector: '#tutor-11' },
      { title: "Calorías Promedio", description: "Muestra el estimado de calorías quemadas o consumidas por día.", selector: '#tutor-12' },
      { title: "Indicadores Avanzados", description: "Muestra métricas detalladas de agua corporal, índice IMC y aumento de fuerza.", selector: '#tutor-13' },
      { title: "Agua Corporal", description: "Indica el porcentaje de agua corporal del usuario.", selector: '#tutor-14' },
      { title: "Índice IMC", description: "Muestra el Índice de Masa Corporal calculado.", selector: '#tutor-15' },
      { title: "Aumento de Fuerza", description: "Muestra el progreso en la ganancia de fuerza.", selector: '#tutor-16' },
      { title: "Eficiencia de Ganancia Muscular", description: "Gráfica y barra de progreso que detalla el rendimiento mensual.", selector: '#tutor-17' },
      { title: "Información de Contacto e Inscripción", description: "Muestra los detalles de fecha de alta, celular y correo electrónico.", selector: '#tutor-18' },
      { title: "Próximo Corte", description: "Muestra la fecha límite del siguiente pago o renovación.", selector: '#tutor-19' },
      { title: "Saldo a Pagar", description: "Indica la cantidad monetaria pendiente del usuario.", selector: '#tutor-20' },
      { title: "Calendario de Asistencia", description: "Vista detallada de los días del mes con los estados de asistencia (asistió, faltó, hoy).", selector: '#tutor-21' },
      { title: "Mascota y Racha", description: "Muestra la evolución de la mascota virtual y los días seguidos de racha del usuario.", selector: '#tutor-22' }
    ],
    en: [
      { title: "User Search", description: "Quickly locate any registered user by their name or ID number.", selector: '#tutor-0' },
      { title: "User Profile", description: "View the general card with the user's information, status, and main metrics.", selector: '#tutor-1' },
      { title: "User Avatar", description: "Shows the user's visual identifier or icon in the system.", selector: '#tutor-2' },
      { title: "Attendance Percentage", description: "Indicates the user's overall accumulated attendance level.", selector: '#tutor-3' },
      { title: "User Name", description: "Shows the user's registered full name.", selector: '#tutor-4' },
      { title: "Unique Identifier", description: "Shows the user's registration code in the system.", selector: '#tutor-5' },
      { title: "Main Body Composition", description: "Contains key metrics such as initial and current weight, height, body fat percentage, muscle mass, and calories.", selector: '#tutor-6' },
      { title: "Initial Weight", description: "Shows the weight recorded at the start of tracking.", selector: '#tutor-7' },
      { title: "Current Weight", description: "Shows the user's most recent weight.", selector: '#tutor-8' },
      { title: "Height", description: "Indicates the user's recorded height.", selector: '#tutor-9' },
      { title: "Body Fat Percentage", description: "Shows the estimated body fat level.", selector: '#tutor-10' },
      { title: "Muscle Mass", description: "Shows the muscle mass value in kilograms.", selector: '#tutor-11' },
      { title: "Average Calories", description: "Shows the estimated calories burned or consumed per day.", selector: '#tutor-12' },
      { title: "Advanced Indicators", description: "Shows detailed metrics for body water, BMI, and strength gains.", selector: '#tutor-13' },
      { title: "Body Water", description: "Indicates the user's body water percentage.", selector: '#tutor-14' },
      { title: "BMI Index", description: "Shows the calculated Body Mass Index.", selector: '#tutor-15' },
      { title: "Strength Gains", description: "Shows progress in strength gains.", selector: '#tutor-16' },
      { title: "Muscle Gain Efficiency", description: "Chart and progress bar detailing monthly performance.", selector: '#tutor-17' },
      { title: "Contact and Enrollment Information", description: "Shows the sign-up date, mobile number, and email address details.", selector: '#tutor-18' },
      { title: "Next Cutoff", description: "Shows the deadline for the next payment or renewal.", selector: '#tutor-19' },
      { title: "Balance Due", description: "Indicates the user's outstanding amount owed.", selector: '#tutor-20' },
      { title: "Attendance Calendar", description: "Detailed view of the days of the month with attendance status (attended, missed, today).", selector: '#tutor-21' },
      { title: "Pet and Streak", description: "Shows the virtual pet's progress and the user's consecutive-day streak.", selector: '#tutor-22' }
    ]
  }
};

const steps = computed(() => {
  const routeTutorials = tutoriales[route.name];
  if (!routeTutorials) return [];
  return routeTutorials[currentLang.value] || routeTutorials.es;
});

const setupStepTimer = () => {
  textRevealed.value = false;
  if (revealTimer) clearTimeout(revealTimer);

  if (isMobile.value) {
    revealTimer = setTimeout(() => {
      textRevealed.value = true;
    }, 1500);
  } else {
    textRevealed.value = true;
  }
};

const revealTextNow = () => {
  if (revealTimer) clearTimeout(revealTimer);
  textRevealed.value = true;
};

const stopTracking = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const getCurrentTarget = () => {
  const stepConfig = steps.value[activeStep.value];
  return stepConfig ? document.querySelector(stepConfig.selector) : null;
};

const getViewportHeight = () => window.visualViewport?.height || window.innerHeight;

// Parte superior de la pantalla tapada por barras fijas o sticky (p. ej. la
// barra superior en móvil); el elemento resaltado no debe quedar debajo de ellas.
const getTopObstruction = (target) => {
  const maxHeight = getViewportHeight() * 0.4;
  let bottom = 0;
  for (const node of document.elementsFromPoint(window.innerWidth / 2, 1)) {
    if (rootRef.value?.contains(node) || node.contains(target) || target.contains(node)) continue;
    const { position } = getComputedStyle(node);
    if (position !== 'fixed' && position !== 'sticky') continue;
    const rect = node.getBoundingClientRect();
    if (rect.top <= 1 && rect.bottom < maxHeight) bottom = Math.max(bottom, rect.bottom);
  }
  return bottom;
};

// Espacio inferior que ocupa la hoja de texto en móvil. Antes de medirla por
// primera vez se usa una estimación.
const getBottomObstruction = () => {
  if (!isMobile.value) return 0;
  return lastSheetHeight || Math.min(getViewportHeight() * 0.45, 300);
};

// Zona de la pantalla en la que el elemento resaltado queda realmente visible
const getVisibleArea = (target) => ({
  top: (isMobile.value ? getTopObstruction(target) : 0) + SCROLL_GAP + SPOTLIGHT_PADDING,
  bottom: getViewportHeight() - getBottomObstruction() - SCROLL_GAP - SPOTLIGHT_PADDING
});

const scrollToTarget = (el) => {
  if (!isMobile.value) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // En móvil se centra el elemento en el hueco libre entre la barra superior y
  // la hoja de texto. scroll-margin hace que el navegador calcule el destino
  // descontando ese espacio, incluso si el elemento está en un contenedor con scroll.
  const area = getVisibleArea(el);
  const fits = el.getBoundingClientRect().height <= area.bottom - area.top;
  const { scrollMarginTop, scrollMarginBottom } = el.style;
  el.style.scrollMarginTop = `${area.top}px`;
  el.style.scrollMarginBottom = `${getViewportHeight() - area.bottom}px`;
  el.scrollIntoView({ behavior: 'smooth', block: fits ? 'center' : 'start' });
  el.style.scrollMarginTop = scrollMarginTop;
  el.style.scrollMarginBottom = scrollMarginBottom;
};

// Vuelve a desplazar la página sólo si el elemento quedó tapado o fuera de vista
const ensureTargetVisible = () => {
  if (activeStep.value === null) return;
  const el = getCurrentTarget();
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const area = getVisibleArea(el);
  const fits = rect.height <= area.bottom - area.top;
  const outOfView = fits
    ? rect.top < area.top - 1 || rect.bottom > area.bottom + 1
    : rect.top < area.top - 1 || rect.top > (area.top + area.bottom) / 2;

  if (outOfView) scrollToTarget(el);
};

// Recalcula la posición del elemento resaltado en cada frame. La posición se
// guarda en coordenadas de página, así que mientras la pantalla se desplaza el
// recuadro sigue al elemento sin retraso; al cambiar de paso se interpola con
// una curva exponencial que no depende de los FPS del dispositivo.
const trackPosition = (now) => {
  if (activeStep.value === null || !steps.value[activeStep.value]) {
    stopTracking();
    return;
  }

  const el = getCurrentTarget();

  if (el) {
    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const target = {
      top: rect.top + scrollY - SPOTLIGHT_PADDING,
      left: rect.left + scrollX - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2
    };

    if (!spotlightPageRect || reducedMotionQuery.matches) {
      spotlightPageRect = target;
    } else {
      const dt = lastFrameTime ? Math.min(now - lastFrameTime, 100) : 16;
      const k = 1 - Math.exp(-dt / SPOTLIGHT_SMOOTHING_MS);
      for (const key in target) {
        const diff = target[key] - spotlightPageRect[key];
        spotlightPageRect[key] = Math.abs(diff) < 0.5 ? target[key] : spotlightPageRect[key] + diff * k;
      }
    }

    const next = {
      top: spotlightPageRect.top - scrollY,
      left: spotlightPageRect.left - scrollX,
      width: spotlightPageRect.width,
      height: spotlightPageRect.height
    };
    // Sólo se actualiza el estado reactivo si algo cambió, para no re-renderizar
    // en cada frame con la pantalla quieta (importante en móvil).
    const prev = targetRect.value;
    if (!prev || Object.keys(next).some((key) => Math.abs(next[key] - prev[key]) > 0.1)) {
      targetRect.value = next;
    }
  } else {
    spotlightPageRect = null;
    targetRect.value = null;
  }

  lastFrameTime = now;
  rafId = requestAnimationFrame(trackPosition);
};

const startTracking = () => {
  if (rafId) return;
  lastFrameTime = 0;
  rafId = requestAnimationFrame(trackPosition);
};

const updateTargetPosition = () => {
  if (activeStep.value === null) return;

  const el = getCurrentTarget();
  if (el) scrollToTarget(el);
  startTracking();
};

// En móvil, al aparecer la hoja de texto se mide su altura real y, si tapa al
// elemento resaltado, se reacomoda la página para dejarlo a la vista.
watch(textRevealed, async (revealed) => {
  if (!revealed || !isMobile.value || activeStep.value === null) return;
  await nextTick();
  if (sheetRef.value) lastSheetHeight = sheetRef.value.offsetHeight;
  ensureTargetVisible();
});

// Bloquea el scroll de la página mientras el tutorial está activo, así el
// recuadro nunca se desalinea con el elemento que señala al desplazarse.
const lockScroll = () => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  document.body.style.overflow = previousBodyOverflow;
};

const popoverStyle = computed(() => {
  if (!targetRect.value) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const rect = targetRect.value;
  const popoverHeight = 220;

  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  if (spaceBelow > popoverHeight + 20) {
    return {
      top: (rect.top + rect.height + 12) + 'px',
      left: Math.max(20, Math.min(rect.left, window.innerWidth - 360)) + 'px',
      transform: 'none',
      width: '340px'
    };
  } else {
    return {
      top: Math.max(20, rect.top - popoverHeight - 12) + 'px',
      left: Math.max(20, Math.min(rect.left, window.innerWidth - 360)) + 'px',
      transform: 'none',
      width: '340px'
    };
  }
});

const startTutorial = () => {
  if (steps.value.length > 0) {
    activeStep.value = 0;
    lockScroll();
    setupStepTimer();
    updateTargetPosition();
  }
};

const nextStep = () => {
  if (activeStep.value < steps.value.length - 1) {
    activeStep.value++;
    setupStepTimer();
    updateTargetPosition();
  } else {
    closeTutorial();
  }
};

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
    setupStepTimer();
    updateTargetPosition();
  }
};

const closeTutorial = () => {
  if (revealTimer) clearTimeout(revealTimer);
  clearTimeout(resizeTimer);
  stopTracking();
  spotlightPageRect = null;
  unlockScroll();
  activeStep.value = null;
  targetRect.value = null;
  textRevealed.value = false;
};

const updateTutorialStatus = () => {
  tutorialEnabled.value = localStorage.getItem('tutorialActivo') === 'true';
};

// Listener para actualizar el idioma en tiempo real si se modifica en la app
const handleLanguageUpdate = () => {
  currentLang.value = localStorage.getItem('GYM_ADMIN-idioma') || 'es';
};

onMounted(() => {
  window.addEventListener('tutorial-updated', updateTutorialStatus);
  window.addEventListener('language-updated', handleLanguageUpdate);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (revealTimer) clearTimeout(revealTimer);
  clearTimeout(resizeTimer);
  stopTracking();
  unlockScroll();
  window.removeEventListener('tutorial-updated', updateTutorialStatus);
  window.removeEventListener('language-updated', handleLanguageUpdate);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.btn-help {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--color-botones, #1c4fd6), #3b82f6);
  color: white;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-help:hover { transform: scale(1.12); }

.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 9999;
  overflow: hidden;
  /* Evita que en móvil el gesto de arrastre desplace la página bajo el overlay */
  touch-action: none;
}

/* Sin transition de CSS: la suavidad la da la interpolación por frame en JS,
   que no pelea con las actualizaciones continuas de posición. */
.spotlight-box {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.85), 0 0 25px rgba(85, 88, 247, 0.9);
  border: 2px solid #6366f1;
  will-change: transform, width, height;
  pointer-events: none;
}

.help-popover {
  position: absolute;
  background: linear-gradient(145deg, #161e29, #0f172a);
  color: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(85, 88, 247, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.3);
  z-index: 10000;
  transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

/* En pantallas chicas la tarjeta se convierte en una hoja fija en la parte
   inferior, con altura máxima y scroll interno, en vez de intentar
   posicionarse junto al elemento (lo que en móvil se veía cortado o mal
   ubicado). */
.help-popover.mobile-sheet {
  position: fixed;
  top: auto;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 100%;
  max-height: 70vh;
  max-height: 70dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  border-radius: 20px 20px 0 0;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  animation: slideUpSheet 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.help-popover.mobile-sheet::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.help-popover.mobile-sheet .popover-header {
  margin-top: 10px;
}

@keyframes slideUpSheet {
  from { transform: translateY(100%); opacity: 0.4; }
  to { transform: translateY(0); opacity: 1; }
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.help-popover h3 {
  margin: 0;
  font-size: 1.2rem;
  font-family: 'Oswald', sans-serif;
  background: linear-gradient(90deg, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.help-popover p {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #cbd5e1;
  margin-bottom: 22px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Oswald', sans-serif;
}

.step-badge {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.buttons-group {
  display: flex;
  gap: 8px;
}

.nav-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.nav-btn.primary {
  background: linear-gradient(135deg, var(--color-botones, #1c4fd6), #4f46e5);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.nav-btn.primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.nav-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
</style>