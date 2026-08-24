/* ==========================================================================
   app.js — the camera, the transitions, and everything the guest touches
   ========================================================================== */
(function (global) {
  'use strict';

  var W = global.WW, C = W.CONTENT, S = W.scenes, tween = W.tween, damp = W.damp, clamp = W.clamp;

  var reduced = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  global.WW_REDUCED_MOTION = reduced;
  var coarse = global.matchMedia('(pointer: coarse)').matches;
  var isSmall = function () { return global.innerWidth <= 900; };
  /* Phones get the lighter treatment: shorter camera moves, fewer motes. */
  var lightMode = coarse || isSmall();

  /* --- entrance placement along the promenade ------------------------- */
  var GROUND_Y = 1180;                       // world units: where the doorways stand
  var SPOTS = [
    { x: 330,  s: 0.92 }, { x: 810,  s: 0.86 }, { x: 1290, s: 0.95 },
    { x: 1760, s: 0.84 }, { x: 2230, s: 0.90 }, { x: 2700, s: 0.87 },
    { x: 3150, s: 1.00 }
  ];

  var el = {};            // cached DOM
  var hubLayers = [];     // [{node, depth, w}]
  var entrances = [];     // [{node, room, spot}]
  var roomCache = {};     // built scenes, kept once made
  var view = 'hub';       // 'hub' | 'room'
  var currentRoom = null;
  var busy = false;

  var k = 1, worldW = 0, worldH = 0, camTop = 0;
  var pan = 0, targetPan = 0, maxPan = 0;
  var camState = { tx: 0, ty: 0, z: 1 };
  var lastT = 0;
  var dragging = false, dragStartX = 0, dragStartPan = 0, dragMoved = 0;
  var revealTimer = null;

  /* Only redraw when something actually changed. Without this the camera
     wrote nine transforms every frame for ever, whether or not the world
     had moved — which is most of what made the site feel like it was
     grinding. */
  var camDirty = true;
  /* Was the last thing the guest touched a keyboard? Focus moves the camera
     for tab users; it must never do so after a mouse click, or the doorway
     appears to "centre itself" instead of opening. */
  var keyboardNav = false;
  /* While the camera is moving, every idle animation in the world is paused
     (see .is-moving in main.css). */
  var isMoving = false, movingUntil = 0;
  var DRAG_SLOP = 10;                        // px of travel before it is a drag

  function setMoving(now) {
    movingUntil = now + 220;
    if (isMoving) return;
    isMoving = true;
    el.hub.classList.add('is-moving');
    el.stage.classList.add('is-moving');
  }
  function forceStill() {
    isMoving = false; movingUntil = 0;
    el.hub.classList.remove('is-moving');
    el.stage.classList.remove('is-moving');
  }
  function releaseMoving(now) {
    if (!isMoving || now < movingUntil) return;
    isMoving = false;
    el.hub.classList.remove('is-moving');
    el.stage.classList.remove('is-moving');
  }

  /* history.pushState throws inside sandboxed frames and on some file://
     setups. The deep-link niceties are optional; the site is not. */
  function safeHistory(method, state, url) {
    try { history[method](state, '', url); } catch (err) {}
  }

  /* ====================================================================
     BOOT
     ==================================================================== */
  function boot() {
    el.stage    = document.getElementById('stage');
    el.hub      = document.getElementById('hub');
    el.camera   = document.getElementById('camera');
    el.world    = document.getElementById('world');
    el.plane    = document.getElementById('entrance-plane');
    el.grip     = document.getElementById('panel-grip');
    el.room     = document.getElementById('room');
    el.roomArt  = document.getElementById('room-art');
    el.panel    = document.getElementById('panel');
    el.panelScroll = document.getElementById('panel-scroll');
    el.veil     = document.getElementById('veil');
    el.beacon   = document.getElementById('beacon');
    el.pathmap  = document.getElementById('pathmap');
    el.hint     = document.getElementById('hint');
    el.loader   = document.getElementById('loader');
    el.bar      = document.getElementById('loader-bar');
    el.enterBtn = document.getElementById('enter-btn');
    el.particles= document.getElementById('particles');
    el.audioBtn = document.getElementById('audio-btn');
    el.backBtn  = document.getElementById('back-btn');
    el.brandName= document.getElementById('brand-name');
    el.brandDate= document.getElementById('brand-date');

    document.getElementById('loader-names').textContent = C.couple.names;
    document.getElementById('loader-sub').textContent = C.couple.dateLine + '  ·  ' + C.couple.place;
    document.getElementById('loader-note').textContent = C.couple.invitation;
    el.brandName.textContent = C.couple.names;
    el.brandDate.innerHTML = C.couple.dateLine + '<span class="place"> · ' + C.couple.place + '</span>';
    document.title = C.couple.names + ' — ' + C.couple.place;

    progress(0.15);
    buildHub();
    progress(0.55);
    buildEntrances();
    buildPathmap();
    progress(0.8);
    wireSheet();
    layout();
    makeMotes(lightMode ? 10 : 22);
    wireEvents();
    progress(1);

    /* Land the guest a little way along the path so it reads as a world
       that continues in both directions — but never so far that the first
       doorway is cut in half by the left edge. It is the one the "Start
       here" cue points at, and half a doorway is a poor thing to be told to
       start at. */
    var first = SPOTS[0];
    var firstLeft = (first.x - 320 * first.s * 0.5) * k;
    targetPan = pan = Math.max(0, Math.min(maxPan, worldW * 0.06, firstLeft - 46));
    applyCamera();

    setTimeout(function () { el.enterBtn.classList.add('is-ready'); }, 500);
    requestAnimationFrame(loop);
  }

  function progress(p) { el.bar.style.width = Math.round(p * 100) + '%'; }

  function setAudioButton(on) {
    el.audioBtn.setAttribute('aria-pressed', String(on));
    el.audioBtn.querySelector('.on').style.display = on ? 'block' : 'none';
    el.audioBtn.querySelector('.off').style.display = on ? 'none' : 'block';
  }

  function enterSite() {
    el.loader.classList.add('is-gone');
    setTimeout(function () { el.loader.style.display = 'none'; }, 1000);

    /* "Begin the walk" is a real click, which is the browser's price of
       admission for sound. Anyone who muted us last time stays muted. */
    var pref = null;
    try { pref = localStorage.getItem('ww-audio'); } catch (err) {}
    if (pref !== 'off' && W.audio) {
      W.audio.on();
      W.audio.scene('hub');
      setAudioButton(true);
    }
    /* honour a deep link like  …/index.html#rsvp  */
    var hash = (location.hash || '').replace('#', '');
    if (hash && findRoom(hash)) {
      setTimeout(function () { openRoom(hash, { instant: true }); }, 500);
    } else {
      showHint();
    }
  }

  function showHint() {
    if (reduced) return;
    el.hint.classList.remove('is-gone');
    setTimeout(function () { el.hint.classList.add('is-gone'); }, 6500);
  }

  /* ====================================================================
     THE HUB
     ==================================================================== */
  function buildHub() {
    var scene = S.hub();
    hubLayers = [];
    scene.layers.forEach(function (L) {
      var d = document.createElement('div');
      d.className = 'layer';
      d.innerHTML = L.svg;
      /* the foreground layer is drawn wider than the world so it never runs out */
      var vb = d.firstChild.getAttribute('viewBox').split(' ');
      d.dataset.vw = vb[2];
      el.world.appendChild(d);
      hubLayers.push({ node: d, depth: L.depth, vw: parseFloat(vb[2]) });
    });
    el.world.appendChild(el.plane);
    hubLayers.push({ node: el.plane, depth: 1.0, vw: S.HUB_W, isPlane: true });
  }

  function buildEntrances() {
    C.rooms.forEach(function (room, i) {
      var spot = SPOTS[i] || { x: 400 + i * 460, s: 1 };
      var b = document.createElement('button');
      b.className = 'entrance';
      b.type = 'button';
      b.dataset.room = room.id;
      b.setAttribute('aria-label', 'Enter ' + room.label + ' — ' + room.sublabel);
      b.innerHTML = S.entranceArt(room.id) +
        '<span class="entrance-label"><span class="inner">' +
        '<span class="num">' + room.num + '</span>' +
        '<span class="name">' + room.label + '</span>' +
        '<span class="sub">' + room.sublabel + '</span></span></span>' +
        '<span class="entrance-cta" aria-hidden="true">Enter</span>' +
        /* The promenade does not say where it begins. A small line of type
           over the first doorway, with an arrow pointing down into it, does
           — and nowhere else, or it stops meaning "start". It is decoration
           for a screen reader; the button's own label already says which
           doorway this is and the order is in the number. */
        (i === 0
          ? '<span class="entrance-start" aria-hidden="true">' +
              '<span class="word">Start here</span>' +
              '<svg class="arrow" viewBox="0 0 16 30" fill="none" stroke="currentColor" ' +
                'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M8 1 V25"/><path d="M2.5 19 L8 25.5 L13.5 19"/></svg>' +
            '</span>'
          : '');
      /* One press, one room. The only thing that cancels it is an actual
         drag of the world, and that needs real travel across the screen. */
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (dragMoved > DRAG_SLOP) return;   // that was a drag, not a tap
        openRoom(room.id);
      });
      var warm = function () { prefetch(room.id); };
      b.addEventListener('pointerenter', warm);
      b.addEventListener('touchstart', warm, { passive: true });
      b.addEventListener('focus', function () {
        warm();
        /* walk the camera over only for someone tabbing through */
        if (keyboardNav) panTo(spot.x, true);
      });
      el.plane.appendChild(b);
      entrances.push({ node: b, room: room, spot: spot });
    });
  }

  function buildPathmap() {
    C.rooms.forEach(function (room, i) {
      var d = document.createElement('button');
      d.className = 'dot';
      d.type = 'button';
      d.dataset.i = i;
      d.setAttribute('aria-label', 'Go to ' + room.label);
      d.innerHTML = '<i></i><span class="tip">' + room.label + '</span>';
      d.addEventListener('click', function () {
        prefetch(room.id);
        panTo((SPOTS[i] || { x: 400 }).x);
      });
      el.pathmap.appendChild(d);
    });
  }

  /* --- layout maths ---------------------------------------------------- */
  /* How much of the world's height to show, and where its floor sits.
     A phone held upright wants a much tighter crop than a laptop, or the
     guest ends up looking at a lot of empty sky. */
  var FLOOR_Y = 1330;
  function visibleHeight(aspect) {
    if (aspect >= 1.5) return 1250;   // laptop / desktop
    if (aspect >= 1.0) return 1100;   // tablet landscape, small windows
    if (aspect >= 0.7) return 960;    // tablet portrait
    return 870;                       // phone portrait
  }

  function layout() {
    var vw = global.innerWidth, vh = global.innerHeight;
    /* fill the frame, but always leave a decent stretch of path to walk */
    k = Math.max(vh / visibleHeight(vw / vh), vw / 2600);
    worldW = S.HUB_W * k;
    worldH = S.HUB_H * k;
    /* anchor the paving to the bottom of the screen rather than centring */
    camTop = Math.min(0, vh - FLOOR_Y * k);
    maxPan = Math.max(0, worldW - vw);

    el.camera.style.top = camTop + 'px';
    el.world.style.width = worldW + 'px';
    el.world.style.height = worldH + 'px';

    /* --- clip away the part of each layer that can never be seen --------
       This is the single biggest thing keeping the walk smooth, and it was
       measured on the live site rather than guessed at.
       A layer at depth d only ever translates by `pan * d`, and pan runs
       from 0 to maxPan. So the strip of it that can ever appear on screen is
       `viewport + maxPan * d` wide — and everything past that is artwork the
       guest could not see if they walked the promenade end to end. On a
       1280x800 laptop the sky layer is 2176px wide and needs 1370 of them.
       Chrome does not work that out for itself: it was rasterising the full
       width of all seven layers, which is what made panning cost what it
       cost. Measured live, with the ambient animations paused the way they
       are while the camera moves:
         no clip   34.8fps, 28 frames over 32ms in 2.5s, worst 79ms
         clipped   48.5fps,  4 frames over 32ms,         worst 41ms
       Two things about it that are not obvious and cost an experiment each:
       - **The clip has to be static.** A clip-path recomputed each frame to
         follow the pan is *worse than none at all* — 22fps — because
         changing it forces the re-raster it was supposed to avoid. This one
         is written once here and again only on resize.
       - **A wrapper with `overflow: hidden` does not do it.** Putting each
         layer inside a static viewport-sized window measured 29.9fps, worse
         than plain. It has to be a clip on the layer itself.
       It cannot hide anything: the strip removed is beyond the far end of
       the layer's own travel. Zooming through a doorway is safe too — the
       dolly only ever zooms *in*, so the visible region shrinks. */
    hubLayers.forEach(function (L) {
      var w = L.vw * k;
      L.node.style.width = w + 'px';
      L.node.style.height = worldH + 'px';
      /* not the doorway plane: it is exactly world-width anyway, and it is
         the one layer with things deliberately drawn outside the arch */
      var over = L.isPlane ? 0 : Math.max(0, w - (vw + maxPan * L.depth) - 2);
      L.node.style.clipPath = over > 1 ? 'inset(0 ' + Math.round(over) + 'px 0 0)' : 'none';
    });

    entrances.forEach(function (e) {
      var s = e.spot.s, w = 320 * s * k, h = 460 * s * k;
      e.node.style.width = w + 'px';
      e.node.style.height = h + 'px';
      e.node.style.left = (e.spot.x * k - w / 2) + 'px';
      e.node.style.top = ((GROUND_Y - 440 * s) * k) + 'px';
      e.node.style.bottom = 'auto';
      e.node.style.fontSize = (15 * Math.min(1.5, Math.max(1, k * 1.25))) + 'px';
    });

    targetPan = pan = clamp(pan, 0, maxPan);
    applyCamera();
  }

  /* The hub layers move on one axis only, and only when the guest has asked
     the world to move — a drag, the wheel, an arrow key, the path map.
     **They must never move because the cursor moved.** There used to be a
     head-tilt parallax here: every layer took a vertical offset of up to
     five pixels derived from the pointer's y, which meant a mouse crossing
     the screen rewrote nine transforms a frame for as long as it kept
     moving. Measured in a 1900x950 window that is nine layers of 3311x1364
     — 41 megapixels of CSS area, four times that in device pixels on a
     Retina screen — and they are not cheap textures the compositor can just
     slide about: the camera above them carries its own `will-change` and a
     scale, so a change to a child's transform is paid for in raster, not in
     compositing. Measured on this machine, writing an unchanged transform
     every frame cost nothing (50.3fps, no long frames); varying it by those
     same few pixels cost 25 frames over 32ms in two seconds and dropped the
     page to 37fps. On a machine with real memory pressure that is not jank,
     it is dropped tiles — rectangles of missing artwork and colour, which is
     exactly what Dana was seeing whenever the cursor moved.
     Five pixels of tilt is not worth a page that flickers. Do not put it
     back. If depth ever needs more life, it belongs in the artwork or in the
     panning parallax, which is already here and free. */
  function applyCamera() {
    for (var i = 0; i < hubLayers.length; i++) {
      var L = hubLayers[i];
      L.node.style.transform = 'translate3d(' + (-pan * L.depth).toFixed(2) + 'px,0,0)';
    }
    el.camera.style.transform =
      'translate3d(' + camState.tx.toFixed(2) + 'px,' + camState.ty.toFixed(2) + 'px,0) scale(' + camState.z.toFixed(4) + ')';
  }

  /* --- the frame loop -------------------------------------------------- */
  function loop(t) {
    var dt = Math.min(0.05, (t - lastT) / 1000) || 0.016;
    lastT = t;

    if (view === 'hub' && !busy) {
      var d = targetPan - pan;
      if (dragging) {
        if (d) { pan = targetPan; camDirty = true; setMoving(t); }
      } else if (Math.abs(d) > 0.08) {
        /* a firmer spring than before: the walk answers the wheel at once
           instead of sliding after it */
        pan = damp(pan, targetPan, 11, dt);
        camDirty = true;
        setMoving(t);
      } else if (pan !== targetPan) {
        pan = targetPan; camDirty = true;
      }
      if (camDirty) { applyCamera(); markNearest(); camDirty = false; }
      releaseMoving(t);
    }
    requestAnimationFrame(loop);
  }

  /* Highlight whichever doorway the guest is standing in front of. */
  var nearestIdx = -1, nearestOn = false;
  function markNearest() {
    var centre = pan + global.innerWidth / 2;
    var best = -1, bestD = 1e9;
    for (var i = 0; i < entrances.length; i++) {
      var d = Math.abs(entrances[i].spot.x * k - centre);
      if (d < bestD) { bestD = d; best = i; }
    }
    var on = bestD < 260 * k;
    if (best === nearestIdx && on === nearestOn) return;
    nearestIdx = best; nearestOn = on;
    entrances.forEach(function (e, i) { e.node.classList.toggle('is-near', i === best && on); });
    var dots = el.pathmap.children;
    for (var j = 0; j < dots.length; j++) dots[j].classList.toggle('is-on', j === best);
  }

  function panTo(worldX, quiet) {
    targetPan = clamp(worldX * k - global.innerWidth / 2, 0, maxPan);
    if (quiet) pan = targetPan;
  }

  /* ====================================================================
     TRANSITIONS  —  walking through a doorway
     ==================================================================== */
  function findRoom(id) {
    for (var i = 0; i < C.rooms.length; i++) if (C.rooms[i].id === id) return C.rooms[i];
    return null;
  }
  function roomIndex(id) {
    for (var i = 0; i < C.rooms.length; i++) if (C.rooms[i].id === id) return i;
    return -1;
  }

  function prefetch(id) {
    if (roomCache[id]) return roomCache[id];
    roomCache[id] = S.room(id);
    return roomCache[id];
  }

  function entranceScreenPoint(idx) {
    var e = entrances[idx];
    var s = e.spot.s;
    var lx = e.spot.x * k - pan;
    var ly = (GROUND_Y - 125 * s) * k;         // the middle of the archway
    return { x: lx, y: camTop + ly, lx: lx, ly: ly };
  }

  function openRoom(id, opts) {
    opts = opts || {};
    if (busy) return;
    var idx = roomIndex(id);
    if (idx < 0) return;
    busy = true;
    prefetch(id);
    /* --- build the room now, not when the veil finishes ------------------
       This used to happen inside the veil's onComplete, which put three
       expensive things on one frame: parsing about 90KB of SVG into five
       layers, laying the panel out, and the browser's first raster of a
       room it had never drawn. Measured, that frame was **260ms** going in
       and 300ms coming out — a visible lurch at exactly the moment the
       guest has just clicked something.
       The room is `visibility: hidden` until `is-open`, so building it a
       second and a half early shows nothing; it just moves the 23–36ms of
       parsing onto the frame where the guest clicked, where a beat is
       expected and the dolly is already starting, and leaves the swap frame
       with nothing to do but flip two classes. */
    renderRoom(id, true);
    if (W.audio) { W.audio.duck(true); W.audio.scene(id); }

    var fast = opts.fast;                       // arrived via the RSVP lantern
    var pt;
    if (fast || opts.instant) {
      var b = (opts.origin || el.beacon).getBoundingClientRect();
      pt = { x: b.left + b.width / 2, y: b.top + b.height / 2, lx: 0, ly: 0 };
      panTo(SPOTS[idx].x, true);                // remember where we "are"
      applyCamera();
    } else {
      pt = entranceScreenPoint(idx);
    }
    el.veil.style.setProperty('--vx', ((pt.x / global.innerWidth) * 100).toFixed(1) + '%');
    el.veil.style.setProperty('--vy', ((pt.y / global.innerHeight) * 100).toFixed(1) + '%');

    var dur = reduced ? 0 : (opts.instant ? 260 : (lightMode ? 950 : 1400));
    var Z = lightMode ? 1.9 : 3.4;

    if (!fast && !opts.instant && !reduced) {
      var target = zoomTarget(idx, Z);
      tween({
        from: 0, to: 1, duration: dur, ease: 'power2InOut',
        onUpdate: function (v) {
          camState.tx = target.tx * v;
          camState.ty = target.ty * v;
          camState.z = 1 + (Z - 1) * v;
          setMoving(performance.now());
          applyCamera();
        }
      });
    }

    /* the veil closes over the last third of the walk */
    tween({
      from: 0, to: 1, duration: Math.max(240, dur * 0.5), delay: dur * 0.42, ease: 'power2In',
      onUpdate: function (v) { el.veil.style.opacity = v; },
      onComplete: function () {
        el.hub.classList.add('is-hidden');
        revealPanel();
        view = 'room';
        currentRoom = id;
        el.room.classList.add('is-open');
        el.beacon.classList.toggle('is-hidden', true);
        el.pathmap.classList.add('is-hidden');
        el.hint.classList.add('is-gone');
        if (location.hash !== '#' + id) safeHistory('pushState', { room: id }, '#' + id);
        tween({
          from: 1, to: 0, duration: reduced ? 0 : 760, delay: 60, ease: 'power2Out',
          onUpdate: function (v) { el.veil.style.opacity = v; },
          onComplete: function () {
            busy = false;
            forceStill();
            el.panelScroll.scrollTop = 0;
            /* Move keyboard focus into the room the guest just walked into.
               Only for keyboard users: a mouse visitor would otherwise get a
               focus ring drawn around the whole panel. */
            if (keyboardNav) el.panelScroll.focus({ preventScroll: true });
          }
        });
      }
    });
  }

  function zoomTarget(idx, Z) {
    var pt = entranceScreenPoint(idx);
    return {
      tx: global.innerWidth / 2 - Z * pt.lx,
      ty: global.innerHeight * 0.46 - camTop - Z * pt.ly
    };
  }

  function closeRoom(opts) {
    if (busy || view !== 'room') return;
    busy = true;
    opts = opts || {};
    var idx = roomIndex(currentRoom);
    var Z = lightMode ? 1.9 : 3.4;
    var target = reduced ? { tx: 0, ty: 0 } : zoomTarget(idx, Z);
    if (W.audio) { W.audio.duck(false); W.audio.scene('hub'); }

    tween({
      from: 0, to: 1, duration: reduced ? 0 : 380, ease: 'power2In',
      onUpdate: function (v) { el.veil.style.opacity = v; },
      onComplete: function () {
        el.room.classList.remove('is-open');
        el.hub.classList.remove('is-hidden');
        view = 'hub';
        currentRoom = null;
        el.beacon.classList.remove('is-hidden');
        el.pathmap.classList.remove('is-hidden');
        if (location.hash) safeHistory('pushState', { room: null }, location.pathname + location.search);

        camState.tx = target.tx; camState.ty = target.ty; camState.z = reduced ? 1 : Z;
        applyCamera();

        var dur = reduced ? 0 : (lightMode ? 900 : 1250);
        /* --- let the promenade come back before moving it -----------------
           The hub has been `visibility: hidden` for as long as the guest was
           in the room, so its textures are gone; the line above makes it
           visible again at 3.4x, which means the very next frame has to
           rasterise the whole world from nothing at the largest scale it is
           ever drawn. Starting the zoom-out on that same frame measured
           **20.8fps with a 300ms hitch** — the worst moment on the site, and
           the first thing the guest sees on the way back out.
           The veil is fully opaque here and does not begin to lift for
           another 120ms, so there is room to spend two frames doing nothing.
           That is all this is: let the first raster land behind the veil,
           then start moving.
           A timer rather than requestAnimationFrame, because rAF does not run
           in a background tab: a guest who switched away mid-close would
           leave the walk out sitting unstarted until they came back. It
           recovers either way — tween.js snaps everything to its end on
           `visibilitychange` — but a timeout simply finishes. */
        var startOut = function () {
        tween({
          from: 1, to: 0, duration: dur, ease: 'power2InOut',
          onUpdate: function (v) {
            camState.tx = target.tx * v;
            camState.ty = target.ty * v;
            camState.z = 1 + (Z - 1) * v;
            setMoving(performance.now());
            applyCamera();
          },
          onComplete: function () {
            camState.tx = camState.ty = 0; camState.z = 1; applyCamera();
            busy = false;
            forceStill();
            /* Leave them standing in front of the door they just came out of.
               Focus goes back to it for anyone navigating by keyboard; for a
               mouse or a thumb that would only paint a large focus ring
               around the doorway they can already see. */
            var e = entrances[idx];
            if (e && keyboardNav) e.node.focus({ preventScroll: true });
          }
        });
        };
        if (reduced) startOut();
        else setTimeout(startOut, 34);          // about two frames
        tween({
          from: 1, to: 0, duration: reduced ? 0 : 640, delay: 120, ease: 'power2Out',
          onUpdate: function (v) { el.veil.style.opacity = v; }
        });
      }
    });
  }

  /* ====================================================================
     ROOM CONTENT
     ==================================================================== */
  function renderRoom(id, defer) {
    var room = findRoom(id);
    var scene = prefetch(id);

    el.roomArt.innerHTML = '';
    /* the first stop of the first layer is the top of that room's sky */
    var skyMatch = /stop-color="(#[0-9A-Fa-f]{6})"/.exec(scene.layers[0].svg);
    el.room.style.setProperty('--room-sky', skyMatch ? skyMatch[1] : '#1E2A3A');
    scene.layers.forEach(function (L) {
      var d = document.createElement('div');
      d.className = 'room-layer';
      d.innerHTML = L.svg;
      el.roomArt.appendChild(d);
    });

    var h = '';
    h += '<p class="panel-kicker" style="--i:0">' + room.kicker + '</p>';
    h += '<h2 class="panel-title" style="--i:1">' + room.title + '</h2>';
    h += '<div class="panel-rule" style="--i:2"></div>';
    h += '<p class="panel-intro" style="--i:3">' + room.intro + '</p>';

    var i = 4;
    room.blocks.forEach(function (b) {
      if (b.type === 'facts') {
        h += '<ul class="facts" style="--i:' + (i++) + '">';
        b.items.forEach(function (it) {
          h += '<li><span class="k">' + it.label + '</span><span class="v">' + it.value + '</span></li>';
        });
        h += '</ul>';
      } else if (b.type === 'note') {
        h += '<div class="note" style="--i:' + (i++) + '"><h3>' + b.title + '</h3><p>' + b.text + '</p></div>';
      } else if (b.type === 'cards') {
        if (b.filterable) {
          var groups = [];
          b.items.forEach(function (c) { if (groups.indexOf(c.group) < 0) groups.push(c.group); });
          h += '<div class="filters" style="--i:' + (i++) + '" role="group" aria-label="Filter">';
          h += '<button type="button" class="filter is-on" data-g="all">Everything</button>';
          groups.forEach(function (g) {
            h += '<button type="button" class="filter" data-g="' + g + '">' + g + '</button>';
          });
          h += '</div>';
        }
        h += '<div class="cards" style="--i:' + (i++) + '">';
        b.items.forEach(function (c, n) {
          h += '<article class="card" data-g="' + c.group + '">';
          h += '<h4>' + (b.filterable ? '<span class="pin">' + (n + 1) + '</span>' : '') + c.name + '</h4>';
          h += '<p>' + c.text + '</p>';
          if (c.meta) h += '<span class="meta">' + c.meta + '</span>';
          if (c.href) h += '<a class="card-link" href="' + c.href + '" target="_blank" rel="noopener">Map ↗</a>';
          h += '</article>';
        });
        h += '</div>';
      } else if (b.type === 'links') {
        h += '<div class="links" style="--i:' + (i++) + '">';
        b.items.forEach(function (l) {
          h += '<a class="link-btn" href="' + l.href + '" target="_blank" rel="noopener">' + l.text + '</a>';
        });
        h += '</div>';
      } else if (b.type === 'form') {
        h += rsvpFormHTML(i++);
      }
    });

    /* walk on to the next doorway without going back out first */
    var idx = roomIndex(id);
    h += '<nav class="room-nav" style="--i:' + (i++) + '">';
    h += '<button type="button" class="rn-prev"' + (idx <= 0 ? ' disabled' : '') + ' data-go="' + (idx > 0 ? C.rooms[idx - 1].id : '') + '">' +
      '<span>← Previous</span><span class="rn-name">' + (idx > 0 ? C.rooms[idx - 1].label : '—') + '</span></button>';
    h += '<button type="button" class="rn-next"' + (idx >= C.rooms.length - 1 ? ' disabled' : '') + ' data-go="' + (idx < C.rooms.length - 1 ? C.rooms[idx + 1].id : '') + '">' +
      '<span>Next →</span><span class="rn-name">' + (idx < C.rooms.length - 1 ? C.rooms[idx + 1].label : '—') + '</span></button>';
    h += '</nav>';

    el.panelScroll.innerHTML = h;
    el.panelScroll.scrollTop = 0;
    resetSheet();
    wireRoomUI();
    if (!defer) revealPanel();
  }

  /* The staggered arrival of the copy, kept separate from building it.
     A room is now built at the *start* of the walk through its doorway
     rather than at the end (see openRoom), which is a second and a half
     earlier — long enough that the stagger would have played out and its own
     1.5s safety timeout fired before the guest ever saw the room. So the
     building happens early and the reveal happens on arrival. */
  function revealPanel() {
    el.panelScroll.scrollTop = 0;
    el.panelScroll.classList.add('is-entering');
    clearTimeout(revealTimer);
    revealTimer = setTimeout(function () { el.panelScroll.classList.remove('is-entering'); }, 1500);
  }

  function wireRoomUI() {
    /* Explore filters */
    var filters = el.panelScroll.querySelectorAll('.filter');
    Array.prototype.forEach.call(filters, function (f) {
      f.addEventListener('click', function () {
        Array.prototype.forEach.call(filters, function (x) { x.classList.remove('is-on'); });
        f.classList.add('is-on');
        var g = f.dataset.g;
        Array.prototype.forEach.call(el.panelScroll.querySelectorAll('.card'), function (c) {
          c.classList.toggle('is-hidden', g !== 'all' && c.dataset.g !== g);
        });
      });
    });
    /* prev / next doorway */
    Array.prototype.forEach.call(el.panelScroll.querySelectorAll('.room-nav button'), function (b) {
      b.addEventListener('click', function () {
        var go = b.dataset.go;
        if (!go || busy) return;
        stepToRoom(go);
      });
    });
    var form = document.getElementById('rsvp-form');
    if (form) wireForm(form);
  }

  /* Move between rooms without walking back to the courtyard first. */
  function stepToRoom(id) {
    busy = true;
    prefetch(id);
    renderRoom(id, true);                       // built under the outgoing veil
    if (W.audio) W.audio.scene(id);
    el.veil.style.setProperty('--vx', '50%');
    el.veil.style.setProperty('--vy', '50%');
    tween({
      from: 0, to: 1, duration: reduced ? 0 : 420, ease: 'power2In',
      onUpdate: function (v) { el.veil.style.opacity = v; },
      onComplete: function () {
        revealPanel();
        currentRoom = id;
        panTo(SPOTS[roomIndex(id)].x, true);
        safeHistory('replaceState', { room: id }, '#' + id);
        tween({
          from: 1, to: 0, duration: reduced ? 0 : 640, delay: 60, ease: 'power2Out',
          onUpdate: function (v) { el.veil.style.opacity = v; },
          onComplete: function () { busy = false; }
        });
      }
    });
  }

  /* ====================================================================
     THE SHEET  —  on a phone the copy arrives as a bottom sheet, so the
     illustration keeps the top two thirds of the screen. Drag it up to
     read on; drag it back down to look at the world again.
     ==================================================================== */
  var sheet = { h: 0, min: 0, max: 0, startY: 0, startH: 0, moved: 0, expanded: false };

  function sheetBounds() {
    var vh = global.innerHeight;
    sheet.min = Math.round(vh * 0.34);
    sheet.max = Math.round(vh * 0.88);
  }
  function setSheetH(h) {
    sheet.h = clamp(h, sheet.min, sheet.max);
    el.panel.style.setProperty('--sheet-h', sheet.h + 'px');
  }
  function snapSheet(expand) {
    sheet.expanded = !!expand;
    el.panel.classList.toggle('is-expanded', sheet.expanded);
    setSheetH(sheet.expanded ? sheet.max : sheet.min);
  }
  function resetSheet() {
    if (!isSmall()) {
      el.panel.style.removeProperty('--sheet-h');
      el.panel.classList.remove('is-expanded');
      sheet.expanded = false;
      return;
    }
    sheetBounds();
    snapSheet(false);
  }

  function wireSheet() {
    var active = false, fromGrip = false;

    function down(e, grip) {
      if (!isSmall() || view !== 'room' || busy) return;
      /* from the body of the sheet, only when it has nothing left to scroll */
      if (!grip && sheet.expanded && el.panelScroll.scrollTop > 0) return;
      sheetBounds();
      active = true; fromGrip = grip; sheet.moved = 0;
      sheet.startY = e.clientY;
      sheet.startH = sheet.h || sheet.min;
      el.panel.classList.add('is-dragging');
    }
    el.grip.addEventListener('pointerdown', function (e) { down(e, true); });
    el.panelScroll.addEventListener('pointerdown', function (e) { down(e, false); });

    global.addEventListener('pointermove', function (e) {
      if (!active) return;
      var dy = sheet.startY - e.clientY;
      sheet.moved = Math.max(sheet.moved, Math.abs(dy));
      if (sheet.moved > 3) {
        if (e.cancelable) e.preventDefault();
        setSheetH(sheet.startH + dy);
      }
    }, { passive: false });

    var release = function () {
      if (!active) return;
      active = false;
      el.panel.classList.remove('is-dragging');
      /* a tap on the tab itself just toggles */
      if (sheet.moved <= 6) { if (fromGrip) snapSheet(!sheet.expanded); else setSheetH(sheet.startH); return; }
      snapSheet(sheet.h > (sheet.min + sheet.max) / 2);
    };
    global.addEventListener('pointerup', release);
    global.addEventListener('pointercancel', release);
    /* keyboard and assistive tech get a plain button */
    el.grip.addEventListener('click', function (e) { e.preventDefault(); });
    el.grip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sheetBounds(); snapSheet(!sheet.expanded); }
    });
  }

  /* ====================================================================
     RSVP
     ==================================================================== */
  function rsvpFormHTML(i) {
    var events = [
      { id: 'welcome',    name: 'Welcome Dinner',  when: 'Thursday 11 June, 7:30pm' },
      { id: 'wedding',    name: 'The Wedding',     when: 'Friday 12 June, 5:00pm' },
      { id: 'afterparty', name: 'The After-Party', when: 'Friday 12 June, 11:30pm' }
    ];
    var h = '<form id="rsvp-form" class="form-grid" style="--i:' + i + '" novalidate>';
    h += '<div class="field"><label for="rsvp-name">Your name<span aria-hidden="true"> *</span></label>' +
      '<input id="rsvp-name" name="name" type="text" autocomplete="name" required>' +
      '<span class="field-error" data-for="name"></span></div>';
    h += '<div class="field"><label for="rsvp-email">Email<span aria-hidden="true"> *</span></label>' +
      '<input id="rsvp-email" name="email" type="email" autocomplete="email" required>' +
      '<span class="field-error" data-for="email"></span></div>';

    h += '<fieldset class="fieldset"><legend>Which parts can you make?</legend>';
    events.forEach(function (ev) {
      h += '<label class="choice"><input type="checkbox" name="attending" value="' + ev.name + '">' +
        '<span>' + ev.name + '<span class="c-sub">' + ev.when + '</span></span></label>';
    });
    h += '<label class="choice"><input type="checkbox" name="attending" value="Cannot come">' +
      '<span>Sadly, I cannot come<span class="c-sub">We will miss you — and we will send photographs</span></span></label>';
    h += '<span class="field-error" data-for="attending"></span></fieldset>';

    h += '<div class="field"><label for="rsvp-guest">Bringing someone? Their name</label>' +
      '<input id="rsvp-guest" name="plusOne" type="text" placeholder="Leave blank if not"></div>';
    h += '<div class="field"><label for="rsvp-kids">Children coming with you</label>' +
      '<select id="rsvp-kids" name="kids"><option>None</option><option>1</option><option>2</option><option>3</option><option>4 or more</option></select></div>';
    h += '<div class="field"><label for="rsvp-meal">Anything we should feed you (or not)</label>' +
      '<select id="rsvp-meal" name="meal"><option>No restrictions</option><option>Vegetarian</option><option>Vegan</option>' +
      '<option>Pescatarian</option><option>Gluten free</option><option>Dairy free</option><option>Other — see note below</option></select></div>';
    h += '<div class="field"><label for="rsvp-note">A note for us</label>' +
      '<textarea id="rsvp-note" name="note" placeholder="Allergies, song requests, travel plans, anything at all"></textarea></div>';
    h += '<button type="submit" class="submit-btn">Send our reply</button>';
    h += '</form>';
    return h;
  }

  function wireForm(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var attending = Array.prototype.filter.call(form.querySelectorAll('[name=attending]'), function (c) { return c.checked; })
        .map(function (c) { return c.value; });

      var ok = true;
      setError(form, 'name', name ? '' : 'We need a name to put on the seating plan.', !name && (ok = false));
      setError(form, 'email', /.+@.+\..+/.test(email) ? '' : 'A working email, so we can reply.', !/.+@.+\..+/.test(email) && (ok = false));
      setError(form, 'attending', attending.length ? '' : 'Tick at least one — even if it is the last one.', !attending.length && (ok = false));
      if (!ok) {
        var bad = form.querySelector('.field-error:not(:empty)');
        if (bad) bad.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        return;
      }

      data.name = name;
      data.email = email;
      data.attending = attending.join(', ');
      data.plusOne = form.plusOne.value.trim();
      data.kids = form.kids.value;
      data.meal = form.meal.value;
      data.note = form.note.value.trim();
      data.sentAt = new Date().toISOString();

      var btn = form.querySelector('.submit-btn');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      var finish = function (offline) { showThanks(data, offline); };

      try { localStorage.setItem('ww-rsvp', JSON.stringify(data)); } catch (err) {}

      if (C.rsvpEndpoint) {
        fetch(C.rsvpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) { finish(!r.ok); }).catch(function () { finish(true); });
      } else {
        setTimeout(function () { finish(false); }, 550);
      }
    });
  }

  function setError(form, field, msg) {
    var s = form.querySelector('.field-error[data-for="' + field + '"]');
    if (s) s.textContent = msg;
  }

  function showThanks(data, offline) {
    var first = data.name.split(' ')[0];
    var coming = data.attending.indexOf('Cannot come') === 0;
    var h = '<div class="form-done">';
    h += '<div class="seal" aria-hidden="true">✦</div>';
    h += '<h3>' + (coming ? 'Thank you for telling us' : 'Wonderful, ' + first) + '</h3>';
    h += '<p>' + (coming
      ? 'We are sorry to miss you. If anything changes, just email us — there is nearly always room for one more.'
      : 'Your reply is saved. We will send the full timings, the bus times and the packing advice nobody asked for closer to June.') + '</p>';
    if (offline) {
      h += '<p style="font-size:.85rem">We could not reach the server just now, so your answers are saved on this device. ' +
        'Please also drop us a line at ' + (C.couple.email || 'us') + ' so nothing is lost.</p>';
    }
    h += '<div class="links" style="justify-content:center"><button type="button" class="link-btn" id="rsvp-again">Reply for someone else</button></div>';
    h += '</div>';
    var form = document.getElementById('rsvp-form');
    form.outerHTML = h;
    var again = document.getElementById('rsvp-again');
    if (again) again.addEventListener('click', function () { renderRoom('rsvp'); });
  }

  /* ====================================================================
     INPUT
     ==================================================================== */
  function wireEvents() {
    el.enterBtn.addEventListener('click', enterSite);

    /* **Nothing on this site moves because the cursor moved.** There is no
       pointermove listener here at all now, and that is the fix for the
       flickering: not a throttle, not a smaller amplitude — no artwork
       reads the pointer. The world walks itself only when the guest walks
       it: a drag, the wheel, the arrow keys, the path map. The two things
       that used to answer the mouse are both gone, and both for the same
       reason:
       - the **edge-pan**, removed a round ago, which slid a doorway out
         from under the cursor the moment you tried to click it;
       - the **parallax tilt**, removed now, which moved every layer by a
         few pixels on every pointermove and made the compositor re-raster
         several very large SVG layers for as long as the mouse kept going.
       Measured after the change: three seconds of the cursor crossing the
       whole screen gives 50fps and not one frame over 32ms, on the
       promenade and inside a room, which is exactly what sitting still
       gives. */

    /* wheel / trackpad — either axis walks you along the path */
    el.hub.addEventListener('wheel', function (e) {
      if (view !== 'hub' || busy) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) d *= 16;          // some mice report lines, not pixels
      else if (e.deltaMode === 2) d *= global.innerWidth;
      targetPan = clamp(targetPan + d * 2.4, 0, maxPan);
      e.preventDefault();
    }, { passive: false });

    /* drag / swipe */
    /* Note: no setPointerCapture here — it would retarget the click away
       from the doorway button the guest actually pressed. */
    el.hub.addEventListener('pointerdown', function (e) {
      keyboardNav = false;
      if (view !== 'hub' || busy) return;
      dragging = true; dragMoved = 0;
      dragStartX = e.clientX; dragStartPan = targetPan;
      el.hub.classList.add('is-dragging');
    });
    global.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      dragMoved = Math.max(dragMoved, Math.abs(dx));
      if (dragMoved > DRAG_SLOP) targetPan = clamp(dragStartPan - dx, 0, maxPan);
    }, { passive: true });
    var endDrag = function () {
      if (!dragging) return;
      dragging = false;
      el.hub.classList.remove('is-dragging');
      setTimeout(function () { dragMoved = 0; }, 80);
    };
    global.addEventListener('pointerup', endDrag);
    global.addEventListener('pointercancel', endDrag);

    /* keyboard */
    global.addEventListener('keydown', function (e) {
      var key = e.key || '';
      if (key === 'Tab' || key.indexOf('Arrow') === 0) keyboardNav = true;
      if (e.key === 'Escape' && view === 'room') { closeRoom(); return; }
      if (view !== 'hub') return;
      if (e.key === 'ArrowRight') targetPan = clamp(targetPan + 260, 0, maxPan);
      if (e.key === 'ArrowLeft')  targetPan = clamp(targetPan - 260, 0, maxPan);
      if (e.key === 'Home') targetPan = 0;
      if (e.key === 'End')  targetPan = maxPan;
    });

    el.backBtn.addEventListener('click', function () { closeRoom(); });

    el.beacon.addEventListener('click', function () {
      if (view === 'room') {
        if (currentRoom !== 'rsvp') stepToRoom('rsvp');
      } else {
        openRoom('rsvp', { fast: true, origin: el.beacon });
      }
    });
    el.beacon.addEventListener('pointerenter', function () { prefetch('rsvp'); });

    el.audioBtn.addEventListener('click', function () {
      var on = el.audioBtn.getAttribute('aria-pressed') === 'true';
      setAudioButton(!on);
      try { localStorage.setItem('ww-audio', on ? 'off' : 'on'); } catch (err) {}
      if (on) { W.audio.off(); } else { W.audio.on(); W.audio.scene(view === 'room' ? currentRoom : 'hub'); }
    });

    var onHistory = function () {
      var hash = (location.hash || '').replace('#', '');
      if (hash && findRoom(hash)) {
        if (view === 'room' && currentRoom !== hash) stepToRoom(hash);
        else if (view === 'hub') openRoom(hash);
      } else if (view === 'room') {
        closeRoom();
      }
    };
    /* back/forward buttons, and hand-typed or shared #room links */
    global.addEventListener('popstate', onHistory);
    global.addEventListener('hashchange', onHistory);

    var rt;
    global.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        lightMode = coarse || isSmall();
        layout();
        if (view === 'room') { sheetBounds(); snapSheet(sheet.expanded); }
        else resetSheet();
      }, 160);
    });
    global.addEventListener('orientationchange', function () { setTimeout(layout, 300); });
  }

  /* There used to be an applyRoomParallax() here, sliding the five layers
     of a room by up to 22px horizontally and 12px vertically as the cursor
     crossed them. It is gone for the same reason the hub's tilt is gone,
     and it was measurably the worse of the two: the wedding room is five
     layers of roughly a megapixel each carrying seventeen figures, and
     moving them all on every pointermove took the room from 49fps and no
     long frames to 38fps and 29 of them in two and a half seconds. The
     depth in these scenes is drawn in — the ridges, the water, the terrace
     — and it does not need the cursor's help. */

  /* ====================================================================
     MOTES OF LIGHT
     ==================================================================== */
  function makeMotes(n) {
    if (reduced) return;
    for (var i = 0; i < n; i++) {
      var m = document.createElement('span');
      m.className = 'mote';
      var size = 3 + Math.random() * 7;
      m.style.width = size + 'px';
      m.style.height = size + 'px';
      m.style.left = (Math.random() * 100) + '%';
      m.style.top = (100 + Math.random() * 30) + '%';
      m.style.setProperty('--dx', ((Math.random() - 0.5) * 220).toFixed(0) + 'px');
      m.style.animationDuration = (16 + Math.random() * 26) + 's';
      m.style.animationDelay = (-Math.random() * 40) + 's';
      m.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
      el.particles.appendChild(m);
    }
  }

  /* handy while developing: WW.debug() in the console */
  W.debug = function () { return { view: view, busy: busy, dragMoved: dragMoved, pan: pan, k: k, cache: Object.keys(roomCache) }; };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
