/**
 * ui.js — Avisos (toasts) e caixa de confirmacao.
 * Substitui alert()/confirm() do browser por elementos com o estilo da app.
 */
(function (WF) {
  'use strict';

  var ui = {};
  var timer = null;

  /**
   * Mostra um aviso no canto inferior.
   * @param {string} message
   * @param {{type?:'info'|'success'|'error', action?:{label:string, onClick:Function}}} [options]
   */
  ui.toast = function (message, options) {
    options = options || {};
    var host = document.getElementById('toast');
    if (!host) return;

    host.className = 'toast toast--' + (options.type || 'info') + ' is-visible';
    host.innerHTML = '<span class="toast__text"></span>';
    host.querySelector('.toast__text').textContent = message;

    if (options.action) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast__action';
      btn.textContent = options.action.label;
      btn.addEventListener('click', function () {
        host.classList.remove('is-visible');
        options.action.onClick();
      });
      host.appendChild(btn);
    }

    clearTimeout(timer);
    timer = setTimeout(function () { host.classList.remove('is-visible'); }, options.action ? 9000 : 4000);
  };

  /**
   * Confirmacao modal. Devolve uma Promise<boolean>.
   */
  ui.confirm = function (title, message, confirmLabel) {
    return new Promise(function (resolve) {
      var dialog = document.getElementById('confirm-dialog');
      dialog.querySelector('[data-confirm-title]').textContent = title;
      dialog.querySelector('[data-confirm-message]').textContent = message;
      var ok = dialog.querySelector('[data-confirm-ok]');
      ok.textContent = confirmLabel || 'Confirmar';

      function close(result) {
        dialog.removeEventListener('close', onClose);
        ok.removeEventListener('click', onOk);
        dialog.close();
        resolve(result);
      }
      function onOk() { close(true); }
      function onClose() { resolve(false); }

      ok.addEventListener('click', onOk);
      dialog.addEventListener('close', onClose, { once: true });
      dialog.showModal();
    });
  };

  WF.ui = ui;
})(window.WF = window.WF || {});
