// Flux owns this file. Vanilla JS, no dependencies, no CDN.
//
// Reveal entrance: Option B (Lively), locked by Anderson. Values live in
// motion.css (.js .reveal / .is-visible); this file only sequences the
// stagger and swaps classes. See Flux - Motion Spec.md and the brief's
// Motion spec section before changing any number here.
//
// Rule 3 safety net: add the "js" class to <html> as the very first thing.
// motion.css scopes every hidden starting state to ".js .reveal", so if this
// script fails to load or run, .reveal elements never get opacity:0 and the
// hero stays fully visible and readable with no motion at all.
document.documentElement.classList.add('js');

(function () {
  var STAGGER_MS = 60; // locked value, Option B. Ask before changing.

  // Hex 2026-10-08, minimal edit for the v2 page: the old list named only the
  // hero's elements by hand, so anything with .reveal in the new sections
  // stayed at opacity 0 forever. Now every .reveal element is observed, in DOM
  // order. Entrance values and STAGGER_MS are untouched.
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  // The stagger counts from 0 again inside each section, so a card late in the
  // page does not inherit a multi second delay from its document position.
  var hosts = [];
  var hostCounts = [];
  revealEls.forEach(function (el) {
    var host = el.closest('section, header, footer') || document.body;
    var k = hosts.indexOf(host);
    if (k === -1) { k = hosts.length; hosts.push(host); hostCounts.push(0); }
    el.setAttribute('data-stagger', hostCounts[k]);
    hostCounts[k] += 1;
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var index = parseInt(el.getAttribute('data-stagger'), 10) || 0;
        if (!reduceMotion) {
          el.style.transitionDelay = (index * STAGGER_MS) + 'ms';
        }
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  // On the opacity transitionend, clear the stagger delay and add
  // is-settled. Only then does the CTA's hover/press transition apply
  // (motion.css gates it on .is-settled), so hover speed never bleeds
  // into the entrance itself. Credit blocks get is-settled too for
  // consistency, but motion.css gives them no hover rule, by design:
  // they are not links and should not look clickable.
  revealEls.forEach(function (el) {
    el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'opacity' && el.classList.contains('is-visible')) {
        el.style.transitionDelay = '';
        el.classList.add('is-settled');
      }
    });
  });

  // Reduced motion still fires an opacity transitionend (0.3s linear in
  // motion.css), so is-settled is handled above either way. This guard only
  // covers a future change that makes reduced motion fully instant (no
  // transition at all, no transitionend event to catch).
  if (reduceMotion) {
    revealEls.forEach(function (el) {
      if (el.classList.contains('is-visible') && !el.classList.contains('is-settled')) {
        el.classList.add('is-settled');
      }
    });
  }

  // Ambient status dot pulse: pause when the tab is hidden, resume when
  // visible again (unless reduced motion, which already removes the
  // animation in CSS, so nothing to resume there).
  function handleVisibilityChange() {
    if (document.hidden) {
      document.documentElement.classList.add('animations-paused');
    } else {
      document.documentElement.classList.remove('animations-paused');
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
})();
