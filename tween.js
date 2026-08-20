/* ==========================================================================
   tween.js — a tiny animation engine (no dependencies)
   Replaces GSAP so the site works offline, from a USB stick, or by simply
   double-clicking index.html. Same easing curves (power2.inOut etc).
   ========================================================================== */
(function (global) {
  'use strict';

  var Ease = {
    linear:      function (t) { return t; },
    power1In:    function (t) { return t * t; },
    power1Out:   function (t) { return 1 - (1 - t) * (1 - t); },
    power2In:    function (t) { return t * t * t; },
    power2Out:   function (t) { return 1 - Math.pow(1 - t, 3); },
    power2InOut: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    power3InOut: function (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; },
    backOut:     function (t) { var c1 = 1.70158, c3 = c1 + 1;
                                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    expoOut:     function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  };

  var running = [];
  var ticking = false;

  function frame(now) {
    ticking = false;
    for (var i = running.length - 1; i >= 0; i--) {
      var tw = running[i];
      if (tw.killed) { running.splice(i, 1); continue; }
      if (tw.start === null) tw.start = now + tw.delay;
      var elapsed = now - tw.start;
      if (elapsed < 0) { continue; }
      var t = tw.duration <= 0 ? 1 : Math.min(1, elapsed / tw.duration);
      var e = tw.ease(t);
      tw.onUpdate(tw.from + (tw.to - tw.from) * e, e, t);
      if (t >= 1) {
        running.splice(i, 1);
        if (tw.onComplete) tw.onComplete();
      }
    }
    if (running.length) schedule();
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  /**
   * tween({from, to, duration, delay, ease, onUpdate, onComplete}) -> handle
   * Durations are in milliseconds.
   */
  function tween(opts) {
    var tw = {
      from: opts.from != null ? opts.from : 0,
      to: opts.to != null ? opts.to : 1,
      duration: opts.duration != null ? opts.duration : 600,
      delay: opts.delay || 0,
      ease: typeof opts.ease === 'function' ? opts.ease : (Ease[opts.ease] || Ease.power2InOut),
      onUpdate: opts.onUpdate || function () {},
      onComplete: opts.onComplete || null,
      start: null,
      killed: false
    };
    // Respect the visitor's "reduce motion" system setting: snap to the end.
    if (global.WW_REDUCED_MOTION && !opts.ignoreReducedMotion) {
      tw.duration = 0;
      tw.delay = 0;
    }
    running.push(tw);
    schedule();
    return {
      kill: function () { tw.killed = true; },
      finish: function () {
        tw.killed = true;
        tw.onUpdate(tw.to, 1, 1);
        if (tw.onComplete) tw.onComplete();
      }
    };
  }

  /** Frame-rate independent smoothing, for pointer-follow / inertia. */
  function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
  }

  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }

  /* If the guest switches tab mid-transition the browser pauses
     requestAnimationFrame. Snap everything to its end state so nothing is
     left half-open when they come back. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) return;
    var pending = running.slice();
    running.length = 0;
    for (var i = 0; i < pending.length; i++) {
      var tw = pending[i];
      if (tw.killed) continue;
      tw.killed = true;
      tw.onUpdate(tw.to, 1, 1);
      if (tw.onComplete) tw.onComplete();
    }
  });

  global.WW = global.WW || {};
  global.WW.tween = tween;
  global.WW.Ease = Ease;
  global.WW.damp = damp;
  global.WW.clamp = clamp;
})(window);
