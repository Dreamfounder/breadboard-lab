/* ============================================================
   Breadboard Lab · hash router & shell
   ============================================================ */
(function () {
  'use strict';
  const BBL = (window.BBL = window.BBL || {});
  const view = document.getElementById('view');
  let currentEditor = null;
  let currentRoute = '';

  function parseHash() {
    const raw = (location.hash || '#/editor').replace(/^#/, '');
    const qIndex = raw.indexOf('?');
    const path = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
    const query = qIndex >= 0 ? raw.slice(qIndex + 1) : '';
    const segments = path.split('/').filter(Boolean);
    return { segments: segments.length ? segments : ['editor'], params: new URLSearchParams(query) };
  }

  function setActiveNav(name) {
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === name));
  }

  function setTitle(title) {
    document.title = title ? title + ' · 电路工坊' : '电路工坊 · Breadboard Lab';
  }

  function clearEditor() {
    if (currentEditor) {
      try { currentEditor.destroy(); } catch (e) { console.warn(e); }
      currentEditor = null;
      window.__bbEditor = null;
    }
    if (BBL.ui) BBL.ui.closeModal();
    document.body.classList.remove('no-scroll');
  }

  function route() {
    const parsed = parseHash();
    const seg = parsed.segments;
    const params = parsed.params;
    const key = location.hash || '#/editor';
    if (key === currentRoute) return;
    currentRoute = key;
    clearEditor();
    view.innerHTML = '';
    document.body.removeAttribute('data-route');
    document.body.style.overflow = '';

    const first = seg[0];
    const isEditor = first === 'editor' || first === 'sandbox';
    if (isEditor) {
      document.body.dataset.route = first;
      document.body.style.overflow = 'hidden';
      setActiveNav(first);
      const template = params.get('template') || null;
      const task = params.get('task') || null;
      const labId = params.get('lab') || (task && BBL.LABS.getLevel(task) ? task : null) || (template && BBL.LABS.getLevel(template) ? template : null);
      const openCode = params.get('code') === '1';
      const mode = first === 'sandbox' ? 'sandbox' : 'editor';
      setActiveNav(labId ? 'labs' : first);
      const host = document.createElement('div');
      host.style.minHeight = '0';
      view.appendChild(host);
      currentEditor = new BBL.Editor(host, {
        mode: mode,
        template: template,
        taskId: task || template,
        labId: labId,
        openCode: openCode
      });
      window.__bbEditor = currentEditor;
      if (openCode) {
        const editorRef = currentEditor;
        setTimeout(function () { if (currentEditor === editorRef) editorRef.openCodePanel(); }, 180);
      }
      setTitle(currentEditor.scene.name || (mode === 'sandbox' ? '自由实验' : '电路工作台'));
      window.scrollTo(0, 0);
      return;
    }

    if (first === 'projects') {
      setActiveNav('projects');
      BBL.views.projects(view);
      setTitle('项目空间');
      window.scrollTo(0, 0);
      return;
    }

    if (first === 'labs') {
      setActiveNav('labs');
      if (seg[1]) {
        const level = BBL.LABS.getLevel(seg[1]);
        BBL.views.labLevel(view, seg[1]);
        const track = level ? BBL.LABS.getTrack(level.track) : null;
        setTitle(level ? track.label + (level.final ? ' · FINAL' : ' · Level ' + level.number) + ' · ' + level.title : '未找到关卡');
      } else {
        BBL.views.labs(view);
        setTitle('Lab 练习');
      }
      window.scrollTo(0, 0);
      return;
    }

    if (first === 'learn') {
      setActiveNav('learn');
      if (seg[1]) {
        BBL.views.lesson(view, seg[1]);
        const lesson = BBL.lessonById(seg[1]);
        setTitle(lesson ? '第 ' + lesson.number + ' 课 · ' + lesson.title : '未找到课程');
        window.scrollTo(0, 0);
      } else {
        BBL.views.learn(view);
        setTitle('教程');
        window.scrollTo(0, 0);
      }
      return;
    }

    if (first === 'parts') {
      setActiveNav('parts');
      if (seg[1]) {
        const part = BBL.partById(seg[1]);
        BBL.views.part(view, seg[1]);
        setTitle(part ? part.name : '未找到元件');
        window.scrollTo(0, 0);
      } else {
        BBL.views.parts(view);
        setTitle('元件百科');
        window.scrollTo(0, 0);
      }
      return;
    }

    BBL.views.notFound(view);
    setActiveNav('');
    setTitle('页面未找到');
    window.scrollTo(0, 0);
  }

  const helpBtn = document.getElementById('btn-help');
  if (helpBtn) helpBtn.addEventListener('click', () => BBL.ui.help());
  const aboutBtn = document.getElementById('btn-about');
  if (aboutBtn) aboutBtn.addEventListener('click', () => BBL.ui.about());

  window.addEventListener('hashchange', function () {
    // In-page anchors (e.g. #steps) should scroll, not re-route.
    const h = location.hash;
    if (h && !h.startsWith('#/')) {
      const target = document.getElementById(decodeURIComponent(h.slice(1)));
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    }
    route();
  });
  window.addEventListener('pagehide', function () {
    if (currentEditor) { try { currentEditor.autosaveNow(); } catch (e) { /* ignore */ } }
  });
  window.addEventListener('beforeunload', function () {
    if (currentEditor) { try { currentEditor.autosaveNow(); } catch (e) { /* ignore */ } }
  });

  if (!location.hash) {
    try { history.replaceState(null, '', '#/editor'); } catch (e) { location.hash = '#/editor'; }
  }
  route();

  BBL.app = {
    route: route,
    navigate: function (hash) { location.hash = hash; }
  };
})();
