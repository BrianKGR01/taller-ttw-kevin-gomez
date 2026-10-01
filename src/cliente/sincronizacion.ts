import type { Estado } from '../lib/tipos';
import { CANAL, validarMensaje, type Accion, type Mensaje } from '../lib/sincronizacion';
import { anunciar } from './anuncio';

/**
 * Lado "ventana principal" de la vista de presentador. Publica la posición cada
 * vez que cambia, atiende los comandos que llegan del presentador y, cuando la
 * página está incrustada como miniatura (`?embebido`), obedece mensajes `ir`.
 * La posición es la fuente de verdad de la ventana principal; el presentador
 * solo la refleja y puede pedir movimientos.
 */
export interface ApiSincronizacion {
  estado(): Estado;
  id(): string;
  accion(a: Accion): void;
  ir(s: Estado): void;
}

export interface Sincronizacion {
  publicar(): void;
  abrirPresentador(): void;
}

const VENTANA = 'taller-presentador';
let ventana: Window | null = null;

export function iniciarSincronizacion(api: ApiSincronizacion, embebido: boolean): Sincronizacion {
  if (embebido) {
    window.addEventListener('message', (e) => {
      if (e.origin !== location.origin) return;
      const m = validarMensaje(e.data);
      if (m?.tipo === 'ir') api.ir({ b: m.b, d: m.d, p: m.p });
    });
    return { publicar() {}, abrirPresentador() {} };
  }

  const canal = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CANAL);

  function publicar() {
    const s = api.estado();
    const msg: Mensaje = { tipo: 'estado', b: s.b, d: s.d, p: s.p, id: api.id() };
    canal?.postMessage(msg);
  }

  canal?.addEventListener('message', (e) => {
    const m = validarMensaje(e.data);
    if (!m) return;
    if (m.tipo === 'comando') api.accion(m.accion);
    else if (m.tipo === 'hola') publicar();
  });

  function abrirPresentador() {
    if (ventana && !ventana.closed) {
      ventana.focus();
      return;
    }
    ventana = window.open('/presentador/', VENTANA, 'popup=yes,width=1280,height=760');
    if (!ventana) anunciar('El navegador bloqueó la ventana del presentador. Permite las ventanas emergentes para este sitio.');
  }

  return { publicar, abrirPresentador };
}
