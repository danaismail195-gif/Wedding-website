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
    return '<g class="' + (cls || '') + '" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(baseY) + 'px">' +
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
    return '<g class="ww-sway" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(baseY) + 'px;animation-delay:' + (-r() * 6).toFixed(1) + 's">' + g + '</g>';
  }

  /* Water: flat colour plus drifting glints. */
  function water(x, y, w, h, top, bottom, glintSeed, glintColor) {
    var id = uid('wat');
    var g = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/></linearGradient></defs>';
    g += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="url(#' + id + ')"/>';
    var r = rand(glintSeed || 11), gl = '';
    var n = Math.round(w / 40);
    for (var i = 0; i < n; i++) {
      var gx = x + r() * w;
      var gy = y + Math.pow(r(), 1.7) * h;
      var gw = 10 + r() * 46;
      var lively = i % 3 !== 0;                 // most of them just sit there
      gl += '<rect' + (lively ? ' class="ww-shimmer"' : '') +
            ' x="' + f(gx) + '" y="' + f(gy) + '" width="' + f(gw) + '" height="' + f(1.6 + r() * 1.8) +
            '" rx="1" fill="' + (glintColor || '#FFFFFF') + '" opacity="' + (0.06 + r() * 0.22).toFixed(2) +
            '"' + (lively ? ' style="animation-delay:' + (-r() * 9).toFixed(1) + 's"' : '') + '/>';
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
    return '<g class="ww-swing" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(cordTo != null ? cordTo : y - 46 * s) + 'px">' + g + '</g>';
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
    return '<g class="ww-bob" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(y) + 'px;animation-delay:' + f(-x % 5) + 's">' +
      (sail ? '<path d="M ' + f(x) + ' ' + f(y - 2 * s) + ' L ' + f(x) + ' ' + f(y - 30 * s) + ' L ' + f(x + 17 * s) + ' ' + f(y - 3 * s) + ' Z" fill="' + sail + '"/>' : '') +
      '<path d="M ' + f(x - 16 * s) + ' ' + f(y) + ' q ' + f(16 * s) + ' ' + f(9 * s) + ' ' + f(34 * s) + ' 0 Z" fill="' + (hull || P.espresso) + '"/></g>';
  }

  function grassTufts(x, y, w, n, seed, color) {
    var r = rand(seed || 23), g = '';
    for (var i = 0; i < n; i++) {
      var gx = x + r() * w, hgt = 8 + r() * 16;
      /* only some of the grass moves — nobody counts, and the layer repaints
         a third as often */
      var sway = i % 3 === 0;
      g += '<path' + (sway ? ' class="ww-sway"' : '') + ' style="transform-box:view-box;transform-origin:' + f(gx) + 'px ' + f(y) + 'px;animation-delay:' + (-r() * 5).toFixed(1) + 's" d="M ' + f(gx) + ' ' + f(y) +
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
    return '<g class="ww-sway-slow" style="transform-box:view-box;transform-origin:' + f(x) + 'px ' + f(y) + 'px">' + g + '</g>';
  }

  /* ======================================================================
     PEOPLE — flat vector figures, in the spirit of the reference artwork:
     solid colour with no outlines, chunky rounded limbs, generous hair,
     the smallest possible face. Deliberately a bit wonky, but properly
     built: every limb is a round-capped polyline that STARTS at the
     shoulder or hip it belongs to, so an arm can never float free of its
     body. Poses are fractions of the figure's height, which keeps the
     proportions honest at any scale — a 96-tall guest in a chair is put
     together exactly like a 300-tall one at the table.
     ====================================================================== */

  var SKINS   = ['#F2C79E', '#E6B183', '#CE8F60', '#A97148', '#835434', '#63401F'];
  var CLOTHES = ['#C4643C', '#7A97A8', '#7C8B5E', '#E4A853', '#9B4A2A', '#5A4260',
                 '#4E6E80', '#7E9E8E', '#F2E4CC', '#3B5068', '#B8574B', '#6E8C6A',
                 '#C98A9B', '#D9B45C'];
  var PANTS   = ['#3B4A5A', '#5C4436', '#4E6E80', '#7C8B5E', '#9B4A2A', '#2A2430',
                 '#6B5744', '#5A4260', '#8A6A46'];
  var HAIRS   = ['#3B2A22', '#241A16', '#5C4436', '#6B5744', '#2A2430', '#8A6A46',
                 '#B08A55', '#A85331', '#D9B071', '#4A3B52'];
  var HAIR_STYLES = ['crop', 'bob', 'long', 'bun', 'curls', 'pony', 'wave', 'part'];

  /* round-capped, round-joined polyline — the only way limbs are drawn */
  function limbPath(pts, w, color, extra) {
    var d = 'M ' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (var i = 1; i < pts.length; i++) d += ' L ' + f(pts[i][0]) + ' ' + f(pts[i][1]);
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + f(w) +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }

  /* Pose tables. Every offset is a fraction of the figure's height, measured
     from the shoulder (arms) or the hip (legs). [elbow, hand] / [knee, foot].
     dir = +1 facing right. */
  var POSES = {
    stand:  { armNear: [[.045, .125], [.070, .255]], armFar: [[-.040, .125], [-.062, .250]],
              legNear: [[.022, .215], [.014, .455]], legFar: [[-.020, .215], [-.030, .455]] },
    chat:   { armNear: [[.080, .095], [.170, .020]], armFar: [[-.045, .120], [-.055, .245]],
              legNear: [[.030, .215], [.045, .455]], legFar: [[-.022, .215], [-.048, .455]] },
    listen: { armNear: [[.055, .130], [.115, .195]], armFar: [[-.050, .125], [-.070, .240]],
              legNear: [[.018, .215], [.010, .455]], legFar: [[-.024, .218], [-.044, .455]] },
    toast:  { armNear: [[.090, .050], [.135, -.090]], armFar: [[-.045, .125], [-.058, .248]],
              legNear: [[.024, .215], [.018, .455]], legFar: [[-.022, .215], [-.036, .455]] },
    laugh:  { armNear: [[.075, .105], [.055, .010]], armFar: [[-.075, .105], [-.140, .150]],
              legNear: [[.030, .215], [.052, .455]], legFar: [[-.028, .215], [-.056, .455]] },
    photo:  { armNear: [[.105, .080], [.055, -.045]], armFar: [[-.100, .085], [-.050, -.045]],
              legNear: [[.026, .215], [.030, .455]], legFar: [[-.026, .215], [-.034, .455]] },
    wave:   { armNear: [[.085, .040], [.115, -.115]], armFar: [[-.042, .128], [-.055, .250]],
              legNear: [[.020, .215], [.012, .455]], legFar: [[-.022, .215], [-.034, .455]] },
    walk:   { armNear: [[.060, .120], [.030, .245]], armFar: [[-.055, .120], [-.020, .245]],
              legNear: [[.075, .200], [.130, .440]], legFar: [[-.055, .215], [-.105, .450]] },
    sit:    { armNear: [[.055, .105], [.150, .145]], armFar: [[-.045, .110], [.085, .150]],
              legNear: [[.130, .030], [.155, .255]], legFar: [[.112, .052], [.138, .258]] },
    /* drawn up to a table: legs straight down, where the tabletop hides them */
    table:  { armNear: [[.062, .100], [.140, .150]], armFar: [[-.058, .100], [-.120, .152]],
              legNear: [[.022, .140], [.032, .300]], legFar: [[-.022, .140], [-.032, .300]] },
    /* leaning in over the table, one hand up mid-sentence */
    tableUp:{ armNear: [[.080, .060], [.150, -.010]], armFar: [[-.058, .100], [-.120, .152]],
              legNear: [[.022, .140], [.032, .300]], legFar: [[-.022, .140], [-.032, .300]] },
    dance:  { armNear: [[.110, -.010], [.170, -.150]], armFar: [[-.115, .060], [-.205, .015]],
              legNear: [[.075, .200], [.120, .450]], legFar: [[-.080, .195], [-.135, .450]] },
    dance2: { armNear: [[.125, .045], [.215, -.035]], armFar: [[-.095, -.020], [-.140, -.160]],
              legNear: [[.055, .205], [.145, .450]], legFar: [[-.070, .215], [-.090, .450]] }
  };

  /* Small things people hold. Drawn at the hand, so they never drift off. */
  function prop(kind, hx, hy, s, tint) {
    if (kind === 'glass') {
      /* a proper stemmed glass: bowl, stem, foot — it reads as a glass even
         when the whole figure is 90px tall */
      return '<path d="M ' + f(hx - 3.4 * s) + ' ' + f(hy - 3.4 * s) +
        ' L ' + f(hx + 3.4 * s) + ' ' + f(hy - 3.4 * s) +
        ' Q ' + f(hx + 3.1 * s) + ' ' + f(hy + 2.2 * s) + ' ' + f(hx) + ' ' + f(hy + 2.6 * s) +
        ' Q ' + f(hx - 3.1 * s) + ' ' + f(hy + 2.2 * s) + ' ' + f(hx - 3.4 * s) + ' ' + f(hy - 3.4 * s) + ' Z" fill="#FBF4E8" opacity=".95"/>' +
        '<path d="M ' + f(hx - 3.15 * s) + ' ' + f(hy - 1.2 * s) +
        ' L ' + f(hx + 3.15 * s) + ' ' + f(hy - 1.2 * s) +
        ' Q ' + f(hx + 2.9 * s) + ' ' + f(hy + 2.0 * s) + ' ' + f(hx) + ' ' + f(hy + 2.4 * s) +
        ' Q ' + f(hx - 2.9 * s) + ' ' + f(hy + 2.0 * s) + ' ' + f(hx - 3.15 * s) + ' ' + f(hy - 1.2 * s) + ' Z" fill="' + (tint || '#E8B25E') + '" opacity=".9"/>' +
        '<rect x="' + f(hx - .55 * s) + '" y="' + f(hy + 2.4 * s) + '" width="' + f(1.1 * s) + '" height="' + f(3.4 * s) + '" fill="#FBF4E8" opacity=".9"/>' +
        '<ellipse cx="' + f(hx) + '" cy="' + f(hy + 6 * s) + '" rx="' + f(2.6 * s) + '" ry="' + f(.8 * s) + '" fill="#FBF4E8" opacity=".9"/>';
    }
    if (kind === 'camera') {
      return '<rect x="' + f(hx - 5.5 * s) + '" y="' + f(hy - 4 * s) + '" width="' + f(11 * s) + '" height="' + f(8 * s) +
        '" rx="' + f(1.6 * s) + '" fill="#3B2A22"/>' +
        '<circle cx="' + f(hx) + '" cy="' + f(hy) + '" r="' + f(2.6 * s) + '" fill="#7A97A8"/>' +
        '<circle class="ww-twinkle" cx="' + f(hx + 4 * s) + '" cy="' + f(hy - 3 * s) + '" r="' + f(1.2 * s) + '" fill="#FFF3D0"/>';
    }
    if (kind === 'phone') {
      return '<rect x="' + f(hx - 2.2 * s) + '" y="' + f(hy - 4.4 * s) + '" width="' + f(4.4 * s) + '" height="' + f(8.4 * s) +
        '" rx="' + f(1 * s) + '" fill="#3B2A22"/>' +
        '<rect x="' + f(hx - 1.5 * s) + '" y="' + f(hy - 3.6 * s) + '" width="' + f(3 * s) + '" height="' + f(6.6 * s) + '" fill="#9FC4CE"/>';
    }
    if (kind === 'plate') {
      return '<ellipse cx="' + f(hx) + '" cy="' + f(hy) + '" rx="' + f(6.5 * s) + '" ry="' + f(2.4 * s) + '" fill="#FFFAF0"/>';
    }
    if (kind === 'bouquet') {
      /* held low, the way people actually carry one: stems down through the
         fist, blooms above it */
      var bq = '<path d="M ' + f(hx - 1.4 * s) + ' ' + f(hy + 1 * s) + ' l ' + f(2.4 * s) + ' ' + f(6 * s) +
        '" stroke="#6E7F52" stroke-width="' + f(1.6 * s) + '" stroke-linecap="round" fill="none"/>';
      var petals = ['#F6E4D2', '#F0CBBC', '#FBF4E8', '#E8BCA8'];
      for (var bi = 0; bi < 5; bi++) {
        var ba = Math.PI * (0.86 + bi * 0.32);
        bq += '<ellipse cx="' + f(hx + Math.cos(ba) * 2.6 * s) + '" cy="' + f(hy - 1.2 * s + Math.sin(ba) * 2.2 * s) +
          '" rx="' + f(2.5 * s) + '" ry="' + f(2.1 * s) + '" fill="' + petals[bi % 4] + '"/>';
      }
      bq += '<ellipse cx="' + f(hx - 3.4 * s) + '" cy="' + f(hy + 0.6 * s) + '" rx="' + f(3 * s) + '" ry="' + f(1.3 * s) +
        '" fill="' + (tint || '#7C8B5E') + '" transform="rotate(-24 ' + f(hx - 3.4 * s) + ' ' + f(hy + 0.6 * s) + ')"/>';
      bq += '<ellipse cx="' + f(hx + 3.4 * s) + '" cy="' + f(hy + 1 * s) + '" rx="' + f(2.8 * s) + '" ry="' + f(1.2 * s) +
        '" fill="' + (tint || '#7C8B5E') + '" transform="rotate(26 ' + f(hx + 3.4 * s) + ' ' + f(hy + 1 * s) + ')"/>';
      return bq;
    }
    return '';
  }

  /* --- hair -------------------------------------------------------------
     Two pieces: what sits behind the head, and what sits over the brow.
     Drawing it in two halves is what stops a fringe ever coming apart from
     the skull when a figure is flipped or leaning. */
  /* Hair that falls past the jaw is drawn before the body, so it hangs
     behind the shoulders instead of lying across the chest like a bib. */
  function hairBehind(style, hx, hy, R, dir, hair) {
    if (style === 'long') {
      return '<path d="M ' + f(hx - R * 1.16) + ' ' + f(hy - R * 0.3) +
        ' q -' + f(R * 0.26) + ' ' + f(R * 1.8) + ' ' + f(R * 0.06) + ' ' + f(R * 2.36) +
        ' l ' + f(R * 2.28) + ' 0' +
        ' q ' + f(R * 0.32) + ' -' + f(R * 0.56) + ' ' + f(R * 0.06) + ' -' + f(R * 2.36) + ' Z" fill="' + hair + '"/>';
    }
    if (style === 'wave') {
      return '<path d="M ' + f(hx - R * 1.2) + ' ' + f(hy - R * 0.3) +
        ' q -' + f(R * 0.34) + ' ' + f(R * 1.5) + ' -' + f(R * 0.02) + ' ' + f(R * 2.1) +
        ' q ' + f(R * 0.42) + ' -' + f(R * 0.3) + ' ' + f(R * 0.66) + ' ' + f(R * 0.16) +
        ' q ' + f(R * 0.4) + ' ' + f(R * 0.28) + ' ' + f(R * 0.8) + ' -' + f(R * 0.1) +
        ' q ' + f(R * 0.4) + ' ' + f(R * 0.3) + ' ' + f(R * 0.72) + ' -' + f(R * 0.14) +
        ' q ' + f(R * 0.26) + ' -' + f(R * 1.1) + ' -' + f(R * 0.16) + ' -' + f(R * 1.96) + ' Z" fill="' + hair + '"/>';
    }
    if (style === 'pony') {
      return '<path d="M ' + f(hx - R * 0.9 * dir) + ' ' + f(hy - R * 0.5) +
        ' q -' + f(R * 1.1 * dir) + ' ' + f(R * 0.5) + ' -' + f(R * 0.86 * dir) + ' ' + f(R * 1.9) +
        ' q ' + f(R * 0.44 * dir) + ' ' + f(R * 0.2) + ' ' + f(R * 0.72 * dir) + ' -' + f(R * 0.22) +
        ' q -' + f(R * 0.16 * dir) + ' -' + f(R * 1.1) + ' ' + f(R * 0.5 * dir) + ' -' + f(R * 1.6) + ' Z" fill="' + hair + '"/>';
    }
    return '';
  }

  function hairBack(style, hx, hy, R, dir, hair) {
    var g = '';
    var cap = '<circle cx="' + f(hx) + '" cy="' + f(hy - R * 0.14) + '" r="' + f(R * 1.07) + '" fill="' + hair + '"/>';
    if (style === 'bob') {
      g += '<path d="M ' + f(hx - R * 1.14) + ' ' + f(hy - R * 0.3) +
        ' l 0 ' + f(R * 1.24) + ' q ' + f(R * 0.5) + ' ' + f(R * 0.3) + ' ' + f(R * 0.86) + ' ' + f(R * 0.06) +
        ' l ' + f(R * 0.84) + ' 0 q ' + f(R * 0.4) + ' ' + f(R * 0.24) + ' ' + f(R * 0.86) + ' -' + f(R * 0.06) +
        ' l 0 -' + f(R * 1.24) + ' Z" fill="' + hair + '"/>';
    } else if (style === 'curls') {
      for (var i = 0; i < 9; i++) {
        var a = Math.PI * (1.06 + i * (0.88 / 8));
        g += '<circle cx="' + f(hx + Math.cos(a) * R * 0.92) + '" cy="' + f(hy - R * 0.1 + Math.sin(a) * R * 0.92) +
          '" r="' + f(R * 0.54) + '" fill="' + hair + '"/>';
      }
    }
    g += cap;
    if (style === 'bun') {
      g += '<circle cx="' + f(hx - R * 1.0 * dir) + '" cy="' + f(hy - R * 0.86) + '" r="' + f(R * 0.5) + '" fill="' + hair + '"/>';
    }
    return g;
  }

  function hairFront(style, hx, hy, R, dir, hair) {
    if (style === 'curls') {
      return '<circle cx="' + f(hx - R * 0.42) + '" cy="' + f(hy - R * 0.72) + '" r="' + f(R * 0.46) + '" fill="' + hair + '"/>' +
             '<circle cx="' + f(hx + R * 0.44) + '" cy="' + f(hy - R * 0.76) + '" r="' + f(R * 0.42) + '" fill="' + hair + '"/>';
    }
    if (style === 'part') {
      /* swept to one side, off a parting */
      return '<path d="M ' + f(hx - R * 1.02) + ' ' + f(hy - R * 0.32) +
        ' q ' + f(R * 0.2) + ' -' + f(R * 0.86) + ' ' + f(R * 1.06) + ' -' + f(R * 0.82) +
        ' q ' + f(R * 0.9) + ' ' + f(R * 0.04) + ' ' + f(R * 1.0) + ' ' + f(R * 0.8) +
        ' q -' + f(R * 0.66) + ' -' + f(R * 0.44) + ' -' + f(R * 1.34) + ' -' + f(R * 0.1) +
        ' q -' + f(R * 0.4) + ' ' + f(R * 0.26) + ' -' + f(R * 0.72) + ' ' + f(R * 0.44) + ' Z" fill="' + hair + '"/>';
    }
    /* the ordinary fringe, sitting on the brow */
    return '<ellipse cx="' + f(hx + R * 0.06 * dir) + '" cy="' + f(hy - R * 0.62) +
      '" rx="' + f(R * 1.0) + '" ry="' + f(R * 0.46) + '" fill="' + hair + '"/>';
  }

  /**
   * person({ x, baseY, h, pose, flip, skin, cloth, pants, hair, hairStyle,
   *          dress, flat, back, hold, holdTint, holdFar, holdFarTint,
   *          anim, delay, seed, shadow })
   * `hold` goes in the near hand, `holdFar` in the hand on the far side —
   * which is how somebody can hold a bouquet and a hand at the same time.
   * baseY is the ground (or the seat front, for `sit` / `table`).
   * Returns one <g>, animated by the class in `anim`.
   */
  function person(o) {
    o = o || {};
    var x = o.x || 0, b = o.baseY || 0, h = o.h || 100;
    /* Scenes seed their guests from a counter (400, 411, 422 …). The plain
       linear generator turns neighbouring seeds into near-identical streams,
       which is how a whole row of chairs ended up dressed in the same colour.
       Scrambling the seed first — and only for people — gives every guest
       their own wardrobe without disturbing any other procedural artwork. */
    var seed0 = o.seed != null ? o.seed : (Math.abs(x * 31 + b * 17 + h) | 0) + 3;
    var r = rand((((seed0 + 1) * 2654435761) ^ 0x9E3779B9) >>> 0);
    var flat  = o.flat || null;
    var skin  = flat || o.skin  || SKINS[(r() * SKINS.length) | 0];
    var cloth = flat || o.cloth || CLOTHES[(r() * CLOTHES.length) | 0];
    var hair  = flat || o.hair  || HAIRS[(r() * HAIRS.length) | 0];
    var pants = flat || o.pants || PANTS[(r() * PANTS.length) | 0];
    var hairStyle = o.hairStyle || HAIR_STYLES[(r() * HAIR_STYLES.length) | 0];
    var shoe  = flat || '#3B2A22';
    var dir   = o.flip ? -1 : 1;
    var pose  = POSES[o.pose] || POSES.stand;
    var dress = o.dress != null ? o.dress : (r() < 0.45);
    var seated = o.pose === 'sit' || o.pose === 'table' || o.pose === 'tableUp';

    /* skeleton — a shade chunkier than life, which is what makes a flat
       figure read as drawn rather than as a stick */
    var headR = h * 0.112,
        headY = b - h * (seated ? 0.452 : 0.878),
        shY   = b - h * (seated ? 0.300 : 0.718),
        hipY  = b - h * (seated ? 0.020 : 0.452),
        shW   = h * 0.134,
        hipW  = h * 0.102,
        limbW = h * 0.084,
        handR = limbW * 0.46;

    /* a little wonkiness, so no two are quite the same */
    var lean = (r() - 0.5) * 2.2;
    var shTilt = (r() - 0.5) * h * 0.012;

    function pts(list, ox, oy) {
      var out = [[ox, oy]];
      for (var i = 0; i < list.length; i++) {
        out.push([ox + list[i][0] * h * dir, oy + list[i][1] * h]);
      }
      return out;
    }

    var shL = [x - shW * dir, shY + shTilt],     // far shoulder
        shR = [x + shW * dir, shY - shTilt],     // near shoulder
        hpL = [x - hipW * dir, hipY],
        hpR = [x + hipW * dir, hipY];

    var armFar  = pts(pose.armFar,  shL[0], shL[1]);
    var armNear = pts(pose.armNear, shR[0], shR[1]);
    var legFar  = pts(pose.legFar,  hpL[0], hpL[1]);
    var legNear = pts(pose.legNear, hpR[0], hpR[1]);

    var g = '';

    /* anything that falls past the jaw hangs behind the whole figure */
    if (!flat && !o.back) g += hairBehind(hairStyle, x + h * 0.010 * dir, headY, headR, dir, hair);

    /* the cloth that covers the shoulder joint, so an arm never looks
       pinned on: a sleeve down the first two thirds of the upper arm */
    function sleeve(arm, len) {
      return limbPath([arm[0], [arm[0][0] + (arm[1][0] - arm[0][0]) * (len || 0.8),
                                arm[0][1] + (arm[1][1] - arm[0][1]) * (len || 0.8)]],
        limbW * 1.02, flat || shade(cloth, -0.05));
    }
    function hand(arm, tone) {
      return '<circle cx="' + f(arm[2][0]) + '" cy="' + f(arm[2][1]) + '" r="' + f(handR) + '" fill="' + (flat || tone) + '"/>';
    }

    /* --- far arm and far leg go behind the body ---------------------- */
    g += limbPath(legFar, limbW, flat || (dress ? shade(skin, -0.14) : shade(pants, -0.14)));
    g += limbPath(armFar, limbW * 0.82, flat || shade(skin, -0.10));
    if (!flat) { g += sleeve(armFar); g += hand(armFar, shade(skin, -0.10)); }
    if (o.holdFar) g += prop(o.holdFar, armFar[2][0], armFar[2][1] - handR * 0.5, h * 0.012, o.holdFarTint);

    /* --- near leg ---------------------------------------------------- */
    g += limbPath(legNear, limbW, flat || (dress ? skin : pants));
    if (!flat) {
      g += '<ellipse cx="' + f(legFar[2][0] + limbW * 0.12 * dir) + '" cy="' + f(legFar[2][1] + limbW * 0.2) + '" rx="' + f(limbW * 0.72) + '" ry="' + f(limbW * 0.34) + '" fill="' + shade(shoe, 0.12) + '"/>';
      g += '<ellipse cx="' + f(legNear[2][0] + limbW * 0.12 * dir) + '" cy="' + f(legNear[2][1] + limbW * 0.2) + '" rx="' + f(limbW * 0.76) + '" ry="' + f(limbW * 0.36) + '" fill="' + shoe + '"/>';
    }

    /* --- neck, drawn first so the collar covers where it joins -------- */
    g += '<rect x="' + f(x - h * 0.022 + h * 0.006 * dir) + '" y="' + f(headY + headR * 0.42) +
      '" width="' + f(h * 0.044) + '" height="' + f(h * 0.105) + '" fill="' + (flat || shade(skin, -0.18)) + '"/>';

    /* --- torso: round shoulders, a little waist, a soft hem ---------- */
    var torso = 'M ' + f(x - shW) + ' ' + f(shY + h * 0.024) +
      ' C ' + f(x - shW) + ' ' + f(shY - h * 0.034) + ', ' + f(x - shW * 0.42) + ' ' + f(shY - h * 0.050) + ', ' + f(x) + ' ' + f(shY - h * 0.050) +
      ' C ' + f(x + shW * 0.42) + ' ' + f(shY - h * 0.050) + ', ' + f(x + shW) + ' ' + f(shY - h * 0.034) + ', ' + f(x + shW) + ' ' + f(shY + h * 0.024) +
      ' L ' + f(x + hipW) + ' ' + f(hipY) + ' Q ' + f(x) + ' ' + f(hipY + h * 0.028) + ' ' + f(x - hipW) + ' ' + f(hipY) + ' Z';
    g += '<path d="' + torso + '" fill="' + cloth + '"/>';
    if (!flat) {
      /* a wedge of shade down the shadowed edge, so the body reads as solid */
      g += '<path d="M ' + f(x + shW * 0.40 * dir) + ' ' + f(shY - h * 0.020) +
        ' L ' + f(x + shW * dir) + ' ' + f(shY + h * 0.024) +
        ' L ' + f(x + hipW * dir) + ' ' + f(hipY) +
        ' L ' + f(x + hipW * 0.40 * dir) + ' ' + f(hipY) + ' Z" fill="' + shade(cloth, -0.20) + '" opacity=".12"/>';
      /* the neckline — a soft curve of shade where the collar sits */
      g += '<path d="M ' + f(x - shW * 0.40) + ' ' + f(shY - h * 0.048) +
        ' Q ' + f(x) + ' ' + f(shY + h * 0.010) + ' ' + f(x + shW * 0.40) + ' ' + f(shY - h * 0.048) +
        ' Q ' + f(x) + ' ' + f(shY - h * 0.022) + ' ' + f(x - shW * 0.40) + ' ' + f(shY - h * 0.048) + ' Z" fill="' + shade(cloth, -0.26) + '" opacity=".38"/>';
    }
    if (dress && !seated) {
      g += '<path d="M ' + f(x - hipW * 1.04) + ' ' + f(hipY - h * 0.048) +
        ' L ' + f(x + hipW * 1.04) + ' ' + f(hipY - h * 0.048) +
        ' L ' + f(x + hipW * 1.92) + ' ' + f(hipY + h * 0.178) +
        ' Q ' + f(x) + ' ' + f(hipY + h * 0.218) + ' ' + f(x - hipW * 1.92) + ' ' + f(hipY + h * 0.178) + ' Z" fill="' + cloth + '"/>';
      if (!flat) {
        g += '<path d="M ' + f(x + hipW * 0.35 * dir) + ' ' + f(hipY - h * 0.048) + ' L ' + f(x + hipW * 1.92 * dir) + ' ' + f(hipY + h * 0.178) +
          ' Q ' + f(x + hipW * 0.9 * dir) + ' ' + f(hipY + h * 0.206) + ' ' + f(x + hipW * 0.22 * dir) + ' ' + f(hipY + h * 0.195) + ' Z" fill="' + shade(cloth, -0.16) + '" opacity=".42"/>';
      }
    }

    /* --- near arm sits on top of the torso, joined at the shoulder ---- */
    g += limbPath(armNear, limbW * 0.82, flat || shade(skin, 0.04));
    if (!flat) { g += sleeve(armNear); g += hand(armNear, shade(skin, 0.04)); }
    if (o.hold) g += prop(o.hold, armNear[2][0], armNear[2][1] - handR * 0.5, h * 0.012, o.holdTint);

    /* --- head --------------------------------------------------------- */
    var hx = x + h * 0.010 * dir;
    if (o.back) {                              /* seen from behind */
      g += '<circle cx="' + f(hx) + '" cy="' + f(headY) + '" r="' + f(headR * 1.06) + '" fill="' + (flat || hair) + '"/>';
      if (!flat) {
        if (hairStyle === 'bun') g += '<circle cx="' + f(hx) + '" cy="' + f(headY - headR * 0.82) + '" r="' + f(headR * 0.5) + '" fill="' + shade(hair, 0.1) + '"/>';
        else if (hairStyle === 'long' || hairStyle === 'wave') {
          g += '<path d="M ' + f(hx - headR * 1.04) + ' ' + f(headY) +
            ' q -' + f(headR * 0.2) + ' ' + f(headR * 2.2) + ' ' + f(headR * 0.4) + ' ' + f(headR * 2.4) +
            ' l ' + f(headR * 1.3) + ' 0 q ' + f(headR * 0.6) + ' -' + f(headR * 0.2) + ' ' + f(headR * 0.4) + ' -' + f(headR * 2.4) + ' Z" fill="' + hair + '"/>';
        } else if (hairStyle === 'curls') {
          for (var ci = 0; ci < 7; ci++) {
            var ca = Math.PI * (1.0 + ci * (1.0 / 6));
            g += '<circle cx="' + f(hx + Math.cos(ca) * headR * 0.9) + '" cy="' + f(headY + Math.sin(ca) * headR * 0.9) +
              '" r="' + f(headR * 0.5) + '" fill="' + hair + '"/>';
          }
        }
      }
    } else {
      if (!flat) g += hairBack(hairStyle, hx, headY, headR, dir, hair);
      g += '<circle cx="' + f(hx) + '" cy="' + f(headY) + '" r="' + f(headR) + '" fill="' + skin + '"/>';
      if (!flat) {
        g += hairFront(hairStyle, hx, headY, headR, dir, hair);
        /* ears, eyes, a smile — the smallest possible face */
        g += '<circle cx="' + f(hx - headR * 0.98 * dir) + '" cy="' + f(headY + headR * 0.12) + '" r="' + f(headR * 0.16) + '" fill="' + shade(skin, -0.12) + '"/>';
        g += '<circle cx="' + f(hx + headR * 0.36 * dir) + '" cy="' + f(headY + headR * 0.04) + '" r="' + f(headR * 0.125) + '" fill="#3B2A22" opacity=".9"/>';
        g += '<circle cx="' + f(hx - headR * 0.26 * dir) + '" cy="' + f(headY + headR * 0.04) + '" r="' + f(headR * 0.125) + '" fill="#3B2A22" opacity=".78"/>';
        if (o.pose === 'laugh') {
          g += '<ellipse cx="' + f(hx + headR * 0.10 * dir) + '" cy="' + f(headY + headR * 0.48) + '" rx="' + f(headR * 0.26) + '" ry="' + f(headR * 0.22) + '" fill="#7A3B2C" opacity=".85"/>';
        } else {
          g += '<path d="M ' + f(hx - headR * 0.20 * dir) + ' ' + f(headY + headR * 0.40) +
            ' q ' + f(headR * 0.30 * dir) + ' ' + f(headR * 0.34) + ' ' + f(headR * 0.60 * dir) + ' ' + f(headR * 0.02) + '" ' +
            'fill="none" stroke="#3B2A22" stroke-width="' + f(headR * 0.15) + '" stroke-linecap="round" opacity=".85"/>';
        }
        g += '<circle cx="' + f(hx + headR * 0.70 * dir) + '" cy="' + f(headY + headR * 0.30) + '" r="' + f(headR * 0.20) + '" fill="#D9714E" opacity=".26"/>';
        g += '<circle cx="' + f(hx - headR * 0.60 * dir) + '" cy="' + f(headY + headR * 0.32) + '" r="' + f(headR * 0.17) + '" fill="#D9714E" opacity=".18"/>';
      }
    }

    /* --- ground shadow ------------------------------------------------ */
    var shadow = (!flat && !seated && o.shadow !== false)
      ? '<ellipse cx="' + f(x) + '" cy="' + f(b + limbW * 0.3) + '" rx="' + f(h * 0.15) + '" ry="' + f(h * 0.032) + '" fill="rgba(59,42,34,.20)"/>'
      : '';

    /* --- how it moves --------------------------------------------------
       The animation origin is the ground under the figure, in the layer's
       own coordinates (`transform-box: view-box` — the stylesheet's default
       of fill-box would measure from the corner of each figure's own box,
       which is what used to make one guest wave about while their neighbour
       barely twitched). The travel is a fraction of the figure's height, so
       a small guest at the back of the terrace and a large one at the table
       move by the same amount *of themselves*: one scene, one intensity. */
    var cls = o.anim !== false ? (o.anim || 'ww-idle') : '';
    var delay = o.delay != null ? o.delay : -(r() * 6);
    var vars = '--ww-amp-y:' + f(-h * 0.009) + 'px;--ww-amp-x:' + f(h * 0.10) + 'px;' +
               '--ww-lift:' + f(-h * 0.030) + 'px;';
    return shadow + '<g class="' + cls + '" style="transform-box:view-box;transform-origin:' +
      f(x) + 'px ' + f(b) + 'px;' + vars +
      (cls ? 'animation-delay:' + f(delay) + 's;' : '') + '">' +
      (lean ? '<g transform="rotate(' + f(lean) + ' ' + f(x) + ' ' + f(b) + ')">' + g + '</g>' : g) +
      '</g>';
  }

  /* Nudge a hex colour lighter (+) or darker (−). */
  function shade(hex, amt) {
    if (!hex || hex.charAt(0) !== '#' || hex.length !== 7) return hex;
    var n = parseInt(hex.slice(1), 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v = Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt));
      return Math.max(0, Math.min(255, v));
    });
    return '#' + c.map(function (v) { var s = v.toString(16); return s.length < 2 ? '0' + s : s; }).join('');
  }

  /* A knot of two or three people mid-conversation. */
  function chatGroup(x, baseY, h, seed, opts) {
    opts = opts || {};
    var r = rand(seed || 7), g = '';
    var n = opts.n || (r() < 0.45 ? 3 : 2);
    var talker = (r() * n) | 0;
    for (var i = 0; i < n; i++) {
      var off = (i - (n - 1) / 2) * h * 0.36;
      var hh = h * (0.93 + r() * 0.14);
      var facing = off <= 0;                       /* everyone faces the middle */
      var pose = i === talker ? 'chat' : (r() < 0.3 ? 'laugh' : 'listen');
      g += person({
        x: x + off, baseY: baseY + (r() - 0.5) * h * 0.03, h: hh,
        pose: pose, flip: !facing, seed: (seed || 7) * 31 + i * 7,
        hold: r() < 0.45 ? 'glass' : null,
        anim: pose === 'laugh' ? 'ww-laugh' : (i === talker ? 'ww-talk' : 'ww-idle'),
        flat: opts.flat, cloth: opts.cloth
      });
    }
    return g;
  }

  /* A dinner guest, seated, elbows on the table. baseY is the seat front. */
  function diner(x, seatY, h, seed, opts) {
    opts = opts || {};
    var r = rand(seed || 11);
    return person({
      x: x, baseY: seatY, h: h, pose: 'sit', seed: seed,
      flip: opts.flip, cloth: opts.cloth,
      hold: r() < 0.4 ? 'glass' : null,
      anim: r() < 0.4 ? 'ww-talk' : 'ww-idle', shadow: false
    });
  }

  /* A plate with something on it. */
  function plate(x, y, s, seed) {
    var r = rand(seed || 13);
    var g = '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(34 * s) + '" ry="' + f(9 * s) + '" fill="#FFFAF0"/>';
    g += '<ellipse cx="' + f(x) + '" cy="' + f(y - 0.8 * s) + '" rx="' + f(23 * s) + '" ry="' + f(5.6 * s) + '" fill="#F2E6D0"/>';
    var foods = [
      ['#C4643C', '#E4A853'], ['#7C8B5E', '#9BA87C'], ['#D98A5E', '#F0C9A4'], ['#9B4A2A', '#C4643C']
    ][(r() * 4) | 0];
    for (var i = 0; i < 4; i++) {
      g += '<ellipse cx="' + f(x + (r() - 0.5) * 30 * s) + '" cy="' + f(y - 2 * s + (r() - 0.5) * 5 * s) +
        '" rx="' + f((5 + r() * 5) * s) + '" ry="' + f((2.6 + r() * 2.2) * s) + '" fill="' + (i % 2 ? foods[0] : foods[1]) + '"/>';
    }
    /* cutlery either side */
    g += '<rect x="' + f(x - 44 * s) + '" y="' + f(y - 4 * s) + '" width="' + f(2.4 * s) + '" height="' + f(15 * s) + '" rx="' + f(1.2 * s) + '" fill="#CBB795"/>';
    g += '<rect x="' + f(x + 41 * s) + '" y="' + f(y - 4 * s) + '" width="' + f(2.4 * s) + '" height="' + f(15 * s) + '" rx="' + f(1.2 * s) + '" fill="#CBB795"/>';
    return g;
  }

  /* A small aeroplane, banking away. */
  function airplane(x, y, s, body, trail) {
    body = body || '#4E6E80';
    var g = '';
    if (trail !== false) {
      g += '<path d="M ' + f(x - 96 * s) + ' ' + f(y + 5 * s) + ' L ' + f(x - 14 * s) + ' ' + f(y + 1 * s) +
        '" stroke="#FFFFFF" stroke-width="' + f(3.4 * s) + '" opacity=".5" stroke-linecap="round" fill="none"/>';
    }
    g += '<path d="M ' + f(x - 20 * s) + ' ' + f(y) +
      ' l ' + f(26 * s) + ' 0 l ' + f(11 * s) + ' -' + f(9 * s) + ' l ' + f(6 * s) + ' 0 l -' + f(5 * s) + ' ' + f(9 * s) +
      ' l ' + f(14 * s) + ' 0 l ' + f(7 * s) + ' -' + f(6 * s) + ' l ' + f(4.5 * s) + ' 0 l -' + f(3.5 * s) + ' ' + f(6 * s) +
      ' l ' + f(8 * s) + ' ' + f(3.4 * s) + ' l -' + f(68 * s) + ' 0 Z" fill="' + body + '"/>';
    g += '<path d="M ' + f(x - 6 * s) + ' ' + f(y + 1 * s) + ' l ' + f(15 * s) + ' 0 l -' + f(9 * s) + ' ' + f(10 * s) + ' l -' + f(7 * s) + ' 0 Z" fill="' + shade(body, -0.18) + '"/>';
    return g;
  }

  /* Kept for the after-party: a dancing silhouette, same body rules. */
  function dancer(x, baseY, h, color, delay) {
    return person({
      x: x, baseY: baseY, h: h, flat: color, pose: (Math.abs(x | 0) % 2) ? 'dance' : 'dance2',
      flip: (Math.abs(x | 0) % 3) === 0, anim: 'ww-dance', delay: delay || 0,
      seed: (x | 0) + (h | 0), dress: (Math.abs(x | 0) % 5) < 2
    });
  }

  global.WW = global.WW || {};
  global.WW.art = {
    P: P, uid: uid, f: f, rand: rand, svgWrap: svgWrap,
    ridge: ridge, houses: houses, campanile: campanile, cypress: cypress, olive: olive,
    water: water, sun: sun, clouds: clouds, birds: birds, lantern: lantern,
    stringLights: stringLights, stoneWall: stoneWall, boat: boat, grassTufts: grassTufts,
    branch: branch, dancer: dancer,
    person: person, chatGroup: chatGroup, diner: diner, plate: plate,
    prop: prop, shade: shade, limbPath: limbPath, airplane: airplane
  };
})(window);
