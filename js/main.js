/* ============================================================
   Hero interactions
   Scope: hero only. Nothing outside .hero is touched.

   · question chips  → single-select, black/white selected state
   · answer slot     → filled from window.QUESTIONS (js/data.js),
                       swapped with a fade + small vertical move
   The slot reserves the card's height in CSS, so selecting,
   replacing or clearing an answer never shifts the layout.
   ============================================================ */
(function () {
  'use strict';

  var SELECTED = 'is-selected';
  var LEAVING = 'is-leaving';
  var ENTERING = 'is-entering';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Durations mirror css/interactions.css; 0 when motion is reduced. */
  function outDuration() { return reduceMotion.matches ? 0 : 140; }

  function init() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var chips = Array.prototype.slice.call(hero.querySelectorAll('[data-question]'));
    var card = hero.querySelector('.hero__answer');
    var body = card && card.querySelector('.hero__answer-body');
    if (!chips.length || !card || !body) return;

    var answers = indexAnswers(window.QUESTIONS);
    var activeId = null;
    var swap = 0; // guards against out-of-order swaps on rapid clicks

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var id = chip.getAttribute('data-question');
        if (id === activeId) clear();
        else select(id);
      });
    });

    /* ── selection ─────────────────────────────────────────── */
    function select(id) {
      var paragraphs = answers[id];
      if (!paragraphs) return;

      activeId = id;
      markChips(id);

      var token = ++swap;
      var visible = !card.hidden;

      if (!visible) {
        render(paragraphs, id);
        reveal();
        return;
      }

      card.classList.add(LEAVING);
      window.setTimeout(function () {
        if (token !== swap) return;
        card.classList.remove(LEAVING);
        render(paragraphs, id);
        reveal();
      }, outDuration());
    }

    function clear() {
      activeId = null;
      markChips(null);

      var token = ++swap;
      if (card.hidden) return;

      card.classList.add(LEAVING);
      window.setTimeout(function () {
        if (token !== swap) return;
        card.hidden = true;
        card.classList.remove(LEAVING);
        card.setAttribute('data-answer-for', '');
        body.textContent = '';
      }, outDuration());
    }

    /* ── rendering ─────────────────────────────────────────── */
    function render(paragraphs, id) {
      body.textContent = '';
      paragraphs.forEach(function (text) {
        var p = document.createElement('p');
        p.className = 'hero__answer-text';
        p.textContent = text;
        body.appendChild(p);
      });
      card.setAttribute('data-answer-for', id);
      card.scrollTop = 0;
    }

    /* Show the card from its entering frame, then release it so the
       CSS transition runs. Two frames: one to apply, one to remove. */
    function reveal() {
      card.classList.add(ENTERING);
      card.hidden = false;

      if (reduceMotion.matches) {
        card.classList.remove(ENTERING);
        return;
      }

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          card.classList.remove(ENTERING);
        });
      });
    }

    function markChips(id) {
      chips.forEach(function (chip) {
        var on = chip.getAttribute('data-question') === id;
        chip.classList.toggle(SELECTED, on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
  }

  /* window.QUESTIONS → { q1: [paragraph, …], … }
     Prefers heroAnswer (sized for the fixed 132px card) over answer. */
  function indexAnswers(list) {
    var map = {};
    (list || []).forEach(function (item) {
      if (item && item.id) map[item.id] = [].concat(item.heroAnswer || item.answer);
    });
    return map;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
