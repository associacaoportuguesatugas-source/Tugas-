/**
 * print.js — Lista final para a grafica + exportacao PDF.
 *
 * O PDF e gerado pela propria impressao do browser ("Guardar como PDF"),
 * o que mantem a app sem dependencias externas e com qualidade vectorial.
 */
(function (WF) {
  'use strict';

  var overlay, root;

  function ensureRefs() {
    overlay = overlay || document.getElementById('print-view');
    root = root || document.getElementById('print-root');
  }

  function sectionHtml(color, list) {
    var e = WF.utils.escapeHtml;
    var rows = list.map(function (f) {
      return '<tr>' +
        '<td>' + e(f.product) + '</td>' +
        '<td class="num">' + WF.utils.money(f.price) + '</td>' +
        '<td class="num">' + WF.utils.int(f.quantity) + '</td>' +
        '<td class="mono">' + e(f.design) + '</td>' +
        '<td class="mono">' + (e(f.code) || '—') + '</td>' +
        '<td>' + (e(f.notes) || '—') + '</td>' +
      '</tr>';
    }).join('');

    var qty = list.reduce(function (sum, f) { return sum + f.quantity; }, 0);
    var value = list.reduce(function (sum, f) { return sum + f.price * f.quantity; }, 0);

    return '<section class="print-section">' +
      '<h2 class="print-section__title">' +
        '<span class="print-swatch" style="background:' + color.hex + '"></span>' +
        'Ficha ' + e(color.label) +
        '<small>' + e(color.scope) + '</small>' +
      '</h2>' +
      '<table class="print-table">' +
        '<thead><tr>' +
          '<th>Produto</th><th class="num">Preco (CHF)</th><th class="num">Qtd. a imprimir</th>' +
          '<th>Design</th><th>Codigo</th><th>Observacoes</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr>' +
          '<th>' + list.length + ' produto(s)</th><th class="num">—</th>' +
          '<th class="num">' + WF.utils.int(qty) + '</th>' +
          '<th colspan="2">Valor previsto</th><th class="num">' + WF.utils.moneyLabel(value) + '</th>' +
        '</tr></tfoot>' +
      '</table>' +
    '</section>';
  }

  function render(list) {
    ensureRefs();
    var data = WF.store.summary(list);
    var e = WF.utils.escapeHtml;

    var sections = WF.config.colors.map(function (c) {
      var subset = list.filter(function (f) { return f.color === c.key; });
      if (!subset.length) return '';
      subset.sort(function (a, b) { return a.product.localeCompare(b.product, 'pt'); });
      return sectionHtml(c, subset);
    }).join('');

    var summaryRows = WF.config.colors.map(function (c) {
      var b = data.byColor[c.key];
      return '<tr>' +
        '<td><span class="print-swatch print-swatch--sm" style="background:' + c.hex + '"></span>' + e(c.label) + '</td>' +
        '<td class="num">' + WF.utils.int(b.products) + '</td>' +
        '<td class="num">' + WF.utils.int(b.quantity) + '</td>' +
        '<td class="num">' + WF.utils.money(b.value) + '</td>' +
      '</tr>';
    }).join('');

    root.innerHTML =
      '<header class="print-head">' +
        '<div>' +
          '<h1>Winzerfest — Lista de fichas para a grafica</h1>' +
          '<p class="print-meta">Edicao ' + e(WF.config.edition) + ' &middot; Gerado a ' + e(WF.utils.date(new Date().toISOString())) + '</p>' +
        '</div>' +
        '<div class="print-head__totals">' +
          '<p><strong>' + WF.utils.int(data.total.products) + '</strong> produtos</p>' +
          '<p><strong>' + WF.utils.int(data.total.quantity) + '</strong> fichas a imprimir</p>' +
          '<p><strong>' + WF.utils.moneyLabel(data.total.value) + '</strong> valor previsto</p>' +
        '</div>' +
      '</header>' +
      (sections || '<p class="print-empty">Nao ha fichas para listar.</p>') +
      '<section class="print-section print-section--summary">' +
        '<h2 class="print-section__title">Resumo por cor</h2>' +
        '<table class="print-table">' +
          '<thead><tr><th>Cor da ficha</th><th class="num">Produtos</th><th class="num">Fichas</th><th class="num">Valor previsto (CHF)</th></tr></thead>' +
          '<tbody>' + summaryRows + '</tbody>' +
          '<tfoot><tr><th>Total</th><th class="num">' + WF.utils.int(data.total.products) + '</th>' +
          '<th class="num">' + WF.utils.int(data.total.quantity) + '</th>' +
          '<th class="num">' + WF.utils.money(data.total.value) + '</th></tr></tfoot>' +
        '</table>' +
      '</section>' +
      '<footer class="print-foot">' +
        '<div class="print-sign"><span></span>Responsavel Winzerfest</div>' +
        '<div class="print-sign"><span></span>Grafica — recebido em</div>' +
      '</footer>';
  }

  /** Abre a pre-visualizacao da lista final para a grafica. */
  WF.printView = {
    open: function (list) {
      ensureRefs();
      render(list || WF.store.visible());
      overlay.hidden = false;
      document.body.classList.add('is-previewing');
      overlay.querySelector('[data-print-close]').focus();
    },
    close: function () {
      ensureRefs();
      overlay.hidden = true;
      document.body.classList.remove('is-previewing');
    },
    init: function () {
      ensureRefs();
      overlay.querySelector('[data-print-close]').addEventListener('click', WF.printView.close);
      overlay.querySelector('[data-print-now]').addEventListener('click', function () { window.print(); });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !overlay.hidden) WF.printView.close();
      });
    }
  };

  /** Exporta para PDF: prepara a lista e abre a caixa de impressao. */
  WF.exportPdf = function (list) {
    render(list || WF.store.visible());
    ensureRefs();
    overlay.hidden = false;
    document.body.classList.add('is-previewing');
    setTimeout(function () { window.print(); }, 120);
  };

})(window.WF = window.WF || {});
