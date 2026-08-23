/* ============================================================
   Capabilities — scroll-driven reveal
   Scope: the Capabilities section only.

   Progress runs from the divider entering from the bottom of the
   viewport to it settling in the upper area, and progress alone decides
   everything:

     · divider  0 → 45%   draws left to right on a smootherstep curve
     · title    22.5 → 55%   fades in and rises 56px into place
     · labels   from 50%, one every 6%, each fading in and rising 12px

   The title starts once the line is half drawn, and the first label
   waits until the title is ~87% arrived. No timers, no loops —
   scrolling back up reverses the state exactly. With
   prefers-reduced-motion the module does nothing, leaving the static
   Figma design.
   ============================================================ */
(function () {
  'use strict';

  /* Choreography ------------------------------------------------------- */
  var DIVIDER_END = 0.45;  // the stroke gets ~300px of scroll to travel

  var TITLE_FROM = DIVIDER_END * 0.5; // divider at half length
  var TITLE_TO = 0.55;

  var SKILL_FROM = 0.50;   // title is ~87% arrived by here
  var SKILL_STEP = 0.06;   // gap between labels
  var SKILL_WINDOW = 0.16; // one label's own reveal

  var STEPS = 32; // quantisation, so we only write on real change

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }
  function easeOutQuad(t) { return 1 - Math.pow(1 - t, 2); }

  /* Smootherstep: zero velocity at both ends, fluid through the middle.
     The stroke eases out of a standstill, travels, then settles instead
     of running at one mechanical rate. Symmetric, so it still passes
     exactly through half length at half of its span — which is what the
     title's start point is tied to. */
  function drawEase(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  function init() {
    var section = document.querySelector('.capabilities');
    var rule = section && section.querySelector('.capabilities__rule');
    var title = section && section.querySelector('.capabilities__label');
    if (!section || !rule || !title) return;
    if (reduceMotion.matches) return;

    var labels = Array.prototype.map.call(
      section.querySelectorAll('.capabilities__row p'),
      function (el, i) {
        var from = SKILL_FROM + i * SKILL_STEP;
        return {
          el: el,
          from: from,
          window: Math.min(SKILL_WINDOW, Math.max(0.04, 1 - from)),
          state: -1
        };
      }
    );

    var drawState = -1;
    var titleState = -1;
    var queued = false;
    var visible = true;

    section.classList.add('capabilities--reveal');

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
        paint(progress());
      });
    }

    /* Anchored on the divider itself rather than the section, so the
       stroke starts only once the line has entered from the bottom and
       finishes while it is still comfortably in view — the whole draw
       happens in front of the reader. */
    function progress() {
      var vh = window.innerHeight;
      var start = vh * 0.88;   // line just entering from below
      var end = vh * 0.22;     // line settled in the upper area
      var travel = start - end;
      return travel <= 0 ? 1
        : clamp01((start - rule.getBoundingClientRect().top) / travel);
    }

    function paint(p) {
      paintDivider(p);
      paintTitle(p);
      paintLabels(p);
    }

    /* Scroll drives it directly; drawEase shapes how the tip travels. */
    function paintDivider(p) {
      var step = Math.round(clamp01(p / DIVIDER_END) * STEPS);
      if (step === drawState) return;
      drawState = step;
      rule.style.setProperty('--draw', drawEase(step / STEPS).toFixed(4));
    }

    function paintTitle(p) {
      var raw = clamp01((p - TITLE_FROM) / (TITLE_TO - TITLE_FROM));
      var step = Math.round(raw * STEPS);
      if (step === titleState) return;
      titleState = step;

      var t = step / STEPS;
      title.style.setProperty('--in', easeOutQuad(t).toFixed(4));
      title.style.setProperty(
        '--rise',
        ((1 - easeOutQuint(t)) * riseOf(title, '--caps-title-rise')).toFixed(2) + 'px'
      );
    }

    function paintLabels(p) {
      labels.forEach(function (item) {
        var raw = clamp01((p - item.from) / item.window);
        var step = Math.round(raw * STEPS);
        if (step === item.state) return;
        item.state = step;

        var t = step / STEPS;
        item.el.style.setProperty('--in', easeOutQuad(t).toFixed(4));
        item.el.style.setProperty(
          '--rise',
          ((1 - easeOutQuint(t)) * riseOf(item.el, '--caps-skill-rise')).toFixed(2) + 'px'
        );
      });
    }
  }

  /* Travel distance stays a CSS token; read it once per element. */
  var riseCache = {};
  function riseOf(el, token) {
    if (riseCache[token] === undefined) {
      riseCache[token] = parseFloat(
        getComputedStyle(el).getPropertyValue(token)
      ) || 0;
    }
    return riseCache[token];
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
