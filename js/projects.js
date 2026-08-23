/* ============================================================
   Projects — scroll entrance
   Scope: the Projects section only.

   Each row animates independently: progress runs from the row
   entering low in the viewport to it settling higher up, and drives
   a fade plus a rise of --proj-rise. Progress is the only input, so
   scrolling back up reverses it, exactly like About and Capabilities.

   Hover, the stretched link and the arrow nudge are pure CSS
   (see section 6 of css/interactions.css). With
   prefers-reduced-motion this module does nothing and the rows stay
   in their designed state.
   ============================================================ */
(function () {
  'use strict';

  var FROM = 0.92; // row top enters at 92% of the viewport height
  var TO = 0.55;   // and is fully settled by 55%

  var STEPS = 32;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Keep any device mockup fitted to its panel. The panel holds the
     671 × 440 ratio at every width, so one factor covers both axes. */
  function fitDevicesIn(section) {
    Array.prototype.forEach.call(
      section.querySelectorAll('.project__media--device'),
      function (panel) {
        var scale = Math.min(1, panel.clientWidth / 671);
        panel.style.setProperty('--device-scale', scale.toFixed(4));
      }
    );
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }
  function easeOutQuad(t) { return 1 - Math.pow(1 - t, 2); }

  function init() {
    var section = document.querySelector('.projects');
    if (!section) return;

    fitDevicesIn(section);
    window.addEventListener('resize', function () { fitDevicesIn(section); });

    if (reduceMotion.matches) return;

    var rows = Array.prototype.map.call(
      section.querySelectorAll('.project'),
      function (el) { return { el: el, state: -1 }; }
    );
    if (!rows.length) return;

    var rise = parseFloat(
      getComputedStyle(rows[0].el).getPropertyValue('--proj-rise')
    ) || 0;

    var queued = false;
    var visible = true;

    section.classList.add('projects--reveal');

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) request();
      }, { rootMargin: '100% 0px' }).observe(section);
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    request();

    function request() {
      if (queued || !visible) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        paint();
      });
    }

    function paint() {
      var vh = window.innerHeight;
      var start = vh * FROM;
      var travel = vh * (FROM - TO);

      rows.forEach(function (row) {
        var raw = travel <= 0 ? 1
          : clamp01((start - row.el.getBoundingClientRect().top) / travel);
        var step = Math.round(raw * STEPS);
        if (step === row.state) return;
        row.state = step;

        var t = step / STEPS;
        row.el.style.setProperty('--reveal-in', easeOutQuad(t).toFixed(4));
        row.el.style.setProperty(
          '--reveal-y',
          ((1 - easeOutQuint(t)) * rise).toFixed(2) + 'px'
        );
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
