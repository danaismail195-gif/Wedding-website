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
  var ptr = { x: 0.5, y: 0.5 };
  var edgeVel = 0;
  var camState = { tx: 0, ty: 0, z: 1 };
  var lastT = 0;
  var dragging = false, dragStartX = 0, dragStartPan = 0, dragMoved = 0;
  var revealTimer = null;

  /* ====================================================================
     BOOT
     ==================================================================== */
  function boot() {
    el.stage    = document.getElementById('stage');
    el.hub      = document.getElementById('hub');
    el.camera   = document.getElementById('camera');
    el.world    = document.getElementById('world');
    el.plane    = document.getElementById('entrance-plane');
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
    layout();
    makeMotes(lightMode ? 10 : 22);
    wireEvents();
    progress(1);

    /* Land the guest a little way along the path so it reads as a world
       that continues in both directions. */
    targetPan = pan = Math.min(maxPan, worldW * 0.06);
    applyCamera();

    setTimeout(function () { el.enterBtn.classList.add('is-ready'); }, 500);
    requestAnimationFrame(loop);
  }

  function progress(p) { el.bar.style.width = Math.round(p * 100) + '%'; }

  function enterSite() {
    el.loader.classList.add('is-gone');
    setTimeout(function () { el.loader.style.display = 'none'; }, 1000);
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
        '<span class="sub">' + room.sublabel + '</span></span></span>';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        if (dragMoved > 8) return;      // that was a drag, not a tap
        openRoom(room.id);
      });
      var warm = function () { prefetch(room.id); };
      b.addEventListener('pointerenter', warm);
      b.addEventListener('touchstart', warm, { passive: true });
      b.addEventListener('focus', function () { warm(); panTo(spot.x, true); });
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

    hubLayers.forEach(function (L) {
      L.node.style.width = (L.vw * k) + 'px';
      L.node.style.height = worldH + 'px';
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

  function applyCamera() {
    var py = (ptr.y - 0.5);
    for (var i = 0; i < hubLayers.length; i++) {
      var L = hubLayers[i];
      var ty = reduced ? 0 : -py * L.depth * 9;
      L.node.style.transform = 'translate3d(' + (-pan * L.depth).toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
    }
    el.camera.style.transform =
      'translate3d(' + camState.tx.toFixed(2) + 'px,' + camState.ty.toFixed(2) + 'px,0) scale(' + camState.z.toFixed(4) + ')';
  }

  /* --- the frame loop -------------------------------------------------- */
  function loop(t) {
    var dt = Math.min(0.05, (t - lastT) / 1000) || 0.016;
    lastT = t;

    if (view === 'hub' && !busy) {
      if (edgeVel) targetPan = clamp(targetPan + edgeVel * dt * 620, 0, maxPan);
      if (!dragging) pan = damp(pan, targetPan, 5.5, dt);
      else pan = targetPan;
      applyCamera();
      markNearest();
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
    if (W.audio) W.audio.duck(true);

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
        renderRoom(id);
        view = 'room';
        currentRoom = id;
        el.room.classList.add('is-open');
        el.beacon.classList.toggle('is-hidden', true);
        el.pathmap.classList.add('is-hidden');
        el.hint.classList.add('is-gone');
        if (location.hash !== '#' + id) history.pushState({ room: id }, '', '#' + id);
        tween({
          from: 1, to: 0, duration: reduced ? 0 : 760, delay: 60, ease: 'power2Out',
          onUpdate: function (v) { el.veil.style.opacity = v; },
          onComplete: function () {
            busy = false;
            el.panelScroll.scrollTop = 0;
            /* move keyboard focus into the room the guest just walked into */
            el.panelScroll.focus({ preventScroll: true });
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
    if (W.audio) W.audio.duck(false);

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
        if (location.hash) history.pushState({ room: null }, '', location.pathname + location.search);

        camState.tx = target.tx; camState.ty = target.ty; camState.z = reduced ? 1 : Z;
        applyCamera();

        var dur = reduced ? 0 : (lightMode ? 900 : 1250);
        tween({
          from: 1, to: 0, duration: dur, ease: 'power2InOut',
          onUpdate: function (v) {
            camState.tx = target.tx * v;
            camState.ty = target.ty * v;
            camState.z = 1 + (Z - 1) * v;
            applyCamera();
          },
          onComplete: function () {
            camState.tx = camState.ty = 0; camState.z = 1; applyCamera();
            busy = false;
            /* leave them standing in front of the door they just came out of */
            var e = entrances[idx];
            if (e) { e.node.focus({ preventScroll: true }); }
          }
        });
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
  function renderRoom(id) {
    var room = findRoom(id);
    var scene = prefetch(id);

    el.roomArt.innerHTML = '';
    scene.layers.forEach(function (L) {
      var d = document.createElement('div');
      d.className = 'room-layer';
      d.dataset.depth = L.depth;
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
    /* stagger the copy in, but guarantee it ends up visible either way */
    el.panelScroll.classList.add('is-entering');
    clearTimeout(revealTimer);
    revealTimer = setTimeout(function () { el.panelScroll.classList.remove('is-entering'); }, 1500);
    wireRoomUI();
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
    el.veil.style.setProperty('--vx', '50%');
    el.veil.style.setProperty('--vy', '50%');
    tween({
      from: 0, to: 1, duration: reduced ? 0 : 420, ease: 'power2In',
      onUpdate: function (v) { el.veil.style.opacity = v; },
      onComplete: function () {
        renderRoom(id);
        currentRoom = id;
        panTo(SPOTS[roomIndex(id)].x, true);
        history.replaceState({ room: id }, '', '#' + id);
        tween({
          from: 1, to: 0, duration: reduced ? 0 : 640, delay: 60, ease: 'power2Out',
          onUpdate: function (v) { el.veil.style.opacity = v; },
          onComplete: function () { busy = false; }
        });
      }
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
        'Please also drop us a line at hello@miraandsam.example so nothing is lost.</p>';
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

    /* pointer: pan when the guest looks toward the edges of the frame */
    global.addEventListener('pointermove', function (e) {
      ptr.x = e.clientX / global.innerWidth;
      ptr.y = e.clientY / global.innerHeight;
      if (view === 'hub' && !coarse && !dragging) {
        var edge = 0.2;
        if (ptr.x < edge) edgeVel = -(1 - ptr.x / edge);
        else if (ptr.x > 1 - edge) edgeVel = (ptr.x - (1 - edge)) / edge;
        else edgeVel = 0;
      }
      if (view === 'room') roomParallax(e);
    });
    global.addEventListener('pointerleave', function () { edgeVel = 0; });

    /* wheel / trackpad — either axis walks you along the path */
    el.hub.addEventListener('wheel', function (e) {
      if (view !== 'hub' || busy) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      targetPan = clamp(targetPan + d * 1.35, 0, maxPan);
      e.preventDefault();
    }, { passive: false });

    /* drag / swipe */
    /* Note: no setPointerCapture here — it would retarget the click away
       from the doorway button the guest actually pressed. */
    el.hub.addEventListener('pointerdown', function (e) {
      if (view !== 'hub' || busy) return;
      dragging = true; dragMoved = 0;
      dragStartX = e.clientX; dragStartPan = targetPan;
      el.hub.classList.add('is-dragging');
    });
    global.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      dragMoved = Math.max(dragMoved, Math.abs(dx));
      if (dragMoved > 4) targetPan = clamp(dragStartPan - dx, 0, maxPan);
    });
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
      el.audioBtn.setAttribute('aria-pressed', String(!on));
      el.audioBtn.querySelector('.on').style.display = on ? 'none' : 'block';
      el.audioBtn.querySelector('.off').style.display = on ? 'block' : 'none';
      if (on) W.audio.off(); else W.audio.on();
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
      }, 160);
    });
    global.addEventListener('orientationchange', function () { setTimeout(layout, 300); });
  }

  /* gentle parallax inside a room, following the pointer */
  function roomParallax(e) {
    if (reduced || lightMode) return;
    var nx = (e.clientX / global.innerWidth - 0.5);
    var ny = (e.clientY / global.innerHeight - 0.5);
    var layers = el.roomArt.children;
    for (var i = 0; i < layers.length; i++) {
      var d = parseFloat(layers[i].dataset.depth) || 0.2;
      layers[i].style.transform =
        'translate3d(' + (-nx * d * 22).toFixed(1) + 'px,' + (-ny * d * 12).toFixed(1) + 'px,0)';
    }
  }

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
