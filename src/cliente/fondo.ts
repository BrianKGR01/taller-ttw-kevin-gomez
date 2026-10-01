import { movimientoReducido, alCambiarMovimiento, resolverColor } from './ambiente';

/**
 * Red de nodos y conexiones (tipo red neuronal) que reacciona levemente al
 * cursor. Pensada para ser casi imperceptible detrás del texto y no bajar el
 * rendimiento en celulares de gama media: pocos nodos, 30 cuadros por segundo,
 * resolución capada y pausa cuando la pestaña no se ve. Ver ADR-007.
 */
interface Nodo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export interface Fondo {
  refrescarColores(): void;
}

export function iniciarFondo(canvas: HTMLCanvasElement): Fondo {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { refrescarColores() {} };

  const chico = window.matchMedia('(max-width: 820px)').matches;
  const dprMax = chico ? 1 : 1.5;
  const cuadro = 1000 / 30;

  let ancho = 0;
  let alto = 0;
  let dpr = 1;
  let nodos: Nodo[] = [];
  let colorNodo = 'rgb(66 133 244)';
  let colorLinea = 'rgb(150 150 150)';
  let puntero: { x: number; y: number } | null = null;
  let ultimo = 0;
  let corriendo = false;

  function refrescarColores() {
    colorNodo = resolverColor('var(--fase-actual)');
    colorLinea = resolverColor('var(--tinta-suave)');
    if (!corriendo) dibujar();
  }

  function redimensionar() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cantidad = Math.max(14, Math.min(chico ? 30 : 64, Math.round((ancho * alto) / (chico ? 30000 : 24000))));
    nodos = Array.from({ length: cantidad }, () => ({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      r: 1.2 + Math.random() * 1.4,
    }));
    dibujar();
  }

  function paso(dt: number) {
    for (const n of nodos) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < -20) n.x = ancho + 20;
      else if (n.x > ancho + 20) n.x = -20;
      if (n.y < -20) n.y = alto + 20;
      else if (n.y > alto + 20) n.y = -20;
      if (puntero) {
        const dx = puntero.x - n.x;
        const dy = puntero.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000 && d2 > 1) {
          // Atracción leve hacia el cursor: la red "se asoma".
          const f = (1 - d2 / 22000) * 6 * dt;
          n.x += dx * f * 0.06;
          n.y += dy * f * 0.06;
        }
      }
    }
  }

  function dibujar() {
    ctx!.clearRect(0, 0, ancho, alto);
    const maxD = Math.min(ancho, alto) * (chico ? 0.3 : 0.2);
    const maxD2 = maxD * maxD;
    ctx!.lineWidth = 1;
    ctx!.strokeStyle = colorLinea;
    for (let i = 0; i < nodos.length; i++) {
      const a = nodos[i]!;
      for (let j = i + 1; j < nodos.length; j++) {
        const b = nodos[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxD2) {
          ctx!.globalAlpha = (1 - d2 / maxD2) * 0.5;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }
    if (puntero) {
      ctx!.strokeStyle = colorNodo;
      for (const n of nodos) {
        const dx = puntero.x - n.x;
        const dy = puntero.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          ctx!.globalAlpha = (1 - d2 / 26000) * 0.7;
          ctx!.beginPath();
          ctx!.moveTo(n.x, n.y);
          ctx!.lineTo(puntero.x, puntero.y);
          ctx!.stroke();
        }
      }
    }
    ctx!.globalAlpha = 0.9;
    ctx!.fillStyle = colorNodo;
    for (const n of nodos) {
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
  }

  function bucle(t: number) {
    if (!corriendo) return;
    requestAnimationFrame(bucle);
    if (t - ultimo < cuadro) return;
    const dt = Math.min((t - ultimo) / 1000, 0.1);
    ultimo = t;
    paso(dt);
    dibujar();
  }

  function arrancar() {
    if (corriendo || movimientoReducido() || document.hidden) return;
    corriendo = true;
    ultimo = performance.now();
    requestAnimationFrame(bucle);
  }

  function detener() {
    corriendo = false;
  }

  window.addEventListener('resize', redimensionar, { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      puntero = { x: e.clientX, y: e.clientY };
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => (puntero = null));
  document.addEventListener('visibilitychange', () => (document.hidden ? detener() : arrancar()));
  alCambiarMovimiento(() => (movimientoReducido() ? detener() : arrancar()));

  refrescarColores();
  redimensionar();
  arrancar();

  return { refrescarColores };
}
