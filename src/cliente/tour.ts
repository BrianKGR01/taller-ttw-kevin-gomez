import {
  avanzaSolo,
  camaraGeneral,
  camaraSeccion,
  duracionDeriva,
  estadoDePaso,
  type Caja,
  type Camara,
  type Medidas,
} from '../lib/camara';
import { movimientoReducido, tokenMs } from './ambiente';
import { anunciar } from './anuncio';

/**
 * Recorrido de cámara de los documentos (tipo `documento`).
 *
 * El paso `p` llega por el evento `taller:paso` que principal.ts dispara sobre
 * la diapositiva: 0 = vista completa · k (1..N) = sección k · N+1 = vista
 * completa otra vez. Aquí solo se traduce ese paso a una cámara (lib/camara.ts)
 * y se escribe como variables CSS; la animación la hace el navegador
 * (transition de transform, en la GPU).
 *
 * Auto-avance: con el recorrido en marcha y la diapositiva activa, si nadie
 * toca nada durante `--mov-auto-avance` se pide un avance con `taller:avanzar`.
 * Cualquier tecla, puntero o gesto reinicia la espera.
 */

type Uso = 'presentacion' | 'lectura';

interface Controlador {
  /** Vuelve a esperar el tiempo de auto-avance (si hay una espera en marcha). */
  reiniciarEspera(): void;
}

const controladores: Controlador[] = [];
const OCUPACION_ZOOM = 0.9;
/** Dónde cae el centro de la hoja en la vista completa cuando hay índice al lado. */
const ANCLA_CON_INDICE = 0.27;

