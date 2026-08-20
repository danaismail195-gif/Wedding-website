/* ==========================================================================
   art.js — the illustrated world, drawn in code
   --------------------------------------------------------------------------
   Every scene is built from layered SVG. Each layer is returned with a
   `depth` value, which is how fast it travels when the camera moves:
       0.05 = far away (barely moves)     1.0 = the ground you stand on
       1.25 = foreground (rushes past)
   That difference in speed is the whole parallax illusion.

   Swapping in hand-drawn artwork later: replace a layer's `svg` with
   `<img src="...">` at the same viewBox proportions. Nothing else changes.
   ========================================================================== */
(function (global) {
  'use strict';

  /* --- shared palette: Adriatic / Montenegro --------------------------- */
  var P = {
    cream:      '#F4E7D3',
    creamDeep:  '#E8D3B4',
    terracotta: '#C4643C',
    terraDeep:  '#9B4A2A',
    terraLight: '#D98A5E',
    espresso:   '#3B2A22',
    espLight:   '#5C4436',
    olive:      '#7C8B5E',
    oliveDeep:  '#5B6A44',
    oliveLight: '#9BA87C',
    dusty:      '#7A97A8',
    dustyDeep:  '#4E6E80',
    bay:        '#2E5A63',
    turquoise:  '#4FA3A5',
    gold:       '#E4A853',
    goldLight:  '#F5D08A',
    stone:      '#E3D6C0',
    stoneDeep:  '#C9B79B',
    night:      '#1E2A3A',
    nightDeep:  '#141C28',
    plum:       '#5A4260'
  };

  var _uid = 0;
  function uid(p) { return (p || 'a') + (++_uid); }
  function f(n) { return Math.round(n * 10) / 10; }

  /* Deterministic pseudo-random, so the world looks identical every visit. */
  function rand(seed) {
    var s = (seed || 1) >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function svgWrap(w, h, inner, extra) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" ' +
      'xmlns="http://www.w3.org/2000/svg" ' + (extra || '') + '>' + inner + '</svg>';
  }

  /* ======================================================================
     PRIMITIVES — the vocabulary every scene is drawn with
     ====================================================================== */

  /* Jagged limestone ridge, the signature shape of the Bay of Kotor. */
  function ridge(w, h, opts) {
    var o = opts || {};
    var baseline = o.baseline != null ? o.baseline : h * 0.55;
    var amp = o.amp != null ? o.amp : 180;
    var peaks = o.peaks || 9;
    var r = rand(o.seed || 7);
    var step = w / peaks;
    var pts = [];
    for (var i = 0; i <= peaks; i++) {
      var wobble = 0.55 + 0.45 * r();
      var shape = 0.65 + 0.35 * Math.sin(i * 1.31 + (o.phase || 0));
      pts.push([i * step, baseline - amp * wobble * shape]);
    }
    var d = 'M -80 ' + f(h + 40) + ' L -80 ' + f(pts[0][1] + amp * 0.15);
    for (var j = 0; j < pts.length - 1; j++) {
      var a = pts[j], b = pts[j + 1];
      var mx = (a[0] + b[0]) / 2 + (r() - 0.5) * step * 0.35;
      var my = Math.max(a[1], b[1]) + r() * amp * 0.3 + 6;
      d += ' L ' + f(a[0]) + ' ' + f(a[1]) + ' L ' + f(mx) + ' ' + f(my);
    }
    d += ' L ' + f(pts[pts.length - 1][0]) + ' ' + f(pts[pts.length - 1][1]);
    d += ' L ' + f(w + 80) + ' ' + f(h + 40) + ' Z';
    return d;
  }

  /* A cluster of stone houses with terracotta roofs. */
  function houses(x, baseY, count, s, seed, pal) {
    pal = pal || {};
    var wall = pal.wall || P.stone,
        wallShade = pal.wallShade || P.stoneDeep,
        roof = pal.roof || P.terracotta,
        roofShade = pal.roofShade || P.terraDeep,
        win = pal.window || 'rgba(59,42,34,.55)';
    var r = rand(seed), g = '', cx = x;
    for (var i = 0; i < count; i++) {
      var w = (52 + r() * 58) * s;
      var h = (62 + r() * 85) * s;
      var top = baseY - h;
      g += '<rect x="' + f(cx) + '" y="' + f(top) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + wall + '"/>';
      g += '<rect x="' + f(cx + w * 0.72) + '" y="' + f(top) + '" width="' + f(w * 0.28) + '" height="' + f(h) + '" fill="' + wallShade + '" opacity=".5"/>';
      var oh = 5 * s, rh = 10 * s;
      g += '<polygon points="' + f(cx - oh) + ',' + f(top) + ' ' + f(cx + w + oh) + ',' + f(top) +
           ' ' + f(cx + w + oh - 5 * s) + ',' + f(top - rh) + ' ' + f(cx - oh + 5 * s) + ',' + f(top - rh) + '" fill="' + roof + '"/>';
      g += '<rect x="' + f(cx - oh) + '" y="' + f(top - 1) + '" width="' + f(w + oh * 2) + '" height="' + f(2.5 * s) + '" fill="' + roofShade + '" opacity=".7"/>';
      /* windows */
      var cols = Math.max(1, Math.round(w / (26 * s)));
      var rows = Math.max(1, Math.round(h / (34 * s)));
      for (var cyi = 0; cyi < rows; cyi++) {
        for (var cxi = 0; cxi < cols; cxi++) {
          if (r() < 0.22) continue;
          var ww = 7.5 * s, wh = 11 * s;
          var wx = cx + (w / cols) * (cxi + 0.5) - ww / 2;
          var wy = top + (h / rows) * (cyi + 0.55) - wh / 2;
          g += '<rect x="' + f(wx) + '" y="' + f(wy) + '" width="' + f(ww) + '" height="' + f(wh) + '" rx="' + f(1.2 * s) + '" fill="' + win + '"/>';
        }
      }
      cx += w * (0.80 + r() * 0.26);
    }
    return g;
  }

  /* Venetian bell tower — every town on the bay has one. */
  function campanile(x, baseY, h, s, pal) {
    pal = pal || {};
    var wall = pal.wall || P.stone, roof = pal.roof || P.terracotta;
    var w = 26 * s, top = baseY - h;
    var g = '<rect x="' + f(x) + '" y="' + f(top) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + wall + '"/>';
    g += '<path d="M ' + f(x + w * 0.25) + ' ' + f(top + h * 0.18) + ' a ' + f(w * 0.25) + ' ' + f(w * 0.25) + ' 0 0 1 ' + f(w * 0.5) + ' 0 L ' + f(x + w * 0.75) + ' ' + f(top + h * 0.42) + ' l -' + f(w * 0.5) + ' 0 Z" fill="rgba(59,42,34,.5)"/>';
    g += '<polygon points="' + f(x - 4 * s) + ',' + f(top) + ' ' + f(x + w + 4 * s) + ',' + f(top) + ' ' + f(x + w / 2) + ',' + f(top - 26 * s) + '" fill="' + roof + '"/>';
    return g;
  }

  /* Cypress — the exclamation marks of the Adriatic skyline. */
  function cypress(x, baseY, h, fill, cls) {
    var wq = h * 0.155;
    var d = 'M ' + f(x) + ' ' + f(baseY) +
      ' C ' + f(x - wq) + ' ' + f(baseY - h * 0.34) + ', ' + f(x - wq * 0.82) + ' ' + f(baseY - h * 0.78) + ', ' + f(x) + ' ' + f(baseY - h) +
      ' C ' + f(x + wq * 0.82) + ' ' + f(baseY - h * 0.78) + ', ' + f(x + wq) + ' ' + f(baseY - h * 0.34) + ', ' + f(x) + ' ' + f(baseY) + ' Z';
    return '<g class="' + (cls || '') + '" style="transform-origin:' + f(x) + 'px ' + f(baseY) + 'px">' +
      '<rect x="' + f(x - h * 0.012) + '" y="' + f(baseY - h * 0.1) + '" width="' + f(h * 0.024) + '" height="' + f(h * 0.1) + '" fill="' + P.espLight + '" opacity=".7"/>' +
      '<path d="' + d + '" fill="' + fill + '"/></g>';
  }

  /* Olive tree — silver-green, gnarled, always a bit lopsided. */
  function olive(x, baseY, s, pal, seed) {
    pal = pal || {};
    var leaf = pal.leaf || P.olive, leaf2 = pal.leaf2 || P.oliveLight, bark = pal.bark || '#6B5744';
    var r = rand(seed || 3), g = '';
    g += '<path d="M ' + f(x - 4 * s) + ' ' + f(baseY) + ' q ' + f(2 * s) + ' -' + f(28 * s) + ' -' + f(2 * s) + ' -' + f(46 * s) +
         ' l ' + f(9 * s) + ' 0 q -' + f(3 * s) + ' ' + f(20 * s) + ' ' + f(4 * s) + ' ' + f(46 * s) + ' Z" fill="' + bark + '"/>';
    var blobs = 5;
    for (var i = 0; i < blobs; i++) {
      var bx = x + (r() - 0.5) * 62 * s;
      var by = baseY - (48 + r() * 34) * s;
      var rx = (26 + r() * 17) * s, ry = (17 + r() * 11) * s;
      g += '<ellipse cx="' + f(bx) + '" cy="' + f(by) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + (i % 2 ? leaf2 : leaf) + '" opacity="' + (0.82 + r() * 0.18).toFixed(2) + '"/>';
    }
    return '<g class="ww-sway" style="transform-origin:' + f(x) + 'px ' + f(baseY) + 'px;animation-delay:' + (-r() * 6).toFixed(1) + 's">' + g + '</g>';
  }

  /* Water: flat colour plus drifting glints. */
  function water(x, y, w, h, top, bottom, glintSeed, glintColor) {
    var id = uid('wat');
    var g = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/></linearGradient></defs>';
    g += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#' + id + ')"/>';
    var r = rand(glintSeed || 11), gl = '';
    for (var i = 0; i < Math.round(w / 26); i++) {
      var gx = x + r() * w;
      var gy = y + Math.pow(r(), 1.7) * h;
      var gw = 10 + r() * 46;
      gl += '<rect class="ww-shimmer" x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(gw) + '" height="' + f(1.6 + r() * 1.8) +
            '" rx="1" fill="' + (glintColor || '#FFFFFF') + '" opacity="' + (0.06 + r() * 0.22).toFixed(2) +
            '" style="animation-delay:' + (-r() * 7).toFixed(1) + 's"/>';
    }
    return g + gl;
  }

  /* Sun or moon, with a soft halo. */
  function sun(cx, cy, r0, core, halo) {
    var id = uid('sun');
    return '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="' + halo + '" stop-opacity=".85"/>' +
      '<stop offset="1" stop-color="' + halo + '" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r0 * 5.2) + '" fill="url(#' + id + ')"/>' +
      '<circle class="ww-pulse" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r0) + '" fill="' + core + '"/>';
  }

  function clouds(w, h, seed, color, opacity, yBand) {
    var r = rand(seed || 5), g = '';
    var n = Math.round(w / 420);
    for (var i = 0; i < n; i++) {
      var cx = r() * w, cy = (yBand ? yBand[0] : 60) + r() * ((yBand ? yBand[1] : h * 0.3) - (yBand ? yBand[0] : 60));
      var s = 0.6 + r() * 1.1, puffs = 4 + Math.round(r() * 3), c = '';
      for (var j = 0; j < puffs; j++) {
        c += '<ellipse cx="' + f(cx + (j - puffs / 2) * 44 * s + r() * 18) + '" cy="' + f(cy + (r() - 0.5) * 16 * s) +
             '" rx="' + f((36 + r() * 34) * s) + '" ry="' + f((15 + r() * 11) * s) + '" fill="' + color + '"/>';
      }
      g += '<g class="ww-drift" style="animation-duration:' + f(70 + r() * 90) + 's;animation-delay:' + f(-r() * 90) + 's" opacity="' + (opacity * (0.6 + r() * 0.4)).toFixed(2) + '">' + c + '</g>';
    }
    return g;
  }

  function birds(x, y, s, count, seed, color) {
    var r = rand(seed || 9), g = '';
    for (var i = 0; i < (count || 5); i++) {
      var bx = x + r() * 260 * s, by = y + r() * 90 * s, bs = (0.7 + r() * 0.6) * s;
      g += '<path class="ww-flap" d="M ' + f(bx) + ' ' + f(by) + ' q ' + f(6 * bs) + ' -' + f(5 * bs) + ' ' + f(12 * bs) + ' 0 M ' +
           f(bx + 12 * bs) + ' ' + f(by) + ' q ' + f(6 * bs) + ' -' + f(5 * bs) + ' ' + f(12 * bs) + ' 0" ' +
           'fill="none" stroke="' + (color || 'rgba(59,42,34,.5)') + '" stroke-width="' + f(1.6 * bs) + '" stroke-linecap="round" ' +
           'style="animation-delay:' + (-r() * 3).toFixed(1) + 's"/>';
    }
    return '<g class="ww-fly" style="animation-delay:' + (-r() * 30).toFixed(1) + 's">' + g + '</g>';
  }

  /* Hanging lantern with a living flame. */
  function lantern(x, y, s, cordTo) {
    var id = uid('lan');
    var g = '<line x1="' + f(x) + '" y1="' + f(cordTo != null ? cordTo : y - 46 * s) + '" x2="' + f(x) + '" y2="' + f(y - 12 * s) + '" stroke="rgba(59,42,34,.55)" stroke-width="' + f(1.4 * s) + '"/>';
    g += '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="' + P.goldLight + '" stop-opacity=".95"/>' +
      '<stop offset=".45" stop-color="' + P.gold + '" stop-opacity=".45"/><stop offset="1" stop-color="' + P.gold + '" stop-opacity="0"/></radialGradient></defs>';
    g += '<circle class="ww-flicker" cx="' + f(x) + '" cy="' + f(y + 4 * s) + '" r="' + f(30 * s) + '" fill="url(#' + id + ')"/>';
    g += '<path d="M ' + f(x - 7 * s) + ' ' + f(y - 10 * s) + ' l ' + f(14 * s) + ' 0 l ' + f(2.5 * s) + ' ' + f(21 * s) + ' l -' + f(19 * s) + ' 0 Z" fill="rgba(59,42,34,.72)"/>';
    g += '<path d="M ' + f(x - 4.5 * s) + ' ' + f(y - 7 * s) + ' l ' + f(9 * s) + ' 0 l ' + f(1.6 * s) + ' ' + f(15 * s) + ' l -' + f(12 * s) + ' 0 Z" fill="' + P.goldLight + '" class="ww-flicker"/>';
    return '<g class="ww-swing" style="transform-origin:' + f(x) + 'px ' + f(cordTo != null ? cordTo : y - 46 * s) + 'px">' + g + '</g>';
  }

  /* A sagging run of festoon bulbs. */
  function stringLights(x1, y1, x2, y2, sag, n, seed) {
    var r = rand(seed || 13);
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
    var g = '<path d="M ' + f(x1) + ' ' + f(y1) + ' Q ' + f(mx) + ' ' + f(my) + ' ' + f(x2) + ' ' + f(y2) + '" fill="none" stroke="rgba(59,42,34,.45)" stroke-width="1.6"/>';
    for (var i = 1; i < n; i++) {
      var t = i / n;
      var bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
      var by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
      g += '<line x1="' + f(bx) + '" y1="' + f(by) + '" x2="' + f(bx) + '" y2="' + f(by + 7) + '" stroke="rgba(59,42,34,.4)" stroke-width="1.2"/>';
      g += '<circle class="ww-twinkle" cx="' + f(bx) + '" cy="' + f(by + 11) + '" r="3.6" fill="' + P.goldLight + '" style="animation-delay:' + (-r() * 4).toFixed(2) + 's"/>';
      g += '<circle class="ww-twinkle" cx="' + f(bx) + '" cy="' + f(by + 11) + '" r="9" fill="' + P.gold + '" opacity=".28" style="animation-delay:' + (-r() * 4).toFixed(2) + 's"/>';
    }
    return g;
  }

  /* Dry-stone wall / terrace edge. */
  function stoneWall(x, y, w, h, seed, fill, mortar) {
    var r = rand(seed || 17);
    var g = '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + (fill || P.stoneDeep) + '"/>';
    var rows = Math.max(2, Math.round(h / 16));
    for (var i = 0; i < rows; i++) {
      var ry = y + (h / rows) * i;
      g += '<line x1="' + f(x) + '" y1="' + f(ry) + '" x2="' + f(x + w) + '" y2="' + f(ry) + '" stroke="' + (mortar || 'rgba(59,42,34,.14)') + '" stroke-width="1.1"/>';
      var cxp = x + r() * 40;
      while (cxp < x + w) {
        g += '<line x1="' + f(cxp) + '" y1="' + f(ry) + '" x2="' + f(cxp) + '" y2="' + f(ry + h / rows) + '" stroke="' + (mortar || 'rgba(59,42,34,.14)') + '" stroke-width="1.1"/>';
        cxp += 24 + r() * 42;
      }
    }
    return g;
  }

  /* Little boat on the bay. */
  function boat(x, y, s, hull, sail) {
    return '<g class="ww-bob" style="transform-origin:' + f(x) + 'px ' + f(y) + 'px;animation-delay:' + f(-x % 5) + 's">' +
      (sail ? '<path d="M ' + f(x) + ' ' + f(y - 2 * s) + ' L ' + f(x) + ' ' + f(y - 30 * s) + ' L ' + f(x + 17 * s) + ' ' + f(y - 3 * s) + ' Z" fill="' + sail + '"/>' : '') +
      '<path d="M ' + f(x - 16 * s) + ' ' + f(y) + ' q ' + f(16 * s) + ' ' + f(9 * s) + ' ' + f(34 * s) + ' 0 Z" fill="' + (hull || P.espresso) + '"/></g>';
  }

  function grassTufts(x, y, w, n, seed, color) {
    var r = rand(seed || 23), g = '';
    for (var i = 0; i < n; i++) {
      var gx = x + r() * w, hgt = 8 + r() * 16;
      g += '<path class="ww-sway" style="transform-origin:' + f(gx) + 'px ' + f(y) + 'px;animation-delay:' + (-r() * 5).toFixed(1) + 's" d="M ' + f(gx) + ' ' + f(y) +
           ' q ' + f((r() - 0.5) * 10) + ' -' + f(hgt * 0.6) + ' ' + f((r() - 0.5) * 14) + ' -' + f(hgt) + '" fill="none" stroke="' + (color || P.oliveDeep) + '" stroke-width="1.7" stroke-linecap="round"/>';
    }
    return g;
  }

  /* Framing olive branch that hangs into the top of the frame. */
  function branch(x, y, s, flip, pal, seed) {
    pal = pal || {};
    var leaf = pal.leaf || P.oliveDeep, leaf2 = pal.leaf2 || P.olive;
    var r = rand(seed || 29), g = '';
    var dir = flip ? -1 : 1;
    var d = 'M ' + f(x) + ' ' + f(y) + ' q ' + f(dir * 130 * s) + ' ' + f(64 * s) + ' ' + f(dir * 300 * s) + ' ' + f(52 * s);
    g += '<path d="' + d + '" fill="none" stroke="#6B5744" stroke-width="' + f(7 * s) + '" stroke-linecap="round"/>';
    for (var i = 0; i < 26; i++) {
      var t = 0.08 + (i / 26) * 0.92;
      var lx = x + dir * (2 * (1 - t) * t * 130 + t * t * 300) * s;
      var ly = y + (2 * (1 - t) * t * 64 + t * t * 52) * s;
      var ang = (r() * 360) | 0;
      g += '<ellipse cx="' + f(lx) + '" cy="' + f(ly + (r() - 0.5) * 26 * s) + '" rx="' + f((16 + r() * 9) * s) + '" ry="' + f((5 + r() * 2.6) * s) +
           '" fill="' + (i % 3 ? leaf : leaf2) + '" transform="rotate(' + ang + ' ' + f(lx) + ' ' + f(ly) + ')" opacity=".93"/>';
    }
    return '<g class="ww-sway-slow" style="transform-origin:' + f(x) + 'px ' + f(y) + 'px">' + g + '</g>';
  }

  /* Dancing silhouettes, for the after-party. */
  function dancer(x, baseY, h, color, delay) {
    var s = h / 100;
    var g = '<circle cx="' + f(x) + '" cy="' + f(baseY - h * 0.88) + '" r="' + f(8 * s) + '" fill="' + color + '"/>' +
      '<path d="M ' + f(x) + ' ' + f(baseY - h * 0.8) + ' q ' + f(11 * s) + ' ' + f(22 * s) + ' ' + f(4 * s) + ' ' + f(44 * s) +
      ' l -' + f(9 * s) + ' 0 q -' + f(7 * s) + ' -' + f(22 * s) + ' ' + f(5 * s) + ' -' + f(44 * s) + ' Z" fill="' + color + '"/>' +
      '<path d="M ' + f(x - 2 * s) + ' ' + f(baseY - h * 0.36) + ' l -' + f(7 * s) + ' ' + f(36 * s) + ' l ' + f(6 * s) + ' 0 l ' + f(7 * s) + ' -' + f(30 * s) +
      ' l ' + f(6 * s) + ' ' + f(30 * s) + ' l ' + f(6 * s) + ' 0 l -' + f(5 * s) + ' -' + f(36 * s) + ' Z" fill="' + color + '"/>' +
      '<path d="M ' + f(x - 1 * s) + ' ' + f(baseY - h * 0.74) + ' l -' + f(20 * s) + ' -' + f(16 * s) + ' l ' + f(4 * s) + ' -' + f(5 * s) + ' l ' + f(19 * s) + ' ' + f(13 * s) + ' Z" fill="' + color + '"/>' +
      '<path d="M ' + f(x + 3 * s) + ' ' + f(baseY - h * 0.74) + ' l ' + f(21 * s) + ' -' + f(11 * s) + ' l ' + f(3 * s) + ' ' + f(6 * s) + ' l -' + f(20 * s) + ' ' + f(9 * s) + ' Z" fill="' + color + '"/>';
    return '<g class="ww-dance" style="transform-origin:' + f(x) + 'px ' + f(baseY) + 'px;animation-delay:' + (delay || 0) + 's">' + g + '</g>';
  }

  global.WW = global.WW || {};
  global.WW.art = {
    P: P, uid: uid, f: f, rand: rand, svgWrap: svgWrap,
    ridge: ridge, houses: houses, campanile: campanile, cypress: cypress, olive: olive,
    water: water, sun: sun, clouds: clouds, birds: birds, lantern: lantern,
    stringLights: stringLights, stoneWall: stoneWall, boat: boat, grassTufts: grassTufts,
    branch: branch, dancer: dancer
  };
})(window);
