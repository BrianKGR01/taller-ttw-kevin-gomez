import { movimientoReducido, alCambiarMovimiento, ahorroDeDatos } from './ambiente';

/**
 * Los videos de atmósfera solo corren cuando se ven (IntersectionObserver
 * trata como "no visible" lo que está en display:none, así que sirve tanto en
 * presentación como en lectura), nunca con prefers-reduced-motion y nunca con
 * ahorro de datos: en esos casos queda el póster estático.
 */
export function iniciarVideos(): void {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-video-fondo]')];
  if (videos.length === 0) return;
  const visibles = new Set<HTMLVideoElement>();

  const aplicar = (v: HTMLVideoElement) => {
    const permitido = !movimientoReducido() && !ahorroDeDatos() && !document.hidden;
    if (permitido && visibles.has(v)) void v.play().catch(() => {});
    else v.pause();
  };

  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) visibles.add(v);
        else visibles.delete(v);
        aplicar(v);
      }
    },
    { threshold: 0.05 },
  );
  videos.forEach((v) => io.observe(v));
  alCambiarMovimiento(() => videos.forEach(aplicar));
  document.addEventListener('visibilitychange', () => videos.forEach(aplicar));
}
