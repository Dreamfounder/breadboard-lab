/* ============================================================
   8051 assembly lab page
   ============================================================ */
(function () {
  'use strict';
  const BBL = (window.BBL = window.BBL || {});
  const U = BBL.ui;

  function h(v) { return '0x' + (Number(v) & 0xFF).toString(16).toUpperCase().padStart(2, '0'); }
  function h16(v) { return '0x' + (Number(v) & 0xFFFF).toString(16).toUpperCase().padStart(4, '0'); }
  function bits(v) { return (Number(v) & 0xFF).toString(2).padStart(8, '0'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  BBL.views.asmLab = function (mount, id) {
    const level = BBL.LABS.getLevel(id);
    const cfg = BBL.Asm.ASM_LABS[id];
    if (!level || !cfg) { BBL.views.notFound(mount); return; }
    const codeKey = 'bbl.asm.code.' + id;
    let code = '';
    try { code = localStorage.getItem(codeKey) || ''; } catch (e) {}
    if (!code) code = cfg.initialCode;
    let sim = new BBL.Asm.Simulator(code);
    let p2 = 0xFF;
    let lastCheck = null;
    const complete = BBL.LABS.LabProgress.isComplete(id);
    const next = BBL.LABS.nextLevel(id);
    const nextHref = next ? (next.mode === 'asm' ? '#/asm/' + next.id : '#/labs/' + next.id) : '#/labs';

    mount.innerHTML =
      '<div class="page asm-page">' +
      '<section class="asm-hero"><div class="container"><div class="breadcrumb"><a href="#/labs">Lab 练习</a><span class="sep">/</span><a href="#/labs">8051 单片机</a><span class="sep">/</span><span>' + esc(level.title) + '</span></div>' +
      '<div class="asm-hero-row"><div><span class="eyebrow">8051 · ASSEMBLY LAB</span><h1>' + esc(cfg.title) + '</h1><p>' + esc(cfg.subtitle) + '</p></div>' +
      '<div class="asm-hero-meta"><span>' + level.minutes + ' 分钟</span><span>' + level.difficulty + '</span>' +
      (complete ? '<span class="asm-done">已完成</span>' : '') + '</div></div>' +
      '<div class="asm-task"><span>本关任务</span><b>' + esc(cfg.task) + '</b></div></div></section>' +
      '<div class="container asm-body"><div class="asm-workspace">' +
      '<div class="asm-editor-card"><div class="asm-card-head"><div><b>8051 Assembly</b><span>AT89S52 · 12 MHz</span></div><div class="asm-actions">' +
      '<button class="btn sm primary" id="asm-run">▶ 运行</button>' +
      '<button class="btn sm" id="asm-step">单步</button>' +
      '<button class="btn sm" id="asmreset">重置</button>' +
      '<button class="btn sm accent" id="asm-check">检查作业</button></div></div>' +
      '<textarea id="asm-code" spellcheck="false" autocomplete="off" aria-label="8051 汇编代码">' + esc(code) + '</textarea>' +
      '<div class="asm-code-foot"><span id="asm-status">待运行</span><span id="asm-pc">PC = 0000h</span></div></div>' +
      '<div class="asm-state-card"><div class="asm-card-head"><div><b>寄存器与端口</b><span>运行后实时更新</span></div></div>' +
      '<div class="asm-reg-grid" id="asm-regs"></div>' +
      '<div class="asm-port-block"><div class="asm-port-title"><b>P1 输出</b><span>8 位 LED</span></div><div class="asm-leds" id="asm-p1"></div></div>' +
      '<div class="asm-port-block"><div class="asm-port-title"><b>P2 输入</b><span>' + (id === 'mcu06' ? 'P2.4：1 = 运行，0 = 停止' : 'P2.4 / P2.5 可当按钮') + '</span></div><div class="asm-switches" id="asm-p2"></div></div>' +
      '<div class="asm-port-block"><div class="asm-port-title"><b>外部数据存储器</b><span>@DPTR</span></div><div class="asm-memory" id="asm-mem"></div></div>' +
      '<div class="asm-port-block"><div class="asm-port-title"><b>检查结果</b><span>完成条件</span></div><div id="asm-checkbox" class="asm-checkbox">还没有检查。</div></div>' +
      '</div></div>' +
      '<div class="asm-info-grid"><div class="asm-info-card"><h2>这一关在练什么</h2><p>' + esc(level.objective) + '</p><div class="asm-hint">' + esc(level.background[0]) + '</div></div>' +
      '<div class="asm-info-card"><h2>提交要求</h2><p>' + esc(level.submit) + '</p><div class="asm-next">' +
      (complete ? '<a class="btn primary" href="' + nextHref + '">下一关 ' + (next ? esc(next.title) : '全部关卡') + '</a>' : '<span>检查通过后自动记录完成。</span>') +
      '</div></div></div></div></div>';

    const $code = mount.querySelector('#asm-code');
    const $regs = mount.querySelector('#asm-regs');
    const $p1 = mount.querySelector('#asm-p1');
    const $p2 = mount.querySelector('#asm-p2');
    const $mem = mount.querySelector('#asm-mem');
    const $status = mount.querySelector('#asm-status');
    const $pc = mount.querySelector('#asm-pc');
    const $check = mount.querySelector('#asm-checkbox');

    function renderP2() {
      let html = '';
      for (let i = 0; i < 8; i++) {
        const on = (p2 >> i) & 1;
        const button = i === 4 || i === 5;
        html += '<button type="button" class="asm-bit ' + (on ? 'on' : '') + (button ? ' button-bit' : '') + '" data-p2bit="' + i + '"><span>P2.' + i + '</span><b>' + on + '</b>' + (button ? '<em>按钮</em>' : '') + '</button>';
      }
      $p2.innerHTML = html;
      $p2.querySelectorAll('[data-p2bit]').forEach((b) => b.addEventListener('click', () => {
        const bit = Number(b.dataset.p2bit);
        p2 ^= (1 << bit);
        sim.setP2(p2);
        sim.setP3(p2);
        renderP2(); render();
      }));
    }

    function render() {
      const R = sim.R;
      const regs = [
        ['A', h(sim.A)], ['B', h(sim.B)], ['DPTR', h16(sim.DPTR)], ['PC', h16(sim.PC)],
        ['C', sim.C], ['AC', sim.AC], ['OV', sim.OV], ['SP', h(sim.SP)],
        ['R0', h(R[0])], ['R1', h(R[1])], ['R2', h(R[2])], ['R3', h(R[3])],
        ['R4', h(R[4])], ['R5', h(R[5])], ['R6', h(R[6])], ['R7', h(R[7])]
      ];
      $regs.innerHTML = regs.map((r) => '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
      let leds = '';
      for (let i = 7; i >= 0; i--) leds += '<i class="asm-led ' + (((sim.ports[1] >> i) & 1) ? 'on' : '') + '" title="P1.' + i + '"></i>';
      $p1.innerHTML = leds + '<code>' + bits(sim.ports[1]) + ' · ' + h(sim.ports[1]) + '</code>';
      let mem = '';
      for (let a = 0x2000; a <= 0x2002; a++) mem += '<div><span>' + h16(a) + '</span><b>' + h(sim.xdata[a] || 0) + '</b></div>';
      $mem.innerHTML = mem;
      $pc.textContent = 'PC = ' + h16(sim.PC);
      $status.textContent = sim.error ? ('第 ' + sim.error.line + ' 行：' + sim.error.message) : (sim.halted ? '程序已结束' : '已执行 ' + sim.cycles + ' 条指令');
      if (sim.error) $status.classList.add('error'); else $status.classList.remove('error');
      renderP2();
    }

    function loadSim(reset) {
      if (reset) sim = new BBL.Asm.Simulator($code.value);
      sim.setP2(p2);
      sim.setP3(p2);
    }

    function run() {
      $code.value = $code.value.replace(/\r\n/g, '\n');
      try { localStorage.setItem(codeKey, $code.value); } catch (e) {}
      loadSim(true);
      sim.run(1000000);
      render();
    }

    function doCheck() {
      run();
      lastCheck = cfg.check(sim, $code.value);
      $check.innerHTML = '<b class="' + (lastCheck.ok ? 'ok' : 'bad') + '">' + (lastCheck.ok ? '✓ 通过' : '✗ 还没通过') + '</b><p>' + esc(lastCheck.detail) + '</p>';
      if (lastCheck.ok) {
        BBL.LABS.LabProgress.complete(id);
        $check.innerHTML += '<a class="btn sm primary" href="' + nextHref + '">下一关</a>';
      }
    }

    $code.addEventListener('input', () => {
      try { localStorage.setItem(codeKey, $code.value); } catch (e) {}
      sim = new BBL.Asm.Simulator($code.value);
      sim.setP2(p2); sim.setP3(p2);
      render();
    });
    mount.querySelector('#asm-run').addEventListener('click', run);
    mount.querySelector('#asm-step').addEventListener('click', () => {
      loadSim(false);
      sim.step();
      render();
    });
    mount.querySelector('#asmreset').addEventListener('click', () => {
      loadSim(true); render();
    });
    mount.querySelector('#asm-check').addEventListener('click', doCheck);

    sim.setP2(p2);
    sim.setP3(p2);
    render();
    if (complete) $check.innerHTML = '<b class="ok">✓ 已完成</b><p>代码和结果已保存。</p>';
  };
})();
