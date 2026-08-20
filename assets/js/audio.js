/* ==========================================================================
   audio.js — the ambience, synthesised in the browser
   --------------------------------------------------------------------------
   No .mp3 files to host, licence or wait for. Four buses — sea, wind, birds
   and a soft instrumental bed — mixed differently for each place in the
   world. Nothing starts until the guest presses "Begin the walk", because
   that click is the browser's price of admission for sound.

   The music is deliberately not a song: a slow, wide arpeggio through a long
   reverb, so it sits underneath the site rather than playing at you. If you
   would rather have a real licensed recording, replace the `music` bus with
   an <audio> element and leave the sea, wind and birds exactly as they are.
   ========================================================================== */
(function (global) {
  'use strict';

  var ctx = null, master = null, verb = null;
  var bus = {};                       // sea | wind | birds | music
  var started = false, muted = true;
  var birdTimer = null, arpTimer = null, pulseTimer = null, bellTimer = null;
  var sceneId = 'hub', level = 0.5;

  /* --- the mix for each place ----------------------------------------- */
  var MOODS = {
    hub:        { sea: .40, wind: .15, birds: .30, music: .10, scale: 'day',   step: 2.10, bells: true },
    welcome:    { sea: .20, wind: .10, birds: .04, music: .13, scale: 'dusk',  step: 2.60 },
    wedding:    { sea: .18, wind: .12, birds: .16, music: .15, scale: 'gold',  step: 1.85 },
    afterparty: { sea: .00, wind: .04, birds: .00, music: .13, scale: 'night', step: 0.95, pulse: true },
    explore:    { sea: .34, wind: .16, birds: .26, music: .09, scale: 'day',   step: 2.20 },
    stay:       { sea: .22, wind: .12, birds: .22, music: .10, scale: 'day',   step: 2.45, bells: true },
    travel:     { sea: .26, wind: .18, birds: .14, music: .09, scale: 'day',   step: 2.30 },
    rsvp:       { sea: .22, wind: .10, birds: .08, music: .14, scale: 'dusk',  step: 2.70 }
  };

  /* Pentatonic sets — no semitone clashes, so any order sounds intentional. */
  var SCALES = {
    day:   { root: 261.63, steps: [0, 2, 4, 7, 9, 12, 16], type: 'triangle', tone: 1400 },
    gold:  { root: 293.66, steps: [0, 4, 7, 9, 12, 14, 16], type: 'triangle', tone: 1700 },
    dusk:  { root: 220.00, steps: [0, 3, 5, 7, 10, 12, 15], type: 'sine',     tone: 1100 },
    night: { root: 110.00, steps: [0, 3, 5, 7, 10, 15, 22], type: 'sawtooth', tone: 620 }
  };

  function t() { return ctx.currentTime; }
  function semis(root, n) { return root * Math.pow(2, n / 12); }
  function ramp(param, to, secs) {
    param.cancelScheduledValues(t());
    param.setValueAtTime(param.value, t());
    param.linearRampToValueAtTime(to, t() + (secs || 1.2));
  }

  /* --- building blocks -------------------------------------------------- */
  function noiseBuffer(seconds) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;      // brown-ish: softer, less hissy
      d[i] = last * 3.2;
    }
    return buf;
  }

  /* A hall, made out of decaying noise. Cheap, and it is what stops the
     music sounding like a ringtone. */
  function impulse(seconds, decay) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function noiseLayer(target, seconds, type, freq, q, lfoRate, lfoDepth) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer(seconds);
    src.loop = true;
    var filt = ctx.createBiquadFilter();
    filt.type = type; filt.frequency.value = freq; filt.Q.value = q;
    var swell = ctx.createGain();
    swell.gain.value = 1;
    var lfo = ctx.createOscillator();
    lfo.frequency.value = lfoRate;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = lfoDepth;
    lfo.connect(lfoGain).connect(swell.gain);
    src.connect(filt).connect(swell).connect(target);
    src.start(); lfo.start();
  }

  /* --- birds ------------------------------------------------------------ */
  function chirp(when, pitch) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sine';
    f.type = 'bandpass'; f.frequency.value = pitch; f.Q.value = 4;
    o.frequency.setValueAtTime(pitch * 0.84, when);
    o.frequency.exponentialRampToValueAtTime(pitch * 1.26, when + 0.042);
    o.frequency.exponentialRampToValueAtTime(pitch * 0.9, when + 0.115);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.3, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, when + 0.16);
    o.connect(f).connect(g).connect(bus.birds);
    o.start(when); o.stop(when + 0.22);
  }

  function birdBurst() {
    if (!muted && ctx && ctx.state === 'running') {
      var when = t() + 0.06;
      var n = 1 + Math.floor(Math.random() * 3);
      var base = 1450 + Math.random() * 1600;
      for (var i = 0; i < n; i++) {
        chirp(when + i * (0.085 + Math.random() * 0.13), base * (1 + (Math.random() - 0.5) * 0.2));
      }
    }
    birdTimer = setTimeout(birdBurst, 1700 + Math.random() * 6800);
  }

  /* --- the instrumental bed --------------------------------------------- */
  var arpStep = 0;
  function note(freq, when, dur, type, tone, gainVal) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator();
    var g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; o2.type = type;
    o.frequency.value = freq;
    o2.frequency.value = freq * 1.005;         // a whisper of detune
    f.type = 'lowpass'; f.frequency.value = tone; f.Q.value = 0.4;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gainVal, when + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(f); o2.connect(f);
    f.connect(g).connect(bus.music);
    o.start(when); o2.start(when + 0.01);
    o.stop(when + dur + 0.1); o2.stop(when + dur + 0.1);
  }

  function arpTick() {
    var mood = MOODS[sceneId] || MOODS.hub;
    var sc = SCALES[mood.scale];
    if (!muted && ctx && ctx.state === 'running') {
      var when = t() + 0.05;
      /* wander through the scale rather than running up and down it */
      arpStep += (Math.random() < 0.62 ? 1 : -1) * (1 + (Math.random() < 0.25 ? 1 : 0));
      if (arpStep < 0) arpStep += sc.steps.length;
      var idx = arpStep % sc.steps.length;
      note(semis(sc.root, sc.steps[idx]), when, 3.4, sc.type, sc.tone, 0.16);
      /* every so often, a low note underneath to hold it together */
      if (Math.random() < 0.3) {
        note(semis(sc.root, sc.steps[0] - 12), when + 0.08, 5.5, 'sine', 700, 0.13);
      }
    }
    arpTimer = setTimeout(arpTick, ((MOODS[sceneId] || MOODS.hub).step || 2.1) * 1000 * (0.85 + Math.random() * 0.3));
  }

  /* A bell from a campanile somewhere across the water. */
  function bell() {
    var mood = MOODS[sceneId] || MOODS.hub;
    if (mood.bells && !muted && ctx && ctx.state === 'running') {
      var base = [392, 440, 523.25, 587.33][Math.floor(Math.random() * 4)];
      [1, 2.01].forEach(function (mult, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = base * mult;
        g.gain.setValueAtTime(0, t());
        g.gain.linearRampToValueAtTime(i ? 0.010 : 0.024, t() + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t() + 4.5);
        o.connect(g).connect(bus.music);
        o.start(); o.stop(t() + 4.6);
      });
    }
    bellTimer = setTimeout(bell, 22000 + Math.random() * 34000);
  }

  /* The after-party gets a pulse under the floor — felt more than heard. */
  function pulse() {
    var mood = MOODS[sceneId] || MOODS.hub;
    if (mood.pulse && !muted && ctx && ctx.state === 'running') {
      var when = t() + 0.04;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(96, when);
      o.frequency.exponentialRampToValueAtTime(44, when + 0.13);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.30, when + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.34);
      o.connect(g).connect(bus.music);
      o.start(when); o.stop(when + 0.4);
    }
    pulseTimer = setTimeout(pulse, 520);
  }

  /* --- wiring ----------------------------------------------------------- */
  function start() {
    if (started) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    /* a little of everything goes through the hall */
    verb = ctx.createConvolver();
    verb.buffer = impulse(2.6, 2.4);
    var verbGain = ctx.createGain();
    verbGain.gain.value = 0.55;
    verb.connect(verbGain).connect(master);

    ['sea', 'wind', 'birds', 'music'].forEach(function (name) {
      var g = ctx.createGain();
      g.gain.value = 0;
      g.connect(master);
      if (name !== 'sea') g.connect(verb);
      bus[name] = g;
    });

    noiseLayer(bus.sea, 4, 'lowpass', 420, 0.7, 0.06, 0.35);    // surf on the rocks
    noiseLayer(bus.wind, 6, 'bandpass', 900, 0.5, 0.033, 0.22); // wind in the olives

    started = true;
    applyScene(0.1);
    birdBurst();
    arpTick();
    bell();
    pulse();
  }

  function applyScene(secs) {
    if (!started) return;
    var mood = MOODS[sceneId] || MOODS.hub;
    ramp(bus.sea.gain, mood.sea, secs || 2.2);
    ramp(bus.wind.gain, mood.wind, secs || 2.2);
    ramp(bus.birds.gain, mood.birds, secs || 2.2);
    ramp(bus.music.gain, mood.music, secs || 2.2);
  }

  global.WW = global.WW || {};
  global.WW.audio = {
    on: function () {
      start();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      muted = false;
      ramp(master.gain, level, 2.6);
    },
    off: function () {
      muted = true;
      if (ctx) ramp(master.gain, 0, 0.9);
    },
    /* which part of the world we are standing in */
    scene: function (id) {
      sceneId = MOODS[id] ? id : 'hub';
      applyScene(2.4);
    },
    /* quieter inside a room, so the copy is the thing you notice */
    duck: function (isRoom) {
      level = isRoom ? 0.34 : 0.5;
      if (!muted && ctx) ramp(master.gain, level, 1.2);
    }
  };
})(window);
