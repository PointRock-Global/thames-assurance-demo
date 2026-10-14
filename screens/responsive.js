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
