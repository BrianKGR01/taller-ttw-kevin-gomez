import { movimientoReducido, tokenMs } from './ambiente';

/**
 * Efecto "agente escribiendo": los prompts y el código se teclean con cursor
 * parpadeante cuando la diapositiva se activa. El texto completo siempre está
 * en `data-texto` (y es lo que copia el botón), y el espacio que ocupa se
 * reserva desde el principio para que el layout no salte.
 */
const cancelaciones = new WeakMap<HTMLElement, () => void>();

function estructura(el: HTMLElement) {
  el.textContent = '';
  const hecho = document.createElement('span');
  hecho.className = 't-hecho';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const resto = document.createElement('span');
  resto.className = 't-resto';
  el.append(hecho, cursor, resto);
  return { hecho, resto, cursor };
}

function mostrarCompleto(el: HTMLElement, texto: string) {
  cancelaciones.get(el)?.();
  cancelaciones.delete(el);
  el.textContent = texto;
}

function teclear(el: HTMLElement, texto: string, retraso = 0): void {
  cancelaciones.get(el)?.();
  const { hecho, resto, cursor } = estructura(el);
  resto.textContent = texto;
  // Velocidad: el token manda, pero un texto largo no puede tardar más de ~3.2 s.
  const porCaracter = Math.min(tokenMs('--mov-teclear', 14), 3200 / Math.max(texto.length, 1));
  let inicio = 0;
  let raf = 0;
  let cancelado = false;
  const cancelar = () => {
    cancelado = true;
    cancelAnimationFrame(raf);
  };
  cancelaciones.set(el, cancelar);

  const paso = (t: number) => {
    if (cancelado) return;
    if (!inicio) inicio = t + retraso;
    const n = Math.max(0, Math.min(texto.length, Math.floor((t - inicio) / porCaracter)));
    hecho.textContent = texto.slice(0, n);
    resto.textContent = texto.slice(n);
    if (n < texto.length) raf = requestAnimationFrame(paso);
    else cursor.classList.add('cursor--reposo');
  };
  raf = requestAnimationFrame(paso);
}

/** Inicia el tecleo de todo lo que se pueda teclear dentro de una diapositiva. */
export function activarTipeo(diapo: HTMLElement): void {
  const animar = !movimientoReducido();
  diapo.querySelectorAll<HTMLElement>('.codigo[data-teclear] code[data-texto]').forEach((code, i) => {
    const texto = code.dataset.texto ?? '';
    if (!animar) return mostrarCompleto(code, texto);
    teclear(code, texto, 380 + i * 120);
  });
  diapo.querySelectorAll<HTMLElement>('[data-teclear-linea]').forEach((linea) => {
    const objetivo = linea.querySelector<HTMLElement>('[data-teclear-texto]');
    if (!objetivo) return;
    const texto = objetivo.dataset.completo ?? objetivo.textContent ?? '';
    objetivo.dataset.completo = texto;
    if (!animar) return mostrarCompleto(objetivo, texto);
    teclear(objetivo, texto, 650);
  });
}

/** Deja todo el texto visible (al salir de la diapositiva o en modo lectura). */
export function restaurarTipeo(diapo: HTMLElement): void {
  diapo.querySelectorAll<HTMLElement>('.codigo[data-teclear] code[data-texto]').forEach((code) => {
    mostrarCompleto(code, code.dataset.texto ?? '');
  });
  diapo.querySelectorAll<HTMLElement>('[data-teclear-texto]').forEach((el) => {
    mostrarCompleto(el, el.dataset.completo ?? el.textContent ?? '');
  });
}
