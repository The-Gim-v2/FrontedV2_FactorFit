/**
 * Marca con data-offscreen las <section> y <footer> que no están en pantalla
 * (con 150px de margen). El CSS de mobile-performance.css pausa las
 * animaciones de esas secciones, así el celular solo anima lo que se ve.
 *
 * Uso (en main.ts, después de app.mount):
 *   pauseOffscreenAnimations()
 */
export function pauseOffscreenAnimations(selector = 'section, footer'): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
      }
    },
    { rootMargin: '150px 0px' }
  );

  const seen = new WeakSet<Element>();

  const scan = () => {
    document.querySelectorAll(selector).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      io.observe(el);
    });
  };

  /* Las secciones aparecen al cambiar de ruta: se revisan de nuevo,
     agrupando los cambios en un solo cuadro */
  let queued = false;
  const mo = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  });

  scan();
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
  };
}