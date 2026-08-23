/**
 * app.js — Arranque da aplicacao e ligacao dos botoes principais.
 *
 * Ordem: config -> model -> seed -> store -> utils/ui -> features -> app.
 */
(function (WF) {
  'use strict';

  var THEME_KEY = 'winzerfest.theme';

  function boot() {
    WF.form.init();
    WF.table.init();
    WF.summary.init();
    WF.toolbar.init();
    WF.printView.init();

    bindActions();
    initTheme();

    WF.store.subscribe(renderStatus);
    WF.store.init();

    document.getElementById('app-edition').textContent = WF.config.edition;
  }

  function bindActions() {
    document.getElementById('btn-new').addEventListener('click', function () { WF.form.open(); });

    // Menu de exportacao (abre/fecha com clique fora).
    var menu = document.getElementById('export-menu');
    var menuBtn = document.getElementById('btn-export');
    menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = menu.hasAttribute('hidden');
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (event) {
      if (!menu.hidden && !menu.contains(event.target)) {
        menu.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    menu.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-export]');
      if (!btn) return;
      menu.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');

      var list = WF.store.visible();
      switch (btn.getAttribute('data-export')) {
        case 'xlsx': WF.exportXlsx(list); WF.ui.toast('Ficheiro Excel gerado.', { type: 'success' }); break;
        case 'csv': WF.exportCsv(list); WF.ui.toast('Ficheiro CSV gerado.', { type: 'success' }); break;
        case 'pdf': WF.exportPdf(list); break;
        case 'json': WF.exportJson(); WF.ui.toast('Copia de seguranca guardada.', { type: 'success' }); break;
      }
    });

    document.getElementById('btn-print-view').addEventListener('click', function () {
      WF.printView.open(WF.store.visible());
    });

    var fileInput = document.getElementById('import-file');
    document.getElementById('btn-import').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) WF.importFile(fileInput.files[0]);
      fileInput.value = '';
    });

    document.getElementById('btn-reset').addEventListener('click', function () {
      WF.ui.confirm(
        'Repor catalogo inicial',
        'Todas as fichas actuais serao substituidas pelo catalogo base da Winzerfest. Esta accao nao pode ser anulada.',
        'Repor'
      ).then(function (ok) {
        if (!ok) return;
        WF.store.resetToSeed();
        WF.ui.toast('Catalogo inicial reposto.', { type: 'success' });
      });
    });

    document.getElementById('btn-theme').addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* sem persistencia */ }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', function (event) {
      if (event.key.toLowerCase() === 'n' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        WF.form.open();
      }
    });
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignorado */ }
    if (!saved) {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(saved);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('btn-theme');
    btn.textContent = theme === 'dark' ? '☀' : '☾';
    btn.title = theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  }

  function renderStatus() {
    var saved = WF.store.lastSavedAt();
    var status = document.getElementById('save-status');
    if (!WF.store.storageOk()) {
      status.textContent = 'Atencao: este browser nao esta a guardar os dados. Faca copia de seguranca (JSON).';
      status.className = 'save-status save-status--error';
      return;
    }
    status.textContent = saved ? 'Guardado automaticamente · ' + WF.utils.date(saved) : 'Guardado automaticamente';
    status.className = 'save-status';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window.WF = window.WF || {});
