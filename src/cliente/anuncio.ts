/** Región `aria-live` para anunciar cambios a lectores de pantalla. */
export function anunciar(texto: string): void {
  const el = document.querySelector<HTMLElement>('[data-anuncio]');
  if (!el) return;
  el.textContent = '';
  // Un cambio de contenido en dos tiempos hace que se anuncie aunque el texto se repita.
  window.setTimeout(() => (el.textContent = texto), 40);
}
