import type { Deck, Estado } from '../lib/tipos';
import { avanzar, diapoActual, normalizar } from '../lib/navegacion';
import { CANAL, validarMensaje, type Accion, type Mensaje } from '../lib/sincronizacion';
import { Cronometro, estadoDeTiempo, formatear, presupuestoDe, type Version } from '../lib/cronometro';

/**
 * Vista de presentador: diapositiva actual y siguiente (miniaturas incrustadas
 * de la propia presentación), notas del bloque y de la diapositiva, tiempo
 * sugerido del bloque y cronómetro. Sincronizada con la ventana principal por
 * BroadcastChannel; ver src/lib/sincronizacion.ts.
 */
interface DatosBloque {
  numero: number;
  titulo: string;
  corto: string;
  fase: number;
  tiempo30: number;
  tiempo60: number;
  notaHtml: string;
  diapos: { id: string; titulo: string; notas: string }[];
}
const datos: { deck: Deck; bloques: DatosBloque[] } = JSON.parse(document.getElementById('pres-datos')!.textContent!);
const { deck, bloques } = datos;

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const CLAVE_VERSION = 'gdg-taller-version';
const BASE_W = 1366;
const BASE_H = 768;

let version: Version = (() => {
  try {
    return localStorage.getItem(CLAVE_VERSION) === '60' ? '60' : '30';
  } catch {
    return '30';
  }
})();
let estado: Estado | null = null;
const reloj = new Cronometro();
const porBloque = new Map<number, number>();
let marca = Date.now();
let bloqueActual = -1;

const canal = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CANAL);
const enviar = (m: Mensaje) => canal?.postMessage(m);

/* ─────────────── Miniaturas ─────────────── */

const marcos = [...document.querySelectorAll<HTMLElement>('[data-marco]')];
function escalar() {
  for (const m of marcos) {
    const k = m.clientWidth / BASE_W;
    m.style.setProperty('--k', String(k));
  }
}
new ResizeObserver(escalar).observe(document.body);
marcos.forEach((m) => new ResizeObserver(escalar).observe(m));
escalar();

const iframes = {
  actual: $<HTMLIFrameElement>('[data-iframe="actual"]'),
  sig: $<HTMLIFrameElement>('[data-iframe="sig"]'),
};
const listos = new Set<string>();
for (const [nombre, f] of Object.entries(iframes)) f.addEventListener('load', () => (listos.add(nombre), pintarMiniaturas()));

function irEn(nombre: 'actual' | 'sig', s: Estado) {
  if (!listos.has(nombre)) return;
  iframes[nombre].contentWindow?.postMessage({ tipo: 'ir', b: s.b, d: s.d, p: s.p }, location.origin);
}

function pintarMiniaturas() {
  if (!estado) return;
  irEn('actual', estado);
  const sig = avanzar(deck, estado);
  irEn('sig', sig);
}

/* ─────────────── Texto: notas, bloque, tiempos ─────────────── */

function pintarTextos() {
  if (!estado) return;
  const e = normalizar(deck, estado);
  const bloque = bloques[e.b];
  const diapo = diapoActual(deck, e);
  const sig = diapoActual(deck, avanzar(deck, e));
  if (!bloque || !diapo) return;
  $('[data-id-actual]').textContent = diapo.id;
  $('[data-id-sig]').textContent = sig && sig.id !== diapo.id ? sig.id : diapo.id + (avanzar(deck, e).p !== e.p ? ' · siguiente paso' : ' · fin');
  const ficha = bloque.diapos.find((d) => d.id === diapo.id);
  $('[data-notas-diapo]').textContent = ficha?.notas ?? '';
  $('[data-notas-bloque]').innerHTML = bloque.notaHtml || '<p class="pres__vacio">Este bloque no tiene nota del expositor.</p>';
  $('[data-bloque-nombre]').textContent = `Bloque ${bloque.numero} · ${bloque.titulo}`;
  const raiz = $('[data-fase-bloque]');
  if (bloque.fase) raiz.setAttribute('data-fase', String(bloque.fase));
  else raiz.removeAttribute('data-fase');
  $('[data-estado]').textContent = `Diapositiva ${diapo.id}`;
}

