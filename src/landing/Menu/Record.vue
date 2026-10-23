<script setup lang="ts">
import RegisterAthlete from './RegisterAthlete.vue';
</script>

<template>
  <div class="register-shell">
    <div class="glow"></div>
    <RegisterAthlete />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&display=swap');

.register-shell {
  min-height: 100vh;
  background: #0a0a0a;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 40px;
}

.glow {
  position: absolute;
  top: -160px;
  left: 50%;
  transform: translateX(-50%);
  width: 720px;
  height: 720px;
  max-width: 160vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(28, 79, 214, 0.32) 0%, rgba(28, 79, 214, 0) 70%);
  filter: blur(10px);
  pointer-events: none;
}
</style>