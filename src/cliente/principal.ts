import type { Deck, Estado } from '../lib/tipos';
import {
  abajoEnBloque,
  arribaEnBloque,
  avanzar,
  bloqueAnterior,
  bloqueSiguiente,
  diapoActual,
  iguales,
  indiceLineal,

  normalizar,
  primera,
  retroceder,
  total,
  ultima,
} from '../lib/navegacion';
import { aHash, desdeHash } from '../lib/hash';
import { CLAVE_MODO, alternarModo, type ModoUso } from '../lib/modo';
import { aplicarTema, guardarTema, leerTema, siguienteTema, temaEfectivo, type EstadoTema } from '../lib/tema';
import { clasificarGesto } from '../lib/gestos';
import { crearFiltroRueda } from '../lib/rueda';

import { movimientoReducido } from './ambiente';
import { iniciarFondo } from './fondo';
import { activarTipeo, restaurarTipeo } from './tipeo';
import { iniciarCopiar } from './copiar';
import { iniciarVideos } from './video';
import { anunciar } from './anuncio';
import { iniciarTour } from './tour';
import { iniciarSincronizacion, type Sincronizacion } from './sincronizacion';
import type { Accion } from '../lib/sincronizacion';

const raiz = document.documentElement;
const deck: Deck = JSON.parse(document.getElementById('deck-meta')!.textContent!);
const todas = [...document.querySelectorAll<HTMLElement>('.diap')];
const porId = new Map(todas.map((el) => [el.dataset.id!, el]));
const elDe = (s: Estado): HTMLElement | undefined => {
  const d = diapoActual(deck, normalizar(deck, s));
  return d ? porId.get(d.id) : undefined;
};

let estado: Estado = desdeHash(deck, location.hash);
let uso: ModoUso = raiz.dataset.uso === 'lectura' ? 'lectura' : 'presentacion';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s);
const $$ = <T extends HTMLElement = HTMLElement>(s: string, ctx: ParentNode = document) => [...ctx.querySelectorAll<T>(s)];

const embebido = raiz.hasAttribute('data-embebido');
// Las miniaturas de la vista de presentador no necesitan fondo vivo.
const fondo = embebido ? { refrescarColores() {} } : iniciarFondo($<HTMLCanvasElement>('[data-red]')!);
let sync: Sincronizacion | undefined;

/* ───────────────────────── Pie, fases y anuncios ───────────────────────── */

function faseDe(s: Estado): number {
  const el = elDe(s);
  return Number(el?.dataset.fase ?? 0);
}

function actualizarMarco() {
  const el = elDe(estado);
  const fase = faseDe(estado);
  if (fase) raiz.dataset.fase = String(fase);
  else delete raiz.dataset.fase;
  $$('[data-fase-link]').forEach((a) => {
    const n = Number(a.dataset.faseLink);
    if (n === fase) a.setAttribute('aria-current', 'step');
    else a.removeAttribute('aria-current');
  });
  const lineal = indiceLineal(deck, estado);
  const t = total(deck);
  $('[data-numero-id]')!.textContent = el?.dataset.id ?? '';
  $('[data-numero-lineal]')!.textContent = String(lineal);
  $('[data-numero-total]')!.textContent = String(t);
  const pct = t > 1 ? ((lineal - 1) / (t - 1)) * 100 : 100;
  const barra = $('.progreso__barra');
  if (barra && uso === 'presentacion') barra.style.transform = `scaleX(${pct / 100})`;
  $('.progreso')?.setAttribute('aria-valuenow', String(Math.round(pct)));
  fondo.refrescarColores();
  sync?.publicar();
}

/* ───────────────────────── Pasos de revelado ───────────────────────── */

function aplicarPasos(el: HTMLElement | undefined, p: number) {
  if (!el) return;
  el.dataset.p = String(p);
  // Los tipos con animación propia (recorrido de documentos) escuchan este evento.
  el.dispatchEvent(new CustomEvent('taller:paso', { bubbles: true, detail: { p, uso } }));
  $$('[data-paso]', el).forEach((x) => {
    if (Number(x.dataset.paso) <= p) x.setAttribute('data-visto', '');
    else x.removeAttribute('data-visto');
  });
}

/* ───────────────────────── Navegación ───────────────────────── */

