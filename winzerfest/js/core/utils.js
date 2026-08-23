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
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    },

    /** Nome de ficheiro para exportacoes. */
    exportName: function (ext) {
      return 'winzerfest_fichas_' + utils.stamp() + '.' + ext;
    }
  };

  WF.utils = utils;
})(window.WF = window.WF || {});
