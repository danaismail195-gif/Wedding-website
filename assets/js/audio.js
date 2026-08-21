/* ==========================================================================
   audio.js — the music, played in the browser
   --------------------------------------------------------------------------
   A piano trio: felt piano, walking upright bass, brushes. Swung eighths,
   jazz turnarounds, major keys, and nothing environmental anywhere in it —
   no sea, no wind, no birds, no weather.

   Why it is synthesised. The reference that came back with this round was an
   mp3 ripped from YouTube of a commercially released piano record. That
   cannot go on a public website: it is somebody's recording and somebody's
   copyright, and the rip itself breaks YouTube's terms. What is here instead
   is an original piece written in the same room as that idea — light, swung,
   warm, played rather than performed. To use a real recording, buy one
   (Epidemic Sound, Artlist, Musicbed all licence this kind of thing for a
   website), drop the file in, delete the sequencer, and point the buses at an
   <audio> element: the mixing, the per-room levels and the ducking below all
   keep working unchanged.

   How it is put together:
     · Harmony  — jazz turnarounds (I VI- ii- V, ii- V I, a blues) with the
                  key, the tempo and the changes set per room by MOODS.
     · Piano    — additive, five slightly stretched partials with a hammer
                  click on the front. Right hand takes a line through the
                  changes; left hand comps rootless voicings off the beat.
     · Bass     — walks. Root on the downbeat, chord tones through the bar,
                  a leading note into whatever comes next. This is most of
                  what makes it read as jazz rather than as a synth patch.
     · Brushes  — 2 and 4, and a ride figure. Quiet: they are the floor of
                  the mix, not a feature.
     · Swing    — every off-beat eighth lands late, two thirds of the way
                  through the beat. Take that out and the whole thing turns
                  back into a music box.

   Nothing starts until the guest presses "Begin the walk", because that
   click is the browser's price of admission for sound.
   ========================================================================== */
