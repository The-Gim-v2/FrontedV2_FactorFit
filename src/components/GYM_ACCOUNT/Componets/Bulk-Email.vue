<template>
<div class="mail-panel">
<NotificationSystem ref="toastRef" />
<!-- HEADER -->
<header class="mail-header">
<div class="header-left">
<div class="header-icon">
<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="5" width="18" height="14" rx="2" />
<polyline points="3 7 12 13 21 7" />
</svg>
</div>
<div class="title-group">
<div class="title-row">
<h2 class="form-title">{{ t('massTitle') }} <span class="highlight">{{ t('massHighlight') }}</span></h2>
<span class="campaign-badge"><span class="campaign-dot"></span>{{ t('campaign') }}</span>
</div>
<p class="form-subtitle">{{ t('massSubtitle') }}</p>
</div>
</div>
<button type="button" class="close-x" @click="$emit('close')" :aria-label="t('close')">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
</button>
</header>
<!-- BODY (con scroll) -->
<div class="form-body">
<!-- Switcher tablet / móvil -->
<div class="mobile-view-switcher">
<button type="button" class="view-switch-btn" :class="{ active: activeMailView === 'editor' }" @click="activeMailView = 'editor'">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
{{ t('edit') }}
</button>
<button type="button" class="view-switch-btn" :class="{ active: activeMailView === 'preview' }" @click="activeMailView = 'preview'">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
{{ t('preview') }}
</button>
</div>
<div class="mail-workspace">
<!-- COLUMNA IZQUIERDA: EDITOR -->
<div class="composer-column" :class="{ 'mobile-hidden': activeMailView !== 'editor' }">
<!-- 01 DESTINATARIOS -->
<section class="form-section">
<div class="section-heading">
<div>
<label class="section-label">{{ t('recipients') }}</label>
<span class="section-description">{{ t('recipientsHelp') }}</span>
</div>
<span class="section-number">01</span>
</div>
<div class="field-wrapper recipients-wrapper">
<div class="field-icon">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
</svg>
</div>
<textarea v-model="emailForm.destinatarios" class="custom-input textarea-field with-icon" rows="2" :placeholder="t('recipientsPlaceholder')"></textarea>
</div>
<div v-if="recipientCount > 0" class="chips-area">
<div class="chips">
<span v-for="r in visibleChips" :key="r.email" class="chip" :class="{ invalid: !r.valid }">
<span class="chip-text">{{ r.email }}</span>
<button type="button" class="chip-x" @click="removeRecipient(r.email)" :aria-label="t('remove')">
<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
</button>
</span>
<span v-if="hiddenChips > 0" class="chip chip-more">+{{ hiddenChips }}</span>
</div>
<div class="chips-meta">
<span class="meta-ok">{{ validCount }} {{ t('valid') }}</span>
<span v-if="invalidCount > 0" class="meta-bad">{{ invalidCount }} {{ t('invalid') }}</span>
</div>
</div>
</section>
<!-- 02 ASUNTO -->
<section class="form-section">
<div class="section-heading">
<div>
<label class="section-label">{{ t('subject') }}</label>
<span class="section-description">{{ t('subjectHelp') }}</span>
</div>
<span class="section-number">02</span>
</div>
<div class="field-wrapper">
<div class="field-icon">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8" /><path d="M8 13h5" /></svg>
</div>
<input v-model="emailForm.asunto" type="text" class="custom-input with-icon" :placeholder="t('subjectPlaceholder')" maxlength="150" />
</div>
</section>
<!-- 03 MENSAJE -->
<section class="form-section message-section">
<div class="section-heading">
<div>
<label class="section-label">{{ t('message') }}</label>
<span class="section-description">{{ t('messageHelp') }}</span>
</div>
<span class="section-number">03</span>
</div>
<!-- Plantillas rápidas -->
<div class="templates-row">
<span class="templates-label">{{ t('templates') }}</span>
<button v-for="tpl in templates" :key="tpl.id" type="button" class="template-btn" @click="applyTemplate(tpl)">
{{ tpl.label }}
</button>
</div>
<div ref="editorContainer" class="editor-container" @mouseleave="onContainerLeave">
<div class="toolbar">
<div class="toolbar-group">
<button type="button" class="tool-btn" @mousedown.prevent @click="execCommand('bold')" :title="t('bold')"><strong>B</strong></button>
<button type="button" class="tool-btn italic-tool" @mousedown.prevent @click="execCommand('italic')" :title="t('italic')">I</button>
<button type="button" class="tool-btn underline-tool" @mousedown.prevent @click="execCommand('underline')" :title="t('underline')">U</button>
<button type="button" class="tool-btn" @mousedown.prevent @click="execCommand('insertUnorderedList')" :title="t('list')">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>
</button>
<button type="button" class="tool-btn" @mousedown.prevent @click="execCommand('removeFormat')" :title="t('clearFormat')">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v8"/><path d="M3 21 21 3"/></svg>
</button>
</div>
<div class="toolbar-separator"></div>
<div class="toolbar-group">
<button type="button" class="tool-btn tool-btn-image" @click="fileInput?.click()" :title="t('attachImage')">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
<span>{{ t('image') }}</span>
</button>
<input ref="fileInput" type="file" accept="image/*" class="hidden-file-input" @change="handleImage" />
</div>
<div class="toolbar-spacer"></div>
<span class="editor-status"><span class="status-dot"></span>{{ t('editor') }}</span>
</div>
<div
ref="editor"
class="editor-area"
contenteditable="true"
role="textbox"
aria-multiline="true"
:data-placeholder="t('editorPlaceholder')"
@input="updateContent"
@paste="handlePaste"
@mouseover="onEditorMouseOver"
@pointerup="onEditorTap"
@click="onEditorTap"
@scroll="positionImageButton"
></div>
<!-- Botón flotante para eliminar la imagen -->
<button
ref="imgBtnEl"
v-show="imgBtn.visible"
type="button"
class="img-delete-btn"
:style="{ top: imgBtn.top + 'px', left: imgBtn.left + 'px' }"
:title="t('removeImage')"
:aria-label="t('removeImage')"
@mousedown.prevent
@pointerdown.stop
@click.stop="removeActiveImage"
>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
<polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
</svg>
<span>{{ t('delete') }}</span>
</button>
<div class="editor-footer">
<div class="editor-tip">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
{{ t('editorTip') }}
</div>
<span class="char-count">{{ charCount }} {{ t('chars') }}</span>
</div>
</div>
</section>
</div>
<!-- COLUMNA DERECHA: PREVIEW -->
<aside class="preview-column" :class="{ 'mobile-hidden': activeMailView !== 'preview' }">
<div class="preview-panel-header">
<div class="preview-title-group">
<div class="preview-icon">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
</div>
<div>
<strong>{{ t('preview') }}</strong>
<span>{{ t('previewSubtitle') }}</span>
</div>
</div>
<div class="live-badge"><span></span>{{ t('live') }}</div>
</div>
<div class="email-client">
<div class="email-client-topbar">
<div class="client-brand">
<div class="client-logo">M</div>
<span>{{ t('mail') }}</span>
</div>
<div class="client-actions"><span></span><span></span><span></span></div>
</div>
<div class="email-preview-header">
<div class="preview-subject" :class="{ placeholder: !emailForm.asunto.trim() }">
{{ emailForm.asunto.trim() || t('noSubject') }}
</div>
<div class="preview-mail-meta">
<div class="preview-avatar">G</div>
<div class="preview-sender">
<div class="sender-name-row">
<strong>{{ t('gymSender') }}</strong>
<span class="sender-email">&lt;notificaciones@gimnasio.com&gt;</span>
</div>
<div class="recipient-line">{{ t('to') }} {{ recipientPreview }}</div>
</div>
<div class="preview-date">{{ previewDate }}</div>
</div>
</div>
<div class="email-preview-body">
<div v-if="hasMessage" class="preview-html-content" v-html="emailForm.mensaje"></div>
<div v-else class="preview-empty">
<div class="preview-empty-icon">
<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></svg>
</div>
<strong>{{ t('previewEmptyTitle') }}</strong>
<span>{{ t('previewEmptyText') }}</span>
</div>
</div>
<div v-if="hasMessage" class="preview-signature">
<div class="signature-line"></div>
<span>{{ t('automaticMessage') }}</span>
</div>
<div class="email-client-footer">
<button type="button" class="fake-mail-action" tabindex="-1">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
{{ t('reply') }}
</button>
<button type="button" class="fake-mail-action" tabindex="-1">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 17 20 12 15 7" /><path d="M4 18v-2a4 4 0 0 1 4-4h12" /></svg>
{{ t('forward') }}
</button>
</div>
</div>
<!-- CHECKLIST (clases propias para evitar choques con estilos globales) -->
<div class="mail-check">
<div class="mail-check-item">
<span class="mail-check-label">{{ t('recipients') }}</span>
<strong class="mail-check-value" :class="{ success: validCount > 0 && invalidCount === 0, danger: invalidCount > 0 }">{{ recipientCount }}</strong>
</div>
<div class="mail-check-item">
<span class="mail-check-label">{{ t('subject') }}</span>
<strong class="mail-check-value" :class="{ success: emailForm.asunto.trim() }">{{ emailForm.asunto.trim() ? t('ready') : t('pending') }}</strong>
</div>
<div class="mail-check-item">
<span class="mail-check-label">{{ t('message') }}</span>
<strong class="mail-check-value" :class="{ success: hasMessage }">{{ hasMessage ? t('ready') : t('pending') }}</strong>
</div>
</div>
</aside>
</div>
</div>
<!-- FOOTER FIJO -->
<footer class="composer-footer">
<div class="send-info">
<div class="send-info-icon" :class="{ warn: invalidCount > 0 }">
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
</div>
<div>
<strong>{{ recipientCount }} {{ recipientCount === 1 ? t('recipientSingular') : t('recipientPlural') }}</strong>
<span>{{ invalidCount > 0 ? invalidCount + ' ' + t('invalidWarning') : t('verifyBeforeSend') }}</span>
</div>
</div>
<button type="button" class="btn-send" :disabled="sending" @click="sendEmail">
<span>{{ sending ? (settings.idioma === 'en' ? 'Sending...' : 'Enviando...') : t('btnSend') }}</span>
<span class="send-icon">
<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
</span>
</button>
</footer>
</div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import NotificationSystem from '../../Modals/NotificationSystem.vue';
defineEmits<{ (e: 'close'): void }>();
const props=withDefaults(defineProps<{destinatariosIniciales?: string[]}>(),{destinatariosIniciales:()=>[]});
const toastRef = ref<InstanceType<typeof NotificationSystem> | null>(null);
const editor = ref<HTMLElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
/* ---------- IDIOMA ---------- */
const settings = reactive({ idioma: localStorage.getItem('GYM_ACCOUNT-idioma') || 'es' });
const translations: Record<string, Record<string, string>> = {
es: {
massTitle: 'ENVÍO', massHighlight: 'MASIVO',
massSubtitle: 'Crea, revisa y envía comunicaciones a múltiples destinatarios.',
campaign: 'Campaña', close: 'Cerrar modal',
edit: 'Editar', preview: 'Vista previa', previewSubtitle: 'Así se verá el correo', live: 'En vivo',
recipients: 'Destinatarios', recipientsHelp: 'Separa múltiples correos con comas, punto y coma o saltos de línea.',
recipientsPlaceholder: 'correo1@mail.com, correo2@mail.com',
recipientSingular: 'destinatario', recipientPlural: 'destinatarios',
valid: 'válidos', invalid: 'con error', invalidWarning: 'correos con formato inválido', remove: 'Quitar',
subject: 'Asunto', subjectHelp: 'Escribe un asunto claro para tus destinatarios.', subjectPlaceholder: 'Ej. Promoción especial',
message: 'Mensaje', messageHelp: 'Diseña el contenido que recibirán tus usuarios.',
templates: 'Plantillas', tplPayment: 'Recordatorio de pago', tplPromo: 'Promoción', tplSchedule: 'Cambio de horario',
bold: 'Negrita', italic: 'Cursiva', underline: 'Subrayado', list: 'Lista', clearFormat: 'Quitar formato',
attachImage: 'Adjuntar imagen', image: 'Imagen', delete: 'Eliminar', removeImage: 'Eliminar imagen',
editor: 'Editor', editorPlaceholder: 'Escribe el contenido del correo...',
editorTip: 'Puedes aplicar formato e insertar imágenes.', chars: 'caracteres',
mail: 'Correo', noSubject: 'Sin asunto', gymSender: 'Gimnasio', to: 'para', noRecipients: 'Sin destinatarios',
previewEmptyTitle: 'Tu mensaje aparecerá aquí', previewEmptyText: 'Comienza a escribir para visualizar el correo.',
automaticMessage: 'Este mensaje fue enviado desde el sistema de administración.',
reply: 'Responder', forward: 'Reenviar', ready: 'Listo', pending: 'Pendiente',
verifyBeforeSend: 'Verifica destinatarios y contenido antes de realizar el envío.',
btnSend: 'Enviar Correo Masivo',
imgAdded: 'Imagen añadida', imgRemoved: 'Imagen eliminada', completeFields: 'Completa destinatarios, asunto y mensaje',
invalidRecipients: 'Revisa los correos de los destinatarios', emailSent: 'Correo enviado masivamente'
},
en: {
massTitle: 'MASS', massHighlight: 'EMAIL',
massSubtitle: 'Create, review and send communications to multiple recipients.',
campaign: 'Campaign', close: 'Close modal',
edit: 'Edit', preview: 'Preview', previewSubtitle: 'This is how the email will look', live: 'Live',
recipients: 'Recipients', recipientsHelp: 'Separate multiple addresses with commas, semicolons or new lines.',
recipientsPlaceholder: 'mail1@mail.com, mail2@mail.com',
recipientSingular: 'recipient', recipientPlural: 'recipients',
valid: 'valid', invalid: 'with errors', invalidWarning: 'emails with invalid format', remove: 'Remove',
subject: 'Subject', subjectHelp: 'Write a clear subject for your recipients.', subjectPlaceholder: 'E.g. Special promotion',
message: 'Message', messageHelp: 'Design the content your users will receive.',
templates: 'Templates', tplPayment: 'Payment reminder', tplPromo: 'Promotion', tplSchedule: 'Schedule change',
bold: 'Bold', italic: 'Italic', underline: 'Underline', list: 'List', clearFormat: 'Clear formatting',
attachImage: 'Attach image', image: 'Image', delete: 'Delete', removeImage: 'Remove image',
editor: 'Editor', editorPlaceholder: 'Write the email content...',
editorTip: 'You can apply formatting and insert images.', chars: 'characters',
mail: 'Mail', noSubject: 'No subject', gymSender: 'Gym', to: 'to', noRecipients: 'No recipients',
previewEmptyTitle: 'Your message will appear here', previewEmptyText: 'Start writing to preview the email.',
automaticMessage: 'This message was sent from the administration system.',
reply: 'Reply', forward: 'Forward', ready: 'Ready', pending: 'Pending',
verifyBeforeSend: 'Check recipients and content before sending.',
btnSend: 'Send Mass Email',
imgAdded: 'Image added', imgRemoved: 'Image removed', completeFields: 'Complete recipients, subject and message',
invalidRecipients: 'Check the recipient email addresses', emailSent: 'Mass email sent successfully'
}
};
const t = (key: string): string => translations[settings.idioma]?.[key] ?? translations['es']?.[key] ?? key;
/* ---------- FORMULARIO ---------- */
const emailForm = reactive({ asunto: '', destinatarios: '', mensaje: '' });
watch(()=>props.destinatariosIniciales,(items)=>{emailForm.destinatarios=Array.from(new Set((items||[]).map(e=>String(e).trim()).filter(Boolean))).join(', ');},{immediate:true});
const activeMailView = ref<'editor' | 'preview'>('editor');
/* ---------- PLANTILLAS ---------- */
interface MailTemplate { id: string; label: string; subject: string; body: string }
const templates = computed<MailTemplate[]>(() =>
settings.idioma === 'en'
? [
{ id: 'payment', label: t('tplPayment'), subject: 'Payment reminder', body: '<p>Hi!</p><p>This is a friendly reminder that your membership payment is pending. Please stop by the front desk to keep enjoying your training.</p><p>Thank you!</p>' },
{ id: 'promo', label: t('tplPromo'), subject: 'Special promotion this month', body: '<p>Hi!</p><p>This month we have a <strong>special promotion</strong> on memberships. Ask at the front desk for details.</p><p>See you soon!</p>' },
{ id: 'schedule', label: t('tplSchedule'), subject: 'Schedule change notice', body: '<p>Hi!</p><p>We want to let you know that our schedule will change:</p><ul><li>Mon - Fri: 6:00 AM - 10:00 PM</li><li>Sat: 8:00 AM - 2:00 PM</li></ul><p>Thank you for your understanding.</p>' }
]
: [
{ id: 'payment', label: t('tplPayment'), subject: 'Recordatorio de pago', body: '<p>¡Hola!</p><p>Te recordamos que tu pago de membresía está pendiente. Pasa a recepción para seguir disfrutando de tu entrenamiento.</p><p>¡Gracias!</p>' },
{ id: 'promo', label: t('tplPromo'), subject: 'Promoción especial de este mes', body: '<p>¡Hola!</p><p>Este mes tenemos una <strong>promoción especial</strong> en membresías. Pregunta en recepción por los detalles.</p><p>¡Te esperamos!</p>' },
{ id: 'schedule', label: t('tplSchedule'), subject: 'Aviso de cambio de horario', body: '<p>¡Hola!</p><p>Te informamos que nuestro horario cambiará:</p><ul><li>Lun - Vie: 6:00 AM - 10:00 PM</li><li>Sáb: 8:00 AM - 2:00 PM</li></ul><p>Gracias por tu comprensión.</p>' }
]
);
const applyTemplate = (tpl: MailTemplate) => {
emailForm.asunto = tpl.subject;
emailForm.mensaje = tpl.body;
if (editor.value) editor.value.innerHTML = tpl.body;
hideImageButton();
};
/* ---------- DESTINATARIOS ---------- */
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const recipientList = computed<string[]>(() => {
const all = emailForm.destinatarios.split(/[,;\n]+/).map(e => e.trim()).filter(Boolean);
return Array.from(new Set(all));
});
const recipientEntries = computed(() => recipientList.value.map(email => ({ email, valid: isValidEmail(email) })));
const recipientCount = computed(() => recipientList.value.length);
const validCount = computed(() => recipientEntries.value.filter(r => r.valid).length);
const invalidCount = computed(() => recipientCount.value - validCount.value);
const MAX_CHIPS = 8;
const visibleChips = computed(() => recipientEntries.value.slice(0, MAX_CHIPS));
const hiddenChips = computed(() => Math.max(0, recipientCount.value - MAX_CHIPS));
const allRecipientsAreValid = computed(() => recipientCount.value > 0 && invalidCount.value === 0);
const removeRecipient = (email: string) => {
emailForm.destinatarios = recipientList.value.filter(e => e !== email).join(', ');
};
const recipientPreview = computed<string>(() => {
const [first] = recipientList.value;
if (!first) return t('noRecipients');
return recipientList.value.length === 1 ? first : `${first} +${recipientList.value.length - 1}`;
});
/* ---------- MENSAJE ---------- */
const plainText = computed<string>(() => {
const temp = document.createElement('div');
temp.innerHTML = emailForm.mensaje;
return temp.textContent?.trim() ?? '';
});
const hasMessage = computed<boolean>(() => {
if (plainText.value.length > 0) return true;
const temp = document.createElement('div');
temp.innerHTML = emailForm.mensaje;
return Boolean(temp.querySelector('img'));
});
const charCount = computed(() => plainText.value.length);
const previewDate = computed(() =>
new Intl.DateTimeFormat(settings.idioma === 'en' ? 'en-US' : 'es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
);
/* ---------- EDITOR ---------- */
const syncMessage = () => {
if (editor.value) emailForm.mensaje = editor.value.innerHTML;
};
const execCommand = (cmd: string) => {
if (!editor.value) return;
editor.value.focus();
document.execCommand(cmd, false, undefined);
syncMessage();
};
const updateContent = () => {
syncMessage();
// Si la imagen activa fue borrada con el teclado, oculta el botón
if (activeImg.value && !activeImg.value.isConnected) hideImageButton();
else positionImageButton();
};
// Pega siempre como texto plano (evita HTML/estilos externos y atributos peligrosos)
const handlePaste = (event: ClipboardEvent) => {
event.preventDefault();
const text = event.clipboardData?.getData('text/plain') ?? '';
document.execCommand('insertText', false, text);
syncMessage();
};
const handleImage = (event: Event) => {
const target = event.target as HTMLInputElement;
const file = target.files?.[0];
if (!file) return;
if (!file.type.startsWith('image/')) {
target.value = '';
return;
}
const reader = new FileReader();
reader.onload = readerEvent => {
const result = readerEvent.target?.result;
if (!result || typeof result !== 'string') return;
if (editor.value) {
editor.value.focus();
document.execCommand('insertImage', false, result);
syncMessage();
}
toastRef.value?.notify(t('imgAdded'), 'success');
target.value = '';
};
reader.readAsDataURL(file);
};
/* ---------- ELIMINAR IMAGEN (botón flotante) ---------- */
const activeImg = ref<HTMLImageElement | null>(null);
const imgBtnEl = ref<HTMLElement | null>(null);
const imgBtn = reactive({ visible: false, top: 0, left: 0 });
const canHover = () => window.matchMedia('(hover: hover)').matches;
const hideImageButton = () => {
activeImg.value = null;
imgBtn.visible = false;
};
const positionImageButton = () => {
const img = activeImg.value;
const container = editorContainer.value;
const area = editor.value;
if (!img || !container || !area || !img.isConnected) {
imgBtn.visible = false;
return;
}
const i = img.getBoundingClientRect();
const c = container.getBoundingClientRect();
const a = area.getBoundingClientRect();
// La imagen quedó fuera del área visible del editor (scroll)
if (i.bottom < a.top + 12 || i.top > a.bottom - 12) {
imgBtn.visible = false;
return;
}
const btnW = imgBtnEl.value?.offsetWidth || 40;
imgBtn.top = Math.max(i.top, a.top) - c.top + 8;
imgBtn.left = Math.max(Math.min(i.right, a.right) - c.left - btnW - 8, 8);
imgBtn.visible = true;
};
const selectImage = (img: HTMLImageElement) => {
activeImg.value = img;
positionImageButton();
// En móvil el teclado/viewport cambia el layout tras el toque: recalcula
setTimeout(positionImageButton, 120);
setTimeout(positionImageButton, 350);
};
const onEditorMouseOver = (event: MouseEvent) => {
if (!canHover()) return; // en táctil no hay hover
const el = event.target as HTMLElement;
if (el.tagName === 'IMG') selectImage(el as HTMLImageElement);
};
const onEditorTap = (event: Event) => {
const el = event.target as HTMLElement;
if (el.tagName === 'IMG') selectImage(el as HTMLImageElement);
else hideImageButton();
};
const onContainerLeave = () => {
if (canHover()) hideImageButton(); // en táctil no se oculta al "salir"
};
const removeActiveImage = () => {
const img = activeImg.value;
if (!img) return;
img.remove();
hideImageButton();
syncMessage();
toastRef.value?.notify(t('imgRemoved'), 'success');
};
/* ---------- ENVIAR ---------- */
const sending=ref(false);
const API = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/\/api$/i, '');
const getAuthToken=():string=>{for(const s of [sessionStorage,localStorage]){for(const k of ['auth_token','token','access_token','gym_token','GYM_ACCOUNT_token','gymAccountToken']){const v=s.getItem(k);if(v)return v.replace(/^Bearer\s+/i,'');}for(const k of ['auth','user','session','gymAccount','gym_account']){try{const d=JSON.parse(s.getItem(k)||'null');const v=d?.token||d?.access_token||d?.accessToken;if(v)return String(v).replace(/^Bearer\s+/i,'');}catch{}}}return '';};
const sendEmail=async()=>{
if(sending.value)return;
if(recipientCount.value===0||!emailForm.asunto.trim()||!hasMessage.value){toastRef.value?.notify(t('completeFields'),'error');return;}
if(!allRecipientsAreValid.value){toastRef.value?.notify(t('invalidRecipients'),'error');return;}
if(!API){toastRef.value?.notify(settings.idioma==='en'?'Backend URL is not configured.':'No está configurada la URL del backend.','error');return;}
const auth=getAuthToken();if(!auth){toastRef.value?.notify(settings.idioma==='en'?'Sign in again.':'Inicia sesión nuevamente.','error');return;}
const all=[...recipientList.value];
if(!window.confirm(settings.idioma==='en'?`Send this email to all ${all.length} recipients?`:`¿Enviar este correo a los ${all.length} destinatarios?`))return;
sending.value=true;let success=0;const BATCH_SIZE=20;
try{
for(let i=0;i<all.length;i+=BATCH_SIZE){
const lote=all.slice(i,i+BATCH_SIZE);
const response=await fetch(`${API}/api/gym/correos/enviar`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify({destinatarios:lote,asunto:emailForm.asunto.trim(),mensaje:emailForm.mensaje})});
const data=await response.json().catch(()=>({}));
const sent=Math.max(0,Number(data.enviados||0));success+=sent;
if(!response.ok||sent!==lote.length){throw new Error(`${data.message||`HTTP ${response.status}`} (${success}/${all.length})`);}
if(i+BATCH_SIZE<all.length){await new Promise(resolve=>setTimeout(resolve,22000));}
}
toastRef.value?.notify(settings.idioma==='en'?`${success} emails submitted to the mail server.`:`${success} correos enviados al servidor de correo.`,'success');
emailForm.asunto='';emailForm.mensaje='';if(editor.value)editor.value.innerHTML='';hideImageButton();
}catch(e){toastRef.value?.notify(e instanceof Error?e.message:(settings.idioma==='en'?'Could not send email.':'No se pudo enviar el correo.'),'error');}
finally{sending.value=false;}
};
/* ---------- CAMBIO DE IDIOMA ---------- */
const handleLanguageChange = (event: Event) => {
const detail = (event as CustomEvent<{ idioma?: string }>).detail;
if (detail?.idioma) settings.idioma = detail.idioma;
};
onMounted(() => {
window.addEventListener('idioma-changed', handleLanguageChange);
window.addEventListener('resize', positionImageButton);
window.addEventListener('scroll', positionImageButton, true);
window.visualViewport?.addEventListener('resize', positionImageButton);
});
onUnmounted(() => {
window.removeEventListener('idioma-changed', handleLanguageChange);
window.removeEventListener('resize', positionImageButton);
window.removeEventListener('scroll', positionImageButton, true);
window.visualViewport?.removeEventListener('resize', positionImageButton);
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
.mail-panel {
\--accent: var(--color-highlight, #3b82f6);
\--panel: var(--bg-cards, #121416);
\--input: var(--bg-input, #0c0e10);
\--text: var(--color-texto-general, #e5e7eb);
\--title: var(--color-titulos, #ffffff);
\--muted: color-mix(in srgb, var(--color-texto-general, #94a3b8) 62%, transparent);
\--border: color-mix(in srgb, var(--color-texto-general, #94a3b8) 15%, transparent);
\--border-soft: color-mix(in srgb, var(--color-texto-general, #94a3b8) 9%, transparent);
width: min(96vw, 1200px);
height: min(92vh, 860px);
display: flex;
flex-direction: column;
overflow: hidden;
border: 1px solid var(--border);
border-radius: var(--app-border-radius, 16px);
background: var(--panel);
color: var(--text);
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
box-shadow: 0 30px 80px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.015);
}
.mail-panel *, .mail-panel *::before, .mail-panel *::after { box-sizing: border-box; }
/* HEADER */
.mail-header {
position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px;
flex-shrink: 0; padding: 18px 22px;
border-bottom: 1px solid var(--border-soft);
background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent);
}
.mail-header::after { content: ''; position: absolute; bottom: -1px; left: 22px; width: 64px; height: 2px; border-radius: 999px; background: var(--accent); }
.header-left { min-width: 0; display: flex; align-items: center; gap: 13px; }
.header-icon {
width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent); border-radius: 12px;
background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent);
}
.title-group { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.title-row { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.form-title { margin: 0; color: var(--title); font-family: 'Oswald', sans-serif; font-size: 1.15rem; font-weight: 600; letter-spacing: 0.035em; }
.highlight { color: var(--accent); }
.form-subtitle { margin: 0; color: var(--muted); font-size: 0.76rem; font-weight: 500; }
.campaign-badge {
min-height: 22px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px;
border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent); border-radius: 999px;
background: color-mix(in srgb, var(--accent) 7%, transparent); color: var(--accent); font-size: 0.62rem; font-weight: 650;
}
.campaign-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.close-x {
width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0;
border: 1px solid var(--border); border-radius: 10px;
background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--muted); cursor: pointer;
transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}
.close-x:hover { border-color: rgba(248, 113, 113, 0.3); background: rgba(248, 113, 113, 0.07); color: #f87171; }
.close-x:active { transform: scale(0.94); }
/* BODY CON SCROLL */
.form-body {
flex: 1; min-height: 0; padding: 20px 22px; overflow-y: auto;
scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--text) 15%, transparent) transparent;
}
.form-body::-webkit-scrollbar { width: 5px; }
.form-body::-webkit-scrollbar-thumb { border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); }
.mail-workspace { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr); gap: 22px; align-items: start; }
.composer-column, .preview-column { min-width: 0; }
/* SECCIONES */
.form-section { margin-bottom: 20px; }
.message-section { margin-bottom: 0; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 9px; }
.section-heading > div:first-child { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.section-label { color: var(--title); font-size: 0.78rem; font-weight: 650; letter-spacing: 0.02em; }
.section-description { color: var(--muted); font-size: 0.68rem; line-height: 1.4; }
.section-number { color: color-mix(in srgb, var(--text) 25%, transparent); font-family: 'Oswald', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; }
/* CAMPOS */
.field-wrapper { position: relative; }
.field-icon { position: absolute; z-index: 2; top: 50%; left: 13px; display: flex; color: var(--muted); pointer-events: none; transform: translateY(-50%); transition: color 0.18s ease; }
.recipients-wrapper .field-icon { top: 15px; transform: none; }
.field-wrapper:focus-within .field-icon { color: var(--accent); }
.custom-input {
width: 100%; padding: 11px 13px; border: 1px solid var(--border); border-radius: 10px;
background: var(--input); color: var(--color-texto-input, var(--text));
font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 450; outline: none;
transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.custom-input.with-icon { padding-left: 40px; }
.custom-input::placeholder { color: var(--muted); opacity: 0.65; }
.custom-input:hover { border-color: color-mix(in srgb, var(--text) 23%, transparent); }
.custom-input:focus { border-color: var(--accent); background: color-mix(in srgb, var(--input) 96%, var(--accent)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent); }
.textarea-field { min-height: 64px; max-height: 120px; resize: vertical; line-height: 1.5; }
/* CHIPS */
.chips-area { display: flex; flex-direction: column; gap: 7px; margin-top: 9px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
max-width: 100%; display: inline-flex; align-items: center; gap: 6px; padding: 4px 6px 4px 10px;
border: 1px solid color-mix(in srgb, var(--accent) 26%, transparent); border-radius: 999px;
background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--text); font-size: 0.68rem; font-weight: 550;
}
.chip.invalid { border-color: rgba(248, 113, 113, 0.4); background: rgba(248, 113, 113, 0.08); color: #fca5a5; }
.chip-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chip-x {
width: 17px; height: 17px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0;
border: none; border-radius: 50%; background: color-mix(in srgb, var(--text) 10%, transparent); color: inherit; cursor: pointer;
transition: background 0.15s ease;
}
.chip-x:hover { background: rgba(248, 113, 113, 0.3); }
.chip-more { padding: 4px 10px; border-style: dashed; color: var(--muted); }
.chips-meta { display: flex; gap: 12px; font-size: 0.65rem; font-weight: 650; }
.meta-ok { color: #34d399; }
.meta-bad { color: #f87171; }
/* PLANTILLAS */
.templates-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
.templates-label { color: var(--muted); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-right: 2px; }
.template-btn {
min-height: 28px; padding: 0 11px; border: 1px solid var(--border); border-radius: 999px;
background: color-mix(in srgb, var(--text) 3%, transparent); color: var(--text);
font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 600; cursor: pointer;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.template-btn:hover { border-color: color-mix(in srgb, var(--accent) 50%, transparent); background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--accent); }
/* EDITOR */
.editor-container { position: relative; overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--input); transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.editor-container:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 11%, transparent); }
.toolbar { min-height: 46px; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; padding: 6px 8px; border-bottom: 1px solid var(--border-soft); background: color-mix(in srgb, var(--panel) 82%, var(--input)); }
.toolbar-group { display: flex; align-items: center; gap: 3px; }
.toolbar-spacer { flex: 1; }
.toolbar-separator { width: 1px; height: 20px; margin: 0 3px; background: var(--border); }
.tool-btn {
min-width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 8px;
border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--muted);
font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer;
transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.tool-btn:hover { border-color: var(--border); background: color-mix(in srgb, var(--text) 6%, transparent); color: var(--title); }
.italic-tool { font-style: italic; }
.underline-tool { text-decoration: underline; }
.tool-btn-image { padding: 0 10px; }
.hidden-file-input { display: none; }
.editor-status { display: inline-flex; align-items: center; gap: 6px; padding-right: 4px; color: var(--muted); font-size: 0.64rem; font-weight: 600; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1); }
.editor-area {
width: 100%; min-height: 200px; max-height: 340px; overflow-y: auto; padding: 16px 17px;
background: transparent; color: var(--text); font-family: 'Inter', sans-serif; font-size: 0.84rem; line-height: 1.65;
outline: none; text-align: left; scrollbar-width: thin;
}
.editor-area:empty::before { content: attr(data-placeholder); display: block; color: var(--muted); opacity: 0.6; pointer-events: none; }
.editor-area :deep(img) { display: block; max-width: 100%; height: auto; margin: 12px auto; border: 1px solid var(--border); border-radius: 9px; cursor: pointer; transition: border-color 0.16s ease, box-shadow 0.16s ease; }
.editor-area :deep(img:hover) { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
.editor-area :deep(ul), .editor-area :deep(ol) { padding-left: 22px; margin: 8px 0; }
.editor-area :deep(p) { margin: 0 0 10px; }
/* BOTÓN ELIMINAR IMAGEN */
.img-delete-btn {
position: absolute; z-index: 5; height: 30px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 11px;
border: 1px solid rgba(248, 113, 113, 0.55); border-radius: 8px;
background: rgba(127, 29, 29, 0.92); color: #fecaca;
font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 650; cursor: pointer;
box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
transition: background 0.16s ease, transform 0.16s ease, color 0.16s ease;
}
.img-delete-btn:hover { background: #dc2626; color: #ffffff; transform: translateY(-1px); }
.img-delete-btn:active { transform: translateY(0) scale(0.97); }
.editor-footer { min-height: 36px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 12px; border-top: 1px solid var(--border-soft); background: color-mix(in srgb, var(--panel) 70%, transparent); }
.editor-tip { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.64rem; }
.editor-tip svg { flex-shrink: 0; opacity: 0.7; }
.char-count { flex-shrink: 0; color: var(--muted); font-size: 0.64rem; font-weight: 600; font-variant-numeric: tabular-nums; }
/* PREVIEW (sticky) */
.preview-column {
position: sticky; top: 0; align-self: start; overflow: hidden;
border: 1px solid var(--border); border-radius: 13px;
background: color-mix(in srgb, var(--panel) 90%, #000000);
}
.preview-panel-header { min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 14px; border-bottom: 1px solid var(--border-soft); }
.preview-title-group { display: flex; align-items: center; gap: 9px; }
.preview-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--accent) 7%, transparent); color: var(--accent); }
.preview-title-group > div:last-child { display: flex; flex-direction: column; gap: 1px; }
.preview-title-group strong { color: var(--title); font-size: 0.76rem; font-weight: 650; }
.preview-title-group span { color: var(--muted); font-size: 0.62rem; }
.live-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border: 1px solid rgba(52, 211, 153, 0.18); border-radius: 999px; background: rgba(52, 211, 153, 0.06); color: #34d399; font-size: 0.6rem; font-weight: 650; }
.live-badge > span { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1); }
/* CLIENTE DE CORREO */
.email-client { margin: 12px; overflow: hidden; border: 1px solid #d8dde5; border-radius: 10px; background: #ffffff; color: #202124; font-family: Arial, Helvetica, sans-serif; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.17); }
.email-client-topbar { height: 42px; display: flex; align-items: center; justify-content: space-between; padding: 0 13px; border-bottom: 1px solid #e6e9ee; background: #f7f8fa; }
.client-brand { display: flex; align-items: center; gap: 7px; color: #4b5563; font-size: 0.68rem; font-weight: 600; }
.client-logo { width: 23px; height: 23px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; }
.client-actions { display: flex; gap: 5px; }
.client-actions span { width: 5px; height: 5px; border-radius: 50%; background: #c5cad1; }
.email-preview-header { padding: 16px 18px 13px; border-bottom: 1px solid #edf0f3; }
.preview-subject { margin-bottom: 14px; color: #202124; font-size: 1rem; font-weight: 500; line-height: 1.35; overflow-wrap: anywhere; }
.preview-subject.placeholder { color: #9ca3af; }
.preview-mail-meta { display: flex; align-items: flex-start; gap: 9px; }
.preview-avatar { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; background: #2563eb; color: #ffffff; font-size: 0.72rem; font-weight: 700; }
.preview-sender { min-width: 0; flex: 1; }
.sender-name-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; font-size: 0.72rem; }
.sender-name-row strong { color: #202124; font-weight: 600; }
.sender-email { color: #6b7280; font-size: 0.62rem; }
.recipient-line { margin-top: 2px; overflow: hidden; color: #6b7280; font-size: 0.62rem; text-overflow: ellipsis; white-space: nowrap; }
.preview-date { flex-shrink: 0; color: #9ca3af; font-size: 0.58rem; }
.email-preview-body { min-height: 230px; max-height: 330px; overflow-y: auto; padding: 20px; background: #ffffff; scrollbar-width: thin; }
.preview-html-content { color: #374151; font-size: 0.78rem; line-height: 1.65; overflow-wrap: anywhere; }
.preview-html-content :deep(p) { margin: 0 0 12px; }
.preview-html-content :deep(ul), .preview-html-content :deep(ol) { padding-left: 20px; margin: 0 0 12px; }
.preview-html-content :deep(img) { display: block; max-width: 100%; height: auto; margin: 14px auto; border-radius: 7px; }
.preview-html-content :deep(a) { color: #2563eb; }
.preview-html-content :deep(strong), .preview-html-content :deep(b) { color: #111827; }
.preview-empty { min-height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #9ca3af; text-align: center; }
.preview-empty-icon { width: 47px; height: 47px; display: flex; align-items: center; justify-content: center; margin-bottom: 5px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb; color: #9ca3af; }
.preview-empty strong { color: #6b7280; font-size: 0.74rem; font-weight: 600; }
.preview-empty span { max-width: 230px; font-size: 0.64rem; line-height: 1.45; }
.preview-signature { padding: 0 20px 16px; background: #ffffff; color: #9ca3af; font-size: 0.58rem; line-height: 1.45; }
.signature-line { width: 38px; height: 1px; margin-bottom: 8px; background: #d1d5db; }
.email-client-footer { display: flex; gap: 7px; padding: 10px 17px; border-top: 1px solid #edf0f3; background: #fafbfc; }
.fake-mail-action { min-height: 30px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; border: 1px solid #dfe3e8; border-radius: 7px; background: #ffffff; color: #6b7280; font-family: Arial, sans-serif; font-size: 0.6rem; pointer-events: none; }
/* CHECKLIST (3 columnas siempre en una sola fila) */
.mail-check {
display: flex; flex-direction: row; flex-wrap: nowrap; align-items: stretch; gap: 8px;
width: auto; margin: 0 12px 12px; padding: 10px 8px;
border: 1px solid var(--border-soft); border-radius: 10px;
background: color-mix(in srgb, var(--text) 2%, transparent);
}
.mail-check-item {
flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
padding: 2px 4px; text-align: center;
}
.mail-check-item + .mail-check-item { border-left: 1px solid var(--border-soft); }
.mail-check-label {
max-width: 100%; overflow: hidden; color: var(--muted); font-size: 0.6rem; font-weight: 500;
text-overflow: ellipsis; white-space: nowrap;
}
.mail-check-value {
max-width: 100%; overflow: hidden; color: #fbbf24; font-size: 0.7rem; font-weight: 650;
text-overflow: ellipsis; white-space: nowrap;
}
.mail-check-value.success { color: #34d399; }
.mail-check-value.danger { color: #f87171; }
/* SWITCHER */
.mobile-view-switcher { display: none; margin-bottom: 14px; }
.view-switch-btn { min-height: 38px; display: flex; align-items: center; justify-content: center; gap: 7px; flex: 1; border: 0; border-radius: 8px; background: transparent; color: var(--muted); font-family: 'Inter', sans-serif; font-size: 0.74rem; font-weight: 600; cursor: pointer; transition: background 0.16s ease, color 0.16s ease; }
.view-switch-btn.active { background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); }
/* FOOTER FIJO */
.composer-footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-shrink: 0; padding: 14px 22px; border-top: 1px solid var(--border-soft); background: color-mix(in srgb, var(--panel) 92%, #000000); }
.send-info { min-width: 0; display: flex; align-items: center; gap: 10px; }
.send-info-icon { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(52, 211, 153, 0.2); border-radius: 9px; background: rgba(52, 211, 153, 0.07); color: #34d399; }
.send-info-icon.warn { border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.08); color: #fbbf24; }
.send-info > div:last-child { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.send-info strong { color: var(--title); font-size: 0.74rem; font-weight: 600; }
.send-info span { color: var(--muted); font-size: 0.64rem; }
.btn-send {
min-width: 230px; height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 0 8px 0 18px; flex-shrink: 0;
border: 1px solid var(--accent); border-radius: 11px;
background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 78%, black));
color: #ffffff; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 650; cursor: pointer;
box-shadow: 0 7px 18px color-mix(in srgb, var(--accent) 22%, transparent);
transition: filter 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.send-icon { width: 31px; height: 31px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255, 255, 255, 0.16); }
.btn-send:hover { filter: brightness(1.08); box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 30%, transparent); transform: translateY(-1px); }
.btn-send:active { transform: translateY(0); }
:deep(.notification-container),
:deep(.toast-container) {
width: calc(100% - 32px) !important; max-width: 480px !important; box-sizing: border-box !important;
left: 50% !important; right: auto !important; margin: 0 auto !important; transform: translateX(-50%) !important;
}
.close-x:focus-visible, .tool-btn:focus-visible, .btn-send:focus-visible, .view-switch-btn:focus-visible,
.template-btn:focus-visible, .chip-x:focus-visible, .img-delete-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* TABLET */
@media (max-width: 950px) {
.mail-panel { width: min(95vw, 720px); }
.mail-workspace { grid-template-columns: 1fr; }
.mobile-view-switcher { display: flex; padding: 4px; border: 1px solid var(--border); border-radius: 11px; background: var(--input); }
.composer-column.mobile-hidden, .preview-column.mobile-hidden { display: none; }
.preview-column { position: static; width: 100%; }
.email-client { max-width: 620px; margin: 12px auto; }
.mail-check { max-width: 620px; margin: 0 auto 12px; }
}
/* MÓVIL */
@media (max-width: 600px) {
.mail-panel { width: calc(100vw - 16px); height: calc(100dvh - 16px); border-radius: 13px; }
.mail-header { padding: 14px; }
.mail-header::after { left: 14px; }
.header-icon { width: 38px; height: 38px; }
.form-title { font-size: 1rem; }
.form-subtitle { font-size: 0.68rem; }
.campaign-badge { display: none; }
.form-body { padding: 13px; }
.form-section { margin-bottom: 18px; }
.toolbar-spacer { display: none; }
.editor-status { margin-left: auto; }
.tool-btn-image span { display: none; }
.editor-area { min-height: 180px; }
.editor-tip { display: none; }
.composer-footer { padding: 11px 13px; gap: 10px; }
.send-info > div:last-child span { display: none; }
.btn-send { flex: 1; min-width: 0; }
.email-client { margin: 9px; }
.email-preview-header { padding: 14px; }
.email-preview-body { padding: 16px 14px; }
.sender-email, .preview-date { display: none; }
.mail-check { margin: 0 9px 9px; gap: 4px; }
.mail-check-label { font-size: 0.56rem; }
.mail-check-value { font-size: 0.64rem; }
.img-delete-btn { width: 38px; height: 38px; padding: 0; border-radius: 10px; }
.img-delete-btn span { display: none; }
}
@media (max-width: 380px) {
.mail-panel { width: calc(100vw - 8px); height: calc(100dvh - 8px); }
.header-icon, .section-number, .send-info { display: none; }
.mail-header, .form-body { padding: 11px; }
.mail-check { padding: 8px 4px; }
}
/* TÁCTIL: sin hover, el botón siempre es solo ícono y fácil de tocar */
@media (hover: none) {
.editor-area :deep(img) { -webkit-touch-callout: none; touch-action: manipulation; }
.img-delete-btn { width: 38px; height: 38px; padding: 0; border-radius: 10px; }
.img-delete-btn span { display: none; }
}
@media (prefers-reduced-motion: reduce) {
.custom-input, .editor-container, .tool-btn, .close-x, .btn-send, .view-switch-btn, .template-btn, .img-delete-btn { transition: none !important; }
}
</style>
