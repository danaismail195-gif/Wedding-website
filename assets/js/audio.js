/* ==========================================================================
   audio.js — the music, played in the browser
   --------------------------------------------------------------------------
   One instrumental piece, written for this site and synthesised on the fly:
   a nylon-string guitar over a warm string pad and a soft upright bass,
   through a hall. No vocals. No sea, no wind, no birds, no weather of any
   kind — the ambience track that used to run underneath all of this is gone
   and nothing environmental replaces it.

   Why it is synthesised rather than a licensed recording: a real track has
   to be bought, hosted and paid for, and the two links that came back with
   the feedback were YouTube, which cannot be downloaded and re-hosted. This
   plays the same music every visit, weighs nothing, and starts instantly.
   To swap in a real recording later, delete the scheduler and point `music`
   at an <audio> element — the mixing, ducking and per-room levels below all
   keep working unchanged.

   The piece: an Andalusian cadence (i - VII - VI - V), the four chords the
   whole Mediterranean is built on, taken slowly. Each room shifts the key,
   the tempo and the balance of the three instruments, so walking from the
   terrace to the after-party feels like the same band playing a different
   part of the evening rather than a different playlist.

   Nothing starts until the guest presses "Begin the walk", because that
   click is the browser's price of admission for sound.
   ========================================================================== */
