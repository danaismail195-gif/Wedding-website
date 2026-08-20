/* ==========================================================================
   audio.js — ambient sound, synthesised in the browser
   No .mp3 files to host or wait for. Off by default; the guest opts in.
   Waves + wind (filtered noise) with occasional distant bell tones.
   ========================================================================== */
(function (global) {
  'use strict';

  var ctx = null, master = null, nodes = [], bellTimer = null, started = false;

  function noiseBuffer(seconds) {
    var len = ctx.sampleRate * seconds;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;   // brown-ish noise: softer, less hissy
      d[i] = last * 3.2;
    }
    return buf;
  }

  function makeLayer(bufSeconds, filterType, freq, q, gainVal, lfoRate, lfoDepth) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(bufSeconds);
    src.loop = true;

    var filt = ctx.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.value = freq;
    filt.Q.value = q;

    var gain = ctx.createGain();
    gain.gain.value = gainVal;

    /* slow swell, so it breathes like surf instead of hissing flatly */
    var lfo = ctx.createOscillator();
    lfo.frequency.value = lfoRate;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = lfoDepth;
    lfo.connect(lfoGain).connect(gain.gain);

    src.connect(filt).connect(gain).connect(master);
    src.start();
    lfo.start();
    nodes.push(src, lfo);
    return gain;
  }

  function bell() {
    if (!ctx || ctx.state !== 'running') return;
    var base = [392, 440, 523.25, 587.33][Math.floor(Math.random() * 4)];
    [1, 2.01].forEach(function (mult, i) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base * mult;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(i ? 0.012 : 0.03, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);
      osc.connect(g).connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 4.6);
    });
    bellTimer = setTimeout(bell, 14000 + Math.random() * 26000);
  }

  function start() {
    if (started) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    makeLayer(4, 'lowpass', 420, 0.7, 0.42, 0.06, 0.22);   // surf on the rocks
    makeLayer(6, 'bandpass', 900, 0.5, 0.16, 0.033, 0.10); // wind through the olives
    started = true;
    bellTimer = setTimeout(bell, 9000);
  }

  function fade(to, seconds) {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(to, ctx.currentTime + (seconds || 1.4));
  }

  global.WW = global.WW || {};
  global.WW.audio = {
    on: function () { start(); fade(0.5, 2.2); },
    off: function () { fade(0, 0.8); },
    /* quieter inside a room so the copy is the thing you notice */
    duck: function (isRoom) { if (started && master.gain.value > 0.001) fade(isRoom ? 0.28 : 0.5, 1.2); }
  };
})(window);