function actualizarHash() {
  const h = aHash(deck, estado);
  if (location.hash !== h) history.replaceState(null, '', `${location.pathname}${location.search}${h}`);
}

function direccion(antes: Estado, ahora: Estado): string {
  if (ahora.b !== antes.b) return ahora.b > antes.b ? 'bloque-sig' : 'bloque-ant';
  if (ahora.d !== antes.d) return ahora.d > antes.d ? 'sig' : 'ant';
  return 'sig';
}

function ir(destino: Estado, opciones: { dir?: string; sinHash?: boolean } = {}) {
  const antes = estado;
  estado = normalizar(deck, destino);
  if (iguales(antes, estado)) return;
  const cambio = antes.b !== estado.b || antes.d !== estado.d;
  if (uso === 'presentacion') mostrar(antes, cambio, opciones.dir ?? direccion(antes, estado));
  else if (cambio) irALectura(estado);
  actualizarMarco();
  if (!opciones.sinHash) actualizarHash();
  if (cambio) {
    const el = elDe(estado);
    const titulo = el?.querySelector('h1, h2, h3')?.textContent?.trim();
    anunciar(`Diapositiva ${el?.dataset.id}${titulo ? ': ' + titulo : ''}`);
  }
}

function mostrar(antes: Estado, cambio: boolean, dir: string) {
  const nueva = elDe(estado);
  if (cambio) {
    const previa = elDe(antes);
    if (previa && previa !== nueva) {
      previa.removeAttribute('data-activa');
      previa.setAttribute('data-saliendo', '');
      restaurarTipeo(previa);
      window.setTimeout(() => previa.removeAttribute('data-saliendo'), 320);
    }
    if (nueva) {
      nueva.dataset.dir = dir;
      nueva.setAttribute('data-activa', '');
      activarTipeo(nueva);
    }
  }
  aplicarPasos(nueva, estado.p);
}

function irALectura(s: Estado, suave = true) {
  let el = elDe(s);
  if (el?.dataset.tipo === 'apertura') el = el.closest<HTMLElement>('.bloque') ?? el;
  if (!el) return;
  const comportamiento: ScrollBehavior = suave && !movimientoReducido() ? 'smooth' : 'auto';
  el.scrollIntoView({ behavior: comportamiento, block: 'start' });
}

const sig = () => ir(avanzar(deck, estado));
// Un componente puede pedir avanzar un paso (auto-avance del recorrido). Solo vale si su diapositiva es la actual.
document.addEventListener('taller:avanzar', (e) => {
  const origen = e.target as HTMLElement | null;
  if (uso === 'presentacion' && origen?.closest('.diap') === elDe(estado)) sig();
});
const ant = () => ir(retroceder(deck, estado));

/* ───────────────────────── Modo de uso ───────────────────────── */

function guardarModo(m: ModoUso) {
  try {
    localStorage.setItem(CLAVE_MODO, m);
  } catch {
    /* sin almacenamiento: vale para esta sesión */
  }
}

function aplicarUso(nuevo: ModoUso, persistir = true) {
  uso = nuevo;
  raiz.dataset.uso = nuevo;
  if (persistir) guardarModo(nuevo);
  const boton = $('[data-accion="modo"]');
  if (boton) {
    boton.setAttribute('aria-pressed', String(nuevo === 'lectura'));
    boton.setAttribute('aria-label', nuevo === 'lectura' ? 'Pasar a modo presentación (L)' : 'Pasar a modo lectura (L)');
    boton.title = nuevo === 'lectura' ? 'Modo presentación (L)' : 'Modo lectura (L)';
  }
  todas.forEach((el) => {
    el.removeAttribute('data-activa');
    el.removeAttribute('data-saliendo');
    if (nuevo === 'lectura') restaurarTipeo(el);
  });
  if (nuevo === 'presentacion') {
    const el = elDe(estado);
    if (el) {
      el.dataset.dir = 'sig';
      el.setAttribute('data-activa', '');
      activarTipeo(el);
    }
    aplicarPasos(el, estado.p);
    window.scrollTo(0, 0);
  } else {
    todas.forEach((el) => aplicarPasos(el, Number(el.dataset.pasos)));
    requestAnimationFrame(() => irALectura(estado, false));
  }
  actualizarMarco();
  anunciar(nuevo === 'lectura' ? 'Modo lectura' : 'Modo presentación');
}

