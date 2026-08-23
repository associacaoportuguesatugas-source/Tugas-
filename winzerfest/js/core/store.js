/**
 * store.js — Estado da aplicacao, persistencia e regras de leitura.
 *
 * Padrao simples de "single source of truth" + subscritores:
 * qualquer modulo altera os dados atraves do store e a interface
 * volta a desenhar-se sozinha. Facilita trocar o localStorage por uma
 * API/base de dados no futuro (basta reescrever load/save).
 */
(function (WF) {
  'use strict';

  var listeners = [];
  var state = {
    fichas: [],
    view: { search: '', color: 'todas', sort: 'color', dir: 'asc' },
    storageOk: true,
    lastDeleted: null
  };

  var store = {};

  // ---------------------------------------------------------------- persistencia
  function save() {
    try {
      localStorage.setItem(WF.config.storageKey, JSON.stringify(state.fichas));
      localStorage.setItem(WF.config.storageMetaKey, JSON.stringify({ savedAt: new Date().toISOString() }));
      state.storageOk = true;
    } catch (e) {
      state.storageOk = false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(WF.config.storageKey);
      if (raw === null) return null;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed.map(WF.model.normalize);
    } catch (e) {
      state.storageOk = false;
      return null;
    }
  }

  store.lastSavedAt = function () {
    try {
      var meta = JSON.parse(localStorage.getItem(WF.config.storageMetaKey) || '{}');
      return meta.savedAt || null;
    } catch (e) { return null; }
  };

  store.storageOk = function () { return state.storageOk; };

  // ---------------------------------------------------------------- ciclo de vida
  store.init = function () {
    var loaded = load();
    state.fichas = loaded && loaded.length ? loaded : WF.seed();
    if (!loaded) save();
    emit();
  };

  // ---------------------------------------------------------------- subscritores
  function emit() { listeners.forEach(function (fn) { fn(state); }); }
  store.subscribe = function (fn) { listeners.push(fn); return function () {
    listeners = listeners.filter(function (l) { return l !== fn; });
  }; };
  store.emit = emit;

  // ---------------------------------------------------------------- CRUD
  store.all = function () { return state.fichas.slice(); };
  store.get = function (id) {
    return state.fichas.filter(function (f) { return f.id === id; })[0] || null;
  };

  store.add = function (data) {
    var ficha = WF.model.normalize(data);
    state.fichas.push(ficha);
    save(); emit();
    return ficha;
  };

  store.update = function (id, patch) {
    var found = null;
    state.fichas = state.fichas.map(function (f) {
      if (f.id !== id) return f;
      var merged = WF.model.normalize(Object.assign({}, f, patch, { id: f.id, createdAt: f.createdAt }));
      merged.updatedAt = new Date().toISOString();
      found = merged;
      return merged;
    });
    save(); emit();
    return found;
  };

  store.remove = function (id) {
    var index = -1;
    state.fichas.forEach(function (f, i) { if (f.id === id) index = i; });
    if (index === -1) return null;
    var removed = state.fichas[index];
    state.lastDeleted = { ficha: removed, index: index };
    state.fichas.splice(index, 1);
    save(); emit();
    return removed;
  };

  store.undoRemove = function () {
    if (!state.lastDeleted) return null;
    var entry = state.lastDeleted;
    state.lastDeleted = null;
    state.fichas.splice(Math.min(entry.index, state.fichas.length), 0, entry.ficha);
    save(); emit();
    return entry.ficha;
  };

  store.replaceAll = function (list) {
    state.fichas = (list || []).map(WF.model.normalize);
    save(); emit();
  };

  store.resetToSeed = function () {
    state.fichas = WF.seed();
    save(); emit();
  };

  // ---------------------------------------------------------------- vista (pesquisa/filtro/ordenacao)
  store.view = function () { return Object.assign({}, state.view); };
  store.setView = function (patch) {
    Object.assign(state.view, patch || {});
    emit();
  };

  function matches(ficha, term) {
    if (!term) return true;
    var haystack = [ficha.product, ficha.design, ficha.code, ficha.notes, WF.config.color(ficha.color).label]
      .join(' ');
    return WF.model.slugify(haystack).indexOf(WF.model.slugify(term)) !== -1;
  }

  /** Lista ja filtrada, pesquisada e ordenada — o que a tabela mostra. */
  store.visible = function () {
    var v = state.view;
    var list = state.fichas.filter(function (f) {
      if (v.color !== 'todas' && f.color !== v.color) return false;
      return matches(f, v.search);
    });

    var dir = v.dir === 'desc' ? -1 : 1;
    var order = WF.config.colorKeys;
    list.sort(function (a, b) {
      var r = 0;
      switch (v.sort) {
        case 'product': r = a.product.localeCompare(b.product, 'pt'); break;
        case 'price': r = a.price - b.price; break;
        case 'quantity': r = a.quantity - b.quantity; break;
        case 'design': r = a.design.localeCompare(b.design, 'pt'); break;
        case 'total': r = (a.price * a.quantity) - (b.price * b.quantity); break;
        default: r = order.indexOf(a.color) - order.indexOf(b.color);
      }
      if (r === 0) r = order.indexOf(a.color) - order.indexOf(b.color);
      if (r === 0) r = a.product.localeCompare(b.product, 'pt');
      return r * dir;
    });
    return list;
  };

  /** Resumo automatico: produtos, fichas por cor, total de fichas e valor previsto. */
  store.summary = function (list) {
    list = list || state.fichas;
    var byColor = {};
    WF.config.colorKeys.forEach(function (key) {
      byColor[key] = { products: 0, quantity: 0, value: 0 };
    });
    var total = { products: list.length, quantity: 0, value: 0 };

    list.forEach(function (f) {
      var bucket = byColor[f.color];
      var value = f.price * f.quantity;
      bucket.products += 1;
      bucket.quantity += f.quantity;
      bucket.value += value;
      total.quantity += f.quantity;
      total.value += value;
    });

    return { byColor: byColor, total: total };
  };

  WF.store = store;
})(window.WF = window.WF || {});