(function (global) {
  'use strict';

  var ctx = null, master = null, verb = null;
  var bus = {};                       // piano | bass | drums
  var started = false, muted = true;
  var sceneId = 'hub', level = 0.5;
  var timer = null, nextTime = 0, step = 0;
  var walk = 0;                       // where the bass currently is, in semitones

  /* Make-up gain. The per-room numbers below are a *balance* between the
     three players, kept in the 0–1 range where they are easy to read; this
     is what turns that balance into a listenable level. */
  var OUT = 5.5;

  /* --- the changes ------------------------------------------------------
     Each chord is [root offset in semitones, quality]. Qualities are the
     four that carry every standard ever written. */
  var QUALITY = {
    maj7: [0, 4, 7, 11, 14],
    min7: [0, 3, 7, 10, 14],
    dom7: [0, 4, 7, 10, 14],
    min6: [0, 3, 7, 9, 14]
  };

  var PROGS = {
    /* I  VI-  ii-  V — the turnaround the whole songbook runs on */
    turnaround: [[0, 'maj7'], [-3, 'min7'], [2, 'min7'], [-5, 'dom7']],
    /* I  IV  ii-  V — brighter, more open */
    sunny:      [[0, 'maj7'], [5, 'maj7'], [2, 'min7'], [-5, 'dom7']],
    /* ii-  V  I  I — the cadence, taken slowly */
    bossa:      [[2, 'min7'], [-5, 'dom7'], [0, 'maj7'], [0, 'maj7']],
    /* a short blues, for the small hours */
    blues:      [[0, 'dom7'], [5, 'dom7'], [0, 'dom7'], [-5, 'dom7']]
  };

  /* Which eighths the right hand plays on, and which it leaves alone. The
     rests are what stop it sounding like an exercise; the swing is what
     stops it sounding like a clock. */
  var LINES = [
    [1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0, 1, 1]
  ];

  /* One mix per place. Same band, different room. */
  var MOODS = {
    hub:        { root: 261.63, prog: 'turnaround', bpm: 116, swing: .30, piano: .30, bass: .22, drums: .11 },
    welcome:    { root: 233.08, prog: 'sunny',      bpm: 104, swing: .32, piano: .29, bass: .23, drums: .10 },
    wedding:    { root: 293.66, prog: 'sunny',      bpm: 124, swing: .28, piano: .32, bass: .21, drums: .12 },
    afterparty: { root: 233.08, prog: 'blues',      bpm: 138, swing: .30, piano: .27, bass: .28, drums: .16 },
    explore:    { root: 277.18, prog: 'turnaround', bpm: 122, swing: .29, piano: .30, bass: .22, drums: .12 },
    stay:       { root: 246.94, prog: 'bossa',      bpm: 106, swing: .26, piano: .28, bass: .21, drums: .09 },
    travel:     { root: 261.63, prog: 'sunny',      bpm: 118, swing: .30, piano: .29, bass: .22, drums: .11 },
    rsvp:       { root: 220.00, prog: 'bossa',      bpm: 100, swing: .32, piano: .30, bass: .22, drums: .09 }
  };

  function mood() { return MOODS[sceneId] || MOODS.hub; }
  function t() { return ctx.currentTime; }
  function semis(root, n) { return root * Math.pow(2, n / 12); }
  function ramp(param, to, secs) {
    param.cancelScheduledValues(t());
    param.setValueAtTime(param.value, t());
    param.linearRampToValueAtTime(to, t() + (secs || 1.2));
  }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  /* --- the room --------------------------------------------------------- */
  function impulse(seconds, decay) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  var noiseBuf = null;
  function noise() {
    if (!noiseBuf) {
      var len = Math.floor(ctx.sampleRate * 2);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    return src;
  }

  /* --- the piano --------------------------------------------------------
     Five partials, stretched very slightly sharp the way real strings are,
     each dying faster than the one below it — which is why a piano note
     gets warmer as it fades instead of just getting quieter. The hammer is
     a few milliseconds of filtered noise on the front. */
  var PARTIALS = [1, 2.004, 3.012, 4.028, 5.05];
  var PART_AMP = [1, 0.46, 0.24, 0.12, 0.06];

  function piano(freq, when, vel, dur) {
    var out = ctx.createGain();
    out.gain.value = vel;
    var tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = Math.min(7000, 1400 + freq * 4.2);
    tone.Q.value = 0.5;
    tone.connect(out).connect(bus.piano);

    for (var i = 0; i < PARTIALS.length; i++) {
      var f = freq * PARTIALS[i];
      if (f > 12000) break;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      var life = dur * (1 - i * 0.14);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(PART_AMP[i] * 0.34, when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.12, life));
      o.connect(g).connect(tone);
      o.start(when);
      o.stop(when + dur + 0.12);
    }
    /* the hammer */
    var n = noise(), ng = ctx.createGain(), nf = ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = Math.min(5200, freq * 5); nf.Q.value = 0.8;
    ng.gain.setValueAtTime(0.05 * vel, when);
    ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
    n.connect(nf).connect(ng).connect(bus.piano);
    n.start(when); n.stop(when + 0.06);
  }

  /* A chord under the hand — rootless, because the bass has the root. */
  function comp(chord, root, when, vel) {
    for (var i = 1; i < 4; i++) {
      piano(semis(root, chord[i] - 12), when + i * 0.004, vel * (i === 1 ? 1 : 0.82), 0.9);
    }
  }

  /* --- the bass ---------------------------------------------------------
     Upright: a sine with a fast finger attack and a little body above it. */
  function bass(freq, when, dur) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 620; lp.Q.value = 0.7;
    o.type = 'sine'; o.frequency.value = freq;
    o2.type = 'triangle'; o2.frequency.value = freq * 2.001;
    var g2 = ctx.createGain(); g2.gain.value = 0.16;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.55, when + 0.022);
    g.gain.exponentialRampToValueAtTime(0.06, when + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); o2.connect(g2).connect(g);
    g.connect(lp).connect(bus.bass);
    o.start(when); o2.start(when);
    o.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
  }

  /* --- brushes ----------------------------------------------------------
     Short and rhythmic, never a wash: these are drums, not weather. */
  function brush(when, vel) {
    var n = noise(), g = ctx.createGain(), bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vel, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
    n.connect(bp).connect(g).connect(bus.drums);
    n.start(when); n.stop(when + 0.2);
  }

  function ride(when, vel) {
    var n = noise(), g = ctx.createGain(), hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 6200;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vel, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    n.connect(hp).connect(g).connect(bus.drums);
    n.start(when); n.stop(when + 0.12);
  }

  /* --- the sequencer ----------------------------------------------------
     Eighth notes, scheduled ahead of the clock rather than played from a
     timer, so the pulse does not stumble when the browser is busy drawing a
     3400px-wide parallax layer. */
  function chordTones(spec) {
    var q = QUALITY[spec[1]] || QUALITY.maj7;
    return q.map(function (n) { return n + spec[0]; });
  }

  function scheduleStep(i, when, eighth) {
    var m = mood();
    var prog = PROGS[m.prog] || PROGS.turnaround;
    var bar = Math.floor(i / 8) % prog.length;
    var beat = i % 8;
    var chord = chordTones(prog[bar]);
    var next = chordTones(prog[(bar + 1) % prog.length]);

    /* --- bass: walks in quarters, leading into the next chord --------- */
    if (beat % 2 === 0) {
      var quarter = beat / 2, note;
      if (quarter === 0) { note = chord[0]; walk = note; }
      else if (quarter === 3) {
        /* approach the next root by a semitone, from whichever side is nearer */
        note = next[0] + (Math.random() < 0.5 ? 1 : -1);
      } else {
        var opts = [chord[1], chord[2], chord[3], chord[0] + 12];
        note = opts.reduce(function (best, n) {
          return Math.abs(n - walk) < Math.abs(best - walk) && n !== walk ? n : best;
        }, opts[0]);
        walk = note;
      }
      bass(semis(m.root, note - 24), when, 60 / m.bpm * 0.92);
    }

    /* --- left hand: rootless voicings, off the beat ------------------- */
    if (beat === 3 || (beat === 6 && Math.random() < 0.75)) {
      comp(chord, m.root, when, 0.20 + Math.random() * 0.06);
    }
    if (beat === 0 && bar === 0) comp(chord, m.root, when, 0.22);

    /* --- right hand: a line through the changes ----------------------- */
    var line = LINES[(Math.floor(i / 8) + bar) % LINES.length];
    if (line[beat]) {
      /* strong beats land on a chord tone, weak ones may pass through */
      var strong = beat === 0 || beat === 4;
      var deg = strong ? chord[1 + ((Math.random() * 3) | 0)]
                       : chord[(Math.random() * 5) | 0] + pick([0, 0, 0, 1, -1, 2]);
      var oct = Math.random() < 0.22 ? 12 : 0;
      piano(semis(m.root, deg + 12 + oct), when, (strong ? 0.30 : 0.21) + Math.random() * 0.07,
        eighth * (strong ? 3.2 : 1.9));
      /* now and then, two notes together — the right hand has five fingers */
      if (strong && Math.random() < 0.35) {
        piano(semis(m.root, deg + 12 + oct + pick([3, 4, 5, 7])), when + 0.006, 0.16, eighth * 2.4);
      }
    }

    /* --- brushes: 2 and 4, with a ride keeping the swing -------------- */
    if (beat === 2 || beat === 6) brush(when, 0.16);
    if (beat === 0 || beat === 4) ride(when, 0.10);
    if (beat === 3 || beat === 7) ride(when, 0.065);
  }

  function tick() {
    if (!ctx || ctx.state !== 'running' || muted) { nextTime = 0; return; }
    var m = mood();
    var beatSecs = 60 / m.bpm;
    var eighth = beatSecs / 2;
    if (!nextTime) nextTime = t() + 0.12;
    while (nextTime < t() + 0.7) {
      /* swing: the off-beat eighth lands late, two thirds through the beat */
      var late = (step % 2) ? (m.swing * beatSecs - eighth) : 0;
      scheduleStep(step, nextTime + late, eighth);
      nextTime += eighth;
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

    verb = ctx.createConvolver();
    verb.buffer = impulse(1.9, 3.2);          // a club, not a cathedral
    var verbGain = ctx.createGain();
    verbGain.gain.value = 0.34;
    verb.connect(verbGain).connect(master);

    ['piano', 'bass', 'drums'].forEach(function (name) {
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
    ramp(bus.piano.gain, m.piano, secs || 2.2);
    ramp(bus.bass.gain, m.bass, secs || 2.2);
    ramp(bus.drums.gain, m.drums, secs || 2.2);
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
      /* come in at the top of the form, not halfway through a bar */
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