/* ───────────────────────── Lectura: qué diapositiva se ve ───────────────────────── */

const observador = new IntersectionObserver(
  (entradas) => {
    if (uso !== 'lectura') return;
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const id = (e.target as HTMLElement).dataset.id!;
      const b = deck.bloques.findIndex((x) => x.diapos.some((d) => d.id === id));
      const d = deck.bloques[b]?.diapos.findIndex((x) => x.id === id) ?? 0;
      estado = { b, d, p: 0 };
      actualizarMarco();
      actualizarHash();
    }
  },
  { rootMargin: '-30% 0px -65% 0px', threshold: 0 },
);
todas.forEach((el) => observador.observe(el));

function progresoLectura() {
  if (uso !== 'lectura') return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  const barra = $('.progreso__barra');
  if (barra) barra.style.transform = `scaleX(${pct})`;
}
window.addEventListener('scroll', progresoLectura, { passive: true });

/* ───────────────────────── Tema ───────────────────────── */

const mqOscuro = window.matchMedia('(prefers-color-scheme: dark)');
let tema: EstadoTema = leerTema(safeStorage());

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function pintarBotonTema() {
  const boton = $('[data-accion="tema"]');
  if (!boton) return;
  const nombres: Record<EstadoTema, string> = { sistema: 'sistema', claro: 'claro', oscuro: 'oscuro' };
  boton.dataset.tema = tema;
  boton.setAttribute('aria-label', `Tema: ${nombres[tema]} (T)`);
  boton.title = `Tema: ${nombres[tema]} — pulsa para cambiar (T)`;
}

function cambiarTema(siguiente: EstadoTema, origen?: HTMLElement | null) {
  tema = siguiente;
  const aplicar = () => {
    aplicarTema(raiz, tema);
    guardarTema(safeStorage(), tema);
    pintarBotonTema();
    fondo.refrescarColores();
  };
  anunciar(`Tema ${tema === 'sistema' ? 'del sistema (' + temaEfectivo(tema, mqOscuro.matches) + ')' : tema}`);
  const vt = (document as any).startViewTransition as undefined | ((fn: () => void) => { finished: Promise<void> });
  if (vt && !movimientoReducido()) {
    const r = origen?.getBoundingClientRect();
    raiz.style.setProperty('--vt-x', `${r ? r.left + r.width / 2 : window.innerWidth / 2}px`);
    raiz.style.setProperty('--vt-y', `${r ? r.top + r.height / 2 : 0}px`);
    raiz.dataset.vt = 'tema';
    // Si el navegador tarda en producir el cuadro (pestaña en segundo plano), el
    // estado se aplica igual: la transición es adorno, el tema no puede depender de ella.
    let hecho = false;
    const una = () => {
      if (hecho) return;
      hecho = true;
      aplicar();
    };
    const t = vt.call(document, una);
    window.setTimeout(una, 350);
    void t.finished.finally(() => delete raiz.dataset.vt);
  } else {
    raiz.classList.add('cambiando-tema');
    aplicar();
    window.setTimeout(() => raiz.classList.remove('cambiando-tema'), 400);
  }
}
mqOscuro.addEventListener('change', () => fondo.refrescarColores());

/* ───────────────────────── Paneles, pantalla completa, atajos ───────────────────────── */

const vistaGeneral = $<HTMLDialogElement>('#vista-general')!;
const ayuda = $<HTMLDialogElement>('#ayuda')!;
let retornoFoco: HTMLElement | null = null;

function abrir(dlg: HTMLDialogElement) {
  retornoFoco = document.activeElement as HTMLElement | null;
  if (!dlg.open) dlg.showModal();
  if (dlg === vistaGeneral) {
    const actual = dlg.querySelector<HTMLElement>(`[data-ir="${aHash(deck, estado).slice(2)}"]`);
    actual?.setAttribute('aria-current', 'true');
    dlg.querySelectorAll('[aria-current]').forEach((x) => x !== actual && x.removeAttribute('aria-current'));
    actual?.focus({ preventScroll: false });
  }
}
function cerrar(dlg: HTMLDialogElement) {
  if (dlg.open) dlg.close();
}
[vistaGeneral, ayuda].forEach((d) => {
  d.addEventListener('close', () => retornoFoco?.focus?.());
  d.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === d || t.closest('[data-cerrar-panel]')) cerrar(d);
    const enlace = t.closest<HTMLAnchorElement>('[data-ir]');
    if (enlace) {
      cerrar(d);
    }
  });
});

