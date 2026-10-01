/*
 * Se ejecuta en línea en el <head>, ANTES del primer pintado: restaura el tema
 * (sistema · claro · oscuro) y resuelve el modo de uso (presentación · lectura).
 * Sin esto hay parpadeo de tema en cada carga. Es JavaScript plano y sin
 * dependencias a propósito: no pasa por el empaquetador.
 *
 * Debe mantenerse equivalente a src/lib/tema.ts y src/lib/modo.ts. El test
 * tests/unit/restaurar.test.ts lo ejecuta y lo compara con esos módulos.
 */
(function () {
  var d = document.documentElement;
  var tema = 'sistema';
  var guardadoModo = null;
  try {
    var t = localStorage.getItem('gdg-taller-tema');
    if (t === 'claro' || t === 'oscuro') tema = t;
    guardadoModo = localStorage.getItem('gdg-taller-modo');
  } catch (e) {}
  if (tema !== 'sistema') d.dataset.modo = tema;
  d.dataset.temaEstado = tema;

  var q = new URLSearchParams(location.search);
  var param = q.get('modo');
  var ok = function (v) {
    return v === 'presentacion' || v === 'lectura';
  };
  var uso = ok(param) ? param : ok(guardadoModo) ? guardadoModo : innerWidth <= 820 ? 'lectura' : 'presentacion';
  d.dataset.uso = uso;
  if (q.has('embebido')) d.dataset.embebido = '';
})();
