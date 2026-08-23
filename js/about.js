/* ============================================================
   About — scroll-driven read-along
   Scope: the About section only.

   The section pins for --about-reveal of scroll distance. That
   distance is normalised to progress 0…1, and progress alone
   decides everything:

     · words   turn from --c-word-unread to --c-word-read, one after
               another, each over a short overlapping window
     · emoji   fade + scale into place at 10 / 25 / 45 / 70 / 90 %

   No timers and no easing over time — scrolling back up reverses the
   state exactly. With prefers-reduced-motion the module does nothing,
   leaving the static Figma design.
   ============================================================ */
(function () {
  'use strict';

  /* Reveal choreography ------------------------------------------------ */
  var TEXT_END = 0.94;   // paragraph finishes slightly before the unpin
  var WORD_WINDOW = 0.055; // progress a single word takes to turn
  var EMOJI_WINDOW = 0.12;   // +33%: a slower, more relaxed arrival

  var EMOJI_AT = {
    'about__emoji--detective': 0.10,
    'about__emoji--sparkles': 0.25,
    'about__emoji--bee': 0.45,
    'about__emoji--grad': 0.70,
    'about__emoji--laptop': 0.90
  };

  /* Unread → read colour, interpolated per word */
  var UNREAD = { c: 85, a: 0.46 };
  var READ = { c: 0, a: 1 };

  var STEPS = 32; // alpha quantisation, so we only write on real change
  var PIN_FROM = 1024; // below this the reveal runs without pinning

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canPin = window.matchMedia('(min-width: ' + PIN_FROM + 'px)');

  /* Emoji entrance — small objects arriving into the scene, not UI
     fading in. Size, lift, drift and tilt all settle together on one
     long soft ease-out (no overshoot, so nothing bounces), while the
     fade finishes earlier so the object is already visible while it is
     still coming to rest. Each one drifts in from its own side of the
     stage and swings the last third of the way into its Figma tilt.
     EMOJI_WINDOW is how much scroll progress one arrival takes. */
  var EMOJI_FROM_SCALE = 0.57;   // clearly small, then grows into place
  var EMOJI_LIFT = 11;        // px of upward travel
  var EMOJI_DRIFT = 4;        // px of sideways travel, away from centre
  var EMOJI_UNTILT = 0.35;    // fraction of the final tilt still to travel
  var EMOJI_FADE_AT = 0.7;    // fade done at 70% of the entrance window

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }
  function easeOutQuad(t) { return 1 - Math.pow(1 - t, 2); }

  function init() {
    var section = document.querySelector('.about');
    var track = section && section.querySelector('.about__track');
    var paragraph = section && section.querySelector('.about__text');
    if (!section || !track || !paragraph) return;
    if (reduceMotion.matches) return;

    var words = splitIntoWords(paragraph);
    if (!words.length) return;

    var stageMid = section.querySelector('.about__stage').offsetWidth / 2;

    var emoji = Array.prototype.map.call(
      section.querySelectorAll('.about__emoji'),
      function (el) {
        var tilt = tiltOf(el.firstElementChild);
        var at = thresholdFor(el);
        return {
          el: el,
          at: at,
          /* Never run past the end of the reveal, so the last emoji
             (90%) still lands on its exact final size at progress 1. */
          window: Math.min(EMOJI_WINDOW, Math.max(0.02, 1 - at)),
          state: -1,
          /* drift in from whichever side of the stage it sits on */
          dx: (el.offsetLeft + el.offsetWidth / 2 < stageMid ? -1 : 1) * EMOJI_DRIFT,
          /* start short of its designed tilt and rotate into it */
          dr: -tilt * EMOJI_UNTILT
        };
      }
    );

    var wordState = new Array(words.length);
    var queued = false;
    var visible = true;

    section.classList.add('about--scrollreveal');
    applyPinMode();
    canPin.addEventListener('change', function () { applyPinMode(); request(); });

    /* Only run while the section is near the viewport. The margin is a
       full viewport, so the state is already correct before the section
       can be seen — e.g. after scrolling back up to the hero. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) request();
        /* Observe the section, not the track: below 1024px the track is
           display:contents and has no box to intersect. */
      }, { rootMargin: '100% 0px' }).observe(section);
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    request();

    function applyPinMode() {
      section.classList.toggle('about--pinned', canPin.matches);
    }

    function request() {
      if (queued || !visible) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        paint(progress());
      });
    }

    /* Progress ------------------------------------------------------- */
    function progress() {
      var vh = window.innerHeight;

      if (canPin.matches) {
        /* Pinned: consume the track's overflow beyond one viewport. */
        var track_ = track.getBoundingClientRect();
        var travel = track_.height - vh;
        return travel <= 0 ? 1 : clamp01(-track_.top / travel);
      }

      /* Not pinned (< 1024px): the track is display:contents and has no
         box, so measure the section. The reveal runs from the section
         entering low in the viewport to it leaving the upper third. */
      var rect = section.getBoundingClientRect();
      return clamp01((vh * 0.85 - rect.top) / (rect.height + vh * 0.5));
    }

    /* Painting ------------------------------------------------------- */
    function paint(p) {
      paintWords(p);
      paintEmoji(p);
    }

    function paintWords(p) {
      var span = TEXT_END - WORD_WINDOW;
      var last = words.length - 1;

      for (var i = 0; i <= last; i++) {
        var start = last === 0 ? 0 : (i / last) * span;
        var a = clamp01((p - start) / WORD_WINDOW);
        var step = Math.round(a * STEPS);

        if (step === wordState[i]) continue;
        wordState[i] = step;
        words[i].style.color = mix(step / STEPS);
      }
    }

    function paintEmoji(p) {
      emoji.forEach(function (item) {
        var raw = clamp01((p - item.at) / item.window);
        var step = Math.round(raw * STEPS);
        if (step === item.state) return;
        item.state = step;

        var t = step / STEPS;
        var settle = easeOutQuint(t);
        var fade = easeOutQuad(clamp01(t / EMOJI_FADE_AT));

        var left = 1 - settle; // how much of the arrival is still to run

        item.el.style.opacity = fade;
        item.el.style.transform =
          'translate(' + (item.dx * left).toFixed(2) + 'px, ' +
          (left * EMOJI_LIFT).toFixed(2) + 'px) rotate(' +
          (item.dr * left).toFixed(2) + 'deg) scale(' +
          (EMOJI_FROM_SCALE + (1 - EMOJI_FROM_SCALE) * settle).toFixed(4) + ')';
      });
    }
  }

  /* rgba between the unread and read colours */
  function mix(t) {
    var c = Math.round(UNREAD.c + (READ.c - UNREAD.c) * t);
    var a = (UNREAD.a + (READ.a - UNREAD.a) * t).toFixed(3);
    return 'rgba(' + c + ',' + c + ',' + c + ',' + a + ')';
  }

  /* Designed rotation of an emoji glyph, in degrees, read off its
     computed matrix so the values stay owned by the CSS. */
  function tiltOf(span) {
    if (!span) return 0;
    var m = getComputedStyle(span).transform;
    var parts = m && m.indexOf('matrix') === 0 ? m.match(/-?[\d.e+]+/g) : null;
    if (!parts || parts.length < 4) return 0;
    return Math.atan2(parseFloat(parts[1]), parseFloat(parts[0])) * 180 / Math.PI;
  }

  function thresholdFor(el) {
    var at = 1;
    Object.keys(EMOJI_AT).forEach(function (cls) {
      if (el.classList.contains(cls)) at = EMOJI_AT[cls];
    });
    return at;
  }

  /* Wraps every word in <span class="about__word">, leaving the
     whitespace as plain text nodes so wrapping is unchanged. */
  function splitIntoWords(paragraph) {
    var walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);

    var words = [];
    textNodes.forEach(function (textNode) {
      var parts = textNode.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();

      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var span = document.createElement('span');
        span.className = 'about__word';
        span.textContent = part;
        frag.appendChild(span);
        words.push(span);
      });

      textNode.parentNode.replaceChild(frag, textNode);
    });

    return words;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
