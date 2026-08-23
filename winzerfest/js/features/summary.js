/**
 * summary.js — Resumo automatico no final da tabela.
 * Total de produtos, fichas por cor, total de fichas e valor previsto.
 */
(function (WF) {
  'use strict';

  var summary = {};
  var host, cards;

  summary.init = function () {
    host = document.getElementById('summary');
    cards = document.getElementById('summary-colors');
    WF.store.subscribe(summary.render);
  };

  summary.render = function () {
    var all = WF.store.all();
    var visible = WF.store.visible();
    var view = WF.store.view();
    var filtering = view.color !== 'todas' || !!view.search;
    var data = WF.store.summary(filtering ? visible : all);

    host.querySelector('[data-total-products]').textContent = WF.utils.int(data.total.products);
    host.querySelector('[data-total-quantity]').textContent = WF.utils.int(data.total.quantity);
    host.querySelector('[data-total-value]').textContent = WF.utils.moneyLabel(data.total.value);
    host.querySelector('[data-summary-scope]').textContent = filtering
      ? 'Valores da selecao actual'
      : 'Valores de todas as fichas';

    cards.innerHTML = WF.config.colors.map(function (c) {
      var bucket = data.byColor[c.key];
      return '<article class="color-card" data-color="' + c.key + '">' +
        '<header class="color-card__head">' +
          '<span class="color-chip" style="--chip:' + c.hex + '"></span>' +
          '<h3>' + WF.utils.escapeHtml(c.label) + '</h3>' +
        '</header>' +
        '<p class="color-card__scope">' + WF.utils.escapeHtml(c.scope) + '</p>' +
        '<dl class="color-card__stats">' +
          '<div><dt>Produtos</dt><dd>' + WF.utils.int(bucket.products) + '</dd></div>' +
          '<div><dt>Fichas</dt><dd>' + WF.utils.int(bucket.quantity) + '</dd></div>' +
          '<div><dt>Valor</dt><dd>' + WF.utils.money(bucket.value) + '</dd></div>' +
        '</dl>' +
      '</article>';
    }).join('');
  };

  WF.summary = summary;
})(window.WF = window.WF || {});
