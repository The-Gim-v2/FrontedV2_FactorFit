/**
 * Pausa animaciones CSS de las secciones que están fuera de la pantalla.
 * No desactiva ni elimina animaciones: vuelven a continuar al acercarse.
 * Compatible con Vue Router y nuevos componentes montados después.
 */
export function pauseOffscreenAnimations(selector = 'section, footer'): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => {};

  const observed = new WeakSet<Element>();
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
    }
  }, { rootMargin: '200px 0px', threshold: 0 });

  const observe = (node: Element) => {
    if (!observed.has(node)) {
      observed.add(node);
      io.observe(node);
    }
  };
  const scan = (node: Element) => {
    if (node.matches(selector)) observe(node);
    node.querySelectorAll(selector).forEach(observe);
  };
  scan(document.body);

  let raf = 0;
  const pending = new Set<Element>();
  const mo = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) pending.add(node as Element);
      }
    }
    if (!pending.size || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      for (const el of pending) if (el.isConnected) scan(el);
      pending.clear();
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => {
    io.disconnect();
    mo.disconnect();
    cancelAnimationFrame(raf);
    pending.clear();
    document.querySelectorAll('[data-offscreen]').forEach(el => el.removeAttribute('data-offscreen'));
  };
}