function alternarVistaGeneral() {
  if (vistaGeneral.open) cerrar(vistaGeneral);
  else abrir(vistaGeneral);
}

function pantallaCompleta() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void raiz.requestFullscreen?.().catch(() => {});
}

function hayPanelAbierto(): boolean {
  return Boolean(document.querySelector('dialog[open]'));
}

const ACCIONES: Record<string, (origen: HTMLElement) => void> = {
  'vista-general': alternarVistaGeneral,
  modo: () => aplicarUso(alternarModo(uso)),
  tema: (o) => cambiarTema(siguienteTema(tema), o),
  'pantalla-completa': pantallaCompleta,
  ayuda: () => abrir(ayuda),
  anterior: ant,
  siguiente: sig,
  presentador: () => sync?.abrirPresentador(),
};

document.addEventListener('click', (e) => {
  const boton = (e.target as HTMLElement).closest<HTMLElement>('[data-accion]');
  if (!boton) return;
  ACCIONES[boton.dataset.accion!]?.(boton);
  // Tras un clic con el mouse se suelta el foco para que Espacio siga avanzando.
  if (e instanceof MouseEvent && e.detail > 0 && boton.dataset.accion !== 'ayuda') boton.blur();
});

function esCampoDeTexto(el: EventTarget | null): boolean {
  return el instanceof HTMLElement && Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));
}

document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (esCampoDeTexto(e.target)) return;
  const k = e.key;
  const sobreControl = e.target instanceof HTMLElement && Boolean(e.target.closest('button, a, summary'));
  const panel = hayPanelAbierto();

  // Atajos que valen en cualquier modo.
  switch (k) {
    case 'o':
    case 'O':
      e.preventDefault();
      return alternarVistaGeneral();
    case 'Escape':
      if (!panel) {
        e.preventDefault();
        abrir(vistaGeneral);
      }
      return;
    case 't':
    case 'T':
      e.preventDefault();
      return cambiarTema(siguienteTema(tema), $('[data-accion="tema"]'));
    case 'f':
    case 'F':
      e.preventDefault();
      return pantallaCompleta();
    case 'l':
    case 'L':
      e.preventDefault();
      return aplicarUso(alternarModo(uso));
    case '?':
      e.preventDefault();
      return abrir(ayuda);
    case 's':
    case 'S':
      e.preventDefault();
      return sync?.abrirPresentador();
  }

  // La navegación por diapositivas solo existe en modo presentación.
  if (uso !== 'presentacion' || panel) return;
  switch (k) {
    case 'ArrowRight':
      e.preventDefault();
      return ir(bloqueSiguiente(deck, estado));
    case 'ArrowLeft':
      e.preventDefault();
      return ir(bloqueAnterior(deck, estado));
    case 'ArrowDown':
      e.preventDefault();
      return ir(abajoEnBloque(deck, estado));
    case 'ArrowUp':
      e.preventDefault();
      return ir(arribaEnBloque(deck, estado));
    case 'PageDown':
      e.preventDefault();
      return sig();
    case 'PageUp':
      e.preventDefault();
      return ant();
    case ' ':
      if (sobreControl) return;
      e.preventDefault();
      return e.shiftKey ? ant() : sig();
    case 'Home':
      e.preventDefault();
      return ir(primera(deck));
    case 'End':
      e.preventDefault();
      return ir(ultima(deck));
  }
});

/* ───────────────────────── Rueda, táctil ───────────────────────── */

const filtroRueda = crearFiltroRueda();

function puedeScrollear(inicio: EventTarget | null, dy: number): boolean {
  let el = inicio instanceof HTMLElement ? inicio : null;
  while (el && el !== document.body) {
    const sobra = el.scrollHeight - el.clientHeight > 2;
    const oy = getComputedStyle(el).overflowY;
    if (sobra && (oy === 'auto' || oy === 'scroll')) {
      if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      if (dy < 0 && el.scrollTop > 0) return true;
    }
    el = el.parentElement;
  }
  return false;
}

