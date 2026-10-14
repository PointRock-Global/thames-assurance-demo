/* Responsive helper: adds a menu button for the side nav and tags grids
   so responsive.css can reflow them. Does nothing at >= 1200px. */
(function () {
  var mq = window.matchMedia('(max-width: 1199px)');
  var phone = window.matchMedia('(max-width: 767px)');
  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }

  ready(function () {
    var rail = document.querySelector('.rail');
    if (rail) {
      var btn = document.createElement('button');
      btn.className = 'rs-menu-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
      var scrim = document.createElement('div');
      scrim.className = 'rs-scrim';
      document.body.appendChild(scrim);
      document.body.appendChild(btn);
      var root = document.documentElement;
      function toggle(open) {
        var o = open === undefined ? !root.classList.contains('rs-nav-open') : open;
        root.classList.toggle('rs-nav-open', o);
        btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
        btn.innerHTML = o ? '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
                          : '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
      }
      btn.addEventListener('click', function () { toggle(); });
      scrim.addEventListener('click', function () { toggle(false); });
    }
    tag();
    if (mq.addEventListener) mq.addEventListener('change', tag);
    setTimeout(fixMaps, 300);
  });

  // Laptops 1200 to 1439px: zoom the 1440px artboard to fit. 1440 and up untouched.
  function fitLaptop() {
    var w = window.innerWidth, root = document.documentElement;
    if (w >= 1200 && w < 1440) { root.style.zoom = (w / 1440).toFixed(4); root.classList.add('rs-zoomed'); }
    else if (root.classList.contains('rs-zoomed')) { root.style.zoom = ''; root.classList.remove('rs-zoomed'); }
  }
  fitLaptop();
  window.addEventListener('resize', fitLaptop);

  // DEMO badge: below 1200px it becomes a small pill inside the top bar
  function moveBadge() {
    if (!mq.matches) return;
    var b = document.querySelector('.demo-badge'), bar = document.querySelector('.topbar');
    if (!b) return false;
    b.classList.add(bar ? 'rs-badge-inline' : 'rs-badge-corner');
    if (bar && b.parentElement !== bar) bar.appendChild(b);
    return true;
  }

  // Phone: tables become stacked cards
  function stackTables() {
    if (!phone.matches) return;
    // Row lists with a header row (reports lists)
    document.querySelectorAll('.list-head').forEach(function (head) {
      var labels = Array.prototype.map.call(head.children, function (c) { return c.textContent.trim(); });
      var p = head.parentElement;
      Array.prototype.forEach.call(p.children, function (row) {
        if (row === head || getComputedStyle(row).display !== 'grid') return;
        row.classList.add('rs-stack');
        Array.prototype.forEach.call(row.children, function (c, i) { if (labels[i]) c.setAttribute('data-label', labels[i]); });
      });
      head.classList.add('rs-hide');
      p.classList.remove('rs-scroll-x');
    });
    // Transposed grid (sites portfolio): one card per site
    var g = document.querySelector('.grid-wrap');
    if (g) {
      var kids = Array.prototype.slice.call(g.children), rows = [], cur = null;
      kids.forEach(function (k) {
        if (k.classList.contains('lab')) { cur = { lab: k, cells: [] }; rows.push(cur); }
        else if (cur) cur.cells.push(k);
      });
      var n = rows.length ? rows[0].cells.length : 0;
      if (!n) return;
      var wrap = document.createElement('div');
      wrap.className = 'rs-site-cards';
      for (var i = 0; i < n; i++) {
        var card = document.createElement('div'); card.className = 'rs-site-card';
        rows.forEach(function (r, ri) {
          var orig = r.cells[i]; if (!orig) return;
          var c = orig.cloneNode(true);
          c.addEventListener('click', function (e) {
            var t = e.target.closest('[data-demo-nav]');
            if (t) { var o = orig.querySelector('[data-demo-nav="' + t.getAttribute('data-demo-nav') + '"]') || orig; o.click(); }
          });
          if (ri === 0) { c.classList.add('rs-site-title'); card.appendChild(c); return; }
          var line = document.createElement('div'); line.className = 'rs-kv ' + (r.lab.getAttribute('class') || '');
          var l = document.createElement('div'); l.className = 'rs-k'; l.textContent = r.lab.textContent.trim();
          line.appendChild(l); line.appendChild(c); card.appendChild(line);
        });
        wrap.appendChild(card);
      }
      g.parentElement.insertBefore(wrap, g);
      g.classList.add('rs-hide');
    }
  }

  // Phone: report preview documents read as one column
  function docColumn() {
    if (!phone.matches) return;
    document.querySelectorAll('.doc *').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (cs.display === 'grid' && cs.gridTemplateColumns.split(' ').length > 1) {
        el.classList.add(el.children.length >= 4 && el.closest('.doc') && /score/i.test(el.className) ? 'rs-doc-2' : 'rs-doc-1');
      }
    });
  }

  ready(function () {
    var tries = 0;
    (function t() { if (!moveBadge() && tries++ < 20) setTimeout(t, 150); })();
    stackTables();
    docColumn();
  });

  var tagged = false;
  function tag() {
    if (!mq.matches || tagged) return;
    tagged = true;
    var main = document.querySelector('.main') || document.body;
    var els = main.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest('.rail, svg, .leaflet-container')) continue;
      var cs = getComputedStyle(el);
      var w = parseFloat(cs.width);
      if (cs.display === 'grid' || cs.display === 'inline-grid') {
        if (el.classList.contains('main')) continue;
        var cols = cs.gridTemplateColumns.split(' ').filter(Boolean);
        var widths = cols.map(parseFloat);
        var kidsArr = Array.prototype.slice.call(el.children);
        var firstCls = kidsArr.length ? ((kidsArr[0].getAttribute('class') || '').split(' ')[0] || kidsArr[0].tagName) : '';
        var sameKids = kidsArr.length >= 3 && kidsArr.every(function (k) { return ((k.getAttribute('class') || '').split(' ')[0] || k.tagName) === firstCls; });
        var equal = widths.length >= 3 && (sameKids || widths.every(function (x) { return Math.abs(x - widths[0]) < 2; }));
        var kids = el.children.length;
        if (equal && kids <= widths.length * 3 && !/head/.test(el.getAttribute('class') || '')) {
          el.classList.add('rs-cards');
          if (widths[0] < 150) el.classList.add('rs-small');
        } else if (widths.length >= 4) {
          el.classList.add('rs-wide');
          var p = el.parentElement;
          if (p && !p.classList.contains('rs-wide')) p.classList.add('rs-scroll-x');
        }
      }
      if (cs.display === 'flex' && cs.flexDirection === 'row' && el.children.length >= 2 && cs.flexWrap === 'nowrap' && el.scrollWidth > el.clientWidth + 4) {
        el.classList.add('rs-row');
      }
      // Fixed pixel widths wider than a phone become fluid
      var inlineW = el.style && el.style.width;
      if (w >= 360 && cs.position !== 'absolute' && !el.classList.contains('rs-wide') && /px$/.test(cs.width)) {
        var specified = el.getAttribute('style') || '';
        // only touch boxes that are explicitly sized (heuristic: not a grid/flex child stretching)
        if (/width\s*:/.test(specified)) el.classList.add('rs-fluid');
      }
      // Tap targets
      if (el.matches('a, button, .nav-item, .btn-open, .btn-ghost, .chip') && !el.classList.contains('rs-wide')) el.classList.add('rs-tap');
    }
  }

  function fixMaps() {
    if (!mq.matches || !window.L) return;
    // Leaflet maps re-measure on window resize
    window.dispatchEvent(new Event('resize'));
  }
})();
