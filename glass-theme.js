/**
 * Thames Assurance: GLASS THEME rollout (Option D look). Loaded by nav.js when GLASS_THEME = true.
 * Turns dark panels in the main area into shiny white glass on a navy stage with colour orbs,
 * and remaps light-on-dark text/borders inside them to AA-contrast dark equivalents.
 * Never touches: the white rail, the top header strip, maps (Leaflet), photos (url backgrounds), login, 00a overview.
 */
(function () {
  'use strict';
  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if (file.indexOf('01-login') === 0 || file.indexOf('00a-exec') === 0) return;

  function parse(c) {
    var m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/.exec(c || '');
    if (!m) return null;
    var a = m[4] == null ? 1 : (m[4].slice(-1) === '%' ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    return { r: +m[1], g: +m[2], b: +m[3], a: a };
  }
  function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function contrastOnWhite(c) { return 1.05 / (lum(c) + 0.05); }
  function hsl(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) { var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
    return { h: h, s: s, l: l };
  }
  function rgbFromHsl(h, s, l) {
    function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
    var r, g, b; if (s === 0) { r = g = b = l; } else { var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: 1 };
  }
  function css(c) { return 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')'; }
  // Light text designed for dark → dark text for white glass (AA >= 4.6 on #F0F5FB-ish glass)
  function darkText(c) {
    var x = hsl(c);
    if (x.s < 0.22 || (x.l > 0.9 && x.s < 0.6)) {           // whites / greys keep their hierarchy
      if (x.l >= 0.86) return 'rgb(11,27,46)';                // primary
      if (x.l >= 0.62) return 'rgb(44,66,86)';                // secondary
      return 'rgb(74,96,116)';                                 // tertiary (still AA)
    }
    var l = Math.min(x.l, 0.45), s = Math.min(1, x.s * 1.05 + 0.05), out = rgbFromHsl(x.h, s, l);
    while (contrastOnWhite(out) < 5.0 && l > 0.08) { l -= 0.03; out = rgbFromHsl(x.h, s, l); }
    return css(out);
  }
  function isDarkBg(c) { return c && c.a >= 0.5 && lum(c) < 0.2; }
  function firstGradColour(img) { var m = /rgba?\([^)]+\)/.exec(img || ''); return m ? parse(m[0]) : null; }
  // Any solid dark stop in a gradient (e.g. tinted-to-navy cards) counts as a dark surface
  function gradHasDarkStop(img) {
    var re = /rgba?\([^)]+\)/g, m, c;
    while ((m = re.exec(img || ''))) { c = parse(m[0]); if (c && c.a >= 0.5 && lum(c) < 0.2) return c; }
    return null;
  }
  // A panel mostly filled by a photo (img or url() background) keeps its dark frame so overlay labels stay legible
  function isPhotoViewer(el, area) {
    var kids = el.querySelectorAll('img, video, canvas, [style*="url("]');
    for (var i = 0; i < kids.length; i++) {
      var rr = kids[i].getBoundingClientRect();
      if (rr.width * rr.height > area * 0.82) return true;
    }
    var any = el.querySelectorAll('*');
    for (var j = 0; j < any.length && j < 400; j++) {
      if (/url\(/.test(getComputedStyle(any[j]).backgroundImage)) {
        var r2 = any[j].getBoundingClientRect(); if (r2.width * r2.height > area * 0.82) return true;
      }
    }
    return false;
  }
  function skipZone(el) {
    return el.closest('.rail, .leaflet-container, .mapbody, #map, .tg-orbs, .demo-badge, #demo-toast, .toast');
  }

  function run() {
    var html = document.documentElement, body = document.body;
    if (html.classList.contains('tg-on')) return;
    html.classList.add('tg-on');
    var orbs = document.createElement('div'); orbs.className = 'tg-orbs';
    orbs.innerHTML = '<i class="o1"></i><i class="o2"></i><i class="o3"></i><i class="o4"></i><i class="o5"></i>';
    body.insertBefore(orbs, body.firstChild);

    var VW = window.innerWidth, VH = window.innerHeight, stageArea = VW * VH;
    var railEl = document.querySelector('.rail'), railRight = railEl ? railEl.getBoundingClientRect().right : 0;
    var all = Array.prototype.slice.call(body.querySelectorAll('*'));
    var panels = [];
    all.forEach(function (el) {
      if (el === orbs || skipZone(el)) return;
      var tag = el.tagName; if (/^(SCRIPT|STYLE|SVG|PATH|IMG|svg|path|circle|line|rect|g|use|text|symbol)$/.test(tag)) return;
      if (el instanceof SVGElement) return;
      var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
      var r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
      var bg = parse(cs.backgroundColor), gc = /gradient/.test(cs.backgroundImage) ? firstGradColour(cs.backgroundImage) : null;
      var hasUrl = /url\(/.test(cs.backgroundImage);
      var dark = isDarkBg(bg) || (gc && gc.a >= 0.5 && lum(gc) < 0.2) || (/gradient/.test(cs.backgroundImage) && !!gradHasDarkStop(cs.backgroundImage));
      var white = bg && bg.a >= 0.9 && lum(bg) > 0.85;
      var area = r.width * r.height;
      // header strip at the top of the main area stays dark
      if (r.top < 4 && r.height <= 80 && r.width > VW * 0.5) return;
      // stage = the full-bleed main area (touches the rail edge and fills the height); big inset panels still become glass
      if (dark && area > stageArea * 0.45 && (r.left <= railRight + 2 || r.height >= VH - 70)) { el.classList.add('tg-stage'); return; }
      if (hasUrl) return;
      if (el.closest('.tg-glass, .tg-frame, [data-tg-photo]')) return;
      if (dark && r.width >= 120 && r.height >= 44) {
        if (isPhotoViewer(el, area)) { el.setAttribute('data-tg-photo', ''); return; }   // big photo viewer: leave dark
        panels.push(el); el.classList.add('tg-glass'); return;
      }
      // unstyled container cards/panels (transparent, e.g. reports list) also become glass
      if (!dark && !white && (!bg || bg.a < 0.1) && /(^|\s)(card|panel|list-wrap)(\s|$)/.test(el.className) && r.width >= 300 && r.height >= 120) { panels.push(el); el.classList.add('tg-glass'); return; }
      if (white && r.width >= 400 && r.height >= 200 && !el.closest('.tg-frame')) { el.classList.add('tg-frame'); }
    });

    panels.forEach(function (p) {
      var cs = getComputedStyle(p), r = p.getBoundingClientRect();
      // panel radius by size
      p.style.setProperty('--tg-r', (r.height < 90 ? 16 : r.height < 160 ? 20 : 24) + 'px');
      if (parseFloat(cs.borderTopWidth) < 1) p.style.setProperty('border-width', '1px', 'important');
      var bc = parse(cs.borderTopColor);
      if (bc && bc.a > 0.45 && hsl(bc).s > 0.5 && lum(bc) > 0.08) {     // keep meaningful coloured outline
        p.classList.add('tg-keep-edge'); p.style.setProperty('--tg-edge-c', darkText(bc));
      }
      if (cs.position === 'static') p.style.position = 'relative';
      var small = r.width * r.height < stageArea * 0.08;
      if (small) {
        p.classList.add('tg-card');
        var after = getComputedStyle(p, '::after').content;
        if ((!after || after === 'none' || after === 'normal') && cs.overflow !== 'visible' || (after === 'none' || after === 'normal')) {
          if (!p.querySelector('.leaflet-container')) p.classList.add('tg-sweep');
        }
      }
      // pass 1: backgrounds + borders of descendants
      var desc = Array.prototype.slice.call(p.querySelectorAll('*'));
      var keep = [];
      desc.forEach(function (el) {
        if (skipZone(el) || el instanceof SVGElement) return;
        var ds = getComputedStyle(el);
        if (/url\(/.test(ds.backgroundImage)) { el.setAttribute('data-tg-photo', ''); return; }
        if (el.closest('[data-tg-photo]')) return;
        var b = parse(ds.backgroundColor), g = /gradient/.test(ds.backgroundImage) ? firstGradColour(ds.backgroundImage) : null;
        var gd = /gradient/.test(ds.backgroundImage) ? gradHasDarkStop(ds.backgroundImage) : null;
        var eff = gd ? gd : (g && g.a >= 0.5) ? g : b;
        if (eff && eff.a >= 0.5) {
          if (lum(eff) < 0.2 && hsl(eff).s < 0.75) el.classList.add('tg-sub');          // dark tile → soft tint
          else if (lum(eff) < 0.85) keep.push(el);                                        // solid colour (button/badge): keep
        }
        ['Top', 'Right', 'Bottom', 'Left'].forEach(function (side) {
          if (parseFloat(ds['border' + side + 'Width']) < 0.5) return;
          var c = parse(ds['border' + side + 'Color']); if (!c) return;
          var x = hsl(c);
          if (lum(c) > 0.35 && (x.s < 0.3 || c.a < 0.5)) el.style.setProperty('border-' + side.toLowerCase() + '-color', 'rgba(10,37,64,0.12)', 'important');
          else if (lum(c) < 0.06) el.style.setProperty('border-' + side.toLowerCase() + '-color', 'rgba(10,37,64,0.10)', 'important');
        });
      });
      keep.forEach(function (k) { k.setAttribute('data-tg-keep', ''); });
      // pass 2: text colours (skip anything sitting on a kept solid colour or a photo)
      [p].concat(desc).forEach(function (el) {
        if (skipZone(el) || el.closest('[data-tg-photo]') || (el !== p && el.closest('[data-tg-keep]'))) return;
        var ds = getComputedStyle(el);
        if (el instanceof SVGElement) {
          ['stroke', 'fill'].forEach(function (prop) {
            var v = ds[prop]; var c = parse(v); if (!c || c.a === 0) return;
            if (lum(c) > 0.45 && hsl(c).s < 0.3) el.style.setProperty(prop, c.a < 0.4 ? 'rgba(10,37,64,0.14)' : darkText(c), 'important');
          });
          return;
        }
        var c = parse(ds.color); if (!c) return;
        if (contrastOnWhite(c) < 4.6) el.style.setProperty('color', darkText(c), 'important');
        if (/^(INPUT|TEXTAREA)$/.test(el.tagName)) el.style.setProperty('background', 'rgba(255,255,255,0.8)', 'important');
      });
    });
  }

  if (document.readyState === 'complete') setTimeout(run, 60);
  else window.addEventListener('load', function () { setTimeout(run, 60); });
})();
