<template>
  <main class="not-found">
    <div class="glow" aria-hidden="true"></div>

    <div class="code" aria-hidden="true">
      <span>4</span>
      <span class="ring">
        <i class="dot"></i>
      </span>
      <span>4</span>
    </div>

    <h1>Esta página se perdió en el camino</h1>
    <p>
      La dirección que buscas no existe o fue movida.
      Revisa que esté bien escrita o regresa al inicio.
    </p>

    <div class="actions">
      <router-link to="/" class="btn primary">Volver al inicio</router-link>
      <a href="#" class="btn ghost" @click.prevent="$router.back()">Página anterior</a>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #e8ecf5;
  background:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px) 0 0 / 48px 48px,
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px) 0 0 / 48px 48px,
    #0a0c12;
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
}

/* Resplandor azul detrás del número */
.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(80vw, 560px);
  aspect-ratio: 1;
  transform: translate(-50%, -62%);
  background: radial-gradient(circle, rgba(58, 107, 214, 0.28), transparent 65%);
  filter: blur(30px);
  pointer-events: none;
}

.not-found > * {
  position: relative;
}
.not-found > .glow {
  position: absolute;
}

/* 404 con el cero convertido en órbita */
.code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.25rem, 2vw, 1rem);
  font-size: clamp(5.5rem, 22vw, 11rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(180deg, #ffffff 0%, #7fa3f0 55%, #3a6bd6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  user-select: none;
}

.ring {
  position: relative;
  display: inline-block;
  width: 0.72em;
  height: 0.72em;
  border: 0.09em solid #3a6bd6;
  border-radius: 50%;
  box-shadow:
    0 0 28px rgba(58, 107, 214, 0.55),
    inset 0 0 22px rgba(58, 107, 214, 0.35);
  -webkit-text-fill-color: initial;
  animation: spin 6s linear infinite;
}

.dot {
  position: absolute;
  top: -0.1em;
  left: 50%;
  width: 0.13em;
  height: 0.13em;
  margin-left: -0.065em;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 14px 3px rgba(255, 255, 255, 0.85);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h1 {
  margin: 1.5rem 0 0.75rem;
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.01em;
}

p {
  max-width: 44ch;
  margin: 0 0 2rem;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #9aa3b8;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.btn {
  padding: 0.85rem 1.6rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn.primary {
  color: #fff;
  background: #3a6bd6;
  box-shadow: 0 8px 24px rgba(58, 107, 214, 0.4);
}
.btn.primary:hover {
  background: #4d7de6;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(58, 107, 214, 0.55);
}

.btn.ghost {
  color: #c9d3ea;
  border: 1px solid rgba(255, 255, 255, 0.16);
}
.btn.ghost:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn:focus-visible {
  outline: 2px solid #9db8f5;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .ring {
    animation: none;
  }
  .btn {
    transition: none;
  }
}
</style>