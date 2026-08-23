/**
 * toolbar.js — Pesquisa, filtro por cor e ordenacao.
 */
(function (WF) {
  'use strict';

  var toolbar = {};
  var searchInput, chipsHost, sortSelect, dirButton;

  toolbar.init = function () {
    searchInput = document.getElementById('search');
    chipsHost = document.getElementById('color-filters');
    sortSelect = document.getElementById('sort-select');
    dirButton = document.getElementById('sort-dir');

    renderChips();

    searchInput.addEventListener('input', debounce(function () {
      WF.store.setView({ search: searchInput.value });
    }, 120));

    document.getElementById('search-clear').addEventListener('click', function () {
      searchInput.value = '';
      WF.store.setView({ search: '' });
      searchInput.focus();
    });

    chipsHost.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-color-filter]');
      if (!chip) return;
      WF.store.setView({ color: chip.getAttribute('data-color-filter') });
    });

    sortSelect.addEventListener('change', function () {
      WF.store.setView({ sort: sortSelect.value });
    });

    dirButton.addEventListener('click', function () {
      WF.store.setView({ dir: WF.store.view().dir === 'asc' ? 'desc' : 'asc' });
    });

    // Atalho: "/" foca a pesquisa.
    document.addEventListener('keydown', function (event) {
      if (event.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        event.preventDefault();
        searchInput.focus();
      }
    });

    WF.store.subscribe(toolbar.render);
  };

  function renderChips() {
    var chips = [{ key: 'todas', label: 'Todas', hex: 'transparent' }].concat(
      WF.config.colors.map(function (c) { return { key: c.key, label: c.label, hex: c.hex }; })
    );
    chipsHost.innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip" data-color-filter="' + c.key + '" style="--chip:' + c.hex + '">' +
        (c.key === 'todas' ? '' : '<span class="color-chip" style="--chip:' + c.hex + '"></span>') +
        '<span>' + WF.utils.escapeHtml(c.label) + '</span>' +
        '<span class="chip__count" data-chip-count="' + c.key + '"></span>' +
      '</button>';
    }).join('');
  }

  toolbar.render = function () {
    var view = WF.store.view();
    var all = WF.store.all();

    WF.utils.$$('[data-color-filter]', chipsHost).forEach(function (chip) {
      var key = chip.getAttribute('data-color-filter');
      var active = key === view.color;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      var count = key === 'todas'
        ? all.length
        : all.filter(function (f) { return f.color === key; }).length;
      chip.querySelector('[data-chip-count]').textContent = count;
    });

    if (sortSelect.value !== view.sort) sortSelect.value = view.sort;
    dirButton.setAttribute('data-dir', view.dir);
    dirButton.title = view.dir === 'asc' ? 'Ordem crescente' : 'Ordem decrescente';
    dirButton.textContent = view.dir === 'asc' ? '↑' : '↓';
    document.getElementById('search-clear').hidden = !view.search;
  };

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  WF.toolbar = toolbar;
})(window.WF = window.WF || {});
