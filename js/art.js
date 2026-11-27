/* ============================================================
   Breadboard Lab · hand-drawn SVG component art
   Icons use a 64×52 viewBox; canvas parts use world units (pitch 13).
   ============================================================ */
(function () {
  'use strict';
  const BBL = (window.BBL = window.BBL || {});
  const P = 13;

  function n(v) { return Math.round(v * 100) / 100; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function defs(inner) { return '<defs>' + inner + '</defs>'; }
  function pinOf(pins, id) {
    if (!pins) return { x: 0, y: 0 };
    return pins.find(function (p) { return String(p.id) === String(id); }) || pins[0] || { x: 0, y: 0 };
  }

  /* ============================================================
     Icon library (64 × 52)
     ============================================================ */
  const icon = {};

  icon.resistor = function () {
    return defs('<linearGradient id="iRes" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7d6b4"/><stop offset="1" stop-color="#cdb488"/></linearGradient>') +
      '<path d="M6 26h12M46 26h12" stroke="#8b95a5" stroke-width="2.2" stroke-linecap="round"/>' +
      '<rect x="17" y="16.5" width="30" height="19" rx="6.5" fill="url(#iRes)" stroke="#aa8c5c" stroke-width="1"/>' +
      '<rect x="22.5" y="16.5" width="3.6" height="19" fill="#c84545"/><rect x="28" y="16.5" width="3.6" height="19" fill="#c84545"/>' +
      '<rect x="33.5" y="16.5" width="3.6" height="19" fill="#7a4b22"/><rect x="40" y="16.5" width="3.2" height="19" fill="#d5a62c"/>' +
      '<path d="M20 19.5h23" stroke="#fff" stroke-opacity=".38" stroke-width="1.6" stroke-linecap="round"/>';
  };

  icon.led = function () {
    return defs('<radialGradient id="iLed" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#ffb3b3"/><stop offset=".55" stop-color="#ef4444"/><stop offset="1" stop-color="#b91c1c"/></radialGradient><radialGradient id="iLedGlow"><stop offset="0" stop-color="#ff5d5d" stop-opacity=".5"/><stop offset="1" stop-color="#ff5d5d" stop-opacity="0"/></radialGradient>') +
      '<circle cx="32" cy="23" r="19" fill="url(#iLedGlow)"/>' +
      '<path d="M27 34c-5 3-5 9 1 11v3M37 34v8" stroke="#475569" stroke-width="2.6" stroke-linecap="round"/>' +
      '<rect x="23.5" y="29.5" width="17" height="5" rx="1.4" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".7"/>' +
      '<circle cx="32" cy="22" r="10.5" fill="url(#iLed)" stroke="#a31616" stroke-width="1"/>' +
      '<path d="M25.5 18.5c1.6-3.3 5.4-4.9 8.6-4.1" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.3" stroke-linecap="round"/>' +
      '<path d="M26 31h12" stroke="#7f1d1d" stroke-opacity=".35" stroke-width="1"/>' +
      '<path d="M38.5 25.5l1.5 4" stroke="#3f1d1d" stroke-width="1.2" stroke-linecap="round"/>';
  };

  icon.button = function () {
    return defs('<linearGradient id="iBtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#b91c1c"/></linearGradient>') +
      '<path d="M22 37v9M42 37v9M18 37v7M46 37v7" stroke="#9aa4b2" stroke-width="2.2" stroke-linecap="round"/>' +
      '<rect x="16" y="26" width="32" height="13" rx="2.5" fill="#2b3038" stroke="#171b21"/>' +
      '<rect x="19" y="23" width="26" height="12" rx="2" fill="#3b424d"/>' +
      '<circle cx="32" cy="22" r="8.2" fill="url(#iBtn)" stroke="#991b1b" stroke-width=".8"/>' +
      '<ellipse cx="29.5" cy="19.2" rx="2.6" ry="1.7" fill="#fff" opacity=".28"/>' +
      '<circle cx="24" cy="31.5" r="1.1" fill="#111"/><circle cx="40" cy="31.5" r="1.1" fill="#111"/>';
  };

  icon.potentiometer = function () {
    return defs('<linearGradient id="iPot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e40af"/></linearGradient>') +
      '<path d="M23 38v8M32 38v8M41 38v8" stroke="#9aa4b2" stroke-width="2.2" stroke-linecap="round"/>' +
      '<rect x="17" y="16" width="30" height="23" rx="3" fill="url(#iPot)" stroke="#1e3a8a"/>' +
      '<circle cx="32" cy="27" r="8.5" fill="#dfe6ee" stroke="#8b98a9" stroke-width=".8"/>' +
      '<circle cx="32" cy="27" r="6.4" fill="#f2f5f8"/>' +
      '<path d="M32 21.5v5.5" stroke="#475569" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M19 19.5h26" stroke="#fff" stroke-opacity=".18" stroke-width="1.4"/>';
  };

  icon.capacitor = function () {
    return defs('<linearGradient id="iCap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient>') +
      '<path d="M27 33v13M37 33v13" stroke="#9aa4b2" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="32" cy="23" r="11" fill="url(#iCap)" stroke="#1e40af" stroke-width="1"/>' +
      '<circle cx="32" cy="23" r="7.2" fill="none" stroke="#bfdbfe" stroke-opacity=".35" stroke-width="1"/>' +
      '<text x="32" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.4" font-weight="700" fill="#eff6ff">104</text>' +
      '<path d="M24 17.5c1.8-2.2 4.2-3.1 6.2-3" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.8" stroke-linecap="round"/>';
  };

  icon['slide-switch'] = function () {
    return defs('<linearGradient id="iSw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5563"/><stop offset="1" stop-color="#1f2937"/></linearGradient>') +
      '<path d="M22 36v10M32 36v10M42 36v10" stroke="#9aa4b2" stroke-width="2.2" stroke-linecap="round"/>' +
      '<rect x="16" y="23" width="32" height="14" rx="2.5" fill="url(#iSw)" stroke="#111827"/>' +
      '<rect x="20" y="20" width="24" height="7" rx="2" fill="#374151"/>' +
      '<rect x="29" y="16.5" width="8" height="9" rx="1.4" fill="#e5e7eb" stroke="#9ca3af" stroke-width=".7"/>' +
      '<path d="M31 19v4" stroke="#6b7280" stroke-width="1.1"/>' +
      '<text x="22" y="33" font-family="Arial" font-size="4" fill="#9ca3af" text-anchor="middle">1</text>' +
      '<text x="32" y="33" font-family="Arial" font-size="4" fill="#9ca3af" text-anchor="middle">2</text>' +
      '<text x="42" y="33" font-family="Arial" font-size="4" fill="#9ca3af" text-anchor="middle">3</text>';
  };

  icon.buzzer = function () {
    return defs('<linearGradient id="iBuz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#475569"/><stop offset="1" stop-color="#111827"/></linearGradient>') +
      '<path d="M26 34v12M38 34v10" stroke="#9aa4b2" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="32" cy="23" r="12" fill="url(#iBuz)" stroke="#0b1220"/>' +
      '<circle cx="32" cy="23" r="8.5" fill="#1f2937" stroke="#64748b" stroke-width=".7"/>' +
      '<circle cx="32" cy="23" r="2" fill="#0b1220"/>' +
      '<path d="M32 15v16M24 23h16" stroke="#64748b" stroke-width=".8" opacity=".7"/>' +
      '<path d="M37.5 11.5h4" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round"/><path d="M39.5 9.5v4" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round"/>';
  };

  icon.breadboard = function () {
    let holes = '';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 15; c++) {
        holes += '<circle cx="' + (10 + c * 3.15) + '" cy="' + (19 + r * 3.15) + '" r=".6" fill="#b9b4a9"/>';
      }
    }
    return '<rect x="4" y="7" width="56" height="39" rx="3.5" fill="#f4f0e6" stroke="#d8d2c4"/>' +
      '<rect x="4" y="10" width="56" height="2.4" fill="#efb6b6" opacity=".75"/><rect x="4" y="40.5" width="56" height="2.4" fill="#b9c9ec" opacity=".75"/>' +
      holes + '<rect x="5" y="25" width="54" height="3.4" rx="1" fill="#e6e1d5" stroke="#d6d0c3"/>' +
      '<path d="M7 13h50M7 42.5h50" stroke="#cdc7ba" stroke-width=".5" stroke-dasharray="1 2"/>' +
      '<text x="32" y="45" text-anchor="middle" font-family="monospace" font-size="3.4" fill="#a9a59b">830</text>';
  };

  icon['power-supply'] = function () {
    return defs('<linearGradient id="iPsu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>') +
      '<rect x="7" y="9" width="50" height="34" rx="4" fill="url(#iPsu)" stroke="#020617"/>' +
      '<rect x="11" y="13" width="21" height="10" rx="1" fill="#9ee7d3" opacity=".92"/><text x="14" y="20.5" font-family="monospace" font-size="6" fill="#064e3b">5.00</text>' +
      '<rect x="11" y="26" width="21" height="8" rx="1" fill="#9ee7d3" opacity=".8"/><text x="14" y="32" font-family="monospace" font-size="5" fill="#064e3b">0.00</text>' +
      '<circle cx="42" cy="18" r="5" fill="#1e293b" stroke="#64748b" stroke-width=".8"/><path d="M42 15v3.4" stroke="#cbd5e1" stroke-width="1.3" stroke-linecap="round"/>' +
      '<circle cx="48" cy="33" r="3.2" fill="#ef4444" stroke="#7f1d1d"/><circle cx="39" cy="33" r="3.2" fill="#111827" stroke="#475569"/>' +
      '<path d="M8 11h48" stroke="#64748b" stroke-opacity=".5" stroke-width=".7"/>';
  };

  icon['battery-9v'] = function () {
    return defs('<linearGradient id="i9v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f2937"/><stop offset=".5" stop-color="#374151"/><stop offset="1" stop-color="#111827"/></linearGradient>') +
      '<rect x="20" y="14" width="26" height="31" rx="3" fill="url(#i9v)" stroke="#0b1220"/>' +
      '<rect x="24" y="9" width="7" height="5" rx="1.4" fill="#cbd5e1" stroke="#94a3b8"/><rect x="35" y="9" width="7" height="5" rx="1.4" fill="#cbd5e1" stroke="#94a3b8"/>' +
      '<rect x="23" y="18" width="20" height="9" rx="1" fill="#f59e0b"/><text x="33" y="25" text-anchor="middle" font-family="Arial" font-size="6" font-weight="800" fill="#3b2602">9V</text>' +
      '<text x="33" y="34" text-anchor="middle" font-family="Arial" font-size="4.3" fill="#9ca3af">ALKALINE</text>' +
      '<path d="M33 37.5h7" stroke="#64748b" stroke-width=".8"/>';
  };

  icon['coin-cell'] = function () {
    return defs('<radialGradient id="iCoin" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f1f5f9"/><stop offset=".6" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></radialGradient>') +
      '<path d="M27 34v12M37 34v12" stroke="#9aa4b2" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="32" cy="23" r="13.5" fill="url(#iCoin)" stroke="#8492a6"/>' +
      '<circle cx="32" cy="23" r="10" fill="none" stroke="#b6c0cd" stroke-width=".8"/>' +
      '<text x="32" y="22" text-anchor="middle" font-family="Arial" font-size="4.2" font-weight="700" fill="#5b6675">CR2032</text>' +
      '<text x="32" y="28" text-anchor="middle" font-family="Arial" font-size="5" fill="#5b6675">3V</text>' +
      '<path d="M38 11.5v4M36 13.5h4" stroke="#64748b" stroke-width="1" stroke-linecap="round"/>';
  };

  icon['aa-battery'] = function () {
    return defs('<linearGradient id="iAA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d1d5db"/><stop offset=".35" stop-color="#f8fafc"/><stop offset="1" stop-color="#9ca3af"/></linearGradient>') +
      '<rect x="25" y="11" width="14" height="32" rx="6" fill="url(#iAA)" stroke="#8b95a5"/>' +
      '<rect x="29" y="7" width="6" height="5" rx="1.4" fill="#cbd5e1" stroke="#94a3b8"/>' +
      '<rect x="25" y="19" width="14" height="14" fill="#f59e0b"/><text x="32" y="28" text-anchor="middle" font-family="Arial" font-size="5.3" font-weight="800" fill="#3b2602">AA</text>' +
      '<path d="M27 14v4" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>';
  };

  function icIcon(label, sub) {
    let pins = '';
    for (let i = 0; i < 7; i++) {
      const x = 11 + i * 7;
      pins += '<path d="M' + x + ' 11v5M' + x + ' 36v5" stroke="#9aa4b2" stroke-width="1.7" stroke-linecap="round"/>';
      pins += '<rect x="' + (x - 1.6) + '" y="9" width="3.2" height="2" rx=".5" fill="#cbd5e1"/><rect x="' + (x - 1.6) + '" y="41" width="3.2" height="2" rx=".5" fill="#cbd5e1"/>';
    }
    return defs('<linearGradient id="iChip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#343a42"/><stop offset="1" stop-color="#171b21"/></linearGradient>') +
      pins + '<rect x="7" y="15" width="50" height="22" rx="2.4" fill="url(#iChip)" stroke="#0b0e12"/>' +
      '<path d="M15 15a5 5 0 0 1 0 10" fill="#0b0e12"/><circle cx="13.5" cy="20" r="1.1" fill="#6b7280"/>' +
      '<text x="35" y="25.5" text-anchor="middle" font-family="monospace" font-size="6.4" font-weight="700" fill="#f1f5f9">' + esc(label) + '</text>' +
      '<text x="35" y="31" text-anchor="middle" font-family="monospace" font-size="3.5" fill="#8b949e">' + esc(sub || 'LOGIC') + '</text>';
  }
  icon.ic74hc08 = function () { return icIcon('74HC08', 'QUAD AND'); };
  icon.ic74hc32 = function () { return icIcon('74HC32', 'QUAD OR'); };
  icon.ic74hc04 = function () { return icIcon('74HC04', 'HEX NOT'); };
  icon.ic74hc86 = function () { return icIcon('74HC86', 'QUAD XOR'); };
  icon.ic74hc02 = function () { return icIcon('74HC02', 'QUAD NOR'); };
  icon.ic74hc20 = function () { return icIcon('74HC20', 'DUAL 4-IN NAND'); };
  icon.ic74hc21 = function () { return icIcon('74HC21', 'DUAL 4-IN AND'); };
  icon.ic74hc00 = function () { return icIcon('74HC00', 'QUAD NAND'); };
  icon.ic74hc74 = function () { return icIcon('74HC74', 'DUAL D-FF'); };
  icon.ic74hc283 = function () { return icIcon('74HC283', '4-BIT ADDER'); };
  icon.ic74hc157 = function () { return icIcon('74HC157', 'QUAD 2:1 MUX'); };
  icon.ic74hc138 = function () { return icIcon('74HC138', '3-TO-8 DECODER'); };
  icon.ic74hc85 = function () { return icIcon('74HC85', '4-BIT COMPARE'); };

  icon['arduino-uno'] = function () {
    let headers = '';
    for (let i = 0; i < 10; i++) {
      headers += '<circle cx="' + (24 + i * 3.3) + '" cy="10.5" r="1" fill="#111827"/><circle cx="' + (24 + i * 3.3) + '" cy="41.5" r="1" fill="#111827"/>';
    }
    return defs('<linearGradient id="iUno" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="#155e75"/></linearGradient>') +
      '<rect x="10" y="7" width="46" height="38" rx="3" fill="url(#iUno)" stroke="#0c4a5e"/>' +
      '<rect x="4" y="18" width="9" height="12" rx="1.5" fill="#cbd5e1" stroke="#94a3b8"/>' +
      '<rect x="17" y="24" width="13" height="10" rx="1" fill="#1f2937"/><path d="M18 26h3M18 28h3M18 30h3" stroke="#6b7280" stroke-width=".5"/>' +
      headers +
      '<text x="44" y="35" font-family="Arial" font-size="5.6" font-weight="800" fill="#ecfeff">UNO</text>' +
      '<circle cx="43" cy="15" r="1.6" fill="#34d399"/><circle cx="47" cy="15" r="1.6" fill="#fbbf24"/>' +
      '<path d="M14 12h4M14 14h4" stroke="#a5f3fc" stroke-width=".6" opacity=".7"/>';
  };

  icon.microbit = function () {
    let leds = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) leds += '<circle cx="' + (24 + c * 4) + '" cy="' + (18 + r * 4) + '" r="1.15" fill="#ef4444"/>';
    let teeth = '';
    for (let i = 0; i < 12; i++) teeth += '<rect x="' + (17 + i * 2.6) + '" y="38" width="1.6" height="3" fill="#d4a72c"/>';
    return '<rect x="14" y="8" width="36" height="32" rx="5" fill="#1f2937" stroke="#0b1220"/>' +
      leds + teeth +
      '<text x="32" y="37" text-anchor="middle" font-family="Arial" font-size="3.8" fill="#cbd5e1">micro:bit</text>' +
      '<circle cx="19" cy="13" r="1.4" fill="#64748b"/><circle cx="45" cy="13" r="1.4" fill="#64748b"/>';
  };

  icon['dc-motor'] = function () {
    return defs('<linearGradient id="iMotor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".45" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>') +
      '<path d="M13 24h7M46 22c4 0 4-4 8-4M46 28c4 0 4 4 8 4" stroke="#9aa4b2" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="20" y="17" width="26" height="16" rx="5" fill="url(#iMotor)" stroke="#7b8798"/>' +
      '<rect x="17" y="19" width="4" height="12" rx="1.5" fill="#a8b2bf" stroke="#7b8798"/>' +
      '<circle cx="46" cy="25" r="2.2" fill="#64748b"/>' +
      '<path d="M24 20v10M28 20v10" stroke="#94a3b8" stroke-opacity=".45" stroke-width=".7"/>' +
      '<path d="M34 20h6" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"/>';
  };

  icon.servo = function () {
    return defs('<linearGradient id="iServo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1e40af"/></linearGradient>') +
      '<rect x="11" y="22" width="7" height="10" rx="1.5" fill="#3b82f6" stroke="#1e3a8a"/><rect x="46" y="22" width="7" height="10" rx="1.5" fill="#3b82f6" stroke="#1e3a8a"/>' +
      '<circle cx="14.5" cy="27" r="1.4" fill="#dbeafe"/><circle cx="49.5" cy="27" r="1.4" fill="#dbeafe"/>' +
      '<rect x="18" y="16" width="28" height="22" rx="2.5" fill="url(#iServo)" stroke="#1e3a8a"/>' +
      '<path d="M32 8v8" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="32" cy="16" r="4.5" fill="#e2e8f0" stroke="#64748b" stroke-width=".8"/>' +
      '<circle cx="32" cy="16" r="1.6" fill="#64748b"/>' +
      '<path d="M21 30h4M21 33h4" stroke="#93c5fd" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>' +
      '<text x="38" y="34" text-anchor="middle" font-family="Arial" font-size="4.5" font-weight="700" fill="#dbeafe">SG90</text>' +
      '<path d="M24 38v8" stroke="#7c4a2d" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M32 38v8" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M40 38v8" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="22" y="44" width="20" height="4" rx="1.4" fill="#1f2937"/>';
  };

  icon['vibration-motor'] = function () {
    return defs('<radialGradient id="iVib" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></radialGradient>') +
      '<path d="M40 26c5 0 5-4 9-4M40 30c5 0 5 4 9 4" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="30" cy="27" r="11" fill="url(#iVib)" stroke="#7b8798"/>' +
      '<path d="M30 18a9 9 0 0 1 7 3l-5 4z" fill="#c9a35a" opacity=".8"/>' +
      '<circle cx="30" cy="27" r="2" fill="#64748b"/>' +
      '<path d="M23 24c1-2 3-3 4.5-3.2" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>';
  };

  function partIcon(id) {
    const body = (icon[id] || icon.resistor)();
    return '<svg viewBox="0 0 64 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + body + '</svg>';
  }

  /* ============================================================
     Canvas components
     ============================================================ */

  function legs(pins, color) {
    return pins.map(function (p) {
      return '<circle cx="' + n(p.x) + '" cy="' + n(p.y) + '" r="2.2" fill="#cbd3df" stroke="#77869a" stroke-width=".7"/>';
    }).join('');
  }

  function resistorArt(comp, pins) {
    const a = pinOf(pins, '1'), b = pinOf(pins, '2');
    const val = comp.props && comp.props.resistance ? Number(comp.props.resistance) : 220;
    const codes = {
      100: ['#7a4b22', '#111827', '#7a4b22'],
      220: ['#c84545', '#c84545', '#7a4b22'],
      330: ['#d97706', '#d97706', '#7a4b22'],
      470: ['#eab308', '#7c3aed', '#7a4b22'],
      1000: ['#7a4b22', '#111827', '#c84545'],
      10000: ['#7a4b22', '#111827', '#d97706']
    };
    const bands = (codes[val] || codes[220]).concat(['#d5a62c']);
    let bandRects = '';
    bands.forEach(function (c, i) {
      bandRects += '<rect x="' + (-15 + i * 6) + '" y="-17" width="3.2" height="13" rx=".6" fill="' + c + '"/>';
    });
    return '<path d="M' + a.x + ' ' + a.y + ' L-18 -10 M18 -10 L' + b.x + ' ' + b.y + '" stroke="#9aa4b2" stroke-width="1.8" stroke-linecap="round"/>' +
      '<rect x="-18" y="-17" width="36" height="14" rx="5.5" fill="#d8c39c" stroke="#a98b5b" stroke-width=".9"/>' +
      bandRects +
      '<path d="M-14 -14.6h27" stroke="#fff" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/>' +
      legs([a, b]);
  }

  function ledArt(comp, pins) {
    const a = pinOf(pins, 'a'), k = pinOf(pins, 'k');
    const colors = comp.props && comp.props.color ? comp.props.color : 'red';
    const palette = {
      red: ['#ef4444', '#b91c1c', '#fecaca'],
      green: ['#22c55e', '#15803d', '#bbf7d0'],
      yellow: ['#facc15', '#a16207', '#fef08a'],
      blue: ['#3b82f6', '#1d4ed8', '#bfdbfe']
    }[colors] || ['#ef4444', '#b91c1c', '#fecaca'];
    const b = comp.sim && comp.sim.led && comp.sim.led.on ? comp.sim.led : null;
    const bright = b ? Math.max(.25, Math.min(1, b.brightness)) : 0;
    const cx = 0, cy = -28;
    return '<circle class="led-glow ' + (b ? 'on' : '') + '" cx="' + cx + '" cy="' + cy + '" r="27" fill="url(#ledGlow' + colors + ')" style="opacity:' + (b ? .28 + bright * .62 : 0) + '"/>' +
      // Anode (A, long lead): deliberately curved and longer than the cathode.
      '<path d="M' + a.x + ' ' + a.y + ' C-21 -2 -21 -11 -14 -13 C-10 -15 -9 -17 -8 -18" fill="none" stroke="#2563eb" stroke-width="3.8" stroke-linecap="round"/>' +
      // Cathode (K, short lead): straight and visibly shorter.
      '<path d="M' + k.x + ' ' + k.y + ' L10 -8 L8 -17" fill="none" stroke="#64748b" stroke-width="2.8" stroke-linecap="round"/>' +
      '<path d="M-8 -17 L-8 -21 M8 -17 L8 -21" stroke="#475569" stroke-width="2.2"/>' +
      '<rect x="-11" y="-22" width="22" height="4.6" rx="1.4" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".6"/>' +
      '<circle class="led-core ' + (b ? 'on' : '') + '" cx="0" cy="' + (cy) + '" r="11" fill="' + (b ? palette[0] : palette[1]) + '" stroke="' + palette[1] + '" stroke-width=".9" style="color:' + palette[0] + ';fill:' + (b ? '#ff6262' : palette[1]) + '"/>' +
      '<path d="M10.5 -24 L11.5 -18" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M-6.5 -33c1.6-2.8 4.3-4.2 6.8-4.1" fill="none" stroke="#fff" stroke-opacity=".66" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M-9.5 -18.5a11 11 0 0 0 19 0" fill="none" stroke="' + palette[2] + '" stroke-opacity=".22" stroke-width="1"/>' +
      '<path d="M-6 13v3M6 13v3" stroke="#7c8796" stroke-width="1.4" stroke-linecap="round"/>' +
      legs([a, k]);
  }

  function buttonArt(comp, pins) {
    const a = pinOf(pins, '1'), b = pinOf(pins, '2');
    const pressed = !!(comp.props && comp.props.pressed);
    const capY = pressed ? -21 : -26;
    return '<path d="M-6 0v-9M6 0v-9M' + a.x + ' 0v-7M' + b.x + ' 0v-7" stroke="#9aa4b2" stroke-width="1.8" stroke-linecap="round"/>' +
      '<rect x="-15" y="-18" width="30" height="11" rx="2" fill="#2b3038" stroke="#171b21" stroke-width=".8"/>' +
      '<rect x="-12" y="-21" width="24" height="10" rx="2" fill="#3b424d"/>' +
      '<circle cx="0" cy="' + capY + '" r="7.6" fill="url(#btnCap)" stroke="#991b1b" stroke-width=".8"/>' +
      '<ellipse cx="-2.5" cy="' + (capY - 2.5) + '" rx="2.4" ry="1.5" fill="#fff" opacity=".3"/>' +
      '<circle cx="-8" cy="-14.5" r="1" fill="#111"/><circle cx="8" cy="-14.5" r="1" fill="#111"/>' +
      legs([a, b]);
  }

  function potArt(comp, pins) {
    const a = pinOf(pins, '1'), w = pinOf(pins, '2'), b = pinOf(pins, '3');
    const pos = comp.props && typeof comp.props.position === 'number' ? comp.props.position : 50;
    const ang = -110 + pos * 2.2;
    return '<path d="M' + a.x + ' ' + a.y + 'V-14 M' + w.x + ' ' + w.y + 'V-14 M' + b.x + ' ' + b.y + 'V-14" stroke="#9aa4b2" stroke-width="1.8" stroke-linecap="round"/>' +
      '<rect x="-16" y="-31" width="32" height="20" rx="2.5" fill="url(#potBody)" stroke="#1e3a8a" stroke-width=".8"/>' +
      '<circle cx="0" cy="-21" r="7.2" fill="#e2e8f0" stroke="#7c8ba0" stroke-width=".7"/>' +
      '<circle cx="0" cy="-21" r="5.3" fill="#f8fafc"/>' +
      '<path d="M0 -21 L' + n(Math.sin(ang * Math.PI / 180) * 4.4) + ' ' + n(-21 - Math.cos(ang * Math.PI / 180) * 4.4) + '" stroke="#475569" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M-13 -28.5h26" stroke="#fff" stroke-opacity=".16" stroke-width="1.2"/>' +
      '<text x="0" y="-13.2" text-anchor="middle" font-family="monospace" font-size="3.6" fill="#bfdbfe">10k</text>' +
      legs([a, w, b]);
  }

  function capArt(comp, pins) {
    const a = pinOf(pins, '1'), b = pinOf(pins, '2');
    return '<path d="M' + a.x + ' ' + a.y + 'V-17 M' + b.x + ' ' + b.y + 'V-17" stroke="#9aa4b2" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-27" r="9.5" fill="url(#capBody)" stroke="#1e40af" stroke-width=".8"/>' +
      '<circle cx="0" cy="-27" r="6.2" fill="none" stroke="#bfdbfe" stroke-opacity=".3" stroke-width=".8"/>' +
      '<text x="0" y="-25" text-anchor="middle" font-family="monospace" font-size="4.2" font-weight="700" fill="#eff6ff">104</text>' +
      '<path d="M-6.5 -32.5c1.4-1.9 3.4-2.7 5.1-2.6" stroke="#fff" stroke-opacity=".38" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      legs([a, b]);
  }

  function slideArt(comp, pins) {
    const a = pinOf(pins, '1'), w = pinOf(pins, '2'), b = pinOf(pins, '3');
    const knobX = Number(comp.props && comp.props.position) === 0 ? -5 : 5;
    const label = comp.props && comp.props.label ? String(comp.props.label) : '';
    const lw = Math.max(13, label.length * 4 + 6);
    return '<path d="M' + a.x + ' ' + a.y + 'V-13 M' + w.x + ' ' + w.y + 'V-13 M' + b.x + ' ' + b.y + 'V-13" stroke="#9aa4b2" stroke-width="1.8" stroke-linecap="round"/>' +
      '<rect x="-16" y="-26" width="32" height="14" rx="2.2" fill="url(#slideBody)" stroke="#111827" stroke-width=".8"/>' +
      '<rect x="-11" y="-29" width="22" height="6" rx="1.6" fill="#374151"/>' +
      '<rect x="' + (knobX - 3.4) + '" y="-31" width="6.8" height="8" rx="1.2" fill="#e5e7eb" stroke="#9ca3af" stroke-width=".6"/>' +
      '<path d="M' + knobX + ' -29v4" stroke="#6b7280" stroke-width=".9"/>' +
      '<text x="-9" y="-14.5" text-anchor="middle" font-family="monospace" font-size="3" fill="#9ca3af">1</text><text x="0" y="-14.5" text-anchor="middle" font-family="monospace" font-size="3" fill="#9ca3af">2</text><text x="9" y="-14.5" text-anchor="middle" font-family="monospace" font-size="3" fill="#9ca3af">3</text>' +
      (label ? '<rect x="' + (-lw / 2) + '" y="-40" width="' + lw + '" height="9" rx="2.4" fill="#101828"/><text x="0" y="-33.2" text-anchor="middle" font-family="monospace" font-size="5" font-weight="700" fill="#fff">' + esc(label) + '</text>' : '') +
      legs([a, w, b]);
  }

  function buzzerArt(comp, pins) {
    const a = pinOf(pins, '+'), b = pinOf(pins, '-');
    const active = comp.sim && comp.sim.buzzer;
    return '<path d="M' + a.x + ' ' + a.y + 'V-15 M' + b.x + ' ' + b.y + 'V-15" stroke="#9aa4b2" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-25" r="10.5" fill="url(#buzBody)" stroke="#0b1220" stroke-width=".8"/>' +
      '<circle cx="0" cy="-25" r="7.4" fill="#1f2937" stroke="#64748b" stroke-width=".5"/>' +
      '<circle cx="0" cy="-25" r="1.8" fill="#0b1220"/>' +
      (active ? '<path d="M10 -25a10 10 0 0 1-3 7M-10 -25a10 10 0 0 0 3 7" stroke="#fbbf24" stroke-width="1.4" fill="none" opacity=".9"/>' : '') +
      '<path d="M4.8 -33.5h3M6.3 -35v3" stroke="#f8fafc" stroke-width="1.1" stroke-linecap="round"/>' +
      legs([a, b]);
  }

  function batteryArt(comp, pins) {
    const pos = pinOf(pins, '+'), neg = pinOf(pins, '-');
    const type = comp.type;
    if (type === 'coin-cell') {
      return '<path d="M' + pos.x + ' ' + pos.y + 'V-7 M' + neg.x + ' ' + neg.y + 'V-7" stroke="#9aa4b2" stroke-width="1.8"/>' +
        '<circle cx="0" cy="-20" r="13" fill="url(#coinBody)" stroke="#8492a6" stroke-width=".8"/>' +
        '<circle cx="0" cy="-20" r="9.4" fill="none" stroke="#b6c0cd" stroke-width=".6"/>' +
        '<text x="0" y="-21.5" text-anchor="middle" font-family="Arial" font-size="3.4" fill="#5b6675">CR2032</text>' +
        '<text x="0" y="-16.5" text-anchor="middle" font-family="Arial" font-size="4.3" font-weight="700" fill="#4b5563">3V</text>' +
        '<path d="M6 -31v3M4.5 -29.5h3" stroke="#64748b" stroke-width=".8"/>' + legs([pos, neg]);
    }
    if (type === 'aa-battery') {
      return '<path d="M' + pos.x + ' ' + pos.y + 'V-8 M' + neg.x + ' ' + neg.y + 'V-8" stroke="#9aa4b2" stroke-width="1.8"/>' +
        '<rect x="-7" y="-33" width="14" height="25" rx="5" fill="url(#aaBody)" stroke="#8b95a5" stroke-width=".7"/>' +
        '<rect x="-3" y="-36" width="6" height="4" rx="1.3" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".5"/>' +
        '<rect x="-7" y="-25" width="14" height="10" fill="#f59e0b"/>' +
        '<text x="0" y="-18.5" text-anchor="middle" font-family="Arial" font-size="4" font-weight="800" fill="#3b2602">AA</text>' + legs([pos, neg]);
    }
    return '<rect x="-14" y="-33" width="28" height="26" rx="2.5" fill="url(#nineVBody)" stroke="#0b1220" stroke-width=".8"/>' +
      '<rect x="-10" y="-38" width="7" height="5" rx="1.2" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".5"/>' +
      '<rect x="3" y="-38" width="7" height="5" rx="1.2" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".5"/>' +
      '<path d="M' + pos.x + ' ' + pos.y + 'V-33 M' + neg.x + ' ' + neg.y + 'V-33" stroke="#9aa4b2" stroke-width="1.8"/>' +
      '<rect x="-10.5" y="-29" width="21" height="8" rx="1" fill="#f59e0b"/>' +
      '<text x="0" y="-23" text-anchor="middle" font-family="Arial" font-size="5" font-weight="800" fill="#3b2602">9V</text>' +
      '<text x="0" y="-15" text-anchor="middle" font-family="Arial" font-size="3.4" fill="#94a3b8">ALKALINE</text>' +
      '<path d="M-10 -12h20" stroke="#475569" stroke-width=".6"/>' + legs([pos, neg]);
  }

  function psuArt(comp, pins) {
    const v = comp.props && comp.props.voltage ? comp.props.voltage : 5;
    const pos = pinOf(pins, 'V+'), neg = pinOf(pins, 'GND');
    const on = comp.sim && comp.sim.powered;
    return '<rect x="-36" y="-27" width="64" height="48" rx="4" fill="url(#psuBody)" stroke="#020617" stroke-width="1"/>' +
      '<rect x="-31" y="-22" width="27" height="12" rx="1.3" fill="' + (on ? '#a7f3d0' : '#325a55') + '"/>' +
      '<text x="-27" y="-13.3" font-family="monospace" font-size="7.6" fill="#064e3b">' + v.toFixed(2) + '</text>' +
      '<rect x="-31" y="-6" width="27" height="9" rx="1" fill="' + (on ? '#a7f3d0' : '#325a55') + '" opacity=".82"/>' +
      '<text x="-27" y="1" font-family="monospace" font-size="5.4" fill="#064e3b">0.00</text>' +
      '<circle cx="9" cy="-13" r="6" fill="#1e293b" stroke="#64748b" stroke-width=".8"/>' +
      '<path d="M9 -17v4" stroke="#cbd5e1" stroke-width="1.4" stroke-linecap="round"/>' +
      legs([pos, neg]) +
      '<rect x="2.5" y="0.5" width="27" height="14" rx="2.2" fill="#0f172a" stroke="#475569" stroke-width=".7"/>' +
      '<text x="10" y="-1.2" text-anchor="middle" font-family="monospace" font-size="3.8" font-weight="700" fill="#e2e8f0">GND</text>' +
      '<text x="22" y="-1.2" text-anchor="middle" font-family="monospace" font-size="3.8" font-weight="700" fill="#fca5a5">V+</text>' +
      '<circle cx="22" cy="7" r="7.4" fill="#ef4444" opacity=".16"/>' +
      '<circle cx="22" cy="7" r="5.1" fill="#ef4444" stroke="#7f1d1d" stroke-width=".9"/>' +
      '<path d="M19.3 7h5.4M22 4.3v5.4" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>' +
      '<circle cx="10" cy="7" r="7.4" fill="#94a3b8" opacity=".16"/>' +
      '<circle cx="10" cy="7" r="5.1" fill="#111827" stroke="#cbd5e1" stroke-width="1"/>' +
      '<path d="M7.4 7h5.2" stroke="#f8fafc" stroke-width="1.1" stroke-linecap="round"/>' +
      '<text x="-27" y="16" font-family="monospace" font-size="3.8" fill="#94a3b8">DC POWER</text>';
  }

  function icArt(comp, pins) {
    const h = 12;
    const n = pins.length || 14;
    const half = n / 2;
    const edge = Math.max.apply(null, pins.map(function (p) { return Math.abs(p.x); })) + 6;
    const top = -16, bottom = 16;
    let lines = '';
    pins.forEach(function (p) {
      const py = p.y < 0 ? -h : h;
      lines += '<path d="M' + p.x + ' ' + py + 'V' + p.y + '" stroke="#9aa3ae" stroke-width="3" stroke-linecap="round"/>';
    });
    let nums = '';
    pins.slice(0, half).forEach(function (p, idx) {
      nums += '<text x="' + p.x + '" y="' + (bottom + 7) + '" text-anchor="middle" font-family="monospace" font-size="3.1" fill="#8b949e">' + (idx + 1) + '</text>';
    });
    pins.slice(half).forEach(function (p, idx) {
      nums += '<text x="' + p.x + '" y="' + (top + 2) + '" text-anchor="middle" font-family="monospace" font-size="3.1" fill="#8b949e">' + (n - idx) + '</text>';
    });
    return lines +
      '<rect x="' + (-edge) + '" y="' + (-h) + '" width="' + (edge * 2) + '" height="' + (h * 2) + '" rx="2" fill="url(#icBody)" stroke="#0b0e12" stroke-width=".8"/>' +
      '<path d="M' + (-edge + 4) + ' ' + (-h) + 'a6 6 0 0 1 0 12" fill="#0b0e12"/>' +
      '<circle cx="' + (-edge + 3) + '" cy="' + (h - 4) + '" r="1.5" fill="#5b6472"/>' +
      '<text x="0" y="1.5" text-anchor="middle" font-family="monospace" font-size="7.4" font-weight="700" fill="#f4f4f2">' + esc(comp.props.label || '74HC08') + '</text>' +
      '<text x="0" y="8" text-anchor="middle" font-family="monospace" font-size="3.3" fill="#8f969f">' + esc(comp.props.sub || 'QUAD 2-INPUT') + '</text>' +
      nums;
  }

  function boardArt(comp, pins, which) {
    if (comp.type === 'arduino-uno') {
      const d13on = comp.sim && comp.sim.io && comp.sim.io.d13 && Number(comp.sim.io.d13.value) > 0;
      return '<rect x="-44" y="-30" width="88" height="60" rx="4" fill="url(#unoBody)" stroke="#0c4a5e" stroke-width="1"/>' +
        '<rect x="-53" y="-10" width="12" height="20" rx="2" fill="#cbd5e1" stroke="#94a3b8"/>' +
        '<rect x="-26" y="-4" width="24" height="16" rx="1.5" fill="#111827"/>' +
        '<text x="-14" y="4" font-family="monospace" font-size="4" fill="#9ca3af">ATmega328P</text>' +
        '<text x="25" y="12" font-family="Arial" font-size="8" font-weight="800" fill="#ecfeff">UNO</text>' +
        '<rect x="-40" y="24" width="76" height="6" rx="1" fill="#0b1220" opacity=".55"/>' +
        '<rect x="-40" y="-28" width="76" height="5" rx="1" fill="#0b1220" opacity=".45"/>' +
        '<circle cx="36" cy="-18" r="2.4" fill="#34d399"/><circle cx="29" cy="-18" r="2.4" fill="#fbbf24"/>' +
        '<circle cx="36" cy="-11" r="2.6" fill="' + (d13on ? '#fde047' : '#64748b') + '"' + (d13on ? ' filter="drop-shadow(0 0 3px #fde047)"' : '') + '/>' +
        '<text x="32" y="-4" font-family="monospace" font-size="3" fill="#cbd5e1">L</text>' +
        '<text x="-37" y="-8" font-family="monospace" font-size="3.4" fill="#a5f3fc">DIGITAL</text>' +
        '<path d="M-37 19H31" stroke="#a5f3fc" stroke-opacity=".5" stroke-width=".6"/>';
    }
    if (comp.type === 'microbit') {
      let leds = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) leds += '<circle cx="' + (-16 + c * 8) + '" cy="' + (-14 + r * 8) + '" r="2.2" fill="#ef4444"/>';
      let teeth = '';
      for (let i = 0; i < 16; i++) teeth += '<rect x="' + (-28 + i * 3.6) + '" y="26" width="2.4" height="5" fill="#d4a72c"/>';
      return '<rect x="-32" y="-28" width="64" height="56" rx="7" fill="#1f2937" stroke="#0b1220" stroke-width="1"/>' + leds + teeth +
        '<text x="0" y="23" text-anchor="middle" font-family="Arial" font-size="4.2" fill="#cbd5e1">micro:bit</text>' +
        '<circle cx="-23" cy="-20" r="2" fill="#64748b"/><circle cx="23" cy="-20" r="2" fill="#64748b"/>';
    }
    return '';
  }

  function motorArt(comp, pins) {
    if (comp.type === 'servo') {
      const gnd = pinOf(pins, 'gnd'), v = pinOf(pins, 'vcc'), sig = pinOf(pins, 'sig');
      const ang = comp.sim && typeof comp.sim.angle === 'number' ? comp.sim.angle : 90;
      return '<path d="M-12 17v' + (Math.abs(pins[0].y) - 17) + 'M0 17v' + (Math.abs(pins[1].y) - 17) + 'M12 17v' + (Math.abs(pins[2].y) - 17) + '" stroke="#9aa4b2" stroke-width="1.8"/>' +
        '<rect x="-18" y="-10" width="36" height="27" rx="3" fill="url(#servoBody)" stroke="#1e3a8a"/>' +
        '<circle cx="0" cy="-10" r="4" fill="#dbeafe" stroke="#64748b" stroke-width=".6"/>' +
        '<g class="servo-horn" style="transform:rotate(' + (ang - 90) + 'deg)"><rect x="-2" y="-22" width="4" height="12" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" stroke-width=".5"/><circle cx="0" cy="-21" r="1.6" fill="#64748b"/></g>' +
        '<text x="0" y="8" text-anchor="middle" font-family="Arial" font-size="4" font-weight="700" fill="#dbeafe">SG90</text>' +
        '<path d="M-6 -14h12" stroke="#fff" stroke-opacity=".2" stroke-width="1"/>' + legs([gnd, v, sig]);
    }
    if (comp.type === 'vibration-motor') {
      const a = pinOf(pins, '+'), b = pinOf(pins, '-');
      return '<path d="M' + a.x + ' ' + a.y + 'V-15 M' + b.x + ' ' + b.y + 'V-15" stroke="#9aa4b2" stroke-width="1.8"/>' +
        '<circle cx="0" cy="-24" r="10" fill="url(#vibBody)" stroke="#7b8798"/>' +
        '<path d="M0 -33a9 9 0 0 1 7 3l-5 4z" fill="#c9a35a" opacity=".85"/>' +
        '<circle cx="0" cy="-24" r="2" fill="#64748b"/>' +
        '<path d="M-6 -28c1-1.7 2.6-2.6 4-2.8" stroke="#fff" stroke-opacity=".5" stroke-width="1.3" stroke-linecap="round"/>' + legs([a, b]);
    }
    const a = pinOf(pins, '1'), b = pinOf(pins, '2');
    const spin = comp.sim && comp.sim.motor;
    return '<path d="M' + a.x + ' ' + a.y + 'V-14 M' + b.x + ' ' + b.y + 'V-14" stroke="#9aa4b2" stroke-width="1.8"/>' +
      '<rect x="-16" y="-30" width="32" height="18" rx="5" fill="url(#motorBody)" stroke="#7b8798"/>' +
      '<rect x="-18.5" y="-28" width="4" height="14" rx="1.4" fill="#a8b2bf" stroke="#7b8798" stroke-width=".5"/>' +
      '<circle cx="17" cy="-21" r="2.2" fill="#64748b"/>' +
      '<g class="' + (spin ? 'motor-blade' : '') + '" style="transform-origin:0px -21px">' +
      '<path d="M-9 -21h18M0 -30v18" stroke="#94a3b8" stroke-opacity=".5" stroke-width=".8"/>' +
      '<circle cx="0" cy="-21" r="4.2" fill="none" stroke="#64748b" stroke-width=".7"/></g>' +
      '<text x="-1" y="-17" text-anchor="middle" font-family="monospace" font-size="2.9" fill="#fff" opacity=".65">3-6V</text>' +
      legs([a, b]);
  }

  function component(comp, pins) {
    const t = comp.type;
    switch (t) {
      case 'resistor': return resistorArt(comp, pins);
      case 'led': return ledArt(comp, pins);
      case 'button': return buttonArt(comp, pins);
      case 'potentiometer': return potArt(comp, pins);
      case 'capacitor': return capArt(comp, pins);
      case 'slide-switch': return slideArt(comp, pins);
      case 'buzzer': return buzzerArt(comp, pins);
      case 'battery-9v': case 'coin-cell': case 'aa-battery': return batteryArt(comp, pins);
      case 'power-supply': return psuArt(comp, pins);
      case 'ic74hc08': case 'ic74hc32': case 'ic74hc04': case 'ic74hc86': case 'ic74hc02': case 'ic74hc20': case 'ic74hc21':
      case 'ic74hc00': case 'ic74hc74': case 'ic74hc283': case 'ic74hc157': case 'ic74hc138': case 'ic74hc85': return icArt(comp, pins);
      case 'arduino-uno': case 'microbit': return boardArt(comp, pins);
      case 'dc-motor': case 'servo': case 'vibration-motor': return motorArt(comp, pins);
      default: return '<circle r="8" fill="#94a3b8"/>';
    }
  }

  /* ============================================================
     Covers & illustrations
     ============================================================ */
  function gateSymbol(type, x, y, s) {
    s = s || 1;
    const stroke = '#334155';
    const fill = '#fff';
    const sw = 2 / s;
    if (type === 'AND' || type === 'NAND') {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '">' +
        '<path d="M0 -13h16a13 13 0 0 1 0 26H0z"/>' +
        (type === 'NAND' ? '<circle cx="31" cy="0" r="3"/>' : '') +
        '<path d="M-10 -7H0M-10 7H0M' + (type === 'NAND' ? 34 : 29) + ' 0h10" fill="none"/></g>';
    }
    if (type === 'NOT') {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '">' +
        '<path d="M0 -14 22 0 0 14z"/><circle cx="25" cy="0" r="3"/><path d="M-10 0H0M28 0h9" fill="none"/></g>';
    }
    const extra = type === 'XOR' || type === 'XNOR' ? '<path d="M-13 -14c8 8 8 20 0 28" fill="none"/>' : '';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '">' +
      '<path d="M-8 -14c11 0 26 4 32 14-6 10-21 14-32 14 7-9 7-19 0-28z"/>' + extra +
      (type === 'NOR' || type === 'XNOR' ? '<circle cx="27" cy="0" r="3"/>' : '') +
      '<path d="M-18 -7h10M-18 7h10M' + (type === 'NOR' || type === 'XNOR' ? 30 : 24) + ' 0h10" fill="none"/></g>';
  }

  function cover(kind) {
    const wrap = function (inner) { return '<svg viewBox="0 0 600 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; };
    const boardBase = '<rect x="105" y="70" width="390" height="108" rx="12" fill="#f4f0e6" stroke="#ded8ca"/>' +
      '<rect x="120" y="84" width="360" height="3" fill="#eeb9b9"/><rect x="120" y="160" width="360" height="3" fill="#b9c9ec"/>' +
      '<rect x="110" y="120" width="380" height="4" fill="#e8e3d7"/>';
    const dots = (function () {
      let s = '';
      for (let c = 0; c < 30; c++) for (let r = 0; r < 3; r++) s += '<circle cx="' + (126 + c * 11.6) + '" cy="' + (96 + r * 10) + '" r="1.25" fill="#c6c1b5"/>';
      for (let c = 0; c < 30; c++) for (let r = 0; r < 3; r++) s += '<circle cx="' + (126 + c * 11.6) + '" cy="' + (132 + r * 10) + '" r="1.25" fill="#c6c1b5"/>';
      return s;
    })();
    if (kind === 'led' || kind === 'breadboard' || kind === 'project') {
      return wrap(boardBase + dots +
        '<path d="M126 126h42c24 0 24-56 48-56h30" fill="none" stroke="#e05252" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M330 70c20 0 24 34 44 34h94" fill="none" stroke="#3c4657" stroke-width="3.4" stroke-linecap="round"/>' +
        '<g transform="translate(284 108)"><path d="M-34 0h14M20 0h16" stroke="#9aa4b2" stroke-width="2.4"/><rect x="-22" y="-6" width="42" height="12" rx="5" fill="#d8c39c" stroke="#a98b5b"/><rect x="-15" y="-6" width="3" height="12" fill="#c84545"/><rect x="-10" y="-6" width="3" height="12" fill="#c84545"/><rect x="-5" y="-6" width="3" height="12" fill="#7a4b22"/><rect x="2" y="-6" width="3" height="12" fill="#d5a62c"/></g>' +
        '<g transform="translate(356 84)"><circle r="22" fill="#ff5d5d" opacity=".16"/><circle r="12" fill="#ef4444" stroke="#b91c1c"/><path d="M-5-5c1.6-2.6 4-3.6 6-3.5" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-6 12v14M6 12v10" stroke="#9aa4b2" stroke-width="2.2"/><rect x="-7" y="10" width="14" height="4" rx="1" fill="#cbd5e1"/></g>' +
        '<g transform="translate(112 96)"><rect x="-19" y="-17" width="38" height="34" rx="4" fill="#1e293b"/><rect x="-14" y="-12" width="18" height="9" rx="1" fill="#a7f3d0"/><text x="-11" y="-5" font-family="monospace" font-size="5" fill="#064e3b">5.00</text><circle cx="9" cy="10" r="2.4" fill="#ef4444"/><circle cx="1" cy="10" r="2.4" fill="#111"/></g>' +
        '<g transform="translate(468 54)"><rect x="-42" y="-13" width="84" height="26" rx="4" fill="#1f2937"/><text x="0" y="4" text-anchor="middle" font-family="monospace" font-size="7" fill="#f4f4f2">74HC08</text></g>');
    }
    if (kind === 'gates' || kind === 'xor' || kind === 'logic') {
      return wrap('<circle cx="480" cy="40" r="90" fill="#2563eb" opacity=".05"/><circle cx="120" cy="150" r="80" fill="#10b981" opacity=".05"/>' +
        gateSymbol('AND', 120, 62, 1.35) + gateSymbol('OR', 330, 62, 1.35) + gateSymbol('NOT', 500, 62, 1.2) +
        gateSymbol('XOR', 120, 138, 1.35) + gateSymbol('NAND', 330, 138, 1.35) + gateSymbol('NOR', 500, 138, 1.2) +
        '<path d="M90 62H70M73 138H52M301 62h-18M301 138h-18M461 62h-12M461 138h-12" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 4"/>');
    }
    if (kind === 'button') {
      return wrap(boardBase + dots +
        '<path d="M130 128h50v-24h44M300 104h60c22 0 22 30 44 30h34" fill="none" stroke="#2e9e77" stroke-width="3.2" stroke-linecap="round"/>' +
        '<g transform="translate(250 90)"><circle r="30" fill="#ef4444" opacity=".08"/><rect x="-34" y="4" width="68" height="18" rx="4" fill="#2b3038"/><circle cy="0" r="14" fill="#ef4444" stroke="#b91c1c"/><ellipse cx="-4" cy="-5" rx="4" ry="2.6" fill="#fff" opacity=".3"/><path d="M-14 22v22M14 22v22" stroke="#9aa4b2" stroke-width="2.2"/></g>' +
        '<g transform="translate(390 96)"><circle r="18" fill="#ff5d5d" opacity=".17"/><circle r="10" fill="#ef4444" stroke="#b91c1c"/><path d="M-5 10v14M5 10v12" stroke="#9aa4b2" stroke-width="2"/></g>');
    }
    if (kind === 'code') {
      return wrap('<circle cx="470" cy="60" r="120" fill="#2563eb" opacity=".06"/><circle cx="120" cy="160" r="90" fill="#10b981" opacity=".05"/>' +
        '<g transform="translate(92 26)"><rect width="380" height="128" rx="10" fill="#101828" stroke="#26344c"/><path d="M16 9h3M25 9h3M34 9h3" stroke="#64748b" stroke-width="3.5" stroke-linecap="round"/>' +
        '<text x="20" y="43" font-family="monospace" font-size="10" fill="#7dd3fc">void setup() {</text>' +
        '<text x="32" y="61" font-family="monospace" font-size="10" fill="#f1f5f9">pinMode<tspan fill="#fbbf24">(13, OUTPUT);</tspan></text>' +
        '<text x="20" y="79" font-family="monospace" font-size="10" fill="#7dd3fc">}</text>' +
        '<text x="20" y="100" font-family="monospace" font-size="10" fill="#6ee7b7">digitalWrite(13, HIGH);</text>' +
        '<text x="20" y="117" font-family="monospace" font-size="10" fill="#c4b5fd">delay(500);</text></g>' +
        '<g transform="translate(520 82)"><rect x="-30" y="-34" width="66" height="70" rx="6" fill="#0e7490" stroke="#155e75"/><rect x="-21" y="-8" width="30" height="24" rx="2" fill="#111827"/><circle cx="16" cy="-20" r="12" fill="#ff5d5d" opacity=".18"/><circle cx="16" cy="-20" r="6.5" fill="#ef4444" stroke="#b91c1c"/><path d="M12-23c1-1.8 2.7-2.5 4-2.4" stroke="#fff" stroke-opacity=".6" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M-24 42v14M-8 42v14M8 42v14M24 42v14" stroke="#94a3b8" stroke-width="2"/></g>' +
        '<rect x="94" y="153" width="380" height="20" rx="5" fill="#101828"/><text x="284" y="167" text-anchor="middle" font-family="monospace" font-size="8" fill="#94a3b8">ARDUINO UNO · LIVE SIMULATION</text>');
    }
    if (kind === 'cap') {
      return wrap('<circle cx="470" cy="80" r="100" fill="#2563eb" opacity=".045"/>' +
        '<g transform="translate(140 88)"><path d="M-58 0h18M40 0h18" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><circle r="32" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/><circle r="24" fill="none" stroke="#bfdbfe" stroke-opacity=".35" stroke-width="1.5"/><text x="0" y="5" text-anchor="middle" font-family="monospace" font-size="15" font-weight="700" fill="#eff6ff">104</text></g>' +
        '<g transform="translate(270 88)"><path d="M-48 0h14M24 0h20" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><rect x="-34" y="-10" width="58" height="20" rx="8" fill="#d8c39c" stroke="#a98b5b" stroke-width="1.2"/><rect x="-22" y="-10" width="5" height="20" fill="#c84545"/><rect x="-14" y="-10" width="5" height="20" fill="#c84545"/><rect x="-6" y="-10" width="5" height="20" fill="#7a4b22"/><rect x="5" y="-10" width="5" height="20" fill="#d5a62c"/></g>' +
        '<path d="M162 88h42M300 88h40" stroke="#2e9e77" stroke-width="2.6" stroke-dasharray="5 4"/>' +
        '<g transform="translate(365 27)"><path d="M0 115h205M0 115V0" stroke="#cbd5e1" stroke-width="1.6" fill="none"/><path d="M0 108C34 108 52 38 78 26s44-8 68-8 50 1 58 1" stroke="#2563eb" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M0 115h12" stroke="#94a3b8" stroke-width="1.6"/><text x="50" y="120" font-family="monospace" font-size="8" fill="#94a3b8">τ = RC</text><text x="145" y="28" font-family="monospace" font-size="8" fill="#2563eb">Vc</text><text x="180" y="120" font-family="monospace" font-size="8" fill="#94a3b8">t</text></g>');
    }
    if (kind === 'pot' || kind === 'cap') {
      return wrap('<circle cx="440" cy="70" r="110" fill="#2563eb" opacity=".055"/>' +
        '<g transform="translate(170 86)"><rect x="-52" y="-38" width="104" height="76" rx="8" fill="#2563eb"/><circle r="25" fill="#e2e8f0" stroke="#94a3b8"/><path d="M0 -25V5" stroke="#475569" stroke-width="5" stroke-linecap="round"/></g>' +
        '<path d="M222 86h72" stroke="#2e9e77" stroke-width="3"/><g transform="translate(330 86)"><rect x="-24" y="-14" width="48" height="28" rx="4" fill="#f8fafc" stroke="#cbd5e1"/><text x="0" y="4" text-anchor="middle" font-family="monospace" font-size="11" fill="#2563eb">0–5V</text></g>' +
        '<path d="M354 86h86c24 0 24-40 48-40" fill="none" stroke="#e05252" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M354 86h50" stroke="#3c4657" stroke-width="3" stroke-linecap="round"/>' +
        '<g transform="translate(300 145)"><path d="M0 14c30 0 40-41 80-41" fill="none" stroke="#2563eb" stroke-width="2.4"/><path d="M74-27l7-1-5 6" fill="#2563eb"/></g>');
    }
    if (kind === 'motor') {
      return wrap('<circle cx="300" cy="88" r="120" fill="#0d9b76" opacity=".05"/>' +
        '<g transform="translate(250 88)"><rect x="-42" y="-28" width="84" height="56" rx="14" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/><rect x="-50" y="-24" width="8" height="48" rx="3" fill="#a8b2bf"/><circle cx="42" cy="0" r="8" fill="#64748b"/><circle r="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/></g>' +
        '<g transform="translate(430 88)"><rect x="-28" y="-24" width="56" height="44" rx="5" fill="#2563eb"/><circle cy="-24" r="7" fill="#dbeafe"/><rect x="-3" y="-52" width="6" height="24" rx="2" fill="#e2e8f0" stroke="#94a3b8"/><path d="M-16 20v16M0 20v22M16 20v16" stroke="#9aa4b2" stroke-width="2"/></g>' +
        '<path d="M130 128h56M142 140h34M154 152h18" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>');
    }
    return wrap(boardBase + dots);
  }

  function heroBoard() {
    let holes = '';
    for (let c = 0; c < 29; c++) {
      for (let r = 0; r < 3; r++) holes += '<circle cx="' + (58 + c * 18.5) + '" cy="' + (96 + r * 16) + '" r="2.2" fill="#c8c4ba"/>';
      for (let r = 0; r < 3; r++) holes += '<circle cx="' + (58 + c * 18.5) + '" cy="' + (196 + r * 16) + '" r="2.2" fill="#c8c4ba"/>';
    }
    let rails = '';
    for (let c = 0; c < 26; c++) {
      rails += '<circle cx="' + (70 + c * 19) + '" cy="72" r="2.2" fill="#c8c4ba"/><circle cx="' + (70 + c * 19) + '" cy="246" r="2.2" fill="#c8c4ba"/>';
    }
    return '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="heroGlow"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".6"/><stop offset="1" stop-color="#ff6b6b" stop-opacity="0"/></radialGradient></defs>' +
      '<rect x="24" y="42" width="592" height="226" rx="16" fill="#f4f0e6" stroke="#ded7c8" stroke-width="1.5"/>' +
      '<rect x="42" y="62" width="555" height="4" fill="#eeb9b9"/><rect x="42" y="266" width="555" height="4" fill="#b9c9ec"/>' +
      holes + rails +
      '<rect x="34" y="150" width="572" height="6" rx="3" fill="#e5e0d4" stroke="#d8d2c5"/>' +
      '<text x="42" y="58" font-family="monospace" font-size="7" fill="#d98d8d">+</text><text x="42" y="270" font-family="monospace" font-size="7" fill="#7f97cb">−</text>' +
      '<g transform="translate(360 165)"><circle r="31" fill="url(#heroGlow)"/><circle r="13" fill="#ef4444" stroke="#991b1b"/><path d="M-5 -6c1.6-2.8 4.4-3.8 6.2-3.6" stroke="#fff" stroke-opacity=".6" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M-6 13v22M6 13v18" stroke="#9aa4b2" stroke-width="2.4"/><rect x="-7" y="11" width="14" height="4" rx="1" fill="#cbd5e1"/></g>' +
      '<g transform="translate(292 166)"><path d="M-42 0h14M22 0h14" stroke="#9aa4b2" stroke-width="2.4"/><rect x="-28" y="-7" width="50" height="14" rx="6" fill="#d8c39c" stroke="#a98b5b"/><rect x="-20" y="-7" width="4" height="14" fill="#c84545"/><rect x="-14" y="-7" width="4" height="14" fill="#c84545"/><rect x="-8" y="-7" width="4" height="14" fill="#7a4b22"/><rect x="2" y="-7" width="4" height="14" fill="#d5a62c"/></g>' +
      '<path d="M264 166h-52c-20 0-20-44-40-44H94" fill="none" stroke="#e05252" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M392 166h40c18 0 18 44 38 44h48" fill="none" stroke="#3c4657" stroke-width="4" stroke-linecap="round"/>' +
      '<g transform="translate(78 122)"><rect x="-31" y="-27" width="62" height="54" rx="6" fill="#1e293b"/><rect x="-24" y="-20" width="33" height="15" rx="1.5" fill="#a7f3d0"/><text x="-20" y="-9" font-family="monospace" font-size="8" fill="#064e3b">5.00</text><rect x="-24" y="2" width="20" height="8" rx="1" fill="#a7f3d0" opacity=".75"/><circle cx="13" cy="13" r="3.6" fill="#ef4444"/><circle cx="2" cy="13" r="3.6" fill="#111"/></g>' +
      '<g transform="translate(520 92)"><rect x="-48" y="-18" width="96" height="36" rx="5" fill="#20242a"/><path d="M-45 -18a8 8 0 0 1 0 16" fill="#0b0e12"/><text x="2" y="4" text-anchor="middle" font-family="monospace" font-size="9" fill="#f1f5f9">74HC08</text><text x="2" y="11" text-anchor="middle" font-family="monospace" font-size="4.5" fill="#8b949e">AND</text></g>' +
      '</svg>';
  }

  BBL.Art = {
    icon: partIcon,
    component: component,
    gateSymbol: gateSymbol,
    cover: cover,
    heroBoard: heroBoard,
    pinOf: pinOf
  };
})();
