<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const REQUIRED_ROLE = 'GYM_ACCOUNT'

const verifySecurityAccess = () => {
  const token = sessionStorage.getItem('auth_token')
  const userRole = sessionStorage.getItem('user_role')?.trim()

  if (!token || !userRole) {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user_role')
    sessionStorage.removeItem('gym_account')
    router.replace({ name: 'login' })
    return
  }

  if (userRole !== REQUIRED_ROLE) {
    router.replace({ name: 'login' })
  }
}

onMounted(verifySecurityAccess)
watch(() => route.fullPath, verifySecurityAccess)

const currentRouteName = computed(() => {
  return (route.name as string)?.replace('GYM_ACCOUNT-', '').replace(/-/g, ' ') || 'Dashboard'
})
</script>

<template>
  <div class="GYM_ACCOUNT-layout">
    <div class="main-wrapper">
      <main class="content-area">
        <RouterView />
      </main>
    </div>
  </div>
</template>