function crear(diap: HTMLElement): Controlador | null {
  const doc = diap.querySelector<HTMLElement>('[data-documento]');
  const vista = doc?.querySelector<HTMLElement>('[data-vista]');
  const camara = doc?.querySelector<HTMLElement>('[data-camara]');
  const hoja = doc?.querySelector<HTMLElement>('[data-hoja]');
  if (!doc || !vista || !camara || !hoja) return null;

  const indice = doc.querySelector<HTMLElement>('.documento__indice');
  const total = Number(doc.dataset.total ?? 0);
  const secciones = new Map<number, HTMLElement>();
  hoja.querySelectorAll<HTMLElement>('.doc-sec[data-tour]').forEach((s) => secciones.set(Number(s.dataset.tour), s));
  const rotulos = new Map<number, HTMLElement>();
  doc.querySelectorAll<HTMLElement>('[data-rotulo]').forEach((r) => rotulos.set(Number(r.dataset.rotulo), r));
  const tablas = [...hoja.querySelectorAll<HTMLElement>('.doc-tabla')];

  const raiz = document.documentElement;
  let p = Number(diap.dataset.p ?? 0);
  let uso: Uso = raiz.dataset.uso === 'lectura' ? 'lectura' : 'presentacion';
  /** Verdadero hasta que la cámara se coloca por primera vez tras mostrarse la diapositiva. */
  let frio = true;
  let espera = 0;
  let derivaT = 0;
  /** Instante en que la cámara termina de moverse (llegada + deriva). */
  let finMovimiento = 0;

  const ponerVars = (c: Camara) => {
    camara.style.setProperty('--cam-x', `${c.x.toFixed(2)}px`);
    camara.style.setProperty('--cam-y', `${c.y.toFixed(2)}px`);
    camara.style.setProperty('--cam-s', c.s.toFixed(5));
  };

  const medir = (): Medidas | null => {
    const w = vista.clientWidth;
    const h = vista.clientHeight;
    if (w <= 0 || h <= 0 || hoja.offsetWidth <= 0) return null;
    return { vista: { w, h }, hoja: { w: hoja.offsetWidth, h: hoja.offsetHeight } };
  };

  /**
   * Caja de un elemento en píxeles de la hoja (sin escala). Se mide con los
   * rectángulos reales y se divide por la escala actual: vale igual con la
   * cámara quieta o a mitad de una animación, y con la hoja en columnas.
   */
  const cajaDe = (el: HTMLElement): Caja => {
    const h = hoja.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const k = hoja.offsetWidth > 0 ? h.width / hoja.offsetWidth : 1;
    return { x: (r.left - h.left) / k, y: (r.top - h.top) / k, w: r.width / k, h: r.height / k };
  };

  /* ───── Espera de auto-avance ───── */

  const parar = () => {
    window.clearTimeout(espera);
    espera = 0;
  };
  const pedirAvance = () => {
    espera = 0;
    if (!diap.hasAttribute('data-activa') || uso !== 'presentacion' || !avanzaSolo(p, total)) return;
    // Con la pestaña oculta o un panel abierto no se avanza, pero se sigue esperando.
    if (document.hidden || document.querySelector('dialog[open]')) {
      espera = window.setTimeout(pedirAvance, tokenMs('--mov-auto-avance', 6500));
      return;
    }
    camara.dispatchEvent(new CustomEvent('taller:avanzar', { bubbles: true }));
  };
  const programar = () => {
    parar();
    if (uso !== 'presentacion' || movimientoReducido() || !avanzaSolo(p, total) || !diap.hasAttribute('data-activa')) return;
    const restoMovimiento = Math.max(0, finMovimiento - performance.now());
    espera = window.setTimeout(pedirAvance, restoMovimiento + tokenMs('--mov-auto-avance', 6500));
  };

  /* ───── Cámara ───── */

  const colocar = (c: Camara, animar: boolean, scrollY?: number) => {
    window.clearTimeout(derivaT);
    camara.removeAttribute('data-deriva');
    if (!animar) camara.setAttribute('data-quieta', '');
    ponerVars(c);
    vista.scrollTop = scrollY ?? 0;
    if (!animar) {
      void camara.offsetWidth;
      requestAnimationFrame(() => camara.removeAttribute('data-quieta'));
    }
  };

  const aplicar = (animar: boolean): boolean => {
    const m = medir();
    if (!m) {
      frio = true;
      return false;
    }
    const reducido = movimientoReducido();
    const estado = estadoDePaso(p, total);
    const recorrido = tokenMs('--mov-recorrido', 1400);
    const autoMs = tokenMs('--mov-auto-avance', 6500);
    let derivaMs = 0;
    const indiceVisible = indice ? getComputedStyle(indice).display !== 'none' : false;

    if (estado.tipo === 'general') {
      const c = camaraGeneral(m, { ancla: indiceVisible ? ANCLA_CON_INDICE : 0.5 });
      colocar(c, animar);
    } else {
      const k = estado.indice + 1;
      const sec = secciones.get(k);
      if (!sec) return false;
      const toma = camaraSeccion(m, cajaDe(sec), { ocupacion: OCUPACION_ZOOM });
      if (reducido) {
        // Sin deriva: la cámara salta a la sección y la vista se desplaza con la rueda.
        colocar({ ...toma.inicio, y: 0 }, false, Math.max(0, -toma.inicio.y));
      } else {
        colocar(toma.inicio, animar);
        derivaMs = duracionDeriva(toma.pantallas, autoMs);
        if (derivaMs > 0) {
          derivaT = window.setTimeout(() => {
            camara.style.setProperty('--deriva-dur', `${derivaMs}ms`);
            camara.setAttribute('data-deriva', '');
            ponerVars(toma.fin);
          }, animar ? recorrido : 0);
        }
      }
    }

    doc.dataset.estado = estado.tipo;
    secciones.forEach((s, k) => {
      if (estado.tipo === 'seccion' && k === estado.indice + 1) s.setAttribute('aria-current', 'true');
      else s.removeAttribute('aria-current');
    });
    rotulos.forEach((r, k) => {
      if (estado.tipo === 'seccion' && k === estado.indice + 1) r.setAttribute('data-actual', '');
      else r.removeAttribute('data-actual');
    });
    doc.setAttribute('data-listo', '');

    finMovimiento = performance.now() + (animar ? recorrido : 0) + derivaMs;
    frio = false;
    programar();
    return true;
  };

  const anunciarPaso = () => {
    const estado = estadoDePaso(p, total);
    if (estado.tipo === 'seccion') {
      const r = rotulos.get(estado.indice + 1);
      const titulo = r?.querySelector('.rotulo__titulo')?.textContent?.trim() ?? '';
      const etiqueta = r?.querySelector('.rotulo__etiqueta')?.textContent?.trim() ?? '';
      anunciar(`Sección ${estado.indice + 1} de ${total}: ${titulo}. ${etiqueta}`);
    } else {
      anunciar('Documento completo');
    }
  };

  /* ───── Lectura: sin cámara ───── */

  const ajustarUso = () => {
    // En lectura las tablas anchas se desplazan con el teclado; en presentación nada dentro de la hoja recibe foco.
    tablas.forEach((t) => (uso === 'lectura' ? t.setAttribute('tabindex', '0') : t.removeAttribute('tabindex')));
    if (uso === 'lectura') {
      parar();
      window.clearTimeout(derivaT);
      camara.removeAttribute('data-deriva');
      ['--cam-x', '--cam-y', '--cam-s', '--deriva-dur'].forEach((v) => camara.style.removeProperty(v));
      vista.scrollTop = 0;
      doc.dataset.estado = 'general';
      doc.removeAttribute('data-listo');
      secciones.forEach((s) => s.removeAttribute('aria-current'));
      rotulos.forEach((r) => r.removeAttribute('data-actual'));
      frio = true;
    }
  };

  /* ───── Eventos ───── */

  diap.addEventListener('taller:paso', (e) => {
    const detalle = (e as CustomEvent<{ p: number; uso: Uso }>).detail;
    const usoAntes = uso;
    uso = detalle.uso;
    if (uso !== usoAntes) ajustarUso();
    if (uso === 'lectura') {
      p = detalle.p;
      return;
    }
    const cambio = detalle.p !== p;
    p = detalle.p;
    if (uso !== usoAntes) frio = true;
    const animar = !frio && cambio;
    if (aplicar(animar) && animar) anunciarPaso();
  });

  // Al salir de la diapositiva se corta la espera; al volver, la cámara se coloca sin animar.
  new MutationObserver(() => {
    if (!diap.hasAttribute('data-activa')) {
      parar();
      window.clearTimeout(derivaT);
      frio = true;
    }
  }).observe(diap, { attributes: true, attributeFilter: ['data-activa'] });

  // Tamaño de ventana, tipografías que terminan de cargar: se recoloca sin animar.
  let pendiente = 0;
  const recolocar = () => {
    if (uso !== 'presentacion' || !diap.hasAttribute('data-activa')) return;
    window.cancelAnimationFrame(pendiente);
    pendiente = window.requestAnimationFrame(() => aplicar(false));
  };
  const observador = new ResizeObserver(recolocar);
  observador.observe(vista);
  observador.observe(hoja);
  void document.fonts?.ready.then(recolocar);

  // Tras un clic con el mouse, la descarga no se queda con el foco (Espacio tiene que seguir avanzando).
  doc.addEventListener('click', (e) => {
    const enlace = (e.target as HTMLElement | null)?.closest<HTMLElement>('.documento__acciones a');
    if (enlace && e instanceof MouseEvent && e.detail > 0) window.setTimeout(() => enlace.blur(), 0);
  });

  ajustarUso();
  if (uso === 'presentacion' && diap.hasAttribute('data-activa')) recolocar();

  return { reiniciarEspera: () => espera && programar() };
}

export function iniciarTour(): void {
  document.querySelectorAll<HTMLElement>('.diap--documento').forEach((d) => {
    const c = crear(d);
    if (c) controladores.push(c);
  });
  if (controladores.length === 0) return;
  const reiniciar = () => controladores.forEach((c) => c.reiniciarEspera());
  (['keydown', 'pointerdown', 'pointermove', 'wheel', 'touchstart'] as const).forEach((tipo) =>
    document.addEventListener(tipo, reiniciar, { passive: true }),
  );
}
