/**
 * Thames Assurance — live demo navigation
 * Context-aware wiring for Beckton / Oxford / shared Map screens.
 * Prefers data-demo-nav / data-demo-site hooks; text-match fallback.
 */
(function () {
  'use strict';

  var file = (location.pathname.split('/').pop() || '').toLowerCase();

  var ROUTES = {
    login: '01-login-dark.html',
    portfolio: '00-sites-portfolio.html',
    map: '02-map-home.html',
    london: '03-region-sites.html',
    tv: '06-region-thames-valley.html',
    becktonGt: '04-site-dashboard-gt.html',
    oxfordGt: '05-oxford-dashboard-gt.html',
    ncr: '07-decision-ncr-00471.html',
    costain: '08-contractor-costain.html',
    cmdp: '09-contractor-cmdp.html',
    visualsB: '10-site-visuals-beckton.html',
    visualsO: '13-site-visuals-oxford.html',
    camB: '16-cam-detail-beckton.html',
    camO: '17-cam-detail-oxford.html',
    reportsB: '11-reports-beckton.html',
    previewB: '12-report-preview-beckton.html',
    reportsO: '14-reports-oxford.html',
    previewO: '15-report-preview-oxford.html',
    programmeB: '18-programme-beckton.html',
    programmeO: '19-programme-oxford.html',
    alertsB: '20-alerts-beckton.html',
    alertsO: '21-alerts-oxford.html',
    assuranceB: '22-assurance-beckton.html',
    assuranceO: '23-assurance-oxford.html',
    briefB: '24-scheme-brief-beckton.html'
  };

  function detectSite() {
    var bodySite = (document.body && document.body.getAttribute('data-demo-site')) || '';
    if (bodySite === 'oxford' || bodySite === 'beckton' || bodySite === 'shared') return bodySite;

    if (/oxford|cmdp|05-oxford|09-contractor|13-site|14-reports|15-report|17-cam|19-programme|21-alerts|23-assurance/.test(file)) {
      return 'oxford';
    }
    if (/beckton|costain|04-site|07-decision|08-contractor|10-site|11-reports|12-report|16-cam|18-programme|20-alerts|22-assurance|24-scheme/.test(file)) {
      return 'beckton';
    }

    var crumbs = textOf(document.querySelector('.crumbs'));
    if (/Oxford/i.test(crumbs)) return 'oxford';
    if (/Beckton/i.test(crumbs)) return 'beckton';
    return 'shared';
  }

  function site() {
    return detectSite();
  }

  function go(href, hash) {
    if (!href) return;
    location.href = href + (hash || '');
  }

  function mark(el) {
    if (!el) return;
    el.classList.add('demo-linked', 'demo-clickable');
  }

  function onClick(el, fn) {
    if (!el || el.__demoWired) return;
    el.__demoWired = true;
    mark(el);
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fn(e);
    });
  }

  function textOf(el) {
    return ((el && (el.textContent || '')) || '').replace(/\s+/g, ' ').trim();
  }

  function navKey(el) {
    if (!el) return '';
    var key = (el.getAttribute('data-demo-nav') || '').toLowerCase();
    if (key) return key;
    var t = textOf(el);
    if (/Site Dashboard/i.test(t)) return 'dashboard';
    if (/^Portfolio$/i.test(t) || /^All sites$/i.test(t)) return 'portfolio';
    if (/Overview\s*\/\s*Map/i.test(t) || /^Map$/i.test(t)) return 'map';
    if (/^Regions$/i.test(t)) return 'regions';
    if (/Site locations/i.test(t)) return 'sites';
    if (/Project team/i.test(t)) return 'team';
    if (/Site visuals/i.test(t)) return 'visuals';
    if (/^Programme$/i.test(t)) return 'programme';
    if (/^Assurance$/i.test(t)) return 'assurance';
    if (/^Reports$/i.test(t)) return 'reports';
    if (/^Alerts/i.test(t)) return 'alerts';
    if (/Scheme brief/i.test(t)) return 'brief';
    if (/^Settings$/i.test(t)) return 'settings';
    if (/Log\s*out/i.test(t)) return 'logout';
    return '';
  }

  function siteRoutes(s) {
    var oxford = s === 'oxford';
    return {
      gt: oxford ? ROUTES.oxfordGt : ROUTES.becktonGt,
      visuals: oxford ? ROUTES.visualsO : ROUTES.visualsB,
      programme: oxford ? ROUTES.programmeO : ROUTES.programmeB,
      assurance: oxford ? ROUTES.assuranceO : ROUTES.assuranceB,
      reports: oxford ? ROUTES.reportsO : ROUTES.reportsB,
      alerts: oxford ? ROUTES.alertsO : ROUTES.alertsB,
      contractor: oxford ? ROUTES.cmdp : ROUTES.costain
    };
  }

  function handleRailNav(key) {
    var s = site();
    var r = siteRoutes(s === 'shared' ? 'beckton' : s);

    if (key === 'logout') {
      go(ROUTES.login);
      return true;
    }

    if (key === 'portfolio') {
      go(ROUTES.portfolio);
      return true;
    }

    // v3: Beckton scheme brief (only Beckton has a brief in the demo)
    if (key === 'brief') {
      go(ROUTES.briefB);
      return true;
    }

    if (s === 'shared') {
      if (key === 'map') { go(ROUTES.map); return true; }
      if (key === 'regions') {
        if (file.indexOf('06-region') === 0) go(ROUTES.tv);
        else go(ROUTES.london);
        return true;
      }
      if (key === 'sites') {
        if (file.indexOf('06-region') === 0) go(ROUTES.tv);
        else go(ROUTES.london);
        return true;
      }
      // Shared-level Programme / Assurance / Reports / Alerts → Beckton demo samples
      if (key === 'programme') { go(ROUTES.programmeB); return true; }
      if (key === 'assurance') { go(ROUTES.assuranceB); return true; }
      if (key === 'reports') { go(ROUTES.reportsB); return true; }
      if (key === 'alerts') { go(ROUTES.alertsB); return true; }
      if (key === 'settings') { return true; } // demo no-op
      if (key === 'dashboard' || key === 'team' || key === 'visuals') {
        go(ROUTES.becktonGt);
        return true;
      }
      return false;
    }

    // Site context (Beckton / Oxford) — full rail
    if (key === 'dashboard') { go(r.gt); return true; }
    if (key === 'map') { go(ROUTES.map); return true; }
    if (key === 'team') {
      if (/08-contractor|09-contractor/.test(file)) go(r.contractor);
      else go(r.gt, '#project-team');
      return true;
    }
    if (key === 'visuals') { go(r.visuals); return true; }
    if (key === 'programme') { go(r.programme); return true; }
    if (key === 'assurance') { go(r.assurance); return true; }
    if (key === 'reports') { go(r.reports); return true; }
    if (key === 'alerts') { go(r.alerts); return true; }
    return false;
  }

  function wireLogout() {
    document.querySelectorAll('.logout-btn, [data-demo-nav="logout"]').forEach(function (btn) {
      onClick(btn, function () { go(ROUTES.login); });
    });
  }

  function wireSiteRail() {
    document.querySelectorAll('.rail .nav-item, .rail .logout-btn').forEach(function (item) {
      var key = navKey(item);
      if (!key) return;
      if (key === 'settings') {
        mark(item);
        item.title = item.title || 'Demo settings (not wired)';
        return;
      }
      onClick(item, function () { handleRailNav(key); });
    });

    // Event delegation backup on rail (covers SVG/text click targets)
    var rail = document.querySelector('.rail');
    if (rail && !rail.__demoDelegated) {
      rail.__demoDelegated = true;
      rail.addEventListener('click', function (e) {
        var item = e.target && e.target.closest && e.target.closest('.nav-item, .logout-btn, [data-demo-nav]');
        if (!item || !rail.contains(item)) return;
        var key = navKey(item);
        if (!key || key === 'settings') return;
        if (item.__demoWired) return; // individual handler already fired (stopped)
        e.preventDefault();
        e.stopPropagation();
        handleRailNav(key);
      });
    }
  }

  function wireCrumbs() {
    var s = site();
    var crumbs = document.querySelector('.crumbs');
    if (!crumbs) return;

    crumbs.style.cursor = 'default';
    crumbs.addEventListener('click', function (e) {
      var target = e.target;
      var raw = textOf(target).replace(/\s*\/\s*/g, '').trim();

      if (/^Portfolio$/i.test(raw) || /^All sites$/i.test(raw)) { go(ROUTES.portfolio); return; }
      if (/^Map( Home)?$/i.test(raw)) { go(ROUTES.map); return; }
      if (/Map/i.test(raw) && !/Beckton|Oxford|London|Thames|NCR|Reports|Assurance|Programme|Alerts|visuals|CAM/i.test(raw)) {
        go(ROUTES.map); return;
      }
      if (/^London$/i.test(raw)) { go(ROUTES.london); return; }
      if (/Thames Valley/i.test(raw)) { go(ROUTES.tv); return; }
      if (/Beckton/i.test(raw)) { go(ROUTES.becktonGt); return; }
      if (/Oxford/i.test(raw)) { go(ROUTES.oxfordGt); return; }
      if (/^Reports$/i.test(raw)) {
        go(s === 'oxford' ? ROUTES.reportsO : ROUTES.reportsB); return;
      }
      if (/Site visuals/i.test(raw)) {
        go(s === 'oxford' ? ROUTES.visualsO : ROUTES.visualsB); return;
      }
      if (/Scheme brief/i.test(raw)) { go(ROUTES.briefB); return; }
    });

    try {
      var mapLabel = crumbs.childNodes[0];
      if (mapLabel && mapLabel.nodeType === 3 && /Map/.test(mapLabel.textContent)) {
        var span = document.createElement('span');
        span.textContent = mapLabel.textContent.replace(/\s*$/, '');
        span.className = 'demo-crumb demo-linked';
        span.style.cursor = 'pointer';
        span.style.color = '#7DD3FC';
        span.addEventListener('click', function (e) {
          e.stopPropagation();
          go(ROUTES.map);
        });
        crumbs.replaceChild(span, mapLabel);
      }
      crumbs.querySelectorAll('span, b').forEach(function (el) {
        var t = textOf(el);
        if (/^Portfolio$/i.test(t) || /^All sites$/i.test(t)) {
          mark(el); el.style.cursor = 'pointer'; el.style.color = el.style.color || '#7DD3FC';
          onClick(el, function () { go(ROUTES.portfolio); });
        } else if (/^London$/i.test(t)) {
          mark(el); el.style.cursor = 'pointer'; el.style.color = el.style.color || '#7DD3FC';
          onClick(el, function () { go(ROUTES.london); });
        } else if (/Thames Valley/i.test(t)) {
          mark(el); el.style.cursor = 'pointer';
          onClick(el, function () { go(ROUTES.tv); });
        } else if (/Beckton/i.test(t) && !/NCR|Reports|visuals|CAM|Programme|Alerts|Assurance|brief/i.test(t)) {
          mark(el); el.style.cursor = 'pointer';
          onClick(el, function () { go(ROUTES.becktonGt); });
        } else if (/Oxford/i.test(t) && !/NCR|Reports|visuals|CAM|Programme|Alerts|Assurance/i.test(t)) {
          mark(el); el.style.cursor = 'pointer';
          onClick(el, function () { go(ROUTES.oxfordGt); });
        } else if (/^Reports$/i.test(t)) {
          mark(el); el.style.cursor = 'pointer';
          onClick(el, function () {
            go(s === 'oxford' ? ROUTES.reportsO : ROUTES.reportsB);
          });
        } else if (/Site visuals/i.test(t)) {
          mark(el); el.style.cursor = 'pointer';
          onClick(el, function () {
            go(s === 'oxford' ? ROUTES.visualsO : ROUTES.visualsB);
          });
        }
      });
    } catch (err) { /* ignore */ }
  }

  function wireLogin() {
    if (file.indexOf('01-login') !== 0) return;
    var btn = document.querySelector('.btn');
    onClick(btn, function () { go(ROUTES.portfolio); });
    var sso = document.querySelector('.sso');
    onClick(sso, function () { go(ROUTES.portfolio); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go(ROUTES.portfolio);
    });
  }

  function wireMapHome() {
    if (file.indexOf('02-map') !== 0) return;
    var cards = document.querySelector('.region-cards');
    if (cards) cards.classList.add('demo-interactive');
    document.querySelectorAll('.rcard.london').forEach(function (c) {
      onClick(c, function () { go(ROUTES.london); });
    });
    document.querySelectorAll('.rcard.tv').forEach(function (c) {
      onClick(c, function () { go(ROUTES.tv); });
    });

    // Leaflet polygons + Beckton/Oxford pins → regions / sites
    function attachMapClicks() {
      try {
        if (typeof L === 'undefined') return;
        var mapEl = document.getElementById('map');
        if (!mapEl) return;
        // Walk Leaflet layers via map instance stored on DOM
        var id = mapEl._leaflet_id;
        if (!id || !window.L || !L.Map) return;
        var map;
        // Leaflet keeps maps in an internal registry; fall back to scanning
        Object.keys(mapEl).some(function (k) {
          if (k.indexOf('leaflet') === 0) return false;
          return false;
        });
        // Prefer documented approach: find map from panes
        if (mapEl._leaflet) map = mapEl._leaflet;
        // Use L.DomEvent on existing paths
        var paths = mapEl.querySelectorAll('path.leaflet-interactive, .leaflet-interactive');
        // Polygons may not be interactive yet — make region polygons clickable via map click + hit
        // Simpler: re-query leaflet layers if map ref available through _leaflet_id map bookkeeping
        var maps = [];
        if (L.Map && L.Map.prototype) {
          // Iterate all map containers
          document.querySelectorAll('.leaflet-container').forEach(function (el) {
            if (el._leaflet_id && window[el._leaflet_id]) { /* noop */ }
          });
        }
        // Robust approach: enable clicks on SVG paths in order (london then tv then guildford)
        var svgPaths = mapEl.querySelectorAll('.leaflet-overlay-pane path');
        if (svgPaths && svgPaths.length) {
          // First large cyan-ish path ≈ London, teal ≈ TV (fill set in page script)
          Array.prototype.forEach.call(svgPaths, function (path, idx) {
            path.style.cursor = 'pointer';
            path.classList.add('demo-clickable');
            path.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              // Heuristic: first path London, second TV, third Guildford→TV
              if (idx === 0) go(ROUTES.london);
              else go(ROUTES.tv);
            });
          });
        }
        // Pin labels + data-demo-site hooks: Beckton / Oxford equally clickable
        function wirePin(wrap, href) {
          if (!wrap || wrap.__demoWired) return;
          var icon = wrap.closest('.leaflet-marker-icon, .leaflet-div-icon');
          if (icon) {
            icon.style.pointerEvents = 'auto';
            icon.style.cursor = 'pointer';
            icon.style.zIndex = '650';
          }
          wrap.style.cursor = 'pointer';
          wrap.style.pointerEvents = 'auto';
          // Expand hit area around the pin
          wrap.style.width = '88px';
          wrap.style.height = '28px';
          wrap.style.left = '-10px';
          wrap.style.top = '-14px';
          onClick(wrap, function () { go(href); });
          if (icon && !icon.__demoWired) {
            icon.__demoWired = true;
            icon.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              go(href);
            });
          }
        }
        mapEl.querySelectorAll('.pin-wrap, [data-demo-site]').forEach(function (wrap) {
          var siteAttr = (wrap.getAttribute('data-demo-site') || '').toLowerCase();
          var label = textOf(wrap.querySelector('.pin-label')) || textOf(wrap);
          if (siteAttr === 'beckton' || /Beckton/i.test(label)) wirePin(wrap, ROUTES.becktonGt);
          else if (siteAttr === 'oxford' || /Oxford/i.test(label)) wirePin(wrap, ROUTES.oxfordGt);
        });
      } catch (e) { /* ignore */ }
    }
    setTimeout(attachMapClicks, 400);
    setTimeout(attachMapClicks, 1000);
    setTimeout(attachMapClicks, 2200);
  }

  function enableRegionPanelClicks() {
    document.querySelectorAll('.panel').forEach(function (p) {
      p.style.pointerEvents = 'auto';
    });
    document.querySelectorAll('.srow, .viewall, .slist').forEach(function (el) {
      el.style.pointerEvents = 'auto';
    });
  }

  function wireRegionLondon() {
    if (file.indexOf('03-region') !== 0) return;
    enableRegionPanelClicks();
    document.querySelectorAll('.srow').forEach(function (row) {
      var name = textOf(row.querySelector('.name'));
      var siteAttr = (row.getAttribute('data-demo-site') || '').toLowerCase();
      if (siteAttr === 'beckton' || /Beckton/i.test(name)) {
        row.setAttribute('data-demo-site', 'beckton');
        row.setAttribute('data-demo-nav', 'open-site');
        onClick(row, function () { go(ROUTES.becktonGt); });
      }
    });
    document.querySelectorAll('.viewall, [data-demo-nav="open-site"]').forEach(function (el) {
      var siteAttr = (el.getAttribute('data-demo-site') || '').toLowerCase();
      if (siteAttr === 'oxford') return;
      if (siteAttr === 'beckton' || /Open site/i.test(textOf(el)) || el.classList.contains('viewall')) {
        el.setAttribute('data-demo-site', 'beckton');
        onClick(el, function () { go(ROUTES.becktonGt); });
      }
    });
    // Map pins on region screen
    setTimeout(function () {
      document.querySelectorAll('.pin-wrap').forEach(function (wrap) {
        var label = textOf(wrap.querySelector('.pin-label')) || textOf(wrap);
        var siteAttr = (wrap.getAttribute('data-demo-site') || '').toLowerCase();
        if (siteAttr === 'beckton' || /Beckton/i.test(label)) {
          var icon = wrap.closest('.leaflet-marker-icon, .leaflet-div-icon');
          if (icon) { icon.style.pointerEvents = 'auto'; icon.style.cursor = 'pointer'; icon.style.zIndex = '650'; }
          wrap.style.pointerEvents = 'auto'; wrap.style.cursor = 'pointer';
          onClick(wrap, function () { go(ROUTES.becktonGt); });
        }
      });
    }, 800);
  }

  function wireRegionTV() {
    if (file.indexOf('06-region') !== 0) return;
    enableRegionPanelClicks();
    document.querySelectorAll('.srow').forEach(function (row) {
      var name = textOf(row.querySelector('.name'));
      var siteAttr = (row.getAttribute('data-demo-site') || '').toLowerCase();
      if (siteAttr === 'oxford' || /Oxford/i.test(name)) {
        row.setAttribute('data-demo-site', 'oxford');
        row.setAttribute('data-demo-nav', 'open-site');
        onClick(row, function () { go(ROUTES.oxfordGt); });
      }
    });
    document.querySelectorAll('.viewall, [data-demo-nav="open-site"]').forEach(function (el) {
      var siteAttr = (el.getAttribute('data-demo-site') || '').toLowerCase();
      if (siteAttr === 'beckton') return;
      if (siteAttr === 'oxford' || /Open site/i.test(textOf(el)) || el.classList.contains('viewall')) {
        el.setAttribute('data-demo-site', 'oxford');
        onClick(el, function () { go(ROUTES.oxfordGt); });
      }
    });
    // Map pins on TV region — Oxford must be as easy as Beckton on London
    setTimeout(function () {
      document.querySelectorAll('.pin-wrap, [data-demo-site="oxford"]').forEach(function (wrap) {
        if (!wrap.classList.contains('pin-wrap') && wrap.getAttribute('data-demo-site') !== 'oxford') return;
        var label = textOf(wrap.querySelector && wrap.querySelector('.pin-label')) || textOf(wrap);
        var siteAttr = (wrap.getAttribute('data-demo-site') || '').toLowerCase();
        if (siteAttr === 'oxford' || /Oxford/i.test(label)) {
          var icon = wrap.closest('.leaflet-marker-icon, .leaflet-div-icon');
          if (icon) { icon.style.pointerEvents = 'auto'; icon.style.cursor = 'pointer'; icon.style.zIndex = '700'; }
          wrap.style.pointerEvents = 'auto'; wrap.style.cursor = 'pointer';
          wrap.setAttribute('data-demo-site', 'oxford');
          onClick(wrap, function () { go(ROUTES.oxfordGt); });
          if (icon && !icon.__demoWiredOx) {
            icon.__demoWiredOx = true;
            icon.addEventListener('click', function (e) {
              e.preventDefault(); e.stopPropagation(); go(ROUTES.oxfordGt);
            });
          }
        }
      });
    }, 600);
    setTimeout(function () {
      document.querySelectorAll('.pin-wrap').forEach(function (wrap) {
        var label = textOf(wrap.querySelector('.pin-label')) || textOf(wrap);
        if (/Oxford/i.test(label)) {
          var icon = wrap.closest('.leaflet-marker-icon, .leaflet-div-icon');
          if (icon) { icon.style.pointerEvents = 'auto'; icon.style.cursor = 'pointer'; icon.style.zIndex = '700'; }
          wrap.style.pointerEvents = 'auto'; wrap.style.cursor = 'pointer';
          onClick(wrap, function () { go(ROUTES.oxfordGt); });
        }
      });
    }, 1600);
  }

  function ensureProjectTeamId() {
    var candidates = document.querySelectorAll('h2, h3, .sec-label, .section-title, .panel-title');
    candidates.forEach(function (el) {
      if (/Project team/i.test(textOf(el))) {
        var section = el.closest('.panel, .card, .team, .section, .block') || el.parentElement;
        if (section && !section.id) section.id = 'project-team';
      }
    });
    var person = document.querySelector('.person');
    if (person && !document.getElementById('project-team')) {
      var wrap = person.closest('.panel, .card, .team, section, .block') || person.parentElement;
      if (wrap) wrap.id = 'project-team';
    }
    if (location.hash === '#project-team') {
      setTimeout(function () {
        var t = document.getElementById('project-team');
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

  function wireBecktonGt() {
    if (file.indexOf('04-site') !== 0) return;
    ensureProjectTeamId();
    document.querySelectorAll('.dcard').forEach(function (card) {
      if (/NCR-00471/i.test(textOf(card))) {
        onClick(card, function () { go(ROUTES.ncr); });
      }
    });
    document.querySelectorAll('.t, .title, .id').forEach(function (el) {
      if (/^NCR-00471$/i.test(textOf(el))) {
        var card = el.closest('.dcard, .queue-row, .ncr-row, tr, .row') || el.parentElement;
        onClick(card, function () { go(ROUTES.ncr); });
      }
    });
    document.querySelectorAll('.person.clickable, .person').forEach(function (p) {
      if (/Costain/i.test(textOf(p)) || /Open Costain/i.test(p.getAttribute('title') || '')) {
        onClick(p, function () { go(ROUTES.costain); });
      }
    });
  }

  function wireOxfordGt() {
    if (file.indexOf('05-oxford') !== 0) return;
    ensureProjectTeamId();
    document.querySelectorAll('.person.clickable, .person').forEach(function (p) {
      if (/CMDP/i.test(textOf(p)) || /Open CMDP/i.test(p.getAttribute('title') || '')) {
        onClick(p, function () { go(ROUTES.cmdp); });
      }
    });
  }

  function wireNcr() {
    if (file.indexOf('07-decision') !== 0) return;
    document.querySelectorAll('.btn-ghost').forEach(function (btn) {
      if (/Back/i.test(textOf(btn))) {
        onClick(btn, function () { go(ROUTES.becktonGt); });
      }
    });
  }

  function wireContractor() {
    if (file.indexOf('08-contractor') === 0) {
      document.querySelectorAll('.btn-ghost, .rm').forEach(function (btn) {
        if (/Back/i.test(textOf(btn))) {
          onClick(btn, function () { go(ROUTES.becktonGt); });
        }
      });
    }
    if (file.indexOf('09-contractor') === 0) {
      document.querySelectorAll('.btn-ghost, .rm').forEach(function (btn) {
        if (/Back/i.test(textOf(btn))) {
          onClick(btn, function () { go(ROUTES.oxfordGt); });
        }
      });
    }
  }

  function wireVisuals() {
    if (file.indexOf('10-site-visuals') === 0) {
      document.querySelectorAll('.cam-tile, .tile').forEach(function (card) {
        if (/Closer look|CAM-BKT-02/i.test(textOf(card))) {
          onClick(card, function () { go(ROUTES.camB); });
        }
      });
      document.querySelectorAll('.cam-hint').forEach(function (hint) {
        if (/Closer look/i.test(textOf(hint))) {
          var card = hint.closest('.cam-tile, .tile, [class*="cam"]') || hint.parentElement;
          onClick(card, function () { go(ROUTES.camB); });
        }
      });
    }
    if (file.indexOf('13-site-visuals') === 0) {
      document.querySelectorAll('.cam-hint').forEach(function (hint) {
        if (/Closer look/i.test(textOf(hint))) {
          var card = hint.closest('.cam-tile, .tile, [class*="cam"]') || hint.parentElement;
          onClick(card, function () { go(ROUTES.camO); });
        }
      });
      document.querySelectorAll('.cam-tile, .tile').forEach(function (card) {
        if (/CAM-OXF-02|Closer look/i.test(textOf(card))) {
          onClick(card, function () { go(ROUTES.camO); });
        }
      });
    }
  }

  function wireCamDetail() {
    if (file.indexOf('16-cam') === 0) {
      document.querySelectorAll('.btn-ghost, .back-btn').forEach(function (btn) {
        if (/Back/i.test(textOf(btn))) {
          onClick(btn, function () { go(ROUTES.visualsB); });
        }
      });
    }
    if (file.indexOf('17-cam') === 0) {
      document.querySelectorAll('.btn-ghost, .back-btn').forEach(function (btn) {
        if (/Back/i.test(textOf(btn))) {
          onClick(btn, function () { go(ROUTES.visualsO); });
        }
      });
    }
  }

  function wireReports() {
    if (file.indexOf('11-reports') === 0) {
      document.querySelectorAll('.btn-open').forEach(function (btn) {
        onClick(btn, function () { go(ROUTES.previewB); });
        var row = btn.closest('.row, .rrow, .report-row, tr, .card, .item');
        if (row) onClick(row, function () { go(ROUTES.previewB); });
      });
    }
    if (file.indexOf('14-reports') === 0) {
      document.querySelectorAll('.btn-open').forEach(function (btn) {
        onClick(btn, function () { go(ROUTES.previewO); });
        var row = btn.closest('.row, .rrow, .report-row, tr, .card, .item');
        if (row) onClick(row, function () { go(ROUTES.previewO); });
      });
    }
    if (file.indexOf('12-report-preview') === 0) {
      document.querySelectorAll('.btn-ghost').forEach(function (btn) {
        if (/Back/i.test(textOf(btn))) {
          onClick(btn, function () { go(ROUTES.reportsB); });
        }
      });
    }
    if (file.indexOf('15-report-preview') === 0) {
      document.querySelectorAll('.btn-ghost').forEach(function (btn) {
        if (/Back/i.test(textOf(btn))) {
          onClick(btn, function () { go(ROUTES.reportsO); });
        }
      });
    }
  }

  function wireAssurance() {
    if (file.indexOf('22-assurance') === 0 || file.indexOf('23-assurance') === 0) {
      document.querySelectorAll('*').forEach(function (el) {
        if (el.children && el.children.length > 6) return;
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
        var t = textOf(el);
        if (/NCR-00471/i.test(t) && t.length < 120) {
          var row = el.closest('.queue-row, .ncr-row, .row, .item, .card, li, tr') || el;
          if (row && !row.__ncrWired) {
            row.__ncrWired = true;
            onClick(row, function () { go(ROUTES.ncr); });
          }
        }
      });
    }
  }

  function addDemoBadge() {
    if (document.querySelector('.demo-badge')) return;
    var b = document.createElement('div');
    b.className = 'demo-badge';
    b.textContent = 'Demo';
    document.documentElement.classList.add('live-demo-shell');
    document.body.appendChild(b);
  }

  function showDemoToast(msg) {
    var t = document.getElementById('demo-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'demo-toast';
      t.className = 'demo-toast-fallback';
      t.setAttribute('style', 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99998;background:rgba(10,37,64,0.94);color:#E8F4FA;font:600 12.5px Inter,system-ui,sans-serif;padding:10px 18px;border-radius:10px;border:1px solid rgba(0,163,224,0.35);opacity:0;transition:opacity .2s;pointer-events:none;');
      document.body.appendChild(t);
    }
    t.textContent = msg || 'Demo overview only — full GT board not wired for this site';
    t.classList.add('show');
    t.style.opacity = '1';
    clearTimeout(showDemoToast._tm);
    showDemoToast._tm = setTimeout(function () {
      t.classList.remove('show');
      t.style.opacity = '0';
    }, 2200);
  }


  function wireOpenSiteHooks() {
    document.querySelectorAll('[data-demo-nav="open-site"]').forEach(function (el) {
      var s = (el.getAttribute('data-demo-site') || '').toLowerCase();
      if (s === 'oxford') onClick(el, function () { go(ROUTES.oxfordGt); });
      else if (s === 'beckton') onClick(el, function () { go(ROUTES.becktonGt); });
    });
  }

  function wirePortfolio() {
    if (file.indexOf('00-sites-portfolio') !== 0) return;

    document.querySelectorAll('[data-demo-nav="open-site"]').forEach(function (el) {
      var s = (el.getAttribute('data-demo-site') || '').toLowerCase();
      onClick(el, function () {
        if (s === 'oxford') go(ROUTES.oxfordGt);
        else if (s === 'beckton') go(ROUTES.becktonGt);
      });
    });

    // Entire live columns clickable via any cell with data-col + col-live
    document.querySelectorAll('.col-live[data-col="beckton"], [data-col="beckton"].col-live').forEach(function (el) {
      onClick(el, function () { go(ROUTES.becktonGt); });
    });
    document.querySelectorAll('.col-live[data-col="oxford"], [data-col="oxford"].col-live').forEach(function (el) {
      onClick(el, function () { go(ROUTES.oxfordGt); });
    });

    // Demo-only peers — toast / no-op
    document.querySelectorAll('[data-demo-nav="demo-only"], .cell.site-head.col-demo, .demo-muted[data-demo-nav]').forEach(function (el) {
      if (el.__demoWired) return;
      el.__demoWired = true;
      mark(el);
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        showDemoToast('Demo overview only — full GT board not wired for this site');
      });
    });
  }

  function ensureAllSitesNav() {
    // Always keep Portfolio as the first item under Navigate (back to 6-site home).
    if (file.indexOf('01-login') === 0) return;
    if (file.indexOf('00-sites-portfolio') === 0) return;
    var nav = document.querySelector('.rail .nav');
    if (!nav) return;
    var existing = nav.querySelector('[data-demo-nav="portfolio"]');
    var item = existing;
    if (!item) {
      item = document.createElement('div');
      item.className = 'nav-item';
      item.setAttribute('data-demo-nav', 'portfolio');
      item.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="13" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/></svg>Portfolio';
    }
    var label = null;
    var kids = nav.children;
    for (var i = 0; i < kids.length; i++) {
      if (/Navigate/i.test((kids[i].textContent || '').trim()) && kids[i].classList.contains('nav-label')) {
        label = kids[i];
        break;
      }
    }
    var firstAfter = label ? label.nextElementSibling : nav.firstChild;
    if (item.parentNode === nav && firstAfter === item) return;
    if (item.parentNode) item.parentNode.removeChild(item);
    if (label && label.nextSibling) nav.insertBefore(item, label.nextSibling);
    else nav.insertBefore(item, nav.firstChild);
  }

  function ensurePortfolioCrumb() {
    var crumbs = document.querySelector('.crumbs');
    if (!crumbs) return;
    if (/Portfolio/i.test(textOf(crumbs))) return;
    // Prepend Portfolio link for site / region screens
    if (file.indexOf('01-login') === 0 || file.indexOf('00-sites') === 0 || file.indexOf('02-map') === 0) return;
    var span = document.createElement('span');
    span.className = 'demo-crumb demo-linked';
    span.textContent = 'Portfolio';
    span.style.cursor = 'pointer';
    span.style.color = '#7DD3FC';
    span.setAttribute('data-demo-nav', 'portfolio');
    var sep = document.createElement('span');
    sep.className = 'sep';
    sep.textContent = ' / ';
    sep.style.margin = '0 6px';
    sep.style.opacity = '0.45';
    crumbs.insertBefore(sep, crumbs.firstChild);
    crumbs.insertBefore(span, crumbs.firstChild);
    onClick(span, function () { go(ROUTES.portfolio); });
  }

  function wireBriefLinks() {
    document.querySelectorAll('a[data-demo-nav="brief"], .brief-link').forEach(function (el) {
      if (el.closest('.rail')) return;
      onClick(el, function () { go(ROUTES.briefB); });
    });
  }

  function init() {
    addDemoBadge();
    ensureAllSitesNav();
    wireLogout();
    wireSiteRail();
    ensurePortfolioCrumb();
    wireCrumbs();
    wireLogin();
    wirePortfolio();
    wireOpenSiteHooks();
    wireMapHome();
    wireRegionLondon();
    wireRegionTV();
    wireBecktonGt();
    wireOxfordGt();
    wireNcr();
    wireContractor();
    wireVisuals();
    wireCamDetail();
    wireReports();
    wireAssurance();
    wireBriefLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
