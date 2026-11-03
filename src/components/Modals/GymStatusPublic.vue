<template>
  <div class="gym-public-status" :class="{open:estado?.abierto,closed:estado&&!estado.abierto}" role="status" aria-live="polite">
    <span class="gym-public-dot"></span><div><strong>{{ error ? 'Estado no disponible' : !estado ? 'Consultando horario...' : estado.abierto ? 'Gimnasio Abierto' : 'Gimnasio Cerrado' }}</strong><small v-if="estado">{{ estado.motivo }}<template v-if="estado.apertura"> · {{ estado.apertura }}–{{ estado.cierre }}</template></small><small v-if="error">{{ error }}</small></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
const props=defineProps<{gymId:number|string,sedeId:number|string}>();
const estado=ref<any>(null),error=ref('');let timer:ReturnType<typeof setInterval>|null=null,seq=0;
const API=String(import.meta.env.VITE_API_URL||'').replace(/\/+$/,'').replace(/\/api$/i,'');
const cargar=async()=>{const id=++seq;try{if(!Number.isInteger(Number(props.gymId))||Number(props.gymId)<=0||!Number.isInteger(Number(props.sedeId))||Number(props.sedeId)<=0)throw new Error('Gimnasio o sede inválidos');const res=await fetch(`${API}/api/public/gimnasios/${Number(props.gymId)}/sedes/${Number(props.sedeId)}/estado`,{headers:{Accept:'application/json'},cache:'no-store'});const data=await res.json().catch(()=>null);if(!res.ok)throw new Error(data?.message||`Error HTTP ${res.status}`);if(id===seq){estado.value=data.estado||null;error.value='';}}catch(e:any){if(id===seq){estado.value=null;error.value=e.message||'Error al consultar.';}}};
watch(()=>[props.gymId,props.sedeId],()=>void cargar());
onMounted(()=>{void cargar();timer=setInterval(()=>void cargar(),60000);});onUnmounted(()=>{seq++;if(timer)clearInterval(timer);});
</script>
<style scoped>
.gym-public-status{display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:12px;color:#e5e7eb;background:#1c1f2b;border:1px solid #ffffff20;font:600 13px Inter,system-ui,sans-serif}.gym-public-status.open{background:#063b2caa;border-color:#10b98177;color:#34d399}.gym-public-status.closed{background:#431c1caa;border-color:#ef444477;color:#fca5a5}.gym-public-dot{width:10px;height:10px;flex:none;border-radius:50%;background:currentColor;box-shadow:0 0 0 4px #ffffff10}.gym-public-status>div{display:flex;flex-direction:column;gap:4px}.gym-public-status small{color:#bfc5cc;font-size:11px;font-weight:400}
</style>
