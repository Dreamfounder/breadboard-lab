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
      ['复制元件', 'Ctrl + D'], ['旋转 90°', 'R'], ['缩放', '滚轮 / + / −'], ['适应画布', '0'], ['取消连线 / 关闭面板', 'Esc']
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
      '<div class="footer-links"><a href="#/learn">教程</a><a href="#/parts">元件库</a><a href="#/sandbox">自由实验</a><a href="#" data-open-help>帮助</a></div>' +
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
      '<h1>每一个零件的<br>标准答案。</h1><p>22 种面包板元件，从色环电阻到 74HC 逻辑芯片。每种都有标准造型、引脚说明、参数、使用方法和一个可以马上做的小实验。</p>' +
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
        list = list.filter((p) => (p.name + ' ' + p.en + ' ' + p.short + ' ' + p.tags.join(' ')).toLowerCase().includes(q));
      }
      count.innerHTML = '共 <b>' + list.length + '</b> 种元件' + (state.cat !== 'all' ? ' · ' + BBL.CAT_LABEL[state.cat] : '');
      if (!list.length) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:50px 10px">' + svgIcon('search') + '<h2>没有找到</h2><p>换个关键词，或切换到“全部”。</p></div>';
        return;
      }
      grid.innerHTML = list.map((p) => '<a class="part-tile" href="#/parts/' + p.id + '">' +
        '<div class="part-tile-art"><span class="cat-tag">' + esc(BBL.CAT_LABEL[p.cat]) + '</span>' + Art.icon(p.id) + '</div>' +
        '<div class="part-tile-body"><h3>' + esc(p.name) + '</h3><div class="en">' + esc(p.en) + '</div><p>' + esc(p.short) + '</p>' +
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
      '<p class="lede">' + esc(p.lede) + '</p>' +
      '<div class="chips">' + p.tags.map((t) => '<span class="pill blue">' + esc(t) + '</span>').join('') + '</div></div></div></section>' +
      '<div class="container part-detail-layout"><div class="part-doc">' +
      '<section class="doc-card"><h2>' + svgIcon('info') + ' 这是什么</h2><p>' + esc(p.lede) + '</p><ul class="doc-list">' + p.usage.map((u) => '<li>' + esc(u) + '</li>').join('') + '</ul></section>' +
      '<section class="doc-card"><h2>' + svgIcon('pin') + ' 引脚与规格</h2><table class="pin-doc"><thead><tr><th>编号</th><th>名称</th><th>说明</th></tr></thead><tbody>' + p.pins.map((pin) => '<tr><td>' + esc(pin.n) + '</td><td>' + esc(pin.name) + '</td><td>' + esc(pin.desc) + '</td></tr>').join('') + '</tbody></table>' +
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
     Not found
     ------------------------------------------------------------------ */
  BBL.views.notFound = function (mount) {
    emptyPage(mount, '页面不存在', '地址可能写错了，回到教程目录继续。');
    mount.querySelector('.empty-state').insertAdjacentHTML('beforeend', '<div style="margin-top:10px"><a class="btn" href="#/parts">浏览元件百科</a></div>');
  };

})();
