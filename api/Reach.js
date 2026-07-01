// Reach — draw a normal-move (green) and pushed-move (yellow) ring anchored at a
// token's current position, so a player can see how far they can go BEFORE moving.
// Roll20 Mod (API) script.  Usage:  !reach   |   !reach off
//
// Rings are static map drawings anchored at the start spot (unlike auras, which
// follow the token). They auto-clear when the token is dropped.
// !reach off purges ALL reach-colored rings on every page (catches orphans).
on('ready', function () {
  'use strict';

  const MOVE_ATTR        = 'move';    // character attribute: movement rate (MP inches)
  const SQUARES_PER_MOVE = 1;         // grid squares of reach per 1 point of Move (MP: 1" = 1 square)
  const PUSH_MULT        = 2;         // pushed reach = rate * this
  const OK_COLOR         = '#33dd44'; // normal-move ring
  const PUSH_COLOR       = '#f4d03f'; // pushed-move ring
  const STROKE           = 3;
  const SEGMENTS         = 64;        // circle smoothness
  const CLEAR_ON_MOVE    = true;      // remove rings once the token is dropped
  const LAYER            = 'map';     // map layer = players can't grab the rings

  if (!state.MoveReach) state.MoveReach = { rings: {} };

  // pixels per grid square (Move is in squares, NOT page ruler units — no scale_number)
  function gridPx(pageid) {
    const p = getObj('page', pageid);
    if (!p) return null;
    return 70 * (parseFloat(p.get('snapping_increment')) || 1);
  }

  function circlePath(rPx) {
    const pts = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const a = (i / SEGMENTS) * 2 * Math.PI;
      pts.push([i ? 'L' : 'M',
        +(rPx + rPx * Math.cos(a)).toFixed(2),
        +(rPx + rPx * Math.sin(a)).toFixed(2)]);
    }
    return JSON.stringify(pts);
  }

  function ring(pageid, cx, cy, rPx, color) {
    return createObj('path', {
      pageid: pageid, layer: LAYER,
      left: cx, top: cy, width: 2 * rPx, height: 2 * rPx,
      stroke: color, stroke_width: STROKE, fill: 'transparent',
      _path: circlePath(rPx)
    });
  }

  // remove only the rings tracked for one token (used on redraw / on move)
  function clearRings(tokId) {
    (state.MoveReach.rings[tokId] || []).forEach(function (id) {
      const o = getObj('path', id);
      if (o) o.remove();
    });
    delete state.MoveReach.rings[tokId];
  }

  // remove EVERY reach-colored ring on every page, tracked or orphaned
  function purgeAll() {
    let n = 0;
    findObjs({ type: 'path' }).forEach(function (p) {
      const s = String(p.get('stroke') || '').toLowerCase();
      if (s === OK_COLOR.toLowerCase() || s === PUSH_COLOR.toLowerCase()) { p.remove(); n++; }
    });
    state.MoveReach.rings = {};
    return n;
  }

  function selGraphics(msg) {
    return (msg.selected || [])
      .filter(function (s) { return s._type === 'graphic'; })
      .map(function (s) { return getObj('graphic', s._id); })
      .filter(Boolean);
  }

  on('chat:message', function (msg) {
    if (msg.type !== 'api' || msg.content.indexOf('!reach') !== 0) return;
    const who = (msg.who || 'gm').replace(/ \(GM\)$/, '');
    const off = /\b(off|clear)\b/i.test(msg.content);

    if (off) {
      const n = purgeAll();
      sendChat('Reach', '/w "' + who + '" Cleared ' + n + ' ring(s).');
      return;
    }

    const toks = selGraphics(msg);
    if (!toks.length) { sendChat('Reach', '/w "' + who + '" Select a token first.'); return; }

    let drew = false;
    toks.forEach(function (tok) {
      clearRings(tok.id);
      const cid = tok.get('represents');
      const rate = cid ? (parseFloat(getAttrByName(cid, MOVE_ATTR)) || 0) : 0;
      if (rate <= 0) return;
      const px = gridPx(tok.get('pageid'));
      if (!px) return;
      const cx = tok.get('left'), cy = tok.get('top'), pg = tok.get('pageid');
      const rPx = rate * SQUARES_PER_MOVE * px;
      const g = ring(pg, cx, cy, rPx, OK_COLOR);
      const y = ring(pg, cx, cy, rPx * PUSH_MULT, PUSH_COLOR);
      state.MoveReach.rings[tok.id] = [g.id, y.id];
      drew = true;
    });
    if (!drew) sendChat('Reach', '/w "' + who + '" No selected token had a "' + MOVE_ATTR + '" rate.');
  });

  if (CLEAR_ON_MOVE) {
    on('change:graphic', function (obj, prev) {
      if (!state.MoveReach.rings[obj.id]) return;
      if (obj.get('left') !== prev.left || obj.get('top') !== prev.top) clearRings(obj.id);
    });
  }
});
