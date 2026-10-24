<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'

const route = useRoute()
const router = useRouter()
const REQUIRED_ROLE = 'GYM_RECEPCIONIST'

const verifySecurityAccess = () => {
  const token = sessionStorage.getItem('auth_token')
  const userRole = sessionStorage.getItem('user_role')?.trim()

  if (!token || !userRole) {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user_role')
    sessionStorage.removeItem('gym_account')
    void router.replace({ name: 'login' })
    return
  }

  if (userRole !== REQUIRED_ROLE) {
    void router.replace({ name: 'login' })
  }
}

onMounted(verifySecurityAccess)
watch(() => route.fullPath, verifySecurityAccess)
</script>

<template>
  <div class="recepcion-layout">
    <div class="main-wrapper">
      <main class="content-area">
        <RouterView />
      </main>
    </div>
  </div>
</template>