document.addEventListener(
  'wheel',
  (e) => {
    if (uso !== 'presentacion' || hayPanelAbierto() || e.ctrlKey) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    if (Math.abs(dy) < Math.abs(e.deltaX)) return;
    if (puedeScrollear(e.target, dy)) return;
    e.preventDefault();
    const dir = filtroRueda(dy, performance.now());
    if (dir === 1) sig();
    else if (dir === -1) ant();
  },
  { passive: false },
);

let toque: { x: number; y: number; t: number; scroll: boolean; scrollAbajo: boolean; scrollArriba: boolean } | null = null;
document.addEventListener(
  'touchstart',
  (e) => {
    if (uso !== 'presentacion' || e.touches.length !== 1 || hayPanelAbierto()) return (toque = null);
    const t = e.touches[0]!;
    const objetivo = e.target as HTMLElement;
    if (objetivo.closest('input, textarea, select, [data-no-swipe]')) return (toque = null);
    toque = {
      x: t.clientX,
      y: t.clientY,
      t: performance.now(),
      scroll: false,
      scrollAbajo: puedeScrollear(objetivo, 1),
      scrollArriba: puedeScrollear(objetivo, -1),
    };
  },
  { passive: true },
);
document.addEventListener(
  'touchend',
  (e) => {
    if (!toque || uso !== 'presentacion') return;
    const t = e.changedTouches[0]!;
    const g = clasificarGesto(t.clientX - toque.x, t.clientY - toque.y, performance.now() - toque.t);
    const { scrollAbajo, scrollArriba } = toque;
    toque = null;
    if (g === 'izquierda') ir(bloqueSiguiente(deck, estado));
    else if (g === 'derecha') ir(bloqueAnterior(deck, estado));
    else if (g === 'arriba' && !scrollAbajo) sig();
    else if (g === 'abajo' && !scrollArriba) ant();
  },
  { passive: true },
);

/* ───────────────────────── Marco que se esconde (modo presentación) ───────────────────────── */

let temporizadorOcio = 0;
function despertar() {
  raiz.removeAttribute('data-ocioso');
  window.clearTimeout(temporizadorOcio);
  temporizadorOcio = window.setTimeout(() => {
    if (uso === 'presentacion' && !hayPanelAbierto()) raiz.setAttribute('data-ocioso', '');
  }, 3200);
}
['pointermove', 'pointerdown', 'keydown', 'focusin', 'touchstart'].forEach((ev) => document.addEventListener(ev, despertar, { passive: true }));

/* ───────────────────────── Arranque ───────────────────────── */

window.addEventListener('hashchange', () => {
  const destino = desdeHash(deck, location.hash);
  if (aHash(deck, destino) === aHash(deck, estado)) return;
  ir(destino, { sinHash: true });
});

document.addEventListener('fullscreenchange', () => {
  $('[data-accion="pantalla-completa"]')?.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
});
if (!document.fullscreenEnabled) $('[data-accion="pantalla-completa"]')?.setAttribute('hidden', '');

pintarBotonTema();
aplicarUso(uso, false);
// La primera vez la diapositiva ya está en su sitio: sin anuncio ni animación de salida.
actualizarHash();
iniciarCopiar();
iniciarVideos();
iniciarTour();

const ACCIONES_REMOTAS: Record<Accion, () => void> = {
  siguiente: sig,
  anterior: ant,
  'bloque-siguiente': () => ir(bloqueSiguiente(deck, estado)),
  'bloque-anterior': () => ir(bloqueAnterior(deck, estado)),
  abajo: () => ir(abajoEnBloque(deck, estado)),
  arriba: () => ir(arribaEnBloque(deck, estado)),
  inicio: () => ir(primera(deck)),
  fin: () => ir(ultima(deck)),
};
sync = iniciarSincronizacion(
  {
    estado: () => estado,
    id: () => elDe(estado)?.dataset.id ?? '',
    accion: (a) => {
      if (uso === 'presentacion') ACCIONES_REMOTAS[a]();
    },
    ir: (s) => ir(s, { sinHash: true }),
  },
  embebido,
);
sync.publicar();
despertar();
$('#principal')?.setAttribute('data-listo', '');
raiz.dataset.listo = '';

