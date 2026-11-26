/* ============================================================
   Breadboard Lab · pages, modals, toasts, progress
   ============================================================ */
(function () {
  'use strict';
  const BBL = (window.BBL = window.BBL || {});
  const Art = BBL.Art;

  const esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };
  const svgIcon = function (name, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };
  const fmt = function (n) { return String(n).padStart(2, '0'); };

  /* ------------------------------------------------------------------
     UI primitives
     ------------------------------------------------------------------ */
  const UI = {};

  UI.toast = function (message, type, ms) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div');
    const cls = type === 'warn' || type === 'error' ? type : '';
    const icon = type === 'error' ? 'warning' : type === 'warn' ? 'warning' : type === 'info' ? 'info' : 'check-circle';
    el.className = 'toast ' + cls;
    el.innerHTML = svgIcon(icon) + '<span>' + esc(message) + '</span>';
    root.appendChild(el);
    while (root.children.length > 3) root.removeChild(root.firstChild);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 240);
    }, ms || (type === 'error' ? 4600 : 3200));
  };

  let activeModal = null;
  UI.closeModal = function () {
    if (!activeModal) return;
    const node = activeModal;
    activeModal = null;
    node.classList.add('closing');
    document.body.classList.remove('no-scroll');
    setTimeout(() => node.remove(), 180);
  };

  UI.modal = function (opts) {
    if (activeModal) UI.closeModal();
    const root = document.getElementById('modal-root');
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = '<div class="modal ' + (opts.wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-head"><div><h2 id="modal-title">' + esc(opts.title) + '</h2>' + (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') + '</div><button class="icon-btn" data-close aria-label="关闭">' + svgIcon('close') + '</button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : '') +
      '</div>';
    root.appendChild(backdrop);
    document.body.classList.add('no-scroll');
    activeModal = backdrop;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.closest('[data-close]')) UI.closeModal();
    });
    const focusTarget = backdrop.querySelector('button, a, input, select');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    return backdrop;
  };

  UI.confirm = function (opts) {
    const modal = UI.modal({
      title: opts.title || '确认操作',
      subtitle: opts.subtitle || '',
      body: '<p style="font-size:13px;line-height:1.8;color:#596579">' + esc(opts.body || '') + '</p>',
      footer: '<button class="btn" data-close>取消</button><button class="btn primary" data-confirm>' + esc(opts.confirmText || '确认') + '</button>'
    });
    modal.querySelector('[data-confirm]').addEventListener('click', () => {
      UI.closeModal();
      if (opts.onConfirm) setTimeout(opts.onConfirm, 80);
    });
  };

  UI.help = function () {
    const rows = [
      ['选择工具', 'V'], ['连线工具', 'W'], ['删除工具', 'X'],
      ['删除选中', 'Delete / Backspace'], ['撤销', 'Ctrl + Z'], ['重做', 'Ctrl + Shift + Z'],
      ['复制元件', 'Ctrl + D'], ['旋转 90°', 'R'], ['开始 / 暂停模拟', 'S'], ['缩放', '滚轮 / + / −'], ['适应画布', '0'], ['取消连线 / 关闭面板', 'Esc']
    ];
    const body = '<div class="help-grid">' +
      '<div><h3 style="font-size:14px;margin-bottom:10px">画布快捷键</h3><div style="display:flex;flex-direction:column;gap:7px">' +
      rows.map((r) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #f1f3f7;font-size:12px"><span style="color:#596579">' + r[0] + '</span><span class="kbd">' + r[1] + '</span></div>').join('') +
      '</div></div>' +
      '<div><h3 style="font-size:14px;margin-bottom:10px">怎么开始</h3>' +
      '<ol style="display:flex;flex-direction:column;gap:10px;font-size:12px;color:#596579;line-height:1.7">' +
      '<li><b style="color:#111827">1.</b> 从右侧元件库拖入电阻、LED 或芯片。</li>' +
      '<li><b style="color:#111827">2.</b> 拖动元件引脚到另一个引脚，松手即可连线。</li>' +
      '<li><b style="color:#111827">3.</b> 点击「开始模拟」，再点击按钮或开关观察变化。</li>' +
      '<li><b style="color:#111827">4.</b> 按键盘 R 旋转元件，Delete 删除选中项。</li>' +
      '</ol>' +
      '<div style="margin-top:14px;padding:11px 12px;border-radius:9px;background:#f5f8fd;border:1px solid #e7edf7;font-size:11px;color:#68758a;line-height:1.7">' +
      '<b style="color:#374151">关于仿真：</b>本站使用简化直流模型，支持 LED 压降、74HC 逻辑门、按钮/开关、电位器和电机。电容在直流稳态下视为开路，舵机角度为简化演示。</div>' +
      '</div></div>' +
      '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #eef1f6;display:flex;align-items:center;gap:10px;font-size:11px;color:#8b98aa">' +
      svgIcon('info') + ' 所有数据保存在浏览器本地，不会上传服务器。</div>';
    UI.modal({ title: '帮助与快捷键', subtitle: 'Breadboard Lab · 使用手册', body: body, wide: true, footer: '<button class="btn primary" data-close>知道了</button>' });
    activeModal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); UI.closeModal(); }));
  };

  UI.about = function () {
    const body = '<div style="display:flex;gap:16px;align-items:flex-start">' +
      '<div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(145deg,#2563eb,#7c3aed);display:grid;place-items:center;color:#fff;flex:none">' + svgIcon('chip') + '</div>' +
      '<div><p style="font-size:13px;line-height:1.8;color:#596579">电路工坊是一间开在浏览器里的电子实验室。你可以拖拽标准元件、在 830 孔面包板上连线，然后实时看到电流、电平和逻辑门的反应。</p>' +
      '<p style="font-size:13px;line-height:1.8;color:#596579;margin-top:9px">课程从一颗 LED 开始，一直走到 74HC 逻辑门和半加器。所有页面都是静态文件，不需要服务器，也不会上传你的电路。</p></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:20px">' +
      '<div style="padding:12px;border:1px solid #edf0f5;border-radius:9px"><b style="display:block;font-size:18px">' + BBL.LESSONS.length + '</b><span style="font-size:10px;color:#8b98aa">节系统课程</span></div>' +
      '<div style="padding:12px;border:1px solid #edf0f5;border-radius:9px"><b style="display:block;font-size:18px">' + (BBL.PARTS.length) + '</b><span style="font-size:10px;color:#8b98aa">种标准元件</span></div>' +
      '<div style="padding:12px;border:1px solid #edf0f5;border-radius:9px"><b style="display:block;font-size:18px">100%</b><span style="font-size:10px;color:#8b98aa">浏览器本地运行</span></div>' +
      '</div>' +
      '<div style="margin-top:18px;font-size:10px;color:#9aa3b2">版本 1.0 · 静态站点 · 可部署到 GitHub Pages</div>';
    UI.modal({ title: '电路工坊 · Breadboard Lab', subtitle: '把电路，搭在浏览器里。', body: body, footer: '<a class="btn" href="#/learn">去学习</a><button class="btn primary" data-close>开始搭建</button>' });
    activeModal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => UI.closeModal()));
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeModal) UI.closeModal();
  });

  BBL.ui = UI;

  /* ------------------------------------------------------------------
     Progress
     ------------------------------------------------------------------ */
  const KEY = 'bbl.progress.v1';
  function readProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { completed: data.completed || {}, quiz: data.quiz || {} };
    } catch (e) { return { completed: {}, quiz: {} }; }
  }
  function writeProgress(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
  }
  const Progress = {
    get: readProgress,
    isComplete: function (id) { return !!readProgress().completed[id]; },
    count: function () { return Object.keys(readProgress().completed).length; },
    toggle: function (id) {
      const p = readProgress();
      if (p.completed[id]) delete p.completed[id]; else p.completed[id] = true;
      writeProgress(p);
      return !!p.completed[id];
    },
    set: function (id, val) {
      const p = readProgress();
      if (val) p.completed[id] = true; else delete p.completed[id];
      writeProgress(p);
    },
    quizCorrect: function (lessonId, qIndex) {
      const p = readProgress();
      p.quiz[lessonId] = p.quiz[lessonId] || [];
      if (!p.quiz[lessonId].includes(qIndex)) p.quiz[lessonId].push(qIndex);
      writeProgress(p);
    }
  };
  BBL.progress = Progress;
  BBL.Progress = Progress;

  /* ------------------------------------------------------------------
     Shared bits
     ------------------------------------------------------------------ */
  function footerHTML() {
    return '<footer class="footer"><div class="container">' +
      '<div style="display:flex;align-items:center;gap:9px"><span class="brand-mark" style="color:#2563eb">' +
      '<svg viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" rx="10" fill="currentColor"/><path d="M12 15h16M12 20h16M12 25h16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="15" r="1.7" fill="#fff"/><circle cx="24" cy="20" r="1.7" fill="#fff"/><circle cx="19" cy="25" r="1.7" fill="#fff"/></svg></span>' +
      '<div class="brand-copy"><strong>电路工坊</strong><small style="display:block">Breadboard Lab</small></div></div>' +
      '<p style="margin-left:4px">把电路，搭在浏览器里。</p>' +
      '<div class="footer-links"><a href="#/projects">项目</a><a href="#/labs">Lab练习</a><a href="#/learn">教程</a><a href="#/parts">元件库</a><a href="#/sandbox">自由实验</a><a href="#" data-open-help>帮助</a></div>' +
      '</div></footer>';
  }

  function attachFooter(root) {
    const help = root.querySelector('[data-open-help]');
    if (help) help.addEventListener('click', (e) => { e.preventDefault(); UI.help(); });
  }

  function emptyPage(mount, title, body) {
    mount.innerHTML = '<div class="page"><div class="container"><div class="empty-state">' + svgIcon('warning') +
      '<h2>' + esc(title) + '</h2><p>' + esc(body) + '</p><div style="margin-top:16px"><a class="btn primary" href="#/learn">返回教程</a></div></div></div></div>';
  }

  function lessonHrefForExperiment(lesson) {
    if (!lesson.experiment || !lesson.experiment.template) return '#/sandbox';
    const template = lesson.experiment.template;
    if (template === 'free-start') return '#/sandbox';
    const task = BBL.Engine.TASKS[template] ? template : '';
    return '#/editor?template=' + encodeURIComponent(template) + (task ? '&task=' + encodeURIComponent(task) : '');
  }

  function progressPct() {
    return Math.round((Progress.count() / BBL.LESSONS.length) * 100);
  }

  /* ------------------------------------------------------------------
     Learn index
     ------------------------------------------------------------------ */
  BBL.views = {};

  BBL.views.learn = function (mount) {
    const done = Progress.count();
    const pct = Math.round((done / BBL.LESSONS.length) * 100);
    const nextLesson = BBL.LESSONS.find((l) => !Progress.isComplete(l.id)) || BBL.LESSONS[0];
    const chaptersHtml = BBL.CHAPTERS.map((ch) => {
      const lessons = BBL.lessonsByChapter(ch.id);
      return '<section class="course-section">' +
        '<div class="section-head"><div><div class="eyebrow ' + (ch.id === 'logic' ? 'amber' : ch.id === 'making' ? 'green' : '') + '">' + esc(ch.eyebrow) + '</div><h2>' + esc(ch.title) + '</h2><p>' + esc(ch.desc) + '</p></div><a class="link" href="#/parts">浏览全部元件 ' + svgIcon('arrow-right') + '</a></div>' +
        '<div class="course-grid">' + lessons.map((l, i) => {
          const doneMark = Progress.isComplete(l.id) ? '<span class="done-mark">' + svgIcon('check') + ' 已完成</span>' : '';
          const partsMini = l.parts.slice(0, 4).map((p) => {
            const part = BBL.partById(p);
            return part ? '<span title="' + esc(part.name) + '">' + Art.icon(p) + '</span>' : '';
          }).join('');
          return '<a class="lesson-card' + (i === 0 && ch.id === 'basics' ? ' featured' : '') + '" href="#/learn/' + l.id + '">' +
            doneMark +
            '<div class="lesson-cover">' + Art.cover(l.cover) + '</div>' +
            '<div class="lesson-body">' +
            '<div class="lesson-index"><span class="num">' + fmt(l.number) + '</span><span class="dot-sep"></span><span>' + esc(ch.title) + '</span><span class="dot-sep"></span><span>' + l.minutes + ' 分钟</span></div>' +
            '<h3>' + esc(l.title) + '</h3>' +
            '<p class="lesson-desc">' + esc(l.summary) + '</p>' +
            '<div class="lesson-card-foot"><span class="meta">' + svgIcon('book') + l.level + '</span><span class="meta">' + svgIcon('pin') + l.parts.length + ' 个元件</span><span class="lesson-parts-mini">' + partsMini + '</span><span class="go">' + svgIcon('arrow-right') + '</span></div>' +
            '</div></a>';
        }).join('') + '</div></section>';
    }).join('');

    mount.innerHTML = '<div class="page learn-page">' +
      '<section class="learn-hero"><div class="container hero-grid">' +
      '<div class="hero-copy">' +
      '<span class="eyebrow">从零开始的电子学</span>' +
      '<h1>把电路，<br><em>搭</em>在浏览器里。</h1>' +
      '<p>不用买元件，不怕烧芯片。拖动面包板上的电阻与逻辑门，实时观察电流、电平和真值表。十节课，从第一颗 LED 走到一台半加器。</p>' +
      '<div class="hero-actions"><a class="btn primary lg" href="#/learn/' + nextLesson.id + '">' + (done ? '继续学习 · ' + esc(nextLesson.title) : '开始第一课') + svgIcon('arrow-right') + '</a><a class="btn lg" href="#/sandbox">' + svgIcon('flask') + ' 自由实验</a></div>' +
      '<div class="hero-stats"><div class="hero-stat"><strong>' + BBL.LESSONS.length + '</strong><span>系统课程</span></div><div class="hero-stat"><strong>' + BBL.PARTS.length + '</strong><span>标准元件</span></div><div class="hero-stat"><strong>830</strong><span>面包板孔位</span></div></div>' +
      '</div>' +
      '<div class="hero-visual"><div class="hero-board-card">' +
      '<div class="hero-board-head"><span class="dots"><i></i><i></i><i></i></span><span>实验一 · 点亮第一颗 LED</span><span class="live-tag"><i></i>仿真就绪</span></div>' +
      '<div class="hero-board-art">' + Art.heroBoard() + '</div></div>' +
      '<div class="hero-callout c1"><span class="dot"></span><span>5V · 220Ω · 14mA</span></div>' +
      '<div class="hero-callout c2">' + svgIcon('check-circle') + '<span>回路闭合，LED 点亮</span></div>' +
      '<div class="hero-float-code">V = I × R</div>' +
      '</div></div></section>' +
      '<div class="container learn-body">' +
      '<div class="learn-toolbar"><div class="progress-mini"><span>学习进度</span><div class="bar"><i style="width:' + pct + '%"></i></div><b>' + done + ' / ' + BBL.LESSONS.length + '</b><span>' + pct + '%</span></div><a class="btn sm" href="#/parts">' + svgIcon('cube') + ' 元件百科</a></div>' +
      chaptersHtml +
      '<section class="course-section"><div class="learn-code-teaser"><div class="learn-code-copy"><span class="pill green">NEW · CODE LAB</span><h2>电路不只可以连线，<br>还可以编程。</h2><p>打开 Arduino 代码实验室，用积木理解结构，用文本写真正的代码。D13 的 LED、D2 的按钮、A0 的旋钮和串口监视器都已经接好，运行即可看到电路响应。</p><a class="btn accent" href="#/editor?template=arduino-blink&task=arduino-blink&code=1">' + svgIcon('code') + ' 打开 Arduino 代码实验</a></div><div class="learn-code-art">' + Art.cover('code') + '</div></div></section>' +
      '<section class="course-section"><div class="section-head"><div><div class="eyebrow green">WHY IT WORKS</div><h2>三个核心直觉</h2><p>先把这三件事想明白，后面的电路都只是组合。</p></div></div>' +
      '<div class="concept-grid">' +
      '<div class="concept-card"><div class="concept-icon">' + svgIcon('bolt') + '</div><h3>电压是“推动力”</h3><p>电源提供电势差，推动电荷移动。电压不会“流过”电路，它加在元件两端。</p></div>' +
      '<div class="concept-card"><div class="concept-icon">' + svgIcon('circuit') + '</div><h3>电流是“流量”</h3><p>电流需要闭合回路。串联处处相等，并联按支路分配。LED 的亮度由电流决定。</p></div>' +
      '<div class="concept-card"><div class="concept-icon">' + svgIcon('chip') + '</div><h3>逻辑是“判断”</h3><p>把 0 和 1 看成真与假。与、或、非、异或，组合起来就能做加法与决策。</p></div>' +
      '</div></section>' +
      '<div class="cta-band"><div><h2>不想按课程走？</h2><p>空白画布、完整元件库、实时仿真。搭你想搭的，所有改动自动保存在浏览器里。</p></div><a class="btn accent lg" href="#/sandbox">' + svgIcon('flask') + ' 进入自由实验</a><span class="cta-note">无需登录 · 离线可用</span></div>' +
      '</div></div>' + footerHTML();
    attachFooter(mount);
  };

  /* ------------------------------------------------------------------
     Lesson detail
     ------------------------------------------------------------------ */
  BBL.views.lesson = function (mount, id) {
    const lesson = BBL.lessonById(id);
    if (!lesson) { emptyPage(mount, '没有找到这一课', '链接可能已过期，回到教程目录重新选择。'); return; }
    const chapter = BBL.CHAPTERS.find((c) => c.id === lesson.chapter) || BBL.CHAPTERS[0];
    const idx = BBL.LESSONS.findIndex((l) => l.id === lesson.id);
    const prev = BBL.LESSONS[idx - 1];
    const next = BBL.LESSONS[idx + 1];
    const doneCount = Progress.count();
    const isDone = Progress.isComplete(lesson.id);
    const nav = BBL.LESSONS.map((l) => '<a href="#/learn/' + l.id + '" class="' + (l.id === lesson.id ? 'active' : '') + '"><span class="n">' + fmt(l.number) + '</span><span>' + esc(l.title) + '</span></a>').join('');
    const toc = [
      ['#steps', '动手步骤'], ['#principles', '原理拆解'], ['#parts', '元件清单'],
      ['#pitfalls', '常见坑'], ['#quiz', '随堂测验']
    ].map((x) => '<a href="' + x[0] + '">' + x[1] + '</a>').join('');
    const ringR = 16, ringC = 2 * Math.PI * ringR;
    const ringOff = ringC * (1 - doneCount / BBL.LESSONS.length);

    mount.innerHTML = '<div class="page lesson-page">' +
      '<div class="lesson-topline"><div class="container"><a href="#/learn">教程</a><span class="sep">/</span><span>' + esc(chapter.title) + '</span><span class="sep">/</span><span style="color:#374151">' + esc(lesson.title) + '</span>' +
      '<div class="progress"><span>总进度 ' + doneCount + '/' + BBL.LESSONS.length + '</span><div class="bar"><i style="width:' + Math.round(doneCount / BBL.LESSONS.length * 100) + '%"></i></div></div></div></div>' +
      '<div class="container lesson-layout">' +
      '<aside class="lesson-nav"><div class="lesson-nav-title">课程目录</div><div class="lesson-nav-list">' + nav + '</div></aside>' +
      '<article class="lesson-main">' +
      '<header class="lesson-head"><div class="lesson-kicker"><span class="pill blue">' + fmt(lesson.number) + ' / ' + fmt(BBL.LESSONS.length) + '</span><span>' + esc(chapter.eyebrow) + '</span><span class="dot-sep" style="width:3px;height:3px;border-radius:50%;background:#cbd3e0"></span><span>' + lesson.minutes + ' 分钟</span></div>' +
      '<h1>' + esc(lesson.title) + '</h1><p class="subtitle">' + esc(lesson.subtitle) + '</p>' +
      '<div class="lesson-meta"><span>' + svgIcon('book') + esc(lesson.level) + '</span><span>' + svgIcon('cube') + lesson.parts.length + ' 个元件</span><span>' + svgIcon('target') + lesson.goals.length + ' 个目标</span></div>' +
      '<div class="lesson-goals">' + lesson.goals.map((g) => '<span class="goal-chip">' + svgIcon('check') + esc(g) + '</span>').join('') + '</div></header>' +
      '<div class="lesson-cover-big">' + Art.cover(lesson.cover) + '<span class="cover-label">' + esc(lesson.title) + ' · 电路示意</span></div>' +
      '<div class="lesson-mobile-cta"><div><strong>' + esc(lesson.experiment.label) + '</strong><span>' + esc(lesson.experiment.hint) + '</span></div><div class="lesson-mobile-cta-actions"><a class="btn accent sm" href="' + lessonHrefForExperiment(lesson) + '">' + svgIcon('play') + ' 进入实验台</a><button class="btn sm js-complete" data-lesson="' + lesson.id + '">' + (isDone ? svgIcon('check') + ' 已完成' : svgIcon('check') + ' 标记完成') + '</button></div></div>' +
      '<div class="lesson-content">' +
      '<section class="lesson-section" id="steps"><h2><span class="sec-num">01</span>动手步骤</h2><div class="steps">' + lesson.steps.map((s, i) => '<div class="step-item"><div class="step-num">' + fmt(i + 1) + '</div><div class="step-body"><h3>' + esc(s.title) + '</h3><p>' + esc(s.body) + '</p>' + (s.tip ? '<div class="tip">' + svgIcon('info') + '<span>' + esc(s.tip) + '</span></div>' : '') + '</div></div>').join('') + '</div></section>' +
      '<section class="lesson-section" id="principles"><h2><span class="sec-num">02</span>原理拆解</h2><p>记住这几条，比背接线图更重要。</p><div class="principle-grid">' + lesson.principles.map((p) => '<div class="principle"><h4>' + svgIcon('lightbulb') + esc(p.title) + '</h4><p>' + esc(p.body) + '</p></div>').join('') + '</div>' +
      (lesson.formula ? '<div class="formula"><div style="font-size:9px;letter-spacing:.1em;color:#7d8da6;margin-bottom:7px">' + esc(lesson.formula.title) + '</div>' + lesson.formula.body + '</div>' : '') +
      (lesson.truth ? '<div class="table-wrap"><table class="truth"><thead><tr><th colspan="' + lesson.truth.headers.length + '" style="text-align:left">' + esc(lesson.truth.title) + '</th></tr><tr>' + lesson.truth.headers.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + lesson.truth.rows.map((r) => '<tr>' + r.map((c, ci) => '<td class="' + (ci === r.length - 1 ? 'out' : '') + '">' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' : '') +
      '</section>' +
      '<section class="lesson-section" id="parts"><h2><span class="sec-num">03</span>本课元件</h2><p>点击卡片查看每个元件的完整百科、引脚和注意事项。</p><div class="parts-used">' + lesson.parts.map((pid) => {
        const p = BBL.partById(pid);
        if (!p) return '';
        return '<a class="part-used" href="#/parts/' + p.id + '"><span class="art">' + Art.icon(p.id) + '</span><span><strong>' + esc(p.name) + '</strong><span>' + esc(p.foot) + '</span></span></a>';
      }).join('') + '</div></section>' +
      '<section class="lesson-section" id="pitfalls"><h2><span class="sec-num">04</span>新手最容易踩的坑</h2><p>如果电路没按预期工作，先来这里对照。</p><div class="pitfall-list">' + lesson.pitfalls.map((p) => '<div class="pitfall">' + svgIcon('warning') + '<div><strong>' + esc(p.title) + '</strong><p>' + esc(p.body) + '</p></div></div>').join('') + '</div></section>' +
      '<section class="lesson-section" id="quiz"><h2><span class="sec-num">05</span>随堂测验</h2><p>选一个答案，立刻看解析。答错也没关系，回到原理再看一遍。</p>' + lesson.quiz.map((q, qi) => '<div class="quiz-card" data-quiz-card="' + qi + '"><h3>Q' + (qi + 1) + ' · 检查一下</h3><p class="quiz-q">' + esc(q.q) + '</p><div class="quiz-options">' + q.options.map((o, oi) => '<button class="quiz-opt" data-quiz="' + qi + '" data-opt="' + oi + '"><span class="letter">' + String.fromCharCode(65 + oi) + '</span><span>' + esc(o) + '</span></button>').join('') + '</div><div class="quiz-feedback" data-feedback="' + qi + '" hidden></div></div>').join('') + '</section>' +
      '</div>' +
      '<div class="lesson-next"><div><div class="next-label">' + (next ? '下一课' : '课程完成') + '</div><div class="next-title">' + (next ? esc(next.title) : '去自由实验，搭一个自己的电路') + '</div></div>' + (next ? '<a class="btn primary" href="#/learn/' + next.id + '">继续学习 ' + svgIcon('arrow-right') + '</a>' : '<a class="btn accent" href="#/sandbox">打开自由实验 ' + svgIcon('arrow-right') + '</a>') + '</div>' +
      '</article>' +
      '<aside class="lesson-aside">' +
      '<div class="aside-card aside-cta"><h3>' + esc(lesson.experiment.label) + '</h3><p>打开仿真实验台，边看边改。所有元件都能拖动、连线和实时观察。</p><a class="btn accent block" href="' + lessonHrefForExperiment(lesson) + '">' + svgIcon('play') + ' 进入实验台</a><div class="aside-note">' + esc(lesson.experiment.hint) + '</div></div>' +
      '<div class="aside-card"><h4>' + svgIcon('target') + ' 本课进度</h4><div class="aside-progress"><div class="progress-ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="' + ringR + '" fill="none" stroke="#edf0f5" stroke-width="4"/><circle cx="20" cy="20" r="' + ringR + '" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + ringC.toFixed(1) + '" stroke-dashoffset="' + ringOff.toFixed(1) + '"/></svg><span>' + doneCount + '/' + BBL.LESSONS.length + '</span></div><p><strong>课程总进度</strong>' + (isDone ? '这一课已完成，可以随时复习。' : '完成阅读后标记，方便下次继续。') + '</p></div><button class="btn sm block js-complete" style="margin-top:12px" data-lesson="' + lesson.id + '">' + (isDone ? svgIcon('check') + ' 已完成 · 点击取消' : svgIcon('check') + ' 标记本课完成') + '</button></div>' +
      '<div class="aside-card"><h4>' + svgIcon('book') + ' 本页目录</h4><div class="toc-list">' + toc + '</div></div>' +
      '<div class="aside-card"><h4>' + svgIcon('pin') + ' 相关元件</h4><div class="related-lessons">' + lesson.parts.slice(0, 5).map((pid) => {
        const p = BBL.partById(pid);
        return p ? '<a href="#/parts/' + p.id + '">' + svgIcon('chevron-right') + '<span>' + esc(p.name) + '</span></a>' : '';
      }).join('') + '</div></div>' +
      '</aside></div></div>' + footerHTML();

    // quizzes
    mount.querySelectorAll('.quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.quiz-card');
        const qi = Number(btn.dataset.quiz);
        const oi = Number(btn.dataset.opt);
        const q = lesson.quiz[qi];
        if (!q || card.dataset.answered) return;
        card.dataset.answered = '1';
        card.querySelectorAll('.quiz-opt').forEach((b) => {
          b.disabled = true;
          if (Number(b.dataset.opt) === q.answer) b.classList.add('correct');
        });
        const correct = oi === q.answer;
        if (!correct) btn.classList.add('wrong');
        const feedback = card.querySelector('[data-feedback]');
        feedback.hidden = false;
        feedback.className = 'quiz-feedback ' + (correct ? '' : 'wrong');
        feedback.innerHTML = (correct ? svgIcon('check-circle') + ' 回答正确。' : svgIcon('warning') + ' 再想想。') + ' ' + esc(q.explain);
        if (correct) Progress.quizCorrect(lesson.id, qi);
        const answered = card.dataset.answered;
        const allCorrect = lesson.quiz.every((qq, idx2) => Progress.get().quiz[lesson.id] && Progress.get().quiz[lesson.id].includes(idx2));
        if (allCorrect) UI.toast('两题都答对了，本课的知识点已经掌握。', 'success');
      });
    });

    // table of contents — scroll without changing the route hash
    mount.querySelectorAll('.toc-list a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // mark complete
    const completeBtns = mount.querySelectorAll('.js-complete');
    completeBtns.forEach((completeBtn) => completeBtn.addEventListener('click', () => {
      const nowDone = Progress.toggle(lesson.id);
      mount.querySelectorAll('.js-complete').forEach((b) => {
        b.innerHTML = nowDone ? svgIcon('check') + ' 已完成 · 点击取消' : svgIcon('check') + ' 标记本课完成';
      });
      UI.toast(nowDone ? '已标记完成：' + lesson.title : '已取消完成标记', nowDone ? 'success' : 'info');
      const topBar = mount.querySelector('.lesson-topline .bar i');
      const newCount = Progress.count();
      if (topBar) topBar.style.width = Math.round(newCount / BBL.LESSONS.length * 100) + '%';
      const topText = mount.querySelector('.lesson-topline .progress span');
      if (topText) topText.textContent = '总进度 ' + newCount + '/' + BBL.LESSONS.length;
      const ringCircle = mount.querySelector('.progress-ring circle:nth-child(2)');
      if (ringCircle) ringCircle.setAttribute('stroke-dashoffset', (ringC * (1 - newCount / BBL.LESSONS.length)).toFixed(1));
      const ringText = mount.querySelector('.progress-ring span');
      if (ringText) ringText.textContent = newCount + '/' + BBL.LESSONS.length;
      const hint = mount.querySelector('.aside-card .aside-progress p');
      if (hint) hint.innerHTML = '<strong>课程总进度</strong>' + (nowDone ? '这一课已完成，可以随时复习。' : '完成阅读后标记，方便下次继续。');
    }));

    attachFooter(mount);
  };

  /* ------------------------------------------------------------------
     Parts index
     ------------------------------------------------------------------ */
  BBL.views.parts = function (mount) {
    const state = { cat: 'all', q: '' };
    mount.innerHTML = '<div class="page parts-page">' +
      '<section class="parts-hero"><div class="container"><div class="breadcrumb"><a href="#/learn">教程</a><span class="sep">/</span><span>元件百科</span></div>' +
      '<h1>每一个零件的<br>标准答案。</h1><p>' + BBL.PARTS.length + ' 种面包板元件，从色环电阻到 74HC 逻辑芯片。每种都有标准造型、引脚说明、参数、使用方法和一个可以马上做的小实验。</p>' +
      '<div class="parts-tools"><div class="parts-search">' + svgIcon('search') + '<input id="parts-q" type="search" placeholder="搜索元件、参数或关键词…" aria-label="搜索元件"></div><div class="parts-filter" id="parts-filter">' +
      BBL.CATEGORIES.map((c) => '<button class="chip ' + (c.id === 'all' ? 'active' : '') + '" data-part-cat="' + c.id + '">' + c.label + '</button>').join('') +
      '</div></div></div></section>' +
      '<div class="container parts-body"><div class="parts-count" id="parts-count"></div><div class="parts-grid" id="parts-grid"></div></div></div>' + footerHTML();
    const grid = mount.querySelector('#parts-grid');
    const count = mount.querySelector('#parts-count');
    function draw() {
      let list = BBL.PARTS;
      if (state.cat !== 'all') list = list.filter((p) => p.cat === state.cat);
      if (state.q) {
        const q = state.q.toLowerCase();
        list = list.filter((p) => (p.name + ' ' + p.en + ' ' + p.short + ' ' + (p.plain || '') + ' ' + p.tags.join(' ')).toLowerCase().includes(q));
      }
      count.innerHTML = '共 <b>' + list.length + '</b> 种元件' + (state.cat !== 'all' ? ' · ' + BBL.CAT_LABEL[state.cat] : '');
      if (!list.length) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:50px 10px">' + svgIcon('search') + '<h2>没有找到</h2><p>换个关键词，或切换到“全部”。</p></div>';
        return;
      }
      grid.innerHTML = list.map((p) => '<a class="part-tile" href="#/parts/' + p.id + '">' +
        '<div class="part-tile-art"><span class="cat-tag">' + esc(BBL.CAT_LABEL[p.cat]) + '</span>' + Art.icon(p.id) + '</div>' +
        '<div class="part-tile-body"><h3>' + esc(p.name) + '</h3><div class="en">' + esc(p.en) + '</div><p>' + esc(p.plain || p.short) + '</p>' +
        '<div class="part-tile-foot"><span>' + esc(p.foot) + '</span><span class="go">查看百科 ' + svgIcon('arrow-right') + '</span></div></div></a>').join('');
    }
    mount.querySelector('#parts-q').addEventListener('input', (e) => { state.q = e.target.value.trim(); draw(); });
    mount.querySelector('#parts-filter').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-part-cat]');
      if (!chip) return;
      state.cat = chip.dataset.partCat;
      mount.querySelectorAll('[data-part-cat]').forEach((c) => c.classList.toggle('active', c === chip));
      draw();
    });
    draw();
    attachFooter(mount);
  };

  /* ------------------------------------------------------------------
     Part detail
     ------------------------------------------------------------------ */
  BBL.views.part = function (mount, id) {
    const p = BBL.partById(id);
    if (!p) { emptyPage(mount, '没有找到这个元件', '回到元件百科重新选择。'); return; }
    const related = BBL.LESSONS.filter((l) => l.parts.includes(p.id));
    mount.innerHTML = '<div class="page part-detail-page">' +
      '<section class="part-detail-head"><div class="container">' +
      '<div class="part-detail-art">' + Art.icon(p.id) + '</div>' +
      '<div class="part-detail-copy"><div class="breadcrumb"><a href="#/learn">教程</a><span class="sep">/</span><a href="#/parts">元件百科</a><span class="sep">/</span><span>' + esc(BBL.CAT_LABEL[p.cat]) + '</span></div>' +
      '<div class="eyebrow" style="margin-top:10px">' + esc(BBL.CAT_LABEL[p.cat]) + ' · ' + esc(p.foot) + '</div>' +
      '<h1>' + esc(p.name) + '</h1><div class="en">' + esc(p.en) + '</div>' +
      '<p class="part-plain-label">用人话说</p><p class="lede">' + esc(p.plain || p.lede) + '</p>' +
      '<div class="chips">' + p.tags.map((t) => '<span class="pill blue">' + esc(t) + '</span>').join('') + '</div></div></div></section>' +
      '<div class="container part-detail-layout"><div class="part-doc">' +
      '<section class="doc-card"><h2>' + svgIcon('info') + ' 这是什么</h2><div class="part-plain-box"><b>人话版</b><p>' + esc(p.plain || p.lede) + '</p></div>' + (p.why ? '<div class="part-why"><b>为什么需要它</b><p>' + esc(p.why) + '</p></div>' : '') + '<p class="part-tech-note">下面的参数和引脚说明是给需要深入的人看的，不需要一次记住。</p><details class="part-tech-details"><summary>想深入一点？展开专业说明</summary><p>' + esc(p.lede) + '</p><ul class="doc-list">' + p.usage.map((u) => '<li>' + esc(u) + '</li>').join('') + '</ul></details></section>' +
      '<section class="doc-card"><h2>' + svgIcon('pin') + ' 引脚与规格</h2><p class="part-tech-note">接线时再来查这张表即可，不需要背。</p><table class="pin-doc"><thead><tr><th>编号</th><th>名称</th><th>说明</th></tr></thead><tbody>' + p.pins.map((pin) => '<tr><td>' + esc(pin.n) + '</td><td>' + esc(pin.name) + '</td><td>' + esc(pin.desc) + '</td></tr>').join('') + '</tbody></table>' +
      '<div class="spec-table">' + p.specs.map((s) => '<div>' + esc(s[0]) + '</div><div>' + esc(s[1]) + '</div>').join('') + '</div></section>' +
      '<section class="doc-card"><h2>' + svgIcon('warning') + ' 使用注意</h2><div class="doc-list">' + p.notes.map((n) => '<li>' + esc(n) + '</li>').join('') + '</div><div class="warn-box">' + svgIcon('bolt') + '<p>接线前断电，接好后再上电。第一次通电时先看电源电流，有异常立即断开。</p></div></section>' +
      '<section class="doc-card"><h2>' + svgIcon('flask') + ' 马上做一个小实验</h2><p style="font-weight:600;color:#111827">' + esc(p.experiment.title) + '</p><p>' + esc(p.experiment.body) + '</p><a class="btn primary sm" href="#/sandbox" style="margin-top:14px">' + svgIcon('flask') + ' 在自由实验中试试</a></section>' +
      '</div>' +
      '<aside class="part-side">' +
      '<div class="aside-card"><h4>' + svgIcon('layers') + ' 快速参数</h4><div class="mini-facts">' + p.specs.slice(0, 5).map((s) => '<div class="mini-fact"><span>' + esc(s[0]) + '</span><b>' + esc(s[1]) + '</b></div>').join('') + '</div></div>' +
      (related.length ? '<div class="aside-card"><h4>' + svgIcon('book') + ' 出现在这些课</h4><div class="related-lessons">' + related.slice(0, 6).map((l) => '<a href="#/learn/' + l.id + '"><span class="n">' + fmt(l.number) + '</span><span>' + esc(l.title) + '</span></a>').join('') + '</div></div>' : '') +
      '<div class="aside-card part-cta"><h3>边看边搭</h3><p>打开自由实验，把 ' + esc(p.name) + ' 拖进面包板，边接线边观察。</p><a class="btn primary block" href="#/sandbox">' + svgIcon('flask') + ' 打开自由实验</a></div>' +
      '</aside></div></div>' + footerHTML();
    attachFooter(mount);
  };

  /* ------------------------------------------------------------------
     Projects dashboard
     ------------------------------------------------------------------ */
  const PROJECTS = [
    { id: 'led', title: '点亮第一颗 LED', desc: '从电源、限流电阻和一颗 LED 开始，理解闭合回路。', template: 'led-basic', cover: 'led', badge: '基础', time: '8 分钟', parts: ['resistor', 'led', 'power-supply'] },
    { id: 'button', title: '按钮控制灯', desc: '按钮串进回路，按下才亮。认识最基本的数字输入。', template: 'button-led', cover: 'button', badge: '输入', time: '10 分钟', parts: ['button', 'resistor', 'led'] },
    { id: 'and', title: '74HC08 与门', desc: '两个开关都拨到高电平，输出 LED 才亮。', template: 'and-gate', cover: 'gates', badge: '逻辑', time: '14 分钟', parts: ['ic74hc08', 'slide-switch', 'led'] },
    { id: 'arduino', title: 'Arduino 编程', desc: '写一段 Arduino 代码，让 D13 闪烁、旋钮调光。', template: 'arduino-blink', cover: 'code', badge: '代码', time: '15 分钟', parts: ['arduino-uno', 'led', 'potentiometer'], code: true },
    { id: 'half', title: '半加器', desc: 'XOR 求和，AND 进位，搭出 1 + 1 = 10。', template: 'half-adder', cover: 'xor', badge: '进阶', time: '16 分钟', parts: ['ic74hc86', 'ic74hc08', 'led'] },
    { id: 'alarm', title: '双条件报警器', desc: '两个条件同时满足时蜂鸣器响起，做一个组合逻辑项目。', template: 'alarm', cover: 'project', badge: '项目', time: '18 分钟', parts: ['ic74hc08', 'buzzer', 'slide-switch'] },
    { id: 'motor', title: '电机控制', desc: '用开关控制直流电机，观察电能变成机械能。', template: 'motor', cover: 'motor', badge: '输出', time: '12 分钟', parts: ['dc-motor', 'slide-switch', 'power-supply'] },
    { id: 'pot', title: '旋钮调光', desc: '电位器分压，连续改变 LED 的亮度。', template: 'pot-led', cover: 'pot', badge: '模拟', time: '11 分钟', parts: ['potentiometer', 'led', 'resistor'] }
  ];

  function readDesign(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      if (!data || !Array.isArray(data.components)) return null;
      return data;
    } catch (e) { return null; }
  }

  BBL.views.projects = function (mount) {
    const editorDesign = readDesign('bbl.editor.v1');
    const sandboxDesign = readDesign('bbl.sandbox.v1');
    const recentHtml = '<div class="recent-panel">' +
      '<div class="recent-head"><span>' + svgIcon('clock') + ' 最近编辑</span><span class="pill">浏览器本地</span></div>' +
      (editorDesign
        ? '<a class="recent-project" href="#/editor"><div class="recent-art">' + Art.icon('breadboard') + '</div><div class="recent-copy"><strong>' + esc(editorDesign.name || '未命名设计') + '</strong><span>' + (editorDesign.components || []).length + ' 个元件 · ' + (editorDesign.wires || []).length + ' 条导线</span></div><span class="recent-action">继续 ' + svgIcon('arrow-right') + '</span></a>'
        : '<div class="recent-empty"><span>还没有编辑中的项目。</span><a href="#/sandbox?template=blank">新建一个 ' + svgIcon('arrow-right') + '</a></div>') +
      '<div class="recent-divider"></div>' +
      '<a class="recent-project mini" href="#/sandbox"><div class="recent-art green">' + svgIcon('flask') + '</div><div class="recent-copy"><strong>自由实验空间</strong><span>' + (sandboxDesign && Array.isArray(sandboxDesign.components) ? sandboxDesign.components.length + ' 个元件' : '空白画布') + ' · 独立保存</span></div><span class="recent-action">打开 ' + svgIcon('arrow-right') + '</span></a>' +
      '<div class="recent-note">' + svgIcon('info') + ' 所有设计只保存在当前浏览器，不会上传。</div>' +
      '</div>';

    mount.innerHTML = '<div class="page projects-page">' +
      '<section class="projects-hero"><div class="container">' +
      '<div class="projects-topline"><div class="breadcrumb"><span>工作台</span><span class="sep">/</span><span>项目空间</span></div><span class="projects-status"><i></i> 本地工作区就绪</span></div>' +
      '<div class="projects-hero-grid"><div class="projects-intro">' +
      '<span class="eyebrow green">YOUR BREADBOARD WORKBENCH</span>' +
      '<h1>今天想<br><em>搭</em>点什么？</h1>' +
      '<p>从一个可以马上运行的示例开始，或者回到你上次的电路。拖动元件、接上导线、运行仿真，最后让代码接管它。</p>' +
      '<div class="projects-actions"><a class="btn primary lg" href="#/sandbox?template=blank">' + svgIcon('plus') + ' 新建设计</a><a class="btn lg" href="#/learn">' + svgIcon('book') + ' 从课程开始</a></div>' +
      '<div class="projects-trust"><span>' + svgIcon('check-circle') + ' 无需登录</span><span>' + svgIcon('check-circle') + ' 自动保存</span><span>' + svgIcon('check-circle') + ' 完全免费</span></div>' +
      '</div>' + recentHtml + '</div></div></section>' +
      '<div class="container projects-body">' +
      '<section class="project-section"><div class="section-head"><div><div class="eyebrow">QUICK START</div><h2>新建一个设计</h2><p>空白画布、经典入门，或者直接进入代码实验。</p></div><a class="link" href="#/parts">查看全部元件 ' + svgIcon('arrow-right') + '</a></div>' +
      '<div class="quick-grid">' +
      '<a class="quick-card" href="#/sandbox?template=blank"><span class="quick-watermark">' + svgIcon('circuit') + '</span><span class="quick-icon blue">' + svgIcon('plus') + '</span><strong>空白画布</strong><span>一块 830 孔面包板，从零开始。</span><em>新建设计 ' + svgIcon('arrow-right') + '</em></a>' +
      '<a class="quick-card" href="#/editor?template=led-basic&task=led-basic"><span class="quick-watermark">' + svgIcon('lightbulb') + '</span><span class="quick-icon amber">' + svgIcon('lightbulb') + '</span><strong>LED 入门</strong><span>电源、电阻、LED，一条完整的回路。</span><em>打开示例 ' + svgIcon('arrow-right') + '</em></a>' +
      '<a class="quick-card code" href="#/editor?template=arduino-blink&task=arduino-blink&code=1"><span class="quick-watermark">' + svgIcon('code') + '</span><span class="quick-icon dark">' + svgIcon('code') + '</span><strong>代码实验</strong><span>用 Arduino 控制 D13，边写代码边看电路。</span><em>进入代码编辑器 ' + svgIcon('arrow-right') + '</em></a>' +
      '</div></section>' +
      '<section class="project-section"><div class="section-head"><div><div class="eyebrow amber">FEATURED PROJECTS</div><h2>精选项目</h2><p>每一个都能直接打开、修改并运行。</p></div><span class="pill blue">' + PROJECTS.length + ' 个示例</span></div>' +
      '<div class="project-grid">' + PROJECTS.map((p) => {
        const link = '#/editor?template=' + encodeURIComponent(p.template) + '&task=' + encodeURIComponent(p.template) + (p.code ? '&code=1' : '');
        return '<a class="project-card" href="' + link + '">' +
          '<div class="project-cover' + (p.code ? ' code' : '') + '">' + Art.cover(p.cover) + '<span class="project-badge ' + (p.code ? 'dark' : '') + '">' + esc(p.badge) + '</span></div>' +
          '<div class="project-card-body"><div class="project-title"><h3>' + esc(p.title) + '</h3><span class="project-time">' + svgIcon('clock') + p.time + '</span></div>' +
          '<p>' + esc(p.desc) + '</p>' +
          '<div class="project-foot"><span class="project-parts">' + p.parts.slice(0, 3).map((pid) => { const part = BBL.partById(pid); return part ? '<i title="' + esc(part.name) + '">' + Art.icon(pid) + '</i>' : ''; }).join('') + '</span><span class="project-open">打开 ' + svgIcon('arrow-right') + '</span></div></div></a>';
      }).join('') + '</div></section>' +
      '<div class="projects-code-banner"><div class="projects-code-icon">' + svgIcon('terminal') + '</div><div><div class="eyebrow green">CODE × CIRCUIT</div><h2>让代码真正驱动电路。</h2><p>内置 Arduino 教学子集：setup/loop、pinMode、digitalWrite、analogWrite、if/else 和串口监视器。写一行，电路立刻响应。</p></div><a class="btn accent lg" href="#/editor?template=arduino-blink&task=arduino-blink&code=1">' + svgIcon('code') + ' 打开代码实验</a></div>' +
      '</div></div>' + footerHTML();
    attachFooter(mount);
  };

  /* ------------------------------------------------------------------
     Lab practice
     ------------------------------------------------------------------ */
  function labEditorHref(level) {
    return '#/editor?template=' + encodeURIComponent(level.template) +
      '&lab=' + encodeURIComponent(level.id) +
      '&task=' + encodeURIComponent(level.taskId);
  }

  function labPartsHtml(level) {
    const seen = {};
    const base = '<div class="lab-part-list">' + level.parts.filter((id) => {
      if (seen[id]) return false; seen[id] = true; return true;
    }).map((id) => {
      const p = BBL.partById(id);
      if (!p) return '';
      const count = level.parts.filter((x) => x === id).length;
      return '<span class="lab-part">' + Art.icon(id) + '<b>' + esc(p.name) + '</b>' + (count > 1 ? '<i>×' + count + '</i>' : '') + '</span>';
    }).join('') + '</div>';
    if (!level.choices) return base;
    return base + '<div class="lab-choice-list"><span class="lab-choice-label">任选 1 片</span>' + level.choices.map((id) => {
      const p = BBL.partById(id);
      return p ? '<span class="lab-part choice" title="' + esc(p.name) + '">' + Art.icon(id) + '<b>' + esc(p.name) + '</b></span>' : '';
    }).join('') + '</div>';
  }

  function labTruthHtml(truth, levelId) {
    if (!truth) return '';
    const inputCount = truth.inputs || truth.headers.length - 1;
    const outputs = truth.headers.length - inputCount;
    return '<div class="lab-table-wrap lab-truth" data-lab-truth="' + esc(levelId || '') + '"><table class="lab-table"><thead><tr>' +
      truth.headers.map((h) => '<th>' + esc(h) + '</th>').join('') +
      '</tr></thead><tbody>' + truth.rows.map((row, ri) => '<tr data-truth-row="' + ri + '">' +
        row.slice(0, inputCount).map((cell) => '<td>' + esc(cell) + '</td>').join('') +
        row.slice(inputCount, inputCount + outputs).map((cell, oi) => '<td class="result blank"><select class="lab-truth-select" data-truth-select="' + ri + ':' + oi + '" aria-label="第 ' + (ri + 1) + ' 行输出"><option value="">?</option><option value="0">0</option><option value="1">1</option></select></td>').join('') +
      '</tr>').join('') + '</tbody></table>' +
      '<div class="lab-truth-actions"><button class="btn sm" data-truth-check="' + esc(levelId || '') + '">' + svgIcon('check-circle') + ' 检查我的真值表</button><button class="btn sm ghost" data-truth-hint="' + esc(levelId || '') + '">' + svgIcon('lightbulb') + ' 给我一个提示</button></div>' +
      '<div class="lab-truth-feedback" aria-live="polite"></div>' +
      '<div class="lab-truth-hint" hidden>' + svgIcon('lightbulb') + '<span>' + esc(truth.hint || '先观察输入组合，再判断输出。') + '</span></div>' +
      (truth.note ? '<p class="lab-table-note">' + esc(truth.note) + '</p>' : '') + '</div>';
  }

  function bindLabTruth(root, level) {
    if (!root || !level || !level.truth) return;
    const box = root.querySelector('.lab-truth');
    if (!box) return;
    const inputCount = level.truth.inputs || level.truth.headers.length - 1;
    const check = box.querySelector('[data-truth-check]');
    const hintBtn = box.querySelector('[data-truth-hint]');
    if (check) check.addEventListener('click', () => {
      const selects = Array.from(box.querySelectorAll('[data-truth-select]'));
      let filled = 0, wrong = 0;
      selects.forEach((sel) => {
        const [ri, oi] = sel.getAttribute('data-truth-select').split(':').map(Number);
        const tr = box.querySelector('[data-truth-row="' + ri + '"]');
        const answer = level.truth.rows[ri][inputCount + oi];
        tr.classList.remove('correct', 'wrong');
        if (sel.value !== '') filled++;
        if (sel.value !== '' && sel.value !== String(answer)) { wrong++; tr.classList.add('wrong'); }
        else if (sel.value !== '') tr.classList.add('correct');
      });
      const fb = box.querySelector('.lab-truth-feedback');
      if (filled < selects.length) {
        fb.className = 'lab-truth-feedback warn';
        fb.textContent = '还有格子没填。可以先填完，再检查。';
      } else if (wrong) {
        fb.className = 'lab-truth-feedback error';
        fb.textContent = '有 ' + wrong + ' 行还不对。回到原理或点“给我一个提示”，再想一想。系统不会直接显示答案。';
      } else {
        fb.className = 'lab-truth-feedback success';
        fb.textContent = '全对！现在去实验台亲手验证一次，再截图放进实验报告。';
      }
    });
    if (hintBtn) hintBtn.addEventListener('click', () => {
      const hint = box.querySelector('.lab-truth-hint');
      hint.hidden = !hint.hidden;
    });
  }

  function labGuideHtml(level) {
    return '<div class="lab-guide">' +
      '<div class="lab-guide-goal">' + svgIcon('target') + '<div><b>本关目标</b><p>' + esc(level.objective) + '</p></div></div>' +
      '<h3 class="lab-guide-title">操作步骤</h3>' +
      '<ol class="lab-guide-steps">' + level.steps.map((s) => '<li><div><b>' + esc(s.title) + '</b><span>' + esc(s.body) + '</span>' + (s.why ? '<small class="lab-guide-why">为什么：' + esc(s.why) + '</small>' : '') + '</div></li>').join('') + '</ol>' +
      (level.truth ? '<h3 class="lab-guide-title">真值表</h3>' + labTruthHtml(level.truth, level.id) : '') +
      '<details class="lab-guide-hints"' + (level.final ? ' hidden' : '') + '><summary>' + svgIcon('branch') + ' 需要接线提示时展开</summary><div class="lab-guide-wiring">' + level.wiring.map((w) => '<div><span>' + esc(w.from) + '</span>' + svgIcon('arrow-right') + '<span>' + esc(w.to) + '</span></div>').join('') + '</div></details>' +
      (level.final ? '<div class="lab-guide-tip">' + svgIcon('target') + '<span><b>终验规则：</b>这一关从空白画布开始，不提供完整接线表。先自己摆放零件、规划连接；卡住时回看对应的练习关。</span></div>' : '') +
      '<div class="lab-guide-tip">' + svgIcon('lightbulb') + '<span><b>常见错误：</b>' + esc(level.pitfalls[0]) + '</span></div>' +
      '</div>';
  }

  if (BBL.ui) {
    BBL.ui.labGuide = function (levelId) {
      const level = BBL.LABS.getLevel(levelId);
      if (!level) return;
      const track = BBL.LABS.getTrack(level.track);
      const modal = BBL.ui.modal({
        title: 'Level ' + level.number + ' · ' + level.title,
        subtitle: track.label + ' · ' + track.title,
        wide: true,
        body: labGuideHtml(level),
        footer: '<a class="btn" href="#/labs/' + level.id + '" data-close>' + svgIcon('book') + ' 完整关卡页</a><button class="btn primary" data-close>继续实验</button>'
      });
      bindLabTruth(modal, level);
      modal.querySelectorAll('[data-close]').forEach((b) => {
        b.addEventListener('click', (e) => { if (b.tagName !== 'A') { e.preventDefault(); BBL.ui.closeModal(); } });
      });
    };
  }

  BBL.views.labs = function (mount) {
    const total = BBL.LABS.levels.length;
    const done = BBL.LABS.LabProgress.count();
    mount.innerHTML = '<div class="page labs-page">' +
      '<section class="labs-hero"><div class="container">' +
      '<div class="labs-breadcrumb"><div class="breadcrumb"><a href="#/projects">工作台</a><span class="sep">/</span><span>Lab 练习</span></div><span class="labs-source">' + svgIcon('book') + ' WIX1003 Computer Systems & Organization</span></div>' +
      '<div class="labs-hero-grid"><div><span class="eyebrow green">LAB PRACTICE · GUIDED MISSIONS</span><h1>把 Lab 练习<br>变成一场<span>闯关</span>。</h1><p>依据 WIX1003 的 Lab 01 与 Lab 02 制作。每一关先用大白话讲清楚要做什么，再让你自己接线；给你提示、让你自己填表，最后还有空白终验，看看你是不是真的会了。</p><div class="labs-hero-stats"><div><b>' + total + '</b><span>个关卡</span></div><div><b>2</b><span>份 Lab</span></div><div><b>' + done + '</b><span>已完成</span></div></div></div>' +
      '<div class="labs-progress-card"><div class="labs-progress-head"><span>总进度</span><b>' + done + ' / ' + total + '</b></div><div class="labs-progress"><span style="width:' + Math.round(done / total * 100) + '%"></span></div><p>完成实验台里的任务卡后自动记录。进度保存在本浏览器。</p><div class="labs-progress-marks">' + BBL.LABS.tracks.map((t) => '<span><i class="' + t.color + '"></i>' + t.label + ' ' + BBL.LABS.LabProgress.count(t.id) + '/' + BBL.LABS.LabProgress.total(t.id) + '</span>').join('') + '</div></div>' +
      '</div></div></section>' +
      '<div class="container labs-body"><div class="labs-basics"><div class="labs-basics-head"><span class="eyebrow green">START HERE</span><h2>先记住这 5 句话</h2><p>不需要先学电子学。把这几个词当成日常用语，就能开始。</p></div><div class="labs-basics-grid">' +
      '<div><b>1 和 0</b><span>1 就是“有电/高”，0 就是“没电/低”。</span></div>' +
      '<div><b>红色和黑色</b><span>红色 V+ 是正极，黑色 GND 是负极；两者不能直接连在一起。</span></div>' +
      '<div><b>面包板</b><span>同一列的几个孔在内部是连着的；中间沟把上下两半分开了。</span></div>' +
      '<div><b>芯片的脚</b><span>缺口朝上，左下角是第 1 脚，逆时针数；14 脚接正极，7 脚接负极。</span></div>' +
      '<div><b>小灯和电阻</b><span>小灯长脚接正、短脚接负；电阻用来限制电流，不能省。</span></div>' +
      '</div></div><div class="labs-tracks">' + BBL.LABS.tracks.map((track) => {
        const levels = BBL.LABS.levelsOf(track.id);
        const td = BBL.LABS.LabProgress.count(track.id);
        return '<section class="lab-track ' + track.color + '"><div class="lab-track-head"><div class="lab-track-badge">' + track.label + '</div><div class="lab-track-title"><span>' + esc(track.cn) + '</span><h2>' + esc(track.title) + '</h2><p>' + esc(track.intro) + '</p></div><div class="lab-track-progress"><b>' + td + '/' + levels.length + '</b><span>已完成</span></div></div>' +
          '<div class="lab-track-goals">' + track.goals.map((g) => '<span>' + svgIcon('check') + g + '</span>').join('') + '</div>' +
          '<div class="lab-level-list">' + levels.map((level) => {
            const complete = BBL.LABS.LabProgress.isComplete(level.id);
            return '<a class="lab-level-row' + (complete ? ' complete' : '') + (level.final ? ' final' : '') + '" href="#/labs/' + level.id + '"><span class="lab-level-num">' + (complete ? svgIcon('check') : (level.final ? '★' : level.number)) + '</span><div class="lab-level-main"><div><h3>' + esc(level.title) + '</h3>' + (level.final ? '<span class="lab-final-tag">FINAL</span>' : '') + '<em>' + esc(level.en) + '</em></div><p>' + esc(level.brief) + '</p><div class="lab-level-meta"><span>' + svgIcon('clock') + level.minutes + ' 分钟</span><span>' + level.difficulty + '</span><span>' + (level.parts.length + (level.choices ? 1 : 0)) + ' 个元件</span></div></div><span class="lab-level-cta">' + (complete ? '复习' : (level.final ? '接受挑战' : '开始')) + ' ' + svgIcon('arrow-right') + '</span></a>';
          }).join('') + '</div></section>';
      }).join('') + '</div>' +
      '<section class="labs-how"><div class="section-head"><div><div class="eyebrow amber">HOW IT WORKS</div><h2>每一关怎么玩</h2></div></div><div class="labs-how-grid">' +
      '<div class="labs-how-card"><span>01</span><b>先读原理</b><p>用最短的篇幅解释芯片引脚、逻辑表达式和本关要验证的真值表。</p></div>' +
      '<div class="labs-how-card"><span>02</span><b>照着接线</b><p>接线表列出每一根线从哪里到哪里。电路已经预置好，也可以拆开自己重连。</p></div>' +
      '<div class="labs-how-card"><span>03</span><b>运行验证</b><p>在实验台切换输入，对照真值表观察 LED。任务卡全部打勾后，本关自动记录完成。</p></div>' +
      '</div></section></div></div>' + footerHTML();
    attachFooter(mount);
  };

  BBL.views.labLevel = function (mount, id) {
    const level = BBL.LABS.getLevel(id);
    if (!level) { BBL.views.notFound(mount); return; }
    const track = BBL.LABS.getTrack(level.track);
    const trackLevels = BBL.LABS.levelsOf(level.track);
    const idx = trackLevels.findIndex((l) => l.id === level.id);
    const prev = trackLevels[idx - 1];
    const next = trackLevels[idx + 1];
    const complete = BBL.LABS.LabProgress.isComplete(level.id);
    const href = labEditorHref(level);
    mount.innerHTML = '<div class="page lab-detail-page">' +
      '<section class="lab-detail-hero ' + track.color + '"><div class="container">' +
      '<div class="labs-breadcrumb"><div class="breadcrumb"><a href="#/labs">Lab 练习</a><span class="sep">/</span><a href="#/labs">' + track.label + '</a><span class="sep">/</span><span>' + (level.final ? 'FINAL' : 'Level ' + level.number) + '</span></div>' + (complete ? '<span class="lab-complete-pill">' + svgIcon('check-circle') + ' 已完成</span>' : '') + '</div>' +
      '<div class="lab-detail-grid"><div class="lab-detail-intro"><span class="eyebrow ' + (track.color === 'green' ? 'green' : '') + '">' + track.label + ' · ' + (level.final ? 'FINAL CHALLENGE' : 'LEVEL ' + level.number) + '</span><h1>' + esc(level.title) + '</h1><p class="lab-en">' + esc(level.en) + '</p><p class="lab-objective">' + esc(level.objective) + '</p><div class="lab-hero-actions"><a class="btn primary lg" href="' + href + '">' + svgIcon('play') + ' 进入实验台</a><a class="btn lg" href="#/labs">' + svgIcon('grid') + ' 全部关卡</a></div><div class="lab-hero-meta"><span>' + svgIcon('clock') + level.minutes + ' 分钟</span><span>' + svgIcon('target') + level.difficulty + '</span><span>' + svgIcon('chip') + (level.parts.length + (level.choices ? 1 : 0)) + ' 个元件</span></div></div>' +
      '<div class="lab-detail-card"><div class="lab-detail-card-head"><span>本关元件</span><span class="pill">' + track.label + '</span></div>' + labPartsHtml(level) + '<div class="lab-detail-card-foot"><span>' + svgIcon('info') + ' 进入实验台后按任务卡操作</span></div></div></div>' +
      '</div></section>' +
      '<div class="container lab-detail-body"><div class="lab-detail-main">' +
      (level.final
        ? '<div class="lab-start-banner final">' + svgIcon('target') + '<div><b>终验关 · 空白画布</b><span>这一关<strong>没有零件，也没有导线</strong>。请打开右侧元件库，自己摆放芯片、开关、电阻和 LED，再独立完成接线。</span></div></div>'
        : '<div class="lab-start-banner">' + svgIcon('branch') + '<div><b>练习关</b><span>元件已经摆在面包板上，但<strong>所有导线都是断开的</strong>。请按任务卡自己接线；卡住时再展开下方提示。最后的终验关会连零件都不提供。</span></div></div>') +
      (level.plain ? '<div class="lab-easy"><span>先用人话说</span><p>' + esc(level.plain) + '</p></div>' : '') +
      '<section class="lab-section"><div class="lab-section-head"><span>01</span><h2>原理背景</h2></div><div class="lab-prose">' + level.background.map((p) => '<p>' + esc(p) + '</p>').join('') + '</div></section>' +
      '<section class="lab-section"><div class="lab-section-head"><span>02</span><h2>操作步骤</h2></div><ol class="lab-steps">' + level.steps.map((s, i) => '<li><span class="lab-step-num">' + (i + 1) + '</span><div><h3>' + esc(s.title) + '</h3><p>' + esc(s.body) + '</p>' + (s.why ? '<small class="lab-step-why">为什么这样做：' + esc(s.why) + '</small>' : '') + '</div></li>').join('') + '</ol></section>' +
      (level.final
        ? '<section class="lab-section"><div class="lab-section-head"><span>03</span><h2>终验规则</h2></div><div class="lab-final-rules">' + svgIcon('target') + '<div><b>不提供完整接线表</b><span>这一关检验你是否能不依赖现成接法完成电路。卡住时先回看对应的练习关；仍需要帮助时，可以展开思路提示。</span></div></div><details class="lab-detail-hints"><summary>' + svgIcon('lightbulb') + ' 展开思路提示</summary><div class="lab-guide-tip">' + svgIcon('lightbulb') + '<span><b>思路：</b>' + esc(level.background[level.background.length - 1]) + '</span></div></details></section>'
        : '<section class="lab-section"><div class="lab-section-head"><span>03</span><h2>接线提示</h2></div><p class="lab-hint-intro">先自己观察参考电路。确实需要时再展开逐线提示。</p><details class="lab-detail-hints"><summary>' + svgIcon('branch') + ' 展开接线提示</summary><div class="lab-wiring-table">' + level.wiring.map((w) => '<div class="lab-wire-row"><span class="from">' + esc(w.from) + '</span>' + svgIcon('arrow-right') + '<span class="to">' + esc(w.to) + '</span><em>' + esc(w.why) + '</em></div>').join('') + '</div></details></section>') +
      (level.truth ? '<section class="lab-section"><div class="lab-section-head"><span>04</span><h2>' + esc(level.truth.title) + '</h2></div>' + labTruthHtml(level.truth, level.id) + '<div class="lab-table-tip">' + svgIcon('lightbulb') + ' 先自己填写输出，再点“检查我的真值表”。系统只会告诉你哪几行不对，不会直接给答案。</div></section>' : '') +
      '<section class="lab-section"><div class="lab-section-head"><span>05</span><h2>常见错误</h2></div><div class="lab-pitfalls">' + level.pitfalls.map((p) => '<div>' + svgIcon('warning') + '<span>' + esc(p) + '</span></div>').join('') + '</div></section>' +
      '<section class="lab-section"><div class="lab-section-head"><span>06</span><h2>完成检查</h2></div><div class="lab-checks">' + level.checkpoints.map((c) => '<div>' + svgIcon('check-circle') + '<span>' + esc(c) + '</span></div>').join('') + '</div><div class="lab-submit"><b>提交建议</b><p>' + esc(level.submit) + '</p></div></section>' +
      '<div class="lab-pager">' + (prev ? '<a href="#/labs/' + prev.id + '"><span>上一关</span><b>' + esc(prev.title) + '</b></a>' : '<span></span>') + (next ? '<a class="next" href="#/labs/' + next.id + '"><span>下一关</span><b>' + esc(next.title) + '</b></a>' : '') + '</div>' +
      '</div>' +
      '<aside class="lab-detail-side"><div class="lab-side-card"><div class="lab-side-label">本关任务</div><div class="lab-side-progress"><div><b>' + (complete ? '已完成' : '待完成') + '</b><span>' + track.label + ' · ' + (level.final ? 'FINAL' : 'Level ' + level.number) + '</span></div>' + (complete ? '<i class="done">' + svgIcon('check') + '</i>' : '<i>' + (level.final ? '★' : level.number) + '</i>') + '</div><a class="btn primary block" href="' + href + '">' + svgIcon('play') + ' 进入实验台</a><p class="lab-side-note">' + svgIcon('info') + ' 参考练习的元件已摆好但导线断开；终验关没有零件。完成任务卡后自动记录。</p><button class="btn ghost block" data-lab-guide="' + level.id + '">' + svgIcon('keyboard') + ' 在弹窗中查看步骤</button></div>' +
      '<div class="lab-side-card"><div class="lab-side-label">实验材料</div>' + labPartsHtml(level) + '</div>' +
      '<div class="lab-side-card source"><div class="lab-side-label">来源</div><p>' + esc(track.course) + '</p><b>' + esc(track.source) + '</b><span class="lab-source-note">按课程 Lab 内容改编为可交互关卡</span></div>' +
      '</aside></div></div>' + footerHTML();
    attachFooter(mount);
    bindLabTruth(mount, level);
    mount.querySelectorAll('[data-lab-guide]').forEach((b) => b.addEventListener('click', () => BBL.ui.labGuide(b.getAttribute('data-lab-guide'))));
  };

  /* ------------------------------------------------------------------
     Not found
     ------------------------------------------------------------------ */
  BBL.views.notFound = function (mount) {
    emptyPage(mount, '页面不存在', '地址可能写错了，回到教程目录继续。');
    mount.querySelector('.empty-state').insertAdjacentHTML('beforeend', '<div style="margin-top:10px"><a class="btn" href="#/parts">浏览元件百科</a></div>');
  };

})();