function tick() {
  const ahora = Date.now();
  if (reloj.corriendo && bloqueActual >= 0) porBloque.set(bloqueActual, (porBloque.get(bloqueActual) ?? 0) + (ahora - marca));
  marca = ahora;
  $('[data-reloj]').textContent = formatear(reloj.transcurrido());
  if (estado) {
    const bloque = bloques[normalizar(deck, estado).b]!;
    const presupuesto = presupuestoDe(bloque, version);
    const usado = porBloque.get(bloque.numero) ?? 0;
    $('[data-bloque-reloj]').textContent = formatear(usado);
    $('[data-bloque-presupuesto]').textContent = `${presupuesto}′`;
    const pct = presupuesto > 0 ? Math.min(100, (usado / (presupuesto * 60_000)) * 100) : 0;
    const barra = $('[data-bloque-barra]');
    barra.style.transform = `scaleX(${pct / 100})`;
    $('.progreso').setAttribute('aria-valuenow', String(Math.round(pct)));
    $('[data-fase-bloque]').dataset.tiempo = estadoDeTiempo(usado, presupuesto);
  }
}
window.setInterval(tick, 250);

/* ─────────────── Mensajes ─────────────── */

canal?.addEventListener('message', (e) => {
  const m = validarMensaje(e.data);
  if (m?.tipo !== 'estado') return;
  const anterior = estado;
  estado = { b: m.b, d: m.d, p: m.p };
  const bloque = bloques[normalizar(deck, estado).b];
  if (bloque) bloqueActual = bloque.numero;
  // El cronómetro arranca solo con el primer avance, si no se inició a mano.
  if (anterior && !reloj.corriendo && reloj.transcurrido() === 0 && (anterior.b !== estado.b || anterior.d !== estado.d)) iniciarReloj();
  pintarMiniaturas();
  pintarTextos();
  tick();
});

function iniciarReloj() {
  reloj.iniciar();
  marca = Date.now();
  $('[data-reloj-alternar]').textContent = 'Pausar';
}
$('[data-reloj-alternar]').addEventListener('click', () => {
  if (reloj.corriendo) {
    reloj.pausar();
    $('[data-reloj-alternar]').textContent = 'Reanudar';
  } else iniciarReloj();
  tick();
});
$('[data-reloj-reiniciar]').addEventListener('click', () => {
  reloj.reiniciar();
  porBloque.clear();
  $('[data-reloj-alternar]').textContent = 'Iniciar';
  tick();
});

/* ─────────────── Versión del guion ─────────────── */

function pintarVersion() {
  document.querySelectorAll<HTMLElement>('[data-version]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.version === version)));
}
document.querySelectorAll<HTMLElement>('[data-version]').forEach((b) =>
  b.addEventListener('click', () => {
    version = b.dataset.version === '60' ? '60' : '30';
    try {
      localStorage.setItem(CLAVE_VERSION, version);
    } catch {
      /* sin almacenamiento */
    }
    pintarVersion();
    tick();
  }),
);
pintarVersion();

/* ─────────────── Mandos ─────────────── */

const comando = (accion: Accion) => enviar({ tipo: 'comando', accion });
document.querySelectorAll<HTMLElement>('[data-comando]').forEach((b) => b.addEventListener('click', () => comando(b.dataset.comando as Accion)));

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const sobreControl = e.target instanceof HTMLElement && Boolean(e.target.closest('button, a, summary, input'));
  const mapa: Record<string, Accion | undefined> = {
    ArrowRight: 'bloque-siguiente',
    ArrowLeft: 'bloque-anterior',
    ArrowDown: 'abajo',
    ArrowUp: 'arriba',
    PageDown: 'siguiente',
    PageUp: 'anterior',
    Home: 'inicio',
    End: 'fin',
  };
  let accion = mapa[e.key];
  if (e.key === ' ' && !sobreControl) accion = e.shiftKey ? 'anterior' : 'siguiente';
  if (accion) {
    e.preventDefault();
    comando(accion);
    return;
  }
  if (e.key === 'p' || e.key === 'P') $('[data-reloj-alternar]').click();
});

$('[data-abrir-principal]').addEventListener('click', () => {
  // Cuando la principal se abre, nos pide el estado con "hola" desde aquí.
  window.setTimeout(() => enviar({ tipo: 'hola' }), 1200);
});

/* ─────────────── Arranque ─────────────── */

// Se insiste con "hola" hasta que la ventana principal responda (puede estar abriéndose o en segundo plano).
enviar({ tipo: 'hola' });
const insistir = window.setInterval(() => {
  if (estado) window.clearInterval(insistir);
  else enviar({ tipo: 'hola' });
}, 700);
window.setTimeout(() => {
  if (!estado) $('[data-estado]').textContent = 'No encuentro la presentación principal. Ábrela con el botón o pulsa S desde ella.';
}, 3000);
tick();
