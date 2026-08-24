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
  /* Room layers are anchored to the BOTTOM of the frame, not the middle.
     The layers are drawn 1600x900 and CSS slices them to fill the window, so
     on anything wider than 16:9 the crop has to come out of the height —
     and centred, it took the difference off the top *and the bottom*. On a
     2:1 laptop that put the cut at about y=829, which is straight through
     everybody's shins. Anchoring to yMax spends the whole crop on sky, which
     is the part nobody misses, and guarantees the ground line is on screen
     at every aspect ratio. Taller-than-16:9 windows are unaffected: there
     the width overflows instead and no height is lost either way. */
  function wrapRoom(w, h, inner) { return A.svgWrap(w, h, inner, null, 'xMidYMax slice'); }

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

    /* --- how many layers, and why it matters --------------------------
       Every one of these is as wide as the whole promenade — 3311 x 1364 CSS
       pixels in a 1900-wide window, four times that in device pixels on a
       Retina screen — and a change to any of their transforms is paid for in
       raster rather than in compositing, because the camera above them
       carries a `will-change` and a scale of its own. Measured on this
       machine: panning nine of them ran at 36.5fps with 27 frames over 32ms
       in two seconds; five of them ran at 49.5fps with one. That is the
       whole difference between a walk that glides and one that tears.
       So sky and clouds are one layer now, and the two ridges are one
       layer, and the promenade is six rather than eight. The parallax lost
       is between a cloud and the sky behind it, and between two ranges of
       hills forty units apart — neither of which anybody could see moving.
       **Adding a layer here is expensive.** If something new needs its own
       depth, take it out of an existing layer rather than adding a tenth. */

    /* 1 · sky, with the clouds and the birds in it */
    L.push({ depth: 0.10, svg: wrap(HUB_W, HUB_H,
      skyGrad(HUB_W, HUB_H, [[0, '#8FB0C4'], [0.42, '#D9C3B4'], [0.72, '#F2D3AE'], [1, '#F9E6C9']], 900) +
      A.sun(2560, 470, 62, '#FFF1D2', P.gold) +
      '<rect x="0" y="700" width="' + HUB_W + '" height="200" fill="#F7DEBB" opacity=".5"/>' +
      A.clouds(HUB_W, HUB_H, 5, '#FFF3E0', 0.75, [150, 520]) +
      A.birds(760, 380, 1.2, 6, 9, 'rgba(59,42,34,.42)') +
      A.birds(2180, 300, 0.9, 4, 14, 'rgba(59,42,34,.34)')
    )});

    /* 2 · the hills, far range and near, with a distant village at the foot */
    L.push({ depth: 0.30, svg: wrap(HUB_W, HUB_H,
      '<path d="' + A.ridge(HUB_W, HUB_H, { baseline: 830, amp: 330, peaks: 8, seed: 21 }) + '" fill="#9FB6C4" opacity=".85"/>' +
      '<path d="' + A.ridge(HUB_W, HUB_H, { baseline: 855, amp: 250, peaks: 12, seed: 33, phase: 1.2 }) + '" fill="' + P.dusty + '"/>' +
      '<path d="' + A.ridge(HUB_W, HUB_H, { baseline: 862, amp: 150, peaks: 16, seed: 44, phase: 2.4 }) + '" fill="' + P.dustyDeep + '" opacity=".55"/>' +
      A.houses(420, 866, 7, 0.5, 51, { wall: '#DCCDB6', roof: '#B9704E', window: 'rgba(59,42,34,.32)' }) +
      A.houses(1980, 866, 9, 0.46, 57, { wall: '#DCCDB6', roof: '#B9704E', window: 'rgba(59,42,34,.32)' }) +
      A.campanile(2140, 866, 74, 0.55, { wall: '#DCCDB6', roof: '#B9704E' }) +
      A.cypress(700, 868, 52, 'rgba(76,92,68,.7)') + A.cypress(724, 868, 40, 'rgba(76,92,68,.6)') +
      A.cypress(2620, 868, 58, 'rgba(76,92,68,.7)')
    )});

    /* 3 · the bay itself */
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

    /* 4 · the near shore, just below the promenade */
    L.push({ depth: 0.72, svg: wrap(HUB_W, HUB_H,
      A.houses(120, 1078, 6, 0.78, 71, { wall: '#EBDCC2', roof: P.terracotta, window: 'rgba(59,42,34,.45)' }) +
      A.campanile(560, 1078, 122, 0.8, { wall: '#EFE2CA', roof: P.terraDeep }) +
      A.houses(1420, 1078, 5, 0.72, 79, { wall: '#E7D8BE', roof: P.terraLight, window: 'rgba(59,42,34,.42)' }) +
      A.houses(2760, 1078, 7, 0.75, 83, { wall: '#EBDCC2', roof: P.terracotta, window: 'rgba(59,42,34,.45)' }) +
      A.cypress(1060, 1080, 200, P.oliveDeep) + A.cypress(1104, 1080, 158, '#4F5E3C') +
      A.cypress(2360, 1080, 186, P.oliveDeep) +
      A.cypress(3280, 1080, 172, '#54643F')
    )});

    /* 5 · the promenade you are standing on — entrances live on this plane */
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

    /* 6 · foreground — drawn wider so it never runs out as it rushes past */
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
    /* The plant used to be a handful of ellipses scattered above the rim,
       which is why it looked like it had come loose the moment it moved.
       Now every leaf grows on a stem out of the mouth of the urn, and the
       whole spray turns about that same point — so it can lean into the
       breeze and still, unmistakably, be growing in the pot. */
    var r = rand(x | 0), leaves = '';
    var rimY = baseY - 104 * s, n = 11;
    for (var i = 0; i < n; i++) {
      var spread = (i - (n - 1) / 2) / ((n - 1) / 2);          // -1 … 1
      var ang = -Math.PI / 2 + spread * 1.16 + (r() - 0.5) * 0.16;
      var len = (40 + (1 - Math.abs(spread)) * 34 + r() * 16) * s;
      var tipX = x + Math.cos(ang) * len, tipY = rimY + Math.sin(ang) * len;
      var midX = x + Math.cos(ang) * len * 0.62, midY = rimY + Math.sin(ang) * len * 0.62;
      leaves += '<path d="M ' + f(x) + ' ' + f(rimY) + ' Q ' + f(midX + Math.cos(ang) * 4 * s) + ' ' + f(midY) +
        ' ' + f(tipX) + ' ' + f(tipY) + '" fill="none" stroke="#5E6E46" stroke-width="' + f(2.6 * s) + '" stroke-linecap="round"/>';
      leaves += '<ellipse cx="' + f(midX) + '" cy="' + f(midY) + '" rx="' + f((15 + r() * 7) * s) + '" ry="' + f((6.5 + r() * 3) * s) +
        '" fill="' + (i % 2 ? '#6E7F52' : '#87975F') +
        '" transform="rotate(' + f(ang * 180 / Math.PI) + ' ' + f(midX) + ' ' + f(midY) + ')"/>';
      leaves += '<ellipse cx="' + f(tipX) + '" cy="' + f(tipY) + '" rx="' + f((11 + r() * 6) * s) + '" ry="' + f((5 + r() * 2.6) * s) +
        '" fill="' + (i % 2 ? '#7C8B5E' : '#96A46B') +
        '" transform="rotate(' + f(ang * 180 / Math.PI) + ' ' + f(tipX) + ' ' + f(tipY) + ')"/>';
    }
    return g + '<g class="ww-sway" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(rimY) + 'px">' + leaves + '</g>';
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

    /* Light at the lintel, deeper towards the threshold — the way a lit room
       looks from outside. "Enter" now sits high, just under the curve of the
       arch (59% of the box, y=271), where every one of these gradients is
       still pale — so the word is dark espresso, not ivory, and one colour
       of type still works on all seven. The After-Party's lintel was lifted
       from #B98CC9 to #DCC0E8 for the same reason: at the old value it was a
       mid lavender that neither a light nor a dark ink could sit on. */
    /* One hue each, spread right round the wheel. Welcome, Where to Stay and
       RSVP used to be three warm ambers within a few points of each other —
       measured at the midpoint, Welcome and RSVP were an RGB distance of 12
       apart, which is to say indistinguishable. Stay went to olive (the
       shutters and the olive groves), RSVP to rose (a letter, a wax seal),
       and Welcome deepened to a redder russet so it is not a paler Wedding.
       Travel and Explore were nudged apart at the same time. The closest any
       two now sit is 39.

       Hues, in order: 22° · 26° · 89° · 172° · 216° · 274° · 346°.

       The top of each pair also has to carry the espresso "Enter" at y=271,
       which measures 5.0–6.1:1 on six of the seven. The After-Party is the
       exception at 3.9:1 — its lavender is a mid tone no ink sits well on,
       and the lever there is the lintel colour, not the ink. */
    var interiors = {
      welcome:    ['#F9DCA6', '#9B3E1F'],
      wedding:    ['#FFE9BE', '#B96A3E'],
      afterparty: ['#DCC0E8', '#3A2550'],
      explore:    ['#BFE4E2', '#2C7F72'],
      stay:       ['#DFE8C4', '#4F6B3C'],
      travel:     ['#D3E3F4', '#3F5F93'],
      rsvp:       ['#F7D3D6', '#9E3A54']
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
      /* a laid table glimpsed inside, leaning on its own feet */
      g += '<g class="ww-lean" style="transform-origin:' + f(cx) + 'px ' + f(baseY) + 'px; animation-delay:-1.1s">';
      g += '<rect x="' + f(cx - 44) + '" y="' + f(baseY - 62) + '" width="88" height="7" rx="2" fill="rgba(59,42,34,.5)"/>';
      g += '<rect x="' + f(cx - 36) + '" y="' + f(baseY - 55) + '" width="5" height="55" fill="rgba(59,42,34,.4)"/>';
      g += '<rect x="' + f(cx + 31) + '" y="' + f(baseY - 55) + '" width="5" height="55" fill="rgba(59,42,34,.4)"/>';
      g += '</g>';
      g += '<circle class="ww-flicker" cx="' + f(cx - 16) + '" cy="' + f(baseY - 74) + '" r="6" fill="#FFF0C6"/>';
      g += '<circle class="ww-flicker" cx="' + f(cx + 18) + '" cy="' + f(baseY - 78) + '" r="5" fill="#FFF0C6" style="animation-delay:-1.3s"/>';
    } else if (id === 'wedding') {
      /* Through this arch you can see the ceremony terrace: the bay at
         golden hour, a stone floor with petals on it, and the two of them
         standing hand in hand. It used to be a flat slab of teal with a
         hard edge across it and a cypress that read as a dark leaf.
         Everything inside is clipped to the opening, so the sea and the
         floor can run right to the jambs without spilling onto the stone. */
      var wClip = A.uid('wed');
      /* The horizon sits well below the "Enter": the word now lives just
         under the curve of the arch, at ay+81, and needs the plain warm
         gradient behind it — and the couple's heads want sky around them
         rather than a band of water cutting across at eye level. */
      var seaY = baseY - 100, sillY = baseY - 44;
      var rw = rand(59);
      var inner = '';

      /* the far shore, two headlands deep */
      inner += '<ellipse cx="' + f(ax + 30) + '" cy="' + f(seaY + 3) + '" rx="50" ry="24" fill="#9DB6C4"/>';
      inner += '<ellipse cx="' + f(ax + 108) + '" cy="' + f(seaY + 4) + '" rx="58" ry="16" fill="#88A5B6"/>';
      /* the bay */
      inner += '<rect x="' + f(ax - 8) + '" y="' + f(seaY) + '" width="' + f(aw + 16) + '" height="' + f(sillY - seaY) + '" fill="#6E9FA0"/>';
      inner += '<rect x="' + f(ax - 8) + '" y="' + f(seaY) + '" width="' + f(aw + 16) + '" height="3" fill="#FFF0C6" opacity=".75"/>';
      /* the path the low sun lays across the water */
      for (var wg = 0; wg < 5; wg++) {
        inner += '<rect class="ww-twinkle" x="' + f(cx - 8 - wg * 5) + '" y="' + f(seaY + 9 + wg * 8) + '" width="' + f(18 + wg * 7) + '" height="2.4" rx="1.2" fill="#FFF3D6" opacity=".6" style="animation-delay:' + (-wg * 0.7) + 's"/>';
      }
      /* the parapet, and the floor they are standing on */
      inner += '<rect x="' + f(ax - 8) + '" y="' + f(sillY - 7) + '" width="' + f(aw + 16) + '" height="8" fill="#DFCBA6"/>';
      inner += '<rect x="' + f(ax - 8) + '" y="' + f(sillY) + '" width="' + f(aw + 16) + '" height="' + f(baseY - sillY + 6) + '" fill="#E9D3A8"/>';
      inner += '<rect x="' + f(ax - 8) + '" y="' + f(sillY + 1) + '" width="' + f(aw + 16) + '" height="3" fill="#F6EAD0" opacity=".85"/>';
      /* the threshold stays warm, so this door glows from inside like the rest */
      inner += '<rect x="' + f(ax - 8) + '" y="' + f(baseY - 16) + '" width="' + f(aw + 16) + '" height="22" fill="#C98A55" opacity=".45"/>';
      /* petals, because somebody has already come up the aisle */
      for (var pw = 0; pw < 14; pw++) {
        inner += '<ellipse cx="' + f(ax + 8 + rw() * (aw - 16)) + '" cy="' + f(sillY + 9 + rw() * 32) + '" rx="' + f(2.2 + rw() * 1.8) + '" ry="' + f(1.1 + rw()) +
          '" fill="' + (pw % 2 ? '#F0D2C4' : '#E8BCA8') + '" opacity=".95"/>';
      }
      inner += A.cypress(ax + 14, sillY + 5, 52, 'rgba(62,74,50,.62)');

      /* --- the two of them ------------------------------------------------
         Backs to us, looking out over the bay, hand in hand — no faces. That
         is deliberate and it is Dana's call: at this size a face is three
         dots, and three dots on the two people whose wedding this is looked
         like a cartoon of them. Seen from behind they are anybody, which is
         the point — the guest fills them in.
         They are placed so the hands meet: a figure's hand reaches 0.233 of
         its own height forward of centre in this pose, so the gap between
         them is that, doubled. Move one and you have to move the other. */
      /* The two of them lean together, as one group and about the ground
         between their feet — separately they would drift apart, and their
         hands have to stay met. Each still breathes on its own `ww-idle`
         underneath; the lean composes on top of that. */
      inner += '<g class="ww-lean" style="transform-origin:' + f(cx) + 'px ' + f(baseY) + 'px; animation-delay:-4.6s; animation-duration:8.6s">';
      inner += A.person({ x: cx - 20, baseY: baseY - 3, h: 96, pose: 'listen',
        back: true, seed: 901, cloth: '#FBF4E8', dress: true, hair: '#3B2A22',
        hairStyle: 'bun', skin: '#E6B183', holdFar: 'bouquet',
        anim: 'ww-idle', shadow: false });
      inner += A.person({ x: cx + 20, baseY: baseY - 3, h: 102, pose: 'listen',
        back: true, flip: true, seed: 907, cloth: '#3B4A56', pants: '#2F3D49',
        dress: false, hair: '#2A2018', hairStyle: 'crop', skin: '#CE8F60',
        anim: 'ww-idle', delay: -2.4, shadow: false });
      inner += '</g>';
      /* one shadow under the pair of them, rather than two */
      inner += '<ellipse cx="' + f(cx) + '" cy="' + f(baseY - 2) + '" rx="44" ry="6" fill="rgba(90,68,44,.18)"/>';

      g += '<defs><clipPath id="' + wClip + '"><path d="' + archShape(ax, ay, aw, ah) + '"/></clipPath></defs>';
      g += '<g clip-path="url(#' + wClip + ')">' + inner + '</g>';

      /* olive garland over the arch, drawn last so it sits on the stone */
      for (var i = 0; i < 22; i++) {
        var t = i / 21, gx = ax - 12 + t * (aw + 24);
        var gy = ay + 22 - Math.sin(t * Math.PI) * 44;
        g += '<ellipse cx="' + f(gx) + '" cy="' + f(gy) + '" rx="' + f(9 + r() * 4) + '" ry="' + f(3.4 + r() * 1.6) +
             '" fill="' + (i % 3 ? P.oliveDeep : P.olive) + '" transform="rotate(' + ((r() * 140 - 70) | 0) + ' ' + f(gx) + ' ' + f(gy) + ')"/>';
      }
    } else if (id === 'afterparty') {
      /* the lanterns swing from where they are hung, not from their base */
      g += '<g class="ww-lean" style="transform-origin:' + f(ax - 20) + 'px ' + f(ay - 22) + 'px; animation-delay:-1.9s; animation-duration:6.9s">' +
        A.lantern(ax - 20, ay + 66, 1.1, ay - 22) + '</g>';
      g += '<g class="ww-lean" style="transform-origin:' + f(ax + aw + 20) + 'px ' + f(ay - 16) + 'px; animation-delay:-4.1s; animation-duration:7.6s">' +
        A.lantern(ax + aw + 20, ay + 82, 1.1, ay - 16) + '</g>';
      /* dropped from ay+96: at 34 radius it sat straight behind the word */
      g += '<circle class="ww-pulse" cx="' + cx + '" cy="' + f(ay + 132) + '" r="34" fill="#E9C6F5" opacity=".45"/>';
      g += A.dancer(cx - 20, baseY - 4, 92, 'rgba(40,24,58,.62)', 0);
      g += A.dancer(cx + 24, baseY - 4, 84, 'rgba(40,24,58,.5)', -0.7);
    } else if (id === 'explore') {
      /* a gap in the wall with a path climbing away */
      /* the path tops out at ay+112, below the "Enter"; at ay+76 its pale
         apex was directly behind the letters and washing them out */
      g += '<path d="M ' + f(cx - 26) + ' ' + f(baseY) + ' L ' + f(cx - 8) + ' ' + f(ay + 112) + ' L ' + f(cx + 10) + ' ' + f(ay + 112) + ' L ' + f(cx + 30) + ' ' + f(baseY) + ' Z" fill="#E8DCC0" opacity=".85"/>';
      /* the signpost sways on its post; the path it points down does not —
         leaning the ground itself reads as the world tilting, not as air */
      g += '<g class="ww-lean" style="transform-origin:' + f(cx + 47) + 'px ' + f(baseY) + 'px; animation-delay:-5.2s; animation-duration:6.6s">';
      g += '<rect x="' + f(cx + 44) + '" y="' + f(baseY - 150) + '" width="7" height="150" fill="#7A6247"/>';
      g += '<path d="M ' + f(cx + 51) + ' ' + f(baseY - 148) + ' l 52 0 l 12 12 l -12 12 l -52 0 Z" fill="' + P.terracotta + '"/>';
      g += '<path d="M ' + f(cx + 51) + ' ' + f(baseY - 118) + ' l 40 0 l 12 11 l -12 11 l -40 0 Z" fill="' + P.olive + '"/>';
      g += '</g>';
      g += A.cypress(ax + 16, baseY, 104, 'rgba(76,92,68,.6)');
    } else if (id === 'stay') {
      /* shuttered windows either side, a key on a hook. This was tried as a
         room with a bed and a sea window in it; next to six doorways that
         each hold one simple idea it read as clutter, and it went back. */
      g += shutter(ax - 26, ay + 34, 0.85);
      g += shutter(ax + aw + 10, ay + 34, 0.85);
      g += '<g class="ww-lean" style="transform-origin:' + f(cx) + 'px ' + f(baseY) + 'px; animation-delay:-3.4s; animation-duration:8.1s">';
      g += '<rect x="' + f(cx - 30) + '" y="' + f(baseY - 118) + '" width="60" height="118" rx="4" fill="rgba(59,42,34,.28)"/>';
      g += '<circle cx="' + f(cx + 18) + '" cy="' + f(baseY - 60) + '" r="4" fill="' + P.gold + '"/>';
      g += '</g>';
      g += '<path class="ww-swing" style="transform-box:view-box;transform-origin:' + f(cx + 60) + 'px ' + f(ay + 20) + 'px" d="M ' + f(cx + 60) + ' ' + f(ay + 20) + ' l 0 26 m -5 0 a 5 6 0 1 0 10 0 a 5 6 0 1 0 -10 0 m 5 6 l 0 12 l 5 0 m -5 6 l 4 0" stroke="' + P.gold + '" stroke-width="2.6" fill="none"/>';
    } else if (id === 'travel') {
      /* iron gate bars + a ferry on the water beyond */
      g += '<rect x="' + f(ax + 4) + '" y="' + f(baseY - 76) + '" width="' + f(aw - 8) + '" height="76" fill="#7FA3B0" opacity=".8"/>';
      /* no ww-lean on the ferry — A.boat already wraps itself in ww-bob,
         and a lean on top of that bought 0.8px of travel and a second
         animated node for nothing */
      g += A.boat(cx - 6, baseY - 40, 0.85, '#31485A', '#F4E7D3');
      /* an aeroplane crossing the opening, climbing away over the water */
      g += '<g class="ww-plane-door">' + A.airplane(cx - 6, ay + 116, 0.62, '#4E6E80') + '</g>';
      g += '<ellipse cx="' + f(cx + 34) + '" cy="' + f(ay + 40) + '" rx="26" ry="9" fill="#FFFFFF" opacity=".5"/>';
      /* Both clouds and the aeroplane clear the "Enter" line at ay+81. The
         plane dropped from ay+74 and this cloud from ay+88; a pale shape
         behind the letters washes them out however dark the ink is. */
      g += '<ellipse cx="' + f(cx - 32) + '" cy="' + f(ay + 128) + '" rx="20" ry="7" fill="#FFFFFF" opacity=".38"/>';
      g += '<path class="ww-spin-slow" style="transform-box:view-box;transform-origin:' + f(cx) + 'px ' + f(ay - 58) + 'px" d="M ' + f(cx - 26) + ' ' + f(ay - 58) + ' l 40 0 l -8 -7 l 20 7 l -20 7 l 8 -7 Z" fill="#7A6247"/>';
      g += '<rect x="' + f(cx - 2) + '" y="' + f(ay - 58) + '" width="4" height="34" fill="#7A6247"/>';
    } else if (id === 'rsvp') {
      /* a mailbox and a wax seal, glowing gold */
      /* The warm light behind the envelope. It has to be a radial gradient
         with a soft edge, not a flat disc: a flat circle at 28% only ever
         read as a glow because the interior behind it used to be the same
         amber family. Once this doorway went rose it stopped being light and
         started being *an orange circle* — a shape, with a visible edge, that
         nobody could name. It sits behind the envelope, not behind the word;
         at ay+116 its top edge cut straight across the letters. */
      var rGlow = A.uid('rg');
      g += '<defs><radialGradient id="' + rGlow + '">' +
        '<stop offset="0" stop-color="' + P.gold + '" stop-opacity=".42"/>' +
        '<stop offset=".55" stop-color="' + P.gold + '" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="' + P.gold + '" stop-opacity="0"/></radialGradient></defs>';
      g += '<circle class="ww-pulse" cx="' + cx + '" cy="' + f(ay + 152) + '" r="66" fill="url(#' + rGlow + ')"/>';
      g += '<g class="ww-lean" style="transform-origin:' + f(cx + 50) + 'px ' + f(baseY) + 'px; animation-delay:-2.3s; animation-duration:7.8s">';
      g += '<rect x="' + f(cx + 46) + '" y="' + f(baseY - 116) + '" width="9" height="116" fill="#7A6247"/>';
      g += '<rect x="' + f(cx + 24) + '" y="' + f(baseY - 156) + '" width="54" height="42" rx="8" fill="' + P.terracotta + '"/>';
      g += '<rect x="' + f(cx + 30) + '" y="' + f(baseY - 148) + '" width="42" height="5" rx="2" fill="rgba(59,42,34,.45)"/>';
      g += '</g>';
      /* Envelope hovering in the doorway, below the word. "Enter" moved up
         to just under the arch curve (ay+81) and the envelope used to span
         ay+52 to ay+100 — straight through it. It now hangs from ay+104, and
         the gold pulse behind it dropped to match. */
      g += '<g class="ww-hover-bob" style="transform-box:view-box;transform-origin:' + f(cx) + 'px ' + f(ay + 132) + 'px">' +
        '<rect x="' + f(cx - 36) + '" y="' + f(ay + 104) + '" width="72" height="48" rx="5" fill="#FFF6E4"/>' +
        '<path d="M ' + f(cx - 36) + ' ' + f(ay + 108) + ' l 36 29 l 36 -29" fill="none" stroke="' + P.terraDeep + '" stroke-width="3"/>' +
        '<circle cx="' + f(cx) + '" cy="' + f(ay + 142) + '" r="10" fill="' + P.terracotta + '"/>' +
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
    L.push({ depth: 0.15, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#2F3F5E'], [0.42, '#7A6A82'], [0.72, '#C98A6E'], [1, '#EFC095']], 620) +
      stars(ROOM_W, 380, 46, 41) +
      A.sun(1290, 560, 34, '#FFE7BE', '#F0A96B')
    )});
    L.push({ depth: 0.3, svg: wrapRoom(ROOM_W, ROOM_H,
      '<g transform="translate(0,-116)">' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 600, amp: 250, peaks: 7, seed: 12 }) + '" fill="#3E4A63"/>' +
      A.water(0, 596, ROOM_W, 210, '#4A6272', '#2A3D4E', 15, '#FFD9A8') +
      A.houses(60, 600, 5, 0.5, 19, { wall: '#5D6274', roof: '#6E4A46', window: 'rgba(255,214,150,.85)' }) +
      A.campanile(300, 600, 78, 0.5, { wall: '#5D6274', roof: '#6E4A46' }) +
      A.boat(1180, 690, 1.1, '#26313F', '#C9B9A0') +
      '</g>'
    )});
    L.push({ depth: 0.55, svg: wrapRoom(ROOM_W, ROOM_H,
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
    L.push({ depth: 0.85, svg: wrapRoom(ROOM_W, ROOM_H,
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
        /* Chairs behind, then the table, then chairs in front. Nobody eats
           alone here: there are exactly as many guests as there are seats,
           on both sides, and the table was widened to hold them. The guest
           who used to stand on their own at the right-hand end is gone —
           they read as an offcut rather than part of the party. */
        var g = '';
        var BACK = 7, FRONT = 6;
        var backX  = function (i) { return 120 + i * 158 + 29; };
        var frontX = function (i) { return 210 + i * 196; };
        for (var b = 0; b < BACK; b++) {
          var bx = backX(b) - 29;
          g += '<rect x="' + bx + '" y="666" width="58" height="14" rx="4" fill="#5C4436"/>';
          g += '<path d="M ' + bx + ' 666 l 0 -74 q 29 -14 58 0 l 0 74 Z" fill="#6B5039"/>';
        }
        /* the guests already sitting down, drawn before the table so it
           covers their laps exactly as a real table would. They lean and
           turn towards each other rather than facing front in a row. */
        /* This is the closest the guest ever gets to anybody, so it is the one
           scene where the people are properly busy: everyone nods or gestures
           or lifts a glass, on their own clock. The distant wedding crowd
           deliberately does none of this — see the note on animation in
           HANDOVER.md. */
        var BEATS = [
          { pose: 'tableUp', hold: 'glass', anim: 'ww-talk',  head: 'ww-nod',      arm: 'ww-arm-raise' },
          { pose: 'table',   hold: null,    anim: 'ww-idle',  head: 'ww-nod-slow', arm: null },
          { pose: 'tableIn', hold: null,    anim: 'ww-talk',  head: 'ww-nod',      arm: 'ww-arm-talk' },
          { pose: 'tableUp', hold: 'glass', anim: 'ww-laugh', head: 'ww-nod',      arm: 'ww-arm-talk' },
          { pose: 'table',   hold: null,    anim: 'ww-talk',  head: 'ww-nod-slow', arm: null },
          { pose: 'tableIn', hold: null,    anim: 'ww-idle',  head: 'ww-nod',      arm: 'ww-arm-talk' },
          { pose: 'tableUp', hold: 'glass', anim: 'ww-talk',  head: 'ww-nod',      arm: 'ww-arm-raise' }
        ];
        for (var d = 0; d < BACK; d++) {
          var beat = BEATS[d % BEATS.length];
          g += A.person({ x: backX(d), baseY: 710, h: 232 + (d % 3) * 12,
            pose: beat.pose, seed: 200 + d * 13, flip: d % 2 === 1, shadow: false,
            hold: beat.hold, anim: beat.anim,
            headAnim: beat.head, armAnim: beat.arm,
            delay: -(d * 1.7) % 6, headDelay: -(d * 2.3) % 5, armDelay: -(d * 1.1) % 5 });
        }
        g += '<rect x="40" y="742" width="1240" height="26" rx="6" fill="#F2E7D2"/>';
        g += '<rect x="40" y="768" width="1240" height="14" fill="#CBB795"/>';
        for (var i = 0; i < 7; i++) {
          var x = 96 + i * 184;
          g += '<rect x="' + x + '" y="782" width="14" height="86" rx="3" fill="#6B5744"/>';
        }
        /* a place setting in front of every guest at the far side */
        for (var p2 = 0; p2 < BACK; p2++) {
          g += A.plate(backX(p2), 757, 0.92, 300 + p2 * 7);
        }
        /* candles down the middle, between the settings */
        /* Candles stand between the place settings, never in line with a guest:
           the soft halo used to land exactly on somebody's forearm and read
           as a glowing ball being held. Tall and thin, small flame, small
           glow — they light the table without taking it over. */
        for (var c = 0; c < 6; c++) {
          var cxp = 226 + c * 158;
          g += '<rect x="' + cxp + '" y="676" width="10" height="68" rx="3" fill="#F8F1E0"/>';
          g += '<rect x="' + (cxp + 6) + '" y="676" width="4" height="68" fill="#E2D5BC" opacity=".7"/>';
          g += '<circle class="ww-flicker" cx="' + (cxp + 5) + '" cy="670" r="5.5" fill="#FFE9B0" style="animation-delay:' + (-c * 0.6) + 's"/>';
          g += '<circle class="ww-flicker" cx="' + (cxp + 5) + '" cy="670" r="13" fill="#F0B45C" opacity=".18" style="animation-delay:' + (-c * 0.6) + 's"/>';
        }
        /* a carafe and glasses, because someone always pours early */
        g += '<path d="M 560 742 l 0 -34 q 0 -14 12 -20 l 0 -12 l 20 0 l 0 12 q 12 6 12 20 l 0 34 Z" fill="#D8C9A8" opacity=".9"/>';
        g += '<path d="M 700 742 l 0 -22 q -9 -8 -9 -20 l 26 0 q 0 12 -9 20 l 0 22 Z" fill="#EFE7D4" opacity=".85"/>';
        g += '<path d="M 1080 742 l 0 -34 q 0 -14 12 -20 l 0 -12 l 20 0 l 0 12 q 12 6 12 20 l 0 34 Z" fill="#D8C9A8" opacity=".9"/>';
        /* front-row chairs, seen from behind — one guest in every one */
        for (var fch = 0; fch < FRONT; fch++) {
          var fx = frontX(fch) - 40;
          g += A.person({ x: frontX(fch), baseY: 884, h: 292 + (fch % 3) * 10,
            pose: fch % 3 === 1 ? 'tableUp' : 'table', back: true,
            seed: 400 + fch * 11, shadow: false,
            anim: fch % 2 ? 'ww-talk' : 'ww-idle',
            headAnim: fch % 2 ? 'ww-nod' : 'ww-nod-slow',
            armAnim: fch % 3 === 1 ? 'ww-arm-talk' : null,
            delay: -(fch * 2.1) % 6, headDelay: -(fch * 1.3) % 5 });
          g += '<path d="M ' + fx + ' 960 l 0 -84 q 40 -16 80 0 l 0 84 Z" fill="#4E382A"/>';
          g += '<rect x="' + (fx - 6) + '" y="868" width="92" height="14" rx="6" fill="#5E452F"/>';
        }
        /* A waiter coming up to the head of the table with a tray. He lives on
           the left because on a laptop the details panel covers everything
           past about x=1050 — put him at the other end and half the guests
           would never see him. */
        g += A.person({ x: 104, baseY: 902, h: 268, pose: 'serve', seed: 523,
          cloth: '#F2E4CC', pants: '#3B3026', hairStyle: 'crop', dress: false,
          skin: '#CE8F60', hold: 'tray', anim: 'ww-idle', headAnim: 'ww-nod-slow',
          delay: -1.4, headDelay: -3.1 });
        return g;
      })() + '</g>'
    )});
    L.push({ depth: 1.25, svg: wrapRoom(ROOM_W, ROOM_H,
      A.branch(-30, 20, 1, false, { leaf: '#22301F', leaf2: '#2E3F26' }, 29) +
      A.lantern(120, 150, 1.9, 0) + A.lantern(1480, 118, 1.6, 0)
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'dusk' };
  };

  /* --- 2 · The Wedding: cliff terrace, golden hour --------------------- */
  rooms.wedding = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#8FB6C9'], [0.4, '#E6C39C'], [0.75, '#F6D3A0'], [1, '#FBE7C6']], 640) +
      A.sun(1180, 470, 56, '#FFF3D6', '#F2B968') +
      A.clouds(ROOM_W, ROOM_H, 6, '#FFF0DA', 0.8, [90, 300]) +
      A.birds(360, 200, 1, 5, 9, 'rgba(59,42,34,.35)')
    )});
    L.push({ depth: 0.28, svg: wrapRoom(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 610, amp: 300, peaks: 6, seed: 22 }) + '" fill="#A8BECB" opacity=".9"/>' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 630, amp: 190, peaks: 9, seed: 26, phase: 1.6 }) + '" fill="' + P.dusty + '"/>'
    )});
    L.push({ depth: 0.45, svg: wrapRoom(ROOM_W, ROOM_H,
      A.water(0, 628, ROOM_W, 190, '#69989B', '#31626A', 27, '#FFF0CE') +
      '<ellipse cx="380" cy="700" rx="66" ry="12" fill="#D7C8AC"/>' +
      A.houses(342, 694, 3, 0.34, 31, { wall: '#F0E3CB', roof: P.terracotta, window: 'rgba(59,42,34,.4)' }) +
      A.boat(940, 726, 1, '#3B2A22', '#FFF5E2') +
      A.houses(1180, 690, 6, 0.4, 35, { wall: '#EADCC2', roof: P.terraLight, window: 'rgba(59,42,34,.35)' })
    )});
    L.push({ depth: 0.8, svg: wrapRoom(ROOM_W, ROOM_H,
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
        /* --- no chairs -------------------------------------------------
           There were five rows of them either side of the aisle, with
           thirteen guests sitting in them. They are gone at Dana's request.
           Twenty seats and thirteen seated figures in a 1600-wide scene left
           nowhere for anybody to stand without touching somebody else, and
           the rows themselves were the densest thing in the picture. The
           terrace is now bare stone with people standing about on it, which
           is what the hour before a ceremony actually looks like. `chair()`
           is still defined further down this file, unused, if they ever come
           back. */
        /* petals down the aisle */
        var rp = rand(47);
        for (var p = 0; p < 40; p++) {
          g += '<ellipse cx="' + f(560 + rp() * 300) + '" cy="' + f(828 + rp() * 78) + '" rx="' + f(4 + rp() * 4) + '" ry="' + f(2 + rp() * 2) +
            '" fill="' + (p % 2 ? '#F0D2C4' : '#E8BCA8') + '" opacity=".9"/>';
        }

        /* --- under the arch, the couple --------------------------------
           They were taken out of here once, at Dana's request, on the
           grounds that at 150px tall two figures could not carry being "the
           couple". They are back, at Dana's request, and this time they can:
           `A.bride()` and `A.groom()` in art.js dress them from one table —
           ivory gown and veil, deep navy tuxedo and a white bow tie — and
           the same two people now appear in six places across the site, so
           the guest has met them before they get here.
           They are the largest pair on the terrace and they stand alone in
           the middle of it, which is what makes them the focal point rather
           than two more guests. **Three guests came out to make the room**:
           the ones who stood at x=526, 632 and 713, straight under the arch.
           Fourteen are left, and the arithmetic below has been redone around
           the gap.

           **The numbers, worked the same way as the crowd.** They stand at
           586 and 684, facing each other, on the head line — `baseY = 0.99h
           + 727` puts both head tops at y=727, as it does for everybody
           standing on this terrace. In the `listen` pose a figure reaches
           .283h on its near side and .238h on its far side, and the bride's
           veil flares .235h either way, so:
             bride  586, h 152 → 550.3 … 629.0   (veil to 621.7)
             groom  684, h 158 → 639.3 … 721.6
           which leaves ten units of daylight between them and their raised
           hands twenty-one apart — near enough to read as a couple turned to
           each other, far enough that nothing collides. Their nearest
           neighbours are the guest at 449 (clear to 474.7) and the one at
           806 (clear from 782.8), so there is about sixty units of empty
           terrace either side of the pair. That space is the composition.
           They are drawn after the crowd, on top of it: they are the biggest
           figures here and the two the whole room is about.
           Their motion is `ww-idle` and a slow nod, not the `ww-mingle` the
           party is on. Everybody else is waiting for something to start;
           these two are the something. */
        var arch = (function () {
          var cg = '';
          cg += A.bride({
            x: 586, baseY: 877.5, h: 152, pose: 'listen',
            hold: 'bouquet', seed: 901,
            anim: 'ww-idle', delay: -1.2, headAnim: 'ww-nod-slow', headDelay: -2.4
          });
          cg += A.groom({
            x: 684, baseY: 883.4, h: 158, pose: 'listen', flip: true, seed: 913,
            anim: 'ww-idle', delay: -3.1, headAnim: 'ww-nod-slow', headDelay: -0.8
          });
          return cg;
        })();

        /* --- the guests ------------------------------------------------
           Seventeen of them, gathered right across the terrace and through
           the aisle, turned every which way: the pairs face each other,
           three have their backs to us watching the arch, and the
           photographer is side-on to it. The brief was a crowd standing
           together — close, filling the width, no dead ground anywhere.

           **Nobody touches anybody**, and that is why this is one flat list
           rather than `chatGroup`. A chat group packs its figures 0.42 of a
           height apart, which is narrower than their shoulders — so inside a
           knot people always overlapped, however carefully the knots
           themselves were spaced. Spacing the groups was fixing the wrong
           thing.

           **How wide a figure actually is, because this is easy to get
           wrong.** A limb in `person()` hangs off the *shoulder*, at x ±
           0.132h — the numbers in the POSES table are measured from there,
           not from the figure's centre line. So a `chat` arm, whose hand
           sits .170h out along the pose, reaches 0.132 + 0.170 + a hand
           radius of 0.036 = **0.338h**, and 0.379h with a glass in it. An
           earlier pass here assumed 0.235h, was wrong by a third of a
           figure, and only escaped because the gaps happened to be wide.

           The extents are therefore **per pose and per side**, and a flipped
           figure has them the other way round:

             chat   .223 / .338 (.379 with a glass)   laugh  .308 / .248
             toast  .226 / .303 (.344 with a glass)   photo  .273 / .278
             listen .238 / .283    wave .223 / .283   stand  .230 / .238

           with a floor of 0.20h either side for a gown's hem, 0.15h for the
           ground shadow and 0.14h for the head and hair. The spans below are
           built from those, and the closest any two drawn figures come is
           **16 units**, measured off the rendered SVG rather than trusted
           from the model — a real, visible sliver, nothing touching. Gaps
           run 16 to 29, unevenly, so the crowd breaks into knots rather than
           reading as railings.

           If you add somebody, work their span out the same way. Do not
           eyeball it, do not use a single symmetric margin, and do not tuck
           somebody in behind an existing figure — the terrace is only about
           fifty units deep, far too little for a nearer figure to read as
           *in front of* another rather than stuck to it.

           **Depth is carried by size, not by y.** 104–110 at the back
           against 148–164 at the front, and **baseY moves with the height** —
           the relation is `baseY = 0.99h + 727`, which lands every head top
           on y=727. That is not a coincidence to be tidied away: figures
           standing on level ground share a head line at the viewer's eye
           level, and it is what lets the sizes vary this much without
           anybody looking like they are floating. Change a height and you
           must move its baseY by the same rule. The sizes alternate along
           the row rather than receding left to right, which is what stops it
           reading as a queue.

           **Feet down to y=891, and the frame bottom is y=900.** That is
           new. The room layers used to be sliced from the middle
           (`xMidYMid`), so on anything wider than 16:9 the crop came off the
           top *and the bottom* — on a 2:1 laptop the cut landed at about
           y=829, straight through everybody's shins. Layers are now sliced
           bottom-anchored (`wrapRoom`, above) and `.room-art` no longer
           bleeds past the bottom edge, so **y=900 is the foot of the frame
           at every aspect ratio**, measured. That is what bought the deeper
           strip of terrace these figures stand on, and it is why they could
           grow about 18% without anything being cropped. A shoe hangs about
           0.013h below its baseY, so 891 leaves nine units in hand.

           Sideways is still window-dependent: a laptop sees room x=59 across
           to wherever the details panel starts (about 900), so the guests at
           the far ends drop out on a narrow window. That is fine — a crowd
           should run past the edges.

           **The aisle has people in it now.** It used to be held open, with
           nothing between the guest and the arch; at Dana's request the gap
           is closed and the crowd runs straight through. Nobody stands
           directly under the keystone, so the arch still reads.

           Everyone is in evening wear (`evening: true`) — gowns to the floor
           and dark suits, from the GOWNS and SUITS palettes in art.js, which
           carry the pinks, reds, oranges, yellows, purples and blues. There
           is no colour set anywhere in this table on purpose: each figure
           dresses itself from its seed, and that is what keeps the crowd
           varied. If the room ever looks drab, widen the palette — do not
           start pinning colours onto individuals here. */

        var GUESTS = [
          /*   x     h   baseY  pose       facing   holding */
          {  x:   49, h: 158, y: 883, pose: 'chat',   face: 'r', hold: 'glass' },
          {  x:  160, h: 112, y: 838, pose: 'listen', face: 'l' },
          {  x:  253, h: 134, y: 860, pose: 'laugh',  face: 'r' },
          {  x:  359, h: 164, y: 889, pose: 'toast',  face: 'l', hold: 'glass' },
          {  x:  449, h: 108, y: 834, pose: 'stand',  face: 'back' },
          {  x:  806, h: 104, y: 830, pose: 'chat',   face: 'r' },
          /* the photographer, side-on to the arch */
          {  x:  901, h: 138, y: 864, pose: 'photo',  face: 'l', hold: 'camera', suit: true },
          {  x:  993, h: 160, y: 885, pose: 'toast',  face: 'r', hold: 'glass' },
          {  x: 1108, h: 110, y: 836, pose: 'listen', face: 'l' },
          {  x: 1180, h: 128, y: 854, pose: 'wave',   face: 'r' },
          {  x: 1292, h: 148, y: 874, pose: 'chat',   face: 'l' },
          {  x: 1367, h: 106, y: 832, pose: 'stand',  face: 'back' },
          {  x: 1458, h: 154, y: 879, pose: 'laugh',  face: 'r' },
          {  x: 1557, h: 122, y: 848, pose: 'listen', face: 'l' }
        ];

        /* A guest's seed is their **row number in the table above**, fixed
           before the sort. It decides their whole wardrobe, so tying it to
           the draw order instead would mean that changing one person's
           height reshuffles what everybody else is wearing. */
        for (var q = 0; q < GUESTS.length; q++) GUESTS[q].seed = 700 + q * 13;

        /* smallest first, so a nearer figure wins any close call */
        var order = GUESTS.slice().sort(function (a, b) { return a.h - b.h; });
        for (var w = 0; w < order.length; w++) {
          var gu = order[w];
          var talks = gu.pose === 'chat' || gu.pose === 'toast' || gu.pose === 'laugh';
          g += A.person({
            x: gu.x, baseY: gu.y, h: gu.h, pose: gu.pose,
            flip: gu.face === 'l', back: gu.face === 'back',
            hold: gu.hold || null, suit: gu.suit, evening: true,
            seed: gu.seed,
            /* a weight-shift, not a dance — the register the terrace is in */
            anim: gu.pose === 'laugh' ? 'ww-laugh' : 'ww-mingle',
            /* Heads and hands only where the guest is close enough to see
               them. Seventeen figures all nodding is both noise and a lot of
               separately-animated nodes; the ones at the back keep still. */
            headAnim: gu.h < 100 ? null : (w % 2 ? 'ww-nod' : 'ww-nod-slow'),
            armAnim: talks && gu.h >= 110 ? 'ww-arm-talk' : null,
            /* everyone on their own clock, or seventeen people breathe together */
            delay: -((gu.seed * 0.7) % 6),
            headDelay: -((gu.seed * 0.3) % 5)
          });
        }

        /* last, and therefore in front of everybody */
        g += arch;

        return g;
      })()
    )});
    L.push({ depth: 1.3, svg: wrapRoom(ROOM_W, ROOM_H,
      A.branch(-30, 20, 1.05, false, { leaf: '#4A5A38', leaf2: P.oliveDeep }, 29) +
      A.cypress(1560, 920, 420, '#3E4E32') + A.cypress(1500, 924, 300, '#46563A') +
      A.grassTufts(0, 916, ROOM_W, 26, 23, 'rgba(70,86,58,.6)')
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'gold' };
  };

  /* --- 3 · After-Party: a courtyard at midnight ------------------------ */
  rooms.afterparty = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#0F1522'], [0.55, '#1E2A3A'], [1, '#33304A']], 700) +
      stars(ROOM_W, 520, 90, 53) +
      '<circle cx="1300" cy="180" r="46" fill="#F3E7C8" opacity=".92"/>' +
      '<circle cx="1300" cy="180" r="120" fill="#F3E7C8" opacity=".08"/>'
    )});
    L.push({ depth: 0.3, svg: wrapRoom(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 620, amp: 260, peaks: 7, seed: 61 }) + '" fill="#141C28"/>' +
      A.houses(40, 700, 9, 0.62, 63, { wall: '#232C3C', wallShade: '#1A2130', roof: '#2C2434', window: 'rgba(244,196,116,.85)' }) +
      A.campanile(520, 700, 130, 0.7, { wall: '#232C3C', roof: '#2C2434' }) +
      A.houses(1140, 700, 6, 0.6, 67, { wall: '#232C3C', wallShade: '#1A2130', roof: '#2C2434', window: 'rgba(244,196,116,.7)' })
    )});
    L.push({ depth: 0.55, svg: wrapRoom(ROOM_W, ROOM_H,
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
    L.push({ depth: 0.85, svg: wrapRoom(ROOM_W, ROOM_H,
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
      /* Everybody on this floor is dancing. There used to be two figures
         standing still with drinks at the far left, and next to seven people
         moving they read as a glitch rather than as a quiet corner — so they
         are gone and the floor runs the full width instead. The DJ, who once
         stood 470 units clear of the nearest dancer, is at the right-hand end
         of the same crowd.
         Nine on the floor now: seven guests and, in the middle of them, the
         bride and the groom. They are placed left of centre on purpose — on
         a laptop the details panel covers everything past about x=900, and
         the two figures the scene is about should not be the two behind the
         copy. */
      A.dancer(104, 838, 196, '#0C1119', -2.6) +
      A.dancer(244, 830, 214, '#0C1119', 0) +
      A.dancer(378, 850, 186, '#0C1119', -0.9) +
      /* --- the bride and groom, on the floor with everybody else --------
         Same two people as the terrace, the aeroplane and the RSVP gate,
         and the same wrappers draw them — but `flat` takes the bodies down
         to the courtyard's own silhouette black, so they belong to this
         scene rather than being lit differently from the seven people
         around them. The veil and the bow tie stay white whatever `flat`
         says (see person() in art.js), and on a night floor that is the
         entire trick: two dark shapes, one with a white net behind her head
         and one with a white bow at his collar, and you know exactly who
         they are without a single lit face.
         They dance together, 144 apart — near enough to be a pair among a
         crowd that is otherwise evenly spread. Their flung arms overlap by
         about eleven units, which on a dance floor of silhouettes is what a
         dance floor looks like; the no-overlap rule belongs to the wedding
         terrace, where people are standing still and lit. */
      /* A short dress rather than the floor-length gown she wears on the
         terrace. Drawn as a gown here she came out as one solid bell of
         black with a veil on top of it — no legs, no dance, and next to
         seven people throwing their arms about she read as somebody
         standing very still. The veil is what says "bride" in this scene;
         the dress lets her move like everybody else on the floor. */
      A.bride({ x: 496, baseY: 842, h: 206, flat: '#0C1119', pose: 'dance',
        gown: false, dress: true, seed: 901, anim: 'ww-dance', delay: -1.7 }) +
      A.groom({ x: 640, baseY: 848, h: 218, flat: '#0C1119', pose: 'dance2',
        flip: true, seed: 913, anim: 'ww-dance', delay: -0.6 }) +
      A.dancer(784, 852, 178, '#0C1119', -0.4) +
      A.dancer(892, 840, 204, '#0C1119', -2.2) +
      /* the DJ — drawn first, so the decks stand in front of them */
      A.dancer(1014, 846, 192, '#0C1119', -1.4) +
      A.person({ x: 1178, baseY: 862, h: 200, flat: '#0C1119', pose: 'dance', seed: 823,
        anim: 'ww-dance', delay: -1.1 }) +
      '<rect x="1103" y="806" width="150" height="58" rx="4" fill="#0C1119"/>' +
      '<rect x="1117" y="798" width="122" height="10" rx="3" fill="#161E2C"/>' +
      '<circle class="ww-twinkle" cx="1145" cy="818" r="7" fill="#C98CE0" opacity=".8"/>' +
      '<circle class="ww-twinkle" cx="1211" cy="818" r="7" fill="#F0B45C" opacity=".8" style="animation-delay:-1.4s"/>'
    )});
    L.push({ depth: 1.3, svg: wrapRoom(ROOM_W, ROOM_H,
      A.lantern(150, 200, 2.2, 0) + A.lantern(430, 130, 1.7, 0) + A.lantern(1290, 176, 2, 0) + A.lantern(1520, 120, 1.5, 0) +
      '<rect x="0" y="880" width="' + ROOM_W + '" height="30" fill="#0C1119" opacity=".7"/>'
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'night' };
  };

  /* --- 4 · Explore: the whole bay, drawn like a map -------------------- */
  rooms.explore = function () {
    var L = [];
    L.push({ depth: 0.12, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#6FA6C4'], [0.55, '#A9CBDB'], [1, '#E3ECEB']], 420) +
      A.clouds(ROOM_W, ROOM_H, 71, '#FFFFFF', 0.7, [60, 240]) +
      A.sun(1420, 130, 44, '#FFF6DC', '#FBD98F')
    )});
    L.push({ depth: 0.26, svg: wrapRoom(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 430, amp: 300, peaks: 7, seed: 73 }) + '" fill="#8FA9B8"/>' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 460, amp: 210, peaks: 11, seed: 77, phase: 2 }) + '" fill="#6E8C9C"/>'
    )});
    L.push({ depth: 0.45, svg: wrapRoom(ROOM_W, ROOM_H,
      A.water(0, 452, ROOM_W, 460, '#63B0AE', '#2E6B72', 79, '#FFFFFF') +
      /* headlands folding into the bay */
      '<path d="M -20 452 Q 240 500 420 452 L 420 470 Q 220 540 -20 500 Z" fill="#6F8A6A"/>' +
      '<path d="M 1620 452 Q 1360 520 1120 460 L 1120 486 Q 1380 560 1620 496 Z" fill="#6F8A6A"/>' +
      '<ellipse cx="700" cy="560" rx="52" ry="11" fill="#E2D4B8"/>' +
      A.houses(668, 556, 3, 0.3, 81, { wall: '#F3E7D0', roof: P.terracotta, window: 'rgba(59,42,34,.4)' }) +
      A.boat(980, 620, 1.1, '#3B2A22', '#FFFFFF') + A.boat(430, 690, 1.3, '#3B2A22', '#FFF6E4')
    )});
    L.push({ depth: 0.7, svg: wrapRoom(ROOM_W, ROOM_H,
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
    L.push({ depth: 1.05, svg: wrapRoom(ROOM_W, ROOM_H,
      (function () {
        var pins = [[190, 660], [420, 620], [700, 528], [560, 742], [960, 604], [1140, 690], [1330, 596], [1450, 780]];
        var g = '';
        for (var i = 0; i < pins.length; i++) {
          g += mapPin(pins[i][0], pins[i][1], i + 1, i * 0.35);
        }
        return g;
      })()
    )});
    L.push({ depth: 1.3, svg: wrapRoom(ROOM_W, ROOM_H,
      A.branch(-30, 10, 0.85, false, { leaf: '#4A5A38', leaf2: P.oliveDeep }, 93) +
      A.grassTufts(0, 918, ROOM_W, 22, 95, 'rgba(70,86,58,.55)')
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'day' };
  };

  function mapPin(x, y, n, delay) {
    return '<g class="ww-hover-bob" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(y) + 'px;animation-delay:' + f(-delay) + 's">' +
      '<ellipse cx="' + f(x) + '" cy="' + f(y + 4) + '" rx="9" ry="3.5" fill="rgba(59,42,34,.25)"/>' +
      '<path d="M ' + f(x) + ' ' + f(y) + ' c -16 -20 -22 -30 -22 -42 a 22 22 0 0 1 44 0 c 0 12 -6 22 -22 42 Z" fill="' + P.terracotta + '"/>' +
      '<circle cx="' + f(x) + '" cy="' + f(y - 42) + '" r="12" fill="#FFF3DE"/>' +
      '<text x="' + f(x) + '" y="' + f(y - 37) + '" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="' + P.terraDeep + '">' + n + '</text></g>';
  }

  /* --- 5 · Where to Stay: a street of shuttered houses ----------------- */
  rooms.stay = function () {
    var L = [];
    L.push({ depth: 0.15, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#8CB4CA'], [0.5, '#CBD8DA'], [1, '#F3E2C6']], 520) +
      A.clouds(ROOM_W, ROOM_H, 101, '#FFF6E8', 0.65, [70, 230]) +
      A.birds(1120, 190, 0.9, 4, 103, 'rgba(59,42,34,.3)')
    )});
    L.push({ depth: 0.3, svg: wrapRoom(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 520, amp: 280, peaks: 8, seed: 105 }) + '" fill="#9DB4C1"/>' +
      A.houses(60, 560, 14, 0.44, 107, { wall: '#E6D9C1', roof: '#C07B54', window: 'rgba(59,42,34,.35)' })
    )});
    L.push({ depth: 0.55, svg: wrapRoom(ROOM_W, ROOM_H,
      /* stepped town blocks climbing the hill */
      A.houses(-30, 700, 6, 0.95, 109, { wall: '#EFE1C7', roof: P.terracotta, window: 'rgba(59,42,34,.45)' }) +
      A.houses(560, 660, 5, 0.9, 111, { wall: '#EADAC0', roof: P.terraLight, window: 'rgba(59,42,34,.42)' }) +
      A.houses(1080, 700, 6, 0.98, 113, { wall: '#F1E4CB', roof: P.terraDeep, window: 'rgba(59,42,34,.45)' }) +
      A.cypress(520, 706, 190, P.oliveDeep) + A.cypress(1040, 706, 160, '#54643F')
    )});
    L.push({ depth: 0.9, svg: wrapRoom(ROOM_W, ROOM_H,
      /* the street itself: doors, shutters, laundry, warm windows */
      (function () {
        var g = '<rect x="-20" y="700" width="1640" height="220" fill="#E5D5B6"/>';
        g += '<rect x="-20" y="700" width="1640" height="12" fill="#D2BF9C"/>';
        var xs = [30, 300, 570, 840, 1110], r = rand(117);

        /* --- who is at home ------------------------------------------------
           The street was five empty facades. It now has people in some of the
           windows and standing in some of the doorways, and — in the wide
           window of the second house — **the bride and the groom**, the same
           two the guest meets under the arch, on the dance floor and in the
           aeroplane.

           Three rules held this together, and all three came from putting a
           first pass on the screen and looking at it.

           **Not every window.** Somebody at every opening is not a street, it
           is a doll's house. Six windows out of eighteen have anybody in them
           and two doorways out of five, in no pattern — which is what makes
           it read as a street where some people happen to be in.

           **Nobody is drawn small.** These are `A.bust()` — whole figures,
           drawn the ordinary way and clipped to the opening, so the people at
           the windows have the same heads, hair, faces and clothes as the
           people everywhere else on the site. A second, simplified upper-body
           kit would have been less code today and two kits drifting apart by
           the next round of feedback.

           **The couple need a window they fit in.** Two heads will not go in
           52 units side by side, so the top storey of the second house is one
           wide window rather than two narrow ones — a balcony window, which
           the architecture happily supports. It is the second house on
           purpose: on a laptop the details panel covers the room from about
           x=900, so the fifth house is never seen and the fourth only half.

           **Only what is close enough to see moves.** A wave, a nod, a
           breath. The people at the windows are about 66 units tall on a
           1600-unit scene; anything more than that at this size is a twitch,
           not a gesture. */
        var CAST = {
          /* house · row · col  →  who is at that window */
          '0-0-1': { h: 112, dx: -9, pose: 'wave', armAnim: 'ww-arm-raise', armDelay: -0.6,
                     headAnim: 'ww-nod', headDelay: -1.9, seed: 301, cloth: '#C4643C' },
          '2-1-1': { h: 108, dx: 4, pose: 'listen', flip: true, headAnim: 'ww-nod-slow',
                     headDelay: -3.1, seed: 313, cloth: '#7A97A8' },
          '3-0-0': { h: 110, dx: -2, pose: 'chat', armAnim: 'ww-arm-talk', armDelay: -2.4,
                     seed: 331, cloth: '#7C8B5E' },
          '4-1-0': { h: 106, dx: 6, pose: 'listen', headAnim: 'ww-nod', headDelay: -0.7,
                     seed: 347, cloth: '#E4A853' }
        };
        /* and two people standing in their own doorways */
        var ATDOOR = {
          '0': { h: 92, pose: 'stand', flip: true, seed: 359, cloth: '#5A4260',
                 anim: 'ww-idle', delay: -2.1, headAnim: 'ww-nod-slow', headDelay: -1.2 },
          '2': { h: 96, pose: 'wave', seed: 373, cloth: '#4E6E80',
                 anim: 'ww-idle', delay: -0.8, armAnim: 'ww-arm-raise', armDelay: -1.6 }
        };

        function pane(wx, wy, ww, lit) {
          var q = '<rect x="' + f(wx) + '" y="' + f(wy) + '" width="' + f(ww) + '" height="66" fill="rgba(59,42,34,.35)"/>';
          q += '<rect x="' + f(wx) + '" y="' + f(wy) + '" width="' + f(ww) + '" height="66" fill="' + P.goldLight + '" opacity="' + (lit ? '.7' : '0') + '"/>';
          return q;
        }
        function shutters(wx, wy, ww, col) {
          return '<rect x="' + f(wx - 15) + '" y="' + f(wy) + '" width="15" height="66" fill="' + col + '"/>' +
                 '<rect x="' + f(wx + ww) + '" y="' + f(wy) + '" width="15" height="66" fill="' + col + '"/>';
        }

        for (var i = 0; i < xs.length; i++) {
          var x = xs[i], w = 230, h = 330, top = 700 - h;
          g += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" fill="' + (i % 2 ? '#F3E6CE' : '#EADCC0') + '"/>';
          g += '<polygon points="' + (x - 8) + ',' + top + ' ' + (x + w + 8) + ',' + top + ' ' + (x + w) + ',' + (top - 22) + ' ' + (x + 8) + ',' + (top - 22) + '" fill="' + (i % 2 ? P.terracotta : P.terraDeep) + '"/>';
          /* door */
          g += '<path d="M ' + (x + 92) + ' 700 L ' + (x + 92) + ' 596 a 23 23 0 0 1 46 0 L ' + (x + 138) + ' 700 Z" fill="' + (i % 2 ? '#4E6E80' : '#7C8B5E') + '"/>';
          g += '<circle cx="' + (x + 130) + '" cy="654" r="4" fill="' + P.gold + '"/>';
          /* somebody standing in it, drawn before the step so their feet
             stand on the threshold rather than in front of it */
          if (ATDOOR[i]) {
            var dp = {}, dk;
            for (dk in ATDOOR[i]) dp[dk] = ATDOOR[i][dk];
            dp.x = x + 115; dp.baseY = 700; dp.shadow = false;
            g += A.person(dp);
          }
          g += '<rect x="' + (x + 84) + '" y="700" width="62" height="7" fill="#CBB795"/>';
          /* shuttered windows */
          var shCol = i % 2 ? '#4E6E80' : '#6B7F55';
          for (var row = 0; row < 2; row++) {
            /* the second house's top storey is one wide window, and the
               couple are in it */
            if (i === 1 && row === 0) {
              var bwx = x + 40, bwy = top + 46, bww = 162;
              g += pane(bwx, bwy, bww, true);
              g += A.bust({ x: bwx, y: bwy, w: bww, h: 66 },
                { h: 116, dx: -37, crown: 8, pose: 'listen', seed: 901,
                  veil: true, cloth: A.COUPLE.gown, gown: true, hairStyle: 'bun',
                  hair: '#4A3526', skin: '#E6B183',
                  anim: 'ww-idle', delay: -1.4, headAnim: 'ww-nod-slow', headDelay: -2.6 });
              g += A.bust({ x: bwx, y: bwy, w: bww, h: 66 },
                { h: 120, dx: 38, crown: 6, pose: 'wave', flip: true, seed: 913,
                  bowTie: A.COUPLE.tie, cloth: A.COUPLE.suit, suit: true, dress: false,
                  pants: A.COUPLE.suit, hairStyle: 'crop', hair: '#2A1D17', skin: '#CE8F60',
                  anim: 'ww-idle', delay: -3.2, armAnim: 'ww-arm-raise', armDelay: -0.9 });
              /* a mullion, so one wide opening still reads as a window */
              g += '<rect x="' + f(bwx + bww / 2 - 2) + '" y="' + f(bwy) + '" width="4" height="66" fill="rgba(59,42,34,.30)"/>';
              g += shutters(bwx, bwy, bww, shCol);
              continue;
            }
            for (var col = 0; col < 2; col++) {
              var wx = x + 40 + col * 110, wy = top + 46 + row * 96;
              var who = CAST[i + '-' + row + '-' + col];
              g += pane(wx, wy, 52, who ? true : r() < 0.45);
              if (who) {
                var wp = {}, wk;
                for (wk in who) wp[wk] = who[wk];
                g += A.bust({ x: wx, y: wy, w: 52, h: 66 }, wp);
              }
              g += shutters(wx, wy, 52, shCol);
            }
          }
          /* laundry line between buildings */
          if (i < xs.length - 1) {
            var lx1 = x + w, lx2 = x + w + 40;
            g += '<path d="M ' + lx1 + ' 470 Q ' + ((lx1 + lx2) / 2) + ' 500 ' + lx2 + ' 476" fill="none" stroke="rgba(59,42,34,.35)" stroke-width="1.6"/>';
            for (var k = 0; k < 3; k++) {
              var lx = lx1 + (k + 0.5) * ((lx2 - lx1) / 3);
              g += '<rect class="ww-sway" style="transform-box:view-box;transform-origin:' + f(lx) + 'px 486px;animation-delay:' + (-k * 0.7) + 's" x="' + f(lx - 9) + '" y="486" width="18" height="26" rx="2" fill="' + ['#F4E7D3', '#DCC7AE', '#C9D6DA'][k % 3] + '"/>';
            }
          }
        }
        return g;
      })()
    )});
    L.push({ depth: 1.25, svg: wrapRoom(ROOM_W, ROOM_H,
      urn(90, 918, 0.62) + urn(1520, 924, 0.7) +
      '<rect x="0" y="880" width="' + ROOM_W + '" height="40" fill="rgba(139,112,80,.10)"/>'
    )});
    return { w: ROOM_W, h: ROOM_H, layers: L, tone: 'day' };
  };

  /* --- 6 · Travel: the coast road in the morning ----------------------- */
  rooms.travel = function () {
    var L = [];
    L.push({ depth: 0.12, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#7FAECB'], [0.55, '#BBD5E0'], [1, '#EFE6D6']], 520) +
      A.clouds(ROOM_W, ROOM_H, 121, '#FFFFFF', 0.75, [70, 260]) +
      /* --- the aeroplane, with the couple aboard ------------------------
         This used to be a 100-unit silhouette crossing the sky on a 34
         second loop. Dana asked for a plane with people visible through the
         windows, and the two are not compatible: a shape that small has no
         windows to look into, and one that crosses the frame would only
         show its passengers for part of a minute at a time.
         So it is one aeroplane, five times the size, holding its position in
         the sky with a slow drift on it (`ww-cruise`: about twenty units of
         travel over nineteen seconds, and a little rise and fall). The
         contrail behind it does the rest of the work of saying it is moving.
         Six seats. **The bride is in the third window and the groom in the
         fourth** — the same two people, from the same `A.bride()` and
         `A.groom()` as the terrace, the dance floor and the street, so a
         guest who has walked the promenade in order recognises them here.
         Four other passengers, and one empty seat: an aeroplane in which
         every single window has a face in it reads as a diagram.
         **It sits at x=540, and that number is the two crops at once.** A
         laptop sees the room from about x=80 across to wherever the details
         panel starts, around 1020. A phone is the tighter one and it is
         tight at the *other* end: the artwork is drawn wider than the screen
         and centred, so a 375-wide phone sees x=229 to x=1371. The aircraft
         is 556 long from tailplane to nose, so at the first position — x=430
         — its tail was cut ninety units short on every phone. At 540 it runs
         248 … 804 and is whole in both. The contrail is deliberately longer
         than either crop: a vapour trail that ends inside the frame looks
         like a scratch, one that runs off the edge looks like a flight. */
      '<g class="ww-cruise">' +
      '<path d="M ' + f(540 - 620) + ' ' + f(258) + ' L ' + f(540 - 268) + ' ' + f(252) +
        '" stroke="#FFFFFF" stroke-width="9" opacity=".45" stroke-linecap="round" fill="none"/>' +
      A.airliner(540, 250, {
        seatFn: function (i, win) {
          if (i === 2) {
            return A.bust(win, { h: 96, crown: 5, pose: 'listen', seed: 901,
              veil: true, cloth: A.COUPLE.gown, gown: true, hairStyle: 'bun',
              hair: '#4A3526', skin: '#E6B183',
              anim: 'ww-idle', delay: -1.6, headAnim: 'ww-nod-slow', headDelay: -2.8 });
          }
          if (i === 3) {
            return A.bust(win, { h: 100, crown: 4, pose: 'listen', flip: true, seed: 913,
              bowTie: A.COUPLE.tie, cloth: A.COUPLE.suit, suit: true, dress: false,
              pants: A.COUPLE.suit, hairStyle: 'crop', hair: '#2A1D17', skin: '#CE8F60',
              anim: 'ww-idle', delay: -3.4, headAnim: 'ww-nod-slow', headDelay: -0.9 });
          }
          if (i === 4) return '';                    // one seat with nobody at the window
          var kit = [
            { seed: 411, cloth: '#C4643C', hairStyle: 'curls', pose: 'listen' },
            { seed: 423, cloth: '#7C8B5E', hairStyle: 'long', pose: 'chat', flip: true },
            { seed: 0, cloth: '', hairStyle: '', pose: '' },
            { seed: 0, cloth: '', hairStyle: '', pose: '' },
            { seed: 0, cloth: '', hairStyle: '', pose: '' },
            { seed: 437, cloth: '#5A4260', hairStyle: 'wave', pose: 'listen', flip: true }
          ][i];
          return A.bust(win, { h: 94, crown: 6, pose: kit.pose, flip: kit.flip,
            seed: kit.seed, cloth: kit.cloth, hairStyle: kit.hairStyle,
            anim: 'ww-idle', delay: -(i * 1.3), headAnim: i % 2 ? 'ww-nod' : 'ww-nod-slow',
            headDelay: -(i * 0.9) });
        }
      }) + '</g>'
    )});
    L.push({ depth: 0.28, svg: wrapRoom(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 520, amp: 300, peaks: 7, seed: 123 }) + '" fill="#9BB2C0"/>' +
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 540, amp: 190, peaks: 10, seed: 127, phase: 1.4 }) + '" fill="#7A97A8"/>' +
      A.houses(1060, 566, 7, 0.42, 129, { wall: '#E4D7BF', roof: '#BE7A54', window: 'rgba(59,42,34,.3)' })
    )});
    L.push({ depth: 0.5, svg: wrapRoom(ROOM_W, ROOM_H,
      A.water(0, 560, ROOM_W, 260, '#6FA5A8', '#356B72', 131, '#FFFFFF') +
      /* the ferry */
      '<g class="ww-bob" style="transform-box:view-box;transform-origin:700px 660px">' +
      '<path d="M 610 660 l 190 0 l -14 30 l -162 0 Z" fill="#F0E5D0"/>' +
      '<rect x="640" y="632" width="120" height="28" fill="#FFFFFF"/>' +
      '<rect x="656" y="638" width="14" height="12" fill="#4E6E80"/><rect x="682" y="638" width="14" height="12" fill="#4E6E80"/>' +
      '<rect x="708" y="638" width="14" height="12" fill="#4E6E80"/>' +
      '<rect x="742" y="612" width="16" height="22" fill="' + P.terracotta + '"/></g>' +
      A.boat(1180, 700, 1, '#3B2A22', '#FFF6E4')
    )});
    L.push({ depth: 0.85, svg: wrapRoom(ROOM_W, ROOM_H,
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
    L.push({ depth: 1.3, svg: wrapRoom(ROOM_W, ROOM_H,
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
    L.push({ depth: 0.14, svg: wrapRoom(ROOM_W, ROOM_H,
      skyGrad(ROOM_W, ROOM_H, [[0, '#3D4A6B'], [0.38, '#8A6E80'], [0.68, '#D89A72'], [1, '#F6D4A6']], 640) +
      stars(ROOM_W, 340, 40, 139) +
      A.sun(1240, 600, 40, '#FFEBC6', '#EFA469')
    )});
    L.push({ depth: 0.3, svg: wrapRoom(ROOM_W, ROOM_H,
      '<path d="' + A.ridge(ROOM_W, ROOM_H, { baseline: 620, amp: 260, peaks: 7, seed: 141 }) + '" fill="#4E5570"/>' +
      A.water(0, 616, ROOM_W, 150, '#5A7480', '#33475A', 143, '#FFD9A8')
    )});
    L.push({ depth: 0.5, svg: wrapRoom(ROOM_W, ROOM_H,
      /* an avenue of cypresses leading to the gate */
      (function () {
        var g = '<path d="M -20 780 Q 800 730 1620 780 L 1620 920 L -20 920 Z" fill="#6E7A5C"/>';
        var pairs = [[250, 190], [420, 220], [1180, 210], [1360, 180]];
        for (var i = 0; i < pairs.length; i++) g += A.cypress(pairs[i][0], 790, pairs[i][1], i % 2 ? '#33422C' : '#3C4C33');
        return g;
      })()
    )});
    L.push({ depth: 0.85, svg: wrapRoom(ROOM_W, ROOM_H,
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
        /* --- the reply going in ----------------------------------------
           This is where the guestbook table with its three candles used to
           stand. It has gone, and so has the quill: a table and a book are a
           still life, and this doorway is the one that asks the guest to do
           something. What is here instead is the one action the whole page
           is about — somebody standing at the mailbox with a letter half
           inside the slot.

           **The letter is genuinely half in.** It is drawn as two pieces
           either side of the mouth of the box: the part that is still in the
           daylight, held between finger and slot, and a sliver of the same
           envelope showing dark through the opening. Drawing one whole
           envelope floating near the box was the first attempt and it read
           as a letter being *shown to* a mailbox.

           **What moves, and how little.** The mailbox itself is still. The
           figure breathes on `ww-idle`, and their posting arm turns about
           its own shoulder on `ww-post`, seven seconds a cycle — a slow push
           of about four degrees, so the envelope travels roughly two units
           further in and comes back. That is the whole animation. The brief
           asked for charming rather than busy, and a hand that shoves a
           letter in and out of a slot on a fast loop is neither.
           The envelope is inside the arm's own group, so it goes with the
           hand instead of having to be animated in step with it — which is
           the same reason props are drawn at the hand everywhere else. */
        /* **The arithmetic, because the envelope is drawn outside the
           figure and every number below depends on the others.** The guest
           stands at x=794 on ground y=770 and is 188 tall, in the `toast`
           pose, which puts the near shoulder at
             sx = 794 + .132*188 = 818.8      sy = 770 - .752*188 = 628.6
           and the hand at .135 / -.090 of a height beyond it:
             hx = 844.2                        hy = 611.7
           The mailbox stands at x=880 on ground 776 at scale 1.15, so its
           box runs x 848.9 … 911.0 and y 594.3 … 642.6, and its slot is the
           band y 609.3 … 615.5. The envelope is 34 long and 24 tall — a hair
           under an eighth of the figure's height, which is about what an
           envelope is — so it runs 835.8 … 869.9: fifteen units of it out in
           the daylight, nineteen of it inside the box.
           **Move any one of those numbers and you have to redo the rest**,
           or the letter goes into the side of the box or floats in front of
           it. The first attempt put the hand exactly on the lip of the slot,
           which is where a hand actually goes — and left barely a corner of
           the envelope showing. It has to stand off a little for the letter
           to be legible as a letter.
           `straight: true` turns off the random lean and shoulder tilt that
           every other figure gets, because the envelope is positioned from
           the numbers above rather than by person() — with the wonkiness on,
           the hand lands up to three units from where the letter was drawn. */
        var mbX = 880, mbBase = 776, mbS = 1.15;
        var shX = 818.8, shY = 628.6, hX = 844.2, hY = 611.7;
        var boxL = 848.9, slotT = 609.3, slotB = 615.5;
        g += A.mailbox(mbX, mbBase, mbS);
        /* --- the envelope, cut off at the mouth of the slot -------------
           The clip is two rectangles: everything to the left of the slot's
           lip, plus the slot band itself. So the envelope is drawn whole,
           and what you see is all of it up to the box and then only the
           sliver of it that is inside the opening — which is what a letter
           halfway into a mailbox looks like, and is a great deal more
           convincing than an envelope drawn near a mailbox.
           It carries the same `ww-post` class, origin and delay as the arm
           that is holding it, so the two move as one thing. */
        var clipId = A.uid('post');
        g += '<defs><clipPath id="' + clipId + '">' +
          /* out to the near edge of the box, the envelope entire */
          '<rect x="700" y="540" width="' + f(boxL + 2 - 700) + '" height="180"/>' +
          /* past it, only the height of the slot: the part that is in */
          '<rect x="' + f(boxL + 2) + '" y="' + f(slotT) + '" width="60" height="' + f(slotB - slotT) + '"/>' +
          '</clipPath></defs>';
        g += '<g clip-path="url(#' + clipId + ')">' +
          '<g class="ww-post" style="transform-box:view-box;transform-origin:' + f(shX) + 'px ' + f(shY) + 'px;animation-delay:-0.4s">' +
          A.prop('letter', hX, hY - 3.4, 188 * 0.0165, 'flat') +
          '</g></g>';
        /* The guest is drawn **after** the envelope, so the hand closes over
           the near end of it. The other way round the envelope covered the
           fist, and a letter that hides the hand holding it reads as a card
           propped against a box rather than as one being posted. */
        g += A.person({
          x: 794, baseY: 770, h: 188, pose: 'toast', seed: 617, straight: true,
          cloth: '#7A97A8', pants: '#3B4A5A', hairStyle: 'wave', hair: '#4A3526',
          anim: false,
          armAnim: 'ww-post', armDelay: -0.4,
          headAnim: 'ww-nod-slow', headDelay: -2.2
        });
        return g;
      })() + '</g>'
    )});
    L.push({ depth: 1.3, svg: wrapRoom(ROOM_W, ROOM_H,
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
