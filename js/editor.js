/* ============================================================
   Breadboard Lab · workbench editor
   ============================================================ */
(function () {
  'use strict';
  const BBL = (window.BBL = window.BBL || {});
  const E = BBL.Engine;
  const Art = BBL.Art;
  const P = 13;

  const esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };
  const svgIcon = function (name, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const isMobile = function () { return window.matchMedia('(max-width: 900px)').matches; };

  const ID_PREFIX = {
    resistor: 'r', led: 'led', button: 'btn', potentiometer: 'pot', capacitor: 'c',
    'slide-switch': 'sw', buzzer: 'bz', 'power-supply': 'psu', 'battery-9v': 'b9',
    'coin-cell': 'bt3', 'aa-battery': 'bt15', ic74hc08: 'ic', ic74hc32: 'ic', ic74hc04: 'ic',
    ic74hc86: 'ic', ic74hc02: 'ic', ic74hc20: 'ic', ic74hc21: 'ic', 'arduino-uno': 'uno', microbit: 'mb',
    'dc-motor': 'm', servo: 'sv', 'vibration-motor': 'vm'
  };

  const PIN_NAMES = {
    resistor: { 1: '引脚 1', 2: '引脚 2' },
    led: { a: '阳极 A', k: '阴极 K' },
    button: { 1: '触点 1', 2: '触点 2' },
    potentiometer: { 1: '端点 A', 2: '滑片 W', 3: '端点 B' },
    capacitor: { 1: '引脚 1', 2: '引脚 2' },
    'slide-switch': { 1: '端点 A', 2: '公共 COM', 3: '端点 B' },
    buzzer: { '+': '正极 +', '-': '负极 −' },
    'power-supply': { 'V+': '正极 V+', GND: '负极 GND' },
    'battery-9v': { '+': '正极 +', '-': '负极 −' },
    'coin-cell': { '+': '正极 +', '-': '负极 −' },
    'aa-battery': { '+': '正极 +', '-': '负极 −' },
    'arduino-uno': { '5v': '5V 输出', gnd: 'GND', d13: 'D13 / 板载 LED', d9: 'D9 / PWM', d2: 'D2 / 数字输入', a0: 'A0 / 模拟输入' },
    microbit: { '3v': '3V 输出', gnd: 'GND', p0: 'P0' },
    'dc-motor': { 1: 'M+', 2: 'M−' },
    servo: { gnd: 'GND（棕）', vcc: 'V+（红）', sig: 'SIG（橙）' },
    'vibration-motor': { '+': '正极 +', '-': '负极 −' }
  };

  const IC_PIN_NAMES = {
    ic74hc08: { 1: '1A', 2: '1B', 3: '1Y', 4: '2A', 5: '2B', 6: '2Y', 7: 'GND', 8: '3Y', 9: '3A', 10: '3B', 11: '4Y', 12: '4A', 13: '4B', 14: 'VCC' },
    ic74hc32: { 1: '1A', 2: '1B', 3: '1Y', 4: '2A', 5: '2B', 6: '2Y', 7: 'GND', 8: '3Y', 9: '3A', 10: '3B', 11: '4Y', 12: '4A', 13: '4B', 14: 'VCC' },
    ic74hc86: { 1: '1A', 2: '1B', 3: '1Y', 4: '2A', 5: '2B', 6: '2Y', 7: 'GND', 8: '3Y', 9: '3A', 10: '3B', 11: '4Y', 12: '4A', 13: '4B', 14: 'VCC' },
    ic74hc04: { 1: '1A', 2: '1Y', 3: '2A', 4: '2Y', 5: '3A', 6: '3Y', 7: 'GND', 8: '4Y', 9: '4A', 10: '5Y', 11: '5A', 12: '6Y', 13: '6A', 14: 'VCC' },
    ic74hc02: { 1: '1Y', 2: '1A', 3: '1B', 4: '2Y', 5: '2A', 6: '2B', 7: 'GND', 8: '3A', 9: '3B', 10: '3Y', 11: '4A', 12: '4B', 13: '4Y', 14: 'VCC' },
    ic74hc20: { 1: '1A', 2: '1B', 3: 'NC', 4: '1C', 5: '1D', 6: '1Y', 7: 'GND', 8: '2Y', 9: '2D', 10: '2C', 11: 'NC', 12: '2B', 13: '2A', 14: 'VCC' },
    ic74hc21: { 1: '1A', 2: '1B', 3: 'NC', 4: '1C', 5: '1D', 6: '1Y', 7: 'GND', 8: '2Y', 9: '2D', 10: '2C', 11: 'NC', 12: '2B', 13: '2A', 14: 'VCC' }
  };

  const IC_SWITCH_LABELS = {
    ic74hc08: ['1A', '1B', '1Y', '2A', '2B', '2Y', 'GND', '3Y', '3A', '3B', '4Y', '4A', '4B', 'VCC'],
    ic74hc32: ['1A', '1B', '1Y', '2A', '2B', '2Y', 'GND', '3Y', '3A', '3B', '4Y', '4A', '4B', 'VCC']
  };

  function pinName(comp, pinId) {
    if (IC_PIN_NAMES[comp.type]) return '第 ' + pinId + ' 脚 · ' + IC_PIN_NAMES[comp.type][pinId];
    return (PIN_NAMES[comp.type] && PIN_NAMES[comp.type][pinId]) || '引脚 ' + pinId;
  }

  function partOf(type) { return BBL.partById(type) || { name: type, icon: 'resistor', short: '' }; }

  /* ------------------------------------------------------------------
     SVG defs used by Art.component
     ------------------------------------------------------------------ */
  function svgDefs() {
    return `<defs>
      <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f3ea"/><stop offset="1" stop-color="#ece7dc"/></linearGradient>
      <linearGradient id="icBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#343a42"/><stop offset="1" stop-color="#171b21"/></linearGradient>
      <linearGradient id="btnCap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#b91c1c"/></linearGradient>
      <linearGradient id="potBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e40af"/></linearGradient>
      <linearGradient id="capBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient>
      <linearGradient id="slideBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5563"/><stop offset="1" stop-color="#1f2937"/></linearGradient>
      <linearGradient id="buzBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#475569"/><stop offset="1" stop-color="#111827"/></linearGradient>
      <radialGradient id="coinBody" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/></radialGradient>
      <linearGradient id="aaBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d1d5db"/><stop offset=".35" stop-color="#f8fafc"/><stop offset="1" stop-color="#9ca3af"/></linearGradient>
      <linearGradient id="nineVBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f2937"/><stop offset=".5" stop-color="#374151"/><stop offset="1" stop-color="#111827"/></linearGradient>
      <linearGradient id="psuBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
      <linearGradient id="unoBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="#155e75"/></linearGradient>
      <linearGradient id="servoBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1e40af"/></linearGradient>
      <radialGradient id="vibBody" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></radialGradient>
      <linearGradient id="motorBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".45" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
      <radialGradient id="ledGlowred"><stop offset="0" stop-color="#ff5d5d" stop-opacity=".9"/><stop offset="1" stop-color="#ff5d5d" stop-opacity="0"/></radialGradient>
      <radialGradient id="ledGlowgreen"><stop offset="0" stop-color="#4ade80" stop-opacity=".85"/><stop offset="1" stop-color="#4ade80" stop-opacity="0"/></radialGradient>
      <radialGradient id="ledGlowyellow"><stop offset="0" stop-color="#fde047" stop-opacity=".85"/><stop offset="1" stop-color="#fde047" stop-opacity="0"/></radialGradient>
      <radialGradient id="ledGlowblue"><stop offset="0" stop-color="#60a5fa" stop-opacity=".85"/><stop offset="1" stop-color="#60a5fa" stop-opacity="0"/></radialGradient>
    </defs>`;
  }

  function serviceIcon(type) {
    return Art.icon(type);
  }

  /* ==================================================================
     Editor
     ================================================================== */
  function Editor(mount, opts) {
    this.mount = mount;
    this.opts = opts || {};
    this.mode = this.opts.mode || 'editor';
    this.storageKey = this.mode === 'sandbox' ? 'bbl.sandbox.v1' : 'bbl.editor.v1';
    this.tool = 'select';
    this.tab = 'library';
    this.selection = null;
    this.snap = true;
    this.simRunning = false;
    this.simResult = null;
    this.pending = null;
    this.cursor = null;
    this.hoverWireId = null;
    this.drag = null;
    this.libDrag = null;
    this.codeOpen = false;
    this.codeRunning = false;
    this.codeRunner = null;
    this.codeIO = {};
    this.codeQueue = null;
    this._codeSimPending = false;
    this.serialLines = [];
    this.codeExampleId = 'blink';
    this.codeText = '';
    this.codeArduinoId = null;
    this.codeTab = 'blocks';
    this.view = { x: 0, y: 0, zoom: 1 };
    this.userAdjustedView = false;
    this.history = [];
    this.hIndex = -1;
    this.taskId = null;
    this.labId = this.opts.labId || null;
    this.taskDoneShown = false;
    this._labRecorded = false;
    this._taskCollapsed = isMobile() || window.innerHeight < 980;
    this.saveTimer = null;
    this.uidSeed = 1;
    this._mounted = true;
    this.abort = new AbortController();
    this.scene = this.loadInitialScene();
    if (!this.labId && BBL.LABS) {
      const level = (this.taskId && BBL.LABS.getLevel(this.taskId)) ||
        (this.scene.template && BBL.LABS.getLevel(this.scene.template));
      if (level) this.labId = level.id;
    }
    this.scene._holes = E.boardHoles(this.scene.board);
    if (this.scene.code) {
      if (this.scene.code.exampleId) this.codeExampleId = this.scene.code.exampleId;
      if (this.scene.code.text) this.codeText = this.scene.code.text;
    }
    this.bindings = {};
    this.renderShell();
    this.attachEvents();
    this.renderBoard(true);
    this.renderLibrary();
    this.renderScene();
    this.renderInspector();
    this.renderTask();
    this.updateSimUi();
    this.history = [this.serialize()];
    this.hIndex = 0;
    this.updateHistoryButtons();
    this.autosave();
    requestAnimationFrame(() => {
      this.fitView(false);
      this.updateView();
      if (!this.savedOnLoad && this.mode === 'editor') {
        setTimeout(() => {
          if (this._mounted) this.toast('把元件拖进画布，或点「开始模拟」查看效果。');
        }, 900);
      }
    });
    this._ro = new ResizeObserver(() => {
      if (!this._mounted) return;
      if (!this.userAdjustedView) { this.fitView(false); this.updateView(); }
    });
    if (this.$stage) this._ro.observe(this.$stage);
  }

  Editor.prototype.loadInitialScene = function () {
    const opt = this.opts;
    if (opt.scene) {
      this.taskId = opt.taskId || opt.scene.template || null;
      this.savedOnLoad = true;
      return E.clone(opt.scene);
    }
    if (opt.template) {
      this.taskId = opt.taskId || opt.template;
      this.savedOnLoad = true;
      const s = E.createScene(opt.template);
      return s;
    }
    if (this.mode === 'sandbox') {
      const saved = this.readSaved();
      if (saved) {
        this.savedOnLoad = true;
        this.taskId = null;
        return saved;
      }
      const s = E.createScene('free-start');
      this.taskId = null;
      this.savedOnLoad = false;
      return s;
    }
    const saved = this.readSaved();
    if (saved) {
      if (saved.template === 'led-basic' && (saved.components || []).some((c) => /^chip\d+$/.test(c.id))) {
        saved.components = saved.components.filter((c) => !/^chip\d+$/.test(c.id));
        saved.wires = [];
      }
      this.savedOnLoad = true;
      this.taskId = saved.template && E.TASKS[saved.template] ? saved.template : null;
      return saved;
    }
    const s = E.createScene('led-basic');
    this.taskId = s.template;
    this.savedOnLoad = false;
    return s;
  };

  Editor.prototype.readSaved = function () {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.components) || !Array.isArray(data.wires) || !data.board) return null;
      return data;
    } catch (e) { return null; }
  };

  Editor.prototype.serialize = function () {
    const copy = E.clone(this.scene);
    delete copy._holes;
    (copy.components || []).forEach(function (c) { delete c.sim; });
    return copy;
  };

  Editor.prototype.renderShell = function () {
    const task = this.mode === 'editor' ? E.TASKS[this.taskId] : null;
    const modeLabel = this.mode === 'sandbox' ? '自由实验空间' : (task ? task.kicker : '面包板工作台');
    const name = esc(this.scene.name || '未命名电路');
    this.mount.innerHTML = `
    <section class="editor-shell" aria-label="电路工作台">
      <header class="editor-head">
        <div class="project-block">
          <div class="project-icon">${svgIcon(this.mode === 'sandbox' ? 'flask' : 'circuit')}</div>
          <div class="project-meta">
            <div class="project-eyebrow">
              <span class="pill ${this.mode === 'sandbox' ? 'green' : 'blue'}">${esc(modeLabel)}</span>
              <span>${this.mode === 'sandbox' ? 'SANDBOX' : 'BREADBOARD LAB'}</span>
            </div>
            <div class="project-name">
              <input id="project-name" value="${name}" maxlength="48" aria-label="项目名称" spellcheck="false">
              <span class="saved-badge" id="saved-badge">${svgIcon('check-circle')} 已保存</span>
            </div>
          </div>
        </div>
        <div class="editor-head-actions">
          <button class="icon-btn head-undo" data-action="undo" title="撤销 (Ctrl+Z)" aria-label="撤销">${svgIcon('undo')}</button>
          <button class="icon-btn head-undo" data-action="redo" title="重做 (Ctrl+Shift+Z)" aria-label="重做">${svgIcon('redo')}</button>
          <span class="head-divider"></span>
          <button class="btn ghost head-save" data-action="save">${svgIcon('save')}<span class="head-save-label">保存</span></button>
          <button class="sim-btn" id="sim-btn" data-action="simulate">${svgIcon('play')}<span id="sim-btn-label">开始模拟</span></button>
          <div class="more-wrap">
            <button class="icon-btn head-more" data-action="menu" aria-label="更多操作" aria-haspopup="true">${svgIcon('menu') || svgIcon('menu')}</button>
            <div class="menu" id="more-menu" hidden>
              <button data-action="save">${svgIcon('save')} 保存到浏览器</button>
              <button data-action="export">${svgIcon('download')} 导出电路 JSON</button>
              <button data-action="import">${svgIcon('upload')} 导入电路 JSON</button>
              <div class="sep"></div>
              <button data-action="reset">${svgIcon('reset')} 重新载入示例</button>
              <button data-action="clear" class="danger">${svgIcon('trash')} 清空画布</button>
              <div class="sep"></div>
              <button data-action="help">${svgIcon('keyboard')} 快捷键与帮助</button>
              <a href="#/projects">${svgIcon('grid')} 项目空间</a>
              <a href="#/learn">${svgIcon('book')} 返回教程</a>
            </div>
          </div>
        </div>
      </header>

      <div class="workbench">
        <div class="workbench-main">
          <div class="ribbon">
            <div class="group" role="toolbar" aria-label="画布工具">
              <button class="tool-btn active" data-tool="select" title="选择工具 (V)">${svgIcon('cursor')}<span class="tool-label">选择</span></button>
              <button class="tool-btn" data-tool="wire" title="连线工具 (W)">${svgIcon('wire')}<span class="tool-label">连线</span></button>
              <button class="tool-btn" data-tool="delete" title="删除工具 (X)">${svgIcon('trash')}<span class="tool-label">删除</span></button>
            </div>
            <div class="divider"></div>
            <div class="group">
              <button class="tool-btn" data-action="undo" title="撤销 (Ctrl+Z)">${svgIcon('undo')}</button>
              <button class="tool-btn" data-action="redo" title="重做 (Ctrl+Shift+Z)">${svgIcon('redo')}</button>
            </div>
            <div class="divider"></div>
            <div class="group">
              <button class="tool-btn" data-action="rotate" title="旋转 90° (R)">${svgIcon('rotate')}<span class="tool-label">旋转</span></button>
              <button class="tool-btn" data-action="duplicate" title="复制 (Ctrl+D)">${svgIcon('copy')}</button>
              <button class="tool-btn code-entry" id="code-entry" data-action="toggle-code" title="打开代码编辑器">${svgIcon('code')}<span class="tool-label">代码</span><i class="code-live-dot"></i></button>
            </div>
            <span class="ribbon-hint" id="ribbon-hint">选择元件拖动位置 · 拖动引脚到另一个引脚即可连线</span>
            <div class="ribbon-right">
              <button class="snap-toggle ${this.snap ? 'on' : ''}" data-action="snap" title="自动吸附到面包板孔位">
                <span class="switch-ui"></span><span class="snap-label">吸附</span>
              </button>
              <button class="tool-btn library-open-btn" data-action="open-library">${svgIcon('cube')}<span>元件库</span></button>
              <button class="tool-btn" data-action="zoom-fit" title="适应画布 (0)">${svgIcon('fit')}</button>
            </div>
          </div>

          <div class="stage-wrap" id="stage-wrap">
            <div class="canvas-stage" id="stage">
              <svg id="board-svg" role="img" aria-label="面包板电路画布" xmlns="http://www.w3.org/2000/svg">
                ${svgDefs()}
                <g id="viewport">
                  <g id="layer-board"></g>
                  <g id="layer-comps"></g>
                  <g id="layer-wires"></g>
                  <g id="layer-wire-focus"></g>
                  <g id="layer-pins"></g>
                  <g id="layer-draft"></g>
                </g>
              </svg>

              <div class="canvas-corner"><b>面包板</b><span class="sep">/</span><span>830 孔</span><span class="sep">/</span><span>2.54 mm</span></div>
              <div class="canvas-tools" role="toolbar" aria-label="画布工具">
                <button class="tool-btn active" data-tool="select" title="选择 (V)" aria-label="选择">${svgIcon('cursor')}</button>
                <button class="tool-btn" data-tool="wire" title="连线 (W)" aria-label="连线">${svgIcon('wire')}</button>
                <div class="divider"></div>
                <button class="tool-btn" data-action="undo" title="撤销" aria-label="撤销">${svgIcon('undo')}</button>
                <button class="tool-btn" data-action="redo" title="重做" aria-label="重做">${svgIcon('redo')}</button>
              </div>

              <div id="task-slot"></div>
              <div class="empty-canvas-hint" id="empty-hint" hidden></div>

              <div class="sim-hud" id="sim-hud"></div>
              <div class="zoom-cluster">
                <button data-action="zoom-out" aria-label="缩小">${svgIcon('minus')}</button>
                <span class="zoom-level" id="zoom-level">100%</span>
                <button data-action="zoom-in" aria-label="放大">${svgIcon('plus')}</button>
                <button data-action="zoom-fit" aria-label="适应画布" title="适应画布">${svgIcon('fit')}</button>
              </div>
              <div class="canvas-tip"><b>拖动</b> 元件 · <b>拖动引脚</b> 连线 · <b>悬停导线</b> 突出显示 · <b>滚轮</b> 缩放</div>
            </div>

            <div class="code-drawer" id="code-drawer" hidden>
              <div class="code-head">
                <div class="code-title">
                  <span class="code-title-icon">${svgIcon('code')}</span>
                  <div><strong>代码编辑器</strong><span id="code-board-label">等待 Arduino Uno</span></div>
                </div>
                <div class="code-tabs" role="tablist">
                  <button class="code-tab active" data-code-tab="blocks">${svgIcon('blocks')} 积木</button>
                  <button class="code-tab" data-code-tab="text">${svgIcon('code')} 文本</button>
                </div>
                <div class="code-actions">
                  <select class="select-ui code-example-select" id="code-example" aria-label="选择示例程序"></select>
                  <button class="btn sm accent" data-action="code-run">${svgIcon('play')} 运行</button>
                  <button class="btn sm" data-action="code-stop" disabled>${svgIcon('stop')} 停止</button>
                  <button class="icon-btn" data-action="close-code" aria-label="关闭代码面板">${svgIcon('close')}</button>
                </div>
              </div>
              <div class="code-body">
                <div class="code-main">
                  <div class="code-blocks" id="code-blocks"></div>
                  <div class="code-text-pane" id="code-text-pane" hidden>
                    <div class="code-editor-tools">
                      <span>Arduino C++ · 教学子集</span>
                      <button data-action="reset-code">恢复示例代码</button>
                    </div>
                    <textarea id="code-text" spellcheck="false" aria-label="Arduino 代码"></textarea>
                    <div class="code-status" id="code-status">修改代码后点击「运行」。</div>
                  </div>
                </div>
                <aside class="serial-panel">
                  <div class="serial-head"><span><i></i> 串口监视器 <b>9600</b></span><button data-action="clear-serial">清空</button></div>
                  <div class="serial-output" id="serial-output"><span class="serial-empty">运行代码后，Serial.println 的输出会出现在这里。</span></div>
                </aside>
              </div>
            </div>
          </div>

          <div class="statusbar">
            <span class="status-item"><span class="status-light on" id="status-light"></span><span id="status-text">就绪</span></span>
            <span class="status-item status-hide" id="status-count">0 个元件 · 0 条导线</span>
            <span class="status-item status-hide" id="status-select"></span>
            <span class="status-item right">网格 13 px</span>
            <span class="status-item right status-hide">吸附 <b id="status-snap">开</b></span>
          </div>
        </div>

        <div class="side-scrim" id="side-scrim"></div>
        <aside class="side-panel" id="side-panel" aria-label="元件与属性面板">
          <div class="side-tabs">
            <button class="side-tab active" data-tab="library">${svgIcon('cube')} 元件库 <span class="count" id="library-count"></span></button>
            <button class="side-tab" data-tab="inspector">${svgIcon('chip')} 属性</button>
            <button class="side-panel-close" data-action="close-panel" aria-label="关闭面板">${svgIcon('close')}</button>
          </div>
          <div class="library-pane" id="library-pane">
            <div class="search-wrap">
              ${svgIcon('search')}
              <input type="search" id="part-search" placeholder="搜索元件，如 LED、电阻…" autocomplete="off" aria-label="搜索元件">
              <button class="search-clear" id="search-clear" aria-label="清除搜索">${svgIcon('close')}</button>
            </div>
            <div class="category-chips" id="category-chips"></div>
            <div class="part-scroll" id="part-scroll"></div>
            <div class="side-foot">${svgIcon('drag')} 拖到画布，或点击卡片快速添加</div>
          </div>
          <div class="inspector-pane" id="inspector-pane"></div>
        </aside>
      </div>
    </section>`;
    this.$root = this.mount.querySelector('.editor-shell');
    this.$stageWrap = this.mount.querySelector('#stage-wrap');
    this.$stage = this.mount.querySelector('#stage');
    this.$svg = this.mount.querySelector('#board-svg');
    this.$viewport = this.mount.querySelector('#viewport');
    this.$layerBoard = this.mount.querySelector('#layer-board');
    this.$layerWires = this.mount.querySelector('#layer-wires');
    this.$layerWireFocus = this.mount.querySelector('#layer-wire-focus');
    this.$layerComps = this.mount.querySelector('#layer-comps');
    this.$layerPins = this.mount.querySelector('#layer-pins');
    this.$layerDraft = this.mount.querySelector('#layer-draft');
    this.$panel = this.mount.querySelector('#side-panel');
    this.$scrim = this.mount.querySelector('#side-scrim');
    this.$libraryPane = this.mount.querySelector('#library-pane');
    this.$inspectorPane = this.mount.querySelector('#inspector-pane');
    this.$simBtn = this.mount.querySelector('#sim-btn');
    this.$simBtnLabel = this.mount.querySelector('#sim-btn-label');
    this.$hud = this.mount.querySelector('#sim-hud');
    this.$taskSlot = this.mount.querySelector('#task-slot');
    this.$emptyHint = this.mount.querySelector('#empty-hint');
    this.$codeDrawer = this.mount.querySelector('#code-drawer');
    this.$codeEntry = this.mount.querySelector('#code-entry');
    this.$codeExample = this.mount.querySelector('#code-example');
    this.$codeTextPane = this.mount.querySelector('#code-text-pane');
    this.$codeText = this.mount.querySelector('#code-text');
    this.$codeBlocks = this.mount.querySelector('#code-blocks');
    this.$codeStatus = this.mount.querySelector('#code-status');
    this.$serialOutput = this.mount.querySelector('#serial-output');
    this.$codeBoardLabel = this.mount.querySelector('#code-board-label');
    this.$name = this.mount.querySelector('#project-name');
    this.$savedBadge = this.mount.querySelector('#saved-badge');
    this.$zoomLevel = this.mount.querySelector('#zoom-level');
    this.$menu = this.mount.querySelector('#more-menu');
    this.$search = this.mount.querySelector('#part-search');
    this.$searchClear = this.mount.querySelector('#search-clear');
    this.$chips = this.mount.querySelector('#category-chips');
    this.$scroll = this.mount.querySelector('#part-scroll');
    this.$libCount = this.mount.querySelector('#library-count');
    this.$statusText = this.mount.querySelector('#status-text');
    this.$statusLight = this.mount.querySelector('#status-light');
    this.$statusCount = this.mount.querySelector('#status-count');
    this.$statusSelect = this.mount.querySelector('#status-select');
    this.$statusSnap = this.mount.querySelector('#status-snap');
    this.$ribbonHint = this.mount.querySelector('#ribbon-hint');
    this.$ghost = document.querySelector('#drag-ghost');
    this.$panel.classList.toggle('open', false);
  };

  Editor.prototype.attachEvents = function () {
    const signal = this.abort.signal;
    const self = this;
    this.$root.addEventListener('click', function (e) { self.onClick(e); }, { signal: signal });
    this.$root.addEventListener('pointerdown', function (e) { self.onPointerDown(e); }, { signal: signal });
    window.addEventListener('pointermove', function (e) { self.onPointerMove(e); }, { signal: signal, passive: false });
    this.$stage.addEventListener('pointerleave', function () {
      self.hoverWireId = null;
      if (self.$layerWires) self.$layerWires.classList.remove('hover-focus');
      if (self.$layerWireFocus) self.renderWireFocus();
    }, { signal: signal });
    window.addEventListener('pointerup', function (e) { self.onPointerUp(e); }, { signal: signal });
    window.addEventListener('pointercancel', function (e) { self.cancelPointer(e); }, { signal: signal });
    window.addEventListener('keydown', function (e) { self.onKeyDown(e); }, { signal: signal });
    this.$root.addEventListener('input', function (e) { self.onInput(e); }, { signal: signal });
    this.$root.addEventListener('change', function (e) { self.onChange(e); }, { signal: signal });
    this.$svg.addEventListener('wheel', function (e) { self.onWheel(e); }, { signal: signal, passive: false });
    this.$stage.addEventListener('touchstart', function (e) { self.onTouchStart(e); }, { signal: signal, passive: false });
    this.$stage.addEventListener('touchmove', function (e) { self.onTouchMove(e); }, { signal: signal, passive: false });
    this.$stage.addEventListener('touchend', function (e) { self.onTouchEnd(e); }, { signal: signal, passive: false });
    this.$stage.addEventListener('touchcancel', function (e) { self.onTouchEnd(e); }, { signal: signal, passive: false });
    this.$svg.addEventListener('contextmenu', function (e) {
      if (self.pending) { e.preventDefault(); self.cancelPending(); }
    }, { signal: signal });
    document.addEventListener('pointerdown', function (e) {
      if (self.$menu && !self.$menu.hidden && !e.target.closest('.more-wrap')) self.closeMenu();
    }, { signal: signal });
    window.addEventListener('resize', function () {
      if (!self._mounted) return;
      if (isMobile() && self.$panel.classList.contains('open')) return;
      if (!self.userAdjustedView) { self.fitView(false); self.updateView(); }
    }, { signal: signal });
  };

  Editor.prototype.destroy = function () {
    this._mounted = false;
    if (this.codeRunner) { this.codeRunner.stop(); this.codeRunner = null; }
    this.codeRunning = false;
    this.autosaveNow();
    this.abort.abort();
    if (this._ro) this._ro.disconnect();
    if (this._saveTimer) clearTimeout(this._saveTimer);
    if (this.$ghost) this.$ghost.classList.remove('show');
    document.body.classList.remove('no-scroll');
  };

  /* ------------------------------------------------------------------
     View
     ------------------------------------------------------------------ */
  Editor.prototype.fitView = function (animate) {
    if (!this.$stage) return;
    const rect = this.$stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const b = this.scene.board;
    if (isMobile()) {
      const z = clamp(Math.max((rect.width - 26) / b.w, 0.6), 0.34, 1.1);
      this.view.zoom = z;
      this.view.x = (rect.width - b.w * z) / 2 - b.x * z;
      this.view.y = rect.height * 0.56 - (b.y + b.h / 2) * z;
      this.updateView();
      this.userAdjustedView = false;
      return;
    }
    let minX = b.x - 130, maxX = b.x + b.w + 80;
    let minY = b.y - 230, maxY = b.y + b.h + 80;
    this.scene.components.forEach(function (c) {
      const def = E.DEFS[c.type];
      if (!def) return;
      minX = Math.min(minX, c.x - 70);
      maxX = Math.max(maxX, c.x + 70);
      minY = Math.min(minY, c.y - 70);
      maxY = Math.max(maxY, c.y + 70);
    });
    const w = Math.max(420, maxX - minX);
    const h = Math.max(300, maxY - minY);
    const topPad = isMobile() ? 40 : 44;
    const z = clamp(Math.min((rect.width - 48) / w, (rect.height - topPad - 54) / h), 0.28, 1.35);
    this.view.zoom = z;
    this.view.x = (rect.width - w * z) / 2 - minX * z;
    this.view.y = (rect.height - h * z) / 2 - minY * z + 10;
    this.updateView();
    this.userAdjustedView = false;
  };

  Editor.prototype.updateView = function () {
    if (!this.$viewport) return;
    this.$viewport.setAttribute('transform', 'translate(' + this.view.x.toFixed(2) + ' ' + this.view.y.toFixed(2) + ') scale(' + this.view.zoom.toFixed(4) + ')');
    if (this.$zoomLevel) this.$zoomLevel.textContent = Math.round(this.view.zoom * 100) + '%';
  };

  Editor.prototype.zoomAt = function (clientX, clientY, factor) {
    const rect = this.$stage.getBoundingClientRect();
    const px = clientX - rect.left, py = clientY - rect.top;
    const old = this.view.zoom;
    const z = clamp(old * factor, 0.25, 2.6);
    if (z === old) return;
    const wx = (px - this.view.x) / old;
    const wy = (py - this.view.y) / old;
    this.view.zoom = z;
    this.view.x = px - wx * z;
    this.view.y = py - wy * z;
    this.userAdjustedView = true;
    this.updateView();
  };

  Editor.prototype.clientToWorld = function (clientX, clientY) {
    const rect = this.$svg.getBoundingClientRect();
    return { x: (clientX - rect.left - this.view.x) / this.view.zoom, y: (clientY - rect.top - this.view.y) / this.view.zoom };
  };

  Editor.prototype.onWheel = function (e) {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0015);
    this.zoomAt(e.clientX, e.clientY, factor);
  };

  Editor.prototype.onTouchStart = function (e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.drag = null;
      this.libDrag = null;
      this._pinching = true;
      const a = e.touches[0], b = e.touches[1];
      const rect = this.$stage.getBoundingClientRect();
      const cx = (a.clientX + b.clientX) / 2, cy = (a.clientY + b.clientY) / 2;
      this._pinch = {
        dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1,
        cx: cx, cy: cy,
        zoom: this.view.zoom,
        viewX: this.view.x, viewY: this.view.y,
        worldX: (cx - rect.left - this.view.x) / this.view.zoom,
        worldY: (cy - rect.top - this.view.y) / this.view.zoom
      };
      this.$stage.classList.remove('dragging');
    }
  };

  Editor.prototype.onTouchMove = function (e) {
    if (!this._pinch || e.touches.length < 2) return;
    e.preventDefault();
    const a = e.touches[0], b = e.touches[1];
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
    const rect = this.$stage.getBoundingClientRect();
    const cx = (a.clientX + b.clientX) / 2, cy = (a.clientY + b.clientY) / 2;
    const z = clamp(this._pinch.zoom * (dist / this._pinch.dist), 0.24, 2.8);
    this.view.zoom = z;
    this.view.x = cx - rect.left - this._pinch.worldX * z;
    this.view.y = cy - rect.top - this._pinch.worldY * z;
    this.userAdjustedView = true;
    this.updateView();
  };

  Editor.prototype.onTouchEnd = function (e) {
    if (e.touches.length < 2 && this._pinch) {
      this._pinch = null;
      setTimeout(() => { this._pinching = false; }, 60);
    }
  };

  /* ------------------------------------------------------------------
     Board & scene rendering
     ------------------------------------------------------------------ */
  Editor.prototype.renderBoard = function (force) {
    const b = this.scene.board;
    const stamp = [b.x, b.y, b.w, b.h].join(',');
    if (!force && this._boardStamp === stamp) return;
    this._boardStamp = stamp;
    this.scene._holes = E.boardHoles(b);
    const holes = this.scene._holes;
    const x0 = b.x + 30, x1 = b.x + b.w - 30;
    let holeHtml = '';
    holes.forEach(function (h) {
      holeHtml += '<g class="hole-group" data-hole-id="' + h.id + '">' +
        '<circle class="board-hole" cx="' + h.x + '" cy="' + h.y + '" r="2.15"/>' +
        '<circle class="board-hole-hit" cx="' + h.x + '" cy="' + h.y + '" r="5.8" data-hole="' + h.id + '"/>' +
        '</g>';
    });
    let labels = '';
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(function (r) {
      const y = b.y + E.ROW_Y[r] + 2.2;
      labels += '<text class="board-label side" x="' + (b.x + 18) + '" y="' + y + '">' + r + '</text>';
      labels += '<text class="board-label" x="' + (b.x + b.w - 18) + '" y="' + y + '">' + r + '</text>';
    });
    for (let c = 1; c <= 63; c += 5) {
      const x = b.x + 30 + (c - 1) * P;
      labels += '<text class="board-number" x="' + x + '" y="' + (b.y + 44) + '">' + c + '</text>';
      labels += '<text class="board-number" x="' + x + '" y="' + (b.y + 199) + '">' + c + '</text>';
    }
    this.$layerBoard.innerHTML = `
      <g class="board-shadow">
        <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="12" fill="url(#boardGrad)" stroke="#d9d3c7" stroke-width="1.3"/>
        <rect x="${b.x + 4}" y="${b.y + 4}" width="${b.w - 8}" height="${b.h - 8}" rx="9" fill="none" stroke="rgba(255,255,255,.66)" stroke-width="1"/>
      </g>
      <rect x="${b.x + 12}" y="${b.y + 64}" width="${b.w - 24}" height="${b.y + 112 - (b.y + 64)}" fill="#f1ede4" opacity=".5"/>
      <rect x="${b.x + 22}" y="${b.y + 111}" width="${b.w - 44}" height="14" rx="7" fill="#e5e0d5" stroke="#d5cfc2" stroke-width=".8"/>
      <path d="M${b.x + 34} ${b.y + 118}H${b.x + b.w - 34}" stroke="#d7d1c4" stroke-width=".8"/>
      <path d="M${x0} ${b.y + 16}H${x1}" class="board-rail-line red"/>
      <path d="M${x0} ${b.y + 28}H${x1}" class="board-rail-line blue"/>
      <path d="M${x0} ${b.y + 202}H${x1}" class="board-rail-line blue"/>
      <path d="M${x0} ${b.y + 214}H${x1}" class="board-rail-line red"/>
      <text x="${b.x + 8}" y="${b.y + 19}" class="board-rail-mark red">+</text>
      <text x="${b.x + 8}" y="${b.y + 31}" class="board-rail-mark blue">−</text>
      <text x="${b.x + 8}" y="${b.y + 205}" class="board-rail-mark blue">−</text>
      <text x="${b.x + 8}" y="${b.y + 217}" class="board-rail-mark red">+</text>
      <text x="${b.x + b.w - 8}" y="${b.y + 19}" class="board-rail-mark red" text-anchor="end">+</text>
      <text x="${b.x + b.w - 8}" y="${b.y + 31}" class="board-rail-mark blue" text-anchor="end">−</text>
      <text x="${b.x + b.w - 8}" y="${b.y + 205}" class="board-rail-mark blue" text-anchor="end">−</text>
      <text x="${b.x + b.w - 8}" y="${b.y + 217}" class="board-rail-mark red" text-anchor="end">+</text>
      ${labels}
      ${holeHtml}
      <text x="${b.x + b.w / 2}" y="${b.y + b.h - 6}" class="board-number" style="font-size:5.4px;letter-spacing:.16em" opacity=".8">BREADBOARD · 830 TIE POINTS</text>`;
  };

  Editor.prototype.renderScene = function () {
    this.bindings = E.bindings(this.scene);
    this.renderWires();
    this.renderComponents();
    this.renderPins();
    this.renderDraft();
    this.renderEmptyHint();
    this.updateStatus();
  };

  Editor.prototype.renderEmptyHint = function () {
    if (!this.$emptyHint) return;
    const show = this.scene.components.length === 0;
    this.$emptyHint.hidden = !show;
    if (!show) { this.$emptyHint.innerHTML = ''; return; }
    const sandbox = this.mode === 'sandbox';
    const finalLab = !!(this.labId && /-final$/.test(this.labId));
    this.$emptyHint.innerHTML = '<div class="empty-hint-inner">' +
      '<div class="empty-hint-art">' + svgIcon(finalLab ? 'target' : 'chip') + '</div>' +
      '<h3>' + (finalLab ? '这是空白终验画布' : sandbox ? '从一颗元件开始' : '画布已经清空') + '</h3>' +
      '<p>' + (finalLab
        ? '终验关没有预置零件。打开右侧元件库，自己摆放芯片、开关、电阻、LED 和电源，再开始接线。'
        : sandbox
          ? '这里没有固定任务。拖入电源、电阻和 LED，搭一条自己的回路；也可以先载入一个示例。'
          : '从元件库拖入电源、电阻和 LED，重新搭一条回路；也可以载入示例，或按 Ctrl / ⌘ + Z 撤销刚才的操作。') + '</p>' +
      '<div class="empty-hint-actions"><button class="btn primary sm" data-action="open-library">' + svgIcon('cube') + ' 打开元件库</button>' +
      (finalLab ? '' : '<button class="btn sm" data-action="load-example">' + svgIcon('sparkle') + ' 载入示例</button>') + '</div>' +
      '<div class="empty-hint-tip">' + svgIcon('drag') + ' 滚轮 / 双指缩放 · 拖动空白平移</div>' +
      '</div>';
  };

  Editor.prototype.loadExample = function () {
    if (this.labId && /-final$/.test(this.labId)) {
      this.toast('终验关不能载入预置示例。请从元件库自己摆放零件。', 'warn');
      return;
    }
    this.stopSimulation();
    this.scene = E.createScene('led-basic', { keepWires: true });
    this.scene.name = this.mode === 'sandbox' ? '自由实验 · LED 示例' : '实验一 · 点亮第一颗 LED';
    this.scene.template = this.mode === 'editor' ? 'led-basic' : null;
    this.scene._holes = E.boardHoles(this.scene.board);
    this.selection = null;
    this.taskId = this.mode === 'editor' ? 'led-basic' : null;
    this.taskDoneShown = false;
    this.renderBoard(true);
    this.renderScene();
    this.renderInspector();
    this.renderTask();
    this.fitView(false);
    this.$name.value = this.scene.name;
    this.commit('载入示例');
    this.toast('已载入 LED 示例，可以直接修改或拆掉重搭。');
  };

  Editor.prototype.renderComponents = function () {
    let html = '';
    const selectedId = this.selection && this.selection.kind === 'comp' ? this.selection.id : null;
    this.scene.components.forEach((comp) => {
      const def = E.DEFS[comp.type];
      if (!def) return;
      const sim = this.simRunning && this.simResult && this.simResult.components[comp.id];
      comp.sim = null;
      if (sim) {
        if (comp.type === 'led') comp.sim = { led: sim };
        else if (comp.type === 'dc-motor') comp.sim = { motor: sim.motor || 0 };
        else if (comp.type === 'servo') comp.sim = { angle: sim.angle || 90 };
        else if (comp.type === 'buzzer') comp.sim = { buzzer: !!sim.buzzer };
        else if (comp.type === 'arduino-uno') comp.sim = { io: sim.io, powered: sim.powered };
      }
      const b = def.bounds;
      const sel = comp.id === selectedId ? ' selected' : '';
      const pins = def.pins;
      const labelText = (() => {
        if (comp.type === 'resistor') return Number(comp.props.resistance) >= 1000 ? (Number(comp.props.resistance) / 1000) + 'kΩ' : comp.props.resistance + 'Ω';
        if (comp.type === 'led') return 'LED';
        if (comp.type === 'button') return '按钮';
        if (comp.type === 'potentiometer') return '10k';
        if (comp.type === 'capacitor') return '104';
        if (comp.type === 'slide-switch') return '开关';
        if (comp.type === 'buzzer') return '蜂鸣器';
        if (comp.type === 'battery-9v') return '9V';
        if (comp.type === 'coin-cell') return '3V';
        if (comp.type === 'aa-battery') return 'AA';
        if (comp.type === 'power-supply') return Number(comp.props.voltage) === 3.3 ? '3.3V' : '5V';
        if (comp.type === 'dc-motor') return '电机';
        if (comp.type === 'servo') return '舵机';
        if (comp.type === 'vibration-motor') return '振动';
        return '';
      })();
      html += '<g class="comp' + sel + '" data-comp-id="' + esc(comp.id) + '" transform="translate(' + comp.x + ' ' + comp.y + ') rotate(' + (comp.rotation || 0) + ')">' +
        '<rect class="comp-hit" x="' + (b.x - 5) + '" y="' + (b.y - 5) + '" width="' + (b.w + 10) + '" height="' + (b.h + 10) + '" rx="7" fill="transparent"/>' +
        '<rect class="selection-ring halo" x="' + (b.x - 5) + '" y="' + (b.y - 5) + '" width="' + (b.w + 10) + '" height="' + (b.h + 10) + '" rx="7"/>' +
        '<rect class="selection-ring" x="' + (b.x - 5) + '" y="' + (b.y - 5) + '" width="' + (b.w + 10) + '" height="' + (b.h + 10) + '" rx="7"/>' +
        '<g class="comp-body">' + Art.component(comp, pins) + '</g>' +
        (labelText ? '<text class="comp-label" x="0" y="' + (b.y + b.h + 9) + '">' + esc(labelText) + '</text>' : '') +
        '</g>';
    });
    this.$layerComps.innerHTML = html;
  };

  Editor.prototype.pinSimState = function (compId, pinId) {
    if (!this.simRunning || !this.simResult) return null;
    const c = this.simResult.pins[compId];
    return c ? c[pinId] : null;
  };

  Editor.prototype.renderPins = function () {
    let html = '';
    const pending = this.pending;
    this.scene.components.forEach((comp) => {
      const pins = E.allPinsWorld(this.scene, comp);
      pins.forEach((p) => {
        const st = this.pinSimState(comp.id, p.id);
        const bound = this.bindings[comp.id] && this.bindings[comp.id][p.id];
        const isPending = pending && pending.kind === 'pin' && pending.comp === comp.id && String(pending.pin) === String(p.id);
        let cls = 'pin';
        if (E.SOURCE_TYPES[comp.type]) {
          const src = E.SOURCE_TYPES[comp.type];
          if (String(p.id) === String(src.plus)) cls += ' source-plus';
          if (String(p.id) === String(src.minus)) cls += ' source-minus';
        }
        if (st && st.high) cls += ' sim-high';
        else if (st && st.low) cls += ' sim-low';
        if (bound) cls += ' connected';
        if (isPending) cls += ' pending';
        html += '<g class="pin-group" data-comp="' + esc(comp.id) + '" data-pin="' + esc(p.id) + '">' +
          '<circle class="' + cls + '" cx="' + p.x.toFixed(2) + '" cy="' + p.y.toFixed(2) + '" r="2.9"/>' +
          '<circle class="pin-hit" cx="' + p.x.toFixed(2) + '" cy="' + p.y.toFixed(2) + '" r="10.5" data-comp="' + esc(comp.id) + '" data-pin="' + esc(p.id) + '"/>' +
          '<title>' + esc(partOf(comp.type).name + ' · ' + pinName(comp, p.id)) + (bound ? ' · 已插入面包板' : '') + '</title>' +
          '</g>';
      });
    });
    this.$layerPins.innerHTML = html;
  };

  Editor.prototype.anchorPoint = function (anchor) {
    if (!anchor) return null;
    if (anchor.kind === 'hole') {
      const h = (this.scene._holes || []).find((x) => x.id === anchor.hole);
      return h ? { x: h.x, y: h.y } : null;
    }
    if (anchor.kind === 'pin') {
      const comp = this.scene.components.find((c) => c.id === anchor.comp);
      if (!comp) return null;
      const pin = E.pinLocal(comp, anchor.pin);
      if (!pin) return null;
      return E.pinWorld(comp, pin);
    }
    return null;
  };

  Editor.prototype.pinStub = function (anchor, distance) {
    if (!anchor || anchor.kind !== 'pin') return null;
    const comp = this.scene.components.find((c) => c.id === anchor.comp);
    if (!comp) return null;
    const def = E.DEFS[comp.type];
    if (!def || !def.bounds) return null;
    const pin = E.pinLocal(comp, anchor.pin);
    if (!pin) return null;
    const b = def.bounds;
    const dl = Math.abs(pin.x - b.x), dr = Math.abs(b.x + b.w - pin.x);
    const dt = Math.abs(pin.y - b.y), db = Math.abs(b.y + b.h - pin.y);
    const min = Math.min(dl, dr, dt, db);
    let dx = 0, dy = 0;
    if (min === dl) dx = -distance;
    else if (min === dr) dx = distance;
    else if (min === dt) dy = -distance;
    else dy = distance;
    return { x: comp.x + pin.x + dx, y: comp.y + pin.y + dy };
  };

  Editor.prototype.segmentClear = function (a, b, rects) {
    if (!rects || !rects.length) return true;
    const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      for (const r of rects) {
        if (x > r.x + 1 && x < r.x + r.w - 1 && y > r.y + 1 && y < r.y + r.h - 1) return false;
      }
    }
    return true;
  };

  Editor.prototype.routeAround = function (a, b, rects) {
    if (!rects || !rects.length) return null;
    if (this.segmentClear(a, b, rects)) return null;
    const nodes = [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
    rects.forEach((r) => {
      nodes.push({ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }, { x: r.x, y: r.y + r.h }, { x: r.x + r.w, y: r.y + r.h });
    });
    const n = nodes.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const used = new Array(n).fill(false);
    dist[0] = 0;
    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!used[i] && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || dist[u] === Infinity) break;
      if (u === 1) break;
      used[u] = true;
      for (let v = 0; v < n; v++) {
        if (v === u || used[v]) continue;
        if (!this.segmentClear(nodes[u], nodes[v], rects)) continue;
        const w = dist[u] + Math.hypot(nodes[v].x - nodes[u].x, nodes[v].y - nodes[u].y);
        if (w < dist[v]) { dist[v] = w; prev[v] = u; }
      }
    }
    if (dist[1] === Infinity) return null;
    const route = [];
    for (let at = 1; at >= 0; at = prev[at]) {
      if (at < 0) return null;
      route.unshift(nodes[at]);
      if (at === 0) break;
    }
    return route;
  };

  Editor.prototype.routeBody = function (points, radius) {
    const r = radius || 9;
    let d = '';
    for (let i = 1; i < points.length; i++) {
      const cur = points[i];
      const next = points[i + 1];
      if (!next) { d += ' L' + cur.x.toFixed(2) + ' ' + cur.y.toFixed(2); break; }
      const prev = points[i - 1];
      const l1 = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      const l2 = Math.hypot(next.x - cur.x, next.y - cur.y);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      if (rr < 1.5) { d += ' L' + cur.x.toFixed(2) + ' ' + cur.y.toFixed(2); continue; }
      const bx = cur.x + (prev.x - cur.x) / l1 * rr;
      const by = cur.y + (prev.y - cur.y) / l1 * rr;
      const ax = cur.x + (next.x - cur.x) / l2 * rr;
      const ay = cur.y + (next.y - cur.y) / l2 * rr;
      d += ' L' + bx.toFixed(2) + ' ' + by.toFixed(2) + ' Q' + cur.x.toFixed(2) + ' ' + cur.y.toFixed(2) + ' ' + ax.toFixed(2) + ' ' + ay.toFixed(2);
    }
    return d;
  };

  Editor.prototype.wirePath = function (a, b, seed, obstacles) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const n = Number(seed) || 0;
    const bend = ((n % 9) - 4);
    let lift = Math.min(52, 16 + dist * 0.065) + bend * 3;
    let cy = Math.min(a.y, b.y) - lift;
    if (obstacles && obstacles.length && !this.segmentClear(a, b, obstacles)) {
      let top = Infinity;
      const minX = Math.min(a.x, b.x) - 4, maxX = Math.max(a.x, b.x) + 4;
      obstacles.forEach((o) => {
        if (o.x < maxX && o.x + o.w > minX) top = Math.min(top, o.y);
      });
      if (top !== Infinity) cy = Math.min(cy, top - 22);
    }
    const sway = bend * 2.2;
    const x1 = a.x + dx * 0.24 + sway;
    const x2 = b.x - dx * 0.24 + sway;
    return 'M' + a.x.toFixed(2) + ' ' + a.y.toFixed(2) + ' C' + x1.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + x2.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + b.x.toFixed(2) + ' ' + b.y.toFixed(2);
  };

  Editor.prototype.wireRouteSeed = function (w) {
    const n = Number(String(w.id || '').replace(/\D/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  Editor.prototype.wireColorClass = function (w) {
    if (w.color === 'red' || w.color === 'black' || w.color === 'blue' || w.color === 'yellow') return w.color === 'black' ? 'ground' : (w.color === 'red' ? 'power' : '');
    return '';
  };

  Editor.prototype.wireSimClass = function (w) {
    if (!this.simRunning || !this.simResult) return '';
    const check = (a) => {
      if (!a) return null;
      if (a.kind === 'pin') {
        const st = this.simResult.pins[a.comp] && this.simResult.pins[a.comp][a.pin];
        if (!st) return null;
        return st.high ? 'high' : (st.low ? 'low' : null);
      }
      return null;
    };
    const sa = check(w.a);
    const sb = check(w.b);
    if (sa === 'high' || sb === 'high') return 'high';
    if (sa === 'low' || sb === 'low') return 'low';
    return '';
  };

  Editor.prototype.describeAnchor = function (anchor) {
    if (!anchor) return '未知位置';
    if (anchor.kind === 'pin') {
      const comp = this.scene.components.find((c) => c.id === anchor.comp);
      if (!comp) return '引脚';
      return partOf(comp.type).name + ' · ' + pinName(comp, anchor.pin);
    }
    if (anchor.kind === 'hole') {
      const h = (this.scene._holes || []).find((x) => x.id === anchor.hole);
      if (!h) return '面包板孔';
      if (h.kind === 'rail') return h.rail && h.rail.indexOf('p') >= 0 ? '电源正极轨' : '电源负极轨';
      return h.col && h.rowName ? '面包板 · 第 ' + h.col + ' 列 ' + h.rowName + ' 行' : '面包板孔';
    }
    return '连接点';
  };

  Editor.prototype.renderWires = function () {
    let html = '';
    const selectedId = this.selection && this.selection.kind === 'wire' ? this.selection.id : null;
    const obstacles = this.scene.components.map((comp) => {
      const def = E.DEFS[comp.type];
      if (!def || !def.bounds) return null;
      const b = def.bounds;
      return { id: comp.id, x: comp.x + b.x - 5, y: comp.y + b.y - 5, w: b.w + 10, h: b.h + 10 };
    }).filter(Boolean);
    this._wirePathCache = {};
    (this.scene.wires || []).forEach((w, index) => {
      const a = this.anchorPoint(w.a), b = this.anchorPoint(w.b);
      if (!a || !b) return;
      const blocked = obstacles.filter((o) => o.id !== w.a.comp && o.id !== w.b.comp);
      const d = this.wirePath(a, b, this.wireRouteSeed(w) + index, blocked);
      this._wirePathCache[w.id] = d;
      const role = this.wireColorClass(w);
      const state = role ? '' : this.wireSimClass(w);
      const sel = w.id === selectedId ? ' sel' : '';
      html += '<g class="wire-group" data-wire-id="' + esc(w.id) + '">' +
        '<title>' + esc(this.describeAnchor(w.a) + ' → ' + this.describeAnchor(w.b)) + '</title>' +
        '<path class="wire-halo" d="' + d + '"/>' +
        '<path class="wire ' + role + ' ' + state + sel + '" d="' + d + '"/>' +
        '<path class="wire-hit" d="' + d + '" data-wire="' + esc(w.id) + '"/>' +
        '</g>';
    });
    this.$layerWires.innerHTML = html;
    this.renderWireFocus();
  };

  Editor.prototype.renderWireFocus = function () {
    if (!this.$layerWireFocus) return;
    const selectedId = this.selection && this.selection.kind === 'wire' ? this.selection.id : null;
    const focusId = this.hoverWireId || selectedId;
    let html = '';
    (this.scene.wires || []).forEach((w) => {
      const a = this.anchorPoint(w.a), b = this.anchorPoint(w.b);
      if (!a || !b) return;
      const role = this.wireColorClass(w);
      html += '<circle class="wire-cap-focus ' + role + '" cx="' + a.x.toFixed(2) + '" cy="' + a.y.toFixed(2) + '" r="3"/>';
      html += '<circle class="wire-cap-focus ' + role + '" cx="' + b.x.toFixed(2) + '" cy="' + b.y.toFixed(2) + '" r="3"/>';
    });
    if (focusId) {
      const w = this.scene.wires.find((x) => x.id === focusId);
      if (w) {
        const a = this.anchorPoint(w.a), b = this.anchorPoint(w.b);
        if (a && b) {
          const index = this.scene.wires.indexOf(w);
          const d = (this._wirePathCache && this._wirePathCache[w.id]) || this.wirePath(a, b, this.wireRouteSeed(w) + index);
          const role = this.wireColorClass(w);
          const state = role ? '' : this.wireSimClass(w);
          html += '<g class="wire-group wire-focus-group">' +
            '<path class="wire-halo focus" d="' + d + '"/>' +
            '<path class="wire-focus ' + role + ' ' + state + '" d="' + d + '"/>' +
            '</g>';
        }
      }
    }
    this.$layerWireFocus.innerHTML = html;
  };

  Editor.prototype.renderDraft = function () {
    if (!this.pending || !this.cursor) { this.$layerDraft.innerHTML = ''; return; }
    const a = this.anchorPoint(this.pending);
    if (!a) { this.$layerDraft.innerHTML = ''; return; }
    const b = this.cursor;
    const d = this.wirePath(a, b);
    this.$layerDraft.innerHTML = '<path class="wire preview" d="' + d + '"/>' +
      '<circle cx="' + b.x.toFixed(2) + '" cy="' + b.y.toFixed(2) + '" r="3" fill="#2563eb" opacity=".85"/>' +
      '<circle cx="' + a.x.toFixed(2) + '" cy="' + a.y.toFixed(2) + '" r="4.2" fill="none" stroke="#2563eb" stroke-width="1.3"/>';
  };

  Editor.prototype.updateStatus = function () {
    if (!this.$statusCount) return;
    this.$statusCount.textContent = this.scene.components.length + ' 个元件 · ' + this.scene.wires.length + ' 条导线';
    let label = '就绪';
    if (this.selection) {
      if (this.selection.kind === 'comp') {
        const c = this.scene.components.find((x) => x.id === this.selection.id);
        label = c ? partOf(c.type).name : '已选中';
        this.$statusSelect.textContent = '已选中：' + (c ? partOf(c.type).name : '') + (c && this.bindings[c.id] && Object.keys(this.bindings[c.id]).length ? ' · 已插入面包板' : '');
      } else {
        label = '导线';
        this.$statusSelect.textContent = '已选中：导线';
      }
    } else {
      this.$statusSelect.textContent = '';
    }
    if (this.simRunning) label = '模拟运行中';
    this.$statusText.textContent = label;
    this.$statusLight.className = 'status-light ' + (this.simRunning ? 'sim' : 'on');
    if (this.$statusSnap) this.$statusSnap.textContent = this.snap ? '开' : '关';
    if (this.$ribbonHint) {
      this.$ribbonHint.textContent = this.tool === 'wire' ? '连线模式：从一个引脚或插孔拖到另一个引脚' :
        this.tool === 'delete' ? '删除模式：点击元件或导线将其删除' :
          '选择元件拖动位置 · 拖动引脚到另一个引脚即可连线';
    }
  };

  /* ------------------------------------------------------------------
     Library
     ------------------------------------------------------------------ */
  Editor.prototype.renderLibrary = function () {
    const cats = BBL.CATEGORIES;
    this.$chips.innerHTML = cats.map((c) => '<button class="chip' + ((this._cat || 'all') === c.id ? ' active' : '') + '" data-cat="' + c.id + '">' + c.label + '</button>').join('');
    const parts = BBL.PARTS.filter((p) => p.id !== 'breadboard');
    this.$libCount.textContent = parts.length;
    this.renderPartGrid();
  };

  Editor.prototype.renderPartGrid = function () {
    const q = (this.$search.value || '').trim().toLowerCase();
    const cat = this._cat || 'all';
    let parts = BBL.PARTS.filter((p) => p.id !== 'breadboard');
    if (cat !== 'all') parts = parts.filter((p) => p.cat === cat);
    if (q) {
      parts = parts.filter((p) => (p.name + ' ' + p.en + ' ' + p.tags.join(' ') + ' ' + p.short).toLowerCase().includes(q));
    }
    if (!parts.length) {
      this.$scroll.innerHTML = '<div class="library-empty">' + svgIcon('search') + '<div>没有找到匹配的元件</div><div style="margin-top:4px;color:#9aa3b2">换个关键词试试</div></div>';
      return;
    }
    const groups = {};
    parts.forEach((p) => { (groups[p.cat] = groups[p.cat] || []).push(p); });
    const order = cat === 'all' ? ['basic', 'power', 'logic', 'output', 'board'] : [cat];
    let html = '';
    order.forEach((key) => {
      const list = groups[key];
      if (!list || !list.length) return;
      if (cat === 'all') html += '<div class="part-section-label">' + BBL.CAT_LABEL[key] + '</div>';
      html += '<div class="part-grid">' + list.map((p) =>
        '<div class="part-card" data-part-id="' + p.id + '" title="' + esc(p.name + ' · ' + p.foot + '，拖到画布或点击添加') + '" role="button" tabindex="0">' +
        '<div class="part-card-art">' + serviceIcon(p.id) + '</div>' +
        '<div class="part-card-name">' + esc(p.name) + '</div>' +
        '</div>').join('') + '</div>';
    });
    this.$scroll.innerHTML = html;
    this.$searchClear.classList.toggle('show', !!q);
  };

  Editor.prototype.addPart = function (type, x, y, opts) {
    if (type === 'breadboard') { this.toast('画布中已经有一块 830 孔面包板了。', 'info'); return; }
    if (!E.DEFS[type]) return;
    const comp = E.createComponent(type, x, y);
    comp.id = this.uniqueComponentId(type);
    const def = E.DEFS[type];
    if (this.snap) {
      const near = E.snapComponent(this.scene, comp, 16);
      if (!near) {
        // keep freely dropped
      }
    }
    this.scene.components.push(comp);
    this.selection = { kind: 'comp', id: comp.id };
    this.tab = 'inspector';
    this.renderTabs();
    this.renderScene();
    this.renderInspector();
    this.commit('添加' + partOf(type).name);
    this.refreshCodeAvailability();
    if (this.simRunning) this.runSimulation();
    if (isMobile()) this.closePanel();
    if (!opts || !opts.silent) {
      this.toast('已添加 ' + partOf(type).name + (this.bindings[comp.id] && Object.keys(this.bindings[comp.id]).length ? ' · 已自动插入面包板' : ''));
    }
  };

  Editor.prototype.openPanel = function (tab) {
    if (tab) { this.tab = tab; this.renderTabs(); }
    this.$panel.classList.add('open');
    this.$scrim.classList.add('show');
    document.body.classList.add('no-scroll');
  };

  Editor.prototype.closePanel = function () {
    this.$panel.classList.remove('open');
    this.$scrim.classList.remove('show');
    document.body.classList.remove('no-scroll');
  };

  Editor.prototype.renderTabs = function () {
    const tabs = this.mount.querySelectorAll('.side-tab');
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === this.tab));
    this.$libraryPane.classList.toggle('hidden', this.tab !== 'library');
    this.$inspectorPane.classList.toggle('active', this.tab === 'inspector');
  };

  /* ------------------------------------------------------------------
     Inspector
     ------------------------------------------------------------------ */
  Editor.prototype.renderInspector = function () {
    if (this.tab !== 'inspector') { this.renderTabs(); return; }
    this.renderTabs();
    const sel = this.selection;
    if (!sel) {
      this.$inspectorPane.innerHTML = '<div class="library-empty" style="padding-top:56px">' +
        '<div style="width:48px;height:48px;border-radius:14px;background:#f4f7fc;display:grid;place-items:center;margin:0 auto 12px;color:#8b98aa">' + svgIcon('cursor') + '</div>' +
        '<div style="font-weight:650;color:#374151">还没有选中元件</div>' +
        '<div style="margin-top:4px;color:#9aa3b2;line-height:1.7">点击画布里的电阻、LED 或芯片<br>查看参数与引脚状态</div>' +
        '<button class="btn soft sm" data-tab="library" style="margin-top:14px">去元件库看看</button></div>';
      this.$inspectorPane.querySelector('[data-tab="library"]').addEventListener('click', () => { this.tab = 'library'; this.renderInspector(); });
      return;
    }
    if (sel.kind === 'wire') { this.renderWireInspector(sel.id); return; }
    const comp = this.scene.components.find((c) => c.id === sel.id);
    if (!comp) { this.selection = null; this.renderInspector(); return; }
    const part = partOf(comp.type);
    const def = E.DEFS[comp.type];
    const sim = this.simRunning && this.simResult && this.simResult.components[comp.id];
    const pinsHtml = def.pins.map((p) => {
      const st = this.pinSimState(comp.id, p.id);
      const hole = this.bindings[comp.id] && this.bindings[comp.id][p.id];
      let stateCls = '';
      if (st && st.high) stateCls = 'high';
      else if (st && st.low) stateCls = 'low';
      const connected = st ? st.connected : !!hole;
      return '<div class="pin-row">' +
        '<span class="pin-num">' + esc(p.id) + '</span>' +
        '<span class="pin-name">' + esc(pinName(comp, p.id)) + '<small>' + (hole ? '已插入' : (connected ? '已连接' : '未连接')) + '</small></span>' +
        '<span class="pin-net">' + (st ? 'N' + st.net : '—') + '</span>' +
        '<span class="pin-state ' + stateCls + '" title="' + (stateCls === 'high' ? '高电平' : stateCls === 'low' ? '低电平' : '未仿真') + '"></span>' +
        '</div>';
    }).join('');
    const propsHtml = this.inspectorProps(comp, sim);
    const passiveTypes = ['resistor', 'capacitor', 'potentiometer', 'button', 'slide-switch'];
    let meta = '';
    if (sim) {
      if (passiveTypes.includes(comp.type)) meta = '<span class="pill green">仿真中</span>';
      else if (comp.type === 'power-supply' || comp.type.indexOf('battery') === 0) meta = '<span class="pill green">供电中</span>';
      else meta = '<span class="pill ' + (sim.powered ? 'green' : '') + '">' + (sim.powered ? '通电' : '未通电') + '</span>';
    }
    this.$inspectorPane.innerHTML = `
      <div class="inspector-hero">
        <div class="inspector-hero-top">
          <div class="inspector-art">${serviceIcon(comp.type)}</div>
          <div class="inspector-title">
            <h3>${esc(part.name)}</h3>
            <p>${esc(part.en)}</p>
            <div class="inspector-badges">${meta}<span class="pill">${esc(BBL.CAT_LABEL[part.cat] || '')}</span><span class="pill">${esc(part.foot || '')}</span></div>
          </div>
        </div>
        <p class="inspector-desc">${esc(part.short)}</p>
      </div>
      ${propsHtml}
      <div class="inspector-section">
        <h4>${svgIcon('pin')} 引脚与连线 <span style="margin-left:auto;font-weight:500;letter-spacing:0">${def.pins.length} 个引脚</span></h4>
        <div class="pin-table">${pinsHtml}</div>
      </div>
      <div class="inspector-actions">
        <button class="btn sm" data-action="rotate">${svgIcon('rotate')} 旋转</button>
        <button class="btn sm" data-action="duplicate">${svgIcon('copy')} 复制</button>
        <button class="btn sm ghost" data-action="delete-selected" title="删除">${svgIcon('trash')}</button>
      </div>
      <div style="padding:0 16px 18px"><a class="btn ghost sm block" href="#/parts/${comp.type}" style="color:#2563eb">查看 ${esc(part.name)} 元件教程 ${svgIcon('arrow-right')}</a></div>`;
    this.attachInspectorEvents();
  };

  Editor.prototype.inspectorProps = function (comp, sim) {
    let rows = '';
    const p = comp.props || {};
    if (comp.type === 'resistor') {
      const opts = [100, 220, 330, 470, 1000, 10000].map((v) => '<option value="' + v + '"' + (Number(p.resistance) === v ? ' selected' : '') + '>' + (v >= 1000 ? (v / 1000) + ' kΩ' : v + ' Ω') + '</option>').join('');
      rows += '<div class="prop-row"><span class="prop-label">阻值</span><div class="prop-control"><select class="select-ui" data-prop-select="resistance">' + opts + '</select></div></div>';
      const bandText = { 100: '棕 黑 棕 金', 220: '红 红 棕 金', 330: '橙 橙 棕 金', 470: '黄 紫 棕 金', 1000: '棕 黑 红 金', 10000: '棕 黑 橙 金' }[Number(p.resistance)] || '红 红 棕 金';
      rows += '<div class="prop-row"><span class="prop-label">色环</span><span class="prop-control mono" style="font-size:10px;color:#6b7280">' + bandText + '</span></div>';
    } else if (comp.type === 'led') {
      const colors = [['red', '#ef4444', '红'], ['green', '#22c55e', '绿'], ['yellow', '#facc15', '黄'], ['blue', '#3b82f6', '蓝']];
      rows += '<div class="prop-row"><span class="prop-label">颜色</span><div class="color-dots">' + colors.map((c) => '<button class="color-dot' + (p.color === c[0] ? ' active' : '') + '" data-action="set-color" data-color="' + c[0] + '" title="' + c[2] + '色" style="background:' + c[1] + '"></button>').join('') + '</div></div>';
      const current = sim ? (sim.current * 1000).toFixed(1) + ' mA' : '—';
      rows += '<div class="prop-row"><span class="prop-label">正向电流</span><span class="prop-control mono" style="font-size:11px;color:#6b7280">' + current + '</span></div>';
    } else if (comp.type === 'button') {
      rows += '<div class="prop-row"><span class="prop-label">按住状态</span><div class="prop-control"><button class="toggle-btn ' + (p.pressed ? 'on' : '') + '" data-action="prop-toggle" data-prop="pressed" aria-label="切换按钮状态"></button></div></div>';
      rows += '<div style="font-size:10.5px;color:#9aa3b2;line-height:1.6;margin-top:4px">仿真时可以点击画布中的按钮，或拨动这个开关。</div>';
    } else if (comp.type === 'potentiometer') {
      rows += '<div class="prop-row"><span class="prop-label">旋钮位置</span><div class="prop-control"><input class="range-ui" type="range" min="0" max="100" step="1" value="' + Number(p.position) + '" data-range="position"><span class="range-val" id="range-val">' + Number(p.position) + '%</span></div></div>';
      rows += '<div class="prop-row"><span class="prop-label">总阻值</span><span class="prop-control mono" style="font-size:11px;color:#6b7280">10 kΩ</span></div>';
    } else if (comp.type === 'capacitor') {
      const values = [['100n', '100 nF'], ['10u', '10 µF'], ['1000u', '1000 µF']];
      rows += '<div class="prop-row"><span class="prop-label">容量</span><div class="prop-control"><select class="select-ui" data-prop-select="capacitance">' + values.map((v, i) => '<option value="' + (i === 0 ? 100e-9 : i === 1 ? 10e-6 : 1000e-6) + '"' + (Number(p.capacitance) === (i === 0 ? 100e-9 : i === 1 ? 10e-6 : 1000e-6) ? ' selected' : '') + '>' + v[1] + '</option>').join('') + '</select></div></div>';
    } else if (comp.type === 'slide-switch') {
      rows += '<div class="prop-row"><span class="prop-label">当前状态</span><div class="prop-control"><div style="display:flex;gap:4px"><button class="btn sm ' + (Number(p.position) === 0 ? 'soft' : '') + '" data-action="set-switch" data-pos="0">A 侧</button><button class="btn sm ' + (Number(p.position) === 1 ? 'soft' : '') + '" data-action="set-switch" data-pos="1">B 侧</button></div></div></div>';
    } else if (comp.type === 'power-supply') {
      rows += '<div class="prop-row"><span class="prop-label">输出电压</span><div class="prop-control"><select class="select-ui" data-prop-select="voltage"><option value="5"' + (Number(p.voltage) === 5 ? ' selected' : '') + '>5.0 V</option><option value="3.3"' + (Number(p.voltage) === 3.3 ? ' selected' : '') + '>3.3 V</option></select></div></div>';
      rows += '<div class="prop-row"><span class="prop-label">电流</span><span class="prop-control mono" style="font-size:11px;color:#6b7280">' + (sim ? (((sim.current || 0) > 0.0005 ? sim.current : (this.simResult.leds || []).reduce((a, l) => a + (l.current || 0), 0)) * 1000).toFixed(1) + ' mA' : '—') + '</span></div>';
    } else if (comp.type.indexOf('ic74hc') === 0) {
      const info = E.IC_GATES[comp.type];
      rows += '<div class="prop-row"><span class="prop-label">逻辑功能</span><span class="prop-control"><span class="pill blue">' + (info ? info.sub : '') + '</span></span></div>';
      rows += '<div class="prop-row"><span class="prop-label">电源</span><span class="prop-control mono" style="font-size:11px;color:#6b7280">' + (sim ? (sim.vcc - sim.gnd).toFixed(1) + ' V' : '第 14 脚 / 第 7 脚') + '</span></div>';
      if (sim && sim.gates) {
        rows += '<div class="prop-row" style="align-items:flex-start"><span class="prop-label">门输出</span><div class="prop-control" style="flex-wrap:wrap;justify-content:flex-end">' + sim.gates.map((g, i) => '<span class="pill ' + (g.out ? 'green' : '') + '">' + (i + 1) + ': ' + (g.out ? 1 : 0) + '</span>').join('') + '</div></div>';
      }
    } else if (comp.type === 'buzzer' && sim) {
      rows += '<div class="prop-row"><span class="prop-label">发声</span><span class="prop-control"><span class="pill ' + (sim.buzzer ? 'green' : '') + '">' + (sim.buzzer ? '响' : '静音') + '</span></span></div>';
    } else if (comp.type === 'dc-motor' && sim) {
      rows += '<div class="prop-row"><span class="prop-label">转速</span><span class="prop-control"><span class="pill ' + (sim.motor > 0.1 ? 'green' : '') + '">' + Math.round((sim.motor || 0) * 100) + '%</span></span></div>';
    } else if (comp.type === 'servo' && sim) {
      rows += '<div class="prop-row"><span class="prop-label">角度</span><span class="prop-control mono" style="font-size:11px">' + Math.round(sim.angle || 0) + '°</span></div>';
    }
    if (!rows) return '';
    return '<div class="inspector-section"><h4>' + svgIcon('layers') + ' 参数</h4>' + rows + '</div>';
  };

  Editor.prototype.attachInspectorEvents = function () {
    // delegated at root; nothing needed
  };

  Editor.prototype.renderWireInspector = function (wireId) {
    const w = this.scene.wires.find((x) => x.id === wireId);
    if (!w) { this.selection = null; this.renderInspector(); return; }
    const colors = [['green', '#2e9e77', '信号'], ['red', '#e05252', '正极'], ['black', '#3c4657', '地'], ['blue', '#3b82f6', '蓝色'], ['yellow', '#eab308', '黄色']];
    this.$inspectorPane.innerHTML = `
      <div class="inspector-hero">
        <div class="inspector-hero-top">
          <div class="inspector-art" style="font-size:28px">${svgIcon('wire')}</div>
          <div class="inspector-title"><h3>导线</h3><p>JUMPER WIRE</p><div class="inspector-badges"><span class="pill">连接线</span></div></div>
        </div>
        <p class="inspector-desc">把两个引脚或面包板孔连接成同一条电气网络。点击导线后，这里会显示两端接在哪里。</p>
      </div>
      <div class="inspector-section"><h4>${svgIcon('pin')} 连接位置</h4>
        <div class="wire-endpoints"><div><i class="end-a"></i><span>${esc(this.describeAnchor(w.a))}</span></div><div><i class="end-b"></i><span>${esc(this.describeAnchor(w.b))}</span></div></div>
      </div>
      <div class="inspector-section"><h4>${svgIcon('layers')} 颜色</h4>
        <div class="prop-row"><span class="prop-label">导线颜色</span><div class="color-dots">${colors.map((c) => `<button class="color-dot${w.color === c[0] ? ' active' : ''}" data-action="set-wire-color" data-color="${c[0]}" title="${c[2]}" style="background:${c[1]}"></button>`).join('')}</div></div>
      </div>
      <div class="inspector-actions">
        <button class="btn sm danger" data-action="delete-selected">${svgIcon('trash')} 删除导线</button>
      </div>`;
  };

  /* ------------------------------------------------------------------
     Scene mutations
     ------------------------------------------------------------------ */
  Editor.prototype.uniqueComponentId = function (type) {
    const prefix = ID_PREFIX[type] || type.replace(/[^a-z0-9]/gi, '').slice(0, 4);
    const used = new Set(this.scene.components.map((c) => c.id));
    let n = 1;
    while (used.has(prefix + n)) n++;
    return prefix + n;
  };

  Editor.prototype.uniqueWireId = function () {
    const used = new Set(this.scene.wires.map((w) => w.id));
    let n = 1;
    while (used.has('w' + n)) n++;
    return 'w' + n;
  };

  Editor.prototype.deleteSelected = function () {
    if (!this.selection) return;
    if (this.selection.kind === 'comp') this.deleteComponent(this.selection.id);
    else if (this.selection.kind === 'wire') this.deleteWire(this.selection.id);
  };

  Editor.prototype.deleteComponent = function (id) {
    const comp = this.scene.components.find((c) => c.id === id);
    if (!comp) return;
    if (id === this.codeArduinoId && this.codeRunning) {
      this.stopCode({ silent: true });
      this.setCodeStatus('Arduino 已被删除，代码运行已停止。', 'warn');
    }
    this.scene.components = this.scene.components.filter((c) => c.id !== id);
    this.scene.wires = this.scene.wires.filter((w) => !(w.a.kind === 'pin' && w.a.comp === id) && !(w.b.kind === 'pin' && w.b.comp === id));
    this.selection = null;
    this.tab = 'library';
    this.renderTabs();
    this.renderScene();
    this.renderInspector();
    this.commit('删除' + partOf(comp.type).name);
    this.refreshCodeAvailability();
    if (this.simRunning) this.runSimulation();
    this.toast('已删除 ' + partOf(comp.type).name);
  };

  Editor.prototype.deleteWire = function (id) {
    this.scene.wires = this.scene.wires.filter((w) => w.id !== id);
    this.selection = null;
    this.tab = 'library';
    this.renderTabs();
    this.renderScene();
    this.renderInspector();
    this.commit('删除导线');
    if (this.simRunning) this.runSimulation();
  };

  Editor.prototype.rotateSelected = function () {
    if (!this.selection || this.selection.kind !== 'comp') { this.toast('先选中一个元件'); return; }
    const comp = this.scene.components.find((c) => c.id === this.selection.id);
    if (!comp) return;
    comp.rotation = ((comp.rotation || 0) + 90) % 360;
    if (this.snap) E.snapComponent(this.scene, comp, 16);
    this.renderScene();
    this.renderInspector();
    this.commit('旋转元件');
    if (this.simRunning) this.runSimulation();
  };

  Editor.prototype.duplicateSelected = function () {
    if (!this.selection || this.selection.kind !== 'comp') { this.toast('先选中一个元件'); return; }
    const comp = this.scene.components.find((c) => c.id === this.selection.id);
    if (!comp) return;
    const copy = E.clone(comp);
    copy.id = this.uniqueComponentId(comp.type);
    copy.x += 26; copy.y += 26;
    this.scene.components.push(copy);
    this.selection = { kind: 'comp', id: copy.id };
    this.tab = 'inspector';
    this.renderTabs();
    this.renderScene();
    this.renderInspector();
    this.commit('复制元件');
    if (this.simRunning) this.runSimulation();
  };

  Editor.prototype.startWire = function (anchor, pointerEvent) {
    this.pending = anchor;
    const w = this.anchorPoint(anchor);
    this.cursor = w;
    this.$stage.classList.add('wiring');
    this.renderDraft();
    this.updateStatus();
    this.$ribbonHint.textContent = '连线中：点击另一个引脚或插孔完成连接，Esc 取消';
    if (pointerEvent) this.showWireHint();
  };

  Editor.prototype.cancelPending = function () {
    this.pending = null;
    this.cursor = null;
    this.$stage.classList.remove('wiring');
    this.renderDraft();
    this.renderPins();
    this.updateStatus();
  };

  Editor.prototype.completeWire = function (target) {
    if (!this.pending || !target) return false;
    if (this.pending.kind === target.kind) {
      if (target.kind === 'pin' && this.pending.comp === target.comp && String(this.pending.pin) === String(target.pin)) return false;
      if (target.kind === 'hole' && this.pending.hole === target.hole) return false;
    }
    const exists = this.scene.wires.some((w) => {
      const same = (a, b) => a.kind === b.kind && a.comp === b.comp && String(a.pin) === String(b.pin) && a.hole === b.hole;
      return (same(w.a, this.pending) && same(w.b, target)) || (same(w.a, target) && same(w.b, this.pending));
    });
    if (exists) { this.toast('这两个点已经连好了。', 'info'); this.cancelPending(); return false; }
    const w = {
      id: this.uniqueWireId(),
      a: Object.assign({}, this.pending),
      b: Object.assign({}, target),
      color: this.inferWireColor(this.pending, target)
    };
    this.scene.wires.push(w);
    this.cancelPending();
    this.selection = { kind: 'wire', id: w.id };
    this.tab = 'inspector';
    this.renderTabs();
    this.renderScene();
    this.renderInspector();
    this.commit('连接导线');
    if (this.simRunning) this.runSimulation();
    return true;
  };

  Editor.prototype.inferWireColor = function (a, b) {
    const role = (anchor) => {
      if (anchor.kind === 'hole') {
        const h = (this.scene._holes || []).find((x) => x.id === anchor.hole);
        if (!h) return '';
        if (h.rail === 'tp' || h.rail === 'bp') return 'red';
        if (h.rail === 'tm' || h.rail === 'bm') return 'black';
        return '';
      }
      const comp = this.scene.components.find((c) => c.id === anchor.comp);
      if (!comp) return '';
      const pin = String(anchor.pin);
      if (comp.type === 'power-supply' || comp.type.indexOf('battery') === 0 || comp.type === 'coin-cell' || comp.type === 'aa-battery' || comp.type === 'arduino-uno' || comp.type === 'microbit') {
        if (pin === 'V+' || pin === '+' || pin === '5v' || pin === '3v') return 'red';
        if (pin === 'GND' || pin === '-' || pin === 'gnd') return 'black';
      }
      return '';
    };
    const ra = role(a), rb = role(b);
    if (ra === 'red' || rb === 'red') return 'red';
    if (ra === 'black' || rb === 'black') return 'black';
    return 'green';
  };

  Editor.prototype.showWireHint = function () {
    if (!this.$statusText) return;
    this.$statusText.textContent = '请选择第二个连接点';
    this.$statusLight.className = 'status-light on';
  };

  /* ------------------------------------------------------------------
     Pointer interactions
     ------------------------------------------------------------------ */
  Editor.prototype.onPointerDown = function (e) {
    if (this._pinching) return;
    if (e.button !== undefined && e.button !== 0 && e.button !== 1) return;
    const libCard = e.target.closest('.part-card');
    if (libCard && this.$scroll.contains(libCard)) {
      this.beginLibraryDrag(e, libCard);
      return;
    }
    if (!this.$stage.contains(e.target)) return;
    // panel & buttons are outside stage; no need
    if (e.target.closest('.canvas-tools, .zoom-cluster, .task-card, .sim-hud, .canvas-tip, .canvas-corner, .empty-canvas-hint')) return;

    const pinEl = e.target.closest('.pin-hit');
    const holeEl = e.target.closest('[data-hole]');
    const wireEl = e.target.closest('.wire-hit');
    const compEl = e.target.closest('.comp');

    if (this.tool === 'delete') {
      if (pinEl) {
        const comp = this.scene.components.find((c) => c.id === pinEl.dataset.comp);
        if (comp) this.deleteComponent(comp.id);
        e.preventDefault();
        return;
      }
      if (wireEl) { this.deleteWire(wireEl.dataset.wire); e.preventDefault(); return; }
      if (compEl) { this.deleteComponent(compEl.dataset.compId); e.preventDefault(); return; }
      return;
    }

    if (pinEl) {
      const anchor = { kind: 'pin', comp: pinEl.dataset.comp, pin: pinEl.dataset.pin };
      if (this.pending) {
        this.completeWire(anchor);
        e.preventDefault();
        return;
      }
      this.startWire(anchor, e);
      this.drag = { mode: 'wire', pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false, anchor: anchor };
      try { this.$svg.setPointerCapture(e.pointerId); } catch (err) { }
      e.preventDefault();
      return;
    }

    if (holeEl) {
      const anchor = { kind: 'hole', hole: holeEl.dataset.hole };
      if (this.pending) { this.completeWire(anchor); e.preventDefault(); return; }
      if (this.tool === 'wire') {
        this.startWire(anchor, e);
        this.drag = { mode: 'wire', pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false, anchor: anchor };
        try { this.$svg.setPointerCapture(e.pointerId); } catch (err) { }
        e.preventDefault();
        return;
      }
      this.clearSelection();
      e.preventDefault();
      return;
    }

    if (wireEl) {
      this.selection = { kind: 'wire', id: wireEl.dataset.wire };
      this.tab = 'inspector';
      this.renderTabs();
      this.renderWires();
      this.renderInspector();
      this.updateStatus();
      e.preventDefault();
      return;
    }

    if (compEl) {
      const id = compEl.dataset.compId;
      const comp = this.scene.components.find((c) => c.id === id);
      if (!comp) return;
      this.selection = { kind: 'comp', id: id };
      this.tab = 'inspector';
      this.renderTabs();
      this.renderComponents();
      this.renderPins();
      this.renderInspector();
      this.updateStatus();
      if (this.simRunning && (comp.type === 'button' || comp.type === 'slide-switch')) {
        this.drag = { mode: 'toggle', comp: comp, id: id, startX: e.clientX, startY: e.clientY, pointerId: e.pointerId, moved: false };
        try { this.$svg.setPointerCapture(e.pointerId); } catch (err) { }
        e.preventDefault();
        return;
      }
      this.drag = {
        mode: 'comp', comp: comp, id: id, pointerId: e.pointerId,
        startX: e.clientX, startY: e.clientY, originX: comp.x, originY: comp.y,
        moved: false, before: this.serialize()
      };
      try { this.$svg.setPointerCapture(e.pointerId); } catch (err) { }
      e.preventDefault();
      return;
    }

    // background
    if (this.pending) { this.cancelPending(); }
    this.drag = { mode: 'pan', pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, viewX: this.view.x, viewY: this.view.y, moved: false };
    try { this.$svg.setPointerCapture(e.pointerId); } catch (err) { }
    this.$stage.classList.add('dragging');
    e.preventDefault();
  };

  Editor.prototype.onPointerMove = function (e) {
    if (!this._mounted) return;
    if (this.libDrag) { this.moveLibraryGhost(e); return; }
    if (!this.drag) {
      if (this.pending) {
        this.cursor = this.clientToWorld(e.clientX, e.clientY);
        this.renderDraft();
      }
      this.highlightTarget(e);
      return;
    }
    const d = this.drag;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    if (d.mode === 'pan') {
      this.view.x = d.viewX + dx;
      this.view.y = d.viewY + dy;
      this.userAdjustedView = true;
      this.updateView();
      if (d.moved) this.$stage.classList.add('dragging');
    } else if (d.mode === 'comp') {
      const wdx = dx / this.view.zoom, wdy = dy / this.view.zoom;
      d.comp.x = Math.round((d.originX + wdx) * 100) / 100;
      d.comp.y = Math.round((d.originY + wdy) * 100) / 100;
      this.renderComponents();
      this.renderWires();
      this.updateStatus();
    } else if (d.mode === 'wire') {
      this.cursor = this.clientToWorld(e.clientX, e.clientY);
      this.renderDraft();
      this.highlightTarget(e);
    }
  };

  Editor.prototype.onPointerUp = function (e) {
    if (!this._mounted) return;
    if (this.libDrag) { this.finishLibraryDrag(e); return; }
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    this.$stage.classList.remove('dragging');
    try { this.$svg.releasePointerCapture(e.pointerId); } catch (err) { }

    if (d.mode === 'pan') {
      if (!d.moved) {
        if (!e.target.closest('.comp, .wire-hit, .pin-hit, .hole-group')) this.clearSelection();
      }
      return;
    }

    if (d.mode === 'toggle') {
      if (!d.moved) this.toggleComponent(d.comp);
      return;
    }

    if (d.mode === 'comp') {
      if (!d.moved) return;
      if (this.snap) E.snapComponent(this.scene, d.comp, 15);
      this.renderScene();
      this.renderInspector();
      this.commit('移动' + partOf(d.comp.type).name);
      if (this.simRunning) this.runSimulation();
      return;
    }

    if (d.mode === 'wire') {
      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const pinEl = targetEl && targetEl.closest('.pin-hit');
      const holeEl = targetEl && targetEl.closest('[data-hole]');
      let target = null;
      if (pinEl) target = { kind: 'pin', comp: pinEl.dataset.comp, pin: pinEl.dataset.pin };
      else if (holeEl) target = { kind: 'hole', hole: holeEl.dataset.hole };
      if (target) {
        this.completeWire(target);
      } else if (d.moved) {
        this.cancelPending();
      }
      // if not moved, keep pending for click-click connecting
    }
  };

  Editor.prototype.cancelPointer = function () {
    if (!this._mounted) return;
    this.drag = null;
    this.libDrag = null;
    this.$stage.classList.remove('dragging');
    if (this.$ghost) this.$ghost.classList.remove('show');
  };

  Editor.prototype.highlightTarget = function (e) {
    document.querySelectorAll('.pin-hit.hot, .hole-group.hot, .wire-group.hovered').forEach((el) => el.classList.remove('hot', 'hovered'));
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const pin = el.closest('.pin-hit');
    if (pin) { pin.classList.add('hot'); }
    const hole = el.closest('.hole-group');
    if (hole) hole.classList.add('hot');
    const wire = el.closest('.wire-hit');
    if (this.$layerWires) {
      const id = wire ? wire.getAttribute('data-wire') : null;
      if (id !== this.hoverWireId) {
        this.hoverWireId = id;
        this.renderWireFocus();
      }
      this.$layerWires.classList.toggle('hover-focus', !!wire);
      if (wire) wire.closest('.wire-group').classList.add('hovered');
    }
  };

  Editor.prototype.clearSelection = function () {
    this.selection = null;
    this.tab = 'library';
    this.renderTabs();
    this.renderComponents();
    this.renderPins();
    this.renderInspector();
    this.updateStatus();
  };

  Editor.prototype.toggleComponent = function (comp) {
    if (!comp) return;
    if (comp.type === 'button') comp.props.pressed = !comp.props.pressed;
    else if (comp.type === 'slide-switch') comp.props.position = Number(comp.props.position) === 0 ? 1 : 0;
    else return;
    this.renderComponents();
    this.renderInspector();
    this.commit('切换' + partOf(comp.type).name);
    if (this.simRunning) this.runSimulation();
  };

  /* ------------------------------------------------------------------
     Library drag & click
     ------------------------------------------------------------------ */
  Editor.prototype.beginLibraryDrag = function (e, card) {
    if (e.button !== undefined && e.button !== 0) return;
    const touch = e.pointerType === 'touch';
    this.libDrag = {
      part: card.dataset.partId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      touch: touch,
      pointerId: e.pointerId
    };
    if (!touch) {
      card.setPointerCapture && card.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };

  Editor.prototype.moveLibraryGhost = function (e) {
    const d = this.libDrag;
    if (!d) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    if (d.touch) return;
    if (!d.moved) return;
    this.$ghost.innerHTML = serviceIcon(d.part);
    this.$ghost.classList.add('show');
    this.$ghost.style.left = e.clientX + 'px';
    this.$ghost.style.top = e.clientY + 'px';
    this.$stageWrap.classList.toggle('drag-over', this.isOverStage(e.clientX, e.clientY));
  };

  Editor.prototype.isOverStage = function (x, y) {
    const r = this.$stage.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  Editor.prototype.finishLibraryDrag = function (e) {
    const d = this.libDrag;
    this.libDrag = null;
    if (!d) return;
    this.$ghost.classList.remove('show');
    this.$stageWrap.classList.remove('drag-over');
    if (d.touch && d.moved) return;
    if (d.moved && this.isOverStage(e.clientX, e.clientY)) {
      const w = this.clientToWorld(e.clientX, e.clientY);
      this.addPart(d.part, w.x, w.y + 10);
    } else if (!d.moved) {
      const rect = this.$stage.getBoundingClientRect();
      const w = this.clientToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
      this.addPart(d.part, w.x, w.y);
    }
  };

  /* ------------------------------------------------------------------
     Clicks / actions
     ------------------------------------------------------------------ */
  Editor.prototype.onClick = function (e) {
    const card = e.target.closest('.part-card');
    if (card && this.$scroll.contains(card)) {
      // pointerup already handles normal click? We add here for keyboard/click resilience.
      if (this._suppressCardClick) { this._suppressCardClick = false; return; }
      // handled by pointerdown/up below if pointer; prevent duplicate via flag
    }
    const tab = e.target.closest('[data-tab]');
    if (tab && this.$root.contains(tab)) {
      this.tab = tab.dataset.tab;
      this.renderTabs();
      this.renderInspector();
      if (this.tab === 'library' && this.selection) { /* keep selection */ }
      return;
    }
    const codeTab = e.target.closest('[data-code-tab]');
    if (codeTab) { this.setCodeTab(codeTab.dataset.codeTab); return; }
    const chip = e.target.closest('[data-cat]');
    if (chip) { this._cat = chip.dataset.cat; this.renderLibrary(); return; }
    const tool = e.target.closest('[data-tool]');
    if (tool) { this.setTool(tool.dataset.tool); return; }
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === 'toggle-code') return this.toggleCodePanel();
      if (action === 'close-code') return this.closeCodePanel();
      if (action === 'code-run') return this.startCode();
      if (action === 'code-stop') return this.stopCode();
      if (action === 'clear-serial') return this.clearSerial();
      if (action === 'reset-code') return this.resetExampleCode();
      if (action === 'undo') return this.undo();
      if (action === 'redo') return this.redo();
      if (action === 'save') return this.manualSave();
      if (action === 'simulate') return this.toggleSimulation();
      if (action === 'menu') { this.$menu.hidden = !this.$menu.hidden; return; }
      if (action === 'export') return this.exportScene();
      if (action === 'import') return this.importScene();
      if (action === 'reset') return this.resetScene();
      if (action === 'clear') return this.clearScene();
      if (action === 'help') { this.closeMenu(); this.showHelp(); return; }
      if (action === 'rotate') return this.rotateSelected();
      if (action === 'duplicate') return this.duplicateSelected();
      if (action === 'delete-selected') return this.deleteSelected();
      if (action === 'snap') return this.toggleSnap();
      if (action === 'zoom-in') return this.zoomAt(this.$stage.getBoundingClientRect().left + this.$stage.clientWidth / 2, this.$stage.getBoundingClientRect().top + this.$stage.clientHeight / 2, 1.2);
      if (action === 'zoom-out') return this.zoomAt(this.$stage.getBoundingClientRect().left + this.$stage.clientWidth / 2, this.$stage.getBoundingClientRect().top + this.$stage.clientHeight / 2, 1 / 1.2);
      if (action === 'zoom-fit') return this.fitView(true);
      if (action === 'open-library') return this.openPanel('library');
      if (action === 'load-example') return this.loadExample();
      if (action === 'close-panel') return this.closePanel();
      if (action === 'set-color') return this.setLEDColor(actionEl.dataset.color);
      if (action === 'set-wire-color') return this.setWireColor(actionEl.dataset.color);
      if (action === 'prop-toggle') return this.toggleProp(actionEl.dataset.prop);
      if (action === 'set-switch') return this.setSwitchPos(Number(actionEl.dataset.pos));
      if (action === 'task-check') return this.toggleSimulation();
      if (action === 'task-collapse') return this.toggleTask();
      if (action === 'task-reset') return this.resetScene();
      if (action === 'lab-guide') { if (this.labId && BBL.ui.labGuide) BBL.ui.labGuide(this.labId); return; }
    }
    if (e.target.closest('#side-scrim')) { this.closePanel(); return; }
    // card keyboard activation
    if (card && this.$scroll.contains(card) && e.detail === 0) {
      const rect = this.$stage.getBoundingClientRect();
      const w = this.clientToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
      this.addPart(card.dataset.partId, w.x, w.y);
    }
  };

  Editor.prototype.onInput = function (e) {
    const t = e.target;
    if (t === this.$name) {
      this.scene.name = t.value;
      this.scheduleAutosave();
      return;
    }
    if (t === this.$codeText) {
      this.codeText = t.value;
      this.scene.code = { exampleId: this.codeExampleId, text: t.value };
      if (this.codeRunning) this.stopCode({ silent: true });
      this.setCodeStatus('代码已修改 · 点击「运行」重新编译并执行', 'ok');
      this.scheduleAutosave();
      return;
    }
    if (t === this.$search) {
      this.renderPartGrid();
      return;
    }
    if (t.matches('[data-range]')) {
      const comp = this.selection && this.scene.components.find((c) => c.id === this.selection.id);
      if (!comp) return;
      const val = Number(t.value);
      comp.props[t.dataset.range] = val;
      const label = t.parentElement.querySelector('#range-val, .range-val');
      if (label) label.textContent = val + '%';
      this.renderComponents();
      if (this.simRunning) this.runSimulation(false, { skipInspector: true });
      this.updateStatus();
    }
  };

  Editor.prototype.onChange = function (e) {
    const t = e.target;
    if (t === this.$codeExample) {
      this.loadCodeExample(t.value);
      return;
    }
    if (t.matches('[data-range]')) {
      this.commit('调整参数');
      this.renderInspector();
      return;
    }
    if (t.matches('[data-prop-select]')) {
      const comp = this.selection && this.scene.components.find((c) => c.id === this.selection.id);
      if (!comp) return;
      const key = t.dataset.propSelect;
      let val = t.value;
      if (key === 'voltage' || key === 'resistance') val = Number(val);
      if (key === 'capacitance') val = Number(val);
      comp.props[key] = val;
      this.renderScene();
      this.renderInspector();
      this.commit('修改参数');
      if (this.simRunning) this.runSimulation();
    }
  };

  Editor.prototype.onKeyDown = function (e) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.redo(); else this.undo();
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); this.redo(); return; }
    if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); this.duplicateSelected(); return; }
    if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); this.manualSave(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selection) { e.preventDefault(); this.deleteSelected(); }
      return;
    }
    if (e.key === 'Escape') {
      if (this.codeOpen) { this.closeCodePanel(); return; }
      if (this.pending) this.cancelPending();
      else if (this.$panel.classList.contains('open') && isMobile()) this.closePanel();
      else this.clearSelection();
      this.closeMenu();
      return;
    }
    if (e.key.toLowerCase() === 'v') { this.setTool('select'); return; }
    if (e.key.toLowerCase() === 'w') { this.setTool('wire'); return; }
    if (e.key.toLowerCase() === 'x') { this.setTool('delete'); return; }
    if (e.key.toLowerCase() === 's') { e.preventDefault(); this.toggleSimulation(); return; }
    if (e.key.toLowerCase() === 'r') { this.rotateSelected(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); const r = this.$stage.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.2); return; }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); const r = this.$stage.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.2); return; }
    if (e.key === '0') { e.preventDefault(); this.fitView(true); }
  };

  Editor.prototype.setTool = function (tool) {
    this.tool = tool;
    this.mount.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
    this.$stage.classList.toggle('wire-mode', tool === 'wire');
    this.$stage.classList.toggle('delete-mode', tool === 'delete');
    if (tool !== 'wire') this.cancelPending();
    this.updateStatus();
  };

  Editor.prototype.toggleSnap = function () {
    this.snap = !this.snap;
    this.mount.querySelectorAll('[data-action="snap"]').forEach((b) => b.classList.toggle('on', this.snap));
    this.updateStatus();
    this.toast(this.snap ? '已开启孔位吸附' : '已关闭孔位吸附', 'info');
  };

  Editor.prototype.setLEDColor = function (color) {
    const comp = this.selection && this.scene.components.find((c) => c.id === this.selection.id);
    if (!comp || comp.type !== 'led') return;
    comp.props.color = color;
    this.renderComponents();
    this.renderInspector();
    this.commit('修改 LED 颜色');
    if (this.simRunning) this.runSimulation();
  };

  Editor.prototype.setWireColor = function (color) {
    if (!this.selection || this.selection.kind !== 'wire') return;
    const w = this.scene.wires.find((x) => x.id === this.selection.id);
    if (!w) return;
    w.color = color;
    this.renderWires();
    this.renderInspector();
    this.commit('修改导线颜色');
  };

  Editor.prototype.toggleProp = function (prop) {
    const comp = this.selection && this.scene.components.find((c) => c.id === this.selection.id);
    if (!comp) return;
    comp.props[prop] = !comp.props[prop];
    this.renderComponents();
    this.renderPins();
    this.renderInspector();
    this.commit('切换状态');
    if (this.simRunning) this.runSimulation();
  };

  Editor.prototype.setSwitchPos = function (pos) {
    const comp = this.selection && this.scene.components.find((c) => c.id === this.selection.id);
    if (!comp) return;
    comp.props.position = pos;
    this.renderComponents();
    this.renderPins();
    this.renderInspector();
    this.commit('切换开关');
    if (this.simRunning) this.runSimulation();
  };

  /* ------------------------------------------------------------------
     Simulation
     ------------------------------------------------------------------ */
  Editor.prototype.toggleSimulation = function () {
    if (this.simRunning) { this.stopSimulation(); return; }
    this.startSimulation();
  };

  Editor.prototype.startSimulation = function () {
    this.simRunning = true;
    this.$stage.classList.add('sim-running');
    this.$simBtn.classList.add('running');
    this.$simBtn.innerHTML = svgIcon('pause') + '<span id="sim-btn-label">暂停模拟</span>';
    this.$simBtnLabel = this.mount.querySelector('#sim-btn-label');
    this.runSimulation();
    const warns = this.simResult ? this.simResult.warnings : [];
    if (warns.length) {
      const err = warns.find((w) => w.level === 'error') || warns[0];
      this.toast(err.message, err.level === 'error' ? 'warn' : 'info');
    } else {
      this.toast('模拟已启动，可以点击按钮或开关试试。');
    }
    this.updateStatus();
  };

  Editor.prototype.stopSimulation = function () {
    if (this.codeRunner) {
      this.codeRunner.stop();
      this.codeRunner = null;
    }
    this.codeRunning = false;
    this.codeIO = {};
    this.simRunning = false;
    this.simResult = null;
    this.$stage.classList.remove('sim-running');
    this.$simBtn.classList.remove('running');
    this.$simBtn.innerHTML = svgIcon('play') + '<span id="sim-btn-label">开始模拟</span>';
    this.$simBtnLabel = this.mount.querySelector('#sim-btn-label');
    this.updateCodeUI();
    this.renderScene();
    this.$hud.classList.remove('show');
    this.renderInspector();
    this.renderTask();
    this.updateStatus();
  };

  Editor.prototype.runSimulation = function (quiet, opts) {
    const o = opts || {};
    try {
      const io = this.codeRunning && this.codeIO && Object.keys(this.codeIO).length ? this.codeIO : {};
      const result = E.simulate(this.scene, { io: io });
      this.simResult = result;
      this.renderWires();
      this.renderComponents();
      this.renderPins();
      if (!o.skipInspector) this.renderInspector();
      if (!o.skipTask) this.renderTask();
      this.updateSimUi();
      this.updateStatus();
      return result;
    } catch (err) {
      console.error(err);
      this.simResult = null;
      this.updateSimUi();
      this.toast('仿真失败：' + err.message, 'error');
      return null;
    }
  };

  Editor.prototype.updateSimUi = function () {
    const r = this.simResult;
    if (!this.simRunning || !r) {
      this.$hud.classList.remove('show', 'warn');
      this.$hud.innerHTML = '';
      return;
    }
    const errors = r.warnings.filter((w) => w.level === 'error');
    const warns = r.warnings;
    let inner = '';
    if (errors.length) {
      this.$hud.classList.add('warn');
      inner = '<span class="live-dot"></span><span>' + esc(errors[0].message) + '</span>';
    } else {
      this.$hud.classList.remove('warn');
      const ledCount = r.leds.filter((l) => l.on && l.current > 0.0005).length;
      const ledCurrent = r.leds.reduce((a, l) => a + (l.current || 0), 0);
      const loadCurrent = Object.values(r.components).reduce((a, c) => {
        if (['dc-motor', 'buzzer', 'vibration-motor'].includes(c.type)) return a + (c.current || 0);
        return a;
      }, 0);
      const currentVal = Math.max(r.maxCurrent || 0, ledCurrent, loadCurrent);
      const current = r.sources.length ? (currentVal * 1000).toFixed(1) + ' mA' : '无电源';
      inner = '<span class="live-dot"></span><span>模拟中</span><span class="hud-divider"></span><span>LED × ' + ledCount + '</span><span class="hud-divider"></span><span class="hud-val">' + current + '</span>';
      if (warns.length) inner += '<span class="hud-divider"></span><span style="color:#fbbf24">' + warns.length + ' 条提示</span>';
    }
    this.$hud.innerHTML = inner;
    this.$hud.classList.add('show');
  };

  /* ------------------------------------------------------------------
     Code lab
     ------------------------------------------------------------------ */
  Editor.prototype.findArduino = function () {
    return this.scene.components.find(function (c) { return c.type === 'arduino-uno'; }) || null;
  };

  Editor.prototype.refreshCodeAvailability = function () {
    if (!this.codeOpen) return;
    const uno = this.findArduino();
    this.codeArduinoId = uno ? uno.id : null;
    if (this.$codeBoardLabel) this.$codeBoardLabel.textContent = uno ? 'Arduino Uno · ' + (uno.id || 'uno') : '当前画布中没有 Arduino Uno';
    this.renderCodeBlocks();
    this.updateCodeUI();
    if (!uno) this.setCodeStatus('当前画布中没有 Arduino Uno。可以打开 Arduino 编程示例，或从元件库拖入一块。', 'warn');
  };

  Editor.prototype.openCodePanel = function () {
    if (!this.$codeDrawer) return;
    this.codeOpen = true;
    this.$codeDrawer.hidden = false;
    this.$codeEntry.classList.add('active');
    this.$stageWrap.classList.add('code-open');
    const uno = this.findArduino();
    this.codeArduinoId = uno ? uno.id : null;
    this.$codeBoardLabel.textContent = uno ? 'Arduino Uno · ' + (uno.id || 'uno') : '当前画布中没有 Arduino Uno';
    // Populate examples
    this.$codeExample.innerHTML = BBL.Code.EXAMPLES.map((ex) => '<option value="' + ex.id + '">' + esc(ex.name) + '</option>').join('');
    if (!BBL.Code.EXAMPLES.some((e) => e.id === this.codeExampleId)) this.codeExampleId = 'blink';
    if (!this.codeText) this.loadCodeExample(this.codeExampleId, { silent: true, keepTab: true });
    this.$codeExample.value = this.codeExampleId;
    this.renderCodePanel();
    this.setCodeTab(this.codeTab || 'blocks');
    this.updateCodeUI();
    if (!uno) {
      this.setCodeStatus('当前画布中没有 Arduino Uno。可以打开 Arduino 编程示例，或从元件库拖入一块。', 'warn');
    }
    this.renderTask();
  };

  Editor.prototype.closeCodePanel = function () {
    if (!this.codeOpen) return;
    this.codeOpen = false;
    this.$codeDrawer.hidden = true;
    this.$codeEntry.classList.remove('active');
    this.$stageWrap.classList.remove('code-open');
    this.renderTask();
    if (this.codeRunning) {
      this.toast('代码仍在后台运行。点击工具栏「代码」查看串口或停止。');
    }
  };

  Editor.prototype.toggleCodePanel = function () {
    if (this.codeOpen) this.closeCodePanel();
    else this.openCodePanel();
  };

  Editor.prototype.loadCodeExample = function (id, opts) {
    const options = opts || {};
    const ex = BBL.Code.EXAMPLES.find(function (e) { return e.id === id; }) || BBL.Code.EXAMPLES[0];
    if (this.codeRunning) this.stopCode({ silent: true });
    this.codeExampleId = ex.id;
    this.codeText = ex.code;
    this.scene.code = { exampleId: ex.id, text: ex.code };
    if (this.$codeExample) this.$codeExample.value = ex.id;
    if (this.$codeText) this.$codeText.value = ex.code;
    this.renderCodeBlocks();
    this.renderCodePanel();
    this.updateCodeUI();
    if (!options.silent) this.setCodeStatus('已载入「' + ex.name + '」示例。可以直接运行，或切到「文本」修改。', 'ok');
    this.scheduleAutosave();
    this.renderTask();
  };

  Editor.prototype.renderCodePanel = function () {
    if (!this.$codeDrawer) return;
    const uno = this.findArduino();
    this.$codeBoardLabel.textContent = uno ? 'Arduino Uno · ' + (uno.id || 'uno') : '当前画布中没有 Arduino Uno';
    if (!this.codeText) {
      const ex = BBL.Code.EXAMPLES.find((e) => e.id === this.codeExampleId) || BBL.Code.EXAMPLES[0];
      this.codeText = ex.code;
    }
    if (this.$codeText && document.activeElement !== this.$codeText) this.$codeText.value = this.codeText;
    this.renderCodeBlocks();
    this.renderSerial();
    if (!this.codeRunning && !this.$codeStatus.textContent) this.setCodeStatus('修改代码后点击「运行」。', 'ok');
    this.updateCodeUI();
  };

  Editor.prototype.setCodeTab = function (tab) {
    this.codeTab = tab;
    this.$codeDrawer.querySelectorAll('[data-code-tab]').forEach((b) => b.classList.toggle('active', b.dataset.codeTab === tab));
    this.$codeBlocks.hidden = tab !== 'blocks';
    this.$codeTextPane.hidden = tab !== 'text';
    if (tab === 'text' && this.$codeText && document.activeElement !== this.$codeText) this.$codeText.value = this.codeText;
  };

  Editor.prototype.renderCodeBlocks = function () {
    if (!this.$codeBlocks) return;
    const ex = BBL.Code.EXAMPLES.find((e) => e.id === this.codeExampleId) || BBL.Code.EXAMPLES[0];
    const uno = this.findArduino();
    let banner = '';
    if (!uno) {
      banner = '<div class="code-no-arduino">' + svgIcon('warning') +
        '<div><strong>这块画布还没有 Arduino</strong><span>打开 Arduino 编程示例，或从元件库拖入 Arduino Uno 后再运行代码。</span></div>' +
        '<a class="btn sm" href="#/editor?template=arduino-blink&task=arduino-blink&code=1">打开编程示例</a></div>';
    }
    const blocks = ex.blocks.map((b) => {
      if (b.kind === 'event') return '<div class="code-block event">' + svgIcon('play') + '<span>' + esc(b.text) + '</span></div>';
      const icon = b.icon === 'wait' ? 'clock' : b.icon === 'serial' ? 'terminal' : b.icon === 'if' ? 'branch' : b.icon === 'read' ? 'cursor' : b.icon === 'pwm' ? 'bolt' : b.icon === 'low' ? 'minus' : 'plus';
      return '<div class="code-block ' + (b.icon || '') + '">' + svgIcon(icon) + '<span>' + esc(b.text) + '</span></div>';
    }).join('');
    this.$codeBlocks.innerHTML = banner +
      '<div class="code-example-head"><div><span class="pill blue">' + esc(ex.badge) + '</span><h4>' + esc(ex.name) + '</h4><p>' + esc(ex.description) + '</p></div><span class="code-example-pin">D13 · D9 · D2 · A0</span></div>' +
      '<div class="code-flow">' + blocks + '</div>' +
      '<div class="code-blocks-note">' + svgIcon('info') + ' 积木视图展示示例结构；切换到「文本」可以直接修改并运行代码。</div>';
  };

  Editor.prototype.setCodeStatus = function (text, type) {
    if (!this.$codeStatus) return;
    this.$codeStatus.textContent = text;
    this.$codeStatus.className = 'code-status ' + (type || '');
  };

  Editor.prototype.updateCodeUI = function () {
    if (!this.$codeDrawer) return;
    const running = this.codeRunning;
    this.$codeEntry.classList.toggle('running', running);
    this.$codeEntry.classList.toggle('active', this.codeOpen);
    const runBtn = this.$codeDrawer.querySelector('[data-action="code-run"]');
    const stopBtn = this.$codeDrawer.querySelector('[data-action="code-stop"]');
    if (runBtn) runBtn.disabled = running || !this.findArduino();
    if (stopBtn) stopBtn.disabled = !running;
    this.$codeDrawer.querySelectorAll('.code-tab').forEach((b) => b.classList.toggle('disabled', false));
    if (this.$codeExample) this.$codeExample.disabled = running;
    if (running) this.setCodeStatus('代码运行中 · 输出由 Arduino 引脚控制', 'running');
    else if (this.codeText && this.findArduino()) this.setCodeStatus('就绪 · 修改代码后点击「运行」', 'ok');
    this.renderTask();
  };

  Editor.prototype.startCode = function () {
    const uno = this.findArduino();
    if (!uno) {
      this.setCodeStatus('当前画布中没有 Arduino Uno。请先打开 Arduino 编程示例。', 'error');
      this.toast('当前画布中没有 Arduino Uno。', 'warn');
      return;
    }
    if (this.codeRunning) return;
    if (!this.codeText) this.loadCodeExample(this.codeExampleId, { silent: true });
    try { BBL.Code.parseSketch(this.codeText); }
    catch (err) {
      this.setCodeStatus('语法错误：' + err.message, 'error');
      this.toast('代码有错误：' + err.message, 'error');
      return;
    }
    this.codeArduinoId = uno.id;
    this.codeIO = {};
    this.codeIO[uno.id] = {};
    this.codeRunning = true;
    this.serialLines = [];
    this.renderSerial();
    if (!this.simRunning) this.startSimulation();
    this.runSimulation(false, { skipInspector: true });
    const self = this;
    this.codeRunner = new BBL.Code.Runner(this.codeText, {
      onPinMode: function (pin, mode) {
        const io = self.codeIO[uno.id] || (self.codeIO[uno.id] = {});
        io[pin] = Object.assign(io[pin] || {}, { mode: mode });
        self.runSimulation(false, { skipInspector: true, skipTask: true });
      },
      onDigitalWrite: function (pin, value) {
        const io = self.codeIO[uno.id] || (self.codeIO[uno.id] = {});
        io[pin] = { mode: 'OUTPUT', value: value ? 1 : 0, pwm: false };
        self.scheduleCodeSim();
      },
      onAnalogWrite: function (pin, value) {
        const io = self.codeIO[uno.id] || (self.codeIO[uno.id] = {});
        io[pin] = { mode: 'OUTPUT', value: value, pwm: true };
        self.scheduleCodeSim();
      },
      onDigitalRead: function (pin) { return self.readCodeDigital(pin); },
      onAnalogRead: function (pin) { return self.readCodeAnalog(pin); },
      onSerial: function (text) { self.appendSerial(text); },
      onError: function (message) {
        self.codeRunning = false;
        self.codeRunner = null;
        self.codeIO = {};
        if (self.simRunning) self.runSimulation(false, { skipInspector: true });
        self.updateCodeUI();
        self.setCodeStatus('运行错误：' + message, 'error');
        self.toast('代码运行停止：' + message, 'error');
      }
    });
    this.codeRunner.start();
    if (this.codeRunning) {
      this.setCodeStatus('代码已启动 · 正在控制 Arduino 引脚', 'running');
      this.updateCodeUI();
      this.renderTask();
    }
  };

  Editor.prototype.stopCode = function (opts) {
    const options = opts || {};
    if (this.codeRunner) {
      this.codeRunner.stop();
      this.codeRunner = null;
    }
    const was = this.codeRunning;
    this.codeRunning = false;
    this.codeIO = {};
    if (!options.skipSim && this.simRunning) this.runSimulation(false, { skipInspector: true });
    this.updateCodeUI();
    if (was && !options.silent) {
      this.setCodeStatus('代码已停止，Arduino 引脚回到高阻态。', 'ok');
      this.toast('代码已停止。');
    }
    this.renderTask();
  };

  Editor.prototype.readCodeDigital = function (pin) {
    if (!this.codeArduinoId || !this.simResult) return 0;
    const p = this.simResult.pins[this.codeArduinoId] && this.simResult.pins[this.codeArduinoId][pin];
    if (!p) return 0;
    return p.voltage > 2.5 ? 1 : 0;
  };

  Editor.prototype.scheduleCodeSim = function () {
    if (!this.codeRunning || this._codeSimPending) return;
    this._codeSimPending = true;
    const self = this;
    requestAnimationFrame(function () {
      self._codeSimPending = false;
      if (self.codeRunning && self.simRunning) self.runSimulation(false, { skipInspector: true, skipTask: true });
    });
  };

  Editor.prototype.readCodeAnalog = function (pin) {
    if (!this.codeArduinoId || !this.simResult) return 0;
    const p = this.simResult.pins[this.codeArduinoId] && this.simResult.pins[this.codeArduinoId][pin];
    if (!p) return 0;
    return Math.max(0, Math.min(1023, Math.round(p.voltage / 5 * 1023)));
  };

  Editor.prototype.renderSerial = function () {
    if (!this.$serialOutput) return;
    if (!this.serialLines.length) {
      this.$serialOutput.innerHTML = '<span class="serial-empty">运行代码后，Serial.println 的输出会出现在这里。</span>';
      return;
    }
    this.$serialOutput.innerHTML = this.serialLines.map((line) => '<div class="serial-line">' + esc(line) + '</div>').join('');
    this.$serialOutput.scrollTop = this.$serialOutput.scrollHeight;
  };

  Editor.prototype.appendSerial = function (text) {
    String(text).split('\n').forEach((line) => {
      if (line !== '') this.serialLines.push(line);
    });
    if (this.serialLines.length > 300) this.serialLines = this.serialLines.slice(-300);
    if (this.codeOpen) this.renderSerial();
  };

  Editor.prototype.clearSerial = function () {
    this.serialLines = [];
    this.renderSerial();
  };

  Editor.prototype.resetExampleCode = function () {
    this.loadCodeExample(this.codeExampleId);
  };

  /* ------------------------------------------------------------------
     Task panel
     ------------------------------------------------------------------ */
  /* Functional check: run the player's actual circuit for every input
     combination and compare the LED results with the lab truth table. */
  Editor.prototype.verifyLabTruth = function () {
    const id = this.labId;
    if (!id) return { ok: false, total: 0, wrong: 0 };
    const s = E.clone(this.scene);
    const switches = s.components.filter((c) => c.type === 'slide-switch');
    const ids = ['swA', 'swB', 'swCin'];
    let ordered = ids.map((x) => switches.find((c) => c.id === x)).filter(Boolean);
    if (ordered.length < switches.length) {
      switches.forEach((sw) => { if (!ordered.includes(sw)) ordered.push(sw); });
    }
    let count = switches.length;
    if (id === 'lab01-not') count = 1;
    else if (id === 'lab02-full' || id === 'lab02-final') count = Math.min(3, switches.length);
    else count = Math.min(2, switches.length);
    if (count < 1) return { ok: false, total: 0, wrong: 0 };
    ordered = ordered.slice(0, count);
    const total = Math.pow(2, count);
    const leds = s.components.filter((c) => c.type === 'led');
    const patterns = {};
    leds.forEach((l) => { patterns[l.id] = []; });
    for (let i = 0; i < total; i++) {
      ordered.forEach((sw, j) => {
        const bit = (i >> (count - 1 - j)) & 1;
        sw.props.position = bit ? 0 : 1;
      });
      const r = E.simulate(s);
      leds.forEach((l) => {
        const state = r.leds.find((x) => x.compId === l.id);
        patterns[l.id].push(state && state.on ? 1 : 0);
      });
    }
    const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
    const expected = {
      'lab01-nand': { led1: [1, 1, 1, 0] },
      'lab01-not': { led1: [1, 0] },
      'lab01-and': { led1: [0, 0, 0, 1] },
      'lab01-xor': { led1: [0, 1, 1, 0] },
      'lab01-or': { led1: [0, 1, 1, 1] },
      'lab02-half': { led1: [0, 1, 1, 0], led2: [0, 0, 0, 1] },
      'lab02-full': { ledSum: [0, 1, 1, 0, 1, 0, 0, 1], ledCout: [0, 0, 0, 1, 0, 1, 1, 1] }
    };
    if (expected[id]) {
      let wrong = 0;
      Object.keys(expected[id]).forEach((ledId) => {
        if (!patterns[ledId] || !same(patterns[ledId], expected[id][ledId])) wrong++;
      });
      const anyOn = Object.keys(patterns).some((ledId) => patterns[ledId].some((v) => v === 1));
      return {
        ok: wrong === 0, total: total, wrong: wrong, anyOn: anyOn,
        hint: wrong === 0 ? '' : (anyOn
          ? '小灯亮过，但不同输入组合下结果不对：重点检查输入脚、C/D 固定电平，以及输出是不是取自正确引脚。'
          : '小灯一次都没亮：先查芯片电源、输出脚、电阻、LED 方向和 GND。')
      };
    }
    if (id === 'lab01-final') {
      const notA = [1, 1, 0, 0];
      const notB = [1, 0, 1, 0];
      const wanted = [[1, 1, 1, 0], notA, [0, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1]];
      const available = Object.values(patterns).map((p) => p.join(''));
      let found = 0;
      wanted.forEach((p) => {
        const target = p === notA ? [notA, notB].map((x) => x.join('')) : [p.join('')];
        const at = available.findIndex((x) => target.includes(x));
        if (at >= 0) { available.splice(at, 1); found++; }
      });
      const wrong = wanted.length - found;
      const anyOn = Object.keys(patterns).some((ledId) => patterns[ledId].some((v) => v === 1));
      return {
        ok: wrong === 0, total: 5, wrong: wrong, anyOn: anyOn,
        hint: anyOn
          ? '有灯亮，但五片芯片的输出规律没有全部对上：逐片检查输入、C/D 和输出脚。'
          : '所有灯都没亮：先确认五片芯片都通电，再逐片检查输出、电阻、LED 方向和 GND。'
      };
    }
    if (id === 'lab02-final') {
      const sum = [0, 1, 1, 0, 1, 0, 0, 1];
      const cout = [0, 0, 0, 1, 0, 1, 1, 1];
      const wantPairs = sum.map((v, i) => v + '' + cout[i]).sort().join(',');
      const keys = Object.keys(patterns);
      for (let a = 0; a < keys.length; a++) {
        for (let b = a + 1; b < keys.length; b++) {
          const pairs = patterns[keys[a]].map((v, i) => v + '' + patterns[keys[b]][i]).sort().join(',');
          if (pairs === wantPairs) {
            return { ok: true, total: 8, wrong: 0, anyOn: true, hint: '' };
          }
        }
      }
      const anyOn = keys.some((ledId) => patterns[ledId].some((v) => v === 1));
      return {
        ok: false, total: 8, wrong: 8, anyOn: anyOn,
        hint: anyOn
          ? '全加器能亮，但 Sum/Cout 的组合不对：重点检查 S1、Cin 的两级连接，以及两个进位是否经过 OR。'
          : '两个输出灯都没亮：先查三片芯片供电、Sum/Cout 输出路径、电阻和 LED 方向。'
      };
    }
    return { ok: false, total: total, wrong: total, anyOn: false, hint: '电路还没有形成可用的输出，先检查电源和输出路径。' };
  };

  Editor.prototype.taskState = function () {
    const task = E.TASKS[this.taskId];
    if (!task) return null;    const s = this.scene;
    const r = this.simRunning ? this.simResult : null;
    const rr = r || E.simulate(s);
    const netOf = (compId, pin) => {
      const p = rr.pins[compId] && rr.pins[compId][pin];
      return p ? p.net : null;
    };
    const outPathOk = (compId, pin, resistorId, ledId) =>
      netOf(compId, pin) === netOf(resistorId, '1') &&
      netOf(resistorId, '2') === netOf(ledId, 'a') &&
      netOf(ledId, 'k') === netOf('psu1', 'GND');
    const comps = s.components;
    const has = (type) => comps.some((c) => c.type === type);
    const lit = !!(r && r.leds.some((l) => l.on && l.current > 0.0005));
    const ics = comps.filter((c) => c.type.indexOf('ic74hc') === 0);
    const switchVals = comps.filter((c) => c.type === 'slide-switch').map((c) => Number(c.props.position));
    const icPoweredWired = () => ics.length > 0 && ics.every((ic) => {
      const conn = (pin) => s.wires.some((w) => (w.a.kind === 'pin' && w.a.comp === ic.id && String(w.a.pin) === String(pin)) || (w.b.kind === 'pin' && w.b.comp === ic.id && String(w.b.pin) === String(pin)));
      return conn('14') && conn('7');
    });
      const conn = (compId, pin) => s.wires.some((w) =>
        (w.a.kind === 'pin' && w.a.comp === compId && String(w.a.pin) === String(pin)) ||
        (w.b.kind === 'pin' && w.b.comp === compId && String(w.b.pin) === String(pin)));
      const diag = {};
      const done = (key) => {
        switch (key) {
          case 'parts':
            if (this.taskId === 'motor') return has('dc-motor') && has('slide-switch') && has('power-supply');
            if (this.taskId === 'servo') return has('servo') && has('potentiometer');
            return has('resistor') && has('led') && has('power-supply');
          case 'wired': return s.wires.length >= 3;
          case 'led': return lit;
          case 'button': return lit && comps.some((c) => c.type === 'button' && c.props.pressed);
          case 'pot': return lit && has('potentiometer');
          case 'lab-psu': {
            const psu = comps.find((c) => c.type === 'power-supply' || c.type === 'battery-9v' || c.type === 'coin-cell' || c.type === 'aa-battery');
            const pins = psu ? (psu.type === 'power-supply' ? ['V+', 'GND'] : [psu.type === 'battery-9v' ? '+' : '+', '-']) : [];
            return !!psu && pins.every((p) => conn(psu.id, p));
          }
          case 'lab-final-parts': {
            const hasSource = comps.some((c) => c.type === 'power-supply' || c.type === 'battery-9v' || c.type === 'coin-cell' || c.type === 'aa-battery');
            const switches = comps.filter((c) => c.type === 'slide-switch').length;
            const resistors = comps.filter((c) => c.type === 'resistor').length;
            const leds = comps.filter((c) => c.type === 'led').length;
            if (this.taskId === 'lab02-final') {
              return hasSource && has('ic74hc86') && has('ic74hc08') && has('ic74hc32') && switches >= 3 && resistors >= 2 && leds >= 2;
            }
            return hasSource && ['ic74hc20', 'ic74hc04', 'ic74hc21', 'ic74hc86', 'ic74hc32'].every((t) => has(t)) && switches >= 2 && resistors >= 5 && leds >= 5;
          }
          case 'lab-path': {
            const r = comps.find((c) => c.type === 'resistor');
            const led = comps.find((c) => c.type === 'led');
            return !!r && !!led && conn(r.id, '1') && conn(r.id, '2') && conn(led.id, 'a') && conn(led.id, 'k');
          }
          case 'lab-power': {
            const ok = ics.length > 0 && ics.every((ic) => rr.components[ic.id] && rr.components[ic.id].powered);
            diag.power = ok;
            return ok;
          }
          case 'lab-inputs': {
            const switches = comps.filter((c) => c.type === 'slide-switch');
            const src = comps.find((c) => E.SOURCE_TYPES[c.type]);
            const plusPin = src ? E.SOURCE_TYPES[src.type].plus : null;
            const plusNet = src && plusPin != null ? netOf(src.id, plusPin) : null;
            const inputNets = [];
            ics.forEach((ic) => {
              const info = E.IC_GATES[ic.type];
              if (!info) return;
              info.gates.forEach((g) => {
                [g.a, g.b, g.c, g.d].forEach((pin) => {
                  if (pin == null) return;
                  const n = netOf(ic.id, String(pin));
                  if (n != null) inputNets.push(n);
                });
              });
            });
            const switchOk = switches.length > 0 && switches.every((sw) => inputNets.includes(netOf(sw.id, '2')));
            const unusedOk = ics.every((ic) => {
              if (ic.type !== 'ic74hc20' && ic.type !== 'ic74hc21') return true;
              return plusNet != null && netOf(ic.id, '4') === plusNet && netOf(ic.id, '5') === plusNet;
            });
            const ok = switchOk && unusedOk;
            diag.inputs = ok;
            return ok;
          }
          case 'lab-output': {
            let ok = false;
            if (this.labId === 'lab01-nand') ok = outPathOk('ic1', '6', 'r1', 'led1');
            else if (this.labId === 'lab01-not') ok = outPathOk('ic1', '2', 'r1', 'led1');
            else if (this.labId === 'lab01-and') ok = outPathOk('ic1', '6', 'r1', 'led1');
            else if (this.labId === 'lab01-xor' || this.labId === 'lab01-or') ok = outPathOk('ic1', '3', 'r1', 'led1');
            else if (this.labId === 'lab02-half') ok = outPathOk('xor1', '3', 'r1', 'led1') && outPathOk('and1', '3', 'r2', 'led2');
            else if (this.labId === 'lab02-full') ok = outPathOk('xor1', '6', 'rSum', 'ledSum') && outPathOk('or1', '3', 'rCout', 'ledCout');
            else if (ics.length) {
              ok = ics.every((ic) => {
                const info = E.IC_GATES[ic.type];
                return info && info.gates.some((g) => conn(ic.id, String(g.y)));
              });
            }
            diag.output = ok;
            return ok;
          }
          case 'lab-run': return !!(this.simRunning && lit);
          case 'lab-correct': {
            const check = this.verifyLabTruth();
            this.labCheck = check;
            return !!(this.simRunning && check.ok);
          }
          case 'gate-power': return ics.length ? (r ? ics.every((c) => r.components[c.id] && r.components[c.id].powered) : icPoweredWired()) : false;
        case 'both-high': return switchVals.length >= 2 && switchVals.every((v) => v === 0);
        case 'any-high': return switchVals.some((v) => v === 0);
        case 'switch-low': return switchVals.some((v) => v === 1);
        case 'both-low': return switchVals.length >= 2 && switchVals.every((v) => v === 1);
        case 'and-led': case 'or-led': case 'not-led': case 'nor-led': case 'sum-lit': return lit;
        case 'carry-lit': return !!(r && r.leds.some((l) => l.compId === 'led2' && l.on && l.current > 0.0005));
        case 'arduino-part': return !!this.findArduino();
        case 'code-open': return this.codeOpen || this.codeRunning;
        case 'code-running': return this.codeRunning;
        case 'buzzer': return !!(r && Object.values(r.components).some((c) => c.buzzer));
        case 'motor': return !!(r && Object.values(r.components).some((c) => c.motor > 0.2));
        case 'servo': return !!(r && Object.values(r.components).some((c) => c.servoPowered));
        default: return false;
      }
    };
    const steps = task.steps.map((st) => ({ key: st.key, text: st.text, done: done(st.key) }));
    const complete = steps.length > 0 && steps.every((x) => x.done);
    return { task: task, steps: steps, complete: complete, diag: diag };
  };

  Editor.prototype.renderTask = function () {
    const state = this.taskState();
    if (!state || this.mode !== 'editor') { this.$taskSlot.innerHTML = ''; return; }
    const { task, steps, complete, diag } = state;
    if (complete) this.recordLabCompletion();
    const doneCount = steps.filter((s) => s.done).length;
    const pct = Math.round((doneCount / steps.length) * 100);
    const collapsed = this._taskCollapsed;
    const checkStep = steps.find((s) => s.key === 'lab-correct');
    const showCheckWarning = !!(this.labId && this.simRunning && checkStep && !checkStep.done);
    const issues = [];
    if (diag && diag.parts === false) issues.push('零件还没摆齐。');
    if (diag && diag.power === false) issues.push('芯片还没真正通电：查 14/7 脚和电源。');
    if (diag && diag.inputs === false) issues.push('开关或 C/D 还没接到正确电平：查输入脚，C/D 要接高。');
    if (diag && diag.output === false) issues.push('输出到灯的路径不完整：查输出脚、电阻、LED 方向和 GND。');
    if (!issues.length) {
      issues.push((this.labCheck && this.labCheck.hint) || '接线路径看起来通了，但输出组合还没全部对上。');
      const pinHints = {
        'lab01-nand': '74HC20 的 1Y 是第 6 脚，第 8 脚是另一个门的输出。',
        'lab01-and': '74HC21 的 1Y 是第 6 脚。',
        'lab01-not': '74HC04 的 1Y 是第 2 脚。',
        'lab01-xor': '74HC86 的 1Y 是第 3 脚。',
        'lab01-or': '74HC32 的 1Y 是第 3 脚。'
      };
      if (pinHints[this.labId]) issues.push(pinHints[this.labId]);
    }
    const warningText = issues.slice(0, 2).join(' ');
    const currentLevel = this.labId && BBL.LABS ? BBL.LABS.getLevel(this.labId) : null;
    const next = this.labId && BBL.LABS ? BBL.LABS.nextLevel(this.labId) : null;
    const nextTrack = next && BBL.LABS ? BBL.LABS.getTrack(next.track) : null;
    const nextHref = next
      ? '#/editor?template=' + encodeURIComponent(next.template) + '&lab=' + encodeURIComponent(next.id) + '&task=' + encodeURIComponent(next.taskId)
      : '#/labs';
    const nextLabel = !next
      ? '返回 Lab 练习'
      : (currentLevel && next.track !== currentLevel.track)
        ? '进入 ' + nextTrack.label
        : next.final ? '进入终验' : '下一关';
    this.$taskSlot.innerHTML = `<div class="task-card${collapsed ? ' collapsed' : ''}" id="task-card">
      <div class="task-head" data-action="task-collapse" style="cursor:pointer">
        <div class="task-icon">${svgIcon(complete ? 'check-circle' : 'target')}</div>
        <div class="task-head-text"><small>${esc(task.kicker)}</small><strong>${esc(task.title)}</strong></div>
        ${collapsed ? '<span class="task-mini ' + (complete ? 'done' : '') + '">' + doneCount + '/' + steps.length + '</span>' : ''}
        <button class="task-collapse" data-action="task-collapse" aria-label="折叠任务">${svgIcon('chevron-down')}</button>
      </div>
      <div class="task-body">
        <div class="task-progress-row"><span>实验进度</span><b>${doneCount} / ${steps.length}</b></div>
        <div class="task-progress"><span style="width:${pct}%"></span></div>
        <div class="task-steps">${steps.map((s, i) => `<div class="task-step ${s.done ? 'done' : (s === steps.find((x) => !x.done) ? 'current' : '')}"><span class="step-dot">${s.done ? svgIcon('check') : i + 1}</span><span>${esc(s.text)}</span></div>`).join('')}</div>
        ${showCheckWarning ? `<div class="task-check-warning">${svgIcon('warning')}<span><b>还没通过整表检查。</b> ${esc(warningText)}</span></div>` : ''}
        ${complete ? `<div class="task-success">${svgIcon('sparkle')}<span>${esc(task.success)}</span></div>` : ''}
        ${complete && this.labId ? `<div class="task-complete-bar"><span>${svgIcon('check-circle')} 已完成 · 进度已保存</span><a class="btn sm primary" href="${nextHref}">${nextLabel} ${svgIcon('arrow-right')}</a></div>` : ''}
        <div class="task-actions">
          ${this.labId ? `<button class="btn sm accent" data-action="lab-guide">${svgIcon('book')} 关卡教程</button>` : ''}
          ${this.taskId === 'arduino-blink'
            ? `<button class="btn sm ${this.codeOpen ? '' : 'accent'}" data-action="toggle-code">${svgIcon('code')} ${this.codeOpen ? '关闭代码' : '打开代码编辑器'}</button>`
            : `<button class="btn sm ${complete || this.labId ? '' : 'accent'}" data-action="task-check">${this.simRunning ? svgIcon('stop') + ' 暂停' : svgIcon('play') + ' 运行检查'}</button>`}
          <button class="btn sm ghost" data-action="task-reset" title="重新载入本次实验">${svgIcon('reset')} 重置</button>
        </div>
      </div>
    </div>`;
    if (complete && !this.taskDoneShown) {
      this.taskDoneShown = true;
      setTimeout(() => {
        if (!this._mounted || !this.taskState() || !this.taskState().complete) return;
        if (this.labId) {
          this.toast('关卡完成，进度已记录：' + task.success, 'success', 5600);
        } else {
          this.toast('实验完成：' + task.success, 'success', 5200);
        }
        this.celebrate();
      }, 260);
    }
    if (this.$hud && this.taskState) { /* hud independent */ }
  };

  Editor.prototype.recordLabCompletion = function () {
    if (!this.labId || !BBL.LABS) return;
    const state = this.taskState();
    if (!state || !state.complete) return;
    if (!this._labRecorded) {
      this._labRecorded = true;
      BBL.LABS.LabProgress.complete(this.labId);
    }
  };

  Editor.prototype.toggleTask = function () {
    this._taskCollapsed = !this._taskCollapsed;
    this.renderTask();
  };

  Editor.prototype.celebrate = function () {
    const stage = this.$stage;
    if (!stage) return;
    for (let i = 0; i < 26; i++) {
      const el = document.createElement('i');
      el.className = 'confetti';
      const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      el.style.left = (30 + Math.random() * 40) + '%';
      el.style.top = (34 + Math.random() * 10) + '%';
      el.style.background = colors[i % colors.length];
      el.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px');
      el.style.setProperty('--dy', (-(70 + Math.random() * 150)) + 'px');
      el.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
      el.style.animationDelay = (Math.random() * 160) + 'ms';
      stage.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }
  };

  /* ------------------------------------------------------------------
     History / save
     ------------------------------------------------------------------ */
  Editor.prototype.commit = function (label) {
    const snap = this.serialize();
    if (this.history[this.hIndex] && JSON.stringify(this.history[this.hIndex]) === JSON.stringify(snap)) {
      this.scheduleAutosave();
      return;
    }
    this.history = this.history.slice(0, this.hIndex + 1);
    this.history.push(snap);
    if (this.history.length > 60) this.history.shift();
    this.hIndex = this.history.length - 1;
    this.updateHistoryButtons();
    this.scheduleAutosave();
    this.updateSavedBadge('saving');
  };

  Editor.prototype.undo = function () {
    if (this.hIndex <= 0) return;
    this.hIndex--;
    this.restoreHistory();
    this.toast('已撤销');
  };

  Editor.prototype.redo = function () {
    if (this.hIndex >= this.history.length - 1) return;
    this.hIndex++;
    this.restoreHistory();
    this.toast('已重做');
  };

  Editor.prototype.restoreHistory = function () {
    this.scene = E.clone(this.history[this.hIndex]);
    this.scene._holes = E.boardHoles(this.scene.board);
    this.setTaskForTemplate(this.scene.template);
    this.selection = null;
    this.pending = null;
    if (this.simRunning) {
      this.simRunning = false; this.simResult = null;
      this.$stage.classList.remove('sim-running');
      this.$simBtn.classList.remove('running');
      this.$simBtn.innerHTML = svgIcon('play') + '<span id="sim-btn-label">开始模拟</span>';
      this.$simBtnLabel = this.mount.querySelector('#sim-btn-label');
    }
    this.renderBoard(true);
    this.renderScene();
    this.renderInspector();
    this.renderTask();
    this.updateSimUi();
    this.updateHistoryButtons();
    this.scheduleAutosave();
    this.$name.value = this.scene.name || '';
  };

  Editor.prototype.updateHistoryButtons = function () {
    this.mount.querySelectorAll('[data-action="undo"]').forEach((b) => { b.disabled = this.hIndex <= 0; });
    this.mount.querySelectorAll('[data-action="redo"]').forEach((b) => { b.disabled = this.hIndex >= this.history.length - 1; });
  };

  Editor.prototype.scheduleAutosave = function () {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.updateSavedBadge('saving');
    this.saveTimer = setTimeout(() => { this.autosaveNow(); }, 450);
  };

  Editor.prototype.autosaveNow = function () {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.serialize()));
      this.updateSavedBadge('saved');
    } catch (e) {
      this.updateSavedBadge('error');
    }
  };

  Editor.prototype.autosave = function () { this.scheduleAutosave(); };

  Editor.prototype.updateSavedBadge = function (state) {
    if (!this.$savedBadge) return;
    if (state === 'saving') this.$savedBadge.innerHTML = svgIcon('save') + ' 保存中…';
    else if (state === 'error') this.$savedBadge.innerHTML = svgIcon('warning') + ' 本地保存不可用';
    else this.$savedBadge.innerHTML = svgIcon('check-circle') + ' 已保存';
  };

  Editor.prototype.manualSave = function () {
    this.autosaveNow();
    this.closeMenu();
    this.toast('已保存到浏览器本地。需要备份或分享时，请用「导出电路 JSON」。');
  };

  Editor.prototype.exportScene = function () {
    const data = this.serialize();
    data.exportedAt = new Date().toISOString();
    data.app = 'Breadboard Lab';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (this.scene.name || 'circuit').replace(/[\\/:*?"<>|]/g, '-') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.closeMenu();
    this.toast('已导出 JSON 文件');
  };

  Editor.prototype.importScene = function () {
    this.closeMenu();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data || !Array.isArray(data.components) || !Array.isArray(data.wires) || !data.board) throw new Error('文件格式不正确');
          this.scene = data;
          this.scene._holes = E.boardHoles(this.scene.board);
          this.selection = null;
          this.pending = null;
          this.stopSimulation();
          this.renderBoard(true);
          this.renderScene();
          this.renderInspector();
          this.fitView(false);
          this.setTaskForTemplate(this.scene.template);
          this.renderTask();
          this.renderLibrary();
          this.$name.value = this.scene.name || '导入的电路';
          this.commit('导入电路');
          this.toast('电路已导入');
        } catch (err) {
          this.toast('导入失败：' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  Editor.prototype.resetScene = function () {
    this.closeMenu();
    this.confirm('重新载入示例？', '当前画布上的修改会被替换。可以先用「导出电路 JSON」备份。', () => {
      const template = this.scene.template || 'led-basic';
      this.scene = E.createScene(template === 'blank' ? (this.mode === 'sandbox' ? 'free-start' : 'led-basic') : template);
      this.scene._holes = E.boardHoles(this.scene.board);
      this.selection = null;
      this.taskDoneShown = false;
      this.stopSimulation();
      this.setTaskForTemplate(this.scene.template);
      this.renderBoard(true);
      this.renderScene();
      this.renderInspector();
      this.renderTask();
      this.fitView(false);
      this.$name.value = this.scene.name || '';
      this.commit('重置示例');
      this.toast('已重新载入示例');
    });
  };

  Editor.prototype.clearScene = function () {
    this.closeMenu();
    this.confirm('清空画布？', '所有元件和导线都会被移除，只保留一块面包板。此操作可以用撤销恢复。', () => {
      const s = E.createScene('blank');
      s.name = this.mode === 'sandbox' ? '自由实验 · 空白画布' : '未命名电路';
      s.template = this.mode === 'sandbox' ? 'blank' : null;
      this.scene = s;
      this.scene._holes = E.boardHoles(this.scene.board);
      this.selection = null;
      this.stopSimulation();
      this.taskId = null;
      this.renderBoard(true);
      this.renderScene();
      this.renderInspector();
      this.renderTask();
      this.fitView(false);
      this.$name.value = this.scene.name;
      this.commit('清空画布');
      this.toast('画布已清空');
    });
  };

  Editor.prototype.setTaskForTemplate = function (template) {
    this.taskId = this.mode === 'editor' && template && E.TASKS[template] ? template : null;
  };

  Editor.prototype.closeMenu = function () {
    if (this.$menu) this.$menu.hidden = true;
  };

  Editor.prototype.confirm = function (title, body, onYes) {
    const run = function () { if (this && this._mounted) onYes(); }.bind(this);
    if (BBL.ui && BBL.ui.confirm) { BBL.ui.confirm({ title: title, body: body, onConfirm: run }); return; }
    if (window.confirm(title + '\n\n' + body)) run();
  };

  Editor.prototype.toast = function (message, type, ms) {
    if (BBL.ui && BBL.ui.toast) { BBL.ui.toast(message, type, ms); return; }
    console.log(message);
  };

  Editor.prototype.showHelp = function () {
    if (BBL.ui && BBL.ui.help) { BBL.ui.help(); return; }
  };

  BBL.Editor = Editor;
})();
