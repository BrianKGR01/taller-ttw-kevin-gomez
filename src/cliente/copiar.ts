import { anunciar } from './anuncio';

/**
 * Botón "Copiar" con confirmación animada. El texto sale del bloque más cercano
 * marcado con `data-copiable` (el `<code data-texto>`), o de un atributo
 * `data-copiar-valor` en el propio botón.
 */
const RESTABLECER_MS = 1900;

export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* se intenta el método de respaldo */
  }
  try {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, texto.length);
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function textoDe(boton: HTMLElement): string {
  const directo = boton.dataset.copiarValor;
  if (directo !== undefined) return directo;
  const fuente = boton.closest<HTMLElement>('[data-copiable]');
  const code = fuente?.querySelector<HTMLElement>('[data-texto]');
  return code?.dataset.texto ?? code?.textContent ?? '';
}

const temporizadores = new WeakMap<HTMLElement, number>();

export function iniciarCopiar(): void {
  document.addEventListener('click', async (e) => {
    const boton = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-copiar]');
    if (!boton) return;
    e.preventDefault();
    const etiqueta = boton.querySelector<HTMLElement>('[data-copiar-texto]');
    const original = boton.dataset.etiquetaOriginal ?? etiqueta?.textContent ?? 'Copiar';
    boton.dataset.etiquetaOriginal = original;
    const ok = await copiarTexto(textoDe(boton));
    boton.dataset.estado = ok ? 'copiado' : 'error';
    if (etiqueta) etiqueta.textContent = ok ? '¡Copiado!' : 'Selecciona y copia';
    anunciar(ok ? 'Copiado al portapapeles' : 'No se pudo copiar automáticamente');
    window.clearTimeout(temporizadores.get(boton));
    temporizadores.set(
      boton,
      window.setTimeout(() => {
        delete boton.dataset.estado;
        if (etiqueta) etiqueta.textContent = original;
      }, RESTABLECER_MS),
    );
    if (e instanceof MouseEvent && e.detail > 0) boton.blur();
  });
}
