/**
 * csv.js — Exportacao e importacao CSV.
 *
 * Separador ";" e BOM UTF-8: e o formato que o Excel em portugues/alemao
 * abre correctamente com dois cliques.
 */
(function (WF) {
  'use strict';

  var HEADERS = ['Cor', 'Produto', 'Preco (CHF)', 'Quantidade', 'Design', 'Codigo interno', 'Observacoes', 'Valor total (CHF)'];
  var SEP = ';';

  function quote(value) {
    var text = String(value == null ? '' : value);
    return '"' + text.replace(/"/g, '""') + '"';
  }

  WF.exportCsv = function (list) {
    list = list || WF.store.visible();
    var lines = [HEADERS.map(quote).join(SEP)];

    list.forEach(function (f) {
      lines.push([
        WF.config.color(f.color).label,
        f.product,
        f.price.toFixed(2),
        f.quantity,
        f.design,
        f.code,
        f.notes,
        (f.price * f.quantity).toFixed(2)
      ].map(quote).join(SEP));
    });

    var blob = new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    WF.utils.download(blob, WF.utils.exportName('csv'));
  };

  /** Le um CSV exportado por esta app (ou compativel) e devolve fichas. */
  WF.parseCsv = function (text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    text = String(text).replace(/^﻿/, '');

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === SEP || ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
      } else if (ch !== '\r') {
        field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }

    rows = rows.filter(function (r) { return r.join('').trim() !== ''; });
    if (!rows.length) return [];
    rows.shift(); // cabecalho

    var byLabel = {};
    WF.config.colors.forEach(function (c) { byLabel[WF.model.slugify(c.label)] = c.key; });

    return rows.map(function (r) {
      return WF.model.normalize({
        color: byLabel[WF.model.slugify(r[0])] || WF.config.colorKeys[0],
        product: r[1], price: r[2], quantity: r[3],
        design: r[4], code: r[5], notes: r[6]
      });
    }).filter(function (f) { return f.product; });
  };

})(window.WF = window.WF || {});
