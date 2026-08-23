/**
 * utils.js — Formatacao e pequenos ajudantes de DOM.
 */
(function (WF) {
  'use strict';

  var nf = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nfInt = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });

  var utils = {
    /** 12.5 -> "12.50" */
    money: function (n) { return nf.format(Number(n) || 0); },
    /** 12.5 -> "CHF 12.50" */
    moneyLabel: function (n) { return WF.config.currency + ' ' + nf.format(Number(n) || 0); },
    int: function (n) { return nfInt.format(Number(n) || 0); },

    date: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('pt-PT') + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    },

    /** Carimbo para nomes de ficheiro: 2026-08-23_1432 */
    stamp: function () {
      var d = new Date();
      function p(n) { return (n < 10 ? '0' : '') + n; }
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes());
    },

    escapeHtml: function (text) {
      return String(text == null ? '' : text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    $: function (selector, root) { return (root || document).querySelector(selector); },
    $$: function (selector, root) {
      return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    },

    /** Descarrega um Blob com o nome indicado. */
    download: function (blob, filename) {
      // Quando a app corre dentro de uma pagina publicada (link partilhado),
      // o browser bloqueia downloads directos: pede-se ao anfitriao.
      if (window.claude && typeof window.claude.use === 'function') {
        utils.saveViaHost(blob, filename);
        return;
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    },

    /** Guarda o ficheiro atraves do anfitriao (versao publicada online). */
    saveViaHost: function (blob, filename) {
      var ext = (filename.split('.').pop() || '').toUpperCase();
      Promise.resolve(window.claude.use('downloads')).then(function (downloads) {
        if (!downloads) return Promise.reject({ code: 'unavailable' });
        return blob.arrayBuffer().then(function (buffer) {
          return downloads.save({ filename: filename, data: buffer });
        });
      }).catch(function (error) {
        var code = error && error.code;
        if (code === 'declined') return;
        if (code === 'rejected_extension' || code === 'extension_not_enabled') {
          WF.ui.toast('Neste link nao e possivel guardar ficheiros ' + ext +
            '. Abra a aplicacao no computador (winzerfest/index.html) para exportar em ' + ext + '.', { type: 'error' });
        } else {
          WF.ui.toast('Nao foi possivel guardar o ficheiro neste ambiente. Use a aplicacao no computador.', { type: 'error' });
        }
      });
    },

    /** Nome de ficheiro para exportacoes. */
    exportName: function (ext) {
      return 'winzerfest_fichas_' + utils.stamp() + '.' + ext;
    }
  };

  WF.utils = utils;
})(window.WF = window.WF || {});
