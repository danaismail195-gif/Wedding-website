/* ==========================================================================
   audio.js — the music
   --------------------------------------------------------------------------
   One licensed recording, played from an <audio> element on a loop.

   The track: "Swing Jazz Midnight Club" by Alex Morgan, from Pixabay
   (pixabay.com/music, track 568167). The Pixabay Content License allows use
   on a website, commercial or not, with no attribution required — which is
   why this one can be here when the earlier suggestions could not. Keep the
   file: if it is ever replaced, check the new one's licence covers *website*
   use, not just video, and whether it needs a credit line.

   Everything before this was synthesised in the browser because there was no
   licensed file to play. There is now, so all of that is gone: this file is
   an element, a volume, and a fade.

   No Web Audio. It would buy a per-room filter and cost the whole thing
   working when the site is opened by double-clicking the HTML — a media
   element routed through an AudioContext goes silent under file://, which is
   exactly the case that is hardest to notice and hardest to debug. Volume is
   enough: the rooms differ by level, and at background level nobody hears a
   lowpass anyway.

   Nothing starts until the guest presses "Begin the walk", because that
   click is the browser's price of admission for sound.
   ========================================================================== */
(function (global) {
  'use strict';

  /* Where the file might be. The site is published two ways — as index.html
     with a real assets/ folder, and as a flattened single file at the root of
     the repository with the mp3 beside it — so the first path that loads
     wins. Add to the front of this list, never take from the end. */
  var SOURCES = [
    'assets/audio/swing-jazz-midnight-club.mp3',
    'swing-jazz-midnight-club.mp3'
  ];

  /* How loud each place is, as a fraction of the master level. A recording
     cannot change key from room to room the way the old synthesised piece
     did; what it can do is lean in on the dancefloor and step back where
     there is something to read. */
  var ROOMS = {
    hub:        1.00,
    welcome:    0.86,
    wedding:    0.94,
    afterparty: 1.00,
    explore:    0.88,
    stay:       0.84,
    travel:     0.86,
    rsvp:       0.82
  };

  var BASE = 0.55;              // in the world
  var BASE_ROOM = 0.34;         // inside a room, under the copy

  var el = null, srcIndex = 0;
  var muted = true, ready = false;
  var sceneId = 'hub', base = BASE;
  var fadeTimer = null;

  function target() {
    return muted ? 0 : base * (ROOMS[sceneId] != null ? ROOMS[sceneId] : 1);
  }

  /* A fade, done by hand — an <audio> element has no ramp of its own. */
  function fade(to, secs) {
    if (!el) return;
    if (fadeTimer) clearInterval(fadeTimer);
    var from = el.volume, t0 = Date.now(), ms = Math.max(60, (secs || 1.2) * 1000);
    fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      /* ease out, so the last of a fade is not a cliff */
      var v = from + (to - from) * (1 - Math.pow(1 - k, 3));
      el.volume = Math.max(0, Math.min(1, v));
      if (k >= 1) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        if (to === 0 && !el.paused) el.pause();
      }
    }, 40);
  }

  function build() {
    if (el) return;
    el = new global.Audio();
    el.loop = true;
    el.preload = 'none';
    el.volume = 0;
    /* Work down the candidate paths. A missing file is a publishing mistake,
       not a bug in here: if the site is silent, the mp3 did not get uploaded
       alongside the HTML. */
    el.addEventListener('error', function () {
      if (srcIndex < SOURCES.length - 1) {
        srcIndex++;
        el.src = SOURCES[srcIndex];
        el.load();
        if (!muted) play();
      }
    });
    el.addEventListener('canplay', function () { ready = true; });
    el.src = SOURCES[srcIndex];
    /* In the document rather than floating detached: an <audio> with no
       controls draws nothing, and having it in the DOM means the next person
       to wonder "is the music actually playing?" can find it in the
       inspector instead of guessing. */
    el.id = 'ww-music';
    el.setAttribute('aria-hidden', 'true');
    if (global.document && global.document.body) global.document.body.appendChild(el);
  }

  function play() {
    if (!el) return;
    var p = el.play();
    /* Older Safari returns nothing; everything else returns a promise that
       rejects if the browser does not believe a human asked for this. */
    if (p && p.catch) p.catch(function () {});
  }

  global.WW = global.WW || {};
  global.WW.audio = {
    on: function () {
      build();
      muted = false;
      play();
      fade(target(), 2.2);
    },
    off: function () {
      muted = true;
      fade(0, 0.8);
    },
    /* which part of the world we are standing in */
    scene: function (id) {
      sceneId = ROOMS[id] != null ? id : 'hub';
      if (!muted) fade(target(), 1.8);
    },
    /* quieter inside a room, so the copy is the thing you notice */
    duck: function (isRoom) {
      base = isRoom ? BASE_ROOM : BASE;
      if (!muted) fade(target(), 1.0);
    }
  };
})(window);
