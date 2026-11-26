/* ============================================================
   Breadboard Lab · circuit engine
   Board geometry → connectivity → DC nodal analysis → logic
   ============================================================ */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const BBL = (root.BBL = root.BBL || {});

  const PITCH = 13;
  const BOARD_W = 866;
  const BOARD_H = 236;
  const ROWS_TOP = ['A', 'B', 'C', 'D', 'E'];
  const ROWS_BOTTOM = ['F', 'G', 'H', 'I', 'J'];
  const ROW_Y = { A: 52, B: 65, C: 78, D: 91, E: 104, F: 132, G: 145, H: 158, I: 171, J: 184 };

  const IC_GATES = {
    ic74hc08: { label: '74HC08', sub: 'QUAD AND', op: 'AND', gates: [{ a: 1, b: 2, y: 3 }, { a: 4, b: 5, y: 6 }, { a: 9, b: 10, y: 8 }, { a: 12, b: 13, y: 11 }] },
    ic74hc32: { label: '74HC32', sub: 'QUAD OR', op: 'OR', gates: [{ a: 1, b: 2, y: 3 }, { a: 4, b: 5, y: 6 }, { a: 9, b: 10, y: 8 }, { a: 12, b: 13, y: 11 }] },
    ic74hc86: { label: '74HC86', sub: 'QUAD XOR', op: 'XOR', gates: [{ a: 1, b: 2, y: 3 }, { a: 4, b: 5, y: 6 }, { a: 9, b: 10, y: 8 }, { a: 12, b: 13, y: 11 }] },
    ic74hc02: { label: '74HC02', sub: 'QUAD NOR', op: 'NOR', gates: [{ a: 2, b: 3, y: 1 }, { a: 5, b: 6, y: 4 }, { a: 8, b: 9, y: 10 }, { a: 11, b: 12, y: 13 }] },
    ic74hc04: { label: '74HC04', sub: 'HEX NOT', op: 'NOT', gates: [{ a: 1, y: 2 }, { a: 3, y: 4 }, { a: 5, y: 6 }, { a: 9, y: 8 }, { a: 11, y: 10 }, { a: 13, y: 12 }] },
    ic74hc20: { label: '74HC20', sub: 'DUAL 4-INPUT NAND', op: 'NAND4', gates: [{ a: 1, b: 2, c: 4, d: 5, y: 6 }, { a: 13, b: 12, c: 10, d: 9, y: 8 }] },
    ic74hc21: { label: '74HC21', sub: 'DUAL 4-INPUT AND', op: 'AND4', gates: [{ a: 1, b: 2, c: 4, d: 5, y: 6 }, { a: 13, b: 12, c: 10, d: 9, y: 8 }] }
  };

  function icPins() {
    const pins = [];
    for (let i = 1; i <= 7; i++) pins.push({ id: String(i), x: (i - 4) * PITCH, y: 14, side: 'bottom' });
    for (let i = 8; i <= 14; i++) pins.push({ id: String(i), x: (11 - i) * PITCH, y: -14, side: 'top' });
    return pins;
  }

  const DEFS = {
    resistor: { name: '电阻', pins: [{ id: '1', x: -26, y: 0 }, { id: '2', x: 26, y: 0 }], props: { resistance: 220 }, bounds: { x: -31, y: -19, w: 62, h: 23 } },
    led: { name: 'LED', pins: [{ id: 'a', x: -13, y: 0 }, { id: 'k', x: 13, y: 0 }], props: { color: 'red' }, bounds: { x: -16, y: -38, w: 32, h: 42 } },
    button: { name: '按钮', pins: [{ id: '1', x: -13, y: 0 }, { id: '2', x: 13, y: 0 }], props: { pressed: false }, bounds: { x: -18, y: -35, w: 36, h: 39 } },
    potentiometer: { name: '电位器', pins: [{ id: '1', x: -13, y: 0 }, { id: '2', x: 0, y: 0 }, { id: '3', x: 13, y: 0 }], props: { position: 50, resistance: 10000 }, bounds: { x: -19, y: -34, w: 38, h: 38 } },
    capacitor: { name: '电容', pins: [{ id: '1', x: -13, y: 0 }, { id: '2', x: 13, y: 0 }], props: { capacitance: 100e-9 }, bounds: { x: -15, y: -38, w: 30, h: 42 } },
    'slide-switch': { name: '滑动开关', pins: [{ id: '1', x: -13, y: 0 }, { id: '2', x: 0, y: 0 }, { id: '3', x: 13, y: 0 }], props: { position: 1 }, bounds: { x: -19, y: -33, w: 38, h: 37 } },
    buzzer: { name: '蜂鸣器', pins: [{ id: '+', x: -13, y: 0 }, { id: '-', x: 13, y: 0 }], props: {}, bounds: { x: -16, y: -37, w: 32, h: 41 } },
    'power-supply': { name: '可调电源', pins: [{ id: 'V+', x: 22, y: 7 }, { id: 'GND', x: 10, y: 7 }], props: { voltage: 5 }, bounds: { x: -39, y: -30, w: 70, h: 43 } },
    'battery-9v': { name: '9V 电池', pins: [{ id: '+', x: -13, y: 0 }, { id: '-', x: 13, y: 0 }], props: {}, bounds: { x: -17, y: -40, w: 34, h: 44 } },
    'coin-cell': { name: '3V 纽扣电池', pins: [{ id: '+', x: -13, y: 0 }, { id: '-', x: 13, y: 0 }], props: {}, bounds: { x: -16, y: -35, w: 32, h: 39 } },
    'aa-battery': { name: '1.5V 电池', pins: [{ id: '+', x: -13, y: 0 }, { id: '-', x: 13, y: 0 }], props: {}, bounds: { x: -11, y: -39, w: 22, h: 43 } },
    ic74hc08: { name: '74HC08', pins: icPins(), props: { label: '74HC08', sub: 'QUAD 2-INPUT' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    ic74hc32: { name: '74HC32', pins: icPins(), props: { label: '74HC32', sub: 'QUAD 2-INPUT' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    ic74hc04: { name: '74HC04', pins: icPins(), props: { label: '74HC04', sub: 'HEX INVERTER' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    ic74hc86: { name: '74HC86', pins: icPins(), props: { label: '74HC86', sub: 'QUAD 2-INPUT' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    ic74hc02: { name: '74HC02', pins: icPins(), props: { label: '74HC02', sub: 'QUAD 2-INPUT' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    ic74hc20: { name: '74HC20', pins: icPins(), props: { label: '74HC20', sub: 'DUAL 4-INPUT' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    ic74hc21: { name: '74HC21', pins: icPins(), props: { label: '74HC21', sub: 'DUAL 4-INPUT' }, bounds: { x: -49, y: -21, w: 98, h: 42 } },
    'arduino-uno': { name: 'Arduino Uno', pins: [{ id: '5v', x: 30, y: 34 }, { id: 'gnd', x: 18, y: 34 }, { id: 'd13', x: 6, y: 34 }, { id: 'd9', x: -6, y: 34 }, { id: 'd2', x: -18, y: 34 }, { id: 'a0', x: -30, y: 34 }], props: {}, bounds: { x: -56, y: -33, w: 112, h: 71 } },
    microbit: { name: 'micro:bit', pins: [{ id: '3v', x: -12, y: 32 }, { id: 'gnd', x: 0, y: 32 }, { id: 'p0', x: 12, y: 32 }], props: {}, bounds: { x: -35, y: -31, w: 70, h: 66 } },
    'dc-motor': { name: '直流电机', pins: [{ id: '1', x: -13, y: 0 }, { id: '2', x: 13, y: 0 }], props: {}, bounds: { x: -21, y: -33, w: 42, h: 37 } },
    servo: { name: '微型伺服', pins: [{ id: 'gnd', x: -12, y: 17 }, { id: 'vcc', x: 0, y: 17 }, { id: 'sig', x: 12, y: 17 }], props: {}, bounds: { x: -21, y: -33, w: 42, h: 53 } },
    'vibration-motor': { name: '振动电机', pins: [{ id: '+', x: -13, y: 0 }, { id: '-', x: 13, y: 0 }], props: {}, bounds: { x: -17, y: -36, w: 34, h: 40 } }
  };

  const SOURCE_TYPES = {
    'power-supply': { v: function (p) { return p.voltage || 5; }, r: 0.15, plus: 'V+', minus: 'GND' },
    'battery-9v': { v: function () { return 9; }, r: 0.5, plus: '+', minus: '-' },
    'coin-cell': { v: function () { return 3; }, r: 12, plus: '+', minus: '-' },
    'aa-battery': { v: function () { return 1.5; }, r: 0.3, plus: '+', minus: '-' },
    'arduino-uno': { v: function () { return 5; }, r: 0.3, plus: '5v', minus: 'gnd' },    microbit: { v: function () { return 3; }, r: 0.3, plus: '3v', minus: 'gnd' }
  };

  const LED_VF = { red: 1.9, green: 2.1, yellow: 2.0, blue: 3.0 };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  let uidCounter = 1;
  function uid(prefix) { return (prefix || 'c') + (uidCounter++); }

  /* ------------------------------------------------------------
     Geometry
     ------------------------------------------------------------ */
  function makeBoard(x, y) {
    return { x: x == null ? 70 : x, y: y == null ? 310 : y, w: BOARD_W, h: BOARD_H };
  }

  function boardHoles(board) {
    const holes = [];
    const xAt = function (col) { return board.x + 30 + (col - 1) * PITCH; };
    const add = function (id, x, y, net, extra) {
      holes.push(Object.assign({ id: id, x: x, y: y, net: net }, extra || {}));
    };
    const railY = {
      tp: board.y + 16, tm: board.y + 28, bp: board.y + 214, bm: board.y + 202
    };
    const railName = { tp: 'top+', tm: 'top−', bp: 'bot+', bm: 'bot−' };
    Object.keys(railY).forEach(function (rail) {
      for (let c = 7; c <= 56; c++) {
        add('r:' + rail + ':' + c, xAt(c), railY[rail], 'rail:' + rail, { kind: 'rail', rail: rail, railName: railName[rail], col: c });
      }
    });
    for (let c = 1; c <= 63; c++) {
      for (let r = 0; r < 10; r++) {
        const half = r < 5 ? 'top' : 'bottom';
        add('m:' + c + ':' + r, xAt(c), board.y + ROW_Y[ROWS_TOP.concat(ROWS_BOTTOM)[r]], 'main:' + half + ':' + c, {
          kind: 'main', row: r, col: c, rowName: ROWS_TOP.concat(ROWS_BOTTOM)[r]
        });
      }
    }
    return holes;
  }

  function holeIndex(board) {
    const map = {};
    boardHoles(board).forEach(function (h) { map[h.id] = h; });
    return map;
  }

  function rotatePoint(x, y, deg) {
    const a = (deg || 0) * Math.PI / 180;
    const c = Math.cos(a), s = Math.sin(a);
    return { x: x * c - y * s, y: x * s + y * c };
  }

  function pinLocal(comp, pinId) {
    const def = DEFS[comp.type];
    if (!def) return null;
    return def.pins.find(function (p) { return String(p.id) === String(pinId); }) || null;
  }

  function pinWorld(comp, pin) {
    const p = rotatePoint(pin.x, pin.y, comp.rotation || 0);
    return { x: comp.x + p.x, y: comp.y + p.y };
  }

  function allPinsWorld(scene, comp) {
    const def = DEFS[comp.type];
    if (!def) return [];
    return def.pins.map(function (p) {
      const w = pinWorld(comp, p);
      return { id: p.id, x: w.x, y: w.y, localX: p.x, localY: p.y, side: p.side };
    });
  }

  function nearestHole(scene, x, y, radius) {
    const holes = scene._holes || (scene._holes = boardHoles(scene.board));
    const r = radius == null ? 7 : radius;
    let best = null, bestD = r * r;
    for (let i = 0; i < holes.length; i++) {
      const h = holes[i];
      const dx = h.x - x, dy = h.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = h; }
    }
    return best;
  }

  function snapComponent(scene, comp, threshold) {
    const pins = allPinsWorld(scene, comp);
    if (!pins.length) return false;
    const lim = threshold == null ? 11 : threshold;
    let best = null, bestD = lim * lim;
    pins.forEach(function (p) {
      const h = nearestHole(scene, p.x, p.y, lim);
      if (h) {
        const d = (h.x - p.x) * (h.x - p.x) + (h.y - p.y) * (h.y - p.y);
        if (d < bestD) { bestD = d; best = { h: h, p: p }; }
      }
    });
    if (!best) return false;
    comp.x += best.h.x - best.p.x;
    comp.y += best.h.y - best.p.y;
    return true;
  }

  function bindings(scene, radius) {
    const holes = scene._holes || (scene._holes = boardHoles(scene.board));
    const result = {};
    scene.components.forEach(function (comp) {
      const map = {};
      allPinsWorld(scene, comp).forEach(function (p) {
        let best = null, bestD = (radius == null ? 6.8 : radius);
        bestD *= bestD;
        for (let i = 0; i < holes.length; i++) {
          const h = holes[i];
          const dx = h.x - p.x, dy = h.y - p.y;
          const d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = h; }
        }
        if (best) map[p.id] = best.id;
      });
      result[comp.id] = map;
    });
    return result;
  }

  /* ------------------------------------------------------------
     Scene / components
     ------------------------------------------------------------ */
  function createComponent(type, x, y, props) {
    const def = DEFS[type];
    if (!def) throw new Error('Unknown component: ' + type);
    const comp = {
      id: uid(type.replace(/[^a-z0-9]/gi, '').slice(0, 8)),
      type: type,
      x: Math.round(x),
      y: Math.round(y),
      rotation: 0,
      props: Object.assign({}, clone(def.props), props || {})
    };
    return comp;
  }

  function addComp(scene, comp) {
    scene.components.push(comp);
    return comp;
  }

  function wire(scene, aComp, aPin, bComp, bPin, color) {
    const w = {
      id: uid('w'),
      a: { kind: 'pin', comp: aComp, pin: aPin },
      b: { kind: 'pin', comp: bComp, pin: bPin },
      color: color || 'green'
    };
    scene.wires.push(w);
    return w;
  }

  function wireHole(scene, aComp, aPin, hole, color) {
    const w = {
      id: uid('w'),
      a: { kind: 'pin', comp: aComp, pin: aPin },
      b: { kind: 'hole', hole: hole },
      color: color || 'green'
    };
    scene.wires.push(w);
    return w;
  }

  function baseScene(name) {
    return {
      version: 1,
      name: name || '未命名电路',
      board: makeBoard(70, 310),
      components: [],
      wires: []
    };
  }

  function addShowcaseICs(scene) {
    const list = [
      ['ic74hc08', 190, 100], ['ic74hc04', 350, 100], ['ic74hc32', 510, 100],
      ['ic74hc86', 270, 180], ['ic74hc02', 430, 180]
    ];
    list.forEach(function (it, i) {
      const c = createComponent(it[0], it[1], it[2]);
      c.id = 'chip' + (i + 1);
      c.props.label = IC_GATES[it[0]].label;
      scene.components.push(c);
    });
  }

  const Templates = {};

  Templates['led-basic'] = function () {
    const s = baseScene('实验一 · 点亮第一颗 LED');
    s.template = 'led-basic';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 });
    psu.id = 'psu1';
    const r = createComponent('resistor', 256, 388, { resistance: 220 });
    r.id = 'r1';
    const led = createComponent('led', 347, 401, { color: 'red' });
    led.id = 'led1';
    s.components.push(psu, r, led);
    wire(s, 'psu1', 'V+', 'r1', '1', 'red');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    addShowcaseICs(s);
    return s;
  };

  Templates['blank'] = function () {
    const s = baseScene('自由实验 · 空白画布');
    s.template = 'blank';
    return s;
  };

  Templates['free-start'] = function () {
    const s = baseScene('自由实验 · 起步电路');
    s.template = 'free-start';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 });
    psu.id = 'psu1';
    s.components.push(psu);
    return s;
  };

  Templates['button-led'] = function () {
    const s = baseScene('实验二 · 按钮控制 LED');
    s.template = 'button-led';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const btn = createComponent('button', 243, 388, { pressed: false }); btn.id = 'btn1';
    const r = createComponent('resistor', 334, 401, { resistance: 220 }); r.id = 'r1';
    const led = createComponent('led', 425, 388, { color: 'green' }); led.id = 'led1';
    s.components.push(psu, btn, r, led);
    wire(s, 'psu1', 'V+', 'btn1', '1', 'red');
    wire(s, 'btn1', '2', 'r1', '1', 'green');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['pot-led'] = function () {
    const s = baseScene('实验三 · 电位器调光');
    s.template = 'pot-led';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const pot = createComponent('potentiometer', 243, 388, { position: 5 }); pot.id = 'pot1';
    const r = createComponent('resistor', 334, 401, { resistance: 220 }); r.id = 'r1';
    const led = createComponent('led', 425, 388, { color: 'yellow' }); led.id = 'led1';
    s.components.push(psu, pot, r, led);
    wire(s, 'psu1', 'V+', 'pot1', '1', 'red');
    wire(s, 'pot1', '2', 'r1', '1', 'green');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    return s;
  };

  function gateDemo(type, name, template) {
    const s = baseScene(name);
    s.template = template;
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const swA = createComponent('slide-switch', 165, 362, { position: 1 }); swA.id = 'swA';
    const swB = createComponent('slide-switch', 256, 388, { position: 1 }); swB.id = 'swB';
    const ic = createComponent(type, 477, 428);
    ic.id = 'ic1';
    const r = createComponent('resistor', 568, 455, { resistance: 220 }); r.id = 'r1';
    const led = createComponent('led', 659, 442, { color: 'green' }); led.id = 'led1';
    s.components.push(psu, swA, swB, ic, r, led);
    // switches: pin 1 = 5V, pin 3 = GND, pin 2 = signal
    wire(s, 'psu1', 'V+', 'swA', '1', 'red');
    wire(s, 'psu1', 'V+', 'swB', '1', 'red');
    wire(s, 'swA', '3', 'psu1', 'GND', 'black');
    wire(s, 'swB', '3', 'psu1', 'GND', 'black');
    // IC power
    wire(s, 'psu1', 'V+', 'ic1', '14', 'red');
    wire(s, 'ic1', '7', 'psu1', 'GND', 'black');
    // inputs: gate 1 pins 1,2
    wire(s, 'swA', '2', 'ic1', type === 'ic74hc02' ? '2' : '1', 'green');
    wire(s, 'swB', '2', 'ic1', type === 'ic74hc02' ? '3' : '2', 'green');
    // output
    const outPin = IC_GATES[type].gates[0].y;
    wire(s, 'ic1', String(outPin), 'r1', '1', 'green');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    return s;
  }

  Templates['and-gate'] = function () { return gateDemo('ic74hc08', '实验四 · 与门 AND', 'and-gate'); };
  Templates['or-gate'] = function () { return gateDemo('ic74hc32', '实验五 · 或门 OR', 'or-gate'); };
  Templates['not-gate'] = function () {
    const s = baseScene('实验六 · 非门 NOT');
    s.template = 'not-gate';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const sw = createComponent('slide-switch', 190, 388, { position: 1 }); sw.id = 'swA';
    const ic = createComponent('ic74hc04', 477, 428); ic.id = 'ic1';
    const r = createComponent('resistor', 568, 455, { resistance: 220 }); r.id = 'r1';
    const led = createComponent('led', 659, 442, { color: 'red' }); led.id = 'led1';
    s.components.push(psu, sw, ic, r, led);
    wire(s, 'psu1', 'V+', 'swA', '1', 'red');
    wire(s, 'swA', '3', 'psu1', 'GND', 'black');
    wire(s, 'psu1', 'V+', 'ic1', '14', 'red');
    wire(s, 'ic1', '7', 'psu1', 'GND', 'black');
    wire(s, 'swA', '2', 'ic1', '1', 'green');
    wire(s, 'ic1', '2', 'r1', '1', 'green');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['nor-gate'] = function () {
    return gateDemo('ic74hc02', '实验七 · 或非门 NOR', 'nor-gate');
  };

  function labChipDemo(type, name, template, opts) {
    opts = opts || {};
    const s = baseScene(name);
    s.template = template;
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const swA = createComponent('slide-switch', 165, 362, { position: 1, label: 'A' }); swA.id = 'swA';
    const swB = opts.oneInput ? null : createComponent('slide-switch', 256, 388, { position: 1, label: 'B' }); if (swB) swB.id = 'swB';
    const ic = createComponent(type, 477, 428); ic.id = 'ic1';
    const r = createComponent('resistor', 568, 455, { resistance: 1000 }); r.id = 'r1';
    const led = createComponent('led', 659, 442, { color: opts.ledColor || 'green' }); led.id = 'led1';
    s.components.push(psu, swA, ic, r, led);
    if (swB) s.components.push(swB);
    wire(s, 'psu1', 'V+', 'swA', '1', 'red');
    wire(s, 'swA', '3', 'psu1', 'GND', 'black');
    if (swB) {
      wire(s, 'psu1', 'V+', 'swB', '1', 'red');
      wire(s, 'swB', '3', 'psu1', 'GND', 'black');
    }
    wire(s, 'psu1', 'V+', 'ic1', '14', 'red');
    wire(s, 'ic1', '7', 'psu1', 'GND', 'black');
    wire(s, 'swA', '2', 'ic1', '1', 'green');
    if (swB) wire(s, 'swB', '2', 'ic1', '2', 'green');
    if (opts.fourInput) {
      // 74HC20 / 74HC21: unused C and D inputs must be tied high
      wire(s, 'psu1', 'V+', 'ic1', '4', 'red');
      wire(s, 'psu1', 'V+', 'ic1', '5', 'red');
      wire(s, 'ic1', '6', 'r1', '1', 'green');
    } else {
      const outPin = IC_GATES[type].gates[0].y;
      wire(s, 'ic1', String(outPin), 'r1', '1', 'green');
    }
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    return s;
  }

  Templates['lab01-led'] = function () {
    const s = baseScene('Lab 01 · 电源、面包板与 LED');
    s.template = 'lab01-led';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const r = createComponent('resistor', 256, 388, { resistance: 1000 }); r.id = 'r1';
    const led = createComponent('led', 347, 401, { color: 'red' }); led.id = 'led1';
    s.components.push(psu, r, led);
    wire(s, 'psu1', 'V+', 'r1', '1', 'red');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    return s;
  };
  Templates['lab01-nand'] = function () { return labChipDemo('ic74hc20', 'Lab 01 · 74HC20 NAND', 'lab01-nand', { fourInput: true, ledColor: 'red' }); };
  Templates['lab01-not'] = function () { return labChipDemo('ic74hc04', 'Lab 01 · 74HC04 NOT', 'lab01-not', { oneInput: true, ledColor: 'green' }); };
  Templates['lab01-and'] = function () { return labChipDemo('ic74hc21', 'Lab 01 · 74HC21 AND', 'lab01-and', { fourInput: true, ledColor: 'green' }); };
  Templates['lab01-xor'] = function () { return labChipDemo('ic74hc86', 'Lab 01 · 74HC86 XOR', 'lab01-xor', { ledColor: 'yellow' }); };
  Templates['lab01-or'] = function () { return labChipDemo('ic74hc32', 'Lab 01 · 74HC32 OR', 'lab01-or', { ledColor: 'green' }); };

  Templates['alarm'] = function () {
    const s = baseScene('项目 · 双条件报警器');
    s.template = 'alarm';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const swA = createComponent('slide-switch', 165, 362, { position: 1 }); swA.id = 'swA';
    const swB = createComponent('slide-switch', 256, 388, { position: 1 }); swB.id = 'swB';
    const ic = createComponent('ic74hc08', 477, 428); ic.id = 'ic1';
    const buz = createComponent('buzzer', 620, 442); buz.id = 'buz1';
    s.components.push(psu, swA, swB, ic, buz);
    wire(s, 'psu1', 'V+', 'swA', '1', 'red');
    wire(s, 'psu1', 'V+', 'swB', '1', 'red');
    wire(s, 'swA', '3', 'psu1', 'GND', 'black');
    wire(s, 'swB', '3', 'psu1', 'GND', 'black');
    wire(s, 'psu1', 'V+', 'ic1', '14', 'red');
    wire(s, 'ic1', '7', 'psu1', 'GND', 'black');
    wire(s, 'swA', '2', 'ic1', '1', 'green');
    wire(s, 'swB', '2', 'ic1', '2', 'green');
    wire(s, 'ic1', '3', 'buz1', '+', 'green');
    wire(s, 'buz1', '-', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['motor'] = function () {
    const s = baseScene('实验八 · 电机与开关');
    s.template = 'motor';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const sw = createComponent('slide-switch', 243, 401, { position: 1 }); sw.id = 'sw1';
    const m = createComponent('dc-motor', 390, 401); m.id = 'm1';
    s.components.push(psu, sw, m);
    wire(s, 'psu1', 'V+', 'sw1', '1', 'red');
    wire(s, 'sw1', '2', 'm1', '1', 'green');
    wire(s, 'm1', '2', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['servo'] = function () {
    const s = baseScene('实验九 · 伺服电机');
    s.template = 'servo';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const sv = createComponent('servo', 390, 383); sv.id = 'sv1';
    const pot = createComponent('potentiometer', 243, 401, { position: 50 }); pot.id = 'pot1';
    s.components.push(psu, sv, pot);
    wire(s, 'psu1', 'V+', 'sv1', 'vcc', 'red');
    wire(s, 'sv1', 'gnd', 'psu1', 'GND', 'black');
    wire(s, 'psu1', 'V+', 'pot1', '1', 'red');
    wire(s, 'pot1', '3', 'psu1', 'GND', 'black');
    wire(s, 'pot1', '2', 'sv1', 'sig', 'green');
    return s;
  };

  Templates['arduino-blink'] = function () {
    const s = baseScene('Arduino 编程 · 闪烁与调光');
    s.template = 'arduino-blink';
    const uno = createComponent('arduino-uno', 150, 155); uno.id = 'uno1';
    const r13 = createComponent('resistor', 503, 388, { resistance: 220 }); r13.id = 'r13';
    const led13 = createComponent('led', 594, 401, { color: 'red' }); led13.id = 'led13';
    const r9 = createComponent('resistor', 685, 388, { resistance: 220 }); r9.id = 'r9';
    const led9 = createComponent('led', 776, 401, { color: 'green' }); led9.id = 'led9';
    const btn = createComponent('button', 256, 401, { pressed: false }); btn.id = 'btn1';
    const pot = createComponent('potentiometer', 334, 388, { position: 50 }); pot.id = 'pot1';
    s.components.push(uno, r13, led13, r9, led9, btn, pot);
    wire(s, 'uno1', 'd13', 'r13', '1', 'green');
    wire(s, 'r13', '2', 'led13', 'a', 'green');
    wire(s, 'led13', 'k', 'uno1', 'gnd', 'black');
    wire(s, 'uno1', 'd9', 'r9', '1', 'green');
    wire(s, 'r9', '2', 'led9', 'a', 'green');
    wire(s, 'led9', 'k', 'uno1', 'gnd', 'black');
    wire(s, 'uno1', '5v', 'pot1', '1', 'red');
    wire(s, 'pot1', '3', 'uno1', 'gnd', 'black');
    wire(s, 'pot1', '2', 'uno1', 'a0', 'green');
    wire(s, 'uno1', 'd2', 'btn1', '1', 'green');
    wire(s, 'btn1', '2', 'uno1', 'gnd', 'black');
    return s;
  };

  Templates['half-adder'] = function () {
    const s = baseScene('实验十 · 半加器');
    s.template = 'half-adder';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const swA = createComponent('slide-switch', 165, 362, { position: 1 }); swA.id = 'swA';
    const swB = createComponent('slide-switch', 256, 401, { position: 1 }); swB.id = 'swB';
    const xor = createComponent('ic74hc86', 420, 428); xor.id = 'xor1';
    const and = createComponent('ic74hc08', 740, 428); and.id = 'and1';
    const r1 = createComponent('resistor', 500, 468, { resistance: 220 }); r1.id = 'r1';
    const led1 = createComponent('led', 545, 481, { color: 'green' }); led1.id = 'led1';
    const r2 = createComponent('resistor', 820, 468, { resistance: 220 }); r2.id = 'r2';
    const led2 = createComponent('led', 870, 481, { color: 'yellow' }); led2.id = 'led2';
    s.components.push(psu, swA, swB, xor, and, r1, led1, r2, led2);
    // switches
    wire(s, 'psu1', 'V+', 'swA', '1', 'red');
    wire(s, 'psu1', 'V+', 'swB', '1', 'red');
    wire(s, 'swA', '3', 'psu1', 'GND', 'black');
    wire(s, 'swB', '3', 'psu1', 'GND', 'black');
    // power both ICs
    ['xor1', 'and1'].forEach(function (ic) {
      wire(s, 'psu1', 'V+', ic, '14', 'red');
      wire(s, ic, '7', 'psu1', 'GND', 'black');
    });
    // A/B to both chips
    wire(s, 'swA', '2', 'xor1', '1', 'green');
    wire(s, 'swB', '2', 'xor1', '2', 'green');
    wire(s, 'swA', '2', 'and1', '1', 'green');
    wire(s, 'swB', '2', 'and1', '2', 'green');
    // sum and carry
    wire(s, 'xor1', '3', 'r1', '1', 'green');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    wire(s, 'and1', '3', 'r2', '1', 'green');
    wire(s, 'r2', '2', 'led2', 'a', 'green');
    wire(s, 'led2', 'k', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['lab02-half'] = function () {
    const s = baseScene('Lab 02 · 半加器 Half Adder');
    s.template = 'lab02-half';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    const swA = createComponent('slide-switch', 165, 362, { position: 1, label: 'A' }); swA.id = 'swA';
    const swB = createComponent('slide-switch', 256, 401, { position: 1, label: 'B' }); swB.id = 'swB';
    const xor = createComponent('ic74hc86', 420, 428); xor.id = 'xor1';
    const and = createComponent('ic74hc08', 740, 428); and.id = 'and1';
    const r1 = createComponent('resistor', 500, 468, { resistance: 1000 }); r1.id = 'r1';
    const led1 = createComponent('led', 545, 481, { color: 'green' }); led1.id = 'led1';
    const r2 = createComponent('resistor', 820, 468, { resistance: 1000 }); r2.id = 'r2';
    const led2 = createComponent('led', 870, 481, { color: 'yellow' }); led2.id = 'led2';
    s.components.push(psu, swA, swB, xor, and, r1, led1, r2, led2);
    wire(s, 'psu1', 'V+', 'swA', '1', 'red');
    wire(s, 'psu1', 'V+', 'swB', '1', 'red');
    wire(s, 'swA', '3', 'psu1', 'GND', 'black');
    wire(s, 'swB', '3', 'psu1', 'GND', 'black');
    ['xor1', 'and1'].forEach(function (id) {
      wire(s, 'psu1', 'V+', id, '14', 'red');
      wire(s, id, '7', 'psu1', 'GND', 'black');
    });
    wire(s, 'swA', '2', 'xor1', '1', 'green');
    wire(s, 'swB', '2', 'xor1', '2', 'green');
    wire(s, 'swA', '2', 'and1', '1', 'green');
    wire(s, 'swB', '2', 'and1', '2', 'green');
    wire(s, 'xor1', '3', 'r1', '1', 'green');
    wire(s, 'r1', '2', 'led1', 'a', 'green');
    wire(s, 'led1', 'k', 'psu1', 'GND', 'black');
    wire(s, 'and1', '3', 'r2', '1', 'green');
    wire(s, 'r2', '2', 'led2', 'a', 'green');
    wire(s, 'led2', 'k', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['lab02-full'] = function () {
    const s = baseScene('Lab 02 · 全加器 Full Adder');
    s.template = 'lab02-full';
    const psu = createComponent('power-supply', 24, 480, { voltage: 5 }); psu.id = 'psu1';
    // three packages: 74HC86 has two XOR gates, 74HC08 has two AND gates, 74HC32 has the final OR
    const xor = createComponent('ic74hc86', 300, 428); xor.id = 'xor1';
    const and = createComponent('ic74hc08', 520, 428); and.id = 'and1';
    const or = createComponent('ic74hc32', 740, 428); or.id = 'or1';
    const swA = createComponent('slide-switch', 120, 120, { position: 1, label: 'A' }); swA.id = 'swA';
    const swB = createComponent('slide-switch', 240, 120, { position: 1, label: 'B' }); swB.id = 'swB';
    const swC = createComponent('slide-switch', 360, 120, { position: 1, label: 'Cin' }); swC.id = 'swCin';
    const rSum = createComponent('resistor', 480, 180, { resistance: 1000 }); rSum.id = 'rSum';
    const ledSum = createComponent('led', 570, 167, { color: 'green' }); ledSum.id = 'ledSum';
    const rCout = createComponent('resistor', 480, 260, { resistance: 1000 }); rCout.id = 'rCout';
    const ledCout = createComponent('led', 570, 247, { color: 'yellow' }); ledCout.id = 'ledCout';
    s.components.push(psu, xor, and, or, swA, swB, swC, rSum, ledSum, rCout, ledCout);
    // input switches
    ['swA', 'swB', 'swCin'].forEach(function (id) {
      wire(s, 'psu1', 'V+', id, '1', 'red');
      wire(s, id, '3', 'psu1', 'GND', 'black');
    });
    // power three IC packages
    ['xor1', 'and1', 'or1'].forEach(function (id) {
      wire(s, 'psu1', 'V+', id, '14', 'red');
      wire(s, id, '7', 'psu1', 'GND', 'black');
    });
    // first half adder: S1 = A xor B, C1 = A and B
    wire(s, 'swA', '2', 'xor1', '1', 'green');
    wire(s, 'swB', '2', 'xor1', '2', 'green');
    wire(s, 'swA', '2', 'and1', '1', 'green');
    wire(s, 'swB', '2', 'and1', '2', 'green');
    // second half adder: Sum = S1 xor Cin, C2 = S1 and Cin
    wire(s, 'xor1', '3', 'xor1', '4', 'green');
    wire(s, 'xor1', '3', 'and1', '4', 'green');
    wire(s, 'swCin', '2', 'xor1', '5', 'green');
    wire(s, 'swCin', '2', 'and1', '5', 'green');
    // outputs
    wire(s, 'xor1', '6', 'rSum', '1', 'green');
    wire(s, 'rSum', '2', 'ledSum', 'a', 'green');
    wire(s, 'ledSum', 'k', 'psu1', 'GND', 'black');
    wire(s, 'and1', '3', 'or1', '1', 'green');
    wire(s, 'and1', '6', 'or1', '2', 'green');
    wire(s, 'or1', '3', 'rCout', '1', 'green');
    wire(s, 'rCout', '2', 'ledCout', 'a', 'green');
    wire(s, 'ledCout', 'k', 'psu1', 'GND', 'black');
    return s;
  };

  Templates['lab01-final'] = function () {
    const s = baseScene('Lab 01 · 终验 · 五门验证台从零搭建');
    s.template = 'lab01-final';
    return s;
  };

  Templates['lab02-final'] = function () {
    const s = baseScene('Lab 02 · 终验 · 全加器从零搭建');
    s.template = 'lab02-final';
    return s;
  };

  function getTemplate(id) {
    const fn = Templates[id] || Templates['led-basic'];
    uidCounter = 1;
    const s = fn();
    s._holes = boardHoles(s.board);
    return s;
  }

  /* ------------------------------------------------------------
     Simulation
     ------------------------------------------------------------ */
  function makeUF() {
    const parent = {};
    function add(a) { if (!(a in parent)) parent[a] = a; }
    function find(a) {
      add(a);
      let r = a;
      while (parent[r] !== r) r = parent[r];
      while (parent[a] !== r) { const next = parent[a]; parent[a] = r; a = next; }
      return r;
    }
    function union(a, b) {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    }
    return { add: add, find: find, union: union };
  }

  function netKeyForAnchor(scene, anchor, bind) {
    if (!anchor) return null;
    if (anchor.kind === 'hole') return 'h:' + anchor.hole;
    if (anchor.kind === 'pin') {
      if (!anchor.comp) return null;
      return 'p:' + anchor.comp + ':' + anchor.pin;
    }
    return null;
  }

  function computeNetlist(scene, bind) {
    const holes = scene._holes || (scene._holes = boardHoles(scene.board));
    const holeMap = {};
    holes.forEach(function (h) { holeMap[h.id] = h; });
    const uf = makeUF();
    holes.forEach(function (h) { uf.add('h:' + h.id); });
    const groups = {};
    holes.forEach(function (h) {
      const g = h.kind === 'rail' ? h.net : (h.row < 5 ? 'main:top:' + h.col : 'main:bottom:' + h.col);
      if (!groups[g]) groups[g] = [];
      groups[g].push('h:' + h.id);
    });
    Object.keys(groups).forEach(function (g) {
      const arr = groups[g];
      for (let i = 1; i < arr.length; i++) uf.union(arr[0], arr[i]);
    });
    scene.components.forEach(function (comp) {
      const def = DEFS[comp.type];
      if (!def) return;
      def.pins.forEach(function (p) {
        const key = 'p:' + comp.id + ':' + p.id;
        uf.add(key);
        const holeId = bind[comp.id] && bind[comp.id][p.id];
        if (holeId) uf.union(key, 'h:' + holeId);
      });
    });
    (scene.wires || []).forEach(function (w) {
      const a = netKeyForAnchor(scene, w.a, bind);
      const b = netKeyForAnchor(scene, w.b, bind);
      if (!a || !b) return;
      uf.add(a); uf.add(b);
      uf.union(a, b);
    });
    const rootToNet = {};
    const nets = [];
    function netOfKey(key) {
      if (!key) return -1;
      const r = uf.find(key);
      if (!(r in rootToNet)) {
        rootToNet[r] = nets.length;
        nets.push({ id: nets.length, keys: [], pins: [], holes: [] });
      }
      return rootToNet[r];
    }
    holes.forEach(function (h) {
      const n = netOfKey('h:' + h.id);
      nets[n].holes.push(h.id);
      nets[n].keys.push('h:' + h.id);
    });
    scene.components.forEach(function (comp) {
      const def = DEFS[comp.type];
      if (!def) return;
      def.pins.forEach(function (p) {
        const n = netOfKey('p:' + comp.id + ':' + p.id);
        nets[n].pins.push({ comp: comp.id, pin: p.id });
        nets[n].keys.push('p:' + comp.id + ':' + p.id);
      });
    });
    (scene.wires || []).forEach(function (w) {
      const a = netKeyForAnchor(scene, w.a, bind);
      const b = netKeyForAnchor(scene, w.b, bind);
      if (a && b) { netOfKey(a); netOfKey(b); }
    });
    return { uf: uf, nets: nets, netOfKey: netOfKey, holeMap: holeMap };
  }

  function emptyResult(message) {
    return {
      ok: false,
      message: message || '无法仿真',
      nets: [],
      pins: {},
      components: {},
      leds: [],
      warnings: [],
      sources: [],
      thresholds: { high: 2.5 },
      stamps: 0
    };
  }

  function simulate(scene, options) {
    const opts = options || {};
    const bind = bindings(scene);
    const netlist = computeNetlist(scene, bind);
    const nets = netlist.nets;
    const netOf = netlist.netOfKey;
    const comps = scene.components;
    const byId = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    const pinNet = {};
    comps.forEach(function (c) {
      const def = DEFS[c.type];
      if (!def) return;
      pinNet[c.id] = {};
      def.pins.forEach(function (p) {
        pinNet[c.id][p.id] = netOf('p:' + c.id + ':' + p.id);
      });
    });

    // ---------- sources ----------
    const sources = [];
    const warnings = [];
    const groundCount = {};
    function anchorExists(anchor) {
      if (!anchor) return false;
      if (anchor.kind === 'hole') return netlist.holeMap[anchor.hole] !== undefined;
      if (anchor.kind === 'pin') {
        const c = comps.find(function (x) { return x.id === anchor.comp; });
        return !!(c && pinLocal(c, anchor.pin));
      }
      return false;
    }
    (scene.wires || []).forEach(function (w) {
      if (!anchorExists(w.a) || !anchorExists(w.b)) {
        warnings.push({ code: 'dangling-wire', level: 'error', message: '有一条导线连接到了不存在的引脚或插孔，已被忽略。' });
      }
    });
    comps.forEach(function (comp) {
      const st = SOURCE_TYPES[comp.type];
      if (!st) return;
      const p = pinNet[comp.id][st.plus], n = pinNet[comp.id][st.minus];
      if (p == null || n == null) return;
      const V = st.v(comp.props || {});
      if (p === n) {
        warnings.push({ code: 'source-short', level: 'error', compId: comp.id, message: '电源正负极被直接短接' });
        return;
      }
      sources.push({ compId: comp.id, pos: p, neg: n, V: V, R: st.r });
      groundCount[n] = (groundCount[n] || 0) + 1;
    });
    let ground = 0;
    Object.keys(groundCount).forEach(function (k) {
      if (groundCount[k] > (groundCount[ground] || 0)) ground = Number(k);
    });
    if (!sources.length) {
      warnings.push({ code: 'no-source', level: 'warn', message: '电路里还没有电源，接一个电源后才会通电。' });
    }

    // ---------- code-driven Arduino I/O ----------
    const ioConfig = (options && options.io) || {};
    const ioDrivers = [];
    const ioPullups = [];
    comps.forEach(function (comp) {
      if (comp.type !== 'arduino-uno') return;
      const cfg = ioConfig[comp.id];
      if (!cfg) return;
      const pn = pinNet[comp.id];
      const gndNet = pn['gnd'];
      const vccNet = pn['5v'];
      Object.keys(cfg).forEach(function (pin) {
        const st = cfg[pin];
        const net = pn[pin];
        if (!st || net == null || gndNet == null) return;
        const def = DEFS['arduino-uno'];
        if (!def.pins.some(function (p) { return p.id === pin; })) return;
        if (st.mode === 'OUTPUT' && st.value != null) {
          const volts = st.pwm
            ? Math.max(0, Math.min(255, Number(st.value))) / 255 * 5
            : (Number(st.value) ? 5 : 0);
          ioDrivers.push({ a: net, b: gndNet, V: volts, R: 120, compId: comp.id, pin: pin });
        } else if (st.mode === 'INPUT_PULLUP' && vccNet != null) {
          ioPullups.push({ a: net, b: vccNet, R: 30000, compId: comp.id, pin: pin });
        }
      });
    });

    // ---------- passive elements ----------
    const resistors = []; // {a,b,R,compId,kind}
    const capBranches = [];
    comps.forEach(function (comp) {
      const pn = pinNet[comp.id];
      if (!pn) return;
      const t = comp.type;
      if (t === 'resistor') {
        resistors.push({ a: pn['1'], b: pn['2'], R: Math.max(1, Number(comp.props.resistance) || 220), compId: comp.id, kind: 'resistor' });
      } else if (t === 'button') {
        if (comp.props.pressed) resistors.push({ a: pn['1'], b: pn['2'], R: 0.02, compId: comp.id, kind: 'button' });
      } else if (t === 'slide-switch') {
        const onLeft = Number(comp.props.position) === 0;
        resistors.push({ a: pn['2'], b: onLeft ? pn['1'] : pn['3'], R: 0.02, compId: comp.id, kind: 'switch' });
      } else if (t === 'potentiometer') {
        const pos = Math.max(0, Math.min(100, Number(comp.props.position))) / 100;
        const total = Math.max(100, Number(comp.props.resistance) || 10000);
        resistors.push({ a: pn['1'], b: pn['2'], R: Math.max(1, total * pos), compId: comp.id, kind: 'pot' });
        resistors.push({ a: pn['2'], b: pn['3'], R: Math.max(1, total * (1 - pos)), compId: comp.id, kind: 'pot' });
      } else if (t === 'buzzer') {
        resistors.push({ a: pn['+'], b: pn['-'], R: 180, compId: comp.id, kind: 'buzzer' });
      } else if (t === 'dc-motor') {
        resistors.push({ a: pn['1'], b: pn['2'], R: 20, compId: comp.id, kind: 'motor' });
      } else if (t === 'vibration-motor') {
        resistors.push({ a: pn['+'], b: pn['-'], R: 35, compId: comp.id, kind: 'vibration' });
      } else if (t === 'servo') {
        resistors.push({ a: pn['vcc'], b: pn['gnd'], R: 10000, compId: comp.id, kind: 'servo-load' });
      } else if (t === 'capacitor') {
        capBranches.push({ a: pn['1'], b: pn['2'], compId: comp.id });
      } else if (t === 'led') {
        // handled separately
      }
    });

    // ---------- LEDs ----------
    const leds = [];
    comps.forEach(function (comp) {
      if (comp.type !== 'led') return;
      const pn = pinNet[comp.id];
      leds.push({
        compId: comp.id, a: pn['a'], k: pn['k'],
        vf: LED_VF[comp.props.color] || 1.9,
        on: false, current: 0, voltage: 0, brightness: 0
      });
    });

    // ---------- IC gates ----------
    const ics = [];
    comps.forEach(function (comp) {
      const info = IC_GATES[comp.type];
      if (!info) return;
      const pn = pinNet[comp.id];
      const gateStates = info.gates.map(function (g) {
        return { a: g.a, b: g.b, y: g.y, out: false, powered: false, desired: 0, active: false };
      });
      const hasWire = (scene.wires || []).some(function (w) {
        return (w.a.kind === 'pin' && w.a.comp === comp.id) || (w.b.kind === 'pin' && w.b.comp === comp.id);
      });
      ics.push({ comp: comp, info: info, pn: pn, gates: gateStates, hasWire: hasWire, powered: false, vcc: 0, gnd: 0, outV: 0, outGnd: 0 });
    });

    const maxSourceV = sources.reduce(function (m, s) { return Math.max(m, s.V); }, 0);
    const threshold = maxSourceV > 0 ? Math.min(2.5, Math.max(1.5, maxSourceV * 0.5)) : 2.5;

    const nNodes = nets.length;
    const gIndex = ground;
    const m = Math.max(0, nNodes - 1);
    const matrixIndex = [];
    for (let i = 0, k = 0; i < nNodes; i++) matrixIndex[i] = i === gIndex ? -1 : k++;

    function solveSystem() {
      const A = new Array(m);
      for (let i = 0; i < m; i++) A[i] = new Float64Array(m);
      const b = new Float64Array(m);
      function addG(i, j, g) {
        const ii = matrixIndex[i], jj = matrixIndex[j];
        if (g <= 0) return;
        if (ii >= 0) A[ii][ii] += g;
        if (jj >= 0) A[jj][jj] += g;
        if (ii >= 0 && jj >= 0) { A[ii][jj] -= g; A[jj][ii] -= g; }
      }
      function addI(i, j, cur) {
        const ii = matrixIndex[i], jj = matrixIndex[j];
        if (ii >= 0) b[ii] += cur;
        if (jj >= 0) b[jj] -= cur;
      }
      function vSource(i, j, V, R) {
        const g = 1 / Math.max(R, 0.001);
        addG(i, j, g);
        addI(i, j, V * g);
      }
      // sources
      sources.forEach(function (s) { vSource(s.pos, s.neg, s.V, s.R); });
      // code-driven Arduino outputs & pull-ups
      ioDrivers.forEach(function (d) { vSource(d.a, d.b, d.V, d.R); });
      ioPullups.forEach(function (r) { addG(r.a, r.b, 1 / r.R); });
      // passives
      resistors.forEach(function (r) { addG(r.a, r.b, 1 / Math.max(r.R, 0.001)); });
      // LEDs
      leds.forEach(function (l) {
        if (l.on) {
          const g = 1 / 25;
          addG(l.a, l.k, g);
          addI(l.a, l.k, l.vf * g);
        } else {
          addG(l.a, l.k, 1e-8);
        }
      });
      // IC outputs
      ics.forEach(function (ic) {
        if (!ic.powered) return;
        ic.gates.forEach(function (g) {
          if (!g.active) return;
          const outNet = ic.pn[g.y];
          const gndNet = ic.pn['7'];
          const v = g.out ? ic.outV : ic.outGnd;
          vSource(outNet, gndNet, v - (g.out ? 0 : 0), 150);
        });
      });
      // weak anchors to remove floating singularities
      for (let i = 0; i < nNodes; i++) {
        if (i === gIndex) continue;
        addG(i, gIndex, 1e-9);
      }
      // solve
      for (let col = 0; col < m; col++) {
        let pivot = col, max = Math.abs(A[col][col]);
        for (let r = col + 1; r < m; r++) {
          const v = Math.abs(A[r][col]);
          if (v > max) { max = v; pivot = r; }
        }
        if (max < 1e-14) continue;
        if (pivot !== col) {
          const tmp = A[col]; A[col] = A[pivot]; A[pivot] = tmp;
          const tb = b[col]; b[col] = b[pivot]; b[pivot] = tb;
        }
        const piv = A[col][col];
        for (let r = col + 1; r < m; r++) {
          const f = A[r][col] / piv;
          if (!f) continue;
          for (let c2 = col; c2 < m; c2++) A[r][c2] -= f * A[col][c2];
          b[r] -= f * b[col];
        }
      }
      const x = new Float64Array(m);
      for (let r = m - 1; r >= 0; r--) {
        let sum = b[r];
        for (let c = r + 1; c < m; c++) sum -= A[r][c] * x[c];
        x[r] = Math.abs(A[r][r]) > 1e-14 ? sum / A[r][r] : 0;
      }
      const volts = new Float64Array(nNodes);
      for (let i = 0, k = 0; i < nNodes; i++) volts[i] = i === gIndex ? 0 : x[matrixIndex[i]];
      return volts;
    }

    let volts = solveSystem();
    let iterations = 0;
    for (iterations = 0; iterations < 28; iterations++) {
      let changed = false;
      // LEDs
      leds.forEach(function (l) {
        const vd = volts[l.a] - volts[l.k];
        l.voltage = vd;
        const should = l.on ? vd > l.vf - 0.02 : vd > l.vf + 0.05;
        if (should !== l.on) { l.on = should; changed = true; }
      });
      // ICs
      ics.forEach(function (ic) {
        const pn = ic.pn;
        const gnd = volts[pn['7']] || 0;
        const vcc = volts[pn['14']] || 0;
        ic.vcc = vcc; ic.gnd = gnd;
        const supply = vcc - gnd;
        const powered = supply > 1.8;
        if (powered !== ic.powered) { ic.powered = powered; changed = true; }
        if (!powered) return;
        ic.outV = vcc - 0.08;
        ic.outGnd = gnd + 0.04;
        const highLevel = supply * 0.5 + gnd;
        ic.gates.forEach(function (g) {
          const va = volts[pn[g.a]];
          const vb = g.b != null ? volts[pn[g.b]] : null;
          const vc = g.c != null ? volts[pn[g.c]] : null;
          const vd = g.d != null ? volts[pn[g.d]] : null;
          const a = va > highLevel ? 1 : 0;
          const b = g.b != null ? (vb > highLevel ? 1 : 0) : 1;
          const c = g.c != null ? (vc > highLevel ? 1 : 0) : 1;
          const d = g.d != null ? (vd > highLevel ? 1 : 0) : 1;
          let out;
          switch (ic.info.op) {
            case 'AND': out = a & b; break;
            case 'OR': out = a | b; break;
            case 'XOR': out = a ^ b; break;
            case 'NOR': out = (a | b) ? 0 : 1; break;
            case 'NOT': out = a ? 0 : 1; break;
            case 'AND4': out = (a & b & c & d) ? 1 : 0; break;
            case 'NAND4': out = (a & b & c & d) ? 0 : 1; break;
            default: out = 0;
          }
          const active = powered;
          if (g.out !== !!out || g.active !== active) { g.out = !!out; g.active = active; changed = true; }
        });
      });
      if (!changed && iterations > 1) break;
      volts = solveSystem();
    }

    // ---------- results ----------
    const pinResult = {};
    comps.forEach(function (comp) {
      const def = DEFS[comp.type];
      if (!def) return;
      pinResult[comp.id] = {};
      def.pins.forEach(function (p) {
        const n = pinNet[comp.id][p.id];
        const v = n >= 0 ? volts[n] : 0;
        const net = nets[n];
        const bound = bind[comp.id] && bind[comp.id][p.id];
        const connected = !!(net && (net.pins.length > 1 || net.holes.length > 1 || (bound && net.keys.length > 1)));
        pinResult[comp.id][p.id] = {
          voltage: v,
          high: v > threshold,
          low: v < threshold * 0.6,
          net: n,
          connected: connected,
          boundHole: bound || null
        };
      });
    });

    const componentResult = {};
    comps.forEach(function (comp) {
      componentResult[comp.id] = { type: comp.type, powered: false, current: 0, voltage: 0 };
      if (comp.type === 'arduino-uno' && ioConfig[comp.id]) {
        componentResult[comp.id].io = JSON.parse(JSON.stringify(ioConfig[comp.id]));
      }
    });
    // sources current
    sources.forEach(function (s) {
      const vd = volts[s.pos] - volts[s.neg];
      const current = Math.abs((vd - s.V) / s.R);
      componentResult[s.compId].powered = vd > 0.5;
      componentResult[s.compId].voltage = vd;
      componentResult[s.compId].current = current;
      if (current > 2) {
        warnings.push({ code: 'short', level: 'error', compId: s.compId, message: '检测到短路，电流约 ' + current.toFixed(1) + ' A。请检查电源正负极。' });
      }
    });
    // resistors/currents
    resistors.forEach(function (r) {
      const current = Math.abs((volts[r.a] - volts[r.b]) / r.R);
      const cr = componentResult[r.compId];
      if (!cr) return;
      if (r.kind === 'button') { cr.pressed = !!byId[r.compId].props.pressed; cr.current = current; }
      if (r.kind === 'switch') cr.current = current;
      if (r.kind === 'motor') {
        const vd = volts[r.a] - volts[r.b];
        cr.motor = Math.min(1, Math.abs(vd) / 4);
        cr.voltage = vd;
        cr.current = current;
        cr.powered = Math.abs(vd) > 1;
      }
      if (r.kind === 'buzzer') {
        const vd = volts[r.a] - volts[r.b];
        cr.voltage = vd;
        cr.current = current;
        cr.buzzer = vd > 2.2;
        cr.powered = vd > 2.2;
      }
      if (r.kind === 'servo-load') {
        const sv = byId[r.compId];
        const sig = volts[pinNet[sv.id]['sig']] || 0;
        cr.servoPowered = volts[r.a] - volts[r.b] > 2;
        cr.powered = cr.servoPowered;
        cr.angle = Math.max(0, Math.min(180, (sig / Math.max(0.1, volts[r.a] - volts[r.b])) * 180));
        cr.voltage = volts[r.a] - volts[r.b];
      }
      if (current > 1.5 && (r.kind === 'switch' || r.kind === 'button')) {
        warnings.push({ code: 'switch-short', level: 'error', compId: r.compId, message: '开关电流过大，可能短路。' });
      }
    });
    // LED results
    leds.forEach(function (l) {
      const vd = l.voltage;
      l.current = l.on ? Math.max(0, (vd - l.vf) / 25) : 0;
      l.brightness = Math.max(0, Math.min(1, l.current / 0.02));
      const cr = componentResult[l.compId];
      cr.on = l.on; cr.current = l.current; cr.brightness = l.brightness; cr.voltage = vd;
      if (l.current > 0.032) {
        warnings.push({ code: 'led-overcurrent', level: 'error', compId: l.compId, message: 'LED 电流约 ' + (l.current * 1000).toFixed(0) + ' mA，超过额定值！请串联 220Ω 限流电阻。' });
      }
      if (l.on && l.current > 0.001) cr.powered = true;
    });
    // IC results + warnings
    ics.forEach(function (ic) {
      const pn = ic.pn;
      const cr = componentResult[ic.comp.id];
      cr.gates = ic.gates.map(function (g) { return { a: g.a, b: g.b, c: g.c, d: g.d, y: g.y, out: g.out, active: g.active }; });
      cr.powered = ic.powered;
      cr.vcc = ic.vcc; cr.gnd = ic.gnd;
      if (!ic.powered && ic.hasWire) {
        warnings.push({ code: 'ic-unpowered', level: 'warn', compId: ic.comp.id, message: ic.info.label + ' 还没接电源（VCC 第 14 脚、GND 第 7 脚）。' });
      }
      if (ic.powered) {
        let floating = 0;
        ic.gates.forEach(function (g) {
          // Only audit gates whose output is actually used. Unused gates in a
          // multi-gate package may be left unconnected in this teaching model.
          const outNet = nets[pn[g.y]];
          const outUsed = outNet && (outNet.pins.length > 1 || bind[ic.comp.id][g.y]);
          if (!outUsed) return;
          [g.a, g.b, g.c, g.d].forEach(function (pinId) {
            if (pinId == null) return;
            const n = pn[pinId];
            const net = nets[n];
            if (net && net.pins.length === 1 && !bind[ic.comp.id][pinId]) floating++;
          });
        });
        if (floating) {
          warnings.push({ code: 'floating-input', level: 'warn', compId: ic.comp.id, message: ic.info.label + ' 有 ' + floating + ' 个输入引脚悬空，CMOS 输入必须接高或低。' });
        }
        // output conflicts
        const outputsByNet = {};
        ic.gates.forEach(function (g) {
          if (!g.active) return;
          const n = pn[g.y];
          if (!outputsByNet[n]) outputsByNet[n] = [];
          outputsByNet[n].push(g.out);
        });
        Object.keys(outputsByNet).forEach(function (n) {
          const vals = outputsByNet[n];
          if (vals.length > 1 && vals.some(function (v) { return v !== vals[0]; })) {
            warnings.push({ code: 'output-conflict', level: 'error', compId: ic.comp.id, message: '多个逻辑门输出接在同一条线上且电平冲突，可能短路。' });
          }
        });
      }
    });
    // capacitor info
    comps.filter(function (c) { return c.type === 'capacitor'; }).forEach(function (c) {
      componentResult[c.id].note = '直流稳态下相当于开路';
    });
    // switches
    comps.filter(function (c) { return c.type === 'slide-switch'; }).forEach(function (c) {
      componentResult[c.id].position = Number(c.props.position);
    });
    // de-duplicate warnings by code+comp
    const seen = {};
    const cleanWarnings = [];
    warnings.forEach(function (w) {
      const key = w.code + '|' + (w.compId || '');
      if (seen[key]) return;
      seen[key] = 1; cleanWarnings.push(w);
    });

    const netVolts = [];
    for (let i = 0; i < nets.length; i++) {
      netVolts.push({ id: i, voltage: volts[i], pins: nets[i].pins.length, holes: nets[i].holes.length });
    }

    return {
      ok: true,
      nets: netVolts,
      pins: pinResult,
      components: componentResult,
      leds: leds,
      sources: sources,
      warnings: cleanWarnings,
      iterations: iterations,
      threshold: threshold,
      vcc: maxSourceV,
      ledLit: leds.filter(function (l) { return l.on && l.current > 0.0005; }).length,
      maxCurrent: sources.reduce(function (m2, s) { const vd = volts[s.pos] - volts[s.neg]; return Math.max(m2, Math.abs((vd - s.V) / s.R)); }, 0)
    };
  }

  /* ------------------------------------------------------------
     Tasks
     ------------------------------------------------------------ */
  const TASKS = {
    'led-basic': {
      kicker: '实验 01 · 基础电路',
      title: '点亮第一颗 LED',
      summary: '5V → 220Ω → LED → GND，一条完整的回路。',
      steps: [
        { key: 'parts', text: '找到电源、220Ω 电阻和红色 LED' },
        { key: 'wired', text: '让电流从正极出发，经过电阻和 LED 回到负极' },
        { key: 'led', text: '点击“开始模拟”，让 LED 发光' }
      ],
      success: '回路通了！LED 电流约 13 mA，220Ω 电阻把它限制在安全范围。'
    },
    'button-led': {
      kicker: '实验 02 · 输入',
      title: '按下才亮',
      summary: '按钮是常开开关，按下时电路才闭合。',
      steps: [
        { key: 'parts', text: '确认按钮、电阻和 LED 都已放好' },
        { key: 'wired', text: '把按钮串进回路中' },
        { key: 'button', text: '开始模拟，按住按钮并观察 LED' }
      ],
      success: '按键闭合，电流通过；松手断开。这就是最基本的数字输入。'
    },
    'pot-led': {
      kicker: '实验 03 · 模拟量',
      title: '旋钮调光',
      summary: '电位器改变电阻，电流和亮度随之变化。',
      steps: [
        { key: 'parts', text: '认识电位器的三个引脚' },
        { key: 'wired', text: '把电位器滑片接进 LED 回路' },
        { key: 'pot', text: '开始模拟，拖动旋钮观察亮度变化' }
      ],
      success: '电阻越大，电流越小，LED 越暗。这就是连续可调的模拟量。'
    },
    'and-gate': {
      kicker: '实验 04 · 逻辑门',
      title: '两个都为 1 才亮',
      summary: '74HC08 的与门：Y = A · B。',
      steps: [
        { key: 'gate-power', text: '给 74HC08 接上第 14 脚 VCC 和第 7 脚 GND' },
        { key: 'both-high', text: '把两个输入开关都拨到高电平（左侧）' },
        { key: 'and-led', text: '开始模拟，验证输出 LED 点亮' }
      ],
      success: '1 · 1 = 1。只要有一个输入为 0，与门输出就为 0。'
    },
    'or-gate': {
      kicker: '实验 05 · 逻辑门',
      title: '任意一个为 1 就亮',
      summary: '74HC32 的或门：Y = A + B。',
      steps: [
        { key: 'gate-power', text: '给 74HC32 接好电源与地' },
        { key: 'any-high', text: '把任意一个输入开关拨到高电平' },
        { key: 'or-led', text: '开始模拟，观察 LED 点亮' }
      ],
      success: '0 + 1 = 1。或门只关心有没有“1”。'
    },
    'not-gate': {
      kicker: '实验 06 · 逻辑门',
      title: '把信号反过来',
      summary: '74HC04 的非门：Y = ¬A。',
      steps: [
        { key: 'gate-power', text: '给 74HC04 接好电源与地' },
        { key: 'switch-low', text: '把输入开关拨到低电平' },
        { key: 'not-led', text: '开始模拟，观察“输入 0，输出 1”' }
      ],
      success: '输入低，输出高；输入高，输出低。非门是最简单的反相器。'
    },
    'nor-gate': {
      kicker: '实验 07 · 逻辑门',
      title: '都为 0 才亮',
      summary: '74HC02 的或非门：Y = ¬(A + B)。',
      steps: [
        { key: 'gate-power', text: '给 74HC02 接好电源与地' },
        { key: 'both-low', text: '把两个输入开关都拨到低电平' },
        { key: 'nor-led', text: '开始模拟，观察 LED 点亮' }
      ],
      success: '只有 0、0 时输出才为 1。NOR 是“通用门”，可以搭出所有逻辑。'
    },
    'alarm': {
      kicker: '项目 · 组合逻辑',
      title: '双条件报警器',
      summary: '两个条件同时满足时，蜂鸣器响起。',
      steps: [
        { key: 'gate-power', text: '给与门接好电源，蜂鸣器接输出' },
        { key: 'both-high', text: '两个开关都拨到高电平' },
        { key: 'buzzer', text: '开始模拟，听到报警声' }
      ],
      success: 'A · B = 1，蜂鸣器得电。这就是用逻辑门做的条件判断。'
    },
    'motor': {
      kicker: '实验 08 · 执行器',
      title: '让电机转起来',
      summary: '开关控制电机通断，电能变成机械能。',
      steps: [
        { key: 'parts', text: '找到电源、开关和直流电机' },
        { key: 'wired', text: '把电机串进电源回路' },
        { key: 'motor', text: '开始模拟，拨动开关让电机旋转' }
      ],
      success: '电机转起来了。真实电路里要用三极管或驱动模块，不能直接接单片机。'
    },
    'servo': {
      kicker: '实验 09 · 执行器',
      title: '旋钮控制角度',
      summary: '电位器分压 → 信号 → 舵机角度。',
      steps: [
        { key: 'parts', text: '找到舵机与电位器' },
        { key: 'wired', text: '电位器滑片接舵机信号线' },
        { key: 'servo', text: '开始模拟，旋转旋钮' }
      ],
      success: '信号电压改变，舵机转到对应角度。真实舵机使用 50Hz PWM。'
    },
    'half-adder': {
      kicker: '项目 · 半加器',
      title: '1 + 1 = 10',
      summary: 'XOR 求和，AND 进位。',
      steps: [
        { key: 'gate-power', text: '给两片芯片接好电源' },
        { key: 'wired', text: '把 A、B 接到 XOR 与 AND 的输入' },
        { key: 'carry-lit', text: '让 A、B 都为 1，验证 1 + 1 = 10' }
      ],
      success: 'Sum = A ⊕ B，Carry = A · B。你刚刚搭出了一台半加器。'
    },
    'arduino-blink': {
      kicker: '项目 · 代码与电路',
      title: '让代码控制电路',
      summary: '打开代码编辑器，用 Arduino 控制真实的 LED、按钮和旋钮。',
      steps: [
        { key: 'arduino-part', text: '找到 Arduino Uno 与 D13 上的 LED' },
        { key: 'code-open', text: '打开工具栏的「代码」编辑器' },
        { key: 'code-running', text: '运行示例代码，观察 LED 与串口' }
      ],
      success: '代码运行了！试着切换到「旋钮调光」，并打开串口监视器。'
    },
    'lab01-led': {
      kicker: 'Lab 01 · 关卡 01',
      title: '电源、面包板与 LED',
      summary: '元件已经摆在面包板上，导线全部断开。从电源开始，自己把回路接起来。',
      steps: [
        { key: 'lab-psu', text: '把电源 V+ 和 GND 分别接出来，先不要直接短接' },
        { key: 'lab-path', text: '用 1kΩ 电阻连接 V+ 和 LED 阳极，再将阴极接回 GND' },
        { key: 'lab-run', text: '运行仿真，自己确认 LED 是否点亮' }
      ],
      success: '回路接通了。现在回到关卡页，把实验观察记录下来；下一关开始接芯片。'
    },
    'lab01-nand': {
      kicker: 'Lab 01 · 关卡 02',
      title: '74HC20 · NAND',
      summary: '芯片、开关、电阻和 LED 都已就位，但一根线都没接。按提示自己完成。',
      steps: [
        { key: 'lab-power', text: '把 74HC20 的第 14 脚接 V+、第 7 脚接 GND' },
        { key: 'lab-inputs', text: '把 A/B 开关接到输入脚；C/D 该接什么？先想清楚再接' },
        { key: 'lab-output', text: '把输出脚经 1kΩ 接 LED，LED 阴极回 GND' },
        { key: 'lab-run', text: '运行仿真，切换 A/B，自己观察并记录输出' }
      ],
      success: '电路开始响应了。回到关卡页，把真值表自己填完，再用“检查我的真值表”验证。'
    },
    'lab01-not': {
      kicker: 'Lab 01 · 关卡 03',
      title: '74HC04 · NOT',
      summary: '元件已摆好，导线全部断开。先接线，再自己验证反相关系。',
      steps: [
        { key: 'lab-power', text: '把 74HC04 的第 14 脚接 V+、第 7 脚接 GND' },
        { key: 'lab-inputs', text: '把开关公共端接到 1A 输入' },
        { key: 'lab-output', text: '把 1Y 输出经 1kΩ 接 LED，LED 阴极回 GND' },
        { key: 'lab-run', text: '运行仿真，切换输入，自己观察输出' }
      ],
      success: '输入改变时输出也跟着变。回到关卡页，自己写出两行真值表并检查。'
    },
    'lab01-and': {
      kicker: 'Lab 01 · 关卡 04',
      title: '74HC21 · AND',
      summary: '先接电源和输入，再想清楚 4 输入 AND 的多余输入怎么处理。',
      steps: [
        { key: 'lab-power', text: '把 74HC21 的第 14 脚接 V+、第 7 脚接 GND' },
        { key: 'lab-inputs', text: 'A/B 接开关；未使用的 C/D 应该接高还是接低？' },
        { key: 'lab-output', text: '把输出脚经 1kΩ 接 LED，LED 阴极回 GND' },
        { key: 'lab-run', text: '运行仿真，切换 A/B，记录输出' }
      ],
      success: '接线完成，AND 已经开始响应。回到关卡页，自己补完真值表。'
    },
    'lab01-xor': {
      kicker: 'Lab 01 · 关卡 05',
      title: '74HC86 · XOR',
      summary: '先自己接，再看输出；不要急着看结论，用输入组合验证。',
      steps: [
        { key: 'lab-power', text: '把 74HC86 的第 14 脚接 V+、第 7 脚接 GND' },
        { key: 'lab-inputs', text: '把 A/B 开关接到 XOR 的第 1、2 脚' },
        { key: 'lab-output', text: '把第 3 脚输出经 1kΩ 接 LED' },
        { key: 'lab-run', text: '运行仿真，试完四种输入组合' }
      ],
      success: 'XOR 已经有反应了。回到关卡页，凭自己的观察填写真值表。'
    },
    'lab01-or': {
      kicker: 'Lab 01 · 关卡 06',
      title: '74HC32 · OR',
      summary: '最后一个门电路。按步骤接线，自己总结 OR 和 XOR 的区别。',
      steps: [
        { key: 'lab-power', text: '把 74HC32 的第 14 脚接 V+、第 7 脚接 GND' },
        { key: 'lab-inputs', text: '把 A/B 开关接到第 1、2 脚' },
        { key: 'lab-output', text: '把第 3 脚输出经 1kΩ 接 LED' },
        { key: 'lab-run', text: '运行仿真，试完四种输入组合' }
      ],
      success: 'Lab 01 的五个门都做完了。回到关卡页，自己把五张表整理进报告。'
    },
    'lab02-half': {
      kicker: 'Lab 02 · 关卡 01',
      title: '半加器 Half Adder',
      summary: '两片芯片已经放好，但连线全断。先自己想：Sum 和 Carry 分别该用哪个门？',
      steps: [
        { key: 'lab-power', text: '给 74HC86 和 74HC08 接好 V+ 与 GND' },
        { key: 'lab-inputs', text: '把 A/B 同时接到两个门的输入' },
        { key: 'lab-output', text: '两个输出分别经 1kΩ 接 LED' },
        { key: 'lab-run', text: '运行仿真，试完四组输入，再记录 Sum/Carry' }
      ],
      success: '半加器已经能响应输入。回到关卡页，自己把 Sum 和 Carry 填完并检查。'
    },
    'lab02-full': {
      kicker: 'Lab 02 · 关卡 02',
      title: '全加器 Full Adder',
      summary: '三片芯片与输入/输出元件已就位，导线全部断开。这是本 Lab 的最终挑战。',
      steps: [
        { key: 'lab-power', text: '给 74HC86、74HC08、74HC32 都接好 V+ 与 GND' },
        { key: 'lab-inputs', text: '先搭第一级 A⊕B、A·B，再把 S1 和 Cin 接入第二级' },
        { key: 'lab-output', text: 'Sum 与 Cout 分别经 1kΩ 接 LED；检查两个进位是否经 OR 合并' },
        { key: 'lab-run', text: '运行仿真，自己验证八组输入并填写真值表' }
      ],
      success: '全加器接通了。回到关卡页，把八行真值表自己填完，用检查功能确认。'
    },
    'lab01-final': {
      kicker: 'Lab 01 · 终验',
      title: '从空白面包板搭建五门验证台',
      summary: '画布上没有零件。自己摆放五片 Lab 01 芯片、五组输出和输入，完成整份 Lab 的最终电路。',
      steps: [
        { key: 'lab-final-parts', text: '从元件库放置五片 Lab 01 芯片、2 个开关、5 个 1kΩ、5 个 LED 和电源' },
        { key: 'lab-power', text: '给五片芯片都接好电源，逐片检查是否真的通电' },
        { key: 'lab-inputs', text: '接好共享输入；74HC20/21 的 C/D 该接什么？自己判断' },
        { key: 'lab-output', text: '每片输出都经 1kΩ 接 LED，并让 LED 阴极回到 GND' },
        { key: 'lab-run', text: '运行仿真，逐片验证并填完五张真值表' }
      ],
      success: '五门验证台完成。你已经从空画布独立搭出了 Lab 01 的完整结果。'
    },
    'lab02-final': {
      kicker: 'Lab 02 · 终验',
      title: '从空白面包板搭建全加器',
      summary: '没有零件、没有接线。自己摆放三片芯片与输入/输出元件，完成 Lab 02 的最终电路。',
      steps: [
        { key: 'lab-final-parts', text: '从元件库放置 74HC86、74HC08、74HC32、3 个开关、2 个 1kΩ、2 个 LED 和电源' },
        { key: 'lab-power', text: '给三片芯片都接好电源，并检查每一片都真正通电' },
        { key: 'lab-inputs', text: '自己决定两级半加器的连接：S1、C1、C2 分别应该去哪里？' },
        { key: 'lab-output', text: '把 Sum 和 Cout 分别接到电阻与 LED，并检查进位是否经过 OR' },
        { key: 'lab-run', text: '运行仿真，自己验证八组输入并填完真值表' }
      ],
      success: '终验完成。空画布上的全加器已经能工作，这就是 Lab 02 的最终交付电路。'
    }
  };

  BBL.Engine = {
    PITCH: PITCH,
    DEFS: DEFS,
    IC_GATES: IC_GATES,
    SOURCE_TYPES: SOURCE_TYPES,
    ROW_Y: ROW_Y,
    Templates: Templates,
    TASKS: TASKS,
    createScene: getTemplate,
    createComponent: createComponent,
    addComponent: addComp,
    wire: wire,
    wireHole: wireHole,
    makeBoard: makeBoard,
    boardHoles: boardHoles,
    holeIndex: holeIndex,
    allPinsWorld: allPinsWorld,
    pinWorld: pinWorld,
    pinLocal: pinLocal,
    bindings: bindings,
    snapComponent: snapComponent,
    nearestHole: nearestHole,
    simulate: simulate,
    clone: clone,
    uid: uid,
    emptyResult: emptyResult
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = BBL;
})();
