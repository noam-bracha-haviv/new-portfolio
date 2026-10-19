/* ============================================================
   "Get in touch": slide to send
   Scope: the contact pill only.

   The envelope disc can be dragged right to left inside the pill,
   like sliding to answer a call. Past the threshold it settles at
   the end and opens the existing mailto: link; short of it, it
   springs back. A plain click, tap or Enter plays the same slide
   on its own and then opens the email, so nobody has to discover
   the drag to get there.
   ============================================================ */
(function () {
  'use strict';

  var THRESHOLD = 0.7;   /* share of the track that counts as "sent" */
  var DEAD_ZONE = 4;     /* px of movement before a press counts as a drag */
  var AUTO_MS = 300;     /* click/tap slide; keep in step with css/interactions.css */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    var pill = document.querySelector('.btn-touch');
    var knob = pill && pill.querySelector('.btn-touch__icon');
    if (!pill || !knob || !window.PointerEvent) return;

    var dragging = false;
    var busy = false;      /* a slide is finishing; ignore new input until reset */
    var moved = false;
    var suppressClick = false;
    var startX = 0;
    var travel = 0;
    var offset = 0;

    function setOffset(px) {
      offset = px;
      pill.style.setProperty('--slide', px + 'px');
      pill.style.setProperty('--slide-p', travel ? (px / travel).toFixed(3) : 0);
    }

    /* Distance from the disc's resting place to the same inset on the left.
       Layout offsets ignore translate and scale, so a grab mid-spring-back
       still measures the full track. */
    function measureTravel() {
      var inset = pill.clientWidth - knob.offsetLeft - knob.offsetWidth;
      return Math.max(0, knob.offsetLeft - inset);
    }

    function reset() {
      pill.classList.remove('is-sent', 'is-auto');
      setOffset(0);
      busy = false;
    }

    /* Hold the disc at the end, open the email, then return to rest */
    function send(delay) {
      busy = true;
      window.setTimeout(function () {
        window.location.href = pill.href;
        window.setTimeout(reset, 700);
      }, delay);
    }

    function onDown(e) {
      if (e.button !== 0 || busy) return;
      e.preventDefault();               /* no text selection or native link drag */
      travel = measureTravel();
      startX = e.clientX;
      dragging = true;
      moved = false;
      knob.setPointerCapture(e.pointerId);
      pill.classList.add('is-sliding');
    }

    function onMove(e) {
      if (!dragging) return;
      var dx = startX - e.clientX;
      if (!moved && Math.abs(dx) < DEAD_ZONE) return;
      moved = true;
      setOffset(Math.min(Math.max(dx, 0), travel));
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      pill.classList.remove('is-sliding');
      if (!moved) return;               /* a plain press: let the click through */

      /* Swallow only the click that this release may produce */
      suppressClick = true;
      window.setTimeout(function () { suppressClick = false; }, 0);

      if (travel && offset / travel >= THRESHOLD) {
        pill.classList.add('is-sent');
        setOffset(travel);
        send(reduceMotion.matches ? 0 : 180);
      } else {
        reset();
      }
    }

    knob.addEventListener('pointerdown', onDown);
    knob.addEventListener('pointermove', onMove);
    knob.addEventListener('pointerup', onEnd);
    knob.addEventListener('pointercancel', onEnd);
    knob.addEventListener('lostpointercapture', onEnd);
    knob.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* Clicks: a finished drag swallows its own click; any other click,
       tap or Enter plays the slide and opens the email at the end. */
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (busy || dragging) return;

      travel = measureTravel();
      pill.classList.add('is-auto');
      setOffset(travel);
      send(reduceMotion.matches ? 0 : AUTO_MS);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
