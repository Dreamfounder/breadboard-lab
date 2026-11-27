/* ============================================================
   Local multi-save design store
   Everything stays in localStorage; no server, no upload.
   ============================================================ */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const BBL = (root.BBL = root.BBL || {});
  const KEY = 'bbl.designs.v1';
  const MAX = 80;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter((d) => d && d.id && d.scene).map((d) => Object.assign({ scope: 'sandbox' }, d));
    } catch (e) { return []; }
  }

  function write(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function list(scope) {
    const data = read();
    return data.filter((d) => !scope || d.scope === scope)
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  }

  function get(id) {
    return read().find((d) => d.id === id) || null;
  }

  function create(name, scene, mode, scope) {
    const data = read();
    if (data.length >= MAX) {
      const err = new Error('存档数量已达上限（' + MAX + ' 个），请先删除不用的存档。');
      err.code = 'LIMIT';
      throw err;
    }
    const now = Date.now();
    const record = {
      id: 'd_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 7),
      name: String(name || '未命名设计').trim().slice(0, 60) || '未命名设计',
      createdAt: now,
      updatedAt: now,
      mode: mode || 'editor',
      scope: scope || 'sandbox',
      scene: clone(scene),
      meta: {
        components: (scene.components || []).length,
        wires: (scene.wires || []).length
      }
    };
    data.push(record);
    write(data);
    return record;
  }

  function update(id, patch) {
    const data = read();
    const i = data.findIndex((d) => d.id === id);
    if (i < 0) return null;
    data[i] = Object.assign({}, data[i], patch || {}, { updatedAt: Date.now() });
    if (patch && patch.scene) {
      data[i].meta = {
        components: (patch.scene.components || []).length,
        wires: (patch.scene.wires || []).length
      };
    }
    write(data);
    return data[i];
  }

  function remove(id) {
    const data = read().filter((d) => d.id !== id);
    write(data);
  }

  function clear() { write([]); }

  BBL.Designs = { KEY, MAX, list, get, create, update, remove, clear, clone };
})(window);
