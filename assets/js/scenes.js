/* ==========================================================================
   scenes.js — the eight places in the world
   Hub (the courtyard path) + one environment per entrance.
   Each scene returns { w, h, layers: [{ depth, svg }] }.
   ========================================================================== */
(function (global) {
  'use strict';
  var A = global.WW.art, P = A.P, f = A.f, rand = A.rand;

  var HUB_W = 3400, HUB_H = 1400;
  var ROOM_W = 1600, ROOM_H = 900;

  function wrap(w, h, inner) { return A.svgWrap(w, h, inner); }

  function skyGrad(w, h, stops, yTo) {
    var id = A.uid('sky'), s = '';
    for (var i = 0; i < stops.length; i++) s += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"/>';
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' + s + '</linearGradient></defs>' +
      '<rect x="0" y="0" width="' + w + '" height="' + (yTo || h) + '" fill="url(#' + id + ')"/>';
  }

  function stars(w, h, n, seed, color) {
    var r = rand(seed || 41), g = '';
    for (var i = 0; i < n; i++) {
      g += '<circle class="ww-twinkle" cx="' + f(r() * w) + '" cy="' + f(r() * h) + '" r="' + f(0.8 + r() * 1.7) +
           '" fill="' + (color || '#FFF6E2') + '" opacity="' + (0.35 + r() * 0.6).toFixed(2) +
           '" style="animation-delay:' + (-r() * 5).toFixed(1) + 's"/>';
    }
    return g;
  }

  /* ======================================================================
     THE HUB — a stone promenade above the bay, seven doorways along it
     ====================================================================== */
  function hub() {
    var L = [];

    /* 1 · sky */
    L.push({ depth: 0.05, svg: wrap(HUB_W, HUB_H,
      skyGrad(HUB_W, HUB_H, [[0, '#8FB0C4'], [0.42, '#D9C3B4'], [0.72, '#F2D3AE'], [1, '#F9E6C9']], 900) +
      A.sun(2560, 470, 62, '#FFF1D2', P.gold) +
      '<rect x="0" y="700" width="' + HUB_W + '" height="200" fill="#F7DEBB" opacity=".5"/>'
    )});

    /* 2 · clouds + birds */
    L.push({ depth: 0.12, svg: wrap(HUB_W, HUB_H,
      A.clouds(HUB_W, HUB_H, 5, '#FFF3E0', 0.75, [150, 520]) +
      A.birds(760, 380, 1.2, 6, 9, 'rgba(59,42,34,.42)') +
      A.birds(2180, 300, 0.9, 4, 14, 'rgba(59,42,34,.34)')
    )});

    /* 3 · far ridge */
    L.push({ depth: 0.22, svg: wrap(HUB_W, HUB_H,
      '<path d="' + A.ridge(HUB_W, HUB_H, { baseline: 830, amp: 330, peaks: 8, seed: 21 }) + '" fill="#9FB6C4" opacity=".85"/>'
    )});

    /* 4 · middle ridge with a distant village at its foot */
    L.push({ depth: 0.36, svg: wrap(HUB_W, HUB_H,
      '<path d="' + A.ridge(HUB_W, HUB_H, { baseline: 855, amp: 250, peaks: 12, seed: 33, phase: 1.2 }) + '" fill="' + P.dusty + '"/>' +
      '<path d="' + A.ridge(HUB_W, HUB_H, { baseline: 862, amp: 150, peaks: 16, seed: 44, phase: 2.4 }) + '" fill="' + P.dustyDeep + '" opacity=".55"/>' +
      A.houses(420, 866, 7, 0.5, 51, { wall: '#DCCDB6', roof: '#B9704E', window: 'rgba(59,42,34,.32)' }) +
      A.houses(1980, 866, 9, 0.46, 57, { wall: '#DCCDB6', roof: '#B9704E', window: 'rgba(59,42,34,.32)' }) +
      A.campanile(2140, 866, 74, 0.55, { wall: '#DCCDB6', roof: '#B9704E' }) +
      A.cypress(700, 868, 52, 'rgba(76,92,68,.7)') + A.cypress(724, 868, 40, 'rgba(76,92,68,.6)') +
      A.cypress(2620, 868, 58, 'rgba(76,92,68,.7)')
    )});

    /* 5 · the bay itself */
    L.push({ depth: 0.52, svg: wrap(HUB_W, HUB_H,
      A.water(0, 866, HUB_W, 210, '#5E8E93', '#2E5A63', 61, '#FFEFD6') +
      /* the little island church, Our Lady of the Rocks */
      '<ellipse cx="1180" cy="960" rx="86" ry="15" fill="#CFC0A6"/>' +
      A.houses(1128, 952, 3, 0.42, 67, { wall: '#EDE0C8', roof: '#C4643C', window: 'rgba(59,42,34,.4)' }) +
      '<circle cx="1196" cy="928" r="15" fill="#5C7E96"/>' +
      '<rect x="1194" y="898" width="2.5" height="18" fill="#3B2A22"/>' +
      A.boat(600, 1000, 1.1, '#3B2A22', '#F4E7D3') +
      A.boat(1720, 1032, 1.35, '#4E3A2C', '#FBEFD8') +
      A.boat(2900, 990, 0.95, '#3B2A22', null)
    )});

    /* 6 · the near shore, just below the promenade */
    L.push({ depth: 0.72, svg: wrap(HUB_W, HUB_H,
      A.houses(120, 1078, 6, 0.78, 71, { wall: '#EBDCC2', roof: P.terracotta, window: 'rgba(59,42,34,.45)' }) +
      A.campanile(560, 1078, 122, 0.8, { wall: '#EFE2CA', roof: P.terraDeep }) +
      A.houses(1420, 1078, 5, 0.72, 79, { wall: '#E7D8BE', roof: P.terraLight, window: 'rgba(59,42,34,.42)' }) +
      A.houses(2760, 1078, 7, 0.75, 83, { wall: '#EBDCC2', roof: P.terracotta, window: 'rgba(59,42,34,.45)' }) +
      A.cypress(1060, 1080, 200, P.oliveDeep) + A.cypress(1104, 1080, 158, '#4F5E3C') +
      A.cypress(2360, 1080, 186, P.oliveDeep) +
      A.cypress(3280, 1080, 172, '#54643F')
    )});

    /* 7 · the promenade you are standing on — entrances live on this plane */
    var ground = '';
    ground += A.stoneWall(-60, 1064, HUB_W + 120, 40, 17, '#D6C5A8');
    /* parapet posts */
    for (var px = 40; px < HUB_W; px += 210) {
      ground += '<rect x="' + f(px) + '" y="1044" width="20" height="62" rx="3" fill="#CBB795"/>';
    }
    ground += '<rect x="-60" y="1104" width="' + (HUB_W + 120) + '" height="300" fill="#E0CFB0"/>';
    /* paving */
    var rr = rand(91);
    for (var gy = 1120; gy < 1400; gy += 40) {
      var t = (gy - 1120) / 280;
      ground += '<line x1="-60" y1="' + gy + '" x2="' + (HUB_W + 60) + '" y2="' + gy + '" stroke="rgba(139,112,80,' + (0.10 + t * 0.10).toFixed(2) + ')" stroke-width="1.6"/>';
      var step = 90 + t * 90;
      for (var gx = -40 + rr() * step; gx < HUB_W; gx += step) {
        ground += '<line x1="' + f(gx) + '" y1="' + f(gy) + '" x2="' + f(gx + (t * 26 - 13)) + '" y2="' + f(gy + 40) + '" stroke="rgba(139,112,80,' + (0.08 + t * 0.08).toFixed(2) + ')" stroke-width="1.4"/>';
      }
    }
    ground += '<rect x="-60" y="1104" width="' + (HUB_W + 120) + '" height="300" fill="url(#' + (function () {
      return 'gnone';
    })() + ')" opacity="0"/>';
    ground += A.grassTufts(0, 1106, HUB_W, 40, 23, 'rgba(91,106,68,.55)');
    L.push({ depth: 1.0, svg: wrap(HUB_W, HUB_H, ground) });

    /* 8 · foreground — drawn wider so it never runs out as it rushes past */
    var FG_W = 4600;
    L.push({ depth: 1.25, svg: wrap(FG_W, HUB_H,
      A.branch(-40, 90, 1.25, false, { leaf: '#4A5A38', leaf2: P.oliveDeep }, 29) +
      A.branch(FG_W + 40, 130, 1.15, true, { leaf: '#44532F', leaf2: '#5B6A44' }, 31) +
      A.branch(1900, 40, 0.9, false, { leaf: '#4A5A38', leaf2: P.oliveDeep }, 37) +
      /* terracotta urns on the promenade edge */
      urn(320, 1400, 1.15) + urn(2280, 1400, 0.95) + urn(3900, 1400, 1.05)
    )});

    return { w: HUB_W, h: HUB_H, layers: L };
  }

  function urn(x, baseY, s) {
    var g = '<path d="M ' + f(x - 46 * s) + ' ' + f(baseY - 96 * s) +
      ' q ' + f(10 * s) + ' ' + f(90 * s) + ' ' + f(22 * s) + ' ' + f(96 * s) +
      ' l ' + f(48 * s) + ' 0 q ' + f(12 * s) + ' -' + f(6 * s) + ' ' + f(22 * s) + ' -' + f(96 * s) + ' Z" fill="' + P.terracotta + '"/>';
    g += '<rect x="' + f(x - 52 * s) + '" y="' + f(baseY - 106 * s) + '" width="' + f(104 * s) + '" height="' + f(14 * s) + '" rx="' + f(5 * s) + '" fill="' + P.terraDeep + '"/>';
    var r = rand(x | 0), leaves = '';
    for (var i = 0; i < 9; i++) {
      var lx = x + (r() - 0.5) * 78 * s, ly = baseY - (108 + r() * 52) * s;
      leaves += '<ellipse cx="' + f(lx) + '" cy="' + f(ly) + '" rx="' + f((16 + r() * 10) * s) + '" ry="' + f((7 + r() * 5) * s) +
        '" fill="' + (i % 2 ? '#6E7F52' : '#87975F') + '" transform="rotate(' + ((r() * 120 - 60) | 0) + ' ' + f(lx) + ' ' + f(ly) + ')"/>';
    }
    return g + '<g class="ww-sway" style="transform-origin:' + f(x) + 'px ' + f(baseY - 100 * s) + 'px">' + leaves + '</g>';
  }

  /* ======================================================================
     ENTRANCE ARTWORK — 320 x 460, standing on y = 440
     ====================================================================== */
  function entranceArt(id) {
    var g = '', glowId = A.uid('gl'), inId = A.uid('in');
    var cx = 160, baseY = 440, aw = 128, ah = 250, ax = cx - aw / 2, ay = baseY - ah;

    function archShape(x, y, w, h) {
      return 'M ' + f(x) + ' ' + f(y + h) + ' L ' + f(x) + ' ' + f(y + w / 2) +
        ' A ' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x + w) + ' ' + f(y + w / 2) +
        ' L ' + f(x + w) + ' ' + f(y + h) + ' Z';
    }

    var interiors = {
      welcome:    ['#F6D9A8', '#C4643C'],
      wedding:    ['#FFE9BE', '#D98A5E'],
      afterparty: ['#B98CC9', '#3A2550'],
      explore:    ['#BFE4E2', '#4FA3A5'],
      stay:       ['#F3D9B2', '#A9613C'],
      travel:     ['#D8E8EF', '#6E93A6'],
      rsvp:       ['#FFE7B4', '#C4643C']
    };
    var pair = interiors[id] || interiors.welcome;

    g += '<defs>' +
      '<linearGradient id="' + inId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + pair[0] + '"/><stop offset="1" stop-color="' + pair[1] + '"/></linearGradient>' +
      '<radialGradient id="' + glowId + '"><stop offset="0" stop-color="' + pair[0] + '" stop-opacity=".9"/>' +
      '<stop offset="1" stop-color="' + pair[0] + '" stop-opacity="0"/></radialGradient></defs>';

    /* shadow on the paving */
    g += '<ellipse cx="' + cx + '" cy="' + (baseY + 6) + '" rx="' + f(aw * 0.95) + '" ry="13" fill="rgba(90,68,44,.22)"/>';

    /* the pillar / wall the arch is cut into */
    g += '<path d="M ' + f(ax - 34) + ' ' + f(baseY) + ' L ' + f(ax - 34) + ' ' + f(ay - 26) +
      ' Q ' + f(cx) + ' ' + f(ay - 66) + ' ' + f(ax + aw + 34) + ' ' + f(ay - 26) +
      ' L ' + f(ax + aw + 34) + ' ' + f(baseY) + ' Z" fill="#E7D8BC"/>';
    g += '<path d="M ' + f(ax + aw + 6) + ' ' + f(baseY) + ' L ' + f(ax + aw + 6) + ' ' + f(ay - 40) +
      ' Q ' + f(cx + 60) + ' ' + f(ay - 52) + ' ' + f(ax + aw + 34) + ' ' + f(ay - 26) +
      ' L ' + f(ax + aw + 34) + ' ' + f(baseY) + ' Z" fill="rgba(139,112,80,.14)"/>';

    /* glow spilling out of the doorway */
    g += '<ellipse class="ww-glow-soft" cx="' + cx + '" cy="' + f(ay + ah * 0.55) + '" rx="150" ry="200" fill="url(#' + glowId + ')" opacity=".55"/>';

    /* the opening */
    g += '<path class="ww-door-open" d="' + archShape(ax, ay, aw, ah) + '" fill="url(#' + inId + ')"/>';

    /* keystone + arch band */
    g += '<path d="' + archShape(ax - 9, ay - 9, aw + 18, ah + 9) + '" fill="none" stroke="#D3C0A0" stroke-width="9"/>';
    g += '<path d="M ' + f(cx - 11) + ' ' + f(ay - 16) + ' l 22 0 l 5 20 l -32 0 Z" fill="#D3C0A0"/>';

    var r = rand(id.length * 17 + 5);

    /* --- per-entrance detail ------------------------------------------ */
    if (id === 'welcome') {
      g += A.stringLights(ax - 40, ay - 30, ax + aw + 40, ay - 24, 30, 6, 3);
      /* a laid table glimpsed inside */
      g += '<rect x="' + f(cx - 44) + '" y="' + f(baseY - 62) + '" width="88" height="7" rx="2" fill="rgba(59,42,34,.5)"/>';
      g += '<rect x="' + f(cx - 36) + '" y="' + f(baseY - 55) + '" width="5" height="55" fill="rgba(59,42,34,.4)"/>';
      g += '<rect x="' + f(cx + 31) + '" y="' + f(baseY - 55) + '" width="5" height="55" fill="rgba(59,42,34,.4)"/>';
      g += '<circle class="ww-flicker" cx="' + f(cx - 16) + '" cy="' + f(baseY - 74) + '" r="6" fill="#FFF0C6"/>';
      g += '<circle class="ww-flicker" cx="' + f(cx + 18) + '" cy="' + f(baseY - 78) + '" r="5" fill="#FFF0C6" style="animation-delay:-1.3s"/>';
    } else if (id === 'wedding') {
      /* olive garland over the arch */
      for (var i = 0; i < 22; i++) {
        var t = i / 21, gx = ax - 12 + t * (aw + 24);
        var gy = ay + 22 - Math.sin(t * Math.PI) * 44;
        g += '<ellipse cx="' + f(gx) + '" cy="' + f(gy) + '" rx="' + f(9 + r() * 4) + '" ry="' + f(3.4 + r() * 1.6) +
             '" fill="' + (i % 3 ? P.oliveDeep : P.olive) + '" transform="rotate(' + ((r() * 140 - 70) | 0) + ' ' + f(gx) + ' ' + f(gy) + ')"/>';
      }
      /* the bay, seen through the doorway */
      g += '<rect x="' + f(ax + 4) + '" y="' + f(baseY - 96) + '" width="' + f(aw - 8) + '" height="96" fill="#6E9FA0" opacity=".85"/>';
      g += '<rect x="' + f(ax + 4) + '" y="' + f(baseY - 96) + '" width="' + f(aw - 8) + '" height="4" fill="#FFF0C6" opacity=".7"/>';
      g += A.cypress(ax + 22, baseY, 92, 'rgba(59,55,34,.55)');
    } else if (id === 'afterparty') {
      g += A.lantern(ax - 20, ay + 66, 1.1, ay - 22);
      g += A.lantern(ax + aw + 20, ay + 82, 1.1, ay - 16);
      g += '<circle class="ww-pulse" cx="' + cx + '" cy="' + f(ay + 96) + '" r="34" fill="#E9C6F5" opacity=".45"/>';
      g += A.dancer(cx - 20, baseY - 4, 92, 'rgba(40,24,58,.62)', 0);
      g += A.dancer(cx + 24, baseY - 4, 84, 'rgba(40,24,58,.5)', -0.7);
    } else if (id === 'explore') {
      /* a gap in the wall with a path climbing away */
      g += '<path d="M ' + f(cx - 26) + ' ' + f(baseY) + ' L ' + f(cx - 8) + ' ' + f(ay + 76) + ' L ' + f(cx + 10) + ' ' + f(ay + 76) + ' L ' + f(cx + 30) + ' ' + f(baseY) + ' Z" fill="#E8DCC0" opacity=".85"/>';
      g += '<rect x="' + f(cx + 44) + '" y="' + f(baseY - 150) + '" width="7" height="150" fill="#7A6247"/>';
      g += '<path d="M ' + f(cx + 51) + ' ' + f(baseY - 148) + ' l 52 0 l 12 12 l -12 12 l -52 0 Z" fill="' + P.terracotta + '"/>';
      g += '<path d="M ' + f(cx + 51) + ' ' + f(baseY - 118) + ' l 40 0 l 12 11 l -12 11 l -40 0 Z" fill="' + P.olive + '"/>';
      g += A.cypress(ax + 16, baseY, 104, 'rgba(76,92,68,.6)');
    } else if (id === 'stay') {
      /* shuttered windows either side, a key on a hook */
      g += shutter(ax - 26, ay + 34, 0.85);
      g += shutter(ax + aw + 10, ay + 34, 0.85);
      g += '<rect x="' + f(cx - 30) + '" y="' + f(baseY - 118) + '" width="60" height="118" rx="4" fill="rgba(59,42,34,.28)"/>';
      g += '<circle cx="' + f(cx + 18) + '" cy="' + f(baseY - 60) + '" r="4" fill="' + P.gold + '"/>';
      g += '<path class="ww-swing" style="transform-origin:' + f(cx + 60) + 'px ' + f(ay + 20) + 'px" d="M ' + f(cx + 60) + ' ' + f(ay + 20) + ' l 0 26 m -5 0 a 5 6 0 1 0 10 0 a 5 6 0 1 0 -10 0 m 5 6 l 0 12 l 5 0 m -5 6 l 4 0" stroke="' + P.gold + '" stroke-width="2.6" fill="none"/>';
    } else if (id === 'travel') {
      /* iron gate bars + a ferry on the water beyond */
      g += '<rect x="' + f(ax + 4) + '" y="' + f(baseY - 76) + '" width="' + f(aw - 8) + '" height="76" fill="#7FA3B0" opacity=".8"/>';
      g += A.boat(cx - 6, baseY - 40, 0.85, '#31485A', '#F4E7D3');
      for (var b = 0; b < 6; b++) {
        var bx2 = ax + 12 + b * ((aw - 24) / 5);
        g += '<line x1="' + f(bx2) + '" y1="' + f(ay + 26) + '" x2="' + f(bx2) + '" y2="' + f(baseY - 4) + '" stroke="rgba(59,42,34,.5)" stroke-width="3"/>';
      }
      g += '<line x1="' + f(ax + 8) + '" y1="' + f(ay + 96) + '" x2="' + f(ax + aw - 8) + '" y2="' + f(ay + 96) + '" stroke="rgba(59,42,34,.5)" stroke-width="3"/>';
      g += '<path class="ww-spin-slow" style="transform-origin:' + f(cx) + 'px ' + f(ay - 58) + 'px" d="M ' + f(cx - 26) + ' ' + f(ay - 58) + ' l 40 0 l -8 -7 l 20 7 l -20 7 l 8 -7 Z" fill="#7A6247"/>';
      g += '<rect x="' + f(cx - 2) + '" y="' + f(ay - 58) + '" width="4" height="34" fill="#7A6247"/>';
    } else if (id === 'rsvp') {
      /* a mailbox and a wax seal, glowing gold */
      g += '<circle class="ww-pulse" cx="' + cx + '" cy="' + f(ay + 110) + '" r="60" fill="' + P.gold + '" opacity=".28"/>';
      g += '<rect x="' + f(cx + 46) + '" y="' + f(baseY - 116) + '" width="9" height="116" fill="#7A6247"/>';
      g += '<rect x="' + f(cx + 24) + '" y="' + f(baseY - 156) + '" width="54" height="42" rx="8" fill="' + P.terracotta + '"/>';
      g += '<rect x="' + f(cx + 30) + '" y="' + f(baseY - 148) + '" width="42" height="5" rx="2" fill="rgba(59,42,34,.45)"/>';
      /* envelope hovering in the doorway */
      g += '<g class="ww-hover-bob" style="transform-origin:' + f(cx) + 'px ' + f(ay + 120) + 'px">' +
        '<rect x="' + f(cx - 40) + '" y="' + f(ay + 96) + '" width="80" height="54" rx="5" fill="#FFF6E4"/>' +
        '<path d="M ' + f(cx - 40) + ' ' + f(ay + 100) + ' l 40 32 l 40 -32" fill="none" stroke="' + P.terraDeep + '" stroke-width="3"/>' +
        '<circle cx="' + f(cx) + '" cy="' + f(ay + 138) + '" r="11" fill="' + P.terracotta + '"/>' +
        '</g>';
    }

    /* worn stone texture on the pillar */
    for (var s2 = 0; s2 < 16; s2++) {
      g += '<circle cx="' + f(ax - 30 + r() * (aw + 60)) + '" cy="' + f(ay + r() * ah) + '" r="' + f(1 + r() * 2.6) + '" fill="rgba(139,112,80,.10)"/>';
    }
    return A.svgWrap(320, 460, g, 'class="entrance-svg"');
  }

  function shutter(x, y, s) {
    var g = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(30 * s) + '" height="' + f(44 * s) + '" fill="rgba(59,42,34,.3)"/>';
    g += '<rect x="' + f(x - 9 * s) + '" y="' + f(y) + '" width="' + f(10 * s) + '" height="' + f(44 * s) + '" fill="' + P.dustyDeep + '"/>';
    g += '<rect x="' + f(x + 29 * s) + '" y="' + f(y) + '" width="' + f(10 * s) + '" height="' + f(44 * s) + '" fill="' + P.dustyDeep + '"/>';
    return g;
  }

  /* ======================================================================
     ROOMS
     ====================================================================== */
  var rooms = {};

  /* --- 1 · Welcome Dinner: a terrace at dusk --------------------------- */
  rooms.welcome = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#2F3F5E'], [0.42, '#7A6A82'], [0.72, '#C98A6E'], [1, '#EFC095']], 620) +
      stars(ROOM_W, 380, 46, 41) +
      A.sun(1290, 560, 34, '#FFE7BE', '#F0A96B')
    )});
    L.push({ depth: 0.3, svg: wrap(ROOM_W, ROOM_H,
      '<g transform="translate(0,-116)">' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 600, amp: 250, peaks: 7, seed: 12 }) + '" fill="#3E4A63"/>' +
      A.water(0, 596, ROOM_W, 210, '#4A6272', '#2A3D4E', 15, '#FFD9A8') +
      A.houses(60, 600, 5, 0.5, 19, { wall: '#5D6274', roof: '#6E4A46', window: 'rgba(255,214,150,.85)' }) +
      A.campanile(300, 600, 78, 0.5, { wall: '#5D6274', roof: '#6E4A46' }) +
      A.boat(1180, 690, 1.1, '#26313F', '#C9B9A0') +
      '</g>'
    )});
    L.push({ depth: 0.55, svg: wrap(ROOM_W, ROOM_H,
      /* the stone arcade at the back of the courtyard, lamplit from within */
      '<g transform="translate(0,-116)">' +
      (function () {
        var g = '<rect x="-20" y="322" width="1040" height="380" fill="#4A3B42"/>';
        g += '<rect x="-20" y="322" width="1040" height="16" fill="#63505A"/>';
        for (var i = 0; i < 4; i++) {
          var x = 10 + i * 250, gid = A.uid('arc');
          g += '<path d="M ' + x + ' 702 L ' + x + ' 486 A 88 88 0 0 1 ' + (x + 176) + ' 486 L ' + (x + 176) + ' 702 Z" fill="#2C2229"/>';
          g += '<path d="M ' + (x + 16) + ' 702 L ' + (x + 16) + ' 492 A 72 72 0 0 1 ' + (x + 160) + ' 492 L ' + (x + 160) + ' 702 Z" fill="#7A4E38" opacity=".72"/>';
          g += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="#FFDFA4" stop-opacity=".75"/>' +
               '<stop offset=".55" stop-color="#F0B45C" stop-opacity=".28"/>' +
               '<stop offset="1" stop-color="#F0B45C" stop-opacity="0"/></radialGradient></defs>';
          g += '<ellipse class="ww-flicker" cx="' + (x + 88) + '" cy="626" rx="86" ry="104" fill="url(#' + gid + ')" style="animation-delay:' + (-i * 0.8) + 's"/>';
          /* a lamp on the wall between the arches */
          if (i < 3) g += A.lantern(x + 213, 520, 1.1, 400);
        }
        return g;
      })() +
      A.cypress(1150, 720, 300, '#2A3524') + A.cypress(1226, 726, 224, '#243020') +
      A.olive(1420, 730, 0.9, { leaf: '#3E4A32', leaf2: '#4C5A3C' }, 5) + '</g>'
    )});
    L.push({ depth: 0.85, svg: wrap(ROOM_W, ROOM_H,
      /* the terrace floor, the long table, the candles */
      '<rect x="0" y="584" width="' + ROOM_W + '" height="330" fill="#7E6650"/>' +
      '<rect x="0" y="584" width="' + ROOM_W + '" height="12" fill="#94795F"/>' +
      '<g transform="translate(0,-116)">' +
      (function () {
        var g = '', r = rand(9);
        for (var y = 726; y < 1030; y += 44) {
          g += '<line x1="0" y1="' + y + '" x2="1600" y2="' + y + '" stroke="rgba(255,232,196,.07)" stroke-width="2"/>';
        }
        return g;
      })() +
      A.stringLights(-40, 210, 1640, 250, 100, 11, 7) +
      A.stringLights(-40, 300, 1640, 176, 132, 9, 8) +
      (function () {
        /* chairs behind, then the table, then chairs in front */
        var g = '';
        for (var b = 0; b < 6; b++) {
          var bx = 120 + b * 158;
          g += '<rect x="' + bx + '" y="666" width="58" height="14" rx="4" fill="#5C4436"/>';
          g += '<path d="M ' + bx + ' 666 l 0 -74 q 29 -14 58 0 l 0 74 Z" fill="#6B5039"/>';
        }
        g += '<rect x="40" y="742" width="1140" height="26" rx="6" fill="#F2E7D2"/>';
        g += '<rect x="40" y="768" width="1140" height="14" fill="#CBB795"/>';
        for (var i = 0; i < 7; i++) {
          var x = 96 + i * 168;
          g += '<rect x="' + x + '" y="782" width="14" height="86" rx="3" fill="#6B5744"/>';
        }
        /* place settings */
        for (var p2 = 0; p2 < 7; p2++) {
          var px = 110 + p2 * 160;
          g += '<ellipse cx="' + px + '" cy="756" rx="34" ry="9" fill="#FFFAF0"/>';
          g += '<ellipse cx="' + px + '" cy="755" rx="22" ry="5.5" fill="#EADCC4"/>';
        }
        /* candles down the middle */
        for (var c = 0; c < 6; c++) {
          var cxp = 170 + c * 172;
          g += '<rect x="' + cxp + '" y="694" width="13" height="50" rx="3" fill="#F8F1E0"/>';
          g += '<circle class="ww-flicker" cx="' + (cxp + 6.5) + '" cy="688" r="7" fill="#FFE9B0" style="animation-delay:' + (-c * 0.6) + 's"/>';
          g += '<circle class="ww-flicker" cx="' + (cxp + 6.5) + '" cy="688" r="21" fill="#F0B45C" opacity=".22" style="animation-delay:' + (-c * 0.6) + 's"/>';
        }
        /* a carafe and glasses, because someone always pours early */
        g += '<path d="M 560 742 l 0 -34 q 0 -14 12 -20 l 0 -12 l 20 0 l 0 12 q 12 6 12 20 l 0 34 Z" fill="#D8C9A8" opacity=".9"/>';
        g += '<path d="M 700 742 l 0 -22 q -9 -8 -9 -20 l 26 0 q 0 12 -9 20 l 0 22 Z" fill="#EFE7D4" opacity=".85"/>';
        g += '<path d="M 940 742 l 0 -22 q -9 -8 -9 -20 l 26 0 q 0 12 -9 20 l 0 22 Z" fill="#EFE7D4" opacity=".85"/>';
        /* front-row chairs, seen from behind */
        for (var fch = 0; fch < 5; fch++) {
          var fx = 200 + fch * 214;
          g += '<path d="M ' + fx + ' 960 l 0 -84 q 40 -16 80 0 l 0 84 Z" fill="#4E382A"/>';
          g += '<rect x="' + (fx - 6) + '" y="868" width="92" height="14" rx="6" fill="#5E452F"/>';
        }
        return g;
      })() + '</g>'
    )});
    L.push({ depth: 1.25, svg: wrap(ROOM_W, ROOM_H,
      A.branch(-30, 20, 1, false, { leaf: '#22301F', leaf2: '#2E3F26' }, 29) +
      A.lantern(120, 150, 1.9, 0) + A.lantern(1480, 118, 1.6, 0)
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'dusk' };
  };

  /* --- 2 · The Wedding: cliff terrace, golden hour --------------------- */
  rooms.wedding = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#8FB6C9'], [0.4, '#E6C39C'], [0.75, '#F6D3A0'], [1, '#FBE7C6']], 640) +
      A.sun(1180, 470, 56, '#FFF3D6', '#F2B968') +
      A.clouds(ROOM_W, ROOM_H, 6, '#FFF0DA', 0.8, [90, 300]) +
      A.birds(360, 200, 1, 5, 9, 'rgba(59,42,34,.35)')
    )});
    L.push({ depth: 0.28, svg: wrap(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 610, amp: 300, peaks: 6, seed: 22 }) + '" fill="#A8BECB" opacity=".9"/>' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 630, amp: 190, peaks: 9, seed: 26, phase: 1.6 }) + '" fill="' + P.dusty + '"/>'
    )});
    L.push({ depth: 0.45, svg: wrap(ROOM_W, ROOM_H,
      A.water(0, 628, ROOM_W, 190, '#69989B', '#31626A', 27, '#FFF0CE') +
      '<ellipse cx="380" cy="700" rx="66" ry="12" fill="#D7C8AC"/>' +
      A.houses(342, 694, 3, 0.34, 31, { wall: '#F0E3CB', roof: P.terracotta, window: 'rgba(59,42,34,.4)' }) +
      A.boat(940, 726, 1, '#3B2A22', '#FFF5E2') +
      A.houses(1180, 690, 6, 0.4, 35, { wall: '#EADCC2', roof: P.terraLight, window: 'rgba(59,42,34,.35)' })
    )});
    L.push({ depth: 0.8, svg: wrap(ROOM_W, ROOM_H,
      /* the terrace, the aisle, the arch */
      '<path d="M -20 812 Q 800 764 1620 812 L 1620 920 L -20 920 Z" fill="#DCCAA9"/>' +
      A.stoneWall(-20, 790, 1640, 30, 17, '#CDBA9A') +
      (function () {
        var g = '';
        /* ceremony arch of olive branches */
        var axp = 470, awp = 300, ayp = 300;
        g += '<path d="M ' + axp + ' 800 L ' + axp + ' ' + (ayp + 150) + ' A 150 150 0 0 1 ' + (axp + awp) + ' ' + (ayp + 150) + ' L ' + (axp + awp) + ' 800" fill="none" stroke="#7A6247" stroke-width="9"/>';
        var r = rand(43);
        for (var i = 0; i < 54; i++) {
          var t = i / 53;
          var ang = Math.PI * (1 - t);
          var lx, ly;
          if (t < 0.18) { lx = axp; ly = 800 - (t / 0.18) * 350; }
          else if (t > 0.82) { lx = axp + awp; ly = 800 - ((1 - t) / 0.18) * 350; }
          else {
            var tt = (t - 0.18) / 0.64;
            lx = axp + awp / 2 - Math.cos(Math.PI * tt) * 150;
            ly = ayp + 150 - Math.sin(Math.PI * tt) * 150;
          }
          g += '<ellipse cx="' + f(lx + (r() - 0.5) * 22) + '" cy="' + f(ly + (r() - 0.5) * 22) + '" rx="' + f(11 + r() * 6) + '" ry="' + f(4 + r() * 2.4) +
            '" fill="' + (i % 3 ? P.oliveDeep : P.olive) + '" transform="rotate(' + ((r() * 180 - 90) | 0) + ' ' + f(lx) + ' ' + f(ly) + ')"/>';
          if (i % 7 === 0) g += '<circle cx="' + f(lx + 8) + '" cy="' + f(ly + 6) + '" r="4.5" fill="#F0E2CB"/>';
        }
        /* chairs either side of the aisle */
        for (var c = 0; c < 5; c++) {
          var yy = 828 + c * 20, sc = 1 + c * 0.12;
          g += chair(300 - c * 46, yy, sc) + chair(392 - c * 30, yy + 6, sc);
          g += chair(1030 + c * 34, yy, sc) + chair(1122 + c * 48, yy + 6, sc);
        }
        /* petals down the aisle */
        var rp = rand(47);
        for (var p = 0; p < 40; p++) {
          g += '<ellipse cx="' + f(560 + rp() * 300) + '" cy="' + f(828 + rp() * 78) + '" rx="' + f(4 + rp() * 4) + '" ry="' + f(2 + rp() * 2) +
            '" fill="' + (p % 2 ? '#F0D2C4' : '#E8BCA8') + '" opacity=".9"/>';
        }
        return g;
      })()
    )});
    L.push({ depth: 1.3, svg: wrap(ROOM_W, ROOM_H,
      A.branch(-30, 20, 1.05, false, { leaf: '#4A5A38', leaf2: P.oliveDeep }, 29) +
      A.cypress(1560, 920, 420, '#3E4E32') + A.cypress(1500, 924, 300, '#46563A') +
      A.grassTufts(0, 916, ROOM_W, 26, 23, 'rgba(70,86,58,.6)')
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'gold' };
  };

  /* --- 3 · After-Party: a courtyard at midnight ------------------------ */
  rooms.afterparty = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#0F1522'], [0.55, '#1E2A3A'], [1, '#33304A']], 700) +
      stars(ROOM_W, 520, 90, 53) +
      '<circle cx="1300" cy="180" r="46" fill="#F3E7C8" opacity=".92"/>' +
      '<circle cx="1300" cy="180" r="120" fill="#F3E7C8" opacity=".08"/>'
    )});
    L.push({ depth: 0.3, svg: wrap(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 620, amp: 260, peaks: 7, seed: 61 }) + '" fill="#141C28"/>' +
      A.houses(40, 700, 9, 0.62, 63, { wall: '#232C3C', wallShade: '#1A2130', roof: '#2C2434', window: 'rgba(244,196,116,.85)' }) +
      A.campanile(520, 700, 130, 0.7, { wall: '#232C3C', roof: '#2C2434' }) +
      A.houses(1140, 700, 6, 0.6, 67, { wall: '#232C3C', wallShade: '#1A2130', roof: '#2C2434', window: 'rgba(244,196,116,.7)' })
    )});
    L.push({ depth: 0.55, svg: wrap(ROOM_W, ROOM_H,
      /* the vault arches, glowing */
      (function () {
        var g = '<rect x="-20" y="470" width="1640" height="330" fill="#1A2231"/>';
        for (var i = 0; i < 5; i++) {
          var x = -10 + i * 330;
          g += '<path d="M ' + x + ' 800 L ' + x + ' 620 A 110 110 0 0 1 ' + (x + 220) + ' 620 L ' + (x + 220) + ' 800 Z" fill="#0E141F"/>';
          var gid = A.uid('vg');
          g += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="' + (i % 2 ? '#C98CE0' : '#F0B45C') + '" stop-opacity=".75"/>' +
            '<stop offset="1" stop-color="' + (i % 2 ? '#C98CE0' : '#F0B45C') + '" stop-opacity="0"/></radialGradient></defs>';
          g += '<ellipse class="ww-pulse" cx="' + (x + 110) + '" cy="720" rx="120" ry="150" fill="url(#' + gid + ')" style="animation-delay:' + (-i * 0.9) + 's"/>';
        }
        return g;
      })()
    )});
    L.push({ depth: 0.85, svg: wrap(ROOM_W, ROOM_H,
      '<rect x="0" y="790" width="' + ROOM_W + '" height="120" fill="#20283A"/>' +
      /* pools of light on the dancefloor */
      (function () {
        var g = '', cols = ['#F0B45C', '#C98CE0', '#68C6C2', '#F08A8A'];
        for (var i = 0; i < 6; i++) {
          var gid = A.uid('fl');
          g += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="' + cols[i % 4] + '" stop-opacity=".55"/>' +
            '<stop offset="1" stop-color="' + cols[i % 4] + '" stop-opacity="0"/></radialGradient></defs>';
          g += '<ellipse class="ww-pulse" cx="' + (110 + i * 250) + '" cy="' + (836 + (i % 3) * 22) + '" rx="150" ry="42" fill="url(#' + gid + ')" style="animation-delay:' + (-i * 0.7) + 's"/>';
        }
        return g;
      })() +
      A.dancer(230, 830, 210, '#0C1119', 0) +
      A.dancer(390, 848, 190, '#0C1119', -0.9) +
      A.dancer(560, 836, 220, '#0C1119', -1.7) +
      A.dancer(720, 852, 176, '#0C1119', -0.4) +
      A.dancer(880, 840, 200, '#0C1119', -2.2)
    )});
    L.push({ depth: 1.3, svg: wrap(ROOM_W, ROOM_H,
      A.lantern(150, 200, 2.2, 0) + A.lantern(430, 130, 1.7, 0) + A.lantern(1290, 176, 2, 0) + A.lantern(1520, 120, 1.5, 0) +
      '<rect x="0" y="880" width="' + ROOM_W + '" height="30" fill="#0C1119" opacity=".7"/>'
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'night' };
  };

  /* --- 4 · Explore: the whole bay, drawn like a map -------------------- */
  rooms.explore = function () {
    var L = [];
    L.push({ depth: 0.12, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#6FA6C4'], [0.55, '#A9CBDB'], [1, '#E3ECEB']], 420) +
      A.clouds(ROOM_W, ROOM_H, 71, '#FFFFFF', 0.7, [60, 240]) +
      A.sun(1420, 130, 44, '#FFF6DC', '#FBD98F')
    )});
    L.push({ depth: 0.26, svg: wrap(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 430, amp: 300, peaks: 7, seed: 73 }) + '" fill="#8FA9B8"/>' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 460, amp: 210, peaks: 11, seed: 77, phase: 2 }) + '" fill="#6E8C9C"/>'
    )});
    L.push({ depth: 0.45, svg: wrap(ROOM_W, ROOM_H,
      A.water(0, 452, ROOM_W, 460, '#63B0AE', '#2E6B72', 79, '#FFFFFF') +
      /* headlands folding into the bay */
      '<path d="M -20 452 Q 240 500 420 452 L 420 470 Q 220 540 -20 500 Z" fill="#6F8A6A"/>' +
      '<path d="M 1620 452 Q 1360 520 1120 460 L 1120 486 Q 1380 560 1620 496 Z" fill="#6F8A6A"/>' +
      '<ellipse cx="700" cy="560" rx="52" ry="11" fill="#E2D4B8"/>' +
      A.houses(668, 556, 3, 0.3, 81, { wall: '#F3E7D0', roof: P.terracotta, window: 'rgba(59,42,34,.4)' }) +
      A.boat(980, 620, 1.1, '#3B2A22', '#FFFFFF') + A.boat(430, 690, 1.3, '#3B2A22', '#FFF6E4')
    )});
    L.push({ depth: 0.7, svg: wrap(ROOM_W, ROOM_H,
      /* near shore: old town, serpentine road, olive terraces */
      '<path d="M -20 700 Q 300 660 640 706 Q 1000 754 1620 700 L 1620 920 L -20 920 Z" fill="#93A97C"/>' +
      '<path d="M -20 742 Q 320 706 660 748 Q 1010 792 1620 740" fill="none" stroke="#E4D6BA" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M 120 700 q 90 -34 40 -66 q -54 -32 26 -60 q 78 -26 30 -56" fill="none" stroke="#E4D6BA" stroke-width="9" stroke-dasharray="0"/>' +
      A.houses(210, 712, 8, 0.62, 83, { wall: '#F0E3CB', roof: P.terracotta, window: 'rgba(59,42,34,.4)' }) +
      A.campanile(430, 712, 116, 0.66, { wall: '#F3E7D0', roof: P.terraDeep }) +
      A.olive(940, 800, 0.85, {}, 87) + A.olive(1180, 828, 1, {}, 89) + A.olive(1420, 796, 0.8, {}, 91) +
      A.cypress(760, 790, 130, P.oliveDeep) + A.cypress(800, 792, 96, '#4F5E3C')
    )});
    /* map pins — the numbered markers that echo the cards in the panel */
    L.push({ depth: 1.05, svg: wrap(ROOM_W, ROOM_H,
      (function () {
        var pins = [[190, 660], [420, 620], [700, 528], [560, 742], [960, 604], [1140, 690], [1330, 596], [1450, 780]];
        var g = '';
        for (var i = 0; i < pins.length; i++) {
          g += mapPin(pins[i][0], pins[i][1], i + 1, i * 0.35);
        }
        return g;
      })()
    )});
    L.push({ depth: 1.3, svg: wrap(ROOM_W, ROOM_H,
      A.branch(-30, 10, 0.85, false, { leaf: '#4A5A38', leaf2: P.oliveDeep }, 93) +
      A.grassTufts(0, 918, ROOM_W, 22, 95, 'rgba(70,86,58,.55)')
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'day' };
  };

  function mapPin(x, y, n, delay) {
    return '<g class="ww-hover-bob" style="transform-origin:' + f(x) + 'px ' + f(y) + 'px;animation-delay:' + f(-delay) + 's">' +
      '<ellipse cx="' + f(x) + '" cy="' + f(y + 4) + '" rx="9" ry="3.5" fill="rgba(59,42,34,.25)"/>' +
      '<path d="M ' + f(x) + ' ' + f(y) + ' c -16 -20 -22 -30 -22 -42 a 22 22 0 0 1 44 0 c 0 12 -6 22 -22 42 Z" fill="' + P.terracotta + '"/>' +
      '<circle cx="' + f(x) + '" cy="' + f(y - 42) + '" r="12" fill="#FFF3DE"/>' +
      '<text x="' + f(x) + '" y="' + f(y - 37) + '" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="' + P.terraDeep + '">' + n + '</text></g>';
  }

  /* --- 5 · Where to Stay: a street of shuttered houses ----------------- */
  rooms.stay = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#8CB4CA'], [0.5, '#CBD8DA'], [1, '#F3E2C6']], 520) +
      A.clouds(ROOM_W, ROOM_H, 101, '#FFF6E8', 0.65, [70, 230]) +
      A.birds(1120, 190, 0.9, 4, 103, 'rgba(59,42,34,.3)')
    )});
    L.push({ depth: 0.3, svg: wrap(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 520, amp: 280, peaks: 8, seed: 105 }) + '" fill="#9DB4C1"/>' +
      A.houses(60, 560, 14, 0.44, 107, { wall: '#E6D9C1', roof: '#C07B54', window: 'rgba(59,42,34,.35)' })
    )});
    L.push({ depth: 0.55, svg: wrap(ROOM_W, ROOM_H,
      /* stepped town blocks climbing the hill */
      A.houses(-30, 700, 6, 0.95, 109, { wall: '#EFE1C7', roof: P.terracotta, window: 'rgba(59,42,34,.45)' }) +
      A.houses(560, 660, 5, 0.9, 111, { wall: '#EADAC0', roof: P.terraLight, window: 'rgba(59,42,34,.42)' }) +
      A.houses(1080, 700, 6, 0.98, 113, { wall: '#F1E4CB', roof: P.terraDeep, window: 'rgba(59,42,34,.45)' }) +
      A.cypress(520, 706, 190, P.oliveDeep) + A.cypress(1040, 706, 160, '#54643F')
    )});
    L.push({ depth: 0.9, svg: wrap(ROOM_W, ROOM_H,
      /* the street itself: doors, shutters, laundry, warm windows */
      (function () {
        var g = '<rect x="-20" y="700" width="1640" height="220" fill="#E5D5B6"/>';
        g += '<rect x="-20" y="700" width="1640" height="12" fill="#D2BF9C"/>';
        var xs = [30, 300, 570, 840, 1110], r = rand(117);
        for (var i = 0; i < xs.length; i++) {
          var x = xs[i], w = 230, h = 330, top = 700 - h;
          g += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" fill="' + (i % 2 ? '#F3E6CE' : '#EADCC0') + '"/>';
          g += '<polygon points="' + (x - 8) + ',' + top + ' ' + (x + w + 8) + ',' + top + ' ' + (x + w) + ',' + (top - 22) + ' ' + (x + 8) + ',' + (top - 22) + '" fill="' + (i % 2 ? P.terracotta : P.terraDeep) + '"/>';
          /* door */
          g += '<path d="M ' + (x + 92) + ' 700 L ' + (x + 92) + ' 596 a 23 23 0 0 1 46 0 L ' + (x + 138) + ' 700 Z" fill="' + (i % 2 ? '#4E6E80' : '#7C8B5E') + '"/>';
          g += '<circle cx="' + (x + 130) + '" cy="654" r="4" fill="' + P.gold + '"/>';
          g += '<rect x="' + (x + 84) + '" y="700" width="62" height="7" fill="#CBB795"/>';
          /* shuttered windows */
          for (var row = 0; row < 2; row++) {
            for (var col = 0; col < 2; col++) {
              var wx = x + 40 + col * 110, wy = top + 46 + row * 96;
              g += '<rect x="' + wx + '" y="' + wy + '" width="52" height="66" fill="rgba(59,42,34,.35)"/>';
              g += '<rect x="' + wx + '" y="' + wy + '" width="52" height="66" fill="' + P.goldLight + '" opacity="' + (r() < 0.45 ? '.7' : '0') + '"/>';
              g += '<rect x="' + (wx - 15) + '" y="' + wy + '" width="15" height="66" fill="' + (i % 2 ? '#4E6E80' : '#6B7F55') + '"/>';
              g += '<rect x="' + (wx + 52) + '" y="' + wy + '" width="15" height="66" fill="' + (i % 2 ? '#4E6E80' : '#6B7F55') + '"/>';
            }
          }
          /* laundry line between buildings */
          if (i < xs.length - 1) {
            var lx1 = x + w, lx2 = x + w + 40;
            g += '<path d="M ' + lx1 + ' 470 Q ' + ((lx1 + lx2) / 2) + ' 500 ' + lx2 + ' 476" fill="none" stroke="rgba(59,42,34,.35)" stroke-width="1.6"/>';
            for (var k = 0; k < 3; k++) {
              var lx = lx1 + (k + 0.5) * ((lx2 - lx1) / 3);
              g += '<rect class="ww-sway" style="transform-origin:' + f(lx) + 'px 486px;animation-delay:' + (-k * 0.7) + 's" x="' + f(lx - 9) + '" y="486" width="18" height="26" rx="2" fill="' + ['#F4E7D3', '#DCC7AE', '#C9D6DA'][k % 3] + '"/>';
            }
          }
        }
        return g;
      })()
    )});
    L.push({ depth: 1.25, svg: wrap(ROOM_W, ROOM_H,
      urn(90, 918, 0.62) + urn(1520, 924, 0.7) +
      '<rect x="0" y="880" width="' + ROOM_W + '" height="40" fill="rgba(139,112,80,.10)"/>'
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'day' };
  };

  /* --- 6 · Travel: the coast road in the morning ----------------------- */
  rooms.travel = function () {
    var L = [];
    L.push({ depth: 0.12, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#7FAECB'], [0.55, '#BBD5E0'], [1, '#EFE6D6']], 520) +
      A.clouds(ROOM_W, ROOM_H, 121, '#FFFFFF', 0.75, [70, 260]) +
      /* aeroplane and contrail */
      '<g class="ww-plane"><path d="M 0 0 l 46 0 l 16 -13 l 9 0 l -8 13 l 26 0 l 12 -9 l 7 0 l -6 9 l 14 0 l -14 6 l -102 0 Z" fill="#4E6E80"/>' +
      '<path d="M -260 3 L 0 3" stroke="#FFFFFF" stroke-width="4" opacity=".55" stroke-linecap="round"/></g>'
    )});
    L.push({ depth: 0.28, svg: wrap(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 520, amp: 300, peaks: 7, seed: 123 }) + '" fill="#9BB2C0"/>' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 540, amp: 190, peaks: 10, seed: 127, phase: 1.4 }) + '" fill="#7A97A8"/>' +
      A.houses(1060, 566, 7, 0.42, 129, { wall: '#E4D7BF', roof: '#BE7A54', window: 'rgba(59,42,34,.3)' })
    )});
    L.push({ depth: 0.5, svg: wrap(ROOM_W, ROOM_H,
      A.water(0, 560, ROOM_W, 260, '#6FA5A8', '#356B72', 131, '#FFFFFF') +
      /* the ferry */
      '<g class="ww-bob" style="transform-origin:700px 660px">' +
      '<path d="M 610 660 l 190 0 l -14 30 l -162 0 Z" fill="#F0E5D0"/>' +
      '<rect x="640" y="632" width="120" height="28" fill="#FFFFFF"/>' +
      '<rect x="656" y="638" width="14" height="12" fill="#4E6E80"/><rect x="682" y="638" width="14" height="12" fill="#4E6E80"/>' +
      '<rect x="708" y="638" width="14" height="12" fill="#4E6E80"/>' +
      '<rect x="742" y="612" width="16" height="22" fill="' + P.terracotta + '"/></g>' +
      A.boat(1180, 700, 1, '#3B2A22', '#FFF6E4')
    )});
    L.push({ depth: 0.85, svg: wrap(ROOM_W, ROOM_H,
      /* hillside and the hairpin road */
      '<path d="M -20 760 Q 400 700 900 762 Q 1250 806 1620 742 L 1620 920 L -20 920 Z" fill="#8A9F72"/>' +
      '<path d="M -40 880 Q 300 856 520 812 Q 700 776 900 800 Q 1120 826 1300 786 Q 1480 748 1660 764" fill="none" stroke="#4A4038" stroke-width="30" stroke-linecap="round"/>' +
      '<path d="M -40 880 Q 300 856 520 812 Q 700 776 900 800 Q 1120 826 1300 786 Q 1480 748 1660 764" fill="none" stroke="#F4E7D3" stroke-width="2.6" stroke-dasharray="22 26" opacity=".8"/>' +
      A.cypress(300, 800, 150, P.oliveDeep) + A.cypress(1240, 800, 130, '#54643F') +
      A.olive(1020, 838, 0.75, {}, 133) +
      /* signpost */
      '<rect x="196" y="640" width="10" height="200" fill="#7A6247"/>' +
      '<path d="M 206 648 l 150 0 l 22 16 l -22 16 l -150 0 Z" fill="' + P.terracotta + '"/>' +
      '<path d="M 206 690 l 120 0 l 22 16 l -22 16 l -120 0 Z" fill="' + P.dustyDeep + '"/>' +
      '<path d="M 196 732 l -110 0 l -22 16 l 22 16 l 110 0 Z" fill="' + P.olive + '"/>'
    )});
    L.push({ depth: 1.3, svg: wrap(ROOM_W, ROOM_H,
      /* guard rail rushing past in the foreground */
      '<rect x="-20" y="884" width="1640" height="8" rx="4" fill="#B9A88C"/>' +
      (function () {
        var g = '';
        for (var x = 0; x < 1640; x += 96) g += '<rect x="' + x + '" y="884" width="12" height="46" fill="#9C8B70"/>';
        return g;
      })() +
      A.grassTufts(0, 924, ROOM_W, 30, 137, 'rgba(70,86,58,.6)')
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'day' };
  };

  /* --- 7 · RSVP: the gate at the end of the path ----------------------- */
  rooms.rsvp = function () {
    var L = [];
    L.push({ depth: 0.14, svg: wrap(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#3D4A6B'], [0.38, '#8A6E80'], [0.68, '#D89A72'], [1, '#F6D4A6']], 640) +
      stars(ROOM_W, 340, 40, 139) +
      A.sun(1240, 600, 40, '#FFEBC6', '#EFA469')
    )});
    L.push({ depth: 0.3, svg: wrap(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 620, amp: 260, peaks: 7, seed: 141 }) + '" fill="#4E5570"/>' +
      A.water(0, 616, ROOM_W, 150, '#5A7480', '#33475A', 143, '#FFD9A8')
    )});
    L.push({ depth: 0.5, svg: wrap(ROOM_W, ROOM_H,
      /* an avenue of cypresses leading to the gate */
      (function () {
        var g = '<path d="M -20 780 Q 800 730 1620 780 L 1620 920 L -20 920 Z" fill="#6E7A5C"/>';
        var pairs = [[250, 190], [420, 220], [1180, 210], [1360, 180]];
        for (var i = 0; i < pairs.length; i++) g += A.cypress(pairs[i][0], 790, pairs[i][1], i % 2 ? '#33422C' : '#3C4C33');
        return g;
      })()
    )});
    L.push({ depth: 0.85, svg: wrap(ROOM_W, ROOM_H,
      /* shifted left so the gate is not hidden behind the content panel */
      '<g transform="translate(-235,0)">' +
      (function () {
        var g = '';
        /* the path */
        g += '<path d="M 620 920 L 700 640 L 900 640 L 1020 920 Z" fill="#E0CFB0"/>';
        for (var i = 0; i < 7; i++) {
          var t = i / 7, yy = 920 - t * 280;
          g += '<line x1="' + f(620 + t * 80) + '" y1="' + f(yy) + '" x2="' + f(1020 - t * 120) + '" y2="' + f(yy) + '" stroke="rgba(139,112,80,.18)" stroke-width="2"/>';
        }
        /* the gate */
        var gx = 660, gw = 300, gy = 300;
        g += '<rect x="' + (gx - 42) + '" y="' + gy + '" width="42" height="340" fill="#D9C7A6"/>';
        g += '<rect x="' + (gx + gw) + '" y="' + gy + '" width="42" height="340" fill="#D9C7A6"/>';
        g += '<path d="M ' + (gx - 42) + ' ' + gy + ' L ' + (gx - 42) + ' ' + (gy - 26) + ' Q ' + (gx + gw / 2) + ' ' + (gy - 84) + ' ' + (gx + gw + 42) + ' ' + (gy - 26) + ' L ' + (gx + gw + 42) + ' ' + gy + ' Z" fill="#E4D3B2"/>';
        var gid = A.uid('rg');
        g += '<defs><radialGradient id="' + gid + '"><stop offset="0" stop-color="#FFE7B4" stop-opacity=".95"/><stop offset="1" stop-color="#E4A853" stop-opacity="0"/></radialGradient></defs>';
        g += '<ellipse class="ww-glow-soft" cx="' + (gx + gw / 2) + '" cy="520" rx="260" ry="300" fill="url(#' + gid + ')" opacity=".7"/>';
        /* open gate doors */
        g += '<path d="M ' + gx + ' ' + (gy + 40) + ' l 60 -22 l 0 300 l -60 -18 Z" fill="#6B5744"/>';
        g += '<path d="M ' + (gx + gw) + ' ' + (gy + 40) + ' l -60 -22 l 0 300 l 60 -18 Z" fill="#7A6247"/>';
        /* guestbook table with candles */
        g += '<rect x="700" y="668" width="220" height="12" rx="3" fill="#EFE3CD"/>';
        g += '<rect x="716" y="680" width="10" height="58" fill="#6B5744"/><rect x="894" y="680" width="10" height="58" fill="#6B5744"/>';
        g += '<rect x="756" y="650" width="86" height="20" rx="3" fill="#FFF6E4"/>';
        g += '<path d="M 799 650 l 0 20" stroke="' + P.stoneDeep + '" stroke-width="2"/>';
        g += '<path class="ww-sway" style="transform-origin:860px 654px" d="M 860 654 l 26 -46 l 7 4 l -26 46 Z" fill="#F4E7D3"/>';
        for (var c = 0; c < 3; c++) {
          var cxp = 722 + c * 78;
          g += '<rect x="' + cxp + '" y="636" width="9" height="32" fill="#F6EEDC"/>';
          g += '<circle class="ww-flicker" cx="' + (cxp + 4.5) + '" cy="630" r="7" fill="#FFE9B0" style="animation-delay:' + (-c * 0.7) + 's"/>';
          g += '<circle class="ww-flicker" cx="' + (cxp + 4.5) + '" cy="630" r="22" fill="#F0B45C" opacity=".3" style="animation-delay:' + (-c * 0.7) + 's"/>';
        }
        return g;
      })() + '</g>'
    )});
    L.push({ depth: 1.3, svg: wrap(ROOM_W, ROOM_H,
      A.branch(-30, 20, 1, false, { leaf: '#3A4A2E', leaf2: '#4A5A38' }, 147) +
      A.branch(1630, 60, 0.9, true, { leaf: '#3A4A2E', leaf2: '#4A5A38' }, 149) +
      A.grassTufts(0, 916, ROOM_W, 26, 151, 'rgba(58,74,46,.6)')
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'dusk' };
  };

  function chair(x, y, s) {
    return '<g><rect x="' + f(x) + '" y="' + f(y - 30 * s) + '" width="' + f(26 * s) + '" height="' + f(6 * s) + '" rx="2" fill="#EFE3CD"/>' +
      '<rect x="' + f(x + 2 * s) + '" y="' + f(y - 56 * s) + '" width="' + f(22 * s) + '" height="' + f(28 * s) + '" rx="4" fill="#E6D8BE"/>' +
      '<rect x="' + f(x + 2 * s) + '" y="' + f(y - 24 * s) + '" width="' + f(4 * s) + '" height="' + f(24 * s) + '" fill="#CFBB99"/>' +
      '<rect x="' + f(x + 20 * s) + '" y="' + f(y - 24 * s) + '" width="' + f(4 * s) + '" height="' + f(24 * s) + '" fill="#CFBB99"/></g>';
  }

  global.WW = global.WW || {};
  global.WW.scenes = {
    hub: hub,
    entranceArt: entranceArt,
    room: function (id) { return (rooms[id] || rooms.welcome)(); },
    HUB_W: HUB_W, HUB_H: HUB_H, ROOM_W: ROOM_W, ROOM_H: ROOM_H
  };
})(window);