(function (global) {
  'use strict';

  var ctx = null, master = null, verbSend = null;
  var bus = {};                       // guitar | pad | bass | sparkle
  var started = false, muted = true;
  var sceneId = 'hub', level = 0.5;
  /* Make-up gain. The per-room numbers below are a *balance* between the
     three instruments, kept in the 0–1 range where they are easy to read;
     this is what turns that balance into a listenable level. Measured
     offline, the piece peaks around -8 dBFS with this — present, with
     headroom left for the moments when a chord, a bass note and a bell all
     land together. */
  var OUT = 6;
  var timer = null, nextTime = 0, step = 0;
  var plucks = {};                    // cached plucked-string buffers, by pitch

  /* --- the piece ------------------------------------------------------- */

  /* Chords as semitones from the room's root. Five voices each: the guitar
     arpeggiates them, the pad holds the middle three, the bass takes the
     lowest two octaves down. */
  var PROGS = {
    /* i - VII - VI - V. Warm, a little wistful, unmistakably southern. */
    andalusian: [[0, 3, 7, 12, 15], [-2, 2, 5, 10, 14], [-4, 0, 3, 8, 12], [-5, -1, 2, 7, 11]],
    /* major and open — for golden hour */
    golden:     [[0, 4, 7, 11, 16], [-3, 0, 4, 9, 12], [-5, -1, 2, 7, 14], [-7, -3, 0, 4, 11]],
    /* softer, suspended, for the quiet rooms */
    lull:       [[0, 4, 7, 11, 14], [-3, 0, 4, 7, 12], [-5, -1, 2, 7, 11], [-7, -3, 0, 5, 9]],
    /* minor with a seventh — the small hours */
    nocturne:   [[0, 3, 7, 10, 14], [-4, 0, 3, 7, 12], [-5, -2, 2, 7, 10], [-7, -4, 0, 5, 8]]
  };

  /* Which figure the guitar plays over each chord. Indices into the chord;
     -1 is a rest, and the rests are what stop it sounding like an exercise. */
  var FIGURES = [
    [0, 2, 3, -1, 1, 2, 4, -1],
    [0, 2, 4, 2, -1, 3, 1, -1],
    [0, 3, 2, 4, -1, 2, -1, 1],
    [0, 2, 3, 2, 4, -1, 1, -1]
  ];

  /* One mix per place. `root` is the key in Hz, `bpm` the pulse, and the
     three levels are the balance of the band. Everything here is music. */
  var MOODS = {
    hub:        { root: 220.00, prog: 'andalusian', bpm: 62, guitar: .30, pad: .13, bass: .16, sparkle: .11 },
    welcome:    { root: 196.00, prog: 'lull',       bpm: 56, guitar: .27, pad: .16, bass: .17, sparkle: .09 },
    wedding:    { root: 246.94, prog: 'golden',     bpm: 66, guitar: .31, pad: .15, bass: .15, sparkle: .14 },
    afterparty: { root: 164.81, prog: 'nocturne',   bpm: 96, guitar: .24, pad: .17, bass: .20, sparkle: .08, pulse: true },
    explore:    { root: 233.08, prog: 'andalusian', bpm: 72, guitar: .30, pad: .12, bass: .15, sparkle: .13 },
    stay:       { root: 207.65, prog: 'lull',       bpm: 58, guitar: .27, pad: .15, bass: .16, sparkle: .10 },
    travel:     { root: 220.00, prog: 'golden',     bpm: 68, guitar: .28, pad: .13, bass: .15, sparkle: .12 },
    rsvp:       { root: 174.61, prog: 'andalusian', bpm: 54, guitar: .28, pad: .17, bass: .18, sparkle: .12 }
  };

  function mood() { return MOODS[sceneId] || MOODS.hub; }
  function t() { return ctx.currentTime; }
  function semis(root, n) { return root * Math.pow(2, n / 12); }
  function ramp(param, to, secs) {
    param.cancelScheduledValues(t());
    param.setValueAtTime(param.value, t());
    param.linearRampToValueAtTime(to, t() + (secs || 1.2));
  }

  /* --- instruments ------------------------------------------------------ */

  /* A hall, made out of decaying noise. Cheap, and it is what stops a
     synthesised guitar sounding like a ringtone. */
  function impulse(seconds, decay) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  /* A plucked nylon string, by Karplus–Strong: a short burst of noise fed
     back through its own delay line, losing its edges a little on every
     lap. That averaging is the whole trick — it is why this sounds like
     gut and wood instead of like an oscillator. Buffers are rendered once
     per pitch and kept. */
  function pluckBuffer(freq) {
    var key = Math.round(freq * 4);
    if (plucks[key]) return plucks[key];
    var sr = ctx.sampleRate;
    var n = Math.max(8, Math.round(sr / freq));
    var len = Math.floor(sr * 1.9);
    var buf = ctx.createBuffer(1, len, sr);
    var d = buf.getChannelData(0);
    var i, last = 0;
    /* the pluck itself: noise, rolled off so it reads as a fingertip
       rather than a plectrum */
    for (i = 0; i < n; i++) {
      var white = Math.random() * 2 - 1;
      last = last * 0.55 + white * 0.45;
      d[i] = last;
    }
    /* The averaging of two neighbouring samples one period back is what
       rounds a string off as it rings — the highs go first, exactly as they
       do on gut. `rho` is the loss per *sample*, worked back from how long
       the note should take to die away; applying a per-period figure once
       per sample instead would silence the string in a few milliseconds. */
    var damp = 0.5 - Math.min(0.06, freq / 14000);   // higher strings ring less
    var rho = Math.exp(-1 / (1.7 * sr));
    for (i = n; i < len; i++) {
      d[i] = (d[i - n] * damp + d[i - n + 1] * (1 - damp)) * rho;
    }
    /* fade the tail so a note never clicks off */
    var fade = Math.floor(sr * 0.25);
    for (i = len - fade; i < len; i++) d[i] *= (len - i) / fade;
    plucks[key] = buf;
    return buf;
  }

  function pluck(freq, when, gainVal, target) {
    var src = ctx.createBufferSource();
    src.buffer = pluckBuffer(freq);
    var g = ctx.createGain();
    g.gain.value = gainVal;
    var body = ctx.createBiquadFilter();       // the box the string is on
    body.type = 'lowpass';
    body.frequency.value = 2600;
    body.Q.value = 0.6;
    src.connect(body).connect(g).connect(target || bus.guitar);
    src.start(when);
    src.stop(when + 2.1);
  }

  /* The pad: three voices, barely detuned, with a long way in and a longer
     way out. It is the room the guitar is played in. */
  function padChord(notes, root, when, dur) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.16, when + dur * 0.45);
    g.gain.linearRampToValueAtTime(0.0001, when + dur * 1.15);
    var filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 1250; filt.Q.value = 0.3;
    filt.connect(g).connect(bus.pad);
    for (var i = 1; i <= 3; i++) {
      var o = ctx.createOscillator();
      o.type = i === 2 ? 'sine' : 'triangle';
      o.frequency.value = semis(root, notes[i]) * (i === 3 ? 1.004 : 1);
      o.connect(filt);
      o.start(when);
      o.stop(when + dur * 1.2);
    }
  }

  /* A soft upright bass — a sine with a fingered attack. */
  function bassNote(freq, when, dur) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.5, when + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(bus.bass);
    o.start(when); o.stop(when + dur + 0.05);
  }

  /* A struck bell, two partials — the celesta at the top of a phrase. */
  function sparkle(freq, when) {
    [1, 2.02].forEach(function (mult, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(i ? 0.10 : 0.24, when + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 3.4);
      o.connect(g).connect(bus.sparkle);
      o.start(when); o.stop(when + 3.5);
    });
  }

  /* The after-party only: the floor, felt more than heard. Still an
     instrument — a muted kick on the beat, not a room recording. */
  function kick(when) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(104, when);
    o.frequency.exponentialRampToValueAtTime(46, when + 0.12);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.34, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.30);
    o.connect(g).connect(bus.bass);
    o.start(when); o.stop(when + 0.34);
  }

  /* --- the sequencer ----------------------------------------------------
     Eighth notes, scheduled a little ahead of the clock rather than played
     from a timer, so the pulse does not stumble when the browser is busy
     drawing a 3400px-wide parallax layer. */
  function scheduleStep(i, when) {
    var m = mood();
    var prog = PROGS[m.prog] || PROGS.andalusian;
    var bar = Math.floor(i / 8) % prog.length;
    var chord = prog[bar];
    var beat = i % 8;

    if (beat === 0) {
      padChord(chord, m.root, when, (60 / m.bpm) * 4);
      bassNote(semis(m.root, chord[0] - 24), when, 1.9);
      if (i % 32 === 24) sparkle(semis(m.root, chord[4] + 12), when + 0.02);
    }
    if (beat === 4) bassNote(semis(m.root, chord[1] - 24), when, 1.2);
    if (m.pulse && beat % 2 === 0) kick(when);

    var fig = FIGURES[bar % FIGURES.length];
    var v = fig[beat];
    if (v >= 0) {
      /* humanise: a real hand is never exactly on the beat, and never
         plays two notes at the same weight */
      var slip = (Math.random() - 0.5) * 0.018;
      var vel = 0.34 + Math.random() * 0.12 - (beat % 2 ? 0.08 : 0);
      pluck(semis(m.root, chord[v] + 12), when + slip, vel);
      if (beat === 0 && Math.random() < 0.4) {
        pluck(semis(m.root, chord[v] + 24), when + slip + 0.035, vel * 0.45);
      }
    }
  }

  function tick() {
    if (!ctx || ctx.state !== 'running' || muted) { nextTime = 0; return; }
    var beatSecs = (60 / mood().bpm) / 2;
    if (!nextTime) nextTime = t() + 0.12;
    while (nextTime < t() + 0.7) {
      scheduleStep(step, nextTime);
      nextTime += beatSecs;
      step++;
    }
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

    var verb = ctx.createConvolver();
    verb.buffer = impulse(2.8, 2.6);
    verbSend = ctx.createGain();
    verbSend.gain.value = 0.6;
    verb.connect(verbSend).connect(master);

    ['guitar', 'pad', 'bass', 'sparkle'].forEach(function (name) {
      var g = ctx.createGain();
      g.gain.value = 0;
      g.connect(master);
      if (name !== 'bass') g.connect(verb);   // the bass stays dry, or it fogs
      bus[name] = g;
    });

    started = true;
    applyScene(0.1);
    timer = setInterval(tick, 60);
  }

  function applyScene(secs) {
    if (!started) return;
    var m = mood();
    ramp(bus.guitar.gain, m.guitar, secs || 2.2);
    ramp(bus.pad.gain, m.pad, secs || 2.2);
    ramp(bus.bass.gain, m.bass, secs || 2.2);
    ramp(bus.sparkle.gain, m.sparkle, secs || 2.2);
  }

  global.WW = global.WW || {};
  global.WW.audio = {
    on: function () {
      start();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      muted = false;
      nextTime = 0;
      ramp(master.gain, level * OUT, 2.6);
    },
    off: function () {
      muted = true;
      if (ctx) ramp(master.gain, 0, 0.9);
    },
    /* which part of the world we are standing in */
    scene: function (id) {
      var was = sceneId;
      sceneId = MOODS[id] ? id : 'hub';
      /* start the new key at the top of its phrase, not halfway through */
      if (sceneId !== was) step = 0;
      applyScene(2.4);
    },
    /* quieter inside a room, so the copy is the thing you notice */
    duck: function (isRoom) {
      level = isRoom ? 0.34 : 0.5;
      if (!muted && ctx) ramp(master.gain, level * OUT, 1.2);
    }
  };
})(window);
